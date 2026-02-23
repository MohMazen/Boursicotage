import { useState } from "react";

const candlestickData = [
  { open: 40, close: 55, high: 60, low: 35 },
  { open: 55, close: 45, high: 62, low: 40 },
  { open: 45, close: 70, high: 75, low: 42 },
  { open: 70, close: 60, high: 78, low: 55 },
  { open: 60, close: 80, high: 85, low: 57 },
  { open: 80, close: 65, high: 88, low: 60 },
  { open: 65, close: 90, high: 95, low: 62 },
  { open: 90, close: 75, high: 97, low: 70 },
  { open: 75, close: 95, high: 100, low: 72 },
  { open: 95, close: 110, high: 115, low: 90 },
];

const CHART_W = 300;
const CHART_H = 100;
const BAR_W = 18;
const MIN_VAL = 30;
const MAX_VAL = 120;

function scaleY(val) {
  return CHART_H - ((val - MIN_VAL) / (MAX_VAL - MIN_VAL)) * CHART_H;
}

function CandlestickChart() {
  return (
    <svg width={CHART_W} height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
      {candlestickData.map((c, i) => {
        const x = i * (BAR_W + 12) + 6;
        const isUp = c.close >= c.open;
        const bodyTop = scaleY(Math.max(c.open, c.close));
        const bodyH = Math.max(2, Math.abs(scaleY(c.open) - scaleY(c.close)));
        const color = isUp ? "#00e5a0" : "#ff4d6d";
        return (
          <g key={i} opacity={0.85}>
            <line
              x1={x + BAR_W / 2}
              y1={scaleY(c.high)}
              x2={x + BAR_W / 2}
              y2={scaleY(c.low)}
              stroke={color}
              strokeWidth={1.5}
            />
            <rect x={x} y={bodyTop} width={BAR_W} height={bodyH} fill={color} rx={2} />
          </g>
        );
      })}
    </svg>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .brs-root {
    min-height: 100vh;
    background: #0a0c10;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    overflow: hidden;
    position: relative;
  }

  .brs-bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,229,160,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,160,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .brs-bg-glow {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,229,160,0.08) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .brs-card {
    position: relative;
    z-index: 1;
    background: rgba(15,18,25,0.95);
    border: 1px solid rgba(0,229,160,0.15);
    border-radius: 20px;
    padding: 52px 56px;
    width: 480px;
    max-width: 95vw;
    box-shadow:
      0 0 0 1px rgba(0,229,160,0.05),
      0 32px 80px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.04);
    animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .brs-ticker {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 32px;
    animation: fadeUp 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both;
  }

  .brs-ticker-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00e5a0;
    box-shadow: 0 0 8px #00e5a0;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .brs-ticker-label {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #00e5a0;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .brs-chart-wrap {
    margin-bottom: 36px;
    border-radius: 10px;
    overflow: hidden;
    background: rgba(0,229,160,0.02);
    border: 1px solid rgba(0,229,160,0.08);
    padding: 16px 12px 8px;
    animation: fadeUp 0.6s 0.15s cubic-bezier(0.22,1,0.36,1) both;
  }

  .brs-logo {
    font-size: 38px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 6px;
    animation: fadeUp 0.6s 0.2s cubic-bezier(0.22,1,0.36,1) both;
  }

  .brs-logo span {
    color: #00e5a0;
  }

  .brs-tagline {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.06em;
    margin-bottom: 44px;
    animation: fadeUp 0.6s 0.25s cubic-bezier(0.22,1,0.36,1) both;
  }

  .brs-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 16px;
    animation: fadeUp 0.6s 0.3s cubic-bezier(0.22,1,0.36,1) both;
  }

  .brs-buttons {
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: fadeUp 0.6s 0.35s cubic-bezier(0.22,1,0.36,1) both;
  }

  .brs-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.01em;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    overflow: hidden;
  }

  .brs-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .brs-btn:hover::before { opacity: 1; }
  .brs-btn:hover { transform: translateY(-2px); }
  .brs-btn:active { transform: translateY(0px); }

  .brs-btn-primary {
    background: #00e5a0;
    color: #0a0c10;
    box-shadow: 0 4px 24px rgba(0,229,160,0.25);
  }

  .brs-btn-primary::before {
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  }

  .brs-btn-primary:hover {
    box-shadow: 0 8px 32px rgba(0,229,160,0.45);
  }

  .brs-btn-secondary {
    background: transparent;
    color: #fff;
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }

  .brs-btn-secondary::before {
    background: rgba(255,255,255,0.04);
  }

  .brs-btn-secondary:hover {
    border-color: rgba(0,229,160,0.4);
    box-shadow: 0 8px 24px rgba(0,229,160,0.1);
  }

  .brs-btn-icon {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brs-btn-badge {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 100px;
    letter-spacing: 0.08em;
  }

  .brs-btn-primary .brs-btn-badge {
    background: rgba(0,0,0,0.18);
    color: rgba(0,0,0,0.6);
  }

  .brs-btn-secondary .brs-btn-badge {
    background: rgba(0,229,160,0.12);
    color: #00e5a0;
  }

  .brs-arrow {
    font-size: 20px;
    transition: transform 0.2s;
  }

  .brs-btn:hover .brs-arrow {
    transform: translateX(4px);
  }

  .brs-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
  }

  .brs-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.07);
  }

  .brs-divider-text {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.1em;
  }

  .brs-footer {
    margin-top: 36px;
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.15);
    text-align: center;
    letter-spacing: 0.08em;
    animation: fadeUp 0.6s 0.45s cubic-bezier(0.22,1,0.36,1) both;
  }

  .brs-selected {
    transform: translateY(-2px) !important;
    outline: 2px solid #00e5a0;
    outline-offset: 3px;
  }
`;

export default function BoursicotageHome() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <style>{styles}</style>
      <div className="brs-root">
        <div className="brs-bg-grid" />
        <div className="brs-bg-glow" />

        <div className="brs-card">
          <div className="brs-ticker">
            <div className="brs-ticker-dot" />
            <span className="brs-ticker-label">Marché virtuel • Simulation en direct</span>
          </div>

          <div className="brs-chart-wrap">
            <CandlestickChart />
          </div>

          <div className="brs-logo">Bours<span>i</span>cotage</div>
          <div className="brs-tagline">// SIMULATION DE MARCHÉ BOURSIER VIRTUEL</div>

          <div className="brs-label">Choisir un mode de jeu</div>

          <div className="brs-buttons">
            <button
              className={`brs-btn brs-btn-primary${selected === 1 ? " brs-selected" : ""}`}
              onClick={() => setSelected(1)}
            >
              <div className="brs-btn-icon">
                <span>👤</span>
                <span>1 Joueur</span>
                <span className="brs-btn-badge">SOLO</span>
              </div>
              <span className="brs-arrow">→</span>
            </button>

            <div className="brs-divider">
              <div className="brs-divider-line" />
              <span className="brs-divider-text">OU</span>
              <div className="brs-divider-line" />
            </div>

            <button
              className={`brs-btn brs-btn-secondary${selected === 2 ? " brs-selected" : ""}`}
              onClick={() => setSelected(2)}
            >
              <div className="brs-btn-icon">
                <span>👥</span>
                <span>2 Joueurs</span>
                <span className="brs-btn-badge">VS</span>
              </div>
              <span className="brs-arrow">→</span>
            </button>
          </div>

          {selected && (
            <div style={{
              marginTop: 20,
              padding: "12px 16px",
              borderRadius: 10,
              background: "rgba(0,229,160,0.07)",
              border: "1px solid rgba(0,229,160,0.2)",
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              color: "#00e5a0",
              textAlign: "center",
              letterSpacing: "0.06em",
              animation: "fadeUp 0.3s ease both"
            }}>
              Mode {selected === 1 ? "Solo" : "2 Joueurs"} sélectionné — Lancement en cours...
            </div>
          )}

          <div className="brs-footer">UNIVERSITÉ ÉVRY · PARIS-SACLAY · MIAGE 2025–2026</div>
        </div>
      </div>
    </>
  );
}
