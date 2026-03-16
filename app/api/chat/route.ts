import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// الاتصال بقاعدة البيانات
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// الاتصال بـ Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. تحويل سؤال المحامي إلى متجهات (يجب استخدام نفس الموديل الذي استخدمناه في البايثون!)
    const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const embeddingResult = await embeddingModel.embedContent(message);
    const queryEmbedding = embeddingResult.embedding.values;

    // 2. البحث في Supabase (المطابقة مع 3072 بُعد)
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // نسبة التطابق المطلوبة
      match_count: 5 // سحب أفضل 5 نتائج قانونية
    });

    if (error) throw error;

    // 3. تجميع السوابق والمواد
    let contextText = '';
    if (documents && documents.length > 0) {
      contextText = documents.map((doc: any) => doc.content).join('\n\n---\n\n');
    }

    // 4. تعليمات الذكاء الاصطناعي الصارمة
    const systemInstruction = `أنت مساعد قانوني ذكي ومحترف متخصص في القانون العراقي (اسمك: تطبيق المستشار). 
مهمتك إجابة استشارات المحامين بناءً على النصوص القانونية وقرارات محكمة التمييز العراقية المرفقة لك في قسم "السياق" فقط.

قواعد الإجابة الصارمة:
1. الأسئلة النظرية: إذا سأل المستخدم عن قاعدة قانونية عامة، اذكر رقم المادة القانونية ونصها واشرحها بوضوح.
2. القضايا والوقائع: إذا طرح المستخدم مسألة مشابهة لقرار تمييزي موجود في السياق:
   - اذكر المادة القانونية.
   - استشهد بالقرار التمييزي (رقمه، تاريخه، المحكمة).
   - وضّح كيف طُبقت المادة على الواقعة.
3. الأمانة العلمية: لا تخترع أي قرارات أو مواد من خارج السياق المرفق أبداً!

السياق المتاح لك:
${contextText}`;

    // 5. استخدام أحدث موديل كما طلبت (Gemini 3 Flash Preview)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview', 
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(message);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الاستشارة.' }, { status: 500 });
  }
}
