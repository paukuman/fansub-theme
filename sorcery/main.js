async function fetchWithProgress(url, progressCallback) {
  try {
    // Tampilkan progress bar dan skeleton
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
    
    // Flag untuk menandai apakah loading sudah selesai
    let loadingCompleted = false;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        loadingCompleted = true;
        break;
      }
      
      chunks.push(value);
      loadedBytes += value.length;
      
      // Hitung progress
      let progress = 0;
      if (totalBytes) {
        progress = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
      } else {
        // Untuk response kecil, langsung ke 99% dan nanti complete ke 100%
        progress = Math.min(99, Math.round(loadedBytes / 1024 * 100));
      }
      
      progressCallback(progress);
    }
    
    // Pastikan progress mencapai 100% ketika selesai
    if (loadingCompleted) {
      progressCallback(100);
    }
    
    // Gabungkan chunks
    const chunksAll = new Uint8Array(loadedBytes);
    let position = 0;
    for (let chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }
    
    // Konversi ke string
    const result = new TextDecoder("utf-8").decode(chunksAll);
    
    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
    
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Fungsi update progress yang lebih baik
function updateProgress(percent) {
  const progressBar = document.getElementById('progress-bar');
  const progressPercent = document.getElementById('progress-percent');
  
  progressBar.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;
  
  // Sembunyikan skeleton ketika progress mencapai 100%
  if (percent === 100) {
    setTimeout(() => {
      document.getElementById('skeleton-container').classList.add('hidden');
      document.getElementById('progress-container').classList.add('hidden');
    }, 300); // Beri sedikit delay untuk animasi
  }
}

// Fungsi untuk render content (contoh)
function renderContent(data) {
  const container = document.getElementById('content-container');
  
  // Error handling untuk data kosong
  if (!data || !data.entries || !Array.isArray(data.entries)) {
    container.innerHTML = '<p class="text-gray-600 dark:text-gray-400">No data available</p>';
    return;
  }
  
  // Render setiap entry
  data.entries.forEach(entry => {
    try {
      const animeInfo = entry.animeinfo?.entries?.[0] || {};
      
      // Ambil episode dari entry.categories (bukan feedCategories)
      const episode = entry.categories?.find(cat => cat.startsWith('episode:'))?.split(':')[1] || 'N/A';
      
      // Ambil resolusi yang tersedia
      const resolutionStr = entry.categories?.find(cat => cat.startsWith('resolution:'))?.split(':')[1] || '';
      const availableResolutions = resolutionStr.split('|').filter(r => r);
      
      // Fallback untuk judul
      const title = animeInfo.title || entry.title || "Untitled";
      
      // Extract cover image jika ada
      const coverImage = animeInfo.content?.match(/src="([^"]+)"/)?.[1] || '';
      
      const entryElement = document.createElement('div');
      entryElement.className = 'flex gap-4 p-3 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-lg transition-colors';
      entryElement.innerHTML = `
        <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden block max-[374px]:hidden">
          <a href="${entry.path}">
            ${coverImage ? 
              `<img src="${coverImage}" alt="${title}" class="w-full h-full object-cover">` :
              `<div class="image-cover w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                <span class="text-xs font-bold">COVER</span>
              </div>`
            }
          </a>
        </div>
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <a href="${entry.path}">
              <h4 class="font-medium">${title}</h4>
              <div class="flex gap-2 mt-1">
                <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">HD</span>
                <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">Episode ${episode}</span>
              </div>
            </a>
            <div class="flex gap-1 flex-wrap justify-end block max-[408px]:hidden" style="max-width: 150px;">
              ${availableResolutions.map(res => 
                `<span class="quality-badge quality-${res}p">${res}p</span>`
              ).join('')}
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${entry.published?.relative || 'Posted recently'}</p>
        </div>
      `;
      
      container.appendChild(entryElement);
    } catch (error) {
      console.error('Error rendering entry:', error, entry);
      // Fallback rendering jika terjadi error
      const errorElement = document.createElement('div');
      errorElement.className = 'p-3 text-red-500 dark:text-red-400';
      errorElement.textContent = `Error rendering entry: ${entry.title || 'Untitled'}`;
      container.appendChild(errorElement);
    }
  });
}
 const apiUrl = 'https://mangadb.paukuman.workers.dev/anime?page=episode';
  
  fetchWithProgress(apiUrl, updateProgress)
    .then(data => {
      renderContent(data);
    })
    .catch(error => {
      document.getElementById('content-container').innerHTML = `
        <div class="text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
          Error loading data: ${error.message}
        </div>
      `;
      document.getElementById('skeleton-container').classList.add('hidden');
      document.getElementById('progress-container').classList.add('hidden');
    });
