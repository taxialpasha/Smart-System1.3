/**
 * نظام الاستثمار المتكامل - سكربت التكامل الشامل
 * 
 * هذا السكربت يقوم بمعالجة جميع المشاكل الموجودة في نظام الاستثمار
 * ويقوم بتكامل نظام الإشعارات والتعرف على الصوت وتنسيق العملة
 * 
 * كيفية الاستخدام:
 * 1. انسخ هذا الملف كاملاً
 * 2. أضفه كسكربت في نهاية index.html قبل وسم </body> مباشرة
 */

// تنفيذ السكربت عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('بدء تنفيذ سكربت التكامل الشامل لنظام الاستثمار المتكامل...');
    
    // 1. إصلاح نظام التنبيهات
    fixNotificationsSystem();
    
    // 2. إصلاح نظام التعرف على الصوت
    fixSpeechRecognition();
    
    // 3. إصلاح تنسيق العملة
    fixCurrencyFormatter();
    
    // 4. إصلاح قطع الفائدة عند السحب
    fixInterestCutting();
    
    // 5. تهيئة البيانات إذا كانت غير موجودة
    initializeDefaultData();
    
    // 6. تحديث واجهة المستخدم
    setTimeout(updateUI, 500);
    
    console.log('تم تنفيذ سكربت التكامل الشامل بنجاح!');
});

/**
 * إصلاح نظام التنبيهات
 */
function fixNotificationsSystem() {
    console.log('إصلاح نظام التنبيهات...');
    
    // إنشاء كائن نظام التنبيهات إذا لم يكن موجوداً
    if (!window.notificationsSystem) {
        window.notificationsSystem = {};
    }
    
    // إضافة دالة الحصول على المستثمرين المستحقين للربح
    window.notificationsSystem.getDueInvestors = function() {
        try {
            // التأكد من وجود مصفوفة المستثمرين
            if (!window.investors || !Array.isArray(window.investors)) {
                // محاولة استرجاع المستثمرين من التخزين المحلي
                try {
                    const savedInvestors = localStorage.getItem('investors');
                    if (savedInvestors) {
                        window.investors = JSON.parse(savedInvestors);
                    } else {
                        window.investors = [];
                    }
                } catch (e) {
                    console.error('خطأ في استرجاع المستثمرين من التخزين المحلي:', e);
                    window.investors = [];
                }
            }
            
            // التأكد من وجود الإعدادات
            if (!window.settings) {
                // محاولة استرجاع الإعدادات من التخزين المحلي
                try {
                    const savedSettings = localStorage.getItem('settings');
                    if (savedSettings) {
                        window.settings = JSON.parse(savedSettings);
                    } else {
                        window.settings = {
                            interestRate: 17.5,
                            reminderDays: 3,
                            currency: 'دينار',
                            profitCycle: 30
                        };
                    }
                } catch (e) {
                    console.error('خطأ في استرجاع الإعدادات من التخزين المحلي:', e);
                    window.settings = {
                        interestRate: 17.5,
                        reminderDays: 3,
                        currency: 'دينار',
                        profitCycle: 30
                    };
                }
            }
            
            const investors = window.investors;
            const settings = window.settings;
            const dueInvestors = [];
            const today = new Date();
            
            // البحث عن المستثمرين المستحقين للربح
            investors.forEach(investor => {
                if (!investor || investor.status !== 'نشط' || !investor.investments || investor.investments.length === 0) {
                    return;
                }
                
                const totalInvestment = investor.amount || 0;
                if (totalInvestment <= 0) {
                    return;
                }
                
                // اختيار أقدم تاريخ استثمار
                const oldestInvestment = investor.investments.reduce((oldest, current) => {
                    if (!oldest) return current;
                    if (!current || !current.date) return oldest;
                    
                    const oldestDate = new Date(oldest.date);
                    const currentDate = new Date(current.date);
                    return currentDate < oldestDate ? current : oldest;
                }, null);
                
                if (!oldestInvestment) {
                    return;
                }
                
                const investmentDate = new Date(oldestInvestment.date);
                const daysElapsed = Math.floor((today - investmentDate) / (1000 * 60 * 60 * 24));
                
                // الحصول على دورة الأرباح من الإعدادات
                const profitCycle = settings.profitCycle || 30;
                
                // حساب ما إذا كان المستثمر مستحقًا للربح
                if (daysElapsed >= profitCycle) {
                    // حساب الربح المستحق
                    let profit = 0;
                    
                    // التأكد من وجود استثمارات
                                        if (investor.investments && Array.isArray(investor.investments)) {
                                            // Add logic for processing investments here
                                        }
                                    }
                                });
                            } catch (error) {
                                console.error('Error in getDueInvestors:', error);
                            }
                        };
                    }