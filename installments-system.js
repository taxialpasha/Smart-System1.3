/**
 * نظام إدارة الأقساط واستقطاعها من الأرباح
 * يوفر وظائف إضافة وإدارة الأقساط المستحقة على المستثمرين
 * واستقطاعها تلقائياً من الأرباح عند عملية دفع الأرباح
 */

// نظام إدارة الأقساط
const InstallmentSystem = (function() {
    // المتغيرات الخاصة بالنظام
    let installedSystem = false;
    
    /**
     * تهيئة نظام الأقساط
     */
    function initialize() {
        console.log('تهيئة نظام إدارة الأقساط...');
        
        // فحص وإصلاح بنية البيانات للمستثمرين
        fixInvestorsDataStructure();
        
        // استبدال دوال النظام الأصلية
        overrideOriginalFunctions();
        
        // إضافة واجهة إدارة الأقساط
        addInstallmentManagementUI();
        
        // إضافة أنماط CSS
        addInstallmentStyles();
        
        // تحديث حالة التثبيت
        installedSystem = true;
        
        console.log('تم تهيئة نظام إدارة الأقساط بنجاح');
    }
    
    /**
     * فحص وإصلاح بنية البيانات للمستثمرين
     * للتأكد من وجود صفيف الأقساط
     */
    function fixInvestorsDataStructure() {
        try {
            if (!Array.isArray(window.investors)) {
                console.warn('مصفوفة المستثمرين غير موجودة');
                return;
            }
            
            // إضافة صفيف الأقساط للمستثمرين إذا لم يكن موجوداً
            window.investors.forEach(investor => {
                if (!investor.installments) {
                    investor.installments = [];
                }
            });
            
            // حفظ التغييرات
            if (typeof window.saveData === 'function') {
                window.saveData();
            }
            
            console.log('تم إصلاح بنية بيانات المستثمرين');
        } catch (error) {
            console.error('خطأ في إصلاح بنية بيانات المستثمرين:', error);
        }
    }
    
    /**
     * استبدال دوال النظام الأصلية
     */
    function overrideOriginalFunctions() {
        try {
            // حفظ دالة دفع الأرباح الأصلية
            if (typeof window.payProfit === 'function') {
                window._originalPayProfit = window.payProfit;
                
                // استبدال الدالة بنسخة محسنة
                window.payProfit = enhancedPayProfit;
                console.log('تم استبدال دالة دفع الأرباح بنجاح');
            }
            
            // حفظ دالة حساب الأرباح
            if (typeof window.calculateProfitForInvestor === 'function') {
                window._originalCalculateProfitForInvestor = window.calculateProfitForInvestor;
                
                // استبدال الدالة بنسخة محسنة
                window.calculateProfitForInvestor = enhancedCalculateProfitForInvestor;
                console.log('تم استبدال دالة حساب الأرباح بنجاح');
            }
            
            // حفظ دالة عرض تفاصيل المستثمر
            if (typeof window.showInvestorDetails === 'function') {
                window._originalShowInvestorDetails = window.showInvestorDetails;
                
                // استبدال الدالة بنسخة محسنة
                window.showInvestorDetails = enhancedShowInvestorDetails;
                console.log('تم استبدال دالة عرض تفاصيل المستثمر بنجاح');
            }
        } catch (error) {
            console.error('خطأ في استبدال الدوال الأصلية:', error);
        }
    }
    
    /**
     * نسخة محسنة من دالة دفع الأرباح
     * تقوم بخصم الأقساط المستحقة من الأرباح
     */
    function enhancedPayProfit() {
        console.log('دفع الأرباح مع استقطاع الأقساط المستحقة...');
        
        // الحصول على معرف المستثمر
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
        
        // البحث عن المستثمر
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor) {
            showNotification('لم يتم العثور على بيانات المستثمر', 'error');
            return;
        }
        
        // حساب إجمالي الأرباح المستحقة
        let totalProfit = 0;
        
        // حساب الأرباح للاستثمارات النشطة فقط
        investor.investments.forEach(inv => {
            // تجاهل الاستثمارات ذات المبلغ الصفري
            if (inv.amount <= 0) return;
            
            const start = new Date(inv.date);
            const today = new Date();
            const profit = typeof window.calculateInterest === 'function' 
                ? window.calculateInterest(inv.amount, inv.date, today.toISOString().split('T')[0])
                : 0;
                
            totalProfit += profit;
        });
        
        // استدعاء نافذة تأكيد استقطاع الأقساط
        showInstallmentConfirmationModal(investor, totalProfit, function(proceedWithDeduction) {
            if (!proceedWithDeduction) {
                // استمرار بدون خصم الأقساط (استخدام الدالة الأصلية)
                if (typeof window._originalPayProfit === 'function') {
                    window._originalPayProfit();
                }
                return;
            }
            
            // حساب إجمالي الأقساط المستحقة
            const dueInstallments = getDueInstallments(investor);
            const totalDueAmount = dueInstallments.reduce((sum, installment) => sum + installment.remainingAmount, 0);
            
            // حساب الربح النهائي بعد استقطاع الأقساط
            const finalProfit = Math.max(0, totalProfit - totalDueAmount);
            
            // تسجيل عملية دفع الأرباح مع استقطاع الأقساط
            processInstallmentDeduction(investor, dueInstallments, totalDueAmount, totalProfit, finalProfit);
        });
    }
    
    /**
     * نسخة محسنة من دالة حساب الأرباح للمستثمر
     * تقوم بإظهار الأقساط المستحقة وتأثيرها على الأرباح
     */
    function enhancedCalculateProfitForInvestor() {
        console.log('حساب الأرباح للمستثمر مع عرض الأقساط المستحقة...');
        
        // استدعاء الدالة الأصلية
        if (typeof window._originalCalculateProfitForInvestor === 'function') {
            window._originalCalculateProfitForInvestor();
        }
        
        // الحصول على اختيار المستثمر
        const investorSelect = document.getElementById('profit-investor');
        if (!investorSelect) return;
        
        const investorId = investorSelect.value;
        const profitDetails = document.getElementById('profit-details');
        
        if (!investorId || !profitDetails) {
            return;
        }
        
        // البحث عن المستثمر
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor) return;
        
        // التحقق من وجود أقساط مستحقة
        if (!investor.installments || investor.installments.length === 0) {
            return;
        }
        
        // إضافة قسم الأقساط المستحقة إلى تفاصيل الأرباح
        const dueInstallments = getDueInstallments(investor);
        
        // إذا لم توجد أقساط مستحقة، نخرج
        if (dueInstallments.length === 0) {
            return;
        }
        
        // إعداد قسم الأقساط المستحقة
        const installmentsSection = document.createElement('div');
        installmentsSection.className = 'installments-section section';
        
        // حساب إجمالي الأرباح المحسوبة سابقاً
        const totalProfitElement = profitDetails.querySelector('tfoot tr:last-child td:last-child strong');
        let totalProfit = 0;
        
        if (totalProfitElement) {
            // استخراج الرقم من النص
            const profitText = totalProfitElement.textContent;
            totalProfit = parseFloat(profitText.replace(/[^\d.-]/g, '')) || 0;
        }
        
        // حساب إجمالي الأقساط المستحقة
        const totalDueAmount = dueInstallments.reduce((sum, installment) => sum + installment.remainingAmount, 0);
        
        // حساب الربح النهائي بعد استقطاع الأقساط
        const finalProfit = Math.max(0, totalProfit - totalDueAmount);
        
        // إنشاء محتوى قسم الأقساط
        installmentsSection.innerHTML = `
            <h3 class="section-title">الأقساط المستحقة</h3>
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <span>يوجد ${dueInstallments.length} قسط مستحق بقيمة إجمالية ${formatCurrency(totalDueAmount)}. سيتم استقطاعها تلقائياً من الأرباح.</span>
            </div>
            <table class="installments-table">
                <thead>
                    <tr>
                        <th>الوصف</th>
                        <th>تاريخ الاستحقاق</th>
                        <th>إجمالي القسط</th>
                        <th>المبلغ المتبقي</th>
                    </tr>
                </thead>
                <tbody>
                    ${dueInstallments.map(installment => `
                        <tr>
                            <td>${installment.description}</td>
                            <td>${formatDate(installment.dueDate)}</td>
                            <td>${formatCurrency(installment.amount)}</td>
                            <td>${formatCurrency(installment.remainingAmount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3"><strong>إجمالي الأقساط المستحقة</strong></td>
                        <td><strong>${formatCurrency(totalDueAmount)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="profit-summary">
                <div class="summary-row">
                    <div class="summary-label">إجمالي الربح المستحق:</div>
                    <div class="summary-value">${formatCurrency(totalProfit)}</div>
                </div>
                <div class="summary-row deduction">
                    <div class="summary-label">خصم الأقساط المستحقة:</div>
                    <div class="summary-value">- ${formatCurrency(totalDueAmount)}</div>
                </div>
                <div class="summary-row total">
                    <div class="summary-label">صافي الربح بعد الاستقطاع:</div>
                    <div class="summary-value">${formatCurrency(finalProfit)}</div>
                </div>
            </div>
        `;
        
        // إضافة قسم الأقساط إلى تفاصيل الأرباح
        profitDetails.appendChild(installmentsSection);
    }
    
    /**
     * نسخة محسنة من دالة عرض تفاصيل المستثمر
     * تقوم بإضافة قسم الأقساط في نافذة التفاصيل
     */
    function enhancedShowInvestorDetails(investorId) {
        console.log(`عرض تفاصيل المستثمر مع الأقساط: ${investorId}`);
        
        // التحقق من وجود المستثمر
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor) {
            if (window._originalShowInvestorDetails) {
                window._originalShowInvestorDetails(investorId);
            }
            
            return;
        }
        
        // استدعاء الدالة الأصلية
        if (window._originalShowInvestorDetails) {
            window._originalShowInvestorDetails(investorId);
        }
        
        // بعد فترة قصيرة، نضيف قسم الأقساط
        setTimeout(() => {
            addInstallmentsToInvestorDetails(investor);
        }, 300);
    }
    
    /**
     * إضافة قسم الأقساط إلى نافذة تفاصيل المستثمر
     * @param {Object} investor - بيانات المستثمر
     */
    function addInstallmentsToInvestorDetails(investor) {
        // البحث عن عنصر التفاصيل
        const detailsContainer = document.querySelector('#investor-details-content');
        if (!detailsContainer) return;
        
        // التحقق من عدم وجود قسم الأقساط مسبقاً
        let installmentsSection = detailsContainer.querySelector('.installments-detail-group');
        if (installmentsSection) {
            installmentsSection.remove();
        }
        
        // إنشاء قسم الأقساط
        installmentsSection = document.createElement('div');
        installmentsSection.className = 'detail-group installments-detail-group';
        
        // الحصول على الأقساط المستحقة وغير المستحقة
        const dueInstallments = getDueInstallments(investor);
        const upcomingInstallments = investor.installments
            ? investor.installments.filter(installment => 
                installment.status !== 'paid' && 
                new Date(installment.dueDate) > new Date())
            : [];
        
        // حساب إجمالي الأقساط المستحقة
        const totalDueAmount = dueInstallments.reduce((sum, installment) => sum + installment.remainingAmount, 0);
        
        // حساب إجمالي الأقساط القادمة
        const totalUpcomingAmount = upcomingInstallments.reduce((sum, installment) => sum + installment.remainingAmount, 0);
        
        // تحديد عدد أقساط حالة المستثمر
        let statusMessage = '';
        let statusClass = '';
        
        if (dueInstallments.length > 0) {
            statusMessage = `${dueInstallments.length} قسط مستحق`;
            statusClass = 'status-urgent';
        } else if (upcomingInstallments.length > 0) {
            statusMessage = `${upcomingInstallments.length} قسط قادم`;
            statusClass = 'status-upcoming';
        } else if (investor.installments && investor.installments.some(i => i.status === 'paid')) {
            statusMessage = 'جميع الأقساط مسددة';
            statusClass = 'status-paid';
        } else {
            statusMessage = 'لا توجد أقساط';
            statusClass = 'status-none';
        }
        
        // إنشاء محتوى قسم الأقساط
        installmentsSection.innerHTML = `
            <h3 class="detail-group-title">
                الأقساط
                <span class="installment-status ${statusClass}">${statusMessage}</span>
                <button class="btn btn-sm btn-primary add-installment-btn" data-investor-id="${investor.id}">
                    <i class="fas fa-plus"></i>
                    <span>إضافة قسط</span>
                </button>
            </h3>
            
            ${dueInstallments.length > 0 ? `
                <div class="installments-summary due">
                    <div class="summary-title">
                        <i class="fas fa-exclamation-circle"></i>
                        أقساط مستحقة
                    </div>
                    <div class="summary-amount">${formatCurrency(totalDueAmount)}</div>
                </div>
                
                <div class="mini-table-container">
                    <table class="mini-table installments-table">
                        <thead>
                            <tr>
                                <th>الوصف</th>
                                <th>تاريخ الاستحقاق</th>
                                <th>المبلغ المتبقي</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dueInstallments.map(installment => `
                                <tr class="due-installment">
                                    <td>${installment.description}</td>
                                    <td>${formatDate(installment.dueDate)}</td>
                                    <td>${formatCurrency(installment.remainingAmount)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-success pay-installment-btn" data-investor-id="${investor.id}" data-installment-id="${installment.id}">
                                            <i class="fas fa-coins"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${investor.id}" data-installment-id="${installment.id}">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
            
            ${upcomingInstallments.length > 0 ? `
                <div class="installments-summary upcoming">
                    <div class="summary-title">
                        <i class="fas fa-calendar-alt"></i>
                        أقساط قادمة
                    </div>
                    <div class="summary-amount">${formatCurrency(totalUpcomingAmount)}</div>
                </div>
                
                <div class="mini-table-container">
                    <table class="mini-table installments-table">
                        <thead>
                            <tr>
                                <th>الوصف</th>
                                <th>تاريخ الاستحقاق</th>
                                <th>المبلغ المتبقي</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${upcomingInstallments.map(installment => `
                                <tr class="upcoming-installment">
                                    <td>${installment.description}</td>
                                    <td>${formatDate(installment.dueDate)}</td>
                                    <td>${formatCurrency(installment.remainingAmount)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${investor.id}" data-installment-id="${installment.id}">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
            
            ${(dueInstallments.length === 0 && upcomingInstallments.length === 0) ? `
                <div class="empty-installments">
                    <p>لا توجد أقساط حالية. يمكنك إضافة قسط جديد عن طريق الضغط على زر "إضافة قسط".</p>
                </div>
            ` : ''}
            
            ${investor.installments && investor.installments.some(i => i.status === 'paid') ? `
                <div class="view-history-link">
                    <a href="#" class="view-paid-installments" data-investor-id="${investor.id}">
                        <i class="fas fa-history"></i>
                        عرض سجل الأقساط المدفوعة
                    </a>
                </div>
            ` : ''}
        `;
        
        // إضافة قسم الأقساط إلى التفاصيل
        detailsContainer.appendChild(installmentsSection);
        
        // إضافة مستمعي الأحداث للأزرار
        setupInstallmentButtonsListeners(installmentsSection);
    }
    
    /**
     * إضافة واجهة إدارة الأقساط
     */
    function addInstallmentManagementUI() {
        // إضافة زر في القائمة الرئيسية
        const adminMenu = document.querySelector('.nav-list');
        if (adminMenu) {
            // التحقق من عدم وجود القائمة مسبقاً
            if (!document.querySelector('.nav-link[data-page="installments"]')) {
                // إنشاء عنصر القائمة
                const menuItem = document.createElement('li');
                menuItem.className = 'nav-item';
                menuItem.innerHTML = `
                    <a class="nav-link" data-page="installments" href="#">
                        <div class="nav-icon">
                            <i class="fas fa-receipt"></i>
                        </div>
                        <span>الأقساط</span>
                    </a>
                `;
                
                // إضافة عنصر القائمة قبل عنصر الإعدادات
                const settingsMenuItem = document.querySelector('.nav-link[data-page="settings"]');
                if (settingsMenuItem) {
                    const settingsItem = settingsMenuItem.closest('.nav-item');
                    adminMenu.insertBefore(menuItem, settingsItem);
                } else {
                    adminMenu.appendChild(menuItem);
                }
                
                // إضافة مستمع حدث للتنقل
                menuItem.querySelector('.nav-link').addEventListener('click', function(e) {
                    e.preventDefault();
                    showInstallmentsPage();
                });
                
                console.log('تم إضافة زر الأقساط إلى القائمة الرئيسية');
            }
        }
        
        // إضافة صفحة الأقساط إذا لم تكن موجودة
        addInstallmentsPage();
        
        // إضافة النوافذ المنبثقة للأقساط
        addInstallmentModals();
    }
    
    /**
     * إضافة صفحة الأقساط
     */
    function addInstallmentsPage() {
        // التحقق من عدم وجود الصفحة مسبقاً
        if (document.getElementById('installments-page')) {
            return;
        }
        
        // إنشاء عنصر الصفحة
        const pageElement = document.createElement('div');
        pageElement.className = 'page';
        pageElement.id = 'installments-page';
        
        // إنشاء محتوى الصفحة
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">إدارة الأقساط</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" placeholder="بحث عن مستثمر..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <button class="btn btn-primary" id="add-global-installment-btn">
                        <i class="fas fa-plus"></i>
                        <span>إضافة قسط جديد</span>
                    </button>
                </div>
            </div>
            
            <div class="installments-dashboard">
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-money-check-alt"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">إجمالي الأقساط المستحقة</div>
                                <div class="card-value" id="total-due-installments">0 دينار</div>
                                <div class="card-change">
                                    <span id="total-due-count">0 قسط</span>
                                </div>
                            </div>
                            <div class="card-icon danger">
                                <i class="fas fa-exclamation-circle"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">الأقساط القادمة</div>
                                <div class="card-value" id="total-upcoming-installments">0 دينار</div>
                                <div class="card-change">
                                    <span id="total-upcoming-count">0 قسط</span>
                                </div>
                            </div>
                            <div class="card-icon warning">
                                <i class="fas fa-calendar-plus"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">الأقساط المدفوعة</div>
                                <div class="card-value" id="total-paid-installments">0 دينار</div>
                                <div class="card-change">
                                    <span id="total-paid-count">0 قسط</span>
                                </div>
                            </div>
                            <div class="card-icon success">
                                <i class="fas fa-check-double"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-percentage"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">نسبة التحصيل</div>
                                <div class="card-value" id="collection-rate">0%</div>
                                <div class="card-change">
                                    <i id="collection-trend" class="fas fa-arrow-up"></i>
                                    <span id="collection-change">0% من الشهر السابق</span>
                                </div>
                            </div>
                            <div class="card-icon info">
                                <i class="fas fa-chart-line"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">الأقساط المستحقة</h2>
                    <div class="section-actions">
                        <div class="btn-group">
                            <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
                            <button class="btn btn-outline btn-sm" data-filter="overdue">متأخرة</button>
                            <button class="btn btn-outline btn-sm" data-filter="today">اليوم</button>
                            <button class="btn btn-outline btn-sm" data-filter="upcoming">قادمة</button>
                        </div>
                        <button class="btn btn-outline btn-sm" title="تصدير">
                            <i class="fas fa-download"></i>
                            <span>تصدير</span>
                        </button>
                    </div>
                </div>
                
                <div class="table-container">
                    <table id="installments-table">
                        <thead>
                            <tr>
                                <th>المستثمر</th>
                                <th>وصف القسط</th>
                                <th>تاريخ الاستحقاق</th>
                                <th>المبلغ الإجمالي</th>
                                <th>المبلغ المتبقي</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- سيتم ملؤها ديناميكياً -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى المحتوى الرئيسي
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(pageElement);
            console.log('تم إضافة صفحة الأقساط بنجاح');
        }
        
        // إضافة مستمعي الأحداث للصفحة
        setupInstallmentsPageListeners(pageElement);
    }
    
    /**
     * إضافة النوافذ المنبثقة للأقساط
     */
    function addInstallmentModals() {
        // إضافة نافذة إضافة/تعديل قسط إذا لم تكن موجودة
        if (!document.getElementById('add-installment-modal')) {
            const modalElement = document.createElement('div');
            modalElement.className = 'modal-overlay';
            modalElement.id = 'add-installment-modal';
            
            modalElement.innerHTML = `
                <div class="modal animate__animated animate__fadeInUp">
                    <div class="modal-header">
                        <h3 class="modal-title" id="installment-modal-title">إضافة قسط جديد</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="installment-form">
                            <input type="hidden" id="installment-id" value="">
                            <input type="hidden" id="installment-investor-id" value="">
                            
                            <div class="form-group" id="investor-select-container">
                                <label class="form-label">المستثمر</label>
                                <select class="form-select" id="installment-investor" required>
                                    <option value="">اختر المستثمر</option>
                                    <!-- سيتم ملؤها ديناميكياً -->
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">وصف القسط</label>
                                <input type="text" class="form-input" id="installment-description" placeholder="مثال: قسط السيارة، قسط القرض، إلخ" required>
                            </div>
                            
                            <div class="grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">المبلغ الإجمالي</label>
                                    <input type="number" class="form-input" id="installment-amount" min="1" step="1000" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">تاريخ الاستحقاق</label>
                                    <input type="date" class="form-input" id="installment-due-date" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">ملاحظات</label>
                                <textarea class="form-input" id="installment-notes" rows="3"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <div class="form-check">
                                    <input type="checkbox" id="installment-priority" value="high">
                                    <label for="installment-priority">قسط ذو أولوية عالية</label>
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
            
            // إضافة النافذة للجسم
            document.body.appendChild(modalElement);
            
            // إضافة مستمعي الأحداث للنافذة
            setupInstallmentModalListeners(modalElement);
        }
        
        // إضافة نافذة تأكيد استقطاع الأقساط
        if (!document.getElementById('installment-confirmation-modal')) {
            const confirmationModal = document.createElement('div');
            confirmationModal.className = 'modal-overlay';
            confirmationModal.id = 'installment-confirmation-modal';
            
            confirmationModal.innerHTML = `
                <div class="modal animate__animated animate__fadeInUp">
                    <div class="modal-header">
                        <h3 class="modal-title">تأكيد استقطاع الأقساط</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="confirmation-content">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <span>يوجد أقساط مستحقة على المستثمر. هل ترغب في استقطاعها من الأرباح؟</span>
                            </div>
                            
                            <div id="installment-deduction-details"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="pay-without-deduction-btn">دفع الأرباح بدون استقطاع</button>
                        <button class="btn btn-primary" id="pay-with-deduction-btn">دفع مع استقطاع الأقساط</button>
                    </div>
                </div>
            `;
            
            // إضافة النافذة للجسم
            document.body.appendChild(confirmationModal);
            
            // إضافة مستمعي الأحداث للنافذة
            setupConfirmationModalListeners(confirmationModal);
        }
        
        // إضافة نافذة تفاصيل سجل الأقساط المدفوعة
        if (!document.getElementById('installment-history-modal')) {
            const historyModal = document.createElement('div');
            historyModal.className = 'modal-overlay';
            historyModal.id = 'installment-history-modal';
            
            historyModal.innerHTML = `
                <div class="modal animate__animated animate__fadeInUp">
                    <div class="modal-header">
                        <h3 class="modal-title">سجل الأقساط المدفوعة</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="installment-history-content"></div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline modal-close-btn">إغلاق</button>
                        <button class="btn btn-outline" id="export-history-btn">
                            <i class="fas fa-download"></i>
                            <span>تصدير السجل</span>
                        </button>
                    </div>
                </div>
            `;
            
            // إضافة النافذة للجسم
            document.body.appendChild(historyModal);
            
            // إضافة مستمعي الأحداث للنافذة
            setupHistoryModalListeners(historyModal);
        }
    }
    
    /**
     * إضافة مستمعي الأحداث لنافذة إضافة/تعديل قسط
     * @param {HTMLElement} modalElement - عنصر النافذة المنبثقة
     */
    function setupInstallmentModalListeners(modalElement) {
        // زر حفظ القسط
        const saveButton = modalElement.querySelector('#save-installment-btn');
        if (saveButton) {
            saveButton.addEventListener('click', function() {
                saveInstallment();
            });
        }
        
        // تعيين التاريخ الافتراضي
        const dueDateInput = modalElement.querySelector('#installment-due-date');
        if (dueDateInput) {
            // تعيين تاريخ اليوم كقيمة افتراضية
            dueDateInput.value = new Date().toISOString().split('T')[0];
        }
    }
    
    /**
     * إضافة مستمعي الأحداث لنافذة تأكيد استقطاع الأقساط
     * @param {HTMLElement} modalElement - عنصر النافذة المنبثقة
     */
    function setupConfirmationModalListeners(modalElement) {
        // زر دفع الأرباح مع استقطاع الأقساط
        const payWithDeductionBtn = modalElement.querySelector('#pay-with-deduction-btn');
        if (payWithDeductionBtn) {
            payWithDeductionBtn.addEventListener('click', function() {
                const callback = modalElement._confirmCallback;
                if (typeof callback === 'function') {
                    callback(true);
                }
                closeModal('installment-confirmation-modal');
            });
        }
        
        // زر دفع الأرباح بدون استقطاع الأقساط
        const payWithoutDeductionBtn = modalElement.querySelector('#pay-without-deduction-btn');
        if (payWithoutDeductionBtn) {
            payWithoutDeductionBtn.addEventListener('click', function() {
                const callback = modalElement._confirmCallback;
                if (typeof callback === 'function') {
                    callback(false);
                }
                closeModal('installment-confirmation-modal');
            });
        }
    }
    
    /**
     * إضافة مستمعي الأحداث لنافذة سجل الأقساط المدفوعة
     * @param {HTMLElement} modalElement - عنصر النافذة المنبثقة
     */
    function setupHistoryModalListeners(modalElement) {
        // زر تصدير السجل
        const exportButton = modalElement.querySelector('#export-history-btn');
        if (exportButton) {
            exportButton.addEventListener('click', function() {
                exportInstallmentHistory();
            });
        }
    }
    
    /**
     * إضافة مستمعي الأحداث لصفحة الأقساط
     * @param {HTMLElement} pageElement - عنصر الصفحة
     */
    function setupInstallmentsPageListeners(pageElement) {
        // أزرار التصفية
        const filterButtons = pageElement.querySelectorAll('.btn-group .btn[data-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // إزالة الكلاس النشط من جميع الأزرار
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // إضافة الكلاس النشط للزر المحدد
                this.classList.add('active');
                
                // تصفية الأقساط حسب الفلتر المحدد
                const filter = this.getAttribute('data-filter');
                filterInstallments(filter);
            });
        });
        
        // زر إضافة قسط جديد
        const addButton = pageElement.querySelector('#add-global-installment-btn');
        if (addButton) {
            addButton.addEventListener('click', function() {
                showAddInstallmentModal();
            });
        }
        
        // حقل البحث
        const searchInput = pageElement.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchInstallments(this.value);
            });
        }
    }
    
    /**
     * إضافة مستمعي الأحداث لأزرار الأقساط في تفاصيل المستثمر
     * @param {HTMLElement} container - حاوية تفاصيل المستثمر
     */
    function setupInstallmentButtonsListeners(container) {
        // زر إضافة قسط
        const addButton = container.querySelector('.add-installment-btn');
        if (addButton) {
            addButton.addEventListener('click', function() {
                const investorId = this.getAttribute('data-investor-id');
                showAddInstallmentModal(investorId);
            });
        }
        
        // أزرار دفع الأقساط
        const payButtons = container.querySelectorAll('.pay-installment-btn');
        payButtons.forEach(button => {
            button.addEventListener('click', function() {
                const investorId = this.getAttribute('data-investor-id');
                const installmentId = this.getAttribute('data-installment-id');
                payInstallment(investorId, installmentId);
            });
        });
        
        // أزرار تعديل الأقساط
        const editButtons = container.querySelectorAll('.edit-installment-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const investorId = this.getAttribute('data-investor-id');
                const installmentId = this.getAttribute('data-installment-id');
                editInstallment(investorId, installmentId);
            });
        });
        
        // رابط عرض سجل الأقساط المدفوعة
        const historyLink = container.querySelector('.view-paid-installments');
        if (historyLink) {
            historyLink.addEventListener('click', function(e) {
                e.preventDefault();
                const investorId = this.getAttribute('data-investor-id');
                showInstallmentHistory(investorId);
            });
        }
    }
    
    /**
     * عرض نافذة إضافة قسط جديد
     * @param {string} investorId - معرف المستثمر (اختياري)
     */
    function showAddInstallmentModal(investorId = null) {
        // إعادة تعيين النموذج
        const form = document.getElementById('installment-form');
        if (form) {
            form.reset();
        }
        
        // تعيين العنوان
        const title = document.getElementById('installment-modal-title');
        if (title) {
            title.textContent = 'إضافة قسط جديد';
        }
        
        // تعيين تاريخ اليوم كقيمة افتراضية
        const dueDateInput = document.getElementById('installment-due-date');
        if (dueDateInput) {
            dueDateInput.value = new Date().toISOString().split('T')[0];
        }
        
        // إعادة تعيين حقول المعرفات
        document.getElementById('installment-id').value = '';
        document.getElementById('installment-investor-id').value = investorId || '';
        
        // التعامل مع حاوية اختيار المستثمر
        const investorSelectContainer = document.getElementById('investor-select-container');
        const investorSelect = document.getElementById('installment-investor');
        
        if (investorId) {
            // إخفاء قائمة اختيار المستثمر عند تحديد مستثمر مسبقاً
            if (investorSelectContainer) {
                investorSelectContainer.style.display = 'none';
            }
        } else {
            // إظهار قائمة اختيار المستثمر وملؤها
            if (investorSelectContainer) {
                investorSelectContainer.style.display = 'block';
            }
            
            if (investorSelect) {
                // ملء قائمة المستثمرين
                populateInvestorsList(investorSelect);
            }
        }
        
        // فتح النافذة
        openModal('add-installment-modal');
    }
    
    /**
     * عرض نافذة تعديل قسط محدد
     * @param {string} investorId - معرف المستثمر
     * @param {string} installmentId - معرف القسط
     */
    function editInstallment(investorId, installmentId) {
        // البحث عن المستثمر والقسط
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor || !investor.installments) {
            showNotification('لم يتم العثور على بيانات المستثمر أو الأقساط', 'error');
            return;
        }
        
        const installment = investor.installments.find(inst => inst.id === installmentId);
        if (!installment) {
            showNotification('لم يتم العثور على بيانات القسط', 'error');
            return;
        }
        
        // تعيين العنوان
        const title = document.getElementById('installment-modal-title');
        if (title) {
            title.textContent = 'تعديل القسط';
        }
        
        // ملء النموذج ببيانات القسط
        document.getElementById('installment-id').value = installmentId;
        document.getElementById('installment-investor-id').value = investorId;
        document.getElementById('installment-description').value = installment.description || '';
        document.getElementById('installment-amount').value = installment.amount || 0;
        document.getElementById('installment-due-date').value = installment.dueDate || '';
        document.getElementById('installment-notes').value = installment.notes || '';
        
        const priorityCheckbox = document.getElementById('installment-priority');
        if (priorityCheckbox) {
            priorityCheckbox.checked = installment.priority === 'high';
        }
        
        // إخفاء قائمة اختيار المستثمر
        const investorSelectContainer = document.getElementById('investor-select-container');
        if (investorSelectContainer) {
            investorSelectContainer.style.display = 'none';
        }
        
        // فتح النافذة
        openModal('add-installment-modal');
    }
    
    /**
     * حفظ بيانات القسط (إضافة جديد أو تعديل قائم)
     */
    function saveInstallment() {
        // الحصول على بيانات النموذج
        const installmentId = document.getElementById('installment-id').value;
        let investorId = document.getElementById('installment-investor-id').value;
        
        // إذا لم يتم تحديد مستثمر مسبقاً، نحصل عليه من القائمة
        if (!investorId) {
            const investorSelect = document.getElementById('installment-investor');
            if (investorSelect) {
                investorId = investorSelect.value;
            }
        }
        
        // التحقق من اختيار مستثمر
        if (!investorId) {
            showNotification('الرجاء اختيار مستثمر', 'error');
            return;
        }
        
        // الحصول على باقي البيانات
        const description = document.getElementById('installment-description').value;
        const amount = parseFloat(document.getElementById('installment-amount').value);
        const dueDate = document.getElementById('installment-due-date').value;
        const notes = document.getElementById('installment-notes').value;
        const priorityCheckbox = document.getElementById('installment-priority');
        const priority = priorityCheckbox && priorityCheckbox.checked ? 'high' : 'normal';
        
        // التحقق من صحة البيانات
        if (!description || isNaN(amount) || amount <= 0 || !dueDate) {
            showNotification('الرجاء ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
            return;
        }
        
        // البحث عن المستثمر
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor) {
            showNotification('لم يتم العثور على بيانات المستثمر', 'error');
            return;
        }
        
        // التأكد من وجود مصفوفة الأقساط
        if (!investor.installments) {
            investor.installments = [];
        }
        
        // تحديد ما إذا كنا نضيف قسطاً جديداً أو نعدل قسطاً موجوداً
        if (installmentId) {
            // تعديل قسط موجود
            const existingIndex = investor.installments.findIndex(inst => inst.id === installmentId);
            if (existingIndex === -1) {
                showNotification('لم يتم العثور على بيانات القسط', 'error');
                return;
            }
            
            // الحفاظ على المبلغ المدفوع من القسط الأصلي
            const paidAmount = investor.installments[existingIndex].paidAmount || 0;
            const remainingAmount = Math.max(0, amount - paidAmount);
            
            // تحديث بيانات القسط
            investor.installments[existingIndex] = {
                ...investor.installments[existingIndex],
                description,
                amount,
                dueDate,
                notes,
                priority,
                remainingAmount,
                updatedAt: new Date().toISOString()
            };
            
            // تحديث حالة القسط بناءً على المبلغ المتبقي
            if (remainingAmount <= 0) {
                investor.installments[existingIndex].status = 'paid';
            } else {
                investor.installments[existingIndex].status = 'active';
            }
            
            showNotification('تم تحديث بيانات القسط بنجاح', 'success');
        } else {
            // إضافة قسط جديد
            const newInstallment = {
                id: Date.now().toString(),
                description,
                amount,
                dueDate,
                notes,
                priority,
                status: 'active',
                paidAmount: 0,
                remainingAmount: amount,
                createdAt: new Date().toISOString()
            };
            
            investor.installments.push(newInstallment);
            showNotification('تم إضافة القسط الجديد بنجاح', 'success');
        }
        
        // حفظ البيانات
        if (typeof window.saveData === 'function') {
            window.saveData();
        }
        
        // إغلاق النافذة
        closeModal('add-installment-modal');
        
        // تحديث واجهة المستخدم
        if (document.querySelector('#installments-page.active')) {
            renderInstallmentsTable();
            updateInstallmentsDashboard();
        } else if (document.getElementById('investor-details-content')) {
            // إذا كنا في صفحة تفاصيل المستثمر، نقوم بتحديثها
            setTimeout(() => {
                addInstallmentsToInvestorDetails(investor);
            }, 100);
        }
    }
    
    /**
     * دفع قسط محدد
     * @param {string} investorId - معرف المستثمر
     * @param {string} installmentId - معرف القسط
     */
    function payInstallment(investorId, installmentId) {
        // البحث عن المستثمر والقسط
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor || !investor.installments) {
            showNotification('لم يتم العثور على بيانات المستثمر أو الأقساط', 'error');
            return;
        }
        
        const installmentIndex = investor.installments.findIndex(inst => inst.id === installmentId);
        if (installmentIndex === -1) {
            showNotification('لم يتم العثور على بيانات القسط', 'error');
            return;
        }
        
        const installment = investor.installments[installmentIndex];
        
        // التحقق من حالة القسط
        if (installment.status === 'paid') {
            showNotification('هذا القسط مدفوع بالفعل', 'warning');
            return;
        }
        
        // طلب تأكيد دفع القسط
        if (confirm(`هل أنت متأكد من رغبتك في تسديد القسط "${installment.description}" بقيمة ${formatCurrency(installment.remainingAmount)}؟`)) {
            // تسجيل عملية دفع القسط
            const paymentTransaction = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                type: 'دفع قسط',
                investorId,
                investorName: investor.name,
                amount: installment.remainingAmount,
                notes: `دفع قسط: ${installment.description}`
            };
            
            // إضافة العملية إلى سجل العمليات
            if (Array.isArray(window.transactions)) {
                window.transactions.push(paymentTransaction);
            }
            
            // تحديث بيانات القسط
            installment.status = 'paid';
            installment.paidAmount = installment.amount;
            installment.remainingAmount = 0;
            installment.paidDate = new Date().toISOString().split('T')[0];
            installment.paymentMethod = 'manual';
            
            // حفظ البيانات
            if (typeof window.saveData === 'function') {
                window.saveData();
            }
            
            showNotification('تم تسديد القسط بنجاح', 'success');
            
            // تحديث واجهة المستخدم
            if (document.querySelector('#installments-page.active')) {
                renderInstallmentsTable();
                updateInstallmentsDashboard();
            } else if (document.getElementById('investor-details-content')) {
                // إذا كنا في صفحة تفاصيل المستثمر، نقوم بتحديثها
                setTimeout(() => {
                    addInstallmentsToInvestorDetails(investor);
                }, 100);
            }
        }
    }
    
    /**
     * عرض سجل الأقساط المدفوعة لمستثمر محدد
     * @param {string} investorId - معرف المستثمر
     */
    function showInstallmentHistory(investorId) {
        // البحث عن المستثمر
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor || !investor.installments) {
            showNotification('لم يتم العثور على بيانات المستثمر أو الأقساط', 'error');
            return;
        }
        
        // الحصول على الأقساط المدفوعة
        const paidInstallments = investor.installments.filter(inst => inst.status === 'paid');
        
        // إعداد محتوى السجل
        const historyContent = document.getElementById('installment-history-content');
        if (!historyContent) return;
        
        if (paidInstallments.length === 0) {
            historyContent.innerHTML = `
                <div class="empty-history">
                    <p>لا توجد أقساط مدفوعة لهذا المستثمر.</p>
                </div>
            `;
        } else {
            // ترتيب الأقساط المدفوعة حسب تاريخ الدفع (الأحدث أولاً)
            paidInstallments.sort((a, b) => new Date(b.paidDate || b.updatedAt || b.createdAt) - new Date(a.paidDate || a.updatedAt || a.createdAt));
            
            historyContent.innerHTML = `
                <div class="investor-profile">
                    <div class="investor-avatar large">${investor.name.charAt(0)}</div>
                    <h2 class="investor-fullname">${investor.name}</h2>
                </div>
                
                <h3 class="section-title">سجل الأقساط المدفوعة</h3>
                
                <div class="table-container">
                    <table class="installments-table">
                        <thead>
                            <tr>
                                <th>الوصف</th>
                                <th>المبلغ الإجمالي</th>
                                <th>تاريخ الاستحقاق</th>
                                <th>تاريخ الدفع</th>
                                <th>طريقة الدفع</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${paidInstallments.map(inst => `
                                <tr>
                                    <td>${inst.description}</td>
                                    <td>${formatCurrency(inst.amount)}</td>
                                    <td>${formatDate(inst.dueDate)}</td>
                                    <td>${formatDate(inst.paidDate || inst.updatedAt)}</td>
                                    <td>${getPaymentMethodText(inst.paymentMethod)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        // فتح النافذة
        openModal('installment-history-modal');
    }
    
    /**
     * الحصول على نص طريقة الدفع
     * @param {string} method - رمز طريقة الدفع
     * @returns {string} - النص المقابل لطريقة الدفع
     */
    function getPaymentMethodText(method) {
        switch (method) {
            case 'profit_deduction':
                return 'استقطاع من الأرباح';
            case 'manual':
                return 'دفع يدوي';
            default:
                return 'غير محدد';
        }
    }
    
    /**
     * تصدير سجل الأقساط المدفوعة
     */
    function exportInstallmentHistory() {
        const historyContent = document.getElementById('installment-history-content');
        if (!historyContent) return;
        
        // الحصول على اسم المستثمر من العنوان
        const investorName = historyContent.querySelector('.investor-fullname')?.textContent || 'مستثمر';
        
        // الحصول على بيانات الجدول
        const table = historyContent.querySelector('table');
        if (!table) {
            showNotification('لا توجد بيانات للتصدير', 'error');
            return;
        }
        
        // إنشاء سلسلة CSV
        let csvContent = "الوصف,المبلغ الإجمالي,تاريخ الاستحقاق,تاريخ الدفع,طريقة الدفع\n";
        
        // إضافة الصفوف
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = Array.from(cells).map(cell => `"${cell.textContent.replace(/"/g, '""')}"`);
            csvContent += rowData.join(',') + '\n';
        });
        
        // إنشاء ملف للتنزيل
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `سجل_أقساط_${investorName}_${formatDateForFileName(new Date())}.csv`);
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('تم تصدير السجل بنجاح', 'success');
    }
    
    /**
     * تنسيق التاريخ لاستخدامه في اسم الملف
     * @param {Date} date - الكائن Date
     * @returns {string} - التاريخ المنسق
     */
    function formatDateForFileName(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * عرض نافذة تأكيد استقطاع الأقساط
     * @param {Object} investor - بيانات المستثمر
     * @param {number} totalProfit - إجمالي الربح المستحق
     * @param {Function} callback - دالة رد النداء عند الضغط على أحد أزرار التأكيد
     */
    function showInstallmentConfirmationModal(investor, totalProfit, callback) {
        // الحصول على الأقساط المستحقة
        const dueInstallments = getDueInstallments(investor);
        
        // إذا لم توجد أقساط مستحقة، نستمر بدون عرض النافذة
        if (dueInstallments.length === 0) {
            if (typeof callback === 'function') {
                callback(false);
            }
            return;
        }
        
        // إجمالي الأقساط المستحقة
        const totalDueAmount = dueInstallments.reduce((sum, installment) => sum + installment.remainingAmount, 0);
        
        // الربح النهائي بعد الاستقطاع
        const finalProfit = Math.max(0, totalProfit - totalDueAmount);
        
        // ملء تفاصيل الاستقطاع
        const detailsContainer = document.getElementById('installment-deduction-details');
        if (detailsContainer) {
            detailsContainer.innerHTML = `
                <div class="confirmation-details">
                    <div class="investor-name">
                        <strong>المستثمر:</strong> ${investor.name}
                    </div>
                    
                    <div class="installments-list">
                        <h4>الأقساط المستحقة:</h4>
                        <ul>
                            ${dueInstallments.map(installment => `
                                <li>
                                    <span class="installment-desc">${installment.description}</span>
                                    <span class="installment-amount">${formatCurrency(installment.remainingAmount)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="profit-details">
                        <div class="detail-row">
                            <span class="detail-label">إجمالي الربح المستحق:</span>
                            <span class="detail-value">${formatCurrency(totalProfit)}</span>
                        </div>
                        <div class="detail-row deduction">
                            <span class="detail-label">إجمالي الأقساط المستحقة:</span>
                            <span class="detail-value">- ${formatCurrency(totalDueAmount)}</span>
                        </div>
                        <div class="detail-row final ${finalProfit === 0 ? 'zero' : ''}">
                            <span class="detail-label">صافي الربح بعد الاستقطاع:</span>
                            <span class="detail-value">${formatCurrency(finalProfit)}</span>
                        </div>
                    </div>
                    
                    ${finalProfit === 0 ? `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>تنبيه: سيتم استقطاع جميع الأرباح لتسديد الأقساط المستحقة.</span>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        // تخزين دالة رد النداء في النافذة
        const modalElement = document.getElementById('installment-confirmation-modal');
        if (modalElement) {
            modalElement._confirmCallback = callback;
        }
        
        // فتح النافذة
        openModal('installment-confirmation-modal');
    }
    
    /**
     * معالجة استقطاع الأقساط من الأرباح
     * @param {Object} investor - بيانات المستثمر
     * @param {Array} dueInstallments - الأقساط المستحقة
     * @param {number} totalDueAmount - إجمالي الأقساط المستحقة
     * @param {number} totalProfit - إجمالي الربح المستحق
     * @param {number} finalProfit - صافي الربح بعد الاستقطاع
     */
    function processInstallmentDeduction(investor, dueInstallments, totalDueAmount, totalProfit, finalProfit) {
        // إذا لم توجد أقساط مستحقة أو إجمالي الربح صفر، نخرج
        if (dueInstallments.length === 0 || totalProfit <= 0) {
            if (typeof window._originalPayProfit === 'function') {
                window._originalPayProfit();
            }
            return;
        }
        
        // المبلغ المتاح للاستقطاع
        const availableAmount = Math.min(totalProfit, totalDueAmount);
        
        // معالجة الأقساط المستحقة
        let remainingAmount = availableAmount;
        const paidInstallments = [];
        const partiallyPaidInstallments = [];
        
        // سداد الأقساط ذات الأولوية العالية أولاً
        const sortedInstallments = [...dueInstallments].sort((a, b) => {
            // ترتيب حسب الأولوية ثم حسب تاريخ الاستحقاق
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
        
        // سداد الأقساط من الأرباح
        sortedInstallments.forEach(dueInstallment => {
            if (remainingAmount <= 0) return;
            
            // الحصول على القسط من بيانات المستثمر
            const installmentIndex = investor.installments.findIndex(inst => inst.id === dueInstallment.id);
            if (installmentIndex === -1) return;
            
            const installment = investor.installments[installmentIndex];
            
            // المبلغ المطلوب للقسط
            const requiredAmount = installment.remainingAmount;
            
            // المبلغ الذي سيتم دفعه
            const paymentAmount = Math.min(remainingAmount, requiredAmount);
            
            // تحديث المبلغ المدفوع والمتبقي
            installment.paidAmount = (installment.paidAmount || 0) + paymentAmount;
            installment.remainingAmount = Math.max(0, installment.remainingAmount - paymentAmount);
            
            // تحديث حالة القسط
            if (installment.remainingAmount <= 0) {
                installment.status = 'paid';
                installment.paidDate = new Date().toISOString().split('T')[0];
                installment.paymentMethod = 'profit_deduction';
                paidInstallments.push(installment);
            } else {
                installment.status = 'active';
                partiallyPaidInstallments.push(installment);
            }
            
            // تحديث المبلغ المتبقي للاستقطاع
            remainingAmount -= paymentAmount;
        });
        
        // إنشاء وصف لعمليات سداد الأقساط
        let deductionNotes = '';
        
        if (paidInstallments.length > 0) {
            deductionNotes += `تم سداد ${paidInstallments.length} قسط: `;
            deductionNotes += paidInstallments.map(inst => inst.description).join('، ');
        }
        
        if (partiallyPaidInstallments.length > 0) {
            if (deductionNotes) deductionNotes += '. ';
            deductionNotes += `تم سداد جزئي لـ ${partiallyPaidInstallments.length} قسط: `;
            deductionNotes += partiallyPaidInstallments.map(inst => inst.description).join('، ');
        }
        
        // إضافة عملية دفع الأرباح مع استقطاع الأقساط
        investor.profits.push({
            date: new Date().toISOString().split('T')[0],
            amount: finalProfit,
            deductedAmount: availableAmount,
            notes: deductionNotes
        });
        
        // إضافة عملية جديدة
        const transactionNotes = `دفع أرباح مستحقة ${deductionNotes ? `مع استقطاع أقساط (${deductionNotes})` : ''}`;
        addTransaction('دفع أرباح', investor.id, finalProfit, transactionNotes);
        
        // حفظ البيانات
        if (typeof window.saveData === 'function') {
            window.saveData();
        }
        
        // إغلاق النافذة المنبثقة
        closeModal('pay-profit-modal');
        
        // عرض إشعار النجاح
        showNotification(`تم دفع الأرباح بمبلغ ${formatCurrency(finalProfit)} للمستثمر ${investor.name} بنجاح!${availableAmount > 0 ? ` (تم استقطاع ${formatCurrency(availableAmount)} لسداد الأقساط المستحقة)` : ''}`, 'success');
    }
    
    /**
     * الحصول على الأقساط المستحقة لمستثمر محدد
     * @param {Object} investor - بيانات المستثمر
     * @returns {Array} - مصفوفة الأقساط المستحقة
     */
    function getDueInstallments(investor) {
        if (!investor || !investor.installments) return [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return investor.installments.filter(installment => {
            // تجاهل الأقساط المدفوعة
            if (installment.status === 'paid') return false;
            
            // تحويل تاريخ الاستحقاق إلى كائن Date
            const dueDate = new Date(installment.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            // القسط مستحق إذا كان تاريخ استحقاقه اليوم أو قبل اليوم
            return dueDate <= today;
        });
    }
    
    /**
     * تحديث لوحة تحكم الأقساط
     */
    function updateInstallmentsDashboard() {
        // إجمالي الأقساط المستحقة
        let totalDueAmount = 0;
        let totalDueCount = 0;
        
        // إجمالي الأقساط القادمة
        let totalUpcomingAmount = 0;
        let totalUpcomingCount = 0;
        
        // إجمالي الأقساط المدفوعة
        let totalPaidAmount = 0;
        let totalPaidCount = 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // حساب الإحصائيات
        window.investors.forEach(investor => {
            if (!investor.installments) return;
            
            investor.installments.forEach(installment => {
                const dueDate = new Date(installment.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                
                if (installment.status === 'paid') {
                    // أقساط مدفوعة
                    totalPaidAmount += installment.amount;
                    totalPaidCount++;
                } else if (dueDate <= today) {
                    // أقساط مستحقة
                    totalDueAmount += installment.remainingAmount;
                    totalDueCount++;
                } else {
                    // أقساط قادمة
                    totalUpcomingAmount += installment.remainingAmount;
                    totalUpcomingCount++;
                }
            });
        });
        
        // حساب نسبة التحصيل
        const totalInstallments = totalPaidAmount + totalDueAmount + totalUpcomingAmount;
        const collectionRate = totalInstallments > 0 ? (totalPaidAmount / totalInstallments) * 100 : 0;
        
        // تحديث الإحصائيات في لوحة التحكم
        document.getElementById('total-due-installments').textContent = formatCurrency(totalDueAmount);
        document.getElementById('total-due-count').textContent = `${totalDueCount} قسط`;
        
        document.getElementById('total-upcoming-installments').textContent = formatCurrency(totalUpcomingAmount);
        document.getElementById('total-upcoming-count').textContent = `${totalUpcomingCount} قسط`;
        
        document.getElementById('total-paid-installments').textContent = formatCurrency(totalPaidAmount);
        document.getElementById('total-paid-count').textContent = `${totalPaidCount} قسط`;
        
        document.getElementById('collection-rate').textContent = `${collectionRate.toFixed(1)}%`;
        
        // تحديث اتجاه نسبة التحصيل (يمكن تحسينه لاحقاً بمقارنة مع الشهر السابق)
        const collectionTrend = document.getElementById('collection-trend');
        if (collectionRate >= 70) {
            collectionTrend.className = 'fas fa-arrow-up';
            collectionTrend.style.color = '#10b981';
        } else if (collectionRate >= 40) {
            collectionTrend.className = 'fas fa-arrow-right';
            collectionTrend.style.color = '#f59e0b';
        } else {
            collectionTrend.className = 'fas fa-arrow-down';
            collectionTrend.style.color = '#ef4444';
        }
    }
    
    /**
     * عرض صفحة الأقساط وتحديثها
     */
    function showInstallmentsPage() {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إظهار صفحة الأقساط
        const installmentsPage = document.getElementById('installments-page');
        if (installmentsPage) {
            installmentsPage.classList.add('active');
            
            // تحديث لوحة التحكم
            updateInstallmentsDashboard();
            
            // عرض جدول الأقساط
            renderInstallmentsTable();
            
            // تحديث القائمة الجانبية
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            const installmentsNavLink = document.querySelector('.nav-link[data-page="installments"]');
            if (installmentsNavLink) {
                installmentsNavLink.classList.add('active');
            }
        }
    }
    
    /**
     * عرض جدول الأقساط
     * @param {string} filter - فلتر لعرض أنواع محددة من الأقساط
     */
    function renderInstallmentsTable(filter = 'all') {
        const tableBody = document.querySelector('#installments-table tbody');
        if (!tableBody) return;
        
        // تجميع جميع الأقساط النشطة من جميع المستثمرين
        let allInstallments = [];
        
        window.investors.forEach(investor => {
            if (!investor.installments) return;
            
            const investorInstallments = investor.installments
                .filter(installment => installment.status !== 'paid')
                .map(installment => ({
                    ...installment,
                    investorId: investor.id,
                    investorName: investor.name
                }));
                
            allInstallments = allInstallments.concat(investorInstallments);
        });
        
        // تصفية الأقساط حسب الفلتر المحدد
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const filteredInstallments = allInstallments.filter(installment => {
            const dueDate = new Date(installment.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            switch (filter) {
                case 'overdue':
                    return dueDate < today;
                case 'today':
                    return dueDate.getTime() === today.getTime();
                case 'upcoming':
                    return dueDate > today;
                default:
                    return true;
            }
        });
        
        // ترتيب الأقساط حسب تاريخ الاستحقاق (المستحقة أولاً)
        filteredInstallments.sort((a, b) => {
            // ترتيب حسب تاريخ الاستحقاق
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return dateA - dateB;
        });
        
        // تفريغ الجدول
        tableBody.innerHTML = '';
        
        // إذا لم توجد أقساط، نعرض رسالة
        if (filteredInstallments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">لا توجد أقساط ${getFilterText(filter)}</td>
                </tr>
            `;
            return;
        }
        
        // إضافة الأقساط إلى الجدول
        filteredInstallments.forEach(installment => {
            // تحديد حالة القسط (متأخر، مستحق اليوم، قادم)
            const dueDate = new Date(installment.dueDate);
            const daysRemaining = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
            
            let statusClass = '';
            let statusText = '';
            
            if (daysRemaining < 0) {
                statusClass = 'status-overdue';
                statusText = `متأخر (${Math.abs(daysRemaining)} يوم)`;
            } else if (daysRemaining === 0) {
                statusClass = 'status-today';
                statusText = 'مستحق اليوم';
            } else {
                statusClass = 'status-upcoming';
                statusText = `بعد ${daysRemaining} يوم`;
            }
            
            const row = document.createElement('tr');
            row.className = statusClass;
            
            row.innerHTML = `
                <td>
                    <div class="investor-info">
                        <div class="investor-avatar">${installment.investorName.charAt(0)}</div>
                        <div>
                            <div class="investor-name">${installment.investorName}</div>
                            <div class="investor-id">${installment.investorId}</div>
                        </div>
                    </div>
                </td>
                <td>${installment.description}</td>
                <td>${formatDate(installment.dueDate)}</td>
                <td>${formatCurrency(installment.amount)}</td>
                <td>${formatCurrency(installment.remainingAmount)}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn btn-sm btn-success pay-installment-btn" data-investor-id="${installment.investorId}" data-installment-id="${installment.id}">
                            <i class="fas fa-coins"></i>
                            <span>تسديد</span>
                        </button>
                        <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${installment.investorId}" data-installment-id="${installment.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // إضافة مستمعي الأحداث للأزرار
        setupInstallmentTableButtonsListeners();
    }
    
    /**
     * الحصول على نص الفلتر
     * @param {string} filter - الفلتر المحدد
     * @returns {string} - النص المقابل للفلتر
     */
    function getFilterText(filter) {
        switch (filter) {
            case 'overdue':
                return 'متأخرة';
            case 'today':
                return 'مستحقة اليوم';
            case 'upcoming':
                return 'قادمة';
            default:
                return '';
        }
    }
    
    /**
     * إضافة مستمعي الأحداث لأزرار جدول الأقساط
     */
    function setupInstallmentTableButtonsListeners() {
        // أزرار تسديد الأقساط
        document.querySelectorAll('#installments-table .pay-installment-btn').forEach(button => {
            button.addEventListener('click', function() {
                const investorId = this.getAttribute('data-investor-id');
                const installmentId = this.getAttribute('data-installment-id');
                payInstallment(investorId, installmentId);
            });
        });
        
        // أزرار تعديل الأقساط
        document.querySelectorAll('#installments-table .edit-installment-btn').forEach(button => {
            button.addEventListener('click', function() {
                const investorId = this.getAttribute('data-investor-id');
                const installmentId = this.getAttribute('data-installment-id');
                editInstallment(investorId, installmentId);
            });
        });
    }
    
    /**
     * تصفية الأقساط حسب الفلتر المحدد
     * @param {string} filter - الفلتر المحدد
     */
    function filterInstallments(filter) {
        renderInstallmentsTable(filter);
    }
    
    /**
     * البحث في الأقساط
     * @param {string} query - نص البحث
     */
    function searchInstallments(query) {
        // التحقق من وجود نص بحث
        if (!query || query.trim() === '') {
            renderInstallmentsTable();
            return;
        }
        
        query = query.trim().toLowerCase();
        
        // تجميع جميع الأقساط النشطة من جميع المستثمرين
        let allInstallments = [];
        
        window.investors.forEach(investor => {
            if (!investor.installments) return;
            
            // البحث في اسم المستثمر
            const investorMatchesQuery = investor.name.toLowerCase().includes(query);
            
            const investorInstallments = investor.installments
                .filter(installment => {
                    // تجاهل الأقساط المدفوعة
                    if (installment.status === 'paid') return false;
                    
                    // البحث في وصف القسط أو ملاحظاته
                    return investorMatchesQuery || 
                           (installment.description && installment.description.toLowerCase().includes(query)) ||
                           (installment.notes && installment.notes.toLowerCase().includes(query));
                })
                .map(installment => ({
                    ...installment,
                    investorId: investor.id,
                    investorName: investor.name
                }));
                
            allInstallments = allInstallments.concat(investorInstallments);
        });
        
        // عرض النتائج
        const tableBody = document.querySelector('#installments-table tbody');
        if (!tableBody) return;
        
        // تفريغ الجدول
        tableBody.innerHTML = '';
        
        // إذا لم توجد نتائج، نعرض رسالة
        if (allInstallments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">لا توجد نتائج مطابقة لـ "${query}"</td>
                </tr>
            `;
            return;
        }
        
     // ترتيب الأقساط حسب تاريخ الاستحقاق (المستحقة أولاً)
        allInstallments.sort((a, b) => {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return dateA - dateB;
        });
        
        // عرض النتائج في الجدول
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // إضافة الأقساط إلى الجدول
        allInstallments.forEach(installment => {
            // تحديد حالة القسط (متأخر، مستحق اليوم، قادم)
            const dueDate = new Date(installment.dueDate);
            const daysRemaining = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
            
            let statusClass = '';
            let statusText = '';
            
            if (daysRemaining < 0) {
                statusClass = 'status-overdue';
                statusText = `متأخر (${Math.abs(daysRemaining)} يوم)`;
            } else if (daysRemaining === 0) {
                statusClass = 'status-today';
                statusText = 'مستحق اليوم';
            } else {
                statusClass = 'status-upcoming';
                statusText = `بعد ${daysRemaining} يوم`;
            }
            
            const row = document.createElement('tr');
            row.className = statusClass;
            
            row.innerHTML = `
                <td>
                    <div class="investor-info">
                        <div class="investor-avatar">${installment.investorName.charAt(0)}</div>
                        <div>
                            <div class="investor-name">${installment.investorName}</div>
                            <div class="investor-id">${installment.investorId}</div>
                        </div>
                    </div>
                </td>
                <td>${installment.description}</td>
                <td>${formatDate(installment.dueDate)}</td>
                <td>${formatCurrency(installment.amount)}</td>
                <td>${formatCurrency(installment.remainingAmount)}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn btn-sm btn-success pay-installment-btn" data-investor-id="${installment.investorId}" data-installment-id="${installment.id}">
                            <i class="fas fa-coins"></i>
                            <span>تسديد</span>
                        </button>
                        <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${installment.investorId}" data-installment-id="${installment.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // إضافة مستمعي الأحداث للأزرار
        setupInstallmentTableButtonsListeners();
    }
    
    /**
     * ملء قائمة المستثمرين
     * @param {HTMLElement} selectElement - عنصر قائمة الاختيار
     */
    function populateInvestorsList(selectElement) {
        if (!selectElement) return;
        
        // تفريغ القائمة
        selectElement.innerHTML = '<option value="">اختر المستثمر</option>';
        
        // ترتيب المستثمرين أبجدياً
        const sortedInvestors = [...window.investors].sort((a, b) => a.name.localeCompare(b.name));
        
        // إضافة المستثمرين إلى القائمة
        sortedInvestors.forEach(investor => {
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = `${investor.name} (${investor.phone || 'بدون رقم'})`;
            selectElement.appendChild(option);
        });
    }
    
    /**
     * إضافة أنماط CSS لنظام الأقساط
     */
    function addInstallmentStyles() {
        // التحقق من وجود أنماط مسبقة
        if (document.getElementById('installment-styles')) {
            return;
        }
        
        // إنشاء عنصر نمط جديد
        const styleElement = document.createElement('style');
        styleElement.id = 'installment-styles';
        
        // إضافة أنماط CSS
        styleElement.textContent = `
            /* أنماط قسم الأقساط */
            .installments-section {
                margin-top: 1.5rem;
                background-color: #f8fafc;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .installments-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 0.75rem;
            }
            
            .installments-table th,
            .installments-table td {
                padding: 8px 12px;
                text-align: right;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .installments-table thead th {
                background-color: #f1f5f9;
                font-weight: 600;
                color: #475569;
            }
            
            .alert {
                padding: 12px 16px;
                border-radius: 6px;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .alert-warning {
                background-color: #fff7ed;
                border-left: 4px solid #f59e0b;
                color: #92400e;
            }
            
            .alert-info {
                background-color: #eff6ff;
                border-left: 4px solid #3b82f6;
                color: #1e40af;
            }
            
            /* أنماط ملخص الأرباح */
            .profit-summary {
                background-color: #fff;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                margin-top: 1rem;
                overflow: hidden;
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 16px;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .summary-row:last-child {
                border-bottom: none;
            }
            
            .summary-row.deduction {
                background-color: #fee2e2;
                color: #b91c1c;
            }
            
            .summary-row.total {
                background-color: #ecfdf5;
                color: #047857;
                font-weight: 600;
                font-size: 1.1em;
            }
            
            .summary-row.total.zero {
                background-color: #ffedd5;
                color: #c2410c;
            }
            
            /* أنماط قسم الأقساط في تفاصيل المستثمر */
            .installments-detail-group {
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 1px solid #e2e8f0;
            }
            
            .installments-summary {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 0.75rem;
            }
            
            .installments-summary.due {
                background-color: #fee2e2;
            }
            
            .installments-summary.upcoming {
                background-color: #f0f9ff;
            }
            
            .summary-title {
                display: flex;
                align-items: center;
                gap: 6px;
                font-weight: 600;
            }
            
            .summary-amount {
                font-weight: 700;
                font-size: 1.1em;
            }
            
            .installment-status {
                display: inline-block;
                font-size: 0.85em;
                padding: 4px 8px;
                border-radius: 99px;
                margin-right: 8px;
                vertical-align: middle;
            }
            
            .status-urgent {
                background-color: #fee2e2;
                color: #b91c1c;
            }
            
            .status-upcoming {
                background-color: #f0f9ff;
                color: #0369a1;
            }
            
            .status-paid {
                background-color: #ecfdf5;
                color: #047857;
            }
            
            .status-none {
                background-color: #f1f5f9;
                color: #64748b;
            }
            
            .empty-installments {
                padding: 16px;
                text-align: center;
                color: #64748b;
                background-color: #f8fafc;
                border-radius: 8px;
            }
            
            .view-history-link {
                margin-top: 1rem;
                text-align: left;
            }
            
            .view-history-link a {
                color: #3b82f6;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                font-size: 0.9em;
            }
            
            .view-history-link a:hover {
                text-decoration: underline;
            }
            
            /* أنماط جدول الأقساط */
            #installments-table tr.status-overdue {
                background-color: #fee2e2;
            }
            
            #installments-table tr.status-today {
                background-color: #ffedd5;
            }
            
            .badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 99px;
                font-size: 0.85em;
                font-weight: 500;
            }
            
            .badge.status-overdue {
                background-color: #fee2e2;
                color: #b91c1c;
            }
            
            .badge.status-today {
                background-color: #ffedd5;
                color: #c2410c;
            }
            
            .badge.status-upcoming {
                background-color: #f0f9ff;
                color: #0369a1;
            }
            
            /* أنماط نافذة التأكيد */
            .confirmation-details {
                margin-top: 1rem;
            }
            
            .investor-name {
                margin-bottom: 1rem;
                font-size: 1.1em;
            }
            
            .installments-list {
                margin-bottom: 1rem;
            }
            
            .installments-list h4 {
                margin-bottom: 0.5rem;
                font-size: 1em;
                font-weight: 600;
                color: #475569;
            }
            
            .installments-list ul {
                list-style: none;
                padding: 0;
                margin: 0;
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .installments-list li {
                display: flex;
                justify-content: space-between;
                padding: 8px 12px;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .installments-list li:last-child {
                border-bottom: none;
            }
            
            .installment-desc {
                font-weight: 500;
            }
            
            .installment-amount {
                font-weight: 600;
                color: #b91c1c;
            }
            
            .profit-details {
                background-color: #fff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                overflow: hidden;
                margin-top: 1rem;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 16px;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .detail-row:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                font-weight: 500;
            }
            
            .detail-value {
                font-weight: 600;
            }
            
            .detail-row.final {
                background-color: #ecfdf5;
                font-weight: 600;
                font-size: 1.1em;
            }
            
            .detail-row.final.zero {
                background-color: #ffedd5;
            }
            
            /* أنماط نافذة سجل الأقساط */
            .investor-profile {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 1.5rem;
            }
            
            .investor-avatar.large {
                width: 50px;
                height: 50px;
                font-size: 24px;
            }
            
            .investor-fullname {
                margin: 0;
                font-size: 1.5em;
                font-weight: 600;
            }
        `;
        
        // إضافة عنصر النمط إلى رأس الصفحة
        document.head.appendChild(styleElement);
        console.log('تم إضافة أنماط CSS لنظام الأقساط');
    }
    
    /**
     * فتح نافذة منبثقة
     * @param {string} modalId - معرف النافذة
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.add('active');
    }
    
    /**
     * إغلاق نافذة منبثقة
     * @param {string} modalId - معرف النافذة
     */
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('active');
    }
    
    /**
     * تنسيق المبلغ المالي
     * @param {number} amount - المبلغ
     * @param {boolean} addCurrency - إضافة رمز العملة
     * @returns {string} - المبلغ المنسق
     */
    function formatCurrency(amount, addCurrency = true) {
        // استخدام دالة النظام لتنسيق المبلغ إذا كانت موجودة
        if (typeof window.formatCurrency === 'function') {
            return window.formatCurrency(amount, addCurrency);
        }
        
        // تنسيق بديل إذا لم تكن الدالة موجودة
        if (isNaN(amount)) amount = 0;
        
        const formattedAmount = amount.toLocaleString('ar-IQ');
        
        if (addCurrency) {
            const currency = window.settings?.currency || 'دينار';
            return `${formattedAmount} ${currency}`;
        }
        
        return formattedAmount;
    }
    
    /**
     * تنسيق التاريخ
     * @param {string} dateString - سلسلة التاريخ
     * @returns {string} - التاريخ المنسق
     */
    function formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            
            // التحقق من صحة التاريخ
            if (isNaN(date.getTime())) return dateString;
            
            // تنسيق التاريخ بالصيغة العربية
            return date.toLocaleDateString('ar-IQ', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }
    
    /**
     * إضافة عملية جديدة
     * يعيد استخدام الدالة الموجودة في التطبيق إذا كانت متاحة
     */
    function addTransaction(type, investorId, amount, notes = '') {
        if (typeof window.addTransaction === 'function') {
            return window.addTransaction(type, investorId, amount, notes);
        }
        
        console.error('دالة addTransaction غير موجودة في النظام');
        return null;
    }
    
    /**
     * عرض إشعار للمستخدم
     * يعيد استخدام الدالة الموجودة في التطبيق إذا كانت متاحة
     */
    function showNotification(message, type = 'success') {
        if (typeof window.showNotification === 'function') {
            return window.showNotification(message, type);
        }
        
        // إظهار رسالة في لوحة التحكم كبديل
        console.log(`إشعار (${type}): ${message}`);
    }
    
    // كشف الواجهة العامة للوحدة
    return {
        initialize,
        addInstallment: showAddInstallmentModal,
        payInstallment,
        showInstallmentsPage,
        getDueInstallments
    };
})();

// تهيئة نظام الأقساط عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير التهيئة قليلاً لضمان تحميل النظام الأساسي أولاً
    setTimeout(() => {
        InstallmentSystem.initialize();
        console.log('تم تهيئة نظام الأقساط واستقطاعها من الأرباح');
    }, 1000);
});

/**
 * إصلاح مشكلة عدم ظهور زر إدارة الأقساط في الواجهة الرئيسية
 * يجب إضافة هذا الملف في ملف HTML كآخر ملف JavaScript يتم تحميله
 */

// تنفيذ الإصلاح عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // التأكد من تحميل كافة العناصر
  setTimeout(() => {
    console.log("بدء تنفيذ إصلاح نظام الأقساط...");
    
    // إضافة زر الأقساط للقائمة الرئيسية
    fixInstallmentsButton();
    
    // تهيئة نظام الأقساط
    fixInstallmentsSystem();
    
    console.log("اكتمل تنفيذ إصلاح نظام الأقساط");
  }, 1000);
});

// دالة للإصلاح الفوري لإضافة زر الأقساط
function fixInstallmentsButton() {
  console.log("بدء إصلاح زر إدارة الأقساط...");
  
  // التحقق من وجود القائمة الرئيسية
  const navList = document.querySelector('.nav-list');
  if (!navList) {
    console.error("لم يتم العثور على قائمة التنقل!");
    return false;
  }
  
  // التحقق من عدم وجود زر الأقساط مسبقاً
  if (document.querySelector('.nav-link[data-page="installments"]')) {
    console.log("زر الأقساط موجود بالفعل");
    return true;
  }
  
  // البحث عن عنصر الإعدادات لإضافة زر الأقساط قبله
  const settingsItem = document.querySelector('.nav-link[data-page="settings"]');
  const settingsLi = settingsItem ? settingsItem.closest('.nav-item') : null;
  
  // إنشاء عنصر زر الأقساط
  const installmentsItem = document.createElement('li');
  installmentsItem.className = 'nav-item';
  installmentsItem.innerHTML = `
    <a class="nav-link" data-page="installments" href="#">
      <div class="nav-icon">
        <i class="fas fa-receipt"></i>
      </div>
      <span>الأقساط</span>
    </a>
  `;
  
  // إضافة زر الأقساط للقائمة
  if (settingsLi) {
    navList.insertBefore(installmentsItem, settingsLi);
  } else {
    navList.appendChild(installmentsItem);
  }
  
  // إضافة مستمع حدث للتنقل للزر
  installmentsItem.querySelector('.nav-link').addEventListener('click', function(e) {
    e.preventDefault();
    
    // إظهار صفحة الأقساط إذا كانت موجودة
    const installmentsPage = document.getElementById('installments-page');
    
    if (!installmentsPage) {
      // تهيئة صفحة الأقساط إذا لم تكن موجودة
      initInstallmentsPage();
      
      // محاولة استدعاء نظام الأقساط
      if (window.InstallmentSystem && typeof window.InstallmentSystem.showInstallmentsPage === 'function') {
        window.InstallmentSystem.showInstallmentsPage();
      } else {
        showNotification('جاري تحميل نظام الأقساط...', 'info');
        
        // محاولة تهيئة نظام الأقساط
        fixInstallmentsSystem();
      }
    } else {
      // تفعيل الصفحة وتحديثها
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
      });
      
      installmentsPage.classList.add('active');
      
      // تحديث القائمة الجانبية
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      
      this.classList.add('active');
      
      // تحديث بيانات الصفحة
      if (window.InstallmentSystem && typeof window.InstallmentSystem.showInstallmentsPage === 'function') {
        window.InstallmentSystem.showInstallmentsPage();
      }
    }
  });
  
  console.log("تم إضافة زر الأقساط بنجاح!");
  return true;
}

// دالة لتهيئة صفحة الأقساط بشكل مستقل
function initInstallmentsPage() {
  // التحقق من عدم وجود الصفحة مسبقاً
  if (document.getElementById('installments-page')) {
    return;
  }
  
  // إنشاء عنصر الصفحة
  const pageElement = document.createElement('div');
  pageElement.className = 'page';
  pageElement.id = 'installments-page';
  
  // إنشاء محتوى الصفحة
  pageElement.innerHTML = `
    <div class="header">
      <button class="toggle-sidebar">
        <i class="fas fa-bars"></i>
      </button>
      <h1 class="page-title">إدارة الأقساط</h1>
      <div class="header-actions">
        <div class="search-box">
          <input class="search-input" placeholder="بحث عن مستثمر..." type="text" />
          <i class="fas fa-search search-icon"></i>
        </div>
        <button class="btn btn-primary" id="add-global-installment-btn">
          <i class="fas fa-plus"></i>
          <span>إضافة قسط جديد</span>
        </button>
      </div>
    </div>
    
    <div class="installments-dashboard">
      <div class="dashboard-cards">
        <div class="card">
          <div class="card-pattern">
            <i class="fas fa-money-check-alt"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">إجمالي الأقساط المستحقة</div>
              <div class="card-value" id="total-due-installments">0 دينار</div>
              <div class="card-change">
                <span id="total-due-count">0 قسط</span>
              </div>
            </div>
            <div class="card-icon danger">
              <i class="fas fa-exclamation-circle"></i>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-pattern">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">الأقساط القادمة</div>
              <div class="card-value" id="total-upcoming-installments">0 دينار</div>
              <div class="card-change">
                <span id="total-upcoming-count">0 قسط</span>
              </div>
            </div>
            <div class="card-icon warning">
              <i class="fas fa-calendar-plus"></i>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-pattern">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">الأقساط المدفوعة</div>
              <div class="card-value" id="total-paid-installments">0 دينار</div>
              <div class="card-change">
                <span id="total-paid-count">0 قسط</span>
              </div>
            </div>
            <div class="card-icon success">
              <i class="fas fa-check-double"></i>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-pattern">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="card-header">
            <div>
              <div class="card-title">نسبة التحصيل</div>
              <div class="card-value" id="collection-rate">0%</div>
              <div class="card-change">
                <i id="collection-trend" class="fas fa-arrow-up"></i>
                <span id="collection-change">0% من الشهر السابق</span>
              </div>
            </div>
            <div class="card-icon info">
              <i class="fas fa-chart-line"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">الأقساط المستحقة</h2>
        <div class="section-actions">
          <div class="btn-group">
            <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
            <button class="btn btn-outline btn-sm" data-filter="overdue">متأخرة</button>
            <button class="btn btn-outline btn-sm" data-filter="today">اليوم</button>
            <button class="btn btn-outline btn-sm" data-filter="upcoming">قادمة</button>
          </div>
          <button class="btn btn-outline btn-sm" title="تصدير">
            <i class="fas fa-download"></i>
            <span>تصدير</span>
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table id="installments-table">
          <thead>
            <tr>
              <th>المستثمر</th>
              <th>وصف القسط</th>
              <th>تاريخ الاستحقاق</th>
              <th>المبلغ الإجمالي</th>
              <th>المبلغ المتبقي</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="7" class="text-center">جاري تحميل بيانات الأقساط...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  // إضافة الصفحة للمحتوى الرئيسي
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.appendChild(pageElement);
    console.log('تم إنشاء صفحة الأقساط بنجاح');
  }
  
  // إضافة أنماط CSS للأقساط
  addInstallmentStyles();
}

// دالة لإصلاح وتهيئة نظام الأقساط
function fixInstallmentsSystem() {
  console.log("بدء إصلاح نظام الأقساط...");
  
  // محاولة تشغيل دالة التهيئة مباشرة إذا كان النظام موجوداً
  if (window.InstallmentSystem && typeof window.InstallmentSystem.initialize === 'function') {
    window.InstallmentSystem.initialize();
    showNotification('تم تهيئة نظام الأقساط بنجاح', 'success');
    return true;
  }
  
  // إضافة كود نظام الأقساط إذا كان مفقوداً (ملخص للوظائف الأساسية)
  fixInvestorsDataStructure();
  createInstallmentModals();
  overrideOriginalFunctions();
  
  console.log("تم إصلاح نظام الأقساط بنجاح!");
  
  // إضافة زر في القائمة الرئيسية إذا لم يكن موجوداً
  fixInstallmentsButton();
  
  // تحديث صفحة الأقساط
  const installmentsPage = document.getElementById('installments-page');
  if (installmentsPage && installmentsPage.classList.contains('active')) {
    renderInstallmentsTable();
    updateInstallmentsDashboard();
  }
  
  showNotification('تم تهيئة نظام الأقساط بنجاح', 'success');
  return true;
}

// إصلاح بنية بيانات المستثمرين للتأكد من وجود حقل الأقساط
function fixInvestorsDataStructure() {
  if (!Array.isArray(window.investors)) {
    console.warn('مصفوفة المستثمرين غير موجودة');
    return;
  }
  
  // إضافة صفيف الأقساط للمستثمرين إذا لم يكن موجوداً
  window.investors.forEach(investor => {
    if (!investor.installments) {
      investor.installments = [];
    }
  });
  
  // حفظ التغييرات
  if (typeof window.saveData === 'function') {
    window.saveData();
  }
  
  console.log('تم إصلاح بنية بيانات المستثمرين');
}

// إنشاء النوافذ المنبثقة للأقساط
function createInstallmentModals() {
  // إضافة نافذة إضافة/تعديل قسط
  if (!document.getElementById('add-installment-modal')) {
    const modalElement = document.createElement('div');
    modalElement.className = 'modal-overlay';
    modalElement.id = 'add-installment-modal';
    
    modalElement.innerHTML = `
      <div class="modal animate__animated animate__fadeInUp">
        <div class="modal-header">
          <h3 class="modal-title" id="installment-modal-title">إضافة قسط جديد</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="installment-form">
            <input type="hidden" id="installment-id" value="">
            <input type="hidden" id="installment-investor-id" value="">
            
            <div class="form-group" id="investor-select-container">
              <label class="form-label">المستثمر</label>
              <select class="form-select" id="installment-investor" required>
                <option value="">اختر المستثمر</option>
                <!-- سيتم ملؤها ديناميكياً -->
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">وصف القسط</label>
              <input type="text" class="form-input" id="installment-description" placeholder="مثال: قسط السيارة، قسط القرض، إلخ" required>
            </div>
            
            <div class="grid-cols-2">
              <div class="form-group">
                <label class="form-label">المبلغ الإجمالي</label>
                <input type="number" class="form-input" id="installment-amount" min="1" step="1000" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">تاريخ الاستحقاق</label>
                <input type="date" class="form-input" id="installment-due-date" required>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">ملاحظات</label>
              <textarea class="form-input" id="installment-notes" rows="3"></textarea>
            </div>
            
            <div class="form-group">
              <div class="form-check">
                <input type="checkbox" id="installment-priority" value="high">
                <label for="installment-priority">قسط ذو أولوية عالية</label>
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
    
    // إضافة النافذة للجسم
    document.body.appendChild(modalElement);
    
    // إضافة مستمع حدث لزر الحفظ
    const saveButton = modalElement.querySelector('#save-installment-btn');
    if (saveButton) {
      saveButton.addEventListener('click', function() {
        saveInstallment();
      });
    }
    
    // إضافة مستمع حدث لزر الإغلاق
    const closeButtons = modalElement.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const modal = this.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('active');
        }
      });
    });
  }
  
  // إضافة نوافذ أخرى حسب الحاجة
}

// استبدال الدوال الأصلية بنسخ محسنة
function overrideOriginalFunctions() {
  // تعريف نظام الأقساط إذا لم يكن موجوداً
  if (!window.InstallmentSystem) {
    // تعريف مبسط للنظام
    window.InstallmentSystem = {
      initialize: function() {
        fixInvestorsDataStructure();
        createInstallmentModals();
        addInstallmentStyles();
        return true;
      },
      showInstallmentsPage: function() {
        // إظهار صفحة الأقساط وتحديثها
        const installmentsPage = document.getElementById('installments-page');
        if (installmentsPage) {
          // إخفاء جميع الصفحات
          document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
          });
          
          // إظهار صفحة الأقساط
          installmentsPage.classList.add('active');
          
          // تحديث لوحة التحكم
          updateInstallmentsDashboard();
          
          // عرض جدول الأقساط
          renderInstallmentsTable();
          
          // تحديث القائمة الجانبية
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
          });
          
          const installmentsNavLink = document.querySelector('.nav-link[data-page="installments"]');
          if (installmentsNavLink) {
            installmentsNavLink.classList.add('active');
          }
        } else {
          // إنشاء صفحة الأقساط إذا لم تكن موجودة
          initInstallmentsPage();
          setTimeout(() => this.showInstallmentsPage(), 100);
        }
      },
      getDueInstallments: function(investor) {
        if (!investor || !investor.installments) return [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return investor.installments.filter(installment => {
          // تجاهل الأقساط المدفوعة
          if (installment.status === 'paid') return false;
          
          // تحويل تاريخ الاستحقاق إلى كائن Date
          const dueDate = new Date(installment.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          // القسط مستحق إذا كان تاريخ استحقاقه اليوم أو قبل اليوم
          return dueDate <= today;
        });
      }
    };
  }
}

// تنفيذ الوظائف الأساسية لنظام الأقساط
function renderInstallmentsTable(filter = 'all') {
  const tableBody = document.querySelector('#installments-table tbody');
  if (!tableBody) return;
  
  // تجميع جميع الأقساط النشطة من جميع المستثمرين
  let allInstallments = [];
  
  if (Array.isArray(window.investors)) {
    window.investors.forEach(investor => {
      if (!investor.installments) return;
      
      const investorInstallments = investor.installments
        .filter(installment => installment.status !== 'paid')
        .map(installment => ({
          ...installment,
          investorId: investor.id,
          investorName: investor.name
        }));
          
      allInstallments = allInstallments.concat(investorInstallments);
    });
  }
  
  // تصفية الأقساط حسب الفلتر المحدد
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const filteredInstallments = allInstallments.filter(installment => {
    const dueDate = new Date(installment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'overdue':
        return dueDate < today;
      case 'today':
        return dueDate.getTime() === today.getTime();
      case 'upcoming':
        return dueDate > today;
      default:
        return true;
    }
  });
  
  // ترتيب الأقساط حسب تاريخ الاستحقاق
  filteredInstallments.sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA - dateB;
  });
  
  // تفريغ الجدول
  tableBody.innerHTML = '';
  
  // إذا لم توجد أقساط، نعرض رسالة
  if (filteredInstallments.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">لا توجد أقساط ${getFilterText(filter)}</td>
      </tr>
    `;
    return;
  }
  
  // إضافة الأقساط إلى الجدول
  filteredInstallments.forEach(installment => {
    // تحديد حالة القسط
    const dueDate = new Date(installment.dueDate);
    const daysRemaining = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
    
    let statusClass = '';
    let statusText = '';
    
    if (daysRemaining < 0) {
      statusClass = 'status-overdue';
      statusText = `متأخر (${Math.abs(daysRemaining)} يوم)`;
    } else if (daysRemaining === 0) {
      statusClass = 'status-today';
      statusText = 'مستحق اليوم';
    } else {
      statusClass = 'status-upcoming';
      statusText = `بعد ${daysRemaining} يوم`;
    }
    
    const row = document.createElement('tr');
    row.className = statusClass;
    
    row.innerHTML = `
      <td>
        <div class="investor-info">
          <div class="investor-avatar">${installment.investorName.charAt(0)}</div>
          <div>
            <div class="investor-name">${installment.investorName}</div>
            <div class="investor-id">${installment.investorId}</div>
          </div>
        </div>
      </td>
      <td>${installment.description}</td>
      <td>${formatDate(installment.dueDate)}</td>
      <td>${formatCurrency(installment.amount)}</td>
      <td>${formatCurrency(installment.remainingAmount)}</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td>
        <div class="actions">
          <button class="btn btn-sm btn-success pay-installment-btn" data-investor-id="${installment.investorId}" data-installment-id="${installment.id}">
            <i class="fas fa-coins"></i>
            <span>تسديد</span>
          </button>
          <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${installment.investorId}" data-installment-id="${installment.id}">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // إضافة مستمعي الأحداث للأزرار
  setupInstallmentTableButtonsListeners();
}

// إضافة أنماط CSS لنظام الأقساط
function addInstallmentStyles() {
  // التحقق من وجود أنماط مسبقة
  if (document.getElementById('installment-styles')) {
    return;
  }
  
  // إنشاء عنصر نمط جديد
  const styleElement = document.createElement('style');
  styleElement.id = 'installment-styles';
  
  // إضافة أنماط CSS
  styleElement.textContent = `
    /* أنماط قسم الأقساط */
    .installments-section {
      margin-top: 1.5rem;
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .installments-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.75rem;
    }
    
    .installments-table th,
    .installments-table td {
      padding: 8px 12px;
      text-align: right;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .installments-table thead th {
      background-color: #f1f5f9;
      font-weight: 600;
      color: #475569;
    }
    
    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .alert-warning {
      background-color: #fff7ed;
      border-left: 4px solid #f59e0b;
      color: #92400e;
    }
    
    .alert-info {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      color: #1e40af;
    }
    
    /* أنماط جدول الأقساط */
    #installments-table tr.status-overdue {
      background-color: #fee2e2;
    }
    
    #installments-table tr.status-today {
      background-color: #ffedd5;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 99px;
      font-size: 0.85em;
      font-weight: 500;
    }
    
    .badge.status-overdue {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    
    .badge.status-today {
      background-color: #ffedd5;
      color: #c2410c;
    }
    
    .badge.status-upcoming {
      background-color: #f0f9ff;
      color: #0369a1;
    }
  `;
  
  // إضافة عنصر النمط إلى رأس الصفحة
  document.head.appendChild(styleElement);
  console.log('تم إضافة أنماط CSS لنظام الأقساط');
}

// وظائف مساعدة مختلفة

// تحديث لوحة معلومات الأقساط
function updateInstallmentsDashboard() {
  // إجمالي الأقساط المستحقة
  let totalDueAmount = 0;
  let totalDueCount = 0;
  
  // إجمالي الأقساط القادمة
  let totalUpcomingAmount = 0;
  let totalUpcomingCount = 0;
  
  // إجمالي الأقساط المدفوعة
  let totalPaidAmount = 0;
  let totalPaidCount = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // حساب الإحصائيات
  if (Array.isArray(window.investors)) {
    window.investors.forEach(investor => {
      if (!investor.installments) return;
      
      investor.installments.forEach(installment => {
        const dueDate = new Date(installment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (installment.status === 'paid') {
          // أقساط مدفوعة
          totalPaidAmount += installment.amount;
          totalPaidCount++;
        } else if (dueDate <= today) {
          // أقساط مستحقة
          totalDueAmount += installment.remainingAmount;
          totalDueCount++;
        } else {
          // أقساط قادمة
          totalUpcomingAmount += installment.remainingAmount;
          totalUpcomingCount++;
        }
      });
    });
  }
  
  // حساب نسبة التحصيل
  const totalInstallments = totalPaidAmount + totalDueAmount + totalUpcomingAmount;
  const collectionRate = totalInstallments > 0 ? (totalPaidAmount / totalInstallments) * 100 : 0;
  
  // تحديث الإحصائيات في لوحة التحكم
  const totalDueEl = document.getElementById('total-due-installments');
  if (totalDueEl) totalDueEl.textContent = formatCurrency(totalDueAmount);
  
  const totalDueCountEl = document.getElementById('total-due-count');
  if (totalDueCountEl) totalDueCountEl.textContent = `${totalDueCount} قسط`;
  
  const totalUpcomingEl = document.getElementById('total-upcoming-installments');
  if (totalUpcomingEl) totalUpcomingEl.textContent = formatCurrency(totalUpcomingAmount);
  
  const totalUpcomingCountEl = document.getElementById('total-upcoming-count');
  if (totalUpcomingCountEl) totalUpcomingCountEl.textContent = `${totalUpcomingCount} قسط`;
  
  const totalPaidEl = document.getElementById('total-paid-installments');
  if (totalPaidEl) totalPaidEl.textContent = formatCurrency(totalPaidAmount);
  
  const totalPaidCountEl = document.getElementById('total-paid-count');
  if (totalPaidCountEl) totalPaidCountEl.textContent = `${totalPaidCount} قسط`;
  
  const collectionRateEl = document.getElementById('collection-rate');
  if (collectionRateEl) collectionRateEl.textContent = `${collectionRate.toFixed(1)}%`;
  
  // تحديث اتجاه نسبة التحصيل
  const collectionTrend = document.getElementById('collection-trend');
  if (collectionTrend) {
    if (collectionRate >= 70) {
      collectionTrend.className = 'fas fa-arrow-up';
      collectionTrend.style.color = '#10b981';
    } else if (collectionRate >= 40) {
      collectionTrend.className = 'fas fa-arrow-right';
      collectionTrend.style.color = '#f59e0b';
    } else {
      collectionTrend.className = 'fas fa-arrow-down';
      collectionTrend.style.color = '#ef4444';
    }
  }
}

// إضافة مستمعي الأحداث لأزرار جدول الأقساط
function setupInstallmentTableButtonsListeners() {
  // أزرار تسديد الأقساط
  document.querySelectorAll('#installments-table .pay-installment-btn').forEach(button => {
    button.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      const installmentId = this.getAttribute('data-installment-id');
      payInstallment(investorId, installmentId);
    });
  });
  
  // أزرار تعديل الأقساط
  document.querySelectorAll('#installments-table .edit-installment-btn').forEach(button => {
    button.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      const installmentId = this.getAttribute('data-installment-id');
      editInstallment(investorId, installmentId);
    });
  });
  
  // أزرار تصفية الأقساط
  document.querySelectorAll('#installments-page .btn-group .btn[data-filter]').forEach(button => {
    button.addEventListener('click', function() {
      // إزالة الكلاس النشط من جميع الأزرار
      document.querySelectorAll('#installments-page .btn-group .btn[data-filter]').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // إضافة الكلاس النشط للزر المحدد
      this.classList.add('active');
      
      // تصفية الأقساط
      const filter = this.getAttribute('data-filter');
      renderInstallmentsTable(filter);
    });
  });
}

// دالة لتسديد قسط
function payInstallment(investorId, installmentId) {
  // البحث عن المستثمر والقسط
  const investor = window.investors.find(inv => inv.id === investorId);
  if (!investor || !investor.installments) {
    showNotification('لم يتم العثور على بيانات المستثمر أو الأقساط', 'error');
    return;
  }
  
  const installmentIndex = investor.installments.findIndex(inst => inst.id === installmentId);
  if (installmentIndex === -1) {
    showNotification('لم يتم العثور على بيانات القسط', 'error');
    return;
  }
  
  const installment = investor.installments[installmentIndex];
  
  // التحقق من حالة القسط
  if (installment.status === 'paid') {
    showNotification('هذا القسط مدفوع بالفعل', 'warning');
    return;
  }
  
  // طلب تأكيد دفع القسط
  if (confirm(`هل أنت متأكد من رغبتك في تسديد القسط "${installment.description}" بقيمة ${formatCurrency(installment.remainingAmount)}؟`)) {
    // تسجيل عملية دفع القسط
    const paymentTransaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      type: 'دفع قسط',
      investorId,
      investorName: investor.name,
      amount: installment.remainingAmount,
      notes: `دفع قسط: ${installment.description}`
    };
    
    // إضافة العملية إلى سجل العمليات
    if (Array.isArray(window.transactions)) {
      window.transactions.push(paymentTransaction);
    }
    
    // تحديث بيانات القسط
    installment.status = 'paid';
    installment.paidAmount = installment.amount;
    installment.remainingAmount = 0;
    installment.paidDate = new Date().toISOString().split('T')[0];
    installment.paymentMethod = 'manual';
    
    // حفظ البيانات
    if (typeof window.saveData === 'function') {
      window.saveData();
    }
    
    showNotification('تم تسديد القسط بنجاح', 'success');
    
    // تحديث واجهة المستخدم
    if (document.querySelector('#installments-page.active')) {
      renderInstallmentsTable();
      updateInstallmentsDashboard();
    }
  }
}

// دالة لتعديل قسط
function editInstallment(investorId, installmentId) {
  // البحث عن المستثمر والقسط
  const investor = window.investors.find(inv => inv.id === investorId);
  if (!investor || !investor.installments) {
    showNotification('لم يتم العثور على بيانات المستثمر أو الأقساط', 'error');
    return;
  }
  
  const installment = investor.installments.find(inst => inst.id === installmentId);
  if (!installment) {
    showNotification('لم يتم العثور على بيانات القسط', 'error');
    return;
  }
  
  // تعيين العنوان
  const title = document.getElementById('installment-modal-title');
  if (title) {
    title.textContent = 'تعديل القسط';
  }
  
  // ملء النموذج ببيانات القسط
  document.getElementById('installment-id').value = installmentId;
  document.getElementById('installment-investor-id').value = investorId;
  document.getElementById('installment-description').value = installment.description || '';
  document.getElementById('installment-amount').value = installment.amount || 0;
  document.getElementById('installment-due-date').value = installment.dueDate || '';
  document.getElementById('installment-notes').value = installment.notes || '';
  
  const priorityCheckbox = document.getElementById('installment-priority');
  if (priorityCheckbox) {
    priorityCheckbox.checked = installment.priority === 'high';
  }
  
  // إخفاء قائمة اختيار المستثمر
  const investorSelectContainer = document.getElementById('investor-select-container');
  if (investorSelectContainer) {
    investorSelectContainer.style.display = 'none';
  }
  
  // فتح النافذة
  openModal('add-installment-modal');
}

// فتح نافذة منبثقة
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  modal.classList.add('active');
}

// إغلاق نافذة منبثقة
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  modal.classList.remove('active');
}

// تنسيق التاريخ
function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // التحقق من صحة التاريخ
    if (isNaN(date.getTime())) return dateString;
    
    // تنسيق التاريخ بالصيغة العربية
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

// تنسيق المبلغ المالي
function formatCurrency(amount, addCurrency = true) {
  // استخدام دالة النظام لتنسيق المبلغ إذا كانت موجودة
  if (typeof window.formatCurrency === 'function') {
    return window.formatCurrency(amount, addCurrency);
  }
  
  // تنسيق بديل إذا لم تكن الدالة موجودة
  if (isNaN(amount)) amount = 0;
  
  const formattedAmount = amount.toLocaleString('ar-IQ');
  
  if (addCurrency) {
    const currency = window.settings?.currency || 'دينار';
    return `${formattedAmount} ${currency}`;
  }
  
  return formattedAmount;
}

// الحصول على نص الفلتر
function getFilterText(filter) {
  switch (filter) {
    case 'overdue':
      return 'متأخرة';
    case 'today':
      return 'مستحقة اليوم';
    case 'upcoming':
      return 'قادمة';
    default:
      return '';
  }
}

// عرض إشعار للمستخدم
function showNotification(message, type = 'success') {
  // محاولة استخدام دالة النظام الأصلية
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
    return;
  }
  
  // دالة إشعار بديلة إذا لم تكن دالة النظام متاحة
  console.log(`إشعار (${type}): ${message}`);
  
  // إنشاء إشعار مؤقت
  const notification = document.createElement('div');
  notification.className = `notification notification-${type} show`;
  
  notification.innerHTML = `
    <div class="notification-icon ${type}">
      <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'exclamation'}"></i>
    </div>
    <div class="notification-content">
      <div class="notification-title">${type === 'success' ? 'تمت العملية بنجاح' : type === 'error' ? 'خطأ' : 'تنبيه'}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close">&times;</button>
  `;
  
  // إضافة الإشعار للصفحة
  document.body.appendChild(notification);
  
  // إغلاق الإشعار بعد 5 ثوانٍ
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
  
  // إضافة مستمع حدث لزر الإغلاق
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
  }
}

// حفظ بيانات القسط الجديد
function saveInstallment() {
  // الحصول على بيانات النموذج
  const installmentId = document.getElementById('installment-id').value;
  let investorId = document.getElementById('installment-investor-id').value;
  
  // إذا لم يتم تحديد مستثمر مسبقاً، نحصل عليه من القائمة
  if (!investorId) {
    const investorSelect = document.getElementById('installment-investor');
    if (investorSelect) {
      investorId = investorSelect.value;
    }
  }
  
  // التحقق من اختيار مستثمر
  if (!investorId) {
    showNotification('الرجاء اختيار مستثمر', 'error');
    return;
  }
  
  // الحصول على باقي البيانات
  const description = document.getElementById('installment-description').value;
  const amount = parseFloat(document.getElementById('installment-amount').value);
  const dueDate = document.getElementById('installment-due-date').value;
  const notes = document.getElementById('installment-notes').value;
  const priorityCheckbox = document.getElementById('installment-priority');
  const priority = priorityCheckbox && priorityCheckbox.checked ? 'high' : 'normal';
  
  // التحقق من صحة البيانات
  if (!description || isNaN(amount) || amount <= 0 || !dueDate) {
    showNotification('الرجاء ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
    return;
  }
  
  // البحث عن المستثمر
  const investor = window.investors.find(inv => inv.id === investorId);
  if (!investor) {
    showNotification('لم يتم العثور على بيانات المستثمر', 'error');
    return;
  }
  
  // التأكد من وجود مصفوفة الأقساط
  if (!investor.installments) {
    investor.installments = [];
  }
  
  // تحديد ما إذا كنا نضيف قسطاً جديداً أو نعدل قسطاً موجوداً
  if (installmentId) {
    // تعديل قسط موجود
    const existingIndex = investor.installments.findIndex(inst => inst.id === installmentId);
    if (existingIndex === -1) {
      showNotification('لم يتم العثور على بيانات القسط', 'error');
      return;
    }
    
    // الحفاظ على المبلغ المدفوع من القسط الأصلي
    const paidAmount = investor.installments[existingIndex].paidAmount || 0;
    const remainingAmount = Math.max(0, amount - paidAmount);
    
    // تحديث بيانات القسط
    investor.installments[existingIndex] = {
      ...investor.installments[existingIndex],
      description,
      amount,
      dueDate,
      notes,
      priority,
      remainingAmount,
      updatedAt: new Date().toISOString()
    };
    
    // تحديث حالة القسط بناءً على المبلغ المتبقي
    if (remainingAmount <= 0) {
      investor.installments[existingIndex].status = 'paid';
    } else {
      investor.installments[existingIndex].status = 'active';
    }
    
    showNotification('تم تحديث بيانات القسط بنجاح', 'success');
  } else {
    // إضافة قسط جديد
    const newInstallment = {
      id: Date.now().toString(),
      description,
      amount,
      dueDate,
      notes,
      priority,
      status: 'active',
      paidAmount: 0,
      remainingAmount: amount,
      createdAt: new Date().toISOString()
    };
    
    investor.installments.push(newInstallment);
    showNotification('تم إضافة القسط الجديد بنجاح', 'success');
  }
  
  // حفظ البيانات
  if (typeof window.saveData === 'function') {
    window.saveData();
  }
  
  // إغلاق النافذة
  closeModal('add-installment-modal');
  
  // تحديث واجهة المستخدم
  if (document.querySelector('#installments-page.active')) {
    renderInstallmentsTable();
    updateInstallmentsDashboard();
  }
}