// ===================== نظام التشفير المتقدم =====================
// AES-256-GCM + PBKDF2 + Salt + IV

class SecureEncryption {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.iterations = 100000;
        this.saltLength = 32;
        this.ivLength = 12;
    }

    generateSalt() {
        return crypto.getRandomValues(new Uint8Array(this.saltLength));
    }

    generateIV() {
        return crypto.getRandomValues(new Uint8Array(this.ivLength));
    }

    async deriveKeyFromPassword(password, salt) {
        const encoder = new TextEncoder();
        const passwordKey = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );
        
        const derivedKey = await crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: salt, iterations: this.iterations, hash: "SHA-256" },
            passwordKey,
            { name: this.algorithm, length: this.keyLength },
            true,
            ["encrypt", "decrypt"]
        );
        
        return derivedKey;
    }

    async encryptData(data, password) {
        try {
            const encoder = new TextEncoder();
            const dataBytes = encoder.encode(JSON.stringify(data));
            const salt = this.generateSalt();
            const iv = this.generateIV();
            const key = await this.deriveKeyFromPassword(password, salt);
            
            const encrypted = await crypto.subtle.encrypt(
                { name: this.algorithm, iv: iv },
                key,
                dataBytes
            );
            
            const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encrypted), salt.length + iv.length);
            
            return btoa(String.fromCharCode.apply(null, combined));
        } catch(e) {
            console.error("Encryption error:", e);
            return null;
        }
    }

    async decryptData(encryptedBase64, password) {
        try {
            const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
            const salt = combined.slice(0, this.saltLength);
            const iv = combined.slice(this.saltLength, this.saltLength + this.ivLength);
            const encryptedData = combined.slice(this.saltLength + this.ivLength);
            
            const key = await this.deriveKeyFromPassword(password, salt);
            
            const decrypted = await crypto.subtle.decrypt(
                { name: this.algorithm, iv: iv },
                key,
                encryptedData
            );
            
            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decrypted));
        } catch(e) {
            console.error("Decryption error:", e);
            return null;
        }
    }

    generateSecureId() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').substring(0, 16);
    }

    validatePasswordStrength(password) {
        const checks = {
            length: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        const score = Object.values(checks).filter(Boolean).length;
        
        return {
            isValid: score >= 3,
            score: score,
            message: score >= 5 ? 'قوية جداً' : score >= 4 ? 'قوية' : score >= 3 ? 'متوسطة' : 'ضعيفة'
        };
    }
}

const secureEncryption = new SecureEncryption();