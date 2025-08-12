import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { ArrowLeft, Mail, Lock, Github, Chrome } from "lucide-react";

interface LoginProps {
  onBack: () => void;
}

export function Login({ onBack }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showForgotPassword) {
      console.log("비밀번호 재설정 이메일 전송:", email);
      // 여기에 비밀번호 재설정 로직 추가
      alert(`${email}로 비밀번호 재설정 링크를 전송했습니다.`);
      setShowForgotPassword(false);
      return;
    }

    if (isLogin) {
      console.log("로그인:", { email, password });
      // 여기에 로그인 로직 추가
      alert("로그인 되었습니다!");
      onBack(); // 메인 화면으로 돌아가기
    } else {
      if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
      console.log("회원가입:", { name, email, password });
      // 여기에 회원가입 로직 추가
      alert("회원가입이 완료되었습니다!");
      setIsLogin(true);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} 로그인`);
    // 여기에 소셜 로그인 로직 추가
    alert(`${provider} 로그인 되었습니다!`);
    onBack(); // 메인 화면으로 돌아가기
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
    resetForm();
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    resetForm();
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 뒤로가기 버튼 */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          메인으로 돌아가기
        </Button>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center">
              {showForgotPassword 
                ? "비밀번호 찾기" 
                : isLogin 
                  ? "로그인" 
                  : "회원가입"
              }
            </CardTitle>
            <CardDescription className="text-center">
              {showForgotPassword 
                ? "등록된 이메일 주소를 입력하세요" 
                : isLogin 
                  ? "계정에 로그인하여 워크플로우를 관리하세요" 
                  : "새 계정을 만들어 시작하세요"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !showForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {!showForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {!isLogin && !showForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full">
                {showForgotPassword 
                  ? "재설정 링크 전송" 
                  : isLogin 
                    ? "로그인" 
                    : "회원가입"
                }
              </Button>
            </form>

            {!showForgotPassword && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-2 text-muted-foreground">
                      또는
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("Google")}
                    className="w-full"
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("GitHub")}
                    className="w-full"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            {showForgotPassword ? (
              <Button
                variant="link"
                onClick={handleBackToLogin}
                className="w-full"
              >
                로그인으로 돌아가기
              </Button>
            ) : isLogin ? (
              <>
                <Button
                  variant="link"
                  onClick={handleForgotPassword}
                  className="w-full"
                >
                  비밀번호를 잊으셨나요?
                </Button>
                <div className="text-center">
                  <span className="text-muted-foreground">계정이 없으신가요? </span>
                  <Button variant="link" onClick={switchMode} className="p-0">
                    회원가입
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
                <Button variant="link" onClick={switchMode} className="p-0">
                  로그인
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}