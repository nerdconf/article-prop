import {NERDCONF_PROFILE_IMAGE, NERDCONF_PROFILE_URL} from '../../src/lib/proposal.js';
import type {ProposalSnapshot} from './proposals.js';

type IconName = 'message' | 'repeat' | 'heart' | 'chart' | 'bookmark' | 'download' | 'expand';
type ToneName = 'blue' | 'green' | 'pink' | 'muted';
export const PROPOSAL_PAGE_TEMPLATE_VERSION = '2026-04-21-table-expand-v3';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatCreatedAt(createdAt: string) {
  try {
    const date = new Date(createdAt);
    return {
      time: date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      date: date.toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'}),
    };
  } catch {
    return {
      time: '',
      date: '',
    };
  }
}

function buildPageDescription(proposal: ProposalSnapshot) {
  const plainText = stripHtml(proposal.htmlContent);
  return plainText.slice(0, 180) || proposal.articleTitle;
}

function iconSvg(name: IconName, className = 'icon') {
  const common = `class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;

  switch (name) {
    case 'message':
      return `<svg ${common}><path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>`;
    case 'repeat':
      return `<svg ${common}><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`;
    case 'heart':
      return `<svg ${common}><path d="m12 20.4-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.86-8.55 11.58z"/></svg>`;
    case 'chart':
      return `<svg ${common}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`;
    case 'bookmark':
      return `<svg ${common}><path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
    case 'download':
      return `<svg ${common}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>`;
    case 'expand':
      return `<svg ${common}><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/></svg>`;
  }
}

function verifiedBadgeSvg(className = 'verified', color = '#1d9bf0') {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" class="${className}" style="color:${color}">
    <circle cx="12" cy="12" r="10" fill="currentColor"/>
    <path fill="#fff" d="m10.08 15.52-2.9-2.9 1.42-1.42 1.48 1.48 5.32-5.32 1.42 1.42-6.74 6.74Z"/>
  </svg>`;
}

function actionInner(icon: IconName, label?: string) {
  return `<span class="action-hitbox">${iconSvg(icon)}</span>${label ? `<span class="action-label">${escapeHtml(label)}</span>` : ''}`;
}

function actionButton({
  icon,
  label,
  tone = 'muted',
  className = '',
  dataAttrs = '',
}: {
  icon: IconName;
  label?: string;
  tone?: ToneName;
  className?: string;
  dataAttrs?: string;
}) {
  const classes = ['action-button', className].filter(Boolean).join(' ');
  return `<button type="button" class="${classes}" data-tone="${tone}" ${dataAttrs}>${actionInner(icon, label)}</button>`;
}

function actionLink({
  icon,
  label,
  href,
  className = '',
  tone = 'blue',
  extraAttrs = '',
}: {
  icon: IconName;
  label?: string;
  href: string;
  className?: string;
  tone?: ToneName;
  extraAttrs?: string;
}) {
  const classes = ['action-button', className].filter(Boolean).join(' ');
  return `<a class="${classes}" data-tone="${tone}" href="${href}" ${extraAttrs}>${actionInner(icon, label)}</a>`;
}

function threadMetric({
  icon,
  label,
  tone = 'muted',
  className = '',
  dataAttrs = '',
}: {
  icon: IconName;
  label?: string;
  tone?: ToneName;
  className?: string;
  dataAttrs?: string;
}) {
  const classes = ['thread-action', className].filter(Boolean).join(' ');
  return `<button type="button" class="${classes}" data-tone="${tone}" ${dataAttrs}><span class="thread-action-hitbox">${iconSvg(icon, 'thread-icon')}</span>${label ? `<span class="thread-action-label">${escapeHtml(label)}</span>` : ''}</button>`;
}

function renderThreadItem(input: {
  avatarUrl: string;
  avatarAlt: string;
  name: string;
  handleMeta: string;
  bodyHtml: string;
  verifiedColor?: string;
  metricsHtml: string;
}) {
  return `<div class="thread-item">
    <div class="thread-avatar">
      <img src="${input.avatarUrl}" alt="${escapeHtml(input.avatarAlt)}" />
    </div>
    <div class="thread-body">
      <div class="thread-meta">
        <span class="thread-name">${escapeHtml(input.name)}</span>
        ${verifiedBadgeSvg('thread-verified', input.verifiedColor ?? '#1d9bf0')}
        <span class="thread-handle">${escapeHtml(input.handleMeta)}</span>
      </div>
      <div class="thread-copy">${input.bodyHtml}</div>
      <div class="thread-actions">${input.metricsHtml}</div>
    </div>
  </div>`;
}

function enhancementScript() {
  return `<script>
(() => {
  const likeButtons = Array.from(document.querySelectorAll('[data-like-toggle]'));
  const bookmarkButtons = Array.from(document.querySelectorAll('[data-bookmark-toggle]'));
  const modal = document.createElement('div');
  modal.className = 'table-modal';
  modal.innerHTML = '<div class="table-modal-card"><div class="table-modal-header"><div class="table-modal-title">Table detail</div><button type="button" class="table-modal-close" aria-label="Close expanded table"><svg viewBox="0 0 24 24" aria-hidden="true" class="icon" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg></button></div><div class="table-modal-content"></div></div>';
  const modalContent = modal.querySelector('.table-modal-content');
  const modalClose = modal.querySelector('.table-modal-close');
  let liked = false;
  let saved = true;

  document.body.appendChild(modal);

  const closeModal = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (modalContent) {
      modalContent.innerHTML = '';
    }
  };

  const openModal = (tableHtml) => {
    if (!window.matchMedia('(min-width: 1024px)').matches || !modalContent) {
      return;
    }

    modalContent.innerHTML = tableHtml;
    const table = modalContent.querySelector('table');
    if (table) {
      applyAdaptiveColumnWidths(table, true);
    }
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const applyAdaptiveColumnWidths = (table, expanded = false) => {
    const rows = Array.from(table.rows);
    if (!rows.length) return;

    const columnCount = Math.max(...rows.map((row) => row.cells.length));
    if (!columnCount) return;

    const lengths = Array.from({length: columnCount}, () => 0);
    rows.forEach((row) => {
      Array.from(row.cells).forEach((cell, index) => {
        const textLength = (cell.textContent || '').replace(/\\s+/g, ' ').trim().length;
        lengths[index] = Math.max(lengths[index], textLength);
      });
    });

    const widths = lengths.map((length, index) => {
      if (index === 0) {
        return Math.max(170, Math.min(expanded ? 230 : 210, 80 + length * 5));
      }
      return Math.max(expanded ? 180 : 150, Math.min(expanded ? 380 : 320, 72 + length * 3.8));
    });

    const existingColgroup = table.querySelector('colgroup');
    if (existingColgroup) {
      existingColgroup.remove();
    }

    const colgroup = document.createElement('colgroup');
    widths.forEach((width) => {
      const col = document.createElement('col');
      col.style.width = width + 'px';
      colgroup.appendChild(col);
    });
    table.insertBefore(colgroup, table.firstChild);

    const totalWidth = widths.reduce((sum, width) => sum + width, 0);
    table.style.tableLayout = 'fixed';
    table.style.width = totalWidth + 'px';
    table.style.minWidth = totalWidth + 'px';
  };

  const enhanceTables = () => {
    const tables = Array.from(document.querySelectorAll('.content table'));

    tables.forEach((table) => {
      if (table.dataset.expandableTable === 'true') {
        return;
      }

      table.dataset.expandableTable = 'true';
      applyAdaptiveColumnWidths(table, false);

      const block = document.createElement('div');
      block.className = 'table-block';

      const toolbar = document.createElement('div');
      toolbar.className = 'table-toolbar';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'table-expand';
      button.innerHTML = '${iconSvg('expand')}<span>Expand table</span>';
      button.addEventListener('click', () => openModal(table.outerHTML));

      const scroll = document.createElement('div');
      scroll.className = 'table-scroll';

      const parent = table.parentElement;
      if (!parent) return;

      parent.insertBefore(block, table);
      toolbar.appendChild(button);
      block.appendChild(toolbar);
      block.appendChild(scroll);
      scroll.appendChild(table);
    });
  };

  const renderLiked = () => {
    likeButtons.forEach((button) => {
      button.classList.toggle('is-liked', liked);
    });
  };

  const renderSaved = () => {
    bookmarkButtons.forEach((button) => {
      button.classList.toggle('is-active', saved);
    });
  };

  const pulseLike = () => {
    likeButtons.forEach((button) => {
      button.classList.remove('is-bursting');
      void button.offsetWidth;
      button.classList.add('is-bursting');
    });

    window.setTimeout(() => {
      likeButtons.forEach((button) => button.classList.remove('is-bursting'));
    }, 600);
  };

  likeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      liked = !liked;
      renderLiked();
      if (liked) {
        pulseLike();
      } else {
        likeButtons.forEach((node) => node.classList.remove('is-bursting'));
      }
    });
  });

  bookmarkButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      saved = !saved;
      renderSaved();
    });
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  enhanceTables();
  renderLiked();
  renderSaved();
})();
</script>`;
}

export function renderProposalPage(proposal: ProposalSnapshot, origin: string) {
  const canonicalUrl = `${origin.replace(/\/+$/g, '')}/${proposal.slug ?? proposal.id}`;
  const description = buildPageDescription(proposal);
  const escapedTitle = escapeHtml(proposal.articleTitle);
  const escapedDescription = escapeHtml(description);
  const escapedCanonicalUrl = escapeHtml(canonicalUrl);
  const assetBaseUrl = origin.replace(/\/+$/g, '');
  const {time, date} = formatCreatedAt(proposal.createdAt);
  const markdownDownloadUrl = `${assetBaseUrl}/api/proposal-md?slug=${encodeURIComponent(proposal.slug ?? '')}`;
  const coverSection = proposal.coverImage
    ? `<div class="cover"><img src="${proposal.coverImage}" alt="${escapedTitle}" /></div>`
    : '<div class="cover cover--empty"><span>No cover image uploaded</span></div>';

  const mainActions = [
    actionButton({icon: 'message', label: 'Discuss', tone: 'blue'}),
    actionButton({icon: 'repeat', label: 'v1.0', tone: 'green'}),
    actionButton({icon: 'heart', label: 'Approve', tone: 'pink', className: 'like-button', dataAttrs: 'data-like-toggle="shared"'}),
    actionButton({icon: 'chart', label: 'Confidential', tone: 'blue'}),
  ].join('');

  const utilityActions = [
    actionButton({icon: 'bookmark', tone: 'blue', className: 'bookmark-button is-active', dataAttrs: 'data-bookmark-toggle="shared"'}),
    actionLink({icon: 'download', label: '.md', href: markdownDownloadUrl, className: 'download-link', tone: 'blue', extraAttrs: 'download'}),
  ].join('');

  const replyBandActions = [
    actionButton({icon: 'message', label: 'Discuss', tone: 'blue'}),
    actionButton({icon: 'repeat', label: 'Revise', tone: 'green'}),
    actionButton({icon: 'heart', label: 'Approve', tone: 'pink', className: 'like-button', dataAttrs: 'data-like-toggle="shared"'}),
    actionButton({icon: 'bookmark', tone: 'blue', className: 'bookmark-button is-active', dataAttrs: 'data-bookmark-toggle="shared"'}),
  ].join('');

  const threadHtml = [
    renderThreadItem({
      avatarUrl: NERDCONF_PROFILE_IMAGE,
      avatarAlt: 'NERDCONF',
      name: 'NERDCONF',
      handleMeta: '@nerdconf_ar · 1m',
      bodyHtml:
        "Next steps: If you're happy with this proposal, just reply to the email with your thoughts. We'll then prepare the MSA and SOW to get started. Excited to partner with you! 🚀",
      metricsHtml: [
        threadMetric({icon: 'message', tone: 'blue'}),
        threadMetric({icon: 'repeat', tone: 'green'}),
        threadMetric({icon: 'heart', tone: 'pink', className: 'like-button', dataAttrs: 'data-like-toggle="shared"'}),
      ].join(''),
    }),
    renderThreadItem({
      avatarUrl: 'https://pbs.twimg.com/profile_images/1780044485541699584/p78MCn3B_400x400.jpg',
      avatarAlt: 'Elon Musk',
      name: 'Elon Musk',
      handleMeta: '@elonmusk · Apr 1',
      verifiedColor: '#ffd700',
      bodyHtml:
        'Working with <span class="thread-mention">@nerdconf_ar</span> was the best decision we made this year. They completely transformed our architecture and delivered 10x ROI. Highly recommend! 🔥',
      metricsHtml: [
        threadMetric({icon: 'message', label: '1.2K', tone: 'blue'}),
        threadMetric({icon: 'repeat', label: '4.5K', tone: 'green'}),
        threadMetric({icon: 'heart', label: '30.2K', tone: 'pink', className: 'like-button', dataAttrs: 'data-like-toggle="shared"'}),
      ].join(''),
    }),
  ].join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(proposal.title)}</title>
    <meta name="description" content="${escapedDescription}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapedCanonicalUrl}" />
    <meta name="nerdconf-proposal-template" content="${PROPOSAL_PAGE_TEMPLATE_VERSION}" />
    ${proposal.coverImage ? `<meta property="og:image" content="${proposal.coverImage}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    ${proposal.coverImage ? `<meta name="twitter:image" content="${proposal.coverImage}" />` : ''}
    <link rel="icon" type="image/svg+xml" href="${assetBaseUrl}/favicon.svg" />
    <style>
      :root {
        color-scheme: dark;
        --bg: #000;
        --text: #e7e9ea;
        --muted: #71767b;
        --border: #2f3336;
        --blue: #1d9bf0;
        --green: #00ba7c;
        --pink: #f91880;
      }
      * { box-sizing: border-box; }
      html { background: var(--bg); }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family: "TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      a { color: inherit; }
      button {
        font: inherit;
        appearance: none;
        background: none;
        border: 0;
      }
      .page {
        max-width: 600px;
        min-height: 100vh;
        margin: 0 auto;
        border-left: 1px solid var(--border);
        border-right: 1px solid var(--border);
      }
      .header { padding: 16px 16px 0; }
      .identity {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
      }
      .identity:hover .name { text-decoration: underline; }
      .avatar {
        width: 48px;
        height: 48px;
        border-radius: 999px;
        overflow: hidden;
        border: 1px solid var(--border);
        background: #060d1a;
        flex: 0 0 auto;
      }
      .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .identity-meta { min-width: 0; }
      .name-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 20px;
        font-weight: 700;
      }
      .handle {
        color: var(--muted);
        font-size: 14px;
      }
      .verified {
        width: 18px;
        height: 18px;
        flex: 0 0 auto;
        transform: translateY(1px);
      }
      .cover {
        margin-top: 16px;
        width: 100%;
        aspect-ratio: 21 / 9;
        background: #111827;
        overflow: hidden;
      }
      .cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .cover--empty {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        background: linear-gradient(135deg, #111827, #000);
      }
      .body { padding: 20px 16px 24px; }
      h1 {
        margin: 0 0 16px;
        font-size: clamp(2.45rem, 7vw, 3.15rem);
        line-height: 0.98;
        letter-spacing: -0.03em;
      }
      .metrics {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding-bottom: 16px;
        color: var(--muted);
      }
      .metrics-left,
      .metrics-right {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: nowrap;
      }
      .action-button,
      .download-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        color: var(--muted);
        text-decoration: none;
        cursor: pointer;
        transition: color 160ms ease;
      }
      .action-hitbox,
      .thread-action-hitbox {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        transition: background-color 160ms ease, transform 180ms ease, color 160ms ease;
      }
      .action-hitbox {
        width: 32px;
        height: 32px;
      }
      .thread-action-hitbox {
        width: 28px;
        height: 28px;
      }
      .action-label,
      .thread-action-label {
        font-size: 13px;
      }
      .action-button[data-tone="blue"]:hover { color: var(--blue); }
      .action-button[data-tone="blue"]:hover .action-hitbox { background: rgba(29, 155, 240, 0.1); }
      .action-button[data-tone="green"]:hover { color: var(--green); }
      .action-button[data-tone="green"]:hover .action-hitbox { background: rgba(0, 186, 124, 0.1); }
      .action-button[data-tone="pink"]:hover { color: var(--pink); }
      .action-button[data-tone="pink"]:hover .action-hitbox { background: rgba(249, 24, 128, 0.1); }
      .download-link {
        color: var(--blue);
        font-weight: 600;
      }
      .download-link:hover { color: #63b3ff; }
      .download-link:hover .action-hitbox { background: rgba(29, 155, 240, 0.1); }
      .bookmark-button.is-active {
        color: var(--blue);
      }
      .bookmark-button.is-active .icon {
        fill: currentColor;
      }
      .bookmark-button.is-active .action-hitbox {
        background: rgba(29, 155, 240, 0.1);
      }
      .like-button.is-liked {
        color: var(--pink);
      }
      .like-button.is-liked .icon {
        fill: currentColor;
      }
      .like-button.is-liked .action-hitbox,
      .like-button.is-liked .thread-action-hitbox {
        transform: scale(1.08);
      }
      .like-button.is-bursting .action-hitbox::after,
      .like-button.is-bursting .thread-action-hitbox::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: rgba(249, 24, 128, 0.2);
        animation: like-ping 600ms ease-out forwards;
      }
      .divider {
        border-top: 1px solid var(--border);
        margin: 0 -16px;
        padding: 24px 16px 0;
      }
      .content {
        font-size: 19px;
        line-height: 1.75;
      }
      .content p { margin: 0 0 24px; }
      .content h2,
      .content h3 {
        line-height: 1.1;
        margin: 32px 0 16px;
        letter-spacing: -0.02em;
      }
      .content ul,
      .content ol {
        padding-left: 24px;
        margin: 0 0 24px;
      }
      .content li { margin: 8px 0; }
      .content table {
        border-collapse: collapse;
        margin: 0 0 24px;
        font-size: 16px;
      }
      .table-block {
        margin: 0 0 24px;
      }
      .table-toolbar {
        display: none;
        justify-content: flex-end;
        margin-bottom: 8px;
      }
      .table-scroll {
        overflow-x: auto;
        border: 1px solid var(--border);
        border-radius: 16px;
        background: var(--bg);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
      }
      .table-expand {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border: 1px solid #374151;
        border-radius: 999px;
        color: #8ecdfc;
        background: #0b0f14;
        cursor: pointer;
        transition: color 160ms ease, border-color 160ms ease;
      }
      .table-expand:hover {
        color: #c7e8ff;
        border-color: var(--blue);
      }
      .table-expand .icon {
        width: 14px;
        height: 14px;
      }
      .content thead th {
        background: #111827;
        color: var(--text);
        font-weight: 600;
      }
      .content th,
      .content td {
        border: 1px solid var(--border);
        padding: 10px 12px;
        text-align: left;
        vertical-align: top;
        white-space: normal;
        word-break: break-word;
        overflow-wrap: anywhere;
      }
      .content tr > :first-child {
        width: 180px;
        min-width: 180px;
        max-width: 180px;
      }
      .content tr > :not(:first-child) {
        width: 300px;
        min-width: 300px;
      }
      .content a {
        color: #8ecdfc;
        text-decoration: underline;
        text-decoration-color: rgba(29,155,240,0.55);
        text-underline-offset: 0.18em;
        background: rgba(29,155,240,0.12);
        padding: 2px 4px;
        border-radius: 6px;
      }
      .content blockquote {
        margin: 0 0 24px;
        padding-left: 16px;
        border-left: 4px solid #374151;
        color: #9ca3af;
        font-style: italic;
      }
      .content code {
        background: #111827;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 0.9em;
      }
      .content pre {
        background: #111827;
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        overflow: auto;
      }
      .content pre code {
        background: none;
        padding: 0;
      }
      .timestamp {
        display: flex;
        gap: 6px;
        margin-top: 48px;
        color: var(--muted);
        font-size: 14px;
        flex-wrap: wrap;
      }
      .timestamp strong {
        color: var(--text);
        font-weight: 700;
      }
      .reply-band {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
        margin: 16px -16px 0;
        color: var(--muted);
      }
      .reply-band .action-button { font-size: 14px; }
      .thread {
        margin: 0 -16px;
        padding: 16px 16px 0;
      }
      .thread-item {
        display: flex;
        gap: 12px;
        padding: 16px;
      }
      .thread-item + .thread-item { border-top: 1px solid var(--border); }
      .thread-avatar {
        width: 40px;
        height: 40px;
        border-radius: 999px;
        overflow: hidden;
        flex: 0 0 auto;
        border: 1px solid var(--border);
      }
      .thread-avatar img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }
      .thread-body { min-width: 0; flex: 1 1 auto; }
      .thread-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
      }
      .thread-name {
        font-weight: 700;
        color: var(--text);
      }
      .thread-handle { color: var(--muted); }
      .thread-verified {
        width: 16px;
        height: 16px;
        transform: translateY(1px);
        flex: 0 0 auto;
      }
      .thread-copy {
        margin-top: 4px;
        color: var(--text);
        line-height: 1.65;
      }
      .thread-mention { color: var(--blue); }
      .thread-actions {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-top: 12px;
        color: var(--muted);
      }
      .thread-action {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        color: var(--muted);
        cursor: pointer;
        transition: color 160ms ease;
      }
      .thread-action[data-tone="blue"]:hover { color: var(--blue); }
      .thread-action[data-tone="blue"]:hover .thread-action-hitbox { background: rgba(29, 155, 240, 0.1); }
      .thread-action[data-tone="green"]:hover { color: var(--green); }
      .thread-action[data-tone="green"]:hover .thread-action-hitbox { background: rgba(0, 186, 124, 0.1); }
      .thread-action[data-tone="pink"]:hover { color: var(--pink); }
      .thread-action[data-tone="pink"]:hover .thread-action-hitbox { background: rgba(249, 24, 128, 0.1); }
      .icon {
        width: 18px;
        height: 18px;
        display: inline-block;
        vertical-align: middle;
      }
      .thread-icon {
        width: 16px;
        height: 16px;
        display: inline-block;
        vertical-align: middle;
      }
      .table-modal {
        position: fixed;
        inset: 0;
        z-index: 120;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(10px);
      }
      .table-modal.is-open {
        display: flex;
      }
      .table-modal-card {
        display: flex;
        flex-direction: column;
        width: min(1400px, 100%);
        max-height: 92vh;
        overflow: hidden;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: var(--bg);
        box-shadow: 0 24px 80px rgba(0,0,0,0.55);
      }
      .table-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
      }
      .table-modal-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--text);
      }
      .table-modal-subtitle {
        display: none;
      }
      .table-modal-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 999px;
        color: var(--muted);
        cursor: pointer;
        transition: color 160ms ease, background-color 160ms ease;
      }
      .table-modal-close:hover {
        color: var(--text);
        background: rgba(255,255,255,0.05);
      }
      .table-modal-content {
        overflow: auto;
        padding: 20px;
      }
      .table-modal-content table {
        margin: 0;
      }
      .table-modal-content th,
      .table-modal-content td {
        border: 1px solid var(--border);
        padding: 10px 12px;
        text-align: left;
        vertical-align: top;
      }
      .table-modal-content thead th {
        background: #111827;
        color: var(--text);
        font-weight: 600;
      }
      .table-modal-content th,
      .table-modal-content td {
        white-space: normal;
        word-break: break-word;
        overflow-wrap: anywhere;
      }
      .table-modal-content thead th {
        position: sticky;
        top: 0;
        z-index: 1;
      }
      .table-modal-content tbody tr:nth-child(even) {
        background: rgba(255,255,255,0.02);
      }
      .table-modal-content tbody tr:hover {
        background: rgba(255,255,255,0.03);
      }
      @keyframes like-ping {
        from {
          opacity: 0.65;
          transform: scale(0.85);
        }
        to {
          opacity: 0;
          transform: scale(1.55);
        }
      }
      @media (max-width: 640px) {
        .metrics,
        .reply-band {
          flex-direction: column;
          align-items: flex-start;
        }
        .metrics-left,
        .metrics-right {
          flex-wrap: wrap;
        }
      }
      @media (min-width: 1024px) {
        .table-toolbar {
          display: flex;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <a class="identity" href="${NERDCONF_PROFILE_URL}" target="_blank" rel="noreferrer">
          <div class="avatar">
            <img src="${NERDCONF_PROFILE_IMAGE}" alt="@NERDCONF profile" />
          </div>
          <div class="identity-meta">
            <div class="name-row">
              <span class="name">NERDCONF</span>
              ${verifiedBadgeSvg()}
            </div>
            <div class="handle">@nerdconf_ar</div>
          </div>
        </a>
      </div>
      ${coverSection}
      <div class="body">
        <h1>${escapedTitle}</h1>
        <div class="metrics">
          <div class="metrics-left">${mainActions}</div>
          <div class="metrics-right">${utilityActions}</div>
        </div>
        <div class="divider">
          <div class="content">${proposal.htmlContent}</div>
        </div>
        <div class="timestamp">
          ${time ? `<span>${escapeHtml(time)}</span><span>·</span>` : ''}
          ${date ? `<span>${escapeHtml(date)}</span><span>·</span>` : ''}
          <strong>1</strong>
          <span>Exclusive View</span>
        </div>
        <div class="reply-band">${replyBandActions}</div>
        <div class="thread">${threadHtml}</div>
      </div>
    </div>
    ${enhancementScript()}
  </body>
</html>`;
}
