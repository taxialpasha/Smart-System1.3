/**
 * نظام بطاقات المستثمرين المتكامل - نسخة محدثة
 * يتيح إنشاء وإدارة وعرض بطاقات استثمارية للمستثمرين
 * مع إمكانية قراءة الباركود وعرض المعلومات
 * 
 * التحديث الثاني: باركود ذهبي واضح وتحسينات في الطباعة وعرض البطاقة
 */

// كائن عام لإدارة نظام البطاقات
const InvestorCardSystem = (function() {
    // المتغيرات الخاصة
    let cardTemplate = null;
    let cardScanner = null;
    let isInitialized = false;
    let currentCardId = null;
    let cardsData = []; // مصفوفة لتخزين بيانات البطاقات مؤقتاً
    let scannerInitialized = false;
    
    // ألوان وأنماط البطاقات
    const CARD_STYLES = {
        default: {
            background: 'linear-gradient(135deg, #0a1128 0%, #16213e 100%)',
            color: '#ffffff',
            accent: '#ffd700',
            logo: 'MASTERCARD'
        },
        gold: {
            background: 'linear-gradient(135deg, #012340 0%, #025939 100%)',
            color: '#ffffff',
            accent: '#ffd700',
            logo: 'MASTERCARD'
        },
        platinum: {
            background: 'linear-gradient(135deg, #050A30 0%, #233577 100%)',
            color: '#ffffff',
            accent: '#c0c0c0',
            logo: 'MASTERCARD'
        },
        premium: {
            background: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
            color: '#ffffff',
            accent: '#ff9d00',
            logo: 'MASTERCARD'
        }
    };
    
    /**
     * تهيئة نظام البطاقات
     * @returns {Promise} وعد بنجاح أو فشل التهيئة
     */
    function initialize() {
        return new Promise((resolve, reject) => {
            if (isInitialized) {
                resolve(true);
                return;
            }
            
            console.log('جاري تهيئة نظام بطاقات المستثمرين...');
            
            try {
                // إضافة عنصر القائمة في الشريط الجانبي
                addSidebarMenuItem();
                
                // إنشاء صفحة البطاقات
                createCardsPage();
                
                // إضافة النوافذ المنبثقة اللازمة
                addCardModals();
                
                // إضافة أنماط CSS
                addCardStyles();
                
                // تحميل بيانات البطاقات
                loadCardsData();
                
                // إضافة مستمع الحدث للتنقل بين الصفحات
                addPageNavigationListener();
                
                // تحميل مكتبات الباركود
                loadBarcodeDependencies()
                    .then(() => {
                        // تهيئة قارئ الباركود
                        initBarcodeScanner();
                        
                        isInitialized = true;
                        console.log('تم تهيئة نظام بطاقات المستثمرين بنجاح');
                        resolve(true);
                    })
                    .catch(error => {
                        console.error('فشل في تحميل مكتبات الباركود:', error);
                        // استمر رغم الفشل، ولكن بدون ميزة الباركود
                        isInitialized = true;
                        resolve(true);
                    });
            } catch (error) {
                console.error('خطأ في تهيئة نظام بطاقات المستثمرين:', error);
                reject(error);
            }
        });
    }
    
    /**
     * إضافة مستمع حدث للتنقل بين الصفحات
     */
    function addPageNavigationListener() {
        // مستمع الحدث للنقر على روابط التنقل
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                if (this.getAttribute('data-page') === 'investor-cards') {
                    setTimeout(() => {
                        renderInvestorCards();
                        updateCardStatistics();
                    }, 100);
                }
            });
        });
        
        // عرض صفحة البطاقات عند تحديدها
        document.querySelector('.nav-link[data-page="investor-cards"]')?.addEventListener('click', function() {
            showPage('investor-cards');
        });
    }
    
    /**
     * عرض صفحة محددة
     * @param {string} pageId معرف الصفحة
     */
    function showPage(pageId) {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إظهار الصفحة المطلوبة
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // تحديث عرض البطاقات إذا كانت صفحة البطاقات
            if (pageId === 'investor-cards') {
                renderInvestorCards();
                updateCardStatistics();
            }
        }
    }
    
    /**
     * إضافة عنصر القائمة في الشريط الجانبي
     */
    function addSidebarMenuItem() {
        const navList = document.querySelector('.nav-list');
        if (!navList) {
            console.error('لم يتم العثور على قائمة التنقل');
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
        
        // إضافة عنصر القائمة قبل عنصر الإعدادات
        const settingsItem = navList.querySelector('[data-page="settings"]')?.parentNode;
        if (settingsItem) {
            navList.insertBefore(menuItem, settingsItem);
        } else {
            navList.appendChild(menuItem);
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
            showPage('investor-cards');
        });
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
                        <button class="btn btn-outline btn-sm" id="export-cards-btn" title="تصدير">
                            <i class="fas fa-file-export"></i>
                            <span>تصدير</span>
                        </button>
                        <button class="btn btn-outline btn-sm" id="import-cards-btn" title="استيراد">
                            <i class="fas fa-file-import"></i>
                            <span>استيراد</span>
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
                                <div class="scanner-instructions">ضع الباركود أو QR كود في هذه المنطقة</div>
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
            
            /* الأنماط المحدثة للبطاقة */
            .investor-card.default .investor-card-front {
                background: linear-gradient(135deg, #0a1128 0%, #16213e 100%);
                color: #ffffff;
            }
            
            .investor-card.gold .investor-card-front {
                background: linear-gradient(135deg, #012340 0%, #025939 100%);
                color: #ffffff;
            }
            
            .investor-card.platinum .investor-card-front {
                background: linear-gradient(135deg, #050A30 0%, #233577 100%);
                color: #ffffff;
            }
            
            .investor-card.premium .investor-card-front {
                background: linear-gradient(135deg, #000428 0%, #004e92 100%);
                color: #ffffff;
            }
            
            /* أنماط عناصر البطاقة */
            .card-qrcode {
                position: absolute;
                top: 55px;
                right: 20px;
                width: 60px;
                height: 60px;
                background-color: transparent; /* جعل الخلفية شفافة */
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            
            /* تطبيق اللون الذهبي للباركود */
            .card-qrcode img {
                width: 100%;
                height: 100%;
                filter: sepia(100%) saturate(300%) brightness(90%) hue-rotate(5deg); /* تطبيق تأثير ذهبي */
            }
            
            .card-number {
                font-size: 19px;
                letter-spacing: 2px;
                margin-top: 50px;
                text-align: center;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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
                font-family: 'Arial', sans-serif;
                text-transform: uppercase;
            }
            
            .card-expires {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }
            
            .expires-label {
                font-size: 10px;
                text-transform: uppercase;
            }
            
            .expires-date {
                font-size: 14px;
            }
            
            .card-brand-logo {
                position: absolute;
                top: 16px;
                right: 16px;
                font-size: 22px;
                font-weight: bold;
                color: #fff;
                text-transform: uppercase;
                letter-spacing: 1px;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            }
            
            .mastercard-logo {
                position: absolute;
                top: 16px;
                left: 16px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .mastercard-logo .circle {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            .mastercard-logo .circle-red {
                background-color: #eb001b;
                margin-right: -10px;
                z-index: 1;
            }
            
            .mastercard-logo .circle-yellow {
                background-color: #f79e1b;
                z-index: 0;
            }
            
            .card-valid {
                position: absolute;
                bottom: 40px;
                left: 20px;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .valid-label {
                font-size: 8px;
                margin-bottom: 2px;
            }
            
            .valid-date {
                font-size: 14px;
            }
            
            .cardholder-label {
                position: absolute;
                bottom: 70px;
                right: 20px;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
                text-align: right;
                direction: rtl;
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
                font-family: 'Arial', sans-serif;
                color: #555;
                font-size: 16px;
                text-transform: uppercase;
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
                padding-top: 10px;
            }
            
            .card-barcode {
                max-width: 90%;
                margin: 0 auto;
                filter: sepia(100%) saturate(300%) brightness(75%) hue-rotate(5deg); /* تطبيق تأثير ذهبي */
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
            }
            
            /* تحسينات أنماط البطاقة */
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
            
            /* أنماط نتائج البحث الفارغة */
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
            
            /* تحسينات باركود ذهبي */
            .qrcode-golden {
                background-color: transparent !important;
                filter: sepia(100%) saturate(400%) brightness(105%) hue-rotate(5deg) !important;
            }
            
            .qrcode-golden canvas {
                background-color: transparent !important;
            }
            
            /* أنماط صورة البطاقة المصدرة */
            .card-image-container {
                width: 100%;
                max-width: 500px;
                margin: 0 auto;
                text-align: center;
            }
            
            .card-image {
                width: 100%;
                max-width: 100%;
                height: auto;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
                    
                    // تحميل مكتبة html2canvas للطباعة
                    const html2canvasScript = document.createElement('script');
                    html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    html2canvasScript.onload = () => {
                        console.log('تم تحميل مكتبة html2canvas بنجاح');
                        
                        // تحميل مكتبة QuaggaJS لقراءة الباركود
                        const quaggaScript = document.createElement('script');
                        quaggaScript.src = 'https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.8.2/dist/quagga.min.js';
                        quaggaScript.onload = () => {
                            console.log('تم تحميل مكتبة QuaggaJS بنجاح');
                            resolve(true);
                        };
                        quaggaScript.onerror = (error) => {
                            console.error('فشل في تحميل مكتبة QuaggaJS:', error);
                            reject(error);
                        };
                        document.head.appendChild(quaggaScript);
                    };
                    html2canvasScript.onerror = (error) => {
                        console.error('فشل في تحميل مكتبة html2canvas:', error);
                        reject(error);
                    };
                    document.head.appendChild(html2canvasScript);
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
                if (scannerInitialized) {
                    console.log('الماسح الضوئي مهيأ بالفعل');
                    return;
                }
                
                console.log('جاري تهيئة الماسح الضوئي...');
                
                // الحصول على العنصر المستهدف
                const targetElement = document.querySelector(`#${containerId} video`);
                if (!targetElement) {
                    console.error('لم يتم العثور على عنصر الفيديو');
                    return;
                }
                
                const config = {
                    inputStream: {
                        name: "Live",
                        type: "LiveStream",
                        target: targetElement,
                        constraints: {
                            facingMode: "environment",
                            aspectRatio: { min: 1, max: 2 }
                        },
                    },
                    locator: {
                        patchSize: "medium",
                        halfSample: true
                    },
                    numOfWorkers: 2,
                    frequency: 10,
                    decoder: {
                        readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_93_reader", "qr_code_reader"]
                    },
                    locate: true
                };
                
                try {
                    Quagga.init(config, (err) => {
                        if (err) {
                            console.error('خطأ في تهيئة Quagga:', err);
                            document.querySelector('#scan-result').textContent = 'حدث خطأ في تهيئة الماسح الضوئي';
                            document.querySelector('#scan-result').classList.add('error');
                            return;
                        }
                        
                        console.log('تم تهيئة Quagga بنجاح');
                        
                        Quagga.start();
                        scannerInitialized = true;
                        
                        Quagga.onDetected((result) => {
                            console.log('تم اكتشاف رمز:', result);
                            const code = result.codeResult.code;
                            if (code) {
                                this.onDetect(code);
                            }
                        });
                        
                        Quagga.onProcessed((result) => {
                            const drawingCtx = Quagga.canvas.ctx.overlay;
                            const drawingCanvas = Quagga.canvas.dom.overlay;
                            
                            if (result) {
                                if (result.boxes) {
                                    drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                                    result.boxes.filter(function (box) {
                                        return box !== result.box;
                                    }).forEach(function (box) {
                                        Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                                    });
                                }
                                
                                if (result.box) {
                                    Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
                                }
                                
                                if (result.codeResult && result.codeResult.code) {
                                    Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
                                }
                            }
                        });
                    });
                } catch (error) {
                    console.error('حدث خطأ أثناء تهيئة الماسح الضوئي:', error);
                    document.querySelector('#scan-result').textContent = 'حدث خطأ غير متوقع في تهيئة الماسح الضوئي';
                    document.querySelector('#scan-result').classList.add('error');
                }
            },
            
            onDetect: function(code) {
                console.log('تم اكتشاف رمز:', code);
                const resultElement = document.querySelector('#scan-result');
                resultElement.textContent = `تم العثور على الرمز: ${code}`;
                resultElement.classList.add('success');
                
                // إيقاف المسح بعد اكتشاف الرمز
                Quagga.stop();
                scannerInitialized = false;
                
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
                        this.init('barcode-scanner-region');
                    }, 3000);
                }
            },
            
            findCardByBarcode: function(code) {
                // البحث في التخزين المحلي عن البطاقة
                const cards = getInvestorCards();
                return cards.find(card => card.barcode === code || (card.investorId && code.includes(card.investorId)) || (card.cardNumber && code.includes(card.cardNumber)));
            },
            
            toggleCamera: function() {
                Quagga.stop();
                scannerInitialized = false;
                
                // تبديل الكاميرا الأمامية/الخلفية
                const videoElement = document.querySelector('#scanner-video');
                const currentFacingMode = videoElement.getAttribute('data-facing-mode') || 'environment';
                const newFacingMode = currentFacingMode === "environment" ? "user" : "environment";
                
                videoElement.setAttribute('data-facing-mode', newFacingMode);
                
                const config = {
                    inputStream: {
                        name: "Live",
                        type: "LiveStream",
                        target: videoElement,
                        constraints: {
                            facingMode: newFacingMode,
                            aspectRatio: { min: 1, max: 2 }
                        },
                    },
                    locator: {
                        patchSize: "medium",
                        halfSample: true
                    },
                    numOfWorkers: 2,
                    frequency: 10,
                    decoder: {
                        readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_93_reader", "qr_code_reader"]
                    },
                    locate: true
                };
                
                Quagga.init(config, (err) => {
                    if (err) {
                        console.error('Error initializing Quagga with new camera:', err);
                        return;
                    }
                    Quagga.start();
                    scannerInitialized = true;
                });
            },
            
            toggleFlash: function() {
                try {
                    const track = Quagga.CameraAccess.getActiveTrack();
                    if (track && track.getCapabilities && track.getCapabilities().torch) {
                        // التحقق من حالة الفلاش الحالية
                        const currentTorch = track.getConstraints()?.advanced?.[0]?.torch || false;
                        
                        // تبديل حالة الفلاش
                        track.applyConstraints({
                            advanced: [{torch: !currentTorch}]
                        })
                        .then(() => {
                            console.log(`تم ${!currentTorch ? 'تشغيل' : 'إيقاف'} الفلاش`);
                        })
                        .catch(error => {
                            console.error('خطأ في تبديل حالة الفلاش:', error);
                        });
                    } else {
                        console.log('الفلاش غير متاح في هذا الجهاز');
                    }
                } catch (error) {
                    console.error('خطأ في تبديل حالة الفلاش:', error);
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
        
        // زر تصدير البطاقات
        const exportCardsBtn = document.getElementById('export-cards-btn');
        if (exportCardsBtn) {
            exportCardsBtn.addEventListener('click', exportCards);
        }
        
        // زر استيراد البطاقات
        const importCardsBtn = document.getElementById('import-cards-btn');
        if (importCardsBtn) {
            importCardsBtn.addEventListener('click', importCards);
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
        
        // إعادة تعيين متغير حالة المبادرة
        scannerInitialized = false;
        
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
            if (modalId === 'scan-card-modal' && typeof Quagga !== 'undefined' && scannerInitialized) {
                Quagga.stop();
                scannerInitialized = false;
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
        
        // الحصول على المستثمرين من متغير النطاق العام
        if (typeof window.investors === 'undefined' || !Array.isArray(window.investors)) {
            console.error('مصفوفة المستثمرين غير متاحة');
            return;
        }
        
        // ترتيب المستثمرين حسب الاسم
        const sortedInvestors = [...window.investors].sort((a, b) => 
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
        const investor = window.investors.find(inv => inv.id === investorId);
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
        
        // تحويل اسم المستثمر إلى الإنجليزية
        const englishName = translateNameToEnglish(investor.name);
        
        // إنشاء عنصر البطاقة
        previewContainer.innerHTML = `
            <div class="investor-card ${cardType}">
                <div class="investor-card-inner">
                    <div class="investor-card-front">
                        <div class="card-brand-logo">MASTERCARD</div>
                        <div class="mastercard-logo">
                            <div class="circle circle-red"></div>
                            <div class="circle circle-yellow"></div>
                        </div>
                        <div class="card-qrcode" id="preview-qrcode"></div>
                        <div class="card-number">
                            ${formatCardNumber(cardNumber)}
                        </div>
                        <div class="card-valid">
                            <div class="valid-label">VALID</div>
                            <div class="valid-date">${expMonth}/${expYear}</div>
                        </div>
                        <div class="cardholder-label">حامل البطاقة</div>
                        <div class="card-holder">
                            <div class="card-holder-name">${englishName}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إنشاء QR كود
        setTimeout(() => {
            const qrcodeElement = document.getElementById('preview-qrcode');
            if (qrcodeElement && typeof QRCode !== 'undefined') {
                try {
                    // مسح المحتوى السابق
                    while (qrcodeElement.firstChild) {
                        qrcodeElement.removeChild(qrcodeElement.firstChild);
                    }
                    
                    // إنشاء QR كود جديد
                    new QRCode(qrcodeElement, {
                        text: `INVESTOR:${investor.id}|CARD:${cardNumber}`,
                        width: 60,
                        height: 60,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                    
                    // تطبيق التأثير الذهبي
                    qrcodeElement.classList.add('qrcode-golden');
                } catch (error) {
                    console.error('خطأ في إنشاء QR كود:', error);
                }
            }
        }, 100);
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
        const investor = window.investors.find(inv => inv.id === investorId);
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
        
        // تحويل اسم المستثمر إلى الإنجليزية
        const englishName = translateNameToEnglish(investor.name);
        
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
            englishName: englishName,
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
        const investor = window.investors.find(inv => inv.id === card.investorId);
        
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
                        <div class="investor-detail-label">الاسم بالإنجليزية:</div>
                        <div class="investor-detail-value">${card.englishName || translateNameToEnglish(card.investorName)}</div>
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
                        <div class="investor-detail-label">رمز الأمان:</div>
                        <div class="investor-detail-value">CVV: ${card.cvv}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">الرقم السري:</div>
                        <div class="investor-detail-value">${card.pin}</div>
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
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">رمز الباركود:</div>
                        <div class="investor-detail-value">${card.barcode}</div>
                    </div>
                </div>
                
                <div class="investor-detail-section">
                    <h4>رمز QR لقراءة البطاقة</h4>
                    <div style="text-align: center; margin: 15px 0;">
                        <div id="detail-qrcode-${card.id}" class="qrcode-detail"></div>
                        <div style="margin-top: 5px; font-size: 12px; color: #666;">امسح هذا الرمز بأي قارئ QR للوصول إلى معلومات البطاقة</div>
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
                            const rate = window.settings && window.settings.interestRate ? window.settings.interestRate / 100 : 0.175;
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
            
            // إنشاء QR كود في صفحة التفاصيل
            setTimeout(() => {
                const detailQRElement = document.getElementById(`detail-qrcode-${card.id}`);
                if (detailQRElement && typeof QRCode !== 'undefined') {
                    try {
                        // مسح المحتوى السابق
                        while (detailQRElement.firstChild) {
                            detailQRElement.removeChild(detailQRElement.firstChild);
                        }
                        
                        // إنشاء QR كود كبير
                        new QRCode(detailQRElement, {
                            text: `INVESTOR:${card.investorId}|CARD:${card.cardNumber}|NAME:${card.englishName}`,
                            width: 120,
                            height: 120,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                        
                        // تطبيق التأثير الذهبي
                        detailQRElement.classList.add('qrcode-golden');
                    } catch (error) {
                        console.error('خطأ في إنشاء QR كود في التفاصيل:', error);
                    }
                }
            }, 100);
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
            // تم الإلغif (newPin === null) {
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
        const shareText = `بطاقة المستثمر: ${card.investorName}
رقم البطاقة: ${formatCardNumber(card.cardNumber)}
تاريخ الانتهاء: ${formatDate(card.expiryDate)}
نوع البطاقة: ${getCardTypeArabic(card.cardType)}`;
        
        // مشاركة عبر واجهة مشاركة المتصفح إذا كانت متاحة
        if (navigator.share) {
            navigator.share({
                title: `بطاقة المستثمر - ${card.investorName}`,
                text: shareText
            })
            .then(() => {
                showNotification('تمت المشاركة بنجاح', 'success');
            })
            .catch((error) => {
                console.error('خطأ في مشاركة البطاقة:', error);
                
                // استخدام النسخ إلى الحافظة كحل بديل
                copyToClipboard(shareText);
            });
        } else {
            // استخدام النسخ إلى الحافظة
            copyToClipboard(shareText);
        }
    }
    
    /**
     * نسخ النص إلى الحافظة
     * @param {string} text النص المراد نسخه
     */
    function copyToClipboard(text) {
        // إنشاء عنصر نصي مؤقت
        const el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        
        // تحديد النص ونسخه
        el.select();
        document.execCommand('copy');
        
        // إزالة العنصر المؤقت
        document.body.removeChild(el);
        
        showNotification('تم نسخ معلومات البطاقة إلى الحافظة', 'success');
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
        
        // عرض رسالة انتظار
        showNotification('جاري تجهيز البطاقة للطباعة...', 'info');
        
        // إنشاء عنصر مؤقت للتحويل إلى صورة
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.top = '-9999px';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);
        
        // عرض البطاقة في العنصر المؤقت
        renderCardHTML(tempContainer, card);
        
        // التأكد من إنشاء العناصر المرئية بشكل كامل
        setTimeout(() => {
            if (typeof html2canvas !== 'undefined') {
                html2canvas(tempContainer.querySelector('.investor-card'), {
                    scale: 3, // زيادة دقة الصورة
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: null
                }).then(canvas => {
                    // إزالة العنصر المؤقت
                    document.body.removeChild(tempContainer);
                    
                    // تحويل Canvas إلى صورة
                    const imgData = canvas.toDataURL('image/png');
                    
                    // إنشاء نافذة الطباعة
                    const printWindow = window.open('', '_blank');
                    
                    if (!printWindow) {
                        showNotification('يرجى السماح بفتح النوافذ المنبثقة للطباعة', 'error');
                        return;
                    }
                    
                    // إعداد محتوى صفحة الطباعة
                    printWindow.document.write(`
                        <!DOCTYPE html>
                        <html dir="rtl">
                            <head>
                                <title>طباعة بطاقة المستثمر - ${card.investorName}</title>
                                <style>
                                    body {
                                        margin: 0;
                                        padding: 20px;
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                        justify-content: center;
                                        font-family: Arial, sans-serif;
                                    }
                                    
                                    .card-image-container {
                                        width: 100%;
                                        max-width: 500px;
                                        margin: 0 auto 20px;
                                        text-align: center;
                                    }
                                    
                                    .card-image {
                                        width: 100%;
                                        max-width: 100%;
                                        height: auto;
                                        border-radius: 10px;
                                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                                    }
                                    
                                    .card-info {
                                        width: 100%;
                                        max-width: 500px;
                                        margin: 0 auto;
                                        border-top: 1px solid #eee;
                                        padding-top: 20px;
                                    }
                                    
                                    .card-info-row {
                                        display: flex;
                                        margin-bottom: 8px;
                                    }
                                    
                                    .card-info-label {
                                        flex: 1;
                                        font-weight: bold;
                                        color: #555;
                                    }
                                    
                                    .card-info-value {
                                        flex: 2;
                                    }
                                    
                                    .print-instructions {
                                        margin-top: 30px;
                                        padding: 10px;
                                        border: 1px dashed #ccc;
                                        border-radius: 5px;
                                        font-size: 12px;
                                        color: #666;
                                        text-align: center;
                                    }
                                    
                                    @media print {
                                        .print-instructions,
                                        .print-button {
                                            display: none;
                                        }
                                        
                                        .card-image {
                                            box-shadow: none;
                                        }
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="card-image-container">
                                    <img src="${imgData}" alt="بطاقة المستثمر" class="card-image">
                                </div>
                                
                                <div class="card-info">
                                    <div class="card-info-row">
                                        <div class="card-info-label">اسم المستثمر:</div>
                                        <div class="card-info-value">${card.investorName}</div>
                                    </div>
                                    <div class="card-info-row">
                                        <div class="card-info-label">رقم البطاقة:</div>
                                        <div class="card-info-value">${formatCardNumber(card.cardNumber)}</div>
                                    </div>
                                    <div class="card-info-row">
                                        <div class="card-info-label">تاريخ الإصدار:</div>
                                        <div class="card-info-value">${formatDate(card.createdAt)}</div>
                                    </div>
                                    <div class="card-info-row">
                                        <div class="card-info-label">تاريخ الانتهاء:</div>
                                        <div class="card-info-value">${formatDate(card.expiryDate)}</div>
                                    </div>
                                </div>
                                
                                <div class="print-instructions">
                                    للطباعة بشكل صحيح، يرجى الضغط على Ctrl+P (أو Command+P على Mac) ثم اختيار الطباعة بدون هوامش.
                                </div>
                                
                                <button class="print-button" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background-color: #3b82f6; color: #fff; border: none; border-radius: 5px; cursor: pointer;">طباعة البطاقة</button>
                            </body>
                        </html>
                    `);
                    
                    // إغلاق document.write
                    printWindow.document.close();
                    
                    // عرض رسالة نجاح
                    showNotification('تم تجهيز البطاقة للطباعة بنجاح', 'success');
                }).catch(error => {
                    console.error('خطأ في تحويل البطاقة إلى صورة:', error);
                    showNotification('حدث خطأ أثناء تجهيز البطاقة للطباعة', 'error');
                    document.body.removeChild(tempContainer);
                });
            } else {
                console.error('مكتبة html2canvas غير متاحة');
                showNotification('لا يمكن طباعة البطاقة، مكتبة الطباعة غير متاحة', 'error');
                document.body.removeChild(tempContainer);
            }
        }, 500); // انتظار نصف ثانية لضمان تحميل جميع العناصر
    }
    
    /**
     * إيقاف البطاقة الحالية
     */
    function deactivateCurrentCard() {
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
        
        if (card.status === 'active') {
            // إيقاف البطاقة
            const confirm = window.confirm('هل أنت متأكد من رغبتك في إيقاف هذه البطاقة؟');
            if (!confirm) {
                return;
            }
            
            // تحديث حالة البطاقة
            card.status = 'inactive';
            card.deactivatedAt = new Date().toISOString();
            
            // حفظ التغييرات
            saveInvestorCards(cards);
            
            // تحديث العرض
            showCardDetails(currentCardId);
            
            // عرض رسالة نجاح
            showNotification('تم إيقاف البطاقة بنجاح', 'success');
        } else {
            // حذف البطاقة
            const confirm = window.confirm('هل أنت متأكد من رغبتك في حذف هذه البطاقة نهائيًا؟');
            if (!confirm) {
                return;
            }
            
            // حذف البطاقة من المصفوفة
            const updatedCards = cards.filter(c => c.id !== currentCardId);
            
            // حفظ التغييرات
            saveInvestorCards(updatedCards);
            
            // إغلاق النافذة المنبثقة
            closeModal('show-card-modal');
            
            // تحديث عرض البطاقات
            renderInvestorCards();
            
            // تحديث الإحصائيات
            updateCardStatistics();
            
            // عرض رسالة نجاح
            showNotification('تم حذف البطاقة بنجاح', 'success');
        }
    }
    
    /**
     * طباعة جميع البطاقات
     */
    function printAllCards() {
        // الحصول على البطاقات النشطة
        const cards = getInvestorCards().filter(card => card.status === 'active');
        
        if (cards.length === 0) {
            showNotification('لا توجد بطاقات نشطة للطباعة', 'warning');
            return;
        }
        
        // تأكيد الطباعة
        const confirm = window.confirm(`هل أنت متأكد من رغبتك في طباعة ${cards.length} بطاقة؟`);
        if (!confirm) {
            return;
        }
        
        // عرض رسالة انتظار
        showNotification(`جاري تجهيز ${cards.length} بطاقة للطباعة...`, 'info');
        
        // إنشاء عنصر للطباعة
        const printWindow = window.open('', '_blank');
        
        if (!printWindow) {
            showNotification('يرجى السماح بفتح النوافذ المنبثقة للطباعة', 'error');
            return;
        }
        
        // إنشاء الهيكل الأساسي للصفحة
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl">
                <head>
                    <title>طباعة بطاقات المستثمرين</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 20px;
                            font-family: Arial, sans-serif;
                        }
                        
                        .cards-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                            gap: 20px;
                        }
                        
                        .card-container {
                            page-break-inside: avoid;
                            margin-bottom: 20px;
                        }
                        
                        .card-image {
                            width: 100%;
                            border-radius: 10px;
                            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                        }
                        
                        .card-info {
                            margin-top: 10px;
                            border-top: 1px solid #eee;
                            padding-top: 10px;
                            font-size: 12px;
                        }
                        
                        .card-info-row {
                            display: flex;
                            margin-bottom: 4px;
                        }
                        
                        .card-info-label {
                            flex: 1;
                            font-weight: bold;
                            color: #555;
                        }
                        
                        .card-info-value {
                            flex: 2;
                        }
                        
                        .print-instructions {
                            margin: 20px 0;
                            padding: 10px;
                            border: 1px dashed #ccc;
                            border-radius: 5px;
                            font-size: 12px;
                            color: #666;
                            text-align: center;
                        }
                        
                        @media print {
                            .print-instructions,
                            .print-button {
                                display: none;
                            }
                            
                            .card-image {
                                box-shadow: none;
                            }
                            
                            .card-container {
                                page-break-after: always;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-instructions">
                        سيتم طباعة ${cards.length} بطاقة. للطباعة بشكل صحيح، يرجى الضغط على Ctrl+P (أو Command+P على Mac) ثم اختيار الطباعة بدون هوامش.
                    </div>
                    
                    <button class="print-button" onclick="window.print()" style="margin-bottom: 20px; padding: 10px 20px; background-color: #3b82f6; color: #fff; border: none; border-radius: 5px; cursor: pointer;">طباعة جميع البطاقات</button>
                    
                    <div class="cards-grid" id="cards-grid-container">
                        <!-- سيتم إضافة البطاقات هنا -->
                    </div>
                </body>
            </html>
        `);
        
        // استخدام Promise للتعامل مع تحويل البطاقات إلى صور بشكل متسلسل
        let cardPromises = [];
        let tempElements = [];
        
        // إنشاء عناصر مؤقتة للبطاقات
        cards.forEach((card, index) => {
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'fixed';
            tempContainer.style.top = `-${9999 + (index * 100)}px`;
            tempContainer.style.left = '-9999px';
            document.body.appendChild(tempContainer);
            tempElements.push(tempContainer);
            
            // عرض البطاقة في العنصر المؤقت
            renderCardHTML(tempContainer, card);
            
            // إضافة وعد لتحويل البطاقة إلى صورة
            const promise = new Promise((resolve) => {
                setTimeout(() => {
                    if (typeof html2canvas !== 'undefined') {
                        html2canvas(tempContainer.querySelector('.investor-card'), {
                            scale: 2,
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: null
                        }).then(canvas => {
                            resolve({
                                card: card,
                                imgData: canvas.toDataURL('image/png')
                            });
                        }).catch(error => {
                            console.error(`خطأ في تحويل البطاقة ${index + 1} إلى صورة:`, error);
                            resolve({
                                card: card,
                                imgData: null
                            });
                        });
                    } else {
                        resolve({
                            card: card,
                            imgData: null
                        });
                    }
                }, 200 * index); // توقيت متدرج لتجنب التداخل
            });
            
            cardPromises.push(promise);
        });
        
        // معالجة جميع الوعود
        Promise.all(cardPromises).then(results => {
            // إزالة العناصر المؤقتة
            tempElements.forEach(element => {
                document.body.removeChild(element);
            });
            
            // الحصول على حاوية البطاقات
            const cardsContainer = printWindow.document.getElementById('cards-grid-container');
            
            // إضافة كل بطاقة إلى الصفحة
            results.forEach(result => {
                if (result.imgData) {
                    const cardElement = printWindow.document.createElement('div');
                    cardElement.className = 'card-container';
                    
                    cardElement.innerHTML = `
                        <img src="${result.imgData}" alt="بطاقة المستثمر ${result.card.investorName}" class="card-image">
                        <div class="card-info">
                            <div class="card-info-row">
                                <div class="card-info-label">الاسم:</div>
                                <div class="card-info-value">${result.card.investorName}</div>
                            </div>
                            <div class="card-info-row">
                                <div class="card-info-label">رقم البطاقة:</div>
                                <div class="card-info-value">${formatCardNumber(result.card.cardNumber)}</div>
                            </div>
                            <div class="card-info-row">
                                <div class="card-info-label">تاريخ الانتهاء:</div>
                                <div class="card-info-value">${formatDate(result.card.expiryDate)}</div>
                            </div>
                        </div>
                    `;
                    
                    cardsContainer.appendChild(cardElement);
                }
            });
            
            // إغلاق document.write
            printWindow.document.close();
            
            // عرض رسالة نجاح
            showNotification('تم تجهيز البطاقات للطباعة بنجاح', 'success');
        }).catch(error => {
            console.error('خطأ في تجهيز البطاقات للطباعة:', error);
            showNotification('حدث خطأ أثناء تجهيز البطاقات للطباعة', 'error');
            
            // إزالة العناصر المؤقتة
            tempElements.forEach(element => {
                if (document.body.contains(element)) {
                    document.body.removeChild(element);
                }
            });
        });
    }
    
    /**
     * تصدير بيانات البطاقات
     */
    function exportCards() {
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
     * عرض البطاقات في الصفحة
     */
    function renderInvestorCards() {
        const container = document.getElementById('investor-cards-container');
        if (!container) return;
        
        // الحصول على البطاقات
        const cards = getInvestorCards();
        
        // تحديث المصفوفة الداخلية
        cardsData = [...cards];
        
        // التحقق من وجود بطاقات
        if (cards.length === 0) {
            container.innerHTML = `
                <div class="empty-cards-message">
                    <i class="fas fa-credit-card"></i>
                    <p>لم يتم إنشاء بطاقات بعد</p>
                    <button class="btn btn-primary btn-sm" id="create-first-card-btn">
                        <i class="fas fa-plus"></i>
                        <span>إنشاء بطاقة جديدة</span>
                    </button>
                </div>
            `;
            
            // إضافة مستمع الحدث لزر إنشاء البطاقة الأولى
            const createBtn = container.querySelector('#create-first-card-btn');
            if (createBtn) {
                createBtn.addEventListener('click', () => {
                    openCreateCardModal();
                });
            }
            
            return;
        }
        
        // ترتيب البطاقات (النشطة أولاً، ثم حسب تاريخ الإنشاء من الأحدث للأقدم)
        const sortedCards = [...cards].sort((a, b) => {
            // ترتيب حسب الحالة
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (a.status !== 'active' && b.status === 'active') return 1;
            
            // ترتيب حسب تاريخ الإنشاء
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // إنشاء عناصر البطاقات
        container.innerHTML = '';
        
        sortedCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'investor-card-container';
            
            renderCardHTML(cardElement, card);
            
            // إضافة مستمع الحدث للنقر
            cardElement.querySelector('.investor-card').addEventListener('click', () => {
                openShowCardModal(card.id);
            });
            
            // إضافة مستمع الحدث للقلب
            cardElement.querySelector('.investor-card').addEventListener('dblclick', function() {
                this.classList.toggle('flipped');
            });
            
            container.appendChild(cardElement);
        });
    }
    
    /**
     * عرض بطاقة بصيغة HTML
     * @param {HTMLElement} container العنصر الذي سيحتوي على البطاقة
     * @param {Object} card بيانات البطاقة
     */
    function renderCardHTML(container, card) {
        // تحويل تاريخ الانتهاء إلى الصيغة المناسبة
        const expiryDate = new Date(card.expiryDate);
        const expMonth = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
        const expYear = expiryDate.getFullYear().toString().substr(2);
        
        // التأكد من وجود الاسم الإنجليزي
        const englishName = card.englishName || translateNameToEnglish(card.investorName);
        
        // إنشاء عنصر البطاقة
        container.innerHTML = `
            <div class="investor-card ${card.cardType} ${card.status !== 'active' ? 'inactive' : ''}" data-id="${card.id}">
                <div class="investor-card-inner">
                    <div class="investor-card-front">
                        <div class="card-brand-logo">MASTERCARD</div>
                        <div class="mastercard-logo">
                            <div class="circle circle-red"></div>
                            <div class="circle circle-yellow"></div>
                        </div>
                        <div class="card-qrcode" id="qrcode-${card.id}"></div>
                        <div class="card-number">
                            ${formatCardNumber(card.cardNumber)}
                        </div>
                        <div class="card-valid">
                            <div class="valid-label">VALID</div>
                            <div class="valid-date">${expMonth}/${expYear}</div>
                        </div>
                        <div class="cardholder-label">حامل البطاقة</div>
                        <div class="card-holder">
                            <div class="card-holder-name">${englishName}</div>
                        </div>
                        ${card.status !== 'active' ? '<div class="card-inactive-overlay">غير نشطة</div>' : ''}
                    </div>
                    <div class="investor-card-back">
                        <div class="card-magnetic-stripe"></div>
                        <div class="card-signature">
                            <div class="card-signature-text">${englishName}</div>
                        </div>
                        <div class="card-cvv">CVV: ${card.cvv}</div>
                        <div class="card-barcode-container">
                            <div class="card-barcode" id="barcode-${card.id}"></div>
                            <div class="card-barcode-number">${card.barcode}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إنشاء QR كود للبطاقة
        setTimeout(() => {
            const qrcodeElement = document.getElementById(`qrcode-${card.id}`);
            if (qrcodeElement && typeof QRCode !== 'undefined') {
                try {
                    // مسح المحتوى السابق
                    while (qrcodeElement.firstChild) {
                        qrcodeElement.removeChild(qrcodeElement.firstChild);
                    }
                    
                    // إنشاء QR كود جديد
                    new QRCode(qrcodeElement, {
                        text: `INVESTOR:${card.investorId}|CARD:${card.cardNumber}`,
                        width: 60,
                        height: 60,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                    
                    // تطبيق التأثير الذهبي
                    qrcodeElement.classList.add('qrcode-golden');
                } catch (error) {
                    console.error('خطأ في إنشاء QR كود:', error);
                }
            }
            
            // إنشاء الباركود
            const barcodeElement = document.getElementById(`barcode-${card.id}`);
            if (barcodeElement && typeof JsBarcode !== 'undefined') {
                try {
                    JsBarcode(barcodeElement, card.barcode, {
                        format: "CODE128",
                        width: 1.5,
                        height: 40,
                        displayValue: false
                    });
                } catch (error) {
                    console.error('خطأ في إنشاء الباركود:', error);
                    barcodeElement.innerHTML = `<div style="text-align: center; color: red;">خطأ في الباركود</div>`;
                }
            }
        }, 100);
    }
    
    /**
     * تحديث إحصائيات البطاقات
     */
    function updateCardStatistics() {
        // الحصول على البطاقات
        const cards = getInvestorCards();
        
        // عدد البطاقات الإجمالي
        const totalCards = cards.length;
        const totalCardsElement = document.getElementById('total-cards-count');
        if (totalCardsElement) {
            totalCardsElement.textContent = totalCards;
        }
        
        // عدد البطاقات النشطة
        const activeCards = cards.filter(card => card.status === 'active').length;
        const activeCardsElement = document.getElementById('active-cards-count');
        if (activeCardsElement) {
            activeCardsElement.textContent = activeCards;
        }
        
        // عدد البطاقات المنتهية
        const currentDate = new Date();
        const expiredCards = cards.filter(card => {
            return card.status === 'active' && new Date(card.expiryDate) < currentDate;
        }).length;
        const expiredCardsElement = document.getElementById('expired-cards-count');
        if (expiredCardsElement) {
            expiredCardsElement.textContent = expiredCards;
        }
    }
    
    /**
     * تحديث تاريخ آخر مسح
     */
    function updateLastScanDate() {
        const now = new Date();
        const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        
        const lastScanElement = document.getElementById('last-scan-date');
        if (lastScanElement) {
            lastScanElement.textContent = formattedDate;
        }
    }
    
    /**
     * تصفية البطاقات حسب النوع
     * @param {string} filterType نوع التصفية
     */
    function filterCards(filterType) {
        const container = document.getElementById('investor-cards-container');
        if (!container) return;
        
        // الحصول على جميع البطاقات
        const cardElements = container.querySelectorAll('.investor-card-container');
        
        // تصفية حسب النوع
        cardElements.forEach(element => {
            const card = element.querySelector('.investor-card');
            if (!card) return;
            const isActive = !card.classList.contains('inactive');
            
            switch (filterType) {
                case 'active':
                    element.style.display = isActive ? 'block' : 'none';
                    break;
                case 'inactive':
                    element.style.display = !isActive ? 'block' : 'none';
                    break;
                default:
                    element.style.display = 'block';
                    break;
            }
        });
    }
    
    /**
     * البحث في البطاقات
     * @param {string} searchText نص البحث
     */
    function searchCards(searchText) {
        if (!searchText) {
            // إعادة عرض جميع البطاقات
            const activeFilterBtn = document.querySelector('[data-card-filter].active');
            if (activeFilterBtn) {
                const filterType = activeFilterBtn.getAttribute('data-card-filter');
                filterCards(filterType);
            } else {
                filterCards('all');
            }
            return;
        }
        
        // البحث في البطاقات
        const cards = getInvestorCards();
        const filteredCards = cards.filter(card => {
            return (
                card.investorName.toLowerCase().includes(searchText.toLowerCase()) ||
                (card.englishName && card.englishName.toLowerCase().includes(searchText.toLowerCase())) ||
                card.investorPhone.includes(searchText) ||
                card.cardNumber.replace(/\s/g, '').includes(searchText.replace(/\s/g, '')) ||
                card.barcode.includes(searchText)
            );
        });
        
        // عرض البطاقات المطابقة فقط
        const container = document.getElementById('investor-cards-container');
        if (!container) return;
        
        // التحقق من وجود بطاقات مطابقة
        if (filteredCards.length === 0) {
            container.innerHTML = `
                <div class="empty-search-results">
                    <i class="fas fa-search"></i>
                    <p>لم يتم العثور على نتائج للبحث: "${searchText}"</p>
                </div>
            `;
            return;
        }
        
        // إخفاء جميع البطاقات أولاً
        const cardElements = container.querySelectorAll('.investor-card-container');
        cardElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // إظهار البطاقات المطابقة فقط
        const cardIds = new Set(filteredCards.map(card => card.id));
        cardElements.forEach(element => {
            const card = element.querySelector('.investor-card');
            if (card && cardIds.has(card.getAttribute('data-id'))) {
                element.style.display = 'block';
            }
        });
    }
    
    /**
     * تحميل بيانات البطاقات
     */
    function loadCardsData() {
        const cards = getInvestorCards();
        cardsData = [...cards];
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
            return [];
        }
        
        // تحويل البيانات إلى كائن
        try {
            return JSON.parse(cardsString);
        } catch (error) {
            console.error('خطأ في تحليل بيانات البطاقات:', error);
            return [];
        }
    }
    
    /**
     * حفظ بطاقات المستثمرين
     * @param {Array} cards مصفوفة البطاقات
     * @returns {boolean} نجاح أو فشل العملية
     */
    function saveInvestorCards(cards) {
        // التحقق من صحة البيانات
        if (!Array.isArray(cards)) {
            console.error('البيانات المراد حفظها ليست مصفوفة');
            return false;
        }
        
        // تحديث المصفوفة الداخلية
        cardsData = [...cards];
        
        // حفظ البيانات في التخزين المحلي
        try {
            localStorage.setItem('investorCards', JSON.stringify(cards));
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
        const idPart = investorId.replace(/\D/g, '').substr(0, 6).padStart(6, '0');
        
        // إنشاء رقم مكون من 16 رقم
        let cardNumber = '5' + idPart + now.substr(-9);
        
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
        const idPart = investorId.replace(/\D/g, '').substr(0, 5).padStart(5, '0');
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
     * تحويل اسم عربي إلى إنجليزي
     * @param {string} arabicName الاسم بالعربية
     * @returns {string} الاسم بالإنجليزية
     */
    function translateNameToEnglish(arabicName) {
        if (!arabicName) return '';
        
        // قاموس بسيط للحروف الشائعة
        const dictionary = {
            'ا': 'A', 'أ': 'A', 'إ': 'E', 'آ': 'A',
            'ب': 'B', 'ت': 'T', 'ث': 'TH',
            'ج': 'J', 'ح': 'H', 'خ': 'KH',
            'د': 'D', 'ذ': 'TH', 'ر': 'R',
            'ز': 'Z', 'س': 'S', 'ش': 'SH',
            'ص': 'S', 'ض': 'D', 'ط': 'T',
            'ظ': 'Z', 'ع': 'A', 'غ': 'GH',
            'ف': 'F', 'ق': 'Q', 'ك': 'K',
            'ل': 'L', 'م': 'M', 'ن': 'N',
            'ه': 'H', 'و': 'W', 'ي': 'Y',
            'ى': 'A', 'ة': 'A', 'ء': '',
            ' ': ' ', '-': '-'
        };
        
        // تحويل كل حرف
        let englishName = '';
        for (let i = 0; i < arabicName.length; i++) {
            const char = arabicName[i];
            englishName += dictionary[char] || char;
        }
        
        // تنسيق الاسم (حرف كبير للكلمة)
        return englishName.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
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
        return date.toLocaleDateString('ar-SA');
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
        const formattedAmount = amount.toLocaleString('ar-SA', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0
        });
        
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
        
        alert(message);
    }
    
    // تصدير واجهة برمجة التطبيق
    return {
        initialize,
        renderInvestorCards,
        openCreateCardModal,
        openScanCardModal,
        showCardDetails,
        printAllCards,
        exportCards,
        importCards,
        currentCardId,
        
        // للاستخدام الداخلي
        _getInvestorCards: getInvestorCards
    };
})();

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نظام البطاقات
    InvestorCardSystem.initialize()
        .then(() => {
            console.log('تم تهيئة نظام بطاقات المستثمرين بنجاح');
            
            // تحديث عرض البطاقات إذا كانت صفحة البطاقات مفتوحة
            if (document.getElementById('investor-cards-page')?.classList.contains('active')) {
                InvestorCardSystem.renderInvestorCards();
            }
        })
        .catch(error => {
            console.error('فشل في تهيئة نظام بطاقات المستثمرين:', error);
        });
});