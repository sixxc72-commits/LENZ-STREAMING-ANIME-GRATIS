const BASE_URL = 'https://scripapi.web.id/gateway.php/anime';
const contentDiv = document.getElementById('content');
const searchDropdown = document.getElementById('searchDropdown');
const FALLBACK_GIF = 'https://i.ibb.co.com/ZpzNn06K/ezgif-com-animated-gif-maker.gif';

let currentAnimeData = null;
let debounceTimer;

// --- FITUR PROFIL (TAMBAHAN) ---
function getProfile() { return localStorage.getItem('user_avatar') || FALLBACK_GIF; }

function changeProfile() {
    const newUrl = prompt("Masukkan URL GIF/Gambar untuk profil baru:", getProfile());
    if (newUrl) {
        localStorage.setItem('user_avatar', newUrl);
        renderProfile();
    }
}

function renderProfile() {
    const headerProfile = document.getElementById('headerProfile');
    const bannerProfile = document.getElementById('bannerProfile');
    const src = getProfile();
    if (headerProfile) headerProfile.src = src;
    if (bannerProfile) bannerProfile.src = src;
}
// ---------------------------------

async function fetchJikanPoster(title, imgElement) {
    try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
        const data = await res.json();
        if (data.data && data.data[0].images.jpg.large_image_url) {
            imgElement.src = data.data[0].images.jpg.large_image_url;
        } else {
            imgElement.src = FALLBACK_GIF;
        }
    } catch (e) { imgElement.src = FALLBACK_GIF; }
}

async function fetchAPI(endpoint) {
    try {
        contentDiv.innerHTML = '<div class="loader"><div class="spinner"></div><p>Memuat Data...</p></div>';
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error();
        return await response.json();
    } catch (e) {
        contentDiv.innerHTML = '<div class="loader"><p style="color:var(--accent-color);">Gagal memuat data.</p></div>';
        return null;
    }
}

function findArray(obj) {
    if (Array.isArray(obj)) return obj;
    for (let key in obj) if (Array.isArray(obj[key])) return obj[key];
    return [];
}

function createCard(a, isClickable = true) {
    const slug = a.slug || a.endpoint || a.id;
    const title = a.title || a.judul;
    return `
        <div class="${isClickable ? 'anime-card clickable' : 'anime-card static'}" ${isClickable ? `onclick="loadDetail('${slug}')"` : ''}>
            <div class="img-wrapper">
                <img src="" onerror="this.onerror=null; this.src='${FALLBACK_GIF}';" onload="if(!this.src || this.src === window.location.href) fetchJikanPoster('${title}', this)">
            </div>
            <h3>${title}</h3>
        </div>`;
}

async function loadHome() {
    const data = await fetchAPI('/home');
    if (!data) return;
    const list = findArray(data.data || data);
    const limitedList = list.slice(0, 5);
    
    // Header Profil & Content
    contentDiv.innerHTML = `
        <div class="profile-banner">
            <img id="bannerProfile" src="${getProfile()}" onclick="changeProfile()">
            <div>
                <h2 style="margin:0; color:white">Halo, Otaku!</h2>
                <p style="margin:0; font-size:13px;">Klik foto untuk ganti profil.</p>
            </div>
        </div>
        <div class="section-title">Rekomendasi Utama</div>
        <div class="anime-grid">${limitedList.map(item => createCard(item, false)).join('')}</div>
        `;
    renderProfile();
}

// --- FUNGSI PENCARIAN & DETAIL (Sesuai kode asli Anda) ---
async function debouncedSearch() {
    clearTimeout(debounceTimer);
    const q = document.getElementById('searchInput').value.trim();
    if (q.length < 3) { searchDropdown.style.display = 'none'; return; }
    searchDropdown.style.display = 'block';
    debounceTimer = setTimeout(async () => {
        // ... (Logika pencarian Anda)
    }, 400);
}

// Pastikan fungsi loadDetail, loadWatch, saveToHistory, dll tetap ada di sini...

window.onload = () => {
    renderProfile();
    loadHome();
};
