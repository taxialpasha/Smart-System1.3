/**
 * حل نهائي لجميع المشاكل المتبقية في نظام القروض
 */

// التأكد من تحميل جميع الدوال المطلوبة
(function() {
    'use strict';
    
    // تحديث دالة حفظ القرض لتشمل تخزين الصور بشكل صحيح
    function saveLoanWithImages() {
        const loanData = {
            id: Date.now().toString(),
            type: document.getElementById('loan-type').value,
            amount: parseFloat(document.getElementById('loan-amount').value),
            interestRate: parseFloat(document.getElementById('loan-interest-rate').value),
            period: parseInt(document.getElementById('loan-period').value),
            startDate: document.getElementById('loan-start-date').value,
            notes: document.getElementById('loan-notes').value || '',
            status: 'نشط',
            createdAt: new Date().toISOString(),
            documents: {}, // تخزين الصور هنا
            borrower: {
                name: document.getElementById('borrower-name').value,
                phone: document.getElementById('borrower-phone').value,
                address: document.getElementById('borrower-address').value,
                salary: parseFloat(document.getElementById('borrower-salary').value) || 0,
                workplace: document.getElementById('borrower-workplace').value || '',
                notes: document.getElementById('borrower-notes').value || ''
            }
        };
        
        // جمع صور المستمسكات
        const documentTypes = [
            { id: 'national_id', name: 'البطاقة الموحدة', requireBack: true },
            { id: 'residence_card', name: 'بطاقة السكن', requireBack: true },
            { id: 'department_confirmation', name: 'تأييد الدائرة', requireBack: false }
        ];
        
        documentTypes.forEach(doc => {
            const frontFile = document.getElementById(`${doc.id}-front`).files[0];
            const backFile = doc.requireBack ? document.getElementById(`${doc.id}-back`).files[0] : null;
            
            if (frontFile) {
                const reader = new FileReader();
                reader.readAsDataURL(frontFile);
                reader.onload = () => {
                    loanData.documents[`${doc.id}_front`] = reader.result;
                };
            }
            
            if (backFile) {
                const reader = new FileReader();
                reader.readAsDataURL(backFile);
                reader.onload = () => {
                    loanData.documents[`${doc.id}_back`] = reader.result;
                };
            }
        });
        
        // جمع بيانات الكفلاء
        loanData.guarantors = [];
        document.querySelectorAll('.guarantor-item').forEach(item => {
            const guarantorId = item.id.split('-')[1];
            const guarantor = {
                id: guarantorId,
                name: document.getElementById(`guarantor-name-${guarantorId}`).value,
                phone: document.getElementById(`guarantor-phone-${guarantorId}`).value,
                address: document.getElementById(`guarantor-address-${guarantorId}`).value,
                workplace: document.getElementById(`guarantor-workplace-${guarantorId}`).value || '',
                documents: {}
            };
            
            // حفظ صور الكفيل
            const frontFile = document.getElementById(`guarantor-id-front-${guarantorId}`).files[0];
            const backFile = document.getElementById(`guarantor-id-back-${guarantorId}`).files[0];
            
            if (frontFile) {
                const reader = new FileReader();
                reader.readAsDataURL(frontFile);
                reader.onload = () => {
                    guarantor.documents.id_front = reader.result;
                };
            }
            
            if (backFile) {
                const reader = new FileReader();
                reader.readAsDataURL(backFile);
                reader.onload = () => {
                    guarantor.documents.id_back = reader.result;
                };
            }
            
            loanData.guarantors.push(guarantor);
        });
        
        // إنشاء جدول الأقساط
        loanData.installments = createInstallmentSchedule(loanData);
        
        // حفظ البيانات
        window.loans.push(loanData);
        window.installments = [...window.installments, ...loanData.installments];
        
        // استدعاء دالة الحفظ
        if (typeof saveLoanData === 'function') {
            saveLoanData();
        }
        
        // إغلاق النافذة وتحديث الواجهة
        closeModal('add-loan-modal');
        refreshLoansUI();
        showNotification('تم إضافة القرض بنجاح', 'success');
    }
    
    // إضافة دالة عرض الصور في تفاصيل القرض
    function displayLoanDocuments(loan) {
        const documentsGrid = document.getElementById('documents-grid');
        if (!documentsGrid || !loan.documents) return;
        
        documentsGrid.innerHTML = '';
        
        const documentTypes = [
            { id: 'national_id', name: 'البطاقة الموحدة', requireBack: true },
            { id: 'residence_card', name: 'بطاقة السكن', requireBack: true },
            { id: 'department_confirmation', name: 'تأييد الدائرة', requireBack: false }
        ];
        
        documentTypes.forEach(doc => {
            const frontImage = loan.documents[`${doc.id}_front`];
            const backImage = loan.documents[`${doc.id}_back`];
            
            if (frontImage || backImage) {
                const docDiv = document.createElement('div');
                docDiv.className = 'document-item';
                docDiv.innerHTML = `
                    <h5>${doc.name}</h5>
                    ${frontImage ? `
                        <div class="document-image">
                            <img src="${frontImage}" alt="${doc.name} - الوجه الأمامي" style="max-width: 200px;"/>
                            <p>الوجه الأمامي</p>
                        </div>
                    ` : ''}
                    ${backImage ? `
                        <div class="document-image">
                            <img src="${backImage}" alt="${doc.name} - الوجه الخلفي" style="max-width: 200px;"/>
                            <p>الوجه الخلفي</p>
                        </div>
                    ` : ''}
                `;
                documentsGrid.appendChild(docDiv);
            }
        });
    }
    
    // تحديث دالة فتح تفاصيل القرض لعرض الصور
    function enhanceOpenLoanDetailsModal() {
        const originalOpenLoanDetailsModal = window.openLoanDetailsModal;
        window.openLoanDetailsModal = function(loanId) {
            if (originalOpenLoanDetailsModal) {
                originalOpenLoanDetailsModal(loanId);
            }
            
            const loan = window.loans.find(l => l.id === loanId);
            if (loan) {
                displayLoanDocuments(loan);
            }
        };
    }
    
    // إضافة مستمعات أحداث إضافية
    function addAdditionalListeners() {
        // التأكد من ربط زر حفظ القرض
        document.addEventListener('click', function(e) {
            if (e.target.id === 'save-loan-btn' || e.target.closest('#save-loan-btn')) {
                e.preventDefault();
                saveLoanWithImages();
            }
        });
        
        // التأكد من عمل أزرار النوافذ المنبثقة
        document.addEventListener('click', function(e) {
            const confirmPaymentBtn = e.target.closest('#confirm-payment-btn');
            if (confirmPaymentBtn) {
                e.preventDefault();
                processInstallmentPayment();
            }
        });
    }
    
    // إصلاح مشكلة عدم عمل الأزرار
    function fixButtonClicks() {
        // استخدام event delegation لضمان عمل الأزرار
        document.addEventListener('click', function(e) {
            // أزرار دفع القسط
            if (e.target.closest('.pay-btn')) {
                const btnId = e.target.closest('.pay-btn').getAttribute('data-id');
                openPayInstallmentByIdModal(btnId);
            }
            
            // أزرار عرض التفاصيل
            if (e.target.closest('.view-loan-btn')) {
                const loanId = e.target.closest('.view-loan-btn').getAttribute('data-id');
                openLoanDetailsModal(loanId);
            }
            
            // تصدير البيانات
            if (e.target.closest('#export-loans-btn')) {
                exportLoansData();
            }
        });
    }
    
    // إضافة أنماط CSS إضافية
    function addExtraStyles() {
        const extraStyles = document.createElement('style');
        extraStyles.innerHTML = `
            .document-upload-container {
                margin-bottom: 1rem;
            }
            
            .document-item {
                margin-bottom: 1rem;
                border: 1px solid #e5e7eb;
                padding: 1rem;
                border-radius: 8px;
            }
            
            .document-image {
                margin-top: 0.5rem;
            }
            
            .document-image img {
                border: 1px solid #d1d5db;
                border-radius: 4px;
                margin-bottom: 0.5rem;
            }
            
            .guarantor-item {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
            }
            
            .file-preview {
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                padding: 8px;
                margin-top: 8px;
            }
            
            .btn-icon-sm {
                background: none;
                border: none;
                cursor: pointer;
                color: #dc2626;
                font-size: 16px;
                padding: 5px;
            }
            
            .guarantor-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .loan-payment-preview {
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 1rem;
                margin-top: 1rem;
            }
            
            .payment-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            
            .payment-info {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
            }
            
            .payment-label {
                color: #6b7280;
            }
            
            .payment-value {
                font-weight: 600;
            }
        `;
        document.head.appendChild(extraStyles);
    }
    
    // دالة تهيئة شاملة
    function finalizeSetup() {
        enhanceOpenLoanDetailsModal();
        addAdditionalListeners();
        fixButtonClicks();
        addExtraStyles();
        
        // التأكد من تحميل جميع البيانات
        if (typeof loadLoanData === 'function') {
            loadLoanData();
        }
        
        // تحديث الواجهة
        if (typeof refreshLoansUI === 'function') {
            refreshLoansUI();
        }
        
        console.log('تم إصلاح جميع المشاكل بنجاح');
    }
    
    // تشغيل الإصلاحات
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', finalizeSetup);
    } else {
        finalizeSetup();
    }
})();