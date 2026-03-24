import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرسال ملف' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('client_documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      return NextResponse.json({ error: `فشل رفع الملف: ${uploadError.message}` }, { status: 500 });
    }

    // Insert record into client_files table
    const { data: dbData, error: dbError } = await supabase
      .from('client_files')
      .insert([{
        file_name: file.name,
        storage_path: filePath,
        client_id: null,
      }])
      .select()
      .single();

    if (dbError) {
      console.error('DB Insert Error:', dbError);
      // Clean up uploaded file if DB insert fails
      await supabase.storage.from('client_documents').remove([filePath]);
      return NextResponse.json({ error: `فشل تسجيل الملف: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, file: dbData, path: filePath });
  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم أثناء رفع الملف' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id, storagePath } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete from storage
    if (storagePath) {
      await supabase.storage.from('client_documents').remove([storagePath]);
    }

    // Delete from DB
    const { error } = await supabase.from('client_files').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json({ error: 'خطأ في الحذف' }, { status: 500 });
  }
}
