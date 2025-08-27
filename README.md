# Black Hole - Creator Dashboard

A clean and modern creator dashboard built with Next.js 14, TypeScript, and Material-UI.

## 🚀 Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Library**: Material-UI v5
- **Styling**: Emotion (built-in with MUI)
- **State Management**: React Context API
- **Data Fetching**: SWR
- **Forms**: React Hook Form

## 📦 Dependencies

### Core
- `next`: ^14.0.4
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `typescript`: ^5.3.3

### UI & Styling
- `@mui/material`: ^5.15.0
- `@mui/icons-material`: ^5.15.0
- `@emotion/react`: ^11.11.1
- `@emotion/styled`: ^11.11.0
- `@emotion/cache`: ^11.11.0
- `@emotion/server`: ^11.11.0

### Utilities
- `swr`: ^2.2.4
- `react-hook-form`: ^7.48.2
- `date-fns`: ^2.30.0

## 🏗️ Project Structure

```
black-hole/
├── pages/                 # Next.js pages
│   ├── _app.tsx          # App wrapper with providers
│   ├── index.tsx         # Home page (redirects to dashboard)
│   ├── dashboard/        # Dashboard pages
│   ├── events/           # Event management pages
│   ├── organizers/       # Organizer management pages
│   ├── tickets/          # Ticket management pages
│   ├── transactions/     # Transaction pages
│   └── api/              # API routes
├── src/
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── layouts/          # Layout components
│   ├── services/         # API services
│   ├── theme/            # Theme configuration
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
└── public/               # Static assets
```

## 🎨 Theme

The project uses a clean Material-UI theme with:
- Light mode by default
- Primary color: #1976d2 (Blue)
- Secondary color: #dc004e (Red)
- Clean typography with Roboto font
- Responsive design

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint-fix` - Fix ESLint issues

## 🎯 Features

- **Clean Architecture**: Simplified codebase without template bloat
- **Responsive Design**: Works on desktop and mobile
- **Type Safety**: Full TypeScript support
- **Modern UI**: Material-UI components with clean design
- **Fast Development**: Hot reload and optimized build process

## 🔧 Customization

### Adding New Pages
1. Create a new file in `pages/` directory
2. Use `DashboardLayout` for consistent navigation
3. Add menu item in `src/layouts/DashboardLayout.tsx`

### Styling
- Use Material-UI's `sx` prop for component styling
- Create custom themes in `src/theme/base.ts`
- Use `styled` from `@emotion/styled` for complex components

### State Management
- Use React Context for global state
- Use SWR for server state management
- Use React Hook Form for form state

## 📱 Responsive Design

The dashboard is fully responsive with:
- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly interface
- Optimized for all screen sizes

## 🔒 Authentication

Authentication is handled through:
- `AuthContext` for global auth state
- `ProtectedRoute` component for route protection
- API routes for login/logout functionality

## 🎨 Design System

The project follows Material Design principles:
- Consistent spacing and typography
- Clear visual hierarchy
- Accessible color contrast
- Intuitive navigation patterns

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Follow Material-UI best practices
4. Test on multiple screen sizes
5. Ensure accessibility standards

## 📄 License

This project is licensed under the MIT License.
