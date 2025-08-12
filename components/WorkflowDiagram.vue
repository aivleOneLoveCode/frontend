<template>
  <div 
    v-if="!nodes || nodes.length === 0"
    :class="`flex items-center justify-center bg-gray-50 rounded-lg border ${className}`"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <p class="text-gray-500 text-sm">워크플로우 데이터가 없습니다</p>
  </div>
  <div 
    v-else
    :class="`bg-transparent rounded-lg overflow-hidden ${className}`" 
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <svg :width="width" :height="height" class="overflow-visible">
      <!-- Definitions section -->
      <defs>
        <!-- Gradients for each node -->
        <linearGradient
          v-for="node in normalizedData.nodes"
          :key="`gradient-${node.id}`"
          :id="`gradient-${node.id}`"
          x1="0%" y1="0%" x2="0%" y2="100%"
        >
          <stop offset="0%" :stop-color="getNodeColors(node.type).primary" />
          <stop offset="100%" :stop-color="getNodeColors(node.type).secondary" />
        </linearGradient>
        
        <!-- Node shadow filter -->
        <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.15)" />
        </filter>
        
        <!-- Connection line arrow -->
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#6B7280" />
        </marker>
      </defs>

      <!-- Render connection lines (Bezier curves) -->
      <path
        v-for="(connection, index) in normalizedData.connections"
        :key="index"
        :d="createBezierPath(
          connection.from.x,
          connection.from.y,
          connection.to.x,
          connection.to.y
        )"
        stroke="#6B7280"
        stroke-width="2"
        fill="none"
        marker-end="url(#arrowhead)"
        opacity="0.7"
      />

      <!-- Render nodes -->
      <g v-for="node in normalizedData.nodes" :key="node.id">
        <!-- Node background (n8n style rounded rectangle) -->
        <rect
          :x="node.x - 40"
          :y="node.y - 20"
          width="80"
          height="40"
          rx="6"
          ry="6"
          :fill="`url(#gradient-${node.id})`"
          stroke="white"
          stroke-width="2"
          filter="url(#nodeShadow)"
        />
        
        <!-- Node icon -->
        <foreignObject
          :x="node.x - 8"
          :y="node.y - 8"
          width="16"
          height="16"
        >
          <component 
            :is="getNodeIconComponent(node.type)"
            class="w-4 h-4 text-white drop-shadow-sm"
            style="display: block"
          />
        </foreignObject>
        
        <!-- Node name (n8n style) -->
        <text
          :x="node.x"
          :y="node.y + 30"
          text-anchor="middle"
          class="fill-gray-700"
          style="font-size: 11px; font-weight: 500; font-family: system-ui, -apple-system, sans-serif"
        >
          {{ node.name.length > 14 ? `${node.name.substring(0, 12)}...` : node.name }}
        </text>
        
        <!-- Node execution status indicator (n8n's small play button) -->
        <circle
          :cx="node.x + 30"
          :cy="node.y - 12"
          r="6"
          fill="white"
          :stroke="getNodeColors(node.type).primary"
          stroke-width="1.5"
          opacity="0.9"
        />
        <foreignObject
          :x="node.x + 27"
          :y="node.y - 15"
          width="6"
          height="6"
        >
          <PlayIcon 
            class="w-1.5 h-1.5 text-gray-600"
            style="display: block"
          />
        </foreignObject>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface WorkflowNode {
  id: string
  name: string
  type: string
  position: [number, number]
  parameters?: any
}

interface WorkflowConnections {
  [nodeId: string]: {
    main?: Array<Array<string>>
  }
}

interface WorkflowJSON {
  nodes: WorkflowNode[]
  connections: WorkflowConnections
}

interface WorkflowDiagramProps {
  workflowData: WorkflowJSON
  width?: number
  height?: number
  className?: string
}

const props = withDefaults(defineProps<WorkflowDiagramProps>(), {
  width: 300,
  height: 200,
  className: ''
})

const { nodes, connections } = props.workflowData

// n8n style node colors (gradients)
const getNodeColors = (nodeType: string) => {
  const colorMap: { [key: string]: { primary: string; secondary: string; accent: string } } = {
    // Database - Blue tones
    'n8n-nodes-base.postgres': { 
      primary: '#4285F4', 
      secondary: '#1E88E5', 
      accent: '#BBDEFB' 
    },
    'n8n-nodes-base.mysql': { 
      primary: '#00758F', 
      secondary: '#006064', 
      accent: '#B2EBF2' 
    },
    'n8n-nodes-base.mongodb': { 
      primary: '#47A248', 
      secondary: '#2E7D32', 
      accent: '#C8E6C9' 
    },
    
    // HTTP/API - Green tones
    'n8n-nodes-base.httpRequest': { 
      primary: '#4CAF50', 
      secondary: '#388E3C', 
      accent: '#C8E6C9' 
    },
    'n8n-nodes-base.webhook': { 
      primary: '#66BB6A', 
      secondary: '#4CAF50', 
      accent: '#C8E6C9' 
    },
    
    // Files - Orange tones
    'n8n-nodes-base.csvRead': { 
      primary: '#FF9800', 
      secondary: '#F57C00', 
      accent: '#FFE0B2' 
    },
    'n8n-nodes-base.readPDF': { 
      primary: '#FF5722', 
      secondary: '#D84315', 
      accent: '#FFCCBC' 
    },
    'n8n-nodes-base.readBinaryFiles': { 
      primary: '#FF7043', 
      secondary: '#FF5722', 
      accent: '#FFCCBC' 
    },
    'n8n-nodes-base.writeFile': { 
      primary: '#FF8A65', 
      secondary: '#FF7043', 
      accent: '#FFCCBC' 
    },
    
    // Image - Purple tones
    'n8n-nodes-base.editImage': { 
      primary: '#9C27B0', 
      secondary: '#7B1FA2', 
      accent: '#E1BEE7' 
    },
    
    // Email - Red tones
    'n8n-nodes-base.gmail': { 
      primary: '#EA4335', 
      secondary: '#D32F2F', 
      accent: '#FFCDD2' 
    },
    'n8n-nodes-base.emailSend': { 
      primary: '#F44336', 
      secondary: '#D32F2F', 
      accent: '#FFCDD2' 
    },
    
    // Scheduling - Pink tones
    'n8n-nodes-base.cron': { 
      primary: '#E91E63', 
      secondary: '#C2185B', 
      accent: '#F8BBD9' 
    },
    'n8n-nodes-base.schedule': { 
      primary: '#EC407A', 
      secondary: '#E91E63', 
      accent: '#F8BBD9' 
    },
    
    // Code - Gray tones
    'n8n-nodes-base.function': { 
      primary: '#607D8B', 
      secondary: '#455A64', 
      accent: '#CFD8DC' 
    },
    'n8n-nodes-base.executeCommand': { 
      primary: '#757575', 
      secondary: '#616161', 
      accent: '#E0E0E0' 
    },
    
    // Data processing - Teal tones
    'n8n-nodes-base.aggregate': { 
      primary: '#00BCD4', 
      secondary: '#0097A7', 
      accent: '#B2EBF2' 
    },
    'n8n-nodes-base.set': { 
      primary: '#26C6DA', 
      secondary: '#00BCD4', 
      accent: '#B2EBF2' 
    },
    
    // HTML - Orange tones
    'n8n-nodes-base.html': { 
      primary: '#FF6F00', 
      secondary: '#E65100', 
      accent: '#FFE0B2' 
    },
    
    // Messaging - Purple tones
    'n8n-nodes-base.slack': { 
      primary: '#4A154B', 
      secondary: '#350d36', 
      accent: '#E1BEE7' 
    },
    
    // Default - n8n brand color
    'default': { 
      primary: '#FF6D5A', 
      secondary: '#EA4B35', 
      accent: '#FFE0B2' 
    }
  }
  
  return colorMap[nodeType] || colorMap['default']
}

// Get node icon component based on type
const getNodeIconComponent = (nodeType: string) => {
  const iconMap: { [key: string]: string } = {
    // Database related
    'n8n-nodes-base.postgres': 'DatabaseIcon',
    'n8n-nodes-base.mysql': 'DatabaseIcon',
    'n8n-nodes-base.mongodb': 'DatabaseIcon',
    
    // HTTP/API related
    'n8n-nodes-base.httpRequest': 'GlobeIcon',
    'n8n-nodes-base.webhook': 'GlobeIcon',
    
    // File related
    'n8n-nodes-base.csvRead': 'FileTextIcon',
    'n8n-nodes-base.readPDF': 'FileTextIcon',
    'n8n-nodes-base.readBinaryFiles': 'UploadIcon',
    'n8n-nodes-base.writeFile': 'DownloadIcon',
    
    // Image processing
    'n8n-nodes-base.editImage': 'ImageIcon',
    
    // Email
    'n8n-nodes-base.gmail': 'MailIcon',
    'n8n-nodes-base.emailSend': 'MailIcon',
    
    // Scheduling
    'n8n-nodes-base.cron': 'ClockIcon',
    'n8n-nodes-base.schedule': 'CalendarIcon',
    
    // Code/functions
    'n8n-nodes-base.function': 'CodeIcon',
    'n8n-nodes-base.executeCommand': 'SettingsIcon',
    
    // Data processing
    'n8n-nodes-base.aggregate': 'BarChart3Icon',
    'n8n-nodes-base.set': 'SettingsIcon',
    
    // HTML/template
    'n8n-nodes-base.html': 'FileTextIcon',
    
    // Messaging
    'n8n-nodes-base.slack': 'MessageSquareIcon',
    
    // Default
    'default': 'ZapIcon'
  }
  
  return iconMap[nodeType] || iconMap['default']
}

// Create Bezier curve path
const createBezierPath = (
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number
): string => {
  const dx = endX - startX
  const dy = endY - startY
  
  // Calculate control points for curve (n8n style)
  const cp1x = startX + Math.abs(dx) * 0.5
  const cp1y = startY
  const cp2x = endX - Math.abs(dx) * 0.5
  const cp2y = endY
  
  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`
}

// Normalize data for SVG coordinate system
const normalizedData = computed(() => {
  if (!nodes || nodes.length === 0) {
    return { nodes: [], connections: [] }
  }

  // Find min/max coordinates of nodes
  const positions = nodes.map(node => node.position)
  const minX = Math.min(...positions.map(pos => pos[0]))
  const maxX = Math.max(...positions.map(pos => pos[0]))
  const minY = Math.min(...positions.map(pos => pos[1]))
  const maxY = Math.max(...positions.map(pos => pos[1]))

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1

  // Set margins (considering n8n style node size)
  const padding = 60
  const diagramWidth = props.width - padding * 2
  const diagramHeight = props.height - padding * 2

  // Normalize nodes
  const normalizedNodes = nodes.map(node => {
    const normalizedX = ((node.position[0] - minX) / rangeX) * diagramWidth + padding
    const normalizedY = ((node.position[1] - minY) / rangeY) * diagramHeight + padding
    
    return {
      ...node,
      x: normalizedX,
      y: normalizedY
    }
  })

  // Calculate connection lines
  const connectionLines: Array<{
    from: { x: number; y: number }
    to: { x: number; y: number }
    fromNode: string
    toNode: string
  }> = []

  Object.entries(connections || {}).forEach(([fromNodeName, nodeConnections]) => {
    const fromNode = normalizedNodes.find(n => n.name === fromNodeName)
    if (!fromNode || !nodeConnections.main) return

    nodeConnections.main.forEach(connectionArray => {
      connectionArray.forEach(toNodeName => {
        const toNode = normalizedNodes.find(n => n.name === toNodeName)
        if (toNode) {
          connectionLines.push({
            from: { x: fromNode.x + 40, y: fromNode.y }, // Start from right of node
            to: { x: toNode.x - 40, y: toNode.y }, // Connect to left of node
            fromNode: fromNode.name,
            toNode: toNode.name
          })
        }
      })
    })
  })

  return { nodes: normalizedNodes, connections: connectionLines }
})
</script>

<!-- Icon Components -->
<script lang="ts">
const DatabaseIcon = {
  name: 'DatabaseIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="m3 5v14c0 3 6 3 9 3s9 0 9-3V5"/>
      <path d="m3 12c0 3 6 3 9 3s9 0 9-3"/>
    </svg>
  `
}

const GlobeIcon = {
  name: 'GlobeIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" x2="22" y1="12" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  `
}

const FileTextIcon = {
  name: 'FileTextIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  `
}

const ImageIcon = {
  name: 'ImageIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  `
}

const MailIcon = {
  name: 'MailIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  `
}

const CalendarIcon = {
  name: 'CalendarIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  `
}

const SettingsIcon = {
  name: 'SettingsIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  `
}

const ZapIcon = {
  name: 'ZapIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
    </svg>
  `
}

const CodeIcon = {
  name: 'CodeIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <polyline points="16,18 22,12 16,6"/>
      <polyline points="8,6 2,12 8,18"/>
    </svg>
  `
}

const BarChart3Icon = {
  name: 'BarChart3Icon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M3 3v18h18"/>
      <path d="M18 17V9"/>
      <path d="M13 17V5"/>
      <path d="M8 17v-3"/>
    </svg>
  `
}

const ClockIcon = {
  name: 'ClockIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  `
}

const UploadIcon = {
  name: 'UploadIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  `
}

const DownloadIcon = {
  name: 'DownloadIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  `
}

const MessageSquareIcon = {
  name: 'MessageSquareIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  `
}

const PlayIcon = {
  name: 'PlayIcon',
  template: `
    <svg class="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 24 24">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  `
}

export { 
  DatabaseIcon, GlobeIcon, FileTextIcon, ImageIcon, MailIcon, 
  CalendarIcon, SettingsIcon, ZapIcon, CodeIcon, BarChart3Icon,
  ClockIcon, UploadIcon, DownloadIcon, MessageSquareIcon, PlayIcon
}
</script>