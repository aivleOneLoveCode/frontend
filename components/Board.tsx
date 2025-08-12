import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Upload, Download, Plus, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";

interface BoardPost {
  id: string;
  title: string;
  description: string;
  author: string;
  authorInitials: string;
  createdAt: Date;
  likes: number;
  downloads: number;
  jsonData: any;
  previewImage?: string;
}

interface Workflow {
  id: string;
  title: string;
  image: string;
  isCustom?: boolean;
  jsonData?: any;
  description?: string;
  n8nUrl?: string;
}

interface BoardProps {
  onBack: () => void;
  onImportWorkflow: (workflow: Workflow) => void;
}

// 샘플 게시물 데이터
const SAMPLE_POSTS: BoardPost[] = [
  {
    id: "post-1",
    title: "이메일 자동화 워크플로우",
    description: "고객 문의 이메일을 자동으로 분류하고 응답하는 워크플로우입니다. Gmail API와 AI를 활용하여 빠른 고객 서비스를 제공합니다.",
    author: "김개발",
    authorInitials: "김개",
    createdAt: new Date("2024-01-15"),
    likes: 24,
    downloads: 156,
    jsonData: {
      "meta": { "instanceId": "email-automation" },
      "nodes": [
        {
          "parameters": { "pollTimes": { "item": [{ "mode": "everyMinute" }] } },
          "id": "gmail-trigger",
          "name": "Gmail Trigger",
          "type": "n8n-nodes-base.gmailTrigger",
          "position": [240, 300]
        },
        {
          "parameters": { "model": "gpt-3.5-turbo", "prompt": "이메일 내용을 분석하여 카테고리를 분류해주세요" },
          "id": "ai-classifier",
          "name": "AI Email Classifier",
          "type": "n8n-nodes-base.openAi",
          "position": [460, 300]
        },
        {
          "parameters": { "subject": "자동 응답", "message": "안녕하세요. 문의해주셔서 감사합니다." },
          "id": "auto-reply",
          "name": "Auto Reply",
          "type": "n8n-nodes-base.gmail",
          "position": [680, 300]
        }
      ],
      "connections": {
        "Gmail Trigger": { "main": [["AI Email Classifier"]] },
        "AI Email Classifier": { "main": [["Auto Reply"]] }
      }
    }
  },
  {
    id: "post-2",
    title: "소셜미디어 콘텐츠 배포",
    description: "하나의 콘텐츠를 여러 소셜미디어 플랫폼에 동시에 배포하는 자동화 워크플로우입니다.",
    author: "박마케팅",
    authorInitials: "박마",
    createdAt: new Date("2024-01-12"),
    likes: 18,
    downloads: 89,
    jsonData: {
      "meta": { "instanceId": "social-distribution" },
      "nodes": [
        {
          "parameters": { "rule": { "interval": [{ "field": "hours", "value": 9 }] } },
          "id": "schedule-trigger",
          "name": "Daily Schedule",
          "type": "n8n-nodes-base.cron",
          "position": [240, 300]
        },
        {
          "parameters": { "message": "오늘의 소식을 전해드립니다!" },
          "id": "twitter-post",
          "name": "Twitter Post",
          "type": "n8n-nodes-base.twitter",
          "position": [460, 200]
        },
        {
          "parameters": { "message": "새로운 업데이트를 확인하세요" },
          "id": "facebook-post",
          "name": "Facebook Post",
          "type": "n8n-nodes-base.facebook",
          "position": [460, 400]
        }
      ],
      "connections": {
        "Daily Schedule": { "main": [["Twitter Post"], ["Facebook Post"]] }
      }
    }
  },
  {
    id: "post-3",
    title: "재고 관리 자동화",
    description: "재고가 부족할 때 자동으로 알림을 보내고 주문을 생성하는 워크플로우입니다.",
    author: "최운영",
    authorInitials: "최운",
    createdAt: new Date("2024-01-10"),
    likes: 31,
    downloads: 203,
    jsonData: {
      "meta": { "instanceId": "inventory-management" },
      "nodes": [
        {
          "parameters": { "query": "SELECT * FROM inventory WHERE quantity < minimum_stock" },
          "id": "check-inventory",
          "name": "Check Inventory",
          "type": "n8n-nodes-base.postgres",
          "position": [240, 300]
        },
        {
          "parameters": { "message": "재고 부족 알림", "channel": "#inventory" },
          "id": "slack-alert",
          "name": "Slack Alert",
          "type": "n8n-nodes-base.slack",
          "position": [460, 300]
        },
        {
          "parameters": { "supplier": "default", "quantity": "auto" },
          "id": "create-order",
          "name": "Create Order",
          "type": "n8n-nodes-base.httpRequest",
          "position": [680, 300]
        }
      ],
      "connections": {
        "Check Inventory": { "main": [["Slack Alert"]] },
        "Slack Alert": { "main": [["Create Order"]] }
      }
    }
  },
  {
    id: "post-4",
    title: "웹사이트 모니터링",
    description: "웹사이트 상태를 주기적으로 확인하고 문제 발생 시 즉시 알림을 보내는 모니터링 워크플로우입니다.",
    author: "이개발",
    authorInitials: "이개",
    createdAt: new Date("2024-01-08"),
    likes: 15,
    downloads: 67,
    jsonData: {
      "meta": { "instanceId": "website-monitoring" },
      "nodes": [
        {
          "parameters": { "rule": { "interval": [{ "field": "minutes", "value": 5 }] } },
          "id": "monitor-schedule",
          "name": "Monitor Schedule",
          "type": "n8n-nodes-base.cron",
          "position": [240, 300]
        },
        {
          "parameters": { "url": "https://example.com", "method": "GET" },
          "id": "health-check",
          "name": "Health Check",
          "type": "n8n-nodes-base.httpRequest",
          "position": [460, 300]
        },
        {
          "parameters": { "to": "admin@company.com", "subject": "웹사이트 다운 알림" },
          "id": "email-alert",
          "name": "Email Alert",
          "type": "n8n-nodes-base.emailSend",
          "position": [680, 300]
        }
      ],
      "connections": {
        "Monitor Schedule": { "main": [["Health Check"]] },
        "Health Check": { "main": [["Email Alert"]] }
      }
    }
  }
];

export function Board({ onBack, onImportWorkflow }: BoardProps) {
  const [posts, setPosts] = useState<BoardPost[]>(SAMPLE_POSTS);
  const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    file: null as File | null
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setUploadForm(prev => ({ ...prev, file }));
    } else {
      toast.error("JSON 파일만 업로드 가능합니다.");
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.title.trim() || !uploadForm.description.trim() || !uploadForm.file) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    try {
      const fileContent = await uploadForm.file.text();
      const jsonData = JSON.parse(fileContent);

      const newPost: BoardPost = {
        id: `post-${Date.now()}`,
        title: uploadForm.title,
        description: uploadForm.description,
        author: "사용자", // 실제로는 로그인된 사용자 정보
        authorInitials: "사용",
        createdAt: new Date(),
        likes: 0,
        downloads: 0,
        jsonData
      };

      setPosts(prev => [newPost, ...prev]);
      setUploadForm({ title: "", description: "", file: null });
      setIsUploadModalOpen(false);
      toast.success("워크플로우가 성공적으로 업로드되었습니다!");
    } catch (error) {
      toast.error("유효하지 않은 JSON 파일입니다.");
    }
  };

  const handleDownload = (post: BoardPost) => {
    const dataStr = JSON.stringify(post.jsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${post.title.replace(/\s+/g, '_')}_n8n_workflow.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 다운로드 수 증가
    setPosts(prev => prev.map(p => 
      p.id === post.id ? { ...p, downloads: p.downloads + 1 } : p
    ));
    toast.success("워크플로우를 다운로드했습니다!");
  };

  const handleImport = (post: BoardPost) => {
    const workflow: Workflow = {
      id: `imported-${Date.now()}`,
      title: post.title,
      image: "",
      description: post.description,
      jsonData: post.jsonData,
      isCustom: true
    };

    onImportWorkflow(workflow);
    setIsDetailModalOpen(false);
    toast.success("워크플로우를 성공적으로 가져왔습니다!");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
          <h1 className="text-lg font-medium">게시판</h1>
        </div>
        
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              워크플로우 업로드
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl backdrop-blur-none">
            <DialogHeader>
              <DialogTitle>워크플로우 업로드</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="워크플로우 제목을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="워크플로우에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="file">JSON 파일</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                />
                {uploadForm.file && (
                  <p className="text-sm text-muted-foreground mt-1">
                    선택된 파일: {uploadForm.file.name}
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleUpload}
                  disabled={!uploadForm.title.trim() || !uploadForm.description.trim() || !uploadForm.file}
                  className="flex-1"
                >
                  업로드
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUploadForm({ title: "", description: "", file: null });
                    setIsUploadModalOpen(false);
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <Card 
              key={post.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedPost(post);
                setIsDetailModalOpen(true);
              }}
            >
              <CardContent className="p-4">
                {/* 워크플로우 미리보기 이미지 영역 */}
                <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg mb-3 flex items-center justify-center border">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">워크플로우</p>
                  </div>
                </div>
                
                <h3 className="font-medium mb-2 leading-tight" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>{post.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {post.description}
                </p>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.downloads} 다운로드
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ♥ {post.likes}
                  </Badge>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0">
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">{post.authorInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.author}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl backdrop-blur-none">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{selectedPost.authorInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2>{selectedPost.title}</h2>
                    <p className="text-sm text-muted-foreground font-normal">
                      {selectedPost.author} · {formatDate(selectedPost.createdAt)}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* 워크플로우 미리보기 */}
                <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center border">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">워크플로우 다이어그램</p>
                  </div>
                </div>
                
                {/* 설명 */}
                <div>
                  <h3 className="font-medium mb-2">설명</h3>
                  <p className="text-muted-foreground">{selectedPost.description}</p>
                </div>
                
                {/* 통계 */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedPost.downloads} 다운로드</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">♥ {selectedPost.likes} 좋아요</span>
                  </div>
                </div>
                
                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => handleDownload(selectedPost)}
                    className="flex-1 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleImport(selectedPost)}
                    className="flex-1 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    가져오기
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}