class BaselineDashboard {
  constructor() {
    this.data = null;
    this.filteredData = [];
    this.sortColumn = 'feature';
    this.sortDirection = 'asc';
    this.init();
  }

  async init() {
    try {
      this.showLoading();
      await this.loadData();
      this.setupEventListeners();
      this.render();
    } catch (error) {
      this.showError(error);
    }
  }

  async loadData() {
    const response = await fetch("./baseline-report.json");
    if (!response.ok) {
      throw new Error(`Failed to load report: ${response.statusText}`);
    }
    this.data = await response.json();
    this.filteredData = this.data.results || [];
  }

  setupEventListeners() {
    // Search functionality
    document.getElementById('search').addEventListener('input', (e) => {
      this.filterData(e.target.value);
    });

    // Status filter
    document.getElementById('statusFilter').addEventListener('change', (e) => {
      this.filterData(document.getElementById('search').value, e.target.value);
    });

    // Sort functionality
    document.getElementById('sortBy').addEventListener('change', (e) => {
      this.sortColumn = e.target.value;
      this.sortData();
      this.renderTable();
    });

    // Table header sorting
    document.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const column = th.dataset.sort;
        if (this.sortColumn === column) {
          this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortColumn = column;
          this.sortDirection = 'asc';
        }
        this.sortData();
        this.renderTable();
        this.updateSortIndicators();
      });
    });
  }

  filterData(searchTerm = '', statusFilter = '') {
    this.filteredData = (this.data.results || []).filter(item => {
      const matchesSearch = !searchTerm || 
        item.feature.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.files || []).some(file => file.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = !statusFilter || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    this.sortData();
    this.render();
  }

  sortData() {
    this.filteredData.sort((a, b) => {
      let aVal, bVal;
      
      switch (this.sortColumn) {
        case 'feature':
          aVal = a.feature.toLowerCase();
          bVal = b.feature.toLowerCase();
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'count':
          aVal = a.count || 0;
          bVal = b.count || 0;
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  updateSortIndicators() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
      th.classList.remove('sorted-asc', 'sorted-desc');
      if (th.dataset.sort === this.sortColumn) {
        th.classList.add(`sorted-${this.sortDirection}`);
      }
    });
  }

  render() {
    this.hideLoading();
    this.renderStats();
    this.renderTable();
  }

  renderStats() {
    const counts = this.filteredData.reduce((acc, x) => {
      acc[x.status] = (acc[x.status] || 0) + 1;
      return acc;
    }, {});

    const total = this.filteredData.length;
    const scannedFiles = this.data.metadata?.scannedFiles || 0;

    document.getElementById("stats").innerHTML = `
      <div class="stat-card total">
        <div class="stat-number">${total}</div>
        <div class="stat-label">Total Features</div>
      </div>
      <div class="stat-card baseline_like">
        <div class="stat-number">${counts.baseline_like || 0}</div>
        <div class="stat-label">Baseline-like</div>
      </div>
      <div class="stat-card risky">
        <div class="stat-number">${counts.risky || 0}</div>
        <div class="stat-label">Risky</div>
      </div>
      <div class="stat-card unknown">
        <div class="stat-number">${counts.unknown || 0}</div>
        <div class="stat-label">Unknown</div>
      </div>
      <div class="stat-card total">
        <div class="stat-number">${scannedFiles}</div>
        <div class="stat-label">Files Scanned</div>
      </div>
    `;
  }

  renderTable() {
    const tbody = document.querySelector("#tbl tbody");
    tbody.innerHTML = '';

    this.filteredData.forEach(item => {
      const tr = document.createElement("tr");
      
      const featureCell = item.mdn 
        ? `<a href="${item.mdn}" target="_blank" rel="noopener noreferrer">${item.feature}</a>`
        : item.feature;
      
      const filesList = (item.files || []).slice(0, 5).map(file => 
        `<div class="file-item" title="${file}">${file}</div>`
      ).join('');
      
      const moreFiles = (item.files || []).length > 5 
        ? `<div class="file-item">... and ${(item.files || []).length - 5} more</div>`
        : '';
      
      const docLink = item.mdn 
        ? `<a href="${item.mdn}" target="_blank" rel="noopener noreferrer">MDN Docs</a>`
        : '';

      tr.innerHTML = `
        <td><strong>${featureCell}</strong></td>
        <td><span class="status ${item.status}">${item.status.replace('_', ' ')}</span></td>
        <td>${item.count || 0}</td>
        <td><div class="files-list">${filesList}${moreFiles}</div></td>
        <td>${docLink}</td>
      `;
      
      tbody.appendChild(tr);
    });
  }

  showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    document.getElementById('stats').style.display = 'none';
    document.querySelector('.table-container').style.display = 'none';
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('stats').style.display = 'block';
    document.querySelector('.table-container').style.display = 'block';
  }

  showError(error) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('stats').style.display = 'none';
    document.querySelector('.table-container').style.display = 'none';
    
    console.error('Dashboard error:', error);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BaselineDashboard();
});
