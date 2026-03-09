# UBlog Frontend

A modern web frontend for the UBlog application built with React, TypeScript, Vite, Tailwind CSS, and custom UI components.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Features

- User authentication (Login/Register)
- Blog post management (Create, Read, Update, Delete)
- User profile management
- JWT token authentication
- Responsive design
- Clean black/white/gray color scheme

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Backend API running on http://localhost:5555

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` if your backend API is running on a different URL:
```
VITE_API_BASE_URL=http://localhost:5555
```

3. Start development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
web/
├── src/
│   ├── components/
│   │   ├── ui/          # UI components (Button, Input, Card, etc.)
│   │   └── Navbar.tsx   # Navigation bar component
│   ├── lib/
│   │   ├── token.ts     # Token storage utilities
│   │   └── utils.ts     # Utility functions
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── PostList.tsx
│   │   ├── PostDetail.tsx
│   │   ├── CreatePost.tsx
│   │   ├── EditPost.tsx
│   │   └── Profile.tsx
│   ├── services/
│   │   ├── api.ts       # Axios instance setup
│   │   └── apiServices.ts # API service functions
│   ├── App.tsx          # Main app component with routing
│   └── main.tsx         # Entry point
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## API Integration

The frontend communicates with the backend API using RESTful endpoints:

### Authentication
- `POST /login` - User login
- `POST /v1/users` - User registration
- `PUT /refresh-token` - Refresh JWT token

### Posts
- `GET /v1/posts` - List all posts
- `GET /v1/posts/{postID}` - Get post details
- `POST /v1/posts` - Create new post
- `PUT /v1/posts/{postID}` - Update post
- `DELETE /v1/posts` - Delete posts

### Users
- `GET /v1/users/{userID}` - Get user details
- `PUT /v1/users/{userID}` - Update user profile
- `PUT /v1/users/{{userID}/change-password` - Change password

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Customizing Theme

Edit `src/index.css` to customize the color scheme:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... other variables */
}
```

## License

MIT
