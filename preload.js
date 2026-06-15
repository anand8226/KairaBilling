const { contextBridge } = require('electron');

// Expose safe custom APIs to the browser window context
contextBridge.exposeInMainWorld('electronAPI', {
  appVersion: '1.4.0',
});
