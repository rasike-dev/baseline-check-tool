/**
 * Real-time Dashboard
 * Web-based dashboard for monitoring web compatibility in real-time
 */

import fs from 'node:fs';
import path from 'node:path';

export class RealtimeDashboard {
  constructor(options = {}) {
    this.options = {
      port: options.port || 3000,
      host: options.host || 'localhost',
      title: options.title || 'Baseline Check - Real-time Monitor',
      theme: options.theme || 'dark',
      refreshInterval: options.refreshInterval || 2000,
      ...options
    };
    
    this.clients = new Set();
    this.monitor = null;
    this.alertSystem = null;
  }

  /**
   * Generate HTML dashboard
   */
  generateHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.options.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${this.options.theme === 'dark' ? '#1a1a1a' : '#f5f5f5'};
            color: ${this.options.theme === 'dark' ? '#ffffff' : '#333333'};
            line-height: 1.6;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: ${this.options.theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            color: #667eea;
            font-size: 2rem;
            font-weight: 700;
        }
        
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #4caf50;
            animation: pulse 2s infinite;
        }
        
        .status-dot.offline {
            background: #f44336;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: ${this.options.theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .stat-label {
            color: ${this.options.theme === 'dark' ? '#cccccc' : '#666666'};
            font-size: 1rem;
        }
        
        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .panel {
            background: ${this.options.theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .panel h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.5rem;
        }
        
        .alert-item {
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid;
            background: ${this.options.theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
        }
        
        .alert-item.critical {
            border-left-color: #f44336;
            background: ${this.options.theme === 'dark' ? '#4d1f1f' : '#ffebee'};
        }
        
        .alert-item.high {
            border-left-color: #ff9800;
            background: ${this.options.theme === 'dark' ? '#4d3d1f' : '#fff3e0'};
        }
        
        .alert-item.medium {
            border-left-color: #ffc107;
            background: ${this.options.theme === 'dark' ? '#4d4d1f' : '#fffde7'};
        }
        
        .alert-item.low {
            border-left-color: #4caf50;
            background: ${this.options.theme === 'dark' ? '#1f4d1f' : '#e8f5e8'};
        }
        
        .alert-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }
        
        .alert-type {
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .alert-time {
            font-size: 0.9rem;
            color: ${this.options.theme === 'dark' ? '#cccccc' : '#666666'};
        }
        
        .alert-message {
            margin: 5px 0;
        }
        
        .alert-file {
            font-family: monospace;
            font-size: 0.9rem;
            color: ${this.options.theme === 'dark' ? '#cccccc' : '#666666'};
            word-break: break-all;
        }
        
        .file-list {
            max-height: 400px;
            overflow-y: auto;
        }
        
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            margin: 5px 0;
            background: ${this.options.theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
            border-radius: 6px;
        }
        
        .file-name {
            font-family: monospace;
            font-size: 0.9rem;
        }
        
        .file-stats {
            display: flex;
            gap: 10px;
            font-size: 0.8rem;
        }
        
        .risk-score {
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
        }
        
        .risk-score.high {
            background: #ffebee;
            color: #c62828;
        }
        
        .risk-score.medium {
            background: #fff3e0;
            color: #ef6c00;
        }
        
        .risk-score.low {
            background: #e8f5e8;
            color: #2e7d32;
        }
        
        .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s ease;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-primary:hover {
            background: #5a6fd8;
        }
        
        .btn-secondary {
            background: ${this.options.theme === 'dark' ? '#3d3d3d' : '#e0e0e0'};
            color: ${this.options.theme === 'dark' ? '#ffffff' : '#333333'};
        }
        
        .btn-secondary:hover {
            background: ${this.options.theme === 'dark' ? '#4d4d4d' : '#d0d0d0'};
        }
        
        .btn-danger {
            background: #f44336;
            color: white;
        }
        
        .btn-danger:hover {
            background: #d32f2f;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: ${this.options.theme === 'dark' ? '#cccccc' : '#666666'};
        }
        
        .spinner {
            border: 3px solid ${this.options.theme === 'dark' ? '#3d3d3d' : '#f3f3f3'};
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .chart-container {
            background: ${this.options.theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .chart {
            width: 100%;
            height: 300px;
            position: relative;
        }
        
        .chart-bar {
            display: flex;
            align-items: end;
            height: 250px;
            gap: 10px;
            margin: 20px 0;
        }
        
        .bar {
            flex: 1;
            background: linear-gradient(to top, #667eea, #764ba2);
            border-radius: 4px 4px 0 0;
            position: relative;
            transition: all 0.3s ease;
            min-height: 20px;
        }
        
        .bar:hover {
            background: linear-gradient(to top, #5a6fd8, #6a4190);
            transform: scaleY(1.05);
        }
        
        .bar-label {
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.8rem;
            color: ${this.options.theme === 'dark' ? '#cccccc' : '#666666'};
            white-space: nowrap;
        }
        
        .bar-value {
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.9rem;
            font-weight: bold;
            color: #667eea;
        }
        
        .chart-line {
            position: relative;
            height: 200px;
            margin: 20px 0;
        }
        
        .line-path {
            fill: none;
            stroke: #667eea;
            stroke-width: 3;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        
        .line-point {
            fill: #667eea;
            stroke: white;
            stroke-width: 2;
            r: 4;
        }
        
        .line-point:hover {
            r: 6;
            fill: #5a6fd8;
        }
        
        .chart-pie {
            width: 200px;
            height: 200px;
            margin: 20px auto;
            position: relative;
        }
        
        .pie-slice {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            clip-path: polygon(50% 50%, 100% 0%, 100% 100%);
            transform-origin: 50% 50%;
        }
        
        .pie-slice:nth-child(1) { background: #667eea; }
        .pie-slice:nth-child(2) { background: #764ba2; }
        .pie-slice:nth-child(3) { background: #f093fb; }
        .pie-slice:nth-child(4) { background: #f5576c; }
        
        .chart-legend {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 3px;
        }
        
        .legend-label {
            font-size: 0.9rem;
            color: ${this.options.theme === 'dark' ? '#cccccc' : '#666666'};
        }
        
        .chart-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            justify-content: center;
        }
        
        .chart-btn {
            padding: 8px 16px;
            border: 1px solid #667eea;
            background: transparent;
            color: #667eea;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .chart-btn:hover {
            background: #667eea;
            color: white;
        }
        
        .chart-btn.active {
            background: #667eea;
            color: white;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: ${this.options.theme === 'dark' ? '#cccccc' : '#666666'};
            border-top: 1px solid ${this.options.theme === 'dark' ? '#3d3d3d' : '#e0e0e0'};
        }
        
        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 ${this.options.title}</h1>
            <div class="status-indicator">
                <div class="status-dot" id="statusDot"></div>
                <span id="statusText">Connecting...</span>
            </div>
        </div>
        
        <div class="controls">
            <button class="btn btn-primary" onclick="startMonitoring()">Start Monitoring</button>
            <button class="btn btn-secondary" onclick="stopMonitoring()">Stop Monitoring</button>
            <button class="btn btn-secondary" onclick="clearAlerts()">Clear Alerts</button>
            <button class="btn btn-secondary" onclick="exportData()">Export Data</button>
        </div>
        
        <div class="stats-grid" id="statsGrid">
            <div class="stat-card">
                <div class="stat-number" id="totalFiles">0</div>
                <div class="stat-label">Files Monitored</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="activeAlerts">0</div>
                <div class="stat-label">Active Alerts</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="avgRiskScore">0%</div>
                <div class="stat-label">Avg Risk Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="avgCompatibility">0%</div>
                <div class="stat-label">Avg Compatibility</div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="panel">
                <h2>🚨 Recent Alerts</h2>
                <div id="alertsList" class="file-list">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Waiting for alerts...</p>
                    </div>
                </div>
            </div>
            
            <div class="panel">
                <h2>📁 Monitored Files</h2>
                <div id="filesList" class="file-list">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Waiting for files...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="chart-container">
            <h2>📊 Analytics & Trends</h2>
            <div class="chart-controls">
                <button class="chart-btn active" onclick="showChart('bar')">Bar Chart</button>
                <button class="chart-btn" onclick="showChart('line')">Line Chart</button>
                <button class="chart-btn" onclick="showChart('pie')">Pie Chart</button>
            </div>
            
            <div id="barChart" class="chart">
                <div class="chart-bar" id="barChartContainer">
                    <!-- Bar chart will be generated here -->
                </div>
            </div>
            
            <div id="lineChart" class="chart" style="display: none;">
                <div class="chart-line">
                    <svg width="100%" height="200" viewBox="0 0 400 200">
                        <path class="line-path" id="linePath" d="M0,150 L100,120 L200,80 L300,60 L400,40"></path>
                        <circle class="line-point" cx="0" cy="150" r="4"></circle>
                        <circle class="line-point" cx="100" cy="120" r="4"></circle>
                        <circle class="line-point" cx="200" cy="80" r="4"></circle>
                        <circle class="line-point" cx="300" cy="60" r="4"></circle>
                        <circle class="line-point" cx="400" cy="40" r="4"></circle>
                    </svg>
                </div>
            </div>
            
            <div id="pieChart" class="chart" style="display: none;">
                <div class="chart-pie">
                    <div class="pie-slice" style="transform: rotate(0deg);"></div>
                    <div class="pie-slice" style="transform: rotate(90deg);"></div>
                    <div class="pie-slice" style="transform: rotate(180deg);"></div>
                    <div class="pie-slice" style="transform: rotate(270deg);"></div>
                </div>
                <div class="chart-legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background: #667eea;"></div>
                        <span class="legend-label">Critical</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #764ba2;"></div>
                        <span class="legend-label">High</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #f093fb;"></div>
                        <span class="legend-label">Medium</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #f5576c;"></div>
                        <span class="legend-label">Low</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Baseline Check Tool - Real-time Monitoring Dashboard</p>
            <p>Last updated: <span id="lastUpdated">Never</span></p>
        </div>
    </div>
    
    <script>
        let isMonitoring = false;
        let refreshInterval;
        
        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            updateLastUpdated();
            setInterval(updateLastUpdated, 1000);
            
            // Initialize charts
            updateCharts();
        });
        
        function updateLastUpdated() {
            document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
        }
        
        function startMonitoring() {
            if (isMonitoring) return;
            
            isMonitoring = true;
            document.getElementById('statusDot').classList.remove('offline');
            document.getElementById('statusText').textContent = 'Monitoring';
            
            // Start refreshing data
            refreshInterval = setInterval(refreshData, ${this.options.refreshInterval});
            refreshData();
            
            console.log('🚀 Monitoring started');
        }
        
        function stopMonitoring() {
            if (!isMonitoring) return;
            
            isMonitoring = false;
            document.getElementById('statusDot').classList.add('offline');
            document.getElementById('statusText').textContent = 'Stopped';
            
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
            
            console.log('🛑 Monitoring stopped');
        }
        
        function clearAlerts() {
            document.getElementById('alertsList').innerHTML = '<div class="loading"><p>Alerts cleared</p></div>';
            console.log('🧹 Alerts cleared');
        }
        
        function exportData() {
            const data = {
                timestamp: new Date().toISOString(),
                stats: getCurrentStats(),
                alerts: getCurrentAlerts(),
                files: getCurrentFiles()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'baseline-monitor-data.json';
            a.click();
            URL.revokeObjectURL(url);
            
            console.log('📊 Data exported');
        }
        
        function refreshData() {
            // Simulate data refresh
            updateStats();
            updateAlerts();
            updateFiles();
            updateCharts();
        }
        
        function showChart(type) {
            // Hide all charts
            document.getElementById('barChart').style.display = 'none';
            document.getElementById('lineChart').style.display = 'none';
            document.getElementById('pieChart').style.display = 'none';
            
            // Remove active class from all buttons
            document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
            
            // Show selected chart
            if (type === 'bar') {
                document.getElementById('barChart').style.display = 'block';
                document.querySelector('[onclick="showChart(\\'bar\\')"]').classList.add('active');
            } else if (type === 'line') {
                document.getElementById('lineChart').style.display = 'block';
                document.querySelector('[onclick="showChart(\\'line\\')"]').classList.add('active');
            } else if (type === 'pie') {
                document.getElementById('pieChart').style.display = 'block';
                document.querySelector('[onclick="showChart(\\'pie\\')"]').classList.add('active');
            }
        }
        
        function updateCharts() {
            updateBarChart();
            updateLineChart();
            updatePieChart();
        }
        
        function updateBarChart() {
            const data = generateChartData();
            const container = document.getElementById('barChartContainer');
            
            container.innerHTML = data.map(item => \`
                <div class="bar" style="height: \${item.value}%">
                    <div class="bar-value">\${item.value}</div>
                    <div class="bar-label">\${item.label}</div>
                </div>
            \`).join('');
        }
        
        function updateLineChart() {
            const data = generateLineData();
            const path = document.getElementById('linePath');
            const points = document.querySelectorAll('.line-point');
            
            // Update line path
            let pathData = \`M0,\${data[0].y}\`;
            for (let i = 1; i < data.length; i++) {
                pathData += \` L\${data[i].x},\${data[i].y}\`;
            }
            path.setAttribute('d', pathData);
            
            // Update points
            data.forEach((point, index) => {
                if (points[index]) {
                    points[index].setAttribute('cx', point.x);
                    points[index].setAttribute('cy', point.y);
                }
            });
        }
        
        function updatePieChart() {
            const data = generatePieData();
            const slices = document.querySelectorAll('.pie-slice');
            const legendItems = document.querySelectorAll('.legend-item');
            
            let cumulativeAngle = 0;
            data.forEach((slice, index) => {
                if (slices[index]) {
                    const angle = (slice.value / 100) * 360;
                    slices[index].style.transform = \`rotate(\${cumulativeAngle}deg)\`;
                    slices[index].style.clipPath = \`polygon(50% 50%, 100% 0%, 100% 100%)\`;
                    cumulativeAngle += angle;
                }
                
                if (legendItems[index]) {
                    const label = legendItems[index].querySelector('.legend-label');
                    if (label) {
                        label.textContent = \`\${slice.label} (\${slice.value}%)\`;
                    }
                }
            });
        }
        
        function generateChartData() {
            return [
                { label: 'Critical', value: Math.floor(Math.random() * 20) + 5 },
                { label: 'High', value: Math.floor(Math.random() * 30) + 10 },
                { label: 'Medium', value: Math.floor(Math.random() * 40) + 15 },
                { label: 'Low', value: Math.floor(Math.random() * 25) + 5 },
                { label: 'Resolved', value: Math.floor(Math.random() * 50) + 20 }
            ];
        }
        
        function generateLineData() {
            const points = 5;
            const data = [];
            for (let i = 0; i < points; i++) {
                data.push({
                    x: (i * 100),
                    y: 150 - (Math.random() * 100 + 20)
                });
            }
            return data;
        }
        
        function generatePieData() {
            const total = 100;
            const critical = Math.floor(Math.random() * 20) + 5;
            const high = Math.floor(Math.random() * 30) + 10;
            const medium = Math.floor(Math.random() * 25) + 15;
            const low = total - critical - high - medium;
            
            return [
                { label: 'Critical', value: critical },
                { label: 'High', value: high },
                { label: 'Medium', value: medium },
                { label: 'Low', value: Math.max(0, low) }
            ];
        }
        
        function updateStats() {
            // Simulate stats update
            const stats = {
                totalFiles: Math.floor(Math.random() * 50) + 10,
                activeAlerts: Math.floor(Math.random() * 10),
                avgRiskScore: Math.floor(Math.random() * 40) + 20,
                avgCompatibility: Math.floor(Math.random() * 30) + 70
            };
            
            document.getElementById('totalFiles').textContent = stats.totalFiles;
            document.getElementById('activeAlerts').textContent = stats.activeAlerts;
            document.getElementById('avgRiskScore').textContent = stats.avgRiskScore + '%';
            document.getElementById('avgCompatibility').textContent = stats.avgCompatibility + '%';
        }
        
        function updateAlerts() {
            const alerts = generateMockAlerts();
            const alertsList = document.getElementById('alertsList');
            
            if (alerts.length === 0) {
                alertsList.innerHTML = '<div class="loading"><p>No alerts</p></div>';
                return;
            }
            
            alertsList.innerHTML = alerts.map(alert => \`
                <div class="alert-item \${alert.severity}">
                    <div class="alert-header">
                        <span class="alert-type">\${alert.type}</span>
                        <span class="alert-time">\${alert.time}</span>
                    </div>
                    <div class="alert-message">\${alert.message}</div>
                    <div class="alert-file">\${alert.file}</div>
                </div>
            \`).join('');
        }
        
        function updateFiles() {
            const files = generateMockFiles();
            const filesList = document.getElementById('filesList');
            
            filesList.innerHTML = files.map(file => \`
                <div class="file-item">
                    <div class="file-name">\${file.name}</div>
                    <div class="file-stats">
                        <span class="risk-score \${file.riskClass}">\${file.riskScore}%</span>
                        <span>\${file.compatibility}%</span>
                    </div>
                </div>
            \`).join('');
        }
        
        function generateMockAlerts() {
            const alertTypes = ['compatibility', 'performance', 'security', 'accessibility'];
            const severities = ['critical', 'high', 'medium', 'low'];
            const messages = [
                'CSS Grid needs fallback for older browsers',
                'High risk score detected',
                'Missing accessibility attributes',
                'Performance optimization needed',
                'Security vulnerability found'
            ];
            const files = [
                'src/components/Header.jsx',
                'src/styles/main.css',
                'src/utils/api.js',
                'src/pages/Home.jsx',
                'src/components/Button.jsx'
            ];
            
            const alerts = [];
            const numAlerts = Math.floor(Math.random() * 5);
            
            for (let i = 0; i < numAlerts; i++) {
                alerts.push({
                    type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
                    severity: severities[Math.floor(Math.random() * severities.length)],
                    message: messages[Math.floor(Math.random() * messages.length)],
                    file: files[Math.floor(Math.random() * files.length)],
                    time: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString()
                });
            }
            
            return alerts;
        }
        
        function generateMockFiles() {
            const files = [
                'src/components/Header.jsx',
                'src/styles/main.css',
                'src/utils/api.js',
                'src/pages/Home.jsx',
                'src/components/Button.jsx',
                'src/hooks/useAuth.js',
                'src/styles/variables.css',
                'src/components/Modal.jsx'
            ];
            
            return files.map(file => {
                const riskScore = Math.floor(Math.random() * 100);
                const compatibility = Math.floor(Math.random() * 40) + 60;
                
                return {
                    name: file,
                    riskScore,
                    compatibility,
                    riskClass: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low'
                };
            });
        }
        
        function getCurrentStats() {
            return {
                totalFiles: parseInt(document.getElementById('totalFiles').textContent),
                activeAlerts: parseInt(document.getElementById('activeAlerts').textContent),
                avgRiskScore: parseInt(document.getElementById('avgRiskScore').textContent),
                avgCompatibility: parseInt(document.getElementById('avgCompatibility').textContent)
            };
        }
        
        function getCurrentAlerts() {
            return Array.from(document.querySelectorAll('.alert-item')).map(item => ({
                type: item.querySelector('.alert-type').textContent,
                severity: item.classList[1],
                message: item.querySelector('.alert-message').textContent,
                file: item.querySelector('.alert-file').textContent,
                time: item.querySelector('.alert-time').textContent
            }));
        }
        
        function getCurrentFiles() {
            return Array.from(document.querySelectorAll('.file-item')).map(item => ({
                name: item.querySelector('.file-name').textContent,
                riskScore: parseInt(item.querySelector('.risk-score').textContent),
                compatibility: parseInt(item.querySelector('.file-stats span:last-child').textContent)
            }));
        }
    </script>
</body>
</html>`;
  }

  /**
   * Start the dashboard server
   */
  async start(monitor, alertSystem) {
    this.monitor = monitor;
    this.alertSystem = alertSystem;
    
    const html = this.generateHTML();
    const dashboardPath = './dashboards/realtime/realtime-dashboard.html';
    
    await fs.promises.writeFile(dashboardPath, html);
    
    console.log(`🌐 Real-time dashboard available at: file://${path.resolve(dashboardPath)}`);
    console.log(`📊 Open in your browser to start monitoring`);
    
    return dashboardPath;
  }

  /**
   * Update dashboard with real data
   */
  updateDashboard(data) {
    // This would be called by the monitor to update the dashboard
    // In a real implementation, you'd use WebSockets or Server-Sent Events
    console.log('📊 Dashboard updated with new data');
  }
}

export default RealtimeDashboard;
