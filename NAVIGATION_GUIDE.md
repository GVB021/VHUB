# 🧭 VHUB Navigation Guide

## Quick Navigation Reference

### From Main App (`/`)
```
Main Landing Page (/)
│
├─→ /voz-carreira          # Career Portal
├─→ /ultimohub            # Studio Management (Coming Soon)
├─→ /admin                # Admin Panel (Login Required)
└─→ /portal-do-aluno      # Student Dashboard (Login Required)
```

### Implemented Navigation Links

#### Main App Header
```tsx
// Located in src/App.tsx

<header className="fixed top-0 w-full z-50">
  <nav>
    <a href="#metodologia">Metodologia</a>
    <a href="#professores">Professores</a>
    <a href="#depoimentos">Depoimentos</a>
    <a href="#faq">FAQ</a>
    <button onClick={() => setIsLoginOpen(true)}>Portal do Aluno</button>
    <Button onClick={() => handleEnroll()}>Matricule-se</Button>
  </nav>
</header>
```

#### Footer Navigation
```tsx
// Located in src/App.tsx

<footer>
  <div>
    <h4>Links Rápidos</h4>
    <ul>
      <li><a href="#metodologia">Metodologia</a></li>
      <li><a href="#professores">Professores</a></li>
      <li><a href="#depoimentos">Depoimentos</a></li>
      <li><a href="#faq">FAQ</a></li>
    </ul>
  </div>
  <div>
    <button onClick={() => setIsAdminOpen(true)}>Área Restrita</button>
  </div>
</footer>
```

## 🔗 Adding Cross-App Navigation

### Method 1: Direct Links (Recommended for Production)

Update `src/App.tsx` to add cross-app navigation:

```tsx
// Add to header navigation
<nav className="hidden md:flex items-center gap-8">
  <a href="#metodologia" className="text-sm font-medium">Metodologia</a>
  <a href="#professores" className="text-sm font-medium">Professores</a>
  <a href="#depoimentos" className="text-sm font-medium">Depoimentos</a>
  <a href="#faq" className="text-sm font-medium">FAQ</a>
  
  {/* NEW: Add Cross-App Links */}
  <a href="/voz-carreira" className="text-sm font-medium text-blue-400">
    🎤 Voz & Carreira
  </a>
  {/* Future: When UltimoHub is ready */}
  {/* <a href="/ultimohub" className="text-sm font-medium text-purple-400">
    🎬 Studio Hub
  </a> */}
</nav>
```

### Method 2: Navigation Component (Advanced)

Create a shared navigation component:

```tsx
// src/components/CrossAppNav.tsx

import { Home, Briefcase, Building2 } from 'lucide-react';

export function CrossAppNav() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
      <a 
        href="/" 
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
        title="Escola de Dublagem"
      >
        <Home className="w-4 h-4" />
        <span className="text-sm font-medium">Escola</span>
      </a>
      
      <div className="w-px h-4 bg-white/10" />
      
      <a 
        href="/voz-carreira" 
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
        title="Portal de Carreira"
      >
        <Briefcase className="w-4 h-4" />
        <span className="text-sm font-medium">Carreira</span>
      </a>
      
      {/* Uncomment when UltimoHub is ready */}
      {/* <div className="w-px h-4 bg-white/10" />
      
      <a 
        href="/ultimohub" 
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-50 cursor-not-allowed"
        title="Studio Hub (Em Breve)"
      >
        <Building2 className="w-4 h-4" />
        <span className="text-sm font-medium">Studio</span>
      </a> */}
    </div>
  );
}
```

Then add to header:

```tsx
// In src/App.tsx
import { CrossAppNav } from './components/CrossAppNav';

// Inside header
<header className="fixed top-0 w-full z-50">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3">...</div>
      
      {/* Cross-App Navigation */}
      <CrossAppNav />
    </div>
    
    {/* Rest of header */}
  </div>
</header>
```

## 🎨 Styled Navigation Menu

### Option A: Dropdown Menu

```tsx
// Add to header
<div className="relative group">
  <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
    <span>Plataformas</span>
    <ChevronDown className="w-4 h-4" />
  </button>
  
  <div className="absolute top-full left-0 mt-2 w-64 bg-black/95 border border-white/10 rounded-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl">
    <a href="/" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
        <Home className="w-5 h-5 text-blue-400" />
      </div>
      <div>
        <p className="font-bold text-white">Escola de Dublagem</p>
        <p className="text-xs text-gray-400">Cursos e matrículas</p>
      </div>
    </a>
    
    <a href="/voz-carreira" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
        <Briefcase className="w-5 h-5 text-purple-400" />
      </div>
      <div>
        <p className="font-bold text-white">Voz & Carreira</p>
        <p className="text-xs text-gray-400">Portal de carreira com IA</p>
      </div>
    </a>
    
    <div className="px-4 py-3 opacity-50 cursor-not-allowed">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="font-bold text-white">UltimoHub</p>
          <p className="text-xs text-gray-400">Em breve...</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Option B: Floating Action Button

```tsx
// Add fixed button at bottom-right
<div className="fixed bottom-8 right-8 z-50">
  <div className="relative group">
    <button className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
      <Menu className="w-6 h-6 text-white" />
    </button>
    
    <div className="absolute bottom-full right-0 mb-4 w-56 bg-black/95 border border-white/10 rounded-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
      <div className="p-3 border-b border-white/10">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Navegação Rápida</p>
      </div>
      
      <a href="/" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5">
        <Home className="w-5 h-5 text-blue-400" />
        <span className="text-sm font-medium text-white">Escola</span>
      </a>
      
      <a href="/voz-carreira" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5">
        <Briefcase className="w-5 h-5 text-purple-400" />
        <span className="text-sm font-medium text-white">Carreira</span>
      </a>
    </div>
  </div>
</div>
```

## 🔧 Server-Side Navigation Support

The server (`server.js`) already handles all navigation:

```javascript
// Main App
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Voz & Carreira with SPA fallback
app.get('/voz-carreira/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'voz-&-carreira---portal-de-dublagem', 'dist', 'index.html'));
});

// UltimoHub with SPA fallback (when ready)
app.get('/ultimohub/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'ultimohub', 'client', 'dist', 'index.html'));
});
```

## 📱 Mobile Navigation

### Hamburger Menu with Cross-App Links

```tsx
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// Mobile menu button
<button 
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  className="md:hidden p-2"
>
  <Menu className="w-6 h-6" />
</button>

// Mobile menu
{isMobileMenuOpen && (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed inset-0 bg-black/95 z-40 md:hidden overflow-y-auto"
  >
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-white">Menu</h2>
        <button onClick={() => setIsMobileMenuOpen(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* App Navigation */}
      <div className="space-y-2 mb-8">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Plataformas</p>
        
        <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5">
          <Home className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-white">Escola de Dublagem</span>
        </a>
        
        <a href="/voz-carreira" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5">
          <Briefcase className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-white">Voz & Carreira</span>
        </a>
      </div>
      
      {/* Page Navigation */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Navegação</p>
        
        <a href="#metodologia" className="block px-4 py-3 rounded-xl hover:bg-white/5">
          <span className="font-medium text-white">Metodologia</span>
        </a>
        <a href="#professores" className="block px-4 py-3 rounded-xl hover:bg-white/5">
          <span className="font-medium text-white">Professores</span>
        </a>
        <a href="#depoimentos" className="block px-4 py-3 rounded-xl hover:bg-white/5">
          <span className="font-medium text-white">Depoimentos</span>
        </a>
        <a href="#faq" className="block px-4 py-3 rounded-xl hover:bg-white/5">
          <span className="font-medium text-white">FAQ</span>
        </a>
      </div>
      
      {/* Actions */}
      <div className="mt-8 space-y-3">
        <Button onClick={() => setIsLoginOpen(true)} className="w-full">
          Portal do Aluno
        </Button>
        <Button onClick={() => handleEnroll()} className="w-full bg-blue-600">
          Matricule-se
        </Button>
      </div>
    </div>
  </motion.div>
)}
```

## 🎯 Implementation Checklist

- [ ] Add cross-app links to main header
- [ ] Add cross-app links to mobile menu
- [ ] Add app switcher dropdown (optional)
- [ ] Add floating navigation button (optional)
- [ ] Test navigation on all devices
- [ ] Add active state indicators
- [ ] Implement breadcrumbs (optional)
- [ ] Add keyboard shortcuts (optional)

## 🚀 Quick Implementation

**Minimal Change - Add to Header:**

```tsx
// In src/App.tsx, find the header navigation and add:
<a 
  href="/voz-carreira" 
  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
>
  <Briefcase className="w-4 h-4" />
  Voz & Carreira
</a>
```

**That's it!** Users can now navigate between apps easily.

## 📊 Navigation Analytics (Future)

Consider adding analytics to track cross-app navigation:

```tsx
const handleAppNavigation = (targetApp: string) => {
  // Analytics tracking
  if (typeof gtag !== 'undefined') {
    gtag('event', 'app_navigation', {
      from: 'main',
      to: targetApp,
      timestamp: new Date().toISOString()
    });
  }
  
  // Navigate
  window.location.href = `/${targetApp}`;
};
```

---

**Next Steps:**
1. Choose a navigation style from above
2. Implement in `src/App.tsx`
3. Test on mobile and desktop
4. Deploy to Railway

**Remember:** All apps are already connected via the unified server - you just need to add the UI links!
