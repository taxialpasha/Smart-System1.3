/**
 * إصلاح مشكلة عدم ظهور زر إدارة الأقساط في الواجهة الرئيسية
 * يجب إضافة هذا الملف في ملف HTML كآخر ملف JavaScript يتم تحميله
 */

// دالة للإصلاح الفوري لإضافة زر الأقساط
function fixInstallmentsButton() {
  console.log("بدء إصلاح زر إدارة الأقساط...");
  
  // التحقق من وجود القائمة الرئيسية
  const navList = document.querySelector('.nav-list');
  if (!navList) {
    console.error("لم يتم العثور على قائمة التنقل!");
    return false;
  }
  
  // التحقق من عدم وجود زر الأقساط مسبقاً
  if (document.querySelector('.nav-link[data-page="installments"]')) {
    console.log("زر الأقساط موجود بالفعل");
    return true;
  }
  
  // البحث عن عنصر الإعدادات لإضافة زر الأقساط قبله
  const settingsItem = document.querySelector('.nav-link[data-page="settings"]');
  const settingsLi = settingsItem ? settingsItem.closest('.nav-item') : null;
  
  // إنشاء عنصر زر الأقساط
  const installmentsItem = document.createElement('li');
  installmentsItem.className = 'nav-item';
  installmentsItem.innerHTML = `
    <a class="nav-link" data-page="installments" href="#">
      <div class="nav-icon">
        <i class="fas fa-receipt"></i>
      </div>
      <span>الأقساط</span>
    </a>
  `;
  
  // إضافة زر الأقساط للقائمة
  if (settingsLi) {
    navList.insertBefore(installmentsItem, settingsLi);
  } else {
    navList.appendChild(installmentsItem);
  }
  
  // إضافة مستمع حدث للتنقل للزر
  installmentsItem.querySelector('.nav-link').addEventListener('click', function(e) {
    e.preventDefault();
    
    // إظهار صفحة الأقساط إذا كانت موجودة
    const installmentsPage = document.getElementById('installments-page');
    
    if (!installmentsPage) {
      // تهيئة صفحة الأقساط إذا لم تكن موجودة
      initInstallmentsPage();
      
      // محاولة استدعاء نظام الأقساط
      if (window.InstallmentSystem && typeof window.InstallmentSystem.showInstallmentsPage === 'function') {
        window.InstallmentSystem.showInstallmentsPage();
      } else {
        showNotification('جاري تحميل نظام الأقساط...', 'info');
        
        // محاولة تهيئة نظام الأقساط
        fixInstallmentsSystem();
      }
    } else {
      // تفعيل الصفحة وتحديثها
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
      });
      
      installmentsPage.classList.add('active');
      
      // تحديث القائمة الجانبية
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      
      this.classList.add('active');
      
      // تحديث بيانات الصفحة
      if (window.InstallmentSystem && typeof window.InstallmentSystem.showInstallmentsPage === 'function') {
        window.InstallmentSystem.showInstallmentsPage();
      }
    }
  });
  
  console.log("تم إضافة زر الأقساط بنجاح!");
  return true;
}

// دالة لتهيئة صفحة الأقساط بشكل مستقل
function initInstallmentsPage() {
  // التحقق من عدم وجود الصفحة مسبقاً
  if (document.getElementById('installments-page')) {
    return;
  }
  
  // إنشاء عنصر الصفحة
  const pageElement = document.createElement('div');
  pageElement.className = 'page';
  pageElement.id = 'installments-page';
  
  // إنشاء محتوى الصفحة
  pageElement.innerHTML = `
    <div class="header">
      <button class="toggle-sidebar">
        <i class="fas fa-bars"></i>
      </button>
      <h1 class="page-title">إدارة الأقساط</h1>
      <div class="header-actions">
        <div class="search-box">
          <input class="search-input" placeholder="بحث عن مستثمر..." type="text" />
          <i class="fas fa-search search-icon"></i>
        </div>
        <button class="btn btn-primary" id="add-global-installment-btn">
          <i class="fas fa-plus"></i>
          <span>إضافة قسط جديد</span>
        </button>
      </div>
    </div>
    
    <div class="installments-dashboard">
      <div class="dashboard-cards">
        <div class="card">
          <div class="card-pattern">
            <i class="fas fa-money-check-alt"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">إجمالي الأقساط المستحقة</div>
              <div class="card-value" id="total-due-installments">0 دينار</div>
              <div class="card-change">
                <span id="total-due-count">0 قسط</span>
              </div>
            </div>
            <div class="card-icon danger">
              <i class="fas fa-exclamation-circle"></i>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-pattern">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">الأقساط القادمة</div>
              <div class="card-value" id="total-upcoming-installments">0 دينار</div>
              <div class="card-change">
                <span id="total-upcoming-count">0 قسط</span>
              </div>
            </div>
            <div class="card-icon warning">
              <i class="fas fa-calendar-plus"></i>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-pattern">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">الأقساط المدفوعة</div>
              <div class="card-value" id="total-paid-installments">0 دينار</div>
              <div class="card-change">
                <span id="total-paid-count">0 قسط</span>
              </div>
            </div>
            <div class="card-icon success">
              <i class="fas fa-check-double"></i>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-pattern">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">نسبة التحصيل</div>
              <div class="card-value" id="collection-rate">0%</div>
              <div class="card-change">
                <i id="collection-trend" class="fas fa-arrow-up"></i>
                <span id="collection-change">0% من الشهر السابق</span>
              </div>
            </div>
            <div class="card-icon info">
              <i class="fas fa-chart-line"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">الأقساط المستحقة</h2>
        <div class="section-actions">
          <div class="btn-group">
            <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
            <button class="btn btn-outline btn-sm" data-filter="overdue">متأخرة</button>
            <button class="btn btn-outline btn-sm" data-filter="today">اليوم</button>
            <button class="btn btn-outline btn-sm" data-filter="upcoming">قادمة</button>
          </div>
          <button class="btn btn-outline btn-sm" title="تصدير">
            <i class="fas fa-download"></i>
            <span>تصدير</span>
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table id="installments-table">
          <thead>
            <tr>
              <th>المستثمر</th>
              <th>وصف القسط</th>
              <th>تاريخ الاستحقاق</th>
              <th>المبلغ الإجمالي</th>
              <th>المبلغ المتبقي</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="7" class="text-center">جاري تحميل بيانات الأقساط...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  // إضافة الصفحة للمحتوى الرئيسي
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.appendChild(pageElement);
    console.log('تم إنشاء صفحة الأقساط بنجاح');
  }
  
  // إضافة أنماط CSS للأقساط
  addInstallmentStyles();
}

// دالة لإصلاح وتهيئة نظام الأقساط
function fixInstallmentsSystem() {
  console.log("بدء إصلاح نظام الأقساط...");
  
  // محاولة تشغيل دالة التهيئة مباشرة إذا كان النظام موجوداً
  if (window.InstallmentSystem && typeof window.InstallmentSystem.initialize === 'function') {
    window.InstallmentSystem.initialize();
    showNotification('تم تهيئة نظام الأقساط بنجاح', 'success');
    return true;
  }
  
  // إضافة كود نظام الأقساط إذا كان مفقوداً (ملخص للوظائف الأساسية)
  fixInvestorsDataStructure();
  createInstallmentModals();
  overrideOriginalFunctions();
  
  console.log("تم إصلاح نظام الأقساط بنجاح!");
  
  // تحديث صفحة الأقساط
  const installmentsPage = document.getElementById('installments-page');
  if (installmentsPage && installmentsPage.classList.contains('active')) {
    renderInstallmentsTable();
    updateInstallmentsDashboard();
  }
  
  showNotification('تم تهيئة نظام الأقساط بنجاح', 'success');
  return true;
}

// إصلاح بنية بيانات المستثمرين للتأكد من وجود حقل الأقساط
function fixInvestorsDataStructure() {
  if (!Array.isArray(window.investors)) {
    console.warn('مصفوفة المستثمرين غير موجودة');
    return;
  }
  
  // إضافة صفيف الأقساط للمستثمرين إذا لم يكن موجوداً
  window.investors.forEach(investor => {
    if (!investor.installments) {
      investor.installments = [];
    }
  });
  
  // حفظ التغييرات
  if (typeof window.saveData === 'function') {
    window.saveData();
  }
  
  console.log('تم إصلاح بنية بيانات المستثمرين');
}

// إنشاء النوافذ المنبثقة للأقساط
function createInstallmentModals() {
  // إضافة نافذة إضافة/تعديل قسط
  if (!document.getElementById('add-installment-modal')) {
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
                <label class="form-label">المبلغ الإجمالي</label>
                <input type="number" class="form-input" id="installment-amount" min="1" step="1000" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">تاريخ الاستحقاق</label>
                <input type="date" class="form-input" id="installment-due-date" required>
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
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline modal-close-btn">إلغاء</button>
          <button class="btn btn-primary" id="save-installment-btn">حفظ</button>
        </div>
      </div>
    `;
    
    // إضافة النافذة للجسم
    document.body.appendChild(modalElement);
    
    // إضافة مستمع حدث لزر الحفظ
    const saveButton = modalElement.querySelector('#save-installment-btn');
    if (saveButton) {
      saveButton.addEventListener('click', function() {
        saveInstallment();
      });
    }
    
    // إضافة مستمع حدث لزر الإغلاق
    const closeButtons = modalElement.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const modal = this.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('active');
        }
      });
    });
  }
  
  // إضافة نوافذ أخرى حسب الحاجة
}

// استبدال الدوال الأصلية بنسخ محسنة
function overrideOriginalFunctions() {
  // تعريف نظام الأقساط إذا لم يكن موجوداً
  if (!window.InstallmentSystem) {
    // تعريف مبسط للنظام
    window.InstallmentSystem = {
      initialize: function() {
        fixInvestorsDataStructure();
        createInstallmentModals();
        addInstallmentStyles();
        return true;
      },
      showInstallmentsPage: function() {
        // إظهار صفحة الأقساط وتحديثها
        const installmentsPage = document.getElementById('installments-page');
        if (installmentsPage) {
          // إخفاء جميع الصفحات
          document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
          });
          
          // إظهار صفحة الأقساط
          installmentsPage.classList.add('active');
          
          // تحديث لوحة التحكم
          updateInstallmentsDashboard();
          
          // عرض جدول الأقساط
          renderInstallmentsTable();
          
          // تحديث القائمة الجانبية
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
          });
          
          const installmentsNavLink = document.querySelector('.nav-link[data-page="installments"]');
          if (installmentsNavLink) {
            installmentsNavLink.classList.add('active');
          }
        } else {
          // إنشاء صفحة الأقساط إذا لم تكن موجودة
          initInstallmentsPage();
          setTimeout(() => this.showInstallmentsPage(), 100);
        }
      },
      getDueInstallments: function(investor) {
        if (!investor || !investor.installments) return [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return investor.installments.filter(installment => {
          // تجاهل الأقساط المدفوعة
          if (installment.status === 'paid') return false;
          
          // تحويل تاريخ الاستحقاق إلى كائن Date
          const dueDate = new Date(installment.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          // القسط مستحق إذا كان تاريخ استحقاقه اليوم أو قبل اليوم
          return dueDate <= today;
        });
      }
    };
  }
}

// تنفيذ الوظائف الأساسية لنظام الأقساط
function renderInstallmentsTable(filter = 'all') {
  const tableBody = document.querySelector('#installments-table tbody');
  if (!tableBody) return;
  
  // تجميع جميع الأقساط النشطة من جميع المستثمرين
  let allInstallments = [];
  
  if (Array.isArray(window.investors)) {
    window.investors.forEach(investor => {
      if (!investor.installments) return;
      
      const investorInstallments = investor.installments
        .filter(installment => installment.status !== 'paid')
        .map(installment => ({
          ...installment,
          investorId: investor.id,
          investorName: investor.name
        }));
          
      allInstallments = allInstallments.concat(investorInstallments);
    });
  }
  
  // تصفية الأقساط حسب الفلتر المحدد
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const filteredInstallments = allInstallments.filter(installment => {
    const dueDate = new Date(installment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'overdue':
        return dueDate < today;
      case 'today':
        return dueDate.getTime() === today.getTime();
      case 'upcoming':
        return dueDate > today;
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
        <td colspan="7" class="text-center">لا توجد أقساط ${getFilterText(filter)}</td>
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
    
    const row = document.createElement('tr');
    row.className = statusClass;
    
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
      <td>${installment.description}</td>
      <td>${formatDate(installment.dueDate)}</td>
      <td>${formatCurrency(installment.amount)}</td>
      <td>${formatCurrency(installment.remainingAmount)}</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td>
        <div class="actions">
          <button class="btn btn-sm btn-success pay-installment-btn" data-investor-id="${installment.investorId}" data-installment-id="${installment.id}">
            <i class="fas fa-coins"></i>
            <span>تسديد</span>
          </button>
          <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${installment.investorId}" data-installment-id="${installment.id}">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // إضافة مستمعي الأحداث للأزرار
  setupInstallmentTableButtonsListeners();
}

// إضافة أنماط CSS لنظام الأقساط
function addInstallmentStyles() {
  // التحقق من وجود أنماط مسبقة
  if (document.getElementById('installment-styles')) {
    return;
  }
  
  // إنشاء عنصر نمط جديد
  const styleElement = document.createElement('style');
  styleElement.id = 'installment-styles';
  
  // إضافة أنماط CSS
  styleElement.textContent = `
    /* أنماط قسم الأقساط */
    .installments-section {
      margin-top: 1.5rem;
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .installments-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.75rem;
    }
    
    .installments-table th,
    .installments-table td {
      padding: 8px 12px;
      text-align: right;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .installments-table thead th {
      background-color: #f1f5f9;
      font-weight: 600;
      color: #475569;
    }
    
    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .alert-warning {
      background-color: #fff7ed;
      border-left: 4px solid #f59e0b;
      color: #92400e;
    }
    
    .alert-info {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      color: #1e40af;
    }
    
    /* أنماط جدول الأقساط */
    #installments-table tr.status-overdue {
      background-color: #fee2e2;
    }
    
    #installments-table tr.status-today {
      background-color: #ffedd5;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 99px;
      font-size: 0.85em;
      font-weight: 500;
    }
    
    .badge.status-overdue {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    
    .badge.status-today {
      background-color: #ffedd5;
      color: #c2410c;
    }
    
    .badge.status-upcoming {
      background-color: #f0f9ff;
      color: #0369a1;
    }
  `;
  
  // إضافة عنصر النمط إلى رأس الصفحة
  document.head.appendChild(styleElement);
  console.log('تم إضافة أنماط CSS لنظام الأقساط');
}

// وظائف مساعدة مختلفة

// حفظ بيانات القسط الجديد
function saveInstallment() {
  // الحصول على بيانات النموذج
  const installmentId = document.getElementById('installment-id').value;
  let investorId = document.getElementById('installment-investor-id').value;
  
  // إذا لم يتم تحديد مستثمر مسبقاً، نحصل عليه من القائمة
  if (!investorId) {
    const investorSelect = document.getElementById('installment-investor');
    if (investorSelect) {
      investorId = investorSelect.value;
    }
  }
  
/**
 * إصلاح مشكلة عدم ظهور زر إدارة الأقساط في الواجهة الرئيسية
 * يجب إضافة هذا الملف في ملف HTML كآخر ملف JavaScript يتم تحميله
 */

// تنفيذ الإصلاح عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // التأكد من تحميل كافة العناصر
  setTimeout(() => {
    console.log("بدء تنفيذ إصلاح نظام الأقساط...");
    
    // إضافة زر الأقساط للقائمة الرئيسية
    fixInstallmentsButton();
    
    // تهيئة نظام الأقساط
    fixInstallmentsSystem();
    
    console.log("اكتمل تنفيذ إصلاح نظام الأقساط");
  }, 1000);
});

// دالة للإصلاح الفوري لإضافة زر الأقساط
function fixInstallmentsButton() {
  console.log("بدء إصلاح زر إدارة الأقساط...");
  
  // التحقق من وجود القائمة الرئيسية
  const navList = document.querySelector('.nav-list');
  if (!navList) {
    console.error("لم يتم العثور على قائمة التنقل!");
    return false;
  }
  
  // التحقق من عدم وجود زر الأقساط مسبقاً
  if (document.querySelector('.nav-link[data-page="installments"]')) {
    console.log("زر الأقساط موجود بالفعل");
    return true;
  }
  
  // البحث عن عنصر الإعدادات لإضافة زر الأقساط قبله
  const settingsItem = document.querySelector('.nav-link[data-page="settings"]');
  const settingsLi = settingsItem ? settingsItem.closest('.nav-item') : null;
  
  // إنشاء عنصر زر الأقساط
  const installmentsItem = document.createElement('li');
  installmentsItem.className = 'nav-item';
  installmentsItem.innerHTML = `
    <a class="nav-link" data-page="installments" href="#">
      <div class="nav-icon">
        <i class="fas fa-receipt"></i>
      </div>
      <span>الأقساط</span>
    </a>
  `;
  
  // إضافة زر الأقساط للقائمة
  if (settingsLi) {
    navList.insertBefore(installmentsItem, settingsLi);
  } else {
    navList.appendChild(installmentsItem);
  }
  
  // إضافة مستمع حدث للتنقل للزر
  installmentsItem.querySelector('.nav-link').addEventListener('click', function(e) {
    e.preventDefault();
    
    // إظهار صفحة الأقساط إذا كانت موجودة
    const installmentsPage = document.getElementById('installments-page');
    
    if (!installmentsPage) {
      // تهيئة صفحة الأقساط إذا لم تكن موجودة
      initInstallmentsPage();
      
      // محاولة استدعاء نظام الأقساط
      if (window.InstallmentSystem && typeof window.InstallmentSystem.showInstallmentsPage === 'function') {
        window.InstallmentSystem.showInstallmentsPage();
      } else {
        showNotification('جاري تحميل نظام الأقساط...', 'info');
        
        // محاولة تهيئة نظام الأقساط
        fixInstallmentsSystem();
      }
    } else {
      // تفعيل الصفحة وتحديثها
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
      });
      
      installmentsPage.classList.add('active');
      
      // تحديث القائمة الجانبية
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      
      this.classList.add('active');
      
      // تحديث بيانات الصفحة
      if (window.InstallmentSystem && typeof window.InstallmentSystem.showInstallmentsPage === 'function') {
        window.InstallmentSystem.showInstallmentsPage();
      }
    }
  });
  
  console.log("تم إضافة زر الأقساط بنجاح!");
  return true;
}

// دالة لتهيئة صفحة الأقساط بشكل مستقل
function initInstallmentsPage() {
  // التحقق من عدم وجود الصفحة مسبقاً
  if (document.getElementById('installments-page')) {
    return;
  }
  
  // إنشاء عنصر الصفحة
  const pageElement = document.createElement('div');
  pageElement.className = 'page';
  pageElement.id = 'installments-page';
  
  // إنشاء محتوى الصفحة
  pageElement.innerHTML = `
    <div class="header">
      <button class="toggle-sidebar">
        <i class="fas fa-bars"></i>
      </button>
      <h1 class="page-title">إدارة الأقساط</h1>
      <div class="header-actions">
        <div class="search-box">
          <input class="search-input" placeholder="بحث عن مستثمر..." type="text" />
          <i class="fas fa-search search-icon"></i>
        </div>
        <button class="btn btn-primary" id="add-global-installment-btn">
          <i class="fas fa-plus"></i>
          <span>إضافة قسط جديد</span>
        </button>
      </div>
    </div>
    
    <div class="installments-dashboard">
      <div class="dashboard-cards">
        <div class="card">
          <div class="card-pattern">
            <i class="fas fa-money-check-alt"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">إجمالي الأقساط المستحقة</div>
              <div class="card-value" id="total-due-installments">0 دينار</div>
              <div class="card-change">
                <span id="total-due-count">0 قسط</span>
              </div>
            </div>
            <div class="card-icon danger">
              <i class="fas fa-exclamation-circle"></i>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-pattern">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">الأقساط القادمة</div>
              <div class="card-value" id="total-upcoming-installments">0 دينار</div>
              <div class="card-change">
                <span id="total-upcoming-count">0 قسط</span>
              </div>
            </div>
            <div class="card-icon warning">
              <i class="fas fa-calendar-plus"></i>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-pattern">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">الأقساط المدفوعة</div>
              <div class="card-value" id="total-paid-installments">0 دينار</div>
              <div class="card-change">
                <span id="total-paid-count">0 قسط</span>
              </div>
            </div>
            <div class="card-icon success">
              <i class="fas fa-check-double"></i>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-pattern">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">نسبة التحصيل</div>
              <div class="card-value" id="collection-rate">0%</div>
              <div class="card-change">
                <i id="collection-trend" class="fas fa-arrow-up"></i>
                <span id="collection-change">0% من الشهر السابق</span>
              </div>
            </div>
            <div class="card-icon info">
              <i class="fas fa-chart-line"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">الأقساط المستحقة</h2>
        <div class="section-actions">
          <div class="btn-group">
            <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
            <button class="btn btn-outline btn-sm" data-filter="overdue">متأخرة</button>
            <button class="btn btn-outline btn-sm" data-filter="today">اليوم</button>
            <button class="btn btn-outline btn-sm" data-filter="upcoming">قادمة</button>
          </div>
          <button class="btn btn-outline btn-sm" title="تصدير">
            <i class="fas fa-download"></i>
            <span>تصدير</span>
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table id="installments-table">
          <thead>
            <tr>
              <th>المستثمر</th>
              <th>وصف القسط</th>
              <th>تاريخ الاستحقاق</th>
              <th>المبلغ الإجمالي</th>
              <th>المبلغ المتبقي</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="7" class="text-center">جاري تحميل بيانات الأقساط...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  // إضافة الصفحة للمحتوى الرئيسي
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.appendChild(pageElement);
    console.log('تم إنشاء صفحة الأقساط بنجاح');
  }
  
  // إضافة أنماط CSS للأقساط
  addInstallmentStyles();
}

// دالة لإصلاح وتهيئة نظام الأقساط
function fixInstallmentsSystem() {
  console.log("بدء إصلاح نظام الأقساط...");
  
  // محاولة تشغيل دالة التهيئة مباشرة إذا كان النظام موجوداً
  if (window.InstallmentSystem && typeof window.InstallmentSystem.initialize === 'function') {
    window.InstallmentSystem.initialize();
    showNotification('تم تهيئة نظام الأقساط بنجاح', 'success');
    return true;
  }
  
  // إضافة كود نظام الأقساط إذا كان مفقوداً (ملخص للوظائف الأساسية)
  fixInvestorsDataStructure();
  createInstallmentModals();
  overrideOriginalFunctions();
  
  console.log("تم إصلاح نظام الأقساط بنجاح!");
  
  // إضافة زر في القائمة الرئيسية إذا لم يكن موجوداً
  fixInstallmentsButton();
  
  // تحديث صفحة الأقساط
  const installmentsPage = document.getElementById('installments-page');
  if (installmentsPage && installmentsPage.classList.contains('active')) {
    renderInstallmentsTable();
    updateInstallmentsDashboard();
  }
  
  showNotification('تم تهيئة نظام الأقساط بنجاح', 'success');
  return true;
}

// إصلاح بنية بيانات المستثمرين للتأكد من وجود حقل الأقساط
function fixInvestorsDataStructure() {
  if (!Array.isArray(window.investors)) {
    console.warn('مصفوفة المستثمرين غير موجودة');
    return;
  }
  
  // إضافة صفيف الأقساط للمستثمرين إذا لم يكن موجوداً
  window.investors.forEach(investor => {
    if (!investor.installments) {
      investor.installments = [];
    }
  });
  
  // حفظ التغييرات
  if (typeof window.saveData === 'function') {
    window.saveData();
  }
  
  console.log('تم إصلاح بنية بيانات المستثمرين');
}

// إنشاء النوافذ المنبثقة للأقساط
function createInstallmentModals() {
  // إضافة نافذة إضافة/تعديل قسط
  if (!document.getElementById('add-installment-modal')) {
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
                <label class="form-label">المبلغ الإجمالي</label>
                <input type="number" class="form-input" id="installment-amount" min="1" step="1000" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">تاريخ الاستحقاق</label>
                <input type="date" class="form-input" id="installment-due-date" required>
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
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline modal-close-btn">إلغاء</button>
          <button class="btn btn-primary" id="save-installment-btn">حفظ</button>
        </div>
      </div>
    `;
    
    // إضافة النافذة للجسم
    document.body.appendChild(modalElement);
    
    // إضافة مستمع حدث لزر الحفظ
    const saveButton = modalElement.querySelector('#save-installment-btn');
    if (saveButton) {
      saveButton.addEventListener('click', function() {
        saveInstallment();
      });
    }
    
    // إضافة مستمع حدث لزر الإغلاق
    const closeButtons = modalElement.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const modal = this.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('active');
        }
      });
    });
  }
  
  // إضافة نوافذ أخرى حسب الحاجة
}

// استبدال الدوال الأصلية بنسخ محسنة
function overrideOriginalFunctions() {
  // تعريف نظام الأقساط إذا لم يكن موجوداً
  if (!window.InstallmentSystem) {
    // تعريف مبسط للنظام
    window.InstallmentSystem = {
      initialize: function() {
        fixInvestorsDataStructure();
        createInstallmentModals();
        addInstallmentStyles();
        return true;
      },
      showInstallmentsPage: function() {
        // إظهار صفحة الأقساط وتحديثها
        const installmentsPage = document.getElementById('installments-page');
        if (installmentsPage) {
          // إخفاء جميع الصفحات
          document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
          });
          
          // إظهار صفحة الأقساط
          installmentsPage.classList.add('active');
          
          // تحديث لوحة التحكم
          updateInstallmentsDashboard();
          
          // عرض جدول الأقساط
          renderInstallmentsTable();
          
          // تحديث القائمة الجانبية
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
          });
          
          const installmentsNavLink = document.querySelector('.nav-link[data-page="installments"]');
          if (installmentsNavLink) {
            installmentsNavLink.classList.add('active');
          }
        } else {
          // إنشاء صفحة الأقساط إذا لم تكن موجودة
          initInstallmentsPage();
          setTimeout(() => this.showInstallmentsPage(), 100);
        }
      },
      getDueInstallments: function(investor) {
        if (!investor || !investor.installments) return [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return investor.installments.filter(installment => {
          // تجاهل الأقساط المدفوعة
          if (installment.status === 'paid') return false;
          
          // تحويل تاريخ الاستحقاق إلى كائن Date
          const dueDate = new Date(installment.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          // القسط مستحق إذا كان تاريخ استحقاقه اليوم أو قبل اليوم
          return dueDate <= today;
        });
      }
    };
  }
}

// تنفيذ الوظائف الأساسية لنظام الأقساط
function renderInstallmentsTable(filter = 'all') {
  const tableBody = document.querySelector('#installments-table tbody');
  if (!tableBody) return;
  
  // تجميع جميع الأقساط النشطة من جميع المستثمرين
  let allInstallments = [];
  
  if (Array.isArray(window.investors)) {
    window.investors.forEach(investor => {
      if (!investor.installments) return;
      
      const investorInstallments = investor.installments
        .filter(installment => installment.status !== 'paid')
        .map(installment => ({
          ...installment,
          investorId: investor.id,
          investorName: investor.name
        }));
          
      allInstallments = allInstallments.concat(investorInstallments);
    });
  }
  
  // تصفية الأقساط حسب الفلتر المحدد
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const filteredInstallments = allInstallments.filter(installment => {
    const dueDate = new Date(installment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'overdue':
        return dueDate < today;
      case 'today':
        return dueDate.getTime() === today.getTime();
      case 'upcoming':
        return dueDate > today;
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
        <td colspan="7" class="text-center">لا توجد أقساط ${getFilterText(filter)}</td>
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
    
    const row = document.createElement('tr');
    row.className = statusClass;
    
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
      <td>${installment.description}</td>
      <td>${formatDate(installment.dueDate)}</td>
      <td>${formatCurrency(installment.amount)}</td>
      <td>${formatCurrency(installment.remainingAmount)}</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td>
        <div class="actions">
          <button class="btn btn-sm btn-success pay-installment-btn" data-investor-id="${installment.investorId}" data-installment-id="${installment.id}">
            <i class="fas fa-coins"></i>
            <span>تسديد</span>
          </button>
          <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${installment.investorId}" data-installment-id="${installment.id}">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // إضافة مستمعي الأحداث للأزرار
  setupInstallmentTableButtonsListeners();
}

// إضافة أنماط CSS لنظام الأقساط
function addInstallmentStyles() {
  // التحقق من وجود أنماط مسبقة
  if (document.getElementById('installment-styles')) {
    return;
  }
  
  // إنشاء عنصر نمط جديد
  const styleElement = document.createElement('style');
  styleElement.id = 'installment-styles';
  
  // إضافة أنماط CSS
  styleElement.textContent = `
    /* أنماط قسم الأقساط */
    .installments-section {
      margin-top: 1.5rem;
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .installments-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.75rem;
    }
    
    .installments-table th,
    .installments-table td {
      padding: 8px 12px;
      text-align: right;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .installments-table thead th {
      background-color: #f1f5f9;
      font-weight: 600;
      color: #475569;
    }
    
    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .alert-warning {
      background-color: #fff7ed;
      border-left: 4px solid #f59e0b;
      color: #92400e;
    }
    
    .alert-info {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      color: #1e40af;
    }
    
    /* أنماط جدول الأقساط */
    #installments-table tr.status-overdue {
      background-color: #fee2e2;
    }
    
    #installments-table tr.status-today {
      background-color: #ffedd5;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 99px;
      font-size: 0.85em;
      font-weight: 500;
    }
    
    .badge.status-overdue {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    
    .badge.status-today {
      background-color: #ffedd5;
      color: #c2410c;
    }
    
    .badge.status-upcoming {
      background-color: #f0f9ff;
      color: #0369a1;
    }
  `;
  
  // إضافة عنصر النمط إلى رأس الصفحة
  document.head.appendChild(styleElement);
  console.log('تم إضافة أنماط CSS لنظام الأقساط');
}

// وظائف مساعدة مختلفة

// تحديث لوحة معلومات الأقساط
function updateInstallmentsDashboard() {
  // إجمالي الأقساط المستحقة
  let totalDueAmount = 0;
  let totalDueCount = 0;
  
  // إجمالي الأقساط القادمة
  let totalUpcomingAmount = 0;
  let totalUpcomingCount = 0;
  
  // إجمالي الأقساط المدفوعة
  let totalPaidAmount = 0;
  let totalPaidCount = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // حساب الإحصائيات
  if (Array.isArray(window.investors)) {
    window.investors.forEach(investor => {
      if (!investor.installments) return;
      
      investor.installments.forEach(installment => {
        const dueDate = new Date(installment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
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
}

// إضافة مستمعي الأحداث لأزرار جدول الأقساط
function setupInstallmentTableButtonsListeners() {
  // أزرار تسديد الأقساط
  document.querySelectorAll('#installments-table .pay-installment-btn').forEach(button => {
    button.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      const installmentId = this.getAttribute('data-installment-id');
      payInstallment(investorId, installmentId);
    });
  });
  
  // أزرار تعديل الأقساط
  document.querySelectorAll('#installments-table .edit-installment-btn').forEach(button => {
    button.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      const installmentId = this.getAttribute('data-installment-id');
      editInstallment(investorId, installmentId);
    });
  });
  
  // أزرار تصفية الأقساط
  document.querySelectorAll('#installments-page .btn-group .btn[data-filter]').forEach(button => {
    button.addEventListener('click', function() {
      // إزالة الكلاس النشط من جميع الأزرار
      document.querySelectorAll('#installments-page .btn-group .btn[data-filter]').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // إضافة الكلاس النشط للزر المحدد
      this.classList.add('active');
      
      // تصفية الأقساط
      const filter = this.getAttribute('data-filter');
      renderInstallmentsTable(filter);
    });
  });
}

// دالة لتسديد قسط
function payInstallment(investorId, installmentId) {
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
}

// دالة لتعديل قسط
function editInstallment(investorId, installmentId) {
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
  
  // تعيين العنوان
  const title = document.getElementById('installment-modal-title');
  if (title) {
    title.textContent = 'تعديل القسط';
  }
  
  // ملء النموذج ببيانات القسط
  document.getElementById('installment-id').value = installmentId;
  document.getElementById('installment-investor-id').value = investorId;
  document.getElementById('installment-description').value = installment.description || '';
  document.getElementById('installment-amount').value = installment.amount || 0;
  document.getElementById('installment-due-date').value = installment.dueDate || '';
  document.getElementById('installment-notes').value = installment.notes || '';
  
  const priorityCheckbox = document.getElementById('installment-priority');
  if (priorityCheckbox) {
    priorityCheckbox.checked = installment.priority === 'high';
  }
  
  // إخفاء قائمة اختيار المستثمر
  const investorSelectContainer = document.getElementById('investor-select-container');
  if (investorSelectContainer) {
    investorSelectContainer.style.display = 'none';
  }
  
  // فتح النافذة
  openModal('add-installment-modal');
}

// فتح نافذة منبثقة
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  modal.classList.add('active');
}

// إغلاق نافذة منبثقة
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  modal.classList.remove('active');
}

// تنسيق التاريخ
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

// تنسيق المبلغ المالي
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

// الحصول على نص الفلتر
function getFilterText(filter) {
  switch (filter) {
    case 'overdue':
      return 'متأخرة';
    case 'today':
      return 'مستحقة اليوم';
    case 'upcoming':
      return 'قادمة';
    default:
      return '';
  }
}

// عرض إشعار للمستخدم
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

// حفظ بيانات القسط الجديد
function saveInstallment() {
  // الحصول على بيانات النموذج
  const installmentId = document.getElementById('installment-id').value;
  let investorId = document.getElementById('installment-investor-id').value;
  
  // إذا لم يتم تحديد مستثمر مسبقاً، نحصل عليه من القائمة
  if (!investorId) {
    const investorSelect = document.getElementById('installment-investor');
    if (investorSelect) {
      investorId = investorSelect.value;
    }
  }
  
  // التحقق من اختيار مستثمر
  if (!investorId) {
    showNotification('الرجاء اختيار مستثمر', 'error');
    return;
  }
  
  // الحصول على باقي البيانات
  const description = document.getElementById('installment-description').value;
  const amount = parseFloat(document.getElementById('installment-amount').value);
  const dueDate = document.getElementById('installment-due-date').value;
  const notes = document.getElementById('installment-notes').value;
  const priorityCheckbox = document.getElementById('installment-priority');
  const priority = priorityCheckbox && priorityCheckbox.checked ? 'high' : 'normal';
  
  // التحقق من صحة البيانات
  if (!description || isNaN(amount) || amount <= 0 || !dueDate) {
    showNotification('الرجاء ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
    return;
  }
  
  // البحث عن المستثمر
  const investor = window.investors.find(inv => inv.id === investorId);
  if (!investor) {
    showNotification('لم يتم العثور على بيانات المستثمر', 'error');
    return;
  }
  
  // التأكد من وجود مصفوفة الأقساط
  if (!investor.installments) {
    investor.installments = [];
  }
  
  // تحديد ما إذا كنا نضيف قسطاً جديداً أو نعدل قسطاً موجوداً
  if (installmentId) {
    // تعديل قسط موجود
    const existingIndex = investor.installments.findIndex(inst => inst.id === installmentId);
    if (existingIndex === -1) {
      showNotification('لم يتم العثور على بيانات القسط', 'error');
      return;
    }
    
    // الحفاظ على المبلغ المدفوع من القسط الأصلي
    const paidAmount = investor.installments[existingIndex].paidAmount || 0;
    const remainingAmount = Math.max(0, amount - paidAmount);
    
    // تحديث بيانات القسط
    investor.installments[existingIndex] = {
      ...investor.installments[existingIndex],
      description,
      amount,
      dueDate,
      notes,
      priority,
      remainingAmount,
      updatedAt: new Date().toISOString()
    };
    
    // تحديث حالة القسط بناءً على المبلغ المتبقي
    if (remainingAmount <= 0) {
      investor.installments[existingIndex].status = 'paid';
    } else {
      investor.installments[existingIndex].status = 'active';
    }
    
    showNotification('تم تحديث بيانات القسط بنجاح', 'success');
  } else {
    // إضافة قسط جديد
    const newInstallment = {
      id: Date.now().toString(),
      description,
      amount,
      dueDate,
      notes,
      priority,
      status: 'active',
      paidAmount: 0,
      remainingAmount: amount,
      createdAt: new Date().toISOString()
    };
    
    investor.installments.push(newInstallment);
    showNotification('تم إضافة القسط الجديد بنجاح', 'success');
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