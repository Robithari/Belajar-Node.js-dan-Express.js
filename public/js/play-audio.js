document.addEventListener('DOMContentLoaded', function () {
  const isiHalamanElement = document.querySelector('.isi-halaman');
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');

  let textContent = '';
  let voices = [];
  let utterance;
  let isPaused = false;
  let isStopped = true;
  let lastPosition = 0;
  let textChunks = [];
  let currentChunkIndex = 0;

  const synth = window.speechSynthesis;

  // Fungsi untuk membersihkan teks dari tag HTML
  function sanitizeText(text) {
    return text.replace(/<\/?[^>]+(>|$)/g, "").replace(/\uFEFF/g, '');
  }

  // Memecah teks panjang menjadi kalimat-kalimat
  function splitTextIntoChunks(text) {
    return text.match(/[^.!?]+[.!?]+/g) || [text]; // Memecah berdasarkan titik, tanda seru, atau tanda tanya
  }

  // Memperbarui teks jika berubah
  function updateTextContent() {
    if (isiHalamanElement && isiHalamanElement.innerText.trim() !== '') {
      textContent = sanitizeText(isiHalamanElement.innerText);
      textChunks = splitTextIntoChunks(textContent);
      currentChunkIndex = 0;
      console.log('Text content updated:', textChunks);
      checkCanPlay();
    }
  }

  // Observer untuk mendeteksi perubahan teks di halaman
  if (isiHalamanElement) {
    const observer = new MutationObserver(() => {
      updateTextContent();
      observer.disconnect();
    });
    observer.observe(isiHalamanElement, { childList: true, subtree: true, characterData: true });
  }

  // Mengambil daftar suara yang tersedia
  function populateVoices() {
    voices = synth.getVoices();
    if (voices.length !== 0) {
      console.log('Daftar suara:', voices);
      checkCanPlay();
    }
  }

  synth.addEventListener('voiceschanged', populateVoices);
  populateVoices();

  function checkCanPlay() {
    if (voices.length > 0 && textContent.trim() !== '') {
      playBtn.disabled = false;
    } else {
      playBtn.disabled = true;
    }
  }

  // Fungsi untuk memulai ucapan
  function startSpeech() {
    if (!synth.speaking || isStopped) {
      isStopped = false;
      currentChunkIndex = 0;
      speakChunk();
    } else if (isPaused) {
      synth.resume();
      isPaused = false;
      console.log('Ucapan dilanjutkan.');
    }
  }

  // Fungsi untuk membaca per bagian (chunk) jika teks panjang
  function speakChunk() {
    if (currentChunkIndex >= textChunks.length || isStopped) {
      console.log("Semua teks sudah dibacakan.");
      return;
    }

    utterance = new SpeechSynthesisUtterance(textChunks[currentChunkIndex]);
    utterance.lang = 'id-ID';

    const idIDVoice = voices.find(voice => voice.lang === 'id-ID');
    if (idIDVoice) {
      utterance.voice = idIDVoice;
      console.log('Menggunakan suara:', idIDVoice.name);
    } else {
      console.warn("Voice 'id-ID' tidak tersedia. Menggunakan voice default.");
    }

    utterance.onend = function () {
      console.log("Bagian selesai:", textChunks[currentChunkIndex]);
      currentChunkIndex++;
      if (!isStopped) {
        speakChunk(); // Lanjutkan ke bagian berikutnya jika belum dihentikan
      }
    };

    utterance.onerror = function (event) {
      console.error("Terjadi kesalahan saat ucapan:", event.error);
    };

    synth.speak(utterance);
    console.log("Membaca bagian:", textChunks[currentChunkIndex]);
  }

  // Fungsi untuk menjeda ucapan
  function pauseSpeech() {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      isPaused = true;
      console.log('Ucapan dijeda.');
    }
  }

  // Fungsi untuk menghentikan ucapan
  function stopSpeech() {
    if (synth.speaking || synth.paused) {
      synth.cancel();
      isStopped = true;
      isPaused = false;
      currentChunkIndex = 0;
      console.log('Ucapan dihentikan.');
    }
  }

  // Event listener untuk tombol
  if (playBtn) {
    playBtn.disabled = true;
    playBtn.addEventListener('click', startSpeech);
  } else {
    console.warn('Tombol play tidak ditemukan.');
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', pauseSpeech);
  } else {
    console.warn('Tombol pause tidak ditemukan.');
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', stopSpeech);
  } else {
    console.warn('Tombol stop tidak ditemukan.');
  }

  // Deteksi perubahan visibility halaman
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && synth.speaking) {
      pauseSpeech();
    } else if (!document.hidden && isPaused && !isStopped) {
      synth.resume();
      isPaused = false;
      console.log('Ucapan dilanjutkan setelah kembali ke halaman.');
    }
  });
});
