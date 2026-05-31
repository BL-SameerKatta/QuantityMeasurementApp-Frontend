import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const CATEGORIES = {
  LENGTH: {
    name: 'Length',
    icon: '📏',
    units: ['METER', 'CENTIMETER', 'MILLIMETER', 'KILOMETER', 'INCH', 'FEET', 'YARD'],
    supportsArithmetic: true
  },
  WEIGHT: {
    name: 'Weight',
    icon: '⚖️',
    units: ['KILOGRAM', 'GRAM', 'POUND'],
    supportsArithmetic: true
  },
  TEMPERATURE: {
    name: 'Temperature',
    icon: '🌡️',
    units: ['CELSIUS', 'FAHRENHEIT', 'KELVIN'],
    supportsArithmetic: false
  },
  VOLUME: {
    name: 'Volume',
    icon: '🧪',
    units: ['LITRE', 'MILLILITRE', 'GALLON'],
    supportsArithmetic: true
  }
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [activeCategory, setActiveCategory] = useState('LENGTH');
  const [activeAction, setActiveAction] = useState('Arithmetic');
  const [arithmeticOp, setArithmeticOp] = useState('add');

  const [value1, setValue1] = useState('');
  const [unit1, setUnit1] = useState('METER');
  const [value2, setValue2] = useState('');
  const [unit2, setUnit2] = useState('METER');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [calcTime, setCalcTime] = useState(null);

  // Reset units when category changes
  useEffect(() => {
    const defaultUnit = CATEGORIES[activeCategory].units[0];
    setUnit1(defaultUnit);
    setUnit2(defaultUnit);
    setResult(null);
    setErrorMsg('');
    if (!CATEGORIES[activeCategory].supportsArithmetic) {
      setActiveAction('Comparison');
    }
  }, [activeCategory]);

  const calculate = useCallback(async () => {
    if (value1 === '' || value2 === '') {
      setResult(null);
      return;
    }

    setErrorMsg('');
    setLoading(true);
    const t0 = performance.now();

    const op = activeAction === 'Comparison' ? 'compare' : arithmeticOp;
    const payload = [
      { value: parseFloat(value1) || 0, unit: unit1 },
      { value: parseFloat(value2) || 0, unit: unit2 }
    ];

    try {
      const response = await fetch(`${API_BASE}/quantity/${op}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setResult({ op, data });
    } catch (err) {
      let msg = err.message || 'Operation failed';
      if (msg.includes('UnsupportedOperationException') || msg.includes('does not support')) {
        msg = `${CATEGORIES[activeCategory].name} does not support arithmetic operations.`;
      } else if (msg.includes('Different unit categories')) {
        msg = 'Cannot mix different unit categories.';
      }
      setErrorMsg(msg);
      setResult(null);
    } finally {
      setCalcTime(`${(performance.now() - t0).toFixed(1)}ms`);
      setLoading(false);
    }
  }, [value1, value2, unit1, unit2, activeAction, arithmeticOp, activeCategory, token]);

  // Auto-calculate whenever dependencies change
  useEffect(() => {
    const timer = setTimeout(() => {
      calculate();
    }, 400); // slight debounce for typing
    return () => clearTimeout(timer);
  }, [calculate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const body = isRegistering ? { name, email, password } : { email, password };
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (response.ok) {
        if (isRegistering) {
          setIsRegistering(false);
          setAuthError('✓ Registration successful — please log in.');
        } else {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        }
      } else {
        setAuthError(data.message || 'Authentication failed');
      }
    } catch {
      setAuthError('Connection error. Ensure API Gateway is running on port 8080.');
    }
  };

  const formatResult = () => {
    if (!result) return null;
    if (result.op === 'compare') return result.data ? 'EQUAL' : 'NOT EQUAL';
    if (result.op === 'divide') return Number(result.data).toPrecision(6);
    return Number(result.data.value).toPrecision(6);
  };

  const resultUnit = result && result.op !== 'compare' && result.op !== 'divide' ? result.data?.unit : null;

  // ───────────────── AUTH SCREEN ─────────────────
  if (!token) {
    return (
      <>
        <div className="bg-anim-mesh">
          <div className="bg-orb orb-c" />
          <div className="bg-orb orb-m" />
          <div className="bg-orb orb-p" />
        </div>
        <header className="top-header">
          <h1>Quantity Measurement</h1>
        </header>
        <div className="auth-wrap">
          <div className="auth-box neon-panel">
            <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isRegistering ? 'Join the precision engine today' : 'Sign in to access your dashboard'}</p>

            {authError && (
              <div className={`alert ${authError.startsWith('✓') ? 'alert-success' : 'alert-error'}`}>
                {authError.startsWith('✓') ? '✓' : '⚠'} {authError.replace('✓ ', '')}
              </div>
            )}

            <form onSubmit={handleAuth}>
              {isRegistering && (
                <div className="auth-input-group stagger-1">
                  <label>Username</label>
                  <input type="text" placeholder="Your name" value={name}
                    onChange={e => setName(e.target.value)} required />
                </div>
              )}
              <div className="auth-input-group stagger-2">
                <label>Email Address</label>
                <input type="email" placeholder="name@domain.com" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="auth-input-group stagger-3">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="auth-btn stagger-4">
                {isRegistering ? 'CREATE ACCOUNT' : 'SIGN IN'}
              </button>
            </form>

            <div className="auth-link stagger-5">
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
              <span onClick={() => { setIsRegistering(v => !v); setAuthError(''); }}>
                {isRegistering ? 'Login here' : 'Register here'}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ───────────────── DASHBOARD ─────────────────
  return (
    <>
      <div className="bg-anim-mesh">
        <div className="bg-orb orb-c" />
        <div className="bg-orb orb-m" />
        <div className="bg-orb orb-p" />
      </div>

      <header className="top-header stagger-1">
        <h1>Quantity Measurement</h1>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </header>

      <div className="layout-wrapper">

        {/* ── LEFT SIDEBAR: Choose Type ── */}
        <aside className="sidebar stagger-2">
          <div className="sidebar-title">Choose Type</div>
          <div className="type-list">
            {Object.entries(CATEGORIES).map(([key, cat], i) => (
              <div
                key={key}
                className={`type-item neon-panel ${activeCategory === key ? 'active' : ''}`}
                style={{ animationDelay: `${0.1 + i * 0.08}s`, animation: `slideFadeIn 0.6s ease-out ${0.1 + i * 0.08}s backwards` }}
                onClick={() => setActiveCategory(key)}
              >
                <span className="type-icon">{cat.icon}</span>
                <h3>{cat.name}</h3>
              </div>
            ))}
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="content-area">

          {/* Choose Action */}
          <section className="stagger-2">
            <div style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem' }}>
              Choose Action
            </div>
            <div className="action-segments neon-panel" style={{ padding: '0.5rem' }}>
              <button
                className={`action-btn ${activeAction === 'Comparison' ? 'active' : ''}`}
                onClick={() => setActiveAction('Comparison')}
              >
                ⇌ &nbsp; Comparison
              </button>
              <button
                className={`action-btn ${activeAction === 'Arithmetic' ? 'active' : ''}`}
                onClick={() => setActiveAction('Arithmetic')}
                disabled={!CATEGORIES[activeCategory].supportsArithmetic}
              >
                ∑ &nbsp; Arithmetic
              </button>
            </div>
          </section>

          {/* Measurement Inputs */}
          <section className="measure-container stagger-3">

            {/* Value 1 */}
            <div className="input-block">
              <div className="input-label">Value 1</div>
              <div className="input-box">
                <input
                  type="number"
                  step="any"
                  className="num-input"
                  placeholder="0"
                  value={value1}
                  onChange={e => setValue1(e.target.value)}
                />
                <select
                  className="unit-select"
                  value={unit1}
                  onChange={e => setUnit1(e.target.value)}
                >
                  {CATEGORIES[activeCategory].units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Operator / Compare Badge */}
            <div className="op-area">
              {activeAction === 'Comparison' ? (
                <div className="compare-badge">⇌</div>
              ) : (
                <>
                  {[
                    { sym: '+', op: 'add', label: 'Add' },
                    { sym: '−', op: 'subtract', label: 'Sub' },
                    { sym: '÷', op: 'divide', label: 'Div' }
                  ].map(({ sym, op }) => (
                    <button
                      key={op}
                      className={`op-toggle ${arithmeticOp === op ? 'active' : ''}`}
                      onClick={() => setArithmeticOp(op)}
                    >{sym}</button>
                  ))}
                </>
              )}
            </div>

            {/* Value 2 */}
            <div className="input-block">
              <div className="input-label">Value 2</div>
              <div className="input-box">
                <input
                  type="number"
                  step="any"
                  className="num-input"
                  placeholder="0"
                  value={value2}
                  onChange={e => setValue2(e.target.value)}
                />
                <select
                  className="unit-select"
                  value={unit2}
                  onChange={e => setUnit2(e.target.value)}
                >
                  {CATEGORIES[activeCategory].units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

          </section>

          {/* Result Area */}
          <section className="stagger-4">
            <div style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem' }}>
              Result {calcTime && <span className="calc-time">({calcTime})</span>}
            </div>
            <div className="result-card-anim neon-panel">
              <div>
                <div className="res-lbl">Output · {activeAction === 'Comparison' ? 'Compare' : arithmeticOp}</div>
                {loading && <div className="res-val loading">Computing…</div>}
              {!loading && errorMsg && <div className="res-val error">{errorMsg}</div>}
              {!loading && !errorMsg && result && (
                <div key={JSON.stringify(result)} className="res-val">{formatResult()}</div>
              )}
              {!loading && !errorMsg && !result && (
                <div className="res-val muted">—</div>
              )}
              </div>

              {resultUnit && (
                <select className="unit-select" disabled value={resultUnit}
                  style={{ minWidth: '180px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                  <option value={resultUnit}>{resultUnit}</option>
                </select>
              )}
            </div>
          </section>

          {/* Footer Info */}
          <div className="footer-meta stagger-5">
            <span><span className="status-dot" />Precision Engine Active</span>
            <span>End-to-End Encrypted</span>
            {calcTime && <span>Last calc: {calcTime}</span>}
          </div>

        </div>
      </div>
    </>
  );
}
