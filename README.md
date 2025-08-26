
# 🦆 Network Address Practice - React Edition

A modern React application for learning and practicing network address identification. Students can identify IPv4, IPv6, MAC addresses, and invalid address formats through interactive quizzes with a duck-themed progression system.

## 🚀 Features

- **Interactive Quiz**: Identify different types of network addresses
- **Address Types**: IPv4, IPv6, MAC addresses, and invalid formats
- **Progression System**: Duck-themed levels from "Network Newbie" 🥚 to "Golden Gateway Guru" 🪿👑
- **Streak Tracking**: Visual streak counter with emoji representations
- **Score Analytics**: Detailed statistics by address type and overall performance
- **Keyboard Shortcuts**: Use keys 1-4 for quick answer selection
- **Hint System**: Built-in reference guide for address formats
- **Navigation Hub**: Links to other GCSE Computer Science practice tools

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **TanStack React Router** (file-based routing)
- **Tailwind CSS** (utility-first styling)
- **Vite** (build tool with SWC)
- **Vitest** (testing framework)
- **Biome** (linting and formatting)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IPorMAC-React
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Check code quality
- `npm run format` - Format code
- `npm run type-check` - Check TypeScript types
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Check code quality
- `npm run format` - Format code
- `npm run type-check` - Check TypeScript types

## 🎯 How to Use

### Playing the Quiz

1. **View the Address**: A network address will be displayed in the blue panel
2. **Choose Answer Type**: Click one of the four options or use keyboard shortcuts:
   - **1** for IPv4
   - **2** for IPv6  
   - **3** for MAC
   - **4** for None (invalid address)
3. **Get Feedback**: See if you're correct and learn why
4. **Continue**: Click "Next Question" or press Enter/Space to continue
5. **Track Progress**: View your streak and access detailed statistics

### Understanding Address Types

- **IPv4**: 4 decimal numbers (0-255) separated by dots
  - Example: `192.168.1.1`
- **IPv6**: 8 groups of 4 hex digits separated by colons
  - Example: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`
- **MAC**: 6 pairs of hex digits separated by colons or dashes
  - Example: `00:1A:2B:3C:4D:5E`
- **Invalid**: Addresses that don't follow proper formatting rules

### Level Progression

Progress through duck-themed levels based on your performance:
- 🥚 **Network Newbie** (0+ points, 0%+ accuracy)
- 🐣 **Address Apprentice** (5+ points, 0%+ accuracy)
- 🐤 **Protocol Paddler** (12+ points, 60%+ accuracy)
- 🦆 **Network Navigator** (25+ points, 70%+ accuracy)
- 🦆✨ **Packet Pond Master** (50+ points, 80%+ accuracy)
- 🪿👑 **Golden Gateway Guru** (75+ points, 90%+ accuracy)

## 🔧 Project Structure

```
src/
├── components/              # React components
│   ├── ui/                 # UI primitives (shadcn/ui)
│   ├── Footer.tsx          # Site footer
│   ├── Header.tsx          # Site header with navigation
│   ├── HintPanel.tsx       # Address format reference
│   ├── QuizButton.tsx      # Custom button component
│   ├── QuizLayout.tsx      # Main layout wrapper
│   ├── ScoreButton.tsx     # Score display button
│   ├── SimpleQuizBody.tsx  # Quiz interface
│   ├── SiteNavigation.tsx  # Navigation menu
│   ├── StatsModal.tsx      # Statistics modal
│   └── index.ts            # Component exports
├── hooks/                  # Custom React hooks
│   ├── useQuizLogic.ts     # Quiz state management
│   └── index.ts            # Hook exports
├── lib/                    # Utilities and business logic
│   ├── addressGenerator.ts # Address generation logic
│   ├── navigationConfig.ts # Navigation configuration
│   ├── scoreManager.ts     # Score tracking and levels
│   ├── siteConfig.ts       # Site configuration
│   └── utils.ts            # Shared utilities
├── routes/                 # File-based routing
│   ├── __root.tsx          # Root layout
│   └── index.tsx           # Main quiz page
└── test/                   # Test files
```

## 🎨 Styling

This project uses Tailwind CSS for styling with:
- Responsive design for all screen sizes
- Gradient backgrounds and modern UI components
- Smooth transitions and hover effects
- Accessibility-focused design patterns

## 📊 Data Persistence

- **Local Storage**: Scores, streaks, and progress are saved locally
- **Statistics Tracking**: Performance broken down by address type
- **History**: Recent quiz attempts are tracked
- **Reset Option**: Users can reset all scores if needed

## 🧪 Testing

Run tests with:
```bash
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once
npm run test:ui     # Run tests with UI
```

## 🏗️ Architecture Highlights

### Component Library Structure
- **Reusable Components**: All components are generic and configurable via props
- **Site Configuration**: Centralized config in `siteConfig.ts` with hints and custom levels
- **Generic ScoreManager**: Accepts custom level systems for different quiz types
- **Absolute Imports**: Consistent `@/` imports throughout the codebase

### Key Features
- **Generic Quiz Logic**: `useQuizLogic` hook handles common quiz patterns
- **Configurable Hints**: Site-specific help content in configuration
- **Custom Level Systems**: Each site can define its own progression themes
- **Type Safety**: Full TypeScript coverage with proper interfaces

## 🔄 Migration from Legacy Version

This React version replaces the vanilla JavaScript version with:

### ✅ Maintained Features
- All original quiz functionality
- Duck-themed progression system
- Score tracking and statistics
- Keyboard shortcuts (1-4)
- Hint panel with address format rules
- Navigation to other GCSE CS tools
- Streak tracking with emoji visualization

### ⚡ Improvements
- Modern React architecture with TypeScript
- Generic, reusable component library
- Configurable site settings and level systems
- Better responsive design and accessibility
- Improved code maintainability and error handling
- Modern development tooling (Vite, Biome)
- Absolute import paths for better refactoring

## 🌐 Related Projects

This is part of a suite of GCSE Computer Science practice tools:
- [Data Units Converter](https://convertdataunits.netlify.app/)
- [Sorting Algorithm Visualizer](https://ocrsortvisualiser.netlify.app/)
- [Trace Table Practice](https://tracetablepractice.netlify.app/)
- [Programming Practice](https://input-output-practice.netlify.app/)
- [Boolean Algebra Practice](https://booleanalgebrapractice.netlify.app/)

## 📝 License

Created by [Mr Luther](https://mrluthercodes.netlify.app/) - 2025

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports

---

Happy learning! 🦆📚


