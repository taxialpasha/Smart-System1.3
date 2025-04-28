/**
 * نظام الاستثمار المتكامل - مصلح النماذج
 * هذا الملف يعالج مشاكل تجمد النماذج وعناصر الإدخال
 */

// المعلمات الرئيسية
const FORM_SETTINGS = {
    REFRESH_INTERVAL: 2000, // تحديث كل 2 ثانية
    INPUT_TIMEOUT: 500, // مهلة لتجنب التحديثات المتكررة
  };
  
  // متغيرات التتبع
  let formCheckInterval = null;
  let lastInputTimes = {};
  let formFixerActive = false;
  let pendingUpdates = {};
  
  /**
   * تهيئة مصلح النماذج
   */
  function initFormFixer() {
    if (formFixerActive) return;
    formFixerActive = true;
    
    // إضافة مستمعي الأحداث للمدخلات
    setupInputListeners();
    
    // جدولة فحص دوري لحالة النماذج
    formCheckInterval = setInterval(checkFormsHealth, FORM_SETTINGS.REFRESH_INTERVAL);
    
    console.log('تم تهيئة نظام إصلاح النماذج');
  }
  
  /**
   * إعداد مستمعي أحداث الإدخال
   */
  function setupInputListeners() {
    // التقاط جميع عناصر الإدخال (القائمة الحالية والمستقبلية)
    document.addEventListener('focus', handleInputFocus, true);
    document.addEventListener('blur', handleInputBlur, true);
    document.addEventListener('input', handleInputEvent, true);
    document.addEventListener('change', handleInputEvent, true);
    
    // معالجة النقر على الأزرار
    document.addEventListener('click', handleButtonClick, true);
    
    // إضافة مستمع للأحداث المخصصة
    document.addEventListener('formReset', refreshForms);
    
    // إضافة معالج للنماذج
    document.addEventListener('submit', handleFormSubmit, true);
    
    console.log('تم إعداد مستمعي أحداث المدخلات');
  }
  
  /**
   * معالجة التركيز على عنصر إدخال
   */
  function handleInputFocus(event) {
    const target = event.target;
    if (isFormElement(target)) {
      // تسجيل وقت التركيز
      lastInputTimes[getElementIdentifier(target)] = Date.now();
      
      // تحديث حالة العنصر
      ensureElementResponsive(target);
      
      // إخطار كاشف التجمد بالنشاط
      if (window.freezeDetector && window.freezeDetector.refresh) {
        window.freezeDetector.refresh();
      }
    }
  }
  
  /**
   * معالجة فقدان التركيز من عنصر إدخال
   */
  function handleInputBlur(event) {
    const target = event.target;
    if (isFormElement(target)) {
      // تحديث وقت آخر تفاعل
      lastInputTimes[getElementIdentifier(target)] = Date.now();
    }
  }
  
  /**
   * معالجة أحداث الإدخال
   */
  function handleInputEvent(event) {
    const target = event.target;
    if (isFormElement(target)) {
      const elementId = getElementIdentifier(target);
      lastInputTimes[elementId] = Date.now();
      
      // جدولة تحديث للعنصر بعد مهلة صغيرة لتجنب التحديثات المتكررة
      if (pendingUpdates[elementId]) {
        clearTimeout(pendingUpdates[elementId]);
      }
      
      pendingUpdates[elementId] = setTimeout(() => {
        ensureElementResponsive(target);
        delete pendingUpdates[elementId];
      }, FORM_SETTINGS.INPUT_TIMEOUT);
      
      // إخطار كاشف التجمد بالنشاط
      if (window.freezeDetector && window.freezeDetector.refresh) {
        window.freezeDetector.refresh();
      }
    }
  }
  
  /**
   * معالجة النقر على الأزرار
   */
  function handleButtonClick(event) {
    const target = event.target;
    const button = target.closest('button') || target.closest('[role="button"]') || target.closest('.btn');
    
    if (button) {
      // التحقق من صحة الزر
      ensureButtonFunctional(button);
      
      // إخطار كاشف التجمد بالنشاط
      if (window.freezeDetector && window.freezeDetector.refresh) {
        window.freezeDetector.refresh();
      }
    }
  }
  
  /**
   * معالجة تقديم النماذج
   */
  function handleFormSubmit(event) {
    // تسجيل نشاط النموذج
    const form = event.target;
    if (form && form.tagName === 'FORM') {
      // إخطار كاشف التجمد بالنشاط
      if (window.freezeDetector && window.freezeDetector.refresh) {
        window.freezeDetector.refresh();
      }
    }
  }
  
  /**
   * التحقق من صحة جميع النماذج في الصفحة
   */
  function checkFormsHealth() {
    // البحث عن كل عناصر الإدخال النشطة
    const activeInputs = document.querySelectorAll('input:focus, select:focus, textarea:focus');
    
    activeInputs.forEach(input => {
      const elementId = getElementIdentifier(input);
      const lastActiveTime = lastInputTimes[elementId] || 0;
      const currentTime = Date.now();
      
      // إذا مر وقت طويل ولم يتم تحديث العنصر، قم بإصلاحه
      if (currentTime - lastActiveTime > 5000) { // 5 ثوانٍ
        console.log(`تم اكتشاف عنصر غير مستجيب: ${elementId}`);
        ensureElementResponsive(input);
      }
    });
    
    // فحص النماذج المفتوحة في النوافذ المنبثقة
    const activeModals = document.querySelectorAll('.modal-overlay.active, .modal.active');
    activeModals.forEach(modal => {
      const forms = modal.querySelectorAll('form');
      forms.forEach(form => {
        // التحقق من استجابة عناصر النموذج
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => ensureElementResponsive(input));
        
        // التحقق من استجابة الأزرار
        const buttons = form.querySelectorAll('button, [type="submit"], [type="button"]');
        buttons.forEach(button => ensureButtonFunctional(button));
      });
    });
  }
  
  /**
   * التأكد من أن عنصر الإدخال يستجيب بشكل صحيح
   */
  function ensureElementResponsive(element) {
    if (!element || !document.body.contains(element)) return;
    
    try {
      // التحقق من خصائص العنصر
      if (element.disabled || element.readOnly) return;
      
      // محاولة تنشيط العنصر
      const currentValue = element.value;
      
      // اختبار الاستجابة عن طريق محاولة تعيين القيمة نفسها
      element.value = currentValue;
      
      // إذا كان عنصر select، التأكد من تشغيله بشكل صحيح
      if (element.tagName === 'SELECT') {
        refreshSelectElement(element);
      }
      
      // إصلاح مشكلة التركيز
      if (document.activeElement === element) {
        // إذا كان النص موجوداً، ضع المؤشر في نهاية النص
        if (typeof element.setSelectionRange === 'function' && element.type !== 'checkbox' && element.type !== 'radio') {
          const length = element.value.length;
          element.setSelectionRange(length, length);
        }
      }
    } catch (error) {
      console.warn(`فشل في إصلاح عنصر ${getElementIdentifier(element)}:`, error);
      
      // محاولة استبدال العنصر المعطل كحل أخير
      replaceElement(element);
    }
  }
  
  /**
   * إصلاح عنصر القائمة المنسدلة
   */
  function refreshSelectElement(selectElement) {
    // الاحتفاظ بالقيمة الحالية
    const currentValue = selectElement.value;
    
    // إعادة تهيئة خيارات القائمة المنسدلة إذا كانت فارغة
    if (selectElement.options.length === 0 && selectElement.dataset.source) {
      // محاولة إعادة ملء الخيارات من مصدر البيانات
      const dataSource = selectElement.dataset.source;
      if (window[dataSource] && typeof window[dataSource] === 'function') {
        window[dataSource](selectElement);
      } else if (window.populateSelect && typeof window.populateSelect === 'function') {
        window.populateSelect(selectElement, dataSource);
      }
    }
    
    // إعادة تعيين القيمة الأصلية
    selectElement.value = currentValue;
  }
  
  /**
   * التأكد من أن الزر يعمل بشكل صحيح
   */
  function ensureButtonFunctional(button) {
    if (!button || !document.body.contains(button)) return;
    
    try {
      // إذا كان الزر معطلاً، لا تفعل شيئاً
      if (button.disabled) return;
      
      // التحقق من مستمعي الأحداث في الزر
      if (!button.onclick && button.getAttribute('data-action')) {
        const actionName = button.getAttribute('data-action');
        
        // محاولة إعادة ربط الإجراء
        if (window[actionName] && typeof window[actionName] === 'function') {
          button.onclick = function(event) {
            window[actionName](event);
          };
        }
      }
      
      // تأكد من أن الزر مستجيب
      button.style.pointerEvents = 'auto';
    } catch (error) {
      console.warn(`فشل في إصلاح الزر ${button.id || button.className}:`, error);
    }
  }
  
  /**
   * استبدال عنصر معطل بنسخة جديدة
   */
  function replaceElement(element) {
    if (!element || !element.parentNode) return;
    
    try {
      // إنشاء نسخة من العنصر
      const newElement = element.cloneNode(true);
      const elementId = getElementIdentifier(element);
      
      // نقل الخصائص الحيوية
      newElement.value = element.value;
      
      if (element.tagName === 'SELECT') {
        // التأكد من نقل الخيار المحدد
        for (let i = 0; i < newElement.options.length; i++) {
          newElement.options[i].selected = element.options[i].selected;
        }
      }
      
      // استبدال العنصر القديم بالعنصر الجديد
      element.parentNode.replaceChild(newElement, element);
      
      console.log(`تم استبدال العنصر المتجمد: ${elementId}`);
      
      // تحديث المراجع
      lastInputTimes[getElementIdentifier(newElement)] = Date.now();
      
      return newElement;
    } catch (error) {
      console.error(`فشل في استبدال العنصر:`, error);
      return null;
    }
  }
  
  /**
   * تحديث جميع النماذج
   */
  function refreshForms() {
    // إعادة تهيئة كل النماذج
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      // البحث عن جميع عناصر الإدخال في النموذج
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => ensureElementResponsive(input));
      
      // البحث عن جميع الأزرار في النموذج
      const buttons = form.querySelectorAll('button, [type="submit"], [type="button"]');
      buttons.forEach(button => ensureButtonFunctional(button));
    });
    
    console.log('تم تحديث جميع النماذج');
  }
  
  /**
   * الحصول على معرف فريد للعنصر
   */
  function getElementIdentifier(element) {
    if (!element) return 'unknown';
    
    if (element.id) {
      return element.id;
    } else if (element.name) {
      return `${element.tagName.toLowerCase()}[name="${element.name}"]`;
    } else {
      // إنشاء معرف على أساس المسار في DOM
      let path = [];
      let currentElement = element;
      
      while (currentElement && currentElement !== document.body) {
        let identifier = currentElement.tagName.toLowerCase();
        
        if (currentElement.id) {
          identifier += `#${currentElement.id}`;
        } else if (currentElement.className) {
          identifier += `.${currentElement.className.split(' ')[0]}`;
        }
        
        path.unshift(identifier);
        currentElement = currentElement.parentElement;
      }
      
      return path.join(' > ');
    }
  }
  
  /**
   * التحقق مما إذا كان العنصر جزءاً من نموذج
   */
  function isFormElement(element) {
    if (!element || !element.tagName) return false;
    
    const formElements = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'];
    return formElements.includes(element.tagName);
  }
  
  /**
   * إيقاف نظام إصلاح النماذج
   */
  function stopFormFixer() {
    if (formCheckInterval) {
      clearInterval(formCheckInterval);
      formCheckInterval = null;
    }
    
    // إزالة مستمعي الأحداث
    document.removeEventListener('focus', handleInputFocus, true);
    document.removeEventListener('blur', handleInputBlur, true);
    document.removeEventListener('input', handleInputEvent, true);
    document.removeEventListener('change', handleInputEvent, true);
    document.removeEventListener('click', handleButtonClick, true);
    document.removeEventListener('submit', handleFormSubmit, true);
    
    formFixerActive = false;
    console.log('تم إيقاف نظام إصلاح النماذج');
  }
  
  // تصدير الدوال للاستخدام الخارجي
  window.formFixer = {
    init: initFormFixer,
    stop: stopFormFixer,
    refresh: refreshForms,
    fixElement: ensureElementResponsive,
    fixButton: ensureButtonFunctional
  };
  
  // بدء النظام تلقائياً عند تحميل المستند
  document.addEventListener('DOMContentLoaded', () => {
    // تأخير قصير للتأكد من تحميل العناصر الأخرى أولاً
    setTimeout(initFormFixer, 1000);
  });