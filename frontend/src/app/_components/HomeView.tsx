'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type * as React from 'react'
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
      <BrandWall />
    </>
  )
}

// Row 1 — brand partners marquee. Logo files live at
// /public/brand-logos/<slug>.(svg|png|webp) — drop one in and the card shows it;
// brands without a file yet fall back to a monogram + name.
const BRAND_ROW: { name: string; slug: string }[] = [
  { name: 'FoxESS', slug: 'foxess' },   { name: 'Sungrow', slug: 'sungrow' },
  { name: 'GoodWe', slug: 'goodwe' },   { name: 'Sigenergy', slug: 'sigenergy' },
  { name: 'AlphaESS', slug: 'alphaess' }, { name: 'JA Solar', slug: 'jasolar' },
  { name: 'Jinko', slug: 'jinko' },     { name: 'LONGi', slug: 'longi' },
  { name: 'Trina', slug: 'trina' },     { name: 'Aiko', slug: 'aiko' },
  { name: 'Tesla', slug: 'tesla' },     { name: 'Zappi', slug: 'zappi' },
]

// Row 2 — company accreditation certificates (real badges, downloaded from the
// original site). Files live at /public/accreditations/.
const CERT_ROW: { name: string; img: string }[] = [
  { name: 'Clean Energy Council Member', img: '/accreditations/cec-member.png' },
  { name: 'Solar Accreditation Australia — Accredited Installer', img: '/accreditations/saa-accredited.png' },
  { name: 'Smart Energy Council — Small Business Member', img: '/accreditations/sec-member.jpg' },
  { name: 'Engineers Australia', img: '/accreditations/engineers-australia.jpg' },
  { name: 'AlphaESS Approved Installer', img: '/accreditations/alphaess-installer.jpg' },
]

const LOGO_EXTS = ['svg', 'png', 'webp'] as const
// Reversed logos (white artwork made for dark backgrounds) get a dark inset so they
// stay visible on the white card. Every other logo is colour and sits on the card.
const DARK_LOGOS = new Set(['aiko', 'sigenergy', 'jasolar'])

// One brand card. A resolved logo is shown on its own (the wordmark already carries
// the name); a brand with no logo file yet falls back to a monogram + name. The <img>
// resolves /public/brand-logos/<slug>.(svg|png|webp) in order, and only starts loading
// after mount — a fast SSR 404 could otherwise fire its error before onError is wired,
// and an SVG's zero intrinsic size could be misread as a failure.
function BrandCard({ name, slug }: { name: string; slug: string }) {
  const [mounted, setMounted] = useState(false)
  const [extIdx, setExtIdx] = useState(0)
  useEffect(() => setMounted(true), [])

  if (extIdx >= LOGO_EXTS.length) {
    return (
      <li className="brandcard brandcard--text">
        <span className="brandcard-mono" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
        <span className="brandcard-name">{name}</span>
      </li>
    )
  }
  return (
    <li className={`brandcard brandcard--logo ${DARK_LOGOS.has(slug) ? 'is-dark' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={extIdx}
        className="brandcard-img"
        src={mounted ? `/brand-logos/${slug}.${LOGO_EXTS[extIdx]}` : undefined}
        alt={name}
        draggable={false}
        onError={() => setExtIdx(i => i + 1)}
      />
    </li>
  )
}

function BrandWall() {
  const { t } = useI18n()
  return (
    <section className="section brandwall" id="brands">
      <div className="container">
        <Reveal className="brandwall-head">
          <h2 className="section-h section-h--2line">{t('sect.brands.h')}</h2>
        </Reveal>
      </div>

      <div className="brandwall-rows">
        {/* Row 1 — brand partners */}
        <Reveal className="brandrow">
          <div className="brandrow-marquee">
            <div className="brandrow-track" style={{ '--n': BRAND_ROW.length } as React.CSSProperties}>
              {[0, 1].map(dup => (
                <ul className="brandrow-seg" key={dup} aria-hidden={dup === 1 || undefined}>
                  {BRAND_ROW.map((b, i) => (
                    <BrandCard key={`${b.slug}-${i}`} name={b.name} slug={b.slug} />
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Row 2 — company accreditations (reverse scroll). The 5 certs repeat so
           one marquee half stays wider than the viewport for a seamless loop. */}
        <Reveal className="brandrow" delay={80}>
          {(() => {
            const half = [...CERT_ROW, ...CERT_ROW]
            return (
              <div className="brandrow-marquee is-reverse">
                <div className="brandrow-track" style={{ '--n': half.length } as React.CSSProperties}>
                  {[0, 1].map(dup => (
                    <ul className="brandrow-seg" key={dup} aria-hidden={dup === 1 || undefined}>
                      {half.map((c, i) => (
                        <li className="brandcard brandcard--cert" key={`${c.img}-${i}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img className="brandcard-cert-img" src={c.img} alt={c.name} title={c.name} draggable={false} />
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            )
          })()}
        </Reveal>
      </div>
    </section>
  )
}

// Hero background video: play a slow single pass from VIDEO_START and freeze on
// VIDEO_REST (a hand-picked frame). The video fades to black from ~9.9s (pure
// black by 11.13s), so we stop just before the fade — the scrim then sits over
// this frame so it shows through faintly. Re-measure VIDEO_REST (ffmpeg
// blackdetect) whenever hero-video.mp4 is replaced.
const VIDEO_START = 1.5
const VIDEO_REST = 9.8

function Hero() {
  const { t } = useI18n()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoResting, setVideoResting] = useState(false)
  const [noVideo, setNoVideo] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)

  // The scrim and hero copy stay hidden while the background video plays; they
  // reveal — sliding in from the left — only once the video finishes its single
  // 0.8x play-through and freezes on its last frame (see .hero--video-rest).
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    // Phones don't get the background video at all — autoplay kept breaking
    // (power saver / data saver / network) and the user call is: flat brand
    // navy instead. Abort the in-flight download, unmount the element, and
    // reveal the copy immediately. 760px matches the CSS hero breakpoints.
    if (window.matchMedia('(max-width: 760px)').matches) {
      try {
        v.pause()
        while (v.firstChild) v.removeChild(v.firstChild)
        v.load()
      } catch {}
      setNoVideo(true)
      setVideoResting(true)
      return
    }
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
    // Kick playback explicitly. React never renders the `muted` attribute into
    // server HTML (long-standing React quirk), so mobile browsers parse this as
    // an UNMUTED autoplay video and refuse to start it — on phones the hero sat
    // on its blue background with nothing playing. Set muted imperatively, ask
    // for playback, and if the browser still refuses (Low Power Mode, data
    // saver) reveal the copy over the poster right away instead of blue-screen.
    v.muted = true
    v.defaultMuted = true
    v.setAttribute('muted', '')
    const playAttempt = v.play()
    if (playAttempt) playAttempt.catch(() => reveal())
    // Safety net for the remaining edge: playback granted but stalled forever.
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
      className={`hero ${videoResting ? 'hero--video-rest' : ''} ${noVideo ? 'hero--no-video' : ''}`}
      data-screen-label="Home Hero"
    >
      {/* Real homepage video background — plays once, then freezes on last
          frame. Unmounted entirely on phones (see the mobile branch in the
          effect); CSS also hides it pre-hydration at ≤760px. */}
      {!noVideo && (
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          playsInline
          preload="auto"
          // Real frame to stand behind the copy whenever playback never starts
          // (autoplay denied / still buffering) — without it the hero shows the
          // bare blue section background.
          poster="/hero-poster.jpg"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
      )}

      {!noVideo && (
        <button type="button" className="hero-skip" onClick={skipVideo}>
          <span>Skip video</span>
          <span className="hero-skip-arrow" aria-hidden="true">→</span>
        </button>
      )}

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
              <b>Engineer-Led</b>
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
              <b>10+ Years product warranty</b>
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
          <Reveal className="stat"><div className="num"><AnimatedCounter to={800} />+</div><div className="lbl">{t('h.s1')}</div></Reveal>
          <Reveal className="stat" delay={120}><div className="num"><AnimatedCounter to={21} />K+</div><div className="lbl">{t('h.s2')}</div></Reveal>
          <Reveal className="stat" delay={240}><div className="num"><AnimatedCounter to={180} />+</div><div className="lbl">{t('h.s4')}</div></Reveal>
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

// The '&' glyph in the card-title font falls back to a serif face, so render
// just that character in the heading font (Montserrat) — everything else in
// the string stays untouched.
function AmpFix({ text }: { text: string }) {
  const parts = text.split('&')
  if (parts.length === 1) return <>{text}</>
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <span style={{ fontFamily: 'var(--font-heading)' }}>&amp;</span>}
          {p}
        </span>
      ))}
    </>
  )
}

// Step icons — the same four lucide glyphs the original site uses
// (pen-tool / wrench / smartphone / shield), inlined as SVG.
const PROC_ICONS = [
  // pen-tool — design
  <svg key="pen" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"/><path d="m2.3 2.3 7.286 7.286"/><circle cx="11" cy="11" r="2"/></svg>,
  // wrench — installation
  <svg key="wrench" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  // smartphone — commissioning & app monitoring
  <svg key="phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>,
  // shield — long-term service & warranty
  <svg key="shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/></svg>,
]

function ProcessSection() {
  const { t } = useI18n()
  const steps = [
    { n: '01', t: t('p.s1.t'), d: t('p.s1.d'), img: '/process-1.webp', icon: PROC_ICONS[0] },
    { n: '02', t: t('p.s2.t'), d: t('p.s2.d'), img: '/process-2.webp', icon: PROC_ICONS[1] },
    { n: '03', t: t('p.s3.t'), d: t('p.s3.d'), img: '/process-3.webp', icon: PROC_ICONS[2] },
    { n: '04', t: t('p.s4.t'), d: t('p.s4.d'), img: '/process-4.webp', icon: PROC_ICONS[3] },
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

          {/* 3 — STAGE: card on the LEFT, image on the RIGHT, side by side with a
              clear gap (no overlap). Each step fades + flies the card content in
              from the left; the images crossfade. key={activeIdx} re-fires it. */}
          <div className="proc-pin-stage">
            <div className="proc-pin-card" aria-live="polite" aria-atomic="true">
              <div className="proc-pin-card-inner" key={activeIdx}>
                <span className="proc-pin-card-n proc-pin-card-n--icon" aria-label={`Step ${steps[activeIdx].n}`}>{steps[activeIdx].icon}</span>
                <h3 className="proc-pin-card-t"><AmpFix text={steps[activeIdx].t} /></h3>
                <p className="proc-pin-card-d">{steps[activeIdx].d}</p>
              </div>
            </div>

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
            </div>
          </div>

          {/* 4 — MOBILE-ONLY static list: ALL four steps, full text, no truncation.
              Hidden on desktop via CSS; shown at <=900px so no description is lost. */}
          <ol className="proc-pin-mlist">
            {steps.map((s, i) => (
              <li key={s.n} className={`proc-pin-mitem ${i === activeIdx ? 'active' : ''}`}>
                <span className="proc-pin-mn proc-pin-mn--icon" aria-label={`Step ${s.n}`}>{s.icon}</span>
                <div className="proc-pin-mbody">
                  <h4><AmpFix text={s.t} /></h4>
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
    // Wrap around so navigation is cyclic: next past the last panel → first,
    // prev before the first → last.
    const n = tabs.length
    const idx = ((i % n) + n) % n
    setActiveIdx(idx)
    const target = idx * track.clientWidth
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
        onClick={() => goTo(activeIdx - 1)}
        aria-label="Previous panel"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button
        type="button"
        className="features-nav features-nav-next"
        onClick={() => goTo(activeIdx + 1)}
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
      desc: 'From eligibility checks to rebate applications.',
    },
  ]
  return (
    <div className="feature-panel container">
      <div className="feature-panel-media" data-poster="rebates">
        <Image src="/Rebates.png" alt="Happy Australian couple reviewing energy savings dashboard outside their solar-powered home" width={480} height={600} sizes="(max-width: 900px) 100vw, 480px" />
      </div>
      <div className="feature-panel-content">
        <h2 className="section-h">Let Government Rebates Do the Heavy Lifting on Your Costs</h2>
        <span className="feature-panel-divider" />
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
      desc: 'Your system is designed and reviewed by qualified engineers — focused on safety, performance, and long-term reliability from day one.',
    },
    {
      title: 'Local, Accountable, Responsive',
      desc: 'A local Australian team that listens first, then delivers solutions that truly fit your needs — with responsive support before, during, and after installation.',
    },
    {
      title: 'From Start to Long-Term Support',
      desc: 'End-to-end service from design to installation and beyond, using only trusted Tier 1 products you can rely on.',
    },
  ]
  return (
    <div className="feature-panel container">
      <div className="feature-panel-media" data-poster="why-bluven">
        <Image src="/why-bluven.png" alt="Bluven engineer on a residential rooftop reviewing solar installation on a tablet" width={480} height={600} sizes="(max-width: 900px) 100vw, 480px" />
      </div>
      <div className="feature-panel-content">
        <h2 className="section-h">Why Choose Bluven Energy?</h2>
        <span className="feature-panel-divider" />
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
      desc: 'Stop letting your solar leak back to the grid for pennies. Store your daytime sun to cancel out expensive peak rates at night.',
    },
    {
      title: 'Track Your Flow, Own Your Data',
      desc: "See exactly where your power goes with the intuitive App. Monitor your home’s energy pulse in real-time and shift your usage to avoid high-cost hours.",
    },
    {
      title: 'Stay Connected, Stay Bright',
      desc: 'Don’t let a grid failure pause your life. Automatically keep your essential appliances running smoothly during any outage.',
    },
  ]
  return (
    <div className="feature-panel container">
      <div className="feature-panel-media" data-poster="battery">
        <Image src="/battery-value.png" alt="Modern Australian home with wall-mounted battery and EV charging in the carport" width={480} height={600} sizes="(max-width: 900px) 100vw, 480px" />
      </div>
      <div className="feature-panel-content">
        <h2 className="section-h">Cut your electricity bills with 3 hours of free midday charging</h2>
        <span className="feature-panel-divider" />
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

// Turn the CMS systemType enum into a short human tag for the album cards.
const SYSTEM_LABEL: Record<string, string> = {
  solar: 'Solar',
  'solar-battery': 'Solar + Battery',
  'solar-ev': 'Solar + EV',
  full: 'Full System',
  commercial: 'Commercial',
  'battery-retrofit': 'Battery Retrofit',
}

type DockCard = {
  id: string; href: string; img: string
  full?: string                     // hi-res source loaded for the click-to-enlarge lightbox
  ratio?: number                    // real photo aspect ratio (w/h); portrait shots stay portrait
  location: string; title: string; summary: string; spec?: string
}

// Respect the OS "reduce motion" setting — flattens the 3D tilt/scale in the album.
function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(m.matches)
    sync()
    m.addEventListener('change', sync)
    return () => m.removeEventListener('change', sync)
  }, [])
  return reduce
}

function ProjectsShowcase({ projects }: { projects: Project[] }) {
  // Real CMS projects only — a project without a cover photo is skipped rather
  // than padded with a stock image. If the CMS returns nothing (down/empty),
  // the whole section is hidden instead of showing fabricated placeholders.
  const cards: DockCard[] = projects.slice(0, 12).flatMap(p => {
    const img = api.imgUrl(p.coverImage, 'card')
    if (!img) return []
    return [{
      id: p.id,
      href: `/projects/${p.slug}`,
      img,
      full: api.imgUrl(p.coverImage, 'hero') || img,
      // real photo aspect ratio (w/h) — portrait phone shots stay portrait, never letter-boxed
      ratio: p.coverImage?.width && p.coverImage?.height ? p.coverImage.width / p.coverImage.height : 0.75,
      location: p.location,
      title: p.title,
      summary: p.summary,
      spec: SYSTEM_LABEL[p.systemType] || p.systemType,
    }]
  })

  if (cards.length === 0) return null

  return (
    <section className="section showcase">
      <div className="container">
        <Reveal style={{ textAlign: 'center', margin: '0 auto' }}>
          <h2 className="section-h section-h--2line" style={{ color: 'var(--bv-white)', margin: '0 auto 14px' }}>
            600+ Australian roofs. Every one engineered.
          </h2>
        </Reveal>

        <DockAlbum cards={cards} />

        <Reveal style={{ marginTop: 24, textAlign: 'center' }}>
          <Link className="btn btn-primary" href="/projects">
            <span>View all projects</span> <span className="arrow">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

// A 3D stacked photo deck: portrait cards overlap/layer toward the centre
// (Mac-dock magnification + coverflow tilt), swipe/drag/arrows to browse,
// click the front photo to load it hi-res in a lightbox.
function DockAlbum({ cards }: { cards: DockCard[] }) {
  const total = cards.length
  const stageRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(0)            // continuous position; integer at rest, fractional while dragging
  const [stageW, setStageW] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [paused, setPaused] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const reduce = usePrefersReducedMotion()

  // Position is unbounded so the deck loops seamlessly; the active index wraps.
  const wrap = (i: number) => ((i % total) + total) % total
  const active = wrap(Math.round(pos))
  // Step is tighter than a card's width, so neighbours overlap into a stacked deck.
  const step = Math.max(96, Math.min((stageW || 900) * 0.19, 190))
  // Never render a card past the wrap midpoint, so none appears on both sides at once.
  const cullDist = Math.min(4.2, total / 2 - 0.01)

  // Measure the stage so the spread scales with the viewport.
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const sync = () => setStageW(el.clientWidth)
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Gentle auto-advance; paused on hover/focus/drag, while the lightbox is open, or reduced motion.
  useEffect(() => {
    if (paused || dragging || reduce || lightbox !== null || total <= 1) return
    const id = setInterval(() => setPos(p => Math.round(p) + 1), 4600)
    return () => clearInterval(id)
  }, [paused, dragging, reduce, lightbox, total])

  // Move to card i by the shortest wrapped path (dots / side cards never sweep the long way).
  const go = (i: number) => setPos(p => {
    let diff = i - wrap(Math.round(p))
    diff -= total * Math.round(diff / total)
    return Math.round(p) + diff
  })
  const prev = () => setPos(p => Math.round(p) - 1)
  const next = () => setPos(p => Math.round(p) + 1)

  // Trackpad / horizontal wheel browsing — ONE step per gesture. A trackpad swipe
  // fires a long momentum stream of wheel events; advance once, then stay locked
  // until the stream goes quiet, so one swipe = one card (not a sprint to the end).
  const wheelLock = useRef(false)
  const wheelIdle = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return   // let vertical page scroll pass through
      e.preventDefault()
      // keep pushing the unlock back while momentum events keep arriving
      if (wheelIdle.current) clearTimeout(wheelIdle.current)
      wheelIdle.current = setTimeout(() => { wheelLock.current = false }, 140)
      if (wheelLock.current) return
      wheelLock.current = true
      setPos(p => Math.round(p) + (e.deltaX > 0 ? 1 : -1))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      if (wheelIdle.current) clearTimeout(wheelIdle.current)
    }
  }, [total])

  // Pointer drag to fling through the deck. We deliberately DON'T setPointerCapture:
  // capturing the pointer retargets the follow-up `click` to the stage and swallows
  // the card's onClick (which opens the lightbox). We track the drag manually and use
  // a suppress flag so a real drag doesn't also fire a click.
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, start: pos, moved: false }
    setDragging(true)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    if (Math.abs(dx) > 4) drag.current.moved = true
    setPos(drag.current.start - dx / step)
  }
  const endDrag = () => {
    if (!drag.current) return
    suppressClick.current = drag.current.moved   // a real drag → swallow the trailing click
    drag.current = null
    setDragging(false)
    setPos(p => Math.round(p))
  }

  // Click: after a drag, swallow it; otherwise a side card centres itself and the
  // front (active) card opens the enlarged photo.
  const onCardClick = (i: number) => {
    if (suppressClick.current) { suppressClick.current = false; return }
    if (i === active) setLightbox(i)
    else go(i)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightbox(active) }
  }

  return (
    <div className="dock" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <button className="dock-arrow dock-arrow-prev" onClick={prev} aria-label="Previous installation">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button className="dock-arrow dock-arrow-next" onClick={next} aria-label="Next installation">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <div
        className={`dock-stage ${dragging ? 'is-dragging' : ''}`}
        ref={stageRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Recent installation photos"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {cards.map((c, i) => {
          let d = i - pos
          if (total > 1) d -= total * Math.round(d / total)     // shortest wrapped distance → seamless loop
          const ad = Math.abs(d)
          if (ad > cullDist) return null                        // cull far / avoid a card on both sides
          const rot = reduce ? 0 : Math.max(-48, Math.min(48, -d * 24))
          const sc = reduce ? (ad < 0.5 ? 1 : 0.86) : Math.max(0.5, 1 - ad * 0.12)
          const tz = reduce ? 0 : -Math.min(ad, 4) * 70
          const op = Math.max(0, 1 - ad * 0.16)
          const isActive = i === active
          return (
            <button
              key={c.id}
              type="button"
              className={`dock-card ${isActive ? 'is-active' : ''}`}
              onClick={() => onCardClick(i)}
              tabIndex={-1}
              aria-label={isActive ? `Enlarge photo: ${c.title}` : `Show ${c.title}`}
              style={{
                aspectRatio: String(c.ratio ?? 0.75),
                zIndex: 100 - Math.round(ad * 10),
                opacity: op,
                pointerEvents: op < 0.12 ? 'none' : 'auto',
                filter: `brightness(${Math.max(0.45, 1 - ad * 0.14)})`,
                transform: `translate(calc(-50% + ${d * step}px), -50%) translateZ(${tz}px) rotateY(${rot}deg) scale(${sc})`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={c.title} draggable={false} />
              {c.spec && <span className="dock-card-tag">{c.spec}</span>}
              {isActive && (
                <span className="dock-card-zoom" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="dock-dots" role="tablist" aria-label="Choose an installation">
        {cards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={`dock-dot ${i === active ? 'active' : ''}`}
            onClick={() => go(i)}
            role="tab"
            aria-selected={i === active}
            aria-label={`Installation ${i + 1}`}
          />
        ))}
      </div>

      {lightbox !== null && (
        <DockLightbox
          cards={cards}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onIndex={(i) => { setLightbox(i); go(i) }}
        />
      )}
    </div>
  )
}

// Click-to-enlarge lightbox: loads the hi-res photo, keyboard + arrow browsing.
function DockLightbox({ cards, index, onClose, onIndex }: {
  cards: DockCard[]; index: number; onClose: () => void; onIndex: (i: number) => void
}) {
  const total = cards.length
  const c = cards[index]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onIndex((index - 1 + total) % total)
      else if (e.key === 'ArrowRight') onIndex((index + 1) % total)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'          // lock page scroll while open
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [index, total, onClose, onIndex])

  if (!c) return null
  return createPortal(
    <div className="dock-lb" role="dialog" aria-modal="true" aria-label={c.title} onClick={onClose}>
      <button className="dock-lb-close" onClick={onClose} aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <button className="dock-lb-arrow dock-lb-prev" onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + total) % total) }} aria-label="Previous photo">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <figure className="dock-lb-figure" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.full || c.img} alt={c.title} />
        <figcaption className="dock-lb-cap">
          <span className="dock-lb-loc">{c.location}</span>
          <span className="dock-lb-title">{c.title}</span>
          <span className="dock-lb-count">{index + 1} / {total}</span>
        </figcaption>
      </figure>
      <button className="dock-lb-arrow dock-lb-next" onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % total) }} aria-label="Next photo">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>,
    document.body,
  )
}


