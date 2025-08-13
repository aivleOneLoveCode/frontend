# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue.js 3-based workflow management and chat application. The application provides a ChatGPT-like interface integrated with n8n workflow visualization and management capabilities. Users can interact with AI assistants, manage workflow diagrams, and handle custom workflow uploads.

## Architecture

### Main File
- **chatgpt-clone.html**: Single-file Vue.js application containing the complete chat interface with inline styles and JavaScript

### Key Features
- **Chat Interface**: ChatGPT-style conversation interface with message history
- **Workflow Management**: Support for both default and custom workflows with n8n JSON format
- **Chat History**: Local storage persistence of conversations in sidebar
- **File Upload**: Drag & drop file attachment support in chat messages
- **Resizable Workflow Panel**: Right-side panel with workflow details, JSON content, and descriptions
- **Sidebar**: Collapsible left sidebar with chat history and workflow sections

### State Management
- Uses Vue 3 Composition API with reactive refs
- Local storage persistence for chat histories and custom workflows
- Message state includes streaming support, file attachments, and timestamps

### Data Models
```javascript
// Chat History Item
{
  id: number,
  title: string,
  active: boolean,
  messages: Array<Message>
}

// Message
{
  id: number,
  type: string, // 'user' or 'assistant'
  content: string,
  files?: Array<string>
}

// Workflow
{
  id: number,
  title: string,
  active: boolean,
  description?: string,
  n8nUrl?: string,
  jsonData?: object // n8n workflow JSON data
}
```

## Development Environment

### Technology Stack
- **Framework**: Vue.js 3 with Composition API
- **Styling**: Custom CSS with modern flexbox layouts
- **Architecture**: Single-file component (HTML + CSS + JS)
- **No Build Process**: Direct browser execution

### Workflow Integration
- Supports n8n workflow JSON format for visualization
- Default workflows include examples for data analysis, image processing, API integration, machine learning, automation, and reporting
- Custom workflows can be uploaded via file input or drag & drop
- Resizable panel shows workflow structure (n8n URLs), JSON content, and descriptions

### Local Storage Schema
- Chat histories and custom workflows are persisted in browser local storage
- Data is automatically loaded on page refresh

## File Structure

### Current Implementation
- `chatgpt-clone.html` - Main application file (single-file Vue.js component)

### Legacy Files (Not Used)
- Various `.tsx`, `.vue`, and TypeScript files from previous React/Vue implementations
- `package.json` and build configuration files
- UI component libraries (shadcn/ui)

## Korean Language Support
The application is primarily in Korean with Korean locale formatting for timestamps and localized UI text.

## Usage
Simply open `chatgpt-clone.html` in a web browser - no build process or server required.