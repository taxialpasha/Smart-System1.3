/**
 * إصلاح مشاكل نظام الأقساط
 * هذا الملف يصلح المشاكل الرئيسية في نظام الأقساط:
 * 1. مشكلة ظهور أيقونتين للأقساط في الشريط الجانبي
 * 2. مشكلة اختفاء الأقساط عند تبديل الصفحات
 * 3. مشكلة عدم ظهور الأقساط المضافة حديثًا
 */

(function() {
    console.log('جاري تطبيق إصلاحات نظام الأقساط...');
    
    // متغير للتحقق من تهيئة النظام مسبقًا
    let isInstallmentSystemInitialized = false;
    
    // مراقبة DOM للتأكد من تحميل العناصر
    const observer = new MutationObserver(function(mutations) {
        // التحقق من وجود القائمة الجانبية
        const sidebar = document.querySelector('.sidebar .nav-list');
        if (sidebar) {
            // التحقق من عدم تهيئة النظام مسبقًا
            if (!isInstallmentSystemInitialized) {
                // إزالة أي أزرار أقساط موجودة (لحل مشكلة تكرار الأيقونة)
                const existingInstallmentButtons = document.querySelectorAll('.nav-link[data-page="installments"]');
                existingInstallmentButtons.forEach(button => button.parentElement.remove());
                
                // إصلاح مشكلة تخزين الأقساط
                fixInstallmentsStorage();
                
                // تعديل دالة showPage لمنع اختفاء صفحة الأقساط
                fixPageNavigation();
                
                // تصحيح مشكلة إضافة الأقساط الجديدة
                fixAddNewInstallment();
                
                // إعادة تهيئة نظام الأقساط بشكل صحيح
                initializeInstallmentSystem();
                
                // تعيين العلم لمنع إعادة التهيئة
                isInstallmentSystemInitialized = true;
                
                // إيقاف المراقبة بعد التهيئة
                observer.disconnect();
                
                console.log('تم تطبيق إصلاحات نظام الأقساط بنجاح!');
            }
        }
    });
    
    // بدء مراقبة التغييرات في DOM
    observer.observe(document.body, { childList: true, subtree: true });
    
    /**
     * إصلاح مشكلة تخزين الأقساط
     */
    function fixInstallmentsStorage() {
        // التأكد من وجود مصفوفة الأقساط في التخزين المحلي
        const savedInstallments = localStorage.getItem('installments');
        
        try {
            // تحميل الأقساط من التخزين المحلي
            window.installments = savedInstallments ? JSON.parse(savedInstallments) : [];
            
            // تعديل دالة حفظ الأقساط
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
            
            // تعديل دالة تحميل الأقساط
            window.loadInstallmentData = function() {
                try {
                    const savedInstallments = localStorage.getItem('installments');
                    if (savedInstallments) {
                        window.installments = JSON.parse(savedInstallments);
                        console.log(`تم تحميل ${window.installments.length} من سجلات الأقساط`);
                    } else {
                        window.installments = [];
                    }
                } catch (error) {
                    console.error('خطأ في تحميل بيانات الأقساط:', error);
                    window.installments = [];
                }
            };
            
            console.log('تم إصلاح مشكلة تخزين الأقساط');
        } catch (error) {
            console.error('خطأ في إصلاح تخزين الأقساط:', error);
            window.installments = [];
        }
    }
    
    /**
     * إصلاح مشكلة التنقل بين الصفحات
     */
    function fixPageNavigation() {
        // حفظ الدالة الأصلية
        const originalShowPage = window.showPage;
        
        // استبدال الدالة بنسخة معدلة
        window.showPage = function(pageId) {
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
                } else if (pageId === 'installments') {
                    // تحديث عرض الأقساط
                    if (window.renderInstallmentsTable) {
                        window.renderInstallmentsTable();
                    }
                    // تحديث إحصائيات الأقساط
                    if (window.updateInstallmentStatistics) {
                        window.updateInstallmentStatistics();
                    }
                }
            } else if (pageId === 'installments') {
                // إنشاء صفحة الأقساط إذا لم تكن موجودة
                createInstallmentPage();
                setTimeout(() => {
                    const newPage = document.getElementById('installments-page');
                    if (newPage) {
                        newPage.classList.add('active');
                        if (window.renderInstallmentsTable) {
                            window.renderInstallmentsTable();
                        }
                    }
                }, 100);
            }
        };
        
        console.log('تم إصلاح مشكلة التنقل بين الصفحات');
    }
    
    /**
     * إصلاح مشكلة إضافة الأقساط الجديدة
     */
    function fixAddNewInstallment() {
        // حفظ النسخة الأصلية من الدالة
        const originalAddNewInstallment = window.addNewInstallment;
        
        // استبدال الدالة بنسخة معدلة
        window.addNewInstallment = function() {
            console.log('إضافة قسط جديد (النسخة المصححة)...');
            
            try {
                // الحصول على قيم النموذج
                const investorId = document.getElementById('installment-investor').value;
                const title = document.getElementById('installment-title').value;
                const originalAmount = parseFloat(document.getElementById('original-amount').value) || 0;
                const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
                const monthsCount = parseInt(document.getElementById('months-count').value) || 1;
                const startDate = document.getElementById('start-date').value;
                const notes = document.getElementById('installment-notes').value || '';
                
                // التحقق من صحة القيم
                if (!investorId || !title || originalAmount <= 0 || monthsCount <= 0 || !startDate) {
                    if (window.showNotification) {
                        window.showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
                    }
                    return;
                }
                
                // العثور على المستثمر
                const investor = window.investors.find(inv => inv.id === investorId);
                if (!investor) {
                    if (window.showNotification) {
                        window.showNotification('لم يتم العثور على المستثمر', 'error');
                    }
                    return;
                }
                
                // حساب قيمة الفائدة
                const interestValue = (originalAmount * interestRate) / 100;
                
                // حساب إجمالي المبلغ
                const totalAmount = originalAmount + interestValue;
                
                // حساب القسط الشهري
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
                
                // إنشاء كائن القسط الجديد
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
                
                // التأكد من وجود مصفوفة الأقساط
                if (!window.installments) {
                    window.installments = [];
                }
                
                // إضافة القسط الجديد
                window.installments.push(newInstallment);
                
                // حفظ البيانات
                if (window.saveInstallmentData()) {
                    // إضافة علامة للمستثمر أن عليه أقساط
                    if (window.addInstallmentBadgeToInvestor) {
                        window.addInstallmentBadgeToInvestor(investorId);
                    }
                    
                    // تحديث عرض الأقساط
                    if (window.renderInstallmentsTable) {
                        window.renderInstallmentsTable();
                    }
                    
                    // تحديث إحصائيات الأقساط
                    if (window.updateInstallmentStatistics) {
                        window.updateInstallmentStatistics();
                    }
                    
                    // إغلاق النافذة المنبثقة
                    if (window.closeModal) {
                        window.closeModal('add-installment-modal');
                    }
                    
                    // عرض إشعار النجاح
                    if (window.showNotification) {
                        window.showNotification(`تم إضافة قسط ${title} للمستثمر ${investor.name} بنجاح!`, 'success');
                    }
                    
                    console.log('تم إضافة القسط الجديد بنجاح:', newInstallment);
                }
            } catch (error) {
                console.error('خطأ في إضافة قسط جديد:', error);
                if (window.showNotification) {
                    window.showNotification('حدث خطأ أثناء إضافة القسط الجديد', 'error');
                }
            }
        };
        
        console.log('تم إصلاح مشكلة إضافة الأقساط الجديدة');
    }
    
    /**
     * إعادة تهيئة نظام الأقساط
     */
    function initializeInstallmentSystem() {
        console.log('إعادة تهيئة نظام الأقساط...');
        
        // إضافة زر الأقساط للقائمة الجانبية
        const sidebar = document.querySelector('.sidebar .nav-list');
        if (sidebar) {
            // إنشاء عنصر القائمة
            const menuItem = document.createElement('li');
            menuItem.className = 'nav-item';
            menuItem.innerHTML = `
                <a class="nav-link" data-page="installments" href="#">
                    <div class="nav-icon">
                        <i class="fas fa-money-check-alt"></i>
                    </div>
                    <span>الأقساط</span>
                </a>
            `;
            
            // إضافة العنصر إلى القائمة
            // نضيفه قبل الإعدادات (قبل العنصر الأخير)
            const lastItem = sidebar.querySelector('.nav-item:nth-last-child(2)');
            if (lastItem) {
                sidebar.insertBefore(menuItem, lastItem);
            } else {
                sidebar.appendChild(menuItem);
            }
            
            // إضافة مستمع الحدث
            const link = menuItem.querySelector('.nav-link');
            if (link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // إزالة الكلاس النشط من جميع الروابط
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    
                    // إضافة الكلاس النشط للرابط المحدد
                    this.classList.add('active');
                    
                    // إظهار صفحة الأقساط
                    window.showPage('installments');
                });
            }
        }
        
        // تحميل بيانات الأقساط
        window.loadInstallmentData();
        
        // التأكد من أن صفحة الأقساط موجودة
        if (!document.getElementById('installments-page')) {
            createInstallmentPage();
        }
    }

    /**
     * إنشاء صفحة الأقساط
     */
    function createInstallmentPage() {
        // التحقق من وجود الصفحة
        if (document.getElementById('installments-page')) {
            console.log('صفحة الأقساط موجودة بالفعل');
            return;
        }
        
        console.log('إنشاء صفحة الأقساط...');
        
        // إنشاء صفحة الأقساط
        const installmentsPage = document.createElement('div');
        installmentsPage.className = 'page';
        installmentsPage.id = 'installments-page';
        
        installmentsPage.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">الأقساط</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" placeholder="بحث عن أقساط..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-primary" id="add-installment-btn">
                            <i class="fas fa-plus"></i>
                            <span>إضافة قسط جديد</span>
                        </button>
                        <button class="btn btn-success" id="pay-installment-btn">
                            <i class="fas fa-hand-holding-usd"></i>
                            <span>تسديد قسط</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">الأقساط المستحقة</h2>
                    <div class="section-actions">
                        <div class="btn-group">
                            <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
                            <button class="btn btn-outline btn-sm" data-filter="due">مستحقة</button>
                            <button class="btn btn-outline btn-sm" data-filter="paid">مسددة</button>
                            <button class="btn btn-outline btn-sm" data-filter="overdue">متأخرة</button>
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
                                <th>المعرف</th>
                                <th>المستثمر</th>
                                <th>عنوان الأقساط</th>
                                <th>المبلغ الكلي</th>
                                <th>القسط الشهري</th>
                                <th>الأقساط المتبقية</th>
                                <th>تاريخ القسط القادم</th>
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
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">إحصائيات الأقساط</h2>
                </div>
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-money-check-alt"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">إجمالي الأقساط</div>
                                <div class="card-value" id="total-installments">0 دينار</div>
                            </div>
                            <div class="card-icon primary">
                                <i class="fas fa-money-check-alt"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">الأقساط المسددة</div>
                                <div class="card-value" id="paid-installments">0 دينار</div>
                            </div>
                            <div class="card-icon success">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">الأقساط المستحقة</div>
                                <div class="card-value" id="due-installments">0 دينار</div>
                            </div>
                            <div class="card-icon warning">
                                <i class="fas fa-money-bill-wave"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">الأقساط المتأخرة</div>
                                <div class="card-value" id="overdue-installments">0 دينار</div>
                            </div>
                            <div class="card-icon danger">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى المحتوى الرئيسي
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(installmentsPage);
            
            // إضافة مستمع الحدث لزر إضافة قسط جديد
            const addInstallmentBtn = document.getElementById('add-installment-btn');
            if (addInstallmentBtn) {
                addInstallmentBtn.addEventListener('click', () => {
                    if (window.openModal) {
                        window.openModal('add-installment-modal');
                    }
                });
            }
            
            // إضافة مستمع الحدث لزر تسديد قسط
            const payInstallmentBtn = document.getElementById('pay-installment-btn');
            if (payInstallmentBtn) {
                payInstallmentBtn.addEventListener('click', () => {
                    if (window.openModal) {
                        window.openModal('pay-installment-modal');
                    }
                });
            }
            
            // إضافة مستمع الحدث للبحث
            const searchInput = installmentsPage.querySelector('.search-input');
            if (searchInput && window.searchInstallments) {
                searchInput.addEventListener('input', function() {
                    window.searchInstallments(this.value);
                });
            }
            
            // إضافة مستمعي أحداث للتصفية
            const filterButtons = installmentsPage.querySelectorAll('.btn-group .btn-outline[data-filter]');
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // تحديث الزر النشط
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // تصفية الأقساط
                    if (window.filterInstallments) {
                        window.filterInstallments(this.getAttribute('data-filter'));
                    }
                });
            });
            
            // إضافة مستمع الحدث لزر التصدير
            const exportButton = installmentsPage.querySelector('.btn[title="تصدير"]');
            if (exportButton && window.InstallmentSystem && window.InstallmentSystem.exportInstallmentData) {
                exportButton.addEventListener('click', () => {
                    window.InstallmentSystem.exportInstallmentData('installments');
                });
            }
            
            console.log('تم إنشاء صفحة الأقساط بنجاح');
        } else {
            console.error('لم يتم العثور على المحتوى الرئيسي');
        }
    }
})();