import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export class ProgressBar {
  constructor(total, width = 50) {
    this.total = total;
    this.current = 0;
    this.width = width;
    this.startTime = Date.now();
  }

  update(current, label = '') {
    this.current = current;
    const percentage = Math.round((current / this.total) * 100);
    const filled = Math.round((current / this.total) * this.width);
    const bar = '█'.repeat(filled) + '░'.repeat(this.width - filled);
    
    const elapsed = Date.now() - this.startTime;
    const rate = current / (elapsed / 1000);
    const eta = current > 0 ? Math.round((this.total - current) / rate) : 0;
    
    process.stdout.write(`\r${label} [${bar}] ${percentage}% (${current}/${this.total}) ETA: ${eta}s`);
    
    if (current >= this.total) {
      console.log(); // New line when complete
    }
  }

  complete(label = 'Complete') {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`\r${label} completed in ${elapsed}s`);
  }
}

export class Spinner {
  constructor() {
    this.spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.current = 0;
    this.interval = null;
  }

  start(message = 'Loading...') {
    this.message = message;
    this.interval = setInterval(() => {
      process.stdout.write(`\r${this.spinner[this.current]} ${this.message}`);
      this.current = (this.current + 1) % this.spinner.length;
    }, 100);
  }

  stop(message = 'Done') {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write(`\r✓ ${message}\n`);
  }
}

export class Table {
  constructor(options = {}) {
    this.columns = options.columns || [];
    this.rows = [];
    this.maxWidth = options.maxWidth || process.stdout.columns || 80;
  }

  addRow(row) {
    this.rows.push(row);
  }

  render() {
    if (this.rows.length === 0) return '';

    // Calculate column widths
    const widths = this.columns.map((col, i) => {
      const maxLength = Math.max(
        col.length,
        ...this.rows.map(row => String(row[i] || '').length)
      );
      return Math.min(maxLength, Math.floor(this.maxWidth / this.columns.length));
    });

    // Render header
    let output = '';
    const header = this.columns.map((col, i) => 
      col.padEnd(widths[i]).substring(0, widths[i])
    ).join(' │ ');
    output += header + '\n';
    output += '─'.repeat(header.length) + '\n';

    // Render rows
    for (const row of this.rows) {
      const rowStr = this.columns.map((_, i) => {
        const cell = String(row[i] || '');
        return cell.padEnd(widths[i]).substring(0, widths[i]);
      }).join(' │ ');
      output += rowStr + '\n';
    }

    return output;
  }
}

export class Logger {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.quiet = options.quiet || false;
  }

  info(message) {
    if (!this.quiet) {
      console.log(`ℹ️  ${message}`);
    }
  }

  success(message) {
    if (!this.quiet) {
      console.log(`✅ ${message}`);
    }
  }

  warning(message) {
    if (!this.quiet) {
      console.log(`⚠️  ${message}`);
    }
  }

  error(message) {
    console.error(`❌ ${message}`);
  }

  debug(message) {
    if (this.verbose && !this.quiet) {
      console.log(`🐛 ${message}`);
    }
  }

  verbose(message) {
    if (this.verbose && !this.quiet) {
      console.log(`📝 ${message}`);
    }
  }
}

export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatNumber(num) {
  return num.toLocaleString();
}
