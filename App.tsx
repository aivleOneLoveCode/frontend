import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar"; 
import { ChatArea } from "./components/ChatArea";
import { WorkflowPanel } from "./components/WorkflowPanel";
import { Login } from "./components/Login";
import { Board } from "./components/Board";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./components/ui/resizable";
import { Toaster } from "./components/ui/sonner";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { generateChatTitle, formatTimestamp } from "./utils/chatUtils";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  files?: string[];
  isStreaming?: boolean;
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

interface Workflow {
  id: string;
  title: string;
  image: string;
  isCustom?: boolean;
  jsonData?: any; // n8n 워크플로우 JSON 데이터
  description?: string;
  n8nUrl?: string; // n8n 워크플로우 URL
}

const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: "default-1",
    title: "데이터 분석",
    image: "",
    description: "CSV 파일을 읽어서 데이터를 분석하고 리포트를 생성하는 워크플로우",
    jsonData: {
      "meta": { "instanceId": "example" },
      "nodes": [
        {
          "parameters": { "filePath": "/data/input.csv" },
          "id": "csv-reader",
          "name": "CSV Reader",
          "type": "n8n-nodes-base.csvRead",
          "position": [240, 300]
        },
        {
          "parameters": { "operation": "aggregate" },
          "id": "data-processor",
          "name": "Data Processor", 
          "type": "n8n-nodes-base.aggregate",
          "position": [460, 300]
        },
        {
          "parameters": { "templateName": "analysis-report" },
          "id": "report-generator",
          "name": "Report Generator",
          "type": "n8n-nodes-base.html",
          "position": [680, 300]
        }
      ],
      "connections": {
        "CSV Reader": { "main": [["Data Processor"]] },
        "Data Processor": { "main": [["Report Generator"]] }
      }
    }
  },
  {
    id: "default-2", 
    title: "이미지 처리",
    image: "",
    description: "이미지를 리사이즈하고 워터마크를 추가하는 자동화 워크플로우",
    jsonData: {
      "meta": { "instanceId": "example" },
      "nodes": [
        {
          "parameters": { "path": "/images/input" },
          "id": "image-input",
          "name": "Image Input",
          "type": "n8n-nodes-base.readBinaryFiles",
          "position": [240, 300]
        },
        {
          "parameters": { "width": 800, "height": 600 },
          "id": "image-resize",
          "name": "Resize Image",
          "type": "n8n-nodes-base.editImage",
          "position": [460, 300]
        },
        {
          "parameters": { "watermarkText": "Processed" },
          "id": "add-watermark",
          "name": "Add Watermark",
          "type": "n8n-nodes-base.editImage",
          "position": [680, 300]
        }
      ],
      "connections": {
        "Image Input": { "main": [["Resize Image"]] },
        "Resize Image": { "main": [["Add Watermark"]] }
      }
    }
  },
  {
    id: "default-3",
    title: "API 연동",
    image: "",
    description: "외부 API에서 데이터를 가져와서 데이터베이스에 저장하는 워크플로우",
    jsonData: {
      "meta": { "instanceId": "example" },
      "nodes": [
        {
          "parameters": { "url": "https://api.example.com/data", "method": "GET" },
          "id": "api-request",
          "name": "API Request",
          "type": "n8n-nodes-base.httpRequest",
          "position": [240, 300]
        },
        {
          "parameters": { "operation": "transform" },
          "id": "data-transform",
          "name": "Transform Data",
          "type": "n8n-nodes-base.function",
          "position": [460, 300]
        },
        {
          "parameters": { "table": "processed_data" },
          "id": "database-insert",
          "name": "Database Insert",
          "type": "n8n-nodes-base.postgres",
          "position": [680, 300]
        }
      ],
      "connections": {
        "API Request": { "main": [["Transform Data"]] },
        "Transform Data": { "main": [["Database Insert"]] }
      }
    }
  },
  {
    id: "default-4",
    title: "머신러닝",
    image: "",
    description: "데이터를 전처리하고 ML 모델로 예측을 수행하는 워크플로우",
    jsonData: {
      "meta": { "instanceId": "example" },
      "nodes": [
        {
          "parameters": { "dataSource": "training_data" },
          "id": "data-loader",
          "name": "Data Loader",
          "type": "n8n-nodes-base.readPDF",
          "position": [240, 300]
        },
        {
          "parameters": { "features": ["feature1", "feature2"] },
          "id": "feature-engineering",
          "name": "Feature Engineering",
          "type": "n8n-nodes-base.function",
          "position": [460, 300]
        },
        {
          "parameters": { "modelType": "regression" },
          "id": "ml-prediction",
          "name": "ML Prediction",
          "type": "n8n-nodes-base.httpRequest",
          "position": [680, 300]
        }
      ],
      "connections": {
        "Data Loader": { "main": [["Feature Engineering"]] },
        "Feature Engineering": { "main": [["ML Prediction"]] }
      }
    }
  },
  {
    id: "default-5",
    title: "자동화",
    image: "",
    description: "스케줄된 작업으로 데이터를 백업하고 알림을 보내는 워크플로우",
    jsonData: {
      "meta": { "instanceId": "example" },
      "nodes": [
        {
          "parameters": { "rule": { "interval": [{ "field": "hours", "value": 24 }] } },
          "id": "schedule-trigger",
          "name": "Daily Schedule",
          "type": "n8n-nodes-base.cron",
          "position": [240, 300]
        },
        {
          "parameters": { "source": "/data", "destination": "/backup" },
          "id": "backup-data",
          "name": "Backup Data",
          "type": "n8n-nodes-base.executeCommand",
          "position": [460, 300]
        },
        {
          "parameters": { "message": "Daily backup completed" },
          "id": "send-notification",
          "name": "Send Notification",
          "type": "n8n-nodes-base.slack",
          "position": [680, 300]
        }
      ],
      "connections": {
        "Daily Schedule": { "main": [["Backup Data"]] },
        "Backup Data": { "main": [["Send Notification"]] }
      }
    }
  },
  {
    id: "default-6",
    title: "보고서 생성",
    image: "",
    description: "데이터를 수집하고 차트를 생성하여 PDF 보고서를 만드는 워크플로우",
    jsonData: {
      "meta": { "instanceId": "example" },
      "nodes": [
        {
          "parameters": { "query": "SELECT * FROM sales_data" },
          "id": "collect-data",
          "name": "Collect Data",
          "type": "n8n-nodes-base.postgres",
          "position": [240, 300]
        },
        {
          "parameters": { "chartType": "bar", "xAxis": "month", "yAxis": "revenue" },
          "id": "generate-chart",
          "name": "Generate Chart",
          "type": "n8n-nodes-base.function",
          "position": [460, 300]
        },
        {
          "parameters": { "template": "monthly-report", "format": "pdf" },
          "id": "create-pdf",
          "name": "Create PDF Report",
          "type": "n8n-nodes-base.html",
          "position": [680, 300]
        }
      ],
      "connections": {
        "Collect Data": { "main": [["Generate Chart"]] },
        "Generate Chart": { "main": [["Create PDF Report"]] }
      }
    }
  }
];

const AI_RESPONSES = [
  "네, 말씀하신 내용을 이해했습니다. 워크플로우와 관련해서 더 자세히 설명해드릴까요?",
  "좋은 질문이네요! 이 워크플로우의 핵심은 효율적인 데이터 처리에 있습니다. 각 단계별로 설명드리면...",
  "워크플로우 최적화를 위해서는 몇 가지 고려사항이 있습니다:\n1. 병목 구간 식별\n2. 자동화 가능한 부분 파악\n3. 에러 핸들링 전략",
  "제안해주신 방법이 흥미롭네요. 이를 실제로 구현하려면 다음과 같은 접근을 고려해볼 수 있습니다...",
  "이 워크플로우의 장점은 확장성과 유지보수성을 동시에 확보할 수 있다는 점입니다. 특히 대용량 데이터 처리 시에..."
];

export default function App() {
  const [currentView, setCurrentView] = useState<'main' | 'login' | 'board'>('main');
  const [currentWorkflowIndex, setCurrentWorkflowIndex] = useState<number>(0);
  const [isWorkflowPanelOpen, setIsWorkflowPanelOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // 로컬 스토리지에 채팅 기록 저장
  const [chatHistories, setChatHistories] = useLocalStorage<ChatHistory[]>('chat-histories', []);
  const [customWorkflows, setCustomWorkflows] = useLocalStorage<Workflow[]>('custom-workflows', []);

  // 전체 워크플로우 목록 (사용자 정의 + 기본)
  const allWorkflows = [...customWorkflows.map(w => ({ ...w, isCustom: true })), ...DEFAULT_WORKFLOWS];
  const currentWorkflow = allWorkflows[currentWorkflowIndex] || null;

  // 현재 채팅을 자동으로 저장
  useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      const firstUserMessage = messages.find(m => m.isUser)?.content || '';
      const lastMessage = messages[messages.length - 1]?.content || '';
      const title = generateChatTitle(firstUserMessage);

      setChatHistories(prev => {
        const existingIndex = prev.findIndex(chat => chat.id === currentChatId);
        const updatedChat: ChatHistory = {
          id: currentChatId,
          title,
          lastMessage: lastMessage.length > 30 ? lastMessage.substring(0, 27) + '...' : lastMessage,
          timestamp: formatTimestamp(new Date()),
          workflow: currentWorkflow || undefined,
          messages: messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          createdAt: new Date()
        };

        if (existingIndex >= 0) {
          const newHistories = [...prev];
          newHistories[existingIndex] = updatedChat;
          return newHistories;
        } else {
          return [updatedChat, ...prev];
        }
      });
    }
  }, [messages, currentChatId, currentWorkflow, setChatHistories]);

  const handleWorkflowSelect = (workflowId: string) => {
    const index = allWorkflows.findIndex(w => w.id === workflowId);
    if (index >= 0) {
      setCurrentWorkflowIndex(index);
    }
  };

  const handleWorkflowNavigate = (direction: 'prev' | 'next') => {
    if (allWorkflows.length === 0) return;

    if (direction === 'prev') {
      setCurrentWorkflowIndex(prev => 
        prev > 0 ? prev - 1 : allWorkflows.length - 1
      );
    } else {
      setCurrentWorkflowIndex(prev => 
        prev < allWorkflows.length - 1 ? prev + 1 : 0
      );
    }
  };

  const handleWorkflowClick = () => {
    if (currentWorkflow) {
      setIsWorkflowPanelOpen(true);
    }
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    const workflowToDelete = allWorkflows.find(w => w.id === workflowId);
    
    if (!workflowToDelete) {
      console.log("워크플로우를 찾을 수 없습니다");
      return;
    }

    if (!workflowToDelete.isCustom) {
      console.log("기본 워크플로우는 삭제할 수 없습니다");
      return;
    }

    // 사용자 정의 워크플로우에서 제거
    setCustomWorkflows(prev => prev.filter(w => w.id !== workflowId));
    
    // 현재 워크플로우가 삭제되는 경우 첫 번째 워크플로우로 이동
    if (currentWorkflow && currentWorkflow.id === workflowId) {
      setCurrentWorkflowIndex(0);
      setIsWorkflowPanelOpen(false);
    } else if (currentWorkflowIndex > 0) {
      // 삭제된 워크플로우보다 뒤에 있는 경우 인덱스 조정
      const deletedIndex = allWorkflows.findIndex(w => w.id === workflowId);
      if (deletedIndex < currentWorkflowIndex) {
        setCurrentWorkflowIndex(prev => prev - 1);
      }
    }

    console.log(`${workflowToDelete.title} 워크플로우를 삭제했습니다`);
  };

  const handleChatHistoryClick = (chat: ChatHistory) => {
    if (chat.workflow) {
      const index = allWorkflows.findIndex(w => w.id === chat.workflow!.id);
      if (index >= 0) {
        setCurrentWorkflowIndex(index);
      }
    }
    
    setMessages(chat.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    })));
    setCurrentChatId(chat.id);
    setIsWorkflowPanelOpen(false);
    setUploadedFiles([]);
  };

  const handleDeleteChatHistory = (chatId: string) => {
    const chatToDelete = chatHistories.find(chat => chat.id === chatId);
    
    if (!chatToDelete) {
      console.log("채팅 기록을 찾을 수 없습니다");
      return;
    }

    setChatHistories(prev => prev.filter(chat => chat.id !== chatId));
    
    // 현재 채팅이 삭제되는 경우 새 채팅으로 초기화
    if (currentChatId === chatId) {
      handleNewChat();
    }

    console.log("채팅 기록을 삭제했습니다");
  };

  const handleEditChatTitle = (chatId: string, newTitle: string) => {
    setChatHistories(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, title: newTitle }
          : chat
      )
    );
    console.log("채팅 제목을 수정했습니다");
  };

  const handleNewChat = () => {
    setMessages([]);
    setUploadedFiles([]);
    setIsWorkflowPanelOpen(false);
    setCurrentChatId(null);
  };

  const handleSendMessage = (content: string) => {
    // 새 채팅인 경우 ID 생성
    if (!currentChatId) {
      setCurrentChatId(Date.now().toString());
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setUploadedFiles([]);

    // 스트리밍 AI 응답
    setTimeout(() => {
      const randomResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        isUser: false,
        timestamp: new Date(),
        isStreaming: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 800);
  };

  const handleFileUpload = (files: File[]) => {
    const fileNames = files.map(file => file.name);
    setUploadedFiles(prev => [...prev, ...fileNames]);
  };

  const handleAddCustomWorkflow = (workflow: Workflow) => {
    const newWorkflow = { ...workflow, isCustom: true };
    setCustomWorkflows(prev => [...prev, newWorkflow]);
    // 새로 추가된 워크플로우로 이동
    setCurrentWorkflowIndex(customWorkflows.length);
  };

  const handleImportWorkflow = (workflow: Workflow) => {
    handleAddCustomWorkflow(workflow);
    setCurrentView('main'); // 메인 화면으로 돌아가기
  };

  const handleDownloadWorkflow = () => {
    if (currentWorkflow && currentWorkflow.jsonData) {
      const dataStr = JSON.stringify(currentWorkflow.jsonData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentWorkflow.title.replace(/\s+/g, '_')}_n8n_workflow.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleLoginClick = () => {
    setCurrentView('login');
  };

  const handleBoardClick = () => {
    setCurrentView('board');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  // 채팅 기록을 최신순으로 정렬
  const sortedChatHistories = [...chatHistories].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 로그인 화면 렌더링
  if (currentView === 'login') {
    return <Login onBack={handleBackToMain} />;
  }

  // 게시판 화면 렌더링
  if (currentView === 'board') {
    return <Board onBack={handleBackToMain} onImportWorkflow={handleImportWorkflow} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header 
        onDownload={handleDownloadWorkflow} 
        currentWorkflow={currentWorkflow}
        onLoginClick={handleLoginClick}
        onBoardClick={handleBoardClick}
      />
      <Toaster />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          workflows={allWorkflows}
          currentWorkflowIndex={currentWorkflowIndex}
          onWorkflowNavigate={handleWorkflowNavigate}
          onWorkflowClick={handleWorkflowClick}
          onChatHistoryClick={handleChatHistoryClick}
          onNewChat={handleNewChat}
          chatHistories={sortedChatHistories}
          onDeleteChatHistory={handleDeleteChatHistory}
          onEditChatTitle={handleEditChatTitle}
          onDeleteWorkflow={handleDeleteWorkflow}
        />
        
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={isWorkflowPanelOpen ? 70 : 100}>
            <ChatArea 
              onWorkflowSelect={handleWorkflowSelect}
              messages={messages}
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
              onAddCustomWorkflow={handleAddCustomWorkflow}
              allWorkflows={allWorkflows}
              onDeleteWorkflow={handleDeleteWorkflow}
            />
          </ResizablePanel>
          
          {isWorkflowPanelOpen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={20} maxSize={60}>
                <WorkflowPanel
                  isOpen={isWorkflowPanelOpen}
                  onClose={() => setIsWorkflowPanelOpen(false)}
                  workflow={currentWorkflow}
                  onDownload={handleDownloadWorkflow}
                  onDelete={handleDeleteWorkflow}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}