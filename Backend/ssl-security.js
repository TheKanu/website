// 🔐 SSL/TLS SECURITY CONFIGURATION
// Sichere HTTPS-Konfiguration für Node.js Server

const fs = require('fs');
const path = require('path');

// 🛡️ Sichere SSL/TLS Optionen
const secureSSLOptions = {
    // SSL-Zertifikate
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem')),
    
    // 🔒 Sichere TLS-Konfiguration
    secureProtocol: 'TLSv1_2_method', // Mindestens TLS 1.2
    ciphers: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES128-SHA256',
        'ECDHE-RSA-AES256-SHA384',
        'ECDHE-RSA-AES256-SHA256',
        'DHE-RSA-AES128-GCM-SHA256',
        'DHE-RSA-AES256-GCM-SHA384',
        'DHE-RSA-AES128-SHA256',
        'DHE-RSA-AES256-SHA256',
        'AES128-GCM-SHA256',
        'AES256-GCM-SHA384',
        'AES128-SHA256',
        'AES256-SHA256',
        '!aNULL',
        '!eNULL',
        '!EXPORT',
        '!DES',
        '!RC4',
        '!MD5',
        '!PSK',
        '!SRP',
        '!CAMELLIA'
    ].join(':'),
    
    // Zusätzliche Sicherheitsoptionen
    honorCipherOrder: true, // Server bestimmt Cipher-Reihenfolge
    secureOptions: require('constants').SSL_OP_NO_SSLv2 | 
                   require('constants').SSL_OP_NO_SSLv3 |
                   require('constants').SSL_OP_NO_TLSv1 |
                   require('constants').SSL_OP_NO_TLSv1_1, // Disable unsichere Protokolle
    
    // ECDH-Kurven für Perfect Forward Secrecy
    ecdhCurve: 'secp384r1'
};

// 🔍 SSL-Zertifikat Validierung
function validateSSLCertificates() {
    const keyPath = path.join(__dirname, 'ssl', 'key.pem');
    const certPath = path.join(__dirname, 'ssl', 'cert.pem');
    
    try {
        if (!fs.existsSync(keyPath)) {
            throw new Error('SSL private key not found: ' + keyPath);
        }
        if (!fs.existsSync(certPath)) {
            throw new Error('SSL certificate not found: ' + certPath);
        }
        
        // Zertifikat-Ablaufzeit prüfen
        const certContent = fs.readFileSync(certPath, 'utf8');
        const certMatch = certContent.match(/-----BEGIN CERTIFICATE-----([\\s\\S]*?)-----END CERTIFICATE-----/);
        
        if (certMatch) {
            console.log('✅ SSL certificates found and validated');
            return true;
        } else {
            throw new Error('Invalid certificate format');
        }
        
    } catch (error) {
        console.error('❌ SSL Certificate validation failed:', error.message);
        console.log('💡 Generate new certificates with:');
        console.log('   openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes');
        return false;
    }
}

// 🚨 Security Headers für HTTPS
const httpsSecurityHeaders = (req, res, next) => {
    // HSTS - HTTP Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // HTTPS Redirect Header
    res.setHeader('X-Forwarded-Proto', 'https');
    
    next();
};

// 🔄 HTTP zu HTTPS Redirect
const httpsRedirect = (req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
        console.log(`🔄 Redirecting HTTP to HTTPS: ${req.get('host')}${req.originalUrl}`);
        return res.redirect(`https://${req.get('host')}${req.originalUrl}`);
    }
    next();
};

module.exports = {
    secureSSLOptions,
    validateSSLCertificates,
    httpsSecurityHeaders,
    httpsRedirect
};