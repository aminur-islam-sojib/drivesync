'use client'

import * as React from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react'

interface VideoPlayerProps {
  src: string
  title: string
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [isMuted, setIsMuted] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [playbackRate, setPlaybackRate] = React.useState(1)
  const [showControls, setShowControls] = React.useState(true)
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const togglePlay = React.useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      void videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
    setIsMuted(val === 0)
    if (videoRef.current) {
      videoRef.current.volume = val
      videoRef.current.muted = val === 0
    }
  }

  const toggleMute = React.useCallback(() => {
    if (!videoRef.current) return
    setIsMuted((prev) => {
      const next = !prev
      if (videoRef.current) videoRef.current.muted = next
      return next
    })
  }, [])

  const toggleFullscreen = React.useCallback(async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 2500)
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowRight' && videoRef.current) {
        videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, duration)
      } else if (e.key === 'ArrowLeft' && videoRef.current) {
        videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0)
      } else if (e.key === 'm') {
        toggleMute()
      } else if (e.key === 'f') {
        void toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [isPlaying, duration, togglePlay, toggleMute, toggleFullscreen])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex h-full w-full items-center justify-center bg-black/95 overflow-hidden group select-none"
    >
      <video
        ref={videoRef}
        src={src}
        title={title}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        className="max-h-[80vh] max-w-full cursor-pointer"
        playsInline
      />

      {/* Floating Transport Bar */}
      <div
        className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Range */}
        <div className="relative mb-3 flex items-center group/scrubber">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Seek video position"
            className="w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer accent-accent hover:h-2 transition-all"
          />
        </div>

        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Rewind 10s"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center gap-1.5 group/vol">
              <button
                type="button"
                onClick={toggleMute}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
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
                className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-white"
              />
            </div>

            <span className="text-[11px] font-mono text-white/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed pills */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 text-[11px]">
              {[1, 1.25, 1.5, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSpeedChange(s)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    playbackRate === s ? 'bg-accent text-accent-ink font-bold' : 'hover:bg-white/10'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
