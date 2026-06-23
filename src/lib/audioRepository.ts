import { v4 as uuid } from 'uuid';
import { readJsonFile, writeJsonFile } from './jsonStore';

export interface AudioTrack {
  id: string;
  title: string;
  /** Caminho público do arquivo, ex: "/sons/floresta.mp3" */
  fileUrl: string;
  emoji?: string;
  createdAt: string;
}

const FILE_NAME = 'audios.json';

function readAll(): AudioTrack[] {
  return readJsonFile<AudioTrack[]>(FILE_NAME, []);
}

function writeAll(audios: AudioTrack[]): void {
  writeJsonFile(FILE_NAME, audios);
}

export function listAudios(): AudioTrack[] {
  return readAll().sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export interface NewAudioInput {
  title: string;
  fileUrl: string;
  emoji?: string;
}

export function addAudio(input: NewAudioInput): AudioTrack {
  const audios = readAll();
  const audio: AudioTrack = {
    id: uuid(),
    title: input.title.trim(),
    fileUrl: input.fileUrl,
    emoji: input.emoji,
    createdAt: new Date().toISOString()
  };
  audios.push(audio);
  writeAll(audios);
  return audio;
}

export function removeAudio(id: string): boolean {
  const audios = readAll();
  const next = audios.filter((a) => a.id !== id);
  const removed = next.length !== audios.length;
  if (removed) writeAll(next);
  return removed;
}
