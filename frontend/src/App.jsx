import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CalendarLayout from './pages/CalendarLayout';  // CalendarLayout import

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* 불필요한 부분을 숨기기 */}
      <div style={{ display: 'none' }}>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 style={{ display: 'none' }}>Vite + React</h1>
      <div className="card" style={{ display: 'none' }}>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs" style={{ display: 'none' }}>
        Click on the Vite and React logos to learn more
      </p>

      {/* 캘린더만 표시 */}
      <CalendarLayout />
    </>
  )
}

export default App
