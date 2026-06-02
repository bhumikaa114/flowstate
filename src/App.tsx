import { useState, useEffect } from "react"
import { getWeather } from "./weather"

type Mode = "focus" | "break"

const SCENES = {
  forest: [
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80",
    "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1920&q=80",
    "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=1920&q=80",
  ],
  ocean: [
    "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=80",
  ],
  mountain: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80",
    "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1920&q=80",
  ],
  city: [
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80",
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80",
    "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1920&q=80",
  ]
}

type Scene = keyof typeof SCENES

function App() {
  const [mode, setMode] = useState<Mode>("focus")
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [weather, setWeather] = useState<{ temp: number, description: string, city: string } | null>(null)
  const [imgIndex, setImgIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [muted, setMuted] = useState(false)
  const [sessions, setSessions] = useState(() => {
    return Number(localStorage.getItem("fs_sessions") || "0")
  })
  const [showSettings, setShowSettings] = useState(false)
  const [focusMin, setFocusMin] = useState(() => {
    return localStorage.getItem("fs_focusMin") || "25"
  })
  const [breakMin, setBreakMin] = useState(() => {
    return localStorage.getItem("fs_breakMin") || "5"
  })
  const [scene, setScene] = useState<Scene>(() => {
    return (localStorage.getItem("fs_scene") as Scene) || "forest"
  })

  // Timer countdown
  useEffect(() => {
    if (!running) return
    if (seconds === 0) {
      setRunning(false)
      playDing()
      if (mode === "focus") {
        const newCount = sessions + 1
        setSessions(newCount)
        if (newCount % 4 === 0) {
          setMode("break")
          setSeconds(Number(breakMin) * 60 * 3)
        } else {
          setMode("break")
          setSeconds(Number(breakMin) * 60)
        }
      } else {
        setMode("focus")
        setSeconds(Number(focusMin) * 60)
      }
      setRunning(true)
      return
    }
    const interval = setInterval(() => {
      setSeconds(s => s - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [running, seconds, mode, sessions, focusMin, breakMin])

  // Fetch real weather
  useEffect(() => {
    getWeather().then(setWeather).catch(err => console.error("Weather error:", err))
  }, [])

  // Background slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setImgIndex(prev => (prev + 1) % SCENES[scene].length)
        setFade(true)
      }, 1000)
    }, 60000)
    return () => clearInterval(timer)
  }, [scene])

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem("fs_sessions", String(sessions))
  }, [sessions])

  // Save focus and break minutes
  useEffect(() => {
    localStorage.setItem("fs_focusMin", focusMin)
    localStorage.setItem("fs_breakMin", breakMin)
  }, [focusMin, breakMin])

  // Save scene
  useEffect(() => {
    localStorage.setItem("fs_scene", scene)
  }, [scene])

  function switchMode(m: Mode) {
    setMode(m)
    setRunning(false)
    setSeconds(m === "focus" ? Number(focusMin) * 60 : Number(breakMin) * 60)
  }

  function reset() {
    setRunning(false)
    setSeconds(mode === "focus" ? Number(focusMin) * 60 : Number(breakMin) * 60)
  }

  function saveSettings() {
    const f = Math.max(1, Math.min(99, Number(focusMin)))
    const b = Math.max(1, Math.min(99, Number(breakMin)))
    setFocusMin(String(f))
    setBreakMin(String(b))
    setMode("focus")
    setSeconds(f * 60)
    setRunning(false)
    setShowSettings(false)
  }

  function playDing() {
    if (muted) return
    const ctx = new AudioContext()

    function beep(startTime: number) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      osc.type = "sine"
      gain.gain.setValueAtTime(0.3, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)
      osc.start(startTime)
      osc.stop(startTime + 0.4)
    }

    beep(ctx.currentTime)
    beep(ctx.currentTime + 0.5)
    beep(ctx.currentTime + 1.0)
  }

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* Layer 1 — Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-2000"
        style={{
          backgroundImage: `url(${SCENES[scene][imgIndex]})`,
          opacity: fade ? 1 : 0
        }}
      />

      {/* Layer 2 — Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Layer 3 — Content */}
      <div className="relative z-10 flex flex-col items-center w-full px-4">

        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-white text-4xl font-bold tracking-wide drop-shadow-lg">
            FlowState 🍅
          </h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-white/50 hover:text-white text-xl transition-all duration-200"
          >
            ⚙️
          </button>
          <button
            onClick={() => setMuted(!muted)}
            className="text-white/50 hover:text-white text-xl transition-all duration-200"
          >
            {muted ? "🔇" : "🔔"}
          </button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mb-4 p-4 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex flex-col items-center gap-3">
            <p className="text-white/70 text-xs uppercase tracking-widest">Custom Timer</p>
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <label className="text-white/50 text-xs">Focus (min)</label>
                <input
                  type="number"
                  value={focusMin}
                  onChange={e => setFocusMin(e.target.value)}
                  className="w-16 text-center bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-white/50"
                  min="1"
                  max="99"
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <label className="text-white/50 text-xs">Break (min)</label>
                <input
                  type="number"
                  value={breakMin}
                  onChange={e => setBreakMin(e.target.value)}
                  className="w-16 text-center bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-white/50"
                  min="1"
                  max="99"
                />
              </div>
            </div>
            <button
              onClick={saveSettings}
              className="px-6 py-1.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/80 transition-all duration-200"
            >
              Save
            </button>
          </div>
        )}

        <p className="text-white/60 text-sm mb-2">stay in the flow</p>

        {/* Session counter dots */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map(n => (
            <div
              key={n}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                n <= (sessions % 4 === 0 && sessions !== 0 ? 4 : sessions % 4)
                  ? "bg-white scale-125"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>

        <p className="text-white/40 text-xs mb-2">
          {sessions} session{sessions !== 1 ? "s" : ""} completed
        </p>
        {sessions > 0 && (
          <button
            onClick={() => {
              setSessions(0)
              localStorage.setItem("fs_sessions", "0")
            }}
            className="text-white/20 hover:text-white/50 text-xs mb-4 transition-all duration-200"
          >
            reset progress
          </button>
        )}

        {/* Weather pill */}
        {weather && (
          <div className="mb-4 px-5 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-sm">
            🌦 {weather.city} · {weather.temp}°C · {weather.description}
          </div>
        )}

        {/* Scene selector */}
        <div className="flex gap-2 mb-6">
          {(Object.keys(SCENES) as Scene[]).map(s => (
            <button
              key={s}
              onClick={() => { setScene(s); setImgIndex(0) }}
              className={`px-4 py-1 rounded-full text-xs font-semibold capitalize transition-all duration-200
                ${scene === s
                  ? "bg-white text-black"
                  : "bg-white/10 text-white border border-white/20 hover:bg-white/20"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Mode switcher */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => switchMode("focus")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200
              ${mode === "focus"
                ? "bg-white text-black"
                : "bg-white/10 text-white border border-white/20"}`}
          >
            Focus {focusMin}:00
          </button>
          <button
            onClick={() => switchMode("break")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200
              ${mode === "break"
                ? "bg-white text-black"
                : "bg-white/10 text-white border border-white/20"}`}
          >
            Break {breakMin}:00
          </button>
        </div>

      
       {/* Timer — no circle, big and clean */}
    <div className="flex items-center justify-center mb-8">
  <span className="text-white font-mono font-bold drop-shadow-lg"
    style={{ fontSize: "clamp(60px, 10vw, 120px)" }}>
    {minutes}:{secs < 10 ? "0" + secs : secs}
  </span>
</div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setRunning(!running)}
            className="px-10 py-3 rounded-full text-black font-semibold text-lg transition-all duration-200 bg-white hover:bg-white/80"
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-full font-semibold text-lg transition-all duration-200 border border-white/30 text-white hover:bg-white/10"
          >
            Reset
          </button>
        </div>

      </div>
    </div>
  )
}

export default App