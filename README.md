# Golf X - Track Your Game

A modern golf tracking application built with React, TypeScript, and Ionic Framework following iOS design principles.

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

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Ionic React (iOS mode)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Build Tool**: Vite
- **Styling**: CSS Variables + Ionic Theming

## Prerequisites

- Node.js
- npm or yarn
- Supabase account (for backend)

## Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/golf-x.git
cd golf-x
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

4. **Enable Google OAuth in Supabase**
- Go to your Supabase dashboard
- Navigate to Authentication > Providers
- Enable Google provider
- Add redirect URL: http://localhost:5173 (for development)

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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication Flow

The app uses Google OAuth exclusively for authentication:
1. User clicks "Continue with Google"
2. Redirects to Google sign-in
3. Returns to app with authentication token
4. Supabase manages session persistence

## Design Principles

- **Minimalist**: Clean, focused interface
- **iOS-Native**: Follows Apple HIG strictly
- **Responsive**: Works beautifully on all screen sizes
- **Dark Mode**: Automatic theme switching based on system preference

## Contributing

Please ensure all contributions follow the design guidelines in [DESIGN_GUIDELINES.md](./DESIGN_GUIDELINES.md).

## License

MIT

## Support

For issues and feature requests, please use the GitHub issues tracker.