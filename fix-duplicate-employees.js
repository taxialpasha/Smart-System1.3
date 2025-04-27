/**
 * fix-duplicate-employees.js
 * هذا الملف يعالج مشكلة تكرار إضافة الموظفين وعناصر واجهة المستخدم
 * يتم تنفيذه بعد تحميل الصفحة مباشرة
 */

(function() {
    console.log("تهيئة نظام منع تكرار الموظفين وعناصر واجهة المستخدم...");
    
    // متغير للتأكد من تهيئة النظام مرة واحدة فقط
    let employeesSystemInitialized = false;
    
    // متغير لمراقبة عمليات إضافة الموظفين
    let employeeAddOperationInProgress = false;
    
    /**
     * وظيفة للتأكد من عدم تكرار العناصر في DOM
     */
    function preventDuplicateElements() {
        // 1. منع تكرار رابط الموظفين في القائمة الجانبية
        preventDuplicateSidebarLinks();
        
        // 2. منع تكرار صفحة الموظفين
        preventDuplicateEmployeesPage();
        
        // 3. منع تكرار النوافذ المنبثقة
        preventDuplicateModals();
    }
    
    /**
     * منع تكرار رابط الموظفين في القائمة الجانبية
     */
    function preventDuplicateSidebarLinks() {
        // البحث عن روابط الموظفين في القائمة
        const employeesLinks = document.querySelectorAll('a[data-page="employees"]');
        
        // إذا وجد أكثر من رابط، نحتفظ بالأول فقط
        if (employeesLinks.length > 1) {
            console.warn(`تم العثور على ${employeesLinks.length} روابط للموظفين. سيتم الاحتفاظ بالأول فقط.`);
            
            // نحتفظ بالرابط الأول ونحذف البقية
            for (let i = 1; i < employeesLinks.length; i++) {
                const linkItem = employeesLinks[i].closest('.nav-item');
                if (linkItem && linkItem.parentNode) {
                    linkItem.parentNode.removeChild(linkItem);
                }
            }
        }
    }
    
    /**
     * منع تكرار صفحة الموظفين
     */
    function preventDuplicateEmployeesPage() {
        // البحث عن صفحات الموظفين
        const employeesPages = document.querySelectorAll('#employees-page');
        
        // إذا وجد أكثر من صفحة، نحتفظ بالأولى فقط
        if (employeesPages.length > 1) {
            console.warn(`تم العثور على ${employeesPages.length} صفحات للموظفين. سيتم الاحتفاظ بالأولى فقط.`);
            
            // نحتفظ بالصفحة الأولى ونحذف البقية
            for (let i = 1; i < employeesPages.length; i++) {
                if (employeesPages[i].parentNode) {
                    employeesPages[i].parentNode.removeChild(employeesPages[i]);
                }
            }
        }
    }
    
    /**
     * منع تكرار النوافذ المنبثقة
     */
    function preventDuplicateModals() {
        // قائمة بمعرفات النوافذ المنبثقة
        const modalIds = [
            'add-employee-modal',
            'pay-salary-modal',
            'employee-details-modal',
            'salary-details-modal'
        ];
        
        // التحقق من كل نافذة منبثقة
        modalIds.forEach(modalId => {
            const modals = document.querySelectorAll(`#${modalId}`);
            
            // إذا وجد أكثر من نافذة بنفس المعرف، نحتفظ بالأولى فقط
            if (modals.length > 1) {
                console.warn(`تم العثور على ${modals.length} نوافذ بمعرف ${modalId}. سيتم الاحتفاظ بالأولى فقط.`);
                
                // نحتفظ بالنافذة الأولى ونحذف البقية
                for (let i = 1; i < modals.length; i++) {
                    if (modals[i].parentNode) {
                        modals[i].parentNode.removeChild(modals[i]);
                    }
                }
            }
        });
    }
    
    /**
     * تعديل وظيفة إضافة الموظف لمنع الإضافة المتكررة
     */
    function patchAddEmployeeFunction() {
        // التحقق من وجود وظيفة إضافة موظف
        if (window.addNewEmployee) {
            // حفظ الوظيفة الأصلية
            const originalAddNewEmployee = window.addNewEmployee;
            
            // استبدال الوظيفة بنسخة معدلة تمنع التكرار
            window.addNewEmployee = function() {
                // التحقق من عدم وجود عملية إضافة جارية
                if (employeeAddOperationInProgress) {
                    console.warn('هناك عملية إضافة موظف جارية بالفعل. تم تجاهل الطلب.');
                    return;
                }
                
                // تعيين مؤشر العملية الجارية
                employeeAddOperationInProgress = true;
                
                try {
                    // استدعاء الوظيفة الأصلية
                    const result = originalAddNewEmployee.apply(this, arguments);
                    return result;
                } finally {
                    // إعادة تعيين مؤشر العملية بعد الانتهاء
                    setTimeout(() => {
                        employeeAddOperationInProgress = false;
                    }, 500);
                }
            };
            
            console.log('تم تعديل وظيفة إضافة الموظف لمنع الإضافة المتكررة');
        }
        
        // تعديل وظيفة EmployeesModule.addEmployee إذا كانت موجودة
        if (window.EmployeesModule && window.EmployeesModule.addEmployee) {
            // حفظ الوظيفة الأصلية
            const originalModuleAddEmployee = window.EmployeesModule.addEmployee;
            
            // استبدال الوظيفة بنسخة معدلة تمنع التكرار
            window.EmployeesModule.addEmployee = function() {
                // التحقق من عدم وجود عملية إضافة جارية
                if (employeeAddOperationInProgress) {
                    console.warn('هناك عملية إضافة موظف جارية بالفعل. تم تجاهل الطلب.');
                    return;
                }
                
                // تعيين مؤشر العملية الجارية
                employeeAddOperationInProgress = true;
                
                try {
                    // استدعاء الوظيفة الأصلية
                    const result = originalModuleAddEmployee.apply(this, arguments);
                    return result;
                } finally {
                    // إعادة تعيين مؤشر العملية بعد الانتهاء
                    setTimeout(() => {
                        employeeAddOperationInProgress = false;
                    }, 500);
                }
            };
            
            console.log('تم تعديل وظيفة EmployeesModule.addEmployee لمنع الإضافة المتكررة');
        }
    }
    
    /**
     * إصلاح وظيفة تهيئة نظام الموظفين
     */
    function patchEmployeesSystemInitialization() {
        // التحقق من وجود وظيفة initEmployeesSystem
        if (window.initEmployeesSystem) {
            // حفظ الوظيفة الأصلية
            const originalInitEmployeesSystem = window.initEmployeesSystem;
            
            // استبدال الوظيفة بنسخة معدلة تمنع التهيئة المتكررة
            window.initEmployeesSystem = function() {
                // التحقق من عدم تهيئة النظام مسبقاً
                if (employeesSystemInitialized) {
                    console.warn('تم تهيئة نظام الموظفين مسبقاً. تم تجاهل طلب التهيئة.');
                    return;
                }
                
                // تعيين مؤشر التهيئة
                employeesSystemInitialized = true;
                
                // حذف أي عناصر مكررة قبل التهيئة
                preventDuplicateElements();
                
                // استدعاء الوظيفة الأصلية
                const result = originalInitEmployeesSystem.apply(this, arguments);
                
                // تحديث الموظفين بعد التهيئة
                setTimeout(() => {
                    if (window.EmployeesModule && window.EmployeesModule.loadEmployees) {
                        window.EmployeesModule.loadEmployees();
                    }
                }, 500);
                
                return result;
            };
            
            console.log('تم تعديل وظيفة تهيئة نظام الموظفين لمنع التهيئة المتكررة');
        }
    }
    
    /**
     * إصلاح التخزين المحلي لمنع التكرار
     */
    function patchLocalStorage() {
        // إضافة وظيفة جديدة لتصفية البيانات المكررة قبل الحفظ
        window.cleanAndSaveEmployeesData = function() {
            if (!window.employees || !Array.isArray(window.employees)) {
                return false;
            }
            
            // إزالة الموظفين المكررين باستخدام المعرف الفريد
            const uniqueEmployees = [];
            const employeeIds = new Set();
            
            window.employees.forEach(employee => {
                if (employee && employee.id && !employeeIds.has(employee.id)) {
                    employeeIds.add(employee.id);
                    uniqueEmployees.push(employee);
                }
            });
            
            // تحديث مصفوفة الموظفين
            window.employees = uniqueEmployees;
            
            // حفظ البيانات المصفاة
            try {
                localStorage.setItem('employees', JSON.stringify(uniqueEmployees));
                
                // تصفية سجلات الرواتب إذا كانت موجودة
                if (window.salaryTransactions && Array.isArray(window.salaryTransactions)) {
                    localStorage.setItem('salaryTransactions', JSON.stringify(window.salaryTransactions));
                }
                
                console.log(`تم حفظ ${uniqueEmployees.length} موظف بعد إزالة التكرارات`);
                return true;
            } catch (error) {
                console.error('خطأ في حفظ بيانات الموظفين:', error);
                return false;
            }
        };
        
        // إذا كانت وظيفة saveEmployeesData موجودة، نقوم بتعديلها
        if (window.saveEmployeesData) {
            const originalSaveEmployeesData = window.saveEmployeesData;
            
            window.saveEmployeesData = function() {
                // الاستفادة من الوظيفة الجديدة
                return window.cleanAndSaveEmployeesData();
            };
            
            console.log('تم تعديل وظيفة حفظ بيانات الموظفين لمنع التكرار');
        }
    }
    
    /**
     * البدء في تنفيذ الإصلاحات
     */
    function applyFixes() {
        // تطبيق الإصلاحات فقط إذا لم يتم تطبيقها مسبقاً
        if (window.duplicateEmployeeFixApplied) {
            return;
        }
        
        // منع تكرار عناصر DOM
        preventDuplicateElements();
        
        // تعديل وظائف إضافة الموظفين
        patchAddEmployeeFunction();
        
        // تعديل وظيفة تهيئة النظام
        patchEmployeesSystemInitialization();
        
        // إصلاح التخزين المحلي
        patchLocalStorage();
        
        // تنظيف البيانات الحالية
        if (window.employees && Array.isArray(window.employees)) {
            window.cleanAndSaveEmployeesData();
        }
        
        // وضع علامة على تطبيق الإصلاح
        window.duplicateEmployeeFixApplied = true;
        console.log('تم تطبيق جميع إصلاحات منع تكرار الموظفين بنجاح');
    }
    
    // تنفيذ الإصلاحات مباشرة إذا كانت الصفحة محملة بالفعل
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        applyFixes();
    } else {
        // وإلا ننتظر حتى يكتمل تحميل الصفحة
        document.addEventListener('DOMContentLoaded', applyFixes);
    }
    
    // تنفيذ الإصلاحات بعد فترة قصيرة أيضاً لضمان تطبيقها بعد تحميل المكونات الأخرى
    setTimeout(applyFixes, 1000);
    
    // إضافة مراقبة للتحديثات اللاحقة لضمان عدم تكرار الموظفين
    document.addEventListener('page:change', function(e) {
        if (e.detail && e.detail.page === 'employees') {
            // تأخير قصير لضمان تحميل الصفحة
            setTimeout(preventDuplicateElements, 300);
        }
    });
})();