/**
 * سكريبت الدمج النهائي لنظام إدارة الموظفين مع نظام الاستثمار المتكامل
 * 
 * كيفية دمج هذا الملف مع التطبيق الرئيسي:
 * 1. قم بحفظ هذا الملف باسم "employees-system.js" في نفس مجلد التطبيق الرئيسي
 * 2. قم بإضافة السطر التالي في ملف "index.html" قبل نهاية عنصر body:
 *    <script src="employees-system.js"></script>
 */

// تنفيذ الدمج عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('بدء دمج نظام الموظفين مع التطبيق الرئيسي...');
    
    // تهيئة البيانات
    initEmployeesData();
    
    // إضافة عنصر الموظفين إلى القائمة الجانبية
    addEmployeesNavItem();
    
    // إضافة صفحة الموظفين إلى التطبيق
    addEmployeesPage();
    
    // إضافة النوافذ المنبثقة
    addEmployeesModals();
    
    // إضافة الأنماط
    addEmployeesStyles();
    
    console.log('تم دمج نظام الموظفين بنجاح!');
});

/**
 * تهيئة بيانات الموظفين
 */
function initEmployeesData() {
    // تهيئة المتغيرات العامة
    window.employees = window.employees || [];
    window.salaries = window.salaries || [];
    
    // محاولة تحميل البيانات من التخزين المحلي
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
    
    // إضافة بيانات تجريبية إذا كانت البيانات فارغة
    if (window.employees.length === 0) {
        addSampleEmployees();
    }
}

/**
 * إضافة بيانات تجريبية للموظفين
 */
function addSampleEmployees() {
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthDate = lastMonth.toISOString().split('T')[0];
    
    // موظفين تجريبيين
    const sampleEmployees = [
        {
            id: '1000',
            name: 'أحمد محمد علي',
            phone: '0771234567',
            address: 'بغداد - الكرادة',
            email: 'ahmed@example.com',
            idNumber: 'ID12345678',
            hireDate: lastMonthDate,
            position: 'مدير المبيعات',
            department: 'المبيعات',
            salary: 1500000,
            commissionRate: 3,
            allowance: 200000,
            status: 'active',
            createdAt: lastMonthDate
        },
        {
            id: '1001',
            name: 'سارة عبد الله',
            phone: '0771234568',
            address: 'بغداد - المنصور',
            email: 'sara@example.com',
            idNumber: 'ID12345679',
            hireDate: lastMonthDate,
            position: 'محاسب',
            department: 'المالية',
            salary: 1200000,
            commissionRate: 0,
            allowance: 150000,
            status: 'active',
            createdAt: lastMonthDate
        },
        {
            id: '1002',
            name: 'محمد جاسم',
            phone: '0771234569',
            address: 'البصرة',
            email: 'mohammed@example.com',
            idNumber: 'ID12345680',
            hireDate: today,
            position: 'مندوب مبيعات',
            department: 'المبيعات',
            salary: 800000,
            commissionRate: 5,
            allowance: 100000,
            status: 'active',
            createdAt: today
        }
    ];
    
    // رواتب تجريبية
    const currentMonth = new Date().getMonth() + 1; // الشهور تبدأ من 0
    const currentYear = new Date().getFullYear();
    
    const sampleSalaries = [
        {
            id: '2000',
            employeeId: '1000',
            employeeName: 'أحمد محمد علي',
            month: currentMonth - 1 === 0 ? 12 : currentMonth - 1,
            year: currentMonth - 1 === 0 ? currentYear - 1 : currentYear,
            baseSalary: 1500000,
            commissionRate: 3,
            salesAmount: 25000000,
            commission: 750000,
            allowance: 200000,
            deduction: 50000,
            netSalary: 2400000,
            notes: 'راتب الشهر الماضي',
            date: lastMonthDate
        },
        {
            id: '2001',
            employeeId: '1001',
            employeeName: 'سارة عبد الله',
            month: currentMonth - 1 === 0 ? 12 : currentMonth - 1,
            year: currentMonth - 1 === 0 ? currentYear - 1 : currentYear,
            baseSalary: 1200000,
            commissionRate: 0,
            salesAmount: 0,
            commission: 0,
            allowance: 150000,
            deduction: 30000,
            netSalary: 1320000,
            notes: 'راتب الشهر الماضي',
            date: lastMonthDate
        }
    ];
    
    // إضافة البيانات التجريبية
    window.employees = sampleEmployees;
    window.salaries = sampleSalaries;
    
    // حفظ البيانات
    localStorage.setItem('employees', JSON.stringify(window.employees));
    localStorage.setItem('salaries', JSON.stringify(window.salaries));
    
    console.log('تمت إضافة بيانات تجريبية للموظفين');
}

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
                    <button class="btn btn-outline btn-sm export-employees-btn" title="تصدير">
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
    
    // تهيئة مستمعي الأحداث للصفحة
    initEmployeesPageEvents();
    
    console.log('تمت إضافة صفحة الموظفين إلى التطبيق');
}

