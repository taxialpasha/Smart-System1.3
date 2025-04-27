/**
 * مساعد البحث الذكي واختصارات لوحة المفاتيح
 * ملف يقدم وظائف متقدمة للبحث والتنقل والاختصارات في تطبيق نظام الاستثمار المتكامل
 * @version 1.0.0
 */

const SmartSearchAssistant = (function() {
    // متغيرات عامة للاستخدام في المساعد
    let isInitialized = false;
    let searchTimeouts = {};
    let cachedData = {
        investors: [],
        transactions: [],
        employees: []
    };
    
    // إعدادات افتراضية
    const defaultConfig = {
        minSearchChars: 2,           // الحد الأدنى لبدء البحث التلقائي
        searchDelay: 300,            // تأخير البحث (ميلي ثانية)
        maxAutoCompleteItems: 8,     // الحد الأقصى لعدد الاقتراحات
        enableKeyboardNavigation: true,  // تمكين التنقل باستخدام لوحة المفاتيح
        enableAutoComplete: true,    // تمكين الإكمال التلقائي
        enableHotkeys: true          // تمكين اختصارات لوحة المفاتيح
    };

    // تكوين المساعد
    let config = { ...defaultConfig };

    /**
     * تهيئة المساعد
     * @param {Object} options - خيارات التكوين
     */
    function init(options = {}) {
        if (isInitialized) {
            console.log('مساعد البحث الذكي مهيأ بالفعل.');
            return;
        }

        console.log('تهيئة مساعد البحث الذكي...');
        
        // دمج الخيارات المقدمة مع الإعدادات الافتراضية
        config = { ...defaultConfig, ...options };
        
        // تخزين البيانات المستخدمة في البحث
        cacheSearchData();
        
        // تهيئة خانات البحث في جميع أنحاء التطبيق
        initializeSearchBoxes();
        
        // تهيئة وظيفة التنقل بين الحقول
        initializeFieldNavigation();
        
        // تهيئة اختصارات لوحة المفاتيح
        if (config.enableHotkeys) {
            initializeHotkeys();
        }
        
        // استمع إلى تحديثات البيانات
        listenForDataChanges();
        
        isInitialized = true;
        console.log('تم تهيئة مساعد البحث الذكي بنجاح.');
    }
    
    /**
     * تخزين البيانات المستخدمة في البحث للوصول السريع
     */
    function cacheSearchData() {
        console.log('تخزين بيانات البحث...');
        
        // تخزين بيانات المستثمرين
        if (window.investors && Array.isArray(window.investors)) {
            cachedData.investors = window.investors.map(investor => ({
                id: investor.id,
                name: investor.name,
                phone: investor.phone,
                address: investor.address,
                cardNumber: investor.cardNumber,
                amount: investor.amount,
                status: investor.status,
                searchText: `${investor.name} ${investor.phone} ${investor.cardNumber || ''}`.toLowerCase()
            }));
        }
        
        // تخزين بيانات العمليات
        if (window.transactions && Array.isArray(window.transactions)) {
            cachedData.transactions = window.transactions.map(transaction => ({
                id: transaction.id,
                date: transaction.date,
                type: transaction.type,
                investorId: transaction.investorId,
                investorName: transaction.investorName,
                amount: transaction.amount,
                searchText: `${transaction.id} ${transaction.investorName} ${transaction.type} ${transaction.date}`.toLowerCase()
            }));
        }
        
        // تخزين بيانات الموظفين إذا كانت متوفرة
        if (window.employees && Array.isArray(window.employees)) {
            cachedData.employees = window.employees.map(employee => ({
                id: employee.id,
                name: employee.name,
                position: employee.position,
                department: employee.department,
                phone: employee.phone,
                salary: employee.salary,
                status: employee.status,
                searchText: `${employee.name} ${employee.position} ${employee.department} ${employee.phone}`.toLowerCase()
            }));
        }
        
        console.log('تم تخزين بيانات البحث:', {
            investors: cachedData.investors.length,
            transactions: cachedData.transactions.length,
            employees: cachedData.employees.length
        });
    }
    
    /**
     * تحديث البيانات المخزنة
     * @param {string} dataType - نوع البيانات (investors, transactions, employees)
     */
    function updateCachedData(dataType) {
        console.log(`تحديث البيانات المخزنة: ${dataType}`);
        
        switch (dataType) {
            case 'investors':
                if (window.investors && Array.isArray(window.investors)) {
                    cachedData.investors = window.investors.map(investor => ({
                        id: investor.id,
                        name: investor.name,
                        phone: investor.phone,
                        address: investor.address,
                        cardNumber: investor.cardNumber,
                        amount: investor.amount,
                        status: investor.status,
                        searchText: `${investor.name} ${investor.phone} ${investor.cardNumber || ''}`.toLowerCase()
                    }));
                }
                break;
            
            case 'transactions':
                if (window.transactions && Array.isArray(window.transactions)) {
                    cachedData.transactions = window.transactions.map(transaction => ({
                        id: transaction.id,
                        date: transaction.date,
                        type: transaction.type,
                        investorId: transaction.investorId,
                        investorName: transaction.investorName,
                        amount: transaction.amount,
                        searchText: `${transaction.id} ${transaction.investorName} ${transaction.type} ${transaction.date}`.toLowerCase()
                    }));
                }
                break;
                
            case 'employees':
                if (window.employees && Array.isArray(window.employees)) {
                    cachedData.employees = window.employees.map(employee => ({
                        id: employee.id,
                        name: employee.name,
                        position: employee.position,
                        department: employee.department,
                        phone: employee.phone,
                        salary: employee.salary,
                        status: employee.status,
                        searchText: `${employee.name} ${employee.position} ${employee.department} ${employee.phone}`.toLowerCase()
                    }));
                }
                break;
                
            case 'all':
                cacheSearchData();
                break;
        }
    }
    
    /**
     * الاستماع إلى تغييرات البيانات
     */
    function listenForDataChanges() {
        // الاستماع إلى أحداث تحديث المستثمرين
        document.addEventListener('investor:update', function() {
            updateCachedData('investors');
        });
        
        // الاستماع إلى أحداث تحديث العمليات
        document.addEventListener('transaction:update', function() {
            updateCachedData('transactions');
        });
        
        // الاستماع إلى أحداث تحديث الموظفين
        document.addEventListener('employee:update', function() {
            updateCachedData('employees');
        });
        
        // الاستماع إلى حدث تحديث البيانات العام
        document.addEventListener('data:update', function(e) {
            if (e.detail && e.detail.type) {
                updateCachedData(e.detail.type);
            } else {
                updateCachedData('all');
            }
        });
    }
    
    /**
     * تهيئة خانات البحث في التطبيق
     */
    function initializeSearchBoxes() {
        console.log('تهيئة خانات البحث...');
        
        // البحث عن جميع حقول البحث
        const searchInputs = document.querySelectorAll('.search-input');
        
        searchInputs.forEach(input => {
            const parentPage = getParentPage(input);
            
            // تجنب التهيئة المزدوجة
            if (input.hasAttribute('data-smart-search')) {
                return;
            }
            
            // تحديد حقل البحث
            input.setAttribute('data-smart-search', 'true');
            input.setAttribute('autocomplete', 'off');
            
            // تحديد نوع البحث بناءً على الصفحة الأم
            let searchType;
            if (parentPage === 'investors-page') {
                searchType = 'investors';
            } else if (parentPage === 'transactions-page') {
                searchType = 'transactions';
            } else if (parentPage === 'employees-page') {
                searchType = 'employees';
            } else if (parentPage === 'profits-page') {
                searchType = 'investors';
            } else {
                searchType = 'all';
            }
            
            input.setAttribute('data-search-type', searchType);
            
            // إنشاء عنصر اقتراحات البحث
            if (config.enableAutoComplete) {
                createAutoCompleteContainer(input);
            }
            
            // إضافة مستمع حدث لحقل البحث
            input.addEventListener('input', debounce(function() {
                const query = this.value.trim();
                const type = this.getAttribute('data-search-type');
                
                if (query.length < config.minSearchChars) {
                    hideAutoComplete(this);
                    return;
                }
                
                if (config.enableAutoComplete) {
                    // عرض اقتراحات البحث
                    showAutoCompleteSuggestions(this, query, type);
                }
                
                // تنفيذ البحث
                performSearch(query, type, parentPage);
            }, config.searchDelay));
            
            // إضافة مستمع لحدث التركيز
            input.addEventListener('focus', function() {
                const query = this.value.trim();
                
                if (query.length >= config.minSearchChars && config.enableAutoComplete) {
                    const type = this.getAttribute('data-search-type');
                    showAutoCompleteSuggestions(this, query, type);
                }
            });
            
            // إضافة مستمع لحدث فقدان التركيز
            input.addEventListener('blur', function() {
                // تأخير إخفاء الاقتراحات للسماح بالنقر عليها
                setTimeout(() => {
                    hideAutoComplete(this);
                }, 200);
            });
            
            // إضافة مستمع لأحداث لوحة المفاتيح
            input.addEventListener('keydown', function(e) {
                handleSearchInputKeydown(e, this);
            });
        });
        
        console.log(`تم تهيئة ${searchInputs.length} خانة بحث`);
    }
    
    /**
     * الحصول على الصفحة الأم لعنصر معين
     * @param {HTMLElement} element - العنصر
     * @returns {string} - معرف الصفحة الأم
     */
    function getParentPage(element) {
        const pageElement = element.closest('.page');
        return pageElement ? pageElement.id : '';
    }
    
    /**
     * إنشاء حاوية اقتراحات البحث
     * @param {HTMLInputElement} inputElement - عنصر حقل البحث
     */
    function createAutoCompleteContainer(inputElement) {
        // التحقق من عدم وجود حاوية سابقة
        const existingContainer = inputElement.parentElement.querySelector('.autocomplete-container');
        if (existingContainer) {
            return;
        }
        
        // إنشاء حاوية الاقتراحات
        const container = document.createElement('div');
        container.className = 'autocomplete-container';
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.maxHeight = '300px';
        container.style.overflowY = 'auto';
        container.style.backgroundColor = 'white';
        container.style.border = '1px solid #ddd';
        container.style.borderTop = 'none';
        container.style.borderRadius = '0 0 5px 5px';
        container.style.zIndex = '1000';
        container.style.display = 'none';
        container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        
        // التأكد من أن الحاوية الأم لديها وضع نسبي
        if (getComputedStyle(inputElement.parentElement).position === 'static') {
            inputElement.parentElement.style.position = 'relative';
        }
        
        // إضافة الحاوية بعد حقل البحث
        inputElement.parentElement.appendChild(container);
    }
    
    /**
     * عرض اقتراحات البحث التلقائي
     * @param {HTMLInputElement} inputElement - عنصر حقل البحث
     * @param {string} query - نص البحث
     * @param {string} type - نوع البحث
     */
    function showAutoCompleteSuggestions(inputElement, query, type) {
        if (!config.enableAutoComplete || query.length < config.minSearchChars) {
            return;
        }
        
        const container = inputElement.parentElement.querySelector('.autocomplete-container');
        if (!container) return;
        
        // الحصول على اقتراحات البحث
        const suggestions = getSearchSuggestions(query, type);
        
        if (suggestions.length === 0) {
            hideAutoComplete(inputElement);
            return;
        }
        
        // تحديد عدد العناصر المراد عرضها
        const itemsToShow = Math.min(suggestions.length, config.maxAutoCompleteItems);
        
        // إنشاء قائمة الاقتراحات
        let html = '<ul style="list-style: none; padding: 0; margin: 0;">';
        
        for (let i = 0; i < itemsToShow; i++) {
            const item = suggestions[i];
            html += `<li class="autocomplete-item" data-id="${item.id}" data-type="${item.type}" 
                     style="padding: 8px 15px; cursor: pointer; border-bottom: 1px solid #f0f0f0;"
                     onmouseover="this.style.backgroundColor='#f5f5f5'"
                     onmouseout="this.style.backgroundColor='white'">
                ${item.highlightedText}
                <small style="display: block; color: #666; font-size: 0.85em;">${item.secondaryText}</small>
            </li>`;
        }
        
        html += '</ul>';
        
        // تعيين محتوى القائمة
        container.innerHTML = html;
        container.style.display = 'block';
        
        // إضافة مستمعي أحداث للعناصر
        const items = container.querySelectorAll('.autocomplete-item');
        items.forEach(item => {
            item.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const itemType = this.getAttribute('data-type');
                
                // ملء حقل البحث بنص العنصر المختار
                const textContent = this.textContent.trim();
                inputElement.value = textContent.split('\n')[0].trim();
                
                // إخفاء قائمة الاقتراحات
                hideAutoComplete(inputElement);
                
                // تنفيذ البحث بالمعرف المحدد
                performSearchById(id, itemType, getParentPage(inputElement));
                
                // تشغيل البحث
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            });
        });
    }
    
    /**
     * الحصول على اقتراحات البحث
     * @param {string} query - نص البحث
     * @param {string} type - نوع البحث
     * @returns {Array} - قائمة الاقتراحات
     */
    function getSearchSuggestions(query, type) {
        query = query.toLowerCase();
        const suggestions = [];
        
        if (type === 'investors' || type === 'all') {
            // البحث في المستثمرين
            const investorResults = cachedData.investors
                .filter(investor => investor.searchText.includes(query))
                .map(investor => ({
                    id: investor.id,
                    type: 'investor',
                    highlightedText: highlightMatches(investor.name, query),
                    secondaryText: `الهاتف: ${investor.phone} - المبلغ: ${formatCurrency(investor.amount)}`,
                    sortScore: calculateSortScore(investor.name, investor.phone, query)
                }));
            suggestions.push(...investorResults);
        }
        
        if (type === 'transactions' || type === 'all') {
            // البحث في العمليات
            const transactionResults = cachedData.transactions
                .filter(transaction => transaction.searchText.includes(query))
                .map(transaction => ({
                    id: transaction.id,
                    type: 'transaction',
                    highlightedText: highlightMatches(
                        `${transaction.type} - ${transaction.investorName}`, 
                        query
                    ),
                    secondaryText: `التاريخ: ${transaction.date} - المبلغ: ${formatCurrency(transaction.amount)}`,
                    sortScore: calculateSortScore(transaction.investorName, transaction.id, query)
                }));
            suggestions.push(...transactionResults);
        }
        
        if (type === 'employees' || type === 'all') {
            // البحث في الموظفين
            const employeeResults = cachedData.employees
                .filter(employee => employee.searchText.includes(query))
                .map(employee => ({
                    id: employee.id,
                    type: 'employee',
                    highlightedText: highlightMatches(employee.name, query),
                    secondaryText: `المسمى الوظيفي: ${employee.position} - القسم: ${employee.department}`,
                    sortScore: calculateSortScore(employee.name, employee.position, query)
                }));
            suggestions.push(...employeeResults);
        }
        
        // ترتيب النتائج حسب الأهمية
        return suggestions.sort((a, b) => b.sortScore - a.sortScore);
    }
    
    /**
     * حساب درجة الأهمية للاقتراح
     * @param {string} primaryField - الحقل الأساسي
     * @param {string} secondaryField - الحقل الثانوي
     * @param {string} query - نص البحث
     * @returns {number} - درجة الأهمية
     */
    function calculateSortScore(primaryField, secondaryField, query) {
        let score = 0;
        primaryField = primaryField.toLowerCase();
        secondaryField = secondaryField.toLowerCase();
        query = query.toLowerCase();
        
        // إعطاء نقاط أعلى إذا كان البحث يطابق بداية الكلمات
        if (primaryField.startsWith(query)) {
            score += 10;
        } else if (primaryField.includes(` ${query}`)) {
            score += 8;
        } else if (primaryField.includes(query)) {
            score += 5;
        }
        
        // إعطاء نقاط أقل للحقل الثانوي
        if (secondaryField.startsWith(query)) {
            score += 3;
        } else if (secondaryField.includes(query)) {
            score += 1;
        }
        
        return score;
    }
    
    /**
     * تمييز نص البحث في النتائج
     * @param {string} text - النص الأصلي
     * @param {string} query - نص البحث
     * @returns {string} - النص مع تمييز نص البحث
     */
    function highlightMatches(text, query) {
        if (!text) return '';
        
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<strong style="color: #3b82f6; background-color: rgba(59, 130, 246, 0.1);">$1</strong>');
    }
    
    /**
     * تهروب النص للتعبير النمطي
     * @param {string} text - النص المراد تهريبه
     * @returns {string} - النص المهروب
     */
    function escapeRegExp(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }
    
    /**
     * إخفاء قائمة الاقتراحات
     * @param {HTMLInputElement} inputElement - عنصر حقل البحث
     */
    function hideAutoComplete(inputElement) {
        const container = inputElement.parentElement.querySelector('.autocomplete-container');
        if (container) {
            container.style.display = 'none';
        }
    }
    
    /**
     * معالجة أحداث لوحة المفاتيح لحقل البحث
     * @param {Event} event - حدث لوحة المفاتيح
     * @param {HTMLInputElement} inputElement - عنصر حقل البحث
     */
    function handleSearchInputKeydown(event, inputElement) {
        const container = inputElement.parentElement.querySelector('.autocomplete-container');
        if (!container || container.style.display === 'none') {
            // إذا كانت قائمة الاقتراحات مخفية ونقر على Enter، نفذ البحث
            if (event.key === 'Enter') {
                const query = inputElement.value.trim();
                const type = inputElement.getAttribute('data-search-type');
                performSearch(query, type, getParentPage(inputElement));
            }
            return;
        }
        
        const items = container.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;
        
        // الحصول على العنصر المحدد حاليًا
        let activeItem = container.querySelector('.autocomplete-item.active');
        let activeIndex = -1;
        
        if (activeItem) {
            // البحث عن فهرس العنصر النشط
            for (let i = 0; i < items.length; i++) {
                if (items[i] === activeItem) {
                    activeIndex = i;
                    break;
                }
            }
        }
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                // التنقل إلى العنصر التالي
                if (activeItem) {
                    activeItem.classList.remove('active');
                    activeItem.style.backgroundColor = '';
                }
                
                activeIndex = (activeIndex + 1) % items.length;
                items[activeIndex].classList.add('active');
                items[activeIndex].style.backgroundColor = '#f0f0f0';
                ensureVisibleInContainer(items[activeIndex], container);
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                // التنقل إلى العنصر السابق
                if (activeItem) {
                    activeItem.classList.remove('active');
                    activeItem.style.backgroundColor = '';
                }
                
                activeIndex = (activeIndex <= 0) ? items.length - 1 : activeIndex - 1;
                items[activeIndex].classList.add('active');
                items[activeIndex].style.backgroundColor = '#f0f0f0';
                ensureVisibleInContainer(items[activeIndex], container);
                break;
                
            case 'Enter':
                event.preventDefault();
                // اختيار العنصر النشط
                if (activeItem) {
                    activeItem.click();
                } else if (items.length > 0) {
                    // إذا لم يكن هناك عنصر نشط، اختر العنصر الأول
                    items[0].click();
                }
                break;
                
            case 'Escape':
                // إغلاق قائمة الاقتراحات
                hideAutoComplete(inputElement);
                break;
        }
    }
    
    /**
     * التأكد من أن العنصر مرئي داخل الحاوية
     * @param {HTMLElement} element - العنصر
     * @param {HTMLElement} container - الحاوية
     */
    function ensureVisibleInContainer(element, container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        if (elementRect.bottom > containerRect.bottom) {
            container.scrollTop += (elementRect.bottom - containerRect.bottom);
        } else if (elementRect.top < containerRect.top) {
            container.scrollTop -= (containerRect.top - elementRect.top);
        }
    }
    
    /**
     * تنفيذ البحث
     * @param {string} query - نص البحث
     * @param {string} type - نوع البحث
     * @param {string} pageId - معرف الصفحة
     */
    function performSearch(query, type, pageId) {
        console.log(`تنفيذ البحث: "${query}" (النوع: ${type}, الصفحة: ${pageId})`);
        
        if (!query || query.length < config.minSearchChars) {
            // إذا كان النص فارغًا، قم بإعادة عرض جميع العناصر
            resetSearch(type, pageId);
            return;
        }
        
        switch (pageId) {
            case 'investors-page':
                if (window.searchInvestors) {
                    window.searchInvestors(query);
                } else {
                    searchInvestors(query);
                }
                break;
                
            case 'transactions-page':
                if (window.searchTransactions) {
                    window.searchTransactions(query);
                } else {
                    searchTransactions(query);
                }
                break;
                
            case 'employees-page':
                if (window.searchEmployees) {
                    window.searchEmployees(query);
                } else {
                    searchEmployees(query);
                }
                break;
                
            case 'profits-page':
                if (window.searchProfits) {
                    window.searchProfits(query);
                } else {
                    searchProfits(query);
                }
                break;
                
            case 'dashboard-page':
                // البحث في لوحة التحكم
                searchDashboard(query);
                break;
                
            default:
                console.log(`لا توجد وظيفة بحث مخصصة للصفحة: ${pageId}`);
        }
    }
    
    /**
     * تنفيذ البحث بناءً على المعرف
     * @param {string} id - معرف العنصر
     * @param {string} type - نوع العنصر
     * @param {string} pageId - معرف الصفحة
     */
    function performSearchById(id, type, pageId) {
        console.log(`تنفيذ البحث بالمعرف: ${id} (النوع: ${type}, الصفحة: ${pageId})`);
        
        // تنفيذ الإجراء بناءً على نوع العنصر والصفحة
        switch (type) {
            case 'investor':
                if (pageId === 'investors-page') {
                    if (window.showInvestorDetails) {
                        window.showInvestorDetails(id);
                    }
                } else if (pageId === 'profits-page') {
                    // اختيار المستثمر في نموذج الأرباح
                    const profitInvestorSelect = document.getElementById('profit-investor');
                    if (profitInvestorSelect) {
                        profitInvestorSelect.value = id;
                        profitInvestorSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else {
                    // البحث عن المستثمر في الصفحة النشطة
                    const nameFilter = investor => investor.id === id;
                    
                    if (pageId === 'transactions-page') {
                        searchTransactions('', nameFilter);
                    } else {
                        performSearch(id, 'investors', pageId);
                    }
                }
                break;
                
           case 'transaction':
                if (pageId === 'transactions-page') {
                    if (window.showTransactionDetails) {
                        window.showTransactionDetails(id);
                    }
                } else {
                    performSearch(id, 'transactions', pageId);
                }
                break;
                
            case 'employee':
                if (pageId === 'employees-page') {
                    if (window.showEmployeeDetails) {
                        window.showEmployeeDetails(id);
                    }
                } else {
                    performSearch(id, 'employees', pageId);
                }
                break;
        }
    }
    
    /**
     * إعادة تعيين نتائج البحث
     * @param {string} type - نوع البحث
     * @param {string} pageId - معرف الصفحة
     */
    function resetSearch(type, pageId) {
        console.log(`إعادة تعيين البحث: (النوع: ${type}, الصفحة: ${pageId})`);
        
        switch (pageId) {
            case 'investors-page':
                if (window.renderInvestorsTable) {
                    window.renderInvestorsTable();
                }
                break;
                
            case 'transactions-page':
                if (window.renderTransactionsTable) {
                    window.renderTransactionsTable();
                }
                break;
                
            case 'employees-page':
                if (window.renderEmployeesTable) {
                    window.renderEmployeesTable();
                }
                break;
                
            case 'profits-page':
                if (window.renderProfitsTable) {
                    window.renderProfitsTable();
                }
                break;
        }
    }
    
    /**
     * تنفيذ البحث في المستثمرين
     * @param {string} query - نص البحث
     * @param {Function} filter - دالة تصفية إضافية
     */
    function searchInvestors(query, filter) {
        console.log(`البحث في المستثمرين: "${query}"`);
        
        query = query.toLowerCase();
        
        // التحقق من وجود دالة البحث العامة
        if (window.searchInvestors && typeof window.searchInvestors === 'function') {
            window.searchInvestors(query);
            return;
        }
        
        // التحقق من وجود الجدول
        const tableBody = document.querySelector('#investors-table tbody');
        if (!tableBody) {
            console.warn('لم يتم العثور على جدول المستثمرين');
            return;
        }
        
        // تنفيذ البحث اليدوي
        if (!window.investors || !Array.isArray(window.investors)) {
            console.warn('بيانات المستثمرين غير متوفرة');
            return;
        }
        
        // تصفية المستثمرين حسب نص البحث
        let filteredInvestors = window.investors.filter(investor => {
            // البحث في الاسم ورقم الهاتف ورقم البطاقة
            const searchText = `${investor.name || ''} ${investor.phone || ''} ${investor.cardNumber || ''}`.toLowerCase();
            return searchText.includes(query);
        });
        
        // تطبيق تصفية إضافية إذا كانت موجودة
        if (typeof filter === 'function') {
            filteredInvestors = filteredInvestors.filter(filter);
        }
        
        // تحديث الجدول
        tableBody.innerHTML = '';
        
        if (filteredInvestors.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="8" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // عرض المستثمرين المصفاة
        filteredInvestors.forEach(investor => {
            const row = document.createElement('tr');
            
            // تنسيق تاريخ الانضمام
            const joinDate = investor.joinDate || investor.createdAt || '';
            
            // إنشاء صف الجدول
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
                <td>${formatCurrency(calculateMonthlyProfit(investor) || 0)}</td>
                <td>${joinDate}</td>
                <td><span class="badge badge-${investor.status === 'inactive' ? 'danger' : 'success'}">${investor.status === 'inactive' ? 'غير نشط' : 'نشط'}</span></td>
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
            addInvestorRowEventListeners(row);
        });
    }
    
    /**
     * إضافة مستمعي الأحداث لصف المستثمر
     * @param {HTMLElement} row - صف الجدول
     */
    function addInvestorRowEventListeners(row) {
        // زر عرض التفاصيل
        const viewButton = row.querySelector('.view-investor');
        if (viewButton) {
            viewButton.addEventListener('click', function() {
                const investorId = this.getAttribute('data-id');
                if (window.showInvestorDetails) {
                    window.showInvestorDetails(investorId);
                }
            });
        }
        
        // زر التعديل
        const editButton = row.querySelector('.edit-investor');
        if (editButton) {
            editButton.addEventListener('click', function() {
                const investorId = this.getAttribute('data-id');
                if (window.editInvestor) {
                    window.editInvestor(investorId);
                }
            });
        }
        
        // زر الحذف
        const deleteButton = row.querySelector('.delete-investor');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                const investorId = this.getAttribute('data-id');
                if (window.deleteInvestor) {
                    window.deleteInvestor(investorId);
                }
            });
        }
    }
    
    /**
     * حساب الربح الشهري للمستثمر
     * @param {Object} investor - بيانات المستثمر
     * @returns {number} - الربح الشهري
     */
    function calculateMonthlyProfit(investor) {
        if (!investor || !investor.investments || !Array.isArray(investor.investments)) {
            return 0;
        }
        
        // حساب مجموع الأرباح
        const totalProfit = investor.investments.reduce((total, inv) => {
            // استخدام دالة حساب الفائدة إذا كانت متوفرة
            if (window.calculateInterest) {
                return total + window.calculateInterest(inv.amount, inv.date);
            } else {
                // حساب تقريبي إذا كانت الدالة غير متوفرة
                const rate = (window.settings && window.settings.interestRate) ? window.settings.interestRate / 100 : 0.175;
                return total + (inv.amount * rate);
            }
        }, 0);
        
        return totalProfit;
    }
    
    /**
     * تنفيذ البحث في العمليات
     * @param {string} query - نص البحث
     * @param {Function} filter - دالة تصفية إضافية
     */
    function searchTransactions(query, filter) {
        console.log(`البحث في العمليات: "${query}"`);
        
        query = query.toLowerCase();
        
        // التحقق من وجود دالة البحث العامة
        if (window.searchTransactions && typeof window.searchTransactions === 'function' && !filter) {
            window.searchTransactions(query);
            return;
        }
        
        // التحقق من وجود الجدول
        const tableBody = document.querySelector('#transactions-table tbody');
        if (!tableBody) {
            console.warn('لم يتم العثور على جدول العمليات');
            return;
        }
        
        // تنفيذ البحث اليدوي
        if (!window.transactions || !Array.isArray(window.transactions)) {
            console.warn('بيانات العمليات غير متوفرة');
            return;
        }
        
        // تصفية العمليات حسب نص البحث
        let filteredTransactions = window.transactions.filter(transaction => {
            // البحث في المعرف واسم المستثمر ونوع العملية والتاريخ
            const searchText = `${transaction.id || ''} ${transaction.investorName || ''} ${transaction.type || ''} ${transaction.date || ''}`.toLowerCase();
            return searchText.includes(query);
        });
        
        // تطبيق تصفية إضافية إذا كانت موجودة
        if (typeof filter === 'function') {
            filteredTransactions = filteredTransactions.filter(filter);
        }
        
        // تحديث الجدول
        tableBody.innerHTML = '';
        
        if (filteredTransactions.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="7" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // عرض العمليات المصفاة
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
            
            // إنشاء صف الجدول
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.investorName || ''}</td>
                <td>
                    <span class="badge badge-${typeClass}">${typeIcon} ${transaction.type}</span>
                </td>
                <td>${transaction.date || ''}</td>
                <td>${formatCurrency(transaction.amount || 0)}</td>
                <td>${transaction.balanceAfter ? formatCurrency(transaction.balanceAfter) : '-'}</td>
                <td>
                    <button class="btn btn-outline btn-sm transaction-details" data-id="${transaction.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمع حدث لزر التفاصيل
            const detailsButton = row.querySelector('.transaction-details');
            if (detailsButton) {
                detailsButton.addEventListener('click', function() {
                    const transactionId = this.getAttribute('data-id');
                    if (window.showTransactionDetails) {
                        window.showTransactionDetails(transactionId);
                    }
                });
            }
        });
    }
    
    /**
     * تنفيذ البحث في الموظفين
     * @param {string} query - نص البحث
     */
    function searchEmployees(query) {
        console.log(`البحث في الموظفين: "${query}"`);
        
        query = query.toLowerCase();
        
        // التحقق من وجود دالة البحث العامة
        if (window.searchEmployees && typeof window.searchEmployees === 'function') {
            window.searchEmployees(query);
            return;
        }
        
        // التحقق من وجود الجدول
        const tableBody = document.querySelector('#employees-table tbody');
        if (!tableBody) {
            console.warn('لم يتم العثور على جدول الموظفين');
            return;
        }
        
        // تنفيذ البحث اليدوي
        if (!window.employees || !Array.isArray(window.employees)) {
            console.warn('بيانات الموظفين غير متوفرة');
            return;
        }
        
        // تصفية الموظفين حسب نص البحث
        const filteredEmployees = window.employees.filter(employee => {
            // البحث في الاسم والمسمى الوظيفي والقسم ورقم الهاتف
            const searchText = `${employee.name || ''} ${employee.position || ''} ${employee.department || ''} ${employee.phone || ''}`.toLowerCase();
            return searchText.includes(query);
        });
        
        // تحديث الجدول
        tableBody.innerHTML = '';
        
        if (filteredEmployees.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="8" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // عرض الموظفين المصفاة
        filteredEmployees.forEach(employee => {
            const row = document.createElement('tr');
            
            // تنسيق تاريخ التعيين
            const hireDate = employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '';
            
            // إنشاء صف الجدول
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>
                    <div class="employee-info">
                        <div class="employee-avatar">${employee.name.charAt(0)}</div>
                        <div>
                            <div class="employee-name">${employee.name}</div>
                            <div class="employee-email">${employee.email || employee.phone}</div>
                        </div>
                    </div>
                </td>
                <td>${employee.position || ''}</td>
                <td>${employee.phone || ''}</td>
                <td>${hireDate}</td>
                <td>${formatCurrency(employee.salary || 0)}</td>
                <td><span class="badge badge-${employee.status === 'inactive' ? 'danger' : 'success'}">${employee.status === 'inactive' ? 'غير نشط' : 'نشط'}</span></td>
                <td>
                    <div class="employee-actions">
                        <button class="employee-action-btn view-employee" data-id="${employee.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="employee-action-btn edit edit-employee" data-id="${employee.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="employee-action-btn delete delete-employee" data-id="${employee.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمعي الأحداث للأزرار
            addEmployeeRowEventListeners(row);
        });
    }
    
    /**
     * إضافة مستمعي الأحداث لصف الموظف
     * @param {HTMLElement} row - صف الجدول
     */
    function addEmployeeRowEventListeners(row) {
        // زر عرض التفاصيل
        const viewButton = row.querySelector('.view-employee');
        if (viewButton) {
            viewButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                if (window.showEmployeeDetails) {
                    window.showEmployeeDetails(employeeId);
                }
            });
        }
        
        // زر التعديل
        const editButton = row.querySelector('.edit-employee');
        if (editButton) {
            editButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                if (window.editEmployee) {
                    window.editEmployee(employeeId);
                }
            });
        }
        
        // زر الحذف
        const deleteButton = row.querySelector('.delete-employee');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                if (window.deleteEmployee) {
                    window.deleteEmployee(employeeId);
                }
            });
        }
    }
    
    /**
     * تنفيذ البحث في الأرباح
     * @param {string} query - نص البحث
     */
    function searchProfits(query) {
        console.log(`البحث في الأرباح: "${query}"`);
        
        query = query.toLowerCase();
        
        // التحقق من وجود دالة البحث العامة
        if (window.searchProfits && typeof window.searchProfits === 'function') {
            window.searchProfits(query);
            return;
        }
        
        // التحقق من وجود الجدول
        const tableBody = document.querySelector('#profits-table tbody');
        if (!tableBody) {
            console.warn('لم يتم العثور على جدول الأرباح');
            return;
        }
        
        // تنفيذ البحث اليدوي عن طريق البحث في المستثمرين
        if (!window.investors || !Array.isArray(window.investors)) {
            console.warn('بيانات المستثمرين غير متوفرة');
            return;
        }
        
        // تصفية المستثمرين حسب نص البحث
        const filteredInvestors = window.investors.filter(investor => {
            // البحث في الاسم ورقم الهاتف ورقم البطاقة
            const searchText = `${investor.name || ''} ${investor.phone || ''} ${investor.cardNumber || ''}`.toLowerCase();
            return searchText.includes(query);
        });
        
        // تحديث الجدول - هنا نحتاج إلى معرفة كيفية عرض الأرباح في التطبيق
        // هذا يعتمد على تنفيذ محدد للتطبيق، لذا سنستخدم دالة renderProfitsTable إذا كانت متوفرة
        
        if (window.renderProfitsTable) {
            // إذا كانت الدالة متوفرة، سنحاول إعادة تعيين البيانات المعروضة
            if (filteredInvestors.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td></tr>`;
            } else {
                // استخدام الدالة المخصصة لعرض الأرباح مع المستثمرين المصفاة
                // هذا يتطلب تعديل دالة renderProfitsTable لقبول قائمة المستثمرين المصفاة
                window.renderProfitsTable(filteredInvestors);
            }
        } else {
            // إذا لم تكن الدالة متوفرة، سنعرض رسالة
            console.warn('وظيفة renderProfitsTable غير متوفرة، لا يمكن عرض نتائج البحث');
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center">وظيفة البحث في الأرباح غير متوفرة</td></tr>`;
        }
    }
    
    /**
     * البحث في لوحة التحكم
     * @param {string} query - نص البحث
     */
    function searchDashboard(query) {
        console.log(`البحث في لوحة التحكم: "${query}"`);
        
        query = query.toLowerCase();
        
        // البحث في آخر العمليات
        const transactionsTable = document.querySelector('#recent-transactions tbody');
        if (transactionsTable) {
            // تصفية العمليات حسب نص البحث
            if (window.transactions && Array.isArray(window.transactions)) {
                const filteredTransactions = window.transactions
                    .filter(transaction => {
                        // البحث في المعرف واسم المستثمر ونوع العملية والتاريخ
                        const searchText = `${transaction.id || ''} ${transaction.investorName || ''} ${transaction.type || ''} ${transaction.date || ''}`.toLowerCase();
                        return searchText.includes(query);
                    })
                    .sort((a, b) => {
                        // ترتيب العمليات حسب التاريخ (الأحدث أولاً)
                        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
                    })
                    .slice(0, 5); // عرض أحدث 5 عمليات فقط
                
                // تحديث الجدول
                transactionsTable.innerHTML = '';
                
                if (filteredTransactions.length === 0) {
                    const emptyRow = document.createElement('tr');
                    emptyRow.innerHTML = `<td colspan="7" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
                    transactionsTable.appendChild(emptyRow);
                } else {
                    filteredTransactions.forEach(transaction => {
                        const row = document.createElement('tr');
                        
                        // تحديد نوع العملية وأيقونتها
                        let statusClass = 'active';
                        
                        switch(transaction.type) {
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
                        
                        const daysAgo = Math.floor((new Date() - new Date(transaction.date)) / (1000 * 60 * 60 * 24));
                        const daysText = daysAgo === 0 ? 'اليوم' : `${daysAgo} يومًا مضت`;
                        
                        row.innerHTML = `
                            <td>${transaction.id}</td>
                            <td>${transaction.investorName}</td>
                            <td>${transaction.type}</td>
                            <td>${transaction.date}<br><small>${daysText}</small></td>
                            <td>${formatCurrency(transaction.amount)}</td>
                            <td><span class="status status-${statusClass}">مكتمل</span></td>
                            <td>
                                <button class="btn btn-outline btn-sm transaction-details" data-id="${transaction.id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        `;
                        
                        transactionsTable.appendChild(row);
                        
                        // إضافة مستمع حدث لزر التفاصيل
                        const detailsButton = row.querySelector('.transaction-details');
                        if (detailsButton) {
                            detailsButton.addEventListener('click', function() {
                                const id = this.getAttribute('data-id');
                                if (window.showTransactionDetails) {
                                    window.showTransactionDetails(id);
                                }
                            });
                        }
                    });
                }
            }
        }
    }
    
    /**
     * تهيئة التنقل بين الحقول باستخدام مفتاح Enter
     */
    function initializeFieldNavigation() {
        console.log('تهيئة التنقل بين الحقول...');
        
        if (!config.enableKeyboardNavigation) {
            return;
        }
        
        // الاستماع إلى أحداث الضغط على المفاتيح في النماذج
        document.addEventListener('keydown', function(event) {
            // تحقق مما إذا كان المفتاح هو Enter
            if (event.key === 'Enter') {
                // تحقق من أن العنصر النشط هو حقل إدخال
                const activeElement = document.activeElement;
                
                if (isInputElement(activeElement)) {
                    // منع السلوك الافتراضي (إرسال النموذج)
                    if (activeElement.tagName.toLowerCase() !== 'textarea') {
                        event.preventDefault();
                    }
                    
                    // البحث عن الحقل التالي
                    const nextField = findNextField(activeElement);
                    
                    if (nextField) {
                        // التركيز على الحقل التالي
                        nextField.focus();
                        
                        // تحديد النص في الحقل التالي إذا كان حقل نص
                        if (isTextInputElement(nextField)) {
                            nextField.select();
                        }
                    } else {
                        // إذا لم يكن هناك حقل تالي، فقد نكون في نهاية النموذج
                        // البحث عن زر الإرسال في النموذج
                        const form = activeElement.closest('form');
                        if (form) {
                            const submitButton = form.querySelector('button[type="submit"], input[type="submit"], button.btn-primary');
                            if (submitButton) {
                                submitButton.click();
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * التحقق مما إذا كان العنصر هو حقل إدخال
     * @param {HTMLElement} element - العنصر المراد التحقق منه
     * @returns {boolean} - ما إذا كان العنصر حقل إدخال
     */
    function isInputElement(element) {
        if (!element) return false;
        
        const tagName = element.tagName.toLowerCase();
        const type = element.type && element.type.toLowerCase();
        
        return (
            tagName === 'input' && 
            type !== 'submit' && 
            type !== 'button' && 
            type !== 'reset' && 
            type !== 'radio' && 
            type !== 'checkbox'
        ) || tagName === 'select' || tagName === 'textarea';
    }
    
/**
     * التحقق مما إذا كان العنصر هو حقل نص
     * @param {HTMLElement} element - العنصر المراد التحقق منه
     * @returns {boolean} - ما إذا كان العنصر حقل نص
     */
    function isTextInputElement(element) {
        if (!element) return false;
        
        const tagName = element.tagName.toLowerCase();
        const type = element.type && element.type.toLowerCase();
        
        return (
            tagName === 'input' && 
            (type === 'text' || type === 'email' || type === 'password' || type === 'tel' || type === 'number')
        ) || tagName === 'textarea';
    }

    /**
     * البحث عن الحقل التالي في النموذج
     * @param {HTMLElement} currentField - الحقل الحالي
     * @returns {HTMLElement|null} - الحقل التالي أو null إذا لم يكن هناك حقل تالي
     */
    function findNextField(currentField) {
        if (!currentField) return null;
        
        // الحصول على النموذج الذي ينتمي إليه الحقل
        const form = currentField.closest('form');
        if (!form) return null;
        
        // الحصول على جميع حقول الإدخال في النموذج
        const fields = Array.from(form.querySelectorAll('input, select, textarea')).filter(field => {
            return isInputElement(field) && !field.disabled && field.style.display !== 'none' && field.tabIndex !== -1;
        });
        
        // ترتيب الحقول حسب ترتيب التبويب (tabIndex) ثم حسب الترتيب في المستند
        fields.sort((a, b) => {
            if (a.tabIndex > 0 && b.tabIndex > 0) {
                return a.tabIndex - b.tabIndex;
            } else if (a.tabIndex > 0) {
                return -1;
            } else if (b.tabIndex > 0) {
                return 1;
            }
            
            return 0;
        });
        
        // البحث عن الحقل الحالي في القائمة
        const currentIndex = fields.indexOf(currentField);
        
        // إذا لم يتم العثور على الحقل الحالي أو كان هو الحقل الأخير
        if (currentIndex === -1 || currentIndex === fields.length - 1) {
            return null;
        }
        
        // إرجاع الحقل التالي
        return fields[currentIndex + 1];
    }

    /**
     * تهيئة اختصارات لوحة المفاتيح
     */
    function initializeHotkeys() {
        console.log('تهيئة اختصارات لوحة المفاتيح...');
        
        // قائمة الاختصارات
        const hotkeys = [
            { key: 'n', ctrl: true, description: 'إضافة مستثمر جديد', action: () => openModal('add-investor-modal') },
            { key: 'd', ctrl: true, description: 'إضافة إيداع جديد', action: () => openModal('add-deposit-modal') },
            { key: 'w', ctrl: true, description: 'سحب جديد', action: () => openModal('add-withdraw-modal') },
            { key: 'p', ctrl: true, description: 'دفع الأرباح', action: () => openModal('pay-profit-modal') },
            { key: 'f', ctrl: true, description: 'البحث', action: focusSearch },
            { key: 'h', ctrl: true, description: 'العودة للوحة التحكم', action: () => showPage('dashboard') },
            { key: 'i', ctrl: true, description: 'صفحة المستثمرين', action: () => showPage('investors') },
            { key: 't', ctrl: true, description: 'صفحة العمليات', action: () => showPage('transactions') },
            { key: 'o', ctrl: true, description: 'صفحة الأرباح', action: () => showPage('profits') },
            { key: 's', ctrl: true, description: 'الإعدادات', action: () => showPage('settings') },
            { key: 'e', ctrl: true, description: 'الموظفين', action: () => showPage('employees') },
            { key: '?', ctrl: true, description: 'عرض قائمة الاختصارات', action: showHotkeysHelp }
        ];
        
        // الاستماع إلى أحداث ضغط المفاتيح
        document.addEventListener('keydown', function(event) {
            // التحقق من أن التركيز ليس على حقل نصي
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
                return;
            }
            
            // البحث عن اختصار مطابق
            const hotkey = hotkeys.find(hk => 
                hk.key.toLowerCase() === event.key.toLowerCase() && 
                hk.ctrl === event.ctrlKey
            );
            
            if (hotkey) {
                event.preventDefault();
                hotkey.action();
            }
        });
        
        // إضافة صفحة مساعدة الاختصارات
        addHotkeysHelpModal(hotkeys);
    }

    /**
     * التركيز على حقل البحث
     */
    function focusSearch() {
        // البحث عن حقل البحث في الصفحة النشطة
        const activePage = document.querySelector('.page.active');
        if (!activePage) return;
        
        const searchInput = activePage.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    /**
     * إضافة نافذة مساعدة الاختصارات
     * @param {Array} hotkeys - قائمة الاختصارات
     */
    function addHotkeysHelpModal(hotkeys) {
        // التحقق من عدم وجود النافذة مسبقًا
        if (document.getElementById('hotkeys-help-modal')) {
            return;
        }
        
        // إنشاء النافذة
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.id = 'hotkeys-help-modal';
        
        const modalContent = `
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">اختصارات لوحة المفاتيح</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="hotkeys-list">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">الاختصار</th>
                                    <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">الوصف</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${hotkeys.map(hotkey => `
                                    <tr>
                                        <td style="padding: 8px; border-bottom: 1px solid #eee;">
                                            <kbd style="background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 3px; padding: 2px 5px; font-family: monospace;">
                                                ${hotkey.ctrl ? 'Ctrl +' : ''} ${hotkey.key.toUpperCase()}
                                            </kbd>
                                        </td>
                                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${hotkey.description}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div style="margin-top: 20px;">
                        <p style="color: #666;">اضغط على <kbd style="background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 3px; padding: 2px 5px; font-family: monospace;">Ctrl + ?</kbd> في أي وقت لعرض هذه القائمة.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                </div>
            </div>
        `;
        
        modalOverlay.innerHTML = modalContent;
        
        // إضافة النافذة إلى المستند
        document.body.appendChild(modalOverlay);
        
        // إضافة مستمعي الأحداث للأزرار
        const closeButtons = modalOverlay.querySelectorAll('.modal-close, .modal-close-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                modalOverlay.classList.remove('active');
            });
        });
    }

    /**
     * عرض نافذة مساعدة الاختصارات
     */
    function showHotkeysHelp() {
        const modal = document.getElementById('hotkeys-help-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * فتح نافذة منبثقة
     * @param {string} modalId - معرف النافذة
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            
            // التركيز على أول حقل في النافذة
            setTimeout(() => {
                const firstInput = modal.querySelector('input, select, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 50);
        }
    }
    
    /**
     * تنفيذ إجراء بعد تأخير
     * @param {Function} func - الدالة المراد تنفيذها
     * @param {number} wait - وقت التأخير بالميلي ثانية
     * @returns {Function} - دالة مؤجلة
     */
    function debounce(func, wait) {
        let timeout;
        
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * تنسيق المبلغ المالي
     * @param {number} amount - المبلغ
     * @param {boolean} addCurrency - إضافة اسم العملة
     * @returns {string} - المبلغ المنسق
     */
    function formatCurrency(amount, addCurrency = true) {
        // استخدام دالة تنسيق العملة الموجودة في التطبيق إذا كانت متوفرة
        if (window.formatCurrency && typeof window.formatCurrency === 'function') {
            return window.formatCurrency(amount, addCurrency);
        }
        
        // تنفيذ بديل إذا لم تكن الدالة متوفرة
        if (amount === undefined || amount === null || isNaN(amount)) {
            return addCurrency ? "0 دينار" : "0";
        }
        
        // تقريب المبلغ إلى رقمين عشريين إذا كان يحتوي على كسور
        amount = parseFloat(amount);
        if (amount % 1 !== 0) {
            amount = amount.toFixed(2);
        }
        
        // تحويل المبلغ إلى نص وإضافة الفواصل بين كل ثلاثة أرقام
        const parts = amount.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        // إعادة المبلغ مع إضافة العملة إذا تم طلب ذلك
        const formattedAmount = parts.join('.');
        
        if (addCurrency) {
            const currency = (window.settings && window.settings.currency) ? window.settings.currency : 'دينار';
            return `${formattedAmount} ${currency}`;
        } else {
            return formattedAmount;
        }
    }

    /**
     * البحث الذكي المستبق
     * يقوم بتنبؤ ما قد يبحث عنه المستخدم بناءً على الأنماط السابقة
     * @param {string} query - نص البحث الحالي
     * @param {string} type - نوع البحث
     * @returns {Array} - اقتراحات البحث المستبق
     */
    function predictiveSearch(query, type) {
        if (!query || query.length < 2) return [];
        
        // تخزين سجل البحث في التخزين المحلي
        const searchHistory = localStorage.getItem('searchHistory');
        let history = searchHistory ? JSON.parse(searchHistory) : [];
        
        // تصفية التاريخ حسب النوع
        if (type !== 'all') {
            history = history.filter(item => item.type === type);
        }
        
        // البحث عن العناصر المشابهة في التاريخ
        const similarQueries = history.filter(item => 
            item.query.toLowerCase().includes(query.toLowerCase())
        );
        
        // ترتيب النتائج حسب التكرار والحداثة
        similarQueries.sort((a, b) => {
            // ترتيب أولاً حسب التكرار
            if (a.count !== b.count) {
                return b.count - a.count;
            }
            
            // ثم حسب الحداثة
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // إرجاع أول 5 نتائج فريدة
        const uniqueResults = [];
        const addedQueries = new Set();
        
        for (const item of similarQueries) {
            if (!addedQueries.has(item.query.toLowerCase()) && uniqueResults.length < 5) {
                uniqueResults.push(item.query);
                addedQueries.add(item.query.toLowerCase());
            }
        }
        
        return uniqueResults;
    }

    /**
     * تسجيل البحث في التاريخ
     * @param {string} query - نص البحث
     * @param {string} type - نوع البحث
     */
    function recordSearch(query, type) {
        if (!query || query.length < 2) return;
        
        // تخزين سجل البحث في التخزين المحلي
        const searchHistory = localStorage.getItem('searchHistory');
        let history = searchHistory ? JSON.parse(searchHistory) : [];
        
        // البحث عن العنصر في التاريخ
        const existingIndex = history.findIndex(item => 
            item.query.toLowerCase() === query.toLowerCase() && item.type === type
        );
        
        if (existingIndex !== -1) {
            // تحديث العنصر الموجود
            history[existingIndex].count++;
            history[existingIndex].timestamp = new Date().toISOString();
        } else {
            // إضافة عنصر جديد
            history.push({
                query,
                type,
                count: 1,
                timestamp: new Date().toISOString()
            });
        }
        
        // الاحتفاظ بأحدث 100 عنصر فقط
        if (history.length > 100) {
            history = history
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 100);
        }
        
        // حفظ التاريخ المحدث
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }

    /**
     * إضافة قائمة البحث بتصفية سريعة
     * @param {HTMLInputElement} inputElement - حقل البحث
     * @param {Array} data - البيانات المراد تصفيتها
     * @param {Object} options - خيارات التصفية
     */
    function addQuickFilterTags(inputElement, data, options = {}) {
        // الخيارات الافتراضية
        const defaultOptions = {
            container: null, // حاوية مخصصة للعلامات
            maxTags: 5,      // الحد الأقصى لعدد العلامات
            field: 'type',   // الحقل المراد استخدامه للتصفية
            onTagClick: null // دالة يتم استدعاؤها عند النقر على علامة
        };
        
        const config = { ...defaultOptions, ...options };
        
        // إنشاء حاوية العلامات إذا لم يتم تحديدها
        let tagsContainer = config.container;
        if (!tagsContainer) {
            // البحث عن الحاوية أو إنشاء واحدة
            tagsContainer = inputElement.parentElement.querySelector('.quick-filter-tags');
            
            if (!tagsContainer) {
                tagsContainer = document.createElement('div');
                tagsContainer.className = 'quick-filter-tags';
                tagsContainer.style.marginTop = '5px';
                tagsContainer.style.display = 'flex';
                tagsContainer.style.flexWrap = 'wrap';
                tagsContainer.style.gap = '5px';
                
                // إضافة الحاوية بعد حقل البحث
                inputElement.parentElement.appendChild(tagsContainer);
            }
        }
        
        // جمع القيم الفريدة من البيانات
        const uniqueValues = new Set();
        data.forEach(item => {
            const value = item[config.field];
            if (value) {
                uniqueValues.add(value);
            }
        });
        
        // تحويل القيم إلى مصفوفة وترتيبها
        const tags = Array.from(uniqueValues).sort();
        
        // اختيار أول n علامات (وفقًا لـ maxTags)
        const selectedTags = tags.slice(0, config.maxTags);
        
        // إنشاء عناصر العلامات
        tagsContainer.innerHTML = '';
        
        selectedTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'quick-filter-tag';
            tagElement.textContent = tag;
            tagElement.style.padding = '3px 8px';
            tagElement.style.borderRadius = '12px';
            tagElement.style.backgroundColor = '#f5f5f5';
            tagElement.style.color = '#333';
            tagElement.style.fontSize = '0.85rem';
            tagElement.style.cursor = 'pointer';
            tagElement.style.transition = 'all 0.2s ease';
            
            // إضافة مستمع النقر
            tagElement.addEventListener('click', function() {
                // تعيين قيمة حقل البحث
                inputElement.value = tag;
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                
                // استدعاء الدالة المخصصة إذا كانت موجودة
                if (typeof config.onTagClick === 'function') {
                    config.onTagClick(tag);
                }
            });
            
            // تغيير نمط العلامة عند تمرير الماوس
            tagElement.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#e0e0e0';
            });
            
            tagElement.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#f5f5f5';
            });
            
            tagsContainer.appendChild(tagElement);
        });
    }

    /**
     * التبديل بين وضعي البحث العادي والمتقدم
     * @param {HTMLInputElement} inputElement - حقل البحث
     */
    function toggleAdvancedSearch(inputElement) {
        // التحقق من أن العنصر هو حقل بحث
        if (!inputElement || !inputElement.classList.contains('search-input')) {
            return;
        }
        
        // التحقق من وجود حاوية البحث المتقدم
        let advancedSearchContainer = inputElement.parentElement.querySelector('.advanced-search-container');
        
        if (!advancedSearchContainer) {
            // إنشاء حاوية البحث المتقدم
            advancedSearchContainer = document.createElement('div');
            advancedSearchContainer.className = 'advanced-search-container';
            advancedSearchContainer.style.display = 'none';
            advancedSearchContainer.style.marginTop = '10px';
            advancedSearchContainer.style.padding = '10px';
            advancedSearchContainer.style.backgroundColor = '#f9f9f9';
            advancedSearchContainer.style.borderRadius = '5px';
            advancedSearchContainer.style.border = '1px solid #ddd';
            
            // إضافة محتوى البحث المتقدم (يعتمد على نوع البحث)
            const searchType = inputElement.getAttribute('data-search-type') || 'all';
            
            let formContent = '';
            
            switch (searchType) {
                case 'investors':
                    formContent = `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div class="form-group">
                                <label>الاسم</label>
                                <input type="text" class="form-input" name="name" placeholder="اسم المستثمر">
                            </div>
                            <div class="form-group">
                                <label>رقم الهاتف</label>
                                <input type="text" class="form-input" name="phone" placeholder="رقم الهاتف">
                            </div>
                            <div class="form-group">
                                <label>الحالة</label>
                                <select class="form-select" name="status">
                                    <option value="">الكل</option>
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>المبلغ أكبر من</label>
                                <input type="number" class="form-input" name="minAmount" placeholder="الحد الأدنى">
                            </div>
                        </div>
                    `;
                    break;
                    
                case 'transactions':
                    formContent = `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div class="form-group">
                                <label>المستثمر</label>
                                <input type="text" class="form-input" name="investorName" placeholder="اسم المستثمر">
                            </div>
                            <div class="form-group">
                                <label>نوع العملية</label>
                                <select class="form-select" name="type">
                                    <option value="">الكل</option>
                                    <option value="إيداع">إيداع</option>
                                    <option value="سحب">سحب</option>
                                    <option value="دفع أرباح">دفع أرباح</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>من تاريخ</label>
                                <input type="date" class="form-input" name="fromDate">
                            </div>
                            <div class="form-group">
                                <label>إلى تاريخ</label>
                                <input type="date" class="form-input" name="toDate">
                            </div>
                        </div>
                    `;
                    break;
                    
                case 'employees':
                    formContent = `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div class="form-group">
                                <label>الاسم</label>
                                <input type="text" class="form-input" name="name" placeholder="اسم الموظف">
                            </div>
                            <div class="form-group">
                                <label>المسمى الوظيفي</label>
                                <input type="text" class="form-input" name="position" placeholder="المسمى الوظيفي">
                            </div>
                            <div class="form-group">
                                <label>القسم</label>
                                <input type="text" class="form-input" name="department" placeholder="القسم">
                            </div>
                            <div class="form-group">
                                <label>الحالة</label>
                                <select class="form-select" name="status">
                                    <option value="">الكل</option>
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </select>
                            </div>
                        </div>
                    `;
                    break;
                    
                default:
                    formContent = `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div class="form-group">
                                <label>الاسم</label>
                                <input type="text" class="form-input" name="name" placeholder="اسم">
                            </div>
                            <div class="form-group">
                                <label>من تاريخ</label>
                                <input type="date" class="form-input" name="fromDate">
                            </div>
                            <div class="form-group">
                                <label>إلى تاريخ</label>
                                <input type="date" class="form-input" name="toDate">
                            </div>
                            <div class="form-group">
                                <label>النوع</label>
                                <select class="form-select" name="type">
                                    <option value="">الكل</option>
                                    <option value="investors">المستثمرين</option>
                                    <option value="transactions">العمليات</option>
                                    <option value="employees">الموظفين</option>
                                </select>
                            </div>
                        </div>
                    `;
            }
            
            // إضافة زر البحث
            formContent += `
                <div style="margin-top: 10px; text-align: left;">
                    <button class="btn btn-primary btn-sm advanced-search-btn">بحث متقدم</button>
                    <button class="btn btn-outline btn-sm advanced-search-reset">إعادة تعيين</button>
                </div>
            `;
            
            // إضافة المحتوى إلى الحاوية
            advancedSearchContainer.innerHTML = formContent;
            
            // إضافة الحاوية بعد حقل البحث
            inputElement.parentElement.appendChild(advancedSearchContainer);
            
            // إضافة مستمعي الأحداث للأزرار
            const searchButton = advancedSearchContainer.querySelector('.advanced-search-btn');
            const resetButton = advancedSearchContainer.querySelector('.advanced-search-reset');
            
            if (searchButton) {
                searchButton.addEventListener('click', function() {
                    performAdvancedSearch(advancedSearchContainer, inputElement);
                });
            }
            
            if (resetButton) {
                resetButton.addEventListener('click', function() {
                    resetAdvancedSearch(advancedSearchContainer, inputElement);
                });
            }
        }
        
        // تبديل حالة العرض
        advancedSearchContainer.style.display = 
            advancedSearchContainer.style.display === 'none' ? 'block' : 'none';
    }
    
    /**
     * تنفيذ البحث المتقدم
     * @param {HTMLElement} container - حاوية البحث المتقدم
     * @param {HTMLInputElement} inputElement - حقل البحث
     */
    function performAdvancedSearch(container, inputElement) {
        // جمع قيم حقول البحث المتقدم
        const form = {};
        
        // جمع قيم الحقول النصية
        container.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]').forEach(input => {
            const name = input.getAttribute('name');
            const value = input.value.trim();
            if (value) {
                form[name] = value;
            }
        });
        
        // جمع قيم القوائم المنسدلة
        container.querySelectorAll('select').forEach(select => {
            const name = select.getAttribute('name');
            const value = select.value;
            if (value) {
                form[name] = value;
            }
        });
        
        // الحصول على نوع البحث
        const searchType = inputElement.getAttribute('data-search-type') || 'all';
        
        // تنفيذ البحث بناءً على النوع
        switch (searchType) {
            case 'investors':
                // البحث في المستثمرين
                searchInvestorsAdvanced(form);
                break;
                
            case 'transactions':
                // البحث في العمليات
                searchTransactionsAdvanced(form);
                break;
                
            case 'employees':
                // البحث في الموظفين
                searchEmployeesAdvanced(form);
                break;
                
            case 'all':
                // البحث في كل شيء
                if (form.type) {
                    // إذا تم تحديد نوع محدد في البحث المتقدم
                    switch (form.type) {
                        case 'investors':
                            searchInvestorsAdvanced(form);
                            break;
                        case 'transactions':
                            searchTransactionsAdvanced(form);
                            break;
                        case 'employees':
                            searchEmployeesAdvanced(form);
                            break;
                    }
                } else {
                    // بحث عام في جميع الأنواع
                    searchAllAdvanced(form);
                }
                break;
        }
        
        // تحديث قيمة حقل البحث لعرض البحث الحالي
        inputElement.value = 'بحث متقدم...';
    }

    /**
     * إعادة تعيين البحث المتقدم
     * @param {HTMLElement} container - حاوية البحث المتقدم
     * @param {HTMLInputElement} inputElement - حقل البحث
     */
    function resetAdvancedSearch(container, inputElement) {
        // إعادة تعيين قيم جميع الحقول
        container.querySelectorAll('input, select').forEach(element => {
            if (element.tagName === 'SELECT') {
                element.selectedIndex = 0;
            } else {
                element.value = '';
            }
        });
        
        // مسح حقل البحث الرئيسي
        inputElement.value = '';
        
        // تنفيذ البحث (إعادة تعيين النتائج)
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        
        // إخفاء حاوية البحث المتقدم
        container.style.display = 'none';
    }

    /**
     * تنفيذ البحث المتقدم في المستثمرين
     * @param {Object} form - بيانات نموذج البحث
     */
    function searchInvestorsAdvanced(form) {
        console.log('تنفيذ البحث المتقدم في المستثمرين:', form);
        
        // التحقق من وجود الجدول
        const tableBody = document.querySelector('#investors-table tbody');
        if (!tableBody) {
            console.warn('لم يتم العثور على جدول المستثمرين');
            return;
        }
        
        // التحقق من وجود البيانات
        if (!window.investors || !Array.isArray(window.investors)) {
            console.warn('بيانات المستثمرين غير متوفرة');
            return;
        }
        
        // تصفية المستثمرين حسب معايير البحث
        let filteredInvestors = window.investors.filter(investor => {
            // التحقق من تطابق جميع المعايير المحددة
            
            // البحث في الاسم
            if (form.name && !investor.name.toLowerCase().includes(form.name.toLowerCase())) {
                return false;
            }
            
            // البحث في رقم الهاتف
            if (form.phone && !investor.phone.includes(form.phone)) {
                return false;
            }
            
            // تصفية حسب الحالة
            if (form.status && investor.status !== form.status) {
                return false;
            }
            
            // تصفية حسب الحد الأدنى للمبلغ
            if (form.minAmount && (!investor.amount || investor.amount < parseFloat(form.minAmount))) {
                return false;
            }
            
            // إذا اجتاز جميع شروط التصفية
            return true;
        });
        
        // تحديث الجدول
        tableBody.innerHTML = '';
        
        if (filteredInvestors.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="8" class="text-center">لم يتم العثور على نتائج مطابقة لمعايير البحث</td>';
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // عرض المستثمرين المصفاة
        filteredInvestors.forEach(investor => {
            const row = document.createElement('tr');
            
            // تنسيق تاريخ الانضمام
            const joinDate = investor.joinDate || investor.createdAt || '';
            
            // إنشاء صف الجدول
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
                <td>${formatCurrency(calculateMonthlyProfit(investor) || 0)}</td>
                <td>${joinDate}</td>
                <td><span class="badge badge-${investor.status === 'inactive' ? 'danger' : 'success'}">${investor.status === 'inactive' ? 'غير نشط' : 'نشط'}</span></td>
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
            addInvestorRowEventListeners(row);
        });
    }

    /**
     * تنفيذ البحث المتقدم في العمليات
     * @param {Object} form - بيانات نموذج البحث
     */
    function searchTransactionsAdvanced(form) {
        console.log('تنفيذ البحث المتقدم في العمليات:', form);
        
        // التحقق من وجود الجدول
        const tableBody = document.querySelector('#transactions-table tbody');
        if (!tableBody) {
            console.warn('لم يتم العثور على جدول العمليات');
            return;
        }
        
        // التحقق من وجود البيانات
        if (!window.transactions || !Array.isArray(window.transactions)) {
            console.warn('بيانات العمليات غير متوفرة');
            return;
        }
        
        // تصفية العمليات حسب معايير البحث
        let filteredTransactions = window.transactions.filter(transaction => {
            // التحقق من تطابق جميع المعايير المحددة
            
            // البحث في اسم المستثمر
            if (form.investorName && (!transaction.investorName || !transaction.investorName.toLowerCase().includes(form.investorName.toLowerCase()))) {
                return false;
            }
            
            // تصفية حسب نوع العملية
            if (form.type && transaction.type !== form.type) {
                return false;
            }
            
            // تصفية حسب تاريخ البداية
            if (form.fromDate) {
                const fromDate = new Date(form.fromDate);
                const transactionDate = new Date(transaction.date);
                if (transactionDate < fromDate) {
                    return false;
                }
            }
            
            // تصفية حسب تاريخ النهاية
            if (form.toDate) {
                const toDate = new Date(form.toDate);
                toDate.setHours(23, 59, 59); // نهاية اليوم
                const transactionDate = new Date(transaction.date);
                if (transactionDate > toDate) {
                    return false;
                }
            }
            
            // إذا اجتاز جميع شروط التصفية
            return true;
        });
        
        // تحديث الجدول
        tableBody.innerHTML = '';
        
        if (filteredTransactions.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" class="text-center">لم يتم العثور على نتائج مطابقة لمعايير البحث</td>';
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // عرض العمليات المصفاة
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
            
            // إنشاء صف الجدول
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.investorName || ''}</td>
                <td>
                    <span class="badge badge-${typeClass}">${typeIcon} ${transaction.type}</span>
                </td>
                <td>${transaction.date || ''}</td>
                <td>${formatCurrency(transaction.amount || 0)}</td>
                <td>${transaction.balanceAfter ? formatCurrency(transaction.balanceAfter) : '-'}</td>
                <td>
                    <button class="btn btn-outline btn-sm transaction-details" data-id="${transaction.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمع حدث لزر التفاصيل
            const detailsButton = row.querySelector('.transaction-details');
            if (detailsButton) {
                detailsButton.addEventListener('click', function() {
                    const transactionId = this.getAttribute('data-id');
                    if (window.showTransactionDetails) {
                        window.showTransactionDetails(transactionId);
                    }
                });
            }
        });
    }

    /**
     * تنفيذ البحث المتقدم في الموظفين
     * @param {Object} form - بيانات نموذج البحث
     */
    function searchEmployeesAdvanced(form) {
        console.log('تنفيذ البحث المتقدم في الموظفين:', form);
        
        // التحقق من وجود الجدول
        const tableBody = document.querySelector('#employees-table tbody');
        if (!tableBody) {
            console.warn('لم يتم العثور على جدول الموظفين');
            return;
        }
        
        // التحقق من وجود البيانات
        if (!window.employees || !Array.isArray(window.employees)) {
            console.warn('بيانات الموظفين غير متوفرة');
            return;
        }
        
        // تصفية الموظفين حسب معايير البحث
        let filteredEmployees = window.employees.filter(employee => {
            // التحقق من تطابق جميع المعايير المحددة
            
            // البحث في الاسم
            if (form.name && !employee.name.toLowerCase().includes(form.name.toLowerCase())) {
                return false;
            }
            
            // البحث في المسمى الوظيفي
            if (form.position && (!employee.position || !employee.position.toLowerCase().includes(form.position.toLowerCase()))) {
                return false;
            }
            
            // البحث في القسم
            if (form.department && (!employee.department || !employee.department.toLowerCase().includes(form.department.toLowerCase()))) {
                return false;
            }
            
            // تصفية حسب الحالة
            if (form.status && employee.status !== form.status) {
                return false;
            }
            
            // إذا اجتاز جميع شروط التصفية
            return true;
        });
        
        // تحديث الجدول
        tableBody.innerHTML = '';
        
        if (filteredEmployees.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="8" class="text-center">لم يتم العثور على نتائج مطابقة لمعايير البحث</td>';
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // عرض الموظفين المصفاة
        filteredEmployees.forEach(employee => {
            const row = document.createElement('tr');
            
            // تنسيق تاريخ التعيين
            const hireDate = employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '';
            
            // إنشاء صف الجدول
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>
                    <div class="employee-info">
                        <div class="employee-avatar">${employee.name.charAt(0)}</div>
                        <div>
                            <div class="employee-name">${employee.name}</div>
                            <div class="employee-email">${employee.email || employee.phone}</div>
                        </div>
                    </div>
                </td>
                <td>${employee.position || ''}</td>
                <td>${employee.phone || ''}</td>
                <td>${hireDate}</td>
                <td>${formatCurrency(employee.salary || 0)}</td>
                <td><span class="badge badge-${employee.status === 'inactive' ? 'danger' : 'success'}">${employee.status === 'inactive' ? 'غير نشط' : 'نشط'}</span></td>
                <td>
                    <div class="employee-actions">
                        <button class="employee-action-btn view-employee" data-id="${employee.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="employee-action-btn edit edit-employee" data-id="${employee.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="employee-action-btn delete delete-employee" data-id="${employee.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمعي الأحداث للأزرار
            addEmployeeRowEventListeners(row);
        });
    }

    /**
     * تنفيذ البحث المتقدم في جميع الأنواع
     * @param {Object} form - بيانات نموذج البحث
     */
    function searchAllAdvanced(form) {
        console.log('تنفيذ البحث المتقدم في جميع الأنواع:', form);
        
        // الحصول على الصفحة النشطة
        const activePage = document.querySelector('.page.active');
        if (!activePage) return;
        
        const pageId = activePage.id;
        
        // تنفيذ البحث حسب الصفحة النشطة
        switch (pageId) {
            case 'investors-page':
                searchInvestorsAdvanced(form);
                break;
                
            case 'transactions-page':
                searchTransactionsAdvanced(form);
                break;
                
            case 'employees-page':
                searchEmployeesAdvanced(form);
                break;
                
            case 'profits-page':
                // تنفيذ البحث في الأرباح عن طريق البحث في المستثمرين
                searchInvestorsAdvanced(form);
                break;
                
            case 'dashboard-page':
                // البحث في لوحة التحكم (آخر العمليات)
                searchTransactionsAdvanced(form);
                break;
        }
    }

    /**
     * الواجهة العامة لمساعد البحث الذكي
     */
    return {
        // تهيئة المساعد
        init: function(options = {}) {
            init(options);
            return this;
        },
        
        // تحديث البيانات المخزنة
        updateCachedData: function(dataType = 'all') {
            updateCachedData(dataType);
            return this;
        },
        
        // تنفيذ البحث يدويًا
        search: function(query, type, pageId) {
            performSearch(query, type, pageId);
            return this;
        },
        
        // تنفيذ البحث المتقدم
        advancedSearch: function(form, type) {
            switch (type) {
                case 'investors':
                    searchInvestorsAdvanced(form);
                    break;
                case 'transactions':
                    searchTransactionsAdvanced(form);
                    break;
                case 'employees':
                    searchEmployeesAdvanced(form);
                    break;
                default:
                    searchAllAdvanced(form);
            }
            return this;
        },
        
        // تبديل وضع البحث المتقدم
        toggleAdvancedSearch: function(inputElement) {
            toggleAdvancedSearch(inputElement);
            return this;
        },
        
        // إضافة علامات التصفية السريعة
        addQuickFilterTags: function(inputElement, data, options) {
            addQuickFilterTags(inputElement, data, options);
            return this;
        },
        
        // عرض مساعدة الاختصارات
        showHotkeysHelp: function() {
            showHotkeysHelp();
            return this;
        },
        
        // إعادة تهيئة خانات البحث
        reinitializeSearchBoxes: function() {
            initializeSearchBoxes();
            return this;
        }
    };
})();

// تنفيذ التهيئة التلقائية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير التهيئة قليلاً للتأكد من تحميل بقية العناصر
    setTimeout(() => {
        SmartSearchAssistant.init();
    }, 500);
});

/**
 * توثيق اختصارات لوحة المفاتيح المتاحة:
 * 
 * Ctrl + N: إضافة مستثمر جديد
 * Ctrl + D: إضافة إيداع جديد
 * Ctrl + W: سحب جديد
 * Ctrl + P: دفع الأرباح
 * Ctrl + F: التركيز على البحث
 * Ctrl + H: العودة للوحة التحكم
 * Ctrl + I: صفحة المستثمرين
 * Ctrl + T: صفحة العمليات
 * Ctrl + O: صفحة الأرباح
 * Ctrl + S: الإعدادات
 * Ctrl + E: الموظفين
 * Ctrl + ?: عرض قائمة الاختصارات
 */