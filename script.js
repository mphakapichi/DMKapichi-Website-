// Security: Content Security Policy violation handler
document.addEventListener('securitypolicyviolation', (e) => {
    console.warn('CSP Violation:', {
        violatedDirective: e.violatedDirective,
        blockedURI: e.blockedURI,
        sourceFile: e.sourceFile,
        lineNumber: e.lineNumber
    });
    // In production, send this to monitoring service
});

// Security: Prevent XSS in dynamic content
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Security: Safe query selector with validation
function safeQuerySelector(selector) {
    try {
        // Validate selector against potential injection
        if (typeof selector !== 'string' || selector.length > 500) {
            return null;
        }
        // Basic validation for common injection patterns
        if (/[<>'"&]/.test(selector)) {
            console.warn('Potentially unsafe selector detected:', selector);
            return null;
        }
        return document.querySelector(selector);
    } catch (e) {
        console.error('Invalid selector:', selector, e);
        return null;
    }
}

// Security: Rate limiting for user interactions
const interactionLimiter = {
    lastInteraction: 0,
    minInterval: 100, // Minimum 100ms between interactions

    check() {
        const now = Date.now();
        if (now - this.lastInteraction < this.minInterval) {
            return false;
        }
        this.lastInteraction = now;
        return true;
    }
};

// Theme Toggle: Light and Dark Mode
const themeManager = {
    init() {
        const savedTheme = safeStorage.get('theme') || 'dark';
        this.setTheme(savedTheme);
        
        const themeBtn = safeQuerySelector('#themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggle());
        }
    },
    
    setTheme(theme) {
        const body = document.body;
        if (theme === 'light') {
            body.classList.add('light-mode');
        } else {
            body.classList.remove('light-mode');
        }
        safeStorage.set('theme', theme);
        this.updateIcon();
    },
    
    toggle() {
        const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },
    
    updateIcon() {
        const themeBtn = safeQuerySelector('#themeToggle i');
        if (themeBtn) {
            const isLight = document.body.classList.contains('light-mode');
            themeBtn.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
};

// Security: Input validation for forms (if any exist)
function validateInput(input, type = 'text') {
    if (!input || typeof input !== 'string') return false;

    const patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        text: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
        name: /^[a-zA-Z\s\-']+$/
    };

    const pattern = patterns[type];
    return pattern ? pattern.test(input) : true;
}

// Security: Safe local storage operations
const safeStorage = {
    set(key, value) {
        try {
            if (typeof key !== 'string' || key.length > 100) return false;
            const safeValue = JSON.stringify(value);
            if (safeValue.length > 5000) return false; // Size limit
            localStorage.setItem(key, safeValue);
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },

    get(key) {
        try {
            if (typeof key !== 'string') return null;
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.error('Storage retrieval error:', e);
            return null;
        }
    }
};

// Security: Monitor for suspicious activity
const securityMonitor = {
    suspiciousPatterns: [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /eval\(/i,
        /document\.cookie/i
    ],

    checkString(str) {
        if (typeof str !== 'string') return false;
        return this.suspiciousPatterns.some(pattern => pattern.test(str));
    },

    logSuspiciousActivity(type, details) {
        console.warn(`Security Alert - ${type}:`, details);
        // In production, send to security monitoring service
    }
};

// Loader - hide after timeout with security check
setTimeout(() => {
    const loader = safeQuerySelector('#loader');
    if (loader && !securityMonitor.checkString(loader.outerHTML)) {
        loader.classList.add('hidden');
    }
}, 2400);

// Set current year with validation
const currentYear = new Date().getFullYear();
if (currentYear >= 2020 && currentYear <= 2030) {
    const yearElement = safeQuerySelector('#year');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
}

// Mobile menu toggle with rate limiting
const mobileMenuBtn = safeQuerySelector('#mobileMenuBtn');
const navLinks = safeQuerySelector('#navLinks');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!interactionLimiter.check()) return;

        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
        }
    });
}

// Smooth scrolling with security validation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        if (!interactionLimiter.check()) return;

        const href = this.getAttribute('href');
        if (!href || href.length > 100 || !/^#[a-zA-Z][a-zA-Z0-9_-]*$/.test(href)) {
            securityMonitor.logSuspiciousActivity('Invalid anchor href', href);
            return;
        }

        const target = safeQuerySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            if (navLinks) navLinks.classList.remove('active');
            const icon = mobileMenuBtn?.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        }
    });
});

// Parallax effect on hero with security validation
window.addEventListener('scroll', () => {
    if (!interactionLimiter.check()) return;

    const scrolled = window.pageYOffset;
    if (scrolled < 0 || scrolled > 10000) return; // Sanity check

    const hero = safeQuerySelector('.hero-bg');
    if (hero) {
        const transformValue = `translateY(${Math.max(-500, Math.min(500, scrolled * 0.5))}px)`;
        hero.style.transform = transformValue;
    }
});

// Scroll animations with security
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !securityMonitor.checkString(entry.target.className)) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    if (el && !securityMonitor.checkString(el.outerHTML)) {
        observer.observe(el);
    }
});

// Hide/show navbar on scroll with security
let lastScroll = 0;
const navbar = safeQuerySelector('#navbar');

window.addEventListener('scroll', () => {
    if (!interactionLimiter.check()) return;

    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        if (navbar) navbar.classList.remove('hidden');
        return;
    }

    if (currentScroll > lastScroll && currentScroll > 100) {
        if (navbar) navbar.classList.add('hidden');
    } else {
        if (navbar) navbar.classList.remove('hidden');
    }

    lastScroll = currentScroll;
});

// Scroll to top button with security
const scrollTopBtn = safeQuerySelector('#scrollTop');

window.addEventListener('scroll', () => {
    if (!interactionLimiter.check()) return;

    const scrollY = window.pageYOffset;
    if (scrollY > 300 && scrollY < 100000) { // Reasonable bounds
        if (scrollTopBtn) scrollTopBtn.classList.add('visible');
    } else {
        if (scrollTopBtn) scrollTopBtn.classList.remove('visible');
    }
});

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!interactionLimiter.check()) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Add ripple effect to buttons with security
document.querySelectorAll('.btn').forEach(button => {
    if (button && !securityMonitor.checkString(button.outerHTML)) {
        button.addEventListener('click', function(e) {
            if (!interactionLimiter.check()) return;

            const rect = this.getBoundingClientRect();
            if (rect.width > 1000 || rect.height > 1000) return; // Sanity check

            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            // Validate coordinates
            if (Math.abs(x) > 2000 || Math.abs(y) > 2000) return;

            ripple.style.width = ripple.style.height = Math.min(size, 200) + 'px'; // Size limit
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 600);
        });
    }
});

// Typing effect for hero subtitle
const subtitle = document.querySelector('.hero-subtitle');
const originalText = subtitle.textContent;
subtitle.textContent = '';
let i = 0;

function typeWriter() {
    if (i < originalText.length) {
        subtitle.textContent += originalText.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
    }
}

setTimeout(typeWriter, 1000);

// Cybersecurity-themed Particles animation
class Particle {
    constructor(canvas, type) {
        this.canvas = canvas;
        this.type = type;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 4 + 2;
        this.opacity = Math.random() * 0.8 + 0.4;
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = (Math.random() - 0.5) * 0.03;
        this.amplitude = Math.random() * 30 + 10;
        this.baseX = this.x;
        this.baseY = this.y;
        this.pulseAngle = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.08 + 0.02;
        this.baseSize = this.size;
        this.hue = this.getTypeHue();
        this.hueSpeed = (Math.random() - 0.5) * 0.8;
        this.speed = Math.random() * 1.5 + 0.5;
        this.direction = Math.random() * Math.PI * 2;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.binaryValue = Math.random() > 0.5 ? '0' : '1';
        this.scanAngle = 0;
        this.scanSpeed = Math.random() * 0.02 + 0.01;
    }

    getTypeHue() {
        const typeHues = {
            'server': 210,    // rack blue
            'database': 200,  // database teal
            'router': 260,    // purple
            'cloud': 190,     // soft cyan
            'terminal': 120,  // green-like
            'log': 30,        // amber
            'cable': 195      // bluish
        };
        return typeHues[this.type] || 200;
    }

    update(mouseX, mouseY) {
        switch(this.type) {
            case 'server':
                this.updateServer(mouseX, mouseY);
                break;
            case 'database':
                this.updateDatabase(mouseX, mouseY);
                break;
            case 'router':
                this.updateRouter(mouseX, mouseY);
                break;
            case 'cloud':
                this.updateCloud(mouseX, mouseY);
                break;
            case 'terminal':
                this.updateTerminal(mouseX, mouseY);
                break;
            case 'log':
                this.updateLog(mouseX, mouseY);
                break;
            case 'cable':
                this.updateCable(mouseX, mouseY);
                break;
            default:
                this.updateDefault(mouseX, mouseY);
        }
    }

    updateDataPacket(mouseX, mouseY) {
        // Move in straight lines like network packets
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;

        // Change direction occasionally
        if (Math.random() < 0.005) {
            this.direction += (Math.random() - 0.5) * Math.PI / 4;
        }

        // Wrap around edges
        this.wrapEdges();

        // Mouse interaction
        this.handleMouseInteraction(mouseX, mouseY, 0.08);
    }

    updateEncryption(mouseX, mouseY) {
        // Oscillating motion like encryption waves
        this.angle += this.angleSpeed;
        this.x = this.baseX + Math.sin(this.angle) * this.amplitude;
        this.y = this.baseY + Math.cos(this.angle * 0.7) * this.amplitude * 0.8;

        this.baseX += Math.cos(this.direction) * this.speed * 0.3;
        this.baseY += Math.sin(this.direction) * this.speed * 0.3;

        this.wrapEdges();
        this.handleMouseInteraction(mouseX, mouseY, 0.06);
    }

    updateFirewall(mouseX, mouseY) {
        // legacy - keep as gentle pulse for compatibility
        this.pulseAngle += this.pulseSpeed;
        this.size = this.baseSize + Math.sin(this.pulseAngle) * 1.5;
        this.angle += this.angleSpeed * 0.4;
        this.x = this.baseX + Math.cos(this.angle) * this.amplitude * 0.4;
        this.y = this.baseY + Math.sin(this.angle) * this.amplitude * 0.4;
        this.handleMouseInteraction(mouseX, mouseY, 0.03);
    }

    updateNetworkNode(mouseX, mouseY) {
        // legacy network node behavior
        this.angle += this.angleSpeed * 0.25;
        this.x = this.baseX + Math.sin(this.angle) * this.amplitude * 0.5;
        this.y = this.baseY + Math.cos(this.angle) * this.amplitude * 0.5;
        this.wrapEdges();
        this.handleMouseInteraction(mouseX, mouseY, 0.02);
    }

    updateBinary(mouseX, mouseY) {
        // legacy binary behavior
        this.x += (Math.random() - 0.5) * 2.5;
        this.y += (Math.random() - 0.5) * 2.5;
        if (Math.random() < 0.008) {
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
            this.binaryValue = this.binaryValue === '0' ? '1' : '0';
        }
        this.wrapEdges();
        this.handleMouseInteraction(mouseX, mouseY, 0.06);
    }

    updateSecurityScan(mouseX, mouseY) {
        // legacy scan behavior
        this.scanAngle += this.scanSpeed;
        this.x = this.canvas.width / 2 + Math.cos(this.scanAngle) * this.amplitude * 0.8;
        this.y = this.canvas.height / 2 + Math.sin(this.scanAngle) * this.amplitude * 0.8;
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.size = distance < 60 ? this.baseSize * 1.4 : this.baseSize;
    }

    updateCircuit(mouseX, mouseY) {
        // legacy circuit behavior
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;
        if (Math.random() < 0.02) {
            this.direction += Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 4;
        }
        this.wrapEdges();
        this.handleMouseInteraction(mouseX, mouseY, 0.05);
    }

    updateDefault(mouseX, mouseY) {
        // Fallback to original wave motion
        this.angle += this.angleSpeed;
        this.x = this.baseX + Math.sin(this.angle) * this.amplitude;
        this.y = this.baseY + Math.cos(this.angle) * this.amplitude;

        this.baseX += this.vx || 0;
        this.baseY += this.vy || 0;

        this.wrapEdges();
        this.handleMouseInteraction(mouseX, mouseY, 0.05);
    }

    wrapEdges() {
        if (this.x < 0) this.x = this.canvas.width;
        if (this.x > this.canvas.width) this.x = 0;
        if (this.y < 0) this.y = this.canvas.height;
        if (this.y > this.canvas.height) this.y = 0;

        // Also wrap base positions
        if (this.baseX < 0) this.baseX = this.canvas.width;
        if (this.baseX > this.canvas.width) this.baseX = 0;
        if (this.baseY < 0) this.baseY = this.canvas.height;
        if (this.baseY > this.canvas.height) this.baseY = 0;
    }

    handleMouseInteraction(mouseX, mouseY, force) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
            const repelForce = (120 - distance) / 120 * force;
            // Routers and cables change direction when near the mouse
            if (this.type === 'router' || this.type === 'cable') {
                this.direction += Math.atan2(dy, dx) * repelForce;
            } else {
                this.baseX -= (dx / distance) * repelForce;
                this.baseY -= (dy / distance) * repelForce;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        switch(this.type) {
            case 'server':
                this.drawServer(ctx);
                break;
            case 'database':
                this.drawDatabase(ctx);
                break;
            case 'router':
                this.drawRouter(ctx);
                break;
            case 'cloud':
                this.drawCloud(ctx);
                break;
            case 'terminal':
                this.drawTerminal(ctx);
                break;
            case 'log':
                this.drawLog(ctx);
                break;
            case 'cable':
                this.drawCable(ctx);
                break;
            default:
                this.drawDefault(ctx);
        }

        ctx.restore();
    }

    /* New update methods for IT-themed particles */
    updateServer(mouseX, mouseY) {
        // Stable rack-like hover with subtle vertical bob
        this.pulseAngle += this.pulseSpeed * 0.6;
        this.size = this.baseSize + Math.sin(this.pulseAngle) * 1.2;
        this.y = this.baseY + Math.sin(this.angle * 0.5) * 6;
        this.angle += this.angleSpeed * 0.2;
        this.handleMouseInteraction(mouseX, mouseY, 0.02);
        this.wrapEdges();
    }

    updateDatabase(mouseX, mouseY) {
        // Circular orbit like rotating DB cluster
        this.angle += this.angleSpeed * 0.6;
        this.x = this.baseX + Math.cos(this.angle) * this.amplitude * 0.6;
        this.y = this.baseY + Math.sin(this.angle) * this.amplitude * 0.6;
        this.rotation += this.rotationSpeed * 0.02;
        this.handleMouseInteraction(mouseX, mouseY, 0.03);
        this.wrapEdges();
    }

    updateRouter(mouseX, mouseY) {
        // Fast, edge-following with quick direction changes
        this.x += Math.cos(this.direction) * this.speed * 1.6;
        this.y += Math.sin(this.direction) * this.speed * 1.6;
        if (Math.random() < 0.04) this.direction += (Math.random() - 0.5) * Math.PI / 2;
        this.handleMouseInteraction(mouseX, mouseY, 0.07);
        this.wrapEdges();
    }

    updateCloud(mouseX, mouseY) {
        // Slow drifting cloud
        this.baseX += Math.cos(this.angle) * 0.2;
        this.baseY += Math.sin(this.angle * 0.8) * 0.15;
        this.x += (this.baseX - this.x) * 0.02;
        this.y += (this.baseY - this.y) * 0.02;
        this.angle += this.angleSpeed * 0.08;
        this.handleMouseInteraction(mouseX, mouseY, 0.01);
        this.wrapEdges();
    }

    updateTerminal(mouseX, mouseY) {
        // Terminal drops a blinking prompt
        if (Math.random() < 0.015) this.binaryValue = Math.random() > 0.5 ? '>' : ':';
        this.pulseAngle += this.pulseSpeed;
        this.size = this.baseSize + Math.sin(this.pulseAngle) * 0.6;
        this.wrapEdges();
    }

    updateLog(mouseX, mouseY) {
        // Slowly drift downward, fade out
        this.y += this.speed * 0.6;
        if (this.y > this.canvas.height) this.y = -10;
        this.opacity = Math.max(0.15, Math.min(1, this.opacity - 0.0005));
    }

    updateCable(mouseX, mouseY) {
        // Zigzag cable traces
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed * 0.4;
        if (Math.random() < 0.02) this.direction += (Math.random() - 0.5) * Math.PI / 3;
        this.wrapEdges();
    }

    /* New draw methods for IT-themed particles */
    drawServer(ctx) {
        ctx.fillStyle = `hsl(${this.hue}, 70%, 45%)`;
        const w = this.size * 3;
        const h = this.size * 2.2;
        ctx.fillRect(this.x - w/2, this.y - h/2, w, h);
        ctx.fillStyle = `rgba(0,0,0,0.2)`;
        ctx.fillRect(this.x - w/2 + 6, this.y - h/4, w - 12, 4);
    }

    drawDatabase(ctx) {
        // simple cylinder
        const r = this.size * 1.6;
        ctx.fillStyle = `hsl(${this.hue}, 70%, 55%)`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - r*0.2, r, r*0.35, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillRect(this.x - r, this.y - r*0.2, r*2, r*0.8);
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + r*0.6, r, r*0.35, 0, 0, Math.PI*2);
        ctx.fill();
    }

    drawRouter(ctx) {
        ctx.fillStyle = `hsl(${this.hue}, 70%, 55%)`;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x + this.size, this.y + this.size);
        ctx.lineTo(this.x - this.size, this.y + this.size);
        ctx.closePath();
        ctx.fill();
    }

    drawCloud(ctx) {
        ctx.fillStyle = `hsla(${this.hue},60%,60%,${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size*2, 0, Math.PI*2);
        ctx.arc(this.x + this.size, this.y - this.size*0.5, this.size*1.4, 0, Math.PI*2);
        ctx.arc(this.x - this.size, this.y - this.size*0.5, this.size*1.2, 0, Math.PI*2);
        ctx.fill();
    }

    drawTerminal(ctx) {
        ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`;
        ctx.font = `${this.size * 2.6}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.binaryValue || '>', this.x, this.y);
    }

    drawLog(ctx) {
        ctx.strokeStyle = `hsla(${this.hue},70%,50%,${this.opacity})`;
        ctx.lineWidth = Math.max(1, this.size * 0.25);
        ctx.beginPath();
        ctx.moveTo(this.x - this.size, this.y - this.size*0.5);
        ctx.lineTo(this.x + this.size, this.y + this.size*0.5);
        ctx.stroke();
    }

    drawCable(ctx) {
        ctx.strokeStyle = `hsl(${this.hue},70%,55%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size, this.y);
        ctx.lineTo(this.x, this.y + this.size);
        ctx.lineTo(this.x + this.size, this.y);
        ctx.stroke();
    }

    drawDataPacket(ctx) {
        // Draw as small rectangle with glow
        ctx.fillStyle = `hsl(${this.hue}, 80%, 60%)`;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        // Add glow effect
        ctx.shadowColor = `hsl(${this.hue}, 80%, 60%)`;
        ctx.shadowBlur = 5;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.shadowBlur = 0;
    }

    drawEncryption(ctx) {
        // Draw as rotating key/lock symbol
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        this.rotation += this.rotationSpeed;

        ctx.fillStyle = `hsl(${this.hue}, 80%, 60%)`;
        // Simple key shape
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Key bit
        ctx.fillRect(-this.size/4, -this.size/2, this.size/2, this.size/4);
        ctx.fillRect(0, -this.size/2, this.size/4, this.size);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    drawFirewall(ctx) {
        // Draw as pulsing shield
        ctx.strokeStyle = `hsl(${this.hue}, 80%, 60%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.stroke();

        // Inner shield pattern
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x - this.size * 0.7, this.y + this.size * 0.3);
        ctx.lineTo(this.x + this.size * 0.7, this.y + this.size * 0.3);
        ctx.closePath();
        ctx.stroke();
    }

    drawNetworkNode(ctx) {
        // Draw as larger node with connections
        ctx.fillStyle = `hsl(${this.hue}, 80%, 60%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Add node rings
        ctx.strokeStyle = `hsl(${this.hue}, 60%, 40%)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawBinary(ctx) {
        // Draw as text
        ctx.fillStyle = `hsl(${this.hue}, 80%, 60%)`;
        ctx.font = `${this.size * 3}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.binaryValue, this.x, this.y);
    }

    drawSecurityScan(ctx) {
        // Draw as sweeping radar beam
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 60%, 0.8)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 80%, 60%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, this.scanAngle - Math.PI/6, this.scanAngle + Math.PI/6);
        ctx.lineTo(this.x, this.y);
        ctx.fill();
    }

    drawCircuit(ctx) {
        // Draw as circuit trace with nodes
        ctx.strokeStyle = `hsl(${this.hue}, 80%, 60%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size, this.y);
        ctx.lineTo(this.x + this.size, this.y);
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x, this.y + this.size);
        ctx.stroke();

        // Circuit node
        ctx.fillStyle = `hsl(${this.hue}, 80%, 60%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawDefault(ctx) {
        // Fallback to simple circle
        ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    const canvas = safeQuerySelector('#particles-canvas');
    if (!canvas || securityMonitor.checkString(canvas.outerHTML)) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let animationId;
    let isInitialized = false;

    function resizeCanvas() {
        const hero = safeQuerySelector('.hero');
        if (hero) {
            const rect = hero.getBoundingClientRect();
            // Validate dimensions
            const width = Math.min(Math.max(rect.width, 100), 4000);
            const height = Math.min(Math.max(rect.height, 100), 4000);
            canvas.width = width;
            canvas.height = height;
        } else {
            canvas.width = Math.min(window.innerWidth, 4000);
            canvas.height = Math.min(window.innerHeight, 4000);
        }
    }

    function createParticles() {
        particles = [];
        const canvasArea = canvas.width * canvas.height;
        if (canvasArea <= 0 || canvasArea > 16000000) return; // Sanity check

        const particleCount = Math.min(200, Math.max(10, Math.floor(canvasArea / 8000)));

        // Define particle type distribution with validation
        const particleTypes = [
            'server', 'server',
            'database', 'database',
            'router', 'router', 'router',
            'cloud', 'cloud',
            'terminal', 'terminal', 'terminal',
            'log',
            'cable', 'cable', 'cable'
        ];

        for (let i = 0; i < particleCount && i < particleTypes.length; i++) {
            const typeIndex = i % particleTypes.length;
            const type = particleTypes[typeIndex];
            if (typeof type === 'string' && type.length < 20) {
                particles.push(new Particle(canvas, type));
            }
        }
    }

    function drawConnections() {
        if (!particles || particles.length === 0) return;

        ctx.globalAlpha = 0.12;
        const maxIterations = Math.min(particles.length * 2, 1000); // Prevent excessive computation
        let iterations = 0;

        for (let i = 0; i < particles.length && iterations < maxIterations; i++) {
            for (let j = i + 1; j < particles.length && iterations < maxIterations; j++) {
                iterations++;
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Validate distance
                if (distance <= 0 || distance > 1000) continue;

                let maxDistance = 100;
                let lineOpacity = 0.08;
                let lineWidth = 0.5;

                // Servers/databases act as hubs connecting strongly
                if (particles[i].type === 'server' || particles[j].type === 'server' || particles[i].type === 'database' || particles[j].type === 'database') {
                    maxDistance = 160;
                    lineOpacity = 0.25;
                    lineWidth = 1;
                }
                // Cables form streams
                else if (particles[i].type === 'cable' && particles[j].type === 'cable') {
                    maxDistance = 90;
                    lineOpacity = 0.2;
                }
                // Routers connect in directed patterns
                else if (particles[i].type === 'router' && particles[j].type === 'router') {
                    maxDistance = 120;
                    lineOpacity = 0.18;
                }
                // Clouds link broadly but softly
                else if (particles[i].type === 'cloud' || particles[j].type === 'cloud') {
                    maxDistance = 200;
                    lineOpacity = 0.12;
                }

                if (distance < maxDistance && lineOpacity > 0 && lineOpacity <= 1) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);

                    // Validate hue values
                    const hue1 = Math.max(0, Math.min(360, particles[i].hue || 200));
                    const hue2 = Math.max(0, Math.min(360, particles[j].hue || 200));
                    const avgHue = (hue1 + hue2) / 2;

                    ctx.strokeStyle = `hsla(${avgHue}, 70%, 50%, ${lineOpacity})`;
                    ctx.lineWidth = Math.max(0.1, Math.min(5, lineWidth));
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            if (particle && typeof particle.update === 'function') {
                particle.update(mouseX, mouseY);
            }
            if (particle && typeof particle.draw === 'function') {
                particle.draw(ctx);
            }
        });

        drawConnections();
        animationId = requestAnimationFrame(animate);
    }

    // Mouse movement tracking with bounds checking
    canvas.addEventListener('mousemove', (e) => {
        if (!interactionLimiter.check()) return;

        const rect = canvas.getBoundingClientRect();
        mouseX = Math.max(-100, Math.min(e.clientX - rect.left, canvas.width + 100));
        mouseY = Math.max(-100, Math.min(e.clientY - rect.top, canvas.height + 100));
    });

    canvas.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    // Initialize with error handling
    try {
        resizeCanvas();
        createParticles();
        if (particles.length > 0) {
            animate();
            isInitialized = true;
        }
    } catch (error) {
        console.error('Particles initialization failed:', error);
        return;
    }

    // Handle resize with throttling
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (isInitialized) {
                resizeCanvas();
                createParticles();
            }
        }, 250);
    });

    // Cleanup function
    return () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        isInitialized = false;
    };
}

// Initialize particles when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    themeManager.init();

    // Image fallback without inline handlers (avoids security pattern match)
    try {
        const profileImg = safeQuerySelector('.profile-icon img');
        if (profileImg) {
            profileImg.addEventListener('error', function () {
                const parent = this.parentElement;
                if (parent) parent.innerHTML = "<i class='fas fa-user' style='font-size: 2rem;'></i>";
            });
        }
    } catch (e) {
        console.error('Image fallback setup failed:', e);
    }

    // Contact form handling: client-side validation + local fallback
    try {
        const contactForm = safeQuerySelector('#contactForm');
        const statusEl = safeQuerySelector('#cf-status');
        if (contactForm) {
            contactForm.addEventListener('submit', (ev) => {
                ev.preventDefault();
                if (!interactionLimiter.check()) return;

                const name = (safeQuerySelector('#cf-name')?.value || '').trim();
                const email = (safeQuerySelector('#cf-email')?.value || '').trim();
                const subject = (safeQuerySelector('#cf-subject')?.value || '').trim();
                const message = (safeQuerySelector('#cf-message')?.value || '').trim();

                if (!validateInput(name, 'name')) {
                    if (statusEl) statusEl.textContent = 'Please provide a valid name.';
                    return;
                }
                if (!validateInput(email, 'email')) {
                    if (statusEl) statusEl.textContent = 'Please provide a valid email.';
                    return;
                }
                if (!validateInput(subject, 'text')) {
                    if (statusEl) statusEl.textContent = 'Please provide a valid subject.';
                    return;
                }
                if (!validateInput(message, 'text')) {
                    if (statusEl) statusEl.textContent = 'Please provide a valid message.';
                    return;
                }

                const payload = { name, email, subject, message, created: new Date().toISOString() };
                const saved = safeStorage.set('lastContact', payload);
                if (saved) {
                    if (statusEl) statusEl.textContent = 'Message saved locally. Thank you — I will respond soon.';
                    contactForm.reset();
                } else {
                    if (statusEl) statusEl.textContent = 'Unable to save message locally. Please email directly.';
                }
            });
        }
    } catch (err) {
        console.error('Contact form setup failed:', err);
    }
});