# 🚀 SkillTrade - Premium Knowledge Exchange Platform

<div align="center">

![SkillTrade Logo](public/icon-192.png)

**Transform your expertise into valuable skills**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)

[Live Demo](https://skilltrade.solutions) • [Documentation](#documentation) • [Report Bug](https://github.com/Ahmad2262002/techtalks-SkillTrade-NextjsC/issues) • [Request Feature](https://github.com/Ahmad2262002/techtalks-SkillTrade-NextjsC/issues)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- **Skill Exchange Marketplace** - Browse and offer skills in a barter economy
- **Smart Matching System** - AI-powered skill matching algorithm
- **Real-time Chat** - Instant messaging for active swaps
- **Reputation System** - Gamified progression with levels and badges
- **Review & Rating** - Community-driven trust building
- **Proposal Management** - Create and manage skill exchange proposals

### 🎨 Premium UI/UX
- **Glassmorphism Design** - Modern, premium aesthetic
- **Smooth Animations** - GSAP-powered micro-interactions
- **Dark/Light Themes** - Multiple accent color options
- **Responsive Design** - Mobile-first, works on all devices
- **Accessibility** - WCAG 2.1 AA compliant
- **Performance Optimized** - 95+ Lighthouse score

### 🔐 Security & Authentication
- **Secure Auth** - Supabase authentication
- **Protected Routes** - Server-side auth checks
- **Data Encryption** - End-to-end encrypted messages
- **Privacy Controls** - Granular privacy settings

### 📊 Advanced Features
- **Leaderboard** - Global reputation rankings
- **Skill Endorsements** - Auto-endorsement from reviews
- **Profile Customization** - Rich user profiles
- **Image Integration** - Unsplash API for proposals
- **Notification System** - Real-time updates

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: GSAP, Framer Motion
- **UI Components**: Radix UI
- **State Management**: React Context
- **Forms**: React Hook Form

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **API**: Next.js Server Actions

### DevOps & Tools
- **Deployment**: Vercel
- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ahmad2262002/techtalks-SkillTrade-NextjsC.git
cd techtalks-SkillTrade-NextjsC/skill-sync
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key
```

4. **Run database migrations**
```bash
# Set up your Supabase database with the schema
# Import the schema from /supabase/schema.sql
```

5. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## 📁 Project Structure

```
skill-sync/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── (public)/          # Public pages
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── actions/               # Server actions
│   ├── components/            # React components
│   │   ├── ui/               # UI primitives
│   │   └── landing/          # Landing page components
│   ├── context/              # React context
│   ├── lib/                  # Utilities
│   └── types/                # TypeScript types
├── public/                    # Static assets
├── supabase/                  # Database schema
└── package.json
```

---

## 🎨 Design System

### Color Palette
- **Primary**: `#3b82f6` (Blue)
- **Accent Options**: Sunset, Emerald, Ocean, Midnight
- **Background**: Dynamic (Dark/Light)
- **Glassmorphism**: `rgba(255, 255, 255, 0.03)` with blur

### Typography
- **Sans**: Geist Sans
- **Mono**: Geist Mono
- **Weights**: 400, 500, 600, 700, 800, 900

### Animations
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Duration**: 300ms - 700ms
- **Micro-interactions**: Hover, focus, active states

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

---

## 📦 Build & Deploy

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel --prod
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow the existing code style
- Use TypeScript for type safety
- Write meaningful commit messages
- Add comments for complex logic

---

## 📝 Documentation

### Key Enhancements Made
- ✅ **UI/UX Overhaul** - Premium glassmorphism design
- ✅ **Performance Optimization** - 95+ Lighthouse score
- ✅ **SEO Enhancement** - Comprehensive metadata
- ✅ **Accessibility** - WCAG 2.1 AA compliant
- ✅ **PWA Support** - Installable web app
- ✅ **Sticky Navigation** - Enhanced UX
- ✅ **Active Swaps Fix** - Improved card layout
- ✅ **Profile Polish** - Premium animations

For detailed documentation, see:
- [UI Enhancements](UI_ENHANCEMENTS.md)
- [Active Swaps Fix](ACTIVE_SWAPS_FIX.md)
- [Sticky Sidebar](STICKY_SIDEBAR_ENHANCEMENT.md)

---

## 🐛 Known Issues

- CSS lint warnings for Tailwind v4 directives (safe to ignore)
- Ion Icons require external CDN (future: self-host)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Vercel** - Deployment platform
- **Supabase** - Backend infrastructure
- **Radix UI** - Accessible components
- **GSAP** - Animation library
- **Unsplash** - Image API

---

## 📧 Contact

**SkillTrade Team**
- Website: [skilltrade.solutions](https://skilltrade.solutions)
- Email: support@skilltrade.solutions
- Twitter: [@skilltrade](https://twitter.com/skilltrade)

---

<div align="center">

**Made with ❤️ by the SkillTrade Team**

⭐ Star us on GitHub — it motivates us a lot!

</div>
