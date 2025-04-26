/**
 * نظام تخزين الأقساط - التخزين المحلي وFirebase
 * يوفر هذا الملف وظائف لتخزين الأقساط في التخزين المحلي وقاعدة بيانات Firebase
 */

// تهيئة Firebase (يجب تضمين مكتبة Firebase قبل هذا الملف)
function initFirebase() {
    // التحقق من أن Firebase غير مهيأة بالفعل
    if (typeof firebase === 'undefined') {
        console.error('Firebase غير متوفرة. تأكد من تضمين مكتبة Firebase.');
        showNotification('لم يتم العثور على Firebase، سيتم استخدام التخزين المحلي فقط', 'warning');
        return false;
    }

    try {
        // إعدادات Firebase - استبدل هذه بإعداداتك الخاصة
        const firebaseConfig = {
            apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAzwEMiAI",
            authDomain: "messageemeapp.firebaseapp.com",
            databaseURL: "https://messageemeapp-default-rtdb.firebaseio.com",
            projectId: "messageemeapp",
            storageBucket: "messageemeapp.appspot.com",
            messagingSenderId: "255034474844",
            appId: "1:255034474844:web:5e3b7a6bc4b2fb94cc4199"
        };

        // تهيئة Firebase إذا لم تكن مهيأة بالفعل
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        console.log('تم تهيئة Firebase بنجاح');
        return true;
    } catch (error) {
        console.error('فشل في تهيئة Firebase:', error);
        showNotification('فشل في الاتصال بقاعدة البيانات، سيتم استخدام التخزين المحلي فقط', 'warning');
        return false;
    }
}

// كائن مساعد للتخزين - يجمع بين التخزين المحلي وFirebase
const StorageManager = {
    // حالة الاتصال بـ Firebase
    firebaseInitialized: false,
    
    // تهيئة نظام التخزين
    init: function() {
        console.log('تهيئة نظام التخزين...');
        
        // محاولة تهيئة Firebase
        this.firebaseInitialized = initFirebase();
        
        // إضافة مستمع أحداث للاتصال بالإنترنت
        window.addEventListener('online', this.onConnectionChange.bind(this));
        window.addEventListener('offline', this.onConnectionChange.bind(this));
        
        return this;
    },
    
    // معالجة تغيير حالة الاتصال
    onConnectionChange: function(event) {
        if (event.type === 'online') {
            console.log('تم استعادة الاتصال بالإنترنت');
            // مزامنة البيانات مع Firebase عند استعادة الاتصال
            if (this.firebaseInitialized) {
                this.syncWithFirebase();
            }
        } else {
            console.log('تم فقد الاتصال بالإنترنت، سيتم استخدام التخزين المحلي فقط');
            showNotification('تم فقد الاتصال بالإنترنت، سيتم حفظ البيانات محلياً', 'warning');
        }
    },
    
    // حفظ البيانات
    saveData: function(key, data) {
        try {
            // حفظ في التخزين المحلي أولاً
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`تم حفظ البيانات بنجاح في التخزين المحلي: ${key}`);
            
            // حفظ في Firebase إذا كانت متاحة
            if (this.firebaseInitialized && navigator.onLine) {
                this.saveToFirebase(key, data);
            }
            
            return true;
        } catch (error) {
            console.error(`خطأ في حفظ البيانات (${key}):`, error);
            showNotification('حدث خطأ أثناء حفظ البيانات', 'error');
            return false;
        }
    },
    
    // حفظ البيانات في Firebase
    saveToFirebase: function(key, data) {
        try {
            const db = firebase.firestore();
            const userID = this.getCurrentUserID(); // الحصول على معرف المستخدم الحالي
            
            // تحسين الأداء: تخزين مجموعات البيانات الكبيرة بشكل منفصل
            if (key === 'installments' && Array.isArray(data)) {
                // حذف البيانات القديمة
                db.collection('users').doc(userID).collection(key).get()
                    .then(snapshot => {
                        const batch = db.batch();
                        snapshot.forEach(doc => {
                            batch.delete(doc.ref);
                        });
                        return batch.commit();
                    })
                    .then(() => {
                        // إضافة البيانات الجديدة
                        const batch = db.batch();
                        data.forEach(item => {
                            const docRef = db.collection('users').doc(userID).collection(key).doc(item.id);
                            batch.set(docRef, item);
                        });
                        return batch.commit();
                    })
                    .then(() => {
                        console.log(`تم حفظ ${data.length} قسط في Firebase`);
                    })
                    .catch(error => {
                        console.error('خطأ في حفظ الأقساط في Firebase:', error);
                    });
            } else {
                // حفظ البيانات الأخرى
                db.collection('users').doc(userID).set({
                    [key]: data,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true })
                .then(() => {
                    console.log(`تم حفظ البيانات بنجاح في Firebase: ${key}`);
                })
                .catch(error => {
                    console.error(`خطأ في حفظ البيانات في Firebase (${key}):`, error);
                });
            }
        } catch (error) {
            console.error(`خطأ في الاتصال بـ Firebase لحفظ البيانات (${key}):`, error);
        }
    },
    
    // تحميل البيانات
    loadData: function(key, defaultValue = null) {
        try {
            // محاولة تحميل البيانات من التخزين المحلي
            const localData = localStorage.getItem(key);
            
            if (localData) {
                const parsedData = JSON.parse(localData);
                console.log(`تم تحميل البيانات من التخزين المحلي: ${key}`);
                
                // تحميل البيانات من Firebase للمزامنة إذا كانت متصلة
                if (this.firebaseInitialized && navigator.onLine) {
                    this.loadFromFirebase(key, parsedData);
                }
                
                return parsedData;
            }
            
            // إذا لم يتم العثور على بيانات محلية، حاول التحميل من Firebase
            if (this.firebaseInitialized && navigator.onLine) {
                this.loadFromFirebase(key);
            }
            
            return defaultValue;
        } catch (error) {
            console.error(`خطأ في تحميل البيانات (${key}):`, error);
            return defaultValue;
        }
    },
    
    // تحميل البيانات من Firebase
    loadFromFirebase: function(key, localData = null) {
        try {
            const db = firebase.firestore();
            const userID = this.getCurrentUserID();
            
            // تحميل البيانات المختلفة حسب النوع
            if (key === 'installments') {
                db.collection('users').doc(userID).collection(key).get()
                    .then(snapshot => {
                        if (snapshot.empty) {
                            console.log(`لا توجد أقساط في Firebase`);
                            return;
                        }
                        
                        const firebaseData = [];
                        snapshot.forEach(doc => {
                            firebaseData.push(doc.data());
                        });
                        
                        console.log(`تم تحميل ${firebaseData.length} قسط من Firebase`);
                        
                        // مقارنة البيانات واستخدام الأحدث
                        this.mergeAndUpdateData(key, localData, firebaseData);
                    })
                    .catch(error => {
                        console.error(`خطأ في تحميل الأقساط من Firebase:`, error);
                    });
            } else {
                db.collection('users').doc(userID).get()
                    .then(doc => {
                        if (doc.exists && doc.data()[key]) {
                            const firebaseData = doc.data()[key];
                            console.log(`تم تحميل البيانات من Firebase: ${key}`);
                            
                            // مقارنة البيانات واستخدام الأحدث
                            this.mergeAndUpdateData(key, localData, firebaseData);
                        } else {
                            console.log(`لم يتم العثور على بيانات في Firebase: ${key}`);
                            
                            // إذا كانت هناك بيانات محلية، قم بمزامنتها مع Firebase
                            if (localData) {
                                this.saveToFirebase(key, localData);
                            }
                        }
                    })
                    .catch(error => {
                        console.error(`خطأ في تحميل البيانات من Firebase (${key}):`, error);
                    });
            }
        } catch (error) {
            console.error(`خطأ في الاتصال بـ Firebase لتحميل البيانات (${key}):`, error);
        }
    },
    
    // دمج وتحديث البيانات (المحلية والسحابية)
    mergeAndUpdateData: function(key, localData, firebaseData) {
        if (!localData) {
            // إذا لم تكن هناك بيانات محلية، استخدم بيانات Firebase
            localStorage.setItem(key, JSON.stringify(firebaseData));
            window.installments = firebaseData;
            
            // تحديث واجهة المستخدم
            if (key === 'installments') {
                if (window.renderInstallmentsTable) {
                    window.renderInstallmentsTable();
                }
                if (window.updateInstallmentStatistics) {
                    window.updateInstallmentStatistics();
                }
            }
            
            console.log(`تم تحديث التخزين المحلي ببيانات Firebase: ${key}`);
            return;
        }
        
        if (key === 'installments' && Array.isArray(localData) && Array.isArray(firebaseData)) {
            // دمج الأقساط من التخزين المحلي وFirebase
            const mergedInstallments = this.mergeInstallments(localData, firebaseData);
            localStorage.setItem(key, JSON.stringify(mergedInstallments));
            window.installments = mergedInstallments;
            
            // تحديث Firebase بالبيانات المدمجة
            this.saveToFirebase(key, mergedInstallments);
            
            // تحديث واجهة المستخدم
            if (window.renderInstallmentsTable) {
                window.renderInstallmentsTable();
            }
            if (window.updateInstallmentStatistics) {
                window.updateInstallmentStatistics();
            }
            
            console.log(`تم دمج الأقساط من التخزين المحلي وFirebase`);
        }
    },
    
    // دمج الأقساط من مصدرين مختلفين
    mergeInstallments: function(localInstallments, firebaseInstallments) {
        // إنشاء خريطة للأقساط من المصدرين
        const installmentsMap = new Map();
        
        // إضافة الأقساط المحلية إلى الخريطة
        localInstallments.forEach(installment => {
            installmentsMap.set(installment.id, installment);
        });
        
        // دمج أو تحديث مع أقساط Firebase (الأولوية للأحدث)
        firebaseInstallments.forEach(installment => {
            const existingInstallment = installmentsMap.get(installment.id);
            
            if (!existingInstallment) {
                // إضافة قسط جديد
                installmentsMap.set(installment.id, installment);
            } else {
                // استخدام أحدث نسخة بناءً على تاريخ الإنشاء أو التعديل
                const existingDate = new Date(existingInstallment.updatedAt || existingInstallment.createdAt);
                const firebaseDate = new Date(installment.updatedAt || installment.createdAt);
                
                if (firebaseDate > existingDate) {
                    installmentsMap.set(installment.id, installment);
                }
            }
        });
        
        // تحويل الخريطة إلى مصفوفة
        return Array.from(installmentsMap.values());
    },
    
    // مزامنة البيانات المحلية مع Firebase
    syncWithFirebase: function() {
        if (!this.firebaseInitialized || !navigator.onLine) {
            return;
        }
        
        console.log('مزامنة البيانات مع Firebase...');
        
        // مزامنة الأقساط
        const installments = this.loadData('installments', []);
        this.saveToFirebase('installments', installments);
        
        // يمكن إضافة مزامنة لبيانات أخرى هنا
    },
    
    // الحصول على معرف المستخدم الحالي
    getCurrentUserID: function() {
        // يمكن استبدال هذا بمنطق الحصول على المستخدم الحالي من نظام المصادقة
        try {
            if (firebase.auth().currentUser) {
                return firebase.auth().currentUser.uid;
            }
        } catch (error) {
            console.error('خطأ في الحصول على معرف المستخدم الحالي:', error);
        }
        
        // إرجاع معرف افتراضي إذا لم يكن هناك مستخدم مسجل الدخول
        return 'default-user';
    },
    
    // تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
    signIn: function(email, password) {
        if (!this.firebaseInitialized) {
            console.error('Firebase غير مهيأة');
            return Promise.reject(new Error('Firebase غير مهيأة'));
        }
        
        return firebase.auth().signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                console.log('تم تسجيل الدخول بنجاح');
                // مزامنة البيانات بعد تسجيل الدخول
                this.syncWithFirebase();
                return userCredential.user;
            });
    },
    
    // تسجيل الخروج
    signOut: function() {
        if (!this.firebaseInitialized) {
            console.error('Firebase غير مهيأة');
            return Promise.reject(new Error('Firebase غير مهيأة'));
        }
        
        return firebase.auth().signOut()
            .then(() => {
                console.log('تم تسجيل الخروج بنجاح');
            });
    },
    
    // التحقق من حالة تسجيل الدخول
    checkAuthState: function(callback) {
        if (!this.firebaseInitialized) {
            callback(null);
            return;
        }
        
        firebase.auth().onAuthStateChanged(user => {
            callback(user);
        });
    }
};

// إنشاء دوال لحفظ وتحميل الأقساط
function saveInstallmentData() {
    try {
        // تحديث تاريخ التعديل لكل قسط قبل الحفظ
        window.installments.forEach(installment => {
            installment.updatedAt = new Date().toISOString();
        });
        
        // حفظ البيانات باستخدام مدير التخزين
        const success = StorageManager.saveData('installments', window.installments);
        
        if (success) {
            console.log('تم حفظ بيانات الأقساط بنجاح');
            return true;
        } else {
            console.error('فشل في حفظ بيانات الأقساط');
            showNotification('حدث خطأ أثناء حفظ بيانات الأقساط', 'error');
            return false;
        }
    } catch (error) {
        console.error('خطأ في حفظ بيانات الأقساط:', error);
        showNotification('حدث خطأ أثناء حفظ بيانات الأقساط', 'error');
        return false;
    }
}

// تحميل بيانات الأقساط
function loadInstallmentData() {
    try {
        // تحميل البيانات باستخدام مدير التخزين
        const data = StorageManager.loadData('installments', []);
        
        // تحديث المتغير العالمي
        window.installments = data;
        
        console.log(`تم تحميل ${window.installments.length} من سجلات الأقساط`);
        return true;
    } catch (error) {
        console.error('خطأ في تحميل بيانات الأقساط:', error);
        window.installments = [];
        return false;
    }
}

// حذف قسط
function deleteInstallment(installmentId) {
    console.log(`حذف القسط: ${installmentId}`);
    
    // العثور على القسط
    const installment = window.installments.find(inst => inst.id === installmentId);
    if (!installment) {
        showNotification('لم يتم العثور على القسط', 'error');
        return false;
    }
    
    // طلب تأكيد الحذف
    if (!confirm(`هل أنت متأكد من رغبتك في حذف قسط ${installment.title}؟\nسيتم حذف جميع البيانات المتعلقة به.`)) {
        return false;
    }
    
    // حذف القسط
    window.installments = window.installments.filter(inst => inst.id !== installmentId);
    
    // حفظ البيانات
    if (saveInstallmentData()) {
        // تحديث عرض الأقساط
        if (window.renderInstallmentsTable) {
            window.renderInstallmentsTable();
        }
        
        // تحديث إحصائيات الأقساط
        if (window.updateInstallmentStatistics) {
            window.updateInstallmentStatistics();
        }
        
        // إغلاق نافذة التفاصيل إذا كانت مفتوحة
        if (window.closeModal) {
            window.closeModal('installment-details-modal');
        }
        
        // عرض إشعار النجاح
        showNotification(`تم حذف القسط ${installment.title} بنجاح!`, 'success');
        return true;
    }
    
    return false;
}

// إضافة قسط جديد
function addNewInstallment() {
    console.log('إضافة قسط جديد...');
    
    try {
        // الحصول على قيم النموذج
        const investorId = document.getElementById('installment-investor').value;
        const title = document.getElementById('installment-title').value;
        const originalAmount = parseFloat(document.getElementById('original-amount').value) || 0;
        const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
        const monthsCount = parseInt(document.getElementById('months-count').value) || 1;
        const startDate = document.getElementById('start-date').value;
        const notes = document.getElementById('installment-notes').value || '';
        
        // التحقق من صحة القيم
        if (!investorId || !title || originalAmount <= 0 || monthsCount <= 0 || !startDate) {
            showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
            return false;
        }
        
        // العثور على المستثمر
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor) {
            showNotification('لم يتم العثور على المستثمر', 'error');
            return false;
        }
        
        // حساب قيمة الفائدة
        const interestValue = (originalAmount * interestRate) / 100;
        
        // حساب إجمالي المبلغ
        const totalAmount = originalAmount + interestValue;
        
        // حساب القسط الشهري
        const monthlyInstallment = totalAmount / monthsCount;
        
        // إنشاء مصفوفة الأقساط الشهرية
        const monthlyInstallments = [];
        const startDateObj = new Date(startDate);
        
        for (let i = 0; i < monthsCount; i++) {
            const dueDate = new Date(startDateObj);
            dueDate.setMonth(dueDate.getMonth() + i);
            
            monthlyInstallments.push({
                installmentNumber: i + 1,
                amount: monthlyInstallment,
                dueDate: dueDate.toISOString().split('T')[0],
                isPaid: false,
                paidDate: null,
                paidAmount: 0,
                notes: ''
            });
        }
        
        // التأكد من وجود مصفوفة installments
        if (!window.installments) {
            window.installments = [];
        }
        
        // إنشاء كائن القسط الجديد
        const timestamp = Date.now();
        const newInstallment = {
            id: timestamp.toString(),
            investorId,
            investorName: investor.name,
            title,
            originalAmount,
            interestRate,
            interestValue,
            totalAmount,
            monthsCount,
            monthlyInstallment,
            startDate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes,
            status: 'active',
            monthlyInstallments,
            paidAmount: 0,
            remainingAmount: totalAmount
        };
        
        // إضافة القسط الجديد
        window.installments.push(newInstallment);
        
        // حفظ البيانات
        if (saveInstallmentData()) {
            // إضافة علامة للمستثمر أن عليه أقساط
            if (window.addInstallmentBadgeToInvestor) {
                window.addInstallmentBadgeToInvestor(investorId);
            }
            
            // تحديث عرض الأقساط
            if (window.renderInstallmentsTable) {
                window.renderInstallmentsTable();
            }
            
            // تحديث إحصائيات الأقساط
            if (window.updateInstallmentStatistics) {
                window.updateInstallmentStatistics();
            }
            
            // إغلاق النافذة المنبثقة
            if (window.closeModal) {
                window.closeModal('pay-installment-modal');
            }
            
            // عرض إشعار النجاح
            showNotification(`تم تسديد القسط رقم ${unpaidInstallment.installmentNumber} من ${installment.title} للمستثمر ${investor.name} بنجاح!`, 'success');
            return true;
        }
    } catch (error) {
        console.error('خطأ في تسديد قسط:', error);
        showNotification('حدث خطأ أثناء تسديد القسط', 'error');
    }
    
    return false;();
            }
            
            // إغلاق النافذة المنبثقة
            if (window.closeModal) {
                window.closeModal('add-installment-modal');
            }
            
            // عرض إشعار النجاح
            showNotification(`تم إضافة قسط ${title} للمستثمر ${investor.name} بنجاح!`, 'success');
            return true;
        }
    } catch (error) {
        console.error('خطأ في إضافة قسط جديد:', error);
        showNotification('حدث خطأ أثناء إضافة القسط الجديد', 'error');
    }
    
    return false;
}

// تسديد قسط
function payInstallment() {
    console.log('تسديد قسط...');
    
    try {
        // الحصول على قيم النموذج
        const investorId = document.getElementById('pay-investor').value;
        const installmentId = document.getElementById('available-installments').value;
        const paymentDate = document.getElementById('payment-date').value;
        const notes = document.getElementById('payment-notes').value || '';
        
        // التحقق من صحة القيم
        if (!investorId || !installmentId || !paymentDate) {
            showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
            return false;
        }
        
        // العثور على المستثمر
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor) {
            showNotification('لم يتم العثور على المستثمر', 'error');
            return false;
        }
        
        // العثور على القسط
        const installmentIndex = window.installments.findIndex(inst => inst.id === installmentId);
        if (installmentIndex === -1) {
            showNotification('لم يتم العثور على القسط', 'error');
            return false;
        }
        
        const installment = window.installments[installmentIndex];
        
        // العثور على أول قسط غير مدفوع
        const unpaidIndex = installment.monthlyInstallments.findIndex(inst => !inst.isPaid);
        if (unpaidIndex === -1) {
            showNotification('جميع الأقساط مدفوعة بالفعل', 'warning');
            return false;
        }
        
        // تحديث حالة القسط الشهري
        const unpaidInstallment = installment.monthlyInstallments[unpaidIndex];
        unpaidInstallment.isPaid = true;
        unpaidInstallment.paidDate = paymentDate;
        unpaidInstallment.paidAmount = unpaidInstallment.amount;
        unpaidInstallment.notes = notes;
        
        // تحديث المبالغ المدفوعة والمتبقية
        installment.paidAmount += unpaidInstallment.amount;
        installment.remainingAmount -= unpaidInstallment.amount;
        installment.updatedAt = new Date().toISOString();
        
        // تحديث حالة القسط إذا تم دفع جميع الأقساط
        const allPaid = installment.monthlyInstallments.every(inst => inst.isPaid);
        if (allPaid) {
            installment.status = 'completed';
        }
        
        // تحديث القسط في المصفوفة
        window.installments[installmentIndex] = installment;
        
        // حفظ البيانات
        if (saveInstallmentData()) {
            // إضافة معاملة جديدة لدفع القسط (إذا كان مطلوباً)
            if (window.addTransaction) {
                const transactionNotes = `تسديد القسط رقم ${unpaidInstallment.installmentNumber} من ${installment.title}`;
                window.addTransaction('دفع قسط', investorId, unpaidInstallment.amount, transactionNotes);
            }
            
            // تحديث عرض الأقساط
            if (window.renderInstallmentsTable) {
                window.renderInstallmentsTable();
            }
            
            // تحديث إحصائيات الأقساط
            if (window.updateInstallmentStatistics) {
                window.updateInstallmentStatistics();
                
                