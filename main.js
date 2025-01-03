const { app, BrowserWindow , globalShortcut} = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    // width: 800,
    // height: 600,
    fullscreen:true,
    webPreferences: {
      contextIsolation: true, // Tăng cường bảo mật
      nodeIntegration: false, // Tắt tích hợp Node.js trong renderer process
    },
  });

  // Load file index.html từ thư mục build của ReactJS
  mainWindow.loadFile(path.join(__dirname, 'frontend', 'build', 'index.html'));

  globalShortcut.register('CommandOrControl+R', () => {
    console.log('Reload shortcut is disabled.');
  });

  globalShortcut.register('CommandOrControl+Shift+R', () => {
    console.log('Hard reload shortcut is disabled.');
  });

  // Vô hiệu hóa tổ hợp phím mở DevTools
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    console.log('DevTools shortcut is disabled.');
  });

  // Vô hiệu hóa phím F5 (nếu có)
  globalShortcut.register('F5', () => {
    console.log('F5 shortcut is disabled.');
  });
});

// Đóng ứng dụng khi tất cả cửa sổ bị đóng
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Hủy đăng ký tổ hợp phím khi ứng dụng thoát
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});