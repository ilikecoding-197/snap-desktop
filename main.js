const { app, BrowserWindow, ipcMain } = require("electron");

function createWindow() {
    const win = new BrowserWindow({
        width: 910,
        minWidth: 910,
        height: 800,
        frame: true,
        titleBarStyle: "hidden",
        ...(process.platform !== 'darwin' ? { titleBarOverlay: {
            color: '#2f3241',
            symbolColor: '#74b1be',
            height: 28
        } } : {}),
        autoHideMenuBar: true,
        webPreferences: {
            preload: `${__dirname}/preload.js`
        },
        icon: `${__dirname}/snap/src/favicon.ico`
    });

    win.loadFile(`${__dirname}/snap/snap.html`);

    win.webContents.setVisualZoomLevelLimits(1, 1);
    win.webContents.on("did-finish-load", () => {
        win.webContents.setZoomLevel(0);
        win.webContents.setZoomFactor(1);
    });
    ipcMain.on("set-control-colors", (event, { color, symbol }) => {
        if (win) {
            win.setTitleBarOverlay({
                color: color,
                symbolColor: symbol
            });
        }
    });

    win.on('enter-full-screen', () => {
        win.webContents.send('fullscreen-changed', true);
    });

    win.on('leave-full-screen', () => {
        win.webContents.send('fullscreen-changed', false);
    });

    ipcMain.handle('toggle-fullscreen', () => {
        win.setFullScreen(!win.isFullScreen());
    });

    ipcMain.handle('open-dev-tools', () => {
        win.webContents.openDevTools();
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
