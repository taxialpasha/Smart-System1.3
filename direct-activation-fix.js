/**
 * direct-activation-fix.js
 * إصلاح مباشر لمشكلة تنشيط صفحة الموظفين
 */

(function() {
    console.log('تطبيق إصلاح مباشر لتنشيط صفحة الموظفين');
    
    // تنفيذ الإصلاح عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        applyDirectFix();
        
        // أيضًا تطبيق الإصلاح بعد تأخير قصير للتأكد من تحميل جميع المكونات
        setTimeout(applyDirectFix, 500);
    });
    
    /**
     * تطبيق الإصلاح المباشر
     */
    function applyDirectFix() {
        // الحصول على جميع روابط القائمة الجانبية
        const sidebarLinks = document.querySelectorAll('.nav-link');
        
        // إضافة مستمع حدث لكل روابط القائمة
        sidebarLinks.forEach(link => {
            // إزالة جميع مستمعي الأحداث السابقة (بالاستنساخ)
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            // إضافة مستمع جديد
            newLink.addEventListener('click', function(e) {
                e.preventDefault();
                const pageName = this.getAttribute('data-page');
                
                // إخفاء جميع الصفحات وإلغاء تنشيط جميع الروابط
                document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
                document.querySelectorAll('.nav-link').forEach(navLink => navLink.classList.remove('active'));
                
                // تنشيط الرابط الحالي
                this.classList.add('active');
                
                // إذا كان الرابط هو صفحة الموظفين
                if (pageName === 'employees') {
                    console.log('تنشيط صفحة الموظفين...');
                    
                    // تنشيط صفحة الموظفين
                    const employeesPage = document.getElementById('employees-page');
                    if (employeesPage) {
                        employeesPage.classList.add('active');
                        
                        // إطلاق حدث لإخبار بقية النظام
                        document.dispatchEvent(new CustomEvent('page:change', { 
                            detail: { page: 'employees' } 
                        }));
                        
                        // تحديث جدول الموظفين
                        if (window.EmployeesModule && window.EmployeesModule.renderEmployeesTable) {
                            window.EmployeesModule.renderEmployeesTable();
                        } else if (typeof renderEmployeesTable === 'function') {
                            renderEmployeesTable();
                        }
                        
                        console.log('تم تنشيط صفحة الموظفين بنجاح');
                    } else {
                        console.error('صفحة الموظفين غير موجودة!');
                        
                        // محاولة إنشاء الصفحة
                        if (window.EmployeesModule && window.EmployeesModule.activate) {
                            window.EmployeesModule.activate();
                        } else if (typeof activateEmployeesPage === 'function') {
                            activateEmployeesPage();
                        } else {
                            console.error('لم يتم العثور على دالة تنشيط صفحة الموظفين');
                        }
                    }
                } else {
                    // تنشيط الصفحة المطلوبة
                    const page = document.getElementById(`${pageName}-page`);
                    if (page) {
                        page.classList.add('active');
                    }
                }
            });
        });
        
        console.log('تم تطبيق الإصلاح المباشر بنجاح');
    }
})();