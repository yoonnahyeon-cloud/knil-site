// Shrinks a photo picked on the phone before it is stored. The preview keeps
// images in browser storage, which is small, so 480px JPEGs are plenty.
export function resizeImage(file: File, max = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function normalizeUrl(url: string) {
  const u = url.trim();
  if (!u) return "";
  return /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`;
}
