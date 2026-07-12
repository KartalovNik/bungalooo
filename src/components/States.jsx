// Състояния: зареждане, празно, грешка.
import Icon from './Icons'

export function LoadingState() {
  return (
    <div className="skeleton-grid" aria-busy="true" aria-label="Зареждане">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton--media" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line short" />
          <div className="skeleton skeleton--chips" />
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state">
      <Icon name="warning" size={40} />
      <h2>Възникна грешка</h2>
      <p className="muted">{message || 'Опитайте да презаредите страницата.'}</p>
      {onRetry && <button className="btn btn--primary" onClick={onRetry}>Опитай отново</button>}
    </div>
  )
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="state">
      <Icon name="beach" size={44} />
      <h2>{title}</h2>
      {message && <p className="muted">{message}</p>}
      {action}
    </div>
  )
}
