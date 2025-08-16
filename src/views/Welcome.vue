<template>
  <div class="welcome-page">
    <!-- Sticky Header -->
    <header class="site-header" :class="{ scrolled: isScrolled }">
      <div class="container header-inner">
        <a href="#" class="brand">다짜니</a>
        <nav class="nav">
          <a href="#showcase">제품</a>
          <a href="#features">기능</a>
        </nav>
                  <div class="actions">
            <button class="btn primary" @click="goToLogin">무료 시작</button>
          </div>
      </div>
    </header>

    <main>
      <!-- Typography Banner -->
      <section class="typography-banner">
        <div class="banner-content">
          <h1 class="banner-headline">
            <span class="gradient-text">지능형 워크플로우</span>로<br>
            업무를 <span class="highlight">자동화</span>하세요
          </h1>
          <div class="typing-demo">
            <div class="typing-line">
              <span class="typing-text">{{ typingText }}</span>
              <span class="cursor" :class="{ 'blinking': !isTyping }">|</span>
            </div>
            <div class="typing-examples">
              <span v-for="(example, index) in typingExamples" 
                    :key="index" 
                    :class="{ active: currentExampleIndex === index }"
                    class="example-item">
                {{ example }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Hero -->
      <section class="hero container" id="hero">
        <div class="hero-col">
          <div class="badge" v-reveal>신규 | AI 에이전트</div>
          <h2 class="hero-headline" v-reveal style="transition-delay: .06s">
            말하면 완성되는<br>
            <span class="gradient-text">업무 자동화</span>
          </h2>
          <p class="sub" v-reveal style="transition-delay: .12s">
            업무 자동화 만드는 법 배울 필요 없어요.<br/> 다짜니 에이전트가 업무를 대신 자동화해드립니다.
          </p>
          <div class="hero-cta" v-reveal style="transition-delay: .18s">
            <button class="btn primary" @click="goToLogin">지금 시작하기</button>
            <button class="btn secondary">라이브 데모 보기</button>
          </div>
          <div class="hero-bullets" v-reveal style="transition-delay: .24s">
            <span>💬 자연어 워크플로우 생성</span>
            <span>🤖 다짜니 AI 에이전트</span>
            <span>⚡ 즉시 실행 가능</span>
          </div>
        </div>
        <div class="hero-col visuals" v-reveal style="transition-delay: .1s">
          <div class="blob one"></div>
          <div class="blob two"></div>
          <div class="mock-window">
            <div class="topbar">
              <span></span><span></span><span></span>
              <div class="address">dazzani.ai/workflow</div>
            </div>
            <div class="canvas">
              <div class="chart-row">
                <div class="bar" style="--h:55%"></div>
                <div class="bar" style="--h:72%"></div>
                <div class="bar" style="--h:40%"></div>
                <div class="bar" style="--h:85%"></div>
                <div class="bar" style="--h:63%"></div>
              </div>
              <div class="cards">
                <div class="card-skel"></div>
                <div class="card-skel"></div>
                <div class="card-skel"></div>
              </div>
            </div>
          </div>
          <div class="phone-mock">
            <div class="notch"></div>
            <div class="screen">
              <div class="list-item">
                <div class="avatar"></div>
                <div class="lines">
                  <div class="l1"></div>
                  <div class="l2"></div>
                </div>
              </div>
              <div class="list-item">
                <div class="avatar"></div>
                <div class="lines">
                  <div class="l1"></div>
                  <div class="l2"></div>
                </div>
              </div>
              <div class="list-item">
                <div class="avatar"></div>
                <div class="lines">
                  <div class="l1"></div>
                  <div class="l2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Logos marquee -->
      <section class="logos">
        <div class="container">
          <p class="logos-title" v-reveal>다양한 업무 영역에서 활용 중</p>
          <div class="marquee" v-reveal style="transition-delay: .1s">
            <div class="track">
              <div class="logo" v-for="(l,i) in marqueeLogos" :key="'m1-'+i">{{ l }}</div>
              <div class="logo" v-for="(l,i) in marqueeLogos" :key="'m2-'+i">{{ l }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Showcase: Long vertical mockups -->
      <section class="showcase container" id="showcase">
        <h2 class="section-title" v-reveal>워크플로우 미리보기</h2>
        <p class="section-desc" v-reveal style="transition-delay:.06s">
          자연어로 쉽게 만드는 업무 자동화 워크플로우를 다짜니 에이전트를 통해 경험해보세요.
        </p>

        <div class="showcase-grid">
          <div
            class="mock-window tall"
            v-for="(shot, idx) in mockShots"
            :key="idx"
            v-reveal
            :style="{ transitionDelay: `${idx * 80}ms` }"
          >
            <div class="topbar">
              <span></span><span></span><span></span>
              <div class="address">{{ shot.url }}</div>
            </div>
            <div class="canvas">
              <div
                v-if="shot.type === 'dashboard'"
                class="dash-layout"
              >
                <div class="panel big"></div>
                <div class="panel"></div>
                <div class="panel"></div>
                <div class="panel wide"></div>
              </div>
              <div v-else-if="shot.type === 'kanban'" class="kanban">
                <div class="column">
                  <div class="ticket"></div>
                  <div class="ticket"></div>
                </div>
                <div class="column">
                  <div class="ticket"></div>
                  <div class="ticket"></div>
                  <div class="ticket"></div>
                </div>
                <div class="column">
                  <div class="ticket tall"></div>
                </div>
              </div>
              <div v-else class="form">
                <div class="row">
                  <div class="input"></div>
                  <div class="input"></div>
                </div>
                <div class="input full"></div>
                <div class="cta-row">
                  <div class="btn-skel"></div>
                  <div class="btn-skel ghost"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="features container" id="features">
        <h2 class="section-title" v-reveal>핵심 기능</h2>
        <p class="section-desc" v-reveal style="transition-delay:.06s">
          빠른 성능과 보안을 기반으로, 팀 협업에 최적화된 기능을 제공합니다.
        </p>
        <div class="feature-grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card reveal"
            v-reveal
            :style="{ transitionDelay: `${index * 60}ms` }"
          >
            <div class="feature-icon" :class="`gradient-bg-${(index % 3) + 1}`">
              {{ feature.icon }}
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </section>



      <!-- Steps / Timeline -->
      <section class="steps container">
        <h2 class="section-title" v-reveal>3단계로 시작하기</h2>
        <div class="timeline">
          <div
            class="step"
            v-for="(s, i) in steps"
            :key="i"
            v-reveal
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div class="dot">{{ i + 1 }}</div>
            <div class="body">
              <h4>{{ s.title }}</h4>
              <p>{{ s.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="cta">
        <div class="container">
          <h2 class="cta-title" v-reveal>지금 바로 시작하세요</h2>
          <p class="cta-sub" v-reveal style="transition-delay:.06s">
            무료로 체험하고 모든 기능을 경험해보세요.
          </p>
          <div class="cta-actions" v-reveal style="transition-delay:.12s">
            <button class="btn primary big" @click="goToLogin">무료 회원가입</button>
            <button class="btn ghost big">문의하기</button>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container foot-inner">
        <div class="foot-brand">다짜니</div>
        <div class="foot-links">
          <a href="#features">기능</a>
          <a href="#">이용약관</a>
        </div>
        <div class="foot-copy">© 2025 다짜니. All rights reserved.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isScrolled = ref(false)
const onScroll = () => { isScrolled.value = window.scrollY > 8 }
onMounted(() => window.addEventListener('scroll', onScroll))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// IntersectionObserver-based reveal directive
const vReveal = {
  mounted(el) {
    el.classList.add('reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('is-visible')
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.12 }
    )
    io.observe(el)
  },
}

// Data
const marqueeLogos = [
  '마케팅팀', '영업팀', '인사팀', '재무팀', '고객서비스', '기획팀', '운영팀', '총무팀'
]

const mockShots = [
  { type: 'dashboard', url: 'dazzani.ai/workflows' },
  { type: 'kanban', url: 'dazzani.ai/automation' },
  { type: 'form', url: 'dazzani.ai/builder' },
]

const features = [
  { icon: '💬', title: '자연어 명령', description: '일상 언어로 워크플로우를 설명하면 자동으로 생성됩니다.' },
  { icon: '🤖', title: 'AI 에이전트', description: '다짜니가 업무 흐름을 이해하고 최적의 자동화를 제안합니다.' },
  { icon: '🔗', title: '앱 연동', description: '이메일, 스프레드시트, 메신저 등 자주 쓰는 도구와 바로 연결.' },
  { icon: '⚡', title: '즉시 실행', description: '복잡한 설정 없이 만든 즉시 바로 사용할 수 있습니다.' },
  { icon: '📋', title: '업무 템플릿', description: '마케팅, 영업, 인사 등 직무별 템플릿으로 빠른 시작.' },
  { icon: '📊', title: '자동 보고서', description: '워크플로우 실행 결과를 자동으로 정리하여 리포트 생성.' },
]

const steps = [
  { title: '자연어로 설명', desc: '"고객 문의 이메일을 분류해서 담당자에게 전달해줘"처럼 말하세요.' },
  { title: '다짜니가 워크플로우 생성', desc: 'AI가 업무 흐름을 분석하고 자동으로 워크플로우를 만들어드립니다.' },
  { title: '바로 실행', desc: '생성된 워크플로우를 검토하고 바로 업무에 적용하세요.' },
]


const openFaq = ref(null)
const toggleFaq = (i) => {
  openFaq.value = openFaq.value === i ? null : i
}

// Typing animation
const typingExamples = [
  "매일 오전 9시 '미국 관세' 검색하고, 혹시 한국과 연관된 결정사항 있는지 검수해서 나한테 보고해줘.",
  "엑셀 파일에서 매출 데이터를 읽어서 월별 리포트를 만들고, 이메일로 보내줘.",
  "고객 문의 이메일을 자동으로 분류해서 담당자에게 전달하는 워크플로우를 만들어줘.",
  "매주 금요일 오후 3시에 팀 회의 일정을 확인하고, 참석자들에게 리마인더 메시지를 보내줘.",
  "매일 저녁 8시에 웹사이트 방문자 데이터를 분석하고, 일일 리포트를 생성해서 슬랙 채널에 올려줘."
]

const currentExampleIndex = ref(0)
const typingText = ref('')
const isTyping = ref(true)

const typeText = async () => {
  const fullText = typingExamples[currentExampleIndex.value]
  
  // Type forward
  for (let i = 0; i <= fullText.length; i++) {
    typingText.value = fullText.slice(0, i)
    await new Promise(resolve => setTimeout(resolve, 60))
  }
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Type backward (delete)
  for (let i = fullText.length; i >= 0; i--) {
    typingText.value = fullText.slice(0, i)
    await new Promise(resolve => setTimeout(resolve, 30))
  }
  
  // Move to next example
  currentExampleIndex.value = (currentExampleIndex.value + 1) % typingExamples.length
  
  // Wait and repeat
  await new Promise(resolve => setTimeout(resolve, 1000))
  typeText()
}

onMounted(() => {
  typeText()
})

// Navigation functions
const goToLogin = () => {
  // 로그인 페이지로 이동
  window.location.href = '/login'
  // 또는 Vue Router를 사용한다면: router.push('/login')
}
</script>

<style scoped>
:root {
  --font-main: 'Pretendard', system-ui, -apple-system, Segoe UI, sans-serif;
  --bg: #ffffff;
  --panel: #f8fafc;
  --muted: #475569;
  --text: #0f172a;
  --primary: #4f46e5;
  --primary-2: #6366f1;
  --accent: #06b6d4;
  --ring: rgba(79,70,229,.25);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f172a;
    --panel: #1e293b;
    --muted: #94a3b8;
    --text: #f1f5f9;
  }
  
  .site-header {
    background: linear-gradient(180deg, rgba(11,16,32,.92), rgba(11,16,32,.86));
    border-bottom: 0;
  }
  
  .site-header.scrolled {
    background: linear-gradient(180deg, rgba(11,16,32,.96), rgba(11,16,32,.9));
    border-bottom: 0;
    box-shadow: 0 10px 30px -18px rgba(0,0,0,.6);
  }

  .nav a:hover { background: rgba(255,255,255,.06); }
  .site-header::after {
    background: linear-gradient(90deg, transparent, rgba(99,102,241,.5), rgba(34,211,238,.5), transparent);
  }
  
  .brand { color: #fff; }
  .nav a { color: #c7d2fe; }
  .nav a:hover { color: #fff; }
  
  .btn {
    background: #1e293b;
  }
  
  .btn.secondary { background: #334155; border-color: #475569; color: #e2e8f0; }
  .btn.secondary:hover { background: #475569; }
  .btn.ghost { border-color: #475569; color: #cbd5e1; }
  .btn.ghost:hover { background: rgba(71, 85, 105, 0.2); }
  
  .welcome-page {
    background:
      radial-gradient(1200px 600px at 80% -10%, rgba(79,70,229,.15), transparent 60%),
      radial-gradient(800px 400px at 10% 0%, rgba(6,182,212,.12), transparent 60%),
      var(--bg);
  }
  
  .mock-window {
    border: 1px solid rgba(255,255,255,.06);
    box-shadow: 0 30px 80px -20px rgba(0,0,0,.5);
  }
  
  .feature-card {
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.06);
  }
  
  .quote { color: #dfe5f7; }
  .faq-q { color: #fff; }
  .faq-a { color: #cbd3e8; }
  
  .footer { 
    border-top: 1px solid rgba(255,255,255,.06); 
    color: #9aa3bd; 
  }
  .foot-links a { color: #9aa3bd; }
  .foot-brand { color: #fff; }
  
  .cta {
    background: linear-gradient(135deg, rgba(109,108,255,.25), rgba(34,211,238,.22));
    border-top: 1px solid rgba(255,255,255,.08);
  }
  .cta-sub { color: #d0d7ee; }
  
  .hero-col .badge {
    color: #aab3c8;
    border: 1px solid rgba(255,255,255,.1);
    background: rgba(255,255,255,.03);
  }
  
  .hero-bullets { color: #aab3c8; }
  
  .logo {
    color: #c7cce0;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.06);
  }
  
  .pc-feats { color: #cbd3e8; }
  
  .input-demo-card {
    border: 1px solid rgba(255,255,255,.06);
    box-shadow: 0 20px 40px -15px rgba(0,0,0,.6);
  }
  
  .input-container {
    background: #0c1433;
    border: 2px solid rgba(79,70,229,.3);
  }
  
  .typing-input {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.welcome-page {
  font-family: var(--font-main);
  background:
    radial-gradient(1200px 600px at 80% -10%, rgba(79,70,229,.08), transparent 60%),
    radial-gradient(800px 400px at 10% 0%, rgba(6,182,212,.06), transparent 60%),
    var(--bg);
  color: var(--text);
  overflow-y: auto;
  height: 100vh;
}

/* Utils */
.container { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
.section-title { font-size: 32px; font-weight: 700; margin-bottom: 16px; }
.section-desc { color: var(--muted); margin-bottom: 32px; }
.btn {
  border: 1px solid transparent;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: .2s ease;
  background: var(--panel);
  color: var(--text);
}
.btn.primary { background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; box-shadow: 0 8px 20px -6px rgba(79, 70, 229, .4); }
.btn.primary:hover { background: linear-gradient(135deg, #4338ca, #5b21b6); transform: translateY(-1px); }
.btn.secondary { background: #e2e8f0; border-color: #cbd5e1; color: #475569; }
.btn.secondary:hover { background: #cbd5e1; }
.btn.ghost { background: transparent; border-color: #cbd5e1; color: var(--muted); }
.btn.ghost:hover { background: rgba(0, 0, 0, 0.05); }
.btn.block { width: 100%; }
.btn.small { padding: 8px 12px; }
.btn.big { padding: 14px 22px; font-size: 16px; }

/* Header */
.site-header {
  position: sticky; top: 0; z-index: 20;
  background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.86));
  backdrop-filter: blur(12px);
  border-bottom: 0;
  transition: .25s ease;
  position: sticky;
}
.site-header.scrolled {
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.9));
  backdrop-filter: saturate(140%) blur(16px);
  border-bottom: 0;
  box-shadow: 0 10px 30px -20px rgba(0,0,0,.25);
}
.header-inner {
  display: flex; align-items: center; justify-content: space-between; height: 64px;
}
.brand { font-weight: 800; letter-spacing: .4px; color: var(--text); text-decoration: none; font-size: 18px; position: relative; }
.brand::after {
  content: '';
  position: absolute; left: -8px; top: 50%; transform: translateY(-50%);
  width: 6px; height: 6px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #4f46e5, #22d3ee);
  box-shadow: 0 0 10px rgba(34,211,238,.6);
}
.nav { display: none; gap: 20px; }
.nav a { color: var(--muted); text-decoration: none; font-weight: 600; position: relative; padding: 6px 8px; border-radius: 8px; transition: color .2s ease, background .2s ease; }
.nav a:hover { color: var(--text); background: rgba(0,0,0,.04); }
.nav a::after {
  content: '';
  position: absolute; left: 8px; right: 8px; bottom: -4px; height: 2px;
  background: linear-gradient(90deg, #4f46e5, #22d3ee);
  transform: scaleX(0); transform-origin: left; transition: transform .25s ease;
  border-radius: 2px;
}
.nav a:hover::after { transform: scaleX(1); }
.site-header::after {
  content: '';
  position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(79,70,229,.35), rgba(34,211,238,.35), transparent);
}
.actions { display: flex; gap: 10px; }

@media (min-width: 860px) {
  .nav { display: flex; }
}

/* Typography Banner */
.typography-banner {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #fff;
  padding: clamp(6rem, 12vh, 10rem) clamp(2rem, 6vw, 8rem) clamp(8rem, 15vh, 12rem);
  text-align: center;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.typography-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(800px 400px at 20% 20%, rgba(79,70,229,.3), transparent 60%),
    radial-gradient(600px 300px at 80% 80%, rgba(34,211,238,.3), transparent 60%);
  opacity: 0.6;
}

.banner-content {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
}

.banner-headline {
  font-size: clamp(4rem, 15vw, 8rem);
  line-height: 1;
  margin-bottom: clamp(3rem, 8vh, 6rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  text-shadow: 0 10px 30px rgba(0,0,0,0.3);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-size: 200% 200%;
  animation: gradient-shift 4s ease-in-out infinite;
}

.highlight {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradient-shift 4s ease-in-out infinite reverse;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.typing-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1rem, 3vh, 2rem);
  margin-top: clamp(2rem, 5vh, 4rem);
}

.typing-line {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255,255,255,0.15);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  width: 1200px;
  height: 80px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.1);
}

.typing-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  animation: shimmer 3s infinite;
}

.typing-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%);
  pointer-events: none;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.typing-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 4rem);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.cursor {
  font-size: 1.4rem;
  color: #22d3ee;
  font-weight: bold;
  margin-left: 2px;
  animation: blink 1s infinite;
  text-shadow: 0 0 8px rgba(34,211,238,0.6);
}

.cursor.blinking {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.typing-examples {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1.5vh, 1rem);
  font-size: clamp(0.875rem, 2vw, 1.125rem);
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  max-width: 1200px;
  margin-top: 1rem;
}

.example-item {
  transition: all 0.3s ease;
  padding: clamp(0.5rem, 1vh, 0.75rem) clamp(1rem, 2vw, 1.5rem);
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  opacity: 0.6;
  transform: translateY(10px);
  backdrop-filter: blur(10px);
}

.example-item.active {
  color: #22d3ee;
  background: rgba(34,211,238,0.1);
  border-color: rgba(34,211,238,0.3);
  opacity: 1;
  transform: translateY(0);
  box-shadow: 0 5px 20px rgba(34,211,238,0.2);
}

/* Hero */
.hero { 
  display: grid; 
  grid-template-columns: 1.1fr 1fr; 
  gap: clamp(3rem, 6vw, 6rem); 
  padding: clamp(5rem, 10vh, 8rem) clamp(2rem, 5vw, 6rem) clamp(3rem, 6vh, 5rem); 
  align-items: center; 
  min-height: 90vh;
  margin: 0 auto;
  max-width: 1400px;
}

.hero-col .badge {
  display: inline-block; 
  font-size: clamp(0.875rem, 2vw, 1.25rem); 
  color: var(--muted);
  border: 2px solid rgba(0,0,0,.1); 
  padding: clamp(0.75rem, 2vw, 1.25rem) clamp(1.25rem, 2.5vw, 2rem); 
  border-radius: 999px; 
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
  background: rgba(0,0,0,.03);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}

.hero-col .badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(79,70,229,.1), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.hero-headline { 
  font-size: clamp(2.5rem, 8vw, 5rem); 
  line-height: 1.1; 
  margin: 0 0 clamp(1.5rem, 4vw, 3rem); 
  font-weight: 900;
  letter-spacing: -0.02em;
}

.gradient-text { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); 
  -webkit-background-clip: text; 
  background-clip: text; 
  color: transparent;
  background-size: 200% 200%;
  animation: gradient-shift 4s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.sub { 
  color: var(--muted); 
  margin-bottom: clamp(2rem, 4vw, 3rem); 
  line-height: 1.6; 
  font-size: clamp(1.1rem, 2.2vw, 1.4rem);
  font-weight: 400;
  max-width: 95%;
}

.hero-cta { 
  display: flex; 
  gap: clamp(0.75rem, 2vw, 1.5rem); 
  margin-bottom: clamp(2rem, 4vw, 3rem); 
  flex-wrap: wrap;
}

.hero-bullets { 
  display: flex; 
  gap: clamp(0.75rem, 2vw, 1.5rem); 
  color: var(--muted); 
  flex-wrap: wrap;
  font-size: clamp(0.9rem, 1.8vw, 1.1rem);
  font-weight: 500;
}

.visuals { 
  position: relative; 
  min-height: clamp(400px, 60vh, 600px); 
  display: flex;
  align-items: center;
  justify-content: center;
}

.blob { 
  position: absolute; 
  filter: blur(40px); 
  opacity: .7; 
  animation: float 9s ease-in-out infinite; 
}

.blob.one { 
  width: clamp(250px, 30vw, 350px); 
  height: clamp(250px, 30vw, 350px); 
  right: 5%; 
  top: -10%; 
  background: radial-gradient(#6d6cff, transparent 60%); 
}

.blob.two { 
  width: clamp(200px, 25vw, 300px); 
  height: clamp(200px, 25vw, 300px); 
  left: -5%; 
  bottom: 5%; 
  background: radial-gradient(#22d3ee, transparent 60%); 
  animation-delay: -2s; 
}

@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-15px) translateX(8px); }
}

/* Mock window + phone */
.mock-window {
  background: var(--panel);
  border: 1px solid rgba(0,0,0,.06);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 40px 100px -30px rgba(0,0,0,.15);
  width: 100%;
  max-width: clamp(350px, 45vw, 550px);
  transform: scale(1.05);
}

.mock-window.tall { aspect-ratio: 10 / 13; }

.mock-window .topbar {
  display: flex; 
  align-items: center; 
  gap: 8px;
  height: clamp(36px, 5vh, 44px); 
  padding: 0 clamp(0.75rem, 1.5vw, 1.25rem); 
  border-bottom: 1px solid rgba(255,255,255,.06);
  background: rgba(255,255,255,.02);
}

.mock-window .topbar span { 
  width: clamp(10px, 1.2vw, 14px); 
  height: clamp(10px, 1.2vw, 14px); 
  border-radius: 50%; 
  background: #39406a; 
}

.mock-window .address {
  margin-left: auto; 
  margin-right: auto; 
  color: #aab3c8; 
  font-size: clamp(0.8rem, 1.8vw, 1.1rem);
  background: rgba(255,255,255,.03); 
  padding: clamp(0.4rem, 0.8vw, 0.6rem) clamp(0.6rem, 1.2vw, 1.2rem); 
  border-radius: 8px; 
  border: 1px solid rgba(255,255,255,.06);
}

.mock-window .canvas { 
  padding: clamp(1rem, 2vw, 1.75rem); 
}

.chart-row { 
  display: flex; 
  align-items: flex-end; 
  gap: clamp(0.6rem, 1.2vw, 1.2rem); 
  height: clamp(120px, 18vh, 160px); 
  margin-bottom: clamp(1rem, 2vw, 1.75rem); 
}

.chart-row .bar {
  width: 16%; 
  height: var(--h);
  background: linear-gradient(180deg, #8ea2ff, #6d6cff);
  border-radius: 10px;
}

.cards { 
  display: grid; 
  grid-template-columns: repeat(3,1fr); 
  gap: clamp(0.6rem, 1.2vw, 1.2rem); 
}

.card-skel {
  height: clamp(70px, 12vh, 90px); 
  border-radius: 12px; 
  background: linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.03)); 
  border: 1px solid rgba(255,255,255,.06);
}

.phone-mock {
  position: absolute; 
  right: clamp(-15px, -3vw, -25px); 
  bottom: clamp(-15px, -3vw, -25px);
  width: clamp(160px, 20vw, 240px); 
  aspect-ratio: 9 / 19;
  border-radius: clamp(24px, 4vw, 32px); 
  background: #0d1430; 
  border: 1px solid rgba(255,255,255,.08);
  overflow: hidden; 
  box-shadow: 0 25px 50px -20px rgba(0,0,0,.7);
  transform: scale(1.1);
}

.phone-mock .notch { 
  height: clamp(24px, 4vh, 32px); 
  width: 50%; 
  background: #0b1026; 
  border-bottom-left-radius: 16px; 
  border-bottom-right-radius: 16px; 
  margin: 0 auto; 
}

.phone-mock .screen { 
  padding: clamp(0.6rem, 1.2vw, 1.2rem); 
  display: grid; 
  gap: clamp(0.6rem, 1.2vw, 1.2rem); 
}

.list-item { 
  display: flex; 
  gap: clamp(0.6rem, 1.2vw, 1.2rem); 
  align-items: center; 
}

.list-item .avatar { 
  width: clamp(32px, 5vw, 40px); 
  height: clamp(32px, 5vw, 40px); 
  border-radius: 50%; 
  background: linear-gradient(135deg, #22d3ee, #6d6cff); 
}

.lines .l1, .lines .l2 { 
  height: clamp(7px, 1.2vh, 9px); 
  border-radius: 7px; 
  background: rgba(255,255,255,.14); 
}

.lines .l1 { 
  width: clamp(90px, 14vw, 130px); 
  margin-bottom: clamp(5px, 0.7vh, 7px); 
}

.lines .l2 { 
  width: clamp(70px, 10vw, 90px); 
}

/* Logos marquee */
.logos { 
  padding: clamp(4rem, 8vh, 6rem) 0 clamp(3rem, 6vh, 4rem); 
}

.logos-title { 
  color: var(--text); 
  text-align: center; 
  margin-bottom: clamp(1.5rem, 3vw, 2rem); 
  font-size: clamp(1.25rem, 3vw, 2rem); 
  font-weight: 700;
  background: linear-gradient(135deg, #0f172a, #475569);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.marquee { 
  overflow: hidden; 
  border-top: 1px solid rgba(255,255,255,.06); 
  border-bottom: 1px solid rgba(255,255,255,.06); 
}

.track {
  display: flex; 
  gap: clamp(2rem, 4vw, 3rem); 
  padding: clamp(1rem, 2vh, 1.5rem) 0; 
  width: max-content;
  animation: marquee 20s linear infinite;
}

.logo {
  color: var(--muted); 
  opacity: .9; 
  font-weight: 700; 
  letter-spacing: .4px;
  background: rgba(0,0,0,.03); 
  border: 1px solid rgba(0,0,0,.06);
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(0.75rem, 1.5vw, 1rem); 
  border-radius: 10px;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Showcase grid */
.showcase { 
  padding: clamp(5rem, 10vh, 8rem) clamp(1.5rem, 3vw, 2rem); 
}

.showcase-grid {
  display: grid; 
  gap: clamp(2rem, 4vw, 3rem);
  grid-template-columns: 1fr;
}

@media (min-width: 860px) {
  .showcase-grid { 
    grid-template-columns: repeat(3, 1fr); 
  }
}

.dash-layout {
  display: grid; 
  gap: clamp(0.5rem, 1vw, 1rem); 
  grid-template-columns: repeat(6, 1fr);
}

.panel {
  height: clamp(60px, 10vh, 80px);
  grid-column: span 3;
  border-radius: 10px; 
  background: linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.03)); 
  border: 1px solid rgba(255,255,255,.06);
}

.panel.big { 
  height: clamp(100px, 15vh, 140px); 
  grid-column: span 6; 
}

.panel.wide { 
  grid-column: span 6; 
}

.kanban { 
  display: grid; 
  grid-template-columns: repeat(3,1fr); 
  gap: clamp(0.5rem, 1vw, 1rem); 
}

.column { 
  background: rgba(255,255,255,.02); 
  border: 1px solid rgba(255,255,255,.06); 
  border-radius: 10px; 
  padding: clamp(0.5rem, 1vw, 1rem); 
}

.ticket { 
  height: clamp(40px, 8vh, 60px); 
  border-radius: 8px; 
  background: rgba(255,255,255,.06); 
  margin-bottom: clamp(0.5rem, 1vw, 1rem); 
}

.ticket.tall { 
  height: clamp(80px, 15vh, 120px); 
}

.form .row { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: clamp(0.5rem, 1vw, 1rem); 
  margin-bottom: clamp(0.5rem, 1vw, 1rem); 
}

.form .input { 
  height: clamp(32px, 6vh, 42px); 
  background: rgba(255,255,255,.06); 
  border-radius: 10px; 
  border: 1px solid rgba(255,255,255,.06); 
}

.form .input.full { 
  height: clamp(48px, 10vh, 64px); 
}

.form .cta-row { 
  display: flex; 
  gap: clamp(0.5rem, 1vw, 1rem); 
  margin-top: clamp(0.5rem, 1vw, 1rem); 
}

.btn-skel { 
  height: clamp(32px, 6vh, 40px); 
  flex: 1; 
  border-radius: 10px; 
  background: linear-gradient(135deg, #6d6cff, #8ea2ff); 
}

.btn-skel.ghost { 
  background: rgba(255,255,255,.06); 
}

/* Features */
.features { 
  padding: clamp(5rem, 10vh, 8rem) clamp(1.5rem, 3vw, 2rem); 
}

.feature-grid {
  display: grid; 
  gap: clamp(1.5rem, 3vw, 2rem);
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 720px) {
  .feature-grid { 
    grid-template-columns: repeat(3, 1fr); 
  }
}

.feature-card {
  background: rgba(255,255,255,.8);
  border: 1px solid rgba(0,0,0,.06);
  padding: clamp(1.25rem, 2.5vw, 1.75rem); 
  border-radius: 14px; 
  text-align: left;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.feature-card h3 { 
  margin: clamp(0.5rem, 1vw, 0.75rem) 0; 
  font-size: clamp(1.125rem, 2vw, 1.5rem); 
  font-weight: 700;
}

.feature-card p { 
  color: var(--muted); 
  font-size: clamp(0.875rem, 1.5vw, 1.125rem); 
  line-height: 1.6;
}

.feature-icon {
  width: clamp(40px, 6vw, 52px); 
  height: clamp(40px, 6vw, 52px); 
  border-radius: 12px;
  display: flex; 
  align-items: center; 
  justify-content: center;
  color: #fff; 
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
}

.gradient-bg-1 { background: linear-gradient(135deg, #4f46e5, #6366f1); }
.gradient-bg-2 { background: linear-gradient(135deg, #10b981, #34d399); }
.gradient-bg-3 { background: linear-gradient(135deg, #f59e0b, #fbbf24); }

/* Steps Timeline */
.steps { 
  padding: clamp(5rem, 10vh, 8rem) clamp(1.5rem, 3vw, 2rem); 
}

.timeline { 
  position: relative; 
  margin-top: clamp(1.5rem, 3vw, 2rem); 
}

.timeline::before {
  content: ''; 
  position: absolute; 
  left: clamp(1.25rem, 2.5vw, 1.5rem); 
  top: 10px; 
  bottom: 10px; 
  width: 2px; 
  background: rgba(255,255,255,.08);
}

.step { 
  display: grid; 
  grid-template-columns: clamp(32px, 5vw, 40px) 1fr; 
  gap: clamp(1rem, 2vw, 1.5rem); 
  position: relative; 
  padding: clamp(1rem, 2vh, 1.5rem) 0 clamp(1rem, 2vh, 1.5rem) 0; 
}

.dot {
  width: clamp(32px, 5vw, 40px); 
  height: clamp(32px, 5vw, 40px); 
  border-radius: 50%;
  display: grid; 
  place-items: center;
  background: linear-gradient(135deg, #6d6cff, #22d3ee);
  font-weight: 800;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}

.step h4 { 
  margin: clamp(0.125rem, 0.25vw, 0.25rem) 0; 
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  font-weight: 700;
}

.step p { 
  color: var(--muted); 
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  line-height: 1.6;
}

/* Chat Input Demo */
.chat-input-demo { 
  padding: clamp(5rem, 10vh, 8rem) clamp(1.5rem, 3vw, 2rem); 
}

.input-demo-card {
  border-radius: clamp(1.25rem, 3vw, 2rem); 
  overflow: hidden;
  background: var(--panel); 
  border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 20px 40px -15px rgba(0,0,0,.1);
  max-width: clamp(800px, 90vw, 1000px); 
  margin: 0 auto;
  padding: clamp(2rem, 4vw, 3rem);
}

.input-container {
  display: flex; 
  align-items: center; 
  gap: clamp(0.75rem, 1.5vw, 1.25rem);
  background: var(--bg); 
  border: 2px solid rgba(79,70,229,.2);
  border-radius: clamp(1rem, 2vw, 1.5rem); 
  padding: clamp(1.5rem, 3vw, 2rem) clamp(1.75rem, 3.5vw, 2.5rem);
  min-height: clamp(60px, 12vh, 80px);
}

.typing-input {
  flex: 1; 
  font-size: clamp(1rem, 2.5vw, 1.5rem); 
  line-height: 1.4; 
  color: var(--text);
  font-family: var(--font-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cursor {
  font-size: clamp(1rem, 2.5vw, 1.5rem); 
  color: var(--primary); 
  font-weight: bold;
  animation: blink 1s infinite;
  margin-left: 1px;
}

.cursor.blinking {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.typing {
  width: 0; 
  white-space: nowrap; 
  overflow: hidden;
  border-right: 2px solid var(--primary);
  animation: typing 4s steps(35) forwards, caret 1s step-end infinite;
}

@keyframes typing { to { width: var(--w); } }
@keyframes caret { 50% { border-color: transparent; } }

/* CTA */
.cta {
  background: linear-gradient(135deg, rgba(109,108,255,.1), rgba(34,211,238,.08));
  border-top: 1px solid rgba(0,0,0,.08);
  padding: clamp(5rem, 10vh, 8rem) 0;
}

.cta-title { 
  text-align: center; 
  font-size: clamp(2rem, 5vw, 3rem); 
  margin-bottom: clamp(0.75rem, 2vw, 1.25rem); 
  font-weight: 800;
}

.cta-sub { 
  text-align: center; 
  color: var(--muted); 
  margin-bottom: clamp(1rem, 2.5vw, 1.5rem); 
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
}

.cta-actions { 
  display: flex; 
  gap: clamp(0.75rem, 2vw, 1.5rem); 
  justify-content: center; 
  flex-wrap: wrap;
}

/* Footer */
.footer { 
  border-top: 1px solid rgba(0,0,0,.06); 
  padding: clamp(2.5rem, 5vh, 4rem) 0 clamp(5rem, 10vh, 8rem); 
  color: var(--muted); 
}

.foot-inner { 
  display: grid; 
  gap: clamp(0.75rem, 1.5vw, 1rem); 
  justify-items: center; 
}

.foot-links { 
  display: flex; 
  gap: clamp(1rem, 2vw, 1.5rem); 
}

.foot-links a { 
  color: var(--muted); 
  text-decoration: none; 
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}

.foot-brand { 
  color: var(--text); 
  font-weight: 800; 
  font-size: clamp(1.125rem, 2vw, 1.5rem);
}

/* Reveal animation */
.reveal { opacity: 0; transform: translateY(14px); transition: opacity .5s ease, transform .5s ease; }
.reveal.is-visible { opacity: 1; transform: translateY(0); }

/* Responsive */
@media (max-width: 860px) {
  .typography-banner {
    padding: clamp(4rem, 10vh, 8rem) clamp(1.5rem, 4vw, 3rem) clamp(6rem, 12vh, 8rem);
    min-height: 90vh;
  }
  
  .banner-headline {
    font-size: clamp(3rem, 12vw, 6rem);
    margin-bottom: clamp(2rem, 6vh, 4rem);
  }
  
  .typing-line {
    width: 90vw;
    max-width: 800px;
    height: 70px;
    padding: 1.25rem 1.75rem;
  }
  
  .typing-text {
    font-size: 1.3rem;
    font-weight: 700;
  }
  
  .cursor {
    font-size: 1.3rem;
  }
  
  .typing-examples {
    max-width: 90vw;
    margin-top: 0.75rem;
  }
  
  .hero { 
    grid-template-columns: 1fr; 
    padding: clamp(4rem, 8vh, 6rem) clamp(2rem, 5vw, 4rem) clamp(3rem, 6vh, 5rem); 
    text-align: center;
    min-height: 85vh;
    gap: clamp(2rem, 4vw, 3rem);
  }
  
  .phone-mock { 
    display: none; 
  }
  
  .mock-window.tall { 
    aspect-ratio: 10/12; 
    margin: 0 auto;
  }
  
  .hero-cta {
    justify-content: center;
  }
  
  .hero-bullets {
    justify-content: center;
  }
  
  .sub {
    max-width: 100%;
  }
  
  .visuals {
    min-height: clamp(350px, 50vh, 450px);
  }
  
  .hero-headline {
    font-size: clamp(2.25rem, 7vw, 3.5rem);
  }
  
  .sub {
    font-size: clamp(1rem, 2vw, 1.3rem);
  }
}

@media (max-width: 480px) {
  .typography-banner {
    padding: clamp(3rem, 8vh, 5rem) clamp(1rem, 3vw, 1.5rem) clamp(4rem, 10vh, 6rem);
    min-height: 80vh;
  }
  
  .banner-headline {
    font-size: clamp(2.5rem, 10vw, 4rem);
    margin-bottom: clamp(1.5rem, 4vh, 2.5rem);
    line-height: 1.1;
  }
  
  .typing-demo {
    margin-top: clamp(1.5rem, 4vh, 2.5rem);
  }
  
  .typing-line {
    width: 95vw;
    max-width: 400px;
    height: 60px;
    padding: 1rem 1.5rem;
  }
  
  .typing-text {
    font-size: 1.1rem;
    font-weight: 700;
  }
  
  .cursor {
    font-size: 1.1rem;
  }
  
  .typing-examples {
    max-width: 95vw;
    font-size: clamp(0.75rem, 1.8vw, 1rem);
    margin-top: 0.5rem;
  }
  
  .example-item {
    padding: clamp(0.4rem, 1vh, 0.6rem) clamp(0.75rem, 1.5vw, 1.25rem);
  }
  
  .hero {
    padding: clamp(3rem, 6vh, 4rem) clamp(1.5rem, 4vw, 2rem) clamp(2.5rem, 5vh, 3rem);
    min-height: 80vh;
    gap: clamp(1.5rem, 3vw, 2rem);
  }
  
  .hero-cta {
    flex-direction: column;
    align-items: center;
  }
  
  .btn.primary, .btn.secondary {
    width: 100%;
    max-width: 300px;
    padding: clamp(1rem, 3vw, 1.25rem) clamp(1.5rem, 4vw, 2rem);
  }
  
  .hero-bullets {
    flex-direction: column;
    align-items: center;
    gap: clamp(0.75rem, 2vw, 1rem);
  }
  
  .visuals {
    min-height: clamp(300px, 45vh, 400px);
  }
  
  .hero-headline {
    font-size: clamp(1.75rem, 6vw, 2.5rem);
    margin-bottom: clamp(1.5rem, 3vw, 2rem);
  }
  
  .sub {
    font-size: clamp(0.9rem, 2vw, 1.2rem);
    margin-bottom: clamp(1.5rem, 3vw, 2rem);
  }
  
  .hero-col .badge {
    margin-bottom: clamp(1rem, 2.5vw, 1.5rem);
    padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1.25rem);
  }
}
</style>