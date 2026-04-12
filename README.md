Fiestura is a full-stack event management platform where users can explore events, register, and make payments, while admins can manage events and users efficiently.
🚀 Features
👤 User Features
Browse all events
Filter events by category (ongoing/upcoming)
Register for events
Secure login/signup (JWT आधारित authentication)
View registered events in dashboard
🧑‍💼 Admin Features
Create, update, delete events
View all users
Manage event registrations
Dashboard with event insights
💳 Payment Integration (Planned / In Progress)
Razorpay integration
Payment status tracking
Transaction storage
🛠️ Tech Stack
Frontend
React.js
Axios
Tailwind CSS / CSS
Backend
Node.js
Express.js
Database
MongoDB (Mongoose)
Other Tools
JWT Authentication
CORS
dotenv
📁 Project Structure

fiestura/
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── index.js
│
└── README.md
⚙️ Installation & Setup
1️⃣ Clone the repository
Bash
git clone https://github.com/your-username/fiestura.git
cd fiestura
2️⃣ Setup Backend
Bash
cd backend
npm install
Create a .env file:
Environment
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
PORT=5000
Run backend:
Bash
npm start
3️⃣ Setup Frontend
Bash
cd frontend
npm install
npm run dev
🌐 API Endpoints
Auth
POST /api/auth/register
POST /api/auth/login
Events
GET /events
POST /events (admin)
PUT /events/:id
DELETE /events/:id
Users
GET /api/users (admin)
🔄 Application Flow
User signs up / logs in
JWT token is generated
User browses events
Registers for an event
(Future) Makes payment
Data stored in MongoDB
Dashboard reflects user activity  

🔗 **Live:** https://fiestura.vercel.app  
