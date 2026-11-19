# Simulated Investment Markets

## Product scope

Finance keeps its established top-level order: Banking, Business, Property, Investments, Taxes. The Investments workspace contains three focused destinations: **Stocks**, **Crypto**, and **Other assets**. Stocks and Crypto have separate market lists and portfolio subtotals while sharing one investment wallet and the existing investment holdings/ledger.

The fictional catalogue contains ten listed companies and eight cryptocurrencies. Each listing has a stable internal asset type, symbol, category, starting quote, volatility profile, circulating supply, and simulated volume profile. These are game assets, not live exchange listings or financial recommendations.

## Market behavior

- Market prices are simulated locally. No external APIs, live quotes, real company disclosures, or real blockchain data are used.
- Listed stock and crypto prices update once per resolved in-game week using deterministic, date-seeded movement influenced by the in-game economic conditions. Crypto has wider movement bounds than equities.
- Weekly closing quotes are stored in the character's `marketHistory` (up to 5,200 weekly points, approximately 100 years). The current quote is also stored in `marketPrices.assets`.
- 1M, 1Y, and ALL charts use persisted weekly closing quotes. 1W interpolates a seven-day path between weekly settlements. 1H and 1D are clearly identified as modeled within-week movement, not persisted historical candles.
- Market capitalization is calculated from the simulated quote and catalogue circulating supply. Displayed 24-hour volume is a simulated profile derived from market capitalization; it is not actual player or exchange trading volume.
- The investment wallet is a distinct cash balance. Add funds transfers money from available cash into the wallet; Move transfers unused wallet cash back. Both use the shared financial ledger and cannot create money.
- Market Buy/Sell actions use whole units, the shared 0.5% brokerage fee, and 10% tax on positive realized gains. Invalid, unaffordable, or underage trades leave the character unchanged.
- Convert sells the selected holding and uses only those sale proceeds to buy the target listed asset. Fees and realized-gain tax are applied through the same trade rules.
- Other legacy instruments (broad index, sector instruments, government bonds, and gold) remain under Other assets and retain their existing cash/trading behavior.
- Banking remains the source of available cash. The market wallet is separately shown and is funded only by an explicit transfer from cash.

## Interface

The Investments workspace has Stocks, Crypto, and Other assets tabs. Stocks and Crypto include portfolio value, investment-wallet cash, market discovery, My holdings, Top movers, Top gainers, Market cap, Trending, search, watchlists, and individual asset details. Asset details include a selectable chart range, high/low values, market capitalization, simulated volume, supply/risk information, position value, and Buy, Sell, Convert, and Deposit actions.

## Explicit follow-up work

- Add true daily and intraday persisted candles if finer-than-weekly simulation time is introduced; do not mislabel modeled 1H/1D paths as recorded history.
- Model company financial statements, earnings, dividends, ratings, corporate actions, and news before presenting them as real mechanics.
- Model token issuance/burns, staking, network fees, and dynamic circulating supply before treating crypto supply as changing.
- Add market-wide events and a richer company/token fundamentals model only when they connect to meaningful player choices.
