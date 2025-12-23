<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8">
<title>M4A σε MP3</title>
<script src="https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.11.0/jszip.min.js"></script>
</head>
<body>
<h2>Μετατροπή M4A σε MP3</h2>

<input type="file" id="files" multiple accept=".m4a"><br><br>
<select id="fileList" size="5" style="width:300px;"></select><br><br>
<button id="removeBtn">Αφαίρεση επιλεγμένων</button>
<button id="convertBtn">Μετατροπή</button>

<p id="status"></p>

<script>
const { createFFmpeg, fetchFile } = FFmpeg;

const ffmpeg = createFFmpeg({
  log: true,
  corePath: "https://unpkg.com/@ffmpeg/core@0.11.6/dist/ffmpeg-core.js"
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

    await ffmpeg.run("-i", f.name, "-q:a", "0", out); // -q:a 0 για καλύτερη ποιότητα MP3

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
</script>
</body>
</html>
