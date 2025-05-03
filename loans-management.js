/**
 * نظام إدارة السلف والقروض
 * يتكامل مع نظام الاستثمار المتكامل
 * يوفر إدارة كاملة للقروض بمختلف أنواعها مع متابعة الأقساط والمستمسكات والكفلاء
 */

// مصفوفة لتخزين بيانات القروض والسلف
if (!window.loans) {
    window.loans = [];
}

// مصفوفة لتخزين بيانات الأقساط
if (!window.installments) {
    window.installments = [];
}

// إعدادات النظام الافتراضية
const loansSettings = {
    interestRate: 4, // نسبة الفائدة الافتراضية
    defaultMonths: 12, // فترة السداد الافتراضية بالأشهر
    maxLoanAmount: 10000000, // الحد الأقصى لمبلغ القرض
    currencySymbol: 'دينار', // رمز العملة
    requireGuarantor: true, // طلب كفيل واحد على الأقل
    enableNotifications: true // تفعيل إشعارات الأقساط
};

// تصنيفات المقترضين
const borrowerCategories = [
    { id: 'employee', name: 'موظف', color: '#3b82f6' },
    { id: 'mobilization', name: 'حشد شعبي', color: '#10b981' },
    { id: 'police', name: 'شرطة', color: '#4f46e5' },
    { id: 'earner', name: 'كاسب', color: '#f59e0b' },
    { id: 'company', name: 'موظف الشركة', color: '#ef4444' },
    { id: 'welfare', name: 'الرعاية الاجتماعية', color: '#8b5cf6' }
];

// أنواع المستمسكات المطلوبة
const documentTypes = [
    { id: 'national_id', name: 'البطاقة الموحدة', requireBack: true },
    { id: 'residence_card', name: 'بطاقة السكن', requireBack: true },
    { id: 'department_confirmation', name: 'تأييد الدائرة', requireBack: false }
];

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام إدارة السلف والقروض...');
    initLoanSystem();
});

/**
 * تهيئة نظام إدارة السلف والقروض
 */
function initLoanSystem() {
    // إضافة زر القروض والسلف إلى الشريط الجانبي
    addLoansNavItem();
    
    // إنشاء صفحة القروض والسلف
    createLoansPage();
    
    // تحميل بيانات القروض المحفوظة
    loadLoansData();
    
    // تهيئة مستمعي الأحداث
    setupLoansEventListeners();
    
    // إنشاء النوافذ المنبثقة
    createLoansModals();
    
    console.log('تم تهيئة نظام إدارة السلف والقروض بنجاح');
}

/**
 * تحميل بيانات القروض والسلف من التخزين المحلي
 */
function loadLoansData() {
    try {
        // تحميل بيانات القروض
        const savedLoans = localStorage.getItem('loans');
        if (savedLoans) {
            window.loans = JSON.parse(savedLoans);
        }
        
        // تحميل بيانات الأقساط
        const savedInstallments = localStorage.getItem('installments');
        if (savedInstallments) {
            window.installments = JSON.parse(savedInstallments);
        }
        
        // تحميل إعدادات النظام
        const savedSettings = localStorage.getItem('loansSettings');
        if (savedSettings) {
            Object.assign(loansSettings, JSON.parse(savedSettings));
        }
        
        console.log(`تم تحميل ${window.loans.length} قرض و ${window.installments.length} قسط`);
        
        // تحديث جدول القروض
        renderLoansTable();
        
        // تحديث جدول الأقساط
        renderInstallmentsTable();
        
        // تحديث الإحصائيات
        updateLoansStatistics();
        
        // تحديث الرسوم البيانية
        updateLoansCharts();
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات القروض:', error);
        showNotification('حدث خطأ أثناء تحميل بيانات القروض', 'error');
    }
}

/**
 * حفظ بيانات القروض والسلف في التخزين المحلي
 */
function saveLoansData() {
    try {
        // حفظ بيانات القروض
        localStorage.setItem('loans', JSON.stringify(window.loans));
        
        // حفظ بيانات الأقساط
        localStorage.setItem('installments', JSON.stringify(window.installments));
        
        // حفظ إعدادات النظام
        localStorage.setItem('loansSettings', JSON.stringify(loansSettings));
        
        console.log('تم حفظ بيانات القروض بنجاح');
        
    } catch (error) {
        console.error('خطأ في حفظ بيانات القروض:', error);
        showNotification('حدث خطأ أثناء حفظ بيانات القروض', 'error');
    }
}

/**
 * عرض جدول القروض
 */
function renderLoansTable() {
    const tableBody = document.querySelector('#loans-table tbody');
    if (!tableBody) return;
    
    if (window.loans.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">لا توجد قروض مسجلة</td>
            </tr>
        `;
        return;
    }
    
    // ترتيب القروض حسب التاريخ (الأحدث أولاً)
    const sortedLoans = [...window.loans].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // إنشاء صفوف الجدول
    tableBody.innerHTML = sortedLoans.map(loan => {
        // الحصول على تصنيف المقترض
        const category = borrowerCategories.find(cat => cat.id === loan.category);
        
        // حساب عدد الأقساط المدفوعة
        const paidInstallments = window.installments.filter(i => i.loanId === loan.id && i.status === 'paid').length;
        
        return `
            <tr>
                <td>${loan.id}</td>
                <td>
                    <div class="borrower-name">
                        <div class="avatar" style="background-color: ${category?.color || '#ccc'}">${loan.borrowerName.charAt(0)}</div>
                        <span>${loan.borrowerName}</span>
                    </div>
                </td>
                <td>
                    <span class="badge" style="background-color: ${category?.color || '#ccc'}">${category?.name || 'غير محدد'}</span>
                </td>
                <td>${formatCurrency(loan.amount)}</td>
                <td>${loan.term} شهر</td>
                <td>${formatDate(loan.startDate)}</td>
                <td>${formatCurrency(loan.monthlyPayment)}</td>
                <td>
                    <span class="status-badge ${loan.status}">${getLoanStatusText(loan.status)}</span>
                    <span class="small">${paidInstallments}/${loan.term}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline view-loan-btn" data-loan-id="${loan.id}" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline edit-loan-btn" data-loan-id="${loan.id}" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline pay-loan-btn" data-loan-id="${loan.id}" title="دفع قسط">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                        <button class="btn btn-sm btn-outline delete-loan-btn" data-loan-id="${loan.id}" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // إضافة مستمعي الأحداث للأزرار
    setupLoansTableListeners();
}

/**
 * عرض جدول الأقساط
 */
function renderInstallmentsTable() {
    const tableBody = document.querySelector('#installments-table tbody');
    if (!tableBody) return;
    
    if (window.installments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">لا توجد أقساط مسجلة</td>
            </tr>
        `;
        return;
    }
    
    // ترتيب الأقساط حسب تاريخ الاستحقاق (الأقرب أولاً)
    const sortedInstallments = [...window.installments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    // تصفية الأقساط حسب الفلتر النشط
    const activeFilter = document.querySelector('.btn[data-installment-filter].active');
    const filterValue = activeFilter ? activeFilter.getAttribute('data-installment-filter') : 'current';
    
    let filteredInstallments = sortedInstallments;
    
    if (filterValue === 'current') {
        // الأقساط المستحقة في الشهر الحالي
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        filteredInstallments = sortedInstallments.filter(i => {
            const dueDate = new Date(i.dueDate);
            return dueDate >= firstDayOfMonth && dueDate <= lastDayOfMonth;
        });
    } else if (filterValue === 'overdue') {
        // الأقساط المتأخرة
        const today = new Date();
        filteredInstallments = sortedInstallments.filter(i => {
            return new Date(i.dueDate) < today && i.status === 'unpaid';
        });
    } else if (filterValue === 'paid') {
        // الأقساط المدفوعة
        filteredInstallments = sortedInstallments.filter(i => i.status === 'paid');
    }
    
    // إنشاء صفوف الجدول
    tableBody.innerHTML = filteredInstallments.map(installment => {
        // البحث عن القرض المرتبط بالقسط
        const loan = window.loans.find(l => l.id === installment.loanId);
        
        // التحقق من تأخر القسط
        const isOverdue = isInstallmentOverdue(installment);
        
        return `
            <tr class="${isOverdue && installment.status === 'unpaid' ? 'overdue' : ''}">
                <td>
                    <div class="borrower-name">
                        <div class="avatar">${loan?.borrowerName.charAt(0) || '?'}</div>
                        <span>${loan?.borrowerName || 'غير معروف'}</span>
                    </div>
                </td>
                <td>${installment.number} من ${loan?.term || '?'}</td>
                <td>${formatDate(installment.dueDate)}</td>
                <td>${formatCurrency(installment.amount)}</td>
                <td>
                    <span class="status-badge ${installment.status}">
                        ${getInstallmentStatusText(installment.status)}
                    </span>
                </td>
                <td>${installment.paidDate ? formatDate(installment.paidDate) : '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline view-installment-btn" data-installment-id="${installment.id}" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${installment.status === 'unpaid' ? `
                            <button class="btn btn-sm btn-success pay-installment-btn" data-installment-id="${installment.id}" data-loan-id="${installment.loanId}" title="دفع">
                                <i class="fas fa-hand-holding-usd"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // إذا لم تكن هناك أقساط بعد التصفية
    if (filteredInstallments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">لا توجد أقساط ${getInstallmentFilterText(filterValue)}</td>
            </tr>
        `;
    }
    
    // إضافة مستمعي الأحداث للأزرار
    setupInstallmentsTableListeners();
}

/**
 * تحديث إحصائيات القروض
 */
function updateLoansStatistics() {
    // إجمالي القروض النشطة
    const activeLoans = window.loans.filter(loan => loan.status === 'active');
    const totalActiveLoans = activeLoans.reduce((total, loan) => total + loan.amount, 0);
    document.getElementById('total-active-loans').textContent = formatCurrency(totalActiveLoans);
    document.getElementById('active-loans-count').textContent = `${activeLoans.length} قرض`;
    
    // إجمالي الفوائد المتوقعة
    const totalExpectedInterest = window.loans.reduce((total, loan) => total + loan.interestAmount, 0);
    document.getElementById('total-expected-interest').textContent = formatCurrency(totalExpectedInterest);
    document.getElementById('interest-rate').textContent = `${loansSettings.interestRate}% نسبة الفائدة`;
    
    // عدد المقترضين
    const uniqueBorrowers = new Set(window.loans.map(loan => loan.borrowerName));
    document.getElementById('borrowers-count').textContent = uniqueBorrowers.size;
    
    // عدد التصنيفات المستخدمة
    const usedCategories = new Set(window.loans.map(loan => loan.category));
    document.getElementById('borrowers-categories').textContent = `${usedCategories.size} تصنيف`;
    
    // الأقساط المستحقة هذا الشهر
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const currentMonthInstallments = window.installments.filter(i => {
        const dueDate = new Date(i.dueDate);
        return dueDate >= firstDayOfMonth && dueDate <= lastDayOfMonth && i.status === 'unpaid';
    });
    
    const currentMonthTotal = currentMonthInstallments.reduce((total, installment) => total + installment.amount, 0);
    document.getElementById('current-month-installments').textContent = formatCurrency(currentMonthTotal);
    document.getElementById('due-installments').textContent = `${currentMonthInstallments.length} قسط`;
}

/**
 * تحديث الرسوم البيانية للقروض
 */
function updateLoansCharts() {
    // تحديث رسم توزيع القروض حسب الفئة
    updateLoansDistributionChart();
    
    // تحديث رسم حالة السداد
    updateLoansStatusChart();
}

/**
 * تحديث رسم توزيع القروض حسب الفئة
 */
function updateLoansDistributionChart() {
    const ctx = document.getElementById('loans-distribution-chart');
    if (!ctx || !window.Chart) return;
    
    // حساب مجموع القروض لكل فئة
    const categoryTotals = {};
    borrowerCategories.forEach(category => {
        categoryTotals[category.id] = 0;
    });
    
    window.loans.forEach(loan => {
        if (categoryTotals[loan.category] !== undefined) {
            categoryTotals[loan.category] += loan.amount;
        }
    });
    
    // إنشاء بيانات الرسم
    const data = {
        labels: borrowerCategories.map(category => category.name),
        datasets: [{
            data: borrowerCategories.map(category => categoryTotals[category.id]),
            backgroundColor: borrowerCategories.map(category => category.color),
            borderWidth: 0
        }]
    };
    
    // خيارات الرسم
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#666',
                    font: {
                        family: 'Tajawal, sans-serif',
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${formatCurrency(value)}`;
                    }
                }
            }
        }
    };
    
    // إنشاء أو تحديث الرسم
    if (window.loansDistributionChart) {
        window.loansDistributionChart.data = data;
        window.loansDistributionChart.update();
    } else {
        window.loansDistributionChart = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: options
        });
    }
}

/**
 * تحديث رسم حالة السداد
 */
function updateLoansStatusChart() {
    const ctx = document.getElementById('loans-status-chart');
    if (!ctx || !window.Chart) return;
    
    // حساب إحصائيات السداد
    const totalInstallments = window.installments.length;
    const paidInstallments = window.installments.filter(i => i.status === 'paid').length;
    const unpaidInstallments = window.installments.filter(i => i.status === 'unpaid').length;
    const overdueInstallments = window.installments.filter(i => i.status === 'unpaid' && isInstallmentOverdue(i)).length;
    
    // إنشاء بيانات الرسم
    const data = {
        labels: ['مدفوعة', 'مستحقة', 'متأخرة'],
        datasets: [{
            data: [paidInstallments, unpaidInstallments - overdueInstallments, overdueInstallments],
            backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
            borderWidth: 0
        }]
    };
    
    // خيارات الرسم
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#666',
                    font: {
                        family: 'Tajawal, sans-serif',
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const percentage = Math.round((value / totalInstallments) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };
    
    // إنشاء أو تحديث الرسم
    if (window.loansStatusChart) {
        window.loansStatusChart.data = data;
        window.loansStatusChart.update();
    } else {
        window.loansStatusChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options
        });
    }
}

/**
 * إعداد مستمعي الأحداث لجدول القروض
 */
function setupLoansTableListeners() {
    // أزرار عرض تفاصيل القرض
    const viewButtons = document.querySelectorAll('.view-loan-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const loanId = this.getAttribute('data-loan-id');
            openLoanDetailsModal(loanId);
        });
    });
    
    // أزرار تعديل القرض
    const editButtons = document.querySelectorAll('.edit-loan-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const loanId = this.getAttribute('data-loan-id');
            editLoan(loanId);
        });
    });
    
    // أزرار دفع قسط
    const payButtons = document.querySelectorAll('.pay-loan-btn');
    payButtons.forEach(button => {
        button.addEventListener('click', function() {
            const loanId = this.getAttribute('data-loan-id');
            openPayInstallmentModal(loanId);
        });
    });
    
    // أزرار حذف القرض
    const deleteButtons = document.querySelectorAll('.delete-loan-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const loanId = this.getAttribute('data-loan-id');
            deleteLoan(loanId);
        });
    });
}

/**
 * إعداد مستمعي الأحداث لجدول الأقساط
 */
function setupInstallmentsTableListeners() {
    // أزرار عرض تفاصيل القسط
    const viewButtons = document.querySelectorAll('.view-installment-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const installmentId = this.getAttribute('data-installment-id');
            const installment = window.installments.find(i => i.id === installmentId);
            
            if (installment) {
                openLoanDetailsModal(installment.loanId, installmentId);
            }
        });
    });
    
    // أزرار دفع قسط
    const payButtons = document.querySelectorAll('.pay-installment-btn');
    payButtons.forEach(button => {
        button.addEventListener('click', function() {
            const installmentId = this.getAttribute('data-installment-id');
            const loanId = this.getAttribute('data-loan-id');
            openPayInstallmentModal(loanId, installmentId);
        });
    });
}

/**
 * فتح نافذة تفاصيل القرض
 * @param {string} loanId - معرف القرض
 * @param {string} installmentId - معرف القسط (اختياري، إذا تم تحديد قسط)
 */
function openLoanDetailsModal(loanId, installmentId = null) {
    const modal = document.getElementById('loan-details-modal');
    if (!modal) return;
    
    // البحث عن القرض
    const loan = window.loans.find(l => l.id === loanId);
    if (!loan) {
        console.error('لم يتم العثور على القرض:', loanId);
        showNotification('لم يتم العثور على القرض المطلوب', 'error');
        return;
    }
    
    // تحديث معرف القرض في أزرار النافذة
    const editLoanBtn = document.getElementById('edit-loan-btn');
    const payInstallmentBtn = document.getElementById('pay-installment-btn');
    const renewLoanBtn = document.getElementById('renew-loan-btn');
    const deleteLoanBtn = document.getElementById('delete-loan-btn');
    
    if (editLoanBtn) editLoanBtn.setAttribute('data-loan-id', loanId);
    if (payInstallmentBtn) payInstallmentBtn.setAttribute('data-loan-id', loanId);
    if (renewLoanBtn) renewLoanBtn.setAttribute('data-loan-id', loanId);
    if (deleteLoanBtn) deleteLoanBtn.setAttribute('data-loan-id', loanId);
    
    // الحصول على تصنيف المقترض
    const category = borrowerCategories.find(cat => cat.id === loan.category);
    
    // حساب عدد الأقساط المدفوعة
    const paidInstallments = window.installments.filter(i => i.loanId === loanId && i.status === 'paid').length;
    
    // عرض ملخص القرض
    const loanSummaryTab = document.querySelector('.loan-details-summary');
    if (loanSummaryTab) {
        loanSummaryTab.innerHTML = `
            <div class="grid-cols-2">
                <div class="loan-details-card">
                    <div class="card-header">
                        <h4>معلومات القرض</h4>
                        <span class="status-badge ${loan.status}">${getLoanStatusText(loan.status)}</span>
                    </div>
                    <div class="card-content">
                        <div class="detail-row">
                            <span class="detail-label">رقم القرض:</span>
                            <span class="detail-value">${loan.id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">تصنيف المقترض:</span>
                            <span class="detail-value">
                                <span class="badge" style="background-color: ${category?.color || '#ccc'}">${category?.name || 'غير محدد'}</span>
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">مبلغ القرض:</span>
                            <span class="detail-value">${formatCurrency(loan.amount)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">نسبة الفائدة:</span>
                            <span class="detail-value">${loan.interestRate}%</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">مبلغ الفائدة:</span>
                            <span class="detail-value">${formatCurrency(loan.interestAmount)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">إجمالي المبلغ:</span>
                            <span class="detail-value">${formatCurrency(loan.totalAmount)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">مدة القرض:</span>
                            <span class="detail-value">${loan.term} شهر</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">القسط الشهري:</span>
                            <span class="detail-value">${formatCurrency(loan.monthlyPayment)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">تاريخ القرض:</span>
                            <span class="detail-value">${formatDate(loan.startDate)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">الأقساط المدفوعة:</span>
                            <span class="detail-value">${paidInstallments} من ${loan.term}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">تاريخ الإنشاء:</span>
                            <span class="detail-value">${formatDateTime(loan.createdAt)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="loan-details-card">
                    <div class="card-header">
                        <h4>ملخص المقترض</h4>
                        <div class="avatar" style="background-color: ${category?.color || '#ccc'}">${loan.borrowerName.charAt(0)}</div>
                    </div>
                    <div class="card-content">
                        <div class="detail-row">
                            <span class="detail-label">اسم المقترض:</span>
                            <span class="detail-value">${loan.borrowerName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">رقم الهاتف:</span>
                            <span class="detail-value">${loan.borrowerPhone}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">العنوان:</span>
                            <span class="detail-value">${loan.borrowerAddress}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">البريد الإلكتروني:</span>
                            <span class="detail-value">${loan.borrowerEmail || '-'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">الراتب الاسمي:</span>
                            <span class="detail-value">${formatCurrency(loan.borrowerSalary)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">مكان العمل:</span>
                            <span class="detail-value">${loan.borrowerWorkPlace}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">عدد الكفلاء:</span>
                            <span class="detail-value">${loan.guarantors?.length || 0}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">ملاحظات:</span>
                            <span class="detail-value">${loan.notes || '-'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="loan-payment-summary">
                    <h4>ملخص السداد</h4>
                    <div class="payment-progress">
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${Math.round((paidInstallments / loan.term) * 100)}%"></div>
                        </div>
                        <div class="progress-text">
                            <span>${Math.round((paidInstallments / loan.term) * 100)}%</span>
                            <span>${paidInstallments} من ${loan.term} قسط</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // عرض جدول السداد
    const paymentScheduleBody = document.getElementById('payment-schedule-body');
    if (paymentScheduleBody) {
        // الحصول على أقساط القرض
        const loanInstallments = window.installments.filter(i => i.loanId === loanId);
        
        // ترتيب الأقساط حسب الرقم
        const sortedInstallments = loanInstallments.sort((a, b) => a.number - b.number);
        
        if (sortedInstallments.length > 0) {
            paymentScheduleBody.innerHTML = sortedInstallments.map(installment => {
                // التحقق من تأخر القسط
                const isOverdue = isInstallmentOverdue(installment);
                
                // تمييز القسط المحدد (إذا تم تحديد قسط)
                const isSelected = installment.id === installmentId;
                
                return `
                    <tr class="${isOverdue && installment.status === 'unpaid' ? 'overdue' : ''} ${isSelected ? 'selected' : ''}">
                        <td>${installment.number}</td>
                        <td>${formatDate(installment.dueDate)}</td>
                        <td>${formatCurrency(installment.amount)}</td>
                        <td>
                            <span class="status-badge ${installment.status}">
                                ${getInstallmentStatusText(installment.status)}
                            </span>
                        </td>
                        <td>${installment.paidDate ? formatDate(installment.paidDate) : '-'}</td>
                        <td>
                            <div class="table-actions">
                                ${installment.status === 'unpaid' ? `
                                    <button class="btn btn-sm btn-success pay-installment-btn" data-installment-id="${installment.id}" data-loan-id="${installment.loanId}">
                                        <i class="fas fa-hand-holding-usd"></i>
                                        <span>دفع</span>
                                    </button>
                                ` : `
                                    <button class="btn btn-sm btn-outline" disabled>
                                        <i class="fas fa-check"></i>
                                        <span>تم الدفع</span>
                                    </button>
                                `}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            paymentScheduleBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">لم يتم إنشاء جدول سداد لهذا القرض</td>
                </tr>
            `;
        }
    }
    
    // عرض بيانات المقترض
    const borrowerDetailsTab = document.querySelector('.borrower-details-container');
    if (borrowerDetailsTab) {
        borrowerDetailsTab.innerHTML = `
            <div class="borrower-profile">
                <div class="borrower-header">
                    <div class="borrower-avatar">
                        <div class="avatar large" style="background-color: ${category?.color || '#ccc'}">${loan.borrowerName.charAt(0)}</div>
                    </div>
                    <div class="borrower-name">
                        <h3>${loan.borrowerName}</h3>
                        <span class="badge" style="background-color: ${category?.color || '#ccc'}">${category?.name || 'غير محدد'}</span>
                    </div>
                </div>
                
                <div class="borrower-info">
                    <div class="info-group">
                        <h4>معلومات الاتصال</h4>
                        <div class="info-row">
                            <div class="info-icon">
                                <i class="fas fa-phone"></i>
                            </div>
                            <div class="info-content">
                                <span class="info-label">رقم الهاتف</span>
                                <span class="info-value">${loan.borrowerPhone}</span>
                            </div>
                        </div>
                        <div class="info-row">
                            <div class="info-icon">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <div class="info-content">
                                <span class="info-label">العنوان</span>
                                <span class="info-value">${loan.borrowerAddress}</span>
                            </div>
                        </div>
                        ${loan.borrowerEmail ? `
                            <div class="info-row">
                                <div class="info-icon">
                                    <i class="fas fa-envelope"></i>
                                </div>
                                <div class="info-content">
                                    <span class="info-label">البريد الإلكتروني</span>
                                    <span class="info-value">${loan.borrowerEmail}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="info-group">
                        <h4>معلومات العمل</h4>
                        <div class="info-row">
                            <div class="info-icon">
                                <i class="fas fa-building"></i>
                            </div>
                            <div class="info-content">
                                <span class="info-label">مكان العمل</span>
                                <span class="info-value">${loan.borrowerWorkPlace}</span>
                            </div>
                        </div>
                        <div class="info-row">
                            <div class="info-icon">
                                <i class="fas fa-money-bill-wave"></i>
                            </div>
                            <div class="info-content">
                                <span class="info-label">الراتب الاسمي</span>
                                <span class="info-value">${formatCurrency(loan.borrowerSalary)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // عرض المستمسكات
    const documentsTab = document.querySelector('.loan-documents-container');
    if (documentsTab) {
        if (loan.documents && loan.documents.length > 0) {
            documentsTab.innerHTML = `
                <div class="documents-list">
                    ${loan.documents.map(doc => `
                        <div class="document-card">
                            <div class="document-header">
                                <h4>${doc.name}</h4>
                            </div>
                            <div class="document-files">
                                ${doc.files.map(file => `
                                    <div class="document-file">
                                        <div class="file-info">
                                            <div class="file-icon">
                                                <i class="fas fa-file-image"></i>
                                            </div>
                                            <div class="file-details">
                                                <div class="file-name">${file.name}</div>
                                                <div class="file-meta">
                                                    <span>${formatFileSize(file.size)}</span>
                                                    <span>${file.side === 'front' ? 'الوجه الأمامي' : 'الوجه الخلفي'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="file-actions">
                                            <button class="btn btn-sm btn-outline view-document-btn" data-document-id="${doc.type}" data-side="${file.side}">
                                                <i class="fas fa-eye"></i>
                                                <span>عرض</span>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            documentsTab.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-image"></i>
                    <p>لا توجد مستمسكات مرفقة</p>
                </div>
            `;
        }
    }
    
    // عرض الكفلاء
    const guarantorsTab = document.querySelector('.loan-guarantors-container');
    if (guarantorsTab) {
        if (loan.guarantors && loan.guarantors.length > 0) {
            guarantorsTab.innerHTML = `
                <div class="guarantors-list">
                    ${loan.guarantors.map((guarantor, index) => `
                        <div class="guarantor-card">
                            <div class="guarantor-header">
                                <div class="guarantor-avatar">
                                    <div class="avatar">${guarantor.name.charAt(0)}</div>
                                </div>
                                <div class="guarantor-title">
                                    <h4>${guarantor.name}</h4>
                                    <span>الكفيل #${index + 1}</span>
                                </div>
                            </div>
                            <div class="guarantor-details">
                                <div class="detail-item">
                                    <span class="detail-icon"><i class="fas fa-phone"></i></span>
                                    <span class="detail-label">رقم الهاتف:</span>
                                    <span class="detail-value">${guarantor.phone}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon"><i class="fas fa-map-marker-alt"></i></span>
                                    <span class="detail-label">العنوان:</span>
                                    <span class="detail-value">${guarantor.address}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon"><i class="fas fa-building"></i></span>
                                    <span class="detail-label">مكان العمل:</span>
                                    <span class="detail-value">${guarantor.workplace}</span>
                                </div>
                            </div>
                            ${guarantor.documents && guarantor.documents.length > 0 ? `
                                <div class="guarantor-documents">
                                    <h5>المستمسكات</h5>
                                    <div class="documents-grid">
                                        ${guarantor.documents.map(doc => `
                                            <div class="document-item">
                                                <div class="document-icon">
                                                    <i class="fas fa-id-card"></i>
                                                </div>
                                                <div class="document-info">
                                                    <span>${doc.side === 'front' ? 'الوجه الأمامي' : 'الوجه الخلفي'}</span>
                                                    <button class="btn btn-sm btn-outline view-guarantor-document-btn" data-guarantor-index="${index}" data-document-index="${guarantor.documents.indexOf(doc)}">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : `
                                <div class="empty-state small">
                                    <i class="fas fa-file-image"></i>
                                    <p>لا توجد مستمسكات مرفقة</p>
                                </div>
                            `}
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            guarantorsTab.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>لا يوجد كفلاء لهذا القرض</p>
                </div>
            `;
        }
    }
    
    // تحديث مستمعي الأحداث للتبويبات
    const tabButtons = modal.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار والمحتويات
            tabButtons.forEach(btn => btn.classList.remove('active'));
            modal.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // إضافة الفئة النشطة للزر والمحتوى المحدد
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const tabContent = modal.querySelector(`#${tabId}-tab`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
    
    // إضافة مستمع حدث لأزرار دفع الأقساط في جدول السداد
    const payInstallmentButtons = modal.querySelectorAll('.pay-installment-btn');
    payInstallmentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const installmentId = this.getAttribute('data-installment-id');
            const loanId = this.getAttribute('data-loan-id');
            
            // إغلاق نافذة تفاصيل القرض
            modal.classList.remove('active');
            
            // فتح نافذة دفع القسط
            setTimeout(() => {
                openPayInstallmentModal(loanId, installmentId);
            }, 300);
        });
    });
    
    // إذا تم تحديد قسط، تلقائيًا يتم عرض تبويب جدول السداد
    if (installmentId) {
        // تفعيل تبويب جدول السداد
        const paymentScheduleTabBtn = modal.querySelector('.tab-btn[data-tab="payment-schedule"]');
        if (paymentScheduleTabBtn) {
            paymentScheduleTabBtn.click();
        }
    }
    
    // فتح النافذة
    modal.classList.add('active');
}

/**
 * تأكيد دفع قسط
 */
function confirmInstallmentPayment() {
    // التحقق من صحة النموذج
    const paymentDate = document.getElementById('payment-date').value;
    const paymentAmount = parseFloat(document.getElementById('payment-amount').value);
    const paymentNotes = document.getElementById('payment-notes').value;
    const installmentId = document.getElementById('installment-id').value;
    const loanId = document.getElementById('installment-loan-id').value;
    
    if (!paymentDate || isNaN(paymentAmount) || paymentAmount <= 0) {
        showNotification('يرجى ملء جميع حقول نموذج الدفع بشكل صحيح', 'error');
        return;
    }
    
    // البحث عن القسط
    const installmentIndex = window.installments.findIndex(i => i.id === installmentId);
    if (installmentIndex === -1) {
        showNotification('لم يتم العثور على القسط المطلوب', 'error');
        return;
    }
    
    // تحديث بيانات القسط
    window.installments[installmentIndex].status = 'paid';
    window.installments[installmentIndex].paidDate = paymentDate;
    window.installments[installmentIndex].paidAmount = paymentAmount;
    window.installments[installmentIndex].notes = paymentNotes || '';
    
    // التحقق من حالة القرض
    const loanInstallments = window.installments.filter(i => i.loanId === loanId);
    const allPaid = loanInstallments.every(i => i.status === 'paid');
    
    // إذا تم دفع جميع الأقساط، تحديث حالة القرض إلى "مكتمل"
    if (allPaid) {
        const loanIndex = window.loans.findIndex(l => l.id === loanId);
        if (loanIndex !== -1) {
            window.loans[loanIndex].status = 'completed';
        }
    }
    
    // حفظ البيانات
    saveLoansData();
    
    // تحديث جدول القروض
    renderLoansTable();
    
    // تحديث جدول الأقساط
    renderInstallmentsTable();
    
    // تحديث الإحصائيات
    updateLoansStatistics();
    
    // تحديث الرسوم البيانية
    updateLoansCharts();
    
    // إغلاق النافذة المنبثقة
    const modal = document.getElementById('pay-installment-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // عرض إشعار نجاح
    showNotification('تم تسجيل دفع القسط بنجاح', 'success');
}

/**
 * حذف قرض
 * @param {string} loanId - معرف القرض
 */
function deleteLoan(loanId) {
    // تأكيد الحذف
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا القرض وجميع الأقساط المرتبطة به؟')) {
        return;
    }
    
    // البحث عن القرض
    const loanIndex = window.loans.findIndex(l => l.id === loanId);
    if (loanIndex === -1) {
        showNotification('لم يتم العثور على القرض المطلوب', 'error');
        return;
    }
    
    // حذف القرض
    window.loans.splice(loanIndex, 1);
    
    // حذف الأقساط المرتبطة بالقرض
    window.installments = window.installments.filter(i => i.loanId !== loanId);
    
    // حفظ البيانات
    saveLoansData();
    
    // تحديث جدول القروض
    renderLoansTable();
    
    // تحديث جدول الأقساط
    renderInstallmentsTable();
    
    // تحديث الإحصائيات
    updateLoansStatistics();
    
    // تحديث الرسوم البيانية
    updateLoansCharts();
    
    // إغلاق النافذة المنبثقة (إذا كانت مفتوحة)
    const modal = document.getElementById('loan-details-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // عرض إشعار نجاح
    showNotification('تم حذف القرض بنجاح', 'success');
}

/**
 * تجديد قرض
 * @param {string} loanId - معرف القرض
 */
function renewLoan(loanId) {
    // البحث عن القرض
    const loan = window.loans.find(l => l.id === loanId);
    if (!loan) {
        showNotification('لم يتم العثور على القرض المطلوب', 'error');
        return;
    }
    
    // التحقق من وجود أقساط غير مدفوعة
    const unpaidInstallments = window.installments.filter(i => i.loanId === loanId && i.status === 'unpaid');
    if (unpaidInstallments.length > 0) {
        if (!confirm(`يوجد ${unpaidInstallments.length} قسط غير مدفوع. هل تريد متابعة تجديد القرض؟`)) {
            return;
        }
    }
    
    // تأكيد التجديد
    if (!confirm('هل أنت متأكد من رغبتك في تجديد هذا القرض؟')) {
        return;
    }
    
    // إنشاء قرض جديد بناءً على القرض السابق
    const newLoan = {
        ...loan,
        id: Date.now().toString(),
        startDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        status: 'active',
        previousLoanId: loanId
    };
    
    // إضافة القرض الجديد
    window.loans.push(newLoan);
    
    // تغيير حالة القرض القديم إلى "مجدد"
    const oldLoanIndex = window.loans.findIndex(l => l.id === loanId);
    if (oldLoanIndex !== -1) {
        window.loans[oldLoanIndex].status = 'renewed';
        window.loans[oldLoanIndex].renewedLoanId = newLoan.id;
    }
    
    // إلغاء الأقساط غير المدفوعة للقرض القديم
    unpaidInstallments.forEach(installment => {
        const index = window.installments.findIndex(i => i.id === installment.id);
        if (index !== -1) {
            window.installments[index].status = 'cancelled';
            window.installments[index].notes = 'تم إلغاء القسط بسبب تجديد القرض';
        }
    });
    
    // إنشاء جدول سداد للقرض الجديد
    createPaymentSchedule(newLoan);
    
    // حفظ البيانات
    saveLoansData();
    
    // تحديث جدول القروض
    renderLoansTable();
    
    // تحديث جدول الأقساط
    renderInstallmentsTable();
    
    // تحديث الإحصائيات
    updateLoansStatistics();
    
    // تحديث الرسوم البيانية
    updateLoansCharts();
    
    // إغلاق النافذة المنبثقة (إذا كانت مفتوحة)
    const modal = document.getElementById('loan-details-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // عرض إشعار نجاح
    showNotification('تم تجديد القرض بنجاح', 'success');
    
    // فتح نافذة تفاصيل القرض الجديد
    setTimeout(() => {
        openLoanDetailsModal(newLoan.id);
    }, 500);
}

/**
 * تعديل قرض
 * @param {string} loanId - معرف القرض
 */
function editLoan(loanId) {
    // هذه الوظيفة سيتم تنفيذها في المرحلة التالية
    showNotification('سيتم دعم تعديل القروض في الإصدار القادم', 'info');
}

/**
 * تصفية القروض حسب التصنيف
 * @param {string} category - تصنيف المقترض
 */
function filterLoans(category) {
    const tableBody = document.querySelector('#loans-table tbody');
    if (!tableBody) return;
    
    if (window.loans.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">لا توجد قروض مسجلة</td>
            </tr>
        `;
        return;
    }
    
    // ترتيب القروض حسب التاريخ (الأحدث أولاً)
    const sortedLoans = [...window.loans].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // تصفية القروض حسب التصنيف
    const filteredLoans = category === 'all' ? sortedLoans : sortedLoans.filter(loan => loan.category === category);
    
    if (filteredLoans.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">لا توجد قروض بهذا التصنيف</td>
            </tr>
        `;
        return;
    }
    
    // إنشاء صفوف الجدول
    tableBody.innerHTML = filteredLoans.map(loan => {
        // الحصول على تصنيف المقترض
        const category = borrowerCategories.find(cat => cat.id === loan.category);
        
        // حساب عدد الأقساط المدفوعة
        const paidInstallments = window.installments.filter(i => i.loanId === loan.id && i.status === 'paid').length;
        
        return `
            <tr>
                <td>${loan.id}</td>
                <td>
                    <div class="borrower-name">
                        <div class="avatar" style="background-color: ${category?.color || '#ccc'}">${loan.borrowerName.charAt(0)}</div>
                        <span>${loan.borrowerName}</span>
                    </div>
                </td>
                <td>
                    <span class="badge" style="background-color: ${category?.color || '#ccc'}">${category?.name || 'غير محدد'}</span>
                </td>
                <td>${formatCurrency(loan.amount)}</td>
                <td>${loan.term} شهر</td>
                <td>${formatDate(loan.startDate)}</td>
                <td>${formatCurrency(loan.monthlyPayment)}</td>
                <td>
                    <span class="status-badge ${loan.status}">${getLoanStatusText(loan.status)}</span>
                    <span class="small">${paidInstallments}/${loan.term}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline view-loan-btn" data-loan-id="${loan.id}" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline edit-loan-btn" data-loan-id="${loan.id}" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline pay-loan-btn" data-loan-id="${loan.id}" title="دفع قسط">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                        <button class="btn btn-sm btn-outline delete-loan-btn" data-loan-id="${loan.id}" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // إضافة مستمعي الأحداث للأزرار
    setupLoansTableListeners();
}
/**
 * تصفية الأقساط حسب الحالة
 * @param {string} status - حالة القسط
 */
function filterInstallments(status) {
    const tableBody = document.querySelector('#installments-table tbody');
    if (!tableBody) return;
    
    if (window.installments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">لا توجد أقساط مسجلة</td>
            </tr>
        `;
        return;
    }
    
    // ترتيب الأقساط حسب تاريخ الاستحقاق (الأقرب أولاً)
    const sortedInstallments = [...window.installments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    // تصفية الأقساط حسب الحالة
    let filteredInstallments = sortedInstallments;
    
    if (status === 'current') {
        // الأقساط المستحقة في الشهر الحالي
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        filteredInstallments = sortedInstallments.filter(i => {
            const dueDate = new Date(i.dueDate);
            return dueDate >= firstDayOfMonth && dueDate <= lastDayOfMonth;
        });
    } else if (status === 'overdue') {
        // الأقساط المتأخرة
        const today = new Date();
        filteredInstallments = sortedInstallments.filter(i => {
            return new Date(i.dueDate) < today && i.status === 'unpaid';
        });
    } else if (status === 'paid') {
        // الأقساط المدفوعة
        filteredInstallments = sortedInstallments.filter(i => i.status === 'paid');
    }
    
    // إنشاء صفوف الجدول
    tableBody.innerHTML = filteredInstallments.map(installment => {
        // البحث عن القرض المرتبط بالقسط
        const loan = window.loans.find(l => l.id === installment.loanId);
        
        // التحقق من تأخر القسط
        const isOverdue = isInstallmentOverdue(installment);
        
        return `
            <tr class="${isOverdue && installment.status === 'unpaid' ? 'overdue' : ''}">
                <td>
                    <div class="borrower-name">
                        <div class="avatar">${loan?.borrowerName.charAt(0) || '?'}</div>
                        <span>${loan?.borrowerName || 'غير معروف'}</span>
                    </div>
                </td>
                <td>${installment.number} من ${loan?.term || '?'}</td>
                <td>${formatDate(installment.dueDate)}</td>
                <td>${formatCurrency(installment.amount)}</td>
                <td>
                    <span class="status-badge ${installment.status}">
                        ${getInstallmentStatusText(installment.status)}
                    </span>
                </td>
                <td>${installment.paidDate ? formatDate(installment.paidDate) : '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline view-installment-btn" data-installment-id="${installment.id}" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${installment.status === 'unpaid' ? `
                            <button class="btn btn-sm btn-success pay-installment-btn" data-installment-id="${installment.id}" data-loan-id="${installment.loanId}" title="دفع">
                                <i class="fas fa-hand-holding-usd"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // إذا لم تكن هناك أقساط بعد التصفية
    if (filteredInstallments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">لا توجد أقساط ${getInstallmentFilterText(status)}</td>
            </tr>
        `;
    }
    
    // إضافة مستمعي الأحداث للأزرار
    setupInstallmentsTableListeners();
}

/**
 * البحث عن القروض
 * @param {string} searchText - نص البحث
 */
function searchLoans(searchText) {
    const tableBody = document.querySelector('#loans-table tbody');
    if (!tableBody) return;
    
    if (window.loans.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">لا توجد قروض مسجلة</td>
            </tr>
        `;
        return;
    }
    
    // إذا كان نص البحث فارغًا، عرض جميع القروض
    if (!searchText.trim()) {
        renderLoansTable();
        return;
    }
    
    // البحث عن القروض التي تطابق نص البحث
    const filteredLoans = window.loans.filter(loan => {
        // البحث في معرف القرض
        if (loan.id.toLowerCase().includes(searchText.toLowerCase())) {
            return true;
        }
        
        // البحث في اسم المقترض
        if (loan.borrowerName.toLowerCase().includes(searchText.toLowerCase())) {
            return true;
        }
        
        // البحث في رقم الهاتف
        if (loan.borrowerPhone.includes(searchText)) {
            return true;
        }
        
        // البحث في العنوان
        if (loan.borrowerAddress.toLowerCase().includes(searchText.toLowerCase())) {
            return true;
        }
        
        // البحث في البريد الإلكتروني
        if (loan.borrowerEmail && loan.borrowerEmail.toLowerCase().includes(searchText.toLowerCase())) {
            return true;
        }
        
        // البحث في مكان العمل
        if (loan.borrowerWorkPlace.toLowerCase().includes(searchText.toLowerCase())) {
            return true;
        }
        
        // البحث في الملاحظات
        if (loan.notes && loan.notes.toLowerCase().includes(searchText.toLowerCase())) {
            return true;
        }
        
        return false;
    });
    
    if (filteredLoans.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">لا توجد نتائج مطابقة لـ "${searchText}"</td>
            </tr>
        `;
        return;
    }
    
    // ترتيب القروض حسب التاريخ (الأحدث أولاً)
    const sortedLoans = [...filteredLoans].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // إنشاء صفوف الجدول
    tableBody.innerHTML = sortedLoans.map(loan => {
        // الحصول على تصنيف المقترض
        const category = borrowerCategories.find(cat => cat.id === loan.category);
        
        // حساب عدد الأقساط المدفوعة
        const paidInstallments = window.installments.filter(i => i.loanId === loan.id && i.status === 'paid').length;
        
        return `
            <tr>
                <td>${loan.id}</td>
                <td>
                    <div class="borrower-name">
                        <div class="avatar" style="background-color: ${category?.color || '#ccc'}">${loan.borrowerName.charAt(0)}</div>
                        <span>${loan.borrowerName}</span>
                    </div>
                </td>
                <td>
                    <span class="badge" style="background-color: ${category?.color || '#ccc'}">${category?.name || 'غير محدد'}</span>
                </td>
                <td>${formatCurrency(loan.amount)}</td>
                <td>${loan.term} شهر</td>
                <td>${formatDate(loan.startDate)}</td>
                <td>${formatCurrency(loan.monthlyPayment)}</td>
                <td>
                    <span class="status-badge ${loan.status}">${getLoanStatusText(loan.status)}</span>
                    <span class="small">${paidInstallments}/${loan.term}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline view-loan-btn" data-loan-id="${loan.id}" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline edit-loan-btn" data-loan-id="${loan.id}" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline pay-loan-btn" data-loan-id="${loan.id}" title="دفع قسط">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                        <button class="btn btn-sm btn-outline delete-loan-btn" data-loan-id="${loan.id}" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // إضافة مستمعي الأحداث للأزرار
    setupLoansTableListeners();
}

/**
 * تصدير بيانات القروض
 */
function exportLoansData() {
    // تجهيز البيانات للتصدير
    const exportData = {
        loans: window.loans,
        installments: window.installments,
        settings: loansSettings,
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0'
    };
    
    // تحويل البيانات إلى JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // إنشاء رابط للتنزيل
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "loans_data_" + formatDateForFileName(new Date()) + ".json");
    
    // إضافة الرابط إلى المستند وتنفيذ النقر
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    // عرض إشعار نجاح
    showNotification('تم تصدير بيانات القروض بنجاح', 'success');
}

/**
 * حفظ إعدادات نظام القروض
 */
function saveLoansSettings() {
    // الحصول على قيم الإعدادات
    const interestRate = parseFloat(document.getElementById('default-interest-rate').value) || 4;
    const defaultMonths = parseInt(document.getElementById('default-loan-term').value) || 12;
    const maxLoanAmount = parseFloat(document.getElementById('max-loan-amount').value) || 10000000;
    const currencySymbol = document.getElementById('currency-symbol').value || 'دينار';
    const requireGuarantor = document.getElementById('require-guarantor').checked;
    const enableNotifications = document.getElementById('enable-installment-notifications').checked;
    
    // تحديث الإعدادات
    loansSettings.interestRate = interestRate;
    loansSettings.defaultMonths = defaultMonths;
    loansSettings.maxLoanAmount = maxLoanAmount;
    loansSettings.currencySymbol = currencySymbol;
    loansSettings.requireGuarantor = requireGuarantor;
    loansSettings.enableNotifications = enableNotifications;
    
    // حفظ الإعدادات
    localStorage.setItem('loansSettings', JSON.stringify(loansSettings));
    
    // تحديث واجهة المستخدم
    document.getElementById('interest-rate').textContent = `${interestRate}% نسبة الفائدة`;
    
    // إغلاق النافذة المنبثقة
    const modal = document.getElementById('loans-settings-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // عرض إشعار نجاح
    showNotification('تم حفظ إعدادات نظام القروض بنجاح', 'success');
}

/**
 * إنشاء جدول سداد للقرض
 * @param {Object} loan - بيانات القرض
 */
function createPaymentSchedule(loan) {
    // حساب تاريخ بداية القرض
    const startDate = new Date(loan.startDate);
    
    // حساب القسط الشهري
    const monthlyPayment = loan.monthlyPayment;
    
    // إنشاء أقساط للقرض
    for (let i = 0; i < loan.term; i++) {
        // حساب تاريخ استحقاق القسط (تاريخ بداية القرض + i شهر)
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        
        // إنشاء بيانات القسط
        const installment = {
            id: `${loan.id}-${i + 1}`,
            loanId: loan.id,
            number: i + 1,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: monthlyPayment,
            status: 'unpaid',
            paidDate: null,
            paidAmount: 0,
            notes: ''
        };
        
        // إضافة القسط إلى مصفوفة الأقساط
        window.installments.push(installment);
    }
}

/**
 * التحقق مما إذا كان القسط متأخرًا
 * @param {Object} installment - بيانات القسط
 * @returns {boolean} ما إذا كان القسط متأخرًا
 */
function isInstallmentOverdue(installment) {
    if (installment.status === 'paid') {
        return false;
    }
    
    const today = new Date();
    const dueDate = new Date(installment.dueDate);
    
    return dueDate < today;
}

/**
 * الحصول على نص حالة القرض
 * @param {string} status - حالة القرض
 * @returns {string} نص الحالة
 */
function getLoanStatusText(status) {
    switch (status) {
        case 'active':
            return 'نشط';
        case 'completed':
            return 'مكتمل';
        case 'renewed':
            return 'مجدد';
        case 'overdue':
            return 'متأخر';
        case 'cancelled':
            return 'ملغي';
        default:
            return 'غير معروف';
    }
}

/**
 * الحصول على نص حالة القسط
 * @param {string} status - حالة القسط
 * @returns {string} نص الحالة
 */
function getInstallmentStatusText(status) {
    switch (status) {
        case 'paid':
            return 'مدفوع';
        case 'unpaid':
            return 'غير مدفوع';
        case 'partial':
            return 'مدفوع جزئيًا';
        case 'cancelled':
            return 'ملغي';
        default:
            return 'غير معروف';
    }
}

/**
 * الحصول على نص فلتر الأقساط
 * @param {string} filter - فلتر الأقساط
 * @returns {string} نص الفلتر
 */
function getInstallmentFilterText(filter) {
    switch (filter) {
        case 'current':
            return 'مستحقة هذا الشهر';
        case 'overdue':
            return 'متأخرة';
        case 'paid':
            return 'مدفوعة';
        case 'all':
            return '';
        default:
            return '';
    }
}

/**
 * تنسيق التاريخ
 * @param {string} dateString - سلسلة التاريخ
 * @returns {string} التاريخ المنسق
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    return new Intl.DateTimeFormat('ar-IQ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

/**
 * تنسيق التاريخ والوقت
 * @param {string} dateString - سلسلة التاريخ
 * @returns {string} التاريخ والوقت المنسق
 */
function formatDateTime(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    return new Intl.DateTimeFormat('ar-IQ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * تنسيق المبلغ كعملة
 * @param {number} amount - المبلغ
 * @returns {string} المبلغ المنسق
 */
function formatCurrency(amount) {
    if (isNaN(amount)) return `0 ${loansSettings.currencySymbol}`;
    
    // تقريب المبلغ إلى رقمين عشريين
    const roundedAmount = Math.round(amount * 100) / 100;
    
    // تنسيق المبلغ بفواصل الآلاف
    const formattedAmount = roundedAmount.toLocaleString('ar-IQ');
    
    return `${formattedAmount} ${loansSettings.currencySymbol}`;
}

/**
 * تنسيق حجم الملف
 * @param {number} size - حجم الملف بالبايت
 * @returns {string} حجم الملف المنسق
 */
function formatFileSize(size) {
    if (size < 1024) {
        return size + ' بايت';
    } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + ' كيلوبايت';
    } else {
        return (size / (1024 * 1024)).toFixed(2) + ' ميجابايت';
    }
}

/**
 * تنسيق التاريخ لاستخدامه في اسم الملف
 * @param {Date} date - التاريخ
 * @returns {string} التاريخ المنسق
 */
function formatDateForFileName(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}`;
}

/**
 * عرض إشعار للمستخدم
 * @param {string} message - رسالة الإشعار
 * @param {string} type - نوع الإشعار (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
    // التحقق من وجود عنصر الإشعارات
    let notificationsContainer = document.querySelector('.notifications-container');
    
    if (!notificationsContainer) {
        // إنشاء حاوية الإشعارات
        notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        document.body.appendChild(notificationsContainer);
    }
    
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type} animate__animated animate__fadeInUp`;
    
    // تحديد أيقونة الإشعار حسب النوع
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'info':
        default:
            icon = '<i class="fas fa-info-circle"></i>';
            break;
    }
    
    // إضافة محتوى الإشعار
    notification.innerHTML = `
        <div class="notification-icon">
            ${icon}
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">×</button>
    `;
    
    // إضافة الإشعار إلى الحاوية
    notificationsContainer.appendChild(notification);
    
    // إضافة مستمع حدث لزر الإغلاق
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            // إزالة الإشعار بتأثير متحرك
            notification.classList.remove('animate__fadeInUp');
            notification.classList.add('animate__fadeOutDown');
            
            // إزالة الإشعار من DOM بعد انتهاء التأثير
            setTimeout(() => {
                notification.remove();
            }, 500);
        });
    }
    
    // إزالة الإشعار تلقائيًا بعد 5 ثوانٍ
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('animate__fadeInUp');
            notification.classList.add('animate__fadeOutDown');
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }
    }, 5000);
}

// إضافة وظائف النظام إلى النافذة للوصول إليها من الخارج
window.loansSystem = {
    initLoanSystem,
    openAddLoanModal,
    openLoanDetailsModal,
    openPayInstallmentModal,
    openLoansSettingsModal,
    saveNewLoan,
    confirmInstallmentPayment,
    deleteLoan,
    renewLoan,
    editLoan,
    filterLoans,
    filterInstallments,
    searchLoans,
    exportLoansData,
    saveLoansSettings
};

// عرض الإشعارات للتذكير بالأقساط المستحقة قريبًا
function showDueInstallmentsNotifications() {
    if (!loansSettings.enableNotifications) return;
    
    const today = new Date();
    
    // الأقساط المستحقة خلال الأسبوع القادم
    const dueInstallments = window.installments.filter(i => {
        if (i.status !== 'unpaid') return false;
        
        const dueDate = new Date(i.dueDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays >= 0 && diffDays <= 7;
    });
    
    // عرض إشعار لكل قسط مستحق
    if (dueInstallments.length > 0) {
        setTimeout(() => {
            showNotification(`لديك ${dueInstallments.length} قسط مستحق خلال الأسبوع القادم`, 'warning');
        }, 2000);
    }
    
    // الأقساط المتأخرة
    const overdueInstallments = window.installments.filter(i => {
        if (i.status !== 'unpaid') return false;
        
        const dueDate = new Date(i.dueDate);
        return dueDate < today;
    });
    
    // عرض إشعار للأقساط المتأخرة
    if (overdueInstallments.length > 0) {
        setTimeout(() => {
            showNotification(`لديك ${overdueInstallments.length} قسط متأخر يحتاج للدفع`, 'error');
        }, 4000);
    }
}

// استدعاء وظيفة التذكير بالأقساط عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        showDueInstallmentsNotifications();
    }, 5000);
});

// تنفيذ تحقق من الأقساط المستحقة كل يوم
setInterval(() => {
    if (new Date().getHours() === 9) { // التحقق عند الساعة 9 صباحًا
        showDueInstallmentsNotifications();
    }
}, 60 * 60 * 1000); // التحقق كل ساعة