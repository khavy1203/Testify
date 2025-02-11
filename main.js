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
 	preload: path.join(__dirname, 'preload.js'), // Đường dẫn tới preload script
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

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Thông tin bản cập nhật:', info);
    dialog.showMessageBoxSync(mainWindow, {
      type: 'info',
      title: 'Cập nhật sẵn sàng',
      message: `Bản cập nhật đã sẵn sàng để cài đặt. Đường dẫn file: ${info.filePath}`,
      buttons: ['Cài đặt ngay', 'Để sau'],
    });
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('error', (err) => {
    console.error('Lỗi trong quá trình cập nhật:', err);
    dialog.showErrorBox('Lỗi cập nhật', `Không thể tải xuống bản cập nhật. Chi tiết lỗi:\n${err.message}`);
  });


});

// ipcMain.on('print', (event, content) => {
//   // Tạo một cửa sổ ẩn để thực hiện in
//   const printWindow = new BrowserWindow({
//     show: false,
//     webPreferences: {
//       contextIsolation: true,
//       nodeIntegration: false,
//     },
//   });

//   // Tải nội dung cần in
//   printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(content)}`);

//   // Khi cửa sổ sẵn sàng, thực hiện lệnh in
//   printWindow.webContents.once('did-finish-load', () => {
//     printWindow.webContents.print(
//       {
//         silent: true, // In tự động, không hiển thị hộp thoại
//         printBackground: true, // In kèm nền
//       },
//       (success, errorType) => {
//         if (!success) {
//           console.error('Print failed:', errorType);
//         }
//         printWindow.close(); // Đóng cửa sổ sau khi in
//       }
//     );
//   });
// });


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
