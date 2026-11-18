# Simulated Investment Markets

## Product scope

Finance contains separate **Stocks** and **Crypto** destinations, each with its own market list and portfolio subtotal. Both share the existing investment holdings, brokerage fees, capital-gains tax, cash balance, and financial transaction ledger. The existing broad index, sector instruments, government bonds, and gold remain under Other assets.

The initial fictional market catalogue includes ten listed companies and eight cryptocurrencies. Each listing has a stable internal asset type, symbol, category, starting quote, and volatility profile. These are game assets, not real exchange listings or recommendations.

## Market behavior

- Market prices are simulated locally and do not use external APIs, live quotes, or real-world financial data.
- Listed asset prices are initialized from the catalogue and updated deterministically during the existing annual asset settlement. Broad economic growth influences all assets; crypto has higher volatility and wider movement bounds than listed equities.
- Prices are stored per asset in the character's optional `marketPrices.assets` map. The market watchlist is stored in the optional `marketWatchlist` field.
- Market detail charts are illustrative simulated trends. The current implementation does not persist intraday or daily candles; annual settlement remains the authoritative price update cadence.
- Purchases and sales use the existing cash balance and investment transaction ledger. Brokerage is 0.5% per trade; positive realized gains are taxed at 10%. Fractional displayed quotes settle to whole game-currency units.
- Trading is age-gated at 18, uses whole units, and rejects unaffordable or invalid orders without changing state.
- Banking remains the source of available cash. The cash summary links to Banking rather than creating a second, duplicate balance.

## Interface

Stocks and Crypto are separate Finance destinations. Each provides portfolio value, available cash, searchable listings, holdings, gainers, losers, trending filters, and a persistent watchlist. Selecting an asset opens its detail view with quote, percentage movement, illustrative chart ranges, category/risk information, position value, and buy/sell controls.

## Follow-up work

The first implementation deliberately keeps the market local and deterministic. Later work can add persisted weekly/daily price history, dividends and corporate actions, market-cap/supply rankings, news/events, and portfolio-specific cash transfers after the weekly-to-monthly financial cadence is settled. Do not imply those features are implemented until their simulation rules and tests exist.
