/**
 * employees-menu-fix.js
 * هذا الملف يقوم بإصلاح مشكلة عرض عناصر القائمة الجانبية للموظفين والأقساط
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('جاري تهيئة إصلاح قائمة الموظفين والأقساط...');
    
    // إضافة نظام الموظفين والأقساط للقائمة الجانبية
    addEmployeesMenuItems();
    
    // ربط زر الموظفين الموجود للتنقل
    setupEmployeesButton();
});

// إضافة عناصر القائمة الجانبية للموظفين والأقساط
function addEmployeesMenuItems() {
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
    
    // إضافة عنصر تقارير الموظفين
    const employeeReportsItem = document.createElement('li');
    employeeReportsItem.className = 'nav-item';
    employeeReportsItem.innerHTML = `
        <a class="nav-link" data-page="employee-reports" href="#">
            <div class="nav-icon">
                <i class="fas fa-chart-line"></i>
            </div>
            <span>تقارير الموظفين</span>
        </a>
    `;
    
    // إضافة العناصر للقائمة مباشرة قبل عنصر الإعدادات
    const settingsItem = document.querySelector('.nav-link[data-page="settings"]').parentElement;
    
    if (settingsItem) {
        navList.insertBefore(employeesItem, settingsItem);
        navList.insertBefore(salariesItem, settingsItem);
        navList.insertBefore(installmentsItem, settingsItem);
        navList.insertBefore(employeeReportsItem, settingsItem);
        
        console.log('تمت إضافة عناصر القائمة الجانبية للموظفين والأقساط بنجاح');
        
        // إضافة مستمعي الأحداث للتنقل
        setupEmployeesNavigation();
    } else {
        console.error('لم يتم العثور على عنصر الإعدادات في القائمة');
    }
}

// إعداد مستمعي الأحداث للتنقل بين صفحات الموظفين
function setupEmployeesNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-page^="employee"], .nav-link[data-page="salaries"], .nav-link[data-page="installments"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const pageId = this.getAttribute('data-page');
            
            // إخفاء جميع الصفحات
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // إظهار الصفحة المطلوبة
            const targetPage = document.getElementById(`${pageId}-page`);
            if (targetPage) {
                targetPage.classList.add('active');
                
                // تنشيط نظام الموظفين والأقساط إذا لم يكن نشطًا بالفعل
                if (typeof window.EmployeeSystem !== 'undefined') {
                    // تحديث العرض حسب الصفحة المطلوبة
                    if (pageId === 'employees' && typeof window.EmployeeSystem.renderEmployeesTable === 'function') {
                        window.EmployeeSystem.renderEmployeesTable();
                    } else if (pageId === 'salaries' && typeof window.EmployeeSystem.renderSalariesTable === 'function') {
                        window.EmployeeSystem.renderSalariesTable();
                    } else if (pageId === 'installments' && typeof window.EmployeeSystem.renderInstallmentsTable === 'function') {
                        window.EmployeeSystem.renderInstallmentsTable();
                    } else if (pageId === 'employee-reports' && typeof window.EmployeeSystem.initEmployeeCharts === 'function') {
                        window.EmployeeSystem.initEmployeeCharts();
                    }
                }
            } else {
                console.error(`لم يتم العثور على الصفحة: ${pageId}-page`);
            }
            
            // تحديث حالة التنقل
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            this.classList.add('active');
        });
    });
}

// ربط زر الموظفين الموجود للتنقل
function setupEmployeesButton() {
    const openEmployeesBtn = document.getElementById('open-employees-btn');
    
    if (openEmployeesBtn) {
        openEmployeesBtn.addEventListener('click', function() {
            // البحث عن رابط الموظفين في القائمة الجانبية وتنفيذ النقر عليه
            const employeesLink = document.querySelector('.nav-link[data-page="employees"]');
            if (employeesLink) {
                employeesLink.click();
            } else {
                console.error('لم يتم العثور على رابط الموظفين في القائمة الجانبية');
            }
        });
    }
}