'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useI18n, T } from '@/i18n/I18nProvider'
import { Reveal, AnimatedCounter } from '@/components/ui/Reveal'
import { FreeAssessmentHeroButton } from '@/components/assessment/FreeAssessmentModal'
import { api } from '@/api/client'
import type { Project } from '@/types/cms'

interface Props {
  featuredProjects: Project[]
}

export function HomeView({ featuredProjects }: Props) {
  // Meeting feedback: News section moved off homepage to /news standalone page
  return (
    <>
      <Hero />
      <StatsBleed />
      <PackagesSection />
      <ProcessSection />
      <FeaturesCarousel />
      <ProjectsShowcase projects={featuredProjects} />
    </>
  )
}

// Hero background video: play a slow single pass from VIDEO_START and freeze on
// VIDEO_REST (a hand-picked frame). The natural end (~12.3s) fades to black, so
// we stop short — the scrim then sits over this frame so it shows through faintly.
const VIDEO_START = 1.5
const VIDEO_REST = 11.5

function Hero() {
  const { t } = useI18n()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoResting, setVideoResting] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)

  // The scrim and hero copy stay hidden while the background video plays; they
  // reveal — sliding in from the left — only once the video finishes its single
  // 0.8x play-through and freezes on its last frame (see .hero--video-rest).
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // No playback: jump straight to the resting frame and hold.
      const settle = () => { try { v.currentTime = VIDEO_REST } catch {} ; v.pause(); setVideoResting(true) }
      if (v.readyState >= 1) settle()
      else v.addEventListener('loadedmetadata', settle, { once: true })
      return
    }
    const init = () => {
      v.playbackRate = 0.8
      if (v.currentTime < VIDEO_START) { try { v.currentTime = VIDEO_START } catch {} }
    }
    if (v.readyState >= 1) init()
    const reveal = () => setVideoResting(true)
    let started = false
    const onPlay = () => { started = true; v.playbackRate = 0.8 }
    // Freeze on VIDEO_REST rather than running on to the black end frame.
    const onTimeUpdate = () => {
      if (v.currentTime >= VIDEO_REST) {
        v.pause()
        try { v.currentTime = VIDEO_REST } catch {}
        reveal()
      }
    }
    // Chrome pauses autoplaying muted video to save power, so the rest may
    // arrive early via `pause`; treat that as the reveal cue too.
    const onPause = () => { if (started) reveal() }
    v.addEventListener('loadedmetadata', init)
    v.addEventListener('play', onPlay)
    v.addEventListener('timeupdate', onTimeUpdate)
    v.addEventListener('pause', onPause)
    v.addEventListener('ended', reveal)
    v.addEventListener('error', reveal)
    // Safety net for blocked autoplay (e.g. data-saver, no user gesture).
    const fallback = setTimeout(reveal, 15000)
    return () => {
      v.removeEventListener('loadedmetadata', init)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('timeupdate', onTimeUpdate)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('ended', reveal)
      v.removeEventListener('error', reveal)
      clearTimeout(fallback)
    }
  }, [])

  const skipVideo = () => {
    const v = videoRef.current
    if (v) {
      try { v.currentTime = VIDEO_REST } catch {}
      v.pause()
    }
    setVideoResting(true)
  }

  return (
    <section
      className={`hero ${videoResting ? 'hero--video-rest' : ''}`}
      data-screen-label="Home Hero"
    >
      {/* Real homepage video background — plays once, then freezes on last frame */}
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay
        muted
        playsInline
        preload="auto"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      <button type="button" className="hero-skip" onClick={skipVideo}>
        <span>Skip video</span>
        <span className="hero-skip-arrow" aria-hidden="true">→</span>
      </button>

      <div className="hero-content">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span className="dot"></span>
            <span>AUSTRALIA'S LOCAL ENERGY PARTNER</span>
          </div>
          <h1 className="hero-h1">
            <span className="line"><T k="h.title1" /></span>
            <span className="line"><span className="accent"><T k="h.title2" /></span></span>
            <span className="line"><T k="h.title3" /></span>
          </h1>
          <p className="hero-lede">{t('h.lede')}</p>

          <div className="hero-cta-row">
            <FreeAssessmentHeroButton />
            <Link className="btn hero-btn-outline" href="/quote">
              <span>Get a Quote</span>
            </Link>
            <button
              type="button"
              className="hero-play"
              onClick={() => setShowVideoModal(true)}
              aria-label={t('h.cta2')}
              title={t('h.cta2')}
            >
              <span className="play-icon">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3 1l8 5-8 5V1z"/></svg>
              </span>
            </button>
          </div>

          {/* 3 advantages — Mory emphasis */}
          <ul className="hero-advantages">
            <li>
              <span className="hero-adv-check" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <b>CPEng-led design</b>
            </li>
            <li>
              <span className="hero-adv-check" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <b>Nationwide SAA network</b>
            </li>
            <li>
              <span className="hero-adv-check" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <b>10-Year product warranty</b>
            </li>
          </ul>
        </div>
        <div className="hero-diagram">
          <EnergyFlowImage idPrefix="hero" />
        </div>
      </div>

      <div className="hero-scroll"><span>SCROLL</span><span className="line"></span></div>

      {showVideoModal && (
        <VideoModal src="/hero-video.mp4" onClose={() => setShowVideoModal(false)} />
      )}
    </section>
  )
}

function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const handlePlay = () => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.playbackRate = 1
    v.play()
    setPlaying(true)
  }

  return (
    <div className="video-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="video-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="video-modal-close" onClick={onClose} aria-label="Close video">×</button>
        <video
          ref={videoRef}
          src={src}
          controls={playing}
          playsInline
          onEnded={() => setPlaying(false)}
        />
        {!playing && (
          <button className="video-modal-play" onClick={handlePlay} aria-label="Play video">
            <svg viewBox="0 0 24 24" fill="currentColor" width="42" height="42">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function StatsBleed() {
  const { t } = useI18n()
  return (
    <section className="stats-bleed">
      <div className="container">
        <div className="stats-grid">
          <Reveal className="stat"><div className="num"><AnimatedCounter to={2400} />+</div><div className="lbl">{t('h.s1')}</div></Reveal>
          <Reveal className="stat" delay={120}><div className="num"><AnimatedCounter to={42} />M+</div><div className="lbl">{t('h.s2')}</div></Reveal>
          <Reveal className="stat" delay={240}><div className="num"><AnimatedCounter to={137} />+</div><div className="lbl">{t('h.s4')}</div></Reveal>
        </div>
      </div>
    </section>
  )
}

function PackagesSection() {
  const tiers = [
    {
      id: 'starter',
      name: 'Bluven Starter',
      category: 'SMART SAVINGS',
      tagline: 'Perfect for smaller energy users',
      power: '5kW',
      features: [
        'Up to 50kWh Battery Storage Capacity',
        '10 years product warranty',
        'Smart generation monitoring via App',
        'VPP Ready for extra grid earnings',
      ],
    },
    {
      id: 'standard',
      name: 'Bluven Standard',
      category: 'EVERYDAY RELIABILITY',
      tagline: 'Reliable power, day and night, for most households',
      power: '10kW',
      features: [
        'All Starter features included',
        'Store excess solar for night-time use',
        'Backup power during blackouts',
        'Reduce reliance on the grid',
      ],
      popular: true,
    },
    {
      id: 'premium',
      name: 'Bluven Premium',
      category: 'NO LIMITS POWER',
      tagline: 'Power your EV, pool, and everything else — without compromise',
      power: '10–25kW',
      features: [
        'All Standard features included',
        'Balanced 3-phase power for high-demand homes',
        'Built for all-electric living',
        'Future-ready for growing energy needs',
      ],
    },
  ]

  return (
    <section id="packages" className="tier-section">
      <div className="tier-container">
        <Reveal className="tier-header">
          <h2 className="tier-eye">Our Packages</h2>
          <h3 className="tier-h">Find the Right Fit for Your Home</h3>
          <p className="tier-lede">
            From lower bills to full energy independence — there's a system built for your home.
          </p>
        </Reveal>

        <div className="tier-grid">
          {tiers.map((t, i) => (
            <Reveal
              key={t.id}
              className={`tier-card ${t.popular ? 'tier-card--popular' : ''}`}
              delay={i * 130}
            >
              {t.popular && (
                <span className="tier-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 21.4l1.5-6.8L2.2 9l6.9-.7L12 2z" />
                  </svg>
                  Most Popular
                </span>
              )}
              <div className="tier-head">
                <h4 className="tier-name">{t.name}</h4>
                <h5 className="tier-cat">{t.category}</h5>
                <p className="tier-tagline">{t.tagline}</p>
              </div>
              <div className="tier-spec">
                <div className="tier-spec-row">
                  <span className="tier-spec-big">Maximized</span>{' '}
                  <span className="tier-spec-sm">Solar</span>
                </div>
                <div className="tier-spec-row">
                  <span className="tier-spec-mid">{t.power}</span>{' '}
                  <span className="tier-spec-sm">Hybrid Power Capacity</span>
                </div>
              </div>
              <ul className="tier-features">
                {t.features.map((f, j) => (
                  <li key={j}>
                    <svg className="tier-check" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.2 14.2l-3.5-3.5 1.4-1.4 2.1 2.1 4.6-4.6 1.4 1.4-6 6z" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/quote" className="tier-cta">
                {t.popular && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 1.5l1.8 5.4 5.7.2-4.5 3.5 1.6 5.5L12 13l-4.6 3.1 1.6-5.5L4.5 7.1l5.7-.2L12 1.5zM19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2zM5 16l.5 1.4 1.5.5-1.5.5L5 19.8l-.5-1.4L3 17.9l1.5-.5L5 16z" />
                  </svg>
                )}
                Get a Quote
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// Energy flow — Sigenergy-style realistic 3D house photo + animated SVG
// energy beams overlay. `idPrefix` keeps SVG ids unique.
// Image: /hero-house.png (transparent PNG, ~3:2 aspect)
// Particle paths are calibrated to key points on the photo:
//   - sun beam → left rooftop PV
//   - left PV → wall-mounted battery
//   - right PV → EV in carport
//   - battery → EV
//   - utility pole ↔ house (two-way grid)
function EnergyFlowImage({ idPrefix }: { idPrefix: string }) {
  const glow = `${idPrefix}-glow`
  const halo = `${idPrefix}-halo`
  const sunGrad = `${idPrefix}-sunGrad`

  /* Key anchor points on the 1536×1024 hero-house.png. The wall battery is
     the central hub: both rooftop PVs feed into it down the white wall,
     and from it energy flows along the ground to the grid pole and
     sideways into the EV.
       sun (drawn in SVG) : (1039, 100)
       left rooftop PV    : (510, 295)
       right rooftop PV   : (840, 365)
       wall battery (hub) : (720, 555)
       EV charging port   : (1240, 670)
       utility pole top   : (1500, 380)                                    */
  /* User-supplied coordinates (7 segments) */
  const flowPaths = [
    { id: 'L1', d: 'M 975 150 L 843 365' },  // sunbeam → right PV
    { id: 'L2', d: 'M 843 365 L 843 546' },  // right PV down the wall
    { id: 'L3', d: 'M 843 546 L 705 546' },  // wall → battery (right approach)
    { id: 'L4', d: 'M 700 610 L 700 710' },  // battery → ground
    { id: 'L5', d: 'M 700 710 L 1230 680' }, // ground → EV
    { id: 'L6', d: 'M 700 550 L 450 550' },  // battery → left
    { id: 'L7', d: 'M 450 550 L 450 510' },  // left turn → up
  ]
  const nodes = [
    { cx: 843,  cy: 365, r: 9 },   // right rooftop PV
    { cx: 700,  cy: 550, r: 13 },  // wall battery — central hub
    { cx: 1230, cy: 680, r: 9 },   // EV
    { cx: 450,  cy: 510, r: 8 },   // left-side terminus
  ]
  const particles = [
    { p: 'L1', c: '#FFD54F', dur: '2.6s', begin: '0s'   },
    { p: 'L2', c: '#7dd3fc', dur: '1.8s', begin: '0.3s' },
    { p: 'L3', c: '#7dd3fc', dur: '1.4s', begin: '0.6s' },
    { p: 'L4', c: '#7dd3fc', dur: '1.2s', begin: '0.9s' },
    { p: 'L5', c: '#7dd3fc', dur: '2.4s', begin: '1.2s' },
    { p: 'L6', c: '#7dd3fc', dur: '2.0s', begin: '0.5s' },
    { p: 'L7', c: '#7dd3fc', dur: '1.0s', begin: '1.0s' },
  ]

  return (
    <div className="energy-scene">
      <Image
        src="/hero-house.png"
        alt=""
        fill
        priority
        sizes="(max-width: 1000px) 100vw, 1000px"
        className="energy-scene-img"
      />
      <svg
        className="energy-scene-fx"
        viewBox="0 0 1536 1024"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <radialGradient id={sunGrad} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE9A8" />
            <stop offset="55%" stopColor="#FFA727" />
            <stop offset="100%" stopColor="#F57C00" stopOpacity="0" />
          </radialGradient>
          {/* Wide soft halo for ambient bloom around lines & nodes */}
          <filter id={halo} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          {/* Tight glow for the bright core line & node centers */}
          <filter id={glow} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* SUN — user-positioned at (1039, 100) */}
        <g transform="translate(1039 100)">
          <circle r="78" fill={`url(#${sunGrad})`} />
          <circle r="34" fill="#FFA726" />
          <g stroke="#FFA726" strokeWidth="3.5" strokeLinecap="round">
            <line x1="0" y1="-48" x2="0" y2="-66" />
            <line x1="0" y1="48"  x2="0"  y2="66" />
            <line x1="-48" y1="0" x2="-66" y2="0" />
            <line x1="48"  y1="0" x2="66"  y2="0" />
            <line x1="-34" y1="-34" x2="-46" y2="-46" />
            <line x1="34"  y1="34"  x2="46"  y2="46" />
            <line x1="-34" y1="34"  x2="-46" y2="46" />
            <line x1="34"  y1="-34" x2="46"  y2="-46" />
          </g>
        </g>

        {/* HALO LAYER — wide soft blue bloom behind each line */}
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="rgba(125,211,252,0.32)"
          strokeWidth="16"
          filter={`url(#${halo})`}
        >
          {flowPaths.map((p) => (
            <path key={p.id} d={p.d} />
          ))}
        </g>

        {/* CORE LAYER — thin bright cyan solid line (no dash, no flow chase) */}
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="#e0f2fe"
          strokeWidth="2.6"
          filter={`url(#${glow})`}
        >
          {flowPaths.map((p) => (
            <path key={p.id} id={`${idPrefix}-${p.id}`} d={p.d} />
          ))}
        </g>

        {/* GLOWING NODES — each = wide breathing halo + small bright core */}
        {nodes.map((n, i) => (
          <g key={i} transform={`translate(${n.cx} ${n.cy})`}>
            <circle r={n.r * 2.4} fill="rgba(125,211,252,0.28)" filter={`url(#${halo})`}>
              <animate
                attributeName="r"
                values={`${n.r * 2.2};${n.r * 3};${n.r * 2.2}`}
                dur="3.4s"
                repeatCount="indefinite"
                begin={`${i * 0.22}s`}
              />
              <animate
                attributeName="opacity"
                values="0.55;0.95;0.55"
                dur="3.4s"
                repeatCount="indefinite"
                begin={`${i * 0.22}s`}
              />
            </circle>
            <circle r={n.r * 0.55} fill="#f0f9ff" filter={`url(#${glow})`} />
          </g>
        ))}

        {/* FLYING PARTICLES — one bright orb travels along each flow path */}
        <g>
          {particles.map((it) => (
            <circle
              key={it.p}
              r="7"
              fill={it.c}
              filter={`url(#${glow})`}
            >
              <animateMotion dur={it.dur} repeatCount="indefinite" begin={it.begin}>
                <mpath href={`#${idPrefix}-${it.p}`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.1;0.85;1"
                dur={it.dur}
                repeatCount="indefinite"
                begin={it.begin}
              />
            </circle>
          ))}
        </g>

      </svg>
    </div>
  )
}

function ProcessSection() {
  const { t } = useI18n()
  const steps = [
    { n: '01', t: t('p.s1.t'), d: t('p.s1.d'), img: '/process-1.webp' },
    { n: '02', t: t('p.s2.t'), d: t('p.s2.d'), img: '/process-2.webp' },
    { n: '03', t: t('p.s3.t'), d: t('p.s3.d'), img: '/process-3.webp' },
    { n: '04', t: t('p.s4.t'), d: t('p.s4.d'), img: '/process-4.webp' },
  ]
  const [activeIdx, setActiveIdx] = useState(0)
  const sectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 800
      // Progress: 0 when top of section enters bottom of viewport, 1 when section's scroll travel ends
      const start = rect.top - vh * 0.2
      const total = rect.height - vh
      let progress = -start / total
      progress = Math.max(0, Math.min(0.999, progress))
      const idx = Math.min(steps.length - 1, Math.floor(progress * steps.length))
      setActiveIdx(idx)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [steps.length])

  return (
    <section ref={sectionRef} className="proc-pin" id="how">
      <div className="proc-pin-inner">
        <div className="container proc-pin-stack">

          {/* 1 — CENTERED HEADER (full-width block, no left column) */}
          <header className="proc-pin-head">
            <div className="section-eye" style={{ color: 'var(--bv-teal-300)' }}>
              {t('sect.process.eye')}
            </div>
            {/* heading kept verbatim (incl. any <br/>) via the i18n string */}
            <h2 className="proc-pin-h" dangerouslySetInnerHTML={{ __html: t('sect.process.h') }} />
          </header>

          {/* 2 — HORIZONTAL STEPPER (journey indicator + progress fill) */}
          <nav className="proc-pin-stepper" aria-label="Process steps">
            {/* progress track behind the 4 cells; fill WIDTH driven by activeIdx
                (same formula the old vertical rail used, now horizontal) */}
            <span className="proc-pin-prog" aria-hidden>
              <span
                className="proc-pin-prog-fill"
                style={{ width: `${(activeIdx / (steps.length - 1)) * 100}%` }}
              />
            </span>
            <ol className="proc-pin-steps">
              {steps.map((s, i) => (
                <li
                  key={s.n}
                  className={`proc-pin-step ${i === activeIdx ? 'active' : ''} ${i < activeIdx ? 'past' : ''}`}
                  aria-current={i === activeIdx ? 'step' : undefined}
                  aria-label={`Step ${s.n}: ${s.t}`}
                >
                  <span className="proc-pin-dot" aria-hidden>{s.n}</span>
                </li>
              ))}
            </ol>
          </nav>

          {/* 3 — STAGE: image + glass card that CYCLES the 4 corners by step */}
          <div className="proc-pin-stage">
            <div className="proc-pin-imgwrap">
              <div className="proc-pin-frame">
                {steps.map((s, i) => (
                  <div
                    key={s.n}
                    className={`proc-pin-img ${i === activeIdx ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${s.img})` }}
                    aria-hidden
                  />
                ))}
                <div className="proc-pin-img-overlay" aria-hidden />
                <div className="proc-pin-img-tag" aria-hidden>
                  <span className="dot" />
                  <span>STEP {steps[activeIdx].n} / {steps[steps.length - 1].n}</span>
                </div>
              </div>

              {/* glass card — ACTIVE step's FULL content. Corner set by activeIdx
                  (tl → bl → br → tr) and animates between corners via left/top %.
                  key={activeIdx} re-fires the content fade. */}
              <div
                className={`proc-pin-card pos-${['tl', 'bl', 'br', 'tr'][activeIdx] || 'tl'}`}
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="proc-pin-card-inner" key={activeIdx}>
                  <span className="proc-pin-card-n">{steps[activeIdx].n}</span>
                  <h3 className="proc-pin-card-t">{steps[activeIdx].t}</h3>
                  <p className="proc-pin-card-d">{steps[activeIdx].d}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 — MOBILE-ONLY static list: ALL four steps, full text, no truncation.
              Hidden on desktop via CSS; shown at <=900px so no description is lost. */}
          <ol className="proc-pin-mlist">
            {steps.map((s, i) => (
              <li key={s.n} className={`proc-pin-mitem ${i === activeIdx ? 'active' : ''}`}>
                <span className="proc-pin-mn">{s.n}</span>
                <div className="proc-pin-mbody">
                  <h4>{s.t}</h4>
                  <p>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>

        </div>
      </div>
    </section>
  )
}

function FeaturesCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const tabs = [
    { n: '01', label: 'Battery Value' },
    { n: '02', label: 'Why Bluven' },
    { n: '03', label: 'Rebates' },
  ]

  const goTo = (i: number) => {
    const track = trackRef.current
    if (!track) return
    setActiveIdx(i)
    const target = i * track.clientWidth
    track.scrollTo({ left: target, behavior: 'smooth' })
    requestAnimationFrame(() => {
      if (Math.abs(track.scrollLeft - target) > track.clientWidth / 2) {
        track.scrollLeft = target
      }
    })
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const idx = Math.round(track.scrollLeft / track.clientWidth)
        setActiveIdx(idx)
        ticking = false
      })
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-rotate every 6s; pauses while hovered or when user is interacting
  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      const track = trackRef.current
      if (!track) return
      const next = (activeIdx + 1) % 3
      setActiveIdx(next)
      const target = next * track.clientWidth
      track.scrollTo({ left: target, behavior: 'smooth' })
      requestAnimationFrame(() => {
        if (Math.abs(track.scrollLeft - target) > track.clientWidth / 2) {
          track.scrollLeft = target
        }
      })
    }, 6000)
    return () => clearInterval(id)
  }, [activeIdx, isPaused])

  return (
    <section
      className="features-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <div className="features-carousel-tabs">
          {tabs.map((tab, i) => (
            <button
              key={i}
              type="button"
              className={`features-carousel-tab ${i === activeIdx ? 'is-active' : ''}`}
              onClick={() => goTo(i)}
            >
              <span className="features-carousel-tab-n">{tab.n}</span>
              <span className="features-carousel-tab-t">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="features-carousel-track" ref={trackRef}>
        <div className="features-carousel-panel"><BatteryBenefitsPanel /></div>
        <div className="features-carousel-panel"><WhyChoosePanel /></div>
        <div className="features-carousel-panel"><RebatesPanel /></div>
      </div>
      <button
        type="button"
        className="features-nav features-nav-prev"
        onClick={() => goTo(Math.max(0, activeIdx - 1))}
        disabled={activeIdx === 0}
        aria-label="Previous panel"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button
        type="button"
        className="features-nav features-nav-next"
        onClick={() => goTo(Math.min(2, activeIdx + 1))}
        disabled={activeIdx === 2}
        aria-label="Next panel"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </section>
  )
}

function RebatesPanel() {
  const items = [
    {
      title: 'Federal STC Rebates',
      desc: 'Lower your upfront system cost with government-backed energy incentives.',
    },
    {
      title: 'High ROI',
      desc: 'See real savings over time, with many systems paying back within a few years.',
    },
    {
      title: 'We Handle Everything',
      desc: 'From eligibility checks to STC applications and flexible green finance.',
    },
  ]
  return (
    <div className="feature-panel container">
      <div className="feature-panel-media" data-poster="rebates">
        <Image src="/Rebates.png" alt="Happy Australian couple reviewing energy savings dashboard outside their solar-powered home" width={480} height={600} sizes="(max-width: 900px) 100vw, 480px" />
      </div>
      <div className="feature-panel-content">
        <div className="section-eye">MAXIMIZE ROI</div>
        <h2 className="section-h">Let Government Rebates Do the Heavy Lifting on Your Costs</h2>
        <span className="feature-panel-divider" />
        <p className="feature-panel-lede">Take advantage of federal and state rebates to lower your upfront cost — we handle the paperwork.</p>
        <ul className="feature-panel-checklist">
          {items.map((it, i) => (
            <li key={i}>
              <span className="feature-panel-check"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
              <div>
                <span className="feature-panel-check-t">{it.title}</span>
                <span className="feature-panel-check-d">{it.desc}</span>
              </div>
            </li>
          ))}
        </ul>
        <Link className="btn btn-primary feature-panel-cta" href="/quote">
          <span>Get Your Free Savings Estimate</span> <span className="arrow">→</span>
        </Link>
      </div>
    </div>
  )
}

function WhyChoosePanel() {
  const items = [
    {
      title: 'Engineering-Led, Not Sales-Driven',
      desc: 'Designed and reviewed by qualified engineers — focused on safety, performance, and long-term reliability.',
    },
    {
      title: 'Local, Accountable, Responsive',
      desc: 'A local Australian team that listens first — responsive support before, during, and after installation.',
    },
    {
      title: 'From Start to Long-Term Support',
      desc: 'End-to-end service from design to installation and beyond — only trusted Tier 1 products.',
    },
  ]
  return (
    <div className="feature-panel container">
      <div className="feature-panel-media" data-poster="why-bluven">
        <Image src="/why-bluven.png" alt="Bluven engineer on a residential rooftop reviewing solar installation on a tablet" width={480} height={600} sizes="(max-width: 900px) 100vw, 480px" />
      </div>
      <div className="feature-panel-content">
        <div className="section-eye">CHOOSE BLUVEN</div>
        <h2 className="section-h">Why Choose Bluven Energy?</h2>
        <span className="feature-panel-divider" />
        <p className="feature-panel-lede">Engineer-led design, local team, long-term support — you deserve more than just solar.</p>
        <ul className="feature-panel-checklist">
          {items.map((it, i) => (
            <li key={i}>
              <span className="feature-panel-check"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
              <div>
                <span className="feature-panel-check-t">{it.title}</span>
                <span className="feature-panel-check-d">{it.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function BatteryBenefitsPanel() {
  const items = [
    {
      title: 'Harvest Today, Power Tonight',
      desc: 'Store your daytime sun to cancel out expensive peak rates at night, instead of leaking it back to the grid.',
    },
    {
      title: 'Track Your Flow, Own Your Data',
      desc: "Monitor your home's energy in real-time and shift usage away from high-cost hours.",
    },
    {
      title: 'Stay Connected, Stay Bright',
      desc: 'Automatically keep your essential appliances running during any grid outage.',
    },
  ]
  return (
    <div className="feature-panel container">
      <div className="feature-panel-media" data-poster="battery">
        <Image src="/battery-value.png" alt="Modern Australian home with wall-mounted battery and EV charging in the carport" width={480} height={600} sizes="(max-width: 900px) 100vw, 480px" />
      </div>
      <div className="feature-panel-content">
        <div className="section-eye">WHY UPGRADE TO BATTERY STORAGE NOW?</div>
        <h2 className="section-h">Cut your electricity bills with 3 hours of free midday charging</h2>
        <span className="feature-panel-divider" />
        <p className="feature-panel-lede">Battery storage is more than a box on the wall — it makes your solar work 24/7.</p>
        <ul className="feature-panel-checklist">
          {items.map((it, i) => (
            <li key={i}>
              <span className="feature-panel-check"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
              <div>
                <span className="feature-panel-check-t">{it.title}</span>
                <span className="feature-panel-check-d">{it.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ProjectsShowcase({ projects }: { projects: Project[] }) {
  // Use CMS projects when available; otherwise show curated placeholders
  type Card = { id: string; href: string; img: string; location: string; title: string; summary: string; spec?: string }

  const cards: Card[] = projects.length
    ? projects.slice(0, 6).map(p => ({
        id: p.id,
        href: `/projects/${p.slug}`,
        img: api.imgUrl(p.coverImage, 'hero') || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80',
        location: p.location,
        title: p.title,
        summary: p.summary,
        spec: p.systemType,
      }))
    : [
        {
          id: 'p1', href: '/projects',
          img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1400&q=80',
          location: 'Mosman, NSW',
          title: 'Harbour-side villa · 13 kW + Tesla Powerwall',
          summary: 'Shingled modules with whole-home backup. 6.8-year payback.',
          spec: 'Solar + Battery',
        },
        {
          id: 'p2', href: '/projects',
          img: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=1400&q=80',
          location: 'Box Hill, VIC',
          title: 'Townhouse · 10 kW + 10 kWh',
          summary: 'Federal battery rebate applied. $4,200/yr saving.',
          spec: 'Solar + Battery',
        },
        {
          id: 'p3', href: '/projects',
          img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1400&q=80',
          location: 'Newtown, NSW',
          title: 'Commercial café · 50 kW',
          summary: '4.2-year payback; daytime self-consumption 80%+.',
          spec: 'Commercial',
        },
        {
          id: 'p4', href: '/projects',
          img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1400&q=80',
          location: 'Manly, NSW',
          title: 'EV household · 13 kW + 16 kWh + 22 kW charger',
          summary: 'Solar-aware charging. Bills from $620 → $38.',
          spec: 'Solar + Battery + EV',
        },
        {
          id: 'p5', href: '/projects',
          img: 'https://images.unsplash.com/photo-1545209463-e2825498edbf?w=1400&q=80',
          location: 'Parramatta, NSW',
          title: 'Starter home · 6.6 kW',
          summary: 'Tier-1 panels with STC rebate handled.',
          spec: 'Solar Only',
        },
      ]

  return (
    <section className="section showcase">
      <div className="container">
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div className="section-eye" style={{ color: 'var(--bv-teal-300)', display: 'inline-block' }}>
            Recent installations
          </div>
          <h2 className="section-h" style={{ color: 'var(--bv-white)', margin: '0 auto 14px', maxWidth: '24ch' }}>
            600+ Australian roofs. Every one engineered.
          </h2>
          <p className="section-lede" style={{ color: 'rgba(255,255,255,0.72)', margin: '0 auto' }}>
            From Sydney to Brisbane to Perth — see what we built recently.
          </p>
        </Reveal>

        <ProjectsCarousel cards={cards} />

        <Reveal style={{ marginTop: 24, textAlign: 'center' }}>
          <Link className="btn btn-primary" href="/projects">
            <span>View all projects</span> <span className="arrow">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function ProjectsCarousel({ cards }: { cards: Array<{ id: string; href: string; img: string; location: string; title: string; summary: string; spec?: string }> }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = cards.length

  // Auto-advance
  useEffect(() => {
    if (paused || total <= 1) return
    const id = setInterval(() => setActive(a => (a + 1) % total), 5500)
    return () => clearInterval(id)
  }, [paused, total])

  const prev = () => setActive(a => (a - 1 + total) % total)
  const next = () => setActive(a => (a + 1) % total)

  return (
    <div
      className="pc-shell"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button className="pc-arrow pc-prev" onClick={prev} aria-label="Previous project">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button className="pc-arrow pc-next" onClick={next} aria-label="Next project">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <div className="pc-viewport">
        <div className="pc-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {cards.map(c => (
            <div className="pc-slide" key={c.id}>
              <Link href={c.href} className="pc-card">
                <div className="pc-img" style={{ backgroundImage: `url(${c.img})` }} />
                <div className="pc-overlay" />
                <div className="pc-body">
                  {c.spec && <span className="pc-tag">{c.spec}</span>}
                  <div className="pc-loc">{c.location}</div>
                  <h3 className="pc-title">{c.title}</h3>
                  <p className="pc-sum">{c.summary}</p>
                  <span className="pc-cta">
                    View case study <span className="arrow">→</span>
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="pc-controls">
        <div className="pc-counter">
          <span>{String(active + 1).padStart(2, '0')}</span>
          <span className="pc-counter-divider">/</span>
          <span>{String(total).padStart(2, '0')}</span>
        </div>
        <div className="pc-dots">
          {cards.map((_, i) => (
            <button
              key={i}
              className={`pc-dot ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>
        <div className="pc-progress" aria-hidden>
          <span
            key={active /* restart animation per slide */}
            className={`pc-progress-fill ${paused ? 'paused' : ''}`}
          />
        </div>
      </div>
    </div>
  )
}


