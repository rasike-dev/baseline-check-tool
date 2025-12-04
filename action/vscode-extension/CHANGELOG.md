# Change Log

All notable changes to the "baseline-check-tool" extension will be documented in this file.

## [2.4.1] - 2025-10-09

### Fixed
- ✅ **Dashboard Generation** - Now uses CLI's dashboard-hub command for full-featured dashboards
- ✅ **Navigation Bars** - All dashboards now include navigation bars
- ✅ **Dashboard Links** - Card links work properly between dashboards
- ✅ **Fallback Support** - Graceful fallback to basic dashboard if CLI command unavailable

### Changed
- Dashboard generation now calls `dashboard-hub` CLI command
- Better error handling with fallback to basic dashboard
- Improved dashboard consistency with CLI tool

## [2.4.0] - 2025-10-09

### Added
- ✅ **Self-Contained Extension**: baseline-check-tool now bundled with extension
- ✅ **Zero Setup Required**: Works immediately after installation, no npm install needed
- ✅ **Dashboard Hub Generation**: Automatic creation of main dashboard with 6 analysis cards
- ✅ **Smart Tool Detection**: Checks bundled, project, and global installations automatically
- ✅ **Debug Logging**: Shows which baseline-check path is being used for transparency
- ✅ **Better Error Messages**: Helpful installation instructions if tool somehow not found

### Changed
- Extension now includes baseline-check-tool as bundled dependency
- Dashboard generation creates hub (index.html) with links to all analysis types
- Tool path detection tries multiple locations: bundled → project → global
- Package size: 3.1 MB (includes all dependencies for self-contained operation)
- User experience: Install extension → Use immediately (no additional setup)

### Fixed
- Dashboard hub now generates automatically with proper navigation
- Compatibility dashboard created alongside hub
- Tool detection works correctly with bundled dependencies
- Better fallback handling for edge cases

### Technical
- Added baseline-check-tool to dependencies
- Updated path resolution for bundled CLI
- Enhanced error handling with helpful messages
- Improved dashboard HTML generation

## [2.3.0] - 2025-10-07

### Added
- **AI-Powered Analysis**: Smart code analysis with pattern detection and recommendations
- **Real-time Monitoring**: File watching with automatic analysis and alerts
- **Enhanced Performance Analysis**: Bundle optimization and performance metrics
- **Security Vulnerability Detection**: CWE/OWASP mapping with security scoring
- **Accessibility Analysis**: WCAG compliance checking and recommendations
- **SEO Optimization Analysis**: Technical and content SEO analysis
- **Bundle Analysis**: Size optimization and dependency management
- **Baseline-Specific Features**: Browser support detection and polyfill recommendations
- **Migration Assistant**: Risky-to-baseline feature transitions
- **Interactive Dashboards**: Real-time data visualization and analytics
- **VS Code Integration**: Seamless workspace analysis and reporting
- **Smart Recommendations**: Context-aware suggestions and auto-fixes
- **Comprehensive Testing**: 171 tests with 100% pass rate

### Enhanced
- **Dashboard UI**: Fixed chart generation and data visualization
- **Error Handling**: Improved error messages and user experience
- **Performance**: Optimized analysis speed and memory usage
- **Code Quality**: Enhanced code structure and maintainability

### Fixed
- Chart data generation issues in dashboards
- Text overlap in category charts
- Unnecessary scrollbars in analysis views
- Bundle optimizer detection logic
- Static report data loading

## [2.0.0] - 2025-10-06

### Added
- Core baseline compatibility analysis
- Browser support detection using MDN BCD
- Feature detection across multiple file types
- Basic dashboard generation
- CLI tool integration

### Changed
- Complete rewrite for better performance
- Enhanced feature detection patterns
- Improved user interface

## [1.0.0] - 2025-10-05

### Added
- Initial release
- Basic web compatibility checking
- Simple feature detection
- Basic reporting functionality
