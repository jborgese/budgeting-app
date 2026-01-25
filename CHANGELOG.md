# Changelog

All notable changes to the Budgeting App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Automatic tax data updates from IRS API
- Multi-year comparison view
- Investment income calculations
- Retirement contribution optimization
- Mobile native apps (iOS/Android)
- Dark mode theme
- Multiple user profiles

## [1.0.0] - 2026-01-24

### Added
- Initial release of Budgeting App
- Federal income tax calculations for all filing statuses
- State income tax calculations for all 50 US states
- FICA tax calculations (Social Security and Medicare)
- Support for tax years 2024, 2025, and 2026
- Pre-tax deductions (401k, HSA, etc.)
- Fixed expense tracking (rent, utilities, groceries, transportation)
- Custom expense management (add/remove unlimited expenses)
- Data persistence using localStorage
- Excel export functionality
- Electron desktop application support
- Express web server deployment
- Docker containerization support
- Cloudflare Workers edge deployment
- Responsive Bootstrap UI
- Toast notifications for errors and success messages
- Enhanced input validation with detailed error messages
- Interactive tax data update script
- Comprehensive documentation (README, CONTRIBUTING, DEPLOYMENT, API)

### Tax Data
- 2024 Federal tax brackets and standard deductions
- 2025 Federal tax brackets and standard deductions
- 2026 Federal tax brackets and standard deductions
- All 50 states tax data for 2024-2026
- FICA wage limits and thresholds for 2024-2026

### Documentation
- README.md with full project overview
- CONTRIBUTING.md with contribution guidelines
- DEPLOYMENT.md with deployment instructions for all platforms
- API.md with complete API documentation
- UPDATE_TAX_DATA.md with annual tax update guide
- scripts/README.md with script documentation

### Development Tools
- Interactive tax data update script (`npm run update-tax-data`)
- Docker and Docker Compose configuration
- Wrangler configuration for Cloudflare Workers
- Electron builder configuration
- Code signing hooks for macOS/Windows

### Security
- Input validation for all user inputs
- XSS protection in data handling
- Safe localStorage usage with availability checks

## Version History

### Pre-release Development
- Project structure established
- Core calculation logic implemented
- UI design and implementation
- Data persistence implementation
- Export functionality added
- Multi-platform deployment support

---

## Release Notes

### Version 1.0.0 Highlights

**Comprehensive Tax Calculator**
The initial release provides accurate federal and state income tax calculations based on official IRS data. Users can calculate their take-home pay after taxes and expenses with support for multiple filing statuses and tax years.

**Multiple Deployment Options**
Deploy as a desktop app (Electron), web application (Express), edge function (Cloudflare Workers), or Docker container. Choose the deployment method that best fits your needs.

**User-Friendly Interface**
Clean, responsive design built with Bootstrap 5. Works seamlessly on desktop and mobile devices with intuitive controls and helpful error messages.

**Data Persistence**
Automatic saving of user data to localStorage means users never lose their information when they close the browser. Data loads automatically on return visits.

**Excel Export**
Export your financial data to Excel format for further analysis, record-keeping, or sharing with financial advisors.

**Easy Maintenance**
Includes an interactive script for updating tax data annually, plus comprehensive documentation for developers and users.

---

## Upgrade Guide

### From Pre-release to 1.0.0

No upgrade path needed for initial release.

### Future Upgrades

Upgrade instructions will be provided here for future versions.

---

## Breaking Changes

None in this release.

---

## Deprecation Notices

None in this release.

---

## Known Issues

### Current Limitations

1. **Tax Calculations**
   - Does not account for all deductions and credits
   - AMT (Alternative Minimum Tax) not calculated
   - Investment income not supported
   - Self-employment tax not included
   - Estimated tax penalties not calculated

2. **State Taxes**
   - Local/city income taxes not included
   - State-specific deductions not accounted for
   - Property tax deductions not included

3. **Data Persistence**
   - localStorage only (no server-side storage)
   - Data not synced across devices
   - No backup/restore functionality

4. **Export**
   - Excel export only (no PDF or other formats)
   - No print-optimized view

5. **Platform-Specific**
   - Electron app not code-signed (shows warning on first launch)
   - No auto-update functionality yet
   - No mobile native apps

### Planned Fixes

These limitations will be addressed in future releases. See [Unreleased](#unreleased) section for planned features.

---

## Migration Notes

### Data Migration

For future versions that change the data structure, migration instructions will be provided here.

### Configuration Changes

No configuration changes needed for initial release.

---

## Contributors

Thank you to all contributors who have helped with this release:

- Initial development and design
- Tax data research and validation
- Documentation writing
- Testing and feedback

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute.

---

## Support

For support, questions, or issues:
- Open an issue on GitHub
- Check the documentation files
- Review the API documentation

---

**Full Changelog**: https://github.com/yourusername/budgeting-app/commits/main
