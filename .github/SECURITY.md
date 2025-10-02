# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in InAppBrowserEscaper, please report it by emailing us or creating a private security advisory on GitHub.

### What to include in your report:

1. A description of the vulnerability
2. Steps to reproduce the issue
3. Potential impact of the vulnerability
4. Any suggested fixes or mitigations

### Response timeline:

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a detailed response within 7 days indicating the next steps
- We will work to patch confirmed vulnerabilities as quickly as possible

## Security Considerations

This library handles browser detection and user agent parsing. While it doesn't handle sensitive data directly, consider these security aspects:

- User agent strings can potentially be spoofed
- Always validate and sanitize any user inputs
- Be cautious when using this library in server-side environments
- Keep the library updated to receive security patches