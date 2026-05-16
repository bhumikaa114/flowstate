export async function getWeather() {
  const key = import.meta.env.VITE_WEATHER_KEY
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=Agra&appid=${key}&units=metric`
  )
  const data = await res.json()
  return {
    temp: Math.round(data.main.temp),
    description: data.weather[0].description,
    city: data.name
  }
}