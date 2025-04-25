/**
 * إصلاح مشكلة زر حفظ الأقساط
 * هذا الملف يعالج مشكلة عدم استجابة زر الحفظ عند إضافة قسط جديد
 */

// تنفيذ الإصلاح فوراً بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // انتظار قليلاً للتأكد من تحميل كافة العناصر
  setTimeout(() => {
    console.log("تنفيذ إصلاح مشكلة زر حفظ الأقساط...");
    fixSaveButtonIssue();
  }, 1000);
});

/**
 * إصلاح مشكلة زر الحفظ
 */
function fixSaveButtonIssue() {
  // البحث عن زر الحفظ
  const saveButton = document.getElementById('save-installment-btn');
  
  if (!saveButton) {
    console.error("لم يتم العثور على زر حفظ الأقساط!");
    
    // محاولة جدولة الإصلاح لاحقاً (قد تكون النافذة غير مفتوحة بعد)
    setTimeout(fixSaveButtonIssue, 2000);
    return;
  }
  
  console.log("تم العثور على زر الحفظ، إعادة ضبط مستمع الحدث...");
  
  // إزالة جميع مستمعي الأحداث السابقة من الزر
  const newSaveButton = saveButton.cloneNode(true);
  saveButton.parentNode.replaceChild(newSaveButton, saveButton);
  
  // إضافة مستمع حدث جديد مباشر
  newSaveButton.addEventListener('click', function(e) {
    console.log("تم النقر على زر الحفظ");
    e.preventDefault();
    
    // استدعاء وظيفة حفظ الأقساط بشكل مباشر
    saveInstallmentDirectly();
  });
  
  // إضافة مستمع لفتح النافذة
  document.addEventListener('click', function(e) {
    const addInstallmentBtn = e.target.closest('.add-installment-btn, #add-global-installment-btn');
    
    if (addInstallmentBtn) {
      // عند فتح نافذة إضافة قسط، نراقب الفتح ثم نعيد ضبط زر الحفظ
      setTimeout(() => {
        fixSaveButtonIssue();
      }, 500);
    }
  });
  
  console.log("تم إصلاح زر حفظ الأقساط بنجاح");
}

/**
 * وظيفة حفظ الأقساط بشكل مباشر
 * تنفذ عملية الحفظ بشكل مستقل عن التنفيذ الأصلي
 */
function saveInstallmentDirectly() {
  console.log("تنفيذ عملية حفظ القسط...");
  
  try {
    // جمع البيانات من النموذج
    const installmentId = document.getElementById('installment-id').value;
    let investorId = document.getElementById('installment-investor-id').value;
    
    // التحقق من وجود مستثمر
    if (!investorId) {
      const investorSelect = document.getElementById('installment-investor');
      if (investorSelect) {
        investorId = investorSelect.value;
      }
    }
    
    if (!investorId) {
      alert('الرجاء اختيار المستثمر');
      return;
    }
    
    // البحث عن المستثمر
    const investor = window.investors.find(inv => inv.id === investorId);
    if (!investor) {
      alert('لم يتم العثور على بيانات المستثمر');
      return;
    }
    
    // جمع باقي البيانات
    const description = document.getElementById('installment-description').value;
    const principalAmountInput = document.getElementById('installment-principal-amount');
    const principalAmount = principalAmountInput ? parseFloat(principalAmountInput.value) : 0;
    
    const withInterestCheckbox = document.getElementById('installment-with-interest');
    const withInterest = withInterestCheckbox ? withInterestCheckbox.checked : false;
    
    const interestRateInput = document.getElementById('installment-interest-rate');
    const interestRate = interestRateInput ? parseFloat(interestRateInput.value) : 0;
    
    const monthlyPaymentsCheckbox = document.getElementById('installment-monthly-payments');
    const monthlyPayments = monthlyPaymentsCheckbox ? monthlyPaymentsCheckbox.checked : false;
    
    const monthsInput = document.getElementById('installment-months');
    const months = monthsInput ? parseInt(monthsInput.value) : 1;
    
    const dueDateInput = document.getElementById('installment-due-date');
    const dueDate = dueDateInput ? dueDateInput.value : new Date().toISOString().split('T')[0];
    
    const notesInput = document.getElementById('installment-notes');
    const notes = notesInput ? notesInput.value : '';
    
    const priorityCheckbox = document.getElementById('installment-priority');
    const priority = priorityCheckbox && priorityCheckbox.checked ? 'high' : 'normal';
    
    // التحقق من البيانات الإلزامية
    if (!description || isNaN(principalAmount) || principalAmount <= 0 || !dueDate) {
      alert('الرجاء ملء جميع الحقول المطلوبة بشكل صحيح');
      return;
    }
    
    // حساب المبلغ الإجمالي
    let totalAmount = principalAmount;
    if (withInterest) {
      totalAmount = principalAmount * (1 + (interestRate / 100));
    }
    
    // التأكد من وجود مصفوفة الأقساط
    if (!investor.installments) {
      investor.installments = [];
    }
    
    // إنشاء مُعرِّف للقسط الرئيسي إذا لم يكن موجوداً
    const mainInstallmentId = installmentId || `inst-${Date.now()}`;
    
    // تاريخ الإنشاء
    const installedDate = new Date().toISOString();
    
    // إنشاء الأقساط
    if (monthlyPayments && months > 0) {
      console.log(`إنشاء ${months} قسط شهري...`);
      
      // إنشاء أقساط شهرية متعددة
      // حذف الأقساط القديمة إذا كانت موجودة
      if (installmentId) {
        investor.installments = investor.installments.filter(inst => 
          !inst.id.startsWith(`${mainInstallmentId}-part-`));
      }
      
      // حساب القسط الشهري
      const monthlyPayment = totalAmount / months;
      
      // إضافة الأقساط الشهرية
      for (let i = 0; i < months; i++) {
        const installmentPartId = `${mainInstallmentId}-part-${i + 1}`;
        
        // حساب تاريخ الاستحقاق لهذا القسط
        const partDueDate = new Date(dueDate);
        partDueDate.setMonth(partDueDate.getMonth() + i);
        const installmentDueDate = partDueDate.toISOString().split('T')[0];
        
        // إنشاء بيانات القسط
        const installmentData = {
          id: installmentPartId,
          description: `${description} - القسط ${i + 1} من ${months}`,
          amount: monthlyPayment,
          principalAmount: principalAmount / months,
          interestAmount: withInterest ? (monthlyPayment - (principalAmount / months)) : 0,
          dueDate: installmentDueDate,
          notes: notes,
          priority: priority,
          parentId: mainInstallmentId,
          partIndex: i + 1,
          totalParts: months,
          installedDate: installedDate,
          status: 'active',
          paidAmount: 0,
          remainingAmount: monthlyPayment,
          interestRate: withInterest ? interestRate : 0,
          withInterest: withInterest
        };
        
        // إضافة القسط إلى مصفوفة الأقساط
        investor.installments.push(installmentData);
      }
      
      // إضافة قسط رئيسي لتجميع الأقساط الشهرية
      const mainInstallmentData = {
        id: mainInstallmentId,
        description: description,
        amount: totalAmount,
        principalAmount: principalAmount,
        interestAmount: withInterest ? (totalAmount - principalAmount) : 0,
        dueDate: dueDate,
        notes: notes,
        priority: priority,
        installedDate: installedDate,
        status: 'parent',
        paidAmount: 0,
        remainingAmount: totalAmount,
        interestRate: withInterest ? interestRate : 0,
        withInterest: withInterest,
        monthlyPayment: totalAmount / months,
        totalParts: months,
        isParent: true
      };
      
      // البحث عن القسط الرئيسي وحذفه إذا كان موجوداً
      const mainInstallmentIndex = investor.installments.findIndex(inst => inst.id === mainInstallmentId);
      if (mainInstallmentIndex >= 0) {
        investor.installments.splice(mainInstallmentIndex, 1);
      }
      
      // إضافة القسط الرئيسي
      investor.installments.push(mainInstallmentData);
      
      alert(`تم حفظ ${months} قسط شهري بنجاح`);
    } else {
      console.log("إنشاء قسط واحد فقط...");
      
      // قسط واحد فقط
      const installmentData = {
        id: mainInstallmentId,
        description: description,
        amount: totalAmount,
        principalAmount: principalAmount,
        interestAmount: withInterest ? (totalAmount - principalAmount) : 0,
        dueDate: dueDate,
        notes: notes,
        priority: priority,
        installedDate: installedDate,
        status: 'active',
        paidAmount: 0,
        remainingAmount: totalAmount,
        interestRate: withInterest ? interestRate : 0,
        withInterest: withInterest
      };
      
      // البحث عن القسط إذا كان موجوداً
      const existingIndex = investor.installments.findIndex(inst => inst.id === mainInstallmentId);
      
      if (existingIndex >= 0) {
        // تحديث القسط الموجود
        investor.installments[existingIndex] = {
          ...investor.installments[existingIndex],
          ...installmentData
        };
      } else {
        // إضافة قسط جديد
        investor.installments.push(installmentData);
      }
      
      alert('تم حفظ القسط بنجاح');
    }
    
    // حفظ البيانات
    if (typeof window.saveData === 'function') {
      window.saveData();
    } else {
      // محاولة حفظ البيانات يدوياً
      localStorage.setItem('investors', JSON.stringify(window.investors));
    }
    
    // حفظ البيانات في مخزن خاص للأقساط
    try {
      // تجميع بيانات الأقساط من جميع المستثمرين
      const allInstallments = [];
      
      window.investors.forEach(investor => {
        if (investor.installments && Array.isArray(investor.installments)) {
          // حفظ رقم معرف المستثمر مع كل قسط
          const investorInstallments = investor.installments.map(installment => ({
            ...installment,
            investorId: investor.id,
            investorName: investor.name
          }));
          
          allInstallments.push(...investorInstallments);
        }
      });
      
      // حفظ كل الأقساط في مخزن منفصل
      localStorage.setItem('installmentsData', JSON.stringify(allInstallments));
    } catch (error) {
      console.error("خطأ في حفظ بيانات الأقساط المنفصلة:", error);
    }
    
    // إغلاق النافذة
    closeModal('add-installment-modal');
    
    // تحديث واجهة المستخدم
    if (document.querySelector('#installments-page.active')) {
      if (typeof window.renderInstallmentsTable === 'function') {
        window.renderInstallmentsTable();
      }
      
      if (typeof window.updateInstallmentsDashboard === 'function') {
        window.updateInstallmentsDashboard();
      }
    }
    
    console.log("تم حفظ القسط بنجاح!");
    
  } catch (error) {
    console.error("حدث خطأ أثناء حفظ القسط:", error);
    alert("حدث خطأ أثناء حفظ القسط. يرجى المحاولة مرة أخرى.");
  }
}

/**
 * إغلاق نافذة منبثقة
 * وظيفة مساعدة لإغلاق النوافذ
 * @param {string} modalId - معرف النافذة
 */
function closeModal(modalId) {
  const modalOverlay = document.getElementById(modalId);
  if (!modalOverlay) return;
  
  modalOverlay.classList.remove('active');
  setTimeout(() => {
    if (modalOverlay.parentNode) {
      modalOverlay.parentNode.removeChild(modalOverlay);
    }
  }, 300);
}

// تطبيق الإصلاح مباشرة
fixSaveButtonIssue();