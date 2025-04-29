/**
 * نظام بطاقات المستثمرين - Investor Card System (النسخة المحدثة)
 * 
 * يتيح إنشاء وإدارة بطاقات للمستثمرين في نظام الاستثمار المتكامل
 * البطاقات تشبه بطاقات الماستر كارد وتعمل عن طريق الباركود
 * النسخة المحدثة: تم نقل خيارات البطاقات إلى القائمة الجانبية الرئيسية
 */

// كائن نظام بطاقات المستثمرين
const InvestorCardSystem = (function() {
    // متغيرات النظام
    let initialized = false;
    let investors = [];
    let cards = [];
    let databaseRef = null;
    let currentView = 'all-cards'; // نوع العرض الحالي
    
    // تهيئة النظام
    function initialize() {
        console.log('تهيئة نظام بطاقات المستثمرين...');
        
        if (initialized) {
            console.log('نظام البطاقات مهيأ بالفعل');
            return Promise.resolve(true);
        }
        
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
                console.log('تم تهيئة نظام بطاقات المستثمرين بنجاح');
                return true;
            })
            .catch(error => {
                console.error('خطأ في تهيئة نظام بطاقات المستثمرين:', error);
                return false;
            });
    }
    
    // إضافة أنماط CSS للبطاقات
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
            /* أنماط صفحة البطاقات */
            #investor-cards-page, #active-cards-page, #expired-cards-page, #barcode-scanner-page, #card-details-page {
                padding: 20px;
                direction: rtl;
            }
            
            .card-content-area {
                background-color: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                overflow-y: auto;
            }
            
            /* أنماط نموذج إنشاء البطاقة */
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
            
            .card-type-options {
                display: flex;
                gap: 15px;
                margin-top: 10px;
            }
            
            .card-type-option {
                display: flex;
                align-items: center;
                cursor: pointer;
            }
            
            .card-type-option input {
                margin-left: 8px;
            }
            
            .card-form-actions {
                margin-top: 30px;
                display: flex;
                justify-content: flex-end;
            }
            
            /* أنماط البطاقة */
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
                transition: transform 0.3s ease;
            }
            
            .investor-card:hover {
                transform: translateY(-5px);
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
            
            /* أنماط قائمة البطاقات */
            .cards-collection {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-top: 20px;
                justify-content: center;
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
                transition: transform 0.3s ease;
                overflow: hidden;
                margin-bottom: 20px;
            }
            
            .card-preview:hover {
                transform: translateY(-3px);
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
            
            /* أنماط لتعديل البطاقة */
            .card-options {
                display: flex;
                justify-content: space-around;
                margin: 20px 0;
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
            }
            
            .card-option-btn:hover {
                background-color: #e9ecef;
            }
            
            .card-option-btn.primary {
                background-color: #3498db;
                color: white;
                border-color: #3498db;
            }
            
            .card-option-btn.primary:hover {
                background-color: #2980b9;
            }
            
            .card-option-btn.danger {
                background-color: #e74c3c;
                color: white;
                border-color: #e74c3c;
            }
            
            .card-option-btn.danger:hover {
                background-color: #c0392b;
            }
            
            /* أنماط تفاصيل المستثمر */
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
            
            /* أنماط لقارئ الباركود */
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
                margin-top: 15px;
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
            
            /* أنماط المعلومات */
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
            
            /* أنماط للنوافذ المنبثقة */
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
            
            /* كلاسات مساعدة */
            .text-center {
                text-align: center;
            }
            
            .mb-20 {
                margin-bottom: 20px;
            }
            
            .hidden {
                display: none !important;
            }
            
            /* أنماط زر الإضافة العائم */
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
                transition: background-color 0.3s ease, transform 0.3s ease;
                z-index: 100;
            }
            
            .add-card-fab:hover {
                background-color: #2980b9;
                transform: translateY(-3px);
            }
            
            .add-card-fab i {
                font-size: 24px;
            }
        `;
        
        // إضافة العنصر إلى head
        document.head.appendChild(styleElement);
        
        console.log('تم إضافة أنماط CSS للبطاقات');
    }
    
    // إنشاء صفحات البطاقات المختلفة
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
        
        console.log('تم إنشاء صفحات بطاقات المستثمرين');
    }
    
    // إنشاء صفحة كل البطاقات
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
    
    // إنشاء صفحة البطاقات النشطة
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
    
    // إنشاء صفحة البطاقات المنتهية
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
                    <button class="btn btn-primary" id="create-card-btn-expired">
                        <i class="fas fa-plus"></i>
                        <span>إنشاء بطاقة جديدة</span>
                    </button>
                </div>
            </div>
            
            <div class="card-content-area">
                <div class="info-message">
                    <div class="info-title">البطاقات المنتهية</div>
                    <div class="info-text">عرض البطاقات التي انتهت صلاحيتها وتحتاج إلى تجديد.</div>
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
    
    // إنشاء صفحة مسح الباركود
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
                    
                    <div class="scanner-controls">
                        <button class="btn btn-primary" id="start-scanner">بدء المسح</button>
                        <button class="btn btn-outline" id="stop-scanner" disabled>إيقاف المسح</button>
                    </div>
                    
                    <div class="scan-result hidden" id="scan-result">
                        <div class="scan-result-title">نتيجة المسح:</div>
                        <div class="scan-result-data" id="scan-result-data"></div>
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
    
    // إنشاء صفحة تفاصيل البطاقة
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
                    <button class="card-option-btn primary" id="edit-card-btn">
                        <i class="fas fa-edit"></i>
                        <span>تعديل البطاقة</span>
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
    
    // إنشاء صفحة إنشاء بطاقة جديدة
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
                                <label class="card-type-option">
                                    <input type="radio" name="card-type" value="platinum" checked>
                                    <span>بلاتينية</span>
                                </label>
                                <label class="card-type-option">
                                    <input type="radio" name="card-type" value="gold">
                                    <span>ذهبية</span>
                                </label>
                                <label class="card-type-option">
                                    <input type="radio" name="card-type" value="premium">
                                    <span>بريميوم</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="card-form-group">
                            <label class="card-form-label">تاريخ الإنتهاء</label>
                            <input type="date" class="card-form-input" id="expiry-date" required>
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
    
    // إضافة أزرار في القائمة الجانبية
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
        
        console.log('تم إضافة أزرار بطاقات المستثمرين إلى القائمة الجانبية');
    }
    
    // إضافة عنصر إلى القائمة الجانبية
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
            const targetPage = document.getElementById(`${pageId}-page`);
            if (targetPage) {
                targetPage.classList.add('active');
                
                // تحديث العرض حسب الصفحة
                switch (pageId) {
                    case 'investor-cards':
                        currentView = 'all';
                        renderCards('all');
                        break;
                    case 'active-cards':
                        currentView = 'active';
                        renderCards('active');
                        break;
                    case 'expired-cards':
                        currentView = 'expired';
                        renderCards('expired');
                        break;
                    case 'barcode-scanner':
                        currentView = 'scanner';
                        initBarcodeScanner();
                        break;
                    case 'new-card':
                        currentView = 'new';
                        updateInvestorSelect();
                        break;
                }
            }
        });
        
        // إضافة الرابط إلى عنصر القائمة
        navItem.appendChild(navLink);
        
        // إضافة عنصر القائمة إلى القائمة
        navList.appendChild(navItem);
    }
    
    // تهيئة مستمعي الأحداث
    function initEventListeners() {
        console.log('تهيئة مستمعي الأحداث لنظام البطاقات...');
        
        // مستمع لزر إنشاء بطاقة جديدة
        document.querySelectorAll('#create-card-btn, #create-card-btn-active, #create-card-btn-expired, #add-card-fab, #add-card-fab-active').forEach(btn => {
            if (btn) {
                btn.addEventListener('click', function() {
                    // تحديث قائمة المستثمرين
                    updateInvestorSelect();
                    
                    // التنقل إلى صفحة إنشاء بطاقة جديدة
                    const newCardLink = document.querySelector('a.nav-link[data-page="new-card"]');
                    if (newCardLink) {
                        newCardLink.click();
                    }
                });
            }
        });
        
        // مستمع لتغيير اختيار المستثمر
        const investorSelect = document.getElementById('investor-select');
        if (investorSelect) {
            investorSelect.addEventListener('change', function() {
                const selectedInvestorId = this.value;
                if (selectedInvestorId) {
                    // البحث عن المستثمر
                    const investor = investors.find(inv => inv.id === selectedInvestorId);
                    if (investor) {
                        // تعبئة بيانات المستثمر
                        document.getElementById('investor-phone').value = investor.phone || '';
                    }
                } else {
                    // مسح حقول المستثمر
                    document.getElementById('investor-phone').value = '';
                }
            });
        }
        
        // مستمع لزر إلغاء إنشاء البطاقة
        const cancelCreateCardBtn = document.getElementById('cancel-create-card');
        if (cancelCreateCardBtn) {
            cancelCreateCardBtn.addEventListener('click', function() {
                // العودة إلى صفحة كل البطاقات
                const allCardsLink = document.querySelector('a.nav-link[data-page="investor-cards"]');
                if (allCardsLink) {
                    allCardsLink.click();
                }
                
                // إعادة تعيين نموذج إنشاء البطاقة
                document.getElementById('create-card-form').reset();
            });
        }
        
        // مستمع لزر العودة إلى البطاقات
        document.querySelectorAll('#back-to-cards, #back-to-cards-from-new').forEach(btn => {
            if (btn) {
                btn.addEventListener('click', function() {
                    // العودة إلى صفحة كل البطاقات
                    const allCardsLink = document.querySelector('a.nav-link[data-page="investor-cards"]');
                    if (allCardsLink) {
                        allCardsLink.click();
                    }
                });
            }
        });
        
        // مستمع لإرسال نموذج إنشاء البطاقة
        const createCardForm = document.getElementById('create-card-form');
        if (createCardForm) {
            createCardForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // الحصول على بيانات النموذج
                const investorId = document.getElementById('investor-select').value;
                const cardType = document.querySelector('input[name="card-type"]:checked').value;
                const expiryDate = document.getElementById('expiry-date').value;
                
                if (!investorId || !cardType || !expiryDate) {
                    alert('يرجى ملء جميع الحقول المطلوبة');
                    return;
                }
                
                // إنشاء البطاقة
                createCard(investorId, cardType, expiryDate);
            });
        }
        
        // مستمعات أحداث لأزرار الماسح الضوئي
        const startScannerBtn = document.getElementById('start-scanner');
        if (startScannerBtn) {
            startScannerBtn.addEventListener('click', function() {
                startBarcodeScanner();
            });
        }
        
        const stopScannerBtn = document.getElementById('stop-scanner');
        if (stopScannerBtn) {
            stopScannerBtn.addEventListener('click', function() {
                stopBarcodeScanner();
            });
        }
        
        // مستمع لأزرار عرض تفاصيل البطاقة
        document.addEventListener('click', function(e) {
            const cardPreview = e.target.closest('.card-preview');
            if (cardPreview) {
                const cardId = cardPreview.getAttribute('data-card-id');
                if (cardId) {
                    showCardDetails(cardId);
                }
            }
        });
        
        // مستمع لزر طباعة البطاقة
        const printCardBtn = document.getElementById('print-card-btn');
        if (printCardBtn) {
            printCardBtn.addEventListener('click', function() {
                printCard();
            });
        }
        
        // مستمع لزر تعديل البطاقة
        const editCardBtn = document.getElementById('edit-card-btn');
        if (editCardBtn) {
            editCardBtn.addEventListener('click', function() {
                editCard();
            });
        }
        
        // مستمع لزر إيقاف البطاقة
        const deactivateCardBtn = document.getElementById('deactivate-card-btn');
        if (deactivateCardBtn) {
            deactivateCardBtn.addEventListener('click', function() {
                deactivateCard();
            });
        }
        
        console.log('تم تهيئة مستمعي الأحداث لنظام البطاقات');
    }
    
    // تهيئة قاعدة البيانات
    function initializeDatabase() {
        console.log('تهيئة الاتصال بقاعدة البيانات...');
        
        return new Promise((resolve, reject) => {
            try {
                // التحقق من وجود Firebase
                if (typeof firebase === 'undefined') {
                    console.error('لم يتم العثور على Firebase');
                    reject(new Error('لم يتم العثور على Firebase'));
                    return;
                }
                
                // التحقق من وجود قاعدة البيانات
                if (!firebase.database) {
                    console.error('لم يتم العثور على Firebase Database');
                    reject(new Error('لم يتم العثور على Firebase Database'));
                    return;
                }
                
                // الحصول على مرجع قاعدة البيانات
                databaseRef = firebase.database();
                
                // التحقق من المستخدم الحالي
                const currentUser = firebase.auth().currentUser;
                if (!currentUser) {
                    console.warn('المستخدم غير مسجل الدخول، سيتم استخدام التخزين المحلي فقط');
                    resolve(true);
                    return;
                }
                
                console.log('تم تهيئة الاتصال بقاعدة البيانات بنجاح');
                resolve(true);
            } catch (error) {
                console.error('خطأ في تهيئة الاتصال بقاعدة البيانات:', error);
                reject(error);
            }
        });
    }
    
    // تحميل البيانات
    function loadData() {
        console.log('تحميل بيانات المستثمرين والبطاقات...');
        
        // تحميل المستثمرين من التخزين المحلي
        try {
            const savedInvestors = localStorage.getItem('investors');
            if (savedInvestors) {
                investors = JSON.parse(savedInvestors);
                console.log(`تم تحميل ${investors.length} مستثمر من التخزين المحلي`);
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات المستثمرين من التخزين المحلي:', error);
        }
        
        // تحميل البطاقات من Firebase إذا كان متاحاً
        if (databaseRef && firebase.auth().currentUser) {
            const userId = firebase.auth().currentUser.uid;
            
            return databaseRef.ref(`users/${userId}/investor_cards`)
                .once('value')
                .then(snapshot => {
                    const cardsData = snapshot.val();
                    if (cardsData) {
                        cards = Object.values(cardsData);
                        console.log(`تم تحميل ${cards.length} بطاقة من قاعدة البيانات`);
                    } else {
                        // إذا لم تكن هناك بطاقات في قاعدة البيانات، نحاول تحميلها من التخزين المحلي
                        loadCardsFromLocalStorage();
                    }
                    
                    return true;
                })
                .catch(error => {
                    console.error('خطأ في تحميل البطاقات من قاعدة البيانات:', error);
                    
                    // في حالة حدوث خطأ، نحاول تحميل البطاقات من التخزين المحلي
                    loadCardsFromLocalStorage();
                    
                    return false;
                });
        } else {
            // إذا لم يكن Firebase متاحاً، نحمل البطاقات من التخزين المحلي
            loadCardsFromLocalStorage();
            return Promise.resolve(true);
        }
    }
    
    // تحميل البطاقات من التخزين المحلي
    function loadCardsFromLocalStorage() {
        try {
            const savedCards = localStorage.getItem('investor_cards');
            if (savedCards) {
                cards = JSON.parse(savedCards);
                console.log(`تم تحميل ${cards.length} بطاقة من التخزين المحلي`);
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات البطاقات من التخزين المحلي:', error);
        }
    }
    
    // حفظ البطاقات
    function saveCards() {
        console.log('حفظ بيانات البطاقات...');
        
        // حفظ في التخزين المحلي
        try {
            localStorage.setItem('investor_cards', JSON.stringify(cards));
            console.log('تم حفظ البطاقات في التخزين المحلي');
        } catch (error) {
            console.error('خطأ في حفظ البطاقات في التخزين المحلي:', error);
        }
        
        // حفظ في Firebase إذا كان متاحاً
        if (databaseRef && firebase.auth().currentUser) {
            const userId = firebase.auth().currentUser.uid;
            
            // تحويل المصفوفة إلى كائن مفهرس
            const cardsObject = {};
            cards.forEach(card => {
                cardsObject[card.id] = card;
            });
            
            return databaseRef.ref(`users/${userId}/investor_cards`)
                .set(cardsObject)
                .then(() => {
                    console.log('تم حفظ البطاقات في قاعدة البيانات');
                    return true;
                })
                .catch(error => {
                    console.error('خطأ في حفظ البطاقات في قاعدة البيانات:', error);
                    return false;
                });
        }
        
        return Promise.resolve(true);
    }
    
    // تحديث قائمة المستثمرين في نموذج إنشاء البطاقة
    function updateInvestorSelect() {
        const select = document.getElementById('investor-select');
        if (!select) return;
        
        // مسح الخيارات الحالية
        select.innerHTML = '<option value="">اختر المستثمر</option>';
        
        // إضافة خيارات المستثمرين
        investors.forEach(investor => {
            // التحقق مما إذا كان للمستثمر بطاقة بالفعل
            const hasCard = cards.some(card => card.investorId === investor.id && card.status === 'active');
            
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = `${investor.name} (${investor.phone})`;
            
            // تعطيل الخيار إذا كان للمستثمر بطاقة نشطة
            if (hasCard) {
                option.disabled = true;
                option.textContent += ' - لديه بطاقة بالفعل';
            }
            
            select.appendChild(option);
        });
    }
    
    // إنشاء بطاقة جديدة
    function createCard(investorId, cardType, expiryDate) {
        console.log(`إنشاء بطاقة جديدة للمستثمر ${investorId} من نوع ${cardType}`);
        
        // البحث عن المستثمر
        const investor = investors.find(inv => inv.id === investorId);
        if (!investor) {
            alert('لم يتم العثور على المستثمر');
            return;
        }
        
        // التحقق مما إذا كان للمستثمر بطاقة نشطة بالفعل
        const existingCard = cards.find(card => card.investorId === investorId && card.status === 'active');
        if (existingCard) {
            alert('هذا المستثمر لديه بطاقة نشطة بالفعل');
            return;
        }
        
        // إنشاء رقم بطاقة فريد
        const cardNumber = generateCardNumber();
        
        // إنشاء كائن البطاقة
        const newCard = {
            id: Date.now().toString(),
            investorId: investorId,
            investorName: investor.name,
            investorPhone: investor.phone,
            cardNumber: cardNumber,
            cardType: cardType,
            expiryDate: expiryDate,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        // إضافة البطاقة إلى المصفوفة
        cards.push(newCard);
        
        // حفظ البطاقات
        saveCards().then(success => {
            if (success) {
                alert('تم إنشاء البطاقة بنجاح');
                
                // إعادة تعيين النموذج
                document.getElementById('create-card-form').reset();
                
                // العودة إلى صفحة كل البطاقات
                const allCardsLink = document.querySelector('a.nav-link[data-page="investor-cards"]');
                if (allCardsLink) {
                    allCardsLink.click();
                }
            } else {
                alert('حدث خطأ أثناء حفظ البطاقة');
            }
        });
    }
    
    // إنشاء رقم بطاقة فريد
    function generateCardNumber() {
        // إنشاء رقم بطاقة عشوائي على غرار ماستر كارد (يبدأ بـ 5)
        const part1 = (Math.floor(Math.random() * 9000) + 1000).toString();
        const part2 = (Math.floor(Math.random() * 9000) + 1000).toString();
        const part3 = (Math.floor(Math.random() * 9000) + 1000).toString();
        const part4 = (Math.floor(Math.random() * 9000) + 1000).toString();
        
        return `5${part1} ${part2} ${part3} ${part4}`;
    }
    
    // عرض البطاقات
    function renderCards(type = 'all') {
        console.log(`عرض البطاقات من نوع: ${type}`);
        
        let containerSelector;
        let filteredCards;
        
        switch (type) {
            case 'active':
                containerSelector = '#active-cards-container';
                filteredCards = cards.filter(card => card.status === 'active' && new Date(card.expiryDate) >= new Date());
                break;
            case 'expired':
                containerSelector = '#expired-cards-container';
                filteredCards = cards.filter(card => card.status === 'inactive' || new Date(card.expiryDate) < new Date());
                break;
            case 'all':
            default:
                containerSelector = '#cards-container';
                filteredCards = [...cards];
                break;
        }
        
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        // مسح المحتوى الحالي
        container.innerHTML = '';
        
        if (filteredCards.length === 0) {
            container.innerHTML = '<div class="text-center">لا توجد بطاقات</div>';
            return;
        }
        
        // إضافة البطاقات
        filteredCards.forEach(card => {
            const isExpired = new Date(card.expiryDate) < new Date();
            const isActive = card.status === 'active';
            
            const cardElement = document.createElement('div');
            cardElement.className = 'card-preview';
            cardElement.setAttribute('data-card-id', card.id);
            
            // تحديد نوع البطاقة وألوانها
            let cardBrand = 'MASTERCARD';
            if (card.cardType === 'gold') {
                cardBrand = 'GOLDCARD';
            } else if (card.cardType === 'premium') {
                cardBrand = 'PREMIUMCARD';
            }
            
            const expiryMonth = new Date(card.expiryDate).getMonth() + 1;
            const expiryYear = new Date(card.expiryDate).getFullYear().toString().slice(2);
            const expiryFormatted = `${expiryMonth}/${expiryYear}`;
            
            cardElement.innerHTML = `
                <div class="card-brand">${cardBrand}</div>
                <div class="card-logo">
                    <div class="card-logo-circle red"></div>
                    <div class="card-logo-circle yellow"></div>
                </div>
                <div class="card-qrcode">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${card.id}" alt="QR Code">
                </div>
                <div class="card-number">${card.cardNumber.slice(-8)}</div>
                <div class="card-details">
                    <div class="card-validity">
                        <div class="card-valid-text">VALID</div>
                        <div>${expiryFormatted}</div>
                    </div>
                    <div class="card-name">${card.investorName}</div>
                </div>
            `;
            
            // إضافة فئة للبطاقات المنتهية
            if (isExpired || !isActive) {
                cardElement.style.opacity = '0.7';
                cardElement.style.filter = 'grayscale(0.5)';
                
                // إضافة علامة منتهية
                const expiredBadge = document.createElement('div');
                expiredBadge.style.position = 'absolute';
                expiredBadge.style.top = '10px';
                expiredBadge.style.right = '10px';
                expiredBadge.style.background = 'red';
                expiredBadge.style.color = 'white';
                expiredBadge.style.padding = '2px 6px';
                expiredBadge.style.borderRadius = '3px';
                expiredBadge.style.fontSize = '8px';
                expiredBadge.textContent = 'منتهية';
                cardElement.appendChild(expiredBadge);
            }
            
            container.appendChild(cardElement);
        });
    }
    
    // عرض تفاصيل البطاقة
    function showCardDetails(cardId) {
        console.log(`عرض تفاصيل البطاقة: ${cardId}`);
        
        // البحث عن البطاقة
        const card = cards.find(c => c.id === cardId);
        if (!card) {
            alert('لم يتم العثور على البطاقة');
            return;
        }
        
        // البحث عن المستثمر
        const investor = investors.find(inv => inv.id === card.investorId);
        
        // التنقل إلى صفحة تفاصيل البطاقة
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const cardDetailsPage = document.getElementById('card-details-page');
        if (!cardDetailsPage) return;
        
        cardDetailsPage.classList.add('active');
        
        // تحديث العنوان في شريط العنوان
        const pageTitle = cardDetailsPage.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = `تفاصيل بطاقة ${card.investorName}`;
        }
        
        // الحصول على حاويات التفاصيل
        const cardDetailsContainer = document.getElementById('card-details-container');
        const investorDetailsContainer = document.getElementById('investor-details-container');
        
        if (!cardDetailsContainer || !investorDetailsContainer) return;
        
        // تحديد نوع البطاقة وألوانها
        let cardBrand = 'MASTERCARD';
        if (card.cardType === 'gold') {
            cardBrand = 'GOLDCARD';
        } else if (card.cardType === 'premium') {
            cardBrand = 'PREMIUMCARD';
        }
        
        const expiryMonth = new Date(card.expiryDate).getMonth() + 1;
        const expiryYear = new Date(card.expiryDate).getFullYear().toString().slice(2);
        const expiryFormatted = `${expiryMonth}/${expiryYear}`;
        
        // ملء معلومات البطاقة
        cardDetailsContainer.innerHTML = `
            <div class="investor-card" id="card-for-print">
                <div class="card-brand">${cardBrand}</div>
                <div class="card-logo">
                    <div class="card-logo-circle red"></div>
                    <div class="card-logo-circle yellow"></div>
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
            </div>
        `;
        
        // تخزين معرف البطاقة في أزرار التحكم
        document.getElementById('print-card-btn').setAttribute('data-card-id', card.id);
        document.getElementById('edit-card-btn').setAttribute('data-card-id', card.id);
        document.getElementById('deactivate-card-btn').setAttribute('data-card-id', card.id);
        
        // تحديث نص زر التعطيل بناءً على حالة البطاقة
        const deactivateBtn = document.getElementById('deactivate-card-btn');
        if (card.status === 'active') {
            deactivateBtn.innerHTML = '<i class="fas fa-times-circle"></i><span>إيقاف البطاقة</span>';
            deactivateBtn.classList.add('danger');
            deactivateBtn.classList.remove('primary');
        } else {
            deactivateBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>تفعيل البطاقة</span>';
            deactivateBtn.classList.add('primary');
            deactivateBtn.classList.remove('danger');
        }
        
        // ملء معلومات المستثمر
        let investorDetails = '';
        
        if (investor) {
            // معلومات المستثمر الأساسية
            investorDetails += `
                <div class="investor-detail-item">
                    <div class="investor-detail-label">الاسم</div>
                    <div class="investor-detail-value">${investor.name}</div>
                </div>
                <div class="investor-detail-item">
                    <div class="investor-detail-label">رقم الهاتف</div>
                    <div class="investor-detail-value">${investor.phone}</div>
                </div>
                <div class="investor-detail-item">
                    <div class="investor-detail-label">العنوان</div>
                    <div class="investor-detail-value">${investor.address || '-'}</div>
                </div>
                <div class="investor-detail-item">
                    <div class="investor-detail-label">رقم البطاقة</div>
                    <div class="investor-detail-value">${investor.cardNumber || '-'}</div>
                </div>
                <div class="investor-detail-item">
                    <div class="investor-detail-label">تاريخ الانضمام</div>
                    <div class="investor-detail-value">${investor.joinDate || investor.createdAt || '-'}</div>
                </div>
                <div class="investor-detail-item">
                    <div class="investor-detail-label">إجمالي الاستثمار</div>
                    <div class="investor-detail-value">${investor.amount ? investor.amount.toLocaleString() + ' دينار' : '-'}</div>
                </div>
            `;
            
            // معلومات الاستثمارات والأرباح
            const totalProfit = calculateInvestorProfit(investor.id);
            
            investorDetails += `
                <div class="investor-detail-item">
                    <div class="investor-detail-label">الربح الشهري المتوقع</div>
                    <div class="investor-detail-value">${totalProfit.toLocaleString()} دينار</div>
                </div>
            `;
            
            // ملخص العمليات
            investorDetails += `
                <div class="transactions-summary">
                    <h4>آخر العمليات</h4>
                    <div class="transaction-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>التاريخ</th>
                                    <th>نوع العملية</th>
                                    <th>المبلغ</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            // البحث عن عمليات المستثمر
            const investorTransactions = window.transactions ? window.transactions.filter(tr => tr.investorId === investor.id) : [];
            
            if (investorTransactions.length > 0) {
                // عرض آخر 5 عمليات
                const recentTransactions = investorTransactions
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5);
                
                recentTransactions.forEach(transaction => {
                    investorDetails += `
                        <tr>
                            <td>${transaction.date}</td>
                            <td>${transaction.type}</td>
                            <td>${transaction.amount.toLocaleString()} دينار</td>
                        </tr>
                    `;
                });
            } else {
                investorDetails += `
                    <tr>
                        <td colspan="3" class="text-center">لا توجد عمليات</td>
                    </tr>
                `;
            }
            
            investorDetails += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else {
            investorDetails = '<div class="text-center">لم يتم العثور على معلومات المستثمر</div>';
        }
        
        // ملء حاوية معلومات المستثمر
        investorDetailsContainer.innerHTML = investorDetails;
        
        // إزالة الفئة النشطة من جميع الروابط وتفعيل رابط البطاقات
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
    }
    
    // حساب الربح الشهري للمستثمر
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
    
    // طباعة البطاقة
    function printCard() {
        // الحصول على معرف البطاقة
        const cardId = document.getElementById('print-card-btn').getAttribute('data-card-id');
        if (!cardId) return;
        
        // البحث عن البطاقة
        const card = cards.find(c => c.id === cardId);
        if (!card) return;
        
        // إنشاء نافذة الطباعة
        const printWindow = window.open('', '_blank');
        
        // إنشاء محتوى نافذة الطباعة
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <title>طباعة بطاقة المستثمر</title>
                <style>
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
                        width: 390px;
                        height: 245px;
                        overflow: hidden;
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                        border-radius: 15px;
                    }
                    
                    .investor-card {
                        width: 100%;
                        height: 100%;
                        border-radius: 15px;
                        background-color: #101a2c;
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
                    
                    @media print {
                        body {
                            background: none;
                        }
                        
                        .card-container {
                            box-shadow: none;
                        }
                        
                        @page {
                            size: 100mm 60mm;
                            margin: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="card-container">
                    <div class="investor-card">
                        <div class="card-brand">${card.cardType === 'gold' ? 'GOLDCARD' : card.cardType === 'premium' ? 'PREMIUMCARD' : 'MASTERCARD'}</div>
                        <div class="card-logo">
                            <div class="card-logo-circle red"></div>
                            <div class="card-logo-circle yellow"></div>
                        </div>
                        <div class="card-qrcode">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${card.id}" alt="QR Code">
                        </div>
                        <div class="card-number">${card.cardNumber}</div>
                        <div class="card-details">
                            <div class="card-validity">
                                <div class="card-valid-text">VALID</div>
                                <div>${new Date(card.expiryDate).getMonth() + 1}/${new Date(card.expiryDate).getFullYear().toString().slice(2)}</div>
                            </div>
                            <div class="card-name">${card.investorName}</div>
                        </div>
                    </div>
                </div>
                <script>
                    // طباعة ثم إغلاق النافذة بعد الطباعة
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 500);
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    // تعديل البطاقة
    function editCard() {
        // الحصول على معرف البطاقة
        const cardId = document.getElementById('edit-card-btn').getAttribute('data-card-id');
        if (!cardId) return;
        
        // البحث عن البطاقة
        const card = cards.find(c => c.id === cardId);
        if (!card) return;
        
        // إنشاء نافذة تعديل البطاقة
        const container = document.createElement('div');
        container.className = 'modal-overlay active';
        container.id = 'edit-card-modal';
        
        container.innerHTML = `
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">تعديل بطاقة</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-card-form">
                        <div class="form-group">
                            <label class="form-label">رقم البطاقة</label>
                            <input type="text" class="form-input" id="edit-card-number" value="${card.cardNumber}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">نوع البطاقة</label>
                            <div class="card-type-options">
                                <label class="card-type-option">
                                    <input type="radio" name="edit-card-type" value="platinum" ${card.cardType === 'platinum' ? 'checked' : ''}>
                                    <span>بلاتينية</span>
                                </label>
                                <label class="card-type-option">
                                    <input type="radio" name="edit-card-type" value="gold" ${card.cardType === 'gold' ? 'checked' : ''}>
                                    <span>ذهبية</span>
                                </label>
                                <label class="card-type-option">
                                    <input type="radio" name="edit-card-type" value="premium" ${card.cardType === 'premium' ? 'checked' : ''}>
                                    <span>بريميوم</span>
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">تاريخ الإنتهاء</label>
                            <input type="date" class="form-input" id="edit-expiry-date" value="${card.expiryDate}" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-edit-card-btn">حفظ التغييرات</button>
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
        
        // مستمع حدث حفظ التغييرات
        const saveButton = container.querySelector('#save-edit-card-btn');
        if (saveButton) {
            saveButton.addEventListener('click', function() {
                // الحصول على البيانات المعدلة
                const cardType = container.querySelector('input[name="edit-card-type"]:checked').value;
                const expiryDate = container.querySelector('#edit-expiry-date').value;
                
                if (!expiryDate) {
                    alert('يرجى ملء جميع الحقول المطلوبة');
                    return;
                }
                
                // تحديث البطاقة
                card.cardType = cardType;
                card.expiryDate = expiryDate;
                
                // حفظ التغييرات
                saveCards().then(success => {
                    if (success) {
                        alert('تم تحديث البطاقة بنجاح');
                        
                        // إغلاق النافذة
                        container.remove();
                        
                        // تحديث عرض تفاصيل البطاقة
                        showCardDetails(cardId);
                    } else {
                        alert('حدث خطأ أثناء حفظ التغييرات');
                    }
                });
            });
        }
    }
    
    // تعطيل/تفعيل البطاقة
    function deactivateCard() {
        // الحصول على معرف البطاقة
        const cardId = document.getElementById('deactivate-card-btn').getAttribute('data-card-id');
        if (!cardId) return;
        
        // البحث عن البطاقة
        const card = cards.find(c => c.id === cardId);
        if (!card) return;
        
        // تبديل حالة البطاقة
        if (card.status === 'active') {
            // طلب تأكيد إيقاف البطاقة
            if (confirm('هل أنت متأكد من رغبتك في إيقاف هذه البطاقة؟')) {
                card.status = 'inactive';
                
                // حفظ التغييرات
                saveCards().then(success => {
                    if (success) {
                        alert('تم إيقاف البطاقة بنجاح');
                        
                        // تحديث عرض تفاصيل البطاقة
                        showCardDetails(cardId);
                    } else {
                        alert('حدث خطأ أثناء حفظ التغييرات');
                    }
                });
            }
        } else {
            // تفعيل البطاقة
            card.status = 'active';
            
            // حفظ التغييرات
            saveCards().then(success => {
                if (success) {
                    alert('تم تفعيل البطاقة بنجاح');
                    
                    // تحديث عرض تفاصيل البطاقة
                    showCardDetails(cardId);
                } else {
                    alert('حدث خطأ أثناء حفظ التغييرات');
                }
            });
        }
    }
    
    // متغيرات الماسح الضوئي
    let scanner = null;
    
    // تهيئة ماسح الباركود
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
    
    // تهيئة الماسح بعد تحميل المكتبة
    function initScannerAfterLoad() {
        // الحصول على حاوية الماسح
        const scannerContainer = document.getElementById('scanner-container');
        if (!scannerContainer) return;
        
        // إنشاء ماسح جديد
        scanner = new Html5QrcodeScanner(
            "scanner-container",
            { fps: 10, qrbox: 250 },
            /* verbose= */ false
        );
        
        // بدء المسح تلقائياً
        startBarcodeScanner();
        
        // تحديث حالة الأزرار
        updateScannerButtonsState();
    }
    
    // بدء المسح
    function startBarcodeScanner() {
        if (!scanner) return;
        
        scanner.render(
            result => {
                // نجاح المسح
                if (result.decodedText) {
                    // البحث عن البطاقة باستخدام المعرف
                    const card = cards.find(c => c.id === result.decodedText);
                    if (card) {
                        // تنظيف الماسح
                        stopBarcodeScanner();
                        
                        // عرض تفاصيل البطاقة
                        showCardDetails(card.id);
                    } else {
                        // إظهار نتيجة المسح
                        const scanResult = document.getElementById('scan-result');
                        const scanResultData = document.getElementById('scan-result-data');
                        
                        if (scanResult && scanResultData) {
                            scanResult.classList.remove('hidden');
                            scanResultData.textContent = 'لم يتم العثور على بطاقة بهذا المعرف: ' + result.decodedText;
                        }
                    }
                }
            },
            error => {
                // خطأ في المسح
                console.error(error);
            }
        );
        
        // تحديث حالة الأزرار
        updateScannerButtonsState(true);
    }
    
    // إيقاف المسح
    function stopBarcodeScanner() {
        if (!scanner) return;
        
        try {
            scanner.clear();
        } catch (error) {
            console.error('خطأ في إيقاف الماسح:', error);
        }
        
        // تحديث حالة الأزرار
        updateScannerButtonsState(false);
    }
    
    // تحديث حالة أزرار الماسح
    function updateScannerButtonsState(isScanning = false) {
        const startButton = document.getElementById('start-scanner');
        const stopButton = document.getElementById('stop-scanner');
        
        if (startButton && stopButton) {
            startButton.disabled = isScanning;
            stopButton.disabled = !isScanning;
        }
    }
    
    // إظهار صفحة البطاقات
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
    
    // تصدير واجهة برمجة التطبيق العامة
    return {
        initialize,
        renderCards,
        showCardDetails,
        printCard,
        createCard,
        showCardPage
    };
})();

// تهيئة نظام البطاقات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نظام البطاقات
    InvestorCardSystem.initialize()
        .then(success => {
            console.log('تم تهيئة نظام بطاقات المستثمرين:', success);
        })
        .catch(error => {
            console.error('خطأ في تهيئة نظام بطاقات المستثمرين:', error);
        });
});

// تصدير النظام للاستخدام الخارجي
window.InvestorCardSystem = InvestorCardSystem;





/**
 * ملف تكامل نظام بطاقات المستثمرين مع التطبيق الرئيسي
 * 
 * يقوم بتحميل نظام البطاقات وربطه مع التطبيق الرئيسي
 * ويضمن تحميل المكتبات اللازمة مثل قارئ الباركود
 */

(function() {
    console.log('بدء تهيئة نظام بطاقات المستثمرين...');
    
    // التحقق مما إذا كان النظام محملاً بالفعل
    if (window.InvestorCardSystem && window.InvestorCardSystem.initialize) {
        console.log('نظام بطاقات المستثمرين محمل بالفعل!');
        return;
    }

    // تحميل أنماط CSS للبطاقات
    loadCardStyles();
    
    // تحميل مكتبة قارئ الباركود
    loadBarcodeScannerLibrary();
    
    // تأكد من تحميل المستثمرين من التطبيق الرئيسي
    ensureInvestorsLoaded()
        .then(() => {
            // تحميل ملف نظام بطاقات المستثمرين الرئيسي
            return loadInvestorCardSystem();
        })
        .then(() => {
            // ربط نظام البطاقات بالقائمة الجانبية
            addSidebarMenuItem();
            
            // تهيئة النظام بعد تحميل الصفحة بالكامل
            if (document.readyState === 'complete') {
                initializeCardSystem();
            } else {
                window.addEventListener('load', initializeCardSystem);
            }
            
            console.log('تم تحميل وتهيئة نظام بطاقات المستثمرين بنجاح!');
        })
        .catch(error => {
            console.error('حدث خطأ أثناء تحميل نظام بطاقات المستثمرين:', error);
        });
    
    /**
     * تحميل أنماط CSS للبطاقات
     */
    function loadCardStyles() {
        // التحقق مما إذا كانت الأنماط محملة بالفعل
        if (document.getElementById('investor-card-styles')) {
            return;
        }
        
        // إنشاء عنصر الأنماط
        const styleElement = document.createElement('style');
        styleElement.id = 'investor-card-styles';
        
        // إضافة محتوى CSS
        styleElement.textContent = `
            /* أنماط صفحة البطاقات */
            #investor-cards-page {
                padding: 20px;
                direction: rtl;
            }
            
            .card-system-container {
                display: flex;
                flex-direction: row;
                gap: 20px;
                height: calc(100vh - 100px);
            }
            
            .card-list-sidebar {
                width: 300px;
                background-color: #2c3e50;
                border-radius: 10px;
                color: white;
                padding: 15px;
                overflow-y: auto;
            }
            
            .card-list-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .card-list-title {
                font-size: 1.2rem;
                font-weight: 600;
                margin: 0;
            }
            
            .card-list-nav {
                margin-top: 20px;
            }
            
            .nav-card-item {
                padding: 12px 15px;
                border-radius: 8px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
            }
            
            .nav-card-item:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
            
            .nav-card-item.active {
                background-color: #3498db;
            }
            
            .nav-card-item i {
                margin-left: 12px;
                width: 20px;
                text-align: center;
            }
            
            .card-content-area {
                flex: 1;
                background-color: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                overflow-y: auto;
            }
            
            /* أنماط نموذج إنشاء البطاقة */
            .card-form-container {
                background-color: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                margin-bottom: 20px;
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
            
            .card-type-options {
                display: flex;
                gap: 15px;
                margin-top: 10px;
            }
            
            .card-type-option {
                display: flex;
                align-items: center;
                cursor: pointer;
            }
            
            .card-type-option input {
                margin-left: 8px;
            }
            
            .card-form-actions {
                margin-top: 30px;
                display: flex;
                justify-content: flex-end;
            }
            
            /* أنماط البطاقة */
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
                transition: transform 0.3s ease;
            }
            
            .investor-card:hover {
                transform: translateY(-5px);
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
            
            /* أنماط قائمة البطاقات */
            .cards-collection {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-top: 20px;
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
                transition: transform 0.3s ease;
                overflow: hidden;
                margin-bottom: 20px;
            }
            
            .card-preview:hover {
                transform: translateY(-3px);
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
            
            /* أنماط لتعديل البطاقة */
            .card-options {
                display: flex;
                justify-content: space-around;
                margin: 20px 0;
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
            }
            
            .card-option-btn:hover {
                background-color: #e9ecef;
            }
            
            .card-option-btn.primary {
                background-color: #3498db;
                color: white;
                border-color: #3498db;
            }
            
            .card-option-btn.primary:hover {
                background-color: #2980b9;
            }
            
            .card-option-btn.danger {
                background-color: #e74c3c;
                color: white;
                border-color: #e74c3c;
            }
            
            .card-option-btn.danger:hover {
                background-color: #c0392b;
            }
            
            /* أنماط تفاصيل المستثمر */
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
            
            /* أنماط لقارئ الباركود */
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
                margin-top: 15px;
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
            
            /* أنماط المعلومات */
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
            
            /* كلاسات مساعدة */
            .text-center {
                text-align: center;
            }
            
            .mb-20 {
                margin-bottom: 20px;
            }
            
            .hidden {
                display: none !important;
            }
        `;
        
        // إضافة العنصر إلى head
        document.head.appendChild(styleElement);
        
        console.log('تم تحميل أنماط CSS لنظام البطاقات');
    }
    
    /**
     * تحميل مكتبة قارئ الباركود
     */
    function loadBarcodeScannerLibrary() {
        // التحقق مما إذا كانت المكتبة محملة بالفعل
        if (window.Html5QrcodeScanner) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/html5-qrcode';
            script.async = true;
            
            script.onload = () => {
                console.log('تم تحميل مكتبة قارئ الباركود بنجاح');
                resolve();
            };
            
            script.onerror = () => {
                console.error('فشل في تحميل مكتبة قارئ الباركود');
                reject(new Error('فشل في تحميل مكتبة قارئ الباركود'));
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * التأكد من تحميل بيانات المستثمرين
     */
    function ensureInvestorsLoaded() {
        return new Promise((resolve) => {
            // التحقق مما إذا كانت بيانات المستثمرين محملة بالفعل
            if (window.investors && Array.isArray(window.investors) && window.investors.length > 0) {
                console.log('بيانات المستثمرين محملة بالفعل');
                resolve();
                return;
            }
            
            // محاولة تحميل البيانات من التخزين المحلي
            try {
                const savedInvestors = localStorage.getItem('investors');
                if (savedInvestors) {
                    window.investors = JSON.parse(savedInvestors);
                    console.log(`تم تحميل ${window.investors.length} مستثمر من التخزين المحلي`);
                    resolve();
                    return;
                }
            } catch (error) {
                console.error('خطأ في تحميل بيانات المستثمرين من التخزين المحلي:', error);
            }
            
            // إذا كانت دالة loadData موجودة، نستخدمها لتحميل البيانات
            if (typeof window.loadData === 'function') {
                console.log('محاولة تحميل البيانات باستخدام دالة loadData...');
                
                // محاولة استدعاء دالة loadData
                try {
                    window.loadData();
                    
                    // التحقق مرة أخرى بعد استدعاء الدالة
                    if (window.investors && Array.isArray(window.investors)) {
                        console.log(`تم تحميل ${window.investors.length} مستثمر باستخدام دالة loadData`);
                        resolve();
                        return;
                    }
                } catch (error) {
                    console.error('خطأ في استدعاء دالة loadData:', error);
                }
            }
            
            // إذا لم نتمكن من تحميل البيانات، ننتظر حتى تصبح متاحة
            console.log('انتظار تحميل بيانات المستثمرين...');
            
            let attempts = 0;
            const maxAttempts = 10;
            const checkInterval = setInterval(() => {
                attempts++;
                
                if (window.investors && Array.isArray(window.investors)) {
                    clearInterval(checkInterval);
                    console.log(`تم تحميل ${window.investors.length} مستثمر بعد ${attempts} محاولة`);
                    resolve();
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('تعذر تحميل بيانات المستثمرين بعد عدة محاولات');
                    
                    // إنشاء مصفوفة فارغة إذا لم نتمكن من تحميل البيانات
                    window.investors = [];
                    resolve();
                }
            }, 500);
        });
    }
    
    /**
     * تحميل ملف نظام بطاقات المستثمرين
     */
    function loadInvestorCardSystem() {
        return new Promise((resolve, reject) => {
            // التحقق مما إذا كان النظام محملاً بالفعل
            if (window.InvestorCardSystem && window.InvestorCardSystem.initialize) {
                resolve();
                return;
            }
            
            // إنشاء عنصر السكربت
            const script = document.createElement('script');
            script.src = 'investor-card-system.js';
            script.async = true;
            
            script.onload = () => {
                console.log('تم تحميل ملف نظام بطاقات المستثمرين بنجاح');
                resolve();
            };
            
            script.onerror = () => {
                console.error('فشل في تحميل ملف نظام بطاقات المستثمرين');
                
                // محاولة تحميل الملف المضمن
                loadInlineSystem()
                    .then(resolve)
                    .catch(reject);
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * تحميل النظام من الكود المضمن (في حالة فشل تحميل الملف الخارجي)
     */
    function loadInlineSystem() {
        return new Promise((resolve, reject) => {
            try {
                // إضافة النظام إلى window
                window.InvestorCardSystem = {
                    // مجرد وظائف أساسية في حالة فشل تحميل النظام الكامل
                    initialize: function() {
                        console.log('تم تهيئة نظام بطاقات المستثمرين (نسخة مبسطة)');
                        return Promise.resolve(true);
                    },
                    renderCards: function() {
                        console.log('عرض البطاقات (نسخة مبسطة)');
                    },
                    showCardDetails: function() {
                        console.log('عرض تفاصيل البطاقة (نسخة مبسطة)');
                    },
                    printCard: function() {
                        console.log('طباعة البطاقة (نسخة مبسطة)');
                    }
                };
                
                console.log('تم تحميل نظام بطاقات المستثمرين المضمن');
                resolve();
            } catch (error) {
                console.error('فشل في تحميل نظام بطاقات المستثمرين المضمن:', error);
                reject(error);
            }
        });
    }
    
    /**
     * إضافة عنصر القائمة إلى الشريط الجانبي
     */
    function addSidebarMenuItem() {
        // التحقق مما إذا كان عنصر القائمة موجود بالفعل
        if (document.querySelector('.nav-link[data-page="investor-cards"]')) {
            return;
        }
        
        // العثور على عنصر القائمة
        const navList = document.querySelector('.nav-list');
        if (!navList) {
            console.error('لم يتم العثور على قائمة التنقل');
            return;
        }
        
        // إنشاء عنصر القائمة
        const navItem = document.createElement('li');
        navItem.className = 'nav-item';
        
        // إنشاء الرابط
        const navLink = document.createElement('a');
        navLink.className = 'nav-link';
        navLink.href = '#';
        navLink.setAttribute('data-page', 'investor-cards');
        
        // إضافة المحتوى
        navLink.innerHTML = `
            <div class="nav-icon">
                <i class="fas fa-id-card"></i>
            </div>
            <span>بطاقات المستثمرين</span>
        `;
        
        // إضافة مستمع النقر
        navLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // التحقق من تحميل النظام
            if (!window.InvestorCardSystem || !window.InvestorCardSystem.showCardPage) {
                alert('جاري تحميل نظام بطاقات المستثمرين، يرجى المحاولة مرة أخرى بعد قليل');
                return;
            }
            
            // إزالة الفئة النشطة من جميع الروابط
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // إضافة الفئة النشطة للرابط الحالي
            this.classList.add('active');
            
            // إظهار صفحة البطاقات
            window.InvestorCardSystem.showCardPage();
        });
        
        // إضافة الرابط إلى عنصر القائمة
        navItem.appendChild(navLink);
        
        // إضافة عنصر القائمة إلى القائمة
        navList.appendChild(navItem);
        
        console.log('تم إضافة عنصر القائمة لنظام بطاقات المستثمرين');
    }
    
    /**
     * تهيئة نظام البطاقات
     */
    function initializeCardSystem() {
        if (!window.InvestorCardSystem || !window.InvestorCardSystem.initialize) {
            console.error('لم يتم العثور على نظام بطاقات المستثمرين');
            return;
        }
        
        // تهيئة نظام البطاقات
        window.InvestorCardSystem.initialize()
            .then(success => {
                console.log('تم تهيئة نظام بطاقات المستثمرين:', success ? 'بنجاح' : 'فشل');
                
                // إضافة أحداث إضافية للتكامل مع التطبيق الرئيسي
                setupAdditionalIntegration();
            })
            .catch(error => {
                console.error('خطأ في تهيئة نظام بطاقات المستثمرين:', error);
            });
    }
    
    /**
     * إعداد تكامل إضافي مع التطبيق الرئيسي
     */
    function setupAdditionalIntegration() {
        // مستمع لأحداث تحديث المستثمرين
        document.addEventListener('investor:update', function() {
            // تحديث بطاقات المستثمرين عند تغيير بيانات المستثمرين
            if (window.InvestorCardSystem && window.InvestorCardSystem.renderCards) {
                window.InvestorCardSystem.renderCards('all');
            }
        });
        
        // مستمع لأحداث تحديث العمليات
        document.addEventListener('transaction:update', function() {
            // تحديث بطاقات المستثمرين عند تغيير بيانات العمليات
            if (window.InvestorCardSystem && window.InvestorCardSystem.renderCards) {
                window.InvestorCardSystem.renderCards('all');
            }
        });
    }


/**
 * نظام الاستثمار المتكامل - الشريط الجانبي والتنقل
 * يتحكم في وظائف الشريط الجانبي والتنقل بين الصفحات المختلفة
 */

class Navigation {
    constructor() {
        // عناصر واجهة المستخدم
        this.sidebar = document.querySelector('.sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.toggleButtons = document.querySelectorAll('.toggle-sidebar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.pages = document.querySelectorAll('.page');
        
        // تعيين الصفحة النشطة
        this.activePage = 'dashboard';
        
        // معدلات التغيير
        this.transitionDuration = 300; // مللي ثانية
        
        // تهيئة الأحداث
        this.initEvents();
        
        // تطبيق حالة الشريط الجانبي المحفوظة
        this.applySavedSidebarState();
    }
    
    // تهيئة الأحداث
    initEvents() {
        // أحداث أزرار طي/فتح الشريط الجانبي
        this.toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.toggleSidebar());
        });
        
        // أحداث روابط التنقل
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    this.navigateTo(page);
                }
            });
        });
        
        // الاستجابة لتغير حجم النافذة
        window.addEventListener('resize', () => this.handleResize());
    }
    
    // طي/فتح الشريط الجانبي
    toggleSidebar() {
        const layout = document.querySelector('.layout');
        layout.classList.toggle('sidebar-collapsed');
        
        // حفظ حالة الشريط الجانبي
        this.saveSidebarState(layout.classList.contains('sidebar-collapsed'));
        
        // إرسال حدث تغيير حجم الشريط الجانبي
        this.dispatchSidebarEvent(layout.classList.contains('sidebar-collapsed'));
    }
    
    // التنقل إلى صفحة معينة
    navigateTo(page) {
        // لا نفعل شيئًا إذا كانت الصفحة هي نفسها النشطة حاليًا
        if (page === this.activePage) {
            return;
        }
        
        // تحديث الروابط النشطة
        this.navLinks.forEach(link => {
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // تحديث الصفحات النشطة مع تأثير التلاشي
        this.pages.forEach(pageEl => {
            const pageId = pageEl.id.replace('-page', '');
            
            if (pageId === page) {
                // نضيف تأثير الظهور للصفحة الجديدة
                pageEl.style.opacity = '0';
                pageEl.classList.add('active');
                
                // تأثير ظهور تدريجي
                setTimeout(() => {
                    pageEl.style.opacity = '1';
                    pageEl.style.transition = `opacity ${this.transitionDuration}ms ease`;
                }, 50);
            } else {
                if (pageEl.classList.contains('active')) {
                    // إخفاء الصفحة السابقة بتلاشي تدريجي
                    pageEl.style.opacity = '0';
                    pageEl.style.transition = `opacity ${this.transitionDuration}ms ease`;
                    
                    setTimeout(() => {
                        pageEl.classList.remove('active');
                    }, this.transitionDuration);
                } else {
                    pageEl.classList.remove('active');
                }
            }
        });
        
        // تحديث الصفحة النشطة
        this.activePage = page;
        
        // حفظ الصفحة النشطة في التخزين المحلي
        localStorage.setItem('activePage', page);
        
        // إرسال حدث تغيير الصفحة
        this.dispatchPageChangeEvent(page);
        
        // تمرير للأعلى
        window.scrollTo(0, 0);
    }
    
    // التعامل مع تغيير حجم النافذة
    handleResize() {
        // إغلاق الشريط الجانبي تلقائيًا في الشاشات الصغيرة
        if (window.innerWidth < 768) {
            document.querySelector('.layout').classList.add('sidebar-collapsed');
            this.saveSidebarState(true);
        }
    }
    
    // حفظ حالة الشريط الجانبي
    saveSidebarState(isCollapsed) {
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
    
    // تطبيق حالة الشريط الجانبي المحفوظة
    applySavedSidebarState() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        if (isCollapsed) {
            document.querySelector('.layout').classList.add('sidebar-collapsed');
        } else {
            document.querySelector('.layout').classList.remove('sidebar-collapsed');
        }
        
        // تطبيق الصفحة المحفوظة
        const savedPage = localStorage.getItem('activePage');
        if (savedPage) {
            this.navigateTo(savedPage);
        }
        
        // للشاشات الصغيرة، نغلق الشريط الجانبي تلقائيًا
        this.handleResize();
    }
    
    // إرسال حدث تغيير حجم الشريط الجانبي
    dispatchSidebarEvent(isCollapsed) {
        const event = new CustomEvent('sidebar:toggle', {
            detail: { isCollapsed }
        });
        document.dispatchEvent(event);
    }
    
    // إرسال حدث تغيير الصفحة
    dispatchPageChangeEvent(page) {
        const event = new CustomEvent('page:change', {
            detail: { page }
        });
        document.dispatchEvent(event);
    }
    
    // فتح الشريط الجانبي
    openSidebar() {
        document.querySelector('.layout').classList.remove('sidebar-collapsed');
        this.saveSidebarState(false);
        this.dispatchSidebarEvent(false);
    }
    
    // إغلاق الشريط الجانبي
    closeSidebar() {
        document.querySelector('.layout').classList.add('sidebar-collapsed');
        this.saveSidebarState(true);
        this.dispatchSidebarEvent(true);
    }
    
    // إضافة سلوك التمرير عند التنقل السريع
    enableSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                if (!targetId) return;
                
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// إنشاء كائن التنقل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});





})();


