import os from 'os'
import path from 'path'
import { app, BrowserWindow, Menu, dialog, globalShortcut } from 'electron'
import { initIpc } from './ipc'
import fs from "fs";
// https://stackoverflow.com/questions/42524606/how-to-get-windows-version-using-node-js
const isWin7 = os.release().startsWith('6.1')
if (isWin7) app.disableHardwareAcceleration()

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

let win: BrowserWindow | null = null
import OSS from 'ali-oss'
async function bootstrap() {
    win = new BrowserWindow({
        width: 1300,
        height: 760,
        minWidth: 1200, //窗口的最小宽度，单位: 像素值,
        minHeight: 768, //窗口的最小高度，单位: 像素值,
        title: 'WhisperX', //窗口的默认标题
        center: true, //窗口是否在屏幕居中；true or false
        resizable: true, //窗口的大小是否可以；true or false，默认值为true
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, '../preload/index.cjs'),
        },
    })
    // 空白菜单
    let Menus: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = []
    const mainMenu = Menu.buildFromTemplate(Menus)
    Menu.setApplicationMenu(mainMenu)


    if (app.isPackaged) {
        await win.loadFile(path.join(__dirname, '../renderer/index.html'))
        // win.webContents.openDevTools()
    } else {
        const pkg = await import('../../package.json')
        const url = `http://${pkg.env.HOST || '127.0.0.1'}:${pkg.env.PORT}`

        await win.loadURL(url)

        // win.webContents.openDevTools()
    }
    globalShortcut.register('CommandOrControl+Alt+Shift+O', function () {
        win.webContents.openDevTools()
    })
    globalShortcut.register('CommandOrControl+Alt+Shift+C', function () {
        win.webContents.closeDevTools()
    })

}

async function createProgramFile( ){
    let dir = path.join(
        os.homedir(),
        'AppData',
        'Roaming',
        'WhisperX',
        )
    // create if not exist
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

app.whenReady().then(bootstrap).then(createProgramFile)

app.on('window-all-closed', () => {
    win = null
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
const parseCommand = function () {
    dialog.showMessageBox({
        title: '警告',
        type: 'warning',
        message: '请勿重复打开程序!'
    }).then(r => {})
};
app.on('second-instance', () => {
    if (win) {
        if (win.isMinimized()) win.restore()
        win.focus()
        win.show()
        parseCommand()
    }
})
export { win }
initIpc()
