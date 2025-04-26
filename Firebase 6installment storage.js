/**
 * نظام إدارة الموظفين والرواتب
 * يتضمن هذا الملف الوظائف الأساسية لإدارة الموظفين وإدارة الرواتب
 */

// تهيئة متغيرات النظام
let employees = [];
let salaries = [];

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام إدارة الموظفين...');
    
    // إضافة عنصر القائمة الجانبية للموظفين
    addSidebarMenuItem();
    
    // تحميل البيانات المخزنة
    loadEmployeesData();
    
    // تهيئة مستمعي الأحداث
    initEmployeesEventListeners();
    
    // تهيئة قائمة السنوات في نماذج الرواتب
    initYearSelects();
});

/**
 * إضافة عنصر قائمة الموظفين في الشريط الجانبي
 */
function addSidebarMenuItem() {
    const navList = document.querySelector('.sidebar .nav-list');
    if (!navList) return;
    
    // التحقق من وجود عنصر الموظفين مسبقاً
    if (document.querySelector('.nav-link[data-page="employees"]')) return;
    
    // إنشاء عنصر جديد
    const navItem = document.createElement('li');
    navItem.className = 'nav-item';
    navItem.innerHTML = `
        <a class="nav-link" data-page="employees" href="#">
            <div class="nav-icon">
                <i class="fas fa-user-tie"></i>
            </div>
            <span>الموظفين</span>
        </a>
    `;
    
    // إدراج العنصر قبل عنصر الإعدادات
    const settingsItem = document.querySelector('.nav-link[data-page="settings"]').parentNode;
    navList.insertBefore(navItem, settingsItem);
    
    // إضافة مستمع الحدث للتنقل
    navItem.querySelector('.nav-link').addEventListener('click', function(e) {
        e.preventDefault();
        
        // إزالة الكلاس النشط من جميع الروابط
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        
        // إضافة الكلاس النشط للرابط المحدد
        this.classList.add('active');
        
        // إظهار صفحة الموظفين
        showPage('employees');
    });
}

/**
 * تهيئة مستمعي الأحداث لوظائف الموظفين
 */
function initEmployeesEventListeners() {
    // زر إضافة موظف جديد
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', () => openModal('add-employee-modal'));
    }
    
    // زر حفظ الموظف الجديد
    const saveEmployeeBtn = document.getElementById('save-employee-btn');
    if (saveEmployeeBtn) {
        saveEmployeeBtn.addEventListener('click', addNewEmployee);
    }
    
    // تحديث احتساب العمولة عند تغيير قيمة المبيعات
    const salesAmountInput = document.getElementById('salary-sales-amount');
    if (salesAmountInput) {
        salesAmountInput.addEventListener('input', calculateCommission);
    }
    
    // تحديث احتساب صافي الراتب عند تغيير البدلات أو الاستقطاعات
    const allowanceInput = document.getElementById('salary-allowance');
    const deductionInput = document.getElementById('salary-deduction');
    
    if (allowanceInput) {
        allowanceInput.addEventListener('input', calculateNetSalary);
    }
    
    if (deductionInput) {
        deductionInput.addEventListener('input', calculateNetSalary);
    }
    
    // زر إنشاء كشف الرواتب
    const generatePayrollBtn = document.getElementById('generate-payroll-btn');
    if (generatePayrollBtn) {
        generatePayrollBtn.addEventListener('click', generatePayroll);
    }
    
    // زر حفظ بيانات الراتب
    const saveSalaryBtn = document.getElementById('save-salary-btn');
    if (saveSalaryBtn) {
        saveSalaryBtn.addEventListener('click', saveEmployeeSalary);
    }
    
    // زر تصدير بيانات الموظفين
    const exportEmployeesBtn = document.querySelector('#employees-page .btn[title="تصدير"]');
    if (exportEmployeesBtn) {
        exportEmployeesBtn.addEventListener('click', () => exportData('employees'));
    }
    
    // زر تصدير كشف الرواتب
    const exportPayrollBtn = document.getElementById('export-payroll-btn');
    if (exportPayrollBtn) {
        exportPayrollBtn.addEventListener('click', exportPayroll);
    }
    
    // أزرار تصفية الموظفين
    const filterBtns = document.querySelectorAll('#employees-page .btn-group .btn[data-filter]');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // تحديث حالة الأزرار
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // تصفية القائمة
            const filter = this.getAttribute('data-filter');
            filterEmployees(filter);
        });
    });
    
    // مربع البحث
    const searchInput = document.querySelector('#employees-page .search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchEmployees(this.value);
        });
    }
}

/**
 * تهيئة قوائم السنوات
 */
function initYearSelects() {
    // الحصول على السنة الحالية
    const currentYear = new Date().getFullYear();
    
    // إنشاء قائمة بالسنوات (السنة الحالية و5 سنوات سابقة)
    const years = [];
    for (let i = 0; i < 6; i++) {
        years.push(currentYear - i);
    }
    
    // ملء قائمة السنوات في تقرير الرواتب
    const salaryYearSelect = document.getElementById('salary-year');
    if (salaryYearSelect) {
        salaryYearSelect.innerHTML = '';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            salaryYearSelect.appendChild(option);
        });
    }
    
    // ملء قائمة السنوات في نموذج إضافة راتب
    const addSalaryYearSelect = document.getElementById('add-salary-year');
    if (addSalaryYearSelect) {
        addSalaryYearSelect.innerHTML = '';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            addSalaryYearSelect.appendChild(option);
        });
    }
    
    // تعيين الشهر والسنة الحالية كقيم افتراضية
    const currentMonth = new Date().getMonth() + 1; // الشهور تبدأ من 0
    
    const salaryMonthSelect = document.getElementById('salary-month');
    if (salaryMonthSelect) {
        salaryMonthSelect.value = currentMonth;
    }
    
    const addSalaryMonthSelect = document.getElementById('add-salary-month');
    if (addSalaryMonthSelect) {
        addSalaryMonthSelect.value = currentMonth;
    }
}

/**
 * تحميل بيانات الموظفين والرواتب من التخزين المحلي
 */
function loadEmployeesData() {
    try {
        // تحميل بيانات الموظفين
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
            employees = JSON.parse(savedEmployees);
            console.log(`تم تحميل ${employees.length} موظف`);
        }
        
        // تحميل بيانات الرواتب
        const savedSalaries = localStorage.getItem('salaries');
        if (savedSalaries) {
            salaries = JSON.parse(savedSalaries);
            console.log(`تم تحميل ${salaries.length} سجل راتب`);
        }
        
        // عرض بيانات الموظفين
        renderEmployeesTable();
    } catch (error) {
        console.error('خطأ في تحميل بيانات الموظفين:', error);
        showNotification('حدث خطأ أثناء تحميل بيانات الموظفين', 'error');
    }
}

/**
 * حفظ بيانات الموظفين والرواتب في التخزين المحلي
 */
function saveEmployeesData() {
    try {
        localStorage.setItem('employees', JSON.stringify(employees));
        localStorage.setItem('salaries', JSON.stringify(salaries));
        return true;
    } catch (error) {
        console.error('خطأ في حفظ بيانات الموظفين:', error);
        showNotification('حدث خطأ أثناء حفظ البيانات', 'error');
        return false;
    }
}

/**
 * عرض جدول الموظفين
 */
function renderEmployeesTable() {
    const tableBody = document.querySelector('#employees-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // ترتيب الموظفين حسب تاريخ التعيين (الأحدث أولاً)
    const sortedEmployees = [...employees].sort((a, b) => {
        return new Date(b.hireDate) - new Date(a.hireDate);
    });
    
    sortedEmployees.forEach(employee => {
        const row = document.createElement('tr');
        
        // تنسيق التاريخ للعرض
        const hireDate = new Date(employee.hireDate).toLocaleDateString();
        
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>
                <div class="employee-info">
                    <div class="employee-avatar">${employee.name.charAt(0)}</div>
                    <div>
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-email">${employee.email || employee.phone}</div>
                    </div>
                </div>
            </td>
            <td>${employee.position}</td>
            <td>${employee.phone}</td>
            <td>${hireDate}</td>
            <td>${formatCurrency(employee.salary)}</td>
            <td><span class="badge badge-${employee.status === 'active' ? 'success' : 'danger'}">${employee.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
            <td>
                <div class="employee-actions">
                    <button class="employee-action-btn view-employee" data-id="${employee.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="employee-action-btn edit edit-employee" data-id="${employee.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="employee-action-btn delete delete-employee" data-id="${employee.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-employee');
        const editButton = row.querySelector('.edit-employee');
        const deleteButton = row.querySelector('.delete-employee');
        
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                showEmployeeDetails(employee.id);
            });
        }
        
        if (editButton) {
            editButton.addEventListener('click', () => {
                editEmployee(employee.id);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                deleteEmployee(employee.id);
            });
        }
    });
    
    if (sortedEmployees.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="8" class="text-center">لا يوجد موظفين</td>';
        tableBody.appendChild(emptyRow);
    }
}

/**
 * إضافة موظف جديد
 */
function addNewEmployee() {
    console.log('إضافة موظف جديد...');
    
    // الحصول على قيم النموذج
    const name = document.getElementById('employee-name').value;
    const phone = document.getElementById('employee-phone').value;
    const address = document.getElementById('employee-address').value;
    const email = document.getElementById('employee-email').value;
    const idNumber = document.getElementById('employee-id-number').value;
    const hireDate = document.getElementById('employee-hire-date').value;
    const position = document.getElementById('employee-position').value;
    const department = document.getElementById('employee-department').value;
    const salary = parseFloat(document.getElementById('employee-salary').value);
    const commissionRate = parseFloat(document.getElementById('employee-commission-rate').value) || 0;
    const allowance = parseFloat(document.getElementById('employee-allowance').value) || 0;
    const status = document.getElementById('employee-status').value;
    
    // التحقق من إدخال البيانات الإلزامية
    if (!name || !phone || !idNumber || !hireDate || !position || !department || isNaN(salary)) {
        showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
        return;
    }
    
    // إنشاء موظف جديد
    const newEmployee = {
        id: Date.now().toString(),
        name,
        phone,
        address,
        email,
        idNumber,
        hireDate,
        position,
        department,
        salary,
        commissionRate,
        allowance,
        status,
        createdAt: new Date().toISOString()
    };
    
    // إضافة الموظف إلى المصفوفة
    employees.push(newEmployee);
    
    // حفظ البيانات
    saveEmployeesData();
    
    // تحديث العرض
    renderEmployeesTable();
    
    // إغلاق النافذة المنبثقة
    closeModal('add-employee-modal');
    
    // عرض إشعار
    showNotification(`تمت إضافة الموظف ${name} بنجاح!`, 'success');
}

/**
 * عرض تفاصيل الموظف
 * @param {string} employeeId - معرف الموظف
 */
function showEmployeeDetails(employeeId) {
    console.log(`عرض تفاصيل الموظف: ${employeeId}`);
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // الحصول على تاريخ التوظيف كتاريخ
    const hireDate = new Date(employee.hireDate);
    const today = new Date();
    const employmentDuration = Math.floor((today - hireDate) / (1000 * 60 * 60 * 24 * 30)); // بالأشهر
    
    // الحصول على رواتب الموظف
    const employeeSalaries = salaries.filter(salary => salary.employeeId === employeeId);
    
    // حساب الإحصائيات
    const totalSalaries = employeeSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);
    const averageSalary = employeeSalaries.length > 0 ? totalSalaries / employeeSalaries.length : 0;
    const lastSalary = employeeSalaries.length > 0 ? 
        employeeSalaries.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
    
    // إنشاء محتوى التفاصيل
    const content = `
        <div class="employee-profile">
            <div class="employee-avatar large">${employee.name.charAt(0)}</div>
            <h2 class="employee-fullname">${employee.name}</h2>
            <span class="badge badge-${employee.status === 'active' ? 'success' : 'danger'}">
                ${employee.status === 'active' ? 'نشط' : 'غير نشط'}
            </span>
            <div class="employee-position">${employee.position} - ${employee.department}</div>
        </div>
        
        <div class="employee-stats">
            <div class="stat-item">
                <div class="stat-value">${employmentDuration}</div>
                <div class="stat-label">أشهر الخدمة</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${formatCurrency(employee.salary)}</div>
                <div class="stat-label">الراتب الأساسي</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${employee.commissionRate}%</div>
                <div class="stat-label">نسبة العمولة</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${formatCurrency(employee.allowance)}</div>
                <div class="stat-label">البدلات</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">معلومات الاتصال</h3>
            <div class="detail-item">
                <div class="detail-label">رقم الهاتف</div>
                <div class="detail-value">${employee.phone}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">البريد الإلكتروني</div>
                <div class="detail-value">${employee.email || 'غير محدد'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">العنوان</div>
                <div class="detail-value">${employee.address || 'غير محدد'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">رقم الهوية</div>
                <div class="detail-value">${employee.idNumber}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">تاريخ التعيين</div>
                <div class="detail-value">${new Date(employee.hireDate).toLocaleDateString()}</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">إحصائيات الرواتب</h3>
            <div class="detail-item">
                <div class="detail-label">عدد الرواتب المدفوعة</div>
                <div class="detail-value">${employeeSalaries.length}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">إجمالي الرواتب المدفوعة</div>
                <div class="detail-value">${formatCurrency(totalSalaries)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">متوسط الراتب</div>
                <div class="detail-value">${formatCurrency(averageSalary)}</div>
            </div>
            ${lastSalary ? `
            <div class="detail-item">
                <div class="detail-label">آخر راتب</div>
                <div class="detail-value">${formatCurrency(lastSalary.netSalary)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">تاريخ آخر راتب</div>
                <div class="detail-value">${new Date(lastSalary.date).toLocaleDateString()}</div>
            </div>
            ` : ''}
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">آخر الرواتب</h3>
            <div class="mini-table-container">
                <table class="mini-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>الشهر/السنة</th>
                            <th>صافي الراتب</th>
                            <th>العمولة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employeeSalaries.length > 0 ? 
                            employeeSalaries.slice(0, 5).map(salary => `
                                <tr>
                                    <td>${new Date(salary.date).toLocaleDateString()}</td>
                                    <td>${getMonthName(salary.month)}/${salary.year}</td>
                                    <td>${formatCurrency(salary.netSalary)}</td>
                                    <td>${formatCurrency(salary.commission)}</td>
                                </tr>
                            `).join('') : 
                            '<tr><td colspan="4">لا توجد رواتب مسجلة</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // عرض النافذة المنبثقة
    const detailsContent = document.getElementById('employee-details-content');
    if (detailsContent) {
        detailsContent.innerHTML = content;
    }
    
    // فتح النافذة المنبثقة
    openModal('employee-details-modal');
    
    // تعيين وظائف الأزرار
    const editEmployeeBtn = document.getElementById('edit-employee-btn');
    const paySalaryBtn = document.getElementById('pay-salary-btn');
    const deleteEmployeeBtn = document.getElementById('delete-employee-btn');
    
    if (editEmployeeBtn) {
        editEmployeeBtn.onclick = () => {
            closeModal('employee-details-modal');
            editEmployee(employeeId);
        };
    }
    
    if (paySalaryBtn) {
        paySalaryBtn.onclick = () => {
            closeModal('employee-details-modal');
            openSalaryModal(employeeId);
        };
    }
    
    if (deleteEmployeeBtn) {
        deleteEmployeeBtn.onclick = () => {
            closeModal('employee-details-modal');
            deleteEmployee(employeeId);
        };
    }
}

/**
 * تعديل بيانات موظف
 * @param {string} employeeId - معرف الموظف
 */
function editEmployee(employeeId) {
    console.log(`تعديل بيانات الموظف: ${employeeId}`);
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // ملء النموذج ببيانات الموظف
    document.getElementById('employee-name').value = employee.name;
    document.getElementById('employee-phone').value = employee.phone;
    document.getElementById('employee-address').value = employee.address || '';
    document.getElementById('employee-email').value = employee.email || '';
    document.getElementById('employee-id-number').value = employee.idNumber;
    document.getElementById('employee-hire-date').value = employee.hireDate;
    document.getElementById('employee-position').value = employee.position;
    document.getElementById('employee-department').value = employee.department;
    document.getElementById('employee-salary').value = employee.salary;
    document.getElementById('employee-commission-rate').value = employee.commissionRate || 0;
    document.getElementById('employee-allowance').value = employee.allowance || 0;
    document.getElementById('employee-status').value = employee.status;
    
    // تغيير عنوان النافذة
    const modalTitle = document.querySelector('#add-employee-modal .modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'تعديل بيانات الموظف';
    }
    
    // تغيير نص زر الحفظ
    const saveBtn = document.getElementById('save-employee-btn');
    if (saveBtn) {
        saveBtn.textContent = 'حفظ التعديلات';
        
        // تغيير وظيفة زر الحفظ
        const originalClickHandler = saveBtn.onclick;
        saveBtn.onclick = function() {
            // جمع البيانات المحدثة
            const updatedEmployee = {
                ...employee,
                name: document.getElementById('employee-name').value,
                phone: document.getElementById('employee-phone').value,
                address: document.getElementById('employee-address').value,
                email: document.getElementById('employee-email').value,
                idNumber: document.getElementById('employee-id-number').value,
                hireDate: document.getElementById('employee-hire-date').value,
                position: document.getElementById('employee-position').value,
                department: document.getElementById('employee-department').value,
                salary: parseFloat(document.getElementById('employee-salary').value),
                commissionRate: parseFloat(document.getElementById('employee-commission-rate').value) || 0,
                allowance: parseFloat(document.getElementById('employee-allowance').value) || 0,
                status: document.getElementById('employee-status').value
            };
            
            // تحديث بيانات الموظف
            const index = employees.findIndex(emp => emp.id === employeeId);
            if (index !== -1) {
                employees[index] = updatedEmployee;
                
                // حفظ البيانات
                saveEmployeesData();
                
                // تحديث العرض
                renderEmployeesTable();
                
                // إغلاق النافذة المنبثقة
                closeModal('add-employee-modal');
                
                // عرض إشعار
                showNotification(`تم تحديث بيانات الموظف ${updatedEmployee.name} بنجاح!`, 'success');
            }
            
            // استعادة الإعدادات الافتراضية للنافذة
            if (modalTitle) {
                modalTitle.textContent = 'إضافة موظف جديد';
            }
            
            saveBtn.textContent = 'إضافة';
            saveBtn.onclick = originalClickHandler;
        };
    }
    
    // فتح النافذة المنبثقة
    openModal('add-employee-modal');
}

/**
 * حذف موظف
 * @param {string} employeeId - معرف الموظف
 */
function deleteEmployee(employeeId) {
    console.log(`حذف الموظف: ${employeeId}`);
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // طلب تأكيد الحذف
    if (!confirm(`هل أنت متأكد من رغبتك في حذف الموظف ${employee.name}؟\nسيتم حذف جميع البيانات المتعلقة به.`)) {
        return;
    }
    
    // حذف الموظف
    employees = employees.filter(emp => emp.id !== employeeId);
    
    // حذف رواتب الموظف
    salaries = salaries.filter(salary => salary.employeeId !== employeeId);
    
    // حفظ البيانات
    saveEmployeesData();
    
    // تحديث العرض
    renderEmployeesTable();
    
    // عرض إشعار
    showNotification(`تم حذف الموظف ${employee.name} بنجاح`, 'success');
}

/**
 * فتح نافذة إضافة راتب
 * @param {string} employeeId - معرف الموظف
 */
function openSalaryModal(employeeId) {
    console.log(`فتح نافذة إضافة راتب للموظف: ${employeeId}`);
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // تعيين قيم النموذج
    document.getElementById('salary-employee-id').value = employee.id;
    document.getElementById('salary-employee-name').value = employee.name;
    document.getElementById('salary-base').value = employee.salary;
    document.getElementById('salary-commission-rate').value = employee.commissionRate || 0;
    document.getElementById('salary-allowance').value = employee.allowance || 0;
    document.getElementById('salary-sales-amount').value = 0;
    document.getElementById('salary-deduction').value = 0;
    
    // حساب العمولة وصافي الراتب
    calculateCommission();
    
    // فتح النافذة المنبثقة
    openModal('add-salary-modal');
}

/**
 * حساب العمولة بناءً على المبيعات ونسبة العمولة
 */
function calculateCommission() {
    const salesAmount = parseFloat(document.getElementById('salary-sales-amount').value) || 0;
    const commissionRate = parseFloat(document.getElementById('salary-commission-rate').value) || 0;
    
    // حساب مبلغ العمولة
    const commissionAmount = salesAmount * (commissionRate / 100);
    
    // تعيين مبلغ العمولة
    const commissionAmountInput = document.getElementById('salary-commission-amount');
    if (commissionAmountInput) {
        commissionAmountInput.value = commissionAmount;
    }
    
    // حساب صافي الراتب
    calculateNetSalary();
}

/**
 * حساب صافي الراتب
 */
function calculateNetSalary() {
    const baseSalary = parseFloat(document.getElementById('salary-base').value) || 0;
    const commissionAmount = parseFloat(document.getElementById('salary-commission-amount').value) || 0;
    const allowance = parseFloat(document.getElementById('salary-allowance').value) || 0;
    const deduction = parseFloat(document.getElementById('salary-deduction').value) || 0;
    
    // حساب صافي الراتب
    const netSalary = baseSalary + commissionAmount + allowance - deduction;
    
    // تعيين صافي الراتب
    const netSalaryInput = document.getElementById('salary-net');
    if (netSalaryInput) {
        netSalaryInput.value = netSalary;
    }
}

/**
 * حفظ راتب موظف
 */
function saveEmployeeSalary() {
    console.log('حفظ راتب موظف...');
    
    // الحصول على بيانات النموذج
    const employeeId = document.getElementById('salary-employee-id').value;
    const month = parseInt(document.getElementById('add-salary-month').value);
    const year = parseInt(document.getElementById('add-salary-year').value);
    const baseSalary = parseFloat(document.getElementById('salary-base').value) || 0;
    const commissionRate = parseFloat(document.getElementById('salary-commission-rate').value) || 0;
    const salesAmount = parseFloat(document.getElementById('salary-sales-amount').value) || 0;
    const commission = parseFloat(document.getElementById('salary-commission-amount').value) || 0;
    const allowance = parseFloat(document.getElementById('salary-allowance').value) || 0;
    const deduction = parseFloat(document.getElementById('salary-deduction').value) || 0;
    const netSalary = parseFloat(document.getElementById('salary-net').value) || 0;
    const notes = document.getElementById('salary-notes').value || '';
    
    // التحقق من وجود الموظف
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // التحقق من عدم تكرار الراتب لنفس الشهر والسنة
    const isDuplicate = salaries.some(salary => 
        salary.employeeId === employeeId && 
        salary.month === month && 
        salary.year === year
    );
    
    if (isDuplicate) {
        if (!confirm(`يوجد راتب مسجل لهذا الموظف في ${getMonthName(month)} ${year}. هل تريد الاستمرار وتحديث الراتب؟`)) {
            return;
        }
        
        // حذف الراتب القديم
        salaries = salaries.filter(salary => 
            !(salary.employeeId === employeeId && salary.month === month && salary.year === year)
        );
    }
    
    // إنشاء سجل راتب جديد
    const newSalary = {
        id: Date.now().toString(),
        employeeId,
        employeeName: employee.name,
        month,
        year,
        baseSalary,
        commissionRate,
        salesAmount,
        commission,
        allowance,
        deduction,
        netSalary,
        notes,
        date: new Date().toISOString()
    };
    
    // إضافة الراتب إلى المصفوفة
    salaries.push(newSalary);
    
    // حفظ البيانات
    saveEmployeesData();
    
    // إغلاق النافذة المنبثقة
    closeModal('add-salary-modal');
    
    // عرض إشعار
    showNotification(`تم دفع راتب ${getMonthName(month)} ${year} للموظف ${employee.name} بنجاح!`, 'success');
    
    // تحديث كشف الرواتب إذا كان مفتوحاً
    const currentMonth = parseInt(document.getElementById('salary-month').value);
    const currentYear = parseInt(document.getElementById('salary-year').value);
    
    if (month === currentMonth && year === currentYear) {
        generatePayroll();
    }
}

/**
 * تصفية قائمة الموظفين
 * @param {string} filter - نوع التصفية (all, active, inactive)
 */
function filterEmployees(filter) {
    const tableBody = document.querySelector('#employees-table tbody');
    if (!tableBody) return;
    
    // تفريغ الجدول
    tableBody.innerHTML = '';
    
    // تطبيق التصفية
    let filteredEmployees = [...employees];
    
    if (filter === 'active') {
        filteredEmployees = filteredEmployees.filter(emp => emp.status === 'active');
    } else if (filter === 'inactive') {
        filteredEmployees = filteredEmployees.filter(emp => emp.status === 'inactive');
    }
    
    // ترتيب الموظفين
    filteredEmployees.sort((a, b) => new Date(b.hireDate) - new Date(a.hireDate));
    
    // عرض النتائج المصفاة
    if (filteredEmployees.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="8" class="text-center">لا يوجد موظفين مطابقين للتصفية</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // عرض الموظفين المصفاة
    filteredEmployees.forEach(employee => {
        const row = document.createElement('tr');
        
      // تنسيق التاريخ للعرض
const hireDate = new Date(employee.hireDate).toLocaleDateString();

row.innerHTML = `
    <td>${employee.id}</td>
    <td>
        <div class="employee-info">
            <div class="employee-avatar">${employee.name.charAt(0)}</div>
            <div>
                <div class="employee-name">${employee.name}</div>
                <div class="employee-email">${employee.email || employee.phone}</div>
            </div>
        </div>
    </td>
    <td>${employee.position}</td>
    <td>${employee.phone}</td>
    <td>${hireDate}</td>
    <td>${formatCurrency(employee.salary)}</td>
    <td><span class="badge badge-${employee.status === 'active' ? 'success' : 'danger'}">${employee.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
    <td>
        <div class="employee-actions">
            <button class="employee-action-btn view-employee" data-id="${employee.id}">
                <i class="fas fa-eye"></i>
            </button>
            <button class="employee-action-btn edit edit-employee" data-id="${employee.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="employee-action-btn delete delete-employee" data-id="${employee.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </td>
`;

tableBody.appendChild(row);

// إضافة مستمعي الأحداث للأزرار
const viewButton = row.querySelector('.view-employee');
const editButton = row.querySelector('.edit-employee');
const deleteButton = row.querySelector('.delete-employee');

if (viewButton) {
    viewButton.addEventListener('click', () => {
        showEmployeeDetails(employee.id);
    });
}

if (editButton) {
    editButton.addEventListener('click', () => {
        editEmployee(employee.id);
    });
}

if (deleteButton) {
    deleteButton.addEventListener('click', () => {
        deleteEmployee(employee.id);
    });
}
    });
}

/**
 * البحث في الموظفين
 * @param {string} query - نص البحث
 */
function searchEmployees(query) {
    console.log(`البحث عن الموظفين: ${query}`);
    
    query = query.trim().toLowerCase();
    
    if (!query) {
        // إذا كان البحث فارغًا، نعيد عرض جميع الموظفين
        renderEmployeesTable();
        return;
    }
    
    // تصفية الموظفين حسب البحث
    const filtered = employees.filter(employee => {
        return employee.name.toLowerCase().includes(query) ||
               employee.phone.toLowerCase().includes(query) ||
               (employee.email && employee.email.toLowerCase().includes(query)) ||
               employee.position.toLowerCase().includes(query) ||
               employee.department.toLowerCase().includes(query) ||
               employee.id.toLowerCase().includes(query);
    });
    
    // عرض النتائج المصفاة
    const tableBody = document.querySelector('#employees-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filtered.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="8" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // عرض الموظفين المصفاة
    filtered.forEach(employee => {
        const row = document.createElement('tr');
        
        // تنسيق التاريخ للعرض
        const hireDate = new Date(employee.hireDate).toLocaleDateString();
        
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>
                <div class="employee-info">
                    <div class="employee-avatar">${employee.name.charAt(0)}</div>
                    <div>
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-email">${employee.email || employee.phone}</div>
                    </div>
                </div>
            </td>
            <td>${employee.position}</td>
            <td>${employee.phone}</td>
            <td>${hireDate}</td>
            <td>${formatCurrency(employee.salary)}</td>
            <td><span class="badge badge-${employee.status === 'active' ? 'success' : 'danger'}">${employee.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
            <td>
                <div class="employee-actions">
                    <button class="employee-action-btn view-employee" data-id="${employee.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="employee-action-btn edit edit-employee" data-id="${employee.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="employee-action-btn delete delete-employee" data-id="${employee.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-employee');
        const editButton = row.querySelector('.edit-employee');
        const deleteButton = row.querySelector('.delete-employee');
        
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                showEmployeeDetails(employee.id);
            });
        }
        
        if (editButton) {
            editButton.addEventListener('click', () => {
                editEmployee(employee.id);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                deleteEmployee(employee.id);
            });
        }
    });
}

/**
 * إنشاء كشف الرواتب للشهر والسنة المحددة
 */
function generatePayroll() {
    console.log('إنشاء كشف الرواتب...');
    
    // الحصول على الشهر والسنة المحددة
    const month = parseInt(document.getElementById('salary-month').value);
    const year = parseInt(document.getElementById('salary-year').value);
    
    // الحصول على رواتب الشهر المحدد
    const monthSalaries = salaries.filter(salary => salary.month === month && salary.year === year);
    
    // تحضير الجدول
    const tableBody = document.querySelector('#payroll-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // متغيرات لحساب المجاميع
    let totalBaseSalary = 0;
    let totalSales = 0;
    let totalCommission = 0;
    let totalAllowances = 0;
    let totalDeductions = 0;
    let totalNetSalary = 0;
    
    // إضافة الموظفين الذين لديهم رواتب في الشهر المحدد
    monthSalaries.forEach(salary => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${salary.employeeId}</td>
            <td>${salary.employeeName}</td>
            <td>${employees.find(emp => emp.id === salary.employeeId)?.position || 'غير معروف'}</td>
            <td>${formatCurrency(salary.baseSalary)}</td>
            <td>${salary.commissionRate}%</td>
            <td>${formatCurrency(salary.salesAmount)}</td>
            <td>${formatCurrency(salary.commission)}</td>
            <td>${formatCurrency(salary.allowance)}</td>
            <td>${formatCurrency(salary.deduction)}</td>
            <td>${formatCurrency(salary.netSalary)}</td>
            <td>
                <button class="btn btn-outline btn-sm view-salary" data-id="${salary.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر العرض
        const viewButton = row.querySelector('.view-salary');
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                showSalaryDetails(salary.id);
            });
        }
        
        // حساب المجاميع
        totalBaseSalary += salary.baseSalary;
        totalSales += salary.salesAmount;
        totalCommission += salary.commission;
        totalAllowances += salary.allowance;
        totalDeductions += salary.deduction;
        totalNetSalary += salary.netSalary;
    });
    
    // إضافة الموظفين النشطين الذين ليس لديهم رواتب في الشهر المحدد
    const activeEmployees = employees.filter(emp => emp.status === 'active');
    
    activeEmployees.forEach(employee => {
        // التحقق مما إذا كان الموظف لديه راتب في الشهر المحدد
        const hasSalary = monthSalaries.some(salary => salary.employeeId === employee.id);
        
        if (!hasSalary) {
            const row = document.createElement('tr');
            row.className = 'no-salary';
            
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.position}</td>
                <td>${formatCurrency(employee.salary)}</td>
                <td>${employee.commissionRate || 0}%</td>
                <td>0</td>
                <td>0</td>
                <td>${formatCurrency(employee.allowance || 0)}</td>
                <td>0</td>
                <td>0</td>
                <td>
                    <button class="btn btn-primary btn-sm add-salary" data-id="${employee.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمع الحدث لزر الإضافة
            const addButton = row.querySelector('.add-salary');
            if (addButton) {
                addButton.addEventListener('click', () => {
                    openSalaryModal(employee.id);
                });
            }
        }
    });
    
    // عرض المجاميع
    document.getElementById('total-base-salary').textContent = formatCurrency(totalBaseSalary);
    document.getElementById('total-sales').textContent = formatCurrency(totalSales);
    document.getElementById('total-commission').textContent = formatCurrency(totalCommission);
    document.getElementById('total-allowances').textContent = formatCurrency(totalAllowances);
    document.getElementById('total-deductions').textContent = formatCurrency(totalDeductions);
    document.getElementById('total-net-salary').textContent = formatCurrency(totalNetSalary);
    
    // عرض رسالة إذا لم يكن هناك رواتب
    if (tableBody.children.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="11" class="text-center">لا يوجد رواتب مسجلة لشهر ${getMonthName(month)} ${year}</td>`;
        tableBody.appendChild(emptyRow);
    }
}

/**
 * عرض تفاصيل الراتب
 * @param {string} salaryId - معرف الراتب
 */
function showSalaryDetails(salaryId) {
    console.log(`عرض تفاصيل الراتب: ${salaryId}`);
    
    // البحث عن الراتب
    const salary = salaries.find(s => s.id === salaryId);
    if (!salary) {
        showNotification('لم يتم العثور على الراتب', 'error');
        return;
    }
    
    // البحث عن الموظف
    const employee = employees.find(emp => emp.id === salary.employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        return;
    }
    
    // إنشاء محتوى التفاصيل
    const content = `
        <div class="salary-details">
            <div class="salary-header">
                <h3 class="salary-title">راتب شهر ${getMonthName(salary.month)} ${salary.year}</h3>
                <div class="salary-date">تاريخ الصرف: ${new Date(salary.date).toLocaleDateString()}</div>
            </div>
            
            <div class="employee-info">
                <div class="employee-avatar">${employee.name.charAt(0)}</div>
                <div class="employee-details">
                    <div class="employee-name">${employee.name}</div>
                    <div class="employee-position">${employee.position} - ${employee.department}</div>
                </div>
            </div>
            
            <div class="salary-components">
                <div class="component-group">
                    <h4 class="component-group-title">المستحقات</h4>
                    <div class="salary-component">
                        <div class="component-name">الراتب الأساسي</div>
                        <div class="component-value">${formatCurrency(salary.baseSalary)}</div>
                    </div>
                    <div class="salary-component">
                        <div class="component-name">عمولة المبيعات (${salary.commissionRate}%)</div>
                        <div class="component-value">${formatCurrency(salary.commission)}</div>
                    </div>
                    <div class="salary-component">
                        <div class="component-name">البدلات</div>
                        <div class="component-value">${formatCurrency(salary.allowance)}</div>
                    </div>
                    <div class="salary-component total">
                        <div class="component-name">إجمالي المستحقات</div>
                        <div class="component-value">${formatCurrency(salary.baseSalary + salary.commission + salary.allowance)}</div>
                    </div>
                </div>
                
                <div class="component-group">
                    <h4 class="component-group-title">الاستقطاعات</h4>
                    <div class="salary-component">
                        <div class="component-name">الاستقطاعات</div>
                        <div class="component-value">${formatCurrency(salary.deduction)}</div>
                    </div>
                    <div class="salary-component total">
                        <div class="component-name">إجمالي الاستقطاعات</div>
                        <div class="component-value">${formatCurrency(salary.deduction)}</div>
                    </div>
                </div>
            </div>
            
            <div class="salary-summary">
                <div class="summary-label">صافي الراتب:</div>
                <div class="summary-value">${formatCurrency(salary.netSalary)}</div>
            </div>
            
            ${salary.notes ? `
            <div class="salary-notes">
                <div class="notes-label">ملاحظات:</div>
                <div class="notes-content">${salary.notes}</div>
            </div>
            ` : ''}
        </div>
    `;
    
    // عرض النافذة المنبثقة
    const detailsContent = document.getElementById('salary-details-content');
    if (detailsContent) {
        detailsContent.innerHTML = content;
    }
    
    // فتح النافذة المنبثقة
    openModal('salary-details-modal');
    
    // تعيين وظيفة زر الطباعة
    const printSalaryBtn = document.getElementById('print-salary-btn');
    if (printSalaryBtn) {
        printSalaryBtn.onclick = () => printSalaryDetails(salary, employee);
    }
}

/**
 * طباعة تفاصيل الراتب
 * @param {Object} salary - بيانات الراتب
 * @param {Object} employee - بيانات الموظف
 */
function printSalaryDetails(salary, employee) {
    console.log('طباعة تفاصيل الراتب...');
    
    // إنشاء نافذة الطباعة
    const printWindow = window.open('', '', 'width=800,height=600');
    
    // إنشاء محتوى صفحة الطباعة
    const printContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>راتب ${employee.name} - ${getMonthName(salary.month)} ${salary.year}</title>
            <style>
                @page {
                    size: A4;
                    margin: 1cm;
                }
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: #fff;
                    margin: 0;
                    padding: 20px;
                    direction: rtl;
                }
                .salary-slip {
                    border: 1px solid #ccc;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .title {
                    font-size: 18px;
                    margin-bottom: 5px;
                }
                .subtitle {
                    font-size: 14px;
                    color: #666;
                }
                .employee-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
                .employee-details, .salary-details {
                    flex: 1;
                }
                .info-row {
                    margin-bottom: 5px;
                }
                .label {
                    font-weight: bold;
                    margin-left: 10px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    padding: 10px;
                    text-align: right;
                    border: 1px solid #ddd;
                }
                th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .total-row {
                    font-weight: bold;
                }
                .net-salary {
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                    margin-top: 20px;
                    padding: 10px;
                    border: 2px solid #333;
                }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                }
                .signature {
                    flex: 1;
                    text-align: center;
                }
                .sign-label {
                    margin-bottom: 30px;
                }
                .sign-line {
                    border-top: 1px solid #333;
                    width: 150px;
                    margin: 0 auto;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="salary-slip">
                <div class="header">
                    <div class="logo">نظام الاستثمار المتكامل</div>
                    <div class="title">إيصال راتب</div>
                    <div class="subtitle">شهر ${getMonthName(salary.month)} ${salary.year}</div>
                </div>
                
                <div class="employee-info">
                    <div class="employee-details">
                        <div class="info-row"><span class="label">اسم الموظف:</span> ${employee.name}</div>
                        <div class="info-row"><span class="label">رقم الموظف:</span> ${employee.id}</div>
                        <div class="info-row"><span class="label">المسمى الوظيفي:</span> ${employee.position}</div>
                        <div class="info-row"><span class="label">القسم:</span> ${employee.department}</div>
                    </div>
                    <div class="salary-details">
                        <div class="info-row"><span class="label">تاريخ الصرف:</span> ${new Date(salary.date).toLocaleDateString()}</div>
                        <div class="info-row"><span class="label">تاريخ التعيين:</span> ${new Date(employee.hireDate).toLocaleDateString()}</div>
                        <div class="info-row"><span class="label">رقم الهاتف:</span> ${employee.phone}</div>
                        <div class="info-row"><span class="label">البريد الإلكتروني:</span> ${employee.email || '-'}</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th colspan="2">المستحقات</th>
                            <th colspan="2">الاستقطاعات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>الراتب الأساسي</td>
                            <td>${formatCurrency(salary.baseSalary)}</td>
                            <td>الاستقطاعات</td>
                            <td>${formatCurrency(salary.deduction)}</td>
                        </tr>
                        <tr>
                            <td>عمولة المبيعات (${salary.commissionRate}%)</td>
                            <td>${formatCurrency(salary.commission)}</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>البدلات</td>
                            <td>${formatCurrency(salary.allowance)}</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr class="total-row">
                            <td>إجمالي المستحقات</td>
                            <td>${formatCurrency(salary.baseSalary + salary.commission + salary.allowance)}</td>
                            <td>إجمالي الاستقطاعات</td>
                            <td>${formatCurrency(salary.deduction)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="net-salary">
                    صافي الراتب: ${formatCurrency(salary.netSalary)}
                </div>
                
                ${salary.notes ? `
                <div style="margin-top: 20px;">
                    <strong>ملاحظات:</strong>
                    <p>${salary.notes}</p>
                </div>
                ` : ''}
                
                <div class="signatures">
                    <div class="signature">
                        <div class="sign-label">توقيع المدير</div>
                        <div class="sign-line"></div>
                    </div>
                    <div class="signature">
                        <div class="sign-label">توقيع الموظف</div>
                        <div class="sign-line"></div>
                    </div>
                </div>
                
                <div class="footer">
                    تم إنشاء هذا الإيصال بواسطة نظام إدارة الموظفين - ${new Date().toLocaleDateString()}
                </div>
            </div>
        </body>
        </html>
    `;
    
    // كتابة المحتوى في نافذة الطباعة
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // انتظار تحميل الصفحة ثم طباعتها
    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };
}

/**
 * تصدير بيانات الموظفين
 * @param {string} type - نوع البيانات المراد تصديرها (employees)
 */
function exportData(type) {
    console.log(`تصدير بيانات: ${type}`);
    
    let data = [];
    let filename = '';
    let headers = [];
    
    if (type === 'employees') {
        data = employees;
        filename = 'الموظفين';
        headers = ['المعرف', 'الاسم', 'رقم الهاتف', 'البريد الإلكتروني', 'العنوان', 'رقم الهوية', 'تاريخ التعيين', 'المسمى الوظيفي', 'القسم', 'الراتب الأساسي', 'نسبة العمولة', 'البدلات', 'الحالة'];
    }
    
    if (data.length === 0) {
        showNotification('لا توجد بيانات للتصدير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عناوين الأعمدة
    csvRows.push(headers.join(','));
    
    // إضافة الصفوف
    data.forEach(item => {
        let row = [];
        
        if (type === 'employees') {
            row = [
                item.id,
                item.name,
                item.phone,
                item.email || '',
                item.address || '',
                item.idNumber || '',
                item.hireDate,
                item.position,
                item.department,
                item.salary,
                item.commissionRate || 0,
                item.allowance || 0,
                item.status
            ];
        }
        
        // تنظيف القيم للتصدير CSV
        row = row.map(value => {
            // إذا كانت القيمة تحتوي على فواصل، نضعها بين علامات اقتباس
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
        });
        
        csvRows.push(row.join(','));
    });
    
    // إنشاء ملف CSV
    const csvContent = csvRows.join('\n');
    
    // إنشاء Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // إنشاء رابط التنزيل
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // إضافة الرابط وتنفيذ النقر
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    document.body.removeChild(link);
    
    showNotification(`تم تصدير ${filename} بنجاح`, 'success');
}

/**
 * تصدير كشف الرواتب
 */
function exportPayroll() {
    console.log('تصدير كشف الرواتب...');
    
    // الحصول على الشهر والسنة المحددة
    const month = parseInt(document.getElementById('salary-month').value);
    const year = parseInt(document.getElementById('salary-year').value);
    
    // الحصول على رواتب الشهر المحدد
    const monthSalaries = salaries.filter(salary => salary.month === month && salary.year === year);
    
    if (monthSalaries.length === 0) {
        showNotification('لا توجد رواتب للتصدير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عناوين الأعمدة
    const headers = [
        'المعرف', 'الموظف', 'المسمى الوظيفي', 'القسم', 'الراتب الأساسي', 'نسبة العمولة',
        'قيمة المبيعات', 'مبلغ العمولة', 'البدلات', 'الاستقطاعات', 'صافي الراتب'
    ];
    csvRows.push(headers.join(','));
    
    // إضافة الصفوف
monthSalaries.forEach(salary => {
    const employee = employees.find(emp => emp.id === salary.employeeId);
    
    if (employee) {
        const row = [
            salary.employeeId,
            salary.employeeName,
            employee.position,
            employee.department,
            salary.baseSalary,
            salary.commissionRate,
            salary.salesAmount,
            salary.commission,
            salary.allowance,
            salary.deduction,
            salary.netSalary
        ];
        
        // تنظيف القيم للتصدير CSV
        const cleanedRow = row.map(value => {
            // إذا كانت القيمة تحتوي على فواصل، نضعها بين علامات اقتباس
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
        });
        
        csvRows.push(cleanedRow.join(','));
    }
});

// إضافة صف المجاميع
const totalRow = [
    '99999', // معرف خاص للمجموع
    'المجموع', // اسم المجموع
    '', // المسمى الوظيفي
    '', // القسم
    // حساب المجاميع
    monthSalaries.reduce((sum, salary) => sum + salary.baseSalary, 0),
    '', // نسبة العمولة
    monthSalaries.reduce((sum, salary) => sum + salary.salesAmount, 0),
    monthSalaries.reduce((sum, salary) => sum + salary.commission, 0),
    monthSalaries.reduce((sum, salary) => sum + salary.allowance, 0),
    monthSalaries.reduce((sum, salary) => sum + salary.deduction, 0),
    monthSalaries.reduce((sum, salary) => sum + salary.netSalary, 0)
];

// تنظيف قيم المجموع للتصدير CSV
const cleanedTotalRow = totalRow.map(value => {
    value = String(value).replace(/"/g, '""');
    return value.includes(',') ? `"${value}"` : value;
});

csvRows.push(cleanedTotalRow.join(','));

// إنشاء ملف CSV
const csvContent = csvRows.join('\n');

// إنشاء Blob
const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

// إنشاء رابط التنزيل
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = `كشف_رواتب_${getMonthName(month)}_${year}.csv`;

// إضافة الرابط وتنفيذ النقر
document.body.appendChild(link);
link.click();

// تنظيف
document.body.removeChild(link);

showNotification(`تم تصدير كشف رواتب ${getMonthName(month)} ${year} بنجاح`, 'success');
}

/**
 * الحصول على اسم الشهر بالعربية
 * @param {number} month - رقم الشهر (1-12)
 * @returns {string} - اسم الشهر بالعربية
 */
function getMonthName(month) {
    const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    // تحويل الشهر إلى رقم من 0 إلى 11
    const monthIndex = parseInt(month) - 1;
    
    // التحقق من صحة الرقم
    if (monthIndex >= 0 && monthIndex < 12) {
        return months[monthIndex];
    }
    
    return 'غير معروف';
}

/**
 * تنسيق القيمة كعملة
 * @param {number} value - القيمة المراد تنسيقها
 * @param {boolean} addCurrency - إضافة اسم العملة (دينار)
 * @returns {string} - القيمة المنسقة
 */
function formatCurrency(value, addCurrency = true) {
    // التحقق من صحة القيمة
    if (value === undefined || value === null || isNaN(value)) {
        return addCurrency ? "0 دينار" : "0";
    }
    
    // تقريب القيمة إلى رقمين عشريين إذا كان يحتوي على كسور
    value = parseFloat(value);
    if (value % 1 !== 0) {
        value = value.toFixed(2);
    }
    
    // تحويل القيمة إلى نص وإضافة الفواصل بين كل ثلاثة أرقام
    const parts = value.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // إعادة القيمة مع إضافة العملة إذا تم طلب ذلك
    const formattedValue = parts.join('.');
    
    if (addCurrency) {
        return formattedValue + " دينار";
    } else {
        return formattedValue;
    }
}

// تهيئة نظام إدارة الموظفين مع تعيين الدوال كخصائص للنافذة للوصول العام
window.employees = employees;
window.salaries = salaries;
window.showEmployeeDetails = showEmployeeDetails;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.openSalaryModal = openSalaryModal;
window.calculateCommission = calculateCommission;
window.calculateNetSalary = calculateNetSalary;
window.saveEmployeeSalary = saveEmployeeSalary;
window.generatePayroll = generatePayroll;
window.printSalaryDetails = printSalaryDetails;
window.exportData = exportData;
window.exportPayroll = exportPayroll;
window.getMonthName = getMonthName;

/**
 * إضافة أنماط CSS للموظفين
 */
function addEmployeesStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('employees-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'employees-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* أنماط صفحة الموظفين */
        #employees-page .employee-info {
            display: flex;
            align-items: center;
        }
        
        #employees-page .employee-avatar {
            width: 36px;
            height: 36px;
            background-color: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-left: 10px;
            font-size: 16px;
        }
        
        #employees-page .employee-avatar.large {
            width: 64px;
            height: 64px;
            font-size: 28px;
            margin: 0 auto 16px;
        }
        
        #employees-page .employee-name {
            font-weight: 600;
            margin-bottom: 2px;
        }
        
        #employees-page .employee-email,
        #employees-page .employee-phone {
            font-size: 0.85rem;
            color: #666;
        }
        
        #employees-page .employee-actions {
            display: flex;
            gap: 5px;
        }
        
        #employees-page .employee-action-btn {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            border: 1px solid #ddd;
            background-color: white;
            color: #555;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        #employees-page .employee-action-btn:hover {
            background-color: #f5f5f5;
        }
        
        #employees-page .employee-action-btn.view-employee:hover {
            background-color: #e3f2fd;
            color: #1976d2;
            border-color: #1976d2;
        }
        
        #employees-page .employee-action-btn.edit:hover {
            background-color: #e8f5e9;
            color: #2e7d32;
            border-color: #2e7d32;
        }
        
        #employees-page .employee-action-btn.delete:hover {
            background-color: #ffebee;
            color: #c62828;
            border-color: #c62828;
        }
        
        /* أنماط الملف الشخصي */
        #employees-page .employee-profile {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #eee;
        }
        
        #employees-page .employee-fullname {
            font-size: 1.5rem;
            margin: 8px 0;
        }
        
        #employees-page .employee-position {
            color: #666;
            font-size: 0.9rem;
        }
        
        #employees-page .employee-stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }
        
        #employees-page .stat-item {
            flex: 1;
            text-align: center;
            padding: 12px;
            background-color: #f9f9f9;
            border-radius: 8px;
            min-width: 120px;
            margin: 0 5px 10px;
        }
        
        #employees-page .stat-value {
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 4px;
        }
        
        #employees-page .stat-label {
            font-size: 0.8rem;
            color: #666;
        }
        
        /* أنماط التفاصيل */
        #employees-page .detail-group {
            margin-bottom: 24px;
        }
        
        #employees-page .detail-group-title {
            font-size: 1.1rem;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
        }
        
        #employees-page .detail-item {
            display: flex;
            margin-bottom: 8px;
        }
        
        #employees-page .detail-label {
            font-weight: 600;
            width: 120px;
            flex-shrink: 0;
        }
        
        #employees-page .detail-value {
            flex: 1;
        }
        
        /* أنماط الجدول المصغر */
        #employees-page .mini-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        
        #employees-page .mini-table th,
        #employees-page .mini-table td {
            padding: 8px;
            text-align: right;
            border-bottom: 1px solid #eee;
        }
        
        #employees-page .mini-table th {
            font-weight: 600;
            background-color: #f5f5f5;
        }
        
        /* أنماط الراتب */
        #employees-page .salary-details {
            padding: 15px;
        }
        
        #employees-page .salary-header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        #employees-page .salary-title {
            font-size: 1.3rem;
            margin-bottom: 5px;
        }
        
        #employees-page .salary-date {
            color: #666;
            font-size: 0.9rem;
        }
        
        #employees-page .salary-components {
            display: flex;
            margin: 20px 0;
        }
        
        #employees-page .component-group {
            flex: 1;
            padding: 0 10px;
        }
        
        #employees-page .component-group-title {
            font-size: 1.1rem;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }
        
        #employees-page .salary-component {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
        }
        
        #employees-page .salary-component.total {
            font-weight: bold;
            border-top: 1px solid #eee;
            padding-top: 10px;
            margin-top: 5px;
        }
        
        #employees-page .salary-summary {
            display: flex;
            justify-content: space-between;
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            font-size: 1.2rem;
            font-weight: bold;
            margin-top: 20px;
        }
        
        #employees-page .salary-notes {
            margin-top: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        
        #employees-page .notes-label {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        /* أنماط كشف الرواتب */
        #employees-page #payroll-table tr.no-salary {
            background-color: #f9f9f9;
        }
        
        #employees-page #payroll-table tfoot td {
            font-weight: bold;
            background-color: #f5f5f5;
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للموظفين');
}

// إضافة الأنماط عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    addEmployeesStyles();
});