/**
 * وحدة إدارة المستخدمين المتكاملة لنظام الاستثمار
 * تتضمن الوظائف الكاملة لإدارة المستخدمين وعرضهم وتنفيذ العمليات عليهم
 */

// أنواع المستخدمين
const USER_TYPES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user'
};
const UserManagement = {
    // وظائف إدارة المستخدمين هنا
    initUserManagement: function() { /* ... */ },
    showModal: function(title, content) { /* ... */ },
    closeModal: function() { /* ... */ },
    // ...باقي الوظائف
};
// وصف الصلاحيات
const PERMISSIONS = {
    canCreateUsers: "إنشاء مستخدمين جدد",
    canDeleteUsers: "حذف المستخدمين",
    canManageSettings: "إدارة إعدادات النظام",
    canDeleteInvestors: "حذف المستثمرين",
    canExportData: "تصدير البيانات",
    canImportData: "استيراد البيانات",
    canCreateBackup: "إنشاء نسخة احتياطية",
    canRestoreBackup: "استعادة نسخة احتياطية"
};

// المتغيرات العامة
let currentUser = null;
let databaseRef = null;
let currentLogsPage = 1;
let logsPerPage = 20;
let totalLogsPages = 1;
let logsCache = {};

/**
 * تهيئة وحدة إدارة المستخدمين
 */
function initUserManagement() {
    console.log('تهيئة وحدة إدارة المستخدمين...');
    
    // الحصول على مرجع لقاعدة البيانات إذا كان متاحًا
    if (window.firebase && window.firebase.database) {
        databaseRef = window.firebase.database();
    }
    
    // الحصول على المستخدم الحالي
    if (window.AuthSystem && typeof window.AuthSystem.getUserInfo === 'function') {
        currentUser = window.AuthSystem.getUserInfo();
    }
    
    // إضافة مستمع للتغييرات في حالة المصادقة
    if (window.AuthSystem && typeof window.AuthSystem.addAuthObserver === 'function') {
        window.AuthSystem.addAuthObserver(handleAuthChange);
    }
    
    // إضافة زر إدارة المستخدمين إلى الشريط الجانبي
    addUserManagementNavLink();
    
    // إضافة أنماط CSS
    addUserManagementStyles();
    
    console.log('تم تهيئة وحدة إدارة المستخدمين بنجاح');
}

/**
 * معالجة تغييرات حالة المصادقة
 * @param {Object} event - حدث المصادقة
 */
function handleAuthChange(event) {
    if (event.type === 'login') {
        // تحديث المستخدم الحالي
        currentUser = event.user;
        
        // تحديث واجهة المستخدم إذا كانت صفحة إدارة المستخدمين مفتوحة
        if (document.getElementById('user-management-page') && document.getElementById('user-management-page').classList.contains('active')) {
            loadUsers();
        }
    } else if (event.type === 'logout') {
        currentUser = null;
    }
}

/**
 * إضافة رابط إدارة المستخدمين إلى الشريط الجانبي
 */
function addUserManagementNavLink() {
    // التحقق من وجود الرابط مسبقًا
    if (document.querySelector('a[data-page="user-management"]')) {
        return;
    }
    
    // البحث عن قائمة التنقل
    const sidebarNav = document.querySelector('.sidebar .nav-list');
    if (!sidebarNav) {
        console.warn('لم يتم العثور على قائمة التنقل في الشريط الجانبي');
        return;
    }
    
    // إنشاء عنصر قائمة جديد
    const userManagementItem = document.createElement('li');
    userManagementItem.className = 'nav-item admin-only';
    userManagementItem.setAttribute('data-permission', 'canCreateUsers');
    
    // إضافة رابط إدارة المستخدمين
    userManagementItem.innerHTML = `
        <a class="nav-link" data-page="user-management" href="#">
            <div class="nav-icon">
                <i class="fas fa-user-shield"></i>
            </div>
            <span>إدارة المستخدمين</span>
        </a>
    `;
    
    // إدراج العنصر قبل رابط الإعدادات
    const settingsNavItem = document.querySelector('.nav-item a[data-page="settings"]')?.parentNode;
    if (settingsNavItem) {
        sidebarNav.insertBefore(userManagementItem, settingsNavItem);
    } else {
        sidebarNav.appendChild(userManagementItem);
    }
    
    // إضافة مستمع حدث للتنقل
    const navLink = userManagementItem.querySelector('.nav-link');
    if (navLink) {
        navLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة التنشيط من جميع الروابط
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // تنشيط الرابط الحالي
            this.classList.add('active');
            
            // عرض صفحة إدارة المستخدمين
            navigateToUserManagement();
        });
    }
    
    console.log('تم إضافة رابط إدارة المستخدمين إلى الشريط الجانبي');
}

/**
 * إضافة أنماط CSS لإدارة المستخدمين
 */
function addUserManagementStyles() {
    // التحقق من وجود الأنماط مسبقًا
    if (document.getElementById('user-management-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'user-management-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* أنماط صفحة إدارة المستخدمين */
        .user-management-page .section {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .user-management-page .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .user-management-page .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
        }
        
        .user-management-page .section-actions {
            display: flex;
            gap: 10px;
        }
        
        /* أنماط جدول المستخدمين */
        .user-management-page .table-container {
            overflow-x: auto;
        }
        
        .user-management-page table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .user-management-page table th {
            background-color: #f9fafb;
            padding: 12px 16px;
            text-align: right;
            font-weight: 600;
            color: #4b5563;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .user-management-page table td {
            padding: 12px 16px;
            border-bottom: 1px solid #f3f4f6;
            color: #1f2937;
        }
        
        .user-management-page table tr:last-child td {
            border-bottom: none;
        }
        
        .user-management-page table tr:hover td {
            background-color: #f9fafb;
        }
        
        /* أنماط معلومات المستخدم */
        .user-info-cell {
            display: flex;
            align-items: center;
        }
        
        .user-avatar.small {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: #3b82f6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.8rem;
            margin-left: 10px;
        }
        
        .user-info-cell .user-name {
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 2px;
        }
        
        .user-info-cell .user-role {
            font-size: 0.75rem;
            color: #6b7280;
        }
        
        /* أنماط الشارات */
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .badge-primary {
            background-color: #dbeafe;
            color: #1e40af;
        }
        
        .badge-success {
            background-color: #d1fae5;
            color: #065f46;
        }
        
        .badge-danger {
            background-color: #fee2e2;
            color: #b91c1c;
        }
        
        .badge-warning {
            background-color: #fef3c7;
            color: #92400e;
        }
        
        .badge-info {
            background-color: #e0f2fe;
            color: #0369a1;
        }
        
        /* أنماط خلايا الإجراءات */
        .actions-cell {
            display: flex;
            gap: 5px;
        }
        
        /* أنماط تصفية المستخدمين */
        .user-filters {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        /* إضافة مستخدم */
        .add-user-form {
            margin-top: 20px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #4b5563;
        }
        
        .form-input,
        .form-select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            color: #1f2937;
        }
        
        .form-input:focus,
        .form-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        .password-input-container {
            position: relative;
        }
        
        .toggle-password {
            position: absolute;
            top: 50%;
            left: 10px;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
        }
        
        /* أنماط إدارة الصلاحيات */
        .permissions-list {
            margin-top: 15px;
        }
        
        .permission-item {
            display: flex;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .permission-item:last-child {
            border-bottom: none;
        }
        
        .permission-item label {
            display: flex;
            align-items: center;
            margin: 0;
            cursor: pointer;
        }
        
        .permission-item input[type="checkbox"] {
            margin-left: 8px;
        }
        
        .permission-title {
            font-weight: 500;
            color: #4b5563;
        }
        
        /* أنماط للمستخدم الحالي */
        tr.current-user {
            background-color: #fef3c7 !important;
        }
        
        tr.admin-row {
            background-color: rgba(254, 202, 202, 0.2);
        }
        
        tr.manager-row {
            background-color: rgba(254, 240, 138, 0.2);
        }
        
        /* أنماط شاشة التحميل */
        .loader {
            border: 3px solid #f3f4f6;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* أنماط التنبيهات */
        .alert {
            padding: 12px 16px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        
        .alert-info {
            background-color: #e0f2fe;
            color: #0369a1;
            border: 1px solid #bae6fd;
        }
        
        .alert-warning {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }
        
        .alert-success {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        
        .alert-danger {
            background-color: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fecaca;
        }
        
        .alert-icon {
            margin-left: 10px;
        }
        
        /* تخصيص المستخدم */
        .user-detail-modal .user-avatar.medium {
            width: 80px;
            height: 80px;
            font-size: 2rem;
            margin: 0 auto 20px;
        }
        
        .user-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        
        .user-stat-item {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        
        .user-stat-value {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 5px;
        }
        
        .user-stat-label {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        /* توافق الموبايل */
        @media (max-width: 768px) {
            .actions-cell {
                flex-direction: column;
                gap: 5px;
            }
            
            .user-management-page .section-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            
            .user-management-page .section-actions {
                width: 100%;
            }
            
            .user-filters {
                flex-wrap: wrap;
            }
        }
    `;
    
    // إضافة عنصر النمط إلى الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS لإدارة المستخدمين');
}

/**
 * الانتقال إلى صفحة إدارة المستخدمين
 */
function navigateToUserManagement() {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // البحث عن صفحة إدارة المستخدمين
    let userManagementPage = document.getElementById('user-management-page');
    
    // إنشاء صفحة إدارة المستخدمين إذا لم تكن موجودة
    if (!userManagementPage) {
        userManagementPage = createUserManagementPage();
    }
    
    // عرض صفحة إدارة المستخدمين
    userManagementPage.classList.add('active');
    
    // تحميل بيانات المستخدمين
    loadUsers();
}

/**
 * إنشاء صفحة إدارة المستخدمين
 * @returns {HTMLElement} - عنصر صفحة إدارة المستخدمين
 */
function createUserManagementPage() {
    // إنشاء عنصر الصفحة
    const page = document.createElement('div');
    page.id = 'user-management-page';
    page.className = 'page user-management-page';
    
    // محتوى الصفحة
    page.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">إدارة المستخدمين</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" placeholder="بحث عن مستخدم..." type="text" id="user-search-input" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-primary" id="add-user-btn">
                    <i class="fas fa-plus"></i>
                    <span>إضافة مستخدم</span>
                </button>
            </div>
        </div>
        
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">قائمة المستخدمين</h2>
                <div class="section-actions">
                    <div class="btn-group">
                        <button class="btn btn-outline active" data-filter="all">الكل</button>
                        <button class="btn btn-outline" data-filter="admin">المسؤولين</button>
                        <button class="btn btn-outline" data-filter="manager">المدراء</button>
                        <button class="btn btn-outline" data-filter="user">المستخدمين</button>
                    </div>
                    <button class="btn btn-outline" id="refresh-users-btn">
                        <i class="fas fa-sync-alt"></i>
                        <span>تحديث</span>
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table id="users-table" class="data-table">
                    <thead>
                        <tr>
                            <th>المعرف</th>
                            <th>المستخدم</th>
                            <th>البريد الإلكتروني</th>
                            <th>نوع المستخدم</th>
                            <th>تاريخ الإنشاء</th>
                            <th>آخر تسجيل دخول</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="7" class="text-center">جارٍ تحميل بيانات المستخدمين...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // إضافة الصفحة إلى المحتوى الرئيسي
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.appendChild(page);
    } else {
        document.body.appendChild(page);
    }
    
    // إضافة مستمعي الأحداث
    setupUserManagementListeners(page);
    
    console.log('تم إنشاء صفحة إدارة المستخدمين');
    return page;
}

/**
 * إضافة مستمعي الأحداث لصفحة إدارة المستخدمين
 * @param {HTMLElement} page - عنصر صفحة إدارة المستخدمين
 */
function setupUserManagementListeners(page) {
    // زر إضافة مستخدم
    const addUserBtn = page.querySelector('#add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', showAddUserModal);
    }
    
    // زر تحديث قائمة المستخدمين
    const refreshUsersBtn = page.querySelector('#refresh-users-btn');
    if (refreshUsersBtn) {
        refreshUsersBtn.addEventListener('click', loadUsers);
    }
    
    // أزرار تصفية المستخدمين
    const filterButtons = page.querySelectorAll('.btn-group .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // تحديث الزر النشط
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // تطبيق التصفية
            const filterType = this.getAttribute('data-filter');
            filterUsers(filterType);
        });
    });
    
    // مربع البحث
    const searchInput = page.querySelector('#user-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchUsers(this.value);
        });
    }
    
    // زر تبديل الشريط الجانبي
    const toggleSidebarBtn = page.querySelector('.toggle-sidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }
}

/**
 * تحميل بيانات المستخدمين
 */
function loadUsers() {
    // التحقق من صلاحيات المستخدم
    if (!currentUser || !hasPermission('canCreateUsers')) {
        showNotification('ليس لديك صلاحية لإدارة المستخدمين', 'error');
        return;
    }
    
    // عرض رسالة التحميل
    const tableBody = document.querySelector('#users-table tbody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="loader"></div></td></tr>';
    }
    
    // الحصول على بيانات المستخدمين من Firebase
    if (databaseRef) {
        databaseRef.ref('users').once('value')
            .then(snapshot => {
                const users = [];
                
                // جمع بيانات المستخدمين
                snapshot.forEach(childSnapshot => {
                    const userId = childSnapshot.key;
                    const userData = childSnapshot.val();
                    
                    if (userData) {
                        const userProfile = userData.profile || {};
                        
                        users.push({
                            uid: userId,
                            email: userProfile.email || 'غير محدد',
                            fullName: userProfile.fullName || userProfile.displayName || 'غير محدد',
                            type: userProfile.type || 'user',
                            permissions: userProfile.permissions || getDefaultPermissions('user'),
                            createdAt: userProfile.createdAt || null,
                            lastLogin: userProfile.lastLogin || null,
                            emailVerified: userProfile.emailVerified || false
                        });
                    }
                });
                
                // عرض المستخدمين
                renderUsersTable(users);
            })
            .catch(error => {
                console.error('خطأ في تحميل بيانات المستخدمين:', error);
                
                if (tableBody) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center">
                                <div class="alert alert-danger">
                                    <i class="fas fa-exclamation-circle alert-icon"></i>
                                    حدث خطأ أثناء تحميل بيانات المستخدمين.
                                </div>
                            </td>
                        </tr>
                    `;
                }
            });
    } else {
        // استخدام بيانات تجريبية للعرض التوضيحي
        const demoUsers = getDemoUsers();
        renderUsersTable(demoUsers);
    }
}

/**
 * الحصول على بيانات المستخدمين التجريبية
 * @returns {Array} - قائمة المستخدمين التجريبية
 */
function getDemoUsers() {
    return [
        {
            uid: '1',
            email: 'admin@example.com',
            fullName: 'مدير النظام',
            type: 'admin',
            permissions: getDefaultPermissions('admin'),
            createdAt: '2023-01-01T00:00:00.000Z',
            lastLogin: new Date().toISOString(),
            emailVerified: true
        },
        {
            uid: '2',
            email: 'manager@example.com',
            fullName: 'مدير التطبيق',
            type: 'manager',
            permissions: getDefaultPermissions('manager'),
            createdAt: '2023-02-01T00:00:00.000Z',
            lastLogin: '2023-06-15T10:30:00.000Z',
            emailVerified: true
        },
        {
            uid: '3',
            email: 'user@example.com',
            fullName: 'مستخدم عادي',
            type: 'user',
            permissions: getDefaultPermissions('user'),
            createdAt: '2023-03-01T00:00:00.000Z',
            lastLogin: '2023-06-20T14:45:00.000Z',
            emailVerified: false
        }
    ];
}

/**
 * عرض بيانات المستخدمين في الجدول
 * @param {Array} users - قائمة المستخدمين
 */
function renderUsersTable(users) {
    const tableBody = document.querySelector('#users-table tbody');
    if (!tableBody) return;
    
    // مسح محتوى الجدول
    tableBody.innerHTML = '';
    
    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle alert-icon"></i>
                        لا يوجد مستخدمين في النظام.
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // ترتيب المستخدمين حسب النوع والتاريخ
    const sortedUsers = users.sort((a, b) => {
        // ترتيب حسب النوع أولاً (المسؤولين ثم المدراء ثم المستخدمين)
        const typeA = a.type === 'admin' ? 0 : (a.type === 'manager' ? 1 : 2);
        const typeB = b.type === 'admin' ? 0 : (b.type === 'manager' ? 1 : 2);
        
        if (typeA !== typeB) {
            return typeA - typeB;
        }
        
        // ثم حسب تاريخ الإنشاء (الأحدث أولاً)
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        
        return dateB - dateA;
    });
    
    // إنشاء صفوف الجدول
    sortedUsers.forEach(user => {
        const row = document.createElement('tr');
        
        // تحديد كلاس الصف حسب نوع المستخدم
        if (user.type === 'admin') {
            row.classList.add('admin-row');
        } else if (user.type === 'manager') {
            row.classList.add('manager-row');
        }
        
        // إذا كان هذا هو المستخدم الحالي، نضيف علامة مميزة
        if (currentUser && user.uid === currentUser.uid) {
            row.classList.add('current-user');
        }
        
        row.setAttribute('data-id', user.uid);
        row.setAttribute('data-type', user.type);
        row.setAttribute('data-email', user.email);
        
        // تنسيق التواريخ
        const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : '-';
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-SA') : '-';
        
        row.innerHTML = `
            <td>${user.uid.substring(0, 8)}</td>
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar small">${user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</div>
                    <div>
                        <div class="user-name">${user.fullName || 'مستخدم'}</div>
                        <div class="user-role">${getUserTypeLabel(user.type)}</div>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="badge badge-${getUserTypeBadgeClass(user.type)}">${getUserTypeLabel(user.type)}</span></td>
            <td>${createdAt}</td>
            <td>${lastLogin}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-sm btn-outline edit-user-btn" data-id="${user.uid}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline permissions-user-btn" data-id="${user.uid}" title="الصلاحيات">
                        <i class="fas fa-key"></i>
                    </button>
                    ${user.uid !== (currentUser ? currentUser.uid : '') ? `
                        <button class="btn btn-sm btn-outline danger delete-user-btn" data-id="${user.uid}" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث لأزرار الإجراءات
    setupUserTableActions();
}

/**
 * إضافة مستمعي الأحداث لأزرار جدول المستخدمين
 */
function setupUserTableActions() {
    // أزرار تعديل المستخدم
    const editButtons = document.querySelectorAll('.edit-user-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            showEditUserModal(userId);
        });
    });
    
    // أزرار إدارة الصلاحيات
    const permissionsButtons = document.querySelectorAll('.permissions-user-btn');
    permissionsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            showUserPermissionsModal(userId);
        });
    });
    
    // أزرار حذف المستخدم
    const deleteButtons = document.querySelectorAll('.delete-user-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            confirmDeleteUser(userId);
        });
    });
}

/**
 * إظهار نافذة إضافة مستخدم جديد
 */
function showAddUserModal() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canCreateUsers')) {
        showNotification('ليس لديك صلاحية لإضافة مستخدمين جدد', 'error');
        return;
    }
    
    // إنشاء محتوى النافذة
    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">إضافة مستخدم جديد</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <form id="add-user-form">
                <div class="form-group">
                    <label class="form-label">الاسم الكامل</label>
                    <input type="text" class="form-input" id="user-fullname" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">البريد الإلكتروني</label>
                    <input type="email" class="form-input" id="user-email" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">كلمة المرور</label>
                    <div class="password-input-container">
                        <input type="password" class="form-input" id="user-password" required>
                        <button type="button" class="toggle-password">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">تأكيد كلمة المرور</label>
                    <div class="password-input-container">
                        <input type="password" class="form-input" id="user-confirm-password" required>
                        <button type="button" class="toggle-password">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">نوع المستخدم</label>
                    <select class="form-select" id="user-type">
                        <option value="user">مستخدم عادي</option>
                        <option value="manager">مدير</option>
                        ${currentUser && currentUser.type === 'admin' ? '<option value="admin">مسؤول</option>' : ''}
                    </select>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إلغاء</button>
            <button class="btn btn-primary" id="save-user-btn">إضافة</button>
        </div>
    `;
    
    // عرض النافذة
    showModal('add-user-modal', modalContent, function(modal) {
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
        
        // مستمع حدث زر الإضافة
        const saveUserBtn = modal.querySelector('#save-user-btn');
        if (saveUserBtn) {
            saveUserBtn.addEventListener('click', function() {
                addNewUser();
            });
        }
    });
}

/**
 * إضافة مستخدم جديد
 */
function addNewUser() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canCreateUsers')) {
        showNotification('ليس لديك صلاحية لإضافة مستخدمين جدد', 'error');
        return;
    }
    
    // الحصول على قيم الحقول
    const fullName = document.getElementById('user-fullname').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;
    const confirmPassword = document.getElementById('user-confirm-password').value;
    const userType = document.getElementById('user-type').value;
    
    // التحقق من إدخال جميع الحقول
    if (!fullName || !email || !password || !confirmPassword) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // التحقق من تطابق كلمتي المرور
    if (password !== confirmPassword) {
        showNotification('كلمة المرور وتأكيدها غير متطابقين', 'error');
        return;
    }
    
    // التحقق من طول كلمة المرور
    if (password.length < 6) {
        showNotification('يجب أن تكون كلمة المرور 6 أحرف على الأقل', 'error');
        return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    if (!validateEmail(email)) {
        showNotification('البريد الإلكتروني غير صالح', 'error');
        return;
    }
    
    // التحقق من صلاحية إنشاء مسؤول
    if (userType === 'admin' && (!currentUser || currentUser.type !== 'admin')) {
        showNotification('ليس لديك صلاحية لإنشاء حساب مسؤول', 'error');
        return;
    }
    
    // إنشاء كائن بيانات المستخدم
    const newUser = {
        profile: {
            fullName: fullName,
            email: email,
            type: userType,
            permissions: getDefaultPermissions(userType),
            createdAt: new Date().toISOString(),
            lastLogin: null,
            emailVerified: false,
            createdBy: currentUser ? currentUser.uid : 'system'
        }
    };
    
    // حفظ المستخدم في قاعدة البيانات
    if (databaseRef) {
        // إنشاء معرف فريد للمستخدم
        const newUserId = databaseRef.ref('users').push().key;
        
        // حفظ بيانات المستخدم
        databaseRef.ref('users/' + newUserId).set(newUser)
            .then(() => {
                // إنشاء حساب المصادقة
                if (window.firebase && window.firebase.auth) {
                    return window.firebase.auth().createUserWithEmailAndPassword(email, password);
                } else {
                    // تخطي إنشاء حساب المصادقة في حالة عدم توفر Firebase Auth
                    return Promise.resolve();
                }
            })
            .then(() => {
                showNotification('تم إضافة المستخدم بنجاح', 'success');
                closeModal();
                loadUsers();
                
                // تسجيل النشاط في السجل
                logActivity({
                    type: 'user_created',
                    details: `تم إنشاء مستخدم جديد: ${fullName} (${email})`,
                    targetId: newUserId,
                    targetType: 'user'
                });
            })
            .catch(error => {
                console.error('خطأ في إضافة المستخدم:', error);
                showNotification(getErrorMessage(error) || 'حدث خطأ أثناء إضافة المستخدم', 'error');
            });
    } else {
        // محاكاة إضافة المستخدم في وضع العرض التوضيحي
        const newUserId = 'user_' + Date.now();
        showNotification('تم إضافة المستخدم بنجاح (وضع العرض التوضيحي)', 'success');
        closeModal();
        
        // إضافة المستخدم الجديد إلى قائمة العرض
        const demoUsers = getDemoUsers();
        demoUsers.push({
            uid: newUserId,
            email: email,
            fullName: fullName,
            type: userType,
            permissions: getDefaultPermissions(userType),
            createdAt: new Date().toISOString(),
            lastLogin: null,
            emailVerified: false
        });
        
        renderUsersTable(demoUsers);
    }
}

/**
 * عرض نافذة تعديل بيانات المستخدم
 * @param {string} userId - معرف المستخدم
 */
function showEditUserModal(userId) {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canCreateUsers')) {
        showNotification('ليس لديك صلاحية لتعديل بيانات المستخدمين', 'error');
        return;
    }
    
    // الحصول على بيانات المستخدم من الجدول
    const userRow = document.querySelector(`tr[data-id="${userId}"]`);
    if (!userRow) {
        showNotification('لم يتم العثور على بيانات المستخدم', 'error');
        return;
    }
    
    const userType = userRow.getAttribute('data-type');
    const userEmail = userRow.getAttribute('data-email');
    const userName = userRow.querySelector('.user-name').textContent;
    
    // إنشاء محتوى النافذة
    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">تعديل بيانات المستخدم</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <form id="edit-user-form">
                <input type="hidden" id="edit-user-id" value="${userId}">
                
                <div class="form-group">
                    <label class="form-label">الاسم الكامل</label>
                    <input type="text" class="form-input" id="edit-user-fullname" value="${userName}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">البريد الإلكتروني</label>
                    <input type="email" class="form-input" id="edit-user-email" value="${userEmail}" required ${currentUser && userId === currentUser.uid ? 'disabled' : ''}>
                </div>
                
                <div class="form-group">
                    <label class="form-label">كلمة المرور الجديدة (اتركها فارغة للاحتفاظ بالحالية)</label>
                    <div class="password-input-container">
                        <input type="password" class="form-input" id="edit-user-password">
                        <button type="button" class="toggle-password">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">نوع المستخدم</label>
                    <select class="form-select" id="edit-user-type" ${currentUser && userId === currentUser.uid ? 'disabled' : ''}>
                        <option value="user" ${userType === 'user' ? 'selected' : ''}>مستخدم عادي</option>
                        <option value="manager" ${userType === 'manager' ? 'selected' : ''}>مدير</option>
                        ${currentUser && currentUser.type === 'admin' ? `<option value="admin" ${userType === 'admin' ? 'selected' : ''}>مسؤول</option>` : ''}
                    </select>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إلغاء</button>
            <button class="btn btn-primary" id="update-user-btn">حفظ التغييرات</button>
        </div>
    `;
    
    // عرض النافذة
    showModal('edit-user-modal', modalContent, function(modal) {
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
        
        // مستمع حدث زر التحديث
        const updateUserBtn = modal.querySelector('#update-user-btn');
        if (updateUserBtn) {
            updateUserBtn.addEventListener('click', function() {
                updateUser();
            });
        }
    });
}

/**
 * تحديث بيانات المستخدم
 */
function updateUser() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canCreateUsers')) {
        showNotification('ليس لديك صلاحية لتعديل بيانات المستخدمين', 'error');
        return;
    }
    
    // الحصول على قيم الحقول
    const userId = document.getElementById('edit-user-id').value;
    const fullName = document.getElementById('edit-user-fullname').value.trim();
    const email = document.getElementById('edit-user-email').value.trim();
    const password = document.getElementById('edit-user-password').value;
    const userType = document.getElementById('edit-user-type').value;
    
    // التحقق من إدخال الحقول الإلزامية
    if (!fullName || !email) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    if (!validateEmail(email)) {
        showNotification('البريد الإلكتروني غير صالح', 'error');
        return;
    }
    
    // التحقق من صلاحية تعديل نوع المستخدم
    if (currentUser && userId === currentUser.uid && userType !== currentUser.type) {
        showNotification('لا يمكنك تغيير نوع حسابك الخاص', 'error');
        return;
    }
    
    // التحقق من صلاحية تعديل حساب مسؤول
    if (userType === 'admin' && (!currentUser || currentUser.type !== 'admin')) {
        showNotification('ليس لديك صلاحية لتعيين مستخدم كمسؤول', 'error');
        return;
    }
    
    // إنشاء كائن بيانات التحديث
    const userUpdates = {
        'profile.fullName': fullName,
        'profile.type': userType
    };
    
    // إذا تم تغيير البريد الإلكتروني، قم بتحديثه
    if (currentUser && userId !== currentUser.uid) {
        userUpdates['profile.email'] = email;
    }
    
    // تحديث بيانات المستخدم في قاعدة البيانات
    if (databaseRef) {
        // تحديث بيانات الملف الشخصي
        databaseRef.ref(`users/${userId}`).update(userUpdates)
            .then(() => {
                // تحديث كلمة المرور إذا تم تغييرها
                if (password && window.firebase && window.firebase.auth) {
                    // يتطلب تغيير كلمة المرور إعادة المصادقة في بعض الحالات،
                    // لكن في هذه الحالة نفترض أن المسؤول لديه صلاحيات إدارية
                    // للقيام بذلك مباشرة عبر Admin SDK
                    
                    // هذا مثال مبسط، في التطبيق الحقيقي قد تحتاج لاستخدام Admin SDK
                    // أو واجهة برمجة مخصصة من الخادم
                    console.log(`تحديث كلمة المرور للمستخدم: ${userId}`);
                }
                
                showNotification('تم تحديث بيانات المستخدم بنجاح', 'success');
                closeModal();
                loadUsers();
                
                // تسجيل النشاط في السجل
                logActivity({
                    type: 'user_updated',
                    details: `تم تحديث بيانات المستخدم: ${fullName} (${email})`,
                    targetId: userId,
                    targetType: 'user'
                });
            })
            .catch(error => {
                console.error('خطأ في تحديث بيانات المستخدم:', error);
                showNotification(getErrorMessage(error) || 'حدث خطأ أثناء تحديث بيانات المستخدم', 'error');
            });
    } else {
        // محاكاة تحديث المستخدم في وضع العرض التوضيحي
        showNotification('تم تحديث بيانات المستخدم بنجاح (وضع العرض التوضيحي)', 'success');
        closeModal();
        
        // تحديث بيانات المستخدم في قائمة العرض
        const demoUsers = getDemoUsers();
        const userIndex = demoUsers.findIndex(user => user.uid === userId);
        
        if (userIndex !== -1) {
            demoUsers[userIndex].fullName = fullName;
            demoUsers[userIndex].email = email;
            demoUsers[userIndex].type = userType;
            
            renderUsersTable(demoUsers);
        }
    }
}

/**
 * عرض نافذة إدارة صلاحيات المستخدم
 * @param {string} userId - معرف المستخدم
 */
function showUserPermissionsModal(userId) {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canManageSettings')) {
        showNotification('ليس لديك صلاحية لإدارة صلاحيات المستخدمين', 'error');
        return;
    }
    
    // الحصول على بيانات المستخدم من الجدول
    const userRow = document.querySelector(`tr[data-id="${userId}"]`);
    if (!userRow) {
        showNotification('لم يتم العثور على بيانات المستخدم', 'error');
        return;
    }
    
    const userType = userRow.getAttribute('data-type');
    const userName = userRow.querySelector('.user-name').textContent;
    
    // الحصول على الصلاحيات الحالية
    getUserPermissions(userId)
        .then(currentPermissions => {
            // إنشاء محتوى النافذة
            const modalContent = `
                <div class="modal-header">
                    <h3 class="modal-title">إدارة صلاحيات المستخدم</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="permissions-user-id" value="${userId}">
                    
                    <div class="user-info-section">
                        <div class="user-info-cell">
                            <div class="user-avatar small">${userName ? userName.charAt(0).toUpperCase() : 'U'}</div>
                            <div>
                                <div class="user-name">${userName || 'مستخدم'}</div>
                                <div class="user-role">${getUserTypeLabel(userType)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">الصلاحيات المتاحة</label>
                        <div class="permissions-list">
                            ${generatePermissionsCheckboxes(currentPermissions)}
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-outline btn-sm" id="reset-default-permissions-btn">إعادة تعيين الصلاحيات الافتراضية</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-permissions-btn">حفظ الصلاحيات</button>
                </div>
            `;
            
            // عرض النافذة
            showModal('user-permissions-modal', modalContent, function(modal) {
                // إضافة مستمع حدث لزر إعادة تعيين الصلاحيات الافتراضية
                const resetBtn = modal.querySelector('#reset-default-permissions-btn');
                if (resetBtn) {
                    resetBtn.addEventListener('click', function() {
                        resetToDefaultPermissions(userType);
                    });
                }
                
                // مستمع حدث زر حفظ الصلاحيات
                const savePermissionsBtn = modal.querySelector('#save-permissions-btn');
                if (savePermissionsBtn) {
                    savePermissionsBtn.addEventListener('click', function() {
                        saveUserPermissions();
                    });
                }
            });
        })
        .catch(error => {
            console.error('خطأ في الحصول على صلاحيات المستخدم:', error);
            showNotification('حدث خطأ أثناء تحميل صلاحيات المستخدم', 'error');
        });
}

/**
 * الحصول على صلاحيات المستخدم الحالية
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<Object>} - وعد يحتوي على صلاحيات المستخدم
 */
function getUserPermissions(userId) {
    return new Promise((resolve, reject) => {
        if (databaseRef) {
            databaseRef.ref(`users/${userId}/profile/permissions`).once('value')
                .then(snapshot => {
                    const permissions = snapshot.val() || {};
                    resolve(permissions);
                })
                .catch(error => {
                    console.error('خطأ في الحصول على صلاحيات المستخدم:', error);
                    reject(error);
                });
        } else {
            // محاكاة الحصول على الصلاحيات في وضع العرض التوضيحي
            const demoUsers = getDemoUsers();
            const user = demoUsers.find(user => user.uid === userId);
            
            if (user && user.permissions) {
                resolve(user.permissions);
            } else {
                // إذا لم يتم العثور على المستخدم، استخدم الصلاحيات الافتراضية
                const userRow = document.querySelector(`tr[data-id="${userId}"]`);
                const userType = userRow ? userRow.getAttribute('data-type') : 'user';
                resolve(getDefaultPermissions(userType));
            }
        }
    });
}

/**
 * إنشاء مربعات اختيار الصلاحيات
 * @param {Object} currentPermissions - الصلاحيات الحالية للمستخدم
 * @returns {string} - HTML لمربعات اختيار الصلاحيات
 */
function generatePermissionsCheckboxes(currentPermissions) {
    let checkboxesHTML = '';
    
    for (const [key, label] of Object.entries(PERMISSIONS)) {
        const isChecked = currentPermissions[key] ? 'checked' : '';
        
        checkboxesHTML += `
            <div class="permission-item">
                <label>
                    <input type="checkbox" name="permission" data-permission="${key}" ${isChecked}>
                    <span class="permission-title">${label}</span>
                </label>
            </div>
        `;
    }
    
    return checkboxesHTML;
}

/**
 * إعادة تعيين مربعات الاختيار إلى الصلاحيات الافتراضية لنوع المستخدم
 * @param {string} userType - نوع المستخدم
 */
function resetToDefaultPermissions(userType) {
    const defaultPermissions = getDefaultPermissions(userType);
    const checkboxes = document.querySelectorAll('input[data-permission]');
    
    checkboxes.forEach(checkbox => {
        const permissionKey = checkbox.getAttribute('data-permission');
        checkbox.checked = defaultPermissions[permissionKey] === true;
    });
}

/**
 * حفظ صلاحيات المستخدم
 */
function saveUserPermissions() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canManageSettings')) {
        showNotification('ليس لديك صلاحية لإدارة صلاحيات المستخدمين', 'error');
        return;
    }
    
    // الحصول على معرف المستخدم
    const userId = document.getElementById('permissions-user-id').value;
    
    // جمع الصلاحيات المحددة
    const permissions = {};
    const checkboxes = document.querySelectorAll('input[data-permission]');
    
    checkboxes.forEach(checkbox => {
        const permissionKey = checkbox.getAttribute('data-permission');
        permissions[permissionKey] = checkbox.checked;
    });
    
    // حفظ الصلاحيات في قاعدة البيانات
    if (databaseRef) {
        databaseRef.ref(`users/${userId}/profile/permissions`).set(permissions)
            .then(() => {
                showNotification('تم حفظ صلاحيات المستخدم بنجاح', 'success');
                closeModal();
                
                // تسجيل النشاط في السجل
                logActivity({
                    type: 'permissions_updated',
                    details: `تم تحديث صلاحيات المستخدم: ${userId}`,
                    targetId: userId,
                    targetType: 'user'
                });
            })
            .catch(error => {
                console.error('خطأ في حفظ صلاحيات المستخدم:', error);
                showNotification(getErrorMessage(error) || 'حدث خطأ أثناء حفظ صلاحيات المستخدم', 'error');
            });
    } else {
        // محاكاة حفظ الصلاحيات في وضع العرض التوضيحي
        showNotification('تم حفظ صلاحيات المستخدم بنجاح (وضع العرض التوضيحي)', 'success');
        closeModal();
    }
}

/**
 * تأكيد حذف المستخدم
 * @param {string} userId - معرف المستخدم
 */
function confirmDeleteUser(userId) {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canDeleteUsers')) {
        showNotification('ليس لديك صلاحية لحذف المستخدمين', 'error');
        return;
    }
    
    // منع حذف حساب المستخدم الحالي
    if (currentUser && userId === currentUser.uid) {
        showNotification('لا يمكنك حذف حسابك الخاص', 'error');
        return;
    }
    
    // الحصول على بيانات المستخدم من الجدول
    const userRow = document.querySelector(`tr[data-id="${userId}"]`);
    if (!userRow) {
        showNotification('لم يتم العثور على بيانات المستخدم', 'error');
        return;
    }
    
    const userName = userRow.querySelector('.user-name').textContent;
    
    // إنشاء محتوى النافذة
    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">تأكيد حذف المستخدم</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle alert-icon"></i>
                هل أنت متأكد من رغبتك في حذف المستخدم <strong>${userName}</strong>؟
            </div>
            <p>هذا الإجراء لا يمكن التراجع عنه، وسيتم حذف جميع بيانات المستخدم.</p>
            <input type="hidden" id="delete-user-id" value="${userId}">
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إلغاء</button>
            <button class="btn btn-danger" id="confirm-delete-user-btn">تأكيد الحذف</button>
        </div>
    `;
    
    // عرض النافذة
    showModal('delete-user-modal', modalContent, function(modal) {
        // مستمع حدث زر تأكيد الحذف
        const confirmDeleteBtn = modal.querySelector('#confirm-delete-user-btn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', function() {
                deleteUser(userId, userName);
            });
        }
    });
}

/**
 * حذف المستخدم
 * @param {string} userId - معرف المستخدم
 * @param {string} userName - اسم المستخدم (للسجل)
 */
function deleteUser(userId, userName) {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canDeleteUsers')) {
        showNotification('ليس لديك صلاحية لحذف المستخدمين', 'error');
        return;
    }
    
    // حذف المستخدم من قاعدة البيانات
    if (databaseRef) {
        // حذف بيانات المستخدم أولاً
        databaseRef.ref(`users/${userId}`).remove()
            .then(() => {
                // حذف حساب المصادقة
                // ملاحظة: في التطبيق الحقيقي، هذا يتطلب عادة استخدام Admin SDK من الخادم
                if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser && window.firebase.auth().currentUser.uid === userId) {
                    return window.firebase.auth().currentUser.delete();
                } else {
                    return Promise.resolve();
                }
            })
            .then(() => {
                showNotification('تم حذف المستخدم بنجاح', 'success');
                closeModal();
                loadUsers();
                
                // تسجيل النشاط في السجل
                logActivity({
                    type: 'user_deleted',
                    details: `تم حذف المستخدم: ${userName} (${userId})`,
                    targetId: userId,
                    targetType: 'user'
                });
            })
            .catch(error => {
                console.error('خطأ في حذف المستخدم:', error);
                showNotification(getErrorMessage(error) || 'حدث خطأ أثناء حذف المستخدم', 'error');
            });
    } else {
        // محاكاة حذف المستخدم في وضع العرض التوضيحي
        showNotification('تم حذف المستخدم بنجاح (وضع العرض التوضيحي)', 'success');
        closeModal();
        
        // حذف المستخدم من قائمة العرض
        const demoUsers = getDemoUsers();
        const filteredUsers = demoUsers.filter(user => user.uid !== userId);
        renderUsersTable(filteredUsers);
    }
}

/**
 * تصفية المستخدمين حسب النوع
 * @param {string} filterType - نوع التصفية: 'all'، 'admin'، 'manager'، 'user'
 */
function filterUsers(filterType) {
    const userRows = document.querySelectorAll('#users-table tbody tr');
    
    userRows.forEach(row => {
        if (filterType === 'all' || row.getAttribute('data-type') === filterType) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * البحث في المستخدمين
 * @param {string} searchText - نص البحث
 */
function searchUsers(searchText) {
    const searchTerm = searchText.toLowerCase().trim();
    const userRows = document.querySelectorAll('#users-table tbody tr');
    
    userRows.forEach(row => {
        // البحث في معلومات المستخدم (الاسم والبريد الإلكتروني)
        const userName = row.querySelector('.user-name')?.textContent.toLowerCase() || '';
        const userEmail = row.getAttribute('data-email')?.toLowerCase() || '';
        const userId = row.getAttribute('data-id')?.toLowerCase() || '';
        
        if (
            userName.includes(searchTerm) ||
            userEmail.includes(searchTerm) ||
            userId.includes(searchTerm)
        ) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * الحصول على الصلاحيات الافتراضية لنوع المستخدم
 * @param {string} userType - نوع المستخدم: 'admin'، 'manager'، 'user'
 * @returns {Object} - كائن يحتوي على الصلاحيات الافتراضية
 */
function getDefaultPermissions(userType) {
    const permissions = {};
    
    // تعيين جميع الصلاحيات إلى false أولاً
    Object.keys(PERMISSIONS).forEach(key => {
        permissions[key] = false;
    });
    
    // تعيين الصلاحيات حسب نوع المستخدم
    switch (userType) {
        case 'admin':
            // المسؤول لديه جميع الصلاحيات
            Object.keys(PERMISSIONS).forEach(key => {
                permissions[key] = true;
            });
            break;
            
        case 'manager':
            // المدير لديه صلاحيات محددة
            permissions.canCreateUsers = true;
            permissions.canExportData = true;
            permissions.canImportData = true;
            permissions.canCreateBackup = true;
            break;
            
        case 'user':
        default:
            // المستخدم العادي ليس لديه صلاحيات خاصة
            permissions.canExportData = true;
            break;
    }
    
    return permissions;
}

/**
 * التحقق من وجود صلاحية محددة للمستخدم الحالي
 * @param {string} permissionKey - مفتاح الصلاحية
 * @returns {boolean} - هل المستخدم يملك الصلاحية
 */
function hasPermission(permissionKey) {
    // المستخدم غير مسجل الدخول
    if (!currentUser || !currentUser.type) {
        return false;
    }
    
    // المسؤول يملك جميع الصلاحيات
    if (currentUser.type === 'admin') {
        return true;
    }
    
    // التحقق من وجود الصلاحية للمستخدم
    return currentUser.permissions && currentUser.permissions[permissionKey] === true;
}

/**
 * عرض إشعار للمستخدم
 * @param {string} message - نص الإشعار
 * @param {string} type - نوع الإشعار: 'success'، 'error'، 'info'، 'warning'
 */
function showNotification(message, type = 'info') {
    // البحث عن نظام الإشعارات الموجود
    if (window.NotificationSystem && typeof window.NotificationSystem.showNotification === 'function') {
        window.NotificationSystem.showNotification(message, type);
        return;
    }
    
    // إنشاء إشعار بسيط إذا لم يكن نظام الإشعارات موجودًا
    const notificationContainer = document.querySelector('.notifications-container') || createNotificationContainer();
    
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // إضافة أيقونة مناسبة حسب النوع
    let iconClass = 'info-circle';
    switch (type) {
        case 'success':
            iconClass = 'check-circle';
            break;
        case 'error':
            iconClass = 'exclamation-circle';
            break;
        case 'warning':
            iconClass = 'exclamation-triangle';
            break;
    }
    
    // إضافة محتوى الإشعار
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${iconClass}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة مستمع حدث لزر الإغلاق
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            notification.classList.add('notification-closing');
            setTimeout(() => {
                notificationContainer.removeChild(notification);
            }, 300);
        });
    }
    
    // إضافة الإشعار إلى الحاوية
    notificationContainer.appendChild(notification);
    
    // جعل الإشعار مرئيًا (للانتقال)
    setTimeout(() => {
        notification.classList.add('notification-visible');
    }, 10);
    
    // إغلاق الإشعار تلقائيًا بعد فترة
    setTimeout(() => {
        if (notification.parentNode === notificationContainer) {
            notification.classList.add('notification-closing');
            setTimeout(() => {
                if (notification.parentNode === notificationContainer) {
                    notificationContainer.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

/**
 * إنشاء حاوية الإشعارات
 * @returns {HTMLElement} - عنصر حاوية الإشعارات
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.className = 'notifications-container';
    
    // إضافة أنماط CSS
    const style = document.createElement('style');
    style.textContent = `
        .notifications-container {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        }
        
        .notification {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateY(-20px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .notification-visible {
            transform: translateY(0);
            opacity: 1;
        }
        
        .notification-closing {
            transform: translateY(-20px);
            opacity: 0;
        }
        
        .notification-icon {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }
        
        .notification-content {
            flex-grow: 1;
            min-width: 0;
        }
        
        .notification-message {
            margin: 0;
            font-size: 14px;
            color: #1f2937;
        }
        
        .notification-close {
            flex-shrink: 0;
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
            font-size: 14px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .notification-close:hover {
            background-color: #f3f4f6;
            color: #4b5563;
        }
        
        .notification-info .notification-icon {
            color: #3b82f6;
        }
        
        .notification-success .notification-icon {
            color: #10b981;
        }
        
        .notification-warning .notification-icon {
            color: #f59e0b;
        }
        
        .notification-error .notification-icon {
            color: #ef4444;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(container);
    return container;
}

/**
 * عرض نافذة منبثقة
 * @param {string} modalId - معرف النافذة
 * @param {string} content - محتوى النافذة
 * @param {Function} callback - دالة يتم استدعاؤها بعد إنشاء النافذة
 */
function showModal(modalId, content, callback) {
    // إغلاق أي نافذة مفتوحة
    closeModal();
    
    // إنشاء عنصر النافذة
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';
    
    // إنشاء حاوية النافذة
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    
    // إضافة المحتوى
    modalContainer.innerHTML = content;
    
    // إضافة العناصر إلى الصفحة
    modal.appendChild(modalContainer);
    document.body.appendChild(modal);
    
    // إضافة مستمعي الأحداث
    setupModalEvents(modal);
    
    // إظهار النافذة (للانتقال)
    setTimeout(() => {
        modal.classList.add('modal-visible');
    }, 10);
    
    // استدعاء دالة الاستدعاء إذا تم توفيرها
    if (typeof callback === 'function') {
        callback(modal);
    }
}

/**
 * إضافة مستمعي الأحداث للنافذة المنبثقة
 * @param {HTMLElement} modal - عنصر النافذة
 */
function setupModalEvents(modal) {
    // أزرار إغلاق النافذة
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // إغلاق النافذة عند النقر خارجها
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // إغلاق النافذة عند الضغط على Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

/**
 * إغلاق النافذة المنبثقة المفتوحة
 */
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        // إضافة تأثير الإغلاق
        modal.classList.remove('modal-visible');
        
        // إزالة العنصر بعد انتهاء الانتقال
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

/**
 * تسجيل نشاط في سجل النظام
 * @param {Object} activityData - بيانات النشاط
 */
function logActivity(activityData) {
    if (!activityData) return;
    
    // إضافة معلومات إضافية
    const activity = {
        ...activityData,
        timestamp: new Date().toISOString(),
        userId: currentUser ? currentUser.uid : 'system',
        userName: currentUser ? (currentUser.fullName || currentUser.email) : 'النظام'
    };
    
    // تسجيل النشاط في قاعدة البيانات
    if (databaseRef) {
        databaseRef.ref('logs').push(activity)
            .catch(error => {
                console.error('خطأ في تسجيل النشاط:', error);
            });
    } else {
        // تخزين النشاط في الذاكرة في وضع العرض التوضيحي
        if (!logsCache[currentLogsPage]) {
            logsCache[currentLogsPage] = [];
        }
        
        logsCache[currentLogsPage].unshift(activity);
        console.log('تم تسجيل النشاط (وضع العرض التوضيحي):', activity);
    }
}

/**
 * الحصول على رسالة الخطأ المناسبة
 * @param {Error} error - كائن الخطأ
 * @returns {string} - رسالة الخطأ المناسبة
 */
function getErrorMessage(error) {
    if (!error) return 'حدث خطأ غير معروف';
    
    // التعامل مع أخطاء Firebase
    if (error.code) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'البريد الإلكتروني مستخدم بالفعل';
            case 'auth/invalid-email':
                return 'البريد الإلكتروني غير صالح';
            case 'auth/weak-password':
                return 'كلمة المرور ضعيفة جدًا';
            case 'auth/user-not-found':
                return 'لم يتم العثور على المستخدم';
            case 'auth/wrong-password':
                return 'كلمة المرور غير صحيحة';
            case 'auth/requires-recent-login':
                return 'تحتاج إلى إعادة تسجيل الدخول لإكمال هذه العملية';
            case 'permission-denied':
                return 'ليس لديك صلاحية لإجراء هذه العملية';
            default:
                return error.message || 'حدث خطأ غير معروف';
        }
    }
    
    return error.message || 'حدث خطأ غير معروف';
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} - هل البريد الإلكتروني صالح
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * الحصول على نص وصفي لنوع المستخدم
 * @param {string} userType - نوع المستخدم
 * @returns {string} - النص الوصفي
 */
function getUserTypeLabel(userType) {
    switch (userType) {
        case 'admin':
            return 'مسؤول النظام';
        case 'manager':
            return 'مدير';
        case 'user':
            return 'مستخدم عادي';
        default:
            return 'غير محدد';
    }
}

/**
 * الحصول على فئة الشارة لنوع المستخدم
 * @param {string} userType - نوع المستخدم
 * @returns {string} - فئة الشارة
 */
function getUserTypeBadgeClass(userType) {
    switch (userType) {
        case 'admin':
            return 'danger';
        case 'manager':
            return 'warning';
        case 'user':
            return 'primary';
        default:
            return 'info';
    }
}

/**
 * عرض صفحة سجل النظام
 */
function showSystemLogs() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canManageSettings')) {
        showNotification('ليس لديك صلاحية لعرض سجل النظام', 'error');
        return;
    }
    
    // إنشاء صفحة السجل إذا لم تكن موجودة
    const logsPage = document.getElementById('system-logs-page') || createSystemLogsPage();
    
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // عرض صفحة السجل
    logsPage.classList.add('active');
    
    // تحميل بيانات السجل
    loadSystemLogs();
}

/**
 * إنشاء صفحة سجل النظام
 * @returns {HTMLElement} - عنصر صفحة السجل
 */
function createSystemLogsPage() {
    // إنشاء عنصر الصفحة
    const page = document.createElement('div');
    page.id = 'system-logs-page';
    page.className = 'page system-logs-page';
    
    // محتوى الصفحة
    page.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">سجل النظام</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" placeholder="بحث في السجل..." type="text" id="logs-search-input" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-outline" id="export-logs-btn">
                    <i class="fas fa-file-export"></i>
                    <span>تصدير</span>
                </button>
                <button class="btn btn-outline danger" id="clear-logs-btn">
                    <i class="fas fa-trash"></i>
                    <span>مسح السجل</span>
                </button>
            </div>
        </div>
        
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">سجل أنشطة النظام</h2>
                <div class="section-actions">
                    <div class="filter-group">
                        <select class="form-select" id="logs-filter">
                            <option value="all">جميع الأنشطة</option>
                            <option value="login">تسجيل الدخول</option>
                            <option value="user">إدارة المستخدمين</option>
                            <option value="settings">الإعدادات</option>
                            <option value="data">البيانات</option>
                        </select>
                    </div>
                    <button class="btn btn-outline" id="refresh-logs-btn">
                        <i class="fas fa-sync-alt"></i>
                        <span>تحديث</span>
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table id="logs-table" class="data-table">
                    <thead>
                        <tr>
                            <th>التاريخ والوقت</th>
                            <th>النوع</th>
                            <th>المستخدم</th>
                            <th>التفاصيل</th>
                            <th>الهدف</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="5" class="text-center">جارٍ تحميل بيانات السجل...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="pagination-container">
                <div class="pagination">
                    <button class="pagination-btn" id="prev-logs-page" disabled>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <span class="pagination-info">الصفحة <span id="current-logs-page">1</span> من <span id="total-logs-pages">1</span></span>
                    <button class="pagination-btn" id="next-logs-page" disabled>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                </div>
                <div class="per-page-selector">
                    <span>عرض</span>
                    <select id="logs-per-page" class="form-select">
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <span>لكل صفحة</span>
                </div>
            </div>
        </div>
    `;
    
    // إضافة الصفحة إلى المحتوى الرئيسي
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.appendChild(page);
    } else {
        document.body.appendChild(page);
    }
    
    // إضافة مستمعي الأحداث
    setupSystemLogsListeners(page);
    
    return page;
}

/**
 * إضافة مستمعي الأحداث لصفحة سجل النظام
 * @param {HTMLElement} page - عنصر صفحة السجل
 */
function setupSystemLogsListeners(page) {
    // زر تحديث السجل
    const refreshLogsBtn = page.querySelector('#refresh-logs-btn');
    if (refreshLogsBtn) {
        refreshLogsBtn.addEventListener('click', loadSystemLogs);
    }
    
    // زر تصدير السجل
    const exportLogsBtn = page.querySelector('#export-logs-btn');
    if (exportLogsBtn) {
        exportLogsBtn.addEventListener('click', exportLogs);
    }
    
    // زر مسح السجل
    const clearLogsBtn = page.querySelector('#clear-logs-btn');
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', confirmClearLogs);
    }
    
    // قائمة تصفية السجل
    const logsFilter = page.querySelector('#logs-filter');
    if (logsFilter) {
        logsFilter.addEventListener('change', function() {
            filterLogs(this.value);
        });
    }
    
    // مربع البحث
    const searchInput = page.querySelector('#logs-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchLogs(this.value);
        });
    }
    
    // أزرار التنقل بين الصفحات
    const prevPageBtn = page.querySelector('#prev-logs-page');
    const nextPageBtn = page.querySelector('#next-logs-page');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentLogsPage > 1) {
                currentLogsPage--;
                loadSystemLogs();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            if (currentLogsPage < totalLogsPages) {
                currentLogsPage++;
                loadSystemLogs();
            }
        });
    }
    
    // قائمة عدد العناصر لكل صفحة
    const logsPerPageSelect = page.querySelector('#logs-per-page');
    if (logsPerPageSelect) {
        logsPerPageSelect.value = logsPerPage.toString();
        logsPerPageSelect.addEventListener('change', function() {
            logsPerPage = parseInt(this.value);
            currentLogsPage = 1;
            loadSystemLogs();
        });
    }
}

/**
 * تحميل بيانات سجل النظام
 */
function loadSystemLogs() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canManageSettings')) {
        showNotification('ليس لديك صلاحية لعرض سجل النظام', 'error');
        return;
    }
    
    // عرض رسالة التحميل
    const tableBody = document.querySelector('#logs-table tbody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="loader"></div></td></tr>';
    }
    
    // تحديث معلومات الصفحات
    updateLogsPages();
    
    // تحميل البيانات من Firebase
    if (databaseRef) {
        databaseRef.ref('logs')
            .orderByChild('timestamp')
            .limitToLast(logsPerPage)
            .once('value')
            .then(snapshot => {
                const logs = [];
                
                // جمع بيانات السجل
                snapshot.forEach(childSnapshot => {
                    const logId = childSnapshot.key;
                    const logData = childSnapshot.val();
                    
                    if (logData) {
                        logs.unshift({
                            id: logId,
                            ...logData
                        });
                    }
                });
                
                // حساب إجمالي عدد الصفحات
                databaseRef.ref('logs').once('value')
                    .then(countSnapshot => {
                        const totalLogs = countSnapshot.numChildren();
                        totalLogsPages = Math.ceil(totalLogs / logsPerPage);
                        updateLogsPages();
                    });
                
                // عرض بيانات السجل
                renderLogsTable(logs);
            })
            .catch(error => {
                console.error('خطأ في تحميل بيانات السجل:', error);
                
                if (tableBody) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center">
                                <div class="alert alert-danger">
                                    <i class="fas fa-exclamation-circle alert-icon"></i>
                                    حدث خطأ أثناء تحميل بيانات السجل.
                                </div>
                            </td>
                        </tr>
                    `;
                }
            });
    } else {
        // استخدام بيانات تجريبية للعرض التوضيحي
        const demoLogs = getDemoLogs();
        renderLogsTable(demoLogs);
    }
}

/**
 * تحديث معلومات صفحات السجل
 */
function updateLogsPages() {
    // تحديث رقم الصفحة الحالية
    const currentPageSpan = document.getElementById('current-logs-page');
    if (currentPageSpan) {
        currentPageSpan.textContent = currentLogsPage.toString();
    }
    
    // تحديث إجمالي عدد الصفحات
    const totalPagesSpan = document.getElementById('total-logs-pages');
    if (totalPagesSpan) {
        totalPagesSpan.textContent = totalLogsPages.toString();
    }
    
    // تحديث حالة أزرار التنقل
    const prevPageBtn = document.getElementById('prev-logs-page');
    const nextPageBtn = document.getElementById('next-logs-page');
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentLogsPage <= 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentLogsPage >= totalLogsPages;
    }
}

/**
 * الحصول على بيانات السجل التجريبية
 * @returns {Array} - قائمة السجلات التجريبية
 */
function getDemoLogs() {
    // إنشاء بيانات تجريبية للسجل
    const demoLogs = [];
    const currentDate = new Date();
    
    // أنواع الأنشطة للعرض التوضيحي
    const activityTypes = [
        'user_login',
        'user_logout',
        'user_created',
        'user_updated',
        'user_deleted',
        'permissions_updated',
        'settings_updated',
        'data_exported',
        'data_imported',
        'backup_created',
        'backup_restored'
    ];
    
    // إنشاء 50 سجل تجريبي
    for (let i = 0; i < 50; i++) {
        // تاريخ النشاط (خلال الأيام الـ 30 الماضية)
        const logDate = new Date(currentDate);
        logDate.setDate(logDate.getDate() - Math.floor(Math.random() * 30));
        
        // نوع النشاط
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        
        // معلومات النشاط
        let details = '';
        let targetId = '';
        let targetType = '';
        
        // إنشاء تفاصيل مناسبة لنوع النشاط
        switch (activityType) {
            case 'user_login':
                details = 'تم تسجيل الدخول إلى النظام';
                break;
                
            case 'user_logout':
                details = 'تم تسجيل الخروج من النظام';
                break;
                
            case 'user_created':
                targetId = 'user_' + Math.floor(Math.random() * 1000);
                targetType = 'user';
                details = `تم إنشاء مستخدم جديد: مستخدم تجريبي (user${targetId}@example.com)`;
                break;
                
            case 'user_updated':
                targetId = 'user_' + Math.floor(Math.random() * 1000);
                targetType = 'user';
                details = `تم تحديث بيانات المستخدم: مستخدم تجريبي (user${targetId}@example.com)`;
                break;
                
            case 'user_deleted':
                targetId = 'user_' + Math.floor(Math.random() * 1000);
                targetType = 'user';
                details = `تم حذف المستخدم: مستخدم تجريبي (user${targetId}@example.com)`;
                break;
                
            case 'permissions_updated':
                targetId = 'user_' + Math.floor(Math.random() * 1000);
                targetType = 'user';
                details = `تم تحديث صلاحيات المستخدم: مستخدم تجريبي (user${targetId}@example.com)`;
                break;
                
            case 'settings_updated':
                targetType = 'settings';
                details = 'تم تحديث إعدادات النظام';
                break;
                
            case 'data_exported':
                targetType = 'data';
                details = 'تم تصدير بيانات النظام';
                break;
                
            case 'data_imported':
                targetType = 'data';
                details = 'تم استيراد بيانات جديدة إلى النظام';
                break;
                
            case 'backup_created':
                targetType = 'backup';
                targetId = 'backup_' + Math.floor(Math.random() * 1000);
                details = 'تم إنشاء نسخة احتياطية جديدة';
                break;
                
            case 'backup_restored':
                targetType = 'backup';
                targetId = 'backup_' + Math.floor(Math.random() * 1000);
                details = 'تم استعادة النسخة الاحتياطية';
                break;
        }
        
        // إضافة السجل إلى القائمة
        demoLogs.push({
            id: 'log_' + (i + 1),
            timestamp: logDate.toISOString(),
            type: activityType,
            details: details,
            userId: 'user_' + Math.floor(Math.random() * 3 + 1),
            userName: ['مدير النظام', 'مدير التطبيق', 'مستخدم عادي'][Math.floor(Math.random() * 3)],
            targetId: targetId,
            targetType: targetType
        });
    }
    
    // ترتيب السجلات حسب التاريخ (الأحدث أولاً)
    demoLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // تطبيق الترقيم الصفحي
    const startIndex = (currentLogsPage - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    
    // تعيين إجمالي عدد الصفحات
    totalLogsPages = Math.ceil(demoLogs.length / logsPerPage);
    
    // عرض السجلات حسب الصفحة الحالية
    return demoLogs.slice(startIndex, endIndex);
}

/**
 * عرض بيانات السجل في الجدول
 * @param {Array} logs - قائمة السجلات
 */
function renderLogsTable(logs) {
    const tableBody = document.querySelector('#logs-table tbody');
    if (!tableBody) return;
    
    // مسح محتوى الجدول
    tableBody.innerHTML = '';
    
    if (!logs || logs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle alert-icon"></i>
                        لا توجد سجلات لعرضها.
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // إنشاء صفوف الجدول
    logs.forEach(log => {
        const row = document.createElement('tr');
        
        // تحديد كلاس الصف حسب نوع النشاط
        row.classList.add(getActivityClass(log.type));
        
        row.setAttribute('data-id', log.id);
        row.setAttribute('data-type', log.type);
        
        // تنسيق التاريخ والوقت
        const timestamp = log.timestamp ? new Date(log.timestamp) : new Date();
        const formattedDate = formatDateTime(timestamp);
        
        row.innerHTML = `
            <td>
                <div class="timestamp">
                    <div class="date">${formattedDate.date}</div>
                    <div class="time">${formattedDate.time}</div>
                </div>
            </td>
            <td><span class="badge badge-${getActivityBadgeClass(log.type)}">${getActivityTypeLabel(log.type)}</span></td>
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar small">${log.userName ? log.userName.charAt(0).toUpperCase() : 'U'}</div>
                    <div class="user-name">${log.userName || 'النظام'}</div>
                </div>
            </td>
            <td>${log.details || 'لا توجد تفاصيل'}</td>
            <td>${log.targetType ? `<span class="badge badge-info">${getTargetTypeLabel(log.targetType)}</span>` : '-'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * تصفية السجلات حسب النوع
 * @param {string} filterType - نوع التصفية
 */
function filterLogs(filterType) {
    const logRows = document.querySelectorAll('#logs-table tbody tr');
    const filterMap = {
        'all': '*',
        'login': ['user_login', 'user_logout'],
        'user': ['user_created', 'user_updated', 'user_deleted', 'permissions_updated'],
        'settings': ['settings_updated'],
        'data': ['data_exported', 'data_imported', 'backup_created', 'backup_restored']
    };
    
    const filter = filterMap[filterType] || '*';
    
    logRows.forEach(row => {
        const rowType = row.getAttribute('data-type');
        
        if (filter === '*' || (Array.isArray(filter) && filter.includes(rowType))) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * البحث في السجلات
 * @param {string} searchText - نص البحث
 */
function searchLogs(searchText) {
    const searchTerm = searchText.toLowerCase().trim();
    const logRows = document.querySelectorAll('#logs-table tbody tr');
    
    logRows.forEach(row => {
        const details = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
        const userName = row.querySelector('.user-name').textContent.toLowerCase();
        
        if (details.includes(searchTerm) || userName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * تأكيد مسح السجل
 */
function confirmClearLogs() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canManageSettings')) {
        showNotification('ليس لديك صلاحية لمسح سجل النظام', 'error');
        return;
    }
    
    // إنشاء محتوى النافذة
    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">تأكيد مسح السجل</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle alert-icon"></i>
                هل أنت متأكد من رغبتك في مسح جميع سجلات النظام؟
            </div>
            <p>هذا الإجراء لا يمكن التراجع عنه، وسيتم حذف جميع السجلات بشكل نهائي.</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إلغاء</button>
            <button class="btn btn-danger" id="confirm-clear-logs-btn">تأكيد المسح</button>
        </div>
    `;
    
    // عرض النافذة
    showModal('clear-logs-modal', modalContent, function(modal) {
        // مستمع حدث زر تأكيد المسح
        const confirmClearBtn = modal.querySelector('#confirm-clear-logs-btn');
        if (confirmClearBtn) {
            confirmClearBtn.addEventListener('click', clearLogs);
        }
    });
}

/**
 * مسح سجل النظام
 */
function clearLogs() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canManageSettings')) {
        showNotification('ليس لديك صلاحية لمسح سجل النظام', 'error');
        return;
    }
    
    // مسح السجل من قاعدة البيانات
    if (databaseRef) {
        databaseRef.ref('logs').remove()
            .then(() => {
                showNotification('تم مسح سجل النظام بنجاح', 'success');
                closeModal();
                loadSystemLogs();
                
                // تسجيل هذا النشاط نفسه (بعد المسح)
                logActivity({
                    type: 'logs_cleared',
                    details: 'تم مسح جميع سجلات النظام',
                    targetType: 'logs'
                });
            })
            .catch(error => {
                console.error('خطأ في مسح سجل النظام:', error);
                showNotification(getErrorMessage(error) || 'حدث خطأ أثناء مسح سجل النظام', 'error');
            });
    } else {
        // محاكاة مسح السجل في وضع العرض التوضيحي
        showNotification('تم مسح سجل النظام بنجاح (وضع العرض التوضيحي)', 'success');
        closeModal();
        
        // مسح ذاكرة التخزين المؤقت للسجلات
        logsCache = {};
        currentLogsPage = 1;
        totalLogsPages = 1;
        
        // إعادة تحميل الجدول
        loadSystemLogs();
    }
}

/**
 * تصدير سجل النظام
 */
function exportLogs() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canExportData')) {
        showNotification('ليس لديك صلاحية لتصدير بيانات السجل', 'error');
        return;
    }
    
    // جمع بيانات السجل من الجدول
    const logRows = document.querySelectorAll('#logs-table tbody tr:not([style*="display: none"])');
    const logs = [];
    
    logRows.forEach(row => {
        const timestamp = row.querySelector('td:nth-child(1) .timestamp');
        const date = timestamp.querySelector('.date').textContent;
        const time = timestamp.querySelector('.time').textContent;
        
        const type = row.querySelector('td:nth-child(2) .badge').textContent;
        const user = row.querySelector('td:nth-child(3) .user-name').textContent;
        const details = row.querySelector('td:nth-child(4)').textContent;
        const target = row.querySelector('td:nth-child(5)').textContent;
        
        logs.push({
            date: `${date} ${time}`,
            type: type,
            user: user,
            details: details,
            target: target
        });
    });
    
    // تحويل البيانات إلى CSV
    let csv = 'التاريخ والوقت,النوع,المستخدم,التفاصيل,الهدف\n';
    
    logs.forEach(log => {
        csv += `"${log.date}","${log.type}","${log.user}","${log.details}","${log.target}"\n`;
    });
    
    // تنزيل الملف
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    downloadLink.href = url;
    downloadLink.download = `سجل_النظام_${date}.csv`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // تسجيل النشاط
    logActivity({
        type: 'logs_exported',
        details: 'تم تصدير سجل النظام',
        targetType: 'logs'
    });
    
    showNotification('تم تصدير سجل النظام بنجاح', 'success');
}

/**
 * الحصول على فئة CSS لنوع النشاط
 * @param {string} activityType - نوع النشاط
 * @returns {string} - فئة CSS
 */
function getActivityClass(activityType) {
    if (!activityType) return '';
    
    if (activityType.includes('login')) return 'login-activity';
    if (activityType.includes('user')) return 'user-activity';
    if (activityType.includes('settings')) return 'settings-activity';
    if (activityType.includes('data') || activityType.includes('backup')) return 'data-activity';
    
    return '';
}

/**
 * الحصول على فئة الشارة لنوع النشاط
 * @param {string} activityType - نوع النشاط
 * @returns {string} - فئة الشارة
 */
function getActivityBadgeClass(activityType) {
    if (!activityType) return 'info';
    
    if (activityType === 'user_login') return 'success';
    if (activityType === 'user_logout') return 'warning';
    if (activityType.includes('deleted') || activityType.includes('cleared')) return 'danger';
    if (activityType.includes('created')) return 'success';
    if (activityType.includes('updated')) return 'primary';
    if (activityType.includes('imported') || activityType.includes('exported')) return 'info';
    if (activityType.includes('backup')) return 'warning';
    
    return 'info';
}

/**
 * الحصول على نص وصفي لنوع النشاط
 * @param {string} activityType - نوع النشاط
 * @returns {string} - النص الوصفي
 */
function getActivityTypeLabel(activityType) {
    switch (activityType) {
        case 'user_login':
            return 'تسجيل دخول';
        case 'user_logout':
            return 'تسجيل خروج';
        case 'user_created':
            return 'إنشاء مستخدم';
        case 'user_updated':
            return 'تعديل مستخدم';
        case 'user_deleted':
            return 'حذف مستخدم';
        case 'permissions_updated':
            return 'تعديل صلاحيات';
        case 'settings_updated':
            return 'تعديل إعدادات';
        case 'data_exported':
            return 'تصدير بيانات';
        case 'data_imported':
            return 'استيراد بيانات';
        case 'backup_created':
            return 'إنشاء نسخة احتياطية';
        case 'backup_restored':
            return 'استعادة نسخة احتياطية';
        case 'logs_cleared':
            return 'مسح السجل';
        case 'logs_exported':
            return 'تصدير السجل';
        default:
            return 'نشاط آخر';
    }
}

/**
 * الحصول على نص وصفي لنوع الهدف
 * @param {string} targetType - نوع الهدف
 * @returns {string} - النص الوصفي
 */
function getTargetTypeLabel(targetType) {
    switch (targetType) {
        case 'user':
            return 'مستخدم';
        case 'settings':
            return 'إعدادات';
        case 'data':
            return 'بيانات';
        case 'backup':
            return 'نسخة احتياطية';
        case 'logs':
            return 'سجلات';
        default:
            return targetType || '';
    }
}

/**
 * تنسيق التاريخ والوقت
 * @param {Date} date - كائن التاريخ
 * @returns {Object} - كائن يحتوي على التاريخ والوقت المنسقين
 */
function formatDateTime(date) {
    if (!date || !(date instanceof Date)) {
        date = new Date();
    }
    
    // تنسيق التاريخ
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // تنسيق الوقت
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return {
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}:${seconds}`
    };
}

/**
 * تهيئة نظام إدارة المستخدمين عند تحميل الصفحة
 */
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة وحدة إدارة المستخدمين
    initUserManagement();
    
    // إضافة رابط سجل النظام إلى الشريط الجانبي
    const sidebarNav = document.querySelector('.sidebar .nav-list');
    if (sidebarNav) {
        // إنشاء عنصر قائمة لسجل النظام
        const logsNavItem = document.createElement('li');
        logsNavItem.className = 'nav-item admin-only';
        logsNavItem.setAttribute('data-permission', 'canManageSettings');
        
        // إضافة الرابط
        logsNavItem.innerHTML = `
            <a class="nav-link" data-page="system-logs" href="#">
                <div class="nav-icon">
                    <i class="fas fa-history"></i>
                </div>
                <span>سجل النظام</span>
            </a>
        `;
        
        // إدراج العنصر بعد رابط إدارة المستخدمين
        const userManagementNavItem = document.querySelector('.nav-item a[data-page="user-management"]')?.parentNode;
        if (userManagementNavItem) {
            sidebarNav.insertBefore(logsNavItem, userManagementNavItem.nextSibling);
        } else {
            sidebarNav.appendChild(logsNavItem);
        }
        
        // إضافة مستمع حدث للتنقل
        const logNavLink = logsNavItem.querySelector('.nav-link');
        if (logNavLink) {
            logNavLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // إزالة التنشيط من جميع الروابط
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // تنشيط الرابط الحالي
                this.classList.add('active');
                
                // عرض صفحة سجل النظام
                showSystemLogs();
            });
        }
    }
});

/**
 * إظهار لوحة تفاصيل المستخدم
 * @param {string} userId - معرف المستخدم
 */
function showUserDetails(userId) {
    // التحقق من صلاحيات المستخدم
    if (!currentUser || !hasPermission('canCreateUsers')) {
        showNotification('ليس لديك صلاحية لعرض تفاصيل المستخدمين', 'error');
        return;
    }
    
    // الحصول على بيانات المستخدم من الجدول
    const userRow = document.querySelector(`tr[data-id="${userId}"]`);
    if (!userRow) {
        showNotification('لم يتم العثور على بيانات المستخدم', 'error');
        return;
    }
    
    const userType = userRow.getAttribute('data-type');
    const userEmail = userRow.getAttribute('data-email');
    const userName = userRow.querySelector('.user-name').textContent;
    
    // الحصول على بيانات أنشطة المستخدم
    getUserActivities(userId)
        .then(activities => {
            // إنشاء محتوى النافذة
            const modalContent = `
                <div class="modal-header">
                    <h3 class="modal-title">تفاصيل المستخدم</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body user-detail-modal">
                    <div class="text-center mb-20">
                        <div class="user-avatar medium">${userName ? userName.charAt(0).toUpperCase() : 'U'}</div>
                        <h3 class="user-full-name">${userName || 'مستخدم'}</h3>
                        <span class="badge badge-${getUserTypeBadgeClass(userType)}">${getUserTypeLabel(userType)}</span>
                    </div>
                    
                    <div class="user-details-section">
                        <h4 class="section-title">المعلومات الأساسية</h4>
                        <div class="details-row">
                            <div class="detail-label">البريد الإلكتروني:</div>
                            <div class="detail-value">${userEmail || 'غير محدد'}</div>
                        </div>
                        <div class="details-row">
                            <div class="detail-label">معرّف المستخدم:</div>
                            <div class="detail-value">${userId}</div>
                        </div>
                        <div class="details-row">
                            <div class="detail-label">تاريخ الإنشاء:</div>
                            <div class="detail-value">${getUserCreationDate(userId) || 'غير معروف'}</div>
                        </div>
                        <div class="details-row">
                            <div class="detail-label">آخر تسجيل دخول:</div>
                            <div class="detail-value">${getUserLastLogin(userId) || 'غير معروف'}</div>
                        </div>
                    </div>
                    
                    <div class="user-stats">
                        <div class="user-stat-item">
                            <div class="user-stat-value">${activities.logins}</div>
                            <div class="user-stat-label">تسجيلات الدخول</div>
                        </div>
                        <div class="user-stat-item">
                            <div class="user-stat-value">${activities.actions}</div>
                            <div class="user-stat-label">الإجراءات</div>
                        </div>
                        <div class="user-stat-item">
                            <div class="user-stat-value">${formatDateTime(new Date()).date}</div>
                            <div class="user-stat-label">اليوم</div>
                        </div>
                    </div>
                    
                    <div class="user-activities-section">
                        <h4 class="section-title">آخر الأنشطة</h4>
                        <div class="activities-list">
                            ${generateActivitiesList(activities.recent)}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                    <button class="btn btn-primary" id="edit-user-details-btn" data-id="${userId}">تعديل المستخدم</button>
                </div>
            `;
            
            // عرض النافذة
            showModal('user-details-modal', modalContent, function(modal) {
                // مستمع حدث زر التعديل
                const editUserBtn = modal.querySelector('#edit-user-details-btn');
                if (editUserBtn) {
                    editUserBtn.addEventListener('click', function() {
                        const userId = this.getAttribute('data-id');
                        closeModal();
                        showEditUserModal(userId);
                    });
                }
            });
        })
        .catch(error => {
            console.error('خطأ في الحصول على أنشطة المستخدم:', error);
            showNotification('حدث خطأ أثناء تحميل تفاصيل المستخدم', 'error');
        });
}

/**
 * الحصول على تاريخ إنشاء المستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {string} - تاريخ الإنشاء المنسق
 */
function getUserCreationDate(userId) {
    const userRow = document.querySelector(`tr[data-id="${userId}"]`);
    if (userRow) {
        return userRow.querySelector('td:nth-child(5)').textContent;
    }
    return 'غير معروف';
}

/**
 * الحصول على تاريخ آخر تسجيل دخول للمستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {string} - تاريخ آخر تسجيل دخول منسق
 */
function getUserLastLogin(userId) {
    const userRow = document.querySelector(`tr[data-id="${userId}"]`);
    if (userRow) {
        return userRow.querySelector('td:nth-child(6)').textContent;
    }
    return 'غير معروف';
}
/**
 * الحصول على أنشطة المستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<Object>} - وعد يحتوي على معلومات أنشطة المستخدم
 */
function getUserActivities(userId) {
    return new Promise((resolve, reject) => {
        if (databaseRef) {
            // الحصول على سجلات المستخدم من قاعدة البيانات
            databaseRef.ref('logs')
                .orderByChild('userId')
                .equalTo(userId)
                .limitToLast(50)
                .once('value')
                .then(snapshot => {
                    const activities = {
                        logins: 0,
                        actions: 0,
                        recent: []
                    };
                    
                    // معالجة بيانات الأنشطة
                    snapshot.forEach(childSnapshot => {
                        const activity = childSnapshot.val();
                        
                        if (activity) {
                            // إضافة النشاط إلى القائمة
                            activities.recent.push({
                                id: childSnapshot.key,
                                ...activity
                            });
                            
                            // حساب الإحصائيات
                            if (activity.type === 'user_login') {
                                activities.logins++;
                            } else {
                                activities.actions++;
                            }
                        }
                    });
                    
                    // ترتيب الأنشطة حسب التاريخ (الأحدث أولاً)
                    activities.recent.sort((a, b) => {
                        return new Date(b.timestamp) - new Date(a.timestamp);
                    });
                    
                    // اقتصار القائمة على آخر 10 أنشطة
                    activities.recent = activities.recent.slice(0, 10);
                    
                    resolve(activities);
                })
                .catch(error => {
                    console.error('خطأ في الحصول على أنشطة المستخدم:', error);
                    reject(error);
                });
        } else {
            // محاكاة الحصول على أنشطة المستخدم في وضع العرض التوضيحي
            const demoActivities = getDemoUserActivities(userId);
            resolve(demoActivities);
        }
    });
}

/**
 * الحصول على أنشطة المستخدم التجريبية
 * @param {string} userId - معرف المستخدم
 * @returns {Object} - بيانات أنشطة المستخدم التجريبية
 */
function getDemoUserActivities(userId) {
    // أنواع الأنشطة للعرض التوضيحي
    const activityTypes = [
        'user_login',
        'user_logout',
        'settings_updated',
        'data_exported',
        'data_imported'
    ];
    
    const activities = {
        logins: Math.floor(Math.random() * 30) + 5,
        actions: Math.floor(Math.random() * 50) + 10,
        recent: []
    };
    
    // إنشاء قائمة الأنشطة الأخيرة
    const currentDate = new Date();
    
    for (let i = 0; i < 10; i++) {
        // تاريخ النشاط (خلال الأيام الـ 30 الماضية)
        const activityDate = new Date(currentDate);
        activityDate.setDate(activityDate.getDate() - Math.floor(Math.random() * 30));
        
        // نوع النشاط
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        
        // تفاصيل النشاط
        let details = '';
        
        switch (activityType) {
            case 'user_login':
                details = 'تم تسجيل الدخول إلى النظام';
                break;
                
            case 'user_logout':
                details = 'تم تسجيل الخروج من النظام';
                break;
                
            case 'settings_updated':
                details = 'تم تحديث إعدادات النظام';
                break;
                
            case 'data_exported':
                details = 'تم تصدير بيانات النظام';
                break;
                
            case 'data_imported':
                details = 'تم استيراد بيانات جديدة إلى النظام';
                break;
        }
        
        // إضافة النشاط إلى القائمة
        activities.recent.push({
            id: 'activity_' + (i + 1),
            timestamp: activityDate.toISOString(),
            type: activityType,
            details: details,
            userId: userId,
            userName: 'مستخدم تجريبي',
            targetType: activityType.split('_')[0]
        });
    }
    
    // ترتيب الأنشطة حسب التاريخ (الأحدث أولاً)
    activities.recent.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    return activities;
}

/**
 * إنشاء قائمة الأنشطة الأخيرة
 * @param {Array} activities - قائمة الأنشطة
 * @returns {string} - HTML لقائمة الأنشطة
 */
function generateActivitiesList(activities) {
    if (!activities || activities.length === 0) {
        return `
            <div class="empty-activities">
                <i class="fas fa-history"></i>
                <p>لا توجد أنشطة سابقة لهذا المستخدم</p>
            </div>
        `;
    }
    
    let activitiesHTML = '';
    
    activities.forEach(activity => {
        // تنسيق التاريخ والوقت
        const timestamp = activity.timestamp ? new Date(activity.timestamp) : new Date();
        const formatted = formatDateTime(timestamp);
        
        activitiesHTML += `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-details">${activity.details}</div>
                    <div class="activity-time">${formatted.date} ${formatted.time}</div>
                </div>
            </div>
        `;
    });
    
    return activitiesHTML;
}

/**
 * الحصول على أيقونة مناسبة لنوع النشاط
 * @param {string} activityType - نوع النشاط
 * @returns {string} - فئة الأيقونة
 */
function getActivityIcon(activityType) {
    switch (activityType) {
        case 'user_login':
            return 'fa-sign-in-alt';
        case 'user_logout':
            return 'fa-sign-out-alt';
        case 'user_created':
            return 'fa-user-plus';
        case 'user_updated':
            return 'fa-user-edit';
        case 'user_deleted':
            return 'fa-user-minus';
        case 'permissions_updated':
            return 'fa-key';
        case 'settings_updated':
            return 'fa-cog';
        case 'data_exported':
            return 'fa-file-export';
        case 'data_imported':
            return 'fa-file-import';
        case 'backup_created':
            return 'fa-save';
        case 'backup_restored':
            return 'fa-undo';
        default:
            return 'fa-history';
    }
}

/**
 * عرض إحصائيات النظام
 */
function showSystemStats() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canManageSettings')) {
        showNotification('ليس لديك صلاحية لعرض إحصائيات النظام', 'error');
        return;
    }
    
    // جمع الإحصائيات
    getSystemStats()
        .then(stats => {
            // إنشاء محتوى النافذة
            const modalContent = `
                <div class="modal-header">
                    <h3 class="modal-title">إحصائيات النظام</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body system-stats-modal">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.totalUsers}</div>
                                <div class="stat-label">إجمالي المستخدمين</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-user-shield"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.adminUsers}</div>
                                <div class="stat-label">المسؤولين</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-user-tie"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.managerUsers}</div>
                                <div class="stat-label">المدراء</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.regularUsers}</div>
                                <div class="stat-label">المستخدمين العاديين</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-sign-in-alt"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.loginsToday}</div>
                                <div class="stat-label">تسجيلات الدخول اليوم</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.activitiesToday}</div>
                                <div class="stat-label">أنشطة اليوم</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-history"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.totalActivities}</div>
                                <div class="stat-label">إجمالي الأنشطة</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${formatDateTime(new Date()).date}</div>
                                <div class="stat-label">تاريخ اليوم</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="system-info-section">
                        <h4 class="section-title">معلومات النظام</h4>
                        <div class="details-row">
                            <div class="detail-label">إصدار النظام:</div>
                            <div class="detail-value">1.0.0</div>
                        </div>
                        <div class="details-row">
                            <div class="detail-label">آخر تحديث:</div>
                            <div class="detail-value">${stats.lastUpdate}</div>
                        </div>
                        <div class="details-row">
                            <div class="detail-label">مساحة قاعدة البيانات:</div>
                            <div class="detail-value">${stats.databaseSize}</div>
                        </div>
                        <div class="details-row">
                            <div class="detail-label">حالة النظام:</div>
                            <div class="detail-value"><span class="badge badge-success">نشط</span></div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                    <button class="btn btn-primary" id="export-stats-btn">تصدير التقرير</button>
                </div>
            `;
            
            // عرض النافذة
            showModal('system-stats-modal', modalContent, function(modal) {
                // مستمع حدث زر التصدير
                const exportStatsBtn = modal.querySelector('#export-stats-btn');
                if (exportStatsBtn) {
                    exportStatsBtn.addEventListener('click', function() {
                        exportSystemStats(stats);
                    });
                }
            });
        })
        .catch(error => {
            console.error('خطأ في الحصول على إحصائيات النظام:', error);
            showNotification('حدث خطأ أثناء تحميل إحصائيات النظام', 'error');
        });
}

/**
 * الحصول على إحصائيات النظام
 * @returns {Promise<Object>} - وعد يحتوي على إحصائيات النظام
 */
function getSystemStats() {
    return new Promise((resolve, reject) => {
        const stats = {
            totalUsers: 0,
            adminUsers: 0,
            managerUsers: 0,
            regularUsers: 0,
            loginsToday: 0,
            activitiesToday: 0,
            totalActivities: 0,
            lastUpdate: '2023-06-01',
            databaseSize: '125 MB'
        };
        
        if (databaseRef) {
            // جمع إحصائيات المستخدمين
            databaseRef.ref('users').once('value')
                .then(usersSnapshot => {
                    // إحصاء المستخدمين حسب النوع
                    usersSnapshot.forEach(childSnapshot => {
                        const userData = childSnapshot.val();
                        
                        if (userData && userData.profile) {
                            stats.totalUsers++;
                            
                            switch (userData.profile.type) {
                                case 'admin':
                                    stats.adminUsers++;
                                    break;
                                case 'manager':
                                    stats.managerUsers++;
                                    break;
                                default:
                                    stats.regularUsers++;
                                    break;
                            }
                        }
                    });
                    
                    // الحصول على إحصائيات الأنشطة
                    return databaseRef.ref('logs').once('value');
                })
                .then(logsSnapshot => {
                    // إجمالي عدد الأنشطة
                    stats.totalActivities = logsSnapshot.numChildren();
                    
                    // فلترة أنشطة اليوم
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    logsSnapshot.forEach(childSnapshot => {
                        const logData = childSnapshot.val();
                        
                        if (logData && logData.timestamp) {
                            const logDate = new Date(logData.timestamp);
                            
                            // التحقق مما إذا كان النشاط اليوم
                            if (logDate >= today) {
                                stats.activitiesToday++;
                                
                                // عد تسجيلات الدخول
                                if (logData.type === 'user_login') {
                                    stats.loginsToday++;
                                }
                            }
                        }
                    });
                    
                    resolve(stats);
                })
                .catch(error => {
                    console.error('خطأ في الحصول على إحصائيات النظام:', error);
                    reject(error);
                });
        } else {
            // محاكاة الإحصائيات في وضع العرض التوضيحي
            stats.totalUsers = 35;
            stats.adminUsers = 3;
            stats.managerUsers = 7;
            stats.regularUsers = 25;
            stats.loginsToday = 12;
            stats.activitiesToday = 48;
            stats.totalActivities = 1250;
            
            resolve(stats);
        }
    });
}

/**
 * تصدير تقرير إحصائيات النظام
 * @param {Object} stats - إحصائيات النظام
 */
function exportSystemStats(stats) {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canExportData')) {
        showNotification('ليس لديك صلاحية لتصدير تقارير النظام', 'error');
        return;
    }
    
    // إنشاء محتوى التقرير
    const today = formatDateTime(new Date());
    
    let reportContent = `# تقرير إحصائيات النظام
تاريخ التقرير: ${today.date} ${today.time}

## إحصائيات المستخدمين
- إجمالي المستخدمين: ${stats.totalUsers}
- المسؤولين: ${stats.adminUsers}
- المدراء: ${stats.managerUsers}
- المستخدمين العاديين: ${stats.regularUsers}

## إحصائيات النشاط
- تسجيلات الدخول اليوم: ${stats.loginsToday}
- أنشطة اليوم: ${stats.activitiesToday}
- إجمالي الأنشطة: ${stats.totalActivities}

## معلومات النظام
- إصدار النظام: 1.0.0
- آخر تحديث: ${stats.lastUpdate}
- مساحة قاعدة البيانات: ${stats.databaseSize}
- حالة النظام: نشط
`;
    
    // تحويل المحتوى إلى Blob
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // إنشاء رابط التنزيل
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `تقرير_النظام_${today.date.replace(/-/g, '_')}.txt`;
    
    // تنزيل الملف
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // تسجيل النشاط
    logActivity({
        type: 'stats_exported',
        details: 'تم تصدير تقرير إحصائيات النظام',
        targetType: 'stats'
    });
    
    showNotification('تم تصدير تقرير إحصائيات النظام بنجاح', 'success');
}

/**
 * عرض مدير الإعدادات العامة
 */
function showSystemSettings() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canManageSettings')) {
        showNotification('ليس لديك صلاحية لإدارة إعدادات النظام', 'error');
        return;
    }
    
    // الحصول على الإعدادات الحالية
    getSystemSettings()
        .then(settings => {
            // إنشاء محتوى النافذة
            const modalContent = `
                <div class="modal-header">
                    <h3 class="modal-title">إعدادات النظام</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body system-settings-modal">
                    <div class="settings-tabs">
                        <button class="tab-btn active" data-tab="general">عام</button>
                        <button class="tab-btn" data-tab="security">الأمان</button>
                        <button class="tab-btn" data-tab="notifications">الإشعارات</button>
                        <button class="tab-btn" data-tab="backup">النسخ الاحتياطي</button>
                    </div>
                    
                    <div class="settings-content">
                        <div class="tab-content active" id="general-tab">
                            <h4 class="settings-section-title">الإعدادات العامة</h4>
                            
                            <div class="form-group">
                                <label class="form-label">اسم النظام</label>
                                <input type="text" class="form-input" id="system-name" value="${settings.general.systemName}">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">شعار النظام</label>
                                <div class="system-logo-container">
                                    <div class="system-logo-preview">
                                        <i class="fas ${settings.general.logoIcon}"></i>
                                    </div>
                                    <input type="text" class="form-input" id="system-logo-icon" value="${settings.general.logoIcon}" placeholder="fa-wallet">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">لون الواجهة الرئيسي</label>
                                <input type="color" class="form-input color-input" id="system-primary-color" value="${settings.general.primaryColor}">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">اللغة الافتراضية</label>
                                <select class="form-select" id="system-language">
                                    <option value="ar" ${settings.general.language === 'ar' ? 'selected' : ''}>العربية</option>
                                    <option value="en" ${settings.general.language === 'en' ? 'selected' : ''}>الإنجليزية</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">المنطقة الزمنية</label>
                                <select class="form-select" id="system-timezone">
                                    <option value="Asia/Riyadh" ${settings.general.timezone === 'Asia/Riyadh' ? 'selected' : ''}>الرياض (GMT+3)</option>
                                    <option value="Asia/Dubai" ${settings.general.timezone === 'Asia/Dubai' ? 'selected' : ''}>دبي (GMT+4)</option>
                                    <option value="Asia/Baghdad" ${settings.general.timezone === 'Asia/Baghdad' ? 'selected' : ''}>بغداد (GMT+3)</option>
                                    <option value="Africa/Cairo" ${settings.general.timezone === 'Africa/Cairo' ? 'selected' : ''}>القاهرة (GMT+2)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="security-tab">
                            <h4 class="settings-section-title">إعدادات الأمان</h4>
                            
                            <div class="form-group">
                                <label class="form-label">الحد الأدنى لطول كلمة المرور</label>
                                <input type="number" class="form-input" id="min-password-length" value="${settings.security.minPasswordLength}" min="6" max="20">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">تعقيد كلمة المرور</label>
                                <select class="form-select" id="password-complexity">
                                    <option value="low" ${settings.security.passwordComplexity === 'low' ? 'selected' : ''}>بسيط</option>
                                    <option value="medium" ${settings.security.passwordComplexity === 'medium' ? 'selected' : ''}>متوسط</option>
                                    <option value="high" ${settings.security.passwordComplexity === 'high' ? 'selected' : ''}>مرتفع</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">مدة صلاحية الجلسة (بالدقائق)</label>
                                <input type="number" class="form-input" id="session-timeout" value="${settings.security.sessionTimeout}" min="5" max="1440">
                            </div>
                            
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="enable-2fa" ${settings.security.enable2FA ? 'checked' : ''}>
                                    <span>تفعيل المصادقة الثنائية</span>
                                </label>
                            </div>
                            
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="enforce-password-change" ${settings.security.enforcePasswordChange ? 'checked' : ''}>
                                    <span>فرض تغيير كلمة المرور كل 90 يوم</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="notifications-tab">
                            <h4 class="settings-section-title">إعدادات الإشعارات</h4>
                            
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="email-notifications" ${settings.notifications.emailNotifications ? 'checked' : ''}>
                                    <span>تفعيل الإشعارات عبر البريد الإلكتروني</span>
                                </label>
                            </div>
                            
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="push-notifications" ${settings.notifications.pushNotifications ? 'checked' : ''}>
                                    <span>تفعيل الإشعارات المباشرة</span>
                                </label>
                            </div>
                            
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="login-notifications" ${settings.notifications.loginNotifications ? 'checked' : ''}>
                                    <span>إشعار عند تسجيل الدخول</span>
                                </label>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">البريد الإلكتروني للإشعارات</label>
                                <input type="email" class="form-input" id="notification-email" value="${settings.notifications.notificationEmail}">
                            </div>
                        </div>
                        
                        <div class="tab-content" id="backup-tab">
                            <h4 class="settings-section-title">إعدادات النسخ الاحتياطي</h4>
                            
                            <div class="form-group">
                                <label class="form-label">فترة النسخ الاحتياطي التلقائي</label>
                                <select class="form-select" id="auto-backup-frequency">
                                    <option value="daily" ${settings.backup.autoBackupFrequency === 'daily' ? 'selected' : ''}>يومي</option>
                                    <option value="weekly" ${settings.backup.autoBackupFrequency === 'weekly' ? 'selected' : ''}>أسبوعي</option>
                                    <option value="monthly" ${settings.backup.autoBackupFrequency === 'monthly' ? 'selected' : ''}>شهري</option>
                                    <option value="never" ${settings.backup.autoBackupFrequency === 'never' ? 'selected' : ''}>لا تفعل</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">عدد النسخ الاحتياطية المحتفظ بها</label>
                                <input type="number" class="form-input" id="backup-retention-count" value="${settings.backup.backupRetentionCount}" min="1" max="30">
                      <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="encrypt-backup" ${settings.backup.encryptBackup ? 'checked' : ''}>
                                    <span>تشفير النسخ الاحتياطية</span>
                                </label>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">مسار حفظ النسخ الاحتياطية</label>
                                <input type="text" class="form-input" id="backup-path" value="${settings.backup.backupPath}">
                            </div>
                            
                            <div class="backup-actions">
                                <button class="btn btn-primary" id="create-backup-btn">
                                    <i class="fas fa-save"></i>
                                    <span>إنشاء نسخة احتياطية الآن</span>
                                </button>
                                <button class="btn btn-outline" id="restore-backup-btn">
                                    <i class="fas fa-undo"></i>
                                    <span>استعادة من نسخة احتياطية</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-settings-btn">حفظ الإعدادات</button>
                </div>
            `;
            
            // عرض النافذة
            showModal('system-settings-modal', modalContent, function(modal) {
                // إضافة مستمعي الأحداث لعلامات التبويب
                const tabButtons = modal.querySelectorAll('.tab-btn');
                tabButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        // إزالة التنشيط من جميع الأزرار والمحتويات
                        tabButtons.forEach(btn => btn.classList.remove('active'));
                        modal.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                        
                        // تنشيط الزر والمحتوى المحدد
                        this.classList.add('active');
                        const tabId = this.getAttribute('data-tab');
                        modal.querySelector(`#${tabId}-tab`).classList.add('active');
                    });
                });
                
                // مستمع حدث تغيير أيقونة الشعار
                const logoIconInput = modal.querySelector('#system-logo-icon');
                const logoPreview = modal.querySelector('.system-logo-preview i');
                
                if (logoIconInput && logoPreview) {
                    logoIconInput.addEventListener('input', function() {
                        const iconClass = this.value.trim();
                        logoPreview.className = 'fas ' + iconClass;
                    });
                }
                
                // مستمع حدث إنشاء نسخة احتياطية
                const createBackupBtn = modal.querySelector('#create-backup-btn');
                if (createBackupBtn) {
                    createBackupBtn.addEventListener('click', createBackup);
                }
                
                // مستمع حدث استعادة من نسخة احتياطية
                const restoreBackupBtn = modal.querySelector('#restore-backup-btn');
                if (restoreBackupBtn) {
                    restoreBackupBtn.addEventListener('click', showRestoreBackupDialog);
                }
                
                // مستمع حدث زر حفظ الإعدادات
                const saveSettingsBtn = modal.querySelector('#save-settings-btn');
                if (saveSettingsBtn) {
                    saveSettingsBtn.addEventListener('click', saveSystemSettings);
                }
            });
        })
        .catch(error => {
            console.error('خطأ في الحصول على إعدادات النظام:', error);
            showNotification('حدث خطأ أثناء تحميل إعدادات النظام', 'error');
        });
}

/**
 * الحصول على إعدادات النظام
 * @returns {Promise<Object>} - وعد يحتوي على إعدادات النظام
 */
function getSystemSettings() {
    return new Promise((resolve, reject) => {
        if (databaseRef) {
            databaseRef.ref('settings').once('value')
                .then(snapshot => {
                    const settings = snapshot.val() || getDefaultSettings();
                    resolve(settings);
                })
                .catch(error => {
                    console.error('خطأ في الحصول على إعدادات النظام:', error);
                    reject(error);
                });
        } else {
            // محاكاة الإعدادات في وضع العرض التوضيحي
            const demoSettings = getDefaultSettings();
            resolve(demoSettings);
        }
    });
}

/**
 * الحصول على الإعدادات الافتراضية
 * @returns {Object} - الإعدادات الافتراضية
 */
function getDefaultSettings() {
    return {
        general: {
            systemName: 'نظام الاستثمار',
            logoIcon: 'fa-wallet',
            primaryColor: '#3b82f6',
            language: 'ar',
            timezone: 'Asia/Riyadh'
        },
        security: {
            minPasswordLength: 8,
            passwordComplexity: 'medium',
            sessionTimeout: 30,
            enable2FA: false,
            enforcePasswordChange: false
        },
        notifications: {
            emailNotifications: true,
            pushNotifications: true,
            loginNotifications: true,
            notificationEmail: 'admin@example.com'
        },
        backup: {
            autoBackupFrequency: 'weekly',
            backupRetentionCount: 5,
            encryptBackup: true,
            backupPath: '/backups/'
        }
    };
}

/**
 * حفظ إعدادات النظام
 */
function saveSystemSettings() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canManageSettings')) {
        showNotification('ليس لديك صلاحية لإدارة إعدادات النظام', 'error');
        return;
    }
    
    // جمع الإعدادات من النموذج
    const settings = {
        general: {
            systemName: document.getElementById('system-name').value,
            logoIcon: document.getElementById('system-logo-icon').value,
            primaryColor: document.getElementById('system-primary-color').value,
            language: document.getElementById('system-language').value,
            timezone: document.getElementById('system-timezone').value
        },
        security: {
            minPasswordLength: parseInt(document.getElementById('min-password-length').value),
            passwordComplexity: document.getElementById('password-complexity').value,
            sessionTimeout: parseInt(document.getElementById('session-timeout').value),
            enable2FA: document.getElementById('enable-2fa').checked,
            enforcePasswordChange: document.getElementById('enforce-password-change').checked
        },
        notifications: {
            emailNotifications: document.getElementById('email-notifications').checked,
            pushNotifications: document.getElementById('push-notifications').checked,
            loginNotifications: document.getElementById('login-notifications').checked,
            notificationEmail: document.getElementById('notification-email').value
        },
        backup: {
            autoBackupFrequency: document.getElementById('auto-backup-frequency').value,
            backupRetentionCount: parseInt(document.getElementById('backup-retention-count').value),
            encryptBackup: document.getElementById('encrypt-backup').checked,
            backupPath: document.getElementById('backup-path').value
        }
    };
    
    // التحقق من صحة الإعدادات
    if (!settings.general.systemName) {
        showNotification('يجب إدخال اسم النظام', 'error');
        return;
    }
    
    if (!validateEmail(settings.notifications.notificationEmail)) {
        showNotification('البريد الإلكتروني للإشعارات غير صالح', 'error');
        return;
    }
    
    // حفظ الإعدادات في قاعدة البيانات
    if (databaseRef) {
        databaseRef.ref('settings').set(settings)
            .then(() => {
                showNotification('تم حفظ إعدادات النظام بنجاح', 'success');
                closeModal();
                
                // تطبيق الإعدادات على واجهة المستخدم
                applySystemSettings(settings);
                
                // تسجيل النشاط
                logActivity({
                    type: 'settings_updated',
                    details: 'تم تحديث إعدادات النظام',
                    targetType: 'settings'
                });
            })
            .catch(error => {
                console.error('خطأ في حفظ إعدادات النظام:', error);
                showNotification(getErrorMessage(error) || 'حدث خطأ أثناء حفظ إعدادات النظام', 'error');
            });
    } else {
        // محاكاة حفظ الإعدادات في وضع العرض التوضيحي
        showNotification('تم حفظ إعدادات النظام بنجاح (وضع العرض التوضيحي)', 'success');
        closeModal();
        
        // تطبيق الإعدادات على واجهة المستخدم
        applySystemSettings(settings);
    }
}

/**
 * تطبيق إعدادات النظام على واجهة المستخدم
 * @param {Object} settings - إعدادات النظام
 */
function applySystemSettings(settings) {
    // تطبيق اللون الرئيسي
    if (settings.general.primaryColor) {
        // إنشاء عنصر نمط لتطبيق اللون الرئيسي
        let styleElement = document.getElementById('system-theme-colors');
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'system-theme-colors';
            document.head.appendChild(styleElement);
        }
        
        // تحديث متغيرات CSS
        styleElement.textContent = `
            :root {
                --primary-color: ${settings.general.primaryColor};
                --primary-color-hover: ${adjustColorBrightness(settings.general.primaryColor, -15)};
                --primary-color-light: ${adjustColorBrightness(settings.general.primaryColor, 40)};
                --primary-color-very-light: ${adjustColorBrightness(settings.general.primaryColor, 85)};
            }
        `;
    }
    
    // تحديث اسم النظام
    const systemNameElements = document.querySelectorAll('.system-name');
    systemNameElements.forEach(element => {
        element.textContent = settings.general.systemName;
    });
    
    // تحديث أيقونة الشعار
    const logoIconElements = document.querySelectorAll('.logo-icon');
    logoIconElements.forEach(element => {
        element.className = 'logo-icon fas ' + settings.general.logoIcon;
    });
    
    // تطبيق إعدادات اللغة
    if (settings.general.language) {
        document.documentElement.lang = settings.general.language;
        document.documentElement.dir = settings.general.language === 'ar' ? 'rtl' : 'ltr';
    }
}

/**
 * تعديل سطوع اللون
 * @param {string} color - قيمة اللون بصيغة HEX
 * @param {number} percent - نسبة التعديل (موجبة للتفتيح، سالبة للتعتيم)
 * @returns {string} - اللون المعدل بصيغة HEX
 */
function adjustColorBrightness(color, percent) {
    if (!color) return '#3b82f6';
    
    // تحويل اللون من HEX إلى RGB
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    
    // تعديل قيم RGB حسب النسبة المئوية
    r = Math.min(255, Math.max(0, r + (percent / 100) * 255));
    g = Math.min(255, Math.max(0, g + (percent / 100) * 255));
    b = Math.min(255, Math.max(0, b + (percent / 100) * 255));
    
    // تقريب القيم إلى أعداد صحيحة
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    
    // تحويل القيم المعدلة إلى HEX
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * إنشاء نسخة احتياطية
 */
function createBackup() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canCreateBackup')) {
        showNotification('ليس لديك صلاحية لإنشاء نسخة احتياطية', 'error');
        return;
    }
    
    // عرض شاشة التحميل
    showLoadingOverlay('جارٍ إنشاء نسخة احتياطية للنظام...');
    
    // في التطبيق الحقيقي، هذه العملية ستتم على الخادم
    // هنا نقوم بمحاكاة العملية
    setTimeout(() => {
        hideLoadingOverlay();
        
        // إنشاء معرف فريد للنسخة الاحتياطية
        const backupId = 'backup_' + new Date().getTime();
        const backupDate = formatDateTime(new Date());
        
        if (databaseRef) {
            // حفظ معلومات النسخة الاحتياطية في قاعدة البيانات
            databaseRef.ref(`backups/${backupId}`).set({
                id: backupId,
                name: `نسخة_احتياطية_${backupDate.date.replace(/-/g, '_')}`,
                timestamp: new Date().toISOString(),
                size: '25 MB',
                createdBy: currentUser ? currentUser.uid : 'system',
                createdByName: currentUser ? (currentUser.fullName || currentUser.email) : 'النظام',
                encrypted: document.getElementById('encrypt-backup').checked
            })
            .then(() => {
                showNotification('تم إنشاء النسخة الاحتياطية بنجاح', 'success');
                
                // تسجيل النشاط
                logActivity({
                    type: 'backup_created',
                    details: `تم إنشاء نسخة احتياطية جديدة: نسخة_احتياطية_${backupDate.date.replace(/-/g, '_')}`,
                    targetId: backupId,
                    targetType: 'backup'
                });
            })
            .catch(error => {
                console.error('خطأ في حفظ معلومات النسخة الاحتياطية:', error);
                showNotification(getErrorMessage(error) || 'حدث خطأ أثناء إنشاء النسخة الاحتياطية', 'error');
            });
        } else {
            // محاكاة إنشاء النسخة الاحتياطية في وضع العرض التوضيحي
            showNotification('تم إنشاء النسخة الاحتياطية بنجاح (وضع العرض التوضيحي)', 'success');
        }
    }, 2000);
}

/**
 * عرض شاشة التحميل
 * @param {string} message - رسالة التحميل
 */
function showLoadingOverlay(message) {
    // التحقق من وجود شاشة التحميل
    let loadingOverlay = document.getElementById('loading-overlay');
    
    if (!loadingOverlay) {
        // إنشاء شاشة التحميل
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'loading-overlay';
        
        loadingOverlay.innerHTML = `
            <div class="loading-container">
                <div class="loader"></div>
                <div class="loading-message"></div>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
    }
    
    // تحديث رسالة التحميل
    const loadingMessage = loadingOverlay.querySelector('.loading-message');
    if (loadingMessage) {
        loadingMessage.textContent = message || 'جارٍ التحميل...';
    }
    
    // إظهار شاشة التحميل
    loadingOverlay.classList.add('visible');
}

/**
 * إخفاء شاشة التحميل
 */
function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (loadingOverlay) {
        loadingOverlay.classList.remove('visible');
    }
}

/**
 * عرض نافذة استعادة النسخة الاحتياطية
 */
function showRestoreBackupDialog() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canRestoreBackup')) {
        showNotification('ليس لديك صلاحية لاستعادة نسخة احتياطية', 'error');
        return;
    }
    
    // الحصول على قائمة النسخ الاحتياطية
    getBackupsList()
        .then(backups => {
            // إنشاء محتوى النافذة
            let backupOptionsHTML = '';
            
            if (backups.length === 0) {
                backupOptionsHTML = '<option value="">لا توجد نسخ احتياطية متاحة</option>';
            } else {
                backups.forEach(backup => {
                    const backupDate = new Date(backup.timestamp);
                    const formattedDate = formatDateTime(backupDate);
                    
                    backupOptionsHTML += `
                        <option value="${backup.id}">
                            ${backup.name} (${formattedDate.date} ${formattedDate.time}) - ${backup.size}
                        </option>
                    `;
                });
            }
            
            const modalContent = `
                <div class="modal-header">
                    <h3 class="modal-title">استعادة من نسخة احتياطية</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body restore-backup-modal">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle alert-icon"></i>
                        <div>
                            <strong>تحذير:</strong> استعادة النسخة الاحتياطية ستؤدي إلى استبدال جميع البيانات الحالية.
                            يرجى التأكد من رغبتك في المتابعة.
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">اختر النسخة الاحتياطية</label>
                        <select class="form-select" id="backup-select" ${backups.length === 0 ? 'disabled' : ''}>
                            ${backupOptionsHTML}
                        </select>
                    </div>
                    
                    ${backups.length > 0 ? `
                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="confirm-restore">
                                <span>أقر بأنني أريد استعادة البيانات من النسخة الاحتياطية المحددة</span>
                            </label>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-warning" id="restore-btn" ${backups.length === 0 ? 'disabled' : ''}>استعادة النسخة الاحتياطية</button>
                </div>
            `;
            
            // عرض النافذة
            showModal('restore-backup-modal', modalContent, function(modal) {
                // مستمع حدث زر الاستعادة
                const restoreBtn = modal.querySelector('#restore-btn');
                if (restoreBtn) {
                    restoreBtn.addEventListener('click', function() {
                        const backupId = modal.querySelector('#backup-select').value;
                        const confirmed = modal.querySelector('#confirm-restore')?.checked || false;
                        
                        if (!backupId) {
                            showNotification('يرجى اختيار نسخة احتياطية', 'error');
                            return;
                        }
                        
                        if (!confirmed) {
                            showNotification('يرجى تأكيد رغبتك في استعادة النسخة الاحتياطية', 'error');
                            return;
                        }
                        
                        // استعادة النسخة الاحتياطية
                        restoreBackup(backupId);
                    });
                }
            });
        })
        .catch(error => {
            console.error('خطأ في الحصول على قائمة النسخ الاحتياطية:', error);
            showNotification('حدث خطأ أثناء تحميل قائمة النسخ الاحتياطية', 'error');
        });
}

/**
 * الحصول على قائمة النسخ الاحتياطية
 * @returns {Promise<Array>} - وعد يحتوي على قائمة النسخ الاحتياطية
 */
function getBackupsList() {
    return new Promise((resolve, reject) => {
        if (databaseRef) {
            databaseRef.ref('backups')
                .orderByChild('timestamp')
                .once('value')
                .then(snapshot => {
                    const backups = [];
                    
                    // جمع بيانات النسخ الاحتياطية
                    snapshot.forEach(childSnapshot => {
                        const backupData = childSnapshot.val();
                        
                        if (backupData) {
                            backups.push(backupData);
                        }
                    });
                    
                    // ترتيب النسخ الاحتياطية حسب التاريخ (الأحدث أولاً)
                    backups.sort((a, b) => {
                        return new Date(b.timestamp) - new Date(a.timestamp);
                    });
                    
                    resolve(backups);
                })
                .catch(error => {
                    console.error('خطأ في الحصول على قائمة النسخ الاحتياطية:', error);
                    reject(error);
                });
        } else {
            // محاكاة قائمة النسخ الاحتياطية في وضع العرض التوضيحي
            const demoBackups = getDemoBackups();
            resolve(demoBackups);
        }
    });
}

/**
 * الحصول على قائمة النسخ الاحتياطية التجريبية
 * @returns {Array} - قائمة النسخ الاحتياطية التجريبية
 */
function getDemoBackups() {
    const backups = [];
    const today = new Date();
    
    // إنشاء 5 نسخ احتياطية تجريبية
    for (let i = 0; i < 5; i++) {
        const backupDate = new Date(today);
        backupDate.setDate(backupDate.getDate() - i * 7); // كل أسبوع
        
        const formattedDate = formatDateTime(backupDate);
        const backupId = 'backup_' + backupDate.getTime();
        
        backups.push({
            id: backupId,
            name: `نسخة_احتياطية_${formattedDate.date.replace(/-/g, '_')}`,
            timestamp: backupDate.toISOString(),
            size: '25 MB',
            createdBy: 'system',
            createdByName: 'النظام',
            encrypted: true
        });
    }
    
    return backups;
}

/**
 * استعادة النسخة الاحتياطية
 * @param {string} backupId - معرف النسخة الاحتياطية
 */
function restoreBackup(backupId) {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canRestoreBackup')) {
        showNotification('ليس لديك صلاحية لاستعادة نسخة احتياطية', 'error');
        return;
    }
    
    // إغلاق نافذة الاستعادة
    closeModal();
    
    // عرض شاشة التحميل
    showLoadingOverlay('جارٍ استعادة البيانات من النسخة الاحتياطية...');
    
    // في التطبيق الحقيقي، هذه العملية ستتم على الخادم
    // هنا نقوم بمحاكاة العملية
    setTimeout(() => {
        hideLoadingOverlay();
        
        if (databaseRef) {
            // الحصول على معلومات النسخة الاحتياطية
            databaseRef.ref(`backups/${backupId}`).once('value')
                .then(snapshot => {
                    const backupData = snapshot.val();
                    
                    if (!backupData) {
                        throw new Error('لم يتم العثور على النسخة الاحتياطية');
                    }
                    
                    // تسجيل النشاط
                    return logActivity({
                        type: 'backup_restored',
                        details: `تم استعادة البيانات من النسخة الاحتياطية: ${backupData.name}`,
                        targetId: backupId,
                        targetType: 'backup'
                    });
                })
                .then(() => {
                    showNotification('تم استعادة البيانات من النسخة الاحتياطية بنجاح', 'success');
                    
                    // إعادة تحميل الصفحة لعرض البيانات المستعادة
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                })
                .catch(error => {
                    console.error('خطأ في استعادة النسخة الاحتياطية:', error);
                    showNotification(getErrorMessage(error) || 'حدث خطأ أثناء استعادة النسخة الاحتياطية', 'error');
                });
        } else {
            // محاكاة استعادة النسخة الاحتياطية في وضع العرض التوضيحي
            showNotification('تم استعادة البيانات من النسخة الاحتياطية بنجاح (وضع العرض التوضيحي)', 'success');
        }
    }, 3000);
}

/**
 * تهيئة الوظائف الإضافية عند تحميل الصفحة
 */
document.addEventListener('DOMContentLoaded', function() {
    // إضافة رابط الإعدادات إلى الشريط الجانبي
    const sidebarNav = document.querySelector('.sidebar .nav-list');
    if (sidebarNav) {
        // إنشاء عنصر قائمة للإحصائيات
        const statsNavItem = document.createElement('li');
        statsNavItem.className = 'nav-item admin-only';
        statsNavItem.setAttribute('data-permission', 'canManageSettings');
        
        // إضافة الرابط
        statsNavItem.innerHTML = `
            <a class="nav-link" href="#" id="system-stats-link">
                <div class="nav-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <span>إحصائيات النظام</span>
            </a>
        `;
        
        // إنشاء عنصر قائمة للإعدادات
        const settingsNavItem = document.createElement('li');
        settingsNavItem.className = 'nav-item admin-only';
        settingsNavItem.setAttribute('data-permission', 'canManageSettings');
        
        // إضافة الرابط
        settingsNavItem.innerHTML = `
            <a class="nav-link" href="#" id="system-settings-link">
                <div class="nav-icon">
                    <i class="fas fa-cog"></i>
                </div>
              <span>إعدادات النظام</span>
            </a>
        `;
        
        // إضافة العناصر إلى الشريط الجانبي
        const logoutNavItem = document.querySelector('.nav-item:last-child');
        if (logoutNavItem) {
            sidebarNav.insertBefore(statsNavItem, logoutNavItem);
            sidebarNav.insertBefore(settingsNavItem, logoutNavItem);
        } else {
            sidebarNav.appendChild(statsNavItem);
            sidebarNav.appendChild(settingsNavItem);
        }
        
        // إضافة مستمعي الأحداث
        const statsLink = document.getElementById('system-stats-link');
        if (statsLink) {
            statsLink.addEventListener('click', function(e) {
                e.preventDefault();
                showSystemStats();
            });
        }
        
        const settingsLink = document.getElementById('system-settings-link');
        if (settingsLink) {
            settingsLink.addEventListener('click', function(e) {
                e.preventDefault();
                showSystemSettings();
            });
        }
    }
    
    // الحصول على إعدادات النظام وتطبيقها
    getSystemSettings()
        .then(settings => {
            applySystemSettings(settings);
        })
        .catch(error => {
            console.error('خطأ في الحصول على إعدادات النظام:', error);
        });
});

/**
 * استيراد البيانات من ملف
 */
function importData() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canImportData')) {
        showNotification('ليس لديك صلاحية لاستيراد البيانات', 'error');
        return;
    }
    
    // إنشاء محتوى النافذة
    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">استيراد البيانات</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body import-data-modal">
            <div class="import-options">
                <div class="import-option">
                    <input type="radio" name="import-type" id="import-users" value="users">
                    <label for="import-users">
                        <i class="fas fa-users"></i>
                        <span>استيراد المستخدمين</span>
                    </label>
                </div>
                
                <div class="import-option">
                    <input type="radio" name="import-type" id="import-data" value="data" checked>
                    <label for="import-data">
                        <i class="fas fa-database"></i>
                        <span>استيراد البيانات</span>
                    </label>
                </div>
                
                <div class="import-option">
                    <input type="radio" name="import-type" id="import-settings" value="settings">
                    <label for="import-settings">
                        <i class="fas fa-cog"></i>
                        <span>استيراد الإعدادات</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">اختر ملف الاستيراد</label>
                <div class="file-upload-container">
                    <input type="file" id="import-file" class="file-input" accept=".json,.csv,.xlsx">
                    <label for="import-file" class="file-upload-btn">
                        <i class="fas fa-upload"></i>
                        <span>اختر ملف</span>
                    </label>
                    <div class="file-name" id="import-file-name">لم يتم اختيار ملف</div>
                </div>
            </div>
            
            <div class="form-group checkbox-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="overwrite-existing">
                    <span>استبدال البيانات الموجودة</span>
                </label>
            </div>
            
            <div class="alert alert-info">
                <i class="fas fa-info-circle alert-icon"></i>
                <div>
                    <strong>ملاحظة:</strong> يجب أن يكون الملف بتنسيق JSON أو CSV أو Excel، ويجب أن يتبع بنية البيانات المطلوبة.
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إلغاء</button>
            <button class="btn btn-primary" id="start-import-btn">بدء الاستيراد</button>
        </div>
    `;
    
    // عرض النافذة
    showModal('import-data-modal', modalContent, function(modal) {
        // مستمع حدث اختيار الملف
        const fileInput = modal.querySelector('#import-file');
        const fileNameDisplay = modal.querySelector('#import-file-name');
        
        if (fileInput && fileNameDisplay) {
            fileInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                    fileNameDisplay.textContent = this.files[0].name;
                } else {
                    fileNameDisplay.textContent = 'لم يتم اختيار ملف';
                }
            });
        }
        
        // مستمع حدث زر بدء الاستيراد
        const startImportBtn = modal.querySelector('#start-import-btn');
        if (startImportBtn) {
            startImportBtn.addEventListener('click', function() {
                const importType = modal.querySelector('input[name="import-type"]:checked').value;
                const fileInput = modal.querySelector('#import-file');
                const overwriteExisting = modal.querySelector('#overwrite-existing').checked;
                
                if (!fileInput.files.length) {
                    showNotification('يرجى اختيار ملف للاستيراد', 'error');
                    return;
                }
                
                const file = fileInput.files[0];
                processImportFile(file, importType, overwriteExisting);
            });
        }
    });
}

/**
 * معالجة ملف الاستيراد
 * @param {File} file - ملف الاستيراد
 * @param {string} importType - نوع الاستيراد
 * @param {boolean} overwriteExisting - استبدال البيانات الموجودة
 */
function processImportFile(file, importType, overwriteExisting) {
    // إغلاق نافذة الاستيراد
    closeModal();
    
    // عرض شاشة التحميل
    showLoadingOverlay('جارٍ معالجة ملف الاستيراد...');
    
    // قراءة الملف بناءً على النوع
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // محاكاة وقت المعالجة
        setTimeout(() => {
            try {
                let importData;
                
                // تحليل الملف حسب النوع
                if (file.name.endsWith('.json')) {
                    importData = JSON.parse(e.target.result);
                } else if (file.name.endsWith('.csv')) {
                    // في التطبيق الحقيقي، سنستخدم مكتبة لتحليل CSV
                    showNotification('لم يتم تنفيذ معالجة ملفات CSV في هذا النموذج', 'warning');
                    hideLoadingOverlay();
                    return;
                } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    // في التطبيق الحقيقي، سنستخدم مكتبة لتحليل Excel
                    showNotification('لم يتم تنفيذ معالجة ملفات Excel في هذا النموذج', 'warning');
                    hideLoadingOverlay();
                    return;
                } else {
                    throw new Error('نوع الملف غير مدعوم');
                }
                
                // استيراد البيانات حسب النوع
                switch (importType) {
                    case 'users':
                        importUsers(importData, overwriteExisting);
                        break;
                    case 'data':
                        importSystemData(importData, overwriteExisting);
                        break;
                    case 'settings':
                        importSettings(importData, overwriteExisting);
                        break;
                    default:
                        throw new Error('نوع الاستيراد غير معروف');
                }
                
                hideLoadingOverlay();
                showNotification('تم استيراد البيانات بنجاح', 'success');
                
                // تسجيل النشاط
                logActivity({
                    type: 'data_imported',
                    details: `تم استيراد ${getImportTypeLabel(importType)} من ملف: ${file.name}`,
                    targetType: importType
                });
                
                // إعادة تحميل البيانات إذا لزم الأمر
                if (importType === 'users' && document.getElementById('users-table')) {
                    loadUsers();
                }
            } catch (error) {
                console.error('خطأ في معالجة ملف الاستيراد:', error);
                hideLoadingOverlay();
                showNotification(getErrorMessage(error) || 'حدث خطأ أثناء معالجة ملف الاستيراد', 'error');
            }
        }, 1500);
    };
    
    reader.onerror = function() {
        hideLoadingOverlay();
        showNotification('حدث خطأ أثناء قراءة الملف', 'error');
    };
    
    // قراءة الملف كنص
    reader.readAsText(file);
}

/**
 * الحصول على نص وصفي لنوع الاستيراد
 * @param {string} importType - نوع الاستيراد
 * @returns {string} - النص الوصفي
 */
function getImportTypeLabel(importType) {
    switch (importType) {
        case 'users':
            return 'المستخدمين';
        case 'data':
            return 'البيانات';
        case 'settings':
            return 'الإعدادات';
        default:
            return 'بيانات';
    }
}

/**
 * استيراد بيانات المستخدمين
 * @param {Object} data - بيانات المستخدمين
 * @param {boolean} overwriteExisting - استبدال البيانات الموجودة
 */
function importUsers(data, overwriteExisting) {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canImportData')) {
        showNotification('ليس لديك صلاحية لاستيراد بيانات المستخدمين', 'error');
        return;
    }
    
    // التحقق من وجود بيانات المستخدمين
    if (!data.users || !Array.isArray(data.users) || data.users.length === 0) {
        throw new Error('بيانات المستخدمين غير صالحة أو فارغة');
    }
    
    // في التطبيق الحقيقي، سنقوم بمزامنة البيانات مع Firebase
    // هنا نقوم بمحاكاة العملية
    console.log('استيراد بيانات المستخدمين:', data.users.length, 'مستخدم');
    console.log('استبدال البيانات الموجودة:', overwriteExisting);
    
    // محاكاة النجاح
    return true;
}

/**
 * استيراد بيانات النظام
 * @param {Object} data - بيانات النظام
 * @param {boolean} overwriteExisting - استبدال البيانات الموجودة
 */
function importSystemData(data, overwriteExisting) {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canImportData')) {
        showNotification('ليس لديك صلاحية لاستيراد بيانات النظام', 'error');
        return;
    }
    
    // التحقق من وجود بيانات النظام
    if (!data.systemData) {
        throw new Error('بيانات النظام غير صالحة أو فارغة');
    }
    
    // في التطبيق الحقيقي، سنقوم بمزامنة البيانات مع Firebase
    // هنا نقوم بمحاكاة العملية
    console.log('استيراد بيانات النظام:', data.systemData);
    console.log('استبدال البيانات الموجودة:', overwriteExisting);
    
    // محاكاة النجاح
    return true;
}

/**
 * استيراد إعدادات النظام
 * @param {Object} data - إعدادات النظام
 * @param {boolean} overwriteExisting - استبدال الإعدادات الموجودة
 */
function importSettings(data, overwriteExisting) {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canManageSettings')) {
        showNotification('ليس لديك صلاحية لاستيراد إعدادات النظام', 'error');
        return;
    }
    
    // التحقق من وجود إعدادات النظام
    if (!data.settings) {
        throw new Error('إعدادات النظام غير صالحة أو فارغة');
    }
    
    // في التطبيق الحقيقي، سنقوم بمزامنة الإعدادات مع Firebase
    // هنا نقوم بمحاكاة العملية
    console.log('استيراد إعدادات النظام:', data.settings);
    console.log('استبدال الإعدادات الموجودة:', overwriteExisting);
    
    // تطبيق الإعدادات الجديدة على واجهة المستخدم
    if (data.settings.general) {
        applySystemSettings(data.settings);
    }
    
    // محاكاة النجاح
    return true;
}

/**
 * تصدير بيانات النظام
 */
function exportData() {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canExportData')) {
        showNotification('ليس لديك صلاحية لتصدير البيانات', 'error');
        return;
    }
    
    // إنشاء محتوى النافذة
    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">تصدير البيانات</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body export-data-modal">
            <div class="export-options">
                <div class="export-option">
                    <input type="radio" name="export-type" id="export-users" value="users">
                    <label for="export-users">
                        <i class="fas fa-users"></i>
                        <span>تصدير المستخدمين</span>
                    </label>
                </div>
                
                <div class="export-option">
                    <input type="radio" name="export-type" id="export-data" value="data" checked>
                    <label for="export-data">
                        <i class="fas fa-database"></i>
                        <span>تصدير البيانات</span>
                    </label>
                </div>
                
                <div class="export-option">
                    <input type="radio" name="export-type" id="export-settings" value="settings">
                    <label for="export-settings">
                        <i class="fas fa-cog"></i>
                        <span>تصدير الإعدادات</span>
                    </label>
                </div>
                
                <div class="export-option">
                    <input type="radio" name="export-type" id="export-all" value="all">
                    <label for="export-all">
                        <i class="fas fa-file-export"></i>
                        <span>تصدير الكل</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">تنسيق التصدير</label>
                <div class="export-format-options">
                    <div class="format-option">
                        <input type="radio" name="export-format" id="format-json" value="json" checked>
                        <label for="format-json">JSON</label>
                    </div>
                    <div class="format-option">
                        <input type="radio" name="export-format" id="format-csv" value="csv">
                        <label for="format-csv">CSV</label>
                    </div>
                    <div class="format-option">
                        <input type="radio" name="export-format" id="format-excel" value="excel">
                        <label for="format-excel">Excel</label>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إلغاء</button>
            <button class="btn btn-primary" id="start-export-btn">بدء التصدير</button>
        </div>
    `;
    
    // عرض النافذة
    showModal('export-data-modal', modalContent, function(modal) {
        // مستمع حدث زر بدء التصدير
        const startExportBtn = modal.querySelector('#start-export-btn');
        if (startExportBtn) {
            startExportBtn.addEventListener('click', function() {
                const exportType = modal.querySelector('input[name="export-type"]:checked').value;
                const exportFormat = modal.querySelector('input[name="export-format"]:checked').value;
                
                startDataExport(exportType, exportFormat);
            });
        }
    });
}

/**
 * بدء عملية تصدير البيانات
 * @param {string} exportType - نوع التصدير
 * @param {string} exportFormat - تنسيق التصدير
 */
function startDataExport(exportType, exportFormat) {
    // التحقق من الصلاحيات
    if (!currentUser || !hasPermission('canExportData')) {
        showNotification('ليس لديك صلاحية لتصدير البيانات', 'error');
        return;
    }
    
    // إغلاق نافذة التصدير
    closeModal();
    
    // عرض شاشة التحميل
    showLoadingOverlay('جارٍ إعداد البيانات للتصدير...');
    
    // في التطبيق الحقيقي، سنقوم بجلب البيانات من Firebase
    // هنا نقوم بمحاكاة العملية
    setTimeout(() => {
        try {
            // إنشاء كائن البيانات المصدرة
            const exportData = {};
            
            // جمع البيانات حسب نوع التصدير
            if (exportType === 'users' || exportType === 'all') {
                exportData.users = getDemoUsers();
            }
            
            if (exportType === 'data' || exportType === 'all') {
                exportData.systemData = {
                    version: '1.0.0',
                    exportDate: new Date().toISOString(),
                    exportedBy: currentUser ? currentUser.uid : 'system'
                };
            }
            
            if (exportType === 'settings' || exportType === 'all') {
                exportData.settings = getDefaultSettings();
            }
            
            // تنسيق البيانات حسب التنسيق المطلوب
            let exportContent = '';
            let mimeType = '';
            let fileExtension = '';
            
            switch (exportFormat) {
                case 'json':
                    exportContent = JSON.stringify(exportData, null, 2);
                    mimeType = 'application/json';
                    fileExtension = 'json';
                    break;
                    
                case 'csv':
                    // في التطبيق الحقيقي، سنستخدم مكتبة لتحويل البيانات إلى CSV
                    exportContent = convertToCSV(exportData);
                    mimeType = 'text/csv';
                    fileExtension = 'csv';
                    break;
                    
                case 'excel':
                    // في التطبيق الحقيقي، سنستخدم مكتبة لتحويل البيانات إلى Excel
                    showNotification('لم يتم تنفيذ تصدير Excel في هذا النموذج', 'warning');
                    hideLoadingOverlay();
                    return;
                    
                default:
                    throw new Error('تنسيق التصدير غير مدعوم');
            }
            
            // إنشاء ملف للتنزيل
            const blob = new Blob([exportContent], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const downloadLink = document.createElement('a');
            const date = formatDateTime(new Date()).date.replace(/-/g, '_');
            downloadLink.href = url;
            downloadLink.download = `تصدير_${getExportTypeLabel(exportType)}_${date}.${fileExtension}`;
            
            // تنزيل الملف
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            hideLoadingOverlay();
            showNotification('تم تصدير البيانات بنجاح', 'success');
            
            // تسجيل النشاط
            logActivity({
                type: 'data_exported',
                details: `تم تصدير ${getExportTypeLabel(exportType)} بتنسيق ${exportFormat.toUpperCase()}`,
                targetType: exportType
            });
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            hideLoadingOverlay();
            showNotification(getErrorMessage(error) || 'حدث خطأ أثناء تصدير البيانات', 'error');
        }
    }, 1500);
}

/**
 * الحصول على نص وصفي لنوع التصدير
 * @param {string} exportType - نوع التصدير
 * @returns {string} - النص الوصفي
 */
function getExportTypeLabel(exportType) {
    switch (exportType) {
        case 'users':
            return 'المستخدمين';
        case 'data':
            return 'البيانات';
        case 'settings':
            return 'الإعدادات';
        case 'all':
            return 'كل_البيانات';
        default:
            return 'البيانات';
    }
}

/**
 * تحويل البيانات إلى تنسيق CSV
 * @param {Object} data - البيانات المراد تحويلها
 * @returns {string} - البيانات بتنسيق CSV
 */
function convertToCSV(data) {
    // هذه وظيفة بسيطة لتحويل البيانات إلى CSV
    // في التطبيق الحقيقي، سنستخدم مكتبة أكثر تطوراً
    
    let csv = '';
    
    // تحويل بيانات المستخدمين إلى CSV
    if (data.users && data.users.length > 0) {
        // إضافة عنوان CSV للمستخدمين
        csv += 'المعرف,البريد الإلكتروني,الاسم الكامل,نوع المستخدم,تاريخ الإنشاء,آخر تسجيل دخول\n';
        
        // إضافة بيانات المستخدمين
        data.users.forEach(user => {
            csv += `${user.uid},${user.email},${user.fullName},${user.type},${user.createdAt || ''},${user.lastLogin || ''}\n`;
        });
    }
    
    return csv;
}

/**
 * إظهار/إخفاء قائمة ملف المستخدم
 * @param {Event} event - حدث النقر
 */
function toggleUserMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const userMenu = document.querySelector('.user-menu');
    
    if (userMenu) {
        userMenu.classList.toggle('active');
        
        // إضافة مستمع حدث لإغلاق القائمة عند النقر خارجها
        if (userMenu.classList.contains('active')) {
            document.addEventListener('click', closeUserMenu);
        } else {
            document.removeEventListener('click', closeUserMenu);
        }
    }
}

/**
 * إغلاق قائمة ملف المستخدم
 */
function closeUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    
    if (userMenu && userMenu.classList.contains('active')) {
        userMenu.classList.remove('active');
        document.removeEventListener('click', closeUserMenu);
    }
}

/**
 * تسجيل الخروج من النظام
 */
function logout() {
    // تأكيد تسجيل الخروج
    if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
        // تسجيل النشاط
        logActivity({
            type: 'user_logout',
            details: 'تم تسجيل الخروج من النظام',
            targetType: 'auth'
        });
        
        // في التطبيق الحقيقي، سنقوم بتسجيل الخروج من Firebase
        if (window.firebase && window.firebase.auth) {
            window.firebase.auth().signOut()
                .then(() => {
                    // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
                    window.location.href = 'login.html';
                })
                .catch(error => {
                    console.error('خطأ في تسجيل الخروج:', error);
                    showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
                });
        } else {
            // محاكاة تسجيل الخروج في وضع العرض التوضيحي
            window.location.href = 'login.html';
        }
    }
}

/**
 * عرض ملف المستخدم الشخصي
 */
function showUserProfile() {
    // التحقق من وجود معلومات المستخدم
    if (!currentUser) {
        showNotification('يجب تسجيل الدخول لعرض الملف الشخصي', 'error');
        return;
    }
    
    // إنشاء محتوى النافذة
    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">الملف الشخصي</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body user-profile-modal">
            <div class="user-profile-header">
                <div class="user-avatar medium">${currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}</div>
                <h3 class="user-full-name">${currentUser.fullName || 'مستخدم'}</h3>
                <span class="badge badge-${getUserTypeBadgeClass(currentUser.type)}">${getUserTypeLabel(currentUser.type)}</span>
            </div>
            
            <div class="profile-sections">
                <div class="profile-section">
                    <h4 class="section-title">المعلومات الشخصية</h4>
                    <form id="personal-info-form">
                        <div class="form-group">
                            <label class="form-label">الاسم الكامل</label>
                            <input type="text" class="form-input" id="profile-fullname" value="${currentUser.fullName || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">البريد الإلكتروني</label>
                            <input type="email" class="form-input" id="profile-email" value="${currentUser.email || ''}" disabled>
                        </div>
                        
                       <div class="form-group">
                            <label class="form-label">رقم الهاتف</label>
                            <input type="tel" class="form-input" id="profile-phone" value="${currentUser.phone || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">المسمى الوظيفي</label>
                            <input type="text" class="form-input" id="profile-job-title" value="${currentUser.jobTitle || ''}">
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-primary" id="save-personal-info-btn">حفظ المعلومات</button>
                        </div>
                    </form>
                </div>
                
                <div class="profile-section">
                    <h4 class="section-title">تغيير كلمة المرور</h4>
                    <form id="change-password-form">
                        <div class="form-group">
                            <label class="form-label">كلمة المرور الحالية</label>
                            <div class="password-input-container">
                                <input type="password" class="form-input" id="current-password">
                                <button type="button" class="toggle-password">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">كلمة المرور الجديدة</label>
                            <div class="password-input-container">
                                <input type="password" class="form-input" id="new-password">
                                <button type="button" class="toggle-password">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">تأكيد كلمة المرور الجديدة</label>
                            <div class="password-input-container">
                                <input type="password" class="form-input" id="confirm-new-password">
                                <button type="button" class="toggle-password">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-primary" id="change-password-btn">تغيير كلمة المرور</button>
                        </div>
                    </form>
                </div>
                
                <div class="profile-section">
                    <h4 class="section-title">تفضيلات النظام</h4>
                    <form id="preferences-form">
                        <div class="form-group">
                            <label class="form-label">اللغة المفضلة</label>
                            <select class="form-select" id="user-language">
                                <option value="ar" ${currentUser.preferences && currentUser.preferences.language === 'ar' ? 'selected' : ''}>العربية</option>
                                <option value="en" ${currentUser.preferences && currentUser.preferences.language === 'en' ? 'selected' : ''}>الإنجليزية</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">المنطقة الزمنية</label>
                            <select class="form-select" id="user-timezone">
                                <option value="Asia/Riyadh" ${currentUser.preferences && currentUser.preferences.timezone === 'Asia/Riyadh' ? 'selected' : ''}>الرياض (GMT+3)</option>
                                <option value="Asia/Dubai" ${currentUser.preferences && currentUser.preferences.timezone === 'Asia/Dubai' ? 'selected' : ''}>دبي (GMT+4)</option>
                                <option value="Africa/Cairo" ${currentUser.preferences && currentUser.preferences.timezone === 'Africa/Cairo' ? 'selected' : ''}>القاهرة (GMT+2)</option>
                            </select>
                        </div>
                        
                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="user-email-notifications" ${currentUser.preferences && currentUser.preferences.emailNotifications ? 'checked' : ''}>
                                <span>تلقي الإشعارات عبر البريد الإلكتروني</span>
                            </label>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-primary" id="save-preferences-btn">حفظ التفضيلات</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إغلاق</button>
        </div>
    `;
    
    // عرض النافذة
    showModal('user-profile-modal', modalContent, function(modal) {
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
        
        // مستمع حدث زر حفظ المعلومات الشخصية
        const savePersonalInfoBtn = modal.querySelector('#save-personal-info-btn');
        if (savePersonalInfoBtn) {
            savePersonalInfoBtn.addEventListener('click', savePersonalInfo);
        }
        
        // مستمع حدث زر تغيير كلمة المرور
        const changePasswordBtn = modal.querySelector('#change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', changePassword);
        }
        
        // مستمع حدث زر حفظ التفضيلات
        const savePreferencesBtn = modal.querySelector('#save-preferences-btn');
        if (savePreferencesBtn) {
            savePreferencesBtn.addEventListener('click', saveUserPreferences);
        }
    });
}

/**
 * حفظ المعلومات الشخصية للمستخدم
 */
function savePersonalInfo() {
    // التحقق من وجود معلومات المستخدم
    if (!currentUser) {
        showNotification('يجب تسجيل الدخول لتحديث المعلومات الشخصية', 'error');
        return;
    }
    
    // الحصول على قيم الحقول
    const fullName = document.getElementById('profile-fullname').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    const jobTitle = document.getElementById('profile-job-title').value.trim();
    
    // التحقق من إدخال الاسم الكامل
    if (!fullName) {
        showNotification('يجب إدخال الاسم الكامل', 'error');
        return;
    }
    
    // إنشاء كائن بيانات التحديث
    const updateData = {
        'profile.fullName': fullName,
        'profile.phone': phone,
        'profile.jobTitle': jobTitle
    };
    
    // تحديث بيانات المستخدم في قاعدة البيانات
    if (databaseRef) {
        databaseRef.ref(`users/${currentUser.uid}`).update(updateData)
            .then(() => {
                // تحديث معلومات المستخدم المحلية
                currentUser.fullName = fullName;
                currentUser.phone = phone;
                currentUser.jobTitle = jobTitle;
                
                showNotification('تم تحديث المعلومات الشخصية بنجاح', 'success');
                
                // تحديث عرض اسم المستخدم في الواجهة
                updateDisplayedUserName();
                
                // تسجيل النشاط
                logActivity({
                    type: 'profile_updated',
                    details: 'تم تحديث المعلومات الشخصية',
                    targetType: 'user'
                });
            })
            .catch(error => {
                console.error('خطأ في تحديث المعلومات الشخصية:', error);
                showNotification(getErrorMessage(error) || 'حدث خطأ أثناء تحديث المعلومات الشخصية', 'error');
            });
    } else {
        // محاكاة تحديث المعلومات في وضع العرض التوضيحي
        currentUser.fullName = fullName;
        currentUser.phone = phone;
        currentUser.jobTitle = jobTitle;
        
        showNotification('تم تحديث المعلومات الشخصية بنجاح (وضع العرض التوضيحي)', 'success');
        
        // تحديث عرض اسم المستخدم في الواجهة
        updateDisplayedUserName();
    }
}

/**
 * تحديث عرض اسم المستخدم في الواجهة
 */
function updateDisplayedUserName() {
    // تحديث اسم المستخدم في الشريط العلوي
    const userNameElement = document.querySelector('.user-info .user-name');
    if (userNameElement && currentUser) {
        userNameElement.textContent = currentUser.fullName || 'مستخدم';
    }
    
    // تحديث الحرف الأول من اسم المستخدم في الصورة الرمزية
    const userAvatarElement = document.querySelector('.user-info .user-avatar');
    if (userAvatarElement && currentUser) {
        userAvatarElement.textContent = currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U';
    }
}

/**
 * تغيير كلمة مرور المستخدم
 */
function changePassword() {
    // التحقق من وجود معلومات المستخدم
    if (!currentUser) {
        showNotification('يجب تسجيل الدخول لتغيير كلمة المرور', 'error');
        return;
    }
    
    // الحصول على قيم الحقول
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    // التحقق من إدخال جميع الحقول
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showNotification('يجب ملء جميع حقول كلمة المرور', 'error');
        return;
    }
    
    // التحقق من تطابق كلمتي المرور الجديدة
    if (newPassword !== confirmNewPassword) {
        showNotification('كلمة المرور الجديدة وتأكيدها غير متطابقين', 'error');
        return;
    }
    
    // التحقق من طول كلمة المرور
    if (newPassword.length < 6) {
        showNotification('يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل', 'error');
        return;
    }
    
    // تغيير كلمة المرور في Firebase Authentication
    if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
        const user = window.firebase.auth().currentUser;
        
        // إعادة المصادقة
        const credential = window.firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        
        user.reauthenticateWithCredential(credential)
            .then(() => {
                // تغيير كلمة المرور
                return user.updatePassword(newPassword);
            })
            .then(() => {
                showNotification('تم تغيير كلمة المرور بنجاح', 'success');
                
                // مسح حقول النموذج
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-new-password').value = '';
                
                // تسجيل النشاط
                logActivity({
                    type: 'password_changed',
                    details: 'تم تغيير كلمة المرور',
                    targetType: 'auth'
                });
            })
            .catch(error => {
                console.error('خطأ في تغيير كلمة المرور:', error);
                
                // عرض رسالة خطأ مناسبة
                if (error.code === 'auth/wrong-password') {
                    showNotification('كلمة المرور الحالية غير صحيحة', 'error');
                } else {
                    showNotification(getErrorMessage(error) || 'حدث خطأ أثناء تغيير كلمة المرور', 'error');
                }
            });
    } else {
        // محاكاة تغيير كلمة المرور في وضع العرض التوضيحي
        showNotification('تم تغيير كلمة المرور بنجاح (وضع العرض التوضيحي)', 'success');
        
        // مسح حقول النموذج
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-new-password').value = '';
    }
}

/**
 * حفظ تفضيلات المستخدم
 */
function saveUserPreferences() {
    // التحقق من وجود معلومات المستخدم
    if (!currentUser) {
        showNotification('يجب تسجيل الدخول لتحديث التفضيلات', 'error');
        return;
    }
    
    // الحصول على قيم الحقول
    const language = document.getElementById('user-language').value;
    const timezone = document.getElementById('user-timezone').value;
    const emailNotifications = document.getElementById('user-email-notifications').checked;
    
    // إنشاء كائن التفضيلات
    const preferences = {
        language: language,
        timezone: timezone,
        emailNotifications: emailNotifications
    };
    
    // تحديث تفضيلات المستخدم في قاعدة البيانات
    if (databaseRef) {
        databaseRef.ref(`users/${currentUser.uid}/profile/preferences`).set(preferences)
            .then(() => {
                // تحديث معلومات المستخدم المحلية
                if (!currentUser.preferences) {
                    currentUser.preferences = {};
                }
                currentUser.preferences.language = language;
                currentUser.preferences.timezone = timezone;
                currentUser.preferences.emailNotifications = emailNotifications;
                
                showNotification('تم حفظ التفضيلات بنجاح', 'success');
                
                // تطبيق تفضيلات اللغة
                applyLanguagePreference(language);
                
                // تسجيل النشاط
                logActivity({
                    type: 'preferences_updated',
                    details: 'تم تحديث تفضيلات النظام',
                    targetType: 'user'
                });
            })
            .catch(error => {
                console.error('خطأ في حفظ التفضيلات:', error);
                showNotification(getErrorMessage(error) || 'حدث خطأ أثناء حفظ التفضيلات', 'error');
            });
    } else {
        // محاكاة حفظ التفضيلات في وضع العرض التوضيحي
        if (!currentUser.preferences) {
            currentUser.preferences = {};
        }
        currentUser.preferences.language = language;
        currentUser.preferences.timezone = timezone;
        currentUser.preferences.emailNotifications = emailNotifications;
        
        showNotification('تم حفظ التفضيلات بنجاح (وضع العرض التوضيحي)', 'success');
        
        // تطبيق تفضيلات اللغة
        applyLanguagePreference(language);
    }
}

/**
 * تطبيق تفضيلات اللغة
 * @param {string} language - رمز اللغة
 */
function applyLanguagePreference(language) {
    // تحديث سمات HTML
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // في التطبيق الحقيقي، سنقوم بتحميل ملفات الترجمة المناسبة
    // وتحديث جميع النصوص في واجهة المستخدم
}

/**
 * التحقق من وجود تحديثات للنظام
 */
function checkForUpdates() {
    // عرض شاشة التحميل
    showLoadingOverlay('جارٍ التحقق من وجود تحديثات...');
    
    // في التطبيق الحقيقي، سنقوم بالاتصال بخدمة التحديث
    // هنا نقوم بمحاكاة العملية
    setTimeout(() => {
        hideLoadingOverlay();
        
        // عرض نتيجة التحقق
        showUpdateResult(false); // تغيير إلى true لاختبار حالة وجود تحديث
    }, 2000);
}

/**
 * عرض نتيجة التحقق من التحديثات
 * @param {boolean} updateAvailable - هل يوجد تحديث متاح
 */
function showUpdateResult(updateAvailable) {
    if (updateAvailable) {
        // إنشاء محتوى النافذة لحالة وجود تحديث
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">تحديث جديد متاح</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body update-modal">
                <div class="update-info">
                    <div class="update-icon">
                        <i class="fas fa-download"></i>
                    </div>
                    <div class="update-details">
                        <h4>الإصدار 1.1.0</h4>
                        <p>تم إصدار تحديث جديد للنظام يتضمن تحسينات وإصلاحات هامة.</p>
                        <ul class="update-features">
                            <li>تحسين أداء النظام</li>
                            <li>إضافة ميزات جديدة لإدارة المستخدمين</li>
                            <li>إصلاح مشكلات في واجهة المستخدم</li>
                            <li>تحسين تجربة المستخدم</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">تجاهل</button>
                <button class="btn btn-primary" id="install-update-btn">تثبيت التحديث</button>
            </div>
        `;
        
        // عرض النافذة
        showModal('update-modal', modalContent, function(modal) {
            // مستمع حدث زر تثبيت التحديث
            const installUpdateBtn = modal.querySelector('#install-update-btn');
            if (installUpdateBtn) {
                installUpdateBtn.addEventListener('click', installUpdate);
            }
        });
    } else {
        // عرض رسالة عدم وجود تحديثات
        showNotification('النظام محدث إلى أحدث إصدار', 'success');
    }
}

/**
 * تثبيت تحديث النظام
 */
function installUpdate() {
    // إغلاق نافذة التحديث
    closeModal();
    
    // عرض شاشة التحميل
    showLoadingOverlay('جارٍ تثبيت التحديث...');
    
    // في التطبيق الحقيقي، سنقوم بتنزيل وتثبيت التحديث
    // هنا نقوم بمحاكاة العملية
    setTimeout(() => {
        hideLoadingOverlay();
        
        // عرض رسالة نجاح التثبيت
        showNotification('تم تثبيت التحديث بنجاح. سيتم إعادة تشغيل النظام.', 'success');
        
        // إعادة تحميل الصفحة بعد فترة
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }, 3000);
}

/**
 * تهيئة التطبيق عند تحميل الصفحة
 */
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة وحدة إدارة المستخدمين
    initUserManagement();
    
    // تطبيق تفضيلات المستخدم
    if (currentUser && currentUser.preferences) {
        applyLanguagePreference(currentUser.preferences.language || 'ar');
    }
    
    // إضافة مستمعي الأحداث
    setupAppEventListeners();
    
    // عرض معلومات المستخدم الحالي
    updateDisplayedUserName();
    
    // الحصول على إعدادات النظام وتطبيقها
    getSystemSettings()
        .then(settings => {
            applySystemSettings(settings);
        })
        .catch(error => {
            console.error('خطأ في الحصول على إعدادات النظام:', error);
        });
});

/**
 * إضافة مستمعي الأحداث للتطبيق
 */
function setupAppEventListeners() {
    // مستمع حدث أيقونة المستخدم في الشريط العلوي
    const userIcon = document.querySelector('.user-info');
    if (userIcon) {
        userIcon.addEventListener('click', toggleUserMenu);
    }
    
    // مستمع حدث زر الملف الشخصي في قائمة المستخدم
    const profileLink = document.querySelector('.user-menu-item[data-action="profile"]');
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeUserMenu();
            showUserProfile();
        });
    }
    
    // مستمع حدث زر تسجيل الخروج في قائمة المستخدم
    const logoutLink = document.querySelector('.user-menu-item[data-action="logout"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeUserMenu();
            logout();
        });
    }
    
    // مستمع حدث زر طي/توسيع الشريط الجانبي
    const sidebarToggleBtn = document.querySelector('.toggle-sidebar');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }
    
    // مستمع حدث تغيير حجم النافذة لإخفاء الشريط الجانبي في الشاشات الصغيرة
    window.addEventListener('resize', function() {
        if (window.innerWidth < 768) {
            document.body.classList.add('sidebar-collapsed');
        }
    });
    
    // إضافة مستمعي أحداث لروابط القائمة الجانبية
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // إزالة التنشيط من جميع الروابط
            navLinks.forEach(link => link.classList.remove('active'));
            
            // تنشيط الرابط الحالي
            this.classList.add('active');
            
            // إخفاء الشريط الجانبي في الشاشات الصغيرة
            if (window.innerWidth < 768) {
                document.body.classList.add('sidebar-collapsed');
            }
        });
    });
}

/**
 * التحقق من توافق المتصفح
 * @returns {boolean} - هل المتصفح متوافق
 */
function checkBrowserCompatibility() {
    // التحقق من دعم المتصفح للميزات المطلوبة
    const features = {
        localStorage: typeof localStorage !== 'undefined',
        flexbox: typeof document.createElement('div').style.flexGrow !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        promises: typeof Promise !== 'undefined'
    };
    
    // التحقق من توافق جميع الميزات
    const isCompatible = Object.values(features).every(supported => supported);
    
    if (!isCompatible) {
        // عرض تحذير للمتصفحات غير المتوافقة
        const incompatibleFeatures = Object.entries(features)
            .filter(([, supported]) => !supported)
            .map(([feature]) => feature);
        
        alert(`
            تحذير: متصفحك غير متوافق مع بعض الميزات المطلوبة.
            الميزات غير المدعومة: ${incompatibleFeatures.join(', ')}.
            يرجى ترقية متصفحك أو استخدام متصفح آخر.
        `);
    }
    
    return isCompatible;
}

// التحقق من توافق المتصفح عند تحميل الصفحة
window.addEventListener('load', checkBrowserCompatibility);

/**
 * تحديد ما إذا كان المستخدم يستخدم جهازًا محمولًا
 * @returns {boolean} - هل المستخدم يستخدم جهازًا محمولًا
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * التحقق من وجود اتصال بالإنترنت
 * @returns {boolean} - هل يوجد اتصال بالإنترنت
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * إضافة مستمعي أحداث لحالة الاتصال بالإنترنت
 */
function setupConnectivityListeners() {
    window.addEventListener('online', function() {
        showNotification('تم استعادة الاتصال بالإنترنت', 'success');
        
        // مزامنة البيانات المعلقة
        syncPendingData();
    });
    
    window.addEventListener('offline', function() {
        showNotification('انقطع الاتصال بالإنترنت. سيتم حفظ التغييرات محليًا.', 'warning');
    });
}

/**
 * مزامنة البيانات المعلقة عند استعادة الاتصال
 */
function syncPendingData() {
    // في التطبيق الحقيقي، سنقوم بمزامنة البيانات المخزنة محليًا
    // هنا نقوم بمحاكاة العملية
    if (localStorage.getItem('pendingChanges')) {
        // عرض إشعار المزامنة
        showNotification('جارٍ مزامنة البيانات المحلية...', 'info');
        
        // محاكاة وقت المزامنة
        setTimeout(() => {
            // مسح البيانات المعلقة بعد المزامنة
            localStorage.removeItem('pendingChanges');
            
            showNotification('تمت مزامنة البيانات بنجاح', 'success');
        }, 1500);
    }
}

// إضافة مستمعي أحداث للاتصال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', setupConnectivityListeners);