# Narju.net Website Structure Plan

## 🎯 Overview
This document outlines the current structure and planned development of narju.net, a personal website showcasing interests, projects, and thoughts.

## 🌳 Complete Website Hierarchy

```
🏠 Homepage
├── 🎨 Creative Works
│   ├── 🎵 Music 
│   │   ├── Beats
│   │   ├── Guitar
│   │   └── Hip-hop
│   ├── 🎨 Visual Art
│   │   ├── Digital art
│   │   ├── Traditional media
│   │   └── Photography
│   └── 🎬 Video Content
├── 📚 Collections
│   ├── 💿 Vinyl
│   ├── 📖 Books
│   └── 🃏 Trading Cards
├── 📋 Lists
│   ├── 🎵 Music
│   │   ├── Top artists
│   │   ├── Favorite albums
│   │   └── Best Hip-hop Albums
│   ├── 🏀 Sports
│   │   ├── NBA player rankings
│   │   └── All-time Athletes
│   ├── 🎬 Film & TV
│   │   ├── Top movies
│   │   └── TV show rankings
│   └── 💡 Influences
│       ├── Philosophy
│       └── Podcasters
├── 💻 Projects
│   ├── 🎮 Videogames
│   │   └── Echoes
│   ├── 📅 Orbital Calendar
│   ├── 🔤 Phonetic Alphabet
│   ├── 🌐 Conlang
│   └── ♟️ Chess Repertoire Tool (future)
├── 📝 Content
│   ├── 📄 Personal Docs
│   │   └── Speedcube algorithm
│   └── 📺 Curated Media
│       ├── Podcasts
│       ├── YouTube videos
│       ├── Memes
│       └── Articles
├── 🌟 Lifestyle
│   ├── ⏰ Routine
│   ├── 🍽️ Diet
│   └── 🏕️ Adventure
│       ├── Car living
│       ├── Hiking
│       └── Land & house
└── 🔗 Elsewhere
    ├── 🎵 Music Profiles
    ├── 📱 Social Media
    ├── 💼 Professional
    ├── 🎮 Gaming
    └── 💻 Software
```

## 📋 Current Structure (Implemented)

### ✅ Homepage (`/`)
- **Component**: `Sections.tsx` + `Projects.tsx`
- **Content**: 
  - Hero section with site introduction
  - Navigation cards to main sections
  - Projects showcase (currently Echoes)
- **Status**: ✅ Complete

### ✅ Orbital Calendar (`/OrbitalCalendar`)
- **Component**: `OrbitalCalendar.tsx`
- **Content**: Custom orbital calendar implementation
- **Status**: ✅ Complete

### ✅ Navigation Header
- **Component**: `Header.tsx`
- **Features**:
  - Brand logo linking to homepage
  - Navigation links to all main sections
  - Active state highlighting
- **Status**: ✅ Complete

## 🌳 New Website Structure (Revised)

### 🏠 Homepage (`/`)
**Purpose**: Central hub and introduction to all content

**Content**:
- Hero section with personal introduction
- Overview of main categories
- Featured content from each section
- Quick navigation to all areas

---

### 🎨 Creative Works (`/creative`)
**Purpose**: Showcase personal creative output and artistic interests

**Subcategories**:
```
/creative
├── /music
│   ├── Beats
│   ├── Guitar
│   ├── Hip-hop
├── /visual-art
│   ├── Digital art
│   ├── Traditional media
├── /video-content
│   ├── YouTube videos
```

**Components Needed**:
- `CreativeWorksPage.tsx` - Main creative works page
- `CreativeCard.tsx` - Work showcase cards
- `MediaGallery.tsx` - Image/video galleries
- `CreativeProcess.tsx` - Process documentation

---

### 📚 Collections (`/collections`)
**Purpose**: Curated collections of physical and digital items

**Subcategories**:
```
/collections
├── /vinyl
├── /books
└── /trading-cards
```

**Components Needed**:
- `CollectionsPage.tsx` - Main collections page
- `CollectionCard.tsx` - Item display cards
- `CollectionStats.tsx` - Statistics and progress
- `ReviewComponent.tsx` - Review system

---

### 📋 Lists (`/lists`)
**Purpose**: Rankings, favorites, and organized lists of interests

**Subcategories**:
```
/lists
├── /music
│   ├── Top artists
│   ├── Favorite albums
│   ├── Best Hip-hop Albums
├── /sports
│   ├── NBA player rankings
│   ├── All-time greats
├── /film-tv
│   ├── Top movies
│   ├── TV show rankings
└── /influences
    ├── Philosophy
    ├── Podcasters
└── /skills
    ├── Chess repertoires
    └── Speedcubing algorithms
```

**Components Needed**:
- `ListsPage.tsx` - Main lists page
- `ListCard.tsx` - Individual list display
- `RankingList.tsx` - Ranked items display
- `FilterControls.tsx` - List filtering and sorting

---

### 💻 Projects (`/projects`)
**Purpose**: Technical projects, tools, and interactive content

**Subcategories**:
```
/projects
├── /videogames
│   ├── Echoes
├── /orbital-calendar
└── /phonetic-alphabet
└── /conlang
```

**Components Needed**:
- `ProjectsPage.tsx` - Main projects page
- `ProjectCard.tsx` - Project showcase
- `ProjectDemo.tsx` - Interactive demos
- `TechnicalDocs.tsx` - Documentation

---

### 📝 Content (`/content`)
**Purpose**: Personal writing and curated media

**Subcategories**:
```
/content
├── 📄 Personal Docs
│   └── Speedcube algorithm
└── 📺 Curated Media
    ├── Podcasts
    ├── YouTube videos
    └── Articles
```

**Components Needed**:
- `ContentPage.tsx` - Main content page
- `ThoughtPost.tsx` - Individual thought post component
- `CuratedMediaPost.tsx` - Curated media post component
- `MarkdownRenderer.tsx` - Content rendering

---

### 🌟 Lifestyle (`/lifestyle`)
**Purpose**: Personal routines, habits, and life organization

**Subcategories**:
```
/lifestyle
├── /routine
│   ├── Daily routines
│   ├── Weekly schedules
└── /diet
    ├── Recipe collection
```