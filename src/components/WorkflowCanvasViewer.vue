<template>
  <div class="workflow-canvas-viewer">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>워크플로우를 로딩 중...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="!hasValidWorkflow" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>표시할 워크플로우가 없습니다</p>
    </div>
    
    <div v-else class="canvas-container">
      <VueFlow
        :nodes="flowNodes"
        :edges="flowEdges"
        :node-types="nodeTypes"
        :default-viewport="defaultViewport"
        :pan-on-scroll="true"
        :zoom-on-scroll="true"
        :pan-on-drag="true"
        :nodes-draggable="false"
        :nodes-connectable="false"
        :elements-selectable="false"
        :fit-view-on-init="false"
      >
        <Background pattern-color="#f1f5f9" />
        <MiniMap />
        <Controls>
          <template #control-fit-view>
            <button 
              @click="autoFitView" 
              class="vue-flow__controls-button"
              title="워크플로우 전체 보기"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            </button>
          </template>
        </Controls>
      </VueFlow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, markRaw } from 'vue'
import type { WorkflowItem } from '../types'
import { workflowService } from '@/services/workflow'

// Vue Flow를 직접 사용
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls' 
import { Background } from '@vue-flow/background'
import WorkflowCustomNode from './WorkflowCustomNode.vue'
import type { NodeTypesObject } from '@vue-flow/core'

// 커스텀 노드 타입 등록 (markRaw로 reactive 방지)
const nodeTypes: NodeTypesObject = {
  custom: markRaw(WorkflowCustomNode) as any
}

interface Props {
  workflow?: WorkflowItem | null
}

const props = defineProps<Props>()

const loading = ref(false)
const error = ref<string>('')

// 워크플로우 데이터 검증
const hasValidWorkflow = computed(() => {
  return props.workflow?.jsonData && 
         props.workflow.jsonData.nodes && 
         Array.isArray(props.workflow.jsonData.nodes) &&
         props.workflow.jsonData.nodes.length > 0
})

// n8n 노드 타입에서 아이콘 URL 생성 (n8n의 실제 아이콘 처리 방식 반영)
const getNodeIconUrl = (nodeType: string) => {
  if (!nodeType.startsWith('n8n-nodes-base.')) {
    return null
  }
  
  // 노드 타입에서 실제 노드명 추출 (예: n8n-nodes-base.slack → slack)
  const nodeTypeSimple = nodeType.replace('n8n-nodes-base.', '')
  
  // n8n의 실제 노드-경로 매핑 (node definition에 기반한 정확한 경로)
  const nodePathMapping: Record<string, string> = {
    // Transform 계열 (SVG 파일 존재)
    'aggregate': 'Transform/Aggregate/aggregate.svg',
    
    // Google 서비스들
    'gmail': 'Google/Gmail/gmail.svg',
    'googleDrive': 'Google/Drive/googleDrive.svg',
    'googleSheets': 'Google/Sheets/googleSheets.svg',
    'googleDocs': 'Google/Docs/googleDocs.svg',
    
    // 직접 SVG 파일이 있는 노드들
    'openAi': 'OpenAi/openAi.svg',
    'slack': 'Slack/slack.svg',
    'respondToWebhook': 'RespondToWebhook/webhook.svg',
    'n8nTrigger': 'N8nTrigger/n8nTrigger.svg',
    'homeAssistant': 'HomeAssistant/homeAssistant.svg',
    'timescaleDb': 'TimescaleDb/timescaleDb.svg',
    'highLevel': 'HighLevel/highLevel.svg',
    'manualTrigger': 'ManualTrigger/manualTrigger.svg',
    'httpRequest': 'HttpRequest/httpRequest.svg',
    
    // 데이터베이스
    'postgres': 'Postgres/postgres.svg',
    'mysql': 'MySql/mysql.svg',
    'mongodb': 'MongoDb/mongoDb.svg'
  }
  
  // 매핑된 SVG 경로가 있으면 사용
  if (nodePathMapping[nodeTypeSimple]) {
    return `/lib/n8n/packages/nodes-base/nodes/${nodePathMapping[nodeTypeSimple]}`
  }
  
  // FontAwesome 아이콘을 사용하는 노드들은 null 반환 (폴백 아이콘 사용)
  // interval(fa:hourglass), executeWorkflow(fa:sign-in-alt) 등
  return null
}

// 연결 관계를 고려한 세로 배치 계산
const calculateVerticalLayout = (nodes: any[], connections: any) => {
  const nodePositions: Record<string, { x: number; y: number }> = {}
  const verticalSpacing = 150
  const horizontalSpacing = 200
  
  // 1. 각 노드의 연결 정보 분석
  const nodeConnections: Record<string, { inputs: string[], outputs: string[] }> = {}
  nodes.forEach(node => {
    nodeConnections[node.id] = { inputs: [], outputs: [] }
  })
  
  // connections를 분석해서 입력/출력 관계 파악
  Object.entries(connections).forEach(([sourceNodeName, conns]: [string, any]) => {
    const sourceNode = nodes.find(n => n.name === sourceNodeName)
    if (!sourceNode) return
    
    Object.values(conns).forEach((connArray: any) => {
      connArray.forEach((targetArray: any[]) => {
        targetArray.forEach((target: any) => {
          const targetNode = nodes.find(n => n.name === target.node)
          if (targetNode) {
            nodeConnections[sourceNode.id].outputs.push(targetNode.id)
            nodeConnections[targetNode.id].inputs.push(sourceNode.id)
          }
        })
      })
    })
  })
  
  // 2. 트리거 노드(입력이 없는 노드) 찾기
  const rootNodes = nodes.filter(node => nodeConnections[node.id].inputs.length === 0)
  
  // 3. 계층별로 노드 분류 (BFS)
  const layers: string[][] = []
  const visited = new Set<string>()
  const queue: { nodeId: string, layer: number }[] = []
  
  // 루트 노드들을 첫 번째 레이어에 추가
  rootNodes.forEach(node => {
    queue.push({ nodeId: node.id, layer: 0 })
  })
  
  while (queue.length > 0) {
    const { nodeId, layer } = queue.shift()!
    
    if (visited.has(nodeId)) continue
    visited.add(nodeId)
    
    // 레이어 배열 초기화
    if (!layers[layer]) layers[layer] = []
    layers[layer].push(nodeId)
    
    // 다음 레이어의 노드들 추가
    nodeConnections[nodeId].outputs.forEach(outputNodeId => {
      if (!visited.has(outputNodeId)) {
        queue.push({ nodeId: outputNodeId, layer: layer + 1 })
      }
    })
  }
  
  // 방문하지 않은 노드들 (고립된 노드들) 마지막 레이어에 추가
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      if (!layers[layers.length]) layers[layers.length] = []
      layers[layers.length - 1].push(node.id)
    }
  })
  
  // 4. 위치 계산
  layers.forEach((layer, layerIndex) => {
    const layerY = layerIndex * verticalSpacing
    
    layer.forEach((nodeId, nodeIndex) => {
      // 같은 레이어 내에서 여러 노드가 있으면 가로로 분산
      const totalWidth = (layer.length - 1) * horizontalSpacing
      const startX = 300 - totalWidth / 2
      const nodeX = startX + nodeIndex * horizontalSpacing
      
      nodePositions[nodeId] = { x: nodeX, y: layerY }
    })
  })
  
  return nodePositions
}

// 폴백 이모지 아이콘
const getFallbackIcon = (nodeType: string) => {
  const emojiMap: Record<string, string> = {
    // Trigger 노드들
    'manualTrigger': '🚀',
    'interval': '⏰',
    'webhook': '🔗',
    'scheduler': '📅',
    
    // 워크플로우 관련
    'executeWorkflow': '🔄',
    'subworkflow': '🔗',
    
    // Transform 노드들
    'aggregate': '📊',
    'function': '🔧',
    'code': '💻',
    'if': '❓',
    'set': '⚙️',
    'wait': '⏰',
    
    // 통신
    'httpRequest': '🌐',
    'emailSend': '📧',
    'slack': '💬',
    'discord': '🎮',
    'gmail': '📧',
    
    // 데이터
    'googleDrive': '💾',
    'database': '🗃️',
    'postgres': '🐘',
    'mysql': '🐬',
    'mongodb': '🍃',
    
    // AI
    'openAi': '🤖',
    
    // 기타
    'compression': '📦',
    'watchFiles': '👁️'
  }
  
  const simpleType = nodeType.split('.').pop() || 'unknown'
  return emojiMap[simpleType] || '📋'
}

// Vue Flow용 노드 데이터 매핑
const flowNodes = computed(() => {
  if (!hasValidWorkflow.value) return []

  const jsonData = props.workflow!.jsonData
  
  // 연결 관계를 고려한 계층적 배치
  const nodePositions = calculateVerticalLayout(jsonData.nodes, jsonData.connections || {})
  
  return jsonData.nodes.map((node: any) => {
    const iconUrl = getNodeIconUrl(node.type)
    const fallbackIcon = getFallbackIcon(node.type)
    const position = nodePositions[node.id] || { x: 300, y: 0 }
    
    return {
      id: node.id,
      type: 'custom',
      position: position,
      data: {
        label: node.name,
        iconUrl: iconUrl,
        fallbackIcon: fallbackIcon,
        nodeType: node.type,
        disabled: node.disabled || false
      }
    }
  })
})

// Vue Flow용 엣지 데이터 매핑
const flowEdges = computed(() => {
  if (!hasValidWorkflow.value) return []

  const jsonData = props.workflow!.jsonData
  const edges: any[] = []
  
  // n8n connections 형태를 Vue Flow edges로 변환
  Object.entries(jsonData.connections || {}).forEach(([sourceNodeName, connections]: [string, any]) => {
    Object.entries(connections).forEach(([, connectionArray]: [string, any]) => {
      connectionArray.forEach((targetArray: any[], index: number) => {
        targetArray.forEach((target: any) => {
          edges.push({
            id: `${sourceNodeName}-${target.node}-${index}`,
            source: jsonData.nodes.find((n: any) => n.name === sourceNodeName)?.id,
            target: jsonData.nodes.find((n: any) => n.name === target.node)?.id,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'step',
            style: {
              stroke: '#6b7280',
              strokeWidth: 2
            },
            markerEnd: {
              type: 'arrow',
              color: '#6b7280'
            }
          })
        })
      })
    })
  })
  
  return edges.filter(edge => edge.source && edge.target)
})

// 워크플로우 변경 감지 및 JSON 데이터 로딩
watch(() => props.workflow, async (newWorkflow) => {
  error.value = ''
  
  if (!newWorkflow) {
    loading.value = false
    return
  }
  
  // 워크플로우가 선택되면 항상 JSON 데이터를 새로 로드
  loading.value = true
  
  try {
    // 워크플로우 JSON 데이터 가져오기
    const jsonData = await workflowService.getWorkflowJson(newWorkflow.workflow_id)
    
    // JSON 데이터 유효성 검증
    if (!jsonData.nodes) {
      throw new Error('워크플로우에 노드가 없습니다')
    }
    
    if (!Array.isArray(jsonData.nodes)) {
      throw new Error('잘못된 워크플로우 형식입니다')
    }
    
    // 워크플로우 객체에 JSON 데이터 설정
    newWorkflow.jsonData = jsonData
    
    loading.value = false
    
    // 워크플로우가 로드되면 fitView 실행
    nextTick(() => {
      fitView({ 
        padding: 0.1,
        duration: 0
      })
    })
    
  } catch (err) {
    loading.value = false
    error.value = err instanceof Error ? err.message : '워크플로우 로딩 중 오류가 발생했습니다'
    console.error('워크플로우 JSON 로딩 실패:', err)
  }
}, { immediate: true })

// 뷰포트 설정 계산
const defaultViewport = computed(() => {
  if (!hasValidWorkflow.value) {
    return { zoom: 0.8, x: 0, y: 0 }
  }
  
  // 노드들의 위치를 기반으로 중심점 계산
  const jsonData = props.workflow!.jsonData
  if (jsonData.nodes.length === 0) {
    return { zoom: 0.8, x: 0, y: 0 }
  }
  
  const positions = jsonData.nodes.map((node: any) => ({
    x: node.position[0] || 0,
    y: node.position[1] || 0
  }))
  
  // 바운딩 박스 계산
  const minX = Math.min(...positions.map((p: { x: number; y: number }) => p.x))
  const maxX = Math.max(...positions.map((p: { x: number; y: number }) => p.x))
  const minY = Math.min(...positions.map((p: { x: number; y: number }) => p.y))
  const maxY = Math.max(...positions.map((p: { x: number; y: number }) => p.y))
  
  // 중심점 계산
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  
  // 컨테이너 중심으로 이동하기 위한 오프셋
  const containerCenterX = 200 // 캔바스 컨테이너 절반 너비 추정
  const containerCenterY = 200 // 캔바스 컨테이너 절반 높이 추정
  
  return {
    zoom: 0.8,
    x: containerCenterX - centerX * 0.8,
    y: containerCenterY - centerY * 0.8
  }
})

// Vue Flow composable 사용
const { fitView, onNodesInitialized } = useVueFlow()

// 수동으로 fitView 실행하는 함수 (필요시 외부에서 호출 가능)
const autoFitView = () => {
  if (hasValidWorkflow.value) {
    fitView({ 
      padding: 0.1,
      duration: 0
    })
  }
}

// 노드들이 초기화된 후 자동 fitView 실행
onNodesInitialized(() => {
  if (hasValidWorkflow.value) {
    fitView({ 
      padding: 0.1,
      duration: 0
    })
  }
})

// 컴포넌트 외부에서 접근 가능하도록 expose
defineExpose({
  autoFitView
})

onMounted(() => {
  // 초기 로딩 상태 해제
  loading.value = false
})
</script>

<style>
/* Vue Flow 기본 스타일 */
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';
</style>

<style scoped>
.workflow-canvas-viewer {
  width: 100%;
  height: 100%;
  position: relative;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #10a37f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-state p,
.error-state p,
.empty-state p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.error-state p {
  color: #dc2626;
}

/* n8n 캔바스 스타일 오버라이드 */
:deep(.vue-flow) {
  background: #ffffff;
}

:deep(.vue-flow__pane) {
  cursor: default !important;
}

:deep(.vue-flow__node) {
  cursor: default !important;
}

:deep(.vue-flow__edge) {
  cursor: default !important;
}

/* 읽기 전용 모드에서 상호작용 비활성화 */
:deep(.vue-flow__controls) {
  pointer-events: none;
  opacity: 0.6;
}

:deep(.vue-flow__minimap) {
  pointer-events: none;
  opacity: 0.8;
}
</style>