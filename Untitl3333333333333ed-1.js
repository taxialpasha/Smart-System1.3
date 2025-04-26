/**
 * employees-management.js
 * نظام إدارة الموظفين المتكامل - الإصدار 2.0
 * سيستم متطور لإدارة الموظفين والرواتب والمستحقات مع ميزات متقدمة
 */

// ===== المتغيرات العامة =====
let employees = [];              // قائمة الموظفين
let salaryTransactions = [];     // سجل الرواتب
let salaryAdvances = [];         // السلف والدفعات المقدمة
let employeeLoans = [];          // قروض الموظفين
let attendanceRecords = [];      // سجلات الحضور والانصراف
let vacationRequests = [];       // طلبات الإجازات

// ===== التهيئة الأساسية =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام إدارة الموظفين المتكامل...');
    
    // إضافة الرابط في القائمة الجانبية
    addEmployeesSidebarLink();
    
    // إضافة صفحات نظام الموظفين
    initEmployeesPages();
    
    // إضافة النوافذ المنبثقة
    initEmployeesModals();
    
    // إضافة الأنماط المخصصة
    addEmployeesStyles();
    
    // تحميل البيانات من التخزين المحلي
    loadStoredData();
    
    // تهيئة مستمعي الأحداث
    initEventListeners();
    
    // تنفيذ المهام الدورية
    setupPeriodicTasks();
    
    // تهيئة الإشعارات
    setupNotifications();
});

/**
 * تحميل البيانات المخزنة مسبقاً
 */
function loadStoredData() {
    try {
        // تحميل بيانات الموظفين
        const savedEmployees = localStorage.getItem('employeesData');
        if (savedEmployees) {
            employees = JSON.parse(savedEmployees);
            console.log(`تم تحميل ${employees.length} موظف من التخزين المحلي`);
        }
        
        // تحميل معاملات الرواتب
        const savedTransactions = localStorage.getItem('salaryTransactions');
        if (savedTransactions) {
            salaryTransactions = JSON.parse(savedTransactions);
            console.log(`تم تحميل ${salaryTransactions.length} معاملة راتب من التخزين المحلي`);
        }
        
        // تحميل السلف
        const savedAdvances = localStorage.getItem('salaryAdvances');
        if (savedAdvances) {
            salaryAdvances = JSON.parse(savedAdvances);
        }
        
        // تحميل القروض
        const savedLoans = localStorage.getItem('employeeLoans');
        if (savedLoans) {
            employeeLoans = JSON.parse(savedLoans);
        }
        
        // تحميل سجلات الحضور
        const savedAttendance = localStorage.getItem('attendanceRecords');
        if (savedAttendance) {
            attendanceRecords = JSON.parse(savedAttendance);
        }
        
        // تحميل طلبات الإجازات
        const savedVacations = localStorage.getItem('vacationRequests');
        if (savedVacations) {
            vacationRequests = JSON.parse(savedVacations);
        }
        
        console.log('تم تحميل جميع بيانات نظام الموظفين بنجاح');
    } catch (error) {
        console.error('حدث خطأ أثناء تحميل بيانات الموظفين:', error);
        showToast('حدث خطأ أثناء تحميل البيانات - تم تهيئة النظام بقيم افتراضية', 'error');
    }
}

/**
 * حفظ البيانات في التخزين المحلي
 * @param {string} key - مفتاح التخزين
 * @param {Array|Object} data - البيانات المراد تخزينها
 */
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`خطأ في حفظ البيانات (${key}):`, error);
        showToast('حدث خطأ أثناء حفظ البيانات', 'error');
        return false;
    }
}

/**
 * حفظ جميع بيانات النظام
 */
function saveAllData() {
    saveToLocalStorage('employeesData', employees);
    saveToLocalStorage('salaryTransactions', salaryTransactions);
    saveToLocalStorage('salaryAdvances', salaryAdvances);
    saveToLocalStorage('employeeLoans', employeeLoans);
    saveToLocalStorage('attendanceRecords', attendanceRecords);
    saveToLocalStorage('vacationRequests', vacationRequests);
    
    console.log('تم حفظ جميع بيانات النظام بنجاح');
}

// ===== إعداد واجهة المستخدم =====

/**
 * إضافة رابط صفحة الموظفين إلى القائمة الجانبية
 */
function addEmployeesSidebarLink() {
    const navList = document.querySelector('.nav-list');
    if (!navList) return;
    
    // التحقق من عدم وجود الرابط مسبقاً
    if (document.querySelector('a[data-page="employees"]')) return;
    
    // إنشاء عنصر الرابط
    const navItem = document.createElement('li');
    navItem.className = 'nav-item';
    
    navItem.innerHTML = `
        <a class="nav-link" data-page="employees" href="#">
            <div class="nav-icon">
                <i class="fas fa-user-tie"></i>
            </div>
            <span>إدارة الموظفين</span>
        </a>
    `;
    
    // إضافة الرابط قبل رابط الإعدادات (أو في نهاية القائمة)
    const settingsNavItem = document.querySelector('a[data-page="settings"]')?.parentNode;
    if (settingsNavItem) {
        navList.insertBefore(navItem, settingsNavItem);
    } else {
        navList.appendChild(navItem);
    }
}

/**
 * تهيئة صفحات نظام الموظفين
 */
function initEmployeesPages() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    // التحقق من عدم وجود الصفحة مسبقاً
    if (document.getElementById('employees-page')) return;
    
    // إنشاء عنصر الصفحة الرئيسية للموظفين
    const employeesPage = document.createElement('div');
    employeesPage.className = 'page';
    employeesPage.id = 'employees-page';
    
    employeesPage.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">نظام إدارة الموظفين</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" id="employees-search" placeholder="بحث عن موظف..." type="text" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-primary" id="add-employee-btn">
                    <i class="fas fa-plus"></i>
                    <span>إضافة موظف</span>
                </button>
            </div>
        </div>
        
        <div class="tabs">
            <div class="tab-buttons">
                <button class="tab-btn active" data-tab="employees-list">الموظفين</button>
                <button class="tab-btn" data-tab="salary-transactions">الرواتب</button>
                <button class="tab-btn" data-tab="payroll">المستحقات</button>
                <button class="tab-btn" data-tab="advances-loans">السلف والقروض</button>
                <button class="tab-btn" data-tab="attendance">الحضور والإجازات</button>
                <button class="tab-btn" data-tab="employees-reports">التقارير</button>
            </div>
            
            <!-- تبويب قائمة الموظفين -->
            <div class="tab-content active" id="employees-list-tab">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">قائمة الموظفين</h2>
                        <div class="section-actions">
                            <div class="btn-group">
                                <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
                                <button class="btn btn-outline btn-sm" data-filter="active">نشط</button>
                                <button class="btn btn-outline btn-sm" data-filter="inactive">غير نشط</button>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-outline btn-sm dropdown-toggle">
                                    <i class="fas fa-file-export"></i>
                                    <span>تصدير</span>
                                </button>
                                <div class="dropdown-menu">
                                    <a href="#" id="export-employees-excel">Excel</a>
                                    <a href="#" id="export-employees-csv">CSV</a>
                                    <a href="#" id="export-employees-pdf">PDF</a>
                                    <a href="#" id="print-employees-list">طباعة</a>
                                </div>
                            </div>
                            <button class="btn btn-outline btn-sm" id="import-employees-btn">
                                <i class="fas fa-file-import"></i>
                                <span>استيراد</span>
                            </button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table id="employees-table" class="table-hover">
                            <thead>
                                <tr>
                                    <th>م</th>
                                    <th>الموظف</th>
                                    <th>المسمى الوظيفي</th>
                                    <th>القسم</th>
                                    <th>رقم الهاتف</th>
                                    <th>تاريخ التعيين</th>
                                    <th>الراتب الأساسي</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- سيتم ملؤها ديناميكياً -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- تبويب سجل الرواتب -->
            <div class="tab-content" id="salary-transactions-tab">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">سجل الرواتب</h2>
                        <div class="section-actions">
                            <div class="date-filter">
                                <label>تصفية: </label>
                                <select id="salary-month-filter">
                                    <option value="all">كل الأشهر</option>
                                    <option value="1">يناير</option>
                                    <option value="2">فبراير</option>
                                    <option value="3">مارس</option>
                                    <option value="4">أبريل</option>
                                    <option value="5">مايو</option>
                                    <option value="6">يونيو</option>
                                    <option value="7">يوليو</option>
                                    <option value="8">أغسطس</option>
                                    <option value="9">سبتمبر</option>
                                    <option value="10">أكتوبر</option>
                                    <option value="11">نوفمبر</option>
                                    <option value="12">ديسمبر</option>
                                </select>
                                <select id="salary-year-filter">
                                    <!-- سيتم ملؤها ديناميكياً -->
                                </select>
                            </div>
                            <button class="btn btn-success" id="pay-salary-btn">
                                <i class="fas fa-money-bill-wave"></i>
                                <span>صرف راتب</span>
                            </button>
                            <div class="dropdown">
                                <button class="btn btn-outline btn-sm dropdown-toggle">
                                    <i class="fas fa-file-export"></i>
                                    <span>تصدير</span>
                                </button>
                                <div class="dropdown-menu">
                                    <a href="#" id="export-salaries-excel">Excel</a>
                                    <a href="#" id="export-salaries-csv">CSV</a>
                                    <a href="#" id="export-salaries-pdf">PDF</a>
                                    <a href="#" id="print-salaries-list">طباعة</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="table-container">
                        <table id="salary-transactions-table" class="table-hover">
                            <thead>
                                <tr>
                                    <th>رقم العملية</th>
                                    <th>الموظف</th>
                                    <th>الشهر</th>
                                    <th>تاريخ الصرف</th>
                                    <th>الراتب الأساسي</th>
                                    <th>المبيعات</th>
                                    <th>العمولة</th>
                                    <th>البدلات</th>
                                    <th>الاستقطاعات</th>
                                    <th>الإجمالي</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- سيتم ملؤها ديناميكياً -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- تبويب المستحقات الشهرية -->
            <div class="tab-content" id="payroll-tab">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">المستحقات الشهرية</h2>
                        <div class="section-actions">
                            <div class="date-filter">
                                <label>الشهر: </label>
                                <select id="payroll-month-filter">
                                    <option value="1">يناير</option>
                                    <option value="2">فبراير</option>
                                    <option value="3">مارس</option>
                                    <option value="4">أبريل</option>
                                    <option value="5">مايو</option>
                                    <option value="6">يونيو</option>
                                    <option value="7">يوليو</option>
                                    <option value="8">أغسطس</option>
                                    <option value="9">سبتمبر</option>
                                    <option value="10">أكتوبر</option>
                                    <option value="11">نوفمبر</option>
                                    <option value="12">ديسمبر</option>
                                </select>
                                <select id="payroll-year-filter">
                                    <!-- سيتم ملؤها ديناميكياً -->
                                </select>
                            </div>
                            <button class="btn btn-success" id="process-all-payroll-btn">
                                <i class="fas fa-money-check-alt"></i>
                                <span>صرف جميع الرواتب</span>
                            </button>
                            <button class="btn btn-primary" id="print-payroll-btn">
                                <i class="fas fa-print"></i>
                                <span>طباعة كشف المستحقات</span>
                            </button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table id="payroll-table" class="table-hover">
                            <thead>
                                <tr>
                                    <th>م</th>
                                    <th>الموظف</th>
                                    <th>المسمى الوظيفي</th>
                                    <th>الراتب الأساسي</th>
                                    <th>العمولة المتوقعة</th>
                                    <th>البدلات</th>
                                    <th>الاستقطاعات</th>
                                    <th>الديون/السلف</th>
                                    <th>صافي المستحق</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- سيتم ملؤها ديناميكياً -->
                            </tbody>
                        </table>
                    </div>
                    <div class="payroll-summary">
                        <div class="summary-total">
                            <div class="summary-item">
                                <span class="summary-label">الإجمالي:</span>
                                <span class="summary-value" id="payroll-total">0 دينار</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">المدفوع:</span>
                                <span class="summary-value" id="payroll-paid">0 دينار</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">المتبقي:</span>
                                <span class="summary-value" id="payroll-remaining">0 دينار</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- تبويب السلف والقروض -->
            <div class="tab-content" id="advances-loans-tab">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">السلف والقروض</h2>
                        <div class="section-actions">
                            <div class="btn-group">
                                <button class="btn btn-outline btn-sm active" data-advances-view="all">الكل</button>
                                <button class="btn btn-outline btn-sm" data-advances-view="advances">السلف</button>
                                <button class="btn btn-outline btn-sm" data-advances-view="loans">القروض</button>
                            </div>
                            <button class="btn btn-primary" id="add-advance-btn">
                                <i class="fas fa-plus"></i>
                                <span>إضافة سلفة</span>
                            </button>
                            <button class="btn btn-info" id="add-loan-btn">
                                <i class="fas fa-plus"></i>
                                <span>إضافة قرض</span>
                            </button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table id="advances-table" class="table-hover">
                            <thead>
                                <tr>
                                    <th>رقم العملية</th>
                                    <th>النوع</th>
                                    <th>الموظف</th>
                                    <th>التاريخ</th>
                                    <th>المبلغ</th>
                                    <th>المدفوع</th>
                                    <th>المتبقي</th>
                                    <th>الحالة</th>
                                    <th>ملاحظات</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- سيتم ملؤها ديناميكياً -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- تبويب الحضور والإجازات -->
            <div class="tab-content" id="attendance-tab">
                <div class="section">
                    <div class="attendance-tabs">
                        <button class="attendance-tab-btn active" data-attendance-tab="attendance-records">سجل الحضور</button>
                        <button class="attendance-tab-btn" data-attendance-tab="vacation-requests">طلبات الإجازات</button>
                    </div>
                    
                    <div class="attendance-tab-content active" id="attendance-records-content">
                        <div class="section-header">
                            <h2 class="section-title">سجل الحضور والانصراف</h2>
                            <div class="section-actions">
                                <div class="date-filter">
                                    <label>التاريخ: </label>
                                    <input type="date" id="attendance-date-filter">
                                </div>
                                <button class="btn btn-primary" id="record-attendance-btn">
                                    <i class="fas fa-clock"></i>
                                    <span>تسجيل حضور</span>
                                </button>
                                <button class="btn btn-outline btn-sm" id="export-attendance-btn">
                                    <i class="fas fa-file-export"></i>
                                    <span>تصدير</span>
                                </button>
                            </div>
                        </div>
                        <div class="table-container">
                            <table id="attendance-table" class="table-hover">
                                <thead>
                                    <tr>
                                        <th>م</th>
                                        <th>الموظف</th>
                                        <th>التاريخ</th>
                                        <th>وقت الحضور</th>
                                        <th>وقت الانصراف</th>
                                        <th>ساعات العمل</th>
                                        <th>الحالة</th>
                                        <th>ملاحظات</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- سيتم ملؤها ديناميكياً -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="attendance-tab-content" id="vacation-requests-content">
                        <div class="section-header">
                            <h2 class="section-title">طلبات الإجازات</h2>
                            <div class="section-actions">
                                <button class="btn btn-primary" id="add-vacation-btn">
                                    <i class="fas fa-calendar-plus"></i>
                                    <span>طلب إجازة</span>
                                </button>
                            </div>
                        </div>
                        <div class="table-container">
                            <table id="vacation-table" class="table-hover">
                                <thead>
                                    <tr>
                                        <th>م</th>
                                        <th>الموظف</th>
                                        <th>نوع الإجازة</th>
                                        <th>من تاريخ</th>
                                        <th>إلى تاريخ</th>
                                        <th>المدة</th>
                                        <th>تاريخ الطلب</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- سيتم ملؤها ديناميكياً -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- تبويب التقارير -->
            <div class="tab-content" id="employees-reports-tab">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">تقارير الموظفين</h2>
                        <div class="section-actions">
                            <div class="btn-group">
                                <button class="btn btn-outline btn-sm active" data-report-period="monthly">شهري</button>
                                <button class="btn btn-outline btn-sm" data-report-period="quarterly">ربع سنوي</button>
                                <button class="btn btn-outline btn-sm" data-report-period="yearly">سنوي</button>
                            </div>
                            <div class="date-filter">
                                <select id="report-month-filter">
                                    <option value="1">يناير</option>
                                    <option value="2">فبراير</option>
                                    <option value="3">مارس</option>
                                    <option value="4">أبريل</option>
                                    <option value="5">مايو</option>
                                    <option value="6">يونيو</option>
                                    <option value="7">يوليو</option>
                                    <option value="8">أغسطس</option>
                                    <option value="9">سبتمبر</option>
                                    <option value="10">أكتوبر</option>
                                    <option value="11">نوفمبر</option>
                                    <option value="12">ديسمبر</option>
                                </select>
                                <select id="report-year-filter">
                                    <!-- سيتم ملؤها ديناميكياً -->
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="reports-grid">
                        <div class="report-card">
                            <h3>توزيع الرواتب</h3>
                            <div class="chart-container">
                                <canvas id="salary-distribution-chart"></canvas>
                            </div>
                        </div>
                        <div class="report-card">
                            <h3>توزيع الموظفين حسب القسم</h3>
                            <div class="chart-container">
                                <canvas id="employees-by-department-chart"></canvas>
                            </div>
                        </div>
                        <div class="report-card">
                            <h3>تطور الرواتب</h3>
                            <div class="chart-container">
                                <canvas id="salary-trend-chart"></canvas>
                            </div>
                        </div>
                        <div class="report-card">
                            <h3>أداء الموظفين</h3>
                            <div class="chart-container">
                                <canvas id="employee-performance-chart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="reports-actions">
                        <button class="btn btn-primary" id="generate-report-btn">
                            <i class="fas fa-file-pdf"></i>
                            <span>إنشاء تقرير شامل</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // إضافة الصفحة إلى العنصر الرئيسي
    mainContent.appendChild(employeesPage);
    
    // تهيئة قوائم السنوات في المرشحات
    initYearFilters();
}

/**
 * تهيئة النوافذ المنبثقة للنظام
 */
function initEmployeesModals() {
    // التحقق من عدم وجود النوافذ مسبقاً
    if (document.getElementById('add-employee-modal')) return;
    
    // إضافة حاوية النوافذ المنبثقة إذا لم تكن موجودة
    let modalsContainer = document.querySelector('.modals-container');
    if (!modalsContainer) {
        modalsContainer = document.createElement('div');
        modalsContainer.className = 'modals-container';
        document.body.appendChild(modalsContainer);
    }
    
    // إضافة نافذة إضافة/تعديل موظف
    modalsContainer.innerHTML += `
        <!-- نافذة إضافة/تعديل موظف -->
        <div class="modal-overlay" id="add-employee-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">إضافة موظف جديد</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="employee-form">
                        <div class="form-tabs">
                            <div class="form-tab-buttons">
                                <button type="button" class="form-tab-btn active" data-tab="personal-info">معلومات شخصية</button>
                                <button type="button" class="form-tab-btn" data-tab="job-info">معلومات وظيفية</button>
                                <button type="button" class="form-tab-btn" data-tab="financial-info">المعلومات المالية</button>
                                <button type="button" class="form-tab-btn" data-tab="documents">المستندات</button>
                            </div>
                            
                            <!-- تبويب المعلومات الشخصية -->
                            <div class="form-tab-content active" id="personal-info-tab">
                                <div class="grid-cols-2">
                                    <div class="form-group">
                                        <label class="form-label required">الاسم الكامل</label>
                                        <input class="form-input" id="employee-name" name="name" required type="text" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required">رقم الهاتف</label>
                                        <input class="form-input" id="employee-phone" name="phone" required type="tel" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">رقم الهاتف البديل</label>
                                        <input class="form-input" id="employee-alt-phone" name="altPhone" type="tel" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">البريد الإلكتروني</label>
                                        <input class="form-input" id="employee-email" name="email" type="email" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required">العنوان</label>
                                        <textarea class="form-input" id="employee-address" name="address" required rows="2"></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">تاريخ الميلاد</label>
                                        <input class="form-input" id="employee-birthdate" name="birthdate" type="date" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">الجنس</label>
                                        <select class="form-select" id="employee-gender" name="gender">
                                            <option value="male">ذكر</option>
                                            <option value="female">أنثى</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">الحالة الاجتماعية</label>
                                        <select class="form-select" id="employee-marital-status" name="maritalStatus">
                                            <option value="single">أعزب</option>
                                            <option value="married">متزوج</option>
                                            <option value="divorced">مطلق</option>
                                            <option value="widowed">أرمل</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- تبويب المعلومات الوظيفية -->
                            <div class="form-tab-content" id="job-info-tab">
                                <div class="grid-cols-2">
                                    <div class="form-group">
                                        <label class="form-label required">المسمى الوظيفي</label>
                                        <input class="form-input" id="employee-job-title" name="jobTitle" required type="text" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required">القسم</label>
                                        <select class="form-select" id="employee-department" name="department" required>
                                            <option value="management">الإدارة</option>
                                            <option value="sales">المبيعات</option>
                                            <option value="marketing">التسويق</option>
                                            <option value="finance">المالية</option>
                                            <option value="hr">الموارد البشرية</option>
                                            <option value="it">تكنولوجيا المعلومات</option>
                                            <option value="operations">العمليات</option>
                                            <option value="customer-service">خدمة العملاء</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required">المدير المباشر</label>
                                        <select class="form-select" id="employee-manager" name="managerId">
                                            <option value="">لا يوجد</option>
                                            <!-- سيتم ملؤها ديناميكياً -->
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required">تاريخ التعيين</label>
                                        <input class="form-input" id="employee-hire-date" name="hireDate" required type="date" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">تاريخ انتهاء العقد</label>
                                        <input class="form-input" id="employee-contract-end" name="contractEnd" type="date" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">نوع العقد</label>
                                        <select class="form-select" id="employee-contract-type" name="contractType">
                                            <option value="full-time">دوام كامل</option>
                                            <option value="part-time">دوام جزئي</option>
                                            <option value="temporary">مؤقت</option>
                                            <option value="contract">عقد</option>
                                            <option value="internship">تدريب</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">ساعات العمل اليومية</label>
                                        <input class="form-input" id="employee-work-hours" min="1" max="12" name="workHours" type="number" value="8" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">الحالة</label>
                                        <select class="form-select" id="employee-status" name="status">
                                            <option value="active">نشط</option>
                                            <option value="inactive">غير نشط</option>
                                            <option value="on-leave">في إجازة</option>
                                            <option value="terminated">منتهي العقد</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- تبويب المعلومات المالية -->
                            <div class="form-tab-content" id="financial-info-tab">
                                <div class="grid-cols-2">
                                    <div class="form-group">
                                        <label class="form-label required">الراتب الأساسي</label>
                                        <input class="form-input" id="employee-basic-salary" min="0" name="basicSalary" required type="number" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">بدل السكن</label>
                                        <input class="form-input" id="employee-housing-allowance" min="0" name="housingAllowance" type="number" value="0" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">بدل النقل</label>
                                        <input class="form-input" id="employee-transportation-allowance" min="0" name="transportationAllowance" type="number" value="0" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">بدلات أخرى</label>
                                        <input class="form-input" id="employee-other-allowances" min="0" name="otherAllowances" type="number" value="0" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">نسبة العمولة (%)</label>
                                        <input class="form-input" id="employee-commission-rate" max="100" min="0" name="commissionRate" step="0.01" type="number" value="0" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">طريقة الدفع</label>
                                        <select class="form-select" id="employee-payment-method" name="paymentMethod">
                                            <option value="bank">تحويل بنكي</option>
                                            <option value="cash">نقدي</option>
                                            <option value="cheque">شيك</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">البنك</label>
                                        <input class="form-input" id="employee-bank-name" name="bankName" type="text" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">رقم الحساب البنكي</label>
                                        <input class="form-input" id="employee-bank-account" name="bankAccount" type="text" />
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">ملاحظات مالية</label>
                                    <textarea class="form-input" id="employee-financial-notes" name="financialNotes" rows="2"></textarea>
                                </div>
                            </div>
                            
                            <!-- تبويب المستندات -->
                            <div class="form-tab-content" id="documents-tab">
                                <div class="grid-cols-2">
                                    <div class="form-group">
                                        <label class="form-label required">رقم الهوية</label>
                                        <input class="form-input" id="employee-id-number" name="idNumber" required type="text" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">تاريخ انتهاء الهوية</label>
                                        <input class="form-input" id="employee-id-expiry" name="idExpiry" type="date" />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">صورة الهوية</label>
                                        <div class="file-upload-container">
                                            <button type="button" class="btn btn-outline btn-sm file-upload-btn" id="id-card-upload-btn">
                                                <i class="fas fa-upload"></i>
                                                <span>تحميل الصورة</span>
                                            </button>
                                            <div class="file-preview" id="id-card-preview"></div>
                                            <input type="file" id="id-card-upload" name="idCardImage" accept="image/*" hidden />
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">الصورة الشخصية</label>
                                        <div class="file-upload-container">
                                            <button type="button" class="btn btn-outline btn-sm file-upload-btn" id="employee-photo-upload-btn">
                                                <i class="fas fa-upload"></i>
                                                <span>تحميل الصورة</span>
                                            </button>
                                            <div class="file-preview" id="employee-photo-preview"></div>
                                            <input type="file" id="employee-photo-upload" name="photo" accept="image/*" hidden />
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">الشهادة العلمية</label>
                                        <div class="file-upload-container">
                                            <button type="button" class="btn btn-outline btn-sm file-upload-btn" id="certificate-upload-btn">
                                                <i class="fas fa-upload"></i>
                                                <span>تحميل الملف</span>
                                            </button>
                                            <div class="file-preview" id="certificate-preview"></div>
                                            <input type="file" id="certificate-upload" name="certificateFile" accept=".pdf,.jpg,.jpeg,.png" hidden />
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">عقد العمل</label>
                                        <div class="file-upload-container">
                                            <button type="button" class="btn btn-outline btn-sm file-upload-btn" id="contract-upload-btn">
                                                <i class="fas fa-upload"></i>
                                                <span>تحميل الملف</span>
                                            </button>
                                            <div class="file-preview" id="contract-preview"></div>
                                            <input type="file" id="contract-upload" name="contractFile" accept=".pdf" hidden />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">ملاحظات</label>
                                    <textarea class="form-input" id="employee-notes" name="notes" rows="3"></textarea>
                                </div>
                            </div>
                        </div>
                        <input type="hidden" id="employee-id" name="id" />
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-employee-btn">حفظ</button>
                </div>
            </div>
        </div>
        
        <!-- نافذة صرف راتب -->
        <div class="modal-overlay" id="pay-salary-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">صرف راتب</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="pay-salary-form">
                        <div class="form-group">
                            <label class="form-label required">الموظف</label>
                            <select class="form-select" id="salary-employee" name="employeeId" required>
                                <option value="">اختر الموظف</option>
                                <!-- سيتم ملؤها ديناميكياً -->
                            </select>
                        </div>
                        <div id="employee-salary-info" class="employee-info-card">
                            <!-- سيتم ملؤها ديناميكياً -->
                        </div>
                        <div class="grid-cols-2">
                            <div class="form-group">
                                <label class="form-label required">الشهر المستحق</label>
                                <select class="form-select" id="salary-month" name="month" required>
                                    <option value="1">يناير</option>
                                    <option value="2">فبراير</option>
                                    <option value="3">مارس</option>
                                    <option value="4">أبريل</option>
                                    <option value="5">مايو</option>
                                    <option value="6">يونيو</option>
                                    <option value="7">يوليو</option>
                                    <option value="8">أغسطس</option>
                                    <option value="9">سبتمبر</option>
                                    <option value="10">أكتوبر</option>
                                    <option value="11">نوفمبر</option>
                                    <option value="12">ديسمبر</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">السنة</label>
                                <select class="form-select" id="salary-year" name="year" required>
                                    <!-- سيتم ملؤها ديناميكياً -->
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">تاريخ صرف الراتب</label>
                                <input class="form-input" id="salary-date" name="date" required type="date" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">الراتب الأساسي</label>
                                <input class="form-input" id="salary-basic" name="basicSalary" readonly type="number" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">البدلات</label>
                                <input class="form-input" id="salary-allowances" name="allowances" readonly type="number" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">المبيعات الشهرية</label>
                                <input class="form-input" id="salary-sales" min="0" name="sales" type="number" value="0" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">نسبة العمولة (%)</label>
                                <input class="form-input" id="salary-commission-rate" name="commissionRate" readonly type="text" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">مبلغ العمولة</label>
                                <input class="form-input" id="salary-commission-amount" name="commissionAmount" readonly type="number" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">المكافآت</label>
                                <input class="form-input" id="salary-bonus" min="0" name="bonus" type="number" value="0" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">الاستقطاعات</label>
                                <input class="form-input" id="salary-deductions" min="0" name="deductions" type="number" value="0" />
                            </div>
                        </div>
                        
                        <div class="active-loans-section" id="employee-active-loans">
                            <!-- سيتم ملؤها ديناميكياً -->
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-input" id="salary-notes" name="notes" rows="2"></textarea>
                        </div>
                        
                        <div class="salary-summary">
                            <h4>إجمالي الراتب</h4>
                            <div class="salary-total" id="salary-total">0 دينار</div>
                            <div class="salary-calculation" id="salary-calculation"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-success" id="confirm-pay-salary-btn">صرف الراتب</button>
                </div>
            </div>
        </div>
        
        <!-- نافذة إضافة سلفة -->
        <div class="modal-overlay" id="add-advance-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">إضافة سلفة</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="advance-form">
                        <div class="form-group">
                            <label class="form-label required">الموظف</label>
                            <select class="form-select" id="advance-employee" name="employeeId" required>
                                <option value="">اختر الموظف</option>
                                <!-- سيتم ملؤها ديناميكياً -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">المبلغ</label>
                            <input class="form-input" id="advance-amount" min="1" name="amount" required type="number" />
                        </div>
                        <div class="form-group">
                            <label class="form-label required">تاريخ السلفة</label>
                            <input class="form-input" id="advance-date" name="date" required type="date" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">تاريخ الاستقطاع</label>
                            <input class="form-input" id="advance-deduction-date" name="deductionDate" type="date" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">طريقة السداد</label>
                            <select class="form-select" id="advance-repayment-method" name="repaymentMethod">
                                <option value="one-time">دفعة واحدة</option>
                                <option value="installments">أقساط</option>
                            </select>
                        </div>
                        <div class="form-group installments-group" style="display: none;">
                            <label class="form-label">عدد الأقساط</label>
                            <input class="form-input" id="advance-installments" min="1" name="installments" type="number" value="1" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-input" id="advance-notes" name="notes" rows="2"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-advance-btn">حفظ</button>
                </div>
            </div>
        </div>
        
        <!-- نافذة إضافة قرض -->
        <div class="modal-overlay" id="add-loan-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">إضافة قرض</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="loan-form">
                        <div class="form-group">
                            <label class="form-label required">الموظف</label>
                            <select class="form-select" id="loan-employee" name="employeeId" required>
                                <option value="">اختر الموظف</option>
                                <!-- سيتم ملؤها ديناميكياً -->
                            </select>
                        </div>
                        <div class="grid-cols-2">
                            <div class="form-group">
                                <label class="form-label required">المبلغ</label>
                                <input class="form-input" id="loan-amount" min="1" name="amount" required type="number" />
                            </div>
                            <div class="form-group">
                                <label class="form-label required">تاريخ القرض</label>
                                <input class="form-input" id="loan-date" name="date" required type="date" />
                            </div>
                            <div class="form-group">
                                <label class="form-label required">عدد الأقساط</label>
                                <input class="form-input" id="loan-installments" min="1" name="installments" required type="number" value="1" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">نسبة الفائدة (%)</label>
                                <input class="form-input" id="loan-interest-rate" min="0" max="100" name="interestRate" step="0.01" type="number" value="0" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">تاريخ أول قسط</label>
                                <input class="form-input" id="loan-first-payment" name="firstPaymentDate" type="date" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">طريقة السداد</label>
                                <select class="form-select" id="loan-payment-method" name="paymentMethod">
                                    <option value="salary-deduction">استقطاع من الراتب</option>
                                    <option value="cash">نقدي</option>
                                    <option value="bank-transfer">تحويل بنكي</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-input" id="loan-notes" name="notes" rows="2"></textarea>
                        </div>
                        <div class="loan-summary" id="loan-summary">
                            <!-- سيتم ملؤها ديناميكياً -->
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-loan-btn">حفظ</button>
                </div>
            </div>
        </div>
        
        <!-- نافذة إضافة سجل حضور -->
        <div class="modal-overlay" id="attendance-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تسجيل حضور</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="attendance-form">
                        <div class="form-group">
                            <label class="form-label required">الموظف</label>
                            <select class="form-select" id="attendance-employee" name="employeeId" required>
                                <option value="">اختر الموظف</option>
                                <!-- سيتم ملؤها ديناميكياً -->
                            </select>
                        </div>
                        <div class="grid-cols-2">
                            <div class="form-group">
                                <label class="form-label required">التاريخ</label>
                                <input class="form-input" id="attendance-date" name="date" required type="date" />
                            </div>
                            <div class="form-group">
                                <label class="form-label required">وقت الحضور</label>
                                <input class="form-input" id="attendance-time-in" name="timeIn" required type="time" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">وقت الانصراف</label>
                                <input class="form-input" id="attendance-time-out" name="timeOut" type="time" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">الحالة</label>
                                <select class="form-select" id="attendance-status" name="status">
                                    <option value="present">حاضر</option>
                                    <option value="late">متأخر</option>
                                    <option value="absent">غائب</option>
                                    <option value="half-day">نصف يوم</option>
                                    <option value="vacation">إجازة</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-input" id="attendance-notes" name="notes" rows="2"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-attendance-btn">حفظ</button>
                </div>
            </div>
        </div>
        
        <!-- نافذة إضافة طلب إجازة -->
        <div class="modal-overlay" id="vacation-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">طلب إجازة</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="vacation-form">
                        <div class="form-group">
                            <label class="form-label required">الموظف</label>
                            <select class="form-select" id="vacation-employee" name="employeeId" required>
                                <option value="">اختر الموظف</option>
                                <!-- سيتم ملؤها ديناميكياً -->
                            </select>
                        </div>
                        <div class="grid-cols-2">
                            <div class="form-group">
                                <label class="form-label required">نوع الإجازة</label>
                                <select class="form-select" id="vacation-type" name="type" required>
                                    <option value="annual">سنوية</option>
                                    <option value="sick">مرضية</option>
                                    <option value="personal">شخصية</option>
                                    <option value="emergency">طارئة</option>
                                    <option value="unpaid">بدون راتب</option>
                                    <option value="maternity">أمومة</option>
                                    <option value="marriage">زواج</option>
                                    <option value="bereavement">وفاة</option>
                                    <option value="other">أخرى</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">تاريخ بداية الإجازة</label>
                                <input class="form-input" id="vacation-start-date" name="startDate" required type="date" />
                            </div>
                            <div class="form-group">
                                <label class="form-label required">تاريخ نهاية الإجازة</label>
                                <input class="form-input" id="vacation-end-date" name="endDate" required type="date" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">عدد الأيام</label>
                                <input class="form-input" id="vacation-days" name="days" readonly type="number" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">السبب / الملاحظات</label>
                            <textarea class="form-input" id="vacation-reason" name="reason" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">المرفقات</label>
                            <div class="file-upload-container">
                                <button type="button" class="btn btn-outline btn-sm file-upload-btn" id="vacation-attachment-btn">
                                    <i class="fas fa-upload"></i>
                                    <span>تحميل ملف</span>
                                </button>
                                <div class="file-preview" id="vacation-attachment-preview"></div>
                                <input type="file" id="vacation-attachment" name="attachment" accept=".pdf,.jpg,.jpeg,.png" hidden />
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-vacation-btn">حفظ</button>
                </div>
            </div>
        </div>
        
        <!-- نافذة تفاصيل الموظف -->
        <div class="modal-overlay" id="employee-details-modal">
            <div class="modal modal-lg animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تفاصيل الموظف</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div id="employee-details-content">
                        <!-- سيتم ملؤها ديناميكياً -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                    <div class="btn-group">
                        <button class="btn btn-primary" id="edit-employee-btn">
                            <i class="fas fa-edit"></i>
                            <span>تعديل</span>
                        </button>
                        <button class="btn btn-success" id="employee-pay-salary-btn">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>صرف راتب</span>
                        </button>
                        <button class="btn btn-info" id="print-employee-btn">
                            <i class="fas fa-print"></i>
                            <span>طباعة</span>
                        </button>
                        <button class="btn btn-danger" id="delete-employee-btn">
                            <i class="fas fa-trash"></i>
                            <span>حذف</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- نافذة تفاصيل الراتب -->
        <div class="modal-overlay" id="salary-details-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تفاصيل الراتب</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div id="salary-details-content" class="printable-area">
                        <!-- سيتم ملؤها ديناميكياً -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                    <div class="btn-group">
                        <button class="btn btn-primary" id="print-salary-details-btn">
                            <i class="fas fa-print"></i>
                            <span>طباعة</span>
                        </button>
                        <button class="btn btn-info" id="export-salary-pdf-btn">
                            <i class="fas fa-file-pdf"></i>
                            <span>تصدير PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- نافذة استيراد بيانات -->
        <div class="modal-overlay" id="import-data-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">استيراد بيانات</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="import-form">
                        <div class="form-group">
                            <label class="form-label required">نوع البيانات</label>
                            <select class="form-select" id="import-type" name="importType" required>
                                <option value="employees">بيانات الموظفين</option>
                                <option value="salaries">سجلات الرواتب</option>
                                <option value="attendance">سجلات الحضور</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">ملف البيانات</label>
                            <div class="file-upload-container">
                                <button type="button" class="btn btn-outline file-upload-btn" id="import-file-btn">
                                    <i class="fas fa-upload"></i>
                                    <span>تحميل ملف</span>
                                </button>
                                <div class="file-preview" id="import-file-preview"></div>
                                <input type="file" id="import-file" name="importFile" accept=".csv,.xlsx,.xls" hidden />
                            </div>
                            <small class="text-muted">الملفات المدعومة: CSV, Excel (.xlsx, .xls)</small>
                        </div>
                        <div class="import-options">
                            <div class="form-group">
                                <label class="form-label">خيارات الاستيراد</label>
                                <div class="checkbox-group">
                                    <label class="checkbox-container">
                                        <input type="checkbox" id="import-override" name="override" />
                                        <span class="checkbox-text">استبدال البيانات الموجودة</span>
                                    </label>
                                    <label class="checkbox-container">
                                        <input type="checkbox" id="import-skip-header" name="skipHeader" checked />
                                        <span class="checkbox-text">تخطي الصف الأول (العناوين)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="import-preview">
                            <h4>معاينة البيانات</h4>
                            <div id="import-preview-data" class="table-container">
                                <p class="text-muted">قم بتحميل ملف لعرض معاينة البيانات</p>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="confirm-import-btn">استيراد</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * إضافة الأنماط المخصصة للنظام
 */
function addEmployeesStyles() {
    // التحقق من عدم وجود الأنماط مسبقاً
    if (document.getElementById('employees-styles')) return;
    
    // إنشاء عنصر الأنماط
    const styleElement = document.createElement('style');
    styleElement.id = 'employees-styles';
    
    // تعريف الأنماط
    styleElement.textContent = `
        /* ===== أنماط عامة ===== */
        .required::after {
            content: "*";
            color: #f43f5e;
            margin-right: 4px;
        }
        
        .grid-cols-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .grid-cols-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
        }
        
        .modal-lg {
            max-width: 900px;
            width: 90%;
        }
        
        /* ===== أنماط تبويبات النموذج ===== */
        .form-tabs {
            margin-bottom: 20px;
        }
        
        .form-tab-buttons {
            display: flex;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 20px;
        }
        
        .form-tab-btn {
            padding: 10px 15px;
            background: none;
            border: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            font-weight: 500;
            color: #64748b;
            transition: all 0.3s ease;
        }
        
        .form-tab-btn.active {
            color: #3b82f6;
            border-bottom-color: #3b82f6;
        }
        
        .form-tab-content {
            display: none;
            animation: fadeIn 0.3s ease;
        }
        
        .form-tab-content.active {
            display: block;
        }
        
        /* ===== أنماط تحميل الملفات ===== */
        .file-upload-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .file-preview {
            min-height: 80px;
            border: 1px dashed #cbd5e1;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
            color: #64748b;
            font-size: 0.9rem;
        }
        
        .file-preview:empty::before {
            content: "لا يوجد ملف محدد";
            color: #94a3b8;
        }
        
        .file-preview img {
            max-width: 100%;
            max-height: 150px;
            object-fit: contain;
        }
        
        .file-preview .file-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .file-preview .file-icon {
            font-size: 24px;
            color: #3b82f6;
        }
        
        .file-preview .file-name {
            font-weight: 500;
        }
        
        .file-preview .file-remove {
            margin-right: auto;
            cursor: pointer;
            color: #f43f5e;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        }
        
        .file-preview .file-remove:hover {
            background-color: rgba(244, 63, 94, 0.1);
        }
        
        /* ===== أنماط ملخص الراتب ===== */
        .salary-summary {
            margin-top: 20px;
            padding: 16px;
            background-color: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            text-align: center;
        }
        
        .salary-total {
            font-size: 2rem;
            font-weight: 700;
            color: #3b82f6;
            margin: 10px 0;
        }
        
        .salary-calculation {
            font-size: 0.9rem;
            color: #64748b;
            line-height: 1.5;
        }
        
        /* ===== أنماط تفاصيل الراتب ===== */
        .employee-info-card {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            border: 1px solid #e2e8f0;
            display: none;
        }
        
        .employee-info-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .employee-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #3b82f6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: 700;
            margin-left: 15px;
        }
        
        .employee-info-details {
            flex: 1;
        }
        
        .employee-info-name {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .employee-info-position {
            color: #64748b;
            font-size: 0.9rem;
        }
        
        .employee-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .employee-info-item {
            display: flex;
            flex-direction: column;
        }
        
        .employee-info-label {
            font-size: 0.85rem;
            color: #64748b;
            margin-bottom: 3px;
        }
        
        .employee-info-value {
            font-weight: 500;
        }
        
        /* ===== أنماط بطاقة القروض النشطة ===== */
        .active-loans-section {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .active-loans-section h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #334155;
            font-size: 1rem;
            font-weight: 600;
        }
        
        .active-loans-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .active-loan-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background-color: #fff;
            border-radius: 6px;
            margin-bottom: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .loan-details {
            flex: 1;
        }
        
        .loan-title {
            font-weight: 500;
            margin-bottom: 5px;
        }
        
        .loan-info {
            display: flex;
            gap: 15px;
            font-size: 0.85rem;
            color: #64748b;
        }
        
        .loan-amount {
            font-weight: 600;
            color: #334155;
        }
        
        .loan-deduct-action .checkbox-container {
            margin: 0;
        }
        
        /* ===== أنماط ملخص القرض ===== */
        .loan-summary {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .loan-summary h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #334155;
            font-size: 1rem;
            font-weight: 600;
        }
        
        .loan-summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
        }
        
        .loan-summary-item {
            display: flex;
            flex-direction: column;
        }
        
        .loan-summary-label {
            font-size: 0.85rem;
            color: #64748b;
            margin-bottom: 3px;
        }
        
        .loan-summary-value {
            font-weight: 600;
            color: #334155;
        }
        
        .loan-summary-calculations {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
        }
        
        .loan-summary-total {
            font-size: 1.1rem;
            font-weight: 700;
            color: #3b82f6;
            text-align: center;
            margin-top: 10px;
        }
        
        /* ===== أنماط تفاصيل الموظف ===== */
        .employee-profile {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
        }
        
        .employee-photo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid #3b82f6;
            margin-left: 20px;
            background-color: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .employee-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .employee-photo-placeholder {
            font-size: 3rem;
            color: #94a3b8;
        }
        
        .employee-info {
            flex: 1;
        }
        
        .employee-name {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 4px;
        }
        
        .employee-job-title {
            font-size: 1.1rem;
            color: #64748b;
            margin-bottom: 8px;
        }
        
        .employee-status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .employee-status.active {
            background-color: rgba(16, 185, 129, 0.1);
            color: #10b981;
        }
        
        .employee-status.inactive {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }
        
        .employee-status.on-leave {
            background-color: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
        }
        
        .employee-status.terminated {
            background-color: rgba(107, 114, 128, 0.1);
            color: #6b7280;
        }
        
        .employee-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
        }
        
        .employee-detail-card {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 16px;
            border: 1px solid #e2e8f0;
        }
        
        .employee-detail-card h4 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            color: #3b82f6;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .employee-detail-card h4 i {
            font-size: 1rem;
        }
        
        .employee-detail-item {
            display: flex;
            margin-bottom: 10px;
        }
        
        .employee-detail-label {
            min-width: 140px;
            color: #64748b;
            font-weight: 500;
        }
        
        .employee-detail-value {
            flex: 1;
            font-weight: 400;
        }
        
        /* ===== أنماط المستندات ===== */
        .documents-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 16px;
        }
        
        .document-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .document-card-header {
            padding: 8px 12px;
            background-color: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 500;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .document-card-actions {
            display: flex;
            gap: 8px;
        }
        
        .document-card-actions button {
            background: none;
            border: none;
            cursor: pointer;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            color: #64748b;
            transition: all 0.2s ease;
        }
        
        .document-card-actions button:hover {
            background-color: #f1f5f9;
            color: #3b82f6;
        }
        
        .document-card-body {
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 150px;
        }
        
        .document-card-body img {
            max-width: 100%;
            max-height: 200px;
            object-fit: contain;
        }
        
        .document-placeholder {
            color: #94a3b8;
            text-align: center;
        }
        
        .document-placeholder i {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        
        /* ===== أنماط سجل الرواتب ===== */
        .employee-salary-history {
            margin-top: 20px;
        }
        
        .employee-salary-history h4 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: #3b82f6;
        }
        
        /* ===== أنماط المستحقات الشهرية ===== */
        .payroll-summary {
            margin-top: 20px;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .summary-total {
            display: flex;
            justify-content: space-around;
        }
        
        .summary-item {
            text-align: center;
        }
        
        .summary-label {
            display: block;
            font-size: 0.9rem;
            color: #64748b;
            margin-bottom: 5px;
        }
        
        .summary-value {
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        #payroll-total {
            color: #3b82f6;
        }
        
        #payroll-paid {
            color: #10b981;
        }
        
        #payroll-remaining {
            color: #f59e0b;
        }
        
        /* ===== أنماط تبويبات الحضور ===== */
        .attendance-tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .attendance-tab-btn {
            padding: 10px 20px;
            background: none;
            border: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            font-weight: 500;
            color: #64748b;
            transition: all 0.3s ease;
        }
        
        .attendance-tab-btn.active {
            color: #3b82f6;
            border-bottom-color: #3b82f6;
        }
        
        .attendance-tab-content {
            display: none;
            animation: fadeIn 0.3s ease;
        }
        
        .attendance-tab-content.active {
            display: block;
        }
        
        /* ===== أنماط التقارير ===== */
        .reports-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        
        .report-card {
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        
        .report-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 15px;
            color: #334155;
            text-align: center;
        }
        
        .chart-container {
            height: 250px;
            position: relative;
        }
        
        .reports-actions {
            margin-top: 20px;
            text-align: center;
        }
        
        /* ===== أنماط إيصال الراتب ===== */
        .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background-color: #fff;
        }
        
       .receipt-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #3b82f6;
        }
        
        .receipt-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 5px;
            color: #3b82f6;
        }
        
        .receipt-subtitle {
            font-size: 1rem;
            color: #64748b;
        }
        
        .receipt-company-logo {
            max-width: 150px;
            margin: 0 auto 15px;
        }
        
        .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .receipt-employee-info {
            flex: 1;
        }
        
        .receipt-employee-name {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .receipt-employee-job {
            color: #64748b;
            margin-bottom: 5px;
        }
        
        .receipt-date {
            text-align: left;
        }
        
        .receipt-details {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 20px;
        }
        
        .receipt-details table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .receipt-details th,
        .receipt-details td {
            padding: 12px 15px;
            text-align: right;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .receipt-details th {
            background-color: #f8fafc;
            font-weight: 600;
        }
        
        .receipt-details tr:last-child td {
            border-bottom: none;
        }
        
        .receipt-total {
            text-align: center;
            margin-top: 20px;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .receipt-total-label {
            font-size: 1.1rem;
            margin-bottom: 5px;
        }
        
        .receipt-total-amount {
            font-size: 1.5rem;
            font-weight: 700;
            color: #3b82f6;
        }
        
        .receipt-total-text {
            margin-top: 10px;
            font-size: 0.9rem;
            color: #64748b;
        }
        
        .receipt-footer {
            margin-top: 30px;
            text-align: center;
            color: #64748b;
            font-size: 0.9rem;
        }
        
        .receipt-signature {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
        
        .signature-box {
            flex: 1;
            max-width: 200px;
            border-top: 1px solid #94a3b8;
            padding-top: 10px;
            text-align: center;
        }
        
        /* ===== أنماط معاينة الاستيراد ===== */
        .import-preview {
            margin-top: 20px;
        }
        
        .import-preview h4 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #334155;
        }
        
        /* ===== أنماط عناصر الجدول ===== */
        .employee-item {
            display: flex;
            align-items: center;
        }
        
        .employee-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: #3b82f6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            margin-left: 10px;
        }
        
        .employee-data {
            display: flex;
            flex-direction: column;
        }
        
        .employee-name {
            font-weight: 500;
        }
        
        .employee-phone {
            font-size: 0.85rem;
            color: #64748b;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .badge-success {
            background-color: rgba(16, 185, 129, 0.1);
            color: #10b981;
        }
        
        .badge-danger {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }
        
        .badge-warning {
            background-color: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
        }
        
        .badge-info {
            background-color: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
        }
        
        .badge-secondary {
            background-color: rgba(107, 114, 128, 0.1);
            color: #6b7280;
        }
        
        .employee-actions, .action-buttons {
            display: flex;
            gap: 5px;
        }
        
        .action-btn {
            width: 32px;
            height: 32px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: none;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .action-btn:hover {
            background-color: #f1f5f9;
        }
        
        .action-btn.view {
            color: #3b82f6;
        }
        
        .action-btn.edit {
            color: #10b981;
        }
        
        .action-btn.delete {
            color: #ef4444;
        }
        
        .action-btn.print {
            color: #6366f1;
        }
        
        /* ===== أنماط checkboxes ===== */
        .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .checkbox-container {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }
        
        .checkbox-text {
            font-size: 0.9rem;
        }
        
        /* ===== أنماط الرسائل ===== */
        .empty-state {
            text-align: center;
            padding: 30px;
            color: #64748b;
        }
        
        .empty-state i {
            font-size: 3rem;
            margin-bottom: 15px;
            color: #cbd5e1;
        }
        
        .empty-state h3 {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #334155;
        }
        
        .empty-state p {
            margin-bottom: 20px;
        }
        
        /* ===== أنماط الطباعة ===== */
        @media print {
            body * {
                visibility: hidden;
            }
            
            .printable-area,
            .printable-area * {
                visibility: visible;
            }
            
            .printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
            
            .no-print {
                display: none !important;
            }
        }
        
        /* ===== الرسوم المتحركة ===== */
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    `;
    
    // إضافة الأنماط إلى الصفحة
    document.head.appendChild(styleElement);
}

/**
 * تهيئة مستمعي الأحداث
 */
function initEventListeners() {
    // مستمعي أحداث التبويبات الرئيسية
    initMainTabListeners();
    
    // مستمعي أحداث النماذج
    initFormListeners();
    
    // مستمعي أحداث النوافذ المنبثقة
    initModalListeners();
    
    // مستمعي أحداث التصفية والبحث
    initFilterListeners();
    
    // مستمعي أحداث التصدير والاستيراد
    initImportExportListeners();
    
    // مستمعي أحداث إضافة/تعديل/حذف العناصر
    initCrudListeners();
}

/**
 * تهيئة مستمعي أحداث التبويبات الرئيسية
 */
function initMainTabListeners() {
    // مستمعي أزرار تبويبات الصفحة الرئيسية
    const tabButtons = document.querySelectorAll('#employees-page .tab-btn');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع الأزرار
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // إضافة الفئة النشطة للزر الحالي
                this.classList.add('active');
                
                // تحديد معرف التبويب
                const tabId = this.getAttribute('data-tab') + '-tab';
                
                // إخفاء جميع محتويات التبويبات
                document.querySelectorAll('#employees-page .tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // إظهار محتوى التبويب المطلوب
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                    
                    // تحديث محتوى التبويب عند الانتقال إليه
                    updateTabContent(this.getAttribute('data-tab'));
                }
            });
        });
    }
    
    // مستمعي أزرار تبويبات الحضور والإجازات
    const attendanceTabButtons = document.querySelectorAll('.attendance-tab-btn');
    if (attendanceTabButtons.length > 0) {
        attendanceTabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع الأزرار
                attendanceTabButtons.forEach(btn => btn.classList.remove('active'));
                
                // إضافة الفئة النشطة للزر الحالي
                this.classList.add('active');
                
                // تحديد معرف التبويب
                const tabId = this.getAttribute('data-attendance-tab') + '-content';
                
                // إخفاء جميع محتويات التبويبات
                document.querySelectorAll('.attendance-tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // إظهار محتوى التبويب المطلوب
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                    
                    // تحديث محتوى التبويب عند الانتقال إليه
                    if (tabId === 'attendance-records-content') {
                        renderAttendanceTable();
                    } else if (tabId === 'vacation-requests-content') {
                        renderVacationRequestsTable();
                    }
                }
            });
        });
    }
}

/**
 * تحديث محتوى التبويب عند الانتقال إليه
 * @param {string} tabName - اسم التبويب
 */
function updateTabContent(tabName) {
    switch (tabName) {
        case 'employees-list':
            renderEmployeesTable();
            break;
        case 'salary-transactions':
            renderSalaryTransactionsTable();
            break;
        case 'payroll':
            renderPayrollTable();
            updatePayrollSummary();
            break;
        case 'advances-loans':
            renderAdvancesLoansTable();
            break;
        case 'attendance':
            renderAttendanceTable();
            break;
        case 'employees-reports':
            renderEmployeesReports();
            break;
    }
}

/**
 * تهيئة مستمعي أحداث النماذج
 */
function initFormListeners() {
    // مستمعي أزرار تبويبات النماذج
    initFormTabsListeners();
    
    // مستمعي أحداث تحميل الملفات
    initFileUploadListeners();
    
    // مستمعي أحداث حساب الراتب
    initSalaryCalculationListeners();
    
    // مستمعي أحداث حساب القرض
    initLoanCalculationListeners();
    
    // مستمعي أحداث حساب الإجازة
    initVacationCalculationListeners();
}

/**
 * تهيئة مستمعي أزرار تبويبات النماذج
 */
function initFormTabsListeners() {
    document.querySelectorAll('.form-tab-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة الفئة النشطة من جميع الأزرار في نفس المجموعة
            const tabButtons = this.closest('.form-tab-buttons').querySelectorAll('.form-tab-btn');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // إضافة الفئة النشطة للزر الحالي
            this.classList.add('active');
            
            // تحديد معرف التبويب
            const tabId = this.getAttribute('data-tab') + '-tab';
            
            // إخفاء جميع محتويات التبويبات في نفس المجموعة
            const tabContents = this.closest('.form-tabs').querySelectorAll('.form-tab-content');
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // إظهار محتوى التبويب المطلوب
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
}

/**
 * تهيئة مستمعي أحداث تحميل الملفات
 */
function initFileUploadListeners() {
    // أزرار تحميل الملفات في نموذج الموظف
    setupFileUpload('id-card-upload-btn', 'id-card-upload', 'id-card-preview');
    setupFileUpload('employee-photo-upload-btn', 'employee-photo-upload', 'employee-photo-preview');
    setupFileUpload('certificate-upload-btn', 'certificate-upload', 'certificate-preview');
    setupFileUpload('contract-upload-btn', 'contract-upload', 'contract-preview');
    
    // زر تحميل مرفق الإجازة
    setupFileUpload('vacation-attachment-btn', 'vacation-attachment', 'vacation-attachment-preview');
    
    // زر تحميل ملف الاستيراد
    setupFileUpload('import-file-btn', 'import-file', 'import-file-preview', handleImportFileChange);
}

/**
 * إعداد تحميل الملفات
 * @param {string} buttonId - معرف زر التحميل
 * @param {string} inputId - معرف حقل الإدخال
 * @param {string} previewId - معرف عنصر المعاينة
 * @param {Function} changeCallback - دالة مستدعاة عند تغيير الملف (اختيارية)
 */
function setupFileUpload(buttonId, inputId, previewId, changeCallback) {
    const uploadBtn = document.getElementById(buttonId);
    const fileInput = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (!uploadBtn || !fileInput || !preview) return;
    
    // عند النقر على زر التحميل
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // عند تغيير الملف
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // تحديد نوع الملف
                if (file.type.startsWith('image/')) {
                    // عرض الصورة
                    preview.innerHTML = `<img src="${e.target.result}" alt="${file.name}" />`;
                } else {
                    // عرض معلومات الملف
                    const fileIcon = getFileIcon(file.type);
                    preview.innerHTML = `
                        <div class="file-info">
                            <div class="file-icon">
                                <i class="${fileIcon}"></i>
                            </div>
                            <div class="file-details">
                                <div class="file-name">${file.name}</div>
                                <div class="file-size">${formatFileSize(file.size)}</div>
                            </div>
                            <div class="file-remove" onclick="removeFile('${inputId}', '${previewId}')">
                                <i class="fas fa-times"></i>
                            </div>
                        </div>
                    `;
                }
                
                // استدعاء دالة التغيير المخصصة إذا كانت محددة
                if (typeof changeCallback === 'function') {
                    changeCallback(file, e.target.result);
                }
            };
            
            reader.readAsDataURL(file);
        }
    });
}

/**
 * إزالة ملف محدد
 * @param {string} inputId - معرف حقل الإدخال
 * @param {string} previewId - معرف عنصر المعاينة
 */
function removeFile(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input) {
        input.value = '';
    }
    
    if (preview) {
        preview.innerHTML = '';
    }
}

/**
 * تهيئة مستمعي أحداث حساب الراتب
 */
function initSalaryCalculationListeners() {
    // مستمع تغيير الموظف في نموذج صرف الراتب
    const salaryEmployeeSelect = document.getElementById('salary-employee');
    if (salaryEmployeeSelect) {
        salaryEmployeeSelect.addEventListener('change', updateEmployeeSalaryInfo);
    }
    
    // مستمعي حقول حساب الراتب
    const salaryFields = ['salary-sales', 'salary-bonus', 'salary-deductions'];
    salaryFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', calculateTotalSalary);
        }
    });
}

/**
 * تهيئة مستمعي أحداث حساب القرض
 */
function initLoanCalculationListeners() {
    // مستمعي حقول حساب القرض
    const loanFields = ['loan-amount', 'loan-installments', 'loan-interest-rate'];
    loanFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', calculateLoanDetails);
        }
    });
    
    // مستمع تغيير طريقة السداد في نموذج السلفة
    const repaymentMethodSelect = document.getElementById('advance-repayment-method');
    if (repaymentMethodSelect) {
        repaymentMethodSelect.addEventListener('change', function() {
            const installmentsGroup = document.querySelector('.installments-group');
            if (installmentsGroup) {
                installmentsGroup.style.display = this.value === 'installments' ? 'block' : 'none';
            }
        });
    }
}

/**
 * تهيئة مستمعي أحداث حساب الإجازة
 */
function initVacationCalculationListeners() {
    // مستمعي حقول حساب مدة الإجازة
    const startDateField = document.getElementById('vacation-start-date');
    const endDateField = document.getElementById('vacation-end-date');
    
    if (startDateField && endDateField) {
        [startDateField, endDateField].forEach(field => {
            field.addEventListener('change', calculateVacationDays);
        });
    }
}

/**
 * تهيئة مستمعي أحداث النوافذ المنبثقة
 */
function initModalListeners() {
    // مستمعي أحداث فتح/إغلاق النوافذ
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // مستمعي أزرار فتح النوافذ
    document.getElementById('add-employee-btn')?.addEventListener('click', () => openAddEmployeeModal());
    document.getElementById('pay-salary-btn')?.addEventListener('click', () => openPaySalaryModal());
    document.getElementById('add-advance-btn')?.addEventListener('click', () => openAddAdvanceModal());
    document.getElementById('add-loan-btn')?.addEventListener('click', () => openAddLoanModal());
    document.getElementById('record-attendance-btn')?.addEventListener('click', () => openAttendanceModal());
    document.getElementById('add-vacation-btn')?.addEventListener('click', () => openVacationModal());
    document.getElementById('import-employees-btn')?.addEventListener('click', () => openImportModal());
    
    // مستمعي أزرار حفظ البيانات
    document.getElementById('save-employee-btn')?.addEventListener('click', saveEmployee);
    document.getElementById('confirm-pay-salary-btn')?.addEventListener('click', paySalary);
    document.getElementById('save-advance-btn')?.addEventListener('click', saveAdvance);
    document.getElementById('save-loan-btn')?.addEventListener('click', saveLoan);
    document.getElementById('save-attendance-btn')?.addEventListener('click', saveAttendance);
    document.getElementById('save-vacation-btn')?.addEventListener('click', saveVacation);
    document.getElementById('confirm-import-btn')?.addEventListener('click', importData);
}

/**
 * تهيئة مستمعي أحداث التصفية والبحث
 */
function initFilterListeners() {
    // مستمع البحث عن الموظفين
    const searchInput = document.getElementById('employees-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderEmployeesTable(this.value);
        });
    }
    
    // مستمعي تصفية الموظفين حسب الحالة
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع أزرار التصفية
            document.querySelectorAll('[data-filter]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // إضافة الفئة النشطة للزر الحالي
            this.classList.add('active');
            
            // تحديث الجدول مع تطبيق التصفية
            renderEmployeesTable(searchInput?.value || '', this.getAttribute('data-filter'));
        });
    });
    
    // مستمعي تصفية سجل الرواتب
    const salaryMonthFilter = document.getElementById('salary-month-filter');
    const salaryYearFilter = document.getElementById('salary-year-filter');
    
    if (salaryMonthFilter && salaryYearFilter) {
        [salaryMonthFilter, salaryYearFilter].forEach(filter => {
            filter.addEventListener('change', function() {
                renderSalaryTransactionsTable();
            });
        });
    }
    
    // مستمعي تصفية المستحقات الشهرية
    const payrollMonthFilter = document.getElementById('payroll-month-filter');
    const payrollYearFilter = document.getElementById('payroll-year-filter');
    
    if (payrollMonthFilter && payrollYearFilter) {
        [payrollMonthFilter, payrollYearFilter].forEach(filter => {
            filter.addEventListener('change', function() {
                renderPayrollTable();
                updatePayrollSummary();
            });
        });
    }
    
    // مستمعي تصفية سجل الحضور
    const attendanceDateFilter = document.getElementById('attendance-date-filter');
    if (attendanceDateFilter) {
        attendanceDateFilter.addEventListener('change', function() {
            renderAttendanceTable();
        });
    }
    
    // مستمعي تصفية السلف والقروض
    document.querySelectorAll('[data-advances-view]').forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع أزرار التصفية
            document.querySelectorAll('[data-advances-view]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // إضافة الفئة النشطة للزر الحالي
            this.classList.add('active');
            
            // تحديث الجدول مع تطبيق التصفية
            renderAdvancesLoansTable(this.getAttribute('data-advances-view'));
        });
    });
    
    // مستمعي تصفية التقارير
    const reportMonthFilter = document.getElementById('report-month-filter');
    const reportYearFilter = document.getElementById('report-year-filter');
    
    if (reportMonthFilter && reportYearFilter) {
        [reportMonthFilter, reportYearFilter].forEach(filter => {
            filter.addEventListener('change', function() {
                renderEmployeesReports();
            });
        });
    }
    
    // مستمعي تصفية فترة التقارير
    document.querySelectorAll('[data-report-period]').forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع أزرار التصفية
            document.querySelectorAll('[data-report-period]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // إضافة الفئة النشطة للزر الحالي
            this.classList.add('active');
            
            // تحديث التقارير مع تطبيق فترة التقرير
            renderEmployeesReports();
        });
    });
}

/**
 * تهيئة مستمعي أحداث التصدير والاستيراد
 */
function initImportExportListeners() {
    // مستمعي تصدير بيانات الموظفين
    document.getElementById('export-employees-excel')?.addEventListener('click', () => exportEmployees('excel'));
    document.getElementById('export-employees-csv')?.addEventListener('click', () => exportEmployees('csv'));
    document.getElementById('export-employees-pdf')?.addEventListener('click', () => exportEmployees('pdf'));
    document.getElementById('print-employees-list')?.addEventListener('click', printEmployeesList);
    
    // مستمعي تصدير سجلات الرواتب
    document.getElementById('export-salaries-excel')?.addEventListener('click', () => exportSalaries('excel'));
    document.getElementById('export-salaries-csv')?.addEventListener('click', () => exportSalaries('csv'));
    document.getElementById('export-salaries-pdf')?.addEventListener('click', () => exportSalaries('pdf'));
    document.getElementById('print-salaries-list')?.addEventListener('click', printSalariesList);
    
    // مستمع طباعة المستحقات الشهرية
    document.getElementById('print-payroll-btn')?.addEventListener('click', printPayroll);
    
    // مستمع طباعة تفاصيل الراتب
    document.getElementById('print-salary-details-btn')?.addEventListener('click', printSalaryDetails);
    document.getElementById('export-salary-pdf-btn')?.addEventListener('click', exportSalaryDetailsPdf);
    
    // مستمع طباعة تفاصيل الموظف
    document.getElementById('print-employee-btn')?.addEventListener('click', printEmployeeDetails);
    
    // مستمع إنشاء تقرير شامل
    document.getElementById('generate-report-btn')?.addEventListener('click', generateComprehensiveReport);
}
/**
 * تهيئة مستمعي أحداث إضافة/تعديل/حذف العناصر
 */
function initCrudListeners() {
    // يتم إضافة مستمعات الأحداث للأزرار ديناميكياً عند عرض الجداول
    
    // مستمع زر معالجة جميع الرواتب
    document.getElementById('process-all-payroll-btn')?.addEventListener('click', processAllPayroll);
    
    // مستمع حدث النقر العام لمعالجة إجراءات الجداول
    document.addEventListener('click', function(e) {
        // أزرار عرض تفاصيل الموظف
        if (e.target.closest('.view-employee')) {
            const button = e.target.closest('.view-employee');
            const employeeId = button.getAttribute('data-id');
            showEmployeeDetails(employeeId);
        }
        
        // أزرار تعديل الموظف
        else if (e.target.closest('.edit-employee')) {
            const button = e.target.closest('.edit-employee');
            const employeeId = button.getAttribute('data-id');
            openEditEmployeeModal(employeeId);
        }
        
        // أزرار حذف الموظف
        else if (e.target.closest('.delete-employee')) {
            const button = e.target.closest('.delete-employee');
            const employeeId = button.getAttribute('data-id');
            confirmDeleteEmployee(employeeId);
        }
        
        // أزرار عرض تفاصيل الراتب
        else if (e.target.closest('.view-salary')) {
            const button = e.target.closest('.view-salary');
            const salaryId = button.getAttribute('data-id');
            showSalaryDetails(salaryId);
        }
        
        // أزرار صرف راتب موظف معين
        else if (e.target.closest('.pay-employee-salary')) {
            const button = e.target.closest('.pay-employee-salary');
            const employeeId = button.getAttribute('data-id');
            openPaySalaryModal(employeeId);
        }
        
        // أزرار سداد قسط
        else if (e.target.closest('.pay-installment')) {
            const button = e.target.closest('.pay-installment');
            const loanId = button.getAttribute('data-id');
            openPayInstallmentModal(loanId);
        }
        
        // أزرار عرض تفاصيل القرض/السلفة
        else if (e.target.closest('.view-loan')) {
            const button = e.target.closest('.view-loan');
            const loanId = button.getAttribute('data-id');
            showLoanDetails(loanId);
        }
        
        // أزرار تعديل الحضور
        else if (e.target.closest('.edit-attendance')) {
            const button = e.target.closest('.edit-attendance');
            const attendanceId = button.getAttribute('data-id');
            openEditAttendanceModal(attendanceId);
        }
        
        // أزرار قبول طلب الإجازة
        else if (e.target.closest('.approve-vacation')) {
            const button = e.target.closest('.approve-vacation');
            const vacationId = button.getAttribute('data-id');
            updateVacationStatus(vacationId, 'approved');
        }
        
        // أزرار رفض طلب الإجازة
        else if (e.target.closest('.reject-vacation')) {
            const button = e.target.closest('.reject-vacation');
            const vacationId = button.getAttribute('data-id');
            updateVacationStatus(vacationId, 'rejected');
        }
    });
}

// ===== وظائف النوافذ المنبثقة =====

/**
 * فتح نافذة منبثقة
 * @param {string} modalId - معرف النافذة
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
    
    // إجراءات خاصة حسب نوع النافذة
    switch (modalId) {
        case 'add-employee-modal':
            resetEmployeeForm();
            break;
        case 'pay-salary-modal':
            resetSalaryForm();
            populateEmployeeSelect();
            setCurrentDate('salary-date');
            setCurrentMonth('salary-month', 'salary-year');
            break;
        case 'add-advance-modal':
            resetAdvanceForm();
            populateEmployeeSelect('advance-employee');
            setCurrentDate('advance-date');
            break;
        case 'add-loan-modal':
            resetLoanForm();
            populateEmployeeSelect('loan-employee');
            setCurrentDate('loan-date');
            break;
        case 'attendance-modal':
            resetAttendanceForm();
            populateEmployeeSelect('attendance-employee');
            setCurrentDate('attendance-date');
            setCurrentTime('attendance-time-in');
            break;
        case 'vacation-modal':
            resetVacationForm();
            populateEmployeeSelect('vacation-employee');
            break;
        case 'import-data-modal':
            resetImportForm();
            break;
    }
}

/**
 * إغلاق نافذة منبثقة
 * @param {string} modalId - معرف النافذة
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
}

/**
 * فتح نافذة إضافة موظف جديد
 */
function openAddEmployeeModal() {
    // تعيين عنوان النافذة
    document.querySelector('#add-employee-modal .modal-title').textContent = 'إضافة موظف جديد';
    
    // تغيير نص زر الحفظ
    const saveButton = document.getElementById('save-employee-btn');
    if (saveButton) {
        saveButton.textContent = 'إضافة';
    }
    
    // تعبئة قائمة المدراء بالموظفين
    populateManagerSelect();
    
    // فتح النافذة
    openModal('add-employee-modal');
}

/**
 * فتح نافذة تعديل موظف
 * @param {string} employeeId - معرف الموظف
 */
function openEditEmployeeModal(employeeId) {
    // تعيين عنوان النافذة
    document.querySelector('#add-employee-modal .modal-title').textContent = 'تعديل بيانات الموظف';
    
    // تغيير نص زر الحفظ
    const saveButton = document.getElementById('save-employee-btn');
    if (saveButton) {
        saveButton.textContent = 'حفظ التعديلات';
    }
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showToast('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // تعبئة قائمة المدراء بالموظفين
    populateManagerSelect(employeeId);
    
    // تعبئة النموذج ببيانات الموظف
    fillEmployeeForm(employee);
    
    // فتح النافذة
    openModal('add-employee-modal');
}

/**
 * فتح نافذة صرف راتب
 * @param {string} employeeId - معرف الموظف (اختياري)
 */
function openPaySalaryModal(employeeId = null) {
    // تعبئة قائمة الموظفين
    populateEmployeeSelect();
    
    // إذا تم تحديد موظف معين
    if (employeeId) {
        const employeeSelect = document.getElementById('salary-employee');
        if (employeeSelect) {
            employeeSelect.value = employeeId;
            // تحديث معلومات الموظف
            updateEmployeeSalaryInfo();
        }
    }
    
    // فتح النافذة
    openModal('pay-salary-modal');
}

/**
 * فتح نافذة إضافة سلفة
 */
function openAddAdvanceModal() {
    // تعبئة قائمة الموظفين
    populateEmployeeSelect('advance-employee');
    
    // فتح النافذة
    openModal('add-advance-modal');
}

/**
 * فتح نافذة إضافة قرض
 */
function openAddLoanModal() {
    // تعبئة قائمة الموظفين
    populateEmployeeSelect('loan-employee');
    
    // فتح النافذة
    openModal('add-loan-modal');
}

/**
 * فتح نافذة تسجيل حضور
 */
function openAttendanceModal() {
    // تعبئة قائمة الموظفين
    populateEmployeeSelect('attendance-employee');
    
    // فتح النافذة
    openModal('attendance-modal');
}

/**
 * فتح نافذة طلب إجازة
 */
function openVacationModal() {
    // تعبئة قائمة الموظفين
    populateEmployeeSelect('vacation-employee');
    
    // فتح النافذة
    openModal('vacation-modal');
}

/**
 * فتح نافذة استيراد البيانات
 */
function openImportModal() {
    // فتح النافذة
    openModal('import-data-modal');
}

/**
 * فتح نافذة سداد قسط
 * @param {string} loanId - معرف القرض/السلفة
 */
function openPayInstallmentModal(loanId) {
    // تنفيذ سداد القسط مباشرة بعد التأكيد
    confirmPayInstallment(loanId);
}

// ===== وظائف النماذج =====

/**
 * إعادة تعيين نموذج الموظف
 */
function resetEmployeeForm() {
    const form = document.getElementById('employee-form');
    if (form) {
        form.reset();
    }
    
    // إعادة تعيين معرف الموظف
    document.getElementById('employee-id').value = '';
    
    // تعيين تاريخ التعيين للتاريخ الحالي
    setCurrentDate('employee-hire-date');
    
    // إعادة تعيين معاينات الملفات
    document.getElementById('id-card-preview').innerHTML = '';
    document.getElementById('employee-photo-preview').innerHTML = '';
    document.getElementById('certificate-preview').innerHTML = '';
    document.getElementById('contract-preview').innerHTML = '';
    
    // تحديد التبويب الأول
    document.querySelector('.form-tab-btn[data-tab="personal-info"]').click();
}

/**
 * تعبئة نموذج الموظف ببيانات موظف معين
 * @param {Object} employee - بيانات الموظف
 */
function fillEmployeeForm(employee) {
    // تعيين معرف الموظف
    document.getElementById('employee-id').value = employee.id;
    
    // المعلومات الشخصية
    document.getElementById('employee-name').value = employee.name || '';
    document.getElementById('employee-phone').value = employee.phone || '';
    document.getElementById('employee-alt-phone').value = employee.altPhone || '';
    document.getElementById('employee-email').value = employee.email || '';
    document.getElementById('employee-address').value = employee.address || '';
    document.getElementById('employee-birthdate').value = employee.birthdate || '';
    document.getElementById('employee-gender').value = employee.gender || 'male';
    document.getElementById('employee-marital-status').value = employee.maritalStatus || 'single';
    
    // المعلومات الوظيفية
    document.getElementById('employee-job-title').value = employee.jobTitle || '';
    document.getElementById('employee-department').value = employee.department || '';
    document.getElementById('employee-manager').value = employee.managerId || '';
    document.getElementById('employee-hire-date').value = employee.hireDate || '';
    document.getElementById('employee-contract-end').value = employee.contractEnd || '';
    document.getElementById('employee-contract-type').value = employee.contractType || 'full-time';
    document.getElementById('employee-work-hours').value = employee.workHours || '8';
    document.getElementById('employee-status').value = employee.status || 'active';
    
    // المعلومات المالية
    document.getElementById('employee-basic-salary').value = employee.basicSalary || '';
    document.getElementById('employee-housing-allowance').value = employee.housingAllowance || '0';
    document.getElementById('employee-transportation-allowance').value = employee.transportationAllowance || '0';
    document.getElementById('employee-other-allowances').value = employee.otherAllowances || '0';
    document.getElementById('employee-commission-rate').value = employee.commissionRate || '0';
    document.getElementById('employee-payment-method').value = employee.paymentMethod || 'bank';
    document.getElementById('employee-bank-name').value = employee.bankName || '';
    document.getElementById('employee-bank-account').value = employee.bankAccount || '';
    document.getElementById('employee-financial-notes').value = employee.financialNotes || '';
    
    // المستندات
    document.getElementById('employee-id-number').value = employee.idNumber || '';
    document.getElementById('employee-id-expiry').value = employee.idExpiry || '';
    document.getElementById('employee-notes').value = employee.notes || '';
    
    // عرض المستندات إذا كانت موجودة
    if (employee.documents) {
        if (employee.documents.idCard) {
            document.getElementById('id-card-preview').innerHTML = `<img src="${employee.documents.idCard}" alt="بطاقة هوية" />`;
        }
        
        if (employee.documents.photo) {
            document.getElementById('employee-photo-preview').innerHTML = `<img src="${employee.documents.photo}" alt="صورة شخصية" />`;
        }
        
        if (employee.documents.certificate) {
            displayDocumentPreview('certificate-preview', employee.documents.certificate, 'شهادة');
        }
        
        if (employee.documents.contract) {
            displayDocumentPreview('contract-preview', employee.documents.contract, 'عقد');
        }
    }
}

/**
 * عرض معاينة مستند
 * @param {string} previewId - معرف عنصر المعاينة
 * @param {string} documentData - بيانات المستند
 * @param {string} documentName - اسم المستند
 */
function displayDocumentPreview(previewId, documentData, documentName) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    if (documentData.startsWith('data:image')) {
        preview.innerHTML = `<img src="${documentData}" alt="${documentName}" />`;
    } else {
        // افتراض أنه ملف PDF أو نوع آخر
        const fileIcon = documentData.includes('pdf') ? 'fas fa-file-pdf' : 'fas fa-file';
        preview.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="${fileIcon}"></i>
                </div>
                <div class="file-details">
                    <div class="file-name">${documentName}</div>
                </div>
            </div>
        `;
    }
}

/**
 * إعادة تعيين نموذج الراتب
 */
function resetSalaryForm() {
    const form = document.getElementById('pay-salary-form');
    if (form) {
        form.reset();
    }
    
    // إخفاء معلومات الموظف
    document.getElementById('employee-salary-info').style.display = 'none';
    
    // إعادة تعيين حقول الراتب المحسوبة
    document.getElementById('salary-total').textContent = '0 دينار';
    document.getElementById('salary-calculation').textContent = '';
    
    // إعادة تعيين قائمة القروض النشطة
    document.getElementById('employee-active-loans').innerHTML = '';
}

/**
 * إعادة تعيين نموذج السلفة
 */
function resetAdvanceForm() {
    const form = document.getElementById('advance-form');
    if (form) {
        form.reset();
    }
    
    // إخفاء حقل الأقساط
    document.querySelector('.installments-group').style.display = 'none';
}

/**
 * إعادة تعيين نموذج القرض
 */
function resetLoanForm() {
    const form = document.getElementById('loan-form');
    if (form) {
        form.reset();
    }
    
    // إعادة تعيين ملخص القرض
    document.getElementById('loan-summary').innerHTML = '';
}

/**
 * إعادة تعيين نموذج الحضور
 */
function resetAttendanceForm() {
    const form = document.getElementById('attendance-form');
    if (form) {
        form.reset();
    }
}

/**
 * إعادة تعيين نموذج الإجازة
 */
function resetVacationForm() {
    const form = document.getElementById('vacation-form');
    if (form) {
        form.reset();
    }
    
    // إعادة تعيين معاينة المرفق
    document.getElementById('vacation-attachment-preview').innerHTML = '';
}

/**
 * إعادة تعيين نموذج الاستيراد
 */
function resetImportForm() {
    const form = document.getElementById('import-form');
    if (form) {
        form.reset();
    }
    
    // إعادة تعيين معاينة الملف
    document.getElementById('import-file-preview').innerHTML = '';
    
    // إعادة تعيين معاينة البيانات
    document.getElementById('import-preview-data').innerHTML = '<p class="text-muted">قم بتحميل ملف لعرض معاينة البيانات</p>';
}

// ===== وظائف الجداول =====

/**
 * عرض جدول الموظفين
 * @param {string} searchTerm - مصطلح البحث (اختياري)
 * @param {string} filter - التصفية حسب الحالة (اختياري)
 */
function renderEmployeesTable(searchTerm = '', filter = 'all') {
    const tableBody = document.querySelector('#employees-table tbody');
    if (!tableBody) return;
    
    // تفريغ الجدول
    tableBody.innerHTML = '';
    
    // تصفية الموظفين
    let filteredEmployees = [...employees];
    
    // تطبيق التصفية حسب الحالة
    if (filter !== 'all') {
        filteredEmployees = filteredEmployees.filter(emp => emp.status === filter);
    }
    
    // تطبيق البحث
    if (searchTerm.trim() !== '') {
        const searchTermLower = searchTerm.trim().toLowerCase();
        filteredEmployees = filteredEmployees.filter(emp => 
            emp.name.toLowerCase().includes(searchTermLower) ||
            emp.phone.includes(searchTermLower) ||
            emp.jobTitle.toLowerCase().includes(searchTermLower) ||
            (emp.email && emp.email.toLowerCase().includes(searchTermLower))
        );
    }
    
    // ترتيب الموظفين (الأحدث أولاً)
    filteredEmployees.sort((a, b) => new Date(b.hireDate || 0) - new Date(a.hireDate || 0));
    
    // إذا لم تكن هناك نتائج
    if (filteredEmployees.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="empty-state">
                        <i class="fas fa-users-slash"></i>
                        <h3>لا يوجد موظفين</h3>
                        <p>لم يتم العثور على موظفين مطابقين للبحث أو التصفية</p>
                        <button class="btn btn-primary" id="add-employee-now-btn">
                            <i class="fas fa-plus"></i>
                            <span>إضافة موظف جديد</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        // إضافة مستمع حدث لزر الإضافة
        document.getElementById('add-employee-now-btn')?.addEventListener('click', openAddEmployeeModal);
        
        return;
    }
    
    // إضافة الموظفين إلى الجدول
    filteredEmployees.forEach((employee, index) => {
        const row = document.createElement('tr');
        
        // تحديد فئة الحالة
        const statusClass = getStatusClass(employee.status);
        const statusText = getStatusText(employee.status);
        
        // تحديد اسم القسم العربي
        const departmentName = getArabicDepartmentName(employee.department);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="employee-item">
                    <div class="employee-avatar">${employee.name.charAt(0)}</div>
                    <div class="employee-data">
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-phone">${employee.phone}</div>
                    </div>
                </div>
            </td>
            <td>${employee.jobTitle}</td>
            <td>${departmentName}</td>
            <td>${employee.phone}</td>
            <td>${formatDate(employee.hireDate)}</td>
            <td>${formatCurrency(employee.basicSalary || 0)}</td>
            <td><span class="badge badge-${statusClass}">${statusText}</span></td>
            <td>
                <div class="employee-actions">
                    <button class="action-btn view view-employee" data-id="${employee.id}" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit edit-employee" data-id="${employee.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete delete-employee" data-id="${employee.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * عرض جدول معاملات الرواتب
 */
function renderSalaryTransactionsTable() {
    const tableBody = document.querySelector('#salary-transactions-table tbody');
    if (!tableBody) return;
    
    // تفريغ الجدول
    tableBody.innerHTML = '';
    
    // الحصول على قيم التصفية
    const monthFilter = document.getElementById('salary-month-filter').value;
    const yearFilter = document.getElementById('salary-year-filter').value;
    
    // تصفية المعاملات
    let filteredTransactions = [...salaryTransactions];
    
    // تطبيق تصفية الشهر
    if (monthFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(tx => tx.month === monthFilter);
    }
    
    // تطبيق تصفية السنة
    if (yearFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(tx => tx.year === yearFilter);
    }
    
    // ترتيب المعاملات (الأحدث أولاً)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // إذا لم تكن هناك نتائج
    if (filteredTransactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="11">
                    <div class="empty-state">
                        <i class="fas fa-money-bill-wave"></i>
                        <h3>لا توجد معاملات رواتب</h3>
                        <p>لم يتم العثور على معاملات رواتب مطابقة للتصفية</p>
                        <button class="btn btn-success" id="pay-salary-now-btn">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>صرف راتب</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        // إضافة مستمع حدث لزر صرف الراتب
        document.getElementById('pay-salary-now-btn')?.addEventListener('click', openPaySalaryModal);
        
        return;
    }
    
    // إضافة المعاملات إلى الجدول
    filteredTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${transaction.employeeName}</td>
            <td>${getArabicMonthName(transaction.month)}</td>
            <td>${formatDate(transaction.date)}</td>
            <td>${formatCurrency(transaction.basicSalary || 0)}</td>
            <td>${formatCurrency(transaction.sales || 0)}</td>
            <td>${formatCurrency(transaction.commissionAmount || 0)}</td>
            <td>${formatCurrency(transaction.allowances || 0)}</td>
            <td>${formatCurrency(transaction.deductions || 0)}</td>
            <td>${formatCurrency(transaction.totalSalary || 0)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view view-salary" data-id="${transaction.id}" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn print" data-id="${transaction.id}" title="طباعة">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * عرض جدول المستحقات الشهرية
 */
function renderPayrollTable() {
    const tableBody = document.querySelector('#payroll-table tbody');
    if (!tableBody) return;
    
    // تفريغ الجدول
    tableBody.innerHTML = '';
    
    // الحصول على الشهر والسنة المحددين
    const selectedMonth = document.getElementById('payroll-month-filter').value;
    const selectedYear = document.getElementById('payroll-year-filter').value;
    
    // التحقق من وجود موظفين نشطين
    const activeEmployees = employees.filter(emp => emp.status === 'active');
    
    // إذا لم يكن هناك موظفين نشطين
    if (activeEmployees.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="11">
                    <div class="empty-state">
                        <i class="fas fa-user-slash"></i>
                        <h3>لا يوجد موظفين نشطين</h3>
                        <p>قم بإضافة موظفين نشطين أولاً لعرض المستحقات الشهرية</p>
                        <button class="btn btn-primary" id="add-employee-payroll-btn">
                            <i class="fas fa-plus"></i>
                            <span>إضافة موظف جديد</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        // إضافة مستمع حدث لزر الإضافة
        document.getElementById('add-employee-payroll-btn')?.addEventListener('click', openAddEmployeeModal);
        
        return;
    }
    
    // البحث عن المعاملات المدفوعة بالفعل في هذا الشهر
    const paidTransactions = salaryTransactions.filter(
        tx => tx.month === selectedMonth && tx.year === selectedYear
    );
    
    // إضافة الموظفين إلى الجدول
    activeEmployees.forEach((employee, index) => {
        const row = document.createElement('tr');
        
        // التحقق مما إذا كان الراتب مدفوعاً بالفعل
        const isPaid = paidTransactions.some(tx => tx.employeeId === employee.id);
        
        // حساب المستحقات المتوقعة للموظف
        const expectedSalary = calculateExpectedSalary(employee, selectedMonth, selectedYear);
        // حالة المستحقات
        const statusClass = isPaid ? 'success' : 'warning';
        const statusText = isPaid ? 'تم الصرف' : 'مستحق';
        
        // تحديد الإجراءات المتاحة
        const actions = isPaid ? `
            <button class="action-btn view view-salary" data-id="${paidTransactions.find(tx => tx.employeeId === employee.id)?.id}" title="عرض التفاصيل">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn print" data-id="${paidTransactions.find(tx => tx.employeeId === employee.id)?.id}" title="طباعة">
                <i class="fas fa-print"></i>
            </button>
        ` : `
            <button class="action-btn pay-employee-salary" data-id="${employee.id}" title="صرف الراتب">
                <i class="fas fa-money-bill-wave"></i>
            </button>
        `;
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="employee-item">
                    <div class="employee-avatar">${employee.name.charAt(0)}</div>
                    <div class="employee-data">
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-phone">${employee.phone}</div>
                    </div>
                </div>
            </td>
            <td>${employee.jobTitle}</td>
            <td>${formatCurrency(employee.basicSalary || 0)}</td>
            <td>${formatCurrency(expectedSalary.expectedCommission || 0)}</td>
            <td>${formatCurrency(expectedSalary.allowances || 0)}</td>
            <td>${formatCurrency(expectedSalary.deductions || 0)}</td>
            <td>${formatCurrency(expectedSalary.loans || 0)}</td>
            <td>${formatCurrency(expectedSalary.netSalary || 0)}</td>
            <td><span class="badge badge-${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    ${actions}
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * تحديث ملخص المستحقات الشهرية
 */
function updatePayrollSummary() {
    // الحصول على الشهر والسنة المحددين
    const selectedMonth = document.getElementById('payroll-month-filter').value;
    const selectedYear = document.getElementById('payroll-year-filter').value;
    
    // الموظفين النشطين
    const activeEmployees = employees.filter(emp => emp.status === 'active');
    
    // المعاملات المدفوعة في هذا الشهر
    const paidTransactions = salaryTransactions.filter(
        tx => tx.month === selectedMonth && tx.year === selectedYear
    );
    
    // حساب إجمالي الرواتب المستحقة
    let totalSalaries = 0;
    let paidSalaries = 0;
    
    activeEmployees.forEach(employee => {
        const expectedSalary = calculateExpectedSalary(employee, selectedMonth, selectedYear);
        totalSalaries += expectedSalary.netSalary;
        
        // التحقق مما إذا كان الراتب مدفوعاً
        const isPaid = paidTransactions.some(tx => tx.employeeId === employee.id);
        if (isPaid) {
            const paidTransaction = paidTransactions.find(tx => tx.employeeId === employee.id);
            paidSalaries += paidTransaction.totalSalary;
        }
    });
    
    // تحديث عناصر الملخص
    document.getElementById('payroll-total').textContent = formatCurrency(totalSalaries);
    document.getElementById('payroll-paid').textContent = formatCurrency(paidSalaries);
    document.getElementById('payroll-remaining').textContent = formatCurrency(totalSalaries - paidSalaries);
}

/**
 * حساب الراتب المتوقع للموظف
 * @param {Object} employee - بيانات الموظف
 * @param {string} month - الشهر
 * @param {string} year - السنة
 * @returns {Object} - بيانات الراتب المتوقع
 */
function calculateExpectedSalary(employee, month, year) {
    // الراتب الأساسي
    const basicSalary = employee.basicSalary || 0;
    
    // البدلات
    const allowances = (employee.housingAllowance || 0) +
                      (employee.transportationAllowance || 0) +
                      (employee.otherAllowances || 0);
    
    // تقدير العمولة بناءً على متوسط العمولات السابقة
    const employeeTransactions = salaryTransactions.filter(tx => tx.employeeId === employee.id);
    let expectedCommission = 0;
    
    if (employeeTransactions.length > 0) {
        // حساب متوسط العمولات للأشهر الثلاثة الأخيرة
        const recentTransactions = employeeTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
        if (recentTransactions.length > 0) {
            const avgCommission = recentTransactions.reduce((sum, tx) => sum + (tx.commissionAmount || 0), 0) / recentTransactions.length;
            expectedCommission = Math.round(avgCommission);
        }
    }
    
    // الاستقطاعات الدورية
    const deductions = 0; // يمكن تطبيق استقطاعات ثابتة هنا إذا كانت موجودة
    
    // حساب الديون والسلف النشطة
    let loanDeductions = 0;
    
    // جمع أقساط القروض المستحقة
    const activeLoans = employeeLoans.filter(loan => 
        loan.employeeId === employee.id && 
        loan.status === 'active' && 
        loan.remainingAmount > 0
    );
    
    activeLoans.forEach(loan => {
        // حساب القسط الشهري
        const monthlyInstallment = loan.installmentAmount || (loan.remainingAmount / loan.remainingInstallments);
        loanDeductions += monthlyInstallment;
    });
    
    // جمع السلف المستحقة
    const activeAdvances = salaryAdvances.filter(advance => 
        advance.employeeId === employee.id && 
        advance.status === 'active' && 
        advance.remainingAmount > 0 &&
        advance.deductionDate && new Date(advance.deductionDate) <= new Date(`${year}-${month}-01`)
    );
    
    activeAdvances.forEach(advance => {
        if (advance.repaymentMethod === 'one-time') {
            loanDeductions += advance.remainingAmount;
        } else {
            // حساب القسط الشهري
            const monthlyInstallment = advance.installmentAmount || (advance.remainingAmount / advance.remainingInstallments);
            loanDeductions += monthlyInstallment;
        }
    });
    
    // حساب صافي الراتب
    const netSalary = basicSalary + allowances + expectedCommission - deductions - loanDeductions;
    
    return {
        basicSalary,
        allowances,
        expectedCommission,
        deductions,
        loans: loanDeductions,
        netSalary
    };
}

/**
 * عرض جدول السلف والقروض
 * @param {string} viewType - نوع العرض (all/advances/loans)
 */
function renderAdvancesLoansTable(viewType = 'all') {
    const tableBody = document.querySelector('#advances-table tbody');
    if (!tableBody) return;
    
    // تفريغ الجدول
    tableBody.innerHTML = '';
    
    // دمج قوائم السلف والقروض
    let allItems = [];
    
    // إضافة السلف
    if (viewType === 'all' || viewType === 'advances') {
        allItems = allItems.concat(salaryAdvances.map(advance => ({
            ...advance,
            itemType: 'advance'
        })));
    }
    
    // إضافة القروض
    if (viewType === 'all' || viewType === 'loans') {
        allItems = allItems.concat(employeeLoans.map(loan => ({
            ...loan,
            itemType: 'loan'
        })));
    }
    
    // ترتيب العناصر (الأحدث أولاً)
    allItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // إذا لم تكن هناك نتائج
    if (allItems.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10">
                    <div class="empty-state">
                        <i class="fas fa-hand-holding-usd"></i>
                        <h3>لا توجد سلف أو قروض</h3>
                        <p>لم يتم العثور على سلف أو قروض مطابقة للتصفية</p>
                        <div class="btn-group">
                            <button class="btn btn-primary" id="add-advance-now-btn">
                                <i class="fas fa-plus"></i>
                                <span>إضافة سلفة</span>
                            </button>
                            <button class="btn btn-info" id="add-loan-now-btn">
                                <i class="fas fa-plus"></i>
                                <span>إضافة قرض</span>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
        
        // إضافة مستمعي أحداث للأزرار
        document.getElementById('add-advance-now-btn')?.addEventListener('click', openAddAdvanceModal);
        document.getElementById('add-loan-now-btn')?.addEventListener('click', openAddLoanModal);
        
        return;
    }
    
    // إضافة العناصر إلى الجدول
    allItems.forEach(item => {
        const row = document.createElement('tr');
        
        // تحديد النوع
        const typeText = item.itemType === 'advance' ? 'سلفة' : 'قرض';
        const typeClass = item.itemType === 'advance' ? 'info' : 'primary';
        
        // حساب المبلغ المتبقي
        const remainingAmount = item.remainingAmount || (item.amount - (item.paidAmount || 0));
        
        // تحديد حالة السلفة/القرض
        const statusClass = getStatusClass(item.status);
        const statusText = getStatusText(item.status, 'loan');
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td><span class="badge badge-${typeClass}">${typeText}</span></td>
            <td>${getEmployeeName(item.employeeId)}</td>
            <td>${formatDate(item.date)}</td>
            <td>${formatCurrency(item.amount || 0)}</td>
            <td>${formatCurrency(item.paidAmount || 0)}</td>
            <td>${formatCurrency(remainingAmount)}</td>
            <td><span class="badge badge-${statusClass}">${statusText}</span></td>
            <td>${item.notes || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view view-loan" data-id="${item.id}" data-type="${item.itemType}" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${item.status === 'active' && remainingAmount > 0 ? `
                    <button class="action-btn pay-installment" data-id="${item.id}" data-type="${item.itemType}" title="تسجيل دفعة">
                        <i class="fas fa-money-bill"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * عرض جدول سجلات الحضور
 */
function renderAttendanceTable() {
    const tableBody = document.querySelector('#attendance-table tbody');
    if (!tableBody) return;
    
    // تفريغ الجدول
    tableBody.innerHTML = '';
    
    // الحصول على التاريخ المحدد للتصفية
    const dateFilter = document.getElementById('attendance-date-filter')?.value;
    
    // تصفية سجلات الحضور
    let filteredRecords = [...attendanceRecords];
    
    if (dateFilter) {
        filteredRecords = filteredRecords.filter(record => record.date === dateFilter);
    }
    
    // ترتيب السجلات (الأحدث أولاً)
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // إذا لم تكن هناك نتائج
    if (filteredRecords.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="empty-state">
                        <i class="fas fa-clock"></i>
                        <h3>لا يوجد سجلات حضور</h3>
                        <p>لم يتم العثور على سجلات حضور مطابقة للتصفية</p>
                        <button class="btn btn-primary" id="record-attendance-now-btn">
                            <i class="fas fa-clock"></i>
                            <span>تسجيل حضور</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        // إضافة مستمع حدث لزر تسجيل الحضور
        document.getElementById('record-attendance-now-btn')?.addEventListener('click', openAttendanceModal);
        
        return;
    }
    
    // إضافة السجلات إلى الجدول
    filteredRecords.forEach((record, index) => {
        const row = document.createElement('tr');
        
        // حساب ساعات العمل
        let workHours = '-';
        if (record.timeIn && record.timeOut) {
            workHours = calculateWorkHours(record.timeIn, record.timeOut);
        }
        
        // تحديد حالة الحضور
        const statusClass = getAttendanceStatusClass(record.status);
        const statusText = getAttendanceStatusText(record.status);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${getEmployeeName(record.employeeId)}</td>
            <td>${formatDate(record.date)}</td>
            <td>${record.timeIn || '-'}</td>
            <td>${record.timeOut || '-'}</td>
            <td>${workHours}</td>
            <td><span class="badge badge-${statusClass}">${statusText}</span></td>
            <td>${record.notes || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit edit-attendance" data-id="${record.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * عرض جدول طلبات الإجازات
 */
function renderVacationRequestsTable() {
    const tableBody = document.querySelector('#vacation-table tbody');
    if (!tableBody) return;
    
    // تفريغ الجدول
    tableBody.innerHTML = '';
    
    // ترتيب الطلبات (الأحدث أولاً)
    const sortedRequests = [...vacationRequests].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    
    // إذا لم تكن هناك نتائج
    if (sortedRequests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="empty-state">
                        <i class="fas fa-calendar-alt"></i>
                        <h3>لا يوجد طلبات إجازات</h3>
                        <p>لم يتم العثور على طلبات إجازات</p>
                        <button class="btn btn-primary" id="add-vacation-now-btn">
                            <i class="fas fa-calendar-plus"></i>
                            <span>إضافة طلب إجازة</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        // إضافة مستمع حدث لزر إضافة طلب إجازة
        document.getElementById('add-vacation-now-btn')?.addEventListener('click', openVacationModal);
        
        return;
    }
    
    // إضافة الطلبات إلى الجدول
    sortedRequests.forEach((request, index) => {
        const row = document.createElement('tr');
        
        // تحديد نوع الإجازة
        const vacationType = getVacationTypeText(request.type);
        
        // تحديد حالة الطلب
        const statusClass = getVacationStatusClass(request.status);
        const statusText = getVacationStatusText(request.status);
        
        // تحديد الإجراءات المتاحة
        let actions = '';
        if (request.status === 'pending') {
            actions = `
                <button class="action-btn approve-vacation" data-id="${request.id}" title="قبول">
                    <i class="fas fa-check"></i>
                </button>
                <button class="action-btn reject-vacation" data-id="${request.id}" title="رفض">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${getEmployeeName(request.employeeId)}</td>
            <td>${vacationType}</td>
            <td>${formatDate(request.startDate)}</td>
            <td>${formatDate(request.endDate)}</td>
            <td>${request.days} يوم</td>
            <td>${formatDate(request.requestDate)}</td>
            <td><span class="badge badge-${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    ${actions}
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * عرض تقارير الموظفين
 */
function renderEmployeesReports() {
    // الحصول على الشهر والسنة المحددين
    const selectedMonth = document.getElementById('report-month-filter').value;
    const selectedYear = document.getElementById('report-year-filter').value;
    
    // تحديد فترة التقرير
    const reportPeriod = document.querySelector('[data-report-period].active').getAttribute('data-report-period');
    
    // رسم توزيع الرواتب
    renderSalaryDistributionChart(selectedMonth, selectedYear, reportPeriod);
    
    // رسم توزيع الموظفين حسب القسم
    renderEmployeesByDepartmentChart();
    
    // رسم تطور الرواتب
    renderSalaryTrendChart(selectedYear, reportPeriod);
    
    // رسم أداء الموظفين
    renderEmployeePerformanceChart(selectedMonth, selectedYear, reportPeriod);
}

// ===== وظائف المخططات البيانية =====

/**
 * رسم مخطط توزيع الرواتب
 * @param {string} month - الشهر المحدد
 * @param {string} year - السنة المحددة
 * @param {string} period - فترة التقرير
 */
function renderSalaryDistributionChart(month, year, period) {
    const canvas = document.getElementById('salary-distribution-chart');
    if (!canvas || !window.Chart) return;
    
    // الحصول على البيانات حسب الفترة
    const chartData = getSalaryDistributionData(month, year, period);
    
    // تدمير المخطط الحالي إذا كان موجوداً
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // إنشاء المخطط الجديد
    canvas.chart = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'الراتب الأساسي',
                    data: chartData.basicSalary,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3b82f6',
                    borderWidth: 1
                },
                {
                    label: 'البدلات',
                    data: chartData.allowances,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: '#10b981',
                    borderWidth: 1
                },
                {
                    label: 'العمولات',
                    data: chartData.commissions,
                    backgroundColor: 'rgba(245, 158, 11, 0.7)',
                    borderColor: '#f59e0b',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'المبلغ (دينار)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'توزيع الرواتب والمستحقات',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

/**
 * الحصول على بيانات توزيع الرواتب للمخطط
 * @param {string} month - الشهر المحدد
 * @param {string} year - السنة المحددة
 * @param {string} period - فترة التقرير
 * @returns {Object} - بيانات المخطط
 */
function getSalaryDistributionData(month, year, period) {
    // تصفية المعاملات حسب الفترة
    const filteredTransactions = filterTransactionsByPeriod(salaryTransactions, month, year, period);
    
    // تجميع البيانات حسب الموظف
    const employeeData = {};
    
    filteredTransactions.forEach(tx => {
        if (!employeeData[tx.employeeId]) {
            employeeData[tx.employeeId] = {
                name: tx.employeeName,
                basicSalary: 0,
                allowances: 0,
                commissions: 0
            };
        }
        
        employeeData[tx.employeeId].basicSalary += tx.basicSalary || 0;
        employeeData[tx.employeeId].allowances += tx.allowances || 0;
        employeeData[tx.employeeId].commissions += tx.commissionAmount || 0;
    });
    
    // تحويل البيانات إلى تنسيق المخطط
    const labels = [];
    const basicSalary = [];
    const allowances = [];
    const commissions = [];
    
    Object.values(employeeData).forEach(data => {
        labels.push(data.name);
        basicSalary.push(data.basicSalary);
        allowances.push(data.allowances);
        commissions.push(data.commissions);
    });
    
    return {
        labels,
        basicSalary,
        allowances,
        commissions
    };
}

/**
 * رسم مخطط توزيع الموظفين حسب القسم
 */
function renderEmployeesByDepartmentChart() {
    const canvas = document.getElementById('employees-by-department-chart');
    if (!canvas || !window.Chart) return;
    
    // تجميع الموظفين حسب القسم
    const departmentCounts = {};
    
    employees.forEach(employee => {
        const department = employee.department || 'other';
        if (!departmentCounts[department]) {
            departmentCounts[department] = 0;
        }
        departmentCounts[department]++;
    });
    
    // تحويل البيانات إلى تنسيق المخطط
    const labels = [];
    const data = [];
    const backgroundColors = [
        'rgba(59, 130, 246, 0.7)',  // أزرق
        'rgba(16, 185, 129, 0.7)',  // أخضر
        'rgba(245, 158, 11, 0.7)',  // برتقالي
        'rgba(239, 68, 68, 0.7)',   // أحمر
        'rgba(139, 92, 246, 0.7)',  // بنفسجي
        'rgba(249, 115, 22, 0.7)',  // برتقالي داكن
        'rgba(20, 184, 166, 0.7)',  // فيروزي
        'rgba(99, 102, 241, 0.7)'   // أرجواني
    ];
    
    Object.entries(departmentCounts).forEach(([department, count], index) => {
        labels.push(getArabicDepartmentName(department));
        data.push(count);
    });
    
    // تدمير المخطط الحالي إذا كان موجوداً
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // إنشاء المخطط الجديد
    canvas.chart = new Chart(canvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'توزيع الموظفين حسب القسم',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1) + '%';
                            return `${label}: ${value} (${percentage})`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * رسم مخطط تطور الرواتب
 * @param {string} year - السنة المحددة
 * @param {string} period - فترة التقرير
 */
function renderSalaryTrendChart(year, period) {
    const canvas = document.getElementById('salary-trend-chart');
    if (!canvas || !window.Chart) return;
    
    // الحصول على البيانات حسب الفترة
    const chartData = getSalaryTrendData(year, period);
    
    // تدمير المخطط الحالي إذا كان موجوداً
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // إنشاء المخطط الجديد
    canvas.chart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'إجمالي الرواتب',
                data: chartData.totalSalaries,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'المبلغ (دينار)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'تطور إجمالي الرواتب',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * الحصول على بيانات تطور الرواتب للمخطط
 * @param {string} year - السنة المحددة
 * @param {string} period - فترة التقرير
 * @returns {Object} - بيانات المخطط
 */
function getSalaryTrendData(year, period) {
    let labels = [];
    let totalSalaries = [];
    
    // تحديد الفترة الزمنية
    if (period === 'monthly') {
        // الأشهر في السنة المحددة
        for (let month = 1; month <= 12; month++) {
            // تحديد الشهر كنص
            const monthName = getArabicMonthShortName(month);
            labels.push(monthName);
            
            // حساب إجمالي الرواتب للشهر
            const monthlyTotal = salaryTransactions
                .filter(tx => tx.month === month.toString() && tx.year === year)
                .reduce((sum, tx) => sum + (tx.totalSalary || 0), 0);
            
            totalSalaries.push(monthlyTotal);
        }
    } else if (period === 'quarterly') {
        // الأرباع في السنة المحددة
        for (let quarter = 1; quarter <= 4; quarter++) {
            labels.push(`الربع ${quarter}`);
            
            // تحديد أشهر الربع
            const quarterMonths = [(quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2, (quarter - 1) * 3 + 3];
            
            // حساب إجمالي الرواتب للربع
            const quarterlyTotal = salaryTransactions
                .filter(tx => quarterMonths.includes(parseInt(tx.month)) && tx.year === year)
                .reduce((sum, tx) => sum + (tx.totalSalary || 0), 0);
            
            totalSalaries.push(quarterlyTotal);
        }
    } else if (period === 'yearly') {
        // السنوات الأخيرة (5 سنوات)
        const currentYear = parseInt(year);
        for (let i = currentYear - 4; i <= currentYear; i++) {
            labels.push(i.toString());
            
            // حساب إجمالي الرواتب للسنة
            const yearlyTotal = salaryTransactions
                .filter(tx => tx.year === i.toString())
                .reduce((sum, tx) => sum + (tx.totalSalary || 0), 0);
            
            totalSalaries.push(yearlyTotal);
        }
    }
    
    return {
        labels,
        totalSalaries
    };
}

/**
 * رسم مخطط أداء الموظفين
 * @param {string} month - الشهر المحدد
 * @param {string} year - السنة المحددة
 * @param {string} period - فترة التقرير
 */
function renderEmployeePerformanceChart(month, year, period) {
    const canvas = document.getElementById('employee-performance-chart');
    if (!canvas || !window.Chart) return;
    
    // الحصول على البيانات حسب الفترة
    const chartData = getEmployeePerformanceData(month, year, period);
    
    // تدمير المخطط الحالي إذا كان موجوداً
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // إنشاء المخطط الجديد
    canvas.chart = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: chartData.employees,
            datasets: [{
                label: 'المبيعات',
                data: chartData.sales,
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderColor: '#f59e0b',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'المبيعات (دينار)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'أداء الموظفين (المبيعات)',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `المبيعات: ${formatCurrency(context.parsed.x)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * الحصول على بيانات أداء الموظفين للمخطط
 * @param {string} month - الشهر المحدد
 * @param {string} year - السنة المحددة
 * @param {string} period - فترة التقرير
 * @returns {Object} - بيانات المخطط
 */
function getEmployeePerformanceData(month, year, period) {
    // تصفية المعاملات حسب الفترة
    const filteredTransactions = filterTransactionsByPeriod(salaryTransactions, month, year, period);
    
    // تجميع البيانات حسب الموظف
    const employeeData = {};
    
    filteredTransactions.forEach(tx => {
        if (!employeeData[tx.employeeId]) {
            employeeData[tx.employeeId] = {
                name: tx.employeeName,
                sales: 0
            };
        }
        
        employeeData[tx.employeeId].sales += tx.sales || 0;
    });
    
    // تحويل البيانات إلى تنسيق المخطط
    const employees = [];
    const sales = [];
    
    // ترتيب الموظفين حسب المبيعات (تنازلياً)
    const sortedEmployees = Object.values(employeeData)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10); // أخذ أفضل 10 موظفين
    
    sortedEmployees.forEach(data => {
        employees.push(data.name);
        sales.push(data.sales);
    });
    
    return {
        employees,
        sales
    };
}

/**
 * تصفية المعاملات حسب الفترة
 * @param {Array} transactions - المعاملات
 * @param {string} month - الشهر المحدد
 * @param {string} year - السنة المحددة
 * @param {string} period - فترة التقرير
 * @returns {Array} - المعاملات المصفاة
 */
function filterTransactionsByPeriod(transactions, month, year, period) {
    let filteredTransactions = [...transactions];
    
    if (period === 'monthly') {
        // تصفية حسب الشهر والسنة
        filteredTransactions = filteredTransactions.filter(
            tx => tx.month === month && tx.year === year
        );
    } else if (period === 'quarterly') {
        // تحديد الربع الذي ينتمي إليه الشهر
        const quarterMonth = parseInt(month);
        const quarter = Math.ceil(quarterMonth / 3);
        
        // تحديد أشهر الربع
        const quarterMonths = [(quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2, (quarter - 1) * 3 + 3]
            .map(m => m.toString());
        
        // تصفية حسب أشهر الربع والسنة
        filteredTransactions = filteredTransactions.filter(
            tx => quarterMonths.includes(tx.month) && tx.year === year
        );
    } else if (period === 'yearly') {
        // تصفية حسب السنة فقط
        filteredTransactions = filteredTransactions.filter(
            tx => tx.year === year
        );
    }
    
    return filteredTransactions;
}

// ===== وظائف حفظ البيانات =====

/**
 * حفظ بيانات الموظف
 */
function saveEmployee() {
    // التحقق من صحة النموذج
    const form = document.getElementById('employee-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    try {
        // جمع بيانات الموظف من النموذج
        const employeeData = collectEmployeeFormData();
        
        // التحقق من معرف الموظف (إضافة جديدة أم تعديل)
        const employeeId = document.getElementById('employee-id').value;
        
        if (employeeId) {
            // تعديل موظف موجود
            const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
            if (employeeIndex === -1) {
                throw new Error('لم يتم العثور على الموظف');
            }
            
            // تحديث بيانات الموظف مع الاحتفاظ بالبيانات الأخرى
            employees[employeeIndex] = {
                ...employees[employeeIndex],
                ...employeeData,
                id: employeeId,
                updatedAt: new Date().toISOString()
            };
            
            showToast(`تم تحديث بيانات الموظف ${employeeData.name} بنجاح`, 'success');
        } else {
            // إضافة موظف جديد
            const newEmployee = {
                ...employeeData,
                id: generateId(),
                createdAt: new Date().toISOString()
            };
            
            employees.push(newEmployee);
            showToast(`تم إضافة الموظف ${employeeData.name} بنجاح`, 'success');
        }
        
        // حفظ البيانات في التخزين المحلي
        saveToLocalStorage('employeesData', employees);
        
        // تحديث عرض البيانات
        renderEmployeesTable();
        
        // إغلاق النافذة
        closeModal('add-employee-modal');
        
        return true;
    } catch (error) {
        console.error('خطأ في حفظ بيانات الموظف:', error);
        showToast(`حدث خطأ أثناء حفظ بيانات الموظف: ${error.message}`, 'error');
        return false;
    }
}

/**
 * جمع بيانات الموظف من النموذج
 * @returns {Object} - بيانات الموظف
 */
function collectEmployeeFormData() {
    // المعلومات الشخصية
    const name = document.getElementById('employee-name').value.trim();
    const phone = document.getElementById('employee-phone').value.trim();
    const altPhone = document.getElementById('employee-alt-phone').value.trim();
    const email = document.getElementById('employee-email').value.trim();
    const address = document.getElementById('employee-address').value.trim();
    const birthdate = document.getElementById('employee-birthdate').value;
    const gender = document.getElementById('employee-gender').value;
    const maritalStatus = document.getElementById('employee-marital-status').value;
    
    // المعلومات الوظيفية
    const jobTitle = document.getElementById('employee-job-title').value.trim();
    const department = document.getElementById('employee-department').value;
    const managerId = document.getElementById('employee-manager').value;
    const hireDate = document.getElementById('employee-hire-date').value;
    const contractEnd = document.getElementById('employee-contract-end').value;
    const contractType = document.getElementById('employee-contract-type').value;
    const workHours = document.getElementById('employee-work-hours').value;
    const status = document.getElementById('employee-status').value;
    
    // المعلومات المالية
    const basicSalary = parseFloat(document.getElementById('employee-basic-salary').value) || 0;
    const housingAllowance = parseFloat(document.getElementById('employee-housing-allowance').value) || 0;
    const transportationAllowance = parseFloat(document.getElementById('employee-transportation-allowance').value) || 0;
    const otherAllowances = parseFloat(document.getElementById('employee-other-allowances').value) || 0;
    const commissionRate = parseFloat(document.getElementById('employee-commission-rate').value) || 0;
    const paymentMethod = document.getElementById('employee-payment-method').value;
    const bankName = document.getElementById('employee-bank-name').value.trim();
    const bankAccount = document.getElementById('employee-bank-account').value.trim();
    const financialNotes = document.getElementById('employee-financial-notes').value.trim();
    
    // المستندات
    const idNumber = document.getElementById('employee-id-number').value.trim();
    const idExpiry = document.getElementById('employee-id-expiry').value;
    const notes = document.getElementById('employee-notes').value.trim();
    
    // جمع الملفات
    const documents = collectDocumentFiles();
    
    // التحقق من البيانات المطلوبة
    if (!name || !phone || !jobTitle || !department || !hireDate || !basicSalary || !idNumber) {
        throw new Error('يرجى إدخال جميع البيانات المطلوبة');
    }
    
    // إنشاء كائن الموظف
    return {
        name,
        phone,
        altPhone,
        email,
        address,
        birthdate,
        gender,
        maritalStatus,
        jobTitle,
        department,
        managerId,
        hireDate,
        contractEnd,
        contractType,
        workHours,
        status,
        basicSalary,
        housingAllowance,
        transportationAllowance,
        otherAllowances,
        commissionRate,
        paymentMethod,
        bankName,
        bankAccount,
        financialNotes,
        idNumber,
        idExpiry,
        notes,
        documents
    };
}

/**
 * جمع ملفات المستندات
 * @returns {Object} - بيانات المستندات
 */
function collectDocumentFiles() {
    const documents = {};
    
    // صورة الهوية
    const idCardPreview = document.getElementById('id-card-preview');
    if (idCardPreview.querySelector('img')) {
        documents.idCard = idCardPreview.querySelector('img').src;
    }
    
    // الصورة الشخصية
    const photoPreview = document.getElementById('employee-photo-preview');
    if (photoPreview.querySelector('img')) {
        documents.photo = photoPreview.querySelector('img').src;
    }
    
    // الشهادة العلمية
    const certificatePreview = document.getElementById('certificate-preview');
    if (certificatePreview.querySelector('img')) {
        documents.certificate = certificatePreview.querySelector('img').src;
    } else if (certificatePreview.querySelector('.file-info')) {
        documents.certificate = certificatePreview.innerHTML;
    }
    
    // عقد العمل
    const contractPreview = document.getElementById('contract-preview');
    if (contractPreview.querySelector('img')) {
        documents.contract = contractPreview.querySelector('img').src;
    } else if (contractPreview.querySelector('.file-info')) {
        documents.contract = contractPreview.innerHTML;
    }
    
    return documents;
}

/**
 * صرف راتب
 */
function paySalary() {
    // التحقق من صحة النموذج
    const form = document.getElementById('pay-salary-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    try {
        // جمع بيانات الراتب من النموذج
        const salaryData = collectSalaryFormData();
        
        // التحقق من عدم وجود معاملة سابقة لنفس الموظف في نفس الشهر والسنة
        const existingTransaction = salaryTransactions.find(tx => 
            tx.employeeId === salaryData.employeeId && 
            tx.month === salaryData.month && 
            tx.year === salaryData.year
        );
        
        if (existingTransaction) {
            if (!confirm('يوجد راتب مصروف بالفعل لهذا الموظف في هذا الشهر. هل تريد الاستمرار؟')) {
                return false;
            }
        }
        
        // إنشاء معاملة راتب جديدة
        const newTransaction = {
            ...salaryData,
            id: generateId(),
            createdAt: new Date().toISOString()
        };
        
        // إضافة المعاملة إلى المصفوفة
        salaryTransactions.push(newTransaction);
        
        // حفظ البيانات في التخزين المحلي
        saveToLocalStorage('salaryTransactions', salaryTransactions);
        
        // معالجة الديون والسلف المخصومة
        processDeductedLoans(salaryData.employeeId, salaryData.deductedLoans);
        
        // تحديث عرض البيانات
        renderSalaryTransactionsTable();
        
        // إغلاق النافذة
        closeModal('pay-salary-modal');
        
        // عرض تفاصيل الراتب
        showSalaryDetails(newTransaction.id);
        
        showToast(`تم صرف راتب الموظف ${salaryData.employeeName} بنجاح`, 'success');
        
        return true;
    } catch (error) {
        console.error('خطأ في صرف الراتب:', error);
        showToast(`حدث خطأ أثناء صرف الراتب: ${error.message}`, 'error');
        return false;
    }
}

/**
 * جمع بيانات الراتب من النموذج
 * @returns {Object} - بيانات الراتب
 */
function collectSalaryFormData() {
    // بيانات الموظف
    const employeeId = document.getElementById('salary-employee').value;
    const employee = employees.find(emp => emp.id === employeeId);
    
    if (!employee) {
        throw new Error('لم يتم العثور على الموظف');
    }
    
    const employeeName = employee.name;
    
    // بيانات الراتب
    const month = document.getElementById('salary-month').value;
    const year = document.getElementById('salary-year').value;
    const date = document.getElementById('salary-date').value;
    const basicSalary = parseFloat(document.getElementById('salary-basic').value) || 0;
    const sales = parseFloat(document.getElementById('salary-sales').value) || 0;
    const commissionRate = parseFloat(document.getElementById('salary-commission-rate').value) || 0;
    const commissionAmount = parseFloat(document.getElementById('salary-commission-amount').value) || 0;
    const allowances = parseFloat(document.getElementById('salary-allowances').value) || 0;
    const bonus = parseFloat(document.getElementById('salary-bonus').value) || 0;
    const deductions = parseFloat(document.getElementById('salary-deductions').value) || 0;
    const notes = document.getElementById('salary-notes').value.trim();
    
    // جمع القروض المخصومة
    const deductedLoans = [];
    document.querySelectorAll('input[name="deduct-loan"]:checked').forEach(checkbox => {
        deductedLoans.push({
            loanId: checkbox.value,
            amount: parseFloat(checkbox.getAttribute('data-amount')) || 0,
            type: checkbox.getAttribute('data-type')
        });
    });
    
    // حساب إجمالي خصومات القروض
    const loanDeductions = deductedLoans.reduce((total, loan) => total + loan.amount, 0);
    
    // حساب إجمالي الراتب
    const totalSalary = basicSalary + commissionAmount + allowances + bonus - deductions - loanDeductions;
    
    // التحقق من البيانات المطلوبة
    if (!employeeId || !month || !year || !date || isNaN(basicSalary)) {
        throw new Error('يرجى إدخال جميع البيانات المطلوبة');
    }
    
    // إنشاء كائن بيانات الراتب
    return {
        employeeId,
        employeeName,
        month,
        year,
        date,
        basicSalary,
        sales,
        commissionRate,
        commissionAmount,
        allowances,
        bonus,
        deductions,
        loanDeductions,
        totalSalary,
        notes,
        deductedLoans
    };
}

/**
 * معالجة القروض والسلف المخصومة
 * @param {string} employeeId - معرف الموظف
 * @param {Array} deductedLoans - القروض المخصومة
 */
function processDeductedLoans(employeeId, deductedLoans) {
    if (!deductedLoans || deductedLoans.length === 0) return;
    
    deductedLoans.forEach(deductedLoan => {
        const { loanId, amount, type } = deductedLoan;
        
        if (type === 'loan') {
            // تحديث قرض
            const loanIndex = employeeLoans.findIndex(loan => loan.id === loanId);
            if (loanIndex !== -1) {
                const loan = employeeLoans[loanIndex];
                const paidAmount = (loan.paidAmount || 0) + amount;
                const remainingAmount = loan.amount - paidAmount;
                const remainingInstallments = Math.max(loan.remainingInstallments - 1, 0);
                
                // تحديث بيانات القرض
                employeeLoans[loanIndex] = {
                    ...loan,
                    paidAmount,
                    remainingAmount,
                    remainingInstallments,
                    status: remainingAmount <= 0 ? 'completed' : 'active',
                    updatedAt: new Date().toISOString()
                };
            }
        } else if (type === 'advance') {
            // تحديث سلفة
            const advanceIndex = salaryAdvances.findIndex(advance => advance.id === loanId);
            if (advanceIndex !== -1) {
                const advance = salaryAdvances[advanceIndex];
                const paidAmount = (advance.paidAmount || 0) + amount;
                const remainingAmount = advance.amount - paidAmount;
                const remainingInstallments = Math.max(advance.remainingInstallments - 1, 0);
                
                // تحديث بيانات السلفة
                salaryAdvances[advanceIndex] = {
                    ...advance,
                    paidAmount,
                    remainingAmount,
                    remainingInstallments,
                    status: remainingAmount <= 0 ? 'completed' : 'active',
                    updatedAt: new Date().toISOString()
                };
            }
        }
    });
    
    // حفظ البيانات في التخزين المحلي
    saveToLocalStorage('employeeLoans', employeeLoans);
    saveToLocalStorage('salaryAdvances', salaryAdvances);
}

/**
 * حفظ سلفة
 */
function saveAdvance() {
    // التحقق من صحة النموذج
    const form = document.getElementById('advance-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    try {
        // جمع بيانات السلفة من النموذج
        const employeeId = document.getElementById('advance-employee').value;
        const employee = employees.find(emp => emp.id === employeeId);
        
        if (!employee) {
            throw new Error('لم يتم العثور على الموظف');
        }
        
        const amount = parseFloat(document.getElementById('advance-amount').value);
        const date = document.getElementById('advance-date').value;
        const deductionDate = document.getElementById('advance-deduction-date').value;
        const repaymentMethod = document.getElementById('advance-repayment-method').value;
        let installments = 1;
        
        if (repaymentMethod === 'installments') {
            installments = parseInt(document.getElementById('advance-installments').value) || 1;
        }
        
        const notes = document.getElementById('advance-notes').value.trim();
        
        // التحقق من البيانات المطلوبة
        if (!employeeId || !amount || !date) {
            throw new Error('يرجى إدخال جميع البيانات المطلوبة');
        }
        
        // إنشاء كائن بيانات السلفة
        const newAdvance = {
            id: generateId(),
            employeeId,
            employeeName: employee.name,
            amount,
            date,
            deductionDate,
            repaymentMethod,
            installments,
            remainingInstallments: installments,
            installmentAmount: repaymentMethod === 'installments' ? (amount / installments) : amount,
            paidAmount: 0,
            remainingAmount: amount,
            status: 'active',
            notes,
            createdAt: new Date().toISOString()
        };
        
        // إضافة السلفة إلى المصفوفة
        salaryAdvances.push(newAdvance);
        
        // حفظ البيانات في التخزين المحلي
        saveToLocalStorage('salaryAdvances', salaryAdvances);
        
        // تحديث عرض البيانات
        renderAdvancesLoansTable();
        
        // إغلاق النافذة
        closeModal('add-advance-modal');
        
        showToast(`تم تسجيل سلفة للموظف ${employee.name} بنجاح`, 'success');
        
        return true;
    } catch (error) {
        console.error('خطأ في حفظ السلفة:', error);
        showToast(`حدث خطأ أثناء حفظ السلفة: ${error.message}`, 'error');
        return false;
    }
}

/**
 * حفظ قرض
 */
function saveLoan() {
    // التحقق من صحة النموذج
    const form = document.getElementById('loan-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    try {
        // جمع بيانات القرض من النموذج
        const employeeId = document.getElementById('loan-employee').value;
        const employee = employees.find(emp => emp.id === employeeId);
        
        if (!employee) {
            throw new Error('لم يتم العثور على الموظف');
        }
        
        const amount = parseFloat(document.getElementById('loan-amount').value);
        const date = document.getElementById('loan-date').value;
        const installments = parseInt(document.getElementById('loan-installments').value) || 1;
        const interestRate = parseFloat(document.getElementById('loan-interest-rate').value) || 0;
        const firstPaymentDate = document.getElementById('loan-first-payment').value;
        const paymentMethod = document.getElementById('loan-payment-method').value;
        const notes = document.getElementById('loan-notes').value.trim();
        
        // التحقق من البيانات المطلوبة
        if (!employeeId || !amount || !date || !installments) {
            throw new Error('يرجى إدخال جميع البيانات المطلوبة');
        }
        
        // حساب المبلغ الإجمالي مع الفائدة
        const totalAmount = amount * (1 + interestRate / 100);
        
        // إنشاء كائن بيانات القرض
        const newLoan = {
            id: generateId(),
            employeeId,
            employeeName: employee.name,
            amount,
            totalAmount,
            date,
            installments,
            remainingInstallments: installments,
            installmentAmount: totalAmount / installments,
            interestRate,
            firstPaymentDate,
            paymentMethod,
            paidAmount: 0,
            remainingAmount: totalAmount,
            status: 'active',
            notes,
            createdAt: new Date().toISOString()
        };
        
        // إضافة القرض إلى المصفوفة
        employeeLoans.push(newLoan);
        
        // حفظ البيانات في التخزين المحلي
        saveToLocalStorage('employeeLoans', employeeLoans);
        
        // تحديث عرض البيانات
        renderAdvancesLoansTable();
        
       // إغلاق النافذة
       closeModal('add-loan-modal');
        
       showToast(`تم تسجيل قرض للموظف ${employee.name} بنجاح`, 'success');
       
       return true;
   } catch (error) {
       console.error('خطأ في حفظ القرض:', error);
       showToast(`حدث خطأ أثناء حفظ القرض: ${error.message}`, 'error');
       return false;
   }
}

/**
* حفظ سجل حضور
*/
function saveAttendance() {
   // التحقق من صحة النموذج
   const form = document.getElementById('attendance-form');
   if (!form.checkValidity()) {
       form.reportValidity();
       return;
   }
   
   try {
       // جمع بيانات الحضور من النموذج
       const employeeId = document.getElementById('attendance-employee').value;
       const employee = employees.find(emp => emp.id === employeeId);
       
       if (!employee) {
           throw new Error('لم يتم العثور على الموظف');
       }
       
       const date = document.getElementById('attendance-date').value;
       const timeIn = document.getElementById('attendance-time-in').value;
       const timeOut = document.getElementById('attendance-time-out').value;
       const status = document.getElementById('attendance-status').value;
       const notes = document.getElementById('attendance-notes').value.trim();
       
       // التحقق من البيانات المطلوبة
       if (!employeeId || !date || !timeIn) {
           throw new Error('يرجى إدخال جميع البيانات المطلوبة');
       }
       
       // التحقق من عدم وجود سجل سابق لنفس الموظف في نفس التاريخ
       const attendanceId = document.querySelector('#attendance-form input[name="id"]')?.value;
       
       const existingRecord = attendanceRecords.find(record => 
           record.employeeId === employeeId && 
           record.date === date &&
           (!attendanceId || record.id !== attendanceId)
       );
       
       if (existingRecord) {
           if (!confirm('يوجد سجل حضور بالفعل لهذا الموظف في هذا التاريخ. هل تريد الاستمرار وإنشاء سجل آخر؟')) {
               return false;
           }
       }
       
       // حساب ساعات العمل
       let workHours = '';
       if (timeIn && timeOut) {
           workHours = calculateWorkHours(timeIn, timeOut);
       }
       
       // إنشاء أو تعديل سجل الحضور
       if (attendanceId) {
           // تعديل سجل موجود
           const recordIndex = attendanceRecords.findIndex(record => record.id === attendanceId);
           if (recordIndex === -1) {
               throw new Error('لم يتم العثور على سجل الحضور');
           }
           
           attendanceRecords[recordIndex] = {
               ...attendanceRecords[recordIndex],
               employeeId,
               employeeName: employee.name,
               date,
               timeIn,
               timeOut,
               workHours,
               status,
               notes,
               updatedAt: new Date().toISOString()
           };
           
           showToast(`تم تحديث سجل حضور الموظف ${employee.name} بنجاح`, 'success');
       } else {
           // إنشاء سجل جديد
           const newRecord = {
               id: generateId(),
               employeeId,
               employeeName: employee.name,
               date,
               timeIn,
               timeOut,
               workHours,
               status,
               notes,
               createdAt: new Date().toISOString()
           };
           
           attendanceRecords.push(newRecord);
           showToast(`تم تسجيل حضور الموظف ${employee.name} بنجاح`, 'success');
       }
       
       // حفظ البيانات في التخزين المحلي
       saveToLocalStorage('attendanceRecords', attendanceRecords);
       
       // تحديث عرض البيانات
       renderAttendanceTable();
       
       // إغلاق النافذة
       closeModal('attendance-modal');
       
       return true;
   } catch (error) {
       console.error('خطأ في حفظ سجل الحضور:', error);
       showToast(`حدث خطأ أثناء حفظ سجل الحضور: ${error.message}`, 'error');
       return false;
   }
}

/**
* حفظ طلب إجازة
*/
function saveVacation() {
   // التحقق من صحة النموذج
   const form = document.getElementById('vacation-form');
   if (!form.checkValidity()) {
       form.reportValidity();
       return;
   }
   
   try {
       // جمع بيانات الإجازة من النموذج
       const employeeId = document.getElementById('vacation-employee').value;
       const employee = employees.find(emp => emp.id === employeeId);
       
       if (!employee) {
           throw new Error('لم يتم العثور على الموظف');
       }
       
       const type = document.getElementById('vacation-type').value;
       const startDate = document.getElementById('vacation-start-date').value;
       const endDate = document.getElementById('vacation-end-date').value;
       const days = parseInt(document.getElementById('vacation-days').value) || 0;
       const reason = document.getElementById('vacation-reason').value.trim();
       
       // التحقق من البيانات المطلوبة
       if (!employeeId || !type || !startDate || !endDate) {
           throw new Error('يرجى إدخال جميع البيانات المطلوبة');
       }
       
       // التحقق من التواريخ
       if (new Date(startDate) > new Date(endDate)) {
           throw new Error('تاريخ بداية الإجازة يجب أن يكون قبل تاريخ النهاية');
       }
       
       // جمع بيانات المرفق (إن وجد)
       let attachment = '';
       const attachmentPreview = document.getElementById('vacation-attachment-preview');
       if (attachmentPreview.innerHTML) {
           attachment = attachmentPreview.innerHTML;
       }
       
       // إنشاء كائن بيانات الإجازة
       const newVacation = {
           id: generateId(),
           employeeId,
           employeeName: employee.name,
           type,
           startDate,
           endDate,
           days,
           reason,
           attachment,
           status: 'pending',
           requestDate: new Date().toISOString().split('T')[0],
           createdAt: new Date().toISOString()
       };
       
       // إضافة الإجازة إلى المصفوفة
       vacationRequests.push(newVacation);
       
       // حفظ البيانات في التخزين المحلي
       saveToLocalStorage('vacationRequests', vacationRequests);
       
       // تحديث عرض البيانات
       renderVacationRequestsTable();
       
       // إغلاق النافذة
       closeModal('vacation-modal');
       
       showToast(`تم تسجيل طلب إجازة للموظف ${employee.name} بنجاح`, 'success');
       
       return true;
   } catch (error) {
       console.error('خطأ في حفظ طلب الإجازة:', error);
       showToast(`حدث خطأ أثناء حفظ طلب الإجازة: ${error.message}`, 'error');
       return false;
   }
}

/**
* استيراد البيانات
*/
function importData() {
   // التحقق من صحة النموذج
   const form = document.getElementById('import-form');
   if (!form.checkValidity()) {
       form.reportValidity();
       return;
   }
   
   try {
       // الحصول على نوع البيانات
       const importType = document.getElementById('import-type').value;
       
       // الحصول على معاينة البيانات
       const previewData = window.importPreviewData;
       
       if (!previewData || !previewData.length) {
           throw new Error('لا توجد بيانات للاستيراد');
       }
       
       // خيارات الاستيراد
       const override = document.getElementById('import-override').checked;
       
       // استيراد البيانات حسب النوع
       let importedCount = 0;
       
       if (importType === 'employees') {
           // استيراد بيانات الموظفين
           previewData.forEach(row => {
               // إنشاء كائن الموظف
               const newEmployee = mapImportedEmployeeData(row);
               
               if (newEmployee.name && newEmployee.phone) {
                   // التحقق مما إذا كان الموظف موجوداً بالفعل
                   const existingIndex = employees.findIndex(emp => 
                       emp.name === newEmployee.name || emp.phone === newEmployee.phone
                   );
                   
                   if (existingIndex !== -1) {
                       if (override) {
                           // تحديث الموظف الموجود
                           employees[existingIndex] = {
                               ...employees[existingIndex],
                               ...newEmployee,
                               updatedAt: new Date().toISOString()
                           };
                       }
                       // إذا كان override = false، نتخطى هذا الموظف
                   } else {
                       // إضافة موظف جديد
                       employees.push({
                           ...newEmployee,
                           id: generateId(),
                           createdAt: new Date().toISOString()
                       });
                   }
                   
                   importedCount++;
               }
           });
           
           // حفظ البيانات في التخزين المحلي
           saveToLocalStorage('employeesData', employees);
           
           // تحديث عرض البيانات
           renderEmployeesTable();
       } else if (importType === 'salaries') {
           // استيراد سجلات الرواتب
           previewData.forEach(row => {
               // إنشاء كائن معاملة الراتب
               const newTransaction = mapImportedSalaryData(row);
               
               if (newTransaction.employeeId && newTransaction.date) {
                   // التحقق مما إذا كانت المعاملة موجودة بالفعل
                   const existingIndex = salaryTransactions.findIndex(tx => 
                       tx.employeeId === newTransaction.employeeId && 
                       tx.month === newTransaction.month && 
                       tx.year === newTransaction.year
                   );
                   
                   if (existingIndex !== -1) {
                       if (override) {
                           // تحديث المعاملة الموجودة
                           salaryTransactions[existingIndex] = {
                               ...salaryTransactions[existingIndex],
                               ...newTransaction,
                               updatedAt: new Date().toISOString()
                           };
                       }
                       // إذا كان override = false، نتخطى هذه المعاملة
                   } else {
                       // إضافة معاملة جديدة
                       salaryTransactions.push({
                           ...newTransaction,
                           id: generateId(),
                           createdAt: new Date().toISOString()
                       });
                   }
                   
                   importedCount++;
               }
           });
           
           // حفظ البيانات في التخزين المحلي
           saveToLocalStorage('salaryTransactions', salaryTransactions);
           
           // تحديث عرض البيانات
           renderSalaryTransactionsTable();
       } else if (importType === 'attendance') {
           // استيراد سجلات الحضور
           previewData.forEach(row => {
               // إنشاء كائن سجل الحضور
               const newRecord = mapImportedAttendanceData(row);
               
               if (newRecord.employeeId && newRecord.date) {
                   // التحقق مما إذا كان السجل موجوداً بالفعل
                   const existingIndex = attendanceRecords.findIndex(record => 
                       record.employeeId === newRecord.employeeId && 
                       record.date === newRecord.date
                   );
                   
                   if (existingIndex !== -1) {
                       if (override) {
                           // تحديث السجل الموجود
                           attendanceRecords[existingIndex] = {
                               ...attendanceRecords[existingIndex],
                               ...newRecord,
                               updatedAt: new Date().toISOString()
                           };
                       }
                       // إذا كان override = false، نتخطى هذا السجل
                   } else {
                       // إضافة سجل جديد
                       attendanceRecords.push({
                           ...newRecord,
                           id: generateId(),
                           createdAt: new Date().toISOString()
                       });
                   }
                   
                   importedCount++;
               }
           });
           
           // حفظ البيانات في التخزين المحلي
           saveToLocalStorage('attendanceRecords', attendanceRecords);
           
           // تحديث عرض البيانات
           renderAttendanceTable();
       }
       
       // إغلاق النافذة
       closeModal('import-data-modal');
       
       showToast(`تم استيراد ${importedCount} سجل بنجاح`, 'success');
       
       return true;
   } catch (error) {
       console.error('خطأ في استيراد البيانات:', error);
       showToast(`حدث خطأ أثناء استيراد البيانات: ${error.message}`, 'error');
       return false;
   }
}

/**
* تعيين بيانات الموظف المستوردة
* @param {Object} row - صف البيانات المستوردة
* @returns {Object} - بيانات الموظف
*/
function mapImportedEmployeeData(row) {
   return {
       name: row.name || row.الاسم || '',
       phone: row.phone || row.الهاتف || '',
       email: row.email || row.البريد_الإلكتروني || '',
       address: row.address || row.العنوان || '',
       jobTitle: row.jobTitle || row.المسمى_الوظيفي || '',
       department: mapDepartment(row.department || row.القسم || ''),
       basicSalary: parseFloat(row.basicSalary || row.الراتب_الأساسي || 0),
       hireDate: row.hireDate || row.تاريخ_التعيين || '',
       status: mapStatus(row.status || row.الحالة || 'active')
   };
}

/**
* تعيين بيانات الراتب المستوردة
* @param {Object} row - صف البيانات المستوردة
* @returns {Object} - بيانات الراتب
*/
function mapImportedSalaryData(row) {
   // البحث عن معرف الموظف بالاسم
   let employeeId = row.employeeId || '';
   const employeeName = row.employeeName || row.الموظف || '';
   
   if (!employeeId && employeeName) {
       const employee = employees.find(emp => emp.name === employeeName);
       if (employee) {
           employeeId = employee.id;
       }
   }
   
   // استخراج الشهر والسنة من التاريخ
   let month = row.month || '';
   let year = row.year || '';
   const date = row.date || row.التاريخ || '';
   
   if (!month || !year) {
       if (date) {
           const dateObj = new Date(date);
           month = (dateObj.getMonth() + 1).toString();
           year = dateObj.getFullYear().toString();
       }
   }
   
   return {
       employeeId,
       employeeName,
       date,
       month,
       year,
       basicSalary: parseFloat(row.basicSalary || row.الراتب_الأساسي || 0),
       sales: parseFloat(row.sales || row.المبيعات || 0),
       commissionRate: parseFloat(row.commissionRate || row.نسبة_العمولة || 0),
       commissionAmount: parseFloat(row.commissionAmount || row.مبلغ_العمولة || 0),
       allowances: parseFloat(row.allowances || row.البدلات || 0),
       deductions: parseFloat(row.deductions || row.الاستقطاعات || 0),
       totalSalary: parseFloat(row.totalSalary || row.إجمالي_الراتب || 0),
       notes: row.notes || row.ملاحظات || ''
   };
}

/**
* تعيين بيانات الحضور المستوردة
* @param {Object} row - صف البيانات المستوردة
* @returns {Object} - بيانات الحضور
*/
function mapImportedAttendanceData(row) {
   // البحث عن معرف الموظف بالاسم
   let employeeId = row.employeeId || '';
   const employeeName = row.employeeName || row.الموظف || '';
   
   if (!employeeId && employeeName) {
       const employee = employees.find(emp => emp.name === employeeName);
       if (employee) {
           employeeId = employee.id;
       }
   }
   
   return {
       employeeId,
       employeeName,
       date: row.date || row.التاريخ || '',
       timeIn: row.timeIn || row.وقت_الحضور || '',
       timeOut: row.timeOut || row.وقت_الانصراف || '',
       status: mapAttendanceStatus(row.status || row.الحالة || 'present'),
       notes: row.notes || row.ملاحظات || ''
   };
}

/**
* معالجة ملف استيراد البيانات
* @param {File} file - ملف البيانات
* @param {string} fileData - بيانات الملف
*/
function handleImportFileChange(file, fileData) {
   // التعامل مع أنواع الملفات المختلفة
   const fileTypeMap = {
       'text/csv': parseCSVFile,
       'application/vnd.ms-excel': parseExcelFile,
       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': parseExcelFile
   };
   
   const fileProcessor = fileTypeMap[file.type];
   
   if (!fileProcessor) {
       showToast('نوع الملف غير مدعوم. الرجاء استخدام ملفات CSV أو Excel.', 'error');
       return;
   }
   
   try {
       // معالجة الملف
       fileProcessor(fileData, file.type);
   } catch (error) {
       console.error('خطأ في معالجة ملف الاستيراد:', error);
       showToast(`حدث خطأ أثناء معالجة الملف: ${error.message}`, 'error');
   }
}

/**
* تحليل ملف CSV
* @param {string} fileData - بيانات الملف
*/
function parseCSVFile(fileData) {
   // تنفيذ تحليل CSV
   const lines = fileData.split('\n');
   
   // استخراج العناوين
   const headers = lines[0].split(',').map(header => 
       header.trim().replace(/^"|"$/g, '') // إزالة علامات الاقتباس
   );
   
   // استخراج البيانات
   const data = [];
   for (let i = 1; i < lines.length; i++) {
       const line = lines[i].trim();
       if (!line) continue;
       
       // تقسيم السطر مع مراعاة الاقتباسات
       const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
       
       // إنشاء كائن للصف
       const row = {};
       for (let j = 0; j < headers.length; j++) {
           const value = j < values.length ? values[j].replace(/^"|"$/g, '') : '';
           row[headers[j]] = value;
       }
       
       data.push(row);
   }
   
   // حفظ البيانات للمعاينة
   window.importPreviewData = data;
   
   // عرض معاينة البيانات
   showImportPreview(headers, data);
}

/**
* تحليل ملف Excel
* @param {string} fileData - بيانات الملف
* @param {string} fileType - نوع الملف
*/
function parseExcelFile(fileData, fileType) {
   // هذه مجرد وظيفة بسيطة، يمكن استخدام مكتبة خارجية مثل SheetJS لتحليل ملفات Excel بشكل صحيح
   showToast('لم يتم تنفيذ دعم ملفات Excel بعد', 'warning');
}

/**
* عرض معاينة البيانات المستوردة
* @param {Array} headers - عناوين الأعمدة
* @param {Array} data - البيانات
*/
function showImportPreview(headers, data) {
   const previewContainer = document.getElementById('import-preview-data');
   if (!previewContainer) return;
   
   // إنشاء جدول المعاينة
   let html = '<table class="table-hover"><thead><tr>';
   
   // إضافة العناوين
   headers.forEach(header => {
       html += `<th>${header}</th>`;
   });
   
   html += '</tr></thead><tbody>';
   
   // إضافة البيانات (أقصى 5 صفوف للمعاينة)
   const previewRows = Math.min(data.length, 5);
   for (let i = 0; i < previewRows; i++) {
       html += '<tr>';
       headers.forEach(header => {
           html += `<td>${data[i][header] || ''}</td>`;
       });
       html += '</tr>';
   }
   
   html += '</tbody></table>';
   
   if (data.length > 5) {
       html += `<div class="text-center text-muted mt-2">تظهر 5 صفوف فقط من أصل ${data.length} صف</div>`;
   }
   
   // عرض المعاينة
   previewContainer.innerHTML = html;
}

/**
* معالجة صرف جميع الرواتب
*/
function processAllPayroll() {
   // الحصول على الشهر والسنة المحددين
   const selectedMonth = document.getElementById('payroll-month-filter').value;
   const selectedYear = document.getElementById('payroll-year-filter').value;
   
   // التحقق من التأكيد
   if (!confirm(`هل أنت متأكد من رغبتك في صرف جميع الرواتب المستحقة لشهر ${getArabicMonthName(selectedMonth)} ${selectedYear}؟`)) {
       return;
   }
   
   // الموظفين النشطين
   const activeEmployees = employees.filter(emp => emp.status === 'active');
   
   // المعاملات المدفوعة في هذا الشهر
   const paidTransactions = salaryTransactions.filter(
       tx => tx.month === selectedMonth && tx.year === selectedYear
   );
   
   // الموظفين الذين لم يتم صرف رواتبهم بعد
   const unpaidEmployees = activeEmployees.filter(emp => 
       !paidTransactions.some(tx => tx.employeeId === emp.id)
   );
   
   if (unpaidEmployees.length === 0) {
       showToast('جميع الرواتب مدفوعة بالفعل لهذا الشهر', 'info');
       return;
   }
   
   try {
       // صرف راتب لكل موظف
       let processedCount = 0;
       
       unpaidEmployees.forEach(employee => {
           // حساب الراتب المتوقع
           const expectedSalary = calculateExpectedSalary(employee, selectedMonth, selectedYear);
           
           // إنشاء معاملة راتب جديدة
           const newTransaction = {
               id: generateId(),
               employeeId: employee.id,
               employeeName: employee.name,
               month: selectedMonth,
               year: selectedYear,
               date: new Date().toISOString().split('T')[0],
               basicSalary: employee.basicSalary || 0,
               allowances: expectedSalary.allowances || 0,
               commissionRate: employee.commissionRate || 0,
               commissionAmount: expectedSalary.expectedCommission || 0,
               deductions: expectedSalary.deductions || 0,
               loanDeductions: expectedSalary.loans || 0,
               totalSalary: expectedSalary.netSalary || 0,
               notes: `تم الصرف تلقائياً بتاريخ ${formatDate(new Date().toISOString().split('T')[0])}`,
               createdAt: new Date().toISOString()
           };
           
           // إضافة المعاملة إلى المصفوفة
           salaryTransactions.push(newTransaction);
           
           processedCount++;
       });
       
       // حفظ البيانات في التخزين المحلي
       saveToLocalStorage('salaryTransactions', salaryTransactions);
       
       // تحديث عرض البيانات
       renderPayrollTable();
       updatePayrollSummary();
       
       showToast(`تم صرف ${processedCount} راتب بنجاح`, 'success');
       
       return true;
   } catch (error) {
       console.error('خطأ في صرف الرواتب:', error);
       showToast(`حدث خطأ أثناء صرف الرواتب: ${error.message}`, 'error');
       return false;
   }
}

/**
* تأكيد حذف موظف
* @param {string} employeeId - معرف الموظف
*/
function confirmDeleteEmployee(employeeId) {
   const employee = employees.find(emp => emp.id === employeeId);
   if (!employee) {
       showToast('لم يتم العثور على الموظف', 'error');
       return;
   }
   
   // التحقق من التأكيد
   if (confirm(`هل أنت متأكد من رغبتك في حذف الموظف "${employee.name}"؟\nسيتم حذف جميع البيانات المرتبطة بهذا الموظف.`)) {
       deleteEmployee(employeeId);
   }
}

/**
* حذف موظف
* @param {string} employeeId - معرف الموظف
*/
function deleteEmployee(employeeId) {
   try {
       // حذف الموظف
       employees = employees.filter(emp => emp.id !== employeeId);
       
       // حذف البيانات المرتبطة
       salaryTransactions = salaryTransactions.filter(tx => tx.employeeId !== employeeId);
       salaryAdvances = salaryAdvances.filter(adv => adv.employeeId !== employeeId);
       employeeLoans = employeeLoans.filter(loan => loan.employeeId !== employeeId);
       attendanceRecords = attendanceRecords.filter(record => record.employeeId !== employeeId);
       vacationRequests = vacationRequests.filter(req => req.employeeId !== employeeId);
       
       // حفظ البيانات في التخزين المحلي
       saveAllData();
       
       // تحديث عرض البيانات
       renderEmployeesTable();
       
       showToast('تم حذف الموظف وجميع البيانات المرتبطة به بنجاح', 'success');
       
       return true;
   } catch (error) {
       console.error('خطأ في حذف الموظف:', error);
       showToast(`حدث خطأ أثناء حذف الموظف: ${error.message}`, 'error');
       return false;
   }
}
/**
 * تأكيد سداد قسط
 * @param {string} loanId - معرف القرض/السلفة
 */
function confirmPayInstallment(loanId) {
    // البحث عن القرض/السلفة
    const loan = employeeLoans.find(loan => loan.id === loanId);
    const advance = salaryAdvances.find(adv => adv.id === loanId);
    
    // تحديد نوع العنصر (قرض/سلفة)
    const item = loan || advance;
    const itemType = loan ? 'loan' : 'advance';
    
    if (!item) {
        showToast('لم يتم العثور على القرض/السلفة', 'error');
        return;
    }
    
    // إذا كان القرض/السلفة مكتملاً بالفعل
    if (item.status === 'completed') {
        showToast('تم سداد هذا القرض/السلفة بالكامل', 'info');
        return;
    }
    
    // حساب المبلغ المتبقي
    const remainingAmount = item.remainingAmount || (item.amount - (item.paidAmount || 0));
    
    // طلب مبلغ الدفعة
    const paymentAmount = parseFloat(prompt(`أدخل مبلغ الدفعة (المبلغ المتبقي: ${formatCurrency(remainingAmount, false)})`, item.installmentAmount || remainingAmount));
    
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        showToast('مبلغ الدفعة غير صالح', 'error');
        return;
    }
    
    if (paymentAmount > remainingAmount) {
        if (!confirm(`مبلغ الدفعة أكبر من المبلغ المتبقي. هل تريد سداد المبلغ المتبقي فقط (${formatCurrency(remainingAmount)})?`)) {
            return;
        }
    }
    
    try {
        // تحديد مبلغ الدفعة النهائي
        const finalPaymentAmount = Math.min(paymentAmount, remainingAmount);
        
        if (itemType === 'loan') {
            // تحديث بيانات القرض
            const loanIndex = employeeLoans.findIndex(ln => ln.id === loanId);
            if (loanIndex !== -1) {
                const updatedLoan = { ...employeeLoans[loanIndex] };
                updatedLoan.paidAmount = (updatedLoan.paidAmount || 0) + finalPaymentAmount;
                updatedLoan.remainingAmount = updatedLoan.amount - updatedLoan.paidAmount;
                updatedLoan.remainingInstallments = Math.max(updatedLoan.remainingInstallments - 1, 0);
                updatedLoan.status = updatedLoan.remainingAmount <= 0 ? 'completed' : 'active';
                updatedLoan.lastPaymentDate = new Date().toISOString().split('T')[0];
                updatedLoan.updatedAt = new Date().toISOString();
                
                // تحديث القرض في المصفوفة
                employeeLoans[loanIndex] = updatedLoan;
                
                // حفظ البيانات في التخزين المحلي
                saveToLocalStorage('employeeLoans', employeeLoans);
            }
        } else {
            // تحديث بيانات السلفة
            const advanceIndex = salaryAdvances.findIndex(adv => adv.id === loanId);
            if (advanceIndex !== -1) {
                const updatedAdvance = { ...salaryAdvances[advanceIndex] };
                updatedAdvance.paidAmount = (updatedAdvance.paidAmount || 0) + finalPaymentAmount;
                updatedAdvance.remainingAmount = updatedAdvance.amount - updatedAdvance.paidAmount;
                updatedAdvance.remainingInstallments = Math.max(updatedAdvance.remainingInstallments - 1, 0);
                updatedAdvance.status = updatedAdvance.remainingAmount <= 0 ? 'completed' : 'active';
                updatedAdvance.lastPaymentDate = new Date().toISOString().split('T')[0];
                updatedAdvance.updatedAt = new Date().toISOString();
                
                // تحديث السلفة في المصفوفة
                salaryAdvances[advanceIndex] = updatedAdvance;
                
                // حفظ البيانات في التخزين المحلي
                saveToLocalStorage('salaryAdvances', salaryAdvances);
            }
        }
        
        // تحديث عرض البيانات
        renderAdvancesLoansTable();
        
        showToast(`تم تسجيل دفعة بقيمة ${formatCurrency(finalPaymentAmount)} بنجاح`, 'success');
        
        return true;
    } catch (error) {
        console.error('خطأ في تسجيل الدفعة:', error);
        showToast(`حدث خطأ أثناء تسجيل الدفعة: ${error.message}`, 'error');
        return false;
    }
}

/**
 * عرض تفاصيل الموظف
 * @param {string} employeeId - معرف الموظف
 */
function showEmployeeDetails(employeeId) {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showToast('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // تحديث عنوان النافذة
    document.querySelector('#employee-details-modal .modal-title').textContent = `تفاصيل الموظف - ${employee.name}`;
    
    // إعداد محتوى التفاصيل
    const detailsContainer = document.getElementById('employee-details-content');
    if (!detailsContainer) return;
    
    // تحميل صورة الموظف
    const hasPhoto = employee.documents && employee.documents.photo;
    
    // إنشاء محتوى التفاصيل
    let html = `
        <div class="employee-profile">
            <div class="employee-photo">
                ${hasPhoto ? 
                    `<img src="${employee.documents.photo}" alt="${employee.name}" />` : 
                    `<div class="employee-photo-placeholder"><i class="fas fa-user"></i></div>`
                }
            </div>
            <div class="employee-info">
                <h2 class="employee-name">${employee.name}</h2>
                <p class="employee-job-title">${employee.jobTitle}</p>
                <span class="employee-status ${employee.status}">${getStatusText(employee.status)}</span>
            </div>
        </div>
        
        <div class="employee-details-grid">
            <!-- المعلومات الشخصية -->
            <div class="employee-detail-card">
                <h4><i class="fas fa-user"></i> معلومات شخصية</h4>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">رقم الهاتف</div>
                    <div class="employee-detail-value">${employee.phone}</div>
                </div>
                ${employee.altPhone ? `
                <div class="employee-detail-item">
                    <div class="employee-detail-label">رقم بديل</div>
                    <div class="employee-detail-value">${employee.altPhone}</div>
                </div>
                ` : ''}
                <div class="employee-detail-item">
                    <div class="employee-detail-label">البريد الإلكتروني</div>
                    <div class="employee-detail-value">${employee.email || '-'}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">العنوان</div>
                    <div class="employee-detail-value">${employee.address || '-'}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">تاريخ الميلاد</div>
                    <div class="employee-detail-value">${formatDate(employee.birthdate) || '-'}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">الجنس</div>
                    <div class="employee-detail-value">${employee.gender === 'male' ? 'ذكر' : 'أنثى'}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">الحالة الاجتماعية</div>
                    <div class="employee-detail-value">${getMaritalStatusText(employee.maritalStatus)}</div>
                </div>
            </div>
            
            <!-- المعلومات الوظيفية -->
            <div class="employee-detail-card">
                <h4><i class="fas fa-briefcase"></i> معلومات وظيفية</h4>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">المسمى الوظيفي</div>
                    <div class="employee-detail-value">${employee.jobTitle}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">القسم</div>
                    <div class="employee-detail-value">${getArabicDepartmentName(employee.department)}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">المدير المباشر</div>
                    <div class="employee-detail-value">${getManagerName(employee.managerId) || '-'}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">تاريخ التعيين</div>
                    <div class="employee-detail-value">${formatDate(employee.hireDate) || '-'}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">تاريخ انتهاء العقد</div>
                    <div class="employee-detail-value">${formatDate(employee.contractEnd) || '-'}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">نوع العقد</div>
                    <div class="employee-detail-value">${getContractTypeText(employee.contractType)}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">ساعات العمل</div>
                    <div class="employee-detail-value">${employee.workHours || '8'} ساعة</div>
                </div>
            </div>
        </div>
        
        <div class="employee-details-grid">
            <!-- المعلومات المالية -->
            <div class="employee-detail-card">
                <h4><i class="fas fa-money-bill-wave"></i> معلومات مالية</h4>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">الراتب الأساسي</div>
                    <div class="employee-detail-value">${formatCurrency(employee.basicSalary || 0)}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">بدل السكن</div>
                    <div class="employee-detail-value">${formatCurrency(employee.housingAllowance || 0)}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">بدل النقل</div>
                    <div class="employee-detail-value">${formatCurrency(employee.transportationAllowance || 0)}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">بدلات أخرى</div>
                    <div class="employee-detail-value">${formatCurrency(employee.otherAllowances || 0)}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">نسبة العمولة</div>
                    <div class="employee-detail-value">${employee.commissionRate || 0}%</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">طريقة الدفع</div>
                    <div class="employee-detail-value">${getPaymentMethodText(employee.paymentMethod)}</div>
                </div>
                ${employee.bankName ? `
                <div class="employee-detail-item">
                    <div class="employee-detail-label">البنك</div>
                    <div class="employee-detail-value">${employee.bankName}</div>
                </div>
                ` : ''}
                ${employee.bankAccount ? `
                <div class="employee-detail-item">
                    <div class="employee-detail-label">رقم الحساب</div>
                    <div class="employee-detail-value">${employee.bankAccount}</div>
                </div>
                ` : ''}
                ${employee.financialNotes ? `
                <div class="employee-detail-item">
                    <div class="employee-detail-label">ملاحظات مالية</div>
                    <div class="employee-detail-value">${employee.financialNotes}</div>
                </div>
                ` : ''}
            </div>
            
            <!-- الوثائق والمستندات -->
            <div class="employee-detail-card">
                <h4><i class="fas fa-file-alt"></i> الوثائق والمستندات</h4>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">رقم الهوية</div>
                    <div class="employee-detail-value">${employee.idNumber || '-'}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">تاريخ انتهاء الهوية</div>
                    <div class="employee-detail-value">${formatDate(employee.idExpiry) || '-'}</div>
                </div>
                
                <!-- عرض المستندات إذا كانت موجودة -->
                ${employee.documents ? `
                <div class="documents-container">
                    ${employee.documents.idCard ? `
                    <div class="document-card">
                        <div class="document-card-header">
                            <span>صورة الهوية</span>
                            <div class="document-card-actions">
                                <button type="button" title="عرض" onclick="openDocumentInNewTab('${employee.documents.idCard}')">
                                    <i class="fas fa-external-link-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="document-card-body">
                            <img src="${employee.documents.idCard}" alt="صورة الهوية" />
                        </div>
                    </div>
                    ` : ''}
                    
                    ${employee.documents.certificate ? `
                    <div class="document-card">
                        <div class="document-card-header">
                            <span>الشهادة العلمية</span>
                            <div class="document-card-actions">
                                <button type="button" title="عرض" onclick="openDocumentInNewTab('${employee.documents.certificate}')">
                                    <i class="fas fa-external-link-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="document-card-body">
                            ${employee.documents.certificate.startsWith('data:image') ? 
                                `<img src="${employee.documents.certificate}" alt="الشهادة العلمية" />` : 
                                `<div class="document-placeholder">
                                    <i class="fas fa-file-pdf"></i>
                                    <div>ملف الشهادة</div>
                                </div>`
                            }
                        </div>
                    </div>
                    ` : ''}
                    
                    ${employee.documents.contract ? `
                    <div class="document-card">
                        <div class="document-card-header">
                            <span>عقد العمل</span>
                            <div class="document-card-actions">
                                <button type="button" title="عرض" onclick="openDocumentInNewTab('${employee.documents.contract}')">
                                    <i class="fas fa-external-link-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="document-card-body">
                            ${employee.documents.contract.startsWith('data:image') ? 
                                `<img src="${employee.documents.contract}" alt="عقد العمل" />` : 
                                `<div class="document-placeholder">
                                    <i class="fas fa-file-pdf"></i>
                                    <div>ملف العقد</div>
                                </div>`
                            }
                        </div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
                ${employee.notes ? `
                <div class="employee-detail-item mt-3">
                    <div class="employee-detail-label">ملاحظات</div>
                    <div class="employee-detail-value">${employee.notes}</div>
                </div>
                ` : ''}
            </div>
        </div>
        
        <!-- سجل الرواتب -->
        <div class="employee-detail-card">
            <h4><i class="fas fa-history"></i> سجل الرواتب</h4>
            ${getEmployeeSalaryHistory(employeeId)}
        </div>
        
        <!-- السلف والقروض -->
        <div class="employee-detail-card">
            <h4><i class="fas fa-hand-holding-usd"></i> السلف والقروض</h4>
            ${getEmployeeLoansAndAdvances(employeeId)}
        </div>
        
        <!-- الإجازات -->
        <div class="employee-detail-card">
            <h4><i class="fas fa-calendar-alt"></i> سجل الإجازات</h4>
            ${getEmployeeVacations(employeeId)}
        </div>
    `;
    
    // عرض المحتوى
    detailsContainer.innerHTML = html;
    
    // إضافة مستمعي أحداث للأزرار
    const editButton = document.getElementById('edit-employee-btn');
    const paySalaryButton = document.getElementById('employee-pay-salary-btn');
    const deleteButton = document.getElementById('delete-employee-btn');
    
    if (editButton) {
        editButton.onclick = () => {
            closeModal('employee-details-modal');
            openEditEmployeeModal(employeeId);
        };
    }
    
    if (paySalaryButton) {
        paySalaryButton.onclick = () => {
            closeModal('employee-details-modal');
            openPaySalaryModal(employeeId);
        };
    }
    
    if (deleteButton) {
        deleteButton.onclick = () => {
            closeModal('employee-details-modal');
            confirmDeleteEmployee(employeeId);
        };
    }
    
    // فتح النافذة
    openModal('employee-details-modal');
}

/**
 * الحصول على سجل رواتب الموظف
 * @param {string} employeeId - معرف الموظف
 * @returns {string} - سجل الرواتب بتنسيق HTML
 */
function getEmployeeSalaryHistory(employeeId) {
    // تصفية معاملات الرواتب للموظف
    const employeeSalaries = salaryTransactions.filter(tx => tx.employeeId === employeeId);
    
    if (employeeSalaries.length === 0) {
        return '<p class="text-center text-muted">لا توجد سجلات رواتب لهذا الموظف</p>';
    }
    
    // ترتيب المعاملات (الأحدث أولاً)
    employeeSalaries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // إنشاء جدول الرواتب
    let html = `
        <div class="table-container">
            <table class="table-hover">
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>الشهر</th>
                        <th>الراتب الأساسي</th>
                        <th>البدلات</th>
                        <th>المبيعات</th>
                        <th>العمولة</th>
                        <th>الإجمالي</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // إضافة المعاملات
    employeeSalaries.forEach(salary => {
        html += `
            <tr>
                <td>${formatDate(salary.date)}</td>
                <td>${getArabicMonthName(salary.month)} ${salary.year}</td>
                <td>${formatCurrency(salary.basicSalary || 0)}</td>
                <td>${formatCurrency(salary.allowances || 0)}</td>
                <td>${formatCurrency(salary.sales || 0)}</td>
                <td>${formatCurrency(salary.commissionAmount || 0)}</td>
                <td>${formatCurrency(salary.totalSalary || 0)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view view-salary" data-id="${salary.id}" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

/**
 * الحصول على السلف والقروض للموظف
 * @param {string} employeeId - معرف الموظف
 * @returns {string} - السلف والقروض بتنسيق HTML
 */
function getEmployeeLoansAndAdvances(employeeId) {
    // تصفية السلف والقروض للموظف
    const employeeAdvances = salaryAdvances.filter(adv => adv.employeeId === employeeId);
    const employeeLoansData = employeeLoans.filter(loan => loan.employeeId === employeeId);
    
    if (employeeAdvances.length === 0 && employeeLoansData.length === 0) {
        return '<p class="text-center text-muted">لا توجد سلف أو قروض لهذا الموظف</p>';
    }
    
    // دمج وترتيب السلف والقروض (الأحدث أولاً)
    const allItems = [...employeeAdvances.map(adv => ({ ...adv, type: 'advance' })), 
                      ...employeeLoansData.map(loan => ({ ...loan, type: 'loan' }))];
    
    allItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // إنشاء جدول السلف والقروض
    let html = `
        <div class="table-container">
            <table class="table-hover">
                <thead>
                    <tr>
                        <th>النوع</th>
                        <th>التاريخ</th>
                        <th>المبلغ</th>
                        <th>المدفوع</th>
                        <th>المتبقي</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // إضافة العناصر
    allItems.forEach(item => {
        // تحديد النوع
        const typeText = item.type === 'advance' ? 'سلفة' : 'قرض';
        const typeClass = item.type === 'advance' ? 'info' : 'primary';
        
        // حساب المبلغ المتبقي
        const remainingAmount = item.remainingAmount || (item.amount - (item.paidAmount || 0));
        
        // تحديد حالة العنصر
        const statusClass = getStatusClass(item.status);
        const statusText = getStatusText(item.status, 'loan');
        
        html += `
            <tr>
                <td><span class="badge badge-${typeClass}">${typeText}</span></td>
                <td>${formatDate(item.date)}</td>
                <td>${formatCurrency(item.amount || 0)}</td>
                <td>${formatCurrency(item.paidAmount || 0)}</td>
                <td>${formatCurrency(remainingAmount)}</td>
                <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view view-loan" data-id="${item.id}" data-type="${item.type}" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${item.status === 'active' && remainingAmount > 0 ? `
                        <button class="action-btn pay-installment" data-id="${item.id}" data-type="${item.type}" title="تسجيل دفعة">
                            <i class="fas fa-money-bill"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

/**
 * الحصول على سجل إجازات الموظف
 * @param {string} employeeId - معرف الموظف
 * @returns {string} - سجل الإجازات بتنسيق HTML
 */
function getEmployeeVacations(employeeId) {
    // تصفية طلبات الإجازات للموظف
    const employeeVacations = vacationRequests.filter(req => req.employeeId === employeeId);
    
    if (employeeVacations.length === 0) {
        return '<p class="text-center text-muted">لا توجد سجلات إجازات لهذا الموظف</p>';
    }
    
    // ترتيب الطلبات (الأحدث أولاً)
    employeeVacations.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    
    // إنشاء جدول الإجازات
    let html = `
        <div class="table-container">
            <table class="table-hover">
                <thead>
                    <tr>
                        <th>النوع</th>
                        <th>من تاريخ</th>
                        <th>إلى تاريخ</th>
                        <th>المدة</th>
                        <th>تاريخ الطلب</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // إضافة الطلبات
    employeeVacations.forEach(vacation => {
        // تحديد نوع الإجازة
        const vacationType = getVacationTypeText(vacation.type);
        
        // تحديد حالة الطلب
        const statusClass = getVacationStatusClass(vacation.status);
        const statusText = getVacationStatusText(vacation.status);
        
        html += `
            <tr>
                <td>${vacationType}</td>
                <td>${formatDate(vacation.startDate)}</td>
                <td>${formatDate(vacation.endDate)}</td>
                <td>${vacation.days} يوم</td>
                <td>${formatDate(vacation.requestDate)}</td>
                <td><span class="badge badge-${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

/**
 * عرض تفاصيل الراتب
 * @param {string} salaryId - معرف معاملة الراتب
 */
function showSalaryDetails(salaryId) {
    const transaction = salaryTransactions.find(tx => tx.id === salaryId);
    if (!transaction) {
        showToast('لم يتم العثور على معاملة الراتب', 'error');
        return;
    }
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === transaction.employeeId);
    
    // تحديث عنوان النافذة
    document.querySelector('#salary-details-modal .modal-title').textContent = `تفاصيل راتب - ${transaction.employeeName}`;
    
    // إعداد محتوى التفاصيل
    const detailsContainer = document.getElementById('salary-details-content');
    if (!detailsContainer) return;
    
    // إنشاء محتوى إيصال الراتب
    let html = `
        <div class="receipt-container">
            <div class="receipt-header">
                <div class="receipt-company-logo">
                    <img src="assets/images/logo.png" alt="شعار الشركة" onerror="this.style.display='none'">
                </div>
                <h1 class="receipt-title">إيصال صرف راتب</h1>
                <p class="receipt-subtitle">نظام إدارة الموظفين المتكامل</p>
            </div>
            
            <div class="receipt-info">
                <div class="receipt-employee-info">
                    <h3 class="receipt-employee-name">${transaction.employeeName}</h3>
                    <p class="receipt-employee-job">${employee ? employee.jobTitle : 'موظف'}</p>
                    <p>القسم: ${employee ? getArabicDepartmentName(employee.department) : '-'}</p>
                </div>
                <div class="receipt-date">
                    <p><strong>رقم الإيصال:</strong> ${transaction.id}</p>
                    <p><strong>تاريخ الصرف:</strong> ${formatDate(transaction.date)}</p>
                    <p><strong>الشهر:</strong> ${getArabicMonthName(transaction.month)} ${transaction.year}</p>
                </div>
            </div>
            
            <div class="receipt-details">
                <table>
                    <tr>
                        <th width="60%">البند</th>
                        <th width="40%">القيمة</th>
                    </tr>
                    <tr>
                        <td>الراتب الأساسي</td>
                        <td>${formatCurrency(transaction.basicSalary || 0)}</td>
                    </tr>
                    ${transaction.allowances > 0 ? `
                    <tr>
                        <td>البدلات</td>
                        <td>${formatCurrency(transaction.allowances || 0)}</td>
                    </tr>
                    ` : ''}
                    ${transaction.sales > 0 ? `
                    <tr>
                        <td>المبيعات</td>
                        <td>${formatCurrency(transaction.sales || 0)}</td>
                    </tr>
                    <tr>
                        <td>نسبة العمولة (${transaction.commissionRate || 0}%)</td>
                        <td>${formatCurrency(transaction.commissionAmount || 0)}</td>
                    </tr>
                    ` : ''}
                    ${transaction.bonus > 0 ? `
                    <tr>
                        <td>المكافآت</td>
                        <td>${formatCurrency(transaction.bonus || 0)}</td>
                    </tr>
                    ` : ''}
                    ${transaction.deductions > 0 ? `
                    <tr>
                        <td>الاستقطاعات</td>
                        <td>${formatCurrency(transaction.deductions || 0)}</td>
                    </tr>
                    ` : ''}
                    ${transaction.loanDeductions > 0 ? `
                    <tr>
                        <td>خصم القروض والسلف</td>
                        <td>${formatCurrency(transaction.loanDeductions || 0)}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>
            
            <div class="receipt-total">
                <p class="receipt-total-label">إجمالي الراتب</p>
                <h2 class="receipt-total-amount">${formatCurrency(transaction.totalSalary || 0)}</h2>
                <p class="receipt-total-text">${numberToWords(transaction.totalSalary || 0)} دينار فقط لا غير</p>
            </div>
            
            ${transaction.notes ? `
            <div class="receipt-notes">
                <p><strong>ملاحظات:</strong> ${transaction.notes}</p>
            </div>
            ` : ''}
            
            <div class="receipt-signature">
                <div class="signature-box">
                    <p>توقيع الموظف</p>
                </div>
                <div class="signature-box">
                    <p>توقيع المدير المالي</p>
                </div>
                <div class="signature-box">
                    <p>ختم الشركة</p>
                </div>
            </div>
            
            <div class="receipt-footer">
                <p>تم إصدار هذا الإيصال بواسطة نظام إدارة الموظفين المتكامل</p>
                <p>${formatDate(new Date())}</p>
            </div>
        </div>
    `;
    
    // عرض المحتوى
    detailsContainer.innerHTML = html;
    
    // فتح النافذة
    openModal('salary-details-modal');
}

/**
 * تحديث معلومات راتب الموظف في نموذج صرف الراتب
 */
function updateEmployeeSalaryInfo() {
    const employeeSelect = document.getElementById('salary-employee');
    const salaryInfoContainer = document.getElementById('employee-salary-info');
    
    if (!employeeSelect || !salaryInfoContainer) return;
    
    const employeeId = employeeSelect.value;
    
    if (!employeeId) {
        salaryInfoContainer.style.display = 'none';
        return;
    }
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        salaryInfoContainer.style.display = 'none';
        return;
    }
    
    // حساب إجمالي البدلات
    const totalAllowances = (parseFloat(employee.housingAllowance) || 0) + 
                           (parseFloat(employee.transportationAllowance) || 0) + 
                           (parseFloat(employee.otherAllowances) || 0);
    
    // تحديث معلومات الموظف
    salaryInfoContainer.innerHTML = `
        <div class="employee-info-header">
            <div class="employee-avatar">${employee.name.charAt(0)}</div>
            <div class="employee-info-details">
                <div class="employee-info-name">${employee.name}</div>
                <div class="employee-info-position">${employee.jobTitle}</div>
            </div>
        </div>
        <div class="employee-info-grid">
            <div class="employee-info-item">
                <span class="employee-info-label">الراتب الأساسي</span>
                <span class="employee-info-value">${formatCurrency(employee.basicSalary || 0)}</span>
            </div>
            <div class="employee-info-item">
                <span class="employee-info-label">البدلات</span>
                <span class="employee-info-value">${formatCurrency(totalAllowances)}</span>
            </div>
            <div class="employee-info-item">
                <span class="employee-info-label">نسبة العمولة</span>
                <span class="employee-info-value">${employee.commissionRate || 0}%</span>
            </div>
            <div class="employee-info-item">
                <span class="employee-info-label">تاريخ التعيين</span>
                <span class="employee-info-value">${formatDate(employee.hireDate || '')}</span>
            </div>
        </div>
    `;
    
    // عرض معلومات الموظف
    salaryInfoContainer.style.display = 'block';
    
    // تحديث قيم النموذج
    document.getElementById('salary-basic').value = employee.basicSalary || 0;
    document.getElementById('salary-allowances').value = totalAllowances;
    document.getElementById('salary-commission-rate').value = employee.commissionRate || 0;
    
    // البحث عن القروض والسلف النشطة للموظف
    loadActiveLoans(employeeId);
    
    // تحديث حساب الراتب الإجمالي
    calculateTotalSalary();
}

/**
 * تحميل القروض والسلف النشطة للموظف
 * @param {string} employeeId - معرف الموظف
 */
function loadActiveLoans(employeeId) {
    const loansContainer = document.getElementById('employee-active-loans');
    if (!loansContainer) return;
    
    // تصفية القروض والسلف النشطة للموظف
    const activeLoans = employeeLoans.filter(loan => 
        loan.employeeId === employeeId && loan.status === 'active' && loan.remainingAmount > 0
    );
    
    const activeAdvances = salaryAdvances.filter(advance => 
        advance.employeeId === employeeId && advance.status === 'active' && advance.remainingAmount > 0
    );
    
    // دمج القروض والسلف
    const allItems = [
        ...activeLoans.map(loan => ({ ...loan, type: 'loan' })),
        ...activeAdvances.map(advance => ({ ...advance, type: 'advance' }))
    ];
    
    if (allItems.length === 0) {
        loansContainer.innerHTML = '';
        return;
    }
    
    // إنشاء قائمة القروض والسلف
    let html = `
        <h4>القروض والسلف النشطة</h4>
        <ul class="active-loans-list">
    `;
    
    allItems.forEach(item => {
        // تحديد النوع
        const typeText = item.type === 'loan' ? 'قرض' : 'سلفة';
        
        // حساب المبلغ المتبقي والقسط
        const remainingAmount = item.remainingAmount || (item.amount - (item.paidAmount || 0));
        const installmentAmount = item.installmentAmount || (remainingAmount / (item.remainingInstallments || 1));
        
        html += `
            <li class="active-loan-item">
                <div class="loan-details">
                    <div class="loan-title">${typeText} بمبلغ ${formatCurrency(item.amount || 0)}</div>
                    <div class="loan-info">
                        <span>متبقي: <span class="loan-amount">${formatCurrency(remainingAmount)}</span></span>
                        <span>القسط: <span class="loan-amount">${formatCurrency(installmentAmount)}</span></span>
                    </div>
                </div>
                <div class="loan-deduct-action">
                    <label class="checkbox-container">
                        <input type="checkbox" name="deduct-loan" value="${item.id}" data-type="${item.type}" data-amount="${installmentAmount}" checked />
                        <span class="checkbox-text">خصم القسط</span>
                    </label>
                </div>
            </li>
        `;
    });
    
    html += `</ul>`;
    
    // عرض القائمة
    loansContainer.innerHTML = html;
    
    // إضافة مستمع حدث لخانات الاختيار
    document.querySelectorAll('input[name="deduct-loan"]').forEach(checkbox => {
        checkbox.addEventListener('change', calculateTotalSalary);
    });
}

/**
 * حساب إجمالي الراتب في نموذج صرف الراتب
 */
function calculateTotalSalary() {
    // قراءة القيم من الحقول
    const baseSalary = parseFloat(document.getElementById('salary-basic').value) || 0;
    const allowances = parseFloat(document.getElementById('salary-allowances').value) || 0;
    const sales = parseFloat(document.getElementById('salary-sales').value) || 0;
    const commissionRate = parseFloat(document.getElementById('salary-commission-rate').value) || 0;
    const bonus = parseFloat(document.getElementById('salary-bonus').value) || 0;
    const deductions = parseFloat(document.getElementById('salary-deductions').value) || 0;
    
    // حساب العمولة
    const commissionAmount = sales * (commissionRate / 100);
    document.getElementById('salary-commission-amount').value = commissionAmount.toFixed(2);
    
    // حساب إجمالي خصومات القروض
    let loanDeductions = 0;
    document.querySelectorAll('input[name="deduct-loan"]:checked').forEach(checkbox => {
        loanDeductions += parseFloat(checkbox.getAttribute('data-amount')) || 0;
    });
    
    // حساب إجمالي الراتب
    const totalSalary = baseSalary + allowances + commissionAmount + bonus - deductions - loanDeductions;
    
    // عرض إجمالي الراتب
    document.getElementById('salary-total').textContent = formatCurrency(totalSalary);
    
    // عرض تفاصيل الحساب
    const calculationText = `
        ${formatCurrency(baseSalary)} (الراتب الأساسي) + 
        ${formatCurrency(allowances)} (البدلات) + 
        ${formatCurrency(commissionAmount)} (العمولة: ${sales} × ${commissionRate}%) + 
        ${formatCurrency(bonus)} (المكافآت) - 
        ${formatCurrency(deductions)} (الاستقطاعات) - 
        ${formatCurrency(loanDeductions)} (أقساط القروض والسلف)
    `;
    
    document.getElementById('salary-calculation').textContent = calculationText;
}

/**
 * حساب تفاصيل القرض
 */
function calculateLoanDetails() {
    const loanAmount = parseFloat(document.getElementById('loan-amount').value) || 0;
    const installments = parseInt(document.getElementById('loan-installments').value) || 1;
    const interestRate = parseFloat(document.getElementById('loan-interest-rate').value) || 0;
    
    // التحقق من صحة البيانات
    if (loanAmount <= 0 || installments <= 0) {
        return;
    }
    
    // حساب المبلغ الإجمالي مع الفائدة
    const totalAmount = loanAmount * (1 + interestRate / 100);
    
    // حساب قيمة القسط
    const installmentAmount = totalAmount / installments;
    
    // عرض ملخص القرض
    const loanSummary = document.getElementById('loan-summary');
    if (loanSummary) {
        loanSummary.innerHTML = `
            <h4>ملخص القرض</h4>
            <div class="loan-summary-grid">
                <div class="loan-summary-item">
                    <span class="loan-summary-label">المبلغ الأساسي</span>
                    <span class="loan-summary-value">${formatCurrency(loanAmount)}</span>
                </div>
                <div class="loan-summary-item">
                    <span class="loan-summary-label">الفائدة</span>
                    <span class="loan-summary-value">${formatCurrency(totalAmount - loanAmount)}</span>
                </div>
                <div class="loan-summary-item">
                    <span class="loan-summary-label">قيمة القسط</span>
                    <span class="loan-summary-value">${formatCurrency(installmentAmount)}</span>
                </div>
            </div>
            <div class="loan-summary-calculations">
                <div class="loan-summary-total">
                    إجمالي المبلغ المستحق: ${formatCurrency(totalAmount)}
                </div>
            </div>
        `;
    }
}

/**
 * حساب أيام الإجازة
 */
function calculateVacationDays() {
    const startDate = document.getElementById('vacation-start-date')?.value;
    const endDate = document.getElementById('vacation-end-date')?.value;
    
    if (!startDate || !endDate) return;
    
    // حساب الفرق بالأيام
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // التحقق من صحة التواريخ
    if (start > end) {
        document.getElementById('vacation-days').value = 0;
        return;
    }
    
    // حساب عدد الأيام (شامل يوم البداية والنهاية)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    document.getElementById('vacation-days').value = diffDays;
}

/**
 * تحديث حالة طلب الإجازة
 * @param {string} vacationId - معرف طلب الإجازة
 * @param {string} status - الحالة الجديدة
 */
function updateVacationStatus(vacationId, status) {
    const vacationIndex = vacationRequests.findIndex(req => req.id === vacationId);
    if (vacationIndex === -1) {
        showToast('لم يتم العثور على طلب الإجازة', 'error');
        return;
    }
    
    // تحديث حالة الطلب
    vacationRequests[vacationIndex].status = status;
    vacationRequests[vacationIndex].updatedAt = new Date().toISOString();
    
    // إذا تم قبول الطلب، قم بتحديث حالة الموظف إذا كانت الإجازة الحالية
    if (status === 'approved') {
        const vacation = vacationRequests[vacationIndex];
        const today = new Date().toISOString().split('T')[0];
        const startDate = vacation.startDate;
        const endDate = vacation.endDate;
        
        if (today >= startDate && today <= endDate) {
            // تحديث حالة الموظف إلى "في إجازة"
            const employeeIndex = employees.findIndex(emp => emp.id === vacation.employeeId);
            if (employeeIndex !== -1) {
                employees[employeeIndex].status = 'on-leave';
                saveToLocalStorage('employeesData', employees);
            }
        }
    }
    
    // حفظ البيانات
    saveToLocalStorage('vacationRequests', vacationRequests);
    
    // تحديث العرض
    renderVacationRequestsTable();
    
    // عرض رسالة نجاح
    const statusText = status === 'approved' ? 'قبول' : 'رفض';
    showToast(`تم ${statusText} طلب الإجازة بنجاح`, 'success');
}

// ===== وظائف التصدير والطباعة =====

/**
 * تصدير بيانات الموظفين
 * @param {string} format - صيغة التصدير (excel/csv/pdf)
 */
function exportEmployees(format) {
    const employeesData = employees.map(employee => ({
        الاسم: employee.name,
        'رقم الهاتف': employee.phone,
        'البريد الإلكتروني': employee.email || '',
        العنوان: employee.address || '',
        'المسمى الوظيفي': employee.jobTitle,
        القسم: getArabicDepartmentName(employee.department),
        'الراتب الأساسي': employee.basicSalary || 0,
        'تاريخ التعيين': formatDate(employee.hireDate) || '',
        الحالة: getStatusText(employee.status)
    }));
    
    if (format === 'excel') {
        exportToExcel(employeesData, 'بيانات_الموظفين');
    } else if (format === 'csv') {
        exportToCsv(employeesData, 'بيانات_الموظفين');
    } else if (format === 'pdf') {
        exportToPdf(employeesData, 'بيانات_الموظفين', 'قائمة الموظفين');
    }
}

/**
 * تصدير سجلات الرواتب
 * @param {string} format - صيغة التصدير (excel/csv/pdf)
 */
function exportSalaries(format) {
    const salariesData = salaryTransactions.map(salary => ({
        الموظف: salary.employeeName,
        الشهر: getArabicMonthName(salary.month),
        السنة: salary.year,
        'تاريخ الصرف': formatDate(salary.date),
        'الراتب الأساسي': salary.basicSalary || 0,
        البدلات: salary.allowances || 0,
        المبيعات: salary.sales || 0,
        'نسبة العمولة': salary.commissionRate || 0,
        'مبلغ العمولة': salary.commissionAmount || 0,
        الاستقطاعات: salary.deductions || 0,
        'الراتب الإجمالي': salary.totalSalary || 0
    }));
    
    if (format === 'excel') {
        exportToExcel(salariesData, 'سجلات_الرواتب');
    } else if (format === 'csv') {
        exportToCsv(salariesData, 'سجلات_الرواتب');
    } else if (format === 'pdf') {
        exportToPdf(salariesData, 'سجلات_الرواتب', 'سجل الرواتب');
    }
}

/**
 * تصدير إلى ملف Excel
 * @param {Array} data - البيانات المراد تصديرها
 * @param {string} fileName - اسم الملف
 */
function exportToExcel(data, fileName) {
    try {
        // في الواقع، ستحتاج إلى مكتبة خارجية مثل SheetJS
        // هذه مجرد محاكاة بسيطة
        showToast('جاري تصدير البيانات إلى Excel...', 'info');
        setTimeout(() => {
            showToast('تم تصدير البيانات إلى Excel بنجاح', 'success');
        }, 1000);
    } catch (error) {
        console.error('خطأ في تصدير البيانات إلى Excel:', error);
        showToast('حدث خطأ أثناء تصدير البيانات', 'error');
    }
}

/**
 * تصدير إلى ملف CSV
 * @param {Array} data - البيانات المراد تصديرها
 * @param {string} fileName - اسم الملف
 */
function exportToCsv(data, fileName) {
    try {
        if (data.length === 0) {
            showToast('لا توجد بيانات للتصدير', 'warning');
            return;
        }
        
        // استخراج الحقول
        const headers = Object.keys(data[0]);
        
        // إنشاء محتوى CSV
        let csvContent = headers.join(',') + '\n';
        
        data.forEach(item => {
            const row = headers.map(header => {
                // تنظيف القيمة (إزالة الفواصل والأسطر الجديدة)
                const value = String(item[header] || '')
                    .replace(/,/g, ' ')
                    .replace(/\n/g, ' ');
                
                // إحاطة القيمة بعلامات اقتباس
                return `"${value}"`;
            });
            
            csvContent += row.join(',') + '\n';
        });
        
        // إنشاء Blob وتنزيل الملف
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.csv`);
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('تم تصدير البيانات إلى CSV بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في تصدير البيانات إلى CSV:', error);
        showToast('حدث خطأ أثناء تصدير البيانات', 'error');
    }
}

/**
 * تصدير إلى ملف PDF
 * @param {Array} data - البيانات المراد تصديرها
 * @param {string} fileName - اسم الملف
 * @param {string} title - عنوان المستند
 */
function exportToPdf(data, fileName, title) {
    try {
        // في الواقع، ستحتاج إلى مكتبة خارجية مثل jsPDF
        // هذه مجرد محاكاة بسيطة
        showToast('جاري تصدير البيانات إلى PDF...', 'info');
        setTimeout(() => {
            showToast('تم تصدير البيانات إلى PDF بنجاح', 'success');
        }, 1000);
    } catch (error) {
        console.error('خطأ في تصدير البيانات إلى PDF:', error);
        showToast('حدث خطأ أثناء تصدير البيانات', 'error');
    }
}

/**
 * طباعة قائمة الموظفين
 */
function printEmployeesList() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showToast('يرجى السماح بنوافذ منبثقة للطباعة', 'warning');
        return;
    }
    
    // إنشاء محتوى الطباعة
    let printContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <title>قائمة الموظفين</title>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    direction: rtl;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }
                th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                }
                .print-date {
                    text-align: left;
                    margin-bottom: 20px;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="print-date">تاريخ الطباعة: ${formatDate(new Date())}</div>
            <h1>قائمة الموظفين</h1>
            <table>
                <thead>
                    <tr>
                        <th>م</th>
                        <th>الاسم</th>
                        <th>المسمى الوظيفي</th>
                        <th>القسم</th>
                        <th>رقم الهاتف</th>
                        <th>تاريخ التعيين</th>
                        <th>الراتب الأساسي</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // إضافة الموظفين
    employees.forEach((employee, index) => {
        printContent += `
            <tr>
                <td>${index + 1}</td>
                <td>${employee.name}</td>
                <td>${employee.jobTitle}</td>
                <td>${getArabicDepartmentName(employee.department)}</td>
                <td>${employee.phone}</td>
                <td>${formatDate(employee.hireDate)}</td>
                <td>${formatCurrency(employee.basicSalary || 0)}</td>
                <td>${getStatusText(employee.status)}</td>
            </tr>
        `;
    });
    
    printContent += `
                </tbody>
            </table>
            <div class="footer">
                نظام إدارة الموظفين المتكامل &copy; ${new Date().getFullYear()}
            </div>
        </body>
        </html>
    `;
    
    // كتابة المحتوى وطباعته
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
 // الانتظار لتحميل الصفحة ثم الطباعة
 printWindow.onload = function() {
    printWindow.print();
    // printWindow.close(); // إغلاق النافذة بعد الطباعة (اختياري)
};
}

/**
* طباعة سجلات الرواتب
*/
function printSalariesList() {
const printWindow = window.open('', '_blank');
if (!printWindow) {
    showToast('يرجى السماح بنوافذ منبثقة للطباعة', 'warning');
    return;
}

// الحصول على قيم التصفية
const monthFilter = document.getElementById('salary-month-filter').value;
const yearFilter = document.getElementById('salary-year-filter').value;

// تصفية المعاملات
let filteredTransactions = [...salaryTransactions];

// تطبيق تصفية الشهر
if (monthFilter !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.month === monthFilter);
}

// تطبيق تصفية السنة
if (yearFilter !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.year === yearFilter);
}

// ترتيب المعاملات (الأحدث أولاً)
filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

// عنوان التقرير
let reportTitle = 'سجل الرواتب';
if (monthFilter !== 'all') {
    reportTitle += ` - شهر ${getArabicMonthName(monthFilter)}`;
}
if (yearFilter !== 'all') {
    reportTitle += ` ${yearFilter}`;
}

// إنشاء محتوى الطباعة
let printContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
        <title>${reportTitle}</title>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                direction: rtl;
            }
            h1 {
                text-align: center;
                margin-bottom: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: right;
            }
            th {
                background-color: #f2f2f2;
                font-weight: bold;
            }
            .summary {
                margin-top: 20px;
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 12px;
            }
            .print-date {
                text-align: left;
                margin-bottom: 20px;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="print-date">تاريخ الطباعة: ${formatDate(new Date())}</div>
        <h1>${reportTitle}</h1>
        <table>
            <thead>
                <tr>
                    <th>م</th>
                    <th>الموظف</th>
                    <th>الشهر</th>
                    <th>تاريخ الصرف</th>
                    <th>الراتب الأساسي</th>
                    <th>البدلات</th>
                    <th>المبيعات</th>
                    <th>العمولة</th>
                    <th>الاستقطاعات</th>
                    <th>الإجمالي</th>
                </tr>
            </thead>
            <tbody>
`;

// إضافة المعاملات
let totalAmount = 0;

filteredTransactions.forEach((transaction, index) => {
    totalAmount += transaction.totalSalary || 0;
    
    printContent += `
        <tr>
            <td>${index + 1}</td>
            <td>${transaction.employeeName}</td>
            <td>${getArabicMonthName(transaction.month)} ${transaction.year}</td>
            <td>${formatDate(transaction.date)}</td>
            <td>${formatCurrency(transaction.basicSalary || 0, false)}</td>
            <td>${formatCurrency(transaction.allowances || 0, false)}</td>
            <td>${formatCurrency(transaction.sales || 0, false)}</td>
            <td>${formatCurrency(transaction.commissionAmount || 0, false)}</td>
            <td>${formatCurrency(transaction.deductions || 0, false)}</td>
            <td>${formatCurrency(transaction.totalSalary || 0, false)}</td>
        </tr>
    `;
});

// إضافة الملخص
printContent += `
            </tbody>
        </table>
        <div class="summary">
            <h3>ملخص التقرير</h3>
            <p>عدد الرواتب: ${filteredTransactions.length}</p>
            <p>إجمالي المبالغ المصروفة: ${formatCurrency(totalAmount)}</p>
        </div>
        <div class="footer">
            نظام إدارة الموظفين المتكامل &copy; ${new Date().getFullYear()}
        </div>
    </body>
    </html>
`;

// كتابة المحتوى وطباعته
printWindow.document.open();
printWindow.document.write(printContent);
printWindow.document.close();

// الانتظار لتحميل الصفحة ثم الطباعة
printWindow.onload = function() {
    printWindow.print();
    // printWindow.close(); // إغلاق النافذة بعد الطباعة (اختياري)
};
}

/**
* طباعة كشف المستحقات الشهرية
*/
function printPayroll() {
const printWindow = window.open('', '_blank');
if (!printWindow) {
    showToast('يرجى السماح بنوافذ منبثقة للطباعة', 'warning');
    return;
}

// الحصول على الشهر والسنة المحددين
const selectedMonth = document.getElementById('payroll-month-filter').value;
const selectedYear = document.getElementById('payroll-year-filter').value;

// عنوان التقرير
const reportTitle = `كشف مستحقات الموظفين - ${getArabicMonthName(selectedMonth)} ${selectedYear}`;

// الموظفين النشطين
const activeEmployees = employees.filter(emp => emp.status === 'active');

// المعاملات المدفوعة في هذا الشهر
const paidTransactions = salaryTransactions.filter(
    tx => tx.month === selectedMonth && tx.year === selectedYear
);

// إجماليات للتقرير
let totalExpected = 0;
let totalPaid = 0;

// إنشاء محتوى الطباعة
let printContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
        <title>${reportTitle}</title>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                direction: rtl;
            }
            h1 {
                text-align: center;
                margin-bottom: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: right;
            }
            th {
                background-color: #f2f2f2;
                font-weight: bold;
            }
            .status-paid {
                color: #10b981;
                font-weight: bold;
            }
            .status-pending {
                color: #f59e0b;
                font-weight: bold;
            }
            .summary {
                margin-top: 20px;
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 12px;
            }
            .print-date {
                text-align: left;
                margin-bottom: 20px;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="print-date">تاريخ الطباعة: ${formatDate(new Date())}</div>
        <h1>${reportTitle}</h1>
        <table>
            <thead>
                <tr>
                    <th>م</th>
                    <th>الموظف</th>
                    <th>المسمى الوظيفي</th>
                    <th>الراتب الأساسي</th>
                    <th>البدلات</th>
                    <th>العمولة المتوقعة</th>
                    <th>الخصومات</th>
                    <th>صافي المستحق</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
`;

// إضافة الموظفين
activeEmployees.forEach((employee, index) => {
    // التحقق مما إذا كان الراتب مدفوعاً بالفعل
    const isPaid = paidTransactions.some(tx => tx.employeeId === employee.id);
    
    // حساب المستحقات المتوقعة للموظف
    const expectedSalary = calculateExpectedSalary(employee, selectedMonth, selectedYear);
    
    // إضافة للإجماليات
    totalExpected += expectedSalary.netSalary;
    
    if (isPaid) {
        const paidTransaction = paidTransactions.find(tx => tx.employeeId === employee.id);
        totalPaid += paidTransaction.totalSalary;
    }
    
    printContent += `
        <tr>
            <td>${index + 1}</td>
            <td>${employee.name}</td>
            <td>${employee.jobTitle}</td>
            <td>${formatCurrency(employee.basicSalary || 0, false)}</td>
            <td>${formatCurrency(expectedSalary.allowances || 0, false)}</td>
            <td>${formatCurrency(expectedSalary.expectedCommission || 0, false)}</td>
            <td>${formatCurrency(expectedSalary.deductions + expectedSalary.loans || 0, false)}</td>
            <td>${formatCurrency(expectedSalary.netSalary || 0, false)}</td>
            <td class="${isPaid ? 'status-paid' : 'status-pending'}">${isPaid ? 'تم الصرف' : 'مستحق'}</td>
        </tr>
    `;
});

// إضافة الملخص
printContent += `
            </tbody>
        </table>
        <div class="summary">
            <h3>ملخص التقرير</h3>
            <p>عدد الموظفين: ${activeEmployees.length}</p>
            <p>إجمالي المستحقات: ${formatCurrency(totalExpected)}</p>
            <p>إجمالي المصروف: ${formatCurrency(totalPaid)}</p>
            <p>إجمالي المتبقي: ${formatCurrency(totalExpected - totalPaid)}</p>
        </div>
        <div class="footer">
            نظام إدارة الموظفين المتكامل &copy; ${new Date().getFullYear()}
        </div>
    </body>
    </html>
`;

// كتابة المحتوى وطباعته
printWindow.document.open();
printWindow.document.write(printContent);
printWindow.document.close();

// الانتظار لتحميل الصفحة ثم الطباعة
printWindow.onload = function() {
    printWindow.print();
    // printWindow.close(); // إغلاق النافذة بعد الطباعة (اختياري)
};
}

/**
* طباعة تفاصيل الراتب
*/
function printSalaryDetails() {
// استخدام وظيفة الطباعة المدمجة في المتصفح
window.print();
}

/**
* تصدير تفاصيل الراتب كملف PDF
*/
function exportSalaryDetailsPdf() {
// في الواقع، ستحتاج إلى مكتبة خارجية مثل jsPDF
// هذه مجرد محاكاة بسيطة
showToast('جاري تصدير تفاصيل الراتب إلى PDF...', 'info');
setTimeout(() => {
    showToast('تم تصدير تفاصيل الراتب إلى PDF بنجاح', 'success');
}, 1000);
}

/**
* طباعة تفاصيل الموظف
*/
function printEmployeeDetails() {
window.print();
}

/**
* إنشاء تقرير شامل
*/
function generateComprehensiveReport() {
const printWindow = window.open('', '_blank');
if (!printWindow) {
    showToast('يرجى السماح بنوافذ منبثقة للطباعة', 'warning');
    return;
}

// الحصول على الشهر والسنة المحددين
const selectedMonth = document.getElementById('report-month-filter').value;
const selectedYear = document.getElementById('report-year-filter').value;

// تحديد فترة التقرير
const reportPeriod = document.querySelector('[data-report-period].active').getAttribute('data-report-period');

// تحديد عنوان الفترة
let periodTitle = '';
if (reportPeriod === 'monthly') {
    periodTitle = `شهر ${getArabicMonthName(selectedMonth)} ${selectedYear}`;
} else if (reportPeriod === 'quarterly') {
    const quarter = Math.ceil(parseInt(selectedMonth) / 3);
    periodTitle = `الربع ${quarter} من سنة ${selectedYear}`;
} else if (reportPeriod === 'yearly') {
    periodTitle = `سنة ${selectedYear}`;
}

// عنوان التقرير
const reportTitle = `التقرير الشامل للموظفين - ${periodTitle}`;

// إنشاء محتوى الطباعة
let printContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
        <title>${reportTitle}</title>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                direction: rtl;
            }
            h1, h2, h3 {
                text-align: center;
            }
            h1 {
                margin-bottom: 10px;
            }
            h2 {
                margin-top: 40px;
                margin-bottom: 20px;
                color: #3b82f6;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 10px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: right;
            }
            th {
                background-color: #f2f2f2;
                font-weight: bold;
            }
            .summary {
                margin-top: 20px;
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                font-size: 12px;
                border-top: 1px solid #ddd;
                padding-top: 10px;
            }
            .print-date {
                text-align: left;
                margin-bottom: 20px;
                font-size: 12px;
            }
            .report-subtitle {
                text-align: center;
                margin-bottom: 30px;
                color: #64748b;
            }
            .report-section {
                margin-bottom: 40px;
            }
            .chart-placeholder {
                text-align: center;
                padding: 30px;
                background-color: #f1f5f9;
                border: 1px dashed #cbd5e1;
                color: #64748b;
                margin-bottom: 20px;
            }
            .department-summary {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }
            .department-card {
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 15px;
                text-align: center;
            }
            .department-name {
                font-weight: bold;
                margin-bottom: 5px;
            }
            .department-count {
                font-size: 1.5rem;
                color: #3b82f6;
                margin-bottom: 5px;
            }
            .department-salary {
                color: #64748b;
            }
            @page {
                margin: 1cm;
            }
        </style>
    </head>
    <body>
        <div class="print-date">تاريخ الطباعة: ${formatDate(new Date())}</div>
        <h1>${reportTitle}</h1>
        <p class="report-subtitle">تقرير شامل لبيانات الموظفين والرواتب والأداء</p>
        
        <div class="report-section">
            <h2>ملخص بيانات الموظفين</h2>
            ${getEmployeesSummaryHTML()}
        </div>
        
        <div class="report-section">
            <h2>تحليل الرواتب</h2>
            ${getSalariesAnalysisHTML(selectedMonth, selectedYear, reportPeriod)}
        </div>
        
        <div class="report-section">
            <h2>تحليل الأداء والعمولات</h2>
            ${getPerformanceAnalysisHTML(selectedMonth, selectedYear, reportPeriod)}
        </div>
        
        <div class="report-section">
            <h2>تحليل الحضور والإجازات</h2>
            ${getAttendanceAnalysisHTML(selectedMonth, selectedYear, reportPeriod)}
        </div>
        
        <div class="footer">
            <p>نظام إدارة الموظفين المتكامل &copy; ${new Date().getFullYear()}</p>
            <p>تم إنشاء هذا التقرير بتاريخ ${formatDate(new Date())} الساعة ${new Date().toLocaleTimeString()}</p>
        </div>
    </body>
    </html>
`;

// كتابة المحتوى وطباعته
printWindow.document.open();
printWindow.document.write(printContent);
printWindow.document.close();

// الانتظار لتحميل الصفحة ثم الطباعة
printWindow.onload = function() {
    printWindow.print();
    // printWindow.close(); // إغلاق النافذة بعد الطباعة (اختياري)
};
}

/**
* الحصول على HTML ملخص بيانات الموظفين
* @returns {string} - محتوى HTML
*/
function getEmployeesSummaryHTML() {
// إحصائيات الموظفين
const totalEmployees = employees.length;
const activeEmployees = employees.filter(emp => emp.status === 'active').length;
const inactiveEmployees = employees.filter(emp => emp.status === 'inactive').length;
const onLeaveEmployees = employees.filter(emp => emp.status === 'on-leave').length;

// حساب إجمالي الرواتب الأساسية
const totalBasicSalaries = employees.reduce((sum, emp) => sum + (emp.basicSalary || 0), 0);

// تجميع الموظفين حسب القسم
const departmentCounts = {};
const departmentSalaries = {};

employees.forEach(employee => {
    const department = employee.department || 'other';
    if (!departmentCounts[department]) {
        departmentCounts[department] = 0;
        departmentSalaries[department] = 0;
    }
    departmentCounts[department]++;
    departmentSalaries[department] += (employee.basicSalary || 0);
});

// إنشاء محتوى HTML
let html = `
    <div class="summary">
        <h3>الإحصائيات العامة</h3>
        <table>
            <tr>
                <th>إجمالي الموظفين</th>
                <th>الموظفين النشطين</th>
                <th>الموظفين غير النشطين</th>
                <th>الموظفين في إجازة</th>
                <th>إجمالي الرواتب الأساسية</th>
            </tr>
            <tr>
                <td>${totalEmployees}</td>
                <td>${activeEmployees}</td>
                <td>${inactiveEmployees}</td>
                <td>${onLeaveEmployees}</td>
                <td>${formatCurrency(totalBasicSalaries)}</td>
            </tr>
        </table>
    </div>
    
    <h3>توزيع الموظفين حسب القسم</h3>
    <div class="department-summary">
`;

// إضافة بطاقات الأقسام
Object.keys(departmentCounts).forEach(department => {
    html += `
        <div class="department-card">
            <div class="department-name">${getArabicDepartmentName(department)}</div>
            <div class="department-count">${departmentCounts[department]}</div>
            <div class="department-salary">الرواتب: ${formatCurrency(departmentSalaries[department])}</div>
        </div>
    `;
});

html += `
    </div>
    
    <h3>قائمة الموظفين</h3>
    <table>
        <thead>
            <tr>
                <th>م</th>
                <th>الاسم</th>
                <th>المسمى الوظيفي</th>
                <th>القسم</th>
                <th>تاريخ التعيين</th>
                <th>الراتب الأساسي</th>
                <th>الحالة</th>
            </tr>
        </thead>
        <tbody>
`;

// إضافة الموظفين
employees.forEach((employee, index) => {
    html += `
        <tr>
            <td>${index + 1}</td>
            <td>${employee.name}</td>
            <td>${employee.jobTitle}</td>
            <td>${getArabicDepartmentName(employee.department)}</td>
            <td>${formatDate(employee.hireDate)}</td>
            <td>${formatCurrency(employee.basicSalary || 0)}</td>
            <td>${getStatusText(employee.status)}</td>
        </tr>
    `;
});

html += `
        </tbody>
    </table>
`;

return html;
}

/**
* الحصول على HTML تحليل الرواتب
* @param {string} month - الشهر
* @param {string} year - السنة
* @param {string} period - الفترة
* @returns {string} - محتوى HTML
*/
function getSalariesAnalysisHTML(month, year, period) {
// تصفية المعاملات حسب الفترة
const filteredTransactions = filterTransactionsByPeriod(salaryTransactions, month, year, period);

// حساب إجماليات الرواتب
const totalBasicSalary = filteredTransactions.reduce((sum, tx) => sum + (tx.basicSalary || 0), 0);
const totalAllowances = filteredTransactions.reduce((sum, tx) => sum + (tx.allowances || 0), 0);
const totalCommissions = filteredTransactions.reduce((sum, tx) => sum + (tx.commissionAmount || 0), 0);
const totalDeductions = filteredTransactions.reduce((sum, tx) => sum + (tx.deductions || 0), 0);
const totalSalaries = filteredTransactions.reduce((sum, tx) => sum + (tx.totalSalary || 0), 0);

// تجميع البيانات حسب الموظف
const employeeData = {};

filteredTransactions.forEach(tx => {
    if (!employeeData[tx.employeeId]) {
        employeeData[tx.employeeId] = {
            name: tx.employeeName,
            totalSalary: 0,
            transactions: 0
        };
    }
    
    employeeData[tx.employeeId].totalSalary += tx.totalSalary || 0;
    employeeData[tx.employeeId].transactions++;
});

// ترتيب الموظفين حسب إجمالي الرواتب (تنازلياً)
const sortedEmployees = Object.values(employeeData)
    .sort((a, b) => b.totalSalary - a.totalSalary)
    .slice(0, 5); // أعلى 5 موظفين

// إنشاء محتوى HTML
let html = `
    <div class="summary">
        <h3>ملخص الرواتب</h3>
        <table>
            <tr>
                <th>عدد المعاملات</th>
                <th>إجمالي الرواتب الأساسية</th>
                <th>إجمالي البدلات</th>
                <th>إجمالي العمولات</th>
                <th>إجمالي الاستقطاعات</th>
                <th>إجمالي الرواتب</th>
            </tr>
            <tr>
                <td>${filteredTransactions.length}</td>
                <td>${formatCurrency(totalBasicSalary)}</td>
                <td>${formatCurrency(totalAllowances)}</td>
                <td>${formatCurrency(totalCommissions)}</td>
                <td>${formatCurrency(totalDeductions)}</td>
                <td>${formatCurrency(totalSalaries)}</td>
            </tr>
        </table>
    </div>
    
    <div class="chart-placeholder">
        <p>تمثيل بياني لتوزيع الرواتب والبدلات</p>
        <p>(يتم إنشاء الرسوم البيانية في البرنامج)</p>
    </div>
    
    <h3>أعلى 5 موظفين من حيث الرواتب</h3>
    <table>
        <thead>
            <tr>
                <th>م</th>
                <th>الموظف</th>
                <th>عدد المعاملات</th>
                <th>إجمالي الرواتب</th>
            </tr>
        </thead>
        <tbody>
`;

// إضافة الموظفين
sortedEmployees.forEach((employee, index) => {
    html += `
        <tr>
            <td>${index + 1}</td>
            <td>${employee.name}</td>
            <td>${employee.transactions}</td>
            <td>${formatCurrency(employee.totalSalary)}</td>
        </tr>
    `;
});

html += `
        </tbody>
    </table>
    
    <h3>معاملات الرواتب</h3>
    <table>
        <thead>
            <tr>
                <th>م</th>
                <th>الموظف</th>
                <th>الشهر</th>
                <th>تاريخ الصرف</th>
                <th>الراتب الأساسي</th>
                <th>البدلات</th>
                <th>العمولة</th>
                <th>الإجمالي</th>
            </tr>
        </thead>
        <tbody>
`;

// إضافة المعاملات (أحدث 10 معاملات)
filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
    .forEach((transaction, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${transaction.employeeName}</td>
                <td>${getArabicMonthName(transaction.month)} ${transaction.year}</td>
                <td>${formatDate(transaction.date)}</td>
                <td>${formatCurrency(transaction.basicSalary || 0)}</td>
                <td>${formatCurrency(transaction.allowances || 0)}</td>
                <td>${formatCurrency(transaction.commissionAmount || 0)}</td>
                <td>${formatCurrency(transaction.totalSalary || 0)}</td>
            </tr>
        `;
    });

html += `
        </tbody>
    </table>
`;

return html;
}

/**
* الحصول على HTML تحليل الأداء والعمولات
* @param {string} month - الشهر
* @param {string} year - السنة
* @param {string} period - الفترة
* @returns {string} - محتوى HTML
*/
function getPerformanceAnalysisHTML(month, year, period) {
// تصفية المعاملات حسب الفترة
const filteredTransactions = filterTransactionsByPeriod(salaryTransactions, month, year, period);

// تجميع البيانات حسب الموظف
const employeeData = {};

filteredTransactions.forEach(tx => {
    if (!employeeData[tx.employeeId]) {
        employeeData[tx.employeeId] = {
            name: tx.employeeName,
            sales: 0,
            commission: 0,
            transactions: 0
        };
    }
    
    employeeData[tx.employeeId].sales += tx.sales || 0;
    employeeData[tx.employeeId].commission += tx.commissionAmount || 0;
    employeeData[tx.employeeId].transactions++;
});

// ترتيب الموظفين حسب المبيعات (تنازلياً)
const topSalesEmployees = Object.values(employeeData)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5); // أعلى 5 موظفين

// ترتيب الموظفين حسب العمولات (تنازلياً)
const topCommissionEmployees = Object.values(employeeData)
    .sort((a, b) => b.commission - a.commission)
    .slice(0, 5); // أعلى 5 موظفين

// حساب إجمالي المبيعات والعمولات
const totalSales = filteredTransactions.reduce((sum, tx) => sum + (tx.sales || 0), 0);
const totalCommission = filteredTransactions.reduce((sum, tx) => sum + (tx.commissionAmount || 0), 0);

// إنشاء محتوى HTML
let html = `
    <div class="summary">
        <h3>ملخص الأداء</h3>
        <table>
            <tr>
                <th>إجمالي المبيعات</th>
                <th>إجمالي العمولات</th>
                <th>متوسط نسبة العمولة</th>
            </tr>
            <tr>
                <td>${formatCurrency(totalSales)}</td>
                <td>${formatCurrency(totalCommission)}</td>
                <td>${totalSales ? ((totalCommission / totalSales) * 100).toFixed(2) : 0}%</td>
            </tr>
        </table>
    </div>
    
    <div class="chart-placeholder">
        <p>تمثيل بياني لأداء الموظفين والمبيعات</p>
        <p>(يتم إنشاء الرسوم البيانية في البرنامج)</p>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
            <h3>أفضل 5 موظفين في المبيعات</h3>
            <table>
                <thead>
                    <tr>
                        <th>م</th>
                        <th>الموظف</th>
                        <th>المبيعات</th>
                    </tr>
                </thead>
                <tbody>
`;

// إضافة أفضل الموظفين في المبيعات
topSalesEmployees.forEach((employee, index) => {
    html += `
        <tr>
            <td>${index + 1}</td>
            <td>${employee.name}</td>
            <td>${formatCurrency(employee.sales)}</td>
        </tr>
    `;
});

html += `
                </tbody>
            </table>
        </div>
        
        <div>
            <h3>أفضل 5 موظفين في العمولات</h3>
            <table>
                <thead>
                    <tr>
                        <th>م</th>
                        <th>الموظف</th>
                        <th>العمولات</th>
                    </tr>
                </thead>
                <tbody>
`;

// إضافة أفضل الموظفين في العمولات
topCommissionEmployees.forEach((employee, index) => {
    html += `
        <tr>
            <td>${index + 1}</td>
            <td>${employee.name}</td>
            <td>${formatCurrency(employee.commission)}</td>
        </tr>
    `;
});

html += `
                </tbody>
            </table>
        </div>
    </div>
`;

return html;
}

/**
* الحصول على HTML تحليل الحضور والإجازات
* @param {string} month - الشهر
* @param {string} year - السنة
* @param {string} period - الفترة
* @returns {string} - محتوى HTML
*/
function getAttendanceAnalysisHTML(month, year, period) {
// تصفية سجلات الحضور حسب الفترة
const startDate = getStartDateForPeriod(month, year, period);
const endDate = getEndDateForPeriod(month, year, period);

const filteredAttendance = attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= startDate && recordDate <= endDate;
});

// تصفية طلبات الإجازات حسب الفترة
const filteredVacations = vacationRequests.filter(vacation => {
    const startVacDate = new Date(vacation.startDate);
    return startVacDate >= startDate && startVacDate <= endDate;
});

// حساب إحصائيات الحضور
const totalAttendanceRecords = filteredAttendance.length;
const presentCount = filteredAttendance.filter(record => record.status === 'present').length;
const lateCount = filteredAttendance.filter(record => record.status === 'late').length;
const absentCount = filteredAttendance.filter(record => record.status === 'absent').length;

// حساب إحصائيات الإجازات
const totalVacations = filteredVacations.length;
const approvedVacations = filteredVacations.filter(vacation => vacation.status === 'approved').length;
const pendingVacations = filteredVacations.filter(vacation => vacation.status === 'pending').length;
const rejectedVacations = filteredVacations.filter(vacation => vacation.status === 'rejected').length;

// تجميع إحصائيات الإجازات حسب النوع
const vacationsByType = {};
filteredVacations.forEach(vacation => {
    if (!vacationsByType[vacation.type]) {
        vacationsByType[vacation.type] = 0;
    }
    vacationsByType[vacation.type]++;
});

// إنشاء محتوى HTML
let html = `
    <div class="summary">
        <h3>ملخص الحضور والإجازات</h3>
        <table>
            <tr>
                <th colspan="4">الحضور</th>
                <th colspan="4">الإجازات</th>
            </tr>
            <tr>
                <td>إجمالي السجلات</td>
                <td>حاضر</td>
                <td>متأخر</td>
                <td>غائب</td>
                <td>إجمالي الطلبات</td>
                <td>مقبولة</td>
                <td>قيد الانتظار</td>
                <td>مرفوضة</td>
            </tr>
            <tr>
                <td>${totalAttendanceRecords}</td>
                <td>${presentCount}</td>
                <td>${lateCount}</td>
                <td>${absentCount}</td>
                <td>${totalVacations}</td>
                <td>${approvedVacations}</td>
                <td>${pendingVacations}</td>
                <td>${rejectedVacations}</td>
            </tr>
        </table>
    </div>
    
    <div class="chart-placeholder">
        <p>تمثيل بياني لإحصائيات الحضور والإجازات</p>
        <p>(يتم إنشاء الرسوم البيانية في البرنامج)</p>
    </div>
    
    <h3>توزيع الإجازات حسب النوع</h3>
    <table>
        <thead>
            <tr>
                <th>نوع الإجازة</th>
                <th>العدد</th>
            </tr>
        </thead>
        <tbody>
`;

// إضافة أنواع الإجازات
Object.entries(vacationsByType).forEach(([type, count]) => {
    html += `
        <tr>
            <td>${getVacationTypeText(type)}</td>
            <td>${count}</td>
        </tr>
    `;
});

html += `
        </tbody>
    </table>
    
    <h3>آخر طلبات الإجازات</h3>
    <table>
        <thead>
            <tr>
                <th>م</th>
                <th>الموظف</th>
                <th>النوع</th>
                <th>من تاريخ</th>
                <th>إلى تاريخ</th>
                <th>المدة</th>
                <th>الحالة</th>
            </tr>
        </thead>
        <tbody>
`;

// إضافة آخر طلبات الإجازات
filteredVacations
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
    .slice(0, 5)
    .forEach((vacation, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${vacation.employeeName}</td>
                <td>${getVacationTypeText(vacation.type)}</td>
                <td>${formatDate(vacation.startDate)}</td>
                <td>${formatDate(vacation.endDate)}</td>
                <td>${vacation.days} يوم</td>
                <td>${getVacationStatusText(vacation.status)}</td>
            </tr>
        `;
    });

html += `
        </tbody>
    </table>
`;

return html;
}

/**
* الحصول على تاريخ بداية الفترة
* @param {string} month - الشهر
* @param {string} year - السنة
* @param {string} period - الفترة (monthly/quarterly/yearly)
* @returns {Date} - تاريخ البداية
*/
function getStartDateForPeriod(month, year, period) {
if (period === 'monthly') {
    return new Date(year, parseInt(month) - 1, 1);
} else if (period === 'quarterly') {
    const quarter = Math.ceil(parseInt(month) / 3);
    return new Date(year, (quarter - 1) * 3, 1);
} else if (period === 'yearly') {
    return new Date(year, 0, 1);
}

return new Date(year, parseInt(month) - 1, 1);
}

/**
* الحصول على تاريخ نهاية الفترة
* @param {string} month - الشهر
* @param {string} year - السنة
* @param {string} period - الفترة (monthly/quarterly/yearly)
* @returns {Date} - تاريخ النهاية
*/
function getEndDateForPeriod(month, year, period) {
if (period === 'monthly') {
    return new Date(year, parseInt(month), 0);
} else if (period === 'quarterly') {
    const quarter = Math.ceil(parseInt(month) / 3);
    return new Date(year, quarter * 3, 0);
} else if (period === 'yearly') {
    return new Date(year, 11, 31);
}

return new Date(year, parseInt(month), 0);
}

// ===== وظائف مساعدة =====

/**
* تهيئة مرشحات السنة في النماذج
*/
function initYearFilters() {
// تعبئة قوائم السنوات
const yearFilters = ['salary-year-filter', 'payroll-year-filter', 'report-year-filter'];

yearFilters.forEach(filterId => {
    const filter = document.getElementById(filterId);
    if (!filter) return;
    
    // إضافة السنوات (5 سنوات قبل وبعد السنة الحالية)
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year.toString();
        option.textContent = year.toString();
        
        // جعل السنة الحالية هي القيمة الافتراضية
        if (year === currentYear) {
            option.selected = true;
        }
        
        filter.appendChild(option);
    }
});
}

/**
* تعبئة قائمة الموظفين في القوائم المنسدلة
* @param {string} selectId - معرف عنصر القائمة المنسدلة
*/
function populateEmployeeSelect(selectId = 'salary-employee') {
const select = document.getElementById(selectId);
if (!select) return;

// تفريغ القائمة
select.innerHTML = '<option value="">اختر الموظف</option>';

// تصفية الموظفين النشطين
const activeEmployees = employees.filter(emp => emp.status === 'active' || emp.status === 'on-leave');

// ترتيب الموظفين أبجدياً
activeEmployees.sort((a, b) => a.name.localeCompare(b.name));

// إضافة الموظفين إلى القائمة
activeEmployees.forEach(employee => {
    const option = document.createElement('option');
    option.value = employee.id;
    option.textContent = `${employee.name} (${employee.jobTitle})`;
    select.appendChild(option);
});
}

/**
* تعبئة قائمة المدراء في نموذج الموظف
* @param {string} currentEmployeeId - معرف الموظف الحالي (لاستثنائه من القائمة)
*/
function populateManagerSelect(currentEmployeeId = '') {
const select = document.getElementById('employee-manager');
if (!select) return;

// تفريغ القائمة
select.innerHTML = '<option value="">لا يوجد</option>';

// تصفية الموظفين المحتملين ليكونوا مدراء
const potentialManagers = employees.filter(emp => 
    emp.status === 'active' && emp.id !== currentEmployeeId
);

// ترتيب المدراء أبجدياً
potentialManagers.sort((a, b) => a.name.localeCompare(b.name));

// إضافة المدراء إلى القائمة
potentialManagers.forEach(manager => {
    const option = document.createElement('option');
    option.value = manager.id;
    option.textContent = `${manager.name} (${manager.jobTitle})`;
    select.appendChild(option);
});
}

/**
* تنسيق المبلغ المالي
* @param {number} amount - المبلغ
* @param {boolean} addCurrency - إضافة وحدة العملة (اختياري)
* @returns {string} - المبلغ المنسق
*/
function formatCurrency(amount, addCurrency = true) {
// التحقق من صحة المبلغ
if (amount === undefined || amount === null || isNaN(amount)) {
    return addCurrency ? "0 دينار" : "0";
}

// تقريب المبلغ إلى أقرب رقمين عشريين
amount = parseFloat(amount.toFixed(2));

// تحويل المبلغ إلى نص وإضافة الفواصل
const parts = amount.toString().split('.');
parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// إعادة المبلغ مع إضافة العملة إذا تم طلب ذلك
const formattedAmount = parts.join('.');

if (addCurrency) {
    return formattedAmount + " دينار";
} else {
    return formattedAmount;
}
}

/**
* تنسيق التاريخ
* @param {string} dateString - التاريخ
* @returns {string} - التاريخ المنسق
*/
function formatDate(dateString) {
if (!dateString) return '';

try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
} catch (error) {
    return dateString;
}
}

/**
* تعيين التاريخ الحالي في حقل تاريخ
* @param {string} inputId - معرف حقل التاريخ
*/
function setCurrentDate(inputId) {
const input = document.getElementById(inputId);
if (input) {
    input.value = new Date().toISOString().split('T')[0];
}
}

/**
* تعيين الوقت الحالي في حقل وقت
* @param {string} inputId - معرف حقل الوقت
*/
function setCurrentTime(inputId) {
const input = document.getElementById(inputId);
if (input) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    input.value = `${hours}:${minutes}`;
}
}

/**
* تعيين الشهر الحالي في قائمة منسدلة
* @param {string} monthSelectId - معرف قائمة الشهور
* @param {string} yearSelectId - معرف قائمة السنوات
*/
function setCurrentMonth(monthSelectId, yearSelectId) {
const monthSelect = document.getElementById(monthSelectId);
const yearSelect = document.getElementById(yearSelectId);

if (monthSelect) {
    const currentMonth = (new Date().getMonth() + 1).toString();
    monthSelect.value = currentMonth;
}

if (yearSelect) {
    const currentYear = new Date().getFullYear().toString();
    yearSelect.value = currentYear;
}
}

/**
* الحصول على اسم الشهر العربي
* @param {string|number} month - رقم الشهر (1-12)
* @returns {string} - اسم الشهر بالعربية
*/
function getArabicMonthName(month) {
const monthNumber = parseInt(month);

const months = {
    1: "يناير",
    2: "فبراير",
    3: "مارس",
    4: "أبريل",
    5: "مايو",
    6: "يونيو",
    7: "يوليو",
    8: "أغسطس",
    9: "سبتمبر",
    10: "أكتوبر",
    11: "نوفمبر",
    12: "ديسمبر"
};

return months[monthNumber] || `شهر ${month}`;
}

/**
* الحصول على اسم الشهر العربي المختصر
* @param {string|number} month - رقم الشهر (1-12)
* @returns {string} - اسم الشهر المختصر بالعربية
*/
function getArabicMonthShortName(month) {
const monthNumber = parseInt(month);

const shortMonths = {
    1: "ينا",
    2: "فبر",
    3: "مار",
    4: "أبر",
    5: "مايو",
    6: "يون",
    7: "يول",
    8: "أغس",
    9: "سبت",
    10: "أكت",
    11: "نوف",
    12: "ديس"
};

return shortMonths[monthNumber] || `${month}`;
}

/**
* الحصول على اسم القسم بالعربية
* @param {string} department - رمز القسم
* @returns {string} - اسم القسم بالعربية
*/
function getArabicDepartmentName(department) {
const departments = {
    'management': 'الإدارة',
    'sales': 'المبيعات',
    'marketing': 'التسويق',
    'finance': 'المالية',
    'hr': 'الموارد البشرية',
    'it': 'تكنولوجيا المعلومات',
    'operations': 'العمليات',
    'customer-service': 'خدمة العملاء',
    'other': 'أخرى'
};

return departments[department] || department || 'غير محدد';
}

/**
* تحويل اسم القسم العربي إلى الرمز
* @param {string} arabicName - اسم القسم بالعربية
* @returns {string} - رمز القسم
*/
function mapDepartment(arabicName) {
const departmentMap = {
    'الإدارة': 'management',
    'المبيعات': 'sales',
    'التسويق': 'marketing',
    'المالية': 'finance',
    'الموارد البشرية': 'hr',
    'تكنولوجيا المعلومات': 'it',
    'العمليات': 'operations',
    'خدمة العملاء': 'customer-service',
    'أخرى': 'other'
};

return departmentMap[arabicName] || 'other';
}

/**
* الحصول على فئة الحالة
* @param {string} status - رمز الحالة
* @returns {string} - فئة الحالة للتنسيق
*/
function getStatusClass(status) {
const statusClasses = {
    'active': 'success',
    'inactive': 'danger',
    'on-leave': 'warning',
    'terminated': 'secondary',
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'completed': 'success'
};

return statusClasses[status] || 'secondary';
}

/**
* الحصول على نص الحالة بالعربية
* @param {string} status - رمز الحالة
* @param {string} type - نوع العنصر (اختياري)
* @returns {string} - نص الحالة بالعربية
*/
function getStatusText(status, type = 'employee') {
if (type === 'loan') {
    const loanStatusTexts = {
        'active': 'نشط',
        'completed': 'مكتمل',
        'cancelled': 'ملغي'
    };
    
    return loanStatusTexts[status] || status || 'غير محدد';
} else {
    const statusTexts = {
        'active': 'نشط',
        'inactive': 'غير نشط',
        'on-leave': 'في إجازة',
        'terminated': 'منتهي العقد'
    };
    
    return statusTexts[status] || status || 'غير محدد';
}
}

/**
* تحويل نص الحالة العربي إلى الرمز
* @param {string} arabicStatus - نص الحالة بالعربية
* @returns {string} - رمز الحالة
*/
function mapStatus(arabicStatus) {
const statusMap = {
    'نشط': 'active',
    'غير نشط': 'inactive',
    'في إجازة': 'on-leave',
    'منتهي العقد': 'terminated'
};

return statusMap[arabicStatus] || 'active';
}

/**
* الحصول على نص نوع العقد بالعربية
* @param {string} contractType - رمز نوع العقد
* @returns {string} - نص نوع العقد بالعربية
*/
function getContractTypeText(contractType) {
const contractTypes = {
    'full-time': 'دوام كامل',
    'part-time': 'دوام جزئي',
    'temporary': 'مؤقت',
    'contract': 'عقد',
    'internship': 'تدريب'
};

return contractTypes[contractType] || contractType || 'غير محدد';
}

/**
* الحصول على نص طريقة الدفع بالعربية
* @param {string} paymentMethod - رمز طريقة الدفع
* @returns {string} - نص طريقة الدفع بالعربية
*/
function getPaymentMethodText(paymentMethod) {
const paymentMethods = {
    'bank': 'تحويل بنكي',
    'cash': 'نقدي',
    'cheque': 'شيك'
};

return paymentMethods[paymentMethod] || paymentMethod || 'غير محدد';
}

function getMaritalStatusText(maritalStatus) {
    const maritalStatuses = {
        'single': 'أعزب',
        'married': 'متزوج',
        'divorced': 'مطلق',
        'widowed': 'أرمل'
    };

    return maritalStatuses[maritalStatus] || maritalStatus || 'غير محدد';
}

/**
 * الحصول على اسم المدير
 * @param {string} managerId - معرف المدير
 * @returns {string} - اسم المدير
 */
function getManagerName(managerId) {
    if (!managerId) return '';
    
    const manager = employees.find(emp => emp.id === managerId);
    return manager ? manager.name : '';
}

/**
 * الحصول على اسم الموظف
 * @param {string} employeeId - معرف الموظف
 * @returns {string} - اسم الموظف
 */
function getEmployeeName(employeeId) {
    if (!employeeId) return '';
    
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : '';
}

/**
 * الحصول على فئة حالة الحضور
 * @param {string} status - رمز حالة الحضور
 * @returns {string} - فئة حالة الحضور للتنسيق
 */
function getAttendanceStatusClass(status) {
    const statusClasses = {
        'present': 'success',
        'late': 'warning',
        'absent': 'danger',
        'half-day': 'info',
        'vacation': 'secondary'
    };

    return statusClasses[status] || 'secondary';
}

/**
 * الحصول على نص حالة الحضور بالعربية
 * @param {string} status - رمز حالة الحضور
 * @returns {string} - نص حالة الحضور بالعربية
 */
function getAttendanceStatusText(status) {
    const statusTexts = {
        'present': 'حاضر',
        'late': 'متأخر',
        'absent': 'غائب',
        'half-day': 'نصف يوم',
        'vacation': 'إجازة'
    };

    return statusTexts[status] || status || 'غير محدد';
}

/**
 * تحويل نص حالة الحضور العربي إلى الرمز
 * @param {string} arabicStatus - نص حالة الحضور بالعربية
 * @returns {string} - رمز حالة الحضور
 */
function mapAttendanceStatus(arabicStatus) {
    const statusMap = {
        'حاضر': 'present',
        'متأخر': 'late',
        'غائب': 'absent',
        'نصف يوم': 'half-day',
        'إجازة': 'vacation'
    };

    return statusMap[arabicStatus] || 'present';
}

/**
 * الحصول على فئة حالة الإجازة
 * @param {string} status - رمز حالة الإجازة
 * @returns {string} - فئة حالة الإجازة للتنسيق
 */
function getVacationStatusClass(status) {
    const statusClasses = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger'
    };

    return statusClasses[status] || 'secondary';
}

/**
 * الحصول على نص حالة الإجازة بالعربية
 * @param {string} status - رمز حالة الإجازة
 * @returns {string} - نص حالة الإجازة بالعربية
 */
function getVacationStatusText(status) {
    const statusTexts = {
        'pending': 'قيد الانتظار',
        'approved': 'مقبولة',
        'rejected': 'مرفوضة'
    };

    return statusTexts[status] || status || 'غير محدد';
}

/**
 * الحصول على نص نوع الإجازة بالعربية
 * @param {string} type - رمز نوع الإجازة
 * @returns {string} - نص نوع الإجازة بالعربية
 */
function getVacationTypeText(type) {
    const typeTexts = {
        'annual': 'سنوية',
        'sick': 'مرضية',
        'personal': 'شخصية',
        'emergency': 'طارئة',
        'unpaid': 'بدون راتب',
        'maternity': 'أمومة',
        'marriage': 'زواج',
        'bereavement': 'وفاة',
        'other': 'أخرى'
    };

    return typeTexts[type] || type || 'غير محدد';
}

/**
 * حساب ساعات العمل بين وقتين
 * @param {string} timeIn - وقت الحضور
 * @param {string} timeOut - وقت الانصراف
 * @returns {string} - عدد ساعات العمل
 */
function calculateWorkHours(timeIn, timeOut) {
    try {
        // تحويل الأوقات إلى كائنات Date
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        const inTime = new Date(`${today}T${timeIn}`);
        const outTime = new Date(`${today}T${timeOut}`);
        
        // التحقق من أن وقت الانصراف بعد وقت الحضور
        if (outTime <= inTime) {
            // افتراض أن الانصراف في اليوم التالي
            outTime.setDate(outTime.getDate() + 1);
        }
        
        // حساب الفرق بالدقائق
        const diffMs = outTime - inTime;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        // تحويل الدقائق إلى ساعات ودقائق
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        
        // تنسيق النتيجة
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
        console.error('خطأ في حساب ساعات العمل:', error);
        return '-';
    }
}

/**
 * تنسيق حجم الملف
 * @param {number} bytes - حجم الملف بالبايت
 * @returns {string} - الحجم المنسق
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * الحصول على أيقونة الملف حسب النوع
 * @param {string} fileType - نوع الملف
 * @returns {string} - فئة الأيقونة
 */
function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) {
        return 'fas fa-file-image';
    } else if (fileType.includes('pdf')) {
        return 'fas fa-file-pdf';
    } else if (fileType.includes('word') || fileType.includes('document')) {
        return 'fas fa-file-word';
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
        return 'fas fa-file-excel';
    } else if (fileType.includes('text/')) {
        return 'fas fa-file-alt';
    } else {
        return 'fas fa-file';
    }
}

/**
 * فتح مستند في نافذة جديدة
 * @param {string} documentUrl - عنوان المستند
 */
function openDocumentInNewTab(documentUrl) {
    window.open(documentUrl, '_blank');
}

/**
 * إنشاء معرف فريد
 * @returns {string} - معرف فريد
 */
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

/**
 * عرض رسالة للمستخدم
 * @param {string} message - نص الرسالة
 * @param {string} type - نوع الرسالة (success/error/warning/info)
 */
function showToast(message, type = 'info') {
    // التحقق من وجود عنصر الرسائل
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        // إنشاء حاوية الرسائل
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
        
        // إضافة أنماط خاصة بالرسائل إذا لم تكن موجودة
        if (!document.getElementById('toast-styles')) {
            const toastStyles = document.createElement('style');
            toastStyles.id = 'toast-styles';
            toastStyles.textContent = `
                .toast-container {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-width: 400px;
                    width: 100%;
                }
                
                .toast {
                    padding: 12px 16px;
                    border-radius: 6px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    animation: toast-in 0.3s ease-out forwards;
                    overflow: hidden;
                }
                
                .toast-content {
                    flex: 1;
                    margin-left: 10px;
                }
                
                .toast-close {
                    background: transparent;
                    border: none;
                    color: white;
                    opacity: 0.7;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 0 4px;
                }
                
                .toast-close:hover {
                    opacity: 1;
                }
                
                .toast.success {
                    background-color: #10b981;
                }
                
                .toast.error {
                    background-color: #ef4444;
                }
                
                .toast.warning {
                    background-color: #f59e0b;
                }
                
                .toast.info {
                    background-color: #3b82f6;
                }
                
                @keyframes toast-in {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                @keyframes toast-out {
                    from {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                }
            `;
            
            document.head.appendChild(toastStyles);
        }
    }
    
    // تحديد أيقونة الرسالة
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-times-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    // إنشاء عنصر الرسالة
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        ${icon}
        <div class="toast-content">${message}</div>
        <button class="toast-close">×</button>
    `;
    
    // إضافة الرسالة إلى الحاوية
    toastContainer.appendChild(toast);
    
    // إغلاق الرسالة عند النقر على زر الإغلاق
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'toast-out 0.3s ease-in forwards';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    });
    
    // إغلاق الرسالة تلقائياً بعد فترة
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'toast-out 0.3s ease-in forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    }, 5000);
}

/**
 * تحويل الرقم إلى كلمات عربية
 * @param {number} num - الرقم
 * @returns {string} - الرقم بالكلمات العربية
 */
function numberToWords(num) {
    if (isNaN(num)) return '';
    
    const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
    const teens = ['', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    const thousands = ['', 'ألف', 'ألفان', 'آلاف', 'آلاف', 'آلاف', 'آلاف', 'آلاف', 'آلاف', 'آلاف', 'ألف'];
    const millions = ['', 'مليون', 'مليونان', 'ملايين', 'ملايين', 'ملايين', 'ملايين', 'ملايين', 'ملايين', 'ملايين', 'مليون'];
    
    // تقريب الرقم إلى أقرب رقمين عشريين
    const roundedNum = Math.round(num * 100) / 100;
    const numStr = roundedNum.toString();
    
    // فصل الجزء الصحيح والكسري
    const parts = numStr.split('.');
    const integerPart = parseInt(parts[0]);
    const decimalPart = parts.length > 1 ? parseInt(parts[1].padEnd(2, '0')) : 0;
    
    // تحويل الجزء الصحيح إلى كلمات
    let result = '';
    
    if (integerPart === 0) {
        result = 'صفر';
    } else {
        if (integerPart >= 1000000) {
            const millions = Math.floor(integerPart / 1000000);
            result += convertLessThanMillion(millions) + ' مليون ';
            if (integerPart % 1000000 !== 0) {
                result += 'و ';
            }
        }
        
        if (integerPart >= 1000 && integerPart < 1000000) {
            const thousands = Math.floor((integerPart % 1000000) / 1000);
            if (thousands > 0) {
                result += convertLessThanThousand(thousands) + ' ألف ';
                if (integerPart % 1000 !== 0) {
                    result += 'و ';
                }
            }
        }
        
        const remainder = integerPart % 1000;
        if (remainder > 0) {
            result += convertLessThanThousand(remainder);
        }
    }
    
    // إضافة الجزء الكسري
    if (decimalPart > 0) {
        result += ' و ' + convertLessThanThousand(decimalPart) + ' فلس';
    }
    
    return result;
    
    // دالة مساعدة لتحويل الأرقام أقل من 1000 إلى كلمات
    function convertLessThanThousand(n) {
        let result = '';
        
        // مئات
        const hundred = Math.floor(n / 100);
        if (hundred > 0) {
            result += hundreds[hundred] + ' ';
            if (n % 100 !== 0) {
                result += 'و ';
            }
        }
        
        // عشرات وآحاد
        const tens_ones = n % 100;
        if (tens_ones > 0) {
            if (tens_ones < 11) {
                result += units[tens_ones];
            } else if (tens_ones < 20) {
                result += teens[tens_ones - 10];
            } else {
                const ten = Math.floor(tens_ones / 10);
                const one = tens_ones % 10;
                
                if (one > 0) {
                    result += units[one] + ' و ';
                }
                result += tens[ten];
            }
        }
        
        return result;
    }
}

/**
 * تشغيل المهام الدورية
 */
function setupPeriodicTasks() {
    // تحديث حالة الموظفين في الإجازات
    setInterval(updateEmployeesOnLeaveStatus, 3600000); // كل ساعة
    
    // تنفيذ المهمة فوراً عند بدء النظام
    updateEmployeesOnLeaveStatus();
}

/**
 * تحديث حالة الموظفين في الإجازات
 */
function updateEmployeesOnLeaveStatus() {
    const today = new Date().toISOString().split('T')[0];
    
    // البحث عن الإجازات النشطة
    const activeVacations = vacationRequests.filter(vacation => 
        vacation.status === 'approved' && 
        vacation.startDate <= today && 
        vacation.endDate >= today
    );
    
    // تحديث حالة الموظفين
    let updated = false;
    
    activeVacations.forEach(vacation => {
        const employeeIndex = employees.findIndex(emp => emp.id === vacation.employeeId);
        
        if (employeeIndex !== -1 && employees[employeeIndex].status !== 'on-leave') {
            employees[employeeIndex].status = 'on-leave';
            updated = true;
        }
    });
    
    // التحقق من الموظفين الذين انتهت إجازاتهم
    employees.forEach((employee, index) => {
        if (employee.status === 'on-leave') {
            // التحقق مما إذا كان الموظف لديه إجازة نشطة اليوم
            const hasActiveVacation = activeVacations.some(vacation => 
                vacation.employeeId === employee.id
            );
            
            if (!hasActiveVacation) {
                employees[index].status = 'active';
                updated = true;
            }
        }
    });
    
    // حفظ البيانات إذا تم التحديث
    if (updated) {
        saveToLocalStorage('employeesData', employees);
        console.log('تم تحديث حالة الموظفين في الإجازات');
    }
}

/**
 * إعداد نظام الإشعارات
 */
function setupNotifications() {
    // التحقق من الإشعارات كل ساعة
    setInterval(checkNotifications, 3600000); // كل ساعة
    
    // تنفيذ المهمة فوراً عند بدء النظام
    checkNotifications();
}

/**
 * التحقق من الإشعارات
 */
function checkNotifications() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // الإشعارات الخاصة بانتهاء العقود
    checkContractExpirations(today, todayStr);
    
    // الإشعارات الخاصة بانتهاء الهويات
    checkIdExpirations(today, todayStr);
    
    // الإشعارات الخاصة بطلبات الإجازات الجديدة
    checkNewVacationRequests();
}

/**
 * التحقق من انتهاء العقود
 * @param {Date} today - تاريخ اليوم
 * @param {string} todayStr - تاريخ اليوم كنص
 */
function checkContractExpirations(today, todayStr) {
    // العقود التي ستنتهي خلال أسبوع
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    const oneWeekLaterStr = oneWeekLater.toISOString().split('T')[0];
    
    employees.forEach(employee => {
        if (employee.contractEnd && employee.contractEnd <= oneWeekLaterStr && employee.contractEnd >= todayStr) {
            // عرض إشعار انتهاء العقد
            showToast(`تنبيه: عقد الموظف "${employee.name}" سينتهي بتاريخ ${formatDate(employee.contractEnd)}`, 'warning');
        }
    });
}

/**
 * التحقق من انتهاء الهويات
 * @param {Date} today - تاريخ اليوم
 * @param {string} todayStr - تاريخ اليوم كنص
 */
function checkIdExpirations(today, todayStr) {
    // الهويات التي ستنتهي خلال شهر
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    const oneMonthLaterStr = oneMonthLater.toISOString().split('T')[0];
    
    employees.forEach(employee => {
        if (employee.idExpiry && employee.idExpiry <= oneMonthLaterStr && employee.idExpiry >= todayStr) {
            // عرض إشعار انتهاء الهوية
            showToast(`تنبيه: هوية الموظف "${employee.name}" ستنتهي بتاريخ ${formatDate(employee.idExpiry)}`, 'warning');
        }
    });
}

/**
 * التحقق من طلبات الإجازات الجديدة
 */
function checkNewVacationRequests() {
    // طلبات الإجازات التي تم إنشاؤها في آخر 24 ساعة
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    const yesterdayTime = yesterday.getTime();
    
    const newRequests = vacationRequests.filter(request => 
        request.status === 'pending' && 
        new Date(request.createdAt).getTime() > yesterdayTime
    );
    
    if (newRequests.length > 0) {
        showToast(`لديك ${newRequests.length} طلب إجازة جديد بانتظار الموافقة`, 'info');
    }
}

// تنفيذ المهام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نظام إدارة الموظفين
    console.log('تهيئة نظام إدارة الموظفين المتكامل...');
    
    // إذا لم تكن هناك بيانات، قم بإضافة بيانات افتراضية للاختبار
    if (employees.length === 0) {
        addSampleData();
    }
});

