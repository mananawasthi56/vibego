'use client'
import { useState, useRef } from 'react'

const SAMPLE_POSTS = [
  { id: 1, user: 'Arjun S.', avatar: '🧑', mood: 'romantic', place: 'Sunset Point, Chandigarh', caption: 'Best sunset view in the city 🌅', likes: 24, time: '2m ago', color: '#ec4899', image: null, lat: 30.7333, lon: 76.7794 },
  { id: 2, user: 'Priya K.', avatar: '👩', mood: 'coffee', place: 'Brew & Co, Ludhiana', caption: 'Perfect chai and rainy vibes ☕🌧️', likes: 18, time: '15m ago', color: '#d97706', image: null, lat: 30.9010, lon: 75.8573 },
  { id: 3, user: 'Rahul M.', avatar: '🧔', mood: 'adventure', place: 'Rock Garden, Chandigarh', caption: 'Hidden gem! Totally worth it ⛰️', likes: 41, time: '1h ago', color: '#f97316', image: null, lat: 30.7521, lon: 76.8080 },
  { id: 4, user: 'Sneha T.', avatar: '👧', mood: 'relaxing', place: 'Rose Garden, Jalandhar', caption: 'Peaceful morning walk 🌿', likes: 33, time: '2h ago', color: '#22c55e', image: null, lat: 31.3260, lon: 75.5762 },
  { id: 5, user: 'Dev P.', avatar: '👦', mood: 'foodie', place: 'Bikanervala, Ludhiana', caption: 'Best chole bhature in town 🍛', likes: 57, time: '3h ago', color: '#eab308', image: null, lat: 30.9010, lon: 75.8573 },
]

const MOODS = [
  { id: 'adventure', emoji: '⛰️', color: '#f97316' },
  { id: 'relaxing',  emoji: '🌿', color: '#22c55e' },
  { id: 'romantic',  emoji: '🌅', color: '#ec4899' },
  { id: 'foodie',    emoji: '🍜', color: '#eab308' },
  { id: 'social',    emoji: '🎉', color: '#a855f7' },
  { id: 'culture',   emoji: '🏛️', color: '#3b82f6' },
  { id: 'shopping',  emoji: '🛍️', color: '#f43f5e' },
  { id: 'fitness',   emoji: '💪', color: '#ef4444' },
  { id: 'coffee',    emoji: '☕', color: '#d97706' },
]

export default function Feed() {
  const [posts, setPosts] = useState(SAMPLE_POSTS)
  const [liked, setLiked] = useState([])
  const [showPost, setShowPost] = useState(false)
  const [newPost, setNewPost] = useState({ caption: '', place: '', mood: 'social' })
  const [previewImage, setPreviewImage] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [postLocation, setPostLocation] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [detectingLocation, setDetectingLocation] = useState(false)
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  async function startCamera() {
    setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      alert('Camera access denied! Please allow camera permission.')
      setShowCamera(false)
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setPreviewImage(imageData)
    stopCamera()
    detectLocation()
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewImage(reader.result)
      detectLocation()
    }
    reader.readAsDataURL(file)
  }

  async function detectLocation() {
    setDetectingLocation(true)
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords
        setPostLocation({ lat: latitude, lon: longitude })
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        )
        const data = await res.json()
        const name = data.address.city || data.address.town || data.address.village || 'Unknown location'
        setLocationName(name)
        setNewPost(prev => ({ ...prev, place: name }))
        setDetectingLocation(false)
      }, () => {
        setDetectingLocation(false)
      })
    } catch {
      setDetectingLocation(false)
    }
  }

  function toggleLike(id) {
    if (liked.includes(id)) {
      setLiked(liked.filter(l => l !== id))
      setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes - 1 } : p))
    } else {
      setLiked([...liked, id])
      setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
    }
  }

  function submitPost() {
    if (!newPost.caption) return
    const moodInfo = MOODS.find(m => m.id === newPost.mood)
    const post = {
      id: Date.now(),
      user: 'You',
      avatar: '😊',
      mood: newPost.mood,
      place: newPost.place || 'Unknown location',
      caption: newPost.caption,
      likes: 0,
      time: 'just now',
      color: moodInfo?.color || '#22c55e',
      image: previewImage,
      lat: postLocation?.lat,
      lon: postLocation?.lon,
    }
    setPosts([post, ...posts])
    setNewPost({ caption: '', place: '', mood: 'social' })
    setPreviewImage(null)
    setPostLocation(null)
    setLocationName('')
    setShowPost(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050508' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* rest of your UI unchanged */}
    </main>
  )
}