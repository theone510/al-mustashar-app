'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

type ClientFile = {
  id: string;
  file_name: string;
  storage_path: string;
  created_at: string;
  client_id: string;
  clients?: { name: string } | null;
};

type ViewMode = 'grid' | 'list';

function getFileInfo(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/20', label: 'PDF', iconPath: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' };
  if (ext === 'doc' || ext === 'docx') return { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20', label: ext === 'doc' ? 'DOC' : 'DOCX', iconPath: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' };
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp') return { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20', label: ext.toUpperCase(), iconPath: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' };
  if (ext === 'xls' || ext === 'xlsx') return { color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/20', label: 'EXCEL', iconPath: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7' };
  return { color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/20', label: ext?.toUpperCase() || 'ملف', iconPath: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' };
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function FilesPage() {
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('client_files')
      .select('*, clients(name)')
      .order('created_at', { ascending: false });
    
    if (!error && data) setFiles(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const deleteFile = async (file: ClientFile) => {
    if (!confirm(`هل أنت متأكد من حذف "${file.file_name}"؟`)) return;

    await supabase.storage.from('client_documents').remove([file.storage_path]);
    await supabase.from('client_files').delete().eq('id', file.id);
    setFiles(prev => prev.filter(f => f.id !== file.id));
    setSelectedFiles(prev => { const n = new Set(prev); n.delete(file.id); return n; });
  };

  const deleteSelected = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedFiles.size} ملف(ملفات)؟`)) return;
    
    const toDelete = files.filter(f => selectedFiles.has(f.id));
    await supabase.storage.from('client_documents').remove(toDelete.map(f => f.storage_path));
    
    for (const f of toDelete) {
      await supabase.from('client_files').delete().eq('id', f.id);
    }
    
    setFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
    setSelectedFiles(new Set());
  };

  const downloadFile = async (file: ClientFile) => {
    const { data } = supabase.storage.from('client_documents').getPublicUrl(file.storage_path);
    if (data?.publicUrl) window.open(data.publicUrl, '_blank');
  };

  const handleUploadFiles = async (fileList: FileList) => {
    setIsUploading(true);
    const total = fileList.length;
    
    for (let i = 0; i < total; i++) {
      const file = fileList[i];
      setUploadProgress(`جاري رفع ${i + 1}/${total}: ${file.name}`);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `general/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('client_documents').upload(filePath, file);
      if (uploadError) { console.error('Upload Error:', uploadError); continue; }
      
      await supabase.from('client_files').insert([{
        client_id: null,
        file_name: file.name,
        storage_path: filePath
      }]);
    }

    setIsUploading(false);
    setUploadProgress(null);
    fetchFiles();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleUploadFiles(e.dataTransfer.files);
  };

  const filtered = files.filter(f => f.file_name.toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.file_name.localeCompare(b.file_name, 'ar');
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const toggleSelect = (id: string) => {
    setSelectedFiles(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selectedFiles.size === sorted.length) setSelectedFiles(new Set());
    else setSelectedFiles(new Set(sorted.map(f => f.id)));
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">إدارة الملفات</h2>
          <p className="text-slate-400 text-sm">عرض وإدارة جميع المستندات والوثائق القانونية المرفوعة</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm cursor-pointer hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            رفع ملفات
            <input type="file" multiple className="hidden" onChange={(e) => e.target.files && handleUploadFiles(e.target.files)} />
          </label>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="glass-card rounded-xl p-4 flex items-center gap-4 animate-fade-in border-amber-500/20">
          <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin shrink-0" />
          <span className="text-sm text-amber-400 font-medium">{uploadProgress}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragging ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-amber-500/25 bg-white/[0.01]'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          const inp = document.createElement('input');
          inp.type = 'file';
          inp.multiple = true;
          inp.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) handleUploadFiles(target.files);
          };
          inp.click();
        }}
      >
        <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors ${isDragging ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-500'}`}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-300 mb-1">{isDragging ? 'أفلت الملفات هنا' : 'اسحب الملفات وأفلتها هنا أو اضغط للاختيار'}</p>
        <p className="text-xs text-slate-600">PDF, DOCX, XLS, صور وملفات أخرى</p>
      </div>

      {/* Toolbar: Search, Sort, View Mode, Batch Actions */}
      <div className="glass-card rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن ملف..."
            className="w-full pr-10 pl-4 py-2.5 bg-white/[0.03] border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/30 transition-all"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
          className="bg-white/[0.03] border border-white/5 text-sm text-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500/30 cursor-pointer"
        >
          <option value="date">الأحدث</option>
          <option value="name">الاسم</option>
        </select>

        {/* View Toggle */}
        <div className="flex bg-white/[0.03] rounded-lg border border-white/5 p-0.5">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        {/* Batch Delete */}
        {selectedFiles.size > 0 && (
          <button onClick={deleteSelected} className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors border border-red-500/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            حذف {selectedFiles.size} ملف
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الملفات', value: files.length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'PDF', value: files.filter(f => f.file_name.endsWith('.pdf')).length, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'DOCX', value: files.filter(f => f.file_name.endsWith('.docx') || f.file_name.endsWith('.doc')).length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'أخرى', value: files.filter(f => !f.file_name.endsWith('.pdf') && !f.file_name.endsWith('.docx') && !f.file_name.endsWith('.doc')).length, color: 'text-slate-400', bg: 'bg-slate-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* File Content */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">جاري تحميل الملفات...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H7a2 2 0 00-2 2v12z" />
            </svg>
          </div>
          <p className="text-slate-300 font-semibold text-lg mb-2">{search ? 'لا نتائج مطابقة' : 'لا توجد ملفات بعد'}</p>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">{search ? 'جرب كلمات بحث مختلفة' : 'ارفع أول ملف لك باستخدام زر "رفع ملفات" أعلاه أو اسحب الملفات إلى منطقة الرفع'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Select All header */}
          <div className="col-span-full flex items-center gap-3 mb-1">
            <button onClick={selectAll} className="text-xs text-slate-500 hover:text-amber-400 transition-colors">
              {selectedFiles.size === sorted.length ? 'إلغاء التحديد' : `تحديد الكل (${sorted.length})`}
            </button>
          </div>
          
          {sorted.map(file => {
            const info = getFileInfo(file.file_name);
            const isSelected = selectedFiles.has(file.id);
            return (
              <div
                key={file.id}
                className={`group glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-amber-500/20 transition-all relative ${isSelected ? 'ring-2 ring-amber-500/50 border-amber-500/30' : ''}`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(file.id)}
                  className={`absolute top-3 left-3 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                    isSelected ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-white/10 opacity-0 group-hover:opacity-100 hover:border-amber-500/50'
                  }`}
                >
                  {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </button>

                {/* File Icon */}
                <div className={`w-14 h-14 rounded-xl ${info.bg} flex items-center justify-center mx-auto`}>
                  <svg className={`w-7 h-7 ${info.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={info.iconPath} />
                  </svg>
                </div>

                {/* File Info */}
                <div className="text-center space-y-1.5 flex-1">
                  <p className="text-sm font-semibold text-slate-200 truncate" title={file.file_name}>{file.file_name}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${info.bg} ${info.color}`}>{info.label}</span>
                    <span className="text-[10px] text-slate-500">{formatDate(file.created_at)}</span>
                  </div>
                  {file.clients?.name && (
                    <p className="text-[11px] text-slate-500">📁 {file.clients.name}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => downloadFile(file)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    تحميل
                  </button>
                  <button onClick={() => deleteFile(file)} className="flex items-center justify-center p-2 rounded-lg bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── List View ── */
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-sm">
                <th className="p-4 font-medium w-8">
                  <button onClick={selectAll} className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                    selectedFiles.size === sorted.length && sorted.length > 0 ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-white/10 hover:border-amber-500/50'
                  }`}>
                    {selectedFiles.size === sorted.length && sorted.length > 0 && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </button>
                </th>
                <th className="p-4 font-medium">اسم الملف</th>
                <th className="p-4 font-medium hidden sm:table-cell">النوع</th>
                <th className="p-4 font-medium hidden md:table-cell">مرتبط بـ</th>
                <th className="p-4 font-medium hidden sm:table-cell">التاريخ</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {sorted.map(file => {
                const info = getFileInfo(file.file_name);
                const isSelected = selectedFiles.has(file.id);
                return (
                  <tr key={file.id} className={`hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-amber-500/5' : ''}`}>
                    <td className="p-4">
                      <button onClick={() => toggleSelect(file.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-white/10 hover:border-amber-500/50'
                      }`}>
                        {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${info.bg} flex items-center justify-center shrink-0`}>
                          <svg className={`w-4 h-4 ${info.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={info.iconPath} /></svg>
                        </div>
                        <span className="text-sm font-medium text-slate-200 truncate max-w-[200px]" title={file.file_name}>{file.file_name}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${info.bg} ${info.color}`}>{info.label}</span>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-slate-500">{file.clients?.name || '—'}</td>
                    <td className="p-4 hidden sm:table-cell text-sm text-slate-500">{formatDate(file.created_at)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => downloadFile(file)} className="p-2 text-slate-500 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors" title="تحميل">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                        <button onClick={() => deleteFile(file)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors" title="حذف">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
