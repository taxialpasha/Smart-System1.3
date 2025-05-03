/**
 * نظام إدارة السلف والقروض المتكامل
 * يوفر إدارة شاملة للقروض، المقترضين، الأقساط، الكفلاء والمستمسكات
 * يتكامل مع نظام الاستثمار المتكامل
 */

// تهيئة النظام
(function() {
    'use strict';
    
    // تهيئة المتغيرات الرئيسية
    window.loans = []; // قائمة القروض
    window.borrowers = []; // قائمة المقترضين
    window.guarantors = []; // قائمة الكفلاء
    window.installments = []; // قائمة الأقساط
    window.documents = []; // قائمة المستمسكات
    
    // إعدادات النظام الافتراضية
    const loansSettings = {
        defaultInterestRate: 15, // نسبة الفائدة الافتراضية
        defaultLoanPeriod: 12, // مدة القرض الافتراضية (بالأشهر)
        maxLoanAmount: 10000000, // الحد الأقصى لمبلغ القرض
        currency: 'دينار', // العملة
        guarantorsRequired: 2, // عدد الكفلاء المطلوب
        enableNotifications: true, // تفعيل إشعارات الأقساط
        autoCalculatePayments: true, // حساب الأقساط تلقائياً
        loanTypes: [ // أنواع القروض
            'موظف',
            'حشد شعبي',
            'شرطة',
            'كاسب',
            'موظف الشركة',
            'الرعاية الاجتماعية'
        ]
    };
    
    // ألوان تصنيفات المقترضين
    const borrowerCategories = [
        { id: 'employee', name: 'موظف', color: '#3b82f6' },
        { id: 'mobilization', name: 'حشد شعبي', color: '#10b981' },
        { id: 'police', name: 'شرطة', color: '#4f46e5' },
        { id: 'earner', name: 'كاسب', color: '#f59e0b' },
        { id: 'company', name: 'موظف الشركة', color: '#ef4444' },
        { id: 'welfare', name: 'الرعاية الاجتماعية', color: '#8b5cf6' }
    ];
    
    // أنواع المستمسكات المطلوبة
    const documentTypes = [
        { id: 'national_id', name: 'البطاقة الموحدة', requireBack: true },
        { id: 'residence_card', name: 'بطاقة السكن', requireBack: true },
        { id: 'department_confirmation', name: 'تأييد الدائرة', requireBack: false }
    ];
    
    /**
     * تهيئة نظام القروض
     */
    function initLoanSystem() {
        console.log('تهيئة نظام إدارة السلف والقروض...');
        
        // إضافة أزرار التنقل إلى الشريط الجانبي
        addLoanNavItems();
        
        // إنشاء صفحات نظام القروض
        createLoanPages();
        
        // تحميل بيانات القروض
        loadLoanData();
        
        // إضافة مستمعي الأحداث
        setupLoanEventListeners();
        
        // إنشاء النوافذ المنبثقة
        createLoanModals();
        
        console.log('تم تهيئة نظام القروض بنجاح');
    }
    
    /**
     * إضافة أزرار تنقل القروض إلى الشريط الجانبي
     */
    function addLoanNavItems() {
        const navList = document.querySelector('.nav-list');
        if (!navList) return false;
        
        // إضافة قسم القروض والسلف
        const loanNavItem = createNavItem('القروض والسلف', 'fas fa-hand-holding-usd', 'loans-dashboard');
        navList.appendChild(loanNavItem);
        
        // إضافة قسم المقترضين
        const borrowersNavItem = createNavItem('المقترضين', 'fas fa-users-cog', 'borrowers');
        navList.appendChild(borrowersNavItem);
        
        // إضافة قسم الأقساط النشطة
        const activeInstallmentsNavItem = createNavItem('الأقساط النشطة', 'fas fa-calendar-check', 'active-installments');
        activeInstallmentsNavItem.innerHTML += '<span class="loan-badge" id="active-installments-badge">0</span>';
        navList.appendChild(activeInstallmentsNavItem);
        
        // إضافة قسم الأقساط المدفوعة
        const paidInstallmentsNavItem = createNavItem('الأقساط المدفوعة', 'fas fa-money-check-alt', 'paid-installments');
        navList.appendChild(paidInstallmentsNavItem);
        
        return true;
    }
    
    /**
     * إنشاء عنصر تنقل
     */
    function createNavItem(title, icon, page) {
        const navItem = document.createElement('li');
        navItem.className = 'nav-item';
        navItem.innerHTML = `
            <a class="nav-link" data-page="${page}" href="#">
                <div class="nav-icon">
                    <i class="${icon}"></i>
                </div>
                <span>${title}</span>
            </a>
        `;
        
        // إضافة مستمع الحدث
        navItem.addEventListener('click', function(e) {
            e.preventDefault();
            showLoanPage(page);
        });
        
        return navItem;
    }
    
    /**
     * إنشاء صفحات نظام القروض
     */
    function createLoanPages() {
        createLoansDashboardPage();
        createBorrowersPage();
        createActiveInstallmentsPage();
        createPaidInstallmentsPage();
    }
    
    /**
     * إنشاء صفحة لوحة تحكم القروض
     */
    function createLoansDashboardPage() {
        if (document.getElementById('loans-dashboard-page')) return;
        
        const pageElement = document.createElement('div');
        pageElement.className = 'page';
        pageElement.id = 'loans-dashboard-page';
        
        pageElement.innerHTML = `
            <div class="header">
                <h1 class="page-title">نظام إدارة القروض والسلف</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="loans-search" placeholder="بحث عن قرض..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <button class="btn btn-primary" id="add-loan-btn">
                        <i class="fas fa-plus"></i>
                        <span>إضافة قرض جديد</span>
                    </button>
                </div>
            </div>
            
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">إجمالي القروض النشطة</div>
                            <div class="card-value" id="total-active-loans">0 ${loansSettings.currency}</div>
                        </div>
                        <div class="card-icon primary">
                            <i class="fas fa-hand-holding-usd"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الفوائد المتوقعة</div>
                            <div class="card-value" id="expected-interest">0 ${loansSettings.currency}</div>
                        </div>
                        <div class="card-icon success">
                            <i class="fas fa-percentage"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">عدد المقترضين</div>
                            <div class="card-value" id="borrowers-count">0</div>
                        </div>
                        <div class="card-icon warning">
                            <i class="fas fa-user-tie"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الأقساط المستحقة هذا الشهر</div>
                            <div class="card-value" id="due-installments">0 ${loansSettings.currency}</div>
                        </div>
                        <div class="card-icon info">
                            <i class="fas fa-calendar-day"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">قائمة القروض والسلف</h2>
                    <div class="section-actions">
                        <div class="btn-group">
                            <button class="btn btn-outline btn-sm active" data-loan-type="all">الكل</button>
                            ${loansSettings.loanTypes.map(type => `
                                <button class="btn btn-outline btn-sm" data-loan-type="${type}">${type}</button>
                            `).join('')}
                        </div>
                        <button class="btn btn-outline btn-sm" id="export-loans-btn">
                            <i class="fas fa-download"></i>
                            <span>تصدير</span>
                        </button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="loans-table">
                        <thead>
                            <tr>
                                <th>المعرف</th>
                                <th>اسم المقترض</th>
                                <th>نوع القرض</th>
                                <th>المبلغ</th>
                                <th>الفائدة</th>
                                <th>المدة</th>
                                <th>تاريخ البدء</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="9" class="text-center">جاري تحميل بيانات القروض...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">الأقساط المستحقة</h2>
                    <div class="section-actions">
                        <div class="btn-group">
                            <button class="btn btn-outline btn-sm active" data-installment-status="current">الشهر الحالي</button>
                            <button class="btn btn-outline btn-sm" data-installment-status="late">متأخرة</button>
                            <button class="btn btn-outline btn-sm" data-installment-status="paid">مدفوعة</button>
                            <button class="btn btn-outline btn-sm" data-installment-status="all">الكل</button>
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    <table id="installments-table">
                        <thead>
                            <tr>
                                <th>المعرف</th>
                                <th>اسم المقترض</th>
                                <th>رقم القسط</th>
                                <th>تاريخ الاستحقاق</th>
                                <th>المبلغ</th>
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
            
            <div class="grid-cols-2">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">توزيع القروض حسب الفئة</h2>
                    </div>
                    <div class="chart-container">
                        <canvas id="loans-distribution-chart"></canvas>
                    </div>
                </div>
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">حالة سداد الأقساط</h2>
                    </div>
                    <div class="chart-container">
                        <canvas id="installments-status-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelector('.main-content').appendChild(pageElement);
    }
    
    /**
     * إنشاء صفحة المقترضين
     */
    function createBorrowersPage() {
        if (document.getElementById('borrowers-page')) return;
        
        const pageElement = document.createElement('div');
        pageElement.className = 'page';
        pageElement.id = 'borrowers-page';
        
        pageElement.innerHTML = `
            <div class="header">
                <h1 class="page-title">المقترضين</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="borrowers-search" placeholder="بحث عن مقترض..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">قائمة المقترضين</h2>
                    <div class="section-actions">
                        <div class="btn-group">
                            <button class="btn btn-outline btn-sm active" data-borrower-type="all">الكل</button>
                            ${loansSettings.loanTypes.map(type => `
                                <button class="btn btn-outline btn-sm" data-borrower-type="${type}">${type}</button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    <table id="borrowers-table">
                        <thead>
                            <tr>
                                <th>المعرف</th>
                                <th>الاسم</th>
                                <th>رقم الهاتف</th>
                                <th>التصنيف</th>
                                <th>عدد القروض</th>
                                <th>إجمالي القروض</th>
                                <th>مكان العمل</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="9" class="text-center">جاري تحميل بيانات المقترضين...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.querySelector('.main-content').appendChild(pageElement);
    }
    
    /**
     * إنشاء صفحة الأقساط النشطة
     */
    function createActiveInstallmentsPage() {
        if (document.getElementById('active-installments-page')) return;
        
        const pageElement = document.createElement('div');
        pageElement.className = 'page';
        pageElement.id = 'active-installments-page';
        
        pageElement.innerHTML = `
            <div class="header">
                <h1 class="page-title">الأقساط النشطة</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="active-installments-search" placeholder="بحث عن قسط..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الأقساط المستحقة اليوم</div>
                            <div class="card-value" id="today-installments">0 ${loansSettings.currency}</div>
                        </div>
                        <div class="card-icon danger">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الأقساط المستحقة هذا الأسبوع</div>
                            <div class="card-value" id="week-installments">0 ${loansSettings.currency}</div>
                        </div>
                        <div class="card-icon warning">
                            <i class="fas fa-calendar-week"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الأقساط المستحقة هذا الشهر</div>
                            <div class="card-value" id="month-installments">0 ${loansSettings.currency}</div>
                        </div>
                        <div class="card-icon info">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الأقساط المتأخرة</div>
                            <div class="card-value" id="late-installments">0 ${loansSettings.currency}</div>
                        </div>
                        <div class="card-icon danger">
                            <i class="fas fa-calendar-times"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">قائمة الأقساط النشطة</h2>
                    <div class="section-actions">
                        <div class="btn-group">
                            <button class="btn btn-outline btn-sm active" data-installment-status="all">الكل</button>
                            <button class="btn btn-outline btn-sm" data-installment-status="today">اليوم</button>
                            <button class="btn btn-outline btn-sm" data-installment-status="week">هذا الأسبوع</button>
                            <button class="btn btn-outline btn-sm" data-installment-status="month">هذا الشهر</button>
                            <button class="btn btn-outline btn-sm" data-installment-status="late">متأخرة</button>
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    <table id="active-installments-table">
                        <thead>
                            <tr>
                                <th>المعرف</th>
                                <th>اسم المقترض</th>
                                <th>رقم القسط</th>
                                <th>تاريخ الاستحقاق</th>
                                <th>المبلغ</th>
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
        
        document.querySelector('.main-content').appendChild(pageElement);
    }
    
    /**
     * إنشاء صفحة الأقساط المدفوعة
     */
    function createPaidInstallmentsPage() {
        if (document.getElementById('paid-installments-page')) return;
        
        const pageElement = document.createElement('div');
        pageElement.className = 'page';
        pageElement.id = 'paid-installments-page';
        
        pageElement.innerHTML = `
            <div class="header">
                <h1 class="page-title">الأقساط المدفوعة</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="paid-installments-search" placeholder="بحث عن قسط..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <div class="date-range">
                        <label>من:</label>
                        <input type="date" id="paid-from-date" />
                        <label>إلى:</label>
                        <input type="date" id="paid-to-date" />
                        <button class="btn btn-outline btn-sm" id="filter-paid-dates-btn">
                            <i class="fas fa-filter"></i>
                            <span>تصفية</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">سجل الأقساط المدفوعة</h2>
                    <div class="section-actions">
                        <div class="btn-group">
                            <button class="btn btn-outline btn-sm active" data-paid-period="all">الكل</button>
                            <button class="btn btn-outline btn-sm" data-paid-period="today">اليوم</button>
                            <button class="btn btn-outline btn-sm" data-paid-period="week">هذا الأسبوع</button>
                            <button class="btn btn-outline btn-sm" data-paid-period="month">هذا الشهر</button>
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    <table id="paid-installments-table">
                        <thead>
                            <tr>
                                <th>المعرف</th>
                                <th>اسم المقترض</th>
                                <th>رقم القسط</th>
                                <th>تاريخ الاستحقاق</th>
                                <th>تاريخ الدفع</th>
                                <th>المبلغ</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="7" class="text-center">جاري تحميل بيانات الأقساط المدفوعة...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.querySelector('.main-content').appendChild(pageElement);
    }
    
    /**
     * إضافة النوافذ المنبثقة
     */
    function createLoanModals() {
        createAddLoanModal();
        createLoanDetailsModal();
        createPayInstallmentModal();
    }
    
    /**
     * إنشاء نافذة إضافة قرض جديد
     */
    function createAddLoanModal() {
        if (document.getElementById('add-loan-modal')) return;
        
        const modalElement = document.createElement('div');
        modalElement.className = 'modal-overlay';
        modalElement.id = 'add-loan-modal';
        
        modalElement.innerHTML = `
            <div class="modal wide-modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">إضافة قرض جديد</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="tab-buttons loan-wizard-tabs">
                        <button class="tab-btn active" data-tab="loan-info">
                            <i class="fas fa-info-circle"></i>
                            <span>معلومات القرض</span>
                        </button>
                        <button class="tab-btn" data-tab="borrower-info">
                            <i class="fas fa-user"></i>
                            <span>بيانات المقترض</span>
                        </button>
                        <button class="tab-btn" data-tab="documents-info">
                            <i class="fas fa-file-alt"></i>
                            <span>المستمسكات</span>
                        </button>
                        <button class="tab-btn" data-tab="guarantor-info">
                            <i class="fas fa-user-shield"></i>
                            <span>الكفلاء</span>
                        </button>
                    </div>
                    
                    <div class="tab-content active" id="loan-info-tab">
                        <form id="loan-info-form">
                            <div class="grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">نوع القرض</label>
                                    <select class="form-select" id="loan-type" required>
                                        <option value="">اختر نوع القرض</option>
                                        ${loansSettings.loanTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">المبلغ</label>
                                    <input type="number" class="form-input" id="loan-amount" min="1" step="100000" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">نسبة الفائدة (%)</label>
                                    <input type="number" class="form-input" id="loan-interest-rate" min="0" max="100" step="0.5" value="${loansSettings.defaultInterestRate}" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">مدة القرض (بالأشهر)</label>
                                    <input type="number" class="form-input" id="loan-period" min="1" max="120" value="${loansSettings.defaultLoanPeriod}" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">تاريخ بدء القرض</label>
                                    <input type="date" class="form-input" id="loan-start-date" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">ملاحظات</label>
                                    <textarea class="form-input" id="loan-notes" rows="3"></textarea>
                                </div>
                            </div>
                            
                            <div class="loan-payment-preview">
                                <h4>معاينة الأقساط</h4>
                                <div class="payment-summary">
                                    <div class="payment-info">
                                        <div class="payment-label">مبلغ القرض:</div>
                                        <div class="payment-value" id="preview-loan-amount">0 ${loansSettings.currency}</div>
                                    </div>
                                    
                                    <div class="payment-info">
                                        <div class="payment-label">إجمالي الفائدة:</div>
                                        <div class="payment-value" id="preview-interest-amount">0 ${loansSettings.currency}</div>
                                    </div>
                                    
                                    <div class="payment-info">
                                        <div class="payment-label">المبلغ الإجمالي:</div>
                                        <div class="payment-value" id="preview-total-amount">0 ${loansSettings.currency}</div>
                                    </div>
                                    
                                    <div class="payment-info">
                                        <div class="payment-label">القسط الشهري:</div>
                                        <div class="payment-value" id="preview-monthly-payment">0 ${loansSettings.currency}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-primary next-tab" data-next="borrower-info">التالي</button>
                            </div>
                        </form>
                    </div>
                    
                    <div class="tab-content" id="borrower-info-tab">
                        <form id="borrower-info-form">
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
                                    <input type="number" class="form-input" id="borrower-salary" min="0" step="50000">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">مكان العمل</label>
                                    <input type="text" class="form-input" id="borrower-workplace">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">ملاحظات</label>
                                    <textarea class="form-input" id="borrower-notes" rows="3"></textarea>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-outline prev-tab" data-prev="loan-info">السابق</button>
                                <button type="button" class="btn btn-primary next-tab" data-next="documents-info">التالي</button>
                            </div>
                        </form>
                    </div>
                    
                    <div class="tab-content" id="documents-info-tab">
                        <h4>مستمسكات المقترض</h4>
                        <div class="grid-cols-2">
                            ${documentTypes.map(doc => `
                                <div class="document-upload-container">
                                    <label class="form-label">${doc.name}</label>
                                    <div class="document-upload">
                                        <input type="file" id="${doc.id}-front" accept="image/*" hidden>
                                        <label for="${doc.id}-front" class="document-upload-label">
                                            <i class="fas fa-upload"></i>
                                            <span>رفع الوجه الأمامي</span>
                                        </label>
                                        <div class="document-preview" id="${doc.id}-front-preview"></div>
                                    </div>
                                    ${doc.requireBack ? `
                                        <div class="document-upload">
                                            <input type="file" id="${doc.id}-back" accept="image/*" hidden>
                                            <label for="${doc.id}-back" class="document-upload-label">
                                                <i class="fas fa-upload"></i>
                                                <span>رفع الوجه الخلفي</span>
                                            </label>
                                            <div class="document-preview" id="${doc.id}-back-preview"></div>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline prev-tab" data-prev="borrower-info">السابق</button>
                            <button type="button" class="btn btn-primary next-tab" data-next="guarantor-info">التالي</button>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="guarantor-info-tab">
                        <h4>معلومات الكفلاء</h4>
                        <p>مطلوب ${loansSettings.guarantorsRequired} كفيل على الأقل</p>
                        
                        <div id="guarantors-list">
                            <!-- سيتم إضافة الكفلاء هنا ديناميكياً -->
                        </div>
                        
                        <button type="button" class="btn btn-outline" id="add-guarantor-btn">
                            <i class="fas fa-plus"></i>
                            <span>إضافة كفيل</span>
                        </button>
                        
                        <div class="form-actions mt-4">
                            <button type="button" class="btn btn-outline prev-tab" data-prev="documents-info">السابق</button>
                            <button type="button" class="btn btn-primary" id="save-loan-btn">حفظ القرض</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalElement);
        setupAddLoanModalEvents();
    }
    
    /**
     * إضافة مستمعي الأحداث لنافذة إضافة قرض
     */
    function setupAddLoanModalEvents() {
        // التنقل بين التبويبات
        document.querySelectorAll('.next-tab').forEach(button => {
            button.addEventListener('click', function() {
                const nextTabId = this.getAttribute('data-next');
                if (validateTabForm(this.closest('.tab-content').id)) {
                    switchToTab(nextTabId);
                }
            });
        });
        
        document.querySelectorAll('.prev-tab').forEach(button => {
            button.addEventListener('click', function() {
                const prevTabId = this.getAttribute('data-prev');
                switchToTab(prevTabId);
            });
        });
        
        // حساب الأقساط تلقائياً
        ['loan-amount', 'loan-interest-rate', 'loan-period'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', calculateLoanPaymentPreview);
            }
        });
        
        // إضافة كفيل
        document.getElementById('add-guarantor-btn').addEventListener('click', addNewGuarantor);
        
        // حفظ القرض
        document.getElementById('save-loan-btn').addEventListener('click', saveLoan);
        
        // تعيين تاريخ اليوم كافتراضي
        document.getElementById('loan-start-date').value = new Date().toISOString().split('T')[0];
        
        // إضافة كفيل افتراضي
        addNewGuarantor();
        
        // مستمعي أحداث رفع المستندات
        setupDocumentUploadEvents();
    }
    
    /**
     * التبديل بين التبويبات
     */
    function switchToTab(tabId) {
        document.querySelectorAll('.loan-wizard-tabs .tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }
    
    /**
     * التحقق من صحة بيانات التبويب
     */
    function validateTabForm(tabId) {
        switch (tabId) {
            case 'loan-info-tab':
                const loanType = document.getElementById('loan-type').value;
                const loanAmount = parseFloat(document.getElementById('loan-amount').value);
                const loanInterestRate = parseFloat(document.getElementById('loan-interest-rate').value);
                const loanPeriod = parseInt(document.getElementById('loan-period').value);
                const loanStartDate = document.getElementById('loan-start-date').value;
                
                if (!loanType || isNaN(loanAmount) || loanAmount <= 0 || 
                    isNaN(loanInterestRate) || loanInterestRate < 0 || 
                    isNaN(loanPeriod) || loanPeriod <= 0 || 
                    !loanStartDate) {
                    showNotification('يرجى ملء جميع البيانات المطلوبة بشكل صحيح', 'error');
                    return false;
                }
                return true;
                
            case 'borrower-info-tab':
                const borrowerName = document.getElementById('borrower-name').value;
                const borrowerPhone = document.getElementById('borrower-phone').value;
                const borrowerAddress = document.getElementById('borrower-address').value;
                
                if (!borrowerName || !borrowerPhone || !borrowerAddress) {
                    showNotification('يرجى ملء البيانات الأساسية للمقترض', 'error');
                    return false;
                }
                return true;
                
            case 'documents-info-tab':
                let allDocumentsUploaded = true;
                documentTypes.forEach(doc => {
                    const frontFile = document.getElementById(`${doc.id}-front`).files;
                    const backFile = doc.requireBack ? document.getElementById(`${doc.id}-back`).files : null;
                    
                    if (frontFile.length === 0 || (doc.requireBack && backFile.length === 0)) {
                        allDocumentsUploaded = false;
                    }
                });
                
                if (!allDocumentsUploaded) {
                    showNotification('يرجى رفع جميع المستمسكات المطلوبة', 'error');
                    return false;
                }
                return true;
                
            default:
                return true;
        }
    }
    
    /**
     * حساب معاينة الأقساط
     */
    function calculateLoanPaymentPreview() {
        const loanAmount = parseFloat(document.getElementById('loan-amount').value) || 0;
        const interestRate = parseFloat(document.getElementById('loan-interest-rate').value) || 0;
        const loanPeriod = parseInt(document.getElementById('loan-period').value) || 1;
        
        const totalInterest = loanAmount * (interestRate / 100) * (loanPeriod / 12);
        const totalAmount = loanAmount + totalInterest;
        const monthlyPayment = totalAmount / loanPeriod;
        
        document.getElementById('preview-loan-amount').textContent = `${loanAmount.toLocaleString()} ${loansSettings.currency}`;
        document.getElementById('preview-interest-amount').textContent = `${totalInterest.toLocaleString()} ${loansSettings.currency}`;
        document.getElementById('preview-total-amount').textContent = `${totalAmount.toLocaleString()} ${loansSettings.currency}`;
        document.getElementById('preview-monthly-payment').textContent = `${monthlyPayment.toLocaleString()} ${loansSettings.currency}`;
    }
    
    /**
     * إضافة كفيل جديد
     */
    function addNewGuarantor() {
        const guarantorsList = document.getElementById('guarantors-list');
        const guarantorId = Date.now();
        
        const guarantorElement = document.createElement('div');
        guarantorElement.className = 'guarantor-item';
        guarantorElement.id = `guarantor-${guarantorId}`;
        
        guarantorElement.innerHTML = `
            <div class="guarantor-header">
                <h5>كفيل #${guarantorsList.children.length + 1}</h5>
                <button type="button" class="btn btn-icon-sm remove-guarantor-btn" data-guarantor="${guarantorId}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="grid-cols-2">
                <div class="form-group">
                    <label class="form-label">اسم الكفيل</label>
                    <input type="text" class="form-input" id="guarantor-name-${guarantorId}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">رقم الهاتف</label>
                    <input type="tel" class="form-input" id="guarantor-phone-${guarantorId}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">العنوان</label>
                    <input type="text" class="form-input" id="guarantor-address-${guarantorId}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">مكان العمل</label>
                    <input type="text" class="form-input" id="guarantor-workplace-${guarantorId}">
                </div>
            </div>
            
            <div class="grid-cols-2 mt-3">
                <div class="document-upload-container">
                    <label class="form-label">البطاقة الموحدة (الوجه الأمامي)</label>
                    <div class="document-upload">
                        <input type="file" id="guarantor-id-front-${guarantorId}" accept="image/*" hidden>
                        <label for="guarantor-id-front-${guarantorId}" class="document-upload-label">
                            <i class="fas fa-upload"></i>
                            <span>اختيار ملف</span>
                        </label>
                        <div class="document-preview" id="guarantor-id-front-preview-${guarantorId}"></div>
                    </div>
                </div>
                
                <div class="document-upload-container">
                    <label class="form-label">البطاقة الموحدة (الوجه الخلفي)</label>
                    <div class="document-upload">
                        <input type="file" id="guarantor-id-back-${guarantorId}" accept="image/*" hidden>
                        <label for="guarantor-id-back-${guarantorId}" class="document-upload-label">
                            <i class="fas fa-upload"></i>
                            <span>اختيار ملف</span>
                        </label>
                        <div class="document-preview" id="guarantor-id-back-preview-${guarantorId}"></div>
                    </div>
                </div>
            </div>
        `;
        
        guarantorsList.appendChild(guarantorElement);
        
        // إضافة مستمع حدث لزر حذف الكفيل
        const removeBtn = guarantorElement.querySelector('.remove-guarantor-btn');
        removeBtn.addEventListener('click', function() {
            guarantorElement.remove();
            updateGuarantorNumbers();
        });
        
        // إضافة مستمعي أحداث لرفع الصور
        setupGuarantorDocumentEvents(guarantorId);
    }
    
    /**
     * تحديث ترقيم الكفلاء
     */
    function updateGuarantorNumbers() {
        document.querySelectorAll('.guarantor-item').forEach((item, index) => {
            item.querySelector('h5').textContent = `كفيل #${index + 1}`;
        });
    }
    
    /**
     * إعداد مستمعي أحداث رفع المستندات
     */
    function setupDocumentUploadEvents() {
        documentTypes.forEach(doc => {
            const frontInput = document.getElementById(`${doc.id}-front`);
            const backInput = document.getElementById(`${doc.id}-back`);
            
            if (frontInput) {
                frontInput.addEventListener('change', function() {
                    previewImage(this, `${doc.id}-front-preview`);
                });
            }
            
            if (backInput) {
                backInput.addEventListener('change', function() {
                    previewImage(this, `${doc.id}-back-preview`);
                });
            }
        });
    }
    
    /**
     * إعداد مستمعي أحداث رفع مستندات الكفيل
     */
    function setupGuarantorDocumentEvents(guarantorId) {
        const frontInput = document.getElementById(`guarantor-id-front-${guarantorId}`);
        const backInput = document.getElementById(`guarantor-id-back-${guarantorId}`);
        
        if (frontInput) {
            frontInput.addEventListener('change', function() {
                previewImage(this, `guarantor-id-front-preview-${guarantorId}`);
            });
        }
        
        if (backInput) {
            backInput.addEventListener('change', function() {
                previewImage(this, `guarantor-id-back-preview-${guarantorId}`);
            });
        }
    }
    
    /**
     * عرض معاينة للصورة المختارة
     */
    function previewImage(input, previewId) {
        const preview = document.getElementById(previewId);
        if (!preview) return;
        
        preview.innerHTML = '';
        
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const filePreview = document.createElement('div');
                filePreview.className = 'file-preview';
                
                filePreview.innerHTML = `
                    <img src="${e.target.result}" alt="معاينة" />
                    <div class="file-info">
                        <span class="file-name">${input.files[0].name}</span>
                        <span class="file-size">${(input.files[0].size / 1024).toFixed(2)} KB</span>
                    </div>
                `;
                
                preview.appendChild(filePreview);
            };
            
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    /**
     * حفظ القرض الجديد
     */
    function saveLoan() {
        const guarantorsList = document.getElementById('guarantors-list');
        if (!guarantorsList || guarantorsList.children.length < loansSettings.guarantorsRequired) {
            showNotification(`يرجى إضافة ${loansSettings.guarantorsRequired} كفيل على الأقل`, 'error');
            return;
        }
        
        // جمع بيانات القرض
        const loanData = {
            id: Date.now().toString(),
            type: document.getElementById('loan-type').value,
            amount: parseFloat(document.getElementById('loan-amount').value),
            interestRate: parseFloat(document.getElementById('loan-interest-rate').value),
            period: parseInt(document.getElementById('loan-period').value),
            startDate: document.getElementById('loan-start-date').value,
            notes: document.getElementById('loan-notes').value || '',
            status: 'نشط',
            createdAt: new Date().toISOString()
        };
        
        // جمع بيانات المقترض
        loanData.borrower = {
            name: document.getElementById('borrower-name').value,
            phone: document.getElementById('borrower-phone').value,
            address: document.getElementById('borrower-address').value,
            salary: parseFloat(document.getElementById('borrower-salary').value) || 0,
            workplace: document.getElementById('borrower-workplace').value || '',
            notes: document.getElementById('borrower-notes').value || ''
        };
        
        // إنشاء جدول الأقساط
        loanData.installments = createInstallmentSchedule(loanData);
        
        // جمع بيانات الكفلاء
        loanData.guarantors = [];
        document.querySelectorAll('.guarantor-item').forEach(item => {
            const guarantorId = item.id.split('-')[1];
            loanData.guarantors.push({
                id: guarantorId,
                name: document.getElementById(`guarantor-name-${guarantorId}`).value,
                phone: document.getElementById(`guarantor-phone-${guarantorId}`).value,
                address: document.getElementById(`guarantor-address-${guarantorId}`).value,
                workplace: document.getElementById(`guarantor-workplace-${guarantorId}`).value || ''
            });
        });
        
        // إضافة القرض للقائمة
        window.loans.push(loanData);
        
        // إضافة الأقساط للقائمة
        window.installments = [...window.installments, ...loanData.installments];
        
        // حفظ البيانات
        saveLoanData();
        
        // إغلاق النافذة المنبثقة
        closeModal('add-loan-modal');
        
        // تحديث الواجهة
        refreshLoansUI();
        
        // عرض إشعار النجاح
        showNotification('تم إضافة القرض بنجاح', 'success');
    }
    
    /**
     * إنشاء جدول الأقساط
     */
    function createInstallmentSchedule(loanData) {
        const installmentsList = [];
        const totalInterest = loanData.amount * (loanData.interestRate / 100) * (loanData.period / 12);
        const totalAmount = loanData.amount + totalInterest;
        const monthlyPayment = totalAmount / loanData.period;
        const startDate = new Date(loanData.startDate);
        
        for (let i = 0; i < loanData.period; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(startDate.getMonth() + i + 1);
            
            installmentsList.push({
                id: `${loanData.id}-${i+1}`,
                loanId: loanData.id,
                number: i + 1,
                amount: monthlyPayment,
                dueDate: dueDate.toISOString().split('T')[0],
                paidAmount: 0,
                paymentDate: null,
                status: 'غير مدفوع',
                notes: '',
                createdAt: new Date().toISOString()
            });
        }
        
        return installmentsList;
    }
    
    /**
     * إنشاء نافذة تفاصيل القرض
     */
    function createLoanDetailsModal() {
        if (document.getElementById('loan-details-modal')) return;
        
        const modalElement = document.createElement('div');
        modalElement.className = 'modal-overlay';
        modalElement.id = 'loan-details-modal';
        
        modalElement.innerHTML = `
            <div class="modal wide-modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تفاصيل القرض</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="tab-buttons">
                        <button class="tab-btn active" data-tab="loan-summary">ملخص القرض</button>
                        <button class="tab-btn" data-tab="payment-schedule">جدول السداد</button>
                        <button class="tab-btn" data-tab="borrower-details">بيانات المقترض</button>
                        <button class="tab-btn" data-tab="documents">المستمسكات</button>
                        <button class="tab-btn" data-tab="guarantors">الكفلاء</button>
                    </div>
                    
                    <div class="tab-content active" id="loan-summary-tab">
                        <div class="loan-summary">
                            <div class="loan-summary-header">
                                <div class="loan-info">
                                    <h4>قرض #<span id="loan-detail-id"></span></h4>
                                    <span class="badge badge-status" id="loan-detail-status"></span>
                                </div>
                                <div class="loan-dates">
                                    <div>تاريخ البدء: <span id="loan-detail-start-date"></span></div>
                                    <div>تاريخ الإنشاء: <span id="loan-detail-created-at"></span></div>
                                </div>
                            </div>
                            
                            <div class="grid-cols-2">
                                <div class="loan-detail-card">
                                    <div class="loan-detail-title">ملخص القرض</div>
                                    <div class="loan-detail-content" id="loan-detail-content"></div>
                                </div>
                                
                                <div class="loan-detail-card">
                                    <div class="loan-detail-title">حالة السداد</div>
                                    <div class="loan-detail-content" id="loan-payment-status"></div>
                                </div>
                            </div>
                            
                            <div class="loan-chart-container">
                                <canvas id="loan-payment-progress-chart"></canvas>
                            </div>
                            
                            <div class="loan-actions">
                                <button class="btn btn-primary" id="pay-loan-installment-btn">
                                    <i class="fas fa-money-bill-wave"></i>
                                    <span>دفع قسط</span>
                                </button>
                                <button class="btn btn-info" id="print-loan-details-btn">
                                    <i class="fas fa-print"></i>
                                    <span>طباعة</span>
                                </button>
                                <button class="btn btn-warning" id="renew-loan-btn">
                                    <i class="fas fa-sync-alt"></i>
                                    <span>تجديد</span>
                                </button>
                                <button class="btn btn-danger" id="cancel-loan-btn">
                                    <i class="fas fa-ban"></i>
                                    <span>إلغاء</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="payment-schedule-tab">
                        <div class="payment-schedule">
                            <h4>جدول سداد القرض</h4>
                            <div class="table-container">
                                <table id="loan-installments-table">
                                    <thead>
                                        <tr>
                                            <th>رقم القسط</th>
                                            <th>تاريخ الاستحقاق</th>
                                            <th>المبلغ</th>
                                            <th>المدفوع</th>
                                            <th>المتبقي</th>
                                            <th>تاريخ الدفع</th>
                                            <th>الحالة</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="borrower-details-tab">
                        <div class="borrower-details">
                            <h4>بيانات المقترض</h4>
                            <div class="borrower-card" id="borrower-card">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="documents-tab">
                        <div class="documents-view">
                            <h4>مستمسكات القرض</h4>
                            <div class="documents-grid" id="documents-grid">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="guarantors-tab">
                        <div class="guarantors-view">
                            <h4>الكفلاء</h4>
                            <div class="guarantors-list" id="guarantors-details-list">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalElement);
        setupLoanDetailsModalEvents();
    }
    
    /**
     * إضافة مستمعي الأحداث لنافذة تفاصيل القرض
     */
    function setupLoanDetailsModalEvents() {
        // التنقل بين التبويبات
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
        
        // أزرار الإجراءات
        document.getElementById('pay-loan-installment-btn').addEventListener('click', function() {
            const loanId = this.getAttribute('data-loan-id');
            closeModal('loan-details-modal');
            openPayInstallmentModal(loanId);
        });
        
        document.getElementById('print-loan-details-btn').addEventListener('click', function() {
            const loanId = this.getAttribute('data-loan-id');
            printLoanDetails(loanId);
        });
        
        document.getElementById('renew-loan-btn').addEventListener('click', function() {
            const loanId = this.getAttribute('data-loan-id');
            renewLoan(loanId);
        });
        
        document.getElementById('cancel-loan-btn').addEventListener('click', function() {
            const loanId = this.getAttribute('data-loan-id');
            cancelLoan(loanId);
        });
    }
    
    /**
     * فتح نافذة تفاصيل القرض
     */
    function openLoanDetailsModal(loanId) {
        const modal = document.getElementById('loan-details-modal');
        const loan = window.loans.find(l => l.id === loanId);
        
        if (!loan) {
            showNotification('لم يتم العثور على القرض', 'error');
            return;
        }
        
        // تحديث المعلومات الأساسية
        document.getElementById('loan-detail-id').textContent = loan.id;
        document.getElementById('loan-detail-status').textContent = loan.status;
        document.getElementById('loan-detail-status').className = `badge badge-${getLoanStatusClass(loan.status)}`;
        document.getElementById('loan-detail-start-date').textContent = formatDate(loan.startDate);
        document.getElementById('loan-detail-created-at').textContent = formatDateTime(loan.createdAt);
        
        // تحديث ملخص القرض
        updateLoanSummary(loan);
        
        // تحديث جدول الأقساط
        updateLoanInstallmentsTable(loan);
        
        // تحديث بيانات المقترض
        updateBorrowerDetails(loan);
        
        // تحديث المستمسكات
        updateDocuments(loan);
        
        // تحديث الكفلاء
        updateGuarantorsDetails(loan);
        
        // رسم مخطط تقدم السداد
        drawLoanPaymentProgressChart(loan);
        
        // تحديث معرف القرض في الأزرار
        document.querySelectorAll('[data-loan-id]').forEach(element => {
            element.setAttribute('data-loan-id', loan.id);
        });
        
        // فتح النافذة
        openModal('loan-details-modal');
    }
    
    /**
     * تحديث ملخص القرض
     */
    function updateLoanSummary(loan) {
        const totalInterest = loan.amount * (loan.interestRate / 100) * (loan.period / 12);
        const totalAmount = loan.amount + totalInterest;
        const monthlyPayment = totalAmount / loan.period;
        
        document.getElementById('loan-detail-content').innerHTML = `
            <div class="loan-detail-item">
                <div class="loan-detail-label">نوع القرض:</div>
                <div class="loan-detail-value">${loan.type}</div>
            </div>
            <div class="loan-detail-item">
                <div class="loan-detail-label">مبلغ القرض:</div>
                <div class="loan-detail-value">${formatCurrency(loan.amount)}</div>
            </div>
            <div class="loan-detail-item">
                <div class="loan-detail-label">نسبة الفائدة:</div>
                <div class="loan-detail-value">${loan.interestRate}%</div>
            </div>
            <div class="loan-detail-item">
                <div class="loan-detail-label">إجمالي الفائدة:</div>
                <div class="loan-detail-value">${formatCurrency(totalInterest)}</div>
            </div>
            <div class="loan-detail-item">
                <div class="loan-detail-label">المبلغ الإجمالي:</div>
                <div class="loan-detail-value">${formatCurrency(totalAmount)}</div>
            </div>
            <div class="loan-detail-item">
                <div class="loan-detail-label">مدة القرض:</div>
                <div class="loan-detail-value">${loan.period} شهر</div>
            </div>
            <div class="loan-detail-item">
                <div class="loan-detail-label">القسط الشهري:</div>
                <div class="loan-detail-value">${formatCurrency(monthlyPayment)}</div>
            </div>
        `;
        
        // تحديث حالة السداد
        updateLoanPaymentStatus(loan);
    }
    
    /**
     * تحديث حالة السداد
     */
    function updateLoanPaymentStatus(loan) {
        const loanInstallments = window.installments.filter(i => i.loanId === loan.id);
        const paidInstallments = loanInstallments.filter(i => i.status === 'مدفوع').length;
        const paidAmount = loanInstallments.reduce((total, i) => total + i.paidAmount, 0);
        const totalAmount = loan.amount * (1 + (loan.interestRate / 100) * (loan.period / 12));
        const remainingAmount = totalAmount - paidAmount;
        
        document.getElementById('loan-payment-status').innerHTML = `
            <div class="loan-detail-item">
                <div class="loan-detail-label">المبلغ المدفوع:</div>
                <div class="loan-detail-value">${formatCurrency(paidAmount)}</div>
            </div>
            <div class="loan-detail-item">
                <div class="loan-detail-label">المبلغ المتبقي:</div>
                <div class="loan-detail-value">${formatCurrency(remainingAmount)}</div>
            </div>
            <div class="loan-detail-item">
                <div class="loan-detail-label">نسبة السداد:</div>
                <div class="loan-detail-value">${Math.round((paidAmount / totalAmount) * 100)}%</div>
            </div>
            <div class="loan-detail-item">
                <div class="loan-detail-label">الأقساط المدفوعة:</div>
                <div class="loan-detail-value">${paidInstallments} من ${loan.period}</div>
            </div>
            <div class="loan-detail-item">
                <div class="loan-detail-label">الأقساط المتبقية:</div>
                <div class="loan-detail-value">${loan.period - paidInstallments}</div>
            </div>
        `;
    }
    
    /**
     * تحديث جدول الأقساط
     */
    function updateLoanInstallmentsTable(loan) {
        const tableBody = document.querySelector('#loan-installments-table tbody');
        const loanInstallments = window.installments.filter(i => i.loanId === loan.id);
        
        tableBody.innerHTML = loanInstallments.map(installment => {
            const remainingAmount = installment.amount - installment.paidAmount;
            const statusClass = getInstallmentStatusClass(installment);
            
            return `
                <tr>
                    <td>${installment.number}</td>
                    <td>${formatDate(installment.dueDate)}</td>
                    <td>${formatCurrency(installment.amount)}</td>
                    <td>${formatCurrency(installment.paidAmount)}</td>
                    <td>${formatCurrency(remainingAmount)}</td>
                    <td>${installment.paymentDate ? formatDate(installment.paymentDate) : '-'}</td>
                    <td><span class="badge badge-${statusClass}">${installment.status}</span></td>
                    <td>
                        ${installment.status !== 'مدفوع' ? `
                            <button class="btn btn-sm btn-outline pay-installment-btn" data-id="${installment.id}">
                                <i class="fas fa-money-bill-wave"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
        
        // إضافة مستمعي الأحداث لأزرار دفع الأقساط
        document.querySelectorAll('.pay-installment-btn').forEach(button => {
            button.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                closeModal('loan-details-modal');
                openPayInstallmentByIdModal(installmentId);
            });
        });
    }
    
    /**
     * تحديث بيانات المقترض
     */
    function updateBorrowerDetails(loan) {
        const borrowerCard = document.getElementById('borrower-card');
        const category = borrowerCategories.find(cat => cat.name === loan.type);
        
        borrowerCard.innerHTML = `
            <div class="borrower-header">
                <div class="borrower-avatar" style="background-color: ${category?.color || '#ccc'}">${loan.borrower.name.charAt(0)}</div>
                <div class="borrower-name">${loan.borrower.name}</div>
            </div>
            
            <div class="grid-cols-2">
                <div class="borrower-info">
                    <div class="borrower-info-item">
                        <div class="borrower-info-label">رقم الهاتف:</div>
                        <div class="borrower-info-value">${loan.borrower.phone}</div>
                    </div>
                    <div class="borrower-info-item">
                        <div class="borrower-info-label">العنوان:</div>
                        <div class="borrower-info-value">${loan.borrower.address}</div>
                    </div>
                    <div class="borrower-info-item">
                        <div class="borrower-info-label">الراتب الشهري:</div>
                        <div class="borrower-info-value">${formatCurrency(loan.borrower.salary)}</div>
                    </div>
                </div>
                
                <div class="borrower-info">
                    <div class="borrower-info-item">
                        <div class="borrower-info-label">مكان العمل:</div>
                        <div class="borrower-info-value">${loan.borrower.workplace || '-'}</div>
                    </div>
                    <div class="borrower-info-item">
                        <div class="borrower-info-label">عدد الكفلاء:</div>
                        <div class="borrower-info-value">${loan.guarantors?.length || 0}</div>
                    </div>
                    <div class="borrower-info-item">
                        <div class="borrower-info-label">تاريخ الإضافة:</div>
                        <div class="borrower-info-value">${formatDateTime(loan.createdAt)}</div>
                    </div>
                </div>
            </div>
            
            ${loan.borrower.notes ? `
                <div class="borrower-notes">
                    <div class="borrower-notes-title">ملاحظات</div>
                    <div class="borrower-notes-content">${loan.borrower.notes}</div>
                </div>
            ` : ''}
        `;
    }
    
    /**
     * تحديث المستمسكات
     */
    function updateDocuments(loan) {
        const documentsGrid = document.getElementById('documents-grid');
        documentsGrid.innerHTML = `
            <div class="documents-placeholder">
                <div class="placeholder-icon">
                    <i class="fas fa-file-image"></i>
                </div>
                <div class="placeholder-text">
                    المستمسكات متوفرة في خدمة التخزين
                </div>
            </div>
        `;
    }
    
    /**
     * تحديث الكفلاء
     */
    function updateGuarantorsDetails(loan) {
        const guarantorsList = document.getElementById('guarantors-details-list');
        
        if (!loan.guarantors || loan.guarantors.length === 0) {
            guarantorsList.innerHTML = `
                <div class="no-guarantors">
                    <div class="placeholder-icon">
                        <i class="fas fa-user-shield"></i>
                    </div>
                    <div class="placeholder-text">
                        لا يوجد كفلاء لهذا القرض
                    </div>
                </div>
            `;
            return;
        }
        
        guarantorsList.innerHTML = loan.guarantors.map((guarantor, index) => `
            <div class="guarantor-card">
                <div class="guarantor-header">
                    <div class="guarantor-avatar">${guarantor.name.charAt(0)}</div>
                    <div class="guarantor-name">
                        <h5>كفيل #${index + 1} - ${guarantor.name}</h5>
                    </div>
                </div>
                
                <div class="grid-cols-2">
                    <div class="guarantor-info">
                        <div class="guarantor-info-item">
                            <div class="guarantor-info-label">رقم الهاتف:</div>
                            <div class="guarantor-info-value">${guarantor.phone}</div>
                        </div>
                        <div class="guarantor-info-item">
                            <div class="guarantor-info-label">العنوان:</div>
                            <div class="guarantor-info-value">${guarantor.address || '-'}</div>
                        </div>
                    </div>
                    
                    <div class="guarantor-info">
                        <div class="guarantor-info-item">
                            <div class="guarantor-info-label">مكان العمل:</div>
                            <div class="guarantor-info-value">${guarantor.workplace || '-'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * رسم مخطط تقدم سداد القرض
     */
    function drawLoanPaymentProgressChart(loan) {
        const canvas = document.getElementById('loan-payment-progress-chart');
        if (!canvas || !window.Chart) return;
        
        const totalAmount = loan.amount * (1 + (loan.interestRate / 100) * (loan.period / 12));
        const loanInstallments = window.installments.filter(i => i.loanId === loan.id);
        const paidAmount = loanInstallments.reduce((total, i) => total + i.paidAmount, 0);
        const remainingAmount = totalAmount - paidAmount;
        
        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['المدفوع', 'المتبقي'],
                datasets: [{
                    data: [paidAmount, remainingAmount],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.7)', // أخضر للمدفوع
                        'rgba(239, 68, 68, 0.7)'   // أحمر للمتبقي
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = Math.round((value / totalAmount) * 100);
                                return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * إنشاء نافذة دفع قسط
     */
    function createPayInstallmentModal() {
        if (document.getElementById('pay-installment-modal')) return;
        
        const modalElement = document.createElement('div');
        modalElement.className = 'modal-overlay';
        modalElement.id = 'pay-installment-modal';
        
        modalElement.innerHTML = `
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">دفع قسط</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="pay-installment-form">
                        <input type="hidden" id="payment-loan-id" value="">
                        
                        <div class="form-group">
                            <label class="form-label">اختر القسط</label>
                            <select class="form-select" id="payment-installment-id" required>
                                <!-- سيتم ملؤها ديناميكياً -->
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">المبلغ المدفوع</label>
                            <input type="number" class="form-input" id="payment-amount" min="1" step="1000" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">تاريخ الدفع</label>
                            <input type="date" class="form-input" id="payment-date" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-input" id="payment-notes" rows="2"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" data-action="close">إلغاء</button>
                    <button class="btn btn-primary" id="confirm-payment-btn">دفع</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalElement);
        setupPayInstallmentModalEvents();
    }
    
    /**
     * إضافة مستمعي الأحداث لنافذة دفع القسط
     */
    function setupPayInstallmentModalEvents() {
        const installmentSelect = document.getElementById('payment-installment-id');
        const paymentAmount = document.getElementById('payment-amount');
        
        // تحديث المبلغ عند تغيير القسط
        installmentSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption) {
                paymentAmount.value = selectedOption.getAttribute('data-amount');
            }
        });
        
        // مستمع حدث لزر الدفع
        document.getElementById('confirm-payment-btn').addEventListener('click', function() {
            processInstallmentPayment();
        });
        
        // تعيين تاريخ اليوم
        document.getElementById('payment-date').value = new Date().toISOString().split('T')[0];
    }
    
    /**
     * فتح نافذة دفع قسط
     */
    function openPayInstallmentModal(loanId) {
        const modal = document.getElementById('pay-installment-modal');
        const loan = window.loans.find(l => l.id === loanId);
        
        if (!loan) {
            showNotification('لم يتم العثور على القرض', 'error');
            return;
        }
        
        // تحديد القروض غير المدفوعة
        const unpaidInstallments = window.installments.filter(installment => 
            installment.loanId === loanId && 
            (installment.status === 'غير مدفوع' || installment.status === 'مدفوع جزئياً')
        );
        
        if (unpaidInstallments.length === 0) {
            showNotification('لا توجد أقساط غير مدفوعة لهذا القرض', 'info');
            return;
        }
        
        // ترتيب الأقساط حسب تاريخ الاستحقاق
        unpaidInstallments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        // ملء قائمة الأقساط
        const installmentSelect = document.getElementById('payment-installment-id');
        installmentSelect.innerHTML = unpaidInstallments.map(installment => {
            const dueDate = new Date(installment.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const isLate = dueDate < today;
            const amount = installment.amount - installment.paidAmount;
            
            return `
                <option value="${installment.id}" data-amount="${amount}">
                    القسط #${installment.number} - تاريخ الاستحقاق: ${formatDate(installment.dueDate)} - المبلغ: ${formatCurrency(amount)}
                    ${isLate ? ' (متأخر)' : ''}
                </option>
            `;
        }).join('');
        
        // تعيين المبلغ المبدئي
        const selectedOption = installmentSelect.options[0];
        if (selectedOption) {
            document.getElementById('payment-amount').value = selectedOption.getAttribute('data-amount');
        }
        
        // تعيين معرف القرض
        document.getElementById('payment-loan-id').value = loanId;
        
        // فتح النافذة
        openModal('pay-installment-modal');
    }
    
    /**
     * معالجة دفع القسط
     */
    function processInstallmentPayment() {
        const installmentId = document.getElementById('payment-installment-id').value;
        const amount = parseFloat(document.getElementById('payment-amount').value);
        const date = document.getElementById('payment-date').value;
        const notes = document.getElementById('payment-notes').value || '';
        
        if (!installmentId || isNaN(amount) || amount <= 0 || !date) {
            showNotification('يرجى ملء جميع البيانات المطلوبة بشكل صحيح', 'error');
            return;
        }
        
        // الحصول على القسط
        const installment = window.installments.find(i => i.id === installmentId);
        if (!installment) {
            showNotification('لم يتم العثور على القسط', 'error');
            return;
        }
        
        // التحقق من المبلغ
        const remainingAmount = installment.amount - installment.paidAmount;
        if (amount > remainingAmount) {
            showNotification(`المبلغ المدفوع يتجاوز المبلغ المتبقي (${formatCurrency(remainingAmount)})`, 'error');
            return;
        }
        
        // تحديث بيانات القسط
        installment.paidAmount += amount;
        installment.paymentDate = date;
        installment.notes += (installment.notes ? '\n' : '') + `${date}: دفع ${formatCurrency(amount)}${notes ? ` - ${notes}` : ''}`;
        
        // تحديث حالة القسط
        if (installment.paidAmount >= installment.amount) {
            installment.status = 'مدفوع';
        } else {
            installment.status = 'مدفوع جزئياً';
        }
        
        // تحديث حالة القرض
        updateLoanStatus(installment.loanId);
        
        // حفظ البيانات
        saveLoanData();
        
        // إغلاق النافذة المنبثقة
        closeModal('pay-installment-modal');
        
        // تحديث الواجهة
        refreshLoansUI();
        
        // عرض إشعار النجاح
        showNotification(`تم دفع ${formatCurrency(amount)} للقسط #${installment.number} بنجاح`, 'success');
    }
    
    /**
     * تحديث حالة القرض
     */
    function updateLoanStatus(loanId) {
        const loan = window.loans.find(l => l.id === loanId);
        if (!loan) return;
        
        const loanInstallments = window.installments.filter(i => i.loanId === loanId);
        const allPaid = loanInstallments.every(i => i.status === 'مدفوع');
        const anyLate = loanInstallments.some(i => {
            if (i.status !== 'غير مدفوع') return false;
            
            const dueDate = new Date(i.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            return dueDate < today;
        });
        
        if (allPaid) {
            loan.status = 'مكتمل';
        } else if (anyLate) {
            loan.status = 'متأخر';
        } else {
            loan.status = 'نشط';
        }
    }
    
    /**
     * إنشاء نافذة تفاصيل المقترض
     */
    function createBorrowerDetailsModal() {
        if (document.getElementById('borrower-details-modal')) return;
        
        const modalElement = document.createElement('div');
        modalElement.className = 'modal-overlay';
        modalElement.id = 'borrower-details-modal';
        
        modalElement.innerHTML = `
            <div class="modal wide-modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تفاصيل المقترض</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="borrower-details-card" id="borrower-details-content"></div>
                    
                    <div class="section mt-4">
                        <div class="section-header">
                            <h3 class="section-title">قروض المقترض</h3>
                        </div>
                        <div class="table-container">
                            <table id="borrower-loans-table">
                                <thead>
                                    <tr>
                                        <th>رقم القرض</th>
                                        <th>النوع</th>
                                        <th>المبلغ</th>
                                        <th>تاريخ البدء</th>
                                        <th>المدة</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalElement);
    }
    
    /**
     * حفظ بيانات القروض
     */
    function saveLoanData() {
        try {
            localStorage.setItem('loans', JSON.stringify(window.loans));
            localStorage.setItem('borrowers', JSON.stringify(window.borrowers));
            localStorage.setItem('installments', JSON.stringify(window.installments));
            localStorage.setItem('guarantors', JSON.stringify(window.guarantors));
            localStorage.setItem('loanSettings', JSON.stringify(loansSettings));
            
            console.log('تم حفظ بيانات القروض بنجاح');
            return true;
        } catch (error) {
            console.error('خطأ في حفظ بيانات القروض:', error);
            showNotification('حدث خطأ أثناء حفظ بيانات القروض', 'error');
            return false;
        }
    }
    
    /**
     * تحميل بيانات القروض
     */
    function loadLoanData() {
        console.log('تحميل بيانات القروض...');
        
        try {
            // تحميل القروض
            const savedLoans = localStorage.getItem('loans');
            if (savedLoans) {
                window.loans = JSON.parse(savedLoans);
                console.log(`تم تحميل ${window.loans.length} قرض`);
            }
            
            // تحميل المقترضين
            const savedBorrowers = localStorage.getItem('borrowers');
            if (savedBorrowers) {
                window.borrowers = JSON.parse(savedBorrowers);
                console.log(`تم تحميل ${window.borrowers.length} مقترض`);
            }
            
            // تحميل الأقساط
            const savedInstallments = localStorage.getItem('installments');
            if (savedInstallments) {
                window.installments = JSON.parse(savedInstallments);
                console.log(`تم تحميل ${window.installments.length} قسط`);
            }
            
            // تحميل الكفلاء
            const savedGuarantors = localStorage.getItem('guarantors');
            if (savedGuarantors) {
                window.guarantors = JSON.parse(savedGuarantors);
                console.log(`تم تحميل ${window.guarantors.length} كفيل`);
            }
            
            // تحميل الإعدادات
            const savedSettings = localStorage.getItem('loanSettings');
            if (savedSettings) {
                const savedLoanSettings = JSON.parse(savedSettings);
                Object.assign(loansSettings, savedLoanSettings);
                console.log('تم تحميل إعدادات القروض');
            }
            
            // تحديث واجهة المستخدم
            refreshLoansUI();
        } catch (error) {
            console.error('خطأ في تحميل بيانات القروض:', error);
            showNotification('حدث خطأ أثناء تحميل بيانات القروض', 'error');
        }
    }
    
    /**
     * تحديث واجهة القروض
     */
    function refreshLoansUI() {
        updateLoansDashboard();
        renderLoansTable();
        renderInstallmentsTable();
        updateLoanCharts();
        updateLoansNotificationsBadge();
        console.log('تم تحديث واجهة القروض');
    }
    
    /**
     * تحديث لوحة تحكم القروض
     */
    function updateLoansDashboard() {
        console.log('تحديث لوحة تحكم القروض...');
        
        // حساب إجمالي القروض النشطة
        const activeLoans = window.loans.filter(loan => loan.status === 'نشط');
        const totalActiveLoans = activeLoans.reduce((total, loan) => total + loan.amount, 0);
        
        // حساب الفوائد المتوقعة
        const expectedInterest = activeLoans.reduce((total, loan) => {
            return total + (loan.amount * (loan.interestRate / 100) * (loan.period / 12));
        }, 0);
        
        // حساب عدد المقترضين الفريدين
        const uniqueBorrowers = new Set(window.loans.map(loan => loan.borrower?.name));
        
        // حساب الأقساط المستحقة هذا الشهر
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const dueInstallments = window.installments.filter(installment => {
            if (installment.status !== 'غير مدفوع') return false;
            
            const dueDate = new Date(installment.dueDate);
            return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
        });
        
        const totalDueInstallments = dueInstallments.reduce((total, installment) => total + installment.amount, 0);
        
        // تحديث عناصر لوحة التحكم
        document.getElementById('total-active-loans').textContent = formatCurrency(totalActiveLoans);
        document.getElementById('expected-interest').textContent = formatCurrency(expectedInterest);
        document.getElementById('borrowers-count').textContent = uniqueBorrowers.size;
        document.getElementById('due-installments').textContent = formatCurrency(totalDueInstallments);
    }
    
    /**
     * عرض جدول القروض
     */
    function renderLoansTable(filterType = 'all') {
        console.log(`عرض جدول القروض (النوع: ${filterType})...`);
        
        const tableBody = document.querySelector('#loans-table tbody');
        if (!tableBody) return;
        
        // تصفية القروض حسب النوع
        let filteredLoans = [...window.loans];
        if (filterType !== 'all') {
            filteredLoans = filteredLoans.filter(loan => loan.type === filterType);
        }
        
        // ترتيب القروض (الأحدث أولاً)
        filteredLoans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // تفريغ الجدول
        tableBody.innerHTML = '';
        
        // عرض رسالة إذا لم توجد قروض
        if (filteredLoans.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center">لا توجد قروض ${filterType !== 'all' ? `من نوع ${filterType}` : ''}</td></tr>`;
            return;
        }
        
        // إضافة القروض للجدول
        filteredLoans.forEach(loan => {
            const paidInstallments = window.installments.filter(i => i.loanId === loan.id && i.status === 'مدفوع').length;
            const totalInterest = loan.amount * (loan.interestRate / 100) * (loan.period / 12);
            
            const row = document.createElement('tr');
            
            // اختيار لون حالة القرض
            let statusClass = '';
            switch (loan.status) {
                case 'نشط':
                    statusClass = 'success';
                    break;
                case 'مكتمل':
                    statusClass = 'info';
                    break;
                case 'متأخر':
                    statusClass = 'warning';
                    break;
                case 'مجدد':
                    statusClass = 'primary';
                    break;
                case 'ملغي':
                    statusClass = 'danger';
                    break;
                default:
                    statusClass = 'secondary';
            }
            
            // تعيين محتوى الصف
            row.innerHTML = `
                <td>${loan.id}</td>
                <td>${loan.borrower?.name || 'غير معروف'}</td>
                <td><span class="badge badge-secondary">${loan.type}</span></td>
                <td>${formatCurrency(loan.amount)}</td>
                <td>${formatCurrency(totalInterest)} (${loan.interestRate}%)</td>
                <td>${loan.period} شهر</td>
                <td>${formatDate(loan.startDate)}</td>
                <td><span class="badge badge-${statusClass}">${loan.status}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline view-loan-btn" data-id="${loan.id}" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline pay-installment-btn" data-id="${loan.id}" title="دفع قسط">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                        <button class="btn btn-sm btn-outline edit-loan-btn" data-id="${loan.id}" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline danger delete-loan-btn" data-id="${loan.id}" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // إضافة مستمعي الأحداث للأزرار
        setupLoansTableListeners();
    }
    
    /**
     * عرض جدول الأقساط
     */
    function renderInstallmentsTable(status = 'current') {
        console.log(`عرض جدول الأقساط (الحالة: ${status})...`);
        
        const tableBody = document.querySelector('#installments-table tbody');
        if (!tableBody) return;
        
        // تصفية الأقساط حسب الحالة
        let filteredInstallments = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        switch (status) {
            case 'current':
                // الأقساط المستحقة هذا الشهر
                filteredInstallments = window.installments.filter(installment => {
                    if (installment.status !== 'غير مدفوع') return false;
                    
                    const dueDate = new Date(installment.dueDate);
                    return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
                });
                break;
                
            case 'late':
                // الأقساط المتأخرة
                filteredInstallments = window.installments.filter(installment => {
                    if (installment.status !== 'غير مدفوع') return false;
                    
                    const dueDate = new Date(installment.dueDate);
                    return dueDate < today;
                });
                break;
                
            case 'paid':
                // الأقساط المدفوعة
                filteredInstallments = window.installments.filter(installment => installment.status === 'مدفوع');
                break;
                
            case 'all':
            default:
                // جميع الأقساط
                filteredInstallments = [...window.installments];
                break;
        }
        
        // ترتيب الأقساط حسب تاريخ الاستحقاق
        filteredInstallments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        // تفريغ الجدول
        tableBody.innerHTML = '';
        
        // عرض رسالة إذا لم توجد أقساط
        if (filteredInstallments.length === 0) {
            let message = 'لا توجد أقساط';
            switch (status) {
                case 'current':
                    message = 'لا توجد أقساط مستحقة هذا الشهر';
                    break;
                case 'late':
                    message = 'لا توجد أقساط متأخرة';
                    break;
                case 'paid':
                    message = 'لا توجد أقساط مدفوعة';
                    break;
            }
            
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center">${message}</td></tr>`;
            return;
        }
        
        // إضافة الأقساط للجدول
        filteredInstallments.forEach(installment => {
            const loan = window.loans.find(l => l.id === installment.loanId);
            
            // اختيار لون حالة القسط
            let statusClass = '';
            switch (installment.status) {
                case 'مدفوع':
                    statusClass = 'success';
                    break;
                case 'مدفوع جزئياً':
                    statusClass = 'warning';
                    break;
                case 'غير مدفوع':
                    const dueDate = new Date(installment.dueDate);
                    if (dueDate < today) {
                        statusClass = 'danger'; // متأخر
                    } else {
                        statusClass = 'info'; // غير مستحق بعد
                    }
                    break;
                case 'ملغي':
                    statusClass = 'secondary';
                    break;
                default:
                    statusClass = 'secondary';
            }
            
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${installment.id}</td>
                <td>${loan?.borrower?.name || 'غير معروف'}</td>
                <td>${installment.number}</td>
                <td>${formatDate(installment.dueDate)}</td>
                <td>${formatCurrency(installment.amount)}</td>
                <td><span class="badge badge-${statusClass}">${installment.status}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline pay-btn" data-id="${installment.id}" title="دفع">
                            <i class="fas fa-money-bill-wave"></i>
                        </button>
                        <button class="btn btn-sm btn-outline edit-installment-btn" data-id="${installment.id}" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // إضافة مستمعي الأحداث للأزرار
        setupInstallmentsTableListeners();
    }
    
    /**
     * تحديث الرسوم البيانية الخاصة بالقروض
     */
    function updateLoanCharts() {
        console.log('تحديث الرسوم البيانية للقروض...');
        
        updateLoansDistributionChart();
        updateInstallmentsStatusChart();
    }
    
    /**
     * تحديث مخطط توزيع القروض حسب الفئة
     */
    function updateLoansDistributionChart() {
        const canvas = document.getElementById('loans-distribution-chart');
        if (!canvas || !window.Chart) return;
        
        // تنظيف المخطط السابق
        const chartInstance = Chart.getChart(canvas);
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        // جمع البيانات حسب نوع القرض
        const loanTypes = {};
        loansSettings.loanTypes.forEach(type => {
            loanTypes[type] = 0;
        });
        
        window.loans.forEach(loan => {
            if (loan.status !== 'ملغي' && loanTypes[loan.type] !== undefined) {
                loanTypes[loan.type] += loan.amount;
            }
        });
        
        // تحويل البيانات إلى صيغة الرسم البياني
        const labels = Object.keys(loanTypes);
        const data = Object.values(loanTypes);
        
        // ألوان الفئات
        const colors = [
            'rgba(59, 130, 246, 0.7)',  // أزرق
            'rgba(16, 185, 129, 0.7)',  // أخضر
            'rgba(245, 158, 11, 0.7)',  // برتقالي
            'rgba(239, 68, 68, 0.7)',   // أحمر
            'rgba(139, 92, 246, 0.7)',  // بنفسجي
            'rgba(236, 72, 153, 0.7)'   // وردي
        ];
        
        // إنشاء المخطط
        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Tajawal'
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * تحديث مخطط حالة سداد الأقساط
     */
    function updateInstallmentsStatusChart() {
        const canvas = document.getElementById('installments-status-chart');
        if (!canvas || !window.Chart) return;
        
        // تنظيف المخطط السابق
        const chartInstance = Chart.getChart(canvas);
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        // جمع البيانات حسب حالة القسط
        const statuses = {
            'مدفوع': 0,
            'مدفوع جزئياً': 0,
            'غير مدفوع': 0,
            'متأخر': 0
        };
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        window.installments.forEach(installment => {
            if (installment.status === 'ملغي') return;
            
            if (installment.status === 'مدفوع') {
                statuses['مدفوع']++;
            } else if (installment.status === 'مدفوع جزئياً') {
                statuses['مدفوع جزئياً']++;
            } else if (installment.status === 'غير مدفوع') {
                const dueDate = new Date(installment.dueDate);
                if (dueDate < today) {
                    statuses['متأخر']++;
                } else {
                    statuses['غير مدفوع']++;
                }
            }
        });
        
        // تحويل البيانات إلى صيغة الرسم البياني
        const labels = Object.keys(statuses);
        const data = Object.values(statuses);
        
        // ألوان الحالات
        const colors = [
            'rgba(16, 185, 129, 0.7)',  // مدفوع - أخضر
            'rgba(245, 158, 11, 0.7)',  // مدفوع جزئياً - برتقالي
            'rgba(59, 130, 246, 0.7)',  // غير مدفوع - أزرق
            'rgba(239, 68, 68, 0.7)'    // متأخر - أحمر
        ];
        
        // إنشاء المخطط
        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Tajawal'
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * تحديث عداد الإشعارات للقروض والأقساط
     */
    function updateLoansNotificationsBadge() {
        console.log('تحديث عداد إشعارات القروض والأقساط...');
        
        // حساب عدد الأقساط المستحقة
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueInstallments = window.installments.filter(installment => {
            if (installment.status !== 'غير مدفوع') return false;
            
            const dueDate = new Date(installment.dueDate);
            return dueDate <= today;
        });
        
        // تحديث عداد الأقساط النشطة
        const badge = document.getElementById('active-installments-badge');
        if (badge) {
            badge.textContent = dueInstallments.length;
            
            // إظهار أو إخفاء العداد
            if (dueInstallments.length > 0) {
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }
    
    /**
     * إعداد مستمعي الأحداث لجدول القروض
     */
    function setupLoansTableListeners() {
        // أزرار عرض تفاصيل القرض
        const viewButtons = document.querySelectorAll('.view-loan-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const loanId = this.getAttribute('data-id');
                openLoanDetailsModal(loanId);
            });
        });
        
        // أزرار دفع قسط
        const payButtons = document.querySelectorAll('.pay-installment-btn');
        payButtons.forEach(button => {
            button.addEventListener('click', function() {
                const loanId = this.getAttribute('data-id');
                openPayInstallmentModal(loanId);
            });
        });
        
        // أزرار تعديل القرض
        const editButtons = document.querySelectorAll('.edit-loan-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const loanId = this.getAttribute('data-id');
                editLoan(loanId);
            });
        });
        
        // أزرار حذف القرض
        const deleteButtons = document.querySelectorAll('.delete-loan-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const loanId = this.getAttribute('data-id');
                deleteLoan(loanId);
            });
        });
    }
    
    /**
     * إعداد مستمعي الأحداث لجدول الأقساط
     */
    function setupInstallmentsTableListeners() {
        // أزرار دفع القسط
        const payButtons = document.querySelectorAll('.pay-btn');
        payButtons.forEach(button => {
            button.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                openPayInstallmentByIdModal(installmentId);
            });
        });
        
        // أزرار تعديل القسط
        const editButtons = document.querySelectorAll('.edit-installment-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                editInstallment(installmentId);
            });
        });
    }
    
    /**
     * إعداد مستمعي الأحداث لنظام القروض
     */
    function setupLoanEventListeners() {
        console.log('إعداد مستمعي الأحداث لنظام القروض...');
        
        // مستمع حدث لزر إضافة قرض جديد
        document.addEventListener('click', function(event) {
            if (event.target.closest('#add-loan-btn')) {
                openModal('add-loan-modal');
            }
        });
        
        // مستمعي أحداث لأزرار تصفية القروض
        document.addEventListener('click', function(event) {
            const filterBtn = event.target.closest('[data-loan-type]');
            if (filterBtn) {
                document.querySelectorAll('[data-loan-type]').forEach(btn => {
                    btn.classList.remove('active');
                });
                filterBtn.classList.add('active');
                
                const filterType = filterBtn.getAttribute('data-loan-type');
                renderLoansTable(filterType);
            }
        });
        
        // مستمعي أحداث لأزرار تصفية الأقساط
        document.addEventListener('click', function(event) {
            const filterBtn = event.target.closest('[data-installment-status]');
            if (filterBtn) {
                document.querySelectorAll('[data-installment-status]').forEach(btn => {
                    btn.classList.remove('active');
                });
                filterBtn.classList.add('active');
                
                const filterStatus = filterBtn.getAttribute('data-installment-status');
                renderInstallmentsTable(filterStatus);
            }
        });
        
        // مستمعي أحداث لأزرار التصفية في صفحة الأقساط النشطة
        document.addEventListener('click', function(event) {
            const filterBtn = event.target.closest('[data-installment-status]');
            if (filterBtn) {
                document.querySelectorAll('[data-installment-status]').forEach(btn => {
                    btn.classList.remove('active');
                });
                filterBtn.classList.add('active');
                
                const filterStatus = filterBtn.getAttribute('data-installment-status');
                renderActiveInstallmentsTable(filterStatus);
            }
        });
        
        // مستمع حدث لزر تصدير القروض
        document.addEventListener('click', function(event) {
            if (event.target.closest('#export-loans-btn')) {
                exportLoansData();
            }
        });
        
        // مستمع حدث لمربع البحث
        const loansSearch = document.getElementById('loans-search');
        if (loansSearch) {
            loansSearch.addEventListener('input', function() {
                searchLoans(this.value);
            });
        }
    }
    
    /**
     * دالة البحث في القروض
     */
    function searchLoans(searchTerm) {
        searchTerm = searchTerm.toLowerCase();
        
        const filteredLoans = window.loans.filter(loan => {
            const borrowerName = loan.borrower?.name.toLowerCase() || '';
            const loanType = loan.type.toLowerCase() || '';
            const loanId = loan.id.toLowerCase() || '';
            
            return borrowerName.includes(searchTerm) || 
                   loanType.includes(searchTerm) || 
                   loanId.includes(searchTerm);
        });
        
        renderLoansList(filteredLoans);
    }
    
    /**
     * عرض قائمة القروض المفلترة
     */
    function renderLoansList(loans) {
        const tableBody = document.querySelector('#loans-table tbody');
        if (!tableBody) return;
        
        if (loans.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center">لا توجد نتائج للبحث</td></tr>`;
            return;
        }
        
        // إعادة رسم الجدول
        tableBody.innerHTML = '';
        loans.forEach(loan => {
            const totalInterest = loan.amount * (loan.interestRate / 100) * (loan.period / 12);
            
            const row = document.createElement('tr');
            let statusClass = getLoanStatusClass(loan.status);
            
            row.innerHTML = `
                <td>${loan.id}</td>
                <td>${loan.borrower?.name || 'غير معروف'}</td>
                <td><span class="badge badge-secondary">${loan.type}</span></td>
                <td>${formatCurrency(loan.amount)}</td>
                <td>${formatCurrency(totalInterest)} (${loan.interestRate}%)</td>
                <td>${loan.period} شهر</td>
                <td>${formatDate(loan.startDate)}</td>
                <td><span class="badge badge-${statusClass}">${loan.status}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline view-loan-btn" data-id="${loan.id}" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline pay-installment-btn" data-id="${loan.id}" title="دفع قسط">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                        <button class="btn btn-sm btn-outline edit-loan-btn" data-id="${loan.id}" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline danger delete-loan-btn" data-id="${loan.id}" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        setupLoansTableListeners();
    }
    
    /**
     * حذف قرض
     */
    function deleteLoan(loanId) {
        // عرض نافذة تأكيد
        if (!confirm('هل أنت متأكد من حذف هذا القرض؟')) {
            return;
        }
        
        // حذف القرض من القائمة
        window.loans = window.loans.filter(loan => loan.id !== loanId);
        
        // حذف الأقساط المرتبطة بالقرض
        window.installments = window.installments.filter(installment => installment.loanId !== loanId);
        
        // حفظ البيانات
        saveLoanData();
        
        // تحديث الواجهة
        refreshLoansUI();
        
        // عرض إشعار النجاح
        showNotification('تم حذف القرض بنجاح', 'success');
    }
    
    /**
     * تصدير بيانات القروض
     */
    function exportLoansData() {
        const data = {
            loans: window.loans,
            borrowers: window.borrowers,
            installments: window.installments,
            guarantors: window.guarantors,
            settings: loansSettings,
            exportDate: new Date().toISOString()
        };
        
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `loans-export-${formatDate(new Date())}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification('تم تصدير البيانات بنجاح', 'success');
    }
    
    /**
     * فتح نافذة مودال
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    /**
     * إغلاق نافذة مودال
     */
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * عرض إشعار
     */
    function showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // يمكن إضافة منطق عرض إشعار مرئي هنا
        const notificationClasses = {
            success: 'notification-success',
            error: 'notification-error',
            warning: 'notification-warning',
            info: 'notification-info'
        };
        
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `notification ${notificationClasses[type] || notificationClasses.info}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                               type === 'error' ? 'exclamation-circle' : 
                               type === 'warning' ? 'exclamation-triangle' : 
                               'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // إضافة الإشعار للصفحة
        document.body.appendChild(notification);
        
        // حذف الإشعار بعد 3 ثواني
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * تنسيق المبلغ المالي
     */
    function formatCurrency(amount) {
        if (isNaN(amount)) return '0 ' + loansSettings.currency;
        return amount.toLocaleString() + ' ' + loansSettings.currency;
    }
    
    /**
     * تنسيق التاريخ
     */
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
    }
    
    /**
     * تنسيق التاريخ والوقت
     */
    function formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('ar-SA', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * الحصول على فئة CSS لحالة القرض
     */
    function getLoanStatusClass(status) {
        switch (status) {
            case 'نشط':
                return 'success';
            case 'مكتمل':
                return 'info';
            case 'متأخر':
                return 'warning';
            case 'مجدد':
                return 'primary';
            case 'ملغي':
                return 'danger';
            default:
                return 'secondary';
        }
    }
    
    /**
     * الحصول على فئة CSS لحالة القسط
     */
    function getInstallmentStatusClass(installment) {
        switch (installment.status) {
            case 'مدفوع':
                return 'success';
            case 'مدفوع جزئياً':
                return 'warning';
            case 'غير مدفوع':
                const dueDate = new Date(installment.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return dueDate < today ? 'danger' : 'info';
            case 'ملغي':
                return 'secondary';
            default:
                return 'secondary';
        }
    }
    
    /**
     * إظهار صفحة محددة للقروض
     */
    function showLoanPage(pageId) {
        // تحديث الشريط الجانبي
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-page') === pageId) {
                link.closest('.nav-item').classList.add('active');
            } else {
                link.closest('.nav-item').classList.remove('active');
            }
        });
        
        // إظهار الصفحة المطلوبة
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // تحديث البيانات عند عرض الصفحة
            switch (pageId) {
                case 'loans-dashboard':
                    refreshLoansUI();
                    break;
                case 'borrowers':
                    renderBorrowersTable();
                    break;
                case 'active-installments':
                    renderActiveInstallmentsTable();
                    break;
                case 'paid-installments':
                    renderPaidInstallmentsTable();
                    break;
            }
        }
    }
    
    // إضافة أنماط CSS مخصصة للنظام
    function addLoanManagementStyles() {
        if (document.getElementById('loan-management-styles')) {
            return;
        }
        
        const styleElement = document.createElement('style');
        styleElement.id = 'loan-management-styles';
        
        styleElement.textContent = `
            /* أنماط عامة لنظام القروض */
            .loan-badge {
                position: absolute;
                top: 0;
                left: 0;
                background-color: #ef4444;
                color: white;
                border-radius: 50%;
                min-width: 18px;
                height: 18px;
                font-size: 12px;
                line-height: 18px;
                text-align: center;
                transform: translate(-50%, -50%);
                display: none;
            }
            
            .loan-debt {
                background-color: #fee2e2;
                padding: 8px 12px;
                border-radius: 4px;
                color: #dc2626;
                font-weight: bold;
            }
            
            .overdue {
                background-color: #ffe5e5 !important;
            }
            
            .late-option {
                background-color: #fde2e2 !important;
                color: #dc2626;
            }
            
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 24px;
                border-radius: 4px;
                color: white;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: slideIn 0.3s ease-out;
                z-index: 9999;
            }
            
            .notification-success {
                background-color: #059669;
            }
            
            .notification-error {
                background-color: #dc2626;
            }
            
            .notification-warning {
                background-color: #d97706;
            }
            
            .notification-info {
                background-color: #2563eb;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            /* أنماط إضافية */
            .btn-danger {
                color: #dc2626;
            }
            
            .btn-danger:hover {
                background-color: #fee2e2;
            }
            
            .loan-payment-preview {
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                margin-top: 24px;
            }
            
            .payment-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
                margin-top: 12px;
            }
            
            .payment-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .payment-label {
                color: #6b7280;
                font-size: 14px;
            }
            
            .payment-value {
                font-weight: 600;
                color: #111827;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // تهيئة النظام عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        console.log('تهيئة نظام إدارة السلف والقروض...');
        initLoanSystem();
        addLoanManagementStyles();
    });
})();