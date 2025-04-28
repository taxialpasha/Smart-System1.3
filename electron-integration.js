/**
 * نظام الاستثمار المتكامل - ملف preload محسن لتطبيق Electron
 * يوفر واجهة آمنة بين عمليات تشغيل Electron وواجهة المستخدم
 * مع وظائف محسنة لمعالجة التجمد
 */

const { contextBridge, ipcRenderer } = require('electron');

// تهيئة مؤقت لاكتشاف التجمد
let freezeDetectionTimer = null;
let lastHeartbeat = Date.now();
const FREEZE_TIMEOUT = 10000; // 10 ثوان

// إعداد نبضات القلب لتتبع حالة التطبيق
function setupHeartbeat() {
  // إرسال نبضة قلب إلى العملية الرئيسية بشكل دوري
  setInterval(() => {
    lastHeartbeat = Date.now();
    ipcRenderer.send('app-heartbeat', { timestamp: lastHeartbeat });
  }, 2000);
  
  // بدء مؤقت اكتشاف التجمد
  freezeDetectionTimer = setInterval(checkForFreeze, 5000);
}

// التحقق من تجمد التطبيق
function checkForFreeze() {
  const now = Date.now();
  const timeSinceLastHeartbeat = now - lastHeartbeat;
  
  // إذا مر وقت طويل منذ آخر نبضة، فقد يكون التطبيق متجمداً
  if (timeSinceLastHeartbeat > FREEZE_TIMEOUT) {
    console.warn(`اكتشاف تأخير كبير (${timeSinceLastHeartbeat}ms) - محاولة استعادة التطبيق`);
    
    // إرسال إشارة إلى العملية الرئيسية
    ipcRenderer.send('app-freeze-detected');
    
    // محاولة تحديث النبضة
    lastHeartbeat = now;
  }
}

// تعريف واجهة للتحكم في حالة التطبيق
contextBridge.exposeInMainWorld('electronAPI', {
  // وظائف تحديث الصفحة
  refreshPage: () => ipcRenderer.send('refresh-page'),
  forceReload: () => ipcRenderer.send('force-reload'),
  
  // التقاط ومزامنة حالة التطبيق
  saveState: (state) => ipcRenderer.send('save-app-state', state),
  restoreState: () => ipcRenderer.invoke('get-app-state'),
  
  // إرسال تشخيصات إلى السجل الرئيسي
  logDiagnostics: (data) => ipcRenderer.send('log-diagnostics', data),
  
  // الإبلاغ عن خطأ
  reportError: (error) => ipcRenderer.send('report-error', error),
  
  // الإعلام عن اكتمال تحميل التطبيق
  appReady: () => ipcRenderer.send('app-ready'),
  
  // وظائف استكشاف الأخطاء وإصلاحها
  checkMemory: () => ipcRenderer.invoke('check-memory-usage'),
  
  // الاشتراك في إشعارات من العملية الرئيسية
  onMainProcessMessage: (callback) => {
    ipcRenderer.on('main-process-message', (_, ...args) => callback(...args));
  }
});

// تعريف واجهة للتخزين المحلي آمن
contextBridge.exposeInMainWorld('secureStorage', {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('خطأ في الحصول على عنصر من التخزين المحلي:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('خطأ في تعيين عنصر إلى التخزين المحلي:', error);
      return false;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('خطأ في إزالة عنصر من التخزين المحلي:', error);
      return false;
    }
  },
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('خطأ في مسح التخزين المحلي:', error);
      return false;
    }
  }
});

// تعريف واجهة للتحكم في نافذة التطبيق
contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // وظائف إدارة النافذة المتقدمة
  setSize: (width, height) => ipcRenderer.send('window-set-size', { width, height }),
  setPosition: (x, y) => ipcRenderer.send('window-set-position', { x, y }),
  center: () => ipcRenderer.send('window-center'),
  
  // التواصل مع النوافذ الأخرى (إذا كانت موجودة)
  sendToOtherWindows: (channel, data) => ipcRenderer.send('send-to-others', { channel, data })
});

// تعريف واجهة للتشخيص والمراقبة
contextBridge.exposeInMainWorld('diagnostics', {
  collectSystemInfo: () => ipcRenderer.invoke('collect-system-info'),
  monitorPerformance: (enable) => ipcRenderer.send('monitor-performance', enable),
  getPerformanceLogs: () => ipcRenderer.invoke('get-performance-logs'),
  
  // مراقبة صحة التطبيق
  checkAppHealth: () => ipcRenderer.invoke('check-app-health'),
  reportIssue: (details) => ipcRenderer.send('report-app-issue', details),
  
  // فحص استخدام الموارد
  getMemoryUsage: () => ipcRenderer.invoke('get-memory-usage'),
  getCpuUsage: () => ipcRenderer.invoke('get-cpu-usage')
});

// تعريف واجهة لأنظمة المدخلات
contextBridge.exposeInMainWorld('inputSystem', {
  // مراقبة صحة المدخلات
  monitorInputHealth: () => {
    // إعداد معالج لمراقبة تجمد المدخلات
    let lastInputTime = Date.now();
    let inputFreezeTimer = null;
    
    // إنشاء كائن لتتبع حالة المدخلات
    const inputTracker = {
      active: true,
      frozenInputs: []
    };
    
    // وظيفة لتحديث وقت آخر إدخال
    const updateInputTime = () => {
      lastInputTime = Date.now();
      inputTracker.frozenInputs = [];
    };
    
    // تسجيل مستمعي الأحداث المختلفة
    document.addEventListener('keydown', updateInputTime, true);
    document.addEventListener('keyup', updateInputTime, true);
    document.addEventListener('mousedown', updateInputTime, true);
    document.addEventListener('mouseup', updateInputTime, true);
    document.addEventListener('input', updateInputTime, true);
    document.addEventListener('change', updateInputTime, true);
    
    // بدء فحص دوري لحالة المدخلات
    inputFreezeTimer = setInterval(() => {
      const now = Date.now();
      const focusedElement = document.activeElement;
      
      // التحقق من العناصر النشطة
      if (focusedElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(focusedElement.tagName)) {
        const timeSinceLastInput = now - lastInputTime;
        
        // إذا مر وقت طويل منذ آخر إدخال والعنصر لا يزال نشطاً
        if (timeSinceLastInput > 5000) { // 5 ثوانٍ
          console.warn('اكتشاف محتمل لتجمد في عنصر الإدخال:', focusedElement);
          
          // تسجيل العنصر المتجمد
          if (!inputTracker.frozenInputs.includes(focusedElement)) {
            inputTracker.frozenInputs.push(focusedElement);
          }
          
          // إبلاغ العملية الرئيسية
          ipcRenderer.send('input-freeze-detected', {
            element: {
              id: focusedElement.id,
              type: focusedElement.type,
              tagName: focusedElement.tagName,
              value: focusedElement.value
            },
            timeSinceLastInput
          });
        }
      }
    }, 2000);
    
    // إعادة الكائن للوصول إليه من واجهة المستخدم
    return inputTracker;
  },
  
  // تفعيل أو تعطيل معالجات أحداث المدخلات
  enableInputHandlers: (enable) => {
    if (enable) {
      // إعادة تفعيل معالجات الأحداث
      ipcRenderer.send('enable-input-handlers');
    } else {
      // تعطيل معالجات الأحداث مؤقتاً
      ipcRenderer.send('disable-input-handlers');
    }
  },
  
  // إعادة تعيين حالة المدخلات
  resetInputState: () => {
    ipcRenderer.send('reset-input-state');
  }
});

// تعريف واجهة للتعامل مع الذاكرة والأداء
contextBridge.exposeInMainWorld('memoryManager', {
  // تحسين استخدام الذاكرة
  optimizeMemory: () => {
    // تنظيف الذاكرة غير المستخدمة
    if (global.gc) {
      global.gc();
    }
    
    ipcRenderer.send('optimize-memory');
  },
  
  // طلب تقليص استخدام الذاكرة
  reduceMemoryUsage: () => {
    ipcRenderer.send('reduce-memory-usage');
  },
  
  // الحصول على إحصائيات الذاكرة
  getMemoryStats: () => ipcRenderer.invoke('get-memory-stats')
});

// إضافة مستمع للأخطاء غير المعالجة
window.addEventListener('error', (event) => {
  console.error('خطأ غير معالج:', event.error);
  
  // إرسال بيانات الخطأ إلى العملية الرئيسية
  ipcRenderer.send('unhandled-error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error ? {
      name: event.error.name,
      message: event.error.message,
      stack: event.error.stack
    } : null
  });
});

// مستمع للوعود المرفوضة غير المعالجة
window.addEventListener('unhandledrejection', (event) => {
  console.error('وعد مرفوض غير معالج:', event.reason);
  
  // إرسال بيانات الخطأ إلى العملية الرئيسية
  ipcRenderer.send('unhandled-rejection', {
    reason: event.reason ? {
      name: event.reason.name,
      message: event.reason.message,
      stack: event.reason.stack
    } : 'مجهول'
  });
});

// إعداد مراقبة الصحة والأداء عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
  console.log('تم تحميل DOM، بدء مراقبة الأداء والصحة');
  
  // بدء نبضات القلب
  setupHeartbeat();
  
  // إعلام العملية الرئيسية باكتمال تحميل الصفحة
  setTimeout(() => {
    ipcRenderer.send('dom-ready');
  }, 1000);
  
  // إعداد معالج لأزرار نافذة التطبيق
  const minimizeBtn = document.getElementById('minimize-btn');
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => ipcRenderer.send('window-minimize'));
  }
  
  const maximizeBtn = document.getElementById('maximize-btn');
  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', () => ipcRenderer.send('window-maximize'));
  }
  
  const closeBtn = document.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => ipcRenderer.send('window-close'));
  }
  
  // أزرار إضافية
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => ipcRenderer.send('refresh-page'));
  }
  
  const refreshToggleBtn = document.getElementById('refresh-toggle-btn');
  if (refreshToggleBtn) {
    refreshToggleBtn.addEventListener('click', () => {
      const shouldRefresh = confirm('هل تريد تحديث الصفحة بالكامل؟');
      if (shouldRefresh) {
        ipcRenderer.send('force-reload');
      }
    });
  }
});

// لوغ عند تحميل الملف
console.log('تم تحميل ملف preload.js المحسّن بنجاح');