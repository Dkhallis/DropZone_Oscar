import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { Drop } from '../api'
import { makeDrop } from '../test/fixtures'
import { DropCard } from './DropCard'

// DropCard contient un <Link> : il a besoin d'un routeur pour s'afficher
function renderCard(drop: Drop) {
  return render(
    <MemoryRouter>
      <DropCard drop={drop} />
    </MemoryRouter>,
  )
}

describe('DropCard', () => {
  it('shows the product, the price, the remaining stock and the status', () => {
    renderCard(makeDrop({ product: 'Air Max 1', price_cents: 18000, remaining: 42, stock: 100 }))

    expect(screen.getByRole('link', { name: 'Air Max 1' })).toBeInTheDocument()
    expect(screen.getByText(/180,00\s€/)).toBeInTheDocument()
    expect(screen.getByText('42 / 100 paires restantes')).toBeInTheDocument()
    expect(screen.getByText('En vente')).toBeInTheDocument()
  })

  it('links to the detail page of the drop', () => {
    renderCard(makeDrop({ id: 3, product: 'Dunk Low' }))

    expect(screen.getByRole('link', { name: 'Dunk Low' })).toHaveAttribute('href', '/drops/3')
  })

  it('shows a sold out drop', () => {
    renderCard(makeDrop({ remaining: 0, stock: 100, status: 'sold_out' }))

    expect(screen.getByText('Épuisé')).toBeInTheDocument()
    expect(screen.getByText('0 / 100 paires restantes')).toBeInTheDocument()
  })

  it('shows an upcoming drop with its countdown', () => {
    renderCard(makeDrop({ status: 'upcoming', opens_at: '2100-01-01T09:00:00Z' }))

    expect(screen.getByText('À venir')).toBeInTheDocument()
    expect(screen.getByText(/Ouverture dans/)).toBeInTheDocument()
  })
})