import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { VoterOcrRecord, DptVoterRecord, FormC1Upload, FormB1Upload } from '../types/vore';
import { TimSuksesWilayahRecord } from '../data/petaSuaraData';

const STORAGE_KEYS = {
  VOTERS: 'swaraku_voter_records',
  DPTS: 'swaraku_dpt_list',
  C1: 'swaraku_c1_records',
  B1: 'swaraku_b1_records',
  ASPIRASI: 'swaraku_aspirasi_list',
  SURVEY: 'swaraku_survey_list',
  BLAZT: 'swaraku_blazt_logs',
  TIM_SUKSES: 'swaraku_timsukses_list',
};

// 1. Get initial data from localStorage
export function getLocalStoredData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    return parsed ?? defaultValue;
  } catch (err) {
    console.warn(`Error reading localStorage for key ${key}:`, err);
    return defaultValue;
  }
}

// 2. Set data to localStorage
export function setLocalStoredData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing to localStorage for key ${key}:`, err);
  }
}

// 3. Save Voter to LocalStorage, Firestore, and Cloud SQL
export async function syncSaveVoter(
  voter: VoterOcrRecord,
  dptRecord?: DptVoterRecord
): Promise<void> {
  // A. LocalStorage Immediate Save (Ensures offline & localhost resilience)
  if (typeof window !== 'undefined') {
    try {
      const currentVoters = getLocalStoredData<VoterOcrRecord[]>(STORAGE_KEYS.VOTERS, []);
      const updatedVoters = [voter, ...currentVoters.filter((v) => v.nik !== voter.nik)];
      setLocalStoredData(STORAGE_KEYS.VOTERS, updatedVoters);

      if (dptRecord) {
        const currentDpts = getLocalStoredData<DptVoterRecord[]>(STORAGE_KEYS.DPTS, []);
        const updatedDpts = [dptRecord, ...currentDpts.filter((d) => d.nik !== dptRecord.nik)];
        setLocalStoredData(STORAGE_KEYS.DPTS, updatedDpts);
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // B. Firestore Persistence
  try {
    const cleanNik = voter.nik.replace(/\D/g, '') || String(Date.now());
    const voterDocRef = doc(firestore, 'voters', cleanNik);
    await setDoc(voterDocRef, {
      ...voter,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (firestoreErr) {
    console.warn('Firestore voter sync notice (may be offline):', firestoreErr);
  }

  // C. Cloud SQL Backend Persistence
  try {
    await fetch('/api/voters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voter),
    });
  } catch (apiErr) {
    console.warn('Backend API /api/voters sync notice:', apiErr);
  }
}

// 4. Save Form C1 to LocalStorage, Firestore, and State
export async function syncSaveC1(c1: FormC1Upload): Promise<void> {
  // A. LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const currentC1 = getLocalStoredData<FormC1Upload[]>(STORAGE_KEYS.C1, []);
      const updatedC1 = [c1, ...currentC1.filter((item) => item.id !== c1.id)];
      setLocalStoredData(STORAGE_KEYS.C1, updatedC1);
    } catch (e) {
      console.warn('LocalStorage C1 save error:', e);
    }
  }

  // B. Firestore
  try {
    const docRef = doc(firestore, 'c1_records', c1.id);
    await setDoc(docRef, {
      ...c1,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (firestoreErr) {
    console.warn('Firestore C1 sync notice:', firestoreErr);
  }
}

// 5. Save Form B1 to LocalStorage, Firestore, and State
export async function syncSaveB1(b1: FormB1Upload): Promise<void> {
  // A. LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const currentB1 = getLocalStoredData<FormB1Upload[]>(STORAGE_KEYS.B1, []);
      const updatedB1 = [b1, ...currentB1.filter((item) => item.id !== b1.id)];
      setLocalStoredData(STORAGE_KEYS.B1, updatedB1);
    } catch (e) {
      console.warn('LocalStorage B1 save error:', e);
    }
  }

  // B. Firestore
  try {
    const docRef = doc(firestore, 'b1_records', b1.id);
    await setDoc(docRef, {
      ...b1,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (firestoreErr) {
    console.warn('Firestore B1 sync notice:', firestoreErr);
  }
}

// 6. Save Tim Sukses Wilayah to LocalStorage & Firestore
export async function syncSaveTimSukses(timSukses: TimSuksesWilayahRecord): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const current = getLocalStoredData<TimSuksesWilayahRecord[]>(STORAGE_KEYS.TIM_SUKSES, []);
      const updated = [timSukses, ...current.filter((item) => item.id !== timSukses.id)];
      setLocalStoredData(STORAGE_KEYS.TIM_SUKSES, updated);
    } catch (e) {
      console.warn('LocalStorage Tim Sukses save error:', e);
    }
  }

  try {
    const docRef = doc(firestore, 'tim_sukses_members', timSukses.id);
    await setDoc(docRef, {
      ...timSukses,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (firestoreErr) {
    console.warn('Firestore Tim Sukses sync notice:', firestoreErr);
  }
}

// 7. Fetch remote voters from Firestore or Cloud SQL on app mount to merge with local
export async function fetchRemoteVoters(): Promise<VoterOcrRecord[]> {
  const votersMap = new Map<string, VoterOcrRecord>();

  // Try Cloud SQL
  try {
    const res = await fetch('/api/voters');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        json.data.forEach((v: any) => {
          if (v.nik) {
            votersMap.set(v.nik, {
              id: `voter-sql-${v.id || v.nik}`,
              nik: v.nik,
              nikMasked: v.nik.length >= 8 ? `${v.nik.slice(0, 4)}••••••••${v.nik.slice(-4)}` : v.nik,
              nama: v.nama,
              tempatTglLahir: v.tempatTglLahir || '-',
              jenisKelamin: v.jenisKelamin || 'Laki-laki',
              alamat: v.alamat || '-',
              rtRw: v.rtRw || '001/001',
              kelurahan: v.kelurahan || '',
              kecamatan: v.kecamatan || '',
              kabupatenKota: v.kabupatenKota || '',
              provinsi: v.provinsi || 'DKI Jakarta',
              lat: typeof v.lat === 'number' ? v.lat : undefined,
              lng: typeof v.lng === 'number' ? v.lng : undefined,
              tps: v.tps || 'TPS 001',
              noHp: v.noHp || '-',
              waktuDaftar: 'Tersinkron Database',
              statusDpt: 'DPT valid',
              statusRegistrasi: 'TERDAFTAR',
              terdaftarOleh: 'Database Server',
            });
          }
        });
      }
    }
  } catch (e) {
    // ignore
  }

  // Try Firestore
  try {
    const querySnapshot = await getDocs(collection(firestore, 'voters'));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      if (data.nik) {
        votersMap.set(data.nik, {
          id: docSnap.id,
          nik: data.nik,
          nikMasked: data.nikMasked || (data.nik.length >= 8 ? `${data.nik.slice(0, 4)}••••••••${data.nik.slice(-4)}` : data.nik),
          nama: data.nama,
          tempatTglLahir: data.tempatTglLahir || '-',
          jenisKelamin: data.jenisKelamin || 'Laki-laki',
          alamat: data.alamat || '-',
          rtRw: data.rtRw || '001/001',
          kelurahan: data.kelurahan || '',
          kecamatan: data.kecamatan || '',
          kabupatenKota: data.kabupatenKota || '',
          provinsi: data.provinsi || 'DKI Jakarta',
          lat: typeof data.lat === 'number' ? data.lat : undefined,
          lng: typeof data.lng === 'number' ? data.lng : undefined,
          tps: data.tps || 'TPS 001',
          noHp: data.noHp || '-',
          waktuDaftar: data.waktuDaftar || 'Tersinkron Firestore',
          statusDpt: data.statusDpt || 'DPT valid',
          statusRegistrasi: 'TERDAFTAR',
          terdaftarOleh: data.terdaftarOleh || 'Database Firestore',
        });
      }
    });
  } catch (e) {
    // ignore
  }

  return Array.from(votersMap.values());
}
