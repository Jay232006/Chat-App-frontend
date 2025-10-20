# Chat App

## Overview

This is a modern chat application frontend built with React and Vite. The project uses React 19 for the UI framework and Tailwind CSS 4 for styling. It features a clean, aesthetic design with a conversation list sidebar, message viewing area, and message input functionality. The UI is designed to be simple and not overly complex, ready to integrate with a backend API.

**Last Updated**: October 20, 2025

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- **React 19.2.0**: Latest version of React for building the user interface
- **Vite 7.1.11**: Modern build tool providing fast development server with hot module replacement (HMR)
- **Problem**: Need a fast, modern development experience with quick build times
- **Solution**: Vite chosen over traditional bundlers like Webpack for its superior development speed and native ES modules support
- **Benefits**: Near-instant server start, lightning-fast HMR, optimized production builds

**Styling Architecture**
- **Tailwind CSS 4.1.14**: Utility-first CSS framework for rapid UI development
- **PostCSS Pipeline**: Configured with Tailwind's PostCSS plugin and Autoprefixer
- **Problem**: Need a consistent, maintainable styling approach that scales
- **Solution**: Utility-first CSS with Tailwind instead of traditional CSS-in-JS or separate stylesheets
- **Benefits**: Reduced CSS bundle size, consistent design system, faster development

**Development Server Configuration**
- Host: `0.0.0.0` (accessible from external networks)
- Port: `5000`
- Allowed hosts: All hosts enabled (suitable for cloud/container deployments)
- **Rationale**: Configuration optimized for deployment on platforms like Replit where external access and specific port binding are required

### Project Structure

**Entry Points**
- `index.html`: Root HTML file serving as the application entry point
- `src/main.jsx`: JavaScript entry point that mounts the React application
- `src/index.css`: Global styles with Tailwind imports using `@import "tailwindcss"` syntax for Tailwind v4

**Component Structure**
- `src/App.jsx`: Main application component managing state for selected chat
- `src/components/ChatList.jsx`: Left sidebar component displaying list of conversations with search functionality, online status indicators, and unread message badges
- `src/components/ChatWindow.jsx`: Main chat area displaying messages and handling conversation view
- `src/components/MessageInput.jsx`: Input component at bottom of chat window for composing and sending messages

**Build Configuration**
- ES Modules: Project uses `"type": "module"` in package.json for native ESM support
- React Plugin: `@vitejs/plugin-react` enables React Fast Refresh and JSX transformation
- PostCSS: Configured with `@tailwindcss/postcss` plugin for Tailwind CSS v4 compatibility

### Design Patterns

**Module System**
- Native ES Modules throughout the project
- No legacy CommonJS dependencies
- Benefits: Better tree-shaking, faster loading, modern JavaScript standards

**CSS Architecture**
- Global reset and base styles in `src/index.css`
- Tailwind utility classes for component styling
- PostCSS processing pipeline for cross-browser compatibility

## External Dependencies

### Core Dependencies

**React Ecosystem**
- `react` (19.2.0): Core React library
- `react-dom` (19.2.0): React DOM rendering

**Build Tools**
- `vite` (7.1.11): Development server and build tool
- `@vitejs/plugin-react` (5.0.4): React support for Vite

**Styling**
- `tailwindcss` (4.1.14): Utility-first CSS framework
- `@tailwindcss/postcss` (4.1.14): PostCSS plugin for Tailwind
- `postcss` (8.5.6): CSS transformation tool
- `autoprefixer` (10.4.21): Automatic vendor prefix addition for cross-browser compatibility

### Integration Points

**Backend Communication**
- No backend integration visible in current codebase
- Architecture supports future integration via fetch API or third-party HTTP libraries
- Vite proxy configuration can be added for API routing during development

**External Services**
- None currently configured
- Project structure supports future integration with:
  - WebSocket servers for real-time chat functionality
  - Authentication providers (OAuth, JWT)
  - Cloud storage for media uploads
  - Analytics services