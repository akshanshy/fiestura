import { Link, useNavigate } from 'react-router-dom'
import '../styles/login.css'
import { useState } from 'react'
import axios from 'axios'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')


const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      'http://localhost:5000/auth/login',
      { email, password }
    );

    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", res.data.token);

    alert('Login successful 🎉');

    // ✅ ALWAYS go to home
    window.location.href = "/";

  } catch (err) {
    console.error(err);
    alert(err.response?.data || 'Login failed');
  }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Login to continue exploring Eventura</p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <i className="fa-solid fa-envelope"></i>
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <i className="fa-solid fa-lock"></i>
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="redirect-text">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}