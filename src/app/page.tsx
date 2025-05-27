// Tweak: Testing force push to GitHub
"use client";
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import IdeaForm from '@/components/IdeaForm'
import Link from 'next/link'
import IdeaSubmissionArea from '@/components/IdeaSubmissionArea'

// Types for bubble
interface BubbleData {
  id: number
  db_id: string
  name: string
  headline: string
  lightning: string
  idea: string
  x: number // vw
  y: number // vh
  dx: number
  dy: number
  paused?: boolean
  bgColor: string // new: inline background color
  total_sats_received: number
}

export interface Idea {
  id: string
  title: string
  created_at: string
  updated_at: string
  description: string
  submitter_name: string | null
  tags: string[] | null
  total_sats_received: number
  opennode_charge_ids: string[] | null
  lightning_address: string | null
  exclude_idea?: string | null
}

interface BubbleGroupData {
  newest: Idea[];
  mostVoted: Idea[];
  oldest: Idea[];
  random: Idea[];
  randomVoted: Idea[];
  combinedUniqueIdeas: Idea[];
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
  bgColor,
  total_sats_received,
}: BubbleData & {
  expanded: boolean
  onMove: (id: number, x: number, y: number, dx: number, dy: number) => void
  onExpand: (id: number) => void
  onCollapse: () => void
  total_sats_received: number
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
    e.preventDefault(); // Prevent any default behavior
    e.stopPropagation(); // Stop event bubbling
    if (!expanded) {
      onExpand(id);
    }
  }

  // Handle vote button click separately
  const handleVoteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only handle vote here, don't expand/collapse
  }

  // Collapse on outside click
  useEffect(() => {
    if (!expanded) return
    const handleOutside = (e: MouseEvent) => {
      e.preventDefault();
      onCollapse();
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [expanded, onCollapse])

  return (
    <div
      className={`absolute flex flex-col items-center justify-center text-white font-bold shadow-lg select-none z-20 transition-all duration-300 ${expanded ? 'cursor-default' : 'cursor-pointer'} ${expanded ? 'ring-4 ring-orange-300' : ''}`}
      style={{
        left: `${x}vw`,
        top: `${y}vh`,
        width: expanded ? 340 : 120,
        height: expanded ? 340 : 120,
        borderRadius: '9999px',
        transform: 'translate(-50%, -50%) scale(1)',
        transition: 'box-shadow 0.2s, width 0.3s, height 0.3s',
        overflow: expanded ? 'visible' : 'hidden',
        backgroundColor: bgColor,
      }}
      onClick={handleClick}
      tabIndex={0}
      aria-label={headline || 'Bubble'}
    >
      {expanded ? (
        <div className="w-full h-full flex flex-col justify-center items-center p-6 gap-2 text-base font-normal bg-white text-black rounded-full border-2 border-orange-400 shadow-xl text-center">
          {headline && <div className="w-full">{headline}</div>}
          {name && <div className="w-full">{name}</div>}
          {idea && <div className="w-full">{idea}</div>}
          <div className="w-full text-xs text-gray-500 mt-2">Votes: {total_sats_received}</div>
          <button
            className="mt-4 w-full rounded-full bg-yellow-400 px-6 py-3 font-bold text-black shadow-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition"
            onClick={handleVoteClick}
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
  const [bubbleGroupData, setBubbleGroupData] = useState<BubbleGroupData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper to interpolate between two colors
  function lerpColor(a: string, b: string, t: number) {
    const ah = a.replace('#', '')
    const bh = b.replace('#', '')
    const ar = parseInt(ah.substring(0, 2), 16)
    const ag = parseInt(ah.substring(2, 4), 16)
    const ab = parseInt(ah.substring(4, 6), 16)
    const br = parseInt(bh.substring(0, 2), 16)
    const bg = parseInt(bh.substring(2, 4), 16)
    const bb = parseInt(bh.substring(4, 6), 16)
    const rr = Math.round(ar + (br - ar) * t)
    const rg = Math.round(ag + (bg - ag) * t)
    const rb = Math.round(ab + (bb - ab) * t)
    return `rgb(${rr},${rg},${rb})`
  }

  // Fisher-Yates shuffle function
  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Fetch bubble groups on mount and every 120 seconds
  useEffect(() => {
    function fetchBubbleGroups() {
      setIsLoading(true);
      fetch('/api/ideas/bubble-groups')
        .then(res => res.json())
        .then((data: BubbleGroupData) => {
          setBubbleGroupData(data);
          setIsLoading(false);
          setError(null);
          console.log('Raw API data:', data);
          console.log('Deduplicated for chart:', data.combinedUniqueIdeas);
        })
        .catch(err => {
          setError('Failed to fetch bubble groups');
          setIsLoading(false);
        });
    }
    fetchBubbleGroups();
    const interval = setInterval(fetchBubbleGroups, 120000);
    return () => clearInterval(interval);
  }, []);

  // Transform bubbleGroupData.combinedUniqueIdeas into bubbles state
  useEffect(() => {
    if (bubbleGroupData && bubbleGroupData.combinedUniqueIdeas && bubbleGroupData.combinedUniqueIdeas.length > 0) {
      // Shuffle the ideas array using Fisher-Yates shuffle
      const ideas = shuffleArray(bubbleGroupData.combinedUniqueIdeas);
      const maxVotes = Math.max(2, ...ideas.map(i => i.total_sats_received || 0));
      const orange = '#ea580c';
      const lightOrange = '#f59e42';
      const yellow = '#fbbf24';
      // Find the index of the top-ranked idea (highest total_sats_received)
      let topIdx = 0;
      let topVotes = -1;
      ideas.forEach((idea, idx) => {
        if ((idea.total_sats_received || 0) > topVotes) {
          topVotes = idea.total_sats_received || 0;
          topIdx = idx;
        }
      });
      const positions = Array.from({ length: ideas.length }, (_, idx) => {
        let dx = (Math.random() - 0.5) * 0.16;
        let dy = (Math.random() - 0.5) * 0.16;
        // Slow down all bubbles by 30%
        dx *= 0.7;
        dy *= 0.7;
        return {
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 10,
          dx,
          dy,
        };
      });
      const newBubbles = ideas.map((idea, idx) => {
        let bgColor = orange;
        if (idea.total_sats_received === 1) {
          bgColor = lightOrange;
        } else if (idea.total_sats_received > 1) {
          const t = Math.min(1, (idea.total_sats_received - 1) / (maxVotes - 1));
          bgColor = lerpColor(lightOrange, yellow, t);
        }
        return {
          id: idx,
          db_id: idea.id,
          name: idea.submitter_name || '',
          headline: idea.title || '',
          lightning: idea.lightning_address || '',
          idea: idea.description || '',
          ...positions[idx],
          paused: false,
          bgColor,
          total_sats_received: idea.total_sats_received || 0,
        };
      });
      setBubbles(newBubbles);
      nextId.current = newBubbles.length;
    }
  }, [bubbleGroupData]);

  // Update handleAddIdea to call fetchBubbleGroups
  const handleAddIdea = async (data: { name: string; headline: string; lightning: string; idea: string }) => {
    console.log('--- [FRONTEND LOG] Form data received:', data);
    const apiPayload = {
      submitter_name: data.name,
      title: data.headline,
      lightning_address: data.lightning,
      description: data.idea,
    };
    console.log('--- [FRONTEND LOG] Sending payload to API:', apiPayload);
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });
      console.log('--- [FRONTEND LOG] API response status:', response.status);
      const result = await response.json();
      console.log('--- [FRONTEND LOG] API result:', result);
      if (response.ok) {
        alert('Idea submitted successfully!');
        // Refresh bubble groups from API
        setIsLoading(true);
        fetch('/api/ideas/bubble-groups')
          .then(res => res.json())
          .then((data: BubbleGroupData) => {
            setBubbleGroupData(data);
            setIsLoading(false);
            setError(null);
            console.log('Raw API data:', data);
            console.log('Deduplicated for chart:', data.combinedUniqueIdeas);
          })
          .catch(err => {
            setError('Failed to fetch bubble groups');
            setIsLoading(false);
          });
      } else {
        alert(result.error || response.statusText);
      }
    } catch (err) {
      console.error('--- [FRONTEND LOG] Fetch error:', err);
      alert('An error occurred while submitting your idea. Please try again.');
    }
  };

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
  // Calculate the diagonal distance of the viewport in vw/vh units
  const maxDistance = Math.sqrt(100 * 100 + 100 * 100) / 3; // 1/3 of the diagonal
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const dx = bubbles[i].x - bubbles[j].x;
      const dy = bubbles[i].y - bubbles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= maxDistance) {
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
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!bubbleGroupData) return <div>No data</div>;

  return (
    <>
      <main className="relative min-h-screen bg-black overflow-hidden">
        {/* Title and Home Link */}
        <div className="w-full flex flex-col items-center justify-center pt-8 z-30 relative">
          <h1 className="text-xl md:text-2xl font-bold text-white text-center">
            What can we{' '}
            <a
              href="/"
              onClick={e => { e.preventDefault(); window.location.reload(); }}
              className="text-orange-400 underline hover:text-orange-300 transition font-bold"
              aria-label="Refresh Page"
            >
              Do4BTC
            </a>
            ?
          </h1>
        </div>
        {/* SVG lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh' }}>
          {lines}
        </svg>
        {/* Main Bubbles */}
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