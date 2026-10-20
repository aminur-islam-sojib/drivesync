'use client'

import * as React from 'react'
import {
  Play,
  Pause,
  Music,
  Volume2,
  VolumeX,
  Repeat,
  RotateCcw,
} from 'lucide-react'

interface AudioPlayerProps {
  src: string
  title: string
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null)

  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [isMuted, setIsMuted] = React.useState(false)
  const [isLooping, setIsLooping] = React.useState(false)

  const togglePlay = () => {
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      void audioRef.current.play()
      setIsPlaying(true)
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) audioRef.current.currentTime = time
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
    setIsMuted(val === 0)
    if (audioRef.current) {
      audioRef.current.volume = val
      audioRef.current.muted = val === 0
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    const next = !isMuted
    setIsMuted(next)
    audioRef.current.muted = next
  }

  const toggleLoop = () => {
    if (!audioRef.current) return
    const next = !isLooping
    setIsLooping(next)
    audioRef.current.loop = next
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-lg w-full mx-auto select-none">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Rotating Vinyl Disc Visual */}
      <div className="relative mb-8 flex h-48 w-48 items-center justify-center rounded-full bg-surface-2 border-4 border-line shadow-2xl overflow-hidden group">
        <div
          className={`absolute inset-0 rounded-full border-8 border-ink/5 ${
            isPlaying ? 'animate-spin [animation-duration:8s]' : ''
          }`}
        />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-ink shadow-inner">
          <Music className="h-8 w-8" />
        </div>
      </div>

      <h3 className="text-base font-bold text-ink text-center truncate max-w-sm mb-1">{title}</h3>
      <p className="text-xs text-ink-3 mb-6">In-App Audio Playback</p>

      {/* Progress Range */}
      <div className="w-full space-y-2 mb-6">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          aria-label="Seek audio position"
          className="w-full h-1.5 bg-line rounded-full appearance-none cursor-pointer accent-accent hover:h-2 transition-all"
        />
        <div className="flex items-center justify-between text-[11px] font-mono text-ink-3">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLoop}
            className={`flex h-8 w-8 items-center justify-center rounded-xl cursor-pointer transition-colors ${
              isLooping ? 'bg-accent/10 text-accent' : 'text-ink-3 hover:text-ink'
            }`}
            title="Loop"
          >
            <Repeat className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 10)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-3 hover:text-ink cursor-pointer"
            title="Rewind 10s"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </button>

        {/* Volume */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-3 hover:text-ink cursor-pointer"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Volume level"
            className="w-16 h-1 bg-line rounded-full appearance-none cursor-pointer accent-accent"
          />
        </div>
      </div>
    </div>
  )
}
