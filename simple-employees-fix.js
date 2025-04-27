/**
 * simple-employees-fix.js
 * حل بسيط ومباشر لمشكلة عدم عرض صفحة الموظفين
 */

// هذا الملف يقوم بتصحيح مشكلة عدم ظهور صفحة الموظفين عند النقر على الرابط في القائمة الجانبية

document.addEventListener('DOMContentLoaded', function() {
    // تنفيذ الإصلاح مباشرة
    fixEmployeesSidebar();
    
    // وأيضاً بعد نصف ثانية للتأكد
    setTimeout(fixEmployeesSidebar, 500);
});

/**
 * إصلاح رابط الموظفين في القائمة الجانبية
 */
function fixEmployeesSidebar() {
    console.log('جاري تطبيق إصلاح رابط الموظفين...');
    
    // البحث عن رابط الموظفين
    const employeesLink = document.querySelector('a[data-page="employees"]');
    if (!employeesLink) {
        console.log('لم يتم العثور على رابط الموظفين بعد.');
        return;
    }
    
    // ضبط رابط الموظفين لاستخدام وظيفة النقر المباشرة
    employeesLink.onclick = function(e) {
        e.preventDefault();
        
        console.log('تم النقر على رابط الموظفين - استخدام الإصلاح المباشر');
        
        // إلغاء تنشيط جميع الروابط
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // تنشيط رابط الموظفين
        this.classList.add('active');
        
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إظهار صفحة الموظفين
        const employeesPage = document.getElementById('employees-page');
        if (employeesPage) {
            employeesPage.classList.add('active');
            console.log('تم تنشيط صفحة الموظفين بنجاح');
            
            // تحديث جدول الموظفين
            if (window.EmployeesModule && window.EmployeesModule.renderEmployeesTable) {
                window.EmployeesModule.renderEmployeesTable();
            }
        } else {
            console.error('صفحة الموظفين غير موجودة!');
            
            // إنشاء وتنشيط الصفحة إذا كانت غير موجودة
            if (window.EmployeesModule) {
                console.log('محاولة إنشاء صفحة الموظفين...');
                
                if (typeof window.EmployeesModule.addEmployeesPage === 'function') {
                    window.EmployeesModule.addEmployeesPage();
                }
                
                if (typeof window.EmployeesModule.activate === 'function') {
                    window.EmployeesModule.activate();
                    return;
                }
            }
            
            // إذا لم يتم العثور على الوحدة، عرض إشعار للمستخدم
            const notifyUser = window.showNotification || alert;
            notifyUser('حدث خطأ في تحميل صفحة الموظفين. يرجى تحديث الصفحة والمحاولة مرة أخرى.', 'error');
        }
    };
    
    console.log('تم تطبيق إصلاح رابط الموظفين بنجاح');
}

/**
 * للاختبار المباشر، أضف هذا الأمر في وحدة التحكم
 * فورًا بعد تضمين هذا الملف:
 *
 * document.querySelector('a[data-page="employees"]').click();
 */