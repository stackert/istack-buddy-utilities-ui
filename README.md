# iStack Buddy Client Take 2

A nested Next.js application designed to serve form functionality from a specific URL pattern while supporting development mode switching.

## Overview

This application is designed to be served from a subdirectory (`/public/form-marv/`) and handles specific URL patterns for form processing. It includes Redux state management, Material-UI theming, and development-friendly features.

## URL Structure

### Production

- Form MARV: `{HOST}/public/form-marv/{security-session-token}/{formId}`
- Example: `http://localhost:3501/public/form-marv/56082090-c3b3-4d1a-98b0-b3d8d295f72e/205600`

### Development

- Direct access: `http://localhost:3501/public/form-marv/demo-token/demo-form-id`
- App view: `http://localhost:3501/app` (development only)
- Automatic redirects from root (`/`) based on current view mode

## Features

### Core Functionality

- **Nested Application**: Serves content from subdirectory structure
- **Redux State Management**: Centralized state for theme, user, and app data
- **Material-UI Design System**: Professional minimal theme with dark/light switching
- **Route Protection**: 404 handling for non-matching routes
- **User Display**: Shows logged-in user information in header

### Development Features

- **View Mode Switching**: Toggle between "App View" and "Form MARV" view
- **Demo Data**: Automatic user setup in development mode
- **Development Controls**: Easy navigation between different views

## Technology Stack

- **Next.js 14**: React framework with TypeScript
- **Redux Toolkit**: State management
- **Material-UI (MUI)**: Component library and theming
- **TypeScript**: Type safety
- **React 18**: UI library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will start on `http://localhost:3501`

**Important**: This application only serves the exact URL `/public/form-marv/demo-token/demo-form-id`. All other routes return 404.

### Available Scripts

- `npm run dev` - Start development server on port 3500
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
├── components/
│   ├── Layout/
│   │   └── AppLayout.tsx          # Main layout with header and navigation
│   └── Providers/
│       ├── ReduxProvider.tsx      # Redux store provider
│       └── ThemeProvider.tsx      # Material-UI theme provider
├── pages/
│   ├── _app.tsx                   # Next.js app entry point
│   ├── index.tsx                  # Root page with redirects
│   ├── app.tsx                    # Main app view (development)
│   ├── 404.tsx                    # Custom 404 page
│   └── public/
│       └── form-marv/
│           └── [...params].tsx    # Dynamic form-marv route handler
├── store/
│   ├── index.ts                   # Redux store configuration
│   ├── hooks.ts                   # Typed Redux hooks
│   └── slices/
│       ├── appSlice.ts           # App state (user, tokens, view mode)
│       └── themeSlice.ts         # Theme state (light/dark)
├── theme/
│   └── index.ts                   # Material-UI theme configuration
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript configuration
```

## Development Usage

### Testing Form MARV Functionality

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3501/public/form-marv/demo-token/demo-form-id`
3. The application will:
   - Extract token and form ID from URL
   - Set up demo user data
   - Display session information
   - Show the form interface

### Testing App View

1. Use the "Switch to App View" button in the header, or
2. Navigate directly to: `http://localhost:3501/app`
3. The app view shows a placeholder for the full application

### Theme Switching

- Use the theme toggle in the header to switch between light and dark modes
- Theme preference is managed through Redux state

## Production Deployment

In production:

- Remove development mode features
- Set proper authentication/authorization
- Configure server-side token validation
- Set up proper error handling and logging

## Security Considerations

- Security tokens should be validated server-side
- Form IDs should be verified against authorized forms
- Authentication cookies should be properly configured
- HTTPS should be enforced in production

## Future Enhancements

- User authentication system
- Form builder interface
- Real-time form submission
- Administrative dashboard
- Multi-tenant support
- Advanced form validation
- File upload capabilities
