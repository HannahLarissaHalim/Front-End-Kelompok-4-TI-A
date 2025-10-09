// data utama 
// buat nyimpen semua cerita dan hasil filter
let stories = [];           // array untuk menyimpan daftar cerita dari JSON
let filteredStories = [];   // array untuk kalau lagi filtering atau searching
let currentStoryId = null;  // menyimpan ID cerita yang sedang diedit


// menyimpan id cerita di localStorage agar tetap ada setelah refresh
// ambil data dulu dari localStorage lalu parsing biar jadi objek
let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];  // fallback -> kalau belum ada isi dengan array null
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || {};          // simpan dalam bentuk objek key(id cerita) value(isi catatan)
let deletedStories = JSON.parse(localStorage.getItem("deletedStories")) || [];


// FUNCTION LOADSTORIES 
// UNTUK LOAD SEMUA CERITA YANG ADA DI JSON
async function loadStories() {
  try {
    // apakah ada data cerita yang udah pernah disimpan di localstorage
    const savedStories = JSON.parse(localStorage.getItem("stories"));
    
    // kalau ada dan gak kosong, langsung pake 
    if (savedStories && savedStories.length > 0) {
      stories = savedStories;
    } else {
      // kalau belum ada, fetch dari file json
      const response = await fetch("data_cerita.json");
      const data = await response.json();
      stories = data;

      localStorage.setItem("stories", JSON.stringify(stories)); // simpan ke localstorage 
    }

    filteredStories = [...stories]; // setelah data siap, duplikat ke filteredStories utk kebutuhan search/filter
    renderStories(stories);         // tampilkan semua cerita ke halaman
    loadDaftarDaerah();             // isi dropdown filter daerah 
  } catch (err) {
    console.error("gagal memuat cerita", err); 
  }
}


// FUNCTION RENDERSTORIES 
// UNTUK RENDER CARD CERITA
// parameter list itu data cerita yang mau ditampilkan saat itu
function renderStories(list) {
  // matikan mode baca 
  document.querySelector(".sidebar").style.display = "flex";
  document.querySelector("header").style.display = "flex";
  document.querySelector("main").classList.remove("fullscreen-mode");
  document.getElementById("ceritaContainer").classList.remove("fullscreen-container");

  
  const container = document.getElementById("ceritaContainer"); // ambil elemen <section id="ceritaContainer">
  container.innerHTML = "";                                     // kosongkan dulu containernya biar saat render ulang gak ke double

  // kalo gak ada cerita yang cocok dengan filter/search
  if (list.length === 0) {
    container.innerHTML = "<p class='empty-message'>Tidak ada cerita.</p>";
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

    container.appendChild(card); // tambahkan ke halaman
  });
}


// FUNCTION VIEWSTORY
// UNTUK MASUK KE MODE BACA CERITA
// parameternya id berasal dari tombol yang diklik user <button onclick="viewStory(${story.id})">
function viewStory(id) {
  
  const story = stories.find((s) => s.id === id); // cari cerita berdasarkan ID
  if (!story) return;                             // kalo gak ketemu fungsinya berhenti 

  // sembunyikan sidebar & header
  document.querySelector(".sidebar").style.display = "none";
  document.querySelector("header").style.display = "none";

  // tambahkin kelas CSS untuk aktifin fullscreen/mode baca
  const main = document.querySelector("main");
  main.classList.add("fullscreen-mode");

  const container = document.getElementById("ceritaContainer");
  container.classList.add("fullscreen-container");

  // fallback untuk gambar dan isi
  const isiCerita = story.isi ? story.isi.replace(/\n/g, '<br>') : "(Belum ada isi cerita)";
  const gambarCerita = story.gambar && story.gambar.trim() !== "" ? story.gambar : "images/default.jpg";
  const judulCerita = story.judul || "(Tanpa Judul)";
  const daerahCerita = story.daerah || "(Tidak diketahui)";

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
        <button onclick="addFavorite(${story.id})">Favorit</button>
        <button onclick="addBookmark(${story.id})">Bookmark</button>
        <button onclick="addRead(${story.id})">Tandai Sudah Dibaca</button>
        <button onclick="openEditModal(${story.id})">Edit Cerita</button>
        <button onclick="deleteStory(${story.id})">Hapus Cerita</button>
      </div>
    </div>
  `;
}


// FUNCTION REMOVEFROMFAVORITES
// HAPUS CERITA DARI DAFTAR FAVORIT
function removeFromFavorites(id) {
  favorites = favorites.filter(f => f !== id);                  // filter id yang bukan cerita ini
  localStorage.setItem("favorites", JSON.stringify(favorites)); // simpan ulang hasilnya ke localstorage
  showSection("favorites");                                     // refresh halaman
}

// FUNCTION REMOVEFROMBOOKMARK
// HAPUS CERITA DARI DAFTAR BOOKMARK
function removeFromBookmarks(id) {
  bookmarks = bookmarks.filter(b => b !== id);
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  showSection("bookmarks");
}

// FUNCTION REMOVEFROMREAD
// HAPUS DARI STATUS SUDAH DIBACA
function removeFromRead(id) {
  const story = stories.find(s => s.id === id); // cari cerita sesuai id
  if (story) story.dibaca = false;              // kalau ketemu, ubah flag dibaca jadi false 
  showSection("read");                          // refresh halaman 
}


// FUNCTION SHOWCARDSBYCATEGORY
// BUAT NAMPILIN DAFTAR KARTU SESUAI KATEGORI (FAVORIT, BOOKMARK, ATAU DIBACA)
function showCardsByCategory(list, type, removeFunction) {
  const container = document.getElementById("ceritaContainer");
  container.innerHTML = "";

  // kalau list-nya kosong,
  if (list.length === 0) {
    container.innerHTML += `<p class="empty-message">Tidak ada cerita.</p>`;
    return;
  }

  // looping tiap cerita di list
  list.forEach(story => {
    // buat elemen artikel untuk setiap cerita
    const card = document.createElement("article");
    card.classList.add("cerita-card");

    // isi struktur html card-nya
    card.innerHTML = `
      <div class="card-top">
        <img src="${story.gambar}" alt="${story.judul}">
        <div class="card-info">
          <h3>${story.judul}</h3>
          <p><strong>Daerah:</strong> ${story.daerah}</p>
        </div>
      </div>
      <div class="card-buttons">
        <button onclick="viewStory(${story.id})">Baca Cerita</button>
        <button onclick="${removeFunction.name}(${story.id})">Hapus dari ${type}</button>
      </div>
    `;
    container.appendChild(card); // tambahkan kartu ke container utama
  });
}


// FUNCTION EXITREADMODE
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

  window.scrollTo({ top: 0, behavior: "smooth" }); // scroll ke atas
}


// FUNCTION LOADDAFTARDAERAH
// UNTUK MENGISI DROPDOWN DAERAH UNTUK FITUR FILTERING
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
  modal.style.display = "flex";                                             // tampilkan modal dgn display flex spy muncul di tengah
  document.getElementById("modalTitle").textContent = "Tambah Cerita Baru"; // ubah judul modal
  currentStoryId = null;                                                    // reset ID karena ini nambah cerita baru
  document.getElementById("formCerita").reset();                            // kosongin semua input di form
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
    stories.push(newStory); // tambahin ke array stories
  }

  modal.style.display = "none";                             // tutup modal kalo data udah disimpan
  renderStories(stories);                                   // tampilin ulang
  localStorage.setItem("stories", JSON.stringify(stories)); // tampilin ulang
});



// FUNCTION OPENEDIT MODAL
// UNTUK EDIT CERITA
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


// FUNCTION DELETESTORY
// UNTUK HAPUS CERITA 
function deleteStory(id) {
  if (confirm("Apakah kamu yakin ingin menghapus cerita ini? Cerita akan dipindahkan ke Recycle Bin.")) { // popup konfirmasi
  
    const deleted = stories.find(s => s.id === id); // cari cerita yang mau dihapus berdasarkan ID

    // kalo ketemu, pindahin ke recycle bin
    if (deleted && !deletedStories.some(s => s.id === deleted.id)) {
      deletedStories.push(deleted);
      localStorage.setItem("deletedStories", JSON.stringify(deletedStories));
    }

    // hapus cerita dr daftar utama
    stories = stories.filter(s => s.id !== id);
    localStorage.setItem("stories", JSON.stringify(stories));

    renderStories(stories); // tampilin ulang
  }
}


// FUNCTION ADDFAVORITE
// BUAT TAMBAHIN ATAU HAPUS CERITA DARI DAFTAR FAVORIT
function addFavorite(id) {
  // apakah cerita ada di favorit
  if (!favorites.includes(id)) {
    favorites.push(id);                                           // kalo belum ada di favorit, tambahin id-nya
    localStorage.setItem("favorites", JSON.stringify(favorites)); // simpan ke localstorage
    alert("Cerita ditambahkan ke Favorit!");
  } else {
    alert("Cerita ini sudah ada di Favorit.");
  }
}


// FUNCTION ADDBOOKMARK
// BUAT TAMBAHIN ATAU HAPUS CERITA DARI DAFTAR BOOKMARK
function addBookmark(id) {
  // apakah cerita ada di bookmark
  if (!bookmarks.includes(id)) {
    bookmarks.push(id);                                           // kalau belum ada, tambahkan id ke daftar bookmark
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks)); // simpan ke localstorage
    alert("Cerita disimpan ke Bookmark!");
  } else {
    alert("Cerita ini sudah ada di Bookmark.");
  }
}


// FUNCTION ADDREAD
// BUAT NANDAIN KALO CERITA UDAH DIBACA
function addRead(id) {
  const story = stories.find(s => s.id === id); // cari cerita yang id-nya sama kayak yang diklik user

  // apakah ceritanya ketemu dan belum ditandai dibaca
  if (story && !story.dibaca) {
    story.dibaca = true;
    alert(`Cerita "${story.judul}" ditandai sudah dibaca.`);
  } else if (story) {
    alert(`Cerita "${story.judul}" sudah ditandai dibaca.`);
  }
}

// FUNCTION ADDNOTE
// BUAT TAMBAHIN CATATAN PRIBADI
function addNote(id, isiCatatan) {
  notes[id] = isiCatatan;                               // simpan catatan di object notes dengan key = id cerita
  localStorage.setItem("notes", JSON.stringify(notes)); // update localStorage biar catatan gak hilang pas refresh
}

// CATATAN PRIBADI (HALAMAN KHUSUS)
function renderNotes() {
  const container = document.getElementById("ceritaContainer"); // ambil elemen HTML yang punya id="ceritaContainer"
  container.innerHTML = "";                 

  // kalo belum ada catatan yang disimpan
  if (Object.keys(notes).length === 0) {
    container.innerHTML += `<p class="empty-message">Tidak ada catatan.</p>`;
    return; // keluar dari fungsi
  }

  Object.entries(notes).forEach(([id, content]) => {
    const [judul, ...isi] = content.split("\n");
    const div = document.createElement("div");
    div.classList.add("note-card");
    div.innerHTML = `
      <div class="note-header">
        <h3>${judul}</h3>
        <button class="btn-delete-note" onclick="deleteNote(${id})">Hapus</button>
      </div>
      <p>${isi.join("\n")}</p>
    `;
    container.appendChild(div);
  });
}

// HAPUS CATATAN
function deleteNote(id) {
  if (confirm("Yakin ingin menghapus catatan ini?")) {
    delete notes[id];
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes();
  }
}

// FITUR TAMBAH CATATAN 
const modalCatatan = document.getElementById("modalCatatan");
const closeModalCatatan = document.getElementById("closeModalCatatan");

// buka modal
function openNoteModal() {
  modalCatatan.style.display = "flex";
  document.getElementById("formCatatan").reset();
}

// tutup modal
closeModalCatatan.addEventListener("click", () => {
  modalCatatan.style.display = "none";
});

// submit form catatan
document.getElementById("formCatatan").addEventListener("submit", (e) => {
  e.preventDefault();

  const judul = document.getElementById("judulCatatan").value;
  const isi = document.getElementById("isiCatatan").value;

  const id = Date.now(); // id unik
  notes[id] = `${judul}\n${isi}`;
  localStorage.setItem("notes", JSON.stringify(notes));

  modalCatatan.style.display = "none";
  renderNotes();
});


// FUNCTION SHOWSTATS
// UTK MENUNJUKKAN STATISTIK
function showStats() {
  // hitung total2
  const fav = favorites.length;
  const saved = bookmarks.length;
  const read = stories.filter(s => s.dibaca).length;

  const container = document.getElementById("ceritaContainer");
  // tampilkan hasil statistik dalam bentuk kartu
  container.innerHTML = `
  <div class="stats-wrapper">
    <div class="stats-container">
      <div class="stats-card">Favorit<br><strong>${fav}</strong></div>
      <div class="stats-card">Disimpan<br><strong>${saved}</strong></div>
      <div class="stats-card">Sudah Dibaca<br><strong>${read}</strong></div>
    </div>
  </div>
  `;
}


// RECYCLE BIN
// UNTUK NAMPILIN CERITA YANG SUDAH DIHAPUS (TEMPAT PENYIMPANAN SEMENTARA)
function showRecycleBin() {
  // ambil container utama dan kosongin dulu
  const container = document.getElementById("ceritaContainer");
  container.innerHTML = "";

  // kalau belum ada cerita yang dihapus
  if (deletedStories.length === 0) {
    container.innerHTML = `<p class="empty-message">Tidak ada cerita.</p>`;
    return;
  }

  // buat container recycle bin
  const recycleContainer = document.createElement("div");
  recycleContainer.classList.add("recycle-container");

  // looping semua cerita yang dihapus
  deletedStories.forEach(story => {
    const card = document.createElement("div");
    card.classList.add("recycle-card");

    // isi card
    card.innerHTML = `
      <div class="card-top">
        <img src="${story.gambar}" alt="${story.judul}">
        <div class="card-info">
          <h3>${story.judul}</h3>
          <p><strong>Daerah:</strong> ${story.daerah}</p>
        </div>
      </div>
      <div class="card-buttons">
        <button onclick="restoreStory(${story.id})">Pulihkan</button>
        <button onclick="deleteForever(${story.id})">Hapus Permanen</button>
      </div>
    `;
    recycleContainer.appendChild(card); // tambahkan card ke recycle container 
  });
  container.appendChild(recycleContainer); // tampilkan recycle container di halaman
}


// FUNCTION RESTORESTORY
// BUAT RESTORE CERITA YANG ADA DI RECYCLE BIN
function restoreStory(id) {
  const story = deletedStories.find(s => s.id === id); // cari cerita berdasarkan id
  
  // kalau ketemu
  if (story) {
    stories.push(story); // tambahin lagi ceritanya ke halaman utama
    deletedStories = deletedStories.filter(s => s.id !== id);  

    localStorage.setItem("stories", JSON.stringify(stories));               // hapus dari recycle bin
    localStorage.setItem("deletedStories", JSON.stringify(deletedStories)); // update localStorage
    
    renderStories(stories);                                // render ulang daftar cerita
    alert(`Cerita "${story.judul}" berhasil dipulihkan!`); // kasih alert
  }
}

// FUNCTION DELETEFOREVER
// BUAT HAPUS CERITA DARI RECYCLE BIN SECARA PERMANEN
function deleteForever(id) {
  if (confirm("Apakah Anda yakin ingin menghapus cerita ini secara permanen?")) { // dialog konfirmasi
    deletedStories = deletedStories.filter(s => s.id !== id);                     // buang cerita dengan ID itu
    localStorage.setItem("deletedStories", JSON.stringify(deletedStories));       // update localStorage
    showRecycleBin();                                                             // render ulang tampilan Recycle Bin
  }
}


// NAVIGATION BAR 
// BUAT ATUR NAVIGASI HALAMAN DI SIDEBAR (HOME, FAVORIT, CATATAN, DLL)

// ambil semua elemen <li> di dalam .navigation-links (menu navigasi), lalu looping
document.querySelectorAll(".navigation-links li").forEach(li => {

  // event saat user klik salah satu menu
  li.addEventListener("click", () => {

    document.querySelectorAll(".navigation-links li").forEach(x => x.classList.remove("active")); // hapus class active dari semua menu biar gak ke double
    
    li.classList.add("active");         // kasih class active ke menu yang baru diklik
    const section = li.dataset.section; // ambil nilai dari atribut data-section
    
    localStorage.setItem("lastSection", section); // simpan halaman terakhir di localStorage
    showSection(section);                         // tampilin halaman sesuai section yang diklik
  });
});


// FUNCTION SHOWSECTION
// NENTUIN HALAMAN MANA YANG MAU DITAMPILIN BERDASARKAN MENU YANG DIKLIK USER
function showSection(section) {
  const btnTambahCerita = document.getElementById("btnTambahCerita");
  const btnTambahCatatan = document.getElementById("btnTambahCatatan");
  const searchInput = document.getElementById("searchInput");
  const filterDaerah = document.getElementById("filter-daerah");

  // default: semua tampil normal
  btnTambahCerita.style.display = "inline-block";
  btnTambahCatatan.style.display = "none";
  searchInput.style.display = "inline-block";
  filterDaerah.style.display = "inline-block";

  switch (section) {
    case "home":
      renderStories(stories);
      break;

    case "favorites":
      showCardsByCategory(
        stories.filter(s => favorites.includes(s.id)),
        "Favorit",
        removeFromFavorites
      );
      btnTambahCerita.style.display = "none";
      break;

    case "bookmarks":
      showCardsByCategory(
        stories.filter(s => bookmarks.includes(s.id)),
        "Bookmark",
        removeFromBookmarks
      );
      btnTambahCerita.style.display = "none";
      break;

    case "read":
      showCardsByCategory(
        stories.filter(s => s.dibaca),
        "Sudah Dibaca",
        removeFromRead
      );
      btnTambahCerita.style.display = "none";
      break;

    case "notes":
      renderNotes();

      // tampilkan tombol catatan
      btnTambahCerita.style.display = "none";
      btnTambahCatatan.style.display = "inline-block";

      // sembunyikan search dan filter
      searchInput.style.display = "none";
      filterDaerah.style.display = "none";
      break;

    case "stats":
      showStats();
      btnTambahCerita.style.display = "none";

      // sembunyikan search dan filter 
      document.getElementById("searchInput").style.display = "none";
      document.getElementById("filter-daerah").style.display = "none";
      
      // kasih tinggi tetap biar header gak gepeng
      document.querySelector("header").style.minHeight = "40px";
      document.querySelector("header").style.padding = "12px 24px";
      header.style.justifyContent = "center";
      break;

    case "recycle-bin":
      showRecycleBin();
      btnTambahCerita.style.display = "none";
      break;
  }
}


// INISIALISASI
// FUNGSI INI JALAN OTOMATIS WAKTU HALAMAN PERTAMA KALI DIBUKA
window.onload = () => {
  loadStories(); // load data cerita dari file JSON

  const lastSection = localStorage.getItem("lastSection"); // ambil halaman terakhir yang tersimpan

  // kalau ada halaman terakhir tampilkan itu
  if (lastSection) {
    document.querySelectorAll(".navigation-links li").forEach(li => {
      li.classList.toggle("active", li.dataset.section === lastSection);
    });
    showSection(lastSection);
  } else {
    showSection("home"); // kalau belum ada default ke home
  }

};

// biar fungsi exitReadMode() bisa dipanggil dari HTML
window.exitReadMode = exitReadMode;