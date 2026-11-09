/**
 * XXOXOVX · GITHUB PROXY
 * Powered by Cloudflare Workers / Pages
 * Style: Morandi Archive Neumorphism (Auto Light/Dark Theme)
 */

const TITLE = "XXOXOVX · GITHUB PROXY";
const SUBTITLE = "MORANDI ARCHIVE · 极速边缘加速节点";

const GITHUB_DOMAINS = [
  "github.com",
  "raw.githubusercontent.com",
  "gist.githubusercontent.com",
  "gist.github.com",
  "codeload.github.com",
  "api.github.com",
  "github-releases.githubusercontent.com",
  "objects.githubusercontent.com",
  "release-assets.githubusercontent.com",
  "media.githubusercontent.com",
  "avatars.githubusercontent.com",
  "user-images.githubusercontent.com"
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. 根路径展示新拟态莫兰迪前端
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(renderHTML(url.origin), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=1800"
        }
      });
    }

    // 2. Favicon 图标
    if (url.pathname === "/favicon.ico") {
      return new Response(FAVICON_SVG, {
        headers: { "Content-Type": "image/svg+xml" }
      });
    }

    // 3. 放行跨域 OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    // 4. 解析目标 GitHub 链接
    let target = url.pathname.slice(1) + url.search;

    if (target.startsWith("http:/") && !target.startsWith("http://")) {
      target = "http://" + target.slice(6);
    } else if (target.startsWith("https:/") && !target.startsWith("https://")) {
      target = "https://" + target.slice(7);
    } else if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = "https://" + target;
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch (e) {
      return new Response("无效的目标 URL 格式", { status: 400 });
    }

    const isAllowed = GITHUB_DOMAINS.some(
      domain => targetUrl.hostname === domain || targetUrl.hostname.endsWith("." + domain)
    );
    if (!isAllowed) {
      return new Response("仅支持加速 GitHub 官方生态资源", { status: 403 });
    }

    // 5. 组装请求头
    const newHeaders = new Headers(request.headers);
    newHeaders.set("Host", targetUrl.hostname);
    newHeaders.set("Origin", targetUrl.origin);
    newHeaders.set("Referer", targetUrl.origin);
    newHeaders.delete("cf-connecting-ip");
    newHeaders.delete("cf-ipcountry");
    newHeaders.delete("cf-ray");
    newHeaders.delete("x-forwarded-proto");

    try {
      const response = await fetch(targetUrl.href, {
        method: request.method,
        headers: newHeaders,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
        redirect: "manual"
      });

      // 6. 重写 301/302 重定向
      if (response.status >= 300 && response.status < 400 && response.headers.has("Location")) {
        const location = response.headers.get("Location");
        const proxiedLocation = `${url.origin}/${location}`;
        const redirectRes = new Response(response.body, response);
        redirectRes.headers.set("Location", proxiedLocation);
        redirectRes.headers.set("Access-Control-Allow-Origin", "*");
        redirectRes.headers.set("Access-Control-Expose-Headers", "*");
        return redirectRes;
      }

      const resHeaders = new Headers(response.headers);
      resHeaders.set("Access-Control-Allow-Origin", "*");
      resHeaders.set("Access-Control-Expose-Headers", "*");
      resHeaders.delete("content-security-policy");
      resHeaders.delete("content-security-policy-report-only");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders
      });
    } catch (err) {
      return new Response(`加速中转失败: ${err.message}`, { status: 502 });
    }
  }
};

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <rect width="40" height="40" rx="12" fill="#E8ECE9"/>
  <circle cx="20" cy="20" r="14" fill="#DCE1DD"/>
  <path d="M20 7L22 17L32 20L22 23L20 33L18 23L8 20L18 17Z" fill="#6E8570"/>
</svg>`;

function renderHTML(origin) {
  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="auto">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${TITLE}</title>
  <link rel="icon" href="/favicon.ico" type="image/svg+xml">
  <script>
    // 立即执行避免闪烁
    (function() {
      const saved = localStorage.getItem('xxoxovx_theme') || 'auto';
      document.documentElement.setAttribute('data-theme', saved);
    })();
  </script>
  <style>
    /* ================= 莫兰迪新拟态核心色彩体系 ================= */
    :root, [data-theme="light"] {
      --bg-body: #EEF0EC;
      --card-bg: #EEF0EC;
      --shadow-dark: rgba(188, 196, 190, 0.75);
      --shadow-light: rgba(255, 255, 255, 0.95);
      --inset-shadow-dark: rgba(195, 203, 197, 0.85);
      --inset-shadow-light: rgba(255, 255, 255, 0.9);
      --text-main: #2C3235;
      --text-muted: #737B80;
      --text-sub: #949D9E;
      --border-subtle: rgba(255, 255, 255, 0.4);
      --morandi-sage: #6E8570;
      --morandi-sage-hover: #5F7461;
      --morandi-blue: #5B7083;
      --morandi-rose: #A3706B;
      --morandi-taupe: #8C7B6D;
      --morandi-accent-dot1: #829481;
      --morandi-accent-dot2: #6D7D8D;
      --morandi-accent-dot3: #B0827D;
      --morandi-accent-dot4: #9C8975;
    }

    [data-theme="dark"] {
      --bg-body: #1E2325;
      --card-bg: #1E2325;
      --shadow-dark: rgba(18, 22, 24, 0.9);
      --shadow-light: rgba(42, 48, 52, 0.7);
      --inset-shadow-dark: rgba(15, 18, 20, 0.95);
      --inset-shadow-light: rgba(40, 47, 51, 0.65);
      --text-main: #E2E6E4;
      --text-muted: #8E999B;
      --text-sub: #636D70;
      --border-subtle: rgba(255, 255, 255, 0.04);
      --morandi-sage: #7E9780;
      --morandi-sage-hover: #8EA790;
      --morandi-blue: #738A9E;
      --morandi-rose: #BD8782;
      --morandi-taupe: #A39284;
      --morandi-accent-dot1: #8FA290;
      --morandi-accent-dot2: #7E90A1;
      --morandi-accent-dot3: #C29590;
      --morandi-accent-dot4: #B09E8C;
    }

    @media (prefers-color-scheme: dark) {
      [data-theme="auto"] {
        --bg-body: #1E2325;
        --card-bg: #1E2325;
        --shadow-dark: rgba(18, 22, 24, 0.9);
        --shadow-light: rgba(42, 48, 52, 0.7);
        --inset-shadow-dark: rgba(15, 18, 20, 0.95);
        --inset-shadow-light: rgba(40, 47, 51, 0.65);
        --text-main: #E2E6E4;
        --text-muted: #8E999B;
        --text-sub: #636D70;
        --border-subtle: rgba(255, 255, 255, 0.04);
        --morandi-sage: #7E9780;
        --morandi-sage-hover: #8EA790;
        --morandi-blue: #738A9E;
        --morandi-rose: #BD8782;
        --morandi-taupe: #A39284;
        --morandi-accent-dot1: #8FA290;
        --morandi-accent-dot2: #7E90A1;
        --morandi-accent-dot3: #C29590;
        --morandi-accent-dot4: #B09E8C;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      -webkit-font-smoothing: antialiased;
      transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
    }

    body {
      background-color: var(--bg-body);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 40px;
    }

    .wrapper {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
    }

    /* 顶部导航栏（对齐 XXOXOVX · BLOG 样式） */
    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      margin-bottom: 24px;
      background: var(--card-bg);
      border-radius: 50px;
      box-shadow: 6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light);
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--card-bg);
      box-shadow: 3px 3px 7px var(--shadow-dark), -3px -3px 7px var(--shadow-light);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-text h2 {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--text-main);
    }

    .brand-text span {
      font-size: 10px;
      letter-spacing: 1px;
      color: var(--text-muted);
      text-transform: uppercase;
      display: block;
    }

    /* 主题模式切换胶囊（同款莫兰迪四色点 + 跟随系统） */
    .theme-capsule {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 14px;
      background: var(--card-bg);
      border-radius: 50px;
      box-shadow: inset 3px 3px 6px var(--inset-shadow-dark), inset -3px -3px 6px var(--inset-shadow-light);
      cursor: pointer;
      user-select: none;
    }

    .theme-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .theme-dots {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }
    .dot-1 { background-color: var(--morandi-accent-dot1); }
    .dot-2 { background-color: var(--morandi-accent-dot2); }
    .dot-3 { background-color: var(--morandi-accent-dot3); }
    .dot-4 { background-color: var(--morandi-accent-dot4); }

    /* 主卡片 */
    .card {
      background: var(--card-bg);
      border-radius: 28px;
      padding: 38px 36px;
      box-shadow: 12px 12px 28px var(--shadow-dark), -12px -12px 28px var(--shadow-light);
      margin-bottom: 24px;
    }

    .hero-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .avatar-wrap {
      width: 72px;
      height: 72px;
      margin: 0 auto 16px;
      border-radius: 50%;
      background: var(--card-bg);
      box-shadow: 6px 6px 16px var(--shadow-dark), -6px -6px 16px var(--shadow-light);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-header h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      color: var(--text-main);
    }

    .hero-header p {
      font-size: 13px;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }

    /* 输入框容器 */
    .input-wrap {
      margin-bottom: 22px;
    }

    .input-box {
      width: 100%;
      height: 54px;
      background: var(--card-bg);
      border: none;
      outline: none;
      border-radius: 16px;
      padding: 0 20px;
      font-size: 14px;
      color: var(--text-main);
      box-shadow: inset 4px 4px 9px var(--inset-shadow-dark), inset -4px -4px 9px var(--inset-shadow-light);
    }

    .input-box::placeholder {
      color: var(--text-sub);
    }

    /* 操作按钮组 */
    .btn-row {
      display: flex;
      gap: 14px;
      margin-bottom: 28px;
    }

    .btn {
      flex: 1;
      height: 48px;
      border: none;
      outline: none;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--card-bg);
      color: var(--text-main);
      box-shadow: 6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light);
      user-select: none;
    }

    .btn:active {
      box-shadow: inset 3px 3px 7px var(--shadow-dark), inset -3px -3px 7px var(--shadow-light);
      transform: scale(0.985);
    }

    .btn-primary {
      background: var(--morandi-sage);
      color: #FFFFFF;
      box-shadow: 6px 6px 16px rgba(110, 133, 112, 0.4), -6px -6px 16px var(--shadow-light);
    }
    .btn-primary:hover {
      background: var(--morandi-sage-hover);
    }

    .btn-secondary {
      color: var(--morandi-blue);
    }

    .btn-clear {
      flex: 0 0 54px;
      color: var(--morandi-rose);
    }

    /* 快捷分类徽标 */
    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 12px;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .pills-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 28px;
    }

    .pill-item {
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 500;
      background: var(--card-bg);
      border-radius: 50px;
      color: var(--text-main);
      cursor: pointer;
      box-shadow: 4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light);
      user-select: none;
    }
    .pill-item:hover {
      color: var(--morandi-sage);
    }
    .pill-item:active {
      box-shadow: inset 2px 2px 6px var(--shadow-dark), inset -2px -2px 6px var(--shadow-light);
    }

    /* 终端命令代码板 */
    .cmd-board {
      background: var(--card-bg);
      border-radius: 18px;
      padding: 16px 20px;
      box-shadow: inset 4px 4px 10px var(--inset-shadow-dark), inset -4px -4px 10px var(--inset-shadow-light);
    }

    .cmd-header {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 8px;
    }

    .tab-btn {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      position: relative;
      padding-bottom: 4px;
    }

    .tab-btn.active {
      color: var(--morandi-sage);
    }
    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -9px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--morandi-sage);
      border-radius: 2px;
    }

    .cmd-text {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: var(--text-main);
      word-break: break-all;
      line-height: 1.6;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      line-height: 1.8;
    }

    /* 轻量 Toast 提示 */
    .toast {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(40px);
      background: var(--text-main);
      color: var(--bg-body);
      padding: 10px 24px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
      opacity: 0;
      pointer-events: none;
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 999;
    }

    .toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    @media (max-width: 540px) {
      .card {
        padding: 28px 20px;
      }
      .btn-row {
        flex-wrap: wrap;
      }
      .btn {
        min-width: 44%;
      }
      .btn-clear {
        flex: 1;
      }
    }
  </style>
</head>
<body>

  <div class="wrapper">
    <!-- 顶部导航 -->
    <header class="top-nav">
      <div class="brand-group">
        <div class="brand-icon">
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
            <path d="M20 6L22.5 17.5L34 20L22.5 22.5L20 34L17.5 22.5L6 20L17.5 17.5Z" fill="var(--morandi-sage)"/>
          </svg>
        </div>
        <div class="brand-text">
          <h2>XXOXOVX · BLOG</h2>
          <span>MORANDI ARCHIVE</span>
        </div>
      </div>

      <!-- 跟随系统 / 浅色 / 深色 切换胶囊 -->
      <div class="theme-capsule" onclick="toggleTheme()" title="点击切换：跟随系统 / 浅色 / 深色">
        <span class="theme-label" id="themeText">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
          </svg>
          跟随系统
        </span>
        <div class="theme-dots">
          <span class="dot dot-1"></span>
          <span class="dot dot-2"></span>
          <span class="dot dot-3"></span>
          <span class="dot dot-4"></span>
        </div>
      </div>
    </header>

    <!-- 主卡片 -->
    <main class="card">
      <div class="hero-header">
        <div class="avatar-wrap">
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
            <path d="M20 5L23 17L35 20L23 23L20 35L17 23L5 20L17 17Z" fill="var(--morandi-sage)"/>
          </svg>
        </div>
        <h1>${TITLE}</h1>
        <p>${SUBTITLE}</p>
      </div>

      <!-- 输入框 -->
      <div class="input-wrap">
        <input 
          type="text" 
          id="urlInput" 
          class="input-box" 
          placeholder="粘贴 GitHub 链接 (支持 Release / Clone / Raw / Archive...)" 
          autocomplete="off"
        />
      </div>

      <!-- 按钮群 -->
      <div class="btn-row">
        <button class="btn btn-primary" onclick="handleGo()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          立即加速
        </button>
        <button class="btn btn-secondary" onclick="handleCopy()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          复制加速链接
        </button>
        <button class="btn btn-clear" title="清空" onclick="handleClear()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- 快捷范例胶囊 -->
      <div class="section-title">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        快速测试范例
      </div>
      <div class="pills-group">
        <span class="pill-item" onclick="fillExample('clone')">Git Clone</span>
        <span class="pill-item" onclick="fillExample('release')">Release 安装包</span>
        <span class="pill-item" onclick="fillExample('raw')">Raw 安装脚本</span>
        <span class="pill-item" onclick="fillExample('archive')">源码归档 ZIP</span>
      </div>

      <!-- 命令行预览板 -->
      <div class="cmd-board">
        <div class="cmd-header">
          <span class="tab-btn active" onclick="switchTab('clone', this)">Git Clone</span>
          <span class="tab-btn" onclick="switchTab('wget', this)">Wget</span>
          <span class="tab-btn" onclick="switchTab('curl', this)">cURL</span>
        </div>
        <div class="cmd-text" id="cmdDisplay">输入链接或点击上方范例后，自动生成终端指令...</div>
      </div>
    </main>

    <!-- 底部信息 -->
    <footer class="footer">
      <div>XXOXOVX · MORANDI ARCHIVE</div>
      <div>基于 Cloudflare Workers 边缘高可用代理节点</div>
    </footer>
  </div>

  <div class="toast" id="toast">已成功复制</div>

  <script>
    const ORIGIN = "${origin}";
    const input = document.getElementById("urlInput");
    const cmdDisplay = document.getElementById("cmdDisplay");
    const themeText = document.getElementById("themeText");
    let currentTab = "clone";

    const EXAMPLES = {
      clone: "https://github.com/torvalds/linux.git",
      release: "https://github.com/v2fly/v2ray-core/releases/download/v5.29.3/v2ray-windows-64.zip",
      raw: "https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh",
      archive: "https://github.com/vuejs/core/archive/refs/tags/v3.5.0.zip"
    };

    // 主题切换机制 (跟随系统 -> 浅色 -> 深色)
    const THEME_CYCLE = ["auto", "light", "dark"];
    const THEME_LABELS = {
      "auto": "跟随系统",
      "light": "浅色模式",
      "dark": "深色模式"
    };

    function updateThemeUI(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      if (themeText) {
        themeText.innerHTML = \`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          \${theme === 'dark' ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>' : '<circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>'}
        </svg> \${THEME_LABELS[theme]}\`;
      }
    }

    function toggleTheme() {
      const current = localStorage.getItem("xxoxovx_theme") || "auto";
      const nextIndex = (THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length;
      const nextTheme = THEME_CYCLE[nextIndex];
      localStorage.setItem("xxoxovx_theme", nextTheme);
      updateThemeUI(nextTheme);
      showToast("已切换为: " + THEME_LABELS[nextTheme]);
    }

    // 初始化主题
    updateThemeUI(localStorage.getItem("xxoxovx_theme") || "auto");

    function cleanUrl(raw) {
      if (!raw) return "";
      let val = raw.trim();
      if (val.startsWith(ORIGIN + "/")) {
        val = val.slice(ORIGIN.length + 1);
      }
      if (!val.startsWith("http://") && !val.startsWith("https://")) {
        val = "https://" + val;
      }
      return val;
    }

    function getProxyUrl() {
      const val = cleanUrl(input.value);
      return val ? ORIGIN + "/" + val : "";
    }

    function updateCmd() {
      const proxyUrl = getProxyUrl();
      if (!proxyUrl) {
        cmdDisplay.innerText = "输入或点击上方范例后，实时生成终端命令...";
        return;
      }

      if (currentTab === "clone") {
        cmdDisplay.innerText = "git clone " + proxyUrl;
      } else if (currentTab === "wget") {
        cmdDisplay.innerText = "wget " + proxyUrl;
      } else if (currentTab === "curl") {
        cmdDisplay.innerText = "curl -O " + proxyUrl;
      }
    }

    input.addEventListener("input", updateCmd);

    function handleGo() {
      const proxyUrl = getProxyUrl();
      if (!proxyUrl) {
        showToast("请先输入合法的 GitHub 链接");
        return;
      }
      window.open(proxyUrl, "_blank");
    }

    function handleCopy() {
      const proxyUrl = getProxyUrl();
      if (!proxyUrl) {
        showToast("请先输入合法的 GitHub 链接");
        return;
      }
      navigator.clipboard.writeText(proxyUrl).then(() => {
        showToast("加速链接已复制到剪贴板！");
      });
    }

    function handleClear() {
      input.value = "";
      updateCmd();
    }

    function fillExample(type) {
      input.value = EXAMPLES[type] || "";
      updateCmd();
    }

    function switchTab(tab, el) {
      currentTab = tab;
      document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      el.classList.add("active");
      updateCmd();
    }

    function showToast(msg) {
      const toast = document.getElementById("toast");
      toast.innerText = msg;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 2000);
    }

    fillExample("release");
  </script>
</body>
</html>`;
}
