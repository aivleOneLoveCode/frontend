<template>
  <div class="welcome-container">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-icon">🚀</span>
          <span class="badge-text">AI 워크플로우 혁신</span>
        </div>
        
        <h1 class="hero-title">
          <span class="gradient-text">지능형 워크플로우</span>로<br>
          업무를 <span class="highlight">자동화</span>하세요
        </h1>
        
        <p class="hero-description">
          AI와 대화하며 복잡한 업무 프로세스를 간단하게 만들어보세요.<br>
          코딩 없이도 강력한 자동화 워크플로우를 구축할 수 있습니다.
        </p>
        
        <div class="hero-actions">
          <button class="btn-primary" @click="startChat">
            <span class="btn-icon">💬</span>
            채팅 시작하기
          </button>
          <button class="btn-secondary" @click="viewDemo">
            <span class="btn-icon">▶️</span>
            데모 보기
          </button>
        </div>
        
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">10K+</span>
            <span class="stat-label">활성 사용자</span>
          </div>
          <div class="stat">
            <span class="stat-number">50K+</span>
            <span class="stat-label">생성된 워크플로우</span>
          </div>
          <div class="stat">
            <span class="stat-number">99.9%</span>
            <span class="stat-label">가동률</span>
          </div>
        </div>
      </div>
      
      <div class="hero-visual">
        <div class="floating-card card-1">
          <div class="card-icon">🤖</div>
          <div class="card-title">AI 어시스턴트</div>
          <div class="card-desc">자연어로 대화하세요</div>
        </div>
        
        <div class="floating-card card-2">
          <div class="card-icon">⚡</div>
          <div class="card-title">자동화</div>
          <div class="card-desc">반복 작업 제거</div>
        </div>
        
        <div class="floating-card card-3">
          <div class="card-icon">📊</div>
          <div class="card-title">분석</div>
          <div class="card-desc">실시간 인사이트</div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">왜 우리 플랫폼을 선택해야 할까요?</h2>
          <p class="section-subtitle">혁신적인 기능으로 업무 효율성을 극대화하세요</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon gradient-bg-1">💡</div>
            <h3 class="feature-title">직관적 대화형 인터페이스</h3>
            <p class="feature-description">복잡한 설정 없이 자연어로 AI와 대화하며 원하는 워크플로우를 만들어보세요.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon gradient-bg-2">🔗</div>
            <h3 class="feature-title">n8n 워크플로우 통합</h3>
            <p class="feature-description">강력한 n8n 플랫폼과 완벽 통합하여 무한한 가능성의 자동화를 경험하세요.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon gradient-bg-3">⚡</div>
            <h3 class="feature-title">실시간 스트리밍</h3>
            <p class="feature-description">AI의 응답을 실시간으로 확인하며 빠르고 효율적인 워크플로우 생성이 가능합니다.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon gradient-bg-4">📱</div>
            <h3 class="feature-title">반응형 디자인</h3>
            <p class="feature-description">모든 디바이스에서 최적화된 사용자 경험을 제공합니다.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon gradient-bg-5">🎨</div>
            <h3 class="feature-title">다크모드 지원</h3>
            <p class="feature-description">눈에 편안한 다크모드로 장시간 작업도 부담 없이 진행하세요.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon gradient-bg-6">💾</div>
            <h3 class="feature-title">자동 저장</h3>
            <p class="feature-description">대화 내용과 워크플로우가 자동으로 저장되어 언제든 이어서 작업할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-content">
        <h2 class="cta-title">지금 바로 시작해보세요</h2>
        <p class="cta-description">회원가입 없이도 모든 기능을 체험할 수 있습니다</p>
        <div class="cta-actions">
          <button class="btn-primary large" @click="startChat">
            <span class="btn-icon">🚀</span>
            무료로 시작하기
          </button>
        </div>
      </div>
      
      <div class="cta-visual">
        <div class="pulse-circle"></div>
        <div class="pulse-circle delay-1"></div>
        <div class="pulse-circle delay-2"></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startChat = () => {
  router.push('/chat')
}

const viewDemo = () => {
  // 데모 기능 구현 예정
  console.log('데모 보기 클릭')
}
</script>

<style scoped>
.welcome-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow-x: hidden;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5%;
  position: relative;
}

.hero-content {
  flex: 1;
  max-width: 600px;
  color: white;
  z-index: 2;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 500;
}

.badge-icon {
  font-size: 16px;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
}

.gradient-text {
  background: linear-gradient(45deg, #ffd700, #ffeb3b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.highlight {
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
}

.btn-primary.large {
  padding: 20px 40px;
  font-size: 1.1rem;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #ffd700;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Hero Visual */
.hero-visual {
  flex: 1;
  position: relative;
  height: 500px;
  margin-left: 48px;
}

.floating-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 24px;
  color: white;
  animation: float 6s ease-in-out infinite;
}

.card-1 {
  top: 50px;
  left: 50px;
  animation-delay: 0s;
}

.card-2 {
  top: 200px;
  right: 80px;
  animation-delay: 2s;
}

.card-3 {
  bottom: 100px;
  left: 20px;
  animation-delay: 4s;
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.card-title {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 0.9rem;
  opacity: 0.8;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Features Section */
.features {
  background: white;
  padding: 120px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
}

.feature-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #f7fafc;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 24px;
}

.gradient-bg-1 { background: linear-gradient(45deg, #667eea, #764ba2); }
.gradient-bg-2 { background: linear-gradient(45deg, #f093fb, #f5576c); }
.gradient-bg-3 { background: linear-gradient(45deg, #4facfe, #00f2fe); }
.gradient-bg-4 { background: linear-gradient(45deg, #43e97b, #38f9d7); }
.gradient-bg-5 { background: linear-gradient(45deg, #fa709a, #fee140); }
.gradient-bg-6 { background: linear-gradient(45deg, #a8edea, #fed6e3); }

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 16px;
}

.feature-description {
  color: #718096;
  line-height: 1.6;
  font-size: 1rem;
}

/* CTA Section */
.cta {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  padding: 120px 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.cta-content {
  flex: 1;
  color: white;
  max-width: 500px;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.cta-description {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 32px;
}

.cta-visual {
  flex: 1;
  position: relative;
  height: 300px;
}

.pulse-circle {
  position: absolute;
  right: 100px;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  opacity: 0.1;
  animation: pulse 4s ease-in-out infinite;
}

.pulse-circle.delay-1 {
  animation-delay: 1s;
  width: 160px;
  height: 160px;
  right: 120px;
}

.pulse-circle.delay-2 {
  animation-delay: 2s;
  width: 120px;
  height: 120px;
  right: 140px;
}

@keyframes pulse {
  0%, 100% {
    transform: translateY(-50%) scale(1);
    opacity: 0.1;
  }
  50% {
    transform: translateY(-50%) scale(1.1);
    opacity: 0.3;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 40px 20px;
  }
  
  .hero-visual {
    margin-left: 0;
    margin-top: 40px;
    height: 300px;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .cta {
    flex-direction: column;
    text-align: center;
  }
  
  .cta-visual {
    margin-top: 40px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 2rem;
  }
}
</style>