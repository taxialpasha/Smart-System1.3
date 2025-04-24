
    /**
     * التأكد من وجود مكتبة Firebase
     * @returns {Promise} وعد يتم حله عند التأكد من وجود Firebase
     */
    function ensureFirebaseLoaded() {
        return new Promise((resolve, reject) => {
            // التحقق من وجود Firebase
            if (typeof firebase !== 'undefined' && typeof firebase.auth !== 'undefined') {
                resolve();
                return;
            }
            
            console.log('Firebase غير موجود، جاري محاولة تحميله...');
            
            // محاولة تحميل Firebase من CDN
            const script = document.createElement('script');
            script.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js';
            script.onload = function() {
                // تحميل حزمة المصادقة
                const authScript = document.createElement('script');
                authScript.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js';
                authScript.onload = function() {
                    // تحميل حزمة قاعدة البيانات
                    const dbScript = document.createElement('script');
                    dbScript.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js';
                    dbScript.onload = function() {
                        console.log('تم تحميل Firebase بنجاح');
                        
                        // تكوين Firebase إذا لم يكن موجوداً
                        if (typeof firebaseConfig === 'undefined') {
                            window.firebaseConfig = {
                                apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAzwEMiAI",
                                authDomain: "messageemeapp.firebaseapp.com",
                                databaseURL: "https://messageemeapp-default-rtdb.firebaseio.com",
                                projectId: "messageemeapp",
                                storageBucket: "messageemeapp.appspot.com",
                                messagingSenderId: "255034474844",
                                appId: "1:255034474844:web:5e3b7a6bc4b2fb94cc4199"
                            };
                        }
                        
                        // تهيئة Firebase إذا لم يكن قد تم تهيئته
                        if (!firebase.apps.length) {
                            firebase.initializeApp(firebaseConfig);
                        }
                        
                        resolve();
                    };
                    dbScript.onerror = function() {
                        console.error('فشل تحميل حزمة قاعدة البيانات Firebase');
                        reject(new Error('فشل تحميل حزمة قاعدة البيانات Firebase'));
                    };
                    document.head.appendChild(dbScript);
                };
                authScript.onerror = function() {
                    console.error('فشل تحميل حزمة المصادقة Firebase');
                    reject(new Error('فشل تحميل حزمة المصادقة Firebase'));
                };
                document.head.appendChild(authScript);
            };
            script.onerror = function() {
                console.error('فشل تحميل Firebase');
                reject(new Error('فشل تحميل Firebase'));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * تحميل ملف نظام المصادقة
     * @returns {Promise} وعد يتم حله عند الانتهاء من تحميل الملف
     */
    function loadAuthSystemScript() {
        return new Promise((resolve, reject) => {
            // التحقق من وجود ملف نظام المصادقة في الصفحة
            const scriptExists = Array.from(document.getElementsByTagName('script')).some(script => {
                return script.src.includes('enhanced-auth-system.js');
            });
            
            if (scriptExists) {
                console.log('ملف نظام المصادقة موجود بالفعل في الصفحة');
                resolve();
                return;
            }
            
            console.log('جاري تحميل ملف نظام المصادقة...');
            
            // تحميل ملف نظام المصادقة
            const script = document.createElement('script');
            script.src = 'enhanced-auth-system.js';
            script.onload = function() {
                console.log('تم تحميل ملف نظام المصادقة بنجاح');
                resolve();
            };
            script.onerror = function() {
                console.error('فشل تحميل ملف نظام المصادقة');
                reject(new Error('فشل تحميل ملف نظام المصادقة'));
            };
            document.body.appendChild(script);
        });
    }

    /**
     * التكامل مع واجهة المستخدم الرئيسية
     */
    function integrateWithMainUI() {
        // إضافة مستمع للتنقل بين الصفحات
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const originalClick = link.onclick;
            
            link.onclick = function(e) {
                // التحقق من حالة المصادقة
                if (typeof AuthSystem !== 'undefined' && typeof AuthSystem.getCurrentUser === 'function') {
                    const currentUser = AuthSystem.getCurrentUser();
                    if (!currentUser) {
                        e.preventDefault();
                        console.log('المستخدم غير مسجل الدخول، عرض شاشة تسجيل الدخول...');
                        
                        // إظهار شاشة تسجيل الدخول
                        if (typeof AuthSystem.showLoginScreen === 'function') {
                            AuthSystem.showLoginScreen();
                        } else {
                            // عرض إشعار للمستخدم
                            if (typeof showNotification === 'function') {
                                showNotification('يرجى تسجيل الدخول للوصول إلى هذه الصفحة', 'warning');
                            } else {
                                alert('يرجى تسجيل الدخول للوصول إلى هذه الصفحة');
                            }
                        }
                        return;
                    }
                }
                
                // استدعاء المستمع الأصلي إذا كان موجوداً
                if (typeof originalClick === 'function') {
                    originalClick.call(this, e);
                }
            };
        });
        
        // التحقق من حالة المصادقة عند تحميل الصفحة
        if (typeof AuthSystem !== 'undefined' && typeof AuthSystem.getCurrentUser === 'function') {
            const currentUser = AuthSystem.getCurrentUser();
            if (!currentUser) {
                console.log('المستخدم غير مسجل الدخول، عرض شاشة تسجيل الدخول...');
                
                // إظهار شاشة تسجيل الدخول
                if (typeof AuthSystem.showLoginScreen === 'function') {
                    AuthSystem.showLoginScreen();
                }
            } else {
                console.log(`المستخدم مسجل الدخول: ${currentUser.displayName || currentUser.email}`);
                
                // إخفاء شاشة تسجيل الدخول
                if (typeof AuthSystem.hideLoginScreen === 'function') {
                    AuthSystem.hideLoginScreen();
                }
                
                // تحديث معلومات المستخدم في الواجهة
                updateUserInfoInUI(currentUser);
            }
        }
        
        // إضافة أيقونة المستخدم في شريط التنقل
        addUserInfoToHeader();
    }

    /**
     * إضافة أيقونة معلومات المستخدم في الشريط العلوي
     */
    function addUserInfoToHeader() {
        // البحث عن شريط العنوان
        const headerActions = document.querySelector('.header .header-actions');
        if (!headerActions) {
            console.error('لم يتم العثور على شريط العنوان');
            return;
        }
        
        // التحقق من وجود عنصر معلومات المستخدم
        let userInfoBtn = document.querySelector('.user-info-btn');
        if (userInfoBtn) {
            return;
        }
        
        // إنشاء عنصر معلومات المستخدم
        userInfoBtn = document.createElement('div');
        userInfoBtn.className = 'user-info-btn dropdown';
        userInfoBtn.innerHTML = `
            <button class="btn btn-outline dropdown-toggle">
                <i class="fas fa-user-circle"></i>
                <span class="user-name">تسجيل الدخول</span>
            </button>
            <div class="dropdown-menu">
                <div class="dropdown-header user-dropdown-header">
                    يرجى تسجيل الدخول للوصول إلى حسابك
                </div>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item login-btn">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>تسجيل الدخول</span>
                </a>
                <a href="#" class="dropdown-item register-btn">
                    <i class="fas fa-user-plus"></i>
                    <span>إنشاء حساب</span>
                </a>
            </div>
        `;
        
        // إضافة العنصر إلى شريط العنوان
        headerActions.appendChild(userInfoBtn);
        
        // إضافة مستمعي الأحداث
        const dropdownToggle = userInfoBtn.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
            dropdownToggle.addEventListener('click', function(e) {
                e.preventDefault();
                userInfoBtn.classList.toggle('active');
            });
        }
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function(e) {
            if (!userInfoBtn.contains(e.target)) {
                userInfoBtn.classList.remove('active');
            }
        });
        
        // أزرار تسجيل الدخول وإنشاء حساب
        const loginBtn = userInfoBtn.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                userInfoBtn.classList.remove('active');
                
                // فتح نافذة تسجيل الدخول
                if (typeof AuthSystem !== 'undefined' && typeof AuthSystem.showLoginScreen === 'function') {
                    AuthSystem.showLoginScreen();
                }
            });
        }
        
        const registerBtn = userInfoBtn.querySelector('.register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                userInfoBtn.classList.remove('active');
                
                // فتح نافذة تسجيل الدخول وتبديل إلى تبويب إنشاء حساب
                if (typeof AuthSystem !== 'undefined') {
                    if (typeof AuthSystem.showLoginScreen === 'function') {
                        AuthSystem.showLoginScreen();
                    }
                    
                    // تبديل إلى تبويب إنشاء حساب
                    setTimeout(() => {
                        const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
                        if (registerTab) {
                            registerTab.click();
                        }
                    }, 100);
                }
            });
        }
        
        // إضافة الأنماط CSS إذا لم تكن موجودة
        addUserInfoStyles();
    }

    /**
     * إضافة الأنماط CSS لمعلومات المستخدم
     */
    function addUserInfoStyles() {
        // التحقق من وجود عنصر الأنماط
        const styleId = 'user-info-styles';
        if (document.getElementById(styleId)) {
            return;
        }
        
        // إنشاء عنصر الأنماط
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .dropdown {
                position: relative;
            }
            
            .dropdown-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                min-width: 200px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                padding: 8px 0;
                z-index: 100;
                display: none;
                margin-top: 8px;
            }
            
            .dropdown.active .dropdown-menu {
                display: block;
            }
            
            .dropdown-header {
                padding: 8px 16px;
                color: #6c757d;
                font-size: 14px;
            }
            
            .dropdown-divider {
                height: 1px;
                background-color: #e9ecef;
                margin: 4px 0;
            }
            
            .dropdown-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                color: #212529;
                text-decoration: none;
                transition: background-color 0.15s ease;
            }
            
            .dropdown-item:hover {
                background-color: #f8f9fa;
            }
            
            .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background-color: #e9ecef;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 16px;
                color: #6c757d;
            }
            
            .user-dropdown-header {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .user-dropdown-header.logged-in {
                display: flex;
                align-items: center;
                padding: 8px 16px;
            }
            
            .user-dropdown-header.logged-in .user-info {
                margin-right: 12px;
            }
            
            .user-dropdown-header.logged-in .user-name {
                font-weight: 500;
                color: #212529;
            }
            
            .user-dropdown-header.logged-in .user-email {
                font-size: 12px;
                color: #6c757d;
            }
        `;
        
        // إضافة عنصر الأنماط إلى رأس الصفحة
        document.head.appendChild(style);
    }

  
        
        // تحديث اسم المستخدم
        const userNameSpan = userInfoBtn.querySelector('.user-name');
        if (userNameSpan) {
            userNameSpan.textContent = user.displayName || user.email || 'المستخدم';
        }
        
        // تحديث أيقونة المستخدم
        const userIcon = userInfoBtn.querySelector('.dropdown-toggle i');
        if (userIcon) {
            userIcon.className = 'fas fa-user';
        }
        
        // تحديث قائمة المستخدم
        const dropdownMenu = userInfoBtn.querySelector('.dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.innerHTML = `
                <div class="dropdown-header user-dropdown-header logged-in">
                    <div class="user-avatar">${user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</div>
                    <div class="user-info">
                        <div class="user-name">${user.displayName || 'المستخدم'}</div>
                        <div class="user-email">${user.email || ''}</div>
                    </div>
                </div>
                <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item profile-btn">
                        <i class="fas fa-user"></i>
                        <span>الملف الشخصي</span>
                    </a>
                `;

            }

        
        
        // زر الإعدادات
        const settingsBtn = dropdownMenu.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                userInfoBtn.classList.remove('active');
                
                // التنقل إلى صفحة الإعدادات
                const settingsLink = document.querySelector('.nav-link[data-page="settings"]');
                if (settingsLink) {
                    settingsLink.click();
                } else {
                    // عرض إشعار للمستخدم
                    if (typeof showNotification === 'function') {
                        showNotification('ميزة الإعدادات غير متوفرة حاليًا', 'info');
                    }
                }
            });
        }
    


/**
 * ربط مستمعي الأحداث لنظام المصادقة
 */

function setupAuthEventListeners() {
    if (typeof AuthSystem !== 'undefined' && typeof AuthSystem.addAuthStateListener === 'function') {
        // إضافة مستمع لتغييرات حالة المصادقة
        AuthSystem.addAuthStateListener(function(user) {
            console.log('تغيير حالة المصادقة:', user ? 'مسجل الدخول' : 'غير مسجل الدخول');
            
            if (user) {
                // المستخدم مسجل الدخول
                updateUserInfoInUI(user);
                
                // إخفاء شاشة تسجيل الدخول
                if (typeof AuthSystem.hideLoginScreen === 'function') {
                    AuthSystem.hideLoginScreen();
                } else {
                    // إخفاء شاشة تسجيل الدخول البسيطة
                    const simpleLoginScreen = document.getElementById('simple-login-screen');
                    if (simpleLoginScreen) {
                        simpleLoginScreen.style.display = 'none';
                    }
                }
            } else {
                // المستخدم غير مسجل الدخول
                updateUserInfoInUI({ displayName: 'تسجيل الدخول', email: '' });
                
                // إظهار شاشة تسجيل الدخول
                if (typeof AuthSystem.showLoginScreen === 'function') {
                    AuthSystem.showLoginScreen();
                }
            }
        });
    }
}

/**
 * استخدام نظام المصادقة البديل في حالة فشل نظام المصادقة الأصلي
 */
function useBackupAuthSystem() {
    console.log('استخدام نظام المصادقة البديل...');
    
    // إنشاء كائن نظام المصادقة البديل
    window.AuthSystem = window.AuthSystem || {
        // المتغيرات
        currentUser: null,
        isInitialized: false,
        
        // دوال المصادقة
        initialize: function() {
            console.log('تهيئة نظام المصادقة البديل...');
            
            // تحميل بيانات المستخدم من التخزين المحلي
            const storedUser = localStorage.getItem('auth_user');
            if (storedUser) {
                try {
                    this.currentUser = JSON.parse(storedUser);
                    console.log('تم استعادة جلسة المستخدم من التخزين المحلي');
                } catch(e) {
                    console.error('خطأ في قراءة بيانات المستخدم:', e);
                }
            }
            
            this.isInitialized = true;
            return Promise.resolve(true);
        },
        
        login: function(email, password) {
            console.log(`محاولة تسجيل الدخول: ${email}`);
            
            // تحقق بسيط من البريد وكلمة المرور
            if (email && password) {
                // تعيين بيانات المستخدم
                this.currentUser = {
                    uid: 'local_' + Date.now(),
                    email: email,
                    displayName: email.split('@')[0]
                };
                
                // حفظ بيانات المستخدم في التخزين المحلي
                localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
                
                // إخطار المستمعين
                this.notifyListeners(this.currentUser);
                
                return Promise.resolve(this.currentUser);
            } else {
                return Promise.reject(new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور'));
            }
        },
        
        logout: function() {
            console.log('تسجيل الخروج...');
            
            // مسح بيانات المستخدم
            this.currentUser = null;
            localStorage.removeItem('auth_user');
            
            // إخطار المستمعين
            this.notifyListeners(null);
            
            return Promise.resolve(true);
        },
        
        getCurrentUser: function() {
            return this.currentUser;
        },
        
        // مستمعي الأحداث
        listeners: [],
        
        addAuthStateListener: function(listener) {
            if (typeof listener === 'function' && !this.listeners.includes(listener)) {
                this.listeners.push(listener);
                
                // استدعاء المستمع مع الحالة الحالية
                listener(this.currentUser);
            }
        },
        
        removeAuthStateListener: function(listener) {
            const index = this.listeners.indexOf(listener);
            if (index !== -1) {
                this.listeners.splice(index, 1);
            }
        },
        
        notifyListeners: function(user) {
            this.listeners.forEach(listener => {
                try {
                    listener(user);
                } catch(e) {
                    console.error('خطأ في مستمع المصادقة:', e);
                }
            });
        },
        
        // واجهة المستخدم
        showLoginScreen: function() {
            // إنشاء شاشة تسجيل الدخول البسيطة
            createSimpleLoginScreen();
        },
        
        hideLoginScreen: function() {
            // إخفاء شاشة تسجيل الدخول البسيطة
            const loginScreen = document.getElementById('simple-login-screen');
            if (loginScreen) {
                loginScreen.style.display = 'none';
            }
        }
    };
    
    // تهيئة نظام المصادقة البديل
    AuthSystem.initialize()
        .then(() => {
            // التكامل مع واجهة المستخدم الرئيسية
            integrateWithMainUI();
            
            // ربط مستمعي الأحداث
            setupAuthEventListeners();
        });
}

/**
 * إنشاء شاشة تسجيل الدخول البسيطة
 */
function createSimpleLoginScreen() {
    // التحقق من وجود شاشة تسجيل الدخول
    let loginScreen = document.getElementById('simple-login-screen');
    
    if (!loginScreen) {
        // إنشاء شاشة تسجيل الدخول
        loginScreen = document.createElement('div');
        loginScreen.id = 'simple-login-screen';
        loginScreen.className = 'auth-screen';
        loginScreen.style.position = 'fixed';
        loginScreen.style.top = '0';
        loginScreen.style.left = '0';
        loginScreen.style.width = '100%';
        loginScreen.style.height = '100%';
        loginScreen.style.backgroundColor = 'rgba(0,0,0,0.8)';
        loginScreen.style.zIndex = '9999';
        loginScreen.style.display = 'flex';
        loginScreen.style.alignItems = 'center';
        loginScreen.style.justifyContent = 'center';
        loginScreen.style.direction = 'rtl';
        
        // إضافة محتوى شاشة تسجيل الدخول
        loginScreen.innerHTML = `
            <div class="login-container" style="background-color: white; border-radius: 8px; padding: 24px; width: 360px; max-width: 90%;">
                <div class="login-header" style="text-align: center; margin-bottom: 24px;">
                    <h2 style="margin: 0; color: #3b82f6;">تسجيل الدخول</h2>
                </div>
                
                <form id="backup-login-form">
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">البريد الإلكتروني</label>
                        <input type="email" id="backup-email" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 16px;" required>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">كلمة المرور</label>
                        <input type="password" id="backup-password" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 16px;" required>
                    </div>
                    
                    <div class="form-action" style="margin-top: 24px;">
                        <button type="submit" style="width: 100%; padding: 10px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;">
                            تسجيل الدخول
                        </button>
                    </div>
                </form>
                
                <div class="login-footer" style="margin-top: 16px; text-align: center;">
                    <button type="button" id="backup-guest-btn" style="background: none; border: none; color: #6b7280; cursor: pointer;">
                        الدخول كزائر
                    </button>
                </div>
            </div>
        `;
        
        // إضافة شاشة تسجيل الدخول إلى الصفحة
        document.body.appendChild(loginScreen);
        
        // إضافة مستمعي الأحداث
        setupBackupLoginListeners(loginScreen);
    } else {
        // إظهار شاشة تسجيل الدخول
        loginScreen.style.display = 'flex';
    }
}

/**
 * إضافة مستمعي الأحداث لشاشة تسجيل الدخول البديلة
 * @param {HTMLElement} loginScreen - عنصر شاشة تسجيل الدخول
 */
function setupBackupLoginListeners(loginScreen) {
    // نموذج تسجيل الدخول
    const loginForm = loginScreen.querySelector('#backup-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('backup-email').value;
            const password = document.getElementById('backup-password').value;
            
            // محاولة تسجيل الدخول
            if (typeof AuthSystem !== 'undefined' && typeof AuthSystem.login === 'function') {
                AuthSystem.login(email, password)
                    .then(user => {
                        console.log('تم تسجيل الدخول بنجاح:', user);
                        
                        // إخفاء شاشة تسجيل الدخول
                        loginScreen.style.display = 'none';
                        
                        // عرض إشعار للمستخدم
                        if (typeof showNotification === 'function') {
                            showNotification('تم تسجيل الدخول بنجاح', 'success');
                        }
                    })
                    .catch(error => {
                        console.error('خطأ في تسجيل الدخول:', error);
                        
                        // عرض إشعار للمستخدم
                        if (typeof showNotification === 'function') {
                            showNotification('فشل تسجيل الدخول: ' + (error.message || 'خطأ غير معروف'), 'error');
                        } else {
                            alert('فشل تسجيل الدخول: ' + (error.message || 'خطأ غير معروف'));
                        }
                    });
            }
        });
    }
    
    // زر الدخول كزائر
    const guestBtn = loginScreen.querySelector('#backup-guest-btn');
    if (guestBtn) {
        guestBtn.addEventListener('click', function() {
            // إخفاء شاشة تسجيل الدخول
            loginScreen.style.display = 'none';
            
            // عرض إشعار للمستخدم
            if (typeof showNotification === 'function') {
                showNotification('تم الدخول كزائر. بعض الخصائص قد تكون محدودة.', 'info');
            }
        });
    }
}
