const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true, // Tăng cường bảo mật
      nodeIntegration: false, // Tắt tích hợp Node.js trong renderer process
    },
  });

  // Load file index.html từ thư mục build của ReactJS
  mainWindow.loadFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
