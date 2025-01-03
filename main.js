const { app, BrowserWindow, globalShortcut, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      contextIsolation: true, // Tăng cường bảo mật
      nodeIntegration: false, // Tắt tích hợp Node.js trong renderer process
    },
  });

  // Load file index.html từ thư mục build của ReactJS
  mainWindow.loadFile(path.join(__dirname, 'frontend', 'build', 'index.html'));

  // Vô hiệu hóa các tổ hợp phím không mong muốn
  globalShortcut.register('CommandOrControl+R', () => {
    console.log('Reload shortcut is disabled.');
  });

  globalShortcut.register('CommandOrControl+Shift+R', () => {
    console.log('Hard reload shortcut is disabled.');
  });

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    console.log('DevTools shortcut is disabled.');
  });

  globalShortcut.register('F5', () => {
    console.log('F5 shortcut is disabled.');
  });

  // Kiểm tra cập nhật
  autoUpdater.checkForUpdates();

  // Khi có bản cập nhật
  autoUpdater.on('update-available', () => {
    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: 'Cập nhật mới',
        message: 'Một phiên bản mới đã được phát hiện. Bạn có muốn tải xuống và cài đặt không?',
        buttons: ['Có', 'Không'],
      })
      .then((result) => {
        if (result.response === 0) {
          // Nếu người dùng chọn "Có", bắt đầu tải xuống
          autoUpdater.downloadUpdate();
        }
      });
  });

  // Khi tải xuống hoàn tất
  autoUpdater.on('update-downloaded', () => {
    const userResponse = dialog.showMessageBoxSync(mainWindow, {
      type: 'info',
      title: 'Cập nhật sẵn sàng',
      message: 'Bản cập nhật đã sẵn sàng để cài đặt. Ứng dụng sẽ khởi động lại để hoàn tất quá trình cài đặt.',
      buttons: ['Cài đặt ngay', 'Để sau'],
    });

    if (userResponse === 0) {
      // Người dùng chọn "Cài đặt ngay"
      autoUpdater.quitAndInstall();
    }
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
