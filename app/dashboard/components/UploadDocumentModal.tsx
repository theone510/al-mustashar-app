'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function UploadDocumentModal({
  isOpen,
  onClose,
  clientId,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  function getFileIcon(name: string) {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return { color: 'text-red-400', bg: 'bg-red-500/15', label: 'PDF' };
    if (ext === 'doc' || ext === 'docx') return { color: 'text-blue-400', bg: 'bg-blue-500/15', label: 'DOCX' };
    return { color: 'text-slate-400', bg: 'bg-slate-500/15', label: ext?.toUpperCase() || 'FILE' };
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${clientId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('client_documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      alert('حدث خطأ أثناء رفع الملف، تأكد من صلاحيات الـ Bucket وأنه Public.');
      setIsUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from('client_files').insert([
      {
        client_id: clientId,
        file_name: file.name,
        storage_path: filePath
      }
    ]);

    setIsUploading(false);

    if (dbError) {
      console.error('DB Insert Error:', dbError);
      alert('تم الرفع للـ Storage ولكن حدث خطأ في تسجيل الملف بقاعدة البيانات.');
    } else {
      setFile(null);
      onSuccess();
      onClose();
      router.refresh();
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">رفع مستند جديد</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUpload} className="p-5 space-y-5">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all bg-white/[0.02] ${
              isDragging
                ? 'border-amber-500/50 bg-amber-500/5'
                : file
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-white/10 hover:border-amber-500/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required
            />
            <div className="flex flex-col items-center gap-3">
              {file ? (
                <>
                  {/* File Preview */}
                  <div className={`p-3.5 rounded-xl ${getFileIcon(file.name).bg}`}>
                    <svg className={`w-8 h-8 ${getFileIcon(file.name).color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-slate-200">{file.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getFileIcon(file.name).bg} ${getFileIcon(file.name).color}`}>
                    {getFileIcon(file.name).label} • {(file.size / 1024).toFixed(0)} KB
                  </span>
                </>
              ) : (
                <>
                  <div className={`p-3.5 rounded-xl transition-colors ${isDragging ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-400'}`}>
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-slate-200">
                    {isDragging ? 'أفلت الملف هنا' : 'اختر ملفاً أو اسحبه هنا'}
                  </p>
                  <p className="text-xs text-slate-500">يدعم صيغ PDF, DOCX</p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all font-medium text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 disabled:opacity-50 transition-all font-bold text-sm shadow-lg shadow-amber-500/20"
            >
              {isUploading ? 'جاري الرفع...' : 'رفع المستند'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
