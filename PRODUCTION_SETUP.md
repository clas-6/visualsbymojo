# visualsbyiammojo Contact Form - Production Setup Guide

## Overview
The visualsbyiammojo contact form has been upgraded with production-ready features including:

**CSRF Protection** - Prevents cross-site request forgery attacks  
**Rate Limiting** - Prevents spam and abuse (5 requests per hour per IP)  
**Enhanced Input Validation** - Server-side and client-side validation  
**PHPMailer Integration** - Reliable SMTP email sending  
**Comprehensive Logging** - Security events and email tracking  
**Auto-reply Functionality** - Automatic confirmation emails  

Quick Setup

### 1. Configure Email Settings
Edit `PhotoFolio/config/email_config.php`:

```php
// SMTP Configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-app-password');

// Email Settings
define('FROM_EMAIL', 'your-email@gmail.com');
define('TO_EMAIL', 'akindeleenoch2007@gmail.com');

// Security
define('CSRF_SECRET', 'change-this-to-random-string');
define('DEVELOPMENT_MODE', false); // Set to false in production
```

### 2. Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Use this password in `SMTP_PASSWORD`

### 3. Directory Permissions
Ensure these directories exist and are writable:
```bash
mkdir -p PhotoFolio/logs
chmod 755 PhotoFolio/logs
chmod 755 PhotoFolio/config
```

### 4. Security Configuration
1. Change the `CSRF_SECRET` to a random 32+ character string
2. Set `DEVELOPMENT_MODE` to `false` in production
3. Review rate limiting settings (default: 5 requests per hour)

## 📧 Email Provider Configurations

### Gmail
```php
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_SECURE', 'tls');
```

### Outlook/Hotmail
```php
define('SMTP_HOST', 'smtp-mail.outlook.com');
define('SMTP_PORT', 587);
define('SMTP_SECURE', 'tls');
```

### Custom SMTP
```php
define('SMTP_HOST', 'mail.yourdomain.com');
define('SMTP_PORT', 587);
define('SMTP_SECURE', 'tls');
```

## Configuration Options

### Rate Limiting
```php
define('RATE_LIMIT_REQUESTS', 5);    // Max requests per window
define('RATE_LIMIT_WINDOW', 3600);   // Time window in seconds
```

### File Paths
```php
define('LOG_FILE', '../logs/contact_messages.log');
define('RATE_LIMIT_FILE', '../logs/rate_limit.json');
```

## Security Features

### CSRF Protection
- Automatically generates unique tokens per session
- Validates tokens on form submission
- Tokens refresh after successful submission

### Input Validation
- Server-side sanitization and validation
- Length limits (Name: 100, Subject: 200, Message: 2000 chars)
- Email format validation
- Basic spam keyword detection

### Rate Limiting
- IP-based request limiting
- Configurable limits and time windows
- Automatic cleanup of old entries

## Logging and Monitoring

### Contact Messages Log
Location: `PhotoFolio/logs/contact_messages.log`
```json
{
  "timestamp": "2025-01-31 21:30:00",
  "ip": "192.168.1.100",
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry",
  "status": "sent"
}
```

### Security Events Log
Location: `PhotoFolio/logs/security.log`
```json
{
  "timestamp": "2025-01-31 21:30:00",
  "ip": "192.168.1.100",
  "event": "rate_limit_exceeded",
  "details": {"attempts": 6}
}
```

##  Frontend Features

### Real-time Validation
- Client-side validation before submission
- Visual feedback for errors
- Character counter for message field

### Enhanced UX
- Loading states during submission
- Success/error message display
- Form reset after successful submission
- CSRF token auto-refresh

##  Troubleshooting

### Common Issues

**1. Email not sending**
- Check SMTP credentials
- Verify firewall/hosting provider allows SMTP
- Enable debug mode: `define('DEVELOPMENT_MODE', true);`

**2. CSRF token errors**
- Ensure sessions are working
- Check if session storage is writable
- Verify CSRF_SECRET is set

**3. Rate limiting too strict**
- Adjust `RATE_LIMIT_REQUESTS` and `RATE_LIMIT_WINDOW`
- Clear rate limit file: `rm PhotoFolio/logs/rate_limit.json`

**4. Permission errors**
- Make logs directory writable: `chmod 755 PhotoFolio/logs`
- Check PHP error logs for specific issues

### Debug Mode
Enable debugging in `email_config.php`:
```php
define('DEVELOPMENT_MODE', true);
```

This will:
- Show detailed error messages
- Enable SMTP debug output
- Log additional debug information

##  File Structure
```
PhotoFolio/
├── config/
│   └── email_config.php          # Email and security configuration
├── includes/
│   ├── security.php              # Security helper functions
│   └── email_handler.php         # PHPMailer email handler
├── forms/
│   └── contact.php               # Main form processor
├── assets/
│   ├── js/
│   │   └── contact.js            # Enhanced frontend JavaScript
│   └── vendor/
│       └── phpmailer/            # PHPMailer library
├── logs/                         # Log files (create if needed)
│   ├── contact_messages.log
│   ├── security.log
│   └── rate_limit.json
└── contact.html                  # Updated contact form
```

##  Migration from Old System

1. **Backup existing**: Save current `contact.php` and `contact_messages.txt`
2. **Update configuration**: Set email credentials in `email_config.php`
3. **Test thoroughly**: Send test messages before going live
4. **Monitor logs**: Check logs for any issues after deployment

## Performance Tips

1. **Log rotation**: Implement log rotation for large sites
2. **Caching**: Consider caching CSRF tokens for high-traffic sites
3. **Database**: For high volume, consider moving logs to database
4. **CDN**: Serve static assets via CDN

##  Support

If you encounter issues:
1. Check PHP error logs
2. Enable debug mode
3. Verify server requirements (PHP 7.4+)
4. Test SMTP connection manually

Remember to disable debug mode and set secure credentials before going live!
