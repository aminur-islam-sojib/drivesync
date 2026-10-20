'use client'

import * as React from 'react'
import { ZoomIn, ZoomOut, RotateCw, RefreshCw } from 'lucide-react'

interface ImageViewerProps {
  src: string
  alt: string
}

export function ImageViewer({ src, alt }: ImageViewerProps) {
  const [scale, setScale] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = React.useState(true)

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 4))
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25))
  const handleRotate = () => setRotation((r) => (r + 90) % 360)
  const handleReset = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}

      {/* Image Element */}
      <div
        className="transition-transform duration-100 ease-out flex items-center justify-center max-w-full max-h-full"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          className={`max-h-[75vh] max-w-[85vw] object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          draggable={false}
          onDoubleClick={() => (scale === 1 ? setScale(2) : handleReset())}
        />
      </div>

      {/* Floating Control Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-2xl bg-surface/90 border border-line px-3 py-1.5 shadow-pop backdrop-blur-md z-20">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={scale <= 0.25}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink disabled:opacity-40 cursor-pointer transition-colors"
          title="Zoom out (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <span className="w-12 text-center text-xs font-semibold text-ink">
          {Math.round(scale * 100)}%
        </span>

        <button
          type="button"
          onClick={handleZoomIn}
          disabled={scale >= 4}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink disabled:opacity-40 cursor-pointer transition-colors"
          title="Zoom in (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-line mx-1" />

        <button
          type="button"
          onClick={handleRotate}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer transition-colors"
          title="Rotate 90°"
        >
          <RotateCw className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer transition-colors"
          title="Reset View"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

