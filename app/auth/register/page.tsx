'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/Toaster';
import { Eye, EyeOff, User, Mail, Phone, Lock, Star } from 'lucide-react';
import { TravelDecorations } from '@/components/auth/TravelDecorations';
import { AppIcon } from '@/components/brand/AppIcon';

function ArcusLogo({ dark }: { dark?: boolean }) {
  const txt = dark ? '#ffffff' : 'var(--ink)';
  const sub = dark ? 'rgba(255,255,255,0.62)' : 'var(--text-muted)';
  const logoSrc = dark ? '/testsigma-logo-white.svg' : '/testsigma-logo.svg';
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
      <AppIcon size={42} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '20px', color: txt, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: "'Bricolage Grotesque','Inter',sans-serif", whiteSpace: 'nowrap' }}>Arcus Go</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: sub, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
          Powered by
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="Testsigma" style={{ height: '11px', display: 'block' }} />
        </span>
      </div>
    </Link>
  );
}

const STATS = [
  { n: '50,000+', l: 'bookings made' },
  { n: '4.8★', l: 'average rating' },
  { n: '500+', l: 'partner hotels' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-]{10,}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) e.password = 'Password needs uppercase, lowercase and number';
    else if (!/[^A-Za-z0-9\s]/.test(form.password)) e.password = 'Password needs at least one special character (e.g. ! @ # $ %)';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post<any>('/api/auth/register', form);
      setAuth(res.data.user, res.data.token);
      toast.success('Account created!', `Welcome, ${res.data.user.firstName}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error('Registration failed', err.message);
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const field = (name: keyof typeof form, label: string, type: string, icon: React.ReactNode, placeholder: string, extra?: any) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '7px', color: 'var(--text)' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</span>
        <input
          data-testid={`register-${name}`}
          type={type}
          className={`input-field ${errors[name] ? 'error' : ''}`}
          style={{ paddingLeft: '42px', ...(extra?.style || {}) }}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(er => ({ ...er, [name]: '' })); }}
          autoComplete={extra?.autoComplete}
        />
        {extra?.toggle && (
          <button type="button" data-testid={`toggle-${name}`} onClick={extra.toggle} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {errors[name] && <p data-testid={`${name}-error`} style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>{errors[name]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── Left panel ──────────────────────────────────────────────── */}
      <div className="auth-panel-left" style={{
        flex: '0 0 40%',
        background: 'linear-gradient(160deg,#0d1b3e 0%,#22356b 38%,#4a5d97 68%,#a9806f 88%,#e7b98f 100%)',
        display: 'flex', flexDirection: 'column',
        padding: '48px 44px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,220,170,0.22), transparent 68%)', pointerEvents: 'none' }} />
        <TravelDecorations />

        <ArcusLogo dark />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(24px,2.6vw,32px)', color: '#fff', fontFamily: "'Bricolage Grotesque','Inter',sans-serif", fontWeight: 800, lineHeight: 1.1, marginBottom: '14px', letterSpacing: '-0.02em' }}>
            Join 50,000+<br />happy travelers.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', lineHeight: 1.65, marginBottom: '36px', maxWidth: '300px' }}>
            Create your free account and unlock member rates, flexible cancellations, and instant confirmations.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {STATS.map(s => (
              <div key={s.n} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '12px', padding: '14px 18px', flex: '1 1 80px' }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '18px', fontFamily: "'Bricolage Grotesque','Inter',sans-serif" }}>{s.n}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginTop: '2px' }}>{s.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            {Array.from({ length: 5 }, (_, i) => <Star key={i} size={15} fill="#f5a623" color="#f5a623" />)}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '13.5px', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '12px' }}>
            "Plans changed twice and the flexible cancellation made rebooking completely effortless."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(140deg,var(--accent),#007e86)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>P</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>Priya S.</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Stayed in Seattle</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
        {/* Mobile-only logo */}
        <div className="auth-mobile-logo" style={{ display: 'none', marginBottom: '32px' }}>
          <ArcusLogo />
        </div>

        <div style={{ width: '100%', maxWidth: '460px' }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque','Inter',sans-serif", fontSize: '28px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>Create account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '28px' }}>Join thousands of happy travelers — it only takes a minute</p>

          {errors.general && (
            <div data-testid="error-message" style={{ background: 'var(--error-light)', border: '1px solid var(--error)', borderRadius: '10px', padding: '12px 16px', color: 'var(--error)', fontSize: '14px', marginBottom: '20px' }}>
              {errors.general}
            </div>
          )}

          <form data-testid="register-form" onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {field('firstName', 'First Name', 'text', <User size={16} />, 'Alex')}
              {field('lastName', 'Last Name', 'text', <User size={16} />, 'Johnson')}
            </div>
            {field('email', 'Email Address', 'email', <Mail size={16} />, 'alex@example.com', { autoComplete: 'email' })}
            {field('phone', 'Phone Number', 'tel', <Phone size={16} />, '+1 (555) 867-5309')}
            {field('password', 'Password', showPw ? 'text' : 'password', <Lock size={16} />, 'Min 8 chars, upper + lower + number + special', { toggle: () => setShowPw(!showPw), style: { paddingRight: '42px' } })}
            {field('confirmPassword', 'Confirm Password', showPw ? 'text' : 'password', <Lock size={16} />, 'Repeat your password')}

            <div style={{ background: 'var(--surface-alt)', borderRadius: '10px', padding: '12px 14px', marginBottom: '22px', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </div>

            <button type="submit" data-testid="register-submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '15px' }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" data-testid="login-link" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
