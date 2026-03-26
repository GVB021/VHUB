# 🎭 VHUB - Escola de Dublagem Platform

## 📋 Overview

A unified platform combining three web applications:
1. **Main App** (`/`) - Escola de Dublagem landing page with courses, enrollment
2. **Voz & Carreira** (`/voz-carreira`) - Career portal with AI-powered features
3. **UltimoHub** (`/ultimohub`) - Professional studio management system (development)

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
# Run all apps simultaneously
npm run dev

# Run individual apps
npm run dev:main          # Port 3000
npm run dev:voz-carreira  # Port 3001
npm run dev:ultimohub     # Custom port
```

### Production Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

Server runs on PORT 3000 (configurable via environment variable).

## 🏗️ Architecture

### Project Structure
```
escola-dublagem/
├── src/                           # Main app source
├── voz-&-carreira---portal-de-dublagem/  # Career portal
├── ultimohub/                     # Studio management (WIP)
├── server.js                      # Unified Express server
├── package.json                   # Unified dependencies
└── dist/                          # Build output
```

### Build Artifacts
- **Main App**: `dist/`
- **Voz & Carreira**: `voz-&-carreira---portal-de-dublagem/dist/`
- **UltimoHub**: `ultimohub/dist/` (not included in production build yet)

## 🌐 Routes

| Path | Application | Description |
|------|-------------|-------------|
| `/` | Main App | Landing page, courses, enrollment |
| `/voz-carreira/*` | Voz & Carreira | Career portal with AI features |
| `/ultimohub/*` | UltimoHub | Studio management (in development) |
| `/health` | Server | Health check endpoint |

## 🔧 Environment Variables

### Main App
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Voz & Carreira
```env
GEMINI_API_KEY=your_gemini_api_key
API_KEY=your_api_key
```

### Server
```env
PORT=3000
NODE_ENV=production
```

## 📦 Technologies

### Main Stack
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, Motion (Framer Motion)
- **Backend**: Express.js, Supabase
- **Build Tool**: Vite 6

### Key Dependencies
- `@supabase/supabase-js` - Database & Auth
- `motion` - Animations
- `lucide-react` - Icons
- `react-router-dom` - Routing
- `zustand` - State management
- `sonner` - Toast notifications

## 🎯 Features

### Main App
- ✅ Responsive landing page
- ✅ Course modules showcase
- ✅ Teacher profiles
- ✅ Student enrollment
- ✅ Admin panel
- ✅ Student dashboard
- ✅ Supabase integration

### Voz & Carreira
- ✅ AI-powered career guidance
- ✅ Course recommendations
- ✅ Portfolio builder
- ✅ Local storage for offline capability

### UltimoHub (WIP - Not in Production Build)
- 🚧 Professional studio management
- 🚧 Session recording
- 🚧 Real-time collaboration
- 🚧 Project management

## 🚀 Deployment

### Railway (Recommended)

1. **Connect Repository**
   - Link your Git repository to Railway

2. **Environment Variables**
   - Set all required environment variables in Railway dashboard

3. **Build Configuration**
   - Build Command: `npm run build`
   - Start Command: `node server.js`
   - Uses `nixpacks.toml` for build configuration

4. **Health Check**
   - Path: `/health`
   - Timeout: 300s

### Manual Deployment

```bash
# Build all apps
npm run build

# Start production server
NODE_ENV=production PORT=3000 node server.js
```

## 📊 Database Schema

Uses Supabase with the following tables:
- `students` - Student profiles
- `enrollments` - Course enrollments
- `modules` - Course modules
- `teachers` - Teacher profiles
- `testimonials` - Student testimonials
- `faqs` - Frequently asked questions
- `settings` - Application settings

## 🔐 Admin Access

Access admin panel at `/` and click "Área Restrita" or visit admin section directly.

**Hardcoded Admin Emails**:
- `borba.costelinha@gmail.com`
- `borbaggabriel@gmail.com`

Additional admins can be configured via Supabase settings.

## 🐛 Debugging

### Build Issues
```bash
# Clear cache
npm run cacheclean

# Fresh install
rm -rf node_modules package-lock.json
npm install
```

### Common Issues
1. **Module not found**: Run `npm install` to ensure all dependencies are installed
2. **Port already in use**: Change PORT environment variable
3. **Build fails**: Check individual app builds with `npm run build:main` or `npm run build:voz-carreira`

## 📝 Scripts

```json
{
  "dev": "Run all apps in development mode",
  "dev:main": "Run main app only",
  "dev:voz-carreira": "Run career portal only",
  "dev:ultimohub": "Run studio management only",
  "build": "Build all production apps",
  "build:main": "Build main app only",
  "build:voz-carreira": "Build career portal only",
  "build:ultimohub": "Build studio management only (not in prod)",
  "start": "Start production server",
  "clean": "Remove all build artifacts",
  "lint": "Type check with TypeScript",
  "cacheclean": "Clear build cache",
  "push": "Auto-commit and push to git"
}
```

## 🌟 Navigation

### Easy Navigation Between Apps
- Main App → Voz & Carreira: Click navigation link
- Voz & Carreira → Main App: Use back button or navigation
- All apps share the same server, enabling seamless transitions

### Server Configuration
The unified server (`server.js`) handles routing for all three apps:
- Serves static files from each app's `dist/` directory
- Handles SPA fallback routing
- Provides WebSocket support for UltimoHub
- Includes API endpoints for data operations

## 📈 Performance

### Build Optimization
- Code splitting with Vite
- Manual chunks for vendor libraries
- Tree shaking
- Minification
- Gzip compression enabled

### Runtime Optimization
- React 19 features
- Lazy loading
- Image optimization
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run dev`
5. Build with `npm run build`
6. Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For issues or questions, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2026-03-26  
**Node Version**: >=18.0.0
