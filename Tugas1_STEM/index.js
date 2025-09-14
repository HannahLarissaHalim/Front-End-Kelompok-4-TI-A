// variabel2 global
const inputNumber = document.getElementById('input-number');    
const fromBase = document.getElementById('from-base');          
const toBase = document.getElementById('to-base');               
const resultNumber = document.getElementById('result-number');  

const digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// fungsi konversi yg utama
function convert() {
 
  const inputValue = inputNumber.value.trim().toUpperCase(); // rapihkan input

  // ambil nilai (value) source base dan target base dari dropdown, ubah ke number pake Number()
  const sourceBase = Number(fromBase.value);
  const targetBase = Number(toBase.value);

  
  inputNumber.classList.remove("invalid");  // class invalid -> box jd merah, hapus dulu classnya 
  resultNumber.value = "";                  // hasil juga kosong dlu

  // kalau input kosong 
  if (inputValue === '') {
    inputNumber.classList.add("invalid");
    return;
  }

  // base asal -> decimal, panggil function convertToDecimal()
  const decimalValue = convertToDecimal(inputValue, sourceBase);
  if (decimalValue === null) {
    inputNumber.classList.add("invalid");
    return;
  }

  // decimal -> base tujuan, panggil function convertFromDecimal()
  const finalResult = convertFromDecimal(decimalValue, targetBase);
  resultNumber.value = finalResult;
}

function convertToDecimal(inputStr, sourceBase) {
  let decimalValue = 0;
  
   // loop dari kiri ke kanan
  for (let i = 0; i < inputStr.length; i++) {
    const currentChar = inputStr[i];                // ambil karakter ke-i
    const digitValue = digits.indexOf(currentChar); // cari nilai digit karakter tsb di variabel digits

    // jika tdk ditemukan atau lebih besar dari base
    if (digitValue === -1 || digitValue >= sourceBase) {
      return null; 
    }

    // contoh rumus manual misal 210 base 3 = 2×3² + 1×3¹ + 0×3⁰ = 21 (desimalnya)
    // jadi ini ambil nilai yang sudah ada, lalu geser satu posisi ke kiri (kalikan dengan base) dan terakhir tambahkan digit baru di posisi paling kanan 
    // contoh trace table
    /* 
    i  char  digit  decvalue(sblm)  operasi  decvalue(sesudah)
    1   '2'      2              0    0x3+2                  2
    2   '1'      1              2    2x3+1                  7
    3   '0'      0              7    7x3+0                 21
    */
    decimalValue = decimalValue * sourceBase + digitValue; // rumus utamanya
  }
  return decimalValue;
}

function convertFromDecimal(decimalValue, targetBase) {
  if (decimalValue === 0) return "0"; // kalau yg mau dikonversi = 0 
  let finalResult = "";

  // ulangi pembagian sampai decimalValue habis
  while (decimalValue > 0) {
    const remainder = decimalValue % targetBase;
    finalResult = digits[remainder] + finalResult;
    decimalValue = Math.floor(decimalValue / targetBase); // math.floor buat buletin angka
  }
  // contoh trace table
  /*
  i  decvalue  remainder  digits[remainder]  finalRes  decvalue = math.
  1        21   21%8=5                  '5'       "5"                2
  2         2    2%8=2                  '2'      "25"                0
  3         0                                    "25"    loop berhenti
  */
 
  return finalResult;
}

function reset() {
  
}

function swapBases() {
  
}

function copyResult() {
  
}
