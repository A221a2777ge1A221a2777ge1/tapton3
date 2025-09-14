import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

export const runtime = 'nodejs';

const DEFAULT_TTL_SECONDS = Number(process.env.AI_CACHE_TTL_SECONDS || '') || 3600;

type IdeasPayload = {
  prompt: string;
  userProfile?: Record<string, unknown>;
  userId?: string | null;
};

async function callModel(prompt: string, userProfile?: Record<string, unknown>) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set');
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You generate concise, high-quality investment ideas. Return JSON.' },
        { role: 'user', content: JSON.stringify({ prompt, userProfile }) },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI provider error: ${res.status} ${text}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? JSON.stringify({ ideas: [], note: 'no content' });
  return { content, raw: data };
}

function hashKey(input: unknown) {
  const s = typeof input === 'string' ? input : JSON.stringify(input);
  return crypto.createHash('sha256').update(s).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as IdeasPayload;
    if (!body?.prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const cacheKey = hashKey({ prompt: body.prompt, userProfile: body.userProfile || null, userId: body.userId || null });
    const cacheRef = db.collection('ai_cache').doc(cacheKey);
    const snap = await cacheRef.get();

    const now = Date.now();
    if (snap.exists) {
      const data = snap.data() || {};
      const expiresAtMs = (data.expiresAt?.toMillis?.() as number | undefined) || Number(data.expiresAtMs || 0);
      if (expiresAtMs && expiresAtMs > now) {
        return NextResponse.json({ cached: true, key: cacheKey, result: data.result }, { status: 200 });
      }
    }

    const ai = await callModel(body.prompt, body.userProfile);
    const ttlSeconds = DEFAULT_TTL_SECONDS;
    const expiresAtMs = now + ttlSeconds * 1000;

    await cacheRef.set(
      {
        key: cacheKey,
        result: ai.content,
        raw: ai.raw,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromMillis(expiresAtMs),
        expiresAtMs,
      },
      { merge: true }
    );

    return NextResponse.json({ cached: false, key: cacheKey, result: ai.content }, { status: 200 });
  } catch (error: any) {
    console.error('investment-ideas error', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

