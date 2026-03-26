import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  const location = useLocation()
  const [clubsOpen, setClubsOpen] = useState(false)
  const clubsRef = useRef(null)
  const menuRef = useRef(null);       // ✅ fix 1
  const [menuOpen, setMenuOpen] = useState(false);  // ✅ fix 2

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  const user = JSON.parse(localStorage.getItem("user"));
  {user?.role === "admin" && (
  <Link to="/admin">Admin Panel</Link>
  )}
  const navigate = useNavigate();
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  useEffect(() => {
    function onDocClick(e) {
      if (!clubsRef.current) return
      if (clubsOpen && !clubsRef.current.contains(e.target)) setClubsOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [clubsOpen])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleEventsClick(e) {
    if (location.pathname !== '/') return
    const el = document.getElementById('events')
    if (!el) return
    e.preventDefault()
    const navbarHeight = 100
    window.scrollTo({ top: el.offsetTop - navbarHeight, behavior: 'smooth' })
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <span className="logo-icon">
          <img src="/a.jpeg" alt="" />
        </span>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            <i className="fa-solid fa-house"></i> Home
          </NavLink>
        </li>
        <li>
          <a href="#events" className="eve" onClick={handleEventsClick}>
            <i className="fa-solid fa-calendar-days"></i> Events
          </a>
        </li>
        <li>
          <NavLink to="/registration" className={({ isActive }) => (isActive ? 'active' : '')}>
            <i className="fa-solid fa-clipboard-list"></i> Registrations
          </NavLink>
        </li>

        <li className="clubs-dropdown" ref={clubsRef}>
          <a
            href="#"
            id="cluzx"
            onClick={(e) => {
              e.preventDefault()
              setClubsOpen((v) => !v)
            }}
          >
            <i className="fa-solid fa-users"></i> Clubs
          </a>

          <div id="clubs-bar" className={`clubs-bar ${clubsOpen ? 'active' : ''}`}>
            <ul>
              <li>Technical Board</li>
              <li>Sports Club</li>
              <li>Cultural Board</li>
              <li>OSS Club</li>
              <li>E-Cell Club</li>
              <li>EV Club</li>
              <li>Robotics Club</li>
              <li>RND Club</li>
              <li>Spritual Club</li>
              <li>Press and Media Club</li>
              <li>ISDF Club</li>
              <li>Trinity Club</li>
              <li>Cycling Club</li>
              <li>Fine & Arts Club</li>
              <li>Nature Club</li>
            </ul>
          </div>
        </li>

        <li>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>
            <i className="fa-solid fa-envelope"></i> Contact
          </NavLink>
        </li>
      </ul>

      <div className="search-box">
        <input type="text" placeholder="Search..." />
        <i className="fa-solid fa-magnifying-glass"></i>
      </div>

   <div className="auth-buttons">
  {user ? (
    <div className="user-menu" ref={menuRef}>
      
      {/* 👤 Username */}
      <span
        className="username"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        👤 {user.name} ▼
      </span>

      {/* 🔽 DROPDOWN */}
      {menuOpen && (
        <div className="dropdown">

          {/* 👤 NORMAL USER */}
          {user.role !== "admin" && (
            <Link to="/my-registrations">My Registrations</Link>
          )}

          {/* 👑 ADMIN */}
          {user.role === "admin" && (
            <Link to="/admin">Admin Dashboard</Link>
          )}

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  ) : (
    <>
      <Link to="/login">Login</Link>
      <Link to="/signup">Signup</Link>
    </>
  )}
</div>
     
      <button
        id="theme-toggle"
        className="theme-toggle"
        onClick={() => setIsDark((v) => !v)}
        aria-label="Toggle theme"
      >
        <i className={isDark ? 'fas fa-sun' : 'fas fa-moon'}></i>
      </button>
    </nav>
  )
}

