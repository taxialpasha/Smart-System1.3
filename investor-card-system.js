function showInvestorCardsPage(pageId) {
  // استخدام دالة التنقل من النظام الأساسي إذا كانت متاحة
  if (typeof window.showPage === 'function') {
    window.showPage(pageId);
    return;
  }
  
  // إخفاء جميع الصفحات
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // إظهار الصفحة المطلوبة
  const page = document.getElementById(`${pageId}-page`);
  if (page) {
    page.classList.add('active');
  }
}