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

/**
 * إضافة أنماط CSS للطباعة
 */
function addPrintStyles() {
    // التحقق من عدم وجود الأنماط مسبقاً
    if (document.getElementById('print-salaries-styles')) return;
    
    // إنشاء عنصر نمط
    const styleElement = document.createElement('style');
    styleElement.id = 'print-salaries-styles';
    
    // إضافة أنماط CSS للطباعة
    styleElement.textContent = `
        @media print {
            /* إخفاء العناصر غير الضرورية عند الطباعة */
            body * {
                visibility: hidden;
            }
            
            /* إظهار فقط جدول الرواتب وعناصره */
            .print-section, .print-section * {
                visibility: visible;
            }
            
            /* وضع جدول الرواتب في بداية الصفحة */
            .print-section {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
            
            /* تنسيق الجدول للطباعة */
            .print-header {
                text-align: center;
                margin-bottom: 20px;
            }
            
            .print-header h1 {
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
    // الحصول على جدول الرواتب
    const salaryTable = document.getElementById('salary-transactions-table');
    if (!salaryTable) {
        console.error('لم يتم العثور على جدول الرواتب');
        if (window.showNotification) {
            window.showNotification('لم يتم العثور على جدول الرواتب', 'error');
        }
        return;
    }
    
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
    
    // إضافة تذييل للجدول يحتوي على إجماليات
    addTableFooter(tableClone);
    
    // إضافة الجدول إلى محتوى الطباعة
    printContent.appendChild(tableClone);
    
    // إضافة تذييل الصفحة
    const footer = document.createElement('div');
    footer.className = 'print-footer';
    footer.innerHTML = 'جميع الحقوق محفوظة © نظام الاستثمار المتكامل ' + new Date().getFullYear();
    printContent.appendChild(footer);
    
    // إضافة محتوى الطباعة إلى الصفحة (سيتم إخفاؤه تلقائياً بعد الطباعة)
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.style.display = 'none'; // إخفاء في العرض العادي
    printContainer.appendChild(printContent);
    document.body.appendChild(printContainer);
    
    // تنفيذ الطباعة
    setTimeout(() => {
        window.print();
        
        // إزالة محتوى الطباعة بعد الانتهاء
        setTimeout(() => {
            document.body.removeChild(printContainer);
        }, 1000);
    }, 500);
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
    }
    
    // إحصاء عدد الأعمدة
    const columns = table.querySelector('thead tr').children.length;
    
    // حساب إجماليات المبالغ
    let totalBaseSalary = 0;
    let totalSales = 0;
    let totalCommission = 0;
    let totalBonus = 0;
    let totalDeduction = 0;
    let totalSalary = 0;
    
    // الحصول على جميع صفوف الجدول
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        // تجاوز خلية الترقيم (التي أضفناها) لذلك نبدأ من الفهرس 4
        if (cells.length > 9) {
            // استخراج القيم من الخلايا (البحث عن الأعمدة المناسبة)
            totalBaseSalary += parseFloat(extractNumber(cells[4].textContent)) || 0;
            totalSales += parseFloat(extractNumber(cells[5].textContent)) || 0;
            totalCommission += parseFloat(extractNumber(cells[7].textContent)) || 0;
            totalBonus += parseFloat(extractNumber(cells[8].textContent)) || 0;
            totalDeduction += parseFloat(extractNumber(cells[9].textContent)) || 0;
            totalSalary += parseFloat(extractNumber(cells[10].textContent)) || 0;
        }
    });
    
    // إنشاء صف التذييل
    const footerRow = document.createElement('tr');
    
    // إضافة خلية فارغة للترقيم
    footerRow.appendChild(document.createElement('td'));
    
    // إضافة خلية "الإجمالي" تمتد على عدة أعمدة
    const totalLabelCell = document.createElement('td');
    totalLabelCell.setAttribute('colspan', '3');
    totalLabelCell.textContent = 'الإجماليات:';
    totalLabelCell.style.fontWeight = 'bold';
    totalLabelCell.style.textAlign = 'center';
    footerRow.appendChild(totalLabelCell);
    
    // إضافة خلايا الإجماليات
    const baseSalaryCell = document.createElement('td');
    baseSalaryCell.textContent = formatCurrency(totalBaseSalary);
    baseSalaryCell.style.fontWeight = 'bold';
    footerRow.appendChild(baseSalaryCell);
    
    const salesCell = document.createElement('td');
    salesCell.textContent = formatCurrency(totalSales);
    salesCell.style.fontWeight = 'bold';
    footerRow.appendChild(salesCell);
    
    // خلية نسبة العمولة - نتركها فارغة
    footerRow.appendChild(document.createElement('td'));
    
    const commissionCell = document.createElement('td');
    commissionCell.textContent = formatCurrency(totalCommission);
    commissionCell.style.fontWeight = 'bold';
    footerRow.appendChild(commissionCell);
    
    const bonusCell = document.createElement('td');
    bonusCell.textContent = formatCurrency(totalBonus);
    bonusCell.style.fontWeight = 'bold';
    footerRow.appendChild(bonusCell);
    
    const deductionCell = document.createElement('td');
    deductionCell.textContent = formatCurrency(totalDeduction);
    deductionCell.style.fontWeight = 'bold';
    footerRow.appendChild(deductionCell);
    
    const totalSalaryCell = document.createElement('td');
    totalSalaryCell.textContent = formatCurrency(totalSalary);
    totalSalaryCell.style.fontWeight = 'bold';
    footerRow.appendChild(totalSalaryCell);
    
    // خلية الإجراءات - نتركها فارغة
    footerRow.appendChild(document.createElement('td'));
    
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