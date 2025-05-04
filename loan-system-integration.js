/**
 * نظام تكامل إدارة القروض
 * يعمل هذا الملف كجسر بين نظام إدارة القروض (loans-management.js) والتطبيق الرئيسي
 */

// التأكد من تحميل الملف بعد تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', function() {
    console.log('تحميل نظام القروض - بدء التكامل');
    
    // تأكد من تحميل loans-management.js قبل المتابعة
    ensureLoanSystemLoaded()
        .then(() => {
            console.log('تم تحميل نظام القروض بنجاح');
            initializeLoanSystem();
        })
        .catch(error => {
            console.error('فشل في تحميل نظام القروض:', error);
            showLoanSystemError();
        });
});

/**
 * التأكد من تحميل ملف نظام القروض
 * @returns {Promise} وعد يتم حله عند تحميل النظام
 */
function ensureLoanSystemLoaded() {
    return new Promise((resolve, reject) => {
        // التحقق مما إذا كانت وظائف نظام القروض متاحة بالفعل
        if (typeof initLoanSystem === 'function') {
            resolve();
            return;
        }

        // إذا لم يكن النظام محملاً، قم بتحميله ديناميكياً
        const script = document.createElement('script');
        script.src = 'loans-management.js';
        script.async = true;
        
        script.onload = () => {
            // التحقق من وجود الوظائف المطلوبة بعد التحميل
            if (typeof initLoanSystem === 'function') {
                resolve();
            } else {
                reject(new Error('تم تحميل ملف loans-management.js لكن الوظائف المطلوبة غير متوفرة'));
            }
        };
        
        script.onerror = () => {
            reject(new Error('فشل في تحميل ملف loans-management.js'));
        };
        
        document.body.appendChild(script);
    });
}

/**
 * تهيئة نظام القروض وتكامله مع التطبيق الرئيسي
 */
function initializeLoanSystem() {
    try {
        // تحقق من توفر العناصر المطلوبة في DOM
        const navList = document.querySelector('.nav-list');
        const mainContent = document.querySelector('.main-content');
        
        if (!navList || !mainContent) {
            throw new Error('لم يتم العثور على عناصر DOM المطلوبة (.nav-list و/أو .main-content)');
        }
        
        // تنفيذ وظائف نظام القروض
        console.log('تشغيل نظام القروض...');
        
        // تشغيل نظام القروض
        initLoanSystem();
        
        // إضافة عناصر القروض إلى القائمة الجانبية
        addLoanNavItems();
        
        // إنشاء صفحات القروض
        createLoanPages();
        
        // تطبيق مظهر نظام القروض
        applyLoanSystemTheme();
        
        // تحديث شارات الأرقام
        updateNavBadges();
        
        // إضافة أحداث النقر للروابط الجديدة
        setupLoanNavigationEvents();
        
        console.log('تم تكامل نظام القروض بنجاح');
    } catch (error) {
        console.error('خطأ في تهيئة نظام القروض:', error);
        showLoanSystemError();
    }
}

/**
 * إعداد أحداث التنقل لنظام القروض
 */
function setupLoanNavigationEvents() {
    // العثور على جميع روابط القروض التي أضيفت
    const loanLinks = document.querySelectorAll('.nav-link[data-loan-page]');
    
    loanLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            // إزالة الفئة النشطة من جميع الروابط
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // إضافة الفئة النشطة للرابط الحالي
            this.classList.add('active');
            
            // إخفاء جميع الصفحات
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // عرض صفحة القرض المطلوبة
            const pageId = this.getAttribute('data-loan-page');
            showLoanPage(pageId);
            
            // تحديث بيانات الصفحة
            updatePageData(pageId);
        });
    });
    
    // إضافة أحداث إضافية قد تكون مطلوبة لنظام القروض
    setupAdditionalLoanEvents();
}

/**
 * إعداد أحداث إضافية لنظام القروض (مثل النقر على الأزرار وغيرها)
 */
function setupAdditionalLoanEvents() {
    // إضافة أي مستمعات أحداث إضافية مطلوبة لنظام القروض
    // على سبيل المثال، أزرار الإضافة والتعديل والحذف
    
    // التحقق من وجود زر إضافة قرض جديد
    const addLoanButton = document.getElementById('add-loan-btn');
    if (addLoanButton) {
        addLoanButton.addEventListener('click', function() {
            // افتراض أن هناك دالة openAddLoanModal() في نظام القروض
            if (typeof openAddLoanModal === 'function') {
                openAddLoanModal();
            } else {
                console.warn('الدالة openAddLoanModal غير متوفرة');
            }
        });
    }
    
    // يمكن إضافة المزيد من أحداث الاستماع هنا حسب الحاجة
}

/**
 * عرض رسالة خطأ للمستخدم عند فشل تحميل نظام القروض
 */
function showLoanSystemError() {
    // إنشاء رسالة خطأ لإظهارها للمستخدم
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; padding: 15px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);';
    errorDiv.innerHTML = `
        <strong>خطأ في تحميل نظام القروض</strong>
        <p>لم نتمكن من تحميل نظام إدارة القروض. يرجى تحديث الصفحة أو الاتصال بمسؤول النظام.</p>
        <button onclick="this.parentNode.remove()" style="float: left; background: none; border: none; cursor: pointer;">✕</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // إزالة الرسالة تلقائيًا بعد 10 ثوانٍ
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 10000);
}

/**
 * تحديث نظام القروض - يمكن استدعاؤها من أي مكان في التطبيق
 */
window.updateLoanSystem = function() {
    if (typeof updateNavBadges === 'function') {
        updateNavBadges();
    }
    
    // تحديث البيانات في الصفحة النشطة
    const activeLoanPage = document.querySelector('.page[data-loan-page].active');
    if (activeLoanPage) {
        const pageId = activeLoanPage.getAttribute('data-loan-page');
        if (typeof updatePageData === 'function') {
            updatePageData(pageId);
        }
    }
};

/**
 * دالة لتحديث مظهر نظام القروض عند تغيير مظهر التطبيق
 */
window.updateLoanSystemTheme = function() {
    if (typeof applyLoanSystemTheme === 'function') {
        applyLoanSystemTheme();
    }
};

// الاستماع لحدث تحديث النظام الذي قد يطلقه النظام الأساسي
document.addEventListener('app:refresh', function() {
    window.updateLoanSystem();
});

// الاستماع لحدث تغيير المظهر
document.addEventListener('app:themeChanged', function() {
    window.updateLoanSystemTheme();
});

// حل مشكلة عدم عمل الصفحات واختفاء الأيقونات
// طبقة إضافية من الحماية لضمان ظهور عناصر القائمة
setInterval(function() {
    const navList = document.querySelector('.nav-list');
    const loanNavItems = document.querySelectorAll('.nav-item[data-loan-nav]');
    
    // إذا كانت عناصر القائمة موجودة في DOM ولكنها غير مرئية
    if (navList && loanNavItems.length === 0 && typeof addLoanNavItems === 'function') {
        console.log('إعادة محاولة إضافة عناصر القروض للقائمة');
        addLoanNavItems();
    }
}, 5000); // التحقق كل 5 ثوانٍ