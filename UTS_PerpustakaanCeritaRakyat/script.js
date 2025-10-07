// array untuk menyimpan daftar cerita dari JSON
let stories = [];

// array yang digunakan saat filter atau pencarian aktif
let filteredStories = [];

// menyimpan ID cerita yang sedang diedit
let currentStoryId = null;

// menyimpan id cerita di localStorage agar tetap ada setelah refresh
// ambil data dulu dari localStorage lalu parsing biar jadi objek
let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];  // fallback -> kalau belum ada isi dengan array null
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || {};          // simpan dalam bentuk objek key(id cerita) value(isi catatan)
let deletedStories = JSON.parse(localStorage.getItem("deletedStories")) || [];

// FUNCTION UNTUK LOAD DATA CERITA YANG ADA DI JSON
async function loadStories() {
  try {
    // ambil data dari file JSON 
    const response = await fetch("data_cerita.json");
    const data = await response.json();

    // simpan hasil ke array stories
    stories = data;
    filteredStories = [...stories];

    // tampilkan cerita di halaman (panggil function renderStories)
    renderStories(stories);

    // isi dropdown filter berdasarkan daerah yang ada (panggil function populateFilterOptions)
    populateFilterOptions();
  } catch (err) {
    console.error("gagal memuat cerita", err); // kalau gagal tampilkan error di console
  }
}

// FUNGSI UNTUK RENDER CARD CERITA
// parameter list itu data cerita yang mau ditampilkan saat itu.
function renderStories(list) {
  // ambil elemen <section id="ceritaContainer">
  const container = document.getElementById("ceritaContainer");

  // kosongkan dulu containernya biar saat render ulang gak ke double
  container.innerHTML = "";

  // kalo gak ada cerita yang cocok dengan filter/search
  if (list.length === 0) {
    container.innerHTML = "<p>Cerita tidak ada :(</p>";
    return;
  }

  // loop setiap cerita dan buat HTML cardnya
  list.forEach(story => {

    // buat elemen baru <article>
    const card = document.createElement("article");

    // tambahin kelas CSS 
    card.classList.add("cerita-card");

    // isi elemennya dengan template HTML
    card.innerHTML = `
      <div class="card-top">
        <!-- illustrasi cerita -->
        <img src="${story.gambar}" alt="${story.judul}">

        <!-- judul dan daerah asal -->
        <div class="card-info">
          <h3>${story.judul}</h3>
          <p><strong>Daerah:</strong> ${story.daerah}</p>
        </div>
      </div>

      <!-- tombol untuk baca cerita -->
      <div class="card-buttons">
        <button onclick="viewStory(${story.id})">Baca Cerita</button>
      </div>
    `;

    // tambahkan ke halaman
    container.appendChild(card);
  });
}

// FUNCTION UNTUK MASUK KE MODE BACA CERITA
// parameternya id berasal dari tombol yang diklik user <button onclick="viewStory(${story.id})">
function viewStory(id) {
  // cari cerita berdasarkan ID
  const story = stories.find((s) => s.id === id);

  // kalo gak ketemu fungsinya berhenti 
  if (!story) return;

  // sembunyikan sidebar & header
  document.querySelector(".sidebar").style.display = "none";
  document.querySelector("header").style.display = "none";

  // tambahkin kelas CSS 
  const main = document.querySelector("main");
  main.classList.add("fullscreen-mode");

  const container = document.getElementById("ceritaContainer");
  container.classList.add("fullscreen-container");

  // render tampilan fullscreen
  // ganti isi container jadi tampilan khusus mode baca
  container.innerHTML = `
    
    <button class="back-btn" onclick="exitReadMode()">Kembali</button>
    
    <!-- wrapper utama untuk isi cerita -->
    <div class="baca-wrapper">

      <!-- judul, gambar, asal daerah, teks cerita -->
      <h2>${story.judul}</h2>
      <img src="${story.gambar}" alt="${story.judul}">
      <p class="info-daerah"><strong>Daerah:</strong> ${story.daerah}</p>
      <p class="isi-cerita">${story.isi}</p>
     
      <!-- tombol2 -->
      <div class="fullscreen-buttons">
        <button onclick="toggleFavorite(${story.id})">Favorit</button>
        <button onclick="toggleBookmark(${story.id})">Simpan</button>
        <button onclick="markAsRead(${story.id})">Tandai Dibaca</button>
        <button onclick="openEditModal(${story.id})">Edit</button>
        <button onclick="deleteStory(${story.id})">Hapus</button>
      </div>
    </div>
  `;
}

// FUNCTION UNTUK KELUAR DARI MODE BACA CERITA 
function exitReadMode() {
  // ambil elemen sidebar, header, main, container cerita
  const sidebar = document.querySelector(".sidebar");
  const header = document.querySelector("header");
  const main = document.querySelector("main");
  const container = document.getElementById("ceritaContainer");

  // pastikan semua elemen ditemukan sebelum diubah
  if (!sidebar || !header || !container) return;

  // tampilkan lagi sidebar & header
  sidebar.style.display = "flex";
  header.style.display = "flex";

  // hapus tampilan fullscreen 
  main.classList.remove("fullscreen-mode");
  container.classList.remove("fullscreen-container");

   // kosongkan container dan tampilin ulang daftar cerita
  container.innerHTML = "";
  renderStories(stories); 

  // scroll ke atas
  window.scrollTo({ top: 0, behavior: "smooth" });
}

