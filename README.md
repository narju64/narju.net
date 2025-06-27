# Narju.net

A personal website showcasing interests, projects, and thoughts. Built with React, TypeScript, and Vite.

## 🚀 Features

- **Modern Tech Stack**: React 18 + TypeScript + Vite
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Type Safety**: Full TypeScript coverage for better development experience
- **Fast Development**: Hot module replacement and fast builds with Vite
- **Accessible**: Built with accessibility best practices
- **Extensible**: Easy to add new sections and pages

## 📁 Project Structure

```
narju.net/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Hero.tsx        # Hero section
│   │   ├── Sections.tsx    # Main navigation cards
│   │   ├── Projects.tsx    # Project showcase
│   │   └── Footer.tsx      # Footer component
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 🎯 Planned Pages

- **Homepage** (`/`) - Central hub with navigation to all sections
- **Music** (`/music`) - Musical tastes, favorite artists, playlists
- **Lists** (`/list`) - Rankings and lists
  - `/list/rappers` - Top rappers
  - `/list/nba` - NBA player rankings
  - `/list/movies` - Movie rankings
- **Blog** (`/blog`) - Thoughts and ideas
- **Books** (`/books`) - Reading list and recommendations
- **Vinyl** (`/vinyl`) - Vinyl collection and reviews

## 🎮 Projects

- **Echoes** (`echoes.narju.net`) - Web-based game (separate subdomain)

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

## 🎨 Customization

### Adding New Sections

1. **Create a new component** in `src/components/`
2. **Add the route** to your routing system
3. **Update navigation** in `Header.tsx`
4. **Add content** with consistent styling

### Styling

The project uses CSS modules and global styles:
- Global styles in `src/index.css`
- Component-specific styles can be added as needed
- Responsive design with CSS Grid and Flexbox
- Modern color palette and typography

### TypeScript Types

Key interfaces defined:
- `NavLink` - Navigation link structure
- `SectionCard` - Section card data
- `Project` - Project information

## 🔧 Technical Details

### Tech Stack
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS** - Styling with modern features

### Performance Optimizations
- Code splitting with React.lazy()
- Optimized bundle with Vite
- Efficient CSS with modern features
- Image optimization (when added)

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📄 License

Personal project - feel free to use as inspiration for your own site.

---

Built with ❤️ using React, TypeScript, and Vite. 