/**
 * نظام الاستثمار المتكامل - شاشة الانتظار المنبثقة لسطح المكتب
 * 
 * هذا الملف يحتوي على شفرة شاشة الانتظار المنبثقة عند تشغيل التطبيق على سطح المكتب
 * 
 * الإصدار: 1.0.0
 * تاريخ التحديث: 2025-05-03
 */

(function() {
    // مفتاح تخزين حالة العرض الأول
    const firstTimeKey = 'investment_app_first_launch';
    
    // صور وأيقونات (Base64 لتجنب مشاكل المسارات)
    const ASSETS = {
        logo: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTQ1LjQgMjQuNWwxNi43IDkuN3YyNS4zbC0xMi41IDcuMlY0OC45bC0xNi43LTkuN3YyNS4zbDEyLjUgNy4yVjQ4LjlsMTYuNyA5LjZ2MjUuM2wtMTYuNyA5LjctMTYuNy05LjdWNGwxNi43IDkuN1pNNjYuMyAxOS42bC0xNi43LTkuNnYxOS4zbDE2LjcgOS43IDE2LjctOS43VjEwbC0xNi43IDkuNloiLz48L3N2Zz4="
    };

    // إضافة أنماط CSS
    function injectStyles() {
        const styleElement = document.createElement('style');
        styleElement.id = 'desktop-splash-styles';
        styleElement.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            @keyframes float {
                0% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(1deg); }
                100% { transform: translateY(0) rotate(0deg); }
            }
            
            @keyframes gradientAnimation {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes progressAnimation {
                0% { width: 0%; }
                100% { width: 100%; }
            }
            
            @keyframes rotateClockwise {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes rotateCounterClockwise {
                from { transform: rotate(0deg); }
                to { transform: rotate(-360deg); }
            }
            
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            
            .desktop-splash {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #142952 0%, #0a1834 100%);
                background-size: 200% 200%;
                animation: gradientAnimation 15s ease infinite;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                animation: fadeIn 0.5s ease-out forwards;
                direction: rtl;
                font-family: 'Tajawal', 'Cairo', 'Arial', sans-serif;
                user-select: none;
                overflow: hidden;
            }
            
            .desktop-splash::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, rgba(20,41,82,0.4), rgba(10,24,52,0.9));
                z-index: -1;
            }
            
            .desktop-splash-window {
                width: 500px;
                height: 300px;
                background: rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                position: relative;
                overflow: hidden;
                animation: scaleIn 0.6s ease-out forwards;
            }
            
            .desktop-splash-logo {
                width: 120px;
                height: 120px;
                margin-bottom: 20px;
                animation: float 6s ease-in-out infinite;
                filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
            }
            
            .desktop-splash-title {
                font-size: 28px;
                font-weight: 700;
                color: white;
                margin-bottom: 10px;
                text-shadow: 0 4px 10px rgba(0,0,0,0.5);
            }
            
            .desktop-splash-subtitle {
                font-size: 16px;
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 30px;
                text-align: center;
                max-width: 80%;
                text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            }
            
            .desktop-splash-progress {
                width: 300px;
                height: 6px;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 15px;
                position: relative;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }
            
            .desktop-splash-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, rgba(255,255,255,0.7), rgba(74,144,226,0.9), rgba(255,255,255,0.7));
                background-size: 200% 100%;
                animation: progressAnimation 3.5s cubic-bezier(0.1, 0.7, 0.9, 0.99) forwards, gradientAnimation 2s ease infinite;
                box-shadow: 0 0 15px rgba(74,144,226,0.5);
            }
            
            .desktop-splash-progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                width: 30px;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5));
                animation: shimmer 2s infinite;
                background-size: 200% 100%;
            }
            
            .desktop-splash-text {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.7);
                animation: pulse 1.5s infinite;
            }
            
            .desktop-splash-version {
                position: absolute;
                bottom: 10px;
                left: 15px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
            }
            
            .desktop-splash-close {
                position: absolute;
                top: 15px;
                left: 15px;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(255, 255, 255, 0.6);
                font-size: 20px;
                cursor: pointer;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .desktop-splash-close:hover {
                color: rgba(255, 255, 255, 0.9);
                transform: scale(1.1);
            }
            
            .desktop-splash-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: -1;
            }
            
            .desktop-splash-particle {
                position: absolute;
                background-color: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                filter: blur(1px);
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            }
            
            .rotating-ring {
                position: absolute;
                width: 400px;
                height: 400px;
                border-radius: 50%;
                border: 2px solid transparent;
                border-top: 2px solid rgba(255, 255, 255, 0.1);
                border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: rotateCounterClockwise 30s linear infinite;
            }
            
            .orbiting-circle {
                position: absolute;
                width: 250px;
                height: 250px;
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.1);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: rotateClockwise 20s linear infinite;
            }
            
            .window-top-bar {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 40px;
                background: rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                padding: 0 15px;
                border-radius: 20px 20px 0 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .window-top-controls {
                display: flex;
                gap: 8px;
            }
            
            .window-control-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
            }
            
            .window-control-dot.red {
                background: rgba(255, 100, 97, 0.8);
            }
            
            .window-control-dot.yellow {
                background: rgba(255, 187, 47, 0.8);
            }
            
            .window-control-dot.green {
                background: rgba(40, 200, 64, 0.8);
            }
            
            .window-title {
                margin-right: auto;
                font-size: 14px;
                color: rgba(255, 255, 255, 0.7);
                margin-right: 10px;
            }
            
            /* تعديلات للشاشات الصغيرة */
            @media (max-width: 600px) {
                .desktop-splash-window {
                    width: 90%;
                    height: auto;
                    aspect-ratio: 16/10;
                    min-height: 250px;
                }
                
                .desktop-splash-logo {
                    width: 80px;
                    height: 80px;
                    margin-bottom: 15px;
                }
                
                .desktop-splash-title {
                    font-size: 22px;
                }
                
                .desktop-splash-subtitle {
                    font-size: 14px;
                }
                
                .desktop-splash-progress {
                    width: 80%;
                }
            }
            
            /* تعديلات لدعم المتصفحات القديمة */
            @supports not (backdrop-filter: blur(15px)) {
                .desktop-splash-window {
                    background: rgba(0, 0, 0, 0.7);
                }
            }
        `;
        document.head.appendChild(styleElement);
    }

    // إنشاء جزيئات متحركة للخلفية
    function createParticles(container, count = 20) {
        const particles = document.createElement('div');
        particles.className = 'desktop-splash-particles';
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'desktop-splash-particle';
            const size = Math.random() * 6 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            
            // موقع عشوائي
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            
            // حركة عشوائية
            const animationDuration = Math.random() * 20 + 10;
            const animationDelay = Math.random() * 5;
            particle.style.animation = `float ${animationDuration}s ease-in-out ${animationDelay}s infinite`;
            
            particles.appendChild(particle);
        }
        
        container.appendChild(particles);
    }

    // إضافة تأثيرات بصرية إضافية
    function addVisualEffects(container) {
        // إضافة حلقة دائرية متحركة
        const rotatingRing = document.createElement('div');
        rotatingRing.className = 'rotating-ring';
        container.appendChild(rotatingRing);
        
        // إضافة دائرة مدارية
        const orbitingCircle = document.createElement('div');
        orbitingCircle.className = 'orbiting-circle';
        container.appendChild(orbitingCircle);
    }

    // إنشاء شاشة انتظار لسطح المكتب
    function createDesktopSplash() {
        // التحقق من وجود الشاشة مسبقاً
        if (document.getElementById('desktop-splash')) {
            return;
        }
        
        // إنشاء العنصر الرئيسي
        const desktopSplash = document.createElement('div');
        desktopSplash.id = 'desktop-splash';
        desktopSplash.className = 'desktop-splash';
        
        // إضافة الجزيئات المتحركة
        createParticles(desktopSplash, 30);
        
        // إضافة تأثيرات بصرية
        addVisualEffects(desktopSplash);
        
        // إنشاء نافذة شاشة الانتظار
        const splashWindow = document.createElement('div');
        splashWindow.className = 'desktop-splash-window';
        
        // إضافة شريط العنوان
        const windowTopBar = document.createElement('div');
        windowTopBar.className = 'window-top-bar';
        
        const windowControls = document.createElement('div');
        windowControls.className = 'window-top-controls';
        
        // إضافة نقاط التحكم في النافذة (على غرار أنظمة ماك)
        const redDot = document.createElement('div');
        redDot.className = 'window-control-dot red';
        
        const yellowDot = document.createElement('div');
        yellowDot.className = 'window-control-dot yellow';
        
        const greenDot = document.createElement('div');
        greenDot.className = 'window-control-dot green';
        
        const windowTitle = document.createElement('div');
        windowTitle.className = 'window-title';
        windowTitle.textContent = 'نظام الاستثمار المتكامل';
        
        // إضافة نقاط التحكم إلى شريط العنوان
        windowControls.appendChild(redDot);
        windowControls.appendChild(yellowDot);
        windowControls.appendChild(greenDot);
        
        windowTopBar.appendChild(windowControls);
        windowTopBar.appendChild(windowTitle);
        
        // إضافة محتوى النافذة
        const logo = document.createElement('img');
        logo.src = ASSETS.logo;
        logo.alt = 'Logo';
        logo.className = 'desktop-splash-logo';
        
        const title = document.createElement('div');
        title.className = 'desktop-splash-title';
        title.textContent = 'نظام الاستثمار المتكامل';
        
        const subtitle = document.createElement('div');
        subtitle.className = 'desktop-splash-subtitle';
        subtitle.textContent = 'جاري تجهيز بيئة العمل، يرجى الانتظار...';
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'desktop-splash-progress';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'desktop-splash-progress-bar';
        progressContainer.appendChild(progressBar);
        
        const loadingText = document.createElement('div');
        loadingText.className = 'desktop-splash-text';
        loadingText.textContent = 'جاري تحميل البيانات...';
        
        const versionInfo = document.createElement('div');
        versionInfo.className = 'desktop-splash-version';
        versionInfo.textContent = 'الإصدار 2.5.0';
        
        // إضافة زر الإغلاق (غير وظيفي هنا، للشكل فقط)
        const closeButton = document.createElement('div');
        closeButton.className = 'desktop-splash-close';
        closeButton.innerHTML = '&times;';
        
        // تجميع العناصر في النافذة
        splashWindow.appendChild(windowTopBar);
        splashWindow.appendChild(logo);
        splashWindow.appendChild(title);
        splashWindow.appendChild(subtitle);
        splashWindow.appendChild(progressContainer);
        splashWindow.appendChild(loadingText);
        splashWindow.appendChild(versionInfo);
        //splashWindow.appendChild(closeButton);
        
        // إضافة النافذة إلى شاشة الانتظار
        desktopSplash.appendChild(splashWindow);
        
        // إضافة شاشة الانتظار للصفحة
        document.body.appendChild(desktopSplash);
        
        // التحضير لفتح التطبيق
        setTimeout(() => {
            openApplication();
        }, 3500);
    }

    // فتح التطبيق الرئيسي
    function openApplication() {
        const desktopSplash = document.getElementById('desktop-splash');
        if (desktopSplash) {
            // إظهار تأثير الخروج
            desktopSplash.style.animation = 'fadeOut 0.5s ease forwards';
            
            // إزالة شاشة الانتظار بعد الانتهاء من التأثير
            setTimeout(() => {
                desktopSplash.remove();
                
                // بدء تشغيل التطبيق الرئيسي (استدعاء شاشة الترحيب)
                if (typeof window.WelcomeScreens !== 'undefined' && window.WelcomeScreens.show) {
                    window.WelcomeScreens.show();
                }
            }, 500);
        }
    }

    // التحقق من عرض الشاشات سابقًا
    function hasSeenWelcomeScreens() {
        return localStorage.getItem(firstTimeKey) === 'seen';
    }

    // تحديد ما إذا كان الجهاز هو سطح مكتب أو جهاز محمول
    function isDesktopDevice() {
        return window.innerWidth >= 1024;
    }

    // بدء تشغيل شاشة الانتظار المناسبة
    function initializeSplashScreen() {
        // التحقق أولاً من نوع الجهاز
        const isDesktop = isDesktopDevice();
        
        // إذا كان الجهاز هو سطح مكتب، استخدم شاشة انتظار سطح المكتب
        if (isDesktop) {
            injectStyles();
            createDesktopSplash();
        } else {
            // إذا كان جهاز محمول، استخدم شاشة الانتظار العادية
            if (typeof window.WelcomeScreens !== 'undefined' && window.WelcomeScreens.show) {
                window.WelcomeScreens.show();
            }
        }
    }
    
    // محاولة بدء تشغيل الشاشة المناسبة عندما تكون الصفحة جاهزة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSplashScreen);
    } else {
        initializeSplashScreen();
    }
    
    // تصدير الدوال العامة
    window.DesktopSplash = {
        show: initializeSplashScreen,
        openApp: openApplication
    };
})();