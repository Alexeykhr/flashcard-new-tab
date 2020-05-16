import Dexie from 'dexie'
import { rnd } from '../scripts/helpers'

export default class DB {
  constructor(deck) {
    this.deck = deck
    this.dexie = new Dexie(`deck-${this.deck.name}`)

    this.dexie.version(1).stores({
      'cards': '++id,is_active'
    })
  }

  cardsCount() {
    console.time('[DB] cardsCount')

    return this.dexie.cards.count()
      .finally(() => {
        console.timeEnd('[DB] cardsCount')
      })
  }

  paginate(page = 1, itemsPerPage = 50) {
    console.time(`[DB] paginate ${page} | ${itemsPerPage}`)

    return this.dexie.cards
      .offset((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .toArray()
      .finally(() => {
        console.timeEnd(`[DB] paginate ${page} | ${itemsPerPage}`)
      })
  }

  randomActiveCard() {
    if (!this.deck.cards_count) {
      return undefined
    }

    console.time('[DB] randomActiveCard')

    return this.dexie.cards
      .where('is_active').equals(1)
      .offset(rnd(0, this.deck.cards_count - 1))
      .limit(1)
      .first()
      .finally(() => {
        console.timeEnd('[DB] randomActiveCard')
      })
  }

  incrementViews(cardId, count) {
    console.time('[DB] incrementViews')

    return this.dexie.cards
      .update(cardId, { views: count + 1 })
      .then(() => count + 1)
      .finally(() => {
        console.timeEnd('[DB] incrementViews')
      })
  }

  incrementClicks(cardId, count) {
    console.time('[DB] incrementClicks')

    return this.dexie.cards
      .update(cardId, { clicks: count + 1 })
      .then(() => count + 1)
      .finally(() => {
        console.timeEnd('[DB] incrementClicks')
      })
  }

  incrementRatingUp(cardId, count) {
    console.time('[DB] incrementRatingUp')

    return this.dexie.cards
      .update(cardId, { up: count + 1 })
      .then(() => count + 1)
      .finally(() => {
        console.timeEnd('[DB] incrementRatingUp')
      })
  }

  incrementRatingDown(cardId, count) {
    console.time('[DB] incrementRatingDown')

    return this.dexie.cards
      .update(cardId, { down: count + 1 })
      .then(() => count + 1)
      .finally(() => {
        console.timeEnd('[DB] incrementRatingDown')
      })
  }
}