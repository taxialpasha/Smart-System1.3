/**
 * دالة تنسيق المبالغ المالية
 * تقوم بتحويل الأرقام إلى صيغة مقروءة مع إضافة النقاط بين كل ثلاثة أرقام
 * مثال: 10000000 -> 10.000.000
 * @param {number} amount - المبلغ المراد تنسيقه
 * @param {boolean} addCurrency - إضافة عملة النظام (اختياري، افتراضيًا true)
 * @returns {string} - المبلغ بعد التنسيق
 */
function formatCurrency(amount, addCurrency = true) {
    // التأكد من أن المبلغ رقم
    if (amount === null || amount === undefined || isNaN(amount)) {
        amount = 0;
    }
    
    // تقريب المبلغ إلى رقمين عشريين إذا كان يحتوي على كسور
    amount = parseFloat(amount);
    if (amount % 1 !== 0) {
        amount = amount.toFixed(2);
    }
    
    // تحويل المبلغ إلى نص وإضافة النقاط بين كل ثلاثة أرقام
    const parts = amount.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // إعادة المبلغ مع إضافة العملة إذا تم طلب ذلك
    const formattedAmount = parts.join(',');
    return addCurrency ? `${formattedAmount} ${settings.currency}` : formattedAmount;
}

/**
 * تطبيق التنسيق الجديد على جميع المبالغ في التطبيق
 */
function applyFormatCurrencyEverywhere() {
    // استبدال جميع استخدامات toLocaleString() في التطبيق
    // بالدالة الجديدة formatCurrency
    
    // تحديث دالة renderInvestorsTable
    window.originalRenderInvestorsTable = window.renderInvestorsTable;
    window.renderInvestorsTable = function() {
        console.log('عرض جدول المستثمرين (بالتنسيق الجديد)...');
        
        const tableBody = document.querySelector('#investors-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        // ترتيب المستثمرين حسب تاريخ الإضافة (الأحدث أولاً)
        const sortedInvestors = [...investors].sort((a, b) => {
            return new Date(b.createdAt || b.joinDate) - new Date(a.createdAt || a.joinDate);
        });
        
        sortedInvestors.forEach(investor => {
            const row = document.createElement('tr');
            
            // حساب الربح الشهري
            let monthlyProfit = 0;
            if (investor.investments && Array.isArray(investor.investments)) {
                monthlyProfit = investor.investments.reduce((total, inv) => {
                    return total + calculateInterest(inv.amount, inv.date);
                }, 0);
            } else {
                monthlyProfit = calculateInterest(investor.amount, investor.joinDate || investor.createdAt);
            }
            
            // تنسيق تاريخ الانضمام
            const joinDate = investor.joinDate || investor.createdAt || '';
            
            row.innerHTML = `
                <td>${investor.id}</td>
                <td>
                    <div class="investor-info">
                        <div class="investor-avatar">${investor.name.charAt(0)}</div>
                        <div>
                            <div class="investor-name">${investor.name}</div>
                            <div class="investor-phone">${investor.phone}</div>
                        </div>
                    </div>
                </td>
                <td>${investor.phone}</td>
                <td>${formatCurrency(investor.amount || 0)}</td>
                <td>${formatCurrency(monthlyProfit)}</td>
                <td>${joinDate}</td>
                <td><span class="badge badge-success">نشط</span></td>
                <td>
                    <div class="investor-actions">
                        <button class="investor-action-btn view-investor" data-id="${investor.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="investor-action-btn edit edit-investor" data-id="${investor.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="investor-action-btn delete delete-investor" data-id="${investor.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمعي الأحداث للأزرار
            const viewButton = row.querySelector('.view-investor');
            const editButton = row.querySelector('.edit-investor');
            const deleteButton = row.querySelector('.delete-investor');
            
            if (viewButton) {
                viewButton.addEventListener('click', () => {
                    showInvestorDetails(investor.id);
                });
            }
            
            if (editButton) {
                editButton.addEventListener('click', () => {
                    editInvestor(investor.id);
                });
            }
            
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    deleteInvestor(investor.id);
                });
            }
        });
    };
    
    // إضافة الكود الخاص بتفعيل التنسيق الجديد عند تحميل الصفحة
    console.log('تطبيق التنسيق الجديد على جميع المبالغ المالية في التطبيق...');
}

/**
 * تفعيل تنسيق المبالغ المالية عند تحميل الصفحة
 */
document.addEventListener('DOMContentLoaded', function() {
    // إضافة دالة تنسيق المبالغ للنافذة لاستخدامها في جميع أنحاء التطبيق
    window.formatCurrency = formatCurrency;
    
    // تطبيق التنسيق الجديد على جميع المبالغ في التطبيق
    applyFormatCurrencyEverywhere();
});
    
    // تحديث دالة searchTransactions
    window.originalSearchTransactions = window.searchTransactions;
    window.searchTransactions = function(query) {
        console.log(`البحث في العمليات (بالتنسيق الجديد): ${query}`);
        
        query = query.trim().toLowerCase();
        
        if (!query) {
            // إذا كان البحث فارغًا، نعيد عرض جميع العمليات
            renderTransactionsTable();
            return;
        }
        
        // تصفية العمليات حسب البحث
        const filtered = transactions.filter(transaction => {
            return transaction.id.toLowerCase().includes(query) ||
                   transaction.investorName.toLowerCase().includes(query) ||
                   transaction.type.toLowerCase().includes(query) ||
                   transaction.date.toLowerCase().includes(query) ||
                   transaction.amount.toString().includes(query);
        });
        
        // عرض العمليات المصفّاة في الجدول
        const tableBody = document.querySelector('#transactions-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (filtered.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="7" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // عرض العمليات المصفّاة
        filtered.forEach(transaction => {
            const row = document.createElement('tr');
            
            // تحديد نوع العملية وأيقونتها
            let typeClass = '';
            let typeIcon = '';
            
            switch(transaction.type) {
                case 'إيداع':
                    typeClass = 'success';
                    typeIcon = '<i class="fas fa-arrow-up"></i>';
                    break;
                case 'سحب':
                    typeClass = 'danger';
                    typeIcon = '<i class="fas fa-arrow-down"></i>';
                    break;
                case 'دفع أرباح':
                    typeClass = 'info';
                    typeIcon = '<i class="fas fa-hand-holding-usd"></i>';
                    break;
                default:
                    typeClass = 'primary';
                    typeIcon = '<i class="fas fa-exchange-alt"></i>';
            }
            
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.investorName}</td>
                <td>
                    <span class="badge badge-${typeClass}">${typeIcon} ${transaction.type}</span>
                </td>
                <td>${transaction.date}</td>
                <td>${formatCurrency(transaction.amount)}</td>
                <td>${transaction.balanceAfter ? formatCurrency(transaction.balanceAfter) : '-'}</td>
                <td>
                    <button class="btn btn-outline btn-sm transaction-details" data-id="${transaction.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمع الحدث لزر التفاصيل
            const detailsButton = row.querySelector('.transaction-details');
            if (detailsButton) {
                detailsButton.addEventListener('click', () => {
                    showTransactionDetails(transaction.id);
                });
            }
        });
    };
    
            tableBody.appendChild(row);
            
            // إضافة مستمعي الأحداث للأزرار
            const viewButton = row.querySelector('.view-investor');
            const editButton = row.querySelector('.edit-investor');
            const deleteButton = row.querySelector('.delete-investor');
            
            if (viewButton) {
                viewButton.addEventListener('click', () => {
                    showInvestorDetails(investor.id);
                });
            
            profitBreakdown += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>إجمالي الربح</strong></td>
                            <td><strong>${formatCurrency(totalProfit, true)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            `;
            
            profitDetails.innerHTML = profitBreakdown;
        } else {
            profitDetails.innerHTML = '<p>لم يتم العثور على بيانات المستثمر</p>';
        }
    
    
    // تحديث دالة showInvestorBalance
    window.originalShowInvestorBalance = window.showInvestorBalance;
    window.showInvestorBalance = function() {
        console.log('عرض رصيد المستثمر (بالتنسيق الجديد)...');
        
        const withdrawInvestorSelect = document.getElementById('withdraw-investor');
        const balanceInfo = document.getElementById('withdraw-balance-info');
        
        if (!withdrawInvestorSelect || !balanceInfo) return;
        
        const investorId = withdrawInvestorSelect.value;
        
        if (!investorId) {
            balanceInfo.innerHTML = '';
            return;
        }
        
        const investor = investors.find(inv => inv.id === investorId);
        if (!investor) {
            balanceInfo.innerHTML = '';
            return;
        }
        
        const totalInvestment = investor.amount || getTotalInvestmentForInvestor(investorId);
        balanceInfo.innerHTML = `
            <label class="form-label">الرصيد المتاح</label>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color); margin-bottom: 1rem;">
                ${formatCurrency(totalInvestment, true)}
            </div>
        `;
    };
    
    // تحديث دالة filterTransactions
    window.originalFilterTransactions = window.filterTransactions;
    window.filterTransactions = function(filterType) {
        console.log(`تصفية العمليات حسب النوع (بالتنسيق الجديد): ${filterType}`);
        
        let filteredTransactions = [...transactions];
        
        switch (filterType) {
            case 'الكل':
                // لا نقوم بأي تصفية
                break;
            case 'إيداع':
                filteredTransactions = filteredTransactions.filter(tr => tr.type === 'إيداع');
                break;
            case 'سحب':
                filteredTransactions = filteredTransactions.filter(tr => tr.type === 'سحب');
                break;
            case 'أرباح':
            case 'دفع أرباح':
                filteredTransactions = filteredTransactions.filter(tr => tr.type === 'دفع أرباح');
                break;
        }
        
        // تحديث جدول العمليات
        const tableBody = document.querySelector('#transactions-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        // ترتيب العمليات حسب التاريخ (الأحدث أولاً)
        filteredTransactions.sort((a, b) => {
            return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
        });
        
        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            // تحديد نوع العملية وأيقونتها
            let typeClass = '';
            let typeIcon = '';
            
            switch(transaction.type) {
                case 'إيداع':
                    typeClass = 'success';
                    typeIcon = '<i class="fas fa-arrow-up"></i>';
                    break;
                case 'سحب':
                    typeClass = 'danger';
                    typeIcon = '<i class="fas fa-arrow-down"></i>';
                    break;
                case 'دفع أرباح':
                    typeClass = 'info';
                    typeIcon = '<i class="fas fa-hand-holding-usd"></i>';
                    break;
                default:
                    typeClass = 'primary';
                    typeIcon = '<i class="fas fa-exchange-alt"></i>';
            }
            
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.investorName}</td>
                <td>
                    <span class="badge badge-${typeClass}">${typeIcon} ${transaction.type}</span>
                </td>
                <td>${transaction.date}</td>
                <td>${formatCurrency(transaction.amount)}</td>
                <td>${transaction.balanceAfter ? formatCurrency(transaction.balanceAfter) : '-'}</td>
                <td>
                    <button class="btn btn-outline btn-sm transaction-details" data-id="${transaction.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمع الحدث لزر التفاصيل
            const detailsButton = row.querySelector('.transaction-details');
            if (detailsButton) {
                detailsButton.addEventListener('click', () => {
                    showTransactionDetails(transaction.id);
                });
            }
        });
        
        if (filteredTransactions.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" class="text-center">لا يوجد عمليات</td>';
            tableBody.appendChild(emptyRow);
        }
    };
    
    // تحديث دالة searchInvestors
    window.originalSearchInvestors = window.searchInvestors;
    window.searchInvestors = function(query) {
        console.log(`البحث في المستثمرين (بالتنسيق الجديد): ${query}`);
        
        query = query.trim().toLowerCase();
        
        if (!query) {
            // إذا كان البحث فارغًا، نعيد عرض جميع المستثمرين
            renderInvestorsTable();
            return;
        }
        
        // تصفية المستثمرين حسب البحث
        const filtered = investors.filter(investor => {
            return investor.name.toLowerCase().includes(query) ||
                   investor.phone.toLowerCase().includes(query) ||
                   (investor.address && investor.address.toLowerCase().includes(query)) ||
                   (investor.cardNumber && investor.cardNumber.toLowerCase().includes(query)) ||
                   investor.id.toLowerCase().includes(query);
        });
        
        // عرض المستثمرين المصفّين
        const tableBody = document.querySelector('#investors-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (filtered.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="8" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // عرض المستثمرين المصفّين
        filtered.forEach(investor => {
            const row = document.createElement('tr');
            
            // حساب الربح الشهري
            const monthlyProfit = investor.investments.reduce((total, inv) => {
                return total + calculateInterest(inv.amount, inv.date);
            }, 0);
            
            // تنسيق تاريخ الانضمام
            const joinDate = investor.joinDate || investor.createdAt || '';
            
            row.innerHTML = `
                <td>${investor.id}</td>
                <td>
                    <div class="investor-info">
                        <div class="investor-avatar">${investor.name.charAt(0)}</div>
                        <div>
                            <div class="investor-name">${investor.name}</div>
                            <div class="investor-phone">${investor.phone}</div>
                        </div>
                    </div>
                </td>
                <td>${investor.phone}</td>
                <td>${formatCurrency(investor.amount || 0)}</td>
                <td>${formatCurrency(monthlyProfit)}</td>
                <td>${joinDate}</td>
                <td><span class="badge badge-success">نشط</span></td>
                <td>
                    <div class="investor-actions">
                        <button class="investor-action-btn view-investor" data-id="${investor.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="investor-action-btn edit edit-investor" data-id="${investor.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="investor-action-btn delete delete-investor" data-id="${investor.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        });
            
            if (editButton) {
                editButton.addEventListener('click', () => {
                    editInvestor(investor.id);
                });
            }
            
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    deleteInvestor(investor.id);
                });
            }
        }
        
        if (sortedInvestors.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="8" class="text-center">لا يوجد مستثمرين</td>';
            tableBody.appendChild(emptyRow);
        }
    
    
    // تحديث دالة renderTransactionsTable
    window.originalRenderTransactionsTable = window.renderTransactionsTable;
    window.renderTransactionsTable = function() {
        console.log('عرض جدول العمليات (بالتنسيق الجديد)...');
        
        const tableBody = document.querySelector('#transactions-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        // ترتيب العمليات حسب التاريخ (الأحدث أولاً)
        const sortedTransactions = [...transactions].sort((a, b) => {
            return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
        });
        
        sortedTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            // تحديد نوع العملية وأيقونتها
            let typeClass = '';
            let typeIcon = '';
            
            switch(transaction.type) {
                case 'إيداع':
                    typeClass = 'success';
                    typeIcon = '<i class="fas fa-arrow-up"></i>';
                    break;
                case 'سحب':
                    typeClass = 'danger';
                    typeIcon = '<i class="fas fa-arrow-down"></i>';
                    break;
                case 'دفع أرباح':
                    typeClass = 'info';
                    typeIcon = '<i class="fas fa-hand-holding-usd"></i>';
                    break;
                default:
                    typeClass = 'primary';
                    typeIcon = '<i class="fas fa-exchange-alt"></i>';
            }
            
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.investorName}</td>
                <td>
                    <span class="badge badge-${typeClass}">${typeIcon} ${transaction.type}</span>
                </td>
                <td>${transaction.date}</td>
                <td>${formatCurrency(transaction.amount)}</td>
                <td>${transaction.balanceAfter ? formatCurrency(transaction.balanceAfter) : '-'}</td>
                <td>
                    <button class="btn btn-outline btn-sm transaction-details" data-id="${transaction.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمع الحدث لزر التفاصيل
            const detailsButton = row.querySelector('.transaction-details');
            if (detailsButton) {
                detailsButton.addEventListener('click', () => {
                    showTransactionDetails(transaction.id);
                });
            }
        });
        
        if (sortedTransactions.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" class="text-center">لا يوجد عمليات</td>';
            tableBody.appendChild(emptyRow);
        }
    };
    
    // تحديث دالة renderProfitsTable
    window.originalRenderProfitsTable = window.renderProfitsTable;
    window.renderProfitsTable = function() {
        console.log('عرض جدول الأرباح (بالتنسيق الجديد)...');
        
        const tableBody = document.querySelector('#profits-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        // حساب الأرباح المستحقة
        const dueProfits = [];
        
        investors.forEach(investor => {
            if (investor.status !== 'نشط' || !investor.investments || investor.investments.length === 0) return;
            
            const totalInvestment = investor.amount || 0;
            if (totalInvestment <= 0) return;
            
            // اختيار أقدم تاريخ استثمار
            const oldestInvestment = investor.investments.reduce((oldest, current) => {
                const oldestDate = oldest ? new Date(oldest.date) : new Date();
                const currentDate = new Date(current.date);
                return currentDate < oldestDate ? current : oldest;
            }, null);
            
            if (!oldestInvestment) return;
            
            const investmentDate = oldestInvestment.date;
            const today = new Date();
            const investmentStartDate = new Date(investmentDate);
            
            // حساب عدد أيام الاستثمار
            const days = Math.floor((today - investmentStartDate) / (1000 * 60 * 60 * 24));
            
            // حساب الربح المستحق
            const profit = investor.investments.reduce((total, inv) => {
                return total + calculateInterest(inv.amount, inv.date);
            }, 0);
            
            // تقدير تاريخ الاستحقاق (بعد 30 يوم من تاريخ الاستثمار)
            const dueDate = new Date(investmentStartDate);
            dueDate.setDate(dueDate.getDate() + settings.profitCycle);
            
            dueProfits.push({
                investor: investor,
                investmentAmount: totalInvestment,
                investmentDate: investmentDate,
                days: days,
                profit: profit,
                dueDate: dueDate
            });
        });
        
        // ترتيب الأرباح حسب تاريخ الاستحقاق (الأقرب أولاً)
        dueProfits.sort((a, b) => a.dueDate - b.dueDate);
        
        // عرض الأرباح في الجدول
        dueProfits.forEach(item => {
            const row = document.createElement('tr');
            
            // تحديد حالة استحقاق الربح
            const today = new Date();
            const isDue = item.dueDate <= today;
            const daysToMaturity = Math.floor((item.dueDate - today) / (1000 * 60 * 60 * 24));
            
            let dueBadge = '';
            if (isDue) {
                dueBadge = '<span class="badge badge-danger">مستحق الآن</span>';
            } else if (daysToMaturity <= settings.reminderDays) {
                dueBadge = `<span class="badge badge-warning">بعد ${daysToMaturity} يوم</span>`;
            }
            
            row.innerHTML = `
                <td>
                    <div class="investor-info">
                        <div class="investor-avatar">${item.investor.name.charAt(0)}</div>
                        <div>
                            <div class="investor-name">${item.investor.name}</div>
                            <div class="investor-id">${item.investor.phone}</div>
                        </div>
                    </div>
                </td>
                <td>${formatCurrency(item.investmentAmount)}</td>
                <td>${item.investmentDate}</td>
                <td>${item.days} يوم</td>
                <td>${formatCurrency(item.profit)}</td>
                <td>${item.dueDate.toISOString().split('T')[0]} ${dueBadge}</td>
                <td>
                    <button class="btn btn-success btn-sm pay-profit-btn" data-id="${item.investor.id}">
                        <i class="fas fa-coins"></i>
                        <span>دفع الأرباح</span>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمع الحدث لزر دفع الأرباح
            const payProfitBtn = row.querySelector('.pay-profit-btn');
            if (payProfitBtn) {
                payProfitBtn.addEventListener('click', function() {
                    const investorId = this.getAttribute('data-id');
                    const profitInvestorSelect = document.getElementById('profit-investor');
                    if (profitInvestorSelect) {
                        profitInvestorSelect.value = investorId;
                        calculateProfitForInvestor();
                        openModal('pay-profit-modal');
                    }
                });
            }
        });
        
        if (dueProfits.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" class="text-center">لا يوجد أرباح مستحقة</td>';
            tableBody.appendChild(emptyRow);
        }
    };
    
    // تحديث دالة renderRecentTransactions
    window.originalRenderRecentTransactions = window.renderRecentTransactions;
    window.renderRecentTransactions = function() {
        console.log('عرض آخر العمليات (بالتنسيق الجديد)...');
        
        const tableBody = document.querySelector('#recent-transactions tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';

        // عرض أحدث 5 عمليات فقط
        const recent = [...transactions].sort((a, b) => {
            return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
        }).slice(0, 5);

        recent.forEach(tr => {
            // تحديد نوع العملية وأيقونتها
            let statusClass = 'active';
            
            switch(tr.type) {
                case 'إيداع':
                    statusClass = 'success';
                    break;
                case 'سحب':
                    statusClass = 'warning';
                    break;
                case 'دفع أرباح':
                    statusClass = 'info';
                    break;
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tr.id}</td>
                <td>${tr.investorName}</td>
                <td>${tr.type}</td>
                <td>${tr.date}</td>
                <td>${formatCurrency(tr.amount)}</td>
                <td><span class="status status-${statusClass}">مكتمل</span></td>
                <td>
                    <button class="btn btn-outline btn-sm transaction-details" data-id="${tr.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
            
            // إضافة مستمع الحدث لزر التفاصيل
            const detailsButton = row.querySelector('.transaction-details');
            if (detailsButton) {
                detailsButton.addEventListener('click', () => {
                    showTransactionDetails(tr.id);
                });
            }
        });
        
        if (recent.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" class="text-center">لا يوجد عمليات حديثة</td>';
            tableBody.appendChild(emptyRow);
        }
    };
    
    // تحديث دالة updateDashboard
    window.originalUpdateDashboard = window.updateDashboard;
    window.updateDashboard = function() {
        console.log('تحديث لوحة التحكم (بالتنسيق الجديد)...');
        
        // تحديث إجمالي الاستثمارات
        const totalInvestments = investors.reduce((sum, investor) => sum + (investor.amount || 0), 0);
        const totalInvestmentsElement = document.getElementById('total-investments');
        if (totalInvestmentsElement) {
            totalInvestmentsElement.textContent = formatCurrency(totalInvestments);
        }
        
        // تحديث الأرباح الشهرية
        const monthlyProfits = calculateMonthlyProfits();
        const monthlyProfitsElement = document.getElementById('monthly-profits');
        if (monthlyProfitsElement) {
            monthlyProfitsElement.textContent = formatCurrency(monthlyProfits);
        }
        
        // تحديث عدد المستثمرين
        const investorsCountElement = document.getElementById('investors-count');
        if (investorsCountElement) {
            investorsCountElement.textContent = investors.length;
        }
        
        // تحديث نسبة العائد
        const interestRateElement = document.getElementById('interest-rate');
        if (interestRateElement) {
            interestRateElement.textContent = `${settings.interestRate}%`;
        }
        
        // تحديث الرسوم البيانية
        updateCharts();
    };
    
    // تحديث دالة showInvestorDetails
    window.originalShowInvestorDetails = window.showInvestorDetails;
    window.showInvestorDetails = function(investorId) {
        console.log(`عرض تفاصيل المستثمر (بالتنسيق الجديد): ${investorId}`);
        
        const investor = investors.find(inv => inv.id === investorId);
        if (!investor) {
            showNotification('لم يتم العثور على المستثمر', 'error');
            return;
        }
        
        // حساب القيم المطلوبة
        const totalInvestment = investor.amount || 0;
        const monthlyProfit = investor.investments.reduce((total, inv) => {
            return total + calculateInterest(inv.amount, inv.date);
        }, 0);
        
        // حساب مدة الاستثمار
        const startDate = new Date(investor.joinDate || investor.createdAt);
        const today = new Date();
        const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        
        // الحصول على عمليات المستثمر
        const investorTransactions = transactions.filter(tr => tr.investorId === investorId);
        
        // إنشاء محتوى النافذة المنبثقة
        const content = `
            <div class="investor-profile">
                <div class="investor-avatar large">${investor.name.charAt(0)}</div>
                <h2 class="investor-fullname">${investor.name}</h2>
                <span class="badge badge-success">${investor.status || 'نشط'}</span>
            </div>
            
            <div class="investor-stats">
                <div class="stat-item">
                    <div class="stat-value">${formatCurrency(totalInvestment)}</div>
                    <div class="stat-label">إجمالي الاستثمار</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${formatCurrency(monthlyProfit)}</div>
                    <div class="stat-label">الربح الشهري</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${daysPassed} يوم</div>
                    <div class="stat-label">مدة الاستثمار</div>
                </div>
            </div>
            
            <div class="detail-group">
                <h3 class="detail-group-title">معلومات الاتصال</h3>
                <div class="detail-item">
                    <div class="detail-label">رقم الهاتف</div>
                    <div class="detail-value">${investor.phone}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">العنوان</div>
                    <div class="detail-value">${investor.address || 'غير محدد'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">رقم البطاقة</div>
                    <div class="detail-value">${investor.cardNumber || 'غير محدد'}</div>
                </div>
            </div>
            
            <div class="detail-group">
                <h3 class="detail-group-title">آخر العمليات</h3>
                <div class="mini-table-container">
                    <table class="mini-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>النوع</th>
                                <th>المبلغ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${investorTransactions.length > 0 ? 
                                investorTransactions.slice(0, 5).map(tr => `
                                    <tr>
                                        <td>${tr.date}</td>
                                        <td>${tr.type}</td>
                                        <td>${formatCurrency(tr.amount)}</td>
                                    </tr>
                                `).join('') : 
                                '<tr><td colspan="3">لا توجد عمليات</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="investor-actions-big">
                <button class="btn btn-primary" onclick="editInvestor('${investorId}')">
                    <i class="fas fa-edit"></i> تعديل البيانات
                </button>
                <button class="btn btn-success" onclick="openProfitModal('${investorId}')">
                    <i class="fas fa-coins"></i> دفع الأرباح
                </button>
                <button class="btn btn-danger" onclick="deleteInvestor('${investorId}')">
                    <i class="fas fa-trash"></i> حذف المستثمر
                </button>
            </div>
        `;
        
        // عرض النافذة المنبثقة
        showModal(`تفاصيل المستثمر - ${investor.name}`, content);
    };
    
    // تحديث دالة showTransactionDetails
    window.originalShowTransactionDetails = window.showTransactionDetails;
    window.showTransactionDetails = function(transactionId) {
        console.log(`عرض تفاصيل العملية (بالتنسيق الجديد): ${transactionId}`);
        
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) {
            showNotification('لم يتم العثور على العملية', 'error');
            return;
        }
        
        const investor = investors.find(i => i.id === transaction.investorId);
        const investorName = investor ? investor.name : transaction.investorName || 'غير معروف';
        
        let typeClass = '';
        switch(transaction.type) {
            case 'إيداع':
                typeClass = 'success';
                break;
            case 'سحب':
                typeClass = 'danger';
                break;
            case 'دفع أرباح':
                typeClass = 'info';
                break;
            default:
                typeClass = 'primary';
        }
        
        // إنشاء محتوى النافذة المنبثقة
        const content = `
            <div class="transaction-details">
                <div class="transaction-header">
                    <span class="badge badge-${typeClass}">${transaction.type}</span>
                    <span class="transaction-date">${transaction.date}</span>
                </div>
                <div class="transaction-body">
                    <div class="detail-item">
                        <div class="detail-label">رقم العملية</div>
                        <div class="detail-value">${transaction.id}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">المستثمر</div>
                        <div class="detail-value">${investorName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">نوع العملية</div>
                        <div class="detail-value">${transaction.type}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">تاريخ العملية</div>
                        <div class="detail-value">${transaction.date}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">المبلغ</div>
                        <div class="detail-value">${formatCurrency(transaction.amount)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">الرصيد بعد العملية</div>
                        <div class="detail-value">${transaction.balanceAfter ? formatCurrency(transaction.balanceAfter) : '-'}</div>
                    </div>
                    ${transaction.notes ? `
                    <div class="detail-item">
                        <div class="detail-label">ملاحظات</div>
                        <div class="detail-value">${transaction.notes}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // عرض النافذة المنبثقة
        showModal('تفاصيل العملية', content);
    };
    
    // تحديث دالة calculateProfitForInvestor
    window.originalCalculateProfitForInvestor = window.calculateProfitForInvestor;
    window.calculateProfitForInvestor = function() {
        console.log('حساب الأرباح للمستثمر (بالتنسيق الجديد)...');
        
        const investorSelect = document.getElementById('profit-investor');
        if (!investorSelect) return;
        
        const investorId = investorSelect.value;
        const profitDetails = document.getElementById('profit-details');
        
        if (!investorId || !profitDetails) {
            if (profitDetails) profitDetails.innerHTML = '';
            return;
        }
        
        const investor = investors.find(inv => inv.id === investorId);
        
        if (investor) {
            let totalProfit = 0;
            let profitBreakdown = `
                <div class="section">
                    <h3 class="section-title">تفاصيل الأرباح</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>المبلغ</th>
                                <th>تاريخ الإيداع</th>
                                <th>أيام الاستثمار</th>
                                <th>الربح</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            investor.investments.forEach(inv => {
                const start = new Date(inv.date);
                const today = new Date();
                const days = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
                const profit = calculateInterest(inv.amount, inv.date, today.toISOString().split('T')[0]);
                
                totalProfit += profit;
                profitBreakdown += `
                    <tr>
                        <td>${formatCurrency(inv.amount, true)}</td>
                        <td>${inv.date}</td>
                        <td>${days} يوم</td>
                        <td>${formatCurrency(profit, true)}</td>
                    </tr>
                `;
            });

        }
        }