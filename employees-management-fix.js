/**
 * employees-management-fix.js
 * ملف إصلاح المشاكل في نظام إدارة الموظفين
 * يحتوي على إصلاحات للمشاكل المتعلقة بنظام إدارة الموظفين
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('تطبيق إصلاحات نظام إدارة الموظفين...');
    
    // إضافة رابط صفحة الموظفين إلى القائمة الجانبية (إذا لم يكن موجوداً)
    addEmployeesSidebarLinkFixed();
    
    // إصلاح دالة getArabicMonthName التي تسبب خطأ تجاوز عدد الاستدعاءات
    fixRecursiveMonthNameFunction();
    
    // إصلاح مشكلة تكرار إضافة الموظفين
    fixDuplicateEmployeeAddition();
    
    // إصلاح مشكلة عرض الرسوم البيانية
    fixChartsRendering();
    
    // إصلاح مشكلة أزرار الحذف والتعديل
    fixEmployeeActionButtons();
    
    // إصلاح مشكلة صرف الرواتب والتقارير
    fixSalaryAndReportsFeatures();
    
    // إصلاح مشكلة دالة عرض الإشعارات
    fixNotificationFunction();
});

/**
 * إضافة رابط صفحة الموظفين إلى القائمة الجانبية بطريقة آمنة
 */
function addEmployeesSidebarLinkFixed() {
    console.log('إضافة رابط صفحة الموظفين...');
    
    const navList = document.querySelector('.nav-list');
    if (!navList) {
        console.error('لم يتم العثور على قائمة الروابط في الشريط الجانبي');
        return;
    }
    
    // التحقق من عدم وجود الرابط مسبقاً
    if (document.querySelector('a[data-page="employees"]')) {
        console.log('رابط صفحة الموظفين موجود بالفعل');
        return;
    }
    
    // إنشاء عنصر الرابط
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
    
    // إضافة الرابط قبل رابط الإعدادات
    const settingsNavItem = document.querySelector('a[data-page="settings"]')?.parentNode;
    if (settingsNavItem) {
        navList.insertBefore(navItem, settingsNavItem);
        console.log('تم إضافة رابط صفحة الموظفين بنجاح');
        
        // إضافة مستمع حدث للرابط الجديد
        const employeesLink = navItem.querySelector('a[data-page="employees"]');
        if (employeesLink) {
            employeesLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // إزالة الكلاس النشط من جميع الروابط
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                
                // إضافة الكلاس النشط للرابط المحدد
                this.classList.add('active');
                
                // إظهار صفحة الموظفين
                showEmployeesPage();
            });
        }
    } else {
        console.error('لم يتم العثور على رابط الإعدادات');
        // إضافة الرابط في نهاية القائمة كحل بديل
        navList.appendChild(navItem);
    }
}

/**
 * عرض صفحة الموظفين
 */
function showEmployeesPage() {
    console.log('عرض صفحة الموظفين...');
    
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // إظهار صفحة الموظفين إذا كانت موجودة
    const employeesPage = document.getElementById('employees-page');
    if (employeesPage) {
        employeesPage.classList.add('active');
        
        // تحديث جدول الموظفين
        if (typeof renderEmployeesTable === 'function') {
            renderEmployeesTable();
        }
        
        // إطلاق حدث تغيير الصفحة
        document.dispatchEvent(new CustomEvent('page:change', { 
            detail: { page: 'employees' } 
        }));
    } else {
        console.error('صفحة الموظفين غير موجودة، سيتم إنشاؤها الآن...');
        // استدعاء دالة إنشاء صفحة الموظفين
        if (typeof addEmployeesPage === 'function') {
            addEmployeesPage();
            
            // إظهار الصفحة بعد إنشائها
            const newEmployeesPage = document.getElementById('employees-page');
            if (newEmployeesPage) {
                newEmployeesPage.classList.add('active');
                
                // إطلاق حدث تغيير الصفحة
                document.dispatchEvent(new CustomEvent('page:change', { 
                    detail: { page: 'employees' } 
                }));
                
                // تحديث جدول الموظفين
                if (typeof renderEmployeesTable === 'function') {
                    renderEmployeesTable();
                }
            }
        } else {
            console.error('دالة إنشاء صفحة الموظفين غير موجودة');
            alert('لم يتم العثور على صفحة الموظفين ودالة إنشائها غير متوفرة');
        }
    }
}

/**
 * إصلاح دالة getArabicMonthName التي تسبب خطأ تجاوز عدد الاستدعاءات المتكررة
 */
function fixRecursiveMonthNameFunction() {
    console.log('إصلاح دالة getArabicMonthName...');
    
    // تعريف دالة getArabicMonthName المحسنة
    window.getArabicMonthName = function(month) {
        // التأكد من تحويل الشهر إلى رقم صحيح
        const monthNumber = parseInt(month);
        
        // مصفوفة أسماء الشهور بالعربية
        const months = {
            1: 'كانون الثاني (يناير)',
            2: 'شباط (فبراير)',
            3: 'آذار (مارس)',
            4: 'نيسان (أبريل)',
            5: 'أيار (مايو)',
            6: 'حزيران (يونيو)',
            7: 'تموز (يوليو)',
            8: 'آب (أغسطس)',
            9: 'أيلول (سبتمبر)',
            10: 'تشرين الأول (أكتوبر)',
            11: 'تشرين الثاني (نوفمبر)',
            12: 'كانون الأول (ديسمبر)'
        };
        
        // إرجاع اسم الشهر إذا كان موجوداً، وإلا إرجاع نص افتراضي
        return months[monthNumber] || `الشهر ${month}`;
    };
    
    console.log('تم إصلاح دالة getArabicMonthName');
}

/**
 * إصلاح مشكلة تكرار إضافة الموظفين
 */
function fixDuplicateEmployeeAddition() {
    console.log('إصلاح مشكلة تكرار إضافة الموظفين...');
    
    // استبدال دالة addNewEmployee الأصلية بنسخة محسنة
    if (typeof addNewEmployee === 'function') {
        window.originalAddNewEmployee = window.addNewEmployee;
        
        window.addNewEmployee = function() {
            console.log('إضافة موظف جديد (النسخة المحسنة)...');
            
            // جمع بيانات الموظف من النموذج
            const employeeData = collectEmployeeFormData();
            
            if (!employeeData) {
                showNotificationFixed('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
                return;
            }
            
            // التحقق من عدم وجود موظف بنفس الاسم أو رقم الهاتف
            if (window.employees && Array.isArray(window.employees)) {
                const existingEmployee = window.employees.find(emp => 
                    emp.name === employeeData.name || emp.phone === employeeData.phone
                );
                
                if (existingEmployee) {
                    showNotificationFixed(`يوجد موظف بنفس الاسم أو رقم الهاتف: ${existingEmployee.name}`, 'warning');
                    return;
                }
            }
            
            // إضافة معرف فريد وتاريخ الإنشاء
            employeeData.id = Date.now().toString();
            employeeData.createdAt = new Date().toISOString();
            employeeData.status = 'نشط';
            
            // إضافة الموظف إلى المصفوفة
            if (window.employees && Array.isArray(window.employees)) {
                window.employees.push(employeeData);
                
                // حفظ البيانات
                if (typeof saveData === 'function') {
                    saveData();
                } else if (typeof saveEmployeesData === 'function') {
                    saveEmployeesData();
                }
                
                // تحديث الجدول
                if (typeof renderEmployeesTable === 'function') {
                    renderEmployeesTable();
                }
                
                // إغلاق النافذة المنبثقة
                if (typeof closeModal === 'function') {
                    closeModal('add-employee-modal');
                }
                
                // عرض إشعار النجاح
                showNotificationFixed(`تم إضافة الموظف ${employeeData.name} بنجاح!`, 'success');
                
                // إطلاق حدث تحديث الموظفين
                document.dispatchEvent(new CustomEvent('employee:update'));
            } else {
                console.error('مصفوفة الموظفين غير موجودة');
                showNotificationFixed('حدث خطأ أثناء إضافة الموظف', 'error');
            }
        };
        
        console.log('تم إصلاح دالة إضافة الموظفين');
    } else {
        console.warn('دالة addNewEmployee غير موجودة');
    }
}

/**
 * إصلاح مشكلة عرض الرسوم البيانية
 */
function fixChartsRendering() {
    console.log('إصلاح مشكلة عرض الرسوم البيانية...');
    
    // استبدال دالة renderEmployeesReports الأصلية بنسخة محسنة
    if (typeof renderEmployeesReports === 'function') {
        window.originalRenderEmployeesReports = window.renderEmployeesReports;
        
        window.renderEmployeesReports = function() {
            console.log('عرض تقارير الموظفين (النسخة المحسنة)...');
            
            // تدمير الرسوم البيانية الموجودة قبل إنشاء رسوم جديدة
            destroyExistingCharts();
            
            // تهيئة الرسوم البيانية
            safelyRenderEmployeesSalariesChart();
            safelyRenderEmployeesPerformanceChart();
        };
        
        console.log('تم إصلاح دالة عرض تقارير الموظفين');
    } else {
        console.warn('دالة renderEmployeesReports غير موجودة');
    }
    
    // تعريف دالة آمنة لتهيئة رسم بياني لرواتب الموظفين
    window.safelyRenderEmployeesSalariesChart = function() {
        const chartCanvas = document.getElementById('employees-salaries-chart');
        if (!chartCanvas || !window.Chart) return;
        
        try {
            // تدمير الرسم البياني الموجود إذا وجد
            const chart = Chart.getChart(chartCanvas);
            if (chart) {
                chart.destroy();
            }
            
            // حساب إجمالي الرواتب لكل موظف
            const employeeTotals = {};
            
            // التحقق من وجود بيانات المعاملات
            if (window.salaryTransactions && Array.isArray(window.salaryTransactions)) {
                // تجميع الرواتب حسب الموظف
                window.salaryTransactions.forEach(transaction => {
                    if (!employeeTotals[transaction.employeeId]) {
                        employeeTotals[transaction.employeeId] = {
                            name: transaction.employeeName,
                            baseSalary: 0,
                            commission: 0,
                            total: 0
                        };
                    }
                    
                    employeeTotals[transaction.employeeId].baseSalary += transaction.baseSalary || 0;
                    employeeTotals[transaction.employeeId].commission += transaction.commissionAmount || 0;
                    employeeTotals[transaction.employeeId].total += transaction.totalSalary || 0;
                });
            }
            
            // تحويل البيانات إلى تنسيق الرسم البياني
            const employeeNames = [];
            const baseSalaryData = [];
            const commissionData = [];
            
            Object.keys(employeeTotals).forEach(employeeId => {
                const employeeData = employeeTotals[employeeId];
                employeeNames.push(employeeData.name);
                baseSalaryData.push(employeeData.baseSalary);
                commissionData.push(employeeData.commission);
            });
            
            // إنشاء الرسم البياني
            const salariesChart = new Chart(chartCanvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: employeeNames,
                    datasets: [
                        {
                            label: 'الراتب الأساسي',
                            data: baseSalaryData,
                            backgroundColor: 'rgba(59, 130, 246, 0.7)',
                            borderColor: '#3b82f6',
                            borderWidth: 1
                        },
                        {
                            label: 'العمولات',
                            data: commissionData,
                            backgroundColor: 'rgba(16, 185, 129, 0.7)',
                            borderColor: '#10b981',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'المبلغ (دينار)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'الموظف'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'توزيع الرواتب والعمولات للموظفين',
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'top'
                        }
                    }
                }
            });
            
            console.log('تم إنشاء رسم بياني لرواتب الموظفين');
        } catch (error) {
            console.error('خطأ في إنشاء رسم بياني لرواتب الموظفين:', error);
        }
    };
    
    // تعريف دالة آمنة لتهيئة رسم بياني لأداء الموظفين
    window.safelyRenderEmployeesPerformanceChart = function() {
        const chartCanvas = document.getElementById('employees-performance-chart');
        if (!chartCanvas || !window.Chart) return;
        
        try {
            // تدمير الرسم البياني الموجود إذا وجد
            const chart = Chart.getChart(chartCanvas);
            if (chart) {
                chart.destroy();
            }
            
            // حساب إجمالي المبيعات لكل موظف
            const employeeSales = {};
            
            // التحقق من وجود بيانات المعاملات
            if (window.salaryTransactions && Array.isArray(window.salaryTransactions)) {
                // تجميع المبيعات حسب الموظف
                window.salaryTransactions.forEach(transaction => {
                    if (!employeeSales[transaction.employeeId]) {
                        employeeSales[transaction.employeeId] = {
                            name: transaction.employeeName,
                            sales: 0
                        };
                    }
                    
                    employeeSales[transaction.employeeId].sales += transaction.sales || 0;
                });
            }
            
            // تحويل البيانات إلى تنسيق الرسم البياني
            const employeeNames = [];
            const salesData = [];
            const backgroundColors = [];
            
            // مجموعة من الألوان
            const colors = [
                'rgba(59, 130, 246, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(245, 158, 11, 0.7)',
                'rgba(239, 68, 68, 0.7)',
                'rgba(139, 92, 246, 0.7)',
                'rgba(236, 72, 153, 0.7)',
                'rgba(248, 113, 113, 0.7)',
                'rgba(52, 211, 153, 0.7)',
                'rgba(251, 191, 36, 0.7)',
                'rgba(167, 139, 250, 0.7)'
            ];
            
            let colorIndex = 0;
            Object.keys(employeeSales).forEach(employeeId => {
                const employeeData = employeeSales[employeeId];
                employeeNames.push(employeeData.name);
                salesData.push(employeeData.sales);
                backgroundColors.push(colors[colorIndex % colors.length]);
                colorIndex++;
            });
            
            // إنشاء الرسم البياني
            const performanceChart = new Chart(chartCanvas.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: employeeNames,
                    datasets: [{
                        data: salesData,
                        backgroundColor: backgroundColors,
                        borderWidth: 1,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'توزيع المبيعات حسب الموظفين',
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'right'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(2) + '%';
                                    return `${label}: ${formatCurrencyFixed(value)} (${percentage})`;
                                }
                            }
                        }
                    }
                }
            });
            
            console.log('تم إنشاء رسم بياني لأداء الموظفين');
        } catch (error) {
            console.error('خطأ في إنشاء رسم بياني لأداء الموظفين:', error);
        }
    };
    
    // دالة مساعدة لتدمير الرسوم البيانية الموجودة
    window.destroyExistingCharts = function() {
        const chartIds = ['employees-salaries-chart', 'employees-performance-chart'];
        
        chartIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas && window.Chart) {
                const chart = Chart.getChart(canvas);
                if (chart) {
                    chart.destroy();
                    console.log(`تم تدمير الرسم البياني: ${id}`);
                }
            }
        });
    };
    
    console.log('تم إصلاح مشكلة عرض الرسوم البيانية');
}

/**
 * إصلاح مشكلة أزرار الحذف والتعديل
 */
function fixEmployeeActionButtons() {
    console.log('إصلاح مشكلة أزرار الحذف والتعديل...');
    
    // استبدال دالة renderEmployeesTable الأصلية بنسخة محسنة
    if (typeof renderEmployeesTable === 'function') {
        window.originalRenderEmployeesTable = window.renderEmployeesTable;
        
        window.renderEmployeesTable = function() {
            console.log('عرض جدول الموظفين (النسخة المحسنة)...');
            
            const tableBody = document.querySelector('#employees-table tbody');
            if (!tableBody) {
                console.error('لم يتم العثور على جدول الموظفين');
                return;
            }
            
            tableBody.innerHTML = '';
            
            // التحقق من وجود بيانات الموظفين
            if (!window.employees || !Array.isArray(window.employees) || window.employees.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="9" class="text-center">لا يوجد موظفين</td>';
                tableBody.appendChild(emptyRow);
                return;
            }
            
            // ترتيب الموظفين حسب تاريخ الإضافة (الأحدث أولاً)
            const sortedEmployees = [...window.employees].sort((a, b) => {
                return new Date(b.createdAt || b.hireDate) - new Date(a.createdAt || a.hireDate);
            });
            
            sortedEmployees.forEach(employee => {
                const row = document.createElement('tr');
                
                // حساب الربح الشهري
                let monthlyProfit = 0;
                if (employee.investments && Array.isArray(employee.investments)) {
                    monthlyProfit = employee.investments.reduce((total, inv) => {
                        const profit = typeof calculateInterest === 'function' ? 
                            calculateInterest(inv.amount, inv.date) : 
                            (inv.amount * (window.settings?.interestRate || 17.5) / 100);
                        return total + profit;
                    }, 0);
                }
                
                // تنسيق النسبة المئوية
                const commissionRate = employee.commissionRate || 0;
                
                // تنسيق تاريخ التعيين
                const hireDate = employee.hireDate || employee.joinDate || employee.createdAt || '';
                
                // حالة الموظف
                const statusClass = employee.status === 'inactive' ? 'danger' : 'success';
                const statusText = employee.status === 'inactive' ? 'غير نشط' : 'نشط';
                
                row.innerHTML = `
                    <td>${employee.id}</td>
                    <td>
                        <div class="employee-info">
                            <div class="employee-avatar">${employee.name.charAt(0)}</div>
                            <div>
                                <div class="employee-name">${employee.name}</div>
                                <div class="employee-phone">${employee.phone}</div>
                            </div>
                        </div>
                    </td>
                    <td>${employee.phone}</td>
                    <td>${formatCurrencyFixed(employee.baseSalary || 0)}</td>
                    <td>${commissionRate}%</td>
                    <td>${hireDate}</td>
                    <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="employee-actions">
                            <button class="btn btn-sm btn-outline view-employee" data-id="${employee.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline edit edit-employee" data-id="${employee.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline delete delete-employee" data-id="${employee.id}">
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
                        if (typeof showEmployeeDetails === 'function') {
                            showEmployeeDetails(employee.id);
                        } else {
                            alert('دالة عرض تفاصيل الموظف غير متوفرة');
                        }
                    });
                }
                
                if (editButton) {
                    editButton.addEventListener('click', () => {
                        if (typeof editEmployee === 'function') {
                            editEmployee(employee.id);
                        } else {
                            alert('دالة تعديل الموظف غير متوفرة');
                        }
                    });
                }
                
                if (deleteButton) {
                    deleteButton.addEventListener('click', () => {
                        if (typeof deleteEmployee === 'function') {
                            deleteEmployee(employee.id);
                        } else {
                            alert('دالة حذف الموظف غير متوفرة');
                        }
                    });
                }
            });
            
            console.log('تم عرض جدول الموظفين بنجاح');
        };
        
        console.log('تم إصلاح دالة عرض جدول الموظفين');
    } else {
        console.warn('دالة renderEmployeesTable غير موجودة');
    }
    
    // إضافة أنماط CSS لأزرار الإجراءات
    addEmployeeActionButtonsStyles();
}

/**
 * إضافة أنماط CSS لأزرار الإجراءات
 */
function addEmployeeActionButtonsStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('employee-actions-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'employee-actions-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* أنماط أزرار إجراءات الموظفين */
        .employee-actions {
            display: flex;
            gap: 5px;
            justify-content: center;
        }
        
        .employee-actions .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            padding: 0;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        
        .employee-actions .btn:hover {
            transform: translateY(-2px);
        }
        
        .employee-actions .btn.view-employee {
            color: #3b82f6;
            border-color: #3b82f6;
        }
        
        .employee-actions .btn.view-employee:hover {
            background-color: #3b82f6;
            color: white;
        }
        
        .employee-actions .btn.edit-employee {
            color: #10b981;
            border-color: #10b981;
        }
        
        .employee-actions .btn.edit-employee:hover {
            background-color: #10b981;
            color: white;
        }
        
        .employee-actions .btn.delete-employee {
            color: #ef4444;
            border-color: #ef4444;
        }
        
        .employee-actions .btn.delete-employee:hover {
            background-color: #ef4444;
            color: white;
        }
        
        /* أنماط أيقونات الأزرار */
        .employee-actions .btn i {
            font-size: 16px;
        }
    `;
    
    // إضافة عنصر النمط للصفحة
    document.head.appendChild(styleElement);
}

/**
 * إصلاح لمشكلة تكرار الموظفين في الجدول
 * تعديل الدالة المسؤولة عن عرض جدول الموظفين لمنع التكرار
 */
function renderEmployeesTable(employees) {
    console.log("عرض جدول الموظفين...");
    
    const tableBody = document.getElementById('employees-table-body');
    if (!tableBody) return;
    
    // مسح الجدول قبل إضافة الموظفين
    tableBody.innerHTML = '';
    
    // إنشاء مجموعة للتحقق من الموظفين المعروضين بالفعل
    const displayedEmployeeIds = new Set();
    
    employees.forEach(employee => {
        // تخطي الموظفين المكررين
        if (displayedEmployeeIds.has(employee.id)) {
            return;
        }
        
        // إضافة معرف الموظف للمجموعة
        displayedEmployeeIds.add(employee.id);
        
        // إنشاء صف جديد
        const row = document.createElement('tr');
        
        // إضافة خلايا البيانات
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>${employee.name}</td>
            <td>${employee.position}</td>
            <td>${employee.department}</td>
            <td>${employee.salary}</td>
            <td>
                <div class="employee-actions">
                    <button class="btn btn-outline-primary view-employee" data-id="${employee.id}" title="عرض تفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success edit-employee" data-id="${employee.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger delete-employee" data-id="${employee.id}" title="حذف">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        // إضافة الصف للجدول
        tableBody.appendChild(row);
    });
    
    // تطبيق أنماط أزرار الإجراءات
    addEmployeeActionButtonsStyles();
    
    // إضافة مستمعي الأحداث للأزرار
    addEmployeeButtonsEventListeners();
}

/**
 * إضافة مستمعي الأحداث لأزرار الإجراءات
 */
function addEmployeeButtonsEventListeners() {
    // أزرار عرض تفاصيل الموظف
    document.querySelectorAll('.view-employee').forEach(button => {
        button.addEventListener('click', function() {
            const employeeId = this.getAttribute('data-id');
            viewEmployeeDetails(employeeId);
        });
    });
    
    // أزرار تعديل الموظف
    document.querySelectorAll('.edit-employee').forEach(button => {
        button.addEventListener('click', function() {
            const employeeId = this.getAttribute('data-id');
            editEmployee(employeeId);
        });
    });
    
    // أزرار حذف الموظف
    document.querySelectorAll('.delete-employee').forEach(button => {
        button.addEventListener('click', function() {
            const employeeId = this.getAttribute('data-id');
            deleteEmployee(employeeId);
        });
    });
}

/**
 * إصلاح دالة عرض تفاصيل الموظف
 */
function viewEmployeeDetails(employeeId) {
    console.log(`عرض تفاصيل الموظف: ${employeeId}`);
    
    // البحث عن الموظف بالمعرف
    const employee = findEmployeeById(employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'danger');
        return;
    }
    
    // عرض تفاصيل الموظف في النموذج
    const detailsModal = document.getElementById('employee-details-modal');
    if (!detailsModal) return;
    
    // تعبئة بيانات الموظف في النموذج
    document.getElementById('employee-details-id').textContent = employee.id;
    document.getElementById('employee-details-name').textContent = employee.name;
    document.getElementById('employee-details-position').textContent = employee.position;
    document.getElementById('employee-details-department').textContent = employee.department;
    document.getElementById('employee-details-salary').textContent = employee.salary;
    document.getElementById('employee-details-join-date').textContent = formatDate(employee.joinDate);
    
    // عرض النموذج
    const modal = new bootstrap.Modal(detailsModal);
    modal.show();
}

/**
 * إصلاح دالة لتنسيق التاريخ
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * إصلاح دالة لتحويل رقم الشهر إلى اسم الشهر بالعربية
 * مع إصلاح خطأ الاستدعاء المتكرر
 */
function getArabicMonthName(monthIndex) {
    const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    // التحقق من أن الرقم ضمن النطاق الصحيح (0-11)
    if (monthIndex >= 0 && monthIndex <= 11) {
        return arabicMonths[monthIndex];
    }
    
    return '';
}

/**
 * إصلاح دالة عرض الإشعارات
 */
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.role = 'alert';
    
    // إضافة نص الإشعار
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="إغلاق"></button>
    `;
    
    // إضافة الإشعار للصفحة
    const notificationsContainer = document.getElementById('notifications-container');
    if (notificationsContainer) {
        notificationsContainer.appendChild(notification);
        
        // إزالة الإشعار تلقائيًا بعد 5 ثوانٍ
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

/**
 * إصلاح دالة عرض تقارير الموظفين
 */
function renderEmployeesReports() {
    console.log("عرض تقارير الموظفين...");
    
    // إظهار قسم التقارير
    const reportsSection = document.getElementById('reports-section');
    if (reportsSection) {
        reportsSection.classList.remove('d-none');
    }
    
    // عرض الرسم البياني للرواتب
    renderEmployeesSalariesChart();
}

/**
 * إصلاح دالة عرض رسم بياني للرواتب
 */
function renderEmployeesSalariesChart() {
    const chartCanvas = document.getElementById('employees-salaries-chart');
    if (!chartCanvas) return;
    
    // الحصول على سياق الرسم
    const ctx = chartCanvas.getContext('2d');
    
    // التحقق من وجود رسم بياني سابق وتدميره
    if (window.employeeSalaryChart) {
        window.employeeSalaryChart.destroy();
    }
    
    // الحصول على بيانات الموظفين
    const employees = getEmployeesData();
    
    // تجميع بيانات الرواتب حسب القسم
    const departments = {};
    employees.forEach(employee => {
        if (!departments[employee.department]) {
            departments[employee.department] = 0;
        }
        departments[employee.department] += parseFloat(employee.salary);
    });
    
    // تحضير بيانات الرسم البياني
    const data = {
        labels: Object.keys(departments),
        datasets: [{
            label: 'إجمالي الرواتب حسب القسم',
            data: Object.values(departments),
            backgroundColor: [
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 99, 132, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    // إنشاء الرسم البياني
    window.employeeSalaryChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'توزيع الرواتب حسب الأقسام'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * الحصول على بيانات الموظفين من التخزين المحلي
 */
function getEmployeesData() {
    const employeesData = localStorage.getItem('employees');
    if (employeesData) {
        return JSON.parse(employeesData);
    }
    return [];
}

/**
 * البحث عن موظف بالمعرف
 */
function findEmployeeById(id) {
    const employees = getEmployeesData();
    return employees.find(employee => employee.id.toString() === id.toString());
}

/**
 * إصلاح دالة حذف الموظف
 */
function deleteEmployee(employeeId) {
    console.log(`حذف الموظف: ${employeeId}`);
    
    // التأكد من رغبة المستخدم في الحذف
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الموظف؟')) {
        return;
    }
    
    // البحث عن الموظف وحذفه
    const employees = getEmployeesData();
    const employeeIndex = employees.findIndex(employee => employee.id.toString() === employeeId.toString());
    
    if (employeeIndex === -1) {
        showNotification('لم يتم العثور على الموظف', 'danger');
        return;
    }
    
    // حذف الموظف من المصفوفة
    employees.splice(employeeIndex, 1);
    
    // حفظ التغييرات
    localStorage.setItem('employees', JSON.stringify(employees));
    
    // إعادة عرض الجدول
    renderEmployeesTable(employees);
    
    // عرض إشعار نجاح الحذف
    showNotification('تم حذف الموظف بنجاح', 'success');
}

/**
 * إصلاح دالة تعديل الموظف
 */
function editEmployee(employeeId) {
    console.log(`تعديل الموظف: ${employeeId}`);
    
    // البحث عن الموظف بالمعرف
    const employee = findEmployeeById(employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'danger');
        return;
    }
    
    // تعبئة نموذج التعديل ببيانات الموظف
    document.getElementById('edit-employee-id').value = employee.id;
    document.getElementById('edit-employee-name').value = employee.name;
    document.getElementById('edit-employee-position').value = employee.position;
    document.getElementById('edit-employee-department').value = employee.department;
    document.getElementById('edit-employee-salary').value = employee.salary;
    
    // إذا كان هناك حقل لتاريخ الانضمام
    const joinDateField = document.getElementById('edit-employee-join-date');
    if (joinDateField && employee.joinDate) {
        // تنسيق التاريخ للعرض في حقل النص
        const joinDate = new Date(employee.joinDate);
        if (!isNaN(joinDate.getTime())) {
            joinDateField.value = joinDate.toISOString().split('T')[0];
        }
    }
    
    // عرض نموذج التعديل
    const editModal = document.getElementById('edit-employee-modal');
    if (editModal) {
        const modal = new bootstrap.Modal(editModal);
        modal.show();
    }
}

/**
 * إصلاح دالة حفظ تعديلات الموظف
 */
function saveEmployeeEdit() {
    // الحصول على بيانات الموظف من النموذج
    const employeeId = document.getElementById('edit-employee-id').value;
    const name = document.getElementById('edit-employee-name').value;
    const position = document.getElementById('edit-employee-position').value;
    const department = document.getElementById('edit-employee-department').value;
    const salary = document.getElementById('edit-employee-salary').value;
    
    // التحقق من صحة البيانات
    if (!name || !position || !department || !salary) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'warning');
        return;
    }
    
    // الحصول على بيانات الموظفين
    const employees = getEmployeesData();
    
    // البحث عن الموظف المراد تعديله
    const employeeIndex = employees.findIndex(employee => employee.id.toString() === employeeId.toString());
    
    if (employeeIndex === -1) {
        showNotification('لم يتم العثور على الموظف', 'danger');
        return;
    }
    
    // تحديث بيانات الموظف
    employees[employeeIndex].name = name;
    employees[employeeIndex].position = position;
    employees[employeeIndex].department = department;
    employees[employeeIndex].salary = salary;
    
    // إذا كان هناك حقل لتاريخ الانضمام
    const joinDateField = document.getElementById('edit-employee-join-date');
    if (joinDateField) {
        employees[employeeIndex].joinDate = joinDateField.value;
    }
    
    // حفظ التغييرات
    localStorage.setItem('employees', JSON.stringify(employees));
    
    // إعادة عرض الجدول
    renderEmployeesTable(employees);
    
    // إغلاق النموذج
    const editModal = document.getElementById('edit-employee-modal');
    if (editModal) {
        const modal = bootstrap.Modal.getInstance(editModal);
        if (modal) {
            modal.hide();
        }
    }
    
    // عرض إشعار نجاح التعديل
    showNotification('تم تعديل بيانات الموظف بنجاح', 'success');
}

/**
 * إصلاح دالة إضافة موظف جديد
 */
function addNewEmployee() {
    // الحصول على بيانات الموظف من النموذج
    const name = document.getElementById('add-employee-name').value;
    const position = document.getElementById('add-employee-position').value;
    const department = document.getElementById('add-employee-department').value;
    const salary = document.getElementById('add-employee-salary').value;
    
    // التحقق من صحة البيانات
    if (!name || !position || !department || !salary) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'warning');
        return;
    }
    
    // إنشاء معرف فريد للموظف الجديد
    const newEmployeeId = Date.now();
    
    // إنشاء كائن الموظف الجديد
    const newEmployee = {
        id: newEmployeeId,
        name: name,
        position: position,
        department: department,
        salary: salary,
        joinDate: new Date().toISOString().split('T')[0]
    };
    
    // الحصول على بيانات الموظفين الحالية
    const employees = getEmployeesData();
    
    // إضافة الموظف الجديد
    employees.push(newEmployee);
    
    // حفظ التغييرات
    localStorage.setItem('employees', JSON.stringify(employees));
    
    // إعادة تعيين النموذج
    document.getElementById('add-employee-form').reset();
    
    // إعادة عرض الجدول
    renderEmployeesTable(employees);
    
    // إغلاق النموذج
    const addModal = document.getElementById('add-employee-modal');
    if (addModal) {
        const modal = bootstrap.Modal.getInstance(addModal);
        if (modal) {
            modal.hide();
        }
    }
    
    // عرض إشعار نجاح الإضافة
    showNotification('تم إضافة الموظف بنجاح', 'success');
}

/**
 * إصلاح دالة عرض تفاصيل الراتب
 */
function viewSalaryDetails(employeeId) {
    console.log(`عرض تفاصيل الراتب: ${employeeId}`);
    
    // البحث عن الموظف بالمعرف
    const employee = findEmployeeById(employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'danger');
        return;
    }
    
    // عرض تفاصيل الراتب في النموذج
    const detailsModal = document.getElementById('salary-details-modal');
    if (!detailsModal) return;
    
    // تعبئة بيانات الراتب في النموذج
    document.getElementById('salary-details-employee-name').textContent = employee.name;
    document.getElementById('salary-details-base-salary').textContent = employee.salary;
    
    // حساب المستحقات
    const baseSalary = parseFloat(employee.salary);
    const transportAllowance = baseSalary * 0.1;
    const housingAllowance = baseSalary * 0.25;
    const totalAllowances = transportAllowance + housingAllowance;
    
    // حساب الخصومات
    const socialInsurance = baseSalary * 0.05;
    const healthInsurance = baseSalary * 0.03;
    const totalDeductions = socialInsurance + healthInsurance;
    
    // حساب صافي الراتب
    const netSalary = baseSalary + totalAllowances - totalDeductions;
    
    // عرض تفاصيل الراتب
    document.getElementById('salary-details-transport-allowance').textContent = transportAllowance.toFixed(2);
    document.getElementById('salary-details-housing-allowance').textContent = housingAllowance.toFixed(2);
    document.getElementById('salary-details-total-allowances').textContent = totalAllowances.toFixed(2);
    document.getElementById('salary-details-social-insurance').textContent = socialInsurance.toFixed(2);
    document.getElementById('salary-details-health-insurance').textContent = healthInsurance.toFixed(2);
    document.getElementById('salary-details-total-deductions').textContent = totalDeductions.toFixed(2);
    document.getElementById('salary-details-net-salary').textContent = netSalary.toFixed(2);
    
    // عرض النموذج
    const modal = new bootstrap.Modal(detailsModal);
    modal.show();
}

/**
 * تهيئة التطبيق
 */
function initApp() {
    // إضافة مستمعي الأحداث للأزرار الرئيسية
    document.getElementById('show-employees-table-btn').addEventListener('click', function() {
        // الحصول على بيانات الموظفين وعرضها
        const employees = getEmployeesData();
        renderEmployeesTable(employees);
    });
    
    document.getElementById('show-employees-reports-btn').addEventListener('click', function() {
        renderEmployeesReports();
    });
    
    document.getElementById('add-employee-btn').addEventListener('click', function() {
        // إعادة تعيين نموذج الإضافة
        document.getElementById('add-employee-form').reset();
        
        // عرض نموذج الإضافة
        const addModal = document.getElementById('add-employee-modal');
        if (addModal) {
            const modal = new bootstrap.Modal(addModal);
            modal.show();
        }
    });
    
    // إضافة مستمع حدث لزر حفظ الموظف
    document.getElementById('save-employee-btn').addEventListener('click', addNewEmployee);
    
    // إضافة مستمع حدث لزر حفظ تعديلات الموظف
    document.getElementById('save-employee-edit-btn').addEventListener('click', saveEmployeeEdit);
    
    // إضافة أنماط CSS لأزرار الإجراءات
    addEmployeeActionButtonsStyles();
    
    // عرض جدول الموظفين عند تحميل الصفحة
    const employees = getEmployeesData();
    renderEmployeesTable(employees);
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);