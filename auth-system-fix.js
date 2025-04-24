/**
 * نظام ملف المستخدم المحسن - الإصدار الجديد
 * يوفر وظائف إدارة ملف المستخدم والصلاحيات والإعدادات
 */

// أنواع المستخدمين
const USER_TYPES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user'
};

// المتغيرات العامة
let currentUser = null;
let databaseRef = null;

/**
 * تهيئة نظام ملف المستخدم المحسن
 */
function initEnhancedUserProfile() {
    console.log('تهيئة نظام ملف المستخدم المحسن...');
    
    // إضافة أنماط CSS
    addAuthStyles();
    
    // محاولة الحصول على المستخدم الحالي من نظام المصادقة
    if (window.AuthSystem && typeof window.AuthSystem.getUserInfo === 'function') {
        currentUser = window.AuthSystem.getUserInfo();
        
        if (currentUser) {
            // إضافة الصلاحيات الافتراضية إذا كانت غير موجودة
            if (!currentUser.permissions) {
                currentUser.permissions = getDefaultPermissions(currentUser.type || USER_TYPES.USER);
            }
            
            // إضافة نوع المستخدم الافتراضي إذا كان غير موجود
            if (!currentUser.type) {
                currentUser.type = USER_TYPES.USER;
            }
            
            // تحديث واجهة المستخدم
            updateUserInfo();
            
            // تطبيق الصلاحيات على العناصر
            updateElementsAccess();
        }
    }
    
    // محاولة الحصول على مرجع قاعدة البيانات
    if (window.firebase && window.firebase.database) {
        databaseRef = window.firebase.database();
    }
    
    // إضافة مستمع للتغييرات في حالة المصادقة
    if (window.AuthSystem && typeof window.AuthSystem.addAuthObserver === 'function') {
        window.AuthSystem.addAuthObserver(handleAuthChange);
    }
}

/**
 * معالجة تغييرات حالة المصادقة
 * @param {Object} event - حدث المصادقة
 */
function handleAuthChange(event) {
    if (event.type === 'login') {
        // تحديث المستخدم الحالي
        currentUser = event.user;
        
        // إضافة الصلاحيات الافتراضية إذا كانت غير موجودة
        if (currentUser && !currentUser.permissions) {
            currentUser.permissions = getDefaultPermissions(currentUser.type || USER_TYPES.USER);
        }
        
        // تحديث واجهة المستخدم
        updateUserInfo();
        
        // تطبيق الصلاحيات على العناصر
        updateElementsAccess();
        
        // تسجيل عملية تسجيل الدخول
        logAction('login', 'auth', currentUser.uid);
    } else if (event.type === 'logout') {
        // مسح المستخدم الحالي
        currentUser = null;
        
        // تحديث العناصر
        updateElementsAccess();
    }
}

/**
 * الحصول على الصلاحيات الافتراضية حسب نوع المستخدم
 * @param {string} userType - نوع المستخدم
 * @returns {Object} - كائن الصلاحيات
 */
function getDefaultPermissions(userType) {
    switch (userType) {
        case USER_TYPES.ADMIN:
            return {
                canCreateUsers: true,
                canDeleteUsers: true,
                canManageSettings: true,
                canDeleteInvestors: true,
                canExportData: true,
                canImportData: true,
                canCreateBackup: true,
                canRestoreBackup: true
            };
        case USER_TYPES.MANAGER:
            return {
                canCreateUsers: true,
                canDeleteUsers: false,
                canManageSettings: true,
                canDeleteInvestors: true,
                canExportData: true,
                canImportData: true,
                canCreateBackup: false,
                canRestoreBackup: false
            };
        case USER_TYPES.USER:
        default:
            return {
                canCreateUsers: false,
                canDeleteUsers: false,
                canManageSettings: false,
                canDeleteInvestors: false,
                canExportData: true,
                canImportData: false,
                canCreateBackup: false,
                canRestoreBackup: false
            };
    }
}

/**
 * تحديث معلومات المستخدم في الواجهة
 */
function updateUserInfo() {
    if (!currentUser) return;
    
    // تحديث معلومات المستخدم في الشريط العلوي
    const userInfoElement = document.querySelector('.user-info');
    if (userInfoElement) {
        userInfoElement.innerHTML = `
            <span class="user-name">${currentUser.displayName || currentUser.email}</span>
            <span class="user-type">${getUserTypeLabel(currentUser.type)}</span>
        `;
    } else {
        // إنشاء عنصر معلومات المستخدم إذا لم يكن موجوداً
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info dropdown';
            userInfo.innerHTML = `
                <button class="dropdown-toggle">
                    <span class="user-avatar">${(currentUser.displayName || currentUser.email).charAt(0)}</span>
                    <span class="user-name">${currentUser.displayName || currentUser.email}</span>
                    <span class="user-type">${getUserTypeLabel(currentUser.type)}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-menu">
                    <a href="#" class="dropdown-item" id="profile-btn">
                        <i class="fas fa-user"></i>
                        <span>الملف الشخصي</span>
                    </a>
                    <a href="#" class="dropdown-item" id="change-password-btn">
                        <i class="fas fa-key"></i>
                        <span>تغيير كلمة المرور</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item" id="logout-btn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>تسجيل الخروج</span>
                    </a>
                </div>
            `;
            
            headerActions.appendChild(userInfo);
            
            // إضافة مستمعي الأحداث
            setupUserMenuListeners();
        }
    }
}

/**
 * إضافة مستمعي الأحداث لقائمة المستخدم
 */
function setupUserMenuListeners() {
    // تبديل القائمة المنسدلة
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.closest('.dropdown');
            dropdown.classList.toggle('active');
        });
    }
    
    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            const activeDropdowns = document.querySelectorAll('.dropdown.active');
            activeDropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        }
    });
    
    // الملف الشخصي
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showProfileModal();
        });
    }
    
    // تغيير كلمة المرور
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showChangePasswordModal();
        });
    }
    
    // تسجيل الخروج
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // تأكيد تسجيل الخروج
            if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
                logout()
                    .then(() => {
                        showNotification('تم تسجيل الخروج بنجاح', 'success');
                    })
                    .catch(error => {
                        console.error('خطأ في تسجيل الخروج:', error);
                        showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
                    });
            }
        });
    }
}

/**
 * تسجيل الخروج من النظام
 * @returns {Promise} - وعد يشير إلى نجاح أو فشل العملية
 */
function logout() {
    if (window.AuthSystem && typeof window.AuthSystem.logout === 'function') {
        // تسجيل عملية تسجيل الخروج قبل الخروج فعلياً
        if (currentUser) {
            logAction('logout', 'auth', currentUser.uid);
        }
        
        return window.AuthSystem.logout();
    }
    
    return Promise.reject(new Error('وظيفة تسجيل الخروج غير متوفرة'));
}

/**
 * عرض نافذة الملف الشخصي
 */
function showProfileModal() {
    if (!currentUser) return;
    
    // إنشاء عنصر النافذة
    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">الملف الشخصي</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="profile-avatar">
                <div class="avatar-circle">
                    ${currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div class="profile-info">
                    <h3>${currentUser.displayName || 'المستخدم'}</h3>
                    <p class="user-type-badge ${currentUser.type}">${getUserTypeLabel(currentUser.type)}</p>
                </div>
            </div>
            
            <form id="profile-form">
                <div class="form-group">
                    <label class="form-label">البريد الإلكتروني</label>
                    <input type="email" class="form-input" value="${currentUser.email}" readonly>
                </div>
                
                <div class="form-group">
                    <label class="form-label">الاسم الكامل</label>
                    <input type="text" class="form-input" id="profile-fullname" value="${currentUser.displayName || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">آخر تسجيل دخول</label>
                    <input type="text" class="form-input" value="${new Date(currentUser.metadata?.lastLogin || Date.now()).toLocaleString()}" readonly>
                </div>
                
                <div class="form-group">
                    <label class="form-label">تاريخ إنشاء الحساب</label>
                    <input type="text" class="form-input" value="${new Date(currentUser.metadata?.createdAt || Date.now()).toLocaleString()}" readonly>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إلغاء</button>
            <button class="btn btn-primary" id="save-profile-btn">حفظ التغييرات</button>
        </div>
    `;
    
    showModal('profile-modal', modalContent, function(modal) {
        // مستمع حدث حفظ الملف الشخصي
        const saveProfileBtn = modal.querySelector('#save-profile-btn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', function() {
                const fullNameInput = document.getElementById('profile-fullname');
                
                if (!fullNameInput) {
                    showNotification('خطأ في النموذج: حقل الاسم غير موجود', 'error');
                    return;
                }
                
                const fullName = fullNameInput.value.trim();
                
                if (!fullName) {
                    showNotification('يرجى إدخال الاسم الكامل', 'error');
                    return;
                }
                
                // تغيير حالة الزر
                const originalText = this.textContent;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
                this.disabled = true;
                
                // تحديث بيانات المستخدم
                updateUserData(currentUser.uid, { fullName })
                    .then(() => {
                        // تحديث اسم العرض
                        return firebase.auth().currentUser.updateProfile({
                            displayName: fullName
                        });
                    })
                    .then(() => {
                        // تحديث المتغير المحلي
                        currentUser.displayName = fullName;
                        
                        // تحديث واجهة المستخدم
                        updateUserInfo();
                        
                        showNotification('تم تحديث الملف الشخصي بنجاح', 'success');
                        
                        // إغلاق النافذة
                        closeModal('profile-modal');
                    })
                    .catch(error => {
                        console.error('خطأ في تحديث الملف الشخصي:', error);
                        showNotification('حدث خطأ أثناء تحديث الملف الشخصي', 'error');
                    })
                    .finally(() => {
                        // إعادة حالة الزر
                        this.textContent = originalText;
                        this.disabled = false;
                    });
            });
        }
    });
}

/**
 * تحديث بيانات المستخدم في قاعدة البيانات
 * @param {string} uid - معرف المستخدم
 * @param {Object} data - البيانات المراد تحديثها
 * @returns {Promise} - وعد يشير إلى نجاح أو فشل العملية
 */
function updateUserData(uid, data) {
    if (!databaseRef) {
        return Promise.reject(new Error('مرجع قاعدة البيانات غير متوفر'));
    }
    
    return databaseRef.ref(`users/${uid}/profile`).update({
        ...data,
        updatedAt: new Date().toISOString()
    })
    .then(() => {
        // تسجيل العملية
        return logAction('update_profile', 'user', uid, data);
    });
}

/**
 * عرض نافذة تغيير كلمة المرور
 */
function showChangePasswordModal() {
    if (!currentUser) return;
    
    // إنشاء عنصر النافذة
    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">تغيير كلمة المرور</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <form id="change-password-form">
                <div class="form-group">
                    <label class="form-label">كلمة المرور الحالية</label>
                    <div class="password-input-container">
                        <input type="password" class="form-input" id="current-password" required>
                        <button type="button" class="toggle-password">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">كلمة المرور الجديدة</label>
                    <div class="password-input-container">
                        <input type="password" class="form-input" id="new-password" required>
                        <button type="button" class="toggle-password">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">تأكيد كلمة المرور الجديدة</label>
                    <div class="password-input-container">
                        <input type="password" class="form-input" id="confirm-new-password" required>
                        <button type="button" class="toggle-password">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إلغاء</button>
            <button class="btn btn-primary" id="save-password-btn">تغيير كلمة المرور</button>
        </div>
    `;
    
    showModal('change-password-modal', modalContent, function(modal) {
        // إضافة مستمعي أحداث لأزرار إظهار/إخفاء كلمة المرور
        const togglePasswordButtons = modal.querySelectorAll('.toggle-password');
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', function() {
                const passwordInput = this.parentElement.querySelector('input');
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    this.querySelector('i').classList.remove('fa-eye');
                    this.querySelector('i').classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    this.querySelector('i').classList.remove('fa-eye-slash');
                    this.querySelector('i').classList.add('fa-eye');
                }
            });
        });
        
        // مستمع حدث حفظ كلمة المرور
        const savePasswordBtn = modal.querySelector('#save-password-btn');
        if (savePasswordBtn) {
            savePasswordBtn.addEventListener('click', function() {
                const currentPasswordInput = document.getElementById('current-password');
                const newPasswordInput = document.getElementById('new-password');
                const confirmNewPasswordInput = document.getElementById('confirm-new-password');
                
                if (!currentPasswordInput || !newPasswordInput || !confirmNewPasswordInput) {
                    showNotification('خطأ في النموذج: بعض الحقول المطلوبة غير موجودة', 'error');
                    return;
                }
                
                const currentPassword = currentPasswordInput.value;
                const newPassword = newPasswordInput.value;
                const confirmNewPassword = confirmNewPasswordInput.value;
                
                if (!currentPassword || !newPassword || !confirmNewPassword) {
                    showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
                    return;
                }
                
                if (newPassword.length < 6) {
                    showNotification('يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل', 'error');
                    return;
                }
                
                if (newPassword !== confirmNewPassword) {
                    showNotification('كلمة المرور الجديدة وتأكيدها غير متطابقين', 'error');
                    return;
                }
                
                // تغيير حالة الزر
                const originalText = this.textContent;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تغيير كلمة المرور...';
                this.disabled = true;
                
                // تغيير كلمة المرور
                changePassword(currentPassword, newPassword)
                    .then(() => {
                        showNotification('تم تغيير كلمة المرور بنجاح', 'success');
                        
                        // إغلاق النافذة
                        closeModal('change-password-modal');
                    })
                    .catch(error => {
                        console.error('خطأ في تغيير كلمة المرور:', error);
                        
                        let errorMessage = 'حدث خطأ أثناء تغيير كلمة المرور';
                        
                        if (error.code === 'auth/wrong-password') {
                            errorMessage = 'كلمة المرور الحالية غير صحيحة';
                        } else if (error.code === 'auth/weak-password') {
                            errorMessage = 'كلمة المرور الجديدة ضعيفة جداً';
                        }
                        
                        showNotification(errorMessage, 'error');
                    })
                    .finally(() => {
                        // إعادة حالة الزر
                        this.textContent = originalText;
                        this.disabled = false;
                    });
            });
        }
    });
}

/**
 * تغيير كلمة المرور
 * @param {string} currentPassword - كلمة المرور الحالية
 * @param {string} newPassword - كلمة المرور الجديدة
 * @returns {Promise} - وعد يشير إلى نجاح أو فشل العملية
 */
function changePassword(currentPassword, newPassword) {
    if (!firebase.auth || !firebase.auth().currentUser) {
        return Promise.reject(new Error('المستخدم غير مسجل الدخول'));
    }
    
    // الحصول على بيانات إعادة المصادقة
    const credential = firebase.auth.EmailAuthProvider.credential(
        firebase.auth().currentUser.email,
        currentPassword
    );
    
    // إعادة المصادقة
    return firebase.auth().currentUser.reauthenticateWithCredential(credential)
        .then(() => {
            // تغيير كلمة المرور
            return firebase.auth().currentUser.updatePassword(newPassword);
        })
        .then(() => {
            // تسجيل العملية
            return logAction('change_password', 'user', currentUser.uid);
        });
}

/**
 * تحديث صلاحيات الوصول إلى العناصر
 */
function updateElementsAccess() {
    if (!currentUser) return;
    
    // إخفاء العناصر التي لا يملك المستخدم صلاحية الوصول إليها
    
    // إدارة المستخدمين
    const userManagementElements = document.querySelectorAll('.user-management, [data-permission="canCreateUsers"]');
    userManagementElements.forEach(element => {
        if (currentUser.permissions.canCreateUsers) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });
    
    // إدارة الإعدادات
    const settingsElements = document.querySelectorAll('.settings-management, [data-permission="canManageSettings"]');
    settingsElements.forEach(element => {
        if (currentUser.permissions.canManageSettings) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });
    
    // حذف المستثمرين
    const deleteInvestorsElements = document.querySelectorAll('.delete-investor, [data-permission="canDeleteInvestors"]');
    deleteInvestorsElements.forEach(element => {
        if (currentUser.permissions.canDeleteInvestors) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });
    
    // تصدير البيانات
    const exportDataElements = document.querySelectorAll('.export-data, [data-permission="canExportData"]');
    exportDataElements.forEach(element => {
        if (currentUser.permissions.canExportData) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });
    
    // استيراد البيانات
    const importDataElements = document.querySelectorAll('.import-data, [data-permission="canImportData"]');
    importDataElements.forEach(element => {
        if (currentUser.permissions.canImportData) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });
    
    // إنشاء نسخة احتياطية
    const createBackupElements = document.querySelectorAll('.create-backup, [data-permission="canCreateBackup"]');
    createBackupElements.forEach(element => {
        if (currentUser.permissions.canCreateBackup) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });
    
    // استعادة نسخة احتياطية
    const restoreBackupElements = document.querySelectorAll('.restore-backup, [data-permission="canRestoreBackup"]');
    restoreBackupElements.forEach(element => {
        if (currentUser.permissions.canRestoreBackup) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });
    
    // إضافة فئة المستخدم لعنصر الجسم
    document.body.setAttribute('data-user-type', currentUser.type);
    
    // تطبيق الأنماط CSS الديناميكية
    applyDynamicStyles();
}

/**
 * تطبيق الأنماط CSS الديناميكية
 */
function applyDynamicStyles() {
    // التحقق من وجود عنصر النمط
    let styleElement = document.getElementById('auth-dynamic-styles');
    
    // إنشاء عنصر النمط إذا لم يكن موجوداً
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'auth-dynamic-styles';
        document.head.appendChild(styleElement);
    }
    
    // تحديد الأنماط بناءً على نوع المستخدم
    styleElement.textContent = `
        /* إخفاء العناصر للمستخدمين غير المصرح لهم */
        .hidden {
            display: none !important;
        }
        
        /* أنماط خاصة بنوع المستخدم */
        body[data-user-type="${USER_TYPES.USER}"] .admin-only,
        body[data-user-type="${USER_TYPES.USER}"] .manager-only {
            display: none !important;
        }
        
        body[data-user-type="${USER_TYPES.MANAGER}"] .admin-only {
            display: none !important;
        }
        
        /* أيقونة تغير لون بناءً على نوع المستخدم */
        .user-avatar {
            background-color: var(--primary-color);
        }
        
        body[data-user-type="${USER_TYPES.ADMIN}"] .user-avatar {
            background-color: var(--danger-color);
        }
        
        body[data-user-type="${USER_TYPES.MANAGER}"] .user-avatar {
            background-color: var(--warning-color);
        }
        
        /* تطبيق فلاتر لتقييد الوصول */
        body:not([data-user-type="${USER_TYPES.ADMIN}"]) .admin-access-table tr td:last-child .delete-action {
            opacity: 0.5;
            pointer-events: none;
            cursor: not-allowed;
        }
        
        body:not([data-user-type="${USER_TYPES.ADMIN}"]):not([data-user-type="${USER_TYPES.MANAGER}"]) .manager-access-table tr td:last-child .edit-action {
            opacity: 0.5;
            pointer-events: none;
            cursor: not-allowed;
        }
    `;
}

/**
 * الحصول على تسمية نوع المستخدم
 * @param {string} userType - نوع المستخدم
 * @returns {string} - تسمية نوع المستخدم
 */
function getUserTypeLabel(userType) {
    switch (userType) {
        case USER_TYPES.ADMIN:
            return 'مسؤول النظام';
        case USER_TYPES.MANAGER:
            return 'مدير';
        case USER_TYPES.USER:
            return 'مستخدم';
        default:
            return 'غير معروف';
    }
}

/**
 * عرض نافذة منبثقة
 * @param {string} id - معرف النافذة
 * @param {string} content - محتوى النافذة
 * @param {Function} onRendered - دالة تنفذ بعد إضافة النافذة للصفحة
 */
function showModal(id, content, onRendered) {
    // التحقق من وجود النافذة مسبقاً
    let modalElement = document.getElementById(id);
    
    if (modalElement) {
        // إذا كانت النافذة موجودة، نحدث المحتوى فقط
        modalElement.querySelector('.modal').innerHTML = content;
    } else {
        // إنشاء عنصر النافذة
        modalElement = document.createElement('div');
        modalElement.id = id;
        modalElement.className = 'modal-overlay';
        
        // إضافة المحتوى
        const modalContent = document.createElement('div');
        modalContent.className = 'modal animate__animated animate__fadeInUp';
        modalContent.innerHTML = content;
        
        modalElement.appendChild(modalContent);
        
        // إضافة النافذة للصفحة
        document.body.appendChild(modalElement);
        
        // إضافة مستمعي الأحداث للأزرار
        setupModalListeners(modalElement);
    }
    
    // إظهار النافذة
    modalElement.classList.add('active');
    
    // تنفيذ الدالة بعد إضافة النافذة
    if (typeof onRendered === 'function') {
        onRendered(modalElement);
    }
    
    return modalElement;
}

/**
 * إضافة مستمعي الأحداث للنافذة
 * @param {HTMLElement} modalElement - عنصر النافذة
 */
function setupModalListeners(modalElement) {
    // أزرار الإغلاق
    const closeButtons = modalElement.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeModal(modalElement.id);
        });
    });
    
    // إغلاق النافذة عند النقر خارجها
    modalElement.addEventListener('click', function(e) {
        if (e.target === modalElement) {
            closeModal(modalElement.id);
        }
    });
}

/**
 * إغلاق نافذة منبثقة
 * @param {string} id - معرف النافذة
 */
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * عرض إشعار في شاشة تسجيل الدخول
 * @param {string} message - نص الإشعار
 * @param {string} type - نوع الإشعار (success, error, warning, info)
 */
function showAuthNotification(message, type = 'info') {
    // التحقق من وجود عنصر الإشعار
    let notificationElement = document.querySelector('.auth-notification');
    
    // إنشاء عنصر الإشعار إذا لم يكن موجوداً
    if (!notificationElement) {
        notificationElement = document.createElement('div');
        notificationElement.className = 'auth-notification';
        document.querySelector('.auth-container').appendChild(notificationElement);
    }
    
    // تحديد الفئة حسب نوع الإشعار
    notificationElement.className = `auth-notification ${type}`;
    
    // إضافة المحتوى
    notificationElement.innerHTML = `
        <div class="auth-notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="auth-notification-close">&times;</button>
    `;
    
    // إظهار الإشعار
    notificationElement.classList.add('show');
    
    // إغلاق الإشعار بعد فترة
    const timeout = setTimeout(() => {
        notificationElement.classList.remove('show');
    }, 5000);
    
    // إضافة مستمع حدث زر الإغلاق
    const closeButton = notificationElement.querySelector('.auth-notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            clearTimeout(timeout);
            notificationElement.classList.remove('show');
        });
    }
}

/**
 * الحصول على أيقونة الإشعار
 * @param {string} type - نوع الإشعار
 * @returns {string} - فئة الأيقونة
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-times-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        case 'info':
        default:
            return 'fa-info-circle';
    }
}

/**
 * عرض إشعار عام في التطبيق
 * @param {string} message - نص الإشعار
 * @param {string} type - نوع الإشعار (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // منع الاستدعاء المتكرر
    if (window._isShowingNotification) return;
    window._isShowingNotification = true;

    // استخدام دالة عرض الإشعارات الموجودة في التطبيق إذا كانت متاحة
    if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
        window.showNotification(message, type);
        window._isShowingNotification = false;
        return;
    }

    // التحقق من وجود عنصر الإشعار
    let notificationElement = document.getElementById('notification');

    // إنشاء عنصر الإشعار إذا لم يكن موجوداً
    if (!notificationElement) {
        notificationElement = document.createElement('div');
        notificationElement.id = 'notification';
        notificationElement.className = 'notification';
        document.body.appendChild(notificationElement);
    }

    // تحديد الفئة حسب نوع الإشعار
    notificationElement.className = `notification ${type}`;

    // إضافة المحتوى
    notificationElement.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${getNotificationIcon(type)}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${getNotificationTitle(type)}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;

    // إظهار الإشعار
    notificationElement.classList.add('show');

    // إغلاق الإشعار بعد فترة
    const timeout = setTimeout(() => {
        notificationElement.classList.remove('show');
        window._isShowingNotification = false;
    }, 5000);

    // إضافة مستمع حدث زر الإغلاق
    const closeButton = notificationElement.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', function () {
            clearTimeout(timeout);
            notificationElement.classList.remove('show');
            window._isShowingNotification = false;
        });
    }
}

/**
 * الحصول على عنوان الإشعار
 * @param {string} type - نوع الإشعار
 * @returns {string} - عنوان الإشعار
 */
function getNotificationTitle(type) {
    switch (type) {
        case 'success':
            return 'تمت العملية بنجاح';
        case 'error':
            return 'خطأ';
        case 'warning':
            return 'تنبيه';
        case 'info':
        default:
            return 'معلومات';
    }
}

/**
 * إضافة أنماط CSS لنظام المصادقة
 */
function addAuthStyles() {
    // التحقق من وجود الأنماط مسبقاً
    if (document.getElementById('auth-styles')) {
        return;
    }
    
    // إنشاء عنصر النمط
    const styleElement = document.createElement('style');
    styleElement.id = 'auth-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* شاشة تسجيل الدخول */
        .auth-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--bg-color), var(--primary-color-dark));
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            direction: rtl;
        }
        
        .auth-container {
            width: 100%;
            max-width: 450px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            position: relative;
            overflow: hidden;
        }
        
        .auth-logo {
            text-align: center;
            margin-bottom: 2rem;
            color: var(--primary-color);
        }
        
        .auth-logo i {
            font-size: 3rem;
            margin-bottom: 0.5rem;
        }
        
        .auth-logo span {
            display: block;
            font-size: 1.5rem;
            font-weight: 700;
        }
        
        .auth-tabs {
            display: flex;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #eee;
        }
        
        .auth-tab {
            flex: 1;
            padding: 0.75rem;
            text-align: center;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            color: #666;
            transition: all 0.3s ease;
        }
        
        .auth-tab.active {
            color: var(--primary-color);
            border-bottom: 2px solid var(--primary-color);
        }
        
        .auth-tab-content {
            display: none;
        }
        
        .auth-tab-content.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }
        
        .auth-footer {
            text-align: center;
            margin-top: 2rem;
            color: #666;
            font-size: 0.9rem;
        }
        
        /* نموذج تسجيل الدخول */
        .form-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1.5rem;
        }
        
        .password-input-container {
            position: relative;
        }
        
        .toggle-password {
            position: absolute;
            top: 0.625rem;
            left: 0.625rem;
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
        }
        
        /* الإشعارات */
        .auth-notification {
            position: absolute;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 400px;
            padding: 1rem;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transition: top 0.5s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 1000;
        }
        
        .auth-notification.show {
            top: 20px;
        }
        
        .auth-notification.success {
            background-color: #d4edda;
            color: #155724;
            border-left: 4px solid #28a745;
        }
        
        .auth-notification.error {
            background-color: #f8d7da;
            color: #721c24;
            border-left: 4px solid #dc3545;
        }
        
        .auth-notification.warning {
            background-color: #fff3cd;
            color: #856404;
            border-left: 4px solid #ffc107;
        }
        
        .auth-notification.info {
            background-color: #d1ecf1;
            color: #0c5460;
            border-left: 4px solid #17a2b8;
        }
        
        .auth-notification-content {
            display: flex;
            align-items: center;
        }
        
        .auth-notification-content i {
            margin-left: 0.75rem;
            font-size: 1.25rem;
        }
        
        .auth-notification-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: inherit;
            opacity: 0.7;
        }
        
        .auth-notification-close:hover {
            opacity: 1;
        }
        
        /* النافذة المنبثقة */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            direction: rtl;
        }
        
        .modal-overlay.active {
            display: flex;
        }
        
        .modal {
            width: 90%;
            max-width: 500px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .modal-header {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-title {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
        }
        
        /* قائمة المستخدم */
        .user-info {
            display: flex;
            align-items: center;
            margin-right: 1rem;
            position: relative;
        }
        
        .dropdown-toggle {
            display: flex;
            align-items: center;
            background: none;
            border: none;
            cursor: pointer;
            color: inherit;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        
        .dropdown-toggle:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .user-avatar {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            margin-left: 0.5rem;
        }
        
        .user-name {
            font-weight: 500;
            margin-left: 0.25rem;
        }
        
        .user-type {
            color: #666;
            font-size: 0.8rem;
            margin-left: 0.5rem;
        }
        
        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            width: 200px;
            background-color: white;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: 0.5rem 0;
            display: none;
            z-index: 100;
        }
        
        .dropdown.active .dropdown-menu {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        .dropdown-item {
            display: flex;
            align-items: center;
            padding: 0.625rem 1rem;
            color: inherit;
            text-decoration: none;
            transition: background-color 0.3s ease;
        }
        
        .dropdown-item:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .dropdown-item i {
            margin-left: 0.75rem;
            width: 1rem;
            text-align: center;
        }
        
        .dropdown-divider {
            height: 1px;
            background-color: #eee;
            margin: 0.5rem 0;
        }
        
        /* الملف الشخصي */
        .profile-avatar {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        
        .avatar-circle {
            width: 4rem;
            height: 4rem;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 600;
            margin-left: 1rem;
        }
        
        .profile-info {
            flex: 1;
        }
        
        .profile-info h3 {
            margin: 0 0 0.5rem 0;
        }
        
        .user-type-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .user-type-badge.admin {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .user-type-badge.manager {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .user-type-badge.user {
            background-color: #d1ecf1;
            color: #0c5460;
        }
        
        /* الرسوم المتحركة */
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        
        /* Notification styles */
        .notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 320px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            display: flex;
            align-items: stretch;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .notification.show {
            opacity: 1;
            visibility: visible;
        }
        
        .notification.success .notification-icon {
            background-color: #10b981;
        }
        
        .notification.error .notification-icon {
            background-color: #ef4444;
        }
        
        .notification.warning .notification-icon {
            background-color: #f59e0b;
        }
        
        .notification.info .notification-icon {
            background-color: #3b82f6;
        }
        
        .notification-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            color: white;
        }
        
        .notification-content {
            flex: 1;
            padding: 12px 16px;
        }
        
        .notification-title {
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .notification-message {
            font-size: 0.9rem;
            color: #666;
        }
        
        .notification-close {
            align-self: flex-start;
            background: none;
            border: none;
            font-size: 1.2rem;
            padding: 8px;
            cursor: pointer;
            color: #999;
        }
    `;
    
    // إضافة عنصر النمط إلى الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS لنظام المصادقة');
}

/**
 * تسجيل العمليات في قاعدة البيانات
 * @param {string} action - نوع العملية
 * @param {string} entityType - نوع الكيان (مستثمر، عملية، إلخ)
 * @param {string} entityId - معرف الكيان
 * @param {Object} details - تفاصيل العملية
 * @returns {Promise} وعد يشير إلى نجاح أو فشل العملية
 */
function logAction(action, entityType, entityId, details = {}) {
    if (!currentUser || !databaseRef) {
        return Promise.reject(new Error('غير مصرح بتسجيل العمليات'));
    }
    
    const logEntry = {
        action,
        entityType,
        entityId,
        timestamp: new Date().toISOString(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName,
        userType: currentUser.type,
        details
    };
    
    return databaseRef.ref(`system_logs/${entityType}`).push(logEntry);
}

/**
 * الربط بين العمليات والمستخدم الحالي
 * يتم استدعاء هذه الدالة عند إضافة/تعديل/حذف المستثمرين أو العمليات
 * @param {Object} data - البيانات المراد ربطها بالمستخدم
 * @returns {Object} - البيانات بعد إضافة معلومات المستخدم
 */
function attachUserInfo(data) {
    if (!currentUser) {
        return data;
    }
    
    // إضافة معلومات المستخدم إلى البيانات
    return {
        ...data,
        createdBy: {
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email,
            type: currentUser.type,
            timestamp: new Date().toISOString()
        }
    };
}

// تصدير الدوال للاستخدام الخارجي
window.EnhancedUserProfile = {
    init: initEnhancedUserProfile,
    showProfileModal,
    showChangePasswordModal,
    updateUserInfo,
    updateElementsAccess,
    getUserTypeLabel,
    showNotification
};

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initEnhancedUserProfile);