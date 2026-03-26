export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3>Participate</h3>
          <ul>
            <li>
              <a href="#">Exhibitions</a>
            </li>
            <li>
              <a href="#">CA Portal</a>
            </li>
            <li>
              <a
                href="https://chat.whatsapp.com/BWLwH9a4vNAHxAuPs4crBB?mode=ems_copy_t"
                target="_blank"
                rel="noreferrer"
              >
                Join The Community
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Explore More</h3>
          <ul>
            <li>
              <a href="#">Past Talks</a>
            </li>
            <li>
              <a href="#">Shows</a>
            </li>
            <li>
              <a href="#">Workshops</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Reach Out To Us</h3>
          <ul>
            <li>
              <a href="#">Have Any Queries?</a>
            </li>
            <li>
              <a href="/contact">Contact Us</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-social">
        <a href="#">
          <i className="fa-brands fa-facebook"></i>
        </a>
        <a href="#">
          <i className="fa-brands fa-twitter"></i>
        </a>
        <a href="#">
          <i className="fa-brands fa-instagram"></i>
        </a>
        <a href="#">
          <i className="fa-brands fa-youtube"></i>
        </a>
      </div>

      <div className="footer-bottom">© 2025 Your Organization. All rights reserved.</div>
    </footer>
  )
}

