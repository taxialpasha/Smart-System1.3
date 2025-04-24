/**
 * نظام الاستثمار المتكامل - ملف preload لتطبيق Electron
 * يوفر واجهة آمنة بين عمليات تشغيل Electron وواجهة المستخدم
 */

const { contextBridge, ipcRenderer } = require('electron');

// تعريف API للتفاعل مع نظام الملفات
contextBridge.exposeInMainWorld('electronAPI', {
  // قراءة وكتابة البيانات
  getData: (key) => ipcRenderer.invoke('get-data', key),
  saveData: (key, data) => ipcRenderer.invoke('save-data', key, data),
  
  // النسخ الاحتياطي واستعادة البيانات
  createBackup: () => ipcRenderer.invoke('create-backup'),
  restoreBackup: (filePath) => ipcRenderer.invoke('restore-backup', filePath),
  
  // التفاعل مع نظام الملفات
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  saveFile: (options, data) => ipcRenderer.invoke('save-file', options, data),
  
  // الإشعارات
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body)
});

// تعريف واجهة للتخزين المحلي آمن
contextBridge.exposeInMainWorld('secureStorage', {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error setting item to localStorage:', error);
      return false;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
      return false;
    }
  }
});

// تعريف واجهة للتحكم في نافذة التطبيق
contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
});

// إضافة مستمع للأخطاء غير المعالجة
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});

// لوغ عند تحميل الملف
console.log('تم تحميل ملف preload.js بنجاح');