<script setup lang="ts">
/**
 * Nuxt 3 Custom Error Page
 * 
 * CRITICAL FIXES:
 * 1. Uses raw SVG for Logo and icons to prevent dependency/import errors during 500 crashes.
 * 2. Uses constants instead of computed for instant rendering.
 * 3. Uses :global styles to ensure default Nuxt error elements are hidden.
 * 4. Improved layout for perfect centering and mobile responsiveness.
 */
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
})

// Immediate value resolution
const statusCode = Number(props.error?.statusCode) || 404
const statusMessage = props.error?.statusMessage || props.error?.message || '发生了一些意外错误'

// Content mapping
let errorTitle = '哎呀，出了点小状况'
let errorDescription = statusMessage

if (statusCode === 404) {
  errorTitle = '页面在元气森林里迷路了'
  errorDescription = '由于时空缝隙或链接过时，您访问的页面已不存在。'
} else if (statusCode === 500) {
  errorTitle = '服务器正在进行紧急维护'
  errorDescription = '元气核心暂时无法处理您的请求，我们的工程师正在紧急修复。'
}

// Global meta synchronization
useHead({
  title: `${statusCode} | ${errorTitle}`,
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
  ]
})

const goHome = () => {
  if (import.meta.client) {
    window.location.href = '/'
  }
}
</script>

<template>
  <div class="err-root">
    <!-- Immersive Background Layers -->
    <div class="blob-1"></div>
    <div class="blob-2"></div>
    
    <div class="err-container">
      <!-- Top Branding (Raw SVG Logo) -->
      <div class="err-logo">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo-text">元气银行</span>
      </div>

      <!-- Main Visual Block -->
      <div class="err-visual">
        <div class="err-glyph">
          <div class="glyph-card">
            <!-- Ghost SVG (404) -->
            <svg v-if="statusCode === 404" xmlns="http://www.w3.org/2000/svg" class="glyph-svg floating" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-5 14.14V22l3-3 2 2 2-2 3 3v-5.86A8 8 0 0 0 12 2Z"/>
            </svg>
            <!-- Warning SVG (500/Others) -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="glyph-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
            </svg>
          </div>
          <div class="glyph-aura"></div>
        </div>

        <div class="err-info">
          <div class="code-shadow">{{ statusCode }}</div>
          <h1 class="info-title">{{ errorTitle }}</h1>
        </div>
      </div>

      <p class="err-desc">{{ errorDescription }}</p>

      <!-- Action Footer -->
      <div class="err-actions">
        <button @click="goHome" class="primary-action">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          回到主页
        </button>
        <NuxtLink to="/support" class="secondary-link">咨询帮助</NuxtLink>
      </div>

      <div class="site-tag">DESIGNED BY FAMILY BANK</div>
    </div>
  </div>
</template>

<style scoped>
/* 
  PURE CSS CORE FOR INSTANT RENDERING
  Hiding the original Nuxt error page elements globally to prevent flashes.
*/
.err-root {
  position: fixed !important;
  inset: 0 !important;
  z-index: 1000000 !important;
  background-color: #FDFCFD !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  overflow: hidden !important;
  padding: 1.5rem !important;
}

.err-container {
  width: 100%;
  max-width: 42rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 10;
}

.blob-1 {
  position: absolute;
  top: -15%;
  left: -15%;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, rgba(255, 77, 148, 0.1) 0%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
}

.blob-2 {
  position: absolute;
  bottom: -15%;
  right: -15%;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, rgba(124, 77, 255, 0.1) 0%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
}

.err-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 4rem;
  opacity: 0.5;
}

.logo-svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #FF4D94;
}

.logo-text {
  font-size: 0.875rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #1a1a1a;
  text-transform: uppercase;
}

.err-visual {
  width: 100%;
  position: relative;
  margin-bottom: 2rem;
}

.err-glyph {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.glyph-card {
  width: 8rem;
  height: 8rem;
  background: linear-gradient(135deg, #FF4D94 0%, #7C4DFF 100%);
  border-radius: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 30px 60px -15px rgba(255, 77, 148, 0.4);
  transform: rotate(3deg);
  z-index: 2;
}

.glyph-aura {
  position: absolute;
  inset: -20%;
  background: #FF4D94;
  filter: blur(60px);
  opacity: 0.15;
  z-index: 1;
}

.glyph-svg {
  width: 4rem;
  height: 4rem;
}

.floating {
  animation: floating 3s ease-in-out infinite;
}

.err-info {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.code-shadow {
  font-size: 10rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.04);
  line-height: 0.8;
  letter-spacing: -0.05em;
  pointer-events: none;
}

@media (min-width: 640px) {
  .code-shadow {
    font-size: 14rem;
  }
}

.info-title {
  font-size: 2.25rem;
  font-weight: 900;
  color: #1a1a1a;
  margin-top: -2.5rem;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

@media (min-width: 640px) {
  .info-title {
    font-size: 3.5rem;
    margin-top: -3.5rem;
  }
}

.err-desc {
  font-size: 1.125rem;
  color: #6B7280;
  font-weight: 600;
  max-width: 28rem;
  margin: 0 auto 4rem;
  line-height: 1.6;
  padding: 0 1rem;
}

.err-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  align-items: center;
}

@media (min-width: 640px) {
  .err-actions {
    flex-direction: row;
    justify-content: center;
  }
}

.primary-action {
  width: 100%;
  max-width: 18rem;
  padding: 1.25rem 2.5rem;
  background: linear-gradient(to right, #FF4D94, #7C4DFF);
  color: white;
  border-radius: 1.5rem;
  font-weight: 900;
  font-size: 1.125rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 20px 40px -10px rgba(255, 77, 148, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.primary-action:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(124, 77, 255, 0.6);
}

.secondary-link {
  color: #9CA3AF;
  font-weight: 800;
  text-decoration: none;
  font-size: 1.125rem;
  transition: color 0.2s;
}

.secondary-link:hover {
  color: #FF4D94;
}

.site-tag {
  margin-top: 6rem;
  font-size: 0.625rem;
  font-weight: 900;
  color: #E5E7EB;
  letter-spacing: 0.5em;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 2rem;
  width: 12rem;
}

@keyframes floating {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
</style>
