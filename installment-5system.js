/**
 * نظام إدارة الأقساط المتكامل
 * يوفر هذا الملف وظائف لإدارة الأقساط للمستثمرين في نظام الاستثمار المتكامل
 */

// تهيئة مصفوفة الأقساط
let installments = [];

// استدعاء البيانات من التخزين المحلي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام الأقساط...');
    
    // تحميل بيانات الأقساط
    loadInstallmentData();
    
    // إضافة زر الأقساط إلى القائمة الجانبية
    addInstallmentMenuButton();
    
    // إضافة صفحة الأقساط
    createInstallmentPage();
    
    // إضافة النوافذ المنبثقة للأقساط
    createInstallmentModals();
    
    // تهيئة مستمعي الأحداث
    initInstallmentEventListeners();
    
    // إظهار إشعارات الأقساط المستحقة
    checkDueInstallments();
});

/**
 * تحميل بيانات الأقساط من التخزين المحلي
 */
function loadInstallmentData() {
    try {
        const savedInstallments = localStorage.getItem('installments');
        if (savedInstallments) {
            installments = JSON.parse(savedInstallments);
            console.log(`تم تحميل ${installments.length} من سجلات الأقساط`);
        } else {
            installments = [];
            console.log('لم يتم العثور على بيانات الأقساط، تم إنشاء مصفوفة جديدة');
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات الأقساط:', error);
        installments = [];
    }
}

/**
 * حفظ بيانات الأقساط في التخزين المحلي
 */
function saveInstallmentData() {
    try {
        localStorage.setItem('installments', JSON.stringify(installments));
        console.log('تم حفظ بيانات الأقساط بنجاح');
        return true;
    } catch (error) {
        console.error('خطأ في حفظ بيانات الأقساط:', error);
        showNotification('حدث خطأ أثناء حفظ بيانات الأقساط', 'error');
        return false;
    }
}

/**
 * إضافة زر الأقساط إلى القائمة الجانبية
 */
function addInstallmentMenuButton() {
    const sidebar = document.querySelector('.sidebar .nav-list');
    
    if (!sidebar) {
        console.error('لم يتم العثور على القائمة الجانبية');
        return;
    }
    
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
            showPage('installments');
        });
    }
    
    console.log('تم إضافة زر الأقساط إلى القائمة الجانبية');
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
        console.log('تم إنشاء صفحة الأقساط بنجاح');
    } else {
        console.error('لم يتم العثور على المحتوى الرئيسي');
    }
}

/**
 * إنشاء النوافذ المنبثقة للأقساط
 */
function createInstallmentModals() {
    // إنشاء نافذة إضافة قسط جديد
    createAddInstallmentModal();
    
    // إنشاء نافذة تسديد قسط
    createPayInstallmentModal();
    
    // إنشاء نافذة تفاصيل الأقساط
    createInstallmentDetailsModal();
}

/**
 * إنشاء نافذة إضافة قسط جديد
 */
function createAddInstallmentModal() {
    // التحقق من وجود النافذة
    if (document.getElementById('add-installment-modal')) {
        console.log('نافذة إضافة قسط جديد موجودة بالفعل');
        return;
    }
    
    // إنشاء نافذة إضافة قسط جديد
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'add-installment-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">إضافة قسط جديد</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <form id="add-installment-form">
                    <div class="form-group">
                        <label class="form-label">المستثمر</label>
                        <select class="form-select" id="installment-investor" required="">
                            <option value="">اختر المستثمر</option>
                            <!-- سيتم ملؤها ديناميكيًا -->
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">عنوان الأقساط</label>
                        <div class="input-group">
                            <input class="form-input" id="installment-title" required="" type="text" placeholder="مثال: سيارة هونداي 2023" />
                            <button class="btn btn-icon-sm mic-btn" data-input="installment-title" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid-cols-2">
                        <div class="form-group">
                            <label class="form-label">المبلغ الأصلي (بالدينار)</label>
                            <div class="input-group">
                                <input class="form-input" id="original-amount" required="" type="number" min="1" step="1000" />
                                <button class="btn btn-icon-sm mic-btn" data-input="original-amount" type="button">
                                    <i class="fas fa-microphone"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">نسبة الفائدة (%)</label>
                            <div class="input-group">
                                <input class="form-input" id="interest-rate" required="" type="number" min="0" max="100" step="0.1" value="4" />
                                <button class="btn btn-icon-sm mic-btn" data-input="interest-rate" type="button">
                                    <i class="fas fa-microphone"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">عدد الأشهر</label>
                            <div class="input-group">
                                <input class="form-input" id="months-count" required="" type="number" min="1" max="60" value="12" />
                                <button class="btn btn-icon-sm mic-btn" data-input="months-count" type="button">
                                    <i class="fas fa-microphone"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">تاريخ بدء الأقساط</label>
                            <input class="form-input" id="start-date" required="" type="date" />
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="card bg-light p-3">
                            <h4>ملخص الأقساط</h4>
                            <div id="installment-summary">
                                <p>المبلغ الأصلي: <span id="summary-original">0</span> دينار</p>
                                <p>قيمة الفوائد: <span id="summary-interest">0</span> دينار</p>
                                <p>إجمالي المبلغ: <span id="summary-total">0</span> دينار</p>
                                <p>القسط الشهري: <span id="summary-monthly">0</span> دينار</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ملاحظات</label>
                        <textarea class="form-input" id="installment-notes" rows="3"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-primary" id="save-installment-btn">إضافة</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modalOverlay);
    console.log('تم إنشاء نافذة إضافة قسط جديد بنجاح');
}

/**
 * إنشاء نافذة تسديد قسط
 */
function createPayInstallmentModal() {
    // التحقق من وجود النافذة
    if (document.getElementById('pay-installment-modal')) {
        console.log('نافذة تسديد قسط موجودة بالفعل');
        return;
    }
    
    // إنشاء نافذة تسديد قسط
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'pay-installment-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">تسديد قسط</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <form id="pay-installment-form">
                    <div class="form-group">
                        <label class="form-label">المستثمر</label>
                        <select class="form-select" id="pay-investor" required="">
                            <option value="">اختر المستثمر</option>
                            <!-- سيتم ملؤها ديناميكيًا -->
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">الأقساط المتاحة</label>
                        <select class="form-select" id="available-installments" required="">
                            <option value="">اختر القسط</option>
                            <!-- سيتم ملؤها ديناميكيًا -->
                        </select>
                    </div>
                    
                    <div id="installment-details">
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">تاريخ التسديد</label>
                        <input class="form-input" id="payment-date" required="" type="date" />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ملاحظات</label>
                        <textarea class="form-input" id="payment-notes" rows="3"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-success" id="confirm-payment-btn">تسديد القسط</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modalOverlay);
    console.log('تم إنشاء نافذة تسديد قسط بنجاح');
}

/**
 * إنشاء نافذة تفاصيل الأقساط
 */
function createInstallmentDetailsModal() {
    // التحقق من وجود النافذة
    if (document.getElementById('installment-details-modal')) {
        console.log('نافذة تفاصيل الأقساط موجودة بالفعل');
        return;
    }
    
    // إنشاء نافذة تفاصيل الأقساط
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'installment-details-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">تفاصيل الأقساط</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div id="installment-details-content">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إغلاق</button>
                <div class="btn-group">
                    <button class="btn btn-primary" id="edit-installment-btn">
                        <i class="fas fa-edit"></i>
                        <span>تعديل</span>
                    </button>
                    <button class="btn btn-success" id="pay-selected-installment-btn">
                        <i class="fas fa-hand-holding-usd"></i>
                        <span>تسديد قسط</span>
                    </button>
                    <button class="btn btn-danger" id="delete-installment-btn">
                        <i class="fas fa-trash"></i>
                        <span>حذف</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modalOverlay);
    console.log('تم إنشاء نافذة تفاصيل الأقساط بنجاح');
}

/**
 * تهيئة مستمعي الأحداث
 */
function initInstallmentEventListeners() {
    // حدث فتح نافذة إضافة قسط جديد
    const addInstallmentBtn = document.getElementById('add-installment-btn');
    if (addInstallmentBtn) {
        addInstallmentBtn.addEventListener('click', () => openModal('add-installment-modal'));
    }
    
    // حدث فتح نافذة تسديد قسط
    const payInstallmentBtn = document.getElementById('pay-installment-btn');
    if (payInstallmentBtn) {
        payInstallmentBtn.addEventListener('click', () => openModal('pay-installment-modal'));
    }
    
    // حدث إغلاق النوافذ المنبثقة
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // حدث حفظ قسط جديد
    const saveInstallmentBtn = document.getElementById('save-installment-btn');
    if (saveInstallmentBtn) {
        saveInstallmentBtn.addEventListener('click', addNewInstallment);
    }
    
    // حدث تسديد قسط
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', payInstallment);
    }
    
    // حدث تغيير قيم حساب الأقساط
    const originalAmountInput = document.getElementById('original-amount');
    const interestRateInput = document.getElementById('interest-rate');
    const monthsCountInput = document.getElementById('months-count');
    
    if (originalAmountInput && interestRateInput && monthsCountInput) {
        originalAmountInput.addEventListener('input', calculateInstallmentSummary);
        interestRateInput.addEventListener('input', calculateInstallmentSummary);
        monthsCountInput.addEventListener('input', calculateInstallmentSummary);
    }
    
    // حدث تغيير المستثمر في نافذة تسديد القسط
    const payInvestorSelect = document.getElementById('pay-investor');
    if (payInvestorSelect) {
        payInvestorSelect.addEventListener('change', loadInvestorInstallments);
    }
    
    // حدث تغيير القسط في نافذة تسديد القسط
    const availableInstallmentsSelect = document.getElementById('available-installments');
    if (availableInstallmentsSelect) {
        availableInstallmentsSelect.addEventListener('change', loadInstallmentDetails);
    }
    
    // حدث البحث في الأقساط
    const searchInput = document.querySelector('#installments-page .search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchInstallments(this.value);
        });
    }
    
    // حدث تصفية الأقساط
    const filterButtons = document.querySelectorAll('#installments-page .btn-group[data-filter]');
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // تحديث الزر النشط
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // تصفية الأقساط
                filterInstallments(this.getAttribute('data-filter'));
            });
        });
    }
    
    console.log('تم تهيئة مستمعي الأحداث بنجاح');
}

/**
 * حساب ملخص الأقساط
 */
function calculateInstallmentSummary() {
    const originalAmount = parseFloat(document.getElementById('original-amount').value) || 0;
    const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
    const monthsCount = parseInt(document.getElementById('months-count').value) || 1;
    
    // حساب قيمة الفائدة
    const interestValue = (originalAmount * interestRate) / 100;
    
    // حساب إجمالي المبلغ
    const totalAmount = originalAmount + interestValue;
    
    // حساب القسط الشهري
    const monthlyInstallment = totalAmount / monthsCount;
    
    // عرض الملخص
    document.getElementById('summary-original').textContent = formatCurrency(originalAmount, false);
    document.getElementById('summary-interest').textContent = formatCurrency(interestValue, false);
    document.getElementById('summary-total').textContent = formatCurrency(totalAmount, false);
    document.getElementById('summary-monthly').textContent = formatCurrency(monthlyInstallment, false);
}

/**
 * إضافة قسط جديد
 */
function addNewInstallment() {
    console.log('إضافة قسط جديد...');
    
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
        showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
        return;
    }
    
    // العثور على المستثمر
    const investor = window.investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
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
    
    // إضافة القسط الجديد
    installments.push(newInstallment);
    
    // حفظ البيانات
    if (saveInstallmentData()) {
        // إضافة علامة للمستثمر أن عليه أقساط
        addInstallmentBadgeToInvestor(investorId);
        
        // تحديث عرض الأقساط
        renderInstallmentsTable();
        
        // تحديث إحصائيات الأقساط
        updateInstallmentStatistics();
        
        // إغلاق النافذة المنبثقة
        closeModal('add-installment-modal');
        
        // عرض إشعار النجاح
        showNotification(`تم إضافة قسط ${title} للمستثمر ${investor.name} بنجاح!`, 'success');
    }
}

/**
 * تسديد قسط
 */
function payInstallment() {
    console.log('تسديد قسط...');
    
    // الحصول على قيم النموذج
    const investorId = document.getElementById('pay-investor').value;
    const installmentId = document.getElementById('available-installments').value;
    const paymentDate = document.getElementById('payment-date').value;
    const notes = document.getElementById('payment-notes').value || '';
    
    // التحقق من صحة القيم
    if (!investorId || !installmentId || !paymentDate) {
        showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
        return;
    }
    
    // العثور على المستثمر
    const investor = window.investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return;
    }
    
    // العثور على القسط
    const installment = installments.find(inst => inst.id === installmentId);
    if (!installment) {
        showNotification('لم يتم العثور على القسط', 'error');
        return;
    }
    
    // العثور على أول قسط غير مدفوع
    const unpaidInstallment = installment.monthlyInstallments.find(inst => !inst.isPaid);
    if (!unpaidInstallment) {
        showNotification('جميع الأقساط مدفوعة بالفعل', 'warning');
        return;
    }
    
    // تحديث حالة القسط الشهري
    unpaidInstallment.isPaid = true;
    unpaidInstallment.paidDate = paymentDate;
    unpaidInstallment.paidAmount = unpaidInstallment.amount;
    unpaidInstallment.notes = notes;
    
    // تحديث المبالغ المدفوعة والمتبقية
    installment.paidAmount += unpaidInstallment.amount;
    installment.remainingAmount -= unpaidInstallment.amount;
    
    // تحديث حالة القسط إذا تم دفع جميع الأقساط
    const allPaid = installment.monthlyInstallments.every(inst => inst.isPaid);
    if (allPaid) {
        installment.status = 'completed';
    }
    
    // حفظ البيانات
    if (saveInstallmentData()) {
        // إضافة معاملة جديدة لدفع القسط (إذا كان مطلوباً)
        if (window.addTransaction) {
            const transactionNotes = `تسديد القسط رقم ${unpaidInstallment.installmentNumber} من ${installment.title}`;
            window.addTransaction('دفع قسط', investorId, unpaidInstallment.amount, transactionNotes);
        }
        
        // تحديث عرض الأقساط
        renderInstallmentsTable();
        
        // تحديث إحصائيات الأقساط
        updateInstallmentStatistics();
        
        // إغلاق النافذة المنبثقة
        closeModal('pay-installment-modal');
        
        // عرض إشعار النجاح
        showNotification(`تم تسديد القسط رقم ${unpaidInstallment.installmentNumber} من ${installment.title} للمستثمر ${investor.name} بنجاح!`, 'success');
    }
}

/**
 * تحميل قائمة الأقساط المتاحة للمستثمر
 */
function loadInvestorInstallments() {
    const investorId = document.getElementById('pay-investor').value;
    const installmentsSelect = document.getElementById('available-installments');
    
    if (!investorId || !installmentsSelect) return;
    
    // تفريغ القائمة
    installmentsSelect.innerHTML = '<option value="">اختر القسط</option>';
    
    // العثور على أقساط المستثمر
    const investorInstallments = installments.filter(inst => 
        inst.investorId === investorId && 
        inst.status !== 'completed'
    );
    
    if (investorInstallments.length === 0) {
        installmentsSelect.innerHTML += '<option disabled>لا توجد أقساط متاحة</option>';
        document.getElementById('installment-details').innerHTML = '';
        return;
    }
    
    // إضافة الأقساط إلى القائمة
    investorInstallments.forEach(inst => {
        const option = document.createElement('option');
        option.value = inst.id;
        option.textContent = `${inst.title} - القسط الشهري: ${formatCurrency(inst.monthlyInstallment)}`;
        installmentsSelect.appendChild(option);
    });
    
    // تحديث تفاصيل القسط المحدد
    loadInstallmentDetails();
}

/**
 * تحميل تفاصيل القسط المحدد
 */
function loadInstallmentDetails() {
    const installmentId = document.getElementById('available-installments').value;
    const detailsContainer = document.getElementById('installment-details');
    
    if (!installmentId || !detailsContainer) {
        detailsContainer.innerHTML = '';
        return;
    }
    
    // العثور على القسط
    const installment = installments.find(inst => inst.id === installmentId);
    if (!installment) {
        detailsContainer.innerHTML = '<p>لم يتم العثور على تفاصيل القسط</p>';
        return;
    }
    
    // العثور على أول قسط غير مدفوع
    const unpaidInstallment = installment.monthlyInstallments.find(inst => !inst.isPaid);
    if (!unpaidInstallment) {
        detailsContainer.innerHTML = '<div class="alert alert-success">جميع الأقساط مدفوعة بالفعل</div>';
        return;
    }
    
    // إنشاء عرض تفاصيل القسط
    detailsContainer.innerHTML = `
        <div class="card bg-light p-3 mt-3">
            <h4>تفاصيل القسط</h4>
            <p>عنوان القسط: ${installment.title}</p>
            <p>إجمالي المبلغ: ${formatCurrency(installment.totalAmount)}</p>
            <p>المبلغ المدفوع: ${formatCurrency(installment.paidAmount)}</p>
            <p>المبلغ المتبقي: ${formatCurrency(installment.remainingAmount)}</p>
            <hr>
            <h5>تفاصيل القسط القادم:</h5>
            <p>رقم القسط: ${unpaidInstallment.installmentNumber} من ${installment.monthsCount}</p>
            <p>تاريخ الاستحقاق: ${unpaidInstallment.dueDate}</p>
            <p>المبلغ المستحق: ${formatCurrency(unpaidInstallment.amount)}</p>
        </div>
    `;
}

/**
 * عرض تفاصيل القسط
 */
function showInstallmentDetails(installmentId) {
    console.log(`عرض تفاصيل القسط: ${installmentId}`);
    
    // العثور على القسط
    const installment = installments.find(inst => inst.id === installmentId);
    if (!installment) {
        showNotification('لم يتم العثور على القسط', 'error');
        return;
    }
    
    // العثور على المستثمر
    const investor = window.investors.find(inv => inv.id === installment.investorId);
    
    // إنشاء عرض تفاصيل القسط
    const detailsContent = document.getElementById('installment-details-content');
    if (!detailsContent) return;
    
    // تحديد حالة القسط وأيقونته
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
    
    detailsContent.innerHTML = `
        <div class="installment-profile">
            <div class="investor-avatar large">${investor ? investor.name.charAt(0) : 'غ'}</div>
            <h2 class="investor-fullname">${installment.title}</h2>
            <span class="badge badge-${statusClass}">${statusText}</span>
        </div>
        
        <div class="installment-stats">
            <div class="stat-item">
                <div class="stat-value">${formatCurrency(installment.originalAmount)}</div>
                <div class="stat-label">المبلغ الأصلي</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${formatCurrency(installment.interestValue)}</div>
                <div class="stat-label">قيمة الفائدة</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${formatCurrency(installment.totalAmount)}</div>
                <div class="stat-label">إجمالي المبلغ</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${formatCurrency(installment.monthlyInstallment)}</div>
                <div class="stat-label">القسط الشهري</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">معلومات القسط</h3>
            <div class="detail-item">
                <div class="detail-label">المستثمر</div>
                <div class="detail-value">${investor ? investor.name : 'غير معروف'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">تاريخ البدء</div>
                <div class="detail-value">${installment.startDate}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">عدد الأشهر</div>
                <div class="detail-value">${installment.monthsCount} شهر</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">نسبة الفائدة</div>
                <div class="detail-value">${installment.interestRate}%</div>
            </div>
            ${installment.notes ? `
            <div class="detail-item">
                <div class="detail-label">ملاحظات</div>
                <div class="detail-value">${installment.notes}</div>
            </div>
            ` : ''}
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">الأقساط الشهرية</h3>
            <div class="progress mb-3">
                <div class="progress-bar bg-success" style="width: ${Math.round((installment.paidAmount / installment.totalAmount) * 100)}%">
                    ${Math.round((installment.paidAmount / installment.totalAmount) * 100)}%
                </div>
            </div>
            <div class="mini-table-container">
                <table class="mini-table">
                    <thead>
                        <tr>
                            <th>رقم القسط</th>
                            <th>تاريخ الاستحقاق</th>
                            <th>المبلغ</th>
                            <th>الحالة</th>
                            <th>تاريخ التسديد</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${installment.monthlyInstallments.map(inst => {
                            const isPaid = inst.isPaid;
                            const dueDate = new Date(inst.dueDate);
                            const today = new Date();
                            const isOverdue = !isPaid && dueDate < today;
                            
                            let statusClass = isPaid ? 'success' : 'primary';
                            let statusText = isPaid ? 'مدفوع' : 'مستحق';
                            
                            if (isOverdue) {
                                statusClass = 'danger';
                                statusText = 'متأخر';
                            }
                            
                            return `
                                <tr class="${isOverdue ? 'bg-light-danger' : (isPaid ? 'bg-light-success' : '')}">
                                    <td>${inst.installmentNumber}</td>
                                    <td>${inst.dueDate}</td>
                                    <td>${formatCurrency(inst.amount)}</td>
                                    <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                                    <td>${isPaid ? inst.paidDate : '-'}</td>
                                    <td>
                                        ${!isPaid ? `
                                        <button class="btn btn-sm btn-success pay-monthly-installment-btn" data-id="${installment.id}" data-number="${inst.installmentNumber}">
                                            <i class="fas fa-hand-holding-usd"></i>
                                        </button>
                                        ` : ''}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="installment-summary mt-3">
            <div class="summary-item">
                <div class="summary-label">المبلغ المدفوع:</div>
                <div class="summary-value">${formatCurrency(installment.paidAmount)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">المبلغ المتبقي:</div>
                <div class="summary-value">${formatCurrency(installment.remainingAmount)}</div>
            </div>
        </div>
    `;
    
    // إضافة مستمعي الأحداث لأزرار دفع الأقساط الشهرية
    const payButtons = document.querySelectorAll('.pay-monthly-installment-btn');
    payButtons.forEach(button => {
        button.addEventListener('click', function() {
            const instId = this.getAttribute('data-id');
            const instNumber = parseInt(this.getAttribute('data-number'));
            
            openPaymentModal(instId, instNumber - 1); // نبدأ من 0 في المصفوفة
        });
    });
    
    // إعداد أزرار التحكم في نافذة التفاصيل
    const editBtn = document.getElementById('edit-installment-btn');
    const payBtn = document.getElementById('pay-selected-installment-btn');
    const deleteBtn = document.getElementById('delete-installment-btn');
    
    if (editBtn) {
        editBtn.setAttribute('data-id', installment.id);
        editBtn.addEventListener('click', function() {
            editInstallment(installment.id);
        });
    }
    
    if (payBtn) {
        payBtn.setAttribute('data-id', installment.id);
        payBtn.addEventListener('click', function() {
            openPaymentModalForInstallment(installment.id);
        });
        
        // تعطيل زر التسديد إذا كانت جميع الأقساط مدفوعة
        const allPaid = installment.monthlyInstallments.every(inst => inst.isPaid);
        payBtn.disabled = allPaid;
    }
    
    if (deleteBtn) {
        deleteBtn.setAttribute('data-id', installment.id);
        deleteBtn.addEventListener('click', function() {
            deleteInstallment(installment.id);
        });
    }
    
    // فتح نافذة التفاصيل
    openModal('installment-details-modal');
}

/**
 * فتح نافذة دفع القسط الشهري
 */
function openPaymentModal(installmentId, installmentIndex) {
    // التحميل المسبق للمستثمر والقسط
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        showNotification('لم يتم العثور على القسط', 'error');
        return;
    }
    
    const investor = window.investors.find(inv => inv.id === installment.investorId);
    
    // ملء قيم النموذج
    const payInvestorSelect = document.getElementById('pay-investor');
    const availableInstallmentsSelect = document.getElementById('available-installments');
    
    if (payInvestorSelect) {
        // تحديث قائمة المستثمرين
        populateInvestorSelects();
        
        // تحديد المستثمر الحالي
        payInvestorSelect.value = installment.investorId;
        
        // تحديث قائمة الأقساط
        loadInvestorInstallments();
        
        // تحديد القسط الحالي
        if (availableInstallmentsSelect) {
            availableInstallmentsSelect.value = installment.id;
            
            // تحديث تفاصيل القسط
            loadInstallmentDetails();
        }
    }
    
    // فتح نافذة التسديد
    openModal('pay-installment-modal');
}

/**
 * فتح نافذة دفع القسط بناءً على معرف القسط
 */
function openPaymentModalForInstallment(installmentId) {
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        showNotification('لم يتم العثور على القسط', 'error');
        return;
    }
    
    // البحث عن أول قسط غير مدفوع
    const unpaidIndex = installment.monthlyInstallments.findIndex(inst => !inst.isPaid);
    
    if (unpaidIndex === -1) {
        showNotification('جميع الأقساط مدفوعة بالفعل', 'warning');
        return;
    }
    
    // فتح نافذة الدفع للقسط المحدد
    openPaymentModal(installmentId, unpaidIndex);
}

/**
 * تعديل القسط
 */
function editInstallment(installmentId) {
    // سيتم تنفيذها لاحقًا
    showNotification('سيتم تنفيذ هذه الوظيفة لاحقًا', 'info');
}

/**
 * حذف القسط
 */
function deleteInstallment(installmentId) {
    console.log(`حذف القسط: ${installmentId}`);
    
    // العثور على القسط
    const installment = installments.find(inst => inst.id === installmentId);
    if (!installment) {
        showNotification('لم يتم العثور على القسط', 'error');
        return;
    }
    
    // طلب تأكيد الحذف
    if (!confirm(`هل أنت متأكد من رغبتك في حذف قسط ${installment.title}؟\nسيتم حذف جميع البيانات المتعلقة به.`)) {
        return;
    }
    
    // حذف القسط
    installments = installments.filter(inst => inst.id !== installmentId);
    
    // حفظ البيانات
    if (saveInstallmentData()) {
        // تحديث عرض الأقساط
        renderInstallmentsTable();
        
        // تحديث إحصائيات الأقساط
        updateInstallmentStatistics();
        
        // إغلاق نافذة التفاصيل
        closeModal('installment-details-modal');
        
        // عرض إشعار النجاح
        showNotification(`تم حذف القسط ${installment.title} بنجاح!`, 'success');
    }
}

/**
 * إضافة علامة الأقساط للمستثمر
 */
function addInstallmentBadgeToInvestor(investorId) {
    // الحصول على عناصر جدول المستثمرين
    const investorsTable = document.getElementById('investors-table');
    if (!investorsTable) return;
    
    // البحث عن صف المستثمر
    const investorRow = investorsTable.querySelector(`tr[data-id="${investorId}"]`);
    if (!investorRow) return;
    
    // البحث عن خلية الحالة
    const statusCell = investorRow.querySelector('td:nth-child(7)');
    if (!statusCell) return;
    
    // إضافة شارة الأقساط بجانب حالة المستثمر
    if (!statusCell.querySelector('.installment-badge')) {
        const badge = document.createElement('span');
        badge.className = 'badge badge-warning installment-badge ml-2';
        badge.innerHTML = '<i class="fas fa-money-check-alt"></i> أقساط';
        badge.title = 'لدى المستثمر أقساط نشطة';
        
        statusCell.appendChild(badge);
    }
}

/**
 * تحديث إحصائيات الأقساط
 */
function updateInstallmentStatistics() {
    // حساب إجمالي الأقساط
    let totalInstallmentsAmount = 0;
    let paidInstallmentsAmount = 0;
    let dueInstallmentsAmount = 0;
    let overdueInstallmentsAmount = 0;
    
    const today = new Date();
    
    installments.forEach(installment => {
        totalInstallmentsAmount += installment.totalAmount;
        paidInstallmentsAmount += installment.paidAmount;
        
        // حساب الأقساط المستحقة والمتأخرة
        installment.monthlyInstallments.forEach(monthlyInst => {
            if (!monthlyInst.isPaid) {
                const dueDate = new Date(monthlyInst.dueDate);
                
                if (dueDate < today) {
                    // قسط متأخر
                    overdueInstallmentsAmount += monthlyInst.amount;
                } else {
                    // قسط مستحق
                    dueInstallmentsAmount += monthlyInst.amount;
                }
            }
        });
    });
    
    // تحديث قيم الإحصائيات
    document.getElementById('total-installments').textContent = formatCurrency(totalInstallmentsAmount);
    document.getElementById('paid-installments').textContent = formatCurrency(paidInstallmentsAmount);
    document.getElementById('due-installments').textContent = formatCurrency(dueInstallmentsAmount);
    document.getElementById('overdue-installments').textContent = formatCurrency(overdueInstallmentsAmount);
}

/**
 * عرض جدول الأقساط
 */
function renderInstallmentsTable() {
    console.log('عرض جدول الأقساط...');
    
    const tableBody = document.querySelector('#installments-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // ترتيب الأقساط حسب التاريخ (الأحدث أولاً)
    const sortedInstallments = [...installments].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    if (sortedInstallments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد أقساط</td></tr>';
        return;
    }
    
    // عرض الأقساط في الجدول
    sortedInstallments.forEach(installment => {
        // تحديد عدد الأقساط المتبقية
        const remainingInstallments = installment.monthlyInstallments.filter(inst => !inst.isPaid).length;
        
        // تحديد تاريخ القسط القادم
        const nextInstallment = installment.monthlyInstallments.find(inst => !inst.isPaid);
        const nextDueDate = nextInstallment ? nextInstallment.dueDate : '-';
        
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
        
        // إنشاء صف في الجدول
        const row = document.createElement('tr');
        row.setAttribute('data-id', installment.id);
        
        row.innerHTML = `
            <td>${installment.id}</td>
            <td>
                <div class="investor-info">
                    <div class="investor-avatar">${installment.investorName.charAt(0)}</div>
                    <div>
                        <div class="investor-name">${installment.investorName}</div>
                    </div>
                </div>
            </td>
            <td>${installment.title}</td>
            <td>${formatCurrency(installment.totalAmount)}</td>
            <td>${formatCurrency(installment.monthlyInstallment)}</td>
            <td>${remainingInstallments} من ${installment.monthsCount}</td>
            <td>${nextDueDate !== '-' ? nextDueDate : 'مكتمل'}</td>
            <td><span<td><span class="badge badge-${statusClass}">${statusText}</span></td>
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
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-installment');
        const payButton = row.querySelector('.pay-installment');
        const deleteButton = row.querySelector('.delete-installment');
        
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                showInstallmentDetails(installment.id);
            });
        }
        
        if (payButton) {
            payButton.addEventListener('click', () => {
                openPaymentModalForInstallment(installment.id);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                deleteInstallment(installment.id);
            });
        }
    });
    
    // تحديث إحصائيات الأقساط
    updateInstallmentStatistics();
}

/**
 * البحث في الأقساط
 * @param {string} query - نص البحث
 */
function searchInstallments(query) {
    console.log(`البحث في الأقساط: ${query}`);
    
    query = query.trim().toLowerCase();
    
    if (!query) {
        // إعادة عرض جميع الأقساط إذا كان البحث فارغًا
        renderInstallmentsTable();
        return;
    }
    
    // تصفية الأقساط حسب البحث
    const filteredInstallments = installments.filter(installment => {
        return installment.title.toLowerCase().includes(query) ||
               installment.investorName.toLowerCase().includes(query) ||
               installment.id.toLowerCase().includes(query);
    });
    
    // عرض الأقساط المصفّاة
    const tableBody = document.querySelector('#installments-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filteredInstallments.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td></tr>`;
        return;
    }
    
    // عرض الأقساط المصفّاة
    filteredInstallments.forEach(installment => {
        // تحديد عدد الأقساط المتبقية
        const remainingInstallments = installment.monthlyInstallments.filter(inst => !inst.isPaid).length;
        
        // تحديد تاريخ القسط القادم
        const nextInstallment = installment.monthlyInstallments.find(inst => !inst.isPaid);
        const nextDueDate = nextInstallment ? nextInstallment.dueDate : '-';
        
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
        
        // إنشاء صف في الجدول
        const row = document.createElement('tr');
        row.setAttribute('data-id', installment.id);
        
        row.innerHTML = `
            <td>${installment.id}</td>
            <td>
                <div class="investor-info">
                    <div class="investor-avatar">${installment.investorName.charAt(0)}</div>
                    <div>
                        <div class="investor-name">${installment.investorName}</div>
                    </div>
                </div>
            </td>
            <td>${installment.title}</td>
            <td>${formatCurrency(installment.totalAmount)}</td>
            <td>${formatCurrency(installment.monthlyInstallment)}</td>
            <td>${remainingInstallments} من ${installment.monthsCount}</td>
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
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-installment');
        const payButton = row.querySelector('.pay-installment');
        const deleteButton = row.querySelector('.delete-installment');
        
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                showInstallmentDetails(installment.id);
            });
        }
        
        if (payButton) {
            payButton.addEventListener('click', () => {
                openPaymentModalForInstallment(installment.id);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                deleteInstallment(installment.id);
            });
        }
    });
}

/**
 * تصفية الأقساط حسب الحالة
 * @param {string} filter - نوع التصفية (all, due, paid, overdue)
 */
function filterInstallments(filter) {
    console.log(`تصفية الأقساط حسب: ${filter}`);
    
    // تحديث الأزرار النشطة
    const filterButtons = document.querySelectorAll('#installments-page .btn-group[data-filter] .btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });
    
    // إذا كانت التصفية "all"، نعيد عرض جميع الأقساط
    if (filter === 'all') {
        renderInstallmentsTable();
        return;
    }
    
    // تصفية الأقساط حسب الحالة
    const today = new Date();
    
    const filteredInstallments = installments.filter(installment => {
        // الأقساط المدفوعة بالكامل
        if (filter === 'paid' && installment.status === 'completed') {
            return true;
        }
        
        // الأقساط المستحقة (نشطة وليست متأخرة)
        if (filter === 'due' && installment.status === 'active') {
            const hasOverdue = installment.monthlyInstallments.some(inst => 
                !inst.isPaid && new Date(inst.dueDate) < today
            );
            
            return !hasOverdue;
        }
        
        // الأقساط المتأخرة
        if (filter === 'overdue' && installment.status === 'active') {
            const hasOverdue = installment.monthlyInstallments.some(inst => 
                !inst.isPaid && new Date(inst.dueDate) < today
            );
            
            return hasOverdue;
        }
        
        return false;
    });
    
    // عرض الأقساط المصفّاة
    const tableBody = document.querySelector('#installments-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filteredInstallments.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center">لا توجد أقساط ${
            filter === 'paid' ? 'مدفوعة' : (filter === 'due' ? 'مستحقة' : 'متأخرة')
        }</td></tr>`;
        return;
    }
    
    // استدعاء دالة عرض الأقساط المصفّاة
    filteredInstallments.forEach(installment => {
        // تحديد عدد الأقساط المتبقية
        const remainingInstallments = installment.monthlyInstallments.filter(inst => !inst.isPaid).length;
        
        // تحديد تاريخ القسط القادم
        const nextInstallment = installment.monthlyInstallments.find(inst => !inst.isPaid);
        const nextDueDate = nextInstallment ? nextInstallment.dueDate : '-';
        
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
        
        // إنشاء صف في الجدول
        const row = document.createElement('tr');
        row.setAttribute('data-id', installment.id);
        
        row.innerHTML = `
            <td>${installment.id}</td>
            <td>
                <div class="investor-info">
                    <div class="investor-avatar">${installment.investorName.charAt(0)}</div>
                    <div>
                        <div class="investor-name">${installment.investorName}</div>
                    </div>
                </div>
            </td>
            <td>${installment.title}</td>
            <td>${formatCurrency(installment.totalAmount)}</td>
            <td>${formatCurrency(installment.monthlyInstallment)}</td>
            <td>${remainingInstallments} من ${installment.monthsCount}</td>
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
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-installment');
        const payButton = row.querySelector('.pay-installment');
        const deleteButton = row.querySelector('.delete-installment');
        
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                showInstallmentDetails(installment.id);
            });
        }
        
        if (payButton) {
            payButton.addEventListener('click', () => {
                openPaymentModalForInstallment(installment.id);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                deleteInstallment(installment.id);
            });
        }
    });
}

/**
 * التحقق من الأقساط المستحقة وإظهار إشعارات
 */
function checkDueInstallments() {
    console.log('التحقق من الأقساط المستحقة...');
    
    const today = new Date();
    let dueTodayCount = 0;
    let overdueCount = 0;
    
    // التحقق من كل قسط نشط
    installments.forEach(installment => {
        if (installment.status !== 'active') return;
        
        // التحقق من الأقساط الشهرية
        installment.monthlyInstallments.forEach(monthlyInst => {
            if (!monthlyInst.isPaid) {
                const dueDate = new Date(monthlyInst.dueDate);
                
                // تحديد الفرق بالأيام
                const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) {
                    // قسط مستحق اليوم
                    dueTodayCount++;
                } else if (diffDays < 0) {
                    // قسط متأخر
                    overdueCount++;
                }
            }
        });
    });
    
    // إظهار إشعار إذا كان هناك أقساط مستحقة اليوم
    if (dueTodayCount > 0) {
        showNotification(`لديك ${dueTodayCount} قسط مستحق اليوم`, 'warning');
    }
    
    // إظهار إشعار إذا كان هناك أقساط متأخرة
    if (overdueCount > 0) {
        showNotification(`لديك ${overdueCount} قسط متأخر عن الدفع`, 'error');
    }
    
    // إضافة شارة الإشعارات
    updateNotificationBadge(dueTodayCount + overdueCount);
}

/**
 * تحديث شارة الإشعارات
 * @param {number} count - عدد الإشعارات
 */
function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

/**
 * ملء قوائم اختيار المستثمرين
 */
function populateInvestorSelects() {
    console.log('ملء قوائم المستثمرين...');
    
    // قوائم الاختيار
    const investorSelect = document.getElementById('installment-investor');
    const payInvestorSelect = document.getElementById('pay-investor');
    
    if (!window.investors || !Array.isArray(window.investors)) {
        console.error('لم يتم العثور على مصفوفة المستثمرين');
        return;
    }
    
    // ترتيب المستثمرين أبجديًا
    const sortedInvestors = [...window.investors].sort((a, b) => a.name.localeCompare(b.name));
    
    // ملء قائمة المستثمرين في نافذة إضافة قسط جديد
    if (investorSelect) {
        investorSelect.innerHTML = '<option value="">اختر المستثمر</option>';
        
        sortedInvestors.forEach(investor => {
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = `${investor.name} (${investor.phone})`;
            investorSelect.appendChild(option);
        });
    }
    
    // ملء قائمة المستثمرين في نافذة تسديد قسط
    if (payInvestorSelect) {
        payInvestorSelect.innerHTML = '<option value="">اختر المستثمر</option>';
        
        // تصفية المستثمرين الذين لديهم أقساط نشطة
        const investorsWithInstallments = sortedInvestors.filter(investor => {
            return installments.some(inst => 
                inst.investorId === investor.id && 
                inst.status === 'active'
            );
        });
        
        if (investorsWithInstallments.length === 0) {
            payInvestorSelect.innerHTML += '<option disabled>لا يوجد مستثمرين لديهم أقساط نشطة</option>';
        } else {
            investorsWithInstallments.forEach(investor => {
                const option = document.createElement('option');
                option.value = investor.id;
                option.textContent = `${investor.name} (${investor.phone})`;
                payInvestorSelect.appendChild(option);
            });
        }
    }
}

/**
 * فتح نافذة منبثقة
 * @param {string} modalId - معرف النافذة
 */
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
    
    // تحديثات خاصة بنوافذ محددة
    if (modalId === 'add-installment-modal') {
        // تحديث قائمة المستثمرين
        populateInvestorSelects();
    } else if (modalId === 'pay-installment-modal') {
        // تحديث قائمة المستثمرين
        populateInvestorSelects();
    }
}

/**
 * إغلاق نافذة منبثقة
 * @param {string} modalId - معرف النافذة
 */
function closeModal(modalId) {
    console.log(`إغلاق النافذة: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * إضافة أنماط CSS الخاصة بنظام الأقساط
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
        /* أنماط شاشة الأقساط */
        .installment-actions {
            display: flex;
            justify-content: center;
            gap: 5px;
        }
        
        .installment-action-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            background-color: #f8f9fa;
        }
        
        .installment-action-btn.view-installment {
            color: #3b82f6;
        }
        
        .installment-action-btn.edit-installment {
            color: #10b981;
        }
        
        .installment-action-btn.pay {
            color: #f59e0b;
        }
        
        .installment-action-btn.delete {
            color: #ef4444;
        }
        
        .installment-action-btn:hover {
            background-color: #e9ecef;
            transform: scale(1.1);
        }
        
        /* أنماط شارة الأقساط للمستثمرين */
        .installment-badge {
            margin-right: 5px;
            font-size: 0.7rem;
            padding: 3px 6px;
            border-radius: 10px;
            cursor: pointer;
        }
        
        /* أنماط تفاصيل الأقساط */
        .installment-profile {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .installment-stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .installment-stats .stat-item {
            flex: 1;
            padding: 15px;
            text-align: center;
            background-color: #f8f9fa;
            border-left: 1px solid #e9ecef;
        }
        
        .installment-stats .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
        }
        
        .installment-stats .stat-label {
            font-size: 0.8rem;
            color: #6c757d;
        }
        
        .installment-summary {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 10px;
            margin-top: 20px;
        }
        
        .installment-summary .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px dashed #e9ecef;
        }
        
        .installment-summary .summary-label {
            font-weight: bold;
            color: #6c757d;
        }
        
        .installment-summary .summary-value {
            font-weight: bold;
            color: #3b82f6;
        }
        
        /* أنماط خلفية الصفوف */
        .bg-light-danger {
            background-color: rgba(239, 68, 68, 0.1);
        }
        
        .bg-light-success {
            background-color: rgba(16, 185, 129, 0.1);
        }
        
        /* أنماط نموذج إضافة وتسديد الأقساط */
        .card.bg-light {
            background-color: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .card.bg-light h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #3b82f6;
            font-size: 1.2rem;
        }
        
        #installment-summary p {
            margin: 5px 0;
            display: flex;
            justify-content: space-between;
        }
        
        #installment-summary span {
            font-weight: bold;
            color: #3b82f6;
        }
        
        /* أنماط شريط التقدم */
        .progress {
            height: 10px;
            background-color: #e9ecef;
            border-radius: 5px;
            overflow: hidden;
            margin-bottom: 15px;
        }
        
        .progress-bar {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.7rem;
            transition: width 0.5s ease;
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للأقساط');
}

// إضافة استدعاء دالات النظام إلى الكائن العالمي (window)
window.InstallmentSystem = {
    loadInstallmentData,
    saveInstallmentData,
    renderInstallmentsTable,
    showInstallmentDetails,
    openPaymentModalForInstallment,
    addNewInstallment,
    payInstallment,
    deleteInstallment,
    searchInstallments,
    filterInstallments,
    updateInstallmentStatistics,
    checkDueInstallments
};

// إضافة أنماط CSS
addInstallmentStyles();

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام الأقساط...');
    
    // تحميل بيانات الأقساط
    loadInstallmentData();
    
    // إضافة زر الأقساط إلى القائمة الجانبية
    addInstallmentMenuButton();
    
    // إضافة صفحة الأقساط
    createInstallmentPage();
    
    // إضافة النوافذ المنبثقة للأقساط
    createInstallmentModals();
    
    // تهيئة مستمعي الأحداث
    initInstallmentEventListeners();
    
    // إظهار إشعارات الأقساط المستحقة
    checkDueInstallments();
});

/**
 * إضافة تكامل مع نظام الإشعارات
 */
function addInstallmentNotifications() {
    // التحقق من وجود نظام الإشعارات
    if (window.addNotificationItem) {
        console.log('تكامل مع نظام الإشعارات...');
        
        // إضافة فئة الأقساط إلى نظام الإشعارات
        const today = new Date();
        
        // التحقق من كل قسط نشط
        installments.forEach(installment => {
            if (installment.status !== 'active') return;
            
            // التحقق من الأقساط الشهرية
            installment.monthlyInstallments.forEach((monthlyInst, index) => {
                if (!monthlyInst.isPaid) {
                    const dueDate = new Date(monthlyInst.dueDate);
                    
                    // تحديد الفرق بالأيام
                    const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 0) {
                        // قسط مستحق اليوم
                        window.addNotificationItem({
                            title: `قسط مستحق اليوم`,
                            message: `القسط رقم ${monthlyInst.installmentNumber} من ${installment.title} للمستثمر ${installment.investorName}`,
                            type: 'warning',
                            date: new Date().toISOString(),
                            action: `openInstallmentDetails('${installment.id}')`,
                            category: 'installments'
                        });
                    } else if (diffDays < 0) {
                        // قسط متأخر
                        window.addNotificationItem({
                            title: `قسط متأخر عن الدفع`,
                            message: `القسط رقم ${monthlyInst.installmentNumber} من ${installment.title} للمستثمر ${installment.investorName} متأخر عن الدفع منذ ${Math.abs(diffDays)} يوم`,
                            type: 'danger',
                            date: new Date().toISOString(),
                            action: `openInstallmentDetails('${installment.id}')`,
                            category: 'installments'
                        });
                    } else if (diffDays <= 3) {
                        // قسط قريب من الاستحقاق
                        window.addNotificationItem({
                            title: `قسط قريب من الاستحقاق`,
                            message: `القسط رقم ${monthlyInst.installmentNumber} من ${installment.title} للمستثمر ${installment.investorName} يستحق بعد ${diffDays} يوم`,
                            type: 'info',
                            date: new Date().toISOString(),
                            action: `openInstallmentDetails('${installment.id}')`,
                            category: 'installments'
                        });
                    }
                }
            });
        });
    }
}

/**
 * دالة تكامل مع نظام الواتساب
 * لإرسال رسائل تذكير للمستثمرين بالأقساط المستحقة
 */
function sendWhatsAppReminders() {
    // التحقق من وجود نظام الواتساب
    if (window.sendWhatsAppMessage) {
        console.log('إرسال تذكيرات الأقساط عبر الواتساب...');
        
        const today = new Date();
        
        // التحقق من كل قسط نشط
        installments.forEach(installment => {
            if (installment.status !== 'active') return;
            
            // العثور على المستثمر
            const investor = window.investors.find(inv => inv.id === installment.investorId);
            if (!investor || !investor.phone) return;
            
            // التحقق من الأقساط الشهرية
            installment.monthlyInstallments.forEach((monthlyInst, index) => {
                if (!monthlyInst.isPaid) {
                    const dueDate = new Date(monthlyInst.dueDate);
                    
                    // تحديد الفرق بالأيام
                    const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
                    
                    // نص الرسالة
                    let message = '';
                    
                    if (diffDays === 0) {
                        // قسط مستحق اليوم
                        message = `تذكير: يستحق اليوم القسط رقم ${monthlyInst.installmentNumber} من ${installment.title} بمبلغ ${formatCurrency(monthlyInst.amount)}.`;
                    } else if (diffDays < 0) {
                        // قسط متأخر
                        message = `تنبيه: القسط رقم ${monthlyInst.installmentNumber} من ${installment.title} متأخر عن الدفع منذ ${Math.abs(diffDays)} يوم. المبلغ المستحق: ${formatCurrency(monthlyInst.amount)}.`;
                    } else if (diffDays === 1) {
                        // قسط يستحق غدًا
                        message = `تذكير: يستحق غدًا القسط رقم ${monthlyInst.installmentNumber} من ${installment.title} بمبلغ ${formatCurrency(monthlyInst.amount)}.`;
                    }
                    
                    // إرسال الرسالة إذا كان هناك نص
                    if (message && window.sendWhatsAppMessage) {
                        window.sendWhatsAppMessage(investor.phone, message);
                    }
                }
            });
        });
    }
}

/**
 * إضافة تقارير الأقساط
 */
function createInstallmentReports() {
    // إنشاء تقرير الأقساط الشهرية
    function createMonthlyInstallmentReport() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // جمع الأقساط المستحقة خلال الشهر الحالي
        const monthlyInstallmentsDue = [];
        
        installments.forEach(installment => {
            installment.monthlyInstallments.forEach((monthlyInst, index) => {
                const dueDate = new Date(monthlyInst.dueDate);
                
                // التحقق من أن القسط في الشهر الحالي
                if (dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear) {
                    monthlyInstallmentsDue.push({
                        installmentId: installment.id,
                        installmentTitle: installment.title,
                        investorId: installment.investorId,
                        investorName: installment.investorName,
                        number: monthlyInst.installmentNumber,
                        amount: monthlyInst.amount,
                        dueDate: monthlyInst.dueDate,
                        isPaid: monthlyInst.isPaid,
                        paidDate: monthlyInst.paidDate
                    });
                }
            });
        });
        
        // حساب إحصائيات التقرير
        const totalDue = monthlyInstallmentsDue.reduce((sum, inst) => sum + inst.amount, 0);
        const totalPaid = monthlyInstallmentsDue.filter(inst => inst.isPaid).reduce((sum, inst) => sum + inst.amount, 0);
        const totalUnpaid = totalDue - totalPaid;
        const paidCount = monthlyInstallmentsDue.filter(inst => inst.isPaid).length;
        const unpaidCount = monthlyInstallmentsDue.filter(inst => !inst.isPaid).length;
        
        // إنشاء مصفوفة البيانات للتصدير
        return {
            title: `تقرير الأقساط الشهرية - ${getMonthName(currentMonth)} ${currentYear}`,
            date: today.toISOString().split('T')[0],
            stats: {
                totalDue,
                totalPaid,
                totalUnpaid,
                paidCount,
                unpaidCount,
                paidPercentage: totalDue > 0 ? (totalPaid / totalDue) * 100 : 0
            },
            items: monthlyInstallmentsDue
        };
    }
    
    // إنشاء تقرير الأقساط حسب المستثمر
    function createInvestorInstallmentReport(investorId) {
        // العثور على المستثمر
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor) return null;
        
        // جمع جميع الأقساط للمستثمر
        const investorInstallments = installments.filter(inst => inst.investorId === investorId);
        
        // إعداد مصفوفة الأقساط المسطحة
        const installmentItems = [];
        
        investorInstallments.forEach(installment => {
            installment.monthlyInstallments.forEach((monthlyInst, index) => {
                installmentItems.push({
                    installmentId: installment.id,
                    installmentTitle: installment.title,
                    number: monthlyInst.installmentNumber,
                    amount: monthlyInst.amount,
                    dueDate: monthlyInst.dueDate,
                    isPaid: monthlyInst.isPaid,
                    paidDate: monthlyInst.paidDate,
                    status: getInstallmentStatus(monthlyInst)
                });
            });
        });
        
        // حساب إحصائيات التقرير
        const totalAmount = investorInstallments.reduce((sum, inst) => sum + inst.totalAmount, 0);
        const totalPaid = investorInstallments.reduce((sum, inst) => sum + inst.paidAmount, 0);
        const totalRemaining = totalAmount - totalPaid;
        const paidInstallmentsCount = installmentItems.filter(item => item.isPaid).length;
        const totalInstallmentsCount = installmentItems.length;
        
        // إنشاء مصفوفة البيانات للتصدير
        return {
            title: `تقرير الأقساط للمستثمر: ${investor.name}`,
            date: new Date().toISOString().split('T')[0],
            investor: {
                id: investor.id,
                name: investor.name,
                phone: investor.phone
            },
            stats: {
                totalAmount,
                totalPaid,
                totalRemaining,
                paidInstallmentsCount,
                totalInstallmentsCount,
                paidPercentage: totalInstallmentsCount > 0 ? (paidInstallmentsCount / totalInstallmentsCount) * 100 : 0
            },
            installments: investorInstallments.map(inst => ({
                id: inst.id,
                title: inst.title,
                originalAmount: inst.originalAmount,
                totalAmount: inst.totalAmount,
                monthlyInstallment: inst.monthlyInstallment,
                startDate: inst.startDate,
                monthsCount: inst.monthsCount,
                paidAmount: inst.paidAmount,
                remainingAmount: inst.remainingAmount,
                status: inst.status
            })),
            items: installmentItems
        };
    }
    
    // الحصول على اسم الشهر
    function getMonthName(monthIndex) {
        const months = [
            'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        return months[monthIndex];
    }
    
    // الحصول على حالة القسط
    function getInstallmentStatus(monthlyInst) {
        if (monthlyInst.isPaid) {
            return 'مدفوع';
        }
        
        const dueDate = new Date(monthlyInst.dueDate);
        const today = new Date();
        
        if (dueDate < today) {
            return 'متأخر';
        } else {
            return 'مستحق';
        }
    }
    
    // إضافة الدوال إلى كائن نظام الأقساط
    window.InstallmentSystem.createMonthlyInstallmentReport = createMonthlyInstallmentReport;
    window.InstallmentSystem.createInvestorInstallmentReport = createInvestorInstallmentReport;
}

/**
 * دالة فتحة تفاصيل القسط من خارج النظام
 * @param {string} installmentId - معرف القسط
 */
function openInstallmentDetails(installmentId) {
    // التحقق من وجود النظام
    if (window.InstallmentSystem && window.InstallmentSystem.showInstallmentDetails) {
        // الانتقال إلى صفحة الأقساط أولاً
        const installmentsLink = document.querySelector('.nav-link[data-page="installments"]');
        if (installmentsLink) {
            installmentsLink.click();
        }
        
        // فتح تفاصيل القسط
        setTimeout(() => {
            window.InstallmentSystem.showInstallmentDetails(installmentId);
        }, 300);
    }
}

// إضافة الدالة إلى الكائن العالمي
window.openInstallmentDetails = openInstallmentDetails;

/**
 * تصدير بيانات الأقساط
 * @param {string} type - نوع التصدير (installments, investor-installments)
 * @param {string} investorId - معرف المستثمر (اختياري)
 */
function exportInstallmentData(type, investorId = null) {
    console.log(`تصدير بيانات الأقساط: ${type}`);
    
    let data = [];
    let filename = '';
    let headers = [];
    
    if (type === 'installments') {
        // تصدير جميع الأقساط
        data = installments.map(inst => ({
            id: inst.id,
            investorName: inst.investorName,
            title: inst.title,
            originalAmount: inst.originalAmount,
            interestRate: inst.interestRate,
            totalAmount: inst.totalAmount,
            monthlyInstallment: inst.monthlyInstallment,
            monthsCount: inst.monthsCount,
            startDate: inst.startDate,
            paidAmount: inst.paidAmount,
            remainingAmount: inst.remainingAmount,
            status: inst.status
        }));
        
        filename = 'الأقساط';
        headers = [
            'المعرف', 'المستثمر', 'عنوان الأقساط', 'المبلغ الأصلي', 'نسبة الفائدة', 
            'إجمالي المبلغ', 'القسط الشهري', 'عدد الأشهر', 'تاريخ البدء', 
            'المبلغ المدفوع', 'المبلغ المتبقي', 'الحالة'
        ];
    } else if (type === 'investor-installments' && investorId) {
        // تصدير أقساط مستثمر محدد
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor) {
            showNotification('لم يتم العثور على المستثمر', 'error');
            return;
        }
        
        // جمع الأقساط الشهرية للمستثمر
        const investorInstallments = installments.filter(inst => inst.investorId === investorId);
        const monthlyItems = [];
        
        investorInstallments.forEach(installment => {
            installment.monthlyInstallments.forEach(monthlyInst => {
                monthlyItems.push({
                    installmentId: installment.id,
                    installmentTitle: installment.title,
                    number: monthlyInst.installmentNumber,
                    amount: monthlyInst.amount,
                    dueDate: monthlyInst.dueDate,
                    isPaid: monthlyInst.isPaid ? 'نعم' : 'لا',
                    paidDate: monthlyInst.paidDate || '-',
                    status: monthlyInst.isPaid ? 'مدفوع' : (new Date(monthlyInst.dueDate) < new Date() ? 'متأخر' : 'مستحق')
                });
            });
        });
        
        data = monthlyItems;
        filename = `أقساط_${investor.name}`;
        headers = [
            'معرف القسط', 'عنوان القسط', 'رقم القسط', 'المبلغ', 
            'تاريخ الاستحقاق', 'مدفوع', 'تاريخ الدفع', 'الحالة'
        ];
    } else if (type === 'monthly-report') {
        // تصدير تقرير الأقساط الشهرية
        const report = window.InstallmentSystem.createMonthlyInstallmentReport();
        if (!report) {
            showNotification('حدث خطأ أثناء إنشاء التقرير', 'error');
            return;
        }
        
        data = report.items.map(item => ({
            installmentId: item.installmentId,
            installmentTitle: item.installmentTitle,
            investorName: item.investorName,
            number: item.number,
            amount: item.amount,
            dueDate: item.dueDate,
            isPaid: item.isPaid ? 'نعم' : 'لا',
            paidDate: item.paidDate || '-',
            status: item.isPaid ? 'مدفوع' : (new Date(item.dueDate) < new Date() ? 'متأخر' : 'مستحق')
        }));
        
        filename = `تقرير_الأقساط_الشهرية_${report.date}`;
        headers = [
            'معرف القسط', 'عنوان القسط', 'المستثمر', 'رقم القسط',
            'المبلغ', 'تاريخ الاستحقاق', 'مدفوع', 'تاريخ الدفع', 'الحالة'
        ];
    } else {
        showNotification('نوع التصدير غير صحيح', 'error');
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
        const row = Object.values(item).map(value => {
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

// إضافة الدالة إلى كائن نظام الأقساط
window.InstallmentSystem.exportInstallmentData = exportInstallmentData;

// إضافة أزرار التصدير
function setupExportButtons() {
    // زر تصدير الأقساط
    const exportButton = document.querySelector('#installments-page .btn[title="تصدير"]');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            exportInstallmentData('installments');
        });
    }
}

// إضافة تكامل مع نظام تصدير التقارير
function addReportIntegration() {
    // التحقق من وجود نظام التقارير
    if (document.getElementById('reports-page')) {
        console.log('تكامل مع نظام التقارير...');
        
        // إضافة قسم تقارير الأقساط
        const reportsPage = document.getElementById('reports-page');
        const gridCols = reportsPage.querySelector('.grid-cols-2');
        
        if (gridCols) {
            const installmentReportSection = document.createElement('div');
            installmentReportSection.className = 'section';
            installmentReportSection.innerHTML = `
                <div class="section-header">
                    <h2 class="section-title">تقارير الأقساط</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary btn-sm" id="export-monthly-installment-report">
                            <i class="fas fa-download"></i>
                            <span>تصدير التقرير الشهري</span>
                        </button>
                    </div>
                </div>
                <div class="card bg-light p-3">
                    <h4>تقرير الأقساط الشهرية</h4>
                    <div id="monthly-installment-report-summary">
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </div>
                </div>
            `;
            
            gridCols.appendChild(installmentReportSection);
            
            // إضافة مستمع الحدث لزر التصدير
            const exportButton = document.getElementById('export-monthly-installment-report');
            if (exportButton) {
                exportButton.addEventListener('click', () => {
                    exportInstallmentData('monthly-report');
                });
            }
            
            // تحديث ملخص التقرير الشهري
            updateMonthlyReportSummary();
        }
    }
}

// تحديث ملخص التقرير الشهري
function updateMonthlyReportSummary() {
    const summaryContainer = document.getElementById('monthly-installment-report-summary');
    if (!summaryContainer) return;
    
    // إنشاء التقرير
    const report = window.InstallmentSystem.createMonthlyInstallmentReport();
    
    if (!report) {
        summaryContainer.innerHTML = '<p>لا توجد بيانات متاحة</p>';
        return;
    }
    
    // عرض ملخص التقرير
    summaryContainer.innerHTML = `
        <div class="report-stats">
            <div class="stat-row">
                <div class="stat-label">إجمالي الأقساط:</div>
                <div class="stat-value">${formatCurrency(report.stats.totalDue)}</div>
            </div>
            <div class="stat-row">
                <div class="stat-label">الأقساط المدفوعة:</div>
                <div class="stat-value">${formatCurrency(report.stats.totalPaid)}</div>
            </div>
            <div class="stat-row">
                <div class="stat-label">الأقساط الغير مدفوعة:</div>
                <div class="stat-value">${formatCurrency(report.stats.totalUnpaid)}</div>
            </div>
            <div class="stat-row">
                <div class="stat-label">عدد الأقساط المدفوعة:</div>
                <div class="stat-value">${report.stats.paidCount} من ${report.stats.paidCount + report.stats.unpaidCount}</div>
            </div>
            <div class="stat-row">
                <div class="stat-label">نسبة التحصيل:</div>
                <div class="stat-value">${report.stats.paidPercentage.toFixed(2)}%</div>
            </div>
        </div>
        
        <div class="progress mt-3 mb-3">
            <div class="progress-bar bg-success" style="width: ${report.stats.paidPercentage.toFixed(2)}%">
                ${report.stats.paidPercentage.toFixed(2)}%
            </div>
        </div>
        
        <p class="text-center">
            <small>تم إنشاء التقرير بتاريخ: ${report.date}</small>
        </p>
    `;
}

// إضافة أنماط CSS للتقارير
function addReportStyles() {
    // إضافة أنماط التقارير
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .report-stats {
            margin-top: 20px;
        }
        
        .stat-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #e9ecef;
        }
        
        .stat-label {
            font-weight: bold;
            color: #6c757d;
        }
        
        .stat-value {
            font-weight: bold;
            color: #3b82f6;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// استدعاء دوال التكامل
document.addEventListener('DOMContentLoaded', function() {
    // إضافة تكامل مع نظام الإشعارات
    setTimeout(() => {
        addInstallmentNotifications();
    }, 2000);
    
    // إعداد أزرار التصدير
    setupExportButtons();
    
    // إضافة تكامل مع نظام التقارير
    setTimeout(() => {
        addReportIntegration();
        addReportStyles();
    }, 1500);
    
    // إنشاء وظائف التقارير
    createInstallmentReports();
});