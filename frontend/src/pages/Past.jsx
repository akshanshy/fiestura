import '../styles/past.css'

export default function Past() {
  return (
    <div>
      <div className="header">
        <h1>
          <i className="fas fa-history"></i> Past Events
        </h1>
        <p>Relive the amazing moments and achievements!</p>
      </div>

      <div className="timeline-filter">
        <button className="timeline-btn active" data-year="all">
          All Years
        </button>
        <button className="timeline-btn" data-year="2025">
          2025
        </button>
        <button className="timeline-btn" data-year="2024">
          2024
        </button>
      </div>

      <div className="events-grid">
        <div className="event-card" data-year="2025">
          <div className="event-header">
            <div className="completed-badge">
              <i className="fas fa-check-circle"></i> COMPLETED
            </div>
            <h3 className="event-title">Inter-College Cricket Tournament</h3>
            <div>
              <i className="fas fa-calendar"></i> Aug 15-20, 2025
            </div>
            <div>
              <i className="fas fa-map-marker-alt"></i> Sports Complex
            </div>
          </div>
          <div className="event-content">
            <p className="event-description">
              A thrilling 5-day cricket tournament that showcased exceptional talent and unforgettable matches.
            </p>
            <div className="gallery-preview">
              <div className="gallery-item">
                <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150" alt="" />
              </div>
              <div className="gallery-item">
                <img src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=150" alt="" />
              </div>
              <div className="gallery-item">
                <img src="https://images.unsplash.com/photo-1593766827139-6c3e7fb2d43e?w=150" alt="" />
              </div>
              <div className="gallery-item">
                <img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150" alt="" />
                <div className="gallery-count">+127</div>
              </div>
            </div>
            <span className="view-all-gallery">View All Photos &amp; Videos</span>
            <div className="action-buttons">
              <button className="btn btn-gallery" onClick={() => alert('Gallery coming soon')}>
                <i className="fas fa-images"></i> View Gallery
              </button>
              <button className="btn btn-secondary" onClick={() => alert('Shared')}>
                <i className="fas fa-share"></i> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

