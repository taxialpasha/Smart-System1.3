/**
 * print-salaries.js
 * إضافة وظيفة طباعة سجلات الرواتب
 */

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة زر الطباعة في صفحة سجلات الرواتب
    addPrintSalariesButton();

    // إضافة أنماط CSS للطباعة
    addPrintStyles();
});

/**
 * إضافة زر الطباعة في صفحة سجلات الرواتب
 */
function addPrintSalariesButton() {
    // البحث عن قسم الإجراءات في صفحة الرواتب
    const actionsContainer = document.querySelector('#salary-transactions-tab .section-actions');
    if (!actionsContainer) {
        console.warn('لم يتم العثور على حاوية الإجراءات في صفحة الرواتب');
        return;
    }
    
    // التحقق من عدم وجود الزر مسبقاً
    if (document.getElementById('print-all-salaries-btn')) return;
    
    // إنشاء زر الطباعة
    const printButton = document.createElement('button');
    printButton.className = 'btn btn-outline btn-sm';
    printButton.id = 'print-all-salaries-btn';
    printButton.setAttribute('title', 'طباعة');
    printButton.innerHTML = '<i class="fas fa-print"></i><span>طباعة</span>';
    
    // إضافة الزر بعد زر التصدير
    const exportButton = actionsContainer.querySelector('[title="تصدير"]');
    if (exportButton) {
        actionsContainer.insertBefore(printButton, exportButton.nextSibling);
    } else {
        actionsContainer.appendChild(printButton);
    }
    
    // إضافة مستمع حدث للزر
    printButton.addEventListener('click', printAllSalaries);
}

 h1 {
                font-size: 24px;
                margin-bottom: 5px;
            }
            
            .print-header h2 {
                font-size: 18px;
                color: #666;
                margin-bottom: 10px;
            }
            
            .print-date {
                text-align: left;
                margin-bottom: 20px;
                font-size: 14px;
            }
            
            .print-section table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .print-section table th, .print-section table td {
                border: 1px solid #000;
                padding: 8px;
                text-align: right;
            }
            
            .print-section table th {
                background-color: #f2f2f2;
            }
            
            /* تعديلات أخرى للطباعة */
            .print-section .employee-actions {
                display: none; /* إخفاء أزرار الإجراءات */
            }
            
            /* ترقيم الصفوف */
            .print-section .row-number {
                font-weight: bold;
            }
            
            /* ترويسة وتذييل الصفحة */
            @page {
                margin: 2cm;
            }
            
            .print-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 12px;
                padding: 10px;
            }
            
            /* تكرار ترويسة الجدول في كل صفحة */
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
        }
    `;
    
    // إضافة عنصر النمط إلى الصفحة
    document.head.appendChild(styleElement);
}

/**
 * طباعة جميع سجلات الرواتب
 */
function printAllSalaries() {
    // البحث عن جدول الرواتب بناءً على معرف الجدول أو السياق
    let salaryTable = document.getElementById('salary-transactions-table');
    if (!salaryTable) {
        // محاولة البحث عن الجدول من خلال العناصر المرئية في صفحة سجل الرواتب
        salaryTable = document.querySelector('#salary-transactions-tab table, #profits-table');
    }
    
    // في حالة عدم العثور على الجدول، نبحث عنه مباشرة في صفحة الرواتب
    if (!salaryTable) {
        const salaryPage = document.querySelector('#salary-transactions-tab, #profits-page');
        if (salaryPage) {
            salaryTable = salaryPage.querySelector('table');
        }
    }

    // إذا لم نجد الجدول، نستخدم البيانات مباشرة من مصفوفة الرواتب المخزنة
    if (!salaryTable && window.salaryTransactions && window.salaryTransactions.length > 0) {
        return createSalaryTableFromData();
    }

    if (!salaryTable) {
        console.error('لم يتم العثور على جدول الرواتب');
        if (window.showNotification) {
            window.showNotification('لم يتم العثور على جدول الرواتب', 'error');
        }
        return;
    }
    
    console.log('تم العثور على جدول الرواتب للطباعة');
    
    // إنشاء نسخة من الجدول للطباعة
    const printContent = document.createElement('div');
    printContent.className = 'print-section';
    
    // إضافة ترويسة الطباعة
    const header = document.createElement('div');
    header.className = 'print-header';
    header.innerHTML = `
        <h1>نظام الاستثمار المتكامل</h1>
        <h2>سجل الرواتب المدفوعة</h2>
    `;
    printContent.appendChild(header);
    
    // إضافة التاريخ
    const dateElement = document.createElement('div');
    dateElement.className = 'print-date';
    const currentDate = new Date();
    dateElement.textContent = `تاريخ الطباعة: ${currentDate.toLocaleDateString('ar-IQ')} - ${currentDate.toLocaleTimeString('ar-IQ')}`;
    printContent.appendChild(dateElement);
    
    // نسخ الجدول
    const tableClone = salaryTable.cloneNode(true);
    
    // التأكد من أن الجدول المنسوخ يحتوي على بيانات
    if (!tableClone.querySelector('tbody tr')) {
        console.warn('جدول الرواتب فارغ، سيتم إنشاء جدول جديد');
        if (window.salaryTransactions && window.salaryTransactions.length > 0) {
            return createSalaryTableFromData();
        }
    }
    
    // إضافة ترقيم للصفوف
    const rows = tableClone.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
        // إضافة خلية لرقم الصف
        const numberCell = document.createElement('td');
        numberCell.className = 'row-number';
        numberCell.textContent = index + 1;
        
        // إدراج خلية الترقيم في بداية الصف
        if (row.firstChild) {
            row.insertBefore(numberCell, row.firstChild);
        } else {
            row.appendChild(numberCell);
        }
    });
    
    // إضافة عمود الترقيم في ترويسة الجدول
    const headerRow = tableClone.querySelector('thead tr');
    if (headerRow) {
        const headerNumberCell = document.createElement('th');
        headerNumberCell.textContent = '#';
        headerRow.insertBefore(headerNumberCell, headerRow.firstChild);
    }
    
    // التأكد من أن العناصر المخفية في الجدول الأصلي ستظهر في الطباعة
    tableClone.querySelectorAll('.employee-actions, .action-column').forEach(elem => {
        elem.style.display = 'none';
    });
    
    // إضافة تذييل للجدول يحتوي على إجماليات
    addTableFooter(tableClone);
    
    // إضافة الجدول إلى محتوى الطباعة
    printContent.appendChild(tableClone);
    
    // إضافة تذييل الصفحة
    const footer = document.createElement('div');
    footer.className = 'print-footer';
    footer.innerHTML = 'جميع الحقوق محفوظة © نظام الاستثمار المتكامل ' + new Date().getFullYear();
    printContent.appendChild(footer);
    
    // إضافة محتوى الطباعة إلى الصفحة بشكل مرئي للتصحيح
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.appendChild(printContent);
    
    // نجعل محتوى الطباعة مرئيًا خلال عملية التصحيح
    document.body.appendChild(printContainer);
    printContainer.style.position = 'fixed';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.right = '0';
    printContainer.style.bottom = '0';
    printContainer.style.backgroundColor = '#fff';
    printContainer.style.zIndex = '9999';
    printContainer.style.overflow = 'auto';
    printContainer.style.padding = '20px';
    
    // إضافة زر للإغلاق
    const closeButton = document.createElement('button');
    closeButton.textContent = 'إغلاق';
    closeButton.style.position = 'fixed';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.zIndex = '10000';
    closeButton.style.padding = '5px 10px';
    closeButton.style.backgroundColor = '#f44336';
    closeButton.style.color = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    
    printContainer.appendChild(closeButton);
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(printContainer);
    });
    
    // زر الطباعة
    const printButton = document.createElement('button');
    printButton.textContent = 'طباعة';
    printButton.style.position = 'fixed';
    printButton.style.top = '10px';
    printButton.style.right = '80px';
    printButton.style.zIndex = '10000';
    printButton.style.padding = '5px 10px';
    printButton.style.backgroundColor = '#4CAF50';
    printButton.style.color = '#fff';
    printButton.style.border = 'none';
    printButton.style.borderRadius = '4px';
    printButton.style.cursor = 'pointer';
    
    printContainer.appendChild(printButton);
    
    printButton.addEventListener('click', () => {
        // إخفاء الأزرار قبل الطباعة
        closeButton.style.display = 'none';
        printButton.style.display = 'none';
        
        // طباعة المحتوى
        window.print();
        
        // إظهار الأزرار بعد الطباعة
        closeButton.style.display = 'block';
        printButton.style.display = 'block';
    });
}

/**
 * إنشاء جدول الرواتب من البيانات المخزنة
 */
function createSalaryTableFromData() {
    // التحقق من وجود بيانات الرواتب
    if (!window.salaryTransactions || window.salaryTransactions.length === 0) {
        // محاولة الوصول إلى مصفوفة الرواتب من مصدر آخر
        const salaries = window.salaries || window.salaryTransactions;
        
        if (!salaries || salaries.length === 0) {
            if (window.showNotification) {
                window.showNotification('لا توجد بيانات للرواتب متاحة للطباعة', 'warning');
            }
            return;
        }
    }
    
    // استخدام البيانات المتاحة
    const salaries = window.salaryTransactions || window.salaries;
    
    // إنشاء محتوى الطباعة
    const printContent = document.createElement('div');
    printContent.className = 'print-section';
    
    // إضافة ترويسة الطباعة
    const header = document.createElement('div');
    header.className = 'print-header';
    header.innerHTML = `
        <h1>نظام الاستثمار المتكامل</h1>
        <h2>سجل الرواتب المدفوعة</h2>
    `;
    printContent.appendChild(header);
    
    // إضافة التاريخ
    const dateElement = document.createElement('div');
    dateElement.className = 'print-date';
    const currentDate = new Date();
    dateElement.textContent = `تاريخ الطباعة: ${currentDate.toLocaleDateString('ar-IQ')} - ${currentDate.toLocaleTimeString('ar-IQ')}`;
    printContent.appendChild(dateElement);
    
    // إنشاء جدول جديد
    const table = document.createElement('table');
    table.className = 'salary-print-table';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    // إنشاء ترويسة الجدول
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // إضافة عناوين الأعمدة
    const columns = [
        '#',
        'المعرف',
        'الموظف',
        'تاريخ الصرف',
        'الراتب الأساسي',
        'المبيعات',
        'النسبة',
        'مبلغ العمولة',
        'العلاوات',
        'الاستقطاعات',
        'الراتب النهائي'
    ];
    
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        th.style.border = '1px solid #000';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f2f2f2';
        th.style.textAlign = 'right';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // إنشاء جسم الجدول
    const tbody = document.createElement('tbody');
    
    // إجماليات للحسابات
    let totalBaseSalary = 0;
    let totalSales = 0;
    let totalCommission = 0;
    let totalBonus = 0;
    let totalDeduction = 0;
    let totalSalary = 0;
    
    // إضافة صفوف البيانات
    salaries.forEach((salary, index) => {
        const row = document.createElement('tr');
        
        // ترقيم الصف
        const numCell = document.createElement('td');
        numCell.textContent = index + 1;
        numCell.style.border = '1px solid #000';
        numCell.style.padding = '8px';
        numCell.style.textAlign = 'center';
        row.appendChild(numCell);
        
        // إضافة خلايا البيانات
        const idCell = document.createElement('td');
        idCell.textContent = salary.id || '';
        idCell.style.border = '1px solid #000';
        idCell.style.padding = '8px';
        row.appendChild(idCell);
        
        const nameCell = document.createElement('td');
        nameCell.textContent = salary.employeeName || '';
        nameCell.style.border = '1px solid #000';
        nameCell.style.padding = '8px';
        row.appendChild(nameCell);
        
        const dateCell = document.createElement('td');
        dateCell.textContent = salary.date || '';
        dateCell.style.border = '1px solid #000';
        dateCell.style.padding = '8px';
        row.appendChild(dateCell);
        
        // راتب أساسي
        const baseSalary = parseFloat(salary.baseSalary) || 0;
        totalBaseSalary += baseSalary;
        const baseSalaryCell = document.createElement('td');
        baseSalaryCell.textContent = formatCurrency(baseSalary);
        baseSalaryCell.style.border = '1px solid #000';
        baseSalaryCell.style.padding = '8px';
        baseSalaryCell.style.textAlign = 'left';
        row.appendChild(baseSalaryCell);
        
        // المبيعات
        const sales = parseFloat(salary.sales) || 0;
        totalSales += sales;
        const salesCell = document.createElement('td');
        salesCell.textContent = formatCurrency(sales);
        salesCell.style.border = '1px solid #000';
        salesCell.style.padding = '8px';
        salesCell.style.textAlign = 'left';
        row.appendChild(salesCell);
        
        // النسبة
        const rateCell = document.createElement('td');
        rateCell.textContent = (salary.commissionRate || 0) + '%';
        rateCell.style.border = '1px solid #000';
        rateCell.style.padding = '8px';
        rateCell.style.textAlign = 'center';
        row.appendChild(rateCell);
        
        // مبلغ العمولة
        const commission = parseFloat(salary.commissionAmount) || 0;
        totalCommission += commission;
        const commissionCell = document.createElement('td');
        commissionCell.textContent = formatCurrency(commission);
        commissionCell.style.border = '1px solid #000';
        commissionCell.style.padding = '8px';
        commissionCell.style.textAlign = 'left';
        row.appendChild(commissionCell);
        
        // العلاوات
        const bonus = parseFloat(salary.bonuses) || 0;
        totalBonus += bonus;
        const bonusCell = document.createElement('td');
        bonusCell.textContent = formatCurrency(bonus);
        bonusCell.style.border = '1px solid #000';
        bonusCell.style.padding = '8px';
        bonusCell.style.textAlign = 'left';
        row.appendChild(bonusCell);
        
        // الاستقطاعات
        const deduction = parseFloat(salary.deductions) || 0;
        totalDeduction += deduction;
        const deductionCell = document.createElement('td');
        deductionCell.textContent = formatCurrency(deduction);
        deductionCell.style.border = '1px solid #000';
        deductionCell.style.padding = '8px';
        deductionCell.style.textAlign = 'left';
        row.appendChild(deductionCell);
        
        // الراتب النهائي
        const totalSalaryAmount = parseFloat(salary.totalSalary) || 0;
        totalSalary += totalSalaryAmount;
        const totalSalaryCell = document.createElement('td');
        totalSalaryCell.textContent = formatCurrency(totalSalaryAmount);
        totalSalaryCell.style.border = '1px solid #000';
        totalSalaryCell.style.padding = '8px';
        totalSalaryCell.style.textAlign = 'left';
        totalSalaryCell.style.fontWeight = 'bold';
        row.appendChild(totalSalaryCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // إضافة تذييل الجدول مع الإجماليات
    const tfoot = document.createElement('tfoot');
    const footerRow = document.createElement('tr');
    footerRow.style.backgroundColor = '#f2f2f2';
    footerRow.style.fontWeight = 'bold';
    
    // خلية الترقيم
    const footerNumCell = document.createElement('td');
    footerNumCell.style.border = '1px solid #000';
    footerNumCell.style.padding = '8px';
    footerRow.appendChild(footerNumCell);
    
    // خلية المعرف
    const footerIdCell = document.createElement('td');
    footerIdCell.style.border = '1px solid #000';
    footerIdCell.style.padding = '8px';
    footerRow.appendChild(footerIdCell);
    
    // خلية الإجمالي
    const footerLabelCell = document.createElement('td');
    footerLabelCell.textContent = 'الإجماليات';
    footerLabelCell.style.border = '1px solid #000';
    footerLabelCell.style.padding = '8px';
    footerLabelCell.style.textAlign = 'center';
    footerRow.appendChild(footerLabelCell);
    
    // خلية التاريخ
    const footerDateCell = document.createElement('td');
    footerDateCell.style.border = '1px solid #000';
    footerDateCell.style.padding = '8px';
    footerRow.appendChild(footerDateCell);
    
    // الراتب الأساسي
    const footerBaseSalaryCell = document.createElement('td');
    footerBaseSalaryCell.textContent = formatCurrency(totalBaseSalary);
    footerBaseSalaryCell.style.border = '1px solid #000';
    footerBaseSalaryCell.style.padding = '8px';
    footerBaseSalaryCell.style.textAlign = 'left';
    footerRow.appendChild(footerBaseSalaryCell);
    
    // المبيعات
    const footerSalesCell = document.createElement('td');
    footerSalesCell.textContent = formatCurrency(totalSales);
    footerSalesCell.style.border = '1px solid #000';
    footerSalesCell.style.padding = '8px';
    footerSalesCell.style.textAlign = 'left';
    footerRow.appendChild(footerSalesCell);
    
    // النسبة
    const footerRateCell = document.createElement('td');
    footerRateCell.style.border = '1px solid #000';
    footerRateCell.style.padding = '8px';
    footerRow.appendChild(footerRateCell);
    
    // مبلغ العمولة
    const footerCommissionCell = document.createElement('td');
    footerCommissionCell.textContent = formatCurrency(totalCommission);
    footerCommissionCell.style.border = '1px solid #000';
    footerCommissionCell.style.padding = '8px';
    footerCommissionCell.style.textAlign = 'left';
    footerRow.appendChild(footerCommissionCell);
    
    // العلاوات
    const footerBonusCell = document.createElement('td');
    footerBonusCell.textContent = formatCurrency(totalBonus);
    footerBonusCell.style.border = '1px solid #000';
    footerBonusCell.style.padding = '8px';
    footerBonusCell.style.textAlign = 'left';
    footerRow.appendChild(footerBonusCell);
    
    // الاستقطاعات
    const footerDeductionCell = document.createElement('td');
    footerDeductionCell.textContent = formatCurrency(totalDeduction);
    footerDeductionCell.style.border = '1px solid #000';
    footerDeductionCell.style.padding = '8px';
    footerDeductionCell.style.textAlign = 'left';
    footerRow.appendChild(footerDeductionCell);
    
    // الراتب النهائي
    const footerTotalSalaryCell = document.createElement('td');
    footerTotalSalaryCell.textContent = formatCurrency(totalSalary);
    footerTotalSalaryCell.style.border = '1px solid #000';
    footerTotalSalaryCell.style.padding = '8px';
    footerTotalSalaryCell.style.textAlign = 'left';
    footerRow.appendChild(footerTotalSalaryCell);
    
    tfoot.appendChild(footerRow);
    table.appendChild(tfoot);
    
    // إضافة الجدول إلى محتوى الطباعة
    printContent.appendChild(table);
    
    // إضافة تذييل الصفحة
    const footer = document.createElement('div');
    footer.className = 'print-footer';
    footer.innerHTML = 'جميع الحقوق محفوظة © نظام الاستثمار المتكامل ' + new Date().getFullYear();
    printContent.appendChild(footer);
    
    // إضافة محتوى الطباعة إلى الصفحة
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.style.position = 'fixed';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.right = '0';
    printContainer.style.bottom = '0';
    printContainer.style.backgroundColor = '#fff';
    printContainer.style.zIndex = '9999';
    printContainer.style.overflow = 'auto';
    printContainer.style.padding = '20px';
    
    printContainer.appendChild(printContent);
    document.body.appendChild(printContainer);
    
    // إضافة زر للإغلاق
    const closeButton = document.createElement('button');
    closeButton.textContent = 'إغلاق';
    closeButton.style.position = 'fixed';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.zIndex = '10000';
    closeButton.style.padding = '5px 10px';
    closeButton.style.backgroundColor = '#f44336';
    closeButton.style.color = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    
    printContainer.appendChild(closeButton);
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(printContainer);
    });
    
    // زر الطباعة
    const printButton = document.createElement('button');
    printButton.textContent = 'طباعة';
    printButton.style.position = 'fixed';
    printButton.style.top = '10px';
    printButton.style.right = '80px';
    printButton.style.zIndex = '10000';
    printButton.style.padding = '5px 10px';
    printButton.style.backgroundColor = '#4CAF50';
    printButton.style.color = '#fff';
    printButton.style.border = 'none';
    printButton.style.borderRadius = '4px';
    printButton.style.cursor = 'pointer';
    
    printContainer.appendChild(printButton);
    
    printButton.addEventListener('click', () => {
        // إخفاء الأزرار قبل الطباعة
        closeButton.style.display = 'none';
        printButton.style.display = 'none';
        
        // طباعة المحتوى
        window.print();
        
        // إظهار الأزرار بعد الطباعة
        closeButton.style.display = 'block';
        printButton.style.display = 'block';
    });
}

/**
 * إضافة تذييل للجدول يحتوي على إجماليات
 * @param {HTMLTableElement} table - جدول الرواتب
 */
function addTableFooter(table) {
    // إنشاء تذييل الجدول إذا لم يكن موجودًا
    let tfoot = table.querySelector('tfoot');
    if (!tfoot) {
        tfoot = document.createElement('tfoot');
        table.appendChild(tfoot);
    } else {
        // إزالة المحتوى الحالي للتذييل إذا كان موجودًا
        tfoot.innerHTML = '';
    }
    
    // إحصاء عدد الأعمدة
    const headerRow = table.querySelector('thead tr');
    if (!headerRow) {
        console.error('لا يمكن العثور على صف العناوين في الجدول');
        return;
    }
    
    const columns = headerRow.children.length;
    
    // حساب إجماليات المبالغ
    let totalBaseSalary = 0;
    let totalSales = 0;
    let totalCommission = 0;
    let totalBonus = 0;
    let totalDeduction = 0;
    let totalSalary = 0;
    
    // الحصول على جميع صفوف الجدول
    const rows = table.querySelectorAll('tbody tr');
    
    // ترتيب العناوين لتحديد مواقع الأعمدة بدقة
    const headers = Array.from(headerRow.children).map(th => th.textContent.trim());
    
    // تحديد فهارس الأعمدة (مع مراعاة وجود عمود الترقيم)
    const indexOffset = headers[0] === '#' ? 1 : 0;
    const baseSalaryIndex = headers.findIndex(h => h.includes('الراتب الأساسي')) + indexOffset;
    const salesIndex = headers.findIndex(h => h.includes('المبيعات')) + indexOffset;
    const commissionIndex = headers.findIndex(h => h.includes('مبلغ العمولة')) + indexOffset;
    const bonusIndex = headers.findIndex(h => h.includes('العلاوات')) + indexOffset;
    const deductionIndex = headers.findIndex(h => h.includes('الاستقطاعات')) + indexOffset;
    const totalSalaryIndex = headers.findIndex(h => h.includes('الراتب النهائي')) + indexOffset;
    
    // عملية متابعة لاكتشاف الفهارس
    console.log('فهارس الأعمدة:', {
        baseSalaryIndex,
        salesIndex,
        commissionIndex,
        bonusIndex,
        deductionIndex,
        totalSalaryIndex,
        headers
    });
    
    // تحديد الفهارس يدويًا إذا لم يتم العثور عليها
    const indices = {
        baseSalary: baseSalaryIndex !== -1 ? baseSalaryIndex : 4,
        sales: salesIndex !== -1 ? salesIndex : 5,
        commission: commissionIndex !== -1 ? commissionIndex : 7,
        bonus: bonusIndex !== -1 ? bonusIndex : 8,
        deduction: deductionIndex !== -1 ? deductionIndex : 9,
        totalSalary: totalSalaryIndex !== -1 ? totalSalaryIndex : 10
    };
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= indices.totalSalary) {
            // استخراج القيم من الخلايا
            totalBaseSalary += parseFloat(extractNumber(cells[indices.baseSalary]?.textContent)) || 0;
            totalSales += parseFloat(extractNumber(cells[indices.sales]?.textContent)) || 0;
            totalCommission += parseFloat(extractNumber(cells[indices.commission]?.textContent)) || 0;
            totalBonus += parseFloat(extractNumber(cells[indices.bonus]?.textContent)) || 0;
            totalDeduction += parseFloat(extractNumber(cells[indices.deduction]?.textContent)) || 0;
            totalSalary += parseFloat(extractNumber(cells[indices.totalSalary]?.textContent)) || 0;
        }
    });
    
    // إنشاء صف التذييل
    const footerRow = document.createElement('tr');
    footerRow.style.backgroundColor = '#f2f2f2';
    footerRow.style.fontWeight = 'bold';
    
    // إضافة خلايا فارغة للمعرف والاسم والمعلومات الأخرى
    const emptyColumns = Math.min(3, indexOffset);
    for (let i = 0; i < emptyColumns; i++) {
        const emptyCell = document.createElement('td');
        footerRow.appendChild(emptyCell);
    }
    
    // إضافة خلية "الإجمالي"
    const totalLabelCell = document.createElement('td');
    totalLabelCell.setAttribute('colspan', Math.max(3, indexOffset));
    totalLabelCell.textContent = 'الإجماليات:';
    totalLabelCell.style.fontWeight = 'bold';
    totalLabelCell.style.textAlign = 'center';
    footerRow.appendChild(totalLabelCell);
    
    // تحديد عدد الخلايا الفارغة بين عنوان الإجمالي وأول قيمة
    const cellsToBaseSalary = Math.max(0, indices.baseSalary - (emptyColumns + 1));
    for (let i = 0; i < cellsToBaseSalary; i++) {
        footerRow.appendChild(document.createElement('td'));
    }
    
    // إضافة خلايا الإجماليات
    // الراتب الأساسي
    const baseSalaryCell = document.createElement('td');
    baseSalaryCell.textContent = formatCurrency(totalBaseSalary);
    baseSalaryCell.style.fontWeight = 'bold';
    footerRow.appendChild(baseSalaryCell);
    
    // ملء الخلايا بين الراتب الأساسي والمبيعات
    const cellsToSales = Math.max(0, indices.sales - indices.baseSalary - 1);
    for (let i = 0; i < cellsToSales; i++) {
        footerRow.appendChild(document.createElement('td'));
    }
    
    // المبيعات
    const salesCell = document.createElement('td');
    salesCell.textContent = formatCurrency(totalSales);
    salesCell.style.fontWeight = 'bold';
    footerRow.appendChild(salesCell);
    
    // ملء الخلايا بين المبيعات ومبلغ العمولة (بما في ذلك خلية النسبة)
    const cellsToCommission = Math.max(0, indices.commission - indices.sales - 1);
    for (let i = 0; i < cellsToCommission; i++) {
        footerRow.appendChild(document.createElement('td'));
    }
    
    // مبلغ العمولة
    const commissionCell = document.createElement('td');
    commissionCell.textContent = formatCurrency(totalCommission);
    commissionCell.style.fontWeight = 'bold';
    footerRow.appendChild(commissionCell);
    
    // ملء الخلايا بين مبلغ العمولة والعلاوات
    const cellsToBonus = Math.max(0, indices.bonus - indices.commission - 1);
    for (let i = 0; i < cellsToBonus; i++) {
        footerRow.appendChild(document.createElement('td'));
    }
    
    // العلاوات
    const bonusCell = document.createElement('td');
    bonusCell.textContent = formatCurrency(totalBonus);
    bonusCell.style.fontWeight = 'bold';
    footerRow.appendChild(bonusCell);
    
    // ملء الخلايا بين العلاوات والاستقطاعات
    const cellsToDeduction = Math.max(0, indices.deduction - indices.bonus - 1);
    for (let i = 0; i < cellsToDeduction; i++) {
        footerRow.appendChild(document.createElement('td'));
    }
    
    // الاستقطاعات
    const deductionCell = document.createElement('td');
    deductionCell.textContent = formatCurrency(totalDeduction);
    deductionCell.style.fontWeight = 'bold';
    footerRow.appendChild(deductionCell);
    
    // ملء الخلايا بين الاستقطاعات والراتب النهائي
    const cellsToTotalSalary = Math.max(0, indices.totalSalary - indices.deduction - 1);
    for (let i = 0; i < cellsToTotalSalary; i++) {
        footerRow.appendChild(document.createElement('td'));
    }
    
    // الراتب النهائي
    const totalSalaryCell = document.createElement('td');
    totalSalaryCell.textContent = formatCurrency(totalSalary);
    totalSalaryCell.style.fontWeight = 'bold';
    footerRow.appendChild(totalSalaryCell);
    
    // إضافة خلايا فارغة للإجراءات والأعمدة المتبقية
    const remainingCells = columns - footerRow.children.length;
    for (let i = 0; i < remainingCells; i++) {
        footerRow.appendChild(document.createElement('td'));
    }
    
    // إضافة صف التذييل إلى تذييل الجدول
    tfoot.appendChild(footerRow);
}

/**
 * استخراج الرقم من النص
 * @param {string} text - النص المحتوي على الرقم
 * @returns {number} - الرقم المستخرج
 */
function extractNumber(text) {
    if (!text) return 0;
    // استخراج الأرقام من النص (إزالة الفواصل والعملة)
    const matches = text.replace(/[^\d.-]/g, '').match(/-?\d+(\.\d+)?/);
    return matches ? parseFloat(matches[0]) : 0;
}

/**
 * تنسيق المبلغ المالي
 * @param {number} amount - المبلغ
 * @returns {string} - المبلغ المنسق
 */
function formatCurrency(amount) {
    // استخدام دالة تنسيق العملة الموجودة في التطبيق إذا كانت متاحة
    if (typeof window.formatCurrency === 'function') {
        return window.formatCurrency(amount);
    }
    
    // تنسيق افتراضي إذا لم تكن الدالة متاحة
    return amount.toLocaleString('ar-IQ') + ' دينار';
}

// إضافة زر الطباعة عند تحميل صفحة الموظفين
document.addEventListener('page:change', function(e) {
    if (e.detail && e.detail.page === 'employees') {
        // انتظار تحميل تبويب سجل الرواتب
        setTimeout(() => {
            addPrintSalariesButton();
        }, 500);
    }
});

// إضافة مستمع لتحديث زر الطباعة عند تغيير التبويبات
document.body.addEventListener('click', function(e) {
    const tabButton = e.target.closest('#employees-page .tab-btn');
    if (tabButton && tabButton.getAttribute('data-tab') === 'salary-transactions') {
        // انتظار تحميل تبويب سجل الرواتب
        setTimeout(() => {
            addPrintSalariesButton();
        }, 300);
    }
});