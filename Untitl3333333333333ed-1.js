/**
 * investor-card-system.js
 * نظام بطاقات المستثمرين المتكامل
 * يتيح إنشاء وإدارة وعرض بطاقات ماستر كارد للمستثمرين
 * مع إمكانية قراءة الباركود وعرض المعلومات
 */

// كائن عام لإدارة نظام البطاقات
const InvestorCardSystem = (function() {
    // المتغيرات الخاصة
    let cardTemplate = null;
    let cardScanner = null;
    let isInitialized = false;
    let currentCardId = null;
    
    // ألوان وأنماط البطاقات
    const CARD_STYLES = {
        default: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: '#ffffff',
            accent: '#ffd700',
            pattern: 'circles'
        },
        gold: {
            background: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)',
            color: '#000000',
            accent: '#ffffff',
            pattern: 'lines'
        },
        platinum: {
            background: 'linear-gradient(135deg, #7a7a7a 0%, #c0c0c0 100%)',
            color: '#000000',
            accent: '#0a0a0a',
            pattern: 'dots'
        },
        premium: {
            background: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
            color: '#ffffff',
            accent: '#ff9d00',
            pattern: 'waves'
        }
    };
    
   /**
 * تهيئة نظام البطاقات
 * @returns {Promise} وعد بنجاح أو فشل التهيئة
 */
function initialize() {
    return new Promise((resolve, reject) => {
        if (isInitialized) {
            console.log('نظام البطاقات مهيأ مسبقاً');
            resolve(true);
            return;
        }
        
        console.log('جاري تهيئة نظام بطاقات المستثمرين...');
        
        try {
            // أولاً: إضافة أنماط CSS
            console.log('إضافة أنماط CSS...');
            addCardStyles();
            
            // ثانياً: إضافة عنصر القائمة في الشريط الجانبي
            console.log('إضافة عنصر القائمة في الشريط الجانبي...');
            addSidebarMenuItem();
            
            // ثالثاً: إنشاء صفحة البطاقات
            console.log('إنشاء صفحة البطاقات...');
            createCardsPage();
            
            // رابعاً: إضافة النوافذ المنبثقة اللازمة
            console.log('إضافة النوافذ المنبثقة...');
            addCardModals();
            
            // خامساً: تحميل مكتبات الباركود
            console.log('تحميل مكتبات الباركود...');
            loadBarcodeDependencies()
                .then(() => {
                    // تهيئة قارئ الباركود
                    console.log('تهيئة قارئ الباركود...');
                    initBarcodeScanner();
                    
                    // تحديث الحالة وإكمال التهيئة
                    isInitialized = true;
                    console.log('تم تهيئة نظام بطاقات المستثمرين بنجاح');
                    
                    // عرض البطاقات وتحديث الإحصائيات
                    console.log('عرض البطاقات وتحديث الإحصائيات...');
                    renderInvestorCards();
                    updateCardStatistics();
                    
                    // تحقق إضافي من وجود عنصر القائمة بعد اكتمال التهيئة
                    console.log('التحقق من وجود عنصر القائمة...');
                    verifyMenuItemExists();
                    
                    resolve(true);
                })
                .catch(error => {
                    console.error('فشل في تحميل مكتبات الباركود:', error);
                    // استمر رغم الفشل، ولكن بدون ميزة الباركود
                    isInitialized = true;
                    
                    // عرض البطاقات وتحديث الإحصائيات
                    console.log('عرض البطاقات وتحديث الإحصائيات (بدون ميزة الباركود)...');
                    renderInvestorCards();
                    updateCardStatistics();
                    
                    // تحقق إضافي من وجود عنصر القائمة بعد اكتمال التهيئة
                    console.log('التحقق من وجود عنصر القائمة...');
                    verifyMenuItemExists();
                    
                    resolve(true);
                });
        } catch (error) {
            console.error('خطأ في تهيئة نظام بطاقات المستثمرين:', error);
            reject(error);
        }
    });
}
   /**
 * إضافة عنصر القائمة في الشريط الجانبي
 */
function addSidebarMenuItem() {
    console.log('محاولة إضافة عنصر القائمة في الشريط الجانبي...');
    
    const navList = document.querySelector('.nav-list');
    if (!navList) {
        console.error('لم يتم العثور على قائمة التنقل (.nav-list)');
        
        // محاولة إيجاد أي عنصر قائمة بديلة
        const alternativeNavList = document.querySelector('.sidebar-menu') || 
                                    document.querySelector('.main-menu') ||
                                    document.querySelector('ul.nav');
        
        if (alternativeNavList) {
            console.log('تم العثور على قائمة تنقل بديلة:', alternativeNavList);
            addMenuItemToNavList(alternativeNavList);
            return;
        }
        
        // محاولة أخيرة لإنشاء القائمة إذا لم تكن موجودة
        setTimeout(() => {
            const lateNavList = document.querySelector('.nav-list');
            if (lateNavList) {
                console.log('تم العثور على قائمة التنقل بعد تأخير');
                addMenuItemToNavList(lateNavList);
            } else {
                console.error('فشل العثور على قائمة التنقل حتى بعد التأخير');
            }
        }, 1000);
        
        return;
    }
    
    addMenuItemToNavList(navList);
}

/**
 * إضافة عنصر القائمة إلى قائمة التنقل المحددة
 * @param {HTMLElement} navList عنصر قائمة التنقل
 */
function addMenuItemToNavList(navList) {
    // التحقق من وجود عنصر قائمة البطاقات مسبقاً
    const existingMenuItem = navList.querySelector('a[data-page="investor-cards"]');
    if (existingMenuItem) {
        console.log('عنصر قائمة البطاقات موجود مسبقاً');
        return;
    }
    
    // إنشاء عنصر القائمة
    const menuItem = document.createElement('li');
    menuItem.className = 'nav-item';
    menuItem.innerHTML = `
        <a class="nav-link" data-page="investor-cards" href="#">
            <div class="nav-icon">
                <i class="fas fa-id-card"></i>
            </div>
            <span>بطاقات المستثمرين</span>
        </a>
    `;
    
    // إضافة عنصر القائمة قبل عنصر الإعدادات أو في نهاية القائمة
    const settingsItem = navList.querySelector('[data-page="settings"]')?.parentNode;
    if (settingsItem) {
        navList.insertBefore(menuItem, settingsItem);
        console.log('تم إضافة عنصر القائمة قبل عنصر الإعدادات');
    } else {
        navList.appendChild(menuItem);
        console.log('تم إضافة عنصر القائمة في نهاية القائمة');
    }
    
    // إضافة مستمع الحدث للتنقل
    const navLink = menuItem.querySelector('.nav-link');
    navLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // إزالة الكلاس النشط من جميع الروابط
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // إضافة الكلاس النشط للرابط المحدد
        this.classList.add('active');
        
        // إظهار صفحة البطاقات
        if (typeof showPage === 'function') {
            console.log('استدعاء دالة showPage...');
            showPage('investor-cards');
        } else {
            console.warn('دالة showPage غير متاحة، محاولة إظهار الصفحة مباشرة...');
            
            // محاولة إظهار الصفحة مباشرة
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => {
                page.style.display = 'none';
            });
            
            const cardsPage = document.getElementById('investor-cards-page');
            if (cardsPage) {
                cardsPage.style.display = 'block';
                console.log('تم إظهار صفحة البطاقات مباشرة');
            } else {
                console.error('لم يتم العثور على صفحة البطاقات');
            }
        }
    });
    
    console.log('تم إضافة عنصر قائمة البطاقات بنجاح');
}
    /**
     * إنشاء صفحة البطاقات
     */
    function createCardsPage() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            console.error('لم يتم العثور على عنصر المحتوى الرئيسي');
            return;
        }
        
        // التحقق من وجود الصفحة مسبقاً
        if (document.getElementById('investor-cards-page')) {
            return;
        }
        
        // إنشاء عنصر الصفحة
        const cardsPage = document.createElement('div');
        cardsPage.className = 'page';
        cardsPage.id = 'investor-cards-page';
        
        cardsPage.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">بطاقات المستثمرين</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="card-search-input" placeholder="بحث عن مستثمر..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <button class="btn btn-outline" id="scan-card-btn" title="مسح بطاقة">
                        <i class="fas fa-qrcode"></i>
                        <span>مسح بطاقة</span>
                    </button>
                    <button class="btn btn-primary" id="create-card-btn">
                        <i class="fas fa-plus"></i>
                        <span>إنشاء بطاقة</span>
                    </button>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">بطاقات المستثمرين</h2>
                    <div class="section-actions">
                        <div class="btn-group">
                            <button class="btn btn-outline btn-sm active" data-card-filter="all">الكل</button>
                            <button class="btn btn-outline btn-sm" data-card-filter="active">نشط</button>
                            <button class="btn btn-outline btn-sm" data-card-filter="inactive">غير نشط</button>
                        </div>
                        <button class="btn btn-outline btn-sm" id="print-all-cards-btn" title="طباعة">
                            <i class="fas fa-print"></i>
                            <span>طباعة الكل</span>
                        </button>
                    </div>
                </div>
                
                <div class="cards-container" id="investor-cards-container">
                    <!-- سيتم ملؤها ديناميكيًا -->
                    <div class="empty-cards-message">
                        <i class="fas fa-credit-card"></i>
                        <p>لم يتم إنشاء بطاقات بعد</p>
                        <button class="btn btn-primary btn-sm" id="create-first-card-btn">
                            <i class="fas fa-plus"></i>
                            <span>إنشاء بطاقة جديدة</span>
                        </button>
                    </div>
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
                    <h2 class="section-title">إحصائيات البطاقات</h2>
                </div>
                
                <div class="dashboard-cards">
                    <div class="card stats-card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">إجمالي البطاقات</div>
                                <div class="card-value" id="total-cards-count">0</div>
                            </div>
                            <div class="card-icon primary">
                                <i class="fas fa-credit-card"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card stats-card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">البطاقات النشطة</div>
                                <div class="card-value" id="active-cards-count">0</div>
                            </div>
                            <div class="card-icon success">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card stats-card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">بطاقات منتهية</div>
                                <div class="card-value" id="expired-cards-count">0</div>
                            </div>
                            <div class="card-icon warning">
                                <i class="fas fa-exclamation-circle"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card stats-card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">آخر مسح</div>
                                <div class="card-value" id="last-scan-date">-</div>
                            </div>
                            <div class="card-icon info">
                                <i class="fas fa-qrcode"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى المحتوى الرئيسي
        mainContent.appendChild(cardsPage);
        
        // إضافة مستمعي الأحداث
        setupCardsPageEventListeners();
    }
    
    /**
     * إضافة النوافذ المنبثقة اللازمة
     */
    function addCardModals() {
        // التحقق من وجود النوافذ مسبقاً
        if (document.getElementById('create-card-modal')) {
            return;
        }
        
        // إنشاء نافذة إنشاء البطاقة
        const createCardModal = document.createElement('div');
        createCardModal.className = 'modal-overlay';
        createCardModal.id = 'create-card-modal';
        
        createCardModal.innerHTML = `
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">إنشاء بطاقة مستثمر</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="create-card-form">
                        <div class="form-group">
                            <label class="form-label">المستثمر</label>
                            <select class="form-select" id="card-investor" required>
                                <option value="">اختر المستثمر</option>
                                <!-- سيتم ملؤها ديناميكيًا -->
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">نوع البطاقة</label>
                            <select class="form-select" id="card-type">
                                <option value="default">قياسية</option>
                                <option value="gold">ذهبية</option>
                                <option value="platinum">بلاتينية</option>
                                <option value="premium">بريميوم</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">رقم سري للبطاقة (4 أرقام)</label>
                            <input class="form-input" id="card-pin" type="text" maxlength="4" pattern="[0-9]{4}" placeholder="****" required>
                            <small class="form-hint">أدخل 4 أرقام فقط ليستخدمها المستثمر للتحقق</small>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">تاريخ الانتهاء</label>
                            <input class="form-input" id="card-expiry" type="date" required>
                        </div>
                        
                        <div class="card-preview-container">
                            <h4>معاينة البطاقة</h4>
                            <div class="card-preview" id="card-preview">
                                <!-- سيتم ملؤها ديناميكيًا -->
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-card-btn">إنشاء البطاقة</button>
                </div>
            </div>
        `;
        
        // إنشاء نافذة عرض البطاقة
        const showCardModal = document.createElement('div');
        showCardModal.className = 'modal-overlay';
        showCardModal.id = 'show-card-modal';
        
        showCardModal.innerHTML = `
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تفاصيل البطاقة</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="card-detail-container">
                        <div class="card-full-view" id="card-full-view">
                            <!-- سيتم ملؤها ديناميكيًا -->
                        </div>
                        
                        <div class="investor-card-details" id="investor-card-details">
                            <!-- سيتم ملؤها ديناميكيًا -->
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                    <div class="btn-group">
                        <button class="btn btn-primary" id="edit-card-btn">
                            <i class="fas fa-edit"></i>
                            <span>تعديل</span>
                        </button>
                        <button class="btn btn-warning" id="renew-card-btn">
                            <i class="fas fa-sync-alt"></i>
                            <span>تجديد</span>
                        </button>
                        <button class="btn btn-success" id="print-card-btn">
                            <i class="fas fa-print"></i>
                            <span>طباعة</span>
                        </button>
                        <button class="btn btn-info" id="share-card-btn">
                            <i class="fas fa-share-alt"></i>
                            <span>مشاركة</span>
                        </button>
                        <button class="btn btn-danger" id="deactivate-card-btn">
                            <i class="fas fa-ban"></i>
                            <span>إيقاف</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // إنشاء نافذة مسح الباركود
        const scanCardModal = document.createElement('div');
        scanCardModal.className = 'modal-overlay';
        scanCardModal.id = 'scan-card-modal';
        
        scanCardModal.innerHTML = `
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">مسح باركود البطاقة</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="barcode-scanner-container">
                        <div id="barcode-scanner-region">
                            <div class="scanner-overlay">
                                <div class="scanner-reticle"></div>
                                <div class="scanner-instructions">ضع الباركود في هذه المنطقة</div>
                            </div>
                            <video id="scanner-video" class="scanner-video"></video>
                        </div>
                        <div class="scanner-controls">
                            <button id="toggle-flash-btn" class="btn btn-sm btn-outline">
                                <i class="fas fa-bolt"></i>
                                <span>الفلاش</span>
                            </button>
                            <button id="toggle-camera-btn" class="btn btn-sm btn-outline">
                                <i class="fas fa-camera"></i>
                                <span>تبديل الكاميرا</span>
                            </button>
                        </div>
                        <div id="scan-result" class="scan-result"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="manual-entry-btn">
                        <i class="fas fa-keyboard"></i>
                        <span>إدخال يدوي</span>
                    </button>
                </div>
            </div>
        `;
        
        // إضافة النوافذ إلى الصفحة
        document.body.appendChild(createCardModal);
        document.body.appendChild(showCardModal);
        document.body.appendChild(scanCardModal);
        
        // إضافة مستمعي الأحداث
        setupCardModalsEventListeners();
    }
    
    /**
     * إضافة أنماط CSS
     */
    function addCardStyles() {
        // التحقق من وجود الأنماط مسبقاً
        if (document.getElementById('investor-card-styles')) {
            return;
        }
        
        // إنشاء عنصر النمط
        const styleElement = document.createElement('style');
        styleElement.id = 'investor-card-styles';
        
        // تحديد الأنماط
        styleElement.textContent = `
            /* أنماط صفحة البطاقات */
            .cards-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .empty-cards-message {
                grid-column: 1 / -1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                background-color: rgba(0, 0, 0, 0.02);
                border-radius: 10px;
                text-align: center;
            }
            
            .empty-cards-message i {
                font-size: 48px;
                margin-bottom: 16px;
                color: var(--color-primary);
                opacity: 0.5;
            }
            
            .empty-cards-message p {
                font-size: 16px;
                margin-bottom: 16px;
                color: #666;
            }
            
            /* أنماط البطاقة */
            .investor-card {
                position: relative;
                width: 100%;
                aspect-ratio: 1.586;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                cursor: pointer;
                transition: all 0.3s ease;
                backface-visibility: hidden;
                transform-style: preserve-3d;
            }
            
            .investor-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
            }
            
            .investor-card-inner {
                width: 100%;
                height: 100%;
                position: relative;
                transition: transform 0.8s;
                transform-style: preserve-3d;
            }
            
            .investor-card.flipped .investor-card-inner {
                transform: rotateY(180deg);
            }
            
            .investor-card-front, .investor-card-back {
                position: absolute;
                width: 100%;
                height: 100%;
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
                display: flex;
                flex-direction: column;
                padding: 16px;
                box-sizing: border-box;
            }
            
            .investor-card-back {
                transform: rotateY(180deg);
                background-color: #f0f0f0;
                color: #333;
            }
            
            /* الأنماط المختلفة للبطاقة */
            .investor-card.default .investor-card-front {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                color: #ffffff;
            }
            
            .investor-card.gold .investor-card-front {
                background: linear-gradient(135deg, #b8860b 0%, #daa520 100%);
                color: #000000;
            }
            
            .investor-card.platinum .investor-card-front {
                background: linear-gradient(135deg, #7a7a7a 0%, #c0c0c0 100%);
                color: #000000;
            }
            
            .investor-card.premium .investor-card-front {
                background: linear-gradient(135deg, #000428 0%, #004e92 100%);
                color: #ffffff;
            }
            
            /* أنماط عناصر البطاقة */
            .card-chip {
                position: absolute;
                top: 70px;
                right: 20px;
                width: 40px;
                height: 30px;
                background-color: #ffd700;
                border-radius: 5px;
                background-image: linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent);
                background-size: 8px 8px;
            }
            
            .card-number {
                font-size: 19px;
                letter-spacing: 2px;
                margin-top: 50px;
                text-align: center;
                font-family: 'Courier New', monospace;
                font-weight: bold;
            }
            
            .card-details {
                margin-top: auto;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
            }
            
            .card-holder {
                text-transform: uppercase;
                font-weight: bold;
            }
            
            .card-holder-name {
                font-size: 14px;
            }
            
            .card-expires {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }
            
            .expires-label {
                font-size: 9px;
                text-transform: uppercase;
            }
            
            .expires-date {
                font-size: 14px;
            }
            
            .card-logo {
                position: absolute;
                top: 20px;
                left: 20px;
                height: 40px;
                display: flex;
                align-items: center;
            }
            
            .card-logo img {
                height: 100%;
            }
            
            .card-logo-text {
                font-size: 14px;
                font-weight: bold;
                margin-left: 6px;
                text-transform: uppercase;
            }
            
            .card-type {
                position: absolute;
                bottom: 20px;
                right: 20px;
                font-size: 14px;
                font-weight: bold;
                color: rgba(255, 255, 255, 0.7);
                text-transform: uppercase;
            }
            
            .card-pattern {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0.05;
                pointer-events: none;
            }
            
            /* أنماط الوجه الخلفي للبطاقة */
            .card-magnetic-stripe {
                width: 100%;
                height: 40px;
                background-color: #111;
                margin: 20px 0;
            }
            
            .card-signature {
                height: 40px;
                background-color: #fff;
                display: flex;
                align-items: center;
                padding: 0 10px;
                margin-top: 15px;
            }
            
            .card-signature-text {
                font-family: 'Brush Script MT', cursive;
                color: #555;
                font-size: 20px;
            }
            
            .card-cvv {
                position: absolute;
                bottom: 20px;
                right: 20px;
                font-size: 12px;
                background-color: #fff;
                color: #000;
                padding: 2px 5px;
                border-radius: 3px;
            }
            
            .card-barcode-container {
                margin-top: auto;
                width: 100%;
                text-align: center;
            }
            
            .card-barcode {
                max-width: 90%;
                margin: 0 auto;
            }
            
            .card-barcode-number {
                font-size: 10px;
                margin-top: 2px;
                font-family: 'Courier New', monospace;
            }
            
            /* أنماط معاينة البطاقة */
            .card-preview-container {
                margin-top: 20px;
                border-top: 1px solid #eee;
                padding-top: 15px;
            }
            
            .card-preview-container h4 {
                margin-bottom: 10px;
                font-size: 14px;
                color: #666;
            }
            
            .card-preview {
                transform: scale(0.8);
                transform-origin: center top;
                margin-bottom: -40px;
            }
            
            /* أنماط عرض البطاقة */
            .card-detail-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .card-full-view {
                width: 100%;
            }
            
            .investor-card-details {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .investor-detail-section {
                background-color: #f8f9fa;
                border-radius: 10px;
                padding: 15px;
            }
            
            .investor-detail-section h4 {
                margin-bottom: 10px;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
                color: var(--color-primary);
            }
            
            .investor-detail-row {
                display: flex;
                margin-bottom: 8px;
            }
            
            .investor-detail-label {
                flex: 1;
                font-weight: bold;
                color: #666;
            }
            
            .investor-detail-value {
                flex: 2;
                color: #333;
            }
            
            /* أنماط نافذة المسح */
            .barcode-scanner-container {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            #barcode-scanner-region {
                position: relative;
                width: 100%;
                max-width: 500px;
                height: 300px;
                overflow: hidden;
                border-radius: 10px;
                margin: 0 auto;
                background-color: #000;
            }
            
            .scanner-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .scanner-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1;
                pointer-events: none;
            }
            
            .scanner-reticle {
                width: 200px;
                height: 200px;
                border: 2px solid rgba(0, 255, 0, 0.5);
                border-radius: 5px;
                position: relative;
            }
            
            .scanner-reticle::before,
            .scanner-reticle::after {
                content: '';
                position: absolute;
                width: 50px;
                height: 50px;
                border-color: #00ff00;
                border-style: solid;
                border-width: 0;
            }
            
            .scanner-reticle::before {
                top: -2px;
                left: -2px;
                border-top-width: 2px;
                border-left-width: 2px;
            }
            
            .scanner-reticle::after {
                bottom: -2px;
                right: -2px;
                border-bottom-width: 2px;
                border-right-width: 2px;
            }
            
            .scanner-instructions {
                position: absolute;
                bottom: 20px;
                color: #fff;
                text-align: center;
                background-color: rgba(0, 0, 0, 0.6);
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 14px;
            }
            
            .scanner-controls {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 15px;
                width: 100%;
            }
            
            .scan-result {
                margin-top: 15px;
                padding: 10px;
                width: 100%;
                max-width: 500px;
                text-align: center;
                display: none;
            }
            
            .scan-result.success {
                display: block;
                color: #155724;
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 5px;
            }
            
            .scan-result.error {
                display: block;
                color: #721c24;
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 5px;
            }
            
            /* أنماط البطاقات المطبوعة */
            @media print {
                body * {
                    visibility: hidden;
                }
                
                .print-card, .print-card * {
                    visibility: visible;
                }
                
                .print-card {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 85.6mm;
                    height: 53.98mm;
                    box-shadow: none;
                    page-break-after: always;
                }
                
                /* تأكد من طباعة الباركود بشكل صحيح */
                .card-barcode-container, .card-barcode, .card-barcode-number {
                    visibility: visible !important;
                    display: block !important;
                }
                
                /* تأكد من طباعة جميع العناصر */
                .investor-card-front *, .investor-card-back * {
                    visibility: visible !important;
                }
            }
            
            /* تحسينات لمشكلة الباركود */
            .card-barcode-container svg, 
            .card-barcode svg, 
            .card-barcode-container canvas, 
            .card-barcode canvas {
                max-width: 100%;
                height: auto;
                margin: 0 auto;
                display: block;
            }
            
            /* أنماط البطاقة غير النشطة */
            .investor-card.inactive .investor-card-front:before {
                content: "غير نشطة";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-30deg);
                font-size: 2rem;
                font-weight: bold;
                color: rgba(255, 0, 0, 0.7);
                border: 3px solid rgba(255, 0, 0, 0.7);
                padding: 5px 15px;
                border-radius: 5px;
                z-index: 10;
            }
            
            /* تنسيق نافذة مشاركة البطاقة */
            .card-share-options {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 10px;
            }
            
            .card-share-option {
                display: flex;
                align-items: center;
                padding: 10px;
                background-color: #fff;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid #ddd;
            }
            
            .card-share-option:hover {
                background-color: #f0f4ff;
                transform: translateY(-2px);
            }
            
            .card-share-option i {
                font-size: 1.5rem;
                margin-left: 10px;
                width: 40px;
                text-align: center;
            }
            
            .card-share-option-details {
                flex: 1;
            }
            
            .card-share-option-title {
                font-weight: bold;
                color: #333;
            }
            
            .card-share-option-desc {
                font-size: 0.8rem;
                color: #666;
            }
            
            /* تأثيرات حركية للبطاقة */
            .investor-card {
                position: relative;
                overflow: hidden;
            }
            
            .investor-card::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.7s ease;
            }
            
            .investor-card:hover::after {
                left: 100%;
            }
            
            .card-inactive-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: rgba(0, 0, 0, 0.5);
                color: white;
                font-size: 2rem;
                font-weight: bold;
                transform: rotate(-25deg);
                z-index: 10;
            }
            
            /* تحسين عرض صندوق النسخ */
            .copy-text-box {
                position: relative;
                padding: 10px;
                background-color: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 5px;
                margin-bottom: 10px;
            }
            
            .copy-text-box textarea {
                width: 100%;
                min-height: 120px;
                border: none;
                background: transparent;
                font-family: monospace;
                direction: ltr;
                resize: none;
            }
            
            .copy-btn {
                position: absolute;
                top: 5px;
                left: 5px;
                background-color: #fff;
                border: 1px solid #ddd;
                border-radius: 3px;
                padding: 3px 8px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .copy-btn:hover {
                background-color: #f0f4ff;
            }
            
            /* تحسينات للطباعة */
            .print-card {
                width: 85.6mm !important;
                height: 53.98mm !important;
                background-color: white;
                position: relative;
                margin: 20px auto;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
        `;
        
        // إضافة النمط إلى الصفحة
        document.head.appendChild(styleElement);
    }
    
    /**
     * تحميل التبعيات اللازمة للباركود
     * @returns {Promise} وعد بنجاح أو فشل التحميل
     */
    function loadBarcodeDependencies() {
        return new Promise((resolve, reject) => {
            // التحقق من وجود المكتبات مسبقاً
            if (window.QRCode && window.JsBarcode && window.Quagga) {
                console.log('مكتبات الباركود محملة مسبقاً');
                resolve(true);
                return;
            }
            
            // تحميل مكتبة QR Code
            const qrScript = document.createElement('script');
            qrScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            qrScript.onload = () => {
                console.log('تم تحميل مكتبة QR Code بنجاح');
                
                // تحميل مكتبة JsBarcode
                const barcodeScript = document.createElement('script');
                barcodeScript.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
                barcodeScript.onload = () => {
                    console.log('تم تحميل مكتبة JsBarcode بنجاح');
                    
                    // تحميل مكتبة QuaggaJS لقراءة الباركود
                    const quaggaScript = document.createElement('script');
                    quaggaScript.src = 'https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.8.2/dist/quagga.min.js';
                    quaggaScript.onload = () => {
                        console.log('تم تحميل مكتبة QuaggaJS بنجاح');
                        resolve(true);
                    };
                    quaggaScript.onerror = (error) => {
                        console.error('فشل في تحميل مكتبة QuaggaJS:', error);
                        // محاولة استخدام النسخة الأصلية إذا فشلت النسخة المُحدثة
                        const fallbackQuaggaScript = document.createElement('script');
                        fallbackQuaggaScript.src = 'https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js';
                        fallbackQuaggaScript.onload = () => {
                            console.log('تم تحميل النسخة البديلة من مكتبة Quagga بنجاح');
                            resolve(true);
                        };
                        fallbackQuaggaScript.onerror = () => {
                            console.error('فشل في تحميل النسخة البديلة من مكتبة Quagga');
                            // نجاح رغم الفشل في تحميل مكتبة Quagga
                            resolve(true);
                        };
                        document.head.appendChild(fallbackQuaggaScript);
                    };
                    document.head.appendChild(quaggaScript);
                };
                barcodeScript.onerror = (error) => {
                    console.error('فشل في تحميل مكتبة JsBarcode:', error);
                    reject(error);
                };
                document.head.appendChild(barcodeScript);
            };
            qrScript.onerror = (error) => {
                console.error('فشل في تحميل مكتبة QR Code:', error);
                reject(error);
            };
            document.head.appendChild(qrScript);
        });
    }
    
    /**
     * تهيئة ماسح الباركود
     */
    function initBarcodeScanner() {
        if (typeof Quagga === 'undefined') {
            console.error('مكتبة Quagga غير متاحة');
            return;
        }
        
        cardScanner = {
            init: function(containerId) {
                const config = {
                    inputStream: {
                        name: "Live",
                        type: "LiveStream",
                        target: document.querySelector(`#${containerId} video`),
                        constraints: {
                            facingMode: "environment"
                        },
                    },
                    locator: {
                        patchSize: "medium",
                        halfSample: true
                    },
                    numOfWorkers: 2,
                    decoder: {
                        readers: ["code_128_reader", "ean_reader", "ean_8_reader", "qr_code_reader"]
                    },
                    locate: true
                };
                
                Quagga.init(config, (err) => {
                    if (err) {
                        console.error('Error initializing Quagga:', err);
                        document.querySelector('#scan-result').textContent = 'حدث خطأ في تهيئة الماسح الضوئي';
                        document.querySelector('#scan-result').classList.add('error');
                        return;
                    }
                    
                    Quagga.start();
                    
                    Quagga.onDetected((result) => {
                        const code = result.codeResult.code;
                        if (code) {
                            this.onDetect(code);
                        }
                    });
                });
            },
            
            onDetect: function(code) {
                const resultElement = document.querySelector('#scan-result');
                resultElement.textContent = `تم العثور على الرمز: ${code}`;
                resultElement.classList.add('success');
                
                // إيقاف المسح بعد اكتشاف الرمز
                Quagga.stop();
                
                // البحث عن البطاقة بالرمز
                const card = this.findCardByBarcode(code);
                if (card) {
                    // تحديث وقت آخر مسح
                    updateLastScanDate();
                    
                    // إغلاق نافذة المسح
                    closeModal('scan-card-modal');
                    
                    // عرض بيانات البطاقة
                    showCardDetails(card.id);
                } else {
                    resultElement.textContent = `لم يتم العثور على بطاقة بالرمز: ${code}`;
                    resultElement.classList.remove('success');
                    resultElement.classList.add('error');
                    
                    // إعادة تشغيل المسح بعد فترة
                    setTimeout(() => {
                        resultElement.textContent = '';
                        resultElement.classList.remove('error');
                        Quagga.start();
                    }, 3000);
                }
            },
            
            findCardByBarcode: function(code) {
                // البحث في التخزين المحلي عن البطاقة
                const cards = getInvestorCards();
                return cards.find(card => card.barcode === code);
            },
            
            toggleCamera: function() {
                Quagga.stop();
                
                // تبديل الكاميرا الأمامية/الخلفية
                const currentFacingMode = Quagga.CameraAccess.getActiveTrack().getSettings().facingMode;
                const newFacingMode = currentFacingMode === "environment" ? "user" : "environment";
                
                const config = {
                    ...Quagga.getConfig(),
                    inputStream: {
                        ...Quagga.getConfig().inputStream,
                        constraints: {
                            ...Quagga.getConfig().inputStream.constraints,
                            facingMode: newFacingMode
                        }
                    }
                };
                
                Quagga.init(config, (err) => {
                    if (err) {
                        console.error('Error initializing Quagga with new camera:', err);
                        return;
                    }
                    Quagga.start();
                });
            },
            
            toggleFlash: function() {
                const track = Quagga.CameraAccess.getActiveTrack();
                if (track && track.getCapabilities().torch) {
                    track.applyConstraints({
                        advanced: [{torch: !track.getConstraints().advanced?.[0]?.torch}]
                    });
                } else {
                    console.log('الفلاش غير متاح في هذا الجهاز');
                }
            }
        };
    }
    
    /**
     * إعداد مستمعي الأحداث لصفحة البطاقات
     */
    function setupCardsPageEventListeners() {
        // زر إنشاء بطاقة
        const createCardBtn = document.getElementById('create-card-btn');
        if (createCardBtn) {
            createCardBtn.addEventListener('click', () => {
                openCreateCardModal();
            });
        }
        
        // زر إنشاء البطاقة الأولى
        const createFirstCardBtn = document.getElementById('create-first-card-btn');
        if (createFirstCardBtn) {
            createFirstCardBtn.addEventListener('click', () => {
                openCreateCardModal();
            });
        }
        
        // زر مسح البطاقة
        const scanCardBtn = document.getElementById('scan-card-btn');
        if (scanCardBtn) {
            scanCardBtn.addEventListener('click', () => {
                openScanCardModal();
            });
        }
        
        // زر طباعة جميع البطاقات
        const printAllCardsBtn = document.getElementById('print-all-cards-btn');
        if (printAllCardsBtn) {
            printAllCardsBtn.addEventListener('click', () => {
                printAllCards();
            });
        }
        
        // أزرار تصفية البطاقات
        const cardFilterButtons = document.querySelectorAll('[data-card-filter]');
        cardFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // إزالة الفئة النشطة من جميع الأزرار
                cardFilterButtons.forEach(btn => btn.classList.remove('active'));
                
                // إضافة الفئة النشطة للزر المحدد
                button.classList.add('active');
                
                // تصفية البطاقات
                const filterType = button.getAttribute('data-card-filter');
                filterCards(filterType);
            });
        });
        
        // مربع البحث
        const searchInput = document.getElementById('card-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchText = searchInput.value.trim().toLowerCase();
                searchCards(searchText);
            });
        }
    }
    
    /**
     * إعداد مستمعي الأحداث للنوافذ المنبثقة
     */
    function setupCardModalsEventListeners() {
        // إغلاق النوافذ المنبثقة
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal-overlay');
                if (modal) {
                    closeModal(modal.id);
                }
            });
        });
        
        // مستمعي أحداث نافذة إنشاء البطاقة
        setupCreateCardModalListeners();
        
        // مستمعي أحداث نافذة عرض البطاقة
        setupShowCardModalListeners();
        
        // مستمعي أحداث نافذة مسح الباركود
        setupScanCardModalListeners();
    }
    
    /**
     * إعداد مستمعي الأحداث لنافذة إنشاء البطاقة
     */
    function setupCreateCardModalListeners() {
        // اختيار المستثمر
        const cardInvestorSelect = document.getElementById('card-investor');
        if (cardInvestorSelect) {
            cardInvestorSelect.addEventListener('change', () => {
                updateCardPreview();
            });
        }
        
        // تغيير نوع البطاقة
        const cardTypeSelect = document.getElementById('card-type');
        if (cardTypeSelect) {
            cardTypeSelect.addEventListener('change', () => {
                updateCardPreview();
            });
        }
        
        // تغيير الرقم السري
        const cardPinInput = document.getElementById('card-pin');
        if (cardPinInput) {
            cardPinInput.addEventListener('input', () => {
                // التأكد من أن القيمة هي أرقام فقط
                cardPinInput.value = cardPinInput.value.replace(/[^0-9]/g, '');
                
                // تحديث المعاينة
                updateCardPreview();
            });
        }
        
        // تغيير تاريخ الانتهاء
        const cardExpiryInput = document.getElementById('card-expiry');
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('change', () => {
                updateCardPreview();
            });
            
            // تعيين التاريخ الافتراضي لتكون سنة من الآن
            const defaultDate = new Date();
            defaultDate.setFullYear(defaultDate.getFullYear() + 1);
            const defaultDateString = defaultDate.toISOString().split('T')[0];
            cardExpiryInput.value = defaultDateString;
        }
        
        // حفظ البطاقة
        const saveCardBtn = document.getElementById('save-card-btn');
        if (saveCardBtn) {
            saveCardBtn.addEventListener('click', () => {
                createCard();
            });
        }
    }
    
    /**
     * إعداد مستمعي الأحداث لنافذة عرض البطاقة
     */
    function setupShowCardModalListeners() {
        // زر تعديل البطاقة
        const editCardBtn = document.getElementById('edit-card-btn');
        if (editCardBtn) {
            editCardBtn.addEventListener('click', () => {
                editCurrentCard();
            });
        }
        
        // زر تجديد البطاقة
        const renewCardBtn = document.getElementById('renew-card-btn');
        if (renewCardBtn) {
            renewCardBtn.addEventListener('click', () => {
                renewCurrentCard();
            });
        }
        
        // زر طباعة البطاقة
        const printCardBtn = document.getElementById('print-card-btn');
        if (printCardBtn) {
            printCardBtn.addEventListener('click', () => {
                printCurrentCard();
            });
        }
        
        // زر مشاركة البطاقة
        const shareCardBtn = document.getElementById('share-card-btn');
        if (shareCardBtn) {
            shareCardBtn.addEventListener('click', () => {
                shareCurrentCard();
            });
        }
        
        // زر إيقاف البطاقة
        const deactivateCardBtn = document.getElementById('deactivate-card-btn');
        if (deactivateCardBtn) {
            deactivateCardBtn.addEventListener('click', () => {
                deactivateCurrentCard();
            });
        }
    }
    
    /**
     * إعداد مستمعي الأحداث لنافذة مسح الباركود
     */
    function setupScanCardModalListeners() {
        // زر تبديل الكاميرا
        const toggleCameraBtn = document.getElementById('toggle-camera-btn');
        if (toggleCameraBtn) {
            toggleCameraBtn.addEventListener('click', () => {
                if (cardScanner) {
                    cardScanner.toggleCamera();
                }
            });
        }
        
        // زر تشغيل/إيقاف الفلاش
        const toggleFlashBtn = document.getElementById('toggle-flash-btn');
        if (toggleFlashBtn) {
            toggleFlashBtn.addEventListener('click', () => {
                if (cardScanner) {
                    cardScanner.toggleFlash();
                }
            });
        }
        
        // زر الإدخال اليدوي
        const manualEntryBtn = document.getElementById('manual-entry-btn');
        if (manualEntryBtn) {
            manualEntryBtn.addEventListener('click', () => {
                // طلب الإدخال اليدوي للرمز
                const code = prompt('يرجى إدخال رمز البطاقة يدويًا:');
                if (code) {
                    // البحث عن البطاقة بالرمز
                    if (cardScanner) {
                        cardScanner.onDetect(code);
                    }
                }
            });
        }
    }
    
    /**
     * فتح نافذة إنشاء البطاقة
     */
    function openCreateCardModal() {
        const modal = document.getElementById('create-card-modal');
        if (!modal) {
            console.error('لم يتم العثور على النافذة');
            return;
        }
        
        // إعادة تعيين النموذج
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        // تعيين القيم الافتراضية
        const cardExpiryInput = document.getElementById('card-expiry');
        if (cardExpiryInput) {
            const defaultDate = new Date();
            defaultDate.setFullYear(defaultDate.getFullYear() + 1);
            const defaultDateString = defaultDate.toISOString().split('T')[0];
            cardExpiryInput.value = defaultDateString;
        }
        
        // ملء قائمة المستثمرين
        fillInvestorSelect();
        
        // تحديث معاينة البطاقة
        updateCardPreview();
        
        // فتح النافذة
        modal.classList.add('active');
    }
    
    /**
     * فتح نافذة عرض البطاقة
     * @param {string} cardId معرف البطاقة
     */
    function openShowCardModal(cardId) {
        const modal = document.getElementById('show-card-modal');
        if (!modal) {
            console.error('لم يتم العثور على النافذة');
            return;
        }
        
        // حفظ معرف البطاقة الحالية
        currentCardId = cardId;
        
        // عرض تفاصيل البطاقة
        showCardDetails(cardId);
        
        // فتح النافذة
        modal.classList.add('active');
    }
    
    /**
     * فتح نافذة مسح الباركود
     */
    function openScanCardModal() {
        const modal = document.getElementById('scan-card-modal');
        if (!modal) {
            console.error('لم يتم العثور على النافذة');
            return;
        }
        
        // إعادة تعيين نتيجة المسح
        const resultElement = document.getElementById('scan-result');
        if (resultElement) {
            resultElement.textContent = '';
            resultElement.className = 'scan-result';
        }
        
        // فتح النافذة
        modal.classList.add('active');
        
        // بدء المسح
        if (cardScanner) {
            setTimeout(() => {
                cardScanner.init('barcode-scanner-region');
            }, 500);
        } else {
            console.error('ماسح الباركود غير متاح');
            
            // عرض رسالة خطأ
            if (resultElement) {
                resultElement.textContent = 'ماسح الباركود غير متاح، يرجى إعادة تحميل الصفحة';
                resultElement.classList.add('error');
            }
        }
    }
    
    /**
     * إغلاق النافذة المنبثقة
     * @param {string} modalId معرف النافذة
     */
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            
            // إيقاف الماسح إذا كانت نافذة المسح
            if (modalId === 'scan-card-modal' && typeof Quagga !== 'undefined') {
                Quagga.stop();
            }
        }
    }
    
    /**
     * ملء قائمة المستثمرين
     */
    function fillInvestorSelect() {
        const select = document.getElementById('card-investor');
        if (!select) return;
        
        // مسح الخيارات الحالية
        select.innerHTML = '<option value="">اختر المستثمر</option>';
        
        // الحصول على المستثمرين
        if (typeof investors === 'undefined' || !Array.isArray(investors)) {
            console.error('مصفوفة المستثمرين غير متاحة');
            return;
        }
        
        // ترتيب المستثمرين حسب الاسم
        const sortedInvestors = [...investors].sort((a, b) => 
            a.name.localeCompare(b.name, 'ar')
        );
        
        // إضافة الخيارات
        sortedInvestors.forEach(investor => {
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = `${investor.name} (${investor.phone})`;
            select.appendChild(option);
        });
    }
    
    /**
     * تحديث معاينة البطاقة
     */
    function updateCardPreview() {
        const previewContainer = document.getElementById('card-preview');
        if (!previewContainer) return;
        
        // الحصول على قيم النموذج
        const investorId = document.getElementById('card-investor').value;
        const cardType = document.getElementById('card-type').value;
        const cardPin = document.getElementById('card-pin').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        
        // التحقق من وجود مستثمر مختار
        if (!investorId) {
            previewContainer.innerHTML = '<div class="empty-preview">يرجى اختيار مستثمر لعرض المعاينة</div>';
            return;
        }
        
        // البحث عن المستثمر
        const investor = investors.find(inv => inv.id === investorId);
        if (!investor) {
            console.error('لم يتم العثور على المستثمر');
            return;
        }
        
        // إنشاء رقم بطاقة فريد
        const cardNumber = generateCardNumber(investor.id);
        
        // تحويل تاريخ الانتهاء إلى الصيغة المناسبة
        let expMonth = '';
        let expYear = '';
        if (cardExpiry) {
            const date = new Date(cardExpiry);
            expMonth = (date.getMonth() + 1).toString().padStart(2, '0');
            expYear = date.getFullYear().toString().substr(2);
        }
        
        // إنشاء عنصر البطاقة
        previewContainer.innerHTML = `
            <div class="investor-card ${cardType}">
                <div class="investor-card-inner">
                    <div class="investor-card-front">
                        <div class="card-logo">
                            <i class="fas fa-university"></i>
                            <span class="card-logo-text">InvestCard</span>
                        </div>
                        <div class="card-chip"></div>
                        <div class="card-number">
                            ${formatCardNumber(cardNumber)}
                        </div>
                        <div class="card-details">
                            <div class="card-holder">
                                <div class="card-holder-label">حامل البطاقة</div>
                                <div class="card-holder-name">${investor.name}</div>
                            </div>
                            <div class="card-expires">
                                <div class="expires-label">تنتهي في</div>
                                <div class="expires-date">${expMonth}/${expYear}</div>
                            </div>
                        </div>
                        <div class="card-type">
                            ${getCardTypeArabic(cardType)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * إنشاء بطاقة جديدة
     */
    function createCard() {
        // الحصول على قيم النموذج
        const investorId = document.getElementById('card-investor').value;
        const cardType = document.getElementById('card-type').value;
        const cardPin = document.getElementById('card-pin').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        
        // التحقق من صحة البيانات
        if (!investorId) {
            showNotification('يرجى اختيار المستثمر', 'error');
            return;
        }
        
        if (!cardPin || cardPin.length !== 4 || !/^\d{4}$/.test(cardPin)) {
            showNotification('يرجى إدخال رقم سري مكون من 4 أرقام', 'error');
            return;
        }
        
        if (!cardExpiry) {
            showNotification('يرجى تحديد تاريخ انتهاء البطاقة', 'error');
            return;
        }
        
        // البحث عن المستثمر
        const investor = investors.find(inv => inv.id === investorId);
        if (!investor) {
            showNotification('لم يتم العثور على المستثمر', 'error');
            return;
        }
        
        // التحقق مما إذا كان المستثمر لديه بطاقة بالفعل
        const existingCards = getInvestorCards();
        const existingCard = existingCards.find(card => card.investorId === investorId && card.status === 'active');
        
        if (existingCard) {
            const confirm = window.confirm('هذا المستثمر لديه بطاقة نشطة بالفعل. هل تريد إنشاء بطاقة جديدة؟');
            if (!confirm) {
                return;
            }
            
            // تعطيل البطاقة القديمة
            existingCard.status = 'inactive';
            existingCard.deactivatedAt = new Date().toISOString();
            
            // تحديث البطاقات
            saveInvestorCards(existingCards);
        }
        
        // إنشاء رقم بطاقة فريد
        const cardNumber = generateCardNumber(investor.id);
        
        // إنشاء رمز الأمان CVV
        const cvv = generateCVV();
        
        // إنشاء كود الباركود
        const barcode = generateBarcode(investor.id);
        
        // إنشاء بيانات البطاقة
        const newCard = {
            id: 'card_' + Date.now().toString(),
            investorId: investor.id,
            cardNumber: cardNumber,
            cardType: cardType,
            pin: cardPin,
            cvv: cvv,
            barcode: barcode,
            investorName: investor.name,
            investorPhone: investor.phone,
            createdAt: new Date().toISOString(),
            expiryDate: cardExpiry,
            status: 'active',
            lastUsed: null
        };
        
        // إضافة البطاقة إلى قائمة البطاقات
        const cards = getInvestorCards();
        cards.push(newCard);
        saveInvestorCards(cards);

        // إغلاق النافذة المنبثقة
        closeModal('create-card-modal');

        // تحديث عرض البطاقات
        renderInvestorCards();

        // تحديث الإحصائيات
        updateCardStatistics();

        // عرض رسالة نجاح
        showNotification('تم إنشاء بطاقة المستثمر بنجاح', 'success');
    }

    /**
     * عرض تفاصيل البطاقة
     * @param {string} cardId معرف البطاقة
     */
    function showCardDetails(cardId) {
        // البحث عن البطاقة
        const cards = getInvestorCards();
        const card = cards.find(c => c.id === cardId);
        
        if (!card) {
            console.error('لم يتم العثور على البطاقة');
            return;
        }
        
        // البحث عن المستثمر
        const investor = investors.find(inv => inv.id === card.investorId);
        
        // تحديث عنوان النافذة
        const modalTitle = document.querySelector('#show-card-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = `بطاقة المستثمر - ${card.investorName}`;
        }
        
        // عرض البطاقة
        const cardView = document.getElementById('card-full-view');
        if (cardView) {
            renderCardHTML(cardView, card);
        }
        
        // عرض تفاصيل المستثمر
        const detailsView = document.getElementById('investor-card-details');
        if (detailsView) {
            let detailsHTML = `
                <div class="investor-detail-section">
                    <h4>معلومات المستثمر</h4>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">الاسم:</div>
                        <div class="investor-detail-value">${card.investorName}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">رقم الهاتف:</div>
                        <div class="investor-detail-value">${card.investorPhone}</div>
                    </div>
            `;
            
            // إضافة معلومات إضافية إذا كان المستثمر موجودًا
            if (investor) {
                detailsHTML += `
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">العنوان:</div>
                        <div class="investor-detail-value">${investor.address || '-'}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">رقم البطاقة الشخصية:</div>
                        <div class="investor-detail-value">${investor.cardNumber || '-'}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">تاريخ الانضمام:</div>
                        <div class="investor-detail-value">${formatDate(investor.joinDate || investor.createdAt)}</div>
                    </div>
                `;
            }
            
            detailsHTML += `
                </div>
                
                <div class="investor-detail-section">
                    <h4>معلومات البطاقة</h4>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">رقم البطاقة:</div>
                        <div class="investor-detail-value">${formatCardNumber(card.cardNumber)}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">نوع البطاقة:</div>
                        <div class="investor-detail-value">${getCardTypeArabic(card.cardType)}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">تاريخ الإصدار:</div>
                        <div class="investor-detail-value">${formatDate(card.createdAt)}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">تاريخ الانتهاء:</div>
                        <div class="investor-detail-value">${formatDate(card.expiryDate)}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">الحالة:</div>
                        <div class="investor-detail-value">${getCardStatusArabic(card.status)}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">آخر استخدام:</div>
                        <div class="investor-detail-value">${card.lastUsed ? formatDate(card.lastUsed) : 'لم تستخدم بعد'}</div>
                    </div>
                </div>
            `;
            
            // إضافة معلومات الاستثمار إذا كان المستثمر موجودًا
            if (investor) {
                const totalInvestment = investor.amount || 0;
                
                // حساب الربح المتوقع
                let expectedProfit = 0;
                if (investor.investments && Array.isArray(investor.investments)) {
                    expectedProfit = investor.investments.reduce((total, inv) => {
                        // استخدام دالة حساب الفائدة من النظام الأساسي إذا كانت متاحة
                        if (typeof calculateInterest === 'function') {
                            return total + calculateInterest(inv.amount, inv.date);
                        } else {
                            // حساب تقريبي إذا لم تكن الدالة متاحة
                            const rate = settings && settings.interestRate ? settings.interestRate / 100 : 0.175;
                            return total + (inv.amount * rate);
                        }
                    }, 0);
                }
                
                detailsHTML += `
                    <div class="investor-detail-section">
                        <h4>معلومات الاستثمار</h4>
                        <div class="investor-detail-row">
                            <div class="investor-detail-label">إجمالي الاستثمار:</div>
                            <div class="investor-detail-value">${formatCurrency(totalInvestment)}</div>
                        </div>
                        <div class="investor-detail-row">
                            <div class="investor-detail-label">الربح المتوقع (شهرياً):</div>
                            <div class="investor-detail-value">${formatCurrency(expectedProfit)}</div>
                        </div>
                    </div>
                `;
            }
            
            // عرض التفاصيل
            detailsView.innerHTML = detailsHTML;
        }
        
        // تحديث حالة أزرار الإجراءات
        updateActionButtons(card);
        
        // تسجيل استخدام البطاقة
        card.lastUsed = new Date().toISOString();
        saveInvestorCards(cards);
    }

    /**
     * تحديث حالة أزرار الإجراءات
     * @param {Object} card بيانات البطاقة
     */
    function updateActionButtons(card) {
        // زر تعديل البطاقة
        const editBtn = document.getElementById('edit-card-btn');
        if (editBtn) {
            editBtn.disabled = card.status !== 'active';
        }
        
        // زر تجديد البطاقة
        const renewBtn = document.getElementById('renew-card-btn');
        if (renewBtn) {
            const expiryDate = new Date(card.expiryDate);
            const now = new Date();
            const daysToExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
            
            // تفعيل زر التجديد إذا كانت البطاقة نشطة وتنتهي قريبًا (خلال 30 يومًا)
            renewBtn.disabled = card.status !== 'active' || daysToExpiry > 30;
        }
        
        // زر إيقاف البطاقة
        const deactivateBtn = document.getElementById('deactivate-card-btn');
        if (deactivateBtn) {
            deactivateBtn.disabled = card.status !== 'active';
            
            // تغيير النص حسب الحالة
            if (card.status === 'active') {
                deactivateBtn.innerHTML = '<i class="fas fa-ban"></i><span>إيقاف</span>';
            } else {
                deactivateBtn.innerHTML = '<i class="fas fa-trash"></i><span>حذف</span>';
            }
        }
    }

    /**
     * تعديل البطاقة الحالية
     */
    function editCurrentCard() {
        if (!currentCardId) {
            console.error('لا توجد بطاقة محددة');
            return;
        }
        
        // البحث عن البطاقة
        const cards = getInvestorCards();
        const card = cards.find(c => c.id === currentCardId);
        
        if (!card) {
            console.error('لم يتم العثور على البطاقة');
            return;
        }
        
        // طلب تغيير الرقم السري
        const newPin = prompt('أدخل الرقم السري الجديد (4 أرقام):', card.pin);
        
        if (newPin === null) {
            // تم الإلغاء
            return;
        }
        
        if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
            showNotification('يرجى إدخال رقم سري صحيح مكون من 4 أرقام', 'error');
            return;
        }
        
        // تحديث الرقم السري
        card.pin = newPin;
        
        // حفظ التغييرات
        saveInvestorCards(cards);
        
        // تحديث العرض
        showCardDetails(currentCardId);
        
        // عرض رسالة نجاح
        showNotification('تم تحديث الرقم السري بنجاح', 'success');
    }

    /**
     * تجديد البطاقة الحالية
     */
    function renewCurrentCard() {
        if (!currentCardId) {
            console.error('لا توجد بطاقة محددة');
            return;
        }
        
        // البحث عن البطاقة
        const cards = getInvestorCards();
        const card = cards.find(c => c.id === currentCardId);
        
        if (!card) {
            console.error('لم يتم العثور على البطاقة');
            return;
        }
        
        // تأكيد التجديد
        const confirm = window.confirm('هل أنت متأكد من رغبتك في تجديد هذه البطاقة؟');
        if (!confirm) {
            return;
        }
        
        // تحديد تاريخ انتهاء جديد (سنة من الآن)
        const newExpiryDate = new Date();
        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
        
        // تحديث البطاقة
        card.expiryDate = newExpiryDate.toISOString().split('T')[0];
        
        // حفظ التغييرات
        saveInvestorCards(cards);
        
        // تحديث العرض
        showCardDetails(currentCardId);
        
        // عرض رسالة نجاح
        showNotification('تم تجديد البطاقة بنجاح', 'success');
    }

    /**
     * مشاركة البطاقة الحالية
     */
    function shareCurrentCard() {
        if (!currentCardId) {
            console.error('لا توجد بطاقة محددة');
            return;
        }
        
        // البحث عن البطاقة
        const cards = getInvestorCards();
        const card = cards.find(c => c.id === currentCardId);
        
        if (!card) {
            console.error('لم يتم العثور على البطاقة');
            return;
        }
        
        // إنشاء نص المشاركة
        const shareText = `
بطاقة المستثمر: ${card.investorName}
رقم الهاتف: ${card.investorPhone}
رقم البطاقة: ${formatCardNumber(card.cardNumber)}
نوع البطاقة: ${getCardTypeArabic(card.cardType)}
تاريخ الإصدار: ${formatDate(card.createdAt)}
تاريخ الانتهاء: ${formatDate(card.expiryDate)}
        `;
        
        // إنشاء محتوى النافذة المنبثقة
        const modalContent = `
            <div class="card-share-options">
                <h4>مشاركة بيانات البطاقة</h4>
                
                <div class="copy-text-box">
                    <textarea readonly>${shareText}</textarea>
                    <button class="copy-btn" id="copy-card-text">نسخ</button>
                </div>
                
                <div class="card-share-option" id="share-whatsapp">
                    <i class="fab fa-whatsapp" style="color: #25D366;"></i>
                    <div class="card-share-option-details">
                        <div class="card-share-option-title">مشاركة عبر واتساب</div>
                        <div class="card-share-option-desc">مشاركة بيانات البطاقة عبر تطبيق واتساب</div>
                    </div>
                </div>
                
                <div class="card-share-option" id="share-browser">
                    <i class="fas fa-share-alt" style="color: #3B82F6;"></i>
                    <div class="card-share-option-details">
                        <div class="card-share-option-title">مشاركة عبر المتصفح</div>
                        <div class="card-share-option-desc">استخدام واجهة المشاركة المدمجة في المتصفح</div>
                    </div>
                </div>
            </div>
        `;
        
        // عرض النافذة المنبثقة
        const modal = showModal('مشاركة البطاقة', modalContent);
        
        // إضافة مستمعي الأحداث لأزرار المشاركة
        const copyBtn = modal.querySelector('#copy-card-text');
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                const textarea = modal.querySelector('textarea');
                textarea.select();
                document.execCommand('copy');
                this.textContent = 'تم النسخ!';
                setTimeout(() => {
                    this.textContent = 'نسخ';
                }, 2000);
            });
        }
        
        const shareWhatsApp = modal.querySelector('#share-whatsapp');
        if (shareWhatsApp) {
            shareWhatsApp.addEventListener('click', function() {
                const encodedText = encodeURIComponent(shareText);
                window.open(`https://wa.me/?text=${encodedText}`, '_blank');
            });
        }
        
        const shareBrowser = modal.querySelector('#share-browser');
        if (shareBrowser) {
            shareBrowser.addEventListener('click', function() {
                if (navigator.share) {
                    navigator.share({
                        title: `بطاقة المستثمر - ${card.investorName}`,
                        text: shareText
                    })
                    .then(() => {
                        console.log('تمت المشاركة بنجاح');
                    })
                    .catch(error => {
                        console.error('فشل المشاركة:', error);
                        // نسخ النص إلى الحافظة كخطة بديلة
                        const textarea = modal.querySelector('textarea');
                        textarea.select();
                        document.execCommand('copy');
                        showNotification('تم نسخ النص إلى الحافظة', 'success');
                    });
                } else {
                    // نسخ النص إلى الحافظة إذا كانت واجهة المشاركة غير متاحة
                    const textarea = modal.querySelector('textarea');
                    textarea.select();
                    document.execCommand('copy');
                    showNotification('تم نسخ النص إلى الحافظة', 'success');
                }
            });
        }
    }

    /**
     * إظهار نافذة منبثقة مخصصة
     * @param {string} title عنوان النافذة
     * @param {string} content محتوى النافذة
     * @returns {HTMLElement} عنصر النافذة
     */
    function showModal(title, content) {
        // إنشاء النافذة المنبثقة
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.zIndex = '9999';
        
        modalOverlay.innerHTML = `
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                </div>
            </div>
        `;
        
        // إضافة النافذة إلى الصفحة
        document.body.appendChild(modalOverlay);
        
        // إضافة مستمعي الأحداث
        const closeButtons = modalOverlay.querySelectorAll('.modal-close, .modal-close-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                document.body.removeChild(modalOverlay);
            });
        });
        
        return modalOverlay;
    }

    /**
     * طباعة البطاقة الحالية
     */
    function printCurrentCard() {
        if (!currentCardId) {
            console.error('لا توجد بطاقة محددة');
            return;
        }
        
        // البحث عن البطاقة
        const cards = getInvestorCards();
        const card = cards.find(c => c.id === currentCardId);
        
        if (!card) {
            console.error('لم يتم العثور على البطاقة');
            return;
        }
        
        // إنشاء عنصر للطباعة
        const printWindow = window.open('', '_blank');
        
        if (!printWindow) {
            showNotification('يرجى السماح بفتح النوافذ المنبثقة للطباعة', 'error');
            return;
        }
        
        // إعداد محتوى صفحة الطباعة
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
                <head>
                    <meta charset="utf-8">
                    <title>طباعة بطاقة المستثمر - ${card.investorName}</title>
                    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
                    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&amp;display=swap" rel="stylesheet" />
                    <style>
                        @page {
                            size: 85.6mm 53.98mm;
                            margin: 0;
                        }
                        
                        body {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                            font-family: 'Tajawal', sans-serif;
                            direction: rtl;
                        }
                        
                        .print-card {
                            width: 85.6mm;
                            height: 53.98mm;
                            position: relative;
                            margin: 0 auto;
                            page-break-after: always;
                            overflow: hidden;
                        }
                        
                        /* نسخ أنماط البطاقة */
                        .investor-card {
                            position: relative;
                            width: 100%;
                            height: 100%;
                            border-radius: 10px;
                            overflow: hidden;
                            backface-visibility: hidden;
                            transform-style: preserve-3d;
                        }
                        
                        .investor-card-inner {
                            width: 100%;
                            height: 100%;
                            position: relative;
                        }
                        
                        .investor-card-front, .investor-card-back {
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            -webkit-backface-visibility: hidden;
                            backface-visibility: hidden;
                            display: flex;
                            flex-direction: column;
                            padding: 16px;
                            box-sizing: border-box;
                        }
                        
                        .investor-card-back {
                            transform: rotateY(180deg);
                            background-color: #f0f0f0;
                            color: #333;
                        }
                        
                        /* الأنماط المختلفة للبطاقة */
                        .investor-card.default .investor-card-front {
                            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                            color: #ffffff;
                        }
                        
                        .investor-card.gold .investor-card-front {
                            background: linear-gradient(135deg, #b8860b 0%, #daa520 100%);
                            color: #000000;
                        }
                        
                        .investor-card.platinum .investor-card-front {
                            background: linear-gradient(135deg, #7a7a7a 0%, #c0c0c0 100%);
                            color: #000000;
                        }
                        
                        .investor-card.premium .investor-card-front {
                            background: linear-gradient(135deg, #000428 0%, #004e92 100%);
                            color: #ffffff;
                        }
                        
                        /* أنماط عناصر البطاقة */
                        .card-chip {
                            position: absolute;
                            top: 70px;
                            right: 20px;
                            width: 40px;
                            height: 30px;
                            background-color: #ffd700;
                            border-radius: 5px;
                            background-image: linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent);
                            background-size: 8px 8px;
                        }
                        
                        .card-number {
                            font-size: 19px;
                            letter-spacing: 2px;
                            margin-top: 50px;
                            text-align: center;
                            font-family: 'Courier New', monospace;
                            font-weight: bold;
                        }
                        
                        .card-details {
                            margin-top: auto;
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                        }
                        
                        .card-holder {
                            text-transform: uppercase;
                            font-weight: bold;
                        }
                        
                        .card-holder-name {
                            font-size: 14px;
                        }
                        
                        .card-expires {
                            display: flex;
                            flex-direction: column;
                            align-items: flex-end;
                        }
                        
                        .expires-label {
                            font-size: 9px;
                            text-transform: uppercase;
                        }
                        
                        .expires-date {
                            font-size: 14px;
                        }
                        
                        .card-logo {
                            position: absolute;
                            top: 20px;
                            left: 20px;
                            height: 40px;
                            display: flex;
                            align-items: center;
                        }
                        
                        .card-logo-text {
                            font-size: 14px;
                            font-weight: bold;
                            margin-left: 6px;
                            text-transform: uppercase;
                        }
                        
                        .card-type {
                            position: absolute;
                            bottom: 20px;
                            right: 20px;
                            font-size: 14px;
                            font-weight: bold;
                            color: rgba(255, 255, 255, 0.7);
                            text-transform: uppercase;
                        }
                        
                        /* أنماط الوجه الخلفي للبطاقة */
                        .card-magnetic-stripe {
                            width: 100%;
                            height: 40px;
                            background-color: #111;
                            margin: 20px 0;
                        }
                        
                        .card-signature {
                            height: 40px;
                            background-color: #fff;
                            display: flex;
                            align-items: center;
                            padding: 0 10px;
                            margin-top: 15px;
                        }
                        
                        .card-signature-text {
                            font-family: 'Brush Script MT', cursive;
                            color: #555;
                            font-size: 20px;
                        }
                        
                        .card-cvv {
                            position: absolute;
                            bottom: 20px;
                            right: 20px;
                            font-size: 12px;
                            background-color: #fff;
                            color: #000;
                            padding: 2px 5px;
                            border-radius: 3px;
                        }
                        
                        .card-barcode-container {
                            margin-top: auto;
                            width: 100%;
                            text-align: center;
                        }
                        
                        .card-barcode {
                            max-width: 90%;
                            margin: 0 auto;
                        }
                        
                        .card-barcode img,
                        .card-barcode svg,
                        .card-barcode canvas {
                            max-width: 100%;
                            height: auto;
                            display: block;
                            margin: 0 auto;
                        }
                        
                        .card-barcode-number {
                            font-size: 10px;
                            margin-top: 2px;
                            font-family: 'Courier New', monospace;
                        }
                    </style>
                </head>
                <body>
                    <div class="print-card" id="print-card-container">
                        <!-- سيتم ملؤها بمحتوى البطاقة -->
                    </div>
                </body>
            </html>
        `);
        
        // الحصول على عنصر حاوية البطاقة
        const printCardContainer = printWindow.document.getElementById('print-card-container');
        
        // إعداد الكود اللازم لإنشاء الباركود في صفحة الطباعة
        printWindow.document.write(`
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        `);
        
        // تحويل تاريخ الانتهاء إلى الصيغة المناسبة
        const expiryDate = new Date(card.expiryDate);
        const expMonth = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
        const expYear = expiryDate.getFullYear().toString().substr(2);
        
        // إنشاء محتوى البطاقة
        let cardHTML = `
            <div class="investor-card ${card.cardType}">
                <div class="investor-card-inner">
                    <div class="investor-card-front">
                        <div class="card-logo">
                            <i class="fas fa-university"></i>
                            <span class="card-logo-text">InvestCard</span>
                        </div>
                        <div class="card-chip"></div>
                        <div class="card-number">
                            ${formatCardNumber(card.cardNumber)}
                        </div>
                        <div class="card-details">
                            <div class="card-holder">
                                <div class="card-holder-label">حامل البطاقة</div>
                                <div class="card-holder-name">${card.investorName}</div>
                            </div>
                            <div class="card-expires">
                                <div class="expires-label">تنتهي في</div>
                                <div class="expires-date">${expMonth}/${expYear}</div>
                            </div>
                        </div>
                        <div class="card-type">
                            ${getCardTypeArabic(card.cardType)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة محتوى البطاقة إلى حاوية الطباعة
        printCardContainer.innerHTML = cardHTML;
        
        // إنشاء عنصر HTML جديد لظهر البطاقة (للطباعة على الوجه الثاني)
        const backCardContainer = printWindow.document.createElement('div');
        backCardContainer.className = 'print-card';
        backCardContainer.innerHTML = `
            <div class="investor-card ${card.cardType}">
                <div class="investor-card-inner">
                    <div class="investor-card-back">
                        <div class="card-magnetic-stripe"></div>
                        <div class="card-signature">
                            <div class="card-signature-text">${card.investorName}</div>
                        </div>
                        <div class="card-cvv">CVV: ${card.cvv}</div>
                        <div class="card-barcode-container">
                            <div class="card-barcode" id="print-barcode-${card.id}"></div>
                            <div class="card-barcode-number">${card.barcode}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        printWindow.document.body.appendChild(backCardContainer);
        
        // إنشاء الباركود بعد تحميل الصفحة
        printWindow.onload = function() {
            try {
                // إنشاء الباركود في صفحة الطباعة
                printWindow.JsBarcode(`#print-barcode-${card.id}`, card.barcode, {
                    format: "CODE128",
                    width: 1.5,
                    height: 40,
                    displayValue: false
                });
                
                // تأخير الطباعة للتأكد من إنشاء الباركود
                setTimeout(() => {
                    printWindow.print();
                    printWindow.onafterprint = function() {
                        printWindow.close();
                    };
                }, 500);
            } catch (error) {
                console.error('خطأ في إنشاء الباركود للطباعة:', error);
                
                // طباعة البطاقة حتى في حالة فشل إنشاء الباركود
                printWindow.print();
                printWindow.onafterprint = function() {
                    printWindow.close();
                };
            }
        };
    }

    /**
     * الحصول على بطاقات المستثمرين
     * @returns {Array} مصفوفة البطاقات
     */
    function getInvestorCards() {
        // الحصول من التخزين المحلي
        const cardsString = localStorage.getItem('investorCards');
        
        // التحقق من وجود بيانات
        if (!cardsString) {
            console.log('لا توجد بطاقات مخزنة حالياً');
            return [];
        }
        
        // تحويل البيانات إلى كائن
        try {
            const cards = JSON.parse(cardsString);
            console.log(`تم استرجاع ${cards.length} بطاقة من التخزين المحلي`);
            return cards;
        } catch (error) {
            console.error('خطأ في تحليل بيانات البطاقات:', error);
            return [];
        }
    }

    /**
     * حفظ بطاقات المستثمرين
     * @param {Array} cards مصفوفة البطاقات
     */
    function saveInvestorCards(cards) {
        // التحقق من صحة البيانات
        if (!Array.isArray(cards)) {
            console.error('البيانات المراد حفظها ليست مصفوفة');
            return false;
        }
        
        // حفظ البيانات في التخزين المحلي
        try {
            localStorage.setItem('investorCards', JSON.stringify(cards));
            console.log(`تم حفظ ${cards.length} بطاقة في التخزين المحلي`);
            return true;
        } catch (error) {
            console.error('خطأ في حفظ بيانات البطاقات:', error);
            return false;
        }
    }

    /**
     * إنشاء رقم بطاقة فريد
     * @param {string} investorId معرف المستثمر
     * @returns {string} رقم البطاقة
     */
    function generateCardNumber(investorId) {
        // استخدام معرف المستثمر لإنشاء رقم فريد
        const now = Date.now().toString();
        const idPart = (investorId || '').replace(/\D/g, '').substr(0, 6).padStart(6, '0');
        
        // إنشاء رقم مكون من 16 رقم
        let cardNumber = '4' + idPart + now.substr(-9);
        
        // التحقق من طول الرقم
        if (cardNumber.length > 16) {
            cardNumber = cardNumber.substr(0, 16);
        } else if (cardNumber.length < 16) {
            cardNumber = cardNumber.padEnd(16, '0');
        }
        
        return cardNumber;
    }

    /**
     * إنشاء رمز الأمان CVV
     * @returns {string} رمز الأمان
     */
    function generateCVV() {
        // إنشاء رقم عشوائي من 3 أرقام
        return Math.floor(100 + Math.random() * 900).toString();
    }

    /**
     * إنشاء رمز الباركود
     * @param {string} investorId معرف المستثمر
     * @returns {string} رمز الباركود
     */
    function generateBarcode(investorId) {
        // إنشاء رمز مكون من 13 رقم
        const prefix = '977'; // رمز تعريف
        const idPart = (investorId || '').replace(/\D/g, '').substr(0, 5).padStart(5, '0');
        const now = Date.now().toString().substr(-5);
        
        return prefix + idPart + now;
    }

    /**
     * تنسيق رقم البطاقة للعرض
     * @param {string} cardNumber رقم البطاقة
     * @returns {string} رقم البطاقة المنسق
     */
    function formatCardNumber(cardNumber) {
        // التحقق من صحة الرقم
        if (!cardNumber || typeof cardNumber !== 'string') {
            return '•••• •••• •••• ••••';
        }
        
        // تقسيم الرقم إلى مجموعات من 4 أرقام
        return cardNumber.replace(/(.{4})/g, '$1 ').trim();
    }

    /**
     * الحصول على اسم نوع البطاقة بالعربية
     * @param {string} cardType نوع البطاقة
     * @returns {string} اسم النوع بالعربية
     */
    function getCardTypeArabic(cardType) {
        switch (cardType) {
            case 'default':
                return 'قياسية';
            case 'gold':
                return 'ذهبية';
            case 'platinum':
                return 'بلاتينية';
            case 'premium':
                return 'بريميوم';
            default:
                return cardType;
        }
    }

    /**
     * الحصول على اسم حالة البطاقة بالعربية
     * @param {string} status حالة البطاقة
     * @returns {string} اسم الحالة بالعربية
     */
    function getCardStatusArabic(status) {
        switch (status) {
            case 'active':
                return 'نشطة';
            case 'inactive':
                return 'متوقفة';
            case 'expired':
                return 'منتهية';
            default:
                return status;
        }
    }

    /**
     * تنسيق التاريخ للعرض
     * @param {string} dateString تاريخ
     * @returns {string} التاريخ المنسق
     */
    function formatDate(dateString) {
        if (!dateString) return '-';
        
        const date = new Date(dateString);
        
        // التحقق من صحة التاريخ
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        // تنسيق التاريخ بالصيغة المحلية
        try {
            return date.toLocaleDateString('ar-SA');
        } catch (e) {
            // إذا فشل التنسيق باللغة العربية
            return date.toLocaleDateString();
        }
    }

    /**
     * تنسيق المبلغ المالي للعرض
     * @param {number} amount المبلغ
     * @returns {string} المبلغ المنسق
     */
    function formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        
        // التحقق من وجود دالة التنسيق في النظام الأساسي
        if (typeof window.formatCurrency === 'function') {
            return window.formatCurrency(amount);
        }
        
        // تنسيق افتراضي
        let formattedAmount;
        try {
            formattedAmount = amount.toLocaleString('ar-SA', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 0
            });
        } catch (e) {
            // إذا فشل التنسيق باللغة العربية
            formattedAmount = amount.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 0
            });
        }
        
        // إضافة العملة
        const currency = window.settings && window.settings.currency ? window.settings.currency : 'دينار';
        return `${formattedAmount} ${currency}`;
    }

    /**
     * عرض إشعار للمستخدم
     * @param {string} message نص الإشعار
     * @param {string} type نوع الإشعار
     */
    function showNotification(message, type = 'info') {
        // استخدام دالة النظام الأساسي إذا كانت متاحة
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }
        
        // إنشاء إشعار بديل
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // إنشاء إشعار مؤقت إذا لم تكن دالة الإشعارات متاحة
        if (typeof swal === 'function') {
            swal({
                title: '',
                text: message,
                icon: type,
                button: 'موافق',
                timer: 3000
            });
        } else {
            // استخدام alert كملاذ أخير
            alert(message);
        }
    }

    /**
     * إضافة ميزة مشاركة البطاقة
     */
    function addCardSharingFeature() {
        console.log('إضافة ميزة مشاركة البطاقة...');
        
        // إضافة زر المشاركة إلى نافذة عرض البطاقة (إذا لم يكن موجوداً)
        const modalFooter = document.querySelector('#show-card-modal .modal-footer');
        if (modalFooter && !document.getElementById('share-card-btn')) {
            const shareBtn = document.createElement('button');
            shareBtn.className = 'btn btn-info';
            shareBtn.id = 'share-card-btn';
            shareBtn.innerHTML = '<i class="fas fa-share-alt"></i><span>مشاركة</span>';
            
            modalFooter.querySelector('.btn-group').appendChild(shareBtn);
            
            // إضافة مستمع الحدث
            shareBtn.addEventListener('click', () => {
                shareCurrentCard();
            });
        }
    }

    /**
     * إضافة ميزة تصدير واستيراد البطاقات
     */
    function addCardImportExportFeature() {
        console.log('إضافة ميزة تصدير واستيراد البطاقات...');
        
        // إضافة أزرار التصدير والاستيراد (إذا لم تكن موجودة)
        const sectionActions = document.querySelector('#investor-cards-page .section-actions');
        if (sectionActions && !document.getElementById('export-cards-btn')) {
            // زر التصدير
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn btn-outline btn-sm';
            exportBtn.id = 'export-cards-btn';
            exportBtn.title = 'تصدير البطاقات';
            exportBtn.innerHTML = '<i class="fas fa-file-export"></i><span>تصدير</span>';
            
            // زر الاستيراد
            const importBtn = document.createElement('button');
            importBtn.className = 'btn btn-outline btn-sm';
            importBtn.id = 'import-cards-btn';
            importBtn.title = 'استيراد البطاقات';
            importBtn.innerHTML = '<i class="fas fa-file-import"></i><span>استيراد</span>';
            
            // إضافة الأزرار
            sectionActions.appendChild(exportBtn);
            sectionActions.appendChild(importBtn);
            
            // إضافة مستمعي الأحداث
            exportBtn.addEventListener('click', exportCards);
            importBtn.addEventListener('click', importCards);
        }
    }

    /**
     * تصدير بيانات البطاقات
     */
    function exportCards() {
        console.log('تصدير بيانات البطاقات...');
        
        // الحصول على البطاقات
        const cards = getInvestorCards();
        
        if (cards.length === 0) {
            showNotification('لا توجد بطاقات للتصدير', 'warning');
            return;
        }
        
        // تحويل البيانات إلى نص JSON
        const jsonData = JSON.stringify(cards, null, 2);
        
        // إنشاء ملف للتنزيل
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // إنشاء رابط التنزيل
        const a = document.createElement('a');
        a.href = url;
        a.download = `investor_cards_${new Date().toISOString().split('T')[0]}.json`;
        a.style.display = 'none';
        
        // إضافة الرابط للصفحة وتنفيذ النقر
        document.body.appendChild(a);
        a.click();
        
        // تنظيف
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        showNotification(`تم تصدير ${cards.length} بطاقة بنجاح`, 'success');
    }

    /**
     * استيراد بيانات البطاقات
     */
    function importCards() {
        console.log('استيراد بيانات البطاقات...');
        
        // إنشاء عنصر إدخال الملف
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json';
        fileInput.style.display = 'none';
        
        // إضافة مستمع الحدث
        fileInput.addEventListener('change', (e) => {
            if (!e.target.files || !e.target.files[0]) {
                return;
            }
            
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    // تحليل البيانات
                    const importedCards = JSON.parse(event.target.result);
                    
                    // التحقق من صحة البيانات
                    if (!Array.isArray(importedCards)) {
                        throw new Error('تنسيق البيانات غير صحيح');
                    }
                    
                    // الحصول على البطاقات الحالية
                    const currentCards = getInvestorCards();
                    
                    // تأكيد الاستيراد
                    const confirmMsg = currentCards.length > 0 
                        ? `سيتم دمج ${importedCards.length} بطاقة مستوردة مع ${currentCards.length} بطاقة حالية. هل تريد المتابعة؟`
                        : `سيتم استيراد ${importedCards.length} بطاقة. هل تريد المتابعة؟`;
                    
                    if (!confirm(confirmMsg)) {
                        return;
                    }
                    
                    // دمج البطاقات (تجنب التكرار)
                    const existingCardIds = new Set(currentCards.map(card => card.id));
                    const newCards = importedCards.filter(card => !existingCardIds.has(card.id));
                    
                    // إضافة البطاقات الجديدة
                    const mergedCards = [...currentCards, ...newCards];
                    
                    // حفظ البطاقات المدمجة
                    saveInvestorCards(mergedCards);
                    
                    // تحديث العرض
                    renderInvestorCards();
                    
                    // تحديث الإحصائيات
                    updateCardStatistics();
                    
                    showNotification(`تم استيراد ${newCards.length} بطاقة جديدة بنجاح`, 'success');
                } catch (error) {
                    console.error('خطأ في استيراد البطاقات:', error);
                    showNotification('حدث خطأ أثناء استيراد البطاقات: ' + error.message, 'error');
                }
            };
            
            reader.onerror = () => {
                showNotification('حدث خطأ أثناء قراءة الملف', 'error');
            };
            
            reader.readAsText(file);
        });
        
        // إضافة عنصر الإدخال للصفحة وتنفيذ النقر
        document.body.appendChild(fileInput);
        fileInput.click();
        
        // تنظيف
        setTimeout(() => {
            document.body.removeChild(fileInput);
        }, 100);
    }

    /**
     * تحسين التعرف على الصوت بإضافة قواعد نحوية للكلمات المتوقعة
     */
    function setupSpeechGrammar() {
        if (!window.SpeechGrammarList) {
            return; // عدم دعم قوائم القواعد النحوية
        }
        
        try {
            // قائمة القواعد النحوية للأرقام والكلمات المتوقعة
            const numbers = '0 1 2 3 4 5 6 7 8 9 صفر واحد اثنان ثلاثة أربعة خمسة ستة سبعة ثمانية تسعة عشرة عشرون ثلاثون أربعون خمسون ستون سبعون ثمانون تسعون مائة مئة ألف مليون';
            const financialTerms = 'دينار ريال درهم دولار يورو إيداع سحب استثمار ربح أرباح فائدة رصيد مستثمر بطاقة كارت ماستر كارد';
            
            // إنشاء قواعد JSGF
            const grammar = `#JSGF V1.0; grammar numbers; public <numbers> = ${numbers}; public <terms> = ${financialTerms};`;
            
            // إنشاء قائمة القواعد النحوية
            const speechGrammarList = new window.SpeechGrammarList();
            speechGrammarList.addFromString(grammar, 1);
            
            // حفظ القواعد النحوية
            window.speechGrammarList = speechGrammarList;
            
            console.log('تم إعداد قواعد القواميس للتعرف على الصوت للبطاقات');
        } catch (error) {
            console.error('خطأ في إعداد قواعد القواميس:', error);
        }
    }

    // إضافة تحسينات CSS لجعل البطاقات تبدو أكثر واقعية
    function enhanceCardStyles() {
        const styleElement = document.getElementById('investor-card-styles');
        if (!styleElement) return;
        
        // إضافة أنماط محسنة
        const enhancedStyles = `
            /* تحسينات عامة للبطاقات */
            .investor-card {
                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            }
            
            .investor-card:hover {
                transform: translateY(-10px) rotateY(5deg);
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
            }
            
            /* تأثيرات بصرية للبطاقة */
            .investor-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 70%);
                z-index: 2;
                transition: all 0.5s ease;
                pointer-events: none;
            }
            
            .investor-card:hover::before {
                transform: translateX(100%);
            }
            
            /* تحسين الشريحة */
            .card-chip {
                background: linear-gradient(135deg, #d4af37 0%, #f5cc7f 50%, #d4af37 100%);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .card-chip::before {
                content: '';
                position: absolute;
                top: 5px;
                left: 5px;
                right: 5px;
                bottom: 15px;
                background: linear-gradient(90deg, transparent 25%, rgba(255, 255, 255, 0.2) 50%, transparent 75%);
                background-size: 200% 100%;
                border-radius: 2px;
            }
            
            /* أنماط البطاقات المتوقفة */
            .investor-card.inactive {
                opacity: 0.7;
                filter: grayscale(80%);
            }
            
            .card-inactive-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: rgba(0, 0, 0, 0.5);
                color: white;
                font-size: 2rem;
                font-weight: bold;
                text-transform: uppercase;
                transform: rotate(-25deg);
                z-index: 10;
            }
            
            /* تحسينات أنماط البطاقات */
            .investor-card.gold {
                background: linear-gradient(135deg, #d4af37 0%, #f5cc7f 50%, #d4af37 100%);
                color: #000;
            }
            
            .investor-card.platinum {
                background: linear-gradient(135deg, #a8a9ad 0%, #e0e1e2 50%, #a8a9ad 100%);
                color: #000;
            }
            
            .investor-card.premium {
                background: linear-gradient(135deg, #000428 0%, #004e92 100%);
                color: #fff;
            }
            
            /* أنماط نمط الخلفية */
            .card-pattern.circles {
                background-image: radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                background-size: 20px 20px;
            }
            
            .card-pattern.lines {
                background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.05) 75%, transparent 75%, transparent);
                background-size: 8px 8px;
            }
            
            .card-pattern.dots {
                background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
                background-size: 10px 10px;
            }
            
            .card-pattern.waves {
                background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0, rgba(255, 255, 255, 0.03) 1px, transparent 0, transparent 50%);
                background-size: 10px 10px;
            }
            
            /* تحسينات تأثير القلب */
            .investor-card-inner {
                transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            /* تحسينات نتائج البحث الفارغة */
            .empty-search-results {
                grid-column: 1 / -1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                background-color: rgba(0, 0, 0, 0.02);
                border-radius: 10px;
                text-align: center;
            }
            
            .empty-search-results i {
                font-size: 48px;
                margin-bottom: 16px;
                color: #999;
                opacity: 0.5;
            }
            
            .empty-search-results p {
                font-size: 16px;
                color: #666;
            }
        `;
        
        // إضافة الأنماط المحسنة
        styleElement.textContent += enhancedStyles;
    }

    // تصدير واجهة برمجة التطبيق
    return {
        initialize,
        renderInvestorCards,
        openCreateCardModal,
        openScanCardModal,
        showCardDetails,
        printAllCards,
        printCurrentCard,
        shareCurrentCard,
        
        // للاستخدام الداخلي
        _getInvestorCards: getInvestorCards
    };
})();
// تفعيل التحسينات الإضافية
document.addEventListener('DOMContentLoaded', () => {
    console.log('تحميل الصفحة اكتمل، بدء تهيئة نظام بطاقات المستثمرين...');
    
    // محاولة إضافة عنصر القائمة قبل التهيئة
    verifyMenuItemExists();
    
    // البدء بتهيئة النظام الأساسي
    InvestorCardSystem.initialize()
        .then(() => {
            // فحص آخر للتأكد من وجود عنصر القائمة
            setTimeout(() => {
                verifyMenuItemExists();
            }, 500);
            
            // تفعيل التحسينات الإضافية
            enhanceCardStyles();
            addCardSharingFeature();
            addCardImportExportFeature();
            setupSpeechGrammar();
            
            console.log('تم تفعيل جميع ميزات نظام بطاقات المستثمرين');
            
            // إضافة مستمع الحدث لتحديث البطاقات عند تغيير المستثمرين
            document.addEventListener('investor:update', () => {
                InvestorCardSystem.renderInvestorCards();
            });
        })
        .catch(error => {
            console.error('حدث خطأ أثناء تهيئة نظام بطاقات المستثمرين:', error);
            
            // محاولة أخيرة للتأكد من وجود عنصر القائمة
            setTimeout(() => {
                verifyMenuItemExists();
            }, 1000);
        });
});

/**
 * التحقق من وجود عنصر القائمة وإضافته إذا لم يكن موجودًا
 */
function verifyMenuItemExists() {
    // التحقق من وجود عنصر قائمة البطاقات
    const menuItem = document.querySelector('a[data-page="investor-cards"]');
    if (!menuItem) {
        console.warn('تحذير: عنصر قائمة البطاقات غير موجود بعد التهيئة، إعادة المحاولة...');
        // إعادة محاولة إضافة عنصر القائمة
        addSidebarMenuItem();
    } else {
        console.log('تم التحقق من وجود عنصر قائمة البطاقات');
    }
}