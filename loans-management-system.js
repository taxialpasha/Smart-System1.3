/**
 * نظام إدارة القروض والسلف
 * هذا النظام مستقل تماماً عن نظام أقساط المستثمرين
 */

// البيانات الرئيسية للنظام
let loansData = {
    loans: [],
    payments: [],
    settings: {
        defaultInterestRate: 5,
        defaultLoanDuration: 12,
        maxLoanAmount: 50000000,
        currencySymbol: 'دينار',
        guarantorRequirements: ['بطاقة موحدة', 'تأييد الدائرة'],
        notificationEnabled: true
    }
};

// تصنيفات المقترضين
const borrowerCategories = [
    { id: 'employee', name: 'موظف', icon: 'fa-user-tie' },
    { id: 'hash', name: 'حشد شعبي', icon: 'fa-shield-alt' },
    { id: 'police', name: 'شرطة', icon: 'fa-badge' },
    { id: 'kaseb', name: 'كاسب', icon: 'fa-store' },
    { id: 'company', name: 'موظف الشركة', icon: 'fa-building' },
    { id: 'social', name: 'الرعاية الاجتماعية', icon: 'fa-hands-helping' }
];

// أنواع المستمسكات المطلوبة
const documentTypes = [
    { id: 'id_front', name: 'البطاقة الموحدة - الأمامية', required: true },
    { id: 'id_back', name: 'البطاقة الموحدة - الخلفية', required: true },
    { id: 'residence_front', name: 'بطاقة السكن - الأمامية', required: true },
    { id: 'residence_back', name: 'بطاقة السكن - الخلفية', required: true },
    { id: 'work_certificate', name: 'تأييد الدائرة', required: true }
];

// تهيئة النظام
function initLoanSystem() {
    console.log('تهيئة نظام إدارة القروض والسلف...');
    
    // إضافة زر النظام إلى الشريط الجانبي
    addLoanSystemToSidebar();
    
    // إنشاء صفحة نظام القروض
    createLoanSystemPage();
    
    // تحميل البيانات من التخزين المحلي
    loadLoanData();
    
    // تهيئة مستمعي الأحداث
    initLoanEventListeners();
    
    console.log('تم تهيئة نظام إدارة القروض والسلف بنجاح');
}

// إضافة زر النظام إلى الشريط الجانبي
function addLoanSystemToSidebar() {
    const navList = document.querySelector('.nav-list');
    if (!navList) return;
    
    // البحث عن زر الإعدادات لإضافة الزر قبله
    const settingsItem = document.querySelector('.nav-link[data-page="settings"]');
    const settingsLi = settingsItem ? settingsItem.closest('.nav-item') : null;
    
    // إنشاء عنصر القائمة الجديد
    const loanItem = document.createElement('li');
    loanItem.className = 'nav-item';
    loanItem.innerHTML = `
        <a class="nav-link" data-page="loans" href="#">
            <div class="nav-icon">
                <i class="fas fa-hand-holding-usd"></i>
            </div>
            <span>القروض والسلف</span>
        </a>
    `;
    
    // إضافة العنصر قبل الإعدادات
    if (settingsLi) {
        navList.insertBefore(loanItem, settingsLi);
    } else {
        navList.appendChild(loanItem);
    }
    
    // إضافة مستمع للحدث
    loanItem.querySelector('.nav-link').addEventListener('click', function(e) {
        e.preventDefault();
        showLoanSystemPage();
    });
}

// إنشاء صفحة نظام القروض
function createLoanSystemPage() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    const loanPage = document.createElement('div');
    loanPage.className = 'page';
    loanPage.id = 'loans-page';
    
    loanPage.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">نظام إدارة القروض والسلف</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" id="loan-search" placeholder="بحث في القروض..." type="text" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-primary" id="add-loan-btn">
                    <i class="fas fa-plus"></i>
                    <span>إضافة قرض جديد</span>
                </button>
                <button class="btn btn-outline" id="loan-settings-btn">
                    <i class="fas fa-cog"></i>
                    <span>إعدادات</span>
                </button>
                <button class="btn btn-outline" id="export-loans-btn">
                    <i class="fas fa-file-download"></i>
                    <span>تصدير</span>
                </button>
            </div>
        </div>
        
        <div class="loan-dashboard">
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-pattern">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="card-title">القروض النشطة</div>
                            <div class="card-value" id="active-loans-count">0</div>
                            <div class="card-change">
                                <span id="active-loans-total">0 دينار</span>
                            </div>
                        </div>
                        <div class="card-icon primary">
                            <i class="fas fa-file-invoice-dollar"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-pattern">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="card-title">الفوائد المتوقعة</div>
                            <div class="card-value" id="expected-interest">0 دينار</div>
                            <div class="card-change">
                                <span id="interest-percentage">%5</span>
                            </div>
                        </div>
                        <div class="card-icon success">
                            <i class="fas fa-percentage"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-pattern">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="card-title">عدد المقترضين</div>
                            <div class="card-value" id="borrowers-count">0</div>
                            <div class="card-change">
                                <span id="new-borrowers">0 جديد هذا الشهر</span>
                            </div>
                        </div>
                        <div class="card-icon warning">
                            <i class="fas fa-user-friends"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-pattern">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="card-title">الأقساط المستحقة</div>
                            <div class="card-value" id="due-payments-count">0</div>
                            <div class="card-change">
                                <span id="due-payments-amount">0 دينار</span>
                            </div>
                        </div>
                        <div class="card-icon danger">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="tabs">
            <div class="tab-buttons">
                <button class="tab-btn active" data-tab="all-loans">جميع القروض</button>
                <button class="tab-btn" data-tab="due-payments">الأقساط المستحقة</button>
                <button class="tab-btn" data-tab="loan-statistics">الإحصائيات</button>
            </div>
            
            <div class="tab-content active" id="all-loans-tab">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">قائمة القروض والسلف</h2>
                        <div class="section-actions">
                            <div class="btn-group">
                                <button class="btn btn-outline btn-sm active" data-category="all">الكل</button>
                                ${borrowerCategories.map(cat => `
                                    <button class="btn btn-outline btn-sm" data-category="${cat.id}">${cat.name}</button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table id="loans-table">
                            <thead>
                                <tr>
                                    <th>رقم القرض</th>
                                    <th>المقترض</th>
                                    <th>التصنيف</th>
                                    <th>المبلغ</th>
                                    <th>الفائدة</th>
                                    <th>القسط الشهري</th>
                                    <th>تاريخ البدء</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="loans-tbody">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="due-payments-tab">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">قائمة الأقساط المستحقة</h2>
                        <div class="section-actions">
                            <div class="btn-group">
                                <button class="btn btn-outline btn-sm active" data-status="current">الشهر الحالي</button>
                                <button class="btn btn-outline btn-sm" data-status="overdue">متأخرة</button>
                                <button class="btn btn-outline btn-sm" data-status="paid">مدفوعة</button>
                                <button class="btn btn-outline btn-sm" data-status="all">الكل</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table id="payments-table">
                            <thead>
                                <tr>
                                    <th>رقم القسط</th>
                                    <th>رقم القرض</th>
                                    <th>المقترض</th>
                                    <th>المبلغ المستحق</th>
                                    <th>تاريخ الاستحقاق</th>
                                    <th>حالة الدفع</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="payments-tbody">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="loan-statistics-tab">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">إحصائيات القروض</h2>
                    </div>
                    
                    <div class="grid-cols-2">
                        <div class="chart-container">
                            <canvas id="loans-by-category-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <canvas id="loan-status-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    mainContent.appendChild(loanPage);
}

// عرض صفحة نظام القروض
function showLoanSystemPage() {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // إظهار صفحة القروض
    const loanPage = document.getElementById('loans-page');
    if (loanPage) {
        loanPage.classList.add('active');
        
        // تحديث القائمة الجانبية
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const loanNavLink = document.querySelector('.nav-link[data-page="loans"]');
        if (loanNavLink) {
            loanNavLink.classList.add('active');
        }
        
        // تحديث البيانات
        updateLoansDashboard();
        renderLoansTable();
        renderPaymentsTable();
        updateLoanCharts();
    }
}

// إنشاء نافذة إضافة قرض جديد
function createAddLoanModal() {
    // إزالة النافذة القديمة إن وجدت
    const oldModal = document.getElementById('add-loan-modal');
    if (oldModal) oldModal.remove();
    
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'add-loan-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal loan-modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">إضافة قرض جديد</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="loan-wizard">
                    <div class="wizard-steps">
                        <div class="wizard-step active" data-step="1">
                            <span class="step-number">1</span>
                            <span class="step-title">معلومات القرض</span>
                        </div>
                        <div class="wizard-step" data-step="2">
                            <span class="step-number">2</span>
                            <span class="step-title">بيانات المقترض</span>
                        </div>
                        <div class="wizard-step" data-step="3">
                            <span class="step-number">3</span>
                            <span class="step-title">المستمسكات</span>
                        </div>
                        <div class="wizard-step" data-step="4">
                            <span class="step-number">4</span>
                            <span class="step-title">الكفلاء</span>
                        </div>
                    </div>
                    
                    <form id="add-loan-form">
                        <div class="wizard-content">
                            <div class="wizard-panel active" data-panel="1">
                                <div class="grid-cols-2">
                                    <div class="form-group">
                                        <label class="form-label">تصنيف المقترض</label>
                                        <select class="form-select" id="borrower-category" required>
                                            <option value="">اختر التصنيف</option>
                                            ${borrowerCategories.map(cat => `
                                                <option value="${cat.id}">${cat.name}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">مبلغ القرض</label>
                                        <input type="number" class="form-input" id="loan-amount" min="1000" step="1000" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">نسبة الفائدة (%)</label>
                                        <input type="number" class="form-input" id="interest-rate" step="0.1" value="5" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">مدة القرض (شهور)</label>
                                        <input type="number" class="form-input" id="loan-duration" min="1" value="12" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">تاريخ البدء</label>
                                        <input type="date" class="form-input" id="start-date" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="wizard-panel" data-panel="2">
                                <div class="grid-cols-2">
                                    <div class="form-group">
                                        <label class="form-label">اسم المقترض</label>
                                        <input type="text" class="form-input" id="borrower-name" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">رقم الهاتف</label>
                                        <input type="tel" class="form-input" id="borrower-phone" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">العنوان</label>
                                        <input type="text" class="form-input" id="borrower-address" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">الراتب الشهري</label>
                                        <input type="number" class="form-input" id="borrower-salary" min="0" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">مكان العمل</label>
                                        <input type="text" class="form-input" id="borrower-workplace" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="wizard-panel" data-panel="3">
                                <div class="documents-section">
                                    <h4>المستمسكات المطلوبة</h4>
                                    ${documentTypes.map(doc => `
                                        <div class="document-upload">
                                            <label class="form-label">${doc.name}</label>
                                            <div class="file-input-wrapper">
                                                <input type="file" id="doc-${doc.id}" accept="image/*,application/pdf" ${doc.required ? 'required' : ''}>
                                                <button type="button" class="btn btn-outline btn-file">
                                                    <i class="fas fa-cloud-upload-alt"></i>
                                                    <span>اختر ملف</span>
                                                </button>
                                                <div class="file-preview" id="preview-${doc.id}"></div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="wizard-panel" data-panel="4">
                                <div class="guarantors-section">
                                    <div class="section-header">
                                        <h4>قائمة الكفلاء</h4>
                                        <button type="button" class="btn btn-outline btn-sm" id="add-guarantor-btn">
                                            <i class="fas fa-plus"></i>
                                            <span>إضافة كفيل</span>
                                        </button>
                                    </div>
                                    <div id="guarantors-list">
                                        <!-- سيتم ملؤها ديناميكياً -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" id="prev-step-btn" style="display: none;">السابق</button>
                <button class="btn btn-primary" id="next-step-btn">التالي</button>
                <button class="btn btn-success" id="save-loan-btn" style="display: none;">حفظ القرض</button>
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    initLoanWizard();
}

// تهيئة مستمعي الأحداث
function initLoanEventListeners() {
    // زر إضافة قرض جديد
    document.addEventListener('click', function(e) {
        if (e.target.closest('#add-loan-btn')) {
            createAddLoanModal();
            openModal('add-loan-modal');
        }
    });
    
    // زر الإعدادات
    document.addEventListener('click', function(e) {
        if (e.target.closest('#loan-settings-btn')) {
            openLoanSettings();
        }
    });
    
    // زر التصدير
    document.addEventListener('click', function(e) {
        if (e.target.closest('#export-loans-btn')) {
            exportLoanData();
        }
    });
    
    // البحث في القروض
    document.addEventListener('input', function(e) {
        if (e.target.id === 'loan-search') {
            searchLoans(e.target.value);
        }
    });
    
    // تصفية القروض حسب الفئة
    document.addEventListener('click', function(e) {
        const categoryBtn = e.target.closest('[data-category]');
        if (categoryBtn) {
            filterLoansByCategory(categoryBtn.dataset.category);
        }
    });
    
    // تصفية الأقساط حسب الحالة
    document.addEventListener('click', function(e) {
        const statusBtn = e.target.closest('[data-status]');
        if (statusBtn) {
            filterPaymentsByStatus(statusBtn.dataset.status);
        }
    });
}

// تحديث لوحة التحكم
function updateLoansDashboard() {
    const activeLoans = loansData.loans.filter(loan => loan.status === 'active');
    const totalInterest = activeLoans.reduce((sum, loan) => sum + loan.totalInterest, 0);
    const uniqueBorrowers = new Set(loansData.loans.map(loan => loan.borrowerId)).size;
    const duePayments = getDuePayments();
    
    document.getElementById('active-loans-count').textContent = activeLoans.length;
    document.getElementById('active-loans-total').textContent = formatCurrency(
        activeLoans.reduce((sum, loan) => sum + loan.remainingAmount, 0)
    );
    document.getElementById('expected-interest').textContent = formatCurrency(totalInterest);
    document.getElementById('borrowers-count').textContent = uniqueBorrowers;
    document.getElementById('due-payments-count').textContent = duePayments.length;
    document.getElementById('due-payments-amount').textContent = formatCurrency(
        duePayments.reduce((sum, payment) => sum + payment.amount, 0)
    );
}

// حفظ البيانات في التخزين المحلي
function saveLoanData() {
    try {
        localStorage.setItem('loansData', JSON.stringify(loansData));
        return true;
    } catch (error) {
        console.error('خطأ في حفظ بيانات القروض:', error);
        return false;
    }
}

// تحميل البيانات من التخزين المحلي
function loadLoanData() {
    try {
        const savedData = localStorage.getItem('loansData');
        if (savedData) {
            loansData = JSON.parse(savedData);
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات القروض:', error);
    }
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('جاري تهيئة نظام القروض...');
    initLoanSystem();
});

// دالة مساعدة لتنسيق العملة
function formatCurrency(amount, showSymbol = true) {
    const formattedAmount = Number(amount).toLocaleString('ar-IQ');
    return showSymbol ? `${formattedAmount} ${loansData.settings.currencySymbol}` : formattedAmount;
}

// دالة الحصول على الأقساط المستحقة
function getDuePayments() {
    const today = new Date();
    return loansData.payments.filter(payment => {
        const dueDate = new Date(payment.dueDate);
        return payment.status === 'unpaid' && dueDate <= today;
    });
}

// تصدير بيانات القروض
function exportLoanData() {
    const dataStr = JSON.stringify(loansData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `loans-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

// فتح إعدادات النظام
function openLoanSettings() {
    // إنشاء نافذة الإعدادات
    const settingsModal = document.createElement('div');
    settingsModal.className = 'modal-overlay';
    settingsModal.id = 'loan-settings-modal';
    
    settingsModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">إعدادات نظام القروض</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="loan-settings-form">
                    <div class="form-group">
                        <label class="form-label">نسبة الفائدة الافتراضية (%)</label>
                        <input type="number" class="form-input" id="default-interest-rate" 
                               value="${loansData.settings.defaultInterestRate}" step="0.1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">مدة القرض الافتراضية (شهور)</label>
                        <input type="number" class="form-input" id="default-loan-duration" 
                               value="${loansData.settings.defaultLoanDuration}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">الحد الأقصى لمبلغ القرض</label>
                        <input type="number" class="form-input" id="max-loan-amount" 
                               value="${loansData.settings.maxLoanAmount}" step="1000000">
                    </div>
                    <div class="form-group">
                        <label class="form-label">رمز العملة</label>
                        <input type="text" class="form-input" id="currency-symbol" 
                               value="${loansData.settings.currencySymbol}">
                    </div>
                    <div class="form-group">
                        <div class="form-check">
                            <input type="checkbox" id="notification-enabled" 
                                   ${loansData.settings.notificationEnabled ? 'checked' : ''}>
                            <label for="notification-enabled">تفعيل إشعارات الأقساط</label>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-primary" id="save-settings-btn">حفظ الإعدادات</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(settingsModal);
    openModal('loan-settings-modal');
    
    // مستمع لحفظ الإعدادات
    document.getElementById('save-settings-btn').addEventListener('click', function() {
        loansData.settings.defaultInterestRate = parseFloat(document.getElementById('default-interest-rate').value);
        loansData.settings.defaultLoanDuration = parseInt(document.getElementById('default-loan-duration').value);
        loansData.settings.maxLoanAmount = parseInt(document.getElementById('max-loan-amount').value);
        loansData.settings.currencySymbol = document.getElementById('currency-symbol').value;
        loansData.settings.notificationEnabled = document.getElementById('notification-enabled').checked;
        
        saveLoanData();
        closeModal('loan-settings-modal');
        showNotification('تم حفظ الإعدادات بنجاح', 'success');
    });
}

// البحث في القروض
function searchLoans(query) {
    const query_lower = query.toLowerCase();
    const filteredLoans = loansData.loans.filter(loan => 
        loan.borrowerName.toLowerCase().includes(query_lower) ||
        loan.id.toString().includes(query_lower) ||
        loan.borrowerPhone.includes(query)
    );
    renderLoansTable(filteredLoans);
}

// تصفية القروض حسب الفئة
function filterLoansByCategory(category) {
    let filteredLoans = loansData.loans;
    if (category !== 'all') {
        filteredLoans = loansData.loans.filter(loan => loan.category === category);
    }
    renderLoansTable(filteredLoans);
}

// تصفية الأقساط حسب الحالة
function filterPaymentsByStatus(status) {
    let filteredPayments = loansData.payments;
    const today = new Date();
    
    switch (status) {
        case 'current':
            filteredPayments = loansData.payments.filter(payment => {
                const dueDate = new Date(payment.dueDate);
                return payment.status === 'unpaid' && 
                       dueDate.getMonth() === today.getMonth() &&
                       dueDate.getFullYear() === today.getFullYear();
            });
            break;
        case 'overdue':
            filteredPayments = loansData.payments.filter(payment => 
                payment.status === 'unpaid' && new Date(payment.dueDate) < today
            );
            break;
        case 'paid':
            filteredPayments = loansData.payments.filter(payment => payment.status === 'paid');
            break;
    }
    
    renderPaymentsTable(filteredPayments);
}

// عرض جدول القروض
function renderLoansTable(loans = loansData.loans) {
    const tbody = document.getElementById('loans-tbody');
    if (!tbody) return;
    
    if (loans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد قروض</td></tr>';
        return;
    }
    
    tbody.innerHTML = loans.map(loan => {
        const category = borrowerCategories.find(cat => cat.id === loan.category);
        const statusBadge = getStatusBadge(loan.status);
        
        return `
            <tr>
                <td>${loan.id}</td>
                <td>${loan.borrowerName}</td>
                <td><i class="fas ${category.icon}"></i> ${category.name}</td>
                <td>${formatCurrency(loan.amount)}</td>
                <td>${loan.interestRate}%</td>
                <td>${formatCurrency(loan.monthlyPayment)}</td>
                <td>${loan.startDate}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline view-loan" data-id="${loan.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline edit-loan" data-id="${loan.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline pay-installment" data-id="${loan.id}">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                        <button class="btn btn-sm btn-outline danger delete-loan" data-id="${loan.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // إضافة مستمعي الأحداث للأزرار
    tbody.querySelectorAll('.view-loan').forEach(btn => {
        btn.addEventListener('click', function() {
            viewLoanDetails(this.dataset.id);
        });
    });
    
    tbody.querySelectorAll('.edit-loan').forEach(btn => {
        btn.addEventListener('click', function() {
            editLoan(this.dataset.id);
        });
    });
    
    tbody.querySelectorAll('.pay-installment').forEach(btn => {
        btn.addEventListener('click', function() {
            openPaymentModal(this.dataset.id);
        });
    });
    
    tbody.querySelectorAll('.delete-loan').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteLoan(this.dataset.id);
        });
    });
}

// عرض جدول الأقساط
function renderPaymentsTable(payments = loansData.payments) {
    const tbody = document.getElementById('payments-tbody');
    if (!tbody) return;
    
    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد أقساط</td></tr>';
        return;
    }
    
    tbody.innerHTML = payments.map(payment => {
        const loan = loansData.loans.find(l => l.id === payment.loanId);
        const statusBadge = getPaymentStatusBadge(payment.status);
        
        return `
            <tr>
                <td>${payment.id}</td>
                <td>${payment.loanId}</td>
                <td>${loan ? loan.borrowerName : 'غير معروف'}</td>
                <td>${formatCurrency(payment.amount)}</td>
                <td>${payment.dueDate}</td>
                <td>${statusBadge}</td>
                <td>
                    ${payment.status === 'unpaid' ? `
                        <button class="btn btn-sm btn-primary pay-payment" data-id="${payment.id}">
                            <i class="fas fa-check"></i> دفع
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
    
    // إضافة مستمعي الأحداث
    tbody.querySelectorAll('.pay-payment').forEach(btn => {
        btn.addEventListener('click', function() {
            payInstallment(this.dataset.id);
        });
    });
}

// عرض تفاصيل القرض
function viewLoanDetails(loanId) {
    const loan = loansData.loans.find(l => l.id === loanId);
    if (!loan) return;
    
    // إنشاء نافذة عرض التفاصيل
    const detailsModal = document.createElement('div');
    detailsModal.className = 'modal-overlay';
    detailsModal.id = 'loan-details-modal';
    
    // إنشاء محتوى النافذة
    detailsModal.innerHTML = `
        <div class="modal loan-details-modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">تفاصيل القرض #${loan.id}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="tabs">
                    <div class="tab-buttons">
                        <button class="tab-btn active" data-tab="summary">ملخص القرض</button>
                        <button class="tab-btn" data-tab="schedule">جدول السداد</button>
                        <button class="tab-btn" data-tab="borrower">بيانات المقترض</button>
                        <button class="tab-btn" data-tab="documents">المستمسكات</button>
                        <button class="tab-btn" data-tab="guarantors">الكفلاء</button>
                    </div>
                    
                    <div class="tab-content active" id="summary-tab">
                        ${generateLoanSummary(loan)}
                    </div>
                    
                    <div class="tab-content" id="schedule-tab">
                        ${generatePaymentSchedule(loan)}
                    </div>
                    
                    <div class="tab-content" id="borrower-tab">
                        ${generateBorrowerDetails(loan)}
                    </div>
                    
                    <div class="tab-content" id="documents-tab">
                        ${generateDocumentsList(loan)}
                    </div>
                    
                    <div class="tab-content" id="guarantors-tab">
                        ${generateGuarantorsList(loan)}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إغلاق</button>
                <button class="btn btn-primary edit-loan-btn" data-id="${loan.id}">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                ${loan.status === 'active' ? `
                    <button class="btn btn-warning renew-loan-btn" data-id="${loan.id}">
                        <i class="fas fa-redo"></i> تجديد
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(detailsModal);
    openModal('loan-details-modal');
    
    // تهيئة التبويبات
    initModalTabs();
    
    // مستمعي الأحداث
    detailsModal.querySelector('.edit-loan-btn').addEventListener('click', function() {
        editLoan(this.dataset.id);
    });
    
    const renewBtn = detailsModal.querySelector('.renew-loan-btn');
    if (renewBtn) {
        renewBtn.addEventListener('click', function() {
            renewLoan(this.dataset.id);
        });
    }
}

// توليد ملخص القرض
function generateLoanSummary(loan) {
    const category = borrowerCategories.find(cat => cat.id === loan.category);
    const progress = (loan.paidPayments / loan.totalPayments) * 100;
    
    return `
        <div class="loan-summary">
            <div class="summary-grid">
                <div class="summary-item">
                    <label>التصنيف</label>
                    <div class="value"><i class="fas ${category.icon}"></i> ${category.name}</div>
                </div>
                <div class="summary-item">
                    <label>المبلغ</label>
                    <div class="value">${formatCurrency(loan.amount)}</div>
                </div>
                <div class="summary-item">
                    <label>نسبة الفائدة</label>
                    <div class="value">${loan.interestRate}%</div>
                </div>
                <div class="summary-item">
                    <label>القسط الشهري</label>
                    <div class="value">${formatCurrency(loan.monthlyPayment)}</div>
                </div>
                <div class="summary-item">
                    <label>المبلغ المتبقي</label>
                    <div class="value">${formatCurrency(loan.remainingAmount)}</div>
                </div>
                <div class="summary-item">
                    <label>تاريخ البدء</label>
                    <div class="value">${loan.startDate}</div>
                </div>
                <div class="summary-item">
                    <label>تاريخ النهاية</label>
                    <div class="value">${loan.endDate}</div>
                </div>
                <div class="summary-item">
                    <label>الحالة</label>
                    <div class="value">${getStatusBadge(loan.status)}</div>
                </div>
            </div>
            
            <div class="progress-section">
                <h4>تقدم السداد</h4>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${loan.paidPayments} من ${loan.totalPayments} أقساط (${progress.toFixed(1)}%)</div>
            </div>
        </div>
    `;
}

// توليد جدول السداد
function generatePaymentSchedule(loan) {
    const payments = loansData.payments.filter(p => p.loanId === loan.id);
    
    return `
        <div class="payment-schedule">
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th>رقم القسط</th>
                        <th>تاريخ الاستحقاق</th>
                        <th>المبلغ المستحق</th>
                        <th>المبلغ المدفوع</th>
                        <th>تاريخ الدفع</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${payments.map(payment => `
                        <tr>
                            <td>${payment.paymentNumber}</td>
                            <td>${payment.dueDate}</td>
                            <td>${formatCurrency(payment.amount)}</td>
                            <td>${payment.paidAmount ? formatCurrency(payment.paidAmount) : '-'}</td>
                            <td>${payment.paymentDate || '-'}</td>
                            <td>${getPaymentStatusBadge(payment.status)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// توليد بيانات المقترض
function generateBorrowerDetails(loan) {
    return `
        <div class="borrower-details">
            <div class="detail-grid">
                <div class="detail-item">
                    <label>الاسم الكامل</label>
                    <div class="value">${loan.borrowerName}</div>
                </div>
                <div class="detail-item">
                    <label>رقم الهاتف</label>
                    <div class="value">${loan.borrowerPhone}</div>
                </div>
                <div class="detail-item">
                    <label>العنوان</label>
                    <div class="value">${loan.borrowerAddress}</div>
                </div>
                <div class="detail-item">
                    <label>الراتب الشهري</label>
                    <div class="value">${formatCurrency(loan.borrowerSalary)}</div>
                </div>
                <div class="detail-item">
                    <label>مكان العمل</label>
                    <div class="value">${loan.borrowerWorkplace}</div>
                </div>
            </div>
        </div>
    `;
}

// دالة تهيئة التبويبات
function initModalTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // إزالة الحالة النشطة
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // تفعيل التبويب المحدد
            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// الحصول على شارة الحالة
function getStatusBadge(status) {
    const statusMap = {
        'active': { label: 'نشط', class: 'success' },
        'completed': { label: 'مكتمل', class: 'info' },
        'renewed': { label: 'مجدد', class: 'warning' },
        'overdue': { label: 'متأخر', class: 'danger' },
        'cancelled': { label: 'ملغي', class: 'secondary' }
    };
    
    const badge = statusMap[status] || { label: status, class: 'secondary' };
    return `<span class="badge badge-${badge.class}">${badge.label}</span>`;
}

// الحصول على شارة حالة الدفع
function getPaymentStatusBadge(status) {
    const statusMap = {
        'paid': { label: 'مدفوع', class: 'success' },
        'unpaid': { label: 'غير مدفوع', class: 'danger' },
        'partial': { label: 'مدفوع جزئياً', class: 'warning' },
        'cancelled': { label: 'ملغي', class: 'secondary' }
    };
    
    const badge = statusMap[status] || { label: status, class: 'secondary' };
    return `<span class="badge badge-${badge.class}">${badge.label}</span>`;
}

// فتح نافذة الدفع
function openPaymentModal(loanId) {
    const loan = loansData.loans.find(l => l.id === loanId);
    const nextPayment = loansData.payments.find(p => p.loanId === loanId && p.status === 'unpaid');
    
    if (!loan || !nextPayment) return;
    
    const paymentModal = document.createElement('div');
    paymentModal.className = 'modal-overlay';
    paymentModal.id = 'payment-modal';
    
    paymentModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">دفع قسط - ${loan.borrowerName}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="payment-info">
                    <div class="info-item">
                        <label>رقم القسط</label>
                        <span class="value">${nextPayment.paymentNumber}</span>
                    </div>
                    <div class="info-item">
                        <label>تاريخ الاستحقاق</label>
                        <span class="value">${nextPayment.dueDate}</span>
                    </div>
                    <div class="info-item">
                        <label>المبلغ المستحق</label>
                        <span class="value">${formatCurrency(nextPayment.amount)}</span>
                    </div>
                </div>
                
                <form id="payment-form">
                    <input type="hidden" id="payment-id" value="${nextPayment.id}">
                    <input type="hidden" id="loan-id" value="${loanId}">
                    
                    <div class="form-group">
                        <label class="form-label">تاريخ الدفع</label>
                        <input type="date" class="form-input" id="payment-date" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">المبلغ المدفوع</label>
                        <input type="number" class="form-input" id="payment-amount" value="${nextPayment.amount}" min="0" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">ملاحظات</label>
                        <textarea class="form-input" id="payment-notes" rows="3"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-success" id="confirm-payment-btn">تأكيد الدفع</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(paymentModal);
    openModal('payment-modal');
    
    // مستمع لتأكيد الدفع
    document.getElementById('confirm-payment-btn').addEventListener('click', function() {
        processPayment();
    });
}

// معالجة الدفع
function processPayment() {
    const paymentId = document.getElementById('payment-id').value;
    const loanId = document.getElementById('loan-id').value;
    const paymentDate = document.getElementById('payment-date').value;
    const paidAmount = parseFloat(document.getElementById('payment-amount').value);
    const notes = document.getElementById('payment-notes').value;
    
    // تحديث بيانات الدفع
    const payment = loansData.payments.find(p => p.id === paymentId);
    if (payment) {
        payment.paidAmount = paidAmount;
        payment.paymentDate = paymentDate;
        payment.notes = notes;
        payment.status = paidAmount >= payment.amount ? 'paid' : 'partial';
        
        // تحديث حالة القرض
        const loan = loansData.loans.find(l => l.id === loanId);
        if (loan) {
            loan.paidPayments++;
            loan.remainingAmount -= paidAmount;
            
            // التحقق من اكتمال السداد
            if (loan.paidPayments >= loan.totalPayments) {
                loan.status = 'completed';
            }
        }
        
        saveLoanData();
        closeModal('payment-modal');
        showNotification('تم تسجيل الدفع بنجاح', 'success');
        
        // تحديث الواجهة
        updateLoansDashboard();
        renderLoansTable();
        renderPaymentsTable();
    }
}

// حذف قرض
function deleteLoan(loanId) {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا القرض؟')) return;
    
    // حذف القرض
    loansData.loans = loansData.loans.filter(l => l.id !== loanId);
    // حذف الأقساط المرتبطة
    loansData.payments = loansData.payments.filter(p => p.loanId !== loanId);
    
    saveLoanData();
    showNotification('تم حذف القرض بنجاح', 'success');
    
    updateLoansDashboard();
    renderLoansTable();
}

// تحديث الرسوم البيانية
function updateLoanCharts() {
    // رسم توزيع القروض حسب الفئة
    const categoryChart = document.getElementById('loans-by-category-chart');
    if (categoryChart && window.Chart) {
        const categoryData = borrowerCategories.map(cat => {
            return loansData.loans.filter(loan => loan.category === cat.id).length;
        });
        
        new Chart(categoryChart, {
            type: 'doughnut',
            data: {
                labels: borrowerCategories.map(cat => cat.name),
                datasets: [{
                    data: categoryData,
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // رسم حالة القروض
    const statusChart = document.getElementById('loan-status-chart');
    if (statusChart && window.Chart) {
        const statusCount = {
            active: 0,
            completed: 0,
            overdue: 0,
            cancelled: 0
        };
        
        loansData.loans.forEach(loan => {
            if (statusCount.hasOwnProperty(loan.status)) {
                statusCount[loan.status]++;
            }
        });
        
        new Chart(statusChart, {
            type: 'bar',
            data: {
                labels: ['نشط', 'مكتمل', 'متأخر', 'ملغي'],
                datasets: [{
                    label: 'عدد القروض',
                    data: [statusCount.active, statusCount.completed, statusCount.overdue, statusCount.cancelled],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// تهيئة التنقل بين خطوات المعالج
function initLoanWizard() {
    let currentStep = 1;
    const totalSteps = 4;
    
    const steps = document.querySelectorAll('.wizard-step');
    const panels = document.querySelectorAll('.wizard-panel');
    const prevBtn = document.getElementById('prev-step-btn');
    const nextBtn = document.getElementById('next-step-btn');
    const saveBtn = document.getElementById('save-loan-btn');
    
    // تحديث عرض الخطوة
    function updateStepView() {
        // تحديث شارات الخطوات
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === currentStep);
            step.classList.toggle('completed', stepNum < currentStep);
        });
        
        // عرض اللوحة المناسبة
        panels.forEach(panel => {
            panel.classList.toggle('active', parseInt(panel.dataset.panel) === currentStep);
        });
        
        // عرض/إخفاء الأزرار
        prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-block';
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-block';
        saveBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';
    }
    
    // الانتقال للخطوة السابقة
    prevBtn.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            updateStepView();
        }
    });
    
    // الانتقال للخطوة التالية
    nextBtn.addEventListener('click', function() {
        if (validateCurrentStep() && currentStep < totalSteps) {
            currentStep++;
            updateStepView();
            
            // إضافة حقل الكفيل الأول تلقائياً في الخطوة 4
            if (currentStep === 4) {
                addGuarantor();
            }
        }
    });
    
    // حفظ القرض
    saveBtn.addEventListener('click', function() {
        if (validateCurrentStep()) {
            saveLoan();
        }
    });
    
    // التحقق من الخطوة الحالية
    function validateCurrentStep() {
        const currentPanel = document.querySelector(`[data-panel="${currentStep}"]`);
        const inputs = currentPanel.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });
        
        return isValid;
    }
    
    // تهيئة عرض الخطوة الأولى
    updateStepView();
}

// حفظ القرض الجديد
function saveLoan() {
    const loanData = {
        id: Date.now().toString(),
        category: document.getElementById('borrower-category').value,
        amount: parseFloat(document.getElementById('loan-amount').value),
        interestRate: parseFloat(document.getElementById('interest-rate').value),
        duration: parseInt(document.getElementById('loan-duration').value),
        startDate: document.getElementById('start-date').value,
        borrowerName: document.getElementById('borrower-name').value,
        borrowerPhone: document.getElementById('borrower-phone').value,
        borrowerAddress: document.getElementById('borrower-address').value,
        borrowerSalary: parseFloat(document.getElementById('borrower-salary').value),
        borrowerWorkplace: document.getElementById('borrower-workplace').value,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    // حساب الدفعة الشهرية
    const monthlyPayment = calculateMonthlyPayment(loanData.amount, loanData.interestRate, loanData.duration);
    loanData.monthlyPayment = monthlyPayment;
    loanData.totalPayments = loanData.duration;
    loanData.totalAmount = monthlyPayment * loanData.duration;
    loanData.totalInterest = loanData.totalAmount - loanData.amount;
    loanData.remainingAmount = loanData.totalAmount;
    loanData.paidPayments = 0;
    
    // حساب تاريخ النهاية
    const endDate = new Date(loanData.startDate);
    endDate.setMonth(endDate.getMonth() + loanData.duration);
    loanData.endDate = endDate.toISOString().split('T')[0];
    
    // إنشاء جدول الأقساط
    const payments = [];
    const startDate = new Date(loanData.startDate);
    
    for (let i = 0; i < loanData.duration; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        payments.push({
            id: `${loanData.id}-${i + 1}`,
            loanId: loanData.id,
            paymentNumber: i + 1,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: monthlyPayment,
            status: 'unpaid'
        });
    }
    
    // حفظ البيانات
    loansData.loans.push(loanData);
    loansData.payments.push(...payments);
    
    saveLoanData();
    closeModal('add-loan-modal');
    showNotification('تم إضافة القرض بنجاح', 'success');
    
    // تحديث الواجهة
    updateLoansDashboard();
    renderLoansTable();
}

// دالة حساب القسط الشهري
function calculateMonthlyPayment(principal, annualRate, months) {
    const monthlyRate = annualRate / 100 / 12;
    const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
}

// إضافة حقل كفيل
function addGuarantor() {
    const guarantorsList = document.getElementById('guarantors-list');
    const guarantorIndex = guarantorsList.children.length;
    
    const guarantorDiv = document.createElement('div');
    guarantorDiv.className = 'guarantor-item';
    guarantorDiv.dataset.index = guarantorIndex;
    
    guarantorDiv.innerHTML = `
        <div class="guarantor-header">
            <h5>كفيل ${guarantorIndex + 1}</h5>
            <button type="button" class="btn btn-sm btn-danger remove-guarantor">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        
        <div class="grid-cols-2">
            <div class="form-group">
                <label class="form-label">اسم الكفيل</label>
                <input type="text" class="form-input guarantor-name" required>
            </div>
            <div class="form-group">
                <label class="form-label">رقم الهاتف</label>
                <input type="tel" class="form-input guarantor-phone" required>
            </div>
            <div class="form-group">
                <label class="form-label">العنوان</label>
                <input type="text" class="form-input guarantor-address" required>
            </div>
            <div class="form-group">
                <label class="form-label">مكان العمل</label>
                <input type="text" class="form-input guarantor-workplace" required>
            </div>
        </div>
        
        <div class="guarantor-docs">
            <h5>مستمسكات الكفيل</h5>
            <div class="grid-cols-2">
                <div class="form-group">
                    <label class="form-label">البطاقة الموحدة - الأمامية</label>
                    <input type="file" class="form-input guarantor-id-front" accept="image/*" required>
                </div>
                <div class="form-group">
                    <label class="form-label">البطاقة الموحدة - الخلفية</label>
                    <input type="file" class="form-input guarantor-id-back" accept="image/*" required>
                </div>
            </div>
        </div>
    `;
    
    guarantorsList.appendChild(guarantorDiv);
    
    // إضافة مستمع لزر الحذف
    guarantorDiv.querySelector('.remove-guarantor').addEventListener('click', function() {
        guarantorDiv.remove();
        updateGuarantorIndexes();
    });
}

// تحديث أرقام الكفلاء
function updateGuarantorIndexes() {
    const guarantorItems = document.querySelectorAll('.guarantor-item');
    guarantorItems.forEach((item, index) => {
        item.dataset.index = index;
        item.querySelector('h5').textContent = `كفيل ${index + 1}`;
    });
}

// إضافة زر إضافة كفيل
document.addEventListener('click', function(e) {
    if (e.target.closest('#add-guarantor-btn')) {
        addGuarantor();
    }
});

// التعامل مع رفع الملفات
document.addEventListener('change', function(e) {
    if (e.target.type === 'file') {
        const file = e.target.files[0];
        if (file) {
            const previewDiv = document.getElementById(`preview-${e.target.id.replace('doc-', '')}`);
            if (previewDiv) {
                const fileInfo = document.createElement('div');
                fileInfo.className = 'file-info';
                fileInfo.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>${file.name}</span>
                `;
                previewDiv.innerHTML = '';
                previewDiv.appendChild(fileInfo);
            }
        }
    }
});

// إضافة دالة لعرض قائمة المستمسكات
function generateDocumentsList(loan) {
    return `
        <div class="documents-list">
            <h4>المستمسكات المقدمة</h4>
            <div class="documents-grid">
                ${documentTypes.map(doc => `
                    <div class="document-item">
                        <div class="document-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="document-name">${doc.name}</div>
                        <button class="btn btn-sm btn-outline view-document" data-id="${doc.id}">
                            <i class="fas fa-eye"></i> عرض
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// إضافة دالة لعرض قائمة الكفلاء
function generateGuarantorsList(loan) {
    return `
        <div class="guarantors-list">
            <h4>قائمة الكفلاء</h4>
            ${loan.guarantors && loan.guarantors.length > 0 ? `
                ${loan.guarantors.map((guarantor, index) => `
                    <div class="guarantor-card">
                        <div class="guarantor-header">
                            <h5>كفيل ${index + 1}</h5>
                        </div>
                        <div class="guarantor-details">
                            <div class="detail-item">
                                <label>الاسم</label>
                                <span>${guarantor.name}</span>
                            </div>
                            <div class="detail-item">
                                <label>رقم الهاتف</label>
                                <span>${guarantor.phone}</span>
                            </div>
                            <div class="detail-item">
                                <label>العنوان</label>
                                <span>${guarantor.address}</span>
                            </div>
                            <div class="detail-item">
                                <label>مكان العمل</label>
                                <span>${guarantor.workplace}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            ` : '<p>لم يتم إضافة كفلاء لهذا القرض.</p>'}
        </div>
    `;
}

// إضافة دالة لتجديد القرض
function renewLoan(loanId) {
    const loan = loansData.loans.find(l => l.id === loanId);
    if (!loan) return;
    
    if (!confirm('هل تريد تجديد هذا القرض؟')) return;
    
    // تحديث حالة القرض القديم
    loan.status = 'renewed';
    
    // إنشاء قرض جديد بناءً على القديم
    const newLoan = {
        ...loan,
        id: Date.now().toString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        paidPayments: 0,
        remainingAmount: loan.totalAmount,
        parentLoanId: loanId // إضافة ارتباط بالقرض القديم
    };
    
    // إلغاء الأقساط القديمة غير المدفوعة
    loansData.payments.forEach(payment => {
        if (payment.loanId === loanId && payment.status === 'unpaid') {
            payment.status = 'cancelled';
        }
    });
    
    // إنشاء جدول أقساط جديد
    const startDate = new Date(newLoan.startDate);
    const payments = [];
    
    for (let i = 0; i < newLoan.duration; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        payments.push({
            id: `${newLoan.id}-${i + 1}`,
            loanId: newLoan.id,
            paymentNumber: i + 1,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: newLoan.monthlyPayment,
            status: 'unpaid'
        });
    }
    
    // حفظ البيانات
    loansData.loans.push(newLoan);
    loansData.payments.push(...payments);
    
    saveLoanData();
    closeModal('loan-details-modal');
    showNotification('تم تجديد القرض بنجاح', 'success');
    
    // تحديث الواجهة
    updateLoansDashboard();
    renderLoansTable();
}

// إضافة دالة لتعديل القرض
function editLoan(loanId) {
    // يمكن إضافة دالة التعديل حسب المتطلبات
    // مثال: فتح نافذة تعديل مع بيانات القرض الحالية
    console.log('تعديل القرض:', loanId);
    closeModal('loan-details-modal');
    createAddLoanModal(); // نفتح نفس النافذة لكن بتحميل البيانات السابقة
    openModal('add-loan-modal');
}

// إضافة دالة لدفع قسط محدد
function payInstallment(paymentId) {
    const payment = loansData.payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    const loan = loansData.loans.find(l => l.id === payment.loanId);
    if (!loan) return;
    
    openPaymentModal(loan.id);
}

// دالة مساعدة لفتح نافذة منبثقة عامة
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// دالة مساعدة لإغلاق نافذة منبثقة عامة
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // إزالة النافذة من الصفحة بعد إغلاقها
        setTimeout(() => {
            if (modal.parentElement) {
                modal.parentElement.removeChild(modal);
            }
        }, 300);
    }
}

// إضافة مستمعي الإغلاق العامة للنوافذ المنبثقة
document.addEventListener('click', function(e) {
    // إغلاق النوافذ المنبثقة
    if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-close-btn')) {
        const modal = e.target.closest('.modal-overlay');
        if (modal) {
            closeModal(modal.id);
        }
    }
});

// إضافة تنسيقات إضافية للنظام
const loanStyles = `
    /* أنماط خاصة بنظام القروض */
    .loan-dashboard {
        margin-bottom: 1.5rem;
    }
    
    .loan-modal {
        max-width: 900px;
    }
    
    .wizard-steps {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2rem;
        position: relative;
    }
    
    .wizard-steps::before {
        content: '';
        position: absolute;
        top: 20px;
        left: 0;
        right: 0;
        height: 2px;
        background: #e2e2e2;
        z-index: 1;
    }
    
    .wizard-step {
        display: flex;
        align-items: center;
        position: relative;
        z-index: 2;
        background: #fff;
        padding: 0 10px;
    }
    
    .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e2e2e2;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-left: 10px;
    }
    
    .wizard-step.active .step-number {
        background: #3b82f6;
        color: #fff;
    }
    
    .wizard-step.completed .step-number {
        background: #10b981;
        color: #fff;
    }
    
    .wizard-panel {
        display: none;
    }
    
    .wizard-panel.active {
        display: block;
    }
    
    .guarantor-item {
        border: 1px solid #e2e2e2;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
    }
    
    .guarantor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .documents-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .document-item {
        border: 1px solid #e2e2e2;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
    }
    
    .document-icon {
        font-size: 2rem;
        color: #3b82f6;
        margin-bottom: 0.5rem;
    }
    
    .loan-summary .progress-bar {
        height: 20px;
        background: #f3f4f6;
        border-radius: 10px;
        overflow: hidden;
        margin: 1rem 0;
    }
    
    .loan-summary .progress {
        height: 100%;
        background: #3b82f6;
        transition: width 0.5s ease;
    }
    
    .payment-info {
        background: #f9fafb;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
    }
    
    .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    
    .info-item label {
        font-weight: 500;
        color: #6b7280;
    }
    
    .info-item .value {
        font-weight: bold;
        color: #111827;
    }
    
    /* تحسينات للجداول */
    .schedule-table {
        width: 100%;
        margin-top: 1rem;
    }
    
    .schedule-table th,
    .schedule-table td {
        padding: 0.75rem;
        text-align: center;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .schedule-table th {
        background: #f9fafb;
        font-weight: 600;
    }
    
    /* تنسيق للشارات */
    .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
    }
    
    .badge-success {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
    }
    
    .badge-danger {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
    }
    
    .badge-warning {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
    }
    
    .badge-info {
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
    }
    
    .badge-secondary {
        background: rgba(107, 114, 128, 0.1);
        color: #6b7280;
    }
`;

// إضافة التنسيقات إلى الصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = loanStyles;
document.head.appendChild(styleSheet);

console.log('تم تحميل نظام إدارة القروض والسلف بنجاح');