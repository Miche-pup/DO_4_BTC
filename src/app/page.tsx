"use client";
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import IdeaForm from '@/components/IdeaForm'
import Link from 'next/link'

// Types for bubble
interface BubbleData {
  id: number
  name: string
  headline: string
  lightning: string
  idea: string
  x: number // vw
  y: number // vh
  dx: number
  dy: number
  paused?: boolean
}

// Bubble component for animated headline
const Bubble = ({
  id,
  name,
  headline,
  lightning,
  idea,
  x,
  y,
  dx,
  dy,
  paused,
  expanded,
  onMove,
  onExpand,
  onCollapse,
}: BubbleData & {
  expanded: boolean
  onMove: (id: number, x: number, y: number, dx: number, dy: number) => void
  onExpand: (id: number) => void
  onCollapse: () => void
}) => {
  const requestRef = useRef<number>()

  useEffect(() => {
    if (paused || expanded) return
    let pos = { x, y, dx, dy }
    const animate = () => {
      pos.x += pos.dx
      pos.y += pos.dy
      // Bounce off edges
      if (pos.x < 5 || pos.x > 95) pos.dx = -pos.dx
      if (pos.y < 5 || pos.y > 85) pos.dy = -pos.dy
      pos.x = Math.max(5, Math.min(95, pos.x))
      pos.y = Math.max(5, Math.min(85, pos.y))
      onMove(id, pos.x, pos.y, pos.dx, pos.dy)
      requestRef.current = requestAnimationFrame(animate)
    }
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current!)
    // eslint-disable-next-line
  }, [paused, expanded])

  // Expand on click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!expanded) {
      onExpand(id)
    }
  }

  // Collapse on outside click
  useEffect(() => {
    if (!expanded) return
    const handleOutside = () => {
      onCollapse()
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [expanded, onCollapse])

  return (
    <div
      className={`absolute flex flex-col items-center justify-center bg-orange-700/90 text-white font-bold shadow-lg select-none z-20 transition-all duration-300 ${expanded ? 'cursor-default' : 'cursor-pointer'} ${expanded ? 'ring-4 ring-orange-300' : ''}`}
      style={{
        left: `${x}vw`,
        top: `${y}vh`,
        width: expanded ? 340 : 120,
        height: expanded ? 340 : 120,
        borderRadius: '9999px',
        transform: 'translate(-50%, -50%) scale(1)',
        transition: 'box-shadow 0.2s, width 0.3s, height 0.3s',
        overflow: expanded ? 'visible' : 'hidden',
      }}
      onClick={handleClick}
      tabIndex={0}
      aria-label={headline || 'Bubble'}
    >
      {expanded ? (
        <div className="w-full h-full flex flex-col justify-center items-center p-6 gap-2 text-base font-normal bg-white text-black rounded-full border-2 border-orange-400 shadow-xl text-center">
          {name && <div className="w-full"><span className="font-semibold">Name:</span> {name}</div>}
          {headline && <div className="w-full"><span className="font-semibold">Headline:</span> {headline}</div>}
          {lightning && <div className="w-full"><span className="font-semibold">Lightning:</span> {lightning}</div>}
          {idea && <div className="w-full"><span className="font-semibold">Idea:</span> {idea}</div>}
          <button
            className="mt-4 w-full rounded-full bg-yellow-400 px-6 py-3 font-bold text-black shadow-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition"
            onClick={e => e.stopPropagation()}
            aria-label="Vote with Lightning"
          >
            Vote with Lightning
          </button>
        </div>
      ) : (
        <span className="text-center px-2 break-words text-lg">{headline}</span>
      )}
    </div>
  )
}

export default function Home() {
  const [formOpen, setFormOpen] = useState(false)
  const [bubbles, setBubbles] = useState<BubbleData[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const nextId = useRef(0)

  // Add new bubble on submit
  const handleAddIdea = (data: { name: string; headline: string; lightning: string; idea: string }) => {
    setBubbles(bs => [
      ...bs,
      {
        id: nextId.current++,
        name: data.name,
        headline: data.headline,
        lightning: data.lightning,
        idea: data.idea,
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 10,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.25,
        paused: false,
      },
    ])
  }

  // Update bubble position
  const handleMove = (id: number, x: number, y: number, dx: number, dy: number) => {
    setBubbles(bs =>
      bs.map(b => (b.id === id ? { ...b, x, y, dx, dy } : b))
    )
  }

  // Expand a bubble (pause it)
  const handleExpand = (id: number) => {
    setBubbles(bs => bs.map(b => (b.id === id ? { ...b, paused: true } : { ...b, paused: false })))
    setExpandedId(id)
  }
  // Collapse all bubbles (resume all)
  const handleCollapse = () => {
    setBubbles(bs => bs.map(b => ({ ...b, paused: false })))
    setExpandedId(null)
  }

  // SVG lines between bubbles
  const lines = []
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      lines.push(
        <line
          key={`line-${bubbles[i].id}-${bubbles[j].id}`}
          x1={`${bubbles[i].x}vw`}
          y1={`${bubbles[i].y}vh`}
          x2={`${bubbles[j].x}vw`}
          y2={`${bubbles[j].y}vh`}
          stroke="#fbbf24"
          strokeWidth="1"
          opacity="0.5"
        />
      )
    }
  }

  return (
    <>
      <main className="relative min-h-screen bg-black overflow-hidden">
        {/* Title and Home Link */}
        <div className="w-full flex flex-col items-center justify-center pt-8 z-30 relative">
          <h1 className="text-xl md:text-2xl font-bold text-white text-center">
            What can we{' '}
            <Link href="/" className="text-orange-400 underline hover:text-orange-300 transition font-bold">Do4BTC</Link>
            ?
          </h1>
        </div>
        {/* SVG lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh' }}>
          {lines}
        </svg>
        {/* Bubbles */}
        {bubbles.map(bubble => (
          <Bubble
            key={bubble.id}
            {...bubble}
            expanded={expandedId === bubble.id}
            onMove={handleMove}
            onExpand={handleExpand}
            onCollapse={handleCollapse}
          />
        ))}
        {/* Floating Button */}
        {!formOpen && (
          <button
            className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition"
            onClick={() => setFormOpen(true)}
            aria-label="Open Submit Idea Form"
          >
            Click Me
          </button>
        )}
        {/* Dropdown Form */}
        <IdeaForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleAddIdea}
        />
        <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none select-none">
          <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-5">
            <circle cx="300" cy="300" r="290" fill="#f7931a" />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" alignmentBaseline="middle" fill="white" fontSize="320" fontWeight="bold" fontFamily="Arial, Helvetica, sans-serif">₿</text>
          </svg>
        </div>
      </main>
    </>
  )
} 