/**
 * التحديث الشامل لنظام الأقساط
 * يحل مشكلة عدم حفظ البيانات عند تحديث الصفحة ويضيف نظام الفائدة والتقسيط الشهري
 * 
 * المميزات الجديدة:
 * 1. تحسين حفظ البيانات في التخزين المحلي
 * 2. إضافة نظام حساب الفائدة للأقساط
 * 3. إمكانية تقسيط المبلغ على عدد شهور
 * 4. عرض جدول تفاصيل الأقساط الشهرية
 */

// تنفيذ التحديث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // التأكد من تحميل كافة العناصر
  setTimeout(() => {
    console.log("بدء تنفيذ تحديث نظام الأقساط الشامل...");
    
    // تحسين تخزين البيانات
    enhanceStorageSystem();
    
    // تحديث نافذة الأقساط
    updateInstallmentModal();
    
    // تحديث صفحة الأقساط
    enhanceInstallmentsPage();
    
    // تحديث واجهة عرض تفاصيل المستثمر
    enhanceInvestorDetailsView();
    
    console.log("اكتمل تنفيذ تحديث نظام الأقساط الشامل");
  }, 1500);
});

/**
 * تحسين نظام تخزين البيانات
 * يحل مشكلة فقدان البيانات عند تحديث الصفحة
 */
function enhanceStorageSystem() {
  console.log("تحسين نظام تخزين البيانات...");
  
  // التحقق من وجود وظيفة حفظ البيانات الأصلية
  if (typeof window.saveData !== 'function') {
    console.error("وظيفة حفظ البيانات غير موجودة!");
    return;
  }
  
  // احتفظ بالدالة الأصلية للحفظ
  const originalSaveData = window.saveData;
  
  // استبدال دالة الحفظ بنسخة محسنة
  window.saveData = function() {
    // استدعاء الدالة الأصلية
    const result = originalSaveData.apply(this, arguments);
    
    try {
      // حفظ محدد للأقساط في مخزن محلي منفصل لضمان عدم فقدانها
      if (Array.isArray(window.investors)) {
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
        console.log(`تم حفظ ${allInstallments.length} قسط في التخزين المحلي المنفصل`);
      }
      
      // حفظ تاريخ آخر تحديث
      localStorage.setItem('installmentsLastUpdate', new Date().toISOString());
    } catch (error) {
      console.error("خطأ في حفظ بيانات الأقساط المنفصلة:", error);
    }
    
    return result;
  };
  
  // استبدال دالة تحميل البيانات لاستعادة الأقساط المحفوظة
  if (typeof window.loadData === 'function') {
    const originalLoadData = window.loadData;
    
    window.loadData = function() {
      // استدعاء الدالة الأصلية
      const result = originalLoadData.apply(this, arguments);
      
      try {
        // التحقق من وجود بيانات الأقساط المحفوظة
        const savedInstallmentsData = localStorage.getItem('installmentsData');
        if (savedInstallmentsData) {
          const allInstallments = JSON.parse(savedInstallmentsData);
          console.log(`تم استرجاع ${allInstallments.length} قسط من التخزين المحلي المنفصل`);
          
          // إعادة ربط الأقساط بالمستثمرين
          if (Array.isArray(window.investors) && allInstallments.length > 0) {
            // إنشاء نسخة من بيانات المستثمرين
            const investorsCopy = [...window.investors];
            
            // تهيئة مصفوفة الأقساط للمستثمرين إذا لم تكن موجودة
            investorsCopy.forEach(investor => {
              if (!investor.installments) {
                investor.installments = [];
              }
            });
            
            // تجميع الأقساط لكل مستثمر
            allInstallments.forEach(installment => {
              const { investorId } = installment;
              if (!investorId) return;
              
              // البحث عن المستثمر
              const investor = investorsCopy.find(inv => inv.id === investorId);
              if (!investor) return;
              
              // التأكد من عدم وجود نسخة مكررة من القسط
              const existingIndex = investor.installments.findIndex(inst => inst.id === installment.id);
              
              // إزالة بعض البيانات الإضافية قبل الإضافة
              const { investorId: _, investorName: __, ...installmentData } = installment;
              
              if (existingIndex >= 0) {
                // تحديث القسط الموجود
                investor.installments[existingIndex] = installmentData;
              } else {
                // إضافة القسط الجديد
                investor.installments.push(installmentData);
              }
            });
            
            // تحديث مصفوفة المستثمرين الأصلية
            window.investors = investorsCopy;
            
            console.log("تم إعادة ربط الأقساط بالمستثمرين بنجاح");
          }
        }
      } catch (error) {
        console.error("خطأ في استرجاع بيانات الأقساط المنفصلة:", error);
      }
      
      return result;
    };
    
    // تنفيذ تحميل البيانات فوراً لاستعادة الأقساط
    window.loadData();
  }
  
  console.log("تم تحسين نظام تخزين البيانات بنجاح");
}

/**
 * تحديث نافذة إضافة/تعديل الأقساط
 * إضافة خيارات حساب الفائدة والتقسيط الشهري
 */
function updateInstallmentModal() {
  console.log("تحديث نافذة الأقساط...");
  
  // التحقق من وجود نافذة الأقساط
  const modalElement = document.getElementById('add-installment-modal');
  if (!modalElement) {
    // إنشاء نافذة الأقساط إذا لم تكن موجودة
    createInstallmentModal();
  } else {
    // تحديث النافذة الموجودة
    updateExistingInstallmentModal(modalElement);
  }
  
  // إضافة مستمعي الأحداث للنافذة
  setupInstallmentModalEvents();
  
  console.log("تم تحديث نافذة الأقساط بنجاح");
}

/**
 * إنشاء نافذة الأقساط المحدثة
 */
function createInstallmentModal() {
  const modalElement = document.createElement('div');
  modalElement.className = 'modal-overlay';
  modalElement.id = 'add-installment-modal';
  
  modalElement.innerHTML = `
    <div class="modal animate__animated animate__fadeInUp">
      <div class="modal-header">
        <h3 class="modal-title" id="installment-modal-title">إضافة قسط جديد</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <form id="installment-form">
          <input type="hidden" id="installment-id" value="">
          <input type="hidden" id="installment-investor-id" value="">
          
          <div class="form-group" id="investor-select-container">
            <label class="form-label">المستثمر</label>
            <select class="form-select" id="installment-investor" required>
              <option value="">اختر المستثمر</option>
              <!-- سيتم ملؤها ديناميكياً -->
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">وصف القسط</label>
            <input type="text" class="form-input" id="installment-description" placeholder="مثال: قسط السيارة، قسط القرض، إلخ" required>
          </div>
          
          <div class="grid-cols-2">
            <div class="form-group">
              <label class="form-label">المبلغ الأساسي</label>
              <input type="number" class="form-input" id="installment-principal-amount" min="1" step="1000" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">تاريخ الاستحقاق الأول</label>
              <input type="date" class="form-input" id="installment-due-date" required>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">خيارات التقسيط</label>
            <div class="installment-options">
              <div class="option-group">
                <label>
                  <input type="checkbox" id="installment-with-interest" checked>
                  <span>إضافة فائدة للقسط</span>
                </label>
              </div>
              
              <div class="interest-options">
                <div class="form-group">
                  <label class="form-label">نسبة الفائدة (%)</label>
                  <input type="number" class="form-input" id="installment-interest-rate" value="4" min="0" max="100" step="0.5">
                </div>
              </div>
              
              <div class="option-group">
                <label>
                  <input type="checkbox" id="installment-monthly-payments" checked>
                  <span>تقسيط شهري</span>
                </label>
              </div>
              
              <div class="monthly-options">
                <div class="form-group">
                  <label class="form-label">عدد الأشهر</label>
                  <input type="number" class="form-input" id="installment-months" value="12" min="1" max="120">
                </div>
                
                <div class="calculation-result">
                  <div class="result-item">
                    <label>إجمالي المبلغ مع الفائدة:</label>
                    <span id="total-with-interest">0 دينار</span>
                  </div>
                  <div class="result-item">
                    <label>القسط الشهري:</label>
                    <span id="monthly-payment">0 دينار</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">ملاحظات</label>
            <textarea class="form-input" id="installment-notes" rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <div class="form-check">
              <input type="checkbox" id="installment-priority" value="high">
              <label for="installment-priority">قسط ذو أولوية عالية</label>
            </div>
          </div>
          
          <div id="installment-schedule-preview" class="installment-schedule-preview"></div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline modal-close-btn">إلغاء</button>
        <button class="btn btn-primary" id="calculate-installment-btn">حساب التقسيط</button>
        <button class="btn btn-primary" id="save-installment-btn">حفظ</button>
      </div>
    </div>
  `;
  
  // إضافة النافذة للصفحة
  document.body.appendChild(modalElement);
  
  // إضافة أنماط CSS للنافذة
  addInstallmentModalStyles();
}

/**
 * تحديث نافذة الأقساط الموجودة
 * @param {HTMLElement} modalElement - عنصر النافذة
 */
function updateExistingInstallmentModal(modalElement) {
  // التحقق من وجود عناصر النافذة الجديدة
  const hasNewElements = !!modalElement.querySelector('#installment-principal-amount');
  
  if (hasNewElements) {
    // النافذة محدثة بالفعل
    return;
  }
  
  // الحصول على محتوى النموذج
  const form = modalElement.querySelector('#installment-form');
  if (!form) return;
  
  // الاحتفاظ بالعناصر المهمة الموجودة
  const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
  const investorSelect = form.querySelector('#investor-select-container');
  const description = form.querySelector('#installment-description');
  const dueDate = form.querySelector('#installment-due-date');
  const notes = form.querySelector('#installment-notes');
  const priority = form.querySelector('#installment-priority');
  
  // الحصول على قيمة المبلغ الحالية إذا وجدت
  const currentAmountInput = form.querySelector('#installment-amount');
  const currentAmount = currentAmountInput ? currentAmountInput.value : '';
  
  // إعادة بناء محتوى النموذج
  form.innerHTML = '';
  
  // إعادة إضافة العناصر المحفوظة
  hiddenInputs.forEach(input => form.appendChild(input.cloneNode(true)));
  if (investorSelect) form.appendChild(investorSelect.cloneNode(true));
  if (description) form.appendChild(description.parentNode.cloneNode(true));
  
  // إضافة العناصر الجديدة
  const newElements = document.createElement('div');
  newElements.innerHTML = `
    <div class="grid-cols-2">
      <div class="form-group">
        <label class="form-label">المبلغ الأساسي</label>
        <input type="number" class="form-input" id="installment-principal-amount" min="1" step="1000" value="${currentAmount}" required>
      </div>
      
      <div class="form-group">
        <label class="form-label">تاريخ الاستحقاق الأول</label>
        <input type="date" class="form-input" id="installment-due-date" required>
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label">خيارات التقسيط</label>
      <div class="installment-options">
        <div class="option-group">
          <label>
            <input type="checkbox" id="installment-with-interest" checked>
            <span>إضافة فائدة للقسط</span>
          </label>
        </div>
        
        <div class="interest-options">
          <div class="form-group">
            <label class="form-label">نسبة الفائدة (%)</label>
            <input type="number" class="form-input" id="installment-interest-rate" value="4" min="0" max="100" step="0.5">
          </div>
        </div>
        
        <div class="option-group">
          <label>
            <input type="checkbox" id="installment-monthly-payments" checked>
            <span>تقسيط شهري</span>
          </label>
        </div>
        
        <div class="monthly-options">
          <div class="form-group">
            <label class="form-label">عدد الأشهر</label>
            <input type="number" class="form-input" id="installment-months" value="12" min="1" max="120">
          </div>
          
          <div class="calculation-result">
            <div class="result-item">
              <label>إجمالي المبلغ مع الفائدة:</label>
              <span id="total-with-interest">0 دينار</span>
            </div>
            <div class="result-item">
              <label>القسط الشهري:</label>
              <span id="monthly-payment">0 دينار</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label">ملاحظات</label>
      <textarea class="form-input" id="installment-notes" rows="3"></textarea>
    </div>
    
    <div class="form-group">
      <div class="form-check">
        <input type="checkbox" id="installment-priority" value="high">
        <label for="installment-priority">قسط ذو أولوية عالية</label>
      </div>
    </div>
    
    <div id="installment-schedule-preview" class="installment-schedule-preview"></div>
  `;
  
  while (newElements.firstChild) {
    form.appendChild(newElements.firstChild);
  }
  
  // إضافة عنصر تاريخ جديد وملئ قيمته
  const newDueDate = form.querySelector('#installment-due-date');
  if (newDueDate && dueDate) {
    newDueDate.value = dueDate.value;
  }
  
  // استعادة قيمة الملاحظات
  const newNotes = form.querySelector('#installment-notes');
  if (newNotes && notes) {
    newNotes.value = notes.value;
  }
  
  // استعادة قيمة الأولوية
  const newPriority = form.querySelector('#installment-priority');
  if (newPriority && priority) {
    newPriority.checked = priority.checked;
  }
  
  // إضافة زر حساب التقسيط للنافذة
  const footer = modalElement.querySelector('.modal-footer');
  if (footer && !footer.querySelector('#calculate-installment-btn')) {
    const calculateBtn = document.createElement('button');
    calculateBtn.className = 'btn btn-primary';
    calculateBtn.id = 'calculate-installment-btn';
    calculateBtn.textContent = 'حساب التقسيط';
    
    // إضافة الزر قبل زر الحفظ
    const saveBtn = footer.querySelector('#save-installment-btn');
    if (saveBtn) {
      footer.insertBefore(calculateBtn, saveBtn);
    } else {
      footer.appendChild(calculateBtn);
    }
  }
  
  // إضافة أنماط CSS للنافذة
  addInstallmentModalStyles();
}

/**
 * إضافة أنماط CSS للنافذة المحدثة
 */
function addInstallmentModalStyles() {
  // التحقق من وجود أنماط مسبقة
  if (document.getElementById('installment-modal-styles')) {
    return;
  }
  
  // إنشاء عنصر نمط جديد
  const styleElement = document.createElement('style');
  styleElement.id = 'installment-modal-styles';
  
  // إضافة أنماط CSS
  styleElement.textContent = `
    /* أنماط خيارات التقسيط */
    .installment-options {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .option-group {
      margin-bottom: 12px;
    }
    
    .option-group label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    
    .option-group input[type="checkbox"] {
      margin-left: 8px;
    }
    
    .interest-options,
    .monthly-options {
      padding: 8px 16px;
      border-right: 2px solid #e2e8f0;
      margin: 8px 0 16px;
    }
    
    .calculation-result {
      background-color: #eff6ff;
      border-radius: 6px;
      padding: 12px;
      margin-top: 12px;
    }
    
    .result-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .result-item:last-child {
      margin-bottom: 0;
      font-weight: bold;
    }
    
    /* أنماط جدول التقسيط */
    .installment-schedule-preview {
      margin-top: 20px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .installment-schedule-title {
      font-weight: bold;
      margin-bottom: 8px;
      color: #3b82f6;
    }
    
    .installment-schedule-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .installment-schedule-table th,
    .installment-schedule-table td {
      padding: 8px;
      text-align: right;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.9em;
    }
    
    .installment-schedule-table th {
      background-color: #f1f5f9;
      font-weight: 600;
    }
    
    .installment-schedule-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    
    /* تغيير حجم النافذة */
    #add-installment-modal .modal {
      max-width: 650px;
      max-height: 90vh;
    }
    
    #add-installment-modal .modal-body {
      max-height: calc(90vh - 120px);
      overflow-y: auto;
    }
  `;
  
  // إضافة عنصر النمط إلى رأس الصفحة
  document.head.appendChild(styleElement);
  console.log('تم إضافة أنماط CSS لنافذة الأقساط');
}

/**
 * إضافة مستمعي الأحداث لنافذة الأقساط
 */
function setupInstallmentModalEvents() {
  // إضافة مستمعي الأحداث للتحقق من خيارات التقسيط
  const withInterestCheckbox = document.getElementById('installment-with-interest');
  const monthlyPaymentsCheckbox = document.getElementById('installment-monthly-payments');
  const interestOptions = document.querySelector('.interest-options');
  const monthlyOptions = document.querySelector('.monthly-options');
  
  // تعطيل/تفعيل خيارات الفائدة
  if (withInterestCheckbox && interestOptions) {
    withInterestCheckbox.addEventListener('change', function() {
      interestOptions.style.display = this.checked ? 'block' : 'none';
      updateCalculation();
    });
    
    // تعيين الحالة الأولية
    interestOptions.style.display = withInterestCheckbox.checked ? 'block' : 'none';
  }
  
  // تعطيل/تفعيل خيارات التقسيط الشهري
  if (monthlyPaymentsCheckbox && monthlyOptions) {
    monthlyPaymentsCheckbox.addEventListener('change', function() {
      monthlyOptions.style.display = this.checked ? 'block' : 'none';
      updateCalculation();
    });
    
    // تعيين الحالة الأولية
    monthlyOptions.style.display = monthlyPaymentsCheckbox.checked ? 'block' : 'none';
  }
  
  // إضافة مستمع لزر حساب التقسيط
  const calculateBtn = document.getElementById('calculate-installment-btn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', function(e) {
      e.preventDefault();
      updateCalculation();
      generateInstallmentSchedule();
    });
  }
  
  // إضافة مستمعي الأحداث للحقول التي تؤثر على الحساب
  const principalInput = document.getElementById('installment-principal-amount');
  const interestRateInput = document.getElementById('installment-interest-rate');
  const monthsInput = document.getElementById('installment-months');
  
  if (principalInput) {
    principalInput.addEventListener('input', updateCalculation);
  }
  
  if (interestRateInput) {
    interestRateInput.addEventListener('input', updateCalculation);
  }
  
  if (monthsInput) {
    monthsInput.addEventListener('input', updateCalculation);
  }
  
  // إضافة مستمع لزر الحفظ
  const saveBtn = document.getElementById('save-installment-btn');
  if (saveBtn) {
    // إزالة مستمعي الأحداث السابقة لتجنب التكرار
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    
    newSaveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      saveInstallmentWithSchedule();
    });
  }
  
  // التنفيذ الأولي لتحديث الحساب
  updateCalculation();
}

/**
 * تحديث حساب التقسيط وعرض النتائج
 */
function updateCalculation() {
  const principalInput = document.getElementById('installment-principal-amount');
  const withInterestCheckbox = document.getElementById('installment-with-interest');
  const interestRateInput = document.getElementById('installment-interest-rate');
  const monthlyPaymentsCheckbox = document.getElementById('installment-monthly-payments');
  const monthsInput = document.getElementById('installment-months');
  const totalWithInterestElement = document.getElementById('total-with-interest');
  const monthlyPaymentElement = document.getElementById('monthly-payment');
  
  if (!principalInput || !withInterestCheckbox || !interestRateInput || 
      !monthlyPaymentsCheckbox || !monthsInput || 
      !totalWithInterestElement || !monthlyPaymentElement) {
    return;
  }
  
  // الحصول على القيم
  const principal = parseFloat(principalInput.value) || 0;
  const withInterest = withInterestCheckbox.checked;
  const interestRate = parseFloat(interestRateInput.value) || 0;
  const monthlyPayments = monthlyPaymentsCheckbox.checked;
  const months = parseInt(monthsInput.value) || 1;
  
  // حساب إجمالي المبلغ مع الفائدة
  let totalWithInterest = principal;
  if (withInterest) {
    totalWithInterest = principal * (1 + (interestRate / 100));
  }
  
  // حساب القسط الشهري
  let monthlyPayment = totalWithInterest;
  if (monthlyPayments && months > 0) {
    monthlyPayment = totalWithInterest / months;
  }
  
  // عرض النتائج
  totalWithInterestElement.textContent = formatCurrency(totalWithInterest);
  monthlyPaymentElement.textContent = formatCurrency(monthlyPayment);
}

/**
 * إنشاء جدول التقسيط الشهري وعرضه
 */
function generateInstallmentSchedule() {
  const principalInput = document.getElementById('installment-principal-amount');
  const withInterestCheckbox = document.getElementById('installment-with-interest');
  const interestRateInput = document.getElementById('installment-interest-rate');
  const monthlyPaymentsCheckbox = document.getElementById('installment-monthly-payments');
  const monthsInput = document.getElementById('installment-months');
  const dueDateInput = document.getElementById('installment-due-date');
  const schedulePreview = document.getElementById('installment-schedule-preview');
  
  if (!principalInput || !withInterestCheckbox || !interestRateInput || 
      !monthlyPaymentsCheckbox || !monthsInput || !dueDateInput || !schedulePreview) {
    return;
  }
  
  // الحصول على القيم
  const principal = parseFloat(principalInput.value) || 0;
  const withInterest = withInterestCheckbox.checked;
  const interestRate = parseFloat(interestRateInput.value) || 0;
  const monthlyPayments = monthlyPaymentsCheckbox.checked;
  const months = parseInt(monthsInput.value) || 1;
  const startDate = new Date(dueDateInput.value);
  
  // التحقق من صحة التاريخ
  if (isNaN(startDate.getTime())) {
    schedulePreview.innerHTML = '<div class="alert alert-warning">يرجى تحديد تاريخ الاستحقاق الأول صحيح</div>';
    return;
  }
  
  // التحقق من القيم
  if (principal <= 0) {
    schedulePreview.innerHTML = '<div class="alert alert-warning">يرجى إدخال المبلغ الأساسي</div>';
    return;
  }
  
  // حساب إجمالي المبلغ مع الفائدة
  let totalWithInterest = principal;
  if (withInterest) {
    totalWithInterest = principal * (1 + (interestRate / 100));
  }
  
  // إنشاء جدول الأقساط
  const scheduleItems = [];
  
  if (monthlyPayments && months > 0) {
    // تقسيط شهري
    const monthlyPayment = totalWithInterest / months;
    
    for (let i = 0; i < months; i++) {
      // حساب تاريخ الاستحقاق لهذا القسط
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      scheduleItems.push({
        index: i + 1,
        dueDate: dueDate,
        amount: monthlyPayment,
        remainingAmount: monthlyPayment
      });
    }
  } else {
    // قسط واحد
    scheduleItems.push({
      index: 1,
      dueDate: startDate,
      amount: totalWithInterest,
      remainingAmount: totalWithInterest
    });
  }
  
  // عرض جدول الأقساط
  schedulePreview.innerHTML = `
    <div class="installment-schedule-title">جدول التقسيط</div>
    <table class="installment-schedule-table">
      <thead>
        <tr>
          <th>القسط</th>
          <th>تاريخ الاستحقاق</th>
          <th>المبلغ</th>
        </tr>
      </thead>
      <tbody>
        ${scheduleItems.map(item => `
          <tr>
            <td>${item.index}</td>
            <td>${formatDate(item.dueDate)}</td>
            <td>${formatCurrency(item.amount)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2"><strong>المجموع</strong></td>
          <td><strong>${formatCurrency(totalWithInterest)}</strong></td>
        </tr>
      </tfoot>
    </table>
  `;
  
  // حفظ بيانات الجدول في عنصر مخفي للاستخدام لاحقاً
  const scheduleDataElement = document.createElement('input');
  scheduleDataElement.type = 'hidden';
  scheduleDataElement.id = 'installment-schedule-data';
  scheduleDataElement.value = JSON.stringify(scheduleItems);
  
  // إزالة أي عنصر سابق
  const existingData = document.getElementById('installment-schedule-data');
  if (existingData) {
    existingData.remove();
  }
  
  schedulePreview.appendChild(scheduleDataElement);
}

/**
 * حفظ قسط مع جدول التقسيط الشهري
 */
function saveInstallmentWithSchedule() {
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
    showNotification('الرجاء اختيار المستثمر', 'error');
    return;
  }
  
  // البحث عن المستثمر
  const investor = window.investors.find(inv => inv.id === investorId);
  if (!investor) {
    showNotification('لم يتم العثور على بيانات المستثمر', 'error');
    return;
  }
  
  // جمع باقي البيانات
  const description = document.getElementById('installment-description').value;
  const principalAmount = parseFloat(document.getElementById('installment-principal-amount').value);
  const withInterest = document.getElementById('installment-with-interest').checked;
  const interestRate = parseFloat(document.getElementById('installment-interest-rate').value);
  const monthlyPayments = document.getElementById('installment-monthly-payments').checked;
  const months = parseInt(document.getElementById('installment-months').value);
  const dueDate = document.getElementById('installment-due-date').value;
  const notes = document.getElementById('installment-notes').value;
  const priority = document.getElementById('installment-priority').checked ? 'high' : 'normal';
  
  // التحقق من البيانات الإلزامية
  if (!description || isNaN(principalAmount) || principalAmount <= 0 || !dueDate) {
    showNotification('الرجاء ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
    return;
  }
  
  // حساب المبلغ الإجمالي
  let totalAmount = principalAmount;
  if (withInterest) {
    totalAmount = principalAmount * (1 + (interestRate / 100));
  }
  
  // جلب بيانات جدول التقسيط
  const scheduleDataElement = document.getElementById('installment-schedule-data');
  let scheduleItems = [];
  
  if (scheduleDataElement && scheduleDataElement.value) {
    try {
      scheduleItems = JSON.parse(scheduleDataElement.value);
    } catch (error) {
      console.error("خطأ في قراءة بيانات جدول التقسيط:", error);
    }
  } else {
    // توليد جدول تقسيط افتراضي إذا لم يتم توليده مسبقاً
    generateInstallmentSchedule();
    
    const updatedDataElement = document.getElementById('installment-schedule-data');
    if (updatedDataElement && updatedDataElement.value) {
      try {
        scheduleItems = JSON.parse(updatedDataElement.value);
      } catch (error) {
        console.error("خطأ في قراءة بيانات جدول التقسيط المحدث:", error);
      }
    }
  }
  
  // التأكد من وجود مصفوفة الأقساط
  if (!investor.installments) {
    investor.installments = [];
  }
  
  // إنشاء مُعرِّف للقسط الرئيسي إذا لم يكن موجوداً
  const mainInstallmentId = installmentId || `inst-${Date.now()}`;
  
  // إنشاء الأقساط
  if (monthlyPayments && months > 0 && scheduleItems.length > 0) {
    // إنشاء أقساط شهرية متعددة
    const installedDate = new Date().toISOString();
    
    // حذف الأقساط القديمة إذا كانت موجودة
    if (installmentId) {
      investor.installments = investor.installments.filter(inst => 
        !inst.id.startsWith(`${mainInstallmentId}-part-`));
    }
    
    // إضافة الأقساط الشهرية
    scheduleItems.forEach((item, index) => {
      const installmentPartId = `${mainInstallmentId}-part-${index + 1}`;
      const installmentDueDate = typeof item.dueDate === 'object' ? 
        item.dueDate.toISOString().split('T')[0] : item.dueDate;
      
      // البحث عن القسط إذا كان موجوداً
      const existingIndex = investor.installments.findIndex(inst => inst.id === installmentPartId);
      
      const installmentData = {
        id: installmentPartId,
        description: `${description} - القسط ${index + 1} من ${months}`,
        amount: item.amount,
        principalAmount: principalAmount / months,
        interestAmount: withInterest ? (item.amount - (principalAmount / months)) : 0,
        dueDate: installmentDueDate,
        notes: notes,
        priority: priority,
        parentId: mainInstallmentId,
        partIndex: index + 1,
        totalParts: months,
        installedDate: installedDate,
        status: 'active',
        paidAmount: 0,
        remainingAmount: item.amount,
        interestRate: withInterest ? interestRate : 0,
        withInterest: withInterest
      };
      
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
    });
    
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
    
    // البحث عن القسط الرئيسي إذا كان موجوداً
    const mainInstallmentIndex = investor.installments.findIndex(inst => 
      inst.id === mainInstallmentId && inst.isParent);
      
    if (mainInstallmentIndex >= 0) {
      // تحديث القسط الرئيسي
      investor.installments[mainInstallmentIndex] = {
        ...investor.installments[mainInstallmentIndex],
        ...mainInstallmentData
      };
    } else {
      // إضافة قسط رئيسي جديد
      investor.installments.push(mainInstallmentData);
    }
    
    showNotification(`تم حفظ ${months} قسط شهري بنجاح`, 'success');
  } else {
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
      installedDate: new Date().toISOString(),
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
    
    showNotification('تم حفظ القسط بنجاح', 'success');
  }
  
  // حفظ البيانات
  if (typeof window.saveData === 'function') {
    window.saveData();
  }
  
  // إغلاق النافذة
  closeModal('add-installment-modal');
  
  // تحديث واجهة المستخدم
  if (document.querySelector('#installments-page.active')) {
    renderInstallmentsTable();
    updateInstallmentsDashboard();
  }
}

/**
 * تحديث صفحة الأقساط
 * إضافة تحسينات على عرض جدول الأقساط وتفاصيل الأقساط
 */
function enhanceInstallmentsPage() {
  console.log("تحديث صفحة الأقساط...");
  
  // تحديث دالة عرض جدول الأقساط
  enhanceRenderInstallmentsTable();
  
  // تعديل أزرار التصفية في صفحة الأقساط
  setupFilterButtons();
  
  // إضافة زر إضافة قسط جديد
  setupAddInstallmentButton();
  
  console.log("تم تحديث صفحة الأقساط بنجاح");
}

/**
 * تحسين دالة عرض جدول الأقساط
 */
function enhanceRenderInstallmentsTable() {
  // استبدال دالة عرض جدول الأقساط الأصلية بنسخة محسنة
  window.renderInstallmentsTable = function(filter = 'all') {
    const tableBody = document.querySelector('#installments-table tbody');
    if (!tableBody) return;
    
    // تجميع جميع الأقساط من جميع المستثمرين
    let allInstallments = [];
    
    if (Array.isArray(window.investors)) {
      window.investors.forEach(investor => {
        if (!investor.installments) return;
        
        // تجاهل الأقساط الرئيسية (الأقساط التي لها أقساط فرعية)
        const investorInstallments = investor.installments
          .filter(installment => installment.status !== 'paid' && installment.status !== 'parent')
          .map(installment => ({
            ...installment,
            investorId: investor.id,
            investorName: investor.name,
            installmentType: installment.parentId ? 'part' : 'single'
          }));
          
        allInstallments = allInstallments.concat(investorInstallments);
      });
    }
    
    // تصفية الأقساط حسب الفلتر المحدد
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filteredInstallments = allInstallments.filter(installment => {
      // تحويل تاريخ الاستحقاق إلى كائن تاريخ
      const dueDate = new Date(installment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      switch (filter) {
        case 'overdue':
          return dueDate < today;
        case 'today':
          return dueDate.getTime() === today.getTime();
        case 'upcoming':
          return dueDate > today;
        case 'parent':
          return installment.isParent;
        default:
          return true;
      }
    });
    
    // ترتيب الأقساط حسب تاريخ الاستحقاق
    filteredInstallments.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA - dateB;
    });
    
    // تفريغ الجدول
    tableBody.innerHTML = '';
    
    // إذا لم توجد أقساط، نعرض رسالة
    if (filteredInstallments.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center">لا توجد أقساط ${getFilterText(filter)}</td>
        </tr>
      `;
      return;
    }
    
    // إضافة الأقساط إلى الجدول
    filteredInstallments.forEach(installment => {
      // تحديد حالة القسط
      const dueDate = new Date(installment.dueDate);
      const daysRemaining = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
      
      let statusClass = '';
      let statusText = '';
      
      if (daysRemaining < 0) {
        statusClass = 'status-overdue';
        statusText = `متأخر (${Math.abs(daysRemaining)} يوم)`;
      } else if (daysRemaining === 0) {
        statusClass = 'status-today';
        statusText = 'مستحق اليوم';
      } else {
        statusClass = 'status-upcoming';
        statusText = `بعد ${daysRemaining} يوم`;
      }
      
      // تحديد عنوان القسط
      let title = installment.description;
      if (installment.installmentType === 'part' && installment.partIndex && installment.totalParts) {
        title = `${title} (${installment.partIndex}/${installment.totalParts})`;
      }
      
      const row = document.createElement('tr');
      row.className = statusClass;
      
      // عرض معلومات الفائدة إذا كانت موجودة
      const interestInfo = installment.withInterest ? 
        `<div class="interest-info">الفائدة: ${installment.interestRate}% (${formatCurrency(installment.interestAmount)})</div>` : '';
      
      row.innerHTML = `
        <td>
          <div class="investor-info">
            <div class="investor-avatar">${installment.investorName.charAt(0)}</div>
            <div>
              <div class="investor-name">${installment.investorName}</div>
              <div class="investor-id">${installment.investorId}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="installment-title">${title}</div>
          ${interestInfo}
        </td>
        <td>${formatDate(installment.dueDate)}</td>
        <td>${formatCurrency(installment.amount)}</td>
        <td>${formatCurrency(installment.remainingAmount)}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td class="installment-category">
          ${getInstallmentCategoryBadge(installment)}
        </td>
        <td>
          <div class="actions">
            <button class="btn btn-sm btn-success pay-installment-btn" data-investor-id="${installment.investorId}" data-installment-id="${installment.id}">
              <i class="fas fa-coins"></i>
              <span>تسديد</span>
            </button>
            <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${installment.investorId}" data-installment-id="${installment.id}">
              <i class="fas fa-edit"></i>
            </button>
            ${installment.parentId ? `
              <button class="btn btn-sm btn-info view-parent-installment-btn" data-investor-id="${installment.investorId}" data-parent-id="${installment.parentId}">
                <i class="fas fa-search"></i>
              </button>
            ` : ''}
          </div>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    setupInstallmentTableButtonsListeners();
  };
  
  // تحديث دالة updateInstallmentsDashboard لعرض تفاصيل أكثر
  window.updateInstallmentsDashboard = function() {
    // إجمالي الأقساط المستحقة
    let totalDueAmount = 0;
    let totalDueCount = 0;
    
    // إجمالي الأقساط القادمة
    let totalUpcomingAmount = 0;
    let totalUpcomingCount = 0;
    
    // إجمالي الأقساط المدفوعة
    let totalPaidAmount = 0;
    let totalPaidCount = 0;
    
    // إجمالي الفوائد
    let totalInterestAmount = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // حساب الإحصائيات
    if (Array.isArray(window.investors)) {
      window.investors.forEach(investor => {
        if (!investor.installments) return;
        
        investor.installments.forEach(installment => {
          // تجاهل الأقساط الرئيسية
          if (installment.status === 'parent') return;
          
          const dueDate = new Date(installment.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          // إضافة الفوائد للإجمالي
          if (installment.withInterest && installment.interestAmount) {
            totalInterestAmount += installment.interestAmount;
          }
          
          if (installment.status === 'paid') {
            // أقساط مدفوعة
            totalPaidAmount += installment.amount;
            totalPaidCount++;
          } else if (dueDate <= today) {
            // أقساط مستحقة
            totalDueAmount += installment.remainingAmount;
            totalDueCount++;
          } else {
            // أقساط قادمة
            totalUpcomingAmount += installment.remainingAmount;
            totalUpcomingCount++;
          }
        });
      });
    }
    
    // حساب نسبة التحصيل
    const totalInstallments = totalPaidAmount + totalDueAmount + totalUpcomingAmount;
    const collectionRate = totalInstallments > 0 ? (totalPaidAmount / totalInstallments) * 100 : 0;
    
    // تحديث الإحصائيات في لوحة التحكم
    const totalDueEl = document.getElementById('total-due-installments');
    if (totalDueEl) totalDueEl.textContent = formatCurrency(totalDueAmount);
    
    const totalDueCountEl = document.getElementById('total-due-count');
    if (totalDueCountEl) totalDueCountEl.textContent = `${totalDueCount} قسط`;
    
    const totalUpcomingEl = document.getElementById('total-upcoming-installments');
    if (totalUpcomingEl) totalUpcomingEl.textContent = formatCurrency(totalUpcomingAmount);
    
    const totalUpcomingCountEl = document.getElementById('total-upcoming-count');
    if (totalUpcomingCountEl) totalUpcomingCountEl.textContent = `${totalUpcomingCount} قسط`;
    
    const totalPaidEl = document.getElementById('total-paid-installments');
    if (totalPaidEl) totalPaidEl.textContent = formatCurrency(totalPaidAmount);
    
    const totalPaidCountEl = document.getElementById('total-paid-count');
    if (totalPaidCountEl) totalPaidCountEl.textContent = `${totalPaidCount} قسط`;
    
    const collectionRateEl = document.getElementById('collection-rate');
    if (collectionRateEl) collectionRateEl.textContent = `${collectionRate.toFixed(1)}%`;
    
    // إضافة معلومات الفوائد إلى لوحة التحكم
    const interestInfoElement = document.getElementById('total-interest-info');
    if (interestInfoElement) {
      interestInfoElement.textContent = formatCurrency(totalInterestAmount);
    } else {
      // إنشاء عنصر معلومات الفوائد إذا لم يكن موجوداً
      const cardsContainer = document.querySelector('.installments-dashboard .dashboard-cards');
      if (cardsContainer) {
        const interestCard = document.createElement('div');
        interestCard.className = 'card';
        interestCard.innerHTML = `
          <div class="card-pattern">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">إجمالي الفوائد</div>
              <div class="card-value" id="total-interest-info">${formatCurrency(totalInterestAmount)}</div>
              <div class="card-change">
                <span>نسبة الفوائد: ${totalInstallments > 0 ? ((totalInterestAmount / totalInstallments) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
            <div class="card-icon warning">
              <i class="fas fa-percentage"></i>
            </div>
          </div>
        `;
        
        // إضافة البطاقة للوحة
        cardsContainer.appendChild(interestCard);
      }
    }
    
    // تحديث اتجاه نسبة التحصيل
    const collectionTrend = document.getElementById('collection-trend');
    if (collectionTrend) {
      if (collectionRate >= 70) {
        collectionTrend.className = 'fas fa-arrow-up';
        collectionTrend.style.color = '#10b981';
      } else if (collectionRate >= 40) {
        collectionTrend.className = 'fas fa-arrow-right';
        collectionTrend.style.color = '#f59e0b';
      } else {
        collectionTrend.className = 'fas fa-arrow-down';
        collectionTrend.style.color = '#ef4444';
      }
    }
  };
  
  // تحسين وظيفة دفع القسط
  window.payInstallment = function(investorId, installmentId) {
    // البحث عن المستثمر والقسط
    const investor = window.investors.find(inv => inv.id === investorId);
    if (!investor || !investor.installments) {
      showNotification('لم يتم العثور على بيانات المستثمر أو الأقساط', 'error');
      return;
    }
    
    const installmentIndex = investor.installments.findIndex(inst => inst.id === installmentId);
    if (installmentIndex === -1) {
      showNotification('لم يتم العثور على بيانات القسط', 'error');
      return;
    }
    
    const installment = investor.installments[installmentIndex];
    
    // التحقق من حالة القسط
    if (installment.status === 'paid') {
      showNotification('هذا القسط مدفوع بالفعل', 'warning');
      return;
    }
    
    // طلب تأكيد دفع القسط
    if (confirm(`هل أنت متأكد من رغبتك في تسديد القسط "${installment.description}" بقيمة ${formatCurrency(installment.remainingAmount)}؟`)) {
      // تسجيل عملية دفع القسط
      const paymentTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        type: 'دفع قسط',
        investorId,
        investorName: investor.name,
        amount: installment.remainingAmount,
        notes: `دفع قسط: ${installment.description}`
      };
      
      // إضافة العملية إلى سجل العمليات
      if (Array.isArray(window.transactions)) {
        window.transactions.push(paymentTransaction);
      }
      
  // تحديث بيانات القسط
      installment.status = 'paid';
      installment.paidAmount = installment.amount;
      installment.remainingAmount = 0;
      installment.paidDate = new Date().toISOString().split('T')[0];
      installment.paymentMethod = 'manual';
      
      // إذا كان القسط جزء من تقسيط، تحديث حالة القسط الرئيسي
      if (installment.parentId) {
        // البحث عن القسط الرئيسي
        const parentInstallment = investor.installments.find(inst => inst.id === installment.parentId);
        if (parentInstallment) {
          // التحقق من جميع الأقساط الفرعية
          const childInstallments = investor.installments.filter(inst => inst.parentId === parentInstallment.id);
          
          // حساب المبلغ المدفوع والمتبقي للقسط الرئيسي
          const totalPaid = childInstallments.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
          const totalRemaining = parentInstallment.amount - totalPaid;
          
          // تحديث القسط الرئيسي
          parentInstallment.paidAmount = totalPaid;
          parentInstallment.remainingAmount = totalRemaining;
          
          // التحقق مما إذا كانت جميع الأقساط الفرعية مدفوعة
          const allPaid = childInstallments.every(inst => inst.status === 'paid');
          if (allPaid) {
            parentInstallment.status = 'paid';
            parentInstallment.paidDate = new Date().toISOString().split('T')[0];
          }
        }
      }
      
      // حفظ البيانات
      if (typeof window.saveData === 'function') {
        window.saveData();
      }
      
      showNotification('تم تسديد القسط بنجاح', 'success');
      
      // تحديث واجهة المستخدم
      if (document.querySelector('#installments-page.active')) {
        renderInstallmentsTable();
        updateInstallmentsDashboard();
      }
    }
  };
  
  // تحسين وظيفة تعديل القسط للتعامل مع الأقساط المقسطة
  window.editInstallment = function(investorId, installmentId) {
    // البحث عن المستثمر والقسط
    const investor = window.investors.find(inv => inv.id === investorId);
    if (!investor || !investor.installments) {
      showNotification('لم يتم العثور على بيانات المستثمر أو الأقساط', 'error');
      return;
    }
    
    // البحث عن القسط (إذا كان القسط فرعياً، نبحث عن القسط الرئيسي)
    const installment = investor.installments.find(inst => inst.id === installmentId);
    if (!installment) {
      showNotification('لم يتم العثور على بيانات القسط', 'error');
      return;
    }
    
    // تحديد القسط المراد تعديله (القسط الرئيسي أو الفردي)
    let targetInstallment = installment;
    
    // إذا كان القسط فرعياً، نبحث عن القسط الرئيسي
    if (installment.parentId) {
      const parentInstallment = investor.installments.find(inst => inst.id === installment.parentId);
      if (parentInstallment) {
        targetInstallment = parentInstallment;
      }
    }
    
    // تعيين العنوان
    const title = document.getElementById('installment-modal-title');
    if (title) {
      title.textContent = 'تعديل القسط';
    }
    
    // ملء النموذج ببيانات القسط
    document.getElementById('installment-id').value = targetInstallment.id;
    document.getElementById('installment-investor-id').value = investorId;
    document.getElementById('installment-description').value = targetInstallment.description || '';
    
    // تحديد نوع القسط (فردي أو مقسط)
    const withInterestCheckbox = document.getElementById('installment-with-interest');
    const monthlyPaymentsCheckbox = document.getElementById('installment-monthly-payments');
    
    // تحديد المبلغ الأساسي
    const principalAmountInput = document.getElementById('installment-principal-amount');
    if (principalAmountInput) {
      principalAmountInput.value = targetInstallment.principalAmount || targetInstallment.amount || 0;
    }
    
    // تحديد حالة الفائدة
    if (withInterestCheckbox) {
      withInterestCheckbox.checked = targetInstallment.withInterest || false;
    }
    
    // تحديد قيمة الفائدة
    const interestRateInput = document.getElementById('installment-interest-rate');
    if (interestRateInput) {
      interestRateInput.value = targetInstallment.interestRate || 0;
    }
    
    // تحديد حالة التقسيط الشهري
    if (monthlyPaymentsCheckbox) {
      monthlyPaymentsCheckbox.checked = targetInstallment.isParent || false;
    }
    
    // تحديد عدد الأشهر
    const monthsInput = document.getElementById('installment-months');
    if (monthsInput) {
      monthsInput.value = targetInstallment.totalParts || 1;
    }
    
    // تحديد تاريخ الاستحقاق
    const dueDateInput = document.getElementById('installment-due-date');
    if (dueDateInput) {
      dueDateInput.value = targetInstallment.dueDate || '';
    }
    
    // تحديد الملاحظات
    const notesInput = document.getElementById('installment-notes');
    if (notesInput) {
      notesInput.value = targetInstallment.notes || '';
    }
    
    // تحديد الأولوية
    const priorityCheckbox = document.getElementById('installment-priority');
    if (priorityCheckbox) {
      priorityCheckbox.checked = targetInstallment.priority === 'high';
    }
    
    // إخفاء قائمة اختيار المستثمر
    const investorSelectContainer = document.getElementById('investor-select-container');
    if (investorSelectContainer) {
      investorSelectContainer.style.display = 'none';
    }
    
    // التحقق من وجود أقساط مدفوعة
    const hasPayments = targetInstallment.paidAmount > 0 || 
                        (targetInstallment.isParent && investor.installments.some(inst => 
                          inst.parentId === targetInstallment.id && inst.status === 'paid'));
    
    // تعطيل بعض الحقول إذا كان هناك أقساط مدفوعة
    if (hasPayments) {
      if (principalAmountInput) principalAmountInput.disabled = true;
      if (withInterestCheckbox) withInterestCheckbox.disabled = true;
      if (interestRateInput) interestRateInput.disabled = true;
      if (monthlyPaymentsCheckbox) monthlyPaymentsCheckbox.disabled = true;
      if (monthsInput) monthsInput.disabled = true;
      
      // إضافة تنبيه
      const schedulePreview = document.getElementById('installment-schedule-preview');
      if (schedulePreview) {
        schedulePreview.innerHTML = `
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <span>تم تسديد بعض الأقساط بالفعل. لا يمكن تعديل القيم الأساسية للقسط.</span>
          </div>
        `;
      }
    } else {
      // إعادة حساب التقسيط
      if (targetInstallment.isParent) {
        setTimeout(() => {
          // تحديث الحساب وعرض جدول التقسيط
          updateCalculation();
          generateInstallmentSchedule();
        }, 100);
      }
    }
    
    // فتح النافذة
    openModal('add-installment-modal');
  };
}

/**
 * تعديل أزرار التصفية في صفحة الأقساط
 */
function setupFilterButtons() {
  // البحث عن أزرار التصفية
  const filterButtons = document.querySelectorAll('#installments-page .btn-group .btn[data-filter]');
  
  // تحديث أزرار التصفية الموجودة
  if (filterButtons.length > 0) {
    // إضافة زر تصفية جديد للأقساط الرئيسية إذا لم يكن موجوداً
    const parentFilterBtn = Array.from(filterButtons).find(btn => btn.getAttribute('data-filter') === 'parent');
    
    if (!parentFilterBtn) {
      const lastBtn = filterButtons[filterButtons.length - 1];
      const btnGroup = lastBtn.parentNode;
      
      // إنشاء زر جديد
      const newBtn = document.createElement('button');
      newBtn.className = 'btn btn-outline btn-sm';
      newBtn.setAttribute('data-filter', 'parent');
      newBtn.textContent = 'الأقساط الرئيسية';
      
      // إضافة الزر للمجموعة
      btnGroup.appendChild(newBtn);
      
      // إضافة مستمع حدث للزر الجديد
      newBtn.addEventListener('click', function() {
        // إزالة الكلاس النشط من جميع الأزرار
        document.querySelectorAll('#installments-page .btn-group .btn[data-filter]').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // إضافة الكلاس النشط للزر المحدد
        this.classList.add('active');
        
        // تصفية الأقساط
        renderInstallmentsTable('parent');
      });
    }
  }
}

/**
 * إضافة زر إضافة قسط جديد
 */
function setupAddInstallmentButton() {
  // البحث عن زر إضافة قسط جديد
  const addInstallmentBtn = document.getElementById('add-global-installment-btn');
  
  if (addInstallmentBtn) {
    // إزالة أي مستمعي أحداث سابقة
    const newAddBtn = addInstallmentBtn.cloneNode(true);
    addInstallmentBtn.parentNode.replaceChild(newAddBtn, addInstallmentBtn);
    
    // إضافة مستمع حدث جديد
    newAddBtn.addEventListener('click', function() {
      // فتح نافذة إضافة قسط جديد
      showAddInstallmentModal();
    });
  }
}

/**
 * فتح نافذة إضافة قسط جديد
 * @param {string} investorId - معرف المستثمر (اختياري)
 */
function showAddInstallmentModal(investorId = null) {
  // إعادة تعيين النموذج
  const form = document.getElementById('installment-form');
  if (form) {
    form.reset();
  }
  
  // تعيين العنوان
  const title = document.getElementById('installment-modal-title');
  if (title) {
    title.textContent = 'إضافة قسط جديد';
  }
  
  // تعيين تاريخ اليوم كقيمة افتراضية
  const dueDateInput = document.getElementById('installment-due-date');
  if (dueDateInput) {
    dueDateInput.value = new Date().toISOString().split('T')[0];
  }
  
  // تمكين جميع الحقول
  const inputFields = document.querySelectorAll('#installment-form input, #installment-form select, #installment-form textarea');
  inputFields.forEach(field => {
    field.disabled = false;
  });
  
  // إعادة تعيين حقول المعرفات
  document.getElementById('installment-id').value = '';
  document.getElementById('installment-investor-id').value = investorId || '';
  
  // مسح جدول التقسيط
  const schedulePreview = document.getElementById('installment-schedule-preview');
  if (schedulePreview) {
    schedulePreview.innerHTML = '';
  }
  
  // التعامل مع حاوية اختيار المستثمر
  const investorSelectContainer = document.getElementById('investor-select-container');
  const investorSelect = document.getElementById('installment-investor');
  
  if (investorId) {
    // إخفاء قائمة اختيار المستثمر عند تحديد مستثمر مسبقاً
    if (investorSelectContainer) {
      investorSelectContainer.style.display = 'none';
    }
  } else {
    // إظهار قائمة اختيار المستثمر وملؤها
    if (investorSelectContainer) {
      investorSelectContainer.style.display = 'block';
    }
    
    if (investorSelect) {
      // ملء قائمة المستثمرين
      investorSelect.innerHTML = '<option value="">اختر المستثمر</option>';
      
      // ترتيب المستثمرين أبجدياً
      const sortedInvestors = [...window.investors].sort((a, b) => 
        a.name.localeCompare(b.name));
      
      // إضافة المستثمرين إلى القائمة
      sortedInvestors.forEach(investor => {
        const option = document.createElement('option');
        option.value = investor.id;
        option.textContent = `${investor.name} (${investor.phone || 'بدون رقم'})`;
        investorSelect.appendChild(option);
      });
    }
  }
  
  // فتح النافذة
  if (typeof window.openModal === 'function') {
    window.openModal('add-installment-modal');
  } else {
    const modal = document.getElementById('add-installment-modal');
    if (modal) modal.classList.add('active');
  }
}

/**
 * تحديث عرض تفاصيل المستثمر لإظهار تفاصيل أكثر عن الأقساط
 */
function enhanceInvestorDetailsView() {
  console.log("تحديث عرض تفاصيل المستثمر...");
  
  // استبدال دالة إضافة قسم الأقساط إلى تفاصيل المستثمر
  window.addInstallmentsSectionToInvestorDetails = function(investor, container) {
    // الحصول على الأقساط المستحقة وغير المستحقة
    const dueInstallments = getDueInstallments(investor);
    const upcomingInstallments = investor.installments
      ? investor.installments.filter(inst => 
          inst.status !== 'paid' && 
          inst.status !== 'parent' &&
          new Date(inst.dueDate) > new Date())
      : [];
    
    // حساب إجمالي المبالغ
    const totalDueAmount = dueInstallments.reduce((sum, inst) => sum + inst.remainingAmount, 0);
    const totalUpcomingAmount = upcomingInstallments.reduce((sum, inst) => sum + inst.remainingAmount, 0);
    
    // تجميع الأقساط الرئيسية
    const parentInstallments = investor.installments
      ? investor.installments.filter(inst => inst.isParent)
      : [];
    
    // تحديد عدد أقساط حالة المستثمر
    let statusMessage = '';
    let statusClass = '';
    
    if (dueInstallments.length > 0) {
      statusMessage = `${dueInstallments.length} قسط مستحق`;
      statusClass = 'status-urgent';
    } else if (upcomingInstallments.length > 0) {
      statusMessage = `${upcomingInstallments.length} قسط قادم`;
      statusClass = 'status-upcoming';
    } else if (investor.installments && investor.installments.some(i => i.status === 'paid')) {
      statusMessage = 'جميع الأقساط مسددة';
      statusClass = 'status-paid';
    } else {
      statusMessage = 'لا توجد أقساط';
      statusClass = 'status-none';
    }
    
    // إنشاء قسم الأقساط
    const installmentsSection = document.createElement('div');
    installmentsSection.className = 'detail-group installments-detail-group';
    
    // إنشاء محتوى قسم الأقساط
    installmentsSection.innerHTML = `
      <h3 class="detail-group-title">
        الأقساط
        <span class="installment-status ${statusClass}">${statusMessage}</span>
        <button class="btn btn-sm btn-primary add-installment-btn" data-investor-id="${investor.id}">
          <i class="fas fa-plus"></i>
          <span>إضافة قسط</span>
        </button>
      </h3>
      
      ${parentInstallments.length > 0 ? `
        <div class="installments-summary parent">
          <div class="summary-title">
            <i class="fas fa-table"></i>
            برامج التقسيط
          </div>
          <div class="parent-installments-container">
            ${parentInstallments.map(parent => {
              // حساب تقدم السداد
              const childInstallments = investor.installments.filter(inst => inst.parentId === parent.id);
              const paidCount = childInstallments.filter(inst => inst.status === 'paid').length;
              const progress = childInstallments.length > 0 ? Math.round((paidCount / childInstallments.length) * 100) : 0;
              
              return `
                <div class="parent-installment-card">
                  <div class="card-header">
                    <div class="card-title">${parent.description}</div>
                    <div class="card-amount">${formatCurrency(parent.amount)}</div>
                  </div>
                  <div class="card-info">
                    <div class="info-item">
                      <span class="info-label">المبلغ الأساسي:</span>
                      <span class="info-value">${formatCurrency(parent.principalAmount)}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">الفائدة:</span>
                      <span class="info-value">${parent.withInterest ? `${parent.interestRate}% (${formatCurrency(parent.interestAmount)})` : 'لا يوجد'}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">القسط الشهري:</span>
                      <span class="info-value">${formatCurrency(parent.monthlyPayment)}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">عدد الأقساط:</span>
                      <span class="info-value">${parent.totalParts} قسط (${paidCount} مدفوع، ${parent.totalParts - paidCount} متبقي)</span>
                    </div>
                  </div>
                  <div class="progress-container">
                    <div class="progress-bar">
                      <div class="progress-value" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">${progress}% مكتمل</div>
                  </div>
                  <div class="card-actions">
                    <button class="btn btn-sm btn-outline view-installment-details-btn" data-investor-id="${investor.id}" data-installment-id="${parent.id}">
                      <i class="fas fa-eye"></i>
                      <span>تفاصيل</span>
                    </button>
                    ${paidCount === 0 ? `
                      <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${investor.id}" data-installment-id="${parent.id}">
                        <i class="fas fa-edit"></i>
                        <span>تعديل</span>
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
      
      ${dueInstallments.length > 0 ? `
        <div class="installments-summary due">
          <div class="summary-title">
            <i class="fas fa-exclamation-circle"></i>
            أقساط مستحقة
          </div>
          <div class="summary-amount">${formatCurrency(totalDueAmount)}</div>
        </div>
        
        <div class="mini-table-container">
          <table class="mini-table installments-table">
            <thead>
              <tr>
                <th>الوصف</th>
                <th>تاريخ الاستحقاق</th>
                <th>المبلغ المتبقي</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${dueInstallments.map(installment => `
                <tr class="due-installment">
                  <td>${installment.description}</td>
                  <td>${formatDate(installment.dueDate)}</td>
                  <td>${formatCurrency(installment.remainingAmount)}</td>
                  <td>
                    <button class="btn btn-sm btn-success pay-installment-btn" data-investor-id="${investor.id}" data-installment-id="${installment.id}">
                      <i class="fas fa-coins"></i>
                    </button>
                    <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${investor.id}" data-installment-id="${installment.id}">
                      <i class="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${upcomingInstallments.length > 0 ? `
        <div class="installments-summary upcoming">
          <div class="summary-title">
            <i class="fas fa-calendar-alt"></i>
            أقساط قادمة
          </div>
          <div class="summary-amount">${formatCurrency(totalUpcomingAmount)}</div>
        </div>
        
        <div class="mini-table-container">
          <table class="mini-table installments-table">
            <thead>
              <tr>
                <th>الوصف</th>
                <th>تاريخ الاستحقاق</th>
                <th>المبلغ المتبقي</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${upcomingInstallments.map(installment => `
                <tr class="upcoming-installment">
                  <td>${installment.description}</td>
                  <td>${formatDate(installment.dueDate)}</td>
                  <td>${formatCurrency(installment.remainingAmount)}</td>
                  <td>
                    ${installment.parentId ? `
                      <button class="btn btn-sm btn-info view-parent-installment-btn" data-investor-id="${investor.id}" data-parent-id="${installment.parentId}">
                        <i class="fas fa-search"></i>
                      </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${investor.id}" data-installment-id="${installment.id}">
                      <i class="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${(dueInstallments.length === 0 && upcomingInstallments.length === 0 && parentInstallments.length === 0) ? `
        <div class="empty-installments">
          <p>لا توجد أقساط حالية. يمكنك إضافة قسط جديد عن طريق الضغط على زر "إضافة قسط".</p>
        </div>
      ` : ''}
      
      ${investor.installments && investor.installments.some(i => i.status === 'paid') ? `
        <div class="view-history-link">
          <a href="#" class="view-paid-installments" data-investor-id="${investor.id}">
            <i class="fas fa-history"></i>
            عرض سجل الأقساط المدفوعة
          </a>
        </div>
      ` : ''}
    `;
    
    // إضافة قسم الأقساط إلى التفاصيل
    container.appendChild(installmentsSection);
    
    // إضافة أنماط CSS المحسنة
    addEnhancedInstallmentDetailStyles();
    
    // إضافة مستمعي الأحداث للأزرار
    setupInstallmentButtonsListeners(installmentsSection);
  };
}

/**
 * إضافة أنماط CSS محسنة لتفاصيل الأقساط
 */
function addEnhancedInstallmentDetailStyles() {
  // التحقق من وجود أنماط مسبقة
  if (document.getElementById('enhanced-installment-details-styles')) {
    return;
  }
  
  // إنشاء عنصر نمط جديد
  const styleElement = document.createElement('style');
  styleElement.id = 'enhanced-installment-details-styles';
  
  // إضافة أنماط CSS
  styleElement.textContent = `
    /* أنماط بطاقات برامج التقسيط */
    .parent-installments-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-top: 12px;
      margin-bottom: 20px;
    }
    
    .parent-installment-card {
      background-color: #f8fafc;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .parent-installment-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    
    .parent-installment-card .card-header {
      padding: 12px 16px;
      background-color: #eff6ff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .parent-installment-card .card-title {
      font-weight: 600;
      color: #3b82f6;
    }
    
    .parent-installment-card .card-amount {
      font-weight: 700;
      color: #1e40af;
    }
    
    .parent-installment-card .card-info {
      padding: 12px 16px;
    }
    
    .parent-installment-card .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9em;
    }
    
    .parent-installment-card .info-label {
      color: #64748b;
    }
    
    .parent-installment-card .info-value {
      font-weight: 500;
    }
    
    .parent-installment-card .progress-container {
      padding: 0 16px 12px;
    }
    
    .parent-installment-card .progress-bar {
      height: 8px;
      background-color: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .parent-installment-card .progress-value {
      height: 100%;
      background-color: #3b82f6;
      border-radius: 4px;
    }
    
    .parent-installment-card .progress-text {
      margin-top: 4px;
      font-size: 0.8em;
      color: #64748b;
      text-align: left;
    }
    
    .parent-installment-card .card-actions {
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    
  /* أنماط عرض الأقساط المدفوعة */
    .installment-history-modal {
      max-width: 700px;
      max-height: 90vh;
    }
    
    .installment-history-modal .modal-body {
      max-height: calc(90vh - 120px);
      overflow-y: auto;
    }
    
    .installment-history-title {
      font-size: 1.2em;
      font-weight: 600;
      margin-bottom: 16px;
      color: #0f172a;
    }
    
    /* أنماط حالة الأقساط */
    .installment-status {
      display: inline-block;
      font-size: 0.85em;
      padding: 4px 8px;
      border-radius: 99px;
      margin-right: 8px;
      vertical-align: middle;
    }
    
    .status-urgent {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    
    .status-upcoming {
      background-color: #f0f9ff;
      color: #0369a1;
    }
    
    .status-paid {
      background-color: #ecfdf5;
      color: #047857;
    }
    
    .status-none {
      background-color: #f1f5f9;
      color: #64748b;
    }
    
    /* أنماط جدول الأقساط في جدول المستثمر */
    .installment-category {
      white-space: nowrap;
    }
    
    .badge-category {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75em;
      margin-right: 4px;
    }
    
    .badge-interest {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    
    .badge-monthly {
      background-color: #e0f2fe;
      color: #0369a1;
    }
    
    .badge-installment {
      background-color: #f3e8ff;
      color: #6b21a8;
    }
    
    .interest-info {
      font-size: 0.8em;
      color: #6b7280;
      margin-top: 4px;
    }
  `;
  
  // إضافة عنصر النمط إلى رأس الصفحة
  document.head.appendChild(styleElement);
  console.log('تم إضافة أنماط CSS محسنة لتفاصيل الأقساط');
}

/**
 * الحصول على شارة تصنيف القسط
 * @param {Object} installment - بيانات القسط
 * @returns {string} - HTML لشارة التصنيف
 */
function getInstallmentCategoryBadge(installment) {
  let badges = [];
  
  if (installment.withInterest) {
    badges.push('<span class="badge-category badge-interest">مع فائدة</span>');
  }
  
  if (installment.parentId) {
    badges.push('<span class="badge-category badge-monthly">شهري</span>');
  }
  
  if (installment.isParent) {
    badges.push('<span class="badge-category badge-installment">برنامج تقسيط</span>');
  }
  
  return badges.join(' ');
}

/**
 * إضافة مستمع حدث لعرض تفاصيل القسط الرئيسي
 * @param {HTMLElement} container - حاوية الأقساط
 */
function setupInstallmentButtonsListeners(container) {
  // زر إضافة قسط جديد
  const addButton = container.querySelector('.add-installment-btn');
  if (addButton) {
    addButton.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      showAddInstallmentModal(investorId);
    });
  }
  
  // أزرار دفع الأقساط
  const payButtons = container.querySelectorAll('.pay-installment-btn');
  payButtons.forEach(button => {
    button.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      const installmentId = this.getAttribute('data-installment-id');
      
      // استخدام دالة دفع القسط إن وجدت
      if (typeof window.payInstallment === 'function') {
        window.payInstallment(investorId, installmentId);
      } else if (typeof window.InstallmentSystem?.payInstallment === 'function') {
        window.InstallmentSystem.payInstallment(investorId, installmentId);
      } else {
        showNotification('وظيفة دفع القسط غير متوفرة', 'error');
      }
    });
  });
  
  // أزرار تعديل الأقساط
  const editButtons = container.querySelectorAll('.edit-installment-btn');
  editButtons.forEach(button => {
    button.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      const installmentId = this.getAttribute('data-installment-id');
      
      // استخدام دالة تعديل القسط إن وجدت
      if (typeof window.editInstallment === 'function') {
        window.editInstallment(investorId, installmentId);
      } else if (typeof window.InstallmentSystem?.editInstallment === 'function') {
        window.InstallmentSystem.editInstallment(investorId, installmentId);
      } else {
        showNotification('وظيفة تعديل القسط غير متوفرة', 'error');
      }
    });
  });
  
  // أزرار عرض تفاصيل القسط الرئيسي
  const viewDetailsButtons = container.querySelectorAll('.view-installment-details-btn');
  viewDetailsButtons.forEach(button => {
    button.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      const installmentId = this.getAttribute('data-installment-id');
      showInstallmentDetailsModal(investorId, installmentId);
    });
  });
  
  // أزرار عرض القسط الرئيسي من قسط فرعي
  const viewParentButtons = container.querySelectorAll('.view-parent-installment-btn');
  viewParentButtons.forEach(button => {
    button.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      const parentId = this.getAttribute('data-parent-id');
      showInstallmentDetailsModal(investorId, parentId);
    });
  });
  
  // رابط عرض سجل الأقساط المدفوعة
  const historyLink = container.querySelector('.view-paid-installments');
  if (historyLink) {
    historyLink.addEventListener('click', function(e) {
      e.preventDefault();
      const investorId = this.getAttribute('data-investor-id');
      showInstallmentHistoryModal(investorId);
    });
  }
}

/**
 * عرض نافذة تفاصيل القسط
 * @param {string} investorId - معرف المستثمر
 * @param {string} installmentId - معرف القسط
 */
function showInstallmentDetailsModal(investorId, installmentId) {
  // البحث عن المستثمر والقسط
  const investor = window.investors.find(inv => inv.id === investorId);
  if (!investor || !investor.installments) {
    showNotification('لم يتم العثور على بيانات المستثمر أو الأقساط', 'error');
    return;
  }
  
  const installment = investor.installments.find(inst => inst.id === installmentId);
  if (!installment) {
    showNotification('لم يتم العثور على بيانات القسط', 'error');
    return;
  }
  
  // التحقق مما إذا كان هذا قسط رئيسي
  if (!installment.isParent) {
    // إذا لم يكن قسط رئيسي، عرض تفاصيل القسط العادي
    showSingleInstallmentDetails(investor, installment);
    return;
  }
  
  // الحصول على الأقساط الفرعية
  const childInstallments = investor.installments.filter(inst => inst.parentId === installment.id);
  
  // ترتيب الأقساط حسب رقم الجزء أو تاريخ الاستحقاق
  childInstallments.sort((a, b) => {
    if (a.partIndex && b.partIndex) {
      return a.partIndex - b.partIndex;
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  // حساب تقدم السداد
  const paidInstallments = childInstallments.filter(inst => inst.status === 'paid');
  const paidAmount = paidInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  const progress = childInstallments.length > 0 ? Math.round((paidInstallments.length / childInstallments.length) * 100) : 0;
  
  // إنشاء محتوى النافذة
  const content = `
    <div class="installment-details">
      <div class="investor-profile">
        <div class="investor-avatar large">${investor.name.charAt(0)}</div>
        <h2 class="investor-fullname">${investor.name}</h2>
      </div>
      
      <div class="installment-header">
        <h3 class="installment-title">${installment.description}</h3>
        <div class="installment-amount">${formatCurrency(installment.amount)}</div>
      </div>
      
      <div class="installment-info">
        <div class="info-group">
          <div class="info-item">
            <span class="info-label">المبلغ الأساسي:</span>
            <span class="info-value">${formatCurrency(installment.principalAmount)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">الفائدة:</span>
            <span class="info-value">${installment.withInterest ? `${installment.interestRate}% (${formatCurrency(installment.interestAmount)})` : 'لا يوجد'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">القسط الشهري:</span>
            <span class="info-value">${formatCurrency(installment.monthlyPayment)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">عدد الأقساط:</span>
            <span class="info-value">${installment.totalParts} قسط</span>
          </div>
          <div class="info-item">
            <span class="info-label">تاريخ البدء:</span>
            <span class="info-value">${formatDate(installment.dueDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">تاريخ الإنشاء:</span>
            <span class="info-value">${formatDate(installment.installedDate)}</span>
          </div>
          ${installment.notes ? `
            <div class="info-item notes">
              <span class="info-label">ملاحظات:</span>
              <span class="info-value">${installment.notes}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="progress-section">
          <div class="progress-info">
            <div class="progress-item">
              <span class="progress-label">المبلغ المدفوع:</span>
              <span class="progress-value">${formatCurrency(paidAmount)}</span>
            </div>
            <div class="progress-item">
              <span class="progress-label">المبلغ المتبقي:</span>
              <span class="progress-value">${formatCurrency(installment.amount - paidAmount)}</span>
            </div>
            <div class="progress-item">
              <span class="progress-label">الأقساط المدفوعة:</span>
              <span class="progress-value">${paidInstallments.length} من ${childInstallments.length}</span>
            </div>
          </div>
          
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-value" style="width: ${progress}%"></div>
            </div>
            <div class="progress-text">${progress}% مكتمل</div>
          </div>
        </div>
      </div>
      
      <div class="installment-schedule">
        <h4 class="schedule-title">جدول الأقساط</h4>
        <div class="table-container">
          <table class="installments-table">
            <thead>
              <tr>
                <th>القسط</th>
                <th>تاريخ الاستحقاق</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${childInstallments.map(child => {
                const dueDate = new Date(child.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                let statusClass = '';
                let statusText = '';
                
                if (child.status === 'paid') {
                  statusClass = 'status-paid';
                  statusText = 'مدفوع';
                } else if (dueDate < today) {
                  statusClass = 'status-overdue';
                  statusText = 'متأخر';
                } else if (dueDate.getTime() === today.getTime()) {
                  statusClass = 'status-today';
                  statusText = 'اليوم';
                } else {
                  statusClass = 'status-upcoming';
                  statusText = 'قادم';
                }
                
                return `
                  <tr class="${statusClass}">
                    <td>${child.partIndex || '-'}</td>
                    <td>${formatDate(child.dueDate)}</td>
                    <td>${formatCurrency(child.amount)}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                      ${child.status !== 'paid' ? `
                        <button class="btn btn-sm btn-success pay-installment-btn" data-investor-id="${investor.id}" data-installment-id="${child.id}">
                          <i class="fas fa-coins"></i>
                          <span>تسديد</span>
                        </button>
                      ` : `
                        <span class="paid-date">تم الدفع في ${formatDate(child.paidDate)}</span>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  // عرض النافذة المنبثقة
  showModal('تفاصيل برنامج التقسيط', content, 'installment-details-modal', true);
  
  // إضافة مستمعي الأحداث لأزرار تسديد الأقساط
  document.querySelectorAll('.installment-details-modal .pay-installment-btn').forEach(button => {
    button.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      const installmentId = this.getAttribute('data-installment-id');
      
      // إغلاق النافذة
      closeModal('installment-details-modal');
      
      // دفع القسط
      if (typeof window.payInstallment === 'function') {
        window.payInstallment(investorId, installmentId);
      }
    });
  });
}

/**
 * عرض تفاصيل قسط فردي
 * @param {Object} investor - بيانات المستثمر
 * @param {Object} installment - بيانات القسط
 */
function showSingleInstallmentDetails(investor, installment) {
  // تحديد حالة القسط
  const dueDate = new Date(installment.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let statusClass = '';
  let statusText = '';
  
  if (installment.status === 'paid') {
    statusClass = 'status-paid';
    statusText = 'مدفوع';
  } else if (dueDate < today) {
    statusClass = 'status-overdue';
    statusText = 'متأخر';
  } else if (dueDate.getTime() === today.getTime()) {
    statusClass = 'status-today';
    statusText = 'مستحق اليوم';
  } else {
    statusClass = 'status-upcoming';
    statusText = 'قادم';
  }
  
  // إنشاء محتوى النافذة
  const content = `
    <div class="installment-details">
      <div class="investor-profile">
        <div class="investor-avatar large">${investor.name.charAt(0)}</div>
        <h2 class="investor-fullname">${investor.name}</h2>
      </div>
      
      <div class="installment-header">
        <h3 class="installment-title">${installment.description}</h3>
        <div class="installment-amount">${formatCurrency(installment.amount)}</div>
      </div>
      
      <div class="installment-info">
        <div class="info-group">
          ${installment.principalAmount ? `
            <div class="info-item">
              <span class="info-label">المبلغ الأساسي:</span>
              <span class="info-value">${formatCurrency(installment.principalAmount)}</span>
            </div>
          ` : ''}
          
          ${installment.withInterest ? `
            <div class="info-item">
              <span class="info-label">الفائدة:</span>
              <span class="info-value">${installment.interestRate}% (${formatCurrency(installment.interestAmount)})</span>
            </div>
          ` : ''}
          
          <div class="info-item">
            <span class="info-label">تاريخ الاستحقاق:</span>
            <span class="info-value">${formatDate(installment.dueDate)}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">الحالة:</span>
            <span class="info-value"><span class="badge ${statusClass}">${statusText}</span></span>
          </div>
          
          ${installment.status === 'paid' ? `
            <div class="info-item">
              <span class="info-label">تاريخ الدفع:</span>
              <span class="info-value">${formatDate(installment.paidDate)}</span>
            </div>
          ` : ''}
          
          <div class="info-item">
            <span class="info-label">تاريخ الإنشاء:</span>
            <span class="info-value">${formatDate(installment.installedDate || installment.createdAt)}</span>
          </div>
          
          ${installment.notes ? `
            <div class="info-item notes">
              <span class="info-label">ملاحظات:</span>
              <span class="info-value">${installment.notes}</span>
            </div>
          ` : ''}
        </div>
        
        ${installment.status !== 'paid' ? `
          <div class="installment-actions">
            <button class="btn btn-success pay-installment-btn" data-investor-id="${investor.id}" data-installment-id="${installment.id}">
              <i class="fas fa-coins"></i>
              <span>تسديد القسط</span>
            </button>
            <button class="btn btn-primary edit-installment-btn" data-investor-id="${investor.id}" data-installment-id="${installment.id}">
              <i class="fas fa-edit"></i>
              <span>تعديل القسط</span>
            </button>
          </div>
        ` : ''}
      </div>
      
      ${installment.parentId ? `
        <div class="parent-installment-info">
          <div class="parent-link">
            <a href="#" class="view-parent-installment-btn" data-investor-id="${investor.id}" data-parent-id="${installment.parentId}">
              <i class="fas fa-arrow-up"></i>
              عرض برنامج التقسيط الكامل
            </a>
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  // عرض النافذة المنبثقة
  showModal('تفاصيل القسط', content, 'installment-details-modal');
  
  // إضافة مستمعي الأحداث للأزرار
  const modal = document.querySelector('.installment-details-modal');
  if (modal) {
    // زر تسديد القسط
    const payButton = modal.querySelector('.pay-installment-btn');
    if (payButton) {
      payButton.addEventListener('click', function() {
        const investorId = this.getAttribute('data-investor-id');
        const installmentId = this.getAttribute('data-installment-id');
        
        // إغلاق النافذة
        closeModal('installment-details-modal');
        
        // دفع القسط
        if (typeof window.payInstallment === 'function') {
          window.payInstallment(investorId, installmentId);
        }
      });
    }
    
    // زر تعديل القسط
    const editButton = modal.querySelector('.edit-installment-btn');
    if (editButton) {
      editButton.addEventListener('click', function() {
        const investorId = this.getAttribute('data-investor-id');
        const installmentId = this.getAttribute('data-installment-id');
        
        // إغلاق النافذة
        closeModal('installment-details-modal');
        
        // تعديل القسط
        if (typeof window.editInstallment === 'function') {
          window.editInstallment(investorId, installmentId);
        }
      });
    }
    
    // رابط عرض القسط الرئيسي
    const parentLink = modal.querySelector('.view-parent-installment-btn');
    if (parentLink) {
      parentLink.addEventListener('click', function(e) {
        e.preventDefault();
        const investorId = this.getAttribute('data-investor-id');
        const parentId = this.getAttribute('data-parent-id');
        
        // إغلاق النافذة الحالية
        closeModal('installment-details-modal');
        
        // عرض تفاصيل القسط الرئيسي
        showInstallmentDetailsModal(investorId, parentId);
      });
    }
  }
}

/**
 * عرض سجل الأقساط المدفوعة
 * @param {string} investorId - معرف المستثمر
 */
function showInstallmentHistoryModal(investorId) {
  // البحث عن المستثمر
  const investor = window.investors.find(inv => inv.id === investorId);
  if (!investor || !investor.installments) {
    showNotification('لم يتم العثور على بيانات المستثمر أو الأقساط', 'error');
    return;
  }
  
  // الحصول على الأقساط المدفوعة
  const paidInstallments = investor.installments.filter(inst => inst.status === 'paid' && inst.status !== 'parent');
  
  // ترتيب الأقساط حسب تاريخ الدفع (الأحدث أولاً)
  paidInstallments.sort((a, b) => new Date(b.paidDate || b.updatedAt || b.createdAt) - new Date(a.paidDate || a.updatedAt || a.createdAt));
  
  // تجميع المبلغ الإجمالي المدفوع
  const totalPaid = paidInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  
  // إنشاء محتوى النافذة
  const content = `
    <div class="installment-history">
      <div class="investor-profile">
        <div class="investor-avatar large">${investor.name.charAt(0)}</div>
        <h2 class="investor-fullname">${investor.name}</h2>
      </div>
      
      <div class="installment-history-summary">
        <div class="summary-title">سجل الأقساط المدفوعة</div>
        <div class="summary-stats">
          <div class="stat-item">
            <div class="stat-value">${paidInstallments.length}</div>
            <div class="stat-label">عدد الأقساط المدفوعة</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${formatCurrency(totalPaid)}</div>
            <div class="stat-label">إجمالي المبالغ المدفوعة</div>
          </div>
        </div>
      </div>
      
      ${paidInstallments.length > 0 ? `
        <div class="table-container">
          <table class="installments-table">
            <thead>
              <tr>
                <th>وصف القسط</th>
                <th>المبلغ</th>
                <th>تاريخ الاستحقاق</th>
                <th>تاريخ الدفع</th>
                <th>طريقة الدفع</th>
              </tr>
            </thead>
            <tbody>
              ${paidInstallments.map(inst => `
                <tr>
                  <td>
                    <div class="installment-title">${inst.description}</div>
                    ${inst.parentId ? `
                      <div class="installment-parent-info">
                        <a href="#" class="view-parent-installment-btn" data-investor-id="${investor.id}" data-parent-id="${inst.parentId}">
                          <i class="fas fa-arrow-up"></i>
                          عرض برنامج التقسيط
                        </a>
                      </div>
                    ` : ''}
                  </td>
                  <td>${formatCurrency(inst.amount)}</td>
                  <td>${formatDate(inst.dueDate)}</td>
                  <td>${formatDate(inst.paidDate || inst.updatedAt)}</td>
                  <td>${getPaymentMethodText(inst.paymentMethod)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-history">
          <p>لا توجد أقساط مدفوعة لهذا المستثمر.</p>
        </div>
      `}
    </div>
  `;
  
  // عرض النافذة المنبثقة
  showModal('سجل الأقساط المدفوعة', content, 'installment-history-modal');
  
  // إضافة مستمعي الأحداث لأزرار عرض القسط الرئيسي
  document.querySelectorAll('.installment-history-modal .view-parent-installment-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const investorId = this.getAttribute('data-investor-id');
      const parentId = this.getAttribute('data-parent-id');
      
      // إغلاق النافذة الحالية
      closeModal('installment-history-modal');
      
      // عرض تفاصيل القسط الرئيسي
      showInstallmentDetailsModal(investorId, parentId);
    });
  });
}

/**
 * عرض نافذة منبثقة مخصصة
 * @param {string} title - عنوان النافذة
 * @param {string} content - محتوى النافذة
 * @param {string} modalClass - فئة إضافية للنافذة (اختيارية)
 * @param {boolean} wide - إذا كانت النافذة عريضة (اختيارية)
 */
function showModal(title, content, modalClass = '', wide = false) {
  // إنشاء عناصر النافذة المنبثقة
  const modalId = modalClass || `custom-modal-${Date.now()}`;
  const modalOverlay = document.createElement('div');
  modalOverlay.className = `modal-overlay ${modalClass}`;
  modalOverlay.id = modalId;
  
  modalOverlay.innerHTML = `
    <div class="modal animate__animated animate__fadeInUp ${wide ? 'modal-wide' : ''}">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline modal-close-btn">إغلاق</button>
      </div>
    </div>
  `;
  
  // إضافة النافذة للصفحة
  document.body.appendChild(modalOverlay);
  
  // إظهار النافذة
  setTimeout(() => {
    modalOverlay.classList.add('active');
  }, 50);
  
  // إضافة مستمعي الأحداث
  const closeButtons = modalOverlay.querySelectorAll('.modal-close, .modal-close-btn');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(modalId);
    });
  });
  
  // إغلاق النافذة عند النقر خارجها
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal(modalId);
    }
  });
  
  return modalOverlay;
}

/**
 * إغلاق نافذة منبثقة
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

/**
 * الحصول على نص طريقة الدفع
 * @param {string} method - رمز طريقة الدفع
 * @returns {string} - النص المقابل لطريقة الدفع
 */
function getPaymentMethodText(method) {
  switch (method) {
    case 'profit_deduction':
      return 'استقطاع من الأرباح';
    case 'manual':
      return 'دفع يدوي';
    default:
      return 'غير محدد';
  }
}

/**
 * الحصول على الأقساط المستحقة لمستثمر
 * @param {Object} investor - بيانات المستثمر
 * @returns {Array} - مصفوفة الأقساط المستحقة
 */
function getDueInstallments(investor) {
  if (!investor || !investor.installments) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return investor.installments.filter(installment => {
    // تجاهل الأقساط المدفوعة والأقساط الرئيسية
    if (installment.status === 'paid' || installment.status === 'parent' || installment.isParent) return false;
    
    // تحويل تاريخ الاستحقاق إلى كائن Date
    const dueDate = new Date(installment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    // القسط مستحق إذا كان تاريخ استحقاقه اليوم أو قبل اليوم
    return dueDate <= today;
  });
}

/**
 * تنسيق التاريخ
 * @param {string} dateString - سلسلة التاريخ
 * @returns {string} - التاريخ المنسق
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // التحقق من صحة التاريخ
    if (isNaN(date.getTime())) return dateString;
    
    // تنسيق التاريخ بالصيغة العربية
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * تنسيق المبلغ المالي
 * @param {number} amount - المبلغ
 * @param {boolean} addCurrency - إضافة رمز العملة
 * @returns {string} - المبلغ المنسق
 */
function formatCurrency(amount, addCurrency = true) {
  // استخدام دالة النظام لتنسيق المبلغ إذا كانت موجودة
  if (typeof window.formatCurrency === 'function') {
    return window.formatCurrency(amount, addCurrency);
  }
  
  // تنسيق بديل إذا لم تكن الدالة موجودة
  if (isNaN(amount)) amount = 0;
  
  const formattedAmount = amount.toLocaleString('ar-IQ');
  
  if (addCurrency) {
    const currency = window.settings?.currency || 'دينار';
    return `${formattedAmount} ${currency}`;
  }
  
  return formattedAmount;
}

/**
 * الحصول على نص الفلتر
 * @param {string} filter - نوع الفلتر
 * @returns {string} - النص المقابل للفلتر
 */
function getFilterText(filter) {
  switch (filter) {
    case 'overdue':
      return 'متأخرة';
    case 'today':
      return 'مستحقة اليوم';
    case 'upcoming':
      return 'قادمة';
    case 'parent':
      return 'برامج تقسيط';
    default:
      return '';
  }
}

/**
 * عرض إشعار للمستخدم
 * @param {string} message - نص الإشعار
 * @param {string} type - نوع الإشعار (success, error, warning, info)
 */
function showNotification(message, type = 'success') {
  // محاولة استخدام دالة النظام الأصلية
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
    return;
  }
  
  // دالة إشعار بديلة إذا لم تكن دالة النظام متاحة
  console.log(`إشعار (${type}): ${message}`);
  
  // إنشاء إشعار مؤقت
  const notification = document.createElement('div');
  notification.className = `notification notification-${type} show`;
  
  notification.innerHTML = `
    <div class="notification-icon ${type}">
      <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'exclamation'}"></i>
    </div>
    <div class="notification-content">
      <div class="notification-title">${type === 'success' ? 'تمت العملية بنجاح' : type === 'error' ? 'خطأ' : 'تنبيه'}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close">&times;</button>
  `;
  
  // إضافة الإشعار للصفحة
  document.body.appendChild(notification);
  
  // إغلاق الإشعار بعد 5 ثوانٍ
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
  
  // إضافة مستمع حدث لزر الإغلاق
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
  }
}

// تحميل التحديث الرئيسي
enhanceStorageSystem();
updateInstallmentModal();
enhanceInstallmentsPage();
enhanceInvestorDetailsView();

// عرض رسالة تأكيد تحميل التحديث
showNotification('تم تحميل تحديث نظام الأقساط الشامل بنجاح. يمكنك الآن إضافة أقساط مع فوائد وجدولة تقسيط شهري.', 'success');