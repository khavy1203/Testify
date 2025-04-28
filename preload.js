const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  print: (content, printerName, silent = true) => ipcRenderer.send('print', { content, printerName, silent }),
});