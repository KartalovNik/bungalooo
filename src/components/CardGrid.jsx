// Решетка с картите (1 колона на телефон, повече на голям екран).
import BungalowCard from './BungalowCard'

export default function CardGrid({ items }) {
  return (
    <div className="grid">
      {items.map((b) => (
        <BungalowCard key={b.id} bungalow={b} />
      ))}
    </div>
  )
}
