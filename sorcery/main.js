/**
 * FetchProgress Class - Handles progressive data fetching with progress tracking
 * 
 * @copyright 2023 Paukuman
 * @author Paukuman
 * @version 1.2.0
 * 
 * @class
 * @classdesc This class manages progressive data fetching with visual progress indication,
 * error handling, and content rendering.
 */
class FetchProgress {
  // DOM Selectors
  static SELECTORS = {
    BLOG_ID: 'meta[name="blogID"]',
    CONTENT_CONTAINER: '#content-container',
    PROGRESS_CONTAINER: '#progress-container',
    SKELETON_CONTAINER: '#skeleton-container',
    PROGRESS_BAR: '#progress-bar',
    PROGRESS_PERCENT: '#progress-percent'
  };

  // Error Messages
  static ERROR_MESSAGES = {
    NO_CONTENT_CONTAINER: 'Content container not found',
    FETCH_ERROR: 'Failed to fetch data',
    RENDER_ERROR: 'Error rendering content'
  };

  // Configuration
  static CONFIG = {
    BASE_API_URL: 'https://mangadb.paukuman.workers.dev',
    MIN_PROGRESS_UPDATE: 1, // Only update progress if changed by at least 1%
    HIDE_DELAY: 300 // Delay before hiding progress indicators (ms)
  };

  /**
   * Constructor - Initializes the FetchProgress instance
   * @constructor
   * @param {string} endpoint - API endpoint path (without base URL)
   * @param {Object} [params={}] - Additional query parameters
   */
  constructor(endpoint, params = {}) {
    this.blogID = this.getBlogID();
    this.apiUrl = this.buildApiUrl(endpoint, params);
    this.controller = new AbortController();
    this.signal = this.controller.signal;
    this.lastProgress = 0;
  }

  /**
   * Gets blog ID from meta tag
   * @returns {string} Blog ID or empty string if not found
   */
  getBlogID() {
    const blogIDMeta = document.querySelector(FetchProgress.SELECTORS.BLOG_ID);
    return blogIDMeta?.content || '';
  }

  /**
   * Builds complete API URL
   * @param {string} endpoint - API endpoint path
   * @param {Object} params - Query parameters
   * @returns {string} Complete API URL
   */
  buildApiUrl(endpoint, params) {
    const url = new URL(endpoint, FetchProgress.CONFIG.BASE_API_URL);
    
    // Add blogID if available
    if (this.blogID) {
      url.searchParams.set('blogID', this.blogID);
    }
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return url.toString();
  }

  /**
   * Shows loading indicators
   */
  showLoading() {
    const { PROGRESS_CONTAINER, SKELETON_CONTAINER, CONTENT_CONTAINER } = FetchProgress.SELECTORS;
    const progressContainer = document.querySelector(PROGRESS_CONTAINER);
    const skeletonContainer = document.querySelector(SKELETON_CONTAINER);
    const contentContainer = document.querySelector(CONTENT_CONTAINER);

    if (progressContainer) progressContainer.classList.remove('hidden');
    if (skeletonContainer) skeletonContainer.classList.remove('hidden');
    if (contentContainer) contentContainer.innerHTML = '';
  }

  /**
   * Hides loading indicators
   */
  hideLoading() {
    const { PROGRESS_CONTAINER, SKELETON_CONTAINER } = FetchProgress.SELECTORS;
    const progressContainer = document.querySelector(PROGRESS_CONTAINER);
    const skeletonContainer = document.querySelector(SKELETON_CONTAINER);

    if (progressContainer) progressContainer.classList.add('hidden');
    if (skeletonContainer) skeletonContainer.classList.add('hidden');
  }

  /**
   * Fetches data with progress tracking
   * @async
   * @param {Function} progressCallback - Callback for progress updates
   * @returns {Promise<Object>} Parsed response data
   */
  async fetchWithProgress(progressCallback) {
    this.showLoading();
    
    try {
      const response = await fetch(this.apiUrl, { signal: this.signal });
      
      if (!response.ok) {
        throw new Error(`${FetchProgress.ERROR_MESSAGES.FETCH_ERROR}: ${response.status}`);
      }
      
      const contentLength = response.headers.get('Content-Length');
      const totalBytes = contentLength ? parseInt(contentLength) : null;
      let loadedBytes = 0;
      
      const reader = response.body.getReader();
      const chunks = [];
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          progressCallback(100); // Ensure 100% when done
          break;
        }
        
        chunks.push(value);
        loadedBytes += value.length;
        
        // Calculate progress
        const progress = this.calculateProgress(loadedBytes, totalBytes);
        progressCallback(progress);
      }
      
      return this.processResponse(chunks);
      
    } catch (error) {
      console.error('Fetch error:', error);
      this.hideLoading();
      throw error;
    }
  }

  /**
   * Calculates progress percentage
   * @param {number} loadedBytes - Bytes loaded
   * @param {number|null} totalBytes - Total bytes expected
   * @returns {number} Progress percentage
   */
  calculateProgress(loadedBytes, totalBytes) {
    if (totalBytes) {
      return Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
    }
    // For small responses or unknown length, use logarithmic scale
    return Math.min(99, Math.round(Math.log10(loadedBytes / 1024 + 1) * 50));
  }

  /**
   * Processes response chunks into usable data
   * @param {Array<Uint8Array>} chunks - Response chunks
   * @returns {Object|string} Parsed data
   */
  processResponse(chunks) {
    const combined = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    
    chunks.forEach(chunk => {
      combined.set(chunk, offset);
      offset += chunk.length;
    });
    
    const text = new TextDecoder("utf-8").decode(combined);
    
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  /**
   * Updates progress display
   * @param {number} percent - Current progress percentage
   */
  updateProgress(percent) {
    // Only update if progress changed significantly
    if (Math.abs(percent - this.lastProgress) < FetchProgress.CONFIG.MIN_PROGRESS_UPDATE) {
      return;
    }
    
    this.lastProgress = percent;
    
    const { PROGRESS_BAR, PROGRESS_PERCENT } = FetchProgress.SELECTORS;
    const progressBar = document.querySelector(PROGRESS_BAR);
    const progressPercent = document.querySelector(PROGRESS_PERCENT);
    
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.textContent = `${percent}%`;
    
    if (percent === 100) {
      setTimeout(() => this.hideLoading(), FetchProgress.CONFIG.HIDE_DELAY);
    }
  }

  /**
   * Creates a DOM element from HTML string
   * @param {string} html - HTML string
   * @returns {Node} DOM element
   */
  createElementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  /**
   * Creates an entry element for rendering
   * @param {Object} entry - Data entry
   * @param {Object} animeInfo - Anime information
   * @returns {Node} DOM element for the entry
   */
  createEntryElement(entry, animeInfo) {
    const quality = this.extractCategory(entry.categories, 'quality') || 'N/A';
    const episode = this.extractCategory(entry.categories, 'episode') || 'N/A';
    const season = this.extractCategory(animeInfo.categories, 'season') || 'N/A';
    const resolutions = this.extractResolutions(entry.categories);
    const title = animeInfo.title || entry.title || "Untitled";
    const coverImage = this.extractCoverImage(entry.content);
    const publishDate = entry.published?.relative || 'Posted recently';
    
    const html = `
      <div class="flex gap-4 p-3 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-lg transition-colors">
        ${this.renderCoverImage(coverImage, title, entry.path)}
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <a href="${entry.path}" class="hover:underline">
              <h4 class="font-medium line-clamp-2">${title}</h4>
              <div class="flex gap-2 mt-1">
                <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">${quality}</span>
                <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">E${episode} ◦ S${season}</span>
              </div>
            </a>
            ${this.renderResolutions(resolutions)}
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${publishDate}</p>
        </div>
      </div>
    `;
    
    return this.createElementFromHTML(html);
  }

  /**
   * Renders the cover image section
   * @param {string} coverImage - Image URL
   * @param {string} title - Anime title
   * @param {string} path - Link path
   * @returns {string} HTML string
   */
  renderCoverImage(coverImage, title, path) {
    if (coverImage) {
      return `
        <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden max-[374px]:hidden">
          <a href="${path}">
            <img src="${coverImage}" alt="${title}" class="w-full h-full object-cover" loading="lazy">
          </a>
        </div>
      `;
    }
    
    return `
      <div class="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg overflow-hidden max-[374px]:hidden">
        <a href="${path}" class="w-full h-full flex items-center justify-center text-white">
          <span class="text-lg font-bold">${title[0]?.toUpperCase() || 'A'}</span>
        </a>
      </div>
    `;
  }

  /**
   * Renders resolution tags
   * @param {Array<string>} resolutions - Available resolutions
   * @returns {string} HTML string
   */
  renderResolutions(resolutions) {
    if (!resolutions.length) return '';
    
    return `
      <div class="flex gap-1 flex-wrap justify-end max-[480px]:hidden" style="max-width: 150px;">
        ${resolutions.map(res => 
          `<span class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">${res}p</span>`
        ).join('')}
      </div>
    `;
  }

  /**
   * Extracts value from categories
   * @param {Array<string>} categories - Entry categories
   * @param {string} prefix - Category prefix (e.g., 'quality')
   * @returns {string|null} Extracted value or null
   */
  extractCategory(categories, prefix) {
    if (!categories) return null;
    const category = categories.find(cat => cat.startsWith(`${prefix}:`));
    return category ? category.split(':')[1] : null;
  }

  /**
   * Extracts resolutions from categories
   * @param {Array<string>} categories - Entry categories
   * @returns {Array<string>} Array of resolutions
   */
  extractResolutions(categories) {
    const resolutionStr = this.extractCategory(categories, 'resolution') || '';
    return resolutionStr.split('|').filter(Boolean);
  }

  /**
   * Extracts cover image URL from content
   * @param {string} content - Entry content
   * @returns {string|null} Image URL or null
   */
  extractCoverImage(content) {
    if (!content) return null;
    const match = content.match(/src="([^"]+)"/);
    return match ? match[1] : null;
  }

  /**
   * Renders content to the container
   * @param {Object} data - Response data
   */
  renderContent(data) {
    const container = document.querySelector(FetchProgress.SELECTORS.CONTENT_CONTAINER);
    if (!container) {
      console.error(FetchProgress.ERROR_MESSAGES.NO_CONTENT_CONTAINER);
      return;
    }
    
    // Handle empty or invalid data
    if (!data?.entries?.length) {
      container.innerHTML = '<p class="text-gray-600 dark:text-gray-400">No data available</p>';
      return;
    }
    
    const fragment = document.createDocumentFragment();
    
    data.entries.forEach(entry => {
      try {
        const animeInfo = entry.animeinfo?.entries?.[0] || {};
        const entryElement = this.createEntryElement(entry, animeInfo);
        fragment.appendChild(entryElement);
      } catch (error) {
        console.error(FetchProgress.ERROR_MESSAGES.RENDER_ERROR, error, entry);
        const errorElement = this.createElementFromHTML(
          `<div class="p-3 text-red-500 dark:text-red-400">
            Error rendering entry: ${entry.title || 'Untitled'}
          </div>`
        );
        fragment.appendChild(errorElement);
      }
    });
    
    container.appendChild(fragment);
  }

  /**
   * Executes the fetch and render process
   * @async
   */
  async execute() {
    const container = document.querySelector(FetchProgress.SELECTORS.CONTENT_CONTAINER);
    if (!container) {
      console.log(FetchProgress.ERROR_MESSAGES.NO_CONTENT_CONTAINER);
      return;
    }

    try {
      const data = await this.fetchWithProgress(this.updateProgress.bind(this));
      this.renderContent(data);
    } catch (error) {
      if (error.name !== 'AbortError' && container) {
        container.innerHTML = `
          <div class="text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
            ${FetchProgress.ERROR_MESSAGES.FETCH_ERROR}: ${error.message}
          </div>
        `;
      }
    }
  }

  /**
   * Aborts the current fetch operation
   */
  abort() {
    this.controller.abort();
  }
}

// Usage Example
const fetcher = new FetchProgress('/anime', { 
  page: 'episode',
  // Add other parameters as needed
});
fetcher.execute();

// To abort when needed (e.g., page navigation)
// window.addEventListener('beforeunload', () => fetcher.abort());
