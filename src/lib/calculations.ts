export const AGENT_COMMISSION_RATE = 0.1
export const MIDDLEMAN_COMMISSION_RATE = 0.1

export interface CommissionRates {
  agent: number
  middleman: number
}

export interface OrderTotals {
  capital: number
  sellingAmount: number
  grossProfit: number
  deliveryFee: number
}

export function agentCommission(grossProfit: number, rate = AGENT_COMMISSION_RATE): number {
  return grossProfit * rate
}

export function middlemanCommission(grossProfit: number, rate = MIDDLEMAN_COMMISSION_RATE): number {
  return grossProfit * rate
}

export function netProfit(
  grossProfit: number,
  deliveryFee: number,
  rates: CommissionRates = { agent: AGENT_COMMISSION_RATE, middleman: MIDDLEMAN_COMMISSION_RATE },
): number {
  return (
    grossProfit -
    deliveryFee -
    agentCommission(grossProfit, rates.agent) -
    middlemanCommission(grossProfit, rates.middleman)
  )
}

export function orderNetProfit(totals: OrderTotals): number {
  return netProfit(totals.grossProfit, totals.deliveryFee)
}

export function investmentRatio(investedCapital: number, orderCapital: number): number {
  if (orderCapital <= 0) return 0
  return investedCapital / orderCapital
}

export interface InvestorFigures {
  ratio: number
  investedCapital: number
  grossProfit: number
  agentCommission: number
  middlemanCommission: number
  deliveryFee: number
  netProfit: number
  expectedReturn: number
}

export function investorFigures(
  investedCapital: number,
  orderCapital: number,
  totals: OrderTotals,
): InvestorFigures {
  const ratio = investmentRatio(investedCapital, orderCapital)
  const orderAgent = agentCommission(totals.grossProfit)
  const orderMiddleman = middlemanCommission(totals.grossProfit)
  const orderNet = orderNetProfit(totals)

  return {
    ratio,
    investedCapital,
    grossProfit: totals.grossProfit * ratio,
    agentCommission: orderAgent * ratio,
    middlemanCommission: orderMiddleman * ratio,
    deliveryFee: totals.deliveryFee * ratio,
    netProfit: orderNet * ratio,
    expectedReturn: investedCapital + orderNet * ratio,
  }
}
