import { useState } from "react";
import { Button } from "./ui/button";
import { Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { toast } from "sonner";

interface MessageActionsProps {
  message: string;
  messageId: string;
  isUser: boolean;
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void;
}

export function MessageActions({ message, messageId, isUser, onFeedback }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("메시지가 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("복사에 실패했습니다");
    }
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    onFeedback?.(messageId, type);
    toast.success(type === 'like' ? "좋아요를 누르셨습니다" : "싫어요를 누르셨습니다");
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-6 w-6 p-0"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </Button>
      
      {!isUser && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFeedback('like')}
            className={`h-6 w-6 p-0 ${feedback === 'like' ? 'text-green-600' : ''}`}
          >
            <ThumbsUp className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFeedback('dislike')}
            className={`h-6 w-6 p-0 ${feedback === 'dislike' ? 'text-red-600' : ''}`}
          >
            <ThumbsDown className="w-3 h-3" />
          </Button>
        </>
      )}
    </div>
  );
}