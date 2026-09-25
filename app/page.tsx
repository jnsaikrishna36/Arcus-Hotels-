'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { AppIcon, WordRotator } from '@/components/brand/AppIcon';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, addDays, parseISO } from 'date-fns';
import {
  MapPin, Calendar, Users, Search, ArrowRight, Star, Heart,
  TrendingUp, Zap, RefreshCw, ShieldCheck, Headphones, Car,
  Wifi, Waves, Utensils, Dumbbell, Coffee, Globe,
  ChevronDown, ChevronLeft, ChevronRight, Check, Plus, Minus, Quote,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';

/* ============================================================
   Sky gradients
   ============================================================ */
const SKY: Record<string, string> = {
  hero:          'linear-gradient(180deg,#0d1b3e 0%,#22356b 34%,#4a5d97 60%,#a9806f 84%,#e7b98f 100%)',
  newyork:       'linear-gradient(180deg,#1b2a52 0%,#3a4a86 55%,#caa07e 100%)',
  miami:         'linear-gradient(180deg,#2a3f7a 0%,#5e74b0 40%,#e7956f 78%,#f2c98a 100%)',
  neworleans:    'linear-gradient(180deg,#243a63 0%,#5566a0 55%,#c9a78a 100%)',
  chicago:       'linear-gradient(180deg,#16233f 0%,#33508a 60%,#9fb4d6 100%)',
  seattle:       'linear-gradient(180deg,#1c3147 0%,#3f6c87 55%,#b7d0d8 100%)',
  washingtondc:  'linear-gradient(180deg,#21305a 0%,#46599a 55%,#d8b489 100%)',
  lasvegas:      'linear-gradient(180deg,#1a1430 0%,#3a2a63 45%,#7a3f80 78%,#d96f7a 100%)',
  sanfrancisco:  'linear-gradient(180deg,#243a63 0%,#5a6fa6 45%,#e08a6a 80%,#f0bd8b 100%)',
  oslo:          'linear-gradient(180deg,#1e3a5f 0%,#2d5986 40%,#7eadbc 78%,#c8dde8 100%)',
  london:        'linear-gradient(180deg,#1c2840 0%,#364d78 45%,#9aa5c0 80%,#cfd5e2 100%)',
  paris:         'linear-gradient(180deg,#2a1f4a 0%,#4a3378 50%,#c08fa0 80%,#f0c8a0 100%)',
  amsterdam:     'linear-gradient(180deg,#1a3356 0%,#2e5c8a 45%,#78afc0 78%,#d0e8f0 100%)',
  barcelona:     'linear-gradient(180deg,#2e1428 0%,#5a2258 48%,#e05870 78%,#f0a070 100%)',
};
const skyOf = (city: string) => SKY[city.toLowerCase().replace(/[^a-z]/g, '')] ?? SKY.hero;

/* ============================================================
   Landmark SVGs (line-art, viewBox 0 0 100 100)
   ============================================================ */
const LANDMARKS: Record<string, React.ReactNode> = {
  empire: <><path d="M42 92V44h16v48"/><path d="M46 44V30h8v14"/><path d="M50 30V14"/><path d="M38 92h24"/><path d="M42 56h16M42 68h16M42 80h16"/></>,
  goldengate: <><path d="M6 86h88"/><path d="M26 86V32M74 86V32"/><path d="M26 40h6M26 52h6M74 40h-6M74 52h-6"/><path d="M6 70C18 50 22 34 26 34s10 30 24 30 22-30 24-30 8 16 20 36"/></>,
  spaceneedle: <><path d="M50 90V58"/><path d="M40 90h20"/><path d="M38 56c0-6 24-6 24 0 0 5-24 5-24 0Z"/><path d="M44 56V40h12v16"/><path d="M50 40V24"/><circle cx="50" cy="20" r="3"/><path d="M44 90l6-32M56 90l-6-32"/></>,
  capitol: <><path d="M14 90h72"/><path d="M20 90V60h60v30"/><path d="M26 60V46M36 60V46M46 60V46M54 60V46M64 60V46M74 60V46"/><path d="M30 46h40"/><path d="M36 46c0-16 28-16 28 0"/><path d="M50 30V20"/><circle cx="50" cy="17" r="2.5"/></>,
  vegas: <><path d="M50 64v24"/><path d="M42 88h16"/><path d="M30 40h40l-8 12H38z"/><path d="M50 28v-8"/><path d="M50 16l2.5 5.5L58 22l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/></>,
  palms: <><path d="M34 90c2-22 4-40 4-46M66 90c-2-18-3-30-3-34"/><path d="M38 44c-8-6-16-6-22-2M38 44c-6-8-6-16-2-22M38 44c8-6 16-5 21 0M38 44c4-8 12-12 19-10"/><path d="M63 56c-6-5-13-5-18-1M63 56c-5-6-5-12-1-17M63 56c7-4 14-3 18 1"/></>,
  liberty: <><path d="M40 92h20M44 92V70h12v22"/><path d="M46 70l-2-26h12l-2 26"/><path d="M50 44V30"/><path d="M44 30h12l-2-6h-8z"/><path d="M44 24l-1-7 3 3 2-5 2 5 3-3-1 7"/><path d="M56 40l8-14"/><path d="M62 24l3-3 1 4 4-1-3 3 1 4-4-2-3 2 1-4z"/></>,
  skyline: <><path d="M8 90h84"/><path d="M14 90V52h12v38M30 90V40h10v50M44 90V58h12v32M60 90V46h10v44M74 90V62h10v28"/><path d="M35 40V30M65 46V36"/></>,
  bridge: <><path d="M6 80h88"/><path d="M6 80c20 0 24-30 44-30s24 30 44 30"/><path d="M22 80V64M38 80V54M50 80V50M62 80V54M78 80V64"/></>,
  eiffel: <><path d="M50 90V55M36 55h28M30 72h40M24 90h52"/><path d="M44 55V32M56 55V32"/><path d="M44 32C40 18 60 18 56 32"/><path d="M50 32V10"/><path d="M47 14h6"/></>,
  bigben: <><path d="M36 90h28M38 90V42h24v48"/><path d="M46 42V32h8v10"/><path d="M46 32l4-16 4 16"/><path d="M38 58h24M38 70h24M38 82h24"/><circle cx="50" cy="52" r="7"/><path d="M50 45v7M50 52h5"/></>,
  vikingship: <><path d="M50 64V22"/><path d="M34 55V32"/><path d="M66 55V32"/><path d="M32 32C32 20 40 16 40 32"/><path d="M60 32C60 20 68 16 68 32"/><path d="M50 22l-14 28M50 22l14 28"/><path d="M12 68C18 54 82 54 88 68"/><path d="M8 72h84M14 76h72"/></>,
  canal: <><path d="M8 90h84"/><path d="M12 90V52h18v38M40 90V46h20v44M70 90V52h18v38"/><path d="M12 52C12 40 30 40 30 52"/><path d="M40 46C40 34 60 34 60 46"/><path d="M70 52C70 40 88 40 88 52"/><path d="M16 68h10M16 78h10M44 62h12M44 74h12M74 68h10M74 78h10"/></>,
  sagrada: <><path d="M20 90h60"/><path d="M28 90V42M50 90V32M72 90V42"/><path d="M26 42l2-18 2 18M48 32l2-22 2 22M70 42l2-18 2 18"/><path d="M22 62h12M44 52h12M66 62h12"/><path d="M22 76h12M44 68h12M66 76h12"/></>,
};
const CITY_LANDMARK: Record<string, string> = {
  'New York': 'liberty', Miami: 'palms', 'New Orleans': 'bridge', Chicago: 'skyline',
  Seattle: 'spaceneedle', 'Washington DC': 'capitol', 'Las Vegas': 'vegas', 'San Francisco': 'goldengate',
  Oslo: 'vikingship', London: 'bigben', Paris: 'eiffel', Amsterdam: 'canal', Barcelona: 'sagrada',
};
function Landmark({ name, size = 100, color = 'currentColor', strokeWidth = 2.4, style, className }: {
  name: string; size?: number; color?: string; strokeWidth?: number;
  style?: React.CSSProperties; className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={{ display: 'block', ...style }} aria-hidden="true">
      {LANDMARKS[name] ?? LANDMARKS.skyline}
    </svg>
  );
}

/* ============================================================
   Hero skyline silhouette
   ============================================================ */
function HeroSkyline({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 1440 240" preserveAspectRatio="none" width="100%" height="100%"
      style={{ display: 'block', ...style }} aria-hidden="true">
      <path fill="rgba(8,14,32,0.55)" d="M0 240V150l40-6v-30l22 4v-40l16 26v34l30-8v-70l18 22v52l34-10V120l24 30v54l40-12V96l16 22v82l30-10v-44l20 26v30l40-12V70l18 26v98l36-12v-58l22 30v32l40-12V130l16 22v60l34-12V92l24 32v70l40-14V108l18 26v54l34-12V60l20 28v82l40-14V120l16 22v60l32-12V150l24 30v8l40-12v-26l18 24v6l34-10v-38l36-8v-52l20 28v50l38-12v-66l18 26v62l34-10V100l24 32v68l40-14V96l18 28v62l36-12v-58l22 30v42l40-12V120l16 24v72l30-10v-44l20 26v38l40-12V80l18 26v80l32-10v-50l22 28v44l30-8v-30l20-6v-28l22 24v28l28-8V240H0Z"/>
      <path fill="rgba(5,9,24,0.8)" d="M0 240V186l34-8v-44l20 24v44l36-12v-66l18 24v56l40-14V150l22 28v40l40-12v-70l16 22v62l34-12V160l24 30v34l40-12v-30l18 24v22l36-10v-50l20 26v36l40-12V150l16 22v54l34-12v-40l24 30v18l40-12v-8l18 22l36-10v-44l40-10v-62l18 24v56l36-12v-56l20 28v52l40-12V148l18 26v64l34-10v-52l22 30v44l40-12V128l16 22v72l30-8v-48l20 26v44l38-12V148l18 24v60l34-10v-54l22 28v48l40-12V132l16 22v70l32-10v-44l20 26v40l38-12V150l18 24v54l34-10v-48l22 30v44l30-8v-30l40-8v-50l22 28v40l40-10l36-8V240H0Z"/>
      <g fill="rgba(231,201,160,0.5)">
        <rect x="120" y="150" width="4" height="6"/><rect x="132" y="160" width="4" height="6"/>
        <rect x="300" y="140" width="4" height="6"/><rect x="312" y="150" width="4" height="6"/>
        <rect x="520" y="120" width="4" height="6"/><rect x="532" y="132" width="4" height="6"/>
        <rect x="760" y="130" width="4" height="6"/><rect x="860" y="110" width="4" height="6"/>
        <rect x="920" y="140" width="4" height="6"/><rect x="980" y="120" width="4" height="6"/>
        <rect x="992" y="134" width="4" height="6"/><rect x="1060" y="108" width="4" height="6"/>
        <rect x="1110" y="130" width="4" height="6"/><rect x="1180" y="150" width="4" height="6"/>
        <rect x="1240" y="120" width="4" height="6"/><rect x="1300" y="140" width="4" height="6"/>
        <rect x="1360" y="155" width="4" height="6"/><rect x="1400" y="160" width="4" height="6"/>
      </g>
    </svg>
  );
}

/* ============================================================
   Transport shapes (plane, suitcase, taxi)
   ============================================================ */
const PLANE_D = "M3 34c-1-.3-1-2 .2-2.3L22 27l9-15c.6-1 1.7-1.6 2.9-1.6h2.3c1.2 0 2 1.2 1.6 2.3L33 27l14-1 5-7c.5-.7 1.3-1.1 2.1-1.1h1.5c1.1 0 1.8 1.1 1.4 2.1l-3 9 3 9c.4 1-.3 2.1-1.4 2.1H55c-.8 0-1.6-.4-2.1-1.1l-5-7-14-1 4.8 14.9c.4 1.1-.4 2.3-1.6 2.3h-2.3c-1.2 0-2.3-.6-2.9-1.6l-9-15z";

function SuitcaseShape({ size = 40, wheelClass = '' }: { size?: number; wheelClass?: string }) {
  const color = '#1d1a16'; const accent = '#00b2bd';
  return (
    <svg viewBox="0 0 64 72" width={size} height={size * 72 / 64} style={{ display: 'block' }} aria-hidden="true">
      <rect x="24" y="4" width="16" height="3" rx="1.5" fill={color}/>
      <rect x="26" y="6" width="3" height="12" fill={color}/>
      <rect x="35" y="6" width="3" height="12" fill={color}/>
      <rect x="10" y="16" width="44" height="40" rx="7" fill={color}/>
      <rect x="10" y="26" width="44" height="3" fill="rgba(255,255,255,0.25)"/>
      <rect x="24" y="16" width="3" height="40" fill="rgba(255,255,255,0.16)"/>
      <rect x="37" y="16" width="3" height="40" fill="rgba(255,255,255,0.16)"/>
      <circle cx="46" cy="20" r="3.4" fill={accent}/>
      <g className={wheelClass}>
        <circle cx="20" cy="62" r="5" fill={color}/>
        <line x1="20" y1="57" x2="20" y2="67" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
        <line x1="15" y1="62" x2="25" y2="62" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      </g>
      <g className={wheelClass}>
        <circle cx="44" cy="62" r="5" fill={color}/>
        <line x1="44" y1="57" x2="44" y2="67" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
        <line x1="39" y1="62" x2="49" y2="62" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      </g>
    </svg>
  );
}

function TaxiShape({ size = 56, wheelClass = '' }: { size?: number; wheelClass?: string }) {
  const color = '#e7b24a';
  return (
    <svg viewBox="0 0 96 56" width={size} height={size * 56 / 96} style={{ display: 'block' }} aria-hidden="true">
      <rect x="6" y="40" width="84" height="3" rx="1.5" fill="rgba(0,0,0,0.12)"/>
      <path fill={color} d="M8 40V30c0-2 1-3 3-3l10-1 8-8c1-1 2-1.5 3.5-1.5H62c2 0 4 1 5.4 2.6L74 27l11 2c2 .4 3 1.6 3 3.6V40c0 1.7-1.3 3-3 3H11c-1.7 0-3-1.3-3-3Z"/>
      <path fill="#bfe1ec" d="M33 19h11v8H26zM48 19h11l5.5 8H48z"/>
      <rect x="30" y="9" width="36" height="5" rx="1.5" fill="#1d1a16"/>
      <rect x="33" y="10.5" width="30" height="2" fill={color}/>
      <g className={wheelClass}><circle cx="29" cy="43" r="7" fill="#1d1a16"/><circle cx="29" cy="43" r="2.6" fill="#cfcfcf"/></g>
      <g className={wheelClass}><circle cx="71" cy="43" r="7" fill="#1d1a16"/><circle cx="71" cy="43" r="2.6" fill="#cfcfcf"/></g>
    </svg>
  );
}

/* ============================================================
   Flight layer — SMIL animateMotion
   ============================================================ */
type PlaneSpec = { path: number; dur?: number; begin?: number; color?: string; size?: number; opacity?: number };
function FlightLayer({
  paths, planes, viewBox = '0 0 1440 560', showRoutes = true,
  routeColor = 'rgba(255,255,255,0.20)', style, className,
}: {
  paths: string[]; planes: PlaneSpec[]; viewBox?: string; showRoutes?: boolean;
  routeColor?: string; style?: React.CSSProperties; className?: string;
}) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <svg className={className} viewBox={viewBox} preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }}
      aria-hidden="true">
      {showRoutes && paths.map((d, i) => (
        <path key={'r' + i} d={d} fill="none" stroke={routeColor} strokeWidth="1.6"
          strokeDasharray="1.5 10" strokeLinecap="round" />
      ))}
      {planes.map((p, i) => {
        const sz = p.size ?? 30;
        const s = sz / 64;
        const c = -sz / 2;
        return (
          <g key={'p' + i} opacity={reduced ? 0 : (p.opacity ?? 0.96)}>
            <path d={PLANE_D} fill={p.color ?? '#ffffff'} transform={`translate(${sz / 2},${c}) scale(${-s},${s})`} />
            {!reduced && (
              // @ts-ignore — SMIL animateMotion is valid SVG/React
              <animateMotion
                dur={(p.dur ?? 20) + 's'}
                begin={(p.begin ?? 0) + 's'}
                repeatCount="indefinite"
                rotate="auto"
                path={paths[p.path]}
                calcMode="linear"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ============================================================
   Rolling suitcase + taxi
   ============================================================ */
function RollingSuitcase({ size = 34, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <div className="suitcase-roll" style={{ position: 'absolute', bottom: '16px', left: 0, zIndex: 2, ...style }} aria-hidden="true">
      <div className="suitcase-bob"><SuitcaseShape size={size} wheelClass="wheel-spin" /></div>
    </div>
  );
}
function TaxiRun({ size = 52, dur = 12, style }: { size?: number; dur?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', height: `${Math.round(size * 56 / 96) + 22}px`, overflow: 'hidden', ...style }} aria-hidden="true">
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '12px', height: '2px',
        background: 'repeating-linear-gradient(90deg, var(--border) 0 16px, transparent 16px 30px)' }} />
      <div className="taxi-run" style={{ position: 'absolute', bottom: '12px', animationDuration: `${dur}s` }}>
        <TaxiShape size={size} wheelClass="wheel-spin" />
      </div>
    </div>
  );
}

/* ============================================================
   useInView — trigger landmark draw-ins
   ============================================================ */
function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

/* ============================================================
   ScenicImage — sky + landmark backdrop for cards
   ============================================================ */
function ScenicImage({ city, height = 188, rounded = '18px 18px 0 0', animate = false, label, children }: {
  city: string; height?: number; rounded?: string; animate?: boolean;
  label?: string; children?: React.ReactNode;
}) {
  const [ref, seen] = useInView(0.2);
  const lm = Math.min(Math.round(height * 0.82), 150);
  return (
    <div ref={ref} style={{ position: 'relative', height, borderRadius: rounded, overflow: 'hidden', background: skyOf(city) }}>
      <span style={{ position: 'absolute', right: '24px', top: '22px', width: '42px', height: '42px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,246,222,0.95), rgba(255,214,150,0.35) 60%, transparent 72%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
        <Landmark
          name={CITY_LANDMARK[city] ?? 'skyline'}
          size={lm}
          color="rgba(255,255,255,0.92)"
          strokeWidth={2.1}
          className={animate ? 'lm-anim' + (seen ? ' in' : '') : undefined}
          style={{ marginBottom: '-1px' }}
        />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '46%',
        background: 'linear-gradient(180deg, transparent, rgba(7,11,28,0.42))' }} />
      {label && (
        <span style={{ position: 'absolute', left: '16px', bottom: '14px', color: '#fff', fontWeight: 700,
          fontFamily: "'Bricolage Grotesque','Inter',sans-serif", fontSize: '20px',
          letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>{label}</span>
      )}
      {children}
    </div>
  );
}

/* ============================================================
   Data
   ============================================================ */
const CITY_GROUPS = [
  { group: 'United States', tag: 'US', cities: ['New York', 'Miami', 'New Orleans', 'Chicago', 'Seattle', 'Washington DC', 'Las Vegas', 'San Francisco'] },
  { group: 'Europe', tag: 'EU', cities: ['Oslo', 'London', 'Paris', 'Amsterdam', 'Barcelona'] },
];
const CITIES = CITY_GROUPS.flatMap(g => g.cities);
const HOTELS = [
  { name: 'The Astor Rooms', city: 'New York', rating: 4.8, reviews: 1284, price: 329, amen: ['wifi', 'utensils', 'dumbbell'] as const, deal: 'Free cancellation', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=400&fit=crop&auto=format' },
  { name: 'Palm & Pier Resort', city: 'Miami', rating: 4.7, reviews: 932, price: 412, amen: ['waves', 'wifi', 'utensils'] as const, deal: null, img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=400&fit=crop&auto=format' },
  { name: 'Cascade Needle Hotel', city: 'Seattle', rating: 4.9, reviews: 644, price: 268, amen: ['wifi', 'coffee', 'car'] as const, deal: 'Breakfast included', img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=400&fit=crop&auto=format' },
  { name: 'Bayview Bridge Suites', city: 'San Francisco', rating: 4.8, reviews: 1102, price: 388, amen: ['wifi', 'waves', 'dumbbell'] as const, deal: null, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop&auto=format' },
  { name: 'Neon Boulevard Grand', city: 'Las Vegas', rating: 4.6, reviews: 2051, price: 219, amen: ['waves', 'utensils', 'car'] as const, deal: 'Limited deal', img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=400&fit=crop&auto=format' },
  { name: 'Capitol Garden Inn', city: 'Washington DC', rating: 4.7, reviews: 711, price: 296, amen: ['wifi', 'coffee', 'utensils'] as const, deal: null, img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=400&fit=crop&auto=format' },
];
const DESTS = [
  { city: 'New York', props: 312, price: 289, hl: 'Skyline views & Broadway nights', img: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=600&h=300&fit=crop&auto=format' },
  { city: 'Miami', props: 198, price: 355, hl: 'Beachfront resorts & art deco', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=300&fit=crop&auto=format' },
  { city: 'San Francisco', props: 176, price: 332, hl: 'Bay vistas & cable cars', img: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=300&fit=crop&auto=format' },
  { city: 'Las Vegas', props: 240, price: 189, hl: 'The Strip, shows & suites', img: 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=600&h=300&fit=crop&auto=format' },
  { city: 'Seattle', props: 121, price: 248, hl: 'Waterfront & coffee culture', img: 'https://images.unsplash.com/photo-1438401171849-74ac270044ee?w=600&h=300&fit=crop&auto=format' },
  { city: 'Washington DC', props: 143, price: 276, hl: 'Monuments & museums', img: 'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=600&h=300&fit=crop&auto=format' },
  { city: 'Chicago', props: 167, price: 231, hl: 'Lakefront & architecture', img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=300&fit=crop&auto=format' },
  { city: 'New Orleans', props: 98, price: 214, hl: 'Jazz, balconies & beignets', img: 'https://images.unsplash.com/photo-1570578066030-a5792a08ec7e?w=600&h=300&fit=crop&auto=format' },
  { city: 'Oslo', props: 64, price: 299, hl: 'Fjords, design & midnight sun', img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=300&fit=crop&auto=format' },
  { city: 'London', props: 187, price: 319, hl: 'History, theatre & the Thames', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=300&fit=crop&auto=format' },
  { city: 'Paris', props: 214, price: 349, hl: 'The Eiffel Tower & haute cuisine', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=300&fit=crop&auto=format' },
  { city: 'Amsterdam', props: 98, price: 269, hl: 'Canals, Rijksmuseum & Jordaan', img: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&h=300&fit=crop&auto=format' },
  { city: 'Barcelona', props: 142, price: 289, hl: 'Gaudí, beaches & tapas', img: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=300&fit=crop&auto=format' },
];
const AMEN_LABELS: Record<string, string> = { wifi: 'Free Wi-Fi', waves: 'Pool', utensils: 'Restaurant', dumbbell: 'Gym', coffee: 'Breakfast', car: 'Parking' };
const AMEN_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi size={12} />, waves: <Waves size={12} />, utensils: <Utensils size={12} />,
  dumbbell: <Dumbbell size={12} />, coffee: <Coffee size={12} />, car: <Car size={12} />,
};
const REVIEWS = [
  { name: 'Maya R.', where: 'Stayed in Miami', rating: 5, text: 'Booked in under a minute and the airport transfer was waiting when we landed. Genuinely flawless.' },
  { name: 'Daniel K.', where: 'Stayed in New York', rating: 5, text: 'The verified photos matched the room exactly. No surprises, just skyline views and a great night\'s sleep.' },
  { name: 'Priya S.', where: 'Stayed in Seattle', rating: 4, text: 'Plans changed twice and the flexible cancellation made rebooking completely effortless.' },
];
const FEATURES = [
  { icon: <Zap size={23} />, t: 'Instant confirmation', d: 'Your booking reference lands in seconds, not minutes.' },
  { icon: <RefreshCw size={23} />, t: 'Flexible cancellation', d: 'Plans change. Most stays cancel free up to 24 hours before check-in.' },
  { icon: <ShieldCheck size={23} />, t: 'Verified stays', d: 'Every property is checked and every review comes from a real guest.' },
  { icon: <Headphones size={23} />, t: '24×7 support', d: 'Real people in every time zone, before and during your trip.' },
];
const fmtUSD = (n: number) => '$' + n.toLocaleString('en-US');
const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };

/* ============================================================
   SectionHead
   ============================================================ */
function SectionHead({ kicker, title, sub, center }: {
  kicker?: React.ReactNode; title: React.ReactNode; sub?: string; center?: boolean;
}) {
  return (
    <div style={{ marginBottom: '30px', textAlign: center ? 'center' : 'left', maxWidth: center ? '640px' : 'none', marginLeft: center ? 'auto' : 0, marginRight: center ? 'auto' : 0 }}>
      {kicker && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'var(--accent-dark)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
          {kicker}
        </div>
      )}
      <h2 style={{ fontSize: 'clamp(28px,3.6vw,40px)', lineHeight: 1.08 }}>{title}</h2>
      {sub && <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '8px' }}>{sub}</p>}
    </div>
  );
}

/* ============================================================
   HomeNavbar — announcement bar + scroll-transparent nav
   ============================================================ */
function HomeNavbar({ onStaysClick }: { onStaysClick?: () => void }) {
  const [solid, setSolid] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 60);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const txt = solid ? 'var(--text)' : '#ffffff';
  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200 }}>
      <div className="ann-bar">
        <span className="ann-pill">Deal</span>
        <span>Members save up to 15% on 500+ partner hotels — sign in before you book.</span>
      </div>
      <nav data-testid="navbar" style={{
        background: solid ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: solid ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: solid ? 'blur(12px)' : 'none',
        borderBottom: solid ? '1px solid var(--border-soft)' : '1px solid transparent',
        transition: 'background .3s, border-color .3s',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', position: 'relative' }}>
          <Link href="/" data-testid="logo" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
            <AppIcon size={42} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '21px', color: txt, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, transition: 'color .3s', fontFamily: "'Bricolage Grotesque','Inter',sans-serif", whiteSpace: 'nowrap' }}>Arcus Go</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: solid ? 'var(--text-muted)' : 'rgba(255,255,255,0.62)', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1, transition: 'color .3s' }}>
                Powered by
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/testsigma-logo.svg" alt="Testsigma" style={{ height: '12px', display: 'block', filter: solid ? 'none' : 'brightness(0) invert(1)', opacity: solid ? 0.75 : 0.7 }} />
              </span>
            </div>
          </Link>

          <div className="nav-center" style={{ display: 'flex', alignItems: 'center', gap: '28px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <button onClick={onStaysClick} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: txt, fontFamily: 'inherit', padding: '6px 2px', fontSize: '14.5px', fontWeight: 500 }}>Stays</button>
            {(['Flights', 'Trains', 'Cabs'] as const).map(l => (
              <span key={l} className="nav-link nav-link-disabled" style={{ color: txt }}>{l}</span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {!isAuthenticated && (
              <Link href="/auth/login?callbackUrl=/" className="nav-link" style={{ fontSize: '14.5px', fontWeight: 600, color: txt, textDecoration: 'none', transition: 'color .3s, opacity .15s' }}>Login</Link>
            )}
            <Link href={isAuthenticated ? '/dashboard' : '/auth/register'} className="btn-ink">
              {isAuthenticated ? (user?.firstName ?? 'Account') : 'Register'}
            </Link>
            {isAuthenticated && (
              <button onClick={handleLogout} style={{ fontSize: '14.5px', fontWeight: 600, color: txt, background: 'none', border: 'none', cursor: 'pointer', transition: 'color .3s' }}>
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

/* ============================================================
   Hero
   ============================================================ */
const HERO_PATHS = [
  'M-60 360 C 320 150, 760 120, 1100 240 S 1480 380 1540 300',
  'M-60 180 C 420 300, 980 280, 1540 150',
  'M-80 470 C 480 380, 1020 470, 1540 360',
];
const HERO_PLANES = [
  { path: 0, dur: 20, color: '#ffffff', size: 30 },
  { path: 1, dur: 26, begin: 5, color: '#f0d6b0', size: 24, opacity: 0.9 },
  { path: 2, dur: 23, begin: 11, color: '#ffffff', size: 22, opacity: 0.82 },
];

function Hero({ search, setSearch, searchRef }: {
  search: { city: string; checkIn: string; checkOut: string; guests: number };
  setSearch: React.Dispatch<React.SetStateAction<{ city: string; checkIn: string; checkOut: string; guests: number }>>;
  searchRef: React.RefObject<HTMLDivElement | null>;
}) {
  const router = useRouter();
  const today = new Date();
  const stats: [string, string][] = [['50,000+', 'bookings made'], ['4.8', 'average guest rating'], ['500+', 'partner hotels']];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ city: search.city, checkIn: search.checkIn, checkOut: search.checkOut, guests: String(search.guests) });
    router.push('/hotels/search?' + params);
  };

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: SKY.hero, paddingTop: '148px', paddingBottom: '130px', minHeight: 'calc(86vh - 36px)' }}>
      <FlightLayer paths={HERO_PATHS} planes={HERO_PLANES} routeColor="rgba(255,255,255,0.16)" style={{ zIndex: 1 }} />
      <div style={{ position: 'absolute', left: '50%', top: '100px', transform: 'translateX(-50%)', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,228,180,0.45), rgba(255,196,128,0.10) 45%, transparent 66%)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '260px', zIndex: 1 }}><HeroSkyline /></div>
      <RollingSuitcase size={36} style={{ bottom: '30px', zIndex: 2 }} />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 3, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(4px)', borderRadius: '999px', padding: '6px 15px', marginBottom: '20px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#5fe0e6', flexShrink: 0 }} />
          <span style={{ fontSize: '12.5px', color: '#fff', fontWeight: 600 }}>Stays, flights, cabs &amp; trains — one trip, one app</span>
        </div>
        <h1 style={{ fontSize: 'clamp(44px,6.8vw,72px)', color: '#fff', lineHeight: 1.02, marginBottom: '18px', textShadow: '0 2px 30px rgba(0,0,0,0.25)' }}>
          Find your perfect{' '}
          <WordRotator words={['stay', 'flight', 'cab', 'train']} />
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.84)', maxWidth: '440px', margin: '0 auto 34px', lineHeight: 1.55 }}>
          Search, discover and book your whole journey in three steps — confirmation in seconds.
        </p>

        <form data-testid="search-form" onSubmit={handleSearch} style={{ background: 'var(--surface)', borderRadius: '22px', padding: '20px 22px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', boxShadow: '0 28px 80px rgba(8,14,32,0.45)', textAlign: 'left' }}>
          <div ref={searchRef} style={{ flex: '1 1 160px' }}>
            <label style={lbl}><MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />Destination</label>
            <CitySelectInline value={search.city} onChange={city => setSearch(s => ({ ...s, city }))} groupedOptions={CITY_GROUPS} align="left" />
          </div>
          <div style={{ flex: '1 1 136px' }}>
            <label style={lbl}><Calendar size={10} style={{ display: 'inline', marginRight: 3 }} />Check-in</label>
            <DateFieldInline
              role="check-in"
              value={search.checkIn}
              min={format(today, 'yyyy-MM-dd')}
              rangeStart={search.checkIn}
              rangeEnd={search.checkOut}
              onChange={checkIn => setSearch(s => {
                const n = { ...s, checkIn };
                if (s.checkOut <= checkIn) n.checkOut = format(addDays(parseISO(checkIn), 1), 'yyyy-MM-dd');
                return n;
              })}
            />
          </div>
          <div style={{ flex: '1 1 136px' }}>
            <label style={lbl}><Calendar size={10} style={{ display: 'inline', marginRight: 3 }} />Check-out</label>
            <DateFieldInline
              role="check-out"
              value={search.checkOut}
              min={format(addDays(parseISO(search.checkIn), 1), 'yyyy-MM-dd')}
              rangeStart={search.checkIn}
              rangeEnd={search.checkOut}
              onChange={checkOut => setSearch(s => ({ ...s, checkOut }))}
            />
          </div>
          <div style={{ flex: '1 1 148px' }}>
            <label style={lbl}><Users size={10} style={{ display: 'inline', marginRight: 3 }} />Guests</label>
            <GuestSelectInline value={search.guests} onChange={guests => setSearch(s => ({ ...s, guests }))} align="right" />
          </div>
          <button type="submit" data-testid="search-submit" className="btn-primary" style={{ flex: '0 0 auto', justifyContent: 'center', height: '46px', padding: '0 26px', gap: '8px' }}>
            <Search size={16} color="#fff" />Search
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '30px' }}>
          {stats.map(([n, l], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {i > 0 && <span style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.22)' }} />}
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '22px', lineHeight: 1, fontFamily: "'Bricolage Grotesque','Inter',sans-serif" }}>{n}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '3px' }}>{l}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Featured stays
   ============================================================ */
function AmenityRow({ amen }: { amen: readonly string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '10px 0 14px' }}>
      {amen.map(a => (
        <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: 'var(--text-muted)', background: 'var(--surface-warm)', border: '1px solid var(--border-soft)', borderRadius: '999px', padding: '3px 9px' }}>
          {AMEN_ICONS[a]}{AMEN_LABELS[a]}
        </span>
      ))}
    </div>
  );
}

function HotelCard({ h }: { h: typeof HOTELS[number] }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className="tcard" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
      <div style={{ position: 'relative', height: '186px', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={h.img} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 50%,rgba(0,0,0,0.35))' }} />
        <span style={{ position: 'absolute', left: '14px', top: '14px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.95)', color: 'var(--text)', fontWeight: 700, fontSize: '12.5px', padding: '4px 9px', borderRadius: '999px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <Star size={12} color="#f5a623" fill="#f5a623" />{h.rating}
        </span>
        <button onClick={() => setLiked(l => !l)} aria-label="Save" style={{ position: 'absolute', right: '14px', bottom: '14px', width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
          <Heart size={17} color={liked ? '#e0556b' : 'var(--text-muted)'} fill={liked ? '#e0556b' : 'none'} />
        </button>
        {h.deal && <span style={{ position: 'absolute', left: '14px', bottom: '14px', background: 'var(--accent)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 9px', borderRadius: '999px' }}>{h.deal}</span>}
      </div>
      <div style={{ padding: '15px 18px 18px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{h.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          <MapPin size={13} color="var(--text-muted)" />{h.city}
          <span style={{ margin: '0 4px', opacity: .5 }}>·</span>
          <span>{h.reviews.toLocaleString()} reviews</span>
        </div>
        <AmenityRow amen={h.amen} />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1px solid var(--border-soft)', paddingTop: '13px' }}>
          <div>
            <span style={{ fontSize: '21px', fontWeight: 800, color: 'var(--text)', fontFamily: "'Bricolage Grotesque','Inter',sans-serif" }}>{fmtUSD(h.price)}</span>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}> / night</span>
          </div>
          <a href="#" className="btn-primary" style={{ padding: '9px 18px' }}>Book stay</a>
        </div>
      </div>
    </article>
  );
}

function FeaturedStays() {
  return (
    <section style={{ padding: '72px 24px 64px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <SectionHead kicker="Featured stays" title="Handpicked hotels, ready to book" sub="Real availability, verified guests, instant confirmation." />
        <Link href="/hotels/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none', fontSize: '14px', marginBottom: '34px' }}>
          View all hotels <ArrowRight size={15} color="var(--accent-dark)" />
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '22px' }}>
        {HOTELS.map(h => <HotelCard key={h.name} h={h} />)}
      </div>
    </section>
  );
}

/* ============================================================
   Flight route band
   ============================================================ */
const BAND_PATHS = [
  'M-40 108 C 360 36, 760 36, 1080 96 S 1480 124 1520 70',
  'M-40 58 C 420 128, 1000 120, 1520 48',
];
const BAND_PLANES = [
  { path: 0, dur: 17, color: '#0e7c84', size: 26 },
  { path: 1, dur: 22, begin: 4, color: '#c9633f', size: 22, opacity: 0.9 },
];
function RouteBand() {
  return (
    <div style={{ position: 'relative', height: '120px', maxWidth: '1280px', margin: '0 auto' }} aria-hidden="true">
      <FlightLayer paths={BAND_PATHS} planes={BAND_PLANES} viewBox="0 0 1440 160" routeColor="rgba(30,46,80,0.22)" />
    </div>
  );
}

/* ============================================================
   Popular destinations
   ============================================================ */
function DestCard({ d }: { d: typeof DESTS[number] }) {
  return (
    <Link href={`/hotels/search?city=${d.city}`} className="dcard" style={{ display: 'block', textDecoration: 'none', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
      <div style={{ position: 'relative', height: '156px', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.img} alt={d.city} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .4s ease' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0.55) 100%)' }} />
        <span style={{ position: 'absolute', left: '14px', bottom: '14px', color: '#fff', fontWeight: 700, fontFamily: "'Bricolage Grotesque','Inter',sans-serif", fontSize: '18px', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>{d.city}</span>
        <span style={{ position: 'absolute', right: '12px', top: '12px', background: 'rgba(255,255,255,0.92)', color: 'var(--text)', fontSize: '11.5px', fontWeight: 700, padding: '4px 9px', borderRadius: '999px' }}>{d.props} stays</span>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, minHeight: '38px' }}>{d.hl}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>from <b style={{ color: 'var(--text)' }}>{fmtUSD(d.price)}</b></span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-dark)', fontWeight: 600, fontSize: '13px' }}>Explore <ArrowRight size={13} color="var(--accent-dark)" /></span>
        </div>
      </div>
    </Link>
  );
}
function Destinations() {
  return (
    <section style={{ padding: '8px 24px 72px', maxWidth: '1200px', margin: '0 auto' }}>
      <SectionHead kicker="Popular destinations" title="Where travelers are heading" sub="Thirteen cities across the US and Europe, one tap to explore." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
        {DESTS.map(d => <DestCard key={d.city} d={d} />)}
      </div>
    </section>
  );
}

/* ============================================================
   Trending
   ============================================================ */
function Trending() {
  const booked: [string, string][] = [['Neon Boulevard Grand', 'Las Vegas'], ['The Astor Rooms', 'New York'], ['Palm & Pier Resort', 'Miami']];
  const trend: [string, string][] = [['Miami', '+38%'], ['San Francisco', '+24%'], ['New Orleans', '+19%']];
  return (
    <section style={{ background: 'var(--surface-warm)', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)', padding: '66px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHead kicker={<><TrendingUp size={14} color="var(--accent-dark)" /> Trending right now</>} title="Moving fast this week" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="trend-box">
            <h3 style={{ fontSize: '16px', marginBottom: '14px' }}>Most booked hotels</h3>
            {booked.map(([n, c], i) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderTop: i ? '1px solid var(--border-soft)' : 'none' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)', width: '22px', fontFamily: "'Bricolage Grotesque','Inter',sans-serif" }}>{i + 1}</span>
                <div><div style={{ fontWeight: 600, fontSize: '14px' }}>{n}</div><div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{c}</div></div>
              </div>
            ))}
          </div>
          <div className="trend-box">
            <h3 style={{ fontSize: '16px', marginBottom: '14px' }}>Trending destinations</h3>
            {trend.map(([c, up], i) => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: i ? '1px solid var(--border-soft)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Landmark name={CITY_LANDMARK[c] ?? 'skyline'} size={28} color="var(--accent-dark)" strokeWidth={2.4} />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{c}</span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2f9e6f', fontWeight: 700, fontSize: '13px' }}>
                  <TrendingUp size={13} color="#2f9e6f" />{up}
                </span>
              </div>
            ))}
          </div>
          <div className="trend-box" style={{ background: 'var(--ink)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: .5 }}>
              <Landmark name="palms" size={120} color="rgba(255,255,255,0.14)" strokeWidth={2.4} />
            </span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--clay)', color: '#fff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 10px', borderRadius: '999px', marginBottom: '14px' }}>Limited-time</div>
            <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '8px' }}>Up to 30% off Miami beachfront</h3>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '14px', lineHeight: 1.55, marginBottom: '20px' }}>Five-night summer escapes at Palm &amp; Pier Resort. Offer ends Sunday.</p>
            <a href="#" className="btn-primary" style={{ position: 'relative' }}>Grab the deal <ArrowRight size={15} color="#fff" /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Why Choose Arcus
   ============================================================ */
function WhyChoose() {
  return (
    <section style={{ padding: '72px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <SectionHead center kicker="Why travelers choose Arcus" title="Booking that earns your trust" sub="Everything that makes a trip easy, handled before you arrive." />
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '22px', padding: '30px 30px 0', boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Car size={26} color="var(--accent-dark)" />
          </div>
          <div style={{ flex: '1 1 280px', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>Airport transfers, sorted</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: 1.6, maxWidth: '520px' }}>Add a private cab or shuttle at checkout and it will be waiting the moment you land — no app, no haggling.</p>
          </div>
        </div>
        <TaxiRun size={52} dur={11} style={{ margin: '0 -30px' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {FEATURES.map(f => (
          <div key={f.t} className="ucard" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '26px', boxShadow: 'var(--shadow)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '15px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'var(--accent-dark)' }}>{f.icon}</div>
            <h3 style={{ fontSize: '16.5px', marginBottom: '7px' }}>{f.t}</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Reviews
   ============================================================ */
function Reviews() {
  return (
    <section style={{ background: 'var(--surface-warm)', borderTop: '1px solid var(--border-soft)', padding: '72px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHead center kicker="Guest reviews" title="Loved by 50,000+ travelers" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {REVIEWS.map(r => (
            <div key={r.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '26px', boxShadow: 'var(--shadow)' }}>
              <Quote size={26} color="var(--accent-light)" />
              <div style={{ display: 'flex', gap: '3px', margin: '8px 0 12px' }}>
                {Array.from({ length: 5 }, (_, i) => <Star key={i} size={15} color={i < r.rating ? '#f5a623' : 'var(--border)'} fill={i < r.rating ? '#f5a623' : 'transparent'} />)}
              </div>
              <p style={{ fontSize: '15px', lineHeight: 1.65, color: 'var(--text)', marginBottom: '18px' }}>{r.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(140deg,var(--accent),#007e86)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>{r.name[0]}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{r.name}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{r.where}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CTA + Footer
   ============================================================ */
const CTA_PATHS = ['M-60 150 C 380 60, 900 60, 1540 130'];
const CTA_PLANES = [{ path: 0, dur: 18, color: '#ffffff', size: 26 }];
function CTA() {
  return (
    <section style={{ padding: '56px 24px 92px', maxWidth: '1120px', margin: '0 auto' }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '30px', background: SKY.hero, padding: '66px 32px 70px', textAlign: 'center' }}>
        <FlightLayer paths={CTA_PATHS} planes={CTA_PLANES} viewBox="0 0 1440 240" routeColor="rgba(255,255,255,0.18)" style={{ zIndex: 1 }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '140px', zIndex: 1, opacity: .9 }}><HeroSkyline /></div>
        <div style={{ position: 'relative', zIndex: 3 }}>
          <h2 style={{ fontSize: 'clamp(30px,4.4vw,46px)', color: '#fff', marginBottom: '14px' }}>Your next trip starts here</h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', marginBottom: '28px', fontSize: '16px' }}>Create a free account and book your stay in minutes.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register" className="btn-primary">Create account <ArrowRight size={16} color="#fff" /></Link>
            <Link href="/hotels/search" className="btn-ghost">Browse hotels</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '26px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600 }}>Powered by</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/testsigma-logo.svg" alt="Testsigma" style={{ height: '16px', display: 'block', opacity: 0.85 }} />
      </div>
      © 2026 Arcus Go · Demo application for QA automation testing
      <div style={{ marginTop: '6px', fontSize: '12px', opacity: 0.7 }}>
        Test credentials: alex@demo.com / Demo@1234 · Admin: admin@demo.com / Admin@1234
      </div>
    </footer>
  );
}

/* ============================================================
   Inline search widgets (same interface as the imported ones,
   but self-contained so the hero form works without extra deps)
   ============================================================ */
function useFixedDropdown(
  wrapperRef: React.RefObject<HTMLElement | null>,
  triggerRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  setOpen: (v: boolean) => void,
  align: 'left' | 'right',
) {
  const [pos, setPos] = useState({ top: 0, left: 0, right: 0, width: 0, maxHeight: 320 });
  const popRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const availH = window.innerHeight - r.bottom - 8 - 16;
      setPos({ top: r.bottom + 8, left: r.left, right: window.innerWidth - r.right, width: r.width, maxHeight: Math.max(120, Math.min(320, availH)) });
    }
    const onDoc = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onScroll = (e: Event) => {
      if (popRef.current && popRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, wrapperRef, triggerRef, setOpen]);
  const popStyle: React.CSSProperties = {
    position: 'fixed',
    top: pos.top,
    left: align === 'right' ? 'auto' : pos.left,
    right: align === 'right' ? pos.right : 'auto',
    minWidth: pos.width,
    maxHeight: pos.maxHeight,
    overflowY: 'auto',
  };
  return { popStyle, popRef };
}

type CityGroup = { group: string; tag: string; cities: string[] };

function CitySelectInline({ value, onChange, groupedOptions, align = 'left' }: {
  value: string; onChange: (v: string) => void; groupedOptions: CityGroup[]; align?: 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<string>('all');
  const { popStyle, popRef } = useFixedDropdown(ref, triggerRef, open, setOpen, align);

  const label = value || 'All Cities';

  const visibleGroups = groupedOptions
    .filter(g => region === 'all' || g.tag === region)
    .map(g => ({ ...g, cities: g.cities.filter(c => c.toLowerCase().includes(query.toLowerCase())) }))
    .filter(g => g.cities.length > 0);

  const showHeaders = region === 'all';

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else setQuery('');
  }, [open]);

  const choose = (v: string) => { onChange(v); setOpen(false); };

  // fixed position but no minWidth/maxHeight/overflowY interference
  const fixedStyle: React.CSSProperties = {
    position: 'fixed',
    top: popStyle.top,
    left: align === 'right' ? 'auto' : popStyle.left,
    right: align === 'right' ? popStyle.right : 'auto',
  };

  return (
    <div className="dd" ref={ref} data-open={open}>
      <button ref={triggerRef} type="button" className="dd-trigger" data-testid="search-city"
        onClick={() => setOpen(o => !o)}>
        <span className="dd-trigger-label">
          <MapPin size={15} className="dd-trigger-pin" />
          <span className={value ? '' : 'dd-placeholder'}>{label}</span>
        </span>
        <ChevronDown size={16} className="dd-chevron" />
      </button>

      {open && (
        <div ref={popRef} className="dd-pop ddC-pop" role="listbox" style={fixedStyle}>
          {/* Search */}
          <div className="ddC-search">
            <Search size={15} className="ddC-search-icon" />
            <input ref={inputRef} className="ddC-input" placeholder="Search cities"
              value={query} onChange={e => setQuery(e.target.value)} />
          </div>

          {/* Segment */}
          <div className="ddC-seg">
            {(['all', ...groupedOptions.map(g => g.tag)]).map(key => {
              const lbl = key === 'all' ? 'All' : groupedOptions.find(g => g.tag === key)?.group ?? key;
              return (
                <button key={key} type="button" className="ddC-seg-btn"
                  data-active={region === key} onClick={() => setRegion(key)}>
                  {lbl}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="ddC-scroll">
            {(region === 'all' || query === '') && (
              <button type="button" className="ddC-row" data-selected={value === ''} onClick={() => choose('')}>
                <Globe size={16} className="ddC-row-icon-globe" />
                <span className="ddC-row-label">All Cities</span>
                {value === '' && <Check size={16} className="dd-check" />}
              </button>
            )}
            {visibleGroups.map(g => (
              <div key={g.group}>
                {showHeaders && (
                  <div className="ddC-head">
                    <span className="dd-chip">{g.tag}</span>
                    <span>{g.group}</span>
                  </div>
                )}
                {g.cities.map(c => (
                  <button key={c} type="button" className="ddC-row" data-selected={value === c}
                    onClick={() => choose(c)}>
                    <MapPin size={15} className="ddC-row-icon" />
                    <span className="ddC-row-label">{c}</span>
                    {value === c && <Check size={16} className="dd-check" />}
                  </button>
                ))}
              </div>
            ))}
            {visibleGroups.length === 0 && query && (
              <div className="ddC-empty">No cities match &ldquo;{query}&rdquo;.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const isoDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseDate = (s: string) => { const [y, m, dd] = s.split('-').map(Number); return new Date(y, m - 1, dd); };
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonthsTo = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const isSameDay = (a: Date, b: Date) => +startOfDay(a) === +startOfDay(b);
const isBeforeDay = (a: Date, b: Date) => +startOfDay(a) < +startOfDay(b);
const diffDays = (a: Date, b: Date) => Math.round((+startOfDay(a) - +startOfDay(b)) / 86400000);
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmtLong = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
const DOW = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function DateFieldInline({ value, onChange, min, rangeStart, rangeEnd, role = 'check-in', align = 'left' }: {
  value: string; onChange: (v: string) => void; min?: string;
  rangeStart?: string; rangeEnd?: string; role?: string; align?: 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selected = value ? parseDate(value) : null;
  const minDate = min ? startOfDay(parseDate(min)) : null;
  const today = startOfDay(new Date());
  const [view, setView] = useState(startOfMonth(selected ?? today));
  useEffect(() => { if (open) setView(startOfMonth(selected ?? today)); }, [open]); // eslint-disable-line
  const { popStyle, popRef } = useFixedDropdown(ref, triggerRef, open, setOpen, align);
  const rs = rangeStart ? startOfDay(parseDate(rangeStart)) : null;
  const re = rangeEnd ? startOfDay(parseDate(rangeEnd)) : null;
  const cells = useMemo(() => {
    const p = startOfMonth(view).getDay();
    const t = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < p; i++) arr.push(null);
    for (let d = 1; d <= t; d++) arr.push(new Date(view.getFullYear(), view.getMonth(), d));
    return arr;
  }, [view]);
  const atMin = +view <= +startOfMonth(minDate ?? today);
  const nights = rs && re ? diffDays(re, rs) : 0;
  const dayClass = (d: Date) => {
    const cls = ['cal-day'];
    if (minDate && isBeforeDay(d, minDate)) cls.push('disabled');
    if (isSameDay(d, today)) cls.push('today');
    const isStart = rs && isSameDay(d, rs); const isEnd = re && isSameDay(d, re);
    if (rs && re && isBeforeDay(rs, d) && isBeforeDay(d, re)) cls.push('range');
    if (isStart && re) cls.push('range-start');
    if (isEnd && rs) cls.push('range-end');
    if (isStart || isEnd || (selected && isSameDay(d, selected))) cls.push('sel');
    return cls.join(' ');
  };
  const testId = role === 'check-in' ? 'search-checkin' : 'search-checkout';
  return (
    <div className="sf" ref={ref} data-open={open}>
      <button ref={triggerRef} type="button" className="sf-trigger" data-testid={testId} onClick={() => setOpen(o => !o)}>
        <span className={`sf-value${selected ? '' : ' sf-placeholder'}`}>{selected ? fmtLong(selected) : 'Add date'}</span>
        <Calendar size={16} className="sf-leading-icon" />
      </button>
      {open && (
        <div ref={popRef} className={`sf-pop cal${align === 'right' ? ' sf-pop-right' : ''}`} role="dialog" style={popStyle}>
          <div className="cal-head">
            <button type="button" className="cal-nav" disabled={atMin} onClick={() => setView(v => addMonthsTo(v, -1))}><ChevronLeft size={17} /></button>
            <span className="cal-title">{MONTHS[view.getMonth()]} {view.getFullYear()}</span>
            <button type="button" className="cal-nav" onClick={() => setView(v => addMonthsTo(v, 1))}><ChevronRight size={17} /></button>
          </div>
          <div className="cal-grid">
            {DOW.map(d => <div key={d} className="cal-dow">{d}</div>)}
            {cells.map((d, i) => d ? (
              <button key={isoDate(d)} type="button" className={dayClass(d)}
                data-testid={`day-${isoDate(d)}`}
                disabled={!!(minDate && isBeforeDay(d, minDate))}
                onClick={() => { onChange(isoDate(d)); setOpen(false); }}>
                {d.getDate()}
              </button>
            ) : <span key={`e${i}`} className="cal-day empty" />)}
          </div>
          <div className="cal-foot">
            {nights > 0 ? <span><b>{nights} night{nights !== 1 ? 's' : ''}</b> selected</span>
              : <span>{role === 'check-in' ? 'Select your check-in date' : 'Select your check-out date'}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

const GUEST_ROWS = [
  { key: 'adults', name: 'Adults', desc: 'Ages 13 or above', min: 1, max: 16 },
  { key: 'children', name: 'Children', desc: 'Ages 0 – 12', min: 0, max: 10 },
  { key: 'rooms', name: 'Rooms', desc: 'Number of rooms', min: 1, max: 8 },
] as const;
type GuestKey = typeof GUEST_ROWS[number]['key'];

function GuestSelectInline({ value, onChange, align = 'right' }: {
  value: number; onChange: (v: number) => void; align?: 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState<Record<GuestKey, number>>({ adults: Math.max(1, value), children: 0, rooms: 1 });
  const { popStyle, popRef } = useFixedDropdown(ref, triggerRef, open, setOpen, align);
  const step = (key: GuestKey, dir: number) => {
    const row = GUEST_ROWS.find(r => r.key === key)!;
    const next = Math.min(row.max, Math.max(row.min, counts[key] + dir));
    const u = { ...counts, [key]: next };
    setCounts(u);
    onChange(u.adults + u.children);
  };
  const total = counts.adults + counts.children;
  const summary = `${total} guest${total !== 1 ? 's' : ''} · ${counts.rooms} room${counts.rooms !== 1 ? 's' : ''}`;
  return (
    <div className="sf" ref={ref} data-open={open}>
      <button ref={triggerRef} type="button" className="sf-trigger" data-testid="search-guests" onClick={() => setOpen(o => !o)}>
        <span className="sf-trigger-label">
          <Users size={15} className="sf-leading-icon" />
          <span className="sf-option-label">{summary}</span>
        </span>
        <ChevronDown size={16} className="sf-chevron" />
      </button>
      {open && (
        <div ref={popRef} className={`sf-pop gs${align === 'right' ? ' sf-pop-right' : ''}`} role="dialog" style={popStyle}>
          {GUEST_ROWS.map(r => (
            <div key={r.key} className="gs-row">
              <div><div className="gs-name">{r.name}</div><div className="gs-desc">{r.desc}</div></div>
              <div className="gs-ctrl">
                <button type="button" className="gs-btn" data-testid={`guests-${r.key}-dec`} disabled={counts[r.key] <= r.min} onClick={() => step(r.key, -1)}><Minus size={16} /></button>
                <span className="gs-val" data-testid={`guests-${r.key}-value`}>{counts[r.key]}</span>
                <button type="button" className="gs-btn" data-testid={`guests-${r.key}-inc`} disabled={counts[r.key] >= r.max} onClick={() => step(r.key, 1)}><Plus size={16} /></button>
              </div>
            </div>
          ))}
          <div className="gs-foot"><button type="button" className="gs-done" data-testid="guests-done" onClick={() => setOpen(false)}>Done</button></div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Main export
   ============================================================ */
export default function HomePage() {
  const today = new Date();
  const [search, setSearch] = useState({
    city: '',
    checkIn: format(addDays(today, 1), 'yyyy-MM-dd'),
    checkOut: format(addDays(today, 3), 'yyyy-MM-dd'),
    guests: 2,
  });
  const searchRef = useRef<HTMLDivElement>(null);

  const handleStaysClick = () => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <HomeNavbar onStaysClick={handleStaysClick} />
      <Hero search={search} setSearch={setSearch} searchRef={searchRef} />
      <FeaturedStays />
      <RouteBand />
      <Destinations />
      <Trending />
      <WhyChoose />
      <Reviews />
      <CTA />
      <Footer />
    </div>
  );
}
