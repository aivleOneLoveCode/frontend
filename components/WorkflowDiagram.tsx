import { useMemo } from "react";
import { 
  Database, 
  Globe, 
  FileText, 
  Image, 
  Mail, 
  Calendar, 
  Settings, 
  Zap,
  Code,
  BarChart3,
  Clock,
  Download,
  Upload,
  MessageSquare,
  Play
} from "lucide-react";

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters?: any;
}

interface WorkflowConnections {
  [nodeId: string]: {
    main?: Array<Array<string>>;
  };
}

interface WorkflowJSON {
  nodes: WorkflowNode[];
  connections: WorkflowConnections;
}

interface WorkflowDiagramProps {
  workflowData: WorkflowJSON;
  width?: number;
  height?: number;
  className?: string;
}

// n8n 스타일 노드 아이콘 매핑
const getNodeIcon = (nodeType: string) => {
  const iconMap: { [key: string]: any } = {
    // 데이터베이스 관련
    'n8n-nodes-base.postgres': Database,
    'n8n-nodes-base.mysql': Database,
    'n8n-nodes-base.mongodb': Database,
    
    // HTTP/API 관련
    'n8n-nodes-base.httpRequest': Globe,
    'n8n-nodes-base.webhook': Globe,
    
    // 파일 관련
    'n8n-nodes-base.csvRead': FileText,
    'n8n-nodes-base.readPDF': FileText,
    'n8n-nodes-base.readBinaryFiles': Upload,
    'n8n-nodes-base.writeFile': Download,
    
    // 이미지 처리
    'n8n-nodes-base.editImage': Image,
    
    // 이메일
    'n8n-nodes-base.gmail': Mail,
    'n8n-nodes-base.emailSend': Mail,
    
    // 스케줄링
    'n8n-nodes-base.cron': Clock,
    'n8n-nodes-base.schedule': Calendar,
    
    // 코드/함수
    'n8n-nodes-base.function': Code,
    'n8n-nodes-base.executeCommand': Settings,
    
    // 데이터 처리
    'n8n-nodes-base.aggregate': BarChart3,
    'n8n-nodes-base.set': Settings,
    
    // HTML/템플릿
    'n8n-nodes-base.html': FileText,
    
    // 메시징
    'n8n-nodes-base.slack': MessageSquare,
    
    // 기본
    'default': Zap
  };
  
  return iconMap[nodeType] || iconMap['default'];
};

// n8n 스타일 노드 색상 (그라데이션)
const getNodeColors = (nodeType: string) => {
  const colorMap: { [key: string]: { primary: string; secondary: string; accent: string } } = {
    // 데이터베이스 - 파란색 계열
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
    
    // HTTP/API - 초록색 계열
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
    
    // 파일 - 주황색 계열
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
    
    // 이미지 - 보라색 계열
    'n8n-nodes-base.editImage': { 
      primary: '#9C27B0', 
      secondary: '#7B1FA2', 
      accent: '#E1BEE7' 
    },
    
    // 이메일 - 빨간색 계열
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
    
    // 스케줄링 - 분홍색 계열
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
    
    // 코드 - 회색 계열
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
    
    // 데이터 처리 - 청록색 계열
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
    
    // HTML - 오렌지 계열
    'n8n-nodes-base.html': { 
      primary: '#FF6F00', 
      secondary: '#E65100', 
      accent: '#FFE0B2' 
    },
    
    // 메시징 - 자주색 계열
    'n8n-nodes-base.slack': { 
      primary: '#4A154B', 
      secondary: '#350d36', 
      accent: '#E1BEE7' 
    },
    
    // 기본 - n8n 브랜드 색상
    'default': { 
      primary: '#FF6D5A', 
      secondary: '#EA4B35', 
      accent: '#FFE0B2' 
    }
  };
  
  return colorMap[nodeType] || colorMap['default'];
};

// 베지어 곡선 경로 생성
const createBezierPath = (
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number
): string => {
  const dx = endX - startX;
  const dy = endY - startY;
  
  // 곡선의 제어점 계산 (n8n 스타일)
  const cp1x = startX + Math.abs(dx) * 0.5;
  const cp1y = startY;
  const cp2x = endX - Math.abs(dx) * 0.5;
  const cp2y = endY;
  
  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
};

export function WorkflowDiagram({ 
  workflowData, 
  width = 300, 
  height = 200, 
  className = "" 
}: WorkflowDiagramProps) {
  const { nodes, connections } = workflowData;

  // SVG 좌표계에 맞게 노드 위치 계산
  const normalizedData = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { nodes: [], connections: [] };
    }

    // 노드들의 최소/최대 좌표 찾기
    const positions = nodes.map(node => node.position);
    const minX = Math.min(...positions.map(pos => pos[0]));
    const maxX = Math.max(...positions.map(pos => pos[0]));
    const minY = Math.min(...positions.map(pos => pos[1]));
    const maxY = Math.max(...positions.map(pos => pos[1]));

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    // 여백 설정 (n8n 스타일 노드 크기를 고려)
    const padding = 60;
    const diagramWidth = width - padding * 2;
    const diagramHeight = height - padding * 2;

    // 노드 정규화
    const normalizedNodes = nodes.map(node => {
      const normalizedX = ((node.position[0] - minX) / rangeX) * diagramWidth + padding;
      const normalizedY = ((node.position[1] - minY) / rangeY) * diagramHeight + padding;
      
      return {
        ...node,
        x: normalizedX,
        y: normalizedY
      };
    });

    // 연결선 계산
    const connectionLines: Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
      fromNode: string;
      toNode: string;
    }> = [];

    Object.entries(connections || {}).forEach(([fromNodeName, nodeConnections]) => {
      const fromNode = normalizedNodes.find(n => n.name === fromNodeName);
      if (!fromNode || !nodeConnections.main) return;

      nodeConnections.main.forEach(connectionArray => {
        connectionArray.forEach(toNodeName => {
          const toNode = normalizedNodes.find(n => n.name === toNodeName);
          if (toNode) {
            connectionLines.push({
              from: { x: fromNode.x + 40, y: fromNode.y }, // 노드 오른쪽에서 시작
              to: { x: toNode.x - 40, y: toNode.y }, // 노드 왼쪽으로 연결
              fromNode: fromNode.name,
              toNode: toNode.name
            });
          }
        });
      });
    });

    return { nodes: normalizedNodes, connections: connectionLines };
  }, [nodes, connections, width, height]);

  if (!nodes || nodes.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg border ${className}`} 
           style={{ width, height }}>
        <p className="text-gray-500 text-sm">워크플로우 데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className={`bg-transparent rounded-lg overflow-hidden ${className}`} style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        {/* 정의 섹션 */}
        <defs>
          {/* 각 노드의 그라데이션 정의 */}
          {normalizedData.nodes.map((node) => {
            const colors = getNodeColors(node.type);
            return (
              <linearGradient key={`gradient-${node.id}`} id={`gradient-${node.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.primary} />
                <stop offset="100%" stopColor={colors.secondary} />
              </linearGradient>
            );
          })}
          
          {/* 노드 그림자 필터 */}
          <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.15)" />
          </filter>
          
          {/* 연결선 화살표 */}
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

        {/* 연결선 렌더링 (베지어 곡선) */}
        {normalizedData.connections.map((connection, index) => (
          <path
            key={index}
            d={createBezierPath(
              connection.from.x,
              connection.from.y,
              connection.to.x,
              connection.to.y
            )}
            stroke="#6B7280"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
            opacity="0.7"
          />
        ))}

        {/* 노드 렌더링 */}
        {normalizedData.nodes.map((node) => {
          const IconComponent = getNodeIcon(node.type);
          const colors = getNodeColors(node.type);
          
          return (
            <g key={node.id}>
              {/* 노드 배경 (n8n 스타일 둥근 직사각형) */}
              <rect
                x={node.x - 40}
                y={node.y - 20}
                width="80"
                height="40"
                rx="6"
                ry="6"
                fill={`url(#gradient-${node.id})`}
                stroke="white"
                strokeWidth="2"
                filter="url(#nodeShadow)"
              />
              
              {/* 노드 아이콘 */}
              <foreignObject
                x={node.x - 8}
                y={node.y - 8}
                width="16"
                height="16"
              >
                <IconComponent 
                  className="w-4 h-4 text-white drop-shadow-sm" 
                  style={{ display: 'block' }}
                />
              </foreignObject>
              
              {/* 노드 이름 (n8n 스타일) */}
              <text
                x={node.x}
                y={node.y + 30}
                textAnchor="middle"
                className="fill-gray-700"
                style={{ 
                  fontSize: '11px', 
                  fontWeight: '500',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                {node.name.length > 14 ? `${node.name.substring(0, 12)}...` : node.name}
              </text>
              
              {/* 노드 실행 상태 표시 (n8n의 작은 플레이 버튼) */}
              <circle
                cx={node.x + 30}
                cy={node.y - 12}
                r="6"
                fill="white"
                stroke={colors.primary}
                strokeWidth="1.5"
                opacity="0.9"
              />
              <foreignObject
                x={node.x + 27}
                y={node.y - 15}
                width="6"
                height="6"
              >
                <Play 
                  className="w-1.5 h-1.5 text-gray-600" 
                  style={{ display: 'block' }}
                  fill="currentColor"
                />
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}