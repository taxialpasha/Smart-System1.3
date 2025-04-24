/**
 * enhanced-auth-system.js
 * نظام المصادقة والأمان المحسن لتطبيق نظام الاستثمار المتكامل
 * يوفر وظائف إدارة المستخدمين، تسجيل الدخول، والتحكم بالصلاحيات
 * مع واجهة مستخدم مُحسنة وتجربة استخدام أفضل
 */

// ثوابت النظام
const AUTH_SYSTEM_VERSION = "2.0.0";
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 دقيقة بالمللي ثانية

// ثوابت لأنواع المستخدمين وصلاحياتهم
const USER_TYPES = {
    ADMIN: 'admin',    // مسؤول كامل الصلاحيات
    MANAGER: 'manager', // مدير بصلاحيات محدودة
    USER: 'user'       // مستخدم عادي
};

// الصلاحيات لكل نوع مستخدم
const PERMISSIONS = {
    [USER_TYPES.ADMIN]: {
        canCreateUsers: true,
        canDeleteUsers: true,
        canManageSettings: true,
        canDeleteInvestors: true,
        canViewAllData: true,
        canExportData: true,
        canImportData: true,
        canCreateBackup: true,
        canRestoreBackup: true
    },
    [USER_TYPES.MANAGER]: {
        canCreateUsers: false,
        canDeleteUsers: false,
        canManageSettings: true,
        canDeleteInvestors: true,
        canViewAllData: true,
        canExportData: true,
        canImportData: true,
        canCreateBackup: true,
        canRestoreBackup: false
    },
    [USER_TYPES.USER]: {
        canCreateUsers: false,
        canDeleteUsers: false,
        canManageSettings: false,
        canDeleteInvestors: false,
        canViewAllData: true,
        canExportData: true,
        canImportData: false,
        canCreateBackup: false,
        canRestoreBackup: false
    }
};

// رمز المسؤول الافتراضي - يمكن تغييره لاحقاً
let ADMIN_CODE = "admin1234";

// كائن نظام المصادقة والأمان
const AuthSystem = (function () {
    // المتغيرات الخاصة
    let currentUser = null;
    let isInitialized = false;
    let authStateListeners = [];
    let databaseRef = null;
    let storageRef = null;
    let sessionTimeoutId = null;
    let lastActivity = Date.now();
})();
    /**
     * تحميل بيانات المستخدم من التخزين المحلي عند التهيئة
     */
    function loadUserFromLocalStorage() {
        try {
            const storedUser = localStorage.getItem(AUTH_USER_KEY);
            const authToken = localStorage.getItem(AUTH_TOKEN_KEY);

            if (storedUser && authToken) {
                const userData = JSON.parse(storedUser);

                // التحقق من انتهاء صلاحية الجلسة
                if (userData.sessionExpiry && new Date(userData.sessionExpiry) > new Date()) {
                    console.log("تم استعادة جلسة المستخدم من التخزين المحلي");
                    currentUser = userData;

                    // تمديد مدة الجلسة
                    refreshUserSession();
                    return true;
                } else {
                    console.log("انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول");
                    clearUserSession();
                    return false;
                }
            }

            return false;
        } catch (error) {
            console.error("خطأ في تحميل بيانات المستخدم من التخزين المحلي:", error);
            clearUserSession();
            return false;
        }
    }

    /**
     * حفظ بيانات المستخدم في التخزين المحلي
     * @param {Object} user - بيانات المستخدم
     * @param {string} token - رمز المصادقة
     */
    function saveUserToLocalStorage(user, token) {
        try {
            // إضافة وقت انتهاء الجلسة
            const sessionExpiry = new Date();
            sessionExpiry.setTime(sessionExpiry.getTime() + SESSION_TIMEOUT);
            user.sessionExpiry = sessionExpiry.toISOString();

            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
            localStorage.setItem(AUTH_TOKEN_KEY, token);
        } catch (error) {
            console.error("خطأ في حفظ بيانات المستخدم في التخزين المحلي:", error);
        }
    }

    /**
     * مسح بيانات المستخدم من التخزين المحلي
     */
    function clearUserSession() {
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);

        if (sessionTimeoutId) {
            clearTimeout(sessionTimeoutId);
            sessionTimeoutId = null;
        }
    }

    /**
     * تحديث جلسة المستخدم
     */
    function refreshUserSession() {
        if (!currentUser) return;

        // تحديث وقت النشاط الأخير
        lastActivity = Date.now();

        // إعادة ضبط مؤقت انتهاء الجلسة
        if (sessionTimeoutId) {
            clearTimeout(sessionTimeoutId);
        }

        // تحديث وقت انتهاء الجلسة في التخزين المحلي
        const sessionExpiry = new Date();
        sessionExpiry.setTime(sessionExpiry.getTime() + SESSION_TIMEOUT);
        currentUser.sessionExpiry = sessionExpiry.toISOString();

        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));

        // إعداد مؤقت جديد للجلسة
        sessionTimeoutId = setTimeout(() => {
            const timeElapsed = Date.now() - lastActivity;

            if (timeElapsed >= SESSION_TIMEOUT) {
                console.log("انتهت مدة الجلسة بسبب عدم النشاط");

                // بدلاً من تسجيل الخروج مباشرة، نقوم بعرض شاشة القفل للتحقق
                showLockScreen();
            }
        }, SESSION_TIMEOUT);
    }

    /**
     * تهيئة نظام المصادقة
     * @returns {Promise} وعد يشير إلى نجاح أو فشل التهيئة
     */
    function initialize() {
        console.log(`تهيئة نظام المصادقة والأمان (الإصدار ${AUTH_SYSTEM_VERSION})...`);

        return new Promise((resolve, reject) => {
            if (isInitialized) {
                resolve(true);
                return;
            }

            try {
                // إضافة مستمع النشاط لتتبع نشاط المستخدم
                addActivityListener();

                // محاولة استرجاع بيانات المستخدم من التخزين المحلي
                const userLoaded = loadUserFromLocalStorage();

                // التحقق من تهيئة Firebase مسبقاً
                if (!firebase.apps.length) {
                    // التكوين يجب أن يكون موجوداً بالفعل في الصفحة
                    if (typeof firebaseConfig === 'undefined') {
                        console.warn("لم يتم العثور على تكوين Firebase. سيتم استخدام وضع التخزين المحلي فقط.");

                        // إذا كان المستخدم متوفر في التخزين المحلي، نستمر
                        if (userLoaded) {
                            isInitialized = true;
                            updateUIForUser();
                            notifyAuthStateListeners(currentUser);
                            resolve(true);
                            return;
                        } else {
                            // عرض شاشة تسجيل الدخول في حالة عدم وجود مستخدم مخزن
                            showLoginScreen();
                            isInitialized = true;
                            resolve(true);
                            return;
                        }
                    }

                    // تهيئة Firebase
                    firebase.initializeApp(firebaseConfig);
                }

                // إنشاء الإشارة إلى قاعدة البيانات
                databaseRef = firebase.database();
                storageRef = firebase.storage();

                // التحقق من حالة المصادقة الحالية في Firebase
                firebase.auth().onAuthStateChanged(user => {
                    if (user) {
                        // الحصول على بيانات المستخدم من قاعدة البيانات
                        getUserData(user.uid)
                            .then(userData => {
                                currentUser = {
                                    uid: user.uid,
                                    email: user.email,
                                    displayName: user.displayName || userData.fullName,
                                    photoURL: user.photoURL,
                                    type: userData.type || USER_TYPES.USER,
                                    permissions: PERMISSIONS[userData.type || USER_TYPES.USER],
                                    metadata: userData
                                };

                                // حفظ بيانات المستخدم في التخزين المحلي
                                saveUserToLocalStorage(currentUser, user.refreshToken);

                                // تحديث واجهة المستخدم
                                updateUIForUser();

                                // إخطار المستمعين بتغيير حالة المصادقة
                                notifyAuthStateListeners(currentUser);

                                console.log(`تم تسجيل الدخول كـ ${currentUser.displayName || currentUser.email}`);
                                showNotification(`مرحباً بك ${currentUser.displayName || currentUser.email}!`, 'success');
                            })
                            .catch(error => {
                                console.error('خطأ في الحصول على بيانات المستخدم:', error);

                                // تعيين معلومات المستخدم الأساسية
                                currentUser = {
                                    uid: user.uid,
                                    email: user.email,
                                    displayName: user.displayName || user.email,
                                    photoURL: user.photoURL,
                                    type: USER_TYPES.USER,
                                    permissions: PERMISSIONS[USER_TYPES.USER]
                                };

                                // حفظ بيانات المستخدم في التخزين المحلي
                                saveUserToLocalStorage(currentUser, user.refreshToken);

                                // تحديث واجهة المستخدم
                                updateUIForUser();

                                // إخطار المستمعين بتغيير حالة المصادقة
                                notifyAuthStateListeners(currentUser);
                            });
                    } else {
                        currentUser = null;

                        // مسح بيانات المستخدم من التخزين المحلي
                        clearUserSession();

                        // تحديث واجهة المستخدم
                        updateUIForUser();

                        // إخطار المستمعين بتغيير حالة المصادقة
                        notifyAuthStateListeners(null);

                        console.log('لم يتم تسجيل الدخول');
                    }
                });

                isInitialized = true;
                resolve(true);
            } catch (error) {
                console.error('خطأ في تهيئة نظام المصادقة:', error);

                // في حالة الفشل، نعود إلى وضع التخزين المحلي إذا كان المستخدم موجوداً
                if (userLoaded) {
                    isInitialized = true;
                    updateUIForUser();
                    notifyAuthStateListeners(currentUser);
                    resolve(true);
                } else {
                    showLoginScreen();
                    reject(error);
                }
            }
        });
    }

    /**
     * إضافة مستمع للنشاط لتجديد الجلسة
     */
    function addActivityListener() {
        const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, refreshUserSession, { passive: true });
        });
    }

    /**
     * إنشاء حساب جديد
     * @param {string} email - البريد الإلكتروني
     * @param {string} password - كلمة المرور
     * @param {string} fullName - الاسم الكامل
     * @param {string} adminCode - رمز المسؤول (مطلوب للإنشاء الأولي أو حسابات المسؤولين)
     * @param {string} userType - نوع المستخدم (مسؤول، مدير، مستخدم)
     * @returns {Promise} وعد يشير إلى نجاح أو فشل العملية
     */
    function signup(email, password, fullName, adminCode, userType = USER_TYPES.USER) {
        return new Promise((resolve, reject) => {
            // التحقق من وجود مستخدمين
            checkIfFirstUser()
                .then(isFirstUser => {
                    // التحقق من رمز المسؤول إذا لم يكن المستخدم الأول أو إذا طلب صلاحيات مسؤول
                    if ((!isFirstUser || userType === USER_TYPES.ADMIN) && adminCode !== ADMIN_CODE) {
                        reject(new Error('رمز المسؤول غير صحيح'));
                        return;
                    }

                    // إذا كان المستخدم الأول، فسيكون مسؤولاً بغض النظر عن النوع المطلوب
                    if (isFirstUser) {
                        userType = USER_TYPES.ADMIN;
                    }

                    // التحقق من صلاحية إنشاء المستخدم إذا لم يكن المستخدم الأول
                    if (!isFirstUser && currentUser) {
                        // التحقق من صلاحية إنشاء المستخدمين
                        if (!currentUser.permissions.canCreateUsers) {
                            reject(new Error('ليس لديك صلاحية إنشاء مستخدمين جدد'));
                            return;
                        }

                        // التحقق من صلاحية إنشاء مسؤولين
                        if (userType === USER_TYPES.ADMIN && currentUser.type !== USER_TYPES.ADMIN) {
                            reject(new Error('ليس لديك صلاحية إنشاء مستخدمين بصلاحيات مسؤول'));
                            return;
                        }
                    }

                    // الاستمرار في العملية حسب وضع التشغيل
                    if (firebase.apps.length > 0) {
                        // إنشاء المستخدم في Firebase
                        firebase.auth().createUserWithEmailAndPassword(email, password)
                            .then(userCredential => {
                                const user = userCredential.user;

                                // تحديث اسم المستخدم
                                return user.updateProfile({
                                    displayName: fullName
                                }).then(() => user);
                            })
                            .then(user => {
                                // حفظ بيانات المستخدم في قاعدة البيانات
                                const userData = {
                                    uid: user.uid,
                                    email: email,
                                    fullName: fullName,
                                    type: userType,
                                    createdAt: new Date().toISOString(),
                                    lastLogin: new Date().toISOString()
                                };

                                return databaseRef.ref(`users/${user.uid}/profile`).set(userData)
                                    .then(() => {
                                        // إنشاء سجل بإنشاء المستخدم
                                        const logEntry = {
                                            action: 'user_created',
                                            timestamp: new Date().toISOString(),
                                            userId: user.uid,
                                            userEmail: email,
                                            userType: userType,
                                            createdBy: currentUser ? currentUser.uid : 'self_registration'
                                        };

                                        // إضافة السجل إلى تاريخ الأحداث
                                        return databaseRef.ref('system_logs/users').push(logEntry)
                                            .then(() => {
                                                resolve({
                                                    user: user,
                                                    userData: userData
                                                });
                                            });
                                    });
                            })
                            .catch(error => {
                                console.error('خطأ في إنشاء المستخدم:', error);
                                reject(error);
                            });
                    } else {
                        // وضع التخزين المحلي (بدون Firebase)
                        // إنشاء معرف فريد للمستخدم
                        const userId = 'local_' + Date.now().toString();

                        // إنشاء بيانات المستخدم
                        const userData = {
                            uid: userId,
                            email: email,
                            displayName: fullName,
                            fullName: fullName,
                            type: userType,
                            permissions: PERMISSIONS[userType],
                            createdAt: new Date().toISOString(),
                            lastLogin: new Date().toISOString(),
                            password: hashPassword(password) // تخزين كلمة المرور بشكل آمن
                        };

                        // حفظ المستخدم في التخزين المحلي
                        const localUsers = JSON.parse(localStorage.getItem('local_users') || '{}');
                        localUsers[email] = userData;
                        localStorage.setItem('local_users', JSON.stringify(localUsers));

                        // تسجيل الدخول مباشرة بعد إنشاء الحساب
                        currentUser = userData;
                        saveUserToLocalStorage(userData, 'local_token_' + Date.now());
                        updateUIForUser();
                        notifyAuthStateListeners(currentUser);

                        resolve({
                            user: {
                                uid: userId,
                                email: email,
                                displayName: fullName
                            },
                            userData: userData
                        });
                    }
                })
                .catch(error => {
                    console.error('خطأ في التحقق من وجود مستخدمين:', error);
                    reject(error);
                });
        });
    }

    /**
     * تسجيل الدخول إلى الحساب
     * @param {string} email - البريد الإلكتروني
     * @param {string} password - كلمة المرور
     * @returns {Promise} وعد يشير إلى نجاح أو فشل العملية
     */
    function login(email, password) {
        return new Promise((resolve, reject) => {
            // محاولة تسجيل الدخول بناءً على وضع التشغيل
            if (firebase.apps.length > 0) {
                // تسجيل الدخول باستخدام Firebase
                firebase.auth().signInWithEmailAndPassword(email, password)
                    .then(userCredential => {
                        const user = userCredential.user;

                        // تحديث وقت آخر تسجيل دخول
                        databaseRef.ref(`users/${user.uid}/profile/lastLogin`).set(new Date().toISOString());

                        // إنشاء سجل بتسجيل الدخول
                        const logEntry = {
                            action: 'user_login',
                            timestamp: new Date().toISOString(),
                            userId: user.uid,
                            userEmail: email,
                            ip: window.userIP || 'unknown',
                            userAgent: navigator.userAgent
                        };

                        // إضافة السجل إلى تاريخ الأحداث
                        return databaseRef.ref('system_logs/authentication').push(logEntry)
                            .then(() => {
                                // الحصول على بيانات المستخدم من قاعدة البيانات
                                return getUserData(user.uid)
                                    .then(userData => {
                                        const userObj = {
                                            uid: user.uid,
                                            email: user.email,
                                            displayName: user.displayName || userData.fullName,
                                            photoURL: user.photoURL,
                                            type: userData.type || USER_TYPES.USER,
                                            permissions: PERMISSIONS[userData.type || USER_TYPES.USER],
                                            metadata: userData
                                        };

                                        // حفظ بيانات المستخدم في التخزين المحلي
                                        saveUserToLocalStorage(userObj, user.refreshToken);

                                        // تعيين المستخدم الحالي
                                        currentUser = userObj;

                                        // تحديث واجهة المستخدم
                                        updateUIForUser();

                                        // إخطار المستمعين بتغيير حالة المصادقة
                                        notifyAuthStateListeners(currentUser);

                                        resolve(userObj);
                                    });
                            });
                    })
                    .catch(error => {
                        console.error('خطأ في تسجيل الدخول:', error);
                        reject(error);
                    });
            } else {
                // وضع التخزين المحلي (بدون Firebase)
                const localUsers = JSON.parse(localStorage.getItem('local_users') || '{}');
                const user = localUsers[email];

                if (!user) {
                    reject(new Error('البريد الإلكتروني غير مسجل'));
                    return;
                }

                // التحقق من كلمة المرور
                if (!verifyPassword(password, user.password)) {
                    reject(new Error('كلمة المرور غير صحيحة'));
                    return;
                }

                // تحديث وقت آخر تسجيل دخول
                user.lastLogin = new Date().toISOString();
                localUsers[email] = user;
                localStorage.setItem('local_users', JSON.stringify(localUsers));

                // تعيين المستخدم الحالي
                currentUser = user;

                // حفظ بيانات المستخدم في التخزين المحلي
                saveUserToLocalStorage(user, 'local_token_' + Date.now());

                // تحديث واجهة المستخدم
                updateUIForUser();

                // إخطار المستمعين بتغيير حالة المصادقة
                notifyAuthStateListeners(currentUser);

                resolve(user);
            }
        });
    }

    /**
     * تبسيط لتشفير كلمة المرور (للوضع المحلي فقط)
     * ملاحظة: هذه ليست طريقة آمنة للغاية في بيئة الإنتاج
     * @param {string} password - كلمة المرور المراد تشفيرها
     * @returns {string} - كلمة المرور المشفرة
     */
    function hashPassword(password) {
        // في الإنتاج، يجب استخدام خوارزميات أقوى
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // تحويل إلى 32 بت
        }
        return hash.toString(16);
    }

    /**
     * التحقق من كلمة المرور (للوضع المحلي فقط)
     * @param {string} password - كلمة المرور المدخلة
     * @param {string} hashedPassword - كلمة المرور المشفرة
     * @returns {boolean} - هل كلمة المرور صحيحة
     */
    function verifyPassword(password, hashedPassword) {
        return hashPassword(password) === hashedPassword;
    }

    /**
     * تسجيل الخروج من الحساب
     * @returns {Promise} وعد يشير إلى نجاح أو فشل العملية
     */
    function logout() {
        return new Promise((resolve, reject) => {
            try {
                // تسجيل حدث تسجيل الخروج
                if (currentUser) {
                    const logEntry = {
                        action: 'user_logout',
                        timestamp: new Date().toISOString(),
                        userId: currentUser.uid,
                        userEmail: currentUser.email
                    };

                    // تخزين السجل حسب وضع التشغيل
                    if (firebase.apps.length > 0 && databaseRef) {
                        databaseRef.ref('system_logs/authentication').push(logEntry);
                    }
                }

                // مسح بيانات المستخدم من التخزين المحلي
                clearUserSession();

                // تعيين المستخدم الحالي إلى null
                currentUser = null;

                // تحديث واجهة المستخدم
                updateUIForUser();

                // إخطار المستمعين بتغيير حالة المصادقة
                notifyAuthStateListeners(null);

                // تسجيل الخروج من Firebase إذا كان متاحاً
                if (firebase.apps.length > 0) {
                    firebase.auth().signOut()
                        .then(() => {
                            console.log('تم تسجيل الخروج بنجاح');
                            resolve();
                        })
                        .catch(error => {
                            console.error('خطأ في تسجيل الخروج من Firebase:', error);
                            // نستمر بالرغم من الخطأ لأننا قمنا بالفعل بمسح البيانات المحلية
                            resolve();
                        });
                } else {
                    console.log('تم تسجيل الخروج بنجاح');
                    resolve();
                }
            } catch (error) {
                console.error('خطأ في تسجيل الخروج:', error);
                // نستمر بالرغم من الخطأ لتجنب بقاء المستخدم في حالة غير متسقة
                currentUser = null;
                updateUIForUser();
                notifyAuthStateListeners(null);
                resolve();
            }
        });
    }

    /**
     * التحقق من وجود مستخدمين في النظام
     * @returns {Promise<boolean>} وعد يحتوي على قيمة بولية تشير إلى ما إذا كان هذا هو المستخدم الأول
     */
    function checkIfFirstUser() {
        return new Promise((resolve) => {
            // التحقق حسب وضع التشغيل
            if (firebase.apps.length > 0 && databaseRef) {
                databaseRef.ref('users').once('value')
                    .then(snapshot => {
                        resolve(!snapshot.exists());
                    })
                    .catch(error => {
                        console.error('خطأ في التحقق من وجود مستخدمين:', error);
                        resolve(false);
                    });
            } else {
                // التحقق في وضع التخزين المحلي
                const localUsers = JSON.parse(localStorage.getItem('local_users') || '{}');
                resolve(Object.keys(localUsers).length === 0);
            }
        });
    }

    /**
     * الحصول على بيانات المستخدم من قاعدة البيانات
     * @param {string} userId - معرف المستخدم
     * @returns {Promise<Object>} وعد يحتوي على بيانات المستخدم
     */
    function getUserData(userId) {
        return new Promise((resolve, reject) => {
            if (firebase.apps.length > 0 && databaseRef) {
                databaseRef.ref(`users/${userId}/profile`).once('value')
                    .then(snapshot => {
                        const userData = snapshot.val();
                        if (!userData) {
                            reject(new Error('لم يتم العثور على بيانات المستخدم'));
                            return;
                        }
                        resolve(userData);
                    })
                    .catch(error => {
                        console.error('خطأ في الحصول على بيانات المستخدم:', error);
                        reject(error);
                    });
            } else {
                // التحقق في وضع التخزين المحلي
                const localUsers = JSON.parse(localStorage.getItem('local_users') || '{}');

                // البحث عن المستخدم بواسطة المعرف
                let userData = null;
                Object.values(localUsers).forEach(user => {
                    if (user.uid === userId) {
                        userData = user;
                    }
                });

                if (userData) {
                    resolve(userData);
                } else {
                    reject(new Error('لم يتم العثور على بيانات المستخدم'));
                }
            }
        });
    }

    /**
     * تحديث معلومات المستخدم
     * @param {string} userId - معرف المستخدم
     * @param {Object} userData - البيانات المراد تحديثها
     * @returns {Promise} وعد يشير إلى نجاح أو فشل العملية
     */
    function updateUserData(userId, userData) {
        return new Promise((resolve, reject) => {
            // التحقق من الصلاحيات
            if (currentUser.uid !== userId && !currentUser.permissions.canCreateUsers) {
                reject(new Error('ليس لديك صلاحية تعديل بيانات المستخدمين'));
                return;
            }

            // منع المستخدم من تغيير نوعه إلى مسؤول إلا إذا كان مسؤولاً بالفعل
            if (userData.type === USER_TYPES.ADMIN && currentUser.type !== USER_TYPES.ADMIN) {
                reject(new Error('ليس لديك صلاحية تعيين المستخدمين كمسؤولين'));
                return;
            }

            if (firebase.apps.length > 0 && databaseRef) {
                databaseRef.ref(`users/${userId}/profile`).update(userData)
                    .then(() => {
                        // إنشاء سجل بتحديث بيانات المستخدم
                        const logEntry = {
                            action: 'user_updated',
                            timestamp: new Date().toISOString(),
                            userId: userId,
                            updatedBy: currentUser.uid,
                            updatedFields: Object.keys(userData)
                        };

                        // إضافة السجل إلى تاريخ الأحداث
                        return databaseRef.ref('system_logs/users').push(logEntry)
                            .then(() => {
                                // إذا كان المستخدم المحدث هو المستخدم الحالي، نقوم بتحديث البيانات المحلية
                                if (userId === currentUser.uid) {
                                    // تحديث بيانات المستخدم الحالي
                                    Object.assign(currentUser, userData);

                                    // تحديث المستخدم في التخزين المحلي
                                    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));

                                    // تحديث واجهة المستخدم
                                    updateUIForUser();
                                }

                                resolve();
                            });
                    })
                    .catch(error => {
                        console.error('خطأ في تحديث بيانات المستخدم:', error);
                        reject(error);
                    });
            } else {
                // وضع التخزين المحلي
                const localUsers = JSON.parse(localStorage.getItem('local_users') || '{}');

                // البحث عن المستخدم بواسطة المعرف
                let userEmail = null;
                Object.entries(localUsers).forEach(([email, user]) => {
                    if (user.uid === userId) {
                        userEmail = email;
                    }
                });

                if (userEmail) {
                    // تحديث بيانات المستخدم
                    const updatedUser = { ...localUsers[userEmail], ...userData };
                    localUsers[userEmail] = updatedUser;

                    // حفظ التغييرات
                    localStorage.setItem('local_users', JSON.stringify(localUsers));

                    // إذا كان المستخدم المحدث هو المستخدم الحالي، نقوم بتحديث البيانات المحلية
                    if (userId === currentUser.uid) {
                        // تحديث بيانات المستخدم الحالي
                        Object.assign(currentUser, userData);

                        // تحديث المستخدم في التخزين المحلي
                        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));

                        // تحديث واجهة المستخدم
                        updateUIForUser();
                    }

                    resolve();
                } else {
                    reject(new Error('لم يتم العثور على المستخدم'));
                }
            }
        });
    }

    /**
     * حذف مستخدم
     * @param {string} userId - معرف المستخدم
     * @returns {Promise} وعد يشير إلى نجاح أو فشل العملية
     */
    function deleteUser(userId) {
        return new Promise((resolve, reject) => {
            // التحقق من الصلاحيات
            if (!currentUser.permissions.canDeleteUsers) {
                reject(new Error('ليس لديك صلاحية حذف المستخدمين'));
                return;
            }

            // الحصول على بيانات المستخدم قبل الحذف
            getUserData(userId)
                .then(userData => {
                    // منع حذف المستخدمين المسؤولين إلا من قبل مسؤول آخر
                    if (userData.type === USER_TYPES.ADMIN && currentUser.type !== USER_TYPES.ADMIN) {
                        reject(new Error('ليس لديك صلاحية حذف المستخدمين المسؤولين'));
                        return;
                    }

                    if (firebase.apps.length > 0 && databaseRef) {
                        // حذف المستخدم من قاعدة البيانات
                        databaseRef.ref(`users/${userId}`).remove()
                            .then(() => {
                                // إنشاء سجل بحذف المستخدم
                                const logEntry = {
                                    action: 'user_deleted',
                                    timestamp: new Date().toISOString(),
                                    deletedUserId: userId,
                                    deletedUserEmail: userData.email,
                                    deletedUserType: userData.type,
                                    deletedBy: currentUser.uid
                                };

                                // إضافة السجل إلى تاريخ الأحداث
                                return databaseRef.ref('system_logs/users').push(logEntry)
                                    .then(() => {
                                        resolve();
                                    });
                            })
                            .catch(error => {
                                console.error('خطأ في حذف المستخدم:', error);
                                reject(error);
                            });
                    } else {
                        // وضع التخزين المحلي
                        const localUsers = JSON.parse(localStorage.getItem('local_users') || '{}');

                        // البحث عن المستخدم بواسطة المعرف
                        let userEmail = null;
                        Object.entries(localUsers).forEach(([email, user]) => {
                            if (user.uid === userId) {
                                userEmail = email;
                            }
                        });

                        if (userEmail) {
                            // حذف المستخدم
                            delete localUsers[userEmail];

                            // حفظ التغييرات
                            localStorage.setItem('local_users', JSON.stringify(localUsers));

                            resolve();
                        } else {
                            reject(new Error('لم يتم العثور على المستخدم'));
                        }
                    }
                })
                .catch(error => {
                    console.error('خطأ في الحصول على بيانات المستخدم قبل الحذف:', error);
                    reject(error);
                });
        });
    }

    /**
     * الحصول على قائمة المستخدمين
     * @returns {Promise<Array>} وعد يحتوي على قائمة المستخدمين
     */
    function getUsers() {
        return new Promise((resolve, reject) => {
            // التحقق من الصلاحيات
            if (!currentUser.permissions.canCreateUsers && !currentUser.permissions.canDeleteUsers && currentUser.type !== USER_TYPES.ADMIN) {
                reject(new Error('ليس لديك صلاحية عرض قائمة المستخدمين'));
                return;
            }

            if (firebase.apps.length > 0 && databaseRef) {
                databaseRef.ref('users').once('value')
                    .then(snapshot => {
                        const usersData = snapshot.val();
                        if (!usersData) {
                            resolve([]);
                            return;
                        }

                        const usersList = [];
                        Object.keys(usersData).forEach(userId => {
                            const user = usersData[userId].profile;
                            if (user) {
                                usersList.push({
                                    uid: userId,
                                    ...user
                                });
                            }
                        });

                        resolve(usersList);
                    })
                    .catch(error => {
                        console.error('خطأ في الحصول على قائمة المستخدمين:', error);
                        reject(error);
                    });
            } else {
                // وضع التخزين المحلي
                const localUsers = JSON.parse(localStorage.getItem('local_users') || '{}');

                const usersList = Object.values(localUsers);
                resolve(usersList);
            }
        });
    }

    /**
     * تغيير كلمة المرور
     * @param {string} currentPassword - كلمة المرور الحالية
     * @param {string} newPassword - كلمة المرور الجديدة
     * @returns {Promise} وعد يشير إلى نجاح أو فشل العملية
     */
    function changePassword(currentPassword, newPassword) {
        return new Promise((resolve, reject) => {
            if (!currentUser) {
                reject(new Error('لم يتم تسجيل الدخول'));
                return;
            }

            if (firebase.apps.length > 0) {
                const user = firebase.auth().currentUser;
                if (!user) {
                    reject(new Error('لم يتم تسجيل الدخول'));
                    return;
                }

                // إعادة المصادقة قبل تغيير كلمة المرور
                const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
                user.reauthenticateWithCredential(credential)
                    .then(() => {
                        return user.updatePassword(newPassword);
                    })
                    .then(() => {
                        // إنشاء سجل بتغيير كلمة المرور
                        const logEntry = {
                            action: 'password_changed',
                            timestamp: new Date().toISOString(),
                            userId: user.uid,
                            userEmail: user.email
                        };

                        // إضافة السجل إلى تاريخ الأحداث
                        if (databaseRef) {
                            return databaseRef.ref('system_logs/authentication').push(logEntry)
                                .then(() => {
                                    resolve();
                                });
                        } else {
                            resolve();
                        }
                    })
                    .catch(error => {
                        console.error('خطأ في تغيير كلمة المرور:', error);
                        reject(error);
                    });
            } else {
                const localUsers = JSON.parse(localStorage.getItem('local_users') || '{}');

                if (localUsers[email]) {
                    // إعادة تعيين كلمة المرور إلى قيمة افتراضية (123456)
                    localUsers[email].password = hashPassword('123456');

                    // حفظ التغييرات
                    localStorage.setItem('local_users', JSON.stringify(localUsers));

                    showNotification('تم إعادة تعيين كلمة المرور إلى: 123456', 'info');
                    resolve();
                } else {
                    reject(new Error('البريد الإلكتروني غير مسجل'));
                }
            }
        });
    }

    /**
     * تغيير رمز المسؤول
     * @param {string} currentAdminCode - رمز المسؤول الحالي
     * @param {string} newAdminCode - رمز المسؤول الجديد
     * @returns {Promise} وعد يشير إلى نجاح أو فشل العملية
     */
    function changeAdminCode(currentAdminCode, newAdminCode) {
        return new Promise((resolve, reject) => {
            // التحقق من الصلاحيات
            if (currentUser.type !== USER_TYPES.ADMIN) {
                reject(new Error('ليس لديك صلاحية تغيير رمز المسؤول'));
                return;
            }

            // التحقق من صحة رمز المسؤول الحالي
            if (currentAdminCode !== ADMIN_CODE) {
                reject(new Error('رمز المسؤول الحالي غير صحيح'));
                return;
            }

            if (firebase.apps.length > 0 && databaseRef) {
                // تحديث رمز المسؤول في الإعدادات
                databaseRef.ref('system_settings/admin_code').set({
                    code: newAdminCode,
                    updatedAt: new Date().toISOString(),
                    updatedBy: currentUser.uid
                })
                    .then(() => {
                        // تحديث المتغير المحلي
                        ADMIN_CODE = newAdminCode;

                        // حفظ رمز المسؤول في التخزين المحلي أيضًا
                        localStorage.setItem('admin_code', newAdminCode);

                        // إنشاء سجل بتغيير رمز المسؤول
                        const logEntry = {
                            action: 'admin_code_changed',
                            timestamp: new Date().toISOString(),
                            updatedBy: currentUser.uid,
                            userEmail: currentUser.email
                        };

                        // إضافة السجل إلى تاريخ الأحداث
                        return databaseRef.ref('system_logs/system').push(logEntry)
                            .then(() => {
                                resolve();
                            });
                    })
                    .catch(error => {
                        console.error('خطأ في تغيير رمز المسؤول:', error);
                        reject(error);
                    });
            } else {
                // وضع التخزين المحلي
                ADMIN_CODE = newAdminCode;
                localStorage.setItem('admin_code', newAdminCode);
                resolve();
            }
        });
    }

    /**
     * إضافة مستمع لحالة المصادقة
     * @param {Function} listener - دالة الاستماع
     */
    function addAuthStateListener(listener) {
        if (typeof listener === 'function' && !authStateListeners.includes(listener)) {
            authStateListeners.push(listener);
        }
    }

    /**
     * إزالة مستمع لحالة المصادقة
     * @param {Function} listener - دالة الاستماع
     */
    function removeAuthStateListener(listener) {
        const index = authStateListeners.indexOf(listener);
        if (index !== -1) {
            authStateListeners.splice(index, 1);
        }
    }

    /**
     * إخطار جميع مستمعي حالة المصادقة
     * @param {Object|null} user - معلومات المستخدم
     */
    function notifyAuthStateListeners(user) {
        authStateListeners.forEach(listener => {
            try {
                listener(user);
            } catch (error) {
                console.error('خطأ في مستمع حالة المصادقة:', error);
            }
        });
    }

    /**
     * تحديث واجهة المستخدم بناءً على حالة المصادقة
     */
    function updateUIForUser() {
        if (currentUser) {
            // إخفاء شاشة تسجيل الدخول
            hideLoginScreen();

            // عرض اسم المستخدم ونوعه في الواجهة
            updateUserInfo();

            // تحديث وصول العناصر بناءً على الصلاحيات
            updateElementsAccess();
        } else {
            // عرض شاشة تسجيل الدخول
            showLoginScreen();
        }

        // إطلاق حدث لإعلام باقي التطبيق بتغيير حالة المصادقة
        document.dispatchEvent(new CustomEvent('auth:stateChanged', {
            detail: { authenticated: !!currentUser }
        }));
    }

    /**
     * عرض شاشة تسجيل الدخول المحسنة
     */
    function showLoginScreen() {
        console.log('عرض شاشة تسجيل الدخول المحسنة...');

        // التحقق من وجود شاشة تسجيل الدخول
        const loginScreen = document.getElementById('auth-login-screen');
        if (!loginScreen) {
            // إنشاء شاشة تسجيل الدخول إذا لم تكن موجودة
            createLoginScreen();
        } else {
            loginScreen.style.display = 'flex';
        }

        // إخفاء المحتوى الرئيسي
        const appContent = document.querySelector('.layout, #main-content');
        if (appContent) {
            appContent.style.display = 'none';
        }
    }

    /**
     * إخفاء شاشة تسجيل الدخول
     */
    function hideLoginScreen() {
        const loginScreen = document.getElementById('auth-login-screen');
        if (loginScreen) {
            // إضافة فئة للتأثير المتحرك
            loginScreen.classList.add('fade-out');

            // إزالة العنصر بعد اكتمال التأثير المتحرك
            setTimeout(() => {
                loginScreen.style.display = 'none';
                loginScreen.classList.remove('fade-out');
            }, 300);
        }

        // إظهار المحتوى الرئيسي
        const appContent = document.querySelector('.layout, #main-content');
        if (appContent) {
            appContent.style.display = '';
        }
    }

    /**
     * إنشاء شاشة تسجيل الدخول المحسنة
     */
    function createLoginScreen() {
        // التحقق من تحميل أنماط CSS
        addAuthStyles();

        // إنشاء عنصر الشاشة
        const loginScreen = document.createElement('div');
        loginScreen.id = 'auth-login-screen';
        loginScreen.className = 'auth-screen';

        // الحصول على اسم التطبيق
        const appName = settings?.systemName || 'نظام الاستثمار المتكامل';

        // إضافة محتوى الشاشة
        loginScreen.innerHTML = `
            <div class="auth-container">
                <div class="auth-logo animated bounce">
                    <i class="fas fa-chart-line"></i>
                    <span>${appName}</span>
                </div>
                
                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="login">تسجيل الدخول</button>
                    <button class="auth-tab" data-tab="register">إنشاء حساب</button>
                </div>
                
                <div class="auth-tab-content active" id="login-tab-content">
                    <form id="login-form">
                        <div class="form-group">
                            <label class="form-label">البريد الإلكتروني</label>
                            <div class="input-icon-group">
                                <i class="fas fa-envelope"></i>
                                <input type="email" class="form-input" id="login-email" placeholder="أدخل البريد الإلكتروني" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">كلمة المرور</label>
                            <div class="input-icon-group">
                                <i class="fas fa-lock"></i>
                                <div class="password-input-container">
                                    <input type="password" class="form-input" id="login-password" placeholder="أدخل كلمة المرور" required>
                                    <button type="button" class="toggle-password">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group form-options">
                            <div class="form-check">
                                <input type="checkbox" id="remember-me">
                                <label for="remember-me">تذكرني</label>
                            </div>
                            <button type="button" class="btn-link" id="forgot-password-btn">نسيت كلمة المرور؟</button>
                        </div>
                        
                        <div class="form-group form-actions">
                            <button type="submit" class="btn btn-primary btn-block">
                                <i class="fas fa-sign-in-alt"></i>
                                <span>تسجيل الدخول</span>
                            </button>
                        </div>
                    </form>
                </div>
                
                <div class="auth-tab-content" id="register-tab-content">
                    <form id="register-form">
                        <div class="form-group">
                            <label class="form-label">الاسم الكامل</label>
                            <div class="input-icon-group">
                                <i class="fas fa-user"></i>
                                <input type="text" class="form-input" id="register-name" placeholder="أدخل الاسم الكامل" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">البريد الإلكتروني</label>
                            <div class="input-icon-group">
                                <i class="fas fa-envelope"></i>
                                <input type="email" class="form-input" id="register-email" placeholder="أدخل البريد الإلكتروني" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">كلمة المرور</label>
                            <div class="input-icon-group">
                                <i class="fas fa-lock"></i>
                                <div class="password-input-container">
                                    <input type="password" class="form-input" id="register-password" placeholder="أدخل كلمة المرور" required>
                                    <button type="button" class="toggle-password">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">تأكيد كلمة المرور</label>
                            <div class="input-icon-group">
                                <i class="fas fa-lock"></i>
                                <div class="password-input-container">
                                    <input type="password" class="form-input" id="register-confirm-password" placeholder="تأكيد كلمة المرور" required>
                                    <button type="button" class="toggle-password">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">رمز المسؤول</label>
                            <div class="input-icon-group">
                                <i class="fas fa-key"></i>
                                <div class="password-input-container">
                                    <input type="password" class="form-input" id="register-admin-code" placeholder="مطلوب للمستخدم الأول أو للمسؤول">
                                    <button type="button" class="toggle-password">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">نوع المستخدم</label>
                            <div class="input-icon-group">
                                <i class="fas fa-user-tag"></i>
                                <select class="form-select" id="register-user-type">
                                    <option value="user">مستخدم عادي</option>
                                    <option value="manager">مدير</option>
                                    <option value="admin">مسؤول</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group form-actions">
                            <button type="submit" class="btn btn-primary btn-block">
                                <i class="fas fa-user-plus"></i>
                                <span>إنشاء حساب</span>
                            </button>
                        </div>
                    </form>
                </div>
                
                <div class="auth-footer">
                    <p>نظام الاستثمار المتكامل &copy; ${new Date().getFullYear()}</p>
                    <div class="version-info">الإصدار ${AUTH_SYSTEM_VERSION}</div>
                </div>
            </div>
            
            <div class="auth-particles" id="auth-particles"></div>
        `;

        // إضافة عنصر الشاشة إلى الصفحة
        document.body.appendChild(loginScreen);

        // إضافة مستمعي الأحداث لشاشة تسجيل الدخول
        setupLoginScreenListeners();

        // تفعيل تأثير الجزيئات في الخلفية إذا كانت مكتبة particles.js متاحة
        if (window.particlesJS) {
            initParticlesEffect();
        }
    }

    /**
     * تفعيل تأثير الجزيئات في الخلفية
     */
    function initParticlesEffect() {
        particlesJS('auth-particles', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#3b82f6' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#3b82f6',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'grab' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 1 } },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }

    /**
     * إضافة مستمعي الأحداث لشاشة تسجيل الدخول
     */
    function setupLoginScreenListeners() {
        // التبديل بين تبويبات تسجيل الدخول والتسجيل
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                // إزالة الفئة النشطة من جميع التبويبات
                authTabs.forEach(t => t.classList.remove('active'));

                // إضافة الفئة النشطة للتبويب المحدد
                this.classList.add('active');

                // إخفاء جميع محتويات التبويبات
                const tabContents = document.querySelectorAll('.auth-tab-content');
                tabContents.forEach(content => content.classList.remove('active'));

                // إظهار محتوى التبويب المحدد
                const tabName = this.getAttribute('data-tab');
                const selectedTabContent = document.getElementById(`${tabName}-tab-content`);
                if (selectedTabContent) {
                    selectedTabContent.classList.add('active');
                }
            });
        });

        // إظهار/إخفاء كلمة المرور
        const togglePasswordButtons = document.querySelectorAll('.toggle-password');
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', function () {
                const passwordInput = this.parentElement.querySelector('input');
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    this.querySelector('i').classList.remove('fa-eye');
                    this.querySelector('i').classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    this.querySelector('i').classList.remove('fa-eye-slash');
                    this.querySelector('i').classList.add('fa-eye');
                }
            });
        });

        // نموذج تسجيل الدخول
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const emailInput = document.getElementById('login-email');
                const passwordInput = document.getElementById('login-password');
                const rememberMeCheckbox = document.getElementById('remember-me');

                if (!emailInput || !passwordInput) {
                    showAuthNotification('خطأ في النموذج: بعض الحقول المطلوبة غير موجودة', 'error');
                    return;
                }

                const email = emailInput.value.trim();
                const password = passwordInput.value;
                const rememberMe = rememberMeCheckbox && rememberMeCheckbox.checked;

                if (!email || !password) {
                    showAuthNotification('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'error');
                    return;
                }

                // تغيير حالة الزر
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
                submitButton.disabled = true;

                // إضافة فئة لتحسين مظهر نموذج تسجيل الدخول أثناء الانتظار
                loginForm.classList.add('processing');

                // تسجيل الدخول
                login(email, password)
                    .then(user => {
                        // حفظ حالة "تذكرني" إذا تم اختيارها
                        if (rememberMe) {
                            localStorage.setItem('auth_remember_email', email);
                        } else {
                            localStorage.removeItem('auth_remember_email');
                        }

                        showAuthNotification('تم تسجيل الدخول بنجاح', 'success');

                        // بدلاً من تحديث واجهة المستخدم هنا، سيتم تحديثها من خلال مستمع حالة المصادقة
                    })
                    .catch(error => {
                        console.error('خطأ في تسجيل الدخول:', error);

                        let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';

                        if (error.code === 'auth/wrong-password') {
                            errorMessage = 'كلمة المرور غير صحيحة';
                        } else if (error.code === 'auth/user-not-found') {
                            errorMessage = 'البريد الإلكتروني غير مسجل';
                        } else if (error.code === 'auth/invalid-email') {
                            errorMessage = 'البريد الإلكتروني غير صالح';
                        } else if (error.code === 'auth/too-many-requests') {
                            errorMessage = 'تم تجاوز عدد المحاولات، يرجى المحاولة لاحقاً';
                        } else if (error.message) {
                            errorMessage = error.message;
                        }

                        showAuthNotification(errorMessage, 'error');
                    })
                    .finally(() => {
                        // إعادة حالة الزر
                        submitButton.innerHTML = originalText;
                        submitButton.disabled = false;

                        // إزالة فئة المعالجة
                        loginForm.classList.remove('processing');
                    });
            });

            // تعبئة البريد الإلكتروني المحفوظ إذا كان متاحًا
            const savedEmail = localStorage.getItem('auth_remember_email');
            if (savedEmail) {
                const emailInput = document.getElementById('login-email');
                if (emailInput) {
                    emailInput.value = savedEmail;
                }

                const rememberMeCheckbox = document.getElementById('remember-me');
                if (rememberMeCheckbox) {
                    rememberMeCheckbox.checked = true;
                }
            }
        }

        // نموذج إنشاء حساب
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const nameInput = document.getElementById('register-name');
                const emailInput = document.getElementById('register-email');
                const passwordInput = document.getElementById('register-password');
                const confirmPasswordInput = document.getElementById('register-confirm-password');
                const adminCodeInput = document.getElementById('register-admin-code');
                const userTypeSelect = document.getElementById('register-user-type');

                if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !userTypeSelect) {
                    showAuthNotification('خطأ في النموذج: بعض الحقول المطلوبة غير موجودة', 'error');
                    return;
                }

                const fullName = nameInput.value.trim();
                const email = emailInput.value.trim();
                const password = passwordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                const adminCode = adminCodeInput.value;
                const userType = userTypeSelect.value;

                if (!fullName || !email || !password || !confirmPassword) {
                    showAuthNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
                    return;
                }

                if (password.length < 6) {
                    showAuthNotification('يجب أن تكون كلمة المرور 6 أحرف على الأقل', 'error');
                    return;
                }

                if (password !== confirmPassword) {
                    showAuthNotification('كلمة المرور وتأكيدها غير متطابقين', 'error');
                    return;
                }

                // تغيير حالة الزر
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
                submitButton.disabled = true;

                // إضافة فئة لتحسين مظهر نموذج إنشاء الحساب أثناء الانتظار
                registerForm.classList.add('processing');

                // إنشاء الحساب
                signup(email, password, fullName, adminCode, userType)
                    .then(result => {
                        showAuthNotification('تم إنشاء الحساب بنجاح', 'success');

                        // التبديل إلى تبويب تسجيل الدخول
                        const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
                        if (loginTab) {
                            loginTab.click();
                        }

                        // تعبئة البريد الإلكتروني في نموذج تسجيل الدخول
                        const loginEmailInput = document.getElementById('login-email');
                        if (loginEmailInput) {
                            loginEmailInput.value = email;
                        }

                        // مسح نموذج إنشاء الحساب
                        registerForm.reset();
                    })
                    .catch(error => {
                        console.error('خطأ في إنشاء الحساب:', error);

                        let errorMessage = 'حدث خطأ أثناء إنشاء الحساب';

                        if (error.code === 'auth/email-already-in-use') {
                            errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
                        } else if (error.code === 'auth/invalid-email') {
                            errorMessage = 'البريد الإلكتروني غير صالح';
                        } else if (error.code === 'auth/weak-password') {
                            errorMessage = 'كلمة المرور ضعيفة جداً';
                        } else if (error.message) {
                            errorMessage = error.message;
                        }

                        showAuthNotification(errorMessage, 'error');
                    })
                    .finally(() => {
                        // إعادة حالة الزر
                        submitButton.innerHTML = originalText;
                        submitButton.disabled = false;

                        // إزالة فئة المعالجة
                        registerForm.classList.remove('processing');
                    });
            });
        }

        // نسيت كلمة المرور
        const forgotPasswordBtn = document.getElementById('forgot-password-btn');
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', function () {
                showForgotPasswordModal();
            });
        }
    }

    /**
      * عرض نافذة نسيت كلمة المرور
      */
    function showForgotPasswordModal() {
        // إنشاء عنصر النافذة
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay auth-modal';
        modalOverlay.id = 'forgot-password-modal';

        // إضافة محتوى النافذة
        modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInDown">
            <div class="modal-header">
                <h3 class="modal-title">استعادة كلمة المرور</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p class="modal-message">أدخل البريد الإلكتروني الخاص بك وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.</p>
                <form id="forgot-password-form">
                    <div class="form-group">
                        <label class="form-label">البريد الإلكتروني</label>
                        <div class="input-icon-group">
                            <i class="fas fa-envelope"></i>
                            <input type="email" class="form-input" id="forgot-password-email" placeholder="أدخل البريد الإلكتروني" required>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-paper-plane"></i>
                            <span>إرسال الرابط</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

        // إضافة النافذة للصفحة
        document.body.appendChild(modalOverlay);

        // إظهار النافذة
        setTimeout(() => {
            modalOverlay.classList.add('active');
        }, 10);

        // مستمع حدث الإغلاق
        const closeBtn = modalOverlay.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal(modalOverlay.id);
            });
        }

        // مستمع حدث النقر خارج النافذة
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal(modalOverlay.id);
            }
        });

        // مستمع حدث النموذج
        const forgotPasswordForm = modalOverlay.querySelector('#forgot-password-form');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const emailInput = document.getElementById('forgot-password-email');

                if (!emailInput) {
                    showAuthNotification('خطأ في النموذج: حقل البريد الإلكتروني غير موجود', 'error');
                    return;
                }

                const email = emailInput.value.trim();

                if (!email) {
                    showAuthNotification('يرجى إدخال البريد الإلكتروني', 'error');
                    return;
                }

                // تغيير حالة الزر
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
                submitButton.disabled = true;

                // إرسال رسالة إعادة تعيين كلمة المرور
                resetPassword(email)
                    .then(() => {
                        showAuthNotification('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني', 'success');

                        // إغلاق النافذة
                        closeModal(modalOverlay.id);
                    })
                    .catch(error => {
                        console.error('خطأ في إرسال رابط استعادة كلمة المرور:', error);

                        let errorMessage = 'حدث خطأ أثناء إرسال رابط استعادة كلمة المرور';

                        if (error.code === 'auth/user-not-found') {
                            errorMessage = 'البريد الإلكتروني غير مسجل';
                        } else if (error.code === 'auth/invalid-email') {
                            errorMessage = 'البريد الإلكتروني غير صالح';
                        } else if (error.message) {
                            errorMessage = error.message;
                        }

                        showAuthNotification(errorMessage, 'error');
                    })
                    .finally(() => {
                        // إعادة حالة الزر
                        submitButton.innerHTML = originalText;
                        submitButton.disabled = false;
                    });
            });
        }
    }

    /**
     * إغلاق النافذة المنبثقة
     * @param {string} modalId - معرف النافذة
     */
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            // إضافة فئة للتأثير المتحرك
            modal.classList.remove('active');

            // إزالة العنصر بعد اكتمال التأثير المتحرك
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    /**
     * عرض إشعار في شاشة تسجيل الدخول
     * @param {string} message - نص الإشعار
     * @param {string} type - نوع الإشعار (success, error, warning, info)
     */
    function showAuthNotification(message, type = 'info') {
        // التحقق من وجود عنصر الإشعار
        let notificationElement = document.querySelector('.auth-notification');

        // إنشاء عنصر الإشعار إذا لم يكن موجوداً
        if (!notificationElement) {
            notificationElement = document.createElement('div');
            notificationElement.className = 'auth-notification';

            // إضافة العنصر للصفحة
            const authContainer = document.querySelector('.auth-container');
            if (authContainer) {
                authContainer.appendChild(notificationElement);
            } else {
                document.body.appendChild(notificationElement);
            }
        }

        // تحديد الفئة حسب نوع الإشعار
        notificationElement.className = `auth-notification ${type} animate__animated animate__fadeInDown`;

        // إضافة المحتوى
        notificationElement.innerHTML = `
        <div class="auth-notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="auth-notification-close">&times;</button>
    `;

        // إظهار الإشعار
        notificationElement.classList.add('show');

        // إغلاق الإشعار بعد فترة
        const timeout = setTimeout(() => {
            if (notificationElement) {
                notificationElement.classList.remove('show');
                notificationElement.classList.add('animate__fadeOutUp');

                // إزالة العنصر بعد اكتمال التأثير المتحرك
                setTimeout(() => {
                    if (notificationElement.parentNode) {
                        notificationElement.parentNode.removeChild(notificationElement);
                    }
                }, 300);
            }
        }, 5000);

        // إضافة مستمع حدث زر الإغلاق
        const closeButton = notificationElement.querySelector('.auth-notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', function () {
                clearTimeout(timeout);
                notificationElement.classList.remove('show');
                notificationElement.classList.add('animate__fadeOutUp');

                // إزالة العنصر بعد اكتمال التأثير المتحرك
                setTimeout(() => {
                    if (notificationElement.parentNode) {
                        notificationElement.parentNode.removeChild(notificationElement);
                    }
                }, 300);
            });
        }
    }

    /**
     * الحصول على أيقونة الإشعار
     * @param {string} type - نوع الإشعار
     * @returns {string} - فئة الأيقونة
     */
    function getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return 'fa-check-circle';
            case 'error':
                return 'fa-times-circle';
            case 'warning':
                return 'fa-exclamation-triangle';
            case 'info':
            default:
                return 'fa-info-circle';
        }
    }

    /**
     * تحديث معلومات المستخدم في الواجهة
     */
    function updateUserInfo() {
        if (!currentUser) return;

        // تحديث معلومات المستخدم في الشريط العلوي
        let userInfoElement = document.querySelector('.user-info');

        if (!userInfoElement) {
            // إنشاء عنصر معلومات المستخدم إذا لم يكن موجوداً
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                userInfoElement = document.createElement('div');
                userInfoElement.className = 'user-info dropdown';
                headerActions.appendChild(userInfoElement);
            }
        }

        if (userInfoElement) {
            userInfoElement.innerHTML = `
            <button class="dropdown-toggle ripple-effect">
                <div class="user-avatar" data-initials="${currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}" style="background-color: ${getUserAvatarColor(currentUser.uid)}">
                    ${currentUser.photoURL ? `<img src="${currentUser.photoURL}" alt="${currentUser.displayName || currentUser.email}">` : ''}
                </div>
                <div class="user-details">
                    <div class="user-name">${currentUser.displayName || currentUser.email}</div>
                    <div class="user-type">${getUserTypeLabel(currentUser.type)}</div>
                </div>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu">
                <div class="dropdown-header">
                    <div class="user-avatar large" data-initials="${currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}" style="background-color: ${getUserAvatarColor(currentUser.uid)}">
                        ${currentUser.photoURL ? `<img src="${currentUser.photoURL}" alt="${currentUser.displayName || currentUser.email}">` : ''}
                    </div>
                    <div class="user-info-details">
                        <div class="user-name">${currentUser.displayName || 'المستخدم'}</div>
                        <div class="user-email">${currentUser.email}</div>
                    </div>
                </div>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item ripple-effect" id="profile-btn">
                    <i class="fas fa-user"></i>
                    <span>الملف الشخصي</span>
                </a>
                <a href="#" class="dropdown-item ripple-effect" id="change-password-btn">
                    <i class="fas fa-key"></i>
                    <span>تغيير كلمة المرور</span>
                </a>
                <a href="#" class="dropdown-item ripple-effect" id="settings-btn">
                    <i class="fas fa-cog"></i>
                    <span>الإعدادات</span>
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item ripple-effect" id="help-btn">
                    <i class="fas fa-question-circle"></i>
                    <span>المساعدة</span>
                </a>
                <a href="#" class="dropdown-item ripple-effect logout-item" id="logout-btn">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>تسجيل الخروج</span>
                </a>
            </div>
        `;

            // إضافة مستمعي الأحداث للقائمة
            setupUserMenuListeners();
        }
    }

    /**
     * الحصول على لون الصورة الرمزية للمستخدم
     * @param {string} userId - معرف المستخدم
     * @returns {string} - كود اللون
     */
    function getUserAvatarColor(userId) {
        // مجموعة ألوان متناسقة
        const colors = [
            '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#1abc9c',
            '#f1c40f', '#e67e22', '#34495e', '#16a085', '#d35400'
        ];

        // استخدام المعرف لاختيار لون ثابت
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }

        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

    /**
     * إضافة مستمعي الأحداث لقائمة المستخدم
     */
    function setupUserMenuListeners() {
        // تبديل القائمة المنسدلة
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
            dropdownToggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const dropdown = this.closest('.dropdown');
                if (dropdown) {
                    dropdown.classList.toggle('active');
                }
            });
        }

        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.dropdown')) {
                const activeDropdowns = document.querySelectorAll('.dropdown.active');
                activeDropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });

        // تأثير الموجة عند النقر
        const rippleItems = document.querySelectorAll('.ripple-effect');
        rippleItems.forEach(item => {
            item.addEventListener('click', createRippleEffect);
        });

        // الملف الشخصي
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', function (e) {
                e.preventDefault();
                showProfileModal();
            });
        }

        // تغيير كلمة المرور
        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', function (e) {
                e.preventDefault();
                showChangePasswordModal();
            });
        }

        // الإعدادات
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function (e) {
                e.preventDefault();

                // التنقل إلى صفحة الإعدادات
                const settingsLink = document.querySelector('a[data-page="settings"]');
                if (settingsLink) {
                    settingsLink.click();
                }
            });
        }

        // المساعدة
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', function (e) {
                e.preventDefault();
                showHelpModal();
            });
        }

        // تسجيل الخروج
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();

                // تأكيد تسجيل الخروج
                showConfirmationModal(
                    'تسجيل الخروج',
                    'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
                    function () {
                        logout()
                            .then(() => {
                                showNotification('تم تسجيل الخروج بنجاح', 'success');
                            })
                            .catch(error => {
                                console.error('خطأ في تسجيل الخروج:', error);
                                showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
                            });
                    }
                );
            });
        }
    }

    /**
     * تأثير الموجة عند النقر على العناصر
     * @param {Event} e - حدث النقر
     */
    function createRippleEffect(e) {
        const button = e.currentTarget;

        // إنشاء عنصر الموجة
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        button.appendChild(ripple);

        // الحصول على موقع النقر
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        // تعيين حجم وموقع الموجة
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - (size / 2)}px`;
        ripple.style.top = `${e.clientY - rect.top - (size / 2)}px`;

        // إزالة الموجة بعد اكتمال التأثير
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * عرض نافذة الملف الشخصي
     */
    function showProfileModal() {
        if (!currentUser) return;

        // إنشاء محتوى النافذة
        const content = `
        <div class="modal-header">
            <h3 class="modal-title">الملف الشخصي</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="profile-avatar">
                <div class="avatar-circle" data-initials="${currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}" style="background-color: ${getUserAvatarColor(currentUser.uid)}">
                    ${currentUser.photoURL ? `<img src="${currentUser.photoURL}" alt="${currentUser.displayName || currentUser.email}">` : ''}
                </div>
                <div class="profile-info">
                    <h3>${currentUser.displayName || 'المستخدم'}</h3>
                    <div class="user-type-badge ${currentUser.type}">${getUserTypeLabel(currentUser.type)}</div>
                </div>
            </div>
            
            <form id="profile-form">
                <div class="form-group">
                    <label class="form-label">البريد الإلكتروني</label>
                    <div class="input-icon-group">
                        <i class="fas fa-envelope"></i>
                        <input type="email" class="form-input" value="${currentUser.email}" readonly>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">الاسم الكامل</label>
                    <div class="input-icon-group">
                        <i class="fas fa-user"></i>
                        <input type="text" class="form-input" id="profile-fullname" value="${currentUser.displayName || ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">آخر تسجيل دخول</label>
                    <div class="input-icon-group">
                        <i class="fas fa-calendar-check"></i>
                        <input type="text" class="form-input" value="${new Date(currentUser.metadata?.lastLogin || Date.now()).toLocaleString()}" readonly>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">تاريخ إنشاء الحساب</label>
                    <div class="input-icon-group">
                        <i class="fas fa-calendar-alt"></i>
                        <input type="text" class="form-input" value="${new Date(currentUser.metadata?.createdAt || Date.now()).toLocaleString()}" readonly>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline ripple-effect modal-close-btn">إلغاء</button>
            <button class="btn btn-primary ripple-effect" id="save-profile-btn">حفظ التغييرات</button>
        </div>
    `;

        // عرض النافذة
        showModal('profile-modal', content, function (modal) {
            // مستمع حدث حفظ الملف الشخصي
            const saveProfileBtn = modal.querySelector('#save-profile-btn');
            if (saveProfileBtn) {
                saveProfileBtn.addEventListener('click', function () {
                    const fullNameInput = document.getElementById('profile-fullname');

                    if (!fullNameInput) {
                        showNotification('خطأ في النموذج: حقل الاسم غير موجود', 'error');
                        return;
                    }

                    const fullName = fullNameInput.value.trim();

                    if (!fullName) {
                        showNotification('يرجى إدخال الاسم الكامل', 'error');
                        return;
                    }

                    // تغيير حالة الزر
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
                    this.disabled = true;

                    // تحديث بيانات المستخدم
                    updateUserData(currentUser.uid, { fullName })
                        .then(() => {
                            // تحديث اسم العرض
                            if (firebase.apps.length > 0 && firebase.auth().currentUser) {
                                return firebase.auth().currentUser.updateProfile({
                                    displayName: fullName
                                });
                            }
                            return Promise.resolve();
                        })
                        .then(() => {
                            // تحديث المتغير المحلي
                            currentUser.displayName = fullName;

                            // تحديث بيانات المستخدم في التخزين المحلي
                            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));

                            // تحديث واجهة المستخدم
                            updateUserInfo();

                            showNotification('تم تحديث الملف الشخصي بنجاح', 'success');

                            // إغلاق النافذة
                            closeModal('profile-modal');
                        })
                        .catch(error => {
                            console.error('خطأ في تحديث الملف الشخصي:', error);
                            showNotification('حدث خطأ أثناء تحديث الملف الشخصي', 'error');
                        })
                        .finally(() => {
                            // إعادة حالة الزر
                            this.innerHTML = originalText;
                            this.disabled = false;
                        });
                });
            }
        });
    }

    /**
     * عرض نافذة تغيير كلمة المرور
     */
    function showChangePasswordModal() {
        if (!currentUser) return;

        // إنشاء محتوى النافذة
        const content = `
        <div class="modal-header">
            <h3 class="modal-title">تغيير كلمة المرور</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <form id="change-password-form">
                <div class="form-group">
                    <label class="form-label">كلمة المرور الحالية</label>
                    <div class="input-icon-group">
                        <i class="fas fa-lock"></i>
                        <div class="password-input-container">
                            <input type="password" class="form-input" id="current-password" required>
                            <button type="button" class="toggle-password">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">كلمة المرور الجديدة</label>
                    <div class="input-icon-group">
                        <i class="fas fa-lock"></i>
                        <div class="password-input-container">
                            <input type="password" class="form-input" id="new-password" required>
                            <button type="button" class="toggle-password">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">تأكيد كلمة المرور الجديدة</label>
                    <div class="input-icon-group">
                        <i class="fas fa-lock"></i>
                        <div class="password-input-container">
                            <input type="password" class="form-input" id="confirm-new-password" required>
                            <button type="button" class="toggle-password">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="password-strength-meter">
                    <div class="password-meter-bar"></div>
                    <div class="password-meter-text"></div>
                </div>
                
                <div class="password-requirements">
                    <p>كلمة المرور يجب أن تحتوي على:</p>
                    <ul>
                        <li id="req-length"><i class="fas fa-circle"></i> 8 أحرف على الأقل</li>
                        <li id="req-uppercase"><i class="fas fa-circle"></i> حرف كبير واحد على الأقل</li>
                        <li id="req-lowercase"><i class="fas fa-circle"></i> حرف صغير واحد على الأقل</li>
                        <li id="req-number"><i class="fas fa-circle"></i> رقم واحد على الأقل</li>
                        <li id="req-special"><i class="fas fa-circle"></i> رمز خاص واحد على الأقل (@$!%*?&)</li>
                    </ul>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline ripple-effect modal-close-btn">إلغاء</button>
            <button class="btn btn-primary ripple-effect" id="save-password-btn">تغيير كلمة المرور</button>
        </div>
    `;
}

        // عرض النافذة
        showModal('change-password-modal', content, function (modal) {
            // إضافة مستمعي أحداث لأزرار إظهار/إخفاء كلمة المرور
            const togglePasswordButtons = modal.querySelectorAll('.toggle-password');
            togglePasswordButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const passwordInput = this.parentElement.querySelector('input');
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        this.querySelector('i').classList.remove('fa-eye');
                        this.querySelector('i').classList.add('fa-eye-slash');
                    } else {
                        passwordInput.type = 'password';
                        this.querySelector('i').classList.remove('fa-eye-slash');
                        this.querySelector('i').classList.add('fa-eye');
                    }
                });
            });

            // إضافة مستمعي أحداث لقياس قوة كلمة المرور 
            const newPasswordInput = document.getElementById('new-password');
            if (newPasswordInput) {
                newPasswordInput.addEventListener('input', function () {
                    updatePasswordStrength(this.value);
                });
            }

            // مستمع حدث حفظ كلمة المرور 
            const savePasswordBtn = modal.querySelector('#save-password-btn');
            if (savePasswordBtn) {
                savePasswordBtn.addEventListener('click', function () {
                    const currentPasswordInput = document.getElementById('current-password');
                    const newPasswordInput = document.getElementById('new-password');
                    const confirmNewPasswordInput = document.getElementById('confirm-new-password');

                    if (!currentPasswordInput || !newPasswordInput || !confirmNewPasswordInput) {
                        showNotification('خطأ في النموذج: بعض الحقول المطلوبة غير موجودة', 'error');
                        return;
                    }

                    const currentPassword = currentPasswordInput.value;
                    const newPassword = newPasswordInput.value;
                    const confirmNewPassword = confirmNewPasswordInput.value;

                    if (!currentPassword || !newPassword || !confirmNewPassword) {
                        showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
                        return;
                    }

                    if (newPassword.length < 8) {
                        showNotification('يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل', 'error');
                        return;
                    }

                    if (newPassword !== confirmNewPassword) {
                        showNotification('كلمة المرور الجديدة وتأكيدها غير متطابقين', 'error');
                        return;
                    }

                    // التحقق من قوة كلمة المرور
                    const strength = calculatePasswordStrength(newPassword);
                    if (strength < 50) {
                        showNotification('كلمة المرور ضعيفة جداً. يرجى اختيار كلمة مرور أقوى', 'error');
                        return;
                    }

                    // تغيير حالة الزر
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تغيير كلمة المرور...';
                    this.disabled = true;

                    // تغيير كلمة المرور
                    changePassword(currentPassword, newPassword)
                        .then(() => {
                            showNotification('تم تغيير كلمة المرور بنجاح', 'success');

                            // إغلاق النافذة
                            closeModal('change-password-modal');

                            // إذا كنا في وضع التخزين المحلي بدون Firebase، نقوم بتسجيل الخروج
                            if (firebase.apps.length === 0) {
                                showNotification('يرجى إعادة تسجيل الدخول باستخدام كلمة المرور الجديدة', 'info');
                                setTimeout(() => {
                                    logout();
                                }, 3000);
                            }
                        })

                        
                        .catch(error => {
                            console.error('خطأ في تغيير كلمة المرور:', error);

                            let errorMessage = 'حدث خطأ أثناء تغيير كلمة المرور';

                            if (error.code === 'auth/wrong-password') {
                                errorMessage = 'كلمة المرور الحالية غير صحيحة';
                            } else if (error.code === 'auth/weak-password') {
                                errorMessage = 'كلمة المرور الجديدة ضعيفة جداً';
                            } else if (error.message) {
                                errorMessage = error.message;
                            }

                            showNotification(errorMessage, 'error');
                        })
                        .finally(() => {
                            // إعادة حالة الزر
                            this.innerHTML = originalText;
                            this.disabled = false;
                        });
                });
            }
            
        
            /**
             * تحديث مؤشر قوة كلمة المرور
             * @param {string} password - كلمة المرور
             */
            function updatePasswordStrength(password) {
                const meterBar = document.querySelector('.password-meter-bar');
                const meterText = document.querySelector('.password-meter-text');

                if (!meterBar || !meterText) return;

                // حساب قوة كلمة المرور
                const strength = calculatePasswordStrength(password);

                // تحديث شريط القوة
                meterBar.style.width = `${strength}%`;

                // تحديد لون ونص القوة
                let strengthText = '';
                let strengthColor = '';

                if (strength < 30) {
                    strengthText = 'ضعيفة جداً';
                    strengthColor = '#e74c3c';
                } else if (strength < 50) {
                    strengthText = 'ضعيفة';
                    strengthColor = '#e67e22';
                } else if (strength < 70) {
                    strengthText = 'متوسطة';
                    strengthColor = '#f1c40f';
                } else if (strength < 90) {
                    strengthText = 'قوية';
                    strengthColor = '#2ecc71';
                } else {
                    strengthText = 'قوية جداً';
                    strengthColor = '#27ae60';
                }

                meterBar.style.backgroundColor = strengthColor;
                meterText.textContent = strengthText;

                // تحديث قائمة المتطلبات
                updatePasswordRequirements(password);
            }

            /**
             * حساب قوة كلمة المرور
             * @param {string} password - كلمة المرور
             * @returns {number} - قوة كلمة المرور (0-100)
             */
            function calculatePasswordStrength(password) {
                if (!password) return 0;

                // العوامل المؤثرة في قوة كلمة المرور
                const factors = {
                    length: 0,   // طول كلمة المرور
                    uppercase: 0, // وجود حروف كبيرة
                    lowercase: 0, // وجود حروف صغيرة
                    numbers: 0,   // وجود أرقام
                    symbols: 0,   // وجود رموز خاصة
                    middle: 0,    // وجود أرقام ورموز في الوسط
                    requirements: 0, // تلبية المتطلبات الأساسية
                    composition: 0   // تنوع التركيب
                };

                // معاملات الوزن
                const weights = {
                    length: 30,
                    uppercase: 10,
                    lowercase: 10,
                    numbers: 10,
                    symbols: 15,
                    middle: 5,
                    requirements: 15,
                    composition: 5
                };

                // حساب طول كلمة المرور (بحد أقصى 30 نقطة)
                factors.length = Math.min(password.length / 12, 1) * weights.length;

                // التحقق من وجود حروف كبيرة وصغيرة
                if (/[A-Z]/.test(password)) factors.uppercase = weights.uppercase;
                if (/[a-z]/.test(password)) factors.lowercase = weights.lowercase;

                // التحقق من وجود أرقام ورموز
                if (/[0-9]/.test(password)) factors.numbers = weights.numbers;
                if (/[^A-Za-z0-9]/.test(password)) factors.symbols = weights.symbols;

                // التحقق من وجود أرقام ورموز في الوسط
                if (password.length > 2) {
                    const middleChars = password.substring(1, password.length - 1);
                    if (/[0-9]/.test(middleChars) || /[^A-Za-z0-9]/.test(middleChars)) {
                        factors.middle = weights.middle;
                    }
                }

                // التحقق من تلبية المتطلبات الأساسية
                let reqCount = 0;
                if (password.length >= 8) reqCount++;
                if (/[A-Z]/.test(password)) reqCount++;
                if (/[a-z]/.test(password)) reqCount++;
                if (/[0-9]/.test(password)) reqCount++;
                if (/[^A-Za-z0-9]/.test(password)) reqCount++;

                factors.requirements = (reqCount / A) * weights.requirements;

                // التحقق من تنوع التركيب
                const uniqueChars = new Set(password.split('')).size;
                factors.composition = (uniqueChars / password.length) * weights.composition;

                // حساب القوة الإجمالية
                const totalStrength = Object.values(factors).reduce((sum, value) => sum + value, 0);

                return Math.min(100, totalStrength);
            }

            /**
             * تحديث قائمة متطلبات كلمة المرور
             * @param {string} password - كلمة المرور
             */
            function updatePasswordRequirements(password) {
                // التحقق من الطول
                const reqLength = document.getElementById('req-length');
                if (reqLength) {
                    if (password.length >= 8) {
                        reqLength.classList.add('met');
                        reqLength.querySelector('i').className = 'fas fa-check-circle';
                    } else {
                        reqLength.classList.remove('met');
                        reqLength.querySelector('i').className = 'fas fa-circle';
                    }
                }

                // التحقق من وجود حروف كبيرة
                const reqUppercase = document.getElementById('req-uppercase');
                if (reqUppercase) {
                    if (/[A-Z]/.test(password)) {
                        reqUppercase.classList.add('met');
                        reqUppercase.querySelector('i').className = 'fas fa-check-circle';
                    } else {
                        reqUppercase.classList.remove('met');
                        reqUppercase.querySelector('i').className = 'fas fa-circle';
                    }
                }

                // التحقق من وجود حروف صغيرة
                const reqLowercase = document.getElementById('req-lowercase');
                if (reqLowercase) {
                    if (/[a-z]/.test(password)) {
                        reqLowercase.classList.add('met');
                        reqLowercase.querySelector('i').className = 'fas fa-check-circle';
                    } else {
                        reqLowercase.classList.remove('met');
                        reqLowercase.querySelector('i').className = 'fas fa-circle';
                    }
                }

                // التحقق من وجود أرقام
                const reqNumber = document.getElementById('req-number');
                if (reqNumber) {
                    if (/[0-9]/.test(password)) {
                        reqNumber.classList.add('met');
                        reqNumber.querySelector('i').className = 'fas fa-check-circle';
                    } else {
                        reqNumber.classList.remove('met');
                        reqNumber.querySelector('i').className = 'fas fa-circle';
                    }
                }

                // التحقق من وجود رموز خاصة
                const reqSpecial = document.getElementById('req-special');
                if (reqSpecial) {
                    if (/[^A-Za-z0-9]/.test(password)) {
                        reqSpecial.classList.add('met');
                        reqSpecial.querySelector('i').className = 'fas fa-check-circle';
                    } else {
                        reqSpecial.classList.remove('met');
                        reqSpecial.querySelector('i').className = 'fas fa-circle';
                    }
                }
            }

            /**
             * عرض نافذة المساعدة
             */
            function showHelpModal() {
                const content = `
        <div class="modal-header">
            <h3 class="modal-title">مساعدة النظام</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="help-tabs">
                <div class="help-tab active" data-tab="general">عام</div>
                <div class="help-tab" data-tab="account">الحساب</div>
                <div class="help-tab" data-tab="security">الأمان</div>
                <div class="help-tab" data-tab="about">حول</div>
            </div>
            
            <div class="help-content active" id="general-help">
                <h4>معلومات عامة</h4>
                <p>مرحباً بك في نظام الاستثمار المتكامل. هذا النظام يوفر لك إمكانية إدارة المستثمرين والعمليات الاستثمارية بكل سهولة.</p>
                
                <h5>الميزات الرئيسية</h5>
                <ul>
                    <li>إدارة حسابات المستثمرين</li>
                    <li>متابعة العمليات المالية (إيداع، سحب، أرباح)</li>
                    <li>حساب الأرباح تلقائياً</li>
                    <li>إنشاء تقارير متنوعة</li>
                    <li>إدارة متعددة المستخدمين مع صلاحيات مختلفة</li>
                </ul>
            </div>
            
            <div class="help-content" id="account-help">
                <h4>إدارة الحساب</h4>
                <p>يمكنك تعديل بيانات حسابك الشخصي وتغيير كلمة المرور من خلال قائمة المستخدم.</p>
                
                <h5>تغيير كلمة المرور</h5>
                <ol>
                    <li>انقر على اسم المستخدم في الشريط العلوي</li>
                    <li>اختر "تغيير كلمة المرور" من القائمة</li>
                    <li>أدخل كلمة المرور الحالية وكلمة المرور الجديدة</li>
                    <li>انقر على "حفظ" لتأكيد التغيير</li>
                </ol>
                
                <h5>تحديث الملف الشخصي</h5>
                <ol>
                    <li>انقر على اسم المستخدم في الشريط العلوي</li>
                    <li>اختر "الملف الشخصي" من القائمة</li>
                    <li>قم بتعديل البيانات المطلوبة</li>
                    <li>انقر على "حفظ التغييرات" للتأكيد</li>
                </ol>
            </div>
            
            <div class="help-content" id="security-help">
                <h4>الأمان والخصوصية</h4>
                <p>نظام الاستثمار المتكامل يستخدم أحدث تقنيات الأمان لحماية بياناتك وخصوصيتك.</p>
                
                <h5>نصائح للحفاظ على أمان حسابك</h5>
                <ul>
                    <li>استخدم كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز</li>
                    <li>قم بتغيير كلمة المرور بشكل دوري</li>
                    <li>لا تشارك بيانات حسابك مع أحد</li>
                    <li>تأكد من تسجيل الخروج بعد الانتهاء من استخدام النظام</li>
                    <li>لا تترك جهازك دون مراقبة أثناء تسجيل الدخول</li>
                </ul>
            </div>
            
            <div class="help-content" id="about-help">
                <h4>حول النظام</h4>
                <div class="about-logo">
                    <i class="fas fa-chart-line"></i>
                    <h3>نظام الاستثمار المتكامل</h3>
                </div>
                
                <div class="about-info">
                    <p><strong>الإصدار:</strong> ${AUTH_SYSTEM_VERSION}</p>
                    <p><strong>آخر تحديث:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>المطور:</strong> فريق تطوير الأنظمة المالية</p>
                </div>
                
                <p class="about-copyright">جميع الحقوق محفوظة &copy; ${new Date().getFullYear()}</p>
            </div>
        </div>
    `;

                showModal('help-modal', content, function (modal) {
                    // مستمعي الأحداث لتبويبات المساعدة
                    const helpTabs = modal.querySelectorAll('.help-tab');
                    helpTabs.forEach(tab => {
                        tab.addEventListener('click', function () {
                            // إزالة الفئة النشطة من جميع التبويبات
                            helpTabs.forEach(t => t.classList.remove('active'));

                            // إضافة الفئة النشطة للتبويب المحدد
                            this.classList.add('active');

                            // إخفاء جميع محتويات التبويبات
                            const helpContents = modal.querySelectorAll('.help-content');
                            helpContents.forEach(content => content.classList.remove('active'));

                            // إظهار محتوى التبويب المحدد
                            const tabName = this.getAttribute('data-tab');
                            const selectedContent = document.getElementById(`${tabName}-help`);
                            if (selectedContent) {
                                selectedContent.classList.add('active');
                            }
                        });
                    });
                });
            }

            /**
             * عرض نافذة تأكيد
             * @param {string} title - عنوان النافذة
             * @param {string} message - رسالة التأكيد
             * @param {Function} onConfirm - الدالة التي تنفذ عند التأكيد
             * @param {Function} onCancel - الدالة التي تنفذ عند الإلغاء
             */
            function showConfirmationModal(title, message, onConfirm, onCancel) {
                const content = `
        <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="confirmation-message">
                <i class="fas fa-question-circle"></i>
                <p>${message}</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline ripple-effect modal-close-btn" id="cancel-btn">إلغاء</button>
            <button class="btn btn-danger ripple-effect" id="confirm-btn">تأكيد</button>
        </div>
    `;

                const modalId = 'confirmation-modal';
                showModal(modalId, content, function (modal) {
                    // مستمع حدث زر التأكيد
                    const confirmBtn = modal.querySelector('#confirm-btn');
                    if (confirmBtn) {
                        confirmBtn.addEventListener('click', function () {
                            if (typeof onConfirm === 'function') {
                                onConfirm();
                            }
                            closeModal(modalId);
                        });
                    }

                    // مستمع حدث زر الإلغاء
                    const cancelBtn = modal.querySelector('#cancel-btn');
                    if (cancelBtn) {
                        cancelBtn.addEventListener('click', function () {
                            if (typeof onCancel === 'function') {
                                onCancel();
                            }
                            closeModal(modalId);
                        });
                    }
                });
            }

            /**
             * عرض نافذة منبثقة مخصصة
             * @param {string} modalId - معرف النافذة
             * @param {string} content - محتوى النافذة
             * @param {Function} onRendered - دالة تنفذ بعد إضافة النافذة للصفحة
             * @returns {HTMLElement} - عنصر النافذة
             */
            function showModal(modalId, content, onRendered) {
                // إنشاء عنصر النافذة
                const modalOverlay = document.createElement('div');
                modalOverlay.className = 'modal-overlay';
                modalOverlay.id = modalId;

                // إضافة المحتوى
                const modalContent = document.createElement('div');
                modalContent.className = 'modal animate__animated animate__fadeInDown';
                modalContent.innerHTML = content;

                modalOverlay.appendChild(modalContent);

                // إضافة النافذة للصفحة
                document.body.appendChild(modalOverlay);

                // إظهار النافذة
                setTimeout(() => {
                    modalOverlay.classList.add('active');
                }, 10);

                // إضافة مستمعي الأحداث للأزرار
                setupModalListeners(modalOverlay);

                // تنفيذ الدالة بعد إضافة النافذة
                if (typeof onRendered === 'function') {
                    onRendered(modalOverlay);
                }

                return modalOverlay;
            }

            /**
             * إضافة مستمعي الأحداث للنافذة
             * @param {HTMLElement} modalElement - عنصر النافذة
             */
            function setupModalListeners(modalElement) {
                // أزرار الإغلاق
                const closeButtons = modalElement.querySelectorAll('.modal-close, .modal-close-btn');
                closeButtons.forEach(button => {
                    button.addEventListener('click', function () {
                        closeModal(modalElement.id);
                    });
                });

                // إغلاق النافذة عند النقر خارجها
                modalElement.addEventListener('click', function (e) {
                    if (e.target === modalElement) {
                        closeModal(modalElement.id);
                    }
                });

                // إضافة تأثير الموجة لجميع الأزرار
                const rippleButtons = modalElement.querySelectorAll('.ripple-effect');
                rippleButtons.forEach(button => {
                    button.addEventListener('click', createRippleEffect);
                });

                // إضافة مستمعي أحداث لأزرار إظهار/إخفاء كلمة المرور
                const togglePasswordButtons = modalElement.querySelectorAll('.toggle-password');
                togglePasswordButtons.forEach(button => {
                    button.addEventListener('click', function () {
                        const passwordInput = this.parentElement.querySelector('input');
                        if (passwordInput) {
                            if (passwordInput.type === 'password') {
                                passwordInput.type = 'text';
                                this.querySelector('i').classList.remove('fa-eye');
                                this.querySelector('i').classList.add('fa-eye-slash');
                            } else {
                                passwordInput.type = 'password';
                                this.querySelector('i').classList.remove('fa-eye-slash');
                                this.querySelector('i').classList.add('fa-eye');
                            }
                        }
                    });
                });
            }

            /**
             * تحديث وصول العناصر بناءً على الصلاحيات
             */
            function updateElementsAccess() {
                if (!currentUser) return;

                console.log('تحديث وصول العناصر حسب الصلاحيات...');

                // إخفاء العناصر التي لا يملك المستخدم صلاحية الوصول إليها

                // إدارة المستخدمين
                const userManagementElements = document.querySelectorAll('.user-management, [data-permission="canCreateUsers"]');
                userManagementElements.forEach(element => {
                    if (currentUser.permissions.canCreateUsers) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });

                // إدارة الإعدادات
                const settingsElements = document.querySelectorAll('.settings-management, [data-permission="canManageSettings"]');
                settingsElements.forEach(element => {
                    if (currentUser.permissions.canManageSettings) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });

                // حذف المستثمرين
                const deleteInvestorsElements = document.querySelectorAll('.delete-investor, [data-permission="canDeleteInvestors"]');
                deleteInvestorsElements.forEach(element => {
                    if (currentUser.permissions.canDeleteInvestors) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });

                // تصدير البيانات
                const exportDataElements = document.querySelectorAll('.export-data, [data-permission="canExportData"]');
                exportDataElements.forEach(element => {
                    if (currentUser.permissions.canExportData) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });

                // استيراد البيانات
                const importDataElements = document.querySelectorAll('.import-data, [data-permission="canImportData"]');
                importDataElements.forEach(element => {
                    if (currentUser.permissions.canImportData) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });

                // إنشاء نسخة احتياطية
                const createBackupElements = document.querySelectorAll('.create-backup, [data-permission="canCreateBackup"]');
                createBackupElements.forEach(element => {
                    if (currentUser.permissions.canCreateBackup) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });

                // استعادة نسخة احتياطية
                const restoreBackupElements = document.querySelectorAll('.restore-backup, [data-permission="canRestoreBackup"]');
                restoreBackupElements.forEach(element => {
                    if (currentUser.permissions.canRestoreBackup) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });

                // إضافة فئة نوع المستخدم للجسم
                document.body.setAttribute('data-user-type', currentUser.type);

                // تطبيق الأنماط CSS الديناميكية
                applyDynamicStyles();
            }

            /**
             * تطبيق الأنماط CSS الديناميكية
             */
            function applyDynamicStyles() {
                // التحقق من وجود عنصر النمط
                let styleElement = document.getElementById('auth-dynamic-styles');

                // إنشاء عنصر النمط إذا لم يكن موجوداً
                if (!styleElement) {
                    styleElement = document.createElement('style');
                    styleElement.id = 'auth-dynamic-styles';
                    document.head.appendChild(styleElement);
                }

                // تحديد الأنماط بناءً على نوع المستخدم
                styleElement.textContent = `
        /* إخفاء العناصر للمستخدمين غير المصرح لهم */
        .hidden {
            display: none !important;
        }
        
        /* أنماط خاصة بنوع المستخدم */
        body[data-user-type="${USER_TYPES.USER}"] .admin-only,
        body[data-user-type="${USER_TYPES.USER}"] .manager-only {
            display: none !important;
        }
        
        body[data-user-type="${USER_TYPES.MANAGER}"] .admin-only {
            display: none !important;
        }
        
        /* أيقونة تغير لون بناءً على نوع المستخدم */
        .user-avatar {
            background-color: var(--primary-color);
        }
        
        body[data-user-type="${USER_TYPES.ADMIN}"] .user-avatar {
            background-color: var(--danger-color);
        }
        
        body[data-user-type="${USER_TYPES.MANAGER}"] .user-avatar {
            background-color: var(--warning-color);
        }
        
        /* تطبيق فلاتر لتقييد الوصول */
        body:not([data-user-type="${USER_TYPES.ADMIN}"]) .admin-access-table tr td:last-child .delete-action {
            opacity: 0.5;
            pointer-events: none;
            cursor: not-allowed;
        }
        
        body:not([data-user-type="${USER_TYPES.ADMIN}"]):not([data-user-type="${USER_TYPES.MANAGER}"]) .manager-access-table tr td:last-child .edit-action {
            opacity: 0.5;
            pointer-events: none;
            cursor: not-allowed;
        }
    `;
            }
            /**
             * عرض شاشة القفل
             */
            function showLockScreen() {
                console.log('عرض شاشة القفل...');

                if (!currentUser) {
                    // إذا لم يكن هناك مستخدم، نعرض شاشة تسجيل الدخول بدلاً من شاشة القفل
                    showLoginScreen();
                    return;
                }

                // التحقق من وجود شاشة القفل
                let lockScreen = document.getElementById('auth-lock-screen');

                if (!lockScreen) {
                    // إنشاء شاشة القفل إذا لم تكن موجودة
                    lockScreen = document.createElement('div');
                    lockScreen.id = 'auth-lock-screen';
                    lockScreen.className = 'auth-screen';

                    // إضافة محتوى الشاشة
                    lockScreen.innerHTML = `
            <div class="auth-container">
                <div class="auth-logo animated bounce">
                    <i class="fas fa-lock"></i>
                    <span>شاشة مقفلة</span>
                </div>
                
                <div class="lock-screen-user">
                    <div class="avatar-circle large" data-initials="${currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}" style="background-color: ${getUserAvatarColor(currentUser.uid)}">
                        ${currentUser.photoURL ? `<img src="${currentUser.photoURL}" alt="${currentUser.displayName || currentUser.email}">` : ''}
                    </div>
                    <h2>${currentUser.displayName || currentUser.email}</h2>
                    <p>${currentUser.email}</p>
                </div>
                
                <form id="unlock-form">
                    <div class="form-group">
                        <label class="form-label">كلمة المرور</label>
                        <div class="input-icon-group">
                            <i class="fas fa-lock"></i>
                            <div class="password-input-container">
                                <input type="password" class="form-input" id="unlock-password" placeholder="أدخل كلمة المرور للمتابعة" required autofocus>
                                <button type="button" class="toggle-password">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group form-actions">
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-unlock-alt"></i>
                            <span>فتح القفل</span>
                        </button>
                    </div>
                </form>
                
                <div class="lock-screen-actions">
                    <button class="btn btn-icon" id="logout-from-lock">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
                
                <div class="auth-footer">
                    <p>نظام الاستثمار المتكامل &copy; ${new Date().getFullYear()}</p>
                    <div class="version-info">الإصدار ${AUTH_SYSTEM_VERSION}</div>
                </div>
            </div>
            
            <div class="auth-particles" id="lock-screen-particles"></div>
        `;

                    // إضافة شاشة القفل للصفحة
                    document.body.appendChild(lockScreen);

                    // إضافة مستمعي الأحداث لشاشة القفل
                    setupLockScreenListeners();

                    // تفعيل تأثير الجزيئات في الخلفية إذا كانت مكتبة particles.js متاحة
                    if (window.particlesJS) {
                        particlesJS('lock-screen-particles', {
                            particles: {
                                number: { value: 50, density: { enable: true, value_area: 800 } },
                                color: { value: '#e74c3c' },
                                shape: { type: 'circle' },
                                opacity: { value: 0.5, random: false },
                                size: { value: 3, random: true },
                                line_linked: {
                                    enable: true,
                                    distance: 150,
                                    color: '#e74c3c',
                                    opacity: 0.4,
                                    width: 1
                                },
                                move: {
                                    enable: true,
                                    speed: 2,
                                    direction: 'none',
                                    random: false,
                                    straight: false,
                                    out_mode: 'out',
                                    bounce: false
                                }
                            },
                            interactivity: {
                                detect_on: 'canvas',
                                events: {
                                    onhover: { enable: true, mode: 'grab' },
                                    onclick: { enable: true, mode: 'push' },
                                    resize: true
                                },
                                modes: {
                                    grab: { distance: 140, line_linked: { opacity: 1 } },
                                    push: { particles_nb: 4 }
                                }
                            },
                            retina_detect: true
                        });
                    }
                } else {
                    // إظهار شاشة القفل إذا كانت موجودة
                    lockScreen.style.display = 'flex';
                }

                // إخفاء المحتوى الرئيسي
                const appContent = document.querySelector('.layout, #main-content');
                if (appContent) {
                    appContent.style.display = 'none';
                }
            }

            /**
             * إضافة مستمعي الأحداث لشاشة القفل
             */
            function setupLockScreenListeners() {
                // نموذج فتح القفل
                const unlockForm = document.getElementById('unlock-form');
                if (unlockForm) {
                    unlockForm.addEventListener('submit', function (e) {
                        e.preventDefault();

                        const passwordInput = document.getElementById('unlock-password');

                        if (!passwordInput) {
                            showAuthNotification('خطأ في النموذج: حقل كلمة المرور غير موجود', 'error');
                            return;
                        }

                        const password = passwordInput.value;

                        if (!password) {
                            showAuthNotification('يرجى إدخال كلمة المرور', 'error');
                            return;
                        }

                        // تغيير حالة الزر
                        const submitButton = this.querySelector('button[type="submit"]');
                        const originalText = submitButton.innerHTML;
                        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
                        submitButton.disabled = true;

                        // التحقق من كلمة المرور
                        if (firebase.apps.length > 0) {
                            // إعادة المصادقة في وضع Firebase
                            const user = firebase.auth().currentUser;
                            if (user) {
                                const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, password);
                                user.reauthenticateWithCredential(credential)
                                    .then(() => {
                                        // إخفاء شاشة القفل
                                        hideLockScreen();

                                        // مسح حقل كلمة المرور
                                        passwordInput.value = '';

                                        // تجديد الجلسة
                                        refreshUserSession();
                                    })
                                    .catch(error => {
                                        console.error('خطأ في إلغاء القفل:', error);

                                        let errorMessage = 'كلمة المرور غير صحيحة';

                                        if (error.code === 'auth/wrong-password') {
                                            errorMessage = 'كلمة المرور غير صحيحة';
                                        } else if (error.code === 'auth/too-many-requests') {
                                            errorMessage = 'تم تجاوز عدد المحاولات، يرجى المحاولة لاحقاً';
                                        } else if (error.message) {
                                            errorMessage = error.message;
                                        }

                                        showAuthNotification(errorMessage, 'error');
                                    })
                                    .finally(() => {
                                        // إعادة حالة الزر
                                        submitButton.innerHTML = originalText;
                                        submitButton.disabled = false;
                                    });
                            } else {
                                // إذا لم يكن هناك مستخدم، نعرض شاشة تسجيل الدخول
                                logout();
                            }
                        } else {
                            // التحقق من كلمة المرور في وضع التخزين المحلي
                            const localUsers = JSON.parse(localStorage.getItem('local_users') || '{}');
                            const user = localUsers[currentUser.email];

                            if (user && verifyPassword(password, user.password)) {
                                // إخفاء شاشة القفل
                                hideLockScreen();

                                // مسح حقل كلمة المرور
                                passwordInput.value = '';

                                // تجديد الجلسة
                                refreshUserSession();
                            } else {
                                showAuthNotification('كلمة المرور غير صحيحة', 'error');

                                // إعادة حالة الزر
                                submitButton.innerHTML = originalText;
                                submitButton.disabled = false;
                            }
                        }
                    });
                }

                // زر إظهار/إخفاء كلمة المرور
                const togglePasswordButton = document.querySelector('#auth-lock-screen .toggle-password');
                if (togglePasswordButton) {
                    togglePasswordButton.addEventListener('click', function () {
                        const passwordInput = document.getElementById('unlock-password');
                        if (passwordInput) {
                            if (passwordInput.type === 'password') {
                                passwordInput.type = 'text';
                                this.querySelector('i').classList.remove('fa-eye');
                                this.querySelector('i').classList.add('fa-eye-slash');
                            } else {
                                passwordInput.type = 'password';
                                this.querySelector('i').classList.remove('fa-eye-slash');
                                this.querySelector('i').classList.add('fa-eye');
                            }
                        }
                    });
                }

                // زر تسجيل الخروج
                const logoutBtn = document.getElementById('logout-from-lock');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', function () {
                        logout()
                            .then(() => {
                                showNotification('تم تسجيل الخروج بنجاح', 'success');
                            })
                            .catch(error => {
                                console.error('خطأ في تسجيل الخروج:', error);
                                showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
                            });
                    });
                }
            }

            /**
             * إخفاء شاشة القفل
             */
            function hideLockScreen() {
                const lockScreen = document.getElementById('auth-lock-screen');
                if (lockScreen) {
                    // إضافة فئة للتأثير المتحرك
                    lockScreen.classList.add('fade-out');

                    // إزالة العنصر بعد اكتمال التأثير المتحرك
                    setTimeout(() => {
                        lockScreen.style.display = 'none';
                        lockScreen.classList.remove('fade-out');
                    }, 300);
                }

                // إظهار المحتوى الرئيسي
                const appContent = document.querySelector('.layout, #main-content');
                if (appContent) {
                    appContent.style.display = '';
                }
            }

            /**
             * الحصول على تسمية نوع المستخدم
             * @param {string} userType - نوع المستخدم
             * @returns {string} - تسمية نوع المستخدم
             */
            function getUserTypeLabel(userType) {
                switch (userType) {
                    case USER_TYPES.ADMIN:
                        return 'مسؤول النظام';
                    case USER_TYPES.MANAGER:
                        return 'مدير';
                    case USER_TYPES.USER:
                        return 'مستخدم';
                    default:
                        return 'غير معروف';
                }
            }

            /**
             * عرض إشعار عام في التطبيق
             * @param {string} message - نص الإشعار
             * @param {string} type - نوع الإشعار (success, error, warning, info)
             */
            function showNotification(message, type = 'info') {
                console.log(`إشعار (${type}): ${message}`);

                // منع الاستدعاء المتكرر
                if (window._isShowingNotification) return;
                window._isShowingNotification = true;

                // استخدام دالة عرض الإشعارات الموجودة في التطبيق إذا كانت متاحة
                if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
                    window.showNotification(message, type);
                    window._isShowingNotification = false;
                    return;
                }

                // التحقق من وجود عنصر الإشعار
                let notificationElement = document.getElementById('notification');

                // إنشاء عنصر الإشعار إذا لم يكن موجوداً
                if (!notificationElement) {
                    notificationElement = document.createElement('div');
                    notificationElement.id = 'notification';
                    notificationElement.className = 'notification animate__animated animate__fadeInDown';
                    document.body.appendChild(notificationElement);
                }

                // تحديد الفئة حسب نوع الإشعار
                notificationElement.className = `notification ${type} animate__animated animate__fadeInDown`;

                // إضافة المحتوى
                notificationElement.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${getNotificationIcon(type)}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${getNotificationTitle(type)}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;

                // إظهار الإشعار
                notificationElement.classList.add('show');

                // إغلاق الإشعار بعد فترة
                const timeout = setTimeout(() => {
                    if (notificationElement) {
                        notificationElement.classList.remove('show');
                        notificationElement.classList.add('animate__fadeOutUp');

                        // إزالة العنصر بعد اكتمال التأثير المتحرك
                        setTimeout(() => {
                            if (notificationElement.parentNode) {
                                notificationElement.parentNode.removeChild(notificationElement);
                            }
                            window._isShowingNotification = false;
                        }, 300);
                    }
                }, 5000);

                // إضافة مستمع حدث زر الإغلاق
                const closeButton = notificationElement.querySelector('.notification-close');
                if (closeButton) {
                    closeButton.addEventListener('click', function () {
                        clearTimeout(timeout);
                        notificationElement.classList.remove('show');
                        notificationElement.classList.add('animate__fadeOutUp');

                        // إزالة العنصر بعد اكتمال التأثير المتحرك
                        setTimeout(() => {
                            if (notificationElement.parentNode) {
                                notificationElement.parentNode.removeChild(notificationElement);
                            }
                            window._isShowingNotification = false;
                        }, 300);
                    });
                }
            }

            /**
             * الحصول على عنوان الإشعار
             * @param {string} type - نوع الإشعار
             * @returns {string} - عنوان الإشعار
             */
            function getNotificationTitle(type) {
                switch (type) {
                    case 'success':
                        return 'تمت العملية بنجاح';
                    case 'error':
                        return 'خطأ';
                    case 'warning':
                        return 'تنبيه';
                    case 'info':
                    default:
                        return 'معلومات';
                }
            }

            /**
             * إضافة أنماط CSS لنظام المصادقة
             */
            function addAuthStyles() {
                // التحقق من وجود الأنماط مسبقاً
                if (document.getElementById('auth-styles')) {
                    return;
                }

                // إنشاء عنصر النمط
                const styleElement = document.createElement('style');
                styleElement.id = 'auth-styles';

                // إضافة أنماط CSS
                styleElement.textContent = `
        /* ===== المتغيرات والألوان الرئيسية ===== */
        :root {
            --primary-color: #3b82f6;
            --primary-color-dark: #2563eb;
            --primary-color-light: #60a5fa;
            --secondary-color: #6b7280;
            --success-color: #10b981;
            --danger-color: #ef4444;
            --warning-color: #f59e0b;
            --info-color: #06b6d4;
            --bg-color: #f8fafc;
            --text-color: #1e293b;
            --text-color-light: #64748b;
            --border-color: #e2e8f0;
            --input-bg: #fff;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --radius-sm: 0.25rem;
            --radius-md: 0.5rem;
            --radius-lg: 1rem;
            --font-main: 'Tajawal', sans-serif;
        }
        
        /* ===== شاشة تسجيل الدخول والقفل ===== */
        .auth-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            direction: rtl;
            background: linear-gradient(135deg, #f8fafc, #3b82f6);
            overflow: hidden;
        }
        
        .auth-container {
            width: 100%;
            max-width: 450px;
            background-color: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            padding: 2rem;
            position: relative;
            overflow: hidden;
            z-index: 1;
            transform: translateY(0);
            opacity: 1;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .auth-screen.fade-out .auth-container {
            transform: translateY(20px);
            opacity: 0;
        }
        
        .auth-logo {
            text-align: center;
            margin-bottom: 2rem;
            color: var(--primary-color);
        }
        
        .auth-logo i {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            display: inline-block;
        }
        
        .auth-logo span {
            display: block;
            font-size: 1.5rem;
            font-weight: 700;
        }
        
        .auth-tabs {
            display: flex;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .auth-tab {
            flex: 1;
            padding: 0.75rem;
            text-align: center;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            color: var(--text-color-light);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .auth-tab::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 2px;
            background-color: var(--primary-color);
            transition: width 0.3s ease;
        }
        
        .auth-tab.active {
            color: var(--primary-color);
        }
        
        .auth-tab.active::after {
            width: 100%;
        }
        
        .auth-tab-content {
            display: none;
            animation: fadeIn 0.5s ease;
        }
        
        .auth-tab-content.active {
            display: block;
        }
        
        .auth-footer {
            text-align: center;
            margin-top: 2rem;
            color: var(--text-color-light);
            font-size: 0.9rem;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .version-info {
            font-size: 0.8rem;
            margin-top: 0.5rem;
            opacity: 0.7;
        }
        
        /* ===== الجزيئات ===== */
        .auth-particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
        }
        
        /* ===== نماذج المصادقة ===== */
        .form-group {
            margin-bottom: 1.25rem;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-color);
        }
        
        .input-icon-group {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .input-icon-group i {
            position: absolute;
            right: 1rem;
            color: var(--text-color-light);
            width: 1rem;
            text-align: center;
        }
        
        .form-input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            padding-right: 2.5rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            background-color: var(--input-bg);
            color: var(--text-color);
            font-family: var(--font-main);
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        
        .form-input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        .form-input.error {
            border-color: var(--danger-color);
        }
        
        .form-select {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            padding-right: 2.5rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            background-color: var(--input-bg);
            color: var(--text-color);
            font-family: var(--font-main);
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: left 0.75rem center;
            background-size: 1rem;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        
        .form-select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .form-check {
            display: flex;
            align-items: center;
        }
        
        .form-check input[type="checkbox"] {
            margin-left: 0.5rem;
        }
        
        .form-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1.5rem;
        }
        
        .form-actions .btn-block {
            width: 100%;
        }
        
        /* ===== حقل كلمة المرور ===== */
        .password-input-container {
            position: relative;
            width: 100%;
        }
        
        .toggle-password {
            position: absolute;
            top: 50%;
            left: 0.75rem;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--text-color-light);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            transition: background-color 0.2s ease;
        }
        
        .toggle-password:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        /* ===== قياس قوة كلمة المرور ===== */
        .password-strength-meter {
            margin-top: 0.5rem;
            height: 4px;
            background-color: var(--border-color);
            border-radius: var(--radius-sm);
            position: relative;
            overflow: hidden;
        }
        
        .password-meter-bar {
            height: 100%;
            width: 0;
            background-color: var(--danger-color);
            transition: width 0.3s ease, background-color 0.3s ease;
        }
        
        .password-meter-text {
            font-size: 0.75rem;
            color: var(--text-color-light);
            margin-top: 0.25rem;
            text-align: left;
        }
        
        .password-requirements {
            margin-top: 1rem;
            padding: 1rem;
            background-color: var(--bg-color);
            border-radius: var(--radius-md);
            font-size: 0.85rem;
        }
        
        .password-requirements p {
            margin: 0 0 0.5rem 0;
            color: var(--text-color);
        }
        
        .password-requirements ul {
            margin: 0;
            padding: 0 1.5rem 0 0;
            list-style: none;
        }
        
        .password-requirements li {
            margin-bottom: 0.25rem;
            color: var(--text-color-light);
            position: relative;
        }
        
        .password-requirements li i {
            font-size: 0.6rem;
            margin-left: 0.5rem;
            color: var(--text-color-light);
        }
        
        .password-requirements li.met {
            color: var(--success-color);
        }
        
        .password-requirements li.met i {
            color: var(--success-color);
        }
        
        /* ===== الأزرار ===== */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.625rem 1.25rem;
            border-radius: var(--radius-md);
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid transparent;
            position: relative;
            overflow: hidden;
        }
        
        .btn:disabled {
            opacity: 0.65;
            cursor: not-allowed;
        }
        
        .btn i {
            margin-left: 0.5rem;
        }
        
        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }
        
        .btn-primary:hover {
            background-color: var(--primary-color-dark);
        }
        
        .btn-danger {
            background-color: var(--danger-color);
            color: white;
        }
        
        .btn-danger:hover {
            background-color: #b91c1c;
        }
        
        .btn-outline {
            background-color: transparent;
            border-color: var(--border-color);
            color: var(--text-color);
        }
        .btn-outline:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .btn-block {
            display: block;
            width: 100%;
        }
        
        .btn-link {
            background: none;
            border: none;
            padding: 0;
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .btn-link:hover {
            text-decoration: underline;
        }
        
        .btn-icon {
            padding: 0.5rem;
            border-radius: 50%;
            width: 2.5rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .btn-icon span {
            display: none;
        }
        
        .btn-icon:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .btn-sm {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
        }
        
        /* تأثير الموجة */
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple-effect 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-effect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        /* ===== إشعارات المصادقة ===== */
        .auth-notification {
            position: absolute;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 400px;
            padding: 0.75rem 1rem;
            border-radius: var(--radius-md);
            background-color: white;
            box-shadow: var(--shadow-md);
            transition: top 0.5s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 1000;
        }
        
        .auth-notification.show {
            top: 1.5rem;
        }
        
        .auth-notification.success {
            background-color: #d4edda;
            color: #155724;
            border-right: 4px solid var(--success-color);
        }
        
        .auth-notification.error {
            background-color: #f8d7da;
            color: #721c24;
            border-right: 4px solid var(--danger-color);
        }
        
        .auth-notification.warning {
            background-color: #fff3cd;
            color: #856404;
            border-right: 4px solid var(--warning-color);
        }
        
        .auth-notification.info {
            background-color: #d1ecf1;
            color: #0c5460;
            border-right: 4px solid var(--info-color);
        }
        
        .auth-notification-content {
            display: flex;
            align-items: center;
        }
        
        .auth-notification-content i {
            margin-left: 0.75rem;
            font-size: 1.25rem;
        }
        
        .auth-notification-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: inherit;
            opacity: 0.7;
        }
        
        .auth-notification-close:hover {
            opacity: 1;
        }
        
        /* ===== شاشة القفل ===== */
        .lock-screen-user {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .lock-screen-user .avatar-circle {
            margin: 0 auto 1rem auto;
        }
        
        .lock-screen-user h2 {
            margin: 0.5rem 0 0.25rem 0;
            color: var(--text-color);
        }
        
        .lock-screen-user p {
            margin: 0;
            color: var(--text-color-light);
            font-size: 0.875rem;
        }
        
        .lock-screen-actions {
            display: flex;
            justify-content: center;
            margin-top: 1rem;
        }
        
        .lock-screen-actions .btn {
            margin: 0 0.5rem;
        }
        
        /* ===== النوافذ المنبثقة ===== */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            direction: rtl;
        }
        
        .modal-overlay.active {
            display: flex;
        }
        
        .modal {
            width: 90%;
            max-width: 500px;
            background-color: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            overflow: hidden;
        }
        
        .modal-header {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-title {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-color);
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-color-light);
            transition: color 0.2s ease;
        }
        
        .modal-close:hover {
            color: var(--danger-color);
        }
        
        .modal-body {
            padding: 1.5rem;
            max-height: 70vh;
            overflow-y: auto;
        }
        
        .modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
        }
        
        .modal-message {
            margin-bottom: 1.5rem;
            color: var(--text-color);
        }
        
        .confirmation-message {
            display: flex;
            align-items: center;
            color: var(--text-color);
        }
        
        .confirmation-message i {
            font-size: 2rem;
            margin-left: 1rem;
            color: var(--warning-color);
        }
        
        /* ===== نافذة المساعدة ===== */
        .help-tabs {
            display: flex;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
            overflow-x: auto;
            padding-bottom: 1px;
        }
        
        .help-tab {
            padding: 0.5rem 1rem;
            margin-left: 0.5rem;
            border-radius: var(--radius-md) var(--radius-md) 0 0;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .help-tab.active {
            background-color: var(--primary-color);
            color: white;
        }
        
        .help-content {
            display: none;
        }
        
        .help-content.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }
        
        .help-content h4 {
            margin-top: 0;
            color: var(--primary-color);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
        }
        
        .help-content h5 {
            color: var(--text-color);
            margin: 1.5rem 0 0.5rem 0;
        }
        
        .help-content p {
            margin: 0.5rem 0;
            line-height: 1.5;
        }
        
        .help-content ul, .help-content ol {
            margin: 0.5rem 0;
            padding-right: 1.5rem;
        }
        
        .help-content li {
            margin-bottom: 0.25rem;
        }
        
        .about-logo {
            text-align: center;
            margin-bottom: 1.5rem;
        }
        
        .about-logo i {
            font-size: 3rem;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .about-logo h3 {
            margin: 0;
            color: var(--text-color);
        }
        
        .about-info {
            background-color: var(--bg-color);
            padding: 1rem;
            border-radius: var(--radius-md);
            margin-bottom: 1.5rem;
        }
        
        .about-info p {
            margin: 0.5rem 0;
        }
        
        .about-copyright {
            text-align: center;
            font-size: 0.9rem;
            color: var(--text-color-light);
        }
        
        /* ===== قائمة المستخدم ===== */
        .user-info {
            position: relative;
        }
        
        .dropdown {
            position: relative;
        }
        
        .dropdown-toggle {
            display: flex;
            align-items: center;
            background: none;
            border: none;
            cursor: pointer;
            color: inherit;
            padding: 0.25rem 0.5rem;
            border-radius: var(--radius-sm);
            transition: background-color 0.3s ease;
        }
        
        .dropdown-toggle:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .user-avatar {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1rem;
            margin-left: 0.75rem;
            position: relative;
            overflow: hidden;
        }
        
        .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .user-avatar.small {
            width: 2rem;
            height: 2rem;
            font-size: 0.875rem;
        }
        
        .user-avatar.large {
            width: 4rem;
            height: 4rem;
            font-size: 1.5rem;
        }
        
        .user-details {
            text-align: right;
        }
        
        .user-name {
            font-weight: 500;
            color: var(--text-color);
        }
        
        .user-type {
            color: var(--text-color-light);
            font-size: 0.75rem;
        }
        
        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            width: 250px;
            background-color: white;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-md);
            padding: 0.5rem 0;
            display: none;
            z-index: 100;
            margin-top: 0.5rem;
            border: 1px solid var(--border-color);
        }
        
        .dropdown.active .dropdown-menu {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        .dropdown-header {
            padding: 1rem;
            display: flex;
            align-items: center;
        }
        
        .user-info-details {
            margin-right: 1rem;
        }
        
        .user-email {
            font-size: 0.75rem;
            color: var(--text-color-light);
        }
        
        .dropdown-item {
            display: flex;
            align-items: center;
            padding: 0.625rem 1rem;
            color: var(--text-color);
            text-decoration: none;
            transition: background-color 0.3s ease;
        }
        
        .dropdown-item:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .dropdown-item i {
            margin-left: 0.75rem;
            width: 1.25rem;
            text-align: center;
            color: var(--text-color-light);
        }
        
        .dropdown-divider {
            height: 1px;
            background-color: var(--border-color);
            margin: 0.5rem 0;
        }
        
        .logout-item {
            color: var(--danger-color);
        }
        
        .logout-item i {
            color: var(--danger-color);
        }
        
        /* ===== الملف الشخصي ===== */
        .profile-avatar {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        
        .avatar-circle {
            width: 4.5rem;
            height: 4.5rem;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
            font-weight: 600;
            margin-left: 1.25rem;
            position: relative;
            overflow: hidden;
        }
        
        .avatar-circle img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .profile-info {
            flex: 1;
        }
        
        .profile-info h3 {
            margin: 0 0 0.5rem 0;
            color: var(--text-color);
        }
        
        .user-type-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .user-type-badge.admin {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .user-type-badge.manager {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .user-type-badge.user {
            background-color: #d1ecf1;
            color: #0c5460;
        }
        
        /* ===== إشعارات عامة ===== */
        .notification {
            position: fixed;
            top: 1.5rem;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 400px;
            padding: 1rem;
            border-radius: var(--radius-md);
            background-color: white;
            box-shadow: var(--shadow-md);
            z-index: 9999;
            display: flex;
            align-items: flex-start;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        
        .notification.show {
            opacity: 1;
            pointer-events: auto;
        }
        
        .notification.success {
            background-color: #d4edda;
            color: #155724;
            border-right: 4px solid var(--success-color);
        }
        
        .notification.error {
            background-color: #f8d7da;
            color: #721c24;
            border-right: 4px solid var(--danger-color);
        }
        
        .notification.warning {
            background-color: #fff3cd;
            color: #856404;
            border-right: 4px solid var(--warning-color);
        }
        
        .notification.info {
            background-color: #d1ecf1;
            color: #0c5460;
            border-right: 4px solid var(--info-color);
        }
        
        .notification-icon {
            margin-left: 1rem;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-content {
            flex: 1;
        }
        
        .notification-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }
        
        .notification-message {
            font-size: 0.875rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: inherit;
            opacity: 0.7;
            margin-right: 0.5rem;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
        
        /* ===== الرسوم المتحركة ===== */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeOutUp {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-20px);
            }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .animated {
            animation-duration: 1s;
            animation-fill-mode: both;
        }
        
        .bounce {
            animation-name: bounce;
            transform-origin: center bottom;
        }
        
        @keyframes bounce {
            from, 20%, 53%, 80%, to {
                animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
                transform: translate3d(0, 0, 0);
            }
            40%, 43% {
                animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
                transform: translate3d(0, -20px, 0);
            }
            70% {
                animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
                transform: translate3d(0, -10px, 0);
            }
            90% {
                transform: translate3d(0, -4px, 0);
            }
        }
        
        /* ===== التوافق مع الأجهزة ===== */
        @media (max-width: 768px) {
            .auth-container {
                max-width: 90%;
                padding: 1.5rem;
            }
            
            .modal {
                width: 95%;
            }
            
            .user-avatar {
                width: 2rem;
                height: 2rem;
                font-size: 0.875rem;
            }
            
            .avatar-circle {
                width: 3.5rem;
                height: 3.5rem;
                font-size: 1.25rem;
            }
            
            .form-actions {
                flex-direction: column;
                gap: 0.75rem;
            }
            
            .form-actions button {
                width: 100%;
            }
            
            .auth-tab {
                font-size: 0.875rem;
                padding: 0.5rem;
            }
            
            .dropdown-menu {
                width: 220px;
            }
        }
    `;

                // إضافة عنصر النمط إلى رأس الصفحة
                document.head.appendChild(styleElement);
                console.log('تم إضافة أنماط CSS للنظام');
            }

           // تأكد من إغلاق الكائن AuthSystem بشكل صحيح
return {
    // الدوال الأساسية
    initialize,
    login,
    signup,
    logout,
    
    // إدارة المستخدمين
    getUserData,
    updateUserData,
    deleteUser,
    getUsers,
    
    // إدارة كلمات المرور
    changePassword,
    resetPassword,
    changeAdminCode,
    
    // إدارة المصادقة
    addAuthStateListener,
    removeAuthStateListener,
    
    // مساعدين
    getCurrentUser: () => currentUser,
    getPermissions: () => currentUser ? currentUser.permissions : null,
    isAdmin: () => currentUser && currentUser.type === USER_TYPES.ADMIN,
    isManager: () => currentUser && (currentUser.type === USER_TYPES.ADMIN || currentUser.type === USER_TYPES.MANAGER),
    hasPermission: (permission) => currentUser && currentUser.permissions && currentUser.permissions[permission],
    
    // الثوابت
    USER_TYPES,
    PERMISSIONS,
    VERSION: AUTH_SYSTEM_VERSION
}; // <-- تأكد من وجود هذا القوس لإغلاق الكائن

})(); // <-- تأكد من إغلاق الدالة الفورية (IIFE)

// استدعاء تلقائي لوظيفة التهيئة في البداية
window.addEventListener('DOMContentLoaded', function() {
    AuthSystem.initialize()
        .then(initialized => {
            console.log(`تم تهيئة نظام المصادقة: ${initialized ? 'بنجاح' : 'فشل'}`);
        })
        .catch(error => {
            console.error('خطأ في تهيئة نظام المصادقة:', error);
            showNotification('حدث خطأ أثناء تهيئة النظام. يرجى تحديث الصفحة.', 'error');
        });
});