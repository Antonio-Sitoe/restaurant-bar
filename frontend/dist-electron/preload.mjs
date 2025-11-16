"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  minimizeWindow: () => electron.ipcRenderer.invoke("window-minimize"),
  maximizeWindow: () => electron.ipcRenderer.invoke("window-maximize"),
  closeWindow: () => electron.ipcRenderer.invoke("window-close"),
  isMaximized: () => electron.ipcRenderer.invoke("window-is-maximized"),
  onWindowMaximized: (callback) => {
    electron.ipcRenderer.on("window-maximized", (_event, maximized) => {
      callback(maximized);
    });
  }
});
