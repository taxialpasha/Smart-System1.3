/**
 * تحديث إضافي لضمان ظهور رمز QR عند إنشاء البطاقة
 * هذا التحديث يجب تطبيقه بعد تحميل ملف investor-card-system.js وملف investor-card-qr-update.js
 */

(function() {
    // 1. التأكد من وجود مكتبة QRCode.js
    if (typeof QRCode === 'undefined') {
        console.error('مكتبة QRCode غير محملة! جاري تحميلها تلقائياً...');
        
        // تحميل مكتبة QRCode تلقائياً
        const qrcodeScript = document.createElement('script');
        qrcodeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        qrcodeScript.onload = function() {
            console.log('تم تحميل مكتبة QRCode بنجاح');
            applyDirectQRFix();
        };
        qrcodeScript.onerror = function() {
            console.error('فشل في تحميل مكتبة QRCode! الرجاء تحميلها يدوياً');
        };
        document.head.appendChild(qrcodeScript);
    } else {
        // المكتبة موجودة بالفعل، قم بتطبيق الإصلاح مباشرة
        applyDirectQRFix();
    }
    
    // 2. التأكد من ظهور QR مباشرة عند إنشاء البطاقة
    function applyDirectQRFix() {
        // التأكد من وجود نظام البطاقات
        if (!window.InvestorCardSystem) {
            console.error('لم يتم العثور على نظام بطاقات المستثمرين! تأكد من تحميل الملف الأساسي أولاً.');
            return;
        }
        
        // تحديث أساسي للأنماط - جعل رمز QR أكبر وأوضح
        const styleElement = document.getElementById('investor-card-styles');
        if (styleElement) {
            styleElement.textContent += `
                /* تحسين مظهر رمز QR */
                .card-qr-container {
                    position: absolute !important;
                    top: 45px !important;
                    right: 16px !important;
                    width: 80px !important;
                    height: 80px !important;
                    background-color: #ffffff !important;
                    border-radius: 6px !important;
                    padding: 5px !important;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    z-index: 10 !important;
                }
                
                /* إخفاء شريحة البطاقة بشكل تام */
                .card-chip {
                    display: none !important;
                }
            `;
        }
        
        // 3. تعريف دالة إنشاء رمز QR بشكل مباشر
        function createCardQRCode(container, data, size = 80) {
            // التأكد من وجود العنصر
            if (!container || !container.id) {
                console.error('لم يتم توفير عنصر صالح لإنشاء رمز QR');
                return;
            }
            
            // تنظيف العنصر من أي محتوى سابق
            container.innerHTML = '';
            
            try {
                // إنشاء رمز QR
                new QRCode(container, {
                    text: data || 'INVESTCARD',
                    width: size,
                    height: size,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H // أعلى مستوى تصحيح الأخطاء
                });
                
                console.log(`تم إنشاء رمز QR بنجاح في العنصر: ${container.id}`);
            } catch (error) {
                console.error('خطأ في إنشاء رمز QR:', error);
                container.innerHTML = `<div style="color:red;font-size:10px;text-align:center;">خطأ QR</div>`;
            }
        }
        
        // 4. تعديل دالة renderCardHTML لضمان عرض رمز QR
        if (typeof window.renderCardHTML === 'function') {
            // حفظ الدالة الأصلية
            const originalRenderCardHTML = window.renderCardHTML;
            
            // تعريف الدالة الجديدة
            window.renderCardHTML = function(container, card) {
                if (!container || !card) {
                    console.error('لم يتم توفير حاوية أو بطاقة صالحة');
                    return;
                }
                
                // تحويل تاريخ الانتهاء إلى الصيغة المناسبة
                const expiryDate = new Date(card.expiryDate);
                const expMonth = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
                const expYear = expiryDate.getFullYear().toString().substr(2);
                
                // الحصول على نمط البطاقة
                const cardStylePattern = (window.CARD_STYLES && window.CARD_STYLES[card.cardType] && window.CARD_STYLES[card.cardType].pattern) || 'circles';
                
                // إنشاء عنصر البطاقة مع رمز QR مباشرة
                container.innerHTML = `
                    <div class="investor-card ${card.cardType} ${card.status !== 'active' ? 'inactive' : ''}" data-id="${card.id}">
                        <div class="investor-card-inner">
                            <div class="investor-card-front">
                                <div class="card-logo">
                                    <i class="fas fa-university"></i>
                                    <span class="card-logo-text">InvestCard</span>
                                </div>
                                
                                <!-- رمز QR بدلاً من الشريحة -->
                                <div class="card-qr-container" id="qr-code-${card.id}-front"></div>
                                
                                <div class="card-number">
                                    ${typeof formatCardNumber === 'function' ? formatCardNumber(card.cardNumber) : card.cardNumber}
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
                                    ${typeof getCardTypeArabic === 'function' ? getCardTypeArabic(card.cardType) : card.cardType}
                                </div>
                                <div class="card-pattern ${cardStylePattern}"></div>
                                ${card.status !== 'active' ? '<div class="card-inactive-overlay">غير نشطة</div>' : ''}
                            </div>
                            <div class="investor-card-back">
                                <div class="card-magnetic-stripe"></div>
                                <div class="card-signature">
                                    <div class="card-signature-text">${card.investorName}</div>
                                </div>
                                <div class="card-cvv">CVV: ${card.cvv}</div>
                                <div class="card-barcode-container">
                                    <div class="card-qr-code" id="qr-code-${card.id}-back"></div>
                                    <div class="card-barcode-number">${card.barcode}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // إنشاء رموز QR مباشرة بعد إنشاء البطاقة
                setTimeout(() => {
                    // إنشاء رمز QR في الوجه الأمامي
                    const frontQR = document.getElementById(`qr-code-${card.id}-front`);
                    if (frontQR) {
                        createCardQRCode(frontQR, card.barcode, 70);
                    }
                    
                    // إنشاء رمز QR في الوجه الخلفي
                    const backQR = document.getElementById(`qr-code-${card.id}-back`);
                    if (backQR) {
                        createCardQRCode(backQR, card.barcode, 120);
                    }
                }, 50);
            };
            
            // تحديث نسخة InvestorCardSystem إذا كانت موجودة
            if (window.InvestorCardSystem && typeof window.InvestorCardSystem === 'object') {
                window.InvestorCardSystem.renderCardHTML = window.renderCardHTML;
            }
            
            console.log('تم تحديث دالة renderCardHTML بنجاح لإضافة رمز QR مباشرة');
        } else {
            console.error('لم يتم العثور على دالة renderCardHTML. تأكد من تحميل النظام بشكل صحيح.');
        }
        
        // 5. تعديل دالة إنشاء البطاقة لضمان معالجة رمز QR
        if (typeof window.createCard === 'function') {
            // حفظ الدالة الأصلية
            const originalCreateCard = window.createCard;
            
            // تعريف الدالة الجديدة
            window.createCard = function() {
                // استدعاء الدالة الأصلية
                const result = originalCreateCard.apply(this, arguments);
                
                // تحديث عرض البطاقات بعد الإنشاء للتأكد من ظهور رمز QR
                setTimeout(() => {
                    if (typeof window.renderInvestorCards === 'function') {
                        window.renderInvestorCards();
                    } else if (window.InvestorCardSystem && typeof window.InvestorCardSystem.renderInvestorCards === 'function') {
                        window.InvestorCardSystem.renderInvestorCards();
                    }
                }, 100);
                
                return result;
            };
            
            // تحديث نسخة InvestorCardSystem إذا كانت موجودة
            if (window.InvestorCardSystem && typeof window.InvestorCardSystem === 'object') {
                window.InvestorCardSystem.createCard = window.createCard;
            }
            
            console.log('تم تحديث دالة createCard بنجاح');
        }
        
        // 6. تعديل دالة updateCardPreview لإضافة رمز QR في المعاينة
        if (typeof window.updateCardPreview === 'function') {
            // حفظ الدالة الأصلية
            const originalUpdateCardPreview = window.updateCardPreview;
            
            // تعريف الدالة الجديدة
            window.updateCardPreview = function() {
                // استدعاء الدالة الأصلية
                originalUpdateCardPreview.apply(this, arguments);
                
                // التأكد من وجود حاوية المعاينة
                const previewContainer = document.getElementById('card-preview');
                if (!previewContainer) return;
                
                // البحث عن البطاقة في المعاينة
                const cardElement = previewContainer.querySelector('.investor-card');
                if (!cardElement) return;
                
                // الحصول على معرف البطاقة المؤقت
                const tempId = 'preview-card';
                
                // إضافة حاوية QR إذا لم تكن موجودة
                let qrContainer = cardElement.querySelector('.card-qr-container');
                if (!qrContainer) {
                    // إنشاء عنصر QR
                    qrContainer = document.createElement('div');
                    qrContainer.className = 'card-qr-container';
                    qrContainer.id = `qr-code-${tempId}-front`;
                    
                    // إضافته إلى البطاقة بعد الشعار مباشرة
                    const logo = cardElement.querySelector('.card-logo');
                    if (logo && logo.parentNode) {
                        logo.parentNode.insertBefore(qrContainer, logo.nextSibling);
                    } else {
                        // إذا لم يتم العثور على الشعار، أضف الحاوية إلى بداية البطاقة
                        const frontSide = cardElement.querySelector('.investor-card-front');
                        if (frontSide) {
                            frontSide.appendChild(qrContainer);
                        }
                    }
                    
                    // إخفاء شريحة البطاقة إذا كانت موجودة
                    const chip = cardElement.querySelector('.card-chip');
                    if (chip) {
                        chip.style.display = 'none';
                    }
                    
                    // الحصول على رقم البطاقة من المعاينة أو إنشاء واحد مؤقت
                    const cardNumberElement = cardElement.querySelector('.card-number');
                    const cardNumber = cardNumberElement ? cardNumberElement.textContent.trim() : 'PREVIEW';
                    
                    // إنشاء رمز QR للمعاينة
                    setTimeout(() => {
                        createCardQRCode(qrContainer, cardNumber, 70);
                    }, 50);
                }
            };
            
            // تحديث نسخة InvestorCardSystem إذا كانت موجودة
            if (window.InvestorCardSystem && typeof window.InvestorCardSystem === 'object') {
                window.InvestorCardSystem.updateCardPreview = window.updateCardPreview;
            }
            
            console.log('تم تحديث دالة updateCardPreview بنجاح');
        }
        
        // 7. إعادة عرض البطاقات الحالية
        setTimeout(() => {
            if (typeof window.renderInvestorCards === 'function') {
                window.renderInvestorCards();
            } else if (window.InvestorCardSystem && typeof window.InvestorCardSystem.renderInvestorCards === 'function') {
                window.InvestorCardSystem.renderInvestorCards();
            }
        }, 500);
    }
})();