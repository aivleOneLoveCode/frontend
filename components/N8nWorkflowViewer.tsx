import { useState } from "react";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface N8nWorkflowViewerProps {
  url: string;
  width?: number;
  height?: number;
  className?: string;
}

export function N8nWorkflowViewer({ 
  url, 
  width = 300, 
  height = 200, 
  className = "" 
}: N8nWorkflowViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // URL 유효성 검사
  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  // n8n URL을 임베드 가능한 형태로 변환
  const getEmbedUrl = (originalUrl: string) => {
    try {
      const url = new URL(originalUrl);
      
      // n8n 워크플로우 URL 패턴 확인
      if (url.pathname.includes('/workflow/')) {
        // 이미 임베드 URL인지 확인
        if (!url.searchParams.has('embed')) {
          url.searchParams.set('embed', 'true');
          url.searchParams.set('mode', 'readonly'); // 읽기 전용 모드
        }
        return url.toString();
      }
      
      return originalUrl;
    } catch (e) {
      return originalUrl;
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleOpenInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isValidUrl(url)) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-sm text-red-700">유효하지 않은 URL입니다</p>
        <p className="text-xs text-red-600 mt-1">{url}</p>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(url);

  return (
    <div 
      className={`relative bg-white border rounded-lg overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            <p className="text-sm text-gray-600">n8n 워크플로우를 로드하는 중...</p>
          </div>
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-50 border border-yellow-200 z-10">
          <AlertCircle className="w-8 h-8 text-yellow-600 mb-2" />
          <p className="text-sm text-yellow-800 mb-2">워크플로우를 로드할 수 없습니다</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
            className="gap-2"
          >
            <ExternalLink className="w-3 h-3" />
            새 탭에서 열기
          </Button>
        </div>
      ) : (
        <>
          <iframe
            src={embedUrl}
            width={width}
            height={height}
            frameBorder="0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin allow-forms"
            referrerPolicy="strict-origin-when-cross-origin"
            title="n8n Workflow"
          />
          
          {/* 새 탭에서 열기 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenInNewTab}
            className="absolute top-2 right-2 w-6 h-6 bg-white/80 hover:bg-white shadow-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </>
      )}
    </div>
  );
}