import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { WorkflowDiagram } from "./WorkflowDiagram";
import { Plus, MessageSquare, ChevronLeft, ChevronRight, X, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  files?: string[];
}

interface Workflow {
  id: string;
  title: string;
  image: string;
  isCustom?: boolean;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  workflow?: Workflow;
  messages: Message[];
  createdAt: Date;
}

interface SidebarProps {
  workflows: Workflow[];
  currentWorkflowIndex: number;
  onWorkflowNavigate: (direction: 'prev' | 'next') => void;
  onWorkflowClick: () => void;
  onChatHistoryClick: (chat: ChatHistory) => void;
  onNewChat: () => void;
  chatHistories: ChatHistory[];
  onDeleteChatHistory: (chatId: string) => void;
  onEditChatTitle: (chatId: string, newTitle: string) => void;
  onDeleteWorkflow?: (workflowId: string) => void;
}

export function Sidebar({ 
  workflows,
  currentWorkflowIndex,
  onWorkflowNavigate,
  onWorkflowClick,
  onChatHistoryClick, 
  onNewChat,
  chatHistories,
  onDeleteChatHistory,
  onEditChatTitle,
  onDeleteWorkflow
}: SidebarProps) {
  const currentWorkflow = workflows[currentWorkflowIndex];
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [hoveredWorkflow, setHoveredWorkflow] = useState<boolean>(false);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  const handleDeleteWorkflow = (e: React.MouseEvent, workflowId: string) => {
    e.stopPropagation();
    if (onDeleteWorkflow) {
      onDeleteWorkflow(workflowId);
    }
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    onDeleteChatHistory(chatId);
  };

  const handleEditTitle = (chat: ChatHistory) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveTitle = () => {
    if (editingChatId && editingTitle.trim()) {
      onEditChatTitle(editingChatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
      setEditingTitle("");
    }
  };

  return (
    <div className="w-80 border-r border-sky-200 bg-sky-50 flex flex-col h-full">
      {/* 새 채팅 버튼 */}
      <div className="p-3 border-b border-sky-200">
        <Button 
          onClick={onNewChat}
          className="w-full justify-start gap-2 h-11 bg-transparent border border-sky-300 hover:bg-sky-100 text-sky-900 font-medium"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          새 채팅
        </Button>
      </div>
      
      {/* 현재 워크플로우 */}
      {currentWorkflow && (
        <div className="p-3 border-b border-sky-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sky-900">현재 워크플로우</span>
            <div className="flex items-center gap-1">
              {workflows.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={() => onWorkflowNavigate('prev')}
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <span className="text-xs text-sky-600 px-1">
                    {currentWorkflowIndex + 1}/{workflows.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={() => onWorkflowNavigate('next')}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div 
            className="relative bg-sky-100 rounded-lg p-6 cursor-pointer hover:bg-sky-200 transition-colors"
            onClick={onWorkflowClick}
            onMouseEnter={() => setHoveredWorkflow(true)}
            onMouseLeave={() => setHoveredWorkflow(false)}
          >
            <div className="flex flex-col">
              <div className="relative w-full h-32 bg-sky-200 rounded-lg flex items-center justify-center mb-2 hover:bg-sky-300 transition-colors overflow-hidden">
                {currentWorkflow.jsonData ? (
                  <div className="w-full h-full">
                    <WorkflowDiagram 
                      workflowData={currentWorkflow.jsonData}
                      width={256}
                      height={128}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <MessageSquare className="w-16 h-16 text-sky-700" />
                )}
                {hoveredWorkflow && (
                  <button
                    className="absolute top-1 right-1 w-5 h-5 bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center text-xs"
                    onClick={(e) => handleDeleteWorkflow(e, currentWorkflow.id)}
                    style={{ zIndex: 999 }}
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="text-center">
                <div className="font-medium text-sm text-sky-900 truncate">{currentWorkflow.title}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 채팅 기록 */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-3 border-b border-sky-200">
          <span className="text-sm font-medium text-sky-900">채팅 기록</span>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chatHistories.length === 0 ? (
              <div className="p-4 text-center text-sm text-sky-600">
                채팅 기록이 없습니다
              </div>
            ) : (
              chatHistories.map((chat) => (
                <div key={chat.id} className="relative">
                  <div
                    className="sidebar-item cursor-pointer hover:bg-sky-100 rounded-lg p-3 transition-colors relative"
                    onClick={() => onChatHistoryClick(chat)}
                    onMouseEnter={() => setHoveredChatId(chat.id)}
                    onMouseLeave={() => setHoveredChatId(null)}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-10">
                      <MessageSquare className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {editingChatId === chat.id ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={handleSaveTitle}
                            onKeyDown={handleKeyPress}
                            className="w-full text-sm bg-transparent border-none outline-none text-sky-900"
                            autoFocus
                          />
                        ) : (
                          <>
                            <div className="font-medium text-sm text-sky-900 overflow-hidden">
                              {chat.title.length > 25 ? `${chat.title.substring(0, 22)}...` : chat.title}
                            </div>
                            <div className="text-xs text-sky-600 overflow-hidden">
                              {chat.lastMessage.length > 30 ? `${chat.lastMessage.substring(0, 27)}...` : chat.lastMessage}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {hoveredChatId === chat.id && (
                      <button
                        className="absolute top-2 right-4 w-5 h-5 bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center text-xs"
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                        style={{ zIndex: 999 }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}