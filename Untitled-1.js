/**
 * وحدة إدارة المستخدمين المتكاملة لنظام الاستثمار
 * تتضمن الوظائف الكاملة لإدارة المستخدمين وعرضهم وتنفيذ العمليات عليهم
 */

// تعديل في بداية ملف newfile.js
// إضافة نطاق محدد للوظائف
const UserManagement = {
    // متغيرات داخلية
    currentUser: null,
    databaseRef: null,
    currentLogsPage: 1,
    logsPerPage: 20,
    totalLogsPages: 1,
    logsCache: {},
    
    // وصف الصلاحيات
    PERMISSIONS: {
        canCreateUsers: "إنشاء مستخدمين جدد",
        canDeleteUsers: "حذف المستخدمين",
        canManageSettings: "إدارة إعدادات النظام",
        canDeleteInvestors: "حذف المستثمرين",
        canExportData: "تصدير البيانات",
        canImportData: "استيراد البيانات",
        canCreateBackup: "إنشاء نسخة احتياطية",
        canRestoreBackup: "استعادة نسخة احتياطية"
    },
    
    /**
     * تهيئة وحدة إدارة المستخدمين
     */
    initUserManagement: function() {
        console.log('تهيئة وحدة إدارة المستخدمين...');
        
        // إنشاء حاوية لوحدة إدارة المستخدمين
        const container = document.createElement('div');
        container.id = 'user-management-container';
        document.body.appendChild(container);
        
        // الحصول على مرجع لقاعدة البيانات إذا كان متاحًا
        if (window.firebase && window.firebase.database) {
            this.databaseRef = window.firebase.database();
        }
        
        // الحصول على المستخدم الحالي
        if (window.AuthSystem && typeof window.AuthSystem.getUserInfo === 'function') {
            this.currentUser = window.AuthSystem.getUserInfo();
        }
        
        // إضافة مستمع للتغييرات في حالة المصادقة
        if (window.AuthSystem && typeof window.AuthSystem.addAuthObserver === 'function') {
            window.AuthSystem.addAuthObserver(this.handleAuthChange.bind(this));
        }
        
        // إضافة زر إدارة المستخدمين إلى الشريط الجانبي
        this.addUserManagementNavLink();
        
        // إضافة أنماط CSS
        this.addUserManagementStyles();
        
        console.log('تم تهيئة وحدة إدارة المستخدمين بنجاح');
    },
    
    /**
     * معالجة تغييرات حالة المصادقة
     * @param {Object} event - حدث المصادقة
     */
    handleAuthChange: function(event) {
        if (event.type === 'login') {
            // تحديث المستخدم الحالي
            this.currentUser = event.user;
            
            // تحديث واجهة المستخدم إذا كانت صفحة إدارة المستخدمين مفتوحة
            if (document.getElementById('user-management-page') && document.getElementById('user-management-page').classList.contains('active')) {
                this.loadUsers();
            }
        } else if (event.type === 'logout') {
            this.currentUser = null;
        }
    },
    
    /**
     * إضافة رابط إدارة المستخدمين إلى الشريط الجانبي
     */
    addUserManagementNavLink: function() {
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
            navLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                // إزالة التنشيط من جميع الروابط
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // تنشيط الرابط الحالي
                navLink.classList.add('active');
                
                // عرض صفحة إدارة المستخدمين
                this.navigateToUserManagement();
            });
        }
        
        console.log('تم إضافة رابط إدارة المستخدمين إلى الشريط الجانبي');
    },
    
    /**
     * إضافة أنماط CSS لإدارة المستخدمين
     */
    addUserManagementStyles: function() {
        // التحقق من وجود الأنماط مسبقًا
        if (document.getElementById('user-management-styles')) {
            return;
        }
        
        // إنشاء عنصر نمط جديد
        const styleElement = document.createElement('style');
        styleElement.id = 'user-management-styles';
        
        // إضافة أنماط CSS مع استخدام محددات أكثر تحديداً
        styleElement.textContent = `
            /* أنماط صفحة إدارة المستخدمين */
            #user-management-container .user-management-page .section {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                padding: 20px;
                margin-bottom: 20px;
            }
            
            #user-management-container .user-management-page .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            #user-management-container .user-management-page .section-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
            }
            
            #user-management-container .user-management-page .section-actions {
                display: flex;
                gap: 10px;
            }
            
            /* أنماط جدول المستخدمين */
            #user-management-container .user-management-page .table-container {
                overflow-x: auto;
            }
            
            #user-management-container .user-management-page table {
                width: 100%;
                border-collapse: collapse;
            }
            
            #user-management-container .user-management-page table th {
                background-color: #f9fafb;
                padding: 12px 16px;
                text-align: right;
                font-weight: 600;
                color: #4b5563;
                border-bottom: 1px solid #e5e7eb;
            }
            
            #user-management-container .user-management-page table td {
                padding: 12px 16px;
                border-bottom: 1px solid #f3f4f6;
                color: #1f2937;
            }
            
            #user-management-container .user-management-page table tr:last-child td {
                border-bottom: none;
            }
            
            #user-management-container .user-management-page table tr:hover td {
                background-color: #f9fafb;
            }
            
            /* أنماط معلومات المستخدم */
            #user-management-container .user-info-cell {
                display: flex;
                align-items: center;
            }
            
            #user-management-container .user-avatar.small {
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
            
            #user-management-container .user-info-cell .user-name {
                font-weight: 500;
                color: #1f2937;
                margin-bottom: 2px;
            }
            
            #user-management-container .user-info-cell .user-role {
                font-size: 0.75rem;
                color: #6b7280;
            }
            
            /* أنماط الشارات */
            #user-management-container .badge {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 600;
            }
            
            #user-management-container .badge-primary {
                background-color: #dbeafe;
                color: #1e40af;
            }
            
            #user-management-container .badge-success {
                background-color: #d1fae5;
                color: #065f46;
            }
            
            #user-management-container .badge-danger {
                background-color: #fee2e2;
                color: #b91c1c;
            }
            
            #user-management-container .badge-warning {
                background-color: #fef3c7;
                color: #92400e;
            }
            
            #user-management-container .badge-info {
                background-color: #e0f2fe;
                color: #0369a1;
            }
            
            /* أنماط خلايا الإجراءات */
            #user-management-container .actions-cell {
                display: flex;
                gap: 5px;
            }
            
            /* أنماط تصفية المستخدمين */
            #user-management-container .user-filters {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            /* إضافة مستخدم */
            #user-management-container .add-user-form {
                margin-top: 20px;
            }
            
            #user-management-container .form-group {
                margin-bottom: 15px;
            }
            
            #user-management-container .form-label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #4b5563;
            }
            
            #user-management-container .form-input,
            #user-management-container .form-select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                color: #1f2937;
            }
            
            #user-management-container .form-input:focus,
            #user-management-container .form-select:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
            }
            
            #user-management-container .password-input-container {
                position: relative;
            }
            
            #user-management-container .toggle-password {
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
            #user-management-container .permissions-list {
                margin-top: 15px;
            }
            
            #user-management-container .permission-item {
                display: flex;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #f3f4f6;
            }
            
            #user-management-container .permission-item:last-child {
                border-bottom: none;
            }
            
            #user-management-container .permission-item label {
                display: flex;
                align-items: center;
                margin: 0;
                cursor: pointer;
            }
            
            #user-management-container .permission-item input[type="checkbox"] {
                margin-left: 8px;
            }
            
            #user-management-container .permission-title {
                font-weight: 500;
                color: #4b5563;
            }
            
            /* أنماط للمستخدم الحالي */
            #user-management-container tr.current-user {
                background-color: #fef3c7 !important;
            }
            
            #user-management-container tr.admin-row {
                background-color: rgba(254, 202, 202, 0.2);
            }
            
            #user-management-container tr.manager-row {
                background-color: rgba(254, 240, 138, 0.2);
            }
            
            /* أنماط شاشة التحميل */
            #user-management-container .loader {
                border: 3px solid #f3f4f6;
                border-top: 3px solid #3b82f6;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                animation: user-mgmt-spin 1s linear infinite;
                margin: 20px auto;
            }
            
            @keyframes user-mgmt-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* أنماط التنبيهات */
            #user-management-container .alert {
                padding: 12px 16px;
                border-radius: 4px;
                margin-bottom: 15px;
            }
            
            #user-management-container .alert-info {
                background-color: #e0f2fe;
                color: #0369a1;
                border: 1px solid #bae6fd;
            }
            
            #user-management-container .alert-warning {
                background-color: #fef3c7;
                color: #92400e;
                border: 1px solid #fde68a;
            }
            
            #user-management-container .alert-success {
                background-color: #d1fae5;
                color: #065f46;
                border: 1px solid #a7f3d0;
            }
            
            #user-management-container .alert-danger {
                background-color: #fee2e2;
                color: #b91c1c;
                border: 1px solid #fecaca;
            }
            
            #user-management-container .alert-icon {
                margin-left: 10px;
            }
            
            /* تخصيص المستخدم */
            #user-management-container .user-detail-modal .user-avatar.medium {
                width: 80px;
                height: 80px;
                font-size: 2rem;
                margin: 0 auto 20px;
            }
            
            #user-management-container .user-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 15px;
                margin-top: 20px;
                margin-bottom: 20px;
            }
            
            #user-management-container .user-stat-item {
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
            }
            
            #user-management-container .user-stat-value {
                font-size: 1.5rem;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 5px;
            }
            
            #user-management-container .user-stat-label {
                font-size: 0.875rem;
                color: #6b7280;
            }
            
            /* توافق الموبايل */
            @media (max-width: 768px) {
                #user-management-container .actions-cell {
                    flex-direction: column;
                    gap: 5px;
                }
                
                #user-management-container .user-management-page .section-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
                
                #user-management-container .user-management-page .section-actions {
                    width: 100%;
                }
                
                #user-management-container .user-filters {
                    flex-wrap: wrap;
                }
            }
            
            /* أنماط النوافذ المنبثقة */
            #user-management-container .user-modal-overlay {
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s, visibility 0.3s;
            }
            
            #user-management-container .user-modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            #user-management-container .user-modal {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s;
            }
            
            #user-management-container .user-modal-overlay.active .user-modal {
                transform: scale(1);
            }
            
            #user-management-container .user-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 24px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            #user-management-container .user-modal-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
            }
            
            #user-management-container .user-modal-close {
                background: none;
                border: none;
                color: #6b7280;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 4px;
                line-height: 1;
            }
            
            #user-management-container .user-modal-body {
                padding: 24px;
            }
            
            #user-management-container .user-modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 16px 24px;
                border-top: 1px solid #e5e7eb;
            }
            
            /* أنماط إشعارات المستخدم */
            #user-management-container .user-notifications-container {
                position: fixed;
                top: 20px;
                left: 20px;
                z-index: 1100;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 350px;
            }
            
            #user-management-container .user-notification {
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
            
            #user-management-container .user-notification-visible {
                transform: translateY(0);
                opacity: 1;
            }
            
            #user-management-container .user-notification-closing {
                transform: translateY(-20px);
                opacity: 0;
            }
            
            #user-management-container .user-notification-icon {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }
            
            #user-management-container .user-notification-content {
                flex-grow: 1;
                min-width: 0;
            }
            
            #user-management-container .user-notification-message {
                margin: 0;
                font-size: 14px;
                color: #1f2937;
            }
            
            #user-management-container .user-notification-close {
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
            
            #user-management-container .user-notification-close:hover {
                background-color: #f3f4f6;
                color: #4b5563;
            }
            
            #user-management-container .user-notification-info .user-notification-icon {
                color: #3b82f6;
            }
            
            #user-management-container .user-notification-success .user-notification-icon {
                color: #10b981;
            }
            
            #user-management-container .user-notification-warning .user-notification-icon {
                color: #f59e0b;
            }
            
            #user-management-container .user-notification-error .user-notification-icon {
                color: #ef4444;
            }
        `;
        
        // إضافة عنصر النمط إلى الصفحة
        document.head.appendChild(styleElement);
        console.log('تم إضافة أنماط CSS لإدارة المستخدمين');
    },
    
    /**
     * الانتقال إلى صفحة إدارة المستخدمين
     */
    navigateToUserManagement: function() {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // البحث عن صفحة إدارة المستخدمين
        let userManagementPage = document.getElementById('user-management-page');
        
        // إنشاء صفحة إدارة المستخدمين إذا لم تكن موجودة
        if (!userManagementPage) {
            userManagementPage = this.createUserManagementPage();
        }
        
        // عرض صفحة إدارة المستخدمين
        userManagementPage.classList.add('active');
        
        // تحميل بيانات المستخدمين
        this.loadUsers();
    },
    
    /**
     * إنشاء صفحة إدارة المستخدمين
     * @returns {HTMLElement} - عنصر صفحة إدارة المستخدمين
     */
    createUserManagementPage: function() {
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
            document.getElementById('user-management-container').appendChild(page);
        }
        
        // إضافة مستمعي الأحداث
        this.setupUserManagementListeners(page);
        
        console.log('تم إنشاء صفحة إدارة المستخدمين');
        return page;
    },
    
   /**
     * إضافة مستمعي الأحداث لصفحة إدارة المستخدمين
     * @param {HTMLElement} page - عنصر صفحة إدارة المستخدمين
     */
   setupUserManagementListeners: function(page) {
    // زر إضافة مستخدم
    const addUserBtn = page.querySelector('#add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => this.showAddUserModal());
    }
    
    // زر تحديث قائمة المستخدمين
    const refreshUsersBtn = page.querySelector('#refresh-users-btn');
    if (refreshUsersBtn) {
        refreshUsersBtn.addEventListener('click', () => this.loadUsers());
    }
    
    // أزرار تصفية المستخدمين
    const filterButtons = page.querySelectorAll('.btn-group .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // تحديث الزر النشط
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // تطبيق التصفية
            const filterType = button.getAttribute('data-filter');
            this.filterUsers(filterType);
        });
    });
    
    // مربع البحث
    const searchInput = page.querySelector('#user-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            this.searchUsers(searchInput.value);
        });
    }
    
    // زر تبديل الشريط الجانبي
    const toggleSidebarBtn = page.querySelector('.toggle-sidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }
},

/**
 * تحميل بيانات المستخدمين
 */
loadUsers: function() {
    // التحقق من صلاحيات المستخدم
    if (!this.currentUser || !this.hasPermission('canCreateUsers')) {
        this.showNotification('ليس لديك صلاحية لإدارة المستخدمين', 'error');
        return;
    }
    
    // عرض رسالة التحميل
    const tableBody = document.querySelector('#users-table tbody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="loader"></div></td></tr>';
    }
    
    // الحصول على بيانات المستخدمين من Firebase
    if (this.databaseRef) {
        this.databaseRef.ref('users').once('value')
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
                            permissions: userProfile.permissions || this.getDefaultPermissions('user'),
                            createdAt: userProfile.createdAt || null,
                            lastLogin: userProfile.lastLogin || null,
                            emailVerified: userProfile.emailVerified || false
                        });
                    }
                });
                
                // عرض المستخدمين
                this.renderUsersTable(users);
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
        const demoUsers = this.getDemoUsers();
        this.renderUsersTable(demoUsers);
    }
},

/**
 * الحصول على بيانات المستخدمين التجريبية
 * @returns {Array} - قائمة المستخدمين التجريبية
 */
getDemoUsers: function() {
    return [
        {
            uid: '1',
            email: 'admin@example.com',
            fullName: 'مدير النظام',
            type: 'admin',
            permissions: this.getDefaultPermissions('admin'),
            createdAt: '2023-01-01T00:00:00.000Z',
            lastLogin: new Date().toISOString(),
            emailVerified: true
        },
        {
            uid: '2',
            email: 'manager@example.com',
            fullName: 'مدير التطبيق',
            type: 'manager',
            permissions: this.getDefaultPermissions('manager'),
            createdAt: '2023-02-01T00:00:00.000Z',
            lastLogin: '2023-06-15T10:30:00.000Z',
            emailVerified: true
        },
        {
            uid: '3',
            email: 'user@example.com',
            fullName: 'مستخدم عادي',
            type: 'user',
            permissions: this.getDefaultPermissions('user'),
            createdAt: '2023-03-01T00:00:00.000Z',
            lastLogin: '2023-06-20T14:45:00.000Z',
            emailVerified: false
        }
    ];
},

/**
 * عرض بيانات المستخدمين في الجدول
 * @param {Array} users - قائمة المستخدمين
 */
renderUsersTable: function(users) {
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
        if (this.currentUser && user.uid === this.currentUser.uid) {
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
                        <div class="user-role">${this.getUserTypeLabel(user.type)}</div>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="badge badge-${this.getUserTypeBadgeClass(user.type)}">${this.getUserTypeLabel(user.type)}</span></td>
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
                    ${user.uid !== (this.currentUser ? this.currentUser.uid : '') ? `
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
    this.setupUserTableActions();
},

/**
 * إضافة مستمعي الأحداث لأزرار جدول المستخدمين
 */
setupUserTableActions: function() {
    // أزرار تعديل المستخدم
    const editButtons = document.querySelectorAll('.edit-user-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-id');
            this.showEditUserModal(userId);
        });
    });
    
    // أزرار إدارة الصلاحيات
    const permissionsButtons = document.querySelectorAll('.permissions-user-btn');
    permissionsButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-id');
            this.showUserPermissionsModal(userId);
        });
    });
    
    // أزرار حذف المستخدم
    const deleteButtons = document.querySelectorAll('.delete-user-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-id');
            this.confirmDeleteUser(userId);
        });
    });
},

/**
 * إظهار نافذة إضافة مستخدم جديد
 */
showAddUserModal: function() {
    // التحقق من الصلاحيات
    if (!this.currentUser || !this.hasPermission('canCreateUsers')) {
        this.showNotification('ليس لديك صلاحية لإضافة مستخدمين جدد', 'error');
        return;
    }
    
    // إنشاء محتوى النافذة
    const modalContent = `
        <div class="user-modal-header">
            <h3 class="user-modal-title">إضافة مستخدم جديد</h3>
            <button class="user-modal-close">&times;</button>
        </div>
        <div class="user-modal-body">
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
                        ${this.currentUser && this.currentUser.type === 'admin' ? '<option value="admin">مسؤول</option>' : ''}
                    </select>
                </div>
            </form>
        </div>
        <div class="user-modal-footer">
            <button class="btn btn-outline user-modal-close-btn">إلغاء</button>
            <button class="btn btn-primary" id="save-user-btn">إضافة</button>
        </div>
    `;
    
    // عرض النافذة
    this.showUserModal('add-user-modal', modalContent, modal => {
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
            saveUserBtn.addEventListener('click', () => this.addNewUser());
        }
    });
},

/**
 * عرض نافذة منبثقة مخصصة لإدارة المستخدمين
 * @param {string} modalId - معرف النافذة
 * @param {string} content - محتوى النافذة
 * @param {Function} callback - دالة يتم استدعاؤها بعد إنشاء النافذة
 */
showUserModal: function(modalId, content, callback) {
    // إغلاق أي نافذة مفتوحة
    this.closeUserModal();
    
    // إنشاء عنصر النافذة
    const modalOverlay = document.createElement('div');
    modalOverlay.id = modalId;
    modalOverlay.className = 'user-modal-overlay';
    
    // إنشاء حاوية النافذة
    const modalContainer = document.createElement('div');
    modalContainer.className = 'user-modal';
    
    // إضافة المحتوى
    modalContainer.innerHTML = content;
    
    // إضافة العناصر إلى الصفحة
    modalOverlay.appendChild(modalContainer);
    
    // إضافة النافذة إلى حاوية إدارة المستخدمين
    const container = document.getElementById('user-management-container');
    if (container) {
        container.appendChild(modalOverlay);
    } else {
        document.body.appendChild(modalOverlay);
    }
    
    // إضافة مستمعي الأحداث
    this.setupUserModalEvents(modalOverlay);
    
    // إظهار النافذة (للانتقال)
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
    
    // استدعاء دالة الاستدعاء إذا تم توفيرها
    if (typeof callback === 'function') {
        callback(modalOverlay);
    }
    
    return modalOverlay;
},

/**
 * إضافة مستمعي الأحداث للنافذة المنبثقة
 * @param {HTMLElement} modal - عنصر النافذة
 */
setupUserModalEvents: function(modal) {
    // أزرار إغلاق النافذة
    const closeButtons = modal.querySelectorAll('.user-modal-close, .user-modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => this.closeUserModal());
    });
    
    // إغلاق النافذة عند النقر خارجها
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            this.closeUserModal();
        }
    });
    
    // إغلاق النافذة عند الضغط على Escape
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            this.closeUserModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
},

/**
 * إغلاق النافذة المنبثقة المفتوحة
 */
closeUserModal: function() {
    const modal = document.querySelector('.user-modal-overlay.active');
    if (modal) {
        // إضافة تأثير الإغلاق
        modal.classList.remove('active');
        
        // إزالة العنصر بعد انتهاء الانتقال
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
},

/**
 * إضافة مستخدم جديد
 */
addNewUser: function() {
    // التحقق من الصلاحيات
    if (!this.currentUser || !this.hasPermission('canCreateUsers')) {
        this.showNotification('ليس لديك صلاحية لإضافة مستخدمين جدد', 'error');
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
        this.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // التحقق من تطابق كلمتي المرور
    if (password !== confirmPassword) {
        this.showNotification('كلمة المرور وتأكيدها غير متطابقين', 'error');
        return;
    }
    
    // التحقق من طول كلمة المرور
    if (password.length < 6) {
        this.showNotification('يجب أن تكون كلمة المرور 6 أحرف على الأقل', 'error');
        return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    if (!this.validateEmail(email)) {
        this.showNotification('البريد الإلكتروني غير صالح', 'error');
        return;
    }
    
    // التحقق من صلاحية إنشاء مسؤول
    if (userType === 'admin' && (!this.currentUser || this.currentUser.type !== 'admin')) {
        this.showNotification('ليس لديك صلاحية لإنشاء حساب مسؤول', 'error');
        return;
    }
    
    // إنشاء كائن بيانات المستخدم
    const newUser = {
        profile: {
            fullName: fullName,
            email: email,
            type: userType,
            permissions: this.getDefaultPermissions(userType),
            createdAt: new Date().toISOString(),
            lastLogin: null,
            emailVerified: false,
            createdBy: this.currentUser ? this.currentUser.uid : 'system'
        }
    };
    
    // حفظ المستخدم في قاعدة البيانات
    if (this.databaseRef) {
        // إنشاء معرف فريد للمستخدم
        const newUserId = this.databaseRef.ref('users').push().key;
        
        // حفظ بيانات المستخدم
        this.databaseRef.ref('users/' + newUserId).set(newUser)
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
                this.showNotification('تم إضافة المستخدم بنجاح', 'success');
                this.closeUserModal();
                this.loadUsers();
                
                // تسجيل النشاط في السجل
                this.logActivity({
                    type: 'user_created',
                    details: `تم إنشاء مستخدم جديد: ${fullName} (${email})`,
                    targetId: newUserId,
                    targetType: 'user'
                });
            })
            .catch(error => {
                console.error('خطأ في إضافة المستخدم:', error);
                this.showNotification(this.getErrorMessage(error) || 'حدث خطأ أثناء إضافة المستخدم', 'error');
            });
    } else {
        // محاكاة إضافة المستخدم في وضع العرض التوضيحي
        const newUserId = 'user_' + Date.now();
        this.showNotification('تم إضافة المستخدم بنجاح (وضع العرض التوضيحي)', 'success');
        this.closeUserModal();
        
        // إضافة المستخدم الجديد إلى قائمة العرض
        const demoUsers = this.getDemoUsers();
        demoUsers.push({
            uid: newUserId,
            email: email,
            fullName: fullName,
            type: userType,
            permissions: this.getDefaultPermissions(userType),
            createdAt: new Date().toISOString(),
            lastLogin: null,
            emailVerified: false
        });
        
        this.renderUsersTable(demoUsers);
    }
},

/**
 * الحصول على الصلاحيات الافتراضية لنوع المستخدم
 * @param {string} userType - نوع المستخدم: 'admin'، 'manager'، 'user'
 * @returns {Object} - كائن يحتوي على الصلاحيات الافتراضية
 */
getDefaultPermissions: function(userType) {
    const permissions = {};
    
    // تعيين جميع الصلاحيات إلى false أولاً
    Object.keys(this.PERMISSIONS).forEach(key => {
        permissions[key] = false;
    });
    
    // تعيين الصلاحيات حسب نوع المستخدم
    switch (userType) {
        case 'admin':
            // المسؤول لديه جميع الصلاحيات
            Object.keys(this.PERMISSIONS).forEach(key => {
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
},

/**
 * التحقق من وجود صلاحية محددة للمستخدم الحالي
 * @param {string} permissionKey - مفتاح الصلاحية
 * @returns {boolean} - هل المستخدم يملك الصلاحية
 */
hasPermission: function(permissionKey) {
    // المستخدم غير مسجل الدخول
    if (!this.currentUser || !this.currentUser.type) {
        return false;
    }
    
    // المسؤول يملك جميع الصلاحيات
    if (this.currentUser.type === 'admin') {
        return true;
    }
    
    // التحقق من وجود الصلاحية للمستخدم
    return this.currentUser.permissions && this.currentUser.permissions[permissionKey] === true;
},

/**
 * عرض إشعار للمستخدم
 * @param {string} message - نص الإشعار
 * @param {string} type - نوع الإشعار: 'success'، 'error'، 'info'، 'warning'
 */
showNotification: function(message, type = 'info') {
    // البحث عن نظام الإشعارات الموجود
    if (window.NotificationSystem && typeof window.NotificationSystem.showNotification === 'function') {
        window.NotificationSystem.showNotification(message, type);
        return;
    }
    
    // إنشاء حاوية الإشعارات إذا لم تكن موجودة
    let notificationContainer = document.querySelector('.user-notifications-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'user-notifications-container';
        document.getElementById('user-management-container').appendChild(notificationContainer);
    }
    
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `user-notification user-notification-${type}`;
    
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
     <div class="user-notification-icon">
         <i class="fas fa-${iconClass}"></i>
     </div>
     <div class="user-notification-content">
         <div class="user-notification-message">${message}</div>
     </div>
     <button class="user-notification-close">
         <i class="fas fa-times"></i>
     </button>
 `;
 
 // إضافة مستمع حدث لزر الإغلاق
 const closeButton = notification.querySelector('.user-notification-close');
 if (closeButton) {
     closeButton.addEventListener('click', function() {
         notification.classList.add('user-notification-closing');
         setTimeout(() => {
             if (notification.parentNode) {
                 notification.parentNode.removeChild(notification);
             }
         }, 300);
     });
 }
 
 // إضافة الإشعار إلى الحاوية
 notificationContainer.appendChild(notification);
 
 // جعل الإشعار مرئيًا (للانتقال)
 setTimeout(() => {
     notification.classList.add('user-notification-visible');
 }, 10);
 
 // إغلاق الإشعار تلقائيًا بعد فترة
 setTimeout(() => {
     if (notification.parentNode === notificationContainer) {
         notification.classList.add('user-notification-closing');
         setTimeout(() => {
             if (notification.parentNode === notificationContainer) {
                 notificationContainer.removeChild(notification);
             }
         }, 300);
     }
 }, 5000);
},

/**
* تصفية المستخدمين حسب النوع
* @param {string} filterType - نوع التصفية: 'all'، 'admin'، 'manager'، 'user'
*/
filterUsers: function(filterType) {
 const userRows = document.querySelectorAll('#users-table tbody tr');
 
 userRows.forEach(row => {
     if (filterType === 'all' || row.getAttribute('data-type') === filterType) {
         row.style.display = '';
     } else {
         row.style.display = 'none';
     }
 });
},

/**
* البحث في المستخدمين
* @param {string} searchText - نص البحث
*/
searchUsers: function(searchText) {
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
},

/**
* التحقق من صحة البريد الإلكتروني
* @param {string} email - البريد الإلكتروني
* @returns {boolean} - هل البريد الإلكتروني صالح
*/
validateEmail: function(email) {
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 return emailRegex.test(email);
},

/**
* الحصول على نص وصفي لنوع المستخدم
* @param {string} userType - نوع المستخدم
* @returns {string} - النص الوصفي
*/
getUserTypeLabel: function(userType) {
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
},

/**
* الحصول على فئة الشارة لنوع المستخدم
* @param {string} userType - نوع المستخدم
* @returns {string} - فئة الشارة
*/
getUserTypeBadgeClass: function(userType) {
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
},

/**
* عرض نافذة تعديل بيانات المستخدم
* @param {string} userId - معرف المستخدم
*/
showEditUserModal: function(userId) {
 // التحقق من الصلاحيات
 if (!this.currentUser || !this.hasPermission('canCreateUsers')) {
     this.showNotification('ليس لديك صلاحية لتعديل بيانات المستخدمين', 'error');
     return;
 }
 
 // الحصول على بيانات المستخدم من الجدول
 const userRow = document.querySelector(`tr[data-id="${userId}"]`);
 if (!userRow) {
     this.showNotification('لم يتم العثور على بيانات المستخدم', 'error');
     return;
 }
 
 const userType = userRow.getAttribute('data-type');
 const userEmail = userRow.getAttribute('data-email');
 const userName = userRow.querySelector('.user-name').textContent;
 
 // إنشاء محتوى النافذة
 const modalContent = `
     <div class="user-modal-header">
         <h3 class="user-modal-title">تعديل بيانات المستخدم</h3>
         <button class="user-modal-close">&times;</button>
     </div>
     <div class="user-modal-body">
         <form id="edit-user-form">
             <input type="hidden" id="edit-user-id" value="${userId}">
             
             <div class="form-group">
                 <label class="form-label">الاسم الكامل</label>
                 <input type="text" class="form-input" id="edit-user-fullname" value="${userName}" required>
             </div>
             
             <div class="form-group">
                 <label class="form-label">البريد الإلكتروني</label>
                 <input type="email" class="form-input" id="edit-user-email" value="${userEmail}" required ${this.currentUser && userId === this.currentUser.uid ? 'disabled' : ''}>
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
                 <select class="form-select" id="edit-user-type" ${this.currentUser && userId === this.currentUser.uid ? 'disabled' : ''}>
                     <option value="user" ${userType === 'user' ? 'selected' : ''}>مستخدم عادي</option>
                     <option value="manager" ${userType === 'manager' ? 'selected' : ''}>مدير</option>
                     ${this.currentUser && this.currentUser.type === 'admin' ? `<option value="admin" ${userType === 'admin' ? 'selected' : ''}>مسؤول</option>` : ''}
                 </select>
             </div>
         </form>
     </div>
     <div class="user-modal-footer">
         <button class="btn btn-outline user-modal-close-btn">إلغاء</button>
         <button class="btn btn-primary" id="update-user-btn">حفظ التغييرات</button>
     </div>
 `;
 
 // عرض النافذة
 this.showUserModal('edit-user-modal', modalContent, (modal) => {
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
         updateUserBtn.addEventListener('click', () => this.updateUser());
     }
 });
},

/**
* تحديث بيانات المستخدم
*/
updateUser: function() {
 // التحقق من الصلاحيات
 if (!this.currentUser || !this.hasPermission('canCreateUsers')) {
     this.showNotification('ليس لديك صلاحية لتعديل بيانات المستخدمين', 'error');
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
     this.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
     return;
 }
 
 // التحقق من صحة البريد الإلكتروني
 if (!this.validateEmail(email)) {
     this.showNotification('البريد الإلكتروني غير صالح', 'error');
     return;
 }
 
 // التحقق من صلاحية تعديل نوع المستخدم
 if (this.currentUser && userId === this.currentUser.uid && userType !== this.currentUser.type) {
     this.showNotification('لا يمكنك تغيير نوع حسابك الخاص', 'error');
     return;
 }
 
 // التحقق من صلاحية تعديل حساب مسؤول
 if (userType === 'admin' && (!this.currentUser || this.currentUser.type !== 'admin')) {
     this.showNotification('ليس لديك صلاحية لتعيين مستخدم كمسؤول', 'error');
     return;
 }
 
 // إنشاء كائن بيانات التحديث
 const userUpdates = {
     'profile.fullName': fullName,
     'profile.type': userType
 };
 
 // إذا تم تغيير البريد الإلكتروني، قم بتحديثه
 if (this.currentUser && userId !== this.currentUser.uid) {
     userUpdates['profile.email'] = email;
 }
 
 // تحديث بيانات المستخدم في قاعدة البيانات
 if (this.databaseRef) {
     // تحديث بيانات الملف الشخصي
     this.databaseRef.ref(`users/${userId}`).update(userUpdates)
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
             
             this.showNotification('تم تحديث بيانات المستخدم بنجاح', 'success');
             this.closeUserModal();
             this.loadUsers();
             
             // تسجيل النشاط في السجل
             this.logActivity({
                 type: 'user_updated',
                 details: `تم تحديث بيانات المستخدم: ${fullName} (${email})`,
                 targetId: userId,
                 targetType: 'user'
             });
         })
         .catch(error => {
             console.error('خطأ في تحديث بيانات المستخدم:', error);
             this.showNotification(this.getErrorMessage(error) || 'حدث خطأ أثناء تحديث بيانات المستخدم', 'error');
         });
 } else {
     // محاكاة تحديث المستخدم في وضع العرض التوضيحي
     this.showNotification('تم تحديث بيانات المستخدم بنجاح (وضع العرض التوضيحي)', 'success');
     this.closeUserModal();
     
     // تحديث بيانات المستخدم في قائمة العرض
     const demoUsers = this.getDemoUsers();
     const userIndex = demoUsers.findIndex(user => user.uid === userId);
     
     if (userIndex !== -1) {
         demoUsers[userIndex].fullName = fullName;
         demoUsers[userIndex].email = email;
         demoUsers[userIndex].type = userType;
         
         this.renderUsersTable(demoUsers);
     }
 }
},

/**
 * تأكيد حذف المستخدم
 * @param {string} userId - معرف المستخدم
 */
confirmDeleteUser: function(userId) {
    // التحقق من الصلاحيات
    if (!this.currentUser || !this.hasPermission('canDeleteUsers')) {
        this.showNotification('ليس لديك صلاحية لحذف المستخدمين', 'error');
        return;
    }
    
    // منع حذف حساب المستخدم الحالي
    if (this.currentUser && userId === this.currentUser.uid) {
        this.showNotification('لا يمكنك حذف حسابك الخاص', 'error');
        return;
    }
    
    // الحصول على بيانات المستخدم من الجدول
    const userRow = document.querySelector(`tr[data-id="${userId}"]`);
    if (!userRow) {
        this.showNotification('لم يتم العثور على بيانات المستخدم', 'error');
        return;
    }
    
    const userName = userRow.querySelector('.user-name').textContent;
    
    // إنشاء محتوى النافذة
    const modalContent = `
        <div class="user-modal-header">
            <h3 class="user-modal-title">تأكيد حذف المستخدم</h3>
            <button class="user-modal-close">&times;</button>
        </div>
        <div class="user-modal-body">
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle alert-icon"></i>
                هل أنت متأكد من رغبتك في حذف المستخدم <strong>${userName}</strong>؟
            </div>
            <p>هذا الإجراء لا يمكن التراجع عنه، وسيتم حذف جميع بيانات المستخدم.</p>
            <input type="hidden" id="delete-user-id" value="${userId}">
        </div>
        <div class="user-modal-footer">
            <button class="btn btn-outline user-modal-close-btn">إلغاء</button>
            <button class="btn btn-danger" id="confirm-delete-user-btn">تأكيد الحذف</button>
        </div>
    `;
    
    // عرض النافذة
    this.showUserModal('delete-user-modal', modalContent, (modal) => {
        // مستمع حدث زر تأكيد الحذف
        const confirmDeleteBtn = modal.querySelector('#confirm-delete-user-btn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.deleteUser(userId, userName));
        }
    });
},

/**
 * حذف المستخدم
 * @param {string} userId - معرف المستخدم
 * @param {string} userName - اسم المستخدم (للسجل)
 */
deleteUser: function(userId, userName) {
    // التحقق من الصلاحيات
    if (!this.currentUser || !this.hasPermission('canDeleteUsers')) {
        this.showNotification('ليس لديك صلاحية لحذف المستخدمين', 'error');
        return;
    }
    
    // حذف المستخدم من قاعدة البيانات
    if (this.databaseRef) {
        // حذف بيانات المستخدم أولاً
        this.databaseRef.ref(`users/${userId}`).remove()
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
                this.showNotification('تم حذف المستخدم بنجاح', 'success');
                this.closeUserModal();
                this.loadUsers();
                
                // تسجيل النشاط في السجل
                this.logActivity({
                    type: 'user_deleted',
                    details: `تم حذف المستخدم: ${userName} (${userId})`,
                    targetId: userId,
                    targetType: 'user'
                });
            })
            .catch(error => {
                console.error('خطأ في حذف المستخدم:', error);
                this.showNotification(this.getErrorMessage(error) || 'حدث خطأ أثناء حذف المستخدم', 'error');
            });
    } else {
        // محاكاة حذف المستخدم في وضع العرض التوضيحي
        this.showNotification('تم حذف المستخدم بنجاح (وضع العرض التوضيحي)', 'success');
        this.closeUserModal();
        
        // حذف المستخدم من قائمة العرض
        const demoUsers = this.getDemoUsers();
        const filteredUsers = demoUsers.filter(user => user.uid !== userId);
        this.renderUsersTable(filteredUsers);
    }
},

/**
 * عرض نافذة إدارة صلاحيات المستخدم
 * @param {string} userId - معرف المستخدم
 */
showUserPermissionsModal: function(userId) {
    // التحقق من الصلاحيات
    if (!this.currentUser || !this.hasPermission('canManageSettings')) {
        this.showNotification('ليس لديك صلاحية لإدارة صلاحيات المستخدمين', 'error');
        return;
    }
    
    // الحصول على بيانات المستخدم من الجدول
    const userRow = document.querySelector(`tr[data-id="${userId}"]`);
    if (!userRow) {
        this.showNotification('لم يتم العثور على بيانات المستخدم', 'error');
        return;
    }
    
    const userType = userRow.getAttribute('data-type');
    const userName = userRow.querySelector('.user-name').textContent;
    
    // الحصول على الصلاحيات الحالية
    this.getUserPermissions(userId)
        .then(currentPermissions => {
            // إنشاء محتوى النافذة
            const modalContent = `
                <div class="user-modal-header">
                    <h3 class="user-modal-title">إدارة صلاحيات المستخدم</h3>
                    <button class="user-modal-close">&times;</button>
                </div>
                <div class="user-modal-body">
                    <input type="hidden" id="permissions-user-id" value="${userId}">
                    
                    <div class="user-info-section">
                        <div class="user-info-cell">
                            <div class="user-avatar small">${userName ? userName.charAt(0).toUpperCase() : 'U'}</div>
                            <div>
                                <div class="user-name">${userName || 'مستخدم'}</div>
                                <div class="user-role">${this.getUserTypeLabel(userType)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">الصلاحيات المتاحة</label>
                        <div class="permissions-list">
                            ${this.generatePermissionsCheckboxes(currentPermissions)}
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-outline btn-sm" id="reset-default-permissions-btn">إعادة تعيين الصلاحيات الافتراضية</button>
                    </div>
                </div>
                <div class="user-modal-footer">
                    <button class="btn btn-outline user-modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-permissions-btn">حفظ الصلاحيات</button>
                </div>
            `;
            
            // عرض النافذة
            this.showUserModal('user-permissions-modal', modalContent, (modal) => {
                // إضافة مستمع حدث لزر إعادة تعيين الصلاحيات الافتراضية
                const resetBtn = modal.querySelector('#reset-default-permissions-btn');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => this.resetToDefaultPermissions(userType));
                }
                
                // مستمع حدث زر حفظ الصلاحيات
                const savePermissionsBtn = modal.querySelector('#save-permissions-btn');
                if (savePermissionsBtn) {
                    savePermissionsBtn.addEventListener('click', () => this.saveUserPermissions());
                }
            });
        })
        .catch(error => {
            console.error('خطأ في الحصول على صلاحيات المستخدم:', error);
            this.showNotification('حدث خطأ أثناء تحميل صلاحيات المستخدم', 'error');
        });
},

/**
 * الحصول على صلاحيات المستخدم الحالية
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<Object>} - وعد يحتوي على صلاحيات المستخدم
 */
getUserPermissions: function(userId) {
    return new Promise((resolve, reject) => {
        if (this.databaseRef) {
            this.databaseRef.ref(`users/${userId}/profile/permissions`).once('value')
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
            const demoUsers = this.getDemoUsers();
            const user = demoUsers.find(user => user.uid === userId);
            
            if (user && user.permissions) {
                resolve(user.permissions);
            } else {
                // إذا لم يتم العثور على المستخدم، استخدم الصلاحيات الافتراضية
                const userRow = document.querySelector(`tr[data-id="${userId}"]`);
                const userType = userRow ? userRow.getAttribute('data-type') : 'user';
                resolve(this.getDefaultPermissions(userType));
            }
        }
    });
},

/**
 * إنشاء مربعات اختيار الصلاحيات
 * @param {Object} currentPermissions - الصلاحيات الحالية للمستخدم
 * @returns {string} - HTML لمربعات اختيار الصلاحيات
 */
generatePermissionsCheckboxes: function(currentPermissions) {
    let checkboxesHTML = '';
    
    for (const [key, label] of Object.entries(this.PERMISSIONS)) {
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
},

/**
 * إعادة تعيين مربعات الاختيار إلى الصلاحيات الافتراضية لنوع المستخدم
 * @param {string} userType - نوع المستخدم
 */
resetToDefaultPermissions: function(userType) {
    const defaultPermissions = this.getDefaultPermissions(userType);
    const checkboxes = document.querySelectorAll('input[data-permission]');
    
    checkboxes.forEach(checkbox => {
        const permissionKey = checkbox.getAttribute('data-permission');
        checkbox.checked = defaultPermissions[permissionKey] === true;
    });
},

/**
 * حفظ صلاحيات المستخدم
 */
saveUserPermissions: function() {
    // التحقق من الصلاحيات
    if (!this.currentUser || !this.hasPermission('canManageSettings')) {
        this.showNotification('ليس لديك صلاحية لإدارة صلاحيات المستخدمين', 'error');
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
    if (this.databaseRef) {
        this.databaseRef.ref(`users/${userId}/profile/permissions`).set(permissions)
            .then(() => {
                this.showNotification('تم حفظ صلاحيات المستخدم بنجاح', 'success');
                this.closeUserModal();
                
                // تسجيل النشاط في السجل
                this.logActivity({
                    type: 'permissions_updated',
                    details: `تم تحديث صلاحيات المستخدم: ${userId}`,
                    targetId: userId,
                    targetType: 'user'
                });
            })
            .catch(error => {
                console.error('خطأ في حفظ صلاحيات المستخدم:', error);
                this.showNotification(this.getErrorMessage(error) || 'حدث خطأ أثناء حفظ صلاحيات المستخدم', 'error');
            });
    } else {
        // محاكاة حفظ الصلاحيات في وضع العرض التوضيحي
        this.showNotification('تم حفظ صلاحيات المستخدم بنجاح (وضع العرض التوضيحي)', 'success');
        this.closeUserModal();
    }
},

/**
 * تسجيل نشاط في سجل النظام
 * @param {Object} activityData - بيانات النشاط
 */
logActivity: function(activityData) {
    if (!activityData) return;
    
    // إضافة معلومات إضافية
    const activity = {
        ...activityData,
        timestamp: new Date().toISOString(),
        userId: this.currentUser ? this.currentUser.uid : 'system',
        userName: this.currentUser ? (this.currentUser.fullName || this.currentUser.email) : 'النظام'
    };
    
    // تسجيل النشاط في قاعدة البيانات
    if (this.databaseRef) {
        this.databaseRef.ref('logs').push(activity)
            .catch(error => {
                console.error('خطأ في تسجيل النشاط:', error);
            });
    } else {
        // تخزين النشاط في الذاكرة في وضع العرض التوضيحي
        if (!this.logsCache[this.currentLogsPage]) {
            this.logsCache[this.currentLogsPage] = [];
        }
        
        this.logsCache[this.currentLogsPage].unshift(activity);
        console.log('تم تسجيل النشاط (وضع العرض التوضيحي):', activity);
    }
},

/**
 * الحصول على رسالة الخطأ المناسبة
 * @param {Error} error - كائن الخطأ
 * @returns {string} - رسالة الخطأ المناسبة
 */
getErrorMessage: function(error) {
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
},

/**
* تنسيق التاريخ والوقت
* @param {Date} date - كائن التاريخ
* @returns {Object} - كائن يحتوي على التاريخ والوقت المنسقين
*/
formatDateTime: function(date) {
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
},

/**
* إظهار لوحة تفاصيل المستخدم
* @param {string} userId - معرف المستخدم
*/
showUserDetails: function(userId) {
// التحقق من صلاحيات المستخدم
if (!this.currentUser || !this.hasPermission('canCreateUsers')) {
    this.showNotification('ليس لديك صلاحية لعرض تفاصيل المستخدمين', 'error');
    return;
}

// الحصول على بيانات المستخدم من الجدول
const userRow = document.querySelector(`tr[data-id="${userId}"]`);
if (!userRow) {
    this.showNotification('لم يتم العثور على بيانات المستخدم', 'error');
    return;
}

const userType = userRow.getAttribute('data-type');
const userEmail = userRow.getAttribute('data-email');
const userName = userRow.querySelector('.user-name').textContent;

// الحصول على بيانات أنشطة المستخدم
this.getUserActivities(userId)
    .then(activities => {
        // إنشاء محتوى النافذة
        const modalContent = `
            <div class="user-modal-header">
                <h3 class="user-modal-title">تفاصيل المستخدم</h3>
                <button class="user-modal-close">&times;</button>
            </div>
            <div class="user-modal-body user-detail-modal">
                <div class="text-center mb-20">
                    <div class="user-avatar medium">${userName ? userName.charAt(0).toUpperCase() : 'U'}</div>
                    <h3 class="user-full-name">${userName || 'مستخدم'}</h3>
                    <span class="badge badge-${this.getUserTypeBadgeClass(userType)}">${this.getUserTypeLabel(userType)}</span>
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
                        <div class="detail-value">${this.getUserCreationDate(userId) || 'غير معروف'}</div>
                    </div>
                    <div class="details-row">
                        <div class="detail-label">آخر تسجيل دخول:</div>
                        <div class="detail-value">${this.getUserLastLogin(userId) || 'غير معروف'}</div>
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
                        <div class="user-stat-value">${this.formatDateTime(new Date()).date}</div>
                        <div class="user-stat-label">اليوم</div>
                    </div>
                </div>
                
                <div class="user-activities-section">
                    <h4 class="section-title">آخر الأنشطة</h4>
                    <div class="activities-list">
                        ${this.generateActivitiesList(activities.recent)}
                    </div>
                </div>
            </div>
            <div class="user-modal-footer">
                <button class="btn btn-outline user-modal-close-btn">إغلاق</button>
                <button class="btn btn-primary" id="edit-user-details-btn" data-id="${userId}">تعديل المستخدم</button>
            </div>
        `;
        
        // عرض النافذة
        this.showUserModal('user-details-modal', modalContent, (modal) => {
            // مستمع حدث زر التعديل
            const editUserBtn = modal.querySelector('#edit-user-details-btn');
            if (editUserBtn) {
                editUserBtn.addEventListener('click', () => {
                    const userId = editUserBtn.getAttribute('data-id');
                    this.closeUserModal();
                    this.showEditUserModal(userId);
                });
            }
        });
    })
    .catch(error => {
        console.error('خطأ في الحصول على أنشطة المستخدم:', error);
        this.showNotification('حدث خطأ أثناء تحميل تفاصيل المستخدم', 'error');
    });
},

/**
* الحصول على تاريخ إنشاء المستخدم
* @param {string} userId - معرف المستخدم
* @returns {string} - تاريخ الإنشاء المنسق
*/
getUserCreationDate: function(userId) {
const userRow = document.querySelector(`tr[data-id="${userId}"]`);
if (userRow) {
    return userRow.querySelector('td:nth-child(5)').textContent;
}
return 'غير معروف';
},

/**
* الحصول على تاريخ آخر تسجيل دخول للمستخدم
* @param {string} userId - معرف المستخدم
* @returns {string} - تاريخ آخر تسجيل دخول منسق
*/
getUserLastLogin: function(userId) {
const userRow = document.querySelector(`tr[data-id="${userId}"]`);
if (userRow) {
    return userRow.querySelector('td:nth-child(6)').textContent;
}
return 'غير معروف';
},

/**
* الحصول على أنشطة المستخدم
* @param {string} userId - معرف المستخدم
* @returns {Promise<Object>} - وعد يحتوي على معلومات أنشطة المستخدم
*/
getUserActivities: function(userId) {
return new Promise((resolve, reject) => {
    if (this.databaseRef) {
        // الحصول على سجلات المستخدم من قاعدة البيانات
        this.databaseRef.ref('logs')
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
        const demoActivities = this.getDemoUserActivities(userId);
        resolve(demoActivities);
    }
});
},

/**
* الحصول على أنشطة المستخدم التجريبية
* @param {string} userId - معرف المستخدم
* @returns {Object} - بيانات أنشطة المستخدم التجريبية
*/
getDemoUserActivities: function(userId) {
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
},

/**
* إنشاء قائمة الأنشطة الأخيرة
* @param {Array} activities - قائمة الأنشطة
* @returns {string} - HTML لقائمة الأنشطة
*/
generateActivitiesList: function(activities) {
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
    const formatted = this.formatDateTime(timestamp);
    
    activitiesHTML += `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${this.getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-details">${activity.details}</div>
                <div class="activity-time">${formatted.date} ${formatted.time}</div>
            </div>
        </div>
    `;
});

return activitiesHTML;
},

/**
* الحصول على أيقونة مناسبة لنوع النشاط
* @param {string} activityType - نوع النشاط
* @returns {string} - فئة الأيقونة
*/
getActivityIcon: function(activityType) {
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
},

/**
* تهيئة نظام إدارة المستخدمين عند تحميل الصفحة
*/
init: function() {
// تهيئة وحدة إدارة المستخدمين
document.addEventListener('DOMContentLoaded', () => this.initUserManagement());
}
};

// تهيئة النظام
UserManagement.init();