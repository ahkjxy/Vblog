
import { FamilyState, Task } from '../types';
import { FIXED_SYNC_ID } from '../constants';
import { formatDateTime } from './datetime';

export function generateHTMLReport(
  state: FamilyState
): string {
  const now = new Date();
  const reportDate = formatDateTime(now);

  const learningTasks = state.tasks.filter(t => t.category === 'learning');
  const choresTasks = state.tasks.filter(t => t.category === 'chores');
  const disciplineTasks = state.tasks.filter(t => t.category === 'discipline');
  const penaltyTasks = state.tasks.filter(t => t.category === 'penalty');
  const rewardItems = state.rewards;

  const renderTaskItems = (items: Task[]) => {
    if (items.length === 0) return '<div class="empty-state">暂无配置规则</div>';
    return `
      <div class="grid-container">
        ${items.map(t => `
          <div class="task-card">
            <div class="task-points">${t.points > 0 ? '+' : ''}${t.points}</div>
            <div class="task-content">
              <div class="task-title">${t.title}</div>
              <div class="task-desc">${t.description || ''}</div>
            </div>
            <div class="task-freq">${t.frequency || '随时'}</div>
          </div>
        `).join('')}
      </div>
    `;
  };

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>元气银行 · 家庭制度手册</title>
    <style>
        @page { size: A4; margin: 15mm; }
        @media print {
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { background: white !important; }
            .no-print { display: none; }
        }
        :root {
            --accent: #FF4D94;
            --secondary: #7C4DFF;
            --text-main: #1e293b;
            --text-sub: #64748b;
            --border: #e2e8f0;
        }
        body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif;
            color: var(--text-main);
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background: #f8fafc;
        }
        .book {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            min-height: 297mm;
            box-shadow: 0 0 40px rgba(0,0,0,0.05);
        }
        header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 4px solid var(--accent);
            padding-bottom: 24px;
            margin-bottom: 40px;
        }
        .brand h1 {
            font-size: 32px;
            font-weight: 900;
            margin: 0;
            letter-spacing: -0.02em;
            background: linear-gradient(to right, var(--accent), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .brand p {
            margin: 4px 0 0 0;
            font-weight: 700;
            color: var(--text-sub);
            font-size: 12px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
        }
        .meta { text-align: right; font-size: 11px; color: var(--text-sub); line-height: 1.8; }
        
        .section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 40px 0 20px 0;
            padding-left: 12px;
            border-left: 5px solid var(--accent);
        }
        .section-header h2 { font-size: 20px; font-weight: 900; margin: 0; color: var(--text-main); }
        
        .category-label {
            font-size: 12px;
            font-weight: 800;
            color: var(--accent);
            margin: 24px 0 12px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .category-label::after { content: ""; flex: 1; height: 1px; background: var(--border); }

        .grid-container {
            display: grid;
            grid-template-cols: repeat(2, 1fr);
            gap: 12px;
        }
        .task-card {
            border: 1px solid var(--border);
            padding: 12px;
            border-radius: 8px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            background: #fafafa;
        }
        .task-points {
            font-family: "Georgia", serif;
            font-weight: 900;
            font-size: 16px;
            color: var(--accent);
            min-width: 32px;
            text-align: center;
            padding-top: 2px;
        }
        .task-content { flex: 1; }
        .task-title { font-weight: 700; font-size: 13px; color: var(--text-main); }
        .task-desc { font-size: 10px; color: var(--text-sub); margin-top: 2px; }
        .task-freq { font-size: 9px; font-weight: 800; background: #eee; padding: 2px 6px; border-radius: 4px; color: #666; }

        .rewards-grid {
            display: grid;
            grid-template-cols: repeat(3, 1fr);
            gap: 15px;
        }
        .reward-card {
            border: 1.5px dashed var(--secondary);
            padding: 15px;
            border-radius: 12px;
            text-align: center;
            background: rgba(124, 77, 255, 0.02);
        }
        .reward-val { font-size: 18px; font-weight: 900; color: var(--secondary); margin-bottom: 4px; }
        .reward-name { font-size: 12px; font-weight: 700; color: var(--text-main); }
        .reward-type { font-size: 9px; color: var(--text-sub); margin-top: 4px; text-transform: uppercase; font-weight: 800; }

        .footer {
            margin-top: 80px;
            padding-top: 30px;
            border-top: 1px dashed var(--border);
            text-align: center;
            font-size: 10px;
            color: var(--text-sub);
            font-weight: 600;
        }
        .footer strong { color: var(--accent); }
        
        .empty-state { font-size: 11px; font-style: italic; color: var(--text-sub); padding: 10px; }
    </style>
</head>
<body>
    <div class="book">
        <header>
            <div class="brand">
                <h1>元气银行</h1>
                <p>Energy Assets Management</p>
            </div>
            <div class="meta">
                Document ID: ${FIXED_SYNC_ID}<br>
                Published: ${reportDate}<br>
                Version: 2026.1.0
            </div>
        </header>

        <div class="section-header">
            <h2>壹 · 赚取元气规则 (Earning)</h2>
        </div>
        
        <div class="category-label">📘 学习与提升 (Learning & Growth)</div>
        ${renderTaskItems(learningTasks)}

        <div class="category-label">🧹 家庭责任感 (Chore Responsibilities)</div>
        ${renderTaskItems(choresTasks)}

        <div class="category-label">⏰ 个人自律 (Self-Discipline)</div>
        ${renderTaskItems(disciplineTasks)}

        <div class="section-header" style="border-color: #f43f5e;">
            <h2>贰 · 能量损耗警告 (Penalty)</h2>
        </div>
        ${renderTaskItems(penaltyTasks)}

        <div class="section-header" style="border-color: var(--secondary);">
            <h2>叁 · 梦想商店价目表 (Rewards)</h2>
        </div>
        <div class="rewards-grid">
            ${rewardItems.map(r => `
                <div class="reward-card">
                    <div class="reward-val">${r.points} BP</div>
                    <div class="reward-name">${r.title}</div>
                    <div class="reward-type">${r.type}</div>
                </div>
            `).join('')}
        </div>

        <div class="footer">
            让家庭更加美好 · <strong>Family Bank Systems</strong><br>
            © 2026 王氏家庭委员会版权所有
        </div>
    </div>
</body>
</html>`;
  return html;
}

export function printReport(state: FamilyState): void {
  const html = generateHTMLReport(state);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    };
    return;
  }

  // fallback: 如果弹窗被拦截，则用隐藏 iframe 打印
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.srcdoc = html;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 500);
  };
}

export function exportToHTML(state: FamilyState): void {
  const html = generateHTMLReport(state);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `家庭积分制度手册.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
