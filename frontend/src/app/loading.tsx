export default function Loading() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', padding: 40 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--bv-cream)', borderTop: '3px solid var(--bv-amber-500)', borderRadius: '50%', animation: 'bv-spin 0.8s linear infinite' }} />
      <style>{`@keyframes bv-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
