export interface ProcessedPhoto {
  file: File;
  previewUrl: string;
  originalName: string;
  originalSize: number;
  processedSize: number;
  width: number;
  height: number;
}

export const MAX_PHOTO_DIMENSION = 1800; // Optimal for dog passport profiles
export const TARGET_MAX_BYTES = 1.5 * 1024 * 1024; // 1.5 MB
export const HARD_LIMIT_BYTES = 3 * 1024 * 1024; // 3 MB Supabase limit

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

/**
 * Checks if a file has an accepted image type or extension.
 */
export function isSupportedPhotoFormat(file: File): boolean {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase())) return true;
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

/**
 * Checks if a file is HEIC / HEIF format.
 */
export function isHeicFormat(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

/**
 * Calculates proportionally scaled dimensions maintaining aspect ratio.
 */
export function calculateTargetDimensions(
  width: number,
  height: number,
  maxDimension: number = MAX_PHOTO_DIMENSION,
): { width: number; height: number } {
  if (width <= 0 || height <= 0) {
    return { width: maxDimension, height: maxDimension };
  }

  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const ratio = width / height;
  if (width >= height) {
    const targetWidth = maxDimension;
    const targetHeight = Math.round(maxDimension / ratio);
    return { width: targetWidth, height: targetHeight };
  } else {
    const targetHeight = maxDimension;
    const targetWidth = Math.round(maxDimension * ratio);
    return { width: targetWidth, height: targetHeight };
  }
}

/**
 * Loads an image from a Blob/File safely in the browser.
 */
async function decodeImageSource(
  file: File,
): Promise<{ source: ImageBitmap | HTMLImageElement; width: number; height: number; close: () => void }> {
  // 1. Try createImageBitmap if available (fast and respects EXIF orientation)
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // If createImageBitmap fails (e.g., unsupported format or browser bug), fall back to HTMLImageElement
    }
  }

  // 2. Fallback to HTMLImageElement
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        close: () => URL.revokeObjectURL(url),
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      if (isHeicFormat(file)) {
        reject(
          new Error("No pudimos procesar esta foto. Intenta elegir otra imagen o guardarla como JPG."),
        );
      } else {
        reject(
          new Error("No pudimos procesar esta foto. Intenta elegir otra imagen o guardarla como JPG."),
        );
      }
    };

    img.src = url;
  });
}

/**
 * Robust client-side photo preparation pipeline.
 * Resizes 48MP/heavy phone camera photos, corrects orientation, and compresses to JPEG.
 */
export async function processDogPhoto(file: File): Promise<ProcessedPhoto> {
  if (!file) {
    throw new Error("No se seleccionó ningún archivo.");
  }

  if (!isSupportedPhotoFormat(file)) {
    throw new Error(
      "Formato no compatible. Por favor elige una foto en formato JPG, PNG, WebP o HEIC.",
    );
  }

  let decoded;
  try {
    decoded = await decodeImageSource(file);
  } catch (err) {
    if (isHeicFormat(file)) {
      throw new Error(
        "No pudimos procesar esta foto. Intenta elegir otra imagen o guardarla como JPG.",
      );
    }
    throw new Error(
      err instanceof Error && err.message.includes("No pudimos")
        ? err.message
        : "No pudimos procesar esta foto. Intenta elegir otra imagen o guardarla como JPG.",
    );
  }

  try {
    const { source, width: origWidth, height: origHeight, close } = decoded;
    const { width: targetWidth, height: targetHeight } = calculateTargetDimensions(
      origWidth,
      origHeight,
      MAX_PHOTO_DIMENSION,
    );

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      close();
      throw new Error("El navegador no soporta el procesamiento de imágenes.");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source as CanvasImageSource, 0, 0, targetWidth, targetHeight);
    close();

    // Compress to JPEG blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error("No pudimos comprimir la imagen."));
        },
        "image/jpeg",
        0.85,
      );
    });

    // If still over target, re-compress with slightly lower quality
    let finalBlob = blob;
    if (finalBlob.size > TARGET_MAX_BYTES) {
      const secondPass = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.75);
      });
      if (secondPass && secondPass.size < finalBlob.size) {
        finalBlob = secondPass;
      }
    }

    // Generate clean filename with .jpg extension
    const baseName = file.name.replace(/\.[^.]+$/, "") || "perro";
    const cleanFileName = `${baseName}.jpg`;

    const processedFile = new File([finalBlob], cleanFileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    const previewUrl = URL.createObjectURL(processedFile);

    return {
      file: processedFile,
      previewUrl,
      originalName: file.name,
      originalSize: file.size,
      processedSize: processedFile.size,
      width: targetWidth,
      height: targetHeight,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("No pudimos")) {
      throw error;
    }
    throw new Error("No pudimos procesar esta foto. Intenta elegir otra imagen o guardarla como JPG.");
  }
}
