import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

export default function Home() {
  const images = useMemo(
    () => [
      { src: '/1.jpeg', alt: 'Event 1' },
      { src: '/2.jpeg', alt: 'Event 2' },
      { src: '/3.jpeg', alt: 'Event 3' },
      { src: '/4.jpeg', alt: 'Event 4' },
      { src: '/5.jpeg', alt: 'Event 5' },
      { src: '/7.jpeg', alt: 'Event 6' },
      { src: '/8.jpeg', alt: 'Event 7' }
    ],
    []
  )

  const [lightboxSrc, setLightboxSrc] = useState(null)

  return (
    <div>
      <Navbar />

      <div className="video-banner">
        <video autoPlay muted loop>
          <source src="/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="overlay"></div>
        <div className="hero-text">
          <h1 className="animate-text">Welcome to Fiestura</h1>
          <p className="animate-sub">Learn | Experience | Celebrate</p>
        </div>
      </div>

      <section id="events" className="card-section">
        <Link to="/ongoing" className="card blue">
          <h2>OnGoing Events...</h2>
          <p>Hurry up ! Join fast</p>
          <div className="video-container">
            <video autoPlay muted loop>
              <source src="/video1.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <span className="explore">
            Explore more <i className="fa-solid fa-arrow-right"></i>
          </span>
        </Link>

        <Link to="/upcoming" className="card orange">
          <h2>UpComing Events...</h2>
          <p>Coming Soon !</p>
          <div className="video-container">
            <video autoPlay muted loop>
              <source src="/video2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </Link>

        <Link to="/past" className="card purple">
          <h2>Past Events...</h2>
          <p>Recall the memories !</p>
          <div className="video-container">
            <video autoPlay muted loop>
              <source src="/video3.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <span className="explore">
            Explore more <i className="fa-solid fa-arrow-right"></i>
          </span>
        </Link>
      </section>

      <div className="main-gallery">
        <h2 className="gallery-grid">GALLERY</h2>
      </div>

      <section className="gallery">
        {images.map((img) => (
          <div key={img.src} className="grid-item">
            <img
              src={img.src}
              alt={img.alt}
              onClick={() => setLightboxSrc(img.src)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setLightboxSrc(img.src)
              }}
            />
          </div>
        ))}
      </section>

      <div
        id="lightbox"
        className="lightbox"
        style={{ display: lightboxSrc ? 'block' : 'none' }}
        onClick={(e) => {
          if (e.target.id === 'lightbox') setLightboxSrc(null)
        }}
      >
        <span className="close" onClick={() => setLightboxSrc(null)}>
          &times;
        </span>
        <img className="lightbox-content" id="lightbox-img" src={lightboxSrc || ''} alt="" />
      </div>

      <h2 className="join">Join The Community</h2>
      <div className="community-card">
        <div className="community-content">
          <h3>Welcome to Eventura!</h3>
          <p>
            Stay updated with the latest announcements, event details, and exclusive insights from{' '}
            <span>Our Fest</span>, our premier annual celebration of innovation! Experience
            creativity, dynamic energy, and cutting-edge technology. Be part of the excitement—this
            is where breakthroughs happen!
          </p>
          <a
            href="https://chat.whatsapp.com/BWLwH9a4vNAHxAuPs4crBB?mode=ems_copy_t"
            target="_blank"
            rel="noreferrer"
            className="join-btn"
          >
            💬 Join WhatsApp Channel
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}

