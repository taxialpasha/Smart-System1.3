/**
 * ملف دمج نظام إدارة الموظفين مع نظام الاستثمار المتكامل
 * يقوم هذا الملف بدمج وتكامل نظام الموظفين مع التطبيق الرئيسي
 */

// تنفيذ الدمج عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('بدء دمج نظام الموظفين مع التطبيق الرئيسي...');
    
    // 1. إضافة عنصر الموظفين إلى القائمة الجانبية
    addEmployeesNavItem();
    
    // 2. إضافة صفحة الموظفين إلى التطبيق
    addEmployeesPage();
    
    // 3. ربط وظائف نظام الموظفين بالتطبيق الرئيسي
    integrateEmployeesFunctions();
    
    console.log('تم دمج نظام الموظفين بنجاح!');
});

/**
 * إضافة عنصر الموظفين إلى القائمة الجانبية
 */
function addEmployeesNavItem() {
    const navList = document.querySelector('.nav-list');
    if (!navList) {
        console.error('لم يتم العثور على القائمة الجانبية');
        return;
    }
    
    // عدم إضافة العنصر إذا كان موجوداً بالفعل
    if (document.querySelector('.nav-link[data-page="employees"]')) {
        return;
    }
    
    // إنشاء عنصر جديد
    const navItem = document.createElement('li');
    navItem.className = 'nav-item';
    navItem.innerHTML = `
        <a class="nav-link" data-page="employees" href="#">
            <div class="nav-icon">
                <i class="fas fa-user-tie"></i>
            </div>
            <span>الموظفين</span>
        </a>
    `;
    
    // إدراج العنصر قبل عنصر الإعدادات
    const settingsItem = document.querySelector('.nav-link[data-page="settings"]');
    if (settingsItem) {
        const parentElement = settingsItem.closest('.nav-item');
        navList.insertBefore(navItem, parentElement);
    } else {
        // إضافة العنصر إلى نهاية القائمة إذا لم يتم العثور على عنصر الإعدادات
        navList.appendChild(navItem);
    }
    
    // إضافة مستمع الحدث للتنقل
    const navLink = navItem.querySelector('.nav-link');
    navLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // تحديث حالة القائمة (إزالة الكلاس النشط من جميع الروابط)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // إضافة الكلاس النشط للرابط المحدد
        this.classList.add('active');
        
        // إظهار صفحة الموظفين
        showPage('employees');
    });
    
    console.log('تمت إضافة عنصر الموظفين إلى القائمة الجانبية');
}

/**
 * إضافة صفحة الموظفين إلى التطبيق
 */
function addEmployeesPage() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('لم يتم العثور على المحتوى الرئيسي');
        return;
    }
    
    // عدم إضافة الصفحة إذا كانت موجودة بالفعل
    if (document.getElementById('employees-page')) {
        return;
    }
    
    // إنشاء عنصر صفحة الموظفين
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
                    <input class="search-input" placeholder="بحث عن موظف..." type="text" />
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
                    <button class="btn btn-outline btn-sm" title="تصدير">
                        <i class="fas fa-download"></i>
                        <span>تصدير</span>
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table id="employees-table">
                    <thead>
                        <tr>
                            <th>المعرف</th>
                            <th>الموظف</th>
                            <th>المسمى الوظيفي</th>
                            <th>رقم الهاتف</th>
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
        
        <!-- قسم تقارير الرواتب -->
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">تقارير الرواتب</h2>
                <div class="section-actions">
                    <div class="form-group" style="display: inline-block; margin-left: 10px;">
                        <select class="form-select" id="salary-month">
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
                    <div class="form-group" style="display: inline-block; margin-left: 10px;">
                        <select class="form-select" id="salary-year">
                            <!-- سيتم ملؤها ديناميكيًا -->
                        </select>
                    </div>
                    <button class="btn btn-primary btn-sm" id="generate-payroll-btn">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <span>إنشاء كشف الرواتب</span>
                    </button>
                    <button class="btn btn-outline btn-sm" id="export-payroll-btn" title="تصدير كشف الرواتب">
                        <i class="fas fa-download"></i>
                        <span>تصدير</span>
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table id="payroll-table">
                    <thead>
                        <tr>
                            <th>المعرف</th>
                            <th>الموظف</th>
                            <th>المسمى الوظيفي</th>
                            <th>الراتب الأساسي</th>
                            <th>نسبة المبيعات</th>
                            <th>قيمة المبيعات</th>
                            <th>مبلغ العمولة</th>
                            <th>البدلات</th>
                            <th>الاستقطاعات</th>
                            <th>صافي الراتب</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>الإجمالي</strong></td>
                            <td id="total-base-salary">0 دينار</td>
                            <td>-</td>
                            <td id="total-sales">0 دينار</td>
                            <td id="total-commission">0 دينار</td>
                            <td id="total-allowances">0 دينار</td>
                            <td id="total-deductions">0 دينار</td>
                            <td id="total-net-salary">0 دينار</td>
                            <td>-</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
    
    // إضافة الصفحة إلى المحتوى الرئيسي
    mainContent.appendChild(employeesPage);
    
    // إضافة النوافذ المنبثقة
    addEmployeesModals();
    
    console.log('تمت إضافة صفحة الموظفين إلى التطبيق');
}

/**
 * إضافة النوافذ المنبثقة لنظام الموظفين
 */
function addEmployeesModals() {
    // التحقق من وجود النوافذ المنبثقة
    if (document.getElementById('add-employee-modal')) {
        return;
    }
    
    // إنشاء حاوية للنوافذ المنبثقة
    const modalsContainer = document.createElement('div');
    modalsContainer.id = 'employees-modals';
    
    // إضافة النوافذ المنبثقة
    modalsContainer.innerHTML = `
        <!-- نافذة إضافة موظف جديد -->
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
                                    <button class="btn btn-icon-sm mic-btn" data-input="employee-name" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">رقم الهاتف</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-phone" required="" type="tel" />
                                    <button class="btn btn-icon-sm mic-btn" data-input="employee-phone" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">العنوان</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-address" required="" type="text" />
                                    <button class="btn btn-icon-sm mic-btn" data-input="employee-address" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">البريد الإلكتروني</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-email" type="email" />
                                    <button class="btn btn-icon-sm mic-btn" data-input="employee-email" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">رقم الهوية</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-id-number" required="" type="text" />
                                    <button class="btn btn-icon-sm mic-btn" data-input="employee-id-number" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">تاريخ التعيين</label>
                                <input class="form-input" id="employee-hire-date" required="" type="date" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">المسمى الوظيفي</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-position" required="" type="text" />
                                    <button class="btn btn-icon-sm mic-btn" data-input="employee-position" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">القسم</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-department" required="" type="text" />
                                    <button class="btn btn-icon-sm mic-btn" data-input="employee-department" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">الراتب الأساسي (دينار)</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-salary" min="0" required="" step="1000" type="number" />
                                    <button class="btn btn-icon-sm mic-btn" data-input="employee-salary" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">نسبة المبيعات (%)</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-commission-rate" min="0" max="100" step="0.1" type="number" value="0" />
                                    <button class="btn btn-icon-sm mic-btn" data-input="employee-commission-rate" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">البدلات (دينار)</label>
                                <div class="input-group">
                                    <input class="form-input" id="employee-allowance" min="0" step="1000" type="number" value="0" />
                                    <button class="btn btn-icon-sm mic-btn" data-input="employee-allowance" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">الحالة</label>
                                <select class="form-select" id="employee-status">
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </select>
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
                <div class="modal-body">
                    <div id="employee-details-content">
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                    <div class="btn-group">
                        <button class="btn btn-primary" id="edit-employee-btn">
                            <i class="fas fa-edit"></i>
                            <span>تعديل</span>
                        </button>
                        <button class="btn btn-success" id="pay-salary-btn">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>دفع الراتب</span>
                        </button>
                        <button class="btn btn-danger" id="delete-employee-btn">
                            <i class="fas fa-trash"></i>
                            <span>حذف</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- نافذة إضافة راتب -->
        <div class="modal-overlay" id="add-salary-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">إضافة راتب شهري</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="add-salary-form">
                        <input type="hidden" id="salary-employee-id" value="" />
                        <div class="grid-cols-2">
                            <div class="form-group">
                                <label class="form-label">الموظف</label>
                                <input class="form-input" id="salary-employee-name" readonly type="text" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">الشهر</label>
                                <select class="form-select" id="add-salary-month" required>
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
                                <label class="form-label">السنة</label>
                                <select class="form-select" id="add-salary-year" required>
                                    <!-- سيتم ملؤها ديناميكيًا -->
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">الراتب الأساسي (دينار)</label>
                                <input class="form-input" id="salary-base" readonly type="number" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">نسبة المبيعات (%)</label>
                                <input class="form-input" id="salary-commission-rate" readonly type="number" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">قيمة المبيعات (دينار)</label>
                                <div class="input-group">
                                    <input class="form-input" id="salary-sales-amount" min="0" required="" step="1000" type="number" value="0" />
                                    <button class="btn btn-icon-sm mic-btn" data-input="salary-sales-amount" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">مبلغ العمولة (دينار)</label>
                                <input class="form-input" id="salary-commission-amount" readonly type="number" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">البدلات (دينار)</label>
                                <div class="input-group">
                                    <input class="form-input" id="salary-allowance" min="0" step="1000" type="number" />
                                    <button class="btn btn-icon-sm mic-btn" data-input="salary-allowance" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">الاستقطاعات (دينار)</label>
                                <div class="input-group">
                                    <input class="form-input" id="salary-deduction" min="0" step="1000" type="number" value="0" />
                                    <button class="btn btn-icon-sm mic-btn" data-input="salary-deduction" type="button">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">صافي الراتب (دينار)</label>
                                <input class="form-input" id="salary-net" readonly type="number" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">ملاحظات</label>
                                <textarea class="form-input" id="salary-notes" rows="3"></textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-salary-btn">دفع الراتب</button>
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
                    <div id="salary-details-content">
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
        </div>
    `;
    
    // إضافة النوافذ المنبثقة إلى الصفحة
    document.body.appendChild(modalsContainer);
    
    console.log('تمت إضافة النوافذ المنبثقة لنظام الموظفين');
}

/**
 * ربط وظائف نظام الموظفين بالتطبيق الرئيسي
 */
function integrateEmployeesFunctions() {
    // تهيئة متغيرات النظام إذا لم تكن موجودة
    window.employees = window.employees || [];
    window.salaries = window.salaries || [];
    
    // تحميل بيانات الموظفين من التخزين المحلي
    try {
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
            window.employees = JSON.parse(savedEmployees);
            console.log(`تم تحميل ${window.employees.length} موظف`);
        }
        
        const savedSalaries = localStorage.getItem('salaries');
        if (savedSalaries) {
            window.salaries = JSON.parse(savedSalaries);
            console.log(`تم تحميل ${window.salaries.length} سجل راتب`);
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات الموظفين:', error);
        window.employees = [];
        window.salaries = [];
    }
    
    // ربط أحداث التنقل بين الصفحات
    const originalShowPage = window.showPage;
    window.showPage = function(pageId) {
        // استدعاء الدالة الأصلية
        originalShowPage(pageId);
        
        // الوظائف الإضافية لصفحة الموظفين
        if (pageId === 'employees') {
            console.log('تهيئة صفحة الموظفين...');
            
            // تهيئة قائمة السنوات
            initYearSelects();
            
            // عرض بيانات الموظفين
            renderEmployeesTable();
            
            // تهيئة أحداث بحث الموظفين
            setupEmployeeSearch();
            
            // تهيئة أحداث تصفية الموظفين
            setupEmployeeFilters();
            
            // تهيئة أحداث زر الإضافة
            setupAddEmployeeButton();
            
            // تهيئة أحداث كشف الرواتب
            setupPayrollEvents();
        }
    };
    
    // تعريف الدوال الوظيفية
    
    // تهيئة قائمة السنوات
    window.initYearSelects = function() {
        // الحصول على السنة الحالية
        const currentYear = new Date().getFullYear();
        
        // إنشاء قائمة بالسنوات (السنة الحالية و5 سنوات سابقة)
        const years = [];
        for (let i = 0; i < 6; i++) {
            years.push(currentYear - i);
        }
        
        // ملء قائمة السنوات في تقرير الرواتب
        const salaryYearSelect = document.getElementById('salary-year');
        if (salaryYearSelect) {
            salaryYearSelect.innerHTML = '';
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                salaryYearSelect.appendChild(option);
            });
        }
        
        // ملء قائمة السنوات في نموذج إضافة راتب
        const addSalaryYearSelect = document.getElementById('add-salary-year');
        if (addSalaryYearSelect) {
            addSalaryYearSelect.innerHTML = '';
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                addSalaryYearSelect.appendChild(option);
            });
        }
        
        // تعيين الشهر والسنة الحالية كقيم افتراضية
        const currentMonth = new Date().getMonth() + 1; // الشهور تبدأ من 0
        
        const salaryMonthSelect = document.getElementById('salary-month');
        if (salaryMonthSelect) {
            salaryMonthSelect.value = currentMonth;
        }
        
        const addSalaryMonthSelect = document.getElementById('add-salary-month');
        if (addSalaryMonthSelect) {
            addSalaryMonthSelect.value = currentMonth;
        }
    };
    
    // عرض جدول الموظفين
    window.renderEmployeesTable = function() {
        const tableBody = document.querySelector('#employees-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        // ترتيب الموظفين حسب تاريخ التعيين (الأحدث أولاً)
        const sortedEmployees = [...window.employees].sort((a, b) => {
            return new Date(b.hireDate) - new Date(a.hireDate);
        });
        
        sortedEmployees.forEach(employee => {
            const row = document.createElement('tr');
            
            // تنسيق التاريخ للعرض
            const hireDate = new Date(employee.hireDate).toLocaleDateString();
            
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>
                    <div class="employee-info">
                        <div class="employee-avatar">${employee.name.charAt(0)}</div>
                        <div>
                            <div class="employee-name">${employee.name}</div>
                            <div class="employee-email">${employee.email || employee.phone}</div>
                        </div>
                    </div>
                </td>
                <td>${employee.position}</td>
                <td>${employee.phone}</td>
                <td>${hireDate}</td>
                <td>${formatCurrency(employee.salary)}</td>
                <td><span class="badge badge-${employee.status === 'active' ? 'success' : 'danger'}">${employee.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td>
                    <div class="employee-actions">
                        <button class="employee-action-btn view-employee" data-id="${employee.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="employee-action-btn edit edit-employee" data-id="${employee.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="employee-action-btn delete delete-employee" data-id="${employee.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمعي الأحداث للأزرار
            const viewButton = row.querySelector('.view-employee');
            const editButton = row.querySelector('.edit-employee');
            const deleteButton = row.querySelector('.delete-employee');
            
            if (viewButton) {
                viewButton.addEventListener('click', () => {
                    showEmployeeDetails(employee.id);
                });
            }
            
            if (editButton) {
                editButton.addEventListener('click', () => {
                    editEmployee(employee.id);
                });
            }
            
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    deleteEmployee(employee.id);
                });
            }
        });
        
        if (sortedEmployees.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="8" class="text-center">لا يوجد موظفين</td>';
            tableBody.appendChild(emptyRow);
        }
    };
    
    // تهيئة أحداث البحث
    window.setupEmployeeSearch = function() {
        const searchInput = document.querySelector('#employees-page .search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchEmployees(this.value);
            });
        }
    };
    
    // تهيئة أحداث التصفية
    window.setupEmployeeFilters = function() {
        const filterButtons = document.querySelectorAll('#employees-page .btn-group .btn[data-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // تحديث حالة الأزرار
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // تصفية القائمة
                const filter = this.getAttribute('data-filter');
                filterEmployees(filter);
            });
        });
    };
    
    // تهيئة زر إضافة موظف
    window.setupAddEmployeeButton = function() {
        const addEmployeeBtn = document.getElementById('add-employee-btn');
        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', () => {
                // إعادة تعيين النموذج
                document.getElementById('add-employee-form').reset();
                
                // تعيين تاريخ اليوم كتاريخ افتراضي للتعيين
                document.getElementById('employee-hire-date').value = new Date().toISOString().split('T')[0];
                
                // تغيير عنوان النافذة
                const modalTitle = document.querySelector('#add-employee-modal .modal-title');
                if (modalTitle) {
                    modalTitle.textContent = 'إضافة موظف جديد';
                }
                
                // تغيير نص زر الحفظ
                const saveBtn = document.getElementById('save-employee-btn');
                if (saveBtn) {
                    saveBtn.textContent = 'إضافة';
                    saveBtn.onclick = addNewEmployee;
                }
                
                // فتح النافذة
                openModal('add-employee-modal');
            });
        }
        
        // إضافة مستمع الحدث لزر حفظ الموظف
        const saveEmployeeBtn = document.getElementById('save-employee-btn');
        if (saveEmployeeBtn) {
            saveEmployeeBtn.addEventListener('click', addNewEmployee);
        }
    };
    
    // تهيئة أحداث كشف الرواتب
    window.setupPayrollEvents = function() {
        // زر إنشاء كشف الرواتب
        const generatePayrollBtn = document.getElementById('generate-payroll-btn');
        if (generatePayrollBtn) {
            generatePayrollBtn.addEventListener('click', generatePayroll);
        }
        
        // زر تصدير كشف الرواتب
        const exportPayrollBtn = document.getElementById('export-payroll-btn');
        if (exportPayrollBtn) {
            exportPayrollBtn.addEventListener('click', exportPayroll);
        }
        
        // مستمع تغيير قيمة المبيعات
        const salesAmountInput = document.getElementById('salary-sales-amount');
        if (salesAmountInput) {
            salesAmountInput.addEventListener('input', calculateCommission);
        }
        
        // مستمع تغيير البدلات والاستقطاعات
        const allowanceInput = document.getElementById('salary-allowance');
        const deductionInput = document.getElementById('salary-deduction');
        
        if (allowanceInput) {
            allowanceInput.addEventListener('input', calculateNetSalary);
        }
        
        if (deductionInput) {
            deductionInput.addEventListener('input', calculateNetSalary);
        }
        
        // زر حفظ الراتب
        const saveSalaryBtn = document.getElementById('save-salary-btn');
        if (saveSalaryBtn) {
            saveSalaryBtn.addEventListener('click', saveEmployeeSalary);
        }
    };
    
    // إضافة الدوال الضرورية لنظام الموظفين
    import('./employees.js')
        .then(module => {
            console.log('تم استيراد ملف وظائف الموظفين بنجاح');
        })
        .catch(error => {
            console.error('خطأ في تحميل ملف وظائف الموظفين:', error);
            // استخدام النسخة الاحتياطية من الدوال
            implementEmployeesFunctions();
        });
}

/**
 * تنفيذ الدوال الضرورية لنظام الموظفين (نسخة احتياطية)
 */
function implementEmployeesFunctions() {
    console.log('تنفيذ النسخة الاحتياطية من دوال نظام الموظفين...');
    
    // إضافة موظف جديد
    window.addNewEmployee = function() {
        console.log('إضافة موظف جديد...');
        
        // الحصول على قيم النموذج
        const name = document.getElementById('employee-name').value;
        const phone = document.getElementById('employee-phone').value;
        const address = document.getElementById('employee-address').value;
        const email = document.getElementById('employee-email').value;
        const idNumber = document.getElementById('employee-id-number').value;
        const hireDate = document.getElementById('employee-hire-date').value;
        const position = document.getElementById('employee-position').value;
        const department = document.getElementById('employee-department').value;
        const salary = parseFloat(document.getElementById('employee-salary').value);
        const commissionRate = parseFloat(document.getElementById('employee-commission-rate').value) || 0;
        const allowance = parseFloat(document.getElementById('employee-allowance').value) || 0;
        const status = document.getElementById('employee-status').value;
        
        // التحقق من إدخال البيانات الإلزامية
        if (!name || !phone || !idNumber || !hireDate || !position || !department || isNaN(salary)) {
            showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
            return;
        }
        
        // إنشاء موظف جديد
        const newEmployee = {
            id: Date.now().toString(),
            name,
            phone,
            address,
            email,
            idNumber,
            hireDate,
            position,
            department,
            salary,
            commissionRate,
            allowance,
            status,
            createdAt: new Date().toISOString()
        };
        
        // إضافة الموظف إلى المصفوفة
        window.employees.push(newEmployee);
        
        // حفظ البيانات
        saveEmployeesData();
        
        // تحديث العرض
        renderEmployeesTable();
        
        // إغلاق النافذة المنبثقة
        closeModal('add-employee-modal');
        
        // عرض إشعار
        showNotification(`تمت إضافة الموظف ${name} بنجاح!`, 'success');
    };
    
    // البحث في الموظفين
    window.searchEmployees = function(query) {
        console.log(`البحث عن الموظفين: ${query}`);
        
        query = query.trim().toLowerCase();
        
        if (!query) {
            // إذا كان البحث فارغًا، نعيد عرض جميع الموظفين
            renderEmployeesTable();
            return;
        }
        
        // تصفية الموظفين حسب البحث
        const filtered = window.employees.filter(employee => {
            return employee.name.toLowerCase().includes(query) ||
                   employee.phone.toLowerCase().includes(query) ||
                   (employee.email && employee.email.toLowerCase().includes(query)) ||
                   employee.position.toLowerCase().includes(query) ||
                   employee.department.toLowerCase().includes(query) ||
                   employee.id.toLowerCase().includes(query);
        });
        
        // عرض النتائج المصفاة
        const tableBody = document.querySelector('#employees-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (filtered.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="8" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // عرض الموظفين المصفاة
        filtered.forEach(employee => {
            const row = document.createElement('tr');
            
            // تنسيق التاريخ للعرض
            const hireDate = new Date(employee.hireDate).toLocaleDateString();
            
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>
                    <div class="employee-info">
                        <div class="employee-avatar">${employee.name.charAt(0)}</div>
                        <div>
                            <div class="employee-name">${employee.name}</div>
                            <div class="employee-email">${employee.email || employee.phone}</div>
                        </div>
                    </div>
                </td>
                
                <td>${employee.position}</td>
                <td>${employee.phone}</td>
                <td>${hireDate}</td>
                <td>${formatCurrency(employee.salary)}</td>
                <td><span class="badge badge-${employee.status === 'active' ? 'success' : 'danger'}">${employee.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td>
                    <div class="employee-actions">
                        <button class="employee-action-btn view-employee" data-id="${employee.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="employee-action-btn edit edit-employee" data-id="${employee.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="employee-action-btn delete delete-employee" data-id="${employee.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمعي الأحداث للأزرار
            const viewButton = row.querySelector('.view-employee');
            const editButton = row.querySelector('.edit-employee');
            const deleteButton = row.querySelector('.delete-employee');
            
            if (viewButton) {
                viewButton.addEventListener('click', () => {
                    showEmployeeDetails(employee.id);
                });
            }
            
            if (editButton) {
                editButton.addEventListener('click', () => {
                    editEmployee(employee.id);
                });
            }
            
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    deleteEmployee(employee.id);
                });
            }
        });
    };
    
    // تصفية الموظفين
    window.filterEmployees = function(filter) {
        console.log(`تصفية الموظفين: ${filter}`);
        
        // تصفية الموظفين
        let filteredEmployees = [...window.employees];
        
        if (filter === 'active') {
            filteredEmployees = filteredEmployees.filter(emp => emp.status === 'active');
        } else if (filter === 'inactive') {
            filteredEmployees = filteredEmployees.filter(emp => emp.status === 'inactive');
        }
        
        // عرض النتائج المصفاة
        const tableBody = document.querySelector('#employees-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (filteredEmployees.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="8" class="text-center">لا يوجد موظفين مطابقين للتصفية</td>';
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // ترتيب الموظفين حسب تاريخ التعيين (الأحدث أولاً)
        filteredEmployees.sort((a, b) => new Date(b.hireDate) - new Date(a.hireDate));
        
        // عرض الموظفين المصفاة
        filteredEmployees.forEach(employee => {
            const row = document.createElement('tr');
            
            // تنسيق التاريخ للعرض
            const hireDate = new Date(employee.hireDate).toLocaleDateString();
            
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>
                    <div class="employee-info">
                        <div class="employee-avatar">${employee.name.charAt(0)}</div>
                        <div>
                            <div class="employee-name">${employee.name}</div>
                            <div class="employee-email">${employee.email || employee.phone}</div>
                        </div>
                    </div>
                </td>
                <td>${employee.position}</td>
                <td>${employee.phone}</td>
                <td>${hireDate}</td>
                <td>${formatCurrency(employee.salary)}</td>
                <td><span class="badge badge-${employee.status === 'active' ? 'success' : 'danger'}">${employee.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td>
                    <div class="employee-actions">
                        <button class="employee-action-btn view-employee" data-id="${employee.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="employee-action-btn edit edit-employee" data-id="${employee.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="employee-action-btn delete delete-employee" data-id="${employee.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمعي الأحداث للأزرار
            const viewButton = row.querySelector('.view-employee');
            const editButton = row.querySelector('.edit-employee');
            const deleteButton = row.querySelector('.delete-employee');
            
            if (viewButton) {
                viewButton.addEventListener('click', () => {
                    showEmployeeDetails(employee.id);
                });
            }
            
            if (editButton) {
                editButton.addEventListener('click', () => {
                    editEmployee(employee.id);
                });
            }
            
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    deleteEmployee(employee.id);
                });
            }
        });
    };
    
    // عرض تفاصيل الموظف
    window.showEmployeeDetails = function(employeeId) {
        console.log(`عرض تفاصيل الموظف: ${employeeId}`);
        
        const employee = window.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            showNotification('لم يتم العثور على الموظف', 'error');
            return;
        }
        
        // الحصول على تاريخ التوظيف كتاريخ
        const hireDate = new Date(employee.hireDate);
        const today = new Date();
        const employmentDuration = Math.floor((today - hireDate) / (1000 * 60 * 60 * 24 * 30)); // بالأشهر
        
        // الحصول على رواتب الموظف
        const employeeSalaries = window.salaries.filter(salary => salary.employeeId === employeeId);
        
        // حساب الإحصائيات
        const totalSalaries = employeeSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);
        const averageSalary = employeeSalaries.length > 0 ? totalSalaries / employeeSalaries.length : 0;
        const lastSalary = employeeSalaries.length > 0 ? 
            employeeSalaries.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
        
        // إنشاء محتوى التفاصيل
        const content = `
            <div class="employee-profile">
                <div class="employee-avatar large">${employee.name.charAt(0)}</div>
                <h2 class="employee-fullname">${employee.name}</h2>
                <span class="badge badge-${employee.status === 'active' ? 'success' : 'danger'}">
                    ${employee.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
                <div class="employee-position">${employee.position} - ${employee.department}</div>
            </div>
            
            <div class="employee-stats">
                <div class="stat-item">
                    <div class="stat-value">${employmentDuration}</div>
                    <div class="stat-label">أشهر الخدمة</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${formatCurrency(employee.salary)}</div>
                    <div class="stat-label">الراتب الأساسي</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${employee.commissionRate}%</div>
                    <div class="stat-label">نسبة العمولة</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${formatCurrency(employee.allowance)}</div>
                    <div class="stat-label">البدلات</div>
                </div>
            </div>
            
            <div class="detail-group">
                <h3 class="detail-group-title">معلومات الاتصال</h3>
                <div class="detail-item">
                    <div class="detail-label">رقم الهاتف</div>
                    <div class="detail-value">${employee.phone}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">البريد الإلكتروني</div>
                    <div class="detail-value">${employee.email || 'غير محدد'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">العنوان</div>
                    <div class="detail-value">${employee.address || 'غير محدد'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">رقم الهوية</div>
                    <div class="detail-value">${employee.idNumber}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">تاريخ التعيين</div>
                    <div class="detail-value">${new Date(employee.hireDate).toLocaleDateString()}</div>
                </div>
            </div>
            
            <div class="detail-group">
                <h3 class="detail-group-title">إحصائيات الرواتب</h3>
                <div class="detail-item">
                    <div class="detail-label">عدد الرواتب المدفوعة</div>
                    <div class="detail-value">${employeeSalaries.length}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">إجمالي الرواتب المدفوعة</div>
                    <div class="detail-value">${formatCurrency(totalSalaries)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">متوسط الراتب</div>
                    <div class="detail-value">${formatCurrency(averageSalary)}</div>
                </div>
                ${lastSalary ? `
                <div class="detail-item">
                    <div class="detail-label">آخر راتب</div>
                    <div class="detail-value">${formatCurrency(lastSalary.netSalary)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">تاريخ آخر راتب</div>
                    <div class="detail-value">${new Date(lastSalary.date).toLocaleDateString()}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="detail-group">
                <h3 class="detail-group-title">آخر الرواتب</h3>
                <div class="mini-table-container">
                    <table class="mini-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>الشهر/السنة</th>
                                <th>صافي الراتب</th>
                                <th>العمولة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employeeSalaries.length > 0 ? 
                                employeeSalaries.slice(0, 5).map(salary => `
                                    <tr>
                                        <td>${new Date(salary.date).toLocaleDateString()}</td>
                                        <td>${getMonthName(salary.month)}/${salary.year}</td>
                                        <td>${formatCurrency(salary.netSalary)}</td>
                                        <td>${formatCurrency(salary.commission)}</td>
                                    </tr>
                                `).join('') : 
                                '<tr><td colspan="4">لا توجد رواتب مسجلة</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // عرض النافذة المنبثقة
        const detailsContent = document.getElementById('employee-details-content');
        if (detailsContent) {
            detailsContent.innerHTML = content;
        }
        
        // فتح النافذة المنبثقة
        openModal('employee-details-modal');
        
        // تعيين وظائف الأزرار
        const editEmployeeBtn = document.getElementById('edit-employee-btn');
        const paySalaryBtn = document.getElementById('pay-salary-btn');
        const deleteEmployeeBtn = document.getElementById('delete-employee-btn');
        
        if (editEmployeeBtn) {
            editEmployeeBtn.onclick = () => {
                closeModal('employee-details-modal');
                editEmployee(employeeId);
            };
        }
        
        if (paySalaryBtn) {
            paySalaryBtn.onclick = () => {
                closeModal('employee-details-modal');
                openSalaryModal(employeeId);
            };
        }
        
        if (deleteEmployeeBtn) {
            deleteEmployeeBtn.onclick = () => {
                closeModal('employee-details-modal');
                deleteEmployee(employeeId);
            };
        }
    };
    
    // تعديل بيانات موظف
    window.editEmployee = function(employeeId) {
        console.log(`تعديل بيانات الموظف: ${employeeId}`);
        
        const employee = window.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            showNotification('لم يتم العثور على الموظف', 'error');
            return;
        }
        
        // ملء النموذج ببيانات الموظف
        document.getElementById('employee-name').value = employee.name;
        document.getElementById('employee-phone').value = employee.phone;
        document.getElementById('employee-address').value = employee.address || '';
        document.getElementById('employee-email').value = employee.email || '';
        document.getElementById('employee-id-number').value = employee.idNumber;
        document.getElementById('employee-hire-date').value = employee.hireDate;
        document.getElementById('employee-position').value = employee.position;
        document.getElementById('employee-department').value = employee.department;
        document.getElementById('employee-salary').value = employee.salary;
        document.getElementById('employee-commission-rate').value = employee.commissionRate || 0;
        document.getElementById('employee-allowance').value = employee.allowance || 0;
        document.getElementById('employee-status').value = employee.status;
        
        // تغيير عنوان النافذة
        const modalTitle = document.querySelector('#add-employee-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'تعديل بيانات الموظف';
        }
        
        // تغيير نص زر الحفظ
        const saveBtn = document.getElementById('save-employee-btn');
        if (saveBtn) {
            saveBtn.textContent = 'حفظ التعديلات';
            
            // تغيير وظيفة زر الحفظ
            saveBtn.onclick = function() {
                // جمع البيانات المحدثة
                const updatedEmployee = {
                    ...employee,
                    name: document.getElementById('employee-name').value,
                    phone: document.getElementById('employee-phone').value,
                    address: document.getElementById('employee-address').value,
                    email: document.getElementById('employee-email').value,
                    idNumber: document.getElementById('employee-id-number').value,
                    hireDate: document.getElementById('employee-hire-date').value,
                    position: document.getElementById('employee-position').value,
                    department: document.getElementById('employee-department').value,
                    salary: parseFloat(document.getElementById('employee-salary').value),
                    commissionRate: parseFloat(document.getElementById('employee-commission-rate').value) || 0,
                    allowance: parseFloat(document.getElementById('employee-allowance').value) || 0,
                    status: document.getElementById('employee-status').value
                };
                
                // تحديث بيانات الموظف
                const index = window.employees.findIndex(emp => emp.id === employeeId);
                if (index !== -1) {
                    window.employees[index] = updatedEmployee;
                    
                    // حفظ البيانات
                    saveEmployeesData();
                    
                    // تحديث العرض
                    renderEmployeesTable();
                    
                    // إغلاق النافذة المنبثقة
                    closeModal('add-employee-modal');
                    
                    // عرض إشعار
                    showNotification(`تم تحديث بيانات الموظف ${updatedEmployee.name} بنجاح!`, 'success');
                }
                
                // استعادة الإعدادات الافتراضية للنافذة
                if (modalTitle) {
                    modalTitle.textContent = 'إضافة موظف جديد';
                }
                
                saveBtn.textContent = 'إضافة';
                saveBtn.onclick = addNewEmployee;
            };
        }
        
        // فتح النافذة المنبثقة
        openModal('add-employee-modal');
    };
    
    // حذف موظف
    window.deleteEmployee = function(employeeId) {
        console.log(`حذف الموظف: ${employeeId}`);
        
        const employee = window.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            showNotification('لم يتم العثور على الموظف', 'error');
            return;
        }
        
        // طلب تأكيد الحذف
        if (!confirm(`هل أنت متأكد من رغبتك في حذف الموظف ${employee.name}؟\nسيتم حذف جميع البيانات المتعلقة به.`)) {
            return;
        }
        
        // حذف الموظف
        window.employees = window.employees.filter(emp => emp.id !== employeeId);
        
        // حذف رواتب الموظف
        window.salaries = window.salaries.filter(salary => salary.employeeId !== employeeId);
        
        // حفظ البيانات
        saveEmployeesData();
        
        // تحديث العرض
        renderEmployeesTable();
        
        // عرض إشعار
        showNotification(`تم حذف الموظف ${employee.name} بنجاح`, 'success');
    };
    
    // فتح نافذة إضافة راتب
    window.openSalaryModal = function(employeeId) {
        console.log(`فتح نافذة إضافة راتب للموظف: ${employeeId}`);
        
        const employee = window.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            showNotification('لم يتم العثور على الموظف', 'error');
            return;
        }
        
        // تعيين قيم النموذج
        document.getElementById('salary-employee-id').value = employee.id;
        document.getElementById('salary-employee-name').value = employee.name;
        document.getElementById('salary-base').value = employee.salary;
        document.getElementById('salary-commission-rate').value = employee.commissionRate || 0;
        document.getElementById('salary-allowance').value = employee.allowance || 0;
        document.getElementById('salary-sales-amount').value = 0;
        document.getElementById('salary-deduction').value = 0;
        
        // حساب العمولة وصافي الراتب
        calculateCommission();
        
        // فتح النافذة المنبثقة
        openModal('add-salary-modal');
    };
    
  // حساب العمولة بناءً على المبيعات ونسبة العمولة
window.calculateCommission = function() {
    const salesAmount = parseFloat(document.getElementById('salary-sales-amount').value) || 0;
    const commissionRate = parseFloat(document.getElementById('salary-commission-rate').value) || 0;
    
    // حساب مبلغ العمولة
    const commissionAmount = salesAmount * (commissionRate / 100);
    
    // تعيين مبلغ العمولة
    const commissionAmountInput = document.getElementById('salary-commission-amount');
    if (commissionAmountInput) {
        commissionAmountInput.value = commissionAmount;
    }
    
    // حساب صافي الراتب
    calculateNetSalary();
};

// حساب صافي الراتب
window.calculateNetSalary = function() {
    const baseSalary = parseFloat(document.getElementById('salary-base').value) || 0;
    const commissionAmount = parseFloat(document.getElementById('salary-commission-amount').value) || 0;
    const allowance = parseFloat(document.getElementById('salary-allowance').value) || 0;
    const deduction = parseFloat(document.getElementById('salary-deduction').value) || 0;
    
    // حساب صافي الراتب
    const netSalary = baseSalary + commissionAmount + allowance - deduction;
    
    // تعيين صافي الراتب
    const netSalaryInput = document.getElementById('salary-net');
    if (netSalaryInput) {
        netSalaryInput.value = netSalary;
    }
};

// عرض تفاصيل الراتب
window.showSalaryDetails = function(salaryId) {
    console.log(`عرض تفاصيل الراتب: ${salaryId}`);
    
    // البحث عن الراتب
    const salary = window.salaries.find(s => s.id === salaryId);
    if (!salary) {
        showNotification('لم يتم العثور على الراتب', 'error');
        return;
    }
    
    // البحث عن الموظف
    const employee = window.employees.find(emp => emp.id === salary.employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // إنشاء محتوى التفاصيل
    const content = `
        <div class="salary-details">
            <div class="salary-header">
                <h3 class="salary-title">راتب شهر ${getMonthName(salary.month)} ${salary.year}</h3>
                <div class="salary-date">تاريخ الصرف: ${new Date(salary.date).toLocaleDateString()}</div>
            </div>
            
            <div class="employee-info">
                <div class="employee-avatar">${employee.name.charAt(0)}</div>
                <div class="employee-details">
                    <div class="employee-name">${employee.name}</div>
                    <div class="employee-position">${employee.position} - ${employee.department}</div>
                </div>
            </div>
            
            <div class="salary-components">
                <div class="component-group">
                    <h4 class="component-group-title">المستحقات</h4>
                    <div class="salary-component">
                        <div class="component-name">الراتب الأساسي</div>
                        <div class="component-value">${formatCurrency(salary.baseSalary)}</div>
                    </div>
                    <div class="salary-component">
                        <div class="component-name">عمولة المبيعات (${salary.commissionRate}%)</div>
                        <div class="component-value">${formatCurrency(salary.commission)}</div>
                    </div>
                    <div class="salary-component">
                        <div class="component-name">البدلات</div>
                        <div class="component-value">${formatCurrency(salary.allowance)}</div>
                    </div>
                    <div class="salary-component total">
                        <div class="component-name">إجمالي المستحقات</div>
                        <div class="component-value">${formatCurrency(salary.baseSalary + salary.commission + salary.allowance)}</div>
                    </div>
                </div>
                
                <div class="component-group">
                    <h4 class="component-group-title">الاستقطاعات</h4>
                    <div class="salary-component">
                        <div class="component-name">الاستقطاعات</div>
                        <div class="component-value">${formatCurrency(salary.deduction)}</div>
                    </div>
                    <div class="salary-component total">
                        <div class="component-name">إجمالي الاستقطاعات</div>
                        <div class="component-value">${formatCurrency(salary.deduction)}</div>
                    </div>
                </div>
            </div>
            
            <div class="salary-summary">
                <div class="summary-label">صافي الراتب:</div>
                <div class="summary-value">${formatCurrency(salary.netSalary)}</div>
            </div>
            
            ${salary.notes ? `
            <div class="salary-notes">
                <div class="notes-label">ملاحظات:</div>
                <div class="notes-content">${salary.notes}</div>
            </div>
            ` : ''}
        </div>
    `;
    
    // عرض النافذة المنبثقة
    const detailsContent = document.getElementById('salary-details-content');
    if (detailsContent) {
        detailsContent.innerHTML = content;
    }
    
    // فتح النافذة المنبثقة
    openModal('salary-details-modal');
    
    // تعيين وظيفة زر الطباعة
    const printSalaryBtn = document.getElementById('print-salary-btn');
    if (printSalaryBtn) {
        printSalaryBtn.onclick = () => printSalaryDetails(salary, employee);
    }
};

// طباعة تفاصيل الراتب
window.printSalaryDetails = function(salary, employee) {
    console.log('طباعة تفاصيل الراتب...');
    
    // إنشاء نافذة الطباعة
    const printWindow = window.open('', '', 'width=800,height=600');
    
    // إنشاء محتوى صفحة الطباعة
    const printContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>راتب ${employee.name} - ${getMonthName(salary.month)} ${salary.year}</title>
            <style>
                @page {
                    size: A4;
                    margin: 1cm;
                }
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: #fff;
                    margin: 0;
                    padding: 20px;
                    direction: rtl;
                }
                .salary-slip {
                    border: 1px solid #ccc;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .title {
                    font-size: 18px;
                    margin-bottom: 5px;
                }
                .subtitle {
                    font-size: 14px;
                    color: #666;
                }
                .employee-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
                .employee-details, .salary-details {
                    flex: 1;
                }
                .info-row {
                    margin-bottom: 5px;
                }
                .label {
                    font-weight: bold;
                    margin-left: 10px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    padding: 10px;
                    text-align: right;
                    border: 1px solid #ddd;
                }
                th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .total-row {
                    font-weight: bold;
                }
                .net-salary {
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                    margin-top: 20px;
                    padding: 10px;
                    border: 2px solid #333;
                }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                }
                .signature {
                    flex: 1;
                    text-align: center;
                }
                .sign-label {
                    margin-bottom: 30px;
                }
                .sign-line {
                    border-top: 1px solid #333;
                    width: 150px;
                    margin: 0 auto;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="salary-slip">
                <div class="header">
                    <div class="logo">نظام الاستثمار المتكامل</div>
                    <div class="title">إيصال راتب</div>
                    <div class="subtitle">شهر ${getMonthName(salary.month)} ${salary.year}</div>
                </div>
                
                <div class="employee-info">
                    <div class="employee-details">
                        <div class="info-row"><span class="label">اسم الموظف:</span> ${employee.name}</div>
                        <div class="info-row"><span class="label">رقم الموظف:</span> ${employee.id}</div>
                        <div class="info-row"><span class="label">المسمى الوظيفي:</span> ${employee.position}</div>
                        <div class="info-row"><span class="label">القسم:</span> ${employee.department}</div>
                    </div>
                    <div class="salary-details">
                        <div class="info-row"><span class="label">تاريخ الصرف:</span> ${new Date(salary.date).toLocaleDateString()}</div>
                        <div class="info-row"><span class="label">تاريخ التعيين:</span> ${new Date(employee.hireDate).toLocaleDateString()}</div>
                        <div class="info-row"><span class="label">رقم الهاتف:</span> ${employee.phone}</div>
                        <div class="info-row"><span class="label">البريد الإلكتروني:</span> ${employee.email || '-'}</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th colspan="2">المستحقات</th>
                            <th colspan="2">الاستقطاعات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>الراتب الأساسي</td>
                            <td>${formatCurrency(salary.baseSalary)}</td>
                            <td>الاستقطاعات</td>
                            <td>${formatCurrency(salary.deduction)}</td>
                        </tr>
                        <tr>
                            <td>عمولة المبيعات (${salary.commissionRate}%)</td>
                            <td>${formatCurrency(salary.commission)}</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>البدلات</td>
                            <td>${formatCurrency(salary.allowance)}</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr class="total-row">
                            <td>إجمالي المستحقات</td>
                            <td>${formatCurrency(salary.baseSalary + salary.commission + salary.allowance)}</td>
                            <td>إجمالي الاستقطاعات</td>
                            <td>${formatCurrency(salary.deduction)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="net-salary">
                    صافي الراتب: ${formatCurrency(salary.netSalary)}
                </div>
                
                ${salary.notes ? `
                <div style="margin-top: 20px;">
                    <strong>ملاحظات:</strong>
                    <p>${salary.notes}</p>
                </div>
                ` : ''}
                
                <div class="signatures">
                    <div class="signature">
                        <div class="sign-label">توقيع المدير</div>
                        <div class="sign-line"></div>
                    </div>
                    <div class="signature">
                        <div class="sign-label">توقيع الموظف</div>
                        <div class="sign-line"></div>
                    </div>
                </div>
                
                <div class="footer">
                    تم إنشاء هذا الإيصال بواسطة نظام إدارة الموظفين - ${new Date().toLocaleDateString()}
                </div>
            </div>
        </body>
        </html>
    `;
    
    // كتابة المحتوى في نافذة الطباعة
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // انتظار تحميل الصفحة ثم طباعتها
    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };
};

// تصدير كشف الرواتب
window.exportPayroll = function() {
    console.log('تصدير كشف الرواتب...');
    
    // الحصول على الشهر والسنة المحددة
    const month = parseInt(document.getElementById('salary-month').value);
    const year = parseInt(document.getElementById('salary-year').value);
    
    // الحصول على رواتب الشهر المحدد
    const monthSalaries = window.salaries.filter(salary => salary.month === month && salary.year === year);
    
    if (monthSalaries.length === 0) {
        showNotification('لا توجد رواتب للتصدير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عناوين الأعمدة
    const headers = [
        'المعرف', 'الموظف', 'المسمى الوظيفي', 'القسم', 'الراتب الأساسي', 'نسبة العمولة',
        'قيمة المبيعات', 'مبلغ العمولة', 'البدلات', 'الاستقطاعات', 'صافي الراتب'
    ];
    csvRows.push(headers.join(','));
    
    // إضافة الصفوف
    monthSalaries.forEach(salary => {
        const employee = window.employees.find(emp => emp.id === salary.employeeId);
        
        if (employee) {
            const row = [
                salary.employeeId,
                salary.employeeName,
                employee.position,
                employee.department,
                salary.baseSalary,
                salary.commissionRate,
                salary.salesAmount,
                salary.commission,
                salary.allowance,
                salary.deduction,
                salary.netSalary
            ];
            
            // تنظيف القيم للتصدير CSV
            const cleanedRow = row.map(value => {
                // إذا كانت القيمة تحتوي على فواصل، نضعها بين علامات اقتباس
                value = String(value).replace(/"/g, '""');
                return value.includes(',') ? `"${value}"` : value;
            });
            
            csvRows.push(cleanedRow.join(','));
        }
    });
    
    // إضافة صف المجاميع
    const totalRow = [
        '99999', // معرف خاص للمجموع
        'المجموع', // اسم المجموع
        '', // المسمى الوظيفي
        '', // القسم
        // حساب المجاميع
        monthSalaries.reduce((sum, salary) => sum + salary.baseSalary, 0),
        '', // نسبة العمولة
        monthSalaries.reduce((sum, salary) => sum + salary.salesAmount, 0),
        monthSalaries.reduce((sum, salary) => sum + salary.commission, 0),
        monthSalaries.reduce((sum, salary) => sum + salary.allowance, 0),
        monthSalaries.reduce((sum, salary) => sum + salary.deduction, 0),
        monthSalaries.reduce((sum, salary) => sum + salary.netSalary, 0)
    ];
    
    // تنظيف قيم المجموع للتصدير CSV
    const cleanedTotalRow = totalRow.map(value => {
        value = String(value).replace(/"/g, '""');
        return value.includes(',') ? `"${value}"` : value;
    });
    
    csvRows.push(cleanedTotalRow.join(','));
    
    // إنشاء ملف CSV
    const csvContent = csvRows.join('\n');
    
    // إنشاء Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // إنشاء رابط التنزيل
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `كشف_رواتب_${getMonthName(month)}_${year}.csv`;
    
    // إضافة الرابط وتنفيذ النقر
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    document.body.removeChild(link);
    
    showNotification(`تم تصدير كشف رواتب ${getMonthName(month)} ${year} بنجاح`, 'success');
};

// حفظ بيانات الموظفين
window.saveEmployeesData = function() {
    try {
        localStorage.setItem('employees', JSON.stringify(window.employees));
        localStorage.setItem('salaries', JSON.stringify(window.salaries));
        console.log('تم حفظ بيانات الموظفين بنجاح');
        return true;
    } catch (error) {
        console.error('خطأ في حفظ بيانات الموظفين:', error);
        showNotification('حدث خطأ أثناء حفظ البيانات', 'error');
        return false;
    }
};

// الحصول على اسم الشهر بالعربية
window.getMonthName = function(month) {
    const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    // تحويل الشهر إلى رقم من 0 إلى 11
    const monthIndex = parseInt(month) - 1;
    
    // التحقق من صحة الرقم
    if (monthIndex >= 0 && monthIndex < 12) {
        return months[monthIndex];
    }
    
    return 'غير معروف';
};

// إضافة أنماط CSS لصفحة الموظفين
function addEmployeesStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('employees-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'employees-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* أنماط صفحة الموظفين */
        #employees-page .employee-info {
            display: flex;
            align-items: center;
        }
        
        #employees-page .employee-avatar {
            width: 36px;
            height: 36px;
            background-color: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-left: 10px;
            font-size: 16px;
        }
        
        #employees-page .employee-avatar.large {
            width: 64px;
            height: 64px;
            font-size: 28px;
            margin: 0 auto 16px;
        }
        
        #employees-page .employee-name {
            font-weight: 600;
            margin-bottom: 2px;
        }
        
        #employees-page .employee-email,
        #employees-page .employee-phone {
            font-size: 0.85rem;
            color: #666;
        }
        
        #employees-page .employee-actions {
            display: flex;
            gap: 5px;
        }
        
        #employees-page .employee-action-btn {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            border: 1px solid #ddd;
            background-color: white;
            color: #555;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        #employees-page .employee-action-btn:hover {
            background-color: #f5f5f5;
        }
        
        #employees-page .employee-action-btn.view-employee:hover {
            background-color: #e3f2fd;
            color: #1976d2;
            border-color: #1976d2;
        }
        
        #employees-page .employee-action-btn.edit:hover {
            background-color: #e8f5e9;
            color: #2e7d32;
            border-color: #2e7d32;
        }
        
        #employees-page .employee-action-btn.delete:hover {
            background-color: #ffebee;
            color: #c62828;
            border-color: #c62828;
        }
        
        /* أنماط الملف الشخصي */
        #employees-page .employee-profile {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #eee;
        }
        
        #employees-page .employee-fullname {
            font-size: 1.5rem;
            margin: 8px 0;
        }
        
        #employees-page .employee-position {
            color: #666;
            font-size: 0.9rem;
        }
        
        #employees-page .employee-stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }
        
        #employees-page .stat-item {
            flex: 1;
            text-align: center;
            padding: 12px;
            background-color: #f9f9f9;
            border-radius: 8px;
            min-width: 120px;
            margin: 0 5px 10px;
        }
        
        #employees-page .stat-value {
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 4px;
        }
        
        #employees-page .stat-label {
            font-size: 0.8rem;
            color: #666;
        }
        
        /* أنماط كشف الرواتب */
        #employees-page #payroll-table tr.no-salary {
            background-color: #f9f9f9;
        }
        
        #employees-page #payroll-table tfoot td {
            font-weight: bold;
            background-color: #f5f5f5;
        }
        
        /* أنماط تفاصيل الراتب */
        #salary-details-content .salary-header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        #salary-details-content .salary-title {
            font-size: 1.3rem;
            margin-bottom: 5px;
        }
        
        #salary-details-content .salary-date {
            color: #666;
            font-size: 0.9rem;
        }
        
        #salary-details-content .employee-info {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        #salary-details-content .employee-details {
            margin-right: 10px;
        }
        
        #salary-details-content .salary-components {
            display: flex;
            margin: 20px 0;
            gap: 20px;
        }
        
        #salary-details-content .component-group {
            flex: 1;
            padding: 0 10px;
        }
        
        #salary-details-content .component-group-title {
            font-size: 1.1rem;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }
        
        #salary-details-content .salary-component {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
        }
        
        #salary-details-content .salary-component.total {
            font-weight: bold;
            border-top: 1px solid #eee;
            padding-top: 10px;
            margin-top: 5px;
        }
        
        #salary-details-content .salary-summary {
            display: flex;
            justify-content: space-between;
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            font-size: 1.2rem;
            font-weight: bold;
            margin-top: 20px;
        }
        
        #salary-details-content .salary-notes {
            margin-top: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        
        #salary-details-content .notes-label {
            font-weight: bold;
            margin-bottom: 5px;
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للموظفين');
}

// التأكد من إضافة أنماط CSS الموظفين عند تحميل صفحة الموظفين
document.addEventListener('page:change', function(e) {
    if (e.detail.page === 'employees') {
        addEmployeesStyles();
    }
});

// إضافة أنماط CSS عند تحميل الصفحة
addEmployeesStyles();

// تصدير الدوال لاستخدامها في ملفات أخرى
export {
    addEmployeesStyles,
    calculateCommission,
    calculateNetSalary,
    showSalaryDetails,
    printSalaryDetails,
    exportPayroll,
    saveEmployeesData,
    getMonthName
};