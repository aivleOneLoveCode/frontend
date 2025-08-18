# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue.js 3-based workflow management and chat application (DA-ZZANY). The project has two implementations:
1. **Standalone HTML**: `chatgpt-clone.html` - Self-contained single-file application (no build required)
2. **Full Vue Application**: Complete Vue.js 3 application with TypeScript, Vite, and modern tooling

## Commands

### Development
```bash
npm install          # Install dependencies
npm run dev         # Start dev server at port 5173
npm run build       # Build for production
npm run preview     # Preview production build
npm run serve       # Serve preview at port 3000
```

### Code Quality
```bash
npm run type-check  # Run TypeScript type checking
npm run lint        # Lint and fix code with ESLint
npm run format      # Format code with Prettier
```

## Architecture

### Technology Stack
- **Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **State Management**: Pinia stores (auth, chat, workflow)
- **Routing**: Vue Router 4
- **HTTP Client**: Axios for API calls
- **TypeScript**: Full TypeScript support with strict mode
- **Styling**: Scoped CSS with CSS variables for theming

### Project Structure
```
src/
├── components/         # Reusable UI components
│   ├── ChatArea.vue   # Main chat interface
│   ├── Sidebar.vue    # Chat history sidebar
│   └── WorkflowPanel.vue # Workflow management panel
├── views/             # Route pages  
│   ├── Chat.vue       # Main chat view
│   ├── Login.vue      # Authentication views
│   └── Board.vue      # Workflow board view
├── stores/            # Pinia state management
│   ├── auth.ts        # User authentication state
│   ├── chat.ts        # Chat messages and history
│   └── workflow.ts    # Workflow management state
├── services/          # API service layer
│   ├── api.ts         # Axios instance configuration
│   ├── chatStream.ts  # SSE streaming for real-time messages
│   └── fileUpload.ts  # File attachment handling
├── composables/       # Vue composition functions
│   ├── useChatManagement.ts
│   └── useWorkflowManagement.ts
└── types/            # TypeScript type definitions
    └── index.ts      # Shared interfaces and types
```

### Key APIs and Services

#### Backend Integration
- Base URL configured via `VITE_API_BASE_URL` environment variable
- JWT authentication with Bearer tokens
- Automatic token refresh handling
- WebSocket support for real-time features

#### Message Streaming
- Server-Sent Events (SSE) for real-time AI responses
- Located in `src/services/chatStream.ts`
- Handles chunked responses and error states

#### File Upload
- Multipart form data support
- Drag-and-drop file attachments
- Progress tracking for uploads

### Path Aliases
- `@/` maps to `src/` directory
- Example: `import { useAuth } from '@/stores/auth'`

## Backend Integration

### Advanced FastAPI Backend
This project now includes a sophisticated FastAPI backend (`backend.py`) with:
- **Claude Sonnet 4 Integration**: Direct integration with Anthropic API
- **MCP (Model Context Protocol)**: Advanced n8n workflow automation via MCP server
- **Real-time Streaming**: Server-Sent Events with thinking states, tool execution display
- **JWT Authentication**: Secure user authentication with bcrypt password hashing
- **Session Management**: Persistent chat sessions with automatic title generation

### Backend Features
- **Multi-user Support**: Complete user registration/login system
- **Advanced AI Chat**: Real-time streaming with thinking visualization, tool usage display
- **n8n Workflow Integration**: Create, manage, and execute n8n workflows via MCP
- **File Upload Support**: Images (JPEG, PNG, GIF, WebP) and PDF documents
- **Project Management**: Organize workflows into projects
- **Database**: SQLite with comprehensive schema for users, sessions, messages, workflows, projects

### API Endpoints
- Authentication: `/register`, `/login` (JWT-based)
- Chat: `/chat` (SSE streaming with Claude Sonnet 4)
- Sessions: `/sessions/*` (chat history management)
- Workflows: `/workflows/*`, `/api/workflows/*` (n8n integration)
- Projects: `/projects/*` (workflow organization)

### Database Schema
- **Users**: user_id, email, first_name, last_name, password, api_key
- **Sessions**: session_id, user_id, title, created_at, updated_at
- **Messages**: message_id, session_id, role, content (JSON), created_at
- **Workflows**: n8n_workflow_id, user_id, project_id, name, status
- **Projects**: project_id, user_id, name, created_at, updated_at

### Default Admin Account
- Email: `admin@admin.com`
- Password: `12345678`
- Name: `관리자 Admin`

### Running the Backend
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python backend.py
# Server runs at http://localhost:8000
```

### Environment Setup
The backend requires `.env` file with:
```env
ANTHROPIC_API_KEY=your-anthropic-api-key
JWT_SECRET=your-jwt-secret
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your-n8n-api-key
MCP_URL=http://localhost:3000/mcp
MCP_AUTH_TOKEN=your-mcp-token
```

## Development Notes

### Two Parallel Implementations
This repository contains both:
1. **chatgpt-clone.html**: Standalone HTML file with inline Vue.js (no build required)
2. **src/** directory: Full Vue.js application with TypeScript and modern tooling

When making changes, consider which implementation is being targeted.

### TypeScript Configuration
- Strict mode enabled
- Path mapping configured for `@/` alias
- Vue SFC support with `.vue` file imports
- JSX preserved for potential React component usage

### Environment Variables
Create `.env.development` for local development:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/ws
```

### Korean Localization
- UI text primarily in Korean
- Date/time formatting uses Korean locale
- Comments and code remain in English