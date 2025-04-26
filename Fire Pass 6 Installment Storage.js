/**
 * إصلاح مشكلة تخزين بيانات الأقساط
 * هذا الملف يهدف لحل مشكلة اختفاء بيانات الأقساط عند تحديث الصفحة
 */

(function() {
    console.log('تطبيق إصلاح مشكلة تخزين الأقساط...');
    
    // متغير للتحقق من تطبيق الإصلاح
    let isFixApplied = false;
    
    // وظيفة التهيئة الرئيسية
    function init() {
        if (isFixApplied) return;
        
        // إصلاح تخزين الأقساط
        fixInstallmentsStorage();
        
        // تعديل دالة عرض الصفحات
        fixPageNavigation();
        
        // تصحيح عرض الأقساط
        fixInstallmentsRendering();
        
        // إعادة ترتيب تسلسل التحميل
        fixLoadingSequence();
        
        // تعيين العلم لمنع تطبيق الإصلاح مرتين
        isFixApplied = true;
        
        console.log('تم تطبيق إصلاح مشكلة تخزين الأقساط بنجاح');
    }
    
    /**
     * إصلاح مشكلة تخزين الأقساط
     */
    function fixInstallmentsStorage() {
        // التأكد من وجود مصفوفة الأقساط العامة
        if (typeof window.installments === 'undefined') {
            window.installments = [];
        }
        
        // تعريف دالة تحميل البيانات إذا لم تكن موجودة
        if (typeof window.loadInstallmentData !== 'function') {
            window.loadInstallmentData = function() {
                try {
                    const savedInstallments = localStorage.getItem('installments');
                    if (savedInstallments) {
                        window.installments = JSON.parse(savedInstallments);
                        console.log(`تم تحميل ${window.installments.length} من سجلات الأقساط`);
                    } else {
                        console.log('لم يتم العثور على بيانات الأقساط في التخزين المحلي');
                        window.installments = [];
                    }
                } catch (error) {
                    console.error('خطأ في تحميل بيانات الأقساط:', error);
                    window.installments = [];
                    // في حالة وجود خطأ، نحاول حذف البيانات الفاسدة
                    try { localStorage.removeItem('installments'); } catch(e) {}
                }
                return window.installments;
            };
        } else {
            // حفظ الدالة الأصلية
            const originalLoadInstallmentData = window.loadInstallmentData;
            
            // استبدال الدالة بنسخة أكثر موثوقية
            window.loadInstallmentData = function() {
                try {
                    return originalLoadInstallmentData();
                } catch (error) {
                    console.error('خطأ في تحميل بيانات الأقساط (الدالة الأصلية):', error);
                    
                    // تنفيذ الإجراء البديل
                    try {
                        const savedInstallments = localStorage.getItem('installments');
                        if (savedInstallments) {
                            window.installments = JSON.parse(savedInstallments);
                            console.log(`تم تحميل ${window.installments.length} من سجلات الأقساط (الإجراء البديل)`);
                        } else {
                            window.installments = [];
                        }
                    } catch (e) {
                        console.error('فشل الإجراء البديل لتحميل البيانات:', e);
                        window.installments = [];
                        // في حالة وجود خطأ، نحاول حذف البيانات الفاسدة
                        try { localStorage.removeItem('installments'); } catch(e) {}
                    }
                    
                    return window.installments;
                }
            };
        }
        
        // تعريف دالة حفظ البيانات إذا لم تكن موجودة
        if (typeof window.saveInstallmentData !== 'function') {
            window.saveInstallmentData = function() {
                try {
                    // التأكد من أن البيانات قابلة للتحويل إلى JSON
                    const testJson = JSON.stringify(window.installments);
                    
                    // حفظ البيانات
                    localStorage.setItem('installments', testJson);
                    console.log('تم حفظ بيانات الأقساط بنجاح');
                    return true;
                } catch (error) {
                    console.error('خطأ في حفظ بيانات الأقساط:', error);
                    if (window.showNotification) {
                        window.showNotification('حدث خطأ أثناء حفظ بيانات الأقساط', 'error');
                    }
                    return false;
                }
            };
        } else {
            // حفظ الدالة الأصلية
            const originalSaveInstallmentData = window.saveInstallmentData;
            
            // استبدال الدالة بنسخة أكثر موثوقية
            window.saveInstallmentData = function() {
                try {
                    // التأكد من أن البيانات قابلة للتحويل إلى JSON أولاً
                    const testJson = JSON.stringify(window.installments);
                    
                    // استدعاء الدالة الأصلية
                    const result = originalSaveInstallmentData();
                    
                    // نحاول الحفظ بأنفسنا إذا فشلت الدالة الأصلية
                    if (!result) {
                        localStorage.setItem('installments', testJson);
                        console.log('تم حفظ بيانات الأقساط بنجاح (الإجراء البديل)');
                        return true;
                    }
                    
                    return result;
                } catch (error) {
                    console.error('خطأ في حفظ بيانات الأقساط:', error);
                    
                    // محاولة الحفظ باستخدام الطريقة البديلة
                    try {
                        localStorage.setItem('installments', JSON.stringify(window.installments));
                        console.log('تم حفظ بيانات الأقساط بنجاح (الإجراء البديل)');
                        return true;
                    } catch (e) {
                        console.error('فشل الإجراء البديل لحفظ البيانات:', e);
                        if (window.showNotification) {
                            window.showNotification('حدث خطأ أثناء حفظ بيانات الأقساط', 'error');
                        }
                        return false;
                    }
                }
            };
        }
        
        // تحميل البيانات فوراً
        window.loadInstallmentData();
        
        console.log('تم إصلاح دوال تخزين الأقساط');
    }
    
    /**
     * إصلاح مشكلة عرض الصفحات
     */
    function fixPageNavigation() {
        // حفظ الدالة الأصلية
        const originalShowPage = window.showPage;
        
        if (typeof originalShowPage === 'function') {
            // استبدال الدالة بنسخة معززة
            window.showPage = function(pageId) {
                console.log(`عرض الصفحة: ${pageId}`);
                
                // معالجة خاصة لصفحة الأقساط
                if (pageId === 'installments') {
                    // إخفاء جميع الصفحات
                    document.querySelectorAll('.page').forEach(page => {
                        page.classList.remove('active');
                    });
                    
                    // البحث عن صفحة الأقساط
                    let installmentsPage = document.getElementById('installments-page');
                    
                    // إنشاء الصفحة إذا لم تكن موجودة
                    if (!installmentsPage) {
                        console.log('صفحة الأقساط غير موجودة، جاري إنشاؤها...');
                        if (typeof window.createInstallmentPage === 'function') {
                            window.createInstallmentPage();
                            installmentsPage = document.getElementById('installments-page');
                        }
                    }
                    
                    // إظهار الصفحة
                    if (installmentsPage) {
                        installmentsPage.classList.add('active');
                        
                        // تأكد من تحميل البيانات
                        window.loadInstallmentData();
                        
                        // تحديث عرض الأقساط
                        if (typeof window.renderInstallmentsTable === 'function') {
                            setTimeout(() => {
                                window.renderInstallmentsTable();
                            }, 100);
                        }
                        
                        // تحديث الإحصائيات
                        if (typeof window.updateInstallmentStatistics === 'function') {
                            setTimeout(() => {
                                window.updateInstallmentStatistics();
                            }, 200);
                        }
                    } else {
                        console.error('فشل إنشاء صفحة الأقساط');
                    }
                    
                    return;
                }
                
                // استدعاء الدالة الأصلية لبقية الصفحات
                originalShowPage(pageId);
            };
        } else {
            // تعريف الدالة إذا لم تكن موجودة
            window.showPage = function(pageId) {
                console.log(`عرض الصفحة: ${pageId}`);
                
                // إخفاء جميع الصفحات
                document.querySelectorAll('.page').forEach(page => {
                    page.classList.remove('active');
                });
                
                // معالجة خاصة لصفحة الأقساط
                if (pageId === 'installments') {
                    // البحث عن صفحة الأقساط
                    let installmentsPage = document.getElementById('installments-page');
                    
                    // إنشاء الصفحة إذا لم تكن موجودة
                    if (!installmentsPage) {
                        console.log('صفحة الأقساط غير موجودة، جاري إنشاؤها...');
                        if (typeof window.createInstallmentPage === 'function') {
                            window.createInstallmentPage();
                            installmentsPage = document.getElementById('installments-page');
                        }
                    }
                    
                    // إظهار الصفحة
                    if (installmentsPage) {
                        installmentsPage.classList.add('active');
                        
                        // تحديث عرض الأقساط
                        if (typeof window.renderInstallmentsTable === 'function') {
                            setTimeout(() => {
                                window.renderInstallmentsTable();
                            }, 100);
                        }
                    }
                    
                    return;
                }
                
                // إظهار الصفحة المطلوبة
                const targetPage = document.getElementById(`${pageId}-page`);
                if (targetPage) {
                    targetPage.classList.add('active');
                }
            };
        }
        
        console.log('تم إصلاح دالة عرض الصفحات');
    }
    
    /**
     * إصلاح مشكلة عرض الأقساط
     */
    function fixInstallmentsRendering() {
        // التأكد من وجود دالة عرض جدول الأقساط
        if (typeof window.renderInstallmentsTable === 'function') {
            // حفظ النسخة الأصلية
            const originalRenderInstallmentsTable = window.renderInstallmentsTable;
            
            // استبدال الدالة بنسخة أكثر موثوقية
            window.renderInstallmentsTable = function() {
                // تأكد من تحميل بيانات الأقساط أولاً
                if (!window.installments || window.installments.length === 0) {
                    window.loadInstallmentData();
                }
                
                console.log(`عرض جدول الأقساط... (${window.installments.length} قسط)`);
                
                try {
                    // استدعاء الدالة الأصلية
                    originalRenderInstallmentsTable();
                } catch (error) {
                    console.error('خطأ في عرض جدول الأقساط:', error);
                    
                    // تنفيذ الإجراء البديل
                    try {
                        const tableBody = document.querySelector('#installments-table tbody');
                        if (!tableBody) {
                            console.error('لم يتم العثور على جدول الأقساط');
                            return;
                        }
                        
                        // تفريغ الجدول
                        tableBody.innerHTML = '';
                        
                        // التأكد من وجود مصفوفة الأقساط
                        if (!window.installments || !Array.isArray(window.installments)) {
                            console.warn('مصفوفة الأقساط غير موجودة أو ليست مصفوفة');
                            window.installments = [];
                            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد أقساط</td></tr>';
                            return;
                        }
                        
                        if (window.installments.length === 0) {
                            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد أقساط</td></tr>';
                            return;
                        }
                        
                        // عرض الأقساط ببساطة
                        window.installments.forEach(installment => {
                            const row = document.createElement('tr');
                            row.setAttribute('data-id', installment.id);
                            
                            row.innerHTML = `
                                <td>${installment.id}</td>
                                <td>${installment.investorName}</td>
                                <td>${installment.title}</td>
                                <td>${installment.totalAmount}</td>
                                <td>${installment.monthlyInstallment}</td>
                                <td>${installment.monthsCount}</td>
                                <td>${installment.startDate}</td>
                                <td>${installment.status}</td>
                                <td>
                                    <div class="installment-actions">
                                        <button class="installment-action-btn view-installment" data-id="${installment.id}" title="عرض التفاصيل">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="installment-action-btn delete delete-installment" data-id="${installment.id}" title="حذف">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            `;
                            
                            tableBody.appendChild(row);
                        });
                    } catch (e) {
                        console.error('فشل الإجراء البديل لعرض الأقساط:', e);
                    }
                }
            };
        }
        
        console.log('تم إصلاح دالة عرض الأقساط');
    }
    
    /**
     * إصلاح تسلسل تحميل النظام
     */
    function fixLoadingSequence() {
        // إضافة مستمع لتحميل الصفحة
        window.addEventListener('load', function() {
            console.log('تحميل الصفحة مكتمل، جاري تهيئة نظام الأقساط...');
            
            // تحميل بيانات الأقساط
            window.loadInstallmentData();
            
            // تحديث القائمة الجانبية
            const installmentLink = document.querySelector('.nav-link[data-page="installments"]');
            if (installmentLink) {
                installmentLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    window.showPage('installments');
                });
            }
            
            // تحميل نوافذ الأقساط المنبثقة إذا لم تكن موجودة
            if (typeof window.createInstallmentModals === 'function' && 
                !document.getElementById('add-installment-modal')) {
                window.createInstallmentModals();
            }
            
            console.log('تم تهيئة نظام الأقساط بنجاح');
        });
        
        console.log('تم إصلاح تسلسل تحميل النظام');
    }
    
    // انتظار تحميل DOM ثم تطبيق الإصلاحات
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();