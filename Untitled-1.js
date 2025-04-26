/**
 * إصلاح مشكلة تضارب نظام الأقساط مع نظام الأرباح
 * هذا الملف يحل مشكلة عدم ظهور المستثمرين في نافذة دفع الأرباح
 * عند استخدام نظام الأقساط مع النظام الرئيسي
 * 
 * التحديث: إضافة تنبيه بوجود أقساط على المستثمر في نافذة دفع الأرباح
 * مع إمكانية تسديد القسط مباشرةً من خلال الضغط على الزر
 */

(function() {
    console.log('تطبيق إصلاح تضارب نظام الأقساط مع نظام الأرباح...');
    
    // انتظار تحميل المستند بالكامل
    document.addEventListener('DOMContentLoaded', function() {
        // تأخير تطبيق الإصلاح لضمان تحميل جميع العناصر
        setTimeout(fixProfitPaymentIssue, 1000);
    });

    /**
     * إصلاح مشكلة دفع الأرباح
     */
    function fixProfitPaymentIssue() {
        // 1. تعديل دالة فتح نافذة دفع الأرباح
        patchOpenProfitModalFunction();
        
        // 2. تعديل دالة تحميل قوائم المستثمرين في نظام الأقساط
        patchInstallmentInvestorSelectFunction();
        
        // 3. إضافة معالج أحداث لفتح نافذة دفع الأرباح
        addProfitModalEventHandler();
        
        // 4. تعديل دالة showModal إذا كانت غير موجودة
        ensureShowModalFunction();
        
        console.log('تم تطبيق إصلاح مشكلة دفع الأرباح بنجاح');
    }
    
    /**
     * التأكد من وجود دالة showModal
     */
    function ensureShowModalFunction() {
        // التحقق مما إذا كانت دالة showModal معرفة بالفعل
        if (typeof window.showModal !== 'function') {
            console.log('دالة showModal غير معرفة، جاري تعريفها...');
            
            // تعريف دالة showModal
            window.showModal = function(title, content) {
                console.log(`عرض نافذة: ${title}`);
                
                // إنشاء عناصر النافذة المنبثقة
                const modalOverlay = document.createElement('div');
                modalOverlay.className = 'modal-overlay';
                modalOverlay.id = 'custom-modal-' + Date.now();
                
                modalOverlay.innerHTML = `
                    <div class="modal animate__animated animate__fadeInUp">
                        <div class="modal-header">
                            <h3 class="modal-title">${title}</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-outline modal-close-btn">إغلاق</button>
                        </div>
                    </div>
                `;
                
                // إضافة النافذة للصفحة
                document.body.appendChild(modalOverlay);
                
                // إظهار النافذة
                setTimeout(() => {
                    modalOverlay.classList.add('active');
                }, 50);
                
                // إضافة مستمعي الأحداث
                const closeButtons = modalOverlay.querySelectorAll('.modal-close, .modal-close-btn');
                closeButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        modalOverlay.classList.remove('active');
                        setTimeout(() => {
                            document.body.removeChild(modalOverlay);
                        }, 300);
                    });
                });
                
                // إغلاق النافذة عند النقر خارجها
                modalOverlay.addEventListener('click', (e) => {
                    if (e.target === modalOverlay) {
                        modalOverlay.classList.remove('active');
                        setTimeout(() => {
                            document.body.removeChild(modalOverlay);
                        }, 300);
                    }
                });
                
                return modalOverlay;
            };
    
    /**
     * تعديل دالة فتح نافذة دفع الأرباح
     */
    function patchOpenProfitModalFunction() {
        // التحقق من وجود النافذة المنبثقة لدفع الأرباح
        const payProfitModal = document.getElementById('pay-profit-modal');
        if (!payProfitModal) {
            console.log('نافذة دفع الأرباح غير موجودة');
            return;
        }
        
        // حفظ الدالة الأصلية
        const originalOpenModal = window.openModal;
        
        // استبدال دالة فتح النافذة المنبثقة بنسخة معدلة
        window.openModal = function(modalId) {
            console.log(`فتح النافذة: ${modalId}`);
            
            // استدعاء الدالة الأصلية لفتح النافذة
            if (originalOpenModal) {
                originalOpenModal(modalId);
            } else {
                // إذا لم تكن الدالة الأصلية موجودة
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('active');
                }
            }
            
            // تنفيذ معالجة خاصة لنافذة دفع الأرباح
            if (modalId === 'pay-profit-modal') {
                console.log('جاري تعبئة قائمة المستثمرين في نافذة دفع الأرباح...');
                
                // تأكد من تحميل قوائم المستثمرين
                ensureProfitInvestorSelectPopulated();
            }
        };
        
        console.log('تم تعديل دالة فتح النافذة المنبثقة');
    }
    
    /**
     * تعديل دالة تحميل قائمة المستثمرين في نظام الأقساط
     */
    function patchInstallmentInvestorSelectFunction() {
        // إذا كانت دالة تحميل المستثمرين في نظام الأقساط موجودة
        if (typeof window.populateInvestorSelects === 'function') {
            // حفظ الدالة الأصلية
            const originalPopulateInvestorSelects = window.populateInvestorSelects;
            
            // استبدال الدالة بنسخة معدلة
            window.populateInvestorSelects = function() {
                console.log('تعبئة قائمة المستثمرين (النسخة المعدلة)...');
                
                // استدعاء النسخة الأصلية
                originalPopulateInvestorSelects();
                
                // التأكد من عدم التأثير على قائمة المستثمرين في نافذة دفع الأرباح
                const profitInvestorSelect = document.getElementById('profit-investor');
                if (profitInvestorSelect) {
                    // تعبئة قائمة المستثمرين في نافذة دفع الأرباح من النظام الرئيسي
                    ensureProfitInvestorSelectPopulated();
                }
            };
            
            console.log('تم تعديل دالة تحميل قائمة المستثمرين في نظام الأقساط');
        }
    }
    
    /**
     * إضافة معالج أحداث لفتح نافذة دفع الأرباح
     */
    function addProfitModalEventHandler() {
        // العثور على زر فتح نافذة دفع الأرباح
        const payProfitsBtn = document.getElementById('pay-profits-btn');
        if (payProfitsBtn) {
            // إزالة مستمعي الأحداث السابقة عبر نسخ العنصر واستبداله
            const newPayProfitsBtn = payProfitsBtn.cloneNode(true);
            payProfitsBtn.parentNode.replaceChild(newPayProfitsBtn, payProfitsBtn);
            
            // إضافة مستمع حدث جديد
            newPayProfitsBtn.addEventListener('click', function() {
                // فتح نافذة دفع الأرباح
                openModal('pay-profit-modal');
                
                // التأكد من تحميل قائمة المستثمرين
                setTimeout(ensureProfitInvestorSelectPopulated, 100);
            });
            
            console.log('تم إعادة تعيين مستمع الحدث لزر دفع الأرباح');
        }
    }
    
    /**
     * التأكد من تعبئة قائمة المستثمرين في نافذة دفع الأرباح
     */
    function ensureProfitInvestorSelectPopulated() {
        console.log('التأكد من تعبئة قائمة المستثمرين في نافذة دفع الأرباح...');
        
        const profitInvestorSelect = document.getElementById('profit-investor');
        if (!profitInvestorSelect) {
            console.warn('لم يتم العثور على قائمة المستثمرين في نافذة دفع الأرباح');
            return;
        }
        
        // التحقق مما إذا كانت القائمة فارغة أو تحتوي فقط على خيار واحد (الافتراضي)
        if (profitInvestorSelect.options.length <= 1) {
            console.log('قائمة المستثمرين فارغة، جاري تعبئتها...');
            
            // تحميل المستثمرين من النظام الرئيسي
            if (window.investors && Array.isArray(window.investors)) {
                // ترتيب المستثمرين أبجديًا
                const sortedInvestors = [...window.investors].sort((a, b) => 
                    a.name.localeCompare(b.name)
                );
                
                // تفريغ القائمة
                profitInvestorSelect.innerHTML = '<option value="">اختر المستثمر</option>';
                
                // تعبئة القائمة بالمستثمرين
                sortedInvestors.forEach(investor => {
                    const option = document.createElement('option');
                    option.value = investor.id;
                    option.textContent = `${investor.name} (${investor.phone || ''})`;
                    profitInvestorSelect.appendChild(option);
                });
                
                console.log(`تم تعبئة قائمة المستثمرين بـ ${sortedInvestors.length} مستثمر`);
                
                // تنفيذ حدث تغيير للتأكد من تحديث واجهة المستخدم
                if (typeof window.calculateProfitForInvestor === 'function') {
                    const event = new Event('change');
                    profitInvestorSelect.dispatchEvent(event);
                }
            } else {
                console.warn('مصفوفة المستثمرين غير موجودة أو ليست مصفوفة');
            }
        } else {
            console.log('قائمة المستثمرين في نافذة دفع الأرباح ممتلئة بالفعل');
        }
        
        // إضافة مستمع حدث لتغيير المستثمر لعرض معلومات الأقساط
        profitInvestorSelect.addEventListener('change', function() {
            checkInvestorInstallments(this.value);
        });
    }
    
    /**
     * التحقق من وجود أقساط على المستثمر
     * @param {string} investorId - معرف المستثمر
     */
    function checkInvestorInstallments(investorId) {
        console.log(`التحقق من وجود أقساط على المستثمر: ${investorId}`);
        
        // التحقق من وجود معرف المستثمر
        if (!investorId) return;
        
        // التحقق من وجود نظام الأقساط ومصفوفة الأقساط
        if (!window.installments || !Array.isArray(window.installments)) {
            console.log('نظام الأقساط غير متاح أو لا توجد أقساط مسجلة');
            return;
        }
        
        // البحث عن أقساط المستثمر
        const investorInstallments = window.installments.filter(
            inst => inst.investorId === investorId && inst.status === 'active'
        );
        
        // إنشاء عنصر لعرض معلومات الأقساط
        const installmentInfoContainer = document.getElementById('installment-info-container');
        
        // إذا كان العنصر موجودًا، نقوم بإزالته
        if (installmentInfoContainer) {
            installmentInfoContainer.remove();
        }
        
        // إذا لم تكن هناك أقساط، لا نعرض شيئًا
        if (investorInstallments.length === 0) {
            console.log('لا توجد أقساط نشطة لهذا المستثمر');
            return;
        }
        
        // التحقق من وجود العنصر الذي سنضيف إليه معلومات الأقساط
        const profitDetails = document.getElementById('profit-details');
        if (!profitDetails) {
            console.warn('لم يتم العثور على عنصر تفاصيل الأرباح');
            return;
        }
        
        // إنشاء عنصر لعرض معلومات الأقساط
        const installmentInfo = document.createElement('div');
        installmentInfo.id = 'installment-info-container';
        installmentInfo.className = 'installment-info-container alert alert-warning mt-3';
        
        // إنشاء محتوى العنصر
        let infoContent = `
            <h4><i class="fas fa-exclamation-triangle"></i> تنبيه: يوجد أقساط مستحقة على المستثمر</h4>
            <p>هذا المستثمر لديه ${investorInstallments.length} من الأقساط النشطة:</p>
            <ul class="installment-list">
        `;
        
        // إضافة تفاصيل كل قسط
        investorInstallments.forEach(installment => {
            // البحث عن أول قسط غير مدفوع
            const nextInstallment = installment.monthlyInstallments.find(inst => !inst.isPaid);
            if (!nextInstallment) return;
            
            infoContent += `
                <li>
                    <div class="installment-item">
                        <div class="installment-details">
                            <strong>${installment.title}</strong>
                            <div>القسط الشهري: ${formatCurrency(installment.monthlyInstallment)}</div>
                            <div>الاستحقاق القادم: ${nextInstallment.dueDate}</div>
                        </div>
                        <button class="btn btn-sm btn-warning pay-installment-btn" data-id="${installment.id}">
                            <i class="fas fa-hand-holding-usd"></i>
                            تسديد قسط
                        </button>
                    </div>
                </li>
            `;
        });
        
        infoContent += `
            </ul>
            <div class="installment-actions mt-2">
                <button class="btn btn-outline-secondary btn-sm view-all-installments-btn">
                    <i class="fas fa-list-ul"></i>
                    عرض جميع الأقساط
                </button>
            </div>
        `;
        
        // إضافة المحتوى إلى العنصر
        installmentInfo.innerHTML = infoContent;
        
        // إضافة العنصر إلى تفاصيل الأرباح
        profitDetails.insertAdjacentElement('afterend', installmentInfo);
        
        // إضافة أنماط CSS للمعلومات
        addInstallmentInfoStyles();
        
        // إضافة مستمعي الأحداث للأزرار
        installmentInfo.querySelectorAll('.pay-installment-btn').forEach(button => {
            button.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                handlePayInstallment(installmentId);
            });
        });
        
        // إضافة مستمع الحدث لزر عرض جميع الأقساط
        installmentInfo.querySelector('.view-all-installments-btn').addEventListener('click', function() {
            showAllInvestorInstallments(investorId);
        });
    }
    
    /**
     * معالجة تسديد القسط
     * @param {string} installmentId - معرف القسط
     */
    function handlePayInstallment(installmentId) {
        console.log(`معالجة تسديد القسط: ${installmentId}`);
        
        // إغلاق نافذة دفع الأرباح
        closeModal('pay-profit-modal');
        
        // استدعاء دالة فتح نافذة دفع القسط من نظام الأقساط
        if (window.openPaymentModalForInstallment) {
            setTimeout(() => {
                window.openPaymentModalForInstallment(installmentId);
            }, 300);
        } else {
            console.warn('دالة فتح نافذة دفع القسط غير متاحة');
            showNotification('دالة فتح نافذة دفع القسط غير متاحة', 'error');
        }
    }
    
    /**
     * عرض جميع أقساط المستثمر
     * @param {string} investorId - معرف المستثمر
     */
    function showAllInvestorInstallments(investorId) {
        console.log(`عرض جميع أقساط المستثمر: ${investorId}`);
        
        // التحقق من وجود نظام الأقساط ومصفوفة الأقساط
        if (!window.installments || !Array.isArray(window.installments)) {
            console.warn('نظام الأقساط غير متاح أو لا توجد أقساط مسجلة');
            showNotification('نظام الأقساط غير متاح', 'error');
            return;
        }
        
        // البحث عن المستثمر
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor) {
            console.warn(`لم يتم العثور على المستثمر: ${investorId}`);
            return;
        }
        
        // البحث عن أقساط المستثمر
        const investorInstallments = window.installments.filter(inst => inst.investorId === investorId);
        
        // إذا لم تكن هناك أقساط، نعرض رسالة
        if (investorInstallments.length === 0) {
            showNotification('لا توجد أقساط لهذا المستثمر', 'info');
            return;
        }
        
        // إنشاء محتوى النافذة
        let content = `
            <div class="investor-installments-container">
                <h3 class="mt-0 mb-3">أقساط المستثمر: ${investor.name}</h3>
                <div class="installments-list">
        `;
        
        // إضافة تفاصيل كل قسط
        investorInstallments.forEach(installment => {
            // تحديد حالة القسط
            let statusClass = 'success';
            let statusText = 'مكتمل';
            
            if (installment.status === 'active') {
                // التحقق من وجود أقساط متأخرة
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
            
            // حساب عدد الأقساط المتبقية
            const remainingInstallments = installment.monthlyInstallments.filter(inst => !inst.isPaid).length;
            
            // البحث عن أول قسط غير مدفوع
            const nextInstallment = installment.monthlyInstallments.find(inst => !inst.isPaid);
            const nextDueDate = nextInstallment ? nextInstallment.dueDate : '-';
            
            // إضافة تفاصيل القسط
            content += `
                <div class="installment-card">
                    <div class="installment-card-header">
                        <h4>${installment.title}</h4>
                        <span class="badge badge-${statusClass}">${statusText}</span>
                    </div>
                    <div class="installment-card-body">
                        <div class="installment-info-row">
                            <div class="installment-info-label">المبلغ الكلي:</div>
                            <div class="installment-info-value">${formatCurrency(installment.totalAmount)}</div>
                        </div>
                        <div class="installment-info-row">
                            <div class="installment-info-label">القسط الشهري:</div>
                            <div class="installment-info-value">${formatCurrency(installment.monthlyInstallment)}</div>
                        </div>
                        <div class="installment-info-row">
                            <div class="installment-info-label">الأقساط المتبقية:</div>
                            <div class="installment-info-value">${remainingInstallments} من ${installment.monthsCount}</div>
                        </div>
                        <div class="installment-info-row">
                            <div class="installment-info-label">تاريخ القسط القادم:</div>
                            <div class="installment-info-value">${nextDueDate !== '-' ? nextDueDate : 'مكتمل'}</div>
                        </div>
                        <div class="installment-info-row">
                            <div class="installment-info-label">المبلغ المدفوع:</div>
                            <div class="installment-info-value">${formatCurrency(installment.paidAmount)}</div>
                        </div>
                        <div class="installment-info-row">
                            <div class="installment-info-label">المبلغ المتبقي:</div>
                            <div class="installment-info-value">${formatCurrency(installment.remainingAmount)}</div>
                        </div>
                    </div>
                    ${installment.status !== 'completed' ? `
                    <div class="installment-card-footer">
                        <button class="btn btn-sm btn-warning pay-installment-btn" data-id="${installment.id}">
                            <i class="fas fa-hand-holding-usd"></i>
                            تسديد قسط
                        </button>
                        <button class="btn btn-sm btn-info view-installment-details-btn" data-id="${installment.id}">
                            <i class="fas fa-eye"></i>
                            عرض التفاصيل
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
        });
        
        content += `
                </div>
            </div>
        `;
        
        // إضافة أنماط CSS للنافذة
        addInstallmentModalStyles();
        
        // عرض النافذة
        const modalOverlay = showModal(`أقساط المستثمر: ${investor.name}`, content);
        
        // إضافة مستمعي الأحداث للأزرار
        modalOverlay.querySelectorAll('.pay-installment-btn').forEach(button => {
            button.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                
                // إغلاق النافذة الحالية
                modalOverlay.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modalOverlay);
                    
                    // فتح نافذة دفع القسط
                    handlePayInstallment(installmentId);
                }, 300);
            });
        });
        
        // إضافة مستمعي الأحداث لأزرار عرض التفاصيل
        modalOverlay.querySelectorAll('.view-installment-details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                
                // إغلاق النافذة الحالية
                modalOverlay.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modalOverlay);
                    
                    // فتح نافذة تفاصيل القسط
                    if (window.showInstallmentDetails) {
                        window.showInstallmentDetails(installmentId);
                    } else {
                        console.warn('دالة عرض تفاصيل القسط غير متاحة');
                        showNotification('دالة عرض تفاصيل القسط غير متاحة', 'error');
                    }
                }, 300);
            });
        });
    }
    
    /**
     * إضافة أنماط CSS لمعلومات الأقساط
     */
    function addInstallmentInfoStyles() {
        // التحقق من وجود أنماط مسبقة
        if (document.getElementById('installment-info-styles')) {
            return;
        }
        
        // إنشاء عنصر نمط جديد
        const styleElement = document.createElement('style');
        styleElement.id = 'installment-info-styles';
        
        // إضافة أنماط CSS
        styleElement.textContent = `
            .installment-info-container {
                background-color: #fff3cd;
                color: #856404;
                border: 1px solid #ffeeba;
                border-radius: 8px;
                padding: 15px;
                margin-top: 20px;
                margin-bottom: 20px;
            }
            
            .installment-info-container h4 {
                margin-top: 0;
                margin-bottom: 10px;
                font-size: 18px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .installment-list {
                list-style: none;
                padding: 0;
                margin: 10px 0;
            }
            
            .installment-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: rgba(255, 255, 255, 0.7);
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 8px;
            }
            
            .installment-details {
                flex: 1;
            }
            
            .installment-details strong {
                display: block;
                margin-bottom: 5px;
            }
            
            .installment-details div {
                font-size: 14px;
                margin-bottom: 2px;
            }
            
            .installment-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
            
            .pay-installment-btn, .view-all-installments-btn {
                white-space: nowrap;
            }
        `;
        
        // إضافة عنصر النمط إلى رأس الصفحة
        document.head.appendChild(styleElement);
        console.log('تم إضافة أنماط CSS لمعلومات الأقساط');
    }
    
    /**
     * إضافة أنماط CSS لنافذة الأقساط
     */
    function addInstallmentModalStyles() {
        // التحقق من وجود أنماط مسبقة
        if (document.getElementById('installment-modal-styles')) {
            return;
        }
        
        // إنشاء عنصر نمط جديد
        const styleElement = document.createElement('style');
        styleElement.id = 'installment-modal-styles';
        
        // إضافة أنماط CSS
        styleElement.textContent = `
            .investor-installments-container {
                max-height: 70vh;
                overflow-y: auto;
                padding-right: 10px;
            }
            
            .installments-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 15px;
            }
            
            .installment-card {
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .installment-card-header {
                background-color: #f8f9fa;
                padding: 12px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #eaecef;
            }
            
            .installment-card-header h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .installment-card-body {
                padding: 15px;
            }
            
            .installment-info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding-bottom: 8px;
                border-bottom: 1px dashed #eaecef;
            }
            
            .installment-info-label {
                font-weight: 500;
                color: #6c757d;
            }
            
            .installment-info-value {
                font-weight: 600;
                color: #3b82f6;
            }
            
            .installment-card-footer {
                padding: 12px 15px;
                display: flex;
                justify-content: space-between;
                gap: 8px;
                background-color: #f8f9fa;
                border-top: 1px solid #eaecef;
            }
            
            @media (max-width: 768px) {
                .installments-list {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        // إضافة عنصر النمط إلى رأس الصفحة
        document.head.appendChild(styleElement);
        console.log('تم إضافة أنماط CSS لنافذة الأقساط');
    }
})();