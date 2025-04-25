/**
 * إصلاح مشكلة فقدان بيانات الأقساط بعد تحديث الصفحة
 * هذا الملف يعالج مشكلة عدم استمرارية بيانات الأقساط عند إعادة تحميل الصفحة
 * يجب إضافة هذا الملف في نهاية صفحة HTML بعد جميع ملفات JavaScript الأخرى
 */

// تنفيذ الإصلاح عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // التأكد من تحميل كافة العناصر
  setTimeout(() => {
    console.log("بدء تنفيذ إصلاح مشكلة فقدان بيانات الأقساط...");
    
    // تطبيق إصلاح مشكلة الحفظ
    fixPersistenceIssue();
    
    console.log("اكتمل تنفيذ إصلاح مشكلة فقدان بيانات الأقساط");
  }, 1000);
});

/**
 * إصلاح مشكلة استمرارية البيانات
 * يقوم بتحسين آليات الحفظ والاستعادة لضمان عدم فقدان البيانات
 */
function fixPersistenceIssue() {
  console.log("تحسين آلية حفظ واستعادة البيانات...");
  
  // 1. تعزيز آلية الحفظ - استبدال وظيفة الحفظ الأصلية
  if (typeof window.saveData === 'function') {
    console.log("استبدال دالة حفظ البيانات...");
    
    // احتفظ بالدالة الأصلية
    const originalSaveData = window.saveData;
    
    // استبدال دالة الحفظ بنسخة محسنة
    window.saveData = function() {
      // استدعاء الدالة الأصلية أولاً لضمان حفظ البيانات بالطريقة العادية
      const result = originalSaveData.apply(this, arguments);
      
      try {
        // حفظ نسخة كاملة من مصفوفة المستثمرين بشكل منفصل
        // هذا يضمن حفظ جميع بيانات الأقساط المرتبطة بالمستثمرين
        if (Array.isArray(window.investors)) {
          localStorage.setItem('investorsWithInstallments', JSON.stringify(window.investors));
          console.log(`تم حفظ ${window.investors.length} مستثمر مع بيانات الأقساط الخاصة بهم في التخزين المحلي`);
          
          // إضافة علامة توقيت للحفظ
          localStorage.setItem('investorsDataLastSaved', new Date().toISOString());
        }
      } catch (error) {
        console.error("خطأ في حفظ بيانات المستثمرين مع الأقساط:", error);
      }
      
      return result;
    };
    
    console.log("تم استبدال دالة حفظ البيانات بنجاح");
  }
  
  // 2. تحسين آلية استعادة البيانات
  if (typeof window.loadData === 'function') {
    console.log("استبدال دالة تحميل البيانات...");
    
    // احتفظ بالدالة الأصلية
    const originalLoadData = window.loadData;
    
    // استبدال دالة التحميل بنسخة محسنة
    window.loadData = function() {
      // استدعاء الدالة الأصلية أولاً
      const result = originalLoadData.apply(this, arguments);
      
      try {
        // التحقق من وجود بيانات محفوظة
        const savedData = localStorage.getItem('investorsWithInstallments');
        
        if (savedData) {
          const lastSavedTime = localStorage.getItem('investorsDataLastSaved');
          console.log(`وجدت بيانات محفوظة بتاريخ: ${lastSavedTime || 'غير معروف'}`);
          
          // استعادة البيانات المحفوظة
          const savedInvestors = JSON.parse(savedData);
          
          if (Array.isArray(savedInvestors) && savedInvestors.length > 0) {
            // استبدال مصفوفة المستثمرين الموجودة بالمصفوفة المحفوظة
            window.investors = savedInvestors;
            
            console.log(`تم استعادة ${savedInvestors.length} مستثمر مع بيانات الأقساط الخاصة بهم`);
            
            // حفظ البيانات بالطريقة العادية للتأكد من تطابق جميع المخازن
            if (typeof originalSaveData === 'function') {
              originalSaveData();
            }
          }
        } else {
          console.log("لم يتم العثور على بيانات محفوظة للمستثمرين مع الأقساط");
        }
      } catch (error) {
        console.error("خطأ في استعادة بيانات المستثمرين مع الأقساط:", error);
      }
      
      return result;
    };
    
    console.log("تم استبدال دالة تحميل البيانات بنجاح");
  }
  
  // 3. إضافة حدث لضمان الحفظ قبل إغلاق الصفحة
  window.addEventListener('beforeunload', function() {
    console.log("حفظ البيانات قبل إغلاق الصفحة...");
    
    try {
      // حفظ نسخة كاملة من مصفوفة المستثمرين
      if (Array.isArray(window.investors)) {
        localStorage.setItem('investorsWithInstallments', JSON.stringify(window.investors));
        localStorage.setItem('investorsDataLastSaved', new Date().toISOString());
      }
    } catch (error) {
      console.error("خطأ في حفظ البيانات قبل إغلاق الصفحة:", error);
    }
  });
  
  // 4. تنفيذ استعادة البيانات فوراً
  try {
    // التحقق من وجود بيانات محفوظة
    const savedData = localStorage.getItem('investorsWithInstallments');
    
    if (savedData) {
      // استعادة البيانات المحفوظة
      const savedInvestors = JSON.parse(savedData);
      
      if (Array.isArray(savedInvestors) && savedInvestors.length > 0) {
        // التحقق من أن المصفوفة تحتوي على أقساط
        const hasInstallments = savedInvestors.some(investor => 
          investor.installments && investor.installments.length > 0);
        
        if (hasInstallments) {
          console.log("وجدت بيانات أقساط محفوظة، جاري استعادتها...");
          
          // استبدال مصفوفة المستثمرين الموجودة بالمصفوفة المحفوظة
          window.investors = savedInvestors;
          
          console.log(`تم استعادة ${savedInvestors.length} مستثمر مع بيانات الأقساط الخاصة بهم`);
          
          // تحديث واجهة المستخدم
          if (typeof window.renderInvestorsTable === 'function') {
            window.renderInvestorsTable();
          }
          
          if (typeof window.updateDashboard === 'function') {
            window.updateDashboard();
          }
          
          // تحديث صفحة الأقساط إذا كانت مفتوحة
          if (document.querySelector('#installments-page.active')) {
            if (typeof window.renderInstallmentsTable === 'function') {
              window.renderInstallmentsTable();
            }
            
            if (typeof window.updateInstallmentsDashboard === 'function') {
              window.updateInstallmentsDashboard();
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("خطأ في الاستعادة الفورية للبيانات:", error);
  }
  
  // 5. إضافة فحص دوري للتأكد من حفظ البيانات
  setInterval(function() {
    // حفظ البيانات دورياً لتجنب فقدانها
    if (typeof window.saveData === 'function' && Array.isArray(window.investors)) {
      // التحقق من وجود تغييرات في البيانات قبل الحفظ
      const currentData = JSON.stringify(window.investors);
      const savedData = localStorage.getItem('investorsWithInstallments');
      
      if (currentData !== savedData) {
        console.log("تم اكتشاف تغييرات في البيانات، جاري الحفظ...");
        window.saveData();
      }
    }
  }, 60000); // حفظ كل دقيقة
  
  console.log("تم تطبيق إصلاحات استمرارية البيانات بنجاح");
  
  // 6. إضافة وظيفة طوارئ لاستعادة البيانات
  window.recoverInstallmentsData = function() {
    try {
      const savedData = localStorage.getItem('investorsWithInstallments');
      
      if (savedData) {
        const savedInvestors = JSON.parse(savedData);
        
        if (Array.isArray(savedInvestors) && savedInvestors.length > 0) {
          // استبدال مصفوفة المستثمرين الموجودة بالمصفوفة المحفوظة
          window.investors = savedInvestors;
          
          // حفظ البيانات بالطريقة العادية
          if (typeof window.saveData === 'function') {
            window.saveData();
          }
          
          // تحديث واجهة المستخدم
          if (typeof window.renderInvestorsTable === 'function') {
            window.renderInvestorsTable();
          }
          
          if (typeof window.updateDashboard === 'function') {
            window.updateDashboard();
          }
          
          // تحديث صفحة الأقساط إذا كانت مفتوحة
          if (document.querySelector('#installments-page.active')) {
            if (typeof window.renderInstallmentsTable === 'function') {
              window.renderInstallmentsTable();
            }
            
            if (typeof window.updateInstallmentsDashboard === 'function') {
              window.updateInstallmentsDashboard();
            }
          }
          
          console.log(`تم استعادة ${savedInvestors.length} مستثمر مع بيانات الأقساط الخاصة بهم`);
          
          alert('تم استعادة بيانات الأقساط بنجاح!');
          return true;
        }
      }
      
      alert('لم يتم العثور على بيانات أقساط محفوظة!');
      return false;
    } catch (error) {
      console.error("خطأ في استعادة البيانات:", error);
      alert('حدث خطأ أثناء استعادة البيانات. يرجى مراجعة وحدة التحكم للتفاصيل.');
      return false;
    }
  };
  
  // إضافة زر استعادة الطوارئ (اختياري)
  addEmergencyRecoveryButton();
}

/**
 * إضافة زر استعادة طوارئ للواجهة
 * زر مخفي يمكن للمستخدم استخدامه في حالة فقدان البيانات
 */
function addEmergencyRecoveryButton() {
  // التحقق من وجود الزر مسبقاً
  if (document.getElementById('emergency-recover-button')) {
    return;
  }
  
  // إنشاء الزر
  const recoveryButton = document.createElement('button');
  recoveryButton.id = 'emergency-recover-button';
  recoveryButton.className = 'emergency-recover-button';
  recoveryButton.innerHTML = '<i class="fas fa-database"></i> استعادة بيانات الأقساط';
  
  // إضافة النمط للزر
  const style = document.createElement('style');
  style.textContent = `
    .emergency-recover-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #e53e3e;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 10px 20px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      display: none;
      opacity: 0.9;
      transition: all 0.3s ease;
    }
    
    .emergency-recover-button:hover {
      opacity: 1;
      transform: translateY(-2px);
    }
    
    .emergency-recover-button i {
      margin-right: 8px;
    }
    
    /* الزر يظهر فقط عند الضغط على مفتاح Alt مع R */
    body.recovery-mode .emergency-recover-button {
      display: block;
    }
  `;
  
  // إضافة النمط والزر للصفحة
  document.head.appendChild(style);
  document.body.appendChild(recoveryButton);
  
  // إضافة مستمع حدث للزر
  recoveryButton.addEventListener('click', function() {
    // استدعاء وظيفة الاستعادة
    window.recoverInstallmentsData();
    
    // إخفاء وضع الاستعادة
    document.body.classList.remove('recovery-mode');
  });
  
  // إضافة مستمع لمفاتيح الطوارئ (Alt + R)
  document.addEventListener('keydown', function(e) {
    // Alt + R
    if (e.altKey && e.key === 'r') {
      document.body.classList.toggle('recovery-mode');
    }
  });
}

// تنفيذ الإصلاح عند تحميل الملف
fixPersistenceIssue();