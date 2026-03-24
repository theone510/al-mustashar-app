'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import UploadDocumentModal from '../../components/UploadDocumentModal';

type Client = {
  id: string;
  name: string;
  case_type: string;
  phone: string;
  created_at: string;
};

type ClientFile = {
  id: string;
  file_name: string;
  storage_path: string;
  created_at: string;
};

function getFileIcon(name: string): { color: string; bg: string; label: string } {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { color: 'text-red-400', bg: 'bg-red-500/15', label: 'PDF' };
  if (ext === 'doc' || ext === 'docx') return { color: 'text-blue-400', bg: 'bg-blue-500/15', label: 'DOC' };
  return { color: 'text-slate-400', bg: 'bg-slate-500/15', label: ext?.toUpperCase() || 'FILE' };
}

export default function ClientDetailsPage({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<Client | null>(null);
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  async function fetchClientData() {
    setIsLoading(true);

    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', params.id)
      .single();

    if (clientData) setClient(clientData);

    const { data: filesData } = await supabase
      .from('client_files')
      .select('*')
      .eq('client_id', params.id)
      .order('created_at', { ascending: false });

    if (filesData) setFiles(filesData);

    setIsLoading(false);
  }

  useEffect(() => {
    fetchClientData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20 text-slate-400">
        لم يتم العثور على بيانات الموكل.
      </div>
    );
  }

  const infoItems = [
    {
      label: 'رقم الهاتف',
      value: client.phone || 'غير مسجل',
      icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
      dir: 'ltr' as const,
    },
    {
      label: 'نوع القضية',
      value: client.case_type,
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'تاريخ الإضافة',
      value: new Date(client.created_at).toLocaleDateString('ar-IQ'),
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
  ];

  return (
    <div className="space-y-8 animate-slide-up">

      {/* Header & Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients" className="p-2.5 rounded-xl glass-card text-slate-400 hover:text-white transition-all">
          <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-amber-500/20">
            {client.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{client.name}</h2>
            <p className="text-amber-500/80 font-medium text-sm">{client.case_type}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Info Sidebar */}
        <div className="lg:col-span-1 space-y-5">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-5">معلومات الموكل</h3>
            <div className="space-y-4">
              {infoItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="p-2 rounded-lg bg-white/5 text-slate-400 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-500 font-medium mb-0.5">{item.label}</p>
                    <p className="text-sm text-slate-200 font-medium truncate" dir={item.dir}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Chat Button */}
          <Link
            href={`/dashboard/clients/${client.id}/chat`}
            className="group flex items-center justify-center gap-2.5 w-full py-3.5 glass-card rounded-xl text-sm font-bold text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/25 transition-all"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            بدء محادثة ذكية بالملفات
          </Link>
        </div>

        {/* Files Area */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card rounded-2xl p-5 min-h-[500px] flex flex-col">

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">المستندات المرفوعة</h3>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all font-bold text-sm border border-amber-500/15"
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                رفع مستند جديد
              </button>
            </div>

            {files.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-5">
                  <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-base font-bold text-slate-300 mb-1">لا توجد مستندات</p>
                <p className="text-sm text-slate-500 max-w-xs">قم برفع أوراق القضية ليقوم الذكاء الاصطناعي بقراءتها وفهمها والإجابة عن أسئلتك.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
                {files.map(file => {
                  const fileStyle = getFileIcon(file.file_name);
                  return (
                    <div key={file.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-3 hover:border-amber-500/20 transition-all group">
                      <div className={`p-2.5 ${fileStyle.bg} ${fileStyle.color} rounded-lg shrink-0`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors" title={file.file_name}>
                          {file.file_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${fileStyle.bg} ${fileStyle.color}`}>{fileStyle.label}</span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(file.created_at).toLocaleDateString('ar-IQ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        clientId={client.id}
        onSuccess={fetchClientData}
      />
    </div>
  );
}
