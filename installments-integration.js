/**
 * ربط نظام الأقساط مع نظام الاستثمار الرئيسي 
 * يضيف خاصية تنبيه وتسديد الأقساط عند دفع الأرباح
 */

// تنفيذ الإدماج عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // تأخير التنفيذ قليلاً لضمان تحميل كافة العناصر
  setTimeout(() => {
    console.log("بدء تنفيذ ربط نظام الأقساط مع النظام الرئيسي...");
    
    // دمج وظائف الأقساط مع الصفحة الرئيسية
    integrateInstallmentsWithMainSystem();
    
    console.log("اكتمل ربط نظام الأقساط مع النظام الرئيسي");
  }, 1500);
});

/**
 * دمج وظائف الأقساط مع النظام الرئيسي
 * يربط وظائف الأقساط مع نافذة دفع الأرباح وتفاصيل المستثمر
 */
function integrateInstallmentsWithMainSystem() {
  // استبدال دالة calculateProfitForInvestor لإظهار الأقساط المستحقة
  enhanceCalculateProfitFunction();
  
  // استبدال دالة showInvestorDetails لإظهار الأقساط في تفاصيل المستثمر
  enhanceInvestorDetailsFunction();
  
  // إضافة مؤشرات حالة الأقساط في جدول المستثمرين
  addInstallmentsIndicatorToInvestorsTable();
  
  // إضافة مؤشرات حالة الأقساط في جدول الأرباح
  addInstallmentsIndicatorToProfitsTable();
}

/**
 * تحسين دالة حساب الأرباح لإظهار الأقساط المستحقة
 */
function enhanceCalculateProfitFunction() {
  // حفظ الدالة الأصلية
  if (typeof window.calculateProfitForInvestor === 'function') {
    window._originalCalculateProfitForInvestor = window.calculateProfitForInvestor;
    
    // استبدال الدالة بنسخة محسنة
    window.calculateProfitForInvestor = function() {
      // استدعاء الدالة الأصلية
      if (typeof window._originalCalculateProfitForInvestor === 'function') {
        window._originalCalculateProfitForInvestor();
      }
      
      // الحصول على اختيار المستثمر
      const investorSelect = document.getElementById('profit-investor');
      if (!investorSelect) return;
      
      const investorId = investorSelect.value;
      const profitDetails = document.getElementById('profit-details');
      
      if (!investorId || !profitDetails) return;
      
      // البحث عن المستثمر
      const investor = window.investors.find(inv => inv.id === investorId);
      if (!investor) return;
      
      // التحقق من وجود أقساط مستحقة
      const dueInstallments = getDueInstallments(investor);
      if (dueInstallments.length === 0) return;
      
      // إجمالي الأقساط المستحقة
      const totalDueAmount = dueInstallments.reduce((sum, inst) => sum + inst.remainingAmount, 0);
      
      // إضافة قسم الأقساط المستحقة
      const installmentSection = document.createElement('div');
      installmentSection.className = 'installments-notice';
      
      installmentSection.innerHTML = `
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <span>يوجد ${dueInstallments.length} قسط مستحق بقيمة إجمالية ${formatCurrency(totalDueAmount)}. يمكنك تسديدها تلقائياً عند دفع الأرباح.</span>
        </div>
        <div class="form-group">
          <div class="form-check">
            <input type="checkbox" id="auto-pay-installments" checked>
            <label for="auto-pay-installments">تسديد الأقساط المستحقة تلقائياً من الأرباح</label>
          </div>
        </div>
      `;
      
      // إضافة القسم لتفاصيل الربح
      profitDetails.appendChild(installmentSection);
      
      // إضافة أنماط CSS
      addInstallmentsNoticeStyles();
    };
    
    console.log("تم تحسين دالة حساب الأرباح لإظهار الأقساط المستحقة");
  }
  
  // تحسين دالة دفع الأرباح لدمج تسديد الأقساط
  if (typeof window.payProfit === 'function') {
    window._originalPayProfit = window.payProfit;
    
    window.payProfit = function() {
      console.log("دفع الأرباح مع خيار تسديد الأقساط...");
      
      // الحصول على معرف المستثمر
      const profitInvestorSelect = document.getElementById('profit-investor');
      if (!profitInvestorSelect) {
        if (typeof window._originalPayProfit === 'function') {
          window._originalPayProfit();
        }
        return;
      }
      
      const investorId = profitInvestorSelect.value;
      if (!investorId) {
        if (typeof window._originalPayProfit === 'function') {
          window._originalPayProfit();
        }
        return;
      }
      
      // البحث عن المستثمر
      const investor = window.investors.find(inv => inv.id === investorId);
      if (!investor) {
        if (typeof window._originalPayProfit === 'function') {
          window._originalPayProfit();
        }
        return;
      }
      
      // التحقق مما إذا كان المستخدم يريد تسديد الأقساط تلقائياً
      const autoPayCheckbox = document.getElementById('auto-pay-installments');
      const shouldAutoPayInstallments = autoPayCheckbox && autoPayCheckbox.checked;
      
      // التحقق من وجود أقساط مستحقة
      const dueInstallments = getDueInstallments(investor);
      
      // إذا لم توجد أقساط مستحقة أو اختار المستخدم عدم التسديد التلقائي
      if (dueInstallments.length === 0 || !shouldAutoPayInstallments) {
        if (typeof window._originalPayProfit === 'function') {
          window._originalPayProfit();
        }
        return;
      }
      
      // حساب إجمالي الأرباح المستحقة
      let totalProfit = 0;
      investor.investments.forEach(inv => {
        if (inv.amount <= 0) return;
        
        const profit = typeof window.calculateInterest === 'function'
          ? window.calculateInterest(inv.amount, inv.date)
          : 0;
        
        totalProfit += profit;
      });
      
      // حساب إجمالي الأقساط المستحقة
      const totalDueAmount = dueInstallments.reduce((sum, inst) => sum + inst.remainingAmount, 0);
      
      // إذا كان إجمالي الأرباح يكفي لتسديد جميع الأقساط
      if (totalProfit >= totalDueAmount) {
        // عرض تأكيد للمستخدم
        if (confirm(`سيتم تسديد ${dueInstallments.length} قسط مستحق بقيمة إجمالية ${formatCurrency(totalDueAmount)} من الأرباح المستحقة. هل ترغب في المتابعة؟`)) {
          // سداد الأقساط وخصمها من الأرباح
          payInstallmentsFromProfit(investor, dueInstallments, totalProfit);
        } else {
          // استدعاء الدالة الأصلية إذا لم يوافق المستخدم
          if (typeof window._originalPayProfit === 'function') {
            window._originalPayProfit();
          }
        }
      } else {
        // إذا كانت الأرباح لا تكفي، نسأل المستخدم إذا أراد تسديد ما يمكن تسديده
        if (confirm(`الأرباح المستحقة (${formatCurrency(totalProfit)}) لا تكفي لتسديد جميع الأقساط المستحقة (${formatCurrency(totalDueAmount)}). هل ترغب في تسديد ما يمكن تسديده من الأقساط؟`)) {
          // سداد ما يمكن تسديده من الأقساط
          payInstallmentsFromProfit(investor, dueInstallments, totalProfit);
        } else {
          // استدعاء الدالة الأصلية إذا لم يوافق المستخدم
          if (typeof window._originalPayProfit === 'function') {
            window._originalPayProfit();
          }
        }
      }
    };
    
    console.log("تم تحسين دالة دفع الأرباح لدمج تسديد الأقساط");
  }
}

/**
 * تحسين دالة عرض تفاصيل المستثمر لإظهار الأقساط
 */
function enhanceInvestorDetailsFunction() {
  if (typeof window.showInvestorDetails === 'function') {
    window._originalShowInvestorDetails = window.showInvestorDetails;
    
    window.showInvestorDetails = function(investorId) {
      // استدعاء الدالة الأصلية
      if (typeof window._originalShowInvestorDetails === 'function') {
        window._originalShowInvestorDetails(investorId);
      }
      
      // بعد فترة قصيرة، نضيف قسم الأقساط إذا لم يكن موجوداً
      setTimeout(() => {
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor) return;
        
        const detailsContainer = document.querySelector('#investor-details-content');
        if (!detailsContainer) return;
        
        // التحقق من عدم وجود قسم الأقساط مسبقاً
        if (!detailsContainer.querySelector('.installments-detail-group')) {
          // الحصول على الأقساط المستحقة وغير المستحقة
          const dueInstallments = getDueInstallments(investor);
          const upcomingInstallments = investor.installments
            ? investor.installments.filter(inst => 
                inst.status !== 'paid' && 
                new Date(inst.dueDate) > new Date())
            : [];
          
          // إذا كانت هناك أقساط، نضيف القسم
          if ((dueInstallments && dueInstallments.length > 0) || 
              (upcomingInstallments && upcomingInstallments.length > 0)) {
            
            addInstallmentsSectionToInvestorDetails(investor, detailsContainer);
          }
        }
      }, 300);
    };
    
    console.log("تم تحسين دالة عرض تفاصيل المستثمر");
  }
}

/**
 * إضافة مؤشرات حالة الأقساط في جدول المستثمرين
 */
function addInstallmentsIndicatorToInvestorsTable() {
  // يمكن تنفيذ ذلك عن طريق استبدال دالة renderInvestorsTable
  if (typeof window.renderInvestorsTable === 'function') {
    window._originalRenderInvestorsTable = window.renderInvestorsTable;
    
    window.renderInvestorsTable = function() {
      // استدعاء الدالة الأصلية
      if (typeof window._originalRenderInvestorsTable === 'function') {
        window._originalRenderInvestorsTable();
      }
      
      // إضافة مؤشرات حالة الأقساط بعد عرض الجدول
      setTimeout(() => {
        const tableRows = document.querySelectorAll('#investors-table tbody tr');
        
        tableRows.forEach(row => {
          const investorId = row.querySelector('.investor-action-btn')?.getAttribute('data-id');
          if (!investorId) return;
          
          const investor = window.investors.find(inv => inv.id === investorId);
          if (!investor || !investor.installments) return;
          
          // حساب عدد الأقساط المستحقة
          const dueInstallments = getDueInstallments(investor);
          if (dueInstallments.length === 0) return;
          
          // إضافة مؤشر الأقساط
          const statusCell = row.querySelector('td:nth-child(7)');
          if (statusCell) {
            const currentStatus = statusCell.innerHTML;
            statusCell.innerHTML = `
              ${currentStatus}
              <span class="badge badge-danger installments-badge" title="${dueInstallments.length} قسط مستحق">
                <i class="fas fa-receipt"></i> ${dueInstallments.length}
              </span>
            `;
          }
        });
      }, 100);
    };
    
    // تحديث الجدول مباشرة
    if (document.querySelector('#investors-page.active')) {
      window.renderInvestorsTable();
    }
    
    console.log("تم إضافة مؤشرات حالة الأقساط في جدول المستثمرين");
  }
}

/**
 * إضافة مؤشرات حالة الأقساط في جدول الأرباح
 */
function addInstallmentsIndicatorToProfitsTable() {
  // يمكن تنفيذ ذلك عن طريق استبدال دالة renderProfitsTable
  if (typeof window.renderProfitsTable === 'function') {
    window._originalRenderProfitsTable = window.renderProfitsTable;
    
    window.renderProfitsTable = function() {
      // استدعاء الدالة الأصلية
      if (typeof window._originalRenderProfitsTable === 'function') {
        window._originalRenderProfitsTable();
      }
      
      // إضافة مؤشرات حالة الأقساط بعد عرض الجدول
      setTimeout(() => {
        const tableRows = document.querySelectorAll('#profits-table tbody tr');
        
        tableRows.forEach(row => {
          const payProfitBtn = row.querySelector('.pay-profit-btn');
          if (!payProfitBtn) return;
          
          const investorId = payProfitBtn.getAttribute('data-id');
          if (!investorId) return;
          
          const investor = window.investors.find(inv => inv.id === investorId);
          if (!investor || !investor.installments) return;
          
          // حساب عدد الأقساط المستحقة
          const dueInstallments = getDueInstallments(investor);
          if (dueInstallments.length === 0) return;
          
          // إجمالي الأقساط المستحقة
          const totalDueAmount = dueInstallments.reduce((sum, inst) => sum + inst.remainingAmount, 0);
          
          // تعديل زر دفع الأرباح
          const actionsCell = row.querySelector('td:last-child');
          if (actionsCell) {
            const payButton = actionsCell.querySelector('.pay-profit-btn');
            if (payButton) {
              payButton.innerHTML = `
                <i class="fas fa-coins"></i>
                <span>دفع الأرباح</span>
                <span class="badge badge-danger installments-badge" title="${dueInstallments.length} قسط مستحق بقيمة ${formatCurrency(totalDueAmount)}">
                  <i class="fas fa-receipt"></i> ${dueInstallments.length}
                </span>
              `;
            }
          }
        });
      }, 100);
    };
    
    // تحديث الجدول مباشرة
    if (document.querySelector('#profits-page.active')) {
      window.renderProfitsTable();
    }
    
    console.log("تم إضافة مؤشرات حالة الأقساط في جدول الأرباح");
  }
}

/**
 * الحصول على الأقساط المستحقة لمستثمر
 * @param {Object} investor - بيانات المستثمر
 * @returns {Array} - مصفوفة الأقساط المستحقة
 */
function getDueInstallments(investor) {
  if (!investor || !investor.installments) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return investor.installments.filter(installment => {
    // تجاهل الأقساط المدفوعة
    if (installment.status === 'paid') return false;
    
    // تحويل تاريخ الاستحقاق إلى كائن Date
    const dueDate = new Date(installment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    // القسط مستحق إذا كان تاريخ استحقاقه اليوم أو قبل اليوم
    return dueDate <= today;
  });
}

/**
 * سداد الأقساط من الأرباح المستحقة
 * @param {Object} investor - بيانات المستثمر
 * @param {Array} dueInstallments - الأقساط المستحقة
 * @param {Number} totalProfit - إجمالي الأرباح المستحقة
 */
function payInstallmentsFromProfit(investor, dueInstallments, totalProfit) {
  console.log("تسديد الأقساط من الأرباح المستحقة...");
  
  // المبلغ المتاح للسداد
  let availableAmount = totalProfit;
  const paidInstallments = [];
  const partiallyPaidInstallments = [];
  
  // ترتيب الأقساط حسب الأولوية وتاريخ الاستحقاق
  const sortedInstallments = [...dueInstallments].sort((a, b) => {
    // ترتيب حسب الأولوية ثم تاريخ الاستحقاق
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  // إجمالي المبلغ المستخدم في سداد الأقساط
  let totalUsedForInstallments = 0;
  
  // سداد الأقساط من الأرباح
  sortedInstallments.forEach(dueInstallment => {
    if (availableAmount <= 0) return;
    
    // الحصول على القسط من بيانات المستثمر
    const installmentIndex = investor.installments.findIndex(inst => inst.id === dueInstallment.id);
    if (installmentIndex === -1) return;
    
    const installment = investor.installments[installmentIndex];
    
    // المبلغ المطلوب للقسط
    const requiredAmount = installment.remainingAmount;
    
    // المبلغ الذي سيتم دفعه
    const paymentAmount = Math.min(availableAmount, requiredAmount);
    
    // تحديث المبلغ المدفوع والمتبقي
    installment.paidAmount = (installment.paidAmount || 0) + paymentAmount;
    installment.remainingAmount = Math.max(0, installment.remainingAmount - paymentAmount);
    
    // تحديث حالة القسط
    if (installment.remainingAmount <= 0) {
      installment.status = 'paid';
      installment.paidDate = new Date().toISOString().split('T')[0];
      installment.paymentMethod = 'profit_deduction';
      paidInstallments.push(installment);
    } else {
      installment.status = 'active';
      partiallyPaidInstallments.push(installment);
    }
    
    // تحديث المبلغ المتبقي للاستقطاع
    availableAmount -= paymentAmount;
    totalUsedForInstallments += paymentAmount;
  });
  
  // إنشاء وصف لعمليات سداد الأقساط
  let deductionNotes = '';
  
  if (paidInstallments.length > 0) {
    deductionNotes += `تم سداد ${paidInstallments.length} قسط: `;
    deductionNotes += paidInstallments.map(inst => inst.description).join('، ');
  }
  
  if (partiallyPaidInstallments.length > 0) {
    if (deductionNotes) deductionNotes += '. ';
    deductionNotes += `تم سداد جزئي لـ ${partiallyPaidInstallments.length} قسط: `;
    deductionNotes += partiallyPaidInstallments.map(inst => inst.description).join('، ');
  }
  
  // المبلغ المتبقي من الأرباح بعد سداد الأقساط
  const remainingProfit = totalProfit - totalUsedForInstallments;
  
  // إضافة عملية دفع الأرباح مع استقطاع الأقساط
  investor.profits.push({
    date: new Date().toISOString().split('T')[0],
    amount: remainingProfit,
    deductedAmount: totalUsedForInstallments,
    notes: deductionNotes
  });
  
  // إضافة عملية جديدة
  const transactionNotes = `دفع أرباح مستحقة ${deductionNotes ? `مع استقطاع أقساط (${deductionNotes})` : ''}`;
  
  // استخدام دالة النظام الأصلية إذا كانت متاحة
  if (typeof window.addTransaction === 'function') {
    window.addTransaction('دفع أرباح', investor.id, remainingProfit, transactionNotes);
    
    // إضافة عملية منفصلة لسداد الأقساط
    if (totalUsedForInstallments > 0) {
      window.addTransaction('سداد أقساط', investor.id, totalUsedForInstallments, `تم سداد أقساط من الأرباح: ${deductionNotes}`);
    }
  }
  
  // حفظ البيانات
  if (typeof window.saveData === 'function') {
    window.saveData();
  }
  
  // إغلاق النافذة المنبثقة
  if (typeof window.closeModal === 'function') {
    window.closeModal('pay-profit-modal');
  } else {
    const modal = document.getElementById('pay-profit-modal');
    if (modal) modal.classList.remove('active');
  }
  
  // عرض إشعار النجاح
  const message = `تم دفع الأرباح بمبلغ ${formatCurrency(remainingProfit)} للمستثمر ${investor.name} بنجاح!${totalUsedForInstallments > 0 ? ` (تم استقطاع ${formatCurrency(totalUsedForInstallments)} لسداد الأقساط المستحقة)` : ''}`;
  
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, 'success');
  } else {
    alert(message);
  }
  
  // تحديث العرض
  if (typeof window.renderProfitsTable === 'function') {
    window.renderProfitsTable();
  }
  
  if (typeof window.updateDashboard === 'function') {
    window.updateDashboard();
  }
  
  if (typeof window.renderTransactionsTable === 'function') {
    window.renderTransactionsTable();
  }
  
  if (typeof window.renderRecentTransactions === 'function') {
    window.renderRecentTransactions();
  }
  
  // تحديث حالة الأقساط في صفحة الأقساط
  if (document.getElementById('installments-page') && typeof window.renderInstallmentsTable === 'function') {
    window.renderInstallmentsTable();
    
    if (typeof window.updateInstallmentsDashboard === 'function') {
      window.updateInstallmentsDashboard();
    }
  }
}

/**
 * إضافة قسم الأقساط إلى تفاصيل المستثمر
 * @param {Object} investor - بيانات المستثمر
 * @param {HTMLElement} container - حاوية التفاصيل
 */
function addInstallmentsSectionToInvestorDetails(investor, container) {
  // الحصول على الأقساط المستحقة وغير المستحقة
  const dueInstallments = getDueInstallments(investor);
  const upcomingInstallments = investor.installments
    ? investor.installments.filter(inst => 
        inst.status !== 'paid' && 
        new Date(inst.dueDate) > new Date())
    : [];
  
  // حساب إجمالي الأقساط المستحقة
  const totalDueAmount = dueInstallments.reduce((sum, inst) => sum + inst.remainingAmount, 0);
  
  // حساب إجمالي الأقساط القادمة
  const totalUpcomingAmount = upcomingInstallments.reduce((sum, inst) => sum + inst.remainingAmount, 0);
  
  // تحديد عدد أقساط حالة المستثمر
  let statusMessage = '';
  let statusClass = '';
  
  if (dueInstallments.length > 0) {
    statusMessage = `${dueInstallments.length} قسط مستحق`;
    statusClass = 'status-urgent';
  } else if (upcomingInstallments.length > 0) {
    statusMessage = `${upcomingInstallments.length} قسط قادم`;
    statusClass = 'status-upcoming';
  } else if (investor.installments && investor.installments.some(i => i.status === 'paid')) {
    statusMessage = 'جميع الأقساط مسددة';
    statusClass = 'status-paid';
  } else {
    statusMessage = 'لا توجد أقساط';
    statusClass = 'status-none';
  }
  
  // إنشاء قسم الأقساط
  const installmentsSection = document.createElement('div');
  installmentsSection.className = 'detail-group installments-detail-group';
  
  // إنشاء محتوى قسم الأقساط
  installmentsSection.innerHTML = `
    <h3 class="detail-group-title">
      الأقساط
      <span class="installment-status ${statusClass}">${statusMessage}</span>
      <button class="btn btn-sm btn-primary add-installment-btn" data-investor-id="${investor.id}">
        <i class="fas fa-plus"></i>
        <span>إضافة قسط</span>
      </button>
    </h3>
    
    ${dueInstallments.length > 0 ? `
      <div class="installments-summary due">
        <div class="summary-title">
          <i class="fas fa-exclamation-circle"></i>
          أقساط مستحقة
        </div>
        <div class="summary-amount">${formatCurrency(totalDueAmount)}</div>
      </div>
      
      <div class="mini-table-container">
        <table class="mini-table installments-table">
          <thead>
            <tr>
              <th>الوصف</th>
              <th>تاريخ الاستحقاق</th>
              <th>المبلغ المتبقي</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${dueInstallments.map(installment => `
              <tr class="due-installment">
                <td>${installment.description}</td>
                <td>${formatDate(installment.dueDate)}</td>
                <td>${formatCurrency(installment.remainingAmount)}</td>
                <td>
                  <button class="btn btn-sm btn-success pay-installment-btn" data-investor-id="${investor.id}" data-installment-id="${installment.id}">
                    <i class="fas fa-coins"></i>
                  </button>
                  <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${investor.id}" data-installment-id="${installment.id}">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}
    
    ${upcomingInstallments.length > 0 ? `
      <div class="installments-summary upcoming">
        <div class="summary-title">
          <i class="fas fa-calendar-alt"></i>
          أقساط قادمة
        </div>
        <div class="summary-amount">${formatCurrency(totalUpcomingAmount)}</div>
      </div>
      
      <div class="mini-table-container">
        <table class="mini-table installments-table">
          <thead>
            <tr>
              <th>الوصف</th>
              <th>تاريخ الاستحقاق</th>
              <th>المبلغ المتبقي</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${upcomingInstallments.map(installment => `
              <tr class="upcoming-installment">
                <td>${installment.description}</td>
                <td>${formatDate(installment.dueDate)}</td>
                <td>${formatCurrency(installment.remainingAmount)}</td>
                <td>
                  <button class="btn btn-sm btn-outline edit-installment-btn" data-investor-id="${investor.id}" data-installment-id="${installment.id}">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}
    
    ${(dueInstallments.length === 0 && upcomingInstallments.length === 0) ? `
      <div class="empty-installments">
        <p>لا توجد أقساط حالية. يمكنك إضافة قسط جديد عن طريق الضغط على زر "إضافة قسط".</p>
      </div>
    ` : ''}
  `;
  
  // إضافة قسم الأقساط إلى التفاصيل
  container.appendChild(installmentsSection);
  
  // إضافة مستمعي الأحداث للأزرار
  setupInstallmentButtonsListeners(installmentsSection);
}

/**
 * إضافة مستمعي الأحداث لأزرار الأقساط
 * @param {HTMLElement} container - حاوية أزرار الأقساط
 */
function setupInstallmentButtonsListeners(container) {
  // زر إضافة قسط
  const addButton = container.querySelector('.add-installment-btn');
  if (addButton) {
    addButton.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      if (typeof window.showAddInstallmentModal === 'function') {
        window.showAddInstallmentModal(investorId);
      } else if (typeof window.editInstallment === 'function') {
        window.editInstallment(investorId, null);
      }
    });
  }
  
  // أزرار دفع الأقساط
  const payButtons = container.querySelectorAll('.pay-installment-btn');
  payButtons.forEach(button => {
    button.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      const installmentId = this.getAttribute('data-installment-id');
      if (typeof window.payInstallment === 'function') {
        window.payInstallment(investorId, installmentId);
      } else {
        payInstallmentDirectly(investorId, installmentId);
      }
    });
  });
  
  // أزرار تعديل الأقساط
  const editButtons = container.querySelectorAll('.edit-installment-btn');
  editButtons.forEach(button => {
    button.addEventListener('click', function() {
      const investorId = this.getAttribute('data-investor-id');
      const installmentId = this.getAttribute('data-installment-id');
      if (typeof window.editInstallment === 'function') {
        window.editInstallment(investorId, installmentId);
      }
    });
  });
}

/**
 * تسديد قسط مباشرة (في حالة عدم وجود دالة النظام)
 * @param {string} investorId - معرف المستثمر
 * @param {string} installmentId - معرف القسط
 */
function payInstallmentDirectly(investorId, installmentId) {
  // البحث عن المستثمر والقسط
  const investor = window.investors.find(inv => inv.id === investorId);
  if (!investor || !investor.installments) {
    alert('لم يتم العثور على بيانات المستثمر أو الأقساط');
    return;
  }
  
  const installmentIndex = investor.installments.findIndex(inst => inst.id === installmentId);
  if (installmentIndex === -1) {
    alert('لم يتم العثور على بيانات القسط');
    return;
  }
  
  const installment = investor.installments[installmentIndex];
  
  // التحقق من حالة القسط
  if (installment.status === 'paid') {
    alert('هذا القسط مدفوع بالفعل');
    return;
  }
  
  // طلب تأكيد دفع القسط
  if (confirm(`هل أنت متأكد من رغبتك في تسديد القسط "${installment.description}" بقيمة ${formatCurrency(installment.remainingAmount)}؟`)) {
    // تسجيل عملية دفع القسط
    const paymentTransaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      type: 'دفع قسط',
      investorId,
      investorName: investor.name,
      amount: installment.remainingAmount,
      notes: `دفع قسط: ${installment.description}`
    };
    
    // إضافة العملية إلى سجل العمليات
    if (Array.isArray(window.transactions)) {
      window.transactions.push(paymentTransaction);
    }
    
    // تحديث بيانات القسط
    installment.status = 'paid';
    installment.paidAmount = installment.amount;
    installment.remainingAmount = 0;
    installment.paidDate = new Date().toISOString().split('T')[0];
    installment.paymentMethod = 'manual';
    
    // حفظ البيانات
    if (typeof window.saveData === 'function') {
      window.saveData();
    }
    
    alert('تم تسديد القسط بنجاح');
    
    // تحديث تفاصيل المستثمر
    if (typeof window.showInvestorDetails === 'function') {
      window.showInvestorDetails(investorId);
    }
    
    // تحديث العرض
    if (typeof window.renderProfitsTable === 'function') {
      window.renderProfitsTable();
    }
    
    if (typeof window.updateDashboard === 'function') {
      window.updateDashboard();
    }
    
    if (typeof window.renderTransactionsTable === 'function') {
      window.renderTransactionsTable();
    }
    
    if (typeof window.renderRecentTransactions === 'function') {
      window.renderRecentTransactions();
    }
  }
}

/**
 * إضافة أنماط CSS لإشعارات الأقساط
 */
function addInstallmentsNoticeStyles() {
  // التحقق من وجود أنماط مسبقة
  if (document.getElementById('installments-notice-styles')) {
    return;
  }
  
  // إنشاء عنصر نمط جديد
  const styleElement = document.createElement('style');
  styleElement.id = 'installments-notice-styles';
  
  // إضافة أنماط CSS
  styleElement.textContent = `
    /* أنماط إشعار الأقساط في نافذة دفع الأرباح */
    .installments-notice {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px dashed #e2e8f0;
    }
    
    .installments-notice .alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .installments-notice .alert-warning {
      background-color: #fff7ed;
      border-left: 4px solid #f59e0b;
      color: #92400e;
    }
    
    .installments-notice .form-check {
      margin-top: 0.75rem;
    }
    
    /* أنماط مؤشر الأقساط في الجدول */
    .installments-badge {
      margin-right: 6px;
      font-size: 0.75rem;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 6px;
      border-radius: 99px;
      background-color: #fee2e2;
      color: #b91c1c;
    }
    
    .pay-profit-btn .installments-badge {
      position: absolute;
      top: -8px;
      right: -8px;
    }
    
    /* أنماط زر دفع الأرباح مع مؤشر الأقساط */
    td .pay-profit-btn {
      position: relative;
    }
  `;
  
  // إضافة عنصر النمط إلى رأس الصفحة
  document.head.appendChild(styleElement);
  console.log('تم إضافة أنماط CSS لإشعارات الأقساط');
}

/**
 * تنسيق التاريخ
 * @param {string} dateString - سلسلة التاريخ
 * @returns {string} - التاريخ المنسق
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // التحقق من صحة التاريخ
    if (isNaN(date.getTime())) return dateString;
    
    // تنسيق التاريخ بالصيغة العربية
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * تنسيق المبلغ المالي
 * @param {number} amount - المبلغ
 * @param {boolean} addCurrency - إضافة رمز العملة
 * @returns {string} - المبلغ المنسق
 */
function formatCurrency(amount, addCurrency = true) {
  // استخدام دالة النظام لتنسيق المبلغ إذا كانت موجودة
  if (typeof window.formatCurrency === 'function') {
    return window.formatCurrency(amount, addCurrency);
  }
  
  // تنسيق بديل إذا لم تكن الدالة موجودة
  if (isNaN(amount)) amount = 0;
  
  const formattedAmount = amount.toLocaleString('ar-IQ');
  
  if (addCurrency) {
    const currency = window.settings?.currency || 'دينار';
    return `${formattedAmount} ${currency}`;
  }
  
  return formattedAmount;
}

// تنفيذ الربط عند تحميل الصفحة