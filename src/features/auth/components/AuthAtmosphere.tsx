export function AuthAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#020617]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(6,182,212,0.28),transparent_55%),radial-gradient(ellipse_at_85%_15%,rgba(245,158,11,0.14),transparent_45%),radial-gradient(ellipse_at_70%_90%,rgba(8,145,178,0.18),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]" />

      <div className="auth-orb absolute -top-24 start-1/4 h-[28rem] w-[28rem] rounded-full bg-brand-500/20 blur-[100px]" />
      <div className="auth-orb-slow absolute -bottom-32 end-0 h-[32rem] w-[32rem] rounded-full bg-brand-400/10 blur-[120px]" />
      <div className="auth-orb absolute top-1/3 -end-20 h-64 w-64 rounded-full bg-accent-500/15 blur-[90px]" />

      <svg
        className="absolute inset-0 h-full w-full opacity-60"
        viewBox="0 0 1200 800"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          className="auth-circuit"
          d="M80 160 C220 160 260 320 420 320 S620 180 780 180 S980 360 1120 360"
          stroke="url(#authStroke)"
          strokeWidth="1.5"
        />
        <path
          className="auth-circuit auth-circuit-delay"
          d="M40 520 C180 520 240 640 390 640 S610 480 780 480 S980 620 1160 620"
          stroke="url(#authStroke)"
          strokeWidth="1.2"
          opacity="0.7"
        />
        <path
          className="auth-circuit auth-circuit-delay-2"
          d="M200 80 L200 280 C200 340 260 360 320 360 L520 360"
          stroke="url(#authStroke)"
          strokeWidth="1"
          opacity="0.5"
        />
        <circle className="auth-node" cx="420" cy="320" r="4" fill="#22d3ee" />
        <circle className="auth-node auth-circuit-delay" cx="780" cy="180" r="3.5" fill="#fbbf24" />
        <circle className="auth-node auth-circuit-delay-2" cx="390" cy="640" r="3.5" fill="#67e8f9" />
        <defs>
          <linearGradient id="authStroke" x1="0" y1="0" x2="1200" y2="0">
            <stop stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="0.4" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="0.7" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#020617] to-transparent" />
      <div className="absolute inset-y-0 start-0 w-40 bg-gradient-to-l from-transparent to-[#020617]/60" />
    </div>
  );
}
