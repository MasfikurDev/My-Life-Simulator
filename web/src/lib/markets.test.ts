import { describe, expect, it } from 'vitest';
import { MARKET_ASSETS } from './markets';
import { advanceWeek, advanceYear, convertMarketAsset, createCharacter, depositMarketFunds, getMarketPrice, moveMarketFunds, tradeMarketAsset } from './simulation';

describe('simulated investment markets', () => {
  it('defines distinct stock and crypto listings with stable symbols', () => {
    const symbols = MARKET_ASSETS.map((asset) => asset.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
    expect(MARKET_ASSETS.filter((asset) => asset.market === 'stocks')).toHaveLength(10);
    expect(MARKET_ASSETS.filter((asset) => asset.market === 'crypto')).toHaveLength(8);
    expect(MARKET_ASSETS.every((asset) => asset.basePrice > 0 && asset.volatility > 0)).toBe(true);
  });

  it('supports deposits, withdrawals, stock and crypto trades through the investment wallet', () => {
    const base = { ...createCharacter('Market trader', 30), currencyScale: 1, money: 100000 };
    const funded = depositMarketFunds(base, 50000);
    expect(funded.money).toBe(50000);
    expect(funded.marketCash).toBe(50000);
    const boughtStock = tradeMarketAsset(funded, 'stock-apple', 'buy', 2);
    expect(boughtStock).not.toBe(base);
    expect(boughtStock.investments?.find((item) => item.type === 'stock-apple')?.units).toBe(2);
    expect(boughtStock.financialTransactions?.some((item) => item.type === 'investment-buy')).toBe(true);

    const boughtCrypto = tradeMarketAsset(boughtStock, 'crypto-xrp', 'buy', 10);
    expect(boughtCrypto.investments?.find((item) => item.type === 'crypto-xrp')?.units).toBe(10);
    const sold = tradeMarketAsset(boughtCrypto, 'crypto-xrp', 'sell', 5);
    expect(sold.investments?.find((item) => item.type === 'crypto-xrp')?.units).toBe(5);
    expect(sold.financialTransactions?.some((item) => item.type === 'investment-sell')).toBe(true);
    const moved = moveMarketFunds(sold, 100);
    expect(moved.marketCash).toBe((sold.marketCash ?? 0) - 100);
    expect(moved.money).toBe(50100);
  });

  it('rejects unaffordable and underage market orders without mutating state', () => {
    const adult = { ...createCharacter('New investor', 30), currencyScale: 1, money: 0 };
    expect(tradeMarketAsset(adult, 'stock-microsoft', 'buy', 1)).toBe(adult);
    const minor = { ...adult, age: 17, money: 100000 };
    expect(tradeMarketAsset(minor, 'crypto-btc', 'buy', 1)).toBe(minor);
  });

  it('updates listed asset prices deterministically at annual settlement', () => {
    const base = { ...createCharacter('Long-term investor', 30), currencyScale: 1, year: 2030 };
    const first = advanceYear(base);
    const second = advanceYear(base);
    expect(first.marketPrices?.assets?.['stock-apple']).toBeGreaterThan(0);
    expect(first.marketPrices?.assets?.['crypto-btc']).toBeGreaterThan(0);
    expect(first.marketPrices?.assets).toEqual(second.marketPrices?.assets);
    expect(first.marketPrices?.lastUpdatedYear).toBe(first.year);
  });

  it('converts a holding atomically into another listed asset', () => {
    const base = { ...createCharacter('Market trader', 30), currencyScale: 1, money: 100000 };
    const funded = depositMarketFunds(base, 50000);
    const bought = tradeMarketAsset(funded, 'stock-apple', 'buy', 2);
    const converted = convertMarketAsset(bought, 'stock-apple', 'crypto-xrp', 1);
    expect(converted).not.toBe(bought);
    expect(converted.investments?.find((item) => item.type === 'stock-apple')?.units).toBe(1);
    expect((converted.investments?.find((item) => item.type === 'crypto-xrp')?.units ?? 0)).toBeGreaterThan(0);
    expect(convertMarketAsset(converted, 'crypto-xrp', 'crypto-xrp', 1)).toBe(converted);
  });

  it('records a weekly price point once and keeps the full selected-range history', () => {
    const base = { ...createCharacter('Long-term investor', 30), currencyScale: 1 };
    const first = advanceWeek(base);
    expect(first.issue).toBeNull();
    expect(first.character.marketHistory).toHaveLength(2);
    const duplicate = advanceWeek(first.character);
    expect(duplicate.issue).toBe('already-resolved');
    expect(duplicate.character.marketHistory).toHaveLength(2);
    const next = advanceWeek(first.character);
    expect(next.character.marketHistory).toHaveLength(3);
    expect(next.character.marketHistory?.at(-1)?.prices['stock-apple']).toBe(getMarketPrice(next.character, 'stock-apple'));
    expect(next.character.marketHistory?.at(-1)?.prices['crypto-btc']).toBeGreaterThan(0);
    expect(next.character.marketPrices?.assets?.['stock-apple']).toBeGreaterThan(0);
    const deterministic = advanceWeek(first.character);
    expect(deterministic.character.marketHistory).toEqual(next.character.marketHistory);
  });

  it('returns the catalogue quote before the first market settlement', () => {
    const character = { ...createCharacter('New investor', 30), currencyScale: 1 };
    expect(getMarketPrice(character, 'stock-apple')).toBe(352);
    expect(getMarketPrice(character, 'crypto-xrp')).toBe(0.97);
  });
});
