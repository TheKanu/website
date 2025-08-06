// 🔒 SICHERHEITSKONFIGURATION FÜR CATTO.AT WEBSITE
// Umfassende Sicherheitsmaßnahmen gegen Angriffe

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// 🛡️ Sichere CORS-Konfiguration
const secureCorseOptions = {
    origin: [
        'https://catto.at',
        'https://www.catto.at',
        'http://catto.at',
        'http://www.catto.at',
        'http://localhost:3000',
        'http://localhost:8080',
        'http://127.0.0.1:8080'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'User-Agent'],
    credentials: false,
    maxAge: 86400, // 24 Stunden Cache
    optionsSuccessStatus: 200
};

// 🚫 Rate Limiting - Schutz vor DDoS und Brute Force
const createRateLimit = (windowMs, max, message) => rateLimit({
    windowMs: windowMs,
    max: max,
    message: {
        error: 'Rate limit exceeded',
        message: message,
        retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Block requests that exceed limit
    handler: (req, res) => {
        console.log(`🚨 Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
        res.status(429).json({
            error: 'Too many requests',
            message: 'Please wait before making more requests',
            retryAfter: Math.ceil(windowMs / 1000)
        });
    }
});

// Verschiedene Rate Limits für verschiedene Endpoints
const rateLimits = {
    // General API rate limit
    general: createRateLimit(
        15 * 60 * 1000, // 15 Minuten
        100,             // Max 100 requests per 15 min
        'Too many API requests, please try again later'
    ),
    
    // Stricter limit for sync endpoint (expensive scraping operations)
    sync: createRateLimit(
        60 * 60 * 1000,  // 1 Stunde
        10,              // Max 10 sync requests per hour
        'Too many sync requests, scraping is expensive'
    ),
    
    // Very strict for health checks to prevent abuse
    health: createRateLimit(
        60 * 1000,       // 1 Minute
        30,              // Max 30 health checks per minute
        'Too many health check requests'
    )
};

// 🛡️ Helmet Sicherheits-Headers
const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://catto.at:8443"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Avoid breaking third-party integrations
    hsts: {
        maxAge: 31536000, // 1 Jahr
        includeSubDomains: true,
        preload: true
    }
};

// 🔍 Input Validation & Sanitization
const validateRequest = (req, res, next) => {
    // Block suspicious User-Agents
    const userAgent = req.get('User-Agent') || '';
    const suspiciousPatterns = [
        /bot/i, /crawler/i, /spider/i, /scraper/i,
        /scan/i, /hack/i, /inject/i, /exploit/i,
        /sqlmap/i, /nmap/i, /nikto/i, /dirb/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
        console.log(`🚨 Suspicious User-Agent blocked: ${userAgent} from IP: ${req.ip}`);
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Suspicious request blocked'
        });
    }
    
    // Block malicious query parameters
    const queryString = JSON.stringify(req.query);
    const maliciousPatterns = [
        /<script/i, /javascript:/i, /onclick=/i, /onerror=/i,
        /union.*select/i, /drop.*table/i, /insert.*into/i,
        /../, /\.\.\\/, /proc\//, /etc\/passwd/,
        /cmd.exe/i, /powershell/i, /sh$/
    ];
    
    if (maliciousPatterns.some(pattern => pattern.test(queryString))) {
        console.log(`🚨 Malicious query blocked: ${queryString} from IP: ${req.ip}`);
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid request parameters'
        });
    }
    
    next();
};

// 📊 Security Monitoring & Logging
const securityLogger = (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            method: req.method,
            path: req.path,
            userAgent: req.get('User-Agent'),
            statusCode: res.statusCode,
            duration: `${duration}ms`
        };
        
        // Log suspicious activity
        if (res.statusCode >= 400 || duration > 10000) {
            console.log(`🔍 Security Event: ${JSON.stringify(logData)}`);
        }
    });
    
    next();
};

// 🚫 IP Blocking für bekannte schädliche IPs
const blockedIPs = new Set([
    // Beispiel schädliche IPs (können erweitert werden)
    '192.168.1.100',  // Beispiel
    '10.0.0.1'        // Beispiel
]);

const ipBlocker = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (blockedIPs.has(clientIP)) {
        console.log(`🚨 Blocked IP attempted access: ${clientIP}`);
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Access denied'
        });
    }
    
    next();
};

module.exports = {
    secureCorseOptions,
    rateLimits,
    helmetConfig,
    validateRequest,
    securityLogger,
    ipBlocker
};