const kunciTema = "tema-perpus-tanah-datar";

const simpanTema = (tema) => {
  document.documentElement.dataset.tema = tema;
  try {
    localStorage.setItem(kunciTema, tema);
  } catch (e) {}
};

const temaTersimpan = () => {
  try {
    return localStorage.getItem(kunciTema);
  } catch (e) {
    return null;
  }
};

const sistemGelap = window.matchMedia("(prefers-color-scheme: dark)").matches;
simpanTema(temaTersimpan() || (sistemGelap ? "gelap" : "terang"));

const tombolTema = document.querySelector(".tombol-tema");
if (tombolTema) {
  tombolTema.addEventListener("click", () => {
    const aktif =
      document.documentElement.dataset.tema === "gelap" ? "terang" : "gelap";
    simpanTema(aktif);
  });
}

/* Judul pecah per kata */
document.querySelectorAll("h1").forEach((h) => {
  const kata = h.textContent.trim().split(/\s+/);
  h.innerHTML = kata
    .map((w, i) => `<span class="kata" style="--k:${i}">${w}</span>`)
    .join(" ");
});

/* Teks yang berganti otomatis */
const rotasi = document.querySelector(".rotasi");
if (rotasi) {
  const daftar = (rotasi.dataset.kata || "").split("|").filter(Boolean);
  let indeks = 0;
  if (daftar.length > 1) {
    const buat = (kata) => `<span>${kata}</span>`;
    rotasi.innerHTML = buat(daftar[0]);
    setInterval(() => {
      const lama = rotasi.querySelector("span");
      indeks = (indeks + 1) % daftar.length;
      if (lama) {
        lama.classList.add("keluar");
        setTimeout(() => {
          rotasi.innerHTML = buat(daftar[indeks]);
        }, 380);
      }
    }, 2600);
  }
}

/* Pengamat reveal + hitung statistik */
const pengamat = new IntersectionObserver(
  (entri) => {
    entri.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("tampil");
      if (e.target.classList.contains("statistik")) jalankanHitung(e.target);
      pengamat.unobserve(e.target);
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => {
  const saudara = el.parentElement
    ? Array.from(el.parentElement.children).filter((c) =>
        c.classList.contains("reveal")
      )
    : [];
  const indeks = saudara.indexOf(el);
  if (saudara.length > 1 && indeks > -1) el.style.setProperty("--i", indeks);
  pengamat.observe(el);
});

const formatAngka = (n) => n.toLocaleString("id-ID");

function jalankanHitung(section) {
  section.querySelectorAll(".nilai").forEach((el) => {
    const akhir = Number(el.dataset.akhir || 0);
    const durasi = 1600;
    const mulai = performance.now();
    const ket = (t) => 1 - Math.pow(1 - t, 3);

    const langkah = (kini) => {
      const progres = Math.min((kini - mulai) / durasi, 1);
      const nilai = Math.round(akhir * ket(progres));
      el.textContent = formatAngka(nilai) + (el.dataset.akhiran || "");
      if (progres < 1) requestAnimationFrame(langkah);
    };
    requestAnimationFrame(langkah);
  });
}

/* Navigasi aktif */
const halaman =
  location.pathname.split(/[\\/]/).pop() || "index.html";
document.querySelectorAll(".tautan a[href]").forEach((a) => {
  if (a.getAttribute("href") === halaman) a.classList.add("aktif");
});

/* Tombol kembali ke atas + bilah progres + parallax */
const tombolAtas = document.querySelector(".ke-atas");
const laju = document.querySelector(".laju-gulir span");
const blobA = document.querySelector(".blob-a");
const blobB = document.querySelector(".blob-b");

const saatGulir = () => {
  const y = window.scrollY;
  if (tombolAtas) tombolAtas.classList.toggle("tampil", y > 420);

  if (laju) {
    const maks = document.documentElement.scrollHeight - window.innerHeight;
    laju.style.width = (maks > 0 ? (y / maks) * 100 : 0) + "%";
  }

  if (blobA) blobA.style.translate = `0 ${y * 0.12}px`;
  if (blobB) blobB.style.translate = `0 ${y * -0.08}px`;
};

window.addEventListener("scroll", saatGulir, { passive: true });
window.addEventListener("resize", saatGulir);
saatGulir();

if (tombolAtas) {
  tombolAtas.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
}

/* Cahaya mengikuti kursor */
const kontainer = document.querySelector(".container");
if (kontainer && matchMedia("(pointer: fine)").matches) {
  let raf = 0;
  kontainer.addEventListener("pointermove", (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const r = kontainer.getBoundingClientRect();
      kontainer.style.setProperty(
        "--mx",
        (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%"
      );
      kontainer.style.setProperty(
        "--my",
        (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%"
      );
    });
  });
}

/* Kemiringan kartu mengikuti kursor */
if (matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".layanan-kartu, .galeri .kartu").forEach((kartu) => {
    kartu.addEventListener("pointermove", (e) => {
      const r = kartu.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      kartu.style.setProperty("--ry", (px * 11).toFixed(2) + "deg");
      kartu.style.setProperty("--rx", (-py * 11).toFixed(2) + "deg");
    });
    kartu.addEventListener("pointerleave", () => {
      kartu.style.setProperty("--rx", "0deg");
      kartu.style.setProperty("--ry", "0deg");
    });
  });
}

/* Pita teks berjalan: gandakan isinya agar mulus */
document.querySelectorAll(".berjalan .jalur").forEach((jalur) => {
  jalur.innerHTML += jalur.innerHTML;
});

/* Lightbox galeri */
const gambarGaleri = document.querySelectorAll(".galeri .kartu img");
if (gambarGaleri.length) {
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML =
    '<button class="tutup" type="button" aria-label="Tutup">' +
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">' +
    '<path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
    '<div class="isi"><img alt=""><p class="ket"></p></div>';
  document.body.appendChild(lb);

  const img = lb.querySelector("img");
  const ket = lb.querySelector(".ket");
  const tutupBtn = lb.querySelector(".tutup");

  const buka = (src, alt) => {
    img.src = src;
    img.alt = alt || "";
    ket.textContent = alt || "";
    lb.classList.add("tampil");
    document.body.style.overflow = "hidden";
  };

  const tutup = () => {
    lb.classList.remove("tampil");
    document.body.style.overflow = "";
  };

  gambarGaleri.forEach((g) =>
    g.addEventListener("click", () => buka(g.currentSrc || g.src, g.alt))
  );
  tutupBtn.addEventListener("click", tutup);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) tutup();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") tutup();
  });
}

/* Sembunyikan pembuka setelah animasinya selesai */
const muat = document.querySelector(".muat");
if (muat) {
  muat.addEventListener("animationend", (e) => {
    if (e.animationName === "hilang-muat") muat.remove();
  });
}
