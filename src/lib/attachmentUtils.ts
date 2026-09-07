/**
 * Utilidades para manejo, formato y descarga segura de archivos adjuntos
 */

export const MAX_ATTACHMENT_SIZE_BYTES = 3.5 * 1024 * 1024; // 3.5 MB por archivo para compatibilidad local
export const MAX_ATTACHMENT_SIZE_LABEL = "3.5 MB";

/**
 * Formatea el tamaño del archivo en unidades legibles (B, KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Convierte un objeto File en Base64 Data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Formato de lectura inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Obtiene la extensión en minúsculas
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

export type FileCategory = 'pdf' | 'excel' | 'word' | 'image' | 'archive' | 'text' | 'generic';

/**
 * Clasifica el tipo de archivo para asignarle un estilo visual distintivo
 */
export function getFileCategory(filename: string, mimeType = ''): FileCategory {
  const ext = getFileExtension(filename);
  const mime = mimeType.toLowerCase();

  if (ext === 'pdf' || mime.includes('pdf')) return 'pdf';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || mime.includes('sheet') || mime.includes('csv') || mime.includes('excel')) return 'excel';
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext) || mime.includes('word') || mime.includes('document')) return 'word';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp'].includes(ext) || mime.startsWith('image/')) return 'image';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) return 'archive';
  if (['txt', 'md', 'json', 'log'].includes(ext) || mime.startsWith('text/')) return 'text';

  return 'generic';
}

/**
 * Descarga directamente el archivo al ordenador del usuario
 */
export function downloadAttachment(attachment: { name: string; dataUrl: string }) {
  try {
    const link = document.createElement('a');
    link.href = attachment.dataUrl;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Error al descargar archivo adjunto:', err);
    alert('No se pudo descargar el archivo adjunto.');
  }
}

/**
 * Abre el archivo en una nueva pestaña (útil para PDFs o imágenes)
 */
export function openAttachmentInNewTab(attachment: { name: string; dataUrl: string; type?: string }) {
  try {
    const win = window.open();
    if (win) {
      if (attachment.dataUrl.startsWith('data:image/')) {
        win.document.write(
          `<html><head><title>${attachment.name}</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;background:#0f172a;min-height:100vh;"><img src="${attachment.dataUrl}" style="max-width:95vw;max-height:95vh;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);object-fit:contain;"/></body></html>`
        );
      } else {
        win.location.href = attachment.dataUrl;
      }
    } else {
      downloadAttachment(attachment);
    }
  } catch (e) {
    downloadAttachment(attachment);
  }
}
