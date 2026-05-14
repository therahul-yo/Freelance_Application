# Smith Works

A full-stack freelance marketplace connecting clients with skilled professionals. Built with the MERN stack, real-time messaging, and an Industrial Newspaper Brutalism design.

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socketdotio&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat&logo=render&logoColor=black)

## Live Demo

- **Frontend:** Vercel — `freelance-application-*.vercel.app`
- **Backend API:** Render — `https://freelance-application.onrender.com`

## Features

### For Clients
- Post jobs with budget, skills, and experience requirements
- Browse freelancer gig storefronts
- Review and accept proposals
- Real-time chat with freelancers
- Role-based dashboard with proposal tracking

### For Freelancers
- Create gig listings to showcase services
- Browse and apply to open job postings
- Submit proposals with custom pricing
- Real-time messaging with clients
- Track proposal and project status

### Technical
- JWT authentication via HTTP-only cookies (30-day expiry)
- Real-time messaging and notifications with Socket.IO
- Paginated API responses for projects and gigs
- Rate limiting on auth endpoints (20 req / 15 min)
- Role-based access control (client / freelancer / admin)
- SPA routing on Vercel via `vercel.json` rewrites
- CORS configured for all `*.vercel.app` origins

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router, Axios, Vite |
| Backend | Node.js, Express 5, Socket.IO |
| Database | MongoDB, Mongoose |
| Auth | JWT, HTTP-only cookies |
| Hosting | Vercel (frontend), Render (backend) |

## Design

Industrial Newspaper Brutalism — thick black borders, offset box shadows, zero border-radius, uppercase type.

- **Display font:** Bebas Neue
- **UI / mono font:** IBM Plex Mono
- **Body font:** Fraunces
- **Palette:** `#F2EFE9` paper · `#FFE500` yellow · `#0047FF` blue · `#FF2D55` red · `#0A0A0A` ink

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI

### Backend setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm start
```

Required env vars (see `backend/.env.example`):

```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smithworks
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
```

### Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

Then run:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Project Structure

```
SmithWorks/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth + rate limiting
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Token generation
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/  # Button, Input, Navbar, Skeleton, etc.
    │   ├── context/     # AuthContext, ChatContext, NotificationContext
    │   ├── lib/         # Axios instance
    │   ├── pages/       # Auth, Chat, Dashboard, Gig, Project, Profile
    │   ├── utils/       # Formatters
    │   ├── App.jsx      # Routes + Landing page
    │   ├── App.css      # Component styles
    │   └── index.css    # Design system tokens + global styles
    └── vercel.json      # SPA rewrite rule
```

## API Endpoints

### Auth / Users
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/users` | Register |
| POST | `/api/users/auth` | Login |
| POST | `/api/users/logout` | Logout |
| GET | `/api/users/profile` | Get own profile |

### Projects (Jobs)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List jobs (paginated) |
| GET | `/api/projects/:id` | Job detail |
| POST | `/api/projects` | Post a job (client) |

### Gigs
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/gigs` | List gigs (paginated) |
| GET | `/api/gigs/:id` | Gig detail |
| POST | `/api/gigs` | Create gig (freelancer) |
| GET | `/api/gigs/my` | My gigs |

### Proposals
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/bids` | Submit proposal |
| GET | `/api/bids/my` | My proposals |
| PUT | `/api/bids/:id/accept` | Accept proposal |

### Chat & Messages
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Open or create chat |
| GET | `/api/chat` | All chats |
| POST | `/api/message` | Send message |
| GET | `/api/message/:chatId` | Get messages |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | All notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Reviews
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/reviews` | Submit review |
| GET | `/api/reviews/user/:userId` | User reviews |

## License

MIT — free to use for learning or building your own freelance platform.

## Author

**Rahul** — [GitHub](https://github.com/therahul-yo)
