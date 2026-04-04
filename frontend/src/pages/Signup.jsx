import { Link, useNavigate } from 'react-router-dom'
import '../styles/signup.css'
import { useState } from 'react'
import axios from 'axios'

export default function Signup() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.placeholder]: e.target.value })
  }

  const handleSignup = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match ❌")
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        name: form.name,
        email: form.email,
        password: form.password
      })

      alert("Signup successful 🎉")
      navigate('/login')
    } catch (err) {
      alert(err.response?.data || "Signup failed")
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>
        <p>Join Eventura and stay updated with events!</p>

        <form className="signup-form" onSubmit={handleSignup}>
          <div className="input-group">
            <input
              type="text"
              placeholder="name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="confirmPassword"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>

        <p className="redirect-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}