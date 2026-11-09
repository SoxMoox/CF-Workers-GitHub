/**
 * xxoxovx github proxy
 * Powered by Cloudflare Workers
 * Style: Neumorphic Morandi Aesthetic
 */

const TITLE = "xxoxovx github proxy";
const SUBTITLE = "极速 · 纯净 · 边缘加速代理通道";

// 白名单合法域名规则
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

    // 1. 处理根路径或无目标链接，渲染新拟态莫兰迪前端
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(renderHTML(url.origin), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }

    // 2. 处理 favicon
    if (url.pathname === "/favicon.ico") {
      return new Response(FAVICON_SVG, {
        headers: { "Content-Type": "image/svg+xml" }
      });
    }

    // 3. 处理 OPTIONS 预检请求（放行跨域）
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

    // 修复缺少斜杠或协议的常见输入格式
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

    // 安全校验：仅限 GitHub 官方生态域名
    const isAllowed = GITHUB_DOMAINS.some(
      domain => targetUrl.hostname === domain || targetUrl.hostname.endsWith("." + domain)
    );
    if (!isAllowed) {
      return new Response("仅支持加速 GitHub 官方生态资源", { status: 403 });
    }

    // 5. 构造转发请求
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

      // 6. 重写 301/302 重定向链接（确保重定向后继续走代理中转）
      if (response.status >= 300 && response.status < 400 && response.headers.has("Location")) {
        const location = response.headers.get("Location");
        const proxiedLocation = `${url.origin}/${location}`;
        const redirectRes = new Response(response.body, response);
        redirectRes.headers.set("Location", proxiedLocation);
        redirectRes.headers.set("Access-Control-Allow-Origin", "*");
        redirectRes.headers.set("Access-Control-Expose-Headers", "*");
        return redirectRes;
      }

      // 7. 处理常规响应并放行跨域
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

// 网站图标 (SVG 灰绿莫兰迪圆环)
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#E6E2DB"/>
  <circle cx="16" cy="16" r="8" fill="#788A75"/>
  <path d="M12 16l3 3 5-6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

// 新拟态莫兰迪色彩前端模板
function renderHTML(origin) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${TITLE}</title>
  <link rel="icon" href="/favicon.ico" type="image/svg+xml">
  <style>
    :root {
      --bg: #E6E2DB;
      --card-bg: #E6E2DB;
      --shadow-light: #FFFFFF;
      --shadow-dark: #C7C3BB;
      --text-main: #33373B;
      --text-muted: #73787D;
      --morandi-sage: #788A75;
      --morandi-sage-hover: #677864;
      --morandi-blue: #6D7D8D;
      --morandi-rose: #B0827D;
      --morandi-clay: #9C8975;
      --radius-lg: 22px;
      --radius-md: 14px;
      --radius-sm: 8px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    body {
      background-color: var(--bg);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }

    .container {
      width: 100%;
      max-width: 680px;
      margin: 0 auto;
    }

    /* 新拟态凸起主卡片 */
    .card {
      background: var(--card-bg);
      border-radius: var(--radius-lg);
      padding: 36px 32px;
      box-shadow: 14px 14px 28px var(--shadow-dark), -14px -14px 28px var(--shadow-light);
      margin-bottom: 24px;
      transition: all 0.3s ease;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: var(--card-bg);
      border-radius: 50px;
      font-size: 12px;
      font-weight: 500;
      color: var(--morandi-sage);
      box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
      margin-bottom: 14px;
      letter-spacing: 0.5px;
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      background-color: var(--morandi-sage);
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(120, 138, 117, 0.6);
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.5px;
      margin-bottom: 8px;
      text-transform: lowercase;
    }

    p.subtitle {
      font-size: 14px;
      color: var(--text-muted);
    }

    /* 新拟态内凹输入框 */
    .input-wrapper {
      position: relative;
      margin-bottom: 20px;
    }

    .input-box {
      width: 100%;
      height: 54px;
      background: var(--card-bg);
      border: none;
      outline: none;
      border-radius: var(--radius-md);
      padding: 0 18px;
      font-size: 14px;
      color: var(--text-main);
      box-shadow: inset 5px 5px 10px var(--shadow-dark), inset -5px -5px 10px var(--shadow-light);
      transition: all 0.25s ease;
    }

    .input-box:focus {
      box-shadow: inset 7px 7px 12px var(--shadow-dark), inset -7px -7px 12px var(--shadow-light);
      color: #1A1D20;
    }

    .input-box::placeholder {
      color: #9C9B96;
    }

    /* 新拟态按钮群 */
    .btn-group {
      display: flex;
      gap: 12px;
      margin-bottom: 26px;
    }

    .btn {
      flex: 1;
      height: 48px;
      border: none;
      outline: none;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--card-bg);
      color: var(--text-main);
      box-shadow: 6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light);
      transition: all 0.18s ease;
      user-select: none;
    }

    .btn:active {
      box-shadow: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light);
      transform: scale(0.985);
    }

    .btn-primary {
      background: var(--morandi-sage);
      color: #FFFFFF;
      box-shadow: 6px 6px 14px rgba(120, 138, 117, 0.4), -6px -6px 14px var(--shadow-light);
    }

    .btn-primary:hover {
      background: var(--morandi-sage-hover);
    }

    .btn-primary:active {
      background: var(--morandi-sage-hover);
      box-shadow: inset 4px 4px 8px rgba(0, 0, 0, 0.25);
    }

    .btn-secondary {
      color: var(--morandi-blue);
    }

    .btn-clear {
      flex: 0 0 54px;
      color: var(--morandi-rose);
    }

    /* 快捷示例胶囊 */
    .chips-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .chips-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 26px;
    }

    .chip {
      padding: 7px 14px;
      font-size: 12px;
      background: var(--card-bg);
      border-radius: 50px;
      color: var(--text-main);
      cursor: pointer;
      box-shadow: 4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light);
      transition: all 0.2s ease;
      user-select: none;
    }

    .chip:hover {
      color: var(--morandi-sage);
    }

    .chip:active {
      box-shadow: inset 2px 2px 5px var(--shadow-dark), inset -2px -2px 5px var(--shadow-light);
    }

    /* 终端命令展示框 */
    .cmd-panel {
      background: var(--card-bg);
      border-radius: var(--radius-md);
      padding: 16px;
      box-shadow: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light);
      position: relative;
    }

    .cmd-tabs {
      display: flex;
      gap: 16px;
      margin-bottom: 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      padding-bottom: 8px;
    }

    .cmd-tab {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      position: relative;
      padding-bottom: 4px;
      transition: color 0.2s;
    }

    .cmd-tab.active {
      color: var(--morandi-clay);
    }

    .cmd-tab.active::after {
      content: '';
      position: absolute;
      bottom: -9px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--morandi-clay);
      border-radius: 2px;
    }

    .cmd-content {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #404448;
      word-break: break-all;
      line-height: 1.6;
      padding: 4px 0;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 12px;
      letter-spacing: 0.3px;
    }

    /* 复制轻提示 Toast */
    .toast {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%) translateY(40px);
      background: #3A3E42;
      color: #FFFFFF;
      padding: 10px 22px;
      border-radius: 50px;
      font-size: 13px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 999;
    }

    .toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    @media (max-width: 520px) {
      .card {
        padding: 26px 20px;
      }
      .btn-group {
        flex-wrap: wrap;
      }
      .btn {
        min-width: 45%;
      }
      .btn-clear {
        flex: 1;
      }
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="card">
      <div class="header">
        <div class="badge">
          <span class="badge-dot"></span>
          <span>Cloudflare Edge Ready</span>
        </div>
        <h1>${TITLE}</h1>
        <p class="subtitle">${SUBTITLE}</p>
      </div>

      <div class="input-wrapper">
        <input 
          type="text" 
          id="urlInput" 
          class="input-box" 
          placeholder="粘贴 GitHub 链接 (支持 Release / Clone / Raw / Archive...)" 
          autocomplete="off"
        />
      </div>

      <div class="btn-group">
        <button class="btn btn-primary" onclick="handleGo()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          立即加速
        </button>
        <button class="btn btn-secondary" onclick="handleCopy()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          复制加速链接
        </button>
        <button class="btn btn-clear" title="清空" onclick="handleClear()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="chips-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        快捷范例测试：
      </div>
      <div class="chips-group">
        <span class="chip" onclick="fillExample('clone')">Git Clone</span>
        <span class="chip" onclick="fillExample('release')">Release 软件安装包</span>
        <span class="chip" onclick="fillExample('raw')">Raw 安装脚本</span>
        <span class="chip" onclick="fillExample('archive')">源码 ZIP 归档</span>
      </div>

      <div class="cmd-panel">
        <div class="cmd-tabs">
          <span class="cmd-tab active" onclick="switchTab('clone', this)">Git Clone</span>
          <span class="cmd-tab" onclick="switchTab('wget', this)">Wget</span>
          <span class="cmd-tab" onclick="switchTab('curl', this)">cURL</span>
        </div>
        <div class="cmd-content" id="cmdDisplay">输入链接后在此预览终端命令...</div>
      </div>
    </div>

    <div class="footer">
      ${TITLE} · 基于 Cloudflare Workers 边缘网络构建
    </div>
  </div>

  <div class="toast" id="toast">已成功复制到剪贴板</div>

  <script>
    const ORIGIN = "${origin}";
    const input = document.getElementById("urlInput");
    const cmdDisplay = document.getElementById("cmdDisplay");
    let currentTab = "clone";

    const EXAMPLES = {
      clone: "https://github.com/torvalds/linux.git",
      release: "https://github.com/v2fly/v2ray-core/releases/download/v5.29.3/v2ray-windows-64.zip",
      raw: "https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh",
      archive: "https://github.com/vuejs/core/archive/refs/tags/v3.5.0.zip"
    };

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
      document.querySelectorAll(".cmd-tab").forEach(t => t.classList.remove("active"));
      el.classList.add("active");
      updateCmd();
    }

    function showToast(msg) {
      const toast = document.getElementById("toast");
      toast.innerText = msg;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 2200);
    }

    // 初始化填入默认示例
    fillExample("release");
  </script>
</body>
</html>`;
}
