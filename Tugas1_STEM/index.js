// variabel2 global
const inputNumber = document.getElementById('input-number');    
const fromBase = document.getElementById('from-base');          
const toBase = document.getElementById('to-base');               
const resultNumber = document.getElementById('result-number');  

const base36Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // digit yg bisa dipake (0-9 + A-Z)

// function bantuan untuk validasi input
function validateInput(inputValue, sourceBase) {
  // kalau input kosong 
  if (inputValue === '') {
    inputNumber.classList.add("invalid");
    return;
  }
  
  // loop setiap karakter di input (kiri ke kanan)
  for (let i = 0; i < inputValue.length; i++) {
      const currentChar = inputValue[i];              // ambil char ke-i dari input
      const digit = base36Chars.indexOf(currentChar); // posisi charnya di base36Chars
      
      // kalo digit ga ketemu (-1) atau lebih besar dari base yg dipilih
      if (digit === -1 || digit >= sourceBase) {
          inputNumber.classList.add("invalid");
          return;
      }
  }
}

// function konversi utama
function convert() {
  const inputValue = inputNumber.value.trim().toUpperCase(); // rapihkan input

  // ambil nilai (value) source base dan target base dari dropdown, ubah ke number
  const sourceBase = Number(fromBase.value);
  const targetBase = Number(toBase.value);

  // reset tanda invalid & kosongin hasil
  inputNumber.classList.remove("invalid");  // class invalid -> box jd merah, hapus dulu classnya 
  resultNumber.value = "";                  

  // panggil function bantuan untuk validasi input
  if (!validateInput(inputValue, sourceBase)) {
    inputNumber.classList.add("invalid");
    return;
  }
  
  // konversinya
  const decimalValue = parseInt(inputValue, sourceBase);  // 1. base asal ke desimal
  const finalResult = decimalValue.toString(targetBase).toUpperCase();  // 2. desimal ke base tujuan
  
  resultNumber.value = finalResult; // hasilnya
}

function reset() {
  
}

function swapBases() {
  
}

function copyResult() {
  
}
