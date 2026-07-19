// Comprime y redimensiona una imagen en el navegador (canvas) antes de subirla.
// No depende de ninguna librería externa ni de un backend: todo ocurre en el cliente.

interface CompressImageOptions {
  /** Lado más largo permitido, en píxeles. Por defecto 1600. */
  maxDimension?: number;
  /** Calidad de compresión JPEG, de 0 a 1. Por defecto 0.8. */
  quality?: number;
}

/**
 * Recibe el File original que el usuario seleccionó y devuelve una versión
 * comprimida en JPEG (redimensionada si excede `maxDimension`).
 *
 * Es defensivo a propósito: si algo falla, o si el resultado comprimido
 * termina pesando igual o más que el original, se devuelve el archivo
 * original sin modificar — nunca empeora lo que el usuario ya tenía.
 */
export async function compressImage(
  file: File,
  { maxDimension = 1600, quality = 0.8 }: CompressImageOptions = {}
): Promise<File> {
  // Si no es una imagen (o es un formato que el navegador no puede decodificar
  // en canvas, como algunos .heic de iPhone sin conversión previa), no tocamos nada.
  if (!file.type.startsWith("image/")) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);

    let { width, height } = bitmap;
    if (width > maxDimension || height > maxDimension) {
      const scale = maxDimension / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );

    if (!blob) return file;

    // Si la "compresión" salió más pesada que el original, no vale la pena: nos quedamos con el original.
    if (blob.size >= file.size) return file;

    const compressedName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
    return new File([blob], compressedName, { type: "image/jpeg" });
  } catch (error) {
    console.error("No se pudo comprimir la imagen, se usará el archivo original:", error);
    return file;
  }
}