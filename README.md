# Budgeting App

A comprehensive financial planning and budgeting web application that helps users calculate take-home pay after taxes and expenses. The app includes accurate federal and state tax calculations with support for multiple filing statuses and tax years.

## 🌟 Features

- **Accurate Tax Calculations**: Federal and state income tax calculations based on current IRS tax brackets
- **FICA Calculations**: Social Security and Medicare tax calculations with proper wage limits
- **Multiple Tax Years**: Support for tax years 2024, 2025, and 2026
- **Filing Status Support**: Single, Married Filing Jointly, Married Filing Separately, and Head of Household
- **State Tax Support**: All 50 US states with accurate state tax brackets
- **Expense Tracking**: Track fixed expenses (rent, utilities, groceries, transportation) and custom expenses
- **Data Persistence**: Automatic saving and loading of user data via localStorage
- **Multiple Deployment Options**: 
  - Electron desktop application
  - Web application (Express server)
  - Cloudflare Workers edge deployment
  - Docker containerized deployment
- **Export Functionality**: Export financial data to Excel format
- **Responsive Design**: Bootstrap-based UI that works on desktop and mobile devices

## 📋 Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Deployment Options](#deployment-options)
- [Tax Data Updates](#tax-data-updates)
- [Development](#development)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- **[API.md](docs/API.md)** - API endpoints and usage
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Application architecture overview
- **[ARCHITECTURE_DIAGRAM.md](docs/ARCHITECTURE_DIAGRAM.md)** - State management architecture diagrams
- **[STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md)** - State management system API reference
- **[STATE_MANAGEMENT_SUMMARY.md](docs/STATE_MANAGEMENT_SUMMARY.md)** - Quick state management overview
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Detailed deployment instructions
- **[UPDATE_TAX_DATA.md](docs/UPDATE_TAX_DATA.md)** - Guide for updating tax data
- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Contribution guidelines
- **[CHANGELOG.md](docs/CHANGELOG.md)** - Version history and changes

## 🚀 Installation

### Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/budgeting-app.git
cd budgeting-app
```

2. Install dependencies:
```bash
npm install
```

## 💻 Usage

### Running as Web Application

Start the Express server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Running as Electron Desktop App

To run in development mode:
```bash
npm run electron
```

To build the desktop application:
```bash
npm run dist
```

The built application will be in the `dist/` directory.

### Using the Application

1. **Enter Income Information**:
   - Annual salary
   - Pre-tax deductions (401k, HSA, etc.)
   - Select your state of residence
   - Choose tax year (2024, 2025, or 2026)
   - Select filing status

2. **Enter Fixed Expenses**:
   - Monthly rent
   - Utilities
   - Groceries
   - Transportation
   - Other fixed expenses

3. **Add Custom Expenses**:
   - Click "Add Expense" to add custom monthly expenses
   - Name each expense and enter the amount

4. **Calculate**:
   - Click "Calculate" to see your results
   - View breakdown of taxes, expenses, and monthly take-home pay

5. **Export Data** (optional):
   - Click "Export to Excel" to save your financial data

## 🌐 Deployment Options

### Option 1: Docker Deployment

Build and run with Docker:
```bash
docker build -t budgeting-app .
docker run -p 3001:3000 budgeting-app
```

Or use Docker Compose:
```bash
docker-compose up
```

The app will be available at `http://localhost:3001`

### Option 2: Cloudflare Workers

Deploy to Cloudflare's edge network for global, low-latency access:

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Authenticate with Cloudflare:
```bash
wrangler login
```

3. Configure `wrangler.toml` with your custom domain or use a workers.dev subdomain

4. Deploy:
```bash
wrangler deploy
```

### Option 3: Traditional Web Hosting

1. Build the application for production
2. Copy the `public/` directory to your web server
3. Serve `index.html` as the entry point
4. Ensure your server serves static files correctly

## 📊 Tax Data Updates

The application includes tax data that needs to be updated annually. See [UPDATE_TAX_DATA.md](UPDATE_TAX_DATA.md) for detailed instructions.

### Quick Update

Run the interactive update script:
```bash
npm run update-tax-data
```

The script will guide you through adding new tax year data. See [scripts/README.md](scripts/README.md) for more details.

### Manual Update

Edit `public/taxBrackets.js` to add new tax year data. Update:
- Federal tax brackets for all filing statuses
- Standard deductions
- FICA limits (Social Security wage base, Medicare thresholds)
- State tax brackets (if changed)

## 🛠️ Development

### Project Structure

```
budgeting-app/
├── public/                    # Frontend application files
│   ├── index.html            # Main HTML file
│   ├── app.js                # Core application logic
│   ├── taxBrackets.js        # Tax data for all years
│   ├── errorHandler.js       # Error handling utilities
│   ├── main.js               # Electron main process
│   ├── preload.js            # Electron preload script
│   └── assets/               # Icons and images
├── scripts/                   # Maintenance scripts
│   ├── updateTaxData.js      # Interactive tax data update script
│   ├── afterSignHook.js      # Electron code signing hook
│   └── README.md             # Scripts documentation
├── src/                      # Cloudflare Workers source
│   └── worker.js             # Edge worker script
├── server.js                 # Express server
├── Dockerfile                # Docker container definition
├── docker-compose.yml        # Docker Compose configuration
├── wrangler.toml             # Cloudflare Workers configuration
├── package.json              # Node.js dependencies and scripts
└── README.md                 # This file
```

### Key Files

- **public/app.js**: Main application logic including tax calculations, expense tracking, and data persistence
- **public/taxBrackets.js**: Comprehensive tax data structure for federal and state taxes
- **public/errorHandler.js**: Centralized error handling with user-friendly messages
- **server.js**: Express server for web deployment
- **src/worker.js**: Cloudflare Workers edge function
- **public/main.js**: Electron main process configuration

### Adding New Features

1. Create a new branch for your feature
2. Make your changes in the appropriate files:
   - UI changes: `public/index.html`
   - Logic changes: `public/app.js`
   - Tax data: `public/taxBrackets.js`
3. Test thoroughly with different scenarios
4. Submit a pull request

### Testing

Manual testing checklist:
- [ ] Test with different income levels
- [ ] Test all filing statuses
- [ ] Test all states
- [ ] Test different tax years
- [ ] Test custom expense addition/removal
- [ ] Test data persistence (reload page)
- [ ] Test Excel export
- [ ] Test edge cases (zero income, very high income, etc.)

## 🔧 Technologies Used

### Frontend
- **HTML5/CSS3**: Structure and styling
- **JavaScript (ES6+)**: Application logic
- **Bootstrap 5**: Responsive UI framework

### Backend/Runtime
- **Node.js**: JavaScript runtime
- **Express**: Web server framework
- **Electron**: Desktop application framework
- **Cloudflare Workers**: Edge computing platform

### Libraries
- **ExcelJS**: Excel file generation
- **@cloudflare/kv-asset-handler**: Static asset serving on Cloudflare

### Build Tools
- **electron-builder**: Electron app packaging
- **Wrangler**: Cloudflare Workers CLI
- **Docker**: Containerization

## 📝 Data Sources

Tax data is sourced from official government and reputable third-party sources:

- **Federal Tax Brackets**: [IRS.gov](https://www.irs.gov/filing/federal-income-tax-rates-and-brackets)
- **Standard Deductions**: [IRS Tax Inflation Adjustments](https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments)
- **FICA Limits**: [Social Security Administration](https://www.ssa.gov/oact/cola/cbb.html)
- **State Tax Data**: [Tax Foundation](https://taxfoundation.org/data/all/state/)

## ⚠️ Disclaimer

**This application provides tax estimates only.** Actual tax liability may vary based on:
- Additional deductions and credits
- Alternative Minimum Tax (AMT)
- Investment income and capital gains
- Self-employment income
- Other special circumstances

**Always consult a qualified tax professional for accurate tax advice and planning.**

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs**: Open an issue describing the bug and how to reproduce it
2. **Suggest features**: Open an issue with your feature suggestion
3. **Update tax data**: Submit PRs with updated tax brackets when new data is available
4. **Improve documentation**: Fix typos, clarify instructions, add examples
5. **Code contributions**: Follow the development guidelines above

### Contribution Guidelines

- Follow existing code style and conventions
- Test your changes thoroughly
- Update documentation as needed
- Keep commits focused and atomic
- Write clear commit messages

## 📄 License

ISC License

## 🙏 Acknowledgments

- IRS for providing public tax data
- Tax Foundation for comprehensive state tax information
- Bootstrap team for the excellent UI framework
- Electron team for the desktop application framework
- Cloudflare for the Workers platform

## 📞 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Check existing documentation in the [`docs/`](docs/) directory
- Review the code comments in `public/app.js` and `public/taxBrackets.js`

---

**Made with ❤️ for better financial planning**
