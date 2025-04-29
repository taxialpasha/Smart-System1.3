/**
 * تحسينات نظام بطاقات المستثمرين
 * 1. تحسين قراءة الباركود بدعم الكاميرا الأمامية والخلفية
 * 2. إصلاح اختيار نوع البطاقة (ذهبية، بلاتينيوم، إلخ)
 */

// تحسين ماسح الباركود لدعم الكاميرات المتعددة
function enhanceBarcodeScanner() {
    // إضافة مؤشر الكاميرا المستخدمة في نافذة المسح
    const scanModalBody = document.querySelector('#scan-card-modal .modal-body');
    if (scanModalBody) {
        // إضافة مؤشر الكاميرا النشطة
        const cameraIndicator = document.createElement('div');
        cameraIndicator.className = 'camera-indicator';
        cameraIndicator.innerHTML = `
            <span class="camera-label">الكاميرا النشطة:</span>
            <span id="active-camera-indicator" class="active-camera">الكاميرا الخلفية</span>
        `;
        
        // إضافة المؤشر فوق منطقة التحكم
        const scannerControls = scanModalBody.querySelector('.scanner-controls');
        if (scannerControls) {
            scanModalBody.insertBefore(cameraIndicator, scannerControls);
        }
        
        // إضافة أنماط CSS للمؤشر
        const style = document.createElement('style');
        style.textContent = `
            .camera-indicator {
                text-align: center;
                margin: 10px 0;
                font-size: 14px;
                color: #666;
            }
            
            .active-camera {
                font-weight: bold;
                color: var(--color-primary);
            }
            
            .toggle-camera-btn.active {
                background-color: var(--color-primary);
                color: white;
            }
        `;
        document.head.appendChild(style);
    }
    
    // تحسين وظيفة تهيئة الماسح
    if (typeof InvestorCardSystem !== 'undefined') {
        // تعديل دالة تهيئة ماسح الباركود
        const originalInitBarcodeScanner = InvestorCardSystem.initBarcodeScanner || function() {};
        
        InvestorCardSystem.initBarcodeScanner = function() {
            if (typeof Quagga === 'undefined') {
                console.error('مكتبة Quagga غير متاحة');
                return;
            }
            
            cardScanner = {
                currentCamera: 'environment', // 'environment' للكاميرا الخلفية، 'user' للكاميرا الأمامية
                
                init: function(containerId) {
                    const config = {
                        inputStream: {
                            name: "Live",
                            type: "LiveStream",
                            target: document.querySelector(`#${containerId} video`),
                            constraints: {
                                facingMode: this.currentCamera,
                                aspectRatio: { min: 1, max: 2 }
                            },
                        },
                        locator: {
                            patchSize: "medium",
                            halfSample: true
                        },
                        numOfWorkers: 2,
                        decoder: {
                            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_93_reader", "qr_code_reader"]
                        },
                        locate: true
                    };
                    
                    Quagga.init(config, (err) => {
                        if (err) {
                            console.error('خطأ في تهيئة الماسح الضوئي:', err);
                            document.querySelector('#scan-result').textContent = 'حدث خطأ في تهيئة الماسح الضوئي';
                            document.querySelector('#scan-result').classList.add('error');
                            return;
                        }
                        
                        console.log('تم تهيئة الماسح الضوئي بنجاح');
                        Quagga.start();
                        
                        // تحديث مؤشر الكاميرا النشطة
                        this.updateCameraIndicator();
                        
                        Quagga.onDetected((result) => {
                            const code = result.codeResult.code;
                            if (code) {
                                this.onDetect(code);
                            }
                        });
                    });
                },
                
                onDetect: function(code) {
                    const resultElement = document.querySelector('#scan-result');
                    resultElement.textContent = `تم العثور على الرمز: ${code}`;
                    resultElement.classList.add('success');
                    
                    // إيقاف المسح بعد اكتشاف الرمز
                    Quagga.stop();
                    
                    // البحث عن البطاقة بالرمز
                    const card = this.findCardByBarcode(code);
                    if (card) {
                        // تحديث وقت آخر مسح
                        updateLastScanDate();
                        
                        // إغلاق نافذة المسح
                        closeModal('scan-card-modal');
                        
                        // عرض بيانات البطاقة
                        showCardDetails(card.id);
                    } else {
                        resultElement.textContent = `لم يتم العثور على بطاقة بالرمز: ${code}`;
                        resultElement.classList.remove('success');
                        resultElement.classList.add('error');
                        
                        // إعادة تشغيل المسح بعد فترة
                        setTimeout(() => {
                            resultElement.textContent = '';
                            resultElement.classList.remove('error');
                            Quagga.start();
                        }, 3000);
                    }
                },
                
                findCardByBarcode: function(code) {
                    // البحث في التخزين المحلي عن البطاقة
                    const cards = getInvestorCards();
                    return cards.find(card => card.barcode === code);
                },
                
                toggleCamera: function() {
                    // إيقاف الماسح
                    Quagga.stop();
                    
                    // تبديل نوع الكاميرا
                    this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
                    
                    // إعادة تهيئة الماسح بالكاميرا الجديدة
                    const config = {
                        inputStream: {
                            name: "Live",
                            type: "LiveStream",
                            target: document.querySelector('#scanner-video'),
                            constraints: {
                                facingMode: this.currentCamera,
                                aspectRatio: { min: 1, max: 2 }
                            },
                        },
                        locator: {
                            patchSize: "medium",
                            halfSample: true
                        },
                        numOfWorkers: 2,
                        decoder: {
                            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_93_reader", "qr_code_reader"]
                        },
                        locate: true
                    };
                    
                    Quagga.init(config, (err) => {
                        if (err) {
                            console.error('خطأ في تهيئة الماسح مع الكاميرا الجديدة:', err);
                            
                            // في حالة الفشل، حاول الرجوع للكاميرا السابقة
                            this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
                            
                            const fallbackConfig = {
                                inputStream: {
                                    name: "Live",
                                    type: "LiveStream",
                                    target: document.querySelector('#scanner-video'),
                                    constraints: {
                                        facingMode: this.currentCamera
                                    }
                                }
                            };
                            
                            Quagga.init(fallbackConfig, (fallbackErr) => {
                                if (fallbackErr) {
                                    console.error('فشل الرجوع للكاميرا السابقة:', fallbackErr);
                                    document.querySelector('#scan-result').textContent = 'فشل تغيير الكاميرا. يرجى تحديث الصفحة والمحاولة مرة أخرى.';
                                    document.querySelector('#scan-result').classList.add('error');
                                    return;
                                }
                                
                                Quagga.start();
                                this.updateCameraIndicator();
                            });
                            
                            return;
                        }
                        
                        Quagga.start();
                        this.updateCameraIndicator();
                    });
                },
                
                updateCameraIndicator: function() {
                    // تحديث مؤشر الكاميرا النشطة
                    const indicator = document.getElementById('active-camera-indicator');
                    if (indicator) {
                        indicator.textContent = this.currentCamera === 'environment' 
                            ? 'الكاميرا الخلفية' 
                            : 'الكاميرا الأمامية';
                    }
                    
                    // تحديث زر تبديل الكاميرا (إضافة مؤشر بصري)
                    const toggleButton = document.getElementById('toggle-camera-btn');
                    if (toggleButton) {
                        toggleButton.innerHTML = this.currentCamera === 'environment'
                            ? '<i class="fas fa-camera"></i><span>استخدام الكاميرا الأمامية</span>'
                            : '<i class="fas fa-camera-retro"></i><span>استخدام الكاميرا الخلفية</span>';
                    }
                },
                
                toggleFlash: function() {
                    try {
                        const track = Quagga.CameraAccess.getActiveTrack();
                        if (track && track.getCapabilities && track.getCapabilities().torch) {
                            const torchState = !track.getConstraints().advanced?.[0]?.torch;
                            track.applyConstraints({
                                advanced: [{torch: torchState}]
                            }).then(() => {
                                // تحديث زر الفلاش
                                const flashButton = document.getElementById('toggle-flash-btn');
                                if (flashButton) {
                                    flashButton.innerHTML = torchState
                                        ? '<i class="fas fa-bolt"></i><span>إيقاف الفلاش</span>'
                                        : '<i class="fas fa-bolt-slash"></i><span>تشغيل الفلاش</span>';
                                    
                                    // إضافة/إزالة فئة نشطة
                                    if (torchState) {
                                        flashButton.classList.add('active');
                                    } else {
                                        flashButton.classList.remove('active');
                                    }
                                }
                            });
                        } else {
                            console.log('الفلاش غير متاح في هذا الجهاز');
                            document.querySelector('#scan-result').textContent = 'الفلاش غير متاح في هذا الجهاز';
                            document.querySelector('#scan-result').classList.add('warning');
                            
                            // إخفاء الرسالة بعد مدة
                            setTimeout(() => {
                                document.querySelector('#scan-result').textContent = '';
                                document.querySelector('#scan-result').classList.remove('warning');
                            }, 3000);
                        }
                    } catch (error) {
                        console.error('خطأ في تشغيل/إيقاف الفلاش:', error);
                    }
                }
            };
        };
    }
}

// إصلاح ميزة اختيار نوع البطاقة
function fixCardTypeSelection() {
    // تحسين تطبيق أنماط البطاقة في دالة تحديث المعاينة
    if (typeof updateCardPreview === 'function') {
        // حفظ النسخة الأصلية
        const originalUpdateCardPreview = updateCardPreview;
        
        // استبدال بنسخة محسنة
        window.updateCardPreview = function() {
            const previewContainer = document.getElementById('card-preview');
            if (!previewContainer) return;
            
            // الحصول على قيم النموذج
            const investorId = document.getElementById('card-investor').value;
            const cardType = document.getElementById('card-type').value;
            const cardPin = document.getElementById('card-pin').value;
            const cardExpiry = document.getElementById('card-expiry').value;
            
            // التحقق من وجود مستثمر مختار
            if (!investorId) {
                previewContainer.innerHTML = '<div class="empty-preview">يرجى اختيار مستثمر لعرض المعاينة</div>';
                return;
            }
            
            // البحث عن المستثمر
            const investor = investors.find(inv => inv.id === investorId);
            if (!investor) {
                console.error('لم يتم العثور على المستثمر');
                return;
            }
            
            // إنشاء رقم بطاقة فريد
            const cardNumber = generateCardNumber(investor.id);
            
            // تحويل تاريخ الانتهاء إلى الصيغة المناسبة
            let expMonth = '';
            let expYear = '';
            if (cardExpiry) {
                const date = new Date(cardExpiry);
                expMonth = (date.getMonth() + 1).toString().padStart(2, '0');
                expYear = date.getFullYear().toString().substr(2);
            }
            
            // الحصول على خصائص النمط من كائن CARD_STYLES
            const styleProps = InvestorCardSystem.CARD_STYLES && InvestorCardSystem.CARD_STYLES[cardType] 
                ? InvestorCardSystem.CARD_STYLES[cardType] 
                : {
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    color: '#ffffff',
                    accent: '#ffd700',
                    pattern: 'circles'
                  };
            
            // إنشاء عنصر البطاقة مع تطبيق الأنماط مباشرة
            previewContainer.innerHTML = `
                <div class="investor-card ${cardType}">
                    <div class="investor-card-inner">
                        <div class="investor-card-front" style="background: ${styleProps.background}; color: ${styleProps.color};">
                            <div class="card-pattern ${styleProps.pattern}"></div>
                            <div class="card-logo">
                                <i class="fas fa-university" style="color: ${styleProps.accent};"></i>
                                <span class="card-logo-text">InvestCard</span>
                            </div>
                            <div class="card-chip"></div>
                            <div class="card-number">
                                ${formatCardNumber(cardNumber)}
                            </div>
                            <div class="card-details">
                                <div class="card-holder">
                                    <div class="card-holder-label">حامل البطاقة</div>
                                    <div class="card-holder-name">${investor.name}</div>
                                </div>
                                <div class="card-expires">
                                    <div class="expires-label">تنتهي في</div>
                                    <div class="expires-date">${expMonth}/${expYear}</div>
                                </div>
                            </div>
                            <div class="card-type" style="color: ${styleProps.accent};">
                                ${getCardTypeArabic(cardType)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };
    }
    
    // تحسين دالة renderCardHTML لتطبيق أنماط البطاقة بشكل صحيح
    if (typeof renderCardHTML === 'function') {
        const originalRenderCardHTML = renderCardHTML;
        
        window.renderCardHTML = function(container, card) {
            if (!card) return;
            
            // الحصول على خصائص النمط من كائن CARD_STYLES
            const styleProps = InvestorCardSystem.CARD_STYLES && InvestorCardSystem.CARD_STYLES[card.cardType] 
                ? InvestorCardSystem.CARD_STYLES[card.cardType] 
                : {
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    color: '#ffffff',
                    accent: '#ffd700',
                    pattern: 'circles'
                  };
            
            // تحويل تاريخ الانتهاء إلى الصيغة المناسبة
            let expMonth = '';
            let expYear = '';
            const expiryDate = new Date(card.expiryDate);
            if (!isNaN(expiryDate.getTime())) {
                expMonth = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
                expYear = expiryDate.getFullYear().toString().substr(2);
            }
            
            // حالة البطاقة
            const isActive = card.status === 'active';
            const isExpired = isActive && new Date(card.expiryDate) < new Date();
            
            // إنشاء عنصر البطاقة
            container.innerHTML = `
                <div class="investor-card ${card.cardType} ${!isActive ? 'inactive' : ''} ${isExpired ? 'expired' : ''}" data-id="${card.id}">
                    <div class="investor-card-inner">
                        <div class="investor-card-front" style="background: ${styleProps.background}; color: ${styleProps.color};">
                            <div class="card-pattern ${styleProps.pattern}"></div>
                            ${!isActive ? '<div class="card-inactive-overlay">متوقفة</div>' : ''}
                            ${isExpired ? '<div class="card-expired-overlay">منتهية</div>' : ''}
                            
                            <div class="card-logo">
                                <i class="fas fa-university" style="color: ${styleProps.accent};"></i>
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
                            <div class="card-type" style="color: ${styleProps.accent};">
                                ${getCardTypeArabic(card.cardType)}
                            </div>
                        </div>
                        
                        <div class="investor-card-back" style="background-color: #f0f0f0; color: #333;">
                            <div class="card-magnetic-stripe"></div>
                            <div class="card-signature">
                                <span class="card-signature-text">${card.investorName}</span>
                            </div>
                            <div class="card-cvv">CVV: ${card.cvv}</div>
                            <div class="card-barcode-container">
                                <svg class="card-barcode"></svg>
                                <div class="card-barcode-number">${card.barcode}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // إنشاء الباركود إذا كانت مكتبة JsBarcode متاحة
            if (typeof JsBarcode !== 'undefined') {
                try {
                    JsBarcode(container.querySelector('.card-barcode'), card.barcode, {
                        format: "CODE128",
                        width: 1.5,
                        height: 40,
                        displayValue: false
                    });
                } catch (e) {
                    console.error('خطأ في إنشاء الباركود:', e);
                }
            }
        };
    }
    
    // إضافة CARD_STYLES إلى كائن InvestorCardSystem
    if (typeof InvestorCardSystem !== 'undefined') {
        InvestorCardSystem.CARD_STYLES = {
            default: {
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: '#ffffff',
                accent: '#ffd700',
                pattern: 'circles'
            },
            gold: {
                background: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)',
                color: '#000000',
                accent: '#ffffff',
                pattern: 'lines'
            },
            platinum: {
                background: 'linear-gradient(135deg, #7a7a7a 0%, #c0c0c0 100%)',
                color: '#000000',
                accent: '#0a0a0a',
                pattern: 'dots'
            },
            premium: {
                background: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
                color: '#ffffff',
                accent: '#ff9d00',
                pattern: 'waves'
            }
        };
    }
    
    // إضافة أنماط CSS لأنماط البطاقة
    const cardStylesElement = document.getElementById('investor-card-styles');
    if (cardStylesElement) {
        const patternStyles = `
            /* أنماط أنماط البطاقة */
            .card-pattern {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0.05;
                pointer-events: none;
            }
            
            .card-pattern.circles {
                background-image: radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
                background-size: 20px 20px;
            }
            
            .card-pattern.lines {
                background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 75%, transparent 75%, transparent);
                background-size: 8px 8px;
            }
            
            .card-pattern.dots {
                background-image: radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 2px);
                background-size: 10px 10px;
            }
            
            .card-pattern.waves {
                background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0, rgba(255, 255, 255, 0.05) 2px, transparent 2px, transparent 8px);
                background-size: 12px 12px;
            }
            
            /* أنماط بطاقة ذهبية محسنة */
            .investor-card.gold .investor-card-front {
                background: linear-gradient(135deg, #b8860b 0%, #daa520 100%);
                color: #000000;
            }
            
            /* أنماط بطاقة بلاتينية محسنة */
            .investor-card.platinum .investor-card-front {
                background: linear-gradient(135deg, #7a7a7a 0%, #c0c0c0 100%);
                color: #000000;
            }
            
            /* أنماط بطاقة بريميوم محسنة */
            .investor-card.premium .investor-card-front {
                background: linear-gradient(135deg, #000428 0%, #004e92 100%);
                color: #ffffff;
            }
            
            /* البطاقة المنتهية */
            .investor-card.expired .card-expired-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: rgba(255, 0, 0, 0.4);
                color: white;
                font-size: 2rem;
                font-weight: bold;
                text-transform: uppercase;
                transform: rotate(-25deg);
                z-index: 10;
            }
        `;
        
        // إضافة الأنماط الجديدة
        cardStylesElement.textContent += patternStyles;
    }
}

// تطبيق التحسينات عند تحميل المستند
document.addEventListener('DOMContentLoaded', () => {
    // تحسين ماسح الباركود
    enhanceBarcodeScanner();
    
    // إصلاح اختيار نوع البطاقة
    fixCardTypeSelection();
    
    console.log('تم تطبيق التحسينات على نظام بطاقات المستثمرين');
});