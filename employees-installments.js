/**
 * employees-installments.js
 * نظام إدارة الموظفين والأقساط المتكامل
 * يتكامل مع نظام الاستثمار المتكامل
 * يوفر وظائف إدارة الموظفين وبياناتهم والرواتب والأقساط
 */

// تهيئة المتغيرات الرئيسية للنظام
let employees = [];
let salaries = [];
let installments = [];

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام الموظفين والأقساط...');
    
    // إضافة صفحات الموظفين والرواتب والأقساط للقائمة الجانبية
    addSidebarMenuItems();
    
    // إضافة صفحات الموظفين والرواتب والأقساط
    addEmployeePages();
    
    // إضافة النوافذ المنبثقة للنظام
    addEmployeeModals();
    
    // تحميل البيانات من التخزين المحلي
    loadEmployeeData();
    
    // إضافة مستمعي الأحداث
    setupEmployeeEventListeners();
    
    // تفعيل نظام رفع الصور
    setupImageUpload();
});

// إضافة عناصر القائمة الجانبية
function addSidebarMenuItems() {
    console.log('إضافة عناصر القائمة الجانبية للموظفين والأقساط...');
    
    const navList = document.querySelector('.sidebar .nav-list');
    if (!navList) {
        console.error('لم يتم العثور على قائمة التنقل الجانبية');
        return;
    }
    
    // التحقق من عدم وجود العناصر مسبقًا
    if (document.querySelector('.nav-link[data-page="employees"]')) {
        console.log('عناصر القائمة موجودة بالفعل.');
        return;
    }
    
    // إضافة عنصر الموظفين
    const employeesItem = document.createElement('li');
    employeesItem.className = 'nav-item';
    employeesItem.innerHTML = `
        <a class="nav-link" data-page="employees" href="#">
            <div class="nav-icon">
                <i class="fas fa-user-tie"></i>
            </div>
            <span>الموظفين</span>
        </a>
    `;
    
    // إضافة عنصر الرواتب
    const salariesItem = document.createElement('li');
    salariesItem.className = 'nav-item';
    salariesItem.innerHTML = `
        <a class="nav-link" data-page="salaries" href="#">
            <div class="nav-icon">
                <i class="fas fa-money-bill-wave"></i>
            </div>
            <span>الرواتب</span>
        </a>
    `;
    
    // إضافة عنصر الأقساط
    const installmentsItem = document.createElement('li');
    installmentsItem.className = 'nav-item';
    installmentsItem.innerHTML = `
        <a class="nav-link" data-page="installments" href="#">
            <div class="nav-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <span>الأقساط</span>
        </a>
    `;
    
    // إضافة العناصر للقائمة مباشرة قبل عنصر الإعدادات
    const settingsItem = document.querySelector('.nav-link[data-page="settings"]').parentElement;
    
    navList.insertBefore(employeesItem, settingsItem);
    navList.insertBefore(salariesItem, settingsItem);
    navList.insertBefore(installmentsItem, settingsItem);
    
    console.log('تمت إضافة عناصر القائمة الجانبية بنجاح');
}

// إضافة صفحات الموظفين والرواتب والأقساط
function addEmployeePages() {
    console.log('إضافة صفحات الموظفين والرواتب والأقساط...');
    
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('لم يتم العثور على العنصر الرئيسي');
        return;
    }
    
    // التحقق من عدم وجود الصفحات مسبقًا
    if (document.getElementById('employees-page')) {
        console.log('صفحات الموظفين موجودة بالفعل.');
        return;
    }
    
    // إضافة صفحة الموظفين
    const employeesPage = document.createElement('div');
    employeesPage.className = 'page';
    employeesPage.id = 'employees-page';
    employeesPage.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">إدارة الموظفين</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" placeholder="بحث عن موظف..." type="text" id="employee-search" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-primary" id="add-employee-btn">
                    <i class="fas fa-plus"></i>
                    <span>إضافة موظف</span>
                </button>
            </div>
        </div>
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">قائمة الموظفين</h2>
                <div class="section-actions">
                    <div class="btn-group">
                        <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
                        <button class="btn btn-outline btn-sm" data-filter="active">نشط</button>
                        <button class="btn btn-outline btn-sm" data-filter="inactive">غير نشط</button>
                    </div>
                    <button class="btn btn-outline btn-sm" id="export-employees-btn" title="تصدير">
                        <i class="fas fa-download"></i>
                        <span>تصدير</span>
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table id="employees-table">
                    <thead>
                        <tr>
                            <th>الصورة</th>
                            <th>الاسم</th>
                            <th>رقم الهاتف</th>
                            <th>المسمى الوظيفي</th>
                            <th>الراتب الأساسي</th>
                            <th>نسبة المبيعات</th>
                            <th>تاريخ التعيين</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </tbody>
                </table>
            </div>
            <div class="pagination">
                <div class="page-item disabled">
                    <i class="fas fa-chevron-right"></i>
                </div>
                <div class="page-item active">1</div>
                <div class="page-item">2</div>
                <div class="page-item">3</div>
                <div class="page-item">
                    <i class="fas fa-chevron-left"></i>
                </div>
            </div>
        </div>
    `;
    
    // إضافة نافذة إضافة/تعديل قسط
    const addInstallmentModal = document.createElement('div');
    addInstallmentModal.className = 'modal-overlay';
    addInstallmentModal.id = 'add-installment-modal';
    addInstallmentModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title" id="installment-modal-title">إضافة قسط جديد</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <form id="installment-form">
                    <input type="hidden" id="installment-id">
                    
                    <div class="grid-cols-2">
                        <div class="form-group">
                            <label class="form-label">اسم العميل <span class="required">*</span></label>
                            <input class="form-input" id="installment-customer-name" required type="text">
                        </div>
                        <div class="form-group">
                            <label class="form-label">رقم الهاتف <span class="required">*</span></label>
                            <input class="form-input" id="installment-customer-phone" required type="tel">
                        </div>
                        <div class="form-group">
                            <label class="form-label">الموظف المسؤول</label>
                            <select class="form-select" id="installment-employee">
                                <option value="">اختر الموظف</option>
                                <!-- سيتم ملؤها ديناميكيًا -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">قيمة القسط الإجمالية <span class="required">*</span></label>
                            <input class="form-input" id="installment-total-amount" required type="number" min="0">
                        </div>
                        <div class="form-group">
                            <label class="form-label">الدفعة الأولى</label>
                            <input class="form-input" id="installment-down-payment" type="number" min="0" value="0">
                        </div>
                        <div class="form-group">
                            <label class="form-label">عدد الأقساط <span class="required">*</span></label>
                            <input class="form-input" id="installment-count" required type="number" min="1" value="1">
                        </div>
                        <div class="form-group">
                            <label class="form-label">فترة الأقساط</label>
                            <select class="form-select" id="installment-period">
                                <option value="monthly">شهري</option>
                                <option value="quarterly">ربع سنوي</option>
                                <option value="semi-annual">نصف سنوي</option>
                                <option value="annual">سنوي</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">تاريخ البدء <span class="required">*</span></label>
                            <input class="form-input" id="installment-start-date" required type="date">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">معلومات المنتج/الخدمة</label>
                        <textarea class="form-input" id="installment-product-info" rows="2"></textarea>
                    </div>
                    
                    <div class="installment-preview">
                        <h4>ملخص الأقساط</h4>
                        <div class="installment-summary">
                            <div class="summary-item">
                                <span class="summary-label">قيمة القسط الإجمالية:</span>
                                <span class="summary-value" id="summary-total-amount">0</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">الدفعة الأولى:</span>
                                <span class="summary-value" id="summary-down-payment">0</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">المبلغ المتبقي:</span>
                                <span class="summary-value" id="summary-remaining-amount">0</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">قيمة القسط الواحد:</span>
                                <span class="summary-value" id="summary-installment-amount">0</span>
                            </div>
                        </div>
                        
                        <div class="installment-schedule-container">
                            <h4>جدول الأقساط</h4>
                            <div class="table-container">
                                <table id="installment-schedule-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>تاريخ الاستحقاق</th>
                                            <th>قيمة القسط</th>
                                            <th>الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- سيتم ملؤها ديناميكيًا -->
                                    </tbody>
                                </table>
                            </div>
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
    
    // إضافة نافذة عرض تفاصيل الموظف
    const employeeDetailsModal = document.createElement('div');
    employeeDetailsModal.className = 'modal-overlay';
    employeeDetailsModal.id = 'employee-details-modal';
    employeeDetailsModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">تفاصيل الموظف</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div id="employee-details-content">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إغلاق</button>
                <div class="btn-group">
                    <button class="btn btn-primary" id="edit-employee-details-btn">
                        <i class="fas fa-edit"></i>
                        <span>تعديل</span>
                    </button>
                    <button class="btn btn-success" id="pay-employee-salary-btn">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>صرف راتب</span>
                    </button>
                    <button class="btn btn-danger" id="delete-employee-details-btn">
                        <i class="fas fa-trash"></i>
                        <span>حذف</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة نافذة طباعة إيصال الراتب
    const printSalaryModal = document.createElement('div');
    printSalaryModal.className = 'modal-overlay';
    printSalaryModal.id = 'print-salary-modal';
    printSalaryModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">إيصال الراتب</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div id="salary-receipt" class="salary-receipt">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إغلاق</button>
                <button class="btn btn-primary" id="print-salary-btn">
                    <i class="fas fa-print"></i>
                    <span>طباعة</span>
                </button>
            </div>
        </div>
    `;
    
    // إضافة النوافذ المنبثقة إلى الصفحة
    document.body.appendChild(addEmployeeModal);
    document.body.appendChild(paySalaryModal);
    document.body.appendChild(addInstallmentModal);
    document.body.appendChild(employeeDetailsModal);
    document.body.appendChild(printSalaryModal);
    
    // إضافة النمط الخاص بالنظام
    addEmployeeStyles();
    
    console.log('تمت إضافة النوافذ المنبثقة للنظام بنجاح');
}
    
    // إضافة صفحة الرواتب
    const salariesPage = document.createElement('div');
    salariesPage.className = 'page';
    salariesPage.id = 'salaries-page';
    salariesPage.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">سجل الرواتب</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" placeholder="بحث عن راتب..." type="text" id="salary-search" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-success" id="pay-salary-btn">
                    <i class="fas fa-hand-holding-usd"></i>
                    <span>صرف راتب</span>
                </button>
            </div>
        </div>
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">سجل الرواتب</h2>
                <div class="section-actions">
                    <div class="btn-group">
                        <button class="btn btn-outline btn-sm active" data-period="all">الكل</button>
                        <button class="btn btn-outline btn-sm" data-period="current-month">الشهر الحالي</button>
                        <button class="btn btn-outline btn-sm" data-period="previous-month">الشهر السابق</button>
                    </div>
                    <button class="btn btn-outline btn-sm" id="export-salaries-btn" title="تصدير">
                        <i class="fas fa-download"></i>
                        <span>تصدير</span>
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table id="salaries-table">
                    <thead>
                        <tr>
                            <th>الموظف</th>
                            <th>التاريخ</th>
                            <th>الراتب الأساسي</th>
                            <th>المبيعات</th>
                            <th>العمولة</th>
                            <th>العلاوات</th>
                            <th>الاستقطاعات</th>
                            <th>الراتب النهائي</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // إضافة صفحة الأقساط
    const installmentsPage = document.createElement('div');
    installmentsPage.className = 'page';
    installmentsPage.id = 'installments-page';
    installmentsPage.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">نظام الأقساط</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" placeholder="بحث عن قسط..." type="text" id="installment-search" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-primary" id="add-installment-btn">
                    <i class="fas fa-plus"></i>
                    <span>إضافة قسط جديد</span>
                </button>
            </div>
        </div>
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">سجل الأقساط</h2>
                <div class="section-actions">
                    <div class="btn-group">
                        <button class="btn btn-outline btn-sm active" data-status="all">الكل</button>
                        <button class="btn btn-outline btn-sm" data-status="active">نشط</button>
                        <button class="btn btn-outline btn-sm" data-status="paid">مدفوع</button>
                        <button class="btn btn-outline btn-sm" data-status="overdue">متأخر</button>
                    </div>
                    <button class="btn btn-outline btn-sm" id="export-installments-btn" title="تصدير">
                        <i class="fas fa-download"></i>
                        <span>تصدير</span>
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table id="installments-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الموظف المسؤول</th>
                            <th>قيمة القسط</th>
                            <th>عدد الأقساط</th>
                            <th>المدفوع</th>
                            <th>المتبقي</th>
                            <th>حالة القسط</th>
                            <th>تاريخ الاستحقاق</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- تبويب تقارير الأقساط -->
        <div class="section mt-4">
            <div class="section-header">
                <h2 class="section-title">تقارير الأقساط</h2>
                <div class="section-actions">
                    <div class="btn-group">
                        <button class="btn btn-outline btn-sm active" data-report-period="monthly">شهري</button>
                        <button class="btn btn-outline btn-sm" data-report-period="quarterly">ربع سنوي</button>
                        <button class="btn btn-outline btn-sm" data-report-period="yearly">سنوي</button>
                    </div>
                </div>
            </div>
            <div class="grid-cols-2">
                <div class="chart-container">
                    <h3 class="chart-title">متابعة الأقساط</h3>
                    <canvas id="installments-chart"></canvas>
                </div>
                <div class="chart-container">
                    <h3 class="chart-title">نسبة تحصيل الأقساط</h3>
                    <canvas id="installments-collection-chart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // إضافة صفحة تقارير الموظفين
    const employeeReportsPage = document.createElement('div');
    employeeReportsPage.className = 'page';
    employeeReportsPage.id = 'employee-reports-page';
    employeeReportsPage.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">تقارير الموظفين</h1>
            <div class="header-actions">
                <div class="btn-group">
                    <button class="btn btn-outline active" data-period="monthly">شهري</button>
                    <button class="btn btn-outline" data-period="quarterly">ربع سنوي</button>
                    <button class="btn btn-outline" data-period="yearly">سنوي</button>
                </div>
                <button class="btn btn-primary" id="export-employee-report-btn">
                    <i class="fas fa-download"></i>
                    <span>تصدير التقرير</span>
                </button>
            </div>
        </div>
        <div class="grid-cols-2">
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">الرواتب الشهرية</h2>
                </div>
                <div class="chart-container">
                    <canvas id="monthly-salaries-chart"></canvas>
                </div>
            </div>
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">أداء الموظفين</h2>
                </div>
                <div class="chart-container">
                    <canvas id="employee-performance-chart"></canvas>
                </div>
            </div>
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">توزيع المبيعات</h2>
                </div>
                <div class="chart-container">
                    <canvas id="sales-distribution-chart"></canvas>
                </div>
            </div>
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">أداء الأقسام</h2>
                </div>
                <div class="chart-container">
                    <canvas id="departments-performance-chart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // إضافة الصفحات إلى العنصر الرئيسي
    mainContent.appendChild(employeesPage);
    mainContent.appendChild(salariesPage);
    mainContent.appendChild(installmentsPage);
    mainContent.appendChild(employeeReportsPage);
    
    // إضافة عنصر القائمة لصفحة تقارير الموظفين
    const reportItem = document.createElement('li');
    reportItem.className = 'nav-item';
    reportItem.innerHTML = `
        <a class="nav-link" data-page="employee-reports" href="#">
            <div class="nav-icon">
                <i class="fas fa-chart-line"></i>
            </div>
            <span>تقارير الموظفين</span>
        </a>
    `;
    
    // إضافة العنصر للقائمة مباشرة بعد الأقساط
    const settingsItem = document.querySelector('.nav-link[data-page="settings"]').parentElement;
    const navList = document.querySelector('.sidebar .nav-list');
    navList.insertBefore(reportItem, settingsItem);
    
    console.log('تمت إضافة صفحات الموظفين والرواتب والأقساط بنجاح');


// إضافة النوافذ المنبثقة للنظام
function addEmployeeModals() {
    console.log('إضافة النوافذ المنبثقة للنظام...');
    
    // التحقق من عدم وجود النوافذ مسبقًا
    if (document.getElementById('add-employee-modal')) {
        console.log('النوافذ المنبثقة موجودة بالفعل.');
        return;
    }
    
    // إضافة نافذة إضافة/تعديل موظف
    const addEmployeeModal = document.createElement('div');
    addEmployeeModal.className = 'modal-overlay';
    addEmployeeModal.id = 'add-employee-modal';
    addEmployeeModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title" id="employee-modal-title">إضافة موظف جديد</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <form id="employee-form">
                    <input type="hidden" id="employee-id">
                    
                    <div class="tabs">
                        <div class="tab-buttons">
                            <button type="button" class="tab-btn active" data-tab="personal-info">المعلومات الشخصية</button>
                            <button type="button" class="tab-btn" data-tab="job-info">المعلومات الوظيفية</button>
                            <button type="button" class="tab-btn" data-tab="documents">الوثائق</button>
                        </div>
                        
                        <!-- المعلومات الشخصية -->
                        <div class="tab-content active" id="personal-info-tab">
                            <div class="employee-avatar-container">
                                <div class="employee-avatar" id="employee-avatar-preview">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="avatar-upload">
                                    <label for="employee-avatar" class="btn btn-sm btn-primary">
                                        <i class="fas fa-upload"></i> رفع صورة
                                    </label>
                                    <input type="file" id="employee-avatar" accept="image/*" style="display:none">
                                </div>
                            </div>
                            
                            <div class="grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">الاسم الكامل <span class="required">*</span></label>
                                    <input class="form-input" id="employee-name" required type="text">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">رقم الهاتف <span class="required">*</span></label>
                                    <input class="form-input" id="employee-phone" required type="tel">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">البريد الإلكتروني</label>
                                    <input class="form-input" id="employee-email" type="email">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">تاريخ الميلاد</label>
                                    <input class="form-input" id="employee-birthdate" type="date">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">العنوان</label>
                                    <input class="form-input" id="employee-address" type="text">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">الجنس</label>
                                    <select class="form-select" id="employee-gender">
                                        <option value="male">ذكر</option>
                                        <option value="female">أنثى</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- المعلومات الوظيفية -->
                        <div class="tab-content" id="job-info-tab">
                            <div class="grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">المسمى الوظيفي <span class="required">*</span></label>
                                    <input class="form-input" id="employee-job-title" required type="text">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">القسم</label>
                                    <select class="form-select" id="employee-department">
                                        <option value="sales">المبيعات</option>
                                        <option value="admin">الإدارة</option>
                                        <option value="finance">المالية</option>
                                        <option value="operations">العمليات</option>
                                        <option value="it">تقنية المعلومات</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">الراتب الأساسي <span class="required">*</span></label>
                                    <input class="form-input" id="employee-salary" required type="number" min="0">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">نسبة المبيعات (%)</label>
                                    <input class="form-input" id="employee-commission" type="number" min="0" max="100" step="0.5" value="0">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">تاريخ التعيين <span class="required">*</span></label>
                                    <input class="form-input" id="employee-hire-date" required type="date">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">نوع العقد</label>
                                    <select class="form-select" id="employee-contract-type">
                                        <option value="full-time">دوام كامل</option>
                                        <option value="part-time">دوام جزئي</option>
                                        <option value="temporary">عقد مؤقت</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">حالة الموظف</label>
                                    <select class="form-select" id="employee-status">
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- الوثائق -->
                        <div class="tab-content" id="documents-tab">
                            <div class="grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">رقم البطاقة الوطنية</label>
                                    <input class="form-input" id="employee-id-number" type="text">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">رقم بطاقة السكن</label>
                                    <input class="form-input" id="employee-residence-card" type="text">
                                </div>
                            </div>
                            
                            <div class="document-upload-container">
                                <div class="document-upload">
                                    <label>صورة البطاقة الوطنية</label>
                                    <div class="document-preview" id="id-card-preview">
                                        <i class="fas fa-id-card"></i>
                                        <span>لم يتم رفع صورة</span>
                                    </div>
                                    <label for="id-card-upload" class="btn btn-sm btn-primary">
                                        <i class="fas fa-upload"></i> رفع صورة
                                    </label>
                                    <input type="file" id="id-card-upload" accept="image/*" style="display:none">
                                </div>
                                
                                <div class="document-upload">
                                    <label>صورة بطاقة السكن</label>
                                    <div class="document-preview" id="residence-card-preview">
                                        <i class="fas fa-home"></i>
                                        <span>لم يتم رفع صورة</span>
                                    </div>
                                    <label for="residence-card-upload" class="btn btn-sm btn-primary">
                                        <i class="fas fa-upload"></i> رفع صورة
                                    </label>
                                    <input type="file" id="residence-card-upload" accept="image/*" style="display:none">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">ملاحظات إضافية</label>
                                <textarea class="form-input" id="employee-notes" rows="3"></textarea>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-primary" id="save-employee-btn">حفظ</button>
            </div>
        </div>
    `;
}
    // إضافة نافذة إضافة/تعديل قسط
    // إضافة نافذة دفع راتب
    const paySalaryModal = document.createElement('div');
    paySalaryModal.className = 'modal-overlay';
    paySalaryModal.id = 'pay-salary-modal';
    paySalaryModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">صرف راتب</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <form id="salary-form">
                    <div class="form-group">
                        <label class="form-label">الموظف <span class="required">*</span></label>
                        <select class="form-select" id="salary-employee" required>
                            <option value="">اختر الموظف</option>
                            <!-- سيتم ملؤها ديناميكيًا -->
                        </select>
                    </div>
                    
                    <div id="employee-salary-details" style="display:none;">
                        <div class="employee-salary-info">
                            <div class="employee-info">
                                <div class="employee-avatar-small" id="salary-employee-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="employee-data">
                                    <h4 id="salary-employee-name">-</h4>
                                    <p id="salary-employee-jobtitle">-</p>
                                </div>
                            </div>
                            <div class="salary-basic-info">
                                <div class="info-item">
                                    <span class="info-label">الراتب الأساسي:</span>
                                    <span class="info-value" id="salary-basic-amount">-</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">نسبة العمولة:</span>
                                    <span class="info-value" id="salary-commission-rate">-</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid-cols-2">
                            <div class="form-group">
                                <label class="form-label">شهر الراتب <span class="required">*</span></label>
                                <input class="form-input" id="salary-month" required type="month">
                            </div>
                            <div class="form-group">
                                <label class="form-label">تاريخ الصرف <span class="required">*</span></label>
                                <input class="form-input" id="salary-date" required type="date">
                            </div>
                            <div class="form-group">
                                <label class="form-label">إجمالي المبيعات</label>
                                <input class="form-input" id="salary-sales" type="number" min="0" value="0">
                            </div>
                            <div class="form-group">
                                <label class="form-label">قيمة العمولة</label>
                                <input class="form-input" id="salary-commission" type="number" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label">العلاوات</label>
                                <input class="form-input" id="salary-bonus" type="number" min="0" value="0">
                            </div>
                            <div class="form-group">
                                <label class="form-label">الاستقطاعات</label>
                                <input class="form-input" id="salary-deductions" type="number" min="0" value="0">
                            </div>
                        </div>
                        
                        <div class="salary-summary">
                            <div class="summary-title">ملخص الراتب</div>
                            <div class="summary-items">
                                <div class="summary-item">
                                    <span class="summary-label">الراتب الأساسي:</span>
                                    <span class="summary-value" id="summary-basic-salary">0</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">العمولة:</span>
                                    <span class="summary-value" id="summary-commission">0</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">العلاوات:</span>
                                    <span class="summary-value" id="summary-bonus">0</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">الاستقطاعات:</span>
                                    <span class="summary-value" id="summary-deductions">0</span>
                                </div>
                                <div class="summary-item total">
                                    <span class="summary-label">إجمالي الراتب:</span>
                                    <span class="summary-value" id="summary-total">0</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-input" id="salary-notes" rows="2"></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-success" id="save-salary-btn">صرف الراتب</button>
            </div>
        </div>
    `;

    /**
 * Continuation of employees-installments.js
 * نظام إدارة الموظفين والأقساط المتكامل - تكملة الكود
 */

// إضافة أنماط CSS للموظفين والأقساط (تكملة)
function addEmployeeStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('employee-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'employee-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* أنماط صفحة الموظفين */
        .employee-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background-color: #f0f4ff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: #3b82f6;
            overflow: hidden;
            margin-bottom: 10px;
        }
        
        .employee-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .employee-avatar-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .employee-avatar-small {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #f0f4ff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            color: #3b82f6;
            overflow: hidden;
        }
        
        .employee-avatar-small img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .employee-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .employee-data h4 {
            margin: 0;
            font-size: 1.1rem;
        }
        
        .employee-data p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .employee-salary-info {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
        }
        
        .salary-basic-info {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .info-item {
            display: flex;
            gap: 5px;
        }
        
        .info-label {
            font-weight: 500;
            color: #4b5563;
        }
        
        .info-value {
            color: #1f2937;
        }
        
        .salary-summary {
            background-color: #f0f4ff;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .summary-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: #1f2937;
        }
        
        .summary-items {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
        }
        
        .summary-item.total {
            border-top: 1px solid #d1d5db;
            padding-top: 8px;
            margin-top: 5px;
            font-weight: 600;
        }
        
        .document-upload-container {
            display: flex;
            gap: 20px;
            margin: 15px 0;
        }
        
        .document-upload {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .document-preview {
            width: 150px;
            height: 100px;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            overflow: hidden;
        }
        
        .document-preview i {
            font-size: 1.5rem;
            margin-bottom: 5px;
        }
        
        .document-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .required {
            color: #ef4444;
        }
        
        .mt-4 {
            margin-top: 1.5rem;
        }
        
        /* أنماط إيصال الراتب */
        .salary-receipt {
            background-color: white;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .receipt-header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .receipt-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .receipt-section {
            margin-bottom: 20px;
        }
        
        .receipt-section-title {
            font-weight: 600;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        
        .receipt-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
        }
        
        .receipt-total {
            font-weight: 600;
            border-top: 2px solid #e5e7eb;
            padding-top: 10px;
            margin-top: 10px;
        }
        
        .receipt-footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        /* أنماط تفاصيل الموظف */
        .employee-details-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .employee-details-header {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .employee-personal-info {
            flex: 1;
        }
        
        .employee-title {
            font-size: 1.5rem;
            margin: 0 0 5px 0;
        }
        
        .employee-subtitle {
            color: #6b7280;
            margin: 0;
        }
        
        .employee-badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .badge-active {
            background-color: #d1fae5;
            color: #065f46;
        }
        
        .badge-inactive {
            background-color: #fee2e2;
            color: #991b1b;
        }
        
        .employee-details-section {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .section-header {
            background-color: #f9fafb;
            padding: 10px 15px;
            font-weight: 600;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .section-content {
            padding: 15px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .info-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .info-group-label {
            font-weight: 500;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .info-group-value {
            color: #1f2937;
        }
        
        .document-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .document-card-image {
            height: 150px;
            overflow: hidden;
        }
        
        .document-card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .document-card-title {
            padding: 10px;
            background-color: #f9fafb;
            font-weight: 500;
            font-size: 0.9rem;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .documents-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 10px;
        }
        
        @media print {
            body * {
                visibility: hidden;
            }
            
            #print-salary-modal .modal,
            #print-salary-modal .modal * {
                visibility: visible;
            }
            
            #print-salary-modal .modal {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: white;
                box-shadow: none;
            }
            
            #print-salary-modal .modal-header,
            #print-salary-modal .modal-footer {
                display: none;
            }
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للموظفين والأقساط');
}

// إعداد مستمعي الأحداث
function setupEmployeeEventListeners() {
    console.log('إعداد مستمعي الأحداث للنظام...');
    
    // إعداد مستمعي الأحداث للتنقل
    setupNavigationListeners();
    
    // إعداد مستمعي الأحداث للموظفين
    setupEmployeesListeners();
    
    // إعداد مستمعي الأحداث للرواتب
    setupSalariesListeners();
    
    // إعداد مستمعي الأحداث للأقساط
    setupInstallmentsListeners();
    
    // إعداد مستمعي الأحداث للتبويبات
    setupTabsListeners();
    
    console.log('تم إعداد مستمعي الأحداث بنجاح');
}

// إعداد مستمعي الأحداث للتنقل
function setupNavigationListeners() {
    // التنقل بين الصفحات
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        // إضافة مستمع حدث للروابط الجديدة فقط
        if (!link.hasListener) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const pageId = this.getAttribute('data-page');
                
                // استدعاء دالة عرض الصفحة إذا كانت موجودة
                if (typeof window.showPage === 'function') {
                    window.showPage(pageId);
                } else {
                    // إخفاء جميع الصفحات
                    document.querySelectorAll('.page').forEach(page => {
                        page.classList.remove('active');
                    });
                    
                    // إظهار الصفحة المطلوبة
                    const targetPage = document.getElementById(`${pageId}-page`);
                    if (targetPage) {
                        targetPage.classList.add('active');
                    }
                    
                    // تحديث حالة التنقل
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                    });
                    
                    this.classList.add('active');
                }
            });
            
            // تعليم الرابط بأنه تمت إضافة مستمع الحدث
            link.hasListener = true;
        }
    });
}

// إعداد مستمعي الأحداث للتبويبات
function setupTabsListeners() {
    // التبديل بين التبويبات
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        // إضافة مستمع حدث للأزرار الجديدة فقط
        if (!btn.hasListener) {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // إزالة الفئة النشطة من جميع أزرار التبويبات
                this.parentElement.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active');
                });
                
                // إضافة الفئة النشطة لهذا الزر
                this.classList.add('active');
                
                // إزالة الفئة النشطة من جميع محتويات التبويبات
                const tabContainer = this.closest('.tabs');
                if (tabContainer) {
                    tabContainer.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    // إضافة الفئة النشطة لمحتوى التبويب المطلوب
                    const targetTab = tabContainer.querySelector(`#${tabId}-tab`);
                    if (targetTab) {
                        targetTab.classList.add('active');
                    }
                }
            });
            
            // تعليم الزر بأنه تمت إضافة مستمع الحدث
            btn.hasListener = true;
        }
    });
}

// إعداد مستمعي الأحداث للموظفين
function setupEmployeesListeners() {
    // فتح نافذة إضافة موظف جديد
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    if (addEmployeeBtn && !addEmployeeBtn.hasListener) {
        addEmployeeBtn.addEventListener('click', () => {
            openAddEmployeeModal();
        });
        addEmployeeBtn.hasListener = true;
    }
    
    // حفظ بيانات الموظف
    const saveEmployeeBtn = document.getElementById('save-employee-btn');
    if (saveEmployeeBtn && !saveEmployeeBtn.hasListener) {
        saveEmployeeBtn.addEventListener('click', () => {
            saveEmployee();
        });
        saveEmployeeBtn.hasListener = true;
    }
    
    // إغلاق النوافذ المنبثقة
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        if (!btn.hasListener) {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal-overlay');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
            btn.hasListener = true;
        }
    });
    
    // مستمعي الأحداث للبحث والتصفية في صفحة الموظفين
    setupEmployeeSearchAndFilter();
    
    // مستمع حدث تصدير بيانات الموظفين
    const exportEmployeesBtn = document.getElementById('export-employees-btn');
    if (exportEmployeesBtn && !exportEmployeesBtn.hasListener) {
        exportEmployeesBtn.addEventListener('click', () => {
            exportEmployeesToExcel();
        });
        exportEmployeesBtn.hasListener = true;
    }
}

// إعداد البحث والتصفية في صفحة الموظفين
function setupEmployeeSearchAndFilter() {
    // مستمع حدث البحث
    const employeeSearch = document.getElementById('employee-search');
    if (employeeSearch && !employeeSearch.hasListener) {
        employeeSearch.addEventListener('input', function() {
            const searchText = this.value.trim().toLowerCase();
            filterEmployeesTable(searchText);
        });
        employeeSearch.hasListener = true;
    }
    
    // مستمعي أحداث أزرار التصفية
    const filterButtons = document.querySelectorAll('#employees-page .btn-group .btn[data-filter]');
    filterButtons.forEach(btn => {
        if (!btn.hasListener) {
            btn.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع الأزرار
                filterButtons.forEach(b => b.classList.remove('active'));
                
                // إضافة الفئة النشطة لهذا الزر
                this.classList.add('active');
                
                // تطبيق التصفية
                const filter = this.getAttribute('data-filter');
                const searchText = document.getElementById('employee-search')?.value.trim().toLowerCase() || '';
                filterEmployeesTable(searchText, filter);
            });
            btn.hasListener = true;
        }
    });
}

// تصفية جدول الموظفين
function filterEmployeesTable(searchText = '', filter = 'all') {
    const tableRows = document.querySelectorAll('#employees-table tbody tr');
    
    tableRows.forEach(row => {
        const employeeName = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        const employeePhone = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
        const employeeJobTitle = row.querySelector('td:nth-child(4)')?.textContent.toLowerCase() || '';
        const employeeStatus = row.querySelector('td:nth-child(8)')?.textContent.toLowerCase() || '';
        
        const matchesSearch = !searchText || 
            employeeName.includes(searchText) || 
            employeePhone.includes(searchText) || 
            employeeJobTitle.includes(searchText);
        
        const matchesFilter = filter === 'all' || 
            (filter === 'active' && employeeStatus.includes('نشط')) || 
            (filter === 'inactive' && employeeStatus.includes('غير نشط'));
        
        row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    });
}

// إعداد مستمعي الأحداث للرواتب
function setupSalariesListeners() {
    // فتح نافذة دفع راتب
    const paySalaryBtn = document.getElementById('pay-salary-btn');
    if (paySalaryBtn && !paySalaryBtn.hasListener) {
        paySalaryBtn.addEventListener('click', () => {
            openPaySalaryModal();
        });
        paySalaryBtn.hasListener = true;
    }
    
    // حفظ بيانات الراتب
    const saveSalaryBtn = document.getElementById('save-salary-btn');
    if (saveSalaryBtn && !saveSalaryBtn.hasListener) {
        saveSalaryBtn.addEventListener('click', () => {
            saveSalary();
        });
        saveSalaryBtn.hasListener = true;
    }
    
    // مستمع حدث اختيار الموظف لصرف الراتب
    const salaryEmployeeSelect = document.getElementById('salary-employee');
    if (salaryEmployeeSelect && !salaryEmployeeSelect.hasListener) {
        salaryEmployeeSelect.addEventListener('change', function() {
            updateSalaryEmployeeDetails(this.value);
        });
        salaryEmployeeSelect.hasListener = true;
    }
    
    // مستمع حدث تغيير قيمة المبيعات
    const salarySalesInput = document.getElementById('salary-sales');
    if (salarySalesInput && !salarySalesInput.hasListener) {
        salarySalesInput.addEventListener('input', function() {
            updateSalaryCommission();
        });
        salarySalesInput.hasListener = true;
    }
    
    // مستمعي أحداث العلاوات والاستقطاعات
    const salaryBonusInput = document.getElementById('salary-bonus');
    const salaryDeductionsInput = document.getElementById('salary-deductions');
    
    if (salaryBonusInput && !salaryBonusInput.hasListener) {
        salaryBonusInput.addEventListener('input', updateSalarySummary);
        salaryBonusInput.hasListener = true;
    }
    
    if (salaryDeductionsInput && !salaryDeductionsInput.hasListener) {
        salaryDeductionsInput.addEventListener('input', updateSalarySummary);
        salaryDeductionsInput.hasListener = true;
    }
    
    // مستمع حدث طباعة إيصال الراتب
    const printSalaryBtn = document.getElementById('print-salary-btn');
    if (printSalaryBtn && !printSalaryBtn.hasListener) {
        printSalaryBtn.addEventListener('click', function() {
            printSalaryReceipt();
        });
        printSalaryBtn.hasListener = true;
    }
    
    // مستمعي الأحداث للبحث والتصفية في صفحة الرواتب
    setupSalarySearchAndFilter();
}

// إعداد البحث والتصفية في صفحة الرواتب
function setupSalarySearchAndFilter() {
    // مستمع حدث البحث
    const salarySearch = document.getElementById('salary-search');
    if (salarySearch && !salarySearch.hasListener) {
        salarySearch.addEventListener('input', function() {
            const searchText = this.value.trim().toLowerCase();
            filterSalariesTable(searchText);
        });
        salarySearch.hasListener = true;
    }
    
    // مستمعي أحداث أزرار التصفية
    const periodButtons = document.querySelectorAll('#salaries-page .btn-group .btn[data-period]');
    periodButtons.forEach(btn => {
        if (!btn.hasListener) {
            btn.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع الأزرار
                periodButtons.forEach(b => b.classList.remove('active'));
                
                // إضافة الفئة النشطة لهذا الزر
                this.classList.add('active');
                
                // تطبيق التصفية
                const period = this.getAttribute('data-period');
                const searchText = document.getElementById('salary-search')?.value.trim().toLowerCase() || '';
                filterSalariesTable(searchText, period);
            });
            btn.hasListener = true;
        }
    });
}

// تصفية جدول الرواتب
function filterSalariesTable(searchText = '', period = 'all') {
    const tableRows = document.querySelectorAll('#salaries-table tbody tr');
    
    // الحصول على تاريخ بداية الفترة
    let startDate = null;
    if (period === 'current-month') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'previous-month') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    }
    
    tableRows.forEach(row => {
        const employeeName = row.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || '';
        const salaryDate = row.querySelector('td:nth-child(2)')?.textContent || '';
        
        const matchesSearch = !searchText || employeeName.includes(searchText);
        
        let matchesPeriod = true;
        if (period !== 'all' && salaryDate) {
            const rowDate = new Date(salaryDate);
            
            if (period === 'current-month') {
                const now = new Date();
                matchesPeriod = rowDate.getMonth() === now.getMonth() && 
                                rowDate.getFullYear() === now.getFullYear();
            } else if (period === 'previous-month') {
                const now = new Date();
                const previousMonth = now.getMonth() - 1 < 0 ? 11 : now.getMonth() - 1;
                const yearToCheck = previousMonth === 11 ? now.getFullYear() - 1 : now.getFullYear();
                matchesPeriod = rowDate.getMonth() === previousMonth && 
                                rowDate.getFullYear() === yearToCheck;
            }
        }
        
        row.style.display = matchesSearch && matchesPeriod ? '' : 'none';
    });
}

// إعداد مستمعي الأحداث للأقساط
function setupInstallmentsListeners() {
    // فتح نافذة إضافة قسط جديد
    const addInstallmentBtn = document.getElementById('add-installment-btn');
    if (addInstallmentBtn && !addInstallmentBtn.hasListener) {
        addInstallmentBtn.addEventListener('click', () => {
            openAddInstallmentModal();
        });
        addInstallmentBtn.hasListener = true;
    }
    
    // حفظ بيانات القسط
    const saveInstallmentBtn = document.getElementById('save-installment-btn');
    if (saveInstallmentBtn && !saveInstallmentBtn.hasListener) {
        saveInstallmentBtn.addEventListener('click', () => {
            saveInstallment();
        });
        saveInstallmentBtn.hasListener = true;
    }
    
    // مستمعي أحداث تغيير بيانات القسط
    setupInstallmentCalculationListeners();
    
    // مستمعي الأحداث للبحث والتصفية في صفحة الأقساط
    setupInstallmentSearchAndFilter();
}

// إعداد مستمعي أحداث حساب القسط
function setupInstallmentCalculationListeners() {
    // قائمة الحقول التي تؤثر على حساب القسط
    const calculationFields = [
        'installment-total-amount',
        'installment-down-payment',
        'installment-count',
        'installment-period',
        'installment-start-date'
    ];
    
    calculationFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.hasListener) {
            field.addEventListener('input', function() {
                calculateInstallmentDetails();
            });
            field.hasListener = true;
        }
    });
}

// إعداد البحث والتصفية في صفحة الأقساط
function setupInstallmentSearchAndFilter() {
    // مستمع حدث البحث
    const installmentSearch = document.getElementById('installment-search');
    if (installmentSearch && !installmentSearch.hasListener) {
        installmentSearch.addEventListener('input', function() {
            const searchText = this.value.trim().toLowerCase();
            filterInstallmentsTable(searchText);
        });
        installmentSearch.hasListener = true;
    }
    
    // مستمعي أحداث أزرار التصفية
    const statusButtons = document.querySelectorAll('#installments-page .btn-group .btn[data-status]');
    statusButtons.forEach(btn => {
        if (!btn.hasListener) {
            btn.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع الأزرار
                statusButtons.forEach(b => b.classList.remove('active'));
                
                // إضافة الفئة النشطة لهذا الزر
                this.classList.add('active');
                
                // تطبيق التصفية
                const status = this.getAttribute('data-status');
                const searchText = document.getElementById('installment-search')?.value.trim().toLowerCase() || '';
                filterInstallmentsTable(searchText, status);
            });
            btn.hasListener = true;
        }
    });
}

// تصفية جدول الأقساط
function filterInstallmentsTable(searchText = '', status = 'all') {
    const tableRows = document.querySelectorAll('#installments-table tbody tr');
    
    tableRows.forEach(row => {
        const customerName = row.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || '';
        const employeeName = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        const installmentStatus = row.querySelector('td:nth-child(7)')?.textContent.toLowerCase() || '';
        
        const matchesSearch = !searchText || 
            customerName.includes(searchText) || 
            employeeName.includes(searchText);
        
        const matchesStatus = status === 'all' || 
            (status === 'active' && (installmentStatus.includes('نشط') || installmentStatus.includes('جاري'))) || 
            (status === 'paid' && installmentStatus.includes('مدفوع')) || 
            (status === 'overdue' && installmentStatus.includes('متأخر'));
        
        row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
}

// إعداد نظام رفع الصور
function setupImageUpload() {
    console.log('إعداد نظام رفع الصور...');
    
    // رفع صورة الموظف
    const employeeAvatarInput = document.getElementById('employee-avatar');
    if (employeeAvatarInput && !employeeAvatarInput.hasListener) {
        employeeAvatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('employee-avatar-preview');
                    if (preview) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="صورة الموظف">`;
                        
                        // تخزين الصورة في متغير مؤقت
                        window.tempEmployeeAvatar = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        employeeAvatarInput.hasListener = true;
    }
    
    // رفع صورة البطاقة الوطنية
    const idCardInput = document.getElementById('id-card-upload');
    if (idCardInput && !idCardInput.hasListener) {
        idCardInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('id-card-preview');
                    if (preview) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="صورة البطاقة الوطنية">`;
                        
                        // تخزين الصورة في متغير مؤقت
                        window.tempIdCard = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        idCardInput.hasListener = true;
    }
    
    // رفع صورة بطاقة السكن
    const residenceCardInput = document.getElementById('residence-card-upload');
    if (residenceCardInput && !residenceCardInput.hasListener) {
        residenceCardInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('residence-card-preview');
                    if (preview) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="صورة بطاقة السكن">`;
                        
                        // تخزين الصورة في متغير مؤقت
                        window.tempResidenceCard = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        residenceCardInput.hasListener = true;
    }
}

// فتح نافذة إضافة موظف جديد
function openAddEmployeeModal(employeeId = null) {
    console.log('فتح نافذة إضافة موظف جديد...');
    
    const modal = document.getElementById('add-employee-modal');
    if (!modal) return;
    
    // إعادة تعيين النموذج
    const form = document.getElementById('employee-form');
    if (form) form.reset();
    
    // مسح الصور المؤقتة
    window.tempEmployeeAvatar = null;
    window.tempIdCard = null;
    window.tempResidenceCard = null;
    
    // إعادة تعيين معاينات الصور
    const avatarPreview = document.getElementById('employee-avatar-preview');
    if (avatarPreview) avatarPreview.innerHTML = '<i class="fas fa-user"></i>';
    
    const idCardPreview = document.getElementById('id-card-preview');
    if (idCardPreview) {
        idCardPreview.innerHTML = '<i class="fas fa-id-card"></i><span>لم يتم رفع صورة</span>';
    }
    
    const residenceCardPreview = document.getElementById('residence-card-preview');
    if (residenceCardPreview) {
        residenceCardPreview.innerHTML = '<i class="fas fa-home"></i><span>لم يتم رفع صورة</span>';
    }
    
    // تحديث عنوان النافذة وزر الحفظ
    const modalTitle = document.getElementById('employee-modal-title');
    if (modalTitle) modalTitle.textContent = employeeId ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد';
    
    const saveBtn = document.getElementById('save-employee-btn');
    if (saveBtn) saveBtn.textContent = employeeId ? 'حفظ التعديلات' : 'حفظ';
    
    // إذا كان هناك معرف موظف، قم بتحميل بياناته
    if (employeeId) {
        loadEmployeeForEditing(employeeId);
    } else {
        // تعيين تاريخ اليوم كتاريخ افتراضي للتعيين
        const hireDateInput = document.getElementById('employee-hire-date');
        if (hireDateInput) hireDateInput.value = new Date().toISOString().split('T')[0];
        
        // تعيين معرف الموظف
        const employeeIdInput = document.getElementById('employee-id');
        if (employeeIdInput) employeeIdInput.value = '';
    }
    
    // إظهار النافذة
    modal.classList.add('active');
}

// تحميل بيانات الموظف للتعديل
function loadEmployeeForEditing(employeeId) {
    console.log(`تحميل بيانات الموظف للتعديل: ${employeeId}`);
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على بيانات الموظف', 'error');
        return;
    }
    
    // تعيين معرف الموظف
    const employeeIdInput = document.getElementById('employee-id');
    if (employeeIdInput) employeeIdInput.value = employee.id;
    
    // تعبئة المعلومات الشخصية
    document.getElementById('employee-name')?.setAttribute('value', employee.name || '');
    document.getElementById('employee-phone')?.setAttribute('value', employee.phone || '');
    document.getElementById('employee-email')?.setAttribute('value', employee.email || '');
    document.getElementById('employee-birthdate')?.setAttribute('value', employee.birthdate || '');
    document.getElementById('employee-address')?.setAttribute('value', employee.address || '');
    
    const genderSelect = document.getElementById('employee-gender');
    if (genderSelect && employee.gender) {
        genderSelect.value = employee.gender;
    }
    
    // تعبئة المعلومات الوظيفية
    document.getElementById('employee-job-title')?.setAttribute('value', employee.jobTitle || '');
    
    const departmentSelect = document.getElementById('employee-department');
    if (departmentSelect && employee.department) {
        departmentSelect.value = employee.department;
    }
    
    document.getElementById('employee-salary')?.setAttribute('value', employee.salary || '');
    document.getElementById('employee-commission')?.setAttribute('value', employee.commission || '');
    document.getElementById('employee-hire-date')?.setAttribute('value', employee.hireDate || '');
    
    const contractTypeSelect = document.getElementById('employee-contract-type');
    if (contractTypeSelect && employee.contractType) {
        contractTypeSelect.value = employee.contractType;
    }
    
    const statusSelect = document.getElementById('employee-status');
    if (statusSelect && employee.status) {
        statusSelect.value = employee.status;
    }
    
    // تعبئة معلومات الوثائق
    document.getElementById('employee-id-number')?.setAttribute('value', employee.idNumber || '');
    document.getElementById('employee-residence-card')?.setAttribute('value', employee.residenceCard || '');
    document.getElementById('employee-notes')?.innerHTML = employee.notes || '';
    
    // عرض الصور إذا كانت موجودة
    if (employee.avatarImage) {
        const avatarPreview = document.getElementById('employee-avatar-preview');
        if (avatarPreview) {
            avatarPreview.innerHTML = `<img src="${employee.avatarImage}" alt="صورة الموظف">`;
            window.tempEmployeeAvatar = employee.avatarImage;
        }
    }
    
    if (employee.idCardImage) {
        const idCardPreview = document.getElementById('id-card-preview');
        if (idCardPreview) {
            idCardPreview.innerHTML = `<img src="${employee.idCardImage}" alt="صورة البطاقة الوطنية">`;
            window.tempIdCard = employee.idCardImage;
        }
    }
    
    if (employee.residenceCardImage) {
        const residenceCardPreview = document.getElementById('residence-card-preview');
        if (residenceCardPreview) {
            residenceCardPreview.innerHTML = `<img src="${employee.residenceCardImage}" alt="صورة بطاقة السكن">`;
            window.tempResidenceCard = employee.residenceCardImage;
        }
    }
}

// حفظ بيانات الموظف
function saveEmployee() {
    console.log('حفظ بيانات الموظف...');
    
    // التحقق من صحة النموذج
    const form = document.getElementById('employee-form');
    if (!form) {
        showNotification('خطأ في النموذج', 'error');
        return;
    }
    
    // التحقق من الحقول المطلوبة
    const name = document.getElementById('employee-name')?.value;
    const phone = document.getElementById('employee-phone')?.value;
    const jobTitle = document.getElementById('employee-job-title')?.value;
    const salary = document.getElementById('employee-salary')?.value;
    const hireDate = document.getElementById('employee-hire-date')?.value;
    
    if (!name || !phone || !jobTitle || !salary || !hireDate) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // الحصول على معرف الموظف (إذا كان موجوداً)
    const employeeId = document.getElementById('employee-id')?.value;
    
    // إنشاء كائن الموظف
    const employee = {
        id: employeeId || Date.now().toString(),
        name,
        phone,
        email: document.getElementById('employee-email')?.value || '',
        birthdate: document.getElementById('employee-birthdate')?.value || '',
        address: document.getElementById('employee-address')?.value || '',
        gender: document.getElementById('employee-gender')?.value || 'male',
        
        jobTitle,
        department: document.getElementById('employee-department')?.value || 'sales',
        salary: parseFloat(salary),
        commission: parseFloat(document.getElementById('employee-commission')?.value || '0'),
        hireDate,
        contractType: document.getElementById('employee-contract-type')?.value || 'full-time',
        status: document.getElementById('employee-status')?.value || 'active',
        
        idNumber: document.getElementById('employee-id-number')?.value || '',
        residenceCard: document.getElementById('employee-residence-card')?.value || '',
        notes: document.getElementById('employee-notes')?.value || '',
        
        // إضافة الصور إذا كانت موجودة
        avatarImage: window.tempEmployeeAvatar || '',
        idCardImage: window.tempIdCard || '',
        residenceCardImage: window.tempResidenceCard || '',
        
        // تحديث تاريخ التعديل
        updatedAt: new Date().toISOString()
    };
    
    // إضافة/تحديث الموظف في المصفوفة
    if (employeeId) {
        // تحديث موظف موجود
        const index = employees.findIndex(emp => emp.id === employeeId);
        if (index !== -1) {
            // الاحتفاظ بتاريخ الإنشاء الأصلي
            employee.createdAt = employees[index].createdAt;
            
            // تحديث الموظف
            employees[index] = employee;
        } else {
            // إضافة الموظف إذا لم يتم العثور عليه
            employee.createdAt = new Date().toISOString();
            employees.push(employee);
        }
        
        showNotification(`تم تحديث بيانات الموظف ${name} بنجاح`, 'success');
    } else {
        // إضافة موظف جديد
        employee.createdAt = new Date().toISOString();
        employees.push(employee);
        
        showNotification(`تم إضافة الموظف ${name} بنجاح`, 'success');
    }
    
    // حفظ البيانات في التخزين المحلي
    saveEmployeeData();
    
    // إعادة عرض جدول الموظفين
    renderEmployeesTable();
    
    // إغلاق النافذة
    const modal = document.getElementById('add-employee-modal');
    if (modal) modal.classList.remove('active');
}

// عرض جدول الموظفين
function renderEmployeesTable() {
    console.log('عرض جدول الموظفين...');
    
    const tableBody = document.querySelector('#employees-table tbody');
    if (!tableBody) return;
    
    // مسح محتوى الجدول
    tableBody.innerHTML = '';
    
    // التحقق من وجود موظفين
    if (!employees || employees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا يوجد موظفين</td></tr>';
        return;
    }
    
    // ترتيب الموظفين حسب تاريخ التعيين (الأحدث أولاً)
    const sortedEmployees = [...employees].sort((a, b) => {
        return new Date(b.hireDate) - new Date(a.hireDate);
    });
    
    // إضافة الموظفين إلى الجدول
    sortedEmployees.forEach(employee => {
        const row = document.createElement('tr');
        
        // تحديد لون الحالة
        const statusClass = employee.status === 'active' ? 'success' : 'danger';
        const statusText = employee.status === 'active' ? 'نشط' : 'غير نشط';
        
        row.innerHTML = `
            <td>
                <div class="employee-avatar-small">
                    ${employee.avatarImage ? 
                        `<img src="${employee.avatarImage}" alt="${employee.name}">` : 
                        `<i class="fas fa-user"></i>`}
                </div>
            </td>
            <td>${employee.name}</td>
            <td>${employee.phone}</td>
            <td>${employee.jobTitle}</td>
            <td>${formatCurrency(employee.salary)}</td>
            <td>${employee.commission}%</td>
            <td>${employee.hireDate}</td>
            <td><span class="badge badge-${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline view-employee" data-id="${employee.id}" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline edit-employee" data-id="${employee.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline delete-employee" data-id="${employee.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewBtn = row.querySelector('.view-employee');
        const editBtn = row.querySelector('.edit-employee');
        const deleteBtn = row.querySelector('.delete-employee');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                showEmployeeDetails(employeeId);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                openAddEmployeeModal(employeeId);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                deleteEmployee(employeeId);
            });
        }
    });
}

// حذف موظف
function deleteEmployee(employeeId) {
    console.log(`حذف الموظف: ${employeeId}`);
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // تأكيد الحذف
    if (!confirm(`هل أنت متأكد من حذف الموظف "${employee.name}"؟`)) {
        return;
    }
    
    // حذف الموظف من المصفوفة
    employees = employees.filter(emp => emp.id !== employeeId);
    
    // حفظ البيانات في التخزين المحلي
    saveEmployeeData();
    
    // إعادة عرض جدول الموظفين
    renderEmployeesTable();
    
    showNotification(`تم حذف الموظف ${employee.name} بنجاح`, 'success');
}

// عرض تفاصيل الموظف
function showEmployeeDetails(employeeId) {
    console.log(`عرض تفاصيل الموظف: ${employeeId}`);
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // تحديد النص والألوان حسب الحالة
    const statusText = employee.status === 'active' ? 'نشط' : 'غير نشط';
    const statusClass = employee.status === 'active' ? 'active' : 'inactive';
    
    // ترجمة نوع العقد
    let contractTypeText = 'دوام كامل';
    if (employee.contractType === 'part-time') contractTypeText = 'دوام جزئي';
    else if (employee.contractType === 'temporary') contractTypeText = 'عقد مؤقت';
    
    // ترجمة القسم
    let departmentText = 'المبيعات';
    if (employee.department === 'admin') departmentText = 'الإدارة';
    else if (employee.department === 'finance') departmentText = 'المالية';
    else if (employee.department === 'operations') departmentText = 'العمليات';
    else if (employee.department === 'it') departmentText = 'تقنية المعلومات';
    
    // إنشاء محتوى تفاصيل الموظف
    const content = `
        <div class="employee-details-container">
            <div class="employee-details-header">
                <div class="employee-avatar">
                    ${employee.avatarImage ? 
                        `<img src="${employee.avatarImage}" alt="${employee.name}">` : 
                        `<i class="fas fa-user"></i>`}
                </div>
                <div class="employee-personal-info">
                    <h2 class="employee-title">${employee.name}</h2>
                    <p class="employee-subtitle">${employee.jobTitle} - ${departmentText}</p>
                    <div style="margin-top: 5px;">
                        <span class="employee-badge badge-${statusClass}">${statusText}</span>
                    </div>
                </div>
            </div>
            
            <div class="employee-details-section">
                <div class="section-header">المعلومات الشخصية</div>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-group">
                            <div class="info-group-label">رقم الهاتف</div>
                            <div class="info-group-value">${employee.phone}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">البريد الإلكتروني</div>
                            <div class="info-group-value">${employee.email || 'غير محدد'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">تاريخ الميلاد</div>
                            <div class="info-group-value">${employee.birthdate || 'غير محدد'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">العنوان</div>
                            <div class="info-group-value">${employee.address || 'غير محدد'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">الجنس</div>
                            <div class="info-group-value">${employee.gender === 'male' ? 'ذكر' : 'أنثى'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="employee-details-section">
                <div class="section-header">المعلومات الوظيفية</div>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-group">
                            <div class="info-group-label">القسم</div>
                            <div class="info-group-value">${departmentText}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">الراتب الأساسي</div>
                            <div class="info-group-value">${formatCurrency(employee.salary)}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">نسبة المبيعات</div>
                            <div class="info-group-value">${employee.commission}%</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">تاريخ التعيين</div>
                            <div class="info-group-value">${employee.hireDate}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">نوع العقد</div>
                            <div class="info-group-value">${contractTypeText}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">مدة العمل</div>
                            <div class="info-group-value">${calculateEmploymentDuration(employee.hireDate)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="employee-details-section">
                <div class="section-header">الوثائق الرسمية</div>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-group">
                            <div class="info-group-label">رقم البطاقة الوطنية</div>
                            <div class="info-group-value">${employee.idNumber || 'غير محدد'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">رقم بطاقة السكن</div>
                            <div class="info-group-value">${employee.residenceCard || 'غير محدد'}</div>
                        </div>
                    </div>
                    
                    <div class="documents-grid">
                        <div class="document-card">
                            <div class="document-card-image">
                                ${employee.idCardImage ? 
                                    `<img src="${employee.idCardImage}" alt="صورة البطاقة الوطنية">` : 
                                    '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af;"><i class="fas fa-id-card"></i><span style="margin-right:5px;">لا توجد صورة</span></div>'}
                            </div>
                            <div class="document-card-title">البطاقة الوطنية</div>
                        </div>
                        <div class="document-card">
                            <div class="document-card-image">
                                ${employee.residenceCardImage ? 
                                    `<img src="${employee.residenceCardImage}" alt="صورة بطاقة السكن">` : 
                                    '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af;"><i class="fas fa-home"></i><span style="margin-right:5px;">لا توجد صورة</span></div>'}
                            </div>
                            <div class="document-card-title">بطاقة السكن</div>
                        </div>
                    </div>
                    
                    ${employee.notes ? `
                    <div style="margin-top:15px;">
                        <div class="info-group-label">ملاحظات إضافية</div>
                        <div class="info-group-value" style="margin-top:5px;">${employee.notes}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    // عرض محتوى التفاصيل في النافذة المنبثقة
    const detailsContent = document.getElementById('employee-details-content');
    if (detailsContent) {
        detailsContent.innerHTML = content;
    }
    
    // إضافة مستمعي الأحداث لأزرار العمليات
    const editEmployeeBtn = document.getElementById('edit-employee-details-btn');
    const payEmployeeSalaryBtn = document.getElementById('pay-employee-salary-btn');
    const deleteEmployeeBtn = document.getElementById('delete-employee-details-btn');
    
    if (editEmployeeBtn) {
        editEmployeeBtn.onclick = function() {
            // إغلاق نافذة التفاصيل
            const modal = document.getElementById('employee-details-modal');
            if (modal) modal.classList.remove('active');
            
            // فتح نافذة التعديل
            openAddEmployeeModal(employeeId);
        };
    }
    
    if (payEmployeeSalaryBtn) {
        payEmployeeSalaryBtn.onclick = function() {
            // إغلاق نافذة التفاصيل
            const modal = document.getElementById('employee-details-modal');
            if (modal) modal.classList.remove('active');
            
            // فتح نافذة صرف الراتب مع اختيار الموظف مسبقًا
            openPaySalaryModal(employeeId);
        };
    }
    
    if (deleteEmployeeBtn) {
        deleteEmployeeBtn.onclick = function() {
            // إغلاق نافذة التفاصيل
            const modal = document.getElementById('employee-details-modal');
            if (modal) modal.classList.remove('active');
            
            // حذف الموظف
            deleteEmployee(employeeId);
        };
    }
    
   // إظهار النافذة المنبثقة
   const modal = document.getElementById('employee-details-modal');
   if (modal) {
       // تحديث عنوان النافذة
       const modalTitle = modal.querySelector('.modal-title');
       if (modalTitle) modalTitle.textContent = `تفاصيل الموظف - ${employee.name}`;
       
       modal.classList.add('active');
   }
}

// حساب مدة عمل الموظف
function calculateEmploymentDuration(hireDate) {
   if (!hireDate) return 'غير محدد';
   
   const startDate = new Date(hireDate);
   const now = new Date();
   
   const years = now.getFullYear() - startDate.getFullYear();
   const months = now.getMonth() - startDate.getMonth();
   const days = now.getDate() - startDate.getDate();
   
   let duration = '';
   
   if (years > 0) {
       duration += `${years} سنة`;
       if (months > 0 || (months === 0 && days > 0)) duration += ' و';
   }
   
   if (months > 0) {
       duration += `${months} شهر`;
       if (days > 0) duration += ' و';
   }
   
   if (days > 0 || (years === 0 && months === 0)) {
       duration += `${days < 0 ? days + 30 : days} يوم`;
   }
   
   return duration;
}

// تصدير بيانات الموظفين إلى ملف Excel
function exportEmployeesToExcel() {
   console.log('تصدير بيانات الموظفين إلى Excel...');
   
   // التحقق من وجود موظفين
   if (!employees || employees.length === 0) {
       showNotification('لا يوجد موظفين للتصدير', 'warning');
       return;
   }
   
   // إنشاء مصفوفة البيانات للتصدير
   const csvRows = [];
   
   // إضافة عناوين الأعمدة
   const headers = [
       'الرقم',
       'الاسم',
       'رقم الهاتف',
       'البريد الإلكتروني',
       'العنوان',
       'المسمى الوظيفي',
       'القسم',
       'الراتب الأساسي',
       'نسبة المبيعات',
       'تاريخ التعيين',
       'نوع العقد',
       'الحالة',
       'رقم البطاقة الوطنية',
       'رقم بطاقة السكن'
   ];
   
   csvRows.push(headers.join(','));
   
   // إضافة بيانات الموظفين
   employees.forEach((employee, index) => {
       const values = [
           index + 1,
           employee.name,
           employee.phone,
           employee.email || '',
           employee.address || '',
           employee.jobTitle,
           translateDepartment(employee.department),
           employee.salary,
           employee.commission,
           employee.hireDate,
           translateContractType(employee.contractType),
           employee.status === 'active' ? 'نشط' : 'غير نشط',
           employee.idNumber || '',
           employee.residenceCard || ''
       ];
       
       // تنظيف القيم للتصدير CSV
       const cleanedValues = values.map(value => {
           if (value === null || value === undefined) return '';
           value = String(value).replace(/"/g, '""');
           return value.includes(',') ? `"${value}"` : value;
       });
       
       csvRows.push(cleanedValues.join(','));
   });
   
   // إنشاء محتوى CSV
   const csvContent = csvRows.join('\n');
   
   // إنشاء Blob
   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
   
   // إنشاء رابط التنزيل
   const link = document.createElement('a');
   link.href = URL.createObjectURL(blob);
   link.download = `قائمة_الموظفين_${new Date().toISOString().split('T')[0]}.csv`;
   
   // إضافة الرابط وتنفيذ النقر
   document.body.appendChild(link);
   link.click();
   
   // تنظيف
   document.body.removeChild(link);
   
   showNotification('تم تصدير بيانات الموظفين بنجاح', 'success');
}

// ترجمة القسم
function translateDepartment(department) {
   switch (department) {
       case 'sales': return 'المبيعات';
       case 'admin': return 'الإدارة';
       case 'finance': return 'المالية';
       case 'operations': return 'العمليات';
       case 'it': return 'تقنية المعلومات';
       default: return department;
   }
}

// ترجمة نوع العقد
function translateContractType(contractType) {
   switch (contractType) {
       case 'full-time': return 'دوام كامل';
       case 'part-time': return 'دوام جزئي';
       case 'temporary': return 'عقد مؤقت';
       default: return contractType;
   }
}

// فتح نافذة دفع راتب
function openPaySalaryModal(employeeId = null) {
   console.log('فتح نافذة دفع راتب...');
   
   const modal = document.getElementById('pay-salary-modal');
   if (!modal) return;
   
   // إعادة تعيين النموذج
   const form = document.getElementById('salary-form');
   if (form) form.reset();
   
   // إخفاء تفاصيل الراتب
   const employeeSalaryDetails = document.getElementById('employee-salary-details');
   if (employeeSalaryDetails) employeeSalaryDetails.style.display = 'none';
   
   // تعيين تاريخ اليوم كتاريخ الصرف الافتراضي
   const salaryDateInput = document.getElementById('salary-date');
   if (salaryDateInput) salaryDateInput.value = new Date().toISOString().split('T')[0];
   
   // تعيين الشهر الحالي كشهر الراتب الافتراضي
   const salaryMonthInput = document.getElementById('salary-month');
   if (salaryMonthInput) {
       const now = new Date();
       salaryMonthInput.value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
   }
   
   // ملء قائمة الموظفين
   const salaryEmployeeSelect = document.getElementById('salary-employee');
   if (salaryEmployeeSelect) {
       // مسح القائمة
       salaryEmployeeSelect.innerHTML = '<option value="">اختر الموظف</option>';
       
       // إضافة الموظفين النشطين فقط
       const activeEmployees = employees.filter(emp => emp.status === 'active');
       
       // ترتيب الموظفين أبجدياً
       activeEmployees.sort((a, b) => a.name.localeCompare(b.name));
       
       // إضافة الموظفين للقائمة
       activeEmployees.forEach(employee => {
           const option = document.createElement('option');
           option.value = employee.id;
           option.textContent = employee.name;
           
           salaryEmployeeSelect.appendChild(option);
       });
       
       // اختيار الموظف إذا تم تمرير معرفه
       if (employeeId) {
           salaryEmployeeSelect.value = employeeId;
           
           // تحديث تفاصيل الموظف
           updateSalaryEmployeeDetails(employeeId);
       }
   }
   
   // إظهار النافذة
   modal.classList.add('active');
}

// تحديث تفاصيل الموظف في نافذة الراتب
function updateSalaryEmployeeDetails(employeeId) {
   console.log(`تحديث تفاصيل الموظف في نافذة الراتب: ${employeeId}`);
   
   const employeeSalaryDetails = document.getElementById('employee-salary-details');
   
   if (!employeeId) {
       // إخفاء التفاصيل إذا لم يتم اختيار موظف
       if (employeeSalaryDetails) employeeSalaryDetails.style.display = 'none';
       return;
   }
   
   // البحث عن الموظف
   const employee = employees.find(emp => emp.id === employeeId);
   if (!employee) {
       showNotification('لم يتم العثور على الموظف', 'error');
       return;
   }
   
   // تحديث تفاصيل الموظف
   const employeeAvatar = document.getElementById('salary-employee-avatar');
   const employeeName = document.getElementById('salary-employee-name');
   const employeeJobTitle = document.getElementById('salary-employee-jobtitle');
   const basicSalary = document.getElementById('salary-basic-amount');
   const commissionRate = document.getElementById('salary-commission-rate');
   
   if (employeeAvatar) {
       employeeAvatar.innerHTML = employee.avatarImage ? 
           `<img src="${employee.avatarImage}" alt="${employee.name}">` : 
           '<i class="fas fa-user"></i>';
   }
   
   if (employeeName) employeeName.textContent = employee.name;
   if (employeeJobTitle) employeeJobTitle.textContent = `${employee.jobTitle} - ${translateDepartment(employee.department)}`;
   if (basicSalary) basicSalary.textContent = formatCurrency(employee.salary);
   if (commissionRate) commissionRate.textContent = `${employee.commission}%`;
   
   // تعيين الراتب الأساسي
   const summaryBasicSalary = document.getElementById('summary-basic-salary');
   if (summaryBasicSalary) summaryBasicSalary.textContent = formatCurrency(employee.salary);
   
   // إظهار تفاصيل الموظف
   if (employeeSalaryDetails) employeeSalaryDetails.style.display = 'block';
   
   // تحديث ملخص الراتب
   updateSalaryCommission();
   updateSalarySummary();
}

// تحديث قيمة العمولة بناءً على المبيعات
function updateSalaryCommission() {
   const employeeId = document.getElementById('salary-employee')?.value;
   if (!employeeId) return;
   
   const employee = employees.find(emp => emp.id === employeeId);
   if (!employee) return;
   
   const salesAmount = parseFloat(document.getElementById('salary-sales')?.value || '0');
   const commissionRate = employee.commission / 100;
   
   const commissionAmount = salesAmount * commissionRate;
   
   // تحديث حقل العمولة
   const salaryCommissionInput = document.getElementById('salary-commission');
   if (salaryCommissionInput) salaryCommissionInput.value = commissionAmount.toFixed(2);
   
   // تحديث ملخص العمولة
   const summaryCommission = document.getElementById('summary-commission');
   if (summaryCommission) summaryCommission.textContent = formatCurrency(commissionAmount);
   
   // تحديث إجمالي الراتب
   updateSalarySummary();
}

// تحديث ملخص الراتب
function updateSalarySummary() {
   const employeeId = document.getElementById('salary-employee')?.value;
   if (!employeeId) return;
   
   const employee = employees.find(emp => emp.id === employeeId);
   if (!employee) return;
   
   const basicSalary = employee.salary;
   const commission = parseFloat(document.getElementById('salary-commission')?.value || '0');
   const bonus = parseFloat(document.getElementById('salary-bonus')?.value || '0');
   const deductions = parseFloat(document.getElementById('salary-deductions')?.value || '0');
   
   // حساب إجمالي الراتب
   const totalSalary = basicSalary + commission + bonus - deductions;
   
   // تحديث العلامات والاستقطاعات في الملخص
   const summaryBonus = document.getElementById('summary-bonus');
   const summaryDeductions = document.getElementById('summary-deductions');
   const summaryTotal = document.getElementById('summary-total');
   
   if (summaryBonus) summaryBonus.textContent = formatCurrency(bonus);
   if (summaryDeductions) summaryDeductions.textContent = formatCurrency(deductions);
   if (summaryTotal) summaryTotal.textContent = formatCurrency(totalSalary);
}

// حفظ بيانات الراتب
function saveSalary() {
   console.log('حفظ بيانات الراتب...');
   
   // التحقق من صحة النموذج
   const form = document.getElementById('salary-form');
   if (!form) {
       showNotification('خطأ في النموذج', 'error');
       return;
   }
   
   // التحقق من الحقول المطلوبة
   const employeeId = document.getElementById('salary-employee')?.value;
   const salaryMonth = document.getElementById('salary-month')?.value;
   const salaryDate = document.getElementById('salary-date')?.value;
   
   if (!employeeId || !salaryMonth || !salaryDate) {
       showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
       return;
   }
   
   // البحث عن الموظف
   const employee = employees.find(emp => emp.id === employeeId);
   if (!employee) {
       showNotification('لم يتم العثور على الموظف', 'error');
       return;
   }
   
   // الحصول على بيانات الراتب
   const basicSalary = employee.salary;
   const salesAmount = parseFloat(document.getElementById('salary-sales')?.value || '0');
   const commission = parseFloat(document.getElementById('salary-commission')?.value || '0');
   const bonus = parseFloat(document.getElementById('salary-bonus')?.value || '0');
   const deductions = parseFloat(document.getElementById('salary-deductions')?.value || '0');
   const notes = document.getElementById('salary-notes')?.value || '';
   
   // حساب إجمالي الراتب
   const totalSalary = basicSalary + commission + bonus - deductions;
   
   // إنشاء كائن الراتب
   const salary = {
       id: Date.now().toString(),
       employeeId,
       employeeName: employee.name,
       salaryMonth,
       salaryDate,
       basicSalary,
       salesAmount,
       commission,
       bonus,
       deductions,
       totalSalary,
       notes,
       createdAt: new Date().toISOString()
   };
   
   // إضافة الراتب إلى المصفوفة
   salaries.push(salary);
   
   // حفظ البيانات في التخزين المحلي
   saveEmployeeData();
   
   // عرض إيصال الراتب
   showSalaryReceipt(salary);
   
   // إعادة عرض جدول الرواتب
   renderSalariesTable();
   
   // إغلاق النافذة
   const modal = document.getElementById('pay-salary-modal');
   if (modal) modal.classList.remove('active');
   
   showNotification(`تم صرف راتب ${employee.name} بنجاح`, 'success');
}

// عرض جدول الرواتب
function renderSalariesTable() {
   console.log('عرض جدول الرواتب...');
   
   const tableBody = document.querySelector('#salaries-table tbody');
   if (!tableBody) return;
   
   // مسح محتوى الجدول
   tableBody.innerHTML = '';
   
   // التحقق من وجود رواتب
   if (!salaries || salaries.length === 0) {
       tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا يوجد رواتب</td></tr>';
       return;
   }
   
   // ترتيب الرواتب حسب التاريخ (الأحدث أولاً)
   const sortedSalaries = [...salaries].sort((a, b) => {
       return new Date(b.salaryDate) - new Date(a.salaryDate);
   });
   
   // إضافة الرواتب إلى الجدول
   sortedSalaries.forEach(salary => {
       // اختصار الشهر للعرض
       const month = new Date(salary.salaryMonth + '-01').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
       
       const row = document.createElement('tr');
       row.innerHTML = `
           <td>${salary.employeeName}</td>
           <td>${salary.salaryDate} (${month})</td>
           <td>${formatCurrency(salary.basicSalary)}</td>
           <td>${formatCurrency(salary.salesAmount)}</td>
           <td>${formatCurrency(salary.commission)}</td>
           <td>${formatCurrency(salary.bonus)}</td>
           <td>${formatCurrency(salary.deductions)}</td>
           <td>${formatCurrency(salary.totalSalary)}</td>
           <td>
               <div class="action-buttons">
                   <button class="btn btn-sm btn-outline view-salary" data-id="${salary.id}" title="عرض">
                       <i class="fas fa-eye"></i>
                   </button>
                   <button class="btn btn-sm btn-outline print-salary" data-id="${salary.id}" title="طباعة">
                       <i class="fas fa-print"></i>
                   </button>
               </div>
           </td>
       `;
       
       tableBody.appendChild(row);
       
       // إضافة مستمعي الأحداث للأزرار
       const viewBtn = row.querySelector('.view-salary');
       const printBtn = row.querySelector('.print-salary');
       
       if (viewBtn) {
           viewBtn.addEventListener('click', function() {
               const salaryId = this.getAttribute('data-id');
               showSalaryDetails(salaryId);
           });
       }
       
       if (printBtn) {
           printBtn.addEventListener('click', function() {
               const salaryId = this.getAttribute('data-id');
               const salary = salaries.find(s => s.id === salaryId);
               if (salary) {
                   showSalaryReceipt(salary);
               }
           });
       }
   });
}

// عرض تفاصيل الراتب
function showSalaryDetails(salaryId) {
   console.log(`عرض تفاصيل الراتب: ${salaryId}`);
   
   // البحث عن الراتب
   const salary = salaries.find(s => s.id === salaryId);
   if (!salary) {
       showNotification('لم يتم العثور على الراتب', 'error');
       return;
   }
   
   // عرض إيصال الراتب
   showSalaryReceipt(salary);
}

// عرض إيصال الراتب
function showSalaryReceipt(salary) {
   console.log(`عرض إيصال الراتب: ${salary.id}`);
   
   // البحث عن الموظف
   const employee = employees.find(emp => emp.id === salary.employeeId);
   
   // اختصار الشهر للعرض
   const salaryMonthDisplay = new Date(salary.salaryMonth + '-01').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
   
   // إنشاء محتوى إيصال الراتب
   const receipt = `
       <div class="salary-receipt" id="salary-receipt-content">
           <div class="receipt-header">
               <h2 style="margin:0 0 5px 0;">إيصال صرف راتب</h2>
               <p style="margin:0;color:#666;">تم الإصدار في: ${new Date().toLocaleDateString('ar-EG')}</p>
           </div>
           
           <div class="receipt-details">
               <div>
                   <h3 style="margin-bottom:10px;">بيانات الموظف</h3>
                   <div class="employee-info" style="margin-bottom:15px;">
                       <div class="employee-avatar-small">
                           ${employee && employee.avatarImage ? 
                               `<img src="${employee.avatarImage}" alt="${salary.employeeName}">` : 
                               '<i class="fas fa-user"></i>'}
                       </div>
                       <div class="employee-data">
                           <h4 style="margin:0;">${salary.employeeName}</h4>
                           <p style="margin:0;color:#666;">${employee ? employee.jobTitle : ''}</p>
                       </div>
                   </div>
                   <div style="margin-bottom:5px;"><strong>الوظيفة:</strong> ${employee ? employee.jobTitle : ''}</div>
                   <div style="margin-bottom:5px;"><strong>القسم:</strong> ${employee ? translateDepartment(employee.department) : ''}</div>
                   <div style="margin-bottom:5px;"><strong>تاريخ التعيين:</strong> ${employee ? employee.hireDate : ''}</div>
               </div>
               
               <div>
                   <h3 style="margin-bottom:10px;">تفاصيل الراتب</h3>
                   <div style="margin-bottom:5px;"><strong>شهر الراتب:</strong> ${salaryMonthDisplay}</div>
                   <div style="margin-bottom:5px;"><strong>تاريخ الصرف:</strong> ${salary.salaryDate}</div>
                   <div style="margin-bottom:5px;"><strong>رقم الإيصال:</strong> ${salary.id}</div>
               </div>
           </div>
           
           <div class="receipt-section">
               <h3 class="receipt-section-title">تفاصيل المبالغ</h3>
               
               <div class="receipt-row">
                   <div>الراتب الأساسي</div>
                   <div>${formatCurrency(salary.basicSalary)}</div>
               </div>
               
               <div class="receipt-row">
                   <div>المبيعات</div>
                   <div>${formatCurrency(salary.salesAmount)}</div>
               </div>
               
               <div class="receipt-row">
                   <div>العمولة (${employee ? employee.commission : 0}%)</div>
                   <div>${formatCurrency(salary.commission)}</div>
               </div>
               
               <div class="receipt-row">
                   <div>العلاوات</div>
                   <div>${formatCurrency(salary.bonus)}</div>
               </div>
               
               <div class="receipt-row">
                   <div>الاستقطاعات</div>
                   <div>- ${formatCurrency(salary.deductions)}</div>
               </div>
               
               <div class="receipt-row receipt-total">
                   <div>إجمالي الراتب</div>
                   <div>${formatCurrency(salary.totalSalary)}</div>
               </div>
           </div>
           
           ${salary.notes ? `
           <div class="receipt-section">
               <h3 class="receipt-section-title">ملاحظات</h3>
               <p>${salary.notes}</p>
           </div>
           ` : ''}
           
           <div class="receipt-footer">
               <p>تم إنشاء هذا الإيصال بواسطة نظام إدارة الموظفين</p>
           </div>
       </div>
   `;
   
   // عرض إيصال الراتب في النافذة المنبثقة
   const receiptContainer = document.getElementById('salary-receipt');
   if (receiptContainer) {
       receiptContainer.innerHTML = receipt;
   }
   
   // إظهار النافذة المنبثقة
   const modal = document.getElementById('print-salary-modal');
   if (modal) {
       modal.classList.add('active');
   }
}

// طباعة إيصال الراتب
function printSalaryReceipt() {
   console.log('طباعة إيصال الراتب...');
   
   window.print();
}

// فتح نافذة إضافة قسط جديد
function openAddInstallmentModal(installmentId = null) {
   console.log('فتح نافذة إضافة قسط جديد...');
   
   const modal = document.getElementById('add-installment-modal');
   if (!modal) return;
   
   // إعادة تعيين النموذج
   const form = document.getElementById('installment-form');
   if (form) form.reset();
   
   // تحديث عنوان النافذة وزر الحفظ
   const modalTitle = document.getElementById('installment-modal-title');
   if (modalTitle) modalTitle.textContent = installmentId ? 'تعديل قسط' : 'إضافة قسط جديد';
   
   const saveBtn = document.getElementById('save-installment-btn');
   if (saveBtn) saveBtn.textContent = installmentId ? 'حفظ التعديلات' : 'حفظ';
   
   // تعيين تاريخ اليوم كتاريخ بدء افتراضي
   const startDateInput = document.getElementById('installment-start-date');
   if (startDateInput) startDateInput.value = new Date().toISOString().split('T')[0];
   
   // ملء قائمة الموظفين المسؤولين
   const employeeSelect = document.getElementById('installment-employee');
   if (employeeSelect) {
       // مسح القائمة
       employeeSelect.innerHTML = '<option value="">اختر الموظف</option>';
       
       // إضافة الموظفين النشطين فقط
       const activeEmployees = employees.filter(emp => emp.status === 'active');
       
       // ترتيب الموظفين أبجدياً
       activeEmployees.sort((a, b) => a.name.localeCompare(b.name));
       
       // إضافة الموظفين للقائمة
       activeEmployees.forEach(employee => {
           const option = document.createElement('option');
           option.value = employee.id;
           option.textContent = employee.name;
           
           employeeSelect.appendChild(option);
       });
   }
   
   // إذا كان هناك معرف قسط، قم بتحميل بياناته
   if (installmentId) {
       loadInstallmentForEditing(installmentId);
   } else {
       // تعيين معرف القسط
       const installmentIdInput = document.getElementById('installment-id');
       if (installmentIdInput) installmentIdInput.value = '';
       
       // تحديث جدول الأقساط
       calculateInstallmentDetails();
   }
   
   // إظهار النافذة
   modal.classList.add('active');
}

// تحميل بيانات القسط للتعديل
function loadInstallmentForEditing(installmentId) {
   console.log(`تحميل بيانات القسط للتعديل: ${installmentId}`);
   
   // البحث عن القسط
   const installment = installments.find(inst => inst.id === installmentId);
   if (!installment) {
       showNotification('لم يتم العثور على بيانات القسط', 'error');
       return;
   }
   
   // تعيين معرف القسط
   const installmentIdInput = document.getElementById('installment-id');
   if (installmentIdInput) installmentIdInput.value = installment.id;
   
   // تعبئة بيانات القسط
   document.getElementById('installment-customer-name')?.setAttribute('value', installment.customerName || '');
   document.getElementById('installment-customer-phone')?.setAttribute('value', installment.customerPhone || '');
   
   const employeeSelect = document.getElementById('installment-employee');
   if (employeeSelect && installment.employeeId) {
       employeeSelect.value = installment.employeeId;
   }
   
   document.getElementById('installment-total-amount')?.setAttribute('value', installment.totalAmount || '');
   document.getElementById('installment-down-payment')?.setAttribute('value', installment.downPayment || '');
   document.getElementById('installment-count')?.setAttribute('value', installment.installmentCount || '');
   
   const periodSelect = document.getElementById('installment-period');
   if (periodSelect && installment.installmentPeriod) {
       periodSelect.value = installment.installmentPeriod;
   }
   
   document.getElementById('installment-start-date')?.setAttribute('value', installment.startDate || '');
   document.getElementById('installment-product-info')?.innerHTML = installment.productInfo || '';
  // تحديث جدول الأقساط
calculateInstallmentDetails();
}

// حساب تفاصيل القسط
function calculateInstallmentDetails() {
    console.log('حساب تفاصيل القسط...');
    
    // الحصول على قيم الحقول
    const totalAmount = parseFloat(document.getElementById('installment-total-amount')?.value || '0');
    const downPayment = parseFloat(document.getElementById('installment-down-payment')?.value || '0');
    const installmentCount = parseInt(document.getElementById('installment-count')?.value || '1');
    const installmentPeriod = document.getElementById('installment-period')?.value || 'monthly';
    const startDate = document.getElementById('installment-start-date')?.value;
    
    // التحقق من صحة القيم
    if (isNaN(totalAmount) || isNaN(downPayment) || isNaN(installmentCount) || !startDate) {
        return;
    }
    
    // حساب المبلغ المتبقي
    const remainingAmount = totalAmount - downPayment;
    
    // حساب قيمة القسط الواحد
    const installmentAmount = remainingAmount / installmentCount;
    
    // تحديث ملخص الأقساط
    document.getElementById('summary-total-amount')?.textContent = formatCurrency(totalAmount);
    document.getElementById('summary-down-payment')?.textContent = formatCurrency(downPayment);
    document.getElementById('summary-remaining-amount')?.textContent = formatCurrency(remainingAmount);
    document.getElementById('summary-installment-amount')?.textContent = formatCurrency(installmentAmount);
    
    // إنشاء جدول الأقساط
    generateInstallmentSchedule(startDate, installmentCount, installmentAmount, installmentPeriod);
}

// إنشاء جدول الأقساط
function generateInstallmentSchedule(startDate, count, amount, period) {
    const scheduleTable = document.getElementById('installment-schedule-table');
    if (!scheduleTable) return;
    
    const scheduleBody = scheduleTable.querySelector('tbody');
    if (!scheduleBody) return;
    
    // مسح محتوى الجدول
    scheduleBody.innerHTML = '';
    
    // التحقق من صحة القيم
    if (!startDate || count <= 0 || amount <= 0) {
        return;
    }
    
    // تحويل تاريخ البدء إلى كائن تاريخ
    const start = new Date(startDate);
    
    // إنشاء صفوف جدول الأقساط
    for (let i = 0; i < count; i++) {
        // حساب تاريخ استحقاق القسط
        const dueDate = calculateDueDate(start, i, period);
        
        // إنشاء صف جديد
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${dueDate.toISOString().split('T')[0]}</td>
            <td>${formatCurrency(amount)}</td>
            <td><span class="badge badge-primary">مستقبلي</span></td>
        `;
        
        // إضافة الصف إلى الجدول
        scheduleBody.appendChild(row);
    }
}

// حساب تاريخ استحقاق القسط
function calculateDueDate(startDate, index, period) {
    const date = new Date(startDate);
    
    switch (period) {
        case 'monthly':
            date.setMonth(date.getMonth() + index);
            break;
        case 'quarterly':
            date.setMonth(date.getMonth() + (index * 3));
            break;
        case 'semi-annual':
            date.setMonth(date.getMonth() + (index * 6));
            break;
        case 'annual':
            date.setFullYear(date.getFullYear() + index);
            break;
    }
    
    return date;
}

// حفظ بيانات القسط
function saveInstallment() {
    console.log('حفظ بيانات القسط...');
    
    // التحقق من صحة النموذج
    const form = document.getElementById('installment-form');
    if (!form) {
        showNotification('خطأ في النموذج', 'error');
        return;
    }
    
    // التحقق من الحقول المطلوبة
    const customerName = document.getElementById('installment-customer-name')?.value;
    const customerPhone = document.getElementById('installment-customer-phone')?.value;
    const totalAmount = parseFloat(document.getElementById('installment-total-amount')?.value || '0');
    const installmentCount = parseInt(document.getElementById('installment-count')?.value || '0');
    const startDate = document.getElementById('installment-start-date')?.value;
    
    if (!customerName || !customerPhone || isNaN(totalAmount) || totalAmount <= 0 || installmentCount <= 0 || !startDate) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // الحصول على معرف القسط (إذا كان موجوداً)
    const installmentId = document.getElementById('installment-id')?.value;
    
    // الحصول على بقية قيم الحقول
    const employeeId = document.getElementById('installment-employee')?.value || '';
    const employeeName = employeeId ? (employees.find(emp => emp.id === employeeId)?.name || '') : '';
    const downPayment = parseFloat(document.getElementById('installment-down-payment')?.value || '0');
    const installmentPeriod = document.getElementById('installment-period')?.value || 'monthly';
    const productInfo = document.getElementById('installment-product-info')?.value || '';
    
    // حساب المبلغ المتبقي وقيمة القسط الواحد
    const remainingAmount = totalAmount - downPayment;
    const installmentAmount = remainingAmount / installmentCount;
    
    // إنشاء جدول الأقساط
    const schedule = [];
    for (let i = 0; i < installmentCount; i++) {
        const dueDate = calculateDueDate(new Date(startDate), i, installmentPeriod);
        
        schedule.push({
            number: i + 1,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: installmentAmount,
            status: 'pending',
            paymentDate: null,
            notes: ''
        });
    }
    
    // إنشاء كائن القسط
    const installment = {
        id: installmentId || Date.now().toString(),
        customerName,
        customerPhone,
        employeeId,
        employeeName,
        totalAmount,
        downPayment,
        remainingAmount,
        installmentCount,
        installmentAmount,
        installmentPeriod,
        startDate,
        productInfo,
        schedule,
        paidAmount: downPayment,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // إضافة/تحديث القسط في المصفوفة
    if (installmentId) {
        // تحديث قسط موجود
        const index = installments.findIndex(inst => inst.id === installmentId);
        if (index !== -1) {
            // الاحتفاظ بقيم معينة من القسط الأصلي
            installment.createdAt = installments[index].createdAt;
            
            // تحديث القسط
            installments[index] = installment;
        } else {
            // إضافة القسط إذا لم يتم العثور عليه
            installments.push(installment);
        }
        
        showNotification(`تم تحديث بيانات القسط بنجاح`, 'success');
    } else {
        // إضافة قسط جديد
        installments.push(installment);
        
        showNotification(`تم إضافة القسط بنجاح`, 'success');
    }
    
    // حفظ البيانات في التخزين المحلي
    saveEmployeeData();
    
    // إعادة عرض جدول الأقساط
    renderInstallmentsTable();
    
    // إغلاق النافذة
    const modal = document.getElementById('add-installment-modal');
    if (modal) modal.classList.remove('active');
}

// عرض جدول الأقساط
function renderInstallmentsTable() {
    console.log('عرض جدول الأقساط...');
    
    const tableBody = document.querySelector('#installments-table tbody');
    if (!tableBody) return;
    
    // مسح محتوى الجدول
    tableBody.innerHTML = '';
    
    // التحقق من وجود أقساط
    if (!installments || installments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا يوجد أقساط</td></tr>';
        return;
    }
    
    // ترتيب الأقساط حسب تاريخ الإنشاء (الأحدث أولاً)
    const sortedInstallments = [...installments].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // إضافة الأقساط إلى الجدول
    sortedInstallments.forEach(installment => {
        // تحديد تاريخ الاستحقاق القادم
        const nextDue = getNextDueInstallment(installment);
        
        // تحديد حالة القسط وتنسيقها
        let statusClass = '';
        let statusText = '';
        
        switch(installment.status) {
            case 'active':
                statusClass = 'success';
                statusText = 'نشط';
                break;
            case 'paid':
                statusClass = 'info';
                statusText = 'مدفوع';
                break;
            case 'overdue':
                statusClass = 'danger';
                statusText = 'متأخر';
                break;
            default:
                statusClass = 'primary';
                statusText = 'نشط';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${installment.customerName}</td>
            <td>${installment.employeeName || 'غير محدد'}</td>
            <td>${formatCurrency(installment.totalAmount)}</td>
            <td>${installment.installmentCount}</td>
            <td>${formatCurrency(installment.paidAmount)}</td>
            <td>${formatCurrency(installment.remainingAmount)}</td>
            <td><span class="badge badge-${statusClass}">${statusText}</span></td>
            <td>${nextDue ? nextDue.dueDate : 'مكتمل'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline view-installment" data-id="${installment.id}" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline edit-installment" data-id="${installment.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline pay-installment" data-id="${installment.id}" title="دفع قسط">
                        <i class="fas fa-hand-holding-usd"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewBtn = row.querySelector('.view-installment');
        const editBtn = row.querySelector('.edit-installment');
        const payBtn = row.querySelector('.pay-installment');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                showInstallmentDetails(installmentId);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                openAddInstallmentModal(installmentId);
            });
        }
        
        if (payBtn) {
            payBtn.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                payInstallment(installmentId);
            });
        }
    });
}

// الحصول على القسط المستحق التالي
function getNextDueInstallment(installment) {
    if (!installment.schedule || installment.schedule.length === 0) {
        return null;
    }
    
    // البحث عن أول قسط غير مدفوع
    return installment.schedule.find(item => item.status === 'pending');
}

// عرض تفاصيل القسط
function showInstallmentDetails(installmentId) {
    console.log(`عرض تفاصيل القسط: ${installmentId}`);
    
    // البحث عن القسط
    const installment = installments.find(inst => inst.id === installmentId);
    if (!installment) {
        showNotification('لم يتم العثور على القسط', 'error');
        return;
    }
    
    // تحديد لون الحالة
    let statusClass = '';
    let statusText = '';
    
    switch(installment.status) {
        case 'active':
            statusClass = 'success';
            statusText = 'نشط';
            break;
        case 'paid':
            statusClass = 'info';
            statusText = 'مدفوع';
            break;
        case 'overdue':
            statusClass = 'danger';
            statusText = 'متأخر';
            break;
        default:
            statusClass = 'primary';
            statusText = 'نشط';
    }
    
    // ترجمة فترة القسط
    let periodText = 'شهري';
    if (installment.installmentPeriod === 'quarterly') periodText = 'ربع سنوي';
    else if (installment.installmentPeriod === 'semi-annual') periodText = 'نصف سنوي';
    else if (installment.installmentPeriod === 'annual') periodText = 'سنوي';
    
    // إنشاء جدول الأقساط
    let scheduleRows = '';
    if (installment.schedule && installment.schedule.length > 0) {
        installment.schedule.forEach(item => {
            // تحديد حالة القسط
            let itemStatusClass = '';
            let itemStatusText = '';
            
            switch(item.status) {
                case 'paid':
                    itemStatusClass = 'success';
                    itemStatusText = 'مدفوع';
                    break;
                case 'overdue':
                    itemStatusClass = 'danger';
                    itemStatusText = 'متأخر';
                    break;
                default:
                    itemStatusClass = 'primary';
                    itemStatusText = 'مستقبلي';
            }
            
            scheduleRows += `
                <tr>
                    <td>${item.number}</td>
                    <td>${item.dueDate}</td>
                    <td>${formatCurrency(item.amount)}</td>
                    <td><span class="badge badge-${itemStatusClass}">${itemStatusText}</span></td>
                    <td>${item.paymentDate || '-'}</td>
                </tr>
            `;
        });
    }
    
    // إنشاء محتوى التفاصيل
    const content = `
        <div class="installment-details-container">
            <div class="installment-header">
                <div class="installment-title">
                    <h2>تفاصيل القسط</h2>
                    <span class="badge badge-${statusClass}">${statusText}</span>
                </div>
                <div class="installment-date">
                    <div>تاريخ البدء: ${installment.startDate}</div>
                    <div>تاريخ الإنشاء: ${new Date(installment.createdAt).toLocaleDateString('ar-EG')}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">معلومات العميل</h3>
                </div>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-group">
                            <div class="info-group-label">اسم العميل</div>
                            <div class="info-group-value">${installment.customerName}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">رقم الهاتف</div>
                            <div class="info-group-value">${installment.customerPhone}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">الموظف المسؤول</div>
                            <div class="info-group-value">${installment.employeeName || 'غير محدد'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">تفاصيل القسط</h3>
                </div>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-group">
                            <div class="info-group-label">المبلغ الإجمالي</div>
                            <div class="info-group-value">${formatCurrency(installment.totalAmount)}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">الدفعة الأولى</div>
                            <div class="info-group-value">${formatCurrency(installment.downPayment)}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">المبلغ المتبقي</div>
                            <div class="info-group-value">${formatCurrency(installment.remainingAmount)}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">عدد الأقساط</div>
                            <div class="info-group-value">${installment.installmentCount}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">قيمة القسط الواحد</div>
                            <div class="info-group-value">${formatCurrency(installment.installmentAmount)}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">فترة السداد</div>
                            <div class="info-group-value">${periodText}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">المبلغ المدفوع</div>
                            <div class="info-group-value">${formatCurrency(installment.paidAmount)}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">المبلغ المتبقي</div>
                            <div class="info-group-value">${formatCurrency(installment.totalAmount - installment.paidAmount)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${installment.productInfo ? `
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">معلومات المنتج/الخدمة</h3>
                </div>
                <div class="section-content">
                    <p>${installment.productInfo}</p>
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">جدول الأقساط</h3>
                </div>
                <div class="section-content">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>تاريخ الاستحقاق</th>
                                    <th>قيمة القسط</th>
                                    <th>الحالة</th>
                                    <th>تاريخ الدفع</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${scheduleRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // إنشاء نافذة منبثقة لعرض التفاصيل
    showModal(`تفاصيل القسط - ${installment.customerName}`, content);
}

// دفع قسط
function payInstallment(installmentId) {
    console.log(`دفع قسط: ${installmentId}`);
    
    // البحث عن القسط
    const installment = installments.find(inst => inst.id === installmentId);
    if (!installment) {
        showNotification('لم يتم العثور على القسط', 'error');
        return;
    }
    
    // البحث عن القسط التالي المستحق
    const nextInstallment = getNextDueInstallment(installment);
    if (!nextInstallment) {
        showNotification('لا يوجد أقساط مستحقة', 'warning');
        return;
    }
    
    // تأكيد الدفع
    if (!confirm(`هل تريد تسجيل دفع القسط رقم ${nextInstallment.number} بمبلغ ${formatCurrency(nextInstallment.amount)}؟`)) {
        return;
    }
    
    // تأكيد الدفع
    if (!confirm(`هل تريد تسجيل دفع القسط رقم ${nextInstallment.number} بمبلغ ${formatCurrency(nextInstallment.amount)}؟`)) {
        return;
    }
    
    // تحديث حالة القسط
    nextInstallment.status = 'paid';
    nextInstallment.paymentDate = new Date().toISOString().split('T')[0];
    
    // تحديث المبلغ المدفوع
    installment.paidAmount += nextInstallment.amount;
    
    // تحديث حالة القسط الرئيسي
    if (installment.paidAmount >= installment.totalAmount) {
        installment.status = 'paid';
    }
    
    // تحديث تاريخ التعديل
    installment.updatedAt = new Date().toISOString();
    
    // حفظ البيانات في التخزين المحلي
    saveEmployeeData();
    
    // إعادة عرض جدول الأقساط
    renderInstallmentsTable();
    
    showNotification(`تم تسجيل دفع القسط بنجاح`, 'success');
}

// تحديث حالة الأقساط المتأخرة
function updateOverdueInstallments() {
    console.log('تحديث حالة الأقساط المتأخرة...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let updatedCount = 0;
    
    // مراجعة جميع الأقساط
    installments.forEach(installment => {
        if (installment.status === 'paid') return;
        
        let hasOverdueInstallments = false;
        
        // مراجعة جدول الأقساط
        if (installment.schedule && installment.schedule.length > 0) {
            installment.schedule.forEach(item => {
                if (item.status === 'pending') {
                    const dueDate = new Date(item.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    
                    // تحديث الحالة إذا كان القسط متأخراً
                    if (dueDate < today) {
                        item.status = 'overdue';
                        hasOverdueInstallments = true;
                        updatedCount++;
                    }
                }
            });
        }
        
        // تحديث حالة القسط الرئيسي
        if (hasOverdueInstallments) {
            installment.status = 'overdue';
            
            // تحديث تاريخ التعديل
            installment.updatedAt = new Date().toISOString();
        }
    });
    
    if (updatedCount > 0) {
        // حفظ البيانات في التخزين المحلي
        saveEmployeeData();
        
        // إعادة عرض جدول الأقساط إذا كان مرئياً
        const installmentsPage = document.getElementById('installments-page');
    }
}

// إنشاء نافذة منبثقة مخصصة
function showModal(title, content) {
    // إنشاء عناصر النافذة المنبثقة
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalOverlay.style.zIndex = '9999';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp" style="background-color: white; border-radius: 10px; max-width: 90%; width: 800px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);">
            <div class="modal-header" style="padding: 15px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                <h3 class="modal-title" style="margin: 0; font-size: 1.25rem;">${title}</h3>
                <button class="modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 20px;">
                ${content}
            </div>
            <div class="modal-footer" style="padding: 15px; border-top: 1px solid #e5e7eb; text-align: left;">
                <button class="btn btn-outline modal-close-btn" style="padding: 10px 20px; background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 5px; cursor: pointer;">إغلاق</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة للصفحة
    document.body.appendChild(modalOverlay);
    
    // إضافة مستمعي الأحداث لأزرار الإغلاق
    const closeButtons = modalOverlay.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
    });
    
    // إغلاق النافذة عند النقر خارجها
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });
    
    return modalOverlay;
}

// تنسيق العملة
function formatCurrency(amount) {
    // التعامل مع القيم غير الصحيحة
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0 دينار';
    }
    
    // تقريب المبلغ إلى رقمين عشريين
    amount = parseFloat(amount.toFixed(2));
    
    // إذا كان العدد صحيحًا، لا تُظهر الأرقام العشرية
    if (amount % 1 === 0) {
        amount = Math.floor(amount);
    }
    
    // إضافة فواصل الآلاف
    const formattedAmount = amount.toLocaleString('ar-EG');
    
    // إضافة اسم العملة
    return `${formattedAmount} دينار`;
}
// تنفيذ الوظائف عند تحميل الصفحة
window.addEventListener('load', function() {
    // تحديث حالة الأقساط المتأخرة
    updateOverdueInstallments();
    
    // تهيئة الرسوم البيانية
    initEmployeeCharts();
    
    // إعداد أزرار تصدير البيانات
    setupExportButtons();
});

// تهيئة الرسوم البيانية للموظفين والأقساط
function initEmployeeCharts() {
    console.log('تهيئة الرسوم البيانية للموظفين والأقساط...');
    
    // رسم بياني للرواتب الشهرية
    initMonthlySalariesChart();
    
    // رسم بياني لأداء الموظفين
    initEmployeePerformanceChart();
    
    // رسم بياني لتوزيع المبيعات
    initSalesDistributionChart();
    
    // رسم بياني لأداء الأقسام
    initDepartmentsPerformanceChart();
    
    // رسم بياني لمتابعة الأقساط
    initInstallmentsChart();
    
    // رسم بياني لنسبة تحصيل الأقساط
    initInstallmentsCollectionChart();
}

// تهيئة رسم بياني للرواتب الشهرية
function initMonthlySalariesChart() {
    const chartCanvas = document.getElementById('monthly-salaries-chart');
    if (!chartCanvas || !window.Chart) return;
    
    // جمع بيانات الرواتب الشهرية
    const monthlySalaryData = getMonthlySalaryData();
    
    // إنشاء الرسم البياني
    new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: monthlySalaryData.labels,
            datasets: [{
                label: 'إجمالي الرواتب',
                data: monthlySalaryData.totalSalaries,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }, {
                label: 'الرواتب الأساسية',
                data: monthlySalaryData.basicSalaries,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }, {
                label: 'العمولات',
                data: monthlySalaryData.commissions,
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 1
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
                },
                x: {
                    title: {
                        display: true,
                        text: 'الشهر'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'الرواتب الشهرية'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

// جمع بيانات الرواتب الشهرية
function getMonthlySalaryData() {
    // الحصول على الأشهر الستة الأخيرة
    const labels = [];
    const totalSalaries = [];
    const basicSalaries = [];
    const commissions = [];
    
    const now = new Date();
    const months = [];
    
    // إنشاء قائمة الأشهر الستة الأخيرة
    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = month.toISOString().substring(0, 7); // YYYY-MM
        const monthLabel = month.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' });
        
        months.push({
            monthStr,
            monthLabel
        });
        
        labels.push(monthLabel);
        totalSalaries.push(0);
        basicSalaries.push(0);
        commissions.push(0);
    }
    
    // حساب مجموع الرواتب لكل شهر
    salaries.forEach(salary => {
        const salaryMonth = salary.salaryMonth;
        
        const monthIndex = months.findIndex(m => m.monthStr === salaryMonth);
        if (monthIndex !== -1) {
            totalSalaries[monthIndex] += salary.totalSalary;
            basicSalaries[monthIndex] += salary.basicSalary;
            commissions[monthIndex] += salary.commission;
        }
    });
    
    return {
        labels,
        totalSalaries,
        basicSalaries,
        commissions
    };
}

// تهيئة رسم بياني لأداء الموظفين
function initEmployeePerformanceChart() {
    const chartCanvas = document.getElementById('employee-performance-chart');
    if (!chartCanvas || !window.Chart) return;
    
    // جمع بيانات أداء الموظفين
    const performanceData = getEmployeePerformanceData();
    
    // إنشاء الرسم البياني
    new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: performanceData.labels,
            datasets: [{
                label: 'المبيعات',
                data: performanceData.sales,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }, {
                label: 'العمولات',
                data: performanceData.commissions,
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 1
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
                },
                x: {
                    title: {
                        display: true,
                        text: 'الموظف'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'أداء الموظفين'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

// جمع بيانات أداء الموظفين
function getEmployeePerformanceData() {
    const labels = [];
    const sales = [];
    const commissions = [];
    
    // جمع أسماء الموظفين النشطين
    const activeEmployees = employees.filter(employee => employee.status === 'active');
    
    activeEmployees.forEach(employee => {
        // إضافة اسم الموظف
        labels.push(employee.name);
        
        // حساب إجمالي المبيعات والعمولات
        let totalSales = 0;
        let totalCommission = 0;
        
        salaries.forEach(salary => {
            if (salary.employeeId === employee.id) {
                totalSales += salary.salesAmount;
                totalCommission += salary.commission;
            }
        });
        
        sales.push(totalSales);
        commissions.push(totalCommission);
    });
    
    return {
        labels,
        sales,
        commissions
    };
}

// تهيئة رسم بياني لتوزيع المبيعات
function initSalesDistributionChart() {
    const chartCanvas = document.getElementById('sales-distribution-chart');
    if (!chartCanvas || !window.Chart) return;
    
    // جمع بيانات توزيع المبيعات
    const salesData = getSalesDistributionData();
    
    // إنشاء الرسم البياني
    new Chart(chartCanvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: salesData.labels,
            datasets: [{
                data: salesData.values,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(14, 165, 233, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'توزيع المبيعات'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// جمع بيانات توزيع المبيعات
function getSalesDistributionData() {
    const employeeSales = {};
    
    // جمع مبيعات كل موظف
    salaries.forEach(salary => {
        if (!employeeSales[salary.employeeId]) {
            employeeSales[salary.employeeId] = {
                name: salary.employeeName,
                total: 0
            };
        }
        
        employeeSales[salary.employeeId].total += salary.salesAmount;
    });
    
    // تحويل البيانات إلى مصفوفتين للتسميات والقيم
    const labels = [];
    const values = [];
    
    Object.values(employeeSales)
        .sort((a, b) => b.total - a.total)
        .slice(0, 6) // أخذ أعلى 6 موظفين
        .forEach(item => {
            labels.push(item.name);
            values.push(item.total);
        });
    
    return {
        labels,
        values
    };
}

// تهيئة رسم بياني لأداء الأقسام
function initDepartmentsPerformanceChart() {
    const chartCanvas = document.getElementById('departments-performance-chart');
    if (!chartCanvas || !window.Chart) return;
    
    // جمع بيانات أداء الأقسام
    const departmentData = getDepartmentsPerformanceData();
    
    // إنشاء الرسم البياني
    new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: departmentData.labels,
            datasets: [{
                label: 'المبيعات',
                data: departmentData.sales,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }, {
                label: 'الموظفين',
                data: departmentData.employeeCount,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                yAxisID: 'y1'
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
                        text: 'المبيعات (دينار)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'عدد الموظفين'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'القسم'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'أداء الأقسام'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

// جمع بيانات أداء الأقسام
function getDepartmentsPerformanceData() {
    const departments = {
        'sales': { label: 'المبيعات', sales: 0, employees: 0 },
        'admin': { label: 'الإدارة', sales: 0, employees: 0 },
        'finance': { label: 'المالية', sales: 0, employees: 0 },
        'operations': { label: 'العمليات', sales: 0, employees: 0 },
        'it': { label: 'تقنية المعلومات', sales: 0, employees: 0 }
    };
    
    // حساب عدد الموظفين في كل قسم
    employees.forEach(employee => {
        if (departments[employee.department]) {
            departments[employee.department].employees++;
        }
    });
    
    // حساب المبيعات لكل قسم
    salaries.forEach(salary => {
        const employee = employees.find(emp => emp.id === salary.employeeId);
        if (employee && departments[employee.department]) {
            departments[employee.department].sales += salary.salesAmount;
        }
    });
    
    // تحويل البيانات إلى مصفوفات
    const labels = Object.values(departments).map(d => d.label);
    const sales = Object.values(departments).map(d => d.sales);
    const employeeCount = Object.values(departments).map(d => d.employees);
    
    return {
        labels,
        sales,
        employeeCount
    };
}

// تهيئة رسم بياني لمتابعة الأقساط
function initInstallmentsChart() {
    const chartCanvas = document.getElementById('installments-chart');
    if (!chartCanvas || !window.Chart) return;
    
    // جمع بيانات الأقساط
    const installmentData = getInstallmentData();
    
    // إنشاء الرسم البياني
    new Chart(chartCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: installmentData.labels,
            datasets: [{
                label: 'الأقساط المستحقة',
                data: installmentData.dueAmount,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'المبالغ المحصلة',
                data: installmentData.paidAmount,
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
                },
                x: {
                    title: {
                        display: true,
                        text: 'الشهر'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'متابعة الأقساط'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

// جمع بيانات الأقساط
function getInstallmentData() {
    // الحصول على الأشهر الستة القادمة
    const labels = [];
    const dueAmount = [];
    const paidAmount = [];
    
    const now = new Date();
    const months = [];
    
    // إنشاء قائمة الأشهر الستة القادمة
    for (let i = 0; i < 6; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const monthStr = month.toISOString().substring(0, 7); // YYYY-MM
        const monthLabel = month.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' });
        
        months.push({
            monthStr,
            monthLabel,
            startDate: new Date(month.getFullYear(), month.getMonth(), 1),
            endDate: new Date(month.getFullYear(), month.getMonth() + 1, 0)
        });
        
        labels.push(monthLabel);
        dueAmount.push(0);
        paidAmount.push(0);
    }
    
    // حساب المبالغ المستحقة والمدفوعة لكل شهر
    installments.forEach(installment => {
        if (installment.schedule && installment.schedule.length > 0) {
            installment.schedule.forEach(item => {
                const dueDate = new Date(item.dueDate);
                
                // البحث عن الشهر المناسب
                const monthIndex = months.findIndex(m => dueDate >= m.startDate && dueDate <= m.endDate);
                
                if (monthIndex !== -1) {
                    if (item.status === 'paid') {
                        paidAmount[monthIndex] += item.amount;
                    } else {
                        dueAmount[monthIndex] += item.amount;
                    }
                }
            });
        }
    });
    
    return {
        labels,
        dueAmount,
        paidAmount
    };
}

// تهيئة رسم بياني لنسبة تحصيل الأقساط
function initInstallmentsCollectionChart() {
    const chartCanvas = document.getElementById('installments-collection-chart');
    if (!chartCanvas || !window.Chart) return;
    
    // جمع بيانات تحصيل الأقساط
    const collectionData = getInstallmentCollectionData();
    
    // إنشاء الرسم البياني
    new Chart(chartCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: collectionData.labels,
            datasets: [{
                data: collectionData.values,
                backgroundColor: [
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(239, 68, 68, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'نسبة تحصيل الأقساط'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${context.label}: ${percentage}%`;
                        }
                    }
                }
            }
        }
    });
}

// جمع بيانات تحصيل الأقساط
function getInstallmentCollectionData() {
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;
    
    // حساب المبالغ المدفوعة والمعلقة والمتأخرة
    installments.forEach(installment => {
        if (installment.schedule && installment.schedule.length > 0) {
            installment.schedule.forEach(item => {
                if (item.status === 'paid') {
                    paidAmount += item.amount;
                } else if (item.status === 'overdue') {
                    overdueAmount += item.amount;
                } else {
                    pendingAmount += item.amount;
                }
            });
        }
    });
    
    return {
        labels: ['مدفوع', 'مستقبلي', 'متأخر'],
        values: [paidAmount, pendingAmount, overdueAmount]
    };
}

// إعداد أزرار تصدير البيانات
function setupExportButtons() {
    console.log('إعداد أزرار تصدير البيانات...');
    
    // إعداد زر تصدير بيانات الموظفين
    const exportEmployeesBtn = document.getElementById('export-employees-btn');
    if (exportEmployeesBtn && !exportEmployeesBtn.hasListener) {
        exportEmployeesBtn.addEventListener('click', function() {
            exportEmployeesToExcel();
        });
        exportEmployeesBtn.hasListener = true;
    }
    
    // إعداد زر تصدير بيانات الرواتب
    const exportSalariesBtn = document.getElementById('export-salaries-btn');
    if (exportSalariesBtn && !exportSalariesBtn.hasListener) {
        exportSalariesBtn.addEventListener('click', function() {
            exportSalariesToExcel();
        });
        exportSalariesBtn.hasListener = true;
    }
    
    // إعداد زر تصدير بيانات الأقساط
    const exportInstallmentsBtn = document.getElementById('export-installments-btn');
    if (exportInstallmentsBtn && !exportInstallmentsBtn.hasListener) {
        exportInstallmentsBtn.addEventListener('click', function() {
            exportInstallmentsToExcel();
        });
        exportInstallmentsBtn.hasListener = true;
    }
    
    // إعداد زر تصدير تقرير الموظفين
    const exportEmployeeReportBtn = document.getElementById('export-employee-report-btn');
    if (exportEmployeeReportBtn && !exportEmployeeReportBtn.hasListener) {
        exportEmployeeReportBtn.addEventListener('click', function() {
            exportEmployeeReportToExcel();
        });
        exportEmployeeReportBtn.hasListener = true;
    }
}

// تصدير بيانات الموظفين إلى ملف Excel
function exportEmployeesToExcel() {
    console.log('تصدير بيانات الموظفين إلى Excel...');
    
    // التحقق من وجود موظفين
    if (!employees || employees.length === 0) {
        showNotification('لا يوجد موظفين للتصدير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عناوين الأعمدة
    const headers = [
        'الرقم',
        'الاسم',
        'رقم الهاتف',
        'البريد الإلكتروني',
        'العنوان',
        'المسمى الوظيفي',
        'القسم',
        'الراتب الأساسي',
        'نسبة المبيعات',
        'تاريخ التعيين',
        'نوع العقد',
        'الحالة',
        'رقم البطاقة الوطنية',
        'رقم بطاقة السكن',
        'ملاحظات'
    ];
    
    csvRows.push(headers.join(','));
    
    // إضافة بيانات الموظفين
    employees.forEach((employee, index) => {
        const values = [
            index + 1,
            employee.name,
            employee.phone,
            employee.email || '',
            employee.address || '',
            employee.jobTitle,
            translateDepartment(employee.department),
            employee.salary,
            employee.commission,
            employee.hireDate,
            translateContractType(employee.contractType),
            employee.status === 'active' ? 'نشط' : 'غير نشط',
            employee.idNumber || '',
            employee.residenceCard || '',
            employee.notes || ''
        ];
        
        // تنظيف القيم للتصدير CSV
        const cleanedValues = values.map(value => {
            if (value === null || value === undefined) return '';
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
        });
        
        csvRows.push(cleanedValues.join(','));
    });
    
    // تصدير الملف
    exportCSV(csvRows.join('\n'), `قائمة_الموظفين_${new Date().toISOString().split('T')[0]}.csv`);
}

// تصدير بيانات الرواتب إلى ملف Excel
function exportSalariesToExcel() {
    console.log('تصدير بيانات الرواتب إلى Excel...');
    
    // التحقق من وجود رواتب
    if (!salaries || salaries.length === 0) {
        showNotification('لا يوجد رواتب للتصدير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عناوين الأعمدة
    const headers = [
        'الرقم',
        'الموظف',
        'شهر الراتب',
        'تاريخ الصرف',
        'الراتب الأساسي',
        'المبيعات',
        'العمولة',
        'العلاوات',
        'الاستقطاعات',
        'إجمالي الراتب',
        'ملاحظات'
    ];
    
    csvRows.push(headers.join(','));
    
    // إضافة بيانات الرواتب
    salaries.forEach((salary, index) => {
        const values = [
            index + 1,
            salary.employeeName,
            new Date(salary.salaryMonth + '-01').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' }),
            salary.salaryDate,
            salary.basicSalary,
            salary.salesAmount,
            salary.commission,
            salary.bonus,
            salary.deductions,
            salary.totalSalary,
            salary.notes || ''
        ];
        
        // تنظيف القيم للتصدير CSV
        const cleanedValues = values.map(value => {
            if (value === null || value === undefined) return '';
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
        });
        
        csvRows.push(cleanedValues.join(','));
    });
    
    // تصدير الملف
    exportCSV(csvRows.join('\n'), `سجل_الرواتب_${new Date().toISOString().split('T')[0]}.csv`);
}
// تصدير بيانات الأقساط إلى ملف Excel (تكملة)
function exportInstallmentsToExcel() {
    console.log('تصدير بيانات الأقساط إلى Excel...');
    
    // التحقق من وجود أقساط
    if (!installments || installments.length === 0) {
        showNotification('لا يوجد أقساط للتصدير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عناوين الأعمدة
    const headers = [
        'الرقم',
        'العميل',
        'رقم الهاتف',
        'الموظف المسؤول',
        'المبلغ الإجمالي',
        'الدفعة الأولى',
        'المبلغ المتبقي',
        'عدد الأقساط',
        'قيمة القسط',
        'فترة السداد',
        'تاريخ البدء',
        'المبلغ المدفوع',
        'الحالة',
        'معلومات المنتج'
    ];
    
    csvRows.push(headers.join(','));
    
    // إضافة بيانات الأقساط
    installments.forEach((installment, index) => {
        // ترجمة فترة السداد
        let periodText = 'شهري';
        if (installment.installmentPeriod === 'quarterly') periodText = 'ربع سنوي';
        else if (installment.installmentPeriod === 'semi-annual') periodText = 'نصف سنوي';
        else if (installment.installmentPeriod === 'annual') periodText = 'سنوي';
        
        // ترجمة الحالة
        let statusText = 'نشط';
        if (installment.status === 'paid') statusText = 'مدفوع';
        else if (installment.status === 'overdue') statusText = 'متأخر';
        
        const values = [
            index + 1,
            installment.customerName,
            installment.customerPhone,
            installment.employeeName || 'غير محدد',
            installment.totalAmount,
            installment.downPayment,
            installment.remainingAmount,
            installment.installmentCount,
            installment.installmentAmount,
            periodText,
            installment.startDate,
            installment.paidAmount,
            statusText,
            installment.productInfo || ''
        ];
        
        // تنظيف القيم للتصدير CSV
        const cleanedValues = values.map(value => {
            if (value === null || value === undefined) return '';
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
        });
        
        csvRows.push(cleanedValues.join(','));
    });
    
    // تصدير الملف
    exportCSV(csvRows.join('\n'), `سجل_الأقساط_${new Date().toISOString().split('T')[0]}.csv`);
}

// تصدير تقرير الموظفين إلى ملف Excel
function exportEmployeeReportToExcel() {
    console.log('تصدير تقرير الموظفين إلى Excel...');
    
    // التحقق من وجود موظفين ورواتب
    if (!employees || employees.length === 0 || !salaries || salaries.length === 0) {
        showNotification('لا يوجد بيانات كافية للتقرير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عنوان التقرير
    csvRows.push(`"تقرير أداء الموظفين - ${new Date().toLocaleDateString('ar-EG')}"`);
    csvRows.push('');
    
    // إضافة ملخص عام
    csvRows.push('"ملخص عام"');
    csvRows.push(`"عدد الموظفين النشطين","${employees.filter(emp => emp.status === 'active').length}"`);
    csvRows.push(`"إجمالي الرواتب الأساسية","${employees.reduce((sum, emp) => sum + (emp.status === 'active' ? emp.salary : 0), 0)}"`);
    csvRows.push(`"إجمالي المبيعات","${salaries.reduce((sum, s) => sum + s.salesAmount, 0)}"`);
    csvRows.push(`"إجمالي العمولات","${salaries.reduce((sum, s) => sum + s.commission, 0)}"`);
    csvRows.push('');
    
    // إضافة تقرير تفصيلي للموظفين
    csvRows.push('"تقرير تفصيلي للموظفين"');
    
    // إضافة عناوين الأعمدة
    const headers = [
        'الموظف',
        'المسمى الوظيفي',
        'القسم',
        'الراتب الأساسي',
        'نسبة العمولة',
        'المبيعات الإجمالية',
        'العمولات الإجمالية',
        'نسبة المساهمة',
        'مدة العمل'
    ];
    
    csvRows.push(headers.join(','));
    
    // إضافة بيانات الموظفين
    const activeEmployees = employees.filter(emp => emp.status === 'active');
    
    // حساب إجمالي المبيعات للحصول على نسبة المساهمة
    const totalSales = salaries.reduce((sum, s) => sum + s.salesAmount, 0);
    
    activeEmployees.forEach(employee => {
        // حساب إجمالي المبيعات والعمولات للموظف
        const employeeSalaries = salaries.filter(s => s.employeeId === employee.id);
        const employeeSales = employeeSalaries.reduce((sum, s) => sum + s.salesAmount, 0);
        const employeeCommissions = employeeSalaries.reduce((sum, s) => sum + s.commission, 0);
        
        // حساب نسبة المساهمة في المبيعات
        const contributionRate = totalSales > 0 ? (employeeSales / totalSales * 100).toFixed(2) : '0';
        
        // حساب مدة العمل
        const workDuration = calculateEmploymentDuration(employee.hireDate);
        
        const values = [
            employee.name,
            employee.jobTitle,
            translateDepartment(employee.department),
            employee.salary,
            employee.commission + '%',
            employeeSales,
            employeeCommissions,
            contributionRate + '%',
            workDuration
        ];
        
        // تنظيف القيم للتصدير CSV
        const cleanedValues = values.map(value => {
            if (value === null || value === undefined) return '';
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
        });
        
        csvRows.push(cleanedValues.join(','));
    });
    
    // تصدير الملف
    exportCSV(csvRows.join('\n'), `تقرير_الموظفين_${new Date().toISOString().split('T')[0]}.csv`);
}

// تصدير بيانات CSV
function exportCSV(csvContent, fileName) {
    // إنشاء Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // إنشاء رابط التنزيل
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    
    // إضافة الرابط وتنفيذ النقر
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    document.body.removeChild(link);
    
    showNotification(`تم تصدير الملف بنجاح: ${fileName}`, 'success');
}

// إظهار إشعار
function showNotification(message, type = 'info') {
    // استخدام دالة عرض الإشعارات الموجودة في التطبيق إذا كانت متاحة
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // تنفيذ دالة إشعار بسيطة إذا لم تكن متاحة
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${getIconForType(type)}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${getTitleForType(type)}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // إضافة الإشعار إلى الصفحة
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // إضافة مستمع حدث لزر الإغلاق
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
    }
    
    // إخفاء الإشعار تلقائياً بعد 5 ثوانٍ
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // دوال مساعدة للإشعار
    function getIconForType(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'times-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
    
    function getTitleForType(type) {
        switch (type) {
            case 'success': return 'تم بنجاح';
            case 'error': return 'خطأ';
            case 'warning': return 'تنبيه';
            default: return 'معلومات';
        }
    }
}

// تصدير الوظائف للاستخدام في النظام
window.EmployeeSystem = {
    renderEmployeesTable,
    renderSalariesTable,
    renderInstallmentsTable,
    
    showEmployeeDetails,
    openAddEmployeeModal,
    saveEmployee,
    deleteEmployee,
    
    openPaySalaryModal,
    saveSalary,
    
    openAddInstallmentModal,
    saveInstallment,
    payInstallment,
    
    updateOverdueInstallments,
    initEmployeeCharts,
    
    exportEmployeesToExcel,
    exportSalariesToExcel,
    exportInstallmentsToExcel,
    exportEmployeeReportToExcel
};

// إضافة نمط CSS لنظام الإشعارات
function addNotificationStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('notification-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'notification-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            align-items: center;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: 12px 16px;
            width: 350px;
            z-index: 9999;
            transform: translateX(120%);
            transition: transform 0.3s ease-in-out;
            direction: rtl;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-icon {
            margin-left: 12px;
            font-size: 1.5rem;
        }
        
        .notification-content {
            flex: 1;
        }
        
        .notification-title {
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .notification-message {
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: #9ca3af;
            margin-right: 8px;
        }
        
        .notification-close:hover {
            color: #6b7280;
        }
        
        .notification-success .notification-icon {
            color: #10b981;
        }
        
        .notification-error .notification-icon {
            color: #ef4444;
        }
        
        .notification-warning .notification-icon {
            color: #f59e0b;
        }
        
        .notification-info .notification-icon {
            color: #3b82f6;
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
}

// استدعاء دالة إضافة أنماط الإشعارات
addNotificationStyles();

// بدء تشغيل النظام
console.log('تم تحميل نظام إدارة الموظفين والأقساط بنجاح');
showNotification('تم تحميل نظام إدارة الموظفين والأقساط', 'success');