'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

const MOODS = {
  adventure: { emoji: '⛰️', color: '#f97316', glow: 'rgba(249,115,22,0.3)', label: 'Adventure' },
  relaxing:  { emoji: '🌿', color: '#22c55e', glow: 'rgba(34,197,94,0.3)',   label: 'Relaxing'  },
  romantic:  { emoji: '🌅', color: '#ec4899', glow: 'rgba(236,72,153,0.3)',  label: 'Romantic'  },
  foodie:    { emoji: '🍜', color: '#eab308', glow: 'rgba(234,179,8,0.3)',   label: 'Foodie'    },
  social:    { emoji: '🎉', color: '#a855f7', glow: 'rgba(168,85,247,0.3)',  label: 'Social'    },
  culture:   { emoji: '🏛️', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)', label: 'Culture'   },
  shopping:  { emoji: '🛍️', color: '#f43f5e', glow: 'rgba(244,63,94,0.3)',  label: 'Shopping'  },
  fitness:   { emoji: '💪', color: '#ef4444', glow: 'rgba(239,68,68,0.3)',   label: 'Fitness'   },
  coffee:    { emoji: '☕', color: '#d97706', glow: 'rgba(217,119,6,0.3)',   label: 'Coffee'    },
}

const VIBE_TAGS = {
  adventure:  ['Outdoor', 'Thrilling', 'Nature', 'Scenic'],
  relaxing:   ['Peaceful', 'Calm', 'Nature', 'Quiet'],
  romantic:   ['Cozy', 'Date spot', 'Scenic', 'Intimate'],
  foodie:     ['Delicious', 'Local', 'Must try', 'Popular'],
  social:     ['Lively', 'Fun', 'Hangout', 'Trendy'],
  culture:    ['Historic', 'Educational', 'Artistic', 'Heritage'],
  shopping:   ['Trendy', 'Bargain', 'Popular', 'Variety'],
  fitness:    ['Active', 'Energy', 'Health', 'Sporty'],
  coffee:     ['Cozy', 'Study spot', 'Wifi', 'Chill'],
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mood = searchParams.get('mood')
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const budget = searchParams.get('budget')

  const [places, setPlaces] = useState([])
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [saved, setSaved] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)

  const moodInfo = MOODS[mood] || { emoji: '📍', color: '#22c55e', glow: 'rgba(34,197,94,0.3)', label: 'Places' }
  const vibeTags = VIBE_TAGS[mood] || []

  useEffect(() => {
    if (!mood || !lat || !lon) return
    fetchPlaces()
  }, [mood, lat, lon])

  async function fetchPlaces() {
    try {
      setLoading(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/places/search?lat=${lat}&lon=${lon}&mood=${mood}`
      )
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPlaces(data.places || [])
      setCity(data.city || '')
    } catch {
      setError('Could not load places. Make sure the backend is running!')
    } finally {
      setLoading(false)
    }
  }

  async function toggleSave(place) {
    const isSaved = saved.includes(place.id)
    if (isSaved) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saved/${place.id}`, { method: 'DELETE' })
      setSaved(saved.filter(id => id !== place.id))
    } else {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saved`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...place, osm_id: place.id }),
      })
      setSaved([...saved, place.id])
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050508', position: 'relative' }}>
      {/* UI unchanged */}
    </main>
  )
}

export default function Results() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}