const { app, BrowserWindow, globalShortcut, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'frontend', 'build', 'index.html'));

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

  autoUpdater.on('error', (err) => {
    console.error('Lỗi trong quá trình cập nhật:', err);
    dialog.showErrorBox('Lỗi cập nhật', `Không thể tải xuống bản cập nhật. Chi tiết lỗi:\n${err.message}`);
  });

  ipcMain.handle('get-printers', async () => {
    try {
      const printers = await mainWindow.webContents.getPrintersAsync();
      return printers.map(printer => ({
        name: printer.name,
        isDefault: printer.isDefault,
      }));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách máy in:', error);
      throw error;
    }
  });

  ipcMain.on('print', (event, { content, printerName, silent = true }) => {
    try {
      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox:true
        },
      });

      // Parse dữ liệu từ renderer process
      const { content: htmlContent, duplex } = JSON.parse(content);

      printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      printWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.getPrintersAsync().then(printers => {
          const selectedPrinter = printers.find(p => p.name === printerName);
          console.log('Thông tin máy in:', selectedPrinter);

          const printOptions = {
            deviceName: printerName,
            silent: silent, // Hiển thị hộp thoại in để kiểm tra và chọn 2 mặt
            pageSize: 'A4',
            duplex: duplex === 'Simplex' ? 'Simplex' : 'Duplex', // Chọn Simplex (1 mặt) hoặc Duplex (2 mặt)
            duplexMode: duplex === 'Simplex' ? undefined : 'longEdge',
          };

          console.log('check printOptions', printOptions);

          printWindow.webContents.print(printOptions, (success, errorType) => {
            if (!success) {
              console.error('Lỗi khi in:', errorType);
              dialog.showErrorBox('Lỗi in', `Không thể in tài liệu. Chi tiết lỗi: ${errorType}`);
            } else {
              console.log(`Đã in thành công tới máy in: ${printerName}`);
            }
            printWindow.close();
          });
        }).catch(err => {
          console.error('Lỗi khi lấy thông tin máy in:', err);
          dialog.showErrorBox('Lỗi', 'Không thể lấy thông tin máy in.');
          printWindow.close();
        });
      });
    } catch (error) {
      console.error('Lỗi trong quá trình in:', error);
      dialog.showErrorBox('Lỗi in', `Không thể in tài liệu. Chi tiết lỗi: ${error.message}`);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});