/**
 * لإصلاح وملء أي دوال مفقودة في نظام القروض
 * هذا الملف سيضمن تعريف جميع الدوال المطلوبة حتى إذا كانت مفقودة في الملف الأصلي
 */

// ضمان تعريف الدوال الأساسية المطلوبة لنظام القروض

// التحقق من وجود الدالة وإذا لم تكن موجودة، قم بتعريفها
if (typeof initLoanSystem !== 'function') {
    console.warn('تعريف دالة initLoanSystem الناقصة');
    window.initLoanSystem = function() {
        console.log('تشغيل نظام إدارة القروض');
        // تضمين أي منطق تهيئة أساسي هنا
        loadLoanData();
    };
}

if (typeof addLoanNavItems !== 'function') {
    console.warn('تعريف دالة addLoanNavItems الناقصة');
    window.addLoanNavItems = function() {
        console.log('إضافة عناصر القروض للقائمة الجانبية');
        
        const navList = document.querySelector('.nav-list');
        if (!navList) {
            console.error('لم يتم العثور على عنصر .nav-list');
            return;
        }
        
        // إضافة عناصر القروض إلى القائمة الجانبية
        const loanNavItems = `
            <li class="nav-item" data-loan-nav="loans">
                <a class="nav-link" data-loan-page="loans-management" href="#">
                    <div class="nav-icon">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <span>إدارة القروض</span>
                </a>
            </li>
            <li class="nav-item" data-loan-nav="loan-payments">
                <a class="nav-link" data-loan-page="loan-payments" href="#">
                    <div class="nav-icon">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <span>مدفوعات القروض</span>
                    <span class="badge badge-danger loan-badge">0</span>
                </a>
            </li>
            <li class="nav-item" data-loan-nav="loan-reports">
                <a class="nav-link" data-loan-page="loan-reports" href="#">
                    <div class="nav-icon">
                        <i class="fas fa-chart-pie"></i>
                    </div>
                    <span>تقارير القروض</span>
                </a>
            </li>
        `;
        
        // العثور على موقع إدراج عناصر القروض (قبل عنصر الإعدادات)
        const settingsItem = navList.querySelector('.nav-item a[data-page="settings"]');
        
        if (settingsItem && settingsItem.parentElement) {
            // إدراج عناصر القروض قبل عنصر الإعدادات
            settingsItem.parentElement.insertAdjacentHTML('beforebegin', loanNavItems);
        } else {
            // إذا لم يتم العثور على عنصر الإعدادات، أضف عناصر القروض في نهاية القائمة
            navList.insertAdjacentHTML('beforeend', loanNavItems);
        }
    };
}

if (typeof createLoanPages !== 'function') {
    console.warn('تعريف دالة createLoanPages الناقصة');
    window.createLoanPages = function() {
        console.log('إنشاء صفحات نظام القروض');
        
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            console.error('لم يتم العثور على عنصر .main-content');
            return;
        }
        
        // إنشاء صفحات القروض
        const loanPagesHTML = `
            <!-- صفحة إدارة القروض -->
            <div class="page" id="loans-management-page" data-loan-page="loans-management">
                <div class="header">
                    <button class="toggle-sidebar">
                        <i class="fas fa-bars"></i>
                    </button>
                    <h1 class="page-title">إدارة القروض</h1>
                    <div class="header-actions">
                        <div class="search-box">
                            <input class="search-input" placeholder="بحث عن قرض..." type="text" />
                            <i class="fas fa-search search-icon"></i>
                        </div>
                        <button class="btn btn-primary" id="add-loan-btn">
                            <i class="fas fa-plus"></i>
                            <span>إضافة قرض جديد</span>
                        </button>
                    </div>
                </div>
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">قائمة القروض النشطة</h2>
                        <div class="section-actions">
                            <div class="btn-group">
                                <button class="btn btn-outline btn-sm active" data-loan-filter="all">الكل</button>
                                <button class="btn btn-outline btn-sm" data-loan-filter="active">نشط</button>
                                <button class="btn btn-outline btn-sm" data-loan-filter="late">متأخر</button>
                                <button class="btn btn-outline btn-sm" data-loan-filter="completed">مكتمل</button>
                            </div>
                            <button class="btn btn-outline btn-sm" title="تصدير">
                                <i class="fas fa-download"></i>
                                <span>تصدير</span>
                            </button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table id="loans-table">
                            <thead>
                                <tr>
                                    <th>المعرف</th>
                                    <th>المقترض</th>
                                    <th>مبلغ القرض</th>
                                    <th>تاريخ البدء</th>
                                    <th>المتبقي</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="loans-table-body">
                                <!-- سيتم ملؤها ديناميكيًا -->
                                <tr>
                                    <td colspan="7" class="text-center">جاري تحميل بيانات القروض...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- صفحة مدفوعات القروض -->
            <div class="page" id="loan-payments-page" data-loan-page="loan-payments">
                <div class="header">
                    <button class="toggle-sidebar">
                        <i class="fas fa-bars"></i>
                    </button>
                    <h1 class="page-title">مدفوعات القروض</h1>
                    <div class="header-actions">
                        <div class="search-box">
                            <input class="search-input" placeholder="بحث عن دفعة..." type="text" />
                            <i class="fas fa-search search-icon"></i>
                        </div>
                        <button class="btn btn-success" id="record-payment-btn">
                            <i class="fas fa-money-bill"></i>
                            <span>تسجيل دفعة</span>
                        </button>
                    </div>
                </div>
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">الدفعات المستحقة</h2>
                        <div class="section-actions">
                            <div class="btn-group">
                                <button class="btn btn-outline btn-sm active" data-payment-filter="due">مستحقة</button>
                                <button class="btn btn-outline btn-sm" data-payment-filter="upcoming">قادمة</button>
                                <button class="btn btn-outline btn-sm" data-payment-filter="paid">مدفوعة</button>
                                <button class="btn btn-outline btn-sm" data-payment-filter="late">متأخرة</button>
                            </div>
                            <button class="btn btn-outline btn-sm" title="تصدير">
                                <i class="fas fa-download"></i>
                                <span>تصدير</span>
                            </button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table id="loan-payments-table">
                            <thead>
                                <tr>
                                    <th>المعرف</th>
                                    <th>المقترض</th>
                                    <th>رقم القسط</th>
                                    <th>مبلغ القسط</th>
                                    <th>تاريخ الاستحقاق</th>
                                    <th>حالة السداد</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="loan-payments-table-body">
                                <!-- سيتم ملؤها ديناميكيًا -->
                                <tr>
                                    <td colspan="7" class="text-center">جاري تحميل بيانات الدفعات...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- صفحة تقارير القروض -->
            <div class="page" id="loan-reports-page" data-loan-page="loan-reports">
                <div class="header">
                    <button class="toggle-sidebar">
                        <i class="fas fa-bars"></i>
                    </button>
                    <h1 class="page-title">تقارير القروض</h1>
                    <div class="header-actions">
                        <div class="btn-group">
                            <button class="btn btn-outline active" data-report-period="monthly">شهري</button>
                            <button class="btn btn-outline" data-report-period="quarterly">ربع سنوي</button>
                            <button class="btn btn-outline" data-report-period="yearly">سنوي</button>
                        </div>
                        <button class="btn btn-primary" id="export-loan-report-btn">
                            <i class="fas fa-download"></i>
                            <span>تصدير التقرير</span>
                        </button>
                    </div>
                </div>
                <div class="grid-cols-2">
                    <div class="section">
                        <div class="section-header">
                            <h2 class="section-title">حالة القروض</h2>
                        </div>
                        <div class="chart-container">
                            <canvas id="loans-status-chart"></canvas>
                        </div>
                    </div>
                    <div class="section">
                        <div class="section-header">
                            <h2 class="section-title">أداء المدفوعات</h2>
                        </div>
                        <div class="chart-container">
                            <canvas id="loan-payments-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">تحليل القروض</h2>
                    </div>
                    <div class="loan-stats-cards">
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">إجمالي القروض النشطة</div>
                                    <div class="card-value" id="total-active-loans">0</div>
                                </div>
                                <div class="card-icon primary">
                                    <i class="fas fa-file-invoice-dollar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">إجمالي المبالغ المقرضة</div>
                                    <div class="card-value" id="total-loan-amount">0 دينار</div>
                                </div>
                                <div class="card-icon success">
                                    <i class="fas fa-dollar-sign"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">المدفوعات المستحقة هذا الشهر</div>
                                    <div class="card-value" id="month-due-payments">0 دينار</div>
                                </div>
                                <div class="card-icon warning">
                                    <i class="fas fa-calendar-day"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">الدفعات المتأخرة</div>
                                    <div class="card-value" id="late-payments">0</div>
                                </div>
                                <div class="card-icon danger">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة صفحات القروض إلى المحتوى الرئيسي
        mainContent.insertAdjacentHTML('beforeend', loanPagesHTML);
    };
}

if (typeof showLoanPage !== 'function') {
    console.warn('تعريف دالة showLoanPage الناقصة');
    window.showLoanPage = function(pageId) {
        console.log('عرض صفحة القروض:', pageId);
        
        // إخفاء جميع الصفحات أولاً
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // عرض صفحة القروض المطلوبة
        const loanPage = document.getElementById(`${pageId}-page`);
        if (loanPage) {
            loanPage.classList.add('active');
        } else {
            console.error(`لم يتم العثور على صفحة القروض: ${pageId}-page`);
        }
    };
}

if (typeof updateNavBadges !== 'function') {
    console.warn('تعريف دالة updateNavBadges الناقصة');
    window.updateNavBadges = function() {
        console.log('تحديث شارات القروض');
        
        // استخراج بيانات القروض من التخزين المحلي أو firebase
        const duePayments = getDuePaymentsCount();
        
        // تحديث عدد الدفعات المستحقة
        const loanBadge = document.querySelector('.nav-item[data-loan-nav="loan-payments"] .loan-badge');
        if (loanBadge) {
            loanBadge.textContent = duePayments;
            
            // إظهار أو إخفاء الشارة بناءً على وجود دفعات مستحقة
            if (duePayments > 0) {
                loanBadge.style.display = 'inline-flex';
            } else {
                loanBadge.style.display = 'none';
            }
        }
    };
}

if (typeof updatePageData !== 'function') {
    console.warn('تعريف دالة updatePageData الناقصة');
    window.updatePageData = function(pageId) {
        console.log('تحديث بيانات صفحة القروض:', pageId);
        
        switch (pageId) {
            case 'loans-management':
                updateLoansTable();
                break;
            case 'loan-payments':
                updatePaymentsTable();
                break;
            case 'loan-reports':
                updateLoanReports();
                break;
            default:
                console.warn(`صفحة القروض غير معروفة: ${pageId}`);
        }
    };
}

if (typeof applyLoanSystemTheme !== 'function') {
    console.warn('تعريف دالة applyLoanSystemTheme الناقصة');
    window.applyLoanSystemTheme = function() {
        console.log('تطبيق مظهر نظام القروض');
        
        // اكتشاف مظهر النظام الحالي (فاتح/داكن)
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // تطبيق نمط متوافق مع مظهر النظام
        if (isDarkMode) {
            // تطبيق الألوان والأنماط للوضع الداكن
            applyDarkModeToLoanSystem();
        } else {
            // تطبيق الألوان والأنماط للوضع الفاتح
            applyLightModeToLoanSystem();
        }
    };
}

// دوال مساعدة إضافية للتأكد من أن النظام يعمل حتى إذا لم تكن هذه الدوال موجودة في الملف الأصلي

/**
 * تطبيق مظهر الوضع الداكن على نظام القروض
 */
function applyDarkModeToLoanSystem() {
    // إضافة فئة الوضع الداكن لجميع صفحات القروض
    document.querySelectorAll('[data-loan-page]').forEach(element => {
        element.classList.add('dark-theme');
    });
    
    // يمكن تطبيق أنماط إضافية هنا
}

/**
 * تطبيق مظهر الوضع الفاتح على نظام القروض
 */
function applyLightModeToLoanSystem() {
    // إزالة فئة الوضع الداكن من جميع صفحات القروض
    document.querySelectorAll('[data-loan-page]').forEach(element => {
        element.classList.remove('dark-theme');
    });
    
    // يمكن تطبيق أنماط إضافية هنا
}

/**
 * الحصول على عدد الدفعات المستحقة
 * @returns {number} عدد الدفعات المستحقة
 */
function getDuePaymentsCount() {
    // بشكل افتراضي، حاول استرداد البيانات من التخزين المحلي
    try {
        const loanPayments = JSON.parse(localStorage.getItem('loanPayments')) || [];
        const today = new Date();
        
        // احتساب الدفعات المستحقة (تلك التي لم يتم دفعها وموعد استحقاقها قد حان أو تجاوز)
        return loanPayments.filter(payment => {
            const dueDate = new Date(payment.dueDate);
            return !payment.paid && dueDate <= today;
        }).length;
    } catch (error) {
        console.error('خطأ في الحصول على عدد الدفعات المستحقة:', error);
        return 0;
    }
}

/**
 * تحديث جدول القروض
 */
function updateLoansTable() {
    const tableBody = document.getElementById('loans-table-body');
    if (!tableBody) {
        console.error('لم يتم العثور على جدول القروض');
        return;
    }
    
    try {
        // محاولة استرداد بيانات القروض من التخزين المحلي
        const loans = JSON.parse(localStorage.getItem('loans')) || [];
        
        if (loans.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد قروض لعرضها</td></tr>';
            return;
        }
        
        // بناء صفوف الجدول
        let tableHTML = '';
        loans.forEach(loan => {
            // حساب المبلغ المتبقي
            const remainingAmount = calculateRemainingAmount(loan);
            
            // تحديد حالة القرض
            const status = getLoanStatus(loan);
            
            // إنشاء صف الجدول
            tableHTML += `
                <tr data-loan-id="${loan.id}">
                    <td>${loan.id}</td>
                    <td>${loan.borrowerName}</td>
                    <td>${formatCurrency(loan.amount)}</td>
                    <td>${formatDate(loan.startDate)}</td>
                    <td>${formatCurrency(remainingAmount)}</td>
                    <td><span class="status-badge ${status.class}">${status.text}</span></td>
                    <td>
                        <div class="actions">
                            <button class="btn btn-icon" title="عرض التفاصيل" onclick="showLoanDetails('${loan.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-icon" title="تعديل" onclick="editLoan('${loan.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-icon" title="سجل المدفوعات" onclick="showLoanPayments('${loan.id}')">
                                <i class="fas fa-money-bill"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;
    } catch (error) {
        console.error('خطأ في تحديث جدول القروض:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">حدث خطأ أثناء تحميل البيانات</td></tr>';
    }
}

/**
 * تحديث جدول المدفوعات
 */
function updatePaymentsTable() {
    const tableBody = document.getElementById('loan-payments-table-body');
    if (!tableBody) {
        console.error('لم يتم العثور على جدول المدفوعات');
        return;
    }
    
    try {
        // محاولة استرداد بيانات المدفوعات من التخزين المحلي
        const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
        
        if (payments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد مدفوعات لعرضها</td></tr>';
            return;
        }
        
        // الحصول على قائمة القروض لربط المعلومات
        const loans = JSON.parse(localStorage.getItem('loans')) || [];
        const loansMap = {};
        loans.forEach(loan => {
            loansMap[loan.id] = loan;
        });
        
        // تحديد عامل التصفية النشط
        const activeFilter = document.querySelector('[data-payment-filter].active');
        const filterType = activeFilter ? activeFilter.getAttribute('data-payment-filter') : 'due';
        
        // تصفية المدفوعات
        const filteredPayments = filterPayments(payments, filterType);
        
        if (filteredPayments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد مدفوعات تطابق عامل التصفية</td></tr>';
            return;
        }
        
        // بناء صفوف الجدول
        let tableHTML = '';
        filteredPayments.forEach(payment => {
            const loan = loansMap[payment.loanId] || { borrowerName: 'غير معروف' };
            
            // تحديد حالة الدفع
            const status = getPaymentStatus(payment);
            
            // إنشاء صف الجدول
            tableHTML += `
                <tr data-payment-id="${payment.id}">
                    <td>${payment.id}</td>
                    <td>${loan.borrowerName}</td>
                    <td>${payment.installmentNumber}</td>
                    <td>${formatCurrency(payment.amount)}</td>
                    <td>${formatDate(payment.dueDate)}</td>
                    <td><span class="status-badge ${status.class}">${status.text}</span></td>
                    <td>
                        <div class="actions">
                            <button class="btn btn-icon" title="تسجيل الدفع" onclick="recordPayment('${payment.id}')" ${payment.paid ? 'disabled' : ''}>
                                <i class="fas fa-check-circle"></i>
                            </button>
                            <button class="btn btn-icon" title="عرض التفاصيل" onclick="showPaymentDetails('${payment.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;
    } catch (error) {
        console.error('خطأ في تحديث جدول المدفوعات:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">حدث خطأ أثناء تحميل البيانات</td></tr>';
    }
}

/**
 * تحديث تقارير القروض وإنشاء الرسوم البيانية
 */
function updateLoanReports() {
    try {
        // تحميل بيانات القروض والمدفوعات
        const loans = JSON.parse(localStorage.getItem('loans')) || [];
        const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
        
        // تحديث بطاقات الإحصائيات
        updateLoanStatCards(loans, payments);
        
        // تحديث الرسوم البيانية باستخدام Chart.js
        createLoanStatusChart(loans);
        createPaymentsChart(payments);
    } catch (error) {
        console.error('خطأ في تحديث تقارير القروض:', error);
    }
}

/**
 * تحديث بطاقات إحصائيات القروض
 */
function updateLoanStatCards(loans, payments) {
    // عدد القروض النشطة
    const activeLoans = loans.filter(loan => getLoanStatus(loan).text === 'نشط');
    document.getElementById('total-active-loans').textContent = activeLoans.length;
    
    // إجمالي المبالغ المقرضة
    const totalLoanAmount = loans.reduce((total, loan) => total + parseFloat(loan.amount), 0);
    document.getElementById('total-loan-amount').textContent = formatCurrency(totalLoanAmount);
    
    // المدفوعات المستحقة هذا الشهر
    const currentMonthDue = calculateCurrentMonthDuePayments(payments);
    document.getElementById('month-due-payments').textContent = formatCurrency(currentMonthDue);
    
    // الدفعات المتأخرة
    const latePayments = payments.filter(payment => getPaymentStatus(payment).text === 'متأخرة');
    document.getElementById('late-payments').textContent = latePayments.length;
}

/**
 * إنشاء رسم بياني لحالة القروض
 */
function createLoanStatusChart(loans) {
    // الحصول على عنصر الرسم البياني
    const ctx = document.getElementById('loans-status-chart');
    if (!ctx) {
        console.error('لم يتم العثور على عنصر الرسم البياني لحالة القروض');
        return;
    }
    
    // حساب إحصائيات حالة القروض
    const statusCounts = {
        active: 0,
        late: 0,
        completed: 0,
        defaulted: 0
    };
    
    loans.forEach(loan => {
        const status = getLoanStatus(loan).text;
        if (status === 'نشط') statusCounts.active++;
        else if (status === 'متأخر') statusCounts.late++;
        else if (status === 'مكتمل') statusCounts.completed++;
        else if (status === 'متعثر') statusCounts.defaulted++;
    });
    
    // التحقق من وجود رسم بياني سابق وتدميره
    if (window.loansStatusChart) {
        window.loansStatusChart.destroy();
    }
    
    // إنشاء الرسم البياني
    window.loansStatusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['نشط', 'متأخر', 'مكتمل', 'متعثر'],
            datasets: [{
                data: [
                    statusCounts.active,
                    statusCounts.late,
                    statusCounts.completed,
                    statusCounts.defaulted
                ],
                backgroundColor: [
                    '#3b82f6',
                    '#f59e0b',
                    '#10b981',
                    '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * إنشاء رسم بياني للمدفوعات
 */
function createPaymentsChart(payments) {
    // الحصول على عنصر الرسم البياني
    const ctx = document.getElementById('loan-payments-chart');
    if (!ctx) {
        console.error('لم يتم العثور على عنصر الرسم البياني للمدفوعات');
        return;
    }
    
    // تجميع البيانات حسب الشهر
    const last6Months = getLast6Months();
    const paidByMonth = {};
    const dueByMonth = {};
    
    // تهيئة المصفوفات
    last6Months.forEach(month => {
        paidByMonth[month.key] = 0;
        dueByMonth[month.key] = 0;
    });
    
    // تحليل المدفوعات
    payments.forEach(payment => {
        const dueDate = new Date(payment.dueDate);
        const monthKey = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (dueByMonth[monthKey] !== undefined) {
            dueByMonth[monthKey] += parseFloat(payment.amount);
            
            if (payment.paid) {
                paidByMonth[monthKey] += parseFloat(payment.amount);
            }
        }
    });
    
    // التحقق من وجود رسم بياني سابق وتدميره
    if (window.loanPaymentsChart) {
        window.loanPaymentsChart.destroy();
    }
    
    // إنشاء الرسم البياني
    window.loanPaymentsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last6Months.map(month => month.label),
            datasets: [
                {
                    label: 'المبالغ المستحقة',
                    data: last6Months.map(month => dueByMonth[month.key]),
                    backgroundColor: '#f59e0b',
                    barPercentage: 0.5,
                    categoryPercentage: 0.7
                },
                {
                    label: 'المبالغ المسددة',
                    data: last6Months.map(month => paidByMonth[month.key]),
                    backgroundColor: '#10b981',
                    barPercentage: 0.5,
                    categoryPercentage: 0.7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += formatCurrency(context.raw);
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * الحصول على الستة أشهر الماضية
 * @returns {Array} مصفوفة من الأشهر
 */
function getLast6Months() {
    const months = [];
    const date = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthLabel = getMonthNameArabic(d.getMonth()) + ' ' + d.getFullYear();
        
        months.push({
            key: monthKey,
            label: monthLabel
        });
    }
    
    return months;
}

/**
 * الحصول على اسم الشهر بالعربية
 * @param {number} month رقم الشهر (0-11)
 * @returns {string} اسم الشهر بالعربية
 */
function getMonthNameArabic(month) {
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    return monthNames[month];
}

/**
 * تنسيق المبلغ كعملة
 * @param {number} amount المبلغ
 * @returns {string} المبلغ المنسق
 */
function formatCurrency(amount) {
    // حاول استخدام تنسيق العملة من ملفات التطبيق الأصلية إذا كانت متاحة
    if (typeof window.formatCurrency === 'function') {
        return window.formatCurrency(amount);
    }
    
    // الطريقة البديلة
    const formatter = new Intl.NumberFormat('ar-IQ', {
        style: 'currency',
        currency: 'IQD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    
    return formatter.format(amount);
}

/**
 * تنسيق التاريخ
 * @param {string} dateStr سلسلة التاريخ
 * @returns {string} التاريخ المنسق
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * تصفية المدفوعات حسب النوع
 * @param {Array} payments مصفوفة المدفوعات
 * @param {string} filterType نوع التصفية
 * @returns {Array} المدفوعات المصفاة
 */
function filterPayments(payments, filterType) {
    const today = new Date();
    
    switch (filterType) {
        case 'due':
            // المدفوعات المستحقة (غير مدفوعة والاستحقاق اليوم أو قبله)
            return payments.filter(payment => {
                const dueDate = new Date(payment.dueDate);
                return !payment.paid && dueDate <= today;
            });
        
        case 'upcoming':
            // المدفوعات القادمة (غير مدفوعة والاستحقاق بعد اليوم)
            return payments.filter(payment => {
                const dueDate = new Date(payment.dueDate);
                return !payment.paid && dueDate > today;
            });
        
        case 'paid':
            // المدفوعات المسددة
            return payments.filter(payment => payment.paid);
        
        case 'late':
            // المدفوعات المتأخرة (غير مدفوعة والاستحقاق قبل أسبوع أو أكثر)
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            return payments.filter(payment => {
                const dueDate = new Date(payment.dueDate);
                return !payment.paid && dueDate < oneWeekAgo;
            });
        
        default:
            return payments;
    }
}

/**
 * حساب المبلغ المتبقي للقرض
 * @param {Object} loan بيانات القرض
 * @returns {number} المبلغ المتبقي
 */
function calculateRemainingAmount(loan) {
    try {
        // الحصول على جميع مدفوعات هذا القرض
        const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
        const loanPayments = payments.filter(payment => payment.loanId === loan.id);
        
        // حساب إجمالي المبالغ المدفوعة
        const totalPaid = loanPayments
            .filter(payment => payment.paid)
            .reduce((total, payment) => total + parseFloat(payment.amount), 0);
        
        // المبلغ المتبقي
        return parseFloat(loan.amount) - totalPaid;
    } catch (error) {
        console.error('خطأ في حساب المبلغ المتبقي للقرض:', error);
        return parseFloat(loan.amount);
    }
}

/**
 * الحصول على حالة القرض
 * @param {Object} loan بيانات القرض
 * @returns {Object} كائن يحتوي على نص الحالة وفئة CSS
 */
function getLoanStatus(loan) {
    try {
        // حساب نسبة السداد
        const remainingAmount = calculateRemainingAmount(loan);
        const paymentPercentage = (parseFloat(loan.amount) - remainingAmount) / parseFloat(loan.amount) * 100;
        
        // التحقق من الحالة
        if (paymentPercentage >= 100) {
            return { text: 'مكتمل', class: 'success' };
        }
        
        // التحقق من التأخر في السداد
        const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
        const loanPayments = payments.filter(payment => payment.loanId === loan.id);
        
        const today = new Date();
        const latePayments = loanPayments.filter(payment => {
            const dueDate = new Date(payment.dueDate);
            return !payment.paid && dueDate < today;
        });
        
        if (latePayments.length > 0) {
            // التحقق من التعثر
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            
            const defaultedPayments = latePayments.filter(payment => {
                const dueDate = new Date(payment.dueDate);
                return dueDate < oneMonthAgo;
            });
            
            if (defaultedPayments.length > 0) {
                return { text: 'متعثر', class: 'danger' };
            }
            
            return { text: 'متأخر', class: 'warning' };
        }
        
        return { text: 'نشط', class: 'primary' };
    } catch (error) {
        console.error('خطأ في الحصول على حالة القرض:', error);
        return { text: 'غير معروف', class: 'secondary' };
    }
}

/**
 * الحصول على حالة الدفع
 * @param {Object} payment بيانات الدفع
 * @returns {Object} كائن يحتوي على نص الحالة وفئة CSS
 */
function getPaymentStatus(payment) {
    if (payment.paid) {
        return { text: 'مدفوع', class: 'success' };
    }
    
    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    
    if (dueDate < today) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        if (dueDate < oneWeekAgo) {
            return { text: 'متأخر', class: 'danger' };
        }
        
        return { text: 'مستحق', class: 'warning' };
    }
    
    return { text: 'قادم', class: 'info' };
}

/**
 * حساب المدفوعات المستحقة في الشهر الحالي
 * @param {Array} payments مصفوفة المدفوعات
 * @returns {number} إجمالي المدفوعات المستحقة
 */
function calculateCurrentMonthDuePayments(payments) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // تصفية المدفوعات المستحقة في الشهر الحالي والتي لم يتم دفعها بعد
    const currentMonthPayments = payments.filter(payment => {
        const dueDate = new Date(payment.dueDate);
        return !payment.paid && 
               dueDate.getMonth() === currentMonth && 
               dueDate.getFullYear() === currentYear;
    });
    
    // حساب إجمالي المبالغ المستحقة
    return currentMonthPayments.reduce((total, payment) => total + parseFloat(payment.amount), 0);
}

// دوال مساعدة لتحميل البيانات ومعالجتها

/**
 * تحميل بيانات القروض
 */
function loadLoanData() {
    // التحقق من وجود بيانات في التخزين المحلي
    const hasLocalData = localStorage.getItem('loans') !== null;
    
    if (!hasLocalData) {
        // إذا لم تكن هناك بيانات محلية، يمكن تحميلها من Firebase أو إنشاء بيانات تجريبية
        createDummyLoanData();
    }
    
    // تحديث واجهة المستخدم بالبيانات المحملة
    updateNavBadges();
}

/**
 * إنشاء بيانات تجريبية للقروض (في حالة عدم وجود بيانات)
 */
function createDummyLoanData() {
    // إنشاء قروض تجريبية
    const dummyLoans = [
        {
            id: 'L001',
            borrowerName: 'أحمد محمد',
            amount: 5000000,
            startDate: '2025-01-15',
            duration: 12, // شهور
            interestRate: 5,
            paymentDay: 15
        },
        {
            id: 'L002',
            borrowerName: 'سارة علي',
            amount: 3000000,
            startDate: '2024-12-10',
            duration: 6,
            interestRate: 4,
            paymentDay: 10
        },
        {
            id: 'L003',
            borrowerName: 'محمود حسين',
            amount: 10000000,
            startDate: '2024-11-05',
            duration: 24,
            interestRate: 6,
            paymentDay: 5
        }
    ];
    
    // إنشاء مدفوعات تجريبية لكل قرض
    const dummyPayments = [];
    
    dummyLoans.forEach(loan => {
        const startDate = new Date(loan.startDate);
        const monthlyAmount = calculateMonthlyPayment(loan.amount, loan.interestRate, loan.duration);
        
        for (let i = 0; i < loan.duration; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            dueDate.setDate(loan.paymentDay);
           /**
 * Continuación de loan-system-fix.js
 */

// تحديد ما إذا كان القسط مدفوعًا (نفترض أن الأقساط السابقة قد تم دفعها)
const today = new Date();
const isPaid = dueDate < today && i < 2; // افتراض أن أول قسطين تم دفعهما

const paymentId = `P${loan.id.substring(1)}-${(i + 1).toString().padStart(2, '0')}`;

dummyPayments.push({
    id: paymentId,
    loanId: loan.id,
    installmentNumber: i + 1,
    amount: monthlyAmount,
    dueDate: dueDate.toISOString().split('T')[0],
    paid: isPaid,
    paymentDate: isPaid ? new Date(dueDate.getTime() - Math.random() * 86400000 * 5).toISOString().split('T')[0] : null,
    notes: ''
});
}
});

// حفظ البيانات التجريبية في التخزين المحلي
localStorage.setItem('loans', JSON.stringify(dummyLoans));
localStorage.setItem('loanPayments', JSON.stringify(dummyPayments));

console.log('تم إنشاء بيانات تجريبية للقروض والمدفوعات');
}

/**
 * حساب القسط الشهري
 * @param {number} loanAmount مبلغ القرض
 * @param {number} interestRate معدل الفائدة السنوي (%)
 * @param {number} loanTermMonths مدة القرض بالشهور
 * @returns {number} القسط الشهري
 */
function calculateMonthlyPayment(loanAmount, interestRate, loanTermMonths) {
// تحويل معدل الفائدة السنوي إلى معدل شهري
const monthlyRate = interestRate / 100 / 12;

// حساب القسط الشهري
if (monthlyRate === 0) {
    // في حالة عدم وجود فائدة
    return loanAmount / loanTermMonths;
} else {
    // صيغة حساب القسط الشهري مع الفائدة
    const x = Math.pow(1 + monthlyRate, loanTermMonths);
    return (loanAmount * x * monthlyRate) / (x - 1);
}
}

// =====================================
// وظائف إدارة القروض
// =====================================

// دالة عرض تفاصيل القرض
window.showLoanDetails = function(loanId) {
try {
    // استرداد بيانات القرض
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    const loan = loans.find(loan => loan.id === loanId);
    
    if (!loan) {
        console.error(`لم يتم العثور على القرض رقم: ${loanId}`);
        return;
    }
    
    // استرداد مدفوعات القرض
    const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
    const loanPayments = payments.filter(payment => payment.loanId === loanId);
    
    // إنشاء المحتوى بناءً على بيانات القرض
    const remainingAmount = calculateRemainingAmount(loan);
    const paidAmount = parseFloat(loan.amount) - remainingAmount;
    const paidPercentage = (paidAmount / parseFloat(loan.amount) * 100).toFixed(1);
    
    // حساب الفائدة المتوقعة على القرض
    const totalPayments = loanPayments.reduce((total, payment) => total + parseFloat(payment.amount), 0);
    const interestAmount = totalPayments - parseFloat(loan.amount);
    
    // حساب عدد الأقساط المدفوعة والمتبقية
    const paidInstallments = loanPayments.filter(payment => payment.paid).length;
    const remainingInstallments = loanPayments.filter(payment => !payment.paid).length;
    
    // إنشاء معرف عشوائي للنموذج
    const modalId = `loan-details-modal-${Math.random().toString(36).substring(2, 9)}`;
    
    // إنشاء نموذج عرض تفاصيل القرض
    const modalHTML = `
        <div class="modal-overlay" id="${modalId}">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تفاصيل القرض #${loan.id}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="loan-details">
                        <div class="loan-header">
                            <div class="loan-borrower">
                                <h4>${loan.borrowerName}</h4>
                                <span class="status-badge ${getLoanStatus(loan).class}">${getLoanStatus(loan).text}</span>
                            </div>
                            <div class="loan-progress">
                                <div class="progress-bar">
                                    <div class="progress" style="width: ${paidPercentage}%"></div>
                                </div>
                                <div class="progress-label">${paidPercentage}% مكتمل</div>
                            </div>
                        </div>
                        
                        <div class="loan-info-grid">
                            <div class="loan-info-item">
                                <div class="loan-info-label">مبلغ القرض</div>
                                <div class="loan-info-value">${formatCurrency(loan.amount)}</div>
                            </div>
                            <div class="loan-info-item">
                                <div class="loan-info-label">تاريخ البدء</div>
                                <div class="loan-info-value">${formatDate(loan.startDate)}</div>
                            </div>
                            <div class="loan-info-item">
                                <div class="loan-info-label">مدة القرض</div>
                                <div class="loan-info-value">${loan.duration} شهر</div>
                            </div>
                            <div class="loan-info-item">
                                <div class="loan-info-label">معدل الفائدة</div>
                                <div class="loan-info-value">${loan.interestRate}%</div>
                            </div>
                            <div class="loan-info-item">
                                <div class="loan-info-label">المبلغ المسدد</div>
                                <div class="loan-info-value">${formatCurrency(paidAmount)}</div>
                            </div>
                            <div class="loan-info-item">
                                <div class="loan-info-label">المبلغ المتبقي</div>
                                <div class="loan-info-value">${formatCurrency(remainingAmount)}</div>
                            </div>
                            <div class="loan-info-item">
                                <div class="loan-info-label">الفائدة المتوقعة</div>
                                <div class="loan-info-value">${formatCurrency(interestAmount)}</div>
                            </div>
                            <div class="loan-info-item">
                                <div class="loan-info-label">يوم الدفع الشهري</div>
                                <div class="loan-info-value">${loan.paymentDay}</div>
                            </div>
                        </div>
                        
                        <div class="loan-payments-summary">
                            <div class="summary-item">
                                <div class="summary-icon primary">
                                    <i class="fas fa-calendar-alt"></i>
                                </div>
                                <div class="summary-info">
                                    <div class="summary-label">إجمالي الأقساط</div>
                                    <div class="summary-value">${loanPayments.length}</div>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon success">
                                    <i class="fas fa-check"></i>
                                </div>
                                <div class="summary-info">
                                    <div class="summary-label">الأقساط المدفوعة</div>
                                    <div class="summary-value">${paidInstallments}</div>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon warning">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="summary-info">
                                    <div class="summary-label">الأقساط المتبقية</div>
                                    <div class="summary-value">${remainingInstallments}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="loan-payments-list">
                            <h4>جدول الأقساط</h4>
                            <div class="table-container">
                                <table class="installments-table">
                                    <thead>
                                        <tr>
                                            <th>رقم القسط</th>
                                            <th>تاريخ الاستحقاق</th>
                                            <th>المبلغ</th>
                                            <th>الحالة</th>
                                            <th>تاريخ الدفع</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${loanPayments.sort((a, b) => a.installmentNumber - b.installmentNumber).map(payment => {
                                            const status = getPaymentStatus(payment);
                                            return `
                                                <tr>
                                                    <td>${payment.installmentNumber}</td>
                                                    <td>${formatDate(payment.dueDate)}</td>
                                                    <td>${formatCurrency(payment.amount)}</td>
                                                    <td><span class="status-badge ${status.class}">${status.text}</span></td>
                                                    <td>${payment.paid ? formatDate(payment.paymentDate) : '-'}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="editLoan('${loan.id}')">
                            <i class="fas fa-edit"></i>
                            <span>تعديل</span>
                        </button>
                        <button class="btn btn-success" onclick="showPayAllModal('${loan.id}')">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>سداد القرض</span>
                        </button>
                        <button class="btn btn-danger" onclick="showDeleteLoanModal('${loan.id}')">
                            <i class="fas fa-trash"></i>
                            <span>حذف</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // إضافة النموذج إلى صفحة الويب
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // الحصول على النموذج المضاف
    const modal = document.getElementById(modalId);
    
    // إضافة مستمع أحداث لإغلاق النموذج
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // إظهار النموذج
    modal.style.display = 'flex';
} catch (error) {
    console.error('خطأ في عرض تفاصيل القرض:', error);
    alert('حدث خطأ أثناء عرض تفاصيل القرض');
}
};

// دالة لتعديل بيانات قرض
window.editLoan = function(loanId) {
try {
    // استرداد بيانات القرض
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    const loan = loans.find(loan => loan.id === loanId);
    
    if (!loan) {
        console.error(`لم يتم العثور على القرض رقم: ${loanId}`);
        return;
    }
    
    // إنشاء معرف عشوائي للنموذج
    const modalId = `edit-loan-modal-${Math.random().toString(36).substring(2, 9)}`;
    
    // إنشاء نموذج تعديل القرض
    const modalHTML = `
        <div class="modal-overlay" id="${modalId}">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تعديل القرض #${loan.id}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="edit-loan-form-${loanId}">
                        <div class="grid-cols-2">
                            <div class="form-group">
                                <label class="form-label">اسم المقترض</label>
                                <input class="form-input" id="edit-borrower-name-${loanId}" value="${loan.borrowerName}" required="" type="text" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">مبلغ القرض (بالدينار)</label>
                                <input class="form-input" id="edit-loan-amount-${loanId}" value="${loan.amount}" min="1" required="" type="number" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">تاريخ البدء</label>
                                <input class="form-input" id="edit-start-date-${loanId}" value="${loan.startDate}" required="" type="date" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">مدة القرض (بالشهور)</label>
                                <input class="form-input" id="edit-duration-${loanId}" value="${loan.duration}" min="1" max="240" required="" type="number" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">معدل الفائدة (%)</label>
                                <input class="form-input" id="edit-interest-rate-${loanId}" value="${loan.interestRate}" min="0" max="100" step="0.1" required="" type="number" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">يوم الدفع الشهري</label>
                                <input class="form-input" id="edit-payment-day-${loanId}" value="${loan.paymentDay}" min="1" max="31" required="" type="number" />
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>تحذير: تعديل البيانات قد يؤثر على جدول الأقساط المستقبلية. سيتم الاحتفاظ بالمدفوعات السابقة.</span>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-edit-loan-btn-${loanId}">حفظ التغييرات</button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة النموذج إلى صفحة الويب
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // الحصول على النموذج المضاف
    const modal = document.getElementById(modalId);
    
    // إضافة مستمع أحداث لإغلاق النموذج
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // إضافة مستمع أحداث لزر الحفظ
    const saveButton = document.getElementById(`save-edit-loan-btn-${loanId}`);
    saveButton.addEventListener('click', () => {
        // الحصول على القيم المدخلة
        const borrowerName = document.getElementById(`edit-borrower-name-${loanId}`).value;
        const amount = parseFloat(document.getElementById(`edit-loan-amount-${loanId}`).value);
        const startDate = document.getElementById(`edit-start-date-${loanId}`).value;
        const duration = parseInt(document.getElementById(`edit-duration-${loanId}`).value);
        const interestRate = parseFloat(document.getElementById(`edit-interest-rate-${loanId}`).value);
        const paymentDay = parseInt(document.getElementById(`edit-payment-day-${loanId}`).value);
        
        // التحقق من صحة البيانات
        if (!borrowerName || isNaN(amount) || !startDate || isNaN(duration) || isNaN(interestRate) || isNaN(paymentDay)) {
            alert('يرجى التأكد من إدخال جميع البيانات بشكل صحيح');
            return;
        }
        
        // تحديث بيانات القرض
        const updatedLoan = {
            ...loan,
            borrowerName,
            amount,
            startDate,
            duration,
            interestRate,
            paymentDay
        };
        
        // تحديث القرض في المصفوفة
        const loanIndex = loans.findIndex(l => l.id === loanId);
        if (loanIndex !== -1) {
            loans[loanIndex] = updatedLoan;
        }
        
        // حفظ التغييرات في التخزين المحلي
        localStorage.setItem('loans', JSON.stringify(loans));
        
        // إعادة توليد جدول الأقساط للقرض
        updateLoanInstallments(updatedLoan);
        
        // تحديث واجهة المستخدم
        updateLoansTable();
        updatePaymentsTable();
        updateLoanReports();
        updateNavBadges();
        
        // إغلاق النموذج
        modal.remove();
        
        // إظهار رسالة نجاح
        alert('تم تحديث بيانات القرض بنجاح');
    });
    
    // إظهار النموذج
    modal.style.display = 'flex';
} catch (error) {
    console.error('خطأ في تعديل القرض:', error);
    alert('حدث خطأ أثناء تعديل بيانات القرض');
}
};

/**
 * تحديث أقساط القرض بعد تعديل بياناته
 * @param {Object} loan كائن القرض المعدل
 */
function updateLoanInstallments(loan) {
try {
    // استرداد جميع المدفوعات
    const allPayments = JSON.parse(localStorage.getItem('loanPayments')) || [];
    
    // فصل مدفوعات القرض الحالي
    const loanPayments = allPayments.filter(payment => payment.loanId === loan.id);
    const otherPayments = allPayments.filter(payment => payment.loanId !== loan.id);
    
    // الاحتفاظ بالمدفوعات المدفوعة بالفعل
    const paidPayments = loanPayments.filter(payment => payment.paid);
    
    // إنشاء جدول أقساط جديد
    const newPayments = [];
    const startDate = new Date(loan.startDate);
    const monthlyAmount = calculateMonthlyPayment(loan.amount, loan.interestRate, loan.duration);
    
    for (let i = 0; i < loan.duration; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        dueDate.setDate(loan.paymentDay);
        
        const paymentId = `P${loan.id.substring(1)}-${(i + 1).toString().padStart(2, '0')}`;
        
        // التحقق مما إذا كان هذا القسط مدفوعًا بالفعل
        const existingPaidPayment = paidPayments.find(p => p.installmentNumber === i + 1);
        
        if (existingPaidPayment) {
            // الاحتفاظ بالقسط المدفوع مع تحديث المبلغ إذا لزم الأمر
            newPayments.push({
                ...existingPaidPayment,
                amount: monthlyAmount
            });
        } else {
            // إنشاء قسط جديد
            newPayments.push({
                id: paymentId,
                loanId: loan.id,
                installmentNumber: i + 1,
                amount: monthlyAmount,
                dueDate: dueDate.toISOString().split('T')[0],
                paid: false,
                paymentDate: null,
                notes: ''
            });
        }
    }
    
    // دمج المدفوعات الجديدة مع المدفوعات الأخرى
    const updatedPayments = [...otherPayments, ...newPayments];
    
    // حفظ المدفوعات المحدثة في التخزين المحلي
    localStorage.setItem('loanPayments', JSON.stringify(updatedPayments));
    
    console.log('تم تحديث جدول أقساط القرض بنجاح');
} catch (error) {
    console.error('خطأ في تحديث أقساط القرض:', error);
    throw error;
}
}

// دالة لعرض مدفوعات القرض
window.showLoanPayments = function(loanId) {
try {
    // استرداد بيانات القرض
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    const loan = loans.find(loan => loan.id === loanId);
    
    if (!loan) {
        console.error(`لم يتم العثور على القرض رقم: ${loanId}`);
        return;
    }
    
    // استرداد مدفوعات القرض
    const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
    const loanPayments = payments.filter(payment => payment.loanId === loanId);
    
    // فرز المدفوعات حسب رقم القسط
    loanPayments.sort((a, b) => a.installmentNumber - b.installmentNumber);
    
    // إنشاء معرف عشوائي للنموذج
    const modalId = `loan-payments-modal-${Math.random().toString(36).substring(2, 9)}`;
    
    // إنشاء نموذج عرض مدفوعات القرض
    const modalHTML = `
        <div class="modal-overlay" id="${modalId}">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">مدفوعات القرض - ${loan.borrowerName}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="loan-payments">
                        <div class="loan-summary">
                            <div class="loan-info">
                                <div><strong>رقم القرض:</strong> ${loan.id}</div>
                                <div><strong>المبلغ:</strong> ${formatCurrency(loan.amount)}</div>
                                <div><strong>تاريخ البدء:</strong> ${formatDate(loan.startDate)}</div>
                            </div>
                            <div class="loan-status">
                                <span class="status-badge ${getLoanStatus(loan).class}">${getLoanStatus(loan).text}</span>
                            </div>
                        </div>
                        
                        <div class="table-container">
                            <table class="payments-table">
                                <thead>
                                    <tr>
                                        <th>رقم القسط</th>
                                        <th>تاريخ الاستحقاق</th>
                                        <th>المبلغ</th>
                                        <th>الحالة</th>
                                        <th>تاريخ الدفع</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${loanPayments.map(payment => {
                                        const status = getPaymentStatus(payment);
                                        return `
                                            <tr data-payment-id="${payment.id}">
                                                <td>${payment.installmentNumber}</td>
                                                <td>${formatDate(payment.dueDate)}</td>
                                                <td>${formatCurrency(payment.amount)}</td>
                                                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                                                <td>${payment.paid ? formatDate(payment.paymentDate) : '-'}</td>
                                                <td>
                                                    <div class="actions">
                                                        ${!payment.paid ? `
                                                            <button class="btn btn-icon" title="تسجيل الدفع" onclick="recordPayment('${payment.id}')">
                                                                <i class="fas fa-check-circle"></i>
                                                            </button>
                                                        ` : `
                                                            <button class="btn btn-icon" title="إلغاء الدفع" onclick="cancelPayment('${payment.id}')">
                                                                <i class="fas fa-times-circle"></i>
                                                            </button>
                                                        `}
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة النموذج إلى صفحة الويب
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // الحصول على النموذج المضاف
    const modal = document.getElementById(modalId);
    
    // إضافة مستمع أحداث لإغلاق النموذج
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // إظهار النموذج
    modal.style.display = 'flex';
} catch (error) {
    console.error('خطأ في عرض مدفوعات القرض:', error);
    alert('حدث خطأ أثناء عرض مدفوعات القرض');
}
};

// دالة لتسجيل دفع قسط
window.recordPayment = function(paymentId) {
try {
    // استرداد جميع المدفوعات
    const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
    
    // البحث عن الدفعة المطلوبة
    const paymentIndex = payments.findIndex(payment => payment.id === paymentId);
    
    if (paymentIndex === -1) {
        console.error(`لم يتم العثور على الدفعة رقم: ${paymentId}`);
        return;
    }
    
    // الحصول على الدفعة
    const payment = payments[paymentIndex];
    
    // التحقق مما إذا كان القسط مدفوعًا بالفعل
    if (payment.paid) {
        alert('تم دفع هذا القسط بالفعل');
        return;
    }
    
    // إنشاء معرف عشوائي للنموذج
    const modalId = `record-payment-modal-${Math.random().toString(36).substring(2, 9)}`;
    
    // إنشاء نموذج تسجيل الدفع
    const modalHTML = `
        <div class="modal-overlay" id="${modalId}">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تسجيل دفع القسط</h3>
                    <button class="modal-close">×</button>
                </div>
                /**
 * Continuation of loan-system-fix-continued.js
 */

// Modal content continued...
                <div class="modal-body">
                    <form id="record-payment-form-${paymentId}">
                        <div class="payment-details">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <span>أنت على وشك تسجيل دفع القسط رقم ${payment.installmentNumber} بمبلغ ${formatCurrency(payment.amount)}.</span>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">تاريخ الدفع</label>
                                <input class="form-input" id="payment-date-${paymentId}" type="date" value="${new Date().toISOString().split('T')[0]}" required />
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">ملاحظات</label>
                                <textarea class="form-input" id="payment-notes-${paymentId}" rows="3" placeholder="إضافة ملاحظات اختيارية..."></textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-success" id="confirm-payment-btn-${paymentId}">تأكيد الدفع</button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة النموذج إلى صفحة الويب
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // الحصول على النموذج المضاف
    const modal = document.getElementById(modalId);
    
    // إضافة مستمع أحداث لإغلاق النموذج
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // إضافة مستمع أحداث لزر تأكيد الدفع
    const confirmButton = document.getElementById(`confirm-payment-btn-${paymentId}`);
    confirmButton.addEventListener('click', () => {
        // الحصول على قيم النموذج
        const paymentDate = document.getElementById(`payment-date-${paymentId}`).value;
        const notes = document.getElementById(`payment-notes-${paymentId}`).value;
        
        // التحقق من صحة التاريخ
        if (!paymentDate) {
            alert('يرجى إدخال تاريخ الدفع');
            return;
        }
        
        // تحديث الدفعة
        payments[paymentIndex] = {
            ...payment,
            paid: true,
            paymentDate: paymentDate,
            notes: notes
        };
        
        // حفظ التغييرات في التخزين المحلي
        localStorage.setItem('loanPayments', JSON.stringify(payments));
        
        // تحديث واجهة المستخدم
        updatePaymentsTable();
        updateLoansTable();
        updateLoanReports();
        updateNavBadges();
        
        // إغلاق النموذج
        modal.remove();
        
        // إظهار رسالة نجاح
        alert('تم تسجيل الدفع بنجاح');
        
        // إعادة فتح نافذة مدفوعات القرض لتحديث العرض
        showLoanPayments(payment.loanId);
    });
    
    // إظهار النموذج
    modal.style.display = 'flex';
} catch (error) {
    console.error('خطأ في تسجيل دفع القسط:', error);
    alert('حدث خطأ أثناء تسجيل دفع القسط');
}
};

// دالة لإلغاء دفع قسط
window.cancelPayment = function(paymentId) {
try {
    // التأكد من رغبة المستخدم في إلغاء الدفع
    if (!confirm('هل أنت متأكد من إلغاء دفع هذا القسط؟')) {
        return;
    }
    
    // استرداد جميع المدفوعات
    const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
    
    // البحث عن الدفعة المطلوبة
    const paymentIndex = payments.findIndex(payment => payment.id === paymentId);
    
    if (paymentIndex === -1) {
        console.error(`لم يتم العثور على الدفعة رقم: ${paymentId}`);
        return;
    }
    
    // الحصول على الدفعة
    const payment = payments[paymentIndex];
    
    // التحقق مما إذا كان القسط غير مدفوع
    if (!payment.paid) {
        alert('هذا القسط غير مدفوع بالفعل');
        return;
    }
    
    // تحديث الدفعة
    payments[paymentIndex] = {
        ...payment,
        paid: false,
        paymentDate: null,
        notes: payment.notes + ' (تم إلغاء الدفع)'
    };
    
    // حفظ التغييرات في التخزين المحلي
    localStorage.setItem('loanPayments', JSON.stringify(payments));
    
    // تحديث واجهة المستخدم
    updatePaymentsTable();
    updateLoansTable();
    updateLoanReports();
    updateNavBadges();
    
    // إظهار رسالة نجاح
    alert('تم إلغاء دفع القسط بنجاح');
    
    // إعادة فتح نافذة مدفوعات القرض لتحديث العرض
    showLoanPayments(payment.loanId);
} catch (error) {
    console.error('خطأ في إلغاء دفع القسط:', error);
    alert('حدث خطأ أثناء إلغاء دفع القسط');
}
};

// دالة لعرض نموذج حذف قرض
window.showDeleteLoanModal = function(loanId) {
try {
    // التأكد من رغبة المستخدم في حذف القرض
    if (!confirm('هل أنت متأكد من حذف هذا القرض وجميع الأقساط المرتبطة به؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        return;
    }
    
    // استرداد بيانات القروض
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    
    // البحث عن القرض المطلوب
    const loanIndex = loans.findIndex(loan => loan.id === loanId);
    
    if (loanIndex === -1) {
        console.error(`لم يتم العثور على القرض رقم: ${loanId}`);
        return;
    }
    
    // حذف القرض من المصفوفة
    loans.splice(loanIndex, 1);
    
    // حفظ التغييرات في التخزين المحلي
    localStorage.setItem('loans', JSON.stringify(loans));
    
    // حذف جميع الأقساط المرتبطة بالقرض
    const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
    const updatedPayments = payments.filter(payment => payment.loanId !== loanId);
    localStorage.setItem('loanPayments', JSON.stringify(updatedPayments));
    
    // تحديث واجهة المستخدم
    updateLoansTable();
    updatePaymentsTable();
    updateLoanReports();
    updateNavBadges();
    
    // إظهار رسالة نجاح
    alert('تم حذف القرض بنجاح');
} catch (error) {
    console.error('خطأ في حذف القرض:', error);
    alert('حدث خطأ أثناء حذف القرض');
}
};

// دالة لعرض نموذج سداد القرض بالكامل
window.showPayAllModal = function(loanId) {
try {
    // استرداد بيانات القرض
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    const loan = loans.find(loan => loan.id === loanId);
    
    if (!loan) {
        console.error(`لم يتم العثور على القرض رقم: ${loanId}`);
        return;
    }
    
    // استرداد مدفوعات القرض
    const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
    const loanPayments = payments.filter(payment => payment.loanId === loanId);
    
    // حساب المبلغ المتبقي للسداد
    const unpaidPayments = loanPayments.filter(payment => !payment.paid);
    const totalRemaining = unpaidPayments.reduce((total, payment) => total + parseFloat(payment.amount), 0);
    
    // التحقق من وجود مدفوعات متبقية
    if (unpaidPayments.length === 0) {
        alert('تم سداد هذا القرض بالكامل بالفعل');
        return;
    }
    
    // إنشاء معرف عشوائي للنموذج
    const modalId = `pay-all-modal-${Math.random().toString(36).substring(2, 9)}`;
    
    // إنشاء نموذج سداد القرض
    const modalHTML = `
        <div class="modal-overlay" id="${modalId}">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">سداد القرض بالكامل</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="payment-details">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i>
                            <span>أنت على وشك تسجيل سداد القرض بالكامل للمقترض <strong>${loan.borrowerName}</strong>.</span>
                        </div>
                        
                        <div class="payment-summary">
                            <div class="summary-item">
                                <div class="summary-label">إجمالي المبلغ المتبقي</div>
                                <div class="summary-value">${formatCurrency(totalRemaining)}</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">عدد الأقساط المتبقية</div>
                                <div class="summary-value">${unpaidPayments.length}</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">تاريخ السداد</div>
                                <div class="summary-value">
                                    <input class="form-input" id="pay-all-date-${loanId}" type="date" value="${new Date().toISOString().split('T')[0]}" required />
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-input" id="pay-all-notes-${loanId}" rows="3" placeholder="إضافة ملاحظات اختيارية..."></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-success" id="confirm-pay-all-btn-${loanId}">تأكيد السداد</button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة النموذج إلى صفحة الويب
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // الحصول على النموذج المضاف
    const modal = document.getElementById(modalId);
    
    // إضافة مستمع أحداث لإغلاق النموذج
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // إضافة مستمع أحداث لزر تأكيد السداد
    const confirmButton = document.getElementById(`confirm-pay-all-btn-${loanId}`);
    confirmButton.addEventListener('click', () => {
        // الحصول على قيم النموذج
        const paymentDate = document.getElementById(`pay-all-date-${loanId}`).value;
        const notes = document.getElementById(`pay-all-notes-${loanId}`).value;
        
        // التحقق من صحة التاريخ
        if (!paymentDate) {
            alert('يرجى إدخال تاريخ السداد');
            return;
        }
        
        // تحديث جميع المدفوعات غير المدفوعة
        const allPayments = JSON.parse(localStorage.getItem('loanPayments')) || [];
        const updatedPayments = allPayments.map(payment => {
            if (payment.loanId === loanId && !payment.paid) {
                return {
                    ...payment,
                    paid: true,
                    paymentDate: paymentDate,
                    notes: notes ? notes + ' (سداد كلي)' : 'سداد كلي'
                };
            }
            return payment;
        });
        
        // حفظ التغييرات في التخزين المحلي
        localStorage.setItem('loanPayments', JSON.stringify(updatedPayments));
        
        // تحديث واجهة المستخدم
        updatePaymentsTable();
        updateLoansTable();
        updateLoanReports();
        updateNavBadges();
        
        // إغلاق النموذج
        modal.remove();
        
        // إظهار رسالة نجاح
        alert('تم تسجيل سداد القرض بالكامل بنجاح');
    });
    
    // إظهار النموذج
    modal.style.display = 'flex';
} catch (error) {
    console.error('خطأ في سداد القرض بالكامل:', error);
    alert('حدث خطأ أثناء سداد القرض بالكامل');
}
};

// دالة لإضافة قرض جديد
window.openAddLoanModal = function() {
try {
    // إنشاء معرف عشوائي للنموذج
    const modalId = `add-loan-modal-${Math.random().toString(36).substring(2, 9)}`;
    
    // إنشاء نموذج إضافة قرض جديد
    const modalHTML = `
        <div class="modal-overlay" id="${modalId}">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">إضافة قرض جديد</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="add-loan-form">
                        <div class="grid-cols-2">
                            <div class="form-group">
                                <label class="form-label">اسم المقترض</label>
                                <input class="form-input" id="add-borrower-name" required="" type="text" placeholder="أدخل اسم المقترض" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">رقم الهاتف</label>
                                <input class="form-input" id="add-borrower-phone" type="tel" placeholder="أدخل رقم الهاتف" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">مبلغ القرض (بالدينار)</label>
                                <input class="form-input" id="add-loan-amount" min="1" required="" step="1000" type="number" placeholder="أدخل مبلغ القرض" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">تاريخ البدء</label>
                                <input class="form-input" id="add-start-date" required="" type="date" value="${new Date().toISOString().split('T')[0]}" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">مدة القرض (بالشهور)</label>
                                <input class="form-input" id="add-duration" min="1" max="240" required="" type="number" value="12" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">معدل الفائدة (%)</label>
                                <input class="form-input" id="add-interest-rate" min="0" max="100" step="0.1" required="" type="number" value="5" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">يوم الدفع الشهري</label>
                                <input class="form-input" id="add-payment-day" min="1" max="31" required="" type="number" value="${new Date().getDate()}" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">نوع القرض</label>
                                <select class="form-select" id="add-loan-type">
                                    <option value="personal">شخصي</option>
                                    <option value="business">تجاري</option>
                                    <option value="mortgage">سكني</option>
                                    <option value="car">سيارة</option>
                                    <option value="other">أخرى</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-input" id="add-loan-notes" rows="3" placeholder="إضافة ملاحظات اختيارية..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-loan-btn">إضافة القرض</button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة النموذج إلى صفحة الويب
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // الحصول على النموذج المضاف
    const modal = document.getElementById(modalId);
    
    // إضافة مستمع أحداث لإغلاق النموذج
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // إضافة مستمع أحداث لزر الإضافة
    const saveButton = document.getElementById('save-loan-btn');
    saveButton.addEventListener('click', () => {
        // الحصول على قيم النموذج
        const borrowerName = document.getElementById('add-borrower-name').value;
        const borrowerPhone = document.getElementById('add-borrower-phone').value;
        const amount = parseFloat(document.getElementById('add-loan-amount').value);
        const startDate = document.getElementById('add-start-date').value;
        const duration = parseInt(document.getElementById('add-duration').value);
        const interestRate = parseFloat(document.getElementById('add-interest-rate').value);
        const paymentDay = parseInt(document.getElementById('add-payment-day').value);
        const loanType = document.getElementById('add-loan-type').value;
        const notes = document.getElementById('add-loan-notes').value;
        
        // التحقق من صحة البيانات
        if (!borrowerName || isNaN(amount) || !startDate || isNaN(duration) || isNaN(interestRate) || isNaN(paymentDay)) {
            alert('يرجى التأكد من إدخال جميع البيانات الإلزامية بشكل صحيح');
            return;
        }
        
        // إنشاء معرف فريد للقرض
        const loans = JSON.parse(localStorage.getItem('loans')) || [];
        const loanId = `L${(loans.length + 1).toString().padStart(3, '0')}`;
        
        // إنشاء كائن القرض الجديد
        const newLoan = {
            id: loanId,
            borrowerName,
            borrowerPhone,
            amount,
            startDate,
            duration,
            interestRate,
            paymentDay,
            loanType,
            notes,
            createdAt: new Date().toISOString()
        };
        
        // إضافة القرض إلى المصفوفة
        loans.push(newLoan);
        
        // حفظ التغييرات في التخزين المحلي
        localStorage.setItem('loans', JSON.stringify(loans));
        
        // إنشاء جدول أقساط للقرض الجديد
        createLoanInstallments(newLoan);
        
        // تحديث واجهة المستخدم
        updateLoansTable();
        updatePaymentsTable();
        updateLoanReports();
        updateNavBadges();
        
        // إغلاق النموذج
        modal.remove();
        
        // إظهار رسالة نجاح
        alert('تم إضافة القرض بنجاح');
    });
    
    // إظهار النموذج
    modal.style.display = 'flex';
} catch (error) {
    console.error('خطأ في فتح نموذج إضافة قرض:', error);
    alert('حدث خطأ أثناء فتح نموذج إضافة قرض');
}
};

/**
 * إنشاء جدول أقساط لقرض جديد
 * @param {Object} loan كائن القرض
 */
function createLoanInstallments(loan) {
try {
    // استرداد جميع المدفوعات
    const allPayments = JSON.parse(localStorage.getItem('loanPayments')) || [];
    
    // حساب القسط الشهري
    const monthlyAmount = calculateMonthlyPayment(loan.amount, loan.interestRate, loan.duration);
    
    // إنشاء جدول أقساط
    const installments = [];
    const startDate = new Date(loan.startDate);
    
    for (let i = 0; i < loan.duration; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        // التأكد من أن يوم الاستحقاق موجود في الشهر
        const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
        const paymentDay = Math.min(loan.paymentDay, lastDayOfMonth);
        dueDate.setDate(paymentDay);
        
        // إنشاء معرف فريد للقسط
        const installmentId = `P${loan.id.substring(1)}-${(i + 1).toString().padStart(2, '0')}`;
        
        // إضافة القسط
        installments.push({
            id: installmentId,
            loanId: loan.id,
            installmentNumber: i + 1,
            amount: monthlyAmount,
            dueDate: dueDate.toISOString().split('T')[0],
            paid: false,
            paymentDate: null,
            notes: ''
        });
    }
    
    // إضافة الأقساط الجديدة إلى المصفوفة
    const updatedPayments = [...allPayments, ...installments];
    
    // حفظ التغييرات في التخزين المحلي
    localStorage.setItem('loanPayments', JSON.stringify(updatedPayments));
    
    console.log('تم إنشاء جدول أقساط للقرض بنجاح');
} catch (error) {
    console.error('خطأ في إنشاء جدول أقساط للقرض:', error);
    throw error;
}
}

// دالة لعرض تفاصيل الدفعة
window.showPaymentDetails = function(paymentId) {
try {
    // استرداد معلومات الدفعة
    const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
        console.error(`لم يتم العثور على الدفعة رقم: ${paymentId}`);
        return;
    }
    
    // استرداد معلومات القرض
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    const loan = loans.find(l => l.id === payment.loanId);
    
    if (!loan) {
        console.error(`لم يتم العثور على القرض رقم: ${payment.loanId}`);
        return;
    }
    
    // تحديد حالة الدفع
    const status = getPaymentStatus(payment);
    
    // إنشاء معرف عشوائي للنموذج
    const modalId = `payment-details-modal-${Math.random().toString(36).substring(2, 9)}`;
    
    // إنشاء نموذج عرض تفاصيل الدفعة
    const modalHTML = `
        <div class="modal-overlay" id="${modalId}">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تفاصيل الدفعة #${payment.id}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="payment-details-container">
                        <div class="payment-header">
                            <div class="payment-title">
                                <h4>القسط رقم ${payment.installmentNumber} للقرض #${loan.id}</h4>
                                <span class="status-badge ${status.class}">${status.text}</span>
                            </div>
                            <div class="payment-amount">
                                <span>${formatCurrency(payment.amount)}</span>
                            </div>
                        </div>
                        
                        <div class="payment-info-grid">
                            <div class="payment-info-item">
                                <div class="payment-info-label">المقترض</div>
                                <div class="payment-info-value">${loan.borrowerName}</div>
                            </div>
                            <div class="payment-info-item">
                                <div class="payment-info-label">رقم الهاتف</div>
                                <div class="payment-info-value">${loan.borrowerPhone || 'غير متوفر'}</div>
                            </div>
                            <div class="payment-info-item">
                                <div class="payment-info-label">تاريخ الاستحقاق</div>
                                <div class="payment-info-value">${formatDate(payment.dueDate)}</div>
                            </div>
                            <div class="payment-info-item">
                                <div class="payment-info-label">حالة الدفع</div>
                                <div class="payment-info-value">${status.text}</div>
                            </div>
                            <div class="payment-info-item">
                                <div class="payment-info-label">تاريخ الدفع</div>
                                <div class="payment-info-value">${payment.paid ? formatDate(payment.paymentDate) : '-'}</div>
                            </div>
                            <div class="payment-info-item">
                                <div class="payment-info-label">مبلغ القسط</div>
                                <div class="payment-info-value">${formatCurrency(payment.amount)}</div>
                            </div>
                        </div>
                        
                        <div class="payment-notes">
                            <div class="payment-notes-label">ملاحظات</div>
                            <div class="payment-notes-content">${payment.notes || 'لا توجد ملاحظات'}</div>
                        </div>
                        
                        <div class="payment-actions-container">
                            /**
 * Continuation of loan-system-fix-part3.js
 */

// Continuación del código anterior...
                            ${!payment.paid ? `
                                <button class="btn btn-success" onclick="recordPayment('${payment.id}')">
                                    <i class="fas fa-check-circle"></i>
                                    <span>تسجيل الدفع</span>
                                </button>
                            ` : `
                                <button class="btn btn-warning" onclick="cancelPayment('${payment.id}')">
                                    <i class="fas fa-times-circle"></i>
                                    <span>إلغاء الدفع</span>
                                </button>
                            `}
                            <button class="btn btn-primary" onclick="showLoanDetails('${loan.id}')">
                                <i class="fas fa-eye"></i>
                                <span>عرض القرض</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة النموذج إلى صفحة الويب
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // الحصول على النموذج المضاف
    const modal = document.getElementById(modalId);
    
    // إضافة مستمع أحداث لإغلاق النموذج
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // إظهار النموذج
    modal.style.display = 'flex';
} catch (error) {
    console.error('خطأ في عرض تفاصيل الدفعة:', error);
    alert('حدث خطأ أثناء عرض تفاصيل الدفعة');
}
};

// دالة إضافة مستمعات أحداث لعناصر واجهة المستخدم
function addEventListeners() {
    // زر إضافة قرض جديد
    const addLoanBtn = document.getElementById('add-loan-btn');
    if (addLoanBtn) {
        addLoanBtn.addEventListener('click', openAddLoanModal);
    }
    
    // إضافة مستمع أحداث لأزرار التصفية في جدول القروض
    const loanFilterButtons = document.querySelectorAll('[data-loan-filter]');
    loanFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            loanFilterButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // إضافة الفئة النشطة للزر الحالي
            this.classList.add('active');
            
            // تحديث جدول القروض مع عامل التصفية المحدد
            updateLoansTable(this.getAttribute('data-loan-filter'));
        });
    });
    
    // إضافة مستمع أحداث لأزرار التصفية في جدول المدفوعات
    const paymentFilterButtons = document.querySelectorAll('[data-payment-filter]');
    paymentFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            paymentFilterButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // إضافة الفئة النشطة للزر الحالي
            this.classList.add('active');
            
            // تحديث جدول المدفوعات مع عامل التصفية المحدد
            updatePaymentsTable(this.getAttribute('data-payment-filter'));
        });
    });
    
    // إضافة مستمع أحداث لأزرار فترة التقرير
    const reportPeriodButtons = document.querySelectorAll('[data-report-period]');
    reportPeriodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            reportPeriodButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // إضافة الفئة النشطة للزر الحالي
            this.classList.add('active');
            
            // تحديث تقارير القروض مع الفترة المحددة
            updateLoanReports(this.getAttribute('data-report-period'));
        });
    });
    
    // إضافة مستمع أحداث لزر تسجيل دفعة
    const recordPaymentBtn = document.getElementById('record-payment-btn');
    if (recordPaymentBtn) {
        recordPaymentBtn.addEventListener('click', function() {
            showRecordPaymentModal();
        });
    }
    
    // إضافة مستمع أحداث لزر تصدير التقرير
    const exportReportBtn = document.getElementById('export-loan-report-btn');
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', function() {
            exportLoanReport();
        });
    }
}

/**
 * إظهار نموذج تسجيل دفعة لقسط محدد
 */
function showRecordPaymentModal() {
    try {
        // استرداد بيانات المدفوعات المستحقة
        const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
        const duePayments = payments.filter(payment => {
            const dueDate = new Date(payment.dueDate);
            const today = new Date();
            return !payment.paid && dueDate <= today;
        });
        
        // التحقق من وجود مدفوعات مستحقة
        if (duePayments.length === 0) {
            alert('لا توجد مدفوعات مستحقة للتسجيل');
            return;
        }
        
        // استرداد بيانات القروض
        const loans = JSON.parse(localStorage.getItem('loans')) || [];
        const loansMap = {};
        loans.forEach(loan => {
            loansMap[loan.id] = loan;
        });
        
        // إنشاء معرف عشوائي للنموذج
        const modalId = `record-payment-modal-${Math.random().toString(36).substring(2, 9)}`;
        
        // إنشاء نموذج تسجيل دفعة
        const modalHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal animate__animated animate__fadeInUp">
                    <div class="modal-header">
                        <h3 class="modal-title">تسجيل دفعة</h3>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="select-payment-form">
                            <div class="form-group">
                                <label class="form-label">اختر القسط المستحق</label>
                                <select class="form-select" id="due-payment-select" required>
                                    <option value="">-- اختر القسط --</option>
                                    ${duePayments.map(payment => {
                                        const loan = loansMap[payment.loanId] || { borrowerName: 'غير معروف' };
                                        return `<option value="${payment.id}">${loan.borrowerName} - القسط ${payment.installmentNumber} - ${formatCurrency(payment.amount)} - تاريخ الاستحقاق: ${formatDate(payment.dueDate)}</option>`;
                                    }).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">تاريخ الدفع</label>
                                <input class="form-input" id="payment-date" type="date" value="${new Date().toISOString().split('T')[0]}" required />
                            </div>
                            <div class="form-group">
                                <label class="form-label">ملاحظات</label>
                                <textarea class="form-input" id="payment-notes" rows="3" placeholder="إضافة ملاحظات اختيارية..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline modal-close-btn">إلغاء</button>
                        <button class="btn btn-success" id="record-selected-payment-btn">تسجيل الدفع</button>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة النموذج إلى صفحة الويب
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // الحصول على النموذج المضاف
        const modal = document.getElementById(modalId);
        
        // إضافة مستمع أحداث لإغلاق النموذج
        const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.remove();
            });
        });
        
        // إضافة مستمع أحداث لزر تسجيل الدفع
        const recordButton = document.getElementById('record-selected-payment-btn');
        recordButton.addEventListener('click', () => {
            // الحصول على قيم النموذج
            const paymentId = document.getElementById('due-payment-select').value;
            const paymentDate = document.getElementById('payment-date').value;
            const notes = document.getElementById('payment-notes').value;
            
            // التحقق من صحة البيانات
            if (!paymentId || !paymentDate) {
                alert('يرجى اختيار القسط وإدخال تاريخ الدفع');
                return;
            }
            
            // استدعاء دالة تسجيل الدفع
            recordPayment(paymentId);
            
            // إغلاق النموذج
            modal.remove();
        });
        
        // إظهار النموذج
        modal.style.display = 'flex';
    } catch (error) {
        console.error('خطأ في فتح نموذج تسجيل دفعة:', error);
        alert('حدث خطأ أثناء فتح نموذج تسجيل دفعة');
    }
}

/**
 * تصدير تقرير القروض
 */
function exportLoanReport() {
    try {
        // استرداد بيانات القروض والمدفوعات
        const loans = JSON.parse(localStorage.getItem('loans')) || [];
        const payments = JSON.parse(localStorage.getItem('loanPayments')) || [];
        
        // التحقق من وجود بيانات
        if (loans.length === 0) {
            alert('لا توجد بيانات للتصدير');
            return;
        }
        
        // تحديد الفترة النشطة
        const activePeriodButton = document.querySelector('[data-report-period].active');
        const period = activePeriodButton ? activePeriodButton.getAttribute('data-report-period') : 'monthly';
        
        // تجهيز بيانات التقرير
        const reportData = [];
        
        // إضافة بيانات القروض
        loans.forEach(loan => {
            // حساب المبلغ المتبقي
            const remainingAmount = calculateRemainingAmount(loan);
            
            // حساب المبلغ المدفوع
            const paidAmount = parseFloat(loan.amount) - remainingAmount;
            
            // تحديد حالة القرض
            const status = getLoanStatus(loan);
            
            // إضافة القرض إلى بيانات التقرير
            reportData.push({
                id: loan.id,
                borrowerName: loan.borrowerName,
                phone: loan.borrowerPhone || 'غير متوفر',
                amount: formatCurrency(loan.amount),
                startDate: formatDate(loan.startDate),
                duration: `${loan.duration} شهر`,
                interestRate: `${loan.interestRate}%`,
                paidAmount: formatCurrency(paidAmount),
                remainingAmount: formatCurrency(remainingAmount),
                status: status.text
            });
        });
        
        // إنشاء CSV
        let csv = 'رقم القرض,اسم المقترض,رقم الهاتف,مبلغ القرض,تاريخ البدء,المدة,معدل الفائدة,المبلغ المدفوع,المبلغ المتبقي,الحالة\n';
        
        reportData.forEach(loan => {
            csv += `${loan.id},${loan.borrowerName},${loan.phone},${loan.amount},${loan.startDate},${loan.duration},${loan.interestRate},${loan.paidAmount},${loan.remainingAmount},${loan.status}\n`;
        });
        
        // إنشاء ملف للتنزيل
        const date = new Date().toISOString().split('T')[0];
        const fileName = `تقرير_القروض_${period}_${date}.csv`;
        
        // تحويل الـ CSV إلى Blob
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        
        // إنشاء رابط للتنزيل
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // النقر على الرابط لبدء التنزيل
        link.click();
        
        // تنظيف
        document.body.removeChild(link);
        
        // إظهار رسالة نجاح
        alert('تم تصدير التقرير بنجاح');
    } catch (error) {
        console.error('خطأ في تصدير تقرير القروض:', error);
        alert('حدث خطأ أثناء تصدير تقرير القروض');
    }
}

// =====================================
// إضافة أنماط CSS لنظام القروض
// =====================================

/**
 * إضافة أنماط CSS لنظام القروض
 */
function addLoanSystemStyles() {
    const styleElement = document.createElement('style');
    styleElement.id = 'loan-system-styles';
    styleElement.textContent = `
        /* أنماط عامة لنظام القروض */
        [data-loan-page] .status-badge {
            display: inline-flex;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        [data-loan-page] .status-badge.primary {
            background-color: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
        }
        
        [data-loan-page] .status-badge.success {
            background-color: rgba(16, 185, 129, 0.1);
            color: #10b981;
        }
        
        [data-loan-page] .status-badge.warning {
            background-color: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
        }
        
        [data-loan-page] .status-badge.danger {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }
        
        [data-loan-page] .status-badge.info {
            background-color: rgba(6, 182, 212, 0.1);
            color: #06b6d4;
        }
        
        [data-loan-page] .status-badge.secondary {
            background-color: rgba(156, 163, 175, 0.1);
            color: #9ca3af;
        }
        
        /* أنماط تفاصيل القرض */
        .loan-details {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .loan-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 1rem;
        }
        
        .loan-borrower {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .loan-borrower h4 {
            margin: 0;
            font-size: 1.25rem;
        }
        
        .loan-progress {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5rem;
        }
        
        .progress-bar {
            height: 0.5rem;
            background-color: #e5e7eb;
            border-radius: 1rem;
            width: 10rem;
            overflow: hidden;
        }
        
        .progress {
            height: 100%;
            background-color: #3b82f6;
            border-radius: 1rem;
        }
        
        .progress-label {
            font-size: 0.75rem;
            color: #6b7280;
        }
        
        .loan-info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        
        .loan-info-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .loan-info-label {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .loan-info-value {
            font-weight: 600;
        }
        
        .loan-payments-summary {
            display: flex;
            gap: 1rem;
            justify-content: space-between;
        }
        
        .summary-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
            background-color: #f9fafb;
            padding: 1rem;
            border-radius: 0.5rem;
        }
        
        .summary-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 9999px;
            color: white;
        }
        
        .summary-icon.primary {
            background-color: #3b82f6;
        }
        
        .summary-icon.success {
            background-color: #10b981;
        }
        
        .summary-icon.warning {
            background-color: #f59e0b;
        }
        
        .summary-info {
            display: flex;
            flex-direction: column;
        }
        
        .summary-label {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .summary-value {
            font-weight: 600;
            font-size: 1.25rem;
        }
        
        .loan-payments-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .loan-payments-list h4 {
            margin: 0;
        }
        
        /* أنماط نموذج تسجيل الدفع */
        .payment-details {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .payment-summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-top: 1rem;
        }
        
        /* أنماط تفاصيل الدفعة */
        .payment-details-container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .payment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 1rem;
        }
        
        .payment-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .payment-title h4 {
            margin: 0;
            font-size: 1.25rem;
        }
        
        .payment-amount {
            font-size: 1.5rem;
            font-weight: 700;
            color: #3b82f6;
        }
        
        .payment-info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        
        .payment-info-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .payment-info-label {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .payment-info-value {
            font-weight: 600;
        }
        
        .payment-notes {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            background-color: #f9fafb;
            padding: 1rem;
            border-radius: 0.5rem;
        }
        
        .payment-notes-label {
            font-weight: 600;
        }
        
        .payment-actions-container {
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
        }
        
        /* أنماط شارة التنبيه */
        .nav-item[data-loan-nav] .loan-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.25rem;
            height: 1.25rem;
            font-size: 0.75rem;
            background-color: #ef4444;
            color: white;
            border-radius: 9999px;
            margin-right: 0.5rem;
        }
        
        /* أنماط بطاقات لوحة تحكم القروض */
        .loan-stats-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .loan-system-dark .status-badge.primary {
            background-color: rgba(59, 130, 246, 0.2);
        }
        
        .loan-system-dark .status-badge.success {
            background-color: rgba(16, 185, 129, 0.2);
        }
        
        .loan-system-dark .status-badge.warning {
            background-color: rgba(245, 158, 11, 0.2);
        }
        
        .loan-system-dark .status-badge.danger {
            background-color: rgba(239, 68, 68, 0.2);
        }
        
        .loan-system-dark .summary-item {
            background-color: rgba(31, 41, 55, 0.5);
        }
        
        .loan-system-dark .payment-notes {
            background-color: rgba(31, 41, 55, 0.5);
        }
        
        /* التوافق مع الشاشات الصغيرة */
        @media (max-width: 768px) {
            .loan-info-grid,
            .payment-info-grid {
                grid-template-columns: 1fr;
            }
            
            .loan-payments-summary,
            .payment-summary {
                flex-direction: column;
            }
            
            .loan-stats-cards {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}

// تصدير الدوال الرئيسية لنظام القروض
window.loadLoanData = loadLoanData;
window.updateLoansTable = updateLoansTable;
window.updatePaymentsTable = updatePaymentsTable;
window.updateLoanReports = updateLoanReports;
window.setupLoanNavigationEvents = setupLoanNavigationEvents;
window.addLoanSystemStyles = addLoanSystemStyles;

// إضافة أنماط CSS لنظام القروض عند تحميل الملف
addLoanSystemStyles();