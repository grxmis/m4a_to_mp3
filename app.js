alert("JS φορτώθηκε ✔");

// ✅ ΕΔΩ είναι το κρίσιμο
const { createFFmpeg, fetchFile } = FFmpeg;

const ffmpeg = createFFmpeg({
  log: true,
  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  worker: false   // ⬅️ ΤΟ ΚΛΕΙΔΙ
});


let files = [];

const fileInput = document.getElementById("files");
const fileList = document.getElementById("fileList");
const status = document.getElementById("status");

document.getElementById("removeBtn").onclick = removeSelected;
document.getElementById("convertBtn").onclick = convert;

fileInput.addEventListener("change", () => {
  files = Array.from(fileInput.files);
  refreshList();
});

function refreshList() {
  fileList.innerHTML = "";
  files.forEach((f, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = f.name;
    fileList.appendChild(opt);
  });
}

function removeSelected() {
  const selected = Array.from(fileList.selectedOptions).map(o => Number(o.value));
  files = files.filter((_, i) => !selected.includes(i));
  refreshList();
}

async function convert() {
  if (files.length === 0) {
    alert("Δεν υπάρχουν αρχεία");
    return;
  }

  status.innerText = "⏳ Φόρτωση FFmpeg...";
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  const zip = new JSZip();

  for (const f of files) {
    status.innerText = `🎵 Μετατροπή: ${f.name}`;

    ffmpeg.FS("writeFile", f.name, await fetchFile(f));
    const out = f.name.replace(/\.m4a$/i, ".mp3");

    await ffmpeg.run("-i", f.name, out);

    const data = ffmpeg.FS("readFile", out);
    zip.file(out, data.buffer);
  }

  status.innerText = "📦 Δημιουργία ZIP...";
  const blob = await zip.generateAsync({ type: "blob" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mp3_files.zip";
  a.click();

  status.innerText = "✅ Ολοκληρώθηκε!";
}
