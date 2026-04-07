import { useState } from 'react'
import './App.css'
import Auth from "./pages/Auth.jsx"
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Auth/>
      <h1>Hello world</h1>
    </>
  )
}

export default App
