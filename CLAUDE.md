# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based workflow management and chat application built with TypeScript. The application provides a chat interface integrated with n8n workflow visualization and management capabilities. Users can interact with AI assistants, manage workflow diagrams, and handle custom workflow uploads.

## Architecture

### Core Components
- **App.tsx**: Main application component managing routing, state, and view transitions between main chat interface, login, and board views
- **ChatArea.tsx**: Primary chat interface with message rendering, file upload support, and workflow integration
- **WorkflowPanel.tsx**: Right sidebar panel displaying workflow details, n8n diagram visualization, and management actions
- **Header.tsx**: Top navigation with download, board access, and login functionality

### Key Features
- **Workflow Management**: Support for both default and custom workflows with n8n JSON format
- **Chat History**: Local storage persistence of conversations with workflow associations
- **File Upload**: Attachment support in chat messages
- **Real-time UI**: Streaming message responses with typing indicators
- **Resizable Panels**: Dynamic layout with collapsible workflow panel

### State Management
- Uses React hooks for local state management
- Custom `useLocalStorage` hook for persistence of chat histories and custom workflows
- Message state includes streaming support, file attachments, and timestamps

### Data Models
```typescript
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  files?: string[];
  isStreaming?: boolean;
}

interface Workflow {
  id: string;
  title: string;
  image: string;
  isCustom?: boolean;
  jsonData?: any; // n8n workflow JSON data
  description?: string;
  n8nUrl?: string;
}
```

## Development Environment

### UI Framework
- Uses **shadcn/ui** component library with Tailwind CSS
- Components are located in `components/ui/` following shadcn conventions
- Styling uses Tailwind utility classes with custom CSS variables

### Workflow Integration
- Supports n8n workflow JSON format for visualization
- Default workflows include examples for data analysis, image processing, API integration, machine learning, automation, and reporting
- Custom workflows can be uploaded and managed through the interface

### Local Storage Schema
- `chat-histories`: Array of ChatHistory objects with messages and associated workflows
- `custom-workflows`: Array of user-uploaded Workflow objects

## Build Commands

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

### Dependencies
- **Framework**: Vite + React 18 + TypeScript
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build**: Vite with path aliasing (@/* for root directory)

## Korean Language Support
The application is primarily in Korean with Korean locale formatting for timestamps and localized UI text.