import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { addAudio, listAudios } from '@/lib/audioRepository';
import { newAudioSchema } from '@/lib/validation';

const SOUNDS_DIR = path.join(process.cwd(), 'public', 'sons');

/**
 * GET é público: os usuários do site (sem login) precisam conseguir
 * listar e reproduzir os áudios cadastrados pelo admin.
 */
export async function GET() {
  const audios = listAudios();
  return NextResponse.json({ audios });
}

/**
 * POST é protegido pelo middleware (somente admin). Aceita multipart/form-data
 * com um arquivo de áudio + título, salva o arquivo em public/sons e
 * registra os metadados em data/audios.json.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: 'Envie os dados como multipart/form-data.' }, { status: 400 });
  }

  const title = String(formData.get('title') ?? '');
  const emoji = String(formData.get('emoji') ?? '');
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Selecione um arquivo de áudio.' }, { status: 400 });
  }

  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
  if (file.type && !allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Formato de áudio não suportado. Use MP3, WAV ou OGG.' },
      { status: 400 }
    );
  }

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  const fileUrl = `/sons/${safeName}`;

  const parsed = newAudioSchema.safeParse({ title, fileUrl, emoji: emoji || undefined });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 400 }
    );
  }

  if (!fs.existsSync(SOUNDS_DIR)) {
    fs.mkdirSync(SOUNDS_DIR, { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(SOUNDS_DIR, safeName), buffer);

  const audio = addAudio(parsed.data);
  return NextResponse.json({ ok: true, audio }, { status: 201 });
}
