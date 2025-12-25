# Desktop — A Web-Based Desktop Environment

A modern web-based desktop environment inspired by classic macOS and Windows, built with React, TypeScript. Features a familiar desktop interface with customizable themes. Works on all devices—desktop, tablet, and mobile.

## Features

### Desktop Environment

- Authentic macOS and Windows-style desktop interactions
- Multi-instance window manager with drag, resize, and minimize
- Customizable wallpapers (photos, patterns, or videos)
- System-wide sound effects
- Virtual file system with local storage persistence and backup/restore

### Themes

- **System 7** — Classic Mac OS look with top menubar and traffic-light controls
- **Aqua** — Mac OS X style with modern aesthetics
- **Windows XP** — Bottom taskbar, Start menu, and classic window controls
- **Windows 98** — Retro Windows experience with mobile-safe controls

### Built-in Applications

- **Finder** — File manager with Quick Access, storage info, and smart file detection
- **TextEdit** — Rich text editor with markdown, slash commands, and multi-window support
- **Paint** — Bitmap graphics editor with drawing tools, patterns, and import/export
- **Control Panels** — System preferences: appearance, sounds, backup/restore, and file system management

## Quick Start

1. Launch apps from the Finder, Desktop, or Apple/Start menu
2. Drag windows to move, drag edges to resize
3. Use Control Panels to customize appearance and sounds
4. Files auto-save to browser storage

## Project Structure

```
├── public/           # Static assets (icons, wallpapers, sounds, fonts)
├── src/
│   ├── apps/         # Individual app modules
│   ├── components/   # Shared React components (ui, dialogs, layout)
│   ├── config/       # Configuration files
│   ├── contexts/     # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Libraries and utilities
│   ├── stores/       # Zustand state management
│   ├── styles/       # CSS and styling
│   └── types/        # TypeScript definitions
```

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Text Editor:** TipTap
- **State:** Zustand
- **Storage:** IndexedDB, LocalStorage
- **Build:** Vite, Bun
- **Deployment:** Vercel

## Scripts

```bash
bun dev              # Start development server
bun run build        # Build for production
bun run lint         # Run ESLint
bun run preview      # Preview production build
```

## License

AGPL-3.0 — See [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please submit a Pull Request.
