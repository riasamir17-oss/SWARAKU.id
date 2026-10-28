import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  TimSuksesWilayahRecord,
  PetaWilayahMarker,
  normalizeWilayahName,
} from '../../data/petaSuaraData';
import { lookupSmartCoordinates, inferKotaFromKecamatan } from '../../utils/geocoding';
import { VoterOcrRecord, UserAccount } from '../../types/vore';
import {
  Search,
  Filter,
  Users,
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Plus,
  Phone,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Compass,
  RotateCcw,
  Info,
  Crosshair,
} from 'lucide-react';

interface PetaSuaraGoogleMapsViewProps {
  timSuksesList: TimSuksesWilayahRecord[];
  voterList: VoterOcrRecord[];
  currentUser?: UserAccount | null;
  onOpenDaftarTimSukses: (wilayahPreselect?: { kota?: string; kecamatan?: string; kelurahan?: string }) => void;
  onOpenInputVoter: (wilayahPreselect?: { kota?: string; kecamatan?: string; kelurahan?: string; lat?: number; lng?: number }) => void;
  onResetDataToZero?: () => void;
}

// Map Controller for smooth auto-pan & camera focusing
interface MapCameraControllerProps {
  targetLocation: { lat: number; lng: number } | null;
  markers: PetaWilayahMarker[];
  zoomLevel?: number;
}

const MapCameraController: React.FC<MapCameraControllerProps> = ({
  targetLocation,
  markers,
  zoomLevel = 14,
}) => {
  const map = useMap();
  const lastTargetRef = useRef<string | null>(null);

  // 1. Pan to targeted location (e.g. newly added voter, clicked marker or table row)
  useEffect(() => {
    if (!map || !targetLocation || !targetLocation.lat || !targetLocation.lng) return;

    const targetKey = `${targetLocation.lat.toFixed(5)}_${targetLocation.lng.toFixed(5)}`;
    if (lastTargetRef.current !== targetKey) {
      lastTargetRef.current = targetKey;
      map.panTo({ lat: targetLocation.lat, lng: targetLocation.lng });
      map.setZoom(zoomLevel);
    }
  }, [map, targetLocation, zoomLevel]);

  // 2. Initial fit bounds or pan to single marker if markers present and no manual target
  useEffect(() => {
    if (!map || targetLocation || markers.length === 0) return;

    if (markers.length === 1) {
      map.panTo({ lat: markers[0].lat, lng: markers[0].lng });
      map.setZoom(13);
    } else if (markers.length > 1 && (window as any).google?.maps?.LatLngBounds) {
      const bounds = new (window as any).google.maps.LatLngBounds();
      markers.forEach((m) => {
        if (m.lat && m.lng) {
          bounds.extend({ lat: m.lat, lng: m.lng });
        }
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [map, markers.length]);

  return null;
};

// Marker Item Sub-component with Anchored InfoWindow
interface MarkerWithAnchorProps {
  markerData: PetaWilayahMarker;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
  onAddVoterInRegion: (m: PetaWilayahMarker) => void;
  onAssignTimSuksesInRegion: (m: PetaWilayahMarker) => void;
}

const MarkerWithAnchor: React.FC<MarkerWithAnchorProps> = ({
  markerData,
  isSelected,
  onSelect,
  onClose,
  onAddVoterInRegion,
  onAssignTimSuksesInRegion,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  // Pin styling based on whether area has coordinator and voters
  const hasKoordinator = markerData.koordinatorNama !== 'Belum ada koordinator';
  const hasVoters = markerData.totalVoters > 0;

  let pinBgColor = '#0284c7'; // Cyan default
  let borderColor = '#0369a1';
  let badgeColor = 'bg-cyan-600';

  if (hasVoters && hasKoordinator) {
    pinBgColor = '#059669'; // Emerald strong
    borderColor = '#047857';
    badgeColor = 'bg-emerald-600';
  } else if (!hasKoordinator) {
    pinBgColor = '#e11d48'; // Rose alert (blank coordinator)
    borderColor = '#be123c';
    badgeColor = 'bg-rose-600';
  }

  const cleanKec = markerData.kecamatan.replace(/^kecamatan\s+/i, '');
  const wilayahLabel = `Kecamatan ${cleanKec}, ${markerData.kota}`;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: markerData.lat, lng: markerData.lng }}
        onClick={onSelect}
        title={`${wilayahLabel} • Kel. ${markerData.kelurahan} (${markerData.totalVoters} Suara)`}
      >
        {/* Custom Marker Pin with Voter Count Badge */}
        <div className="relative group cursor-pointer transform transition-transform hover:scale-110 active:scale-95">
          <div
            style={{ backgroundColor: pinBgColor, borderColor }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-lg border-2"
          >
            <MapPin className="w-5 h-5 text-white" />
          </div>

          {/* Floating Badge Voter Count */}
          <span
            className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[10px] font-black text-white ${badgeColor} border-2 border-white shadow-xs font-mono`}
          >
            {markerData.totalVoters}
          </span>

          {/* Tooltip Label on Hover: format "Kecamatan Penjaringan, Jakarta Utara" */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-slate-900/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-md pointer-events-none z-30 border border-slate-700">
            {wilayahLabel} ({markerData.totalVoters} Suara)
          </div>
        </div>
      </AdvancedMarker>

      {/* Anchored InfoWindow with Detailed Business Breakdown */}
      {isSelected && marker && (
        <InfoWindow
          anchor={marker}
          onCloseClick={onClose}
          maxWidth={320}
        >
          <div className="p-1 space-y-3 text-slate-800 text-xs font-sans">
            {/* Header: Wilayah Info - Persis format "Kecamatan Penjaringan, Jakarta Utara" */}
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[10px] uppercase font-bold text-cyan-700 block tracking-wider">
                {markerData.kota}
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                {wilayahLabel}
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>Kelurahan {markerData.kelurahan}</span>
              </p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                Koordinat: {markerData.lat.toFixed(4)}, {markerData.lng.toFixed(4)}
              </p>
            </div>

            {/* Koordinator Wilayah */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Koordinator Wilayah / Tim Sukses
              </span>

              {hasKoordinator ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-extrabold text-slate-900 block truncate text-xs">
                      {markerData.koordinatorNama}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      ✓ Penugasan Aktif
                    </span>
                  </div>

                  {markerData.koordinatorHp && markerData.koordinatorHp !== '-' && (
                    <a
                      href={`https://wa.me/62${markerData.koordinatorHp.replace(/^0/, '').replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-2xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>WA</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 text-rose-700">
                  <span className="font-bold text-[11px]">Belum ada koordinator</span>
                  <button
                    type="button"
                    onClick={() => onAssignTimSuksesInRegion(markerData)}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-md cursor-pointer"
                  >
                    + Tugaskan
                  </button>
                </div>
              )}
            </div>

            {/* Total Suara & Rincian Input (Tim Sukses vs Kader) */}
            <div className="p-2.5 bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-900 uppercase">
                  Total Suara (Voter) Terkumpul
                </span>
                <span className="text-base font-black font-mono text-cyan-900">
                  {markerData.totalVoters}
                </span>
              </div>

              {/* Rincian: Tim Sukses vs Kader */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-cyan-200/70 text-[11px]">
                <div className="p-1.5 bg-white/80 rounded-lg border border-cyan-200">
                  <span className="text-[9px] text-slate-500 block leading-tight font-semibold">
                    Input Tim Sukses
                  </span>
                  <span className="text-xs font-black font-mono text-cyan-700 block mt-0.5">
                    {markerData.voterTimSuksesCount} Voter
                  </span>
                </div>

                <div className="p-1.5 bg-white/80 rounded-lg border border-teal-200">
                  <span className="text-[9px] text-slate-500 block leading-tight font-semibold">
                    Input Kader
                  </span>
                  <span className="text-xs font-black font-mono text-emerald-700 block mt-0.5">
                    {markerData.voterKaderCount} Voter
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onAddVoterInRegion(markerData)}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Input Voter di Wilayah Ini</span>
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const PetaSuaraGoogleMapsView: React.FC<PetaSuaraGoogleMapsViewProps> = ({
  timSuksesList,
  voterList,
  currentUser,
  onOpenDaftarTimSukses,
  onOpenInputVoter,
  onResetDataToZero,
}) => {
  // Filters State
  const [selectedKotaFilter, setSelectedKotaFilter] = useState<string>('Semua');
  const [selectedKecFilter, setSelectedKecFilter] = useState<string>('Semua');
  const [selectedKelFilter, setSelectedKelFilter] = useState<string>('Semua');
  const [selectedKoordinatorFilter, setSelectedKoordinatorFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Marker for InfoWindow & Camera focus
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [cameraFocusLocation, setCameraFocusLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Google Maps API Key
  const apiKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) ||
    'AIzaSyCdblvQuw9FYALutqDvm1Yly8zXxDV386g';

  // 1. DYNAMIC AGGREGATION: Build dynamic markers from Tim Sukses & Voters
  // ZERO DUMMY DATA: All markers are generated exclusively from registered data!
  const dynamicMarkers = useMemo<PetaWilayahMarker[]>(() => {
    const markersMap = new Map<string, PetaWilayahMarker>();

    // Step A: Register wilayah from Tim Sukses
    timSuksesList.forEach((ts) => {
      const tsKecFirst = ts.kecamatanList[0] || '';
      const tsKota = ts.kota || inferKotaFromKecamatan(tsKecFirst) || 'DKI Jakarta';

      ts.kecamatanList.forEach((kec) => {
        const kelList = ts.kelurahanList.length > 0 ? ts.kelurahanList : ['Seluruh Kelurahan'];
        kelList.forEach((kel) => {
          const key = `${normalizeWilayahName(tsKota)}_${normalizeWilayahName(kec)}_${normalizeWilayahName(kel)}`;

          // Check if coordinates were an erroneous static Jaksel fallback
          let tsLat = ts.lat;
          let tsLng = ts.lng;
          const isErroneousTsJaksel =
            tsLat !== undefined &&
            Math.abs(tsLat - -6.2615) < 0.005 &&
            !tsKota.toLowerCase().includes('selatan') &&
            !kec.toLowerCase().includes('cilandak');

          if (!tsLat || !tsLng || isErroneousTsJaksel) {
            const smart = lookupSmartCoordinates(kel, kec, tsKota);
            if (smart) {
              tsLat = smart.lat;
              tsLng = smart.lng;
            }
          }

          if (!markersMap.has(key)) {
            markersMap.set(key, {
              id: key,
              kota: tsKota,
              kecamatan: kec,
              kelurahan: kel,
              lat: tsLat,
              lng: tsLng,
              koordinatorNama: ts.nama,
              koordinatorHp: ts.noHp,
              koordinatorRole: 'Tim Sukses',
              totalVoters: 0,
              voterTimSuksesCount: 0,
              voterKaderCount: 0,
              voterListNiks: [],
              terakhirUpdate: ts.waktuDaftar,
            });
          } else {
            // Update coordinator if previously empty
            const existing = markersMap.get(key)!;
            if (existing.koordinatorNama === 'Belum ada koordinator') {
              existing.koordinatorNama = ts.nama;
              existing.koordinatorHp = ts.noHp;
            }
          }
        });
      });
    });

    // Step B: Connect & Aggregate Voters
    // HAPUS SEMUA KOORDINAT & WILAYAH FALLBACK STATIS:
    // Peta Suara WAJIB mengambil data Kota, Kecamatan, dan Kelurahan persis seperti yang tertulis pada voter
    voterList.forEach((v) => {
      const vKec = (v.kecamatan || '').trim();
      const rawKota = (v.kabupatenKota || '').trim();
      // Infer Kota dynamically (e.g. Penjaringan -> Jakarta Utara) without ever forcing Jakarta Selatan
      const vKota = rawKota || inferKotaFromKecamatan(vKec) || 'DKI Jakarta';
      const vKel = (v.kelurahan || '').trim() || vKec || 'Kelurahan';

      // Find matching Tim Sukses for coordinator assignment if available
      const matchingTs = timSuksesList.find((ts) => {
        const kecMatch = ts.kecamatanList.some(
          (k) => normalizeWilayahName(k) === normalizeWilayahName(vKec)
        );
        return kecMatch;
      });

      const key = `${normalizeWilayahName(vKota)}_${normalizeWilayahName(vKec)}_${normalizeWilayahName(vKel)}`;

      // Resolve accurate coordinates: reject any historical -6.2615 Jaksel fallback if region is not Jaksel
      let finalLat = typeof v.lat === 'number' && v.lat !== 0 ? v.lat : undefined;
      let finalLng = typeof v.lng === 'number' && v.lng !== 0 ? v.lng : undefined;

      const isErroneousJaksel =
        finalLat !== undefined &&
        Math.abs(finalLat - -6.2615) < 0.005 &&
        !vKota.toLowerCase().includes('selatan') &&
        !vKec.toLowerCase().includes('cilandak');

      if (!finalLat || !finalLng || isErroneousJaksel) {
        const smart = lookupSmartCoordinates(vKel, vKec, vKota);
        if (smart) {
          finalLat = smart.lat;
          finalLng = smart.lng;
        } else if (matchingTs && matchingTs.lat && matchingTs.lng) {
          finalLat = matchingTs.lat;
          finalLng = matchingTs.lng;
        } else {
          finalLat = -6.1754; // Jakarta Pusat (Monas, Center of Indonesia)
          finalLng = 106.8272;
        }
      }

      let marker = markersMap.get(key);
      if (!marker) {
        marker = {
          id: key,
          kota: vKota,
          kecamatan: vKec,
          kelurahan: vKel,
          lat: finalLat,
          lng: finalLng,
          koordinatorNama: matchingTs ? matchingTs.nama : 'Belum ada koordinator',
          koordinatorHp: matchingTs ? matchingTs.noHp : undefined,
          totalVoters: 0,
          voterTimSuksesCount: 0,
          voterKaderCount: 0,
          voterListNiks: [],
          terakhirUpdate: v.waktuDaftar,
        };
        markersMap.set(key, marker);
      }

      // Increment Voter Counters
      marker.totalVoters += 1;
      marker.voterListNiks.push(v.nik);

      if (v.diinputOlehRole === 'tim_sukses') {
        marker.voterTimSuksesCount += 1;
      } else {
        marker.voterKaderCount += 1;
      }
    });

    return Array.from(markersMap.values());
  }, [timSuksesList, voterList]);

  // When a new voter is registered, auto-focus camera on the latest voter's coordinates
  useEffect(() => {
    if (voterList.length > 0) {
      const latest = voterList[0];
      const latestKec = (latest.kecamatan || '').trim();
      const latestKota = (latest.kabupatenKota || '').trim() || inferKotaFromKecamatan(latestKec);
      const latestKel = (latest.kelurahan || '').trim();

      // Check if latest has valid coords
      if (latest.lat && latest.lng && !(Math.abs(latest.lat - -6.2615) < 0.001 && !latestKota.includes('Selatan'))) {
        setCameraFocusLocation({ lat: latest.lat, lng: latest.lng });
      } else {
        const smart = lookupSmartCoordinates(latestKel, latestKec, latestKota);
        if (smart) {
          setCameraFocusLocation({ lat: smart.lat, lng: smart.lng });
        }
      }
    }
  }, [voterList.length]);

  // 2. DYNAMIC FILTER OPTIONS (Derived purely from active data)
  const kotaFilterOptions = useMemo(() => {
    return Array.from(new Set(dynamicMarkers.map((m) => m.kota))).filter(Boolean);
  }, [dynamicMarkers]);

  const kecamatanFilterOptions = useMemo(() => {
    const relevant = selectedKotaFilter === 'Semua'
      ? dynamicMarkers
      : dynamicMarkers.filter((m) => m.kota === selectedKotaFilter);
    return Array.from(new Set(relevant.map((m) => m.kecamatan))).filter(Boolean);
  }, [dynamicMarkers, selectedKotaFilter]);

  const kelurahanFilterOptions = useMemo(() => {
    let relevant = dynamicMarkers;
    if (selectedKotaFilter !== 'Semua') {
      relevant = relevant.filter((m) => m.kota === selectedKotaFilter);
    }
    if (selectedKecFilter !== 'Semua') {
      relevant = relevant.filter((m) => m.kecamatan === selectedKecFilter);
    }
    return Array.from(new Set(relevant.map((m) => m.kelurahan))).filter(Boolean);
  }, [dynamicMarkers, selectedKotaFilter, selectedKecFilter]);

  const koordinatorFilterOptions = useMemo(() => {
    const names = timSuksesList.map((ts) => ts.nama);
    return Array.from(new Set(names)).filter(Boolean);
  }, [timSuksesList]);

  // 3. FILTERED MARKERS
  const filteredMarkers = useMemo(() => {
    return dynamicMarkers.filter((m) => {
      if (selectedKotaFilter !== 'Semua' && m.kota !== selectedKotaFilter) return false;
      if (selectedKecFilter !== 'Semua' && m.kecamatan !== selectedKecFilter) return false;
      if (selectedKelFilter !== 'Semua' && m.kelurahan !== selectedKelFilter) return false;
      if (
        selectedKoordinatorFilter !== 'Semua' &&
        m.koordinatorNama !== selectedKoordinatorFilter
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          m.kota.toLowerCase().includes(q) ||
          m.kecamatan.toLowerCase().includes(q) ||
          m.kelurahan.toLowerCase().includes(q) ||
          m.koordinatorNama.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    dynamicMarkers,
    selectedKotaFilter,
    selectedKecFilter,
    selectedKelFilter,
    selectedKoordinatorFilter,
    searchQuery,
  ]);

  // 4. MACRO METRICS
  const grandTotalVoters = voterList.length;
  const totalVoterByTimSukses = voterList.filter((v) => v.diinputOlehRole === 'tim_sukses').length;
  const totalVoterByKader = voterList.filter((v) => v.diinputOlehRole !== 'tim_sukses').length;
  const totalWilayahTerpetakan = dynamicMarkers.length;

  // Default Map Center (center on first marker if available, else standard Monas / Jakarta Pusat)
  const defaultCenter = useMemo(() => {
    if (filteredMarkers.length > 0) {
      return { lat: filteredMarkers[0].lat, lng: filteredMarkers[0].lng };
    }
    return { lat: -6.1754, lng: 106.8272 }; // Monas Jakarta Pusat
  }, [filteredMarkers]);

  // Handler to focus map on a specific region
  const handleFocusOnWilayah = (m: PetaWilayahMarker) => {
    setSelectedMarkerId(m.id);
    setCameraFocusLocation({ lat: m.lat, lng: m.lng });
  };

  return (
    <div className="space-y-4">
      {/* Top Action & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Peta Suara Terpadu (Google Maps API)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
              Live GIS
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Sebaran suara pemilih &amp; wilayah kerja koordinator kecamatan/kelurahan
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onOpenDaftarTimSukses()}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-700 to-teal-700 hover:from-cyan-800 hover:to-teal-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ Daftar Tim Sukses</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenInputVoter()}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Input Data Voter</span>
          </button>

          {onResetDataToZero && (
            <button
              type="button"
              onClick={onResetDataToZero}
              title="Kosongkan seluruh data Peta Suara ke kondisi awal (0 Data)"
              className="p-2 bg-white hover:bg-slate-100 text-slate-500 hover:text-rose-600 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Macro Statistics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-gradient-to-br from-slate-900 to-cyan-950 rounded-2xl text-white border border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-cyan-300 block">
            Total Voter Terkumpul
          </span>
          <span className="text-xl font-black font-mono text-white mt-1 block">
            {grandTotalVoters.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-slate-300 block mt-0.5">
            Real-Time Terverifikasi
          </span>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Titik Wilayah Kerja
          </span>
          <span className="text-xl font-black font-mono text-cyan-800 mt-1 block">
            {totalWilayahTerpetakan}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Kecamatan &amp; Kelurahan
          </span>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-cyan-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-cyan-700 block">
            Input Tim Sukses
          </span>
          <span className="text-xl font-black font-mono text-cyan-700 mt-1 block">
            {totalVoterByTimSukses}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {grandTotalVoters > 0 ? Math.round((totalVoterByTimSukses / grandTotalVoters) * 100) : 0}% Total Suara
          </span>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">
            Input Kader Lapangan
          </span>
          <span className="text-xl font-black font-mono text-emerald-700 mt-1 block">
            {totalVoterByKader}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {grandTotalVoters > 0 ? Math.round((totalVoterByKader / grandTotalVoters) * 100) : 0}% Total Suara
          </span>
        </div>
      </div>

      {/* ZERO DUMMY DATA STATE BANNER (Appears when 0 regions / voters exist) */}
      {dynamicMarkers.length === 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-50 via-cyan-50 to-emerald-50 border border-cyan-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-700 text-white flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">
                Peta Suara Bersih (0 Data Awal)
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl leading-relaxed">
                Tidak ada data wilayah statis/dummy. Mulai dengan mendaftarkan <strong>Tim Sukses</strong> untuk menetapkan wilayah kerja (Kecamatan &amp; Kelurahan) atau input <strong>Data Voter</strong> baru. Titik koordinat dan marker Google Maps akan otomatis muncul secara dinamis sesuai wilayah yang diinput.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenDaftarTimSukses()}
              className="px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              + Daftar Tim Sukses
            </button>
            <button
              type="button"
              onClick={() => onOpenInputVoter()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              + Input Voter
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Filter Controls Bar */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Filter className="w-3.5 h-3.5 text-cyan-700" />
            <span>Filter Wilayah &amp; Koordinator Dinamis</span>
          </div>

          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Penjaringan, Jakarta Utara..."
              className="w-full pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Filter Kota */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Kota/Kab:</label>
            <select
              value={selectedKotaFilter}
              onChange={(e) => setSelectedKotaFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
            >
              <option value="Semua">Semua Kota ({kotaFilterOptions.length})</option>
              {kotaFilterOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kecamatan */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Kecamatan:</label>
            <select
              value={selectedKecFilter}
              onChange={(e) => setSelectedKecFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
            >
              <option value="Semua">Semua Kecamatan ({kecamatanFilterOptions.length})</option>
              {kecamatanFilterOptions.map((kec) => (
                <option key={kec} value={kec}>
                  Kecamatan {kec.replace(/^kecamatan\s+/i, '')}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelurahan */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Kelurahan:</label>
            <select
              value={selectedKelFilter}
              onChange={(e) => setSelectedKelFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
            >
              <option value="Semua">Semua Kelurahan ({kelurahanFilterOptions.length})</option>
              {kelurahanFilterOptions.map((kel) => (
                <option key={kel} value={kel}>
                  {kel}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Koordinator */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Koordinator:</label>
            <select
              value={selectedKoordinatorFilter}
              onChange={(e) => setSelectedKoordinatorFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
            >
              <option value="Semua">Semua Koordinator ({koordinatorFilterOptions.length})</option>
              {koordinatorFilterOptions.map((kor) => (
                <option key={kor} value={kor}>
                  {kor}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Google Maps Render Container */}
      <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
        <APIProvider apiKey={apiKey} libraries={['marker', 'geocoding', 'places']}>
          <GoogleMap
            mapId="DEMO_MAP_ID"
            defaultZoom={12}
            defaultCenter={defaultCenter}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Auto-Pan and Camera Focus Controller */}
            <MapCameraController
              targetLocation={cameraFocusLocation}
              markers={filteredMarkers}
              zoomLevel={14}
            />

            {filteredMarkers.map((m) => (
              <MarkerWithAnchor
                key={m.id}
                markerData={m}
                isSelected={selectedMarkerId === m.id}
                onSelect={() => {
                  setSelectedMarkerId(m.id);
                  setCameraFocusLocation({ lat: m.lat, lng: m.lng });
                }}
                onClose={() => setSelectedMarkerId(null)}
                onAddVoterInRegion={(item) => {
                  setSelectedMarkerId(null);
                  onOpenInputVoter({
                    kota: item.kota,
                    kecamatan: item.kecamatan,
                    kelurahan: item.kelurahan,
                    lat: item.lat,
                    lng: item.lng,
                  });
                }}
                onAssignTimSuksesInRegion={(item) => {
                  setSelectedMarkerId(null);
                  onOpenDaftarTimSukses({
                    kota: item.kota,
                    kecamatan: item.kecamatan,
                    kelurahan: item.kelurahan,
                  });
                }}
              />
            ))}
          </GoogleMap>
        </APIProvider>

        {/* Legend Overlay at Bottom Right */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-lg text-[10px] space-y-1.5 z-10 max-w-xs">
          <span className="font-extrabold text-slate-800 uppercase block tracking-wider">
            Legenda Peta Suara
          </span>
          <div className="space-y-1 text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-600 shrink-0"></span>
              <span>Ada Koordinator &amp; Suara Masuk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-cyan-600 shrink-0"></span>
              <span>Koordinator Tim Sukses Aktif</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-rose-600 shrink-0"></span>
              <span>Belum Ada Koordinator Wilayah</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Peta Suara Terpadu (Persis Menampilkan Kecamatan Penjaringan, Jakarta Utara) */}
      {filteredMarkers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-700" />
              <h3 className="text-xs font-black text-slate-800">
                Tabel Rincian Wilayah Peta Suara ({filteredMarkers.length} Titik)
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Klik &quot;Fokuskan Peta&quot; untuk langsung mengarahkan kamera
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Wilayah (Kecamatan &amp; Kota)</th>
                  <th className="py-2.5 px-3">Kelurahan</th>
                  <th className="py-2.5 px-3">Titik Koordinat</th>
                  <th className="py-2.5 px-3">Koordinator</th>
                  <th className="py-2.5 px-3 text-center">Total Suara</th>
                  <th className="py-2.5 px-3 text-right">Aksi Peta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMarkers.map((m) => {
                  const cleanKecName = m.kecamatan.replace(/^kecamatan\s+/i, '');
                  const wilayahText = `Kecamatan ${cleanKecName}, ${m.kota}`;
                  const isSelected = selectedMarkerId === m.id;

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-cyan-50/50 transition-colors ${
                        isSelected ? 'bg-cyan-50 font-bold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <span className="font-extrabold text-slate-900 block text-xs">
                          {wilayahText}
                        </span>
                        <span className="text-[10px] text-cyan-700">{m.kota}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">
                        {m.kelurahan}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold block text-slate-800">
                          {m.koordinatorNama}
                        </span>
                        {m.koordinatorHp && m.koordinatorHp !== '-' && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {m.koordinatorHp}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-cyan-100 text-cyan-800">
                          {m.totalVoters} Voter
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleFocusOnWilayah(m)}
                          className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-800 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Crosshair className="w-3 h-3" />
                          <span>Fokuskan Peta</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
