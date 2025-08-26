# Golf X - Track Your Game

A modern golf tracking Progressive Web App (PWA) built with React, TypeScript, and Ionic Framework following iOS design principles.

## 🚀 Live Deployments

- **Production**: [https://golf-x.fly.dev](https://golf-x.fly.dev)
- **Staging**: [https://golf-x-staging.fly.dev](https://golf-x-staging.fly.dev)

## ✅ Current Status

**Project is production-ready and deployed!** All core features are working:
- Google OAuth authentication ✅
- Environment configuration ✅
- CI/CD pipelines ✅
- TypeScript strict mode ✅
- Mobile-responsive design ✅

## Design Philosophy

This app strictly follows **Apple's Human Interface Guidelines** to ensure a native iOS experience across all platforms.

- **Primary Reference**: [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- **Detailed Guidelines**: See [DESIGN_GUIDELINES.md](./DESIGN_GUIDELINES.md)

## Features

- **Google Authentication**: Seamless sign-in with Google OAuth
- **Game Tracking**: Record rounds, scores, and statistics
- **Tournament Management**: Join and track tournaments
- **Profile Management**: Maintain your golf profile and handicap
- **iOS-Native Design**: Beautiful, intuitive interface following Apple's design language

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **UI Framework**: Ionic 8 React (iOS mode)
- **Router**: React Router v5 (Required by Ionic)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Build Tool**: Vite
- **Deployment**: Fly.io with Docker
- **CI/CD**: GitHub Actions
- **Styling**: CSS Variables + Ionic Theming

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn
- Supabase account (for backend)
- Fly.io account (for deployment)

## Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/Daniwax/golf-x.git
cd golf-x
git checkout develop  # Always work from develop branch
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

4. **Configure Supabase Authentication**
- Go to your Supabase dashboard
- Navigate to Authentication > Providers
- Enable Google provider with your Google OAuth credentials
- Navigate to Authentication > URL Configuration
- Add these redirect URLs:
  - `http://localhost:5173` (development)
  - `https://golf-x.fly.dev` (production)
  - `https://golf-x-staging.fly.dev` (staging)

5. **Run the development server**
```bash
npm run dev
```

## Project Structure

```
golf-x/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components (Login, Home, etc.)
│   ├── lib/            # Utilities and hooks
│   │   ├── supabase.ts # Supabase client configuration
│   │   └── useAuth.ts  # Authentication hook
│   ├── theme/          # CSS variables and theming
│   ├── App.tsx         # Main app component with routing
│   └── main.tsx        # Application entry point
├── public/             # Static assets
├── DESIGN_GUIDELINES.md # Detailed design documentation
└── README.md          # This file
```

## Available Scripts

### Development
- `npm run dev` - Start development server on port 5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types

### Code Quality
- `npm run check:deps` - Check for unused dependencies
- `npm run check:updates` - Check for package updates
- `npm run check:security` - Run security audit
- `npm run check:all` - Run all checks
- `npm run fix:audit` - Auto-fix security vulnerabilities

## Authentication Flow

The app uses Google OAuth exclusively for authentication:
1. User clicks "Continue with Google"
2. Redirects to Google sign-in
3. Returns to app with authentication token
4. Supabase manages session persistence


## License

MIT

## Support

For issues and feature requests, please use the GitHub issues tracker.