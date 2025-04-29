/**
 * نظام بطاقات المستثمرين المحسن - Enhanced Investor Card System (v2.0)
 * 
 * نظام متكامل لإدارة بطاقات المستثمرين في نظام الاستثمار المتكامل
 * يتضمن ميزات متقدمة مثل أنواع متعددة من البطاقات، إحصائيات، سجل أنشطة، نسخ احتياطي، إلخ
 * تم تصميمه ليعمل مع التطبيق الرئيسي بدون أخطاء
 */

// نظام بطاقات المستثمرين المحسن
const InvestorCardSystem = (function() {
    // ========================== المتغيرات الرئيسية ==========================
    let initialized = false;         // حالة تهيئة النظام
    let investors = [];              // قائمة المستثمرين
    let cards = [];                  // قائمة البطاقات
    let activities = [];             // سجل الأنشطة
    let settings = {                 // إعدادات النظام
        defaultCardType: 'platinum',
        defaultExpiryMonths: 12,
        enableNotifications: true,
        enableSounds: true,
        darkMode: false,
        autoBackup: true,
        backupFrequency: 'weekly',
        securityLevel: 'medium',     // 'low', 'medium', 'high'
        cardStyles: {
            platinum: {
                backgroundColor: '#101a2c',
                textColor: '#ffffff',
                brandColor: '#ffffff'
            },
            gold: {
                backgroundColor: '#85754e',
                textColor: '#ffffff',
                brandColor: '#ffd700'
            },
            premium: {
                backgroundColor: '#1c1c1c',
                textColor: '#ffffff',
                brandColor: '#ff4500'
            },
            diamond: {
                backgroundColor: '#40e0d0',
                textColor: '#000000',
                brandColor: '#000000'
            },
            islamic: {
                backgroundColor: '#006400',
                textColor: '#ffffff',
                brandColor: '#ffd700'
            },
            custom: {
                backgroundColor: '#2c3e50',
                textColor: '#ffffff',
                brandColor: '#3498db'
            }
        }
    };
    
    let databaseRef = null;          // مرجع قاعدة البيانات
    let currentView = 'all-cards';   // نوع العرض الحالي
    let scannerInstance = null;      // كائن الماسح الضوئي
    let currentCardId = null;        // معرف البطاقة الحالية
    let chartInstances = {};         // نسخ الرسوم البيانية
    
    // حالة المصادقة
    let isAuthenticated = false;
    let currentUser = null;
    
    // ========================== تهيئة النظام ==========================
    /**
     * تهيئة نظام بطاقات المستثمرين
     * @returns {Promise<boolean>} نتيجة التهيئة
     */
    function initialize() {
        console.log('تهيئة نظام بطاقات المستثمرين المحسن...');
        
        if (initialized) {
            console.log('نظام البطاقات مهيأ بالفعل');
            return Promise.resolve(true);
        }
        
        // تحميل الإعدادات المحفوظة
        loadSettings();
        
        // إضافة أنماط CSS
        addCardStyles();
        
        // إنشاء صفحات البطاقات المختلفة
        createCardPages();
        
        // إضافة أزرار في القائمة الجانبية
        addSidebarButtons();
        
        // تهيئة مستمعي الأحداث
        initEventListeners();
        
        // تهيئة الاتصال بقاعدة البيانات
        return initializeDatabase()
            .then(() => {
                // جلب البيانات الأولية
                return loadData();
            })
            .then(() => {
                initialized = true;
                console.log('تم تهيئة نظام بطاقات المستثمرين المحسن بنجاح');
                
                // تطبيق وضع الألوان المناسب
                applyColorMode();
                
                return true;
            })
            .catch(error => {
                console.error('خطأ في تهيئة نظام بطاقات المستثمرين:', error);
                return false;
            });
    }
    
    /**
     * تحميل إعدادات النظام من التخزين المحلي
     */
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('investor_card_settings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                // دمج الإعدادات المحفوظة مع الإعدادات الافتراضية
                settings = {...settings, ...parsedSettings};
                console.log('تم تحميل إعدادات نظام البطاقات');
            }
        } catch (error) {
            console.error('خطأ في تحميل إعدادات النظام:', error);
        }
    }
    
    /**
     * حفظ إعدادات النظام في التخزين المحلي
     */
    function saveSettings() {
        try {
            localStorage.setItem('investor_card_settings', JSON.stringify(settings));
            console.log('تم حفظ إعدادات نظام البطاقات');
        } catch (error) {
            console.error('خطأ في حفظ إعدادات النظام:', error);
        }
    }
    
    /**
     * تطبيق وضع الألوان المناسب (فاتح/داكن)
     */
    function applyColorMode() {
        const htmlElement = document.documentElement;
        if (settings.darkMode) {
            htmlElement.classList.add('dark-mode');
        } else {
            htmlElement.classList.remove('dark-mode');
        }
    }
    
    // ========================== إضافة أنماط CSS ==========================
    /**
     * إضافة أنماط CSS للبطاقات
     */
    function addCardStyles() {
        // التحقق من وجود عنصر الأنماط مسبقاً
        if (document.getElementById('investor-card-styles')) {
            return;
        }
        
        // إنشاء عنصر النمط
        const styleElement = document.createElement('style');
        styleElement.id = 'investor-card-styles';
        
        // إضافة أنماط CSS
        styleElement.textContent = `
            /* ===== الأنماط الأساسية ===== */
            #investor-cards-page, #active-cards-page, #expired-cards-page, 
            #barcode-scanner-page, #card-details-page, #statistics-page, 
            #settings-page, #new-card-page, #activity-log-page {
                padding: 20px;
                direction: rtl;
            }
            
            .card-content-area {
                background-color: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                overflow-y: auto;
            }
            
            /* ===== وضع داكن ===== */
            html.dark-mode .card-content-area {
                background-color: #2c3e50;
                color: #ecf0f1;
            }
            
            html.dark-mode .card-form-container,
            html.dark-mode .investor-details,
            html.dark-mode .info-message,
            html.dark-mode .card-stats-box,
            html.dark-mode .settings-box,
            html.dark-mode .scan-result {
                background-color: #34495e;
                color: #ecf0f1;
                border-color: #7f8c8d;
            }
            
            html.dark-mode .card-form-input,
            html.dark-mode .form-input,
            html.dark-mode .form-select {
                background-color: #2c3e50;
                color: #ecf0f1;
                border-color: #7f8c8d;
            }
            
            html.dark-mode .info-title,
            html.dark-mode .card-form-title,
            html.dark-mode .investor-details-title,
            html.dark-mode .settings-title,
            html.dark-mode .card-stats-title {
                color: #ecf0f1;
            }
            
            html.dark-mode .transaction-list th {
                background-color: #2c3e50;
            }
            
            html.dark-mode .transaction-list td {
                border-color: #7f8c8d;
            }
            
            html.dark-mode .transaction-list tr:hover td {
                background-color: #34495e;
            }
            
            /* ===== نموذج إنشاء البطاقة ===== */
            .card-form-container {
                background-color: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                margin-bottom: 20px;
                max-width: 800px;
                margin: 0 auto;
            }
            
            .card-form-title {
                font-size: 1.4rem;
                margin-bottom: 20px;
                color: #2c3e50;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .card-form-group {
                margin-bottom: 20px;
            }
            
            .card-form-label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #2c3e50;
            }
            
            .card-form-input {
                width: 100%;
                padding: 12px 15px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 1rem;
                transition: border-color 0.2s;
            }
            
            .card-form-input:focus {
                border-color: #3498db;
                outline: none;
            }
            
            .color-picker-container {
                display: flex;
                gap: 10px;
                margin-top: 10px;
                flex-wrap: wrap;
            }
            
            .color-option {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid transparent;
                transition: transform 0.2s;
            }
            
            .color-option:hover {
                transform: scale(1.1);
            }
            
            .color-option.selected {
                border-color: #3498db;
            }
            
            .card-type-options {
                display: flex;
                gap: 15px;
                margin-top: 10px;
                flex-wrap: wrap;
            }
            
            .card-type-option {
                display: flex;
                align-items: center;
                cursor: pointer;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
                transition: all 0.2s;
            }
            
            .card-type-option:hover {
                background-color: #f8f9fa;
            }
            
            .card-type-option.selected {
                background-color: #3498db;
                color: white;
                border-color: #3498db;
            }
            
            .card-type-option input {
                margin-left: 8px;
            }
            
            .card-preview-container {
                margin-top: 20px;
                text-align: center;
            }
            
            .card-form-actions {
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
            }
            
            /* ===== أنماط البطاقة ===== */
            .investor-card {
                width: 390px;
                height: 245px;
                border-radius: 15px;
                background-color: #101a2c;
                color: white;
                padding: 25px;
                position: relative;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                margin: 0 auto 30px;
                overflow: hidden;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                z-index: 1;
            }
            
            .investor-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
            }
            
            .card-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-position: center;
                background-size: cover;
                opacity: 0.1;
                z-index: -1;
            }
            
            .card-chip {
                position: absolute;
                top: 90px;
                right: 25px;
                width: 40px;
                height: 30px;
                background: linear-gradient(135deg, #daa520, #ffd700, #daa520);
                border-radius: 5px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 2px;
                transform: rotate(90deg);
            }
            
            .chip-line {
                height: 3px;
                background-color: rgba(0, 0, 0, 0.3);
                border-radius: 1px;
            }
            
            .card-hologram {
                position: absolute;
                bottom: 15px;
                right: 25px;
                width: 60px;
                height: 40px;
                background: linear-gradient(
                    135deg,
                    rgba(255, 255, 255, 0.5),
                    rgba(255, 255, 255, 0.1),
                    rgba(255, 255, 255, 0.5)
                );
                border-radius: 5px;
                z-index: 1;
            }
            
            .card-brand {
                position: absolute;
                top: 20px;
                right: 25px;
                font-size: 1.4rem;
                font-weight: 700;
                letter-spacing: 1px;
                z-index: 2;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .card-logo {
                position: absolute;
                top: 20px;
                left: 25px;
                display: flex;
                gap: 5px;
                z-index: 2;
            }
            
            .card-logo-circle {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            
            .card-logo-circle.red {
                background: #eb001b;
            }
            
            .card-logo-circle.yellow {
                background: #f79e1b;
                opacity: 0.8;
                margin-right: -15px;
            }
            
            .card-type-indicator {
                position: absolute;
                top: 50px;
                right: 25px;
                font-size: 0.8rem;
                padding: 3px 8px;
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                z-index: 2;
            }
            
            .card-type-platinum {
                background-color: rgba(229, 228, 226, 0.3);
            }
            
            .card-type-gold {
                background-color: rgba(212, 175, 55, 0.3);
            }
            
            .card-type-premium {
                background-color: rgba(255, 69, 0, 0.3);
            }
            
            .card-type-diamond {
                background-color: rgba(185, 242, 255, 0.3);
            }
            
            .card-type-islamic {
                background-color: rgba(0, 100, 0, 0.3);
            }
            
            .card-type-custom {
                background-color: rgba(52, 152, 219, 0.3);
            }
            
            .card-qrcode {
                width: 80px;
                height: 80px;
                background-color: #f8f9fa;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 15px;
                overflow: hidden;
                position: absolute;
                top: 70px;
                left: 25px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                z-index: 2;
            }
            
            .card-qrcode img, .card-qrcode canvas {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            
            .card-number {
                position: absolute;
                bottom: 80px;
                width: 100%;
                left: 0;
                padding: 0 25px;
                font-size: 1.5rem;
                letter-spacing: 2px;
                text-align: center;
                color: white;
                z-index: 2;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .card-details {
                position: absolute;
                bottom: 25px;
                width: 100%;
                left: 0;
                padding: 0 25px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                z-index: 2;
            }
            
            .card-validity {
                font-size: 0.9rem;
                display: flex;
                flex-direction: column;
            }
            
            .card-valid-text {
                font-size: 0.7rem;
                opacity: 0.7;
                margin-bottom: 3px;
            }
            
            .card-name {
                font-size: 1rem;
                text-align: right;
                text-transform: uppercase;
                z-index: 2;
            }
            
            /* ===== أنماط قائمة البطاقات ===== */
            .cards-collection {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-top: 20px;
                justify-content: center;
            }
            
            .cards-filters {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .filter-item {
                padding: 8px 15px;
                background-color: #f8f9fa;
                border-radius: 20px;
                border: 1px solid #ddd;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s;
            }
            
            .filter-item:hover {
                background-color: #e9ecef;
            }
            
            .filter-item.active {
                background-color: #3498db;
                color: white;
                border-color: #3498db;
            }
            
            .card-preview {
                width: 320px;
                height: 180px;
                border-radius: 12px;
                background-color: #101a2c;
                color: white;
                padding: 15px;
                position: relative;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                overflow: hidden;
                margin-bottom: 20px;
            }
            
            .card-preview:hover {
                transform: translateY(-3px) scale(1.03);
                box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
            }
            
            .card-preview .card-brand {
                font-size: 1rem;
            }
            
            .card-preview .card-logo-circle {
                width: 20px;
                height: 20px;
            }
            
            .card-preview .card-number {
                font-size: 1rem;
                bottom: 50px;
            }
            
            .card-preview .card-details {
                bottom: 15px;
            }
            
            .card-preview .card-name {
                font-size: 0.8rem;
            }
            
            .card-preview .card-qrcode {
                width: 50px;
                height: 50px;
                margin-top: 25px;
            }
            
            .card-preview .card-chip {
                top: 60px;
                right: 20px;
                width: 25px;
                height: 18px;
            }
            
            .card-preview .card-hologram {
                bottom: 10px;
                right: 15px;
                width: 40px;
                height: 25px;
            }
            
            .card-preview-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s;
                z-index: 10;
            }
            
            .card-preview:hover .card-preview-overlay {
                opacity: 1;
            }
            
            .card-preview-actions {
                display: flex;
                gap: 10px;
            }
            
            .card-action-btn {
                width: 35px;
                height: 35px;
                border-radius: 50%;
                background-color: white;
                color: #2c3e50;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.2s, background-color 0.2s;
            }
            
            .card-action-btn:hover {
                transform: scale(1.1);
                background-color: #f8f9fa;
            }
            
            .card-action-btn.view:hover {
                color: #3498db;
            }
            
            .card-action-btn.edit:hover {
                color: #f39c12;
            }
            
            .card-action-btn.deactivate:hover {
                color: #e74c3c;
            }
            
            .card-status-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 0.7rem;
                text-transform: uppercase;
                z-index: 5;
            }
            
            .card-status-active {
                background-color: rgba(46, 204, 113, 0.8);
                color: white;
            }
            
            .card-status-inactive {
                background-color: rgba(231, 76, 60, 0.8);
                color: white;
            }
            
            .card-status-expired {
                background-color: rgba(155, 89, 182, 0.8);
                color: white;
            }
            
            /* ===== أنماط لتعديل البطاقة ===== */
            .card-options {
                display: flex;
                justify-content: space-around;
                margin: 20px 0;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .card-option-btn {
                padding: 10px 15px;
                background-color: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
                min-width: 120px;
                justify-content: center;
            }
            
            .card-option-btn:hover {
                background-color: #e9ecef;
                transform: translateY(-2px);
            }
            
            .card-option-btn.primary {
                background-color: #3498db;
                color: white;
                border-color: #3498db;
            }
            
            .card-option-btn.primary:hover {
                background-color: #2980b9;
            }
            
            .card-option-btn.success {
                background-color: #2ecc71;
                color: white;
                border-color: #2ecc71;
            }
            
            .card-option-btn.success:hover {
                background-color: #27ae60;
            }
            
            .card-option-btn.warning {
                background-color: #f39c12;
                color: white;
                border-color: #f39c12;
            }
            
            .card-option-btn.warning:hover {
                background-color: #d35400;
            }
            
            .card-option-btn.danger {
                background-color: #e74c3c;
                color: white;
                border-color: #e74c3c;
            }
            
            .card-option-btn.danger:hover {
                background-color: #c0392b;
            }
            
            /* ===== تفاصيل المستثمر ===== */
            .investor-details {
                background-color: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                margin-top: 30px;
            }
            
            .investor-details-title {
                font-size: 1.2rem;
                margin-bottom: 15px;
                color: #2c3e50;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .investor-detail-item {
                display: flex;
                margin-bottom: 12px;
            }
            
            .investor-detail-label {
                width: 160px;
                font-weight: 500;
                color: #2c3e50;
            }
            
            .investor-detail-value {
                flex: 1;
            }
            
            .transactions-summary {
                margin-top: 15px;
            }
            
            .transaction-list {
                margin-top: 15px;
                border: 1px solid #eee;
                border-radius: 6px;
                overflow: hidden;
            }
            
            .transaction-list table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .transaction-list th {
                background-color: #f8f9fa;
                padding: 12px 15px;
                text-align: right;
                font-weight: 500;
            }
            
            .transaction-list td {
                padding: 12px 15px;
                border-top: 1px solid #eee;
            }
            
            .transaction-list tr:hover td {
                background-color: #f8f9fa;
            }
            
            /* ===== قارئ الباركود ===== */
            .barcode-scanner {
                width: 100%;
                max-width: 500px;
                margin: 0 auto;
                padding: 20px;
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            }
            
            .scanner-header {
                margin-bottom: 20px;
                text-align: center;
            }
            
            .scanner-title {
                font-size: 1.4rem;
                margin-bottom: 10px;
                color: #2c3e50;
            }
            
            .scanner-description {
                color: #7f8c8d;
                font-size: 0.9rem;
            }
            
            .scanner-container {
                position: relative;
                width: 100%;
                height: 300px;
                overflow: hidden;
                border-radius: 8px;
                background-color: #2c3e50;
                margin-bottom: 20px;
            }
            
            .scanner-container video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .scan-region-highlight {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 200px;
                height: 200px;
                transform: translate(-50%, -50%);
                border: 2px solid #3498db;
                box-shadow: 0 0 0 5000px rgba(0, 0, 0, 0.3);
                border-radius: 8px;
            }
            
            .scanner-controls {
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 15px;
            }
            
            .scanner-switch {
                margin-top: 10px;
                text-align: center;
            }
            
            .scan-result {
                margin-top: 20px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 6px;
                border: 1px solid #eee;
            }
            
            .scan-result-title {
                font-weight: 500;
                margin-bottom: 10px;
                color: #2c3e50;
            }
            
            .scan-result-data {
                word-break: break-all;
            }
            
            /* ===== رسائل المعلومات ===== */
            .info-message {
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 6px;
                margin-bottom: 20px;
                border-right: 4px solid #3498db;
            }
            
            .info-title {
                font-weight: 500;
                margin-bottom: 5px;
                color: #2c3e50;
            }
            
            .info-text {
                color: #7f8c8d;
                font-size: 0.9rem;
            }
            
            /* ===== الإحصائيات ===== */
            .stats-container {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .card-stats-box {
                background-color: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                flex: 1;
                min-width: 250px;
            }
            
            .card-stats-title {
                font-size: 1.1rem;
                margin-bottom: 20px;
                color: #2c3e50;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .chart-container {
                background-color: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                height: 300px;
                position: relative;
            }
            
            .chart-title {
                font-size: 1.1rem;
                margin-bottom: 15px;
                color: #2c3e50;
            }
            
            /* ===== سجل الأنشطة ===== */
            .activity-list {
                background-color: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                margin-top: 20px;
            }
            
            .activity-item {
                padding: 15px;
                border-bottom: 1px solid #eee;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .activity-item:last-child {
                border-bottom: none;
            }
            
            .activity-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                flex-shrink: 0;
            }
            
            .activity-icon.create {
                background-color: #3498db;
            }
            
            .activity-icon.edit {
                background-color: #f39c12;
            }
            
            .activity-icon.deactivate {
                background-color: #e74c3c;
            }
            
            .activity-icon.activate {
                background-color: #2ecc71;
            }
            
            .activity-icon.renew {
                background-color: #9b59b6;
            }
            
            .activity-icon.scan {
                background-color: #1abc9c;
            }
            
            .activity-content {
                flex: 1;
            }
            
            .activity-title {
                font-weight: 500;
                color: #2c3e50;
                margin-bottom: 5px;
            }
            
            .activity-details {
                color: #7f8c8d;
                font-size: 0.9rem;
            }
            
            .activity-time {
                color: #95a5a6;
                font-size: 0.8rem;
                white-space: nowrap;
            }
            
            /* ===== الإعدادات ===== */
            .settings-container {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .settings-box {
                background-color: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                flex: 1;
                min-width: 300px;
            }
            
            .settings-title {
                font-size: 1.2rem;
                margin-bottom: 20px;
                color: #2c3e50;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .settings-group {
                margin-bottom: 25px;
            }
            
            .setting-item {
                margin-bottom: 15px;
            }
            
            .setting-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .setting-label {
                font-weight: 500;
                color: #2c3e50;
            }
            
            .setting-description {
                margin-top: 5px;
                color: #7f8c8d;
                font-size: 0.85rem;
            }
            
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
            
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: .4s;
                border-radius: 24px;
            }
            
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }
            
            input:checked + .toggle-slider {
                background-color: #3498db;
            }
            
            input:checked + .toggle-slider:before {
                transform: translateX(26px);
            }
            
            /* ===== النوافذ المنبثقة ===== */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            .modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .modal {
                background-color: white;
                border-radius: 10px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                transform: translateY(20px);
                transition: transform 0.3s ease;
            }
            
            .modal-overlay.active .modal {
                transform: translateY(0);
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-title {
                font-size: 1.2rem;
                font-weight: 600;
                color: #2c3e50;
                margin: 0;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #7f8c8d;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .modal-footer {
                padding: 20px;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            /* ===== كلاسات مساعدة ===== */
            .text-center {
                text-align: center;
            }
            
            .mb-10 {
                margin-bottom: 10px;
            }
            
            .mb-20 {
                margin-bottom: 20px;
            }
            
            .hidden {
                display: none !important;
            }
            
            /* ===== زر الإضافة العائم ===== */
            .add-card-fab {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background-color: #3498db;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 100;
            }
            
            .add-card-fab:hover {
                background-color: #2980b9;
                transform: scale(1.1) rotate(90deg);
            }
            
            .add-card-fab i {
                font-size: 24px;
            }
            
            /* ===== تجاوب للموبايل ===== */
            @media (max-width: 768px) {
                .card-stats-box,
                .card-form-container,
                .investor-details,
                .activity-list,
                .chart-container,
                .settings-box {
                    width: 100%;
                }
                
                .card-options {
                    flex-direction: column;
                }
                
                .card-option-btn {
                    width: 100%;
                }
                
                .card-preview {
                    width: 100%;
                }
                
                .investor-card {
                    width: 320px;
                    height: 200px;
                }
                
                .investor-detail-item {
                    flex-direction: column;
                }
                
                .investor-detail-label {
                    width: 100%;
                    margin-bottom: 5px;
                }
            }
        `;
        
        // إضافة العنصر إلى head
        document.head.appendChild(styleElement);
        
        console.log('تم إضافة أنماط CSS لنظام البطاقات');
    }
    
    // ========================== إنشاء صفحات النظام ==========================
    /**
     * إنشاء صفحات النظام المختلفة
     */
    function createCardPages() {
        // التحقق مما إذا كانت الصفحات موجودة بالفعل
        if (document.getElementById('investor-cards-page')) {
            return;
        }
        
        // إنشاء صفحة كل البطاقات
        createAllCardsPage();
        
        // إنشاء صفحة البطاقات النشطة
        createActiveCardsPage();
        
        // إنشاء صفحة البطاقات المنتهية
        createExpiredCardsPage();
        
        // إنشاء صفحة مسح الباركود
        createBarcodeScannerPage();
        
        // إنشاء صفحة تفاصيل البطاقة
        createCardDetailsPage();
        
        // إنشاء صفحة إنشاء بطاقة جديدة
        createNewCardPage();
        
        // إنشاء صفحة الإحصائيات
        createStatisticsPage();
        
        // إنشاء صفحة سجل الأنشطة
        createActivityLogPage();
        
        // إنشاء صفحة الإعدادات
        createSettingsPage();
        
        console.log('تم إنشاء صفحات نظام بطاقات المستثمرين');
    }
    
    /**
     * إنشاء صفحة كل البطاقات
     */
    function createAllCardsPage() {
        // إنشاء عنصر الصفحة
        const pageElement = document.createElement('div');
        pageElement.id = 'investor-cards-page';
        pageElement.className = 'page'; // فئة صفحات التطبيق
        
        // إنشاء محتوى الصفحة
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">بطاقات المستثمرين</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="card-search-input" placeholder="بحث عن بطاقة أو مستثمر..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <button class="btn btn-primary" id="create-card-btn">
                        <i class="fas fa-plus"></i>
                        <span>إنشاء بطاقة جديدة</span>
                    </button>
                </div>
            </div>
            
            <div class="card-content-area">
                <div class="info-message">
                    <div class="info-title">بطاقات المستثمرين</div>
                    <div class="info-text">هنا يمكنك عرض وإدارة بطاقات جميع المستثمرين في النظام.</div>
                </div>
                
                <div class="cards-filters" id="card-type-filters">
                    <div class="filter-item active" data-type="all">الكل</div>
                    <div class="filter-item" data-type="platinum">بلاتينية</div>
                    <div class="filter-item" data-type="gold">ذهبية</div>
                    <div class="filter-item" data-type="premium">بريميوم</div>
                    <div class="filter-item" data-type="diamond">ماسية</div>
                    <div class="filter-item" data-type="islamic">إسلامية</div>
                    <div class="filter-item" data-type="custom">مخصصة</div>
                </div>
                
                <div class="cards-collection" id="cards-container">
                    <!-- سيتم ملؤها ديناميكياً -->
                </div>
            </div>
            
            <div class="add-card-fab" id="add-card-fab" title="إنشاء بطاقة جديدة">
                <i class="fas fa-plus"></i>
            </div>
        `;
        
        // إضافة الصفحة إلى الـ main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(pageElement);
        } else {
            console.error('لم يتم العثور على عنصر main-content');
        }
    }
    
    /**
     * إنشاء صفحة البطاقات النشطة
     */
    function createActiveCardsPage() {
        // إنشاء عنصر الصفحة
        const pageElement = document.createElement('div');
        pageElement.id = 'active-cards-page';
        pageElement.className = 'page'; // فئة صفحات التطبيق
        
        // إنشاء محتوى الصفحة
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">البطاقات النشطة</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="active-card-search-input" placeholder="بحث عن بطاقة أو مستثمر..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <button class="btn btn-primary" id="create-card-btn-active">
                        <i class="fas fa-plus"></i>
                        <span>إنشاء بطاقة جديدة</span>
                    </button>
                </div>
            </div>
            
            <div class="card-content-area">
                <div class="info-message">
                    <div class="info-title">البطاقات النشطة</div>
                    <div class="info-text">عرض البطاقات الصالحة والتي لم تنتهي صلاحيتها بعد.</div>
                </div>
                
                <div class="cards-filters" id="active-card-type-filters">
                    <div class="filter-item active" data-type="all">الكل</div>
                    <div class="filter-item" data-type="platinum">بلاتينية</div>
                    <div class="filter-item" data-type="gold">ذهبية</div>
                    <div class="filter-item" data-type="premium">بريميوم</div>
                    <div class="filter-item" data-type="diamond">ماسية</div>
                    <div class="filter-item" data-type="islamic">إسلامية</div>
                    <div class="filter-item" data-type="custom">مخصصة</div>
                </div>
                
                <div class="cards-collection" id="active-cards-container">
                    <!-- سيتم ملؤها ديناميكياً -->
                </div>
            </div>
            
            <div class="add-card-fab" id="add-card-fab-active" title="إنشاء بطاقة جديدة">
                <i class="fas fa-plus"></i>
            </div>
        `;
        
        // إضافة الصفحة إلى الـ main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(pageElement);
        } else {
            console.error('لم يتم العثور على عنصر main-content');
        }
    }
    
    /**
     * إنشاء صفحة البطاقات المنتهية
     */
    function createExpiredCardsPage() {
        // إنشاء عنصر الصفحة
        const pageElement = document.createElement('div');
        pageElement.id = 'expired-cards-page';
        pageElement.className = 'page'; // فئة صفحات التطبيق
        
        // إنشاء محتوى الصفحة
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">البطاقات المنتهية</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="expired-card-search-input" placeholder="بحث عن بطاقة أو مستثمر..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <button class="btn btn-warning" id="renew-all-cards-btn">
                        <i class="fas fa-sync-alt"></i>
                        <span>تجديد الكل</span>
                    </button>
                </div>
            </div>
            
            <div class="card-content-area">
                <div class="info-message">
                    <div class="info-title">البطاقات المنتهية</div>
                    <div class="info-text">عرض البطاقات التي انتهت صلاحيتها وتحتاج إلى تجديد.</div>
                </div>
                
                <div class="cards-filters" id="expired-card-type-filters">
                    <div class="filter-item active" data-type="all">الكل</div>
                    <div class="filter-item" data-type="platinum">بلاتينية</div>
                    <div class="filter-item" data-type="gold">ذهبية</div>
                    <div class="filter-item" data-type="premium">بريميوم</div>
                    <div class="filter-item" data-type="diamond">ماسية</div>
                    <div class="filter-item" data-type="islamic">إسلامية</div>
                    <div class="filter-item" data-type="custom">مخصصة</div>
                </div>
                
                <div class="cards-collection" id="expired-cards-container">
                    <!-- سيتم ملؤها ديناميكياً -->
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى الـ main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(pageElement);
        } else {
            console.error('لم يتم العثور على عنصر main-content');
        }
    }
    
    /**
     * إنشاء صفحة مسح الباركود
     */
    function createBarcodeScannerPage() {
        // إنشاء عنصر الصفحة
        const pageElement = document.createElement('div');
        pageElement.id = 'barcode-scanner-page';
        pageElement.className = 'page'; // فئة صفحات التطبيق
        
        // إنشاء محتوى الصفحة
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">مسح باركود البطاقة</h1>
            </div>
            
            <div class="card-content-area">
                <div class="barcode-scanner">
                    <div class="scanner-header">
                        <h2 class="scanner-title">مسح باركود البطاقة</h2>
                        <p class="scanner-description">قم بتوجيه كاميرا الجهاز نحو باركود البطاقة للقراءة</p>
                    </div>
                    
                    <div class="scanner-container" id="scanner-container">
                        <video id="scanner-video"></video>
                        <div class="scan-region-highlight"></div>
                    </div>
                    
                    <div class="scanner-switch">
                        <button class="btn btn-outline btn-sm" id="switch-camera-btn">
                            <i class="fas fa-sync"></i>
                            <span>تبديل الكاميرا</span>
                        </button>
                    </div>
                    
                    <div class="scanner-controls">
                        <button class="btn btn-primary" id="start-scanner">بدء المسح</button>
                        <button class="btn btn-outline" id="stop-scanner" disabled>إيقاف المسح</button>
                        <button class="btn btn-warning" id="flash-toggle" disabled>
                            <i class="fas fa-bolt"></i>
                            <span>الفلاش</span>
                        </button>
                    </div>
                    
                    <div class="scan-result hidden" id="scan-result">
                        <div class="scan-result-title">نتيجة المسح:</div>
                        <div class="scan-result-data" id="scan-result-data"></div>
                        <div class="scan-actions" style="margin-top: 15px; text-align: center;">
                            <button class="btn btn-primary" id="goto-scan-card">فتح تفاصيل البطاقة</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى الـ main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(pageElement);
        } else {
            console.error('لم يتم العثور على عنصر main-content');
        }
    }
    
    /**
     * إنشاء صفحة تفاصيل البطاقة
     */
    function createCardDetailsPage() {
        // إنشاء عنصر الصفحة
        const pageElement = document.createElement('div');
        pageElement.id = 'card-details-page';
        pageElement.className = 'page'; // فئة صفحات التطبيق
        
        // إنشاء محتوى الصفحة
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">تفاصيل البطاقة</h1>
                <div class="header-actions">
                    <button class="btn btn-outline" id="back-to-cards">
                        <i class="fas fa-arrow-right"></i>
                        <span>العودة للبطاقات</span>
                    </button>
                </div>
            </div>
            
            <div class="card-content-area">
                <div class="investor-card-container text-center" id="card-details-container">
                    <!-- سيتم ملؤها ديناميكياً بمعلومات البطاقة -->
                </div>
                
                <div class="card-options">
                    <button class="card-option-btn" id="print-card-btn">
                        <i class="fas fa-print"></i>
                        <span>طباعة البطاقة</span>
                    </button>
                    <button class="card-option-btn success" id="share-card-btn">
                        <i class="fas fa-share-alt"></i>
                        <span>مشاركة البطاقة</span>
                    </button>
                    <button class="card-option-btn primary" id="edit-card-btn">
                        <i class="fas fa-edit"></i>
                        <span>تعديل البطاقة</span>
                    </button>
                    <button class="card-option-btn warning" id="renew-card-btn">
                        <i class="fas fa-sync-alt"></i>
                        <span>تجديد البطاقة</span>
                    </button>
                    <button class="card-option-btn danger" id="deactivate-card-btn">
                        <i class="fas fa-times-circle"></i>
                        <span>إيقاف البطاقة</span>
                    </button>
                </div>
                
                <div class="investor-details">
                    <h3 class="investor-details-title">تفاصيل المستثمر</h3>
                    <div id="investor-details-container">
                        <!-- سيتم ملؤها ديناميكياً بمعلومات المستثمر -->
                    </div>
                </div>
                
                <div class="investor-details">
                    <h3 class="investor-details-title">سجل أنشطة البطاقة</h3>
                    <div id="card-activities-container">
                        <!-- سيتم ملؤها ديناميكياً بسجل أنشطة البطاقة -->
                    </div>
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى الـ main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(pageElement);
        } else {
            console.error('لم يتم العثور على عنصر main-content');
        }
    }
    
    /**
     * إنشاء صفحة إنشاء بطاقة جديدة
     */
    function createNewCardPage() {
        // إنشاء عنصر الصفحة
        const pageElement = document.createElement('div');
        pageElement.id = 'new-card-page';
        pageElement.className = 'page'; // فئة صفحات التطبيق
        
        // إنشاء محتوى الصفحة
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">إنشاء بطاقة جديدة</h1>
                <div class="header-actions">
                    <button class="btn btn-outline" id="back-to-cards-from-new">
                        <i class="fas fa-arrow-right"></i>
                        <span>العودة للبطاقات</span>
                    </button>
                </div>
            </div>
            
            <div class="card-content-area">
                <div class="card-form-container">
                    <h2 class="card-form-title">إنشاء بطاقة مستثمر جديدة</h2>
                    
                    <form id="create-card-form">
                        <div class="card-form-group">
                            <label class="card-form-label">اسم المستثمر</label>
                            <select class="card-form-input" id="investor-select" required>
                                <option value="">اختر المستثمر</option>
                                <!-- سيتم ملؤها ديناميكياً -->
                            </select>
                        </div>
                        
                        <div class="card-form-group">
                            <label class="card-form-label">رقم الجوال</label>
                            <input type="tel" class="card-form-input" id="investor-phone" readonly>
                        </div>
                        
                        <div class="card-form-group">
                            <label class="card-form-label">نوع البطاقة</label>
                            <div class="card-type-options">
                                <label class="card-type-option" data-type="platinum">
                                    <input type="radio" name="card-type" value="platinum" checked>
                                    <span>بلاتينية</span>
                                </label>
                                <label class="card-type-option" data-type="gold">
                                    <input type="radio" name="card-type" value="gold">
                                    <span>ذهبية</span>
                                </label>
                                <label class="card-type-option" data-type="premium">
                                    <input type="radio" name="card-type" value="premium">
                                    <span>بريميوم</span>
                                </label>
                                <label class="card-type-option" data-type="diamond">
                                    <input type="radio" name="card-type" value="diamond">
                                    <span>ماسية</span>
                                </label>
                                <label class="card-type-option" data-type="islamic">
                                    <input type="radio" name="card-type" value="islamic">
                                    <span>إسلامية</span>
                                </label>
                                <label class="card-type-option" data-type="custom">
                                    <input type="radio" name="card-type" value="custom">
                                    <span>مخصصة</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="card-form-group" id="custom-colors-container" style="display: none;">
                            <label class="card-form-label">ألوان البطاقة المخصصة</label>
                            <div class="color-picker-container">
                                <div class="color-option" data-color="#1c1c1c" style="background-color: #1c1c1c;"></div>
                                <div class="color-option" data-color="#2c3e50" style="background-color: #2c3e50;"></div>
                                <div class="color-option" data-color="#3498db" style="background-color: #3498db;"></div>
                                <div class="color-option" data-color="#2ecc71" style="background-color: #2ecc71;"></div>
                                <div class="color-option" data-color="#e74c3c" style="background-color: #e74c3c;"></div>
                                <div class="color-option" data-color="#f39c12" style="background-color: #f39c12;"></div>
                                <div class="color-option" data-color="#9b59b6" style="background-color: #9b59b6;"></div>
                                <div class="color-option" data-color="#1abc9c" style="background-color: #1abc9c;"></div>
                                <div class="color-option" data-color="#d35400" style="background-color: #d35400;"></div>
                                <div class="color-option" data-color="#8e44ad" style="background-color: #8e44ad;"></div>
                            </div>
                            <input type="hidden" id="custom-card-color" value="#2c3e50">
                        </div>
                        
                        <div class="card-form-group">
                            <label class="card-form-label">تاريخ الإنتهاء</label>
                            <input type="date" class="card-form-input" id="expiry-date" required>
                        </div>
                        
                        <div class="card-form-group">
                            <label class="card-form-label">حماية البطاقة بكلمة مرور</label>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="enable-card-password">
                                    <span class="toggle-slider"></span>
                                </label>
                                <span>تفعيل الحماية</span>
                            </div>
                        </div>
                        
                        <div class="card-form-group" id="card-password-container" style="display: none;">
                            <label class="card-form-label">كلمة مرور البطاقة (4 أرقام)</label>
                            <input type="password" class="card-form-input" id="card-password" maxlength="4" pattern="[0-9]{4}" placeholder="أدخل 4 أرقام">
                            <small style="color: #7f8c8d; margin-top: 5px; display: block;">ملاحظة: سيتم طلب كلمة المرور عند مسح البطاقة أو عرض تفاصيلها.</small>
                        </div>
                        
                        <div class="card-preview-container">
                            <h3>معاينة البطاقة</h3>
                            <div id="card-preview"></div>
                        </div>
                        
                        <div class="card-form-actions">
                            <button type="button" class="btn btn-outline" id="cancel-create-card">إلغاء</button>
                            <button type="submit" class="btn btn-primary" id="save-card-btn">معالجة البطاقة</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى الـ main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(pageElement);
        } else {
            console.error('لم يتم العثور على عنصر main-content');
        }
    }
    
    /**
     * إنشاء صفحة الإحصائيات
     */
    function createStatisticsPage() {
        // إنشاء عنصر الصفحة
        const pageElement = document.createElement('div');
        pageElement.id = 'statistics-page';
        pageElement.className = 'page'; // فئة صفحات التطبيق
        
        // إنشاء محتوى الصفحة
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">إحصائيات البطاقات</h1>
                <div class="header-actions">
                    <button class="btn btn-outline" id="export-stats-btn">
                        <i class="fas fa-download"></i>
                        <span>تصدير الإحصائيات</span>
                    </button>
                </div>
            </div>
            
            <div class="card-content-area">
                <div class="info-message">
                    <div class="info-title">إحصائيات البطاقات</div>
                    <div class="info-text">عرض إحصائيات وتحليلات بطاقات المستثمرين في النظام.</div>
                </div>
                
                <div class="stats-container">
                    <div class="card-stats-box">
                        <h3 class="card-stats-title">ملخص البطاقات</h3>
                        <div id="cards-summary">
                            <!-- سيتم ملؤها ديناميكياً -->
                        </div>
                    </div>
                    
                    <div class="card-stats-box">
                        <h3 class="card-stats-title">حالة البطاقات</h3>
                        <div id="cards-status">
                            <!-- سيتم ملؤها ديناميكياً -->
                        </div>
                    </div>
                    
                    <div class="card-stats-box">
                        <h3 class="card-stats-title">أكثر المستثمرين نشاطاً</h3>
                        <div id="top-investors">
                            <!-- سيتم ملؤها ديناميكياً -->
                        </div>
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="chart-container">
                        <h3 class="chart-title">توزيع البطاقات حسب النوع</h3>
                        <canvas id="cards-by-type-chart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h3 class="chart-title">البطاقات النشطة والمنتهية</h3>
                        <canvas id="cards-by-status-chart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h3 class="chart-title">إنشاء البطاقات عبر الزمن</h3>
                        <canvas id="cards-over-time-chart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h3 class="chart-title">تجديدات البطاقات</h3>
                        <canvas id="cards-renewals-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى الـ main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(pageElement);
        } else {
            console.error('لم يتم العثور على عنصر main-content');
        }
    }
    
    /**
     * إنشاء صفحة سجل الأنشطة
     */
    function createActivityLogPage() {
        // إنشاء عنصر الصفحة
        const pageElement = document.createElement('div');
        pageElement.id = 'activity-log-page';
        pageElement.className = 'page'; // فئة صفحات التطبيق
        
        // إنشاء محتوى الصفحة
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">سجل الأنشطة</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="activity-search-input" placeholder="بحث في السجل..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <button class="btn btn-outline" id="export-activity-log-btn">
                        <i class="fas fa-download"></i>
                        <span>تصدير السجل</span>
                    </button>
                </div>
            </div>
            
            <div class="card-content-area">
                <div class="info-message">
                    <div class="info-title">سجل أنشطة البطاقات</div>
                    <div class="info-text">عرض سجل جميع العمليات التي تمت على بطاقات المستثمرين.</div>
                </div>
                
                <div class="cards-filters" id="activity-type-filters">
                    <div class="filter-item active" data-type="all">الكل</div>
                    <div class="filter-item" data-type="create">إنشاء</div>
                    <div class="filter-item" data-type="edit">تعديل</div>
                    <div class="filter-item" data-type="renew">تجديد</div>
                    <div class="filter-item" data-type="deactivate">إيقاف</div>
                    <div class="filter-item" data-type="activate">تفعيل</div>
                    <div class="filter-item" data-type="scan">مسح</div>
                </div>
                
                <div class="activity-list" id="activities-container">
                    <!-- سيتم ملؤها ديناميكياً -->
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى الـ main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(pageElement);
        } else {
            console.error('لم يتم العثور على عنصر main-content');
        }
    }
    
    /**
     * إنشاء صفحة الإعدادات
     */
    function createSettingsPage() {
        // إنشاء عنصر الصفحة
        const pageElement = document.createElement('div');
        pageElement.id = 'settings-page';
        pageElement.className = 'page'; // فئة صفحات التطبيق
        
        // إنشاء محتوى الصفحة
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">إعدادات البطاقات</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" id="save-settings-btn">
                        <i class="fas fa-save"></i>
                        <span>حفظ الإعدادات</span>
                    </button>
                </div>
            </div>
            
            <div class="card-content-area">
                <div class="info-message">
                    <div class="info-title">إعدادات نظام البطاقات</div>
                    <div class="info-text">تخصيص إعدادات نظام بطاقات المستثمرين حسب احتياجاتك.</div>
                </div>
                
                <div class="settings-container">
                    <div class="settings-box">
                        <h3 class="settings-title">الإعدادات العامة</h3>
                        <div class="settings-group">
                            <div class="setting-item">
                                <div class="setting-row">
                                    <div class="setting-label">نوع البطاقة الافتراضي</div>
                                    <select class="form-input" id="default-card-type" style="width: auto;">
                                        <option value="platinum">بلاتينية</option>
                                        <option value="gold">ذهبية</option>
                                        <option value="premium">بريميوم</option>
                                        <option value="diamond">ماسية</option>
                                        <option value="islamic">إسلامية</option>
                                        <option value="custom">مخصصة</option>
                                    </select>
                                </div>
                                <div class="setting-description">نوع البطاقة الافتراضي عند إنشاء بطاقة جديدة</div>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-row">
                                    <div class="setting-label">مدة صلاحية البطاقة (بالشهور)</div>
                                    <input type="number" class="form-input" id="default-expiry-months" min="1" max="60" value="12" style="width: 80px;">
                                </div>
                                <div class="setting-description">المدة الافتراضية لصلاحية البطاقة عند إنشائها (بالشهور)</div>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-row">
                                    <div class="setting-label">الوضع الداكن</div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="dark-mode-toggle">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="setting-description">تفعيل المظهر الداكن لنظام البطاقات</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-box">
                        <h3 class="settings-title">إعدادات الإشعارات</h3>
                        <div class="settings-group">
                            <div class="setting-item">
                                <div class="setting-row">
                                    <div class="setting-label">تفعيل الإشعارات</div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="enable-notifications" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="setting-description">إظهار إشعارات عند إجراء عمليات على البطاقات</div>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-row">
                                    <div class="setting-label">تفعيل الأصوات</div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="enable-sounds" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="setting-description">تشغيل أصوات عند إجراء عمليات على البطاقات</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-box">
                        <h3 class="settings-title">إعدادات النسخ الاحتياطي</h3>
                        <div class="settings-group">
                            <div class="setting-item">
                                <div class="setting-row">
                                    <div class="setting-label">النسخ الاحتياطي التلقائي</div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="auto-backup" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="setting-description">إنشاء نسخة احتياطية تلقائية لبيانات البطاقات</div>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-row">
                                    <div class="setting-label">تكرار النسخ الاحتياطي</div>
                                    <select class="form-input" id="backup-frequency" style="width: auto;">
                                        <option value="daily">يومي</option>
                                        <option value="weekly" selected>أسبوعي</option>
                                        <option value="monthly">شهري</option>
                                    </select>
                                </div>
                                <div class="setting-description">توقيت إنشاء النسخة الاحتياطية التلقائية</div>
                            </div>
                            
                            <div class="setting-item" style="margin-top: 20px;">
                                <button class="btn btn-primary" id="create-backup-btn">
                                    <i class="fas fa-download"></i>
                                    <span>إنشاء نسخة احتياطية الآن</span>
                                </button>
                                <button class="btn btn-outline" id="restore-backup-btn" style="margin-right: 10px;">
                                    <i class="fas fa-upload"></i>
                                    <span>استعادة من نسخة احتياطية</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-box">
                        <h3 class="settings-title">إعدادات الأمان</h3>
                        <div class="settings-group">
                            <div class="setting-item">
                                <div class="setting-row">
                                    <div class="setting-label">مستوى الأمان</div>
                                    <select class="form-input" id="security-level" style="width: auto;">
                                        <option value="low">منخفض</option>
                                        <option value="medium" selected>متوسط</option>
                                        <option value="high">مرتفع</option>
                                    </select>
                                </div>
                                <div class="setting-description">مستوى الأمان المطبق على البطاقات والمسح الضوئي</div>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-row">
                                    <div class="setting-label">تفعيل كلمات المرور للبطاقات</div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="enable-card-passwords">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="setting-description">تطبيق كلمات مرور افتراضية على البطاقات الجديدة</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <button class="btn btn-danger" id="reset-system-btn">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>إعادة ضبط النظام</span>
                    </button>
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى الـ main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(pageElement);
        } else {
            console.error('لم يتم العثور على عنصر main-content');
        }
    }
    
    // ========================== إضافة أزرار القائمة الجانبية ==========================
    /**
     * إضافة أزرار في القائمة الجانبية
     */
    function addSidebarButtons() {
        // التحقق من وجود زر القائمة مسبقاً
        if (document.querySelector('a.nav-link[data-page="investor-cards"]')) {
            return;
        }
        
        // العثور على عنصر القائمة
        const navList = document.querySelector('.nav-list');
        if (!navList) {
            console.error('لم يتم العثور على قائمة التنقل');
            return;
        }
        
        // إنشاء عنصر الفاصل
        const separator = document.createElement('div');
        separator.className = 'nav-separator';
        separator.innerHTML = '<span>بطاقات المستثمرين</span>';
        
        // إضافة الفاصل إلى القائمة
        navList.appendChild(separator);
        
        // إضافة زر كل البطاقات
        addNavItem(navList, 'investor-cards', 'كل البطاقات', 'fas fa-credit-card');
        
        // إضافة زر البطاقات النشطة
        addNavItem(navList, 'active-cards', 'البطاقات النشطة', 'fas fa-check-circle');
        
        // إضافة زر البطاقات المنتهية
        addNavItem(navList, 'expired-cards', 'البطاقات المنتهية', 'fas fa-calendar-times');
        
        // إضافة زر مسح الباركود
        addNavItem(navList, 'barcode-scanner', 'مسح باركود', 'fas fa-qrcode');
        
        // إضافة زر إنشاء بطاقة جديدة
        addNavItem(navList, 'new-card', 'إنشاء بطاقة جديدة', 'fas fa-plus-circle');
        
        // إضافة زر الإحصائيات
        addNavItem(navList, 'statistics', 'إحصائيات البطاقات', 'fas fa-chart-pie');
        
        // إضافة زر سجل الأنشطة
        addNavItem(navList, 'activity-log', 'سجل الأنشطة', 'fas fa-history');
        
        // إضافة زر الإعدادات
        addNavItem(navList, 'card-settings', 'إعدادات البطاقات', 'fas fa-cogs');
        
        console.log('تم إضافة أزرار بطاقات المستثمرين إلى القائمة الجانبية');
    }
    
   /**
 * إضافة عنصر إلى القائمة الجانبية
 * @param {HTMLElement} navList عنصر القائمة
 * @param {string} pageId معرف الصفحة
 * @param {string} title عنوان العنصر
 * @param {string} iconClass فئة الأيقونة
 */
function addNavItem(navList, pageId, title, iconClass) {
    // إنشاء عنصر القائمة
    const navItem = document.createElement('li');
    navItem.className = 'nav-item';
    
    // إنشاء الرابط
    const navLink = document.createElement('a');
    navLink.className = 'nav-link';
    navLink.href = '#';
    navLink.setAttribute('data-page', pageId);
    
    // إضافة المحتوى
    navLink.innerHTML = `
        <div class="nav-icon">
            <i class="${iconClass}"></i>
        </div>
        <span>${title}</span>
    `;
    
    // إضافة مستمع النقر
    navLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // إزالة الفئة النشطة من جميع الروابط
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // إضافة الفئة النشطة للرابط الحالي
        this.classList.add('active');
        
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إظهار الصفحة المطلوبة
        let targetPage;
        
        switch (pageId) {
            case 'investor-cards':
                targetPage = document.getElementById('investor-cards-page');
                currentView = 'all';
                renderCards('all');
                break;
            case 'active-cards':
                targetPage = document.getElementById('active-cards-page');
                currentView = 'active';
                renderCards('active');
                break;
            case 'expired-cards':
                targetPage = document.getElementById('expired-cards-page');
                currentView = 'expired';
                renderCards('expired');
                break;
            case 'barcode-scanner':
                targetPage = document.getElementById('barcode-scanner-page');
                currentView = 'scanner';
                initBarcodeScanner();
                break;
            case 'new-card':
                targetPage = document.getElementById('new-card-page');
                currentView = 'new';
                updateInvestorSelect();
                setupCardPreview();
                break;
            case 'statistics':
                targetPage = document.getElementById('statistics-page');
                currentView = 'statistics';
                renderStatistics();
                break;
            case 'activity-log':
                targetPage = document.getElementById('activity-log-page');
                currentView = 'activity';
                renderActivities();
                break;
            case 'card-settings':
                targetPage = document.getElementById('settings-page');
                currentView = 'settings';
                loadSettingsToForm();
                break;
            default:
                targetPage = document.getElementById(`${pageId}-page`);
                break;
        }
        
        if (targetPage) {
            targetPage.classList.add('active');
        } else {
            console.error(`الصفحة ${pageId} غير موجودة`);
        }
    });
    
    // إضافة الرابط إلى عنصر القائمة
    navItem.appendChild(navLink);
    
    // إضافة عنصر القائمة إلى القائمة
    navList.appendChild(navItem);
} // هذه القوس المغلقة كانت مفقودة
            
            // إظهار الصفحة المطلوبة
            let targetPage;
            
            switch (pageId) {
                case 'investor-cards':
                    targetPage = document.getElementById('investor-cards-page');
                    currentView = 'all';
                    renderCards('all');
                    break;
                case 'active-cards':
                    targetPage = document.getElementById('active-cards-page');
                    currentView = 'active';
                    renderCards('active');
                    break;
                case 'expired-cards':
                    targetPage = document.getElementById('expired-cards-page');
                    currentView = 'expired';
                    renderCards('expired');
                    break;
                case 'barcode-scanner':
                    targetPage = document.getElementById('barcode-scanner-page');
                    currentView = 'scanner';
                    initBarcodeScanner();
                    break;
                case 'new-card':
                    targetPage = document.getElementById('new-card-page');
                    currentView = 'new';
                    updateInvestorSelect();
                    setupCardPreview();
                    break;
                case 'statistics':
                    targetPage = document.getElementById('statistics-page');
                    currentView = 'statistics';
                    renderStatistics();
                    break;
                case 'activity-log':
                    targetPage = document.getElementById('activity-log-page');
                    currentView = 'activity';
                    renderActivities();
                    break;
                case 'card-settings':
                    targetPage = document.getElementById('settings-page');
                    currentView = 'settings';
                    loadSettingsToForm();
                    break;
                default:
                    targetPage = document.getElementById(`${pageId}-page`);
                    break;
            }
            
            if (targetPage) {
                targetPage.classList.add('active');
            } else {
                console.error(`الصفحة ${pageId} غير موجودة`);
            }
        });


        // استمرار تنفيذ وظائف نظام بطاقات المستثمرين

// استكمال دالة طباعة البطاقة
function printCard(cardId) {
    // الحصول على معرف البطاقة إذا لم يتم تمريره
    if (!cardId) {
        cardId = document.getElementById('print-card-btn').getAttribute('data-card-id');
    }
    
    if (!cardId) return;
    
    // البحث عن البطاقة
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    // إضافة نشاط
    addActivity('print', card.id, card.investorId, 'تم طباعة البطاقة');
    
    // إنشاء نافذة الطباعة
    const printWindow = window.open('', '_blank');
    
    // تحديد نوع البطاقة وألوانها
    let cardBrandName = getCardTypeName(card.cardType);
    
    const expiryMonth = new Date(card.expiryDate).getMonth() + 1;
    const expiryYear = new Date(card.expiryDate).getFullYear().toString().slice(2);
    const expiryFormatted = `${expiryMonth}/${expiryYear}`;
    
    // تحديد لون البطاقة
    let cardBackgroundColor = '';
    if (card.cardType === 'custom' && card.customColor) {
        cardBackgroundColor = card.customColor;
    } else {
        cardBackgroundColor = settings.cardStyles[card.cardType].backgroundColor;
    }
    
    // إنشاء محتوى نافذة الطباعة
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <title>طباعة بطاقة المستثمر</title>
            <meta charset="utf-8">
            <style>
                @page {
                    size: 85mm 54mm;
                    margin: 0;
                }
                
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background-color: #f8f9fa;
                }
                
                .card-container {
                    width: 85mm;
                    height: 54mm;
                    overflow: hidden;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                    border-radius: 15px;
                }
                
                .investor-card {
                    width: 100%;
                    height: 100%;
                    border-radius: 15px;
                    background-color: ${cardBackgroundColor};
                    color: white;
                    padding: 25px;
                    position: relative;
                    overflow: hidden;
                }
                
                .card-brand {
                    position: absolute;
                    top: 20px;
                    right: 25px;
                    font-size: 1.4rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                }
                
                .card-logo {
                    position: absolute;
                    top: 20px;
                    left: 25px;
                    display: flex;
                    gap: 5px;
                }
                
                .card-logo-circle {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                }
                
                .card-logo-circle.red {
                    background: #eb001b;
                }
                
                .card-logo-circle.yellow {
                    background: #f79e1b;
                    opacity: 0.8;
                    margin-right: -15px;
                }
                
                .card-type-indicator {
                    position: absolute;
                    top: 50px;
                    right: 25px;
                    font-size: 0.8rem;
                    padding: 3px 8px;
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                
                .card-chip {
                    position: absolute;
                    top: 90px;
                    right: 25px;
                    width: 40px;
                    height: 30px;
                    background: linear-gradient(135deg, #daa520, #ffd700, #daa520);
                    border-radius: 5px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 2px;
                    transform: rotate(90deg);
                }
                
                .chip-line {
                    height: 3px;
                    background-color: rgba(0, 0, 0, 0.3);
                    border-radius: 1px;
                }
                
                .card-qrcode {
                    width: 80px;
                    height: 80px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    top: 70px;
                    left: 25px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                }
                
                .card-qrcode img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                
                .card-number {
                    position: absolute;
                    bottom: 80px;
                    width: 100%;
                    left: 0;
                    padding: 0 25px;
                    font-size: 1.5rem;
                    letter-spacing: 2px;
                    text-align: center;
                    color: white;
                }
                
                .card-details {
                    position: absolute;
                    bottom: 25px;
                    width: 100%;
                    left: 0;
                    padding: 0 25px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                
                .card-validity {
                    font-size: 0.9rem;
                    display: flex;
                    flex-direction: column;
                }
                
                .card-valid-text {
                    font-size: 0.7rem;
                    opacity: 0.7;
                    margin-bottom: 3px;
                }
                
                .card-name {
                    font-size: 1rem;
                    text-align: right;
                    text-transform: uppercase;
                }
                
                .card-hologram {
                    position: absolute;
                    bottom: 15px;
                    right: 25px;
                    width: 60px;
                    height: 40px;
                    background: linear-gradient(
                        135deg,
                        rgba(255, 255, 255, 0.5),
                        rgba(255, 255, 255, 0.1),
                        rgba(255, 255, 255, 0.5)
                    );
                    border-radius: 5px;
                }
                
                @media print {
                    body {
                        background: none;
                    }
                    
                    .card-container {
                        box-shadow: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="card-container">
                <div class="investor-card">
                    <div class="card-brand">${cardBrandName}</div>
                    <div class="card-logo">
                        <div class="card-logo-circle red"></div>
                        <div class="card-logo-circle yellow"></div>
                    </div>
                    <div class="card-type-indicator">${getCardTypeArabicName(card.cardType)}</div>
                    <div class="card-chip">
                        <div class="chip-line"></div>
                        <div class="chip-line"></div>
                        <div class="chip-line"></div>
                        <div class="chip-line"></div>
                    </div>
                    <div class="card-qrcode">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${card.id}" alt="QR Code">
                    </div>
                    <div class="card-number">${card.cardNumber}</div>
                    <div class="card-details">
                        <div class="card-validity">
                            <div class="card-valid-text">VALID</div>
                            <div>${expiryFormatted}</div>
                        </div>
                        <div class="card-name">${card.investorName}</div>
                    </div>
                    <div class="card-hologram"></div>
                </div>
            </div>
            <script>
                // طباعة ثم إغلاق النافذة بعد الطباعة
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() {
                            // window.close();
                        }, 500);
                    }, 500);
                    };
                })();
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}


/**
 * مشاركة البطاقة
 * @param {string} cardId معرف البطاقة
 */
function shareCard(cardId) {
    // الحصول على معرف البطاقة إذا لم يتم تمريره
    if (!cardId) {
        cardId = document.getElementById('share-card-btn').getAttribute('data-card-id');
    }
    
    if (!cardId) return;
    
    // البحث عن البطاقة
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    // إنشاء نافذة المشاركة
    const container = document.createElement('div');
    container.className = 'modal-overlay active';
    container.id = 'share-card-modal';
    
    container.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">مشاركة البطاقة</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="share-options">
                    <div class="share-option" id="share-as-image">
                        <i class="fas fa-image"></i>
                        <span>مشاركة كصورة</span>
                    </div>
                    <div class="share-option" id="share-as-qr">
                        <i class="fas fa-qrcode"></i>
                        <span>مشاركة كرمز QR</span>
                    </div>
                    <div class="share-option" id="share-as-text">
                        <i class="fas fa-file-alt"></i>
                        <span>مشاركة كنص</span>
                    </div>
                    <div class="share-option" id="share-via-email">
                        <i class="fas fa-envelope"></i>
                        <span>إرسال عبر البريد الإلكتروني</span>
                    </div>
                </div>
                
                <div id="share-preview" class="text-center" style="margin-top: 20px;">
                    <!-- سيتم ملؤه ديناميكياً -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إغلاق</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(container);
    
    // إضافة مستمعي الأحداث
    const closeButtons = container.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            container.remove();
        });
    });
    
    // إضافة مستمعي أحداث لخيارات المشاركة
    container.querySelector('#share-as-image').addEventListener('click', function() {
        shareCardAsImage(card, container);
    });
    
    container.querySelector('#share-as-qr').addEventListener('click', function() {
        shareCardAsQR(card, container);
    });
    
    container.querySelector('#share-as-text').addEventListener('click', function() {
        shareCardAsText(card, container);
    });
    
    container.querySelector('#share-via-email').addEventListener('click', function() {
        shareCardViaEmail(card);
    });
    
    // إضافة نشاط
    addActivity('share', card.id, card.investorId, 'تم مشاركة البطاقة');
    
    // عرض البطاقة كصورة افتراضياً
    setTimeout(() => {
        shareCardAsImage(card, container);
    }, 100);
}

/**
 * مشاركة البطاقة كصورة
 * @param {Object} card بيانات البطاقة
 * @param {HTMLElement} container عنصر حاوية المشاركة
 */
function shareCardAsImage(card, container) {
    const preview = container.querySelector('#share-preview');
    preview.innerHTML = '<div class="text-center">جاري توليد صورة البطاقة...</div>';
    
    // تحديد نوع البطاقة وألوانها
    let cardBrandName = getCardTypeName(card.cardType);
    
    const expiryMonth = new Date(card.expiryDate).getMonth() + 1;
    const expiryYear = new Date(card.expiryDate).getFullYear().toString().slice(2);
    const expiryFormatted = `${expiryMonth}/${expiryYear}`;
    
    // تحديد لون البطاقة
    let cardBackgroundColor = '';
    if (card.cardType === 'custom' && card.customColor) {
        cardBackgroundColor = card.customColor;
    } else {
        cardBackgroundColor = settings.cardStyles[card.cardType].backgroundColor;
    }
    
    // إنشاء البطاقة
    const cardHtml = `
        <div class="investor-card" id="card-for-image" style="background-color: ${cardBackgroundColor}; margin: 0 auto; width: 390px; height: 245px;">
            <div class="card-brand">${cardBrandName}</div>
            <div class="card-logo">
                <div class="card-logo-circle red"></div>
                <div class="card-logo-circle yellow"></div>
            </div>
            <div class="card-type-indicator card-type-${card.cardType}">${getCardTypeArabicName(card.cardType)}</div>
            <div class="card-chip">
                <div class="chip-line"></div>
                <div class="chip-line"></div>
                <div class="chip-line"></div>
                <div class="chip-line"></div>
            </div>
            <div class="card-qrcode">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${card.id}" alt="QR Code">
            </div>
            <div class="card-number">${card.cardNumber}</div>
            <div class="card-details">
                <div class="card-validity">
                    <div class="card-valid-text">VALID</div>
                    <div>${expiryFormatted}</div>
                </div>
                <div class="card-name">${card.investorName}</div>
            </div>
            <div class="card-hologram"></div>
        </div>
        <div style="margin-top: 20px;">
            <button class="btn btn-primary" id="download-card-image">
                <i class="fas fa-download"></i>
                <span>تنزيل الصورة</span>
            </button>
        </div>
    `;
    
    preview.innerHTML = cardHtml;
    
    // استخدام html2canvas لتحويل البطاقة إلى صورة
    if (typeof html2canvas === 'undefined') {
        // تحميل المكتبة إذا لم تكن موجودة
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = function() {
            convertCardToImage();
        };
        document.head.appendChild(script);
    } else {
        convertCardToImage();
    }
    
    function convertCardToImage() {
        const cardElement = container.querySelector('#card-for-image');
        if (!cardElement) return;
        
        html2canvas(cardElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
        }).then(canvas => {
            const dataUrl = canvas.toDataURL('image/png');
            
            // إضافة زر التنزيل
            const downloadBtn = container.querySelector('#download-card-image');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', function() {
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = `card_${card.investorName.replace(/\s+/g, '_')}.png`;
                    link.click();
                });
            }
        });
    }
}

/**
 * مشاركة البطاقة كرمز QR
 * @param {Object} card بيانات البطاقة
 * @param {HTMLElement} container عنصر حاوية المشاركة
 */
function shareCardAsQR(card, container) {
    const preview = container.querySelector('#share-preview');
    
    // تجهيز بيانات البطاقة للتضمين في رمز QR
    const cardData = {
        id: card.id,
        name: card.investorName,
        type: card.cardType,
        number: card.cardNumber,
        expiry: card.expiryDate
    };
    
    const cardDataString = JSON.stringify(cardData);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(cardDataString)}`;
    
    // عرض رمز QR
    preview.innerHTML = `
        <div style="margin: 0 auto; width: 300px;">
            <img src="${qrUrl}" alt="QR Code" style="width: 100%; height: auto;">
        </div>
        <div style="margin-top: 20px;">
            <button class="btn btn-primary" id="download-qr-image">
                <i class="fas fa-download"></i>
                <span>تنزيل رمز QR</span>
            </button>
        </div>
    `;
    
    // إضافة مستمع لزر التنزيل
    const downloadBtn = container.querySelector('#download-qr-image');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            // إنشاء رابط للتنزيل
            const link = document.createElement('a');
            link.href = qrUrl;
            link.download = `card_qr_${card.investorName.replace(/\s+/g, '_')}.png`;
            link.click();
        });
    }
}

/**
 * مشاركة البطاقة كنص
 * @param {Object} card بيانات البطاقة
 * @param {HTMLElement} container عنصر حاوية المشاركة
 */
function shareCardAsText(card, container) {
    const preview = container.querySelector('#share-preview');
    
    // تنسيق تاريخ الانتهاء
    const expiryDate = new Date(card.expiryDate);
    const expiryFormatted = `${expiryDate.getDate()}/${expiryDate.getMonth() + 1}/${expiryDate.getFullYear()}`;
    
    // إنشاء نص البطاقة
    const cardText = `
معلومات بطاقة المستثمر

الاسم: ${card.investorName}
رقم البطاقة: ${card.cardNumber}
نوع البطاقة: ${getCardTypeArabicName(card.cardType)}
تاريخ الإصدار: ${formatDate(card.createdAt)}
تاريخ الانتهاء: ${expiryFormatted}
الحالة: ${card.status === 'active' ? 'نشطة' : 'متوقفة'}

نظام الاستثمار المتكامل
    `;
    
    // عرض النص
    preview.innerHTML = `
        <div style="margin: 0 auto; max-width: 500px;">
            <textarea readonly class="form-input" style="width: 100%; height: 200px; direction: rtl; text-align: right;">${cardText}</textarea>
        </div>
        <div style="margin-top: 20px;">
            <button class="btn btn-primary" id="copy-card-text">
                <i class="fas fa-copy"></i>
                <span>نسخ النص</span>
            </button>
        </div>
    `;
    
    // إضافة مستمع لزر النسخ
    const copyBtn = container.querySelector('#copy-card-text');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const textarea = container.querySelector('textarea');
            if (textarea) {
                textarea.select();
                document.execCommand('copy');
                showNotification('تم نسخ النص بنجاح', 'success');
            }
        });
    }
}

/**
 * مشاركة البطاقة عبر البريد الإلكتروني
 * @param {Object} card بيانات البطاقة
 */
function shareCardViaEmail(card) {
    // تنسيق تاريخ الانتهاء
    const expiryDate = new Date(card.expiryDate);
    const expiryFormatted = `${expiryDate.getDate()}/${expiryDate.getMonth() + 1}/${expiryDate.getFullYear()}`;
    
    // إنشاء نص البريد
    const subject = `بطاقة المستثمر - ${card.investorName}`;
    const body = `
معلومات بطاقة المستثمر

الاسم: ${card.investorName}
رقم البطاقة: ${card.cardNumber}
نوع البطاقة: ${getCardTypeArabicName(card.cardType)}
تاريخ الإصدار: ${formatDate(card.createdAt)}
تاريخ الانتهاء: ${expiryFormatted}
الحالة: ${card.status === 'active' ? 'نشطة' : 'متوقفة'}

نظام الاستثمار المتكامل
    `;
    
    // فتح تطبيق البريد الإلكتروني
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // إضافة نشاط
    addActivity('share', card.id, card.investorId, 'تم مشاركة البطاقة عبر البريد الإلكتروني');
}

// ========================== قارئ الباركود ==========================
/**
 * تهيئة ماسح الباركود
 */
function initBarcodeScanner() {
    console.log('تهيئة ماسح الباركود...');
    
    // التحقق من وجود مكتبة Html5QrcodeScanner
    if (typeof Html5QrcodeScanner === 'undefined') {
        // تحميل المكتبة ديناميكياً
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/html5-qrcode';
        script.onload = function() {
            // بعد تحميل المكتبة، نقوم بتهيئة الماسح
            initScannerAfterLoad();
        };
        document.head.appendChild(script);
    } else {
        // المكتبة موجودة بالفعل، نقوم بتهيئة الماسح
        initScannerAfterLoad();
    }
}

/**
 * تهيئة الماسح بعد تحميل المكتبة
 */
function initScannerAfterLoad() {
    // الحصول على حاوية الماسح
    const scannerContainer = document.getElementById('scanner-container');
    if (!scannerContainer) return;
    
    // إنشاء ماسح جديد
    scannerInstance = new Html5QrcodeScanner(
        "scanner-container",
        { 
            fps: 10, 
            qrbox: 250,
            rememberLastUsedCamera: true,
            aspectRatio: 1.0
        },
        /* verbose= */ false
    );
    
    // بدء المسح تلقائياً
    startBarcodeScanner();
    
    // تحديث حالة الأزرار
    updateScannerButtonsState();
}

/**
 * بدء المسح
 */
function startBarcodeScanner() {
    if (!scannerInstance) return;
    
    scannerInstance.render(
        // نجاح المسح
        result => {
            if (result.decodedText) {
                console.log('تم مسح الكود بنجاح:', result.decodedText);
                
                // تشغيل صوت النجاح إذا كان مفعلاً
                if (settings.enableSounds) {
                    playSuccessSound();
                }
                
                // عرض النتيجة
                const scanResult = document.getElementById('scan-result');
                const scanResultData = document.getElementById('scan-result-data');
                
                if (scanResult && scanResultData) {
                    scanResult.classList.remove('hidden');
                    
                    // البحث عن البطاقة باستخدام المعرف
                    const card = cards.find(c => c.id === result.decodedText);
                    
                    if (card) {
                        // تخزين معرف البطاقة في عنصر النتيجة
                        scanResultData.dataset.cardId = card.id;
                        
                        // عرض معلومات البطاقة
                        scanResultData.innerHTML = `
                            <div class="scan-result-card">
                                <div><strong>المستثمر:</strong> ${card.investorName}</div>
                                <div><strong>نوع البطاقة:</strong> ${getCardTypeArabicName(card.cardType)}</div>
                                <div><strong>رقم البطاقة:</strong> ${card.cardNumber}</div>
                                <div><strong>تاريخ الانتهاء:</strong> ${formatDate(card.expiryDate)}</div>
                                <div><strong>الحالة:</strong> 
                                    ${card.status === 'active' ? 
                                        (new Date(card.expiryDate) >= new Date() ? 
                                            '<span class="badge badge-success">نشطة</span>' : 
                                            '<span class="badge badge-warning">منتهية</span>') : 
                                        '<span class="badge badge-danger">متوقفة</span>'}
                                </div>
                            </div>
                        `;
                        
                        // إضافة نشاط
                        addActivity('scan', card.id, card.investorId, 'تم مسح البطاقة');
                    } else {
                        scanResultData.innerHTML = 'لم يتم العثور على بطاقة بهذا المعرف: ' + result.decodedText;
                        scanResultData.dataset.cardId = '';
                    }
                }
            }
        },
        // خطأ في المسح
        error => {
            console.warn('خطأ في المسح:', error);
        }
    );
    
    // تحديث حالة الأزرار
    updateScannerButtonsState(true);
}

/**
 * إيقاف المسح
 */
function stopBarcodeScanner() {
    if (!scannerInstance) return;
    
    try {
        scannerInstance.clear();
    } catch (error) {
        console.error('خطأ في إيقاف الماسح:', error);
    }
    
    // تحديث حالة الأزرار
    updateScannerButtonsState(false);
}

/**
 * تبديل الكاميرا (الأمامية/الخلفية)
 */
function switchCamera() {
    if (!scannerInstance) return;
    
    // إيقاف الماسح
    stopBarcodeScanner();
    
    // إعادة تهيئة الماسح
    initBarcodeScanner();
    
    showNotification('تم تبديل الكاميرا', 'info');
}

/**
 * تبديل الفلاش
 */
function toggleFlash() {
    // للأسف، HTML5 QR Code Scanner لا يدعم تبديل الفلاش بشكل مباشر
    // يمكن تنفيذ هذه الوظيفة لاحقاً إذا أصبحت متاحة
    showNotification('وظيفة الفلاش غير متاحة حالياً', 'info');
}

/**
 * تحديث حالة أزرار الماسح
 * @param {boolean} isScanning حالة المسح
 */
function updateScannerButtonsState(isScanning = false) {
    const startButton = document.getElementById('start-scanner');
    const stopButton = document.getElementById('stop-scanner');
    const flashButton = document.getElementById('flash-toggle');
    
    if (startButton && stopButton) {
        startButton.disabled = isScanning;
        stopButton.disabled = !isScanning;
    }
    
    if (flashButton) {
        flashButton.disabled = !isScanning;
    }
}


function playSuccessSound() {
   // إنشاء عنصر صوت
   const audio = new Audio();
   
   // تعيين الصوت
   // استخدام صوت قصير مشفر بنظام Base64 لتجنب الحاجة لملف خارجي
   audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAsAAAesAAVFRUVISEhIS0tLS05OTk5RUVFRVFRUVFXV1dXY2NjY29vb299fX19iYmJiZWVlZWhoaGhrKysrLi4uLjExMTE0dHR0d3d3d3o6Ojp9fX19QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
   
   // تشغيل الصوت
   audio.play().catch(error => {
       console.warn('لم يتم تشغيل الصوت:', error);
   });
}

/**
* تشغيل صوت الخطأ
*/
function playErrorSound() {
   // إنشاء عنصر صوت
   const audio = new Audio();
   
   // تعيين الصوت
   audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABTGF2YzU4LjEzAAAAAAAAAAAAAAAAJAM=';
   
   // تشغيل الصوت
   audio.play().catch(error => {
       console.warn('لم يتم تشغيل الصوت:', error);
   });
}

// ========================== الإحصائيات ==========================
/**
* عرض إحصائيات البطاقات
*/
function renderStatistics() {
   console.log('عرض إحصائيات البطاقات...');
   
   // التأكد من تحميل Chart.js
   if (typeof Chart === 'undefined') {
       // تحميل المكتبة ديناميكياً
       const script = document.createElement('script');
       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
       script.onload = function() {
           initializeCharts();
       };
       document.head.appendChild(script);
   } else {
       initializeCharts();
   }
   
   // ملء ملخص البطاقات
   renderCardsSummary();
   
   // ملء حالة البطاقات
   renderCardsStatus();
   
   // ملء أكثر المستثمرين نشاطاً
   renderTopInvestors();
}

/**
* تهيئة الرسوم البيانية
*/
function initializeCharts() {
   // تدمير الرسوم البيانية السابقة
   Object.values(chartInstances).forEach(chart => {
       if (chart) {
           chart.destroy();
       }
   });
   
   // إعادة تعيين كائن نسخ الرسوم البيانية
   chartInstances = {};
   
   // إنشاء رسم بياني لتوزيع البطاقات حسب النوع
   createCardsByTypeChart();
   
   // إنشاء رسم بياني للبطاقات النشطة والمنتهية
   createCardsByStatusChart();
   
   // إنشاء رسم بياني لإنشاء البطاقات عبر الزمن
   createCardsOverTimeChart();
   
   // إنشاء رسم بياني لتجديدات البطاقات
   createCardsRenewalsChart();
}

/**
* ملء ملخص البطاقات
*/
function renderCardsSummary() {
   const summaryContainer = document.getElementById('cards-summary');
   if (!summaryContainer) return;
   
   // حساب إجماليات البطاقات
   const totalCards = cards.length;
   const activeCards = cards.filter(card => card.status === 'active' && new Date(card.expiryDate) >= new Date()).length;
   const expiredCards = cards.filter(card => card.status === 'active' && new Date(card.expiryDate) < new Date()).length;
   const deactivatedCards = cards.filter(card => card.status === 'inactive').length;
   
   // إنشاء HTML
   const html = `
       <div style="display: flex; flex-wrap: wrap; gap: 20px;">
           <div style="flex: 1; min-width: 120px;">
               <div style="font-size: 2rem; font-weight: bold; color: #3498db; text-align: center;">${totalCards}</div>
               <div style="text-align: center; margin-top: 5px;">إجمالي البطاقات</div>
           </div>
           <div style="flex: 1; min-width: 120px;">
               <div style="font-size: 2rem; font-weight: bold; color: #2ecc71; text-align: center;">${activeCards}</div>
               <div style="text-align: center; margin-top: 5px;">بطاقات نشطة</div>
           </div>
           <div style="flex: 1; min-width: 120px;">
               <div style="font-size: 2rem; font-weight: bold; color: #f39c12; text-align: center;">${expiredCards}</div>
               <div style="text-align: center; margin-top: 5px;">بطاقات منتهية</div>
           </div>
           <div style="flex: 1; min-width: 120px;">
               <div style="font-size: 2rem; font-weight: bold; color: #e74c3c; text-align: center;">${deactivatedCards}</div>
               <div style="text-align: center; margin-top: 5px;">بطاقات متوقفة</div>
           </div>
       </div>
   `;
   
   // تحديث المحتوى
   summaryContainer.innerHTML = html;
}

/**
* ملء حالة البطاقات
*/
function renderCardsStatus() {
   const statusContainer = document.getElementById('cards-status');
   if (!statusContainer) return;
   
   // حساب توزيع أنواع البطاقات
   const cardTypes = {
       platinum: 0,
       gold: 0,
       premium: 0,
       diamond: 0,
       islamic: 0,
       custom: 0
   };
   
   cards.forEach(card => {
       if (cardTypes.hasOwnProperty(card.cardType)) {
           cardTypes[card.cardType]++;
       }
   });
   
   // إنشاء HTML
   const html = `
       <div style="display: flex; flex-wrap: wrap; gap: 20px;">
           <div style="flex: 1; min-width: 120px;">
               <div style="font-size: 1.5rem; font-weight: bold; color: #bdc3c7; text-align: center;">${cardTypes.platinum}</div>
               <div style="text-align: center; margin-top: 5px;">بلاتينية</div>
           </div>
           <div style="flex: 1; min-width: 120px;">
               <div style="font-size: 1.5rem; font-weight: bold; color: #f1c40f; text-align: center;">${cardTypes.gold}</div>
               <div style="text-align: center; margin-top: 5px;">ذهبية</div>
           </div>
           <div style="flex: 1; min-width: 120px;">
               <div style="font-size: 1.5rem; font-weight: bold; color: #e74c3c; text-align: center;">${cardTypes.premium}</div>
               <div style="text-align: center; margin-top: 5px;">بريميوم</div>
           </div>
           <div style="flex: 1; min-width: 120px;">
               <div style="font-size: 1.5rem; font-weight: bold; color: #3498db; text-align: center;">${cardTypes.diamond}</div>
               <div style="text-align: center; margin-top: 5px;">ماسية</div>
           </div>
           <div style="flex: 1; min-width: 120px;">
               <div style="font-size: 1.5rem; font-weight: bold; color: #27ae60; text-align: center;">${cardTypes.islamic}</div>
               <div style="text-align: center; margin-top: 5px;">إسلامية</div>
           </div>
           <div style="flex: 1; min-width: 120px;">
               <div style="font-size: 1.5rem; font-weight: bold; color: #9b59b6; text-align: center;">${cardTypes.custom}</div>
               <div style="text-align: center; margin-top: 5px;">مخصصة</div>
           </div>
       </div>
       
       <div style="margin-top: 20px;">
           <div style="font-weight: bold; margin-bottom: 10px;">حالة البطاقات</div>
           <div style="height: 20px; background-color: #f5f5f5; border-radius: 10px; overflow: hidden; position: relative;">
               <div style="position: absolute; height: 100%; background-color: #2ecc71; width: ${cards.length > 0 ? (cards.filter(card => card.status === 'active' && new Date(card.expiryDate) >= new Date()).length / cards.length * 100) : 0}%;"></div>
               <div style="position: absolute; height: 100%; background-color: #f39c12; width: ${cards.length > 0 ? (cards.filter(card => card.status === 'active' && new Date(card.expiryDate) < new Date()).length / cards.length * 100) : 0}%; margin-right: ${cards.length > 0 ? (cards.filter(card => card.status === 'active' && new Date(card.expiryDate) >= new Date()).length / cards.length * 100) : 0}%;"></div>
           </div>
           <div style="display: flex; margin-top: 5px; font-size: 0.8rem;">
               <div style="display: flex; align-items: center; margin-left: 15px;">
                   <div style="width: 10px; height: 10px; background-color: #2ecc71; border-radius: 50%; margin-left: 5px;"></div>
                   <span>نشطة</span>
               </div>
               <div style="display: flex; align-items: center; margin-left: 15px;">
                   <div style="width: 10px; height: 10px; background-color: #f39c12; border-radius: 50%; margin-left: 5px;"></div>
                   <span>منتهية</span>
               </div>
               <div style="display: flex; align-items: center;">
                   <div style="width: 10px; height: 10px; background-color: #e74c3c; border-radius: 50%; margin-left: 5px;"></div>
                   <span>متوقفة</span>
               </div>
           </div>
       </div>
   `;
   
   // تحديث المحتوى
   statusContainer.innerHTML = html;
}

/**
* ملء أكثر المستثمرين نشاطاً
*/
function renderTopInvestors() {
   const topInvestorsContainer = document.getElementById('top-investors');
   if (!topInvestorsContainer) return;
   
   // إنشاء قائمة المستثمرين مع عدد البطاقات
   const investorCards = {};
   cards.forEach(card => {
       if (!investorCards[card.investorId]) {
           investorCards[card.investorId] = {
               name: card.investorName,
               cards: 0,
               active: 0
           };
       }
       
       investorCards[card.investorId].cards++;
       
       if (card.status === 'active' && new Date(card.expiryDate) >= new Date()) {
           investorCards[card.investorId].active++;
       }
   });
   
   // تحويل الكائن إلى مصفوفة وترتيبها
   const topInvestors = Object.values(investorCards)
       .sort((a, b) => b.cards - a.cards)
       .slice(0, 5);
   
   // إنشاء HTML
   let html = '';
   
   if (topInvestors.length > 0) {
       html = '<ul style="list-style: none; padding: 0;">';
       
       topInvestors.forEach(investor => {
           html += `
               <li style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                   <div>
                       <div style="font-weight: bold;">${investor.name}</div>
                       <div style="color: #7f8c8d; font-size: 0.9rem;">
                           <span style="color: #3498db;">${investor.active}</span> نشطة / <span style="color: #2c3e50;">${investor.cards}</span> إجمالي
                       </div>
                   </div>
                   <div style="display: flex; align-items: center;">
                       <div style="width: ${Math.max(30, investor.cards * 20)}px; height: 10px; background-color: #3498db; border-radius: 5px;"></div>
                   </div>
               </li>
           `;
       });
       
       html += '</ul>';
   } else {
       html = '<div class="text-center">لا توجد بيانات للعرض</div>';
   }
   
   // تحديث المحتوى
   topInvestorsContainer.innerHTML = html;
}

/**
* إنشاء رسم بياني لتوزيع البطاقات حسب النوع
*/
function createCardsByTypeChart() {
   const canvas = document.getElementById('cards-by-type-chart');
   if (!canvas || typeof Chart === 'undefined') return;
   
   // حساب توزيع أنواع البطاقات
   const cardTypes = {
       platinum: 0,
       gold: 0,
       premium: 0,
       diamond: 0,
       islamic: 0,
       custom: 0
   };
   
   cards.forEach(card => {
       if (cardTypes.hasOwnProperty(card.cardType)) {
           cardTypes[card.cardType]++;
       }
   });
   
   // تحضير البيانات
   const data = {
       labels: [
           'بلاتينية',
           'ذهبية',
           'بريميوم',
           'ماسية',
           'إسلامية',
           'مخصصة'
       ],
       datasets: [{
           data: [
               cardTypes.platinum,
               cardTypes.gold,
               cardTypes.premium,
               cardTypes.diamond,
               cardTypes.islamic,
               cardTypes.custom
           ],
           backgroundColor: [
               '#bdc3c7',
               '#f1c40f',
               '#e74c3c',
               '#3498db',
               '#27ae60',
               '#9b59b6'
           ],
           borderColor: 'rgba(255, 255, 255, 0.5)',
           borderWidth: 1
       }]
   };
   
   // إنشاء الرسم البياني
   const ctx = canvas.getContext('2d');
   chartInstances.cardsByType = new Chart(ctx, {
       type: 'doughnut',
       data: data,
       options: {
           responsive: true,
           maintainAspectRatio: false,
           plugins: {
               legend: {
                   position: 'right',
                   labels: {
                       font: {
                           family: 'Tajawal, sans-serif'
                       }
                   }
               },
               tooltip: {
                   callbacks: {
                       label: function(context) {
                           const label = context.label || '';
                           const value = context.formattedValue || '';
                           return `${label}: ${value}`;
                       }
                   }
               }
           }
       }
   });
}

/**
* إنشاء رسم بياني للبطاقات النشطة والمنتهية
*/
function createCardsByStatusChart() {
   const canvas = document.getElementById('cards-by-status-chart');
   if (!canvas || typeof Chart === 'undefined') return;
   
   // حساب عدد البطاقات حسب الحالة
   const activeCards = cards.filter(card => card.status === 'active' && new Date(card.expiryDate) >= new Date()).length;
   const expiredCards = cards.filter(card => card.status === 'active' && new Date(card.expiryDate) < new Date()).length;
   const deactivatedCards = cards.filter(card => card.status === 'inactive').length;
   
   // تحضير البيانات
   const data = {
       labels: ['نشطة', 'منتهية', 'متوقفة'],
       datasets: [{
           data: [activeCards, expiredCards, deactivatedCards],
           backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'],
           borderColor: 'rgba(255, 255, 255, 0.5)',
           borderWidth: 1
       }]
   };
   
   // إنشاء الرسم البياني
   const ctx = canvas.getContext('2d');
   chartInstances.cardsByStatus = new Chart(ctx, {
       type: 'pie',
       data: data,
       options: {
           responsive: true,
           maintainAspectRatio: false,
           plugins: {
               legend: {
                   position: 'right',
                   labels: {
                       font: {
                           family: 'Tajawal, sans-serif'
                       }
                   }
               },
               tooltip: {
                   callbacks: {
                       label: function(context) {
                           const label = context.label || '';
                           const value = context.formattedValue || '';
                           const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                           const percentage = Math.round((context.raw / total) * 100);
                           return `${label}: ${value} (${percentage}%)`;
                       }
                   }
               }
           }
       }
   });
}

/**
* إنشاء رسم بياني لإنشاء البطاقات عبر الزمن
*/
function createCardsOverTimeChart() {
   const canvas = document.getElementById('cards-over-time-chart');
   if (!canvas || typeof Chart === 'undefined' || cards.length === 0) return;
   
   // ترتيب البطاقات حسب تاريخ الإنشاء
   const sortedCards = [...cards].sort((a, b) => 
       new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
   );
   
   // الحصول على قائمة الشهور
   const months = {};
   const labels = [];
   const data = [];
   
   sortedCards.forEach(card => {
       const date = new Date(card.createdAt);
       const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
       
       if (!months[monthYear]) {
           months[monthYear] = 0;
           labels.push(monthYear);
       }
       
       months[monthYear]++;
   });
   
   // إنشاء بيانات تراكمية
   let cumulative = 0;
   labels.forEach(month => {
       cumulative += months[month];
       data.push(cumulative);
   });
   
   // تحضير البيانات
   const chartData = {
       labels: labels,
       datasets: [{
           label: 'إجمالي البطاقات',
           data: data,
           fill: true,
           backgroundColor: 'rgba(52, 152, 219, 0.2)',
           borderColor: 'rgba(52, 152, 219, 1)',
           borderWidth: 2,
           tension: 0.4
       }]
   };
   
   // إنشاء الرسم البياني
   const ctx = canvas.getContext('2d');
   chartInstances.cardsOverTime = new Chart(ctx, {
       type: 'line',
       data: chartData,
       options: {
           responsive: true,
           maintainAspectRatio: false,
           scales: {
               y: {
                   beginAtZero: true,
                   title: {
                       display: true,
                       text: 'عدد البطاقات',
                       font: {
                           family: 'Tajawal, sans-serif'
                       }
                   }
               },
               x: {
                   title: {
                       display: true,
                       text: 'الشهر/السنة',
                       font: {
                           family: 'Tajawal, sans-serif'
                       }
                   }
               }
           },
           plugins: {
               legend: {
                   labels: {
                       font: {
                           family: 'Tajawal, sans-serif'
                       }
                   }
               }
           }
       }
   });
}

/**
* إنشاء رسم بياني لتجديدات البطاقات
*/
function createCardsRenewalsChart() {
   const canvas = document.getElementById('cards-renewals-chart');
   if (!canvas || typeof Chart === 'undefined') return;
   
   // إنشاء توزيع البطاقات حسب عدد مرات التجديد
   const renewalCounts = {
       '0': 0,
       '1': 0,
       '2': 0,
       '3+': 0
   };
   
   cards.forEach(card => {
       const renewalCount = card.renewalCount || 0;
       if (renewalCount >= 3) {
           renewalCounts['3+']++;
       } else {
           renewalCounts[renewalCount.toString()]++;
       }
   });
   
   // تحضير البيانات
   const data = {
       labels: ['لم تجدد', 'مرة واحدة', 'مرتين', '3+ مرات'],
       datasets: [{
           label: 'عدد البطاقات',
           data: [renewalCounts['0'], renewalCounts['1'], renewalCounts['2'], renewalCounts['3+']],
           backgroundColor: [
               'rgba(52, 152, 219, 0.6)',
               'rgba(46, 204, 113, 0.6)',
               'rgba(155, 89, 182, 0.6)',
               'rgba(243, 156, 18, 0.6)'
           ],
           borderColor: [
               'rgba(52, 152, 219, 1)',
               'rgba(46, 204, 113, 1)',
               'rgba(155, 89, 182, 1)',
               'rgba(243, 156, 18, 1)'
           ],
           borderWidth: 1
       }]
   };
   
   // إنشاء الرسم البياني
   const ctx = canvas.getContext('2d');
   chartInstances.cardsRenewals = new Chart(ctx, {
       type: 'bar',
       data: data,
       options: {
           responsive: true,
           maintainAspectRatio: false,
           scales: {
               y: {
                   beginAtZero: true,
                   title: {
                       display: true,
                       text: 'عدد البطاقات',
                       font: {
                           family: 'Tajawal, sans-serif'
                       }
                   }
               },
               x: {
                   title: {
                       display: true,
                       text: 'عدد مرات التجديد',
                       font: {
                           family: 'Tajawal, sans-serif'
                       }
                   }
               }
           },
           plugins: {
               legend: {
                   display: false
               }
           }
       }
   });
}

/**
* تصدير الإحصائيات
*/
function exportStatistics() {
   // إنشاء كائن الإحصائيات
   const stats = {
       date: new Date().toISOString(),
       summary: {
           totalCards: cards.length,
           activeCards: cards.filter(card => card.status === 'active' && new Date(card.expiryDate) >= new Date()).length,
           expiredCards: cards.filter(card => card.status === 'active' && new Date(card.expiryDate) < new Date()).length,
           deactivatedCards: cards.filter(card => card.status === 'inactive').length
       },
       cardTypes: {
           platinum: cards.filter(card => card.cardType === 'platinum').length,
           gold: cards.filter(card => card.cardType === 'gold').length,
           premium: cards.filter(card => card.cardType === 'premium').length,
           diamond: cards.filter(card => card.cardType === 'diamond').length,
           islamic: cards.filter(card => card.cardType === 'islamic').length,
           custom: cards.filter(card => card.cardType === 'custom').length
       },
       renewals: {
           noRenewal: cards.filter(card => !card.renewalCount || card.renewalCount === 0).length,
           oneRenewal: cards.filter(card => card.renewalCount === 1).length,
           twoRenewals: cards.filter(card => card.renewalCount === 2).length,
           threeOrMoreRenewals: cards.filter(card => card.renewalCount >= 3).length
       }
   };
   
   // تحويل الإحصائيات إلى نص JSON
   const statsJson = JSON.stringify(stats, null, 2);
   
   // إنشاء ملف للتنزيل
   const blob = new Blob([statsJson], { type: 'application/json' });
   const url = URL.createObjectURL(blob);
   
   // إنشاء رابط التنزيل وتفعيله
   const link = document.createElement('a');
   link.href = url;
   link.download = `card_statistics_${new Date().toISOString().split('T')[0]}.json`;
   link.click();
   
   // تنظيف الذاكرة
   URL.revokeObjectURL(url);
   
   showNotification('تم تصدير الإحصائيات بنجاح', 'success');
}

// ========================== سجل الأنشطة ==========================
/**
* عرض سجل الأنشطة
* @param {string} typeFilter نوع النشاط للتصفية
* @param {string} searchTerm نص البحث
*/
function renderActivities(typeFilter = 'all', searchTerm = '') {
   console.log(`عرض سجل الأنشطة: نوع: ${typeFilter}, بحث: ${searchTerm}`);
   
   const container = document.getElementById('activities-container');
   if (!container) return;
   
   // تطبيق الفلترة
   let filteredActivities = [...activities];
   
   if (typeFilter !== 'all') {
       filteredActivities = filteredActivities.filter(activity => activity.type === typeFilter);
   }
   
   if (searchTerm) {
       filteredActivities = filteredActivities.filter(activity => {
           // البحث في كل الحقول
           return (
               (activity.details && activity.details.toLowerCase().includes(searchTerm)) ||
               (activity.investorId && activity.investorId.toLowerCase().includes(searchTerm)) ||
               (activity.cardId && activity.cardId.toLowerCase().includes(searchTerm)) ||
               (activity.user && activity.user.toLowerCase().includes(searchTerm))
           );
       });
   }
   
   // التحقق من وجود أنشطة
   if (filteredActivities.length === 0) {
       container.innerHTML = '<div class="text-center">لا توجد أنشطة للعرض</div>';
       return;
   }
   
   // إنشاء HTML لعرض الأنشطة
   let html = '';
   
   filteredActivities.forEach(activity => {
       // الحصول على البطاقة والمستثمر
       const card = cards.find(c => c.id === activity.cardId);
       const investor = investors.find(i => i.id === activity.investorId);
       
       // تحديد أيقونة النشاط
       let icon = 'fas fa-info-circle';
       let iconClass = 'info';
       
       switch (activity.type) {
           case 'create':
               icon = 'fas fa-plus-circle';
               iconClass = 'create';
               break;
           case 'edit':
               icon = 'fas fa-edit';
               iconClass = 'edit';
               break;
           case 'deactivate':
               icon = 'fas fa-times-circle';
               iconClass = 'deactivate';
               break;
           case 'activate':
               icon = 'fas fa-check-circle';
               iconClass = 'activate';
               break;
           case 'renew':
               icon = 'fas fa-sync-alt';
               iconClass = 'renew';
               break;
           case 'scan':
               icon = 'fas fa-qrcode';
               iconClass = 'scan';
               break;
           case 'print':
               icon = 'fas fa-print';
               iconClass = 'edit';
               break;
           case 'share':
               icon = 'fas fa-share-alt';
               iconClass = 'edit';
               break;
           case 'view':
               icon = 'fas fa-eye';
               iconClass = 'info';
               break;
       }
       
       // تنسيق التاريخ
       const date = new Date(activity.timestamp);
       const formattedDate = formatDate(activity.timestamp);
       const timeAgo = getTimeAgo(date);
       
       // إنشاء عنصر النشاط
       html += `
           <div class="activity-item" data-activity-id="${activity.id}">
               <div class="activity-icon ${iconClass}">
                   <i class="${icon}"></i>
               </div>
               <div class="activity-content">
                   <div class="activity-title">
                       ${activity.details}
                       ${card ? ` - ${card.investorName}` : ''}
                   </div>
                   <div class="activity-details">
                       بواسطة: ${activity.user || 'مستخدم غير معروف'}
                   </div>
               </div>
               <div class="activity-time" title="${formattedDate}">
                   ${timeAgo}
               </div>
           </div>
       `;
   });
   
   // تحديث المحتوى
   container.innerHTML = html;
}

/**
* تصدير سجل الأنشطة
*/
function exportActivities() {
   // تحويل الأنشطة إلى نص CSV
   let csv = 'المعرف,التاريخ,النوع,معرف البطاقة,معرف المستثمر,التفاصيل,المستخدم\n';
   
   activities.forEach(activity => {
       csv += `"${activity.id}","${activity.timestamp}","${activity.type}","${activity.cardId}","${activity.investorId}","${activity.details}","${activity.user}"\n`;
   });
   
   // إنشاء ملف للتنزيل
   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
   const url = URL.createObjectURL(blob);
   
   // إنشاء رابط التنزيل وتفعيله
   const link = document.createElement('a');
   link.href = url;
   link.setAttribute('download', `activities_log_${new Date().toISOString().split('T')[0]}.csv`);
   link.click();
   
   // تنظيف الذاكرة
   URL.revokeObjectURL(url);
   
   showNotification('تم تصدير سجل الأنشطة بنجاح', 'success');
}

/**
* عرض أنشطة البطاقة
* @param {string} cardId معرف البطاقة
* @param {HTMLElement} container حاوية العرض
*/
function renderCardActivities(cardId, container) {
   if (!container) return;
   
   // البحث عن أنشطة البطاقة
   const cardActivities = activities.filter(activity => activity.cardId === cardId);
   
   if (cardActivities.length === 0) {
       container.innerHTML = '<div class="text-center">لا توجد أنشطة لهذه البطاقة</div>';
       return;
   }
   
   // ترتيب الأنشطة (الأحدث أولاً)
   cardActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
   
   // إنشاء HTML
   let html = '<div class="activity-list">';
   
   cardActivities.forEach(activity => {
       // تحديد أيقونة النشاط
       let icon = 'fas fa-info-circle';
       let iconClass = 'info';
       
       switch (activity.type) {
           case 'create':
               icon = 'fas fa-plus-circle';
               iconClass = 'create';
               break;
           case 'edit':
               icon = 'fas fa-edit';
               iconClass = 'edit';
               break;
           case 'deactivate':
               icon = 'fas fa-times-circle';
               iconClass = 'deactivate';
               break;
           case 'activate':
               icon = 'fas fa-check-circle';
               iconClass = 'activate';
               break;
           case 'renew':
               icon = 'fas fa-sync-alt';
               iconClass = 'renew';
               break;
           case 'scan':
               icon = 'fas fa-qrcode';
               iconClass = 'scan';
               break;
           case 'print':
               icon = 'fas fa-print';
               iconClass = 'edit';
               break;
           case 'share':
               icon = 'fas fa-share-alt';
               iconClass = 'edit';
               break;
           case 'view':
               icon = 'fas fa-eye';
               iconClass = 'info';
               break;
       }
       
       // تنسيق التاريخ
       const date = new Date(activity.timestamp);
       const formattedDate = formatDate(activity.timestamp);
       const timeAgo = getTimeAgo(date);
       
       html += `
           <div class="activity-item">
               <div class="activity-icon ${iconClass}">
                   <i class="${icon}"></i>
               </div>
               <div class="activity-content">
                   <div class="activity-title">${activity.details}</div>
                   <div class="activity-details">بواسطة: ${activity.user || 'مستخدم غير معروف'}</div>
               </div>
               <div class="activity-time" title="${formattedDate}">${timeAgo}</div>
           </div>
       `;
   });
   
   html += '</div>';
   
   // تحديث المحتوى
   container.innerHTML = html;
}

// ========================== الإعدادات ==========================
/**
* تحميل الإعدادات إلى النموذج
*/
function loadSettingsToForm() {
   // التأكد من وجود نموذج الإعدادات
   const defaultCardType = document.getElementById('default-card-type');
   const defaultExpiryMonths = document.getElementById('default-expiry-months');
   const darkModeToggle = document.getElementById('dark-mode-toggle');
   const enableNotifications = document.getElementById('enable-notifications');
   const enableSounds = document.getElementById('enable-sounds');
   const autoBackup = document.getElementById('auto-backup');
   const backupFrequency = document.getElementById('backup-frequency');
   const securityLevel = document.getElementById('security-level');
   const enableCardPasswords = document.getElementById('enable-card-passwords');
   
   if (defaultCardType) defaultCardType.value = settings.defaultCardType;
   if (defaultExpiryMonths) defaultExpiryMonths.value = settings.defaultExpiryMonths;
   if (darkModeToggle) darkModeToggle.checked = settings.darkMode;
   if (enableNotifications) enableNotifications.checked = settings.enableNotifications;
   if (enableSounds) enableSounds.checked = settings.enableSounds;
   if (autoBackup) autoBackup.checked = settings.autoBackup;
   if (backupFrequency) backupFrequency.value = settings.backupFrequency;
   if (securityLevel) securityLevel.value = settings.securityLevel;
   if (enableCardPasswords) enableCardPasswords.checked = settings.enableCardPasswords;
}

/**
* حفظ الإعدادات من النموذج
*/
function saveSettingsFromForm() {
   // التأكد من وجود نموذج الإعدادات
   const defaultCardType = document.getElementById('default-card-type');
   const defaultExpiryMonths = document.getElementById('default-expiry-months');
   const darkModeToggle = document.getElementById('dark-mode-toggle');
   const enableNotifications = document.getElementById('enable-notifications');
   const enableSounds = document.getElementById('enable-sounds');
   const autoBackup = document.getElementById('auto-backup');
   const backupFrequency = document.getElementById('backup-frequency');
   const securityLevel = document.getElementById('security-level');
   const enableCardPasswords = document.getElementById('enable-card-passwords');
   
   // تحديث الإعدادات
   if (defaultCardType) settings.defaultCardType = defaultCardType.value;
   if (defaultExpiryMonths) settings.defaultExpiryMonths = parseInt(defaultExpiryMonths.value) || 12;
   if (darkModeToggle) settings.darkMode = darkModeToggle.checked;
   if (enableNotifications) settings.enableNotifications = enableNotifications.checked;
   if (enableSounds) settings.enableSounds = enableSounds.checked;
   if (autoBackup) settings.autoBackup = autoBackup.checked;
   if (backupFrequency) settings.backupFrequency = backupFrequency.value;
   if (securityLevel) settings.securityLevel = securityLevel.value;
   if (enableCardPasswords) settings.enableCardPasswords = enableCardPasswords.checked;
   
   // حفظ الإعدادات
   saveSettings();
   
   // تطبيق وضع الألوان
   applyColorMode();
   
   return true;
}

/**
* إنشاء نسخة احتياطية
*/
function createBackup() {
   // إنشاء كائن النسخة الاحتياطية
   const backup = {
       date: new Date().toISOString(),
       version: '2.0',
       settings: settings,
       cards: cards,
       activities: activities
   };
   
   // تحويل النسخة إلى نص JSON
   const backupJson = JSON.stringify(backup, null, 2);
   
   // إنشاء ملف للتنزيل
   const blob = new Blob([backupJson], { type: 'application/json' });
   const url = URL.createObjectURL(blob);
   
   // إنشاء رابط التنزيل وتفعيله
   const link = document.createElement('a');
   link.href = url;
   link.download = `card_system_backup_${new Date().toISOString().split('T')[0]}.json`;
   link.click();
   
   // تنظيف الذاكرة
   URL.revokeObjectURL(url);
   
   // إضافة نشاط
   const backupActivity = {
       id: Date.now().toString(),
       type: 'backup',
       cardId: '',
       investorId: '',
       details: 'تم إنشاء نسخة احتياطية للنظام',
       timestamp: new Date().toISOString(),
       user: isAuthenticated ? currentUser.email : 'مستخدم محلي'
   };
   
   activities.push(backupActivity);
   saveActivities();
   
   showNotification('تم إنشاء نسخة احتياطية بنجاح', 'success');
}

/**
* استعادة من نسخة احتياطية
* @param {string} backupData بيانات النسخة الاحتياطية
*/
function restoreBackup(backupData) {
   try {
       // تحليل بيانات النسخة الاحتياطية
       const backup = JSON.parse(backupData);
       
       // التحقق من صحة البيانات
       if (!backup.cards || !backup.settings || !backup.version) {
           throw new Error('بيانات النسخة الاحتياطية غير صالحة');
       }
       
       // طلب تأكيد
       if (!confirm('سيتم استبدال جميع البيانات الحالية بالنسخة الاحتياطية. هل أنت متأكد من المتابعة؟')) {
           return;
       }
       
       // استعادة البيانات
       cards = backup.cards;
       settings = backup.settings;
       
       // استعادة الأنشطة إذا كانت موجودة
       if (backup.activities) {
           activities = backup.activities;
       }
       
       // حفظ البيانات المستعادة
       saveCards();
       saveSettings();
       saveActivities();
       
       // إضافة نشاط الاستعادة
       const restoreActivity = {
           id: Date.now().toString(),
           type: 'restore',
           cardId: '',
           investorId: '',
           details: 'تم استعادة النظام من نسخة احتياطية',
           timestamp: new Date().toISOString(),
           user: isAuthenticated ? currentUser.email : 'مستخدم محلي'
       };
       
       activities.push(restoreActivity);
       saveActivities();
       
       // تطبيق الإعدادات المستعادة
       applyColorMode();
       
       // إعادة تحميل الصفحة
       showNotification('تم استعادة النسخة الاحتياطية بنجاح', 'success');
       setTimeout(() => {
           location.reload();
       }, 1500);
   } catch (error) {
       console.error('خطأ في استعادة النسخة الاحتياطية:', error);
       showNotification('فشل في استعادة النسخة الاحتياطية: ' + error.message, 'error');
   }
}

/**
* إعادة ضبط النظام
*/
function resetSystem() {
   // طلب تأكيد
   if (!confirm('سيتم حذف جميع البطاقات والإعدادات والأنشطة. هل أنت متأكد من إعادة ضبط النظام؟')) {
       return;
   }
   
   // طلب تأكيد إضافي
   if (!confirm('هذه العملية لا يمكن التراجع عنها. هل ترغب بالمتابعة؟')) {
       return;
   }
   
   // إعادة تعيين البيانات
   cards = [];
   activities = [];
   settings = {
       defaultCardType: 'platinum',
       defaultExpiryMonths: 12,
       enableNotifications: true,
       enableSounds: true,
       darkMode: false,
       autoBackup: true,
       backupFrequency: 'weekly',
       securityLevel: 'medium',
       enableCardPasswords: false,
       cardStyles: {
           platinum: {
               backgroundColor: '#101a2c',
               textColor: '#ffffff',
               brandColor: '#ffffff'
           },
           gold: {
               backgroundColor: '#85754e',
               textColor: '#ffffff',
               brandColor: '#ffd700'
           },
           premium: {
               backgroundColor: '#1c1c1c',
               textColor: '#ffffff',
               brandColor: '#ff4500'
           },
           diamond: {
               backgroundColor: '#40e0d0',
               textColor: '#000000',
               brandColor: '#000000'
           },
           islamic: {
               backgroundColor: '#006400',
               textColor: '#ffffff',
               brandColor: '#ffd700'
           },
           custom: {
               backgroundColor: '#2c3e50',
               textColor: '#ffffff',
               brandColor: '#3498db'
           }
       }
   };
   
   // حفظ الإعدادات الافتراضية
   saveSettings();
   saveCards();
   saveActivities();
   
   // تطبيق وضع الألوان
   applyColorMode();
   
   // إعادة تحميل الصفحة
   showNotification('تم إعادة ضبط النظام بنجاح', 'success');
   setTimeout(() => {
       location.reload();
   }, 1500);
}

// ========================== وظائف مساعدة ==========================
/**
* حساب الربح الشهري للمستثمر
* @param {string} investorId معرف المستثمر
* @returns {number} مبلغ الربح
*/
function calculateInvestorProfit(investorId) {
   // البحث عن المستثمر
   const investor = investors.find(inv => inv.id === investorId);
   if (!investor) return 0;
   
   // حساب الربح الشهري بناءً على البيانات الموجودة في التطبيق الرئيسي
   // إذا كانت دالة calculateMonthlyProfits موجودة، نستخدمها
   if (typeof window.calculateMonthlyProfits === 'function') {
       return window.calculateMonthlyProfits(investorId);
   }
   
   // وإلا نحاول حساب الربح بناءً على البيانات المتاحة
   let totalProfit = 0;
   
   if (investor.investments && Array.isArray(investor.investments)) {
       investor.investments.forEach(investment => {
           // حساب الربح بناءً على نسبة الفائدة في الإعدادات
           const interestRate = window.settings ? window.settings.interestRate / 100 : 0.175; // نسبة افتراضية 17.5%
           totalProfit += investment.amount * interestRate;
       });
   } else if (investor.amount) {
       // إذا لم تكن هناك استثمارات محددة، نستخدم المبلغ الإجمالي
       const interestRate = window.settings ? window.settings.interestRate / 100 : 0.175;
       totalProfit = investor.amount * interestRate;
   }
   
   return totalProfit;
}

/**
* الحصول على اسم نوع البطاقة (الإنجليزي)
* @param {string} cardType نوع البطاقة
* @returns {string} اسم نوع البطاقة
*/
function getCardTypeName(cardType) {
   switch (cardType) {
       case 'platinum':
           return 'PLATINUM';
       case 'gold':
           return 'GOLD';
       case 'premium':
           return 'PREMIUM';
       case 'diamond':
           return 'DIAMOND';
       case 'islamic':
           return 'ISLAMIC';
       case 'custom':
           return 'CUSTOM';
       default:
           return 'CARD';
   }
}

/**
* الحصول على اسم نوع البطاقة (العربي)
* @param {string} cardType نوع البطاقة
* @returns {string} اسم نوع البطاقة
*/
function getCardTypeArabicName(cardType) {
   switch (cardType) {
       case 'platinum':
           return 'بلاتينية';
       case 'gold':
           return 'ذهبية';
       case 'premium':
           return 'بريميوم';
       case 'diamond':
           return 'ماسية';
       case 'islamic':
           return 'إسلامية';
       case 'custom':
           return 'مخصصة';
       default:
           return 'بطاقة';
   }
}

/**
* الحصول على اسم نوع العملية (العربي)
* @param {string} transactionType نوع العملية
* @returns {string} اسم نوع العملية
*/
function getTransactionTypeArabicName(transactionType) {
   switch (transactionType) {
       case 'deposit':
           return 'إيداع';
       case 'withdraw':
           return 'سحب';
       case 'profit':
           return 'أرباح';
       case 'transfer':
           return 'تحويل';
       default:
           return transactionType;
   }
}

/**
* تنسيق التاريخ
* @param {string|Date} date التاريخ
* @returns {string} التاريخ المنسق
*/
function formatDate(date) {
   if (!date) return '-';
   
   const d = new Date(date);
   if (isNaN(d.getTime())) return '-';
   
   return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

/**
* تنسيق المبلغ
* @param {number} amount المبلغ
* @returns {string} المبلغ المنسق
*/
function formatCurrency(amount) {
   if (typeof amount !== 'number') return '-';
   
   return `${amount.toLocaleString()} دينار`;
}

/**
* الحصول على الوقت المنقضي
* @param {Date} date التاريخ
* @returns {string} الوقت المنقضي
*/
function getTimeAgo(date) {
   if (!date) return '';
   
   const now = new Date();
   const diff = now.getTime() - date.getTime();
   
   // تحويل الفرق إلى ثواني
   const seconds = Math.floor(diff / 1000);
   
   if (seconds < 60) {
       return 'منذ أقل من دقيقة';
   }
   
   // تحويل إلى دقائق
   const minutes = Math.floor(seconds / 60);
   
   if (minutes < 60) {
       return `منذ ${minutes} دقيقة`;
   }
   
   // تحويل إلى ساعات
   const hours = Math.floor(minutes / 60);
   
   if (hours < 24) {
       return `منذ ${hours} ساعة`;
   }
   
   // تحويل إلى أيام
   const days = Math.floor(hours / 24);
   
   if (days < 30) {
       return `منذ ${days} يوم`;
   }
   
   // تحويل إلى شهور
   const months = Math.floor(days / 30);
   
   if (months < 12) {
       return `منذ ${months} شهر`;
   }
   
   // تحويل إلى سنوات
   const years = Math.floor(months / 12);
   
   return `منذ ${years} سنة`;
}

/**
* عرض إشعار
* @param {string} message نص الإشعار
* @param {string} type نوع الإشعار: success, error, warning, info
*/
function showNotification(message, type = 'info') {
   // التحقق من تفعيل الإشعارات
   if (!settings.enableNotifications) return;
   
   // البحث عن دالة إشعارات موجودة في التطبيق الرئيسي
   if (typeof window.showNotification === 'function') {
       window.showNotification(message, type);
       return;
   }
   
   // إنشاء عنصر الإشعار
   const notification = document.createElement('div');
   notification.className = `notification notification-${type}`;
   notification.style.position = 'fixed';
   notification.style.bottom = '20px';
   notification.style.left = '20px';
   notification.style.padding = '15px 20px';
   notification.style.borderRadius = '6px';
   notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
   notification.style.zIndex = '9999';
   notification.style.minWidth = '200px';
   notification.style.maxWidth = '400px';
   notification.style.direction = 'rtl';
   notification.style.textAlign = 'right';
   notification.style.transform = 'translateY(100px)';
   notification.style.opacity = '0';
   notification.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
   
   // تحديد لون الإشعار حسب النوع
   switch (type) {
       case 'success':
           notification.style.backgroundColor = '#2ecc71';
           notification.style.color = 'white';
           break;
       case 'error':
           notification.style.backgroundColor = '#e74c3c';
           notification.style.color = 'white';
           break;
       case 'warning':
           notification.style.backgroundColor = '#f39c12';
           notification.style.color = 'white';
           break;
       case 'info':
       default:
           notification.style.backgroundColor = '#3498db';
           notification.style.color = 'white';
           break;
   }
   
   // إنشاء محتوى الإشعار
   notification.innerHTML = `
       <div style="display: flex; align-items: center;">
           <div style="margin-left: 10px;">
               <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
           </div>
           <div>${message}</div>
       </div>
   `;
   
   // إضافة الإشعار إلى الصفحة
   document.body.appendChild(notification);
   
   // تشغيل صوت الإشعار إذا كان مفعلاً
   if (settings.enableSounds) {
       if (type === 'success') {
           playSuccessSound();
       } else if (type === 'error') {
           playErrorSound();
       }
   }
   
   // إظهار الإشعار
   setTimeout(() => {
       notification.style.transform = 'translateY(0)';
       notification.style.opacity = '1';
   }, 10);
   
   // إخفاء الإشعار بعد 5 ثواني
   setTimeout(() => {
       notification.style.transform = 'translateY(100px)';
       notification.style.opacity = '0';
       
       // إزالة الإشعار بعد انتهاء التأثير
       setTimeout(() => {
           notification.remove();
       }, 300);
   }, 5000);
}

// ========================== إظهار صفحة البطاقات ==========================
/**
* إظهار صفحة بطاقات المستثمرين
*/
function showCardPage() {
   console.log('إظهار صفحة بطاقات المستثمرين...');
   
   // إخفاء جميع الصفحات
   document.querySelectorAll('.page').forEach(page => {
       page.classList.remove('active');
   });
   
   // إظهار صفحة البطاقات
   const cardsPage = document.getElementById('investor-cards-page');
   if (cardsPage) {
       cardsPage.classList.add('active');
       
       // تحديث عرض البطاقات
       renderCards('all');
   }
}

// ========================== تصدير واجهة برمجة التطبيق العامة ==========================
// تصدير واجهة برمجة التطبيق العامة
return {
   initialize,
   renderCards,
   showCardDetails,
   printCard,
   createCard,
   showCardPage
};
