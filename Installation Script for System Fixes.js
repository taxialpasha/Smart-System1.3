/**
 * سكربت تكامل نظام التنبيهات مع نظام الاستثمار المتكامل
 * 
 * هذا الملف يجب إضافته إلى index.html قبل نهاية وسم body
 * يقوم بدمج جميع الإصلاحات وضمان عمل النظام بشكل صحيح
 */

// تنفيذ السكربت فور اكتمال تحميل DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('بدء تكامل نظام التنبيهات...');
    
    // 1. إصلاح نظام التنبيهات
    fixNotificationsSystem();
    
    // 2. إصلاح نظام التعرف على الصوت
    fixSpeechRecognition();
    
    // 3. إصلاح تنسيق العملة
    fixCurrencyFormatter();
    
    // 4. تهيئة نظام التنبيهات بعد التأكد من الإصلاحات
    setTimeout(initializeNotificationSystem, 500);
    
    console.log('تم تكامل نظام التنبيهات بنجاح!');
});

/**
 * إصلاح نظام التنبيهات
 */
function fixNotificationsSystem() {
    // التأكد من وجود كائن نظام التنبيهات
    if (!window.notificationsSystem) {
        window.notificationsSystem = {};
    }
    
    // إضافة دالة الحصول على المستثمرين المستحقين
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
                        // استخدام دالة حساب الفائدة في النظام
                        if (typeof window.calculateInterest === 'function') {
                            profit = investor.investments.reduce((total, inv) => {
                                if (!inv || !inv.amount) return total;
                                return total + window.calculateInterest(inv.amount, inv.date);
                            }, 0);
                        } else {
                            // حساب بسيط للفائدة
                            const interestRate = (settings.interestRate || 17.5) / 100;
                            profit = investor.investments.reduce((total, inv) => {
                                if (!inv || !inv.amount) return total;
                                return total + (inv.amount * interestRate);
                            }, 0);
                        }
                    }
                    
                    // إضافة المستثمر إلى القائمة
                    dueInvestors.push({
                        investor: investor,
                        profit: profit,
                        daysElapsed: daysElapsed,
                        dueDate: new Date(investmentDate.getTime() + (profitCycle * 24 * 60 * 60 * 1000))
                    });
                }
            });
            
            // ترتيب القائمة حسب تاريخ الاستحقاق
            dueInvestors.sort((a, b) => a.dueDate - b.dueDate);
            
            return dueInvestors;
        } catch (error) {
            console.error('خطأ في الحصول على المستثمرين المستحقين للربح:', error);
            return [];
        }
    };
    
    // تحديث دالة تحديث التنبيهات
    window.notificationsSystem.update = function() {
        try {
            const dueInvestors = this.getDueInvestors();
            
            // تحديث عرض التنبيهات
            this.updateNotificationsList(dueInvestors);
            
            // تحديث عدد التنبيهات
            this.updateNotificationBadge(dueInvestors.length);
        } catch (error) {
            console.error('خطأ في تحديث التنبيهات:', error);
        }
    };
    
    // إضافة دالة تحديث عدد التنبيهات
    window.notificationsSystem.updateNotificationBadge = function(count) {
        // تحديث شارة عدد التنبيهات في الزر
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
        
        // تحديث عدد التنبيهات في علامات التبويب
        const dueProfitsCount = document.getElementById('due-profits-count');
        if (dueProfitsCount) {
            dueProfitsCount.textContent = count;
        }
        
        const allNotificationsCount = document.getElementById('all-notifications-count');
        if (allNotificationsCount) {
            allNotificationsCount.textContent = count;
        }
    };
    
    // إضافة دالة تحديث قوائم التنبيهات
    window.notificationsSystem.updateNotificationsList = function(dueInvestors) {
        // الحصول على عناصر قوائم التنبيهات
        const dueProfitsList = document.getElementById('due-profits-list');
        const allNotificationsList = document.getElementById('all-notifications-list');
        
        if (!dueProfitsList || !allNotificationsList) {
            return;
        }
        
        // تحديث قائمة الأرباح المستحقة
        if (dueInvestors.length > 0) {
            dueProfitsList.innerHTML = '';
            
            // إنشاء عناصر التنبيهات
            dueInvestors.forEach(item => {
                // تنسيق التاريخ
                const dueDate = new Date(item.dueDate).toLocaleDateString('ar-SA');
                
                // تنسيق المبلغ
                const formattedProfit = typeof window.formatCurrency === 'function' 
                    ? window.formatCurrency(item.profit) 
                    : `${item.profit} ${window.settings?.currency || 'دينار'}`;
                
                // إنشاء عنصر التنبيه
                const notificationItem = document.createElement('div');
                notificationItem.className = 'notification-item';
                notificationItem.innerHTML = `
                    <div class="notification-icon success">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="notification-details">
                        <div class="notification-title">
                            <span>ربح مستحق - ${item.investor.name}</span>
                            <span class="notification-unread-badge"></span>
                        </div>
                        <div class="notification-message">
                            يوجد ربح مستحق بقيمة <strong>${formattedProfit}</strong> للمستثمر ${item.investor.name}.
                            <br>
                            <small>تاريخ الاستحقاق: ${dueDate} (منذ ${item.daysElapsed} يوم)</small>
                        </div>
                        <div class="notification-actions">
                            <button class="btn btn-sm btn-success pay-profit-btn" data-investor-id="${item.investor.id}">
                                <i class="fas fa-coins"></i>
                                <span>دفع الربح</span>
                            </button>
                            <button class="btn btn-sm btn-outline view-investor-btn" data-investor-id="${item.investor.id}">
                                <i class="fas fa-eye"></i>
                                <span>عرض التفاصيل</span>
                            </button>
                        </div>
                    </div>
                `;
                
                // إضافة عنصر التنبيه إلى القائمة
                dueProfitsList.appendChild(notificationItem);
                
                // إضافة مستمعي الأحداث للأزرار
                const payProfitBtn = notificationItem.querySelector('.pay-profit-btn');
                const viewInvestorBtn = notificationItem.querySelector('.view-investor-btn');
                
                if (payProfitBtn) {
                    payProfitBtn.addEventListener('click', function() {
                        const investorId = this.getAttribute('data-investor-id');
                        if (!investorId) return;
                        
                        // إغلاق نافذة التنبيهات
                        const notificationsModal = document.getElementById('notifications-modal');
                        if (notificationsModal) {
                            notificationsModal.classList.remove('active');
                        }
                        
                        // فتح نافذة دفع الربح
                        const profitInvestorSelect = document.getElementById('profit-investor');
                        if (profitInvestorSelect) {
                            profitInvestorSelect.value = investorId;
                            
                            // حساب الربح للمستثمر
                            if (typeof window.calculateProfitForInvestor === 'function') {
                                window.calculateProfitForInvestor();
                            }
                            
                            // فتح النافذة
                            if (typeof window.openModal === 'function') {
                                window.openModal('pay-profit-modal');
                            }
                        }
                    });
                }
                
                if (viewInvestorBtn) {
                    viewInvestorBtn.addEventListener('click', function() {
                        const investorId = this.getAttribute('data-investor-id');
                        if (!investorId) return;
                        
                        // إغلاق نافذة التنبيهات
                        const notificationsModal = document.getElementById('notifications-modal');
                        if (notificationsModal) {
                            notificationsModal.classList.remove('active');
                        }
                        
                        // عرض تفاصيل المستثمر
                        if (typeof window.showInvestorDetails === 'function') {
                            window.showInvestorDetails(investorId);
                        }
                    });
                }
            });
        } else {
            dueProfitsList.innerHTML = '<div class="notification-empty">لا توجد أرباح مستحقة حالياً</div>';
        }
        
        // نسخ نفس المحتوى إلى قائمة جميع التنبيهات
        allNotificationsList.innerHTML = dueProfitsList.innerHTML;
        
        // تكرار مستمعي الأحداث لقائمة جميع التنبيهات
        if (dueInvestors.length > 0) {
            const allPayButtons = allNotificationsList.querySelectorAll('.pay-profit-btn');
            const allViewButtons = allNotificationsList.querySelectorAll('.view-investor-btn');
            
            allPayButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const investorId = this.getAttribute('data-investor-id');
                    if (!investorId) return;
                    
                    // إغلاق نافذة التنبيهات
                    const notificationsModal = document.getElementById('notifications-modal');
                    if (notificationsModal) {
                        notificationsModal.classList.remove('active');
                    }
                    
                    // فتح نافذة دفع الربح
                    const profitInvestorSelect = document.getElementById('profit-investor');
                    if (profitInvestorSelect) {
                        profitInvestorSelect.value = investorId;
                        
                        // حساب الربح للمستثمر
                        if (typeof window.calculateProfitForInvestor === 'function') {
                            window.calculateProfitForInvestor();
                        }
                        
                        // فتح النافذة
                        if (typeof window.openModal === 'function') {
                            window.openModal('pay-profit-modal');
                        }
                    }
                });
            });
            
            allViewButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const investorId = this.getAttribute('data-investor-id');
                    if (!investorId) return;
                    
                    // إغلاق نافذة التنبيهات
                    const notificationsModal = document.getElementById('notifications-modal');
                    if (notificationsModal) {
                        notificationsModal.classList.remove('active');
                    }
                    
                    // عرض تفاصيل المستثمر
                    if (typeof window.showInvestorDetails === 'function') {
                        window.showInvestorDetails(investorId);
                    }
                });
            });
        }
    };
}
/**
 * إصلاح نظام التعرف على الصوت
 */
function fixSpeechRecognition() {
    // إضافة دالة إضافة زر المساعدة
    window.addSpeechRecognitionHelpButton = function() {
        // التحقق من وجود زر المساعدة مسبقاً
        if (document.querySelector('.speech-help-btn')) {
            return;
        }
        
        // إنشاء زر المساعدة
        const helpButton = document.createElement('button');
        helpButton.className = 'btn btn-info speech-help-btn';
        helpButton.innerHTML = '<i class="fas fa-question-circle"></i>';
        helpButton.title = 'مساعدة حول استخدام الإدخال الصوتي';
        
        // تعيين نمط الزر
        helpButton.style.position = 'fixed';
        helpButton.style.bottom = '20px';
        helpButton.style.left = '20px';
        helpButton.style.zIndex = '1000';
        helpButton.style.borderRadius = '50%';
        helpButton.style.width = '40px';
        helpButton.style.height = '40px';
        helpButton.style.padding = '0';
        helpButton.style.display = 'flex';
        helpButton.style.alignItems = 'center';
        helpButton.style.justifyContent = 'center';
        
        // إضافة مستمع حدث للزر
        helpButton.addEventListener('click', function() {
            // عرض نافذة المساعدة
            showSpeechHelpModal();
        });
        
        // إضافة الزر للصفحة
        document.body.appendChild(helpButton);
        
        console.log('تم إضافة زر مساعدة التعرف على الصوت');
    };
    
    // إضافة دالة عرض نافذة المساعدة
    window.showSpeechHelpModal = function() {
        // محتوى المساعدة
        const content = `
            <div class="speech-help-content">
                <h3><i class="fas fa-microphone"></i> كيفية استخدام الإدخال الصوتي</h3>
                
                <p>يمكنك استخدام ميزة الإدخال الصوتي لإدخال البيانات باستخدام الصوت بدلاً من الكتابة. اتبع الخطوات التالية:</p>
                
                <ol>
                    <li>انقر على زر المايكروفون <i class="fas fa-microphone"></i> بجانب حقل الإدخال.</li>
                    <li>اسمح للمتصفح بالوصول إلى المايكروفون إذا طُلب منك ذلك.</li>
                    <li>تحدث بوضوح باللغة العربية.</li>
                    <li>سيتم تحويل كلامك تلقائيًا إلى نص في حقل الإدخال.</li>
                    <li>يمكنك تعديل النص يدويًا بعد الانتهاء إذا لزم الأمر.</li>
                </ol>
                
                <div class="note">
                    <p><strong>ملاحظات:</strong></p>
                    <ul>
                        <li>تأكد من أن المايكروفون يعمل بشكل صحيح.</li>
                        <li>تحدث بوضوح وببطء للحصول على نتائج أفضل.</li>
                        <li>يعمل هذا بشكل أفضل في بيئة هادئة خالية من الضوضاء.</li>
                        <li>تأكد من استخدام متصفح حديث يدعم التعرف على الصوت.</li>
                    </ul>
                </div>
            </div>
        `;
        
        // عرض نافذة المساعدة
        if (typeof window.showModal === 'function') {
            window.showModal('مساعدة الإدخال الصوتي', content);
        } else {
            // بديل في حالة عدم وجود دالة showModal
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay active';
            modalOverlay.innerHTML = `
                <div class="modal animate__animated animate__fadeInUp">
                    <div class="modal-header">
                        <h3 class="modal-title">مساعدة الإدخال الصوتي</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline modal-close-btn">إغلاق</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalOverlay);
            
            // إضافة مستمعي الأحداث لأزرار الإغلاق
            const closeButtons = modalOverlay.querySelectorAll('.modal-close, .modal-close-btn');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    modalOverlay.classList.remove('active');
                    setTimeout(() => {
                        document.body.removeChild(modalOverlay);
                    }, 300);
                });
            });
        }
    };
    
    // استبدال دالة إعداد التعرف على الصوت
    if (typeof window.setupSpeechRecognition === 'function') {
        const originalSetupSpeechRecognition = window.setupSpeechRecognition;
        window.setupSpeechRecognition = function() {
            try {
                console.log('تهيئة نظام التعرف على الصوت (النسخة المُصلَحة)...');
                
                // إضافة أنماط CSS للتعرف على الصوت
                addSpeechRecognitionStyles();
                
                // إضافة زر المساعدة
                window.addSpeechRecognitionHelpButton();
                
                // التحقق من دعم المتصفح للتعرف على الصوت
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                
                if (!SpeechRecognition) {
                    console.warn('المتصفح لا يدعم ميزة التعرف على الصوت');
                    
                    // تغيير شكل أزرار المايكروفون لتعكس عدم الدعم
                    const micButtons = document.querySelectorAll('.mic-btn');
                    micButtons.forEach(button => {
                        button.classList.add('not-supported');
                        button.title = 'التعرف على الصوت غير مدعوم في هذا المتصفح';
                        
                        const icon = button.querySelector('i.fa-microphone');
                        if (icon) {
                            icon.classList.remove('fa-microphone');
                            icon.classList.add('fa-microphone-slash');
                        }
                        
                        button.disabled = true;
                    });
                    
                    return;
                }
                
                // البحث عن جميع أزرار المايكروفون
                const micButtons = document.querySelectorAll('.mic-btn');
                
                // إضافة مستمع حدث لكل زر
                micButtons.forEach(button => {
                    // التأكد من عدم إضافة مستمع حدث مرتين
                    if (button.classList.contains('setup-complete')) {
                        return;
                    }
                    
                    button.classList.add('setup-complete');
                    button.classList.add('supported');
                    button.title = 'انقر للتحدث';
                    
                    // إضافة مستمع حدث النقر
                    button.addEventListener('click', function() {
                        const inputId = this.getAttribute('data-input');
                        const inputField = document.getElementById(inputId);
                        
                        if (!inputField) {
                            console.error(`لم يتم العثور على حقل الإدخال: ${inputId}`);
                            return;
                        }
                        
                        // بدء التعرف على الصوت
                        startSpeechRecognition(button, inputField);
                    });
                });
                
                console.log(`تم تهيئة ${micButtons.length} زر للمايكروفون`);
                
            } catch (error) {
                console.error('خطأ في إعداد التعرف على الصوت:', error);
                
                // محاولة تنفيذ الدالة الأصلية
                try {
                    originalSetupSpeechRecognition.apply(this, arguments);
                } catch (originalError) {
                    console.error('خطأ في تنفيذ الدالة الأصلية للتعرف على الصوت:', originalError);
                }
            }
        };
    } else {
        // إنشاء دالة إعداد التعرف على الصوت إذا لم تكن موجودة
        window.setupSpeechRecognition = function() {
            console.log('تهيئة نظام التعرف على الصوت (النسخة الجديدة)...');
            
            // إضافة أنماط CSS للتعرف على الصوت
            addSpeechRecognitionStyles();
            
            // إضافة زر المساعدة
            window.addSpeechRecognitionHelpButton();
            
            // التحقق من دعم المتصفح للتعرف على الصوت
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                console.warn('المتصفح لا يدعم ميزة التعرف على الصوت');
                
                // تغيير شكل أزرار المايكروفون لتعكس عدم الدعم
                const micButtons = document.querySelectorAll('.mic-btn');
                micButtons.forEach(button => {
                    button.classList.add('not-supported');
                    button.title = 'التعرف على الصوت غير مدعوم في هذا المتصفح';
                    
                    const icon = button.querySelector('i.fa-microphone');
                    if (icon) {
                        icon.classList.remove('fa-microphone');
                        icon.classList.add('fa-microphone-slash');
                    }
                    
                    button.disabled = true;
                });
                
                return;
            }
            
            // البحث عن جميع أزرار المايكروفون
            const micButtons = document.querySelectorAll('.mic-btn');
            
            // إضافة مستمع حدث لكل زر
            micButtons.forEach(button => {
                // التأكد من عدم إضافة مستمع حدث مرتين
                if (button.classList.contains('setup-complete')) {
                    return;
                }
                
                button.classList.add('setup-complete');
                button.classList.add('supported');
                button.title = 'انقر للتحدث';
                
                // إضافة مستمع حدث النقر
                button.addEventListener('click', function() {
                    const inputId = this.getAttribute('data-input');
                    const inputField = document.getElementById(inputId);
                    
                    if (!inputField) {
                        console.error(`لم يتم العثور على حقل الإدخال: ${inputId}`);
                        return;
                    }
                    
                    // بدء التعرف على الصوت
                    startSpeechRecognition(button, inputField);
                });
            });
            
            console.log(`تم تهيئة ${micButtons.length} زر للمايكروفون`);
        };
    }
    
    // إضافة دالة بدء التعرف على الصوت
    window.startSpeechRecognition = function(button, inputField) {
        return startSpeechRecognition(button, inputField);
    };
    
    /**
     * بدء عملية التعرف على الصوت
     * @param {HTMLElement} button - زر المايكروفون
     * @param {HTMLElement} inputField - حقل الإدخال
     */
    function startSpeechRecognition(button, inputField) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        try {
            // إنشاء كائن جديد للتعرف على الصوت
            const recognition = new SpeechRecognition();
            
            // إعداد خيارات التعرف على الصوت
            recognition.lang = 'ar-SA'; // تعيين اللغة العربية
            recognition.continuous = false; // التعرف على جملة واحدة فقط
            recognition.interimResults = true; // عرض النتائج المؤقتة
            
            // تغيير مظهر الزر ليعكس حالة الاستماع
            button.classList.add('listening');
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-microphone');
                icon.classList.add('fa-spinner');
                icon.classList.add('fa-pulse');
            }
            
            // إضافة مؤشر التسجيل النشط
            const recordingIndicator = document.createElement('div');
            recordingIndicator.className = 'recording-indicator';
            recordingIndicator.textContent = 'جارٍ الاستماع... تحدث الآن';
            document.body.appendChild(recordingIndicator);
            
            // إظهار إشعار للمستخدم
            if (typeof window.showNotification === 'function') {
                window.showNotification('جارٍ الاستماع... تحدث الآن', 'info');
            }
            
            // مستمع حدث لنتائج التعرف
            recognition.onresult = function(event) {
                const speechResult = event.results[0][0].transcript;
                console.log(`نتيجة التعرف: "${speechResult}" (الثقة: ${event.results[0][0].confidence})`);
                
                // تحديث قيمة حقل الإدخال بالنص المتعرف عليه
                inputField.value = speechResult;
                
                // إطلاق أحداث تغيير وإدخال للحقل
                inputField.dispatchEvent(new Event('change', { bubbles: true }));
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
            };
            
            // مستمع حدث لانتهاء التعرف
            recognition.onend = function() {
                // إعادة تعيين حالة الزر
                button.classList.remove('listening');
                if (icon) {
                    icon.classList.remove('fa-spinner');
                    icon.classList.remove('fa-pulse');
                    icon.classList.add('fa-microphone');
                }
                
                // إزالة مؤشر التسجيل
                if (recordingIndicator.parentNode) {
                    recordingIndicator.parentNode.removeChild(recordingIndicator);
                }
                
                // عرض إشعار نجاح
                if (inputField.value && typeof window.showNotification === 'function') {
                    window.showNotification('تم التعرف بنجاح!', 'success');
                }
            };
            
            // مستمع حدث للأخطاء
            recognition.onerror = function(event) {
                console.error(`خطأ في التعرف على الصوت: ${event.error}`);
                
                // إعادة تعيين حالة الزر
                button.classList.remove('listening');
                if (icon) {
                    icon.classList.remove('fa-spinner');
                    icon.classList.remove('fa-pulse');
                    icon.classList.add('fa-microphone');
                }
                
                // إزالة مؤشر التسجيل
                if (recordingIndicator.parentNode) {
                    recordingIndicator.parentNode.removeChild(recordingIndicator);
                }
                
                // عرض إشعار خطأ حسب نوع الخطأ
                if (typeof window.showNotification === 'function') {
                    let errorMessage = 'حدث خطأ في التعرف على الصوت';
                    
                    switch(event.error) {
                        case 'no-speech':
                            errorMessage = 'لم يتم اكتشاف أي كلام';
                            break;
                        case 'audio-capture':
                            errorMessage = 'تعذر الوصول إلى المايكروفون';
                            break;
                        case 'not-allowed':
                            errorMessage = 'تم رفض الوصول إلى المايكروفون';
                            break;
                        case 'network':
                            errorMessage = 'حدث خطأ في الشبكة';
                            break;
                    }
                    
                    window.showNotification(errorMessage, 'error');
                }
            };
            
            // بدء عملية التعرف على الصوت
            recognition.start();
            console.log('بدأ الاستماع للصوت...');
            
            // إرجاع كائن التعرف على الصوت
            return recognition;
            
        } catch (error) {
            console.error('خطأ في بدء التعرف على الصوت:', error);
            
            if (typeof window.showNotification === 'function') {
                window.showNotification('تعذر بدء التعرف على الصوت', 'error');
            }
            
            // إعادة تعيين حالة الزر
            button.classList.remove('listening');
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-spinner');
                icon.classList.remove('fa-pulse');
                icon.classList.add('fa-microphone');
            }
            
            return null;
        }
    }
    
    // إضافة أنماط CSS للتعرف على الصوت
    function addSpeechRecognitionStyles() {
        // التحقق من وجود أنماط مسبقة
        if (document.getElementById('speech-recognition-styles')) {
            return;
        }
        
        // إنشاء عنصر النمط
        const styleElement = document.createElement('style');
        styleElement.id = 'speech-recognition-styles';
        
        // إضافة أنماط CSS
        styleElement.textContent = `
            /* نمط زر المايكروفون */
            .mic-btn {
                position: relative;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            /* زر المايكروفون عند حالة الاستماع */
            .mic-btn.listening {
                background-color: #f44336;
                color: white;
                border-color: #d32f2f;
                box-shadow: 0 0 0 4px rgba(244, 67, 54, 0.3);
            }
            
            /* زر المايكروفون في حالة عدم الدعم */
            .mic-btn.not-supported {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            /* مؤشر التسجيل النشط */
            .recording-indicator {
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #f44336;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                animation: pulse 1.5s infinite;
            }
            
            .recording-indicator::before {
                content: "●";
                margin-left: 8px;
                animation: blink 1s infinite;
            }
            
            /* تنشيط نبض للمؤشر */
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.6; }
                100% { opacity: 1; }
            }
            
            @keyframes blink {
                0% { opacity: 1; }
                50% { opacity: 0.3; }
                100% { opacity: 1; }
            }
            
            /* زر المساعدة للتعرف على الصوت */
            .speech-help-btn {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 1000;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: #3498db;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .speech-help-btn:hover {
                transform: scale(1.1);
                background-color: #2980b9;
            }
            
            /* محتوى نافذة المساعدة */
            .speech-help-content {
                direction: rtl;
                text-align: right;
            }
            
            .speech-help-content h3 {
                color: #3498db;
                margin-bottom: 15px;
            }
            
            .speech-help-content ol {
                padding-right: 20px;
                margin-bottom: 15px;
            }
            
            .speech-help-content li {
                margin-bottom: 8px;
            }
            
            .speech-help-content .note {
                background-color: #f8f9fa;
                border-right: 3px solid #3498db;
                padding: 10px;
                border-radius: 4px;
            }
        `;
        
        // إضافة عنصر النمط إلى رأس الصفحة
        document.head.appendChild(styleElement);
        console.log('تم إضافة أنماط CSS للتعرف على الصوت');
    }
    
    // تنفيذ إعداد التعرف على الصوت
    setTimeout(function() {
        if (typeof window.setupSpeechRecognition === 'function') {
            window.setupSpeechRecognition();
        }
    }, 300);
    
    console.log('تم إصلاح نظام التعرف على الصوت');
}