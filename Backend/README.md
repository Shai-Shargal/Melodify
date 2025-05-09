# Backend

This directory is reserved for the backend implementation of Melodify.

The backend technology stack and architecture are currently under consideration.

# Melodify Backend

This is the backend service for Melodify, handling data persistence, authentication, and API endpoints.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT for authentication
- YouTube Data API integration

## Project Structure

```
Backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── services/       # Business logic
│   └── utils/          # Utility functions
├── tests/              # Test files
├── .env.example        # Example environment variables
└── package.json        # Project dependencies
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Songs

- `GET /api/songs` - Get all songs
- `POST /api/songs` - Add a new song
- `GET /api/songs/:id` - Get song by ID
- `PUT /api/songs/:id` - Update song
- `DELETE /api/songs/:id` - Delete song

### Playlists

- `GET /api/playlists` - Get user's playlists
- `POST /api/playlists` - Create new playlist
- `GET /api/playlists/:id` - Get playlist by ID
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/melodify
JWT_SECRET=your_jwt_secret
YOUTUBE_API_KEY=your_youtube_api_key
```

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```
