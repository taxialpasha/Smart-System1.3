/**
 * تكامل نظام المصادقة مع التطبيق الرئيسي
 * يقوم بربط نظام المصادقة مع بقية أجزاء التطبيق
 */

// تهيئة التكامل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة تكامل نظام المصادقة...');
    
    // إضافة مراقب لأحداث المصادقة
    if (window.AuthSystem) {
        window.AuthSystem.addAuthObserver(handleAuthEvents);
    }
    
    // تحديث واجهة المستخدم بناءً على حالة المصادقة
    updateUIBasedOnAuthState();
    
    // إضافة مستمعي الأحداث
    setupIntegrationEventListeners();
});

/**
 * معالجة أحداث المصادقة
 * @param {Object} event حدث المصادقة
 */
function handleAuthEvents(event) {
    console.log('حدث مصادقة:', event.type);
    
    switch (event.type) {
        case 'login':
            // المستخدم قام بتسجيل الدخول
            console.log('تم تسجيل الدخول:', event.user);
            
            // تحديث واجهة المستخدم
            updateUIBasedOnAuthState(true);
            
            // تحميل البيانات من Firebase
            syncDataFromFirebase();
            
            // إظهار إشعار للمستخدم
            if (window.showNotification) {
                window.showNotification(`مرحباً بك ${event.user.displayName || event.user.email}`, 'success');
            }
            break;
            
        case 'logout':
            // المستخدم قام بتسجيل الخروج
            console.log('تم تسجيل الخروج');
            
            // تحديث واجهة المستخدم
            updateUIBasedOnAuthState(false);
            
            // إظهار إشعار للمستخدم
            if (window.showNotification) {
                window.showNotification('تم تسجيل الخروج بنجاح', 'info');
            }
            break;
            
        case 'signup':
            // المستخدم قام بإنشاء حساب جديد
            console.log('تم إنشاء حساب جديد:', event.user);
            
            // تحديث واجهة المستخدم
            updateUIBasedOnAuthState(true);
            
            // إظهار إشعار ترحيبي للمستخدم الجديد
            if (window.showNotification) {
                window.showNotification(`مرحباً بك ${event.user.displayName || event.user.email}، شكراً لانضمامك إلينا!`, 'success');
            }
            break;
    }
}

/**
 * تحديث واجهة المستخدم بناءً على حالة المصادقة
 * @param {boolean} isAuthenticated حالة المصادقة (اختياري)
 */
function updateUIBasedOnAuthState(isAuthenticated) {
    // إذا لم يتم تمرير القيمة، نستخدم حالة المصادقة الحالية
    const authStatus = isAuthenticated !== undefined
        ? isAuthenticated
        : (window.AuthSystem ? window.AuthSystem.isAuthenticated() : false);
    
    // تحديث فئة body حسب حالة المصادقة
    if (authStatus) {
        document.body.classList.add('authenticated');
        document.body.classList.remove('guest');
    } else {
        document.body.classList.remove('authenticated');
        document.body.classList.add('guest');
    }
    
    // تحديث قائمة المستخدم في الشريط العلوي
    updateUserMenuUI();
    
    // تحديث أزرار وعناصر التصريح
    toggleAuthElements();
}

/**
 * تحديث قائمة المستخدم في الشريط العلوي
 */
function updateUserMenuUI() {
    const userMenuContainer = document.getElementById('user-menu-container');
    if (!userMenuContainer) return;
    
    const user = window.AuthSystem ? window.AuthSystem.getUserInfo() : null;
    
    if (user) {
        // المستخدم مسجل الدخول - إظهار معلومات المستخدم
        userMenuContainer.innerHTML = `
            <div class="user-profile-container">
                <div class="user-avatar">${getInitials(user.displayName || user.email)}</div>
                <div class="user-info">
                    <span class="user-name">${user.displayName || user.email.split('@')[0]}</span>
                    <span class="user-email">${user.email}</span>
                </div>
                <button id="user-menu-toggle" class="btn-icon">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
        `;
        
        // إضافة مستمع حدث للزر
        const menuToggle = document.getElementById('user-menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleUserMenu);
        }
    } else {
        // المستخدم غير مسجل الدخول - إظهار أزرار تسجيل الدخول/إنشاء حساب
        userMenuContainer.innerHTML = `
            <div class="auth-buttons">
                <button id="login-button" class="btn btn-outline">تسجيل الدخول</button>
                <button id="signup-button" class="btn btn-primary">إنشاء حساب</button>
            </div>
        `;
        
        // إضافة مستمعي الأحداث للأزرار
        const loginButton = document.getElementById('login-button');
        if (loginButton) {
            loginButton.addEventListener('click', function() {
                window.AuthSystem.showAuthModal();
                switchAuthTab('login');
            });
        }
        
        const signupButton = document.getElementById('signup-button');
        if (signupButton) {
            signupButton.addEventListener('click', function() {
                window.AuthSystem.showAuthModal();
                switchAuthTab('signup');
            });
        }
    }
}

/**
 * الحصول على الأحرف الأولى من الاسم
 * @param {string} name الاسم
 * @returns {string} الأحرف الأولى
 */
function getInitials(name) {
    if (!name) return '?';
    
    // استخراج الأحرف الأولى من كل كلمة
    const words = name.split(/\s+/);
    if (words.length === 1) {
        // إذا كان هناك كلمة واحدة فقط، نستخدم الحرف الأول
        return name.charAt(0).toUpperCase();
    } else {
        // إذا كان هناك أكثر من كلمة، نستخدم الحرف الأول من أول كلمتين
        return (words[0].charAt(0) + (words[1] ? words[1].charAt(0) : '')).toUpperCase();
    }
}

/**
 * إظهار/إخفاء قائمة المستخدم
 */
function toggleUserMenu() {
    // إنشاء القائمة إذا لم تكن موجودة
    let userMenu = document.getElementById('user-dropdown-menu');
    
    if (userMenu) {
        // إذا كانت القائمة موجودة، قم بإزالتها
        userMenu.remove();
        return;
    }
    
    // الحصول على معلومات المستخدم
    const user = window.AuthSystem ? window.AuthSystem.getUserInfo() : null;
    if (!user) return;
    
    // إنشاء قائمة جديدة
    userMenu = document.createElement('div');
    userMenu.id = 'user-dropdown-menu';
    userMenu.className = 'user-dropdown-menu';
    
    userMenu.innerHTML = `
        <div class="dropdown-menu">
            <div class="dropdown-header">
                <div class="user-avatar large">${getInitials(user.displayName || user.email)}</div>
                <div class="dropdown-user-info">
                    <div class="dropdown-user-name">${user.displayName || user.email.split('@')[0]}</div>
                    <div class="dropdown-user-email">${user.email}</div>
                </div>
            </div>
            <div class="dropdown-menu-items">
                <a href="#" class="dropdown-item" id="profile-menu-item">
                    <i class="fas fa-user"></i>
                    <span>الملف الشخصي</span>
                </a>
                <a href="#" class="dropdown-item" id="settings-menu-item">
                    <i class="fas fa-cog"></i>
                    <span>الإعدادات</span>
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item" id="logout-menu-item">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>تسجيل الخروج</span>
                </a>
            </div>
        </div>
    `;
    
    // إضافة القائمة إلى الصفحة
    const userMenuContainer = document.getElementById('user-menu-container');
    if (userMenuContainer) {
        userMenuContainer.appendChild(userMenu);
    } else {
        document.body.appendChild(userMenu);
    }
    
    // تحديد موضع القائمة
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        const rect = userAvatar.getBoundingClientRect();
        userMenu.style.position = 'absolute';
        userMenu.style.top = `${rect.bottom + 10}px`;
        userMenu.style.left = `${rect.left}px`;
        userMenu.style.zIndex = '1000';
    }
    
    // إضافة مستمعي الأحداث لعناصر القائمة
    const profileMenuItem = document.getElementById('profile-menu-item');
    if (profileMenuItem) {
        profileMenuItem.addEventListener('click', function(e) {
            e.preventDefault();
            // فتح صفحة الملف الشخصي
            showUserProfile();
            userMenu.remove();
        });
    }
    
    const settingsMenuItem = document.getElementById('settings-menu-item');
    if (settingsMenuItem) {
        settingsMenuItem.addEventListener('click', function(e) {
            e.preventDefault();
            // فتح صفحة الإعدادات
            openSettingsPage();
            userMenu.remove();
        });
    }
    
    const logoutMenuItem = document.getElementById('logout-menu-item');
    if (logoutMenuItem) {
        logoutMenuItem.addEventListener('click', function(e) {
            e.preventDefault();
            // تسجيل الخروج
            if (window.AuthSystem) {
                window.AuthSystem.logout();
            }
            userMenu.remove();
        });
    }
    
    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', function closeMenu(e) {
        if (!userMenu.contains(e.target) && e.target.id !== 'user-menu-toggle') {
            userMenu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

/**
 * تبديل ظهور عناصر المصادقة
 */
function toggleAuthElements() {
    const isAuthenticated = window.AuthSystem ? window.AuthSystem.isAuthenticated() : false;
    
    // العناصر التي تظهر فقط للمستخدمين المصادقين
    const authOnlyElements = document.querySelectorAll('.auth-only');
    authOnlyElements.forEach(element => {
        if (isAuthenticated) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
    
    // العناصر التي تظهر فقط للزوار
    const guestOnlyElements = document.querySelectorAll('.guest-only');
    guestOnlyElements.forEach(element => {
        if (isAuthenticated) {
            element.style.display = 'none';
        } else {
            element.style.display = 'block';
        }
    });
}

/**
 * مزامنة البيانات من Firebase
 */
function syncDataFromFirebase() {
    // إذا كان هناك وظيفة مزامنة من Firebase
    if (window.FirebaseSync && typeof window.FirebaseSync.syncFromFirebase === 'function') {
        window.FirebaseSync.syncFromFirebase()
            .then(() => {
                console.log('تمت مزامنة البيانات من Firebase بنجاح');
                
                // تحديث واجهة المستخدم بعد المزامنة
                if (typeof window.updateDashboard === 'function') {
                    window.updateDashboard();
                }
                
                if (typeof window.renderInvestorsTable === 'function') {
                    window.renderInvestorsTable();
                }
                
                if (typeof window.renderTransactionsTable === 'function') {
                    window.renderTransactionsTable();
                }
                
                if (typeof window.renderProfitsTable === 'function') {
                    window.renderProfitsTable();
                }
            })
            .catch(error => {
                console.error('خطأ في مزامنة البيانات من Firebase:', error);
                
                // محاولة تحميل البيانات المحلية كبديل
                if (typeof window.loadData === 'function') {
                    window.loadData();
                }
            });
    } else {
        // إذا لم تكن هناك وظيفة مزامنة، استخدم وظيفة تحميل البيانات العادية
        if (typeof window.loadData === 'function') {
            window.loadData();
        }
    }
}

/**
 * إعداد مستمعي الأحداث الإضافية
 */
function setupIntegrationEventListeners() {
    // إضافة مستمع لزر تسجيل الخروج في الصفحة الرئيسية
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            if (window.AuthSystem) {
                window.AuthSystem.logout();
            }
        });
    }
    
    // إضافة مستمعي أحداث للنوافذ المنبثقة المختلفة
    setupPopupEventListeners();
}

/**
 * إعداد مستمعي أحداث للنوافذ المنبثقة
 */
function setupPopupEventListeners() {
    // التحقق من وجود مستمعي أحداث قبل إضافة مستمعي أحداث جديدة
    if (window._popupEventsInitialized) return;
    window._popupEventsInitialized = true;
    
    // إغلاق النوافذ المنبثقة عند النقر على زر الإغلاق
    document.addEventListener('click', function(e) {
        const closeBtn = e.target.closest('.auth-modal-close');
        if (closeBtn) {
            const modalOverlay = closeBtn.closest('.auth-modal-overlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        }
    });
    
    // إظهار النافذة المنبثقة عند النقر على الأزرار المناسبة
    document.addEventListener('click', function(e) {
        const loginBtn = e.target.closest('#login-button');
        const signupBtn = e.target.closest('#signup-button');
        
        if (loginBtn) {
            if (window.AuthSystem) {
                window.AuthSystem.showAuthModal();
                switchAuthTab('login');
            }
        } else if (signupBtn) {
            if (window.AuthSystem) {
                window.AuthSystem.showAuthModal();
                switchAuthTab('signup');
            }
        }
    });
}

/**
 * التبديل بين علامات تبويب المصادقة
 * @param {string} tab علامة التبويب (login, signup, reset)
 */
function switchAuthTab(tab) {
    // إخفاء جميع علامات التبويب
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    // إظهار علامة التبويب المطلوبة
    const selectedTab = document.getElementById(`${tab}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // تحديث العنوان
    const modalTitle = document.querySelector('.auth-modal-title');
    if (modalTitle) {
        switch (tab) {
            case 'login':
                modalTitle.textContent = 'تسجيل الدخول';
                break;
            case 'signup':
                modalTitle.textContent = 'إنشاء حساب جديد';
                break;
            case 'reset':
                modalTitle.textContent = 'استعادة كلمة المرور';
                break;
        }
    }
    
    // إخفاء أي رسائل خطأ سابقة
    const errorElement = document.getElementById('auth-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

/**
 * عرض صفحة الملف الشخصي للمستخدم
 */
function showUserProfile() {
    // فتح علامة تبويب الإعدادات
    const settingsLink = document.querySelector('a[data-page="settings"]');
    if (settingsLink) {
        settingsLink.click();
        
        // يمكن إضافة منطق إضافي هنا لعرض علامة تبويب الملف الشخصي
        // (يمكن إضافتها كتحديث مستقبلي)
    }
}

/**
 * فتح صفحة الإعدادات
 */
function openSettingsPage() {
    // فتح علامة تبويب الإعدادات
    const settingsLink = document.querySelector('a[data-page="settings"]');
    if (settingsLink) {
        settingsLink.click();
    }
}

// تصدير الوظائف الضرورية
window.AuthIntegration = {
    updateUIBasedOnAuthState,
    syncDataFromFirebase,
    switchAuthTab
};