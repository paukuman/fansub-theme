/**
 * FetchProgress Class - Handles progressive data fetching with progress tracking
 * 
 * @copyright 2023 Paukuman
 * @author Paukuman
 * @version 1.3.0
 * 
 * @class
 * @classdesc This class manages progressive data fetching with visual progress indication,
 * error handling, content rendering, and load more functionality.
 */
class FetchProgress {
  // DOM Selectors (patched to existing HTML structure)
  static SELECTORS = {
    BLOG_ID: 'meta[name="blogID"]',
    CONTENT_CONTAINER: '#content-container',
    PROGRESS_CONTAINER: '#progress-container',
    PROGRESS_BAR: '#progress-bar',
    PROGRESS_PERCENT: '#progress-percent',
    LOAD_MORE_BUTTON: '#load-more-button',
    LOAD_MORE_CONTAINER: '#load-more-container',
    // Tambahkan selector untuk tab dan kontainer bookmark/list
    TABS_CONTAINER: '#tabs-container',
    BOOKMARK_TAB: '#bookmark-tab',
    LIST_TAB: '#list-tab'
  };

  // Error Messages
  static ERROR_MESSAGES = {
    NO_CONTENT_CONTAINER: 'Content container not found',
    FETCH_ERROR: 'Failed to fetch data',
    RENDER_ERROR: 'Error rendering content',
    NETWORK_ERROR: 'Network connection failed',
    ABORT_ERROR: 'Request was aborted',
    INVALID_RESPONSE: 'Invalid response format'
  };

  // Configuration
  static CONFIG = {
    BASE_API_URL: 'https://mangadb.paukuman.workers.dev',
    MIN_PROGRESS_UPDATE: 1,
    HIDE_DELAY: 300,
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000,
    ITEMS_PER_PAGE: 2
  };

  /**
   * Constructor - Initializes the FetchProgress instance
   * @constructor
   * @param {string} endpoint - API endpoint path (without base URL)
   * @param {Object} [params={}] - Additional query parameters
   * @throws {Error} If essential elements are missing from DOM
   */
  constructor(endpoint, params = {}) {
    this.blogID = this.getBlogID();
    this.endpoint = endpoint;
    this.baseParams = params;
    this.currentOffset = 1;
    this.hasMore = true;
    this.isLoading = false;
    this.controller = null;
    this.signal = null;
    this.lastProgress = 0;
    this.retryCount = 0;
    this.activeTab = 'api'; // 'api', 'bookmark', atau 'list'

    // Validate essential DOM elements exist
    this.validateDOM();

    // Initialize load more button
    this.initLoadMoreButton();

    // Initialize tabs for bookmark and list
    this.initTabs();

    // Load data from localStorage jika ada
    this.loadLocalData();
  }

  /**
   * Inisialisasi tab untuk bookmark dan list
   * @private
   */
  initTabs() {
    // Buat elemen tab jika belum ada
    const contentContainer = document.querySelector(FetchProgress.SELECTORS.CONTENT_CONTAINER);
    if (contentContainer && !document.querySelector(FetchProgress.SELECTORS.TABS_CONTAINER)) {
      const tabsHTML = `
      <div id="tabs-container" class="flex mb-4 overflow-x-auto scrollbar-hide whitespace-nowrap py-2 -mx-2 px-2">
        <div class="flex space-x-2">
          <button id="api-tab" class="tab-button active px-4 py-2 font-medium text-sm rounded-lg transition-colors whitespace-nowrap flex-shrink-0 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" data-tab="api">
            Latest Updates
          </button>
          <button id="bookmark-tab" class="tab-button px-4 py-2 font-medium text-sm rounded-lg transition-colors whitespace-nowrap flex-shrink-0 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" data-tab="bookmark">
            Bookmarks
          </button>
          <button id="list-tab" class="tab-button px-4 py-2 font-medium text-sm rounded-lg transition-colors whitespace-nowrap flex-shrink-0 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" data-tab="list">
            My List
          </button>
        </div>
      </div>
    `;

      contentContainer.insertAdjacentHTML('beforebegin', tabsHTML);

      // Tambahkan event listener untuk tab
      document.querySelectorAll('.tab-button').forEach(tab => {
        tab.addEventListener('click', () => {
          const tabName = tab.getAttribute('data-tab');
          this.switchTab(tabName);
        });
      });
    }
  }

  /**
   * Beralih antara tab yang berbeda
   * @param {string} tabName - Nama tab yang akan diaktifkan
   */
  switchTab(tabName) {
    this.activeTab = tabName;

    // Update tampilan tab
    document.querySelectorAll('.tab-button').forEach(tab => {
      if (tab.getAttribute('data-tab') === tabName) {
        tab.classList.remove('bg-gray-100', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-200');
        tab.classList.add('bg-blue-100', 'text-blue-800', 'dark:bg-blue-900', 'dark:text-blue-200');
      } else {
        tab.classList.remove('bg-blue-100', 'text-blue-800', 'dark:bg-blue-900', 'dark:text-blue-200');
        tab.classList.add('bg-gray-100', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-200');
      }
    });

    // Muat ulang konten berdasarkan tab aktif
    if (tabName === 'api') {
      this.currentOffset = 1;
      this.hasMore = true;
      this.execute();
    } else {
      this.loadLocalData();
    }
  }

  /**
   * Memuat data dari localStorage untuk bookmark dan list
   */
  loadLocalData() {
    const container = document.querySelector(FetchProgress.SELECTORS.CONTENT_CONTAINER);
    if (!container) return;

    if (this.activeTab === 'bookmark') {
      this.renderBookmarks();
    } else if (this.activeTab === 'list') {
      this.renderList();
    }
  }

  /**
   * Render bookmark dari localStorage
   */
  renderBookmarks() {
    const container = document.querySelector(FetchProgress.SELECTORS.CONTENT_CONTAINER);
    if (!container) return;

    const bookmarksData = localStorage.getItem('animeBookmarks');
    if (!bookmarksData) {
      container.innerHTML = '<p class="text-gray-600 dark:text-gray-400 p-4 text-center">No bookmarks yet</p>';
      return;
    }

    try {
      const bookmarks = JSON.parse(bookmarksData);
      const bookmarkIds = Object.keys(bookmarks);

      if (bookmarkIds.length === 0) {
        container.innerHTML = '<p class="text-gray-600 dark:text-gray-400 p-4 text-center">No bookmarks yet</p>';
        return;
      }

      this.renderAnimeItems(bookmarks, container);
    } catch (error) {
      console.error('Error parsing bookmarks:', error);
      container.innerHTML = '<p class="text-red-500 dark:text-red-400 p-4 text-center">Error loading bookmarks</p>';
    }
  }

  /**
   * Render list dari localStorage
   */
  renderList() {
    const container = document.querySelector(FetchProgress.SELECTORS.CONTENT_CONTAINER);
    if (!container) return;

    const listData = localStorage.getItem('animeList');
    if (!listData) {
      container.innerHTML = '<p class="text-gray-600 dark:text-gray-400 p-4 text-center">Your list is empty</p>';
      return;
    }

    try {
      const list = JSON.parse(listData);
      const listIds = Object.keys(list);

      if (listIds.length === 0) {
        container.innerHTML = '<p class="text-gray-600 dark:text-gray-400 p-4 text-center">Your list is empty</p>';
        return;
      }

      this.renderAnimeItems(list, container, true);
    } catch (error) {
      console.error('Error parsing list:', error);
      container.innerHTML = '<p class="text-red-500 dark:text-red-400 p-4 text-center">Error loading your list</p>';
    }
  }

  /**
   * Render item anime dari data localStorage
   * @param {Object} data - Data anime dari localStorage
   * @param {HTMLElement} container - Container untuk merender
   * @param {boolean} showStatus - Tampilkan status untuk list items
   */
  renderAnimeItems(data, container, showStatus = false) {
    const fragment = document.createDocumentFragment();

    Object.values(data).forEach(anime => {
      try {
        const animeElement = this.createAnimeElement(anime, showStatus);
        if (animeElement) {
          fragment.appendChild(animeElement);
        }
      } catch (error) {
        console.error('Error creating anime element:', error, anime);
      }
    });

    container.innerHTML = '';
    container.appendChild(fragment);

    // Sembunyikan load more container untuk tab bookmark/list
    const loadMoreContainer = document.querySelector(FetchProgress.SELECTORS.LOAD_MORE_CONTAINER);
    if (loadMoreContainer) {
      loadMoreContainer.classList.add('hidden');
    }
  }
  // Tambahkan method baru ini di dalam class FetchProgress

  /**
   * Shows initial loading skeleton inside the content container
   * @private
   */
  showInitialSkeleton() {
    const container = document.querySelector(FetchProgress.SELECTORS.CONTENT_CONTAINER);
    if (!container) return;

    // Contoh HTML untuk satu item skeleton, ulangi sesuai kebutuhan
    const skeletonItemHTML = `
    <div class="flex gap-4 p-3 animate-pulse">
      <div class="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-700 rounded-lg max-[374px]:hidden"></div>
      <div class="flex-1 space-y-3">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  `;

    // Ulangi skeleton sebanyak item per halaman
    container.innerHTML = skeletonItemHTML.repeat(FetchProgress.CONFIG.ITEMS_PER_PAGE);
  }
  /**
   * Buat elemen anime untuk bookmark/list
   * @param {Object} anime - Data anime
   * @param {boolean} showStatus - Tampilkan status
   * @returns {Node|null} Elemen DOM atau null jika gagal
   */
  createAnimeElement(anime, showStatus = false) {
    try {
      const statusClass = this.getStatusClass(anime.status);
      const addedDate = new Date(anime.addedAt).toLocaleDateString();

      const html = `
        <div class="flex gap-4 p-3 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-lg transition-colors">
          <div class="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden max-[374px]:hidden">
            <img src="${this.escapeHTML(anime.image)}" alt="${this.escapeHTML(anime.title)}" class="w-full h-full object-cover" loading="lazy">
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium line-clamp-2">${this.escapeHTML(anime.title)}</h4>
                <div class="flex gap-2 mt-1">
                  ${showStatus ? `<span class="text-xs ${statusClass} px-2 py-1 rounded">${this.escapeHTML(this.formatStatus(anime.status))}</span>` : ''}
                  <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">Added: ${addedDate}</span>
                </div>
              </div>
            </div>
            <div class="mt-2 flex gap-2">
              <button class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded remove-bookmark" data-id="${anime.id}" data-type="${showStatus ? 'list' : 'bookmark'}">
                Remove
              </button>
            </div>
          </div>
        </div>
      `;

      const element = this.createElementFromHTML(html);

      // Tambahkan event listener untuk tombol remove
      if (element) {
        const removeBtn = element.querySelector('.remove-bookmark');
        if (removeBtn) {
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFromStorage(anime.id, showStatus ? 'list' : 'bookmark');
          });
        }
      }

      return element;
    } catch (error) {
      console.error('Error creating anime element:', error);
      return null;
    }
  }

  /**
   * Dapatkan class CSS berdasarkan status anime
   * @param {string} status - Status anime
   * @returns {string} Class CSS
   */
  getStatusClass(status) {
    const statusClasses = {
      'watching': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'completed': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'on_hold': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      'dropped': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      'plan_to_watch': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    };

    return statusClasses[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  }

  // Di dalam class FetchProgress, tambahkan method berikut:

  /**
   * Memuat data spotlight anime untuk carousel
   */
  async loadSpotlightData() {
    try {
      // Tampilkan loading state
      document.getElementById('spotlight-carousel').classList.add('hidden');
      document.getElementById('spotlight-loading').classList.remove('hidden');

      // Build API URL untuk animeinfo
      this.apiUrl = this.buildApiUrl('/anime', {
        page: 'animeinfo',
        limit: 5, // Ambil 5 item untuk carousel
        offset: 0
      });

      // Fetch spotlight data
      const data = await this.fetchWithProgress(this.updateProgress.bind(this));

      // Render spotlight carousel
      this.renderSpotlightCarousel(data);

    } catch (error) {
      console.error('Error loading spotlight data:', error);
      document.getElementById('spotlight-loading').innerHTML = `
            <div class="h-full flex items-center justify-center text-red-500 dark:text-red-400">
                <div class="text-center">
                    <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                    <p>Failed to load spotlight data</p>
                </div>
            </div>
        `;
    }
  }

  /**
   * Render carousel spotlight dengan desain responsif
   * @param {Object} data - Data dari API animeinfo
   */
  renderSpotlightCarousel(data) {
    // Sembunyikan loading, tampilkan carousel
    document.getElementById('spotlight-loading').classList.add('hidden');
    document.getElementById('spotlight-carousel').classList.remove('hidden');

    const itemsContainer = document.getElementById('spotlight-items');
    const dotsContainer = document.getElementById('spotlight-dots');

    // Clear previous content
    itemsContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Periksa jika ada data
    if (!data || !data.response || !data.response.entries || data.response.entries.length === 0) {
      itemsContainer.innerHTML = `
      <div class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div class="text-center p-4">
          <i class="fas fa-film text-4xl mb-2"></i>
          <p>No spotlight anime available</p>
        </div>
      </div>
    `;
      return;
    }

    const animeEntries = data.response.entries;
    let currentIndex = 0;

    // Create carousel items
    animeEntries.forEach((animeData, index) => {
      // Extract data dari categories
      const categories = animeData.categories || [];
      const score = this.extractCategory(categories, 'rate');
      const status = this.extractCategory(categories, 'status');

      // Extract genres
      const genres = categories.filter(cat =>
        !cat.includes(':') &&
        !['page', 'mal_id', 'rate', 'status', 'type', 'season'].includes(cat.toLowerCase())
      ).slice(0, 3); // Limit to 3 genres

      // Extract image dari content
      const imageUrl = this.extractCoverImage(animeData.content);

      // Create carousel item
      const item = document.createElement('div');
      item.className = `absolute inset-0 transition-opacity duration-500 ${index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`;
      item.dataset.index = index;

      item.innerHTML = `
      <!-- Backdrop Cover dengan efek blur -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${imageUrl || ''}'); filter: blur(10px); transform: scale(1.1);"></div>
        <div class="absolute inset-0 bg-black/60"></div>
      </div>
      
      <!-- Content -->
      <div class="relative z-10 h-full flex flex-col md:flex-row spotlight-content">
        <!-- Thumbnail -->
        <div class="w-full md:w-2/5 flex items-center justify-center p-2 md:p-4 lg:p-8 spotlight-thumbnail">
          <div class="w-32 h-44 md:w-56 md:h-auto lg:h-80 rounded-xl overflow-hidden shadow-2xl">
            <img src="${imageUrl || ''}" alt="${animeData.title || 'Anime'}" class="w-full h-full md:h-auto lg:h-full object-cover" loading="lazy">
          </div>
        </div>
        
        <!-- Info -->
        <div class="w-full md:w-3/5 flex items-center text-white p-2 md:p-4 lg:p-8 spotlight-info">
          <div class="max-w-2xl m-auto md:m-0">
            <h3 class="text-base md:text-xl lg:text-4xl font-bold mb-2 md:mb-4 line-clamp-2">${animeData.title || 'No Title'}</h3>
            
            ${score ? `
            <div class="hidden md:flex items-center mb-3 md:mb-4">
              <span class="text-yellow-400 text-base md:text-lg lg:text-xl mr-2">⭐</span>
              <span class="text-lg md:text-xl font-semibold">${score}</span>
            </div>
            ` : ''}
            
            <div class="hidden md:flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6">
              ${status ? `
              <span class="px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${this.getStatusColorClass(status)}">
                ${this.formatStatus(status)}
              </span>
              ` : ''}
            </div>
            
            ${genres.length > 0 ? `
            <div class="flex flex-wrap gap-1 md:gap-2 mb-4 md:mb-6 spotlight-genres">
              ${genres.map(genre => `
                <span class="px-2 md:px-3 py-1 bg-white/20 text-white text-xs md:text-sm rounded-full backdrop-blur-sm">
                  ${genre}
                </span>
              `).join('')}
            </div>
            ` : ''}
            
            <p class="hidden lg:block text-white/80 mb-4 md:mb-8 line-clamp-3 text-sm md:text-base">
              ${animeData.description || 'Description not available in the API response. This would typically contain a summary of the anime plot and story.'}
            </p>
            
            <a href="${animeData.path || '#'}" class="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-base md:text-lg font-medium">
              <i class="fas fa-play mr-2"></i> Watch Now
            </a>
          </div>
        </div>
      </div>
    `;

      itemsContainer.appendChild(item);

      // Create dot indicator
      const dot = document.createElement('button');
      dot.className = `w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${index === 0 ? 'bg-white' : 'bg-white/50'}`;
      dot.dataset.index = index;
      dot.addEventListener('click', () => this.showSpotlightSlide(index));
      dotsContainer.appendChild(dot);
    });

    // Setup navigation
    this.setupSpotlightNavigation(animeEntries.length);

    // Add touch events for mobile
    this.setupTouchEvents();
  }

  /**
   * Setup touch events for mobile swipe
   */
  setupTouchEvents() {
    const carousel = document.getElementById('spotlight-carousel');
    let startX = 0;
    let endX = 0;

    carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, false);

    carousel.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      this.handleSwipe(startX, endX);
    }, false);
  }

  /**
   * Handle swipe gestures for mobile
   * @param {number} startX - Touch start position
   * @param {number} endX - Touch end position
   */
  handleSwipe(startX, endX) {
    const threshold = 50; // Minimum swipe distance

    if (startX - endX > threshold) {
      // Swipe left - next slide
      document.getElementById('spotlight-next').click();
    } else if (endX - startX > threshold) {
      // Swipe right - previous slide
      document.getElementById('spotlight-prev').click();
    }
  }

  /**
   * Setup navigation untuk carousel
   * @param {number} totalSlides - Jumlah total slide
   */
  setupSpotlightNavigation(totalSlides) {
    let currentIndex = 0;

    // Previous button
    document.getElementById('spotlight-prev').addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      this.showSpotlightSlide(currentIndex);
    });

    // Next button
    document.getElementById('spotlight-next').addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % totalSlides;
      this.showSpotlightSlide(currentIndex);
    });

    // Auto-advance slides
    let slideInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % totalSlides;
      this.showSpotlightSlide(currentIndex);
    }, 5000); // Change slide every 5 seconds

    // Pause on hover
    const carousel = document.getElementById('spotlight-carousel');
    carousel.addEventListener('mouseenter', () => clearInterval(slideInterval));
    carousel.addEventListener('mouseleave', () => {
      slideInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        this.showSpotlightSlide(currentIndex);
      }, 5000);
    });
  }

  /**
   * Tampilkan slide tertentu pada carousel
   * @param {number} index - Index slide yang akan ditampilkan
   */
  showSpotlightSlide(index) {
    const items = document.querySelectorAll('#spotlight-items > div');
    const dots = document.querySelectorAll('#spotlight-dots > button');

    items.forEach(item => {
      item.classList.remove('opacity-100', 'z-10');
      item.classList.add('opacity-0', 'z-0');
    });

    dots.forEach(dot => {
      dot.classList.remove('bg-white');
      dot.classList.add('bg-white/50');
    });

    items[index].classList.remove('opacity-0', 'z-0');
    items[index].classList.add('opacity-100', 'z-10');

    dots[index].classList.remove('bg-white/50');
    dots[index].classList.add('bg-white');
  }

  /**
   * Dapatkan class warna berdasarkan status
   * @param {string} status - Status anime
   * @returns {string} Class CSS untuk warna
   */
  getStatusColorClass(status) {
    const statusClasses = {
      'ongoing': 'bg-blue-500/90',
      'completed': 'bg-green-500/90',
      'upcoming': 'bg-yellow-500/90'
    };

    return statusClasses[status] || 'bg-gray-500/90';
  }

  /**
   * Format status untuk ditampilkan
   * @param {string} status - Status anime
   * @returns {string} Status yang diformat
   */
  formatStatus(status) {
    const statusMap = {
      'watching': 'Watching',
      'completed': 'Completed',
      'on_hold': 'On Hold',
      'dropped': 'Dropped',
      'plan_to_watch': 'Plan to Watch'
    };

    return statusMap[status] || status;
  }

  /**
   * Hapus item dari storage
   * @param {string} id - ID anime
   * @param {string} type - Tipe storage ('bookmark' atau 'list')
   */
  removeFromStorage(id, type) {
    const storageKey = type === 'bookmark' ? 'animeBookmarks' : 'animeList';
    const data = localStorage.getItem(storageKey);

    if (!data) return;

    try {
      const items = JSON.parse(data);
      delete items[id];
      localStorage.setItem(storageKey, JSON.stringify(items));

      // Muat ulang konten
      this.loadLocalData();
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  }

  /**
   * Validates that required DOM elements exist
   * @private
   * @throws {Error} If content container is missing
   */
  validateDOM() {
    const contentContainer = document.querySelector(FetchProgress.SELECTORS.CONTENT_CONTAINER);
    if (!contentContainer) {
      throw new Error(FetchProgress.ERROR_MESSAGES.NO_CONTENT_CONTAINER);
    }
  }

  /**
   * Initializes the load more button event listener
   * @private
   */
  initLoadMoreButton() {
    const loadMoreButton = document.querySelector(FetchProgress.SELECTORS.LOAD_MORE_BUTTON);
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', () => {
        if (!this.isLoading && this.hasMore && this.activeTab === 'api') {
          this.currentOffset += FetchProgress.CONFIG.ITEMS_PER_PAGE;
          this.execute(true); // true indicates it's a "load more" request
        }
      });
    }
  }

  /**
   * Gets blog ID from meta tag
   * @returns {string} Blog ID or empty string if not found
   */
  getBlogID() {
    try {
      const blogIDMeta = document.querySelector(FetchProgress.SELECTORS.BLOG_ID);
      return blogIDMeta?.content || '';
    } catch (error) {
      console.warn('Could not retrieve blog ID:', error);
      return '';
    }
  }

  /**
   * Builds complete API URL
   * @param {string} endpoint - API endpoint path
   * @param {Object} params - Query parameters
   * @returns {string} Complete API URL
   */
  buildApiUrl(endpoint, params) {
    try {
      const url = new URL(endpoint, FetchProgress.CONFIG.BASE_API_URL);

      // Add blogID if available
      if (this.blogID) {
        url.searchParams.set('blogID', this.blogID);
      }

      // Add pagination parameters
      url.searchParams.set('limit', FetchProgress.CONFIG.ITEMS_PER_PAGE.toString());
      url.searchParams.set('offset', this.currentOffset.toString());

      // Add additional parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value.toString());
        }
      });

      return url.toString();
    } catch (error) {
      console.error('Error building API URL:', error);
      throw new Error('Invalid API endpoint or parameters');
    }
  }

  /**
   * Shows loading indicators
   * @private
   */
  showLoading() {
    try {
      const { PROGRESS_CONTAINER } = FetchProgress.SELECTORS;
      const progressContainer = document.querySelector(PROGRESS_CONTAINER);
      if (progressContainer) progressContainer.classList.remove('hidden');
    } catch (error) {
      console.warn('Error showing loading indicators:', error);
    }
  }

  /**
   * Hides loading indicators
   * @private
   */
  hideLoading() {
    try {
      const { PROGRESS_CONTAINER } = FetchProgress.SELECTORS;
      const progressContainer = document.querySelector(PROGRESS_CONTAINER);
      if (progressContainer) progressContainer.classList.add('hidden');
    } catch (error) {
      console.warn('Error hiding loading indicators:', error);
    }
  }

  /**
   * Format status untuk ditampilkan
   * @param {string} status - Status dari API
   * @returns {string} Status yang diformat
   */
  formatStatus(status) {
    const statusMap = {
      'ongoing': 'Ongoing',
      'completed': 'Completed',
      'upcoming': 'Upcoming'
    };

    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  }

  /**
   * Buka modal untuk menambahkan anime ke list
   * @param {Object} animeData - Data anime
   */
  openAddToListModal(animeData) {
    // Implementasi modal untuk memilih status (Watching, Completed, etc.)
    console.log('Open add to list modal for:', animeData);
    // Di sini Anda bisa implementasikan modal untuk memilih status
    alert(`Add "${animeData.title}" to your list feature would be implemented here`);
  }

  /**
   * Shows or hides the load more button based on hasMore state
   * @private
   */
  updateLoadMoreButton() {
    const loadMoreContainer = document.querySelector(FetchProgress.SELECTORS.LOAD_MORE_CONTAINER);
    const loadMoreButton = document.querySelector(FetchProgress.SELECTORS.LOAD_MORE_BUTTON);

    if (loadMoreContainer && loadMoreButton) {
      if (this.hasMore) {
        loadMoreContainer.classList.remove('hidden');
        loadMoreButton.disabled = false;
        loadMoreButton.textContent = 'Load More';
      } else {
        loadMoreContainer.classList.add('hidden');
      }
    }
  }

  /**
   * Shows loading state on load more button
   * @private
   */
  showLoadMoreLoading() {
    const loadMoreButton = document.querySelector(FetchProgress.SELECTORS.LOAD_MORE_BUTTON);
    if (loadMoreButton) {
      loadMoreButton.disabled = true;
      loadMoreButton.innerHTML = '<span class="loading-spinner">Loading...</span>';
    }
  }

  /**
   * Creates and sets up abort controller for the request
   * @private
   */
  setupAbortController() {
    this.controller = new AbortController();
    this.signal = this.controller.signal;
  }

  /**
   * Handles fetch errors with retry logic
   * @private
   * @param {Error} error - The error that occurred
   * @param {Function} fetchFunction - The fetch function to retry
   * @returns {Promise<Object>} The response data
   */
  async handleFetchError(error, fetchFunction) {
    // Don't retry if the request was aborted
    if (error.name === 'AbortError') {
      throw error;
    }

    // Retry for network errors or server errors
    if (this.retryCount < FetchProgress.CONFIG.MAX_RETRIES) {
      this.retryCount++;
      console.warn(`Retrying request (${this.retryCount}/${FetchProgress.CONFIG.MAX_RETRIES})...`);

      await new Promise(resolve => setTimeout(resolve, FetchProgress.CONFIG.RETRY_DELAY * this.retryCount));
      return this.fetchWithProgress(fetchFunction);
    }

    throw error;
  }

  /**
   * Fetches data with progress tracking
   * @async
   * @param {Function} progressCallback - Callback for progress updates
   * @returns {Promise<Object>} Parsed response data
   */
  async fetchWithProgress(progressCallback) {
    this.setupAbortController();

    try {
      const response = await fetch(this.apiUrl, {
        signal: this.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`${FetchProgress.ERROR_MESSAGES.FETCH_ERROR}: ${response.status} ${response.statusText}`);
      }

      const contentLength = response.headers.get('Content-Length');
      const totalBytes = contentLength ? parseInt(contentLength) : null;

      if (!response.body) {
        throw new Error(FetchProgress.ERROR_MESSAGES.INVALID_RESPONSE);
      }

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
      return this.handleFetchError(error, progressCallback);
    }
  }

  /**
   * Calculates progress percentage
   * @param {number} loadedBytes - Bytes loaded
   * @param {number|null} totalBytes - Total bytes expected
   * @returns {number} Progress percentage
   */
  calculateProgress(loadedBytes, totalBytes) {
    if (totalBytes && totalBytes > 0) {
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
    try {
      const combined = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;

      chunks.forEach(chunk => {
        combined.set(chunk, offset);
        offset += chunk.length;
      });

      const text = new TextDecoder("utf-8").decode(combined);

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn('Response is not JSON, returning as text:', parseError);
        return text;
      }
    } catch (error) {
      console.error('Error processing response:', error);
      throw new Error('Failed to process server response');
    }
  }

  /**
   * Updates progress display
   * @param {number} percent - Current progress percentage
   */
  updateProgress(percent) {
    // Only update if progress changed significantly
    if (Math.abs(percent - this.lastProgress) < FetchProgress.CONFIG.MIN_PROGRESS_UPDATE && percent !== 100) {
      return;
    }

    this.lastProgress = percent;

    try {
      const { PROGRESS_BAR, PROGRESS_PERCENT } = FetchProgress.SELECTORS;
      const progressBar = document.querySelector(PROGRESS_BAR);
      const progressPercent = document.querySelector(PROGRESS_PERCENT);

      if (progressBar) progressBar.style.width = `${percent}%`;
      if (progressPercent) progressPercent.textContent = `${percent}%`;

      if (percent === 100) {
        setTimeout(() => this.hideLoading(), FetchProgress.CONFIG.HIDE_DELAY);
      }
    } catch (error) {
      console.warn('Error updating progress display:', error);
    }
  }

  /**
   * Creates a DOM element from HTML string
   * @param {string} html - HTML string
   * @returns {Node|null} DOM element or null if creation fails
   */
  createElementFromHTML(html) {
    try {
      const template = document.createElement('template');
      template.innerHTML = html.trim();
      return template.content.firstChild;
    } catch (error) {
      console.error('Error creating element from HTML:', error, html);
      return null;
    }
  }

  /**
   * Creates an entry element for rendering
   * @param {Object} entry - Data entry
   * @param {Object} animeInfo - Anime information
   * @returns {Node|null} DOM element for the entry or null if creation fails
   */
  createEntryElement(entry, animeInfo) {
    try {
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
              <a href="${this.escapeHTML(entry.path)}" class="hover:underline">
                <h4 class="font-medium line-clamp-2">${this.escapeHTML(title)}</h4>
                <div class="flex gap-2 mt-1">
                  <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">${this.escapeHTML(quality)}</span>
                  <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">E${this.escapeHTML(episode)} ◦ S${this.escapeHTML(season)}</span>
                </div>
              </a>
              ${this.renderResolutions(resolutions)}
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${this.escapeHTML(publishDate)}</p>
          </div>
        </div>
      `;

      return this.createElementFromHTML(html);
    } catch (error) {
      console.error('Error creating entry element:', error, entry);
      return null;
    }
  }

  /**
   * Escapes HTML special characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHTML(text) {
    if (typeof text !== 'string') return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
        <div class="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <a href="${this.escapeHTML(path)}">
            <img src="${this.escapeHTML(coverImage)}" alt="${this.escapeHTML(title)}" class="w-full h-full object-cover" loading="lazy">
          </a>
        </div>
      `;
    }

    return `
      <div class="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg overflow-hidden max-[374px]:hidden">
        <a href="${this.escapeHTML(path)}" class="w-full h-full flex items-center justify-center text-white">
          <span class="text-lg font-bold">${this.escapeHTML(title[0]?.toUpperCase() || 'A')}</span>
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
    if (!resolutions || !resolutions.length) return '';

    return `
      <div class="flex gap-1 flex-wrap justify-end max-[480px]:hidden" style="max-width: 150px;">
        ${resolutions.map(res =>
      `<span class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">${this.escapeHTML(res)}p</span>`
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
    if (!categories || !Array.isArray(categories)) return null;

    try {
      const category = categories.find(cat =>
        cat && typeof cat === 'string' && cat.startsWith(`${prefix}:`)
      );
      return category ? category.split(':')[1] : null;
    } catch (error) {
      console.warn('Error extracting category:', error);
      return null;
    }
  }

  /**
   * Extracts resolutions from categories
   * @param {Array<string>} categories - Entry categories
   * @returns {Array<string>} Array of resolutions
   */
  extractResolutions(categories) {
    try {
      const resolutionStr = this.extractCategory(categories, 'resolution') || '';
      return resolutionStr.split('|').filter(res => res && res.trim());
    } catch (error) {
      console.warn('Error extracting resolutions:', error);
      return [];
    }
  }

  /**
   * Extracts cover image URL from content
   * @param {string} content - Entry content
   * @returns {string|null} Image URL or null
   */
  extractCoverImage(content) {
    if (!content || typeof content !== 'string') return null;

    try {
      const match = content.match(/src="([^"]+)"/);
      return match ? match[1] : null;
    } catch (error) {
      console.warn('Error extracting cover image:', error);
      return null;
    }
  }

  /**
   * Renders error message in the container
   * @param {string} message - Error message to display
   * @param {string} details - Additional error details
   * @private
   */
  renderError(message, details = '') {
    const container = document.querySelector(FetchProgress.SELECTORS.CONTENT_CONTAINER);
    if (!container) return;

    container.innerHTML = `
      <div class="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">${this.escapeHTML(message)}</h3>
            ${details ? `<div class="mt-2 text-sm text-red-700 dark:text-red-300">${this.escapeHTML(details)}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders content to the container
   * @param {Object} data - Response data
   * @param {boolean} isLoadMore - Whether this is a load more operation
   */
  renderContent(data, isLoadMore = false) {
    const container = document.querySelector(FetchProgress.SELECTORS.CONTENT_CONTAINER);
    if (!container) {
      console.error(FetchProgress.ERROR_MESSAGES.NO_CONTENT_CONTAINER);
      return;
    }

    // Handle empty or invalid data
    if (!data || typeof data !== 'object' || !data.entries || !Array.isArray(data.entries)) {
      this.renderError('Invalid data received from server', 'The server returned an unexpected format.');
      return;
    }

    // Update hasMore state based on the number of items returned
    // If we get fewer items than requested, we've reached the end
    this.hasMore = data.entries.length === FetchProgress.CONFIG.ITEMS_PER_PAGE;

    if (!data.entries.length && !isLoadMore) {
      container.innerHTML = '<p class="text-gray-600 dark:text-gray-400 p-4 text-center">No content available</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    let successfulRenders = 0;

    data.entries.forEach(entry => {
      try {
        const animeInfo = entry.animeinfo?.entries?.[0] || {};
        const entryElement = this.createEntryElement(entry, animeInfo);

        if (entryElement) {
          fragment.appendChild(entryElement);
          successfulRenders++;
        }
      } catch (error) {
        console.error(FetchProgress.ERROR_MESSAGES.RENDER_ERROR, error, entry);
        const errorElement = this.createElementFromHTML(
          `<div class="p-3 text-red-500 dark:text-red-400">
            Error rendering entry: ${this.escapeHTML(entry.title || 'Untitled')}
          </div>`
        );

        if (errorElement) {
          fragment.appendChild(errorElement);
        }
      }
    });

    if (successfulRenders === 0 && !isLoadMore) {
      this.renderError('Failed to render any content', 'All entries could not be processed.');
      return;
    }

    if (isLoadMore) {
      container.appendChild(fragment);
    } else {
      container.innerHTML = '';
      container.appendChild(fragment);
    }

    // Update the load more button state
    this.updateLoadMoreButton();
  }

  /**
   * Executes the fetch and render process
   * @async
   * @param {boolean} isLoadMore - Whether this is a load more operation
   */
  async execute(isLoadMore = false) {
    if (this.isLoading || this.activeTab !== 'api') return;
    this.isLoading = true;

    // --- PERUBAHAN DI SINI ---
    // Tampilkan UI loading yang sesuai
    if (isLoadMore) {
      this.showLoadMoreLoading();
    } else {
      // Untuk pemuatan awal, tampilkan progress bar dan skeleton dinamis
      this.showLoading();
      this.showInitialSkeleton();
    }
    // --- AKHIR PERUBAHAN ---

    try {
      this.apiUrl = this.buildApiUrl(this.endpoint, this.baseParams);
      // Hapus pemanggilan this.showLoading() dari fetchWithProgress jika ada
      const data = await this.fetchWithProgress(this.updateProgress.bind(this));
      this.renderContent(data, isLoadMore);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      console.error('Fetch error:', error);
      let errorMessage = FetchProgress.ERROR_MESSAGES.FETCH_ERROR;
      let errorDetails = error.message;

      if (error.message.includes('Failed to fetch')) {
        errorMessage = FetchProgress.ERROR_MESSAGES.NETWORK_ERROR;
        errorDetails = 'Please check your internet connection and try again.';
      }

      if (!isLoadMore) {
        this.renderError(errorMessage, errorDetails);
      } else {
        this.currentOffset -= FetchProgress.CONFIG.ITEMS_PER_PAGE;
      }
    } finally {
      this.isLoading = false;
      // hideLoading() sekarang hanya menyembunyikan progress bar
      this.hideLoading();
      if (this.activeTab === 'api') {
        this.updateLoadMoreButton();
      }
    }
  }

  /**
   * Shows or hides the load more button based on hasMore state
   * @private
   */
  updateLoadMoreButton() {
    // Only update for API tab
    if (this.activeTab !== 'api') return;

    const loadMoreContainer = document.querySelector(FetchProgress.SELECTORS.LOAD_MORE_CONTAINER);
    const loadMoreButton = document.querySelector(FetchProgress.SELECTORS.LOAD_MORE_BUTTON);

    if (loadMoreContainer && loadMoreButton) {
      if (this.hasMore) {
        loadMoreContainer.classList.remove('hidden');
        loadMoreButton.disabled = false;
        loadMoreButton.textContent = 'Load More';
      } else {
        loadMoreContainer.classList.add('hidden');
      }
    }
  }

  /**
   * Aborts the current fetch operation
   */
  abort() {
    if (this.controller) {
      this.controller.abort();
    }
  }

  /**
   * Resets the fetcher to initial state
   * Useful for refreshing the content from the beginning
   */
  reset() {
    this.currentOffset = 0;
    this.hasMore = true;
    this.abort();
    this.execute(false);
  }
}

// Inisialisasi spotlight carousel
const spotlightLoader = new FetchProgress('/anime', {
  page: 'animeinfo'
});
spotlightLoader.loadSpotlightData();

// Juga inisialisasi fetcher untuk konten utama
const fetcher = new FetchProgress('/anime', {
  page: 'episode'
});
fetcher.execute();

// To abort when needed (e.g., page navigation)
// window.addEventListener('beforeunload', () => fetcher.abort());

// To reset and load from the beginning
// fetcher.reset();