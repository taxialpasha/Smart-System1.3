/**
 * تكامل نظام بطاقات المستثمرين مع التطبيق الأساسي
 * يوفر هذا الملف دوال إضافية لضمان تكامل نظام البطاقات مع أجزاء التطبيق الأخرى
 */

// دالة للتأكد من تحديث بطاقات المستثمرين عند تحديث بيانات المستثمرين
function setupInvestorCardIntegration() {
    // الاستماع لأحداث تحديث المستثمرين
    document.addEventListener('investor:update', function(e) {
        // تحديث بطاقات المستثمرين المرتبطة
        updateInvestorCardsAfterInvestorUpdate(e.detail ? e.detail.investorId : null);
    });

    // إضافة اختصار للبطاقات في صفحة المستثمرين
    addCardShortcutToInvestorTable();

    // ربط إنشاء البطاقات مع نافذة تفاصيل المستثمر
    addCardButtonToInvestorDetails();

    // إضافة عرض البطاقة عند البحث عن مستثمر
    integrateCardWithSearch();

    // إضافة تبويب البطاقات في نافذة تفاصيل المستثمر
    addCardTabToInvestorDetails();
    
    // تكامل مع البحث الرئيسي
    integrateWithMainSearch();

    console.log('تم إعداد تكامل نظام بطاقات المستثمرين مع التطبيق الأساسي');
}

/**
 * إضافة زر بطاقة للمستثمر في جدول المستثمرين
 */
function addCardShortcutToInvestorTable() {
    // انتظار حتى يتم تحميل جدول المستثمرين
    const observer = new MutationObserver((mutations, obs) => {
        const table = document.getElementById('investors-table');
        if (!table) return;
        
        // التحقق من وجود عناصر tr في الجدول
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) return;
        
        // إضافة عنوان العمود في الترويسة
        const headerRow = table.querySelector('thead tr');
        if (headerRow && !headerRow.querySelector('th.card-column')) {
            const cardHeader = document.createElement('th');
            cardHeader.className = 'card-column';
            cardHeader.textContent = 'البطاقة';
            headerRow.insertBefore(cardHeader, headerRow.lastElementChild);
        }
        
        // إضافة زر البطاقة لكل صف
        rows.forEach(row => {
            // التحقق من وجود الزر مسبقاً
            if (row.querySelector('.card-action-btn')) return;
            
            // الحصول على معرف المستثمر
            const investorId = row.querySelector('.investor-action-btn')?.getAttribute('data-id');
            if (!investorId) return;
            
            // إنشاء خلية البطاقة
            const cardCell = document.createElement('td');
            
            // الحصول على بطاقات المستثمر
            const cards = InvestorCardSystem._getInvestorCards();
            const investorCards = cards.filter(card => card.investorId === investorId);
            
            // إنشاء زر البطاقة
            let cardButton;
            
            if (investorCards.length > 0) {
                // المستثمر لديه بطاقة
                const activeCard = investorCards.find(card => card.status === 'active');
                
                cardButton = document.createElement('button');
                cardButton.className = 'btn btn-sm ' + (activeCard ? 'btn-info' : 'btn-outline');
                cardButton.innerHTML = '<i class="fas fa-id-card"></i>';
                cardButton.title = activeCard ? 'عرض البطاقة' : 'بطاقة غير نشطة';
                cardButton.setAttribute('data-investor-id', investorId);
                
                // إضافة مستمع الحدث
                cardButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (activeCard) {
                        // عرض البطاقة النشطة
                        InvestorCardSystem.showCardDetails(activeCard.id);
                        // فتح نافذة البطاقة
                        openModal('show-card-modal');
                    } else {
                        // سؤال المستخدم إذا كان يريد إنشاء بطاقة جديدة
                        if (confirm('هذا المستثمر ليس لديه بطاقة نشطة. هل تريد إنشاء بطاقة جديدة؟')) {
                            // فتح نافذة إنشاء البطاقة وتحديد المستثمر
                            openCreateCardModalForInvestor(investorId);
                        }
                    }
                });
            } else {
                // المستثمر ليس لديه بطاقة
                cardButton = document.createElement('button');
                cardButton.className = 'btn btn-sm btn-outline';
                cardButton.innerHTML = '<i class="fas fa-plus"></i>';
                cardButton.title = 'إنشاء بطاقة';
                cardButton.setAttribute('data-investor-id', investorId);
                
                // إضافة مستمع الحدث
                cardButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // فتح نافذة إنشاء البطاقة وتحديد المستثمر
                    openCreateCardModalForInvestor(investorId);
                });
            }
            
            // إضافة الزر إلى الخلية
            cardButton.classList.add('card-action-btn');
            cardCell.appendChild(cardButton);
            
            // إضافة الخلية إلى الصف قبل خلية الإجراءات
            row.insertBefore(cardCell, row.lastElementChild);
        });
        
        // إيقاف المراقبة بعد إضافة الأزرار
        obs.disconnect();
        
        // إعادة تعيين المراقبة على جدول المستثمرين لدعم التحميل اللاحق
        setupInvestorTableObserver();
    });
    
    // بدء المراقبة
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * إعداد مراقب جدول المستثمرين
 */
function setupInvestorTableObserver() {
    const observer = new MutationObserver((mutations) => {
        const investorsTable = document.getElementById('investors-table');
        if (!investorsTable) return;
        
        const tbody = investorsTable.querySelector('tbody');
        if (!tbody) return;
        
        // التحقق من إضافة صفوف جديدة
        if (tbody.querySelectorAll('tr:not(.processed-row)').length > 0) {
            // تطبيق زر البطاقة على الصفوف الجديدة
            addCardButtonsToNewRows(tbody);
        }
    });
    
    // بدء المراقبة على الجدول
    const investorsTable = document.getElementById('investors-table');
    if (investorsTable) {
        observer.observe(investorsTable, {
            childList: true,
            subtree: true
        });
    }
}

/**
 * إضافة أزرار البطاقات للصفوف الجديدة
 * @param {HTMLElement} tbody عنصر tbody
 */
function addCardButtonsToNewRows(tbody) {
    const newRows = tbody.querySelectorAll('tr:not(.processed-row)');
    
    newRows.forEach(row => {
        // وضع علامة على الصف
        row.classList.add('processed-row');
        
        // الحصول على معرف المستثمر
        const investorId = row.querySelector('.investor-action-btn')?.getAttribute('data-id');
        if (!investorId) return;
        
        // البحث عن خلية البطاقة
        let cardCell = Array.from(row.cells).find(cell => cell.querySelector('.card-action-btn'));
        
        // إنشاء خلية البطاقة إذا لم تكن موجودة
        if (!cardCell) {
            cardCell = document.createElement('td');
            // إضافة الخلية قبل خلية الإجراءات
            row.insertBefore(cardCell, row.lastElementChild);
        } else {
            // تفريغ الخلية إذا كانت موجودة
            cardCell.innerHTML = '';
        }
        
        // الحصول على بطاقات المستثمر
        const cards = InvestorCardSystem._getInvestorCards();
        const investorCards = cards.filter(card => card.investorId === investorId);
        
        // إنشاء زر البطاقة
        let cardButton;
        
        if (investorCards.length > 0) {
            // المستثمر لديه بطاقة
            const activeCard = investorCards.find(card => card.status === 'active');
            
            cardButton = document.createElement('button');
            cardButton.className = 'btn btn-sm ' + (activeCard ? 'btn-info' : 'btn-outline');
            cardButton.innerHTML = '<i class="fas fa-id-card"></i>';
            cardButton.title = activeCard ? 'عرض البطاقة' : 'بطاقة غير نشطة';
            cardButton.setAttribute('data-investor-id', investorId);
            
            // إضافة مستمع الحدث
            cardButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (activeCard) {
                    // عرض البطاقة النشطة
                    InvestorCardSystem.showCardDetails(activeCard.id);
                    // فتح نافذة البطاقة
                    openModal('show-card-modal');
                } else {
                    // سؤال المستخدم إذا كان يريد إنشاء بطاقة جديدة
                    if (confirm('هذا المستثمر ليس لديه بطاقة نشطة. هل تريد إنشاء بطاقة جديدة؟')) {
                        // فتح نافذة إنشاء البطاقة وتحديد المستثمر
                        openCreateCardModalForInvestor(investorId);
                    }
                }
            });
        } else {
            // المستثمر ليس لديه بطاقة
            cardButton = document.createElement('button');
            cardButton.className = 'btn btn-sm btn-outline';
            cardButton.innerHTML = '<i class="fas fa-plus"></i>';
            cardButton.title = 'إنشاء بطاقة';
            cardButton.setAttribute('data-investor-id', investorId);
            
            // إضافة مستمع الحدث
            cardButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // فتح نافذة إنشاء البطاقة وتحديد المستثمر
                openCreateCardModalForInvestor(investorId);
            });
        }
        
        // إضافة الزر إلى الخلية
        cardButton.classList.add('card-action-btn');
        cardCell.appendChild(cardButton);
    });
}

/**
 * فتح نافذة إنشاء البطاقة مع تحديد المستثمر
 * @param {string} investorId معرف المستثمر
 */
function openCreateCardModalForInvestor(investorId) {
    // فتح نافذة إنشاء البطاقة
    InvestorCardSystem.openCreateCardModal();
    
    // تحديد المستثمر في النموذج
    setTimeout(() => {
        const selectElement = document.getElementById('card-investor');
        if (selectElement) {
            selectElement.value = investorId;
            
            // إطلاق حدث التغيير لتحديث المعاينة
            const event = new Event('change');
            selectElement.dispatchEvent(event);
        }
    }, 300);
}

/**
 * إضافة زر بطاقة إلى نافذة تفاصيل المستثمر
 */
function addCardButtonToInvestorDetails() {
    // انتظار ظهور نافذة تفاصيل المستثمر
    const observer = new MutationObserver((mutations) => {
        const detailsModal = document.getElementById('investor-details-modal');
        if (!detailsModal || !detailsModal.classList.contains('active')) return;
        
        // البحث عن شريط أزرار الإجراءات
        const actionsDiv = detailsModal.querySelector('.investor-actions-big');
        if (!actionsDiv) return;
        
        // التحقق من وجود زر البطاقة مسبقاً
        if (actionsDiv.querySelector('.card-btn')) return;
        
        // الحصول على معرف المستثمر من عناصر الأزرار الأخرى
        const buttons = actionsDiv.querySelectorAll('button');
        let investorId = null;
        
        for (const button of buttons) {
            // محاولة استخراج المعرف من onclick
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('(')) {
                const match = onclickAttr.match(/'([^']+)'/);
                if (match && match[1]) {
                    investorId = match[1];
                    break;
                }
            }
        }
        
        if (!investorId) return;
        
        // الحصول على بطاقات المستثمر
        const cards = InvestorCardSystem._getInvestorCards();
        const investorCards = cards.filter(card => card.investorId === investorId);
        const activeCard = investorCards.find(card => card.status === 'active');
        
        // إنشاء زر البطاقة
        const cardButton = document.createElement('button');
        cardButton.className = 'btn ' + (activeCard ? 'btn-info' : 'btn-primary');
        cardButton.classList.add('card-btn');
        
        if (activeCard) {
            cardButton.innerHTML = '<i class="fas fa-id-card"></i> عرض البطاقة';
        } else {
            cardButton.innerHTML = '<i class="fas fa-plus"></i> إنشاء بطاقة';
        }
        
        // إضافة مستمع الحدث
        cardButton.addEventListener('click', function() {
            if (activeCard) {
                // إغلاق نافذة التفاصيل
                closeModal('investor-details-modal');
                
                // عرض البطاقة النشطة
                setTimeout(() => {
                    InvestorCardSystem.showCardDetails(activeCard.id);
                    // فتح نافذة البطاقة
                    openModal('show-card-modal');
                }, 300);
            } else {
                // إغلاق نافذة التفاصيل
                closeModal('investor-details-modal');
                
                // فتح نافذة إنشاء البطاقة وتحديد المستثمر
                setTimeout(() => {
                    openCreateCardModalForInvestor(investorId);
                }, 300);
            }
        });
        
        // إضافة الزر إلى شريط الإجراءات
        actionsDiv.appendChild(cardButton);
    });
    
    // بدء المراقبة
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

/**
 * تكامل البطاقات مع وظيفة البحث
 */
function integrateCardWithSearch() {
    // انتظار تحميل نظام البحث
    const observer = new MutationObserver((mutations) => {
        // التحقق من وجود مربع البحث
        const searchInput = document.querySelector('#investors-page .search-input');
        if (!searchInput) return;
        
        // تحقق مما إذا تم إضافة مستمع الحدث مسبقاً
        if (searchInput.hasAttribute('data-card-search-setup')) return;
        
        // وضع علامة على مربع البحث
        searchInput.setAttribute('data-card-search-setup', 'true');
        
        // إضافة مستمع الحدث للبحث
        searchInput.addEventListener('input', function() {
            // الحصول على نص البحث
            const searchText = this.value.trim().toLowerCase();
            if (!searchText) return;
            
            // البحث عن بطاقات المستثمرين
            const cards = InvestorCardSystem._getInvestorCards();
            
            // البحث في البطاقات (حسب رقم البطاقة أو الباركود)
            const matchingCards = cards.filter(card => 
                card.cardNumber.replace(/\s/g, '').includes(searchText.replace(/\s/g, '')) ||
                card.barcode.includes(searchText)
            );
            
            if (matchingCards.length > 0) {
                // إنشاء نتائج البحث
                createCardSearchResults(matchingCards, searchText);
            }
        });
    });
    
    // بدء المراقبة
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * إنشاء نتائج البحث للبطاقات
 * @param {Array} matchingCards البطاقات المطابقة
 * @param {string} searchText نص البحث
 */
function createCardSearchResults(matchingCards, searchText) {
    // التحقق من وجود حاوية نتائج البحث
    let resultsContainer = document.getElementById('card-search-results');
    
    if (!resultsContainer) {
        // إنشاء حاوية نتائج البحث
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'card-search-results';
        resultsContainer.className = 'card-search-results';
        
        // أنماط CSS
        resultsContainer.style.position = 'absolute';
        resultsContainer.style.top = '60px';
        resultsContainer.style.left = '0';
        resultsContainer.style.right = '0';
        resultsContainer.style.zIndex = '1000';
        resultsContainer.style.backgroundColor = '#fff';
        resultsContainer.style.borderRadius = '0 0 10px 10px';
        resultsContainer.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        resultsContainer.style.maxHeight = '300px';
        resultsContainer.style.overflowY = 'auto';
        resultsContainer.style.padding = '10px';
        
        // إضافة الحاوية إلى صفحة المستثمرين
        const searchBox = document.querySelector('#investors-page .search-box');
        if (searchBox) {
            searchBox.style.position = 'relative';
            searchBox.appendChild(resultsContainer);
            
            // إغلاق نتائج البحث عند النقر خارجها
            document.addEventListener('click', function(e) {
                if (!searchBox.contains(e.target)) {
                    resultsContainer.style.display = 'none';
                }
            });
        }
    }
    
    // إظهار نتائج البحث
    resultsContainer.style.display = 'block';
    
    // إنشاء محتوى نتائج البحث
    let resultsHTML = `
        <div class="card-search-header">
            <strong>نتائج البحث في البطاقات:</strong>
            <span class="card-search-count">${matchingCards.length} بطاقة</span>
        </div>
    `;
    
    // إضافة النتائج
    matchingCards.forEach(card => {
        const cardNumberHighlighted = highlightSearchText(formatCardNumber(card.cardNumber), searchText);
        const barcodeHighlighted = highlightSearchText(card.barcode, searchText);
        
        resultsHTML += `
            <div class="card-search-item" data-card-id="${card.id}">
                <div class="card-search-info">
                    <div class="card-holder-name">${card.investorName}</div>
                    <div class="card-number">${cardNumberHighlighted}</div>
                    <div class="card-barcode">${barcodeHighlighted}</div>
                </div>
                <div class="card-search-action">
                    <button class="btn btn-sm btn-outline view-card-btn">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    // تعيين المحتوى
    resultsContainer.innerHTML = resultsHTML;
    
    // إضافة مستمعي الأحداث لأزرار عرض البطاقة
    resultsContainer.querySelectorAll('.view-card-btn').forEach(button => {
        button.addEventListener('click', function() {
            // الحصول على معرف البطاقة
            const cardItem = this.closest('.card-search-item');
            const cardId = cardItem.getAttribute('data-card-id');
            
            // إخفاء نتائج البحث
            resultsContainer.style.display = 'none';
            
            // عرض البطاقة
            InvestorCardSystem.showCardDetails(cardId);
            // فتح نافذة البطاقة
            openModal('show-card-modal');
        });
    });
    
    // إضافة مستمعي الأحداث لعناصر النتائج
    resultsContainer.querySelectorAll('.card-search-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // تجاهل النقر على الزر
            if (e.target.classList.contains('btn') || e.target.closest('.btn')) return;
            
            // الحصول على معرف البطاقة
            const cardId = this.getAttribute('data-card-id');
            
            // إخفاء نتائج البحث
            resultsContainer.style.display = 'none';
            
            // عرض البطاقة
            InvestorCardSystem.showCardDetails(cardId);
            // فتح نافذة البطاقة
            openModal('show-card-modal');
        });
    });
}

/**
 * تمييز نص البحث في النص
 * @param {string} text النص الأصلي
 * @param {string} searchText نص البحث
 * @returns {string} النص مع تمييز نص البحث
 */
function highlightSearchText(text, searchText) {
    if (!searchText) return text;
    
    const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\    console.log('تم إعداد تكامل نظام بطاقات المستثمرين مع التطبيق الأساسي');
}'), 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
}

/**
 * إضافة تبويب البطاقات في نافذة تفاصيل المستثمر
 */
function addCardTabToInvestorDetails() {
    // انتظار ظهور نافذة تفاصيل المستثمر
    const observer = new MutationObserver((mutations) => {
        const detailsModal = document.getElementById('investor-details-modal');
        if (!detailsModal || !detailsModal.classList.contains('active')) return;
        
        // التحقق من وجود قسم التبويبات
        const tabs = detailsModal.querySelector('.tabs');
        if (!tabs) {
            // إنشاء قسم التبويبات إذا لم يكن موجوداً
            createTabsInInvestorDetails(detailsModal);
        } else {
            // التحقق من وجود تبويب البطاقات
            if (!tabs.querySelector('[data-tab="cards"]')) {
                // إضافة تبويب البطاقات
                addCardsTabToExistingTabs(tabs);
            }
        }
    });
    
    // بدء المراقبة
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

/**
 * إنشاء قسم التبويبات في نافذة تفاصيل المستثمر
 * @param {HTMLElement} detailsModal نافذة التفاصيل
 */
function createTabsInInvestorDetails(detailsModal) {
    // البحث عن الجسم
    const modalBody = detailsModal.querySelector('.modal-body');
    if (!modalBody) return;
    
    // الحصول على المحتوى الحالي
    const currentContent = modalBody.innerHTML;
    
    // الحصول على معرف المستثم

/**
 * تحديث بطاقات المستثمر عند تحديث بيانات المستثمر
 * @param {string} investorId معرف المستثمر المحدث (اختياري)
 */
function updateInvestorCardsAfterInvestorUpdate(investorId = null) {
    // الحصول على بطاقات المستثمرين
    const cards = InvestorCardSystem._getInvestorCards();
    
    // إذا لم يتم تحديد معرف مستثمر، تحديث جميع البطاقات
    if (!investorId) {
        // الحصول على جميع المستثمرين
        if (typeof window.investors === 'undefined' || !Array.isArray(window.investors)) {
            console.error('مصفوفة المستثمرين غير متاحة');
            return;
        }
        
        // تحديث معلومات المستثمر في كل بطاقة
        let hasChanges = false;
        
        cards.forEach(card => {
            const investor = window.investors.find(inv => inv.id === card.investorId);
            if (investor) {
                // تحديث معلومات المستثمر
                if (card.investorName !== investor.name || card.investorPhone !== investor.phone) {
                    card.investorName = investor.name;
                    card.investorPhone = investor.phone;
                    hasChanges = true;
                }
            }
        });
        
        // حفظ التغييرات إذا وجدت
        if (hasChanges) {
            localStorage.setItem('investorCards', JSON.stringify(cards));
            
            // تحديث عرض البطاقات إذا كانت صفحة البطاقات مفتوحة
            if (document.getElementById('investor-cards-page').classList.contains('active')) {
                InvestorCardSystem.renderInvestorCards();
            }
        }
        
        return;
    }
    
    // تحديث بطاقات المستثمر المحدد فقط
    const investorCards = cards.filter(card => card.investorId === investorId);
    if (investorCards.length === 0) {
        return; // لا توجد بطاقات لهذا المستثمر
    }
    
    // البحث عن المستثمر
    const investor = window.investors.find(inv => inv.id === investorId);
    if (!investor) {
        console.error('لم يتم العثور على المستثمر:', investorId);
        return;
    }
    
    // تحديث معلومات المستثمر في البطاقات
    let hasChanges = false;
    
    investorCards.forEach(card => {
        if (card.investorName !== investor.name || card.investorPhone !== investor.phone) {
            card.investorName = investor.name;
            card.investorPhone = investor.phone;
            hasChanges = true;
        }
    });
    
    // حفظ التغييرات إذا وجدت
    if (hasChanges) {
        localStorage.setItem('investorCards', JSON.stringify(cards));
        
        // تحديث عرض البطاقات إذا كانت صفحة البطاقات مفتوحة
        if (document.getElementById('investor-cards-page').classList.contains('active')) {
            InvestorCardSystem.renderInvestorCards();
        }
    }
}

// الحصول على معرف المستثمر
    let investorId = null;
    
    // محاولة استخراج معرف المستثمر من المحتوى
    const detailsContent = detailsModal.querySelector('#investor-details-content');
    if (detailsContent) {
        const actionButtons = detailsContent.querySelectorAll('button[onclick]');
        actionButtons.forEach(button => {
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('(')) {
                const match = onclickAttr.match(/'([^']+)'/);
                if (match && match[1]) {
                    investorId = match[1];
                }
            }
        });
    }
    
    if (!investorId) return;
    
    // إنشاء قسم التبويبات
    const tabsHTML = `
        <div class="tabs">
            <div class="tab-buttons">
                <button class="tab-btn active" data-tab="details">التفاصيل</button>
                <button class="tab-btn" data-tab="cards">البطاقات</button>
            </div>
            <div class="tab-content active" id="details-tab">
                ${currentContent}
            </div>
            <div class="tab-content" id="cards-tab">
                ${getInvestorCardsTabContent(investorId)}
            </div>
        </div>
    `;
    
    // استبدال المحتوى
    modalBody.innerHTML = tabsHTML;
    
    // إضافة مستمعي الأحداث للتبويبات
    modalBody.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            modalBody.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            
            // إضافة الفئة النشطة للزر المحدد
            this.classList.add('active');
            
            // إخفاء جميع المحتويات
            modalBody.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // إظهار المحتوى المحدد
            const tabId = this.getAttribute('data-tab');
            const selectedTab = modalBody.querySelector(`#${tabId}-tab`);
            if (selectedTab) {
                selectedTab.classList.add('active');
            }
        });
    });
}

/**
 * إضافة تبويب البطاقات إلى التبويبات الموجودة
 * @param {HTMLElement} tabs قسم التبويبات
 */
function addCardsTabToExistingTabs(tabs) {
    // البحث عن أزرار التبويبات
    const tabButtons = tabs.querySelector('.tab-buttons');
    if (!tabButtons) return;
    
    // البحث عن محتويات التبويبات
    const tabContents = tabs.querySelector('.tab-contents');
    if (!tabContents) return;
    
    // الحصول على معرف المستثمر
    let investorId = null;
    
    // محاولة استخراج معرف المستثمر من أزرار الإجراءات
    const detailsModal = tabs.closest('.modal');
    if (detailsModal) {
        const actionButtons = detailsModal.querySelectorAll('button[onclick]');
        actionButtons.forEach(button => {
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('(')) {
                const match = onclickAttr.match(/'([^']+)'/);
                if (match && match[1]) {
                    investorId = match[1];
                }
            }
        });
    }
    
    if (!investorId) return;
    
    // إضافة زر تبويب البطاقات
    const cardTabButton = document.createElement('button');
    cardTabButton.className = 'tab-btn';
    cardTabButton.setAttribute('data-tab', 'cards');
    cardTabButton.textContent = 'البطاقات';
    tabButtons.appendChild(cardTabButton);
    
    // إضافة محتوى تبويب البطاقات
    const cardTabContent = document.createElement('div');
    cardTabContent.className = 'tab-content';
    cardTabContent.id = 'cards-tab';
    cardTabContent.innerHTML = getInvestorCardsTabContent(investorId);
    tabContents.appendChild(cardTabContent);
    
    // إضافة مستمع الحدث لزر التبويب
    cardTabButton.addEventListener('click', function() {
        // إزالة الفئة النشطة من جميع الأزرار
        tabButtons.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        // إضافة الفئة النشطة للزر المحدد
        this.classList.add('active');
        
        // إخفاء جميع المحتويات
        tabContents.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // إظهار المحتوى المحدد
        const tabId = this.getAttribute('data-tab');
        const selectedTab = tabContents.querySelector(`#${tabId}-tab`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
    });
}

/**
 * الحصول على محتوى تبويب البطاقات
 * @param {string} investorId معرف المستثمر
 * @returns {string} HTML لمحتوى تبويب البطاقات
 */
function getInvestorCardsTabContent(investorId) {
    // الحصول على بطاقات المستثمر
    const cards = InvestorCardSystem._getInvestorCards();
    const investorCards = cards.filter(card => card.investorId === investorId);
    
    // إنشاء المحتوى
    let content = '';
    
    if (investorCards.length === 0) {
        // المستثمر ليس لديه بطاقات
        content = `
            <div class="empty-investor-cards">
                <i class="fas fa-credit-card"></i>
                <p>لم يتم إنشاء بطاقات لهذا المستثمر بعد</p>
                <button class="btn btn-primary btn-sm create-card-for-investor-btn" data-investor-id="${investorId}">
                    <i class="fas fa-plus"></i>
                    <span>إنشاء بطاقة جديدة</span>
                </button>
            </div>
        `;
    } else {
        // المستثمر لديه بطاقات
        content = `
            <div class="investor-cards-header">
                <h4>بطاقات المستثمر (${investorCards.length})</h4>
                <button class="btn btn-primary btn-sm create-card-for-investor-btn" data-investor-id="${investorId}">
                    <i class="fas fa-plus"></i>
                    <span>إنشاء بطاقة جديدة</span>
                </button>
            </div>
            <div class="investor-cards-list">
        `;
        
        // إضافة البطاقات
        investorCards.forEach(card => {
            // تحويل تاريخ الانتهاء إلى الصيغة المناسبة
            const expiryDate = new Date(card.expiryDate);
            const expMonth = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
            const expYear = expiryDate.getFullYear().toString().substr(2);
            
            // تحديد حالة البطاقة
            const isActive = card.status === 'active';
            const statusClass = isActive ? 'active' : 'inactive';
            const statusText = isActive ? 'نشطة' : 'متوقفة';
            
            content += `
                <div class="investor-card-item ${statusClass}" data-card-id="${card.id}">
                    <div class="investor-card-item-preview">
                        <div class="investor-card mini-card ${card.cardType} ${isActive ? '' : 'inactive'}">
                            <div class="mini-card-logo">
                                <i class="fas fa-university"></i>
                            </div>
                            <div class="mini-card-number">
                                ${formatCardNumber(card.cardNumber)}
                            </div>
                            <div class="mini-card-info">
                                <div class="mini-card-name">${card.investorName}</div>
                                <div class="mini-card-expiry">${expMonth}/${expYear}</div>
                            </div>
                            ${!isActive ? '<div class="mini-card-inactive">متوقفة</div>' : ''}
                        </div>
                    </div>
                    <div class="investor-card-item-info">
                        <div class="investor-card-item-detail">
                            <div class="detail-label">النوع:</div>
                            <div class="detail-value">${getCardTypeArabic(card.cardType)}</div>
                        </div>
                        <div class="investor-card-item-detail">
                            <div class="detail-label">تاريخ الإصدار:</div>
                            <div class="detail-value">${formatDate(card.createdAt)}</div>
                        </div>
                        <div class="investor-card-item-detail">
                            <div class="detail-label">تاريخ الانتهاء:</div>
                            <div class="detail-value">${formatDate(card.expiryDate)}</div>
                        </div>
                        <div class="investor-card-item-detail">
                            <div class="detail-label">الحالة:</div>
                            <div class="detail-value status-${statusClass}">${statusText}</div>
                        </div>
                    </div>
                    <div class="investor-card-item-actions">
                        <button class="btn btn-sm btn-outline view-card-btn" data-card-id="${card.id}">
                            <i class="fas fa-eye"></i>
                            <span>عرض</span>
                        </button>
                        ${isActive ? `
                            <button class="btn btn-sm btn-success print-card-btn" data-card-id="${card.id}">
                                <i class="fas fa-print"></i>
                                <span>طباعة</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        content += `
            </div>
        `;
    }
    
    return content;
}

/**
 * إضافة مستمعي الأحداث لتبويب البطاقات
 * @param {string} investorId معرف المستثمر
 */
function addCardsTabEventListeners(investorId) {
    // انتظار ظهور تبويب البطاقات
    const observer = new MutationObserver((mutations) => {
        const cardsTab = document.getElementById('cards-tab');
        if (!cardsTab || !cardsTab.classList.contains('active')) return;
        
        // أزرار إنشاء البطاقة
        const createButtons = cardsTab.querySelectorAll('.create-card-for-investor-btn');
        createButtons.forEach(button => {
            // إزالة مستمعي الأحداث السابقة
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // إضافة مستمع الحدث
            newButton.addEventListener('click', function() {
                // الحصول على معرف المستثمر
                const investorId = this.getAttribute('data-investor-id');
                
                // إغلاق نافذة التفاصيل
                closeModal('investor-details-modal');
                
                // فتح نافذة إنشاء البطاقة وتحديد المستثمر
                setTimeout(() => {
                    openCreateCardModalForInvestor(investorId);
                }, 300);
            });
        });
        
        // أزرار عرض البطاقة
        const viewButtons = cardsTab.querySelectorAll('.view-card-btn');
        viewButtons.forEach(button => {
            // إزالة مستمعي الأحداث السابقة
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // إضافة مستمع الحدث
            newButton.addEventListener('click', function() {
                // الحصول على معرف البطاقة
                const cardId = this.getAttribute('data-card-id');
                
                // إغلاق نافذة التفاصيل
                closeModal('investor-details-modal');
                
                // عرض البطاقة
                setTimeout(() => {
                    InvestorCardSystem.showCardDetails(cardId);
                    // فتح نافذة البطاقة
                    openModal('show-card-modal');
                }, 300);
            });
        });
        
        // أزرار طباعة البطاقة
        const printButtons = cardsTab.querySelectorAll('.print-card-btn');
        printButtons.forEach(button => {
            // إزالة مستمعي الأحداث السابقة
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // إضافة مستمع الحدث
            newButton.addEventListener('click', function() {
                // الحصول على معرف البطاقة
                const cardId = this.getAttribute('data-card-id');
                
                // طباعة البطاقة
                printCard(cardId);
            });
        });
        
        // عناصر البطاقات (للنقر)
        const cardItems = cardsTab.querySelectorAll('.investor-card-item');
        cardItems.forEach(item => {
            // إزالة مستمعي الأحداث السابقة
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            // إضافة مستمع الحدث
            newItem.addEventListener('click', function(e) {
                // تجاهل النقر على الأزرار
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
                
                // الحصول على معرف البطاقة
                const cardId = this.getAttribute('data-card-id');
                
                // إغلاق نافذة التفاصيل
                closeModal('investor-details-modal');
                
                // عرض البطاقة
                setTimeout(() => {
                    InvestorCardSystem.showCardDetails(cardId);
                    // فتح نافذة البطاقة
                    openModal('show-card-modal');
                }, 300);
            });
        });
    });
    
    // بدء المراقبة
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

/**
 * طباعة بطاقة محددة
 * @param {string} cardId معرف البطاقة
 */
function printCard(cardId) {
    // البحث عن البطاقة
    const cards = InvestorCardSystem._getInvestorCards();
    const card = cards.find(c => c.id === cardId);
    
    if (!card) {
        console.error('لم يتم العثور على البطاقة');
        return;
    }
    
    // إنشاء عنصر للطباعة
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
        showNotification('يرجى السماح بفتح النوافذ المنبثقة للطباعة', 'error');
        return;
    }
    
    // إعداد محتوى صفحة الطباعة
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
            <head>
                <title>طباعة بطاقة المستثمر - ${card.investorName}</title>
                <style>
                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        .print-card {
                            width: 85.6mm;
                            height: 53.98mm;
                            position: relative;
                            margin: 0 auto;
                            page-break-after: always;
                        }
                        
                        /* نسخ أنماط البطاقة */
                        ${document.getElementById('investor-card-styles').textContent}
                    }
                </style>
            </head>
            <body>
                <div class="print-card">
                    <!-- سيتم ملؤها بمحتوى البطاقة -->
                </div>
            </body>
        </html>
    `);
    
    // إضافة محتوى البطاقة
    const printCardContainer = printWindow.document.querySelector('.print-card');
    
    // إنشاء دالة لعرض البطاقة
    const renderCardHTML = function(container, card) {
        // تحويل تاريخ الانتهاء إلى الصيغة المناسبة
        const expiryDate = new Date(card.expiryDate);
        const expMonth = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
        const expYear = expiryDate.getFullYear().toString().substr(2);
        
        // إنشاء عنصر البطاقة
        container.innerHTML = `
            <div class="investor-card ${card.cardType}" data-id="${card.id}">
                <div class="investor-card-inner">
                    <div class="investor-card-front">
                        <div class="card-logo">
                            <i class="fas fa-university"></i>
                            <span class="card-logo-text">InvestCard</span>
                        </div>
                        <div class="card-chip"></div>
                        <div class="card-number">
                            ${formatCardNumber(card.cardNumber)}
                        </div>
                        <div class="card-details">
                            <div class="card-holder">
                                <div class="card-holder-label">حامل البطاقة</div>
                                <div class="card-holder-name">${card.investorName}</div>
                            </div>
                            <div class="card-expires">
                                <div class="expires-label">تنتهي في</div>
                                <div class="expires-date">${expMonth}/${expYear}</div>
                            </div>
                        </div>
                        <div class="card-type">
                            ${getCardTypeArabic(card.cardType)}
                        </div>
                    </div>
                    <div class="investor-card-back">
                        <div class="card-magnetic-stripe"></div>
                        <div class="card-signature">
                            <div class="card-signature-text">${card.investorName}</div>
                        </div>
                        <div class="card-cvv">CVV: ${card.cvv}</div>
                        <div class="card-barcode-container">
                            <img src="https://barcode.tec-it.com/barcode.ashx?data=${card.barcode}&code=Code128&multiplebarcodes=false&translate-esc=true&unit=Fit&dpi=96&imagetype=Gif&rotation=0&color=%23000000&bgcolor=%23ffffff&codepage=Default&qunit=Mm&quiet=0" alt="Barcode">
                            <div class="card-barcode-number">${card.barcode}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    
    // عرض البطاقة
    renderCardHTML(printCardContainer, card);
    
    // طباعة
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

/**
 * تكامل مع البحث الرئيسي
 */
function integrateWithMainSearch() {
    // انتظار تحميل مربع البحث الرئيسي
    const observer = new MutationObserver((mutations) => {
        const searchInput = document.querySelector('.header .search-input');
        if (!searchInput) return;
        
        // تحقق مما إذا تم إضافة مستمع الحدث مسبقاً
        if (searchInput.hasAttribute('data-card-main-search-setup')) return;
        
        // وضع علامة على مربع البحث
        searchInput.setAttribute('data-card-main-search-setup', 'true');
        
        // إضافة مستمع الحدث للبحث
        searchInput.addEventListener('input', function() {
            // الحصول على نص البحث
            const searchText = this.value.trim();
            if (!searchText) return;
            
            // البحث عن البطاقات التي تطابق رقم البطاقة أو الباركود
            const cards = InvestorCardSystem._getInvestorCards();
            
            // البحث في البطاقات
            const matchingCards = cards.filter(card => 
                card.cardNumber.replace(/\s/g, '').includes(searchText.replace(/\s/g, '')) ||
                card.barcode.includes(searchText)
            );
            
            if (matchingCards.length > 0) {
                // إنشاء نتائج البحث
                createMainSearchResults(matchingCards, searchText);
            }
        });
    });
    
    // بدء المراقبة
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * إنشاء نتائج البحث الرئيسي للبطاقات
 * @param {Array} matchingCards البطاقات المطابقة
 * @param {string} searchText نص البحث
 */
function createMainSearchResults(matchingCards, searchText) {
    // التحقق من وجود حاوية نتائج البحث
    let resultsContainer = document.getElementById('main-card-search-results');
    
    if (!resultsContainer) {
        // إنشاء حاوية نتائج البحث
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'main-card-search-results';
        resultsContainer.className = 'main-card-search-results';
        
        // أنماط CSS
        resultsContainer.style.position = 'absolute';
        resultsContainer.style.top = '100%';
        resultsContainer.style.left = '0';
        resultsContainer.style.right = '0';
        resultsContainer.style.zIndex = '1000';
        resultsContainer.style.backgroundColor = '#fff';
        resultsContainer.style.borderRadius = '0 0 10px 10px';
        resultsContainer.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        resultsContainer.style.maxHeight = '300px';
        resultsContainer.style.overflowY = 'auto';
        resultsContainer.style.padding = '10px';
        
        // إضافة الحاوية إلى مربع البحث
        const searchBox = document.querySelector('.header .search-box');
        if (searchBox) {
            searchBox.style.position = 'relative';
            searchBox.appendChild(resultsContainer);
            
            // إغلاق نتائج البحث عند النقر خارجها
            document.addEventListener('click', function(e) {
                if (!searchBox.contains(e.target)) {
                    resultsContainer.style.display = 'none';
                }
            });
        }
    }
    
    // إظهار نتائج البحث
    resultsContainer.style.display = 'block';
    
    // إنشاء محتوى نتائج البحث
    let resultsHTML = `
        <div class="card-search-header">
            <strong>بطاقات المستثمرين:</strong>
            <span class="card-search-count">${matchingCards.length} بطاقة</span>
        </div>
    `;
    
    // إضافة النتائج
    matchingCards.forEach(card => {
        const cardNumberHighlighted = highlightSearchText(formatCardNumber(card.cardNumber), searchText);
        
        resultsHTML += `
            <div class="card-search-item" data-card-id="${card.id}">
                <div class="card-search-info">
                    <div class="card-holder-name">${card.investorName}</div>
                    <div class="card-number">${cardNumberHighlighted}</div>
                </div>
                <div class="card-search-action">
                    <button class="btn btn-sm btn-outline view-card-btn">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    // تعيين المحتوى
    resultsContainer.innerHTML = resultsHTML;
    
    // إضافة مستمعي الأحداث لأزرار عرض البطاقة
    resultsContainer.querySelectorAll('.view-card-btn').forEach(button => {
        button.addEventListener('click', function() {
            // الحصول على معرف البطاقة
            const cardItem = this.closest('.card-search-item');
            const cardId = cardItem.getAttribute('data-card-id');
            
            // إخفاء نتائج البحث
            resultsContainer.style.display = 'none';
            
            // التبديل إلى صفحة البطاقات
            setTimeout(() => {
                // الانتقال إلى صفحة البطاقات
                const cardPageLink = document.querySelector('[data-page="investor-cards"]');
                if (cardPageLink) {
                    cardPageLink.click();
                }
                
                // عرض البطاقة
                setTimeout(() => {
                    InvestorCardSystem.showCardDetails(cardId);
                    // فتح نافذة البطاقة
                    openModal('show-card-modal');
                }, 300);
            }, 100);
        });
    });
    
    // إضافة مستمعي الأحداث لعناصر النتائج
    resultsContainer.querySelectorAll('.card-search-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // تجاهل النقر على الزر
            if (e.target.classList.contains('btn') || e.target.closest('.btn')) return;
            
            // الحصول على معرف البطاقة
            const cardId = this.getAttribute('data-card-id');
            
            // إخفاء نتائج البحث
            resultsContainer.style.display = 'none';
            
            // التبديل إلى صفحة البطاقات
            setTimeout(() => {
                // الانتقال إلى صفحة البطاقات
                const cardPageLink = document.querySelector('[data-page="investor-cards"]');
                if (cardPageLink) {
                    cardPageLink.click();
                }
                
                // عرض البطاقة
                setTimeout(() => {
                    InvestorCardSystem.showCardDetails(cardId);
                    // فتح نافذة البطاقة
                    openModal('show-card-modal');
                }, 300);
            }, 100);
        });
    });
}

// تنفيذ التكامل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التأكد من تحميل نظام البطاقات الأساسي أولاً
    if (typeof InvestorCardSystem !== 'undefined' && typeof InvestorCardSystem.initialize === 'function') {
        InvestorCardSystem.initialize()
            .then(() => {
                // إعداد تكامل البطاقات مع التطبيق
                setupInvestorCardIntegration();
            })
            .catch(error => {
                console.error('خطأ في تهيئة نظام بطاقات المستثمرين:', error);
            });
    } else {
        console.error('نظام بطاقات المستثمرين غير متاح');
    }
});

/**
 * دوال مساعدة
 */

/**
 * تنسيق رقم البطاقة للعرض
 * @param {string} cardNumber رقم البطاقة
 * @returns {string} رقم البطاقة المنسق
 */
function formatCardNumber(cardNumber) {
    // التحقق من صحة الرقم
    if (!cardNumber || typeof cardNumber !== 'string') {
        return '•••• •••• •••• ••••';
    }
    
    // تقسيم الرقم إلى مجموعات من 4 أرقام
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
}
/**
 * الحصول على اسم نوع البطاقة بالعربية
 * @param {string} cardType نوع البطاقة
 * @returns {string} اسم النوع بالعربية
 */
function getCardTypeArabic(cardType) {
    switch (cardType) {
        case 'default':
            return 'قياسية';
        case 'gold':
            return 'ذهبية';
        case 'platinum':
            return 'بلاتينية';
        case 'premium':
            return 'بريميوم';
        default:
            return cardType;
    }
}

/**
 * الحصول على اسم حالة البطاقة بالعربية
 * @param {string} status حالة البطاقة
 * @returns {string} اسم الحالة بالعربية
 */
function getCardStatusArabic(status) {
    switch (status) {
        case 'active':
            return 'نشطة';
        case 'inactive':
            return 'متوقفة';
        case 'expired':
            return 'منتهية';
        default:
            return status;
    }
}

/**
 * تنسيق التاريخ للعرض
 * @param {string} dateString تاريخ
 * @returns {string} التاريخ المنسق
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    // التحقق من صحة التاريخ
    if (isNaN(date.getTime())) {
        return dateString;
    }
    
    // تنسيق التاريخ بالصيغة المحلية
    return date.toLocaleDateString('ar-SA');
}

/**
 * فتح نافذة منبثقة
 * @param {string} modalId معرف النافذة
 */
function openModal(modalId) {
    // استخدام دالة التطبيق الأساسي إذا كانت متاحة
    if (typeof window.openModal === 'function') {
        window.openModal(modalId);
        return;
    }
    
    // تنفيذ بديل إذا لم تكن الدالة متاحة
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * إغلاق نافذة منبثقة
 * @param {string} modalId معرف النافذة
 */
function closeModal(modalId) {
    // استخدام دالة التطبيق الأساسي إذا كانت متاحة
    if (typeof window.closeModal === 'function') {
        window.closeModal(modalId);
        return;
    }
    
    // تنفيذ بديل إذا لم تكن الدالة متاحة
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * عرض إشعار للمستخدم
 * @param {string} message نص الإشعار
 * @param {string} type نوع الإشعار
 */
function showNotification(message, type = 'info') {
    // استخدام دالة التطبيق الأساسي إذا كانت متاحة
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // تنفيذ بديل إذا لم تكن الدالة متاحة
    console.log(`[${type.toUpperCase()}] ${message}`);
    alert(message);
}

/**
 * إضافة دعم لقراءة بطاقة المستثمر باستخدام الكاميرا
 */
function enhanceCardScanningCapabilities() {
    /**
     * تهيئة قارئ QR Code
     */
    function initQRCodeScanner() {
        if (typeof Html5Qrcode === 'undefined') {
            console.error('مكتبة Html5Qrcode غير متاحة');
            return;
        }
        
        // إنشاء حاوية قارئ QR Code
        let scannerContainer = document.getElementById('qr-reader-container');
        
        if (!scannerContainer) {
            scannerContainer = document.createElement('div');
            scannerContainer.id = 'qr-reader-container';
            scannerContainer.style.display = 'none';
            document.body.appendChild(scannerContainer);
        }
        
        // إنشاء قارئ QR Code
        const html5QrCode = new Html5Qrcode('qr-reader-container');
        
        // إضافة دالة المسح إلى نظام البطاقات
        InvestorCardSystem.scanQRCode = function(onSuccess, onFailure) {
            // عرض قارئ QR Code
            scannerContainer.style.display = 'block';
            
            // بدء المسح
            html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: 250
                },
                (decodedText, decodedResult) => {
                    // إيقاف المسح
                    html5QrCode.stop();
                    
                    // إخفاء قارئ QR Code
                    scannerContainer.style.display = 'none';
                    
                    // استدعاء دالة النجاح
                    if (typeof onSuccess === 'function') {
                        onSuccess(decodedText, decodedResult);
                    }
                },
                (errorMessage) => {
                    // استدعاء دالة الفشل
                    if (typeof onFailure === 'function') {
                        onFailure(errorMessage);
                    }
                }
            )
            .catch((err) => {
                // استدعاء دالة الفشل
                if (typeof onFailure === 'function') {
                    onFailure(err);
                }
            });
        };
        
        // إضافة دالة إيقاف المسح
        InvestorCardSystem.stopQRCodeScanner = function() {
            html5QrCode.stop();
            scannerContainer.style.display = 'none';
        };
    }
    
    /**
     * تحميل مكتبة Html5Qrcode
     */
    function loadHtml5QrCodeLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof Html5Qrcode !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
            script.onload = () => {
                console.log('تم تحميل مكتبة Html5Qrcode بنجاح');
                resolve();
            };
            script.onerror = (error) => {
                console.error('فشل في تحميل مكتبة Html5Qrcode:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }
    
    // تحميل مكتبة Html5Qrcode
    loadHtml5QrCodeLibrary()
        .then(() => {
            // تهيئة قارئ QR Code
            initQRCodeScanner();
        })
        .catch(error => {
            console.error('فشل في تحميل مكتبة Html5Qrcode:', error);
        });
}

/**
 * إضافة ميزة الحماية والمصادقة للبطاقات
 */
function addCardSecurityFeatures() {
    /**
     * التحقق من صحة الرقم السري للبطاقة
     * @param {string} cardId معرف البطاقة
     * @param {string} pin الرقم السري
     * @returns {boolean} نتيجة التحقق
     */
    function verifyCardPin(cardId, pin) {
        // البحث عن البطاقة
        const cards = InvestorCardSystem._getInvestorCards();
        const card = cards.find(c => c.id === cardId);
        
        if (!card) {
            return false;
        }
        
        // التحقق من صحة الرقم السري
        return card.pin === pin;
    }
    
    /**
     * التحقق من حالة البطاقة
     * @param {string} cardId معرف البطاقة
     * @returns {boolean} ما إذا كانت البطاقة نشطة
     */
    function isCardActive(cardId) {
        // البحث عن البطاقة
        const cards = InvestorCardSystem._getInvestorCards();
        const card = cards.find(c => c.id === cardId);
        
        if (!card) {
            return false;
        }
        
        // التحقق من حالة البطاقة
        return card.status === 'active';
    }
    
    /**
     * التحقق من تاريخ انتهاء البطاقة
     * @param {string} cardId معرف البطاقة
     * @returns {boolean} ما إذا كانت البطاقة غير منتهية
     */
    function isCardNotExpired(cardId) {
        // البحث عن البطاقة
        const cards = InvestorCardSystem._getInvestorCards();
        const card = cards.find(c => c.id === cardId);
        
        if (!card) {
            return false;
        }
        
        // التحقق من تاريخ الانتهاء
        const expiryDate = new Date(card.expiryDate);
        const now = new Date();
        
        return expiryDate > now;
    }
    
    /**
     * تسجيل استخدام البطاقة
     * @param {string} cardId معرف البطاقة
     * @param {string} action العملية
     * @param {string} details تفاصيل العملية
     */
    function logCardUsage(cardId, action, details = '') {
        // البحث عن البطاقة
        const cards = InvestorCardSystem._getInvestorCards();
        const cardIndex = cards.findIndex(c => c.id === cardId);
        
        if (cardIndex === -1) {
            return;
        }
        
        // إنشاء سجل الاستخدام
        const usageLog = {
            timestamp: new Date().toISOString(),
            action,
            details
        };
        
        // إضافة سجل الاستخدام
        if (!cards[cardIndex].usageLogs) {
            cards[cardIndex].usageLogs = [];
        }
        
        cards[cardIndex].usageLogs.push(usageLog);
        
        // تحديث تاريخ آخر استخدام
        cards[cardIndex].lastUsed = new Date().toISOString();
        
        // حفظ التغييرات
        localStorage.setItem('investorCards', JSON.stringify(cards));
    }
    
    // إضافة دوال الأمان إلى نظام البطاقات
    InvestorCardSystem.security = {
        verifyCardPin,
        isCardActive,
        isCardNotExpired,
        logCardUsage
    };
    
    // تعديل نافذة عرض البطاقة لطلب الرقم السري عند الحاجة
    enhanceCardDetailsModalWithPinVerification();
}

/**
 * تعزيز نافذة عرض البطاقة بالتحقق من الرقم السري
 */
function enhanceCardDetailsModalWithPinVerification() {
    // انتظار ظهور نافذة عرض البطاقة
    const observer = new MutationObserver((mutations) => {
        const showCardModal = document.getElementById('show-card-modal');
        if (!showCardModal || !showCardModal.classList.contains('active')) return;
        
        // الحصول على معرف البطاقة الحالية
        const cardId = InvestorCardSystem.currentCardId;
        if (!cardId) return;
        
        // التحقق مما إذا تم التحقق من الرقم السري مسبقاً
        const isPinVerified = showCardModal.hasAttribute('data-pin-verified');
        if (isPinVerified) return;
        
        // التحقق من حالة البطاقة
        if (!InvestorCardSystem.security.isCardActive(cardId)) return;
        
        // طلب الرقم السري
        setTimeout(() => {
            const pin = prompt('يرجى إدخال الرقم السري للبطاقة:');
            
            if (pin === null) {
                // تم إلغاء الإدخال
                closeModal('show-card-modal');
                return;
            }
            
            // التحقق من صحة الرقم السري
            if (InvestorCardSystem.security.verifyCardPin(cardId, pin)) {
                // تحديد أن الرقم السري تم التحقق منه
                showCardModal.setAttribute('data-pin-verified', 'true');
                
                // تسجيل استخدام البطاقة
                InvestorCardSystem.security.logCardUsage(cardId, 'view', 'عرض تفاصيل البطاقة');
            } else {
                // إظهار رسالة خطأ
                alert('الرقم السري غير صحيح');
                
                // إغلاق النافذة
                closeModal('show-card-modal');
            }
        }, 300);
    });
    
    // بدء المراقبة
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

/**
 * إضافة دعم التصدير والاستيراد مع Firebase
 */
function addFirebaseSupport() {
    // التحقق من وجود Firebase
    if (typeof firebase === 'undefined' || !firebase.database) {
        console.warn('Firebase غير متاح، لن يتم تفعيل دعم المزامنة السحابية');
        return;
    }
    
    /**
     * مزامنة البطاقات مع Firebase
     * @returns {Promise} وعد بنجاح أو فشل المزامنة
     */
    function syncCardsWithFirebase() {
        return new Promise((resolve, reject) => {
            // التحقق من وجود مستخدم مسجل
            if (!firebase.auth().currentUser) {
                reject(new Error('يجب تسجيل الدخول أولاً'));
                return;
            }
            
            // الحصول على معرف المستخدم
            const userId = firebase.auth().currentUser.uid;
            
            // الحصول على البطاقات
            const cards = InvestorCardSystem._getInvestorCards();
            
            // مزامنة البطاقات مع Firebase
            firebase.database().ref(`users/${userId}/investorCards`).set({
                cards,
                lastSynced: new Date().toISOString()
            })
            .then(() => {
                console.log('تم مزامنة البطاقات مع Firebase بنجاح');
                resolve(true);
            })
            .catch(error => {
                console.error('خطأ في مزامنة البطاقات مع Firebase:', error);
                reject(error);
            });
        });
    }
    
    /**
     * استرداد البطاقات من Firebase
     * @returns {Promise} وعد بنجاح أو فشل الاسترداد
     */
    function fetchCardsFromFirebase() {
        return new Promise((resolve, reject) => {
            // التحقق من وجود مستخدم مسجل
            if (!firebase.auth().currentUser) {
                reject(new Error('يجب تسجيل الدخول أولاً'));
                return;
            }
            
            // الحصول على معرف المستخدم
            const userId = firebase.auth().currentUser.uid;
            
            // استرداد البطاقات من Firebase
            firebase.database().ref(`users/${userId}/investorCards`).once('value')
                .then(snapshot => {
                    const data = snapshot.val();
                    
                    if (!data || !data.cards) {
                        resolve([]);
                        return;
                    }
                    
                    console.log('تم استرداد البطاقات من Firebase بنجاح');
                    resolve(data.cards);
                })
                .catch(error => {
                    console.error('خطأ في استرداد البطاقات من Firebase:', error);
                    reject(error);
                });
        });
    }
    
    /**
     * مزامنة البطاقات ثنائية الاتجاه
     * @returns {Promise} وعد بنجاح أو فشل المزامنة
     */
    function syncBidirectional() {
        return new Promise((resolve, reject) => {
            // استرداد البطاقات من Firebase
            fetchCardsFromFirebase()
                .then(remoteCards => {
                    // الحصول على البطاقات المحلية
                    const localCards = InvestorCardSystem._getInvestorCards();
                    
                    // دمج البطاقات
                    const mergedCards = mergeCards(localCards, remoteCards);
                    
                    // حفظ البطاقات المدمجة محلياً
                    localStorage.setItem('investorCards', JSON.stringify(mergedCards));
                    
                    // مزامنة البطاقات المدمجة مع Firebase
                    return syncCardsWithFirebase();
                })
                .then(() => {
                    resolve(true);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
    
    /**
     * دمج البطاقات المحلية والبعيدة
     * @param {Array} localCards البطاقات المحلية
     * @param {Array} remoteCards البطاقات البعيدة
     * @returns {Array} البطاقات المدمجة
     */
    function mergeCards(localCards, remoteCards) {
        // إنشاء نسخة من البطاقات المحلية
        const mergedCards = [...localCards];
        
        // إنشاء مجموعة من معرفات البطاقات المحلية
        const localCardIds = new Set(localCards.map(card => card.id));
        
        // إضافة البطاقات البعيدة غير الموجودة محلياً
        remoteCards.forEach(remoteCard => {
            if (!localCardIds.has(remoteCard.id)) {
                mergedCards.push(remoteCard);
            }
        });
        
        return mergedCards;
    }
    
    // إضافة دوال المزامنة إلى نظام البطاقات
    InvestorCardSystem.firebase = {
        syncCardsWithFirebase,
        fetchCardsFromFirebase,
        syncBidirectional
    };
    
    // إضافة زر المزامنة إلى صفحة البطاقات
    addSyncButtonToCardsPage();
}

/**
 * إضافة زر المزامنة إلى صفحة البطاقات
 */
function addSyncButtonToCardsPage() {
    // انتظار تحميل صفحة البطاقات
    const observer = new MutationObserver((mutations) => {
        const headerActions = document.querySelector('#investor-cards-page .header-actions');
        if (!headerActions) return;
        
        // التحقق من وجود زر المزامنة مسبقاً
        if (headerActions.querySelector('#sync-cards-btn')) return;
        
        // إنشاء زر المزامنة
        const syncButton = document.createElement('button');
        syncButton.className = 'btn btn-outline';
        syncButton.id = 'sync-cards-btn';
        syncButton.title = 'مزامنة البطاقات';
        syncButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
        
        // إضافة مستمع الحدث
        syncButton.addEventListener('click', function() {
            // التحقق من وجود Firebase
            if (!InvestorCardSystem.firebase) {
                showNotification('المزامنة مع Firebase غير متاحة', 'error');
                return;
            }
            
            // تغيير حالة الزر
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';
            
            // مزامنة البطاقات
            InvestorCardSystem.firebase.syncBidirectional()
                .then(() => {
                    showNotification('تم مزامنة البطاقات بنجاح', 'success');
                    
                    // تحديث عرض البطاقات
                    InvestorCardSystem.renderInvestorCards();
                })
                .catch(error => {
                    console.error('خطأ في مزامنة البطاقات:', error);
                    showNotification('حدث خطأ أثناء مزامنة البطاقات', 'error');
                })
                .finally(() => {
                    // إعادة الزر إلى حالته الأصلية
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-sync-alt"></i>';
                });
        });
        
        // إضافة الزر إلى شريط العنوان
        headerActions.insertBefore(syncButton, headerActions.firstChild);
        
        // إيقاف المراقبة
        observer.disconnect();
    });
    
    // بدء المراقبة
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// تفعيل جميع التحسينات الإضافية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التأكد من تهيئة نظام البطاقات الأساسي أولاً
    if (typeof InvestorCardSystem !== 'undefined' && typeof InvestorCardSystem.initialize === 'function') {
        InvestorCardSystem.initialize()
            .then(() => {
                // إضافة الميزات المتقدمة
                enhanceCardScanningCapabilities();
                addCardSecurityFeatures();
                addFirebaseSupport();
                
                console.log('تم تفعيل جميع ميزات نظام بطاقات المستثمرين المتقدمة');
            })
            .catch(error => {
                console.error('خطأ في تهيئة نظام بطاقات المستثمرين:', error);
            });
    } else {
        console.error('نظام بطاقات المستثمرين غير متاح');
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // انتظر حتى يتم تهيئة نظام البطاقات الأساسي
    const checkSystemInit = setInterval(() => {
        if (typeof InvestorCardSystem !== 'undefined' && typeof InvestorCardSystem.initialize === 'function') {
            clearInterval(checkSystemInit);
            
            // تهيئة نظام البطاقات
            InvestorCardSystem.initialize()
                .then(() => {
                    // إعداد تكامل البطاقات
                    setupInvestorCardIntegration();
                })
                .catch(error => {
                    console.error('خطأ في تهيئة نظام بطاقات المستثمرين:', error);
                });
        }
    }, 500);
});



function getInvestorCards() {
    // الحصول من التخزين المحلي
    const cardsString = localStorage.getItem('investorCards');
    
    // التحقق من وجود بيانات
    if (!cardsString) {
        return [];
    }
    
    // تحويل البيانات إلى كائن
    try {
        return JSON.parse(cardsString);
    } catch (error) {
        console.error('خطأ في تحليل بيانات البطاقات:', error);
        return [];
    }
}

// التحقق من وجود متغير المستثمرين
function ensureInvestorsVariable() {
    if (typeof window.investors === 'undefined') {
        // محاولة استرداد المستثمرين من التخزين المحلي
        const investorsString = localStorage.getItem('investors');
        if (investorsString) {
            try {
                window.investors = JSON.parse(investorsString);
            } catch (error) {
                console.error('خطأ في تحليل بيانات المستثمرين:', error);
                window.investors = [];
            }
        } else {
            window.investors = [];
        }
    }
}