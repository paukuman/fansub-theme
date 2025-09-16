// Variabel global untuk state
let currentTab = 'bookmarks';
let bookmarksData = {};
let animelistData = {};

// Fungsi untuk memuat data dari localStorage
function loadData() {
    // Load bookmarks
    const bookmarksJSON = localStorage.getItem('animeBookmarks');
    bookmarksData = bookmarksJSON ? JSON.parse(bookmarksJSON) : {};

    // Load animelist
    const animelistJSON = localStorage.getItem('animeList');
    animelistData = animelistJSON ? JSON.parse(animelistJSON) : {};
}

// Fungsi untuk menampilkan konten berdasarkan tab aktif
function showTab(tabName) {
    currentTab = tabName;

    // Update UI tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active', 'text-primary-600', 'dark:text-primary-400', 'border-primary-500');
            button.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
        } else {
            button.classList.remove('active', 'text-primary-600', 'dark:text-primary-400', 'border-primary-500');
            button.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
        }
    });

    // Tampilkan konten berdasarkan tab
    if (tabName === 'bookmarks') {
        displayBookmarks();
    } else {
        displayAnimelist();
    }
}

// Fungsi untuk menampilkan bookmark
function displayBookmarks() {
    const container = document.getElementById('bookmarks-container');
    const loadingEl = document.getElementById('bookmarks-loading');
    const emptyEl = document.getElementById('bookmarks-empty');
    const gridEl = document.getElementById('bookmarks-grid');
    const animelistGridEl = document.getElementById('animelist-grid');

    // Sembunyikan grid animelist
    animelistGridEl.classList.add('hidden');

    if (Object.keys(bookmarksData).length === 0) {
        // Tidak ada bookmark
        loadingEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
        gridEl.classList.add('hidden');
        return;
    }

    // Kosongkan grid
    gridEl.innerHTML = '';

    // Urutkan berdasarkan tanggal ditambahkan (terbaru pertama)
    const sortedBookmarks = Object.values(bookmarksData).sort((a, b) => {
        return new Date(b.addedAt) - new Date(a.addedAt);
    });

    // Buat card untuk setiap bookmark
    sortedBookmarks.forEach(bookmark => {
        const card = document.createElement('div');
        card.className = 'bookmark-card group';
        card.innerHTML = `
          <a href="${bookmark.path}" class="block relative">
            <img src="${bookmark.image}" alt="${bookmark.title}" class="bookmark-image w-full mb-2">
            <button class="bookmark-remove" data-id="${bookmark.id}" title="Hapus bookmark">
              <i class="fas fa-times text-xs"></i>
            </button>
          </a>
          <div class="px-1">
            <h4 class="bookmark-title text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight mb-1">${bookmark.title}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">Ditambahkan: ${formatDate(bookmark.addedAt)}</p>
          </div>
        `;
        gridEl.appendChild(card);
    });

    // Sembunyikan loading dan empty state, tampilkan grid
    loadingEl.classList.add('hidden');
    emptyEl.classList.add('hidden');
    gridEl.classList.remove('hidden');

    // Tambahkan event listener untuk tombol hapus
    document.querySelectorAll('.bookmark-remove').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const animeId = this.getAttribute('data-id');
            removeBookmark(animeId);
        });
    });
}

// Fungsi untuk menampilkan animelist
function displayAnimelist() {
    const container = document.getElementById('bookmarks-container');
    const loadingEl = document.getElementById('bookmarks-loading');
    const emptyEl = document.getElementById('animelist-empty');
    const gridEl = document.getElementById('animelist-grid');
    const bookmarksGridEl = document.getElementById('bookmarks-grid');

    // Sembunyikan grid bookmarks
    bookmarksGridEl.classList.add('hidden');

    if (Object.keys(animelistData).length === 0) {
        // Tidak ada animelist
        loadingEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
        gridEl.classList.add('hidden');
        return;
    }

    // Kosongkan grid
    gridEl.innerHTML = '';

    // Urutkan berdasarkan status dan judul
    const sortedAnimelist = Object.values(animelistData).sort((a, b) => {
        // Urutkan berdasarkan status tertentu
        const statusOrder = {
            'watching': 1,
            'plan_to_watch': 2,
            'completed': 3,
            'on_hold': 4,
            'dropped': 5
        };

        const orderA = statusOrder[a.status] || 6;
        const orderB = statusOrder[b.status] || 6;

        if (orderA !== orderB) {
            return orderA - orderB;
        }

        // Jika status sama, urutkan berdasarkan judul
        return a.title.localeCompare(b.title);
    });

    // Buat card untuk setiap item animelist
    sortedAnimelist.forEach(anime => {
        const statusText = {
            'watching': 'Ditonton',
            'completed': 'Selesai',
            'on_hold': 'Ditunda',
            'dropped': 'Drop',
            'plan_to_watch': 'Rencana'
        };

        const card = document.createElement('div');
        card.className = 'animelist-card group';
        card.innerHTML = `
          <a href="${anime.path}" class="block relative">
            <img src="${anime.image}" alt="${anime.title}" class="animelist-image w-full mb-2">
            <span class="animelist-status status-${anime.status}" title="${statusText[anime.status] || anime.status}">
              ${statusText[anime.status] || anime.status}
            </span>
          </a>
          <div class="px-1">
            <h4 class="animelist-title text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight mb-1">${anime.title}</h4>
            ${anime.addedAt ? `<p class="text-xs text-gray-500 dark:text-gray-400">Ditambahkan: ${formatDate(anime.addedAt)}</p>` : ''}
          </div>
        `;
        gridEl.appendChild(card);
    });

    // Sembunyikan loading dan empty state, tampilkan grid
    loadingEl.classList.add('hidden');
    emptyEl.classList.add('hidden');
    gridEl.classList.remove('hidden');
}

// Format tanggal untuk ditampilkan
function formatDate(dateString) {
    if (!dateString) return 'Tidak diketahui';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Hari ini';
    } else if (diffDays === 1) {
        return 'Kemarin';
    } else if (diffDays < 7) {
        return `${diffDays} hari lalu`;
    } else {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
}

// Hapus bookmark
function removeBookmark(animeId) {
    if (bookmarksData[animeId]) {
        delete bookmarksData[animeId];
        localStorage.setItem('animeBookmarks', JSON.stringify(bookmarksData));

        // Tampilkan notifikasi
        showNotification('Bookmark dihapus', 'success');

        // Muat ulang tampilan
        if (currentTab === 'bookmarks') {
            displayBookmarks();
        }
    }
}

// Hapus semua bookmark
function clearAllBookmarks() {
    if (confirm('Apakah Anda yakin ingin menghapus semua bookmark?')) {
        localStorage.removeItem('animeBookmarks');
        bookmarksData = {};
        showNotification('Semua bookmark telah dihapus', 'success');

        // Muat ulang tampilan
        if (currentTab === 'bookmarks') {
            displayBookmarks();
        }
    }
}

// Tampilkan notifikasi
function showNotification(message, type = 'info') {
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
        type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
        }`;

    notification.innerHTML = `
        <div class="flex items-center">
          <i class="fas ${type === 'success' ? 'fa-check-circle' :
            type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle'
        } mr-2"></i>
          <span>${message}</span>
        </div>
      `;

    document.body.appendChild(notification);

    // Animasi masuk
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 10);

    // Animasi keluar setelah 3 detik
    setTimeout(() => {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-full');

        // Hapus elemen setelah animasi selesai
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Muat data saat halaman dimuat
loadData();

// Tampilkan tab default (bookmarks)
showTab('bookmarks');

// Tombol tab
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function () {
        const tabName = this.getAttribute('data-tab');
        showTab(tabName);
    });
});

// Tombol hapus semua
document.getElementById('clear-all-bookmarks').addEventListener('click', clearAllBookmarks);

// Tombol segarkan
document.getElementById('refresh-bookmarks').addEventListener('click', function () {
    loadData();
    showTab(currentTab);
    showNotification('Data diperbarui', 'success');
});