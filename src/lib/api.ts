/**
 * api.ts - Konfigurasi URL API terpusat & Fetch Interceptor
 * 
 * Mengatasi perbedaan penamaan field (camelCase vs snake_case) 
 * dan perbedaan enum (UPPERCASE vs lowercase) antara Frontend dan Node.js Backend.
 */

export const API_URL = import.meta.env.VITE_API_URL || 'https://bank-sampahbpi.vercel.app/api';

// Helper: Ubah camelCase ke snake_case untuk properti tertentu
function camelToSnakeKey(key: string): string {
  const snakeKeys: Record<string, string> = {
    rekeningBank: 'rekening_bank',
    nomorRekening: 'nomor_rekening',
    namaRekening: 'nama_rekening',
    rekeningTujuan: 'rekening_tujuan',
    nomorTujuan: 'nomor_tujuan',
    namaTujuan: 'nama_tujuan',
    processedBy: 'processed_by',
    processedAt: 'processed_at'
  };
  return snakeKeys[key] || key;
}

// Helper: Ubah snake_case ke camelCase untuk properti tertentu saat mengirim ke backend
const camelKeys: Record<string, string> = {
  rekening_bank: 'rekeningBank',
  nomor_rekening: 'nomorRekening',
  nama_rekening: 'namaRekening',
  rekening_tujuan: 'rekeningTujuan',
  nomor_tujuan: 'nomorTujuan',
  nama_tujuan: 'namaTujuan',
  processed_by: 'processedBy',
  processed_at: 'processedAt'
};

// Helper: Konversi nilai enum dari UPPERCASE ke lowercase
const uppercaseEnums = [
  'NASABAH', 'PETUGAS', 'PENGURUS',
  'ORGANIK', 'ANORGANIK', 'B3', 'LAINNYA',
  'SETOR', 'TARIK', 'JUAL',
  'PENDING', 'SUCCESS', 'CANCELLED',
  'EDUKASI', 'KEGIATAN', 'PENGUMUMAN',
  'DRAFT', 'PUBLISHED',
  'PAGI', 'SIANG', 'SORE',
  'PROCESSED'
];

// Helper: Konversi nilai enum dari lowercase ke UPPERCASE
const lowercaseEnums: Record<string, string> = {
  nasabah: 'NASABAH',
  petugas: 'PETUGAS',
  pengurus: 'PENGURUS',
  organik: 'ORGANIK',
  anorganik: 'ANORGANIK',
  b3: 'B3',
  lainnya: 'LAINNYA',
  setor: 'SETOR',
  tarik: 'TARIK',
  jual: 'JUAL',
  pending: 'PENDING',
  success: 'SUCCESS',
  cancelled: 'CANCELLED',
  edukasi: 'EDUKASI',
  kegiatan: 'KEGIATAN',
  pengumuman: 'PENGUMUMAN',
  draft: 'DRAFT',
  published: 'PUBLISHED',
  pagi: 'PAGI',
  siang: 'SIANG',
  sore: 'SORE',
  processed: 'PROCESSED'
};

// Fungsi rekursif untuk memetakan kunci dan nilai dari respons backend (camelCase -> snake_case & UPPERCASE -> lowercase)
function deepMapKeys(obj: any, fn: (key: string) => string): any {
  if (Array.isArray(obj)) {
    return obj.map(val => deepMapKeys(val, fn));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const mappedKey = fn(key);
      let val = obj[key];
      
      if (typeof val === 'string' && uppercaseEnums.includes(val)) {
        val = val.toLowerCase();
      }
      
      acc[mappedKey] = deepMapKeys(val, fn);
      return acc;
    }, {});
  }
  return obj;
}

// Fungsi rekursif untuk memetakan kunci dan nilai request payload (snake_case -> camelCase & lowercase -> UPPERCASE)
function mapRequestData(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(val => mapRequestData(val));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const mappedKey = camelKeys[key] || key;
      let val = obj[key];
      
      if (typeof val === 'string' && lowercaseEnums[val] !== undefined) {
        val = lowercaseEnums[val];
      }
      
      acc[mappedKey] = mapRequestData(val);
      return acc;
    }, {});
  }
  return obj;
}

// Rewrite URL lama .php ke endpoint Node.js REST
function rewriteUrlAndOptions(url: string, options?: RequestInit): { url: string, options?: RequestInit } {
  let rewrittenUrl = url;
  let newOptions = options ? { ...options } : undefined;

  const phpToNodeRoutes: Record<string, string> = {
    '/login.php': '/api/auth/login',
    '/register.php': '/api/auth/register',
    '/nasabah.php': '/api/nasabah',
    '/transaksi.php': '/api/transaksi',
    '/sampah.php': '/api/sampah',
    '/berita.php': '/api/berita',
    '/notifikasi.php': '/api/notifikasi',
    '/penjemputan.php': '/api/penjemputan',
    '/stats.php': '/api/transaksi/stats',
  };

  // 1. Ganti .php path dengan clean REST path
  for (const [phpRoute, cleanRoute] of Object.entries(phpToNodeRoutes)) {
    if (rewrittenUrl.includes(phpRoute)) {
      rewrittenUrl = rewrittenUrl.replace(phpRoute, cleanRoute);
      break;
    }
  }

  // Cegah duplikasi /api/api/ jika API_URL sudah diakhiri dengan /api
  if (rewrittenUrl.includes('/api/api/')) {
    rewrittenUrl = rewrittenUrl.replace('/api/api/', '/api/');
  }

  const method = newOptions?.method?.toUpperCase() || 'GET';

  // 2. Jika GET dan memiliki parameter `id` di query (misal: /api/nasabah?id=NS-123), rewrite ke path param /api/nasabah/NS-123
  if (method === 'GET') {
    try {
      const urlObj = new URL(rewrittenUrl, window.location.origin);
      const id = urlObj.searchParams.get('id');
      
      const resourceRoutes = ['/api/nasabah', '/api/sampah', '/api/berita', '/api/notifikasi', '/api/penjemputan', '/api/transaksi'];
      const matchedRoute = resourceRoutes.find(route => urlObj.pathname === route);
      
      if (id && matchedRoute) {
        urlObj.pathname = `${matchedRoute}/${id}`;
        urlObj.searchParams.delete('id');
        rewrittenUrl = urlObj.pathname + urlObj.search;
        if (rewrittenUrl.startsWith('/')) {
          const originalUrlObj = new URL(url, window.location.origin);
          rewrittenUrl = originalUrlObj.origin + rewrittenUrl;
        }
      }
    } catch (e) {
      // Abaikan jika parsing gagal (misal path relatif)
    }
  }

  // 3. Jika PUT atau DELETE, cek apakah ID ada di request body, lalu pindahkan ke URL path param
  if ((method === 'PUT' || method === 'DELETE') && newOptions?.body) {
    try {
      const bodyText = newOptions.body as string;
      const bodyObj = JSON.parse(bodyText);
      const id = bodyObj.id;
      
      const resourceRoutes = ['/api/nasabah', '/api/sampah', '/api/berita', '/api/notifikasi', '/api/penjemputan', '/api/transaksi'];
      const urlObj = new URL(rewrittenUrl, window.location.origin);
      const matchedRoute = resourceRoutes.find(route => urlObj.pathname === route);
      
      if (id && matchedRoute) {
        urlObj.pathname = `${matchedRoute}/${id}`;
        rewrittenUrl = urlObj.pathname + urlObj.search;
        if (rewrittenUrl.startsWith('/')) {
          const originalUrlObj = new URL(url, window.location.origin);
          rewrittenUrl = originalUrlObj.origin + rewrittenUrl;
        }
        
        if (method === 'DELETE') {
          // DELETE tidak membutuhkan request body di Node.js REST
          delete newOptions.body;
        } else {
          // Untuk PUT, konversi data ke camelCase/UPPERCASE
          const mappedBody = mapRequestData(bodyObj);
          delete mappedBody.id; // hapus id dari body karena sudah ada di URL
          newOptions.body = JSON.stringify(mappedBody);
        }
      } else {
        newOptions.body = JSON.stringify(mapRequestData(bodyObj));
      }
    } catch (e) {
      console.warn('[Fetch Interceptor] Gagal parsing request body:', e);
    }
  } else if (method === 'POST' && newOptions?.body) {
    try {
      const bodyText = newOptions.body as string;
      const bodyObj = JSON.parse(bodyText);
      newOptions.body = JSON.stringify(mapRequestData(bodyObj));
    } catch (e) {
      // Abaikan jika bukan JSON string
    }
  }

  return { url: rewrittenUrl, options: newOptions };
}

// Inisialisasi global fetch interceptor
const originalFetch = window.fetch;
window.fetch = async function (url: RequestInfo | URL, options?: RequestInit) {
  const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.toString() : (url as Request).url;
  
  // Terapkan interceptor hanya untuk request ke backend API
  if (urlStr.includes('/api') || urlStr.includes('.php') || urlStr.includes(API_URL)) {
    const rewritten = rewriteUrlAndOptions(urlStr, options);
    
    try {
      const response = await originalFetch(rewritten.url, rewritten.options);
      
      if (!response.ok) {
        // Jika response berisi JSON error, map isinya juga agar status: 'error' terbaca
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          try {
            const json = JSON.parse(text);
            const mappedJson = deepMapKeys(json, camelToSnakeKey);
            return new Response(JSON.stringify(mappedJson), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          } catch {
            return new Response(text, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          }
        }
        return response;
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          const mappedJson = deepMapKeys(json, camelToSnakeKey);
          
          return new Response(JSON.stringify(mappedJson), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        } catch (e) {
          return new Response(text, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        }
      }
      
      return response;
    } catch (err) {
      console.error('[Fetch Interceptor] Koneksi error:', err);
      throw err;
    }
  }
  
  return originalFetch(url, options);
};

/** Helper fetch dengan default headers JSON (tetap dipertahankan untuk backward compatibility) */
export async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = `${API_URL}/${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}
