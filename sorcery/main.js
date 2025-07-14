async function fetchWithProgress(url, progressCallback) {
  try {
    // Show progress and skeleton
    document.getElementById('progress-container').classList.remove('hidden');
    document.getElementById('skeleton-container').classList.remove('hidden');
    document.getElementById('content-container').innerHTML = '';
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentLength = response.headers.get('Content-Length');
    const totalBytes = contentLength ? parseInt(contentLength) : null;
    let loadedBytes = 0;
    
    const reader = response.body.getReader();
    const chunks = [];
    let progress = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        progressCallback(100); // Ensure 100% when done
        break;
      }
      
      chunks.push(value);
      loadedBytes += value.length;
      
      // Calculate progress
      if (totalBytes) {
        progress = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
      } else {
        // For small responses, use loadedBytes as progress indicator
        progress = Math.min(99, Math.round(loadedBytes / 1024 * 100));
      }
      
      // Only update progress if it has changed
      if (progress !== progress) {
        progressCallback(progress);
      }
    }
    
    // Combine chunks more efficiently
    const result = new TextDecoder("utf-8").decode(
      chunks.reduce((acc, chunk) => {
        const newArray = new Uint8Array(acc.length + chunk.length);
        newArray.set(acc);
        newArray.set(chunk, acc.length);
        return newArray;
      }, new Uint8Array(0))
    );
    
    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
    
  } catch (error) {
    console.error('Fetch error:', error);
    // Hide loading indicators on error
    document.getElementById('skeleton-container').classList.add('hidden');
    document.getElementById('progress-container').classList.add('hidden');
    throw error;
  }
}

// Fungsi update progress yang lebih baik
function updateProgress(percent) {
  const progressBar = document.getElementById('progress-bar');
  const progressPercent = document.getElementById('progress-percent');
  
  // Only update DOM if values changed
  if (progressBar.style.width !== `${percent}%`) {
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
  }
  
  if (percent === 100) {
    setTimeout(() => {
      document.getElementById('skeleton-container').classList.add('hidden');
      document.getElementById('progress-container').classList.add('hidden');
    }, 300);
  }
}
// Fungsi untuk render content (contoh)
function renderContent(data) {
  const container = document.getElementById('content-container');
  
  // Handle empty or invalid data
  if (!data?.entries?.length) {
    container.innerHTML = '<p class="text-gray-600 dark:text-gray-400">No data available</p>';
    return;
  }
  
  // Create document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  data.entries.forEach(entry => {
    try {
      const animeInfo = entry.animeinfo?.entries?.[0] || {};

      // kualitas : BD, UHD, DVD, WEB-DL, WEBRip, HDRip, HDTV, CAM, TS
      const quality = entry.categories?.find(cat => cat.startsWith('quality:'))?.split(':')[1] || 'N/A';
      const episode = entry.categories?.find(cat => cat.startsWith('episode:'))?.split(':')[1] || 'N/A';
      const season = animeInfo.categories?.find(cat => cat.startsWith('season:'))?.split(':')[1] || 'N/A';
      const resolutionStr = entry.categories?.find(cat => cat.startsWith('resolution:'))?.split(':')[1] || '';
      const availableResolutions = resolutionStr.split('|').filter(Boolean);
      const title = animeInfo.title || entry.title || "Untitled";
      const coverImage = entry.content?.match(/src="([^"]+)"/)?.[1] || "";
      
      const entryElement = document.createElement('div');
      entryElement.className = 'flex gap-4 p-3 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-lg transition-colors';
      entryElement.innerHTML = `
        <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden max-[374px]:hidden">
          <a href="${entry.path}">
            ${coverImage ? 
              `<img src="${coverImage}" alt="${title}" class="w-full h-full object-cover" loading="lazy">` :
              `<div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                <span class="text-lg font-bold">${title[0]?.toUpperCase()}</span>
              </div>`
            }
          </a>
        </div>
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <a href="${entry.path}" class="hover:underline">
              <h4 class="font-medium line-clamp-2">${title}</h4>
              <div class="flex gap-2 mt-1">
                <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">${quality}</span>
                <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">E${episode} | S${season}</span>
              </div>
            </a>
            <div class="flex gap-1 flex-wrap justify-end max-[480px]:hidden" style="max-width: 150px;">
              ${availableResolutions.map(res => 
                `<span class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">${res}p</span>`
              ).join('')}
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${entry.published?.relative || 'Posted recently'}</p>
        </div>
      `;
      
      fragment.appendChild(entryElement);
    } catch (error) {
      console.error('Error rendering entry:', error, entry);
      const errorElement = document.createElement('div');
      errorElement.className = 'p-3 text-red-500 dark:text-red-400';
      errorElement.textContent = `Error rendering entry: ${entry.title || 'Untitled'}`;
      fragment.appendChild(errorElement);
    }
  });
  
  container.appendChild(fragment);
}

const apiUrl = 'https://mangadb.paukuman.workers.dev/anime?page=episode';

// Add abort controller for better cleanup
const controller = new AbortController();
const signal = controller.signal;

fetchWithProgress(apiUrl, updateProgress, { signal })
  .then(data => {
    renderContent(data);
  })
  .catch(error => {
    if (error.name !== 'AbortError') {
      document.getElementById('content-container').innerHTML = `
        <div class="text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
          Error loading data: ${error.message}
        </div>
      `;
    }
  })
  .finally(() => {
    document.getElementById('skeleton-container').classList.add('hidden');
    document.getElementById('progress-container').classList.add('hidden');
  });

// Example of how to abort if needed
// window.addEventListener('beforeunload', () => controller.abort());
