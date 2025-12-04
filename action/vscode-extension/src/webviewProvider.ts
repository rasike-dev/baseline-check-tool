import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class BaselineCheckWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'baseline-check-results';

    private _view?: vscode.WebviewView;
    private _analysisResults?: any;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'runAnalysis':
                        this._runAnalysis();
                        return;
                    case 'openDashboard':
                        this._openDashboard();
                        return;
                    case 'fixIssues':
                        this._fixIssues();
                        return;
                }
            },
            undefined,
            []
        );
    }

    public updateAnalysisResults(results: any) {
        this._analysisResults = results;
        if (this._view) {
            this._view.webview.postMessage({
                command: 'updateResults',
                results: results
            });
        }
    }

    private _runAnalysis() {
        vscode.commands.executeCommand('baseline-check.analyze');
    }

    private _openDashboard() {
        vscode.commands.executeCommand('baseline-check.dashboard');
    }

    private _fixIssues() {
        vscode.commands.executeCommand('baseline-check.fixIssues');
    }

    public updateResults(results: any) {
        if (this._webview) {
            this._webview.postMessage({
                command: 'updateResults',
                results: results
            });
        }
    }

    private get _webview(): vscode.Webview | undefined {
        return this._view?.webview;
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baseline Check Results</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            margin: 0;
            padding: 12px;
            line-height: 1.4;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .title {
            font-size: 18px;
            font-weight: 700;
            color: var(--vscode-foreground);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .title::before {
            content: "🔍";
            font-size: 20px;
        }

        .button-group {
            display: flex;
            gap: 6px;
        }

        .button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .button:hover {
            background: var(--vscode-button-hoverBackground);
            transform: translateY(-1px);
        }

        .button.primary {
            background: #007acc;
            color: white;
        }

        .button.primary:hover {
            background: #005a9e;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }

        .stat-card {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            position: relative;
            overflow: hidden;
            transition: transform 0.2s ease;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
        }

        .stat-card.baseline::before { background: linear-gradient(90deg, #4caf50, #66bb6a); }
        .stat-card.risky::before { background: linear-gradient(90deg, #ff9800, #ffb74d); }
        .stat-card.unknown::before { background: linear-gradient(90deg, #9e9e9e, #bdbdbd); }

        .stat-number {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .stat-number::before {
            font-size: 20px;
        }

        .stat-card.baseline .stat-number::before { content: "✅"; }
        .stat-card.risky .stat-number::before { content: "⚠️"; }
        .stat-card.unknown .stat-number::before { content: "❓"; }

        .stat-label {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .baseline-like { color: #4caf50; }
        .risky { color: #ff9800; }
        .unknown { color: #9e9e9e; }

        .chart-container {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
        }

        .chart-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--vscode-foreground);
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--vscode-panel-border);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
        }

        .progress-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }

        .progress-fill.baseline { background: linear-gradient(90deg, #4caf50, #66bb6a); }
        .progress-fill.risky { background: linear-gradient(90deg, #ff9800, #ffb74d); }
        .progress-fill.unknown { background: linear-gradient(90deg, #9e9e9e, #bdbdbd); }

        .results {
            max-height: 400px;
            overflow-y: auto;
        }

        .result-item {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 8px;
            font-size: 12px;
            transition: all 0.2s ease;
            position: relative;
        }

        .result-item:hover {
            border-color: var(--vscode-focusBorder);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .feature-name {
            font-weight: 600;
            color: var(--vscode-foreground);
            font-size: 13px;
        }

        .status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status.baseline_like {
            background: #e8f5e8;
            color: #2e7d32;
        }

        .status.risky {
            background: #fff3e0;
            color: #f57c00;
        }

        .status.unknown {
            background: #f5f5f5;
            color: #616161;
        }

        .result-details {
            color: var(--vscode-descriptionForeground);
            font-size: 11px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
        }

        .detail-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .detail-item::before {
            font-size: 10px;
        }

        .files::before { content: "📁"; }
        .count::before { content: "🔢"; }
        .mdn::before { content: "📖"; }

        .mdn-link {
            color: var(--vscode-textLink-foreground);
            text-decoration: none;
        }

        .mdn-link:hover {
            text-decoration: underline;
        }

        .no-results {
            text-align: center;
            color: var(--vscode-descriptionForeground);
            padding: 40px 20px;
            font-style: italic;
        }

        .no-results::before {
            content: "🔍";
            font-size: 48px;
            display: block;
            margin-bottom: 16px;
        }

        .loading {
            text-align: center;
            color: var(--vscode-descriptionForeground);
            padding: 40px 20px;
        }

        .loading::before {
            content: "⏳";
            font-size: 48px;
            display: block;
            margin-bottom: 16px;
            animation: spin 2s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .error {
            color: var(--vscode-errorForeground);
            background: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            padding: 16px;
            border-radius: 6px;
            margin: 16px 0;
        }

        .error::before {
            content: "❌";
            font-size: 20px;
            display: block;
            margin-bottom: 8px;
        }

        .summary-text {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 16px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .summary-text strong {
            color: var(--vscode-foreground);
        }

        .filter-bar {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }

        .filter-button {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            color: var(--vscode-foreground);
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .filter-button:hover {
            background: var(--vscode-list-hoverBackground);
        }

        .filter-button.active {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Baseline Check</div>
        <div class="button-group">
            <button class="button primary" onclick="runAnalysis()">🔍 Scan</button>
            <button class="button" onclick="openDashboard()">📊 Dashboard</button>
            <button class="button" onclick="fixIssues()">🔧 Fix</button>
        </div>
    </div>

    <div id="summary" class="summary-text" style="display: none;">
        <strong>Analysis Summary:</strong> <span id="summaryText">No analysis performed yet</span>
    </div>

    <div id="stats" class="stats" style="display: none;">
        <div class="stat-card baseline">
            <div class="stat-number" id="baselineCount">0</div>
            <div class="stat-label">Baseline</div>
        </div>
        <div class="stat-card risky">
            <div class="stat-number" id="riskyCount">0</div>
            <div class="stat-label">Risky</div>
        </div>
        <div class="stat-card unknown">
            <div class="stat-number" id="unknownCount">0</div>
            <div class="stat-label">Unknown</div>
        </div>
    </div>

    <div id="chart" class="chart-container" style="display: none;">
        <div class="chart-title">Feature Distribution</div>
        <div class="progress-bar">
            <div class="progress-fill baseline" id="baselineProgress" style="width: 0%"></div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill risky" id="riskyProgress" style="width: 0%"></div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill unknown" id="unknownProgress" style="width: 0%"></div>
        </div>
    </div>

    <div class="filter-bar" id="filterBar" style="display: none;">
        <button class="filter-button active" onclick="filterResults('all')">All</button>
        <button class="filter-button" onclick="filterResults('baseline_like')">Baseline</button>
        <button class="filter-button" onclick="filterResults('risky')">Risky</button>
        <button class="filter-button" onclick="filterResults('unknown')">Unknown</button>
    </div>

    <div id="content">
        <div class="no-results">
            Click "Scan" to run baseline compatibility analysis
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let allResults = [];
        let currentFilter = 'all';

        function runAnalysis() {
            vscode.postMessage({ command: 'runAnalysis' });
            showLoading();
        }

        function openDashboard() {
            vscode.postMessage({ command: 'openDashboard' });
        }

        function fixIssues() {
            vscode.postMessage({ command: 'fixIssues' });
        }

        function showLoading() {
            document.getElementById('content').innerHTML = '<div class="loading">Running analysis...</div>';
            document.getElementById('stats').style.display = 'none';
            document.getElementById('chart').style.display = 'none';
            document.getElementById('filterBar').style.display = 'none';
            document.getElementById('summary').style.display = 'none';
        }

        function showError(message) {
            document.getElementById('content').innerHTML = \`<div class="error">\${message}</div>\`;
            document.getElementById('stats').style.display = 'none';
            document.getElementById('chart').style.display = 'none';
            document.getElementById('filterBar').style.display = 'none';
            document.getElementById('summary').style.display = 'none';
        }

        function filterResults(filter) {
            currentFilter = filter;
            
            // Update filter buttons
            document.querySelectorAll('.filter-button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Filter results
            const filteredResults = filter === 'all' ? allResults : allResults.filter(f => f.status === filter);
            renderResults(filteredResults);
        }

        function renderResults(features) {
            if (features.length === 0) {
                document.getElementById('content').innerHTML = '<div class="no-results">No features match the current filter</div>';
                return;
            }

            const resultsHtml = features.map(feature => \`
                <div class="result-item">
                    <div class="result-header">
                        <span class="feature-name">\${feature.feature}</span>
                        <span class="status \${feature.status}">\${feature.status.replace('_', ' ')}</span>
                    </div>
                    <div class="result-details">
                        <div class="detail-item files">\${feature.files ? feature.files.join(', ') : 'N/A'}</div>
                        <div class="detail-item count">\${feature.count || 0} occurrences</div>
                        \${feature.mdn ? \`<div class="detail-item mdn"><a href="\${feature.mdn}" target="_blank" class="mdn-link">MDN Docs</a></div>\` : ''}
                    </div>
                </div>
            \`).join('');
            
            document.getElementById('content').innerHTML = \`<div class="results">\${resultsHtml}</div>\`;
        }

        function updateResults(results) {
            if (!results || !results.summary) {
                showError('No analysis results available');
                return;
            }

            const { summary, results: features } = results;
            allResults = features || [];
            
            // Update summary
            const total = (summary.baselineLike || 0) + (summary.risky || 0) + (summary.unknown || 0);
            const summaryText = \`Found \${total} features: \${summary.baselineLike || 0} baseline, \${summary.risky || 0} risky, \${summary.unknown || 0} unknown\`;
            document.getElementById('summaryText').textContent = summaryText;
            document.getElementById('summary').style.display = 'block';
            
            // Update stats
            document.getElementById('baselineCount').textContent = summary.baselineLike || 0;
            document.getElementById('riskyCount').textContent = summary.risky || 0;
            document.getElementById('unknownCount').textContent = summary.unknown || 0;
            document.getElementById('stats').style.display = 'grid';

            // Update progress bars
            const totalFeatures = total || 1;
            const baselinePercent = ((summary.baselineLike || 0) / totalFeatures) * 100;
            const riskyPercent = ((summary.risky || 0) / totalFeatures) * 100;
            const unknownPercent = ((summary.unknown || 0) / totalFeatures) * 100;
            
            document.getElementById('baselineProgress').style.width = baselinePercent + '%';
            document.getElementById('riskyProgress').style.width = riskyPercent + '%';
            document.getElementById('unknownProgress').style.width = unknownPercent + '%';
            document.getElementById('chart').style.display = 'block';

            // Show filter bar
            document.getElementById('filterBar').style.display = 'flex';
            
            // Render results
            renderResults(allResults);
        }

        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateResults':
                    updateResults(message.results);
                    break;
            }
        });
    </script>
</body>
</html>`;
    }
}
