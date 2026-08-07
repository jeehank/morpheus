# MorpheusPrep — IMDb & IGDB Media Entertainment Platform

Welcome to **MorpheusPrep**, a modern, high-performance web application for exploring Movies, TV Shows, and Video Games, built with React, TypeScript, Vite, Supabase, TMDB API, and IGDB API.

---

## 📁 Project File Structure & Functionality Guide

Here is a complete breakdown of every file in the project and what it does:

### ⚙️ Root Configuration Files
- [`index.html`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/index.html) — HTML entry point. Includes Google Fonts (`Inter` and `Orbitron` bold typography).
- [`vite.config.ts`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/vite.config.ts) — Vite build configuration for development server and production bundler.
- [`tsconfig.json`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/tsconfig.json) — TypeScript compiler configuration for strict type-checking.
- [`package.json`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/package.json) — Project dependencies (React 18, Lucide React icons, Supabase JS client, Vite, TypeScript).
- [`.env`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/.env) — Environment variables containing Supabase API keys and Turnstile site keys.

---

### 🎨 Main Application Entry & Global Styles
- [`src/main.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/main.tsx) — Mounts the React application root into the DOM.
- [`src/App.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/App.tsx) — Main layout wrapper containing state management for active page routing, authentication modals, search drawer, AI assistant drawer, and global notifications.
- [`src/index.css`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/index.css) — Master CSS design system. Defines color tokens (`--brand-orange`, `--bg-dark`), Orbitron typography rules, stagger fade-in keyframes, scrollbar styling, and custom animations.
- [`src/App.css`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/App.css) — Additional layout utility CSS classes for grids, flex rows, and media cards.
- [`src/types.ts`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/types.ts) — TypeScript interfaces and types for `Movie`, `Game`, `Review` (including 5-category star breakdown), `UserAccount`, `WatchProvider`, `CastMember`, `ReviewReport`, and `ChatMessage`.

---

### 🌐 Services (`src/services/`)
- [`src/services/tmdbApi.ts`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/services/tmdbApi.ts) — Fetch service for The Movie Database (TMDB) API. Loads trending movies, top 250 movies, now playing, upcoming releases, credits/cast, watch providers, and official YouTube trailers.
- [`src/services/thegamesdbApi.ts`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/services/thegamesdbApi.ts) — Fetch service for IGDB Video Games API proxy. Query builder for top-rated, trending, and 2026 upcoming game titles with fallback offline games and YouTube trailer mapping.
- [`src/services/supabaseClient.ts`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/services/supabaseClient.ts) — Supabase database and auth service. Manages user registration (strictly enforcing 1 account per IP address), login, session persistence, email verification, review submission, profanity filtering, report handling, watchlist sync, and admin user management.
- [`src/services/firebaseClient.ts`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/services/firebaseClient.ts) — Secondary authentication and database service (Firebase integration).
- [`src/services/profanityFilter.ts`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/services/profanityFilter.ts) — Bad-word filter utility that scans review content and headlines against prohibited terms before submission.
- [`src/services/geminiService.ts`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/services/geminiService.ts) — Google Gemini AI service integration for media recommendations and conversational assistant answers.
- [`src/services/ollamaService.ts`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/services/ollamaService.ts) — Ollama local AI model fallback handler for offline AI recommendations.

---

### 🧩 Components (`src/components/`)
- [`src/components/Navbar.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/components/Navbar.tsx) — Top navigation bar featuring logo wordmark, search bar dropdown with real-time results, library link, AI assistant trigger button, language selector, and user account avatar menu.
- [`src/components/MediaCard.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/components/MediaCard.tsx) — Reusable poster card component for movies and games with hover zoom effect, rating badge, bookmark button, and click handler to view detail page.
- [`src/components/CapybaraLoader.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/components/CapybaraLoader.tsx) — Custom animated loading component inspired by Uiverse Novaxlo. Used across all pages during data fetching.
- [`src/components/CapybaraLoader.css`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/components/CapybaraLoader.css) — CSS keyframe animations for the Capybara loader.
- [`src/components/TurnstileCaptcha.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/components/TurnstileCaptcha.tsx) — Pixel-perfect Cloudflare Turnstile CAPTCHA widget simulation. Provides interactive human verification for auth forms without failing on Vercel or local host environments.
- [`src/components/ImdbHeroCarousel.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/components/ImdbHeroCarousel.tsx) — Hero banner carousel showcasing top trending movies/games with high-res backdrops, ratings, overview snippets, and quick action buttons.
- [`src/components/TrailerModal.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/components/TrailerModal.tsx) — Fullscreen modal popup embedding YouTube official trailers with fallback search buttons.
- [`src/components/AuthModal.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/components/AuthModal.tsx) — Authentication modal for User Sign In and Account Registration with CAPTCHA verification and client IP tracking.
- [`src/components/AiChatDrawer.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/components/AiChatDrawer.tsx) — Side drawer for AI entertainment assistant. Answers questions and suggests movies or games based on user mood.
- [`src/components/MenuDrawer.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/components/MenuDrawer.tsx) — Mobile menu drawer for easy navigation across top pages.
- [`src/components/PlatformLogos.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/components/PlatformLogos.tsx) — Renders digital platform icons (Steam, PlayStation, Xbox, Netflix, Prime Video, Disney+) on detail pages.

---

### 📄 Pages (`src/pages/`)
- [`src/pages/HomePage.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/pages/HomePage.tsx) — Main landing page featuring the Hero Carousel, trending cinema, video games hub, Top 250 preview, and release schedule preview.
- [`src/pages/MoviesPage.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/pages/MoviesPage.tsx) — Cinema hub page displaying Popular Movies, Top Rated 250 Movies, In Theaters Now, and Upcoming Releases with staggered fade-in animations.
- [`src/pages/GamesPage.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/pages/GamesPage.tsx) — Video Games hub powered by IGDB. Features top PC & Console titles, trending games, and upcoming releases.
- [`src/pages/MediaDetailPage.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/pages/MediaDetailPage.tsx) — Complete media detail view showing backdrop, metadata, synopsis, cast, streaming platforms, official trailer player, reviews list, and review form. Enforces **email verification** before allowing reviews and includes a **5-category star breakdown** (Excitement, Suspense, Thrill, Storyline, Visuals).
- [`src/pages/Top250Page.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/pages/Top250Page.tsx) — Full Top 250 leaderboard with tabs to toggle between Top 250 Movies and Top 250 Video Games.
- [`src/pages/SchedulePage.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/pages/SchedulePage.tsx) — Release calendar page detailing upcoming 2026 movies and game release dates.
- [`src/pages/CelebsPage.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/pages/CelebsPage.tsx) — Popular actors and directors hub with profile photos and popular known-for works.
- [`src/pages/LibraryPage.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/pages/LibraryPage.tsx) — User personal library containing saved Watchlist titles and custom playlists.
- [`src/pages/AccountCenter.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/pages/AccountCenter.tsx) — User account settings page for profile management, password updates, and email verification handling.
- [`src/pages/AdminPanelPage.tsx`](file:///c:/Users/JEEHAN/Downloads/morpheusprep/src/pages/AdminPanelPage.tsx) — Administrator & moderator management panel for reviewing reported spoiler content, banning/unbanning users, and managing user roles.

---

## 🛠️ How to Run & Build

### Development Mode
```bash
npm run dev
```

### Production Build Verification
```bash
npm run build
```
