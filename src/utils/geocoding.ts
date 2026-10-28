// Utilitas Geocoding Presisi Google Maps & Kamus Koordinat Cerdas Indonesia
// Menghilangkan segala bentuk fallback statis ke "Jakarta Selatan"

export interface LatLngResult {
  lat: number;
  lng: number;
  resolvedVia: 'google_geocoder' | 'backend_geocoder' | 'smart_lookup' | 'city_center';
  formattedAddress: string;
}

// Pemetaan Kecamatan ke Kota/Kabupaten di DKI Jakarta & sekitarnya
// Memastikan jika user memasukkan "Penjaringan", sistem tahu itu adalah "Jakarta Utara"
export const KECAMATAN_TO_KOTA_MAP: Record<string, string> = {
  // === JAKARTA UTARA ===
  'penjaringan': 'Jakarta Utara',
  'pluit': 'Jakarta Utara',
  'pejagalan': 'Jakarta Utara',
  'kapuk muara': 'Jakarta Utara',
  'kamal muara': 'Jakarta Utara',
  'tanjung priok': 'Jakarta Utara',
  'sunter agung': 'Jakarta Utara',
  'sunter jaya': 'Jakarta Utara',
  'koja': 'Jakarta Utara',
  'rawabadak': 'Jakarta Utara',
  'lagoa': 'Jakarta Utara',
  'cilincing': 'Jakarta Utara',
  'marunda': 'Jakarta Utara',
  'rorotan': 'Jakarta Utara',
  'pademangan': 'Jakarta Utara',
  'ancol': 'Jakarta Utara',
  'kelapa gading': 'Jakarta Utara',
  'kelapa gading timur': 'Jakarta Utara',
  'kelapa gading barat': 'Jakarta Utara',
  'pegangsaan dua': 'Jakarta Utara',

  // === JAKARTA BARAT ===
  'grogol petamburan': 'Jakarta Barat',
  'kebon jeruk': 'Jakarta Barat',
  'palmerah': 'Jakarta Barat',
  'kembangan': 'Jakarta Barat',
  'cengkareng': 'Jakarta Barat',
  'kalideres': 'Jakarta Barat',
  'tambora': 'Jakarta Barat',
  'taman sari': 'Jakarta Barat',

  // === JAKARTA PUSAT ===
  'gambir': 'Jakarta Pusat',
  'tanah abang': 'Jakarta Pusat',
  'menteng': 'Jakarta Pusat',
  'senen': 'Jakarta Pusat',
  'cempaka putih': 'Jakarta Pusat',
  'johar baru': 'Jakarta Pusat',
  'kemayoran': 'Jakarta Pusat',
  'sawah besar': 'Jakarta Pusat',

  // === JAKARTA TIMUR ===
  'matraman': 'Jakarta Timur',
  'pulo gadung': 'Jakarta Timur',
  'jatinegara': 'Jakarta Timur',
  'duren sawit': 'Jakarta Timur',
  'kramat jati': 'Jakarta Timur',
  'makasar': 'Jakarta Timur',
  'pasar rebo': 'Jakarta Timur',
  'ciracas': 'Jakarta Timur',
  'cipayung': 'Jakarta Timur',
  'cakung': 'Jakarta Timur',

  // === JAKARTA SELATAN ===
  'cilandak': 'Jakarta Selatan',
  'kebayoran baru': 'Jakarta Selatan',
  'kebayoran lama': 'Jakarta Selatan',
  'pesanggrahan': 'Jakarta Selatan',
  'pasar minggu': 'Jakarta Selatan',
  'jagakarsa': 'Jakarta Selatan',
  'mampang prapatan': 'Jakarta Selatan',
  'pancoran': 'Jakarta Selatan',
  'tebet': 'Jakarta Selatan',
  'setiabudi': 'Jakarta Selatan',

  // === KEPULAUAN SERIBU ===
  'kepulauan seribu utara': 'Kepulauan Seribu',
  'kepulauan seribu selatan': 'Kepulauan Seribu',

  // === BODETABEK ===
  'ciputat': 'Tangerang Selatan',
  'pamulang': 'Tangerang Selatan',
  'pondok aren': 'Tangerang Selatan',
  'serpong': 'Tangerang Selatan',
  'bekasi barat': 'Kota Bekasi',
  'bekasi timur': 'Kota Bekasi',
  'bekasi selatan': 'Kota Bekasi',
  'bekasi utara': 'Kota Bekasi',
  'pancoran mas': 'Kota Depok',
  'beji': 'Kota Depok',
  'sukmajaya': 'Kota Depok',
  'bogor tengah': 'Kota Bogor',
  'bogor selatan': 'Kota Bogor',
};

// Kamus Koordinat Presisi untuk Seluruh Kecamatan & Wilayah Utama di Jakarta & Indonesia
// Memastikan bahwa input seperti "Penjaringan, Jakarta Utara" selalu tepat di titik Jakarta Utara!
export const WILAYAH_COORDINATES_DICTIONARY: Record<string, { lat: number; lng: number }> = {
  // === JAKARTA UTARA ===
  'penjaringan': { lat: -6.1264, lng: 106.7885 },
  'kecamatan penjaringan': { lat: -6.1264, lng: 106.7885 },
  'pluit': { lat: -6.1189, lng: 106.7925 },
  'pejagalan': { lat: -6.1342, lng: 106.7917 },
  'kapuk muara': { lat: -6.1305, lng: 106.7667 },
  'kamal muara': { lat: -6.1089, lng: 106.7389 },
  'tanjung priok': { lat: -6.1321, lng: 106.8715 },
  'kecamatan tanjung priok': { lat: -6.1321, lng: 106.8715 },
  'sunter agung': { lat: -6.1412, lng: 106.8625 },
  'sunter jaya': { lat: -6.1539, lng: 106.8789 },
  'koja': { lat: -6.1226, lng: 106.9067 },
  'kecamatan koja': { lat: -6.1226, lng: 106.9067 },
  'rawabadak': { lat: -6.1292, lng: 106.9014 },
  'lagoa': { lat: -6.1214, lng: 106.9142 },
  'cilincing': { lat: -6.1287, lng: 106.9419 },
  'kecamatan cilincing': { lat: -6.1287, lng: 106.9419 },
  'marunda': { lat: -6.1078, lng: 106.9742 },
  'rorotan': { lat: -6.1556, lng: 106.9642 },
  'semper barat': { lat: -6.1345, lng: 106.9234 },
  'semper timur': { lat: -6.1312, lng: 106.9389 },
  'sukapura': { lat: -6.1489, lng: 106.9312 },
  'pademangan': { lat: -6.1362, lng: 106.8407 },
  'kecamatan pademangan': { lat: -6.1362, lng: 106.8407 },
  'ancol': { lat: -6.1245, lng: 106.8317 },
  'pademangan barat': { lat: -6.1389, lng: 106.8356 },
  'pademangan timur': { lat: -6.1412, lng: 106.8478 },
  'kelapa gading': { lat: -6.1623, lng: 106.9078 },
  'kecamatan kelapa gading': { lat: -6.1623, lng: 106.9078 },
  'kelapa gading timur': { lat: -6.1656, lng: 106.9145 },
  'kelapa gading barat': { lat: -6.1589, lng: 106.8989 },
  'pegangsaan dua': { lat: -6.1692, lng: 106.9242 },
  'jakarta utara': { lat: -6.1384, lng: 106.8640 },
  'kota jakarta utara': { lat: -6.1384, lng: 106.8640 },

  // === JAKARTA BARAT ===
  'grogol petamburan': { lat: -6.1667, lng: 106.7891 },
  'kecamatan grogol petamburan': { lat: -6.1667, lng: 106.7891 },
  'tomang': { lat: -6.1756, lng: 106.7989 },
  'grogol': { lat: -6.1623, lng: 106.7894 },
  'jelambar': { lat: -6.1534, lng: 106.7845 },
  'kebon jeruk': { lat: -6.1912, lng: 106.7686 },
  'kecamatan kebon jeruk': { lat: -6.1912, lng: 106.7686 },
  'palmerah': { lat: -6.1956, lng: 106.7971 },
  'kecamatan palmerah': { lat: -6.1956, lng: 106.7971 },
  'slipi': { lat: -6.1912, lng: 106.7989 },
  'kembangan': { lat: -6.1868, lng: 106.7350 },
  'kecamatan kembangan': { lat: -6.1868, lng: 106.7350 },
  'puri indah': { lat: -6.1878, lng: 106.7345 },
  'cengkareng': { lat: -6.1528, lng: 106.7314 },
  'kecamatan cengkareng': { lat: -6.1528, lng: 106.7314 },
  'rawa buaya': { lat: -6.1612, lng: 106.7289 },
  'duri kosambi': { lat: -6.1734, lng: 106.7123 },
  'kapuk': { lat: -6.1412, lng: 106.7456 },
  'kalideres': { lat: -6.1436, lng: 106.7027 },
  'kecamatan kalideres': { lat: -6.1436, lng: 106.7027 },
  'semanan': { lat: -6.1645, lng: 106.7012 },
  'tambora': { lat: -6.1444, lng: 106.8042 },
  'kecamatan tambora': { lat: -6.1444, lng: 106.8042 },
  'roamallaka': { lat: -6.1378, lng: 106.8089 },
  'taman sari': { lat: -6.1442, lng: 106.8188 },
  'kecamatan taman sari': { lat: -6.1442, lng: 106.8188 },
  'glodok': { lat: -6.1456, lng: 106.8156 },
  'mangga besar': { lat: -6.1489, lng: 106.8245 },
  'jakarta barat': { lat: -6.1683, lng: 106.7589 },
  'kota jakarta barat': { lat: -6.1683, lng: 106.7589 },

  // === JAKARTA PUSAT ===
  'gambir': { lat: -6.1754, lng: 106.8272 },
  'kecamatan gambir': { lat: -6.1754, lng: 106.8272 },
  'tanah abang': { lat: -6.1989, lng: 106.8167 },
  'kecamatan tanah abang': { lat: -6.1989, lng: 106.8167 },
  'menteng': { lat: -6.1956, lng: 106.8378 },
  'kecamatan menteng': { lat: -6.1956, lng: 106.8378 },
  'senen': { lat: -6.1892, lng: 106.8475 },
  'kecamatan senen': { lat: -6.1892, lng: 106.8475 },
  'cempaka putih': { lat: -6.1818, lng: 106.8683 },
  'kecamatan cempaka putih': { lat: -6.1818, lng: 106.8683 },
  'johar baru': { lat: -6.1862, lng: 106.8569 },
  'kecamatan johar baru': { lat: -6.1862, lng: 106.8569 },
  'kemayoran': { lat: -6.1627, lng: 106.8557 },
  'kecamatan kemayoran': { lat: -6.1627, lng: 106.8557 },
  'sawah besar': { lat: -6.1517, lng: 106.8322 },
  'kecamatan sawah besar': { lat: -6.1517, lng: 106.8322 },
  'pasar baru': { lat: -6.1589, lng: 106.8345 },
  'jakarta pusat': { lat: -6.1818, lng: 106.8227 },
  'kota jakarta pusat': { lat: -6.1818, lng: 106.8227 },

  // === JAKARTA TIMUR ===
  'matraman': { lat: -6.2045, lng: 106.8589 },
  'kecamatan matraman': { lat: -6.2045, lng: 106.8589 },
  'pulo gadung': { lat: -6.1947, lng: 106.8967 },
  'kecamatan pulo gadung': { lat: -6.1947, lng: 106.8967 },
  'jatinegara': { lat: -6.2307, lng: 106.8778 },
  'kecamatan jatinegara': { lat: -6.2307, lng: 106.8778 },
  'duren sawit': { lat: -6.2345, lng: 106.9142 },
  'kecamatan duren sawit': { lat: -6.2345, lng: 106.9142 },
  'kramat jati': { lat: -6.2731, lng: 106.8672 },
  'kecamatan kramat jati': { lat: -6.2731, lng: 106.8672 },
  'makasar': { lat: -6.2825, lng: 106.8931 },
  'kecamatan makasar': { lat: -6.2825, lng: 106.8931 },
  'pasar rebo': { lat: -6.3214, lng: 106.8647 },
  'kecamatan pasar rebo': { lat: -6.3214, lng: 106.8647 },
  'ciracas': { lat: -6.3312, lng: 106.8789 },
  'kecamatan ciracas': { lat: -6.3312, lng: 106.8789 },
  'cipayung': { lat: -6.3245, lng: 106.9067 },
  'kecamatan cipayung': { lat: -6.3245, lng: 106.9067 },
  'cakung': { lat: -6.1878, lng: 106.9489 },
  'kecamatan cakung': { lat: -6.1878, lng: 106.9489 },
  'jakarta timur': { lat: -6.2250, lng: 106.9004 },
  'kota jakarta timur': { lat: -6.2250, lng: 106.9004 },

  // === JAKARTA SELATAN ===
  'cilandak': { lat: -6.2932, lng: 106.8016 },
  'kecamatan cilandak': { lat: -6.2932, lng: 106.8016 },
  'sukamaju': { lat: -6.2956, lng: 106.8034 },
  'kebayoran baru': { lat: -6.2444, lng: 106.7997 },
  'kecamatan kebayoran baru': { lat: -6.2444, lng: 106.7997 },
  'kebayoran lama': { lat: -6.2492, lng: 106.7778 },
  'kecamatan kebayoran lama': { lat: -6.2492, lng: 106.7778 },
  'pesanggrahan': { lat: -6.2489, lng: 106.7583 },
  'kecamatan pesanggrahan': { lat: -6.2489, lng: 106.7583 },
  'pasar minggu': { lat: -6.2889, lng: 106.8389 },
  'kecamatan pasar minggu': { lat: -6.2889, lng: 106.8389 },
  'jagakarsa': { lat: -6.3342, lng: 106.8286 },
  'kecamatan jagakarsa': { lat: -6.3342, lng: 106.8286 },
  'mampang prapatan': { lat: -6.2558, lng: 106.8272 },
  'kecamatan mampang prapatan': { lat: -6.2558, lng: 106.8272 },
  'pancoran': { lat: -6.2514, lng: 106.8475 },
  'kecamatan pancoran': { lat: -6.2514, lng: 106.8475 },
  'tebet': { lat: -6.2317, lng: 106.8539 },
  'kecamatan tebet': { lat: -6.2317, lng: 106.8539 },
  'setiabudi': { lat: -6.2167, lng: 106.8317 },
  'kecamatan setiabudi': { lat: -6.2167, lng: 106.8317 },
  'jakarta selatan': { lat: -6.2615, lng: 106.8106 },
  'kota jakarta selatan': { lat: -6.2615, lng: 106.8106 },

  // === KEPULAUAN SERIBU ===
  'kepulauan seribu': { lat: -5.6122, lng: 106.5623 },
  'pulau kelapa': { lat: -5.6512, lng: 106.5612 },
  'pulau panggang': { lat: -5.7412, lng: 106.6012 },
  'pulau tidung': { lat: -5.7989, lng: 106.5234 },
  'pulau pari': { lat: -5.8612, lng: 106.6234 },

  // === KOTA-KOTA LAIN DI INDONESIA ===
  'tangerang': { lat: -6.1783, lng: 106.6319 },
  'tangerang selatan': { lat: -6.2889, lng: 106.7178 },
  'bekasi': { lat: -6.2383, lng: 106.9756 },
  'depok': { lat: -6.4025, lng: 106.7942 },
  'bogor': { lat: -6.5971, lng: 106.8060 },
  'bandung': { lat: -6.9175, lng: 107.6191 },
  'surabaya': { lat: -7.2575, lng: 112.7521 },
  'semarang': { lat: -6.9667, lng: 110.4167 },
  'medan': { lat: 3.5952, lng: 98.6722 },
  'makassar': { lat: -5.1477, lng: 119.4327 },
  'yogyakarta': { lat: -7.7956, lng: 110.3695 },
  'denpasar': { lat: -8.6705, lng: 115.2126 },
  'palembang': { lat: -2.9761, lng: 104.7754 },
  'batam': { lat: 1.0456, lng: 104.0305 },
  'pekanbaru': { lat: 0.5071, lng: 101.4478 },
  'padang': { lat: -0.9471, lng: 100.4172 },
  'bandar lampung': { lat: -5.3971, lng: 105.2668 },
  'malang': { lat: -7.9666, lng: 112.6326 },
  'surakarta': { lat: -7.5755, lng: 110.8243 },
  'solo': { lat: -7.5755, lng: 110.8243 },
};

// Normalisasi string untuk pencarian kamus
export function cleanWilayahKey(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/^(kota|kabupaten|kab\.|kecamatan|kec\.|kelurahan|kel\.|desa)\s+/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/**
 * Infer Kota/Kabupaten berdasarkan nama Kecamatan jika kota tidak diisi atau hanya tertulis 'DKI Jakarta'
 * Contoh: "Penjaringan" -> "Jakarta Utara"
 */
export function inferKotaFromKecamatan(kecamatan?: string, currentKota?: string): string {
  const cKota = (currentKota || '').trim();
  // If currentKota is already a specific valid city and not generic DKI Jakarta or empty:
  if (
    cKota &&
    cKota.toLowerCase() !== 'dki jakarta' &&
    cKota.toLowerCase() !== 'jakarta' &&
    !cKota.toLowerCase().includes('belum')
  ) {
    return cKota;
  }

  const cleanKec = cleanWilayahKey(kecamatan);
  if (!cleanKec) return cKota || '';

  // Direct map check
  if (KECAMATAN_TO_KOTA_MAP[cleanKec]) {
    return KECAMATAN_TO_KOTA_MAP[cleanKec];
  }

  // Partial match check
  for (const [key, kota] of Object.entries(KECAMATAN_TO_KOTA_MAP)) {
    if (cleanKec.includes(key) || key.includes(cleanKec)) {
      return kota;
    }
  }

  return cKota || '';
}

// Lookup cerdas tanpa pernah memaksakan ke "Jakarta Selatan"
export function lookupSmartCoordinates(
  kelurahan?: string,
  kecamatan?: string,
  kota?: string
): { lat: number; lng: number } | null {
  const kelKey = cleanWilayahKey(kelurahan);
  const kecKey = cleanWilayahKey(kecamatan);
  const kotaKey = cleanWilayahKey(kota);

  // 1. Coba cari berdasarkan nama kelurahan spesifik
  if (kelKey && WILAYAH_COORDINATES_DICTIONARY[kelKey]) {
    return WILAYAH_COORDINATES_DICTIONARY[kelKey];
  }

  // 2. Coba cari berdasarkan nama kecamatan
  if (kecKey && WILAYAH_COORDINATES_DICTIONARY[kecKey]) {
    return WILAYAH_COORDINATES_DICTIONARY[kecKey];
  }

  // 3. Coba cari kecamatan dengan prefix
  const kecFullKey = `kecamatan ${kecKey}`;
  if (WILAYAH_COORDINATES_DICTIONARY[kecFullKey]) {
    return WILAYAH_COORDINATES_DICTIONARY[kecFullKey];
  }

  // 4. Inferred kota dari kecamatan
  const inferred = inferKotaFromKecamatan(kecamatan, kota);
  const inferredKey = cleanWilayahKey(inferred);
  if (inferredKey && WILAYAH_COORDINATES_DICTIONARY[inferredKey]) {
    return WILAYAH_COORDINATES_DICTIONARY[inferredKey];
  }

  // 5. Coba cari berdasarkan kota/kabupaten
  if (kotaKey && WILAYAH_COORDINATES_DICTIONARY[kotaKey]) {
    return WILAYAH_COORDINATES_DICTIONARY[kotaKey];
  }

  // 6. Partial substring matches
  for (const [key, coords] of Object.entries(WILAYAH_COORDINATES_DICTIONARY)) {
    if (kecKey && key.includes(kecKey)) return coords;
    if (kelKey && key.includes(kelKey)) return coords;
    if (kotaKey && key.includes(kotaKey)) return coords;
  }

  return null;
}

/**
 * Format alamat standar untuk Geocoder:
 * "{Kelurahan}, Kecamatan {Kecamatan}, {Kota/Kabupaten}, Indonesia"
 * Contoh: "Penjaringan, Kecamatan Penjaringan, Jakarta Utara, Indonesia"
 */
export function formatWilayahAddress(params: {
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
}): string {
  const { kelurahan = '', kecamatan = '', kota = '', provinsi = '' } = params;
  const inferredKota = inferKotaFromKecamatan(kecamatan, kota) || kota.trim();

  const parts: string[] = [];
  const cleanKel = kelurahan.trim().replace(/^(kelurahan|kel\.|desa)\s+/i, '');
  const cleanKec = kecamatan.trim().replace(/^kecamatan\s+/i, '');

  if (cleanKel) {
    parts.push(cleanKel);
  }
  if (cleanKec) {
    parts.push(`Kecamatan ${cleanKec}`);
  }
  if (inferredKota) {
    parts.push(inferredKota);
  }
  if (provinsi.trim() && !inferredKota.toLowerCase().includes(provinsi.toLowerCase())) {
    parts.push(provinsi.trim());
  }
  parts.push('Indonesia');

  return parts.join(', ');
}

/**
 * Resolves accurate coordinates via Google Maps Geocoder API with fallback to Indonesia Dictionary.
 * Strictly respects the provided region (e.g. Penjaringan, Jakarta Utara -> -6.1264, 106.7885).
 * Never forces a fallback to Jakarta Selatan.
 */
export async function resolveAccurateCoordinates(params: {
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  existingLat?: number;
  existingLng?: number;
}): Promise<LatLngResult> {
  const { kelurahan = '', kecamatan = '', kota = '', provinsi = '', existingLat, existingLng } = params;

  // Infer actual city (e.g. Penjaringan -> Jakarta Utara)
  const accurateKota = inferKotaFromKecamatan(kecamatan, kota) || kota.trim();

  // Build specific query format: "{Kelurahan}, Kecamatan {Kecamatan}, {Kota/Kabupaten}, Indonesia"
  const formattedAddress = formatWilayahAddress({
    kelurahan,
    kecamatan,
    kota: accurateKota,
    provinsi,
  });

  // 1. Check if existing coordinates are already specific and non-default
  // Detect and reject any historical erroneous Jakarta Selatan static coordinates (-6.2615, 106.8106)
  const isErroneousJakselFallback =
    existingLat !== undefined &&
    Math.abs(existingLat - -6.2615) < 0.005 &&
    existingLng !== undefined &&
    Math.abs(existingLng - 106.8106) < 0.005 &&
    !accurateKota.toLowerCase().includes('selatan') &&
    !kecamatan.toLowerCase().includes('cilandak');

  if (existingLat && existingLng && !isErroneousJakselFallback) {
    return {
      lat: existingLat,
      lng: existingLng,
      resolvedVia: 'smart_lookup',
      formattedAddress,
    };
  }

  // 2. Pre-check dictionary for exact high-precision coordinate
  const smartMatch = lookupSmartCoordinates(kelurahan, kecamatan, accurateKota);

  // 3. Try Google Maps JavaScript Geocoder API if available in browser
  if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      const response = await new Promise<any>((resolve, reject) => {
        geocoder.geocode(
          {
            address: formattedAddress,
            componentRestrictions: { country: 'ID' },
          },
          (results: any[], status: string) => {
            if (status === 'OK' && results && results.length > 0) {
              resolve(results[0]);
            } else {
              reject(new Error(`Geocoder status: ${status}`));
            }
          }
        );
      });

      if (response?.geometry?.location) {
        const lat =
          typeof response.geometry.location.lat === 'function'
            ? response.geometry.location.lat()
            : response.geometry.location.lat;
        const lng =
          typeof response.geometry.location.lng === 'function'
            ? response.geometry.location.lng()
            : response.geometry.location.lng;

        return {
          lat: Number(Number(lat).toFixed(6)),
          lng: Number(Number(lng).toFixed(6)),
          resolvedVia: 'google_geocoder',
          formattedAddress: response.formatted_address || formattedAddress,
        };
      }
    } catch (e) {
      // Continue to next fallbacks
      console.warn('[Geocoding] Browser Google Geocoder fallback:', e);
    }
  }

  // 4. Try Backend Geocoding Proxy (/api/geocode)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(formattedAddress)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.lat && json.lng) {
          return {
            lat: Number(Number(json.lat).toFixed(6)),
            lng: Number(Number(json.lng).toFixed(6)),
            resolvedVia: 'backend_geocoder',
            formattedAddress: json.formattedAddress || formattedAddress,
          };
        }
      }
    } catch (e) {
      console.warn('[Geocoding] Backend geocoder proxy skipped:', e);
    }
  }

  // 5. Fallback: Lookup in accurate Indonesia dictionary
  if (smartMatch) {
    // Add micro jitter (0.0005 - 0.001 deg ~ 50-100m) so multiple voters don't completely overlap on exact same pixel
    const jitterLat = (Math.random() - 0.5) * 0.002;
    const jitterLng = (Math.random() - 0.5) * 0.002;

    return {
      lat: Number((smartMatch.lat + jitterLat).toFixed(6)),
      lng: Number((smartMatch.lng + jitterLng).toFixed(6)),
      resolvedVia: 'smart_lookup',
      formattedAddress,
    };
  }

  // 6. Default to Monas Jakarta Pusat (Indonesia center) ONLY if no other match found, NEVER force Jakarta Selatan!
  const defaultIndo = { lat: -6.1754, lng: 106.8272 };
  return {
    lat: defaultIndo.lat,
    lng: defaultIndo.lng,
    resolvedVia: 'city_center',
    formattedAddress,
  };
}
