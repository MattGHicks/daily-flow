# Daily Flow Dashboard

A modern, unified SaaS dashboard for managing your daily workflow, projects, tasks, and client communications.

## Features

### ✅ Implemented (Phase 1-2)

- **Dashboard Overview**: Real-time stats, recent tasks, upcoming events, and daily briefing
- **Kanban Board**: Fully functional drag-and-drop project management with dnd-kit
- **Calendar View**: Upcoming events display (ready for Google Calendar integration)
- **Messages Hub**: Client message threads from Redmine (ready for API integration)
- **Music Player**: Spotify playback control interface (ready for API integration)
- **Analytics**: Productivity tracking and insights dashboard
- **Beautiful UI**: Dark theme with warm brown/tan accents, smooth animations via Framer Motion
- **Responsive Layout**: Sidebar navigation with animated components

### 🚧 Coming Next (Phase 3-4)

- **API Integrations**:
  - Monday.com API for project synchronization
  - Redmine API for client message threads
  - Google Calendar API for event sync
  - Spotify Web API for music playback

- **Smart Features**:
  - Command Palette (Cmd+K) for universal quick actions
  - Time Tracking & Pomodoro Timer
  - Smart Deadline System with visual urgency indicators
  - Client Follow-up Intelligence with SLA tracking
  - Unified Notification Hub
  - Context Zones (Deep Work, Communication, Planning modes)
  - Weekly Review Automation

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4 + shadcn/ui components
- **Animations**: Framer Motion
- **State Management**: React useState (will add TanStack Query + Zustand for API data)
- **Drag & Drop**: dnd-kit
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd daily-flow-v2
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
daily-flow-v2/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── dashboard/            # Dashboard pages
│   │   │   ├── analytics/
│   │   │   ├── calendar/
│   │   │   ├── messages/
│   │   │   ├── music/
│   │   │   ├── projects/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── features/             # Feature-specific components
│   │   │   └── kanban/           # Kanban board components
│   │   └── shared/               # Shared components
│   ├── lib/                      # Utilities
│   │   ├── animations.ts         # Framer Motion presets
│   │   └── utils.ts             # Helper functions
│   ├── types/                    # TypeScript definitions
│   ├── hooks/                    # Custom React hooks
│   └── stores/                   # State management
├── public/                       # Static assets
├── .env.example                 # Environment variables template
└── package.json
```

## Color Theme

Based on the provided design reference:

- **Background**: Dark brown (#2D2A26)
- **Primary**: Warm tan (#D4C5B0)
- **Secondary**: Medium brown (#8B7355)
- **Accent**: CSS variables for consistency

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Navigation

- **Dashboard**: Overview with stats, recent tasks, and daily briefing
- **Projects**: Kanban board for task management
- **Calendar**: Schedule and event management
- **Messages**: Client communication hub
- **Analytics**: Productivity insights and time tracking
- **Music**: Spotify playback control
- **Settings**: (Coming soon)

## Next Steps

1. **Set up environment variables** for API integrations:
   - Monday.com API key
   - Redmine API credentials
   - Google Calendar OAuth
   - Spotify Client ID/Secret

2. **Implement API integrations** using Next.js API routes

3. **Add authentication** with Clerk

4. **Set up database** with Supabase + Drizzle ORM

5. **Implement real-time features** with Pusher/Ably

## Contributing

This is a personal workflow dashboard. For questions or suggestions, feel free to reach out.

## License

Private project - All rights reserved.
