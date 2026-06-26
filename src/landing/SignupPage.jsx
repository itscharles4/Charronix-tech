import React, { useState, useEffect } from 'react';

const API = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

// ─── Eye icon SVG ───────────────────────────────────────────────────────────
const EyeIcon = ({ show, onClick }) => (
  <button type="button" onClick={onClick} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'#9ca3af', display:'flex', alignItems:'center', outline:'none' }}>
    {show
      ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
      : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>}
  </button>
);

// ─── Input field ─────────────────────────────────────────────────────────────
function Field({ icon, placeholder, type = 'text', value, onChange, required, suffix, name }) {
  return (
    <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
      <span style={{ position:'absolute', left:12, color:'#9ca3af', fontSize:14 }}>{icon}</span>
      <input
        type={type} placeholder={placeholder} required={required} value={value} onChange={onChange} name={name}
        style={{ width:'100%', padding:'11px 40px 11px 36px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13.5, outline:'none', fontFamily:'Inter,sans-serif', color:'#1a1a2e', background:'#fafafa', boxSizing:'border-box', transition:'all 0.2s' }}
        onFocus={e=>{ e.target.style.borderColor='#7c3aed'; e.target.style.background='#fff'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.1)'; }}
        onBlur={e=>{ e.target.style.borderColor='#e5e7eb'; e.target.style.background='#fafafa'; e.target.style.boxShadow='none'; }}
      />
      {suffix && <span style={{ position:'absolute', right:12 }}>{suffix}</span>}
    </div>
  );
}

// ─── OTP digit boxes ─────────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
  const digits = (value + '      ').slice(0,6).split('');
  const refs = Array.from({length:6}, () => React.createRef());

  const handleKey = (i, e) => {
    const val = e.target.value.replace(/\D/,'');
    const arr = (value + '      ').slice(0,6).split('');
    arr[i] = val || ' ';
    const next = arr.join('').trimEnd();
    onChange(next);
    if (val && i < 5) refs[i+1].current?.focus();
    if (e.key === 'Backspace' && !val && i > 0) refs[i-1].current?.focus();
  };

  return (
    <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
      {[0,1,2,3,4,5].map(i => (
        <input key={i} ref={refs[i]} maxLength={1} type="text" inputMode="numeric"
          value={digits[i].trim()}
          onChange={e => handleKey(i, e)}
          onKeyDown={e => { if (e.key==='Backspace' && !e.target.value && i>0) refs[i-1].current?.focus(); }}
          style={{ width:48, height:52, textAlign:'center', fontSize:22, fontWeight:700, border:'2px solid #e5e7eb', borderRadius:10, outline:'none', fontFamily:'Inter,sans-serif', color:'#5B3EF5', transition:'all 0.2s', background:'#fafafa' }}
          onFocus={e=>{ e.target.style.borderColor='#7c3aed'; e.target.style.background='#fff'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.1)'; }}
          onBlur={e=>{ e.target.style.borderColor='#e5e7eb'; e.target.style.background='#fafafa'; e.target.style.boxShadow='none'; }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SignupPage({ onSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(false); // false = Sign Up, true = Sign In
  const [step, setStep]           = useState('register'); // register | otp
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [loginError, setLoginError] = useState('');
  const [otp, setOtp]             = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const [form, setForm] = useState({
    firstName:'', lastName:'', password:'', confirmPassword:'',
    phone:'', email:'', institutionName:''
  });

  const [loginForm, setLoginForm] = useState({ identifier: '', password: '', rememberMe: false });

  // Load saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem('charronix_saved_login');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLoginForm({ identifier: parsed.identifier || '', password: parsed.password || '', rememberMe: true });
        setIsLoginMode(true); // Automatically show login screen if credentials exist
      } catch (e) {}
    }
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setL = (k) => (e) => setLoginForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const startTimer = () => {
    setResendTimer(60);
    const id = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(id); return 0; } return t - 1; });
    }, 1000);
  };

  // ── Step 1: Register → Send OTP ────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/otp/send`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phone: form.phone, firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, institutionName: form.institutionName })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Failed to send OTP'); setLoading(false); return; }

      if (data.devOtp) { setOtp(data.devOtp); console.log('Dev OTP:', data.devOtp); }

      setStep('otp');
      startTimer();
    } catch {
      setError('Cannot connect to server. Please try again.');
    }
    setLoading(false);
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.trim().length < 6) { setError('Please enter the 6-digit OTP'); return; }
    setError(''); setLoading(true);

    try {
      const res = await fetch(`${API}/api/v1/otp/verify`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phone: form.phone, otp: otp.trim() })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Invalid OTP'); setLoading(false); return; }

      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userRole', data.user.role || 'ADMIN');
      
      localStorage.setItem('charronix_user', JSON.stringify(data.user));
      localStorage.setItem('charronix_registered', 'true');
      
      // Save credentials if they just registered successfully so login remembers them
      localStorage.setItem('charronix_saved_login', JSON.stringify({ identifier: form.phone, password: form.password }));

      onSuccess(data.user);
    } catch {
      setError('Verification failed. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError(''); setLoading(true);
    try {
      await fetch(`${API}/api/v1/otp/send`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phone: form.phone, firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, institutionName: form.institutionName })
      });
      startTimer();
    } catch { setError('Failed to resend OTP'); }
    setLoading(false);
  };

  // ── Login Submit ───────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.identifier, password: loginForm.password })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setLoginError(data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      if (data.data.accessToken) localStorage.setItem('accessToken', data.data.accessToken);
      if (data.data.refreshToken) localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('userRole', data.data.user.role || 'ADMIN');
      localStorage.setItem('charronix_user', JSON.stringify(data.data.user));

      if (loginForm.rememberMe) {
        localStorage.setItem('charronix_saved_login', JSON.stringify({ identifier: loginForm.identifier, password: loginForm.password }));
      } else {
        localStorage.removeItem('charronix_saved_login');
      }

      onSuccess(data.data.user);
    } catch (err) {
      setLoginError('Cannot connect to server. Please try again.');
    }
    setLoading(false);
  };


  // ─── Rendering ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif', padding:20 }}>
      
      {/* Main Container */}
      <div style={{ position:'relative', width:860, height:620, background:'#fff', borderRadius:24, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
        
        {/* =========================================================================
            SIGN UP FORM (Right side visually when Purple is Left, but actually absolute right)
            ========================================================================= */}
        <div style={{ 
            position:'absolute', top:0, right:0, width:'50%', height:'100%', padding:'40px', overflowY:'auto',
            transition:'all 0.6s ease-in-out', transform: isLoginMode ? 'translateX(100%)' : 'translateX(0)', opacity: isLoginMode ? 0 : 1, zIndex: isLoginMode ? 1 : 5,
            display:'flex', flexDirection:'column', justifyContent:'center'
          }}>
          
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <div style={{ width:32, height:32, background:'#5B3EF5', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/></svg>
            </div>
            <span style={{ fontWeight:700, fontSize:15, color:'#1a1a2e' }}>Charronix</span>
          </div>

          {step === 'register' ? (
            <>
              <h3 style={{ fontSize:22, fontWeight:800, color:'#7c3aed', margin:'0 0 4px' }}>Create Account</h3>
              <p style={{ fontSize:13, color:'#9ca3af', margin:'0 0 20px' }}>Register your institution to get started.</p>

              <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Field icon="👤" placeholder="First Name" value={form.firstName} onChange={set('firstName')} required />
                  <Field icon="👤" placeholder="Last Name" value={form.lastName} onChange={set('lastName')} required />
                </div>
                <Field icon="🔒" placeholder="Password" type={showPass?'text':'password'} value={form.password} onChange={set('password')} required
                  suffix={<EyeIcon show={showPass} onClick={()=>setShowPass(v=>!v)}/>} />
                <Field icon="🔒" placeholder="Confirm Password" type={showConf?'text':'password'} value={form.confirmPassword} onChange={set('confirmPassword')} required
                  suffix={<EyeIcon show={showConf} onClick={()=>setShowConf(v=>!v)}/>} />
                <Field icon="📞" placeholder="Mobile Number (+91XXXXXXXXXX)" type="tel" value={form.phone} onChange={set('phone')} required />
                <Field icon="📧" placeholder="Email Address" type="email" value={form.email} onChange={set('email')} required />
                <Field icon="🏫" placeholder="Institution Name (optional)" value={form.institutionName} onChange={set('institutionName')} />

                {error && <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#dc2626' }}>{error}</div>}

                <button type="submit" disabled={loading} style={{ background:'linear-gradient(135deg,#7c3aed,#5B3EF5)', color:'#fff', border:'none', borderRadius:8, padding:'13px', fontWeight:700, fontSize:14.5, cursor:'pointer', marginTop:4, opacity:loading?0.7:1, transition:'all 0.2s', boxShadow:'0 4px 14px rgba(91,62,245,0.3)' }}>
                  {loading ? '⏳ Sending OTP...' : 'REGISTER NOW'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h3 style={{ fontSize:22, fontWeight:800, color:'#7c3aed', margin:'0 0 4px' }}>Verify OTP</h3>
              <p style={{ fontSize:13, color:'#9ca3af', margin:'0 0 8px' }}>
                Enter the 6-digit code sent to <strong style={{color:'#5B3EF5'}}>{form.phone}</strong>
              </p>
              <button onClick={()=>{setStep('register');setOtp('');setError('');}} style={{ background:'none', border:'none', color:'#7c3aed', fontSize:12, cursor:'pointer', padding:0, marginBottom:24, fontWeight:600 }}>
                ← Change number
              </button>

              <form onSubmit={handleVerify} style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <OtpInput value={otp} onChange={setOtp} />

                {error && <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#dc2626', textAlign:'center' }}>{error}</div>}

                <button type="submit" disabled={loading || otp.trim().length < 6}
                  style={{ background:'linear-gradient(135deg,#7c3aed,#5B3EF5)', color:'#fff', border:'none', borderRadius:8, padding:'14px', fontWeight:700, fontSize:15, cursor:'pointer', opacity:(loading||otp.trim().length<6)?0.6:1, boxShadow:'0 4px 14px rgba(91,62,245,0.3)' }}>
                  {loading ? '⏳ Verifying...' : '✅ Verify & Continue'}
                </button>

                <div style={{ textAlign:'center', fontSize:13 }}>
                  {resendTimer > 0
                    ? <span style={{ color:'#9ca3af' }}>Resend OTP in <strong>{resendTimer}s</strong></span>
                    : <button type="button" onClick={handleResend} style={{ background:'none', border:'none', color:'#7c3aed', fontWeight:600, cursor:'pointer', fontSize:13 }}>Resend OTP</button>}
                </div>
              </form>
            </>
          )}
        </div>


        {/* =========================================================================
            SIGN IN FORM (Left side visually when Purple is Right)
            ========================================================================= */}
        <div style={{ 
            position:'absolute', top:0, left:0, width:'50%', height:'100%', padding:'60px 40px', overflowY:'auto',
            transition:'all 0.6s ease-in-out', transform: isLoginMode ? 'translateX(0)' : 'translateX(-100%)', opacity: isLoginMode ? 1 : 0, zIndex: isLoginMode ? 5 : 1,
            display:'flex', flexDirection:'column', justifyContent:'center'
          }}>
          
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:32 }}>
            <div style={{ width:36, height:36, background:'#5B3EF5', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/></svg>
            </div>
            <span style={{ fontWeight:700, fontSize:18, color:'#1a1a2e' }}>Charronix</span>
          </div>

          <h3 style={{ fontSize:26, fontWeight:800, color:'#7c3aed', margin:'0 0 6px' }}>Welcome back</h3>
          <p style={{ fontSize:14, color:'#9ca3af', margin:'0 0 32px' }}>Enter your credentials to continue.</p>

          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <Field icon="👤" placeholder="Email or Mobile Number" value={loginForm.identifier} onChange={setL('identifier')} required />
            <Field icon="🔒" placeholder="Password" type={showPass?'text':'password'} value={loginForm.password} onChange={setL('password')} required
              suffix={<EyeIcon show={showPass} onClick={()=>setShowPass(v=>!v)}/>} />

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4, fontSize:13 }}>
              <label style={{ display:'flex', alignItems:'center', gap:6, color:'#4b5563', cursor:'pointer' }}>
                <input type="checkbox" checked={loginForm.rememberMe} onChange={setL('rememberMe')} style={{ accentColor:'#7c3aed', width:16, height:16, cursor:'pointer' }} />
                Remember me
              </label>
              <button type="button" style={{ background:'none', border:'none', color:'#7c3aed', fontWeight:600, cursor:'pointer', padding:0 }}>
                Forgot your password?
              </button>
            </div>

            {loginError && <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#dc2626' }}>{loginError}</div>}

            <button type="submit" disabled={loading} style={{ background:'linear-gradient(135deg,#7c3aed,#5B3EF5)', color:'#fff', border:'none', borderRadius:8, padding:'14px', fontWeight:700, fontSize:15, cursor:'pointer', marginTop:16, opacity:loading?0.7:1, transition:'all 0.2s', boxShadow:'0 4px 14px rgba(91,62,245,0.3)' }}>
              {loading ? '⏳ Signing in...' : 'SIGN IN'}
            </button>
          </form>
        </div>


        {/* =========================================================================
            SLIDING PURPLE OVERLAY CONTAINER
            ========================================================================= */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', overflow: 'hidden',
          transition: 'transform 0.6s ease-in-out', zIndex: 100,
          transform: isLoginMode ? 'translateX(100%)' : 'translateX(0)'
        }}>
          {/* Inner background moving inverse to create parallax sliding effect */}
          <div style={{
            background: 'linear-gradient(160deg,#6d28d9,#7c3aed,#5B3EF5)',
            position: 'absolute', top: 0, left: 0, width: '200%', height: '100%',
            transition: 'transform 0.6s ease-in-out',
            transform: isLoginMode ? 'translateX(-50%)' : 'translateX(0)'
          }}>
            
            {/* Overlay Panel Left (Visible when Purple is on the Left => isLoginMode = false => Sign Up Mode) */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '50%', height: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding:'60px 40px', textAlign:'center', gap:24,
              transition: 'transform 0.6s ease-in-out',
              transform: isLoginMode ? 'translateX(-20%)' : 'translateX(0)',
              opacity: isLoginMode ? 0 : 1, pointerEvents: isLoginMode ? 'none' : 'auto'
            }}>
              <div style={{ width:64, height:64, background:'rgba(255,255,255,0.2)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/></svg>
              </div>
              <div>
                <h2 style={{ color:'#fff', fontSize:26, fontWeight:800, margin:'0 0 12px', lineHeight:1.3 }}>
                  Welcome to<br/>Charronix!
                </h2>
                <p style={{ color:'rgba(255,255,255,0.85)', fontSize:14.5, lineHeight:1.6, margin:0, maxWidth:280 }}>
                  Manage attendance, fees, and student data seamlessly. Please sign in to continue.
                </p>
              </div>
              <button onClick={() => setIsLoginMode(true)} style={{ background:'transparent', border:'2px solid #fff', borderRadius:50, padding:'12px 40px', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer', letterSpacing:'0.05em', marginTop:12, transition:'all 0.2s' }} onMouseOver={e => { e.target.style.background='#fff'; e.target.style.color='#7c3aed'; }} onMouseOut={e => { e.target.style.background='transparent'; e.target.style.color='#fff'; }}>
                SIGN IN
              </button>
            </div>

            {/* Overlay Panel Right (Visible when Purple is on the Right => isLoginMode = true => Sign In Mode) */}
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '50%', height: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding:'60px 40px', textAlign:'center', gap:24,
              transition: 'transform 0.6s ease-in-out',
              transform: isLoginMode ? 'translateX(0)' : 'translateX(20%)',
              opacity: isLoginMode ? 1 : 0, pointerEvents: isLoginMode ? 'auto' : 'none'
            }}>
              <div>
                <h2 style={{ color:'#fff', fontSize:26, fontWeight:800, margin:'0 0 12px', lineHeight:1.3 }}>
                  New to<br/>Charronix?
                </h2>
                <p style={{ color:'rgba(255,255,255,0.85)', fontSize:14.5, lineHeight:1.6, margin:0, maxWidth:280 }}>
                  Create an account to streamline your institution's operations and enhance management efficiency.
                </p>
              </div>
              <button onClick={() => setIsLoginMode(false)} style={{ background:'transparent', border:'2px solid #fff', borderRadius:50, padding:'12px 40px', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer', letterSpacing:'0.05em', marginTop:12, transition:'all 0.2s' }} onMouseOver={e => { e.target.style.background='#fff'; e.target.style.color='#7c3aed'; }} onMouseOut={e => { e.target.style.background='transparent'; e.target.style.color='#fff'; }}>
                SIGN UP
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
