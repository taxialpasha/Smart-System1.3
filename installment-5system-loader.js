/**
 * نظام تحميل وتكامل نظام الأقساط
 * يقوم هذا الملف بتحميل ملفات نظام الأقساط وتكاملها مع النظام الرئيسي
 */

(function() {
    console.log('بدء تحميل نظام الأقساط...');
    
    // تحميل أنماط CSS
    function loadCSS(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            
            link.onload = () => {
                console.log(`تم تحميل ملف CSS: ${url}`);
                resolve();
            };
            
            link.onerror = () => {
                console.error(`فشل تحميل ملف CSS: ${url}`);
                reject();
            };
            
            document.head.appendChild(link);
        });
    }
    
    // تحميل ملف JavaScript
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            
            script.onload = () => {
                console.log(`تم تحميل ملف JavaScript: ${url}`);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`فشل تحميل ملف JavaScript: ${url}`);
                reject();
            };
            
            document.body.appendChild(script);
        });
    }
    
    // تحميل نص CSS مباشرة (كبديل في حالة فشل تحميل الملف)
    function loadInlineCSS(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        console.log('تم تحميل CSS المضمّن');
    }
    
    // تحميل الصور المطلوبة
    function preloadImages() {
        const imageUrls = [
            // يمكن إضافة مسارات الصور المطلوبة هنا إذا لزم الأمر
        ];
        
        return Promise.all(imageUrls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => resolve(); // نتجاهل أخطاء تحميل الصور
                img.src = url;
            });
        }));
    }
    
    // تحميل نظام الأقساط
    async function loadInstallmentSystem() {
        try {
            // تحميل أنماط CSS
            await loadCSS('installment-system-styles.css').catch(() => {
                console.warn('فشل تحميل ملف CSS الخارجي، جاري استخدام CSS المضمّن...');
                // يمكن هنا إضافة CSS المضمّن كبديل إذا فشل التحميل
            });
            
            // تحميل ملف JavaScript الرئيسي
            await loadScript('installment-system.js').catch(error => {
                console.error('فشل تحميل نظام الأقساط:', error);
                showLoadError();
            });
            
            // تحميل الصور المطلوبة
            await preloadImages();
            
            console.log('تم تحميل نظام الأقساط بنجاح!');
        } catch (error) {
            console.error('حدث خطأ أثناء تحميل نظام الأقساط:', error);
            showLoadError();
        }
    }
    
    // عرض رسالة خطأ في حالة فشل التحميل
    function showLoadError() {
        if (window.showNotification) {
            window.showNotification('فشل تحميل نظام الأقساط، يرجى تحديث الصفحة', 'error');
        } else {
            alert('فشل تحميل نظام الأقساط، يرجى تحديث الصفحة');
        }
    }
    
    // التحقق من وجود دوال ضرورية للنظام
    function checkRequiredFunctions() {
        const requiredFunctions = [
            'showNotification',
            'openModal',
            'closeModal',
            'formatCurrency'
        ];
        
        const missingFunctions = requiredFunctions.filter(fnName => typeof window[fnName] !== 'function');
        
        if (missingFunctions.length > 0) {
            console.warn(`الدوال التالية مفقودة ومطلوبة لنظام الأقساط: ${missingFunctions.join(', ')}`);
            
            // تعريف دوال بديلة للدوال المفقودة
            if (!window.showNotification) {
                window.showNotification = function(message, type) {
                    console.log(`[${type}] ${message}`);
                    alert(message);
                };
            }
            
            if (!window.formatCurrency) {
                window.formatCurrency = function(amount, addCurrency = true) {
                    const formatted = amount.toLocaleString('ar-SA');
                    return addCurrency ? `${formatted} دينار` : formatted;
                };
            }
            
            if (!window.openModal) {
                window.openModal = function(modalId) {
                    const modal = document.getElementById(modalId);
                    if (modal) modal.classList.add('active');
                };
            }
            
            if (!window.closeModal) {
                window.closeModal = function(modalId) {
                    const modal = document.getElementById(modalId);
                    if (modal) modal.classList.remove('active');
                };
            }
        }
    }
    
    // بدء التحميل عند جاهزية المستند
    document.addEventListener('DOMContentLoaded', async function() {
        // التحقق من وجود الدوال المطلوبة
        checkRequiredFunctions();
        
        // انتظار ثواني قليلة لضمان تحميل النظام الرئيسي
        setTimeout(async () => {
            // التحقق من وجود مصفوفة المستثمرين
            if (!window.investors || !Array.isArray(window.investors)) {
                console.warn('مصفوفة المستثمرين غير موجودة، جاري تهيئة مصفوفة فارغة');
                window.investors = [];
            }
            
            // تحميل نظام الأقساط
            await loadInstallmentSystem();
        }, 1000);
    });
})();