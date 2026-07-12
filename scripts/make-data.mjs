// Генерира начален data.json (23 предложения) за клона „data".
// Стартиране: node scripts/make-data.mjs > data.seed.json
import { randomUUID } from 'node:crypto'

const RAW = [
  ['Бунгала Оазис SUNRISE', ''],
  ['Bungalow Deja View', ''],
  ['Camping Gardenia', 'къмпинг Гардения'],
  ['Camping Gardenia Bungalow SeaBed', 'къмпинг Гардения'],
  ['Art Provence Bungalow', ''],
  ['M House Bungalows', ''],
  ['Dream Camping Arapya', 'Арапя'],
  ['Къмпинг Бунгала Нестинарка', 'Нестинарка'],
  ['Bungalows Nestinarka', 'Нестинарка'],
  ['Бунгала Калина Нестинарка', 'Нестинарка'],
  ['Bungalow Silitur', ''],
  ['Вилно селище Съни Дей', ''],
  ['Бунгала Натали', ''],
  ['Бунгала Сили Тур', ''],
  ['Бунгала St. Nicola', ''],
  ['South Beach Villa', ''],
  ['Azure Camp Sinemorets', 'Синеморец'],
  ['Бунгала Василико', ''],
  ['Къмпинг Атлиман', ''],
  ['Chernomorie Camp', ''],
  ['Бунгала Пламен Морето', ''],
  ['Комплекс Джулай Морнинг', ''],
  ['Dream Bungalow', ''],
]

function empty() {
  return {
    name: '', town: '', area: '', links: [], photos: [],
    price: null, currency: 'лв.', capacity: null, suitableFor2A1C: null,
    beachDistanceM: null, ownBathroom: null, ac: null, parking: null,
    kitchen: null, kidFriendly: null, rating: null, ratingSource: '',
    phone: '', description: '', pros: '', cons: '', notes: '',
    status: 'za_proverka', favorite: false, lastCheckedDate: '',
    availability: '', nextAction: '', nextActionDate: '', archived: false,
    statusHistory: [], lastChangedBy: null, notesUpdatedBy: null, notesUpdatedAt: null,
  }
}

const base = Date.now()
const items = RAW.map(([name, area], i) => ({
  id: randomUUID(),
  ...empty(),
  name,
  area,
  createdAt: base + i,
  updatedAt: base + i,
}))

process.stdout.write(JSON.stringify(items, null, 0))
