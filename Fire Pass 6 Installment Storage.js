/**
 * تكامل Firebase مع نظام الأقساط
 * هذا الملف يقوم بإعداد Firebase وتكاملها مع نظام الأقساط
 */

// إضافة مكتبات Firebase إلى صفحة الويب
function addFirebaseScripts() {
    return new Promise((resolve, reject) => {
        // التحقق من عدم تحميل المكتبات مسبقًا
        if (typeof firebase !== 'undefined') {
            console.log('Firebase موجودة بالفعل');
            resolve();
            return;
        }
        
        console.log('جاري تحميل مكتبات Firebase...');
        
        // قائمة بمكتبات Firebase المطلوبة
        const scripts = [
            "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js",
            "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js",
            "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"
        ];
        
        let loaded = 0;
        
        // تحميل كل مكتبة
        scripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => {
                loaded++;
                console.log(`تم تحميل ${loaded}/${scripts.length} من مكتبات Firebase`);
                
                if (loaded === scripts.length) {
                    console.log('تم تحميل جميع مكتبات Firebase بنجاح');
                    resolve();
                }
            };
            
            script.onerror = (error) => {
                console.error('فشل في تحميل مكتبة Firebase:', src, error);
                reject(new Error(`فشل في تحميل: ${src}`));
            };
            
            document.head.appendChild(script);
        });
    });
}

// تهيئة إعدادات Firebase
function initializeFirebaseApp() {
    // إعدادات Firebase - قم بتحديثها بإعداداتك الخاصة
    const firebaseConfig = {
            apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAzwEMiAI",
            authDomain: "messageemeapp.firebaseapp.com",
            databaseURL: "https://messageemeapp-default-rtdb.firebaseio.com",
            projectId: "messageemeapp",
            storageBucket: "messageemeapp.appspot.com",
            messagingSenderId: "255034474844",
            appId: "1:255034474844:web:5e3b7a6bc4b2fb94cc4199"
        };
    
    // تهيئة Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('تم تهيئة تطبيق Firebase بنجاح');
    } else {
        console.log('تطبيق Firebase مهيأ بالفعل');
    }
}

// إضافة نافذة تسجيل الدخول إلى Firebase
function createFirebaseAuthModal() {
    // التحقق من وجود النافذة مسبقًا
    if (document.getElementById('firebase-auth-modal')) {
        return;
    }
    
    // إنشاء النافذة
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'firebase-auth-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">تسجيل الدخول</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <form id="firebase-auth-form">
                    <div class="form-group">
                        <label class="form-label">البريد الإلكتروني</label>
                        <input class="form-input" id="auth-email" type="email" required="" placeholder="أدخل البريد الإلكتروني" />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">كلمة المرور</label>
                        <input class="form-input" id="auth-password" type="password" required="" placeholder="أدخل كلمة المرور" />
                    </div>
                    
                    <div id="auth-error" class="alert alert-danger" style="display:none;">
                        <!-- رسائل الخطأ -->
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-primary" id="sign-in-btn">تسجيل الدخول</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modalOverlay);
    
    // إضافة مستمعي الأحداث للأزرار
    const closeBtn = modalOverlay.querySelector('.modal-close');
    const closeBtnFooter = modalOverlay.querySelector('.modal-close-btn');
    const signInBtn = document.getElementById('sign-in-btn');
    
    closeBtn.addEventListener('click', () => {
        closeModal('firebase-auth-modal');
    });
    
    closeBtnFooter.addEventListener('click', () => {
        closeModal('firebase-auth-modal');
    });
    
    signInBtn.addEventListener('click', () => {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        
        if (!email || !password) {
            showAuthError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }
        
        // تعطيل الزر أثناء تسجيل الدخول
        signInBtn.disabled = true;
        signInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
        
        // محاولة تسجيل الدخول
        StorageManager.signIn(email, password)
            .then(() => {
                closeModal('firebase-auth-modal');
                showNotification('تم تسجيل الدخول بنجاح', 'success');
                // تحديث حالة واجهة المستخدم
                updateAuthUI(true);
            })
            .catch(error => {
                console.error('خطأ في تسجيل الدخول:', error);
                let errorMessage = 'فشل في تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.';
                
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة لاحقًا';
                }
                
                showAuthError(errorMessage);
            })
            .finally(() => {
                // إعادة تفعيل الزر
                signInBtn.disabled = false;
                signInBtn.innerHTML = 'تسجيل الدخول';
            });
    });
    
    // دالة لعرض رسائل الخطأ
    function showAuthError(message) {
        const errorDiv = document.getElementById('auth-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    
    console.log('تم إنشاء نافذة تسجيل الدخول');
}

// تحديث واجهة المستخدم بناءً على حالة المصادقة
function updateAuthUI(isLoggedIn) {
    const userInfo = document.getElementById('user-info');
    if (!userInfo) {
        return;
    }
    
    if (isLoggedIn) {
        // الحصول على معلومات المستخدم
        const user = firebase.auth().currentUser;
        
        // عرض معلومات المستخدم
        userInfo.innerHTML = `
            <div class="user-info">
                <span class="user-email">${user.email}</span>
                <button class="btn btn-sm btn-outline" id="sign-out-btn">
                    <i class="fas fa-sign-out-alt"></i>
                    تسجيل الخروج
                </button>
            </div>
        `;
        
        // إضافة مستمع الحدث لزر تسجيل الخروج
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                StorageManager.signOut()
                    .then(() => {
                        updateAuthUI(false);
                        showNotification('تم تسجيل الخروج بنجاح', 'success');
                    })
                    .catch(error => {
                        console.error('خطأ في تسجيل الخروج:', error);
                        showNotification('فشل في تسجيل الخروج', 'error');
                    });
            });
        }
    } else {
        // عرض زر تسجيل الدخول
        userInfo.innerHTML = `
            <button class="btn btn-primary" id="show-sign-in-btn">
                <i class="fas fa-user"></i>
                تسجيل الدخول
            </button>
        `;
        
        // إضافة مستمع الحدث لزر إظهار نافذة تسجيل الدخول
        const showSignInBtn = document.getElementById('show-sign-in-btn');
        if (showSignInBtn) {
            showSignInBtn.addEventListener('click', () => {
                openModal('firebase-auth-modal');
            });
        }
    }
}

// إضافة دعم المصادقة إلى الصفحة
function addAuthToPage() {
    // التحقق من وجود العنصر
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) {
        console.error('لم يتم العثور على عنصر header-actions');
        return;
    }
    
    // إنشاء عنصر معلومات المستخدم
    const userInfo = document.createElement('div');
    userInfo.id = 'user-info';
    userInfo.className = 'user-info-container ml-3';
    
    // إضافة العنصر إلى الصفحة
    headerActions.prepend(userInfo);
    
    // تحديث واجهة المستخدم بناءً على حالة المصادقة
    StorageManager.checkAuthState(user => {
        updateAuthUI(!!user);
    });
    
    // إنشاء نافذة تسجيل الدخول
    createFirebaseAuthModal();
    
    // إضافة أنماط CSS للمصادقة
    addAuthStyles();
}

// إضافة أنماط CSS للمصادقة
function addAuthStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .user-info-container {
            margin-left: 15px;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .user-email {
            font-size: 0.85rem;
            color: #666;
        }
        
        #auth-error {
            color: #ef4444;
            background-color: rgba(239, 68, 68, 0.1);
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
            display: none;
        }
        
        @media (max-width: 768px) {
            .user-info-container {
                margin-left: 5px;
            }
            
            .user-email {
                display: none;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// تهيئة Firebase وتكاملها مع نظام الأقساط
async function initializeFirebaseIntegration() {
    try {
        // 1. تحميل مكتبات Firebase
        await addFirebaseScripts();
        
        // 2. تهيئة تطبيق Firebase
        initializeFirebaseApp();
        
        // 3. تهيئة مدير التخزين
        StorageManager.init();
        
        // 4. إضافة دعم المصادقة إلى الصفحة
        addAuthToPage();
        
        // 5. استبدال دوال التخزين الأصلية بالدوال المحسنة
        window.saveInstallmentData = saveInstallmentData;
        window.loadInstallmentData = loadInstallmentData;
        window.deleteInstallment = deleteInstallment;
        window.addNewInstallment = addNewInstallment;
        window.payInstallment = payInstallment;
        
        console.log('تم تهيئة تكامل Firebase بنجاح');
        return true;
    } catch (error) {
        console.error('فشل في تهيئة تكامل Firebase:', error);
        showNotification('فشل في الاتصال بالسحابة، سيتم استخدام التخزين المحلي فقط', 'warning');
        return false;
    }
}

// بدء تهيئة تكامل Firebase عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('بدء تهيئة تكامل Firebase...');
    initializeFirebaseIntegration();
});