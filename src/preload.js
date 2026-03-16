const { contextBridge, ipcRenderer } = require('electron');

// ══════════════════════════════════════════════════
// SECURE API BRIDGE
// Exposes a controlled API to the renderer process
// ══════════════════════════════════════════════════
contextBridge.exposeInMainWorld('electronAPI', {

  // ── File Operations ──
  saveFile: (filePath, content, encoding) => ipcRenderer.invoke('save-file', { filePath, content, encoding }),
  saveFileAs: (defaultName, content, encoding) => ipcRenderer.invoke('save-file-as', { defaultName, content, encoding }),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  getFileInfo: (filePath) => ipcRenderer.invoke('get-file-info', filePath),
  readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
  revealInExplorer: (filePath) => ipcRenderer.invoke('reveal-in-explorer', filePath),

  // ── Window ──
  setTitle: (title) => ipcRenderer.send('set-title', title),

  // ── Menu Events (main → renderer) ──
  onOpenFile: (callback) => ipcRenderer.on('open-file', (_, data) => callback(data)),
  onOpenFolder: (callback) => ipcRenderer.on('open-folder', (_, data) => callback(data)),
  onMenuNewFile: (callback) => ipcRenderer.on('menu-new-file', () => callback()),
  onMenuSave: (callback) => ipcRenderer.on('menu-save', () => callback()),
  onMenuSaveAs: (callback) => ipcRenderer.on('menu-save-as', () => callback()),
  onMenuCloseTab: (callback) => ipcRenderer.on('menu-close-tab', () => callback()),
  onMenuFind: (callback) => ipcRenderer.on('menu-find', () => callback()),
  onMenuReplace: (callback) => ipcRenderer.on('menu-replace', () => callback()),
  onMenuGotoLine: (callback) => ipcRenderer.on('menu-goto-line', () => callback()),
  onMenuCommandPalette: (callback) => ipcRenderer.on('menu-command-palette', () => callback()),
  onMenuToggleWordwrap: (callback) => ipcRenderer.on('menu-toggle-wordwrap', () => callback()),
  onMenuToggleMinimap: (callback) => ipcRenderer.on('menu-toggle-minimap', () => callback()),
  onMenuZoomIn: (callback) => ipcRenderer.on('menu-zoom-in', () => callback()),
  onMenuZoomOut: (callback) => ipcRenderer.on('menu-zoom-out', () => callback()),
  onMenuZoomReset: (callback) => ipcRenderer.on('menu-zoom-reset', () => callback()),

  // Analyze menu
  onMenuInspect: (callback) => ipcRenderer.on('menu-inspect', () => callback()),
  onMenuHex: (callback) => ipcRenderer.on('menu-hex', () => callback()),
  onMenuScan: (callback) => ipcRenderer.on('menu-scan', () => callback()),
  onMenuEncoding: (callback) => ipcRenderer.on('menu-encoding', () => callback()),
  onMenuScratch: (callback) => ipcRenderer.on('menu-scratch', () => callback()),

  // ── Updates ──
  checkForUpdates: () => ipcRenderer.invoke('update-check'),
  downloadUpdate: () => ipcRenderer.invoke('update-download'),
  installUpdate: () => ipcRenderer.invoke('update-install'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkLocalUpdates: () => ipcRenderer.invoke('update-check-local'),
  installLocalUpdate: (path) => ipcRenderer.invoke('update-install-local', path),
  openLocalUpdatesFolder: () => ipcRenderer.invoke('update-open-local-folder'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (_, data) => callback(data)),
  onMenuCheckUpdates: (callback) => ipcRenderer.on('menu-check-updates', () => callback()),

  // ── Platform info ──
  platform: process.platform,
  isElectron: true
});
