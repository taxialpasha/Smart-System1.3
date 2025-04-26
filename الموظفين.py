/**
 * تحديث نظام إدارة الموظفين لإضافة نسبة المبيعات والراتب الأساسي
 * هذا الملف يحتوي على التعديلات والإضافات اللازمة لدعم حساب الراتب بناءً على نسبة المبيعات
 */

// 1. تعديل نموذج إضافة/تعديل الموظف لإضافة حقول الراتب الأساسي ونسبة المبيعات
document.addEventListener('DOMContentLoaded', function() {
    // استدعاء الدالة الأصلية للتأكد من تنفيذ الأكواد الأصلية أولاً
    const originalAddModals = window.addModals;
    
    window.addModals = function() {
        // استدعاء الدالة الأصلية
        if (typeof originalAddModals === 'function') {
            originalAddModals();
        }
        
        // تعديل نموذج إضافة موظف
        updateEmployeeForm();
        
        // تعديل نموذج تسجيل راتب
        updateSalaryForm();
    };
    
    // التأكد من تحديث نماذج النوافذ بعد تحميل الصفحة
    setTimeout(function() {
        updateEmployeeForm();
        updateSalaryForm();
    }, 1000);
});

/**
 * تحديث نموذج إضافة/تعديل الموظف
 */
function updateEmployeeForm() {
    // البحث عن الحقول في نموذج إضافة موظف
    const employeeForm = document.getElementById('add-employee-form');
    if (!employeeForm) return;
    
    // البحث عن حقل الراتب الحالي
    const salaryFieldGroup = document.getElementById('employee-salary').closest('.form-group');
    if (!salaryFieldGroup) return;
    
    // التحقق مما إذا كانت الحقول الجديدة قد تمت إضافتها بالفعل
    if (document.getElementById('employee-base-salary')) return;
    
    // إنشاء حقول جديدة للراتب الأساسي ونسبة المبيعات
    const newFields = document.createElement('div');
    newFields.innerHTML = `
        <div class="form-group">
            <label class="form-label">الراتب الأساسي</label>
            <div class="input-group">
                <input class="form-input" id="employee-base-salary" type="number" min="0" step="1000" />
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">نسبة المبيعات (%)</label>
            <div class="input-group">
                <input class="form-input" id="employee-commission-rate" type="number" min="0" max="100" step="0.1" value="0" />
            </div>
        </div>
        <div class="form-group has-checkbox">
            <input type="checkbox" id="employee-has-commission" class="form-checkbox" />
            <label for="employee-has-commission" class="form-checkbox-label">تفعيل نسبة المبيعات</label>
        </div>
    `;
    
    // إدراج الحقول الجديدة بعد حقل الراتب
    salaryFieldGroup.parentNode.insertBefore(newFields, salaryFieldGroup.nextSibling);
    
    // تعديل عنوان حقل الراتب الحالي
    const salaryLabel = salaryFieldGroup.querySelector('.form-label');
    if (salaryLabel) {
        salaryLabel.textContent = 'الراتب الإجمالي (محسوب تلقائياً)';
    }
    
    // تعيين حقل الراتب الإجمالي كغير قابل للتعديل
    const salaryInput = document.getElementById('employee-salary');
    if (salaryInput) {
        salaryInput.setAttribute('readonly', 'readonly');
    }
    
    // إضافة مستمعي الأحداث للحقول الجديدة
    setupCommissionFields();
}

/**
 * تحديث نموذج تسجيل راتب
 */
function updateSalaryForm() {
    // البحث عن نموذج تسجيل راتب
    const salaryForm = document.getElementById('record-salary-form');
    if (!salaryForm) return;
    
    // البحث عن حقل حساب المبيعات
    if (document.getElementById('salary-sales-amount')) return;
    
    // البحث عن حقل الراتب الأساسي
    const baseSalaryField = document.getElementById('salary-amount');
    if (!baseSalaryField) return;
    
    const baseSalaryGroup = baseSalaryField.closest('.form-group');
    if (!baseSalaryGroup) return;
    
    // إنشاء حقول جديدة لمبلغ المبيعات ونسبة العمولة
    const salesFields = document.createElement('div');
    salesFields.className = 'commission-section';
    salesFields.style.display = 'none'; // إخفاء القسم افتراضياً
    salesFields.innerHTML = `
        <div class="form-group">
            <label class="form-label">الراتب الأساسي</label>
            <input class="form-input" id="salary-base-amount" type="number" readonly />
        </div>
        <div class="form-group">
            <label class="form-label">نسبة المبيعات (%)</label>
            <input class="form-input" id="salary-commission-rate" type="number" readonly />
        </div>
        <div class="form-group">
            <label class="form-label">مبلغ المبيعات</label>
            <input class="form-input" id="salary-sales-amount" type="number" min="0" value="0" />
        </div>
        <div class="form-group">
            <label class="form-label">مبلغ العمولة</label>
            <input class="form-input" id="salary-commission-amount" type="number" readonly />
        </div>
    `;
    
    // إدراج الحقول الجديدة بعد حقل الراتب الأساسي
    salaryForm.insertBefore(salesFields, baseSalaryGroup.nextSibling);
    
    // تغيير عنوان حقل الراتب الأساسي
    const baseSalaryLabel = baseSalaryGroup.querySelector('.form-label');
    if (baseSalaryLabel) {
        baseSalaryLabel.textContent = 'الراتب الإجمالي';
    }
    
    // إضافة مستمع حدث لحقل مبلغ المبيعات
    const salesAmountField = document.getElementById('salary-sales-amount');
    if (salesAmountField) {
        salesAmountField.addEventListener('input', updateCommissionAmount);
    }
    
    // تحديث مستمع حدث اختيار الموظف
    updateSalaryEmployeeListener();
}

/**
 * إعداد مستمعي الأحداث لحقول نسبة المبيعات
 */
function setupCommissionFields() {
    // الحصول على الحقول
    const baseSalaryField = document.getElementById('employee-base-salary');
    const commissionRateField = document.getElementById('employee-commission-rate');
    const hasCommissionCheckbox = document.getElementById('employee-has-commission');
    const totalSalaryField = document.getElementById('employee-salary');
    
    if (!baseSalaryField || !commissionRateField || !hasCommissionCheckbox || !totalSalaryField) {
        return;
    }
    
    // مستمع حدث للتحقق من تفعيل نسبة المبيعات
    hasCommissionCheckbox.addEventListener('change', function() {
        // تفعيل/تعطيل حقول نسبة المبيعات
        commissionRateField.disabled = !this.checked;
        
        // تحديث الراتب الإجمالي
        updateTotalSalary();
    });
    
    // مستمع حدث لتغيير الراتب الأساسي
    baseSalaryField.addEventListener('input', updateTotalSalary);
    
    // مستمع حدث لتغيير نسبة المبيعات
    commissionRateField.addEventListener('input', updateTotalSalary);
    
    // التهيئة الأولية
    commissionRateField.disabled = !hasCommissionCheckbox.checked;
    
    // تعديل دالة addNewEmployee لإضافة حقول نسبة المبيعات
    const originalAddNewEmployee = window.addNewEmployee;
    window.addNewEmployee = function() {
        // الحصول على قيم الحقول الجديدة
        const baseSalary = parseFloat(baseSalaryField.value) || 0;
        const commissionRate = parseFloat(commissionRateField.value) || 0;
        const hasCommission = hasCommissionCheckbox.checked;
        
        // تعيين الراتب الإجمالي
        totalSalaryField.value = baseSalary;
        
        // استدعاء الدالة الأصلية
        if (typeof originalAddNewEmployee === 'function') {
            const result = originalAddNewEmployee();
            
            // إذا تمت إضافة الموظف بنجاح
            if (result !== false) {
                // تحديث بيانات الموظف المضاف لإضافة حقول نسبة المبيعات
                const lastEmployeeIndex = window.employees.length - 1;
                if (lastEmployeeIndex >= 0) {
                    window.employees[lastEmployeeIndex].baseSalary = baseSalary;
                    window.employees[lastEmployeeIndex].commissionRate = hasCommission ? commissionRate : 0;
                    window.employees[lastEmployeeIndex].hasCommission = hasCommission;
                    
                    // حفظ البيانات
                    window.saveEmployeesData();
                }
            }
            
            return result;
        }
    };
    
    // تعديل دالة updateEmployee لتحديث حقول نسبة المبيعات
    const originalUpdateEmployee = window.updateEmployee;
    window.updateEmployee = function(employeeId) {
        // الحصول على قيم الحقول الجديدة
        const baseSalary = parseFloat(baseSalaryField.value) || 0;
        const commissionRate = parseFloat(commissionRateField.value) || 0;
        const hasCommission = hasCommissionCheckbox.checked;
        
        // تعيين الراتب الإجمالي
        totalSalaryField.value = calculateTotalSalary(baseSalary, commissionRate, hasCommission);
        
        // استدعاء الدالة الأصلية
        if (typeof originalUpdateEmployee === 'function') {
            const result = originalUpdateEmployee(employeeId);
            
            // إذا تم تحديث الموظف بنجاح
            if (result !== false) {
                // البحث عن الموظف وتحديث بياناته
                const employeeIndex = window.employees.findIndex(emp => emp.id === employeeId);
                if (employeeIndex >= 0) {
                    window.employees[employeeIndex].baseSalary = baseSalary;
                    window.employees[employeeIndex].commissionRate = hasCommission ? commissionRate : 0;
                    window.employees[employeeIndex].hasCommission = hasCommission;
                    
                    // حفظ البيانات
                    window.saveEmployeesData();
                }
            }
            
            return result;
        }
    };
    
    // تعديل دالة editEmployee لملء حقول نسبة المبيعات
    const originalEditEmployee = window.editEmployee;
    window.editEmployee = function(employeeId) {
        // استدعاء الدالة الأصلية
        if (typeof originalEditEmployee === 'function') {
            originalEditEmployee(employeeId);
        }
        
        // البحث عن الموظف
        const employee = window.employees.find(emp => emp.id === employeeId);
        if (employee) {
            // ملء حقول نسبة المبيعات
            baseSalaryField.value = employee.baseSalary || 0;
            commissionRateField.value = employee.commissionRate || 0;
            hasCommissionCheckbox.checked = employee.hasCommission || false;
            
            // تحديث حالة تعطيل حقل نسبة المبيعات
            commissionRateField.disabled = !hasCommissionCheckbox.checked;
        }
    };
}

/**
 * تحديث مستمع حدث اختيار الموظف في نموذج تسجيل راتب
 */
function updateSalaryEmployeeListener() {
    // الحصول على حقل اختيار الموظف
    const employeeSelect = document.getElementById('salary-employee');
    if (!employeeSelect) return;
    
    // الحصول على قسم نسبة المبيعات
    const commissionSection = document.querySelector('.commission-section');
    if (!commissionSection) return;
    
    // تعديل دالة updateSalaryDetails لعرض بيانات نسبة المبيعات
    const originalUpdateSalaryDetails = window.updateSalaryDetails;
    window.updateSalaryDetails = function() {
        // استدعاء الدالة الأصلية
        if (typeof originalUpdateSalaryDetails === 'function') {
            originalUpdateSalaryDetails();
        }
        
        // الحصول على معرف الموظف المحدد
        const employeeId = employeeSelect.value;
        if (!employeeId) {
            commissionSection.style.display = 'none';
            return;
        }
        
        // البحث عن الموظف
        const employee = window.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            commissionSection.style.display = 'none';
            return;
        }
        
        // التحقق مما إذا كان الموظف لديه نسبة مبيعات
        if (employee.hasCommission) {
            // عرض قسم نسبة المبيعات
            commissionSection.style.display = 'block';
            
            // ملء البيانات
            document.getElementById('salary-base-amount').value = employee.baseSalary || 0;
            document.getElementById('salary-commission-rate').value = employee.commissionRate || 0;
            
            // تحديث مبلغ العمولة
            updateCommissionAmount();
        } else {
            // إخفاء قسم نسبة المبيعات
            commissionSection.style.display = 'none';
        }
    };
    
    // تعديل دالة recordSalaryPayment لتسجيل بيانات نسبة المبيعات
    const originalRecordSalaryPayment = window.recordSalaryPayment;
    window.recordSalaryPayment = function() {
        // الحصول على معرف الموظف المحدد
        const employeeId = employeeSelect.value;
        if (!employeeId) {
            return originalRecordSalaryPayment ? originalRecordSalaryPayment() : false;
        }
        
        // البحث عن الموظف
        const employee = window.employees.find(emp => emp.id === employeeId);
        if (!employee || !employee.hasCommission) {
            return originalRecordSalaryPayment ? originalRecordSalaryPayment() : false;
        }
        
        // الحصول على قيم حقول نسبة المبيعات
        const baseSalary = parseFloat(document.getElementById('salary-base-amount').value) || 0;
        const commissionRate = parseFloat(document.getElementById('salary-commission-rate').value) || 0;
        const salesAmount = parseFloat(document.getElementById('salary-sales-amount').value) || 0;
        const commissionAmount = parseFloat(document.getElementById('salary-commission-amount').value) || 0;
        
        // حفظ القيم الأصلية
        const originalAllowances = parseFloat(document.getElementById('salary-allowances').value) || 0;
        
        // إضافة مبلغ العمولة إلى العلاوات
        document.getElementById('salary-allowances').value = originalAllowances + commissionAmount;
        
        // استدعاء الدالة الأصلية
        const result = originalRecordSalaryPayment ? originalRecordSalaryPayment() : false;
        
        // إعادة القيمة الأصلية للعلاوات
        document.getElementById('salary-allowances').value = originalAllowances;
        
        // إذا تم تسجيل الراتب بنجاح
        if (result !== false) {
            // البحث عن دفعة الراتب المسجلة
            const lastPaymentIndex = window.salaryPayments.length - 1;
            if (lastPaymentIndex >= 0) {
                // إضافة بيانات نسبة المبيعات
                window.salaryPayments[lastPaymentIndex].commissionData = {
                    baseSalary,
                    commissionRate,
                    salesAmount,
                    commissionAmount
                };
                
                // حفظ البيانات
                window.saveEmployeesData();
            }
        }
        
        return result;
    };
}

/**
 * تحديث الراتب الإجمالي بناءً على الراتب الأساسي ونسبة المبيعات
 */
function updateTotalSalary() {
    // الحصول على الحقول
    const baseSalaryField = document.getElementById('employee-base-salary');
    const commissionRateField = document.getElementById('employee-commission-rate');
    const hasCommissionCheckbox = document.getElementById('employee-has-commission');
    const totalSalaryField = document.getElementById('employee-salary');
    
    if (!baseSalaryField || !commissionRateField || !hasCommissionCheckbox || !totalSalaryField) {
        return;
    }
    
    // الحصول على القيم
    const baseSalary = parseFloat(baseSalaryField.value) || 0;
    const commissionRate = parseFloat(commissionRateField.value) || 0;
    const hasCommission = hasCommissionCheckbox.checked;
    
    // حساب الراتب الإجمالي
    const totalSalary = baseSalary;
    
    // تحديث حقل الراتب الإجمالي
    totalSalaryField.value = totalSalary;
}

/**
 * حساب الراتب الإجمالي بناءً على الراتب الأساسي ونسبة المبيعات
 * @param {number} baseSalary الراتب الأساسي
 * @param {number} commissionRate نسبة المبيعات
 * @param {boolean} hasCommission تفعيل نسبة المبيعات
 * @param {number} salesAmount مبلغ المبيعات (اختياري)
 * @returns {number} الراتب الإجمالي
 */
function calculateTotalSalary(baseSalary, commissionRate, hasCommission, salesAmount = 0) {
    // إذا كانت نسبة المبيعات غير مفعلة، نرجع الراتب الأساسي فقط
    if (!hasCommission) {
        return baseSalary;
    }
    
    // حساب مبلغ العمولة
    const commissionAmount = (salesAmount * commissionRate) / 100;
    
    // حساب الراتب الإجمالي
    return baseSalary + commissionAmount;
}

/**
 * تحديث مبلغ العمولة بناءً على مبلغ المبيعات ونسبة العمولة
 */
function updateCommissionAmount() {
    // الحصول على الحقول
    const commissionRateField = document.getElementById('salary-commission-rate');
    const salesAmountField = document.getElementById('salary-sales-amount');
    const commissionAmountField = document.getElementById('salary-commission-amount');
    const baseSalaryField = document.getElementById('salary-base-amount');
    const totalSalaryField = document.getElementById('salary-amount');
    
    if (!commissionRateField || !salesAmountField || !commissionAmountField || !baseSalaryField || !totalSalaryField) {
        return;
    }
    
    // الحصول على القيم
    const commissionRate = parseFloat(commissionRateField.value) || 0;
    const salesAmount = parseFloat(salesAmountField.value) || 0;
    const baseSalary = parseFloat(baseSalaryField.value) || 0;
    
    // حساب مبلغ العمولة
    const commissionAmount = (salesAmount * commissionRate) / 100;
    
    // تحديث حقل مبلغ العمولة
    commissionAmountField.value = commissionAmount;
    
    // تحديث الراتب الإجمالي
    totalSalaryField.value = baseSalary + commissionAmount;
    
    // تحديث صافي الراتب
    window.updateNetSalary();
}

/**
 * تعديل عرض تفاصيل دفعة الراتب لعرض بيانات نسبة المبيعات
 */
function updateSalaryPaymentDetails() {
    // تعديل دالة showSalaryPaymentDetails لعرض بيانات نسبة المبيعات
    const originalShowSalaryPaymentDetails = window.showSalaryPaymentDetails;
    window.showSalaryPaymentDetails = function(paymentId) {
        // استدعاء الدالة الأصلية
        if (typeof originalShowSalaryPaymentDetails === 'function') {
            originalShowSalaryPaymentDetails(paymentId);
        }
        
        // البحث عن دفعة الراتب
        const payment = window.salaryPayments.find(p => p.id === paymentId);
        if (!payment || !payment.commissionData) {
            return;
        }
        
        // البحث عن قسم تفاصيل الراتب
        const salaryDetailsSection = document.querySelector('.salary-details');
        if (!salaryDetailsSection) {
            return;
        }
        
        // البحث عن الصف الأخير (صافي الراتب)
        const totalRow = salaryDetailsSection.querySelector('.total-row');
        if (!totalRow) {
            return;
        }
        
        // إنشاء صفوف جديدة لبيانات نسبة المبيعات
        const commissionRows = document.createElement('div');
        commissionRows.innerHTML = `
            <tr class="commission-row">
                <td>الراتب الأساسي</td>
                <td>${window.formatCurrency(payment.commissionData.baseSalary)}</td>
            </tr>
            <tr class="commission-row">
                <td>مبلغ المبيعات</td>
                <td>${window.formatCurrency(payment.commissionData.salesAmount)}</td>
            </tr>
            <tr class="commission-row">
                <td>نسبة المبيعات (${payment.commissionData.commissionRate}%)</td>
                <td>${window.formatCurrency(payment.commissionData.commissionAmount)}</td>
            </tr>
        `;
        
        // إدراج الصفوف الجديدة قبل صف صافي الراتب
        totalRow.parentNode.insertBefore(commissionRows, totalRow);
    };
}

// استدعاء دالة تعديل عرض تفاصيل دفعة الراتب
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateSalaryPaymentDetails, 1000);
});

/**
 * إضافة أنماط CSS جديدة
 */
function addCommissionStyles() {
    // التحقق من وجود عنصر style لأنماط نسبة المبيعات
    if (document.getElementById('commission-styles')) {
        return;
    }
    
    // إنشاء عنصر style جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'commission-styles';
    
    // تحديد الأنماط
    styleElement.textContent = `
        /* أنماط حقول نسبة المبيعات */
        .form-group.has-checkbox {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .form-checkbox {
            margin-left: 10px;
        }
        
        .form-checkbox-label {
            margin-bottom: 0;
        }
        
        /* أنماط قسم نسبة المبيعات */
        .commission-section {
            margin: 15px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
        }
        
        /* أنماط صفوف نسبة المبيعات في تفاصيل الراتب */
        .commission-row {
            background-color: #f5f5f5;
        }
    `;
    
    // إضافة عنصر الأنماط إلى الصفحة
    document.head.appendChild(styleElement);
}

// استدعاء دالة إضافة الأنماط
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addCommissionStyles, 1000);
});

/**
 * التحديثات التي تمت إضافتها:
 * 
 * 1. إضافة حقول جديدة في نموذج إضافة/تعديل الموظف:
 *    - الراتب الأساسي
 *    - نسبة المبيعات (%)
 *    - خيار تفعيل نسبة المبيعات
 * 
 * 2. إضافة حقول جديدة في نموذج تسجيل راتب:
 *    - الراتب الأساسي
 *    - نسبة المبيعات (%)
 *    - مبلغ المبيعات
 *    - مبلغ العمولة
 * 
 * 3. تعديل دوال الحفظ والتعديل لتخزين بيانات نسبة المبيعات
 * 
 * 4. إضافة دوال لحساب الراتب الإجمالي بناءً على الراتب الأساسي ونسبة المبيعات
 * 
 * 5. تعديل عرض تفاصيل دفعة الراتب لعرض بيانات نسبة المبيعات
 * 
 * 6. إضافة أنماط CSS جديدة لعناصر نسبة المبيعات
 */