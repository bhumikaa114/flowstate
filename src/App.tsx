import { useState, useEffect } from "react"
import { getWeather } from "./weather"

type Mode = "focus" | "break"

function App() {
  const [mode, setMode] = useState<Mode>("focus")
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [weather, setWeather] = useState<{ temp: number, description: string, city: string } | null>(null)

  useEffect(() => {
    if (!running) return
    if (seconds === 0) {
      setRunning(false)
      return
    }
    const interval = setInterval(() => {
      setSeconds(s => s - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [running, seconds])

  useEffect(() => {
    getWeather().then(setWeather).catch(err => console.error("Weather error:", err))
  }, [])

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
    <div className="min-h-screen bg-[#0f1a14] flex flex-col items-center justify-center">

      <h1 className="text-[#52B788] text-4xl font-bold mb-1 tracking-wide">
        FlowState 🍅
      </h1>
      <p className="text-[#6B7280] text-sm mb-4">stay in the flow</p>

      {/* Weather */}
      {weather && (
        <div className="mb-8 px-5 py-2 rounded-full bg-[#1a2e20] border border-[#2D6A4F] text-[#52B788] text-sm">
          🌦 {weather.city} · {weather.temp}°C · {weather.description}
        </div>
      )}

      {/* Mode switcher */}
      <div className="flex gap-3 mb-10">
        <button
          onClick={() => switchMode("focus")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 
            ${mode === "focus"
              ? "bg-[#2D6A4F] text-white"
              : "bg-transparent border border-[#2D6A4F] text-[#52B788]"}`}
        >
          Focus 25:00
        </button>
        <button
          onClick={() => switchMode("break")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 
            ${mode === "break"
              ? "bg-[#2D6A4F] text-white"
              : "bg-transparent border border-[#2D6A4F] text-[#52B788]"}`}
        >
          Break 5:00
        </button>
      </div>

      {/* Timer circle */}
      <div className="w-64 h-64 rounded-full border-4 border-[#2D6A4F] flex items-center justify-center mb-10 shadow-[0_0_60px_#2D6A4F55]">
        <span className="text-white text-6xl font-mono font-bold">
          {minutes}:{secs < 10 ? "0" + secs : secs}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setRunning(!running)}
          className="px-10 py-3 rounded-full text-white font-semibold text-lg transition-all duration-200 bg-[#2D6A4F] hover:bg-[#52B788] hover:text-[#0f1a14]"
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full font-semibold text-lg transition-all duration-200 border border-[#2D6A4F] text-[#52B788] hover:bg-[#2D6A4F] hover:text-white"
        >
          Reset
        </button>
      </div>

    </div>
  )
}

export default App  