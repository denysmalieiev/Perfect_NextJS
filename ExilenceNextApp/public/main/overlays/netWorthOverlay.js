const isDev = require('electron-is-dev');
const path = require('path');
const { ipcMain, BrowserWindow } = require('electron');
const windowStateKeeper = require('electron-window-state');

let netWorthOverlayWindow = null;

function createOverlay() {
  if (netWorthOverlayWindow !== undefined && netWorthOverlayWindow !== null) {
    netWorthOverlayWindow.destroy();
  }

  const overlayState = windowStateKeeper({
    defaultWidth: 255,
    defaultHeight: 92,
    file: 'netWorthOverlay'
  });

  netWorthOverlayWindow = new BrowserWindow({
    x: overlayState.x,
    y: overlayState.y,
    height: overlayState.height,
    width: overlayState.width,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    frame: false,
    webPreferences: { webSecurity: false, nodeIntegration: true },
    resizable: false,
  });

  overlayState.manage(netWorthOverlayWindow);

  netWorthOverlayWindow.loadURL(
    isDev
      ? `file://${path.join(__dirname, `../../../public/main/overlays/netWorth.html`)}`
      : `file://${path.join(__dirname, `../../../build/main/overlays/netWorth.html`)}`
  );

  netWorthOverlayWindow.setAlwaysOnTop(true, 'screen-saver');

  netWorthOverlayWindow.on('closed', () => {
    netWorthOverlayWindow = null;
  });
}

function destroyNetWorthOverlayWindow() {
  if (netWorthOverlayWindow !== undefined && netWorthOverlayWindow !== null) {
    netWorthOverlayWindow.destroy();
  }
}

function createNetWorthOverlay() {
  ipcMain.on('createOverlay', (_event, data) => {
    createOverlay();

    netWorthOverlayWindow.once('ready-to-show', () => {
      netWorthOverlayWindow.show();
      netWorthOverlayWindow.webContents.send('overlayUpdate', data);
    });
  });

  ipcMain.on('overlayUpdate', (_event, args) => {
    if (netWorthOverlayWindow && !netWorthOverlayWindow.isDestroyed()) {
      netWorthOverlayWindow.webContents.send('overlayUpdate', args);
    }
  });
}

module.exports = {
  createOverlay,
  destroyNetWorthOverlayWindow,
  createNetWorthOverlay,
};
