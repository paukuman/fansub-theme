// Add CSS for the slider and dropdowns
const customCSS = `

/* Backdrop image styling */
.backdrop-image {
  min-height: 400px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.5s ease;
}

/* Fallback gradient jika tidak ada gambar */
.backdrop-image.no-image {
  background: linear-gradient(135deg, #4b5563 0%, #1f2937 100%);
}

/* Overlay untuk keterbacaan teks yang lebih baik */
.backdrop-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0.3) 0%, 
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.7) 100%);
  z-index: 1;
}

.backdrop-image > * {
  position: relative;
  z-index: 2;
}

/* Animasi untuk backdrop image */
.backdrop-image {
  animation: fadeInScale 1.2s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(1.1);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .backdrop-image {
    min-height: 300px;
    padding: 2rem 1rem;
  }
  
  .backdrop-image h1 {
    font-size: 2rem;
  }
  
  .backdrop-image p {
    font-size: 1.1rem;
  }
}

/* Hover effects */
.backdrop-image:hover {
  transform: scale(1.02);
}

.backdrop-image:hover::before {
  background: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0.4) 0%, 
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.8) 100%);
}

/* Text styling improvements */
.backdrop-image h1 {
  background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.backdrop-image p {
  font-weight: 300;
  letter-spacing: 0.025em;
}

/* Divider styling */
.backdrop-image .bg-primary-500 {
  background: linear-gradient(90deg, #ec4899, #8b5cf6);
  height: 3px;
  width: 80px;
  border-radius: 2px;
}

/* Backdrop cover styling */
.backdrop-cover {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.backdrop-image {
  height: 400px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Gradient overlay for better text readability */
.backdrop-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0.2) 0%, 
    rgba(0, 0, 0, 0.4) 40%,
    rgba(0, 0, 0, 0.8) 100%);
  z-index: 1;
}

.backdrop-image > * {
  position: relative;
  z-index: 2;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .backdrop-image {
    height: 300px;
  }
  
  .backdrop-image h1 {
    font-size: 2rem;
  }
}

/* Animation for backdrop */
.backdrop-cover {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Container adjustment for overlap */
.container {
  position: relative;
}

.-mt-20 {
  margin-top: -5rem;
}

/* Glass effect for content */
.glass {
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.125);
  border-radius: 12px;
}

.dark .glass {
  background-color: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Shadow for better depth */
.glass {
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
}

.dark .glass {
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}
/* Improved styling for header and breadcrumbs */
.breadcrumbs {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .breadcrumbs {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.breadcrumbs ol {
  flex-wrap: wrap;
}

.breadcrumbs li {
  display: flex;
  align-items: center;
}

.breadcrumbs a {
  transition: all 0.2s ease;
}

.breadcrumbs a:hover {
  transform: translateY(-1px);
}

/* Glass effect improvements */
.glass {
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.125);
}

.dark .glass {
  background-color: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Header title styling */
h1 {
  background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.dark h1 {
  background: linear-gradient(135deg, #818cf8 0%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

/* Episode badge styling */
.bg-primary-100 {
  background: rgba(79, 70, 229, 0.1);
}

.dark .bg-primary-800 {
  background: rgba(79, 70, 229, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .breadcrumbs {
    font-size: 0.75rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  h2 {
    font-size: 1rem;
  }
}

/* Line clamp utility */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth transitions */
.glass, .breadcrumbs a, h1, h2 {
  transition: all 0.3s ease;
}
  /* Hover effects for breadcrumbs */
.breadcrumbs a {
  position: relative;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.breadcrumbs a:hover {
  background: rgba(79, 70, 229, 0.1);
  transform: translateY(-2px);
}

.dark .breadcrumbs a:hover {
  background: rgba(79, 70, 229, 0.2);
}

.breadcrumbs a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #4f46e5, #ec4899);
  transition: width 0.3s ease;
}

.breadcrumbs a:hover::after {f
  width: 100%;
}
/* Styling for categories section */
#categoriesSection {
  margin-top: 1rem;
}

#categoriesSection .inline-block {
  transition: all 0.2s ease;
  margin-bottom: 0.25rem;
}

#categoriesSection .inline-block:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark #categoriesSection .inline-block:hover {
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
}

#categoriesSection h4 {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Styling for categories section */
#categoriesSection .inline-block {
  transition: all 0.2s ease;
}

#categoriesSection .inline-block:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark #categoriesSection .inline-block:hover {
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
}
  
/* Improved list styling for related anime */
/* Ensure related section is always visible */
#relatedSection {
  display: block !important;
}

/* Override any hidden class that might be applied to related section */
#relatedSection.hidden {
  display: block !important;
}

#relatedSection .flex-shrink-0 {
  flex-shrink: 0;
}

#relatedSection .flex-1 {
  flex: 1 1 0%;
}

#relatedSection .min-w-0 {
  min-width: 0;
}

#relatedSection .truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Hover effects for list items */
#relatedSection a {
  transition: all 0.2s ease;
}

/* Better spacing for the two-column layout */
@media (min-width: 1024px) {
  #relatedSection {
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }
  
  #relatedSection::-webkit-scrollbar {
    width: 4px;
  }
  
  #relatedSection::-webkit-scrollbar-track {
    background: transparent;
  }
  
  #relatedSection::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
  
  .dark #relatedSection::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }
}

/* Mobile responsiveness */
@media (max-width: 1023px) {
  #relatedSection {
    margin-top: 1rem;
  }
}

/* Style untuk episode number dengan format berbeda */
  .episode-number {
    font-feature-settings: "tnum";
    font-variant-numeric: tabular-nums;
  }
    /* End style episode number */

  .anime-cover-slider {
    position: relative;
  }
  
  .anime-cover-slider .slide {
    display: none;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  
  .anime-cover-slider .slide.active {
    display: block;
    opacity: 1;
  }
  
  .slider-nav {
    display: none;
  }
  
  .anime-cover-slider:hover .slider-nav {
    display: block;
  }
  
  .slider-dots {
    display: flex;
  }
  
  .dropdown-content {
    max-height: 300px;
    overflow-y: auto;
    z-index: 50;
    background: rgba(255, 255, 255, 0.95);
  }
  
  .dark .dropdown-content {
    background: rgba(30, 41, 59, 0.95);
  }
  
  .server-option, .quality-option {
    cursor: pointer;
  }
  
  .server-option:hover, .quality-option:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  .rotate-180 {
    transform: rotate(180deg);
    transition: transform 0.2s ease;
  }
  
  /* Fix for dropdown positioning */
  .relative {
    position: relative;
  }
  
  .dropdown-content {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.25rem;
  }
  
  /* Glass effect for dropdown */
  .glass {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
  
  .dark .glass {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  /* Line clamp utility */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Layout improvements for desktop/tablet */
@media (min-width: 1024px) {
  #episode-container {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.5rem;
    align-items: start;
  }
  
  #relatedSection {
    position: sticky;
    top: 1rem;
  }
}

/* Ensure proper spacing on mobile */
@media (max-width: 1023px) {
  #episode-container {
    display: flex;
    flex-direction: column;
  }
}

/* Additional styling for the new layout */
.main-content {
  width: 100%;
}

.sidebar {
  width: 100%;
}

/* Ensure proper spacing between sections */
.glass {
  margin-bottom: 1rem;
}

/* Responsive adjustments */
@media (max-width: 1023px) {
  .main-content, .sidebar {
    width: 100%;
  }
}

/* Improve image sizing in related section */
#relatedSection img {
  width: 100%;
  height: auto;
}

/* Better spacing for the two-column layout */
@media (min-width: 1024px) {
  .main-content {
    padding-right: 0.5rem;
  }
  
  .sidebar {
    padding-left: 0.5rem;
  }
}
`;

// Utility function to parse episode numbers from various formats
class EpisodeNumberParser {
  static parseEpisodeNumber(episodeStr) {
    if (!episodeStr) return 0;

    // Handle comma as decimal separator (e.g., "99,5" -> "99.5")
    const normalized = episodeStr.toString().replace(',', '.');

    // Handle special cases like "OVA", "Special", etc.
    if (isNaN(parseFloat(normalized))) {
      // Assign high numbers for special episodes to sort them at the end
      if (normalized.toLowerCase().includes('ova')) return 9998;
      if (normalized.toLowerCase().includes('special')) return 9999;
      if (normalized.toLowerCase().includes('movie')) return 9997;
      return 9990; // Default for other non-numeric values
    }

    return parseFloat(normalized);
  }

  // Function to extract episode number from categories array
  static extractEpisodeNumberFromCategories(categories) {
    const episodeCat = categories.find(cat => cat.startsWith('episode:'));
    return episodeCat ? episodeCat.split(':')[1] : null;
  }
}

// Utility Classes
class AnimeError extends Error {
  constructor(message, type = 'error') {
    super(message);
    this.type = type;
  }
}

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = 30 * 60 * 1000; // 30 minutes
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key, value, ttl = this.ttl) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Service Layer
class AnimeAPIService {
  constructor() {
    this.baseUrl = 'https://mangadb.paukuman.workers.dev/anime';
    this.jikanUrl = 'https://api.jikan.moe/v4/anime';
    this.cache = new CacheManager();
  }

  async fetchWithCache(url, cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new AnimeError(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw new AnimeError('Failed to fetch data. Please try again later.');
    }
  }

  async getEpisodeData(blogID, postID) {
    const url = `${this.baseUrl}?blogID=${blogID}&postID=${postID}`;
    return this.fetchWithCache(url, `episode-${blogID}-${postID}`);
  }

  async getEpisodesList(blogID, malId) {
    const url = `${this.baseUrl}?blogID=${blogID}&mal_id=${malId}&page=episode`;
    return this.fetchWithCache(url, `episodes-${blogID}-${malId}`);
  }

  async getAnimeInfo(blogID, malId) {
    const url = `${this.baseUrl}?blogID=${blogID}&mal_id=${malId}&page=animeinfo`;
    return this.fetchWithCache(url, `animeinfo-${blogID}-${malId}`);
  }

  async getJikanAnimeDetails(malId) {
    const url = `${this.jikanUrl}/${malId}/full`;
    return this.fetchWithCache(url, `jikan-${malId}`);
  }

  async getAnimePictures(malId) {
    const url = `${this.jikanUrl}/${malId}/pictures`;
    return this.fetchWithCache(url, `pictures-${malId}`);
  }

  // New method to get related anime from Jikan API
  async getRelatedAnime(malId) {
    const url = `${this.jikanUrl}/${malId}/recommendations`;
    return this.fetchWithCache(url, `related-${malId}`);
  }

  // Dalam class AnimeAPIService
  async getRecommendedAnime(blogID, genre) {
    const url = `${this.baseUrl}?blogID=${blogID}&genre=${genre}&page=animeinfo&limit=5`;
    return this.fetchWithCache(url, `recommended-${blogID}-${genre}`);
  }
}
class FeedCategoriesParser {
  static parseFeedCategories(feedCategories) {
    if (!feedCategories || !Array.isArray(feedCategories)) {
      return {
        genres: [],
        types: [],
        qualities: [],
        resolutions: [],
        statuses: [],
        seasons: [],
        rates: [],
        malIds: [],
        episodes: []
      };
    }

    const result = {
      genres: [],
      types: [],
      qualities: [],
      resolutions: [],
      statuses: [],
      seasons: [],
      rates: [],
      malIds: [],
      episodes: []
    };

    feedCategories.forEach(category => {
      if (typeof category !== 'string') return;

      if (!category.includes(':')) {
        // Ini adalah genre
        if (category && category.trim() !== '') {
          result.genres.push(category);
        }
      } else {
        const [key, value] = category.split(':');
        if (!value || value.trim() === '') return;

        switch (key) {
          case 'type':
            result.types.push(value);
            break;
          case 'quality':
            result.qualities.push(value);
            break;
          case 'resolution':
            // Handle multiple resolutions separated by |
            const resolutions = value.split('|').filter(r => r.trim() !== '');
            result.resolutions.push(...resolutions);
            break;
          case 'status':
            result.statuses.push(value);
            break;
          case 'season':
            result.seasons.push(value);
            break;
          case 'rate':
            result.rates.push(value);
            break;
          case 'mal_id':
            result.malIds.push(value);
            break;
          case 'episode':
            result.episodes.push(value);
            break;
          case 'page':
            // Skip page categories
            break;
          default:
            // Untuk kategori lain yang tidak dikenali, treat as genre
            if (value && value.trim() !== '') {
              result.genres.push(value);
            }
        }
      }
    });

    // Hapus duplikat dan urutkan
    Object.keys(result).forEach(key => {
      if (Array.isArray(result[key])) {
        result[key] = [...new Set(result[key])];

        // Untuk numbers, urutkan secara numerik
        if (key === 'rates' || key === 'episodes') {
          result[key] = result[key]
            .map(item => parseFloat(item))
            .filter(item => !isNaN(item))
            .sort((a, b) => a - b)
            .map(item => item.toString());
        } else {
          result[key] = result[key].sort();
        }
      }
    });

    return result;
  }
}
class Breadcrumbs {
  constructor(animeSeries, currentEpisode, animeInfoData) {
    this.animeSeries = animeSeries;
    this.currentEpisode = currentEpisode;
    this.animeInfoData = animeInfoData;
  }

  getAnimeInfoPath() {
    // Cari path anime info dari response data
    if (this.animeInfoData?.response?.entries?.[0]?.path) {
      return this.animeInfoData.response.entries[0].path;
    }
    return null;
  }

  render() {
    const animeInfoPath = this.getAnimeInfoPath();
    const baseUrl = window.location.origin;

    return `
      <nav class="breadcrumbs mb-3" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
          <li>
            <a href="${baseUrl}" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <i class="fas fa-home mr-1"></i> Home
            </a>
          </li>
          <li class="flex items-center">
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            ${animeInfoPath ? `
              <a href="${baseUrl}${animeInfoPath}" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1">
                ${this.animeSeries.title}
              </a>
            ` : `
              <span class="line-clamp-1">${this.animeSeries.title}</span>
            `}
          </li>
          <li class="flex items-center">
            <i class="fas fa-chevron-right mx-2 text-xs"></i>
            <span class="text-primary-600 dark:text-primary-400 font-medium">
              Episode ${this.currentEpisode.episodeNumber}
            </span>
          </li>
        </ol>
      </nav>
    `;
  }
}
class CategoriesSection {
  constructor(feedCategories) {
    this.categories = FeedCategoriesParser.parseFeedCategories(feedCategories);
  }

  render() {
    return `
      <div id="categoriesSection" class="glass rounded-xl p-4 mb-4">
        <h3 class="flex items-center font-bold mb-3 text-sm">
          <i class="fas fa-tags mr-2 text-primary-600 dark:text-primary-400"></i> 
          Kategori & Filter
        </h3>
        
        ${this.categories.genres.length > 0 ? `
          <div class="mb-4">
            <h4 class="font-semibold mb-2 text-xs text-gray-600 dark:text-gray-400">GENRES</h4>
            <div class="flex flex-wrap gap-1">
              ${this.categories.genres.map(genre => `
                <span class="inline-block px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200">
                  ${genre}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${this.categories.types.length > 0 ? `
          <div class="mb-4">
            <h4 class="font-semibold mb-2 text-xs text-gray-600 dark:text-gray-400">TYPES</h4>
            <div class="flex flex-wrap gap-1">
              ${this.categories.types.map(type => `
                <span class="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                  ${type}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${this.categories.qualities.length > 0 ? `
          <div class="mb-4">
            <h4 class="font-semibold mb-2 text-xs text-gray-600 dark:text-gray-400">QUALITIES</h4>
            <div class="flex flex-wrap gap-1">
              ${this.categories.qualities.map(quality => `
                <span class="inline-block px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                  ${quality}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${this.categories.resolutions.flat().length > 0 ? `
          <div class="mb-4">
            <h4 class="font-semibold mb-2 text-xs text-gray-600 dark:text-gray-400">RESOLUTIONS</h4>
            <div class="flex flex-wrap gap-1">
              ${[...new Set(this.categories.resolutions.flat())].map(resolution => `
                <span class="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                  ${resolution}p
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${this.categories.statuses.length > 0 ? `
          <div>
            <h4 class="font-semibold mb-2 text-xs text-gray-600 dark:text-gray-400">STATUSES</h4>
            <div class="flex flex-wrap gap-1">
              ${this.categories.statuses.map(status => `
                <span class="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                  ${status}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

class BackdropCover {
  constructor(imageUrl, title) {
    this.imageUrl = imageUrl;
    this.title = title;
  }

  render() {
    if (this.imageUrl) {
      return `
      <div class="backdrop-cover">
        <div class="backdrop-image bg-cover bg-center bg-no-repeat relative">
          <!-- Preload small blurry version -->
          <div class="absolute inset-0 bg-cover bg-center blur-md scale-110 opacity-50" style="background-image: url('${this.imageUrl}')"></div>
          
          <!-- Main image -->
          <div class="absolute inset-0 bg-cover bg-center" style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url('${this.imageUrl}')"></div>
          
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-white p-4 backdrop-blur-sm bg-black/30 rounded-xl">
              <h1 class="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">${this.title}</h1>
              <div class="w-20 h-1 bg-primary-500 mx-auto mb-4 rounded-full"></div>
              <p class="text-lg md:text-xl opacity-90 drop-shadow-md">Episode Streaming</p>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    // Fallback jika tidak ada gambar
    return `
      <div class="backdrop-cover">
        <div class="backdrop-image bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white">
          <div class="text-center">
            <i class="fas fa-play-circle text-6xl mb-4"></i>
            <h1 class="text-3xl md:text-4xl font-bold mb-2">${this.title}</h1>
            <p class="text-lg md:text-xl opacity-90">Episode Streaming</p>
          </div>
        </div>
      </div>
    `;
  }
}

// Data Models
class AnimeEpisode {
  constructor(data) {
    this.title = data.title;
    this.episodeNumber = EpisodeNumberParser.extractEpisodeNumberFromCategories(data.categories);
    this.episodeNumberParsed = EpisodeNumberParser.parseEpisodeNumber(this.episodeNumber);
    this.malId = this.extractMalId(data.categories);
    this.content = data.content;
    this.path = data.path;
    this.published = data.published;
    this.updated = data.updated;
    this.streamList = this.parseStreamList(data.content);
    this.downloadList = this.parseDownloadList(data.content);
  }
  // Dalam class AnimePlayerApp
  extractImageFromContent(content) {
    if (!content) return null;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const img = doc.querySelector('img');
      return img ? img.src : null;
    } catch (error) {
      console.error('Error extracting image from content:', error);
      return null;
    }
  }
  extractEpisodeNumber(categories) {
    const episodeCat = categories.find(cat => cat.startsWith('episode:'));
    return episodeCat ? episodeCat.split(':')[1] : null;
  }

  extractMalId(categories) {
    const malIdCat = categories.find(cat => cat.startsWith('mal_id:'));
    return malIdCat ? malIdCat.split(':')[1] : null;
  }

  parseStreamList(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const streamList = doc.querySelector('streamList');
    if (!streamList) return [];

    return Array.from(streamList.querySelectorAll('server')).map(server => {
      const name = server.querySelector('name')?.textContent || 'Unknown Server';
      const type = server.querySelector('type')?.textContent || 'embed/iframe';

      if (type === 'embed/iframe') {
        return {
          name,
          type,
          url: server.querySelector('url')?.textContent
        };
      } else {
        const qualities = Array.from(server.querySelectorAll('data qual')).map(qual => ({
          text: qual.querySelector('text')?.textContent || 'Unknown',
          url: qual.querySelector('url')?.textContent
        }));
        return {
          name,
          type,
          qualities
        };
      }
    });
  }

  parseDownloadList(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const downloadList = doc.querySelector('downloadList');
    if (!downloadList) return [];

    return Array.from(downloadList.querySelectorAll('download')).map(download => {
      const text = download.querySelector('text')?.textContent || 'Unknown Quality';
      const size = download.querySelector('size')?.textContent || 'N/A';
      const urls = Array.from(download.querySelectorAll('urls data')).map(data => ({
        name: data.querySelector('text')?.textContent || 'Unknown',
        url: data.querySelector('url')?.textContent
      }));

      return {
        quality: text,
        size,
        urls
      };
    });
  }
}

class AnimeSeries {
  constructor(data, jikanData, picturesData) {
    this.title = data.title;
    this.malId = this.extractMalId(data.categories);
    this.categories = data.categories;
    this.jikanData = jikanData;
    this.picturesData = picturesData;
    this.rating = this.extractRating(data.categories);
    this.type = this.extractType(data.categories);
    this.status = this.extractStatus(data.categories);
    this.season = this.extractSeason(data.categories);
  }

  extractMalId(categories) {
    const malIdCat = categories.find(cat => cat.startsWith('mal_id:'));
    return malIdCat ? malIdCat.split(':')[1] : null;
  }

  extractRating(categories) {
    const ratingCat = categories.find(cat => cat.startsWith('rate:'));
    return ratingCat ? ratingCat.split(':')[1] : null;
  }

  extractType(categories) {
    const typeCat = categories.find(cat => cat.startsWith('type:'));
    return typeCat ? typeCat.split(':')[1] : null;
  }

  extractStatus(categories) {
    const statusCat = categories.find(cat => cat.startsWith('status:'));
    return statusCat ? statusCat.split(':')[1] : null;
  }

  extractSeason(categories) {
    const seasonCat = categories.find(cat => cat.startsWith('season:'));
    return seasonCat ? seasonCat.split(':')[1] : null;
  }

  get genres() {
    // Filter out technical categories
    return this.categories.filter(cat =>
      !cat.startsWith('mal_id:') &&
      !cat.startsWith('page:') &&
      !cat.startsWith('rate:') &&
      !cat.startsWith('season:') &&
      !cat.startsWith('status:') &&
      !cat.startsWith('type:') &&
      !cat.startsWith('episode:') &&
      !cat.startsWith('quality:') &&
      !cat.startsWith('resolution:')
    );
  }

  get fullInfo() {
    return this.jikanData?.data || null;
  }

  get pictures() {
    if (!this.picturesData?.data) return [];
    return this.picturesData.data.map(item => {
      // Prioritize webp, fallback to jpg
      return item.webp?.image_url || item.jpg.image_url;
    });
  }
}

// UI Components
class LoadingSpinner {
  render() {
    return `
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    `;
  }
}

class ErrorMessage {
  constructor(error) {
    this.error = error;
  }

  render() {
    const bgColor = this.error.type === 'error' ? 'bg-red-500' : 'bg-yellow-500';
    return `
      <div class="${bgColor} text-white p-4 rounded-lg mb-6">
        <div class="flex items-center">
          <i class="fas fa-exclamation-circle mr-2"></i>
          <span>${this.error.message}</span>
        </div>
      </div>
    `;
  }
}

class AnimeHeader {
  constructor(animeSeries, currentEpisode, animeInfoData) {
    this.animeSeries = animeSeries;
    this.currentEpisode = currentEpisode;
    this.animeInfoData = animeInfoData;
  }

  render() {
    return `
      <div class="glass rounded-xl p-4 mb-4">
        ${new Breadcrumbs(this.animeSeries, this.currentEpisode, this.animeInfoData).render()}
        
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div class="flex-1 min-w-0">
            <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
              ${this.animeSeries.title}
            </h1>
            <h2 class="text-md md:text-lg text-primary-600 dark:text-primary-400 mt-1 font-semibold">
              Episode ${this.currentEpisode.episodeNumber}: ${this.currentEpisode.title || 'Episode ' + this.currentEpisode.episodeNumber}
            </h2>
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="px-3 py-1 bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 text-xs rounded-full font-medium">
              EP ${this.currentEpisode.episodeNumber}
            </span>
            ${this.currentEpisode.published?.relative ? `
              <span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                ${this.currentEpisode.published.relative}
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
}

class ServerSection {
  constructor(streamList, currentServer) {
    this.streamList = streamList;
    this.currentServer = currentServer;
  }

  render() {
    return `
    <div id="serverSection" class="glass rounded-xl p-4 mb-4 hidden">
      <h3 class="flex items-center font-bold mb-3 text-sm">
        <i class="fas fa-server mr-2 text-primary-600 dark:text-primary-400"></i> 
        Pilih Server
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        ${this.streamList.map(server => `
          <button 
            data-server='${JSON.stringify(server).replace(/'/g, "\\'")}'
            class="server-btn hover:bg-primary-200 dark:hover:bg-primary-700 p-3 rounded transition-colors text-center ${server.name === this.currentServer.name ? 'bg-primary-200 dark:bg-primary-700' : ''}"
          >
            <div class="flex flex-col items-center">
              <i class="fas ${server.type === 'embed/iframe' ? 'fa-film' : 'fa-play-circle'} text-lg mb-1"></i>
              <div class="font-medium text-xs">${server.name}</div>
              <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">${server.type === 'embed/iframe' ? 'Embed' : 'Direct'}</div>
            </div>
          </button>
        `).join('')}
      </div>
      
      <!-- Hapus section kualitas untuk server direct -->
    </div>
  `;
  }

  update(newServer) {
    this.currentServer = newServer;
    const serverSection = document.getElementById('serverSection');
    if (serverSection) {
      // Hanya update bagian yang perlu diupdate
      const serverButtons = serverSection.querySelectorAll('.server-btn');
      serverButtons.forEach(btn => {
        const server = JSON.parse(btn.dataset.server);
        if (server.name === newServer.name) {
          btn.classList.add('bg-primary-200', 'dark:bg-primary-700');
        } else {
          btn.classList.remove('bg-primary-200', 'dark:bg-primary-700');
        }
      });

      // Hapus bagian update quality section
    }
  }

  // Di dalam class ServerSection, perbaiki method bindEvents()
  bindEvents(videoPlayerInstance) {
    // Server selection
    document.querySelectorAll('.server-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const server = JSON.parse(e.target.closest('.server-btn').dataset.server);
        videoPlayerInstance.currentServer = server;

        // Update player section
        const playerSection = document.getElementById('videoPlayerSection');
        if (playerSection) {
          playerSection.innerHTML = videoPlayerInstance.render();
          videoPlayerInstance.initPlayer();
          videoPlayerInstance.bindEvents();
          videoPlayerInstance.setupToggleButtons();
        }

        // Update server section (gunakan method update, bukan render ulang)
        if (window.serverSectionInstance) {
          window.serverSectionInstance.update(server);
        }

        // Pastikan relatedSection tetap terlihat
        const relatedSection = document.getElementById('relatedSection');
        if (relatedSection) {
          relatedSection.classList.remove('hidden');
        }
      });
    });
  }
}

class VideoPlayer {
  constructor(streamList) {
    this.streamList = streamList;
    this.currentServer = streamList[0];
  }
  render() {
    return `
    <div class="glass rounded-xl overflow-hidden mb-4">
      <div class="bg-black aspect-video flex items-center justify-center" id="videoContainer">
        ${this.currentServer.type === 'embed/iframe' ? `
          <iframe src="${this.currentServer.url}" allowfullscreen class="w-full h-full"></iframe>
        ` : `
          <video id="player" controls class="w-full h-full"></video>
        `}
      </div>
      
      <div class="p-3 flex justify-between items-center bg-gray-100 dark:bg-gray-800">
        <div class="flex space-x-2">
          <button id="serverToggle" class="flex items-center glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
            <i class="fas fa-server mr-1"></i>
            <span class="max-w-xs truncate">${this.currentServer.name}</span>
          </button>
          
          <!-- Hapus tombol quality toggle -->
        </div>
        
        <div class="flex space-x-2">
          <button id="downloadToggle" class="glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
            <i class="fas fa-download"></i>
          </button>
          <button id="episodesToggle" class="glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
            <i class="fas fa-list"></i>
          </button>
          <button id="infoToggle" class="glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
            <i class="fas fa-info-circle"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  }

  initPlayer() {
    if (this.currentServer.type !== 'embed/iframe') {
      const video = document.getElementById('player');
      if (video) {
        // Untuk direct server, tambahkan semua quality sebagai source
        video.innerHTML = this.currentServer.qualities.map(quality => `
        <source src="${quality.url}" type="video/mp4" size="${quality.text}">
      `).join('');

        // Initialize Plyr if available
        if (window.Plyr) {
          const player = new Plyr('#player', {
            controls: [
              'play-large',
              'play',
              'progress',
              'current-time',
              'duration',
              'mute',
              'volume',
              'settings',
              'pip',
              'fullscreen'
            ],
            quality: {
              default: this.currentServer.qualities[0].text,
              options: this.currentServer.qualities.map(q => q.text),
              forced: true
            }
          });

          // Otomatis pilih quality terbaik yang tersedia
          player.on('ready', () => {
            if (player.options.quality.options.length > 0) {
              player.quality = player.options.quality.options[0];
            }
          });
        }
      }
    }
  }
  bindEvents() {
    // Server dropdown
    const serverDropdownBtn = document.getElementById('serverDropdownBtn');
    const serverDropdown = document.getElementById('serverDropdown');

    if (serverDropdownBtn && serverDropdown) {
      serverDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        serverDropdown.classList.toggle('show');

        // Sembunyikan dropdown kualitas jika terbuka
        const qualityDropdown = document.getElementById('qualityDropdown');
        if (qualityDropdown) qualityDropdown.classList.remove('show');

        // Rotate chevron icon
        const chevron = serverDropdownBtn.querySelector('.fa-chevron-down');
        if (chevron) chevron.classList.toggle('rotate-180');
      });

      // Server selection
      document.querySelectorAll('.server-option').forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const server = JSON.parse(e.target.closest('.server-option').dataset.server);
          this.currentServer = server;

          // Re-render player section
          const playerSection = document.getElementById('videoPlayerSection');
          if (playerSection) {
            playerSection.innerHTML = this.render();
            this.initPlayer();
            this.bindEvents();
            this.setupToggleButtons();
          }
        });
      });
    }

    // Quality dropdown
    const qualityDropdownBtn = document.getElementById('qualityDropdownBtn');
    if (qualityDropdownBtn) {
      const qualityDropdown = document.getElementById('qualityDropdown');

      qualityDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        qualityDropdown.classList.toggle('show');

        // Sembunyikan dropdown server jika terbuka
        if (serverDropdown) serverDropdown.classList.remove('show');

        // Rotate chevron icon
        const chevron = qualityDropdownBtn.querySelector('.fa-chevron-down');
        if (chevron) chevron.classList.toggle('rotate-180');
      });

      // Quality selection
      document.querySelectorAll('.quality-option').forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const quality = JSON.parse(e.target.closest('.quality-option').dataset.quality);
          qualityDropdownBtn.querySelector('span').textContent = quality.text;

          // Update video source
          const video = document.getElementById('player');
          if (video) {
            video.src = quality.url;
            video.load();
          }

          // Tutup dropdown setelah memilih
          qualityDropdown.classList.remove('show');
          const chevron = qualityDropdownBtn.querySelector('.fa-chevron-down');
          if (chevron) chevron.classList.remove('rotate-180');
        });
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.relative')) {
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
          dropdown.classList.remove('show');
        });

        // Reset chevron icons
        document.querySelectorAll('[id$="DropdownBtn"] .fa-chevron-down').forEach(chevron => {
          chevron.classList.remove('rotate-180');
        });
      }
    });
  }

  setupToggleButtons() {
    // Server toggle
    const serverToggle = document.getElementById('serverToggle');
    const serverSection = document.getElementById('serverSection');

    if (serverToggle && serverSection) {
      serverToggle.addEventListener('click', () => {
        serverSection.classList.toggle('hidden');
        // Hide other main sections when showing this one
        document.getElementById('downloadSection').classList.add('hidden');
        document.getElementById('episodesSection').classList.add('hidden');
        document.getElementById('infoSection').classList.add('hidden');
        // JANGAN sembunyikan relatedSection di sini
      });
    }

    // Download toggle
    const downloadToggle = document.getElementById('downloadToggle');
    const downloadSection = document.getElementById('downloadSection');

    if (downloadToggle && downloadSection) {
      downloadToggle.addEventListener('click', () => {
        downloadSection.classList.toggle('hidden');
        // Hide other main sections when showing this one
        document.getElementById('serverSection').classList.add('hidden');
        document.getElementById('episodesSection').classList.add('hidden');
        document.getElementById('infoSection').classList.add('hidden');
        // JANGAN sembunyikan relatedSection di sini
      });
    }

    // Episodes toggle
    const episodesToggle = document.getElementById('episodesToggle');
    const episodesSection = document.getElementById('episodesSection');

    if (episodesToggle && episodesSection) {
      episodesToggle.addEventListener('click', () => {
        episodesSection.classList.toggle('hidden');
        // Hide other main sections when showing this one
        document.getElementById('serverSection').classList.add('hidden');
        document.getElementById('downloadSection').classList.add('hidden');
        document.getElementById('infoSection').classList.add('hidden');
        // JANGAN sembunyikan relatedSection di sini
      });
    }

    // Info toggle
    const infoToggle = document.getElementById('infoToggle');
    const infoSection = document.getElementById('infoSection');

    if (infoToggle && infoSection) {
      infoToggle.addEventListener('click', () => {
        infoSection.classList.toggle('hidden');
        // Hide other main sections when showing this one
        document.getElementById('serverSection').classList.add('hidden');
        document.getElementById('downloadSection').classList.add('hidden');
        document.getElementById('episodesSection').classList.add('hidden');
        // JANGAN sembunyikan relatedSection di sini
      });
    }
  }
}

class DownloadSection {
  constructor(downloadList) {
    this.downloadList = downloadList;
  }

  render() {
    return `
      <div id="downloadSection" class="glass rounded-xl p-4 mb-4 hidden">
        <h3 class="flex items-center font-bold mb-3 text-sm">
          <i class="fas fa-download mr-2 text-primary-600 dark:text-primary-400"></i> 
          Download Episode
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          ${this.downloadList.map(download => `
            <button 
              data-download='${JSON.stringify(download).replace(/'/g, "\\'")}'
              class="download-btn hover:bg-primary-200 dark:hover:bg-primary-700 p-2 rounded transition-colors text-center text-xs"
            >
              <div class="font-medium">${download.quality}</div>
              <div class="text-gray-600 dark:text-gray-400">${download.size}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.querySelectorAll('.download-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const download = JSON.parse(e.target.closest('.download-btn').dataset.download);
        this.showDownloadModal(download);
      });
    });
  }

  showDownloadModal(download) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full mx-2">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-sm">Download ${download.quality} (${download.size})</h3>
          <button class="close-modal text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="space-y-2">
          ${download.urls.map(url => `
            <a href="${url.url}" target="_blank" class="block p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
              <div class="flex items-center">
                <i class="fab ${this.getProviderIcon(url.name)} mr-2"></i>
                <span>${url.name}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `;

    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    document.body.appendChild(modal);
  }

  getProviderIcon(providerName) {
    const lowerName = providerName.toLowerCase();
    if (lowerName.includes('google')) return 'fa-google-drive';
    if (lowerName.includes('mega')) return 'fa-mega';
    if (lowerName.includes('terabox')) return 'fa-box';
    return 'fa-cloud-download-alt';
  }
}

class EpisodeNavigation {
  constructor(episodesList, currentEpisode, blogID) {
    // Urutkan episode berdasarkan nomor episode yang sudah diparsing
    this.episodesList = episodesList.sort((a, b) => {
      return a.episodeNumberParsed - b.episodeNumberParsed;
    });
    this.currentEpisode = currentEpisode;
    this.blogID = blogID;
  }

  render() {
    // Temukan index episode saat ini berdasarkan episodeNumberParsed
    const currentIndex = this.episodesList.findIndex(ep =>
      ep.episodeNumberParsed === this.currentEpisode.episodeNumberParsed
    );

    const prevEpisode = currentIndex > 0 ? this.episodesList[currentIndex - 1] : null;
    const nextEpisode = currentIndex < this.episodesList.length - 1 ? this.episodesList[currentIndex + 1] : null;

    return `
      <div id="episodesSection" class="glass rounded-xl p-4 mb-4 hidden">
        <div class="flex justify-between items-center mb-3">
          ${prevEpisode ? `
            <a href="${prevEpisode.path}" class="flex items-center glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
              <i class="fas fa-arrow-left mr-1"></i> Previous
            </a>
          ` : '<div></div>'}
          
          ${nextEpisode ? `
            <a href="${nextEpisode.path}" class="flex items-center glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
              Next <i class="fas fa-arrow-right ml-1"></i>
            </a>
          ` : '<div></div>'}
        </div>
        
        <div class="max-h-80 overflow-y-auto">
          <table class="w-full">
            <tbody>
              ${this.episodesList.map(episode => `
                <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors ${episode.episodeNumberParsed === this.currentEpisode.episodeNumberParsed ? 'bg-primary-100 dark:bg-primary-800' : ''}">
                  <td class="p-2">
                    <a href="${episode.path}" class="flex items-center text-sm">
                      <span class="w-8 text-center font-medium">${episode.episodeNumber}</span>
                      <span class="ml-2 truncate">${episode.title || 'Episode ' + episode.episodeNumber}</span>
                    </a>
                  </td>
                  <td class="p-2 text-right text-xs text-gray-600 dark:text-gray-400">
                    ${episode.published?.relative || 'N/A'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

class AnimeInfoSection {
  constructor(animeSeries, animeInfoData) {
    this.animeSeries = animeSeries;
    this.animeInfoData = animeInfoData;
  }

  render() {
    const jikanData = this.animeSeries.fullInfo;
    const pictures = this.animeSeries.pictures;

    // Get the path from animeInfoData response
    const animeInfoPath = this.animeInfoData?.response?.entries[0]?.path;
    const animeInfoUrl = animeInfoPath ? `${window.location.origin}${animeInfoPath}` : '#';

    return `
      <div id="infoSection" class="glass rounded-xl p-4 mb-4 hidden">
        <h2 class="text-lg font-bold mb-3">About ${this.animeSeries.title}</h2>
        
        ${pictures.length > 0 ? `
          <div class="mb-4">
            <div class="anime-cover-slider relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 aspect-[3/4] max-w-xs mx-auto">
              ${pictures.map((img, index) => `
                <div class="slide ${index === 0 ? 'active' : ''}">
                  <img src="${img}" alt="${this.animeSeries.title} Cover ${index + 1}" class="w-full h-full object-cover">
                </div>
              `).join('')}
              
              ${pictures.length > 1 ? `
                <button class="slider-nav prev absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all text-xs">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button class="slider-nav next absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all text-xs">
                  <i class="fas fa-chevron-right"></i>
                </button>
                
                <div class="slider-dots absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                  ${pictures.map((_, index) => `
                    <button class="dot w-2 h-2 rounded-full bg-white bg-opacity-50 ${index === 0 ? 'bg-opacity-100' : ''}" data-index="${index}"></button>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        ${jikanData?.synopsis ? `
          <div class="mb-4">
            <h3 class="font-semibold mb-2 text-sm">Synopsis</h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              ${jikanData.synopsis.substring(0, 200)}...
            </p>
          </div>
        ` : ''}
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 class="font-semibold mb-2">Information</h3>
            <ul class="space-y-1">
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Type:</span>
                <span>${this.animeSeries.type || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Episodes:</span>
                <span>${jikanData?.episodes || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Status:</span>
                <span>${this.animeSeries.status || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Aired:</span>
                <span>${jikanData?.aired?.string || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Studios:</span>
                <span>${jikanData?.studios?.map(s => s.name).join(', ') || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Source:</span>
                <span>${jikanData?.source || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Genres:</span>
                <div>
                  ${this.animeSeries.genres.slice(0, 3).map(genre => `
                    <span class="inline-block px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-800 mr-1 mb-1">
                      ${genre}
                    </span>
                  `).join('')}
                  ${this.animeSeries.genres.length > 3 ? `
                    <span class="inline-block px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-800 mr-1 mb-1">
                      +${this.animeSeries.genres.length - 3} more
                    </span>
                  ` : ''}
                </div>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold mb-2">Statistics</h3>
            <ul class="space-y-1">
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Rating:</span>
                <span>${jikanData?.rating || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Score:</span>
                <span>${jikanData?.score || 'N/A'} ${jikanData?.scored_by ? `(${jikanData.scored_by.toLocaleString()} users)` : ''}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Ranked:</span>
                <span>${jikanData?.rank ? `#${jikanData.rank}` : 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Popularity:</span>
                <span>${jikanData?.popularity ? `#${jikanData.popularity}` : 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Members:</span>
                <span>${jikanData?.members?.toLocaleString() || 'N/A'}</span>
              </li>
            </ul>
          </div>
        </div>

        ${animeInfoPath ? `
          <div class="mt-4">
            <a href="${animeInfoUrl}" class="flex items-center glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
              <i class="fas fa-external-link-alt mr-1"></i> Lihat Selengkapnya
            </a>
          </div>
        ` : ''}
      </div>
    `;
  }

  bindEvents() {
    // Initialize slider if there are multiple images
    const slider = document.querySelector('.anime-cover-slider');
    if (slider && slider.querySelectorAll('.slide').length > 1) {
      const slides = slider.querySelectorAll('.slide');
      const dots = slider.querySelectorAll('.dot');
      let currentSlide = 0;

      // Function to show a specific slide
      const showSlide = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('bg-opacity-100'));

        slides[index].classList.add('active');
        dots[index].classList.add('bg-opacity-100');
        currentSlide = index;
      };

      // Next button
      slider.querySelector('.next').addEventListener('click', () => {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
      });

      // Previous button
      slider.querySelector('.prev').addEventListener('click', () => {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex);
      });

      // Dot navigation
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          showSlide(index);
        });
      });

      // Auto slide every 5 seconds
      setInterval(() => {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
      }, 5000);
    }
  }
}

// New UI Component for Related and Recommended Anime
class RelatedAnimeSection {
  constructor(relatedAnime, recommendedAnime) {
    this.relatedAnime = relatedAnime;
    this.recommendedAnime = recommendedAnime;
  }

  render() {
    return `
      <div id="relatedSection" class="glass rounded-xl p-4 mb-4">
        <h3 class="flex items-center font-bold mb-3 text-sm">
          <i class="fas fa-film mr-2 text-primary-600 dark:text-primary-400"></i> 
          Anime Terkait & Rekomendasi
        </h3>
        
        ${this.relatedAnime.length > 0 ? `
          <div class="mb-6">
            <h4 class="font-semibold mb-3 text-sm border-b border-gray-200 dark:border-gray-700 pb-2">Related Anime</h4>
            <div class="space-y-3">
              ${this.relatedAnime.slice(0, 5).map(anime => `
                <a href="${anime.url}" target="_blank" class="flex items-center group hover:bg-primary-50 dark:hover:bg-primary-900 p-2 rounded-lg transition-colors">
                  <div class="flex-shrink-0 w-12 h-16 rounded overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3">
                    <img src="${anime.image}" alt="${anime.title}" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">${anime.title}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Related Series</div>
                  </div>
                  <div class="flex-shrink-0 ml-2">
                    <i class="fas fa-external-link-alt text-xs text-gray-400"></i>
                  </div>
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${this.recommendedAnime.length > 0 ? `
          <div>
            <h4 class="font-semibold mb-3 text-sm border-b border-gray-200 dark:border-gray-700 pb-2">Recommended Anime</h4>
            <div class="space-y-3">
              ${this.recommendedAnime.slice(0, 5).map(anime => `
                <a href="${anime.path}" class="flex items-center group hover:bg-primary-50 dark:hover:bg-primary-900 p-2 rounded-lg transition-colors">
                  <div class="flex-shrink-0 w-12 h-16 rounded overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3">
                    <img src="${anime.image}" alt="${anime.title}" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">${anime.title}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended for You</div>
                  </div>
                  <div class="flex-shrink-0 ml-2">
                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                  </div>
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

// Main Application
class AnimePlayerApp {
  constructor() {
    this.apiService = new AnimeAPIService();
    this.blogID = document.querySelector('meta[name="blogID"]')?.content;
    this.postID = document.querySelector('meta[name="postID"]')?.content;
    this.appElement = null;
    this.currentEpisode = null;
    this.animeSeries = null;
    this.episodesList = [];
    this.relatedAnime = [];
    this.recommendedAnime = [];
    this.observer = null;
    this.maxRetries = 5;
    this.retryCount = 0;
    this.retryDelay = 1000; // 1 second
  }

  async init() {
    try {
      if (!this.blogID || !this.postID) {
        throw new AnimeError('Missing blogID or postID in meta tags');
      }

      // Check if container exists
      this.appElement = document.getElementById('episode-container');

      if (!this.appElement) {
        // If not found, set up a MutationObserver to watch for its appearance
        this.setupObserver();
        return;
      }


      const styleElement = document.createElement('style');
      styleElement.textContent = customCSS;
      document.head.appendChild(styleElement);

      this.showLoading();

      // First fetch the episode data to get the mal_id
      const episodeData = await this.apiService.getEpisodeData(this.blogID, this.postID);

      // Process episode data
      this.currentEpisode = new AnimeEpisode(episodeData.response.entry);

      // Get MAL ID from current episode
      const malId = this.currentEpisode.malId;
      if (!malId) {
        throw new AnimeError('Missing MAL ID in episode data');
      }

      // Now fetch the episodes list and other data in parallel using the malId
      const [episodesListData, animeInfoData, jikanData, picturesData, relatedData] = await Promise.all([
        this.apiService.getEpisodesList(this.blogID, malId),
        this.apiService.getAnimeInfo(this.blogID, malId),
        this.apiService.getJikanAnimeDetails(malId),
        this.apiService.getAnimePictures(malId),
        this.apiService.getRelatedAnime(malId)
      ]);

      // Process episodes list - urutkan berdasarkan episodeNumberParsed
      this.episodesList = episodesListData.entries
        .map(entry => new AnimeEpisode(entry))
        .sort((a, b) => a.episodeNumberParsed - b.episodeNumberParsed);

      // Process anime series data
      this.animeSeries = new AnimeSeries(
        animeInfoData.response.entries[0],
        jikanData,
        picturesData
      );

      this.animeInfoData = animeInfoData;

      // Process related anime
      this.relatedAnime = this.processRelatedAnime(relatedData);
      // Get recommended anime based on a random genre
      if (this.animeSeries.genres.length > 0) {
        const randomGenre = this.animeSeries.genres[Math.floor(Math.random() * this.animeSeries.genres.length)];
        try {
          const recommendedData = await this.apiService.getRecommendedAnime(this.blogID, randomGenre);
          this.recommendedAnime = this.processRecommendedAnime(recommendedData);
          // Simpan feedCategories dari response
          this.feedCategories = recommendedData.response?.feedCategories || [];

          // Dalam class AnimePlayerApp - method init() - setelah mendapatkan recommendedData
          console.log('Recommended Data:', recommendedData);
          console.log('Feed Categories:', recommendedData.response?.feedCategories);
        } catch (error) {
          console.error('Error fetching recommended anime:', error);
          this.recommendedAnime = [];
          this.feedCategories = [];
        }
      } else {
        this.recommendedAnime = [];
        this.feedCategories = [];
      }

      // Render the app
      this.render();
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError(error);
    }
  }

  processRelatedAnime(relatedData) {
    if (!relatedData?.data) return [];

    return relatedData.data.slice(0, 5).map(item => ({
      title: item.entry.title,
      url: item.entry.url,
      image: item.entry.images?.jpg?.image_url || '/placeholder-image.jpg'
    }));
  }

  // Dalam class AnimePlayerApp
  processRecommendedAnime(recommendedData) {
    if (!recommendedData?.response?.entries) return [];

    return recommendedData.response.entries.slice(0, 5).map(entry => ({
      title: entry.title,
      path: entry.path,
      image: this.extractImageFromContent(entry.content)
    }));
  }

  extractImageFromContent(content) {
    if (!content) return '/placeholder-image.jpg';

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : '/placeholder-image.jpg';
  }

  setupObserver() {
    if (this.retryCount >= this.maxRetries) {
      console.log('Max retries reached, giving up on finding episode-container');
      return;
    }

    this.retryCount++;

    if (!this.observer) {
      this.observer = new MutationObserver((mutations, obs) => {
        const container = document.getElementById('episode-container');
        if (container) {
          obs.disconnect();
          this.appElement = container;
          this.init();
        } else {
          // If not found after delay, try again
          setTimeout(() => {
            if (this.retryCount < this.maxRetries) {
              this.init();
            } else {
              obs.disconnect();
              console.log('Episode container not found after maximum retries');
            }
          }, this.retryDelay);
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    // Also try immediately in case it was added just before we set up the observer
    setTimeout(() => {
      const container = document.getElementById('episode-container');
      if (container) {
        this.observer?.disconnect();
        this.appElement = container;
        this.init();
      }
    }, 0);
  }

  showLoading() {
    if (this.appElement) {
      this.appElement.innerHTML = new LoadingSpinner().render();
    }
  }

  showError(error) {
    if (this.appElement) {
      const errorToShow = error instanceof AnimeError ? error : new AnimeError(error.message);
      this.appElement.innerHTML = new ErrorMessage(errorToShow).render();
    }
  }

  render() {
    if (!this.appElement || !this.currentEpisode || !this.animeSeries) return;

    const backdropImage = this.extractImageFromContent(this.currentEpisode.content);

    const backdropElement = document.querySelector('.backdrop-image');
    if (backdropElement) {
      // Preload image untuk menghindari FOUC (Flash of Unstyled Content)
      if (backdropImage) {
        const img = new Image();
        img.src = backdropImage;
        img.onload = function () {
          // Gambar sudah loaded, apply styles
          if (backdropElement) {
            backdropElement.style.opacity = '0';
            backdropElement.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url('${backdropImage}')`;

            // Fade in effect
            setTimeout(() => {
              backdropElement.style.transition = 'opacity 0.5s ease';
              backdropElement.style.opacity = '1';
            }, 100);
          }
        };

        img.onerror = function () {
          // Jika gambar gagal load, gunakan fallback
          if (backdropElement) {
            backdropElement.classList.add('no-image');
            backdropElement.innerHTML = `
        <div class="text-center text-white p-6">
          <i class="fas fa-play-circle text-6xl mb-6 opacity-80"></i>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">${this.animeSeries.title}</h1>
          <div class="w-24 h-1 bg-primary-500 mx-auto mb-4 rounded-full"></div>
          <p class="text-xl md:text-2xl opacity-90">Episode ${this.currentEpisode.episodeNumber}</p>
          <p class="text-lg opacity-80 mt-2">${this.currentEpisode.title || ''}</p>
        </div>
      `;
          }
        };
      }
    }

    this.appElement.innerHTML = `
    <div class="main-content">
      ${new AnimeHeader(this.animeSeries, this.currentEpisode, this.animeInfoData).render()}
      <div id="videoPlayerSection">
        ${new VideoPlayer(this.currentEpisode.streamList).render()}
      </div>
      ${new ServerSection(this.currentEpisode.streamList, this.currentEpisode.streamList[0]).render()}
      ${new DownloadSection(this.currentEpisode.downloadList).render()}
      ${new EpisodeNavigation(this.episodesList, this.currentEpisode, this.blogID).render()}
      ${new AnimeInfoSection(this.animeSeries, this.animeInfoData).render()}
    </div>
    
    <div class="sidebar">
      ${new RelatedAnimeSection(this.relatedAnime, this.recommendedAnime).render()}
      ${this.feedCategories && this.feedCategories.length > 0 ? new CategoriesSection(this.feedCategories).render() : ''}
    </div>
  `;

    // Initialize video player
    const videoPlayer = new VideoPlayer(this.currentEpisode.streamList);
    videoPlayer.initPlayer();
    videoPlayer.bindEvents();
    videoPlayer.setupToggleButtons();

    // Bind other events
    window.serverSectionInstance = new ServerSection(this.currentEpisode.streamList, this.currentEpisode.streamList[0]);
    window.serverSectionInstance.bindEvents(videoPlayer);
    new DownloadSection(this.currentEpisode.downloadList).bindEvents();
    new AnimeInfoSection(this.animeSeries).bindEvents();

    // Pastikan related section selalu terlihat
    const relatedSection = document.getElementById('relatedSection');
    if (relatedSection) {
      relatedSection.classList.remove('hidden');
    }
  }
}

// Check if the container exists immediately
const container = document.getElementById('episode-container');

if (container) {
  // If it exists, initialize immediately
  const app = new AnimePlayerApp();
  app.init();
} else {
  // Otherwise, create the app instance which will set up the observer
  new AnimePlayerApp().init();
}

// Load Plyr if not already loaded
if (!window.Plyr) {
  const plyrCSS = document.createElement('link');
  plyrCSS.rel = 'stylesheet';
  plyrCSS.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
  document.head.appendChild(plyrCSS);

  const plyrJS = document.createElement('script');
  plyrJS.src = 'https://cdn.plyr.io/3.7.8/plyr.js';
  plyrJS.onload = () => {
    // Re-init player if needed
    const videoPlayer = document.querySelector('#videoPlayerSection video');
    if (videoPlayer) {
      new Plyr(videoPlayer);
    }
  };
  document.head.appendChild(plyrJS);
}