/**
 * sidebar-employees-link-fix.js
 * إصلاح مشكلة تنشيط صفحة الموظفين عند النقر على الرابط في القائمة الجانبية
 */

(function() {
    console.log('تطبيق إصلاح تنشيط صفحة الموظفين');
    
    // تنفيذ الإصلاح فور تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        fixEmployeesPageActivation();
    });
    
    // إضافة مستمع حدث للتأكد من تطبيق الإصلاح حتى بعد تحميل النظام
    // هذا مفيد في حالة تحميل القائمة الجانبية بشكل متأخر
    setTimeout(fixEmployeesPageActivation, 1000);
    setTimeout(fixEmployeesPageActivation, 2000);
    
    /**
     * إصلاح تنشيط صفحة الموظفين
     */
    function fixEmployeesPageActivation() {
        // البحث عن رابط الموظفين في القائمة الجانبية
        const employeesLink = document.querySelector('a[data-page="employees"]');
        if (!employeesLink) {
            console.warn('لم يتم العثور على رابط صفحة الموظفين في القائمة');
            return;
        }
        
        // إزالة جميع مستمعي الأحداث الحالية
        const newEmployeesLink = employeesLink.cloneNode(true);
        employeesLink.parentNode.replaceChild(newEmployeesLink, employeesLink);
        
        // إضافة مستمع حدث جديد بأولوية عالية
        newEmployeesLink.addEventListener('click', function(e) {
            console.log('تم النقر على رابط الموظفين، جاري تنشيط الصفحة...');
            e.preventDefault();
            e.stopPropagation(); // إيقاف انتشار الحدث
            
            // تنشيط صفحة الموظفين مباشرة
            activateEmployeesPage();
            
            // منع انتشار الحدث
            return false;
        }, true); // الطور المسبق (capturing phase) لضمان تنفيذ هذا المستمع أولاً
        
        console.log('تم تطبيق إصلاح تنشيط صفحة الموظفين');
    }
    
    /**
     * تنشيط صفحة الموظفين
     */
    function activateEmployeesPage() {
        console.log('تنشيط صفحة الموظفين...');
        
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إلغاء تنشيط جميع روابط القائمة
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // تنشيط رابط الموظفين
        const employeesLink = document.querySelector('a[data-page="employees"]');
        if (employeesLink) {
            employeesLink.classList.add('active');
        }
        
        // عرض صفحة الموظفين
        const employeesPage = document.getElementById('employees-page');
        if (employeesPage) {
            employeesPage.classList.add('active');
            
            // حدث خاص لإخبار المكونات الأخرى بتنشيط صفحة الموظفين
            const event = new CustomEvent('page:change', { 
                detail: { page: 'employees' } 
            });
            document.dispatchEvent(event);
            
            // إذا كانت دالة renderEmployeesTable متاحة، استدعها
            if (window.EmployeesModule && typeof window.EmployeesModule.renderEmployeesTable === 'function') {
                window.EmployeesModule.renderEmployeesTable();
            } else if (typeof renderEmployeesTable === 'function') {
                renderEmployeesTable();
            } else {
                console.warn('لم يتم العثور على دالة عرض جدول الموظفين');
            }
            
            console.log('تم تنشيط صفحة الموظفين بنجاح');
        } else {
            console.error('لم يتم العثور على صفحة الموظفين، جاري إعادة الإنشاء...');
            
            // محاولة إنشاء صفحة الموظفين إذا لم تكن موجودة
            if (window.EmployeesModule && typeof window.EmployeesModule.addEmployeesPage === 'function') {
                window.EmployeesModule.addEmployeesPage();
                
                // إعادة المحاولة بعد إنشاء الصفحة
                setTimeout(activateEmployeesPage, 100);
            } else if (typeof addEmployeesPage === 'function') {
                addEmployeesPage();
                
                // إعادة المحاولة بعد إنشاء الصفحة
                setTimeout(activateEmployeesPage, 100);
            } else {
                console.error('لم يتم العثور على دالة إنشاء صفحة الموظفين');
                
                // إشعار المستخدم
                if (typeof showNotification === 'function') {
                    showNotification('حدث خطأ أثناء تحميل صفحة الموظفين', 'error');
                } else if (window.showNotification) {
                    window.showNotification('حدث خطأ أثناء تحميل صفحة الموظفين', 'error');
                } else {
                    alert('حدث خطأ أثناء تحميل صفحة الموظفين');
                }
            }
        }
    }
})();