const css = `
  html, body {
    margin: 0;
    height: 100%;
    background: #06121f;
  }

  .loading-shell {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(53, 133, 197, 0.22), transparent 35%),
      radial-gradient(circle at bottom right, rgba(41, 199, 224, 0.16), transparent 30%),
      linear-gradient(135deg, #06121f 0%, #0b1f2f 45%, #091b29 100%);
    z-index: 9999;
  }

  .glow {
    position: absolute;
    border-radius: 9999px;
    filter: blur(80px);
    opacity: 0.65;
    animation: drift 12s ease-in-out infinite alternate;
  }

  .glow-one {
    width: 24rem;
    height: 24rem;
    left: 12%;
    top: 12%;
    background: rgba(63, 160, 220, 0.22);
  }

  .glow-two {
    width: 26rem;
    height: 26rem;
    right: 10%;
    bottom: 10%;
    background: rgba(45, 212, 224, 0.18);
    animation-delay: 2s;
  }

  .loader-card {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: min(90vw, 26rem);
    padding: 2.2rem 2rem 1.8rem;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 1.7rem;
    background: rgba(7, 23, 34, 0.7);
    box-shadow: 0 24px 80px rgba(3, 11, 17, 0.65);
    backdrop-filter: blur(18px);
  }

  .brand-lockup {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }

  .brand {
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: 0.32rem;
    color: #edf8ff;
  }

  .brand-tag {
    font-size: 0.7rem;
    letter-spacing: 0.2rem;
    text-transform: uppercase;
    color: rgba(214, 234, 249, 0.7);
  }

  .orbit {
    position: relative;
    width: 122px;
    height: 122px;
    margin: 1.8rem auto 1.5rem;
  }

  .ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(129, 203, 255, 0.5);
  }

  .ring-outer {
    transform: scale(1.08);
    animation: spin 3.2s linear infinite;
  }

  .ring-middle {
    inset: 12px;
    border-color: rgba(85, 218, 255, 0.75);
    animation: spin 2.4s linear infinite reverse;
  }

  .ring-inner {
    inset: 26px;
    border-color: rgba(255, 255, 255, 0.8);
    animation: pulse 1.8s ease-in-out infinite;
  }

  .dot {
    position: absolute;
    top: 10px;
    left: 50%;
    width: 14px;
    height: 14px;
    margin-left: -7px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d9f7ff 0%, #5ad8ff 100%);
    box-shadow: 0 0 18px rgba(90, 216, 255, 0.8);
    animation: orbit 2.2s ease-in-out infinite;
  }

  .title {
    margin: 0;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: #f0f8ff;
  }

  .subtitle {
    margin: 0.6rem 0 1.1rem;
    text-align: center;
    color: rgba(206, 228, 240, 0.75);
    font-size: 0.9rem;
    letter-spacing: 0.02em;
  }

  .progress-bar {
    width: 100%;
    height: 0.5rem;
    overflow: hidden;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  }

  .progress-fill {
    display: block;
    width: 38%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #69d2ff 0%, #5bc8ff 30%, #7be9ff 100%);
    box-shadow: 0 0 18px rgba(91, 200, 255, 0.9);
    animation: loadingBar 1.8s ease-in-out infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.02); }
    100% { transform: rotate(360deg) scale(1); }
  }

  @keyframes orbit {
    0% { transform: rotate(0deg) translateY(-18px) rotate(0deg); }
    50% { transform: rotate(180deg) translateY(0) rotate(-180deg); }
    100% { transform: rotate(360deg) translateY(-18px) rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(0.96); opacity: 0.7; }
    50% { transform: scale(1.04); opacity: 1; }
  }

  @keyframes loadingBar {
    0% { transform: translateX(-18%); }
    50% { transform: translateX(120%); }
    100% { transform: translateX(260%); }
  }

  @keyframes drift {
    0% { transform: translate3d(0, 0, 0) scale(1); }
    100% { transform: translate3d(20px, -20px, 0) scale(1.14); }
  }

  @media (max-width: 480px) {
    .loader-card {
      padding: 1.8rem 1.2rem 1.4rem;
      border-radius: 1.25rem;
    }

    .brand {
      letter-spacing: 0.24rem;
      font-size: 1.35rem;
    }

    .title {
      font-size: 1.25rem;
    }
  }
`;

export default function Loading() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="loading-shell" role="status" aria-live="polite" aria-label="Loading website">
        <div className="glow glow-one" />
        <div className="glow glow-two" />

        <div className="loader-card">
          <div className="brand-lockup">
            <span className="brand">SEA GO</span>
            <span className="brand-tag">global freight tracking</span>
          </div>

          <div className="orbit" aria-hidden="true">
            <span className="ring ring-outer" />
            <span className="ring ring-middle" />
            <span className="ring ring-inner" />
            <span className="dot" />
          </div>

          <p className="title">Preparing your route</p>
          <p className="subtitle">Loading the homepage and tracking experience…</p>

          <div className="progress-bar" aria-hidden="true">
            <span className="progress-fill" />
          </div>
        </div>
      </div>
    </>
  );
}
