import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send, Paperclip, Plus } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (files: File[]) => void;
  onTypingStart?: () => void;
}

export function ChatInput({ onSendMessage, onFileUpload, onTypingStart }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      onTypingStart?.();
      // 텍스트 영역 높이 리셋
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 200)}px`;
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight(e.target);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div 
        className={`relative flex items-end gap-2 p-2 border border-gray-300 rounded-2xl bg-background transition-all ${
          isDragging 
            ? 'ring-2 ring-primary border-primary bg-primary/5' 
            : message.trim() 
              ? 'border-gray-400 shadow-md' 
              : 'border-gray-300 hover:shadow-sm'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 h-9 w-9 hover:bg-muted rounded-xl"
        >
          <Plus className="w-4 h-4" />
        </Button>

        <div className="flex-1 relative min-h-[24px]">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            placeholder="메시지 보내기"
            className="chat-input min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 p-2 text-[15px] leading-6 placeholder:text-muted-foreground/70"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          {isDragging && (
            <div className="absolute inset-0 rounded-xl flex items-center justify-center text-primary bg-primary/5 border-2 border-dashed border-primary">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Paperclip className="w-4 h-4" />
                <span>파일을 여기에 드롭하세요</span>
              </div>
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim()}
          size="icon"
          className={`shrink-0 h-8 w-8 rounded-lg transition-all ${
            message.trim() 
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="mt-2 px-3">
        <p className="text-xs text-muted-foreground/70 text-center">
          Enter를 눌러 전송, Shift+Enter로 줄바꿈
        </p>
      </div>
    </form>
  );
}