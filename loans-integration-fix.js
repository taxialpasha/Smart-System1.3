/**
 * ملف التكامل الشامل - حل جميع المشاكل
 * يضمن عمل النظام بشكل صحيح مع الصفحة الرئيسية
 */

(function() {
    'use strict';
    
    /**
     * دالة إصلاح المشاكل الرئيسية
     */
    function fixLoanSystemIssues() {
        console.log('بدء إصلاح مشاكل نظام القروض...');
        
        // إصلاح الدوال المفقودة
        setupMissingFunctions();
        
        // إصلاح النوافذ المنبثقة
        fixModals();
        
        // إصلاح ربط الأحداث
        setupEvents();
        
        // إصلاح عرض الصور والمستمسكات
        fixImageHandling();
        
        // تحديث الواجهة
        updateUI();
        
        console.log('تم إصلاح المشاكل بنجاح');
    }
    
    /**
     * إعداد الدوال المفقودة
     */
    function setupMissingFunctions() {
        // دالة createNavItem إذا لم تكن موجودة
        if (typeof createNavItem === 'undefined') {
            window.createNavItem = function(title, icon, page) {
                const navItem = document.createElement('li');
                navItem.className = 'nav-item';
                navItem.innerHTML = `
                    <a class="nav-link" data-page="${page}" href="#">
                        <div class="nav-icon">
                            <i class="${icon}"></i>
                        </div>
                        <span>${title}</span>
                    </a>
                `;
                
                navItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    showLoanPage(page);
                });
                
                return navItem;
            };
        }
        
        // دالة editLoan إذا لم تكن موجودة
        if (typeof editLoan === 'undefined') {
            window.editLoan = function(loanId) {
                console.log('تعديل القرض:', loanId);
                // يمكن إضافة المنطق هنا لاحقاً
            };
        }
        
        // دالة editInstallment إذا لم تكن موجودة
        if (typeof editInstallment === 'undefined') {
            window.editInstallment = function(installmentId) {
                console.log('تعديل القسط:', installmentId);
                // يمكن إضافة المنطق هنا لاحقاً
            };
        }
        
        // دالة printLoanDetails إذا لم تكن موجودة
        if (typeof printLoanDetails === 'undefined') {
            window.printLoanDetails = function(loanId) {
                console.log('طباعة تفاصيل القرض:', loanId);
                // يمكن إضافة المنطق هنا لاحقاً
            };
        }
        
        // دالة renewLoan إذا لم تكن موجودة
        if (typeof renewLoan === 'undefined') {
            window.renewLoan = function(loanId) {
                console.log('تجديد القرض:', loanId);
                // يمكن إضافة المنطق هنا لاحقاً
            };
        }
        
        // دالة cancelLoan إذا لم تكن موجودة
        if (typeof cancelLoan === 'undefined') {
            window.cancelLoan = function(loanId) {
                console.log('إلغاء القرض:', loanId);
                // يمكن إضافة المنطق هنا لاحقاً
            };
        }
    }
    
    /**
     * إصلاح النوافذ المنبثقة
     */
    function fixModals() {
        document.body.addEventListener('click', function(e) {
            const target = e.target;
            
            // إغلاق النوافذ المنبثقة
            if (target.classList.contains('modal-close') || target.classList.contains('modal-overlay')) {
                let modal = target.closest('.modal-overlay');
                if (modal) {
                    modal.classList.remove('active');
                }
            }
            
            // فتح نوافذ إضافة القرض
            if (target.closest('#add-loan-btn')) {
                openModal('add-loan-modal');
            }
        });
    }
    
    /**
     * إعداد الأحداث المفقودة
     */
    function setupEvents() {
        // استخدام التفويض للأحداث (Event Delegation)
        document.body.addEventListener('click', function(e) {
            const target = e.target;
            
            // التعامل مع أزرار دفع القسط
            const payInstallmentBtn = target.closest('.pay-installment-btn');
            if (payInstallmentBtn) {
                e.preventDefault();
                const loanId = payInstallmentBtn.getAttribute('data-id');
                openPayInstallmentModal(loanId);
            }
            
            // التعامل مع أزرار عرض تفاصيل القرض
            const viewLoanBtn = target.closest('.view-loan-btn');
            if (viewLoanBtn) {
                e.preventDefault();
                const loanId = viewLoanBtn.getAttribute('data-id');
                openLoanDetailsModal(loanId);
            }
            
            // التعامل مع أزرار تعديل القرض
            const editLoanBtn = target.closest('.edit-loan-btn');
            if (editLoanBtn) {
                e.preventDefault();
                const loanId = editLoanBtn.getAttribute('data-id');
                editLoan(loanId);
            }
            
            // التعامل مع أزرار حذف القرض
            const deleteLoanBtn = target.closest('.delete-loan-btn');
            if (deleteLoanBtn) {
                e.preventDefault();
                const loanId = deleteLoanBtn.getAttribute('data-id');
                deleteLoan(loanId);
            }
            
            // التعامل مع أزرار تصفية القروض
            if (target.hasAttribute('data-loan-type')) {
                document.querySelectorAll('[data-loan-type]').forEach(btn => {
                    btn.classList.remove('active');
                });
                target.classList.add('active');
                renderLoansTable(target.getAttribute('data-loan-type'));
            }
            
            // التعامل مع أزرار تصفية الأقساط
            if (target.hasAttribute('data-installment-status')) {
                document.querySelectorAll('[data-installment-status]').forEach(btn => {
                    btn.classList.remove('active');
                });
                target.classList.add('active');
                renderInstallmentsTable(target.getAttribute('data-installment-status'));
            }
        });
    }
    
    /**
     * إصلاح معالجة الصور والمستمسكات
     */
    function fixImageHandling() {
        // تحديث دالة تخزين الصور
        window.storeImages = function(files, prefix) {
            if (!files) return [];
            
            const imagePromises = [];
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                
                const promise = new Promise((resolve, reject) => {
                    reader.onload = function(e) {
                        resolve({
                            name: file.name,
                            type: file.type,
                            data: e.target.result,
                            size: file.size
                        });
                    };
                    
                    reader.onerror = function() {
                        reject(new Error('فشل في قراءة الملف'));
                    };
                    
                    reader.readAsDataURL(file);
                });
                
                imagePromises.push(promise);
            }
            
            return Promise.all(imagePromises);
        };
        
        // إصلاح معاينة الصور
        window.previewImage = function(input, previewId) {
            const preview = document.getElementById(previewId);
            if (!preview) return;
            
            preview.innerHTML = '';
            
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const filePreview = document.createElement('div');
                    filePreview.className = 'file-preview';
                    
                    filePreview.innerHTML = `
                        <img src="${e.target.result}" alt="معاينة" style="max-width: 150px; max-height: 150px;"/>
                        <div class="file-info">
                            <span class="file-name">${input.files[0].name}</span>
                            <span class="file-size">${(input.files[0].size / 1024).toFixed(2)} KB</span>
                        </div>
                    `;
                    
                    preview.appendChild(filePreview);
                };
                
                reader.readAsDataURL(input.files[0]);
            }
        };
        
        // إضافة دالة openPayInstallmentByIdModal إذا لم تكن موجودة
        if (typeof openPayInstallmentByIdModal === 'undefined') {
            window.openPayInstallmentByIdModal = function(installmentId) {
                const installment = window.installments.find(i => i.id === installmentId);
                if (!installment) {
                    showNotification('لم يتم العثور على القسط', 'error');
                    return;
                }
                
                // فتح نافذة الدفع مع تحديد القسط
                const modal = document.getElementById('pay-installment-modal');
                if (modal) {
                    document.getElementById('payment-loan-id').value = installment.loanId;
                    document.getElementById('payment-installment-id').value = installmentId;
                    document.getElementById('payment-amount').value = installment.amount - installment.paidAmount;
                    openModal('pay-installment-modal');
                }
            };
        }
    }
    
    /**
     * تحديث الواجهة
     */
    function updateUI() {
        // إنشاء الصفحات إذا لم تكن موجودة
        if (!document.getElementById('loans-dashboard-page')) {
            createLoansDashboardPage();
        }
        
        if (!document.getElementById('borrowers-page')) {
            createBorrowersPage();
        }
        
        if (!document.getElementById('active-installments-page')) {
            createActiveInstallmentsPage();
        }
        
        if (!document.getElementById('paid-installments-page')) {
            createPaidInstallmentsPage();
        }
        
        // إنشاء النوافذ المنبثقة إذا لم تكن موجودة
        if (!document.getElementById('add-loan-modal')) {
            createAddLoanModal();
        }
        
        if (!document.getElementById('loan-details-modal')) {
            createLoanDetailsModal();
        }
        
        if (!document.getElementById('pay-installment-modal')) {
            createPayInstallmentModal();
        }
        
        // تحديث البيانات
        refreshLoansUI();
        
        // إصلاح الأنماط CSS إذا لم تكن موجودة
        if (!document.getElementById('loan-management-styles')) {
            addLoanManagementStyles();
        }
    }
    
    /**
     * إضافة أنماط CSS مخصصة
     */
    function addLoanManagementStyles() {
        const styleElement = document.createElement('style');
        styleElement.id = 'loan-management-styles';
        
        styleElement.textContent = `
            /* أنماط عامة */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: none;
                z-index: 1000;
            }
            
            .modal-overlay.active {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .modal {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 500px;
                width: 100%;
                margin: 20px;
            }
            
            .wide-modal {
                max-width: 1000px;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .modal-close:hover {
                color: #000;
            }
            
            .btn {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                font-size: 14px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-primary {
                background-color: #2563eb;
                color: white;
            }
            
            .btn-outline {
                border: 1px solid #d1d5db;
                background-color: white;
                color: #374151;
            }
            
            .btn-danger {
                background-color: #dc2626;
                color: white;
            }
            
            .btn-success {
                background-color: #059669;
                color: white;
            }
            
            .btn:hover {
                opacity: 0.9;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .form-input,
            .form-select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
            }
            
            .grid-cols-2 {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
            }
            
            .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .badge-success {
                background-color: #ecfdf5;
                color: #059669;
            }
            
            .badge-danger {
                background-color: #fee2e2;
                color: #dc2626;
            }
            
            .badge-warning {
                background-color: #fef3c7;
                color: #d97706;
            }
            
            .badge-info {
                background-color: #dbeafe;
                color: #2563eb;
            }
            
            .badge-secondary {
                background-color: #f3f4f6;
                color: #4b5563;
            }
            
            .badge-primary {
                background-color: #dbeafe;
                color: #2563eb;
            }
            
            .file-preview {
                margin-top: 8px;
                padding: 8px;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
            }
            
            .file-preview img {
                max-width: 100%;
                margin-bottom: 8px;
            }
            
            .file-info {
                font-size: 12px;
                color: #666;
            }
            
            .document-upload {
                min-height: 40px;
                border: 1px dashed #d1d5db;
                border-radius: 4px;
                margin-bottom: 16px;
            }
            
            .document-upload-label {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                cursor: pointer;
            }
            
            .tab-buttons {
                display: flex;
                border-bottom: 1px solid #e5e7eb;
                margin-bottom: 20px;
            }
            
            .tab-btn {
                padding: 8px 16px;
                background: none;
                border: none;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                margin-bottom: -1px;
            }
            
            .tab-btn.active {
                border-bottom-color: #2563eb;
                color: #2563eb;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 24px;
                border-radius: 4px;
                color: white;
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 9999;
            }
            
            .notification-success {
                background-color: #059669;
            }
            
            .notification-error {
                background-color: #dc2626;
            }
            
            .page {
                display: none;
            }
            
            .page.active {
                display: block;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    /**
     * إصلاح شامل لمشاكل الصور
     */
    function fixImageUploadIssues() {
        // التأكد من معالجة رفع الصور بشكل صحيح
        document.addEventListener('change', function(e) {
            const fileInput = e.target;
            
            if (fileInput.type === 'file') {
                const previewId = fileInput.id + '-preview';
                const preview = document.getElementById(previewId);
                
                if (preview) {
                    preview.innerHTML = '';
                    
                    if (fileInput.files && fileInput.files[0]) {
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            const div = document.createElement('div');
                            div.className = 'file-preview';
                            div.innerHTML = `
                                <img src="${e.target.result}" alt="معاينة" style="max-width: 150px; max-height: 150px;"/>
                                <div class="file-info">
                                    <span class="file-name">${fileInput.files[0].name}</span>
                                    <span class="file-size">${(fileInput.files[0].size / 1024).toFixed(2)} KB</span>
                                </div>
                            `;
                            preview.appendChild(div);
                        };
                        
                        reader.readAsDataURL(fileInput.files[0]);
                    }
                }
            }
        });
    }
    
    /**
     * تهيئة النظام بالكامل
     */
    function initLoanSystemIntegration() {
        try {
            // انتظار تحميل DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', fixLoanSystemIssues);
            } else {
                fixLoanSystemIssues();
            }
            
            // إضافة معالجة الأخطاء العامة
            window.onerror = function(msg, url, lineNo, columnNo, error) {
                console.error('خطأ:', msg, 'في السطر:', lineNo);
                return false;
            };
            
            // إصلاح مشاكل الصور
            fixImageUploadIssues();
            
            console.log('تم تهيئة نظام القروض بنجاح');
        } catch (error) {
            console.error('خطأ في تهيئة النظام:', error);
        }
    }
    
    // تشغيل التكامل
    initLoanSystemIntegration();
})();