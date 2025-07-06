# Narju.net

A personal website showcasing creative works, collections, and thoughts. Built with React, TypeScript, and Vite.

## 🚀 Features

- **Modern Tech Stack**: React 18 + TypeScript + Vite
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Type Safety**: Full TypeScript coverage for better development experience
- **Fast Development**: Hot module replacement and fast builds with Vite
- **Accessible**: Built with accessibility best practices
- **Minimalist Design**: Clean, uncluttered interface focused on content

## 📁 Project Structure

```
narju.net/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx      # Navigation header with dropdowns
│   │   ├── Hero.tsx        # Hero section
│   │   ├── Sections.tsx    # Main navigation cards
│   │   ├── Projects.tsx    # Project showcase
│   │   ├── CurrentTask.tsx # Current task widget
│   │   ├── Routine.tsx     # Lifestyle routine system
│   │   ├── BeatsPlayer.tsx # Audio player for beats
│   │   ├── TraditionalArt.tsx # Art gallery
│   │   ├── OrbitalCalendar.tsx # Custom calendar
│   │   └── Footer.tsx      # Footer component
│   ├── utils/              # Utility functions
│   │   ├── orbitalCalendar.ts
│   │   ├── routineLogic.ts
│   │   └── routines.ts
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
│   ├── audio/beats/        # 40+ original beats
│   ├── images/visual-art/  # Traditional and graffiti art
│   └── favicon.png
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 🎯 Current Pages & Features

### ✅ Implemented

- **Homepage** (`/`) - Minimalist hub with current task and projects
- **Orbital Calendar** (`/projects/orbital-calendar`) - Custom calendar implementation
- **Routine System** (`/lifestyle/routine`) - Daily task and schedule management
- **Beats Player** (`/creative/music/beats`) - Audio player with 40+ original beats
- **Traditional Art** (`/creative/visual-art/traditional`) - Art gallery showcase
- **Podcasts** (`/content/curated-media/podcasts`) - Curated podcast recommendations

### 🔄 In Development

- **Lists System** - Rankings and organized collections with drag-and-drop
- **Collections Management** - Vinyl, books, and trading card catalogs
- **Phonetic Alphabet Project** - Custom IPA variant (nPA) with translation tools

## 🎨 Design Philosophy

- **Minimalist Approach**: Clean, uncluttered design focused on content
- **Content-First**: Substance over presentation
- **Simple Navigation**: Clear paths without overwhelming options
- **Personal Utility**: Built for personal use and organization

## 🛠️ Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd narju.net
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Netlify Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select this repository
   - Deploy settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Custom Domain**:
   - In Netlify dashboard, go to Site settings > Domain management
   - Add custom domain: `narju.net`
   - Update DNS records at your domain registrar to point to Netlify

### Environment Variables

Create a `.env` file for any environment-specific variables:

```env
VITE_SITE_URL=https://narju.net
VITE_ANALYTICS_ID=your-analytics-id
```

## 🎮 Projects

- **Echoes** (`echoes.narju.net`) - Web-based game (separate subdomain)
- **Orbital Calendar** - Custom calendar system
- **Phonetic Alphabet** - Custom IPA variant in development

## 🔧 Technical Details

### Tech Stack
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS** - Styling with modern features

### Performance Optimizations
- Code splitting with React.lazy()
- Optimized bundle with Vite
- Efficient CSS with modern features
- Audio and image optimization

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 📊 Content Assets

- **40+ Original Beats** - Complete audio collection
- **Traditional Art Gallery** - Personal artwork showcase
- **Graffiti Collection** - Street art photography
- **Routine System** - Daily task management
- **Orbital Calendar** - Custom time tracking

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📄 License

Personal project - feel free to use as inspiration for your own site.