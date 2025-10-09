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
    loadDaftarDaerah();
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
    const card = document.createElement("article"); // buat elemen baru <article>
    card.classList.add("cerita-card");              // tambahin kelas CSS

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
      <p class="isi-cerita">${story.isi.replace(/\n/g, '<br>')}</p>
     
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

// FUNCTION UNTUK MENGISI DROPDOWN DAERAH UNTUK FITUR FILTERING
function loadDaftarDaerah() {
  // ambil elemen <select> dari HTML yang ada id="filter-daerah".
  const filterSelect = document.getElementById("filter-daerah");

  // ambil semua nama daerah dari daftar cerita
  const daerahSet = new Set(stories.map(s => s.daerah)); // pakai set supaya hasilnya gak ada duplikat

  // tambahkan opsi ke dalam dropdown
  daerahSet.forEach(daerah => {
    const option = document.createElement("option"); // bikin elemen <option> baru
    option.value = daerah;                           // isi value dgn nama daerah
    option.textContent = daerah;                     // tampilkan teks daftar2 daerah di dropdown
    filterSelect.appendChild(option);                // masukkan <option> ke <select id="filter-daerah">
  });
}

// FITUR SEARCH & FILTER BERDASARKAN DAERAH

// event saat user ketik di search bar
document.getElementById("searchInput").addEventListener("input", (e) => {
  
  const keyword = e.target.value.toLowerCase(); // ubah jadi huruf kecil biar pencarian gak case sensitive

  // filter daftar cerita berdasarkan judul atau isi
  filteredStories = stories.filter(s =>
    s.judul.toLowerCase().includes(keyword) ||  // cocokkan dengan judul
    s.isi.toLowerCase().includes(keyword)       // atau dgn isi cerita
  );

  renderStories(filteredStories); // tampilin hasil filter ke halaman
});

// event saat user memilih filter daerah
document.getElementById("filter-daerah").addEventListener("change", (e) => {

  const val = e.target.value;  // ambil value dr dropdown yang dipilih user       
  
  if (val === "all") renderStories(stories);                 // kalau user pilih semua daerah tampilkan semua cerita
  else renderStories(stories.filter(s => s.daerah === val)); // kalau gak, tampilkan cerita berdasarkan daerah yang dipilih
});


// FITUR TAMBAH CERITA BARU
const modal = document.getElementById("modalCerita");         // ambil elemen modal (popup form tambah/edit)
const btnTambah = document.getElementById("btnTambahCerita"); // ambil tombol tambah cerita
const closeModal = document.getElementById("closeModal");     // ambil tombol menutup modal

// event saat user klik tombol tambah cerita
btnTambah.addEventListener("click", () => {

  modal.style.display = "flex"; // tampilkan modal dgn display flex spy muncul di tengah

  document.getElementById("modalTitle").textContent = "Tambah Cerita Baru"; // ubah judul modal

  currentStoryId = null; // reset ID karena ini nambah cerita baru

  document.getElementById("formCerita").reset(); // kosongin semua input di form
});

// event saat user klik tombol menutup modal
closeModal.addEventListener("click", () => (modal.style.display = "none"));

// event saat user klik tombol simpan cerita dalam form modal
document.getElementById("formCerita").addEventListener("submit", (e) => {

  e.preventDefault();  // supaya halaman gak ke reload otomatis 

  // ambil nilai input dari form
  const judul = document.getElementById("judul").value;
  const daerah = document.getElementById("daerah").value;
  const isi = document.getElementById("isi").value;
  const gambar = document.getElementById("gambar");

  let path_gambar = "";
  // jika user memilih file image
  if (gambar.files && gambar.files[0]) {
    const file = gambar.files[0];
    path_gambar = URL.createObjectURL(file);
  }

  // kalau currentStoryId ada berarti user lagi edit cerita lama
  if (currentStoryId) {
    const idx = stories.findIndex(s => s.id === currentStoryId);    // cari index cerita yg lagi diedit
    stories[idx] = { ...stories[idx], judul, daerah, gambar, isi }; // update data ceritanya
  } else {
    // kalau gak ada berarti user nambah cerita baru
    const newStory = {
      id: Date.now(),
      judul,
      daerah,
      gambar: path_gambar,
      isi,
      dibaca: false
    };
    stories.push(newStory);     // tambahin ke array stories
  }

  modal.style.display = "none"; // tutup modal kalo data udah disimpan
  renderStories(stories);       // tampilin ulang
});

// FUNCTION UNTUK EDIT CERITA
function openEditModal(id) {
  const story = stories.find(s => s.id === id); // cari cerita berdasarkan ID yang diklik user
  if (!story) return;                           // kalau gak ditemukan, hentikan fungsi

  modal.style.display = "flex"; // tampilkan modal form di layar

  document.getElementById("modalTitle").textContent = "Edit Cerita"; // ganti judul modal jd “Edit Cerita”
  document.getElementById("judul").value = story.judul;              // isi judul pake data lama
  document.getElementById("daerah").value = story.daerah;            // isi asal daerah
  document.getElementById("gambar").value = story.gambar;            // isi gambar
  document.getElementById("isi").value = story.isi;                  // isi cerita

  currentStoryId = id; // simpan ID cerita yang sedang diedit
}

// FUNCTION UNTUK HAPUS CERITA 
function deleteStory(id) {

  // popup konfirmasi
  if (confirm("Apakah kamu yakin ingin menghapus cerita ini? Cerita akan dipindahkan ke Recycle Bin.")) {
    
    // cari cerita yang mau dihapus berdasarkan ID
    const deleted = stories.find(s => s.id === id);

    // kalo ketemu, pindahin ke recycle bin
    if (deleted) {
      deletedStories.push(deleted);                                           // masukin ke array deletedStories
      localStorage.setItem("deletedStories", JSON.stringify(deletedStories)); // simpan ke localStorage biar gak ilang pas refresh
    }

    // hapus cerita dr daftar utama
    stories = stories.filter(s => s.id !== id);

    // tampilin ulang
    renderStories(stories);
  }
}

// FUNCTION FAVORITE
// buat tambahin atau hapus cerita dari daftar favorit
function favorite(id) {
  if (favorites.includes(id)) favorites = favorites.filter(f => f !== id); // kalau id udah ada di array favorites, hapus idnya
  else favorites.push(id);                                                 // kalau belum ada, tambahin id cerita ke array favorites

  localStorage.setItem("favorites", JSON.stringify(favorites)); // simpan data cerita favorit ke localStorage biar gak ilang pas refresh
}

// FUNCTION BOOKMARK
// buat tambahin atau hapus cerita dari daftar disimpan (bookmark)
function bookmark(id) {

  // bikin array baru yang isinya semua elemen kecuali yang id-nya sama dengan yang diklik.
  if (bookmarks.includes(id)) bookmarks = bookmarks.filter(b => b !== id); 
  // kalau belum ada, tambahin id cerita ke array bookmarks
  else bookmarks.push(id);                                                 

  localStorage.setItem("bookmarks", JSON.stringify(bookmarks)); // simpan data bookmark ke localStorage biar gak ilang pas refresh
}

// FUNCTION MARKASREAD
// buat tandain kalo cerita udah dibaca
function markAsRead(id) {
  // cari cerita yang idnya sama dengan id yang dikirim
  const story = stories.find(s => s.id === id); 
  
  // kalau ceritanya ketemu
  if (story) {
    story.dibaca = true;                                       // tandai sudah dibaca
    alert(`Cerita "${story.judul}" ditandai sudah dibaca :D`); // kasih alert ke user
  }
}

// FUNCTION ADDNOTE
// buat tambahin catatan pribadi
function addNote(id, isiCatatan) {
    
  notes[id] = isiCatatan; // simpan catatan di object notes dengan key = id cerita
  localStorage.setItem("notes", JSON.stringify(notes)); // update localStorage biar catatan gak hilang pas refresh
}

// CATATAN PRIBADI (HALAMAN KHUSUS)
function renderNotes() {

  // ambil elemen HTML yang punya id="ceritaContainer"
  const container = document.getElementById("ceritaContainer");
  
  // ganti isi container mjd judul catatan
  container.innerHTML = "<h2>Catatan</h2>";                 

  // kalo belum ada catatan yang disimpan
  if (Object.keys(notes).length === 0) {
    container.innerHTML += "<p>Tidak ada catatan.</p>";
    return; // keluar dari fungsi
  }

  // tampilkan semua catatan yang ada
  // looping untuk semua catatan yang tersimpan
  Object.keys(notes).forEach(id => {
    const story = stories.find(s => s.id == id); // cari cerita dari array stories yang idnya sama dengan id catatan
    const div = document.createElement("div");   // buat elemen card baru
    div.classList.add("cerita-card");            // kasih class CSS

    // masukkan isi HTML ke dalam div
    div.innerHTML = `
      <!-- headernya kalau cerita udah dihapus -->
      <h3>${story ? story.judul : "(Cerita sudah dihapus)"}</h3>
      <!-- tempat tulis catatan -->
      <textarea rows="4" onchange="addNote(${id}, this.value)">${notes[id]}</textarea>
    `;
    container.appendChild(div); // tambahkan card ke halaman
  });
}

// FUNCTION SHOWSTATS
// untuk menunjukkan statistik 
function showStats() {
  // data-data statistiknya
  const total = stories.length; 
  const fav = favorites.length; 
  const saved = bookmarks.length;
  const read = stories.filter(s => s.dibaca).length;

  // ambil elemen utama tempat isi halaman
  const container = document.getElementById("ceritaContainer");

  // tampilkan datanya
  container.innerHTML = `
    <h2>Statistik Bacaan</h2>
    <p>Total Cerita: <strong>${total}</strong></p>
    <p>Favorit: <strong>${fav}</strong></p>
    <p>Disimpan: <strong>${saved}</strong></p>
    <p>Sudah Dibaca: <strong>${read}</strong></p>
  `;
}

// RECYCLE BIN
function showRecycleBin() {

  // smbil elemen utama tempat semua isi halaman ditampilkan
  const container = document.getElementById("ceritaContainer");

  // ubah judul/headernya jadi Recycle Bin 
  container.innerHTML = "<h2>Recycle Bin</h2>";

  // kalau array deletedStories kosong berarti belum ada cerita yang dihapus
  if (deletedStories.length === 0) {
    container.innerHTML += "<p>Tidak ada cerita.</p>";
    return;
  }

  // loop setiap cerita di array deletedStories
  deletedStories.forEach(story => {
    const card = document.createElement("article"); // buat elemen HTML baru (<article>)
    card.classList.add("cerita-card");              // kasih class cerita-card
    
    // isi cardnya
    card.innerHTML = `
      <img src="${story.gambar}" alt="${story.judul}">
      <h3>${story.judul}</h3>
      <p><strong>Daerah:</strong> ${story.daerah}</p>
      <div class="card-buttons">
        <button onclick="restoreStory(${story.id})">Pulihkan</button>
        <button onclick="deleteForever(${story.id})">Hapus Permanen</button>
      </div>
    `;

    // tambahkan card ke halaman
    container.appendChild(card);
  });
}

// FUNCTION RESTORESTORY
// buat restore cerita yang di recycle bin
function restoreStory(id) {
  const story = deletedStories.find(s => s.id === id); // cari cerita berdasarkan id
  
  // kalau ketemu
  if (story) {
    stories.push(story);                                                    // tambahin lagi ceritanya ke halaman utama
    deletedStories = deletedStories.filter(s => s.id !== id);               // hapus dari recycle bin
    localStorage.setItem("deletedStories", JSON.stringify(deletedStories)); // update localStorage
    renderStories(stories);                                                 // render ulang daftar cerita
    alert(`Cerita "${story.judul}" berhasil dipulihkan!`);                  // kasih alert
  }
}

// FUNCTION DELETEFOREVER
// buat hapus cerita dari recycle bin secara permanen
function deleteForever(id) {
  if (confirm("Apakah Anda yakin ingin menghapus cerita ini secara permanen?")) { // dialog konfirmasi
    deletedStories = deletedStories.filter(s => s.id !== id);                     // buang cerita dengan ID itu
    localStorage.setItem("deletedStories", JSON.stringify(deletedStories));       // update localStorage
    showRecycleBin();                                                             // render ulang tampilan Recycle Bin
  }
}

// NAVIGATION BAR 
// buat atur navigasi halaman di sidebar (home, favorit, catatan, dll)

// ambil semua elemen <li> di dalam .navigation-links (menu navigasi), lalu looping
document.querySelectorAll(".navigation-links li").forEach(li => {

  // event saat user klik salah satu menu
  li.addEventListener("click", () => {

    document.querySelectorAll(".navigation-links li").forEach(x => x.classList.remove("active")); // hapus class active dari semua menu biar gak ke double
    
    li.classList.add("active");         // kasih class active ke menu yang baru diklik

    const section = li.dataset.section; // ambil nilai dari atribut data-section

    showSection(section);               // tampilin halaman sesuai section yang diklik
  });
});

// FUNCTION SHOWSECTION
// nentuin halaman mana yang ditampilkan berdasarkan menu yang diklik
function showSection(section) {
  switch (section) {
    case "home":
      renderStories(stories); // tampil semua cerita
      break;
    case "favorites":
      renderStories(stories.filter(s => favorites.includes(s.id))); // cuma yang difavoritkan
      break;
    case "bookmarks":
      renderStories(stories.filter(s => bookmarks.includes(s.id))); // cuma yang dibookmark
      break;
    case "read":
      renderStories(stories.filter(s => s.dibaca)); // cuma yang udah ditandain sudah dibaca
      break;
    case "notes":
      renderNotes();    // halaman catatan pribadi
      break;
    case "stats":
      showStats();      // halaman statistik
      break;
    case "recycle-bin":
      showRecycleBin(); // halaman recycle bin
      break;
  }
}

// INISIALISASI
// fungsi ini jalan otomatis waktu halaman pertama kali dibuka
window.onload = () => {
  loadStories(); // load data cerita dari file JSON
};

// biar fungsi exitReadMode() bisa dipanggil dari HTML
window.exitReadMode = exitReadMode;