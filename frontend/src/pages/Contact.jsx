import '../styles/contact.css'

export default function Contact() {
  return (
    <section id="contact" className="contact-section">
      <h2>Contact Us</h2>

      <div className="contact-container">
        <div className="contact-info">
          <h3>Get in Touch</h3>
          <p>
            <i className="fa-solid fa-envelope"></i> eventura@gmail.com
          </p>
          <p>
            <i className="fa-solid fa-phone"></i>+91 9368513866 <br /> +91 8887939760
          </p>
          <p>
            <i className="fa-solid fa-location-dot"></i> AIT Pune, India
          </p>
        </div>

        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows={5} required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </div>
    </section>
  )
}

