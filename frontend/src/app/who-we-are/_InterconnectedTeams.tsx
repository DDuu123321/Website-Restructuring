'use client'

import { useEffect, useRef } from 'react'

// Verbatim embed of the standalone "Interconnected Expert Teams" diagram
// (user-authored graphic). Only the DC-framework template placeholders were
// substituted/removed so it runs outside that framework; design is unchanged.
const IET_HTML = `<style>
.iet{
  --accent:#ffc61f;
  --accent-strong: color-mix(in srgb, var(--accent) 90%, transparent);
  --accent-line:   color-mix(in srgb, var(--accent) 80%, transparent);
  --accent-bd:     color-mix(in srgb, var(--accent) 50%, transparent);
  --accent-bd-soft:color-mix(in srgb, var(--accent) 42%, transparent);
  --accent-glow:   color-mix(in srgb, var(--accent) 30%, transparent);
  --accent-glow-soft: color-mix(in srgb, var(--accent) 20%, transparent);
}
/* Route the diagram's literal "Montserrat" to the app's self-hosted next/font copy
   (font-family only; the inline font sizes/weights are untouched). */
.iet, .iet *{ font-family: var(--font-montserrat), Montserrat, system-ui, sans-serif !important; }
.iet svg{ display:block; }
@keyframes iet-travel { from{ offset-distance:0% } to{ offset-distance:100% } }
@keyframes iet-floatA { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-13px) } }
@keyframes iet-floatB { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-9px) } }
@keyframes iet-floatC { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-11px) } }
@keyframes iet-corepulse { 0%,100%{ transform:scale(1); opacity:.92 } 50%{ transform:scale(1.06); opacity:1 } }
@keyframes iet-dash-slow { to{ stroke-dashoffset:-360 } }
.iet[data-rm="true"] *{ animation:none !important; }
</style>
<section class="iet" data-rm="false" style="font-family:Montserrat,sans-serif; background:linear-gradient(180deg,#04243f,#03162a); padding:52px 28px 64px; display:flex; flex-direction:column; align-items:center; --accent: #ffc61f;">

  <div data-screen-label="Interconnected Expert Teams" style="position:relative; width:1240px; max-width:100%; border-radius:24px; overflow:hidden; background:radial-gradient(120% 100% at 50% 32%, #0a4d89 0%, #073257 48%, #042744 100%); box-shadow:0 40px 100px rgba(0,0,0,.55), inset 0 0 0 1px rgba(120,170,230,.16);">
    <div style="position:absolute; inset:0; pointer-events:none; background-image:radial-gradient(rgba(255,255,255,.5) 1px, transparent 1.2px); background-size:96px 74px; opacity:.10;"></div>

    <!-- HEADER -->
    <div style="position:relative; z-index:2; text-align:center; padding:52px 40px 6px;">
      <div style="font:700 13px Montserrat; letter-spacing:5px; color:var(--accent);">CLOSED-LOOP BLUVEN</div>
      <h2 style="font:800 46px Montserrat; letter-spacing:-1px; color:#eef4ff; margin:12px 0 0;">Interconnected Expert Teams</h2>
      <p style="font:500 17px/1.55 Montserrat; color:#a9c2e2; max-width:620px; margin:16px auto 0;">Our three core teams operate as one continuous system — working together to design, deliver, and support every project with precision and long-term performance in mind.</p>
    </div>

    <!-- DIAGRAM -->
    <div data-iet-stage="" style="position:relative; width:100%; height:calc(770px * var(--s, 1));">
      <div style="position:absolute; left:0; right:0; top:0; margin:0 auto; width:1200px; height:770px; transform-origin:top center; transform:scale(var(--s, 1));">
      <svg viewBox="0 0 1200 770" width="100%" height="100%" style="position:absolute; inset:0; overflow:visible; z-index:1;">
        <g fill="none" stroke="#7fb0e6" stroke-width="1.3" opacity="0.35">
          <path d="M600,150 L323,630 L877,630 Z"></path>
          <line x1="600" y1="470" x2="600" y2="150"></line>
          <line x1="600" y1="470" x2="323" y2="630"></line>
          <line x1="600" y1="470" x2="877" y2="630"></line>
        </g>
        <g fill="none" stroke-width="1.5" stroke-dasharray="4 24" stroke-linecap="round" style="stroke:var(--accent); filter:drop-shadow(0 0 4px var(--accent-line)); animation:iet-dash-slow 9s linear infinite;">
          <line x1="600" y1="470" x2="600" y2="150"></line>
          <line x1="600" y1="470" x2="323" y2="630"></line>
          <line x1="600" y1="470" x2="877" y2="630"></line>
        </g>
      </svg>
      <div style="position:absolute; left:0; top:0; width:8px; height:8px; border-radius:50%; z-index:2; offset-path:path('M600,470 L600,150'); background:#fff; box-shadow:0 0 9px 3px var(--accent-line); animation:iet-travel 6.5s ease-in-out infinite;"></div>
      <div style="position:absolute; left:0; top:0; width:8px; height:8px; border-radius:50%; z-index:2; offset-path:path('M600,470 L323,630'); background:#fff; box-shadow:0 0 9px 3px var(--accent-line); animation:iet-travel 7.4s ease-in-out infinite -2.4s;"></div>
      <div style="position:absolute; left:0; top:0; width:8px; height:8px; border-radius:50%; z-index:2; offset-path:path('M600,470 L877,630'); background:var(--accent); box-shadow:0 0 9px 3px var(--accent-line); animation:iet-travel 8s ease-in-out infinite -5s;"></div>

      <!-- TOP CARD -->
      <div style="position:absolute; left:450px; top:22px; width:300px; z-index:3; animation:iet-floatA 8s ease-in-out infinite; background:rgba(10,64,137,.40); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid rgba(130,180,235,.34); border-radius:16px; padding:22px; box-shadow:0 16px 36px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.10);">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:44px; height:44px; flex:none; border-radius:50%; overflow:hidden; background:radial-gradient(circle at 40% 28%, #1568b0, #0a4089 50%, #042032 100%); border:1px solid var(--accent-bd-soft); display:flex; align-items:center; justify-content:center; color:var(--accent); box-shadow:0 4px 10px rgba(0,0,0,.4), inset 0 2px 4px rgba(255,255,255,.22), inset 0 -6px 12px rgba(0,0,0,.35);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em; height:1em; font-size:20px;"><path d="m12 19 7-7 3 3-7 7-3-3z"></path><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="m2 2 7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
          </div>
          <div style="font:700 18px Montserrat; color:#eef4ff;">Engineering Team</div>
        </div>
        <div style="margin-top:18px; text-align:center; font:700 14px Montserrat; color:#dceaff; background:rgba(255,255,255,.07); border:1px solid rgba(130,180,235,.30); border-radius:10px; padding:12px;">Design the system</div>
        <div style="height:1px; background:linear-gradient(90deg,transparent,rgba(130,180,235,.42),transparent); margin:18px 0 13px;"></div>
        <div style="display:flex; align-items:center; gap:7px; color:var(--accent); font-size:15px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em; height:1em;"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path></svg>
          <span style="font:700 10px Montserrat; letter-spacing:2px; color:#9fbbdd;">CORE ROLES</span>
        </div>
        <div style="margin-top:9px; font:500 13px/1.55 Montserrat; color:#a9c2e2;">Design · Quotation · Solutions · System Optimization</div>
      </div>

      <!-- BOTTOM-LEFT CARD -->
      <div style="position:absolute; left:173px; top:500px; width:300px; z-index:3; animation:iet-floatB 9s ease-in-out infinite .6s; background:rgba(10,64,137,.40); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid rgba(130,180,235,.34); border-radius:16px; padding:22px; box-shadow:0 16px 36px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.10);">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:44px; height:44px; flex:none; border-radius:50%; overflow:hidden; background:radial-gradient(circle at 40% 28%, #1568b0, #0a4089 50%, #042032 100%); border:1px solid var(--accent-bd-soft); display:flex; align-items:center; justify-content:center; color:var(--accent); box-shadow:0 4px 10px rgba(0,0,0,.4), inset 0 2px 4px rgba(255,255,255,.22), inset 0 -6px 12px rgba(0,0,0,.35);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em; height:1em; font-size:20px;"><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1v-4a9 9 0 0 1 18 0v4a1 1 0 0 1-1 1h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path><path d="M21 16v2a4 4 0 0 1-4 4h-5"></path></svg>
          </div>
          <div style="font:700 18px Montserrat; color:#eef4ff;">Customer Support Team</div>
        </div>
        <div style="margin-top:18px; text-align:center; font:700 14px Montserrat; color:#dceaff; background:rgba(255,255,255,.07); border:1px solid rgba(130,180,235,.30); border-radius:10px; padding:12px;">Maintain the system</div>
        <div style="height:1px; background:linear-gradient(90deg,transparent,rgba(130,180,235,.42),transparent); margin:18px 0 13px;"></div>
        <div style="display:flex; align-items:center; gap:7px; color:var(--accent); font-size:15px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em; height:1em;"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path></svg>
          <span style="font:700 10px Montserrat; letter-spacing:2px; color:#9fbbdd;">CORE ROLES</span>
        </div>
        <div style="margin-top:9px; font:500 13px/1.55 Montserrat; color:#a9c2e2;">Monitoring · Diagnostics · Troubleshooting · After-Sales Support</div>
      </div>

      <!-- BOTTOM-RIGHT CARD -->
      <div style="position:absolute; left:727px; top:500px; width:300px; z-index:3; animation:iet-floatC 8.5s ease-in-out infinite .3s; background:rgba(10,64,137,.40); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid rgba(130,180,235,.34); border-radius:16px; padding:22px; box-shadow:0 16px 36px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.10);">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:44px; height:44px; flex:none; border-radius:50%; overflow:hidden; background:radial-gradient(circle at 40% 28%, #1568b0, #0a4089 50%, #042032 100%); border:1px solid var(--accent-bd-soft); display:flex; align-items:center; justify-content:center; color:var(--accent); box-shadow:0 4px 10px rgba(0,0,0,.4), inset 0 2px 4px rgba(255,255,255,.22), inset 0 -6px 12px rgba(0,0,0,.35);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em; height:1em; font-size:20px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
          </div>
          <div style="font:700 18px Montserrat; color:#eef4ff;">Project Delivery Team</div>
        </div>
        <div style="margin-top:18px; text-align:center; font:700 14px Montserrat; color:#dceaff; background:rgba(255,255,255,.07); border:1px solid rgba(130,180,235,.30); border-radius:10px; padding:12px;">Execute the system</div>
        <div style="height:1px; background:linear-gradient(90deg,transparent,rgba(130,180,235,.42),transparent); margin:18px 0 13px;"></div>
        <div style="display:flex; align-items:center; gap:7px; color:var(--accent); font-size:15px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em; height:1em;"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path></svg>
          <span style="font:700 10px Montserrat; letter-spacing:2px; color:#9fbbdd;">CORE ROLES</span>
        </div>
        <div style="margin-top:9px; font:500 13px/1.55 Montserrat; color:#a9c2e2;">Procurement · Scheduling · Delivery · Risk Assessment</div>
      </div>

      <!-- HUB · 4b glossy orb -->
      <div style="position:absolute; left:510px; top:380px; width:180px; height:180px; z-index:4; border-radius:50%; overflow:hidden; background:radial-gradient(circle at 40% 28%, #1568b0, #0a4089 44%, #042032 100%); border:1px solid var(--accent-bd); box-shadow:0 18px 36px rgba(0,0,0,.5), 0 0 30px var(--accent-glow), inset 0 3px 8px rgba(255,255,255,.25), inset 0 -16px 28px rgba(0,0,0,.4); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; animation:iet-corepulse 6s ease-in-out infinite;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em; height:1em; font-size:36px; color:var(--accent);"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
        <div style="font:800 16px Montserrat; letter-spacing:4px; color:#f3f8ff;">BLUVEN</div>
      </div>
      </div>
    </div>
  </div>
</section>`

export function InterconnectedTeams() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const stage = root.querySelector('[data-iet-stage]') as HTMLElement | null
    if (!stage) return
    const fit = () => {
      const w = stage.clientWidth
      if (!w) return
      stage.style.setProperty('--s', String(Math.min(1, w / 1200)))
    }
    fit()
    let ro: ResizeObserver | undefined
    try { ro = new ResizeObserver(fit); ro.observe(stage) } catch {}
    window.addEventListener('resize', fit)
    return () => { ro?.disconnect(); window.removeEventListener('resize', fit) }
  }, [])
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: IET_HTML }} />
}
