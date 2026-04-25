/**
 * Client-side image compression via canvas. Used for avatar uploads and
 * pasted/dropped image notes so the user never hits a "too large" wall —
 * we just transparently shrink to fit the size budget.
 *
 * Strategy:
 *   1. Decode the image. If natural dimensions exceed maxDim, scale down.
 *   2. Re-encode as JPEG with a starting quality.
 *   3. If still over the size budget, drop quality 0.1 at a time until
 *      either we fit or we hit q=0.4 (further drops look bad).
 *   4. Return a fresh Blob/data URL.
 *
 * For tiny images already under budget we still re-encode if dimensions
 * are unreasonable (>maxDim) — otherwise we short-circuit and return the
 * original file untouched to preserve transparency / animation / EXIF.
 */

export interface CompressOpts {
  /** Hard size cap in bytes (default 700 KB — well under our 800 KB budget). */
  maxBytes?: number;
  /** Largest dimension allowed; longer side scales down to this (default 1600). */
  maxDim?: number;
  /** Starting JPEG quality 0–1 (default 0.85). */
  startQuality?: number;
}

const DEFAULTS: Required<CompressOpts> = {
  maxBytes: 700 * 1024,
  maxDim: 1600,
  startQuality: 0.85,
};

/** Returns a data URL string ready to be stored in resume JSON.            */
export async function compressToDataURL(file: File | Blob, opts: CompressOpts = {}): Promise<string> {
  const o = { ...DEFAULTS, ...opts };

  // Fast-path: small image with reasonable dimensions — no work needed.
  if (file.size <= o.maxBytes) {
    const dims = await tryReadDims(file);
    if (!dims || (dims.w <= o.maxDim && dims.h <= o.maxDim)) {
      return await blobToDataURL(file);
    }
  }

  const img = await loadImage(file);
  let { w, h } = { w: img.naturalWidth, h: img.naturalHeight };
  if (w > o.maxDim || h > o.maxDim) {
    const r = Math.min(o.maxDim / w, o.maxDim / h);
    w = Math.max(1, Math.round(w * r));
    h = Math.max(1, Math.round(h * r));
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return await blobToDataURL(file); // Hopeless — give up gracefully.
  ctx.fillStyle = "#fff"; // JPEG has no alpha → flatten on white
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  let quality = o.startQuality;
  let blob = await canvasToBlob(canvas, "image/jpeg", quality);
  while (blob && blob.size > o.maxBytes && quality > 0.4) {
    quality = Math.max(0.4, quality - 0.1);
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }
  // If we *still* can't fit (very rare), shrink dimensions further once.
  if (blob && blob.size > o.maxBytes) {
    canvas.width = Math.round(w * 0.75);
    canvas.height = Math.round(h * 0.75);
    const ctx2 = canvas.getContext("2d")!;
    ctx2.fillStyle = "#fff";
    ctx2.fillRect(0, 0, canvas.width, canvas.height);
    ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
    blob = await canvasToBlob(canvas, "image/jpeg", 0.7);
  }

  return await blobToDataURL(blob ?? file);
}

function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function tryReadDims(file: File | Blob): Promise<{ w: number; h: number } | null> {
  try {
    const img = await loadImage(file);
    return { w: img.naturalWidth, h: img.naturalHeight };
  } catch {
    return null;
  }
}
