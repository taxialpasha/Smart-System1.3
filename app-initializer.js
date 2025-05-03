/**
 * نظام الاستثمار المتكامل - ملف بدء تشغيل التطبيق
 * 
 * هذا الملف ينظم ترتيب تحميل وتشغيل المكونات المختلفة للتطبيق
 * يعمل على تهيئة الشاشات المناسبة حسب الجهاز وإعدادات المستخدم
 * 
 * الإصدار: 1.0.0
 * تاريخ التحديث: 2025-05-03
 */

(function() {
    // مفتاح تخزين حالة العرض الأول
    const firstTimeKey = 'investment_app_first_launch';
    
    // المتغيرات العامة
    const APP = {
        isDesktop: false,      // هل الجهاز المستخدم هو سطح مكتب؟
        firstTime: true,       // هل هذه زيارة المستخدم الأولى؟
        isReady: false,        // هل تم تحميل التطبيق بالكامل؟
        components: {}         // مؤشرات لمكونات التطبيق المختلفة
    };
    
    // التحقق من نوع الجهاز
    function detectDeviceType() {
        APP.isDesktop = window.innerWidth >= 1024;
        return APP.isDesktop;
    }
    
    // التحقق من عرض الشاشات سابقًا
    function checkFirstTimeVisit() {
        APP.firstTime = localStorage.getItem(firstTimeKey) !== 'seen';
        return APP.firstTime;
    }
    
    // تسجيل حالة الزيارة الأولى
    function markFirstTimeVisit() {
        localStorage.setItem(firstTimeKey, 'seen');
        APP.firstTime = false;
    }
    
    // إعادة تعيين حالة الزيارة الأولى (للاختبار)
    function resetFirstTimeVisit() {
        localStorage.removeItem(firstTimeKey);
        APP.firstTime = true;
        
        // إعادة تحميل الصفحة لتطبيق التغييرات
        window.location.reload();
    }
    
    // بدء تشغيل التطبيق
    function initializeApplication() {
        console.log("بدء تشغيل نظام الاستثمار المتكامل...");
        
        // التحقق من نوع الجهاز وحالة الزيارة الأولى
        detectDeviceType();
        checkFirstTimeVisit();
        
        // تحميل المكونات المناسبة
        if (APP.isDesktop) {
            // للأجهزة المكتبية
            loadDesktopComponents();
        } else {
            // للأجهزة المحمولة
            loadMobileComponents();
        }
    }
    
    // تحميل مكونات الأجهزة المكتبية
    function loadDesktopComponents() {
        console.log("تحميل واجهة سطح المكتب...");
        
        // إذا كانت الزيارة الأولى للمستخدم
        if (APP.firstTime) {
            // عرض شاشة الانتظار المنبثقة لسطح المكتب
            if (typeof window.DesktopSplash !== 'undefined' && window.DesktopSplash.show) {
                window.DesktopSplash.show();
            } else {
                // في حالة عدم وجود شاشة انتظار، افتح مباشرة شاشات الترحيب
                showWelcomeScreens();
            }
        } else {
            // للمستخدمين العائدين، افتح التطبيق مباشرة
            loadMainApplication();
        }
    }
    
    // تحميل مكونات الأجهزة المحمولة
    function loadMobileComponents() {
        console.log("تحميل واجهة الأجهزة المحمولة...");
        
        // إذا كانت الزيارة الأولى للمستخدم
        if (APP.firstTime) {
            // عرض شاشات الترحيب للأجهزة المحمولة
            showWelcomeScreens();
        } else {
            // للمستخدمين العائدين، افتح التطبيق مباشرة
            loadMainApplication();
        }
    }
    
    // عرض شاشات الترحيب
    function showWelcomeScreens() {
        console.log("عرض شاشات الترحيب...");
        
        // استدعاء شاشات الترحيب
        if (typeof window.WelcomeScreens !== 'undefined' && window.WelcomeScreens.show) {
            window.WelcomeScreens.show();
        } else {
            // في حالة عدم وجود شاشات ترحيب، افتح التطبيق مباشرة
            loadMainApplication();
        }
        
        // تسجيل أن المستخدم قد شاهد شاشات الترحيب
        markFirstTimeVisit();
    }
    
    // تحميل التطبيق الرئيسي
    function loadMainApplication() {
        console.log("تحميل التطبيق الرئيسي...");
        
        // هنا يتم تحميل وتهيئة المكونات الرئيسية للتطبيق
        
        // تعيين حالة الاستعداد
        APP.isReady = true;
        
        // إطلاق حدث الاستعداد
        const readyEvent = new Event('app-ready');
        document.dispatchEvent(readyEvent);
    }
    
    // الاستماع للأحداث
    function setupEventListeners() {
        // استمع لتغيير حجم النافذة لتحديث نوع الجهاز
        window.addEventListener('resize', function() {
            const wasDesktop = APP.isDesktop;
            const isNowDesktop = detectDeviceType();
            
            // إذا تغير نوع الجهاز، أعد تحميل المكونات المناسبة
            if (wasDesktop !== isNowDesktop) {
                if (isNowDesktop) {
                    loadDesktopComponents();
                } else {
                    loadMobileComponents();
                }
            }
        });
    }
    
    // تهيئة وبدء التطبيق عندما تكون الصفحة جاهزة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initializeApplication();
            setupEventListeners();
        });
    } else {
        initializeApplication();
        setupEventListeners();
    }
    
    // تصدير الدوال العامة
    window.AppInitializer = {
        init: initializeApplication,
        resetFirstTime: resetFirstTimeVisit,
        isDesktop: function() { return APP.isDesktop; },
        isFirstTime: function() { return APP.firstTime; },
        isReady: function() { return APP.isReady; }
    };
})();