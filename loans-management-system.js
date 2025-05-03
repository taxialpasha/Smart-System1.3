/**
 * نظام إدارة السلف والقروض
 * يعمل بالتكامل مع نظام الاستثمار المتكامل
 */

// مساحة اسم خاصة بنظام القروض
const LoanSystem = {
    data: {
        loans: [],
        installments: [],
        settings: {
            defaultInterestRate: 5,
            defaultLoanTerm: 12,
            maxLoanAmount: 50000000,
            currency: 'دينار',
            requireGuarantors: 2,
            enableInstallmentNotifications: true,
            categories: {
                employee: 'موظف',
                hashd: 'حشد شعبي',
                police: 'شرطة',
                private: 'كاسب',
                company: 'موظف الشركة',
                social: 'الرعاية الاجتماعية'
            }
        }
    },
    
    // تهيئة النظام
    init: function() {
        // إضافة عناصر القائمة الجانبية
        this.addSidebarButton();
        
        // إنشاء صفحة القروض
        this.createLoanPage();
        
        // تحميل البيانات
        this.loadData();
        
        // ربط الأحداث
        this.bindEvents();
        
        console.log('تم تهيئة نظام القروض بنجاح');
    },
    
    // إضافة زر في الشريط الجانبي
    addSidebarButton: function() {
        const navList = document.querySelector('.nav-list');
        if (!navList) return;
        
        // إضافة زر القروض
        const loansItem = document.createElement('li');
        loansItem.className = 'nav-item';
        loansItem.innerHTML = `
            <a class="nav-link" data-page="loans" href="#">
                <div class="nav-icon">
                    <i class="fas fa-coins"></i>
                </div>
                <span>السلف والقروض</span>
            </a>
        `;
        
        // البحث عن موقع الإضافة (بعد الصادرات والواردات)
        const reportsItem = document.querySelector('.nav-link[data-page="reports"]');
        const reportsLi = reportsItem ? reportsItem.closest('.nav-item') : null;
        
        if (reportsLi) {
            navList.insertBefore(loansItem, reportsLi);
        } else {
            navList.appendChild(loansItem);
        }
        
        // ربط الحدث
        loansItem.querySelector('.nav-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage();
        });
    },
    
    // إنشاء صفحة القروض
    createLoanPage: function() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        const pageElement = document.createElement('div');
        pageElement.className = 'page';
        pageElement.id = 'loans-page';
        
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">إدارة السلف والقروض</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="loan-search" placeholder="البحث في القروض..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <button class="btn btn-primary" id="add-loan-btn">
                        <i class="fas fa-plus"></i>
                        <span>إضافة قرض جديد</span>
                    </button>
                </div>
            </div>
            
            <!-- لوحة الإحصائيات -->
            <div class="loan-dashboard">
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-hand-holding-usd"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">إجمالي القروض النشطة</div>
                                <div class="card-value" id="active-loans-total">0 دينار</div>
                                <div class="card-change">
                                    <span id="active-loans-count">0 قرض</span>
                                </div>
                            </div>
                            <div class="card-icon primary">
                                <i class="fas fa-file-invoice-dollar"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">إجمالي الفوائد المتوقعة</div>
                                <div class="card-value" id="expected-interest">0 دينار</div>
                                <div class="card-change">
                                    <span id="total-interest-rate"></span>
                                </div>
                            </div>
                            <div class="card-icon success">
                                <i class="fas fa-percent"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">عدد المقترضين</div>
                                <div class="card-value" id="borrowers-count">0</div>
                                <div class="card-change">
                                    <span>مقترضين نشطين</span>
                                </div>
                            </div>
                            <div class="card-icon warning">
                                <i class="fas fa-user-tie"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">الأقساط المستحقة هذا الشهر</div>
                                <div class="card-value" id="due-installments-amount">0 دينار</div>
                                <div class="card-change">
                                    <span id="due-installments-count">0 قسط</span>
                                </div>
                            </div>
                            <div class="card-icon danger">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- قائمة القروض والسلف -->
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">القروض والسلف</h2>
                    <div class="section-actions">
                        <div class="btn-group">
                            <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
                            <button class="btn btn-outline btn-sm" data-filter="employee">موظف</button>
                            <button class="btn btn-outline btn-sm" data-filter="hashd">حشد شعبي</button>
                            <button class="btn btn-outline btn-sm" data-filter="police">شرطة</button>
                            <button class="btn btn-outline btn-sm" data-filter="private">كاسب</button>
                            <button class="btn btn-outline btn-sm" data-filter="company">موظف الشركة</button>
                            <button class="btn btn-outline btn-sm" data-filter="social">الرعاية الاجتماعية</button>
                        </div>
                        <button class="btn btn-outline btn-sm" id="export-loans-btn">
                            <i class="fas fa-download"></i>
                            <span>تصدير</span>
                        </button>
                        <button class="btn btn-outline btn-sm" id="settings-loans-btn">
                            <i class="fas fa-cog"></i>
                            <span>إعدادات</span>
                        </button>
                    </div>
                </div>
                
                <div class="table-container">
                    <table id="loans-table">
                        <thead>
                            <tr>
                                <th>المقترض</th>
                                <th>التصنيف</th>
                                <th>المبلغ</th>
                                <th>الفائدة</th>
                                <th>تاريخ البدء</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
            
            <!-- قائمة الأقساط المستحقة -->
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">الأقساط المستحقة</h2>
                    <div class="section-actions">
                        <div class="btn-group">
                            <button class="btn btn-outline btn-sm active" data-filter-installments="month">الشهر الحالي</button>
                            <button class="btn btn-outline btn-sm" data-filter-installments="overdue">متأخرة</button>
                            <button class="btn btn-outline btn-sm" data-filter-installments="paid">مدفوعة</button>
                            <button class="btn btn-outline btn-sm" data-filter-installments="all">الكل</button>
                        </div>
                    </div>
                </div>
                
                <div class="table-container">
                    <table id="installments-table">
                        <thead>
                            <tr>
                                <th>المقترض</th>
                                <th>القرض</th>
                                <th>القسط</th>
                                <th>المبلغ</th>
                                <th>تاريخ الاستحقاق</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
            
            <!-- الإحصائيات -->
            <div class="grid-cols-2">
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">توزيع القروض حسب الفئة</h2>
                    </div>
                    <div class="chart-container">
                        <canvas id="loans-distribution-chart"></canvas>
                    </div>
                </div>
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">حالة السداد</h2>
                    </div>
                    <div class="chart-container">
                        <canvas id="payment-status-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        mainContent.appendChild(pageElement);
    },
    
    // عرض الصفحة
    showPage: function() {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إظهار صفحة القروض
        const loanPage = document.getElementById('loans-page');
        if (loanPage) {
            loanPage.classList.add('active');
            this.updateDashboard();
            this.renderLoansList();
            this.renderInstallmentsList();
            this.renderCharts();
        }
        
        // تحديث القائمة الجانبية
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const loanNavLink = document.querySelector('.nav-link[data-page="loans"]');
        if (loanNavLink) {
            loanNavLink.classList.add('active');
        }
    },
    
    // تحميل البيانات
    loadData: function() {
        try {
            const savedLoans = localStorage.getItem('loans');
            if (savedLoans) {
                this.data.loans = JSON.parse(savedLoans);
            }
            
            const savedInstallments = localStorage.getItem('loan-installments');
            if (savedInstallments) {
                this.data.installments = JSON.parse(savedInstallments);
            }
            
            const savedSettings = localStorage.getItem('loan-settings');
            if (savedSettings) {
                this.data.settings = {...this.data.settings, ...JSON.parse(savedSettings)};
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات القروض:', error);
        }
    },
    
    // حفظ البيانات
    saveData: function() {
        try {
            localStorage.setItem('loans', JSON.stringify(this.data.loans));
            localStorage.setItem('loan-installments', JSON.stringify(this.data.installments));
            localStorage.setItem('loan-settings', JSON.stringify(this.data.settings));
        } catch (error) {
            console.error('خطأ في حفظ بيانات القروض:', error);
        }
    },
    
    // ربط الأحداث
    bindEvents: function() {
        const self = this;
        
        // زر إضافة قرض جديد
        document.addEventListener('click', function(e) {
            if (e.target.closest('#add-loan-btn')) {
                self.openAddLoanModal();
            }
        });
        
        // زر البحث
        document.addEventListener('input', function(e) {
            if (e.target.id === 'loan-search') {
                self.filterLoans(e.target.value);
            }
        });
        
        // أزرار الفلترة
        document.addEventListener('click', function(e) {
            if (e.target.matches('.btn[data-filter]')) {
                document.querySelectorAll('.btn[data-filter]').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                self.filterLoansByCategory(e.target.dataset.filter);
            }
        });
        
        // أزرار فلترة الأقساط
        document.addEventListener('click', function(e) {
            if (e.target.matches('.btn[data-filter-installments]')) {
                document.querySelectorAll('.btn[data-filter-installments]').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                self.filterInstallments(e.target.dataset.filterInstallments);
            }
        });
        
        // زر التصدير
        document.addEventListener('click', function(e) {
            if (e.target.closest('#export-loans-btn')) {
                self.exportData();
            }
        });
        
        // زر الإعدادات
        document.addEventListener('click', function(e) {
            if (e.target.closest('#settings-loans-btn')) {
                self.openSettingsModal();
            }
        });
    },
    
    // فتح نافذة إضافة قرض
    openAddLoanModal: function() {
        // التأكد من وجود النافذة
        let modal = document.getElementById('add-loan-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'add-loan-modal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal animate__animated animate__fadeInUp">
                    <div class="modal-header">
                        <h3 class="modal-title">إضافة قرض جديد</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="add-loan-form">
                            <div class="tabs">
                                <div class="tab-buttons">
                                    <button type="button" class="tab-btn active" data-tab="loan-info">معلومات القرض</button>
                                    <button type="button" class="tab-btn" data-tab="borrower-info">بيانات المقترض</button>
                                    <button type="button" class="tab-btn" data-tab="documents">المستمسكات</button>
                                    <button type="button" class="tab-btn" data-tab="guarantors">الكفلاء</button>
                                </div>
                                <div class="tab-content active" id="loan-info-tab">
                                    <div class="grid-cols-2">
                                        <div class="form-group">
                                            <label class="form-label">التصنيف</label>
                                            <select class="form-select" id="loan-category" required>
                                                <option value="">اختر التصنيف</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">المبلغ (دينار)</label>
                                            <input type="number" class="form-input" id="loan-amount" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">نسبة الفائدة (%)</label>
                                            <input type="number" class="form-input" id="loan-interest" step="0.1" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">المدة (شهر)</label>
                                            <input type="number" class="form-input" id="loan-term" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">تاريخ البدء</label>
                                            <input type="date" class="form-input" id="loan-start-date" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-content" id="borrower-info-tab">
                                    <div class="grid-cols-2">
                                        <div class="form-group">
                                            <label class="form-label">اسم المقترض</label>
                                            <input type="text" class="form-input" id="borrower-name" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">رقم الهاتف</label>
                                            <input type="tel" class="form-input" id="borrower-phone" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">العنوان</label>
                                            <input type="text" class="form-input" id="borrower-address" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">الراتب الشهري</label>
                                            <input type="number" class="form-input" id="borrower-salary" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">مكان العمل</label>
                                            <input type="text" class="form-input" id="borrower-workplace" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-content" id="documents-tab">
                                    <div class="grid-cols-2">
                                        <div class="form-group">
                                            <label class="form-label">البطاقة الموحدة (الأمامية)</label>
                                            <input type="file" class="form-input" id="id-front" accept="image/*">
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">البطاقة الموحدة (الخلفية)</label>
                                            <input type="file" class="form-input" id="id-back" accept="image/*">
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">بطاقة السكن (الأمامية)</label>
                                            <input type="file" class="form-input" id="residence-front" accept="image/*">
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">بطاقة السكن (الخلفية)</label>
                                            <input type="file" class="form-input" id="residence-back" accept="image/*">
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">تأييد الدائرة</label>
                                            <input type="file" class="form-input" id="department-approval" accept="image/*">
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-content" id="guarantors-tab">
                                    <div id="guarantors-list"></div>
                                    <button type="button" class="btn btn-outline" id="add-guarantor-btn">
                                        <i class="fas fa-plus"></i>
                                        <span>إضافة كفيل</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline modal-close-btn">إلغاء</button>
                        <button class="btn btn-primary" id="save-loan-btn">حفظ القرض</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // ملء قائمة التصنيفات
            const categorySelect = modal.querySelector('#loan-category');
            Object.entries(this.data.settings.categories).forEach(([key, value]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = value;
                categorySelect.appendChild(option);
            });
            
            // ربط أحداث النافذة
            this.bindModalEvents(modal);
        }
        
        modal.classList.add('active');
    },
    
    // تحديث لوحة التحكم
    updateDashboard: function() {
        const activeLoans = this.data.loans.filter(loan => loan.status === 'active');
        const totalAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
        const totalInterest = activeLoans.reduce((sum, loan) => sum + loan.totalInterest, 0);
        const borrowersCount = new Set(activeLoans.map(loan => loan.borrowerId)).size;
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const dueInstallments = this.data.installments.filter(installment => {
            const dueDate = new Date(installment.dueDate);
            return dueDate.getMonth() === currentMonth && 
                   dueDate.getFullYear() === currentYear && 
                   installment.status !== 'paid';
        });
        
        const dueAmount = dueInstallments.reduce((sum, installment) => sum + installment.amount, 0);
        
        // تحديث العناصر
        this.updateElement('active-loans-total', this.formatCurrency(totalAmount));
        this.updateElement('active-loans-count', `${activeLoans.length} قرض`);
        this.updateElement('expected-interest', this.formatCurrency(totalInterest));
        this.updateElement('borrowers-count', borrowersCount);
        this.updateElement('due-installments-amount', this.formatCurrency(dueAmount));
        this.updateElement('due-installments-count', `${dueInstallments.length} قسط`);
    },
    
    // عرض قائمة القروض
    renderLoansList: function(filter = '') {
        const tbody = document.querySelector('#loans-table tbody');
        if (!tbody) return;
        
        let loans = [...this.data.loans];
        
        // فلترة القروض
        if (filter) {
            loans = loans.filter(loan => 
                loan.borrowerName.toLowerCase().includes(filter.toLowerCase()) ||
                loan.borrowerPhone.includes(filter)
            );
        }
        
        tbody.innerHTML = loans.map(loan => `
            <tr>
                <td>${loan.borrowerName}</td>
                <td><span class="badge badge-${this.getCategoryColor(loan.category)}">${this.data.settings.categories[loan.category]}</span></td>
                <td>${this.formatCurrency(loan.amount)}</td>
                <td>${loan.interestRate}%</td>
                <td>${this.formatDate(loan.startDate)}</td>
                <td><span class="badge badge-${this.getStatusColor(loan.status)}">${this.getStatusText(loan.status)}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline view-loan" data-id="${loan.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline edit-loan" data-id="${loan.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline pay-installment" data-id="${loan.id}">
                        <i class="fas fa-hand-holding-usd"></i>
                    </button>
                    <button class="btn btn-sm btn-outline danger delete-loan" data-id="${loan.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // ربط أحداث الأزرار
        this.bindTableActions();
    },
    
    // عرض الرسوم البيانية
    renderCharts: function() {
        if (!window.Chart) return;
        
        // رسم توزيع القروض
        this.renderDistributionChart();
        
        // رسم حالة السداد
        this.renderPaymentStatusChart();
    },
    
    // رسم توزيع القروض
    renderDistributionChart: function() {
        const ctx = document.getElementById('loans-distribution-chart');
        if (!ctx) return;
        
        const distribution = Object.keys(this.data.settings.categories).map(key => {
            return this.data.loans.filter(loan => loan.category === key).length;
        });
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.values(this.data.settings.categories),
                datasets: [{
                    data: distribution,
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },
    
    // دوال مساعدة
    formatCurrency: function(amount) {
        return `${amount.toLocaleString()} ${this.data.settings.currency}`;
    },
    
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG');
    },
    
    updateElement: function(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },
    
    getCategoryColor: function(category) {
        const colors = {
            employee: 'primary',
            hashd: 'success',
            police: 'info',
            private: 'warning',
            company: 'danger',
            social: 'secondary'
        };
        return colors[category] || 'primary';
    },
    
    getStatusColor: function(status) {
        const colors = {
            active: 'success',
            completed: 'primary',
            renewed: 'warning',
            overdue: 'danger',
            cancelled: 'secondary'
        };
        return colors[status] || 'primary';
    },
    
    getStatusText: function(status) {
        const texts = {
            active: 'نشط',
            completed: 'مكتمل',
            renewed: 'مجدد',
            overdue: 'متأخر',
            cancelled: 'ملغي'
        };
        return texts[status] || status;
    }
};

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    LoanSystem.init();
});