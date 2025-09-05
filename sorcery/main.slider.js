/**
 * AnimeSlider Class - Handles anime info slider with modern design (Owl Carousel Style)
 * 
 * @class
 * @classdesc This class manages anime information slider with smooth scrolling and responsive design.
 */
class AnimeSlider {
  // DOM Selectors
  static SELECTORS = {
    SLIDER_CONTAINER: '#slider-container',
    SLIDER_TRACK: '#slider-track',
    SLIDER_PREV_BUTTON: '#slider-prev',
    SLIDER_NEXT_BUTTON: '#slider-next',
    SLIDER_DOTS: '#slider-dots'
  };

  // Configuration
  static CONFIG = {
    SLIDER_GAP: 16,
    ITEMS_PER_VIEW: {
      default: 3,     // For very small screens
      xs: 3,          // Extra small (mobile portrait)
      sm: 4,          // Small (mobile landscape)
      md: 4,          // Medium (tablets)
      lg: 5,          // Large (small desktops)
      xl: 6           // Extra large (large desktops)
    },
    AUTO_PLAY_INTERVAL: 5000,
    BREAKPOINTS: {
      xs: 480,        // Extra small devices (phones)
      sm: 640,        // Small devices (phones landscape)
      md: 768,        // Medium devices (tablets)
      lg: 1024,       // Large devices (desktops)
      xl: 1280        // Extra large devices (large desktops)
    },
    ASPECT_RATIO: 9/16 // 9:16 aspect ratio for images
  };

  /**
   * Constructor - Initializes the AnimeSlider instance
   * @constructor
   */
  constructor() {
    this.sliderTrack = document.querySelector(AnimeSlider.SELECTORS.SLIDER_TRACK);
    this.prevButton = document.querySelector(AnimeSlider.SELECTORS.SLIDER_PREV_BUTTON);
    this.nextButton = document.querySelector(AnimeSlider.SELECTORS.SLIDER_NEXT_BUTTON);
    this.dotsContainer = document.querySelector(AnimeSlider.SELECTORS.SLIDER_DOTS);
    this.currentPosition = 0;
    this.sliderItems = [];
    this.autoPlayInterval = null;
    this.isDragging = false;
    this.startPosition = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationId = null;
    this.currentIndex = 0;
    this.canNavigate = true;
    
    if (this.sliderTrack) {
      this.init();
    }
  }

  /**
   * Initializes the slider
   * @private
   */
  init() {
    this.sliderItems = Array.from(this.sliderTrack.children);
    this.setupEventListeners();
    this.setupSliderItems();
    this.updateSlider();
    this.updateNavigationState();
    this.startAutoPlay();
    
    // Initialize dots if container exists
    if (this.dotsContainer && this.sliderItems.length > 0) {
      this.createDots();
      this.updateDots();
    }
  }

  /**
   * Sets up slider items with proper aspect ratio
   * @private
   */
  setupSliderItems() {
    this.sliderItems.forEach(item => {
      const img = item.querySelector('img');
      if (img) {
        // Ensure images maintain 9:16 aspect ratio
        img.style.objectFit = 'cover';
        
        // Add loading lazy for better performance
        img.loading = 'lazy';
      }
      
      // Set fixed width for each slide based on current viewport
      this.updateSlideWidths();
    });
  }

  /**
   * Updates slide widths based on current viewport
   * @private
   */
  updateSlideWidths() {
    const slideWidth = this.getSlideWidth();
    this.sliderItems.forEach(item => {
      item.style.width = `${slideWidth}px`;
    });
  }

  /**
   * Sets up event listeners for the slider
   * @private
   */
  setupEventListeners() {
    // Navigation buttons
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.prev());
    }
    
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.next());
    }

    // Touch events for mobile
    this.sliderTrack.addEventListener('touchstart', this.touchStart.bind(this));
    this.sliderTrack.addEventListener('touchmove', this.touchMove.bind(this));
    this.sliderTrack.addEventListener('touchend', this.touchEnd.bind(this));

    // Mouse events for desktop
    this.sliderTrack.addEventListener('mousedown', this.touchStart.bind(this));
    this.sliderTrack.addEventListener('mousemove', this.touchMove.bind(this));
    this.sliderTrack.addEventListener('mouseup', this.touchEnd.bind(this));
    this.sliderTrack.addEventListener('mouseleave', this.touchEnd.bind(this));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    // Window resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.updateSlideWidths();
        this.updateSlider();
        this.updateNavigationState();
        this.createDots();
        this.updateDots();
      }, 250);
    });

    // Show navigation buttons on container hover
    const container = this.sliderTrack.parentElement;
    if (container) {
      container.addEventListener('mouseenter', () => {
        if (this.prevButton && this.canGoPrev()) this.prevButton.style.opacity = '1';
        if (this.nextButton && this.canGoNext()) this.nextButton.style.opacity = '1';
      });
      
      container.addEventListener('mouseleave', () => {
        if (this.prevButton) this.prevButton.style.opacity = '0';
        if (this.nextButton) this.nextButton.style.opacity = '0';
      });
    }
  }

  /**
   * Check if can go to previous slide
   * @private
   */
  canGoPrev() {
    return this.currentIndex > 0;
  }

  /**
   * Check if can go to next slide
   * @private
   */
  canGoNext() {
    const itemsPerView = this.getItemsPerView();
    return this.currentIndex < this.sliderItems.length - itemsPerView;
  }

  /**
   * Update navigation button states
   * @private
   */
  updateNavigationState() {
    if (this.prevButton) {
      if (this.canGoPrev()) {
        this.prevButton.style.display = 'flex';
        this.prevButton.style.opacity = '0';
        this.prevButton.disabled = false;
      } else {
        this.prevButton.style.display = 'none';
        this.prevButton.disabled = true;
      }
    }
    
    if (this.nextButton) {
      if (this.canGoNext()) {
        this.nextButton.style.display = 'flex';
        this.nextButton.style.opacity = '0';
        this.nextButton.disabled = false;
      } else {
        this.nextButton.style.display = 'none';
        this.nextButton.disabled = true;
      }
    }
  }

  /**
   * Handles touch/mouse start event
   * @private
   */
  touchStart(e) {
    // Don't allow dragging if there's nowhere to drag to
    if (!this.canGoPrev() && !this.canGoNext()) {
      this.canNavigate = false;
      return;
    }
    
    this.canNavigate = true;
    
    if (this.autoPlayInterval) {
      this.stopAutoPlay();
    }
    
    this.isDragging = true;
    this.startPosition = this.getPositionX(e);
    this.prevTranslate = this.currentTranslate;
    
    this.sliderTrack.style.cursor = 'grabbing';
    this.sliderTrack.style.transition = 'none';
    
    // Cancel any ongoing animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  /**
   * Handles touch/mouse move event
   * @private
   */
  touchMove(e) {
    if (!this.isDragging || !this.canNavigate) return;
    e.preventDefault();
    
    const currentPosition = this.getPositionX(e);
    this.currentTranslate = this.prevTranslate + currentPosition - this.startPosition;
    
    // Prevent dragging beyond boundaries
    const slideWidth = this.getSlideWidth();
    const itemsPerView = this.getItemsPerView();
    const maxPosition = -slideWidth * (this.sliderItems.length - itemsPerView);
    
    if (this.currentTranslate > 0) {
      this.currentTranslate = 0; // Prevent dragging past first item
    } else if (this.currentTranslate < maxPosition) {
      this.currentTranslate = maxPosition; // Prevent dragging past last item
    }
    
    // Use requestAnimationFrame for smoother dragging
    this.animationId = requestAnimationFrame(() => {
      this.sliderTrack.style.transform = `translateX(${this.currentTranslate}px)`;
    });
  }

  /**
   * Handles touch/mouse end event
   * @private
   */
  touchEnd() {
    if (!this.isDragging || !this.canNavigate) return;
    
    this.isDragging = false;
    this.sliderTrack.style.cursor = 'grab';
    this.sliderTrack.style.transition = 'transform 0.3s ease-out';
    
    const movedBy = this.currentTranslate - this.prevTranslate;
    
    // If moved significantly, go to next/prev slide
    if (movedBy < -50 && this.canGoNext()) {
      this.next();
    } else if (movedBy > 50 && this.canGoPrev()) {
      this.prev();
    } else {
      // Snap back to the closest position
      this.goToSlide(this.currentIndex);
    }
    
    this.startAutoPlay();
  }

  /**
   * Gets position X from event
   * @private
   */
  getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }

  /**
   * Gets the width of a single slide including gap
   * @private
   */
  getSlideWidth() {
    const container = this.sliderTrack.parentElement;
    if (!container || this.sliderItems.length === 0) return 0;
    
    const containerWidth = container.offsetWidth;
    const itemsPerView = this.getItemsPerView();
    
    return (containerWidth - (AnimeSlider.CONFIG.SLIDER_GAP * (itemsPerView - 1))) / itemsPerView;
  }

  /**
   * Gets the number of items visible based on screen size
   * @private
   */
  getItemsPerView() {
    const width = window.innerWidth;
    
    if (width >= AnimeSlider.CONFIG.BREAKPOINTS.xl) {
      return AnimeSlider.CONFIG.ITEMS_PER_VIEW.xl;
    } else if (width >= AnimeSlider.CONFIG.BREAKPOINTS.lg) {
      return AnimeSlider.CONFIG.ITEMS_PER_VIEW.lg;
    } else if (width >= AnimeSlider.CONFIG.BREAKPOINTS.md) {
      return AnimeSlider.CONFIG.ITEMS_PER_VIEW.md;
    } else if (width >= AnimeSlider.CONFIG.BREAKPOINTS.sm) {
      return AnimeSlider.CONFIG.ITEMS_PER_VIEW.sm;
    } else if (width >= AnimeSlider.CONFIG.BREAKPOINTS.xs) {
      return AnimeSlider.CONFIG.ITEMS_PER_VIEW.xs;
    } else {
      return AnimeSlider.CONFIG.ITEMS_PER_VIEW.default;
    }
  }

  /**
   * Updates slider position and styles
   * @private
   */
  updateSlider() {
    this.updateSlideWidths();
    
    const slideWidth = this.getSlideWidth();
    const itemsPerView = this.getItemsPerView();
    const maxPosition = -slideWidth * (this.sliderItems.length - itemsPerView);
    
    // Ensure current position is within bounds
    this.currentPosition = Math.max(maxPosition, Math.min(0, this.currentPosition));
    
    this.sliderTrack.style.transition = 'transform 0.3s ease-out';
    this.sliderTrack.style.transform = `translateX(${this.currentPosition}px)`;
    
    // Update gap between items
    this.sliderTrack.style.gap = `${AnimeSlider.CONFIG.SLIDER_GAP}px`;
    
    // Update current index
    this.currentIndex = Math.round(-this.currentPosition / slideWidth);
    
    // Update navigation state
    this.updateNavigationState();
  }

  /**
   * Navigates to the next slide
   * @public
   */
  next() {
    if (!this.canGoNext()) return;
    
    const slideWidth = this.getSlideWidth();
    this.currentIndex++;
    this.currentPosition = -this.currentIndex * slideWidth;
    
    this.goToSlide(this.currentIndex);
    this.updateDots();
    this.updateNavigationState();
  }

  /**
   * Navigates to the previous slide
   * @public
   */
  prev() {
    if (!this.canGoPrev()) return;
    
    const slideWidth = this.getSlideWidth();
    this.currentIndex--;
    this.currentPosition = -this.currentIndex * slideWidth;
    
    this.goToSlide(this.currentIndex);
    this.updateDots();
    this.updateNavigationState();
  }

  /**
   * Smoothly moves slider to specified slide index
   * @private
   */
  goToSlide(index) {
    const slideWidth = this.getSlideWidth();
    const itemsPerView = this.getItemsPerView();
    this.currentIndex = Math.max(0, Math.min(index, this.sliderItems.length - itemsPerView));
    this.currentPosition = -this.currentIndex * slideWidth;
    
    this.sliderTrack.style.transition = 'transform 0.3s ease-out';
    this.sliderTrack.style.transform = `translateX(${this.currentPosition}px)`;
  }

  /**
   * Creates navigation dots only if needed
   * @private
   */
  createDots() {
    if (!this.dotsContainer) return;
    
    this.dotsContainer.innerHTML = '';
    const itemsPerView = this.getItemsPerView();
    
    // Only create dots if we have more items than can be shown at once
    if (this.sliderItems.length <= itemsPerView) {
      this.dotsContainer.style.display = 'none';
      return;
    }
    
    this.dotsContainer.style.display = 'flex';
    const dotCount = Math.ceil(this.sliderItems.length / itemsPerView);
    
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-all duration-300';
      dot.setAttribute('aria-label', `Go to slide group ${i + 1}`);
      dot.addEventListener('click', () => this.goToDot(i));
      this.dotsContainer.appendChild(dot);
    }
  }

  /**
   * Updates active dot state
   * @private
   */
  updateDots() {
    if (!this.dotsContainer || this.dotsContainer.style.display === 'none') return;
    
    const dots = this.dotsContainer.children;
    if (dots.length === 0) return;
    
    const itemsPerView = this.getItemsPerView();
    const currentDot = Math.floor(this.currentIndex / itemsPerView);
    
    for (let i = 0; i < dots.length; i++) {
      if (i === currentDot) {
        dots[i].className = 'w-3 h-3 rounded-full bg-blue-600 transition-all duration-300';
      } else {
        dots[i].className = 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-all duration-300';
      }
    }
  }

  /**
   * Navigates to specific dot position
   * @private
   */
  goToDot(dotIndex) {
    const itemsPerView = this.getItemsPerView();
    this.currentIndex = dotIndex * itemsPerView;
    this.goToSlide(this.currentIndex);
    this.updateDots();
    this.updateNavigationState();
  }

  /**
   * Starts auto-play functionality only if we can navigate
   * @private
   */
  startAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
    
    // Only start autoplay if we have something to navigate to
    if (this.canGoNext()) {
      this.autoPlayInterval = setInterval(() => {
        if (this.canGoNext()) {
          this.next();
        } else {
          // If we can't go next, go back to the start
          this.goToSlide(0);
          this.updateDots();
          this.updateNavigationState();
        }
      }, AnimeSlider.CONFIG.AUTO_PLAY_INTERVAL);
    }
  }

  /**
   * Stops auto-play functionality
   * @private
   */
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  /**
   * Destroys the slider and cleans up
   * @public
   */
  destroy() {
    this.stopAutoPlay();
    
    // Remove event listeners
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

/**
 * AnimeInfoFetcher Class - Fetches and displays anime info in slider
 * 
 * @class
 * @classdesc This class fetches anime information and displays it in a modern slider.
 */
class AnimeInfoFetcher extends FetchProgress {
  /**
   * Constructor - Initializes the AnimeInfoFetcher instance
   * @constructor
   */
  constructor() {
    super('/anime', { 
      page: 'animeinfo',
      limit: 1000,
      offset: 0
    });
    this.slider = null;
  }

  /**
   * Creates anime card element for slider with proper 9:16 aspect ratio
   * @param {Object} entry - Anime data entry
   * @returns {Node|null} DOM element for the anime card
   */
  createAnimeCard(entry) {
    try {
      const rating = this.extractCategory(entry.categories, 'rate') || 'N/A';
      const malId = this.extractCategory(entry.categories, 'mal_id');
      const status = this.extractCategory(entry.categories, 'status') || 'Unknown';
      const type = this.extractCategory(entry.categories, 'type') || 'Unknown';
      const title = entry.title || "Untitled";
      const coverImage = this.extractCoverImage(entry.content);
      const malUrl = malId ? `https://myanimelist.net/anime/${malId}` : '#';
      
      const html = `
        <div class="slider-item flex-shrink-0 group">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl h-full flex flex-col">
            <div class="relative overflow-hidden" style="padding-top: 177.78%;"> <!-- 9:16 aspect ratio container -->
              <a href="${this.escapeHTML(entry.path)}" class="absolute inset-0">
                ${coverImage ? `
                  <img 
                    src="${this.escapeHTML(coverImage)}" 
                    alt="${this.escapeHTML(title)}"
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  >
                ` : `
                  <div class="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span class="text-4xl font-bold text-white">${this.escapeHTML(title[0]?.toUpperCase() || 'A')}</span>
                  </div>
                `}
              </a>
              <div class="absolute top-2 right-2">
                <span class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">${this.escapeHTML(type)}</span>
              </div>
              <div class="absolute top-2 left-2">
                <span class="bg-green-600 text-white text-xs px-2 py-1 rounded-full">⭐ ${this.escapeHTML(rating)}</span>
              </div>
            </div>
            
            <div class="p-4 flex-grow flex flex-col">
              <a href="${this.escapeHTML(entry.path)}" class="hover:underline flex-grow">
                <h3 class="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  ${this.escapeHTML(title)}
                </h3>
              </a>
              
              <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-auto">
                <span class="capitalize">${this.escapeHTML(status)}</span>
                ${malId ? `
                  <a href="${malUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 dark:hover:text-blue-400">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
      
      return this.createElementFromHTML(html);
    } catch (error) {
      console.error('Error creating anime card:', error, entry);
      return null;
    }
  }

  /**
   * Renders anime info in slider container
   * @param {Object} data - Response data
   */
  renderContent(data) {
    const sliderContainer = document.querySelector('#slider-container');
    const sliderTrack = document.querySelector('#slider-track');
    
    if (!sliderContainer || !sliderTrack) {
      console.error('Slider container or track not found');
      return;
    }
    
    // Handle empty or invalid data
    if (!data || typeof data !== 'object' || !data.response?.entries || !Array.isArray(data.response.entries)) {
      sliderContainer.innerHTML = `
        <div class="p-8 text-center text-gray-600 dark:text-gray-400">
          <p>Failed to load anime data</p>
        </div>
      `;
      return;
    }
    
    if (!data.response.entries.length) {
      sliderContainer.innerHTML = `
        <div class="p-8 text-center text-gray-600 dark:text-gray-400">
          <p>No anime data available</p>
        </div>
      `;
      return;
    }
    
    // Clear existing content
    sliderTrack.innerHTML = '';
    
    // Create anime cards
    const fragment = document.createDocumentFragment();
    let successfulRenders = 0;
    
    data.response.entries.forEach(entry => {
      const animeCard = this.createAnimeCard(entry);
      if (animeCard) {
        fragment.appendChild(animeCard);
        successfulRenders++;
      }
    });
    
    if (successfulRenders === 0) {
      sliderContainer.innerHTML = `
        <div class="p-8 text-center text-gray-600 dark:text-gray-400">
          <p>Failed to render any anime cards</p>
        </div>
      `;
      return;
    }
    
    sliderTrack.appendChild(fragment);
    
    // Initialize or update slider
    if (!this.slider) {
      this.slider = new AnimeSlider();
    } else {
      this.slider.sliderItems = Array.from(sliderTrack.children);
      this.slider.updateSlider();
      this.slider.createDots();
      this.slider.updateDots();
      this.slider.updateNavigationState();
    }
  }
}

// Initialize the anime info fetcher
const animeFetcher = new AnimeInfoFetcher();
animeFetcher.execute();