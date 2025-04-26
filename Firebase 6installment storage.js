/**
 * الحل الجذري لمشكلة تخزين واسترجاع بيانات الأقساط
 * هذا الملف يقوم بإعادة كتابة الوظائف الأساسية لتخزين واسترجاع البيانات
 */

(function() {
    console.log('تطبيق الحل الجذري لمشكلة تخزين الأقساط...');
    
    // احتياط منع التنفيذ المتكرر
    if (window.fixedInstallmentStorage === true) {
        console.log('تم تطبيق الإصلاح مسبقًا');
        return;
    }
    
    // 1. إصلاح البيانات الرئيسية: التأكد من وجود مصفوفة عالمية للأقساط
    if (typeof window.installments === 'undefined') {
        window.installments = [];
    }
    
    // حفظ النسخة الأصلية من دالة إعادة تقديم الجدول إذا وجدت
    const originalRenderTable = window.renderInstallmentsTable;
    
    // 2. إعادة كتابة وظيفة تخزين البيانات بالكامل
    window.saveInstallmentData = function(forceRender = true) {
        console.log('حفظ بيانات الأقساط (النسخة المحسنة)...');
        
        try {
            // للتأكد من أن البيانات صالحة للتخزين
            if (!Array.isArray(window.installments)) {
                console.error('خطأ: مصفوفة الأقساط غير صالحة');
                window.installments = [];
            }
            
            // حفظ البيانات في التخزين المحلي
            localStorage.setItem('installments', JSON.stringify(window.installments));
            console.log(`تم حفظ ${window.installments.length} قسط بنجاح`);
            
            // لنتأكد أن البيانات تم حفظها فعلاً
            const verification = localStorage.getItem('installments');
            if (!verification) {
                throw new Error('فشل التحقق من حفظ البيانات');
            }
            
            // إعادة رسم الجدول إذا تم طلب ذلك
            if (forceRender && typeof window.renderInstallmentsTable === 'function') {
                setTimeout(() => {
                    window.renderInstallmentsTable();
                }, 50);
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في حفظ بيانات الأقساط:', error.message);
            
            // محاولة بديلة للحفظ باستخدام آلية مختلفة
            try {
                const data = JSON.stringify(window.installments);
                localStorage.removeItem('installments');
                setTimeout(() => {
                    localStorage.setItem('installments', data);
                    console.log('تم الحفظ باستخدام الطريقة البديلة');
                }, 100);
            } catch (e) {
                console.error('فشلت المحاولة البديلة للحفظ:', e.message);
            }
            
            // عرض رسالة للمستخدم
            if (window.showNotification) {
                window.showNotification('حدث خطأ أثناء حفظ بيانات الأقساط', 'error');
            } else {
                alert('حدث خطأ أثناء حفظ بيانات الأقساط');
            }
            
            return false;
        }
    };
    
    // 3. إعادة كتابة وظيفة تحميل البيانات بالكامل
    window.loadInstallmentData = function(forceRender = true) {
        console.log('تحميل بيانات الأقساط (النسخة المحسنة)...');
        
        try {
            const savedData = localStorage.getItem('installments');
            
            if (savedData) {
                // محاولة تحليل البيانات
                const parsed = JSON.parse(savedData);
                
                // التحقق من صحة البيانات
                if (Array.isArray(parsed)) {
                    window.installments = parsed;
                    console.log(`تم تحميل ${window.installments.length} قسط من التخزين المحلي`);
                } else {
                    console.warn('البيانات المخزنة ليست مصفوفة، سيتم إنشاء مصفوفة جديدة');
                    window.installments = [];
                }
            } else {
                console.log('لم يتم العثور على بيانات في التخزين المحلي، سيتم استخدام مصفوفة فارغة');
                window.installments = [];
            }
            
            // طباعة البيانات للتحقق منها
            console.log('بيانات الأقساط الحالية:', window.installments);
            
            // إعادة رسم الجدول إذا تم طلب ذلك
            if (forceRender && typeof window.renderInstallmentsTable === 'function') {
                setTimeout(() => {
                    window.renderInstallmentsTable();
                }, 50);
            }
            
            return window.installments;
        } catch (error) {
            console.error('خطأ في تحميل بيانات الأقساط:', error.message);
            
            // محاولة استرداد البيانات الخام في حالة فشل التحليل
            try {
                const rawData = localStorage.getItem('installments');
                console.log('البيانات الخام:', rawData);
                
                // محاولة معالجة البيانات يدويًا إذا كانت موجودة
                if (rawData && rawData.startsWith('[') && rawData.endsWith(']')) {
                    try {
                        window.installments = JSON.parse(rawData);
                        console.log('تم استرداد البيانات بنجاح');
                    } catch (e) {
                        window.installments = [];
                        console.error('فشل تحليل البيانات الخام');
                    }
                } else {
                    window.installments = [];
                }
            } catch (e) {
                window.installments = [];
                console.error('فشل استرداد البيانات الخام:', e.message);
            }
            
            return window.installments;
        }
    };
    
    // 4. تعديل دالة إضافة الأقساط
    if (typeof window.addNewInstallment === 'function') {
        const originalAddInstallment = window.addNewInstallment;
        
        window.addNewInstallment = function() {
            try {
                // استدعاء الدالة الأصلية
                const result = originalAddInstallment.apply(this, arguments);
                
                // تأكيد الحفظ بعد الإضافة
                setTimeout(() => {
                    window.saveInstallmentData(true);
                    
                    // تحديث العرض مرة أخرى للتأكد
                    if (typeof window.renderInstallmentsTable === 'function') {
                        window.renderInstallmentsTable();
                    }
                }, 200);
                
                return result;
            } catch (error) {
                console.error('خطأ في إضافة قسط جديد:', error);
                
                // محاولة إضافة القسط يدويًا
                console.log('محاولة إضافة القسط بالطريقة البديلة...');
                
                try {
                    // الحصول على قيم النموذج
                    const investorId = document.getElementById('installment-investor').value;
                    const title = document.getElementById('installment-title').value;
                    const originalAmount = parseFloat(document.getElementById('original-amount').value) || 0;
                    const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
                    const monthsCount = parseInt(document.getElementById('months-count').value) || 1;
                    const startDate = document.getElementById('start-date').value;
                    const notes = document.getElementById('installment-notes').value || '';
                    
                    if (!investorId || !title || originalAmount <= 0 || monthsCount <= 0 || !startDate) {
                        alert('يرجى إدخال جميع البيانات المطلوبة');
                        return;
                    }
                    
                    // العثور على المستثمر
                    const investor = window.investors.find(inv => inv.id === investorId);
                    if (!investor) {
                        alert('لم يتم العثور على المستثمر');
                        return;
                    }
                    
                    // حساب القيم
                    const interestValue = (originalAmount * interestRate) / 100;
                    const totalAmount = originalAmount + interestValue;
                    const monthlyInstallment = totalAmount / monthsCount;
                    
                    // إنشاء مصفوفة الأقساط الشهرية
                    const monthlyInstallments = [];
                    const startDateObj = new Date(startDate);
                    
                    for (let i = 0; i < monthsCount; i++) {
                        const dueDate = new Date(startDateObj);
                        dueDate.setMonth(dueDate.getMonth() + i);
                        
                        monthlyInstallments.push({
                            installmentNumber: i + 1,
                            amount: monthlyInstallment,
                            dueDate: dueDate.toISOString().split('T')[0],
                            isPaid: false,
                            paidDate: null,
                            paidAmount: 0,
                            notes: ''
                        });
                    }
                    
                    // إنشاء القسط الجديد
                    const newInstallment = {
                        id: Date.now().toString(),
                        investorId,
                        investorName: investor.name,
                        title,
                        originalAmount,
                        interestRate,
                        interestValue,
                        totalAmount,
                        monthsCount,
                        monthlyInstallment,
                        startDate,
                        createdAt: new Date().toISOString(),
                        notes,
                        status: 'active',
                        monthlyInstallments,
                        paidAmount: 0,
                        remainingAmount: totalAmount
                    };
                    
                    // إضافة القسط إلى المصفوفة
                    if (!Array.isArray(window.installments)) {
                        window.installments = [];
                    }
                    
                    window.installments.push(newInstallment);
                    
                    // حفظ البيانات
                    window.saveInstallmentData(true);
                    
                    // إغلاق النافذة
                    if (window.closeModal) {
                        window.closeModal('add-installment-modal');
                    }
                    
                    // عرض رسالة نجاح
                    alert(`تم إضافة قسط ${title} للمستثمر ${investor.name} بنجاح!`);
                } catch (e) {
                    console.error('فشلت المحاولة البديلة:', e);
                    alert('فشلت إضافة القسط. يرجى المحاولة مرة أخرى.');
                }
            }
        };
    }
    
    // 5. إعادة كتابة وظيفة عرض جدول الأقساط
    window.renderInstallmentsTable = function() {
        console.log('عرض جدول الأقساط (النسخة المعززة)...');
        
        try {
            // إذا كانت هناك دالة أصلية، نحاول استخدامها أولاً
            if (originalRenderTable && typeof originalRenderTable === 'function') {
                originalRenderTable();
                return;
            }
            
            // التنفيذ البديل إذا فشلت الدالة الأصلية أو لم تكن موجودة
            renderInstallmentsTableFallback();
        } catch (error) {
            console.error('خطأ في عرض جدول الأقساط:', error);
            // استخدام الدالة البديلة
            renderInstallmentsTableFallback();
        }
    };
    
    // دالة بديلة لعرض جدول الأقساط
    function renderInstallmentsTableFallback() {
        console.log('استخدام الطريقة البديلة لعرض جدول الأقساط...');
        
        // التأكد من تحميل البيانات أولاً
        if (!window.installments || !Array.isArray(window.installments)) {
            window.loadInstallmentData(false);
        }
        
        // الحصول على جسم الجدول
        const tableBody = document.querySelector('#installments-table tbody');
        if (!tableBody) {
            console.error('لم يتم العثور على جدول الأقساط');
            return;
        }
        
        // تفريغ الجدول
        tableBody.innerHTML = '';
        
        if (!window.installments || window.installments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد أقساط</td></tr>';
            return;
        }
        
        // دالة تنسيق العملة
        const formatCurrency = function(amount, addCurrency = true) {
            const formatted = typeof amount === 'number' ? amount.toLocaleString('ar-SA') : amount;
            return addCurrency ? `${formatted} دينار` : formatted;
        };
        
        // ترتيب الأقساط (الأحدث أولاً)
        const sortedInstallments = [...window.installments].sort((a, b) => {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        
        // عرض الأقساط في الجدول
        sortedInstallments.forEach(installment => {
            try {
                // تحديد عدد الأقساط المتبقية
                const remainingInstallments = Array.isArray(installment.monthlyInstallments) ? 
                    installment.monthlyInstallments.filter(inst => !inst.isPaid).length : 0;
                
                // تحديد تاريخ القسط القادم
                let nextDueDate = '-';
                if (Array.isArray(installment.monthlyInstallments)) {
                    const nextInstallment = installment.monthlyInstallments.find(inst => !inst.isPaid);
                    if (nextInstallment) {
                        nextDueDate = nextInstallment.dueDate;
                    }
                }
                
                // تحديد حالة القسط
                let statusClass = 'success';
                let statusText = 'مكتمل';
                
                if (installment.status === 'active') {
                    // التحقق من وجود أقساط متأخرة
                    const today = new Date();
                    let hasOverdue = false;
                    
                    if (Array.isArray(installment.monthlyInstallments)) {
                        hasOverdue = installment.monthlyInstallments.some(inst => 
                            !inst.isPaid && new Date(inst.dueDate) < today
                        );
                    }
                    
                    if (hasOverdue) {
                        statusClass = 'danger';
                        statusText = 'متأخر';
                    } else {
                        statusClass = 'primary';
                        statusText = 'نشط';
                    }
                }
                
                // إنشاء صف الجدول
                const row = document.createElement('tr');
                row.setAttribute('data-id', installment.id);
                
                row.innerHTML = `
                    <td>${installment.id}</td>
                    <td>
                        <div class="investor-info">
                            <div class="investor-avatar">${(installment.investorName || '').charAt(0)}</div>
                            <div>
                                <div class="investor-name">${installment.investorName || ''}</div>
                            </div>
                        </div>
                    </td>
                    <td>${installment.title || ''}</td>
                    <td>${formatCurrency(installment.totalAmount)}</td>
                    <td>${formatCurrency(installment.monthlyInstallment)}</td>
                    <td>${remainingInstallments} من ${installment.monthsCount || 0}</td>
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
                
                // إضافة مستمعي أحداث الأزرار
                const viewBtn = row.querySelector('.view-installment');
                const payBtn = row.querySelector('.pay-installment');
                const deleteBtn = row.querySelector('.delete-installment');
                
                if (viewBtn) {
                    viewBtn.addEventListener('click', function() {
                        if (window.showInstallmentDetails) {
                            window.showInstallmentDetails(installment.id);
                        }
                    });
                }
                
                if (payBtn) {
                    payBtn.addEventListener('click', function() {
                        if (window.openPaymentModalForInstallment) {
                            window.openPaymentModalForInstallment(installment.id);
                        }
                    });
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', function() {
                        if (window.deleteInstallment) {
                            window.deleteInstallment(installment.id);
                        }
                    });
                }
            } catch (error) {
                console.error('خطأ في عرض قسط:', error, installment);
            }
        });
        
        // تحديث إحصائيات الأقساط
        if (typeof window.updateInstallmentStatistics === 'function') {
            try {
                window.updateInstallmentStatistics();
            } catch (error) {
                console.error('خطأ في تحديث إحصائيات الأقساط:', error);
            }
        }
    }
    
    // 6. تصحيح دالة حذف الأقساط
    if (typeof window.deleteInstallment === 'function') {
        const originalDeleteInstallment = window.deleteInstallment;
        
        window.deleteInstallment = function(installmentId) {
            try {
                // استدعاء الدالة الأصلية
                originalDeleteInstallment(installmentId);
                
                // تأكيد الحفظ بعد الحذف
                setTimeout(() => {
                    window.saveInstallmentData(true);
                }, 200);
            } catch (error) {
                console.error('خطأ في حذف القسط:', error);
                
                // الطريقة البديلة للحذف
                if (confirm(`هل أنت متأكد من رغبتك في حذف هذا القسط؟`)) {
                    window.installments = window.installments.filter(inst => inst.id !== installmentId);
                    window.saveInstallmentData(true);
                    alert('تم حذف القسط بنجاح');
                }
            }
        };
    }
    
    // 7. تصحيح دالة عرض الصفحات
    if (typeof window.showPage === 'function') {
        const originalShowPage = window.showPage;
        
        window.showPage = function(pageId) {
            console.log(`عرض الصفحة: ${pageId}`);
            
            if (pageId === 'installments') {
                // تحميل البيانات قبل عرض الصفحة
                window.loadInstallmentData(false);
                
                // إخفاء جميع الصفحات
                document.querySelectorAll('.page').forEach(page => {
                    page.classList.remove('active');
                });
                
                // إظهار صفحة الأقساط
                const installmentsPage = document.getElementById('installments-page');
                if (installmentsPage) {
                    installmentsPage.classList.add('active');
                    
                    // عرض الأقساط بعد إظهار الصفحة
                    setTimeout(() => {
                        window.renderInstallmentsTable();
                    }, 100);
                } else {
                    // إذا لم تكن صفحة الأقساط موجودة، نحاول إنشاءها
                    console.warn('صفحة الأقساط غير موجودة، محاولة إنشائها...');
                    
                    if (typeof window.createInstallmentPage === 'function') {
                        window.createInstallmentPage();
                        
                        setTimeout(() => {
                            const newPage = document.getElementById('installments-page');
                            if (newPage) {
                                newPage.classList.add('active');
                                window.renderInstallmentsTable();
                            }
                        }, 200);
                    } else {
                        console.error('دالة إنشاء صفحة الأقساط غير موجودة');
                        // استدعاء الدالة الأصلية كاحتياط
                        return originalShowPage(pageId);
                    }
                }
            } else {
                // بالنسبة للصفحات الأخرى، نستخدم الدالة الأصلية
                return originalShowPage(pageId);
            }
        };
    }
    
    // 8. تحميل البيانات أولي
    window.loadInstallmentData(false);
    
    // 9. وضع دالة للتحميل عند بداية الصفحة
    window.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            // تحميل البيانات مرة أخرى عند تحميل الصفحة
            window.loadInstallmentData(false);
            
            // إذا كنا في صفحة الأقساط، نقوم بعرض البيانات
            const installmentsPage = document.getElementById('installments-page');
            if (installmentsPage && installmentsPage.classList.contains('active')) {
                window.renderInstallmentsTable();
            }
        }, 500);
    });
    
    // 10. تنفيذ حفظ البيانات دوريًا كاحتياط
    setInterval(() => {
        // حفظ البيانات كل دقيقة بدون إعادة رسم الجدول
        if (window.installments && window.installments.length > 0) {
            console.log('حفظ بيانات الأقساط الاحتياطي...');
            window.saveInstallmentData(false);
        }
    }, 60000);
    
    // تعيين علامة تثبيت الإصلاح
    window.fixedInstallmentStorage = true;
    
    console.log('تم تطبيق الحل الجذري لمشكلة تخزين الأقساط!');
})();