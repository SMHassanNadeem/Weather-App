import { useEffect, useState } from 'react'
// import './App.css'

function App() {
  const [theme, setTheme] = useState(true)
  const [value, setValue] = useState()
  const [time, setTime] = useState("");
  const [city, setCity] = useState("")
  const [cityCur, setCityCur] = useState("");
  const [error, setError] = useState("");
  const [forecast, setForecast] = useState()
  const [Loading, setLoading] = useState('');
  const [loadFlag, setLoadFlag] = useState(false);

  async function forecastFun(cityName) {
    try {
      const data = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=d6d703f74be9188a1690339c653bde44`
      )
      const res = await data.json()
      if (res.cod !== "200") {
        setError("Forecast not found ❌")
        setForecast([])
        return
      }
      const grouped = {}
      res.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0]
        if (!grouped[date]) grouped[date] = []
        grouped[date].push(item)
      })
      const nextThreeDays = Object.keys(grouped)
        .slice(0, 3)
        .map((date) => {
          const dayData =
            grouped[date].find((x) => x.dt_txt.includes("12:00:00")) ||
            grouped[date][0]
          return {
            date,
            temp: Math.round(dayData.main.temp),
            desc: dayData.weather[0].description,
            icon: dayData.weather[0].icon,
          }
        })
      setForecast(nextThreeDays)
      setError("")
    } catch (e) {
      console.log(e)
      setError("Error fetching forecast ❌")
    }
  }

  async function fetchData(cityName) {
    try {
      const data = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=d6d703f74be9188a1690339c653bde44`
      )
      const res = await data.json()
      setValue(res)

      if (res.cod === 200) {
        forecastFun(cityName)
      }

      const { dt, timezone } = res;
      const localTimestamp = (dt + timezone) * 1000;
      const localDate = new Date(localTimestamp);
      const formatted = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        hour12: true,
        timeZone: "UTC",
      }).format(localDate);
      setTime(formatted);
    } catch (e) {
      console.log(e)
    }
  }
  const getCityName = async () => {
    setLoading("Loading weather...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude.toFixed(1);
          const lon = position.coords.longitude.toFixed(1);
          try {
            const res = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=d6d703f74be9188a1690339c653bde44`
            );
            const data = await res.json();
            if (data && data.length > 0) {
              const cityName = data[0].name;
              setCity(cityName)
              fetchData(cityName)
              setError("");
            } else {
              setError("City not found ❌");
            }
          } catch (err) {
            setError("Error fetching city ❌");
          }
        },
        () => {
          setError("Location access denied ❌");
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation not supported ❌");
    }
  };



  function submit(e) {
    e.preventDefault();
    if (!city || city.trim() === "") {
      alert("⚠️ Please enter a city name")
      return
    }
    setTimeout(()=> setLoadFlag(false),1000)
    setLoadFlag(true)
    fetchData(city)
  }

  useEffect(() => {
    theme ? document.body.classList.remove('darkMode') : document.body.classList.add('darkMode')
  }, [theme])

  return (
    <div style={{ height: '140vh' }}>
      <h2>{cityCur}</h2>
      <div className='navbar' style={{ display: 'flex', marginTop: '20px', alignItems: 'center' }}>
        <i style={{ fontSize: '22px', marginRight: '10px' }} className="fas fa-cloud-sun"></i>
        <h2 style={{ margin: '0px' }}>Weather Dashboard</h2>
        <form style={{ marginLeft: '5%' }} onSubmit={submit}>
          <input
            style={{ color: theme ? 'gray' : 'white', height: '30px', paddingLeft: '10px', borderRadius: '20px', border: '0px', width: '80%', backgroundColor: theme ? 'rgba(255, 255, 255, 0.9)' : null, background: theme ? null : 'rgba(255, 255, 255, 0.15)' }}
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search for a city ..."
          />
          <button style={{ backgroundColor: '#4299e1', border: '0px', padding: '7px', borderRadius: '50%', cursor: 'pointer', marginLeft: '-30px' }} type="submit"><i className="fas fa-search"></i></button>
        </form>
        <div style={{ display: 'flex' }}>
          <button onClick={getCityName} style={{ background: theme ? '#4299e1' : 'rgba(255, 255, 255, 0.15)', border: '0px', padding: '7px', borderRadius: '20px', marginLeft: '1%' }}>
            <i className="fas fa-location-arrow"></i> <b>My Location</b>
          </button>

          <button onClick={() => window.location.reload()} style={{ background: theme ? 'white' : 'rgba(255, 255, 255, 0.15)', color: '#4299e1', border: '0px', padding: '7px', borderRadius: '20px', marginLeft: '1%' }}><i style={{ color: '#4299e1' }} className="fas fa-sync-alt"></i> <b style={{ color: '#4299e1' }} >Refresh</b></button>

          <button onClick={() => setTheme(!theme)} className='toggle' style={{ background: 'rgba(255, 255, 255, 0.2)', border: '0', borderRadius: '20px', width: '60px', height: '30px', marginLeft: '2%' }}>
            <div style={{ display: 'flex' }}>
              <i style={{ color: 'orange', fontSize: '20px', marginLeft: '1px', marginTop: '1px', position: 'absolute', zIndex: '-100' }} className="fas fa-sun"></i>
              <div style={{ backgroundColor: theme ? 'rgba(255, 255, 255, 1)' : '#4299e1', width: '22px', height: '22px', borderRadius: '50%', marginLeft: theme ? '0px' : '27px' }}></div>
              <i style={{ fontSize: '20px', marginLeft: '30px', position: 'absolute', zIndex: '-1' }} className="fas fa-moon"></i>
            </div>
          </button>
        </div>
      </div>
      {value && value.cod === 200 ? (
        loadFlag?<h1 style={{display:'flex', justifyContent:'center', alignItems:'center',width:'70vw', height:'60vh'}}>Loading...</h1>:
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', marginTop: '30px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.1)', width: '', height: '70vh' }}>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '10px' }}><h2>{value.name}</h2><p style={{ marginTop: '25px' }}> {value.sys.country}</p></div>
                <h4>{time}</h4>
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <h1 style={{ fontSize: '60px' }}>{parseInt(value.main.temp - 273)}°C</h1>
              <div className='cond' style={{ display: 'flex', flexDirection: 'column', marginLeft: '50%' }}>
                <h1 style={{ margin: '0px' }}><img src={`http://openweathermap.org/img/wn/${value.weather[0].icon}.png`} alt={value.weather[0].description} /></h1>
                <h2 style={{ margin: '0px' }}>{value.weather[0].description}</h2>
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '33%', marginLeft: '10px', height: '150px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.26)' }}>
                <h3 style={{ margin: '10px', }}><i style={{ color: '#4299e1', fontSize: '30px' }} className="fas fa-temperature-high"></i></h3>
                <h4 style={{ margin: '5px' }}>Feels Like</h4>
                <h3 style={{ margin: '0' }}>{parseInt(value.main.temp - 273)} °C</h3>
              </div>
              <div style={{ width: '33%', marginLeft: '10px', height: '150px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.26)' }}>
                <h3 style={{ margin: '10px', }}><i style={{ color: '#4299e1', fontSize: '30px' }} className="fas fa-tint"></i></h3>
                <h3 style={{ margin: '5px' }}>Humidity</h3>
                <h3 style={{ margin: '0' }}>{value.main.humidity}%</h3>
              </div>
              <div style={{ width: '33%', marginLeft: '10px', height: '150px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.26)' }}>
                <h3 style={{ margin: '10px', }}><i style={{ color: '#4299e1', fontSize: '30px' }} className="fas fa-wind"></i></h3>
                <h3 style={{ margin: '5px' }}>Wind Speed</h3>
                <h3 style={{ margin: '0' }}>{value.wind.speed} m/s</h3>
              </div>
            </div>
          </div>

          <h1>
            <i className="fas fa-calendar-alt"></i> 3-Day Forecast
          </h1>
          <div style={{ display: "flex" }}>
            {forecast &&
              forecast.map((day) => (
                <div key={day.date} style={{ width: "33%", marginLeft: "10px", height: "150px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255, 255, 255, 0.26)", }}>
                  <h4 style={{ margin: '0' }}>{day.date}</h4>
                  <img
                    style={{ margin: '0' }}
                    src={`http://openweathermap.org/img/wn/${day.icon}.png`}
                    alt={day.desc}
                  />
                  <h3 style={{ margin: '0' }}>{day.temp}°C</h3>
                  <p style={{ margin: '0' }}>{day.desc}</p>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div style={{ width: '65vw', marginTop: '100px' }}>
          <h1>Please Enter City Name...</h1>
          {
            error ? <h2>{error}</h2>
              :
              <h2>{Loading}</h2>
          }
        </div>
      )}
    </div>
  )
}

export default App