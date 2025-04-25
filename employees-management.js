/**
 * employees-management.js
 * نظام إدارة الموظفين والرواتب لنظام الاستثمار المتكامل
 */

// المتغيرات الرئيسية
let employees = [];
let salaryPayments = [];
let deductions = [];

document.addEventListener('DOMContentLoaded', function() {
    // استدعاء الدالة الأصلية للتأكد من تنفيذ الأكواد الأصلية أولاً
    const originalAddModals = window.addModals;
    
    window.addModals = function() {
        // استدعاء الدالة الأصلية
        if (typeof originalAddModals === 'function') {
            originalAddModals();
        }
        
        // تعديل نموذج إضافة موظف
        updateEmployeeForm();
        
        // تعديل نموذج تسجيل راتب
        updateSalaryForm();
    };
    
    // التأكد من تحديث نماذج النوافذ بعد تحميل الصفحة
    setTimeout(function() {
        updateEmployeeForm();
        updateSalaryForm();
    }, 1000);
});

/**
 * إضافة عنصر القائمة الجانبية
 */
function addSidebarMenuItem() {
    // البحث عن قائمة التنقل في الشريط الجانبي
    const navList = document.querySelector('.sidebar .nav-list');
    if (!navList) {
        console.error('لم يتم العثور على قائمة التنقل في الشريط الجانبي');
        return;
    }
    
    // إنشاء عنصر قائمة جديد للموظفين
    const employeesMenuItem = document.createElement('li');
    employeesMenuItem.className = 'nav-item';
    employeesMenuItem.innerHTML = `
        <a class="nav-link" data-page="employees" href="#">
            <div class="nav-icon">
                <i class="fas fa-user-tie"></i>
            </div>
            <span>الموظفين</span>
        </a>
    `;
    
    
    // إضافة عنصر القائمة قبل عنصر الإعدادات
    const settingsMenuItem = navList.querySelector('.nav-item:nth-last-child(2)');
    if (settingsMenuItem) {
        navList.insertBefore(employeesMenuItem, settingsMenuItem);
    } else {
        // إذا لم يتم العثور على عنصر الإعدادات، نضيف العنصر في نهاية القائمة
        navList.appendChild(employeesMenuItem);
    }
}

/**
 * إضافة صفحة الموظفين في التطبيق
 */
function addEmployeesPage() {
    // البحث عن العنصر الرئيسي للمحتوى
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('لم يتم العثور على العنصر الرئيسي للمحتوى');
        return;
    }
    
    // إنشاء صفحة الموظفين
    const employeesPage = document.createElement('div');
    employeesPage.className = 'page';
    employeesPage.id = 'employees-page';
    
    // إضافة محتوى الصفحة
    employeesPage.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">إدارة الموظفين</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" placeholder="بحث عن موظف..." type="text" id="employees-search" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-primary" id="add-employee-btn">
                    <i class="fas fa-plus"></i>
                    <span>إضافة موظف</span>
                </button>
            </div>
        </div>
        
        <!-- تبويبات الموظفين -->
        <div class="employees-tabs">
            <div class="tab-buttons">
                <button class="tab-btn active" data-tab="employees-list">قائمة الموظفين</button>
                <button class="tab-btn" data-tab="salary-payments">الرواتب والمدفوعات</button>
                <button class="tab-btn" data-tab="deductions">الاستقطاعات</button>
                <button class="tab-btn" data-tab="reports">التقارير</button>
            </div>
            
            <!-- تبويب قائمة الموظفين -->
            <div class="tab-content active" id="employees-list-tab">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">جميع الموظفين</h2>
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
                                    <th>الرقم</th>
                                    <th>الموظف</th>
                                    <th>الوظيفة</th>
                                    <th>تاريخ التعيين</th>
                                    <th>الراتب الأساسي</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- سيتم ملؤها ديناميكيًا -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- تبويب الرواتب والمدفوعات -->
            <div class="tab-content" id="salary-payments-tab">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">الرواتب والمدفوعات</h2>
                        <div class="section-actions">
                            <button class="btn btn-success" id="record-salary-payment-btn">
                                <i class="fas fa-plus"></i>
                                <span>تسجيل راتب</span>
                            </button>
                            <button class="btn btn-outline btn-sm" id="export-payments-btn" title="تصدير">
                                <i class="fas fa-download"></i>
                                <span>تصدير</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- شهر المدفوعات -->
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">شهر المدفوعات</label>
                            <input type="month" class="form-input" id="payment-month" value="${getCurrentMonth()}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">الفلترة</label>
                            <select class="form-select" id="payment-status-filter">
                                <option value="all">جميع المدفوعات</option>
                                <option value="paid">مدفوعة</option>
                                <option value="pending">غير مدفوعة</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table id="salary-payments-table">
                            <thead>
                                <tr>
                                    <th>الرقم</th>
                                    <th>الموظف</th>
                                    <th>الشهر</th>
                                    <th>الراتب الأساسي</th>
                                    <th>الاستقطاعات</th>
                                    <th>العلاوات</th>
                                    <th>الصافي</th>
                                    <th>حالة الدفع</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- سيتم ملؤها ديناميكيًا -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- تبويب الاستقطاعات -->
            <div class="tab-content" id="deductions-tab">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">الاستقطاعات والخصومات</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" id="add-deduction-btn">
                                <i class="fas fa-plus"></i>
                                <span>إضافة استقطاع</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table id="deductions-table">
                            <thead>
                                <tr>
                                    <th>الرقم</th>
                                    <th>الموظف</th>
                                    <th>نوع الاستقطاع</th>
                                    <th>المبلغ</th>
                                    <th>التاريخ</th>
                                    <th>ملاحظات</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- سيتم ملؤها ديناميكيًا -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- تبويب التقارير -->
            <div class="tab-content" id="reports-tab">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">تقارير الرواتب</h2>
                        <div class="section-actions">
                            <div class="btn-group">
                                <button class="btn btn-outline btn-sm active" data-report="monthly">شهري</button>
                                <button class="btn btn-outline btn-sm" data-report="quarterly">ربعي</button>
                                <button class="btn btn-outline btn-sm" data-report="yearly">سنوي</button>
                            </div>
                            <button class="btn btn-outline btn-sm" id="print-report-btn">
                                <i class="fas fa-print"></i>
                                <span>طباعة</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- تاريخ التقرير -->
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الفترة</label>
                            <input type="month" class="form-input" id="report-period" value="${getCurrentMonth()}" />
                        </div>
                        <div class="form-group">
                            <button class="btn btn-primary" id="generate-report-btn">إنشاء التقرير</button>
                        </div>
                    </div>
                    
                    <!-- نتائج التقرير -->
                    <div class="report-container" id="report-results">
                        <div class="report-summary">
                            <div class="summary-card">
                                <div class="summary-title">إجمالي الرواتب</div>
                                <div class="summary-value" id="total-salaries">0</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-title">إجمالي الاستقطاعات</div>
                                <div class="summary-value" id="total-deductions">0</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-title">إجمالي العلاوات</div>
                                <div class="summary-value" id="total-allowances">0</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-title">صافي المدفوعات</div>
                                <div class="summary-value" id="net-payments">0</div>
                            </div>
                        </div>
                        
                        <div class="report-charts">
                            <div class="chart-container">
                                <canvas id="salaries-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // إضافة الصفحة إلى العنصر الرئيسي
    mainContent.appendChild(employeesPage);
}

/**
 * إضافة النوافذ المنبثقة
 */
function addModals() {
    // النوافذ المنبثقة الرئيسية
    const modals = `
        <!-- نافذة إضافة موظف -->
        <div class="modal-overlay" id="add-employee-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">إضافة موظف جديد</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="add-employee-form">
                        <div class="grid-cols-2">
                            <div class="form-group">
                                <label class="form-label">اسم الموظف</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-name" required="" type="text" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">رقم الهاتف</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-phone" required="" type="tel" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">المسمى الوظيفي</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-position" required="" type="text" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">القسم</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-department" required="" type="text" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">تاريخ التعيين</label>
                                <input class="form-input" id="employee-hire-date" required="" type="date" value="${getCurrentDate()}" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">الراتب الأساسي</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-salary" min="0" required="" type="number" step="1000" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">البريد الإلكتروني</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-email" type="email" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">يوم تسليم الراتب</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-payday" min="1" max="31" type="number" value="1" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">العنوان</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-address" type="text" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">الحالة</label>
                                <select class="form-select" id="employee-status">
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </select>
                            </div>
                            <div class="form-group grid-span-2">
                                <label class="form-label">ملاحظات</label>
                                <textarea class="form-input" id="employee-notes" rows="3"></textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-employee-btn">إضافة</button>
                </div>
            </div>
        </div>
        
        <!-- نافذة تفاصيل الموظف -->
        <div class="modal-overlay" id="employee-details-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تفاصيل الموظف</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body" id="employee-details-content">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                    <div class="btn-group">
                        <button class="btn btn-primary" id="edit-employee-btn">
                            <i class="fas fa-edit"></i>
                            <span>تعديل</span>
                        </button>
                        <button class="btn btn-danger" id="delete-employee-btn">
                            <i class="fas fa-trash"></i>
                            <span>حذف</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- نافذة تسجيل دفع راتب -->
        <div class="modal-overlay" id="record-salary-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تسجيل راتب</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="record-salary-form">
                        <div class="form-group">
                            <label class="form-label">الموظف</label>
                            <select class="form-select" id="salary-employee" required="">
                                <option value="">اختر الموظف</option>
                                <!-- سيتم ملؤها ديناميكيًا -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">الشهر</label>
                            <input class="form-input" id="salary-month" required="" type="month" value="${getCurrentMonth()}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">الراتب الأساسي</label>
                            <input class="form-input" id="salary-amount" required="" type="number" readonly />
                        </div>
                        <div class="form-group">
                            <label class="form-label">العلاوات</label>
                            <input class="form-input" id="salary-allowances" type="number" value="0" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">الاستقطاعات</label>
                            <input class="form-input" id="salary-deductions" type="number" value="0" readonly />
                            <small id="deductions-details" class="text-muted"></small>
                        </div>
                        <div class="form-group">
                            <label class="form-label">صافي الراتب</label>
                            <input class="form-input" id="salary-net" type="number" readonly />
                        </div>
                        <div class="form-group">
                            <label class="form-label">حالة الدفع</label>
                            <select class="form-select" id="salary-status">
                                <option value="pending">غير مدفوع</option>
                                <option value="paid">مدفوع</option>
                            </select>
                        </div>
                        <div id="payment-details" style="display: none;">
                            <div class="form-group">
                                <label class="form-label">تاريخ الدفع</label>
                                <input class="form-input" id="payment-date" type="date" value="${getCurrentDate()}" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">طريقة الدفع</label>
                                <select class="form-select" id="payment-method">
                                    <option value="cash">نقدي</option>
                                    <option value="bank">تحويل بنكي</option>
                                    <option value="cheque">شيك</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">رقم المرجع</label>
                                <input class="form-input" id="payment-reference" type="text" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-input" id="salary-notes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-salary-btn">تسجيل</button>
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
                <div class="modal-body" id="salary-details-content">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                    <div class="btn-group">
                        <button class="btn btn-success" id="mark-as-paid-btn">
                            <i class="fas fa-check"></i>
                            <span>تعيين كمدفوع</span>
                        </button>
                        <button class="btn btn-primary" id="print-salary-btn">
                            <i class="fas fa-print"></i>
                            <span>طباعة</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- نافذة إضافة استقطاع -->
        <div class="modal-overlay" id="add-deduction-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">إضافة استقطاع</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="add-deduction-form">
                        <div class="form-group">
                            <label class="form-label">الموظف</label>
                            <select class="form-select" id="deduction-employee" required="">
                                <option value="">اختر الموظف</option>
                                <!-- سيتم ملؤها ديناميكيًا -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">نوع الاستقطاع</label>
                            <select class="form-select" id="deduction-type" required="">
                                <option value="">اختر نوع الاستقطاع</option>
                                <option value="absence">غياب</option>
                                <option value="late">تأخير</option>
                                <option value="tax">ضريبة</option>
                                <option value="insurance">تأمين</option>
                                <option value="loan">قرض</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">المبلغ</label>
                            <input class="form-input" id="deduction-amount" required="" type="number" min="0" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">التاريخ</label>
                            <input class="form-input" id="deduction-date" required="" type="date" value="${getCurrentDate()}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-input" id="deduction-notes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-deduction-btn">إضافة</button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة النوافذ المنبثقة إلى الصفحة
    document.body.insertAdjacentHTML('beforeend', modals);
}

/**
 * تحميل بيانات الموظفين من التخزين المحلي
 */
function loadEmployeesData() {
    try {
        // تحميل بيانات الموظفين
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
            employees = JSON.parse(savedEmployees);
            console.log(`تم تحميل ${employees.length} موظف`);
        }
        
        // تحميل بيانات مدفوعات الرواتب
        const savedSalaryPayments = localStorage.getItem('salaryPayments');
        if (savedSalaryPayments) {
            salaryPayments = JSON.parse(savedSalaryPayments);
            console.log(`تم تحميل ${salaryPayments.length} دفعة راتب`);
        }
        
        // تحميل بيانات الاستقطاعات
        const savedDeductions = localStorage.getItem('deductions');
        if (savedDeductions) {
            deductions = JSON.parse(savedDeductions);
            console.log(`تم تحميل ${deductions.length} استقطاع`);
        }
        
        // عرض البيانات في الجداول
        renderEmployeesTable();
        renderSalaryPaymentsTable();
        renderDeductionsTable();
    } catch (error) {
        console.error('خطأ في تحميل بيانات الموظفين:', error);
        showNotification('حدث خطأ أثناء تحميل بيانات الموظفين', 'error');
    }
}

/**
 * حفظ بيانات الموظفين في التخزين المحلي
 */
function saveEmployeesData() {
    try {
        localStorage.setItem('employees', JSON.stringify(employees));
        localStorage.setItem('salaryPayments', JSON.stringify(salaryPayments));
        localStorage.setItem('deductions', JSON.stringify(deductions));
        console.log('تم حفظ بيانات الموظفين بنجاح');
        return true;
    } catch (error) {
        console.error('خطأ في حفظ بيانات الموظفين:', error);
        showNotification('حدث خطأ أثناء حفظ بيانات الموظفين', 'error');
        return false;
    }
}

/**
 * إضافة مستمعي الأحداث للنظام
 */
function setupEventListeners() {
    console.log('إعداد مستمعي الأحداث لنظام الموظفين...');
    
    // مستمعي أحداث التبويبات
    setupTabsListeners();
    
    // مستمعي أحداث الموظفين
    setupEmployeesListeners();
    
    // مستمعي أحداث الرواتب
    setupSalaryListeners();
    
    // مستمعي أحداث الاستقطاعات
    setupDeductionsListeners();
    
    // مستمعي أحداث التقارير
    setupReportsListeners();
    
    // مستمعي أحداث البحث
    setupSearchListeners();
    
    // إضافة مستمع للتنقل بين الصفحات
    document.addEventListener('click', function(e) {
        const navLink = e.target.closest('.nav-link[data-page="employees"]');
        if (navLink) {
            e.preventDefault();
            showPage('employees');
        }
    });
}

/**
 * إعداد مستمعي أحداث التبويبات
 */
function setupTabsListeners() {
    const tabButtons = document.querySelectorAll('.employees-tabs .tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // إضافة الفئة النشطة للزر المحدد
            this.classList.add('active');
            
            // إظهار التبويب المقابل
            const tabId = this.getAttribute('data-tab');
            const tabContents = document.querySelectorAll('.employees-tabs .tab-content');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            const activeTab = document.getElementById(`${tabId}-tab`);
            if (activeTab) {
                activeTab.classList.add('active');
                
                // تحديث المحتوى حسب التبويب النشط
                if (tabId === 'employees-list') {
                    renderEmployeesTable();
                } else if (tabId === 'salary-payments') {
                    renderSalaryPaymentsTable();
                } else if (tabId === 'deductions') {
                    renderDeductionsTable();
                } else if (tabId === 'reports') {
                    updateReportData();
                }
            }
        });
    });
}

/**
 * إعداد مستمعي أحداث الموظفين
 */
function setupEmployeesListeners() {
    // مستمع حدث إضافة موظف
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', function() {
            openModal('add-employee-modal');
        });
    }
    
    // مستمع حدث حفظ موظف
    const saveEmployeeBtn = document.getElementById('save-employee-btn');
    if (saveEmployeeBtn) {
        saveEmployeeBtn.addEventListener('click', addNewEmployee);
    }
    
    // مستمع تصدير قائمة الموظفين
    const exportEmployeesBtn = document.getElementById('export-employees-btn');
    if (exportEmployeesBtn) {
        exportEmployeesBtn.addEventListener('click', exportEmployees);
    }
    
    // مستمع تصفية الموظفين حسب الحالة
    const employeeFilterButtons = document.querySelectorAll('#employees-list-tab .btn-group .btn');
    employeeFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            employeeFilterButtons.forEach(btn => btn.classList.remove('active'));
            
            // إضافة الفئة النشطة للزر المحدد
            this.classList.add('active');
            
            // تصفية الموظفين حسب الحالة
            const filter = this.getAttribute('data-filter');
            filterEmployees(filter);
        });
    });
}

/**
 * إعداد مستمعي أحداث الرواتب
 */
function setupSalaryListeners() {
    // مستمع حدث تسجيل راتب
    const recordSalaryBtn = document.getElementById('record-salary-payment-btn');
    if (recordSalaryBtn) {
        recordSalaryBtn.addEventListener('click', function() {
            openSalaryModal();
        });
    }
    
    // مستمع حدث اختيار موظف في نافذة تسجيل راتب
    const salaryEmployeeSelect = document.getElementById('salary-employee');
    if (salaryEmployeeSelect) {
        salaryEmployeeSelect.addEventListener('change', updateSalaryDetails);
    }
    
    // مستمع حدث تغيير مبلغ العلاوات
    const salaryAllowancesInput = document.getElementById('salary-allowances');
    if (salaryAllowancesInput) {
        salaryAllowancesInput.addEventListener('input', updateNetSalary);
    }
    
    // مستمع حدث تغيير حالة الدفع
    const salaryStatusSelect = document.getElementById('salary-status');
    if (salaryStatusSelect) {
        salaryStatusSelect.addEventListener('change', function() {
            const paymentDetails = document.getElementById('payment-details');
            if (paymentDetails) {
                paymentDetails.style.display = this.value === 'paid' ? 'block' : 'none';
            }
        });
    }
    
    // مستمع حدث حفظ الراتب
    const saveSalaryBtn = document.getElementById('save-salary-btn');
    if (saveSalaryBtn) {
        saveSalaryBtn.addEventListener('click', recordSalaryPayment);
    }
    
    // مستمع حدث تغيير شهر المدفوعات
    const paymentMonthInput = document.getElementById('payment-month');
    const paymentStatusFilter = document.getElementById('payment-status-filter');
    
    if (paymentMonthInput) {
        paymentMonthInput.addEventListener('change', function() {
            renderSalaryPaymentsTable();
        });
    }
    
    if (paymentStatusFilter) {
        paymentStatusFilter.addEventListener('change', function() {
            renderSalaryPaymentsTable();
        });
    }
    
    // مستمع تصدير سجل الرواتب
    const exportPaymentsBtn = document.getElementById('export-payments-btn');
    if (exportPaymentsBtn) {
        exportPaymentsBtn.addEventListener('click', exportSalaryPayments);
    }
}

/**
 * إعداد مستمعي أحداث الاستقطاعات
 */
function setupDeductionsListeners() {
    // مستمع حدث إضافة استقطاع
    const addDeductionBtn = document.getElementById('add-deduction-btn');
    if (addDeductionBtn) {
        addDeductionBtn.addEventListener('click', function() {
            openModal('add-deduction-modal');
            populateEmployeeSelect('deduction-employee');
        });
    }
    
    // مستمع حدث حفظ استقطاع
    const saveDeductionBtn = document.getElementById('save-deduction-btn');
    if (saveDeductionBtn) {
        saveDeductionBtn.addEventListener('click', addNewDeduction);
    }
}

/**
 * إعداد مستمعي أحداث التقارير
 */
function setupReportsListeners() {
    // مستمع حدث إنشاء تقرير
    const generateReportBtn = document.getElementById('generate-report-btn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    // مستمع حدث طباعة تقرير
    const printReportBtn = document.getElementById('print-report-btn');
    if (printReportBtn) {
        printReportBtn.addEventListener('click', printReport);
    }
    
    // مستمع حدث تغيير نوع التقرير
    const reportTypeButtons = document.querySelectorAll('#reports-tab .btn-group .btn');
    reportTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            reportTypeButtons.forEach(btn => btn.classList.remove('active'));
            
            // إضافة الفئة النشطة للزر المحدد
            this.classList.add('active');
            
            // تحديث بيانات التقرير
            updateReportData();
        });
    });
}

/**
 * إعداد مستمعي أحداث البحث
 */
function setupSearchListeners() {
    const searchInput = document.getElementById('employees-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            searchEmployees(query);
        });
    }
}

/**
 * عرض جدول الموظفين
 */
function renderEmployeesTable() {
    console.log('عرض جدول الموظفين...');
    
    const tableBody = document.querySelector('#employees-table tbody');
    if (!tableBody) return;
    
    // مسح المحتوى الحالي
    tableBody.innerHTML = '';
    
    // التحقق من وجود موظفين
    if (employees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">لا يوجد موظفين مسجلين حاليًا</td></tr>';
        return;
    }
    
    // ترتيب الموظفين حسب الاسم
    const sortedEmployees = [...employees].sort((a, b) => a.name.localeCompare(b.name));
    
    // عرض الموظفين في الجدول
    sortedEmployees.forEach(employee => {
        const row = document.createElement('tr');
        
        // تحديد فئة الصف حسب حالة الموظف
        if (employee.status === 'inactive') {
            row.classList.add('inactive-row');
        }
        
        // تحويل الحالة إلى نص عربي
        let statusText = 'نشط';
        let statusClass = 'badge-success';
        
        if (employee.status === 'inactive') {
            statusText = 'غير نشط';
            statusClass = 'badge-danger';
        }
        
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>
                <div class="employee-info">
                    <div class="employee-avatar">${employee.name.charAt(0)}</div>
                    <div>
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-phone">${employee.phone}</div>
                    </div>
                </div>
            </td>
            <td>${employee.position}</td>
            <td>${formatDate(employee.hireDate)}</td>
            <td>${formatCurrency(employee.salary)}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="employee-actions">
                    <button class="employee-action-btn view-employee" data-id="${employee.id}" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="employee-action-btn edit-employee" data-id="${employee.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="employee-action-btn delete-employee" data-id="${employee.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="employee-action-btn record-salary" data-id="${employee.id}" title="تسجيل راتب">
                        <i class="fas fa-money-bill-wave"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-employee');
        const editButton = row.querySelector('.edit-employee');
        const deleteButton = row.querySelector('.delete-employee');
        const recordSalaryButton = row.querySelector('.record-salary');
        
        if (viewButton) {
            viewButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                showEmployeeDetails(employeeId);
            });
        }
        
        if (editButton) {
            editButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                editEmployee(employeeId);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                deleteEmployee(employeeId);
            });
        }
        
        if (recordSalaryButton) {
            recordSalaryButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                openSalaryModal(employeeId);
            });
        }
    });
}

/**
 * عرض جدول مدفوعات الرواتب
 */
function renderSalaryPaymentsTable() {
    console.log('عرض جدول مدفوعات الرواتب...');
    
    const tableBody = document.querySelector('#salary-payments-table tbody');
    if (!tableBody) return;
    
    // مسح المحتوى الحالي
    tableBody.innerHTML = '';
    
    // التحقق من وجود مدفوعات
    if (salaryPayments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا يوجد مدفوعات رواتب مسجلة حاليًا</td></tr>';
        return;
    }
    
    // الحصول على الشهر المحدد للتصفية
    const selectedMonth = document.getElementById('payment-month').value;
    const selectedStatus = document.getElementById('payment-status-filter').value;
    
    // تصفية المدفوعات حسب الشهر والحالة
    let filteredPayments = [...salaryPayments];
    
    if (selectedMonth) {
        filteredPayments = filteredPayments.filter(payment => payment.month === selectedMonth);
    }
    
    if (selectedStatus !== 'all') {
        filteredPayments = filteredPayments.filter(payment => payment.status === selectedStatus);
    }
    
    // ترتيب المدفوعات حسب التاريخ (الأحدث أولاً)
    filteredPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // التحقق من وجود مدفوعات بعد التصفية
    if (filteredPayments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا يوجد مدفوعات تطابق معايير البحث</td></tr>';
        return;
    }
    
    // عرض المدفوعات في الجدول
    filteredPayments.forEach(payment => {
        const row = document.createElement('tr');
        
        // البحث عن معلومات الموظف
        const employee = employees.find(emp => emp.id === payment.employeeId) || { name: 'غير محدد' };
        
        // تحديد حالة الدفع
        let statusText, statusClass;
        if (payment.status === 'paid') {
            statusText = 'مدفوع';
            statusClass = 'badge-success';
        } else {
            statusText = 'غير مدفوع';
            statusClass = 'badge-warning';
        }
        
        // حساب صافي الراتب
        const netSalary = payment.baseSalary + payment.allowances - payment.deductions;
        
        row.innerHTML = `
            <td>${payment.id}</td>
            <td>${employee.name}</td>
            <td>${formatMonth(payment.month)}</td>
            <td>${formatCurrency(payment.baseSalary)}</td>
            <td>${formatCurrency(payment.deductions)}</td>
            <td>${formatCurrency(payment.allowances)}</td>
            <td>${formatCurrency(netSalary)}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="payment-actions">
                    <button class="payment-action-btn view-payment" data-id="${payment.id}" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${payment.status === 'pending' ? `
                        <button class="payment-action-btn mark-as-paid" data-id="${payment.id}" title="تعيين كمدفوع">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="payment-action-btn delete-payment" data-id="${payment.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-payment');
        const markAsPaidButton = row.querySelector('.mark-as-paid');
        const deleteButton = row.querySelector('.delete-payment');
        
        if (viewButton) {
            viewButton.addEventListener('click', function() {
                const paymentId = this.getAttribute('data-id');
                showSalaryPaymentDetails(paymentId);
            });
        }
        
        if (markAsPaidButton) {
            markAsPaidButton.addEventListener('click', function() {
                const paymentId = this.getAttribute('data-id');
                markSalaryAsPaid(paymentId);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                const paymentId = this.getAttribute('data-id');
                deleteSalaryPayment(paymentId);
            });
        }
    });
}

/**
 * عرض جدول الاستقطاعات
 */
function renderDeductionsTable() {
    console.log('عرض جدول الاستقطاعات...');
    
    const tableBody = document.querySelector('#deductions-table tbody');
    if (!tableBody) return;
    
    // مسح المحتوى الحالي
    tableBody.innerHTML = '';
    
    // التحقق من وجود استقطاعات
    if (deductions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">لا يوجد استقطاعات مسجلة حاليًا</td></tr>';
        return;
    }
    
    // ترتيب الاستقطاعات حسب التاريخ (الأحدث أولاً)
    const sortedDeductions = [...deductions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // عرض الاستقطاعات في الجدول
    sortedDeductions.forEach(deduction => {
        const row = document.createElement('tr');
        
        // البحث عن معلومات الموظف
        const employee = employees.find(emp => emp.id === deduction.employeeId) || { name: 'غير محدد' };
        
        // تحويل نوع الاستقطاع إلى نص عربي
        let typeText;
        switch (deduction.type) {
            case 'absence':
                typeText = 'غياب';
                break;
            case 'late':
                typeText = 'تأخير';
                break;
            case 'tax':
                typeText = 'ضريبة';
                break;
            case 'insurance':
                typeText = 'تأمين';
                break;
            case 'loan':
                typeText = 'قرض';
                break;
            default:
                typeText = 'أخرى';
        }
        
        row.innerHTML = `
            <td>${deduction.id}</td>
            <td>${employee.name}</td>
            <td>${typeText}</td>
            <td>${formatCurrency(deduction.amount)}</td>
            <td>${formatDate(deduction.date)}</td>
            <td>${deduction.notes || '-'}</td>
            <td>
                <div class="deduction-actions">
                    <button class="deduction-action-btn edit-deduction" data-id="${deduction.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="deduction-action-btn delete-deduction" data-id="${deduction.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const editButton = row.querySelector('.edit-deduction');
        const deleteButton = row.querySelector('.delete-deduction');
        
        if (editButton) {
            editButton.addEventListener('click', function() {
                const deductionId = this.getAttribute('data-id');
                editDeduction(deductionId);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                const deductionId = this.getAttribute('data-id');
                deleteDeduction(deductionId);
            });
        }
    });
}

/**
 * إضافة موظف جديد
 */
function addNewEmployee() {
    console.log('إضافة موظف جديد...');
    
    // الحصول على البيانات من النموذج
    const name = document.getElementById('employee-name').value;
    const phone = document.getElementById('employee-phone').value;
    const position = document.getElementById('employee-position').value;
    const department = document.getElementById('employee-department').value;
    const hireDate = document.getElementById('employee-hire-date').value;
    const salary = parseFloat(document.getElementById('employee-salary').value);
    const email = document.getElementById('employee-email').value;
    const payday = parseInt(document.getElementById('employee-payday').value);
    const address = document.getElementById('employee-address').value;
    const status = document.getElementById('employee-status').value;
    const notes = document.getElementById('employee-notes').value;
    
    // التحقق من البيانات الإلزامية
    if (!name || !phone || !position || !department || !hireDate || !salary) {
        showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
        return;
    }
    
    // إنشاء كائن الموظف الجديد
    const newEmployee = {
        id: Date.now().toString(),
        name,
        phone,
        position,
        department,
        hireDate,
        salary,
        email: email || '',
        payday: payday || 1,
        address: address || '',
        status: status || 'active',
        notes: notes || '',
        createdAt: new Date().toISOString()
    };
    
    // إضافة الموظف إلى المصفوفة
    employees.push(newEmployee);
    
    // حفظ البيانات
    if (saveEmployeesData()) {
        // تحديث جدول الموظفين
        renderEmployeesTable();
        
        // إغلاق النافذة المنبثقة
        closeModal('add-employee-modal');
        
        showNotification(`تم إضافة الموظف ${name} بنجاح`, 'success');
    }
}

/**
 * عرض تفاصيل الموظف
 * @param {string} employeeId معرف الموظف
 */
function showEmployeeDetails(employeeId) {
    console.log(`عرض تفاصيل الموظف: ${employeeId}`);
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // إحضار تفاصيل الرواتب والاستقطاعات
    const employeeSalaries = salaryPayments.filter(payment => payment.employeeId === employeeId);
    const employeeDeductions = deductions.filter(deduction => deduction.employeeId === employeeId);
    
    // حساب إجمالي الرواتب المدفوعة
    const totalPaidSalaries = employeeSalaries
        .filter(payment => payment.status === 'paid')
        .reduce((total, payment) => total + payment.baseSalary + payment.allowances - payment.deductions, 0);
    
    // حساب إجمالي الاستقطاعات
    const totalDeductions = employeeDeductions.reduce((total, deduction) => total + deduction.amount, 0);
    
    // تحويل الحالة إلى نص عربي
    let statusText = 'نشط';
    let statusClass = 'badge-success';
    
    if (employee.status === 'inactive') {
        statusText = 'غير نشط';
        statusClass = 'badge-danger';
    }
    
    // بناء محتوى النافذة
    const detailsContent = document.getElementById('employee-details-content');
    
    // عرض معلومات الموظف
    detailsContent.innerHTML = `
        <div class="employee-profile">
            <div class="employee-avatar large">${employee.name.charAt(0)}</div>
            <div class="profile-details">
                <h2 class="employee-name">${employee.name}</h2>
                <div class="employee-position">${employee.position} - ${employee.department}</div>
                <span class="badge ${statusClass}">${statusText}</span>
            </div>
        </div>
        
        <div class="employee-statistics">
            <div class="stat-card">
                <div class="stat-title">الراتب الشهري</div>
                <div class="stat-value">${formatCurrency(employee.salary)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">فترة العمل</div>
                <div class="stat-value">${calculateEmploymentPeriod(employee.hireDate)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">إجمالي الرواتب المدفوعة</div>
                <div class="stat-value">${formatCurrency(totalPaidSalaries)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">إجمالي الاستقطاعات</div>
                <div class="stat-value">${formatCurrency(totalDeductions)}</div>
            </div>
        </div>
        
        <div class="employee-details-grid">
            <div class="detail-section">
                <h3 class="section-title">معلومات الاتصال</h3>
                <div class="detail-item">
                    <div class="detail-label">رقم الهاتف</div>
                    <div class="detail-value">${employee.phone}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">البريد الإلكتروني</div>
                    <div class="detail-value">${employee.email || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">العنوان</div>
                    <div class="detail-value">${employee.address || '-'}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3 class="section-title">معلومات الوظيفة</h3>
                <div class="detail-item">
                    <div class="detail-label">المسمى الوظيفي</div>
                    <div class="detail-value">${employee.position}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">القسم</div>
                    <div class="detail-value">${employee.department}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">تاريخ التعيين</div>
                    <div class="detail-value">${formatDate(employee.hireDate)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">يوم تسليم الراتب</div>
                    <div class="detail-value">${employee.payday || 1} من كل شهر</div>
                </div>
            </div>
        </div>
      <div class="employee-notes">
            <h3 class="section-title">ملاحظات</h3>
            <div class="notes-content">${employee.notes || 'لا توجد ملاحظات'}</div>
        </div>
        
        <!-- قسم آخر مدفوعات الرواتب -->
        <div class="employee-recent-salaries">
            <h3 class="section-title">آخر مدفوعات الرواتب</h3>
            ${employeeSalaries.length > 0 ? `
                <div class="table-container">
                    <table class="mini-table">
                        <thead>
                            <tr>
                                <th>الشهر</th>
                                <th>المبلغ الأساسي</th>
                                <th>العلاوات</th>
                                <th>الاستقطاعات</th>
                                <th>الصافي</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employeeSalaries.slice(0, 5).map(salary => {
                                const netAmount = salary.baseSalary + salary.allowances - salary.deductions;
                                let statusText = 'غير مدفوع';
                                let statusClass = 'badge-warning';
                                
                                if (salary.status === 'paid') {
                                    statusText = 'مدفوع';
                                    statusClass = 'badge-success';
                                }
                                
                                return `
                                    <tr>
                                        <td>${formatMonth(salary.month)}</td>
                                        <td>${formatCurrency(salary.baseSalary)}</td>
                                        <td>${formatCurrency(salary.allowances)}</td>
                                        <td>${formatCurrency(salary.deductions)}</td>
                                        <td>${formatCurrency(netAmount)}</td>
                                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<div class="no-data">لا توجد مدفوعات رواتب مسجلة</div>'}
        </div>
        
        <!-- قسم الاستقطاعات -->
        <div class="employee-recent-deductions">
            <h3 class="section-title">آخر الاستقطاعات</h3>
            ${employeeDeductions.length > 0 ? `
                <div class="table-container">
                    <table class="mini-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>نوع الاستقطاع</th>
                                <th>المبلغ</th>
                                <th>ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employeeDeductions.slice(0, 5).map(deduction => {
                                // تحويل نوع الاستقطاع إلى نص عربي
                                let typeText;
                                switch (deduction.type) {
                                    case 'absence':
                                        typeText = 'غياب';
                                        break;
                                    case 'late':
                                        typeText = 'تأخير';
                                        break;
                                    case 'tax':
                                        typeText = 'ضريبة';
                                        break;
                                    case 'insurance':
                                        typeText = 'تأمين';
                                        break;
                                    case 'loan':
                                        typeText = 'قرض';
                                        break;
                                    default:
                                        typeText = 'أخرى';
                                }
                                
                                return `
                                    <tr>
                                        <td>${formatDate(deduction.date)}</td>
                                        <td>${typeText}</td>
                                        <td>${formatCurrency(deduction.amount)}</td>
                                        <td>${deduction.notes || '-'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<div class="no-data">لا توجد استقطاعات مسجلة</div>'}
        </div>
    `;
    
    // تغيير عنوان النافذة
    const modalTitle = document.querySelector('#employee-details-modal .modal-title');
    if (modalTitle) {
        modalTitle.textContent = `تفاصيل الموظف - ${employee.name}`;
    }
    
    // إضافة مستمعي الأحداث للأزرار
    const editButton = document.getElementById('edit-employee-btn');
    const deleteButton = document.getElementById('delete-employee-btn');
    
    if (editButton) {
        editButton.onclick = function() {
            editEmployee(employeeId);
        };
    }
    
    if (deleteButton) {
        deleteButton.onclick = function() {
            deleteEmployee(employeeId);
            closeModal('employee-details-modal');
        };
    }
    
    // فتح النافذة
    openModal('employee-details-modal');
}

/**
 * تعديل بيانات الموظف
 * @param {string} employeeId معرف الموظف
 */
function editEmployee(employeeId) {
    console.log(`تعديل الموظف: ${employeeId}`);
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // إغلاق نافذة التفاصيل إذا كانت مفتوحة
    closeModal('employee-details-modal');
    
    // فتح نافذة الإضافة وملء البيانات
    openModal('add-employee-modal');
    
    // تغيير عنوان النافذة وزر الحفظ
    const modalTitle = document.querySelector('#add-employee-modal .modal-title');
    const saveButton = document.getElementById('save-employee-btn');
    
    if (modalTitle) {
        modalTitle.textContent = `تعديل بيانات الموظف - ${employee.name}`;
    }
    
    if (saveButton) {
        saveButton.textContent = 'حفظ التعديلات';
        
        // تغيير وظيفة زر الحفظ
        saveButton.onclick = function() {
            updateEmployee(employeeId);
        };
    }
    
    // ملء حقول النموذج
    document.getElementById('employee-name').value = employee.name;
    document.getElementById('employee-phone').value = employee.phone;
    document.getElementById('employee-position').value = employee.position;
    document.getElementById('employee-department').value = employee.department;
    document.getElementById('employee-hire-date').value = employee.hireDate;
    document.getElementById('employee-salary').value = employee.salary;
    document.getElementById('employee-email').value = employee.email || '';
    document.getElementById('employee-payday').value = employee.payday || 1;
    document.getElementById('employee-address').value = employee.address || '';
    document.getElementById('employee-status').value = employee.status;
    document.getElementById('employee-notes').value = employee.notes || '';
}

/**
 * تحديث بيانات الموظف
 * @param {string} employeeId معرف الموظف
 */
function updateEmployee(employeeId) {
    console.log(`تحديث بيانات الموظف: ${employeeId}`);
    
    // الحصول على البيانات المحدثة من النموذج
    const name = document.getElementById('employee-name').value;
    const phone = document.getElementById('employee-phone').value;
    const position = document.getElementById('employee-position').value;
    const department = document.getElementById('employee-department').value;
    const hireDate = document.getElementById('employee-hire-date').value;
    const salary = parseFloat(document.getElementById('employee-salary').value);
    const email = document.getElementById('employee-email').value;
    const payday = parseInt(document.getElementById('employee-payday').value);
    const address = document.getElementById('employee-address').value;
    const status = document.getElementById('employee-status').value;
    const notes = document.getElementById('employee-notes').value;
    
    // التحقق من البيانات الإلزامية
    if (!name || !phone || !position || !department || !hireDate || !salary) {
        showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
        return;
    }
    
    // البحث عن الموظف وتحديث بياناته
    const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
    if (employeeIndex === -1) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // تحديث بيانات الموظف مع الاحتفاظ بالبيانات الأخرى
    employees[employeeIndex] = {
        ...employees[employeeIndex],
        name,
        phone,
        position,
        department,
        hireDate,
        salary,
        email,
        payday,
        address,
        status,
        notes,
        updatedAt: new Date().toISOString()
    };
    
    // حفظ البيانات
    if (saveEmployeesData()) {
        // تحديث جدول الموظفين
        renderEmployeesTable();
        
        // إغلاق النافذة المنبثقة
        closeModal('add-employee-modal');
        
        // إعادة زر الحفظ إلى حالته الأصلية
        const saveButton = document.getElementById('save-employee-btn');
        if (saveButton) {
            saveButton.textContent = 'إضافة';
            saveButton.onclick = addNewEmployee;
        }
        
        // إعادة عنوان النافذة إلى الأصل
        const modalTitle = document.querySelector('#add-employee-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'إضافة موظف جديد';
        }
        
        showNotification(`تم تحديث بيانات الموظف ${name} بنجاح`, 'success');
    }
}

/**
 * حذف موظف
 * @param {string} employeeId معرف الموظف
 */
function deleteEmployee(employeeId) {
    console.log(`حذف الموظف: ${employeeId}`);
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // طلب تأكيد الحذف
    if (!confirm(`هل أنت متأكد من رغبتك في حذف الموظف ${employee.name}؟ سيتم حذف جميع بيانات الرواتب والاستقطاعات المرتبطة به.`)) {
        return;
    }
    
    // حذف الموظف من المصفوفة
    employees = employees.filter(emp => emp.id !== employeeId);
    
    // حذف جميع الرواتب والاستقطاعات المرتبطة بالموظف
    salaryPayments = salaryPayments.filter(payment => payment.employeeId !== employeeId);
    deductions = deductions.filter(deduction => deduction.employeeId !== employeeId);
    
    // حفظ البيانات
    if (saveEmployeesData()) {
        // تحديث جدول الموظفين
        renderEmployeesTable();
        
        showNotification(`تم حذف الموظف ${employee.name} وجميع البيانات المرتبطة به بنجاح`, 'success');
    }
}

/**
 * البحث في الموظفين
 * @param {string} query نص البحث
 */
function searchEmployees(query) {
    console.log(`البحث عن: ${query}`);
    
    const tableBody = document.querySelector('#employees-table tbody');
    if (!tableBody) return;
    
    // إذا كان البحث فارغا، نعرض جميع الموظفين
    if (!query) {
        renderEmployeesTable();
        return;
    }
    
    // مسح المحتوى الحالي
    tableBody.innerHTML = '';
    
    // البحث في المصفوفة
    const matchingEmployees = employees.filter(employee => {
        return (
            employee.name.toLowerCase().includes(query) ||
            employee.phone.includes(query) ||
            employee.position.toLowerCase().includes(query) ||
            employee.department.toLowerCase().includes(query) ||
            employee.email.toLowerCase().includes(query)
        );
    });
    
    // التحقق من وجود نتائج
    if (matchingEmployees.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center">لم يتم العثور على نتائج للبحث عن "${query}"</td></tr>`;
        return;
    }
    
    // عرض النتائج في الجدول
    matchingEmployees.forEach(employee => {
        const row = document.createElement('tr');
        
        // تحديد فئة الصف حسب حالة الموظف
        if (employee.status === 'inactive') {
            row.classList.add('inactive-row');
        }
        
        // تحويل الحالة إلى نص عربي
        let statusText = 'نشط';
        let statusClass = 'badge-success';
        
        if (employee.status === 'inactive') {
            statusText = 'غير نشط';
            statusClass = 'badge-danger';
        }
        
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>
                <div class="employee-info">
                    <div class="employee-avatar">${employee.name.charAt(0)}</div>
                    <div>
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-phone">${employee.phone}</div>
                    </div>
                </div>
            </td>
            <td>${employee.position}</td>
            <td>${formatDate(employee.hireDate)}</td>
            <td>${formatCurrency(employee.salary)}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="employee-actions">
                    <button class="employee-action-btn view-employee" data-id="${employee.id}" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="employee-action-btn edit-employee" data-id="${employee.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="employee-action-btn delete-employee" data-id="${employee.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="employee-action-btn record-salary" data-id="${employee.id}" title="تسجيل راتب">
                        <i class="fas fa-money-bill-wave"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-employee');
        const editButton = row.querySelector('.edit-employee');
        const deleteButton = row.querySelector('.delete-employee');
        const recordSalaryButton = row.querySelector('.record-salary');
        
        if (viewButton) {
            viewButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                showEmployeeDetails(employeeId);
            });
        }
        
        if (editButton) {
            editButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                editEmployee(employeeId);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                deleteEmployee(employeeId);
            });
        }
        
        if (recordSalaryButton) {
            recordSalaryButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                openSalaryModal(employeeId);
            });
        }
    });
}

/**
 * تصفية الموظفين حسب الحالة
 * @param {string} filter معيار التصفية (all, active, inactive)
 */
function filterEmployees(filter) {
    console.log(`تصفية الموظفين حسب: ${filter}`);
    
    const tableBody = document.querySelector('#employees-table tbody');
    if (!tableBody) return;
    
    // مسح المحتوى الحالي
    tableBody.innerHTML = '';
    
    // تصفية المصفوفة
    let filteredEmployees = [...employees];
    
    if (filter === 'active') {
        filteredEmployees = filteredEmployees.filter(emp => emp.status === 'active');
    } else if (filter === 'inactive') {
        filteredEmployees = filteredEmployees.filter(emp => emp.status === 'inactive');
    }
    
    // ترتيب الموظفين حسب الاسم
    filteredEmployees.sort((a, b) => a.name.localeCompare(b.name));
    
    // التحقق من وجود نتائج
    if (filteredEmployees.length === 0) {
        let message = 'لا يوجد موظفين مسجلين حاليًا';
        
        if (filter === 'active') {
            message = 'لا يوجد موظفين نشطين';
        } else if (filter === 'inactive') {
            message = 'لا يوجد موظفين غير نشطين';
        }
        
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center">${message}</td></tr>`;
        return;
    }
    
    // عرض النتائج في الجدول
    filteredEmployees.forEach(employee => {
        const row = document.createElement('tr');
        
        // تحديد فئة الصف حسب حالة الموظف
        if (employee.status === 'inactive') {
            row.classList.add('inactive-row');
        }
        
        // تحويل الحالة إلى نص عربي
        let statusText = 'نشط';
        let statusClass = 'badge-success';
        
        if (employee.status === 'inactive') {
            statusText = 'غير نشط';
            statusClass = 'badge-danger';
        }
        
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>
                <div class="employee-info">
                    <div class="employee-avatar">${employee.name.charAt(0)}</div>
                    <div>
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-phone">${employee.phone}</div>
                    </div>
                </div>
            </td>
            <td>${employee.position}</td>
            <td>${formatDate(employee.hireDate)}</td>
            <td>${formatCurrency(employee.salary)}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="employee-actions">
                    <button class="employee-action-btn view-employee" data-id="${employee.id}" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="employee-action-btn edit-employee" data-id="${employee.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="employee-action-btn delete-employee" data-id="${employee.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="employee-action-btn record-salary" data-id="${employee.id}" title="تسجيل راتب">
                        <i class="fas fa-money-bill-wave"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-employee');
        const editButton = row.querySelector('.edit-employee');
        const deleteButton = row.querySelector('.delete-employee');
        const recordSalaryButton = row.querySelector('.record-salary');
        
        if (viewButton) {
            viewButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                showEmployeeDetails(employeeId);
            });
        }
        
        if (editButton) {
            editButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                editEmployee(employeeId);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                deleteEmployee(employeeId);
            });
        }
        
        if (recordSalaryButton) {
            recordSalaryButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                openSalaryModal(employeeId);
            });
        }
    });
}

/**
 * فتح نافذة تسجيل الراتب
 * @param {string} employeeId معرف الموظف (اختياري)
 */
function openSalaryModal(employeeId = null) {
    console.log(`فتح نافذة تسجيل الراتب. الموظف: ${employeeId || 'غير محدد'}`);
    
    // فتح النافذة المنبثقة
    openModal('record-salary-modal');
    
    // ملء قائمة الموظفين
    populateEmployeeSelect('salary-employee');
    
    // إذا تم تحديد موظف، نحدده في القائمة
    if (employeeId) {
        const employeeSelect = document.getElementById('salary-employee');
        if (employeeSelect) {
            employeeSelect.value = employeeId;
            
            // تحديث تفاصيل الراتب
            updateSalaryDetails();
        }
    }
    
    // إخفاء تفاصيل الدفع
    const paymentDetails = document.getElementById('payment-details');
    if (paymentDetails) {
        paymentDetails.style.display = 'none';
    }
    
    // تعيين الشهر الحالي
    const salaryMonth = document.getElementById('salary-month');
    if (salaryMonth) {
        salaryMonth.value = getCurrentMonth();
    }
}

/**
 * ملء قائمة الموظفين
 * @param {string} selectId معرف عنصر القائمة
 */
function populateEmployeeSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // مسح القائمة
    select.innerHTML = '<option value="">اختر الموظف</option>';
    
    // ترتيب الموظفين حسب الاسم
    const sortedEmployees = [...employees]
        .filter(emp => emp.status === 'active') // عرض الموظفين النشطين فقط
        .sort((a, b) => a.name.localeCompare(b.name));
    
    // إضافة الموظفين للقائمة
    sortedEmployees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = `${employee.name} - ${employee.position}`;
        select.appendChild(option);
    });
}

/**
 * تحديث تفاصيل الراتب
 */
function updateSalaryDetails() {
    const employeeSelect = document.getElementById('salary-employee');
    const salaryAmount = document.getElementById('salary-amount');
    const salaryDeductions = document.getElementById('salary-deductions');
    const deductionsDetails = document.getElementById('deductions-details');
    
    if (!employeeSelect || !salaryAmount || !salaryDeductions || !deductionsDetails) return;
    
    const employeeId = employeeSelect.value;
    
    // إذا لم يتم اختيار موظف، نفرغ الحقول
    if (!employeeId) {
        salaryAmount.value = '';
        salaryDeductions.value = 0;
        deductionsDetails.textContent = '';
        updateNetSalary();
        return;
    }
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    // تعيين الراتب الأساسي
    salaryAmount.value = employee.salary;
    
    // حساب الاستقطاعات للشهر المحدد
    const salaryMonth = document.getElementById('salary-month').value;
    const [year, month] = salaryMonth.split('-');
    
    // حساب الفترة من بداية الشهر إلى نهايته
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0);
    
    // حساب الاستقطاعات للفترة المحددة
    const monthlyDeductions = deductions.filter(deduction => {
        const deductionDate = new Date(deduction.date);
        return (
            deduction.employeeId === employeeId &&
            deductionDate >= startDate &&
            deductionDate <= endDate
        );
    });
    
    // حساب إجمالي الاستقطاعات
    const totalDeductions = monthlyDeductions.reduce((total, deduction) => total + deduction.amount, 0);
    
    // تعيين قيمة الاستقطاعات
    salaryDeductions.value = totalDeductions;
    
    // عرض تفاصيل الاستقطاعات
    if (monthlyDeductions.length > 0) {
        const deductionsText = monthlyDeductions.map(deduction => {
            // تحويل نوع الاستقطاع إلى نص عربي
            let typeText;
            switch (deduction.type) {
                case 'absence':
                    typeText = 'غياب';
                    break;
                case 'late':
                    typeText = 'تأخير';
                    break;
                case 'tax':
                    typeText = 'ضريبة';
                    break;
                case 'insurance':
                    typeText = 'تأمين';
                    break;
                case 'loan':
                    typeText = 'قرض';
                    break;
                default:
                    typeText = 'أخرى';
            }
            
            return `${typeText}: ${formatCurrency(deduction.amount)}`;
        }).join(' | ');
        
        deductionsDetails.textContent = deductionsText;
    } else {
        deductionsDetails.textContent = 'لا توجد استقطاعات لهذا الشهر';
    }
    
    // تحديث صافي الراتب
    updateNetSalary();
}

/**
 * تحديث صافي الراتب
 */
function updateNetSalary() {
    const salaryAmount = document.getElementById('salary-amount');
    const salaryAllowances = document.getElementById('salary-allowances');
    const salaryDeductions = document.getElementById('salary-deductions');
    const salaryNet = document.getElementById('salary-net');
    
    if (!salaryAmount || !salaryAllowances || !salaryDeductions || !salaryNet) return;
    
    // حساب صافي الراتب
    const baseSalary = parseFloat(salaryAmount.value) || 0;
    const allowances = parseFloat(salaryAllowances.value) || 0;
    const deductionsAmount = parseFloat(salaryDeductions.value) || 0;
    
    const netSalary = baseSalary + allowances - deductionsAmount;
    
    // تعيين قيمة صافي الراتب
    salaryNet.value = netSalary;
}

/**
 * تسجيل دفع راتب
 */
function recordSalaryPayment() {
    console.log('تسجيل دفع راتب...');
    
    // الحصول على البيانات من النموذج
    const employeeId = document.getElementById('salary-employee').value;
    const month = document.getElementById('salary-month').value;
    const baseSalary = parseFloat(document.getElementById('salary-amount').value);
    const allowances = parseFloat(document.getElementById('salary-allowances').value) || 0;
    const deductionsAmount = parseFloat(document.getElementById('salary-deductions').value) || 0;
    const netSalary = parseFloat(document.getElementById('salary-net').value);
    const status = document.getElementById('salary-status').value;
    const notes = document.getElementById('salary-notes').value;
    
    // التحقق من البيانات الإلزامية
    if (!employeeId || !month || !baseSalary) {
        showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
        return;
    }
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // التحقق من عدم وجود راتب مسجل لنفس الشهر
    const existingSalary = salaryPayments.find(payment => 
        payment.employeeId === employeeId && payment.month === month
    );
    
    if (existingSalary) {
        showNotification(`هناك راتب مسجل بالفعل للموظف ${employee.name} لشهر ${formatMonth(month)}`, 'error');
        return;
    }
    
    // إنشاء معلومات الدفع إذا كانت الحالة "مدفوع"
    let paymentInfo = null;
    
    if (status === 'paid') {
        paymentInfo = {
            date: document.getElementById('payment-date').value,
            method: document.getElementById('payment-method').value,
            reference: document.getElementById('payment-reference').value || ''
        };
    }
    
    // إنشاء كائن دفعة الراتب
    const salaryPayment = {
        id: Date.now().toString(),
        employeeId,
        month,
        baseSalary,
        allowances,
        deductions: deductionsAmount,
        status,
        notes: notes || '',
        paymentInfo,
        createdAt: new Date().toISOString()
    };
    
    // إضافة دفعة الراتب إلى المصفوفة
    salaryPayments.push(salaryPayment);
    
    // حفظ البيانات
    if (saveEmployeesData()) {
        // تحديث جدول مدفوعات الرواتب
        renderSalaryPaymentsTable();
        
        // إغلاق النافذة المنبثقة
        closeModal('record-salary-modal');
        
        showNotification(`تم تسجيل راتب ${formatMonth(month)} للموظف ${employee.name} بنجاح`, 'success');
    }
}

/**
 * عرض تفاصيل دفعة الراتب
 * @param {string} paymentId معرف دفعة الراتب
 */
function showSalaryPaymentDetails(paymentId) {
    console.log(`عرض تفاصيل دفعة الراتب: ${paymentId}`);
    
    // البحث عن دفعة الراتب
    const payment = salaryPayments.find(p => p.id === paymentId);
    if (!payment) {
        showNotification('لم يتم العثور على دفعة الراتب', 'error');
        return;
    }
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === payment.employeeId) || { name: 'غير محدد' };
    
    // حساب صافي الراتب
    const netSalary = payment.baseSalary + payment.allowances - payment.deductions;
    
    // تحديد حالة الدفع
    let statusText, statusClass;
    if (payment.status === 'paid') {
        statusText = 'مدفوع';
        statusClass = 'badge-success';
    } else {
        statusText = 'غير مدفوع';
        statusClass = 'badge-warning';
    }
    
    // بناء محتوى النافذة
    const detailsContent = document.getElementById('salary-details-content');
    
    detailsContent.innerHTML = `
        <div class="salary-header">
            <div class="salary-month">${formatMonth(payment.month)}</div>
            <div class="salary-status"><span class="badge ${statusClass}">${statusText}</span></div>
        </div>
        
        <div class="employee-profile">
            <div class="employee-avatar">${employee.name.charAt(0)}</div>
            <div class="profile-details">
                <h2 class="employee-name">${employee.name}</h2>
                <div class="employee-position">${employee.position || ''}</div>
            </div>
        </div>
        
        <div class="salary-details">
            <div class="detail-item">
                <div class="detail-label">الراتب الأساسي</div>
                <div class="detail-value">${formatCurrency(payment.baseSalary)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">العلاوات</div>
                <div class="detail-value">${formatCurrency(payment.allowances)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">الاستقطاعات</div>
                <div class="detail-value">${formatCurrency(payment.deductions)}</div>
            </div>
            <div class="detail-item total">
                <div class="detail-label">صافي الراتب</div>
                <div class="detail-value">${formatCurrency(netSalary)}</div>
            </div>
        </div>
        
        ${payment.paymentInfo ? `
            <div class="payment-details">
                <h3 class="section-title">معلومات الدفع</h3>
                <div class="detail-item">
                    <div class="detail-label">تاريخ الدفع</div>
                    <div class="detail-value">${formatDate(payment.paymentInfo.date)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">طريقة الدفع</div>
                    <div class="detail-value">${getPaymentMethodText(payment.paymentInfo.method)}</div>
                </div>
                ${payment.paymentInfo.reference ? `
                    <div class="detail-item">
                        <div class="detail-label">رقم المرجع</div>
                        <div class="detail-value">${payment.paymentInfo.reference}</div>
                    </div>
                ` : ''}
            </div>
        ` : ''}
        
        ${payment.notes ? `
            <div class="salary-notes">
                <h3 class="section-title">ملاحظات</h3>
                <div class="notes-content">${payment.notes}</div>
            </div>
        ` : ''}
    `;
    
    // تغيير عنوان النافذة
    const modalTitle = document.querySelector('#salary-details-modal .modal-title');
    if (modalTitle) {
        modalTitle.textContent = `تفاصيل راتب ${formatMonth(payment.month)} - ${employee.name}`;
    }
    
    // إخفاء أو إظهار زر تعيين كمدفوع حسب الحالة
    const markAsPaidBtn = document.getElementById('mark-as-paid-btn');
    if (markAsPaidBtn) {
        markAsPaidBtn.style.display = payment.status === 'pending' ? 'block' : 'none';
        
        markAsPaidBtn.onclick = function() {
            markSalaryAsPaid(payment.id);
            closeModal('salary-details-modal');
        };
    }
    
    // إضافة مستمع حدث لزر الطباعة
    const printSalaryBtn = document.getElementById('print-salary-btn');
    if (printSalaryBtn) {
        printSalaryBtn.onclick = function() {
            printSalaryReceipt(payment.id);
        };
    }
    
    // فتح النافذة
    openModal('salary-details-modal');
}

/**
 * تعيين راتب كمدفوع
 * @param {string} paymentId معرف دفعة الراتب
 */
function markSalaryAsPaid(paymentId) {
    console.log(`تعيين راتب كمدفوع: ${paymentId}`);
    
    // البحث عن دفعة الراتب
    const paymentIndex = salaryPayments.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) {
        showNotification('لم يتم العثور على دفعة الراتب', 'error');
        return;
    }
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === salaryPayments[paymentIndex].employeeId) || { name: 'غير محدد' };
    
    // إنشاء نافذة تأكيد الدفع
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal-overlay';
    confirmModal.id = 'confirm-payment-modal';
    
    confirmModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">تأكيد دفع الراتب</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <p>أنت على وشك تعيين راتب ${formatMonth(salaryPayments[paymentIndex].month)} للموظف ${employee.name} كمدفوع.</p>
                
                <form id="confirm-payment-form">
                    <div class="form-group">
                        <label class="form-label">تاريخ الدفع</label>
                        <input class="form-input" id="confirm-payment-date" type="date" value="${getCurrentDate()}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">طريقة الدفع</label>
                        <select class="form-select" id="confirm-payment-method" required>
                            <option value="cash">نقدي</option>
                            <option value="bank">تحويل بنكي</option>
                            <option value="cheque">شيك</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">رقم المرجع (اختياري)</label>
                        <input class="form-input" id="confirm-payment-reference" type="text" />
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-success" id="confirm-payment-btn">تأكيد الدفع</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(confirmModal);
    
    // إضافة مستمعي الأحداث للأزرار
    const closeButtons = confirmModal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            document.body.removeChild(confirmModal);
        });
    });
    
    const confirmPaymentBtn = confirmModal.querySelector('#confirm-payment-btn');
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', function() {
            // الحصول على بيانات الدفع
            const paymentDate = document.getElementById('confirm-payment-date').value;
            const paymentMethod = document.getElementById('confirm-payment-method').value;
            const paymentReference = document.getElementById('confirm-payment-reference').value;
            
            // التحقق من البيانات الإلزامية
            if (!paymentDate || !paymentMethod) {
                showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
                return;
            }
            
            // تحديث حالة دفعة الراتب
            salaryPayments[paymentIndex].status = 'paid';
            salaryPayments[paymentIndex].paymentInfo = {
                date: paymentDate,
                method: paymentMethod,
                reference: paymentReference || ''
            };
            salaryPayments[paymentIndex].updatedAt = new Date().toISOString();
            
            // حفظ البيانات
            if (saveEmployeesData()) {
                // تحديث جدول مدفوعات الرواتب
                renderSalaryPaymentsTable();
                
                // إغلاق النافذة
                document.body.removeChild(confirmModal);
                
                showNotification(`تم تعيين راتب ${formatMonth(salaryPayments[paymentIndex].month)} للموظف ${employee.name} كمدفوع بنجاح`, 'success');
            }
        });
    }
}

/**
 * حذف دفعة راتب
 * @param {string} paymentId معرف دفعة الراتب
 */
function deleteSalaryPayment(paymentId) {
    console.log(`حذف دفعة راتب: ${paymentId}`);
    
    // البحث عن دفعة الراتب
    const payment = salaryPayments.find(p => p.id === paymentId);
    if (!payment) {
        showNotification('لم يتم العثور على دفعة الراتب', 'error');
        return;
    }
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === payment.employeeId) || { name: 'غير محدد' };
    
    // طلب تأكيد الحذف
    if (!confirm(`هل أنت متأكد من رغبتك في حذف راتب ${formatMonth(payment.month)} للموظف ${employee.name}؟`)) {
        return;
    }
    
    // حذف دفعة الراتب من المصفوفة
    salaryPayments = salaryPayments.filter(p => p.id !== paymentId);
    
    // حفظ البيانات
    if (saveEmployeesData()) {
        // تحديث جدول مدفوعات الرواتب
        renderSalaryPaymentsTable();
        
        showNotification(`تم حذف راتب ${formatMonth(payment.month)} للموظف ${employee.name} بنجاح`, 'success');
    }
}

/**
 * إضافة استقطاع جديد
 */
function addNewDeduction() {
    console.log('إضافة استقطاع جديد...');
    
    // الحصول على البيانات من النموذج
    const employeeId = document.getElementById('deduction-employee').value;
    const type = document.getElementById('deduction-type').value;
    const amount = parseFloat(document.getElementById('deduction-amount').value);
    const date = document.getElementById('deduction-date').value;
    const notes = document.getElementById('deduction-notes').value;
    
    // التحقق من البيانات الإلزامية
    if (!employeeId || !type || !amount || !date) {
        showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
        return;
    }
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // إنشاء كائن الاستقطاع الجديد
    const newDeduction = {
        id: Date.now().toString(),
        employeeId,
        type,
        amount,
        date,
        notes: notes || '',
        createdAt: new Date().toISOString()
    };
    
    // إضافة الاستقطاع إلى المصفوفة
    deductions.push(newDeduction);
    
    // حفظ البيانات
    if (saveEmployeesData()) {
        // تحديث جدول الاستقطاعات
        renderDeductionsTable();
        
        // إغلاق النافذة المنبثقة
        closeModal('add-deduction-modal');
        
        showNotification(`تم إضافة استقطاع جديد للموظف ${employee.name} بنجاح`, 'success');
    }
}

/**
 * تعديل استقطاع
 * @param {string} deductionId معرف الاستقطاع
 */
function editDeduction(deductionId) {
    console.log(`تعديل استقطاع: ${deductionId}`);
    
    // البحث عن الاستقطاع
    const deduction = deductions.find(d => d.id === deductionId);
    if (!deduction) {
        showNotification('لم يتم العثور على الاستقطاع', 'error');
        return;
    }
    
    // فتح نافذة الإضافة
    openModal('add-deduction-modal');
    
    // تغيير عنوان النافذة وزر الحفظ
    const modalTitle = document.querySelector('#add-deduction-modal .modal-title');
    const saveButton = document.getElementById('save-deduction-btn');
    
    if (modalTitle) {
        modalTitle.textContent = 'تعديل استقطاع';
    }
    
    if (saveButton) {
        saveButton.textContent = 'حفظ التعديلات';
        
        // تغيير وظيفة زر الحفظ
        saveButton.onclick = function() {
            updateDeduction(deductionId);
        };
    }
    
    // ملء قائمة الموظفين
    populateEmployeeSelect('deduction-employee');
    
    // ملء حقول النموذج
    document.getElementById('deduction-employee').value = deduction.employeeId;
    document.getElementById('deduction-type').value = deduction.type;
    document.getElementById('deduction-amount').value = deduction.amount;
    document.getElementById('deduction-date').value = deduction.date;
    document.getElementById('deduction-notes').value = deduction.notes || '';
}

/**
 * تحديث استقطاع
 * @param {string} deductionId معرف الاستقطاع
 */
function updateDeduction(deductionId) {
    console.log(`تحديث استقطاع: ${deductionId}`);
    
    // الحصول على البيانات المحدثة من النموذج
    const employeeId = document.getElementById('deduction-employee').value;
    const type = document.getElementById('deduction-type').value;
    const amount = parseFloat(document.getElementById('deduction-amount').value);
    const date = document.getElementById('deduction-date').value;
    const notes = document.getElementById('deduction-notes').value;
    
    // التحقق من البيانات الإلزامية
    if (!employeeId || !type || !amount || !date) {
        showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
        return;
    }
    
    // البحث عن الاستقطاع وتحديث بياناته
    const deductionIndex = deductions.findIndex(d => d.id === deductionId);
    if (deductionIndex === -1) {
        showNotification('لم يتم العثور على الاستقطاع', 'error');
        return;
    }
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // تحديث بيانات الاستقطاع
    deductions[deductionIndex] = {
        ...deductions[deductionIndex],
        employeeId,
        type,
        amount,
        date,
        notes: notes || '',
        updatedAt: new Date().toISOString()
    };
    
    // حفظ البيانات
    if (saveEmployeesData()) {
        // تحديث جدول الاستقطاعات
        renderDeductionsTable();
        
        // إغلاق النافذة المنبثقة
        closeModal('add-deduction-modal');
        
        // إعادة زر الحفظ إلى حالته الأصلية
        const saveButton = document.getElementById('save-deduction-btn');
        if (saveButton) {
            saveButton.textContent = 'إضافة';
            saveButton.onclick = addNewDeduction;
        }
        
        // إعادة عنوان النافذة إلى الأصل
        const modalTitle = document.querySelector('#add-deduction-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'إضافة استقطاع';
        }
        
        showNotification(`تم تحديث الاستقطاع للموظف ${employee.name} بنجاح`, 'success');
    }
}

/**
 * حذف استقطاع
 * @param {string} deductionId معرف الاستقطاع
 */
function deleteDeduction(deductionId) {
    console.log(`حذف استقطاع: ${deductionId}`);
    
    // البحث عن الاستقطاع
    const deduction = deductions.find(d => d.id === deductionId);
    if (!deduction) {
        showNotification('لم يتم العثور على الاستقطاع', 'error');
        return;
    }
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === deduction.employeeId) || { name: 'غير محدد' };
    
    // طلب تأكيد الحذف
    if (!confirm(`هل أنت متأكد من رغبتك في حذف هذا الاستقطاع للموظف ${employee.name}؟`)) {
        return;
    }
    
    // حذف الاستقطاع من المصفوفة
    deductions = deductions.filter(d => d.id !== deductionId);
    
    // حفظ البيانات
    if (saveEmployeesData()) {
        // تحديث جدول الاستقطاعات
        renderDeductionsTable();
        
        showNotification(`تم حذف الاستقطاع للموظف ${employee.name} بنجاح`, 'success');
    }
}

/**
 * تحديث بيانات التقرير
 */
function updateReportData() {
    console.log('تحديث بيانات التقرير...');
    
    // الحصول على الفترة المحددة
    const reportPeriod = document.getElementById('report-period').value;
    
    // إذا لم يتم تحديد فترة، نستخدم الشهر الحالي
    if (!reportPeriod) {
        document.getElementById('report-period').value = getCurrentMonth();
        updateReportData();
        return;
    }
    
    // الحصول على نوع التقرير النشط
    const activeReportButton = document.querySelector('#reports-tab .btn-group .btn.active');
    const reportType = activeReportButton ? activeReportButton.getAttribute('data-report') : 'monthly';
    
    // تحديد الفترة حسب نوع التقرير
    let startDate, endDate;
    const [year, month] = reportPeriod.split('-');
    
    if (reportType === 'monthly') {
        // تقرير شهري
        startDate = new Date(year, parseInt(month) - 1, 1);
        endDate = new Date(year, parseInt(month), 0);
    } else if (reportType === 'quarterly') {
        // تقرير ربعي
        const quarter = Math.ceil(parseInt(month) / 3);
        const quarterStartMonth = (quarter - 1) * 3;
        startDate = new Date(year, quarterStartMonth, 1);
        endDate = new Date(year, quarterStartMonth + 3, 0);
    } else if (reportType === 'yearly') {
        // تقرير سنوي
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 12, 0);
    }
    
    // تصفية مدفوعات الرواتب حسب الفترة
    const filteredPayments = salaryPayments.filter(payment => {
        const paymentDate = new Date(payment.month);
        return paymentDate >= startDate && paymentDate <= endDate;
    });
    
    // حساب إجمالي الرواتب الأساسية
    const totalSalaries = filteredPayments.reduce((total, payment) => total + payment.baseSalary, 0);
    
    // حساب إجمالي العلاوات
    const totalAllowances = filteredPayments.reduce((total, payment) => total + payment.allowances, 0);
    
    // حساب إجمالي الاستقطاعات
    const totalDeductions = filteredPayments.reduce((total, payment) => total + payment.deductions, 0);
    
    // حساب صافي المدفوعات
    const netPayments = totalSalaries + totalAllowances - totalDeductions;
    
    // تحديث ملخص التقرير
    document.getElementById('total-salaries').textContent = formatCurrency(totalSalaries);
    document.getElementById('total-allowances').textContent = formatCurrency(totalAllowances);
    document.getElementById('total-deductions').textContent = formatCurrency(totalDeductions);
    document.getElementById('total-payments').textContent = formatCurrency(netPayments);
    
    // تحديث الرسوم البيانية
    updateSalaryChart(filteredPayments, reportType);
}

/**
 * تحديث الرسم البياني للرواتب
 * @param {Array} payments مدفوعات الرواتب
 * @param {string} reportType نوع التقرير
 */
function updateSalaryChart(payments, reportType) {
    console.log(`تحديث الرسم البياني للرواتب. نوع التقرير: ${reportType}`);
    
    // الحصول على عنصر الرسم البياني
    const chartCanvas = document.getElementById('salaries-chart');
    
    // إذا كانت هناك رسوم بيانية سابقة، نقوم بتدميرها
    if (window.salaryChart) {
        window.salaryChart.destroy();
    }
    
    // إذا لم تكن هناك مدفوعات، نعرض رسالة
    if (payments.length === 0) {
        chartCanvas.style.display = 'none';
        return;
    }
    
    chartCanvas.style.display = 'block';
    
    // تجميع البيانات حسب نوع التقرير
    let chartData;
    
    if (reportType === 'monthly') {
        // تجميع البيانات حسب اليوم
        chartData = groupPaymentsByDay(payments);
    } else if (reportType === 'quarterly') {
        // تجميع البيانات حسب الشهر
        chartData = groupPaymentsByMonth(payments);
    } else if (reportType === 'yearly') {
        // تجميع البيانات حسب الربع
        chartData = groupPaymentsByQuarter(payments);
    }
    
    // إنشاء الرسم البياني
    window.salaryChart = new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'الرواتب الأساسية',
                    data: chartData.baseSalaries,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)'
                },
                {
                    label: 'العلاوات',
                    data: chartData.allowances,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)'
                },
                {
                    label: 'الاستقطاعات',
                    data: chartData.deductions,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * تجميع المدفوعات حسب اليوم
 * @param {Array} payments مدفوعات الرواتب
 * @returns {Object} البيانات المجمعة
 */
function groupPaymentsByDay(payments) {
    const groupedData = {
        labels: [],
        baseSalaries: [],
        allowances: [],
        deductions: []
    };
    
    // تجميع المدفوعات حسب اليوم
    const groups = {};
    
    payments.forEach(payment => {
        const paymentDate = new Date(payment.createdAt);
        const day = paymentDate.getDate();
        
        if (!groups[day]) {
            groups[day] = {
                baseSalary: 0,
                allowances: 0,
                deductions: 0
            };
        }
        
        groups[day].baseSalary += payment.baseSalary;
        groups[day].allowances += payment.allowances;
        groups[day].deductions += payment.deductions;
    });
    
    // ترتيب المجموعات حسب اليوم
    const sortedDays = Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b));
    
    // إضافة البيانات إلى الكائن
    sortedDays.forEach(day => {
        groupedData.labels.push(`اليوم ${day}`);
        groupedData.baseSalaries.push(groups[day].baseSalary);
        groupedData.allowances.push(groups[day].allowances);
        groupedData.deductions.push(groups[day].deductions);
    });
    
    return groupedData;
}

/**
 * تجميع المدفوعات حسب الشهر
 * @param {Array} payments مدفوعات الرواتب
 * @returns {Object} البيانات المجمعة
 */
function groupPaymentsByMonth(payments) {
    const groupedData = {
        labels: [],
        baseSalaries: [],
        allowances: [],
        deductions: []
    };
    
    // تجميع المدفوعات حسب الشهر
    const groups = {};
    
    payments.forEach(payment => {
        const [year, month] = payment.month.split('-');
        const monthIndex = parseInt(month) - 1;
        const monthName = getMonthName(monthIndex);
        
        if (!groups[monthName]) {
            groups[monthName] = {
                baseSalary: 0,
                allowances: 0,
                deductions: 0,
                index: monthIndex
            };
        }
        
        groups[monthName].baseSalary += payment.baseSalary;
        groups[monthName].allowances += payment.allowances;
        groups[monthName].deductions += payment.deductions;
    });
    
    // ترتيب المجموعات حسب الشهر
    const sortedMonths = Object.keys(groups).sort((a, b) => groups[a].index - groups[b].index);
    
    // إضافة البيانات إلى الكائن
    sortedMonths.forEach(month => {
        groupedData.labels.push(month);
        groupedData.baseSalaries.push(groups[month].baseSalary);
        groupedData.allowances.push(groups[month].allowances);
        groupedData.deductions.push(groups[month].deductions);
    });
    
    return groupedData;
}

/**
 * تجميع المدفوعات حسب الربع
 * @param {Array} payments مدفوعات الرواتب
 * @returns {Object} البيانات المجمعة
 */
function groupPaymentsByQuarter(payments) {
    const groupedData = {
        labels: [],
        baseSalaries: [],
        allowances: [],
        deductions: []
    };
    
    // تجميع المدفوعات حسب الربع
    const groups = {
        'الربع الأول': { baseSalary: 0, allowances: 0, deductions: 0 },
        'الربع الثاني': { baseSalary: 0, allowances: 0, deductions: 0 },
        'الربع الثالث': { baseSalary: 0, allowances: 0, deductions: 0 },
        'الربع الرابع': { baseSalary: 0, allowances: 0, deductions: 0 }
    };
    
    payments.forEach(payment => {
        const [year, month] = payment.month.split('-');
        const monthIndex = parseInt(month) - 1;
        const quarter = Math.floor(monthIndex / 3);
        
        let quarterName;
        switch (quarter) {
            case 0:
                quarterName = 'الربع الأول';
                break;
            case 1:
                quarterName = 'الربع الثاني';
                break;
            case 2:
                quarterName = 'الربع الثالث';
                break;
            case 3:
                quarterName = 'الربع الرابع';
                break;
        }
        
        groups[quarterName].baseSalary += payment.baseSalary;
        groups[quarterName].allowances += payment.allowances;
        groups[quarterName].deductions += payment.deductions;
    });
    
    // إضافة البيانات إلى الكائن
    Object.keys(groups).forEach(quarter => {
        if (groups[quarter].baseSalary > 0 || groups[quarter].allowances > 0 || groups[quarter].deductions > 0) {
            groupedData.labels.push(quarter);
            groupedData.baseSalaries.push(groups[quarter].baseSalary);
            groupedData.allowances.push(groups[quarter].allowances);
            groupedData.deductions.push(groups[quarter].deductions);
        }
    });
    
    return groupedData;
}

/**
 * إنشاء تقرير
 */
function generateReport() {
    console.log('إنشاء تقرير...');
    
    // تحديث بيانات التقرير
    updateReportData();
    
    // عرض رسالة نجاح
    showNotification('تم إنشاء التقرير بنجاح', 'success');
}

/**
 * طباعة التقرير
 */
function printReport() {
    console.log('طباعة التقرير...');
    
    // إنشاء نسخة مطبوعة من التقرير
    const reportPeriod = document.getElementById('report-period').value;
    const [year, month] = reportPeriod.split('-');
    
    // تحديد عنوان التقرير حسب نوع التقرير
    const activeReportButton = document.querySelector('#reports-tab .btn-group .btn.active');
    const reportType = activeReportButton ? activeReportButton.getAttribute('data-report') : 'monthly';
    
    let periodTitle;
    
    if (reportType === 'monthly') {
        periodTitle = `${getMonthName(parseInt(month) - 1)} ${year}`;
    } else if (reportType === 'quarterly') {
        const quarter = Math.ceil(parseInt(month) / 3);
        periodTitle = `الربع ${getQuarterName(quarter)} ${year}`;
    } else if (reportType === 'yearly') {
        periodTitle = `سنة ${year}`;
    }
    
    // الحصول على بيانات الملخص
    const totalSalaries = document.getElementById('total-salaries').textContent;
    const totalAllowances = document.getElementById('total-allowances').textContent;
    const totalDeductions = document.getElementById('total-deductions').textContent;
    const netPayments = document.getElementById('net-payments').textContent;
    
    // إنشاء محتوى الطباعة
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>تقرير الرواتب - ${periodTitle}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    direction: rtl;
                }
                .report-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .report-title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .report-period {
                    font-size: 18px;
                    color: #555;
                }
                .report-summary {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                }
                .summary-card {
                    flex: 1;
                    border: 1px solid #ddd;
                    padding: 15px;
                    margin: 0 10px;
                    border-radius: 5px;
                }
                .summary-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .summary-value {
                    font-size: 18px;
                    color: #333;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px 12px;
                    text-align: right;
                }
                th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #777;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="report-header">
                <div class="report-title">تقرير الرواتب</div>
                <div class="report-period">${periodTitle}</div>
            </div>
            
            <div class="report-summary">
                <div class="summary-card">
                    <div class="summary-title">إجمالي الرواتب</div>
                    <div class="summary-value">${totalSalaries}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-title">إجمالي العلاوات</div>
                    <div class="summary-value">${totalAllowances}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-title">إجمالي الاستقطاعات</div>
                    <div class="summary-value">${totalDeductions}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-title">صافي المدفوعات</div>
                    <div class="summary-value">${netPayments}</div>
                </div>
            </div>
            
            <h2>تفاصيل مدفوعات الرواتب</h2>
            <table>
                <thead>
                    <tr>
                        <th>الموظف</th>
                        <th>الشهر</th>
                        <th>الراتب الأساسي</th>
                        <th>العلاوات</th>
                        <th>الاستقطاعات</th>
                        <th>الصافي</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateReportTableRows(reportPeriod, reportType)}
                </tbody>
            </table>
            
            <div class="footer">
                <p>تم إنشاء هذا التقرير بواسطة نظام الاستثمار المتكامل - وحدة إدارة الموظفين</p>
                <p>تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-EG')}</p>
            </div>
            
            <button onclick="window.print();" style="margin-top: 20px; padding: 10px 20px;">طباعة التقرير</button>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

/**
 * إنشاء صفوف جدول التقرير
 * @param {string} reportPeriod فترة التقرير
 * @param {string} reportType نوع التقرير
 * @returns {string} صفوف الجدول
 */
function generateReportTableRows(reportPeriod, reportType) {
    // تحديد الفترة حسب نوع التقرير
    let startDate, endDate;
    const [year, month] = reportPeriod.split('-');
    
    if (reportType === 'monthly') {
        // تقرير شهري
        startDate = new Date(year, parseInt(month) - 1, 1);
        endDate = new Date(year, parseInt(month), 0);
    } else if (reportType === 'quarterly') {
        // تقرير ربعي
        const quarter = Math.ceil(parseInt(month) / 3);
        const quarterStartMonth = (quarter - 1) * 3;
        startDate = new Date(year, quarterStartMonth, 1);
        endDate = new Date(year, quarterStartMonth + 3, 0);
    } else if (reportType === 'yearly') {
        // تقرير سنوي
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 12, 0);
    }
    
    // تصفية مدفوعات الرواتب حسب الفترة
    const filteredPayments = salaryPayments.filter(payment => {
        const paymentDate = new Date(payment.month);
        return paymentDate >= startDate && paymentDate <= endDate;
    });
    
    // ترتيب المدفوعات حسب الموظف والتاريخ
    filteredPayments.sort((a, b) => {
        const employeeA = employees.find(emp => emp.id === a.employeeId)?.name || '';
        const employeeB = employees.find(emp => emp.id === b.employeeId)?.name || '';
        
        if (employeeA !== employeeB) {
            return employeeA.localeCompare(employeeB);
        }
        
        return new Date(a.month) - new Date(b.month);
    });
    
    // إنشاء صفوف الجدول
    return filteredPayments.map(payment => {
        const employee = employees.find(emp => emp.id === payment.employeeId) || { name: 'غير محدد' };
        const netSalary = payment.baseSalary + payment.allowances - payment.deductions;
        
        let statusText = payment.status === 'paid' ? 'مدفوع' : 'غير مدفوع';
        
        return `
            <tr>
                <td>${employee.name}</td>
                <td>${formatMonth(payment.month)}</td>
                <td>${formatCurrency(payment.baseSalary)}</td>
                <td>${formatCurrency(payment.allowances)}</td>
                <td>${formatCurrency(payment.deductions)}</td>
                <td>${formatCurrency(netSalary)}</td>
                <td>${statusText}</td>
            </tr>
        `;
    }).join('');
}

/**
 * طباعة إيصال الراتب
 * @param {string} paymentId معرف دفعة الراتب
 */
function printSalaryReceipt(paymentId) {
    console.log(`طباعة إيصال الراتب: ${paymentId}`);
    
    // البحث عن دفعة الراتب
    const payment = salaryPayments.find(p => p.id === paymentId);
    if (!payment) {
        showNotification('لم يتم العثور على دفعة الراتب', 'error');
        return;
    }
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === payment.employeeId) || { name: 'غير محدد', position: 'غير محدد' };
    
    // حساب صافي الراتب
    const netSalary = payment.baseSalary + payment.allowances - payment.deductions;
    
    // تحويل الرقم إلى كلمات
    const netSalaryInWords = numberToArabicWords(netSalary);
    
    // إنشاء طباعة الإيصال
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>إيصال راتب - ${employee.name}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    direction: rtl;
                }
                .receipt {
                    max-width: 800px;
                    margin: 0 auto;
                    border: 1px solid #333;
                    padding: 20px;
                }
                .receipt-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #333;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .receipt-title {
                    font-size: 18px;
                    margin-top: 10px;
                }
                .receipt-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .receipt-info-item {
                    margin-bottom: 10px;
                }
                .receipt-info-label {
                    font-weight: bold;
                    margin-left: 10px;
                }
                .employee-info {
                    margin-bottom: 30px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: right;
                }
                th {
                    background-color: #f5f5f5;
                }
                .total-row {
                    font-weight: bold;
                }
                .amount-in-words {
                    margin: 20px 0;
                    padding: 10px;
                    border: 1px solid #ddd;
                    background-color: #f9f9f9;
                }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 50px;
                }
                .signature {
                    width: 40%;
                }
                .signature-line {
                    border-top: 1px solid #333;
                    margin-top: 50px;
                    padding-top: 10px;
                    text-align: center;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #777;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="receipt-header">
                    <div class="company-name">نظام الاستثمار المتكامل</div>
                    <div class="receipt-title">إيصال صرف راتب</div>
                </div>
                
                <div class="receipt-info">
                    <div>
                        <div class="receipt-info-item">
                            <span class="receipt-info-label">رقم الإيصال:</span>
                            <span>${payment.id}</span>
                        </div>
                        <div class="receipt-info-item">
                            <span class="receipt-info-label">التاريخ:</span>
                            <span>${formatDate(payment.paymentInfo?.date || new Date().toISOString().split('T')[0])}</span>
                        </div>
                    </div>
                    <div>
                        <div class="receipt-info-item">
                            <span class="receipt-info-label">الشهر:</span>
                            <span>${formatMonth(payment.month)}</span>
                        </div>
                        <div class="receipt-info-item">
                            <span class="receipt-info-label">الحالة:</span>
                            <span>${payment.status === 'paid' ? 'مدفوع' : 'غير مدفوع'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="employee-info">
                    <h3>بيانات الموظف</h3>
                    <div class="receipt-info">
                        <div>
                            <div class="receipt-info-item">
                                <span class="receipt-info-label">اسم الموظف:</span>
                                <span>${employee.name}</span>
                            </div>
                            <div class="receipt-info-item">
                                <span class="receipt-info-label">المسمى الوظيفي:</span>
                                <span>${employee.position}</span>
                            </div>
                        </div>
                        <div>
                            <div class="receipt-info-item">
                                <span class="receipt-info-label">الرقم الوظيفي:</span>
                                <span>${employee.id}</span>
                            </div>
                            <div class="receipt-info-item">
                                <span class="receipt-info-label">القسم:</span>
                                <span>${employee.department || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h3>تفاصيل الراتب</h3>
                <table>
                    <thead>
                        <tr>
                            <th>البيان</th>
                            <th>المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>الراتب الأساسي</td>
                            <td>${formatCurrency(payment.baseSalary)}</td>
                        </tr>
                        <tr>
                            <td>العلاوات</td>
                            <td>${formatCurrency(payment.allowances)}</td>
                        </tr>
                        <tr>
                            <td>الاستقطاعات</td>
                            <td>${formatCurrency(payment.deductions)}</td>
                        </tr>
                        <tr class="total-row">
                            <td>صافي الراتب</td>
                            <td>${formatCurrency(netSalary)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="amount-in-words">
                    <strong>المبلغ بالحروف:</strong> ${netSalaryInWords}
                </div>
                
                ${payment.paymentInfo ? `
                    <div>
                        <h3>بيانات الدفع</h3>
                        <div class="receipt-info">
                            <div>
                                <div class="receipt-info-item">
                                    <span class="receipt-info-label">طريقة الدفع:</span>
                                    <span>${getPaymentMethodText(payment.paymentInfo.method)}</span>
                                </div>
                            </div>
                            ${payment.paymentInfo.reference ? `
                                <div>
                                    <div class="receipt-info-item">
                                        <span class="receipt-info-label">رقم المرجع:</span>
                                        <span>${payment.paymentInfo.reference}</span>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div class="signatures">
                    <div class="signature">
                        <div class="signature-line">توقيع المحاسب</div>
                    </div>
                    <div class="signature">
                        <div class="signature-line">توقيع المستلم</div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>تم إنشاء هذا الإيصال بواسطة نظام الاستثمار المتكامل - وحدة إدارة الموظفين</p>
                </div>
            </div>
            
            <button onclick="window.print();" style="margin-top: 20px; padding: 10px 20px;">طباعة الإيصال</button>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

/**
 * تصدير قائمة الموظفين إلى ملف CSV
 */
function exportEmployees() {
    console.log('تصدير قائمة الموظفين...');
    
    // إنشاء رؤوس الأعمدة
    const headers = ['الرقم', 'الاسم', 'رقم الهاتف', 'المسمى الوظيفي', 'القسم', 'تاريخ التعيين', 'الراتب الأساسي', 'يوم تسليم الراتب', 'البريد الإلكتروني', 'العنوان', 'الحالة', 'ملاحظات'];
    
    // إنشاء محتوى ملف CSV
    let csvContent = headers.join(',') + '\n';
    
    // إضافة بيانات الموظفين
    employees.forEach(employee => {
        const statusText = employee.status === 'active' ? 'نشط' : 'غير نشط';
        
        // تنظيف القيم من الفواصل
        const rowData = [
            employee.id,
            `"${employee.name.replace(/"/g, '""')}"`,
            `"${employee.phone}"`,
            `"${employee.position.replace(/"/g, '""')}"`,
            `"${employee.department.replace(/"/g, '""')}"`,
            employee.hireDate,
            employee.salary,
            employee.payday || 1,
            `"${employee.email || ''}"`,
            `"${(employee.address || '').replace(/"/g, '""')}"`,
            statusText,
            `"${(employee.notes || '').replace(/"/g, '""')}"`
        ];
        
        csvContent += rowData.join(',') + '\n';
    });
    
    // إنشاء رابط التنزيل
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `قائمة_الموظفين_${getCurrentDate()}.csv`);
    link.style.display = 'none';
    
    // إضافة الرابط إلى المستند وتنفيذ النقر عليه
    document.body.appendChild(link);
    link.click();
    
    // تنظيف الذاكرة
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
    
    showNotification('تم تصدير قائمة الموظفين بنجاح', 'success');
}

/**
 * تصدير سجل مدفوعات الرواتب إلى ملف CSV
 */
function exportSalaryPayments() {
    console.log('تصدير سجل مدفوعات الرواتب...');
    
    // الحصول على الشهر المحدد للتصفية
    const selectedMonth = document.getElementById('payment-month').value;
    const selectedStatus = document.getElementById('payment-status-filter').value;
    
    // تصفية المدفوعات حسب الشهر والحالة
    let filteredPayments = [...salaryPayments];
    
    if (selectedMonth) {
        filteredPayments = filteredPayments.filter(payment => payment.month === selectedMonth);
    }
    
    if (selectedStatus !== 'all') {
        filteredPayments = filteredPayments.filter(payment => payment.status === selectedStatus);
    }
    
    // إنشاء رؤوس الأعمدة
    const headers = ['الرقم', 'الموظف', 'الشهر', 'الراتب الأساسي', 'العلاوات', 'الاستقطاعات', 'صافي الراتب', 'الحالة', 'تاريخ الدفع', 'طريقة الدفع', 'ملاحظات'];
    
    // إنشاء محتوى ملف CSV
    let csvContent = headers.join(',') + '\n';
    
    // إضافة بيانات المدفوعات
    filteredPayments.forEach(payment => {
        const employee = employees.find(emp => emp.id === payment.employeeId) || { name: 'غير محدد' };
        const netSalary = payment.baseSalary + payment.allowances - payment.deductions;
        
        const statusText = payment.status === 'paid' ? 'مدفوع' : 'غير مدفوع';
        const paymentDate = payment.paymentInfo?.date || '';
        const paymentMethod = payment.paymentInfo?.method ? getPaymentMethodText(payment.paymentInfo.method) : '';
        
        // تنظيف القيم من الفواصل
        const rowData = [
            payment.id,
            `"${employee.name.replace(/"/g, '""')}"`,
            formatMonth(payment.month),
            payment.baseSalary,
            payment.allowances,
            payment.deductions,
            netSalary,
            statusText,
            paymentDate,
            `"${paymentMethod}"`,
            `"${(payment.notes || '').replace(/"/g, '""')}"`
        ];
        
        csvContent += rowData.join(',') + '\n';
    });
    
    // إنشاء رابط التنزيل
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `سجل_الرواتب_${selectedMonth || getCurrentMonth()}.csv`);
    link.style.display = 'none';
    
    // إضافة الرابط إلى المستند وتنفيذ النقر عليه
    document.body.appendChild(link);
    link.click();
    
    // تنظيف الذاكرة
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
    
    showNotification('تم تصدير سجل مدفوعات الرواتب بنجاح', 'success');
}

/**
 * فتح النافذة المنبثقة
 * @param {string} modalId معرف النافذة
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
}

/**
 * إغلاق النافذة المنبثقة
 * @param {string} modalId معرف النافذة
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
    
    // إعادة تعيين نماذج النوافذ المنبثقة
    resetModalForms(modalId);
}

/**
 * إعادة تعيين نماذج النوافذ المنبثقة
 * @param {string} modalId معرف النافذة
 */
function resetModalForms(modalId) {
    // إعادة تعيين نموذج إضافة موظف
    if (modalId === 'add-employee-modal') {
        const form = document.getElementById('add-employee-form');
        if (form) form.reset();
        
        // إعادة زر الحفظ إلى حالته الأصلية
        const saveButton = document.getElementById('save-employee-btn');
        if (saveButton) {
            saveButton.textContent = 'إضافة';
            saveButton.onclick = addNewEmployee;
        }
        
        // إعادة عنوان النافذة إلى الأصل
        const modalTitle = document.querySelector('#add-employee-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'إضافة موظف جديد';
        }
    }
    
    // إعادة تعيين نموذج تسجيل راتب
    else if (modalId === 'record-salary-modal') {
        const form = document.getElementById('record-salary-form');
        if (form) form.reset();
        
        // إخفاء تفاصيل الدفع
        const paymentDetails = document.getElementById('payment-details');
        if (paymentDetails) {
            paymentDetails.style.display = 'none';
        }
    }
    
    // إعادة تعيين نموذج إضافة استقطاع
    else if (modalId === 'add-deduction-modal') {
        const form = document.getElementById('add-deduction-form');
        if (form) form.reset();
        
        // إعادة زر الحفظ إلى حالته الأصلية
        const saveButton = document.getElementById('save-deduction-btn');
        if (saveButton) {
            saveButton.textContent = 'إضافة';
            saveButton.onclick = addNewDeduction;
        }
        
        // إعادة عنوان النافذة إلى الأصل
        const modalTitle = document.querySelector('#add-deduction-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'إضافة استقطاع';
        }
    }
}

/**
 * إضافة أنماط CSS لواجهة إدارة الموظفين
 */
function addEmployeesStyles() {
    console.log('إضافة أنماط CSS لواجهة إدارة الموظفين...');
    
    // التحقق من وجود عنصر style لأنماط الموظفين
    if (document.getElementById('employees-management-styles')) {
        return;
    }
    
    // إنشاء عنصر style جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'employees-management-styles';
    
    // تحديد الأنماط
    styleElement.textContent = `
        /* أنماط تبويب الموظفين */
        .employees-tabs {
            margin-top: 20px;
        }
        
        .employees-tabs .tab-buttons {
            display: flex;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
        }
        
        .employees-tabs .tab-btn {
            padding: 10px 20px;
            border: none;
            background: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            margin-left: 10px;
        }
        
        .employees-tabs .tab-btn:hover {
            color: var(--primary-color);
        }
        
        .employees-tabs .tab-btn.active {
            color: var(--primary-color);
            border-bottom-color: var(--primary-color);
        }
        
        .employees-tabs .tab-content {
            display: none;
        }
        
        .employees-tabs .tab-content.active {
            display: block;
        }
        
        /* أنماط صف الموظف */
        .employee-info {
            display: flex;
            align-items: center;
        }
        
        .employee-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-left: 10px;
        }
        
        .employee-avatar.large {
            width: 64px;
            height: 64px;
            font-size: 24px;
        }
        
        .employee-name {
            font-weight: bold;
        }
        
        .employee-phone {
            font-size: 0.85rem;
            color: #666;
        }
        
        .employee-actions {
            display: flex;
            gap: 5px;
        }
        
        .employee-action-btn, .payment-action-btn, .deduction-action-btn {
            background: none;
            border: none;
            width: 28px;
            height: 28px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .employee-action-btn:hover, .payment-action-btn:hover, .deduction-action-btn:hover {
            background-color: #f0f0f0;
        }
        
        .view-employee, .view-payment {
            color: var(--primary-color);
        }
        
        .edit-employee, .edit-deduction {
            color: var(--info-color);
        }
        
        .delete-employee, .delete-payment, .delete-deduction {
            color: var(--danger-color);
        }
        
        .record-salary {
            color: var(--success-color);
        }
        
        .mark-as-paid {
            color: var(--success-color);
        }
        
        /* أنماط صف غير نشط */
        .inactive-row {
            background-color: #f8f8f8;
            color: #888;
        }
        
        /* أنماط البطاقات والإحصائيات */
        .employee-profile {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .profile-details {
            margin-right: 15px;
        }
        
        .employee-statistics {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            flex: 1;
            min-width: 200px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background-color: #f9f9f9;
        }
        
        .stat-title {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 5px;
        }
        
        .stat-value {
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--primary-color);
        }
        
        /* أنماط تفاصيل الموظف */
        .employee-details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .detail-section {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
        }
        
        .section-title {
            font-size: 1.1rem;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .detail-item {
            display: flex;
            margin-bottom: 10px;
        }
        
        .detail-label {
            font-weight: 500;
            min-width: 120px;
            color: #555;
        }
        
        .detail-value {
            flex: 1;
        }
        
        .employee-notes, .salary-notes {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
        }
        
        .notes-content {
            white-space: pre-wrap;
            color: #555;
        }
        
        /* أنماط جدول مصغر */
        .mini-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }
        
        .mini-table th, .mini-table td {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: right;
        }
        
        .mini-table th {
            background-color: #f5f5f5;
        }
        
        /* أنماط تفاصيل الراتب */
        .salary-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .salary-month {
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .salary-details {
            margin: 20px 0;
        }
        
        .salary-details .detail-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .salary-details .total {
            font-weight: bold;
            background-color: #f5f5f5;
        }
        
        .payment-details {
            margin-top: 20px;
        }
        
        /* أنماط نافذة الشهر والتصفية */
        .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        /* أنماط التقارير */
        .report-container {
            margin-top: 20px;
        }
        
        .report-summary {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .summary-card {
            flex: 1;
            min-width: 200px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background-color: #f9f9f9;
        }
        
        .summary-title {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 5px;
        }
        
        .summary-value {
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--primary-color);
        }
        
        .chart-container {
            height: 400px;
            margin-top: 20px;
        }
        
        /* أنماط عندما لا توجد بيانات */
        .no-data {
            padding: 20px;
            text-align: center;
            color: #888;
            border: 1px dashed #ddd;
            border-radius: 8px;
        }
        
        /* أنماط ملخص الإحصائيات */
        @media (max-width: 768px) {
            .employee-statistics, .report-summary {
                flex-direction: column;
            }
            
            .stat-card, .summary-card {
                width: 100%;
            }
            
            .employee-details-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    // إضافة عنصر الأنماط إلى الصفحة
    document.head.appendChild(styleElement);
}

/**
 * الحصول على التاريخ الحالي بتنسيق YYYY-MM-DD
 * @returns {string} التاريخ الحالي
 */
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * الحصول على الشهر الحالي بتنسيق YYYY-MM
 * @returns {string} الشهر الحالي
 */
function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * تنسيق التاريخ
 * @param {string} dateString التاريخ بتنسيق YYYY-MM-DD
 * @returns {string} التاريخ المنسق
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    // تنسيق التاريخ بالعربية
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ar-EG', options);
}

/**
 * تنسيق الشهر
 * @param {string} monthString الشهر بتنسيق YYYY-MM
 * @returns {string} الشهر المنسق
 */
function formatMonth(monthString) {
    if (!monthString) return '-';
    
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    if (isNaN(date.getTime())) return monthString;
    
    // تنسيق الشهر بالعربية
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('ar-EG', options);
}

/**
 * تنسيق المبلغ المالي
 * @param {number} amount المبلغ
 * @returns {string} المبلغ المنسق
 */
function formatCurrency(amount) {
    if (amount === undefined || amount === null) return '-';
    
    // تنسيق المبلغ بالعربية
    return amount.toLocaleString('ar-EG') + ' ' + (window.settings?.currency || 'دينار');
}

/**
 * حساب فترة العمل
 * @param {string} hireDate تاريخ التعيين
 * @returns {string} فترة العمل
 */
function calculateEmploymentPeriod(hireDate) {
    if (!hireDate) return '-';
    
    const hire = new Date(hireDate);
    const now = new Date();
    
    if (isNaN(hire.getTime())) return '-';
    
    // حساب الفرق بالسنوات والأشهر
    let years = now.getFullYear() - hire.getFullYear();
    let months = now.getMonth() - hire.getMonth();
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    // تنسيق النتيجة
    let result = '';
    
    if (years > 0) {
        result += years + ' سنة';
        if (months > 0) {
            result += ' و ' + months + ' شهر';
        }
    } else if (months > 0) {
        result = months + ' شهر';
    } else {
        // إذا كانت الفترة أقل من شهر، نحسب الأيام
        const days = Math.floor((now - hire) / (1000 * 60 * 60 * 24));
        result = days + ' يوم';
    }
    
    return result;
}

/**
 * الحصول على اسم الشهر
 * @param {number} monthIndex مؤشر الشهر (0-11)
 * @returns {string} اسم الشهر
 */
function getMonthName(monthIndex) {
    const months = [
        'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    return months[monthIndex] || '';
}

/**
 * الحصول على اسم الربع
 * @param {number} quarter رقم الربع (1-4)
 * @returns {string} اسم الربع
 */
function getQuarterName(quarter) {
    const quarters = ['الأول', 'الثاني', 'الثالث', 'الرابع'];
    return quarters[quarter - 1] || '';
}

/**
 * الحصول على نص طريقة الدفع
 * @param {string} method طريقة الدفع
 * @returns {string} نص طريقة الدفع
 */
function getPaymentMethodText(method) {
    switch (method) {
        case 'cash':
            return 'نقدي';
        case 'bank':
            return 'تحويل بنكي';
        case 'cheque':
            return 'شيك';
        default:
            return method;
    }
}

/**
 * تحويل الرقم إلى كلمات بالعربية
 * @param {number} number الرقم
 * @returns {string} الرقم بالكلمات
 */
function numberToArabicWords(number) {
    // تعريف الأرقام بالكلمات
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    
    // تعريف الأعداد من 11 إلى 19
    const teens = ['', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    
    // تعريف الآلاف
    const thousands = ['', 'ألف', 'ألفان', 'ثلاثة آلاف', 'أربعة آلاف', 'خمسة آلاف', 'ستة آلاف', 'سبعة آلاف', 'ثمانية آلاف', 'تسعة آلاف'];
    
    // إذا كان الرقم صفرًا
    if (number === 0) {
        return 'صفر';
    }
    
    // فصل الجزء الصحيح والكسور
    const integerPart = Math.floor(number);
    const decimalPart = Math.round((number - integerPart) * 100);
    
    // تحويل الجزء الصحيح إلى كلمات
    let words = '';
    
    // معالجة الملايين
    if (integerPart >= 1000000) {
        const millions = Math.floor(integerPart / 1000000);
        if (millions === 1) {
            words += 'مليون';
        } else if (millions === 2) {
            words += 'مليونان';
        } else if (millions >= 3 && millions <= 10) {
            words += convertLessThanThousand(millions) + ' ملايين';
        } else {
            words += convertLessThanThousand(millions) + ' مليون';
        }
        
        if (integerPart % 1000000 !== 0) {
            words += ' و';
        }
        
        integerPart %= 1000000;
    }
    
    // معالجة الآلاف
    if (integerPart >= 1000) {
        const thousandsCount = Math.floor(integerPart / 1000);
        if (thousandsCount === 1) {
            words += 'ألف';
        } else if (thousandsCount === 2) {
            words += 'ألفان';
        } else if (thousandsCount >= 3 && thousandsCount <= 10) {
            words += convertLessThanThousand(thousandsCount) + ' آلاف';
        } else {
            words += convertLessThanThousand(thousandsCount) + ' ألف';
        }
        
        if (integerPart % 1000 !== 0) {
            words += ' و';
        }
        
        integerPart %= 1000;
    }
    
    // إضافة الجزء المتبقي أقل من 1000
    if (integerPart > 0) {
        words += convertLessThanThousand(integerPart);
    }
    
    // إضافة كلمة دينار
    words += ' دينار';
    
    // إضافة الكسور
    if (decimalPart > 0) {
        words += ' و' + convertLessThanThousand(decimalPart) + ' فلس';
    }
    
    return 'فقط ' + words + ' لا غير';
    
    // دالة لتحويل الأعداد أقل من 1000 إلى كلمات
    function convertLessThanThousand(num) {
        let result = '';
        
        // معالجة المئات
        if (num >= 100) {
            result += hundreds[Math.floor(num / 100)];
            if (num % 100 !== 0) {
                result += ' و';
            }
            num %= 100;
        }
        
        // معالجة الأعداد من 11 إلى 19
        if (num >= 11 && num <= 19) {
            result += teens[num - 10];
            return result;
        }
        
        // معالجة العشرات
        if (num >= 10) {
            if (num === 10) {
                result += 'عشرة';
                return result;
            }
            
            const onesDigit = num % 10;
            if (onesDigit > 0) {
                result += ones[onesDigit] + ' و';
            }
            
            result += tens[Math.floor(num / 10)];
            return result;
        }
        
        // معالجة الآحاد
        if (num > 0) {
            result += ones[num];
        }
        
        return result;
    }
}

/**
 * عرض إشعار للمستخدم
 * @param {string} message نص الإشعار
 * @param {string} type نوع الإشعار (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // إذا كانت الدالة موجودة في النظام الأساسي، نستخدمها
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // تحديد أيقونة الإشعار حسب النوع
    let icon;
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-times-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    // إضافة محتوى الإشعار
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">×</button>
    `;
    
    // إضافة الإشعار إلى الصفحة
    document.body.appendChild(notification);
    
    // إضافة مستمع حدث لزر الإغلاق
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // إخفاء الإشعار تلقائيًا بعد مدة
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// تعرض الصفحة الإفتراضية عند النقر على عنصر الموظفين في الشريط الجانبي
function showPage(pageId) {
    // الحصول على جميع الصفحات
    const pages = document.querySelectorAll('.page');
    
    // إخفاء جميع الصفحات
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // إظهار الصفحة المطلوبة
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // تحديث العناصر النشطة في القائمة الجانبية
        updateActiveNavItem(pageId);
        
        // تنفيذ الإجراءات الخاصة بالصفحة
        if (pageId === 'employees') {
            renderEmployeesTable();
        }
    }
}

/**
 * تحديث العنصر النشط في القائمة الجانبية
 * @param {string} pageId معرف الصفحة
 */
function updateActiveNavItem(pageId) {
    // إزالة الفئة النشطة من جميع العناصر
    const navItems = document.querySelectorAll('.nav-link');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // إضافة الفئة النشطة للعنصر المحدد
    const activeNavItem = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeNavItem) {
       activeNavItem.classList.add('active');
    }
}

// إضافة النظام إلى كائن النافذة (window) ليكون متاحًا من أي مكان
window.EmployeesManagement = {
    // المتغيرات العامة
    employees,
    salaryPayments,
    deductions,
    
    // الوظائف العامة
    loadEmployeesData,
    saveEmployeesData,
    renderEmployeesTable,
    renderSalaryPaymentsTable,
    renderDeductionsTable,
    
    // وظائف الموظفين
    addNewEmployee,
    showEmployeeDetails,
    editEmployee,
    updateEmployee,
    deleteEmployee,
    
    // وظائف الرواتب
    openSalaryModal,
    recordSalaryPayment,
    showSalaryPaymentDetails,
    markSalaryAsPaid,
    deleteSalaryPayment,
    
    // وظائف الاستقطاعات
    addNewDeduction,
    editDeduction,
    updateDeduction,
    deleteDeduction,
    
    // وظائف التقارير
    generateReport,
    printReport,
    
    // وظائف التصدير
    exportEmployees,
    exportSalaryPayments
};

/**
 * تحديث نظام إدارة الموظفين لإضافة نسبة المبيعات والراتب الأساسي
 * هذا الملف يحتوي على التعديلات والإضافات اللازمة لدعم حساب الراتب بناءً على نسبة المبيعات
 */

// 1. تعديل نموذج إضافة/تعديل الموظف لإضافة حقول الراتب الأساسي ونسبة المبيعات


/**
 * تحديث نموذج إضافة/تعديل الموظف
 */
function updateEmployeeForm() {
    // البحث عن الحقول في نموذج إضافة موظف
    const employeeForm = document.getElementById('add-employee-form');
    if (!employeeForm) return;
    
    // البحث عن حقل الراتب الحالي
    const salaryFieldGroup = document.getElementById('employee-salary').closest('.form-group');
    if (!salaryFieldGroup) return;
    
    // التحقق مما إذا كانت الحقول الجديدة قد تمت إضافتها بالفعل
    if (document.getElementById('employee-base-salary')) return;
    
    // إنشاء حقول جديدة للراتب الأساسي ونسبة المبيعات
    const newFields = document.createElement('div');
    newFields.innerHTML = `
        <div class="form-group">
            <label class="form-label">الراتب الأساسي</label>
            <div class="input-group">
                <input class="form-input" id="employee-base-salary" type="number" min="0" step="1000" />
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">نسبة المبيعات (%)</label>
            <div class="input-group">
                <input class="form-input" id="employee-commission-rate" type="number" min="0" max="100" step="0.1" value="0" />
            </div>
        </div>
        <div class="form-group has-checkbox">
            <input type="checkbox" id="employee-has-commission" class="form-checkbox" />
            <label for="employee-has-commission" class="form-checkbox-label">تفعيل نسبة المبيعات</label>
        </div>
    `;
    
    // إدراج الحقول الجديدة بعد حقل الراتب
    salaryFieldGroup.parentNode.insertBefore(newFields, salaryFieldGroup.nextSibling);
    
    // تعديل عنوان حقل الراتب الحالي
    const salaryLabel = salaryFieldGroup.querySelector('.form-label');
    if (salaryLabel) {
        salaryLabel.textContent = 'الراتب الإجمالي (محسوب تلقائياً)';
    }
    
    // تعيين حقل الراتب الإجمالي كغير قابل للتعديل
    const salaryInput = document.getElementById('employee-salary');
    if (salaryInput) {
        salaryInput.setAttribute('readonly', 'readonly');
    }
    
    // إضافة مستمعي الأحداث للحقول الجديدة
    setupCommissionFields();
}

/**
 * تحديث نموذج تسجيل راتب
 */
function updateSalaryForm() {
    // البحث عن نموذج تسجيل راتب
    const salaryForm = document.getElementById('record-salary-form');
    if (!salaryForm) return;
    
    // البحث عن حقل حساب المبيعات
    if (document.getElementById('salary-sales-amount')) return;
    
    // البحث عن حقل الراتب الأساسي
    const baseSalaryField = document.getElementById('salary-amount');
    if (!baseSalaryField) return;
    
    const baseSalaryGroup = baseSalaryField.closest('.form-group');
    if (!baseSalaryGroup) return;
    
    // إنشاء حقول جديدة لمبلغ المبيعات ونسبة العمولة
    const salesFields = document.createElement('div');
    salesFields.className = 'commission-section';
    salesFields.style.display = 'none'; // إخفاء القسم افتراضياً
    salesFields.innerHTML = `
        <div class="form-group">
            <label class="form-label">الراتب الأساسي</label>
            <input class="form-input" id="salary-base-amount" type="number" readonly />
        </div>
        <div class="form-group">
            <label class="form-label">نسبة المبيعات (%)</label>
            <input class="form-input" id="salary-commission-rate" type="number" readonly />
        </div>
        <div class="form-group">
            <label class="form-label">مبلغ المبيعات</label>
            <input class="form-input" id="salary-sales-amount" type="number" min="0" value="0" />
        </div>
        <div class="form-group">
            <label class="form-label">مبلغ العمولة</label>
            <input class="form-input" id="salary-commission-amount" type="number" readonly />
        </div>
    `;
    
    // إدراج الحقول الجديدة بعد حقل الراتب الأساسي
    salaryForm.insertBefore(salesFields, baseSalaryGroup.nextSibling);
    
    // تغيير عنوان حقل الراتب الأساسي
    const baseSalaryLabel = baseSalaryGroup.querySelector('.form-label');
    if (baseSalaryLabel) {
        baseSalaryLabel.textContent = 'الراتب الإجمالي';
    }
    
    // إضافة مستمع حدث لحقل مبلغ المبيعات
    const salesAmountField = document.getElementById('salary-sales-amount');
    if (salesAmountField) {
        salesAmountField.addEventListener('input', updateCommissionAmount);
    }
    
    // تحديث مستمع حدث اختيار الموظف
    updateSalaryEmployeeListener();
}

/**
 * إعداد مستمعي الأحداث لحقول نسبة المبيعات
 */
function setupCommissionFields() {
    // الحصول على الحقول
    const baseSalaryField = document.getElementById('employee-base-salary');
    const commissionRateField = document.getElementById('employee-commission-rate');
    const hasCommissionCheckbox = document.getElementById('employee-has-commission');
    const totalSalaryField = document.getElementById('employee-salary');
    
    if (!baseSalaryField || !commissionRateField || !hasCommissionCheckbox || !totalSalaryField) {
        return;
    }
    
    // مستمع حدث للتحقق من تفعيل نسبة المبيعات
    hasCommissionCheckbox.addEventListener('change', function() {
        // تفعيل/تعطيل حقول نسبة المبيعات
        commissionRateField.disabled = !this.checked;
        
        // تحديث الراتب الإجمالي
        updateTotalSalary();
    });
    
    // مستمع حدث لتغيير الراتب الأساسي
    baseSalaryField.addEventListener('input', updateTotalSalary);
    
    // مستمع حدث لتغيير نسبة المبيعات
    commissionRateField.addEventListener('input', updateTotalSalary);
    
    // التهيئة الأولية
    commissionRateField.disabled = !hasCommissionCheckbox.checked;
    
    // تعديل دالة addNewEmployee لإضافة حقول نسبة المبيعات
    const originalAddNewEmployee = window.addNewEmployee;
    window.addNewEmployee = function() {
        // الحصول على قيم الحقول الجديدة
        const baseSalary = parseFloat(baseSalaryField.value) || 0;
        const commissionRate = parseFloat(commissionRateField.value) || 0;
        const hasCommission = hasCommissionCheckbox.checked;
        
        // تعيين الراتب الإجمالي
        totalSalaryField.value = baseSalary;
        
        // استدعاء الدالة الأصلية
        if (typeof originalAddNewEmployee === 'function') {
            const result = originalAddNewEmployee();
            
            // إذا تمت إضافة الموظف بنجاح
            if (result !== false) {
                // تحديث بيانات الموظف المضاف لإضافة حقول نسبة المبيعات
                const lastEmployeeIndex = window.employees.length - 1;
                if (lastEmployeeIndex >= 0) {
                    window.employees[lastEmployeeIndex].baseSalary = baseSalary;
                    window.employees[lastEmployeeIndex].commissionRate = hasCommission ? commissionRate : 0;
                    window.employees[lastEmployeeIndex].hasCommission = hasCommission;
                    
                    // حفظ البيانات
                    window.saveEmployeesData();
                }
            }
            
            return result;
        }
    };
    
    // تعديل دالة updateEmployee لتحديث حقول نسبة المبيعات
    const originalUpdateEmployee = window.updateEmployee;
    window.updateEmployee = function(employeeId) {
        // الحصول على قيم الحقول الجديدة
        const baseSalary = parseFloat(baseSalaryField.value) || 0;
        const commissionRate = parseFloat(commissionRateField.value) || 0;
        const hasCommission = hasCommissionCheckbox.checked;
        
        // تعيين الراتب الإجمالي
        totalSalaryField.value = calculateTotalSalary(baseSalary, commissionRate, hasCommission);
        
        // استدعاء الدالة الأصلية
        if (typeof originalUpdateEmployee === 'function') {
            const result = originalUpdateEmployee(employeeId);
            
            // إذا تم تحديث الموظف بنجاح
            if (result !== false) {
                // البحث عن الموظف وتحديث بياناته
                const employeeIndex = window.employees.findIndex(emp => emp.id === employeeId);
                if (employeeIndex >= 0) {
                    window.employees[employeeIndex].baseSalary = baseSalary;
                    window.employees[employeeIndex].commissionRate = hasCommission ? commissionRate : 0;
                    window.employees[employeeIndex].hasCommission = hasCommission;
                    
                    // حفظ البيانات
                    window.saveEmployeesData();
                }
            }
            
            return result;
        }
    };
    
    // تعديل دالة editEmployee لملء حقول نسبة المبيعات
    const originalEditEmployee = window.editEmployee;
    window.editEmployee = function(employeeId) {
        // استدعاء الدالة الأصلية
        if (typeof originalEditEmployee === 'function') {
            originalEditEmployee(employeeId);
        }
        
        // البحث عن الموظف
        const employee = window.employees.find(emp => emp.id === employeeId);
        if (employee) {
            // ملء حقول نسبة المبيعات
            baseSalaryField.value = employee.baseSalary || 0;
            commissionRateField.value = employee.commissionRate || 0;
            hasCommissionCheckbox.checked = employee.hasCommission || false;
            
            // تحديث حالة تعطيل حقل نسبة المبيعات
            commissionRateField.disabled = !hasCommissionCheckbox.checked;
        }
    };
}

/**
 * تحديث مستمع حدث اختيار الموظف في نموذج تسجيل راتب
 */
function updateSalaryEmployeeListener() {
    // الحصول على حقل اختيار الموظف
    const employeeSelect = document.getElementById('salary-employee');
    if (!employeeSelect) return;
    
    // الحصول على قسم نسبة المبيعات
    const commissionSection = document.querySelector('.commission-section');
    if (!commissionSection) return;
    
    // تعديل دالة updateSalaryDetails لعرض بيانات نسبة المبيعات
    const originalUpdateSalaryDetails = window.updateSalaryDetails;
    window.updateSalaryDetails = function() {
        // استدعاء الدالة الأصلية
        if (typeof originalUpdateSalaryDetails === 'function') {
            originalUpdateSalaryDetails();
        }
        
        // الحصول على معرف الموظف المحدد
        const employeeId = employeeSelect.value;
        if (!employeeId) {
            commissionSection.style.display = 'none';
            return;
        }
        
        // البحث عن الموظف
        const employee = window.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            commissionSection.style.display = 'none';
            return;
        }
        
        // التحقق مما إذا كان الموظف لديه نسبة مبيعات
        if (employee.hasCommission) {
            // عرض قسم نسبة المبيعات
            commissionSection.style.display = 'block';
            
            // ملء البيانات
            document.getElementById('salary-base-amount').value = employee.baseSalary || 0;
            document.getElementById('salary-commission-rate').value = employee.commissionRate || 0;
            
            // تحديث مبلغ العمولة
            updateCommissionAmount();
        } else {
            // إخفاء قسم نسبة المبيعات
            commissionSection.style.display = 'none';
        }
    };
    
    // تعديل دالة recordSalaryPayment لتسجيل بيانات نسبة المبيعات
    const originalRecordSalaryPayment = window.recordSalaryPayment;
    window.recordSalaryPayment = function() {
        // الحصول على معرف الموظف المحدد
        const employeeId = employeeSelect.value;
        if (!employeeId) {
            return originalRecordSalaryPayment ? originalRecordSalaryPayment() : false;
        }
        
        // البحث عن الموظف
        const employee = window.employees.find(emp => emp.id === employeeId);
        if (!employee || !employee.hasCommission) {
            return originalRecordSalaryPayment ? originalRecordSalaryPayment() : false;
        }
        
        // الحصول على قيم حقول نسبة المبيعات
        const baseSalary = parseFloat(document.getElementById('salary-base-amount').value) || 0;
        const commissionRate = parseFloat(document.getElementById('salary-commission-rate').value) || 0;
        const salesAmount = parseFloat(document.getElementById('salary-sales-amount').value) || 0;
        const commissionAmount = parseFloat(document.getElementById('salary-commission-amount').value) || 0;
        
        // حفظ القيم الأصلية
        const originalAllowances = parseFloat(document.getElementById('salary-allowances').value) || 0;
        
        // إضافة مبلغ العمولة إلى العلاوات
        document.getElementById('salary-allowances').value = originalAllowances + commissionAmount;
        
        // استدعاء الدالة الأصلية
        const result = originalRecordSalaryPayment ? originalRecordSalaryPayment() : false;
        
        // إعادة القيمة الأصلية للعلاوات
        document.getElementById('salary-allowances').value = originalAllowances;
        
        // إذا تم تسجيل الراتب بنجاح
        if (result !== false) {
            // البحث عن دفعة الراتب المسجلة
            const lastPaymentIndex = window.salaryPayments.length - 1;
            if (lastPaymentIndex >= 0) {
                // إضافة بيانات نسبة المبيعات
                window.salaryPayments[lastPaymentIndex].commissionData = {
                    baseSalary,
                    commissionRate,
                    salesAmount,
                    commissionAmount
                };
                
                // حفظ البيانات
                window.saveEmployeesData();
            }
        }
        
        return result;
    };
}

/**
 * تحديث الراتب الإجمالي بناءً على الراتب الأساسي ونسبة المبيعات
 */
function updateTotalSalary() {
    // الحصول على الحقول
    const baseSalaryField = document.getElementById('employee-base-salary');
    const commissionRateField = document.getElementById('employee-commission-rate');
    const hasCommissionCheckbox = document.getElementById('employee-has-commission');
    const totalSalaryField = document.getElementById('employee-salary');
    
    if (!baseSalaryField || !commissionRateField || !hasCommissionCheckbox || !totalSalaryField) {
        return;
    }
    
    // الحصول على القيم
    const baseSalary = parseFloat(baseSalaryField.value) || 0;
    const commissionRate = parseFloat(commissionRateField.value) || 0;
    const hasCommission = hasCommissionCheckbox.checked;
    
    // حساب الراتب الإجمالي
    const totalSalary = baseSalary;
    
    // تحديث حقل الراتب الإجمالي
    totalSalaryField.value = totalSalary;
}

/**
 * حساب الراتب الإجمالي بناءً على الراتب الأساسي ونسبة المبيعات
 * @param {number} baseSalary الراتب الأساسي
 * @param {number} commissionRate نسبة المبيعات
 * @param {boolean} hasCommission تفعيل نسبة المبيعات
 * @param {number} salesAmount مبلغ المبيعات (اختياري)
 * @returns {number} الراتب الإجمالي
 */
function calculateTotalSalary(baseSalary, commissionRate, hasCommission, salesAmount = 0) {
    // إذا كانت نسبة المبيعات غير مفعلة، نرجع الراتب الأساسي فقط
    if (!hasCommission) {
        return baseSalary;
    }
    
    // حساب مبلغ العمولة
    const commissionAmount = (salesAmount * commissionRate) / 100;
    
    // حساب الراتب الإجمالي
    return baseSalary + commissionAmount;
}

/**
 * تحديث مبلغ العمولة بناءً على مبلغ المبيعات ونسبة العمولة
 */
function updateCommissionAmount() {
    // الحصول على الحقول
    const commissionRateField = document.getElementById('salary-commission-rate');
    const salesAmountField = document.getElementById('salary-sales-amount');
    const commissionAmountField = document.getElementById('salary-commission-amount');
    const baseSalaryField = document.getElementById('salary-base-amount');
    const totalSalaryField = document.getElementById('salary-amount');
    
    if (!commissionRateField || !salesAmountField || !commissionAmountField || !baseSalaryField || !totalSalaryField) {
        return;
    }
    
    // الحصول على القيم
    const commissionRate = parseFloat(commissionRateField.value) || 0;
    const salesAmount = parseFloat(salesAmountField.value) || 0;
    const baseSalary = parseFloat(baseSalaryField.value) || 0;
    
    // حساب مبلغ العمولة
    const commissionAmount = (salesAmount * commissionRate) / 100;
    
    // تحديث حقل مبلغ العمولة
    commissionAmountField.value = commissionAmount;
    
    // تحديث الراتب الإجمالي
    totalSalaryField.value = baseSalary + commissionAmount;
    
    // تحديث صافي الراتب
    window.updateNetSalary();
}

/**
 * تعديل عرض تفاصيل دفعة الراتب لعرض بيانات نسبة المبيعات
 */
function updateSalaryPaymentDetails() {
    // تعديل دالة showSalaryPaymentDetails لعرض بيانات نسبة المبيعات
    const originalShowSalaryPaymentDetails = window.showSalaryPaymentDetails;
    window.showSalaryPaymentDetails = function(paymentId) {
        // استدعاء الدالة الأصلية
        if (typeof originalShowSalaryPaymentDetails === 'function') {
            originalShowSalaryPaymentDetails(paymentId);
        }
        
        // البحث عن دفعة الراتب
        const payment = window.salaryPayments.find(p => p.id === paymentId);
        if (!payment || !payment.commissionData) {
            return;
        }
        
        // البحث عن قسم تفاصيل الراتب
        const salaryDetailsSection = document.querySelector('.salary-details');
        if (!salaryDetailsSection) {
            return;
        }
        
        // البحث عن الصف الأخير (صافي الراتب)
        const totalRow = salaryDetailsSection.querySelector('.total-row');
        if (!totalRow) {
            return;
        }
        
        // إنشاء صفوف جديدة لبيانات نسبة المبيعات
        const commissionRows = document.createElement('div');
        commissionRows.innerHTML = `
            <tr class="commission-row">
                <td>الراتب الأساسي</td>
                <td>${window.formatCurrency(payment.commissionData.baseSalary)}</td>
            </tr>
            <tr class="commission-row">
                <td>مبلغ المبيعات</td>
                <td>${window.formatCurrency(payment.commissionData.salesAmount)}</td>
            </tr>
            <tr class="commission-row">
                <td>نسبة المبيعات (${payment.commissionData.commissionRate}%)</td>
                <td>${window.formatCurrency(payment.commissionData.commissionAmount)}</td>
            </tr>
        `;
        
        // إدراج الصفوف الجديدة قبل صف صافي الراتب
        totalRow.parentNode.insertBefore(commissionRows, totalRow);
    };
}

// استدعاء دالة تعديل عرض تفاصيل دفعة الراتب
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateSalaryPaymentDetails, 1000);
});

/**
 * إضافة أنماط CSS جديدة
 */
function addCommissionStyles() {
    // التحقق من وجود عنصر style لأنماط نسبة المبيعات
    if (document.getElementById('commission-styles')) {
        return;
    }
    
    // إنشاء عنصر style جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'commission-styles';
    
    // تحديد الأنماط
    styleElement.textContent = `
        /* أنماط حقول نسبة المبيعات */
        .form-group.has-checkbox {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .form-checkbox {
            margin-left: 10px;
        }
        
        .form-checkbox-label {
            margin-bottom: 0;
        }
        
        /* أنماط قسم نسبة المبيعات */
        .commission-section {
            margin: 15px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
        }
        
        /* أنماط صفوف نسبة المبيعات في تفاصيل الراتب */
        .commission-row {
            background-color: #f5f5f5;
        }
    `;
    
    // إضافة عنصر الأنماط إلى الصفحة
    document.head.appendChild(styleElement);
}

// استدعاء دالة إضافة الأنماط
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addCommissionStyles, 1000);
});

/**
 * التحديثات التي تمت إضافتها:
 * 
 * 1. إضافة حقول جديدة في نموذج إضافة/تعديل الموظف:
 *    - الراتب الأساسي
 *    - نسبة المبيعات (%)
 *    - خيار تفعيل نسبة المبيعات
 * 
 * 2. إضافة حقول جديدة في نموذج تسجيل راتب:
 *    - الراتب الأساسي
 *    - نسبة المبيعات (%)
 *    - مبلغ المبيعات
 *    - مبلغ العمولة
 * 
 * 3. تعديل دوال الحفظ والتعديل لتخزين بيانات نسبة المبيعات
 * 
 * 4. إضافة دوال لحساب الراتب الإجمالي بناءً على الراتب الأساسي ونسبة المبيعات
 * 
 * 5. تعديل عرض تفاصيل دفعة الراتب لعرض بيانات نسبة المبيعات
 * 
 * 6. إضافة أنماط CSS جديدة لعناصر نسبة المبيعات
 */

// تصدير النظام
console.log('تم تحميل نظام إدارة الموظفين بنجاح!');

/**
 * ملاحظات إضافية:
 * 
 * 1. هذا الملف يقوم بإضافة نظام إدارة الموظفين إلى نظام الاستثمار المتكامل.
 * 2. النظام يتيح إدارة كاملة للموظفين والرواتب والاستقطاعات.
 * 3. تم دعم وظائف البحث والتصفية والتصدير والطباعة.
 * 4. النظام يقوم بتخزين البيانات محليًا باستخدام localStorage.
 * 5. تم إضافة تقارير ورسوم بيانية للإحصائيات.
 * 6. النظام قابل للتوسعة وإضافة المزيد من الميزات.
 * 
 * الاستخدام:
 * - قم بإضافة هذا الملف إلى مشروع نظام الاستثمار المتكامل.
 * - سيتم تلقائيًا إضافة عنصر "الموظفين" إلى القائمة الجانبية.
 * - عند النقر على العنصر، سيتم عرض واجهة إدارة الموظفين.
 */