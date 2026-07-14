/**
 * Computes the real SHA-256 hash of a file locally using the browser's native SubtleCrypto API.
 * Includes a simulated visual progression helper to showcase the byte chunking engine.
 */
export async function calculateSHA256(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target || !event.target.result) {
          reject(new Error('Unable to read file contents.'));
          return;
        }

        const arrayBuffer = event.target.result as ArrayBuffer;
        
        // Realistic step-wise progress simulation to match government security visual style
        if (onProgress) {
          let pct = 0;
          const steps = Math.min(20, Math.ceil(file.size / 100000)); // scale increments based on size
          const intervalMs = file.size < 5000000 ? 50 : 100;
          
          const progressInterval = setInterval(() => {
            pct += Math.ceil(100 / steps);
            if (pct >= 95) {
              pct = 95;
              clearInterval(progressInterval);
            }
            onProgress(pct);
          }, intervalMs);

          // Perform actual cryptoprocessor hash
          const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          
          setTimeout(() => {
            clearInterval(progressInterval);
            onProgress(100);
            resolve(hexHash);
          }, 300);
        } else {
          const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(hexHash);
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('FileReader experienced a system exception.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Formats file size in bytes to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats date string to standard tactical locale.
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return dateString;
  }
}

/**
 * Shortens long hex hashes for standard visual display.
 */
export function shortenHash(hash: string, start = 8, end = 8): string {
  if (hash.length <= start + end) return hash;
  return `${hash.substring(0, start)}...${hash.substring(hash.length - end)}`;
}

/**
 * Generates a random cryptographic transaction hash.
 */
export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
