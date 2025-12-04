// Modern JavaScript with various browser support levels

// @baseline-check: fetch
// Status: baseline_like
// Browser Support: Chrome 42+, Firefox 39+, Safari 10.1+

// @baseline-check: async/await
// Status: baseline_like
// Browser Support: Chrome 55+, Firefox 52+, Safari 10.1+

// @baseline-check: optional chaining
// Status: risky
// Browser Support: Chrome 80+, Firefox 72+, Safari 13.1+

// @baseline-check: nullish coalescing
// Status: risky
// Browser Support: Chrome 80+, Firefox 72+, Safari 13.1+

class DemoApp {
    constructor() {
        this.init();
    }

    async init() {
        // Modern async/await with error handling
        try {
            await this.loadData();
            this.setupEventListeners();
            this.setupFeatureDetection();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showFallback();
        }
    }

    async loadData() {
        // Modern fetch API with fallback
        if (typeof fetch !== 'undefined') {
            const response = await fetch('/api/data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } else {
            // Fallback to XMLHttpRequest
            return this.loadDataWithXHR();
        }
    }

    loadDataWithXHR() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/api/data');
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(`XHR error! status: ${xhr.status}`));
                }
            };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send();
        });
    }

    setupEventListeners() {
        const demoBtn = document.getElementById('demo-btn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => this.handleDemoClick());
        }

        // Modern event delegation
        document.addEventListener('click', (event) => {
            if (event.target.matches('.feature-card')) {
                this.handleFeatureClick(event.target);
            }
        });
    }

    setupFeatureDetection() {
        // Check for modern JavaScript features
        const features = {
            optionalChaining: this.supportsOptionalChaining(),
            nullishCoalescing: this.supportsNullishCoalescing(),
            fetch: typeof fetch !== 'undefined',
            asyncAwait: this.supportsAsyncAwait()
        };

        // Use modern features if available
        if (features.optionalChaining && features.nullishCoalescing) {
            this.useModernSyntax();
        } else {
            this.useCompatibleSyntax();
        }

        // Log feature support
        console.log('Feature support:', features);
    }

    supportsOptionalChaining() {
        try {
            eval('({})?.property');
            return true;
        } catch (e) {
            return false;
        }
    }

    supportsNullishCoalescing() {
        try {
            eval('null ?? "default"');
            return true;
        } catch (e) {
            return false;
        }
    }

    supportsAsyncAwait() {
        try {
            eval('async () => {}');
            return true;
        } catch (e) {
            return false;
        }
    }

    useModernSyntax() {
        // Modern syntax with optional chaining and nullish coalescing
        const config = {
            apiUrl: process?.env?.API_URL ?? 'https://api.example.com',
            timeout: process?.env?.TIMEOUT ?? 5000
        };
        
        console.log('Using modern syntax:', config);
    }

    useCompatibleSyntax() {
        // Compatible syntax for older browsers
        const config = {
            apiUrl: (process && process.env && process.env.API_URL) || 'https://api.example.com',
            timeout: (process && process.env && process.env.TIMEOUT) || 5000
        };
        
        console.log('Using compatible syntax:', config);
    }

    async handleDemoClick() {
        const button = document.getElementById('demo-btn');
        if (button) {
            button.textContent = 'Loading...';
            button.disabled = true;
        }

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Show success message
            this.showMessage('Demo completed successfully!', 'success');
        } catch (error) {
            this.showMessage('Demo failed: ' + error.message, 'error');
        } finally {
            if (button) {
                button.textContent = 'Try Demo';
                button.disabled = false;
            }
        }
    }

    handleFeatureClick(card) {
        const title = card.querySelector('h3');
        if (title) {
            this.showMessage(`Clicked on: ${title.textContent}`, 'info');
        }
    }

    showMessage(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '4px',
            color: 'white',
            backgroundColor: type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff',
            zIndex: '1000',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
        });

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    showFallback() {
        // Show fallback content for older browsers
        const fallback = document.createElement('div');
        fallback.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px; margin: 1rem;">
                <h3>Your browser doesn't support all features</h3>
                <p>Please consider updating to a modern browser for the best experience.</p>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `;
        
        document.body.insertBefore(fallback, document.body.firstChild);
    }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DemoApp();
    });
} else {
    new DemoApp();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DemoApp;
}
