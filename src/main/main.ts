/* eslint global-require: off, no-console: off, promise/always-return: off */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import dotenv from 'dotenv';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './utils';
import topics from '../constants/topics';
import {
  initializeAndReadConfigFile,
  initializeAppDataPath,
} from './helpers/appData';
import { IResult } from '../constants/interfaces';
// eslint-disable-next-line import/no-cycle
import { handleMessage } from './handle.message';

dotenv.config(); // Load environment variables from .env file

initializeAppDataPath();
initializeAndReadConfigFile();

// eslint-disable-next-line import/prefer-default-export, import/no-mutable-exports
export let mainWindow: BrowserWindow | null = null;

// eslint-disable-next-line prettier/prettier
ipcMain.on('syntharium', async (event: any, topic: topics, service: string, message: string) => {
    const result: IResult = await handleMessage(topic, service, message);
    event.reply('syntharium', result);
  },
);

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
  const prodFixes = require('./prodFixes');
  prodFixes.loadProdConfigs();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
  // Object.defineProperty(app, 'isPackaged', {
  //   get() {
  //     return true;
  //   },
  // });
  log.transports.file.level = 'info';
  autoUpdater.logger = log;
  // autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
  autoUpdater.checkForUpdatesAndNotify();
};
/**
 * Add event listeners...
 */
function sendStatusToWindow(text: string, updateAvailable?: boolean) {
  log.info(text);
  mainWindow?.webContents.send('syntharium', {
    topic: topics.autoUpdater,
    data: {
      logs: text,
      updateAvailable,
    },
  });
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('info', info);
  sendStatusToWindow('Update available.', true);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('info', info);
  sendStatusToWindow('Update not available.', false);
});

autoUpdater.on('error', (err) => {
  console.log('err', err);
  sendStatusToWindow(`Error in auto-updater. ${err}`);
});

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
  logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
  logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;
  sendStatusToWindow(logMessage);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('info', info);
  sendStatusToWindow(
    'Update downloaded. Please quit from application and launch again.',
  );
  autoUpdater.quitAndInstall()
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
