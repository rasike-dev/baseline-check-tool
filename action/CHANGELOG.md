# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.3] - 2025-12-04

### Fixed
- Fixed dashboard hub links to use correct subdirectory paths
- Standardized performance dashboard filename (removed timestamp)
- Fixed all navigation links to performance dashboard across all dashboards
- Added navigation bar to baseline dashboard
- Fixed performance dashboard data loading issues
- Improved project structure (README.md at root for GitHub display)

### Changed
- Performance dashboard now uses consistent filename: `performance-dashboard.html`
- Dashboard hub dynamically finds performance dashboard files
- Removed abandoned folders (empty dashboard/, old root monitoring/)

## [2.3.2] - 2025-10-09

### Added
- ✅ **Unified Dashboard Hub** - New `dashboard-hub` command generates central navigation hub
- ✅ **Dashboard Generator Module** - Reusable system for creating all dashboards
- ✅ **Navigation Bars** - All dashboards include navigation for seamless switching
- ✅ **VS Code Extension Published** - Now available on VS Code Marketplace (v2.4.0)
- ✅ **6 Analysis Dashboards** - Compatibility, Performance, Security, Accessibility, SEO, Bundle

### Changed
- Dashboard generation creates hub (index.html) with 6 analysis cards
- Updated README with comprehensive VS Code extension section
- Enhanced dashboard UI with modern gradients and hover effects
- Improved CLI command documentation
- Added VS Code badge to README

### Fixed
- Dashboard hub card links now work properly
- Compatibility dashboard feature categorization
- Navigation bar consistency across all dashboards

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
- **VS Code Extension**: Integrated analysis and reporting
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

## [2.2.0] - 2025-10-06

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

## [2.1.0] - 2025-10-05

### Added
- Performance analysis capabilities
- Security vulnerability detection
- Accessibility compliance checking
- SEO optimization analysis

### Fixed
- Memory leak issues in large projects
- Performance bottlenecks in file scanning

## [2.0.0] - 2025-10-04

### Added
- Complete rewrite with modern architecture
- Enhanced feature detection
- Improved CLI interface
- Better error handling

### Changed
- Breaking changes to API
- New configuration format
- Updated command structure

## [1.0.0] - 2025-10-03

### Added
- Initial release
- Basic web compatibility checking
- Simple feature detection
- Basic reporting functionality
