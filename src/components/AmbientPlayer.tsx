'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioTrack {
  id: string;
  title: string;
  fileUrl: string;
  emoji?: string;
}

/**
 * Player de áudios ambiente. Os áudios disponíveis são os que o admin
 * cadastrou pelo painel — o usuário apenas escolhe e ouve, sem login.
 */
export default function AmbientPlayer() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/audios')
      .then((res) => res.json())
      .then((data) => {
        setTracks(data.audios ?? []);
        if (data.audios?.length) setSelectedId(data.audios[0].id);
      })
      .catch(() => setTracks([]));
  }, []);

  function clearFade() {
    if (fadeInterval.current) {
      clearInterval(fadeInterval.current);
      fadeInterval.current = null;
    }
  }

  function fadeTo(target: number, onDone?: () => void) {
    const audio = audioRef.current;
    if (!audio) return;
    clearFade();

    fadeInterval.current = setInterval(() => {
      const step = 0.02;
      if (Math.abs(audio.volume - target) < step) {
        audio.volume = target;
        clearFade();
        onDone?.();
        return;
      }
      audio.volume += audio.volume < target ? step : -step;
    }, 50);
  }

  function handlePlay() {
    const track = tracks.find((t) => t.id === selectedId);
    const audio = audioRef.current;
    if (!track || !audio) return;

    if (audio.src.endsWith(track.fileUrl) && !audio.paused) return;

    audio.src = track.fileUrl;
    audio.volume = 0;
    audio.play().catch(() => undefined);
    setIsPlaying(true);
    fadeTo(volume);
  }

  function handlePause() {
    fadeTo(0, () => audioRef.current?.pause());
    setIsPlaying(false);
  }

  function handleVolumeChange(value: number) {
    setVolume(value);
    if (audioRef.current && isPlaying) audioRef.current.volume = value;
  }

  useEffect(() => clearFade, []);

  if (tracks.length === 0) {
    return (
      <p className="ambient-player-empty">
        Nenhum áudio disponível no momento. Volte em breve.
      </p>
    );
  }

  return (
    <div className="ambient-player">
      <label htmlFor="ambient-select">Ambiente sonoro</label>
      <select
        id="ambient-select"
        value={selectedId}
        onChange={(event) => {
          setSelectedId(event.target.value);
          if (isPlaying) {
            // Troca suave entre faixas, evitando corte abrupto de áudio.
            fadeTo(0, () => {
              const next = tracks.find((t) => t.id === event.target.value);
              if (next && audioRef.current) {
                audioRef.current.src = next.fileUrl;
                audioRef.current.play().catch(() => undefined);
                fadeTo(volume);
              }
            });
          }
        }}
      >
        {tracks.map((track) => (
          <option key={track.id} value={track.id}>
            {track.emoji ? `${track.emoji} ` : ''}
            {track.title}
          </option>
        ))}
      </select>

      <div className="ambient-player-controls">
        <button type="button" className="btn btn-secondary" onClick={handlePlay}>
          ▶️ Iniciar VR
        </button>
        <button type="button" className="btn btn-secondary" onClick={handlePause}>
          ⏸️ Pausar
        </button>
      </div>

      <label htmlFor="ambient-volume">🔊 Volume</label>
      <input
        id="ambient-volume"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(event) => handleVolumeChange(Number(event.target.value))}
      />

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} loop />
    </div>
  );
}
