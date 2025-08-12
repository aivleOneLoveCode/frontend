import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Upload, Plus, X, FileText } from "lucide-react";


interface Workflow {
  id: string;
  title: string;
  image: string;
  isCustom?: boolean;
  jsonData?: any;
  description?: string;
  n8nUrl?: string;
}

interface WorkflowUploadProps {
  onWorkflowAdd: (workflow: Workflow) => void;
}

// 워크플로우 카테고리별 기본 이미지
const DEFAULT_WORKFLOW_IMAGES = [
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop", // 데이터 분석
  "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=300&h=200&fit=crop", // 이미지 처리
  "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=300&h=200&fit=crop", // API
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop", // ML
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop", // 자동화
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop", // 보고서
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&h=200&fit=crop", // 일반
];

export function WorkflowUpload({ onWorkflowAdd }: WorkflowUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jsonData, setJsonData] = useState<any>(null);
  const [jsonFileName, setJsonFileName] = useState<string>("");
  const [n8nUrl, setN8nUrl] = useState("");
  
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const getWorkflowImage = (jsonData: any, title: string): string => {
    // JSON 데이터나 제목을 기반으로 적절한 이미지 선택
    const lowerTitle = title.toLowerCase();
    const nodeTypes = jsonData?.nodes?.map((node: any) => node.type?.toLowerCase() || '') || [];
    
    if (lowerTitle.includes('데이터') || lowerTitle.includes('분석') || nodeTypes.some(type => type.includes('csv') || type.includes('excel'))) {
      return DEFAULT_WORKFLOW_IMAGES[0];
    } else if (lowerTitle.includes('이미지') || nodeTypes.some(type => type.includes('image') || type.includes('edit'))) {
      return DEFAULT_WORKFLOW_IMAGES[1];
    } else if (lowerTitle.includes('api') || lowerTitle.includes('http') || nodeTypes.some(type => type.includes('http') || type.includes('webhook'))) {
      return DEFAULT_WORKFLOW_IMAGES[2];
    } else if (lowerTitle.includes('머신러닝') || lowerTitle.includes('ml') || lowerTitle.includes('ai')) {
      return DEFAULT_WORKFLOW_IMAGES[3];
    } else if (lowerTitle.includes('자동화') || lowerTitle.includes('스케줄') || nodeTypes.some(type => type.includes('cron') || type.includes('schedule'))) {
      return DEFAULT_WORKFLOW_IMAGES[4];
    } else if (lowerTitle.includes('보고서') || lowerTitle.includes('리포트') || nodeTypes.some(type => type.includes('pdf') || type.includes('html'))) {
      return DEFAULT_WORKFLOW_IMAGES[5];
    } else {
      return DEFAULT_WORKFLOW_IMAGES[6];
    }
  };

  const extractWorkflowInfo = (jsonData: any) => {
    let extractedTitle = "";
    let extractedDescription = "";

    // n8n 워크플로우에서 제목 추출
    if (jsonData.name) {
      extractedTitle = jsonData.name;
    } else if (jsonData.meta?.name) {
      extractedTitle = jsonData.meta.name;
    } else if (jsonData.nodes && jsonData.nodes.length > 0) {
      // 첫 번째 노드 이름을 기반으로 제목 생성
      extractedTitle = `${jsonData.nodes[0].name} 워크플로우`;
    }

    // 설명 생성 (노드 수 기반)
    if (jsonData.nodes) {
      const nodeCount = jsonData.nodes.length;
      const nodeTypes = [...new Set(jsonData.nodes.map((node: any) => 
        node.type?.replace('n8n-nodes-base.', '') || 'Unknown'
      ))];
      
      extractedDescription = `${nodeCount}개의 노드로 구성된 워크플로우입니다. `;
      if (nodeTypes.length <= 3) {
        extractedDescription += `주요 구성요소: ${nodeTypes.join(', ')}`;
      } else {
        extractedDescription += `${nodeTypes.slice(0, 3).join(', ')} 등의 구성요소를 포함합니다.`;
      }
    }

    return { extractedTitle, extractedDescription };
  };

  const handleJsonSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonContent = JSON.parse(e.target?.result as string);
            setJsonData(jsonContent);
            setJsonFileName(file.name);
            
            // 워크플로우 정보 자동 추출
            const { extractedTitle, extractedDescription } = extractWorkflowInfo(jsonContent);
            
            if (extractedTitle && !title) {
              setTitle(extractedTitle);
            }
            if (extractedDescription && !description) {
              setDescription(extractedDescription);
            }
            
            console.log("워크플로우를 성공적으로 로드했습니다");
          } catch (error) {
            console.log("올바른 JSON 파일이 아닙니다");
          }
        };
        reader.readAsText(file);
      } else {
        console.log("JSON 파일만 업로드 가능합니다");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !jsonData) {
      console.log("제목과 워크플로우 JSON 파일을 모두 입력해주세요");
      return;
    }

    // 워크플로우 이미지 자동 선택
    const workflowImage = getWorkflowImage(jsonData, title);

    onWorkflowAdd({
      id: Date.now().toString(),
      title,
      image: workflowImage,
      description,
      jsonData,
      n8nUrl: n8nUrl.trim() || undefined,
      isCustom: true
    });

    // 폼 리셋
    setTitle("");
    setDescription("");
    setJsonData(null);
    setJsonFileName("");
    setN8nUrl("");
    setIsOpen(false);
    
    console.log("워크플로우가 추가되었습니다");
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setJsonData(null);
    setJsonFileName("");
    setN8nUrl("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-gray-300">
          <Plus className="w-4 h-4" />
          워크플로우 추가
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl backdrop-blur-none">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">워크플로우 추가</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>워크플로우 JSON 파일 *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {jsonData ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <span className="text-sm font-medium text-green-700">{jsonFileName}</span>
                        <div className="text-xs text-green-600">
                          {jsonData.nodes?.length || 0}개 노드, {Object.keys(jsonData.connections || {}).length}개 연결
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setJsonData(null);
                        setJsonFileName("");
                        setTitle("");
                        setDescription("");
                        setN8nUrl("");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {jsonData.nodes && jsonData.nodes.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">포함된 노드:</span>{" "}
                      {jsonData.nodes.slice(0, 3).map((node: any) => node.name).join(", ")}
                      {jsonData.nodes.length > 3 && ` 외 ${jsonData.nodes.length - 3}개`}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => jsonInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground text-center">
                    워크플로우 JSON 파일을 업로드하세요
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    클릭하거나 파일을 드래그해서 업로드
                  </p>
                </div>
              )}
            </div>
            <input
              ref={jsonInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleJsonSelect}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">워크플로우 제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="워크플로우 제목을 입력하세요"
            />
            <p className="text-xs text-muted-foreground">
              JSON 파일에서 자동으로 추출되지만 수정할 수 있습니다
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="n8n-url">n8n 워크플로우 URL (선택사항)</Label>
            <Input
              id="n8n-url"
              value={n8nUrl}
              onChange={(e) => setN8nUrl(e.target.value)}
              placeholder="https://your-n8n-instance.com/workflow/123"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              n8n 인스턴스의 워크플로우 URL을 입력하면 실제 워크플로우 화면이 표시됩니다
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="워크플로우에 대한 설명을 입력하세요"
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              JSON 파일에서 자동으로 생성되지만 수정할 수 있습니다
            </p>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button type="submit" disabled={!jsonData || !title}>
              추가
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}