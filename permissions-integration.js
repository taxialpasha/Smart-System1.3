/**
 * تكامل نظام الصلاحيات مع نظام الاستثمار المتكامل
 * يقوم هذا الملف بدمج نظام الصلاحيات مع وظائف التطبيق الحالية
 * ويوفر تفاعلات إضافية لضمان تطبيق الصلاحيات بشكل كامل
 */

// كائن تكامل الصلاحيات
const PermissionsIntegration = (function() {
    // تخزين مؤقت للصلاحيات
    let permissionsCache = {};
    
    // قائمة وظائف التطبيق المحمية بالصلاحيات
    const protectedFunctions = [
        // إدارة المستثمرين
        { name: 'addNewInvestor', permission: 'canAddInvestors', description: 'إضافة مستثمر جديد' },
        { name: 'editInvestor', permission: 'canEditInvestors', description: 'تعديل بيانات المستثمر' },
        { name: 'deleteInvestor', permission: 'canDeleteInvestors', description: 'حذف مستثمر' },
        { name: 'showInvestorDetails', permission: true, description: 'عرض تفاصيل المستثمر' },
        
        // العمليات المالية
        { name: 'addDeposit', permission: 'canProcessDeposits', description: 'إضافة إيداع' },
        { name: 'withdrawAmount', permission: 'canProcessWithdrawals', description: 'سحب مبلغ' },
        { name: 'payProfit', permission: 'canPayProfits', description: 'دفع الأرباح' },
        { name: 'calculateProfitForInvestor', permission: true, description: 'حساب الأرباح للمستثمر' },
        
        // الإعدادات
        { name: 'saveGeneralSettings', permission: 'canManageSettings', description: 'حفظ الإعدادات العامة' },
        { name: 'saveProfitsSettings', permission: 'canManageSettings', description: 'حفظ إعدادات الأرباح' },
        { name: 'saveNotificationsSettings', permission: 'canManageSettings', description: 'حفظ إعدادات الإشعارات' },
        
        // النسخ الاحتياطي والتصدير
        { name: 'exportData', permission: 'canExportData', description: 'تصدير البيانات' },
        { name: 'createBackup', permission: 'canCreateBackup', description: 'إنشاء نسخة احتياطية' },
        { name: 'restoreBackup', permission: 'canRestoreBackup', description: 'استعادة نسخة احتياطية' }
    ];
    
    // قائمة الأزرار والعناصر المحمية بالصلاحيات
    const protectedElements = [
        // أزرار المستثمرين
        { selector: '#add-investor-btn', permission: 'canAddInvestors', description: 'إضافة مستثمر جديد' },
        { selector: '.edit-investor', permission: 'canEditInvestors', description: 'تعديل المستثمر' },
        { selector: '.delete-investor', permission: 'canDeleteInvestors', description: 'حذف المستثمر' },
        { selector: '#save-investor-btn', permission: 'canAddInvestors', description: 'حفظ بيانات المستثمر' },
        
        // أزرار العمليات
        { selector: '#add-deposit-btn', permission: 'canProcessDeposits', description: 'إضافة إيداع' },
        { selector: '#add-withdraw-btn', permission: 'canProcessWithdrawals', description: 'سحب مبلغ' },
        { selector: '#save-deposit-btn', permission: 'canProcessDeposits', description: 'حفظ الإيداع' },
        { selector: '#save-withdraw-btn', permission: 'canProcessWithdrawals', description: 'حفظ السحب' },
        { selector: '.edit-transaction', permission: 'canEditInvestors', description: 'تعديل العملية' },
        
        // أزرار الأرباح
        { selector: '#pay-profits-btn', permission: 'canPayProfits', description: 'دفع الأرباح' },
        { selector: '.pay-profit-btn', permission: 'canPayProfits', description: 'دفع الأرباح للمستثمر' },
        { selector: '#confirm-pay-profit', permission: 'canPayProfits', description: 'تأكيد دفع الأرباح' },
        
        // أزرار الإعدادات
        { selector: '#general-settings-form button[type="submit"]', permission: 'canManageSettings', description: 'حفظ الإعدادات العامة' },
        { selector: '#profits-settings-form button[type="submit"]', permission: 'canManageSettings', description: 'حفظ إعدادات الأرباح' },
        { selector: '#notifications-settings-form button[type="submit"]', permission: 'canManageSettings', description: 'حفظ إعدادات الإشعارات' },
        
        // أزرار التصدير والنسخ الاحتياطي
        { selector: 'button[title="تصدير"]', permission: 'canExportData', description: 'تصدير البيانات' },
        { selector: 'button[title="تنزيل نسخة احتياطية"]', permission: 'canCreateBackup', description: 'إنشاء نسخة احتياطية' },
        { selector: 'button[title="استعادة من نسخة احتياطية"]', permission: 'canRestoreBackup', description: 'استعادة نسخة احتياطية' },
        
        // زر الإضافة العائم
        { selector: '#add-new-fab', permission: ['canAddInvestors', 'canProcessDeposits', 'canProcessWithdrawals', 'canPayProfits'], description: 'إضافة جديد' }
    ];
    
    // قائمة الصفحات المحمية بالصلاحيات
    const protectedPages = {
        'investors': { permission: true, restrictedActions: {
            add: 'canAddInvestors',
            edit: 'canEditInvestors',
            delete: 'canDeleteInvestors'
        }},
        'transactions': { permission: true, restrictedActions: {
            add: ['canProcessDeposits', 'canProcessWithdrawals'],
            edit: 'canEditInvestors'
        }},
        'profits': { permission: true, restrictedActions: {
            pay: 'canPayProfits'
        }},
        'reports': { permission: 'canViewReports' },
        'settings': { permission: 'canManageSettings' },
        'user-management': { permission: 'canCreateUsers' }
    };
    
    /**
     * تحميل صلاحيات المستخدم الحالي
     * @returns {Promise<Object>} وعد يحتوي على صلاحيات المستخدم
     */
    function loadCurrentUserPermissions() {
        return new Promise((resolve) => {
            // إذا كان نظام الصلاحيات موجودًا، استخدمه
            if (window.PermissionsEnforcement) {
                resolve(window.PermissionsEnforcement.getCurrentPermissions());
                return;
            }
            
            // إذا لم يكن موجودًا، استخدم Firebase مباشرة
            if (!firebase || !firebase.auth) {
                resolve({});
                return;
            }
            
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                resolve({});
                return;
            }
            
            firebase.database().ref(`users/${currentUser.uid}/permissions`).once('value')
                .then(snapshot => {
                    const permissions = snapshot.val() || {};
                    permissionsCache = permissions;
                    resolve(permissions);
                })
                .catch(error => {
                    console.error('خطأ في تحميل صلاحيات المستخدم:', error);
                    resolve({});
                });
        });
    }
    
    /**
     * التحقق من وجود صلاحية
     * @param {string|Array} permission - الصلاحية أو مصفوفة من الصلاحيات
     * @returns {boolean} - ما إذا كان المستخدم يملك الصلاحية
     */
    function hasPermission(permission) {
        // إذا كان نظام الصلاحيات موجودًا، استخدمه
        if (window.PermissionsEnforcement) {
            return window.PermissionsEnforcement.hasPermission(permission);
        }
        
        // إذا كانت الصلاحية هي true، يسمح للجميع
        if (permission === true) return true;
        
        // إذا كانت الصلاحية عبارة عن مصفوفة
        if (Array.isArray(permission)) {
            return permission.some(p => permissionsCache[p] === true);
        }
        
        // التحقق من صلاحية واحدة
        return permissionsCache[permission] === true;
    }
    
    /**
     * تفويف الوظائف المحمية (استبدالها بنسخ تتحقق من الصلاحيات)
     */
    function overrideProtectedFunctions() {
        console.log('تفويف الوظائف المحمية بالصلاحيات...');
        
        protectedFunctions.forEach(func => {
            const { name, permission, description } = func;
            
            // التحقق من وجود الدالة
            if (typeof window[name] !== 'function') {
                console.warn(`الدالة ${name} غير موجودة`);
                return;
            }
            
            // حفظ الدالة الأصلية
            const originalFunc = window[name];
            
            // استبدال الدالة بنسخة تتحقق من الصلاحيات
            window[name] = function(...args) {
                // التحقق من وجود الصلاحية
                if (!hasPermission(permission)) {
                    console.warn(`تم منع تنفيذ ${name} (${description}) بسبب عدم وجود صلاحية ${permission}`);
                    showNoPermissionMessage(description);
                    return null;
                }
                
                // تنفيذ الدالة الأصلية
                return originalFunc.apply(this, args);
            };
            
            // تخزين مرجع للدالة الأصلية
            window[name]._original = originalFunc;
            
            console.log(`تم تفويف الدالة ${name} بالصلاحية ${permission}`);
        });
    }
    
    /**
     * تطبيق الصلاحيات على عناصر واجهة المستخدم
     */
    function applyUIRestrictions() {
        console.log('تطبيق الصلاحيات على عناصر واجهة المستخدم...');
        
        protectedElements.forEach(element => {
            const { selector, permission, description } = element;
            const elements = document.querySelectorAll(selector);
            
            if (elements.length === 0) {
                // قد تكون العناصر غير موجودة في الصفحة الحالية
                return;
            }
            
            elements.forEach(el => {
                if (!hasPermission(permission)) {
                    // تعطيل العنصر
                    el.disabled = true;
                    el.classList.add('permission-disabled');
                    el.setAttribute('title', `ليس لديك صلاحية: ${description}`);
                    
                    // إضافة مستمع حدث لمنع النقر
                    el.addEventListener('click', preventDefault);
                } else {
                    // تمكين العنصر
                    el.disabled = false;
                    el.classList.remove('permission-disabled');
                    el.removeAttribute('title');
                    
                    // إزالة مستمع الحدث
                    el.removeEventListener('click', preventDefault);
                }
            });
        });
    }
    
    /**
     * منع الحدث الافتراضي وعرض رسالة
     * @param {Event} e - الحدث
     */
    function preventDefault(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const description = this.getAttribute('title')?.replace('ليس لديك صلاحية: ', '') || 'هذا الإجراء';
        showNoPermissionMessage(description);
    }
    
    /**
     * عرض رسالة عدم وجود صلاحية
     * @param {string} action - وصف الإجراء
     */
    function showNoPermissionMessage(action) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(`ليس لديك صلاحية لـ${action}. يرجى التواصل مع مسؤول النظام.`, 'error');
        } else {
            alert(`ليس لديك صلاحية لـ${action}. يرجى التواصل مع مسؤول النظام.`);
        }
    }
    
    /**
     * تطبيق الصلاحيات على التنقل بين الصفحات
     */
    function restrictNavigation() {
        console.log('تطبيق الصلاحيات على التنقل بين الصفحات...');
        
        // منع الوصول إلى الصفحات المحمية
        document.addEventListener('click', function(e) {
            const navLink = e.target.closest('.nav-link[data-page]');
            if (!navLink) return;
            
            const page = navLink.getAttribute('data-page');
            const pageConfig = protectedPages[page];
            
            if (pageConfig && !hasPermission(pageConfig.permission)) {
                e.preventDefault();
                e.stopPropagation();
                showNoPermissionMessage(`الوصول إلى صفحة ${page}`);
            }
        });
        
        // تطبيق الصلاحيات على روابط التنقل في الشريط الجانبي
        for (const [page, config] of Object.entries(protectedPages)) {
            const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
            if (!navLink) continue;
            
            // إخفاء الروابط التي لا يملك المستخدم صلاحية للوصول إليها
            if (!hasPermission(config.permission)) {
                const navItem = navLink.closest('.nav-item');
                if (navItem) {
                    navItem.style.display = 'none';
                } else {
                    navLink.style.display = 'none';
                }
            }
        }
    }
    
    /**
     * إضافة مستمعي الأحداث لتحديث الصلاحيات
     */
    function setupEventListeners() {
        // تحديث الصلاحيات عند تغيير الصفحة
        document.addEventListener('page:change', function(e) {
            if (!e.detail || !e.detail.page) return;
            
            console.log(`تحديث صلاحيات في صفحة: ${e.detail.page}`);
            setTimeout(refreshPermissions, 100);
        });
        
        // تحديث الصلاحيات عند فتح النوافذ المنبثقة
        document.addEventListener('modal:opened', function(e) {
            if (!e.detail || !e.detail.modalId) return;
            
            console.log(`تحديث صلاحيات في النافذة: ${e.detail.modalId}`);
            setTimeout(refreshPermissions, 100);
        });
        
        // مراقبة التسجيل/الخروج
        if (firebase && firebase.auth) {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    console.log('تم تسجيل الدخول، جاري تحديث الصلاحيات...');
                    loadCurrentUserPermissions().then(() => {
                        refreshPermissions();
                    });
                } else {
                    console.log('تم تسجيل الخروج، إعادة تعيين الصلاحيات...');
                    permissionsCache = {};
                    resetFunctions();
                }
            });
        }
    }
    
    /**
     * تحديث تطبيق الصلاحيات
     */
    function refreshPermissions() {
        return loadCurrentUserPermissions()
            .then(() => {
                applyUIRestrictions();
                restrictNavigation();
                return true;
            });
    }
    
    /**
     * إعادة تعيين الدوال إلى الأصلية
     */
    function resetFunctions() {
        protectedFunctions.forEach(func => {
            const { name } = func;
            if (typeof window[name] === 'function' && window[name]._original) {
                window[name] = window[name]._original;
            }
        });
    }
    
    /**
     * إضافة أنماط CSS للعناصر المعطلة بسبب الصلاحيات
     */
    function addPermissionStyles() {
        const styleElement = document.createElement('style');
        styleElement.id = 'permission-styles';
        styleElement.textContent = `
            .permission-disabled {
                opacity: 0.6;
                cursor: not-allowed !important;
                position: relative;
            }
            
            .permission-disabled:hover::before {
                content: attr(title);
                position: absolute;
                bottom: 120%;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
            }
            
            .permission-disabled:hover::after {
                content: '';
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 4px;
                border-style: solid;
                border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
                z-index: 1000;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    /**
     * تهيئة نظام تكامل الصلاحيات
     */
    function init() {
        console.log('تهيئة نظام تكامل الصلاحيات...');
        
        // إضافة أنماط CSS
        addPermissionStyles();
        
        // تحميل صلاحيات المستخدم الحالي
        return loadCurrentUserPermissions()
            .then(() => {
                // تفويف الوظائف المحمية
                overrideProtectedFunctions();
                
                // تطبيق الصلاحيات على واجهة المستخدم
                applyUIRestrictions();
                
                // تطبيق الصلاحيات على التنقل
                restrictNavigation();
                
                // إضافة مستمعي الأحداث
                setupEventListeners();
                
                console.log('تم تهيئة نظام تكامل الصلاحيات بنجاح');
                return true;
            })
            .catch(error => {
                console.error('خطأ في تهيئة نظام تكامل الصلاحيات:', error);
                return false;
            });
    }
    
    // تصدير الواجهة العامة
    return {
        init,
        hasPermission,
        refreshPermissions,
        getCurrentPermissions: () => ({...permissionsCache})
    };
})();

// Initialize Firebase (ensure firebaseConfig is already defined in your project)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

/**
 * Validate and sanitize the permissions object.
 * Ensures all required properties are defined and have valid boolean values.
 * @param {object} permissions - The permissions object to validate.
 * @returns {object} - A sanitized permissions object.
 */
function sanitizePermissions(permissions) {
    const defaultPermissions = {
        canAddInvestors: false,
        canEditInvestors: false,
        canDeleteInvestors: false,
        canProcessDeposits: false,
        canProcessWithdrawals: false,
        canPayProfits: false,
        canManageSettings: false,
        canExportData: false,
        canImportData: false,
        canCreateBackup: false,
        canRestoreBackup: false,
        canCreateUsers: false,
        canDeleteUsers: false,
        canViewReports: false
    };

    return Object.keys(defaultPermissions).reduce((sanitized, key) => {
        sanitized[key] = typeof permissions[key] === 'boolean' ? permissions[key] : defaultPermissions[key];
        return sanitized;
    }, {});
}

/**
 * Function to save user permissions to Firebase
 * @param {string} userId - The ID of the user
 * @param {object} permissions - The permissions object
 */
function saveUserPermissions(userId, permissions) {
    const sanitizedPermissions = sanitizePermissions(permissions);

    const permissionsRef = database.ref(`/users/${userId}/permissions`);
    permissionsRef.set(sanitizedPermissions)
        .then(() => {
            console.log(`Permissions saved successfully for user: ${userId}`);
        })
        .catch((error) => {
            console.error(`Error saving permissions for user ${userId}:`, error);
        });
}

// Example usage
const userId = "3n7CThc02MdIUbLLvDtAFmUCbKq1"; // Replace with the actual user ID
const permissions = {
    canAddInvestors: true,
    canEditInvestors: true,
    canDeleteInvestors: false,
    canProcessDeposits: true,
    canProcessWithdrawals: true,
    canPayProfits: false,
    canManageSettings: true,
    canExportData: true,
    canImportData: false,
    canCreateBackup: true,
    canRestoreBackup: false,
    canCreateUsers: true,
    canDeleteUsers: false,
    canViewReports: true
};

saveUserPermissions(userId, permissions);

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود نظام الصلاحيات الرئيسي
    if (window.PermissionsEnforcement) {
        console.log('تم اكتشاف نظام الصلاحيات الرئيسي، استخدامه بدلاً من نظام التكامل');
        
        // تحميل الصلاحيات الحالية للمستخدم
        if (typeof window.PermissionsEnforcement.init === 'function') {
            window.PermissionsEnforcement.init();
        }
    } else {
        // استخدام نظام تكامل الصلاحيات
        console.log('لم يتم العثور على نظام الصلاحيات الرئيسي، استخدام نظام التكامل بدلاً منه');
        PermissionsIntegration.init();
    }
});

// تصدير نظام تكامل الصلاحيات للاستخدام العام
window.PermissionsIntegration = PermissionsIntegration;