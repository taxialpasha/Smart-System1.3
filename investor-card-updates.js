/**
 * تحسين وظيفة تبديل الكاميرا في قارئ الباركود
 */
function enhanceCameraToggle() {
    // تعديل وظيفة toggleCamera في كائن cardScanner
    if (cardScanner) {
        cardScanner.toggleCamera = function() {
            // إيقاف الماسح أولاً
            Quagga.stop();
            
            // الحصول على المسار النشط
            let currentFacingMode = "environment"; // الافتراضي هو الكاميرا الخلفية
            
            try {
                const activeTrack = Quagga.CameraAccess.getActiveTrack();
                if (activeTrack && activeTrack.getSettings) {
                    const settings = activeTrack.getSettings();
                    if (settings.facingMode) {
                        currentFacingMode = settings.facingMode;
                    }
                }
            } catch (error) {
                console.log("خطأ في الحصول على معلومات الكاميرا:", error);
            }
            
            // تبديل وضع الكاميرا
            const newFacingMode = currentFacingMode === "environment" ? "user" : "environment";
            console.log(`تبديل الكاميرا من ${currentFacingMode} إلى ${newFacingMode}`);
            
            // عرض مؤشر التحميل
            const scannerRegion = document.getElementById('barcode-scanner-region');
            if (scannerRegion) {
                scannerRegion.innerHTML += '<div class="scanner-loading">جارِ تبديل الكاميرا...</div>';
            }
            
            // تهيئة الكاميرا الجديدة
            const config = {
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: document.querySelector('#barcode-scanner-region video'),
                    constraints: {
                        facingMode: newFacingMode,
                        aspectRatio: { min: 1, max: 2 }
                    }
                },
                locator: {
                    patchSize: "medium",
                    halfSample: true
                },
                numOfWorkers: 2,
                decoder: {
                    readers: ["code_128_reader", "ean_reader", "ean_8_reader", "qr_code_reader"]
                },
                locate: true
            };
            
            // تهيئة الماسح بالإعدادات الجديدة
            Quagga.init(config, (err) => {
                // إزالة مؤشر التحميل
                const loadingElement = document.querySelector('.scanner-loading');
                if (loadingElement) {
                    loadingElement.remove();
                }
                
                if (err) {
                    console.error('خطأ في تهيئة الماسح بالكاميرا الجديدة:', err);
                    
                    // عرض رسالة الخطأ للمستخدم
                    const resultElement = document.querySelector('#scan-result');
                    if (resultElement) {
                        resultElement.textContent = 'تعذر تبديل الكاميرا. يرجى المحاولة مرة أخرى.';
                        resultElement.classList.add('error');
                    }
                    
                    // محاولة العودة إلى الكاميرا السابقة
                    this.initWithFacingMode(currentFacingMode);
                    return;
                }
                
                // تشغيل الماسح بنجاح
                Quagga.start();
                
                // تحديث نص زر التبديل
                const toggleCameraBtn = document.getElementById('toggle-camera-btn');
                if (toggleCameraBtn) {
                    toggleCameraBtn.innerHTML = `
                        <i class="fas fa-camera"></i>
                        <span>${newFacingMode === 'user' ? 'الكاميرا الأمامية' : 'الكاميرا الخلفية'}</span>
                    `;
                }
                
                // إعادة تعيين مستمع اكتشاف الباركود
                Quagga.onDetected((result) => {
                    const code = result.codeResult.code;
                    if (code) {
                        this.onDetect(code);
                    }
                });
            });
        };
        
        // إضافة وظيفة جديدة لتهيئة الماسح بوضع كاميرا محدد
        cardScanner.initWithFacingMode = function(facingMode) {
            const config = {
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: document.querySelector('#barcode-scanner-region video'),
                    constraints: {
                        facingMode: facingMode,
                        aspectRatio: { min: 1, max: 2 }
                    }
                },
                locator: {
                    patchSize: "medium",
                    halfSample: true
                },
                numOfWorkers: 2,
                decoder: {
                    readers: ["code_128_reader", "ean_reader", "ean_8_reader", "qr_code_reader"]
                },
                locate: true
            };
            
            Quagga.init(config, (err) => {
                if (err) {
                    console.error('خطأ في تهيئة الماسح:', err);
                    return;
                }
                
                Quagga.start();
                
                // إعادة تعيين مستمع اكتشاف الباركود
                Quagga.onDetected((result) => {
                    const code = result.codeResult.code;
                    if (code) {
                        this.onDetect(code);
                    }
                });
            });
        };
        
        // تعديل دالة init الأصلية للاستفادة من التحسينات الجديدة
        const originalInit = cardScanner.init;
        cardScanner.init = function(containerId) {
            // تنظيف أي نتائج سابقة
            const resultElement = document.querySelector('#scan-result');
            if (resultElement) {
                resultElement.textContent = '';
                resultElement.className = 'scan-result';
            }
            
            // تحديث نص زر التبديل
            const toggleCameraBtn = document.getElementById('toggle-camera-btn');
            if (toggleCameraBtn) {
                toggleCameraBtn.innerHTML = `
                    <i class="fas fa-camera"></i>
                    <span>الكاميرا الخلفية</span>
                `;
            }
            
            // استدعاء الدالة الجديدة بوضع الكاميرا الخلفية كافتراضي
            this.initWithFacingMode('environment');
        };
    }
    
    // إضافة أنماط CSS لمؤشر التحميل
    const styleElement = document.getElementById('investor-card-styles');
    if (styleElement) {
        styleElement.textContent += `
            .scanner-loading {
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                transform: translateY(-50%);
                text-align: center;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 10px;
                z-index: 10;
            }
        `;
    }
}


/**
 * إصلاح وظيفة اختيار نوع البطاقة
 */
function fixCardTypeSelection() {
    // إضافة وظيفة renderCardHTML إذا لم تكن موجودة
    if (typeof renderCardHTML !== 'function') {
        window.renderCardHTML = function(container, card) {
            if (!container || !card) return;
            
            // التحقق من حالة البطاقة
            const isActive = card.status === 'active';
            
            // تحويل تاريخ الانتهاء إلى الصيغة المناسبة
            let expMonth = '';
            let expYear = '';
            if (card.expiryDate) {
                const date = new Date(card.expiryDate);
                expMonth = (date.getMonth() + 1).toString().padStart(2, '0');
                expYear = date.getFullYear().toString().substr(2);
            }
            
            // الحصول على أنماط البطاقة من الكائن العام
            const cardStyle = window.InvestorCardSystem && 
                              window.InvestorCardSystem.CARD_STYLES && 
                              window.InvestorCardSystem.CARD_STYLES[card.cardType] || 
                              getDefaultCardStyle(card.cardType);
            
            // إنشاء HTML البطاقة
            container.innerHTML = `
                <div class="investor-card ${card.cardType} ${isActive ? '' : 'inactive'}" data-id="${card.id}">
                    <div class="investor-card-inner">
                        <div class="investor-card-front" style="background: ${cardStyle.background}; color: ${cardStyle.color};">
                            ${!isActive ? '<div class="card-inactive-overlay">متوقفة</div>' : ''}
                            <div class="card-logo">
                                <i class="fas fa-university"></i>
                                <span class="card-logo-text">InvestCard</span>
                            </div>
                            <div class="card-chip"></div>
                            <div class="card-number" style="color: ${cardStyle.color};">
                                ${formatCardNumber(card.cardNumber)}
                            </div>
                            <div class="card-details">
                                <div class="card-holder">
                                    <div class="card-holder-label" style="color: ${cardStyle.accent};">حامل البطاقة</div>
                                    <div class="card-holder-name">${card.investorName}</div>
                                </div>
                                <div class="card-expires">
                                    <div class="expires-label" style="color: ${cardStyle.accent};">تنتهي في</div>
                                    <div class="expires-date">${expMonth}/${expYear}</div>
                                </div>
                            </div>
                            <div class="card-type" style="color: ${cardStyle.accent};">
                                ${getCardTypeArabic(card.cardType)}
                            </div>
                            <div class="card-pattern ${cardStyle.pattern}"></div>
                        </div>
                        <div class="investor-card-back">
                            <div class="card-magnetic-stripe"></div>
                            <div class="card-signature">
                                <div class="card-signature-text">${card.investorName}</div>
                            </div>
                            <div class="card-cvv">CVV: ${card.cvv || '***'}</div>
                            <div class="card-barcode-container">
                                <div class="card-barcode" id="barcode-${card.id}"></div>
                                <div class="card-barcode-number">${card.barcode}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // إضافة الباركود إذا كانت مكتبة JsBarcode متاحة
            setTimeout(() => {
                const barcodeElement = container.querySelector(`#barcode-${card.id}`);
                if (barcodeElement && typeof JsBarcode !== 'undefined') {
                    try {
                        JsBarcode(barcodeElement, card.barcode, {
                            format: "CODE128",
                            width: 1.5,
                            height: 40,
                            displayValue: false
                        });
                    } catch (error) {
                        console.error('خطأ في إنشاء الباركود:', error);
                    }
                }
            }, 100);
        };
    }
    
    // إضافة وظيفة للحصول على أنماط البطاقة الافتراضية
    window.getDefaultCardStyle = function(cardType) {
        const defaultStyles = {
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
        
        return defaultStyles[cardType] || defaultStyles.default;
    };
    
    // تعديل updateCardPreview لاستخدام التحسينات الجديدة
    const originalUpdateCardPreview = window.updateCardPreview;
    if (typeof originalUpdateCardPreview === 'function') {
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
            const investor = window.investors.find(inv => inv.id === investorId);
            if (!investor) {
                console.error('لم يتم العثور على المستثمر');
                return;
            }
            
            // إنشاء كائن البطاقة للمعاينة
            const previewCard = {
                id: 'preview_card',
                investorId: investor.id,
                cardNumber: generateCardNumber(investor.id),
                cardType: cardType,
                pin: cardPin || '****',
                cvv: '***',
                barcode: generateBarcode(investor.id),
                investorName: investor.name,
                investorPhone: investor.phone,
                expiryDate: cardExpiry || new Date().toISOString().split('T')[0],
                status: 'active'
            };
            
            // استخدام renderCardHTML لعرض المعاينة
            renderCardHTML(previewContainer, previewCard);
        };
    }
    
    // إضافة أنماط CSS لتحسين ظهور أنواع البطاقات
    const styleElement = document.getElementById('investor-card-styles');
    if (styleElement) {
        styleElement.textContent += `
            /* تحسين أنماط أنواع البطاقات */
            .investor-card.gold .investor-card-front {
                background: linear-gradient(135deg, #b8860b 0%, #daa520 100%) !important;
                color: #000000 !important;
            }
            
            .investor-card.platinum .investor-card-front {
                background: linear-gradient(135deg, #7a7a7a 0%, #c0c0c0 100%) !important;
                color: #000000 !important;
            }
            
            .investor-card.premium .investor-card-front {
                background: linear-gradient(135deg, #000428 0%, #004e92 100%) !important;
                color: #ffffff !important;
            }
            
            /* تحسين أنماط الخلفية */
            .card-pattern.circles {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                background-size: 20px 20px;
                opacity: 0.2;
                pointer-events: none;
            }
            
            .card-pattern.lines {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 75%, transparent 75%, transparent);
                background-size: 8px 8px;
                opacity: 0.2;
                pointer-events: none;
            }
            
            .card-pattern.dots {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px);
                background-size: 10px 10px;
                opacity: 0.2;
                pointer-events: none;
            }
            
            .card-pattern.waves {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0, rgba(255, 255, 255, 0.05) 1px, transparent 0, transparent 50%);
                background-size: 10px 10px;
                opacity: 0.2;
                pointer-events: none;
            }
        `;
    }
}

/**
 * إضافة التحديثات إلى نظام بطاقات المستثمرين
 */
function updateInvestorCardSystem() {
    // إضافة التحديثات إلى نظام بطاقات المستثمرين
    document.addEventListener('DOMContentLoaded', () => {
        // تهيئة النظام الأساسي
        if (typeof InvestorCardSystem !== 'undefined' && typeof InvestorCardSystem.initialize === 'function') {
            InvestorCardSystem.initialize()
                .then(() => {
                    // جعل CARD_STYLES متاحاً للوظائف الجديدة
                    if (!InvestorCardSystem.CARD_STYLES) {
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
                    
                    // تطبيق التحديثات
                    enhanceCameraToggle();
                    fixCardTypeSelection();
                    
                    // تحديث عرض البطاقات لتطبيق التغييرات
                    if (typeof InvestorCardSystem.renderInvestorCards === 'function') {
                        InvestorCardSystem.renderInvestorCards();
                    }
                    
                    console.log('تم تطبيق التحديثات بنجاح على نظام بطاقات المستثمرين');
                })
                .catch(error => {
                    console.error('حدث خطأ أثناء تهيئة نظام بطاقات المستثمرين:', error);
                });
        }
    });
}

// تنفيذ التحديثات
updateInvestorCardSystem();

/**
 * تحسينات إضافية لواجهة المستخدم
 */
function enhanceUserInterface() {
    // إضافة مؤشر اختيار الكاميرا
    const styleElement = document.getElementById('investor-card-styles');
    if (styleElement) {
        styleElement.textContent += `
            /* مؤشر الكاميرا */
            .camera-indicator {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: rgba(0, 0, 0, 0.5);
                color: white;
                border-radius: 20px;
                padding: 3px 10px;
                font-size: 12px;
                z-index: 5;
            }
            
            /* تحسين أزرار الماسح */
            .scanner-controls .btn {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px 15px;
                border-radius: 20px;
                transition: all 0.2s ease;
            }
            
            .scanner-controls .btn i {
                margin-right: 5px;
            }
            
            /* تحسين القائمة المنسدلة */
            select#card-type {
                background-position: left 0.75rem center;
            }
            
            /* مؤشرات نوع البطاقة */
            .card-type-indicator {
                display: inline-block;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                margin-right: 5px;
                vertical-align: middle;
            }
            
            .card-type-indicator.default {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            }
            
            .card-type-indicator.gold {
                background: linear-gradient(135deg, #b8860b 0%, #daa520 100%);
            }
            
            .card-type-indicator.platinum {
                background: linear-gradient(135deg, #7a7a7a 0%, #c0c0c0 100%);
            }
            
            .card-type-indicator.premium {
                background: linear-gradient(135deg, #000428 0%, #004e92 100%);
            }
        `;
    }
    
    // تعديل قائمة أنواع البطاقات
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const cardTypeSelect = document.getElementById('card-type');
            if (cardTypeSelect) {
                // إضافة مؤشرات لونية لأنواع البطاقات
                Array.from(cardTypeSelect.options).forEach(option => {
                    const cardType = option.value;
                    option.innerHTML = `<span class="card-type-indicator ${cardType}"></span> ${option.textContent}`;
                });
            }
            
            // إضافة مؤشر الكاميرا
            const scannerRegion = document.getElementById('barcode-scanner-region');
            if (scannerRegion) {
                const cameraIndicator = document.createElement('div');
                cameraIndicator.className = 'camera-indicator';
                cameraIndicator.id = 'camera-indicator';
                cameraIndicator.textContent = 'الكاميرا الخلفية';
                scannerRegion.appendChild(cameraIndicator);
                
                // تحديث المؤشر عند تغيير الكاميرا
                const toggleCameraBtn = document.getElementById('toggle-camera-btn');
                if (toggleCameraBtn) {
                    toggleCameraBtn.addEventListener('click', () => {
                        setTimeout(() => {
                            const indicator = document.getElementById('camera-indicator');
                            if (indicator) {
                                const currentText = indicator.textContent;
                                indicator.textContent = currentText.includes('الخلفية') ? 'الكاميرا الأمامية' : 'الكاميرا الخلفية';
                            }
                        }, 1000);
                    });
                }
            }
        }, 1000); // تأخير للتأكد من تحميل العناصر
    });
}

// تنفيذ تحسينات واجهة المستخدم
enhanceUserInterface();