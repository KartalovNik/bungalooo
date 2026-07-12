// Икони на основните удобства. По подразбиране показва само наличните.
import Icon from './Icons'
import { AMENITIES } from '../config'

export default function AmenityIcons({ bungalow, showAll = false }) {
  const items = AMENITIES.filter((a) => (showAll ? true : bungalow[a.key] === true))
  if (!items.length) return null
  return (
    <ul className="amenities" aria-label="Удобства">
      {items.map((a) => {
        const val = bungalow[a.key]
        const state = val === true ? 'yes' : val === false ? 'no' : 'unknown'
        return (
          <li
            key={a.key}
            className={`amenity amenity--${state}`}
            title={`${a.label}: ${val === true ? 'Да' : val === false ? 'Не' : 'За проверка'}`}
          >
            <Icon name={a.icon} size={17} />
            <span className="amenity__label">{a.short}</span>
          </li>
        )
      })}
    </ul>
  )
}
