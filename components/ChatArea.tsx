import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { WorkflowExamples } from "./WorkflowExamples";
import { ChatInput } from "./ChatInput";
import { MessageActions } from "./MessageActions";
import { TypingIndicator } from "./TypingIndicator";
import { StreamingMessage } from "./StreamingMessage";
import { WorkflowUpload } from "./WorkflowUpload";
import { Bot, User } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  files?: string[];
  isStreaming?: boolean;
}

interface Workflow {
  id: string;
  title: string;
  image: string;
  isCustom?: boolean;
}

interface ChatAreaProps {
  onWorkflowSelect: (workflowId: string) => void;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onFileUpload: (files: File[]) => void;
  uploadedFiles: string[];
  onAddCustomWorkflow: (workflow: Workflow) => void;
  allWorkflows: Workflow[];
  onDeleteWorkflow?: (workflowId: string) => void;
}

export function ChatArea({ 
  onWorkflowSelect, 
  messages, 
  onSendMessage, 
  onFileUpload, 
  uploadedFiles,
  onAddCustomWorkflow,
  allWorkflows,
  onDeleteWorkflow
}: ChatAreaProps) {
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleMessageFeedback = (messageId: string, type: 'like' | 'dislike') => {
    console.log(`Message ${messageId} received ${type} feedback`);
  };

  const handleStreamingComplete = () => {
    setIsTyping(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="mb-12">
                <h1 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-white">
                  안녕하세요, 워크플로우 도우미입니다
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                  다양한 워크플로우를 선택하여 작업을 자동화하세요
                </p>
              </div>
              
              <WorkflowExamples 
                onWorkflowSelect={onWorkflowSelect}
                allWorkflows={allWorkflows}
                onDeleteWorkflow={onDeleteWorkflow}
              />
              
              <div className="mt-8">
                <WorkflowUpload onWorkflowAdd={onAddCustomWorkflow} />
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div key={message.id} className="group">
                  <div className={`px-4 py-6 ${
                    !message.isUser && index % 2 === 1 ? 'bg-accent/30' : 'bg-transparent'
                  }`}>
                    <div className="flex gap-4 max-w-full">
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                        {message.isUser ? (
                          <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
                            <User className="w-4 h-4 text-primary-foreground" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-2 text-foreground">
                          {message.isUser ? '사용자' : 'Assistant'}
                        </div>
                        
                        {message.files && message.files.length > 0 && (
                          <div className="mb-3 p-3 bg-muted rounded-lg text-sm flex items-center gap-2">
                            <span>📎</span>
                            <span className="text-muted-foreground">{message.files.join(', ')}</span>
                          </div>
                        )}
                        
                        <div className="text-foreground">
                          {message.isStreaming ? (
                            <StreamingMessage 
                              content={message.content}
                              onComplete={handleStreamingComplete}
                            />
                          ) : (
                            <div className="whitespace-pre-wrap leading-7 text-[15px]">
                              {message.content}
                            </div>
                          )}
                        </div>
                        
                        {!message.isUser && (
                          <div className="mt-3 flex items-center">
                            <MessageActions
                              message={message.content}
                              messageId={message.id}
                              isUser={message.isUser}
                              onFeedback={handleMessageFeedback}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="px-4 py-6">
                  <div className="flex gap-4 max-w-full">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                      <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-2">Assistant</div>
                      <TypingIndicator />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span>📎</span>
              <span>업로드된 파일: {uploadedFiles.join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      <div className="shrink-0 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <ChatInput 
            onSendMessage={onSendMessage}
            onFileUpload={onFileUpload}
            onTypingStart={() => setIsTyping(true)}
          />
        </div>
      </div>
    </div>
  );
}