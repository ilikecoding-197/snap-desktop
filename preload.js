const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    setControlsColors: (color, symbol) =>
        ipcRenderer.send("set-control-colors", { color, symbol }),
    onFullscreenChange: (cb) =>
        ipcRenderer.on('fullscreen-changed', (_, v) => cb(v)),
    toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen')
});
