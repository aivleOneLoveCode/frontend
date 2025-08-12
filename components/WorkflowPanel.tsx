import { Button } from "./ui/button";
import { X, Download, Code, Info } from "lucide-react";
import { WorkflowDiagram } from "./WorkflowDiagram";
import { N8nWorkflowViewer } from "./N8nWorkflowViewer";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface Workflow {
  id: string;
  title: string;
  image: string;
  isCustom?: boolean;
  jsonData?: any;
  description?: string;
  n8nUrl?: string;
}

interface WorkflowPanelProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow | null;
  onDownload: () => void;
  onDelete: (workflowId: string) => void;
}

export function WorkflowPanel({ isOpen, onClose, workflow, onDownload, onDelete }: WorkflowPanelProps) {
  if (!isOpen || !workflow) return null;

  const handleDownload = () => {
    if (workflow.jsonData) {
      onDownload();
    }
  };

  const handleDelete = () => {
    onDelete(workflow.id);
    onClose();
  };

  const nodeCount = workflow.jsonData?.nodes?.length || 0;
  const connectionCount = workflow.jsonData?.connections 
    ? Object.values(workflow.jsonData.connections).reduce((acc: number, conn: any) => acc + conn.main.length, 0)
    : 0;

  return (
    <div className="w-full border-l border-gray-300 bg-background flex flex-col h-full">
      <div className="p-4 border-b border-gray-300 flex justify-between items-start shrink-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{workflow.title}</h3>
            {workflow.isCustom && (
              <Badge variant="secondary" className="text-xs">
                사용자 정의
              </Badge>
            )}
          </div>
          {workflow.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {workflow.description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* 워크플로우 시각화 */}
      <div className="p-4 border-b border-gray-300">
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-300 relative group">
          {workflow.n8nUrl ? (
            <N8nWorkflowViewer 
              url={workflow.n8nUrl}
              width={400}
              height={225}
              className="w-full h-full"
            />
          ) : workflow.jsonData ? (
            <WorkflowDiagram 
              workflowData={workflow.jsonData}
              width={400}
              height={225}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <p className="text-gray-500 text-sm">워크플로우 데이터 없음</p>
            </div>
          )}
          
          {/* 사용자 정의 워크플로우 삭제 버튼 */}
          {workflow.isCustom && (
            <div className="absolute top-2 right-2">
              <button
                className="w-6 h-6 bg-red-500/90 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg flex items-center justify-center"
                onClick={handleDelete}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 워크플로우 정보 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-medium">워크플로우 정보</h4>
            </div>
            
            {/* n8n URL 정보 */}
            {workflow.n8nUrl && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="text-blue-800 text-sm font-medium mb-1">n8n 워크플로우</div>
                <div className="text-blue-600 text-xs break-all">{workflow.n8nUrl}</div>
              </div>
            )}

            {workflow.jsonData && (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-muted-foreground">노드 수</div>
                    <div className="font-medium">{nodeCount}개</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-muted-foreground">연결 수</div>
                    <div className="font-medium">{connectionCount}개</div>
                  </div>
                </div>

                {workflow.jsonData.nodes && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">포함된 노드</h5>
                    <div className="space-y-1">
                      {workflow.jsonData.nodes.map((node: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                          <span className="font-medium">{node.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {node.type?.replace('n8n-nodes-base.', '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {!workflow.jsonData && !workflow.n8nUrl && (
            <div className="text-center py-8 text-muted-foreground">
              <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">이 워크플로우에는 데이터가 없습니다</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 다운로드 버튼 */}
      {workflow.jsonData && (
        <div className="p-4 border-t border-gray-300 shrink-0">
          <Button 
            onClick={handleDownload} 
            className="w-full gap-2 bg-sky-100 hover:bg-sky-200 text-sky-800 border-sky-300"
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4" />
            다운로드
          </Button>
        </div>
      )}
    </div>
  );
}