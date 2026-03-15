const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// ══════════════════════════════════════════════════
// WINDOW MANAGEMENT
// ══════════════════════════════════════════════════
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    backgroundColor: '#1a1b26',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#16171f',
      symbolColor: '#787c99',
      height: 38
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false, // show when ready to avoid flash
    icon: path.join(__dirname, 'icon.ico')
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));


  // Smooth show
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open links externally
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Pass CLI arguments (files to open) to renderer
  const filesToOpen = process.argv.slice(app.isPackaged ? 1 : 2).filter(f => {
    try { return fs.statSync(f).isFile(); } catch { return false; }
  });
  if (filesToOpen.length > 0) {
    mainWindow.webContents.once('did-finish-load', () => {
      filesToOpen.forEach(f => {
        const absPath = path.resolve(f);
        const content = fs.readFileSync(absPath, 'utf-8');
        mainWindow.webContents.send('open-file', { path: absPath, name: path.basename(absPath), content });
      });
    });
  }

  buildMenu();
}

// ══════════════════════════════════════════════════
// APPLICATION MENU
// ══════════════════════════════════════════════════
function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New File', accelerator: 'CmdOrCtrl+N', click: () => send('menu-new-file') },
        { label: 'Open File...', accelerator: 'CmdOrCtrl+O', click: openFileDialog },
        { label: 'Open Folder...', click: openFolderDialog },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => send('menu-save') },
        { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: () => send('menu-save-as') },
        { type: 'separator' },
        { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => send('menu-close-tab') },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', click: () => send('menu-undo') },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', click: () => send('menu-redo') },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        { label: 'Find', accelerator: 'CmdOrCtrl+F', click: () => send('menu-find') },
        { label: 'Find & Replace', accelerator: 'CmdOrCtrl+H', click: () => send('menu-replace') },
        { label: 'Go to Line...', accelerator: 'CmdOrCtrl+G', click: () => send('menu-goto-line') },
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Command Palette', accelerator: 'CmdOrCtrl+Shift+P', click: () => send('menu-command-palette') },
        { type: 'separator' },
        { label: 'Toggle Word Wrap', click: () => send('menu-toggle-wordwrap') },
        { label: 'Toggle Minimap', click: () => send('menu-toggle-minimap') },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', click: () => send('menu-zoom-in') },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => send('menu-zoom-out') },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => send('menu-zoom-reset') },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Analyze',
      submenu: [
        { label: 'Inspect File', accelerator: 'CmdOrCtrl+I', click: () => send('menu-inspect') },
        { label: 'Hex View', click: () => send('menu-hex') },
        { label: 'Security Scan', accelerator: 'CmdOrCtrl+Shift+I', click: () => send('menu-scan') },
        { type: 'separator' },
        { label: 'Encoding Converter', click: () => send('menu-encoding') },
        { label: 'Scratch Pad / Notes', click: () => send('menu-scratch') },
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: `CamPad v${app.getVersion()}`, enabled: false },
        { type: 'separator' },
        { label: 'Check for Updates...', click: () => send('menu-check-updates') },
        { label: 'Open Local Patches Folder...', click: () => {
          if (!fs.existsSync(localUpdateDir)) fs.mkdirSync(localUpdateDir, { recursive: true });
          shell.openPath(localUpdateDir);
        }},
        { type: 'separator' },
        { label: 'About', click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'About CamPad',
            message: 'CamPad',
            detail: `Version ${app.getVersion()}\nA fast, modern text editor.\nBuilt by Camjo AB`
          });
        }}
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function send(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

// ══════════════════════════════════════════════════
// FILE DIALOGS (native)
// ══════════════════════════════════════════════════
async function openFileDialog() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Text Files', extensions: ['txt', 'md', 'log', 'csv', 'tsv'] },
      { name: 'Code Files', extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'json', 'xml', 'sql', 'php'] },
    ]
  });

  if (!result.canceled) {
    result.filePaths.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        send('open-file', { path: filePath, name: path.basename(filePath), content });
      } catch (err) {
        dialog.showErrorBox('Error', `Could not read file:\n${err.message}`);
      }
    });
  }
}

async function openFolderDialog() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled) {
    send('open-folder', result.filePaths[0]);
  }
}

// ══════════════════════════════════════════════════
// IPC HANDLERS (renderer → main)
// ══════════════════════════════════════════════════

// Save file to disk
ipcMain.handle('save-file', async (event, { filePath, content }) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Save As dialog
ipcMain.handle('save-file-as', async (event, { defaultName, content }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Text Files', extensions: ['txt', 'md', 'log'] },
      { name: 'Code Files', extensions: ['js', 'ts', 'py', 'html', 'css', 'json'] },
    ]
  });

  if (result.canceled) return { success: false, canceled: true };

  try {
    fs.writeFileSync(result.filePath, content, 'utf-8');
    return { success: true, path: result.filePath, name: path.basename(result.filePath) };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Read file
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content, name: path.basename(filePath), path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Get file info
ipcMain.handle('get-file-info', async (event, filePath) => {
  try {
    const stat = fs.statSync(filePath);
    return { success: true, size: stat.size, modified: stat.mtime.toISOString() };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Read directory
ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return {
      success: true,
      entries: entries.map(e => ({
        name: e.name,
        isDirectory: e.isDirectory(),
        path: path.join(dirPath, e.name)
      })).sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Set window title
ipcMain.on('set-title', (event, title) => {
  if (mainWindow) mainWindow.setTitle(title);
});

// ══════════════════════════════════════════════════
// UPDATE SYSTEM
// ══════════════════════════════════════════════════

// Security: never auto-install — user must approve
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

// Local patch folder: place update files here as alternative to GitHub
const localUpdateDir = path.join(app.getPath('userData'), 'local-updates');

function setupAutoUpdater() {
  autoUpdater.on('checking-for-update', () => {
    send('update-status', { status: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    send('update-status', {
      status: 'available',
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes || ''
    });
  });

  autoUpdater.on('update-not-available', () => {
    send('update-status', { status: 'up-to-date', version: app.getVersion() });
  });

  autoUpdater.on('download-progress', (progress) => {
    send('update-status', {
      status: 'downloading',
      percent: Math.round(progress.percent),
      transferred: progress.transferred,
      total: progress.total
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    send('update-status', {
      status: 'ready',
      version: info.version,
      releaseNotes: info.releaseNotes || ''
    });
  });

  autoUpdater.on('error', (err) => {
    send('update-status', { status: 'error', message: err.message });
  });
}

// IPC: Check for updates (GitHub Releases)
ipcMain.handle('update-check', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, version: result?.updateInfo?.version };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC: Download the available update
ipcMain.handle('update-download', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC: User approved — install and restart
ipcMain.handle('update-install', async () => {
  autoUpdater.quitAndInstall(false, true);
  return { success: true };
});

// IPC: Get current version
ipcMain.handle('get-app-version', async () => {
  return app.getVersion();
});

// IPC: Check local patch folder for manually placed update files
ipcMain.handle('update-check-local', async () => {
  try {
    if (!fs.existsSync(localUpdateDir)) {
      fs.mkdirSync(localUpdateDir, { recursive: true });
      return { success: true, hasUpdate: false, path: localUpdateDir };
    }
    const files = fs.readdirSync(localUpdateDir);
    const installer = files.find(f => f.endsWith('.exe') && f.includes('CamPad'));
    const ymlFile = files.find(f => f === 'latest.yml');
    if (installer && ymlFile) {
      const ymlContent = fs.readFileSync(path.join(localUpdateDir, ymlFile), 'utf-8');
      const versionMatch = ymlContent.match(/version:\s*(.+)/);
      const version = versionMatch ? versionMatch[1].trim() : 'unknown';
      return {
        success: true,
        hasUpdate: true,
        version,
        installerPath: path.join(localUpdateDir, installer),
        path: localUpdateDir
      };
    }
    return { success: true, hasUpdate: false, path: localUpdateDir };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC: Install from local patch file (user-approved only)
ipcMain.handle('update-install-local', async (event, installerPath) => {
  try {
    if (!installerPath || !fs.existsSync(installerPath)) {
      return { success: false, error: 'Installer not found' };
    }
    // Security: only allow .exe from our local-updates folder
    const resolved = path.resolve(installerPath);
    if (!resolved.startsWith(path.resolve(localUpdateDir))) {
      return { success: false, error: 'Security: installer must be in local-updates folder' };
    }
    shell.openPath(resolved);
    setTimeout(() => app.quit(), 1000);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC: Open the local updates folder in Explorer
ipcMain.handle('update-open-local-folder', async () => {
  if (!fs.existsSync(localUpdateDir)) {
    fs.mkdirSync(localUpdateDir, { recursive: true });
  }
  shell.openPath(localUpdateDir);
  return { success: true, path: localUpdateDir };
});

// ══════════════════════════════════════════════════
// APP LIFECYCLE
// ══════════════════════════════════════════════════
app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();

  // Check for updates 3 seconds after launch (non-intrusive)
  if (app.isPackaged) {
    setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 3000);
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Handle file open from OS (double-click .txt etc.)
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (mainWindow) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      send('open-file', { path: filePath, name: path.basename(filePath), content });
    } catch (err) { /* ignore */ }
  }
});

// Second instance: focus window and open files
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      // Open files from second instance
      const files = commandLine.slice(1).filter(f => {
        try { return fs.statSync(f).isFile(); } catch { return false; }
      });
      files.forEach(f => {
        const absPath = path.resolve(f);
        const content = fs.readFileSync(absPath, 'utf-8');
        send('open-file', { path: absPath, name: path.basename(absPath), content });
      });
    }
  });
}
