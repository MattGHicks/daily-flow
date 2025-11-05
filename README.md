# Daily Flow Dashboard

A modern, unified SaaS dashboard for managing your daily workflow, projects, tasks, and client communications. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Project Status: Active Development (Phase 3 - API Integration Complete)

### 🎯 Current Progress: 70% Complete

The core infrastructure and major integrations are complete. Currently working on feature enhancements and UX improvements.

---

## ✅ Completed Features

### Core Infrastructure
- ✅ **Next.js 16 App Router** - Modern React 19 with server components
- ✅ **TypeScript** - Full type safety across the application
- ✅ **Tailwind CSS + shadcn/ui** - Beautiful, consistent component library
- ✅ **Framer Motion** - Smooth animations and transitions
- ✅ **Prisma ORM + SQLite** - Local database for task persistence
- ✅ **Dark Theme** - Warm brown/tan color scheme with CSS variables

### Dashboard Pages

#### 1. Dashboard Overview (`/dashboard`)
- ✅ Real-time stats display
- ✅ Recent tasks list
- ✅ Upcoming events preview
- ✅ Daily briefing section
- ✅ Quick action cards

#### 2. Projects & Tasks (`/dashboard/projects` & `/dashboard/tasks`)
- ✅ **Monday.com API Integration** - Full bidirectional sync with Monday.com boards
- ✅ **Kanban Board** - Drag-and-drop task management with dnd-kit
- ✅ **Task Persistence** - Local SQLite database with Prisma ORM
- ✅ **CRUD Operations** - Create, read, update, delete tasks
- ✅ **Project Filtering** - Filter tasks by Monday.com projects
- ✅ **Task Details** - Priority, status, project assignment
- ✅ **Optimistic UI Updates** - Instant feedback with background sync

#### 3. Messages (`/dashboard/messages`)
- ✅ **Redmine API Integration** - Real-time sync with Redmine issues
- ✅ **Card Grid Layout** - Responsive 1-2-3 column layout
- ✅ **Smart Response Tracking** - Identifies messages needing response
- ✅ **Journal Comments** - Displays latest comment, not initial issue description
- ✅ **Author Detection** - Differentiates between your messages and client messages
- ✅ **Visual Indicators** - Orange highlighting for messages needing attention
- ✅ **Auto-refresh** - Updates every 2 minutes
- ✅ **5-minute Server Cache** - Reduces API load
- ✅ **Direct Links** - Click to open in Redmine

#### 4. Calendar (`/dashboard/calendar`)
- ✅ UI layout complete
- ⏳ Google Calendar API integration (planned)

#### 5. Analytics (`/dashboard/analytics`)
- ✅ UI layout with charts and stats
- ⏳ Real data integration (planned)

#### 6. Music Player (`/dashboard/music`)
- ✅ Spotify playback control interface
- ⏳ Spotify Web API integration (planned)

#### 7. Settings (`/dashboard/settings`)
- ✅ **API Configuration Panel** - Secure storage of API credentials
- ✅ **Encryption** - API keys encrypted before storage
- ✅ **Monday.com Settings** - API key + board selection
- ✅ **Redmine Settings** - URL + API key configuration
- ✅ **Real-time Validation** - Tests connections before saving

### Navigation & Layout
- ✅ **Collapsible Sidebar** - Smooth expand/collapse with hover
- ✅ **Breadcrumb Navigation** - Context-aware page trails
- ✅ **Responsive Design** - Mobile, tablet, desktop support
- ✅ **Animated Components** - Staggered fade-in animations

---

## 🚧 In Progress

### Phase 4: Smart Features & Enhancements
- ⏳ Command Palette (Cmd+K) - Universal quick actions
- ⏳ Time Tracking & Pomodoro Timer
- ⏳ Deadline System - Visual urgency indicators
- ⏳ Notification Hub - Unified alerts across integrations
- ⏳ Context Zones - Deep Work, Communication, Planning modes

---

## 🔮 Planned Features

### Phase 5: Advanced Integrations
- 📅 Google Calendar API - Event synchronization
- 🎵 Spotify Web API - Full playback control
- 📊 Analytics Dashboard - Real productivity insights
- 🔔 Push Notifications - Real-time alerts

### Phase 6: Intelligence Layer
- 🤖 Client Follow-up Intelligence - SLA tracking and reminders
- 📈 Weekly Review Automation - Automated productivity reports
- 🎯 Smart Task Prioritization - AI-assisted task ordering
- 📊 Custom Report Builder - Exportable insights

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16.0.1 (App Router)
- **React**: React 19
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **Animations**: Framer Motion
- **Drag & Drop**: dnd-kit
- **Icons**: Lucide React

### Backend & Database
- **API Routes**: Next.js Server Actions
- **ORM**: Prisma 6.x
- **Database**: SQLite (local) - ready to migrate to PostgreSQL
- **Encryption**: Node crypto module for API key storage

### External APIs (Integrated)
- ✅ **Monday.com REST API** - Project and task management
- ✅ **Redmine REST API** - Client message threads and issues

### External APIs (Planned)
- ⏳ Google Calendar API
- ⏳ Spotify Web API

---

## 📁 Project Structure

```
daily-flow-v2/
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── dev.db                     # SQLite database
├── src/
│   ├── app/
│   │   ├── api/                   # Next.js API routes
│   │   │   ├── monday/            # Monday.com integration
│   │   │   ├── redmine/           # Redmine integration
│   │   │   └── tasks/             # Task CRUD operations
│   │   ├── dashboard/             # Dashboard pages
│   │   │   ├── analytics/         # Analytics page
│   │   │   ├── calendar/          # Calendar view
│   │   │   ├── messages/          # Redmine messages (NEW)
│   │   │   ├── music/             # Spotify player
│   │   │   ├── projects/          # Kanban board
│   │   │   ├── settings/          # API settings (NEW)
│   │   │   ├── tasks/             # Task management (NEW)
│   │   │   ├── layout.tsx         # Dashboard layout
│   │   │   └── page.tsx           # Dashboard home
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx               # Landing page
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── features/              # Feature components
│   │   │   └── kanban/            # Kanban board
│   │   └── shared/                # Shared components
│   │       ├── sidebar.tsx        # Navigation sidebar
│   │       ├── dashboard-header.tsx
│   │       └── animated-container.tsx
│   ├── lib/
│   │   ├── api/                   # API client libraries
│   │   │   ├── monday.ts          # Monday.com client (NEW)
│   │   │   └── redmine.ts         # Redmine client (NEW)
│   │   ├── data/                  # Mock data
│   │   ├── animations.ts          # Framer Motion presets
│   │   ├── encryption.ts          # API key encryption (NEW)
│   │   ├── prisma.ts              # Prisma client (NEW)
│   │   └── utils.ts               # Utilities
│   └── types/
│       ├── message.ts             # Message thread types (NEW)
│       ├── task.ts                # Task types (NEW)
│       └── monday.ts              # Monday.com types (NEW)
├── .env                           # Environment variables (gitignored)
├── .env.example                   # Environment template
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd daily-flow-v2
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up the database**:
```bash
npx prisma generate
npx prisma db push
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

### Configuration

1. **Navigate to Settings** (`/dashboard/settings`)
2. **Configure Monday.com** (optional):
   - Enter your Monday.com API key
   - Select your board from the dropdown
3. **Configure Redmine** (optional):
   - Enter your Redmine instance URL
   - Enter your Redmine API key
4. **Save** - Credentials are encrypted and stored locally

---

## 🎨 Design System

### Color Palette
- **Background**: Dark brown (#2D2A26)
- **Primary**: Warm tan (#D4C5B0)
- **Secondary**: Medium brown (#8B7355)
- **Muted**: Lighter variants
- **Accent**: CSS variables for theme consistency

### Typography
- **Font**: System font stack (Inter, SF Pro, Segoe UI)
- **Headings**: Bold, warm tan color
- **Body**: Regular, muted foreground

### Components
All UI components from shadcn/ui with custom theme:
- Cards, Buttons, Inputs, Dropdowns
- Dialog, Drawer, Popover
- Tabs, Accordion, Collapsible
- Custom animated wrappers

---

## 📊 Database Schema

### Tasks Table
```prisma
model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String   // "todo", "in-progress", "done"
  priority    String?  // "low", "medium", "high"
  projectId   String?
  projectName String?
  mondayItemId String? @unique  // Synced with Monday.com
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### UserSettings Table
```prisma
model UserSettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  mondayApiKey    String?  // Encrypted
  mondayBoardId   String?
  redmineUrl      String?
  redmineApiKey   String?  // Encrypted
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 🔐 Security

- **API Key Encryption**: All API keys are encrypted using AES-256-CBC before storage
- **Environment Variables**: Sensitive data in `.env` (gitignored)
- **Type Safety**: Full TypeScript coverage prevents runtime errors
- **Input Validation**: Server-side validation on all API routes

---

## 📝 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma database GUI
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database

**📖 For detailed server management (start, stop, restart, troubleshooting), see [SERVER_MANAGEMENT.md](./SERVER_MANAGEMENT.md)**

---

## 🎯 Current Development Focus

### This Week (Completed)
- ✅ Redesigned Messages page with card grid layout
- ✅ Fixed Redmine journal fetching (latest comments)
- ✅ Enhanced visual distinction for messages needing response
- ✅ Improved sidebar navigation spacing

### Next Week (Planned)
- ⏳ Command Palette implementation
- ⏳ Google Calendar integration
- ⏳ Spotify Web API integration
- ⏳ Time tracking features

---

## 🐛 Known Issues

- None currently reported

---

## 📈 Changelog

### v0.3.0 (Current) - November 2025
- Added card-style grid layout for Messages page
- Implemented Redmine individual issue fetching for journal data
- Added visual indicators for messages needing response
- Improved author detection and display
- Enhanced sidebar navigation spacing

### v0.2.0 - November 2025
- Integrated Monday.com API
- Integrated Redmine API
- Added Settings page with encrypted credential storage
- Implemented task persistence with Prisma + SQLite
- Added auto-refresh for messages (2-minute interval)

### v0.1.0 - October 2025
- Initial project setup
- Core dashboard layout
- Kanban board UI
- Navigation system
- Dark theme implementation

---

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

---

## 📄 License

Private project - All rights reserved.

---

## 👨‍💻 Author

**Matt Hicks**
- Building a unified workflow dashboard to streamline project management, client communication, and daily productivity.

---

**Last Updated**: November 4, 2025
