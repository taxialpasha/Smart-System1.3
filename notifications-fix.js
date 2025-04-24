/**
 * سكربت إصلاح تكامل نظام التنبيهات
 * يعالج مشاكل نظام التنبيهات ويضمن التوافق بين مختلف الملفات
 */
(function() {
    // التأكد من تحميل الصفحة أولاً
    document.addEventListener('DOMContentLoaded', function() {
        console.log('تطبيق إصلاحات نظام التنبيهات...');
        
        // إنشاء كائن نظام التنبيهات إذا لم يكن موجوداً
        if (!window.notificationsSystem) {
            window.notificationsSystem = {};
        }
        
        // تعريف دالة init إذا لم تكن موجودة
        if (!window.notificationsSystem.init) {
            window.notificationsSystem.init = function() {
                console.log('تهيئة نظام التنبيهات (النسخة المصححة)...');
                
                // إعداد زر التنبيهات
                setupNotificationButton();
                
                // تحديث التنبيهات عند تحميل الصفحة
                updateNotifications();
                
                // إضافة مستمعي الأحداث للتحديث الدوري
                setupNotificationsEvents();
            };
        }
        
        // تعريف دالة getDueInvestors إذا لم تكن موجودة
        if (!window.notificationsSystem.getDueInvestors) {
            window.notificationsSystem.getDueInvestors = function() {
                try {
                    // استخدام نسخة آمنة للحصول على المستثمرين
                    const investors = window.investors || [];
                    
                    const dueInvestors = [];
                    const today = new Date();
                    const settings = window.settings || { profitCycle: 30, interestRate: 17.5 };
                    
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
                        
                        // حساب ما إذا كان المستثمر مستحقًا للربح
                        if (daysElapsed >= (settings.profitCycle || 30)) {
                            // حساب الربح المستحق
                            let profit = 0;
                            
                            // التأكد من وجود استثمارات
                            if (investor.investments && Array.isArray(investor.investments)) {
                                profit = investor.investments.reduce((total, inv) => {
                                    if (!inv || !inv.amount) return total;
                                    
                                    // استخدام دالة حساب الفائدة إذا كانت موجودة
                                    if (typeof window.calculateInterest === 'function') {
                                        return total + window.calculateInterest(inv.amount, inv.date);
                                    }
                                    
                                    // حساب بسيط للفائدة إذا لم تكن الدالة موجودة
                                    const rate = (settings.interestRate || 17.5) / 100;
                                    return total + (inv.amount * rate);
                                }, 0);
                            }
                            
                            // إضافة المستثمر إلى القائمة مع الربح المستحق
                            dueInvestors.push({
                                investor: investor,
                                profit: profit,
                                daysElapsed: daysElapsed,
                                dueDate: new Date(investmentDate.getTime() + ((settings.profitCycle || 30) * 24 * 60 * 60 * 1000))
                            });
                        }
                    });
                    
                    // ترتيب القائمة حسب أقدمية تاريخ الاستحقاق
                    dueInvestors.sort((a, b) => a.dueDate - b.dueDate);
                    
                    return dueInvestors;
                } catch (error) {
                    console.error("خطأ في الحصول على المستثمرين المستحقين للربح:", error);
                    return [];
                }
            };
        }
        
        // تعريف دالة update إذا لم تكن موجودة
        if (!window.notificationsSystem.update) {
            window.notificationsSystem.update = function() {
                try {
                    const dueInvestors = this.getDueInvestors();
                    
                    // تحديث عرض التنبيهات
                    updateNotificationsList(dueInvestors);
                    
                    // تحديث عدد التنبيهات
                    updateNotificationBadge(dueInvestors.length);
                } catch (error) {
                    console.error('خطأ في تحديث التنبيهات:', error);
                }
            };
        }

        // إضافة زر المساعدة للتعرف على الصوت
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
                if (typeof window.showSpeechHelpModal === 'function') {
                    window.showSpeechHelpModal();
                } else {
                    showSpeechHelpModal();
                }
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
                alert('مساعدة الإدخال الصوتي غير متوفرة حالياً');
            }
        };
        
        // دالة تهيئة نظام التنبيهات المستحقة
        function initializeNotificationSystem() {
            if (typeof window.notificationsSystem !== 'undefined' && 
                typeof window.notificationsSystem.init === 'function') {
                window.notificationsSystem.init();
            } else if (typeof initNotificationsSystem === 'function') {
                initNotificationsSystem();
            } else {
                console.log('تعذر تهيئة نظام التنبيهات: الدالة غير موجودة');
            }
        }
        
        // استدعاء دالة التهيئة
        setTimeout(initializeNotificationSystem, 500);
        
        console.log('تم تطبيق إصلاحات نظام التنبيهات بنجاح');
    });
    
    // دوال مساعدة
    function updateNotificationsList(dueInvestors) {
        // الحصول على عناصر قوائم التنبيهات
        const dueProfitsList = document.getElementById('due-profits-list');
        const allNotificationsList = document.getElementById('all-notifications-list');
        
        if (!dueProfitsList || !allNotificationsList) {
            return;
        }
        
        // تحديث قائمة الأرباح المستحقة
        if (dueInvestors && dueInvestors.length > 0) {
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
            });
            
            // إضافة مستمعي الأحداث إلى قائمة الأرباح المستحقة
            setupNotificationButtons(dueProfitsList);
        } else {
            dueProfitsList.innerHTML = '<div class="notification-empty">لا توجد أرباح مستحقة حالياً</div>';
        }
        
        // نسخ نفس المحتوى إلى قائمة جميع التنبيهات
        allNotificationsList.innerHTML = dueProfitsList.innerHTML;
        
        // إضافة مستمعي الأحداث إلى قائمة جميع التنبيهات
        if (dueInvestors && dueInvestors.length > 0) {
            setupNotificationButtons(allNotificationsList);
        }
        
        // تحديث عدد التنبيهات في علامات التبويب
        const dueProfitsCount = document.getElementById('due-profits-count');
        if (dueProfitsCount) {
            dueProfitsCount.textContent = dueInvestors ? dueInvestors.length : 0;
        }
        
        const allNotificationsCount = document.getElementById('all-notifications-count');
        if (allNotificationsCount) {
            allNotificationsCount.textContent = dueInvestors ? dueInvestors.length : 0;
        }
    }
    
    function setupNotificationButtons(container) {
        if (!container) return;
        
        // أزرار دفع الربح
        const payProfitButtons = container.querySelectorAll('.pay-profit-btn');
        payProfitButtons.forEach(button => {
            button.addEventListener('click', function() {
                const investorId = this.getAttribute('data-investor-id');
                
                // إغلاق نافذة التنبيهات
                closeModal('notifications-modal');
                
                // فتح نافذة دفع الربح
                openProfitPaymentModal(investorId);
            });
        });
        
        // أزرار عرض التفاصيل
        const viewInvestorButtons = container.querySelectorAll('.view-investor-btn');
        viewInvestorButtons.forEach(button => {
            button.addEventListener('click', function() {
                const investorId = this.getAttribute('data-investor-id');
                
                // إغلاق نافذة التنبيهات
                closeModal('notifications-modal');
                
                // فتح نافذة تفاصيل المستثمر
                if (typeof window.showInvestorDetails === 'function') {
                    window.showInvestorDetails(investorId);
                }
            });
        });
    }
    
    function updateNotificationBadge(count) {
        // تحديث علامة عدد التنبيهات في زر التنبيهات
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }
    
    function setupNotificationButton() {
        // العثور على زر التنبيهات
        const notificationBtn = document.getElementById('notification-btn');
        
        if (!notificationBtn) {
            console.error('لم يتم العثور على زر التنبيهات');
            return;
        }
        
        // التأكد من وجود شارة العدد
        let badgeElement = document.getElementById('notification-badge');
        if (!badgeElement) {
            badgeElement = document.createElement('span');
            badgeElement.className = 'notification-badge';
            badgeElement.id = 'notification-badge';
            badgeElement.style.display = 'none'; // إخفاء مبدئيًا حتى يتم تحديث العدد
            
            // إضافة العنصر إلى زر التنبيهات
            notificationBtn.appendChild(badgeElement);
        }
        
        // إضافة مستمع لحدث النقر على زر التنبيهات
        notificationBtn.addEventListener('click', function() {
            // عرض نافذة التنبيهات
            if (typeof window.openModal === 'function') {
                window.openModal('notifications-modal');
            } else if (typeof showNotificationsModal === 'function') {
                showNotificationsModal();
            } else {
                const modal = document.getElementById('notifications-modal');
                if (modal) {
                    modal.classList.add('active');
                }
            }
        });
    }
    
    function setupNotificationsEvents() {
        // تحديث التنبيهات كل دقيقة
        setInterval(function() {
            if (window.notificationsSystem && typeof window.notificationsSystem.update === 'function') {
                window.notificationsSystem.update();
            }
        }, 60000);
        
        // تحديث التنبيهات عند إضافة مستثمر جديد
        document.addEventListener('investor:update', function() {
            if (window.notificationsSystem && typeof window.notificationsSystem.update === 'function') {
                window.notificationsSystem.update();
            }
        });
        
        // تحديث التنبيهات عند إضافة عملية جديدة
        document.addEventListener('transaction:update', function() {
            if (window.notificationsSystem && typeof window.notificationsSystem.update === 'function') {
                window.notificationsSystem.update();
            }
        });
    }
    
    function openProfitPaymentModal(investorId) {
        const profitInvestorSelect = document.getElementById('profit-investor');
        
        if (!profitInvestorSelect) {
            console.error('لم يتم العثور على نموذج دفع الربح');
            return;
        }
        
        // تعيين المستثمر المحدد
        profitInvestorSelect.value = investorId;
        
        // حساب الربح للمستثمر (إذا كانت الدالة موجودة)
        if (typeof window.calculateProfitForInvestor === 'function') {
            window.calculateProfitForInvestor();
        }
        
        // فتح نافذة دفع الربح
        if (typeof window.openModal === 'function') {
            window.openModal('pay-profit-modal');
        } else {
            const modal = document.getElementById('pay-profit-modal');
            if (modal) {
                modal.classList.add('active');
            }
        }
    }
    
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // محاولة إضافة أنماط CSS للتنبيهات إذا لم تكن موجودة
    function addNotificationStyles() {
        // التحقق من وجود أنماط مسبقة
        if (document.getElementById('notifications-styles')) {
            return;
        }
        
        // إنشاء عنصر النمط
        const styleElement = document.createElement('style');
        styleElement.id = 'notifications-styles';
        
        // إضافة أنماط CSS
        styleElement.textContent = `
            /* علامة عدد التنبيهات */
            .notification-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background-color: #f44336;
                color: white;
                border-radius: 50%;
                min-width: 18px;
                height: 18px;
                padding: 0 5px;
                font-size: 11px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            
            /* علامة التبويب */
            .tab-badge {
                background-color: #f44336;
                color: white;
                border-radius: 50%;
                min-width: 18px;
                height: 18px;
                padding: 0 5px;
                font-size: 11px;
                font-weight: bold;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-right: 6px;
            }
            
            /* قائمة التنبيهات */
            .notifications-list {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .notification-item {
                display: flex;
                padding: 16px;
                border-bottom: 1px solid #e0e0e0;
                transition: background-color 0.3s ease;
                position: relative;
                cursor: pointer;
            }
            
            .notification-item:hover {
                background-color: #f5f9ff;
            }
            
            .notification-icon {
                min-width: 40px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: #e0f2fe;
                color: #0284c7;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 16px;
            }
            
            .notification-icon.success {
                background-color: #dcfce7;
                color: #16a34a;
            }
            
            .notification-details {
                flex: 1;
            }
            
            .notification-title {
                font-weight: 600;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .notification-unread-badge {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #3b82f6;
                display: inline-block;
                margin-right: 8px;
            }
            
            .notification-message {
                color: #4b5563;
                font-size: 0.9rem;
                margin-bottom: 10px;
            }
            
            .notification-actions {
                display: flex;
                gap: 8px;
            }
            
            .notification-empty {
                padding: 32px 16px;
                text-align: center;
                color: #6b7280;
                font-style: italic;
            }
        `;
        
        // إضافة عنصر النمط إلى رأس الصفحة
        document.head.appendChild(styleElement);
    }
    
    // إضافة أنماط CSS للتنبيهات
    addNotificationStyles();
    
    function updateNotifications() {
        try {
            if (window.notificationsSystem && typeof window.notificationsSystem.getDueInvestors === 'function') {
                const dueInvestors = window.notificationsSystem.getDueInvestors();
                
                // تحديث قائمة التنبيهات
                updateNotificationsList(dueInvestors);
                
                // تحديث عدد التنبيهات
                updateNotificationBadge(dueInvestors.length);
            }
        } catch (error) {
            console.error("خطأ في تحديث التنبيهات:", error);
        }
    }
})();