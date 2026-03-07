const { app, BrowserWindow, ipcMain, shell } = require("electron");

function openLocalSnapFromUrl(url) {
    const parsed = new URL(url);

    createWindow({
        hash: parsed.hash
    });
}

function createWindow(opts) {
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

    win.loadFile(`${__dirname}/snap/snap.html`, opts);

    win.webContents.setVisualZoomLevelLimits(1, 1);
    win.webContents.on("did-finish-load", () => {
        win.webContents.setZoomLevel(0);
        win.webContents.setZoomFactor(1);
    });

    win.on('enter-full-screen', () => {
        win.webContents.send('fullscreen-changed', true);
    });

    win.on('leave-full-screen', () => {
        win.webContents.send('fullscreen-changed', false);
    });
}

app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('disable-usb-blocklist');
app.whenReady().then(() => {
    createWindow({});

    ipcMain.handle('toggle-fullscreen', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) {
            win.setFullScreen(!win.isFullScreen());
        }
    });

    ipcMain.handle('open-dev-tools', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) {
            win.webContents.openDevTools();
        }
    });

    ipcMain.on("set-control-colors", (event, { color, symbol }) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) {
            win.setTitleBarOverlay({
                color: color,
                symbolColor: symbol
            });
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("web-contents-created", (event, contents) => {
    if (contents.getType() === "window") {
        contents.on("will-navigate", (event, url) => {
            if (url.startsWith("https://snap.berkeley.edu/snap/")) {
                event.preventDefault();
                openLocalSnapFromUrl(url);
            }
        });

        contents.setWindowOpenHandler(({ url }) => {
            if (url.startsWith("https://snap.berkeley.edu/snap/")) {
                openLocalSnapFromUrl(url);
                return { action: "deny" };
            }
            return { action: "allow" };
        });
    }
});