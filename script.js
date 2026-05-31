const BASE_URL = 'https://scripapi.web.id/gateway.php/anime';
const contentDiv = document.getElementById('content');

async function fetchJikanPoster(title, imgElement) {
    try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
        const data = await res.json();
        if (data.data && data.data[0].images.jpg.large_image_url) {
            imgElement.src = data.data[0].images.jpg.large_image_url;
        }
    } catch (e) {
        imgElement.src = 'https://via.placeholder.com/200x300?text=No+Image';
    }
}

async function fetchAPI(endpoint) {
    try {
        contentDiv.innerHTML = '<h2 style="text-align:center;">Memuat...</h2>';
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error();
        return await response.json();
    } catch (e) {
        contentDiv.innerHTML = '<p style="text-align:center;">Error koneksi.</p>';
        return null;
    }
}

function findArray(obj) {
    if (Array.isArray(obj)) return obj;
    for (let key in obj) if (Array.isArray(obj[key])) return obj[key];
    return [];
}

function createCard(a) {
    const slug = a.slug || a.endpoint || a.id;
    const title = a.title || a.judul;
    const imgUrl = a.poster || a.image || '';

    return `
        <div class="anime-card" onclick="loadDetail('${slug}')">
            <img src="${imgUrl}" 
                 onerror="this.onerror=null; fetchJikanPoster('${title}', this)"
                 onload="if(this.src.includes('via.placeholder') || this.src === '') fetchJikanPoster('${title}', this)">
            <h3>${title}</h3>
        </div>`;
}

async function loadHome() {
    const data = await fetchAPI('/home');
    if (!data) return;
    const list = findArray(data.data || data);
    contentDiv.innerHTML = '<div class="anime-grid">' + list.map(createCard).join('') + '</div>';
}

async function handleSearch() {
    const q = document.getElementById('searchInput').value;
    if(!q) return;
    const data = await fetchAPI(`/search?q=${q}`);
    if (!data) return;
    const list = findArray(data.data || data);
    contentDiv.innerHTML = '<div class="anime-grid">' + list.map(createCard).join('') + '</div>';
}

async function loadDetail(slug) {
    const data = await fetchAPI(`/detail?slug=${slug}`);
    if (!data) return;
    const anime = data.data || data.result || data;
    const eps = findArray(anime.episode || anime.episodes || anime);
    let epsHtml = eps.map(e => `<button class="server-btn" onclick="loadWatch('${e.slug || e.endpoint || e.id}')">${e.title || e.episode}</button>`).join('');
    contentDiv.innerHTML = `<button class="back-btn" onclick="loadHome()">« Kembali ke Beranda</button><h2>${anime.title || anime.judul}</h2><div style="display:flex; flex-wrap:wrap;">${epsHtml}</div>`;
}

async function loadWatch(slug) {
    const data = await fetchAPI(`/watch?slug=${slug}`);
    if (!data) return;
    const streamData = data.data || data.result || data;
    const servers = streamData.streaming_servers || [];
    let buttons = servers.map(s => {
        if (s.url && !s.url.includes('Video Not Available')) {
            return `<button class="server-btn" onclick="document.getElementById('p').src='${s.url}'">${s.name}</button>`;
        }
        return '';
    }).join('');

    contentDiv.innerHTML = `<button class="back-btn" onclick="window.history.back()">« Kembali</button><div class="video-container"><iframe id="p" src="${servers[0]?.url || ''}" allowfullscreen></iframe></div><div style="display:flex; flex-wrap:wrap;">${buttons}</div>`;
}

window.onload = loadHome;
