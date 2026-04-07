// Core conversion logic using Canvas API

export const FORMATS = [
  { id: "image/png",  ext: "png",  label: "PNG",  note: "Transparência" },
  { id: "image/jpeg", ext: "jpg",  label: "JPG",  note: "Fotos" },
  { id: "image/webp", ext: "webp", label: "WEBP", note: "Web moderno" },
  { id: "image/gif",  ext: "gif",  label: "GIF",  note: "Animado" },
  { id: "image/bmp",  ext: "bmp",  label: "BMP",  note: "Sem compressão" },
  { id: "ico",        ext: "ico",  label: "ICO",  note: "Ícones" },
  { id: "image/tiff", ext: "tiff", label: "TIFF", note: "Alta qualidade" },
  { id: "image/svg+xml", ext: "svg", label: "SVG", note: "Vetorial" },
];

export const INPUT_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.ico,.svg";

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
    img.src = url;
  });
}

async function convertToIco(img, quality) {
  // ICO: render as 256x256 PNG-in-ICO (most compatible)
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  // Return as PNG blob (browsers don't produce real .ico, but file is valid for favicon use)
  return new Promise((res) => canvas.toBlob(res, "image/png", quality));
}

async function convertToSvg(img) {
  // Embed raster into SVG wrapper
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  canvas.getContext("2d").drawImage(img, 0, 0);
  const dataUrl = canvas.toDataURL("image/png");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}">
  <image href="${dataUrl}" width="${img.naturalWidth}" height="${img.naturalHeight}"/>
</svg>`;
  return new Blob([svg], { type: "image/svg+xml" });
}

export async function convertImage(file, targetFormat, quality = 0.92) {
  const img = await loadImage(file);

  if (targetFormat === "ico") return convertToIco(img, quality);
  if (targetFormat === "image/svg+xml") return convertToSvg(img);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");

  // Fill white background for formats that don't support transparency
  if (targetFormat === "image/jpeg" || targetFormat === "image/bmp" || targetFormat === "image/tiff") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  // TIFF: Canvas can't produce real TIFF, deliver as high-quality PNG with .tiff extension
  const mimeForCanvas = targetFormat === "image/tiff" ? "image/png" : targetFormat;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Falha na conversão.")),
      mimeForCanvas,
      quality
    );
  });
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function getFormatById(id) {
  return FORMATS.find(f => f.id === id) || FORMATS[0];
}
