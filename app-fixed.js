/**
 * نظام الاستثمار المتكامل - ملف إصلاح التطبيق
 * يحتوي على إصلاحات للمشاكل الرئيسية في تطبيق نظام الاستثمار
 */

// تهيئة المتغيرات الرئيسية للتطبيق
let investors = [];
let transactions = [];
let settings = {
    interestRate: 17.5,
    reminderDays: 3,
    currency: 'دينار',
    language: 'ar',
    systemName: 'نظام الاستثمار المتكامل',
    profitCalculation: 'daily',
    profitCycle: 30,
    autoBackup: true,
    backupFrequency: 'weekly'
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة التطبيق...');
    loadData();
    initNavigation();
    initEventListeners();
    setCurrentDateAsDefault();
    updateDashboard();
    populateInvestorSelects();
    
    initCharts();

    // تفعيل الزر العائم
    initFloatingActionButton();
    
    // تفعيل البحث
    initSearchFunctionality();
});

// تحميل البيانات من التخزين المحلي
function loadData() {
    console.log('تحميل البيانات...');
    
    try {
        const savedInvestors = localStorage.getItem('investors');
        if (savedInvestors) {
            investors = JSON.parse(savedInvestors);
            console.log(`تم تحميل ${investors.length} مستثمر`);
        }

        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
            transactions = JSON.parse(savedTransactions);
            console.log(`تم تحميل ${transactions.length} عملية`);
        }

        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
            
            // التحقق من وجود العناصر قبل تعيين القيم
            const interestRateSetting = document.getElementById('interest-rate-setting');
            const reminderDays = document.getElementById('reminder-days');
            const interestRate = document.getElementById('interest-rate');
            
            if (interestRateSetting) interestRateSetting.value = settings.interestRate;
            if (reminderDays) reminderDays.value = settings.reminderDays;
            if (interestRate) interestRate.textContent = `${settings.interestRate}%`;
        }
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        showNotification('حدث خطأ أثناء تحميل البيانات', 'error');
    }

    renderInvestorsTable();
    renderTransactionsTable();
    renderProfitsTable();
    renderRecentTransactions();
}

// حفظ البيانات في التخزين المحلي
function saveData() {
    try {
        localStorage.setItem('investors', JSON.stringify(investors));
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('settings', JSON.stringify(settings));
        console.log('تم حفظ البيانات بنجاح');
        return true;
    } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
        showNotification('حدث خطأ أثناء حفظ البيانات', 'error');
        return false;
    }
}

// تهيئة التنقل بين الصفحات
function initNavigation() {
    console.log('تهيئة التنقل...');
    
    // التنقل بين الصفحات
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة الكلاس النشط من جميع الروابط
            navLinks.forEach(l => l.classList.remove('active'));
            
            // إضافة الكلاس النشط للرابط المحدد
            this.classList.add('active');
            
            // إظهار الصفحة المقابلة
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });

    // التبديل بين التبويبات
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(`${tabId}-tab`);
            
            // إزالة الكلاس النشط من جميع الأزرار والمحتويات
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // إضافة الكلاس النشط للزر والمحتوى المحدد
            this.classList.add('active');
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });

    // أزرار فتح وإغلاق القائمة الجانبية
    document.querySelectorAll('.toggle-sidebar').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
            document.querySelector('.layout').classList.toggle('sidebar-collapsed');
        });
    });
}

// إظهار صفحة محددة
function showPage(pageId) {
    console.log(`عرض الصفحة: ${pageId}`);
    
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // إظهار الصفحة المطلوبة
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // تحديث البيانات حسب الصفحة
        if (pageId === 'dashboard') {
            updateDashboard();
            renderRecentTransactions();
        } else if (pageId === 'investors') {
            renderInvestorsTable();
        } else if (pageId === 'transactions') {
            renderTransactionsTable();
        } else if (pageId === 'profits') {
            renderProfitsTable();
        }
    }
}

// تهيئة مستمعي الأحداث
function initEventListeners() {
    console.log('تهيئة مستمعي الأحداث...');
    
    // فتح النوافذ المنبثقة
    const addInvestorBtn = document.getElementById('add-investor-btn');
    const addDepositBtn = document.getElementById('add-deposit-btn');
    const addWithdrawBtn = document.getElementById('add-withdraw-btn');
    const payProfitsBtn = document.getElementById('pay-profits-btn');
    const addNewFab = document.getElementById('add-new-fab');

    if (addInvestorBtn) addInvestorBtn.addEventListener('click', () => openModal('add-investor-modal'));
    if (addDepositBtn) addDepositBtn.addEventListener('click', () => openModal('add-deposit-modal'));
    if (addWithdrawBtn) addWithdrawBtn.addEventListener('click', () => openModal('add-withdraw-modal'));
    if (payProfitsBtn) payProfitsBtn.addEventListener('click', () => openModal('pay-profit-modal'));
    if (addNewFab) addNewFab.addEventListener('click', () => openModal('add-investor-modal'));
    
    // إغلاق النوافذ المنبثقة
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // حفظ البيانات
    const saveInvestorBtn = document.getElementById('save-investor-btn');
    const saveDepositBtn = document.getElementById('save-deposit-btn');
    const saveWithdrawBtn = document.getElementById('save-withdraw-btn');
    const confirmPayProfit = document.getElementById('confirm-pay-profit');

    if (saveInvestorBtn) saveInvestorBtn.addEventListener('click', addNewInvestor);
    if (saveDepositBtn) saveDepositBtn.addEventListener('click', addDeposit);
    if (saveWithdrawBtn) saveWithdrawBtn.addEventListener('click', withdrawAmount);
    if (confirmPayProfit) confirmPayProfit.addEventListener('click', payProfit);
    
    // نماذج الإعدادات
    const generalSettingsForm = document.getElementById('general-settings-form');
    const profitsSettingsForm = document.getElementById('profits-settings-form');
    const notificationsSettingsForm = document.getElementById('notifications-settings-form');
    
    if (generalSettingsForm) {
        generalSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveGeneralSettings();
        });
    }
    
    if (profitsSettingsForm) {
        profitsSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfitsSettings();
        });
    }
    
    if (notificationsSettingsForm) {
        notificationsSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveNotificationsSettings();
        });
    }
    
    // اختيار المستثمر للأرباح
    const profitInvestor = document.getElementById('profit-investor');
    const withdrawInvestor = document.getElementById('withdraw-investor');
    
    if (profitInvestor) profitInvestor.addEventListener('change', calculateProfitForInvestor);
    if (withdrawInvestor) withdrawInvestor.addEventListener('change', showInvestorBalance);
    
    // إغلاق الإشعارات
    const notificationClose = document.querySelector('.notification-close');
    if (notificationClose) {
        notificationClose.addEventListener('click', function() {
            const notification = this.closest('.notification');
            if (notification) {
                notification.classList.remove('show');
            }
        });
    }
    
    // تصفية البيانات في جدول العمليات
    const transactionFilters = document.querySelectorAll('#transactions-page .btn-group .btn');
    if (transactionFilters.length > 0) {
        transactionFilters.forEach(button => {
            button.addEventListener('click', function() {
                // تحديث الزر النشط
                transactionFilters.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // تحديث عرض العمليات حسب النوع
                const filterType = this.textContent.trim();
                filterTransactions(filterType);
            });
        });
    }
    
    // الاستماع إلى حدث إضافة/تعديل/حذف المستثمر
    document.addEventListener('investor:update', function() {
        renderInvestorsTable();
        populateInvestorSelects();
        updateDashboard();
    });
    
    // الاستماع إلى حدث إضافة/تعديل/حذف العمليات
    document.addEventListener('transaction:update', function() {
        renderTransactionsTable();
        renderRecentTransactions();
        updateDashboard();
    });
}

// فتح نافذة منبثقة
function openModal(modalId) {
    console.log(`فتح النافذة: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`لم يتم العثور على النافذة: ${modalId}`);
        return;
    }
    
    modal.classList.add('active');
    
    // إعادة تعيين النموذج إذا كان موجودًا
    const form = modal.querySelector('form');
    if (form) form.reset();
    
    // تحديث تاريخ اليوم إذا كان هناك حقل تاريخ
    const dateInputs = modal.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.value = new Date().toISOString().split('T')[0];
    });
    
    // تحديث قوائم المستثمرين
    populateInvestorSelects();
    
    // تحديثات خاصة بنوافذ محددة
    if (modalId === 'pay-profit-modal') {
        calculateProfitForInvestor();
    } else if (modalId === 'add-withdraw-modal') {
        showInvestorBalance();
    }
}

// إغلاق نافذة منبثقة
function closeModal(modalId) {
    console.log(`إغلاق النافذة: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// تعيين التاريخ الحالي كقيمة افتراضية لحقول التاريخ
function setCurrentDateAsDefault() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.value = today;
    });
    console.log('تم تعيين التاريخ الحالي لجميع حقول التاريخ');
}




// الحصول على إجمالي الاستثمارات للمستثمر
function getTotalInvestmentForInvestor(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) return 0;
    
    return investor.investments.reduce((total, inv) => total + inv.amount, 0);
}

// الحصول على إجمالي الأرباح للمستثمر
function getTotalProfitForInvestor(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) return 0;
    
    return investor.investments.reduce((total, inv) => total + inv.interest, 0);
}

// حساب الأرباح لمستثمر محدد
// 3. تعديل دالة حساب الأرباح للمستثمر لتأخذ بعين الاعتبار المبالغ المسحوبة التي تم قطع فائدتها
function calculateProfitForInvestor() {
    console.log('حساب الأرباح للمستثمر...');
    
    const investorSelect = document.getElementById('profit-investor');
    if (!investorSelect) return;
    
    const investorId = investorSelect.value;
    const profitDetails = document.getElementById('profit-details');
    
    if (!investorId || !profitDetails) {
        if (profitDetails) profitDetails.innerHTML = '';
        return;
    }
    
    const investor = investors.find(inv => inv.id === investorId);
    
    if (investor) {
        let totalProfit = 0;
        let profitBreakdown = `
            <div class="section">
                <h3 class="section-title">تفاصيل الأرباح</h3>
                <table>
                    <thead>
                        <tr>
                            <th>المبلغ</th>
                            <th>تاريخ الإيداع</th>
                            <th>أيام الاستثمار</th>
                            <th>الربح</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // معالجة الاستثمارات النشطة
        investor.investments.forEach(inv => {
            // تجاهل الاستثمارات ذات المبلغ الصفري
            if (inv.amount <= 0) return;
            
            const start = new Date(inv.date);
            const today = new Date();
            const days = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
            
            // حساب الربح للاستثمارات النشطة فقط
            const profit = calculateInterest(inv.amount, inv.date, today.toISOString().split('T')[0]);
            
            totalProfit += profit;
            profitBreakdown += `
                <tr>
                    <td>${formatCurrency(inv.amount, true)}</td>
                    <td>${inv.date}</td>
                    <td>${days} يوم</td>
                    <td>${formatCurrency(profit, true)}</td>
                </tr>
            `;
        });
        
        // إضافة قسم للاستثمارات المسحوبة التي تم قطع فائدتها
        if (investor.withdrawnInvestments && investor.withdrawnInvestments.length > 0) {
            profitBreakdown += `
                <tr class="separator">
                    <td colspan="4"><strong>الاستثمارات المسحوبة (تم قطع فائدتها)</strong></td>
                </tr>
            `;
            
            investor.withdrawnInvestments.forEach(inv => {
                const start = new Date(inv.date);
                const end = new Date(inv.endDate);
                const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
                
                profitBreakdown += `
                    <tr class="withdrawn">
                        <td>${formatCurrency(inv.amount, true)}</td>
                        <td>${inv.date} إلى ${inv.endDate}</td>
                        <td>${days} يوم</td>
                        <td>${formatCurrency(0, true)} <small>(تم قطع الفائدة)</small></td>
                    </tr>
                `;
            });
        }
        
        profitBreakdown += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>إجمالي الربح</strong></td>
                            <td><strong>${formatCurrency(totalProfit, true)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        profitDetails.innerHTML = profitBreakdown;
    } else {
        profitDetails.innerHTML = '<p>لم يتم العثور على بيانات المستثمر</p>';
    }
}

// إضافة عملية جديدة
function addTransaction(type, investorId, amount, notes = '') {
    console.log(`إضافة عملية ${type} بقيمة ${amount} للمستثمر ${investorId}`);
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        console.error(`لم يتم العثور على المستثمر: ${investorId}`);
        return null;
    }
    
    // تحديد رصيد المستثمر بعد العملية
    let balanceAfter = 0;
    if (type === 'إيداع') {
        // تحديث رصيد المستثمر
        investor.amount = (investor.amount || 0) + amount;
        balanceAfter = investor.amount;
    } else if (type === 'سحب') {
        // تحديث رصيد المستثمر
        investor.amount = (investor.amount || 0) - amount;
        balanceAfter = investor.amount;
    } else {
        // في حالة الأرباح، لا نضيف للرصيد الأساسي
        balanceAfter = investor.amount || 0;
    }
    
    const newTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        type,
        investorId,
        investorName: investor ? investor.name : 'غير معروف',
        amount,
        balanceAfter,
        notes
    };
    
    transactions.push(newTransaction);
    saveData();
    
    // إطلاق حدث تحديث العمليات
    document.dispatchEvent(new CustomEvent('transaction:update'));
    
    return newTransaction;
}

// 4. تحديث دالة دفع الأرباح لتأخذ بعين الاعتبار المبالغ المسحوبة
function payProfit() {
    console.log('دفع الأرباح...');
    
    const profitInvestorSelect = document.getElementById('profit-investor');
    if (!profitInvestorSelect) {
        showNotification('خطأ في النموذج: لم يتم العثور على عنصر اختيار المستثمر', 'error');
        return;
    }
    
    const investorId = profitInvestorSelect.value;
    if (!investorId) {
        showNotification('الرجاء اختيار مستثمر', 'error');
        return;
    }
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على بيانات المستثمر', 'error');
        return;
    }
    
    let totalProfit = 0;
    
    // حساب الأرباح للاستثمارات النشطة فقط
    investor.investments.forEach(inv => {
        // تجاهل الاستثمارات ذات المبلغ الصفري
        if (inv.amount <= 0) return;
        
        const start = new Date(inv.date);
        const today = new Date();
        const profit = calculateInterest(inv.amount, inv.date, today.toISOString().split('T')[0]);
        totalProfit += profit;
    });
    
    // تسجيل عملية دفع الأرباح
    investor.profits.push({
        date: new Date().toISOString().split('T')[0],
        amount: totalProfit
    });
    
    // إضافة عملية جديدة
    addTransaction('دفع أرباح', investorId, totalProfit, 'دفع أرباح مستحقة');
    
    saveData();
    
    // إغلاق النافذة المنبثقة
    closeModal('pay-profit-modal');
    
    showNotification(`تم دفع الأرباح بمبلغ ${formatCurrency(totalProfit)} للمستثمر ${investor.name} بنجاح!`, 'success');
}


// إضافة إيداع جديد
function addDeposit() {
    console.log('إضافة إيداع جديد...');
    
    const depositInvestorSelect = document.getElementById('deposit-investor');
    const depositAmountInput = document.getElementById('deposit-amount');
    const depositDateInput = document.getElementById('deposit-date');
    const depositNotesInput = document.getElementById('deposit-notes');
    
    if (!depositInvestorSelect || !depositAmountInput || !depositDateInput) {
        showNotification('خطأ في النموذج: بعض الحقول المطلوبة غير موجودة', 'error');
        return;
    }
    
    const investorId = depositInvestorSelect.value;
    const amount = parseFloat(depositAmountInput.value);
    const depositDate = depositDateInput.value;
    const notes = depositNotesInput ? depositNotesInput.value || '' : '';
    
    if (!investorId || isNaN(amount) || amount <= 0 || !depositDate) {
        showNotification('الرجاء إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
        return;
    }
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على بيانات المستثمر', 'error');
        return;
    }
    
    // إضافة الاستثمار الجديد
    investor.investments.push({
        amount,
        date: depositDate,
        interest: calculateInterest(amount, depositDate),
        notes
    });
    
    // إضافة عملية جديدة
    addTransaction('إيداع', investorId, amount, notes);
    
    saveData();
    
    // إغلاق النافذة المنبثقة
    closeModal('add-deposit-modal');
    
    showNotification(`تم إضافة إيداع جديد بمبلغ ${amount.toLocaleString()} ${settings.currency} للمستثمر ${investor.name} بنجاح!`, 'success');
}

// سحب مبلغ
function withdrawAmount() {
    console.log('سحب مبلغ...');
    
    const withdrawInvestorSelect = document.getElementById('withdraw-investor');
    const withdrawAmountInput = document.getElementById('withdraw-amount');
    const withdrawDateInput = document.getElementById('withdraw-date');
    const withdrawNotesInput = document.getElementById('withdraw-notes');
    
    if (!withdrawInvestorSelect || !withdrawAmountInput || !withdrawDateInput) {
        showNotification('خطأ في النموذج: بعض الحقول المطلوبة غير موجودة', 'error');
        return;
    }
    
    const investorId = withdrawInvestorSelect.value;
    const amount = parseFloat(withdrawAmountInput.value);
    const withdrawDate = withdrawDateInput.value;
    const notes = withdrawNotesInput ? withdrawNotesInput.value || '' : '';
    
    if (!investorId || isNaN(amount) || amount <= 0 || !withdrawDate) {
        showNotification('الرجاء إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
        return;
    }
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على بيانات المستثمر', 'error');
        return;
    }
    
    if (amount > investor.amount) {
        showNotification('مبلغ السحب أكبر من الرصيد المتاح', 'error');
        return;
    }
    
    // البحث عن أقرب استثمار لخصم المبلغ منه
    // نقوم بترتيب الاستثمارات من الأقدم إلى الأحدث
    const sortedInvestments = [...investor.investments].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    
    let remainingWithdrawal = amount;
    
    // معالجة السحب وقطع الفائدة
    for (let i = 0; i < sortedInvestments.length && remainingWithdrawal > 0; i++) {
        const currentInvestment = sortedInvestments[i];
        
        // إذا كان الاستثمار به مبلغ كافٍ للسحب
        if (currentInvestment.amount >= remainingWithdrawal) {
            // خصم المبلغ من الاستثمار
            currentInvestment.amount -= remainingWithdrawal;
            
            // إنشاء استثمار جديد للمبلغ المسحوب مع تاريخ السحب كتاريخ انتهاء
            // وقطع الفائدة عن هذا المبلغ (وضع الفائدة بصفر)
            const withdrawnInvestment = {
                amount: remainingWithdrawal,
                date: currentInvestment.date,
                endDate: withdrawDate,
                interest: 0, // قطع الفائدة
                notes: `تم سحب ${remainingWithdrawal} في ${withdrawDate}`
            };
            
            // إضافة المبلغ المسحوب إلى قائمة السحوبات
            if (!investor.withdrawnInvestments) {
                investor.withdrawnInvestments = [];
            }
            investor.withdrawnInvestments.push(withdrawnInvestment);
            
            // إعادة حساب الفائدة للمبلغ المتبقي
            currentInvestment.interest = calculateInterest(currentInvestment.amount, currentInvestment.date);
            
            remainingWithdrawal = 0;
        }
        // إذا كان المبلغ المطلوب سحبه أكبر من الاستثمار الحالي
        else {
            // سحب كامل الاستثمار
            remainingWithdrawal -= currentInvestment.amount;
            
            // إنشاء استثمار منتهي للمبلغ المسحوب وقطع الفائدة
            const withdrawnInvestment = {
                amount: currentInvestment.amount,
                date: currentInvestment.date,
                endDate: withdrawDate,
                interest: 0, // قطع الفائدة
                notes: `تم سحب ${currentInvestment.amount} في ${withdrawDate}`
            };
            
            // إضافة المبلغ المسحوب إلى قائمة السحوبات
            if (!investor.withdrawnInvestments) {
                investor.withdrawnInvestments = [];
            }
            investor.withdrawnInvestments.push(withdrawnInvestment);
            
            // تصفير هذا الاستثمار
            currentInvestment.amount = 0;
            currentInvestment.interest = 0;
        }
    }
    
    // إضافة السحب إلى قائمة السحوبات
    investor.withdrawals.push({
        date: withdrawDate,
        amount,
        notes
    });
    
    // تحديث رصيد المستثمر الإجمالي
    investor.amount = (investor.amount || 0) - amount;
    
    // إضافة عملية جديدة
    addTransaction('سحب', investorId, amount, notes);
    
    saveData();
    
    // إغلاق النافذة المنبثقة
    closeModal('add-withdraw-modal');
    
    showNotification(`تم سحب مبلغ ${formatCurrency(amount)} من حساب المستثمر ${investor.name} بنجاح!`, 'success');
}

// 5. تعديل دالة عرض رصيد المستثمر للتحقق من المبالغ المسحوبة
function showInvestorBalance() {
    console.log('عرض رصيد المستثمر...');
    
    const withdrawInvestorSelect = document.getElementById('withdraw-investor');
    const balanceInfo = document.getElementById('withdraw-balance-info');
    
    if (!withdrawInvestorSelect || !balanceInfo) return;
    
    const investorId = withdrawInvestorSelect.value;
    
    if (!investorId) {
        balanceInfo.innerHTML = '';
        return;
    }
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        balanceInfo.innerHTML = '';
        return;
    }
    
    // الحصول على إجمالي المبلغ المستثمر المتاح للسحب
    const totalInvestment = investor.amount || 0;
    
    // إضافة معلومات إضافية عن السحوبات السابقة
    let withdrawalsHTML = '';
    if (investor.withdrawals && investor.withdrawals.length > 0) {
        withdrawalsHTML = `
            <div class="mt-3">
                <label class="form-label text-warning">تنبيه: سحب المبالغ يؤدي إلى قطع الفائدة عنها للشهر بالكامل</label>
                <div class="recent-withdrawals">
                    <small>آخر السحوبات:</small>
                    <ul class="withdrawal-list">
        `;
        
        // عرض آخر 3 سحوبات
        const recentWithdrawals = investor.withdrawals
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
            
        recentWithdrawals.forEach(withdrawal => {
            withdrawalsHTML += `
                <li>
                    <span class="date">${withdrawal.date}</span>
                    <span class="amount">${formatCurrency(withdrawal.amount)}</span>
                </li>
            `;
        });
        
        withdrawalsHTML += `
                    </ul>
                </div>
            </div>
        `;
    }
    
    balanceInfo.innerHTML = `
        <label class="form-label">الرصيد المتاح</label>
        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color); margin-bottom: 1rem;">
            ${formatCurrency(totalInvestment)}
        </div>
        ${withdrawalsHTML}
    `;
}

// 6. إضافة أنماط CSS لتحسين عرض المعلومات المتعلقة بالسحوبات
function addWithdrawalStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('withdrawal-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'withdrawal-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* أنماط لقائمة السحوبات */
        .withdrawal-list {
            list-style: none;
            padding: 0;
            margin: 0.5rem 0;
        }
        
        .withdrawal-list li {
            display: flex;
            justify-content: space-between;
            padding: 0.3rem 0;
            border-bottom: 1px dashed #eee;
            font-size: 0.85rem;
        }
        
        .withdrawal-list .date {
            color: #666;
        }
        
        .withdrawal-list .amount {
            font-weight: 500;
            color: #e74c3c;
        }
        
        /* أنماط للصفوف في جدول الأرباح */
        tr.separator td {
            background-color: #f8f9fa;
            border-top: 2px solid #dee2e6;
            padding: 0.5rem;
            font-size: 0.9rem;
        }
        
        tr.withdrawn {
            color: #6c757d;
            background-color: #f8f9fa;
        }
        
        tr.withdrawn td {
            text-decoration: line-through;
            opacity: 0.8;
        }
        
        tr.withdrawn td:last-child {
            text-decoration: none;
            color: #e74c3c;
        }
        
        tr.withdrawn small {
            display: block;
            text-decoration: none;
            font-style: italic;
            color: #e74c3c;
        }
        
        /* أنماط للتنبيهات */
        .text-warning {
            color: #f39c12;
            font-size: 0.9rem;
            display: block;
            margin-bottom: 0.5rem;
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للسحوبات');
}

// 7. تطبيق التغييرات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تطبيق إصلاحات معالجة قطع الفائدة عند السحب...');
    
    // استبدال الدوال الأصلية بالدوال المحدثة
    window.calculateInterest = calculateInterest;
    window.withdrawAmount = withdrawAmount;
    window.calculateProfitForInvestor = calculateProfitForInvestor;
    window.payProfit = payProfit;
    window.showInvestorBalance = showInvestorBalance;
    
    // إضافة أنماط CSS
    addWithdrawalStyles();
    
    // إضافة رسالة تنبيه عند فتح نافذة السحب
    const withdrawalModal = document.getElementById('add-withdraw-modal');
    if (withdrawalModal) {
        const modalTitle = withdrawalModal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.innerHTML = 'سحب <small style="font-size: 0.75rem; color: #e74c3c; display: block; margin-top: 5px;"> (سيتم قطع فائدة المبلغ المسحوب للشهر بالكامل)</small>';
        }
    }
    
    console.log('تم تطبيق الإصلاحات بنجاح');
});
/**
 * إصلاح شامل لمشاكل الإعدادات
 * يستخدم محددات أكثر مرونة للعثور على عناصر النموذج
 */

// حفظ الإعدادات العامة
function saveGeneralSettings() {
    console.log('حفظ الإعدادات العامة...');
    
    try {
        // محاولة العثور على العناصر بعدة طرق
        let systemNameInput = document.querySelector('#general-tab input[type="text"]');
        if (!systemNameInput) {
            systemNameInput = document.querySelector('#general-settings-form input[type="text"]');
        }
        
        let currencySelect = document.querySelector('#general-tab select:nth-of-type(1)');
        if (!currencySelect) {
            currencySelect = document.querySelector('#general-settings-form select:nth-of-type(1)');
        }
        
        let languageSelect = document.querySelector('#general-tab select:nth-of-type(2)');
        if (!languageSelect) {
            languageSelect = document.querySelector('#general-settings-form select:nth-of-type(2)');
        }
        
        // إذا لم نتمكن من العثور على العناصر، سنعرض رسالة توضيحية
        if (!systemNameInput || !currencySelect || !languageSelect) {
            console.error('بعض حقول الإعدادات العامة غير موجودة', {
                systemName: !!systemNameInput,
                currency: !!currencySelect,
                language: !!languageSelect
            });
            
            // تجربة استخدام selectors مختلفة
            const allInputs = document.querySelectorAll('#general-settings-form input, #general-tab input');
            const allSelects = document.querySelectorAll('#general-settings-form select, #general-tab select');
            
            console.log('عدد عناصر الإدخال المتاحة:', allInputs.length);
            console.log('عدد عناصر الاختيار المتاحة:', allSelects.length);
            
            // استخدام عناصر متاحة إذا وجدت
            if (!systemNameInput && allInputs.length > 0) {
                systemNameInput = allInputs[0];
                console.log('تم استخدام أول عنصر إدخال متاح');
            }
            
            if (!currencySelect && allSelects.length > 0) {
                currencySelect = allSelects[0];
                console.log('تم استخدام أول عنصر اختيار متاح');
            }
            
            if (!languageSelect && allSelects.length > 1) {
                languageSelect = allSelects[1];
                console.log('تم استخدام ثاني عنصر اختيار متاح');
            }
            
            // إذا لم نجد أي عناصر، نعرض رسالة خطأ ونتوقف
            if (!systemNameInput || !currencySelect || !languageSelect) {
                showNotification('لم يتم العثور على بعض عناصر النموذج. يرجى التحقق من الصفحة.', 'error');
                return;
            }
        }
        
        // تحديث الإعدادات بالقيم الموجودة
        settings.systemName = systemNameInput.value;
        settings.currency = currencySelect.value;
        settings.language = languageSelect.value;
        
        // حفظ الإعدادات
        if (saveData()) {
            // تحديث عنوان الصفحة
            document.title = settings.systemName;
            
            showNotification('تم حفظ الإعدادات العامة بنجاح', 'success');
        } else {
            showNotification('حدث خطأ أثناء حفظ الإعدادات', 'error');
        }
    } catch (error) {
        console.error('خطأ في حفظ الإعدادات العامة:', error);
        showNotification('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.', 'error');
    }
}

// حفظ إعدادات الأرباح
function saveProfitsSettings() {
    console.log('حفظ إعدادات الأرباح...');
    
    try {
        // محاولة العثور على العناصر بعدة طرق
        let interestRateInput = document.getElementById('interest-rate-setting');
        if (!interestRateInput) {
            interestRateInput = document.querySelector('#profits-settings-form input[type="number"]');
        }
        
        let profitCalculationSelect = document.querySelector('#profits-tab select[name="profit-calculation"]');
        if (!profitCalculationSelect) {
            profitCalculationSelect = document.querySelector('#profits-settings-form select:nth-of-type(1)');
        }
        
        let profitCycleSelect = document.querySelector('#profits-tab select[name="profit-cycle"]');
        if (!profitCycleSelect) {
            profitCycleSelect = document.querySelector('#profits-settings-form select:nth-of-type(2)');
        }
        
        // عرض توضيح للعناصر المتاحة إذا لم نجد ما نبحث عنه
        if (!interestRateInput || !profitCalculationSelect || !profitCycleSelect) {
            console.error('بعض حقول إعدادات الأرباح غير موجودة', {
                interestRate: !!interestRateInput,
                profitCalculation: !!profitCalculationSelect,
                profitCycle: !!profitCycleSelect
            });
            
            // تجربة استخدام selectors مختلفة
            const allInputs = document.querySelectorAll('#profits-settings-form input, #profits-tab input');
            const allSelects = document.querySelectorAll('#profits-settings-form select, #profits-tab select');
            
            console.log('عدد عناصر الإدخال المتاحة:', allInputs.length);
            console.log('عدد عناصر الاختيار المتاحة:', allSelects.length);
            
            // استخدام عناصر متاحة إذا وجدت
            if (!interestRateInput && allInputs.length > 0) {
                interestRateInput = allInputs[0];
                console.log('تم استخدام أول عنصر إدخال متاح');
            }
            
            if (!profitCalculationSelect && allSelects.length > 0) {
                profitCalculationSelect = allSelects[0];
                console.log('تم استخدام أول عنصر اختيار متاح');
            }
            
            if (!profitCycleSelect && allSelects.length > 1) {
                profitCycleSelect = allSelects[1];
                console.log('تم استخدام ثاني عنصر اختيار متاح');
            }
            
            // إذا لم نجد أي عناصر، نعرض رسالة خطأ ونتوقف
            if (!interestRateInput || !profitCalculationSelect || !profitCycleSelect) {
                showNotification('لم يتم العثور على بعض عناصر النموذج. يرجى التحقق من الصفحة.', 'error');
                return;
            }
        }
        
        // التحقق من قيم الحقول
        const interestRate = parseFloat(interestRateInput.value);
        if (isNaN(interestRate) || interestRate < 0 || interestRate > 100) {
            showNotification('يرجى إدخال نسبة ربح صحيحة بين 0 و 100', 'error');
            return;
        }
        
        // تحديث إعدادات النظام
        settings.interestRate = interestRate;
        settings.profitCalculation = profitCalculationSelect.value;
        settings.profitCycle = parseInt(profitCycleSelect.value);
        
        // حفظ الإعدادات
        if (saveData()) {
            // تحديث عرض نسبة الفائدة في لوحة التحكم
            const interestRateEl = document.getElementById('interest-rate');
            if (interestRateEl) {
                interestRateEl.textContent = `${settings.interestRate}%`;
            }
            
            showNotification('تم حفظ إعدادات الأرباح بنجاح', 'success');
        } else {
            showNotification('حدث خطأ أثناء حفظ الإعدادات', 'error');
        }
    } catch (error) {
        console.error('خطأ في حفظ إعدادات الأرباح:', error);
        showNotification('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.', 'error');
    }
}

// حفظ إعدادات الإشعارات
function saveNotificationsSettings() {
    console.log('حفظ إعدادات الإشعارات...');
    
    try {
        // محاولة العثور على العناصر بعدة طرق
        let reminderDaysInput = document.getElementById('reminder-days');
        if (!reminderDaysInput) {
            reminderDaysInput = document.querySelector('#notifications-settings-form input[type="number"]');
        }
        
        let emailNewInvestorCheck = document.getElementById('email-new-investor');
        let emailProfitPaymentCheck = document.getElementById('email-profit-payment');
        let emailWithdrawalCheck = document.getElementById('email-withdrawal');
        
        // إذا لم يتم العثور على عناصر التحقق، نبحث عن جميع مربعات الاختيار
        const checkboxes = document.querySelectorAll('#notifications-settings-form input[type="checkbox"]');
        if ((!emailNewInvestorCheck || !emailProfitPaymentCheck || !emailWithdrawalCheck) && checkboxes.length >= 3) {
            emailNewInvestorCheck = checkboxes[0];
            emailProfitPaymentCheck = checkboxes[1];
            emailWithdrawalCheck = checkboxes[2];
        }
        
        // التحقق من وجود العناصر
        if (!reminderDaysInput || !emailNewInvestorCheck || !emailProfitPaymentCheck || !emailWithdrawalCheck) {
            console.error('بعض حقول إعدادات الإشعارات غير موجودة', {
                reminderDays: !!reminderDaysInput,
                emailNewInvestor: !!emailNewInvestorCheck,
                emailProfitPayment: !!emailProfitPaymentCheck,
                emailWithdrawal: !!emailWithdrawalCheck
            });
            
            showNotification('لم يتم العثور على بعض عناصر النموذج. يرجى التحقق من الصفحة.', 'error');
            return;
        }
        
        // التحقق من قيم الحقول
        const reminderDays = parseInt(reminderDaysInput.value);
        if (isNaN(reminderDays) || reminderDays < 1 || reminderDays > 30) {
            showNotification('يرجى إدخال عدد أيام تذكير صحيح بين 1 و 30', 'error');
            return;
        }
        
        // تحديث إعدادات النظام
        settings.reminderDays = reminderDays;
        settings.emailNotifications = {
            newInvestor: emailNewInvestorCheck.checked,
            profitPayment: emailProfitPaymentCheck.checked,
            withdrawal: emailWithdrawalCheck.checked
        };
        
        // حفظ الإعدادات
        if (saveData()) {
            showNotification('تم حفظ إعدادات الإشعارات بنجاح', 'success');
        } else {
            showNotification('حدث خطأ أثناء حفظ الإعدادات', 'error');
        }
    } catch (error) {
        console.error('خطأ في حفظ إعدادات الإشعارات:', error);
        showNotification('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.', 'error');
    }
}

/**
 * وظيفة إضافية لإظهار العناصر الموجودة في الصفحة للمساعدة في تشخيص المشكلة
 */
function debugForms() {
    console.log('=== تشخيص النماذج ===');
    
    // إعدادات عامة
    const generalForm = document.getElementById('general-settings-form');
    console.log('نموذج الإعدادات العامة موجود:', !!generalForm);
    if (generalForm) {
        console.log('الحقول في نموذج الإعدادات العامة:', {
            inputs: generalForm.querySelectorAll('input').length,
            selects: generalForm.querySelectorAll('select').length,
            buttons: generalForm.querySelectorAll('button').length
        });
    }
    
    // إعدادات الأرباح
    const profitsForm = document.getElementById('profits-settings-form');
    console.log('نموذج إعدادات الأرباح موجود:', !!profitsForm);
    if (profitsForm) {
        console.log('الحقول في نموذج إعدادات الأرباح:', {
            inputs: profitsForm.querySelectorAll('input').length,
            selects: profitsForm.querySelectorAll('select').length,
            buttons: profitsForm.querySelectorAll('button').length
        });
    }
    
    // إعدادات الإشعارات
    const notificationsForm = document.getElementById('notifications-settings-form');
    console.log('نموذج إعدادات الإشعارات موجود:', !!notificationsForm);
    if (notificationsForm) {
        console.log('الحقول في نموذج إعدادات الإشعارات:', {
            inputs: notificationsForm.querySelectorAll('input').length,
            selects: notificationsForm.querySelectorAll('select').length,
            buttons: notificationsForm.querySelectorAll('button').length
        });
    }
    
    // البحث عن عناصر محددة
    console.log('العناصر المحددة:', {
        'interest-rate-setting': !!document.getElementById('interest-rate-setting'),
        'reminder-days': !!document.getElementById('reminder-days'),
        'email-new-investor': !!document.getElementById('email-new-investor'),
        'email-profit-payment': !!document.getElementById('email-profit-payment'),
        'email-withdrawal': !!document.getElementById('email-withdrawal')
    });
    
    // عرض كل النماذج
    console.log('جميع النماذج في الصفحة:', document.querySelectorAll('form').length);
    
    // عرض كل علامات التبويب
    console.log('علامات التبويب:', {
        'general-tab': !!document.getElementById('general-tab'),
        'profits-tab': !!document.getElementById('profits-tab'),
        'notifications-tab': !!document.getElementById('notifications-tab'),
        'backup-tab': !!document.getElementById('backup-tab')
    });
}

// استدعاء دالة التشخيص عند فتح صفحة الإعدادات
document.addEventListener('page:change', function(e) {
    if (e.detail.page === 'settings') {
        // تأخير التشخيص للتأكد من تحميل جميع العناصر
        setTimeout(debugForms, 500);
    }
});
// تحديث لوحة التحكم الرئيسية
function updateDashboard() {
    console.log('تحديث لوحة التحكم...');
    
    // تحديث إجمالي الاستثمارات
    const totalInvestments = investors.reduce((sum, investor) => sum + (investor.amount || 0), 0);
    const totalInvestmentsElement = document.getElementById('total-investments');
    if (totalInvestmentsElement) {
        totalInvestmentsElement.textContent = `${totalInvestments.toLocaleString()} ${settings.currency}`;
    }
    
    // تحديث الأرباح الشهرية
    const monthlyProfits = calculateMonthlyProfits();
    const monthlyProfitsElement = document.getElementById('monthly-profits');
    if (monthlyProfitsElement) {
        monthlyProfitsElement.textContent = `${monthlyProfits.toLocaleString()} ${settings.currency}`;
    }
    
    // تحديث عدد المستثمرين
    const investorsCountElement = document.getElementById('investors-count');
    if (investorsCountElement) {
        investorsCountElement.textContent = investors.length;
    }
    
    // تحديث نسبة العائد
    const interestRateElement = document.getElementById('interest-rate');
    if (interestRateElement) {
        interestRateElement.textContent = `${settings.interestRate}%`;
    }
    
    // تحديث الرسوم البيانية
    updateCharts();
}

// حساب الأرباح الشهرية
function calculateMonthlyProfits() {
    console.log('حساب الأرباح الشهرية...');
    
    // التأكد من وجود مصفوفة المستثمرين
    if (!Array.isArray(investors) || investors.length === 0) {
        return 0;
    }
    
    return investors.reduce((sum, investor) => {
        // التحقق من وجود المستثمر واستثماراته
        if (!investor || !investor.investments || !Array.isArray(investor.investments)) {
            return sum;
        }
        
        const monthlyProfit = investor.investments.reduce((total, investment) => {
            if (!investment || !investment.amount) {
                return total;
            }
            return total + calculateInterest(investment.amount, investment.date);
        }, 0);
        
        return sum + monthlyProfit;
    }, 0);
}

// ملء قوائم اختيار المستثمرين
function populateInvestorSelects() {
    console.log('ملء قوائم المستثمرين...');
    
    const depositInvestorSelect = document.getElementById('deposit-investor');
    const withdrawInvestorSelect = document.getElementById('withdraw-investor');
    const profitInvestorSelect = document.getElementById('profit-investor');
    
    // تجهيز قائمة المستثمرين مرتبة أبجديًا
    const sortedInvestors = [...investors].sort((a, b) => a.name.localeCompare(b.name));
    
    // ملء قائمة الإيداع
    if (depositInvestorSelect) {
        depositInvestorSelect.innerHTML = '<option value="">اختر المستثمر</option>';
        sortedInvestors.forEach(investor => {
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = `${investor.name} (${investor.phone})`;
            depositInvestorSelect.appendChild(option);
        });
    }
    
    // ملء قائمة السحب
    if (withdrawInvestorSelect) {
        withdrawInvestorSelect.innerHTML = '<option value="">اختر المستثمر</option>';
        sortedInvestors.forEach(investor => {
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = `${investor.name} (${investor.phone})`;
            withdrawInvestorSelect.appendChild(option);
        });
    }
    
    // ملء قائمة الأرباح
    if (profitInvestorSelect) {
        profitInvestorSelect.innerHTML = '<option value="">اختر المستثمر</option>';
        sortedInvestors.forEach(investor => {
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = `${investor.name} (${investor.phone})`;
            profitInvestorSelect.appendChild(option);
        });
    }
}

/**
 * تحديث لإصلاح خطأ في دالة renderInvestorsTable
 * يجب استبدال الكود التالي في ملف app-fixed.js
 */

// عرض جدول المستثمرين
function renderInvestorsTable() {
    console.log('عرض جدول المستثمرين...');
    
    const tableBody = document.querySelector('#investors-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // ترتيب المستثمرين حسب تاريخ الإضافة (الأحدث أولاً)
    const sortedInvestors = [...investors].sort((a, b) => {
        return new Date(b.createdAt || b.joinDate) - new Date(a.createdAt || a.joinDate);
    });
    
    sortedInvestors.forEach(investor => {
        const row = document.createElement('tr');
        
        // حساب الربح الشهري - مع التحقق من وجود المصفوفة قبل استخدام reduce
        let monthlyProfit = 0;
        if (investor.investments && Array.isArray(investor.investments)) {
            monthlyProfit = investor.investments.reduce((total, inv) => {
                return total + calculateInterest(inv.amount, inv.date);
            }, 0);
        } else {
            // إذا لم تكن المصفوفة موجودة، نحسب الربح على المبلغ الإجمالي
            monthlyProfit = calculateInterest(investor.amount, investor.joinDate || investor.createdAt);
        }
        
        // تنسيق تاريخ الانضمام
        const joinDate = investor.joinDate || investor.createdAt || '';
        
        row.innerHTML = `
            <td>${investor.id}</td>
            <td>
                <div class="investor-info">
                    <div class="investor-avatar">${investor.name.charAt(0)}</div>
                    <div>
                        <div class="investor-name">${investor.name}</div>
                        <div class="investor-phone">${investor.phone}</div>
                    </div>
                </div>
            </td>
            <td>${investor.phone}</td>
            <td>${(investor.amount || 0).toLocaleString()} ${settings.currency}</td>
            <td>${monthlyProfit.toLocaleString()} ${settings.currency}</td>
            <td>${joinDate}</td>
            <td><span class="badge badge-success">نشط</span></td>
            <td>
                <div class="investor-actions">
                    <button class="investor-action-btn view-investor" data-id="${investor.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="investor-action-btn edit edit-investor" data-id="${investor.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="investor-action-btn delete delete-investor" data-id="${investor.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-investor');
        const editButton = row.querySelector('.edit-investor');
        const deleteButton = row.querySelector('.delete-investor');
        
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                showInvestorDetails(investor.id);
            });
        }
        
        if (editButton) {
            editButton.addEventListener('click', () => {
                editInvestor(investor.id);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                deleteInvestor(investor.id);
            });
        }
    });
    
    if (sortedInvestors.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="8" class="text-center">لا يوجد مستثمرين</td>';
        tableBody.appendChild(emptyRow);
    }
}

/**
 * إصلاح آخر لمشكلة محتملة في إضافة مستثمر جديد
 */

/**
 * إصلاح مشكلة عرض المبالغ المالية المزدوجة في نظام الاستثمار المتكامل
 * 
 * المشكلة: عند إضافة استثمار جديد، يظهر المبلغ مضاعفاً في تفاصيل المستثمر والعمليات
 * الحل: تعديل الدوال المسؤولة عن إضافة المستثمرين والعمليات لمنع الإضافة المزدوجة للمبالغ
 */

// 1. تعديل دالة إضافة مستثمر جديد
function addNewInvestor() {
    console.log('إضافة مستثمر جديد (بعد الإصلاح)...');
    
    const nameInput = document.getElementById('investor-name');
    const phoneInput = document.getElementById('investor-phone');
    const addressInput = document.getElementById('investor-address');
    const cardInput = document.getElementById('investor-card');
    const depositDateInput = document.getElementById('investor-deposit-date');
    const amountInput = document.getElementById('investor-amount');

    if (!nameInput || !phoneInput || !addressInput || !cardInput || !depositDateInput || !amountInput) {
        showNotification('خطأ في النموذج: بعض الحقول المطلوبة غير موجودة', 'error');
        return;
    }

    const name = nameInput.value;
    const phone = phoneInput.value;
    const address = addressInput.value;
    const cardNumber = cardInput.value;
    const depositDate = depositDateInput.value;
    const amount = parseFloat(amountInput.value);

    if (!name || !phone || !address || !cardNumber || !depositDate || isNaN(amount) || amount <= 0) {
        showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
        return;
    }

    // حساب الفائدة المتوقعة
    const interest = calculateInterest(amount, depositDate);

    const newInvestor = {
        id: Date.now().toString(),
        name,
        phone,
        address,
        cardNumber,
        joinDate: depositDate,
        createdAt: new Date().toISOString(),
        status: 'نشط',
        investments: [
            {
                amount,
                date: depositDate,
                interest: interest
            }
        ],
        profits: [],
        withdrawals: [],
        // تعيين المبلغ الإجمالي مباشرة دون إضافته مرة أخرى
        amount: amount // هذا هو المبلغ الأصلي الذي سيظهر في التفاصيل
    };

    investors.push(newInvestor);

    // إضافة عملية جديدة بنوع "إيداع"
    // تم تغيير الدالة لتجنب إضافة المبلغ مرة أخرى إلى رصيد المستثمر
    addTransaction('إيداع', newInvestor.id, amount, '', true);

    // حفظ البيانات
    saveData();
    
    // إطلاق حدث تحديث المستثمرين
    document.dispatchEvent(new CustomEvent('investor:update'));
    
    // إغلاق النافذة المنبثقة
    closeModal('add-investor-modal');
    
    // عرض إشعار النجاح
    showNotification(`تمت إضافة المستثمر ${name} بنجاح!`, 'success');
}

// 2. تعديل دالة إضافة عملية جديدة لمنع الإضافة المزدوجة للمبالغ
function addTransaction(type, investorId, amount, notes = '', isInitialDeposit = false) {
    console.log(`إضافة عملية ${type} بقيمة ${amount} للمستثمر ${investorId}`);
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        console.error(`لم يتم العثور على المستثمر: ${investorId}`);
        return null;
    }
    
    // تحديد رصيد المستثمر بعد العملية
    let balanceAfter = 0;
    
    // الفرق الرئيسي: إذا كانت هذه هي العملية الأولى (الإيداع الأولي)، لا نقوم بتحديث الرصيد
    // لأننا قمنا بتعيينه بالفعل عند إنشاء المستثمر
    if (type === 'إيداع' && !isInitialDeposit) {
        // تحديث رصيد المستثمر في حالة الإيداع الجديد (ليس الإيداع الأولي)
        investor.amount = (investor.amount || 0) + amount;
        balanceAfter = investor.amount;
    } else if (type === 'سحب') {
        // تحديث رصيد المستثمر في حالة السحب
        investor.amount = (investor.amount || 0) - amount;
        balanceAfter = investor.amount;
    } else {
        // في حالة الأرباح أو الإيداع الأولي، لا نغير الرصيد الأساسي
        balanceAfter = investor.amount || 0;
    }
    
    const newTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        type,
        investorId,
        investorName: investor ? investor.name : 'غير معروف',
        amount,
        balanceAfter,
        notes
    };
    
    transactions.push(newTransaction);
    saveData();
    
    // إطلاق حدث تحديث العمليات
    document.dispatchEvent(new CustomEvent('transaction:update'));
    
    return newTransaction;
}

// 3. تعديل دالة إضافة إيداع جديد لمستثمر موجود
function addDeposit() {
    console.log('إضافة إيداع جديد (بعد الإصلاح)...');
    
    const depositInvestorSelect = document.getElementById('deposit-investor');
    const depositAmountInput = document.getElementById('deposit-amount');
    const depositDateInput = document.getElementById('deposit-date');
    const depositNotesInput = document.getElementById('deposit-notes');
    
    if (!depositInvestorSelect || !depositAmountInput || !depositDateInput) {
        showNotification('خطأ في النموذج: بعض الحقول المطلوبة غير موجودة', 'error');
        return;
    }
    
    const investorId = depositInvestorSelect.value;
    const amount = parseFloat(depositAmountInput.value);
    const depositDate = depositDateInput.value;
    const notes = depositNotesInput ? depositNotesInput.value || '' : '';
    
    if (!investorId || isNaN(amount) || amount <= 0 || !depositDate) {
        showNotification('الرجاء إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
        return;
    }
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على بيانات المستثمر', 'error');
        return;
    }
    
    // إضافة الاستثمار الجديد إلى قائمة استثمارات المستثمر
    investor.investments.push({
        amount,
        date: depositDate,
        interest: calculateInterest(amount, depositDate),
        notes
    });
    
    // إضافة عملية جديدة - نمرر false لتمكين تحديث الرصيد
    addTransaction('إيداع', investorId, amount, notes, false);
    
    saveData();
    
    // إغلاق النافذة المنبثقة
    closeModal('add-deposit-modal');
    
    showNotification(`تم إضافة إيداع جديد بمبلغ ${formatCurrency(amount)} للمستثمر ${investor.name} بنجاح!`, 'success');
}

// 4. التأكد من صحة عرض تفاصيل المستثمر
function showInvestorDetails(investorId) {
    console.log(`عرض تفاصيل المستثمر (بعد الإصلاح): ${investorId}`);
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return;
    }
    
    // استخدام القيمة الفعلية للمبلغ المستثمر
    const totalInvestment = investor.amount || 0;
    const monthlyProfit = investor.investments.reduce((total, inv) => {
        return total + calculateInterest(inv.amount, inv.date);
    }, 0);
    
    // حساب مدة الاستثمار
    const startDate = new Date(investor.joinDate || investor.createdAt);
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    // الحصول على عمليات المستثمر
    const investorTransactions = transactions.filter(tr => tr.investorId === investorId);
    
    // إنشاء محتوى النافذة المنبثقة
    const content = `
        <div class="investor-profile">
            <div class="investor-avatar large">${investor.name.charAt(0)}</div>
            <h2 class="investor-fullname">${investor.name}</h2>
            <span class="badge badge-success">${investor.status || 'نشط'}</span>
        </div>
        
        <div class="investor-stats">
            <div class="stat-item">
                <div class="stat-value">${formatCurrency(totalInvestment)}</div>
                <div class="stat-label">إجمالي الاستثمار</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${formatCurrency(monthlyProfit)}</div>
                <div class="stat-label">الربح الشهري</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${daysPassed} يوم</div>
                <div class="stat-label">مدة الاستثمار</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">معلومات الاتصال</h3>
            <div class="detail-item">
                <div class="detail-label">رقم الهاتف</div>
                <div class="detail-value">${investor.phone}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">العنوان</div>
                <div class="detail-value">${investor.address || 'غير محدد'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">رقم البطاقة</div>
                <div class="detail-value">${investor.cardNumber || 'غير محدد'}</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">آخر العمليات</h3>
            <div class="mini-table-container">
                <table class="mini-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>النوع</th>
                            <th>المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${investorTransactions.length > 0 ? 
                            investorTransactions.slice(0, 5).map(tr => `
                                <tr>
                                    <td>${tr.date}</td>
                                    <td>${tr.type}</td>
                                    <td>${formatCurrency(tr.amount)}</td>
                                </tr>
                            `).join('') : 
                            '<tr><td colspan="3">لا توجد عمليات</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="investor-actions-big">
            <button class="btn btn-primary" onclick="editInvestor('${investorId}')">
                <i class="fas fa-edit"></i> تعديل البيانات
            </button>
            <button class="btn btn-success" onclick="openProfitModal('${investorId}')">
                <i class="fas fa-coins"></i> دفع الأرباح
            </button>
            <button class="btn btn-danger" onclick="deleteInvestor('${investorId}')">
                <i class="fas fa-trash"></i> حذف المستثمر
            </button>
        </div>
        <td>
  <button class="btn btn-sm btn-outline edit-transaction" data-id="${txn.id}">
    <i class="fas fa-edit"></i>
  </button>
</td>

    `;
    
    // عرض النافذة المنبثقة
    showModal(`تفاصيل المستثمر - ${investor.name}`, content);
}

// 5. تصحيح طريقة عرض تفاصيل العمليات
function showTransactionDetails(transactionId) {
    console.log(`عرض تفاصيل العملية (بعد الإصلاح): ${transactionId}`);
    
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) {
        showNotification('لم يتم العثور على العملية', 'error');
        return;
    }
    
    const investor = investors.find(i => i.id === transaction.investorId);
    const investorName = investor ? investor.name : transaction.investorName || 'غير معروف';
    
    let typeClass = '';
    switch(transaction.type) {
        case 'إيداع':
            typeClass = 'success';
            break;
        case 'سحب':
            typeClass = 'danger';
            break;
        case 'دفع أرباح':
            typeClass = 'info';
            break;
        default:
            typeClass = 'primary';
    }
    
    // إنشاء محتوى النافذة المنبثقة
    const content = `
        <div class="transaction-details">
            <div class="transaction-header">
                <span class="badge badge-${typeClass}">${transaction.type}</span>
                <span class="transaction-date">${transaction.date}</span>
            </div>
            <div class="transaction-body">
                <div class="detail-item">
                    <div class="detail-label">رقم العملية</div>
                    <div class="detail-value">${transaction.id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">المستثمر</div>
                    <div class="detail-value">${investorName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">نوع العملية</div>
                    <div class="detail-value">${transaction.type}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">تاريخ العملية</div>
                    <div class="detail-value">${transaction.date}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">المبلغ</div>
                    <div class="detail-value">${formatCurrency(transaction.amount)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">الرصيد بعد العملية</div>
                    <div class="detail-value">${transaction.balanceAfter ? formatCurrency(transaction.balanceAfter) : '-'}</div>
                </div>
                ${transaction.notes ? `
                <div class="detail-item">
                    <div class="detail-label">ملاحظات</div>
                    <div class="detail-value">${transaction.notes}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // عرض النافذة المنبثقة
    showModal('تفاصيل العملية', content);
}

// 6. نسخة محسنة من تهيئة التطبيق تقوم بإصلاح البيانات الموجودة
function fixExistingData() {
    console.log('إصلاح البيانات الموجودة...');
    
    // البحث عن المستثمرين الذين قد يكون لديهم مبالغ مضاعفة
    let fixedCount = 0;
    
    investors.forEach(investor => {
        // حساب إجمالي مبالغ الاستثمارات الفعلية
        const totalInvestmentsAmount = investor.investments.reduce((sum, inv) => sum + inv.amount, 0);
        
        // حساب إجمالي عمليات الإيداع المرتبطة بالمستثمر
        const totalDeposits = transactions
            .filter(tr => tr.investorId === investor.id && tr.type === 'إيداع')
            .reduce((sum, tr) => sum + tr.amount, 0);
            
        // حساب إجمالي عمليات السحب المرتبطة بالمستثمر
        const totalWithdrawals = transactions
            .filter(tr => tr.investorId === investor.id && tr.type === 'سحب')
            .reduce((sum, tr) => sum + tr.amount, 0);
        
        // المبلغ الصحيح المفترض أن يكون للمستثمر (الإيداعات - السحوبات)
        const correctAmount = totalDeposits - totalWithdrawals;
        
        // إذا كان الفرق كبير، نقوم بتصحيح المبلغ
        if (Math.abs(investor.amount - correctAmount) > 1) {
            console.log(`تصحيح مبلغ المستثمر ${investor.name} من ${investor.amount} إلى ${correctAmount}`);
            investor.amount = correctAmount;
            
            // تحديث آخر عملية للمستثمر لتعكس الرصيد الصحيح
            const lastTransaction = transactions
                .filter(tr => tr.investorId === investor.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                
            if (lastTransaction) {
                lastTransaction.balanceAfter = correctAmount;
            }
            
            fixedCount++;
        }
    });
    
    if (fixedCount > 0) {
        saveData();
        console.log(`تم إصلاح ${fixedCount} من سجلات المستثمرين`);
        return true;
    }
    
    return false;
}

// تطبيق الإصلاحات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تطبيق إصلاحات عرض المبالغ المزدوجة...');
    
    // استبدال الدوال الأصلية بالدوال المصححة
    window.addNewInvestor = addNewInvestor;
    window.addTransaction = addTransaction;
    window.addDeposit = addDeposit;
    window.showInvestorDetails = showInvestorDetails;
    window.showTransactionDetails = showTransactionDetails;
    
    // محاولة إصلاح البيانات الموجودة
    setTimeout(() => {
        if (fixExistingData()) {
            // تحديث واجهة المستخدم بعد إصلاح البيانات
            updateDashboard();
            renderInvestorsTable();
            renderTransactionsTable();
            renderProfitsTable();
            renderRecentTransactions();
            
            showNotification('تم إصلاح المبالغ المضاعفة في البيانات', 'success');
        }
    }, 2000);
});


/**
 * سكربت تصحيح أرصدة المستثمرين الموجودة
 * يقوم هذا السكربت بالتحقق من صحة أرصدة المستثمرين الحاليين وتصحيحها
 * لاستخدامه، انسخ الكود وألصقه في وحدة تحكم المتصفح (F12 ثم Console)
 */

(function() {
    // دالة لتنسيق المبالغ المالية للعرض
    function formatAmount(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return "0";
        }
        return amount.toLocaleString();
    }

    // 1. عرض حالة البيانات الحالية
    console.log("=== تشخيص مشكلة المبالغ المضاعفة ===");
    console.log(`عدد المستثمرين: ${investors.length}`);
    console.log(`عدد العمليات: ${transactions.length}`);

    // 2. التحقق من كل مستثمر
    const problemsFound = [];
    
    investors.forEach(investor => {
        // حساب إجمالي الإيداعات
        const totalDeposits = transactions
            .filter(tr => tr.investorId === investor.id && tr.type === 'إيداع')
            .reduce((sum, tr) => sum + tr.amount, 0);
        
        // حساب إجمالي السحوبات
        const totalWithdrawals = transactions
            .filter(tr => tr.investorId === investor.id && tr.type === 'سحب')
            .reduce((sum, tr) => sum + tr.amount, 0);
        
        // الرصيد الفعلي المفترض
        const expectedBalance = totalDeposits - totalWithdrawals;
        
        // مقارنة مع الرصيد المخزن للمستثمر
        if (Math.abs(investor.amount - expectedBalance) > 1) {
            problemsFound.push({
                investorId: investor.id,
                investorName: investor.name,
                storedAmount: investor.amount,
                expectedAmount: expectedBalance,
                difference: investor.amount - expectedAmount
            });
        }
    });

    // 3. عرض المشاكل التي تم اكتشافها
    if (problemsFound.length > 0) {
        console.log(`تم اكتشاف ${problemsFound.length} من المشاكل في أرصدة المستثمرين:`);
        console.table(problemsFound.map(p => ({
            "المستثمر": p.investorName,
            "المبلغ المخزن": formatAmount(p.storedAmount),
            "المبلغ المتوقع": formatAmount(p.expectedAmount),
            "الفرق": formatAmount(p.difference)
        })));
    } else {
        console.log("لم يتم اكتشاف أي مشاكل في أرصدة المستثمرين");
    }

    // 4. السؤال عن رغبة المستخدم في تصحيح المشاكل
    if (problemsFound.length > 0) {
        const shouldFix = confirm(`تم اكتشاف ${problemsFound.length} من المشاكل في أرصدة المستثمرين. هل ترغب في تصحيح هذه المشاكل؟`);
        
        if (shouldFix) {
            // 5. تصحيح المشاكل
            let fixedCount = 0;
            
            problemsFound.forEach(problem => {
                const investor = investors.find(inv => inv.id === problem.investorId);
                if (investor) {
                    investor.amount = problem.expectedAmount;
                    
                    // تحديث آخر عملية للمستثمر لتعكس الرصيد الصحيح
                    const lastTransaction = transactions
                        .filter(tr => tr.investorId === investor.id)
                        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                        
                    if (lastTransaction) {
                        lastTransaction.balanceAfter = problem.expectedAmount;
                    }
                    
                    fixedCount++;
                }
            });
            
            // 6. حفظ البيانات
            localStorage.setItem('investors', JSON.stringify(investors));
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            console.log(`تم تصحيح ${fixedCount} من سجلات المستثمرين`);
            alert(`تم تصحيح ${fixedCount} من سجلات المستثمرين. الرجاء تحديث الصفحة لتطبيق التغييرات.`);
        }
    }
    
    // 7. نصائح إضافية
    console.log("=== نصائح إضافية ===");
    console.log("1. قم بتحديث الصفحة بعد إجراء التصحيحات");
    console.log("2. جرب إضافة مستثمر جديد للتأكد من أن المشكلة لم تعد موجودة");
    console.log("3. قم بتنزيل نسخة احتياطية من البيانات بعد التصحيح");
})();



document.querySelectorAll('input[type="date"]').forEach(input => {
    input.addEventListener('change', function () {
        const selected = new Date(this.value);
        const today = new Date();
        const days = Math.floor((today - selected) / (1000 * 60 * 60 * 24));
        const message = isNaN(days) ? '' : `(${days} يوم منذ هذا التاريخ)`;

        const msgBox = this.parentElement.querySelector('.days-since-text');
        if (msgBox) {
            msgBox.textContent = message;
        } else {
            const span = document.createElement('small');
            span.className = 'days-since-text';
            span.style.color = '#888';
            span.textContent = message;
            this.parentElement.appendChild(span);
        }
    });
});



/**
 * إصلاح للتأكد من عدم استخدام خصائص undefined أثناء حساب الفائدة
 */

// حساب الفائدة
function calculateInterest(amount, startDate, endDate = null) {
    // التأكد من وجود القيم قبل استخدامها
    if (!amount || isNaN(amount) || amount <= 0) {
        return 0;
    }

    if (!startDate) {
        startDate = new Date().toISOString().split('T')[0];
    }

    const rate = settings.interestRate / 100;
    
    // استخدام تاريخ نهاية محدد أو تاريخ اليوم
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    // حساب عدد الأيام
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // عدد الأيام في الشهر (أو الدورة)
    const daysInCycle = settings.profitCycle || 30;
    
    // حساب الفائدة حسب طريقة الحساب
    let interest = 0;
    
    if (settings.profitCalculation === 'daily') {
        // حساب الفائدة النسبية بالأيام
        interest = (amount * rate * days) / daysInCycle;
    } else {
        // حساب الفائدة الشهرية كاملة
        interest = amount * rate;
    }
    
    return interest;
}


/**
 * إضافة دالة تهيئة افتراضية لبيانات المستثمر
 * إذا لم تكن موجودة
 */

// إضافة بيانات افتراضية للتطبيق إذا كان فارغاً
function initializeDefaultData() {
    console.log('تهيئة البيانات الافتراضية...');
    
    // إضافة مستثمر افتراضي إذا لم يكن هناك مستثمرين
    if (investors.length === 0) {
        const defaultInvestor = {
            id: Date.now().toString(),
            name: 'محمد عبد الله',
            phone: '0501234567',
            address: 'الرياض، حي النخيل',
            cardNumber: 'ID12345678',
            joinDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            status: 'نشط',
            amount: 50000,
            investments: [
                {
                    amount: 50000,
                    date: new Date().toISOString().split('T')[0],
                    interest: calculateInterest(50000, new Date().toISOString().split('T')[0])
                }
            ],
            profits: [],
            withdrawals: []
        };
        
        investors.push(defaultInvestor);
        
        // إضافة عملية إيداع افتراضية
        const defaultTransaction = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            type: 'إيداع',
            investorId: defaultInvestor.id,
            investorName: defaultInvestor.name,
            amount: defaultInvestor.amount,
            balanceAfter: defaultInvestor.amount
        };
        
        transactions.push(defaultTransaction);
        
        saveData();
        console.log('تم إضافة بيانات افتراضية للنظام');
    }
}

// إضافة استدعاء لدالة البيانات الافتراضية في بداية التطبيق
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة التطبيق...');
    loadData();
   
    initNavigation();
    initEventListeners();
    setCurrentDateAsDefault();
    updateDashboard();
    populateInvestorSelects();
 
    initCharts();

    // تفعيل الزر العائم
    initFloatingActionButton();
    
    // تفعيل البحث
    initSearchFunctionality();
});

// عرض جدول العمليات
function renderTransactionsTable() {
    console.log('عرض جدول العمليات...');
    
    const tableBody = document.querySelector('#transactions-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // ترتيب العمليات حسب التاريخ (الأحدث أولاً)
    const sortedTransactions = [...transactions].sort((a, b) => {
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    });
    
    sortedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // تحديد نوع العملية وأيقونتها
        let typeClass = '';
        let typeIcon = '';
        
        switch(transaction.type) {
            case 'إيداع':
                typeClass = 'success';
                typeIcon = '<i class="fas fa-arrow-up"></i>';
                break;
            case 'سحب':
                typeClass = 'danger';
                typeIcon = '<i class="fas fa-arrow-down"></i>';
                break;
            case 'دفع أرباح':
                typeClass = 'info';
                typeIcon = '<i class="fas fa-hand-holding-usd"></i>';
                break;
            default:
                typeClass = 'primary';
                typeIcon = '<i class="fas fa-exchange-alt"></i>';
        }
        
        row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${transaction.investorName}</td>
            <td>
                <span class="badge badge-${typeClass}">${typeIcon} ${transaction.type}</span>
            </td>
            <td>${transaction.date}</td>
            <td>${transaction.amount.toLocaleString()} ${settings.currency}</td>
            <td>${transaction.balanceAfter ? transaction.balanceAfter.toLocaleString() + ' ' + settings.currency : '-'}</td>
            <td>
                <button class="btn btn-outline btn-sm transaction-details" data-id="${transaction.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر التفاصيل
        const detailsButton = row.querySelector('.transaction-details');
        if (detailsButton) {
            detailsButton.addEventListener('click', () => {
                showTransactionDetails(transaction.id);
            });
        }
    });
    
    if (sortedTransactions.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center">لا يوجد عمليات</td>';
        tableBody.appendChild(emptyRow);
    }
}

// عرض تفاصيل العملية
function showTransactionDetails(transactionId) {
    console.log(`عرض تفاصيل العملية: ${transactionId}`);
    
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) {
        showNotification('لم يتم العثور على العملية', 'error');
        return;
    }
    
    const investor = investors.find(i => i.id === transaction.investorId);
    const investorName = investor ? investor.name : transaction.investorName || 'غير معروف';
    
    let typeClass = '';
    switch(transaction.type) {
        case 'إيداع':
            typeClass = 'success';
            break;
        case 'سحب':
            typeClass = 'danger';
            break;
        case 'دفع أرباح':
            typeClass = 'info';
            break;
        default:
            typeClass = 'primary';
    }
    
    // إنشاء محتوى النافذة المنبثقة
    const content = `
        <div class="transaction-details">
            <div class="transaction-header">
                <span class="badge badge-${typeClass}">${transaction.type}</span>
                <span class="transaction-date">${transaction.date}</span>
            </div>
            <div class="transaction-body">
                <div class="detail-item">
                    <div class="detail-label">رقم العملية</div>
                    <div class="detail-value">${transaction.id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">المستثمر</div>
                    <div class="detail-value">${investorName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">نوع العملية</div>
                    <div class="detail-value">${transaction.type}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">تاريخ العملية</div>
                    <div class="detail-value">${transaction.date}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">المبلغ</div>
                    <div class="detail-value">${transaction.amount.toLocaleString()} ${settings.currency}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">الرصيد بعد العملية</div>
                    <div class="detail-value">${transaction.balanceAfter ? transaction.balanceAfter.toLocaleString() + ' ' + settings.currency : '-'}</div>
                </div>
                ${transaction.notes ? `
                <div class="detail-item">
                    <div class="detail-label">ملاحظات</div>
                    <div class="detail-value">${transaction.notes}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // عرض النافذة المنبثقة
    showModal('تفاصيل العملية', content);
}

// عرض جدول الأرباح
function renderProfitsTable() {
    console.log('عرض جدول الأرباح...');
    
    const tableBody = document.querySelector('#profits-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // حساب الأرباح المستحقة
    const dueProfits = [];
    
    investors.forEach(investor => {
        if (investor.status !== 'نشط' || !investor.investments || investor.investments.length === 0) return;
        
        const totalInvestment = investor.amount || 0;
        if (totalInvestment <= 0) return;
        
        // اختيار أقدم تاريخ استثمار
        const oldestInvestment = investor.investments.reduce((oldest, current) => {
            const oldestDate = oldest ? new Date(oldest.date) : new Date();
            const currentDate = new Date(current.date);
            return currentDate < oldestDate ? current : oldest;
        }, null);
        
        if (!oldestInvestment) return;
        
        const investmentDate = oldestInvestment.date;
        const today = new Date();
        const investmentStartDate = new Date(investmentDate);
        
        // حساب عدد أيام الاستثمار
        const days = Math.floor((today - investmentStartDate) / (1000 * 60 * 60 * 24));
        
        // حساب الربح المستحق
        const profit = investor.investments.reduce((total, inv) => {
            return total + calculateInterest(inv.amount, inv.date);
        }, 0);
        
        // تقدير تاريخ الاستحقاق (بعد 30 يوم من تاريخ الاستثمار)
        const dueDate = new Date(investmentStartDate);
        dueDate.setDate(dueDate.getDate() + settings.profitCycle);
        
        dueProfits.push({
            investor: investor,
            investmentAmount: totalInvestment,
            investmentDate: investmentDate,
            days: days,
            profit: profit,
            dueDate: dueDate
        });
    });
    
    // ترتيب الأرباح حسب تاريخ الاستحقاق (الأقرب أولاً)
    dueProfits.sort((a, b) => a.dueDate - b.dueDate);
    
    // عرض الأرباح في الجدول
    dueProfits.forEach(item => {
        const row = document.createElement('tr');
        
        // تحديد حالة استحقاق الربح
        const today = new Date();
        const isDue = item.dueDate <= today;
        const daysToMaturity = Math.floor((item.dueDate - today) / (1000 * 60 * 60 * 24));
        
        let dueBadge = '';
        if (isDue) {
            dueBadge = '<span class="badge badge-danger">مستحق الآن</span>';
        } else if (daysToMaturity <= settings.reminderDays) {
            dueBadge = `<span class="badge badge-warning">بعد ${daysToMaturity} يوم</span>`;
        }
        
        row.innerHTML = `
            <td>
                <div class="investor-info">
                    <div class="investor-avatar">${item.investor.name.charAt(0)}</div>
                    <div>
                        <div class="investor-name">${item.investor.name}</div>
                        <div class="investor-id">${item.investor.phone}</div>
                    </div>
                </div>
            </td>
            <td>${item.investmentAmount.toLocaleString()} ${settings.currency}</td>
            <td>${item.investmentDate}</td>
            <td>${item.days} يوم</td>
            <td>${item.profit.toLocaleString()} ${settings.currency}</td>
            <td>${item.dueDate.toISOString().split('T')[0]} ${dueBadge}</td>
            <td>
                <button class="btn btn-success btn-sm pay-profit-btn" data-id="${item.investor.id}">
                    <i class="fas fa-coins"></i>
                    <span>دفع الأرباح</span>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر دفع الأرباح
        const payProfitBtn = row.querySelector('.pay-profit-btn');
        if (payProfitBtn) {
            payProfitBtn.addEventListener('click', function() {
                const investorId = this.getAttribute('data-id');
                const profitInvestorSelect = document.getElementById('profit-investor');
                if (profitInvestorSelect) {
                    profitInvestorSelect.value = investorId;
                    calculateProfitForInvestor();
                    openModal('pay-profit-modal');
                }
            });
        }
    });
    
    if (dueProfits.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center">لا يوجد أرباح مستحقة</td>';
        tableBody.appendChild(emptyRow);
    }
}

// عرض آخر العمليات في لوحة التحكم
function renderRecentTransactions() {
    console.log('عرض آخر العمليات...');
    
    const tableBody = document.querySelector('#recent-transactions tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    // عرض أحدث 5 عمليات فقط
    const recent = [...transactions].sort((a, b) => {
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    }).slice(0, 5);

    recent.forEach(tr => {
        // تحديد نوع العملية وأيقونتها
        let statusClass = 'active';
        
        switch(tr.type) {
            case 'إيداع':
                statusClass = 'success';
                break;
            case 'سحب':
                statusClass = 'warning';
                break;
            case 'دفع أرباح':
                statusClass = 'info';
                break;
        }

        const daysAgo = Math.floor((new Date() - new Date(tr.date)) / (1000 * 60 * 60 * 24));
        const daysText = daysAgo === 0 ? 'اليوم' : `${daysAgo} يومًا مضت`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tr.id}</td>
            <td>${tr.investorName}</td>
            <td>${tr.type}</td>
            <td>${tr.date}<br><small>${daysText}</small></td>
            <td>${tr.amount.toLocaleString()} ${settings.currency}</td>
            <td><span class="status status-${statusClass}">مكتمل</span></td>
            <td>
                <button class="btn btn-outline btn-sm transaction-details" data-id="${tr.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر التفاصيل
        const detailsButton = row.querySelector('.transaction-details');
        if (detailsButton) {
            detailsButton.addEventListener('click', () => {
                showTransactionDetails(tr.id);
            });
        }
    });
    
    if (recent.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center">لا يوجد عمليات حديثة</td>';
        tableBody.appendChild(emptyRow);
    }
}

// تهيئة وتحديث الرسوم البيانية
function initCharts() {
    console.log('تهيئة الرسوم البيانية...');
    
    // رسم بياني للاستثمارات
    const investmentChart = document.getElementById('investment-chart');
    if (investmentChart && window.Chart) {
        new Chart(investmentChart.getContext('2d'), {
            type: 'line',
            data: {
                labels: getLast6Months(),
                datasets: [{
                    label: 'إجمالي الاستثمارات',
                    data: getMonthlyInvestmentData(),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // رسم بياني للمستثمرين
    const investorsChart = document.getElementById('investors-chart');
    if (investorsChart && window.Chart) {
        new Chart(investorsChart.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['نشط', 'قيد المراجعة', 'غير نشط'],
                datasets: [{
                    data: [investors.length, 0, 0],
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// الحصول على أسماء الأشهر الستة الأخيرة
function getLast6Months() {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('ar-EG', { month: 'short' });
        months.push(monthName);
    }
    
    return months;
}

// الحصول على بيانات الاستثمارات الشهرية
function getMonthlyInvestmentData() {
    const data = [0, 0, 0, 0, 0, 0]; // 6 أشهر
    const now = new Date();
    
    transactions.forEach(transaction => {
        if (transaction.type !== 'إيداع') return;
        
        const transDate = new Date(transaction.date || transaction.createdAt);
        const monthsAgo = (now.getFullYear() - transDate.getFullYear()) * 12 + now.getMonth() - transDate.getMonth();
        
        if (monthsAgo >= 0 && monthsAgo < 6) {
            data[5 - monthsAgo] += transaction.amount;
        }
    });
    
    return data;
}

// تحديث الرسوم البيانية
function updateCharts() {
    // في الإصدار الحالي، يتم إعادة تهيئة الرسوم بالكامل لتبسيط التحديث
    initCharts();
}

// إعداد التعرف على الصوت (يمكن تنفيذ هذا لاحقًا)
function setupSpeechRecognition() {
    console.log('تهيئة التعرف على الصوت...');
    // سيتم تنفيذ هذه الميزة لاحقًا
}

// عرض إشعار للمستخدم
function showNotification(message, type = 'success') {
    console.log(`إشعار (${type}): ${message}`);
    
    const notification = document.getElementById('success-notification');
    if (!notification) return;
    
    const notificationIcon = notification.querySelector('.notification-icon');
    const notificationTitle = notification.querySelector('.notification-title');
    const notificationMessage = notification.querySelector('.notification-message');
    
    if (!notificationIcon || !notificationTitle || !notificationMessage) return;
    
    // تعيين نوع الإشعار
    notificationIcon.className = 'notification-icon';
    notificationIcon.classList.add(type);
    
    // تعيين العنوان حسب النوع
    let title = 'إشعار';
    switch(type) {
        case 'success':
            title = 'تمت العملية بنجاح';
            notificationIcon.innerHTML = '<i class="fas fa-check"></i>';
            break;
        case 'error':
            title = 'خطأ';
            notificationIcon.innerHTML = '<i class="fas fa-times"></i>';
            break;
        case 'warning':
            title = 'تنبيه';
            notificationIcon.innerHTML = '<i class="fas fa-exclamation"></i>';
            break;
        case 'info':
            title = 'معلومات';
            notificationIcon.innerHTML = '<i class="fas fa-info"></i>';
            break;
    }
    
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    // عرض الإشعار
    notification.classList.add('show');
    
    // إخفاء الإشعار بعد فترة
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// عرض نافذة منبثقة مخصصة
function showModal(title, content) {
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
}

// عرض تفاصيل المستثمر
function showInvestorDetails(investorId) {
    console.log(`عرض تفاصيل المستثمر: ${investorId}`);
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return;
    }
    
    // حساب القيم المطلوبة
    const totalInvestment = investor.amount || 0;
    const monthlyProfit = investor.investments.reduce((total, inv) => {
        return total + calculateInterest(inv.amount, inv.date);
    }, 0);
    
    // حساب مدة الاستثمار
    const startDate = new Date(investor.joinDate || investor.createdAt);
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    // الحصول على عمليات المستثمر
    const investorTransactions = transactions.filter(tr => tr.investorId === investorId);
    
    // إنشاء محتوى النافذة المنبثقة
    const content = `
        <div class="investor-profile">
            <div class="investor-avatar large">${investor.name.charAt(0)}</div>
            <h2 class="investor-fullname">${investor.name}</h2>
            <span class="badge badge-success">${investor.status || 'نشط'}</span>
        </div>
        
        <div class="investor-stats">
            <div class="stat-item">
                <div class="stat-value">${totalInvestment.toLocaleString()} ${settings.currency}</div>
                <div class="stat-label">إجمالي الاستثمار</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${monthlyProfit.toLocaleString()} ${settings.currency}</div>
                <div class="stat-label">الربح الشهري</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${daysPassed} يوم</div>
                <div class="stat-label">مدة الاستثمار</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">معلومات الاتصال</h3>
            <div class="detail-item">
                <div class="detail-label">رقم الهاتف</div>
                <div class="detail-value">${investor.phone}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">العنوان</div>
                <div class="detail-value">${investor.address || 'غير محدد'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">رقم البطاقة</div>
                <div class="detail-value">${investor.cardNumber || 'غير محدد'}</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">آخر العمليات</h3>
            <div class="mini-table-container">
                <table class="mini-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>النوع</th>
                            <th>المبلغ</th>
                            <th>الإجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${investorTransactions.length > 0 ? 
                            investorTransactions.slice(0, 5).map(tr => `
                                <tr>
                                    <td>${tr.date}</td>
                                    <td>${tr.type}</td>
                                    <td>${tr.amount.toLocaleString()} ${settings.currency}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline edit-transaction" data-id="${tr.id}">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('') : 
                            '<tr><td colspan="4">لا توجد عمليات</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>

        <div class="investor-actions-big">
            <button class="btn btn-primary" onclick="editInvestor('${investorId}')">
                <i class="fas fa-edit"></i> تعديل البيانات
            </button>
            <button class="btn btn-success" onclick="openProfitModal('${investorId}')">
                <i class="fas fa-coins"></i> دفع الأرباح
            </button>
            <button class="btn btn-danger" onclick="deleteInvestor('${investorId}')">
                <i class="fas fa-trash"></i> حذف المستثمر
            </button>
        </div>
    `;
    
    // عرض النافذة المنبثقة
    showModal(`تفاصيل المستثمر - ${investor.name}`, content);

    // إضافة مستمعي الأحداث لأزرار تعديل العمليات
    document.querySelectorAll('.edit-transaction').forEach(btn => {
        btn.addEventListener('click', function () {
            const txnId = this.getAttribute('data-id');
            openEditTransactionModal(txnId);
        });
    });
}

// تعديل بيانات المستثمر
function editInvestor(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return;
    }

    // فتح النافذة
    openModal('add-investor-modal');

    // تعبئة النموذج
    document.getElementById('investor-name').value = investor.name;
    document.getElementById('investor-phone').value = investor.phone;
    document.getElementById('investor-address').value = investor.address || '';
    document.getElementById('investor-card').value = investor.cardNumber || '';
    document.getElementById('investor-deposit-date').value = investor.joinDate || '';
    document.getElementById('investor-amount').value = investor.amount || 0;

    // تغيير وظيفة زر الحفظ
    const saveButton = document.getElementById('save-investor-btn');
    if (saveButton) {
        // حفظ الوظيفة الأصلية
        const originalClickHandler = saveButton.onclick;

        // تعيين وظيفة جديدة
        saveButton.textContent = 'حفظ التعديلات';
        saveButton.onclick = function () {
            // تجميع البيانات المعدلة
            const updatedInvestor = {
                name: document.getElementById('investor-name').value,
                phone: document.getElementById('investor-phone').value,
                address: document.getElementById('investor-address').value,
                cardNumber: document.getElementById('investor-card').value,
                amount: parseFloat(document.getElementById('investor-amount').value)
            };

            // تحديث بيانات المستثمر
            updateInvestor(investorId, updatedInvestor);

            // إعادة تعيين الوظيفة الأصلية
            saveButton.textContent = 'إضافة';
            saveButton.onclick = originalClickHandler;

            // إغلاق النافذة
            closeModal('add-investor-modal');
        };
    }
}

function openEditTransactionModal(txnId) {
    const txn = transactions.find(t => t.id === txnId);
    if (!txn) return;

    document.getElementById('edit-transaction-id').value = txn.id;
    document.getElementById('edit-transaction-date').value = txn.date;
    document.getElementById('edit-transaction-amount').value = txn.amount;
    document.getElementById('edit-transaction-notes').value = txn.notes || '';

    openModal('edit-transaction-modal');
}


// تحديث بيانات المستثمر
function updateInvestor(investorId, updatedData) {
    console.log(`تحديث بيانات المستثمر: ${investorId}`);
    
    const investorIndex = investors.findIndex(inv => inv.id === investorId);
    if (investorIndex === -1) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return false;
    }
    
    // الاحتفاظ ببعض البيانات الأصلية
    const originalInvestor = investors[investorIndex];
    updatedData.id = originalInvestor.id;
    updatedData.createdAt = originalInvestor.createdAt;
    updatedData.investments = originalInvestor.investments;
    updatedData.profits = originalInvestor.profits;
    updatedData.withdrawals = originalInvestor.withdrawals;
    updatedData.status = originalInvestor.status;
    
    // تحديث البيانات
    investors[investorIndex] = {
        ...originalInvestor,
        ...updatedData
    };
    
    // حفظ البيانات
    saveData();
    
    // إطلاق حدث تحديث المستثمرين
    document.dispatchEvent(new CustomEvent('investor:update'));
    
    // عرض إشعار النجاح
    showNotification(`تم تحديث بيانات المستثمر ${updatedData.name} بنجاح`, 'success');
    
    return true;
}

// حذف مستثمر
function deleteInvestor(investorId) {
    console.log(`حذف المستثمر: ${investorId}`);
    
    // البحث عن المستثمر
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return false;
    }
    
    // طلب تأكيد الحذف
    if (!confirm(`هل أنت متأكد من رغبتك في حذف المستثمر ${investor.name}؟\nسيتم حذف جميع البيانات المتعلقة به.`)) {
        return false;
    }
    
    // حذف المستثمر
    investors = investors.filter(inv => inv.id !== investorId);
    
    // حذف العمليات المرتبطة بالمستثمر
    transactions = transactions.filter(tr => tr.investorId !== investorId);
    
    // حفظ البيانات
    saveData();
    
    // إطلاق حدث تحديث المستثمرين
    document.dispatchEvent(new CustomEvent('investor:update'));
    
    // إطلاق حدث تحديث العمليات
    document.dispatchEvent(new CustomEvent('transaction:update'));
    
    // عرض إشعار النجاح
    showNotification(`تم حذف المستثمر ${investor.name} بنجاح`, 'success');
    
    return true;
}

// فتح نافذة دفع الأرباح للمستثمر
function openProfitModal(investorId) {
    console.log(`فتح نافذة دفع الأرباح للمستثمر: ${investorId}`);
    
    // البحث عن المستثمر
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return;
    }
    
    // تحديد المستثمر في نموذج دفع الأرباح
    const profitInvestorSelect = document.getElementById('profit-investor');
    if (profitInvestorSelect) {
        profitInvestorSelect.value = investorId;
        
        // حساب الأرباح للمستثمر
        calculateProfitForInvestor();
        
        // فتح النافذة
        openModal('pay-profit-modal');
    } else {
        showNotification('لم يتم العثور على نموذج دفع الأرباح', 'error');
    }
}

// تصفية العمليات حسب النوع
function filterTransactions(filterType) {
    console.log(`تصفية العمليات حسب النوع: ${filterType}`);
    
    let filteredTransactions = [...transactions];
    
    switch (filterType) {
        case 'الكل':
            // لا نقوم بأي تصفية
            break;
        case 'إيداع':
            filteredTransactions = filteredTransactions.filter(tr => tr.type === 'إيداع');
            break;
        case 'سحب':
            filteredTransactions = filteredTransactions.filter(tr => tr.type === 'سحب');
            break;
        case 'أرباح':
        case 'دفع أرباح':
            filteredTransactions = filteredTransactions.filter(tr => tr.type === 'دفع أرباح');
            break;
    }
    
    // تحديث جدول العمليات
    const tableBody = document.querySelector('#transactions-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // ترتيب العمليات حسب التاريخ (الأحدث أولاً)
    filteredTransactions.sort((a, b) => {
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    });
    
    filteredTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // تحديد نوع العملية وأيقونتها
        let typeClass = '';
        let typeIcon = '';
        
        switch(transaction.type) {
            case 'إيداع':
                typeClass = 'success';
                typeIcon = '<i class="fas fa-arrow-up"></i>';
                break;
            case 'سحب':
                typeClass = 'danger';
                typeIcon = '<i class="fas fa-arrow-down"></i>';
                break;
            case 'دفع أرباح':
                typeClass = 'info';
                typeIcon = '<i class="fas fa-hand-holding-usd"></i>';
                break;
            default:
                typeClass = 'primary';
                typeIcon = '<i class="fas fa-exchange-alt"></i>';
        }
        
        row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${transaction.investorName}</td>
            <td>
                <span class="badge badge-${typeClass}">${typeIcon} ${transaction.type}</span>
            </td>
            <td>${transaction.date}</td>
            <td>${transaction.amount.toLocaleString()} ${settings.currency}</td>
            <td>${transaction.balanceAfter ? transaction.balanceAfter.toLocaleString() + ' ' + settings.currency : '-'}</td>
            <td>
                <button class="btn btn-outline btn-sm transaction-details" data-id="${transaction.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر التفاصيل
        const detailsButton = row.querySelector('.transaction-details');
        if (detailsButton) {
            detailsButton.addEventListener('click', () => {
                showTransactionDetails(transaction.id);
            });
        }
    });
    
    if (filteredTransactions.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center">لا يوجد عمليات</td>';
        tableBody.appendChild(emptyRow);
    }
}

// تهيئة وظيفة البحث
function initSearchFunctionality() {
    console.log('تهيئة وظيفة البحث...');
    
    // البحث في صفحة المستثمرين
    const investorsSearchInput = document.querySelector('#investors-page .search-input');
    if (investorsSearchInput) {
        investorsSearchInput.addEventListener('input', function() {
            searchInvestors(this.value);
        });
    }
    
    // البحث في صفحة العمليات
    const transactionsSearchInput = document.querySelector('#transactions-page .search-input');
    if (transactionsSearchInput) {
        transactionsSearchInput.addEventListener('input', function() {
            searchTransactions(this.value);
        });
    }
    
    // البحث في صفحة الأرباح
    const profitsSearchInput = document.querySelector('#profits-page .search-input');
    if (profitsSearchInput) {
        profitsSearchInput.addEventListener('input', function() {
            searchProfits(this.value);
        });
    }
}

// البحث في المستثمرين
function searchInvestors(query) {
    console.log(`البحث في المستثمرين: ${query}`);
    
    query = query.trim().toLowerCase();
    
    if (!query) {
        // إذا كان البحث فارغًا، نعيد عرض جميع المستثمرين
        renderInvestorsTable();
        return;
    }
    
    // تصفية المستثمرين حسب البحث
    const filtered = investors.filter(investor => {
        return investor.name.toLowerCase().includes(query) ||
               investor.phone.toLowerCase().includes(query) ||
               (investor.address && investor.address.toLowerCase().includes(query)) ||
               (investor.cardNumber && investor.cardNumber.toLowerCase().includes(query)) ||
               investor.id.toLowerCase().includes(query);
    });
    
    // عرض المستثمرين المصفّين
    const tableBody = document.querySelector('#investors-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filtered.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="8" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // عرض المستثمرين المصفّين
    filtered.forEach(investor => {
        const row = document.createElement('tr');
        
        // حساب الربح الشهري
        const monthlyProfit = investor.investments.reduce((total, inv) => {
            return total + calculateInterest(inv.amount, inv.date);
        }, 0);
        
        // تنسيق تاريخ الانضمام
        const joinDate = investor.joinDate || investor.createdAt || '';
        
        row.innerHTML = `
            <td>${investor.id}</td>
            <td>
                <div class="investor-info">
                    <div class="investor-avatar">${investor.name.charAt(0)}</div>
                    <div>
                        <div class="investor-name">${investor.name}</div>
                        <div class="investor-phone">${investor.phone}</div>
                    </div>
                </div>
            </td>
            <td>${investor.phone}</td>
            <td>${(investor.amount || 0).toLocaleString()} ${settings.currency}</td>
            <td>${monthlyProfit.toLocaleString()} ${settings.currency}</td>
            <td>${joinDate}</td>
            <td><span class="badge badge-success">نشط</span></td>
            <td>
                <div class="investor-actions">
                    <button class="investor-action-btn view-investor" data-id="${investor.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="investor-action-btn edit edit-investor" data-id="${investor.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="investor-action-btn delete delete-investor" data-id="${investor.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-investor');
        const editButton = row.querySelector('.edit-investor');
        const deleteButton = row.querySelector('.delete-investor');
        
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                showInvestorDetails(investor.id);
            });
        }
        
        if (editButton) {
            editButton.addEventListener('click', () => {
                editInvestor(investor.id);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                deleteInvestor(investor.id);
            });
        }
    });
}

// البحث في العمليات
function searchTransactions(query) {
    console.log(`البحث في العمليات: ${query}`);
    
    query = query.trim().toLowerCase();
    
    if (!query) {
        // إذا كان البحث فارغًا، نعيد عرض جميع العمليات
        renderTransactionsTable();
        return;
    }
    
    // تصفية العمليات حسب البحث
    const filtered = transactions.filter(transaction => {
        return transaction.id.toLowerCase().includes(query) ||
               transaction.investorName.toLowerCase().includes(query) ||
               transaction.type.toLowerCase().includes(query) ||
               transaction.date.toLowerCase().includes(query) ||
               transaction.amount.toString().includes(query);
    });
    
    // عرض العمليات المصفّاة في الجدول
    const tableBody = document.querySelector('#transactions-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filtered.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // عرض العمليات المصفّاة
    filtered.forEach(transaction => {
        const row = document.createElement('tr');
        
        // تحديد نوع العملية وأيقونتها
        let typeClass = '';
        let typeIcon = '';
        
        switch(transaction.type) {
            case 'إيداع':
                typeClass = 'success';
                typeIcon = '<i class="fas fa-arrow-up"></i>';
                break;
            case 'سحب':
                typeClass = 'danger';
                typeIcon = '<i class="fas fa-arrow-down"></i>';
                break;
            case 'دفع أرباح':
                typeClass = 'info';
                typeIcon = '<i class="fas fa-hand-holding-usd"></i>';
                break;
            default:
                typeClass = 'primary';
                typeIcon = '<i class="fas fa-exchange-alt"></i>';
        }
        
        row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${transaction.investorName}</td>
            <td>
                <span class="badge badge-${typeClass}">${typeIcon} ${transaction.type}</span>
            </td>
            <td>${transaction.date}</td>
            <td>${transaction.amount.toLocaleString()} ${settings.currency}</td>
            <td>${transaction.balanceAfter ? transaction.balanceAfter.toLocaleString() + ' ' + settings.currency : '-'}</td>
            <td>
                <button class="btn btn-outline btn-sm transaction-details" data-id="${transaction.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر التفاصيل
        const detailsButton = row.querySelector('.transaction-details');
        if (detailsButton) {
            detailsButton.addEventListener('click', () => {
                showTransactionDetails(transaction.id);
            });
        }
    });
}

// البحث في الأرباح
function searchProfits(query) {
    console.log(`البحث في الأرباح: ${query}`);
    
    query = query.trim().toLowerCase();
    
    if (!query) {
        // إذا كان البحث فارغًا، نعيد عرض جميع الأرباح
        renderProfitsTable();
        return;
    }
    
    // تصفية المستثمرين حسب البحث
    const filteredInvestors = investors.filter(investor => {
        return investor.name.toLowerCase().includes(query) ||
               investor.phone.toLowerCase().includes(query) ||
               investor.id.toLowerCase().includes(query);
    });
    
    // إعادة تقديم جدول الأرباح فقط للمستثمرين المصفّين
    const dueProfits = [];
    
    filteredInvestors.forEach(investor => {
        if (investor.status !== 'نشط' || !investor.investments || investor.investments.length === 0) return;
        
        const totalInvestment = investor.amount || 0;
        if (totalInvestment <= 0) return;
        
        // اختيار أقدم تاريخ استثمار
        const oldestInvestment = investor.investments.reduce((oldest, current) => {
            const oldestDate = oldest ? new Date(oldest.date) : new Date();
            const currentDate = new Date(current.date);
            return currentDate < oldestDate ? current : oldest;
        }, null);
        
        if (!oldestInvestment) return;
        
        const investmentDate = oldestInvestment.date;
        const today = new Date();
        const investmentStartDate = new Date(investmentDate);
        
        // حساب عدد أيام الاستثمار
        const days = Math.floor((today - investmentStartDate) / (1000 * 60 * 60 * 24));
        
        // حساب الربح المستحق
        const profit = investor.investments.reduce((total, inv) => {
            return total + calculateInterest(inv.amount, inv.date);
        }, 0);
        
        // تقدير تاريخ الاستحقاق (بعد 30 يوم من تاريخ الاستثمار)
        const dueDate = new Date(investmentStartDate);
        dueDate.setDate(dueDate.getDate() + settings.profitCycle);
        
        dueProfits.push({
            investor: investor,
            investmentAmount: totalInvestment,
            investmentDate: investmentDate,
            days: days,
            profit: profit,
            dueDate: dueDate
        });
    });
    
    // عرض الأرباح المصفّاة في الجدول
    const tableBody = document.querySelector('#profits-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (dueProfits.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // ترتيب الأرباح حسب تاريخ الاستحقاق (الأقرب أولاً)
    dueProfits.sort((a, b) => a.dueDate - b.dueDate);
    
    // عرض الأرباح في الجدول
    dueProfits.forEach(item => {
        const row = document.createElement('tr');
        
        // تحديد حالة استحقاق الربح
        const today = new Date();
        const isDue = item.dueDate <= today;
        const daysToMaturity = Math.floor((item.dueDate - today) / (1000 * 60 * 60 * 24));
        
        let dueBadge = '';
        if (isDue) {
            dueBadge = '<span class="badge badge-danger">مستحق الآن</span>';
        } else if (daysToMaturity <= settings.reminderDays) {
            dueBadge = `<span class="badge badge-warning">بعد ${daysToMaturity} يوم</span>`;
        }
        
        row.innerHTML = `
            <td>
                <div class="investor-info">
                    <div class="investor-avatar">${item.investor.name.charAt(0)}</div>
                    <div>
                        <div class="investor-name">${item.investor.name}</div>
                        <div class="investor-id">${item.investor.phone}</div>
                    </div>
                </div>
            </td>
            <td>${item.investmentAmount.toLocaleString()} ${settings.currency}</td>
            <td>${item.investmentDate}</td>
            <td>${item.days} يوم</td>
            <td>${item.profit.toLocaleString()} ${settings.currency}</td>
            <td>${item.dueDate.toISOString().split('T')[0]} ${dueBadge}</td>
            <td>
                <button class="btn btn-success btn-sm pay-profit-btn" data-id="${item.investor.id}">
                    <i class="fas fa-coins"></i>
                    <span>دفع الأرباح</span>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر دفع الأرباح
        const payProfitBtn = row.querySelector('.pay-profit-btn');
        if (payProfitBtn) {
            payProfitBtn.addEventListener('click', function() {
                const investorId = this.getAttribute('data-id');
                const profitInvestorSelect = document.getElementById('profit-investor');
                if (profitInvestorSelect) {
                    profitInvestorSelect.value = investorId;
                    calculateProfitForInvestor();
                    openModal('pay-profit-modal');
                }
            });
        }
    });
}


// استبدال كامل تعريف الدالة وإعادة تعيين مستمع الحدث 
// هذا الحل يجب أن يوضع في نهاية ملف app-fixed.js

// إزالة جميع مستمعي الأحداث الموجودة على الزر العائم
document.addEventListener('DOMContentLoaded', function() {
    const fab = document.getElementById('add-new-fab');
    if (fab) {
        // إزالة مستمعي الأحداث السابقة عبر نسخ العنصر واستبداله
        const newFab = fab.cloneNode(true);
        fab.parentNode.replaceChild(newFab, fab);
        
        // تعيين مستمع الحدث الجديد
        newFab.addEventListener('click', showFloatingMenu);
        
        console.log('تم تهيئة زر الإضافة العائم بنجاح');
    } else {
        console.error('لم يتم العثور على زر الإضافة العائم');
    }
});

// دالة منفصلة لإظهار القائمة المنسدلة
function showFloatingMenu(e) {
    e.stopPropagation(); // منع انتشار الحدث
    
    // التحقق مما إذا كانت القائمة مفتوحة بالفعل
    const existingMenu = document.querySelector('.fab-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    // إنشاء القائمة المنسدلة
    const menu = document.createElement('div');
    menu.className = 'fab-menu';
    menu.innerHTML = `
        <div class="fab-menu-item" data-action="add-investor">
            <i class="fas fa-user-plus"></i>
            <span>إضافة مستثمر</span>
        </div>
        <div class="fab-menu-item" data-action="add-deposit">
            <i class="fas fa-arrow-up"></i>
            <span>إيداع جديد</span>
        </div>
        <div class="fab-menu-item" data-action="add-withdraw">
            <i class="fas fa-arrow-down"></i>
            <span>سحب جديد</span>
        </div>
        <div class="fab-menu-item" data-action="pay-profit">
            <i class="fas fa-hand-holding-usd"></i>
            <span>دفع أرباح</span>
        </div>
    `;

    // تحديد موقع القائمة بناءً على موقع الزر
    const fabRect = this.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.bottom = (window.innerHeight - fabRect.top + 10) + 'px';
    menu.style.left = (fabRect.left + 10) + 'px';
    menu.style.zIndex = '1000';

    // أنماط القائمة
    menu.style.background = 'white';
    menu.style.borderRadius = '16px';
    menu.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    menu.style.padding = '12px';
    menu.style.minWidth = '220px';
    menu.style.fontFamily = 'Tajawal, sans-serif';
    menu.style.animation = 'fadeInUp 0.3s ease';

    // أنماط عناصر القائمة
    const menuItems = menu.querySelectorAll('.fab-menu-item');
    menuItems.forEach(item => {
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.padding = '12px 16px';
        item.style.margin = '6px 0';
        item.style.cursor = 'pointer';
        item.style.borderRadius = '12px';
        item.style.transition = 'all 0.2s ease-in-out';
        item.style.color = '#333';
        item.style.fontSize = '15px';
        item.style.fontWeight = '500';

        // تفاعل hover
        item.addEventListener('mouseenter', function () {
            this.style.background = '#f0f4ff';
            this.style.transform = 'translateX(-4px)';
        });
        
        item.addEventListener('mouseleave', function () {
            this.style.background = 'transparent';
            this.style.transform = 'translateX(0)';
        });

        // عند النقر على أحد خيارات القائمة
        item.addEventListener('click', function (e) {
            e.stopPropagation(); // منع انتشار الحدث
            
            // الحصول على نوع الإجراء من سمة data-action
            const action = this.getAttribute('data-action');
            
            // إغلاق القائمة المنسدلة أولاً
            if (menu.parentNode) {
                document.body.removeChild(menu);
            }
            
            // فتح النافذة المنبثقة المناسبة بعد إغلاق القائمة
            setTimeout(() => {
                switch (action) {
                    case 'add-investor': openModal('add-investor-modal'); break;
                    case 'add-deposit': openModal('add-deposit-modal'); break;
                    case 'add-withdraw': openModal('add-withdraw-modal'); break;
                    case 'pay-profit': openModal('pay-profit-modal'); break;
                }
            }, 50);
        });

        // أنماط الأيقونة
        const icon = item.querySelector('i');
        if (icon) {
            icon.style.marginLeft = '12px';
            icon.style.fontSize = '1.3rem';
            icon.style.width = '24px';
            icon.style.color = '#007BFF'; // لون أزرق جميل
        }
    });

    // إضافة القائمة إلى الصفحة
    document.body.appendChild(menu);

    // إغلاق القائمة عند النقر خارجها
    const handleClickOutside = function (event) {
        // التحقق مما إذا كان النقر خارج القائمة وليس على الزر العائم
        if (!menu.contains(event.target) && event.target !== document.getElementById('add-new-fab')) {
            if (menu.parentNode) {
                menu.remove();
            }
            document.removeEventListener('click', handleClickOutside);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
    }, 10);
}

// إعادة تعريف دالة initFloatingActionButton الأصلية لتجنب التضارب
// إذا تم استدعاؤها في مكان آخر في الكود
function initFloatingActionButton() {
    console.log('تم تعطيل الدالة الأصلية واستبدالها بالنسخة المحدثة');
}


// تصدير البيانات (مستثمرين/عمليات/أرباح)
function exportData(type = 'investors') {
    console.log(`تصدير البيانات: ${type}`);
    
    let data = [];
    let filename = '';
    let headers = [];
    
    switch(type) {
        case 'investors':
            data = investors;
            filename = 'المستثمرين';
            headers = ['المعرف', 'الاسم', 'رقم الهاتف', 'العنوان', 'رقم البطاقة', 'المبلغ المستثمر', 'تاريخ الانضمام', 'الحالة'];
            break;
        case 'transactions':
            data = transactions;
            filename = 'العمليات';
            headers = ['المعرف', 'المستثمر', 'نوع العملية', 'التاريخ', 'المبلغ', 'الرصيد بعد العملية', 'ملاحظات'];
            break;
        case 'profits':
            // لا نصدر من جدول الأرباح لأنه يتم حسابه ديناميكيًا
            showNotification('تصدير الأرباح غير متاح حاليًا', 'warning');
            return;
    }
    
    if (data.length === 0) {
        showNotification('لا توجد بيانات للتصدير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عناوين الأعمدة
    csvRows.push(headers.join(','));
    
    // إضافة الصفوف
    data.forEach(item => {
        let row = [];
        switch(type) {
            case 'investors':
                row = [
                    item.id,
                    item.name,
                    item.phone,
                    item.address || '',
                    item.cardNumber || '',
                    item.amount || 0,
                    item.joinDate || item.createdAt || '',
                    item.status || 'نشط'
                ];
                break;
            case 'transactions':
                row = [
                    item.id,
                    item.investorName,
                    item.type,
                    item.date,
                    item.amount,
                    item.balanceAfter || '',
                    item.notes || ''
                ];
                break;
        }
        
        // تنظيف القيم للتصدير CSV
        row = row.map(value => {
            // إذا كانت القيمة تحتوي على فواصل، نضعها بين علامات اقتباس
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
        });
        
        csvRows.push(row.join(','));
    });
    
    // إنشاء ملف CSV
    const csvContent = csvRows.join('\n');
    
    // إنشاء Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // إنشاء رابط التنزيل
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // إضافة الرابط وتنفيذ النقر
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    document.body.removeChild(link);
    
    showNotification(`تم تصدير ${filename} بنجاح`, 'success');
}

// إضافة مستمعي الأحداث لأزرار التصدير
function setupExportButtons() {
    console.log('تهيئة أزرار التصدير...');
    
    // زر تصدير المستثمرين
    const exportInvestorsBtn = document.querySelector('#investors-page .btn[title="تصدير"]');
    if (exportInvestorsBtn) {
        exportInvestorsBtn.addEventListener('click', () => {
            exportData('investors');
        });
    }
    
    // زر تصدير العمليات
    const exportTransactionsBtn = document.querySelector('#transactions-page .btn[title="تصدير"]');
    if (exportTransactionsBtn) {
        exportTransactionsBtn.addEventListener('click', () => {
            exportData('transactions');
        });
    }
    
    // زر تصدير الأرباح
    const exportProfitsBtn = document.querySelector('#profits-page .btn[title="تصدير"]');
    if (exportProfitsBtn) {
        exportProfitsBtn.addEventListener('click', () => {
            exportData('profits');
        });
    }
}

// تهيئة دوال النسخ الاحتياطي
function setupBackupFunctions() {
    console.log('تهيئة دوال النسخ الاحتياطي...');
    
    // زر تنزيل نسخة احتياطية
    const downloadBackupBtn = document.querySelector('button[title="تنزيل نسخة احتياطية"]');
    if (downloadBackupBtn) {
        downloadBackupBtn.addEventListener('click', () => {
            createBackup();
        });
    }
    
    // زر استعادة من نسخة احتياطية
    const restoreBackupBtn = document.querySelector('button[title="استعادة من نسخة احتياطية"]');
    if (restoreBackupBtn) {
        restoreBackupBtn.addEventListener('click', () => {
            restoreBackup();
        });
    }
}

// إنشاء نسخة احتياطية
function createBackup() {
    console.log('إنشاء نسخة احتياطية...');
    
    // تجميع البيانات
    const backupData = {
        investors: investors,
        transactions: transactions,
        settings: settings,
        timestamp: new Date().toISOString()
    };
    
    // تحويل البيانات إلى نص JSON
    const jsonData = JSON.stringify(backupData);
    
    // إنشاء Blob
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // إنشاء رابط التنزيل
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `نظام_الاستثمار_نسخة_احتياطية_${new Date().toISOString().split('T')[0]}.json`;
    
    // إضافة الرابط وتنفيذ النقر
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    document.body.removeChild(link);
    
    showNotification('تم إنشاء النسخة الاحتياطية بنجاح', 'success');
}

// استعادة من نسخة احتياطية
function restoreBackup() {
    console.log('استعادة من نسخة احتياطية...');
    
    // إنشاء عنصر إدخال ملف
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    // إضافة عنصر الإدخال للصفحة
    document.body.appendChild(fileInput);
    
    // إضافة مستمع للتغيير
    fileInput.addEventListener('change', function() {
        if (this.files.length === 0) {
            document.body.removeChild(fileInput);
            return;
        }
        
        const file = this.files[0];
        const reader = new FileReader();
        
        reader.onload = function() {
            try {
                // قراءة البيانات
                const backupData = JSON.parse(reader.result);
                
                // التحقق من صحة البيانات
                if (!backupData.investors || !backupData.transactions || !backupData.settings) {
                    showNotification('ملف النسخة الاحتياطية غير صالح', 'error');
                    return;
                }
                
                // طلب تأكيد الاستعادة
                if (confirm('سيتم استبدال جميع البيانات الحالية بالبيانات من النسخة الاحتياطية. هل تريد المتابعة؟')) {
                    // استعادة البيانات
                    investors = backupData.investors;
                    transactions = backupData.transactions;
                    settings = backupData.settings;
                    
                    // حفظ البيانات
                    saveData();
                    
                    // تحديث واجهة المستخدم
                    updateDashboard();
                    renderInvestorsTable();
                    renderTransactionsTable();
                    renderProfitsTable();
                    renderRecentTransactions();
                    populateInvestorSelects();
                    
                    showNotification('تمت استعادة البيانات بنجاح', 'success');
                }
            } catch (error) {
                console.error('خطأ في استعادة النسخة الاحتياطية:', error);
                showNotification('حدث خطأ أثناء استعادة النسخة الاحتياطية', 'error');
            }
            
            // تنظيف
            document.body.removeChild(fileInput);
        };
        
        reader.onerror = function() {
            showNotification('حدث خطأ أثناء قراءة الملف', 'error');
            document.body.removeChild(fileInput);
        };
        
        reader.readAsText(file);
    });
    
    // تنفيذ النقر على عنصر الإدخال
    fileInput.click();
}

// إعداد مستمعي الأحداث الإضافية
function setupAdditionalEventListeners() {
    console.log('إعداد مستمعي الأحداث الإضافية...');
    
    // --- صفحة المستثمرين ---
    
    // أزرار التصفية في صفحة المستثمرين
    const investorsFilterButtons = document.querySelectorAll('#investors-page .btn-group .btn');
    if (investorsFilterButtons.length > 0) {
        investorsFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // تحديث الزر النشط
                investorsFilterButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // يمكن إضافة تصفية المستثمرين حسب الحالة هنا
                // لكن المستثمرين كلهم نشطون في النظام الحالي
            });
        });
    }
    
    // --- صفحة العمليات ---
    
    // أزرار التصفية في صفحة العمليات (تم تنفيذها بالفعل في filterTransactions)
    
    // --- صفحة الأرباح ---
    
    // أزرار التصفية في صفحة الأرباح
    const profitsFilterButtons = document.querySelectorAll('#profits-page .btn-group .btn');
    if (profitsFilterButtons.length > 0) {
        profitsFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // تحديث الزر النشط
                profitsFilterButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // يمكن إضافة تصفية الأرباح حسب الفترة هنا
            });
        });
    }
    
    // --- صفحة التقارير ---
    
    // أزرار التصفية في صفحة التقارير
    const reportsFilterButtons = document.querySelectorAll('#reports-page .btn-group .btn');
    if (reportsFilterButtons.length > 0) {
        reportsFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // تحديث الزر النشط
                reportsFilterButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // تحديث الرسوم البيانية
                updateCharts();
            });
        });
    }
}


// تخزين مراجع للرسوم البيانية
let investmentChart = null;
let investorsChart = null;
let investmentsGrowthChart = null;
let profitsGrowthChart = null;
let investmentsDistributionChart = null;
let investmentsPerformanceChart = null;

// تهيئة وتحديث الرسوم البيانية
function initCharts() {
    console.log('تهيئة الرسوم البيانية...');
    
    // رسم بياني للاستثمارات
    const investmentChartCanvas = document.getElementById('investment-chart');
    if (investmentChartCanvas && window.Chart) {
        // تدمير الرسم البياني الموجود إذا كان موجودًا
        if (investmentChart) {
            investmentChart.destroy();
        }
        
        // إنشاء رسم بياني جديد
        investmentChart = new Chart(investmentChartCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: getLast6Months(),
                datasets: [{
                    label: 'إجمالي الاستثمارات',
                    data: getMonthlyInvestmentData(),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // رسم بياني للمستثمرين
    const investorsChartCanvas = document.getElementById('investors-chart');
    if (investorsChartCanvas && window.Chart) {
        // تدمير الرسم البياني الموجود إذا كان موجودًا
        if (investorsChart) {
            investorsChart.destroy();
        }
        
        // إنشاء رسم بياني جديد
        investorsChart = new Chart(investorsChartCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['نشط', 'قيد المراجعة', 'غير نشط'],
                datasets: [{
                    data: [investors.length, 0, 0],
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // تهيئة رسوم صفحة التقارير إذا كانت الصفحة مفتوحة
    initReportCharts();
}

// تهيئة رسوم صفحة التقارير
function initReportCharts() {
    // رسم تطور الاستثمارات
    const investmentsGrowthChartCanvas = document.getElementById('investments-growth-chart');
    if (investmentsGrowthChartCanvas && window.Chart) {
        // تدمير الرسم البياني الموجود إذا كان موجودًا
        if (investmentsGrowthChart) {
            investmentsGrowthChart.destroy();
        }
        
        // إنشاء رسم بياني جديد
        investmentsGrowthChart = new Chart(investmentsGrowthChartCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: getLast6Months(),
                datasets: [{
                    label: 'إجمالي الاستثمارات',
                    data: getMonthlyInvestmentData(),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // رسم تطور الأرباح
    const profitsGrowthChartCanvas = document.getElementById('profits-growth-chart');
    if (profitsGrowthChartCanvas && window.Chart) {
        // تدمير الرسم البياني الموجود إذا كان موجودًا
        if (profitsGrowthChart) {
            profitsGrowthChart.destroy();
        }
        
        // إنشاء رسم بياني جديد
        profitsGrowthChart = new Chart(profitsGrowthChartCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: getLast6Months(),
                datasets: [{
                    label: 'إجمالي الأرباح',
                    data: getMonthlyProfitData(),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // رسم توزيع الاستثمارات
    const investmentsDistributionChartCanvas = document.getElementById('investments-distribution-chart');
    if (investmentsDistributionChartCanvas && window.Chart) {
        // تدمير الرسم البياني الموجود إذا كان موجودًا
        if (investmentsDistributionChart) {
            investmentsDistributionChart.destroy();
        }
        
        // تجهيز بيانات توزيع الاستثمارات
        const categories = {
            small: { count: 0, total: 0, label: 'أقل من 10,000' },
            medium: { count: 0, total: 0, label: 'من 10,000 إلى 50,000' },
            large: { count: 0, total: 0, label: 'من 50,000 إلى 100,000' },
            xlarge: { count: 0, total: 0, label: 'أكثر من 100,000' }
        };
        
        investors.forEach(inv => {
            const amount = inv.amount || 0;
            if (amount < 10000) {
                categories.small.count++;
                categories.small.total += amount;
            } else if (amount < 50000) {
                categories.medium.count++;
                categories.medium.total += amount;
            } else if (amount < 100000) {
                categories.large.count++;
                categories.large.total += amount;
            } else {
                categories.xlarge.count++;
                categories.xlarge.total += amount;
            }
        });
        
        // إنشاء رسم بياني جديد
        investmentsDistributionChart = new Chart(investmentsDistributionChartCanvas.getContext('2d'), {
            type: 'pie',
            data: {
                labels: Object.values(categories).map(c => c.label),
                datasets: [{
                    data: Object.values(categories).map(c => c.total),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // رسم أداء الاستثمارات
    const investmentsPerformanceChartCanvas = document.getElementById('investments-performance-chart');
    if (investmentsPerformanceChartCanvas && window.Chart) {
        // تدمير الرسم البياني الموجود إذا كان موجودًا
        if (investmentsPerformanceChart) {
            investmentsPerformanceChart.destroy();
        }
        
        // تجهيز بيانات أداء الاستثمارات والأرباح
        const months = getLast6Months();
        const investmentData = getMonthlyInvestmentData();
        const profitData = getMonthlyProfitData();
        
        // إنشاء رسم بياني جديد
        investmentsPerformanceChart = new Chart(investmentsPerformanceChartCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'الاستثمارات',
                        data: investmentData,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'الأرباح',
                        data: profitData,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// تحديث الرسوم البيانية
function updateCharts() {
    console.log('تحديث الرسوم البيانية...');
    
    // في الإصدار المحدث، نعيد تهيئة الرسوم بالكامل
    initCharts();
}

// الحصول على بيانات الأرباح الشهرية
function getMonthlyProfitData() {
    const data = [0, 0, 0, 0, 0, 0]; // 6 أشهر
    const now = new Date();
    
    transactions.forEach(transaction => {
        if (transaction.type === 'دفع أرباح') {
            const transDate = new Date(transaction.date || transaction.createdAt);
            const monthsAgo = (now.getFullYear() - transDate.getFullYear()) * 12 + now.getMonth() - transDate.getMonth();
            
            if (monthsAgo >= 0 && monthsAgo < 6) {
                data[5 - monthsAgo] += transaction.amount;
            }
        }
    });
    
    return data;
}

// الحصول على بيانات الإيداعات الشهرية
function getMonthlyDeposits() {
    const data = [0, 0, 0, 0, 0, 0]; // 6 أشهر
    const now = new Date();
    
    transactions.forEach(transaction => {
        if (transaction.type !== 'إيداع') return;
        
        const transDate = new Date(transaction.date || transaction.createdAt);
        const monthsAgo = (now.getFullYear() - transDate.getFullYear()) * 12 + now.getMonth() - transDate.getMonth();
        
        if (monthsAgo >= 0 && monthsAgo < 6) {
            data[5 - monthsAgo] += transaction.amount;
        }
    });
    
    return data;
}

// الحصول على بيانات السحوبات الشهرية
function getMonthlyWithdrawals() {
    const data = [0, 0, 0, 0, 0, 0]; // 6 أشهر
    const now = new Date();
    
    transactions.forEach(transaction => {
        if (transaction.type !== 'سحب') return;
        
        const transDate = new Date(transaction.date || transaction.createdAt);
        const monthsAgo = (now.getFullYear() - transDate.getFullYear()) * 12 + now.getMonth() - transDate.getMonth();
        
        if (monthsAgo >= 0 && monthsAgo < 6) {
            data[5 - monthsAgo] += transaction.amount;
        }
    });
    
    return data;
}

// الحصول على بيانات الأرباح الشهرية
function getMonthlyProfitData() {
    const data = [0, 0, 0, 0, 0, 0]; // 6 أشهر
    const now = new Date();
    
    transactions.forEach(transaction => {
        if (transaction.type !== 'دفع أرباح') return;
        
        const transDate = new Date(transaction.date || transaction.createdAt);
        const monthsAgo = (now.getFullYear() - transDate.getFullYear()) * 12 + now.getMonth() - transDate.getMonth();
        
        if (monthsAgo >= 0 && monthsAgo < 6) {
            data[5 - monthsAgo] += transaction.amount;
        }
    });
    
    return data;
}

// الحصول على توزيع الاستثمارات حسب الفئة
function getInvestmentDistribution() {
    const distribution = [0, 0, 0, 0]; // أربع فئات
    
    investors.forEach(investor => {
        const amount = investor.amount || 0;
        
        if (amount < 10000) {
            distribution[0] += amount;
        } else if (amount >= 10000 && amount < 50000) {
            distribution[1] += amount;
        } else if (amount >= 50000 && amount < 100000) {
            distribution[2] += amount;
        } else {
            distribution[3] += amount;
        }
    });
    
    return distribution;
}

// تحديث إضافي للتطبيق
document.addEventListener('DOMContentLoaded', function() {
    console.log('تحميل الصفحة اكتمل، إضافة مستمعي الأحداث النهائية...');
    
    // تهيئة أزرار التصدير
    setupExportButtons();
    
    // تهيئة دوال النسخ الاحتياطي
    setupBackupFunctions();
    
    // إعداد مستمعي الأحداث الإضافية
    setupAdditionalEventListeners();
    
    
    // عرض رسالة ترحيب
    setTimeout(() => {
        showNotification('مرحباً بك في نظام الاستثمار المتكامل', 'info');
    }, 1000);
});


/**
 * إصلاح لمشكلة الرسوم البيانية
 * للتأكد من تدمير الرسوم البيانية قبل إعادة إنشائها
 */
document.addEventListener("DOMContentLoaded", () => {
    loadData();

    document.getElementById("general-settings-form")?.addEventListener("submit", e => {
        e.preventDefault();
        saveGeneralSettings();
    });

    document.getElementById("profits-settings-form")?.addEventListener("submit", e => {
        e.preventDefault();
        saveProfitsSettings();
    });

    document.getElementById("notifications-settings-form")?.addEventListener("submit", e => {
        e.preventDefault();
        saveNotificationsSettings();
    });
});


/**
 * وظيفة التعرف على الصوت للنظام
 * تمكن المستخدم من إدخال البيانات باللغة العربية عن طريق المايكروفون
 */

// تعريف كائن التعرف على الصوت باستخدام الواجهة المناسبة للمتصفح
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

// متغير يخزن كائن التعرف على الصوت النشط
let recognitionInstance = null;
// متغير يخزن حقل الإدخال الذي سيتم تعبئته بالصوت
let currentInputField = null;

/**
 * وظيفة إعداد أزرار المايكروفون في النظام
 * تضيف مستمع حدث لكل زر للمايكروفون
 */
function setupSpeechRecognition() {
    console.log('تهيئة نظام التعرف على الصوت...');
    
    // التحقق من دعم المتصفح للتعرف على الصوت
    if (!SpeechRecognition) {
        console.error('المتصفح لا يدعم ميزة التعرف على الصوت');
        // تغيير شكل أزرار المايكروفون لتعكس عدم الدعم
        disableMicrophoneButtons();
        return;
    }
    
    // العثور على جميع أزرار المايكروفون في الصفحة
    const micButtons = document.querySelectorAll('.mic-btn');
    
    // إضافة مستمع حدث لكل زر
    micButtons.forEach(button => {
        // إضافة فئة تشير إلى أن الزر مدعوم
        button.classList.add('supported');
        
        // إضافة نص بديل للزر
        button.title = 'انقر للتحدث';
        
        // إضافة مستمع حدث النقر
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // الحصول على معرف حقل الإدخال المرتبط بالزر
            const inputId = this.getAttribute('data-input');
            const inputField = document.getElementById(inputId);
            
            if (!inputField) {
                console.error(`لم يتم العثور على حقل الإدخال: ${inputId}`);
                return;
            }
            
            // إذا كان هناك تعرف نشط على الصوت، يتم إيقافه أولاً
            if (recognitionInstance) {
                recognitionInstance.abort();
                stopRecognition();
                
                // إذا كان حقل الإدخال الحالي هو نفسه، فلا داعي لبدء تعرف جديد
                if (currentInputField === inputField) {
                    return;
                }
            }
            
            // تخزين حقل الإدخال الحالي
            currentInputField = inputField;
            
            // بدء التعرف على الصوت
            startRecognition(button);
        });
    });
    
    console.log(`تم تهيئة ${micButtons.length} زر للمايكروفون`);
}

/**
 * تعطيل أزرار المايكروفون في حالة عدم دعم المتصفح
 */
function disableMicrophoneButtons() {
    const micButtons = document.querySelectorAll('.mic-btn');
    
    micButtons.forEach(button => {
        // إضافة فئة تشير إلى أن الزر غير مدعوم
        button.classList.add('not-supported');
        button.title = 'التعرف على الصوت غير مدعوم في هذا المتصفح';
        
        // تغيير الأيقونة
        const icon = button.querySelector('i.fa-microphone');
        if (icon) {
            icon.classList.remove('fa-microphone');
            icon.classList.add('fa-microphone-slash');
        }
        
        // تعطيل الزر
        button.disabled = true;
    });
}

/**
 * بدء عملية التعرف على الصوت
 * @param {HTMLElement} button - زر المايكروفون الذي تم النقر عليه
 */
function startRecognition(button) {
    try {
        // إنشاء كائن جديد للتعرف على الصوت
        const recognition = new SpeechRecognition();
        recognitionInstance = recognition;
        
        // إعداد خيارات التعرف على الصوت
        recognition.lang = 'ar-SA'; // تعيين اللغة العربية
        recognition.continuous = false; // التعرف على جملة واحدة فقط
        recognition.interimResults = true; // عرض النتائج المؤقتة
        recognition.maxAlternatives = 1; // الحصول على نتيجة واحدة فقط
        
        // تغيير مظهر الزر لتعكس حالة الاستماع
        button.classList.add('listening');
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-microphone');
            icon.classList.add('fa-spinner');
            icon.classList.add('fa-pulse');
        }
        
        // إنشاء عنصر للإشارة إلى التسجيل النشط
        const recordingIndicator = document.createElement('div');
        recordingIndicator.className = 'recording-indicator';
        document.body.appendChild(recordingIndicator);
        
        // إظهار إشعار للمستخدم
        showNotification('جارٍ الاستماع... تحدث الآن', 'info');
        
        // مستمع حدث لنتائج التعرف المؤقتة
        recognition.onresult = function(event) {
            // الحصول على النص المتعرف عليه
            const speechResult = event.results[0][0].transcript;
            console.log(`نتيجة التعرف: "${speechResult}" (الثقة: ${event.results[0][0].confidence})`);
            
            // تحديث قيمة حقل الإدخال بالنص المتعرف عليه
            if (currentInputField) {
                currentInputField.value = speechResult;
                
                // إطلاق حدث تغيير لحقل الإدخال
                const changeEvent = new Event('change', { bubbles: true });
                currentInputField.dispatchEvent(changeEvent);
                
                // إطلاق حدث إدخال لحقل الإدخال
                const inputEvent = new Event('input', { bubbles: true });
                currentInputField.dispatchEvent(inputEvent);
            }
        };
        
        // مستمع حدث لانتهاء التعرف
        recognition.onend = function() {
            stopRecognition();
            
            // إزالة مؤشر التسجيل
            if (recordingIndicator) {
                document.body.removeChild(recordingIndicator);
            }
            
            if (currentInputField && currentInputField.value) {
                showNotification('تم التعرف بنجاح!', 'success');
            }
        };
        
        // مستمع حدث للأخطاء
        recognition.onerror = function(event) {
            console.error(`خطأ في التعرف على الصوت: ${event.error}`);
            
            let errorMessage = 'حدث خطأ في التعرف على الصوت';
            
            // تحديد رسائل الخطأ المختلفة
            switch(event.error) {
                case 'no-speech':
                    errorMessage = 'لم يتم اكتشاف أي كلام';
                    break;
                case 'audio-capture':
                    errorMessage = 'تعذر الوصول إلى المايكروفون';
                    break;
                case 'not-allowed':
                    errorMessage = 'تم رفض الوصول إلى المايكروفون';
                    break;
                case 'network':
                    errorMessage = 'حدث خطأ في الشبكة';
                    break;
                case 'aborted':
                    // لا حاجة لعرض إشعار في حالة الإلغاء
                    errorMessage = null;
                    break;
            }
            
            // إزالة مؤشر التسجيل
            if (recordingIndicator) {
                document.body.removeChild(recordingIndicator);
            }
            
            stopRecognition();
            
            if (errorMessage) {
                showNotification(errorMessage, 'error');
            }
        };
        
        // بدء عملية التعرف على الصوت
        recognition.start();
        console.log('بدأ الاستماع للصوت...');
        
    } catch (error) {
        console.error('خطأ في بدء التعرف على الصوت:', error);
        showNotification('تعذر بدء التعرف على الصوت', 'error');
        
        stopRecognition();
    }
}

/**
 * إيقاف عملية التعرف على الصوت وإعادة تعيين واجهة المستخدم
 */
function stopRecognition() {
    if (recognitionInstance) {
        try {
            recognitionInstance.stop();
        } catch (e) {
            // تجاهل الأخطاء عند إيقاف التعرف
        }
        
        recognitionInstance = null;
    }
    
    // إعادة تعيين حالة جميع أزرار المايكروفون
    const micButtons = document.querySelectorAll('.mic-btn');
    micButtons.forEach(button => {
        button.classList.remove('listening');
        
        // إعادة تعيين الأيقونة
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-spinner');
            icon.classList.remove('fa-pulse');
            icon.classList.add('fa-microphone');
        }
    });
    
    // إزالة جميع مؤشرات التسجيل المتبقية
    const indicators = document.querySelectorAll('.recording-indicator');
    indicators.forEach(indicator => {
        indicator.parentNode.removeChild(indicator);
    });
}

/**
 * إضافة أنماط CSS لعناصر التعرف على الصوت
 */
function addSpeechRecognitionStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('speech-recognition-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'speech-recognition-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* نمط لزر المايكروفون */
        .mic-btn {
            position: relative;
            transition: all 0.3s ease;
        }
        
        /* زر المايكروفون عند حالة الاستماع */
        .mic-btn.listening {
            background-color: #f44336;
            color: white;
            border-color: #d32f2f;
            box-shadow: 0 0 0 4px rgba(244, 67, 54, 0.3);
        }
        
        /* زر المايكروفون في حالة عدم الدعم */
        .mic-btn.not-supported {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        /* مؤشر التسجيل النشط */
        .recording-indicator {
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #f44336;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: pulse 1.5s infinite;
        }
        
        .recording-indicator::before {
            content: "●  جارٍ الاستماع...";
            font-family: 'Tajawal', sans-serif;
        }
        
        /* تنشيط نبض للمؤشر */
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }
        
        /* توسيط الأيقونة في الزر */
        .mic-btn i {
            margin: 0;
        }
        
        /* تنسيق لمجموعة الإدخال مع زر المايكروفون */
        .input-group {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .input-group .form-input {
            flex: 1;
            border-left: 0;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
        
        .input-group .btn-icon-sm {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للتعرف على الصوت');
}

/**
 * إضافة معلومات المساعدة للمستخدم عن استخدام المايكروفون
 */
function addSpeechRecognitionHelpInfo() {
    // إنشاء نافذة منبثقة للمساعدة
    const helpButton = document.createElement('button');
    helpButton.className = 'btn btn-info speech-help-btn';
    helpButton.innerHTML = '<i class="fas fa-question-circle"></i>';
    helpButton.title = 'مساعدة حول استخدام الإدخال الصوتي';
    
    // موضع الزر
    helpButton.style.position = 'fixed';
    helpButton.style.bottom = '20px';
    helpButton.style.left = '20px';
    helpButton.style.zIndex = '1000';
    helpButton.style.borderRadius = '50%';
    helpButton.style.width = '40px';
    helpButton.style.height = '40px';
    helpButton.style.padding = '0';
    helpButton.style.display = 'flex';
    helpButton.style.alignItems = 'center';
    helpButton.style.justifyContent = 'center';
    
    // إضافة مستمع حدث للزر
    helpButton.addEventListener('click', function() {
        showSpeechHelpModal();
    });
    
    // إضافة الزر للصفحة
    document.body.appendChild(helpButton);
}

/**
 * عرض شاشة المساعدة للتعرف على الصوت
 */
function showSpeechHelpModal() {
    const content = `
        <div class="speech-help-content">
            <h3><i class="fas fa-microphone"></i> كيفية استخدام الإدخال الصوتي</h3>
            
            <p>يمكنك استخدام ميزة الإدخال الصوتي لإدخال البيانات باستخدام الصوت بدلاً من الكتابة. اتبع الخطوات التالية:</p>
            
            <ol>
                <li>انقر على زر المايكروفون <i class="fas fa-microphone"></i> بجانب حقل الإدخال.</li>
                <li>اسمح للمتصفح بالوصول إلى المايكروفون إذا طُلب منك ذلك.</li>
                <li>تحدث بوضوح باللغة العربية.</li>
                <li>سيتم تحويل كلامك تلقائيًا إلى نص في حقل الإدخال.</li>
                <li>يمكنك تعديل النص يدويًا بعد الانتهاء إذا لزم الأمر.</li>
            </ol>
            
            <div class="note">
                <p><strong>ملاحظات:</strong></p>
                <ul>
                    <li>تأكد من أن المايكروفون يعمل بشكل صحيح.</li>
                    <li>تحدث بوضوح وببطء للحصول على نتائج أفضل.</li>
                    <li>يعمل هذا بشكل أفضل في بيئة هادئة خالية من الضوضاء.</li>
                    <li>تأكد من استخدام متصفح حديث يدعم التعرف على الصوت.</li>
                </ul>
            </div>
        </div>
    `;
    
    // استخدام دالة عرض النافذة المنبثقة الموجودة
    showModal('مساعدة الإدخال الصوتي', content);
}

/**
 * تحسين التعرف على الصوت بإضافة قواعد نحوية للكلمات المتوقعة
 * يساعد على تحسين دقة التعرف على الأرقام والمصطلحات المالية
 */
function setupSpeechGrammar() {
    if (!SpeechGrammarList) {
        return; // عدم دعم قوائم القواعد النحوية
    }
    
    // إنشاء قائمة قواعد نحوية للأرقام والكلمات المتوقعة
    const numbers = '0 1 2 3 4 5 6 7 8 9 صفر واحد اثنان ثلاثة أربعة خمسة ستة سبعة ثمانية تسعة عشرة عشرون ثلاثون أربعون خمسون ستون سبعون ثمانون تسعون مائة مئة ألف مليون';
    const financialTerms = 'دينار ريال درهم دولار يورو إيداع سحب استثمار ربح أرباح فائدة رصيد مستثمر';
    
    // إنشاء قواعد JSGF
    const grammar = `#JSGF V1.0; grammar numbers; public <numbers> = ${numbers}; public <terms> = ${financialTerms};`;
    
    // تطبيق القواعد على كائن التعرف على الصوت
    const speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    
    // حفظ القواعد لاستخدامها لاحقًا
    window.speechGrammarList = speechRecognitionList;
}

// تهيئة نظام التعرف على الصوت عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة أنماط CSS
    addSpeechRecognitionStyles();
   
    
    // إعداد القواعد النحوية
    setupSpeechGrammar();
    
    // إضافة معلومات المساعدة
    addSpeechRecognitionHelpInfo();
});

// التعامل مع فتح وإغلاق النوافذ المنبثقة
document.addEventListener('modal:opened', function(e) {
    // إيقاف أي تعرف على الصوت نشط عند فتح نافذة منبثقة
    stopRecognition();
    
    // البحث عن أزرار المايكروفون الجديدة في النافذة المنبثقة وتهيئتها
    const modalId = e.detail.modalId;
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        const newMicButtons = modalElement.querySelectorAll('.mic-btn:not(.supported)');
        if (newMicButtons.length > 0) {
            setupSpeechRecognitionForButtons(newMicButtons);
        }
    }
});

// وظيفة تهيئة مجموعة محددة من أزرار المايكروفون
function setupSpeechRecognitionForButtons(buttons) {
    if (!SpeechRecognition) {
        disableMicrophoneButtons();
        return;
    }
    
    buttons.forEach(button => {
        button.classList.add('supported');
        button.title = 'انقر للتحدث';
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const inputId = this.getAttribute('data-input');
            const inputField = document.getElementById(inputId);
            
            if (!inputField) {
                console.error(`لم يتم العثور على حقل الإدخال: ${inputId}`);
                return;
            }
            
            if (recognitionInstance) {
                recognitionInstance.abort();
                stopRecognition();
                
                if (currentInputField === inputField) {
                    return;
                }
            }
            
            currentInputField = inputField;
            startRecognition(button);
        });
    });
}



// إضافة هذه الدالة في ملف app-fixed.js (يمكن إضافتها في نهاية الملف، قبل آخر سطر)
function formatCurrency(amount, addCurrency = true) {
    // التحقق من صحة المبلغ
    if (amount === undefined || amount === null || isNaN(amount)) {
        return addCurrency ? "0 " + (window.settings?.currency || 'دينار') : "0";
    }
    
    // تقريب المبلغ إلى رقمين عشريين إذا كان يحتوي على كسور
    amount = parseFloat(amount);
    if (amount % 1 !== 0) {
        amount = amount.toFixed(2);
    }
    
    // تحويل المبلغ إلى نص وإضافة النقاط بين كل ثلاثة أرقام
    const parts = amount.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // إعادة المبلغ مع إضافة العملة إذا تم طلب ذلك
    const formattedAmount = parts.join('.');
    
    if (addCurrency) {
        return formattedAmount + " " + (window.settings?.currency || 'دينار');
    } else {
        return formattedAmount;
    }
}

// إضافة الدالة كخاصية لكائن window للتأكد من إمكانية الوصول إليها
window.formatCurrency = formatCurrency;

/**
 * دمج ميزة التعرف على الصوت مع نظام الاستثمار المتكامل
 * يوفر هذا الملف التكامل بين نظام التعرف على الصوت والتطبيق الأساسي
 */

// تحديث دالة setupSpeechRecognition الموجودة في ملف app-fixed.js
// نستبدل الدالة الحالية بالتنفيذ المحسن التالي

/**
 * إعداد التعرف على الصوت وتكامله مع نظام الاستثمار
 */
function setupSpeechRecognition() {
    console.log('تهيئة نظام التعرف على الصوت...');
    
    // التحقق من دعم المتصفح للتعرف على الصوت
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    
    if (!SpeechRecognition) {
        console.warn('المتصفح لا يدعم ميزة التعرف على الصوت');
        disableMicrophoneButtons();
        return;
    }
    
    // إضافة أنماط CSS للتعرف على الصوت
    addSpeechRecognitionStyles();
    
    // إعداد قواعد القواميس للتعرف على الصوت (للأرقام والمصطلحات المالية)
    setupSpeechGrammar(SpeechGrammarList);
    
    // البحث عن جميع أزرار المايكروفون المتوافرة في الصفحة
    const micButtons = document.querySelectorAll('.mic-btn');
    if (micButtons.length === 0) {
        console.warn('لم يتم العثور على أزرار مايكروفون في الصفحة');
        
        // إنشاء أزرار المايكروفون للحقول الموجودة
        createMicrophoneButtons();
    } else {
        setupExistingMicrophoneButtons(micButtons);
    }
    
    // إضافة زر المساعدة للتعرف على الصوت
    addSpeechRecognitionHelpButton();
    
    // إضافة مستمعي الأحداث النافذة المنبثقة
    setupModalEvents();
    
    console.log('تم تهيئة نظام التعرف على الصوت بنجاح');
}

/**
 * تعطيل أزرار المايكروفون في حالة عدم دعم المتصفح
 */
function disableMicrophoneButtons() {
    const micButtons = document.querySelectorAll('.mic-btn');
    
    micButtons.forEach(button => {
        button.classList.add('not-supported');
        button.title = 'التعرف على الصوت غير مدعوم في هذا المتصفح';
        
        const icon = button.querySelector('i.fa-microphone');
        if (icon) {
            icon.classList.remove('fa-microphone');
            icon.classList.add('fa-microphone-slash');
        }
        
        button.disabled = true;
    });
}

/**
 * إنشاء أزرار المايكروفون للحقول النصية الموجودة في النماذج
 */
function createMicrophoneButtons() {
    console.log('إنشاء أزرار المايكروفون للحقول النصية...');
    
    // العثور على جميع حقول الإدخال النصية ورقمية
    const textInputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"], textarea');
    
    textInputs.forEach((input, index) => {
        // التحقق من أن الحقل ليس مخفيًا
        if (input.style.display === 'none' || input.type === 'hidden') {
            return;
        }
        
        // التحقق مما إذا كان الحقل يقع داخل مجموعة إدخال
        const parentGroup = input.closest('.input-group');
        
        // إذا كان الحقل ليس بداخل مجموعة إدخال، قم بإنشاء مجموعة جديدة
        if (!parentGroup) {
            // الحصول على معرف الحقل، أو إنشاء واحد إذا لم يكن موجودًا
            if (!input.id) {
                input.id = `input-field-${Date.now()}-${index}`;
            }
            
            // إنشاء مجموعة إدخال جديدة
            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';
            
            // إدراج مجموعة الإدخال قبل الحقل النصي في DOM
            input.parentNode.insertBefore(inputGroup, input);
            
            // نقل الحقل النصي إلى داخل مجموعة الإدخال
            inputGroup.appendChild(input);
            
            // إنشاء زر المايكروفون
            const micButton = document.createElement('button');
            micButton.className = 'btn btn-icon-sm mic-btn';
            micButton.type = 'button';
            micButton.setAttribute('data-input', input.id);
            micButton.title = 'انقر للتحدث';
            micButton.innerHTML = '<i class="fas fa-microphone"></i>';
            
            // إضافة زر المايكروفون إلى مجموعة الإدخال
            inputGroup.appendChild(micButton);
        }
    });
    
    // إعداد أزرار المايكروفون التي تم إنشاؤها
    const newMicButtons = document.querySelectorAll('.mic-btn:not(.setup-complete)');
    setupExistingMicrophoneButtons(newMicButtons);
}

/**
 * إعداد أزرار المايكروفون الموجودة بالفعل
 * @param {NodeList} buttons - قائمة أزرار المايكروفون
 */
function setupExistingMicrophoneButtons(buttons) {
    let recognitionInstance = null;
    let currentInputField = null;
    
    buttons.forEach(button => {
        // تجنب إعادة إعداد الأزرار التي تم إعدادها بالفعل
        if (button.classList.contains('setup-complete')) {
            return;
        }
        
        // إضافة فئة تشير إلى اكتمال الإعداد
        button.classList.add('setup-complete');
        
        // إضافة نص بديل للزر
        button.title = 'انقر للتحدث';
        
        // التأكد من وجود معرف لحقل الإدخال
        const inputId = button.getAttribute('data-input');
        if (!inputId) {
            console.error('زر المايكروفون ليس له سمة data-input:', button);
            return;
        }
        
        // إضافة مستمع حدث النقر
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // الحصول على حقل الإدخال المرتبط بالزر
            const inputField = document.getElementById(inputId);
            
            if (!inputField) {
                console.error(`لم يتم العثور على حقل الإدخال: ${inputId}`);
                return;
            }
            
            // إذا كان هناك تعرف نشط على الصوت، يتم إيقافه أولاً
            if (recognitionInstance) {
                recognitionInstance.abort();
                stopSpeechRecognition(recognitionInstance);
                
                // إذا كان حقل الإدخال الحالي هو نفسه، فلا داعي لبدء تعرف جديد
                if (currentInputField === inputField) {
                    currentInputField = null;
                    return;
                }
            }
            
            // تخزين حقل الإدخال الحالي
            currentInputField = inputField;
            
            // بدء التعرف على الصوت
            recognitionInstance = startSpeechRecognition(button, inputField);
        });
    });
}

/**
 * بدء عملية التعرف على الصوت
 * @param {HTMLElement} button - زر المايكروفون الذي تم النقر عليه
 * @param {HTMLElement} inputField - حقل الإدخال المرتبط
 * @returns {SpeechRecognition} - كائن التعرف على الصوت
 */
function startSpeechRecognition(button, inputField) {
    // الحصول على كائن التعرف على الصوت
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    try {
        // إنشاء كائن جديد للتعرف على الصوت
        const recognition = new SpeechRecognition();
        
        // إعداد خيارات التعرف على الصوت
        recognition.lang = 'ar-SA'; // تعيين اللغة العربية
        recognition.continuous = false; // التعرف على جملة واحدة فقط
        recognition.interimResults = true; // عرض النتائج المؤقتة
        recognition.maxAlternatives = 1; // الحصول على نتيجة واحدة فقط
        
        // إضافة قواعد القواميس إذا كانت متاحة
        if (window.speechGrammarList) {
            recognition.grammars = window.speechGrammarList;
        }
        
        // تغيير مظهر الزر ليعكس حالة الاستماع
        button.classList.add('listening');
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-microphone');
            icon.classList.add('fa-spinner');
            icon.classList.add('fa-pulse');
        }
        
        // إضافة فئة تشير إلى أن الحقل يستخدم الإدخال الصوتي
        inputField.classList.add('voice-input');
        
        // إنشاء مؤشر التسجيل النشط
        const recordingIndicator = document.createElement('div');
        recordingIndicator.className = 'recording-indicator';
        recordingIndicator.textContent = 'جارٍ الاستماع... تحدث الآن';
        document.body.appendChild(recordingIndicator);
        
        // إظهار إشعار للمستخدم
        showNotification('جارٍ الاستماع... تحدث الآن', 'info');
        
        // مستمع حدث لنتائج التعرف المؤقتة
        recognition.onresult = function(event) {
            // الحصول على النص المتعرف عليه
            const speechResult = event.results[0][0].transcript;
            console.log(`نتيجة التعرف: "${speechResult}" (الثقة: ${event.results[0][0].confidence})`);
            
            // تحديث قيمة حقل الإدخال بالنص المتعرف عليه
            inputField.value = speechResult;
            
            // إطلاق حدث تغيير لحقل الإدخال
            const changeEvent = new Event('change', { bubbles: true });
            inputField.dispatchEvent(changeEvent);
            
            // إطلاق حدث إدخال لحقل الإدخال
            const inputEvent = new Event('input', { bubbles: true });
            inputField.dispatchEvent(inputEvent);
        };
        
        // مستمع حدث لانتهاء التعرف
        recognition.onend = function() {
            // إعادة تعيين حالة الزر
            button.classList.remove('listening');
            if (icon) {
                icon.classList.remove('fa-spinner');
                icon.classList.remove('fa-pulse');
                icon.classList.add('fa-microphone');
            }
            
            // إزالة فئة الإدخال الصوتي بعد فترة قصيرة
            setTimeout(() => {
                inputField.classList.remove('voice-input');
            }, 2000);
            
            // إزالة مؤشر التسجيل
            if (recordingIndicator.parentNode) {
                recordingIndicator.parentNode.removeChild(recordingIndicator);
            }
            
            if (inputField.value) {
                showNotification('تم التعرف بنجاح!', 'success');
            }
        };
        
        // مستمع حدث للأخطاء
        recognition.onerror = function(event) {
            console.error(`خطأ في التعرف على الصوت: ${event.error}`);
            
            let errorMessage = 'حدث خطأ في التعرف على الصوت';
            
            // تحديد رسائل الخطأ المختلفة
            switch(event.error) {
                case 'no-speech':
                    errorMessage = 'لم يتم اكتشاف أي كلام';
                    break;
                case 'audio-capture':
                    errorMessage = 'تعذر الوصول إلى المايكروفون';
                    break;
                case 'not-allowed':
                    errorMessage = 'تم رفض الوصول إلى المايكروفون';
                    break;
                case 'network':
                    errorMessage = 'حدث خطأ في الشبكة';
                    break;
                case 'aborted':
                    // لا حاجة لعرض إشعار في حالة الإلغاء
                    errorMessage = null;
                    break;
            }
            
            // إعادة تعيين حالة الزر
            button.classList.remove('listening');
            if (icon) {
                icon.classList.remove('fa-spinner');
                icon.classList.remove('fa-pulse');
                icon.classList.add('fa-microphone');
            }
            
            // إزالة فئة الإدخال الصوتي
            inputField.classList.remove('voice-input');
            
            // إزالة مؤشر التسجيل
            if (recordingIndicator.parentNode) {
                recordingIndicator.parentNode.removeChild(recordingIndicator);
            }
            
            if (errorMessage) {
                showNotification(errorMessage, 'error');
            }
        };
        
        // بدء عملية التعرف على الصوت
        recognition.start();
        console.log('بدأ الاستماع للصوت...');
        
        return recognition;
        
    } catch (error) {
        console.error('خطأ في بدء التعرف على الصوت:', error);
        showNotification('تعذر بدء التعرف على الصوت', 'error');
        
        // إعادة تعيين حالة الزر
        button.classList.remove('listening');
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-spinner');
            icon.classList.remove('fa-pulse');
            icon.classList.add('fa-microphone');
        }
        
        return null;
    }
}

/**
 * إيقاف عملية التعرف على الصوت
 * @param {SpeechRecognition} recognition - كائن التعرف على الصوت
 */
function stopSpeechRecognition(recognition) {
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {
            // تجاهل الأخطاء عند إيقاف التعرف
        }
    }
    
    // إعادة تعيين حالة جميع أزرار المايكروفون
    const micButtons = document.querySelectorAll('.mic-btn.listening');
    micButtons.forEach(button => {
        button.classList.remove('listening');
        
        // إعادة تعيين الأيقونة
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-spinner');
            icon.classList.remove('fa-pulse');
            icon.classList.add('fa-microphone');
        }
    });
    
    // إزالة جميع مؤشرات التسجيل المتبقية
    const indicators = document.querySelectorAll('.recording-indicator');
    indicators.forEach(indicator => {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    });
    
    // إزالة فئة الإدخال الصوتي من جميع الحقول
    const voiceInputs = document.querySelectorAll('.voice-input');
    voiceInputs.forEach(input => {
        input.classList.remove('voice-input');
    });
}

/**
 * إضافة أنماط CSS للتعرف على الصوت
 */
function addSpeechRecognitionStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('speech-recognition-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'speech-recognition-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* نمط لزر المايكروفون */
        .mic-btn {
            position: relative;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        /* زر المايكروفون عند حالة الاستماع */
        .mic-btn.listening {
            background-color: #f44336;
            color: white;
            border-color: #d32f2f;
            box-shadow: 0 0 0 4px rgba(244, 67, 54, 0.3);
        }
        
        /* زر المايكروفون في حالة عدم الدعم */
        .mic-btn.not-supported {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        /* مؤشر التسجيل النشط */
        .recording-indicator {
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #f44336;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            animation: pulse 1.5s infinite;
        }
        
        .recording-indicator::before {
            content: "●";
            margin-left: 8px;
            font-size: 16px;
            animation: blink 1s infinite;
        }
        
        /* تنسيق حقل الإدخال أثناء استخدام الصوت */
        .voice-input {
            border-color: #f44336 !important;
            background-color: rgba(244, 67, 54, 0.05) !important;
            transition: all 0.3s ease;
        }
        
        /* تنشيط نبض للمؤشر */
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }
        
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
        }
        
        /* زر المساعدة للتعرف على الصوت */
        .speech-help-btn {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 1000;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #3498db;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .speech-help-btn:hover {
            transform: scale(1.1);
            background-color: #2980b9;
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للتعرف على الصوت');
}

/**
 * إعداد قواعد القواميس للتعرف على الصوت
 * @param {Object} SpeechGrammarList - كائن قائمة القواعد النحوية
 */
function setupSpeechGrammar(SpeechGrammarList) {
    if (!SpeechGrammarList) {
        return; // عدم دعم قوائم القواعد النحوية
    }
    
    try {
        // إنشاء قائمة قواعد نحوية للأرقام والكلمات المتوقعة
        const numbers = '0 1 2 3 4 5 6 7 8 9 صفر واحد اثنان ثلاثة أربعة خمسة ستة سبعة ثمانية تسعة عشرة عشرون ثلاثون أربعون خمسون ستون سبعون ثمانون تسعون مائة مئة ألف مليون';
        const financialTerms = 'دينار ريال درهم دولار يورو إيداع سحب استثمار ربح أرباح فائدة رصيد مستثمر';
        
        // إنشاء قواعد JSGF
        const grammar = `#JSGF V1.0; grammar numbers; public <numbers> = ${numbers}; public <terms> = ${financialTerms};`;
        
        // إنشاء قائمة القواعد النحوية
        const speechGrammarList = new SpeechGrammarList();
        speechGrammarList.addFromString(grammar, 1);
        
        // حفظ القواعد النحوية
        window.speechGrammarList = speechGrammarList;
        
        console.log('تم إعداد قواعد القواميس للتعرف على الصوت');
    } catch (error) {
        console.error('خطأ في إعداد قواعد القواميس:', error);
    }
}



/**
 * إعداد مستمعي الأحداث للنوافذ المنبثقة
 */
function setupModalEvents() {
    // استمع لأحداث فتح النوافذ المنبثقة لإضافة أزرار المايكروفون للحقول الجديدة
    document.addEventListener('click', function(event) {
        // البحث عن أزرار فتح النوافذ المنبثقة التي تم النقر عليها
        const modalTrigger = event.target.closest('[data-modal], [data-page], .modal-close, .modal-close-btn');
        
        if (modalTrigger) {
            // تأخير لإعطاء وقت للنافذة المنبثقة للظهور
            setTimeout(() => {
                // البحث عن حقول النموذج التي تحتاج إلى أزرار المايكروفون
                createMicrophoneButtons();
                
                // البحث عن أزرار المايكروفون الموجودة وإعدادها
                const modalMicButtons = document.querySelectorAll('.modal.active .mic-btn:not(.setup-complete)');
                if (modalMicButtons.length > 0) {
                    setupExistingMicrophoneButtons(modalMicButtons);
                }
            }, 300);
        }
    });
    
    // إيقاف أي تعرف على الصوت نشط عند إغلاق النافذة المنبثقة
    document.addEventListener('click', function(event) {
        const modalCloseBtn = event.target.closest('.modal-close, .modal-close-btn');
        if (modalCloseBtn) {
                        // إيقاف أي تعرف على الصوت نشط
                    }
                });
            }


            document.getElementById("minimize-btn").addEventListener("click", () => {
                window.windowControls.minimize();
              });
            
              document.getElementById("maximize-btn").addEventListener("click", () => {
                window.windowControls.maximize();
              });
            
              document.getElementById("close-btn").addEventListener("click", () => {
                window.windowControls.close();
              });
              
              
              
              document.addEventListener('page:change', function(e) {
    if (!e.detail || !e.detail.page) return;
    
    // قائمة الصفحات المحمية التي تتطلب تسجيل الدخول
    const protectedPages = [
        'investors', 'transactions', 'profits', 'reports', 'settings'
    ];
    
    // التحقق مما إذا كانت الصفحة المطلوبة محمية
    if (protectedPages.includes(e.detail.page)) {
        // التحقق من حالة المصادقة
        const isAuthenticated = window.AuthSystem ? window.AuthSystem.isAuthenticated() : false;
        
        if (!isAuthenticated) {
            // منع الوصول إلى الصفحة المحمية
            e.preventDefault();
            e.stopPropagation();
            
            // إظهار نافذة تسجيل الدخول
            if (window.AuthSystem) {
                window.AuthSystem.showAuthModal();
            }
            
            // إظهار إشعار للمستخدم
            if (window.showNotification) {
                window.showNotification('يجب تسجيل الدخول للوصول إلى هذه الصفحة', 'warning');
            }
            
            // العودة إلى الصفحة الرئيسية
            showPage('dashboard');
            
            return false;
        }
    }
});



/**
 * employees-installments.js
 * نظام إدارة الموظفين والأقساط المتكامل
 * يتكامل مع نظام الاستثمار المتكامل
 * يوفر وظائف إدارة الموظفين وبياناتهم والرواتب والأقساط
 */

// تهيئة المتغيرات الرئيسية للنظام
let employees = [];
let salaries = [];
let installments = [];

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام الموظفين والأقساط...');
    
    // إضافة صفحات الموظفين والرواتب والأقساط للقائمة الجانبية
    addSidebarMenuItems();
    
    // إضافة صفحات الموظفين والرواتب والأقساط
    addEmployeePages();
    
    // إضافة النوافذ المنبثقة للنظام
    addEmployeeModals();
    
    // تحميل البيانات من التخزين المحلي
    loadEmployeeData();
    
    // إضافة مستمعي الأحداث
    setupEmployeeEventListeners();
    
    // تفعيل نظام رفع الصور
    setupImageUpload();
});

// إضافة عناصر القائمة الجانبية
function addSidebarMenuItems() {
    console.log('إضافة عناصر القائمة الجانبية للموظفين والأقساط...');
    
    const navList = document.querySelector('.sidebar .nav-list');
    if (!navList) {
        console.error('لم يتم العثور على قائمة التنقل الجانبية');
        return;
    }
    
    // التحقق من عدم وجود العناصر مسبقًا
    if (document.querySelector('.nav-link[data-page="employees"]')) {
        console.log('عناصر القائمة موجودة بالفعل.');
        return;
    }
    
    // إضافة عنصر الموظفين
    const employeesItem = document.createElement('li');
    employeesItem.className = 'nav-item';
    employeesItem.innerHTML = `
        <a class="nav-link" data-page="employees" href="#">
            <div class="nav-icon">
                <i class="fas fa-user-tie"></i>
            </div>
            <span>الموظفين</span>
        </a>
    `;
    
    // إضافة عنصر الرواتب
    const salariesItem = document.createElement('li');
    salariesItem.className = 'nav-item';
    salariesItem.innerHTML = `
        <a class="nav-link" data-page="salaries" href="#">
            <div class="nav-icon">
                <i class="fas fa-money-bill-wave"></i>
            </div>
            <span>الرواتب</span>
        </a>
    `;
    
    // إضافة عنصر الأقساط
    const installmentsItem = document.createElement('li');
    installmentsItem.className = 'nav-item';
    installmentsItem.innerHTML = `
        <a class="nav-link" data-page="installments" href="#">
            <div class="nav-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <span>الأقساط</span>
        </a>
    `;
    
    // إضافة العناصر للقائمة مباشرة قبل عنصر الإعدادات
    const settingsItem = document.querySelector('.nav-link[data-page="settings"]').parentElement;
    
    navList.insertBefore(employeesItem, settingsItem);
    navList.insertBefore(salariesItem, settingsItem);
    navList.insertBefore(installmentsItem, settingsItem);
    
    console.log('تمت إضافة عناصر القائمة الجانبية بنجاح');
}

// إضافة صفحات الموظفين والرواتب والأقساط
function addEmployeePages() {
    console.log('إضافة صفحات الموظفين والرواتب والأقساط...');
    
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('لم يتم العثور على العنصر الرئيسي');
        return;
    }
    
    // التحقق من عدم وجود الصفحات مسبقًا
    if (document.getElementById('employees-page')) {
        console.log('صفحات الموظفين موجودة بالفعل.');
        return;
    }
    
    // إضافة صفحة الموظفين
    const employeesPage = document.createElement('div');
    employeesPage.className = 'page';
    employeesPage.id = 'employees-page';
    employeesPage.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">إدارة الموظفين</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" placeholder="بحث عن موظف..." type="text" id="employee-search" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-primary" id="add-employee-btn">
                    <i class="fas fa-plus"></i>
                    <span>إضافة موظف</span>
                </button>
            </div>
        </div>
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">قائمة الموظفين</h2>
                <div class="section-actions">
                    <div class="btn-group">
                        <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
                        <button class="btn btn-outline btn-sm" data-filter="active">نشط</button>
                        <button class="btn btn-outline btn-sm" data-filter="inactive">غير نشط</button>
                    </div>
                    <button class="btn btn-outline btn-sm" id="export-employees-btn" title="تصدير">
                        <i class="fas fa-download"></i>
                        <span>تصدير</span>
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table id="employees-table">
                    <thead>
                        <tr>
                            <th>الصورة</th>
                            <th>الاسم</th>
                            <th>رقم الهاتف</th>
                            <th>المسمى الوظيفي</th>
                            <th>الراتب الأساسي</th>
                            <th>نسبة المبيعات</th>
                            <th>تاريخ التعيين</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </tbody>
                </table>
            </div>
            <div class="pagination">
                <div class="page-item disabled">
                    <i class="fas fa-chevron-right"></i>
                </div>
                <div class="page-item active">1</div>
                <div class="page-item">2</div>
                <div class="page-item">3</div>
                <div class="page-item">
                    <i class="fas fa-chevron-left"></i>
                </div>
            </div>
        </div>
    `;
    
    // إضافة نافذة إضافة/تعديل قسط
    const addInstallmentModal = document.createElement('div');
    addInstallmentModal.className = 'modal-overlay';
    addInstallmentModal.id = 'add-installment-modal';
    addInstallmentModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title" id="installment-modal-title">إضافة قسط جديد</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <form id="installment-form">
                    <input type="hidden" id="installment-id">
                    
                    <div class="grid-cols-2">
                        <div class="form-group">
                            <label class="form-label">اسم العميل <span class="required">*</span></label>
                            <input class="form-input" id="installment-customer-name" required type="text">
                        </div>
                        <div class="form-group">
                            <label class="form-label">رقم الهاتف <span class="required">*</span></label>
                            <input class="form-input" id="installment-customer-phone" required type="tel">
                        </div>
                        <div class="form-group">
                            <label class="form-label">الموظف المسؤول</label>
                            <select class="form-select" id="installment-employee">
                                <option value="">اختر الموظف</option>
                                <!-- سيتم ملؤها ديناميكيًا -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">قيمة القسط الإجمالية <span class="required">*</span></label>
                            <input class="form-input" id="installment-total-amount" required type="number" min="0">
                        </div>
                        <div class="form-group">
                            <label class="form-label">الدفعة الأولى</label>
                            <input class="form-input" id="installment-down-payment" type="number" min="0" value="0">
                        </div>
                        <div class="form-group">
                            <label class="form-label">عدد الأقساط <span class="required">*</span></label>
                            <input class="form-input" id="installment-count" required type="number" min="1" value="1">
                        </div>
                        <div class="form-group">
                            <label class="form-label">فترة الأقساط</label>
                            <select class="form-select" id="installment-period">
                                <option value="monthly">شهري</option>
                                <option value="quarterly">ربع سنوي</option>
                                <option value="semi-annual">نصف سنوي</option>
                                <option value="annual">سنوي</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">تاريخ البدء <span class="required">*</span></label>
                            <input class="form-input" id="installment-start-date" required type="date">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">معلومات المنتج/الخدمة</label>
                        <textarea class="form-input" id="installment-product-info" rows="2"></textarea>
                    </div>
                    
                    <div class="installment-preview">
                        <h4>ملخص الأقساط</h4>
                        <div class="installment-summary">
                            <div class="summary-item">
                                <span class="summary-label">قيمة القسط الإجمالية:</span>
                                <span class="summary-value" id="summary-total-amount">0</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">الدفعة الأولى:</span>
                                <span class="summary-value" id="summary-down-payment">0</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">المبلغ المتبقي:</span>
                                <span class="summary-value" id="summary-remaining-amount">0</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">قيمة القسط الواحد:</span>
                                <span class="summary-value" id="summary-installment-amount">0</span>
                            </div>
                        </div>
                        
                        <div class="installment-schedule-container">
                            <h4>جدول الأقساط</h4>
                            <div class="table-container">
                                <table id="installment-schedule-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>تاريخ الاستحقاق</th>
                                            <th>قيمة القسط</th>
                                            <th>الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- سيتم ملؤها ديناميكيًا -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-primary" id="save-installment-btn">حفظ</button>
            </div>
        </div>
    `;
    
    // إضافة نافذة عرض تفاصيل الموظف
    const employeeDetailsModal = document.createElement('div');
    employeeDetailsModal.className = 'modal-overlay';
    employeeDetailsModal.id = 'employee-details-modal';
    employeeDetailsModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">تفاصيل الموظف</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div id="employee-details-content">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إغلاق</button>
                <div class="btn-group">
                    <button class="btn btn-primary" id="edit-employee-details-btn">
                        <i class="fas fa-edit"></i>
                        <span>تعديل</span>
                    </button>
                    <button class="btn btn-success" id="pay-employee-salary-btn">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>صرف راتب</span>
                    </button>
                    <button class="btn btn-danger" id="delete-employee-details-btn">
                        <i class="fas fa-trash"></i>
                        <span>حذف</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة نافذة طباعة إيصال الراتب
    const printSalaryModal = document.createElement('div');
    printSalaryModal.className = 'modal-overlay';
    printSalaryModal.id = 'print-salary-modal';
    printSalaryModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">إيصال الراتب</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div id="salary-receipt" class="salary-receipt">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إغلاق</button>
                <button class="btn btn-primary" id="print-salary-btn">
                    <i class="fas fa-print"></i>
                    <span>طباعة</span>
                </button>
            </div>
        </div>
    `;
    
    // إضافة النوافذ المنبثقة إلى الصفحة
    document.body.appendChild(addEmployeeModal);
    document.body.appendChild(paySalaryModal);
    document.body.appendChild(addInstallmentModal);
    document.body.appendChild(employeeDetailsModal);
    document.body.appendChild(printSalaryModal);
    
    // إضافة النمط الخاص بالنظام
    addEmployeeStyles();
    
    console.log('تمت إضافة النوافذ المنبثقة للنظام بنجاح');
}
    
    // إضافة صفحة الرواتب
    const salariesPage = document.createElement('div');
    salariesPage.className = 'page';
    salariesPage.id = 'salaries-page';
    salariesPage.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">سجل الرواتب</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" placeholder="بحث عن راتب..." type="text" id="salary-search" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-success" id="pay-salary-btn">
                    <i class="fas fa-hand-holding-usd"></i>
                    <span>صرف راتب</span>
                </button>
            </div>
        </div>
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">سجل الرواتب</h2>
                <div class="section-actions">
                    <div class="btn-group">
                        <button class="btn btn-outline btn-sm active" data-period="all">الكل</button>
                        <button class="btn btn-outline btn-sm" data-period="current-month">الشهر الحالي</button>
                        <button class="btn btn-outline btn-sm" data-period="previous-month">الشهر السابق</button>
                    </div>
                    <button class="btn btn-outline btn-sm" id="export-salaries-btn" title="تصدير">
                        <i class="fas fa-download"></i>
                        <span>تصدير</span>
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table id="salaries-table">
                    <thead>
                        <tr>
                            <th>الموظف</th>
                            <th>التاريخ</th>
                            <th>الراتب الأساسي</th>
                            <th>المبيعات</th>
                            <th>العمولة</th>
                            <th>العلاوات</th>
                            <th>الاستقطاعات</th>
                            <th>الراتب النهائي</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // إضافة صفحة الأقساط
    const installmentsPage = document.createElement('div');
    installmentsPage.className = 'page';
    installmentsPage.id = 'installments-page';
    installmentsPage.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">نظام الأقساط</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" placeholder="بحث عن قسط..." type="text" id="installment-search" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-primary" id="add-installment-btn">
                    <i class="fas fa-plus"></i>
                    <span>إضافة قسط جديد</span>
                </button>
            </div>
        </div>
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">سجل الأقساط</h2>
                <div class="section-actions">
                    <div class="btn-group">
                        <button class="btn btn-outline btn-sm active" data-status="all">الكل</button>
                        <button class="btn btn-outline btn-sm" data-status="active">نشط</button>
                        <button class="btn btn-outline btn-sm" data-status="paid">مدفوع</button>
                        <button class="btn btn-outline btn-sm" data-status="overdue">متأخر</button>
                    </div>
                    <button class="btn btn-outline btn-sm" id="export-installments-btn" title="تصدير">
                        <i class="fas fa-download"></i>
                        <span>تصدير</span>
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table id="installments-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الموظف المسؤول</th>
                            <th>قيمة القسط</th>
                            <th>عدد الأقساط</th>
                            <th>المدفوع</th>
                            <th>المتبقي</th>
                            <th>حالة القسط</th>
                            <th>تاريخ الاستحقاق</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- تبويب تقارير الأقساط -->
        <div class="section mt-4">
            <div class="section-header">
                <h2 class="section-title">تقارير الأقساط</h2>
                <div class="section-actions">
                    <div class="btn-group">
                        <button class="btn btn-outline btn-sm active" data-report-period="monthly">شهري</button>
                        <button class="btn btn-outline btn-sm" data-report-period="quarterly">ربع سنوي</button>
                        <button class="btn btn-outline btn-sm" data-report-period="yearly">سنوي</button>
                    </div>
                </div>
            </div>
            <div class="grid-cols-2">
                <div class="chart-container">
                    <h3 class="chart-title">متابعة الأقساط</h3>
                    <canvas id="installments-chart"></canvas>
                </div>
                <div class="chart-container">
                    <h3 class="chart-title">نسبة تحصيل الأقساط</h3>
                    <canvas id="installments-collection-chart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // إضافة صفحة تقارير الموظفين
    const employeeReportsPage = document.createElement('div');
    employeeReportsPage.className = 'page';
    employeeReportsPage.id = 'employee-reports-page';
    employeeReportsPage.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">تقارير الموظفين</h1>
            <div class="header-actions">
                <div class="btn-group">
                    <button class="btn btn-outline active" data-period="monthly">شهري</button>
                    <button class="btn btn-outline" data-period="quarterly">ربع سنوي</button>
                    <button class="btn btn-outline" data-period="yearly">سنوي</button>
                </div>
                <button class="btn btn-primary" id="export-employee-report-btn">
                    <i class="fas fa-download"></i>
                    <span>تصدير التقرير</span>
                </button>
            </div>
        </div>
        <div class="grid-cols-2">
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">الرواتب الشهرية</h2>
                </div>
                <div class="chart-container">
                    <canvas id="monthly-salaries-chart"></canvas>
                </div>
            </div>
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">أداء الموظفين</h2>
                </div>
                <div class="chart-container">
                    <canvas id="employee-performance-chart"></canvas>
                </div>
            </div>
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">توزيع المبيعات</h2>
                </div>
                <div class="chart-container">
                    <canvas id="sales-distribution-chart"></canvas>
                </div>
            </div>
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">أداء الأقسام</h2>
                </div>
                <div class="chart-container">
                    <canvas id="departments-performance-chart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // إضافة الصفحات إلى العنصر الرئيسي
    mainContent.appendChild(employeesPage);
    mainContent.appendChild(salariesPage);
    mainContent.appendChild(installmentsPage);
    mainContent.appendChild(employeeReportsPage);
    
    // إضافة عنصر القائمة لصفحة تقارير الموظفين
    const reportItem = document.createElement('li');
    reportItem.className = 'nav-item';
    reportItem.innerHTML = `
        <a class="nav-link" data-page="employee-reports" href="#">
            <div class="nav-icon">
                <i class="fas fa-chart-line"></i>
            </div>
            <span>تقارير الموظفين</span>
        </a>
    `;
    
    // إضافة العنصر للقائمة مباشرة بعد الأقساط
    const settingsItem = document.querySelector('.nav-link[data-page="settings"]').parentElement;
    const navList = document.querySelector('.sidebar .nav-list');
    navList.insertBefore(reportItem, settingsItem);
    
    console.log('تمت إضافة صفحات الموظفين والرواتب والأقساط بنجاح');


// إضافة النوافذ المنبثقة للنظام
function addEmployeeModals() {
    console.log('إضافة النوافذ المنبثقة للنظام...');
    
    // التحقق من عدم وجود النوافذ مسبقًا
    if (document.getElementById('add-employee-modal')) {
        console.log('النوافذ المنبثقة موجودة بالفعل.');
        return;
    }
    
    // إضافة نافذة إضافة/تعديل موظف
    const addEmployeeModal = document.createElement('div');
    addEmployeeModal.className = 'modal-overlay';
    addEmployeeModal.id = 'add-employee-modal';
    addEmployeeModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title" id="employee-modal-title">إضافة موظف جديد</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <form id="employee-form">
                    <input type="hidden" id="employee-id">
                    
                    <div class="tabs">
                        <div class="tab-buttons">
                            <button type="button" class="tab-btn active" data-tab="personal-info">المعلومات الشخصية</button>
                            <button type="button" class="tab-btn" data-tab="job-info">المعلومات الوظيفية</button>
                            <button type="button" class="tab-btn" data-tab="documents">الوثائق</button>
                        </div>
                        
                        <!-- المعلومات الشخصية -->
                        <div class="tab-content active" id="personal-info-tab">
                            <div class="employee-avatar-container">
                                <div class="employee-avatar" id="employee-avatar-preview">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="avatar-upload">
                                    <label for="employee-avatar" class="btn btn-sm btn-primary">
                                        <i class="fas fa-upload"></i> رفع صورة
                                    </label>
                                    <input type="file" id="employee-avatar" accept="image/*" style="display:none">
                                </div>
                            </div>
                            
                            <div class="grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">الاسم الكامل <span class="required">*</span></label>
                                    <input class="form-input" id="employee-name" required type="text">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">رقم الهاتف <span class="required">*</span></label>
                                    <input class="form-input" id="employee-phone" required type="tel">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">البريد الإلكتروني</label>
                                    <input class="form-input" id="employee-email" type="email">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">تاريخ الميلاد</label>
                                    <input class="form-input" id="employee-birthdate" type="date">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">العنوان</label>
                                    <input class="form-input" id="employee-address" type="text">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">الجنس</label>
                                    <select class="form-select" id="employee-gender">
                                        <option value="male">ذكر</option>
                                        <option value="female">أنثى</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- المعلومات الوظيفية -->
                        <div class="tab-content" id="job-info-tab">
                            <div class="grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">المسمى الوظيفي <span class="required">*</span></label>
                                    <input class="form-input" id="employee-job-title" required type="text">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">القسم</label>
                                    <select class="form-select" id="employee-department">
                                        <option value="sales">المبيعات</option>
                                        <option value="admin">الإدارة</option>
                                        <option value="finance">المالية</option>
                                        <option value="operations">العمليات</option>
                                        <option value="it">تقنية المعلومات</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">الراتب الأساسي <span class="required">*</span></label>
                                    <input class="form-input" id="employee-salary" required type="number" min="0">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">نسبة المبيعات (%)</label>
                                    <input class="form-input" id="employee-commission" type="number" min="0" max="100" step="0.5" value="0">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">تاريخ التعيين <span class="required">*</span></label>
                                    <input class="form-input" id="employee-hire-date" required type="date">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">نوع العقد</label>
                                    <select class="form-select" id="employee-contract-type">
                                        <option value="full-time">دوام كامل</option>
                                        <option value="part-time">دوام جزئي</option>
                                        <option value="temporary">عقد مؤقت</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">حالة الموظف</label>
                                    <select class="form-select" id="employee-status">
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- الوثائق -->
                        <div class="tab-content" id="documents-tab">
                            <div class="grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">رقم البطاقة الوطنية</label>
                                    <input class="form-input" id="employee-id-number" type="text">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">رقم بطاقة السكن</label>
                                    <input class="form-input" id="employee-residence-card" type="text">
                                </div>
                            </div>
                            
                            <div class="document-upload-container">
                                <div class="document-upload">
                                    <label>صورة البطاقة الوطنية</label>
                                    <div class="document-preview" id="id-card-preview">
                                        <i class="fas fa-id-card"></i>
                                        <span>لم يتم رفع صورة</span>
                                    </div>
                                    <label for="id-card-upload" class="btn btn-sm btn-primary">
                                        <i class="fas fa-upload"></i> رفع صورة
                                    </label>
                                    <input type="file" id="id-card-upload" accept="image/*" style="display:none">
                                </div>
                                
                                <div class="document-upload">
                                    <label>صورة بطاقة السكن</label>
                                    <div class="document-preview" id="residence-card-preview">
                                        <i class="fas fa-home"></i>
                                        <span>لم يتم رفع صورة</span>
                                    </div>
                                    <label for="residence-card-upload" class="btn btn-sm btn-primary">
                                        <i class="fas fa-upload"></i> رفع صورة
                                    </label>
                                    <input type="file" id="residence-card-upload" accept="image/*" style="display:none">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">ملاحظات إضافية</label>
                                <textarea class="form-input" id="employee-notes" rows="3"></textarea>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-primary" id="save-employee-btn">حفظ</button>
            </div>
        </div>
    `;
}
    // إضافة نافذة إضافة/تعديل قسط
    // إضافة نافذة دفع راتب
    const paySalaryModal = document.createElement('div');
    paySalaryModal.className = 'modal-overlay';
    paySalaryModal.id = 'pay-salary-modal';
    paySalaryModal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">صرف راتب</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <form id="salary-form">
                    <div class="form-group">
                        <label class="form-label">الموظف <span class="required">*</span></label>
                        <select class="form-select" id="salary-employee" required>
                            <option value="">اختر الموظف</option>
                            <!-- سيتم ملؤها ديناميكيًا -->
                        </select>
                    </div>
                    
                    <div id="employee-salary-details" style="display:none;">
                        <div class="employee-salary-info">
                            <div class="employee-info">
                                <div class="employee-avatar-small" id="salary-employee-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="employee-data">
                                    <h4 id="salary-employee-name">-</h4>
                                    <p id="salary-employee-jobtitle">-</p>
                                </div>
                            </div>
                            <div class="salary-basic-info">
                                <div class="info-item">
                                    <span class="info-label">الراتب الأساسي:</span>
                                    <span class="info-value" id="salary-basic-amount">-</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">نسبة العمولة:</span>
                                    <span class="info-value" id="salary-commission-rate">-</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid-cols-2">
                            <div class="form-group">
                                <label class="form-label">شهر الراتب <span class="required">*</span></label>
                                <input class="form-input" id="salary-month" required type="month">
                            </div>
                            <div class="form-group">
                                <label class="form-label">تاريخ الصرف <span class="required">*</span></label>
                                <input class="form-input" id="salary-date" required type="date">
                            </div>
                            <div class="form-group">
                                <label class="form-label">إجمالي المبيعات</label>
                                <input class="form-input" id="salary-sales" type="number" min="0" value="0">
                            </div>
                            <div class="form-group">
                                <label class="form-label">قيمة العمولة</label>
                                <input class="form-input" id="salary-commission" type="number" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label">العلاوات</label>
                                <input class="form-input" id="salary-bonus" type="number" min="0" value="0">
                            </div>
                            <div class="form-group">
                                <label class="form-label">الاستقطاعات</label>
                                <input class="form-input" id="salary-deductions" type="number" min="0" value="0">
                            </div>
                        </div>
                        
                        <div class="salary-summary">
                            <div class="summary-title">ملخص الراتب</div>
                            <div class="summary-items">
                                <div class="summary-item">
                                    <span class="summary-label">الراتب الأساسي:</span>
                                    <span class="summary-value" id="summary-basic-salary">0</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">العمولة:</span>
                                    <span class="summary-value" id="summary-commission">0</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">العلاوات:</span>
                                    <span class="summary-value" id="summary-bonus">0</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">الاستقطاعات:</span>
                                    <span class="summary-value" id="summary-deductions">0</span>
                                </div>
                                <div class="summary-item total">
                                    <span class="summary-label">إجمالي الراتب:</span>
                                    <span class="summary-value" id="summary-total">0</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-input" id="salary-notes" rows="2"></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-success" id="save-salary-btn">صرف الراتب</button>
            </div>
        </div>
    `;

    /**
 * Continuation of employees-installments.js
 * نظام إدارة الموظفين والأقساط المتكامل - تكملة الكود
 */

// إضافة أنماط CSS للموظفين والأقساط (تكملة)
function addEmployeeStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('employee-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'employee-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* أنماط صفحة الموظفين */
        .employee-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background-color: #f0f4ff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: #3b82f6;
            overflow: hidden;
            margin-bottom: 10px;
        }
        
        .employee-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .employee-avatar-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .employee-avatar-small {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #f0f4ff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            color: #3b82f6;
            overflow: hidden;
        }
        
        .employee-avatar-small img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .employee-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .employee-data h4 {
            margin: 0;
            font-size: 1.1rem;
        }
        
        .employee-data p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .employee-salary-info {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
        }
        
        .salary-basic-info {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .info-item {
            display: flex;
            gap: 5px;
        }
        
        .info-label {
            font-weight: 500;
            color: #4b5563;
        }
        
        .info-value {
            color: #1f2937;
        }
        
        .salary-summary {
            background-color: #f0f4ff;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .summary-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: #1f2937;
        }
        
        .summary-items {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
        }
        
        .summary-item.total {
            border-top: 1px solid #d1d5db;
            padding-top: 8px;
            margin-top: 5px;
            font-weight: 600;
        }
        
        .document-upload-container {
            display: flex;
            gap: 20px;
            margin: 15px 0;
        }
        
        .document-upload {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .document-preview {
            width: 150px;
            height: 100px;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            overflow: hidden;
        }
        
        .document-preview i {
            font-size: 1.5rem;
            margin-bottom: 5px;
        }
        
        .document-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .required {
            color: #ef4444;
        }
        
        .mt-4 {
            margin-top: 1.5rem;
        }
        
        /* أنماط إيصال الراتب */
        .salary-receipt {
            background-color: white;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .receipt-header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .receipt-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .receipt-section {
            margin-bottom: 20px;
        }
        
        .receipt-section-title {
            font-weight: 600;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        
        .receipt-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
        }
        
        .receipt-total {
            font-weight: 600;
            border-top: 2px solid #e5e7eb;
            padding-top: 10px;
            margin-top: 10px;
        }
        
        .receipt-footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        /* أنماط تفاصيل الموظف */
        .employee-details-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .employee-details-header {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .employee-personal-info {
            flex: 1;
        }
        
        .employee-title {
            font-size: 1.5rem;
            margin: 0 0 5px 0;
        }
        
        .employee-subtitle {
            color: #6b7280;
            margin: 0;
        }
        
        .employee-badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .badge-active {
            background-color: #d1fae5;
            color: #065f46;
        }
        
        .badge-inactive {
            background-color: #fee2e2;
            color: #991b1b;
        }
        
        .employee-details-section {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .section-header {
            background-color: #f9fafb;
            padding: 10px 15px;
            font-weight: 600;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .section-content {
            padding: 15px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .info-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .info-group-label {
            font-weight: 500;
            color: #4b5563;
            font-size: 0.9rem;
        }
        
        .info-group-value {
            color: #1f2937;
        }
        
        .document-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .document-card-image {
            height: 150px;
            overflow: hidden;
        }
        
        .document-card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .document-card-title {
            padding: 10px;
            background-color: #f9fafb;
            font-weight: 500;
            font-size: 0.9rem;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .documents-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 10px;
        }
        
        @media print {
            body * {
                visibility: hidden;
            }
            
            #print-salary-modal .modal,
            #print-salary-modal .modal * {
                visibility: visible;
            }
            
            #print-salary-modal .modal {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: white;
                box-shadow: none;
            }
            
            #print-salary-modal .modal-header,
            #print-salary-modal .modal-footer {
                display: none;
            }
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للموظفين والأقساط');
}

// إعداد مستمعي الأحداث
function setupEmployeeEventListeners() {
    console.log('إعداد مستمعي الأحداث للنظام...');
    
    // إعداد مستمعي الأحداث للتنقل
    setupNavigationListeners();
    
    // إعداد مستمعي الأحداث للموظفين
    setupEmployeesListeners();
    
    // إعداد مستمعي الأحداث للرواتب
    setupSalariesListeners();
    
    // إعداد مستمعي الأحداث للأقساط
    setupInstallmentsListeners();
    
    // إعداد مستمعي الأحداث للتبويبات
    setupTabsListeners();
    
    console.log('تم إعداد مستمعي الأحداث بنجاح');
}

// إعداد مستمعي الأحداث للتنقل
function setupNavigationListeners() {
    // التنقل بين الصفحات
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        // إضافة مستمع حدث للروابط الجديدة فقط
        if (!link.hasListener) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const pageId = this.getAttribute('data-page');
                
                // استدعاء دالة عرض الصفحة إذا كانت موجودة
                if (typeof window.showPage === 'function') {
                    window.showPage(pageId);
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
                    
                    // تحديث حالة التنقل
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                    });
                    
                    this.classList.add('active');
                }
            });
            
            // تعليم الرابط بأنه تمت إضافة مستمع الحدث
            link.hasListener = true;
        }
    });
}

// إعداد مستمعي الأحداث للتبويبات
function setupTabsListeners() {
    // التبديل بين التبويبات
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        // إضافة مستمع حدث للأزرار الجديدة فقط
        if (!btn.hasListener) {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // إزالة الفئة النشطة من جميع أزرار التبويبات
                this.parentElement.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active');
                });
                
                // إضافة الفئة النشطة لهذا الزر
                this.classList.add('active');
                
                // إزالة الفئة النشطة من جميع محتويات التبويبات
                const tabContainer = this.closest('.tabs');
                if (tabContainer) {
                    tabContainer.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    // إضافة الفئة النشطة لمحتوى التبويب المطلوب
                    const targetTab = tabContainer.querySelector(`#${tabId}-tab`);
                    if (targetTab) {
                        targetTab.classList.add('active');
                    }
                }
            });
            
            // تعليم الزر بأنه تمت إضافة مستمع الحدث
            btn.hasListener = true;
        }
    });
}

// إعداد مستمعي الأحداث للموظفين
function setupEmployeesListeners() {
    // فتح نافذة إضافة موظف جديد
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    if (addEmployeeBtn && !addEmployeeBtn.hasListener) {
        addEmployeeBtn.addEventListener('click', () => {
            openAddEmployeeModal();
        });
        addEmployeeBtn.hasListener = true;
    }
    
    // حفظ بيانات الموظف
    const saveEmployeeBtn = document.getElementById('save-employee-btn');
    if (saveEmployeeBtn && !saveEmployeeBtn.hasListener) {
        saveEmployeeBtn.addEventListener('click', () => {
            saveEmployee();
        });
        saveEmployeeBtn.hasListener = true;
    }
    
    // إغلاق النوافذ المنبثقة
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        if (!btn.hasListener) {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal-overlay');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
            btn.hasListener = true;
        }
    });
    
    // مستمعي الأحداث للبحث والتصفية في صفحة الموظفين
    setupEmployeeSearchAndFilter();
    
    // مستمع حدث تصدير بيانات الموظفين
    const exportEmployeesBtn = document.getElementById('export-employees-btn');
    if (exportEmployeesBtn && !exportEmployeesBtn.hasListener) {
        exportEmployeesBtn.addEventListener('click', () => {
            exportEmployeesToExcel();
        });
        exportEmployeesBtn.hasListener = true;
    }
}

// إعداد البحث والتصفية في صفحة الموظفين
function setupEmployeeSearchAndFilter() {
    // مستمع حدث البحث
    const employeeSearch = document.getElementById('employee-search');
    if (employeeSearch && !employeeSearch.hasListener) {
        employeeSearch.addEventListener('input', function() {
            const searchText = this.value.trim().toLowerCase();
            filterEmployeesTable(searchText);
        });
        employeeSearch.hasListener = true;
    }
    
    // مستمعي أحداث أزرار التصفية
    const filterButtons = document.querySelectorAll('#employees-page .btn-group .btn[data-filter]');
    filterButtons.forEach(btn => {
        if (!btn.hasListener) {
            btn.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع الأزرار
                filterButtons.forEach(b => b.classList.remove('active'));
                
                // إضافة الفئة النشطة لهذا الزر
                this.classList.add('active');
                
                // تطبيق التصفية
                const filter = this.getAttribute('data-filter');
                const searchText = document.getElementById('employee-search')?.value.trim().toLowerCase() || '';
                filterEmployeesTable(searchText, filter);
            });
            btn.hasListener = true;
        }
    });
}

// تصفية جدول الموظفين
function filterEmployeesTable(searchText = '', filter = 'all') {
    const tableRows = document.querySelectorAll('#employees-table tbody tr');
    
    tableRows.forEach(row => {
        const employeeName = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        const employeePhone = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
        const employeeJobTitle = row.querySelector('td:nth-child(4)')?.textContent.toLowerCase() || '';
        const employeeStatus = row.querySelector('td:nth-child(8)')?.textContent.toLowerCase() || '';
        
        const matchesSearch = !searchText || 
            employeeName.includes(searchText) || 
            employeePhone.includes(searchText) || 
            employeeJobTitle.includes(searchText);
        
        const matchesFilter = filter === 'all' || 
            (filter === 'active' && employeeStatus.includes('نشط')) || 
            (filter === 'inactive' && employeeStatus.includes('غير نشط'));
        
        row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    });
}

// إعداد مستمعي الأحداث للرواتب
function setupSalariesListeners() {
    // فتح نافذة دفع راتب
    const paySalaryBtn = document.getElementById('pay-salary-btn');
    if (paySalaryBtn && !paySalaryBtn.hasListener) {
        paySalaryBtn.addEventListener('click', () => {
            openPaySalaryModal();
        });
        paySalaryBtn.hasListener = true;
    }
    
    // حفظ بيانات الراتب
    const saveSalaryBtn = document.getElementById('save-salary-btn');
    if (saveSalaryBtn && !saveSalaryBtn.hasListener) {
        saveSalaryBtn.addEventListener('click', () => {
            saveSalary();
        });
        saveSalaryBtn.hasListener = true;
    }
    
    // مستمع حدث اختيار الموظف لصرف الراتب
    const salaryEmployeeSelect = document.getElementById('salary-employee');
    if (salaryEmployeeSelect && !salaryEmployeeSelect.hasListener) {
        salaryEmployeeSelect.addEventListener('change', function() {
            updateSalaryEmployeeDetails(this.value);
        });
        salaryEmployeeSelect.hasListener = true;
    }
    
    // مستمع حدث تغيير قيمة المبيعات
    const salarySalesInput = document.getElementById('salary-sales');
    if (salarySalesInput && !salarySalesInput.hasListener) {
        salarySalesInput.addEventListener('input', function() {
            updateSalaryCommission();
        });
        salarySalesInput.hasListener = true;
    }
    
    // مستمعي أحداث العلاوات والاستقطاعات
    const salaryBonusInput = document.getElementById('salary-bonus');
    const salaryDeductionsInput = document.getElementById('salary-deductions');
    
    if (salaryBonusInput && !salaryBonusInput.hasListener) {
        salaryBonusInput.addEventListener('input', updateSalarySummary);
        salaryBonusInput.hasListener = true;
    }
    
    if (salaryDeductionsInput && !salaryDeductionsInput.hasListener) {
        salaryDeductionsInput.addEventListener('input', updateSalarySummary);
        salaryDeductionsInput.hasListener = true;
    }
    
    // مستمع حدث طباعة إيصال الراتب
    const printSalaryBtn = document.getElementById('print-salary-btn');
    if (printSalaryBtn && !printSalaryBtn.hasListener) {
        printSalaryBtn.addEventListener('click', function() {
            printSalaryReceipt();
        });
        printSalaryBtn.hasListener = true;
    }
    
    // مستمعي الأحداث للبحث والتصفية في صفحة الرواتب
    setupSalarySearchAndFilter();
}

// إعداد البحث والتصفية في صفحة الرواتب
function setupSalarySearchAndFilter() {
    // مستمع حدث البحث
    const salarySearch = document.getElementById('salary-search');
    if (salarySearch && !salarySearch.hasListener) {
        salarySearch.addEventListener('input', function() {
            const searchText = this.value.trim().toLowerCase();
            filterSalariesTable(searchText);
        });
        salarySearch.hasListener = true;
    }
    
    // مستمعي أحداث أزرار التصفية
    const periodButtons = document.querySelectorAll('#salaries-page .btn-group .btn[data-period]');
    periodButtons.forEach(btn => {
        if (!btn.hasListener) {
            btn.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع الأزرار
                periodButtons.forEach(b => b.classList.remove('active'));
                
                // إضافة الفئة النشطة لهذا الزر
                this.classList.add('active');
                
                // تطبيق التصفية
                const period = this.getAttribute('data-period');
                const searchText = document.getElementById('salary-search')?.value.trim().toLowerCase() || '';
                filterSalariesTable(searchText, period);
            });
            btn.hasListener = true;
        }
    });
}

// تصفية جدول الرواتب
function filterSalariesTable(searchText = '', period = 'all') {
    const tableRows = document.querySelectorAll('#salaries-table tbody tr');
    
    // الحصول على تاريخ بداية الفترة
    let startDate = null;
    if (period === 'current-month') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'previous-month') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    }
    
    tableRows.forEach(row => {
        const employeeName = row.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || '';
        const salaryDate = row.querySelector('td:nth-child(2)')?.textContent || '';
        
        const matchesSearch = !searchText || employeeName.includes(searchText);
        
        let matchesPeriod = true;
        if (period !== 'all' && salaryDate) {
            const rowDate = new Date(salaryDate);
            
            if (period === 'current-month') {
                const now = new Date();
                matchesPeriod = rowDate.getMonth() === now.getMonth() && 
                                rowDate.getFullYear() === now.getFullYear();
            } else if (period === 'previous-month') {
                const now = new Date();
                const previousMonth = now.getMonth() - 1 < 0 ? 11 : now.getMonth() - 1;
                const yearToCheck = previousMonth === 11 ? now.getFullYear() - 1 : now.getFullYear();
                matchesPeriod = rowDate.getMonth() === previousMonth && 
                                rowDate.getFullYear() === yearToCheck;
            }
        }
        
        row.style.display = matchesSearch && matchesPeriod ? '' : 'none';
    });
}

// إعداد مستمعي الأحداث للأقساط
function setupInstallmentsListeners() {
    // فتح نافذة إضافة قسط جديد
    const addInstallmentBtn = document.getElementById('add-installment-btn');
    if (addInstallmentBtn && !addInstallmentBtn.hasListener) {
        addInstallmentBtn.addEventListener('click', () => {
            openAddInstallmentModal();
        });
        addInstallmentBtn.hasListener = true;
    }
    
    // حفظ بيانات القسط
    const saveInstallmentBtn = document.getElementById('save-installment-btn');
    if (saveInstallmentBtn && !saveInstallmentBtn.hasListener) {
        saveInstallmentBtn.addEventListener('click', () => {
            saveInstallment();
        });
        saveInstallmentBtn.hasListener = true;
    }
    
    // مستمعي أحداث تغيير بيانات القسط
    setupInstallmentCalculationListeners();
    
    // مستمعي الأحداث للبحث والتصفية في صفحة الأقساط
    setupInstallmentSearchAndFilter();
}

// إعداد مستمعي أحداث حساب القسط
function setupInstallmentCalculationListeners() {
    // قائمة الحقول التي تؤثر على حساب القسط
    const calculationFields = [
        'installment-total-amount',
        'installment-down-payment',
        'installment-count',
        'installment-period',
        'installment-start-date'
    ];
    
    calculationFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.hasListener) {
            field.addEventListener('input', function() {
                calculateInstallmentDetails();
            });
            field.hasListener = true;
        }
    });
}

// إعداد البحث والتصفية في صفحة الأقساط
function setupInstallmentSearchAndFilter() {
    // مستمع حدث البحث
    const installmentSearch = document.getElementById('installment-search');
    if (installmentSearch && !installmentSearch.hasListener) {
        installmentSearch.addEventListener('input', function() {
            const searchText = this.value.trim().toLowerCase();
            filterInstallmentsTable(searchText);
        });
        installmentSearch.hasListener = true;
    }
    
    // مستمعي أحداث أزرار التصفية
    const statusButtons = document.querySelectorAll('#installments-page .btn-group .btn[data-status]');
    statusButtons.forEach(btn => {
        if (!btn.hasListener) {
            btn.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع الأزرار
                statusButtons.forEach(b => b.classList.remove('active'));
                
                // إضافة الفئة النشطة لهذا الزر
                this.classList.add('active');
                
                // تطبيق التصفية
                const status = this.getAttribute('data-status');
                const searchText = document.getElementById('installment-search')?.value.trim().toLowerCase() || '';
                filterInstallmentsTable(searchText, status);
            });
            btn.hasListener = true;
        }
    });
}

// تصفية جدول الأقساط
function filterInstallmentsTable(searchText = '', status = 'all') {
    const tableRows = document.querySelectorAll('#installments-table tbody tr');
    
    tableRows.forEach(row => {
        const customerName = row.querySelector('td:nth-child(1)')?.textContent.toLowerCase() || '';
        const employeeName = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        const installmentStatus = row.querySelector('td:nth-child(7)')?.textContent.toLowerCase() || '';
        
        const matchesSearch = !searchText || 
            customerName.includes(searchText) || 
            employeeName.includes(searchText);
        
        const matchesStatus = status === 'all' || 
            (status === 'active' && (installmentStatus.includes('نشط') || installmentStatus.includes('جاري'))) || 
            (status === 'paid' && installmentStatus.includes('مدفوع')) || 
            (status === 'overdue' && installmentStatus.includes('متأخر'));
        
        row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
}

// إعداد نظام رفع الصور
function setupImageUpload() {
    console.log('إعداد نظام رفع الصور...');
    
    // رفع صورة الموظف
    const employeeAvatarInput = document.getElementById('employee-avatar');
    if (employeeAvatarInput && !employeeAvatarInput.hasListener) {
        employeeAvatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('employee-avatar-preview');
                    if (preview) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="صورة الموظف">`;
                        
                        // تخزين الصورة في متغير مؤقت
                        window.tempEmployeeAvatar = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        employeeAvatarInput.hasListener = true;
    }
    
    // رفع صورة البطاقة الوطنية
    const idCardInput = document.getElementById('id-card-upload');
    if (idCardInput && !idCardInput.hasListener) {
        idCardInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('id-card-preview');
                    if (preview) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="صورة البطاقة الوطنية">`;
                        
                        // تخزين الصورة في متغير مؤقت
                        window.tempIdCard = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        idCardInput.hasListener = true;
    }
    
    // رفع صورة بطاقة السكن
    const residenceCardInput = document.getElementById('residence-card-upload');
    if (residenceCardInput && !residenceCardInput.hasListener) {
        residenceCardInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('residence-card-preview');
                    if (preview) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="صورة بطاقة السكن">`;
                        
                        // تخزين الصورة في متغير مؤقت
                        window.tempResidenceCard = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        residenceCardInput.hasListener = true;
    }
}

// فتح نافذة إضافة موظف جديد
function openAddEmployeeModal(employeeId = null) {
    console.log('فتح نافذة إضافة موظف جديد...');
    
    const modal = document.getElementById('add-employee-modal');
    if (!modal) return;
    
    // إعادة تعيين النموذج
    const form = document.getElementById('employee-form');
    if (form) form.reset();
    
    // مسح الصور المؤقتة
    window.tempEmployeeAvatar = null;
    window.tempIdCard = null;
    window.tempResidenceCard = null;
    
    // إعادة تعيين معاينات الصور
    const avatarPreview = document.getElementById('employee-avatar-preview');
    if (avatarPreview) avatarPreview.innerHTML = '<i class="fas fa-user"></i>';
    
    const idCardPreview = document.getElementById('id-card-preview');
    if (idCardPreview) {
        idCardPreview.innerHTML = '<i class="fas fa-id-card"></i><span>لم يتم رفع صورة</span>';
    }
    
    const residenceCardPreview = document.getElementById('residence-card-preview');
    if (residenceCardPreview) {
        residenceCardPreview.innerHTML = '<i class="fas fa-home"></i><span>لم يتم رفع صورة</span>';
    }
    
    // تحديث عنوان النافذة وزر الحفظ
    const modalTitle = document.getElementById('employee-modal-title');
    if (modalTitle) modalTitle.textContent = employeeId ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد';
    
    const saveBtn = document.getElementById('save-employee-btn');
    if (saveBtn) saveBtn.textContent = employeeId ? 'حفظ التعديلات' : 'حفظ';
    
    // إذا كان هناك معرف موظف، قم بتحميل بياناته
    if (employeeId) {
        loadEmployeeForEditing(employeeId);
    } else {
        // تعيين تاريخ اليوم كتاريخ افتراضي للتعيين
        const hireDateInput = document.getElementById('employee-hire-date');
        if (hireDateInput) hireDateInput.value = new Date().toISOString().split('T')[0];
        
        // تعيين معرف الموظف
        const employeeIdInput = document.getElementById('employee-id');
        if (employeeIdInput) employeeIdInput.value = '';
    }
    
    // إظهار النافذة
    modal.classList.add('active');
}

// تحميل بيانات الموظف للتعديل
function loadEmployeeForEditing(employeeId) {
    console.log(`تحميل بيانات الموظف للتعديل: ${employeeId}`);
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على بيانات الموظف', 'error');
        return;
    }
    
    // تعيين معرف الموظف
    const employeeIdInput = document.getElementById('employee-id');
    if (employeeIdInput) employeeIdInput.value = employee.id;
    
    // تعبئة المعلومات الشخصية
    document.getElementById('employee-name')?.setAttribute('value', employee.name || '');
    document.getElementById('employee-phone')?.setAttribute('value', employee.phone || '');
    document.getElementById('employee-email')?.setAttribute('value', employee.email || '');
    document.getElementById('employee-birthdate')?.setAttribute('value', employee.birthdate || '');
    document.getElementById('employee-address')?.setAttribute('value', employee.address || '');
    
    const genderSelect = document.getElementById('employee-gender');
    if (genderSelect && employee.gender) {
        genderSelect.value = employee.gender;
    }
    
    // تعبئة المعلومات الوظيفية
    document.getElementById('employee-job-title')?.setAttribute('value', employee.jobTitle || '');
    
    const departmentSelect = document.getElementById('employee-department');
    if (departmentSelect && employee.department) {
        departmentSelect.value = employee.department;
    }
    
    document.getElementById('employee-salary')?.setAttribute('value', employee.salary || '');
    document.getElementById('employee-commission')?.setAttribute('value', employee.commission || '');
    document.getElementById('employee-hire-date')?.setAttribute('value', employee.hireDate || '');
    
    const contractTypeSelect = document.getElementById('employee-contract-type');
    if (contractTypeSelect && employee.contractType) {
        contractTypeSelect.value = employee.contractType;
    }
    
    const statusSelect = document.getElementById('employee-status');
    if (statusSelect && employee.status) {
        statusSelect.value = employee.status;
    }
    
    // تعبئة معلومات الوثائق
    document.getElementById('employee-id-number')?.setAttribute('value', employee.idNumber || '');
    document.getElementById('employee-residence-card')?.setAttribute('value', employee.residenceCard || '');
    document.getElementById('employee-notes')?.innerHTML = employee.notes || '';
    
    // عرض الصور إذا كانت موجودة
    if (employee.avatarImage) {
        const avatarPreview = document.getElementById('employee-avatar-preview');
        if (avatarPreview) {
            avatarPreview.innerHTML = `<img src="${employee.avatarImage}" alt="صورة الموظف">`;
            window.tempEmployeeAvatar = employee.avatarImage;
        }
    }
    
    if (employee.idCardImage) {
        const idCardPreview = document.getElementById('id-card-preview');
        if (idCardPreview) {
            idCardPreview.innerHTML = `<img src="${employee.idCardImage}" alt="صورة البطاقة الوطنية">`;
            window.tempIdCard = employee.idCardImage;
        }
    }
    
    if (employee.residenceCardImage) {
        const residenceCardPreview = document.getElementById('residence-card-preview');
        if (residenceCardPreview) {
            residenceCardPreview.innerHTML = `<img src="${employee.residenceCardImage}" alt="صورة بطاقة السكن">`;
            window.tempResidenceCard = employee.residenceCardImage;
        }
    }
}

// حفظ بيانات الموظف
function saveEmployee() {
    console.log('حفظ بيانات الموظف...');
    
    // التحقق من صحة النموذج
    const form = document.getElementById('employee-form');
    if (!form) {
        showNotification('خطأ في النموذج', 'error');
        return;
    }
    
    // التحقق من الحقول المطلوبة
    const name = document.getElementById('employee-name')?.value;
    const phone = document.getElementById('employee-phone')?.value;
    const jobTitle = document.getElementById('employee-job-title')?.value;
    const salary = document.getElementById('employee-salary')?.value;
    const hireDate = document.getElementById('employee-hire-date')?.value;
    
    if (!name || !phone || !jobTitle || !salary || !hireDate) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // الحصول على معرف الموظف (إذا كان موجوداً)
    const employeeId = document.getElementById('employee-id')?.value;
    
    // إنشاء كائن الموظف
    const employee = {
        id: employeeId || Date.now().toString(),
        name,
        phone,
        email: document.getElementById('employee-email')?.value || '',
        birthdate: document.getElementById('employee-birthdate')?.value || '',
        address: document.getElementById('employee-address')?.value || '',
        gender: document.getElementById('employee-gender')?.value || 'male',
        
        jobTitle,
        department: document.getElementById('employee-department')?.value || 'sales',
        salary: parseFloat(salary),
        commission: parseFloat(document.getElementById('employee-commission')?.value || '0'),
        hireDate,
        contractType: document.getElementById('employee-contract-type')?.value || 'full-time',
        status: document.getElementById('employee-status')?.value || 'active',
        
        idNumber: document.getElementById('employee-id-number')?.value || '',
        residenceCard: document.getElementById('employee-residence-card')?.value || '',
        notes: document.getElementById('employee-notes')?.value || '',
        
        // إضافة الصور إذا كانت موجودة
        avatarImage: window.tempEmployeeAvatar || '',
        idCardImage: window.tempIdCard || '',
        residenceCardImage: window.tempResidenceCard || '',
        
        // تحديث تاريخ التعديل
        updatedAt: new Date().toISOString()
    };
    
    // إضافة/تحديث الموظف في المصفوفة
    if (employeeId) {
        // تحديث موظف موجود
        const index = employees.findIndex(emp => emp.id === employeeId);
        if (index !== -1) {
            // الاحتفاظ بتاريخ الإنشاء الأصلي
            employee.createdAt = employees[index].createdAt;
            
            // تحديث الموظف
            employees[index] = employee;
        } else {
            // إضافة الموظف إذا لم يتم العثور عليه
            employee.createdAt = new Date().toISOString();
            employees.push(employee);
        }
        
        showNotification(`تم تحديث بيانات الموظف ${name} بنجاح`, 'success');
    } else {
        // إضافة موظف جديد
        employee.createdAt = new Date().toISOString();
        employees.push(employee);
        
        showNotification(`تم إضافة الموظف ${name} بنجاح`, 'success');
    }
    
    // حفظ البيانات في التخزين المحلي
    saveEmployeeData();
    
    // إعادة عرض جدول الموظفين
    renderEmployeesTable();
    
    // إغلاق النافذة
    const modal = document.getElementById('add-employee-modal');
    if (modal) modal.classList.remove('active');
}

// عرض جدول الموظفين
function renderEmployeesTable() {
    console.log('عرض جدول الموظفين...');
    
    const tableBody = document.querySelector('#employees-table tbody');
    if (!tableBody) return;
    
    // مسح محتوى الجدول
    tableBody.innerHTML = '';
    
    // التحقق من وجود موظفين
    if (!employees || employees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا يوجد موظفين</td></tr>';
        return;
    }
    
    // ترتيب الموظفين حسب تاريخ التعيين (الأحدث أولاً)
    const sortedEmployees = [...employees].sort((a, b) => {
        return new Date(b.hireDate) - new Date(a.hireDate);
    });
    
    // إضافة الموظفين إلى الجدول
    sortedEmployees.forEach(employee => {
        const row = document.createElement('tr');
        
        // تحديد لون الحالة
        const statusClass = employee.status === 'active' ? 'success' : 'danger';
        const statusText = employee.status === 'active' ? 'نشط' : 'غير نشط';
        
        row.innerHTML = `
            <td>
                <div class="employee-avatar-small">
                    ${employee.avatarImage ? 
                        `<img src="${employee.avatarImage}" alt="${employee.name}">` : 
                        `<i class="fas fa-user"></i>`}
                </div>
            </td>
            <td>${employee.name}</td>
            <td>${employee.phone}</td>
            <td>${employee.jobTitle}</td>
            <td>${formatCurrency(employee.salary)}</td>
            <td>${employee.commission}%</td>
            <td>${employee.hireDate}</td>
            <td><span class="badge badge-${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline view-employee" data-id="${employee.id}" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline edit-employee" data-id="${employee.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline delete-employee" data-id="${employee.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewBtn = row.querySelector('.view-employee');
        const editBtn = row.querySelector('.edit-employee');
        const deleteBtn = row.querySelector('.delete-employee');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                showEmployeeDetails(employeeId);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                openAddEmployeeModal(employeeId);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                deleteEmployee(employeeId);
            });
        }
    });
}

// حذف موظف
function deleteEmployee(employeeId) {
    console.log(`حذف الموظف: ${employeeId}`);
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // تأكيد الحذف
    if (!confirm(`هل أنت متأكد من حذف الموظف "${employee.name}"؟`)) {
        return;
    }
    
    // حذف الموظف من المصفوفة
    employees = employees.filter(emp => emp.id !== employeeId);
    
    // حفظ البيانات في التخزين المحلي
    saveEmployeeData();
    
    // إعادة عرض جدول الموظفين
    renderEmployeesTable();
    
    showNotification(`تم حذف الموظف ${employee.name} بنجاح`, 'success');
}

// عرض تفاصيل الموظف
function showEmployeeDetails(employeeId) {
    console.log(`عرض تفاصيل الموظف: ${employeeId}`);
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // تحديد النص والألوان حسب الحالة
    const statusText = employee.status === 'active' ? 'نشط' : 'غير نشط';
    const statusClass = employee.status === 'active' ? 'active' : 'inactive';
    
    // ترجمة نوع العقد
    let contractTypeText = 'دوام كامل';
    if (employee.contractType === 'part-time') contractTypeText = 'دوام جزئي';
    else if (employee.contractType === 'temporary') contractTypeText = 'عقد مؤقت';
    
    // ترجمة القسم
    let departmentText = 'المبيعات';
    if (employee.department === 'admin') departmentText = 'الإدارة';
    else if (employee.department === 'finance') departmentText = 'المالية';
    else if (employee.department === 'operations') departmentText = 'العمليات';
    else if (employee.department === 'it') departmentText = 'تقنية المعلومات';
    
    // إنشاء محتوى تفاصيل الموظف
    const content = `
        <div class="employee-details-container">
            <div class="employee-details-header">
                <div class="employee-avatar">
                    ${employee.avatarImage ? 
                        `<img src="${employee.avatarImage}" alt="${employee.name}">` : 
                        `<i class="fas fa-user"></i>`}
                </div>
                <div class="employee-personal-info">
                    <h2 class="employee-title">${employee.name}</h2>
                    <p class="employee-subtitle">${employee.jobTitle} - ${departmentText}</p>
                    <div style="margin-top: 5px;">
                        <span class="employee-badge badge-${statusClass}">${statusText}</span>
                    </div>
                </div>
            </div>
            
            <div class="employee-details-section">
                <div class="section-header">المعلومات الشخصية</div>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-group">
                            <div class="info-group-label">رقم الهاتف</div>
                            <div class="info-group-value">${employee.phone}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">البريد الإلكتروني</div>
                            <div class="info-group-value">${employee.email || 'غير محدد'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">تاريخ الميلاد</div>
                            <div class="info-group-value">${employee.birthdate || 'غير محدد'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">العنوان</div>
                            <div class="info-group-value">${employee.address || 'غير محدد'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">الجنس</div>
                            <div class="info-group-value">${employee.gender === 'male' ? 'ذكر' : 'أنثى'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="employee-details-section">
                <div class="section-header">المعلومات الوظيفية</div>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-group">
                            <div class="info-group-label">القسم</div>
                            <div class="info-group-value">${departmentText}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">الراتب الأساسي</div>
                            <div class="info-group-value">${formatCurrency(employee.salary)}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">نسبة المبيعات</div>
                            <div class="info-group-value">${employee.commission}%</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">تاريخ التعيين</div>
                            <div class="info-group-value">${employee.hireDate}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">نوع العقد</div>
                            <div class="info-group-value">${contractTypeText}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">مدة العمل</div>
                            <div class="info-group-value">${calculateEmploymentDuration(employee.hireDate)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="employee-details-section">
                <div class="section-header">الوثائق الرسمية</div>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-group">
                            <div class="info-group-label">رقم البطاقة الوطنية</div>
                            <div class="info-group-value">${employee.idNumber || 'غير محدد'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">رقم بطاقة السكن</div>
                            <div class="info-group-value">${employee.residenceCard || 'غير محدد'}</div>
                        </div>
                    </div>
                    
                    <div class="documents-grid">
                        <div class="document-card">
                            <div class="document-card-image">
                                ${employee.idCardImage ? 
                                    `<img src="${employee.idCardImage}" alt="صورة البطاقة الوطنية">` : 
                                    '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af;"><i class="fas fa-id-card"></i><span style="margin-right:5px;">لا توجد صورة</span></div>'}
                            </div>
                            <div class="document-card-title">البطاقة الوطنية</div>
                        </div>
                        <div class="document-card">
                            <div class="document-card-image">
                                ${employee.residenceCardImage ? 
                                    `<img src="${employee.residenceCardImage}" alt="صورة بطاقة السكن">` : 
                                    '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af;"><i class="fas fa-home"></i><span style="margin-right:5px;">لا توجد صورة</span></div>'}
                            </div>
                            <div class="document-card-title">بطاقة السكن</div>
                        </div>
                    </div>
                    
                    ${employee.notes ? `
                    <div style="margin-top:15px;">
                        <div class="info-group-label">ملاحظات إضافية</div>
                        <div class="info-group-value" style="margin-top:5px;">${employee.notes}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    // عرض محتوى التفاصيل في النافذة المنبثقة
    const detailsContent = document.getElementById('employee-details-content');
    if (detailsContent) {
        detailsContent.innerHTML = content;
    }
    
    // إضافة مستمعي الأحداث لأزرار العمليات
    const editEmployeeBtn = document.getElementById('edit-employee-details-btn');
    const payEmployeeSalaryBtn = document.getElementById('pay-employee-salary-btn');
    const deleteEmployeeBtn = document.getElementById('delete-employee-details-btn');
    
    if (editEmployeeBtn) {
        editEmployeeBtn.onclick = function() {
            // إغلاق نافذة التفاصيل
            const modal = document.getElementById('employee-details-modal');
            if (modal) modal.classList.remove('active');
            
            // فتح نافذة التعديل
            openAddEmployeeModal(employeeId);
        };
    }
    
    if (payEmployeeSalaryBtn) {
        payEmployeeSalaryBtn.onclick = function() {
            // إغلاق نافذة التفاصيل
            const modal = document.getElementById('employee-details-modal');
            if (modal) modal.classList.remove('active');
            
            // فتح نافذة صرف الراتب مع اختيار الموظف مسبقًا
            openPaySalaryModal(employeeId);
        };
    }
    
    if (deleteEmployeeBtn) {
        deleteEmployeeBtn.onclick = function() {
            // إغلاق نافذة التفاصيل
            const modal = document.getElementById('employee-details-modal');
            if (modal) modal.classList.remove('active');
            
            // حذف الموظف
            deleteEmployee(employeeId);
        };
    }
    
   // إظهار النافذة المنبثقة
   const modal = document.getElementById('employee-details-modal');
   if (modal) {
       // تحديث عنوان النافذة
       const modalTitle = modal.querySelector('.modal-title');
       if (modalTitle) modalTitle.textContent = `تفاصيل الموظف - ${employee.name}`;
       
       modal.classList.add('active');
   }
}

// حساب مدة عمل الموظف
function calculateEmploymentDuration(hireDate) {
   if (!hireDate) return 'غير محدد';
   
   const startDate = new Date(hireDate);
   const now = new Date();
   
   const years = now.getFullYear() - startDate.getFullYear();
   const months = now.getMonth() - startDate.getMonth();
   const days = now.getDate() - startDate.getDate();
   
   let duration = '';
   
   if (years > 0) {
       duration += `${years} سنة`;
       if (months > 0 || (months === 0 && days > 0)) duration += ' و';
   }
   
   if (months > 0) {
       duration += `${months} شهر`;
       if (days > 0) duration += ' و';
   }
   
   if (days > 0 || (years === 0 && months === 0)) {
       duration += `${days < 0 ? days + 30 : days} يوم`;
   }
   
   return duration;
}

// تصدير بيانات الموظفين إلى ملف Excel
function exportEmployeesToExcel() {
   console.log('تصدير بيانات الموظفين إلى Excel...');
   
   // التحقق من وجود موظفين
   if (!employees || employees.length === 0) {
       showNotification('لا يوجد موظفين للتصدير', 'warning');
       return;
   }
   
   // إنشاء مصفوفة البيانات للتصدير
   const csvRows = [];
   
   // إضافة عناوين الأعمدة
   const headers = [
       'الرقم',
       'الاسم',
       'رقم الهاتف',
       'البريد الإلكتروني',
       'العنوان',
       'المسمى الوظيفي',
       'القسم',
       'الراتب الأساسي',
       'نسبة المبيعات',
       'تاريخ التعيين',
       'نوع العقد',
       'الحالة',
       'رقم البطاقة الوطنية',
       'رقم بطاقة السكن'
   ];
   
   csvRows.push(headers.join(','));
   
   // إضافة بيانات الموظفين
   employees.forEach((employee, index) => {
       const values = [
           index + 1,
           employee.name,
           employee.phone,
           employee.email || '',
           employee.address || '',
           employee.jobTitle,
           translateDepartment(employee.department),
           employee.salary,
           employee.commission,
           employee.hireDate,
           translateContractType(employee.contractType),
           employee.status === 'active' ? 'نشط' : 'غير نشط',
           employee.idNumber || '',
           employee.residenceCard || ''
       ];
       
       // تنظيف القيم للتصدير CSV
       const cleanedValues = values.map(value => {
           if (value === null || value === undefined) return '';
           value = String(value).replace(/"/g, '""');
           return value.includes(',') ? `"${value}"` : value;
       });
       
       csvRows.push(cleanedValues.join(','));
   });
   
   // إنشاء محتوى CSV
   const csvContent = csvRows.join('\n');
   
   // إنشاء Blob
   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
   
   // إنشاء رابط التنزيل
   const link = document.createElement('a');
   link.href = URL.createObjectURL(blob);
   link.download = `قائمة_الموظفين_${new Date().toISOString().split('T')[0]}.csv`;
   
   // إضافة الرابط وتنفيذ النقر
   document.body.appendChild(link);
   link.click();
   
   // تنظيف
   document.body.removeChild(link);
   
   showNotification('تم تصدير بيانات الموظفين بنجاح', 'success');
}

// ترجمة القسم
function translateDepartment(department) {
   switch (department) {
       case 'sales': return 'المبيعات';
       case 'admin': return 'الإدارة';
       case 'finance': return 'المالية';
       case 'operations': return 'العمليات';
       case 'it': return 'تقنية المعلومات';
       default: return department;
   }
}

// ترجمة نوع العقد
function translateContractType(contractType) {
   switch (contractType) {
       case 'full-time': return 'دوام كامل';
       case 'part-time': return 'دوام جزئي';
       case 'temporary': return 'عقد مؤقت';
       default: return contractType;
   }
}

// فتح نافذة دفع راتب
function openPaySalaryModal(employeeId = null) {
   console.log('فتح نافذة دفع راتب...');
   
   const modal = document.getElementById('pay-salary-modal');
   if (!modal) return;
   
   // إعادة تعيين النموذج
   const form = document.getElementById('salary-form');
   if (form) form.reset();
   
   // إخفاء تفاصيل الراتب
   const employeeSalaryDetails = document.getElementById('employee-salary-details');
   if (employeeSalaryDetails) employeeSalaryDetails.style.display = 'none';
   
   // تعيين تاريخ اليوم كتاريخ الصرف الافتراضي
   const salaryDateInput = document.getElementById('salary-date');
   if (salaryDateInput) salaryDateInput.value = new Date().toISOString().split('T')[0];
   
   // تعيين الشهر الحالي كشهر الراتب الافتراضي
   const salaryMonthInput = document.getElementById('salary-month');
   if (salaryMonthInput) {
       const now = new Date();
       salaryMonthInput.value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
   }
   
   // ملء قائمة الموظفين
   const salaryEmployeeSelect = document.getElementById('salary-employee');
   if (salaryEmployeeSelect) {
       // مسح القائمة
       salaryEmployeeSelect.innerHTML = '<option value="">اختر الموظف</option>';
       
       // إضافة الموظفين النشطين فقط
       const activeEmployees = employees.filter(emp => emp.status === 'active');
       
       // ترتيب الموظفين أبجدياً
       activeEmployees.sort((a, b) => a.name.localeCompare(b.name));
       
       // إضافة الموظفين للقائمة
       activeEmployees.forEach(employee => {
           const option = document.createElement('option');
           option.value = employee.id;
           option.textContent = employee.name;
           
           salaryEmployeeSelect.appendChild(option);
       });
       
       // اختيار الموظف إذا تم تمرير معرفه
       if (employeeId) {
           salaryEmployeeSelect.value = employeeId;
           
           // تحديث تفاصيل الموظف
           updateSalaryEmployeeDetails(employeeId);
       }
   }
   
   // إظهار النافذة
   modal.classList.add('active');
}

// تحديث تفاصيل الموظف في نافذة الراتب
function updateSalaryEmployeeDetails(employeeId) {
   console.log(`تحديث تفاصيل الموظف في نافذة الراتب: ${employeeId}`);
   
   const employeeSalaryDetails = document.getElementById('employee-salary-details');
   
   if (!employeeId) {
       // إخفاء التفاصيل إذا لم يتم اختيار موظف
       if (employeeSalaryDetails) employeeSalaryDetails.style.display = 'none';
       return;
   }
   
   // البحث عن الموظف
   const employee = employees.find(emp => emp.id === employeeId);
   if (!employee) {
       showNotification('لم يتم العثور على الموظف', 'error');
       return;
   }
   
   // تحديث تفاصيل الموظف
   const employeeAvatar = document.getElementById('salary-employee-avatar');
   const employeeName = document.getElementById('salary-employee-name');
   const employeeJobTitle = document.getElementById('salary-employee-jobtitle');
   const basicSalary = document.getElementById('salary-basic-amount');
   const commissionRate = document.getElementById('salary-commission-rate');
   
   if (employeeAvatar) {
       employeeAvatar.innerHTML = employee.avatarImage ? 
           `<img src="${employee.avatarImage}" alt="${employee.name}">` : 
           '<i class="fas fa-user"></i>';
   }
   
   if (employeeName) employeeName.textContent = employee.name;
   if (employeeJobTitle) employeeJobTitle.textContent = `${employee.jobTitle} - ${translateDepartment(employee.department)}`;
   if (basicSalary) basicSalary.textContent = formatCurrency(employee.salary);
   if (commissionRate) commissionRate.textContent = `${employee.commission}%`;
   
   // تعيين الراتب الأساسي
   const summaryBasicSalary = document.getElementById('summary-basic-salary');
   if (summaryBasicSalary) summaryBasicSalary.textContent = formatCurrency(employee.salary);
   
   // إظهار تفاصيل الموظف
   if (employeeSalaryDetails) employeeSalaryDetails.style.display = 'block';
   
   // تحديث ملخص الراتب
   updateSalaryCommission();
   updateSalarySummary();
}

// تحديث قيمة العمولة بناءً على المبيعات
function updateSalaryCommission() {
   const employeeId = document.getElementById('salary-employee')?.value;
   if (!employeeId) return;
   
   const employee = employees.find(emp => emp.id === employeeId);
   if (!employee) return;
   
   const salesAmount = parseFloat(document.getElementById('salary-sales')?.value || '0');
   const commissionRate = employee.commission / 100;
   
   const commissionAmount = salesAmount * commissionRate;
   
   // تحديث حقل العمولة
   const salaryCommissionInput = document.getElementById('salary-commission');
   if (salaryCommissionInput) salaryCommissionInput.value = commissionAmount.toFixed(2);
   
   // تحديث ملخص العمولة
   const summaryCommission = document.getElementById('summary-commission');
   if (summaryCommission) summaryCommission.textContent = formatCurrency(commissionAmount);
   
   // تحديث إجمالي الراتب
   updateSalarySummary();
}

// تحديث ملخص الراتب
function updateSalarySummary() {
   const employeeId = document.getElementById('salary-employee')?.value;
   if (!employeeId) return;
   
   const employee = employees.find(emp => emp.id === employeeId);
   if (!employee) return;
   
   const basicSalary = employee.salary;
   const commission = parseFloat(document.getElementById('salary-commission')?.value || '0');
   const bonus = parseFloat(document.getElementById('salary-bonus')?.value || '0');
   const deductions = parseFloat(document.getElementById('salary-deductions')?.value || '0');
   
   // حساب إجمالي الراتب
   const totalSalary = basicSalary + commission + bonus - deductions;
   
   // تحديث العلامات والاستقطاعات في الملخص
   const summaryBonus = document.getElementById('summary-bonus');
   const summaryDeductions = document.getElementById('summary-deductions');
   const summaryTotal = document.getElementById('summary-total');
   
   if (summaryBonus) summaryBonus.textContent = formatCurrency(bonus);
   if (summaryDeductions) summaryDeductions.textContent = formatCurrency(deductions);
   if (summaryTotal) summaryTotal.textContent = formatCurrency(totalSalary);
}

// حفظ بيانات الراتب
function saveSalary() {
   console.log('حفظ بيانات الراتب...');
   
   // التحقق من صحة النموذج
   const form = document.getElementById('salary-form');
   if (!form) {
       showNotification('خطأ في النموذج', 'error');
       return;
   }
   
   // التحقق من الحقول المطلوبة
   const employeeId = document.getElementById('salary-employee')?.value;
   const salaryMonth = document.getElementById('salary-month')?.value;
   const salaryDate = document.getElementById('salary-date')?.value;
   
   if (!employeeId || !salaryMonth || !salaryDate) {
       showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
       return;
   }
   
   // البحث عن الموظف
   const employee = employees.find(emp => emp.id === employeeId);
   if (!employee) {
       showNotification('لم يتم العثور على الموظف', 'error');
       return;
   }
   
   // الحصول على بيانات الراتب
   const basicSalary = employee.salary;
   const salesAmount = parseFloat(document.getElementById('salary-sales')?.value || '0');
   const commission = parseFloat(document.getElementById('salary-commission')?.value || '0');
   const bonus = parseFloat(document.getElementById('salary-bonus')?.value || '0');
   const deductions = parseFloat(document.getElementById('salary-deductions')?.value || '0');
   const notes = document.getElementById('salary-notes')?.value || '';
   
   // حساب إجمالي الراتب
   const totalSalary = basicSalary + commission + bonus - deductions;
   
   // إنشاء كائن الراتب
   const salary = {
       id: Date.now().toString(),
       employeeId,
       employeeName: employee.name,
       salaryMonth,
       salaryDate,
       basicSalary,
       salesAmount,
       commission,
       bonus,
       deductions,
       totalSalary,
       notes,
       createdAt: new Date().toISOString()
   };
   
   // إضافة الراتب إلى المصفوفة
   salaries.push(salary);
   
   // حفظ البيانات في التخزين المحلي
   saveEmployeeData();
   
   // عرض إيصال الراتب
   showSalaryReceipt(salary);
   
   // إعادة عرض جدول الرواتب
   renderSalariesTable();
   
   // إغلاق النافذة
   const modal = document.getElementById('pay-salary-modal');
   if (modal) modal.classList.remove('active');
   
   showNotification(`تم صرف راتب ${employee.name} بنجاح`, 'success');
}

// عرض جدول الرواتب
function renderSalariesTable() {
   console.log('عرض جدول الرواتب...');
   
   const tableBody = document.querySelector('#salaries-table tbody');
   if (!tableBody) return;
   
   // مسح محتوى الجدول
   tableBody.innerHTML = '';
   
   // التحقق من وجود رواتب
   if (!salaries || salaries.length === 0) {
       tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا يوجد رواتب</td></tr>';
       return;
   }
   
   // ترتيب الرواتب حسب التاريخ (الأحدث أولاً)
   const sortedSalaries = [...salaries].sort((a, b) => {
       return new Date(b.salaryDate) - new Date(a.salaryDate);
   });
   
   // إضافة الرواتب إلى الجدول
   sortedSalaries.forEach(salary => {
       // اختصار الشهر للعرض
       const month = new Date(salary.salaryMonth + '-01').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
       
       const row = document.createElement('tr');
       row.innerHTML = `
           <td>${salary.employeeName}</td>
           <td>${salary.salaryDate} (${month})</td>
           <td>${formatCurrency(salary.basicSalary)}</td>
           <td>${formatCurrency(salary.salesAmount)}</td>
           <td>${formatCurrency(salary.commission)}</td>
           <td>${formatCurrency(salary.bonus)}</td>
           <td>${formatCurrency(salary.deductions)}</td>
           <td>${formatCurrency(salary.totalSalary)}</td>
           <td>
               <div class="action-buttons">
                   <button class="btn btn-sm btn-outline view-salary" data-id="${salary.id}" title="عرض">
                       <i class="fas fa-eye"></i>
                   </button>
                   <button class="btn btn-sm btn-outline print-salary" data-id="${salary.id}" title="طباعة">
                       <i class="fas fa-print"></i>
                   </button>
               </div>
           </td>
       `;
       
       tableBody.appendChild(row);
       
       // إضافة مستمعي الأحداث للأزرار
       const viewBtn = row.querySelector('.view-salary');
       const printBtn = row.querySelector('.print-salary');
       
       if (viewBtn) {
           viewBtn.addEventListener('click', function() {
               const salaryId = this.getAttribute('data-id');
               showSalaryDetails(salaryId);
           });
       }
       
       if (printBtn) {
           printBtn.addEventListener('click', function() {
               const salaryId = this.getAttribute('data-id');
               const salary = salaries.find(s => s.id === salaryId);
               if (salary) {
                   showSalaryReceipt(salary);
               }
           });
       }
   });
}

// عرض تفاصيل الراتب
function showSalaryDetails(salaryId) {
   console.log(`عرض تفاصيل الراتب: ${salaryId}`);
   
   // البحث عن الراتب
   const salary = salaries.find(s => s.id === salaryId);
   if (!salary) {
       showNotification('لم يتم العثور على الراتب', 'error');
       return;
   }
   
   // عرض إيصال الراتب
   showSalaryReceipt(salary);
}

// عرض إيصال الراتب
function showSalaryReceipt(salary) {
   console.log(`عرض إيصال الراتب: ${salary.id}`);
   
   // البحث عن الموظف
   const employee = employees.find(emp => emp.id === salary.employeeId);
   
   // اختصار الشهر للعرض
   const salaryMonthDisplay = new Date(salary.salaryMonth + '-01').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
   
   // إنشاء محتوى إيصال الراتب
   const receipt = `
       <div class="salary-receipt" id="salary-receipt-content">
           <div class="receipt-header">
               <h2 style="margin:0 0 5px 0;">إيصال صرف راتب</h2>
               <p style="margin:0;color:#666;">تم الإصدار في: ${new Date().toLocaleDateString('ar-EG')}</p>
           </div>
           
           <div class="receipt-details">
               <div>
                   <h3 style="margin-bottom:10px;">بيانات الموظف</h3>
                   <div class="employee-info" style="margin-bottom:15px;">
                       <div class="employee-avatar-small">
                           ${employee && employee.avatarImage ? 
                               `<img src="${employee.avatarImage}" alt="${salary.employeeName}">` : 
                               '<i class="fas fa-user"></i>'}
                       </div>
                       <div class="employee-data">
                           <h4 style="margin:0;">${salary.employeeName}</h4>
                           <p style="margin:0;color:#666;">${employee ? employee.jobTitle : ''}</p>
                       </div>
                   </div>
                   <div style="margin-bottom:5px;"><strong>الوظيفة:</strong> ${employee ? employee.jobTitle : ''}</div>
                   <div style="margin-bottom:5px;"><strong>القسم:</strong> ${employee ? translateDepartment(employee.department) : ''}</div>
                   <div style="margin-bottom:5px;"><strong>تاريخ التعيين:</strong> ${employee ? employee.hireDate : ''}</div>
               </div>
               
               <div>
                   <h3 style="margin-bottom:10px;">تفاصيل الراتب</h3>
                   <div style="margin-bottom:5px;"><strong>شهر الراتب:</strong> ${salaryMonthDisplay}</div>
                   <div style="margin-bottom:5px;"><strong>تاريخ الصرف:</strong> ${salary.salaryDate}</div>
                   <div style="margin-bottom:5px;"><strong>رقم الإيصال:</strong> ${salary.id}</div>
               </div>
           </div>
           
           <div class="receipt-section">
               <h3 class="receipt-section-title">تفاصيل المبالغ</h3>
               
               <div class="receipt-row">
                   <div>الراتب الأساسي</div>
                   <div>${formatCurrency(salary.basicSalary)}</div>
               </div>
               
               <div class="receipt-row">
                   <div>المبيعات</div>
                   <div>${formatCurrency(salary.salesAmount)}</div>
               </div>
               
               <div class="receipt-row">
                   <div>العمولة (${employee ? employee.commission : 0}%)</div>
                   <div>${formatCurrency(salary.commission)}</div>
               </div>
               
               <div class="receipt-row">
                   <div>العلاوات</div>
                   <div>${formatCurrency(salary.bonus)}</div>
               </div>
               
               <div class="receipt-row">
                   <div>الاستقطاعات</div>
                   <div>- ${formatCurrency(salary.deductions)}</div>
               </div>
               
               <div class="receipt-row receipt-total">
                   <div>إجمالي الراتب</div>
                   <div>${formatCurrency(salary.totalSalary)}</div>
               </div>
           </div>
           
           ${salary.notes ? `
           <div class="receipt-section">
               <h3 class="receipt-section-title">ملاحظات</h3>
               <p>${salary.notes}</p>
           </div>
           ` : ''}
           
           <div class="receipt-footer">
               <p>تم إنشاء هذا الإيصال بواسطة نظام إدارة الموظفين</p>
           </div>
       </div>
   `;
   
   // عرض إيصال الراتب في النافذة المنبثقة
   const receiptContainer = document.getElementById('salary-receipt');
   if (receiptContainer) {
       receiptContainer.innerHTML = receipt;
   }
   
   // إظهار النافذة المنبثقة
   const modal = document.getElementById('print-salary-modal');
   if (modal) {
       modal.classList.add('active');
   }
}

// طباعة إيصال الراتب
function printSalaryReceipt() {
   console.log('طباعة إيصال الراتب...');
   
   window.print();
}

// فتح نافذة إضافة قسط جديد
function openAddInstallmentModal(installmentId = null) {
   console.log('فتح نافذة إضافة قسط جديد...');
   
   const modal = document.getElementById('add-installment-modal');
   if (!modal) return;
   
   // إعادة تعيين النموذج
   const form = document.getElementById('installment-form');
   if (form) form.reset();
   
   // تحديث عنوان النافذة وزر الحفظ
   const modalTitle = document.getElementById('installment-modal-title');
   if (modalTitle) modalTitle.textContent = installmentId ? 'تعديل قسط' : 'إضافة قسط جديد';
   
   const saveBtn = document.getElementById('save-installment-btn');
   if (saveBtn) saveBtn.textContent = installmentId ? 'حفظ التعديلات' : 'حفظ';
   
   // تعيين تاريخ اليوم كتاريخ بدء افتراضي
   const startDateInput = document.getElementById('installment-start-date');
   if (startDateInput) startDateInput.value = new Date().toISOString().split('T')[0];
   
   // ملء قائمة الموظفين المسؤولين
   const employeeSelect = document.getElementById('installment-employee');
   if (employeeSelect) {
       // مسح القائمة
       employeeSelect.innerHTML = '<option value="">اختر الموظف</option>';
       
       // إضافة الموظفين النشطين فقط
       const activeEmployees = employees.filter(emp => emp.status === 'active');
       
       // ترتيب الموظفين أبجدياً
       activeEmployees.sort((a, b) => a.name.localeCompare(b.name));
       
       // إضافة الموظفين للقائمة
       activeEmployees.forEach(employee => {
           const option = document.createElement('option');
           option.value = employee.id;
           option.textContent = employee.name;
           
           employeeSelect.appendChild(option);
       });
   }
   
   // إذا كان هناك معرف قسط، قم بتحميل بياناته
   if (installmentId) {
       loadInstallmentForEditing(installmentId);
   } else {
       // تعيين معرف القسط
       const installmentIdInput = document.getElementById('installment-id');
       if (installmentIdInput) installmentIdInput.value = '';
       
       // تحديث جدول الأقساط
       calculateInstallmentDetails();
   }
   
   // إظهار النافذة
   modal.classList.add('active');
}

// تحميل بيانات القسط للتعديل
function loadInstallmentForEditing(installmentId) {
   console.log(`تحميل بيانات القسط للتعديل: ${installmentId}`);
   
   // البحث عن القسط
   const installment = installments.find(inst => inst.id === installmentId);
   if (!installment) {
       showNotification('لم يتم العثور على بيانات القسط', 'error');
       return;
   }
   
   // تعيين معرف القسط
   const installmentIdInput = document.getElementById('installment-id');
   if (installmentIdInput) installmentIdInput.value = installment.id;
   
   // تعبئة بيانات القسط
   document.getElementById('installment-customer-name')?.setAttribute('value', installment.customerName || '');
   document.getElementById('installment-customer-phone')?.setAttribute('value', installment.customerPhone || '');
   
   const employeeSelect = document.getElementById('installment-employee');
   if (employeeSelect && installment.employeeId) {
       employeeSelect.value = installment.employeeId;
   }
   
   document.getElementById('installment-total-amount')?.setAttribute('value', installment.totalAmount || '');
   document.getElementById('installment-down-payment')?.setAttribute('value', installment.downPayment || '');
   document.getElementById('installment-count')?.setAttribute('value', installment.installmentCount || '');
   
   const periodSelect = document.getElementById('installment-period');
   if (periodSelect && installment.installmentPeriod) {
       periodSelect.value = installment.installmentPeriod;
   }
   
   document.getElementById('installment-start-date')?.setAttribute('value', installment.startDate || '');
   document.getElementById('installment-product-info')?.innerHTML = installment.productInfo || '';
  // تحديث جدول الأقساط
calculateInstallmentDetails();
}

// حساب تفاصيل القسط
function calculateInstallmentDetails() {
    console.log('حساب تفاصيل القسط...');
    
    // الحصول على قيم الحقول
    const totalAmount = parseFloat(document.getElementById('installment-total-amount')?.value || '0');
    const downPayment = parseFloat(document.getElementById('installment-down-payment')?.value || '0');
    const installmentCount = parseInt(document.getElementById('installment-count')?.value || '1');
    const installmentPeriod = document.getElementById('installment-period')?.value || 'monthly';
    const startDate = document.getElementById('installment-start-date')?.value;
    
    // التحقق من صحة القيم
    if (isNaN(totalAmount) || isNaN(downPayment) || isNaN(installmentCount) || !startDate) {
        return;
    }
    
    // حساب المبلغ المتبقي
    const remainingAmount = totalAmount - downPayment;
    
    // حساب قيمة القسط الواحد
    const installmentAmount = remainingAmount / installmentCount;
    
    // تحديث ملخص الأقساط
    document.getElementById('summary-total-amount')?.textContent = formatCurrency(totalAmount);
    document.getElementById('summary-down-payment')?.textContent = formatCurrency(downPayment);
    document.getElementById('summary-remaining-amount')?.textContent = formatCurrency(remainingAmount);
    document.getElementById('summary-installment-amount')?.textContent = formatCurrency(installmentAmount);
    
    // إنشاء جدول الأقساط
    generateInstallmentSchedule(startDate, installmentCount, installmentAmount, installmentPeriod);
}

// إنشاء جدول الأقساط
function generateInstallmentSchedule(startDate, count, amount, period) {
    const scheduleTable = document.getElementById('installment-schedule-table');
    if (!scheduleTable) return;
    
    const scheduleBody = scheduleTable.querySelector('tbody');
    if (!scheduleBody) return;
    
    // مسح محتوى الجدول
    scheduleBody.innerHTML = '';
    
    // التحقق من صحة القيم
    if (!startDate || count <= 0 || amount <= 0) {
        return;
    }
    
    // تحويل تاريخ البدء إلى كائن تاريخ
    const start = new Date(startDate);
    
    // إنشاء صفوف جدول الأقساط
    for (let i = 0; i < count; i++) {
        // حساب تاريخ استحقاق القسط
        const dueDate = calculateDueDate(start, i, period);
        
        // إنشاء صف جديد
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${dueDate.toISOString().split('T')[0]}</td>
            <td>${formatCurrency(amount)}</td>
            <td><span class="badge badge-primary">مستقبلي</span></td>
        `;
        
        // إضافة الصف إلى الجدول
        scheduleBody.appendChild(row);
    }
}

// حساب تاريخ استحقاق القسط
function calculateDueDate(startDate, index, period) {
    const date = new Date(startDate);
    
    switch (period) {
        case 'monthly':
            date.setMonth(date.getMonth() + index);
            break;
        case 'quarterly':
            date.setMonth(date.getMonth() + (index * 3));
            break;
        case 'semi-annual':
            date.setMonth(date.getMonth() + (index * 6));
            break;
        case 'annual':
            date.setFullYear(date.getFullYear() + index);
            break;
    }
    
    return date;
}

// حفظ بيانات القسط
function saveInstallment() {
    console.log('حفظ بيانات القسط...');
    
    // التحقق من صحة النموذج
    const form = document.getElementById('installment-form');
    if (!form) {
        showNotification('خطأ في النموذج', 'error');
        return;
    }
    
    // التحقق من الحقول المطلوبة
    const customerName = document.getElementById('installment-customer-name')?.value;
    const customerPhone = document.getElementById('installment-customer-phone')?.value;
    const totalAmount = parseFloat(document.getElementById('installment-total-amount')?.value || '0');
    const installmentCount = parseInt(document.getElementById('installment-count')?.value || '0');
    const startDate = document.getElementById('installment-start-date')?.value;
    
    if (!customerName || !customerPhone || isNaN(totalAmount) || totalAmount <= 0 || installmentCount <= 0 || !startDate) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // الحصول على معرف القسط (إذا كان موجوداً)
    const installmentId = document.getElementById('installment-id')?.value;
    
    // الحصول على بقية قيم الحقول
    const employeeId = document.getElementById('installment-employee')?.value || '';
    const employeeName = employeeId ? (employees.find(emp => emp.id === employeeId)?.name || '') : '';
    const downPayment = parseFloat(document.getElementById('installment-down-payment')?.value || '0');
    const installmentPeriod = document.getElementById('installment-period')?.value || 'monthly';
    const productInfo = document.getElementById('installment-product-info')?.value || '';
    
    // حساب المبلغ المتبقي وقيمة القسط الواحد
    const remainingAmount = totalAmount - downPayment;
    const installmentAmount = remainingAmount / installmentCount;
    
    // إنشاء جدول الأقساط
    const schedule = [];
    for (let i = 0; i < installmentCount; i++) {
        const dueDate = calculateDueDate(new Date(startDate), i, installmentPeriod);
        
        schedule.push({
            number: i + 1,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: installmentAmount,
            status: 'pending',
            paymentDate: null,
            notes: ''
        });
    }
    
    // إنشاء كائن القسط
    const installment = {
        id: installmentId || Date.now().toString(),
        customerName,
        customerPhone,
        employeeId,
        employeeName,
        totalAmount,
        downPayment,
        remainingAmount,
        installmentCount,
        installmentAmount,
        installmentPeriod,
        startDate,
        productInfo,
        schedule,
        paidAmount: downPayment,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // إضافة/تحديث القسط في المصفوفة
    if (installmentId) {
        // تحديث قسط موجود
        const index = installments.findIndex(inst => inst.id === installmentId);
        if (index !== -1) {
            // الاحتفاظ بقيم معينة من القسط الأصلي
            installment.createdAt = installments[index].createdAt;
            
            // تحديث القسط
            installments[index] = installment;
        } else {
            // إضافة القسط إذا لم يتم العثور عليه
            installments.push(installment);
        }
        
        showNotification(`تم تحديث بيانات القسط بنجاح`, 'success');
    } else {
        // إضافة قسط جديد
        installments.push(installment);
        
        showNotification(`تم إضافة القسط بنجاح`, 'success');
    }
    
    // حفظ البيانات في التخزين المحلي
    saveEmployeeData();
    
    // إعادة عرض جدول الأقساط
    renderInstallmentsTable();
    
    // إغلاق النافذة
    const modal = document.getElementById('add-installment-modal');
    if (modal) modal.classList.remove('active');
}

// عرض جدول الأقساط
function renderInstallmentsTable() {
    console.log('عرض جدول الأقساط...');
    
    const tableBody = document.querySelector('#installments-table tbody');
    if (!tableBody) return;
    
    // مسح محتوى الجدول
    tableBody.innerHTML = '';
    
    // التحقق من وجود أقساط
    if (!installments || installments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا يوجد أقساط</td></tr>';
        return;
    }
    
    // ترتيب الأقساط حسب تاريخ الإنشاء (الأحدث أولاً)
    const sortedInstallments = [...installments].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // إضافة الأقساط إلى الجدول
    sortedInstallments.forEach(installment => {
        // تحديد تاريخ الاستحقاق القادم
        const nextDue = getNextDueInstallment(installment);
        
        // تحديد حالة القسط وتنسيقها
        let statusClass = '';
        let statusText = '';
        
        switch(installment.status) {
            case 'active':
                statusClass = 'success';
                statusText = 'نشط';
                break;
            case 'paid':
                statusClass = 'info';
                statusText = 'مدفوع';
                break;
            case 'overdue':
                statusClass = 'danger';
                statusText = 'متأخر';
                break;
            default:
                statusClass = 'primary';
                statusText = 'نشط';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${installment.customerName}</td>
            <td>${installment.employeeName || 'غير محدد'}</td>
            <td>${formatCurrency(installment.totalAmount)}</td>
            <td>${installment.installmentCount}</td>
            <td>${formatCurrency(installment.paidAmount)}</td>
            <td>${formatCurrency(installment.remainingAmount)}</td>
            <td><span class="badge badge-${statusClass}">${statusText}</span></td>
            <td>${nextDue ? nextDue.dueDate : 'مكتمل'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline view-installment" data-id="${installment.id}" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline edit-installment" data-id="${installment.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline pay-installment" data-id="${installment.id}" title="دفع قسط">
                        <i class="fas fa-hand-holding-usd"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewBtn = row.querySelector('.view-installment');
        const editBtn = row.querySelector('.edit-installment');
        const payBtn = row.querySelector('.pay-installment');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                showInstallmentDetails(installmentId);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                openAddInstallmentModal(installmentId);
            });
        }
        
        if (payBtn) {
            payBtn.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                payInstallment(installmentId);
            });
        }
    });
}

// الحصول على القسط المستحق التالي
function getNextDueInstallment(installment) {
    if (!installment.schedule || installment.schedule.length === 0) {
        return null;
    }
    
    // البحث عن أول قسط غير مدفوع
    return installment.schedule.find(item => item.status === 'pending');
}

// عرض تفاصيل القسط
function showInstallmentDetails(installmentId) {
    console.log(`عرض تفاصيل القسط: ${installmentId}`);
    
    // البحث عن القسط
    const installment = installments.find(inst => inst.id === installmentId);
    if (!installment) {
        showNotification('لم يتم العثور على القسط', 'error');
        return;
    }
    
    // تحديد لون الحالة
    let statusClass = '';
    let statusText = '';
    
    switch(installment.status) {
        case 'active':
            statusClass = 'success';
            statusText = 'نشط';
            break;
        case 'paid':
            statusClass = 'info';
            statusText = 'مدفوع';
            break;
        case 'overdue':
            statusClass = 'danger';
            statusText = 'متأخر';
            break;
        default:
            statusClass = 'primary';
            statusText = 'نشط';
    }
    
    // ترجمة فترة القسط
    let periodText = 'شهري';
    if (installment.installmentPeriod === 'quarterly') periodText = 'ربع سنوي';
    else if (installment.installmentPeriod === 'semi-annual') periodText = 'نصف سنوي';
    else if (installment.installmentPeriod === 'annual') periodText = 'سنوي';
    
    // إنشاء جدول الأقساط
    let scheduleRows = '';
    if (installment.schedule && installment.schedule.length > 0) {
        installment.schedule.forEach(item => {
            // تحديد حالة القسط
            let itemStatusClass = '';
            let itemStatusText = '';
            
            switch(item.status) {
                case 'paid':
                    itemStatusClass = 'success';
                    itemStatusText = 'مدفوع';
                    break;
                case 'overdue':
                    itemStatusClass = 'danger';
                    itemStatusText = 'متأخر';
                    break;
                default:
                    itemStatusClass = 'primary';
                    itemStatusText = 'مستقبلي';
            }
            
            scheduleRows += `
                <tr>
                    <td>${item.number}</td>
                    <td>${item.dueDate}</td>
                    <td>${formatCurrency(item.amount)}</td>
                    <td><span class="badge badge-${itemStatusClass}">${itemStatusText}</span></td>
                    <td>${item.paymentDate || '-'}</td>
                </tr>
            `;
        });
    }
    
    // إنشاء محتوى التفاصيل
    const content = `
        <div class="installment-details-container">
            <div class="installment-header">
                <div class="installment-title">
                    <h2>تفاصيل القسط</h2>
                    <span class="badge badge-${statusClass}">${statusText}</span>
                </div>
                <div class="installment-date">
                    <div>تاريخ البدء: ${installment.startDate}</div>
                    <div>تاريخ الإنشاء: ${new Date(installment.createdAt).toLocaleDateString('ar-EG')}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">معلومات العميل</h3>
                </div>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-group">
                            <div class="info-group-label">اسم العميل</div>
                            <div class="info-group-value">${installment.customerName}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">رقم الهاتف</div>
                            <div class="info-group-value">${installment.customerPhone}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">الموظف المسؤول</div>
                            <div class="info-group-value">${installment.employeeName || 'غير محدد'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">تفاصيل القسط</h3>
                </div>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-group">
                            <div class="info-group-label">المبلغ الإجمالي</div>
                            <div class="info-group-value">${formatCurrency(installment.totalAmount)}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">الدفعة الأولى</div>
                            <div class="info-group-value">${formatCurrency(installment.downPayment)}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">المبلغ المتبقي</div>
                            <div class="info-group-value">${formatCurrency(installment.remainingAmount)}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">عدد الأقساط</div>
                            <div class="info-group-value">${installment.installmentCount}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">قيمة القسط الواحد</div>
                            <div class="info-group-value">${formatCurrency(installment.installmentAmount)}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">فترة السداد</div>
                            <div class="info-group-value">${periodText}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">المبلغ المدفوع</div>
                            <div class="info-group-value">${formatCurrency(installment.paidAmount)}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-group-label">المبلغ المتبقي</div>
                            <div class="info-group-value">${formatCurrency(installment.totalAmount - installment.paidAmount)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${installment.productInfo ? `
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">معلومات المنتج/الخدمة</h3>
                </div>
                <div class="section-content">
                    <p>${installment.productInfo}</p>
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">جدول الأقساط</h3>
                </div>
                <div class="section-content">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>تاريخ الاستحقاق</th>
                                    <th>قيمة القسط</th>
                                    <th>الحالة</th>
                                    <th>تاريخ الدفع</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${scheduleRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // إنشاء نافذة منبثقة لعرض التفاصيل
    showModal(`تفاصيل القسط - ${installment.customerName}`, content);
}

// دفع قسط
function payInstallment(installmentId) {
    console.log(`دفع قسط: ${installmentId}`);
    
    // البحث عن القسط
    const installment = installments.find(inst => inst.id === installmentId);
    if (!installment) {
        showNotification('لم يتم العثور على القسط', 'error');
        return;
    }
    
    // البحث عن القسط التالي المستحق
    const nextInstallment = getNextDueInstallment(installment);
    if (!nextInstallment) {
        showNotification('لا يوجد أقساط مستحقة', 'warning');
        return;
    }
    
    // تأكيد الدفع
    if (!confirm(`هل تريد تسجيل دفع القسط رقم ${nextInstallment.number} بمبلغ ${formatCurrency(nextInstallment.amount)}؟`)) {
        return;
    }
    
    // تأكيد الدفع
    if (!confirm(`هل تريد تسجيل دفع القسط رقم ${nextInstallment.number} بمبلغ ${formatCurrency(nextInstallment.amount)}؟`)) {
        return;
    }
    
    // تحديث حالة القسط
    nextInstallment.status = 'paid';
    nextInstallment.paymentDate = new Date().toISOString().split('T')[0];
    
    // تحديث المبلغ المدفوع
    installment.paidAmount += nextInstallment.amount;
    
    // تحديث حالة القسط الرئيسي
    if (installment.paidAmount >= installment.totalAmount) {
        installment.status = 'paid';
    }
    
    // تحديث تاريخ التعديل
    installment.updatedAt = new Date().toISOString();
    
    // حفظ البيانات في التخزين المحلي
    saveEmployeeData();
    
    // إعادة عرض جدول الأقساط
    renderInstallmentsTable();
    
    showNotification(`تم تسجيل دفع القسط بنجاح`, 'success');
}

// تحديث حالة الأقساط المتأخرة
function updateOverdueInstallments() {
    console.log('تحديث حالة الأقساط المتأخرة...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let updatedCount = 0;
    
    // مراجعة جميع الأقساط
    installments.forEach(installment => {
        if (installment.status === 'paid') return;
        
        let hasOverdueInstallments = false;
        
        // مراجعة جدول الأقساط
        if (installment.schedule && installment.schedule.length > 0) {
            installment.schedule.forEach(item => {
                if (item.status === 'pending') {
                    const dueDate = new Date(item.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    
                    // تحديث الحالة إذا كان القسط متأخراً
                    if (dueDate < today) {
                        item.status = 'overdue';
                        hasOverdueInstallments = true;
                        updatedCount++;
                    }
                }
            });
        }
        
        // تحديث حالة القسط الرئيسي
        if (hasOverdueInstallments) {
            installment.status = 'overdue';
            
            // تحديث تاريخ التعديل
            installment.updatedAt = new Date().toISOString();
        }
    });
    
    if (updatedCount > 0) {
        // حفظ البيانات في التخزين المحلي
        saveEmployeeData();
        
        // إعادة عرض جدول الأقساط إذا كان مرئياً
        const installmentsPage = document.getElementById('installments-page');
    }
}

// إنشاء نافذة منبثقة مخصصة
function showModal(title, content) {
    // إنشاء عناصر النافذة المنبثقة
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalOverlay.style.zIndex = '9999';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp" style="background-color: white; border-radius: 10px; max-width: 90%; width: 800px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);">
            <div class="modal-header" style="padding: 15px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                <h3 class="modal-title" style="margin: 0; font-size: 1.25rem;">${title}</h3>
                <button class="modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 20px;">
                ${content}
            </div>
            <div class="modal-footer" style="padding: 15px; border-top: 1px solid #e5e7eb; text-align: left;">
                <button class="btn btn-outline modal-close-btn" style="padding: 10px 20px; background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 5px; cursor: pointer;">إغلاق</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة للصفحة
    document.body.appendChild(modalOverlay);
    
    // إضافة مستمعي الأحداث لأزرار الإغلاق
    const closeButtons = modalOverlay.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
    });
    
    // إغلاق النافذة عند النقر خارجها
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });
    
    return modalOverlay;
}

// تنسيق العملة
function formatCurrency(amount) {
    // التعامل مع القيم غير الصحيحة
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0 دينار';
    }
    
    // تقريب المبلغ إلى رقمين عشريين
    amount = parseFloat(amount.toFixed(2));
    
    // إذا كان العدد صحيحًا، لا تُظهر الأرقام العشرية
    if (amount % 1 === 0) {
        amount = Math.floor(amount);
    }
    
    // إضافة فواصل الآلاف
    const formattedAmount = amount.toLocaleString('ar-EG');
    
    // إضافة اسم العملة
    return `${formattedAmount} دينار`;
}
// تنفيذ الوظائف عند تحميل الصفحة
window.addEventListener('load', function() {
    // تحديث حالة الأقساط المتأخرة
    updateOverdueInstallments();
    
    // تهيئة الرسوم البيانية
    initEmployeeCharts();
    
    // إعداد أزرار تصدير البيانات
    setupExportButtons();
});

// تهيئة الرسوم البيانية للموظفين والأقساط
function initEmployeeCharts() {
    console.log('تهيئة الرسوم البيانية للموظفين والأقساط...');
    
    // رسم بياني للرواتب الشهرية
    initMonthlySalariesChart();
    
    // رسم بياني لأداء الموظفين
    initEmployeePerformanceChart();
    
    // رسم بياني لتوزيع المبيعات
    initSalesDistributionChart();
    
    // رسم بياني لأداء الأقسام
    initDepartmentsPerformanceChart();
    
    // رسم بياني لمتابعة الأقساط
    initInstallmentsChart();
    
    // رسم بياني لنسبة تحصيل الأقساط
    initInstallmentsCollectionChart();
}

// تهيئة رسم بياني للرواتب الشهرية
function initMonthlySalariesChart() {
    const chartCanvas = document.getElementById('monthly-salaries-chart');
    if (!chartCanvas || !window.Chart) return;
    
    // جمع بيانات الرواتب الشهرية
    const monthlySalaryData = getMonthlySalaryData();
    
    // إنشاء الرسم البياني
    new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: monthlySalaryData.labels,
            datasets: [{
                label: 'إجمالي الرواتب',
                data: monthlySalaryData.totalSalaries,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }, {
                label: 'الرواتب الأساسية',
                data: monthlySalaryData.basicSalaries,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }, {
                label: 'العمولات',
                data: monthlySalaryData.commissions,
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'المبلغ (دينار)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'الشهر'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'الرواتب الشهرية'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

// جمع بيانات الرواتب الشهرية
function getMonthlySalaryData() {
    // الحصول على الأشهر الستة الأخيرة
    const labels = [];
    const totalSalaries = [];
    const basicSalaries = [];
    const commissions = [];
    
    const now = new Date();
    const months = [];
    
    // إنشاء قائمة الأشهر الستة الأخيرة
    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = month.toISOString().substring(0, 7); // YYYY-MM
        const monthLabel = month.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' });
        
        months.push({
            monthStr,
            monthLabel
        });
        
        labels.push(monthLabel);
        totalSalaries.push(0);
        basicSalaries.push(0);
        commissions.push(0);
    }
    
    // حساب مجموع الرواتب لكل شهر
    salaries.forEach(salary => {
        const salaryMonth = salary.salaryMonth;
        
        const monthIndex = months.findIndex(m => m.monthStr === salaryMonth);
        if (monthIndex !== -1) {
            totalSalaries[monthIndex] += salary.totalSalary;
            basicSalaries[monthIndex] += salary.basicSalary;
            commissions[monthIndex] += salary.commission;
        }
    });
    
    return {
        labels,
        totalSalaries,
        basicSalaries,
        commissions
    };
}

// تهيئة رسم بياني لأداء الموظفين
function initEmployeePerformanceChart() {
    const chartCanvas = document.getElementById('employee-performance-chart');
    if (!chartCanvas || !window.Chart) return;
    
    // جمع بيانات أداء الموظفين
    const performanceData = getEmployeePerformanceData();
    
    // إنشاء الرسم البياني
    new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: performanceData.labels,
            datasets: [{
                label: 'المبيعات',
                data: performanceData.sales,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }, {
                label: 'العمولات',
                data: performanceData.commissions,
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'المبلغ (دينار)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'الموظف'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'أداء الموظفين'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

// جمع بيانات أداء الموظفين
function getEmployeePerformanceData() {
    const labels = [];
    const sales = [];
    const commissions = [];
    
    // جمع أسماء الموظفين النشطين
    const activeEmployees = employees.filter(employee => employee.status === 'active');
    
    activeEmployees.forEach(employee => {
        // إضافة اسم الموظف
        labels.push(employee.name);
        
        // حساب إجمالي المبيعات والعمولات
        let totalSales = 0;
        let totalCommission = 0;
        
        salaries.forEach(salary => {
            if (salary.employeeId === employee.id) {
                totalSales += salary.salesAmount;
                totalCommission += salary.commission;
            }
        });
        
        sales.push(totalSales);
        commissions.push(totalCommission);
    });
    
    return {
        labels,
        sales,
        commissions
    };
}

// تهيئة رسم بياني لتوزيع المبيعات
function initSalesDistributionChart() {
    const chartCanvas = document.getElementById('sales-distribution-chart');
    if (!chartCanvas || !window.Chart) return;
    
    // جمع بيانات توزيع المبيعات
    const salesData = getSalesDistributionData();
    
    // إنشاء الرسم البياني
    new Chart(chartCanvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: salesData.labels,
            datasets: [{
                data: salesData.values,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(14, 165, 233, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'توزيع المبيعات'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// جمع بيانات توزيع المبيعات
function getSalesDistributionData() {
    const employeeSales = {};
    
    // جمع مبيعات كل موظف
    salaries.forEach(salary => {
        if (!employeeSales[salary.employeeId]) {
            employeeSales[salary.employeeId] = {
                name: salary.employeeName,
                total: 0
            };
        }
        
        employeeSales[salary.employeeId].total += salary.salesAmount;
    });
    
    // تحويل البيانات إلى مصفوفتين للتسميات والقيم
    const labels = [];
    const values = [];
    
    Object.values(employeeSales)
        .sort((a, b) => b.total - a.total)
        .slice(0, 6) // أخذ أعلى 6 موظفين
        .forEach(item => {
            labels.push(item.name);
            values.push(item.total);
        });
    
    return {
        labels,
        values
    };
}

// تهيئة رسم بياني لأداء الأقسام
function initDepartmentsPerformanceChart() {
    const chartCanvas = document.getElementById('departments-performance-chart');
    if (!chartCanvas || !window.Chart) return;
    
    // جمع بيانات أداء الأقسام
    const departmentData = getDepartmentsPerformanceData();
    
    // إنشاء الرسم البياني
    new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: departmentData.labels,
            datasets: [{
                label: 'المبيعات',
                data: departmentData.sales,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }, {
                label: 'الموظفين',
                data: departmentData.employeeCount,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'المبيعات (دينار)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'عدد الموظفين'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'القسم'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'أداء الأقسام'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

// جمع بيانات أداء الأقسام
function getDepartmentsPerformanceData() {
    const departments = {
        'sales': { label: 'المبيعات', sales: 0, employees: 0 },
        'admin': { label: 'الإدارة', sales: 0, employees: 0 },
        'finance': { label: 'المالية', sales: 0, employees: 0 },
        'operations': { label: 'العمليات', sales: 0, employees: 0 },
        'it': { label: 'تقنية المعلومات', sales: 0, employees: 0 }
    };
    
    // حساب عدد الموظفين في كل قسم
    employees.forEach(employee => {
        if (departments[employee.department]) {
            departments[employee.department].employees++;
        }
    });
    
    // حساب المبيعات لكل قسم
    salaries.forEach(salary => {
        const employee = employees.find(emp => emp.id === salary.employeeId);
        if (employee && departments[employee.department]) {
            departments[employee.department].sales += salary.salesAmount;
        }
    });
    
    // تحويل البيانات إلى مصفوفات
    const labels = Object.values(departments).map(d => d.label);
    const sales = Object.values(departments).map(d => d.sales);
    const employeeCount = Object.values(departments).map(d => d.employees);
    
    return {
        labels,
        sales,
        employeeCount
    };
}

// تهيئة رسم بياني لمتابعة الأقساط
function initInstallmentsChart() {
    const chartCanvas = document.getElementById('installments-chart');
    if (!chartCanvas || !window.Chart) return;
    
    // جمع بيانات الأقساط
    const installmentData = getInstallmentData();
    
    // إنشاء الرسم البياني
    new Chart(chartCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: installmentData.labels,
            datasets: [{
                label: 'الأقساط المستحقة',
                data: installmentData.dueAmount,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'المبالغ المحصلة',
                data: installmentData.paidAmount,
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'المبلغ (دينار)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'الشهر'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'متابعة الأقساط'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

// جمع بيانات الأقساط
function getInstallmentData() {
    // الحصول على الأشهر الستة القادمة
    const labels = [];
    const dueAmount = [];
    const paidAmount = [];
    
    const now = new Date();
    const months = [];
    
    // إنشاء قائمة الأشهر الستة القادمة
    for (let i = 0; i < 6; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const monthStr = month.toISOString().substring(0, 7); // YYYY-MM
        const monthLabel = month.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' });
        
        months.push({
            monthStr,
            monthLabel,
            startDate: new Date(month.getFullYear(), month.getMonth(), 1),
            endDate: new Date(month.getFullYear(), month.getMonth() + 1, 0)
        });
        
        labels.push(monthLabel);
        dueAmount.push(0);
        paidAmount.push(0);
    }
    
    // حساب المبالغ المستحقة والمدفوعة لكل شهر
    installments.forEach(installment => {
        if (installment.schedule && installment.schedule.length > 0) {
            installment.schedule.forEach(item => {
                const dueDate = new Date(item.dueDate);
                
                // البحث عن الشهر المناسب
                const monthIndex = months.findIndex(m => dueDate >= m.startDate && dueDate <= m.endDate);
                
                if (monthIndex !== -1) {
                    if (item.status === 'paid') {
                        paidAmount[monthIndex] += item.amount;
                    } else {
                        dueAmount[monthIndex] += item.amount;
                    }
                }
            });
        }
    });
    
    return {
        labels,
        dueAmount,
        paidAmount
    };
}

// تهيئة رسم بياني لنسبة تحصيل الأقساط
function initInstallmentsCollectionChart() {
    const chartCanvas = document.getElementById('installments-collection-chart');
    if (!chartCanvas || !window.Chart) return;
    
    // جمع بيانات تحصيل الأقساط
    const collectionData = getInstallmentCollectionData();
    
    // إنشاء الرسم البياني
    new Chart(chartCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: collectionData.labels,
            datasets: [{
                data: collectionData.values,
                backgroundColor: [
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(239, 68, 68, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'نسبة تحصيل الأقساط'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${context.label}: ${percentage}%`;
                        }
                    }
                }
            }
        }
    });
}

// جمع بيانات تحصيل الأقساط
function getInstallmentCollectionData() {
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;
    
    // حساب المبالغ المدفوعة والمعلقة والمتأخرة
    installments.forEach(installment => {
        if (installment.schedule && installment.schedule.length > 0) {
            installment.schedule.forEach(item => {
                if (item.status === 'paid') {
                    paidAmount += item.amount;
                } else if (item.status === 'overdue') {
                    overdueAmount += item.amount;
                } else {
                    pendingAmount += item.amount;
                }
            });
        }
    });
    
    return {
        labels: ['مدفوع', 'مستقبلي', 'متأخر'],
        values: [paidAmount, pendingAmount, overdueAmount]
    };
}

// إعداد أزرار تصدير البيانات
function setupExportButtons() {
    console.log('إعداد أزرار تصدير البيانات...');
    
    // إعداد زر تصدير بيانات الموظفين
    const exportEmployeesBtn = document.getElementById('export-employees-btn');
    if (exportEmployeesBtn && !exportEmployeesBtn.hasListener) {
        exportEmployeesBtn.addEventListener('click', function() {
            exportEmployeesToExcel();
        });
        exportEmployeesBtn.hasListener = true;
    }
    
    // إعداد زر تصدير بيانات الرواتب
    const exportSalariesBtn = document.getElementById('export-salaries-btn');
    if (exportSalariesBtn && !exportSalariesBtn.hasListener) {
        exportSalariesBtn.addEventListener('click', function() {
            exportSalariesToExcel();
        });
        exportSalariesBtn.hasListener = true;
    }
    
    // إعداد زر تصدير بيانات الأقساط
    const exportInstallmentsBtn = document.getElementById('export-installments-btn');
    if (exportInstallmentsBtn && !exportInstallmentsBtn.hasListener) {
        exportInstallmentsBtn.addEventListener('click', function() {
            exportInstallmentsToExcel();
        });
        exportInstallmentsBtn.hasListener = true;
    }
    
    // إعداد زر تصدير تقرير الموظفين
    const exportEmployeeReportBtn = document.getElementById('export-employee-report-btn');
    if (exportEmployeeReportBtn && !exportEmployeeReportBtn.hasListener) {
        exportEmployeeReportBtn.addEventListener('click', function() {
            exportEmployeeReportToExcel();
        });
        exportEmployeeReportBtn.hasListener = true;
    }
}

// تصدير بيانات الموظفين إلى ملف Excel
function exportEmployeesToExcel() {
    console.log('تصدير بيانات الموظفين إلى Excel...');
    
    // التحقق من وجود موظفين
    if (!employees || employees.length === 0) {
        showNotification('لا يوجد موظفين للتصدير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عناوين الأعمدة
    const headers = [
        'الرقم',
        'الاسم',
        'رقم الهاتف',
        'البريد الإلكتروني',
        'العنوان',
        'المسمى الوظيفي',
        'القسم',
        'الراتب الأساسي',
        'نسبة المبيعات',
        'تاريخ التعيين',
        'نوع العقد',
        'الحالة',
        'رقم البطاقة الوطنية',
        'رقم بطاقة السكن',
        'ملاحظات'
    ];
    
    csvRows.push(headers.join(','));
    
    // إضافة بيانات الموظفين
    employees.forEach((employee, index) => {
        const values = [
            index + 1,
            employee.name,
            employee.phone,
            employee.email || '',
            employee.address || '',
            employee.jobTitle,
            translateDepartment(employee.department),
            employee.salary,
            employee.commission,
            employee.hireDate,
            translateContractType(employee.contractType),
            employee.status === 'active' ? 'نشط' : 'غير نشط',
            employee.idNumber || '',
            employee.residenceCard || '',
            employee.notes || ''
        ];
        
        // تنظيف القيم للتصدير CSV
        const cleanedValues = values.map(value => {
            if (value === null || value === undefined) return '';
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
        });
        
        csvRows.push(cleanedValues.join(','));
    });
    
    // تصدير الملف
    exportCSV(csvRows.join('\n'), `قائمة_الموظفين_${new Date().toISOString().split('T')[0]}.csv`);
}

// تصدير بيانات الرواتب إلى ملف Excel
function exportSalariesToExcel() {
    console.log('تصدير بيانات الرواتب إلى Excel...');
    
    // التحقق من وجود رواتب
    if (!salaries || salaries.length === 0) {
        showNotification('لا يوجد رواتب للتصدير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عناوين الأعمدة
    const headers = [
        'الرقم',
        'الموظف',
        'شهر الراتب',
        'تاريخ الصرف',
        'الراتب الأساسي',
        'المبيعات',
        'العمولة',
        'العلاوات',
        'الاستقطاعات',
        'إجمالي الراتب',
        'ملاحظات'
    ];
    
    csvRows.push(headers.join(','));
    
    // إضافة بيانات الرواتب
    salaries.forEach((salary, index) => {
        const values = [
            index + 1,
            salary.employeeName,
            new Date(salary.salaryMonth + '-01').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' }),
            salary.salaryDate,
            salary.basicSalary,
            salary.salesAmount,
            salary.commission,
            salary.bonus,
            salary.deductions,
            salary.totalSalary,
            salary.notes || ''
        ];
        
        // تنظيف القيم للتصدير CSV
        const cleanedValues = values.map(value => {
            if (value === null || value === undefined) return '';
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
        });
        
        csvRows.push(cleanedValues.join(','));
    });
    
    // تصدير الملف
    exportCSV(csvRows.join('\n'), `سجل_الرواتب_${new Date().toISOString().split('T')[0]}.csv`);
}
// تصدير بيانات الأقساط إلى ملف Excel (تكملة)
function exportInstallmentsToExcel() {
    console.log('تصدير بيانات الأقساط إلى Excel...');
    
    // التحقق من وجود أقساط
    if (!installments || installments.length === 0) {
        showNotification('لا يوجد أقساط للتصدير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عناوين الأعمدة
    const headers = [
        'الرقم',
        'العميل',
        'رقم الهاتف',
        'الموظف المسؤول',
        'المبلغ الإجمالي',
        'الدفعة الأولى',
        'المبلغ المتبقي',
        'عدد الأقساط',
        'قيمة القسط',
        'فترة السداد',
        'تاريخ البدء',
        'المبلغ المدفوع',
        'الحالة',
        'معلومات المنتج'
    ];
    
    csvRows.push(headers.join(','));
    
    // إضافة بيانات الأقساط
    installments.forEach((installment, index) => {
        // ترجمة فترة السداد
        let periodText = 'شهري';
        if (installment.installmentPeriod === 'quarterly') periodText = 'ربع سنوي';
        else if (installment.installmentPeriod === 'semi-annual') periodText = 'نصف سنوي';
        else if (installment.installmentPeriod === 'annual') periodText = 'سنوي';
        
        // ترجمة الحالة
        let statusText = 'نشط';
        if (installment.status === 'paid') statusText = 'مدفوع';
        else if (installment.status === 'overdue') statusText = 'متأخر';
        
        const values = [
            index + 1,
            installment.customerName,
            installment.customerPhone,
            installment.employeeName || 'غير محدد',
            installment.totalAmount,
            installment.downPayment,
            installment.remainingAmount,
            installment.installmentCount,
            installment.installmentAmount,
            periodText,
            installment.startDate,
            installment.paidAmount,
            statusText,
            installment.productInfo || ''
        ];
        
        // تنظيف القيم للتصدير CSV
        const cleanedValues = values.map(value => {
            if (value === null || value === undefined) return '';
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
        });
        
        csvRows.push(cleanedValues.join(','));
    });
    
    // تصدير الملف
    exportCSV(csvRows.join('\n'), `سجل_الأقساط_${new Date().toISOString().split('T')[0]}.csv`);
}

// تصدير تقرير الموظفين إلى ملف Excel
function exportEmployeeReportToExcel() {
    console.log('تصدير تقرير الموظفين إلى Excel...');
    
    // التحقق من وجود موظفين ورواتب
    if (!employees || employees.length === 0 || !salaries || salaries.length === 0) {
        showNotification('لا يوجد بيانات كافية للتقرير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عنوان التقرير
    csvRows.push(`"تقرير أداء الموظفين - ${new Date().toLocaleDateString('ar-EG')}"`);
    csvRows.push('');
    
    // إضافة ملخص عام
    csvRows.push('"ملخص عام"');
    csvRows.push(`"عدد الموظفين النشطين","${employees.filter(emp => emp.status === 'active').length}"`);
    csvRows.push(`"إجمالي الرواتب الأساسية","${employees.reduce((sum, emp) => sum + (emp.status === 'active' ? emp.salary : 0), 0)}"`);
    csvRows.push(`"إجمالي المبيعات","${salaries.reduce((sum, s) => sum + s.salesAmount, 0)}"`);
    csvRows.push(`"إجمالي العمولات","${salaries.reduce((sum, s) => sum + s.commission, 0)}"`);
    csvRows.push('');
    
    // إضافة تقرير تفصيلي للموظفين
    csvRows.push('"تقرير تفصيلي للموظفين"');
    
    // إضافة عناوين الأعمدة
    const headers = [
        'الموظف',
        'المسمى الوظيفي',
        'القسم',
        'الراتب الأساسي',
        'نسبة العمولة',
        'المبيعات الإجمالية',
        'العمولات الإجمالية',
        'نسبة المساهمة',
        'مدة العمل'
    ];
    
    csvRows.push(headers.join(','));
    
    // إضافة بيانات الموظفين
    const activeEmployees = employees.filter(emp => emp.status === 'active');
    
    // حساب إجمالي المبيعات للحصول على نسبة المساهمة
    const totalSales = salaries.reduce((sum, s) => sum + s.salesAmount, 0);
    
    activeEmployees.forEach(employee => {
        // حساب إجمالي المبيعات والعمولات للموظف
        const employeeSalaries = salaries.filter(s => s.employeeId === employee.id);
        const employeeSales = employeeSalaries.reduce((sum, s) => sum + s.salesAmount, 0);
        const employeeCommissions = employeeSalaries.reduce((sum, s) => sum + s.commission, 0);
        
        // حساب نسبة المساهمة في المبيعات
        const contributionRate = totalSales > 0 ? (employeeSales / totalSales * 100).toFixed(2) : '0';
        
        // حساب مدة العمل
        const workDuration = calculateEmploymentDuration(employee.hireDate);
        
        const values = [
            employee.name,
            employee.jobTitle,
            translateDepartment(employee.department),
            employee.salary,
            employee.commission + '%',
            employeeSales,
            employeeCommissions,
            contributionRate + '%',
            workDuration
        ];
        
        // تنظيف القيم للتصدير CSV
        const cleanedValues = values.map(value => {
            if (value === null || value === undefined) return '';
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
        });
        
        csvRows.push(cleanedValues.join(','));
    });
    
    // تصدير الملف
    exportCSV(csvRows.join('\n'), `تقرير_الموظفين_${new Date().toISOString().split('T')[0]}.csv`);
}

// تصدير بيانات CSV
function exportCSV(csvContent, fileName) {
    // إنشاء Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // إنشاء رابط التنزيل
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    
    // إضافة الرابط وتنفيذ النقر
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    document.body.removeChild(link);
    
    showNotification(`تم تصدير الملف بنجاح: ${fileName}`, 'success');
}

// إظهار إشعار
function showNotification(message, type = 'info') {
    // استخدام دالة عرض الإشعارات الموجودة في التطبيق إذا كانت متاحة
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // تنفيذ دالة إشعار بسيطة إذا لم تكن متاحة
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${getIconForType(type)}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${getTitleForType(type)}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // إضافة الإشعار إلى الصفحة
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // إضافة مستمع حدث لزر الإغلاق
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
    }
    
    // إخفاء الإشعار تلقائياً بعد 5 ثوانٍ
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // دوال مساعدة للإشعار
    function getIconForType(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'times-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
    
    function getTitleForType(type) {
        switch (type) {
            case 'success': return 'تم بنجاح';
            case 'error': return 'خطأ';
            case 'warning': return 'تنبيه';
            default: return 'معلومات';
        }
    }
}

// تصدير الوظائف للاستخدام في النظام
window.EmployeeSystem = {
    renderEmployeesTable,
    renderSalariesTable,
    renderInstallmentsTable,
    
    showEmployeeDetails,
    openAddEmployeeModal,
    saveEmployee,
    deleteEmployee,
    
    openPaySalaryModal,
    saveSalary,
    
    openAddInstallmentModal,
    saveInstallment,
    payInstallment,
    
    updateOverdueInstallments,
    initEmployeeCharts,
    
    exportEmployeesToExcel,
    exportSalariesToExcel,
    exportInstallmentsToExcel,
    exportEmployeeReportToExcel
};

// إضافة نمط CSS لنظام الإشعارات
function addNotificationStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('notification-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'notification-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            align-items: center;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: 12px 16px;
            width: 350px;
            z-index: 9999;
            transform: translateX(120%);
            transition: transform 0.3s ease-in-out;
            direction: rtl;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-icon {
            margin-left: 12px;
            font-size: 1.5rem;
        }
        
        .notification-content {
            flex: 1;
        }
        
        .notification-title {
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .notification-message {
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: #9ca3af;
            margin-right: 8px;
        }
        
        .notification-close:hover {
            color: #6b7280;
        }
        
        .notification-success .notification-icon {
            color: #10b981;
        }
        
        .notification-error .notification-icon {
            color: #ef4444;
        }
        
        .notification-warning .notification-icon {
            color: #f59e0b;
        }
        
        .notification-info .notification-icon {
            color: #3b82f6;
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
}

// استدعاء دالة إضافة أنماط الإشعارات
addNotificationStyles();

// بدء تشغيل النظام
console.log('تم تحميل نظام إدارة الموظفين والأقساط بنجاح');
showNotification('تم تحميل نظام إدارة الموظفين والأقساط', 'success');