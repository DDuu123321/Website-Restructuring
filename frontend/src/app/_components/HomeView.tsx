'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useI18n, T } from '@/i18n/I18nProvider'
import { Reveal, AnimatedCounter } from '@/components/ui/Reveal'
import { TestimonialForm } from '@/components/ui/TestimonialForm'
import { FreeAssessmentHeroButton } from '@/components/assessment/FreeAssessmentModal'
import { api } from '@/api/client'
import type { Project, Testimonial } from '@/types/cms'

interface Props {
  featuredProjects: Project[]
  featuredTestimonials: Testimonial[]
}

export function HomeView({ featuredProjects, featuredTestimonials }: Props) {
  // Meeting feedback: News section moved off homepage to /news standalone page
  return (
    <>
      <Hero />
      <StatsBleed />
      <PackagesSection />
      <ProcessSection />
      <FeaturesCarousel />
      <ProjectsShowcase projects={featuredProjects} />
      <TestimonialsSection testimonials={featuredTestimonials} />
    </>
  )
}

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
      setVideoResting(true)
      return
    }
    const slow = () => { v.playbackRate = 0.8 }
    slow()
    const reveal = () => setVideoResting(true)
    let started = false
    const onPlay = () => { started = true; slow() }
    // Chrome pauses autoplaying video with no audio track to save power, so
    // `ended` may never fire. Treat any pause after playback started as the
    // signal to reveal — covers natural end, browser intervention, and skip.
    const onPause = () => { if (started) reveal() }
    v.addEventListener('loadedmetadata', slow)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('ended', reveal)
    v.addEventListener('error', reveal)
    // Safety net for blocked autoplay (e.g. data-saver, no user gesture).
    const fallback = setTimeout(reveal, 6000)
    return () => {
      v.removeEventListener('loadedmetadata', slow)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('ended', reveal)
      v.removeEventListener('error', reveal)
      clearTimeout(fallback)
    }
  }, [])

  const skipVideo = () => {
    const v = videoRef.current
    if (v && Number.isFinite(v.duration)) {
      v.currentTime = v.duration
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
            <button type="button" className="hero-play" onClick={() => setShowVideoModal(true)}>
              <span className="play-icon">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M3 1l8 5-8 5V1z"/></svg>
              </span>
              <span>{t('h.cta2')}</span>
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
          <Reveal className="stat" delay={240}><div className="num">4.9 / 5</div><div className="lbl">{t('h.s3')}</div></Reveal>
          <Reveal className="stat" delay={360}><div className="num"><AnimatedCounter to={137} />+</div><div className="lbl">{t('h.s4')}</div></Reveal>
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
      <img src="/hero-house.png" alt="" className="energy-scene-img" />
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

// Legacy SVG diagram kept for reference; the hero now uses EnergyFlowImage.
function EnergyFlowDiagram({ idPrefix }: { idPrefix: string }) {
  const sun = `${idPrefix}-sun`
  const glow = `${idPrefix}-glow`
  const wallFront = `${idPrefix}-wallFront`
  const wallSide = `${idPrefix}-wallSide`
  const roofFront = `${idPrefix}-roofFront`
  const roofSide = `${idPrefix}-roofSide`
  const pvGrad = `${idPrefix}-pvGrad`
  const particles = [
    { p: 'sunPV',    c: '#FFB300', dur: '2.6s', begin: '0s'   },
    { p: 'pvBat',    c: '#22c55e', dur: '2.4s', begin: '0.4s' },
    { p: 'pvEv',     c: '#F59E42', dur: '2.6s', begin: '0.8s' },
    { p: 'batEv',    c: '#22c55e', dur: '2.4s', begin: '1.2s' },
    { p: 'gridHome', c: '#5da9f5', dur: '3s',   begin: '1.4s' },
    { p: 'homeGrid', c: '#22c55e', dur: '3.2s', begin: '0.6s' },
  ]
  /* Geometry (isometric, depth = +60x / -50y consistently):
       Front wall:     (440,340) → (760,580)
       Front ridge:    (600,220)
       Back ridge:     (660,170)  [front ridge + depth offset]
       Back roof eave: (820,290)  [front right eave + depth offset]
       Back wall edge: (820,530)  [front right base + depth offset]
     Keeping a single depth vector keeps every face parallel & the silhouette tidy. */
  return (
    <svg className="fx-flow-svg" viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <radialGradient id={sun} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="55%" stopColor="#FFA727" />
          <stop offset="100%" stopColor="#F57C00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={wallFront} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2a4a78" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0c204a" stopOpacity="0.78" />
        </linearGradient>
        <linearGradient id={wallSide} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#040c1e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#142e58" stopOpacity="0.78" />
        </linearGradient>
        <linearGradient id={roofFront} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#85b0e0" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#3a5d96" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={roofSide} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#476f9f" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1f3a62" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={pvGrad} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0e3e6c" />
          <stop offset="100%" stopColor="#062446" />
        </linearGradient>
        <filter id={glow} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connecting paths */}
      <g className="fx-flow-paths" stroke="rgba(255,255,255,0.2)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeDasharray="5 8">
        <path id={`${idPrefix}-sunPV`}    d="M 195 165 Q 340 220 478 305" />
        <path id={`${idPrefix}-pvBat`}    d="M 510 320 C 500 410 505 470 525 510" />
        <path id={`${idPrefix}-pvEv`}     d="M 690 320 C 700 410 695 470 685 510" />
        <path id={`${idPrefix}-batEv`}    d="M 575 515 Q 630 520 640 520" />
        <path id={`${idPrefix}-gridHome`} d="M 990 430 Q 905 425 825 425" />
        <path id={`${idPrefix}-homeGrid`} d="M 825 450 Q 905 460 990 455" />
      </g>

      {/* Animated energy particles */}
      <g>
        {particles.map((it, i) => (
          <circle key={i} className="fx-pulse" r="4.8" fill={it.c} filter={`url(#${glow})`}>
            <animateMotion dur={it.dur} repeatCount="indefinite" begin={it.begin}>
              <mpath href={`#${idPrefix}-${it.p}`} />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur={it.dur} repeatCount="indefinite" begin={it.begin} />
          </circle>
        ))}
      </g>

      {/* SUN — top left, rays beaming toward the rooftop PV */}
      <g className="fx-node" transform="translate(150 130)">
        <circle r="68" fill={`url(#${sun})`} />
        <circle r="28" fill="#FFA726" />
        <g stroke="#FFA726" strokeWidth="2.8" strokeLinecap="round">
          <line x1="0" y1="-40" x2="0" y2="-54" />
          <line x1="0" y1="40" x2="0" y2="54" />
          <line x1="-40" y1="0" x2="-54" y2="0" />
          <line x1="40" y1="0" x2="54" y2="0" />
          <line x1="-28" y1="-28" x2="-37" y2="-37" />
          <line x1="28" y1="28" x2="37" y2="37" />
          <line x1="-28" y1="28" x2="-37" y2="37" />
          <line x1="28" y1="-28" x2="37" y2="-37" />
        </g>
        <text y="92" textAnchor="middle" className="fx-node-label">SUN</text>
      </g>

      {/* HOME — 3D isometric house in the center, with PV on roof and Battery + EV inside */}
      <g className="fx-house">
        {/* Back roof slope (face behind the front ridge) — drawn FIRST so the front overlaps it */}
        <polygon points="600,220 660,170 820,290 760,340" fill={`url(#${roofSide})`} stroke="#5da9f5" strokeWidth="1.6" strokeLinejoin="round" />
        {/* Right side wall (depth parallelogram) */}
        <polygon points="760,340 820,290 820,530 760,580" fill={`url(#${wallSide})`} stroke="#5da9f5" strokeWidth="1.6" strokeLinejoin="round" />
        {/* Front wall */}
        <rect x="440" y="340" width="320" height="240" fill={`url(#${wallFront})`} stroke="#5da9f5" strokeWidth="2" />
        {/* Front roof — gable triangle (drawn AFTER the wall so the eave line wins) */}
        <polygon points="440,340 600,220 760,340" fill={`url(#${roofFront})`} stroke="#5da9f5" strokeWidth="2" strokeLinejoin="round" />
        {/* Ridge highlight (front → back) */}
        <line x1="600" y1="220" x2="660" y2="170" stroke="rgba(160,210,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />

        {/* PV panels on FRONT roof — perfectly aligned to the two gable slopes */}
        {/* Left slope: from (440,340) → (600,220), inset 12px from edges */}
        <polygon points="468,335 590,243 595,253 478,345" fill={`url(#${pvGrad})`} stroke="#FFA726" strokeWidth="1.5" strokeLinejoin="round" />
        <g stroke="#FFA726" strokeWidth="0.9" opacity="0.7">
          <line x1="498" y1="312" x2="505" y2="323" />
          <line x1="528" y1="289" x2="535" y2="300" />
          <line x1="558" y1="266" x2="565" y2="277" />
        </g>
        {/* Right slope: from (600,220) → (760,340), inset 12px */}
        <polygon points="610,243 732,335 722,345 605,253" fill={`url(#${pvGrad})`} stroke="#FFA726" strokeWidth="1.5" strokeLinejoin="round" />
        <g stroke="#FFA726" strokeWidth="0.9" opacity="0.7">
          <line x1="642" y1="266" x2="635" y2="277" />
          <line x1="672" y1="289" x2="665" y2="300" />
          <line x1="702" y1="312" x2="695" y2="323" />
        </g>

        {/* Floor line — anchors the room visually */}
        <line x1="440" y1="580" x2="760" y2="580" stroke="rgba(120,180,240,0.55)" strokeWidth="1.6" />

        {/* BATTERY inside the home (left half of interior) */}
        <g transform="translate(530 530)">
          <rect x="-46" y="-30" width="92" height="60" rx="6" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="2" />
          <rect x="-38" y="-36" width="18" height="6" fill="#22c55e" />
          <rect x="20" y="-36" width="18" height="6" fill="#22c55e" />
          <rect x="-34" y="-16" width="68" height="8" rx="1.5" fill="#22c55e" />
          <rect x="-34" y="-4" width="60" height="8" rx="1.5" fill="#22c55e" opacity="0.75" />
          <rect x="-34" y="8" width="42" height="8" rx="1.5" fill="#22c55e" opacity="0.5" />
          <text y="55" textAnchor="middle" className="fx-node-label" fill="#22c55e">BATTERY</text>
        </g>

        {/* EV inside the home (right half of interior) */}
        <g transform="translate(685 535)">
          <path d="M -58 10 Q -50 -16 -28 -22 L 28 -22 Q 50 -16 58 10 L 58 22 L -58 22 Z"
                fill="rgba(245,158,66,0.22)" stroke="#F59E42" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M -38 -12 L -28 -22 L 28 -22 L 38 -12 Z" fill="rgba(93,169,245,0.32)" stroke="#5da9f5" strokeWidth="1.3" strokeLinejoin="round" />
          <circle cx="-32" cy="25" r="11" fill="#0a1828" stroke="#F59E42" strokeWidth="1.8" />
          <circle cx="32" cy="25" r="11" fill="#0a1828" stroke="#F59E42" strokeWidth="1.8" />
          <circle cx="-32" cy="25" r="4" fill="#F59E42" opacity="0.85" />
          <circle cx="32" cy="25" r="4" fill="#F59E42" opacity="0.85" />
          <text y="55" textAnchor="middle" className="fx-node-label" fill="#F59E42">EV</text>
        </g>

        {/* HOME label below the house */}
        <text x="610" y="635" textAnchor="middle" className="fx-node-label">HOME</text>
      </g>

      {/* GRID — power tower beside the house, scaled to match the house */}
      <g className="fx-node" transform="translate(1050 430)">
        {/* Two tapered legs */}
        <line x1="-34" y1="150" x2="-12" y2="-90" stroke="#5da9f5" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="34" y1="150" x2="12" y2="-90" stroke="#5da9f5" strokeWidth="2.6" strokeLinecap="round" />
        {/* Inner truss diagonals */}
        <line x1="-30" y1="120" x2="30" y2="120" stroke="#5da9f5" strokeWidth="1.4" />
        <line x1="-30" y1="120" x2="-22" y2="60" stroke="#5da9f5" strokeWidth="1.1" opacity="0.7" />
        <line x1="30" y1="120" x2="22" y2="60" stroke="#5da9f5" strokeWidth="1.1" opacity="0.7" />
        <line x1="-22" y1="60" x2="22" y2="60" stroke="#5da9f5" strokeWidth="1.4" />
        <line x1="-22" y1="60" x2="-16" y2="10" stroke="#5da9f5" strokeWidth="1.1" opacity="0.7" />
        <line x1="22" y1="60" x2="16" y2="10" stroke="#5da9f5" strokeWidth="1.1" opacity="0.7" />
        <line x1="-16" y1="10" x2="16" y2="10" stroke="#5da9f5" strokeWidth="1.4" />
        {/* Cross-arms holding the lines */}
        <line x1="-30" y1="-30" x2="30" y2="-30" stroke="#5da9f5" strokeWidth="2" strokeLinecap="round" />
        <line x1="-24" y1="-60" x2="24" y2="-60" stroke="#5da9f5" strokeWidth="1.8" strokeLinecap="round" />
        {/* Insulators */}
        <circle cx="-26" cy="-30" r="2.4" fill="#5da9f5" />
        <circle cx="0" cy="-30" r="2.4" fill="#5da9f5" />
        <circle cx="26" cy="-30" r="2.4" fill="#5da9f5" />
        <circle cx="-20" cy="-60" r="2" fill="#5da9f5" />
        <circle cx="20" cy="-60" r="2" fill="#5da9f5" />
        {/* Top antenna */}
        <line x1="0" y1="-90" x2="0" y2="-110" stroke="#5da9f5" strokeWidth="2" strokeLinecap="round" />
        <circle cy="-112" r="5" fill="#5da9f5">
          <animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <text y="178" textAnchor="middle" className="fx-node-label">GRID</text>
      </g>
    </svg>
  )
}

function ProcessSection() {
  const { t } = useI18n()
  const steps = [
    { n: '01', t: t('p.s1.t'), d: t('p.s1.d'), img: '/process-1.png' },
    { n: '02', t: t('p.s2.t'), d: t('p.s2.d'), img: '/process-2.png' },
    { n: '03', t: t('p.s3.t'), d: t('p.s3.d'), img: '/process-3.png' },
    { n: '04', t: t('p.s4.t'), d: t('p.s4.d'), img: '/process-4.png' },
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
        <div className="container proc-pin-grid">
          {/* LEFT — sticky title + step list */}
          <div className="proc-pin-l">
            <div className="section-eye" style={{ color: 'var(--bv-teal-300)' }}>
              {t('sect.process.eye')}
            </div>
            <h2 className="proc-pin-h" dangerouslySetInnerHTML={{ __html: t('sect.process.h') }} />
            <p className="proc-pin-lede">{t('sect.process.lede')}</p>

            <ol className="proc-pin-list">
              {steps.map((s, i) => (
                <li
                  key={s.n}
                  className={`proc-pin-item ${i === activeIdx ? 'active' : ''} ${i < activeIdx ? 'past' : ''}`}
                >
                  <span className="proc-pin-n">{s.n}</span>
                  <div className="proc-pin-body">
                    <h4>{s.t}</h4>
                    <p>{s.d}</p>
                  </div>
                  <span className="proc-pin-bar"><span className="proc-pin-bar-fill" /></span>
                </li>
              ))}
            </ol>

            <div className="proc-pin-progress" aria-hidden>
              <span className="proc-pin-progress-fill" style={{ width: `${((activeIdx + 1) / steps.length) * 100}%` }} />
            </div>
          </div>

          {/* RIGHT — sticky image stack, crossfade by activeIdx */}
          <div className="proc-pin-r">
            <div className="proc-pin-frame">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className={`proc-pin-img ${i === activeIdx ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${s.img})` }}
                  aria-hidden
                />
              ))}
              <div className="proc-pin-img-overlay" />
              <div className="proc-pin-img-tag">
                <span className="dot" />
                <span>STEP {steps[activeIdx].n} / {steps[steps.length - 1].n}</span>
              </div>
            </div>
          </div>
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
        <img src="/Rebates.png" alt="Happy Australian couple reviewing energy savings dashboard outside their solar-powered home" />
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
        <img src="/Why%20Bluven.png" alt="Bluven engineer on a residential rooftop reviewing solar installation on a tablet" />
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
        <img src="/Battery%20Value.png" alt="Modern Australian home with wall-mounted battery and EV charging in the carport" />
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
            From Sydney to Melbourne to Brisbane — see what we built recently.
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

function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const { t } = useI18n()

  // Curated review examples — meeting feedback removed source labels (GOOGLE / FACEBOOK etc.)
  const examples = [
    { text: '"From quote to install in 11 days — neighbours waited 8 weeks."', name: 'Liam M.', location: 'Mosman, NSW' },
    { text: '"Got 4 quotes — only Bluven sent an actual engineer onsite."', name: 'Priya S.', location: 'Box Hill, VIC' },
    { text: '"4.2-year payback on our café system. Customers love it."', name: 'Marco D.', location: 'Newtown, NSW' },
    { text: '"Engineer caught a roof shading issue the others missed."', name: 'David L.', location: 'Coogee, NSW' },
    { text: '"Battery paid for itself faster than the loan."', name: 'Aisha K.', location: 'Brisbane, QLD' },
    { text: '"Honest pricing. Zero upsell. Refreshing."', name: 'Mark R.', location: 'Perth, WA' },
    { text: '"Bills dropped 92% in summer. Neighbours keep asking."', name: 'Rachel S.', location: 'Adelaide, SA' },
    { text: '"They handled every rebate form. We just signed."', name: 'Tom B.', location: 'Hobart, TAS' },
    { text: '"Two years in. Still answering my emails on weekends."', name: 'Jenny H.', location: 'Newcastle, NSW' },
    { text: '"EV charging straight from the sun. Genius setup."', name: 'Liam W.', location: 'Geelong, VIC' },
    { text: '"Quote was 22% lower than competitors for the same gear."', name: 'Priya N.', location: 'Canberra, ACT' },
    { text: '"First proper engineer who understood our 3-phase setup."', name: 'Daniel M.', location: 'Sunshine Coast, QLD' },
  ]

  const live = testimonials.map(d => ({
    text: `"${d.review}"`,
    name: d.customerName,
    location: d.suburb,
  }))

  // CMS reviews + examples; CMS first
  const all = [...live, ...examples]
  // Duplicate for seamless horizontal loop
  const looped = [...all, ...all]

  return (
    <section className="section testimonials-fit" style={{ background: 'var(--bv-paper-2)' }}>
      <div className="container">
        <Reveal style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <div className="section-eye" style={{ display: 'inline-block' }}>{t('sect.test.eye')}</div>
          <h2 className="section-h" style={{ margin: '0 auto', maxWidth: '24ch' }}>{t('sect.test.h')}</h2>
        </Reveal>

        <div className="test-row-marquee" aria-hidden="false">
          <div className="test-row-track">
            {looped.map((it, i) => (
              <div className="test-card test-card-h" key={i}>
                <div className="test-stars">★★★★★</div>
                <p className="test-quote">{it.text}</p>
                <div className="test-author">
                  <div className="test-avatar">{it.name.charAt(0)}</div>
                  <div>
                    <div className="n">{it.name}</div>
                    <div className="l">{it.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Reveal style={{ marginTop: 40 }}>
          <TestimonialForm viewMoreHref="/reviews" />
        </Reveal>
      </div>
    </section>
  )
}

