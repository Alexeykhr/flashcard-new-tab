'use strict'

import { registerRouteLink, routeRender } from './pages/router'
import createCard from './dialogs/blocks/createCard'
import notification from './scripts/notification'
import editCard from './dialogs/blocks/editCard'
import cardRating from './scripts/cardRating'
import calcFS from './scripts/calcFontSize'
import { getActiveDecks } from './db/info'
import { rnd } from './scripts/helpers'
import DB from './db/DB'

console.time('[App] Render')

// Common Variables
let db, card

// Functions
const updateHtml = () => {
  // Elements
  const elActionCreate = document.querySelector('#h-action-create')
  const elActionEdit = document.querySelector('#h-action-edit')
  const elActionRatingUp = document.querySelector('#h-action-up')
  const elActionRatingDown = document.querySelector('#h-action-down')
  const elDeckName = document.querySelector('#h-deck-name')
  const elCardViews = document.querySelector('#h-card-views')
  const elCardClicks = document.querySelector('#h-card-clicks')
  const elCardRating = document.querySelector('#h-card-rating')
  const elActionCard = document.querySelector('#h-action-card')
  const elQuestion = document.querySelector('#h-question')
  const elAnswer = document.querySelector('#h-answer')

  const updateCenter = () => {
    elQuestion.innerText = card.question
    elQuestion.style.fontSize = `${calcFS(elQuestion.textContent)}px`
    elAnswer.innerText = card.answer
    elAnswer.style.fontSize = `${Math.round(calcFS(elAnswer.textContent) / 1.4)}px`
  }

  // Top-Right
  elDeckName.innerText = db.deck.name
  elDeckName.setAttribute('to.id', db.deck.id)
  elCardViews.innerText = card.views
  elCardClicks.innerText = card.clicks
  elCardRating.innerText = cardRating(card.up, card.down)

  // Center
  updateCenter()

  elQuestion.addEventListener('click', () => {
    setTimeout(() => elActionCard.classList.add('clicked'))
    elActionCard.classList.add('visible')

    db.incrementClicks(card.id, card.clicks)
      .then((count) => elCardClicks.innerText = count)
      .catch((e) => notification(e))
  }, { once: true })

  // Top-Left
  elActionCreate.addEventListener('click', () => {
    createCard(db).then(({ exit }) => exit())
  })

  elActionEdit.addEventListener('click', () => {
    editCard(db, card).then(({ type, exit }) => {
      if (type === 'delete') {
        location.reload()
      } else {
        updateCenter()
      }

      exit()
    })
  })

  elActionRatingUp.addEventListener('click', () => {
    elActionRatingUp.remove()
    elActionRatingDown.remove()

    db.incrementRatingUp(card.id, card.up)
      .then(() => elCardRating.innerText = cardRating(card.up + 1, card.down))
      .catch((e) => notification(e))
  })

  elActionRatingDown.addEventListener('click', () => {
    elActionRatingUp.remove()
    elActionRatingDown.remove()

    db.incrementRatingDown(card.id, card.down)
      .then(() => elCardRating.innerText = cardRating(card.up, card.down + 1))
      .catch((e) => notification(e))
  })

  // Statistics
  db.incrementViews(card.id, card.views)
    .then((count) => elCardViews.innerText = count)
    .catch((e) => notification(e))
}

// Launch the page
getActiveDecks()
  .then((decks) => {
    if (!decks.length) {
      throw 'welcome'
    }

    const deck = decks[rnd(0, decks.length - 1)]

    db = new DB(deck)

    return db.randomActiveCard()
  })
  .then((activeCard) => {
    if (!activeCard) {
      throw 'no-cards'
    }

    card = activeCard

    updateHtml()
  })
  .catch((e) => {
    switch (e) {
      case 'welcome':
      case 'no-cards':
        return routeRender(e, 'root', { db })
      default:
        return routeRender('error', 'root', e)
    }
  })
  .finally(() => {
    registerRouteLink()
    console.timeEnd('[App] Render')
  })
