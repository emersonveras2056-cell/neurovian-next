import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { listAudios, removeAudio } from '@/lib/audioRepository';

interface RouteParams {
  params: { id: string };
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const audio = listAudios().find((a) => a.id === params.id);
  const removed = removeAudio(params.id);

  if (!removed) {
    return NextResponse.json({ error: 'Áudio não encontrado.' }, { status: 404 });
  }

  if (audio) {
    const filePath = path.join(process.cwd(), 'public', audio.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  return NextResponse.json({ ok: true });
}
