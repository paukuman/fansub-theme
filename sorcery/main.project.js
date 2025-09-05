/**
 * ProjectStatusManager Class - Manages project status dashboard with dynamic data
 * 
 * @class
 * @classdesc This class manages the project status dashboard with data from API
 */
class ProjectStatusManager {
  // API configuration
  static API_CONFIG = {
    BASE_URL: 'https://mangadb.paukuman.workers.dev/anime',
    DEFAULT_LIMIT: 10,
    MODAL_LIMIT: 20
  };

  // Status types
  static STATUS_TYPES = {
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    HIATUS: 'hiatus'
  };

  // Status config
  static STATUS_CONFIG = {
    ongoing: {
      icon: 'fas fa-spinner',
      color: 'text-blue-500',
      progressColor: 'bg-blue-500',
      title: 'Ongoing Projects'
    },
    completed: {
      icon: 'fas fa-check-circle',
      color: 'text-green-500',
      progressColor: 'bg-green-500',
      title: 'Completed Projects'
    },
    hiatus: {
      icon: 'fas fa-pause-circle',
      color: 'text-yellow-500',
      progressColor: 'bg-yellow-500',
      title: 'Hiatus Projects'
    }
  };

  /**
   * Constructor - Initializes the ProjectStatusManager instance
   * @constructor
   */
  constructor() {
    this.blogID = this.getBlogID();
    this.statusCounts = {
      [ProjectStatusManager.STATUS_TYPES.ONGOING]: 0,
      [ProjectStatusManager.STATUS_TYPES.COMPLETED]: 0,
      [ProjectStatusManager.STATUS_TYPES.HIATUS]: 0
    };
    
    this.modalOffsets = {
      [ProjectStatusManager.STATUS_TYPES.ONGOING]: 0,
      [ProjectStatusManager.STATUS_TYPES.COMPLETED]: 0,
      [ProjectStatusManager.STATUS_TYPES.HIATUS]: 0
    };
    
    this.isLoading = false;
    this.currentModal = null;
    
    this.init();
  }

  /**
   * Gets blog ID from meta tag
   * @private
   */
  getBlogID() {
    const metaBlogID = document.querySelector('meta[property="blogger:blog_id"]');
    return metaBlogID ? metaBlogID.getAttribute('content') : '5093371246467911599';
  }

  /**
   * Initializes the dashboard
   * @private
   */
  async init() {
    await this.loadStatusCounts();
    this.renderDashboard();
    this.setupEventListeners();
  }

  /**
   * Loads status counts from API
   * @private
   */
  async loadStatusCounts() {
    try {
      // Load all anime to count statuses
      const apiUrl = `${ProjectStatusManager.API_CONFIG.BASE_URL}?blogID=${this.blogID}&page=animeinfo&limit=10000`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 200 || !data.response || !data.response.entries) {
        throw new Error('Invalid API response format');
      }
      
      // Count statuses
      data.response.entries.forEach(entry => {
        const status = this.extractStatus(entry.categories);
        if (status && this.statusCounts.hasOwnProperty(status)) {
          this.statusCounts[status]++;
        }
      });
      
    } catch (error) {
      console.error('Error loading status counts:', error);
      // Set default counts if API fails
      this.statusCounts.ongoing = 8;
      this.statusCounts.completed = 24;
      this.statusCounts.hiatus = 5;
    }
  }

  /**
   * Extracts status from categories
   * @private
   */
  extractStatus(categories) {
    if (!categories || !Array.isArray(categories)) return null;
    
    for (const category of categories) {
      if (category.includes('status:')) {
        const status = category.split(':')[1];
        if (Object.values(ProjectStatusManager.STATUS_TYPES).includes(status)) {
          return status;
        }
      }
    }
    
    return null;
  }

  /**
   * Renders the dashboard with status cards
   * @private
   */
  renderDashboard() {
    const dashboardContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3.gap-6.mb-8');
    
    if (!dashboardContainer) {
      console.error('Dashboard container not found');
      return;
    }
    
    // Clear existing content
    dashboardContainer.innerHTML = '';
    
    // Calculate total projects
    const totalProjects = Object.values(this.statusCounts).reduce((sum, count) => sum + count, 0);
    
    // Create status cards
    Object.entries(this.statusCounts).forEach(([status, count]) => {
      const config = ProjectStatusManager.STATUS_CONFIG[status];
      const progressPercent = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
      
      const card = document.createElement('div');
      card.className = 'glass rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer';
      card.setAttribute('onclick', `projectStatusManager.openModal('${status}')`);
      
      card.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-lg">${config.title}</h3>
          <i class="${config.icon} ${config.color} text-xl ${status === 'ongoing' ? 'animate-spin' : ''}"></i>
        </div>
        <p class="text-gray-600 dark:text-gray-300 mb-2">${count} ${status === 'ongoing' ? 'Active' : status === 'completed' ? 'Finished' : 'On Hold'} Projects</p>
        <div class="h-2 bg-primary-100 dark:bg-primary-800 rounded-full">
          <div class="h-2 ${config.progressColor} rounded-full" style="width: ${progressPercent}%"></div>
        </div>
      `;
      
      dashboardContainer.appendChild(card);
    });
  }

  /**
   * Sets up event listeners
   * @private
   */
  setupEventListeners() {
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentModal) {
        this.closeModal();
      }
    });
  }

  /**
   * Opens modal for a specific status
   * @public
   */
  async openModal(status) {
    this.currentModal = status;
    
    // Show modal
    const modal = document.getElementById(`${status}Modal`);
    if (modal) {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
    
    // Load initial data
    await this.loadModalData(status, true);
  }

  /**
   * Closes the current modal
   * @public
   */
  closeModal() {
    if (this.currentModal) {
      const modal = document.getElementById(`${this.currentModal}Modal`);
      if (modal) {
        modal.style.display = 'none';
      }
      this.currentModal = null;
      document.body.style.overflow = 'auto';
    }
  }

  /**
   * Loads data for modal with pagination
   * @private
   */
  async loadModalData(status, clearExisting = false) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    // Show loading indicator
    const modalContent = document.querySelector(`#${status}Modal .modal-content .space-y-3`);
    if (clearExisting && modalContent) {
      modalContent.innerHTML = `
        <div class="text-center py-4">
          <i class="fas fa-spinner fa-spin text-blue-500"></i>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Loading projects...</p>
        </div>
      `;
    }
    
    try {
      const apiUrl = `${ProjectStatusManager.API_CONFIG.BASE_URL}?blogID=${this.blogID}&page=animeinfo&status=${status}&limit=${ProjectStatusManager.API_CONFIG.MODAL_LIMIT}&offset=${this.modalOffsets[status]}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 200 || !data.response || !data.response.entries) {
        throw new Error('Invalid API response format');
      }
      
      this.renderModalContent(status, data.response.entries, clearExisting);
      
      // Update offset for next load
      if (data.response.entries.length > 0) {
        this.modalOffsets[status] += data.response.entries.length;
      }
      
      // Check if we need to add load more button
      this.checkLoadMoreButton(status, data.response.entries.length);
      
    } catch (error) {
      console.error('Error loading modal data:', error);
      this.renderModalContent(status, [], clearExisting, true);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Renders modal content
   * @private
   */
  renderModalContent(status, entries, clearExisting, isError = false) {
    const modalContent = document.querySelector(`#${status}Modal .modal-content .space-y-3`);
    
    if (!modalContent) return;
    
    if (clearExisting) {
      modalContent.innerHTML = '';
      this.modalOffsets[status] = 0;
    }
    
    // Remove existing load more button
    const existingLoadMore = modalContent.querySelector('.load-more-container');
    if (existingLoadMore) {
      existingLoadMore.remove();
    }
    
    if (isError) {
      modalContent.innerHTML = `
        <div class="text-center py-4 text-gray-600 dark:text-gray-400">
          <i class="fas fa-exclamation-circle text-red-500 mb-2"></i>
          <p>Failed to load data. Please try again later.</p>
        </div>
      `;
      return;
    }
    
    if (entries.length === 0 && clearExisting) {
      modalContent.innerHTML = `
        <div class="text-center py-4 text-gray-600 dark:text-gray-400">
          <i class="fas fa-inbox text-gray-400 mb-2"></i>
          <p>No projects found.</p>
        </div>
      `;
      return;
    }
    
    // Add entries to modal
    entries.forEach(entry => {
      const quality = this.extractQuality(entry.categories);
      
      const entryElement = document.createElement('div');
      entryElement.className = 'flex items-center justify-between p-3 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-lg';
      
      entryElement.innerHTML = `
        <div class="flex-1 min-w-0">
          <h4 class="font-medium truncate">${this.escapeHTML(entry.title || 'Untitled')}</h4>
        </div>
        <span class="text-xs ${this.getQualityClass(quality)} px-2 py-1 rounded ml-2 flex-shrink-0">
          ${quality}
        </span>
      `;
      
      modalContent.appendChild(entryElement);
    });
  }

  /**
   * Extracts quality from categories
   * @private
   */
  extractQuality(categories) {
    if (!categories || !Array.isArray(categories)) return 'HD';
    
    for (const category of categories) {
      if (category.includes('quality:')) {
        return category.split(':')[1] || 'HD';
      }
    }
    
    return 'HD';
  }

  /**
   * Gets CSS class for quality badge
   * @private
   */
  getQualityClass(quality) {
    switch (quality.toUpperCase()) {
      case 'FHD':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'HD':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'SD':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  }

  /**
   * Checks if we need to add a load more button
   * @private
   */
  checkLoadMoreButton(status, entriesCount) {
    const modalContent = document.querySelector(`#${status}Modal .modal-content .space-y-3`);
    
    if (!modalContent) return;
    
    // Remove existing load more button
    const existingLoadMore = modalContent.querySelector('.load-more-container');
    if (existingLoadMore) {
      existingLoadMore.remove();
    }
    
    // Add load more button if we got a full page of results
    if (entriesCount >= ProjectStatusManager.API_CONFIG.MODAL_LIMIT) {
      const loadMoreContainer = document.createElement('div');
      loadMoreContainer.className = 'load-more-container pt-4';
      
      const loadMoreButton = document.createElement('button');
      loadMoreButton.className = 'w-full py-2 bg-primary-100 dark:bg-primary-800 hover:bg-primary-200 dark:hover:bg-primary-700 rounded-lg text-primary-600 dark:text-primary-300 transition-colors';
      loadMoreButton.textContent = 'Load More';
      loadMoreButton.addEventListener('click', () => {
        this.loadModalData(status);
      });
      
      loadMoreContainer.appendChild(loadMoreButton);
      modalContent.appendChild(loadMoreContainer);
    }
  }

  /**
   * Utility function to escape HTML
   * @private
   */
  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Initialize the project status manager
const projectStatusManager = new ProjectStatusManager();

// Global functions for HTML onclick attributes
function openModal(status) {
  projectStatusManager.openModal(status);
}

function closeModal() {
  projectStatusManager.closeModal();
}