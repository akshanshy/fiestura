import '../styles/registration.css'

export default function Registration() {
  return (
    <div className="registration-box">
      <h2>Event Registration</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <input type="text" placeholder="Full Name" required />
        <input type="email" placeholder="Email" required />
        <select required defaultValue="">
          <option value="">Choose Event</option>
          <option>OnGoing</option>
          <option>Upcoming</option>
          <option>Past</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  )
}

