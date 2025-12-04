import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BaselineCheckResult {
    feature: string;
    status: 'baseline_like' | 'risky' | 'unknown';
    files: string[];
    count: number;
    mdn?: string;
    browsers?: any;
    line?: number;
    column?: number;
    message?: string;
    severity?: 'error' | 'warning' | 'info';
}

interface AnalysisResult {
    summary: {
        scannedFiles: number;
        processedFiles: number;
        baselineLike: number;
        risky: number;
        unknown: number;
    };
    results: BaselineCheckResult[];
    performance?: any;
    security?: any;
    accessibility?: any;
    seo?: any;
    bundle?: any;
}

export class BaselineCheckProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private statusBarItem: vscode.StatusBarItem;
    private outputChannel: vscode.OutputChannel;
    private isMonitoring: boolean = false;
    private monitoringWatcher?: vscode.FileSystemWatcher;
    private analysisResults: Map<string, AnalysisResult> = new Map();

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('baseline-check');
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.outputChannel = vscode.window.createOutputChannel('Baseline Check Tool');
        this.setupStatusBar();
    }

    private setupStatusBar() {
        this.statusBarItem.text = "$(check) Baseline Check";
        this.statusBarItem.command = 'baseline-check.scan';
        this.statusBarItem.tooltip = 'Click to run baseline compatibility scan';
        this.statusBarItem.show();
    }

    private async runBaselineCheckCommand(command: string, args: string[] = []): Promise<any> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder found');
            }

            // Try multiple locations for baseline-check tool
            // __dirname could be dist/ or out/ depending on which version runs
            const extensionRoot = path.join(__dirname, '..');
            const possiblePaths = [
                // 1. Bundled with extension (v2.4.0+) - from dist/
                path.join(extensionRoot, 'node_modules', 'baseline-check-tool', 'src', 'cli.js'),
                // 2. Bundled with extension - from out/
                path.join(__dirname, '..', '..', 'node_modules', 'baseline-check-tool', 'src', 'cli.js'),
                // 3. Bundled .bin symlink
                path.join(extensionRoot, 'node_modules', '.bin', 'baseline-check'),
                // 4. Project's node_modules CLI
                path.join(workspaceFolder.uri.fsPath, 'node_modules', 'baseline-check-tool', 'src', 'cli.js'),
                // 5. Project's .bin symlink
                path.join(workspaceFolder.uri.fsPath, 'node_modules', '.bin', 'baseline-check'),
            ];
            
            let baselineCheckPath = null;
            this.outputChannel.appendLine(`🔍 Searching for baseline-check tool...`);
            for (const checkPath of possiblePaths) {
                this.outputChannel.appendLine(`  Checking: ${checkPath}`);
                if (fs.existsSync(checkPath)) {
                    baselineCheckPath = checkPath;
                    this.outputChannel.appendLine(`✅ Found baseline-check at: ${checkPath}`);
                    break;
                }
            }
            
            // If not found in any location, show helpful error
            if (!baselineCheckPath) {
                throw new Error(
                    'Baseline Check Tool not found. Please install it:\n' +
                    'npm install -g baseline-check-tool\n\n' +
                    'Or install in your project:\n' +
                    'npm install --save-dev baseline-check-tool'
                );
            }
            
            // Use node to run the CLI script
            const fullCommand = `node "${baselineCheckPath}" ${command} ${args.join(' ')}`;
            
            this.outputChannel.appendLine(`Running: ${fullCommand}`);
            const { stdout, stderr } = await execAsync(fullCommand, { 
                cwd: workspaceFolder.uri.fsPath,
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });

            if (stderr) {
                this.outputChannel.appendLine(`Error: ${stderr}`);
            }

            // Handle different output formats
            if (command === 'scan' || command === 'run') {
                // For scan/run commands, try to parse the JSON report file
                const reportPath = path.join(workspaceFolder.uri.fsPath, 'baseline-report.json');
                if (fs.existsSync(reportPath)) {
                    const reportContent = fs.readFileSync(reportPath, 'utf8');
                    const report = JSON.parse(reportContent);
                    // Convert the report to the expected format
                    return this.convertReportToExpectedFormat(report);
                } else {
                    // If no report file, return a mock result based on stdout
                    return this.parseScanOutput(stdout);
                }
            } else if (command === 'analyze') {
                // For analyze command, try to parse JSON from stdout
                try {
                    return JSON.parse(stdout);
                } catch {
                    // If not JSON, return a mock analysis result
                    return this.parseAnalysisOutput(stdout);
                }
            } else {
                // For other commands, try to parse JSON
                try {
                    return JSON.parse(stdout);
                } catch {
                    return { success: true, output: stdout };
                }
            }
        } catch (error: any) {
            this.outputChannel.appendLine(`Error running baseline-check: ${error.message}`);
            throw error;
        }
    }

    private convertReportToExpectedFormat(report: any): any {
        // Convert the actual report format to the expected format
        const metadata = report.metadata || {};
        const detected = report.detected || [];
        const results = report.results || [];
        
        // Count features by status
        let baselineLike = 0;
        let risky = 0;
        let unknown = 0;
        
        // Count from detected features (these are typically unknown until checked)
        unknown = detected.length;
        
        // Count from results if available (these have been checked for compatibility)
        if (results.length > 0) {
            baselineLike = results.filter((r: any) => r.status === 'baseline_like').length;
            risky = results.filter((r: any) => r.status === 'risky').length;
            unknown = results.filter((r: any) => r.status === 'unknown').length;
        }
        
        return {
            summary: {
                scannedFiles: metadata.scannedFiles || 0,
                processedFiles: metadata.processedFiles || 0,
                baselineLike: baselineLike,
                risky: risky,
                unknown: unknown
            },
            results: results.length > 0 ? results : detected.map((feature: any) => ({
                feature: feature.feature,
                status: 'unknown',
                files: feature.files,
                count: feature.count
            })),
            metadata: {
                timestamp: metadata.generatedAt || new Date().toISOString(),
                version: metadata.version || '2.0.0'
            }
        };
    }

    private parseScanOutput(stdout: string): any {
        // Parse scan output to extract basic information
        const lines = stdout.split('\n');
        let scannedFiles = 0;
        let processedFiles = 0;
        let baselineLike = 0;
        let risky = 0;
        let unknown = 0;

        for (const line of lines) {
            if (line.includes('Processed') && line.includes('files')) {
                const match = line.match(/Processed (\d+) files/);
                if (match) processedFiles = parseInt(match[1]);
            }
            if (line.includes('baseline-like')) {
                const match = line.match(/(\d+)/);
                if (match) baselineLike = parseInt(match[1]);
            }
            if (line.includes('risky')) {
                const match = line.match(/(\d+)/);
                if (match) risky = parseInt(match[1]);
            }
            if (line.includes('unknown')) {
                const match = line.match(/(\d+)/);
                if (match) unknown = parseInt(match[1]);
            }
        }

        // If we couldn't parse specific counts, try to get them from the summary line
        if (baselineLike === 0 && risky === 0 && unknown === 0) {
            for (const line of lines) {
                if (line.includes('✅') && line.includes('⚠️') && line.includes('❓')) {
                    const baselineMatch = line.match(/✅\s*(\d+)/);
                    const riskyMatch = line.match(/⚠️\s*(\d+)/);
                    const unknownMatch = line.match(/❓\s*(\d+)/);
                    
                    if (baselineMatch) baselineLike = parseInt(baselineMatch[1]);
                    if (riskyMatch) risky = parseInt(riskyMatch[1]);
                    if (unknownMatch) unknown = parseInt(unknownMatch[1]);
                }
            }
        }

        return {
            summary: {
                scannedFiles: scannedFiles || processedFiles || 0,
                processedFiles: processedFiles || 0,
                baselineLike: baselineLike || 0,
                risky: risky || 0,
                unknown: unknown || 0
            },
            results: [],
            metadata: {
                timestamp: new Date().toISOString(),
                version: '2.0.0'
            }
        };
    }

    private parseAnalysisOutput(stdout: string): any {
        // Parse analysis output to extract recommendations
        const lines = stdout.split('\n');
        const suggestions: any[] = [];
        let currentSuggestion: any = null;

        for (const line of lines) {
            if (line.includes('###') && line.includes('suggestion')) {
                if (currentSuggestion) {
                    suggestions.push(currentSuggestion);
                }
                currentSuggestion = {
                    title: line.replace(/###\s*/, '').trim(),
                    message: '',
                    alternatives: [] as string[],
                    polyfills: [] as string[]
                };
            } else if (currentSuggestion && line.includes('**Alternatives:**')) {
                // Skip this line, alternatives will be in next lines
            } else if (currentSuggestion && line.includes('**Polyfills:**')) {
                // Skip this line, polyfills will be in next lines
            } else if (currentSuggestion && line.startsWith('- ')) {
                if (line.includes('http')) {
                    currentSuggestion.polyfills.push(line.replace('- ', '').trim());
                } else {
                    currentSuggestion.alternatives.push(line.replace('- ', '').trim());
                }
            } else if (currentSuggestion && line.trim() && !line.includes('##') && !line.includes('---')) {
                if (!currentSuggestion.message) {
                    currentSuggestion.message = line.trim();
                }
            }
        }

        if (currentSuggestion) {
            suggestions.push(currentSuggestion);
        }

        return {
            summary: `Found ${suggestions.length} recommendations`,
            suggestions: suggestions
        };
    }

    private createDiagnostics(results: BaselineCheckResult[], filePath: string): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        
        results.forEach(result => {
            if (result.files.some(f => f === path.basename(filePath))) {
                const severity = this.getSeverity(result.status);
                const message = this.createMessage(result);
                
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(0, 0, 0, 0), // Will be updated with actual position
                    message,
                    severity
                );
                
                diagnostic.source = 'Baseline Check';
                diagnostic.code = result.feature;
                
                if (result.mdn) {
                    diagnostic.relatedInformation = [
                        new vscode.DiagnosticRelatedInformation(
                            new vscode.Location(vscode.Uri.parse(result.mdn), new vscode.Range(0, 0, 0, 0)),
                            'MDN Documentation'
                        )
                    ];
                }
                
                diagnostics.push(diagnostic);
            }
        });
        
        return diagnostics;
    }

    private getSeverity(status: string): vscode.DiagnosticSeverity {
        switch (status) {
            case 'risky':
                return vscode.DiagnosticSeverity.Warning;
            case 'unknown':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Information;
        }
    }

    private createMessage(result: BaselineCheckResult): string {
        const statusEmoji = {
            'baseline_like': '✅',
            'risky': '⚠️',
            'unknown': '❓'
        };
        
        return `${statusEmoji[result.status]} ${result.feature} - ${result.status.replace('_', ' ')}`;
    }

    private updateStatusBar(results: AnalysisResult) {
        const summary = results.summary || {};
        const baselineLike = summary.baselineLike || 0;
        const risky = summary.risky || 0;
        const unknown = summary.unknown || 0;
        this.statusBarItem.text = `$(check) Baseline: ${baselineLike} ✅ ${risky} ⚠️ ${unknown} ❓`;
    }

    private updateWebview(results: AnalysisResult) {
        // The webview will be updated through the webview provider
        // when it's created and registered
    }

    public async scanFile(filePath: string): Promise<void> {
        try {
            this.statusBarItem.text = "$(loading~spin) Scanning...";

            const results = await this.runBaselineCheckCommand('scan', [filePath]);
            this.analysisResults.set(filePath, results);

            // Ensure results has the expected structure
            if (!results.summary) {
                results.summary = {
                    scannedFiles: 0,
                    processedFiles: 0,
                    baselineLike: 0,
                    risky: 0,
                    unknown: 0
                };
            }

            const diagnostics = this.createDiagnostics(results.results || [], filePath);
            this.diagnosticCollection.set(vscode.Uri.file(filePath), diagnostics);

            this.updateStatusBar(results);
            this.updateWebview(results);

            if (vscode.workspace.getConfiguration('baseline-check').get('showNotifications')) {
                const summary = results.summary || {};
                vscode.window.showInformationMessage(
                    `Baseline scan completed: ${summary.baselineLike || 0} baseline, ${summary.risky || 0} risky, ${summary.unknown || 0} unknown`
                );
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Baseline scan failed: ${error.message}`);
            this.statusBarItem.text = "$(check) Baseline Check";
        }
    }

    public async scanWorkspace(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        try {
            this.statusBarItem.text = "$(loading~spin) Scanning workspace...";

            const results = await this.runBaselineCheckCommand('scan', ['.']);
            this.analysisResults.set('workspace', results);

            // Ensure results has the expected structure
            if (!results.summary) {
                results.summary = {
                    scannedFiles: 0,
                    processedFiles: 0,
                    baselineLike: 0,
                    risky: 0,
                    unknown: 0
                };
            }

            // Clear existing diagnostics
            this.diagnosticCollection.clear();

            // Add diagnostics for each file with issues
            if (results.results && Array.isArray(results.results)) {
                results.results.forEach((result: any) => {
                    if (result.files && Array.isArray(result.files)) {
                        result.files.forEach((file: string) => {
                            const filePath = path.join(workspaceFolder.uri.fsPath, file);
                            const diagnostics = this.createDiagnostics([result], filePath);
                            this.diagnosticCollection.set(vscode.Uri.file(filePath), diagnostics);
                        });
                    }
                });
            }

            this.updateStatusBar(results);
            this.updateWebview(results);

            // Regenerate dashboards with updated data
            this.outputChannel.appendLine('📊 Regenerating dashboards...');
            try {
                await this.runBaselineCheckCommand('dashboard-hub', []);
                this.outputChannel.appendLine('✅ Dashboards updated successfully');
            } catch (error: any) {
                this.outputChannel.appendLine(`⚠️ Dashboard generation: ${error.message}`);
            }

            // Add dashboard link to output
            const dashboardPath = path.join(workspaceFolder.uri.fsPath, 'dashboards', 'index.html');
            this.outputChannel.appendLine('\n═══════════════════════════════════════════════════════════');
            this.outputChannel.appendLine('📊 View Dashboard:');
            this.outputChannel.appendLine(`🏠 Dashboard Hub: file://${dashboardPath}`);
            this.outputChannel.appendLine('═══════════════════════════════════════════════════════════\n');
            
            if (vscode.workspace.getConfiguration('baseline-check').get('showNotifications')) {
                const summary = results.summary || {};
                const result = await vscode.window.showInformationMessage(
                    `✅ Scan completed: ${summary.baselineLike || 0} baseline, ${summary.risky || 0} risky, ${summary.unknown || 0} unknown`,
                    'View Dashboard',
                    'Show Output'
                );
                
                if (result === 'View Dashboard') {
                    this.openDashboard();
                } else if (result === 'Show Output') {
                    this.outputChannel.show();
                }
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Workspace scan failed: ${error.message}`);
            this.statusBarItem.text = "$(check) Baseline Check";
        }
    }

    public async runFullAnalysis(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }
        
        try {
            this.statusBarItem.text = "$(loading~spin) Running full analysis...";
            
            // First run the complete pipeline (scan + check)
            const results = await this.runBaselineCheckCommand('run', ['--paths', '.']);
            this.analysisResults.set('full-analysis', results);
            
            // Then analyze the results
            const analysisResults = await this.runBaselineCheckCommand('analyze', ['-r', 'baseline-report.json']);
            this.analysisResults.set('analysis', analysisResults);
            
            this.updateStatusBar(results);
            
            // Regenerate dashboards with updated data
            this.outputChannel.appendLine('📊 Regenerating dashboards with new analysis data...');
            try {
                await this.runBaselineCheckCommand('dashboard-hub', []);
                this.outputChannel.appendLine('✅ Dashboards updated successfully');
            } catch (error: any) {
                this.outputChannel.appendLine(`⚠️ Dashboard generation: ${error.message}`);
            }
            
            // Add dashboard link to output
            const dashboardPath = path.join(workspaceFolder.uri.fsPath, 'dashboards', 'index.html');
            this.outputChannel.appendLine('\n═══════════════════════════════════════════════════════════');
            this.outputChannel.appendLine('📊 View Interactive Dashboards:');
            this.outputChannel.appendLine(`🏠 Main Hub: file://${dashboardPath}`);
            this.outputChannel.appendLine(`⚡ Performance: file://${path.join(workspaceFolder.uri.fsPath, 'dashboards', 'performance.html')}`);
            this.outputChannel.appendLine(`🔒 Security: file://${path.join(workspaceFolder.uri.fsPath, 'dashboards', 'security.html')}`);
            this.outputChannel.appendLine(`♿ Accessibility: file://${path.join(workspaceFolder.uri.fsPath, 'dashboards', 'accessibility.html')}`);
            this.outputChannel.appendLine(`🔍 SEO: file://${path.join(workspaceFolder.uri.fsPath, 'dashboards', 'seo.html')}`);
            this.outputChannel.appendLine(`📦 Bundle: file://${path.join(workspaceFolder.uri.fsPath, 'dashboards', 'bundle.html')}`);
            this.outputChannel.appendLine('═══════════════════════════════════════════════════════════\n');
            
            // Show notification with button to open dashboard
            const result = await vscode.window.showInformationMessage(
                '✅ Full analysis completed! Dashboards updated.',
                'Open Dashboard',
                'Show Output'
            );
            
            if (result === 'Open Dashboard') {
                // Always open a fresh dashboard
                const dashboardPath = path.join(workspaceFolder.uri.fsPath, 'dashboards', 'index.html');
                const uri = vscode.Uri.file(dashboardPath);
                await vscode.env.openExternal(uri);
                
                vscode.window.showInformationMessage(
                    '📊 Dashboard opened. If you see old data, press Cmd+R to refresh the browser.',
                    'OK'
                );
            } else if (result === 'Show Output') {
                this.outputChannel.show();
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Full analysis failed: ${error.message}`);
            this.statusBarItem.text = "$(check) Baseline Check";
        }
    }

    public async runPerformanceAnalysis(): Promise<void> {
        try {
            this.statusBarItem.text = "$(loading~spin) Running performance analysis...";
            
            // First run scan to get baseline data
            await this.runBaselineCheckCommand('scan', ['.']);
            
            // Then run performance analysis (this would need to be implemented in the main tool)
            const results = await this.runBaselineCheckCommand('run', ['.']);
            this.analysisResults.set('performance', results);
            
            // Add dashboard link to output
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (workspaceFolder) {
                const perfDashboard = path.join(workspaceFolder.uri.fsPath, 'dashboards', 'performance.html');
                this.outputChannel.appendLine('\n═══════════════════════════════════════════════════════════');
                this.outputChannel.appendLine('📊 View Performance Dashboard:');
                this.outputChannel.appendLine(`⚡ Performance Dashboard: file://${perfDashboard}`);
                this.outputChannel.appendLine('═══════════════════════════════════════════════════════════\n');
            }
            
            // Show notification with button to open dashboard
            const result = await vscode.window.showInformationMessage(
                '⚡ Performance analysis completed!',
                'View Dashboard',
                'Show Output'
            );
            
            if (result === 'View Dashboard') {
                this.openDashboard();
            } else if (result === 'Show Output') {
                this.outputChannel.show();
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Performance analysis failed: ${error.message}`);
            this.statusBarItem.text = "$(check) Baseline Check";
        }
    }

    public async runSecurityAnalysis(): Promise<void> {
        try {
            this.statusBarItem.text = "$(loading~spin) Running security analysis...";
            
            // Run scan and then analyze for security issues
            await this.runBaselineCheckCommand('scan', ['.']);
            const results = await this.runBaselineCheckCommand('analyze', ['-r', 'baseline-report.json']);
            this.analysisResults.set('security', results);
            
            vscode.window.showInformationMessage(
                'Security analysis completed! Check the output panel for details.'
            );
            
            this.outputChannel.show();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Security analysis failed: ${error.message}`);
            this.statusBarItem.text = "$(check) Baseline Check";
        }
    }

    public async runAccessibilityAnalysis(): Promise<void> {
        try {
            this.statusBarItem.text = "$(loading~spin) Running accessibility analysis...";
            
            // Run scan and then analyze for accessibility issues
            await this.runBaselineCheckCommand('scan', ['.']);
            const results = await this.runBaselineCheckCommand('analyze', ['-r', 'baseline-report.json']);
            this.analysisResults.set('accessibility', results);
            
            vscode.window.showInformationMessage(
                'Accessibility analysis completed! Check the output panel for details.'
            );
            
            this.outputChannel.show();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Accessibility analysis failed: ${error.message}`);
            this.statusBarItem.text = "$(check) Baseline Check";
        }
    }

    public async runSEOAnalysis(): Promise<void> {
        try {
            this.statusBarItem.text = "$(loading~spin) Running SEO analysis...";
            
            // Run scan and then analyze for SEO issues
            await this.runBaselineCheckCommand('scan', ['.']);
            const results = await this.runBaselineCheckCommand('analyze', ['-r', 'baseline-report.json']);
            this.analysisResults.set('seo', results);
            
            vscode.window.showInformationMessage(
                'SEO analysis completed! Check the output panel for details.'
            );
            
            this.outputChannel.show();
        } catch (error: any) {
            vscode.window.showErrorMessage(`SEO analysis failed: ${error.message}`);
            this.statusBarItem.text = "$(check) Baseline Check";
        }
    }

    public async runBundleAnalysis(): Promise<void> {
        try {
            this.statusBarItem.text = "$(loading~spin) Running bundle analysis...";
            
            // Run scan and then analyze for bundle issues
            await this.runBaselineCheckCommand('scan', ['.']);
            const results = await this.runBaselineCheckCommand('analyze', ['-r', 'baseline-report.json']);
            this.analysisResults.set('bundle', results);
            
            vscode.window.showInformationMessage(
                'Bundle analysis completed! Check the output panel for details.'
            );
            
            this.outputChannel.show();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Bundle analysis failed: ${error.message}`);
            this.statusBarItem.text = "$(check) Baseline Check";
        }
    }

    public async openDashboard(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        // Check for existing dashboard
        const dashboardPath = path.join(workspaceFolder.uri.fsPath, 'dashboards', 'index.html');
        
        if (fs.existsSync(dashboardPath)) {
            // Open in browser with cache-busting parameter to force reload
            const timestamp = Date.now();
            const uri = vscode.Uri.file(dashboardPath).with({ 
                query: `t=${timestamp}` 
            });
            await vscode.env.openExternal(uri);
            this.outputChannel.appendLine(`Opening dashboard in browser: ${dashboardPath}?t=${timestamp}`);
            this.outputChannel.appendLine(`💡 Tip: If you see old data, close and reopen the browser tab`);
        } else {
            // Generate dashboard using dashboard-hub command
            this.outputChannel.appendLine('📊 No dashboard found. Generating with dashboard-hub...');
            try {
                await this.runBaselineCheckCommand('dashboard-hub', []);
                this.outputChannel.appendLine('✅ Dashboard hub generated');
                
                // Try to open it now
                if (fs.existsSync(dashboardPath)) {
                    const uri = vscode.Uri.file(dashboardPath);
                    await vscode.env.openExternal(uri);
                    this.outputChannel.appendLine(`Opening dashboard in browser: ${dashboardPath}`);
                } else {
                    vscode.window.showWarningMessage('Dashboard generation failed. Please run a scan first.', 'Run Scan');
                }
            } catch (error: any) {
                this.outputChannel.appendLine(`⚠️ Dashboard generation failed: ${error.message}`);
                vscode.window.showWarningMessage(
                    'Dashboard generation failed. Please run an analysis first.',
                    'Run Analysis'
                ).then(selection => {
                    if (selection === 'Run Analysis') {
                        this.runFullAnalysis();
                    }
                });
            }
        }
    }

    private async generateSimpleDashboard(workspacePath: string): Promise<void> {
        try {
            // Use the CLI's dashboard-hub command for full-featured dashboards
            this.outputChannel.appendLine(`📊 Generating dashboard hub...`);
            
            try {
                await this.runBaselineCheckCommand('dashboard-hub', []);
                this.outputChannel.appendLine(`✅ Dashboard hub generated with full navigation`);
            } catch (error: any) {
                // Fallback to basic dashboard if command fails
                this.outputChannel.appendLine(`⚠️ dashboard-hub command not available, generating basic dashboard`);
                
                const dashboardsDir = path.join(workspacePath, 'dashboards');
                if (!fs.existsSync(dashboardsDir)) {
                    fs.mkdirSync(dashboardsDir, { recursive: true });
                }

                const hubHTML = this.generateDashboardHub(workspacePath);
                const hubPath = path.join(dashboardsDir, 'index.html');
                fs.writeFileSync(hubPath, hubHTML);
                
                const reportPath = path.join(workspacePath, 'baseline-report.json');
                if (fs.existsSync(reportPath)) {
                    const reportContent = fs.readFileSync(reportPath, 'utf8');
                    const reportData = JSON.parse(reportContent);
                    const compatHTML = this.generateDashboardHTML(reportData);
                    const compatPath = path.join(dashboardsDir, 'compatibility.html');
                    fs.writeFileSync(compatPath, compatHTML);
                }
                
                this.outputChannel.appendLine(`✅ Basic dashboard generated: ${hubPath}`);
            }
        } catch (error: any) {
            this.outputChannel.appendLine(`Failed to generate dashboard: ${error.message}`);
        }
    }
    
    private generateDashboardHub(workspacePath: string): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baseline Check - Dashboard Hub</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            text-align: center;
            color: white;
            padding: 60px 20px;
        }
        .header h1 {
            font-size: 3.5em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .header p { font-size: 1.3em; opacity: 0.9; }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            padding: 20px 0;
        }
        .dashboard-card {
            background: white;
            border-radius: 12px;
            padding: 35px;
            text-align: center;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            display: block;
        }
        .dashboard-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--accent-color);
            transform: scaleX(0);
            transition: transform 0.3s;
        }
        .dashboard-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        .dashboard-card:hover::before { transform: scaleX(1); }
        .card-icon { font-size: 4em; margin-bottom: 15px; }
        .card-title {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .card-description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .card-status {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }
        .status-ready { background: #d3f9d8; color: #2b8a3e; }
        .footer {
            text-align: center;
            color: white;
            padding: 40px 20px;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Baseline Check Dashboard Hub</h1>
            <p>Comprehensive Web Development Analysis Platform</p>
        </div>
        
        <div class="dashboard-grid">
            <a href="compatibility.html" class="dashboard-card" style="--accent-color: #667eea">
                <div class="card-icon">🌐</div>
                <div class="card-title">Baseline Compatibility</div>
                <div class="card-description">
                    Browser feature detection and baseline compatibility analysis
                </div>
                <span class="card-status status-ready">View Report</span>
            </a>
            
            <a href="performance.html" class="dashboard-card" style="--accent-color: #f5576c">
                <div class="card-icon">⚡</div>
                <div class="card-title">Performance Analysis</div>
                <div class="card-description">
                    Code performance, bundle sizes, and optimization opportunities
                </div>
                <span class="card-status status-ready">View Report</span>
            </a>
            
            <a href="security.html" class="dashboard-card" style="--accent-color: #c92a2a">
                <div class="card-icon">🔒</div>
                <div class="card-title">Security Analysis</div>
                <div class="card-description">
                    XSS, CSRF, injection vulnerabilities and security best practices
                </div>
                <span class="card-status status-ready">View Report</span>
            </a>
            
            <a href="accessibility.html" class="dashboard-card" style="--accent-color: #845ef7">
                <div class="card-icon">♿</div>
                <div class="card-title">Accessibility Analysis</div>
                <div class="card-description">
                    WCAG compliance, color contrast, ARIA attributes
                </div>
                <span class="card-status status-ready">View Report</span>
            </a>
            
            <a href="seo.html" class="dashboard-card" style="--accent-color: #20c997">
                <div class="card-icon">🔍</div>
                <div class="card-title">SEO Analysis</div>
                <div class="card-description">
                    Meta tags, Open Graph, structured data optimization
                </div>
                <span class="card-status status-ready">View Report</span>
            </a>
            
            <a href="bundle.html" class="dashboard-card" style="--accent-color: #fd7e14">
                <div class="card-icon">📦</div>
                <div class="card-title">Bundle Analysis</div>
                <div class="card-description">
                    Bundle size, code splitting, tree shaking, minification
                </div>
                <span class="card-status status-ready">View Report</span>
            </a>
        </div>
        
        <div class="footer">
            <p><strong>Baseline Check Tool v2.4.0</strong></p>
            <p>Comprehensive web compatibility and optimization analysis</p>
        </div>
    </div>
</body>
</html>`;
    }

    private generateDashboardHTML(reportData: any): string {
        const metadata = reportData?.metadata || {};
        const detected = reportData?.detected || [];
        const results = reportData?.results || [];
        
        // Count features
        let baselineLike = 0;
        let risky = 0;
        let unknown = detected.length;
        
        if (results.length > 0) {
            baselineLike = results.filter((r: any) => r.status === 'baseline_like').length;
            risky = results.filter((r: any) => r.status === 'risky').length;
            unknown = results.filter((r: any) => r.status === 'unknown').length;
        }

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baseline Check Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #007bff;
        }
        .stat-card.baseline { border-left-color: #28a745; }
        .stat-card.risky { border-left-color: #ffc107; }
        .stat-card.unknown { border-left-color: #6c757d; }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .stat-label {
            color: #666;
            font-size: 1.1em;
        }
        .features {
            padding: 30px;
        }
        .features h2 {
            margin-top: 0;
            color: #333;
        }
        .feature-list {
            display: grid;
            gap: 15px;
        }
        .feature-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #007bff;
        }
        .feature-item.baseline_like { border-left-color: #28a745; }
        .feature-item.risky { border-left-color: #ffc107; }
        .feature-item.unknown { border-left-color: #6c757d; }
        .feature-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .feature-files {
            color: #666;
            font-size: 0.9em;
        }
        .no-data {
            text-align: center;
            color: #666;
            padding: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Baseline Check Dashboard</h1>
            <p>Web Compatibility Analysis Results</p>
        </div>
        
        <div class="stats">
            <div class="stat-card baseline">
                <div class="stat-number">${baselineLike}</div>
                <div class="stat-label">Baseline Features</div>
            </div>
            <div class="stat-card risky">
                <div class="stat-number">${risky}</div>
                <div class="stat-label">Risky Features</div>
            </div>
            <div class="stat-card unknown">
                <div class="stat-number">${unknown}</div>
                <div class="stat-label">Unknown Features</div>
            </div>
        </div>
        
        <div class="features">
            <h2>Detected Features</h2>
            ${detected.length > 0 ? `
                <div class="feature-list">
                    ${detected.map((feature: any) => `
                        <div class="feature-item unknown">
                            <div class="feature-name">${feature.feature}</div>
                            <div class="feature-files">Files: ${feature.files.join(', ')} (${feature.count} occurrences)</div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="no-data">
                    <p>No features detected. Run a scan to analyze your codebase.</p>
                </div>
            `}
        </div>
        
        <div style="padding: 20px; text-align: center; color: #666; border-top: 1px solid #eee;">
            <p>Generated by Baseline Check Tool • ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
    }

    public async startMonitoring(): Promise<void> {
        if (this.isMonitoring) {
            vscode.window.showInformationMessage('Monitoring is already running');
            return;
        }

        try {
            this.statusBarItem.text = "$(loading~spin) Starting monitoring...";
            
            // Use interactive mode for monitoring
            const results = await this.runBaselineCheckCommand('interactive', ['.']);
            this.isMonitoring = true;
            
            // Set up file watcher
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (workspaceFolder) {
                this.monitoringWatcher = vscode.workspace.createFileSystemWatcher(
                    new vscode.RelativePattern(workspaceFolder, '**/*.{js,ts,jsx,tsx,html,css}')
                );
                
                this.monitoringWatcher.onDidChange(async (uri) => {
                    if (vscode.workspace.getConfiguration('baseline-check').get('autoScan')) {
                        await this.scanFile(uri.fsPath);
                    }
                });
            }
            
            this.statusBarItem.text = "$(check) Monitoring...";
            vscode.window.showInformationMessage('Real-time monitoring started');
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to start monitoring: ${error.message}`);
            this.statusBarItem.text = "$(check) Baseline Check";
        }
    }

    public stopMonitoring(): void {
        if (!this.isMonitoring) {
            vscode.window.showInformationMessage('Monitoring is not running');
            return;
        }

        this.isMonitoring = false;
        this.monitoringWatcher?.dispose();
        this.statusBarItem.text = "$(check) Baseline Check";
        vscode.window.showInformationMessage('Monitoring stopped');
    }

    public async fixIssues(): Promise<void> {
        try {
            this.statusBarItem.text = "$(loading~spin) Fixing issues...";
            
            // First run scan to get issues
            await this.runBaselineCheckCommand('scan', ['.']);
            
            // Then run analysis to get recommendations
            const results = await this.runBaselineCheckCommand('analyze', ['-r', 'baseline-report.json']);
            
            vscode.window.showInformationMessage(
                `Analysis completed: ${results.suggestions?.length || 0} recommendations found`
            );
            
            this.statusBarItem.text = "$(check) Baseline Check";
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to fix issues: ${error.message}`);
            this.statusBarItem.text = "$(check) Baseline Check";
        }
    }

    public async generateReport(): Promise<void> {
        try {
            this.statusBarItem.text = "$(loading~spin) Generating report...";
            
            // Run the complete pipeline to generate report
            const results = await this.runBaselineCheckCommand('run', ['.']);
            
            vscode.window.showInformationMessage(
                'Report generated successfully! Check the workspace for baseline-report.json'
            );
            
            this.statusBarItem.text = "$(check) Baseline Check";
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to generate report: ${error.message}`);
            this.statusBarItem.text = "$(check) Baseline Check";
        }
    }

    public dispose(): void {
        this.diagnosticCollection.dispose();
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
        this.monitoringWatcher?.dispose();
    }
}

let provider: BaselineCheckProvider;

export function activate(context: vscode.ExtensionContext) {
    provider = new BaselineCheckProvider();

    // Register commands
    const commands = [
        vscode.commands.registerCommand('baseline-check.scan', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                await provider.scanFile(activeEditor.document.uri.fsPath);
            } else {
                await provider.scanWorkspace();
            }
        }),
        vscode.commands.registerCommand('baseline-check.analyze', () => provider.runFullAnalysis()),
        vscode.commands.registerCommand('baseline-check.performance', () => provider.runPerformanceAnalysis()),
        vscode.commands.registerCommand('baseline-check.security', () => provider.runSecurityAnalysis()),
        vscode.commands.registerCommand('baseline-check.accessibility', () => provider.runAccessibilityAnalysis()),
        vscode.commands.registerCommand('baseline-check.seo', () => provider.runSEOAnalysis()),
        vscode.commands.registerCommand('baseline-check.bundle', () => provider.runBundleAnalysis()),
        vscode.commands.registerCommand('baseline-check.dashboard', () => provider.openDashboard()),
        vscode.commands.registerCommand('baseline-check.monitor', () => provider.startMonitoring()),
        vscode.commands.registerCommand('baseline-check.stopMonitor', () => provider.stopMonitoring()),
        vscode.commands.registerCommand('baseline-check.fixIssues', () => provider.fixIssues()),
        vscode.commands.registerCommand('baseline-check.generateReport', () => provider.generateReport())
    ];

    commands.forEach(command => context.subscriptions.push(command));

    // Auto-scan on save if enabled
    const onSaveListener = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (vscode.workspace.getConfiguration('baseline-check').get('autoScan')) {
            const supportedLanguages = ['javascript', 'typescript', 'html', 'css'];
            if (supportedLanguages.includes(document.languageId)) {
                await provider.scanFile(document.uri.fsPath);
            }
        }
    });

    context.subscriptions.push(onSaveListener);

    // Show welcome message
    vscode.window.showInformationMessage(
        'Baseline Check Tool is now active! Use the command palette to run analyses.',
        'Run Scan'
    ).then(selection => {
        if (selection === 'Run Scan') {
            provider.scanWorkspace();
        }
    });
}

export function deactivate() {
    provider?.dispose();
}
