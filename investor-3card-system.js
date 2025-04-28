/**
 * تحديث نظام بطاقات المستثمرين لدعم رمز QR
 * هذا التحديث يستبدل شريحة البطاقة برمز QR للمستثمر
 */

// تحديث طريقة عرض البطاقة لتضمين رمز QR بدلاً من الشريحة
function updateCardRenderingWithQR() {
    // البحث عن دالة renderCardHTML وتحديثها
    const originalRenderCardHTML = InvestorCardSystem.renderCardHTML || window.renderCardHTML;
    
    if (!originalRenderCardHTML) {
        console.error('لم يتم العثور على دالة renderCardHTML. تأكد من تحميل النظام الأساسي أولاً.');
        return;
    }
    
    // تعريف دالة جديدة لعرض البطاقة مع رمز QR
    window.renderCardHTML = function(container, card) {
        // تحويل تاريخ الانتهاء إلى الصيغة المناسبة
        const expiryDate = new Date(card.expiryDate);
        const expMonth = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
        const expYear = expiryDate.getFullYear().toString().substr(2);
        
        // إنشاء عنصر البطاقة
        container.innerHTML = `
            <div class="investor-card ${card.cardType} ${card.status !== 'active' ? 'inactive' : ''}" data-id="${card.id}">
                <div class="investor-card-inner">
                    <div class="investor-card-front">
                        <div class="card-logo">
                            <i class="fas fa-university"></i>
                            <span class="card-logo-text">InvestCard</span>
                        </div>
                        
                        <!-- استبدال الشريحة برمز QR -->
                        <div class="card-qr-container" id="qr-code-${card.id}-front">
                            <!-- سيتم إنشاء رمز QR هنا عن طريق JavaScript -->
                        </div>
                        
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
                        <div class="card-pattern ${CARD_STYLES[card.cardType]?.pattern || 'circles'}"></div>
                        ${card.status !== 'active' ? '<div class="card-inactive-overlay">غير نشطة</div>' : ''}
                    </div>
                    <div class="investor-card-back">
                        <div class="card-magnetic-stripe"></div>
                        <div class="card-signature">
                            <div class="card-signature-text">${card.investorName}</div>
                        </div>
                        <div class="card-cvv">CVV: ${card.cvv}</div>
                        <div class="card-barcode-container">
                            <div class="card-qr-code" id="qr-code-${card.id}-back">
                                <!-- سيتم إنشاء رمز QR هنا عن طريق JavaScript -->
                            </div>
                            <div class="card-barcode-number">${card.barcode}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إنشاء رمز QR بعد إضافة العنصر للصفحة
        setTimeout(() => {
            // إنشاء رمز QR على الوجه الأمامي
            createQRCode(`qr-code-${card.id}-front`, card.barcode, 70);
            
            // إنشاء رمز QR على الوجه الخلفي
            createQRCode(`qr-code-${card.id}-back`, card.barcode, 120);
        }, 100);
    };
    
    // تحديث وظيفة InvestorCardSystem.renderCardHTML
    if (InvestorCardSystem && typeof InvestorCardSystem === 'object') {
        InvestorCardSystem.renderCardHTML = window.renderCardHTML;
    }
    
    console.log('تم تحديث طريقة عرض البطاقة بنجاح لتضمين رمز QR');
}

// إنشاء رمز QR باستخدام مكتبة qrcode.js
function createQRCode(elementId, data, size) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`لم يتم العثور على العنصر بالمعرف: ${elementId}`);
        return;
    }
    
    // تنظيف العنصر من أي محتوى سابق
    element.innerHTML = '';
    
    // التحقق من وجود مكتبة QRCode
    if (typeof QRCode === 'undefined') {
        console.error('مكتبة QRCode غير متاحة. تأكد من تحميل المكتبة.');
        
        // عرض رسالة للمستخدم
        element.innerHTML = '<div style="text-align: center; color: red; font-size: 10px;">QR Code غير متاح</div>';
        return;
    }
    
    try {
        // إنشاء رمز QR
        new QRCode(element, {
            text: data,
            width: size,
            height: size,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H // أعلى مستوى تصحيح الأخطاء
        });
    } catch (error) {
        console.error('خطأ في إنشاء رمز QR:', error);
        element.innerHTML = '<div style="text-align: center; color: red; font-size: 10px;">خطأ في إنشاء QR</div>';
    }
}

// تحديث قارئ الباركود ليدعم قراءة رموز QR بشكل أفضل
function updateBarcodeScanner() {
    // التحقق من وجود كائن cardScanner
    if (!window.cardScanner && (!InvestorCardSystem || !InvestorCardSystem.cardScanner)) {
        console.error('لم يتم العثور على كائن cardScanner. تأكد من تحميل النظام الأساسي أولاً.');
        return;
    }
    
    // الحصول على كائن cardScanner
    const cardScanner = window.cardScanner || InvestorCardSystem.cardScanner;
    
    // تحديث دالة init لتحسين دعم قراءة رموز QR
    const originalInit = cardScanner.init;
    cardScanner.init = function(containerId) {
        // إذا كان هناك بث نشط، قم بإيقافه أولاً
        if (this.activeStream) {
            this.stop();
        }
        
        const config = {
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector(`#${containerId} video`),
                constraints: {
                    width: { min: 640 },
                    height: { min: 480 },
                    facingMode: this.currentCamera,
                    aspectRatio: { min: 1, max: 2 }
                },
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            frequency: 10,
            decoder: {
                // تحسين دعم قراءة رموز QR بإضافتها كأول قارئ
                readers: ["qr_code_reader", "code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_93_reader"]
            },
            locate: true
        };
        
        // تهيئة Quagga
        Quagga.init(config, (err) => {
            if (err) {
                console.error('Error initializing Quagga:', err);
                const resultElement = document.querySelector('#scan-result');
                if (resultElement) {
                    resultElement.textContent = 'حدث خطأ في تهيئة الماسح الضوئي: ' + (err.message || 'خطأ غير معروف');
                    resultElement.classList.add('error');
                    resultElement.style.display = 'block';
                }
                return;
            }
            
            // حفظ البث النشط
            this.activeStream = Quagga.CameraAccess.getActiveTrack();
            
            // بدء المسح
            Quagga.start();
            
            // إضافة مستمع الحدث للكشف عن الباركود
            Quagga.onDetected(this.onDetect.bind(this));
            
            console.log('تم تهيئة ماسح رمز QR والباركود بنجاح');
        });
    };
    
    // تحديث دالة البحث عن البطاقة بناءً على الباركود/QR
    cardScanner.findCardByBarcode = function(code) {
        if (!code) return null;
        
        // البحث في التخزين المحلي عن البطاقة
        const cards = getInvestorCards();
        
        // أولاً البحث بالباركود
        let card = cards.find(card => card.barcode === code);
        
        // إذا لم يتم العثور على البطاقة، جرب البحث برقم البطاقة
        if (!card) {
            const cleanCardNumber = code.replace(/\s+/g, '');
            card = cards.find(card => card.cardNumber.replace(/\s+/g, '') === cleanCardNumber);
        }
        
        return card;
    };
    
    // تحديث كائن cardScanner في InvestorCardSystem
    if (InvestorCardSystem && typeof InvestorCardSystem === 'object') {
        InvestorCardSystem.cardScanner = cardScanner;
    }
    
    console.log('تم تحديث قارئ الباركود ورمز QR بنجاح');
}

// تحديث أنماط CSS لتحسين مظهر رمز QR في البطاقة
function updateCardStyles() {
    // البحث عن عنصر الأنماط
    const styleElement = document.getElementById('investor-card-styles');
    
    if (!styleElement) {
        console.error('لم يتم العثور على عنصر أنماط البطاقات. تأكد من تحميل النظام الأساسي أولاً.');
        return;
    }
    
    // إضافة أنماط جديدة لرمز QR
    const qrStyles = `
        /* أنماط رمز QR في البطاقة */
        .card-qr-container {
            position: absolute;
            top: 55px;
            right: 20px;
            width: 70px;
            height: 70px;
            background-color: #ffffff;
            border-radius: 5px;
            padding: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .card-qr-code {
            width: 120px;
            height: 120px;
            background-color: #ffffff;
            border-radius: 5px;
            padding: 5px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .card-qr-container img, .card-qr-code img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        /* إخفاء عنصر الشريحة القديم */
        .card-chip {
            display: none;
        }
    `;
    
    // إضافة الأنماط الجديدة
    styleElement.textContent += qrStyles;
    
    console.log('تم تحديث أنماط البطاقة لدعم رمز QR');
}

// تحديث دالة عرض تفاصيل البطاقة لتضمين معلومات الاستثمار والربح
function updateShowCardDetails() {
    // البحث عن دالة showCardDetails وتحديثها
    const originalShowCardDetails = InvestorCardSystem.showCardDetails || window.showCardDetails;
    
    if (!originalShowCardDetails) {
        console.error('لم يتم العثور على دالة showCardDetails. تأكد من تحميل النظام الأساسي أولاً.');
        return;
    }
    
    // تعريف دالة جديدة لعرض تفاصيل البطاقة
    window.showCardDetails = function(cardId) {
        // البحث عن البطاقة
        const cards = getInvestorCards();
        const card = cards.find(c => c.id === cardId);
        
        if (!card) {
            console.error('لم يتم العثور على البطاقة');
            return;
        }
        
        // البحث عن المستثمر
        const investor = window.investors ? window.investors.find(inv => inv.id === card.investorId) : null;
        
        // تحديث عنوان النافذة
        const modalTitle = document.querySelector('#show-card-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = `بطاقة المستثمر - ${card.investorName}`;
        }
        
        // عرض البطاقة
        const cardView = document.getElementById('card-full-view');
        if (cardView) {
            renderCardHTML(cardView, card);
            
            // إضافة مستمع الحدث للقلب
            const cardElement = cardView.querySelector('.investor-card');
            if (cardElement) {
                cardElement.addEventListener('dblclick', function() {
                    this.classList.toggle('flipped');
                });
            }
        }
        
        // عرض تفاصيل المستثمر
        const detailsView = document.getElementById('investor-card-details');
        if (detailsView) {
            let detailsHTML = `
                <div class="investor-detail-section">
                    <h4>معلومات المستثمر</h4>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">الاسم:</div>
                        <div class="investor-detail-value">${card.investorName}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">رقم الهاتف:</div>
                        <div class="investor-detail-value">${card.investorPhone || '-'}</div>
                    </div>
            `;
            
            // إضافة معلومات إضافية إذا كان المستثمر موجودًا
            if (investor) {
                detailsHTML += `
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">العنوان:</div>
                        <div class="investor-detail-value">${investor.address || '-'}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">رقم البطاقة الشخصية:</div>
                        <div class="investor-detail-value">${investor.cardNumber || '-'}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">تاريخ الانضمام:</div>
                        <div class="investor-detail-value">${formatDate(investor.joinDate || investor.createdAt)}</div>
                    </div>
                `;
            }
            
            detailsHTML += `
                </div>
                
                <div class="investor-detail-section">
                    <h4>معلومات البطاقة</h4>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">رقم البطاقة:</div>
                        <div class="investor-detail-value">${formatCardNumber(card.cardNumber)}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">الرقم السري:</div>
                        <div class="investor-detail-value">${card.pin}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">رمز الأمان (CVV):</div>
                        <div class="investor-detail-value">${card.cvv}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">نوع البطاقة:</div>
                        <div class="investor-detail-value">${getCardTypeArabic(card.cardType)}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">تاريخ الإصدار:</div>
                        <div class="investor-detail-value">${formatDate(card.createdAt)}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">تاريخ الانتهاء:</div>
                        <div class="investor-detail-value">${formatDate(card.expiryDate)}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">الحالة:</div>
                        <div class="investor-detail-value">${getCardStatusArabic(card.status)}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">آخر استخدام:</div>
                        <div class="investor-detail-value">${card.lastUsed ? formatDate(card.lastUsed) : 'لم تستخدم بعد'}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">رمز الباركود:</div>
                        <div class="investor-detail-value">${card.barcode}</div>
                    </div>
                </div>
            `;
            
            // إضافة قسم معلومات الاستثمار والربح
            // هذا القسم سيظهر دائمًا حتى لو لم يكن المستثمر موجودًا
            const totalInvestment = investor ? (investor.amount || 0) : 0;
            
            // حساب الربح المتوقع
            let expectedProfit = 0;
            if (investor && investor.investments && Array.isArray(investor.investments)) {
                expectedProfit = investor.investments.reduce((total, inv) => {
                    // استخدام دالة حساب الفائدة من النظام الأساسي إذا كانت متاحة
                    if (typeof window.calculateInterest === 'function') {
                        return total + window.calculateInterest(inv.amount, inv.date);
                    } else {
                        // حساب تقريبي إذا لم تكن الدالة متاحة
                        const rate = window.settings && window.settings.interestRate ? window.settings.interestRate / 100 : 0.175;
                        return total + (inv.amount * rate);
                    }
                }, 0);
            } else {
                // إذا لم تكن هناك معلومات استثمار متاحة، نحاول استخدام أي بيانات متاحة
                const rate = window.settings && window.settings.interestRate ? window.settings.interestRate / 100 : 0.175;
                expectedProfit = totalInvestment * rate;
            }
            
            detailsHTML += `
                <div class="investor-detail-section">
                    <h4>معلومات الاستثمار</h4>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">إجمالي الاستثمار:</div>
                        <div class="investor-detail-value">${formatCurrency(totalInvestment)}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">الربح المتوقع (شهرياً):</div>
                        <div class="investor-detail-value">${formatCurrency(expectedProfit)}</div>
                    </div>
                    <div class="investor-detail-row">
                        <div class="investor-detail-label">إجمالي الربح (سنوياً):</div>
                        <div class="investor-detail-value">${formatCurrency(expectedProfit * 12)}</div>
                    </div>
                </div>
            `;
            
            // عرض التفاصيل
            detailsView.innerHTML = detailsHTML;
        }
        
        // تحديث حالة أزرار الإجراءات
        updateActionButtons(card);
        
        // تسجيل استخدام البطاقة
        card.lastUsed = new Date().toISOString();
        saveInvestorCards(cards);
    };
    
    // تحديث وظيفة InvestorCardSystem.showCardDetails
    if (InvestorCardSystem && typeof InvestorCardSystem === 'object') {
        InvestorCardSystem.showCardDetails = window.showCardDetails;
    }
    
    console.log('تم تحديث طريقة عرض تفاصيل البطاقة بنجاح');
}

// تحديث واجهة المستخدم لتوفير معلومات أفضل عند مسح الرمز
function updateScannerUI() {
    // البحث عن نافذة المسح
    const scanModal = document.getElementById('scan-card-modal');
    if (!scanModal) {
        console.error('لم يتم العثور على نافذة المسح. تأكد من تحميل النظام الأساسي أولاً.');
        return;
    }
    
    // تحديث عنوان النافذة
    const modalTitle = scanModal.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'مسح رمز QR أو باركود البطاقة';
    }
    
    // تحديث التعليمات
    const scannerInstructions = scanModal.querySelector('.scanner-instructions');
    if (scannerInstructions) {
        scannerInstructions.textContent = 'ضع رمز QR أو الباركود في هذه المنطقة';
    }
    
    console.log('تم تحديث واجهة المسح بنجاح');
}

// دالة رئيسية لتطبيق جميع التحديثات
function applyQRCardSystemUpdates() {
    console.log('جاري تطبيق تحديثات نظام بطاقات المستثمرين مع دعم رمز QR...');
    
    // تحديث أنماط CSS أولاً
    updateCardStyles();
    
    // تحديث طريقة عرض البطاقة
    updateCardRenderingWithQR();
    
    // تحديث قارئ الباركود
    updateBarcodeScanner();
    
    // تحديث عرض تفاصيل البطاقة
    updateShowCardDetails();
    
    // تحديث واجهة المسح
    updateScannerUI();
    
    console.log('تم تطبيق تحديثات نظام بطاقات المستثمرين بنجاح');
    
    // تحديث عرض البطاقات الحالية
    if (InvestorCardSystem && typeof InvestorCardSystem.renderInvestorCards === 'function') {
        InvestorCardSystem.renderInvestorCards();
    }
    
    return true;
}

// تطبيق التحديثات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التأكد من تحميل النظام الأساسي أولاً
    if (InvestorCardSystem && typeof InvestorCardSystem.initialize === 'function') {
        // انتظار تهيئة النظام الأساسي ثم تطبيق التحديثات
        InvestorCardSystem.initialize()
            .then(() => {
                // تطبيق التحديثات بعد تهيئة النظام
                setTimeout(applyQRCardSystemUpdates, 1000);
            })
            .catch(error => {
                console.error('حدث خطأ أثناء تهيئة نظام بطاقات المستثمرين:', error);
            });
    } else {
        // إذا كان النظام الأساسي غير متاح، انتظر لفترة ثم حاول تطبيق التحديثات
        console.warn('نظام بطاقات المستثمرين غير متاح حاليًا. سيتم محاولة تطبيق التحديثات لاحقًا.');
        setTimeout(() => {
            if (InvestorCardSystem && typeof InvestorCardSystem.initialize === 'function') {
                InvestorCardSystem.initialize()
                    .then(() => {
                        setTimeout(applyQRCardSystemUpdates, 1000);
                    })
                    .catch(error => {
                        console.error('حدث خطأ أثناء تهيئة نظام بطاقات المستثمرين:', error);
                    });
            } else {
                console.error('فشل في العثور على نظام بطاقات المستثمرين. قد تحتاج إلى تحميل النظام الأساسي أولاً.');
            }
        }, 3000);
    }
});

// تصدير الدوال العامة
window.InvestorCardQRSystem = {
    applyUpdates: applyQRCardSystemUpdates,
    createQRCode: createQRCode
};