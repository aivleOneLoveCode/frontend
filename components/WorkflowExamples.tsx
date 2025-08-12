import { useState } from "react";
import { WorkflowDiagram } from "./WorkflowDiagram";
import { N8nWorkflowViewer } from "./N8nWorkflowViewer";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface Workflow {
  id: string;
  title: string;
  image: string;
  isCustom?: boolean;
  jsonData?: any;
  n8nUrl?: string;
}

interface WorkflowExamplesProps {
  onWorkflowSelect: (workflowId: string) => void;
  allWorkflows: Workflow[];
  onDeleteWorkflow?: (workflowId: string) => void;
}

export function WorkflowExamples({ onWorkflowSelect, allWorkflows, onDeleteWorkflow }: WorkflowExamplesProps) {
  const customWorkflows = allWorkflows.filter(w => w.isCustom);
  const defaultWorkflows = allWorkflows.filter(w => !w.isCustom);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleDeleteWorkflow = (e: React.MouseEvent, workflowId: string) => {
    e.stopPropagation();
    if (onDeleteWorkflow) {
      onDeleteWorkflow(workflowId);
    }
  };

  return (
    <div className="mb-6">
      {customWorkflows.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-gray-800">
            내 워크플로우 ({customWorkflows.length}개)
          </h3>
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            {customWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="cursor-pointer"
                onClick={() => onWorkflowSelect(workflow.id)}
                onMouseEnter={() => setHoveredCard(workflow.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 relative">
                  <div className="aspect-[4/3] mb-4 flex items-center justify-center">
                    {workflow.n8nUrl ? (
                      <N8nWorkflowViewer 
                        url={workflow.n8nUrl}
                        width={200}
                        height={150}
                        className="w-full h-full"
                      />
                    ) : workflow.jsonData ? (
                      <WorkflowDiagram 
                        workflowData={workflow.jsonData}
                        width={200}
                        height={150}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400 text-sm">워크플로우 데이터 없음</p>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 dark:text-white text-center">
                    {workflow.title}
                  </h3>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                    내 워크플로우
                  </div>
                  
                  {/* 삭제 버튼 */}
                  {hoveredCard === workflow.id && (
                    <button
                      className="absolute top-2 right-2 w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center text-sm"
                      onClick={(e) => handleDeleteWorkflow(e, workflow.id)}
                      style={{ zIndex: 999 }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
          {defaultWorkflows.slice(0, 4).map((workflow) => (
            <div
              key={workflow.id}
              className="cursor-pointer group"
              onClick={() => onWorkflowSelect(workflow.id)}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 relative">
                <div className="aspect-[4/3] mb-4 flex items-center justify-center">
                  {workflow.n8nUrl ? (
                    <N8nWorkflowViewer 
                      url={workflow.n8nUrl}
                      width={200}
                      height={150}
                      className="w-full h-full"
                    />
                  ) : workflow.jsonData ? (
                    <WorkflowDiagram 
                      workflowData={workflow.jsonData}
                      width={200}
                      height={150}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400 text-sm">워크플로우 데이터 없음</p>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-white text-center">
                  {workflow.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}