const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 500,
    useContentSize: true,
    fullscreenable: false,
    darkTheme: true,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: "src/icon.ico"
  })


  win.setPosition(5, 25)
  // win.setAlwaysOnTop(true, "screen-saver")

  globalShortcut.register("`", () => {
    if (win.isVisible()) {
      win.hide()
    } else {
      win.showInactive()
      win.moveTop()
    }
  })

  win.loadFile('src/index.html')

  ipcMain.on('resize-height', (event, height) => {
    win.setContentSize(win.getContentSize()[0], height)
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

  