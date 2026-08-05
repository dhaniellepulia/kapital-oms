import { describe, expect, it } from 'vitest'

import {
  agentCommission,
  middlemanCommission,
  netProfit,
  orderNetProfit,
  investorFigures,
  investmentRatio,
} from './calculations'

describe('agentCommission', () => {
  it('returns 10% of gross profit by default', () => {
    expect(agentCommission(1000)).toBe(100)
  })

  it('uses the provided rate', () => {
    expect(agentCommission(1000, 0.2)).toBe(200)
  })
})

describe('middlemanCommission', () => {
  it('returns 10% of gross profit by default', () => {
    expect(middlemanCommission(1000)).toBe(100)
  })
})

describe('netProfit', () => {
  it('subtracts delivery fee and commissions from gross profit', () => {
    expect(netProfit(1000, 50)).toBe(750)
  })

  it('respects custom rates', () => {
    expect(netProfit(1000, 0, { agent: 0.2, middleman: 0.05 })).toBe(750)
  })
})

describe('orderNetProfit', () => {
  it('computes net profit from order totals', () => {
    expect(orderNetProfit({ capital: 100, sellingAmount: 200, grossProfit: 100, deliveryFee: 20 })).toBe(
      60,
    )
  })
})

describe('investmentRatio', () => {
  it('returns 0 for non-positive order capital', () => {
    expect(investmentRatio(500, 0)).toBe(0)
  })

  it('returns invested over order capital', () => {
    expect(investmentRatio(250, 1000)).toBe(0.25)
  })
})

describe('investorFigures', () => {
  const totals = { capital: 1000, sellingAmount: 2000, grossProfit: 1000, deliveryFee: 50 }

  it('scales order figures by the investment ratio', () => {
    const figures = investorFigures(250, 1000, totals)

    expect(figures.ratio).toBe(0.25)
    expect(figures.grossProfit).toBe(250)
    expect(figures.agentCommission).toBe(25)
    expect(figures.middlemanCommission).toBe(25)
    expect(figures.deliveryFee).toBe(12.5)
    expect(figures.netProfit).toBeCloseTo(187.5)
  })

  it('returns expected return as invested capital plus net profit', () => {
    const figures = investorFigures(250, 1000, totals)

    expect(figures.expectedReturn).toBeCloseTo(250 + figures.netProfit)
  })
})
