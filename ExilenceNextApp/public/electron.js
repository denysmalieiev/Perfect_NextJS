const electron = require('electron');
const ipcMain = require('electron').ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const sentry = require('@sentry/electron');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const windowStateKeeper = require('electron-window-state');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let shouldNotify = true;

if (!isDev) {
  sentry.init({
    dsn: 'https://123362e387b749feaf8f98a2cce30fdf@sentry.io/1852797'
  });
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = isDev;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

let mainWindow;

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}

ipcMain.on('checkForUpdates', function(event) {
  if (shouldNotify) {
    autoUpdater.checkForUpdatesAndNotify();
  } else {
    autoUpdater.checkForUpdates();
  }
});

ipcMain.on('notify', function(event) {
  mainWindow.flashFrame(true);
});

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', info => {
  sendStatusToWindow('Update available.');
});
autoUpdater.on('update-not-available', info => {
  sendStatusToWindow('Update not available.');
});
autoUpdater.on('error', err => {
  sendStatusToWindow('Error in auto-updater. ' + err);
});
autoUpdater.on('download-progress', progressObj => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message =
    log_message +
    ' (' +
    progressObj.transferred +
    '/' +
    progressObj.total +
    ')';
  sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  sendStatusToWindow('Update downloaded');
  shouldNotify = false;
});

function createWindow() {
  const size = electron.screen.getPrimaryDisplay().workAreaSize;

  let mainWindowState = windowStateKeeper({
    defaultWidth: size.width,
    defaultHeight: size.height
  });

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 900,
    minHeight: 800,
    webPreferences: { webSecurity: false, nodeIntegration: true },
    frame: false
  });

  mainWindowState.manage(mainWindow);

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', async () => {
  if (isDev) {
    await installExtensions();
  }
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
