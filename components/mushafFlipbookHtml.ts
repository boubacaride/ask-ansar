/**
 * Mushaf Flipbook HTML Template
 * Renders a full Quran PDF with pdf.js in a flipbook-style viewer
 * with bottom toolbar, surah TOC, thumbnails, zoom, audio, etc.
 */

interface SurahPageInfo {
  number: number;
  name: string;
  arabicName: string;
  startPage: number;
}

export function generateFlipbookHtml(
  surahPages: SurahPageInfo[],
  darkMode: boolean,
  initialPage: number = 1,
  pdfUrl: string = 'https://d6artovf3mfn.cloudfront.net/ansar_pdf/mumtaz-1.pdf',
): string {
  const surahJson = JSON.stringify(surahPages);
  // Safely escape the PDF URL for embedding inside a JS string literal in HTML
  const safePdfUrl = pdfUrl.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Al-Mushaf Al-Sharif</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<style>
  :root {
    --bg: ${darkMode ? '#0a0a0a' : '#f5f0e8'};
    --toolbar-bg: ${darkMode ? '#1a1a2e' : '#1b5e20'};
    --toolbar-text: #ffffff;
    --sidebar-bg: ${darkMode ? '#1e1e2d' : '#ffffff'};
    --sidebar-text: ${darkMode ? '#ffffff' : '#1a1a2e'};
    --sidebar-secondary: ${darkMode ? '#a0a0b0' : '#6c757d'};
    --sidebar-border: ${darkMode ? '#2d2d44' : '#e0e0e0'};
    --sidebar-hover: ${darkMode ? '#2d2d44' : '#e8f5e9'};
    --accent: #c9a227;
    --primary: #00897b;
    --overlay: rgba(0,0,0,0.5);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg);
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    touch-action: pan-y;
    -webkit-user-select: none;
    user-select: none;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ─── Page Viewer ─── */
  #viewer {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  #canvasWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }

  #pageCanvas {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  /* ─── Navigation Arrows ─── */
  .nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(27, 94, 32, 0.75);
    border: 2px solid rgba(255,255,255,0.3);
    color: white;
    font-size: 26px;
    cursor: pointer;
    z-index: 10;
    border-radius: 12px;
    opacity: 0.9;
    transition: opacity 0.2s, background 0.2s;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    -webkit-tap-highlight-color: transparent;
  }
  .nav-arrow:hover { opacity: 1; background: rgba(27, 94, 32, 0.9); }
  .nav-arrow:active { opacity: 1; background: rgba(27, 94, 32, 1); }
  .nav-arrow.disabled { opacity: 0.3; cursor: default; pointer-events: none; }
  /* Right arrow on RIGHT side => goes to LOWER page numbers (toward chapter 1) */
  .nav-arrow.right { right: 4px; }
  /* Left arrow on LEFT side => goes to HIGHER page numbers (toward chapter 114) */
  .nav-arrow.left { left: 4px; }

  /* ─── Loading Overlay ─── */
  #loadingOverlay {
    position: absolute;
    inset: 0;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100;
    transition: opacity 0.3s;
  }
  #loadingOverlay.hidden { opacity: 0; pointer-events: none; }

  .spinner {
    width: 48px; height: 48px;
    border: 4px solid rgba(0,137,123,0.2);
    border-top-color: #00897b;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .loading-text {
    margin-top: 16px;
    color: var(--primary);
    font-size: 16px;
    font-weight: 600;
  }
  .loading-sub {
    margin-top: 6px;
    color: var(--sidebar-secondary);
    font-size: 13px;
  }

  /* ─── Bottom Toolbar ─── */
  #toolbar {
    height: 52px;
    background: var(--toolbar-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    gap: 2px;
    flex-shrink: 0;
    position: relative;
  }

  .tb-btn {
    width: 44px; height: 44px;
    min-width: 44px;
    display: flex; align-items: center; justify-content: center;
    background: transparent;
    border: none;
    color: var(--toolbar-text);
    cursor: pointer;
    border-radius: 8px;
    font-size: 18px;
    transition: background 0.15s;
    position: relative;
    -webkit-tap-highlight-color: transparent;
  }
  .tb-btn:hover { background: rgba(255,255,255,0.15); }
  .tb-btn:active { background: rgba(255,255,255,0.25); }
  .tb-btn.active { background: rgba(255,255,255,0.2); }
  .tb-btn svg { width: 22px; height: 22px; fill: currentColor; }

  #pageCounter {
    color: var(--toolbar-text);
    font-size: 13px;
    font-weight: 600;
    padding: 0 6px;
    white-space: nowrap;
    cursor: pointer;
    min-width: 65px;
    text-align: center;
    -webkit-tap-highlight-color: transparent;
  }

  /* ─── More Options Menu — positioned relative to the more button ─── */
  #moreMenuWrapper {
    position: relative;
    display: inline-flex;
  }
  #moreMenu {
    position: absolute;
    bottom: 48px;
    right: 0;
    background: var(--sidebar-bg);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    min-width: 220px;
    max-width: 90vw;
    z-index: 200;
    display: none;
    overflow: hidden;
  }
  #moreMenu.show { display: block; }

  .menu-item {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px;
    color: var(--sidebar-text);
    font-size: 14px;
    cursor: pointer;
    border-bottom: 1px solid var(--sidebar-border);
    transition: background 0.15s;
  }
  .menu-item:last-child { border-bottom: none; }
  .menu-item:hover { background: var(--sidebar-hover); }
  .menu-item svg { width: 18px; height: 18px; fill: var(--primary); flex-shrink: 0; }

  /* ─── Share Menu ─── */
  #shareMenuWrapper {
    position: relative;
    display: inline-flex;
  }
  #shareMenu {
    position: absolute;
    bottom: 48px;
    right: 0;
    background: var(--sidebar-bg);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    min-width: 200px;
    max-width: 90vw;
    z-index: 200;
    display: none;
    overflow: hidden;
  }
  #shareMenu.show { display: block; }

  .share-item {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px;
    color: var(--sidebar-text);
    font-size: 14px;
    cursor: pointer;
    border-bottom: 1px solid var(--sidebar-border);
    transition: background 0.15s;
  }
  .share-item:last-child { border-bottom: none; }
  .share-item:hover { background: var(--sidebar-hover); }
  .share-item svg { width: 20px; height: 20px; flex-shrink: 0; }

  /* ─── Surah Sidebar ─── */
  #surahSidebar {
    position: absolute;
    top: 0; left: 0; bottom: 52px;
    width: 300px;
    max-width: 85vw;
    background: var(--sidebar-bg);
    z-index: 150;
    display: none;
    flex-direction: column;
    box-shadow: 4px 0 20px rgba(0,0,0,0.2);
  }
  #surahSidebar.show { display: flex; }

  .sidebar-header {
    padding: 16px;
    background: var(--toolbar-bg);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sidebar-title {
    color: white;
    font-size: 18px;
    font-weight: 700;
    font-family: -apple-system, sans-serif;
  }
  .sidebar-close {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.2);
    border: none; border-radius: 50%;
    color: white; font-size: 18px;
    cursor: pointer;
  }

  .sidebar-search {
    padding: 12px 16px;
    border-bottom: 1px solid var(--sidebar-border);
  }
  .sidebar-search input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--sidebar-border);
    border-radius: 10px;
    font-size: 14px;
    background: var(--bg);
    color: var(--sidebar-text);
    outline: none;
  }

  .surah-list {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .surah-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid var(--sidebar-border);
    transition: background 0.15s;
  }
  .surah-item:hover { background: var(--sidebar-hover); }
  .surah-item.current { background: ${darkMode ? 'rgba(0,137,123,0.15)' : 'rgba(0,137,123,0.08)'}; }

  .surah-num {
    width: 32px; height: 32px;
    background: var(--primary);
    color: white;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    flex-shrink: 0;
  }
  .surah-info { flex: 1; }
  .surah-name-latin {
    font-size: 14px;
    font-weight: 600;
    color: var(--sidebar-text);
  }
  .surah-page {
    font-size: 11px;
    color: var(--sidebar-secondary);
    margin-top: 1px;
  }
  .surah-arabic {
    font-size: 18px;
    color: var(--primary);
    font-family: -apple-system, 'Traditional Arabic', serif;
  }

  /* ─── Thumbnail Grid ─── */
  #thumbGrid {
    position: absolute;
    inset: 0; bottom: 52px;
    background: var(--bg);
    z-index: 150;
    display: none;
    flex-direction: column;
  }
  #thumbGrid.show { display: flex; }

  .thumb-header {
    padding: 14px 16px;
    background: var(--toolbar-bg);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .thumb-title {
    color: white; font-size: 16px; font-weight: 700;
  }
  .thumb-close {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.2);
    border: none; border-radius: 50%;
    color: white; font-size: 18px;
    cursor: pointer;
  }

  .thumb-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    align-content: start;
    -webkit-overflow-scrolling: touch;
  }
  .thumb-item {
    aspect-ratio: 0.7;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    border: 3px solid transparent;
    transition: border-color 0.2s, box-shadow 0.2s;
    position: relative;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .thumb-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
  .thumb-item.current { border-color: var(--primary); box-shadow: 0 4px 16px rgba(0,137,123,0.3); }
  .thumb-item canvas { width: 100%; height: 100%; object-fit: cover; display: block; }
  .thumb-label {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 4px;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    color: white; text-align: center;
    font-size: 12px; font-weight: 700;
  }
  .thumb-surah {
    position: absolute;
    top: 4px; right: 4px;
    padding: 2px 6px;
    background: var(--primary);
    color: white; border-radius: 4px;
    font-size: 9px; font-weight: 700;
    max-width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ─── Page Jump Modal ─── */
  #pageJumpModal {
    position: absolute;
    inset: 0;
    background: var(--overlay);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 300;
  }
  #pageJumpModal.show { display: flex; }

  .jump-card {
    background: var(--sidebar-bg);
    border-radius: 16px;
    padding: 24px;
    width: 280px;
    max-width: 90vw;
    text-align: center;
  }
  .jump-title {
    color: var(--sidebar-text);
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  .jump-input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--sidebar-border);
    border-radius: 12px;
    font-size: 20px;
    text-align: center;
    font-weight: 600;
    background: var(--bg);
    color: var(--sidebar-text);
    outline: none;
    margin-bottom: 16px;
  }
  .jump-btn {
    width: 100%;
    padding: 12px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
  }

  /* ─── Audio Control Bar ─── */
  #audioControlBar {
    display: none;
    flex-direction: column;
    background: linear-gradient(135deg, rgba(27,94,32,0.97), rgba(0,137,123,0.97));
    flex-shrink: 0;
    overflow: hidden;
  }
  #audioControlBar.show { display: flex; }

  .audio-main {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    gap: 8px;
  }

  .audio-play-btn {
    width: 36px; height: 36px; min-width: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    border: 2px solid rgba(255,255,255,0.4);
    color: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .audio-play-btn:active { background: rgba(255,255,255,0.35); }
  .audio-play-btn svg { width: 18px; height: 18px; fill: white; }

  #verseTextBar {
    flex: 1;
    color: white;
    font-size: 20px;
    font-family: 'Traditional Arabic', 'Scheherazade New', -apple-system, serif;
    direction: rtl;
    text-align: right;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    padding: 2px 4px;
    scrollbar-width: none;
    line-height: 1.6;
  }
  #verseTextBar::-webkit-scrollbar { display: none; }

  .verse-word {
    display: inline;
    padding: 2px 2px;
    border-radius: 4px;
    transition: background 0.12s, color 0.12s;
    cursor: default;
  }
  .verse-word.active {
    background: rgba(76, 175, 80, 0.75);
    color: #ffffff;
    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    border-radius: 6px;
    padding: 2px 4px;
  }
  .verse-ref {
    font-size: 11px;
    opacity: 0.6;
    font-family: -apple-system, sans-serif;
    margin-left: 8px;
    direction: ltr;
  }

  .audio-close-btn {
    width: 28px; height: 28px; min-width: 28px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    border: none;
    color: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 14px;
    -webkit-tap-highlight-color: transparent;
  }
  .audio-close-btn:active { background: rgba(255,255,255,0.3); }

  #audioProgressLine {
    height: 3px;
    background: rgba(255,255,255,0.15);
  }
  #audioProgressFill {
    height: 100%;
    background: var(--accent);
    width: 0%;
    transition: width 0.15s linear;
  }

  @media (max-width: 500px) {
    .nav-arrow { width: 36px; height: 60px; border-radius: 8px; }
    .nav-arrow svg { width: 22px; height: 22px; }
    .nav-arrow.right { right: 2px; }
    .nav-arrow.left { left: 2px; }
    #surahSidebar { width: 100%; max-width: 100%; }
    #toolbar { padding: 0 2px; gap: 0; justify-content: space-evenly; }
    .tb-btn { width: 40px; height: 40px; min-width: 40px; }
    .tb-btn svg { width: 20px; height: 20px; }
    #pageCounter { font-size: 12px; min-width: 55px; padding: 0 4px; }
    .menu-item { padding: 12px 14px; font-size: 13px; }
    .share-item { padding: 12px 14px; font-size: 13px; }
    #moreMenu { min-width: 200px; }
    #shareMenu { min-width: 180px; }
  }
</style>
</head>
<body>

<div id="viewer">
  <div id="loadingOverlay">
    <div class="spinner"></div>
    <div class="loading-text">Chargement du Mushaf...</div>
    <div class="loading-sub" id="loadingPercent">0%</div>
  </div>

  <!-- RIGHT arrow: goes to LOWER page numbers (toward Al-Fatihah) => right-pointing chevron -->
  <button class="nav-arrow right" id="prevBtn" onclick="prevPage()">
    <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
  </button>

  <div id="canvasWrapper">
    <canvas id="pageCanvas"></canvas>
  </div>

  <!-- LEFT arrow: goes to HIGHER page numbers (toward An-Nas) => left-pointing chevron -->
  <button class="nav-arrow left" id="nextBtn" onclick="nextPage()">
    <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
  </button>

  <!-- Surah Sidebar -->
  <div id="surahSidebar">
    <div class="sidebar-header">
      <span class="sidebar-title">الفهارس</span>
      <button class="sidebar-close" onclick="toggleSidebar()">&#10005;</button>
    </div>
    <div class="sidebar-search">
      <input type="text" id="surahSearchInput" placeholder="Rechercher une sourate..." oninput="filterSurahs()">
    </div>
    <div class="surah-list" id="surahList"></div>
  </div>

  <!-- Thumbnail Grid (hidden - rendering issues) -->
  <div id="thumbGrid" style="display:none !important;"></div>

  <!-- Page Jump Modal -->
  <div id="pageJumpModal">
    <div class="jump-card">
      <div class="jump-title">Aller a la page</div>
      <input type="number" class="jump-input" id="jumpInput" min="1" placeholder="1 - 604">
      <button class="jump-btn" onclick="jumpToPage()">Aller</button>
    </div>
  </div>
</div>

<!-- Audio Control Bar (verse text + play/pause + progress) -->
<div id="audioControlBar">
  <div class="audio-main">
    <button class="audio-play-btn" onclick="togglePlayPause()" id="mainPlayBtn">
      <svg viewBox="0 0 24 24" id="playPauseIcon"><path d="M8 5v14l11-7z"/></svg>
    </button>
    <div id="verseTextBar"></div>
    <button class="audio-close-btn" onclick="stopAudio()">&#10005;</button>
  </div>
  <div id="audioProgressLine"><div id="audioProgressFill"></div></div>
</div>

<!-- Bottom Toolbar -->
<div id="toolbar">
  <div id="pageCounter" onclick="showPageJump()">1 / 604</div>

  <!-- TOC -->
  <button class="tb-btn" onclick="toggleSidebar()" title="Table of contents">
    <svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
  </button>

  <!-- Grid / Thumbnails (hidden - rendering issues) -->

  <!-- Zoom In -->
  <button class="tb-btn" onclick="zoomIn()" title="Zoom in">
    <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>
  </button>

  <!-- Zoom Out -->
  <button class="tb-btn" onclick="zoomOut()" title="Zoom out">
    <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/></svg>
  </button>

  <!-- Audio Play/Pause -->
  <button class="tb-btn" onclick="togglePlayPause()" id="toolbarPlayBtn" title="Lecture audio">
    <svg viewBox="0 0 24 24" id="toolbarPlayIcon"><path d="M8 5v14l11-7z"/></svg>
  </button>

  <!-- Share (native share on mobile, dropdown on web) -->
  <div id="shareMenuWrapper">
    <button class="tb-btn" onclick="handleShareBtn()" title="Share">
      <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
    </button>
    <div id="shareMenu">
      <div class="share-item" onclick="shareWhatsApp()">
        <svg viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        WhatsApp
      </div>
      <div class="share-item" onclick="shareFacebook()">
        <svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        Facebook
      </div>
      <div class="share-item" onclick="shareTwitter()">
        <svg viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        X (Twitter)
      </div>
      <div class="share-item" onclick="shareTelegram()">
        <svg viewBox="0 0 24 24" fill="#0088cc"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        Telegram
      </div>
      <div class="share-item" onclick="shareEmail()">
        <svg viewBox="0 0 24 24" fill="var(--primary)"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        Email
      </div>
      <div class="share-item" onclick="shareCopy()">
        <svg viewBox="0 0 24 24" fill="var(--primary)"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
        Copier le lien
      </div>
    </div>
  </div>

  <!-- More Options (with dropdown) -->
  <div id="moreMenuWrapper">
    <button class="tb-btn" onclick="toggleMoreMenu()" title="More">
      <svg viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
    </button>
    <div id="moreMenu">
      <div class="menu-item" onclick="downloadPdf()">
        <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        Telecharger le PDF
      </div>
      <div class="menu-item" onclick="goToFirst()">
        <svg viewBox="0 0 24 24"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"/></svg>
        Premiere page
      </div>
      <div class="menu-item" onclick="goToLast()">
        <svg viewBox="0 0 24 24"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"/></svg>
        Derniere page
      </div>
      <div class="menu-item" onclick="togglePlayPause(); closeMenus();">
        <svg viewBox="0 0 24 24" id="audioIcon"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        <span id="audioLabel">Lecture audio</span>
      </div>
    </div>
  </div>
</div>

<audio id="quranAudio" preload="none"></audio>

<script>
  // ─── State ───
  const PDF_URL = '${safePdfUrl}';
  const SURAHS = ${surahJson};
  let pdfDoc = null;
  let currentPage = ${initialPage};
  let totalPages = 604;
  let zoomLevel = 1.0;
  let rendering = false;
  let pendingPage = null;
  let audioEnabled = false;
  let audioPlaying = false;
  let pageVerses = [];
  let pageAudioFiles = [];
  let currentVerseIdx = 0;
  let verseSegments = [];
  let audioLoadedForPage = -1;
  let isAdvancingPage = false;

  const canvas = document.getElementById('pageCanvas');
  const ctx = canvas.getContext('2d');

  // ─── PDF Loading ───
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const loadingTask = pdfjsLib.getDocument({
    url: PDF_URL,
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true,
  });

  loadingTask.onProgress = function(progress) {
    if (progress.total > 0) {
      const pct = Math.round((progress.loaded / progress.total) * 100);
      document.getElementById('loadingPercent').textContent = pct + '%';
    }
  };

  loadingTask.promise.then(function(pdf) {
    pdfDoc = pdf;
    totalPages = pdf.numPages;
    document.getElementById('loadingOverlay').classList.add('hidden');
    renderPage(currentPage);
    buildSurahList();
    postMsg({ type: 'pdfLoaded', totalPages: totalPages });
  }).catch(function(err) {
    document.getElementById('loadingPercent').textContent = 'Erreur de chargement';
    console.error('PDF load error:', err);
  });

  // ─── Render Page ───
  function renderPage(num) {
    if (!pdfDoc) return;
    // If already rendering, queue it
    if (rendering) { pendingPage = num; return; }
    rendering = true;
    currentPage = num;

    pdfDoc.getPage(num).then(function(page) {
      const wrapper = document.getElementById('canvasWrapper');
      const vw = wrapper.clientWidth;
      const vh = wrapper.clientHeight;

      const unscaledViewport = page.getViewport({ scale: 1 });
      const fitScale = Math.min(vw / unscaledViewport.width, vh / unscaledViewport.height);
      const scale = fitScale * zoomLevel;
      const viewport = page.getViewport({ scale: scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = { canvasContext: ctx, viewport: viewport };
      page.render(renderContext).promise.then(function() {
        rendering = false;
        updateUI();
        // If another page was queued while rendering, render it now
        if (pendingPage !== null) {
          const next = pendingPage;
          pendingPage = null;
          renderPage(next);
        }
      });
    });
  }

  // ─── Navigation ───
  // prevPage = go to LOWER page number (right arrow, toward Al-Fatihah)
  function prevPage() {
    if (currentPage > 1) renderPage(currentPage - 1);
  }
  // nextPage = go to HIGHER page number (left arrow, toward An-Nas)
  function nextPage() {
    if (currentPage < totalPages) renderPage(currentPage + 1);
  }
  function goToPage(n) {
    const p = Math.max(1, Math.min(totalPages, n));
    renderPage(p);
  }
  function goToFirst() { goToPage(1); closeMenus(); }
  function goToLast() { goToPage(totalPages); closeMenus(); }

  // ─── Zoom ───
  function zoomIn() {
    if (zoomLevel < 3) {
      zoomLevel = Math.min(3, +(zoomLevel + 0.3).toFixed(1));
      renderPage(currentPage);
    }
  }
  function zoomOut() {
    if (zoomLevel > 0.5) {
      zoomLevel = Math.max(0.5, +(zoomLevel - 0.3).toFixed(1));
      renderPage(currentPage);
    }
  }

  // ─── Swipe / Touch + Pinch-to-Zoom ───
  let touchStartX = 0;
  let touchStartY = 0;
  let isPinching = false;
  let pinchStartDist = 0;
  let pinchStartZoom = 1;

  function getTouchDist(touches) {
    var dx = touches[0].clientX - touches[1].clientX;
    var dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  var viewer = document.getElementById('viewer');

  viewer.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      // Pinch-to-zoom start
      isPinching = true;
      pinchStartDist = getTouchDist(e.touches);
      pinchStartZoom = zoomLevel;
      e.preventDefault();
    } else if (e.touches.length === 1) {
      isPinching = false;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: false });

  viewer.addEventListener('touchmove', function(e) {
    if (isPinching && e.touches.length === 2) {
      e.preventDefault();
      var dist = getTouchDist(e.touches);
      var scale = dist / pinchStartDist;
      var newZoom = Math.max(0.5, Math.min(3, +(pinchStartZoom * scale).toFixed(1)));
      if (Math.abs(newZoom - zoomLevel) >= 0.1) {
        zoomLevel = newZoom;
        renderPage(currentPage);
      }
    }
  }, { passive: false });

  viewer.addEventListener('touchend', function(e) {
    if (isPinching) {
      isPinching = false;
      return;
    }
    if (e.changedTouches.length === 1 && e.touches.length === 0) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        // RTL layout: swipe left = next (higher page), swipe right = prev (lower page)
        if (dx < 0) nextPage();
        else prevPage();
      }
    }
  }, { passive: true });

  // Mouse drag for web
  let mouseDown = false;
  let mouseStartX = 0;
  viewer.addEventListener('mousedown', function(e) {
    mouseDown = true;
    mouseStartX = e.clientX;
  });
  document.addEventListener('mouseup', function(e) {
    if (!mouseDown) return;
    mouseDown = false;
    var dx = e.clientX - mouseStartX;
    if (Math.abs(dx) > 60) {
      if (dx < 0) nextPage();
      else prevPage();
    }
  });

  // Keyboard
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') nextPage();
    else if (e.key === 'ArrowRight') prevPage();
    else if (e.key === '+' || e.key === '=') zoomIn();
    else if (e.key === '-') zoomOut();
    else if (e.key === 'Escape') closeMenus();
  });

  // ─── UI Updates ───
  function updateUI() {
    document.getElementById('pageCounter').textContent = currentPage + ' / ' + totalPages;
    document.getElementById('prevBtn').classList.toggle('disabled', currentPage <= 1);
    document.getElementById('nextBtn').classList.toggle('disabled', currentPage >= totalPages);

    // Highlight current surah in sidebar
    document.querySelectorAll('.surah-item').forEach(function(el) {
      el.classList.remove('current');
    });
    const curSurah = getSurahForPage(currentPage);
    const curEl = document.getElementById('surah-' + curSurah.number);
    if (curEl) curEl.classList.add('current');

    postMsg({ type: 'pageChange', page: currentPage });

    // Sync audio with page change (only for manual page navigation, not auto-advance)
    if (audioPlaying && !isAdvancingPage && audioLoadedForPage !== currentPage) {
      currentVerseIdx = 0;
      loadPageAudio(currentPage).then(function() {
        if (audioPlaying) playCurrentVerse();
      });
    }
  }

  function getSurahForPage(page) {
    for (let i = SURAHS.length - 1; i >= 0; i--) {
      if (page >= SURAHS[i].startPage) return SURAHS[i];
    }
    return SURAHS[0];
  }

  // ─── Surah Sidebar ───
  function buildSurahList() {
    const list = document.getElementById('surahList');
    list.innerHTML = '';
    SURAHS.forEach(function(s) {
      const div = document.createElement('div');
      div.className = 'surah-item';
      div.id = 'surah-' + s.number;
      div.innerHTML =
        '<div class="surah-num">' + s.number + '</div>' +
        '<div class="surah-info">' +
          '<div class="surah-name-latin">' + s.name + '</div>' +
          '<div class="surah-page">Page ' + s.startPage + '</div>' +
        '</div>' +
        '<div class="surah-arabic">' + s.arabicName + '</div>';
      div.onclick = function() { goToPage(s.startPage); toggleSidebar(); };
      list.appendChild(div);
    });
  }

  function filterSurahs() {
    const q = document.getElementById('surahSearchInput').value.toLowerCase();
    document.querySelectorAll('.surah-item').forEach(function(el) {
      const text = el.textContent.toLowerCase();
      el.style.display = text.includes(q) ? 'flex' : 'none';
    });
  }

  function toggleSidebar() {
    const sb = document.getElementById('surahSidebar');
    sb.classList.toggle('show');
    closeMenus('sidebar');
  }

  // ─── Thumbnails ───
  let thumbsLoaded = false;
  function toggleThumbs() {
    const grid = document.getElementById('thumbGrid');
    grid.classList.toggle('show');
    closeMenus('thumbs');
    if (!thumbsLoaded && grid.classList.contains('show')) {
      loadThumbnails();
      thumbsLoaded = true;
    }
    // Scroll to current page
    if (grid.classList.contains('show')) {
      setTimeout(function() {
        const cur = document.getElementById('thumb-' + currentPage);
        if (cur) cur.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 100);
    }
  }

  function loadThumbnails() {
    const container = document.getElementById('thumbContainer');
    container.innerHTML = '';

    for (let p = 1; p <= totalPages; p++) {
      const div = document.createElement('div');
      div.className = 'thumb-item' + (p === currentPage ? ' current' : '');
      div.id = 'thumb-' + p;

      // Add surah label for pages that start a surah
      const surahOnPage = SURAHS.find(function(s) { return s.startPage === p; });
      if (surahOnPage) {
        const surahTag = document.createElement('div');
        surahTag.className = 'thumb-surah';
        surahTag.textContent = surahOnPage.arabicName;
        div.appendChild(surahTag);
      }

      const thumbCanvas = document.createElement('canvas');
      div.appendChild(thumbCanvas);

      const label = document.createElement('div');
      label.className = 'thumb-label';
      label.textContent = p;
      div.appendChild(label);

      (function(pageNum) {
        div.onclick = function() { goToPage(pageNum); toggleThumbs(); };
      })(p);

      container.appendChild(div);

      // Lazy-load thumbnail rendering with IntersectionObserver
      (function(pageNum, tc) {
        const observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting && pdfDoc) {
              observer.unobserve(entry.target);
              pdfDoc.getPage(pageNum).then(function(page) {
                const vp = page.getViewport({ scale: 0.25 });
                tc.width = vp.width;
                tc.height = vp.height;
                page.render({ canvasContext: tc.getContext('2d'), viewport: vp });
              });
            }
          });
        }, { rootMargin: '200px' });
        observer.observe(div);
      })(p, thumbCanvas);
    }
  }

  // ─── Page Jump ───
  function showPageJump() {
    document.getElementById('pageJumpModal').classList.add('show');
    const inp = document.getElementById('jumpInput');
    inp.value = currentPage;
    inp.max = totalPages;
    inp.focus();
    inp.select();
    closeMenus('jump');
  }

  function jumpToPage() {
    const val = parseInt(document.getElementById('jumpInput').value);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      goToPage(val);
    }
    document.getElementById('pageJumpModal').classList.remove('show');
  }

  document.getElementById('jumpInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') jumpToPage();
    if (e.key === 'Escape') document.getElementById('pageJumpModal').classList.remove('show');
  });

  document.getElementById('pageJumpModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('show');
  });

  // ─── More Menu ───
  function toggleMoreMenu() {
    document.getElementById('moreMenu').classList.toggle('show');
    document.getElementById('shareMenu').classList.remove('show');
  }

  // ─── Share Menu ───
  function handleShareBtn() {
    if (isEmbedded) {
      // In native WebView or iframe: delegate to React Native ShareModal
      nativeShare();
    } else if (navigator.share) {
      // Standalone mobile web browser
      var surah = getSurahForPage(currentPage);
      navigator.share({
        title: 'Le Saint Coran - ' + surah.arabicName,
        text: getShareText(),
      }).catch(function() {});
      closeMenus();
    } else {
      // Standalone desktop web: show dropdown
      toggleShareMenu();
    }
  }

  function toggleShareMenu() {
    document.getElementById('shareMenu').classList.toggle('show');
    document.getElementById('moreMenu').classList.remove('show');
  }

  var isNativeApp = !!window.ReactNativeWebView;
  var isEmbedded = isNativeApp || (window.parent !== window);

  function getShareText() {
    var surah = getSurahForPage(currentPage);
    return 'Le Saint Coran - ' + surah.arabicName + ' (' + surah.name + ') - Page ' + currentPage + '\\n' + PDF_URL;
  }

  // Native app: use React Native Share API via postMessage
  function nativeShare() {
    var surah = getSurahForPage(currentPage);
    postMsg({ type: 'showShareModal', page: currentPage, surah: surah, text: getShareText() });
    closeMenus();
  }

  function shareWhatsApp() {
    if (isEmbedded) { nativeShare(); return; }
    window.open('https://wa.me/?text=' + encodeURIComponent(getShareText()), '_blank');
    closeMenus();
  }
  function shareFacebook() {
    if (isEmbedded) { nativeShare(); return; }
    window.open('https://www.facebook.com/sharer/sharer.php?quote=' + encodeURIComponent(getShareText()), '_blank');
    closeMenus();
  }
  function shareTwitter() {
    if (isEmbedded) { nativeShare(); return; }
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(getShareText()), '_blank');
    closeMenus();
  }
  function shareTelegram() {
    if (isEmbedded) { nativeShare(); return; }
    window.open('https://t.me/share/url?url=' + encodeURIComponent(PDF_URL) + '&text=' + encodeURIComponent(getShareText()), '_blank');
    closeMenus();
  }
  function shareEmail() {
    if (isEmbedded) { nativeShare(); return; }
    var surah = getSurahForPage(currentPage);
    var subject = encodeURIComponent('Le Saint Coran - ' + surah.arabicName);
    var body = encodeURIComponent(getShareText());
    window.open('mailto:?subject=' + subject + '&body=' + body, '_blank');
    closeMenus();
  }
  function shareCopy() {
    var text = getShareText();
    if (isEmbedded) {
      postMsg({ type: 'copy', text: text });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        showToast('Lien copie !');
      });
    }
    closeMenus();
  }

  // In-page toast instead of alert (better mobile UX)
  function showToast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:10px 20px;border-radius:20px;font-size:14px;z-index:9999;pointer-events:none;transition:opacity 0.3s;';
    document.body.appendChild(t);
    setTimeout(function() { t.style.opacity = '0'; }, 1500);
    setTimeout(function() { t.remove(); }, 2000);
  }

  // ─── Audio (Page-synced, verse-by-verse with word highlighting) ───
  const audioEl = document.getElementById('quranAudio');
  const AUDIO_BASE = 'https://verses.quran.com/';
  const RECITER_ID = 7; // Mishari Rashid Al-Afasy

  async function loadPageAudio(page) {
    if (audioLoadedForPage === page && pageAudioFiles.length > 0) return;
    try {
      // Fetch verses with words for text display
      var vRes = await fetch('https://api.quran.com/api/v4/verses/by_page/' + page + '?language=ar&words=true&word_fields=text_uthmani&per_page=50');
      var vData = await vRes.json();
      pageVerses = (vData.verses || []).map(function(v) {
        return {
          key: v.verse_key,
          text: v.text_uthmani,
          words: (v.words || []).filter(function(w) { return w.char_type_name === 'word'; })
        };
      });
      // Fetch audio files with timing segments
      var aRes = await fetch('https://api.quran.com/api/v4/recitations/' + RECITER_ID + '/by_page/' + page);
      var aData = await aRes.json();
      pageAudioFiles = (aData.audio_files || []).map(function(af) {
        return {
          key: af.verse_key,
          url: af.url.startsWith('http') ? af.url : AUDIO_BASE + af.url,
          segments: af.segments || []
        };
      });
      audioLoadedForPage = page;
    } catch(e) {
      console.error('Failed to load page audio:', e);
      pageVerses = [];
      pageAudioFiles = [];
    }
  }

  function togglePlayPause() {
    if (audioPlaying) {
      pausePageAudio();
    } else {
      startPageAudio();
    }
  }

  async function startPageAudio() {
    audioPlaying = true;
    audioEnabled = true;
    updatePlayPauseIcons();
    document.getElementById('audioControlBar').classList.add('show');
    document.getElementById('audioLabel').textContent = 'Mettre en pause';
    await loadPageAudio(currentPage);
    if (pageAudioFiles.length > 0) {
      playCurrentVerse();
    }
  }

  function pausePageAudio() {
    audioPlaying = false;
    audioEl.pause();
    updatePlayPauseIcons();
    document.getElementById('audioLabel').textContent = 'Reprendre la lecture';
  }

  function stopAudio() {
    audioPlaying = false;
    audioEnabled = false;
    audioEl.pause();
    audioEl.removeAttribute('src');
    audioEl.load();
    currentVerseIdx = 0;
    verseSegments = [];
    document.getElementById('audioControlBar').classList.remove('show');
    document.getElementById('verseTextBar').innerHTML = '';
    document.getElementById('audioProgressFill').style.width = '0%';
    document.getElementById('audioLabel').textContent = 'Lecture audio';
    updatePlayPauseIcons();
  }

  async function advanceToNextPage() {
    if (!audioPlaying || isAdvancingPage) return;
    if (currentPage >= totalPages) {
      stopAudio();
      return;
    }
    isAdvancingPage = true;
    // Pause audio to prevent stale ended events during transition
    audioEl.pause();
    var newPage = currentPage + 1;
    currentVerseIdx = 0;
    // Flip the page visually
    renderPage(newPage);
    // Load audio for the new page and continue playing
    try {
      await loadPageAudio(newPage);
      isAdvancingPage = false;
      if (audioPlaying) playCurrentVerse();
    } catch(e) {
      isAdvancingPage = false;
    }
  }

  function playCurrentVerse() {
    if (!audioPlaying) return;
    if (currentVerseIdx >= pageAudioFiles.length) {
      // All verses on this page done — advance to next page
      advanceToNextPage();
      return;
    }
    var af = pageAudioFiles[currentVerseIdx];
    audioEl.src = af.url;
    audioEl.play().catch(function(e) { console.error('Play error:', e); });
    verseSegments = af.segments;
    updateVerseTextDisplay();
    document.getElementById('audioProgressFill').style.width = '0%';
  }

  function updateVerseTextDisplay() {
    var bar = document.getElementById('verseTextBar');
    if (currentVerseIdx < pageVerses.length) {
      var v = pageVerses[currentVerseIdx];
      var words = v.words || [];
      var html = '';
      html += words.map(function(w, i) {
        return '<span class="verse-word" data-idx="' + i + '">' + (w.text_uthmani || '') + '</span>';
      }).join(' ');
      html += ' <span class="verse-ref">(' + v.key + ')</span>';
      bar.innerHTML = html;
    } else if (currentVerseIdx < pageAudioFiles.length) {
      bar.innerHTML = '<span class="verse-ref">' + pageAudioFiles[currentVerseIdx].key + '</span>';
    }
  }

  function highlightWord(idx) {
    document.querySelectorAll('.verse-word.active').forEach(function(el) {
      el.classList.remove('active');
    });
    var el = document.querySelector('.verse-word[data-idx="' + idx + '"]');
    if (el) {
      el.classList.add('active');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  function updatePlayPauseIcons() {
    var playPath = 'M8 5v14l11-7z';
    var pausePath = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z';
    var path = audioPlaying ? pausePath : playPath;
    var icon1 = document.getElementById('playPauseIcon');
    var icon2 = document.getElementById('toolbarPlayIcon');
    if (icon1) icon1.innerHTML = '<path d="' + path + '"/>';
    if (icon2) icon2.innerHTML = '<path d="' + path + '"/>';
    var tbBtn = document.getElementById('toolbarPlayBtn');
    if (tbBtn) tbBtn.classList.toggle('active', audioPlaying);
  }

  // Audio time update: progress bar + word highlighting
  audioEl.addEventListener('timeupdate', function() {
    if (!audioPlaying) return;
    // Update progress bar
    if (audioEl.duration) {
      var pct = (audioEl.currentTime / audioEl.duration) * 100;
      document.getElementById('audioProgressFill').style.width = pct + '%';
    }
    // Word highlighting from segments
    if (verseSegments && verseSegments.length > 0) {
      var currentMs = audioEl.currentTime * 1000;
      for (var i = 0; i < verseSegments.length; i++) {
        var seg = verseSegments[i];
        if (!Array.isArray(seg) || seg.length < 3) continue;
        // Segments format: [word_position, timestamp_from, timestamp_to, ...]
        // or: [timestamp_from, timestamp_to, word_position]
        var startMs, endMs, wordIdx;
        if (seg[0] < 200 && seg[1] >= 100) {
          // Format: [word_pos, start, end, ...]
          wordIdx = seg[0] - 1;
          startMs = seg[1];
          endMs = seg[2];
        } else {
          // Format: [start, end, word_pos] or sequential
          startMs = seg[0];
          endMs = seg[1];
          wordIdx = i;
        }
        if (currentMs >= startMs && currentMs < endMs) {
          highlightWord(wordIdx);
          break;
        }
      }
    }
  });

  // When a verse ends, play the next one
  audioEl.addEventListener('ended', function() {
    if (!audioPlaying || isAdvancingPage) return;
    currentVerseIdx++;
    if (currentVerseIdx < pageAudioFiles.length) {
      playCurrentVerse();
    } else {
      // Page complete — flip to next page
      advanceToNextPage();
    }
  });

  // ─── Download ───
  function downloadPdf() {
    if (isNativeApp) {
      postMsg({ type: 'download', url: PDF_URL });
    } else {
      window.open(PDF_URL, '_blank');
    }
    closeMenus();
  }

  // ─── Helpers ───
  function closeMenus(except) {
    if (except !== 'sidebar') document.getElementById('surahSidebar').classList.remove('show');
    if (except !== 'thumbs') document.getElementById('thumbGrid').classList.remove('show');
    if (except !== 'jump') document.getElementById('pageJumpModal').classList.remove('show');
    document.getElementById('moreMenu').classList.remove('show');
    document.getElementById('shareMenu').classList.remove('show');
  }

  // Close menus when clicking outside
  document.addEventListener('click', function(e) {
    var moreWrapper = document.getElementById('moreMenuWrapper');
    var shareWrapper = document.getElementById('shareMenuWrapper');
    if (!moreWrapper.contains(e.target)) {
      document.getElementById('moreMenu').classList.remove('show');
    }
    if (!shareWrapper.contains(e.target)) {
      document.getElementById('shareMenu').classList.remove('show');
    }
  });

  function postMsg(data) {
    try {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      } else if (window.parent !== window) {
        window.parent.postMessage(JSON.stringify(data), '*');
      }
    } catch(e) {}
  }

  // Listen for messages from React Native
  window.addEventListener('message', function(e) {
    try {
      const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (msg.type === 'goToPage') goToPage(msg.page);
      if (msg.type === 'setDarkMode') {
        document.documentElement.style.setProperty('--bg', msg.dark ? '#0a0a0a' : '#f5f0e8');
        document.documentElement.style.setProperty('--toolbar-bg', msg.dark ? '#1a1a2e' : '#1b5e20');
        document.documentElement.style.setProperty('--sidebar-bg', msg.dark ? '#1e1e2d' : '#ffffff');
        document.documentElement.style.setProperty('--sidebar-text', msg.dark ? '#ffffff' : '#1a1a2e');
        document.documentElement.style.setProperty('--sidebar-secondary', msg.dark ? '#a0a0b0' : '#6c757d');
        document.documentElement.style.setProperty('--sidebar-border', msg.dark ? '#2d2d44' : '#e0e0e0');
        document.documentElement.style.setProperty('--sidebar-hover', msg.dark ? '#2d2d44' : '#e8f5e9');
      }
    } catch(ex) {}
  });

  document.addEventListener('message', function(e) {
    try {
      const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (msg.type === 'goToPage') goToPage(msg.page);
    } catch(ex) {}
  });

  // Resize handler
  window.addEventListener('resize', function() {
    if (pdfDoc) renderPage(currentPage);
  });
</script>
</body>
</html>`;
}
