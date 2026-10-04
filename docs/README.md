# DAREDOWN - Architecture & Project Directory Structure

## Overview
DAREDOWN is a full-stack live Truth or Dare elimination tournament web application built with React 19, Vite, Express, and MongoDB.

---

## Directory Organization

```
daredownsite/
├── .env.example              # Environment variables template
├── index.html                # Vite HTML entrypoint shell with theme bootloader
├── vite.config.mjs           # Vite build and dev configuration
├── package.json              # Project dependencies and npm scripts
├── server.js                 # Express server & API routes
│
├── src/                      # React Application Source Code
│   ├── main.jsx              # React DOM root render
│   ├── App.jsx               # React Router route definitions
│   ├── components/           # UI Components
│   │   ├── index.js          # Barrel export for all components
│   │   ├── common/           # Shared components (Header, Footer, Loader, GenderSelector)
│   │   ├── home/             # Home page sections (Hero, Bracket, About, Rounds, Want In)
│   │   └── modals/           # Modal dialogs (VsScreenModal, ApplicationModal)
│   ├── context/              # React Context Providers
│   │   ├── index.js          # Barrel export for contexts
│   │   ├── ThemeContext.jsx  # Boy / Girl dual theme state & persistence
│   │   └── AuthContext.jsx   # Authentication state & session sync
│   ├── data/                 # Static JSON tournament data
│   │   ├── bracket_data.json
│   │   ├── challenges.json
│   │   ├── matches_details.json
│   │   └── site_settings.json
│   ├── pages/                # Page Views
│   │   ├── index.js          # Barrel export for pages
│   │   ├── HomePage.jsx
│   │   ├── ChallengesPage.jsx
│   │   ├── RulesPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── JudgePage.jsx
│   │   └── AdminPage.jsx
│   └── styles/               # Component & Page Stylesheets
│       ├── theme.css         # Core design system tokens (Boy & Girl)
│       ├── responsive.css    # Global responsive utilities
│       ├── ngc.css           # Challenges pool styles
│       ├── register.css      # Auth & register form styles
│       ├── profile.css       # Profile cabinet styles
│       ├── judge.css         # Host / Jury panel styles
│       └── admin.css         # Admin dashboard styles
│
├── public/                   # Static assets served directly by Vite/Express
│   ├── avatars/              # Contestant avatar assets
│   ├── logos/                # Partner & sponsor logos
│   ├── videos/               # Background video clips
│   ├── favicon.png           # Site favicon
│   ├── footer_newgen.svg     # Footer vector brand asset
│   ├── meta_img.jpg          # Social share preview image
│   ├── bracket_data.json     # Live bracket tournament tree
│   ├── challenges.json       # Approved Truth & Dare challenges
│   └── matches_details.json  # Participant match evaluation details
│
├── routes/                   # Express API Route Handlers
│   ├── auth.js               # Registration, Login, OAuth, Logout
│   ├── admin.js              # Admin metrics, user manager, bracket API
│   ├── tournament.js         # Public bracket data API
│   └── profile.js            # Contestant profile API
│
├── models/                   # Mongoose Data Models
│   ├── User.js               # Contestant & admin user schema
│   ├── TournamentBracket.js  # Bracket state schema
│   └── SecurityEvent.js      # Audit log & IP monitoring schema
│
├── middleware/               # Express Middlewares
│   ├── auth.js               # Role guard middleware
│   └── securityLogger.js     # Security event & IP logger
│
├── config/                   # Backend Configuration
│   ├── db.js                 # MongoDB connection & diagnostics
│   └── passport.js           # Passport local and OAuth strategies
│
├── scripts/                  # Automation & Utility Scripts
│   ├── fix_api_urls.js
│   ├── generate_neutral_bracket.js
│   └── maintenance/          # Maintenance, audit, and diagnostic scripts
│       ├── apply_avatar_fixes.js
│       ├── build_bundles.js
│       ├── check_all_avatars.js
│       ├── check_all_index_images.js
│       ├── check_images.js
│       ├── download_avatars.js
│       ├── inspect_participants.js
│       ├── render_bracket.js
│       ├── test_ip_environments.js
│       ├── test_reg.js
│       ├── update_index.js
│       └── verify_fixes_e2e.js
│
└── docs/                     # Documentation & Quality Assurance
    ├── README.md             # This document
    └── audit_screenshots/    # Visual regression testing snapshots
```

---

## Running the Project

### Development (Vite Dev Server)
```bash
npm run dev
```

### Full-Stack Server (Express Backend + API)
```bash
npm run server
```

### Production Build
```bash
npm run build
```
