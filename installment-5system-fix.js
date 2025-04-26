/**
 * إصلاح مشاكل نظام الأقساط
 * هذا الملف يصلح المشكلتين الرئيسيتين في نظام الأقساط:
 * 1. ظهور أيقونتين للأقساط في الشريط الجانبي
 * 2. عدم ظهور الأقساط بعد تبديل الصفحات
 */

(function() {
    console.log('تطبيق إصلاحات لنظام الأقساط...');
    
    // متغير للتحقق من تطبيق الإصلاحات مسبقاً
    let isFixApplied = false;
    
    // انتظار تحميل المستند بالكامل
    document.addEventListener('DOMContentLoaded', function() {
        // تأخير تطبيق الإصلاح لضمان تحميل جميع العناصر
        setTimeout(applyFixes, 500);
    });

    // تطبيق الإصلاحات
    function applyFixes() {
        if (isFixApplied) return; // تجنب تطبيق الإصلاحات مرتين
        
        // إصلاح مشكلة ظهور أيقونتين للأقساط في الشريط الجانبي
        fixDuplicatedInstallmentButton();
        
        // إصلاح مشكلة عدم ظهور الأقساط بعد تبديل الصفحات
        fixPageNavigation();
        
        // إصلاح مشكلة حفظ الأقساط
        fixInstallmentStorage();
        
        // تعديل دالة showPage للتعامل بشكل صحيح مع صفحة الأقساط
        patchShowPageFunction();
        
        // إصلاح دالة renderInstallmentsTable
        patchRenderInstallmentsTableFunction();
        
        // تعيين المتغير لتجنب تطبيق الإصلاحات مرتين
        isFixApplied = true;
        
        console.log('تم تطبيق إصلاحات نظام الأقساط بنجاح');
    }
    
    /**
     * إصلاح مشكلة ظهور أيقونتين للأقساط في الشريط الجانبي
     */
    function fixDuplicatedInstallmentButton() {
        const sidebar = document.querySelector('.sidebar .nav-list');
        if (!sidebar) return;
        
        // البحث عن جميع أزرار الأقساط
        const installmentButtons = sidebar.querySelectorAll('.nav-link[data-page="installments"]');
        
        // إذا كان هناك أكثر من زر، نحتفظ بالأول فقط ونحذف الباقي
        if (installmentButtons.length > 1) {
            console.log(`وجدنا ${installmentButtons.length} زر للأقساط، سيتم الاحتفاظ بواحد فقط`);
            
            // الاحتفاظ بالزر الأول
            const firstButton = installmentButtons[0];
            
            // حذف بقية الأزرار
            for (let i = 1; i < installmentButtons.length; i++) {
                const button = installmentButtons[i];
                const parentLi = button.closest('li.nav-item');
                if (parentLi) {
                    parentLi.remove();
                }
            }
            
            // إضافة مستمع حدث للزر المتبقي
            firstButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // إزالة الكلاس النشط من جميع الروابط
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                
                // إضافة الكلاس النشط للرابط المحدد
                this.classList.add('active');
                
                // استدعاء الدالة المعدلة لإظهار صفحة الأقساط
                showInstallmentsPage();
            });
            
            console.log('تم إصلاح مشكلة تكرار زر الأقساط في القائمة الجانبية');
        }
    }
    
    /**
     * تعديل دالة showPage للتعامل بشكل صحيح مع صفحة الأقساط
     */
    function patchShowPageFunction() {
        // حفظ النسخة الأصلية من الدالة
        const originalShowPage = window.showPage;
        
        // استبدال الدالة بنسخة معدلة
        window.showPage = function(pageId) {
            console.log(`عرض الصفحة: ${pageId}`);
            
            if (pageId === 'installments') {
                // استخدام الدالة المخصصة لعرض صفحة الأقساط
                showInstallmentsPage();
                return;
            }
            
            // استدعاء الدالة الأصلية لبقية الصفحات
            if (originalShowPage) {
                originalShowPage(pageId);
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
            }
        };
        
        console.log('تم تعديل دالة showPage لدعم صفحة الأقساط');
    }
    
    /**
     * دالة مخصصة لعرض صفحة الأقساط
     */
    function showInstallmentsPage() {
        console.log('عرض صفحة الأقساط بالطريقة المعدلة');
        
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // البحث عن صفحة الأقساط
        let installmentsPage = document.getElementById('installments-page');
        
        // التحقق من وجود الصفحة
        if (!installmentsPage) {
            console.log('صفحة الأقساط غير موجودة، جاري إنشائها...');
            
            // إنشاء صفحة الأقساط إذا لم تكن موجودة
            if (window.createInstallmentPage) {
                window.createInstallmentPage();
                installmentsPage = document.getElementById('installments-page');
            }
        }
        
        // إظهار صفحة الأقساط
        if (installmentsPage) {
            installmentsPage.classList.add('active');
            
            // تأكد من تحميل البيانات
            if (window.loadInstallmentData) {
                window.loadInstallmentData();
            }
            
            // تحديث عرض جدول الأقساط
            if (window.renderInstallmentsTable) {
                window.renderInstallmentsTable();
            }
            
            // تحديث إحصائيات الأقساط
            if (window.updateInstallmentStatistics) {
                window.updateInstallmentStatistics();
            }
        } else {
            console.error('لم يتم العثور على صفحة الأقساط ولم يتم إنشاؤها');
        }
    }
    
    /**
     * إصلاح مشكلة تخزين الأقساط
     */
    function fixInstallmentStorage() {
        // ضمان أن متغير window.installments موجود
        if (!window.installments) {
            window.installments = [];
            
            // محاولة تحميل الأقساط من التخزين المحلي
            try {
                const savedInstallments = localStorage.getItem('installments');
                if (savedInstallments) {
                    window.installments = JSON.parse(savedInstallments);
                    console.log(`تم تحميل ${window.installments.length} من سجلات الأقساط`);
                }
            } catch (error) {
                console.error('خطأ في تحميل بيانات الأقساط:', error);
            }
        }
        
        // تعديل دالة حفظ بيانات الأقساط
        window.saveInstallmentData = function() {
            try {
                localStorage.setItem('installments', JSON.stringify(window.installments));
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
        
        // تعديل دالة تحميل بيانات الأقساط
        window.loadInstallmentData = function() {
            try {
                const savedInstallments = localStorage.getItem('installments');
                if (savedInstallments) {
                    window.installments = JSON.parse(savedInstallments);
                    console.log(`تم تحميل ${window.installments.length} من سجلات الأقساط`);
                }
            } catch (error) {
                console.error('خطأ في تحميل بيانات الأقساط:', error);
                window.installments = [];
            }
        };
        
        console.log('تم إصلاح مشكلة تخزين الأقساط');
    }
    
    /**
     * إصلاح دالة عرض جدول الأقساط
     */
    function patchRenderInstallmentsTableFunction() {
        // التأكد من وجود الدالة الأصلية
        if (!window.renderInstallmentsTable) {
            console.warn('دالة renderInstallmentsTable غير موجودة بعد، سيتم تعديلها عند تعريفها');
            
            // تعريف واجهة الدالة العامة
            Object.defineProperty(window, 'renderInstallmentsTable', {
                configurable: true,
                enumerable: true,
                get: function() {
                    return this._renderInstallmentsTable;
                },
                set: function(newFunc) {
                    // حفظ الدالة الأصلية
                    this._originalRenderInstallmentsTable = newFunc;
                    
                    // تعريف الدالة المعدلة
                    this._renderInstallmentsTable = function() {
                        console.log('عرض جدول الأقساط (النسخة المعدلة)...');
                        
                        // التأكد من وجود جدول الأقساط
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
                        }
                        
                        // نسخة من الأقساط لتجنب تعديل المصفوفة الأصلية
                        const sortedInstallments = [...window.installments].sort((a, b) => {
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        });
                        
                        if (sortedInstallments.length === 0) {
                            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد أقساط</td></tr>';
                            return;
                        }
                        
                        // عرض الأقساط في الجدول
                        sortedInstallments.forEach(installment => {
                            // تعريف متغيرات العرض
                            const remainingInstallments = installment.monthlyInstallments.filter(inst => !inst.isPaid).length;
                            const nextInstallment = installment.monthlyInstallments.find(inst => !inst.isPaid);
                            const nextDueDate = nextInstallment ? nextInstallment.dueDate : '-';
                            
                            // تحديد حالة القسط
                            let statusClass = 'success';
                            let statusText = 'مكتمل';
                            
                            if (installment.status === 'active') {
                                const today = new Date();
                                const overdueInstallments = installment.monthlyInstallments.filter(inst => 
                                    !inst.isPaid && new Date(inst.dueDate) < today
                                );
                                
                                if (overdueInstallments.length > 0) {
                                    statusClass = 'danger';
                                    statusText = 'متأخر';
                                } else {
                                    statusClass = 'primary';
                                    statusText = 'نشط';
                                }
                            }
                            
                            // إنشاء صف في الجدول
                            const row = document.createElement('tr');
                            row.setAttribute('data-id', installment.id);
                            
                            row.innerHTML = `
                                <td>${installment.id}</td>
                                <td>
                                    <div class="investor-info">
                                        <div class="investor-avatar">${installment.investorName.charAt(0)}</div>
                                        <div>
                                            <div class="investor-name">${installment.investorName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>${installment.title}</td>
                                <td>${formatCurrency(installment.totalAmount)}</td>
                                <td>${formatCurrency(installment.monthlyInstallment)}</td>
                                <td>${remainingInstallments} من ${installment.monthsCount}</td>
                                <td>${nextDueDate !== '-' ? nextDueDate : 'مكتمل'}</td>
                                <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                                <td>
                                    <div class="installment-actions">
                                        <button class="installment-action-btn view-installment" data-id="${installment.id}" title="عرض التفاصيل">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        ${installment.status !== 'completed' ? `
                                        <button class="installment-action-btn pay pay-installment" data-id="${installment.id}" title="تسديد قسط">
                                            <i class="fas fa-hand-holding-usd"></i>
                                        </button>
                                        ` : ''}
                                        <button class="installment-action-btn delete delete-installment" data-id="${installment.id}" title="حذف">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            `;
                            
                            tableBody.appendChild(row);
                            
                            // إضافة مستمعي الأحداث للأزرار
                            const viewButton = row.querySelector('.view-installment');
                            const payButton = row.querySelector('.pay-installment');
                            const deleteButton = row.querySelector('.delete-installment');
                            
                            if (viewButton) {
                                viewButton.addEventListener('click', () => {
                                    if (window.showInstallmentDetails) {
                                        window.showInstallmentDetails(installment.id);
                                    }
                                });
                            }
                            
                            if (payButton) {
                                payButton.addEventListener('click', () => {
                                    if (window.openPaymentModalForInstallment) {
                                        window.openPaymentModalForInstallment(installment.id);
                                    }
                                });
                            }
                            
                            if (deleteButton) {
                                deleteButton.addEventListener('click', () => {
                                    if (window.deleteInstallment) {
                                        window.deleteInstallment(installment.id);
                                    }
                                });
                            }
                        });
                        
                        // تحديث إحصائيات الأقساط
                        if (window.updateInstallmentStatistics) {
                            window.updateInstallmentStatistics();
                        }
                    };
                    
                    return this._renderInstallmentsTable;
                }
            });
        } else {
            // حفظ الدالة الأصلية
            const originalRenderInstallmentsTable = window.renderInstallmentsTable;
            
            // استبدال الدالة بنسخة معدلة
            window.renderInstallmentsTable = function() {
                console.log('عرض جدول الأقساط (النسخة المعدلة)...');
                
                // الاستدعاء المباشر للدالة الأصلية
                originalRenderInstallmentsTable();
                
                // تحديث إحصائيات الأقساط
                if (window.updateInstallmentStatistics) {
                    window.updateInstallmentStatistics();
                }
            };
        }
        
        console.log('تم تعديل دالة عرض جدول الأقساط');
    }
    
    /**
     * إصلاح مشكلة الصفحات
     */
    function fixPageNavigation() {
        // إضافة دالة للكشف عن تبديل الصفحات
        document.addEventListener('click', function(event) {
            const navLink = event.target.closest('.nav-link');
            if (navLink) {
                const pageId = navLink.getAttribute('data-page');
                
                // إذا تم النقر على رابط صفحة الأقساط
                if (pageId === 'installments') {
                    event.preventDefault();
                    
                    // إزالة الكلاس النشط من جميع الروابط
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    
                    // إضافة الكلاس النشط للرابط المحدد
                    navLink.classList.add('active');
                    
                    // استدعاء الدالة المخصصة لعرض صفحة الأقساط
                    showInstallmentsPage();
                }
            }
        });
        
        console.log('تم إصلاح مشكلة التنقل بين الصفحات');
    }
})();