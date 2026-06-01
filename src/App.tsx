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
  const [scene, setScene] = useState<Scene>("forest")
  const [imgIndex, setImgIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [sessions, setSessions] = useState(0)
  // Timer countdown
  useEffect(() => {
    if (!running) return
    if (seconds === 0) {
      setRunning(false)
      if (mode === "focus") {
        const newCount = sessions + 1
        setSessions(newCount)
        if (newCount % 4 === 0) {
          setMode("break")
          setSeconds(15 * 60)
        } else {
          setMode("break")
          setSeconds(5 * 60)
        }
      } else {
        setMode("focus")
        setSeconds(25 * 60)
      }
      setRunning(true)
      return
    }
    const interval = setInterval(() => {
      setSeconds(s => s - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [running, seconds, mode, sessions])

  // Fetch real weather
  useEffect(() => {
    getWeather().then(setWeather).catch(err => console.error("Weather error:", err))
  }, [])

  // Background slideshow — THIS IS THE ARRAY + MODULO IN ACTION
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

  function switchMode(m: Mode) {
    setMode(m)
    setRunning(false)
    setSeconds(m === "focus" ? 25 * 60 : 5 * 60)
  }

  function reset() {
    setRunning(false)
    setSeconds(mode === "focus" ? 25 * 60 : 5 * 60)
  }

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* Layer 1 — Background image, fades between photos */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-2000"
        style={{
          backgroundImage: `url(${SCENES[scene][imgIndex]})`,
          opacity: fade ? 1 : 0
        }}
      />

      {/* Layer 2 — Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Layer 3 — All content sits on top */}
      <div className="relative z-10 flex flex-col items-center w-full px-4">

        <h1 className="text-white text-4xl font-bold mb-1 tracking-wide drop-shadow-lg">
          FlowState 🍅
        </h1>
        <p className="text-white/60 text-sm mb-2">stay in the flow</p>

{/* Session counter */}
<div className="flex gap-2 mb-4">
  {[1,2,3,4].map(n => (
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
<p className="text-white/40 text-xs mb-4">
  {sessions} session{sessions !== 1 ? "s" : ""} completed
</p>

        {/* Weather pill */}
        {weather && (
          <div className="mb-4 px-5 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-sm">
            🌦 {weather.city} · {weather.temp}°C · {weather.description}
          </div>
        )}

        {/* Scene selector — loops over array keys */}
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
            Focus 25:00
          </button>
          <button
            onClick={() => switchMode("break")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200
              ${mode === "break"
                ? "bg-white text-black"
                : "bg-white/10 text-white border border-white/20"}`}
          >
            Break 5:00
          </button>
        </div>

        {/* Timer circle */}
        <div className="w-64 h-64 rounded-full border-4 border-white/30 bg-black/30 backdrop-blur flex items-center justify-center mb-8 shadow-2xl">
          <span className="text-white text-6xl font-mono font-bold drop-shadow-lg">
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