/**
 * investor-card-system.js
 * نظام بطاقات المستثمرين المتكامل - النسخة المطورة
 * يتيح إنشاء وإدارة وعرض بطاقات ماستر كارد للمستثمرين
 * مع إمكانية قراءة الباركود وعرض المعلومات
 * 
 * الإصدار: 2.0
 * تاريخ التحديث: 2025-04-29
 */

// كائن عام لإدارة نظام البطاقات
const InvestorCardSystem = (function() {
    // المتغيرات الخاصة
    let cardTemplate = null;
    let cardScanner = null;
    let isInitialized = false;
    let currentCardId = null;
    let cameraMode = 'environment'; // إعداد الكاميرا الافتراضي (الخلفية)
    
    // إعدادات النظام
    const SYSTEM_CONFIG = {
        defaultCardType: 'default',
        cardExpiryYears: 1, // مدة صلاحية البطاقة بالسنوات
        maxActiveCards: 0, // 0 تعني بلا حدود
        enableCardFlip: true,
        enableBarcode: true,
        enableQR: true,
        cardNumberPrefix: '4', // بادئة رقم البطاقة (4 لفيزا، 5 لماستركارد)
        defaultCurrency: 'دينار',
        enableAnimations: true,
        enableCardSharing: true,
        cardBackgroundEffects: true,
        showCardHologram: true,
        autoGeneratePin: false,
        printFormat: 'credit-card', // 'credit-card', 'a4-sheet'
        barcodeType: 'code128', // 'code128', 'ean13', 'qr'
    };
    
    // ألوان وأنماط البطاقات
    const CARD_STYLES = {
        default: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: '#ffffff',
            accent: '#ffd700',
            pattern: 'circles',
            fontFamily: 'Tajawal, sans-serif',
            logoColor: '#ffffff'
        },
        gold: {
            background: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)',
            color: '#000000',
            accent: '#ffffff',
            pattern: 'lines',
            fontFamily: 'Tajawal, sans-serif',
            logoColor: '#000000'
        },
        platinum: {
            background: 'linear-gradient(135deg, #7a7a7a 0%, #c0c0c0 100%)',
            color: '#000000',
            accent: '#0a0a0a',
            pattern: 'dots',
            fontFamily: 'Tajawal, sans-serif',
            logoColor: '#000000'
        },
        premium: {
            background: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
            color: '#ffffff',
            accent: '#ff9d00',
            pattern: 'waves',
            fontFamily: 'Tajawal, sans-serif',
            logoColor: '#ffffff'
        },
        diamond: {
            background: 'linear-gradient(135deg, #200122 0%, #6f0000 100%)',
            color: '#ffffff',
            accent: '#9d0b0b',
            pattern: 'diamonds',
            fontFamily: 'Tajawal, sans-serif',
            logoColor: '#ffffff'
        },
        islamic: {
            background: 'linear-gradient(135deg, #004d40 0%, #00796b 100%)',
            color: '#ffffff',
            accent: '#d4af37',
            pattern: 'islamic',
            fontFamily: 'Tajawal, sans-serif',
            logoColor: '#ffffff'
        },
        custom: {
            background: 'linear-gradient(135deg, #614385 0%, #516395 100%)',
            color: '#ffffff',
            accent: '#bbdefb',
            pattern: 'custom',
            fontFamily: 'Tajawal, sans-serif',
            logoColor: '#ffffff'
        }
    };
    
    /**
     * تهيئة نظام البطاقات
     * @param {Object} options خيارات التهيئة
     * @returns {Promise} وعد بنجاح أو فشل التهيئة
     */
    function initialize(options = {}) {
        return new Promise((resolve, reject) => {
            if (isInitialized) {
                resolve(true);
                return;
            }
            
            console.log('جاري تهيئة نظام بطاقات المستثمرين...');
            
            try {
                // دمج الخيارات مع الإعدادات الافتراضية
                mergeConfig(options);
                
                // إضافة عنصر القائمة في الشريط الجانبي
                addSidebarMenuItem();
                
                // إنشاء صفحة البطاقات
                createCardsPage();
                
                // إضافة النوافذ المنبثقة اللازمة
                addCardModals();
                
                // إضافة أنماط CSS
                addCardStyles();
                
                // تحميل الخطوط العربية إذا لم تكن موجودة
                loadArabicFonts();
                
                // تحميل مكتبات الباركود
                loadBarcodeDependencies()
                    .then(() => {
                        // تهيئة قارئ الباركود
                        initBarcodeScanner();
                        
                        // تهيئة معاينة البطاقات
                        initCardTemplates();
                        
                        // تحديث إحصائيات البطاقات
                        updateCardStatistics();
                        
                        // عرض البطاقات الحالية
                        renderInvestorCards();
                        
                        isInitialized = true;
                        console.log('تم تهيئة نظام بطاقات المستثمرين بنجاح');
                        resolve(true);
                    })
                    .catch(error => {
                        console.error('فشل في تحميل مكتبات الباركود:', error);
                        // استمر رغم الفشل، ولكن بدون ميزة الباركود
                        SYSTEM_CONFIG.enableBarcode = false;
                        SYSTEM_CONFIG.enableQR = false;
                        
                        // تهيئة معاينة البطاقات
                        initCardTemplates();
                        
                        // تحديث إحصائيات البطاقات
                        updateCardStatistics();
                        
                        // عرض البطاقات الحالية
                        renderInvestorCards();
                        
                        isInitialized = true;
                        showNotification('تم التهيئة بدون دعم الباركود، يرجى التحقق من اتصال الإنترنت.', 'warning');
                        resolve(true);
                    });
                },
                
                validateBarcode: function(code) {
                    // التحقق من طول الرمز (يجب أن يكون على الأقل 8 أرقام)
                    if (!code || code.length < 8) {
                        return false;
                    }
                    
                    // التحقق من أن الرمز يحتوي على أرقام فقط للباركود العادي
                    if (SYSTEM_CONFIG.barcodeType !== 'qr' && !/^\d+$/.test(code)) {
                        return false;
                    }
                    
                    return true;
                },
                
                onDetect: function(code) {
                    const resultElement = document.querySelector('#scan-result');
                    resultElement.textContent = `تم العثور على الرمز: ${code}`;
                    resultElement.classList.add('success');
                    
                    // تسجيل وقت المسح
                    const scanLog = {
                        code: code,
                        timestamp: new Date().toISOString(),
                        success: false
                    };
                    
                    // إيقاف المسح بعد اكتشاف الرمز
                    Quagga.stop();
                    
                    // البحث عن البطاقة بالرمز
                    const card = this.findCardByBarcode(code);
                    if (card) {
                        // تحديث وقت آخر مسح
                        updateLastScanDate();
                        
                        // تحديث سجل المسح
                        scanLog.success = true;
                        scanLog.cardId = card.id;
                        saveCardScan(scanLog);
                        
                        // إغلاق نافذة المسح
                        closeModal('scan-card-modal');
                        
                        // عرض بيانات البطاقة
                        showCardDetails(card.id);
                    } else {
                        resultElement.textContent = `لم يتم العثور على بطاقة بالرمز: ${code}`;
                        resultElement.classList.remove('success');
                        resultElement.classList.add('error');
                        
                        // تسجيل المسح الفاشل
                        saveCardScan(scanLog);
                        
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
                    return cards.find(card => card.barcode === code || card.cardNumber.replace(/\s/g, '') === code);
                },
                
                toggleCamera: function() {
                    Quagga.stop();
                    
                    // تبديل الكاميرا الأمامية/الخلفية
                    cameraMode = cameraMode === "environment" ? "user" : "environment";
                    
                    // تحديث حالة زر تبديل الكاميرا
                    const toggleCameraBtn = document.getElementById('toggle-camera-btn');
                    if (toggleCameraBtn) {
                        toggleCameraBtn.innerHTML = `<i class="fas fa-camera"></i><span>${cameraMode === 'environment' ? 'الكاميرا الأمامية' : 'الكاميرا الخلفية'}</span>`;
                    }
                    
                    // إعادة تهيئة الماسح بالكاميرا الجديدة
                    this.init('barcode-scanner-region');
                },
                
                toggleFlash: function() {
                    const track = Quagga.CameraAccess.getActiveTrack();
                    
                    if (track && typeof track.getCapabilities === 'function') {
                        const capabilities = track.getCapabilities();
                        
                        if (capabilities.torch) {
                            // حالة الفلاش الحالية
                            const currentState = track.getConstraints().advanced?.[0]?.torch || false;
                            
                            track.applyConstraints({
                                advanced: [{torch: !currentState}]
                            }).then(() => {
                                console.log(`تم ${!currentState ? 'تشغيل' : 'إيقاف'} الفلاش`);
                                
                                // تحديث حالة زر الفلاش
                                const toggleFlashBtn = document.getElementById('toggle-flash-btn');
                                if (toggleFlashBtn) {
                                    toggleFlashBtn.innerHTML = `<i class="fas fa-bolt"></i><span>${!currentState ? 'إيقاف الفلاش' : 'تشغيل الفلاش'}</span>`;
                                }
                            });
                        } else {
                            console.log('الفلاش غير متاح في هذا الجهاز');
                            showNotification('الفلاش غير متاح في هذا الجهاز', 'warning');
                        }
                    } else {
                        console.log('لا يمكن الوصول إلى إعدادات الكاميرا');
                        showNotification('لا يمكن الوصول إلى إعدادات الكاميرا', 'error');
                    }
                }
            } catch (error) {
                console.error('خطأ في تهيئة نظام بطاقات المستثمرين:', error);
                reject(error);
            }
        });
    }
    
    /**
     * دمج الإعدادات المخصصة مع الإعدادات الافتراضية
     * @param {Object} options الإعدادات المخصصة
     */
    function mergeConfig(options) {
        // دمج الإعدادات
        for (const key in options) {
            if (SYSTEM_CONFIG.hasOwnProperty(key)) {
                SYSTEM_CONFIG[key] = options[key];
            }
        }
        
        // حفظ الإعدادات في التخزين المحلي للاستخدام في المستقبل
        try {
            localStorage.setItem('investorCardSystemConfig', JSON.stringify(SYSTEM_CONFIG));
        } catch (error) {
            console.error('خطأ في حفظ إعدادات النظام:', error);
        }
    }
    
    /**
     * تحميل الإعدادات من التخزين المحلي
     */
    function loadConfig() {
        try {
            const savedConfig = localStorage.getItem('investorCardSystemConfig');
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                mergeConfig(parsedConfig);
            }
        } catch (error) {
            console.error('خطأ في تحميل إعدادات النظام:', error);
        }
    }
    
    /**
     * تحميل الخطوط العربية
     */
    function loadArabicFonts() {
        // التحقق من وجود خط Tajawal
        if (!document.getElementById('tajawal-font')) {
            const fontLink = document.createElement('link');
            fontLink.id = 'tajawal-font';
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
            document.head.appendChild(fontLink);
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
        
        // البحث عن عنصر القائمة إذا كان موجودًا بالفعل
        const existingMenuItem = navList.querySelector('[data-page="investor-cards"]');
        if (existingMenuItem) {
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
                <span class="badge badge-primary cards-count"></span>
            </a>
        `;
        
        // إضافة عنصر القائمة قبل عنصر الإعدادات
        const settingsItem = navList.querySelector('[data-page="settings"]');
        if (settingsItem && settingsItem.parentNode) {
            navList.insertBefore(menuItem, settingsItem.parentNode);
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
        
        // تحديث عدد البطاقات
        updateMenuCardCount();
    }
    
    /**
     * تحديث عدد البطاقات في القائمة
     */
    function updateMenuCardCount() {
        const cards = getInvestorCards();
        const activeCards = cards.filter(card => card.status === 'active').length;
        
        const countElement = document.querySelector('.nav-link[data-page="investor-cards"] .cards-count');
        if (countElement) {
            countElement.textContent = activeCards > 0 ? activeCards : '';
        }
    }
    
    /**
     * إظهار صفحة معينة
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
            
            // تحديث المحتوى إذا كانت صفحة البطاقات
            if (pageId === 'investor-cards') {
                renderInvestorCards();
                updateCardStatistics();
            }
        }
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
                            <button class="btn btn-outline btn-sm" data-card-filter="expired">منتهي</button>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-outline btn-sm" id="export-cards-btn" title="تصدير">
                                <i class="fas fa-file-export"></i>
                                <span>تصدير</span>
                            </button>
                            <button class="btn btn-outline btn-sm" id="import-cards-btn" title="استيراد">
                                <i class="fas fa-file-import"></i>
                                <span>استيراد</span>
                            </button>
                            <button class="btn btn-outline btn-sm" id="print-all-cards-btn" title="طباعة">
                                <i class="fas fa-print"></i>
                                <span>طباعة</span>
                            </button>
                            <button class="btn btn-outline btn-sm" id="settings-btn" title="إعدادات">
                                <i class="fas fa-cog"></i>
                                <span>إعدادات</span>
                            </button>
                        </div>
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
                
                <div class="pagination" id="cards-pagination">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">إحصائيات البطاقات</h2>
                    <div class="section-actions">
                        <button class="btn btn-outline btn-sm" id="refresh-stats-btn">
                            <i class="fas fa-sync"></i>
                            <span>تحديث</span>
                        </button>
                    </div>
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
                        <div class="card-footer">
                            <div class="stats-trend">
                                <span class="trend-icon"><i class="fas fa-chart-line"></i></span>
                                <span class="trend-value" id="total-cards-trend">-</span>
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
                        <div class="card-footer">
                            <div class="stats-trend">
                                <span class="trend-icon"><i class="fas fa-percentage"></i></span>
                                <span class="trend-value" id="active-cards-percentage">-</span>
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
                        <div class="card-footer">
                            <div class="stats-trend">
                                <span class="trend-icon"><i class="fas fa-calendar-times"></i></span>
                                <span class="trend-value" id="expired-cards-trend">-</span>
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
                        <div class="card-footer">
                            <div class="stats-trend">
                                <span class="trend-icon"><i class="fas fa-history"></i></span>
                                <span class="trend-value" id="scan-count">-</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-charts">
                    <div class="card chart-card">
                        <div class="card-header">
                            <h3>توزيع البطاقات حسب النوع</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container" id="card-types-chart">
                                <!-- سيتم إنشاؤه ديناميكيًا -->
                                <div class="chart-placeholder">
                                    <i class="fas fa-chart-pie"></i>
                                    <p>سيتم عرض الرسم البياني هنا</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card chart-card">
                        <div class="card-header">
                            <h3>إحصائيات البطاقات الشهرية</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container" id="monthly-cards-chart">
                                <!-- سيتم إنشاؤه ديناميكيًا -->
                                <div class="chart-placeholder">
                                    <i class="fas fa-chart-bar"></i>
                                    <p>سيتم عرض الرسم البياني هنا</p>
                                </div>
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
                        <div class="form-grid">
                            <div class="form-column">
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
                                        <option value="diamond">ماسية</option>
                                        <option value="islamic">إسلامية</option>
                                        <option value="custom">مخصصة</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">رقم سري للبطاقة (4 أرقام)</label>
                                    <div class="input-group">
                                        <input class="form-input" id="card-pin" type="text" maxlength="4" pattern="[0-9]{4}" placeholder="****" required>
                                        <button type="button" class="btn btn-sm" id="generate-pin-btn" title="توليد رقم سري">
                                            <i class="fas fa-dice"></i>
                                        </button>
                                    </div>
                                    <small class="form-hint">أدخل 4 أرقام فقط ليستخدمها المستثمر للتحقق</small>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">تاريخ الانتهاء</label>
                                    <input class="form-input" id="card-expiry" type="date" required>
                                </div>
                                
                                <div class="form-group card-custom-options" style="display: none;">
                                    <label class="form-label">خيارات مخصصة</label>
                                    
                                    <div class="form-subgroup">
                                        <label class="form-label-sm">لون الخلفية</label>
                                        <input class="form-input" id="card-custom-color" type="color" value="#614385">
                                    </div>
                                    
                                    <div class="form-subgroup">
                                        <label class="form-label-sm">لون النص</label>
                                        <input class="form-input" id="card-custom-text-color" type="color" value="#ffffff">
                                    </div>
                                    
                                    <div class="form-subgroup">
                                        <label class="form-label-sm">نمط البطاقة</label>
                                        <select class="form-select form-select-sm" id="card-custom-pattern">
                                            <option value="circles">دوائر</option>
                                            <option value="lines">خطوط</option>
                                            <option value="dots">نقاط</option>
                                            <option value="waves">أمواج</option>
                                            <option value="diamonds">معينات</option>
                                            <option value="islamic">إسلامي</option>
                                            <option value="none">بدون نمط</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-column">
                                <div class="card-preview-container">
                                    <h4>معاينة البطاقة</h4>
                                    <div class="card-preview" id="card-preview">
                                        <!-- سيتم ملؤها ديناميكيًا -->
                                    </div>
                                    <div class="preview-actions">
                                        <button type="button" class="btn btn-sm btn-outline" id="flip-preview-btn">
                                            <i class="fas fa-sync"></i>
                                            <span>قلب البطاقة</span>
                                        </button>
                                    </div>
                                </div>
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
                        <button class="btn btn-info" id="share-card-btn">
                            <i class="fas fa-share-alt"></i>
                            <span>مشاركة</span>
                        </button>
                        <button class="btn btn-success" id="print-card-btn">
                            <i class="fas fa-print"></i>
                            <span>طباعة</span>
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
                                <div class="scanner-reticle">
                                    <div class="scanner-corner top-left"></div>
                                    <div class="scanner-corner top-right"></div>
                                    <div class="scanner-corner bottom-left"></div>
                                    <div class="scanner-corner bottom-right"></div>
                                    <div class="scanner-line"></div>
                                </div>
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
        
        // إنشاء نافذة إعدادات النظام
        const settingsModal = document.createElement('div');
        settingsModal.className = 'modal-overlay';
        settingsModal.id = 'settings-modal';
        
        settingsModal.innerHTML = `
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">إعدادات نظام البطاقات</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <form id="settings-form">
                        <div class="settings-tabs">
                            <div class="tabs-nav">
                                <button type="button" class="tab-btn active" data-tab="general">عام</button>
                                <button type="button" class="tab-btn" data-tab="cards">البطاقات</button>
                                <button type="button" class="tab-btn" data-tab="appearance">المظهر</button>
                                <button type="button" class="tab-btn" data-tab="barcode">الباركود</button>
                            </div>
                            
                            <div class="tabs-content">
                                <div class="tab-pane active" id="general-tab">
                                    <div class="form-group">
                                        <label class="form-label">العملة الافتراضية</label>
                                        <input class="form-input" id="setting-currency" type="text" value="${SYSTEM_CONFIG.defaultCurrency}">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">الحد الأقصى للبطاقات النشطة للمستثمر</label>
                                        <input class="form-input" id="setting-max-cards" type="number" min="0" value="${SYSTEM_CONFIG.maxActiveCards}">
                                        <small class="form-hint">0 تعني بلا حدود</small>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">تشغيل التنبيهات للبطاقات المنتهية</label>
                                        <div class="toggle-switch">
                                            <input type="checkbox" id="setting-expiry-alerts" checked>
                                            <label for="setting-expiry-alerts"></label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tab-pane" id="cards-tab">
                                    <div class="form-group">
                                        <label class="form-label">نوع البطاقة الافتراضي</label>
                                        <select class="form-select" id="setting-default-card-type">
                                            <option value="default" ${SYSTEM_CONFIG.defaultCardType === 'default' ? 'selected' : ''}>قياسية</option>
                                            <option value="gold" ${SYSTEM_CONFIG.defaultCardType === 'gold' ? 'selected' : ''}>ذهبية</option>
                                            <option value="platinum" ${SYSTEM_CONFIG.defaultCardType === 'platinum' ? 'selected' : ''}>بلاتينية</option>
                                            <option value="premium" ${SYSTEM_CONFIG.defaultCardType === 'premium' ? 'selected' : ''}>بريميوم</option>
                                            <option value="diamond" ${SYSTEM_CONFIG.defaultCardType === 'diamond' ? 'selected' : ''}>ماسية</option>
                                            <option value="islamic" ${SYSTEM_CONFIG.defaultCardType === 'islamic' ? 'selected' : ''}>إسلامية</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">مدة صلاحية البطاقة (بالسنوات)</label>
                                        <input class="form-input" id="setting-card-expiry" type="number" min="1" max="10" value="${SYSTEM_CONFIG.cardExpiryYears}">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">بادئة رقم البطاقة</label>
                                        <select class="form-select" id="setting-card-prefix">
                                            <option value="4" ${SYSTEM_CONFIG.cardNumberPrefix === '4' ? 'selected' : ''}>4 (فيزا)</option>
                                            <option value="5" ${SYSTEM_CONFIG.cardNumberPrefix === '5' ? 'selected' : ''}>5 (ماستركارد)</option>
                                            <option value="6" ${SYSTEM_CONFIG.cardNumberPrefix === '6' ? 'selected' : ''}>6 (سوبرمان)</option>
                                            <option value="9" ${SYSTEM_CONFIG.cardNumberPrefix === '9' ? 'selected' : ''}>9 (مخصص)</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">توليد تلقائي للرقم السري</label>
                                        <div class="toggle-switch">
                                            <input type="checkbox" id="setting-auto-pin" ${SYSTEM_CONFIG.autoGeneratePin ? 'checked' : ''}>
                                            <label for="setting-auto-pin"></label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tab-pane" id="appearance-tab">
                                    <div class="form-group">
                                        <label class="form-label">تمكين التأثيرات البصرية</label>
                                        <div class="toggle-switch">
                                            <input type="checkbox" id="setting-animations" ${SYSTEM_CONFIG.enableAnimations ? 'checked' : ''}>
                                            <label for="setting-animations"></label>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">تمكين تأثيرات خلفية البطاقة</label>
                                        <div class="toggle-switch">
                                            <input type="checkbox" id="setting-card-bg-effects" ${SYSTEM_CONFIG.cardBackgroundEffects ? 'checked' : ''}>
                                            <label for="setting-card-bg-effects"></label>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">إظهار هولوجرام البطاقة</label>
                                        <div class="toggle-switch">
                                            <input type="checkbox" id="setting-card-hologram" ${SYSTEM_CONFIG.showCardHologram ? 'checked' : ''}>
                                            <label for="setting-card-hologram"></label>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">تمكين قلب البطاقة</label>
                                        <div class="toggle-switch">
                                            <input type="checkbox" id="setting-enable-flip" ${SYSTEM_CONFIG.enableCardFlip ? 'checked' : ''}>
                                            <label for="setting-enable-flip"></label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tab-pane" id="barcode-tab">
                                    <div class="form-group">
                                        <label class="form-label">تمكين الباركود</label>
                                        <div class="toggle-switch">
                                            <input type="checkbox" id="setting-enable-barcode" ${SYSTEM_CONFIG.enableBarcode ? 'checked' : ''}>
                                            <label for="setting-enable-barcode"></label>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">تمكين رمز QR</label>
                                        <div class="toggle-switch">
                                            <input type="checkbox" id="setting-enable-qr" ${SYSTEM_CONFIG.enableQR ? 'checked' : ''}>
                                            <label for="setting-enable-qr"></label>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">نوع الباركود</label>
                                        <select class="form-select" id="setting-barcode-type">
                                            <option value="code128" ${SYSTEM_CONFIG.barcodeType === 'code128' ? 'selected' : ''}>Code 128</option>
                                            <option value="ean13" ${SYSTEM_CONFIG.barcodeType === 'ean13' ? 'selected' : ''}>EAN-13</option>
                                            <option value="qr" ${SYSTEM_CONFIG.barcodeType === 'qr' ? 'selected' : ''}>QR Code</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">تنسيق الطباعة</label>
                                        <select class="form-select" id="setting-print-format">
                                            <option value="credit-card" ${SYSTEM_CONFIG.printFormat === 'credit-card' ? 'selected' : ''}>بطاقة ائتمان</option>
                                            <option value="a4-sheet" ${SYSTEM_CONFIG.printFormat === 'a4-sheet' ? 'selected' : ''}>ورقة A4</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-secondary" id="reset-settings-btn">إعادة الضبط</button>
                    <button class="btn btn-primary" id="save-settings-btn">حفظ الإعدادات</button>
                </div>
            </div>
        `;
        
        // إضافة النوافذ إلى الصفحة
        document.body.appendChild(createCardModal);
        document.body.appendChild(showCardModal);
        document.body.appendChild(scanCardModal);
        document.body.appendChild(settingsModal);
        
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
            /* أنماط عامة */
            :root {
                --card-transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                --card-shadow-hover: 0 15px 40px rgba(0, 0, 0, 0.2);
                --card-border-radius: 10px;
                --card-chip-color: #d4af37;
                --card-magnetic-color: #111;
                --card-default-bg: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                --card-gold-bg: linear-gradient(135deg, #b8860b 0%, #daa520 100%);
                --card-platinum-bg: linear-gradient(135deg, #7a7a7a 0%, #c0c0c0 100%);
                --card-premium-bg: linear-gradient(135deg, #000428 0%, #004e92 100%);
                --card-diamond-bg: linear-gradient(135deg, #200122 0%, #6f0000 100%);
                --card-islamic-bg: linear-gradient(135deg, #004d40 0%, #00796b 100%);
                --card-custom-bg: linear-gradient(135deg, #614385 0%, #516395 100%);
            }
            
            /* أنماط صفحة البطاقات */
            .cards-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
            
            /* أنماط تصفية ونتائج البحث */
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
            
            /* أنماط ترقيم الصفحات */
            .pagination {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 20px;
                gap: 5px;
            }
            
            .page-item {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 30px;
                height: 30px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                user-select: none;
            }
            
            .page-item:hover:not(.active, .disabled) {
                background-color: rgba(0, 0, 0, 0.05);
            }
            
            .page-item.active {
                background-color: var(--color-primary);
                color: white;
            }
            
            .page-item.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* أنماط الإحصائيات */
            .dashboard-cards {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .stats-card {
                padding: 0;
            }
            
            .stats-card .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
            }
            
            .stats-card .card-title {
                font-size: 14px;
                font-weight: 500;
                color: #666;
                margin-bottom: 5px;
            }
            
            .stats-card .card-value {
                font-size: 24px;
                font-weight: bold;
            }
            
            .stats-card .card-icon {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 20px;
                color: white;
            }
            
            .stats-card .card-icon.primary {
                background-color: var(--color-primary);
            }
            
            .stats-card .card-icon.success {
                background-color: var(--color-success);
            }
            
            .stats-card .card-icon.warning {
                background-color: var(--color-warning);
            }
            
            .stats-card .card-icon.info {
                background-color: var(--color-info);
            }
            
            .stats-card .card-footer {
                background-color: rgba(0, 0, 0, 0.02);
                padding: 10px 15px;
                border-top: 1px solid rgba(0, 0, 0, 0.05);
            }
            
            .stats-trend {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 12px;
                color: #666;
            }
            
            /* أنماط الرسوم البيانية */
            .dashboard-charts {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .chart-card {
                padding: 0;
            }
            
            .chart-card .card-header {
                padding: 15px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            }
            
            .chart-card .card-header h3 {
                margin: 0;
                font-size: 16px;
            }
            
            .chart-card .card-body {
                padding: 15px;
            }
            
            .chart-container {
                width: 100%;
                height: 300px;
                position: relative;
            }
            
            .chart-placeholder {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.02);
                border-radius: 6px;
            }
            
            .chart-placeholder i {
                font-size: 48px;
                margin-bottom: 16px;
                color: #ccc;
            }
            
            .chart-placeholder p {
                font-size: 14px;
                color: #999;
            }
            
            /* أنماط البطاقة */
            .investor-card {
                position: relative;
                width: 100%;
                aspect-ratio: 1.586;
                border-radius: var(--card-border-radius);
                overflow: hidden;
                box-shadow: var(--card-shadow);
                cursor: pointer;
                transition: var(--card-transition);
                backface-visibility: hidden;
                transform-style: preserve-3d;
            }
            
            .investor-card:hover {
                transform: translateY(-10px) rotateY(5deg);
                box-shadow: var(--card-shadow-hover);
            }
            
            .investor-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 70%);
                z-index: 2;
                transition: all 1s ease;
                pointer-events: none;
                opacity: 0;
            }
            
            .investor-card:hover::before {
                opacity: 1;
                transform: translateX(100%);
            }
            
            .investor-card-inner {
                width: 100%;
                height: 100%;
                position: relative;
                transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
                background: var(--card-default-bg);
                color: #ffffff;
            }
            
            .investor-card.gold .investor-card-front {
                background: var(--card-gold-bg);
                color: #000000;
            }
            
            .investor-card.platinum .investor-card-front {
                background: var(--card-platinum-bg);
                color: #000000;
            }
            
            .investor-card.premium .investor-card-front {
                background: var(--card-premium-bg);
                color: #ffffff;
            }
            
            .investor-card.diamond .investor-card-front {
                background: var(--card-diamond-bg);
                color: #ffffff;
            }
            
            .investor-card.islamic .investor-card-front {
                background: var(--card-islamic-bg);
                color: #ffffff;
            }
            
            .investor-card.custom .investor-card-front {
                background: var(--card-custom-bg);
                color: #ffffff;
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
            
            /* أنماط عناصر البطاقة */
            .card-chip {
                position: absolute;
                top: 70px;
                right: 20px;
                width: 40px;
                height: 30px;
                background: linear-gradient(135deg, var(--card-chip-color) 0%, #f5cc7f 50%, var(--card-chip-color) 100%);
                border-radius: 5px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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
                z-index: 1;
            }
            
            /* أنماط الوجه الخلفي للبطاقة */
            .card-magnetic-stripe {
                width: 100%;
                height: 40px;
                background-color: var(--card-magnetic-color);
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
            
            /* أنماط الهولوغرام */
            .card-hologram {
                position: absolute;
                bottom: 20px;
                left: 20px;
                width: 50px;
                height: 30px;
                background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,0.1) 100%);
                background-size: 200% 200%;
                border-radius: 5px;
                animation: shimmer 2.5s infinite linear;
                opacity: 0.7;
            }
            
            @keyframes shimmer {
                0% {
                    background-position: 0% 0%;
                }
                100% {
                    background-position: 200% 200%;
                }
            }
            
            /* أنماط معاينة البطاقة */
            .card-preview-container {
                border-top: 1px solid #eee;
                padding-top: 15px;
            }
            
            .card-preview-container h4 {
                margin-bottom: 15px;
                font-size: 16px;
                color: #666;
                text-align: center;
            }
            
            .card-preview {
                transform: scale(0.9);
                transform-origin: center top;
                margin-bottom: 20px;
            }
            
            .preview-actions {
                display: flex;
                justify-content: center;
                margin-top: 10px;
            }
            
            /* أنماط نافذة إنشاء البطاقة */
            .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .form-column {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .input-group {
                display: flex;
                align-items: center;
            }
            
            .input-group .form-input {
                flex: 1;
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
            }
            
            .input-group .btn {
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;
                height: 100%;
                padding: 0 10px;
            }
            
            .card-custom-options {
                background-color: rgba(0, 0, 0, 0.02);
                padding: 15px;
                border-radius: 6px;
                margin-top: 10px;
            }
            
            .form-subgroup {
                margin-bottom: 10px;
            }
            
            .form-label-sm {
                font-size: 12px;
                display: block;
                margin-bottom: 5px;
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
            
            .scanner-corner {
                position: absolute;
                width: 20px;
                height: 20px;
                border-color: #00ff00;
            }
            
            .scanner-corner.top-left {
                top: 0;
                left: 0;
                border-top: 3px solid;
                border-left: 3px solid;
            }
            
            .scanner-corner.top-right {
                top: 0;
                right: 0;
                border-top: 3px solid;
                border-right: 3px solid;
            }
            
            .scanner-corner.bottom-left {
                bottom: 0;
                left: 0;
                border-bottom: 3px solid;
                border-left: 3px solid;
            }
            
            .scanner-corner.bottom-right {
                bottom: 0;
                right: 0;
                border-bottom: 3px solid;
                border-right: 3px solid;
            }
            
            .scanner-line {
                position: absolute;
                width: 100%;
                height: 2px;
                background-color: rgba(0, 255, 0, 0.7);
                top: 50%;
                animation: scan-line 2s linear infinite;
            }
            
            @keyframes scan-line {
                0% {
                    top: 20%;
                }
                50% {
                    top: 80%;
                }
                100% {
                    top: 20%;
                }
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
            
            /* أنماط التبديل (Toggle) */
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-switch label {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: .4s;
                border-radius: 34px;
            }
            
            .toggle-switch label:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }
            
            .toggle-switch input:checked + label {
                background-color: var(--color-primary);
            }
            
            .toggle-switch input:checked + label:before {
                transform: translateX(26px);
            }
            
            /* أنماط علامات التبويب في الإعدادات */
            .settings-tabs {
                display: flex;
                flex-direction: column;
            }
            
            .tabs-nav {
                display: flex;
                border-bottom: 1px solid #ddd;
                margin-bottom: 20px;
            }
            
            .tab-btn {
                padding: 10px 15px;
                border: none;
                background: none;
                cursor: pointer;
                font-weight: 500;
                color: #666;
                transition: all 0.2s ease;
                position: relative;
            }
            
            .tab-btn:hover {
                color: var(--color-primary);
            }
            
            .tab-btn.active {
                color: var(--color-primary);
            }
            
            .tab-btn.active::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                right: 0;
                height: 2px;
                background-color: var(--color-primary);
            }
            
            .tabs-content {
                flex: 1;
            }
            
            .tab-pane {
                display: none;
                animation: fadeIn 0.3s ease;
            }
            
            .tab-pane.active {
                display: block;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
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
                    box-shadow: none;
                    page-break-after: always;
                }
                
                .print-card.credit-card-size {
                    width: 85.6mm;
                    height: 53.98mm;
                }
                
                .print-card.a4-sheet {
                    width: 210mm;
                    padding: 10mm;
                }
                
                .print-card .investor-card {
                    box-shadow: none;
                    border: 1px solid #ddd;
                }
            }
            
            /* أنماط خاصة بالأنماط المختلفة */
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
            
            .card-pattern.diamonds {
                background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%), 
                                  linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%), 
                                  linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%), 
                                  linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0;
            }
            
            .card-pattern.islamic {
                background-image: 
                    radial-gradient(circle at 0% 50%, rgba(255, 255, 255, 0.05) 9px, transparent 10px),
                    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05) 9px, transparent 10px),
                    radial-gradient(circle at 100% 50%, rgba(255, 255, 255, 0.05) 9px, transparent 10px),
                    radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.05) 9px, transparent 10px);
                background-size: 20px 20px;
                background-position: 0 0, 10px 0, 10px 10px, 0 10px;
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
        return new Promise(async (resolve, reject) => {
            try {
                // تحميل مكتبة QR Code
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js');
                console.log('تم تحميل مكتبة QR Code بنجاح');
                
                // تحميل مكتبة JsBarcode
                await loadScript('https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js');
                console.log('تم تحميل مكتبة JsBarcode بنجاح');
                
                // تحميل مكتبة QuaggaJS لقراءة الباركود (الاعتماد على الإصدار الأحدث)
                await loadScript('https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.8.2/dist/quagga.min.js');
                console.log('تم تحميل مكتبة QuaggaJS بنجاح');
                
                // تم تحميل جميع المكتبات بنجاح
                resolve(true);
            } catch (error) {
                console.error('فشل في تحميل مكتبات الباركود:', error);
                reject(error);
            }
        });
    }
    
    /**
     * تحميل ملف جافاسكريبت خارجي
     * @param {string} src مسار الملف
     * @returns {Promise} وعد بنجاح أو فشل التحميل
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // التحقق مما إذا كان النص البرمجي محملاً بالفعل
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * تهيئة قوالب البطاقات
     */
    function initCardTemplates() {
        // إنشاء قوالب البطاقات
        cardTemplate = {
            front: function(card) {
                const style = CARD_STYLES[card.cardType] || CARD_STYLES.default;
                const expDate = formatExpiryDate(card.expiryDate);
                const isExpired = isCardExpired(card.expiryDate);
                const isInactive = card.status !== 'active';
                
                return `
                    <div class="card-pattern ${style.pattern}"></div>
                    <div class="card-logo">
                        <i class="fas fa-university" style="color: ${style.logoColor};"></i>
                        <span class="card-logo-text" style="color: ${style.logoColor};">InvestCard</span>
                    </div>
                    <div class="card-chip"></div>
                    <div class="card-number">
                        ${formatCardNumber(card.cardNumber)}
                    </div>
                    <div class="card-details">
                        <div class="card-holder">
                            <div class="card-holder-label" style="color: ${style.color};">حامل البطاقة</div>
                            <div class="card-holder-name" style="color: ${style.color};">${card.investorName}</div>
                        </div>
                        <div class="card-expires">
                            <div class="expires-label" style="color: ${style.color};">تنتهي في</div>
                            <div class="expires-date" style="color: ${style.color};">${expDate}</div>
                        </div>
                    </div>
                    <div class="card-type" style="color: ${style.color};">
                        ${getCardTypeArabic(card.cardType)}
                    </div>
                    ${SYSTEM_CONFIG.showCardHologram ? '<div class="card-hologram"></div>' : ''}
                    ${isExpired ? '<div class="card-inactive-overlay">منتهية</div>' : ''}
                    ${!isExpired && isInactive ? '<div class="card-inactive-overlay">متوقفة</div>' : ''}
                `;
            },
            back: function(card) {
                return `
                    <div class="card-magnetic-stripe"></div>
                    <div class="card-signature">
                        <div class="card-signature-text">${card.investorName}</div>
                    </div>
                    <div class="card-cvv">CVV: ${card.cvv}</div>
                    <div class="card-barcode-container">
                        <div class="card-barcode" id="barcode-${card.id}"></div>
                        <div class="card-barcode-number">${card.barcode}</div>
                    </div>
                `;
            }
        };
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
                            facingMode: cameraMode, // استخدام متغير cameraMode العام
                            width: { min: 640 },
                            height: { min: 480 },
                            aspectRatio: { min: 1, max: 2 }
                        },
                    },
                    locator: {
                        patchSize: "medium",
                        halfSample: true
                    },
                    numOfWorkers: navigator.hardwareConcurrency ? Math.min(navigator.hardwareConcurrency, 4) : 2,
                    frequency: 10,
                    decoder: {
                        readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "qr_code_reader"]
                    },
                    locate: true
                };
                
                Quagga.init(config, (err) => {
                    if (err) {
                        console.error('Error initializing Quagga:', err);
                        document.querySelector('#scan-result').textContent = 'حدث خطأ في تهيئة الماسح الضوئي: ' + err.message;
                        document.querySelector('#scan-result').classList.add('error');
                        return;
                    }
                    
                    Quagga.start();
                    
                    console.log(`تم بدء ماسح الباركود باستخدام الكاميرا: ${cameraMode === 'environment' ? 'الخلفية' : 'الأمامية'}`);
                    
                    // إضافة مستمع الكشف عن الباركود
                    Quagga.onDetected((result) => {
                        const code = result.codeResult.code;
                        if (code) {
                            // التأكد من صحة الباركود (التحقق من طول الرمز وصيغته)
                            if (this.validateBarcode(code)) {
                                this.onDetect(code);
                            }
                        }
                    });

                    // إضافة مستمع لتتبع تحديد الباركود على الشاشة
                    Quagga.onProcessed((result) => {
                        const drawingCtx = Quagga.canvas.ctx.overlay;
                        const drawingCanvas = Quagga.canvas.dom.overlay;

                        if (result) {
                            if (result.boxes) {
                                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                                result.boxes.filter((box) => box !== result.box).forEach((box) => {
                                    drawingCtx.strokeStyle = "green";
                                    drawingCtx.strokeRect(box[0], box[1], box[2] - box[0], box[3] - box[1]);
                                });
                            }

                            if (result.box) {
                                drawingCtx.strokeStyle = "blue";
                                drawingCtx.strokeRect(result.box[0], result.box[1], result.box[2] - result.box[0], result.box[3] - result.box[1]);
                            }

                            if (result.codeResult && result.codeResult.code) {
                                drawingCtx.font = "15px Arial";
                                drawingCtx.fillStyle = "green";
                                drawingCtx.fillText(result.codeResult.code, 10, 20);
                            }
                        }
                    });