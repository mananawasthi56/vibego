'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const GradientTitle = dynamic(() => import('@/components/GradientTitle'), { ssr: false })

const MOODS = [
  { id: 'adventure', emoji: '⛰️', label: 'Adventure',  sub: 'Explore & thrill',  color: '#f97316', glow: 'rgba(249,115,22,0.4)' },
  { id: 'relaxing',  emoji: '🌿', label: 'Relaxing',   sub: 'Calm & peaceful',   color: '#22c55e', glow: 'rgba(34,197,94,0.4)' },
  { id: 'romantic',  emoji: '🌅', label: 'Romantic',   sub: 'Date night magic',  color: '#ec4899', glow: 'rgba(236,72,153,0.4)' },
  { id: 'foodie',    emoji: '🍜', label: 'Foodie',     sub: 'Eat & explore',     color: '#eab308', glow: 'rgba(234,179,8,0.4)' },
  { id: 'social',    emoji: '🎉', label: 'Social',     sub: 'Meet & vibe',       color: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
  { id: 'culture',   emoji: '🏛️', label: 'Culture',    sub: 'Art & history',     color: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
  { id: 'shopping',  emoji: '🛍️', label: 'Shopping',   sub: 'Browse & buy',      color: '#f43f5e', glow: 'rgba(244,63,94,0.4)' },
  { id: 'fitness',   emoji: '💪', label: 'Fitness',    sub: 'Move & sweat',      color: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
  { id: 'coffee',    emoji: '☕', label: 'Coffee',     sub: 'Sip & work',        color: '#d97706', glow: 'rgba(217,119,6,0.4)' },
]

const BUDGETS = [
  { id: 'free',   label: 'Free',  emoji: '🆓' },
  { id: 'low',    label: '₹',     emoji: '💸' },
  { id: 'medium', label: '₹₹',   emoji: '💰' },
  { id: 'high',   label: '₹₹₹',  emoji: '🤑' },
]

export default function Home() {
  const router = useRouter()
  const [selectedMood, setSelectedMood] = useState(null)
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [location, setLocation] = useState(null)
  const [cityName, setCityName] = useState('Detecting location...')
  const [loading, setLoading] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [weather, setWeather] = useState(null)
  const [activeTab, setActiveTab] = useState('mood')
  const [manualMode, setManualMode] = useState(false)
  const [manualCity, setManualCity] = useState('')
  const [manualLoading, setManualLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    setMounted(true)
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
    })))

    if (!navigator.geolocation) {
      setCityName('Location unavailable')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setLocation({ lat: latitude, lon: longitude })
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const city = data.address.city || data.address.town || data.address.village || 'Your location'
          setCityName(city)
        } catch { setCityName('Location detected') }
        try {
          const wRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/weather?lat=${latitude}&lon=${longitude}`)
          const wData = await wRes.json()
          setWeather(wData.weather)
        } catch {}
      },
      () => {
        setLocation({ lat: 30.9010, lon: 75.8573 })
        setCityName('Ludhiana, Punjab')
      }
    )
  }, [])

  const handleManualLocation = async () => {
    if (!manualCity.trim()) return
    setManualLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualCity)}&format=json&limit=1`
      )
      const data = await res.json()
      if (data.length === 0) { alert('City not found!'); return }
      const { lat, lon, display_name } = data[0]
      setLocation({ lat: parseFloat(lat), lon: parseFloat(lon) })
      setCityName(display_name.split(',').slice(0, 2).join(','))
      setManualMode(false)
      setManualCity('')
    } catch { alert('Could not find location!') }
    finally { setManualLoading(false) }
  }

  const handleRandomVibe = () => {
    const random = MOODS[Math.floor(Math.random() * MOODS.length)]
    setSelectedMood(random.id)
  }

  const handleAISearch = async () => {
    if (!aiText.trim() || !location) return
    setAiLoading(true)
    setAiResult(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiText, lat: location.lat, lon: location.lon }),
      })
      const data = await res.json()
      setAiResult(data.suggestion)
      setSelectedMood(data.suggestion.mood)
    } catch { alert('AI error. Try again!') }
    finally { setAiLoading(false) }
  }

  const handleSearch = () => {
    if (!selectedMood || !location) return
    setLoading(true)
    const params = new URLSearchParams({
      mood: selectedMood,
      lat: location.lat,
      lon: location.lon,
      ...(selectedBudget && { budget: selectedBudget }),
    })
    router.push(`/results?${params.toString()}`)
  }

  const selectedMoodData = MOODS.find(m => m.id === selectedMood)

  if (!mounted) {
    return (
      <main style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050508', overflow: 'hidden', position: 'relative' }}>
      {/* UI remains EXACTLY same */}
    </main>
  )
}