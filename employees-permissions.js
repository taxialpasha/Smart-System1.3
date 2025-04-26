/**
 * employees-permissions.js
 * صلاحيات نظام إدارة الموظفين
 * يوفر ربط نظام الصلاحيات مع نظام إدارة الموظفين
 */

(function() {
    // تهيئة النظام عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        console.log('تهيئة صلاحيات نظام إدارة الموظفين...');
        
        // تعريف صلاحيات الموظفين
        defineEmployeePermissions();
        
        // إضافة واجهة إدارة الصلاحيات
        addPermissionsUI();
        
        // ربط نظام الصلاحيات بوظائف الموظفين
        setupPermissionsIntegration();
    });
    
    /**
     * تعريف صلاحيات الموظفين
     */
    function defineEmployeePermissions() {
        // التحقق من وجود نظام الصلاحيات
        if (typeof window.PermissionsSystem === 'undefined') {
            console.warn('لم يتم العثور على نظام الصلاحيات');
            return;
        }
        
        // إضافة صلاحيات الموظفين
        const employeePermissions = [
            { key: 'employees-view', name: 'عرض الموظفين', description: 'عرض قائمة الموظفين وتفاصيلهم' },
            { key: 'employees-add', name: 'إضافة موظفين', description: 'إضافة موظفين جدد للنظام' },
            { key: 'employees-edit', name: 'تعديل الموظفين', description: 'تعديل بيانات الموظفين' },
            { key: 'employees-delete', name: 'حذف الموظفين', description: 'حذف الموظفين من النظام' },
            { key: 'employees-salary', name: 'إدارة الرواتب', description: 'صرف الرواتب وتعديلها' },
            { key: 'employees-reports', name: 'تقارير الموظفين', description: 'عرض تقارير الموظفين والرواتب' },
        ];
        
        // إضافة الصلاحيات إلى النظام
        window.PermissionsSystem.addPermissions('employees', employeePermissions);
        
        // ربط الصلاحيات بالأدوار
        window.PermissionsSystem.assignPermissionToRole('admin', 'employees-view');
        window.PermissionsSystem.assignPermissionToRole('admin', 'employees-add');
        window.PermissionsSystem.assignPermissionToRole('admin', 'employees-edit');
        window.PermissionsSystem.assignPermissionToRole('admin', 'employees-delete');
        window.PermissionsSystem.assignPermissionToRole('admin', 'employees-salary');
        window.PermissionsSystem.assignPermissionToRole('admin', 'employees-reports');
        
        window.PermissionsSystem.assignPermissionToRole('manager', 'employees-view');
        window.PermissionsSystem.assignPermissionToRole('manager', 'employees-add');
        window.PermissionsSystem.assignPermissionToRole('manager', 'employees-edit');
        window.PermissionsSystem.assignPermissionToRole('manager', 'employees-salary');
        window.PermissionsSystem.assignPermissionToRole('manager', 'employees-reports');
        
        window.PermissionsSystem.assignPermissionToRole('hr', 'employees-view');
        window.PermissionsSystem.assignPermissionToRole('hr', 'employees-add');
        window.PermissionsSystem.assignPermissionToRole('hr', 'employees-edit');
        window.PermissionsSystem.assignPermissionToRole('hr', 'employees-salary');
        
        window.PermissionsSystem.assignPermissionToRole('user', 'employees-view');
    }
    
    /**
     * إضافة واجهة إدارة الصلاحيات
     */
    function addPermissionsUI() {
        // التحقق من وجود صفحة الإعدادات
        const settingsPage = document.getElementById('settings-page');
        if (!settingsPage) return;
        
        // البحث عن تبويبات الإعدادات
        const tabButtons = settingsPage.querySelector('.tab-buttons');
        if (!tabButtons) return;
        
        // إضافة تبويب الصلاحيات إذا لم يكن موجوداً
        if (!document.querySelector('button[data-tab="permissions"]')) {
            const permissionsTabButton = document.createElement('button');
            permissionsTabButton.className = 'tab-btn';
            permissionsTabButton.setAttribute('data-tab', 'permissions');
            permissionsTabButton.textContent = 'الصلاحيات';
            
            // إضافة التبويب إلى الأزرار
            tabButtons.appendChild(permissionsTabButton);
            
            // إضافة محتوى تبويب الصلاحيات
            addPermissionsTabContent(settingsPage);
        }
    }
    
    /**
     * إضافة محتوى تبويب الصلاحيات
     * @param {HTMLElement} settingsPage - صفحة الإعدادات
     */
    function addPermissionsTabContent(settingsPage) {
        // التحقق من عدم وجود التبويب مسبقاً
        if (document.getElementById('permissions-tab')) return;
        
        // إنشاء محتوى التبويب
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.id = 'permissions-tab';
        
        tabContent.innerHTML = `
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">إدارة صلاحيات الموظفين</h3>
                </div>
                <div class="permissions-container">
                    <div class="permissions-roles">
                        <h4>الأدوار والصلاحيات</h4>
                        <div class="roles-list">
                            <div class="role-item active" data-role="admin">
                                <div class="role-name">مسؤول النظام</div>
                                <div class="role-description">صلاحيات كاملة للنظام</div>
                            </div>
                            <div class="role-item" data-role="manager">
                                <div class="role-name">مدير</div>
                                <div class="role-description">إدارة الموظفين والرواتب</div>
                            </div>
                            <div class="role-item" data-role="hr">
                                <div class="role-name">موارد بشرية</div>
                                <div class="role-description">إدارة الموظفين وصرف الرواتب</div>
                            </div>
                            <div class="role-item" data-role="user">
                                <div class="role-name">مستخدم</div>
                                <div class="role-description">وصول محدود</div>
                            </div>
                        </div>
                    </div>
                    <div class="permissions-details">
                        <h4>صلاحيات الدور: <span id="selected-role-name">مسؤول النظام</span></h4>
                        <div class="permissions-list" id="role-permissions-list">
                            <!-- تملأ ديناميكياً -->
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">إدارة المستخدمين</h3>
                </div>
                <div class="users-container">
                    <div class="table-container">
                        <table id="users-table">
                            <thead>
                                <tr>
                                    <th>المعرف</th>
                                    <th>اسم المستخدم</th>
                                    <th>الاسم الكامل</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>الدور</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- تملأ ديناميكياً -->
                            </tbody>
                        </table>
                    </div>
                    <div class="actions-bar">
                        <button class="btn btn-primary" id="add-user-btn">
                            <i class="fas fa-plus"></i>
                            <span>إضافة مستخدم</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة التبويب إلى صفحة الإعدادات
        const tabContainer = settingsPage.querySelector('.tabs');
        if (tabContainer) {
            tabContainer.appendChild(tabContent);
        }
        
        // إضافة أنماط CSS
        addPermissionsStyles();
        
        // إضافة مستمعي الأحداث
        setupPermissionsEventListeners();
        
        // تهيئة عرض صلاحيات الدور الافتراضي
        loadRolePermissions('admin');
        
        // تحميل بيانات المستخدمين
        loadUsersData();
    }
    
    /**
     * إضافة أنماط CSS الخاصة بإدارة الصلاحيات
     */
    function addPermissionsStyles() {
        // التحقق من عدم وجود الأنماط مسبقاً
        if (document.getElementById('permissions-styles')) return;
        
        // إنشاء عنصر نمط
        const styleElement = document.createElement('style');
        styleElement.id = 'permissions-styles';
        
        // إضافة أنماط CSS
        styleElement.textContent = `
            .permissions-container {
                display: flex;
                gap: 20px;
                margin-top: 20px;
            }
            
            .permissions-roles {
                width: 300px;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 15px;
            }
            
            .permissions-details {
                flex: 1;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 15px;
            }
            
            .roles-list {
                margin-top: 15px;
            }
            
            .role-item {
                padding: 10px;
                border-radius: 6px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .role-item:hover {
                background-color: #f8f9fa;
            }
            
            .role-item.active {
                background-color: #e9f5ff;
                border-right: 3px solid #3b82f6;
            }
            
            .role-name {
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .role-description {
                font-size: 0.85rem;
                color: #6c757d;
            }
            
            .permissions-list {
                margin-top: 15px;
            }
            
            .permission-item {
                display: flex;
                align-items: center;
                padding: 10px;
                border-bottom: 1px solid #e9ecef;
            }
            
            .permission-item:last-child {
                border-bottom: none;
            }
            
            .permission-checkbox {
                margin-left: 10px;
            }
            
            .permission-info {
                flex: 1;
            }
            
            .permission-name {
                font-weight: 500;
                margin-bottom: 2px;
            }
            
            .permission-description {
                font-size: 0.85rem;
                color: #6c757d;
            }
            
            .users-container {
                margin-top: 20px;
            }
            
            .actions-bar {
                margin-top: 15px;
                display: flex;
                justify-content: end;
            }
            
            .user-role {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.85rem;
                font-weight: 500;
            }
            
            .user-role.admin {
                background-color: rgba(239, 68, 68, 0.1);
                color: #ef4444;
            }
            
            .user-role.manager {
                background-color: rgba(59, 130, 246, 0.1);
                color: #3b82f6;
            }
            
            .user-role.hr {
                background-color: rgba(139, 92, 246, 0.1);
                color: #8b5cf6;
            }
            
            .user-role.user {
                background-color: rgba(16, 185, 129, 0.1);
                color: #10b981;
            }
            
            .user-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.85rem;
                font-weight: 500;
            }
            
            .user-status.active {
                background-color: rgba(16, 185, 129, 0.1);
                color: #10b981;
            }
            
            .user-status.inactive {
                background-color: rgba(239, 68, 68, 0.1);
                color: #ef4444;
            }
            
            .user-actions {
                display: flex;
                gap: 5px;
            }
            
            .user-action-btn {
                border: none;
                background-color: transparent;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .user-action-btn:hover {
                background-color: #f8f9fa;
            }
            
            .user-action-btn.edit {
                color: #3b82f6;
            }
            
            .user-action-btn.delete {
                color: #ef4444;
            }
        `;
        
        // إضافة العنصر إلى الصفحة
        document.head.appendChild(styleElement);
    }
    
    /**
     * إعداد مستمعي الأحداث لصفحة الصلاحيات
     */
    function setupPermissionsEventListeners() {
        // مستمع النقر على عناصر الأدوار
        document.querySelectorAll('.role-item').forEach(roleItem => {
            roleItem.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع العناصر
                document.querySelectorAll('.role-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // إضافة الفئة النشطة للعنصر المحدد
                this.classList.add('active');
                
                // تحميل صلاحيات الدور
                const role = this.getAttribute('data-role');
                loadRolePermissions(role);
                
                // تحديث اسم الدور المحدد
                document.getElementById('selected-role-name').textContent = this.querySelector('.role-name').textContent;
            });
        });
        
        // مستمع النقر على زر إضافة مستخدم
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', showAddUserModal);
        }
    }
    
    /**
     * تحميل صلاحيات الدور
     * @param {string} role - اسم الدور
     */
    function loadRolePermissions(role) {
        // التحقق من وجود نظام الصلاحيات
        if (typeof window.PermissionsSystem === 'undefined') return;
        
        // الحصول على صلاحيات الدور
        const rolePermissions = window.PermissionsSystem.getRolePermissions(role) || [];
        
        // الحصول على جميع صلاحيات الموظفين
        const allEmployeePermissions = window.PermissionsSystem.getPermissions('employees') || [];
        
        // تهيئة قائمة الصلاحيات
        const permissionsList = document.getElementById('role-permissions-list');
        if (!permissionsList) return;
        
        permissionsList.innerHTML = '';
        
        // إضافة صلاحيات الموظفين إلى القائمة
        allEmployeePermissions.forEach(permission => {
            const hasPermission = rolePermissions.includes(permission.key);
            
            const permissionItem = document.createElement('div');
            permissionItem.className = 'permission-item';
            
            permissionItem.innerHTML = `
                <div class="permission-checkbox">
                    <input type="checkbox" id="${permission.key}-${role}" 
                           data-role="${role}" data-permission="${permission.key}" 
                           ${hasPermission ? 'checked' : ''} />
                </div>
                <div class="permission-info">
                    <div class="permission-name">${permission.name}</div>
                    <div class="permission-description">${permission.description}</div>
                </div>
            `;
            
            permissionsList.appendChild(permissionItem);
            
            // إضافة مستمع تغيير لخانة الاختيار
            const checkbox = permissionItem.querySelector(`input[type="checkbox"]`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    const permissionKey = this.getAttribute('data-permission');
                    const roleName = this.getAttribute('data-role');
                    
                    if (this.checked) {
                        window.PermissionsSystem.assignPermissionToRole(roleName, permissionKey);
                    } else {
                        window.PermissionsSystem.removePermissionFromRole(roleName, permissionKey);
                    }
                    
                    // حفظ التغييرات
                    window.PermissionsSystem.savePermissions();
                    
                    // عرض إشعار
                    if (window.showNotification) {
                        window.showNotification(`تم تحديث صلاحيات دور ${getRoleDisplayName(roleName)}`, 'success');
                    }
                });
            }
        });
    }
    
    /**
     * الحصول على اسم العرض للدور
     * @param {string} role - اسم الدور
     * @returns {string} - اسم العرض للدور
     */
    function getRoleDisplayName(role) {
        const roleNames = {
            'admin': 'مسؤول النظام',
            'manager': 'مدير',
            'hr': 'موارد بشرية',
            'user': 'مستخدم'
        };
        
        return roleNames[role] || role;
    }
    
    /**
     * تحميل بيانات المستخدمين
     */
    function loadUsersData() {
        // التحقق من وجود نظام المصادقة
        if (typeof window.AuthSystem === 'undefined') return;
        
        // الحصول على بيانات المستخدمين
        const users = window.AuthSystem.getUsers() || [];
        
        // عرض المستخدمين في الجدول
        const usersTableBody = document.querySelector('#users-table tbody');
        if (!usersTableBody) return;
        
        usersTableBody.innerHTML = '';
        
        // إضافة المستخدمين إلى الجدول
        users.forEach(user => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.fullName || '-'}</td>
                <td>${user.email || '-'}</td>
                <td><span class="user-role ${user.role}">${getRoleDisplayName(user.role)}</span></td>
                <td><span class="user-status ${user.status}">${user.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td>
                    <div class="user-actions">
                        <button class="user-action-btn edit" data-id="${user.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="user-action-btn delete" data-id="${user.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            usersTableBody.appendChild(row);
            
            // إضافة مستمعي الأحداث للأزرار
            const editButton = row.querySelector('.edit');
            if (editButton) {
                editButton.addEventListener('click', function() {
                    const userId = this.getAttribute('data-id');
                    showEditUserModal(userId);
                });
            }
            
            const deleteButton = row.querySelector('.delete');
            if (deleteButton) {
                deleteButton.addEventListener('click', function() {
                    const userId = this.getAttribute('data-id');
                    deleteUser(userId);
                });
            }
        });
    }
    
    /**
     * عرض نافذة إضافة مستخدم جديد
     */
    function showAddUserModal() {
        // التحقق من وجود نظام النوافذ المنبثقة
        if (typeof window.showModal !== 'function') {
            console.warn('لم يتم العثور على نظام النوافذ المنبثقة');
            return;
        }
        
        // إنشاء محتوى النافذة
        const modalContent = `
            <form id="add-user-form">
                <div class="grid-cols-2">
                    <div class="form-group">
                        <label class="form-label">اسم المستخدم</label>
                        <input class="form-input" id="user-username" required type="text" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">كلمة المرور</label>
                        <input class="form-input" id="user-password" required type="password" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">الاسم الكامل</label>
                        <input class="form-input" id="user-fullname" type="text" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">البريد الإلكتروني</label>
                        <input class="form-input" id="user-email" type="email" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">الدور</label>
                        <select class="form-select" id="user-role" required>
                            <option value="admin">مسؤول النظام</option>
                            <option value="manager">مدير</option>
                            <option value="hr">موارد بشرية</option>
                            <option value="user" selected>مستخدم</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الحالة</label>
                        <select class="form-select" id="user-status" required>
                            <option value="active" selected>نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>
                </div>
            </form>
        `;
        
        // عرض النافذة المنبثقة
        window.showModal({
            title: 'إضافة مستخدم جديد',
            content: modalContent,
            onConfirm: addNewUser,
            confirmText: 'إضافة',
            cancelText: 'إلغاء'
        });
    }
    
    /**
     * إضافة مستخدم جديد
     */
    function addNewUser() {
        // التحقق من وجود نظام المصادقة
        if (typeof window.AuthSystem === 'undefined') return false;
        
        // جمع بيانات المستخدم
        const username = document.getElementById('user-username').value.trim();
        const password = document.getElementById('user-password').value.trim();
        const fullName = document.getElementById('user-fullname').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const role = document.getElementById('user-role').value;
        const status = document.getElementById('user-status').value;
        
        // التحقق من البيانات المطلوبة
        if (!username || !password || !role) {
            if (window.showNotification) {
                window.showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
            }
            return false;
        }
        
        // إنشاء بيانات المستخدم
        const userData = {
            username,
            password,
            fullName,
            email,
            role,
            status
        };
        
        try {
            // إضافة المستخدم
            window.AuthSystem.addUser(userData);
            
            // إعادة تحميل بيانات المستخدمين
            loadUsersData();
            
            // عرض إشعار النجاح
            if (window.showNotification) {
                window.showNotification(`تم إضافة المستخدم ${username} بنجاح`, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في إضافة المستخدم:', error);
            
            if (window.showNotification) {
                window.showNotification(`حدث خطأ أثناء إضافة المستخدم: ${error.message}`, 'error');
            }
            
            return false;
        }
    }
    
    /**
     * عرض نافذة تعديل المستخدم
     * @param {string} userId - معرف المستخدم
     */
    function showEditUserModal(userId) {
        // التحقق من وجود نظام المصادقة والنوافذ المنبثقة
        if (typeof window.AuthSystem === 'undefined' || typeof window.showModal !== 'function') {
            return;
        }
        
        // الحصول على بيانات المستخدم
        const user = window.AuthSystem.getUserById(userId);
        if (!user) {
            if (window.showNotification) {
                window.showNotification('لم يتم العثور على المستخدم', 'error');
            }
            return;
        }
        
        // إنشاء محتوى النافذة
        const modalContent = `
            <form id="edit-user-form">
                <div class="grid-cols-2">
                    <div class="form-group">
                        <label class="form-label">اسم المستخدم</label>
                        <input class="form-input" id="user-username" required type="text" value="${user.username}" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">كلمة المرور</label>
                        <input class="form-input" id="user-password" type="password" placeholder="اترك فارغاً للاحتفاظ بنفس كلمة المرور" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">الاسم الكامل</label>
                        <input class="form-input" id="user-fullname" type="text" value="${user.fullName || ''}" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">البريد الإلكتروني</label>
                        <input class="form-input" id="user-email" type="email" value="${user.email || ''}" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">الدور</label>
                        <select class="form-select" id="user-role" required>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>مسؤول النظام</option>
                            <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>مدير</option>
                            <option value="hr" ${user.role === 'hr' ? 'selected' : ''}>موارد بشرية</option>
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>مستخدم</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الحالة</label>
                        <select class="form-select" id="user-status" required>
                            <option value="active" ${user.status === 'active' ? 'selected' : ''}>نشط</option>
                            <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>غير نشط</option>
                        </select>
                    </div>
                </div>
            </form>
        `;
        
        // عرض النافذة المنبثقة
        window.showModal({
            title: `تعديل المستخدم: ${user.username}`,
            content: modalContent,
            onConfirm: () => updateUser(userId),
            confirmText: 'حفظ',
            cancelText: 'إلغاء'
        });
    }
    
    /**
     * تحديث بيانات المستخدم
     * @param {string} userId - معرف المستخدم
     */
    function updateUser(userId) {
        // التحقق من وجود نظام المصادقة
        if (typeof window.AuthSystem === 'undefined') return false;
        
        // جمع بيانات المستخدم المحدثة
        const username = document.getElementById('user-username').value.trim();
        const password = document.getElementById('user-password').value.trim();
        const fullName = document.getElementById('user-fullname').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const role = document.getElementById('user-role').value;
        const status = document.getElementById('user-status').value;
        
        // التحقق من البيانات المطلوبة
        if (!username || !role) {
            if (window.showNotification) {
                window.showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
            }
            return false;
        }
        
        // إنشاء بيانات المستخدم المحدثة
        const userData = {
            username,
            fullName,
            email,
            role,
            status
        };
        
        // إضافة كلمة المرور إذا تم تغييرها
        if (password) {
            userData.password = password;
        }
        
        try {
            // تحديث بيانات المستخدم
            window.AuthSystem.updateUser(userId, userData);
            
            // إعادة تحميل بيانات المستخدمين
            loadUsersData();
            
            // عرض إشعار النجاح
            if (window.showNotification) {
                window.showNotification(`تم تحديث بيانات المستخدم ${username} بنجاح`, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في تحديث المستخدم:', error);
            
            if (window.showNotification) {
                window.showNotification(`حدث خطأ أثناء تحديث بيانات المستخدم: ${error.message}`, 'error');
            }
            
            return false;
        }
    }
    
    /**
     * حذف مستخدم
     * @param {string} userId - معرف المستخدم
     */
    function deleteUser(userId) {
        // التحقق من وجود نظام المصادقة والنوافذ المنبثقة
        if (typeof window.AuthSystem === 'undefined' || typeof window.showModal !== 'function') {
            return;
        }
        
        // الحصول على بيانات المستخدم
        const user = window.AuthSystem.getUserById(userId);
        if (!user) {
            if (window.showNotification) {
                window.showNotification('لم يتم العثور على المستخدم', 'error');
            }
            return;
        }
        
        // عرض نافذة تأكيد الحذف
        window.showModal({
            title: 'تأكيد الحذف',
            content: `هل أنت متأكد من رغبتك بحذف المستخدم "${user.username}"؟`,
            onConfirm: () => confirmDeleteUser(userId, user.username),
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            type: 'warning'
        });
    }
    
    /**
     * تأكيد حذف المستخدم
     * @param {string} userId - معرف المستخدم
     * @param {string} username - اسم المستخدم
     */
    function confirmDeleteUser(userId, username) {
        try {
            // حذف المستخدم
            window.AuthSystem.deleteUser(userId);
            
            // إعادة تحميل بيانات المستخدمين
            loadUsersData();
            
            // عرض إشعار النجاح
            if (window.showNotification) {
                window.showNotification(`تم حذف المستخدم ${username} بنجاح`, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في حذف المستخدم:', error);
            
            if (window.showNotification) {
                window.showNotification(`حدث خطأ أثناء حذف المستخدم: ${error.message}`, 'error');
            }
            
            return false;
        }
    }
    
    /**
     * ربط نظام الصلاحيات بوظائف الموظفين
     */
    function setupPermissionsIntegration() {
        // تعريف وظيفة التحقق من الصلاحيات
        window.hasEmployeePermission = function(permission) {
            // التحقق من وجود نظام الصلاحيات
            if (typeof window.PermissionsSystem === 'undefined') return false;
            
            // التحقق من وجود نظام المصادقة
            if (typeof window.AuthSystem === 'undefined') return false;
            
            // الحصول على المستخدم الحالي
            const currentUser = window.AuthSystem.getCurrentUser();
            if (!currentUser) return false;
            
            // التحقق من صلاحية المستخدم
            return window.PermissionsSystem.checkPermission(currentUser.role, permission);
        };
        
        // ربط وظائف التحقق من الصلاحيات بوظائف الموظفين
        if (window.EmployeesModule) {
            // التحقق من صلاحية عرض الموظفين
            const originalLoadEmployees = window.EmployeesModule.loadEmployees;
            window.EmployeesModule.loadEmployees = function() {
                if (!window.hasEmployeePermission('employees-view')) {
                    if (window.showNotification) {
                        window.showNotification('ليس لديك صلاحية لعرض الموظفين', 'error');
                    }
                    return false;
                }
                
                return originalLoadEmployees.apply(this, arguments);
            };
            
            // التحقق من صلاحية إضافة موظف
            const originalAddEmployee = window.EmployeesModule.addEmployee;
            window.EmployeesModule.addEmployee = function() {
                if (!window.hasEmployeePermission('employees-add')) {
                    if (window.showNotification) {
                        window.showNotification('ليس لديك صلاحية لإضافة موظفين', 'error');
                    }
                    return false;
                }
                
                return originalAddEmployee.apply(this, arguments);
            };
            
            // التحقق من صلاحية تعديل موظف
            const originalUpdateEmployee = window.EmployeesModule.updateEmployee;
            window.EmployeesModule.updateEmployee = function() {
                if (!window.hasEmployeePermission('employees-edit')) {
                    if (window.showNotification) {
                        window.showNotification('ليس لديك صلاحية لتعديل بيانات الموظفين', 'error');
                    }
                    return false;
                }
                
                return originalUpdateEmployee.apply(this, arguments);
            };
            
            // التحقق من صلاحية حذف موظف
            const originalDeleteEmployee = window.EmployeesModule.deleteEmployee;
            window.EmployeesModule.deleteEmployee = function() {
                if (!window.hasEmployeePermission('employees-delete')) {
                    if (window.showNotification) {
                        window.showNotification('ليس لديك صلاحية لحذف الموظفين', 'error');
                    }
                    return false;
                }
                
                return originalDeleteEmployee.apply(this, arguments);
            };
            
            // التحقق من صلاحية إدارة الرواتب
            const originalManageSalary = window.EmployeesModule.manageSalary;
            if (originalManageSalary) {
                window.EmployeesModule.manageSalary = function() {
                    if (!window.hasEmployeePermission('employees-salary')) {
                        if (window.showNotification) {
                            window.showNotification('ليس لديك صلاحية لإدارة رواتب الموظفين', 'error');
                        }
                        return false;
                    }
                    
                    return originalManageSalary.apply(this, arguments);
                };
            }
            
            // التحقق من صلاحية عرض تقارير الموظفين
            const originalViewReports = window.EmployeesModule.viewReports;
            if (originalViewReports) {
                window.EmployeesModule.viewReports = function() {
                    if (!window.hasEmployeePermission('employees-reports')) {
                        if (window.showNotification) {
                            window.showNotification('ليس لديك صلاحية لعرض تقارير الموظفين', 'error');
                        }
                        return false;
                    }
                    
                    return originalViewReports.apply(this, arguments);
                };
            }
        }
        
        // إخفاء أو إظهار أزرار واجهة المستخدم بناءً على الصلاحيات
        updateUIBasedOnPermissions();
    }
    
    /**
     * تحديث واجهة المستخدم بناءً على الصلاحيات
     */
    function updateUIBasedOnPermissions() {
        // تنفيذ عند تحميل صفحة الموظفين
        document.addEventListener('employeesPageLoaded', function() {
            // التحقق من صلاحية إضافة موظف
            const addEmployeeBtn = document.getElementById('add-employee-btn');
            if (addEmployeeBtn) {
                addEmployeeBtn.style.display = window.hasEmployeePermission('employees-add') ? 'flex' : 'none';
            }
            
            // التحقق من صلاحية تعديل وحذف الموظفين
            const employeeActionBtns = document.querySelectorAll('.employee-action-btn');
            employeeActionBtns.forEach(btn => {
                if (btn.classList.contains('edit')) {
                    btn.style.display = window.hasEmployeePermission('employees-edit') ? 'flex' : 'none';
                } else if (btn.classList.contains('delete')) {
                    btn.style.display = window.hasEmployeePermission('employees-delete') ? 'flex' : 'none';
                }
            });
            
            // التحقق من صلاحية إدارة الرواتب
            const salaryManagementBtns = document.querySelectorAll('.salary-btn');
            salaryManagementBtns.forEach(btn => {
                btn.style.display = window.hasEmployeePermission('employees-salary') ? 'flex' : 'none';
            });
            
            // التحقق من صلاحية عرض التقارير
            const reportsBtn = document.getElementById('reports-btn');
            if (reportsBtn) {
                reportsBtn.style.display = window.hasEmployeePermission('employees-reports') ? 'flex' : 'none';
            }
        });
    }
})();