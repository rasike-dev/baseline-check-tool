import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export class CacheManager {
  constructor(cacheDir = '.baseline-cache') {
    this.cacheDir = cacheDir;
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  generateFileHash(filePath, content) {
    const stats = fs.statSync(filePath);
    const hash = crypto.createHash('md5');
    hash.update(content);
    hash.update(stats.mtime.toISOString());
    hash.update(stats.size.toString());
    return hash.digest('hex');
  }

  getCacheKey(scanPaths, config) {
    const hash = crypto.createHash('md5');
    hash.update(JSON.stringify(scanPaths));
    hash.update(JSON.stringify(config));
    return hash.digest('hex');
  }

  getCachedResult(key) {
    const cacheFile = path.join(this.cacheDir, `${key}.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        // Check if cache is still valid (24 hours)
        const age = Date.now() - cached.timestamp;
        if (age < 24 * 60 * 60 * 1000) {
          return cached.data;
        }
      } catch (error) {
        // Cache corrupted, ignore
      }
    }
    return null;
  }

  setCachedResult(key, data) {
    const cacheFile = path.join(this.cacheDir, `${key}.json`);
    const cacheData = {
      timestamp: Date.now(),
      data
    };
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
  }

  invalidateCache() {
    if (fs.existsSync(this.cacheDir)) {
      fs.rmSync(this.cacheDir, { recursive: true, force: true });
    }
  }

  getCacheStats() {
    if (!fs.existsSync(this.cacheDir)) {
      return { files: 0, size: 0 };
    }

    const files = fs.readdirSync(this.cacheDir);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(this.cacheDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }

    return {
      files: files.length,
      size: totalSize,
      sizeFormatted: this.formatBytes(totalSize)
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
