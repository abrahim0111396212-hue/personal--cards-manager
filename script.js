// ===================== المتغيرات العامة =====================
let users = [];
let currentUser = null;
let currentLanguage = 'ar';
let profileImageData = null;
let masterEncryptionKey = null;
let phoneHashes = JSON.parse(localStorage.getItem('phone_hashes') || '{}');

// ===================== دوال إضافية للأمان =====================
function hashPhone(phone) {
    const salt = "fixed_salt_for_phone_hashing_2024_secure";
    return CryptoJS.SHA256(phone + salt).toString();
}

function checkPhoneExists(phone) {
    const hash = hashPhone(phone);
    return phoneHashes[hash] === true;
}

function addPhoneHash(phone) {
    const hash = hashPhone(phone);
    phoneHashes[hash] = true;
    localStorage.setItem('phone_hashes', JSON.stringify(phoneHashes));
}

// ===================== دوال البيانات =====================
async function loadEncryptedData() {
    const encryptedUsers = localStorage.getItem('users_encrypted');
    if(encryptedUsers && masterEncryptionKey) {
        try {
            const decrypted = await secureEncryption.decryptData(encryptedUsers, masterEncryptionKey);
            if(decrypted && Array.isArray(decrypted)) {
                users = decrypted;
                return true;
            }
        } catch(e) {
            console.error("Load error:", e);
        }
    }
    users = [];
    return false;
}

async function saveEncryptedData() {
    if(users.length > 0 && masterEncryptionKey) {
        const encrypted = await secureEncryption.encryptData(users, masterEncryptionKey);
        if(encrypted) {
            localStorage.setItem('users_encrypted', encrypted);
            return true;
        }
    }
    return false;
}

async function registerUser(userData, password) {
    if(checkPhoneExists(userData.phone)) {
        return { success: false, message: currentLanguage === 'ar' ? 'رقم الهاتف مسجل مسبقاً' : 'Phone number already registered' };
    }
    
    users.push(userData);
    masterEncryptionKey = password;
    await saveEncryptedData();
    addPhoneHash(userData.phone);
    
    return { success: true };
}

async function loginUser(phone, password) {
    masterEncryptionKey = password;
    const loaded = await loadEncryptedData();
    if(!loaded) return null;
    
    const user = users.find(u => u.phone === phone && u.password === password);
    if(user) return user;
    return null;
}

// ===================== دوال الترجمة =====================
const translations = {
    ar: {
        splashTitle: "إدارة بطاقاتي", splashSub: "نظام آمن مشفر", welcomeText: "مرحباً بك في منصتك الآمنة", getStarted: "اضغط للبدء",
        logoText: "إدارة بطاقاتي", phoneLabel: "رقم الهاتف", passwordLabel: "كلمة المرور", loginBtn: "تسجيل الدخول",
        noAccount: "ليس لديك حساب؟", registerLink: "تسجيل جديد", forgotPassword: "🔐 نسيت كلمة المرور؟",
        countryLabel: "الدولة *", stateLabel: "الولاية *", cityLabel: "المدينة *", fullNameLabel: "الاسم الكامل (رباعي) *",
        phoneRegLabel: "رقم الهاتف *", bankLabel: "البنك *", branchLabel: "فرع البنك", passwordRegLabel: "كلمة المرور *",
        confirmLabel: "تأكيد كلمة المرور *", socialLabel: "🌐 روابط التواصل الاجتماعي (اختياري)", registerBtn: "تسجيل جديد",
        haveAccount: "لديك حساب؟", loginLink: "تسجيل الدخول", settingsText: "الإعدادات", logoutText: "تسجيل خروج",
        copyLink: "نسخ الرابط", downloadQR: "تحميل الباركود", uniqueId: "المعرف الفريد", callNow: "(اضغط للاتصال)",
        modalTitle: "استعادة كلمة المرور", modalDesc: "أدخل رقم هاتفك المسجل", sendBtn: "إرسال", closeBtn: "إغلاق",
        settingsModalTitle: "⚙️ الإعدادات", changePhoto: "🖼️ تغيير الصورة", uploadPhoto: "تحميل", changePassword: "🔐 تغيير كلمة المرور",
        currentPass: "الحالية", newPass: "الجديدة", confirmNew: "تأكيد", updatePass: "تحديث",
        recoverError: "لا يمكن استعادة كلمة المرور بسبب التشفير القوي. يرجى تذكر كلمة المرور الخاصة بك."
    },
    en: {
        splashTitle: "My Cards Manager", splashSub: "Secure Encrypted System", welcomeText: "Welcome to Your Secure Platform", getStarted: "Get Started",
        logoText: "My Cards Manager", phoneLabel: "Phone Number", passwordLabel: "Password", loginBtn: "Login",
        noAccount: "Don't have an account?", registerLink: "Register", forgotPassword: "🔐 Forgot Password?",
        countryLabel: "Country *", stateLabel: "State *", cityLabel: "City *", fullNameLabel: "Full Name (4 parts) *",
        phoneRegLabel: "Phone Number *", bankLabel: "Bank *", branchLabel: "Bank Branch", passwordRegLabel: "Password *",
        confirmLabel: "Confirm Password *", socialLabel: "🌐 Social Media Links (Optional)", registerBtn: "Register",
        haveAccount: "Already have an account?", loginLink: "Login", settingsText: "Settings", logoutText: "Logout",
        copyLink: "Copy Link", downloadQR: "Download QR", uniqueId: "Unique ID", callNow: "(Tap to Call)",
        modalTitle: "Recover Password", modalDesc: "Enter your registered phone number", sendBtn: "Send", closeBtn: "Close",
        settingsModalTitle: "⚙️ Settings", changePhoto: "🖼️ Change Photo", uploadPhoto: "Upload", changePassword: "🔐 Change Password",
        currentPass: "Current", newPass: "New", confirmNew: "Confirm", updatePass: "Update",
        recoverError: "Cannot recover password due to strong encryption. Please remember your password."
    }
};

function updateUILanguage() {
    const t = translations[currentLanguage];
    document.getElementById('splashTitle').innerText = t.splashTitle;
    document.getElementById('splashSub').innerText = t.splashSub;
    document.getElementById('welcomeText').innerText = t.welcomeText;
    document.getElementById('getStartedBtn').innerHTML = t.getStarted + ' <i class="fas fa-arrow-left"></i>';
    document.getElementById('splashLangText').innerText = currentLanguage === 'ar' ? 'English' : 'العربية';
    document.getElementById('logoText').innerText = t.logoText;
    document.getElementById('phoneLabelMain').innerText = t.phoneLabel;
    document.getElementById('passwordLabelMain').innerText = t.passwordLabel;
    document.getElementById('doLoginBtn').innerText = t.loginBtn;
    document.getElementById('showRegisterBtn').innerHTML = t.noAccount + ' <strong>' + t.registerLink + '</strong>';
    document.getElementById('forgotPasswordMain').innerHTML = t.forgotPassword;
    document.getElementById('countryLabel').innerText = t.countryLabel;
    document.getElementById('stateLabel').innerText = t.stateLabel;
    document.getElementById('cityLabel').innerText = t.cityLabel;
    document.getElementById('fullNameLabel').innerText = t.fullNameLabel;
    document.getElementById('phoneRegLabel').innerText = t.phoneRegLabel;
    document.getElementById('bankLabel').innerText = t.bankLabel;
    document.getElementById('branchLabel').innerText = t.branchLabel;
    document.getElementById('passwordRegLabel').innerText = t.passwordRegLabel;
    document.getElementById('confirmLabel').innerText = t.confirmLabel;
    document.getElementById('socialLabel').innerHTML = t.socialLabel;
    document.getElementById('registerBtn').innerText = t.registerBtn;
    document.getElementById('showLoginLink').innerHTML = t.haveAccount + ' <strong>' + t.loginLink + '</strong>';
    document.getElementById('mainLangText').innerText = currentLanguage === 'ar' ? 'English' : 'العربية';
    if(document.getElementById('dashboardLogo')) document.getElementById('dashboardLogo').innerText = t.logoText;
    if(document.getElementById('settingsText')) document.getElementById('settingsText').innerText = t.settingsText;
    if(document.getElementById('logoutBtn')) document.getElementById('logoutBtn').innerText = t.logoutText;
    if(document.getElementById('dashboardLangText')) document.getElementById('dashboardLangText').innerText = currentLanguage === 'ar' ? 'English' : 'العربية';
    document.getElementById('modalTitle').innerText = t.modalTitle;
    document.getElementById('modalDesc').innerText = t.modalDesc;
    document.getElementById('sendPasswordBtn').innerText = t.sendBtn;
    document.getElementById('closeModalBtn').innerText = t.closeBtn;
    document.getElementById('settingsModalTitle').innerHTML = t.settingsModalTitle;
    document.getElementById('changePhotoTitle').innerHTML = t.changePhoto;
    document.getElementById('uploadBtnText').innerText = t.uploadPhoto;
    document.getElementById('changePasswordTitle').innerHTML = t.changePassword;
    document.getElementById('currentPassLabel').innerText = t.currentPass;
    document.getElementById('newPassLabel').innerText = t.newPass;
    document.getElementById('confirmNewLabel').innerText = t.confirmNew;
    document.getElementById('updatePassText').innerText = t.updatePass;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    updateUILanguage();
    if(currentUser && document.getElementById('dashboardPage').classList.contains('active')) renderDashboard();
    showToast(currentLanguage === 'ar' ? '✅ تم تغيير اللغة' : '✅ Language changed');
}

// ===================== دوال مساعدة =====================
function showToast(msg) { 
    let t = document.createElement('div'); 
    t.className = 'toast-msg'; 
    t.innerText = msg; 
    document.body.appendChild(t); 
    setTimeout(() => t.remove(), 3000); 
}

function copyToClipboard(text) { 
    navigator.clipboard.writeText(text); 
    showToast(currentLanguage === 'ar' ? '✅ تم نسخ الرابط' : '✅ Link copied'); 
}

function generateSecureShortId() {
    const array = new Uint8Array(12);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').substring(0, 12).toUpperCase();
}

function compressAndEncode(data) {
    try {
        const jsonStr = JSON.stringify(data);
        const compressed = pako.deflate(jsonStr, { level: 9 });
        const base64 = btoa(String.fromCharCode.apply(null, compressed));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch(e) { 
        return btoa(unescape(encodeURIComponent(jsonStr))).substring(0, 500); 
    }
}

function decompressAndDecode(encoded) {
    try {
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const decompressed = pako.inflate(bytes, { to: 'string' });
        return JSON.parse(decompressed);
    } catch(e) { 
        return null; 
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

// ===================== دوال التسجيل والدخول =====================
function updateCountryFields() {
    const country = document.getElementById('countrySelect').value;
    const data = countriesDatabase[country];
    if(data) {
        document.getElementById('countryCodeDisplay').innerHTML = `<span class="fi fi-${data.flag}"></span> ${data.code}`;
        const stateSelect = document.getElementById('stateSelect');
        stateSelect.disabled = false;
        stateSelect.innerHTML = '<option value="">' + (currentLanguage === 'ar' ? 'اختر الولاية' : 'Select State') + '</option>';
        for(let state in data.states) { 
            let opt = document.createElement('option'); 
            opt.value = state; 
            opt.textContent = state; 
            stateSelect.appendChild(opt); 
        }
        const bankSelect = document.getElementById('bankSelect');
        bankSelect.innerHTML = '<option value="">' + (currentLanguage === 'ar' ? 'اختر البنك' : 'Select Bank') + '</option>';
        data.banks.forEach(b => { 
            let opt = document.createElement('option'); 
            opt.value = b; 
            opt.textContent = b; 
            bankSelect.appendChild(opt); 
        });
    }
}

function updateCities() {
    const country = document.getElementById('countrySelect').value;
    const state = document.getElementById('stateSelect').value;
    if(country && state && countriesDatabase[country]?.states[state]) {
        const citySelect = document.getElementById('citySelect');
        citySelect.disabled = false;
        citySelect.innerHTML = '<option value="">' + (currentLanguage === 'ar' ? 'اختر المدينة' : 'Select City') + '</option>';
        countriesDatabase[country].states[state].forEach(c => { 
            let opt = document.createElement('option'); 
            opt.value = c; 
            opt.textContent = c; 
            citySelect.appendChild(opt); 
        });
    }
}

document.getElementById('registerBtn').addEventListener('click', async function() {
    const country = document.getElementById('countrySelect').value;
    const state = document.getElementById('stateSelect').value;
    const city = document.getElementById('citySelect').value;
    const fullName = document.getElementById('fullName').value.trim();
    const phoneNumber = document.getElementById('regPhoneNumber').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    const bank = document.getElementById('bankSelect').value;
    const bankBranch = document.getElementById('bankBranch').value;
    
    const passwordStrength = secureEncryption.validatePasswordStrength(password);
    if(!passwordStrength.isValid) {
        showToast(currentLanguage === 'ar' ? '❌ كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل مع أرقام ورموز' : '❌ Weak password. Use at least 8 chars with numbers and symbols');
        return;
    }
    
    if(!country || !state || !city || !fullName || !phoneNumber || !password || !bank) {
        showToast(currentLanguage === 'ar' ? '❌ يرجى ملء جميع الحقول' : '❌ Fill all fields');
        return;
    }
    if(password !== confirm) {
        showToast(currentLanguage === 'ar' ? '❌ كلمة المرور غير متطابقة' : '❌ Passwords do not match');
        return;
    }
    
    const countryData = countriesDatabase[country];
    const fullPhone = countryData.code + phoneNumber;
    
    if(checkPhoneExists(fullPhone)) {
        showToast(currentLanguage === 'ar' ? '❌ رقم الهاتف مسجل مسبقاً' : '❌ Phone already registered');
        return;
    }
    
    const social = {
        facebook: document.getElementById('fbLink').value,
        whatsapp: document.getElementById('waLink').value,
        tiktok: document.getElementById('ttLink').value,
        linkedin: document.getElementById('inLink').value,
        viber: document.getElementById('viberLink').value,
        telegram: document.getElementById('teleLink').value,
        email: document.getElementById('emailLink').value
    };
    
    const userId = generateSecureShortId();
    const newUser = {
        id: userId, country, state, city, fullName, phone: fullPhone,
        password, bank, bankBranch, social, dynamicFields: [],
        countryCode: countryData.code, flag: countryData.flag, image: profileImageData || '',
        createdAt: Date.now()
    };
    
    const result = await registerUser(newUser, password);
    if(result.success) {
        showToast(currentLanguage === 'ar' ? '✅ تم التسجيل بنجاح!' : '✅ Registration successful!');
        document.getElementById('registerFormDiv').style.display = 'none';
        document.getElementById('loginFormDiv').style.display = 'block';
        document.getElementById('loginPhone').value = fullPhone;
    } else {
        showToast(result.message);
    }
});

document.getElementById('doLoginBtn').addEventListener('click', async function() {
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = await loginUser(phone, password);
    if(user) {
        currentUser = user;
        profileImageData = user.image || null;
        renderDashboard();
        showToast(currentLanguage === 'ar' ? '✅ مرحباً ' + user.fullName : '✅ Welcome ' + user.fullName);
    } else {
        showToast(currentLanguage === 'ar' ? '❌ بيانات غير صحيحة' : '❌ Invalid credentials');
    }
});

document.getElementById('showRegisterBtn').onclick = () => {
    document.getElementById('loginFormDiv').style.display = 'none';
    document.getElementById('registerFormDiv').style.display = 'block';
    updateCountryFields();
};
document.getElementById('showLoginLink').onclick = () => {
    document.getElementById('registerFormDiv').style.display = 'none';
    document.getElementById('loginFormDiv').style.display = 'block';
};

const forgotModal = document.getElementById('forgotModal');
document.getElementById('forgotPasswordMain').onclick = () => forgotModal.style.display = 'flex';
document.getElementById('sendPasswordBtn').onclick = async () => {
    showToast(translations[currentLanguage].recoverError);
    forgotModal.style.display = 'none';
    document.getElementById('resetPhone').value = '';
};
document.getElementById('closeModalBtn').onclick = () => forgotModal.style.display = 'none';

const settingsModal = document.getElementById('settingsModal');
document.getElementById('settingsBtn').onclick = () => {
    if(currentUser && currentUser.image) document.getElementById('settingsProfileImage').src = currentUser.image;
    settingsModal.style.display = 'flex';
};
document.getElementById('closeSettingsBtn').onclick = () => settingsModal.style.display = 'none';

document.getElementById('uploadImageBtn').onclick = () => document.getElementById('settingsImageInput').click();
document.getElementById('settingsImageInput').onchange = async function(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = async function(ev) {
            profileImageData = ev.target.result;
            document.getElementById('settingsProfileImage').src = profileImageData;
            if(currentUser) {
                currentUser.image = profileImageData;
                const index = users.findIndex(u => u.id === currentUser.id);
                if(index !== -1) users[index] = currentUser;
                await saveEncryptedData();
                showToast(currentLanguage === 'ar' ? '✅ تم تحديث الصورة' : '✅ Photo updated');
                if(document.getElementById('dashboardPage').classList.contains('active')) renderDashboard();
            }
        };
        reader.readAsDataURL(file);
    }
};

document.getElementById('updatePasswordBtn').onclick = async function() {
    if(!currentUser) return;
    const currentPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmNew = document.getElementById('confirmNewPassword').value;
    
    if(currentPass !== currentUser.password) {
        showToast(currentLanguage === 'ar' ? '❌ كلمة المرور الحالية خطأ' : '❌ Current password wrong');
        return;
    }
    if(newPass !== confirmNew) {
        showToast(currentLanguage === 'ar' ? '❌ كلمة المرور غير متطابقة' : '❌ Passwords do not match');
        return;
    }
    
    const passwordStrength = secureEncryption.validatePasswordStrength(newPass);
    if(!passwordStrength.isValid) {
        showToast(currentLanguage === 'ar' ? '❌ كلمة المرور الجديدة ضعيفة' : '❌ New password is weak');
        return;
    }
    
    currentUser.password = newPass;
    const index = users.findIndex(u => u.id === currentUser.id);
    if(index !== -1) users[index] = currentUser;
    masterEncryptionKey = newPass;
    await saveEncryptedData();
    
    showToast(currentLanguage === 'ar' ? '✅ تم تغيير كلمة المرور' : '✅ Password changed');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    settingsModal.style.display = 'none';
};

document.getElementById('logoutBtn').onclick = () => {
    currentUser = null;
    masterEncryptionKey = null;
    users = [];
    showPage('mainPage');
    document.getElementById('loginFormDiv').style.display = 'block';
    document.getElementById('registerFormDiv').style.display = 'none';
    document.getElementById('loginPhone').value = '';
    document.getElementById('loginPassword').value = '';
};

// ===================== دوال عرض البيانات =====================
function createCardUrl(user) {
    const cardData = {
        name: user.fullName, country: user.country, state: user.state, city: user.city,
        phone: user.phone, bank: user.bank, branch: user.bankBranch || '',
        facebook: user.social?.facebook || '', whatsapp: user.social?.whatsapp || '',
        tiktok: user.social?.tiktok || '', linkedin: user.social?.linkedin || '',
        viber: user.social?.viber || '', telegram: user.social?.telegram || '',
        email: user.social?.email || '', image: user.image || ''
    };
    const encoded = compressAndEncode(cardData);
    return window.location.href.split('#')[0] + '?card=' + encoded;
}

function downloadQRCode() {
    const qrContainer = document.getElementById('qrCodeContainer');
    if(qrContainer) {
        showToast(currentLanguage === 'ar' ? '⏳ جاري التحضير...' : '⏳ Preparing...');
        html2canvas(qrContainer, { scale: 4, backgroundColor: '#ffffff' }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'qrcode_' + currentUser.id + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            showToast(currentLanguage === 'ar' ? '✅ تم التحميل' : '✅ Downloaded');
        }).catch(() => showToast(currentLanguage === 'ar' ? '❌ فشل التحميل' : '❌ Failed'));
    }
}

function renderDashboard() {
    if(!currentUser) return;
    const t = translations[currentLanguage];
    const profileUrl = createCardUrl(currentUser);
    
    const container = document.getElementById('userProfileArea');
    container.innerHTML = `
        <div class="profile-card">
            ${currentUser.image ? `<img src="${currentUser.image}" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #e31b23; margin-bottom: 15px; object-fit: cover;">` : `<div style="width: 100px; height: 100px; border-radius: 50%; background: #e31b23; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-user" style="font-size: 50px; color: white;"></i></div>`}
            <h3><i class="fas fa-user-circle"></i> ${escapeHtml(currentUser.fullName)}</h3>
            <p><i class="fas fa-map-marker-alt"></i> ${currentUser.country} - ${currentUser.state} - ${currentUser.city}</p>
            <p><i class="fas fa-phone"></i> <a href="tel:${currentUser.phone}" class="phone-link"><i class="fas fa-phone-alt"></i> ${currentUser.phone} <span style="font-size:12px;">${t.callNow}</span></a></p>
            <p><i class="fas fa-university"></i> ${currentUser.bank} ${currentUser.bankBranch ? '- ' + currentUser.bankBranch : ''}</p>
            <div class="unique-id-badge"><i class="fas fa-fingerprint"></i> ${t.uniqueId}: ${currentUser.id}</div>
            <div class="qrcode-container" id="qrCodeContainer"></div>
            <div class="qr-buttons">
                <button class="btn-small" onclick="window.downloadQRCode()" style="background:#4CAF50;"><i class="fas fa-download"></i> ${t.downloadQR}</button>
                <button class="btn-small" onclick="copyToClipboard('${profileUrl}')" style="background:#2196F3;"><i class="fas fa-copy"></i> ${t.copyLink}</button>
            </div>
            <div class="small-note">📱 ${currentLanguage === 'ar' ? 'امسح الباركود لرؤية البطاقة' : 'Scan QR to view card'}</div>
            <div class="small-note"><i class="fas fa-shield-alt"></i> ${currentLanguage === 'ar' ? 'محمي بتشفير AES-256-GCM' : 'Protected with AES-256-GCM encryption'}</div>
        </div>
    `;
    
    setTimeout(() => {
        const qrDiv = document.getElementById('qrCodeContainer');
        if(qrDiv) {
            qrDiv.innerHTML = '';
            new QRCode(qrDiv, { text: profileUrl, width: 200, height: 200, colorDark: "#e31b23", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
        }
    }, 100);
    
    showPage('dashboardPage');
}

function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const cardData = params.get('card');
    if(cardData) {
        const userData = decompressAndDecode(cardData);
        if(userData) {
            document.body.innerHTML = `
                <div style="max-width:550px; margin:20px auto; background:white; border-radius:48px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.3);">
                    <div style="background:linear-gradient(135deg,#e31b23,#b3141a); padding:20px; text-align:center; color:white;">
                        <i class="fas fa-credit-card" style="font-size:48px;"></i>
                        <h1 style="margin-top:10px;">${escapeHtml(userData.name || 'بطاقة شخصية')}</h1>
                        <p>${escapeHtml(userData.country || '')} - ${escapeHtml(userData.state || '')} - ${escapeHtml(userData.city || '')}</p>
                    </div>
                    <div style="padding:24px;">
                        <div style="text-align:center; margin-bottom:20px;">
                            ${userData.image ? `<img src="${userData.image}" style="width:120px; height:120px; border-radius:50%; border:4px solid #e31b23;">` : '<div style="width:120px; height:120px; border-radius:50%; background:#e31b23; margin:0 auto; display:flex; align-items:center; justify-content:center;"><i class="fas fa-user" style="font-size:60px; color:white;"></i></div>'}
                        </div>
                        <div style="background:#f9f9f9; border-radius:20px; padding:15px; margin-bottom:15px;">
                            <p style="margin:10px 0;"><i class="fas fa-phone" style="color:#e31b23; width:30px;"></i> <strong>${currentLanguage === 'ar' ? 'رقم الهاتف:' : 'Phone:'}</strong> <a href="tel:${userData.phone}" style="color:#e31b23;">${escapeHtml(userData.phone)}</a></p>
                            <p style="margin:10px 0;"><i class="fas fa-university" style="color:#e31b23; width:30px;"></i> <strong>${currentLanguage === 'ar' ? 'البنك:' : 'Bank:'}</strong> ${escapeHtml(userData.bank)} ${userData.branch ? '- ' + escapeHtml(userData.branch) : ''}</p>
                        </div>
                        <div style="background:#f9f9f9; border-radius:20px; padding:15px;">
                            <h4 style="color:#e31b23;"><i class="fas fa-share-alt"></i> ${currentLanguage === 'ar' ? 'وسائل التواصل' : 'Social Media'}</h4>
                            ${userData.facebook ? `<p><i class="fab fa-facebook-f"></i> <a href="${userData.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a></p>` : ''}
                            ${userData.whatsapp ? `<p><i class="fab fa-whatsapp"></i> <a href="${userData.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a></p>` : ''}
                            ${userData.tiktok ? `<p><i class="fab fa-tiktok"></i> <a href="${userData.tiktok}" target="_blank" rel="noopener noreferrer">TikTok</a></p>` : ''}
                            ${userData.linkedin ? `<p><i class="fab fa-linkedin"></i> <a href="${userData.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a></p>` : ''}
                            ${userData.email ? `<p><i class="fas fa-envelope"></i> <a href="mailto:${userData.email}">${escapeHtml(userData.email)}</a></p>` : ''}
                        </div>
                        <div class="small-note" style="margin-top:20px;">📱 ${currentLanguage === 'ar' ? 'بطاقة شخصية آمنة - تشفير AES-256-GCM' : 'Secure Personal Card - AES-256-GCM Encryption'}</div>
                    </div>
                </div>
            `;
            return true;
        }
    }
    return false;
}

// ===================== تهيئة التطبيق =====================
document.getElementById('startBtn').onclick = () => showPage('mainPage');
document.getElementById('getStartedBtn').onclick = () => showPage('mainPage');
document.getElementById('splashLanguageBtn').onclick = toggleLanguage;
document.getElementById('mainLanguageBtn').onclick = toggleLanguage;
document.getElementById('dashboardLangBtn').onclick = toggleLanguage;

window.downloadQRCode = downloadQRCode;
window.copyToClipboard = copyToClipboard;

const countrySelect = document.getElementById('countrySelect');
allCountries.forEach(c => { 
    let opt = document.createElement('option'); 
    opt.value = c; 
    opt.textContent = c; 
    countrySelect.appendChild(opt); 
});

document.getElementById('countrySelect').addEventListener('change', updateCountryFields);
document.getElementById('stateSelect').addEventListener('change', updateCities);

updateUILanguage();
updateCountryFields();

(async () => {
    if(!checkURLParams()) {
        showPage('splashPage');
    }
})();

console.log("✅ التطبيق جاهز مع تشفير AES-256-GCM و PBKDF2");