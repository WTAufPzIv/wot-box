const { contextBridge, ipcRenderer } = require('electron');
const { Buffer } = require('buffer')
contextBridge.exposeInMainWorld('electron', {ipcRenderer:{
  send: (channel, ...args) => ipcRenderer.send(channel,  ...args),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  once: (channel, listener) => ipcRenderer.once(channel, (event, ...args) => listener(...args)),
}});

contextBridge.exposeInMainWorld('Buffer', Buffer.from);