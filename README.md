# Smith Works

A full-stack freelance marketplace connecting clients with skilled professionals. Built with the MERN stack and real-time communication.

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socketdotio&logoColor=white)

## Features

### For Clients (Hirers)
- ✅ Post jobs with budget, skills, and requirements
- ✅ Browse freelancer gigs and services
- ✅ Real-time chat with freelancers
- ✅ Review and accept proposals
- ✅ Role-based dashboard

### For Freelancers (Workers)
- ✅ Create gigs to showcase skills and services
- ✅ Browse and apply to job postings
- ✅ Submit proposals with custom pricing
- ✅ Real-time messaging with clients
- ✅ Track proposal status

### Technical Features
- 🔐 JWT cookie-based authentication
- 💬 Real-time messaging with Socket.IO
- 🎨 Minimal dark-mode UI
- 📱 Responsive design
- 🔄 RESTful API architecture

## Tech Stack

| Frontend | Backend | Database |
|----------|---------|----------|
| React 19 | Node.js | MongoDB |
| React Router | Express.js | Mongoose |
| Axios | Socket.IO | |
| React Toastify | JWT | |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/smith-works.git
cd smith-works
```

2. **Setup Backend**
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/smithworks
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

3. **Setup Frontend**
```bash
cd frontend
npm install
```

4. **Run the Application**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

5. **Open in browser**
```
http://localhost:5173
```

## Project Structure

```
smith-works/
├── backend/
│   ├── controllers/     # Route handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (Auth, Chat)
│   │   ├── pages/       # Page components
│   │   └── App.jsx      # Main app
│   └── index.html
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/users` - Register
- `POST /api/users/auth` - Login
- `POST /api/users/logout` - Logout
- `GET /api/users/profile` - Get profile

### Projects (Jobs)
- `GET /api/projects` - Get all jobs
- `GET /api/projects/:id` - Get job by ID
- `POST /api/projects` - Create job (Client)

### Gigs
- `GET /api/gigs` - Get all gigs
- `GET /api/gigs/:id` - Get gig by ID
- `POST /api/gigs` - Create gig (Freelancer)
- `GET /api/gigs/my` - Get my gigs

### Bids/Proposals
- `POST /api/bids` - Submit proposal
- `GET /api/bids/my` - Get my proposals
- `PUT /api/bids/:id/accept` - Accept proposal

### Chat
- `POST /api/chat` - Access/create chat
- `GET /api/chat` - Get all chats
- `POST /api/message` - Send message
- `GET /api/message/:chatId` - Get messages

## Screenshots

*Coming soon*

## License

MIT License - feel free to use this project for learning or building your own freelance platform.

## Author

**Rahul**

---

⭐ Star this repo if you found it helpful!
