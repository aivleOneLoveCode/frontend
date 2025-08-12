import { Button } from "./ui/button";
import { MessageSquare, Download, LogIn } from "lucide-react";


interface Workflow {
  id: string;
  title: string;
  image: string;
  isCustom?: boolean;
  jsonData?: any;
  description?: string;
}

interface HeaderProps {
  onDownload: () => void;
  currentWorkflow: Workflow | null;
  onLoginClick: () => void;
  onBoardClick: () => void;
}

export function Header({ onDownload, currentWorkflow, onLoginClick, onBoardClick }: HeaderProps) {
  const handleDownloadClick = () => {
    if (currentWorkflow && currentWorkflow.jsonData) {
      onDownload();
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">워크플로우 AI</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDownloadClick}
          disabled={!currentWorkflow || !currentWorkflow.jsonData}
          className="gap-2 h-8 px-3"
        >
          <Download className="w-4 h-4" />
          다운로드
        </Button>
        
        <Button variant="ghost" size="sm" className="gap-2 h-8 px-3" onClick={onBoardClick}>
          <MessageSquare className="w-4 h-4" />
          게시판
        </Button>
        
        <Button variant="ghost" size="sm" className="gap-2 h-8 px-3" onClick={onLoginClick}>
          <LogIn className="w-4 h-4" />
          로그인
        </Button>
      </div>
    </header>
  );
}