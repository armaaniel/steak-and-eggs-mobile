# Steak & Eggs — Web to React Native/Expo Port

## Overview

I'm porting my React web app (`steak-and-eggs-spa/`) to a React Native mobile app (`steak-and-eggs-mobile/`) built with Expo and Expo Router. The mobile app was scaffolded with `npx create-expo-app@latest` using the default template.

The web app is a stock trading platform with real-time price updates via ActionCable WebSockets, JWT auth, and a Rails API backend.

## Theme / Dark Mode

Use React Native's `useColorScheme()` hook to detect system theme. Create a shared theme file at `constants/theme.ts` that exports light and dark color objects. Every component pulls colors from the theme — never hardcode color values directly in components.

### Light mode
- Background: #F5F4EE
- Surface (cards): #FFFFFF
- Border: #E5E3DB
- Text: #1A1915
- Text muted: #6B6961
- Text hint: #9C9891

### Dark mode
- Background: #1A1915
- Surface (cards): #242320
- Border: #3D3B34
- Text: #EDEDEB
- Text muted: #A3A09A
- Text hint: #6B6961

### Semantic colors (both modes)
- Positive (gains): #2D8C4E (light), #4CAF6E (dark)
- Negative (losses): #C4391D (light), #E05A3E (dark)
- Accent: #C15F3C (light), #3B82F6 (dark)

## What to port (and what NOT to)

### Port these screens:
- `AuthForm.tsx` (login/signup) → `app/login.tsx` and `app/signup.tsx`. AuthForm stays as one shared component with a `mode` prop. `app/login.tsx` renders `<AuthForm mode="login" />` and `app/signup.tsx` renders `<AuthForm mode="signup" />`. Drop the split-panel desktop layout (ls-left / ls-right). Mobile is single column: heading, error message, inputs, button, footer link. The logo can optionally go above the form but the two-panel layout is gone.
- `Home.tsx` → `app/(tabs)/index.tsx`
- `Stocks.tsx` → `app/stocks/[symbol].tsx`
- `Activity.tsx` → `app/(tabs)/activity.tsx`

### Do NOT port (leave out entirely):
- Everything in the `datacat/` routes (AllRoutes, Endpoint, Cache, Latent, Connections)
- `DCList.tsx`, `DCSummary.tsx` layouts
- `DCNavbar.tsx`, `EndpointNav.tsx`
- `TraceTable.tsx`, `TraceOverviewTable.tsx`
- `Sidebar.tsx` → not needed on mobile
- The Apollo Client / GraphQL setup (`apolloClient.ts`)
- All DataCat-related types (Trace, Connection, TraceSummary, etc.)

### Port these components:
- `Navbar.tsx` → replaced by Expo Router tab layout + header
- `Searchbar.tsx` → `app/(tabs)/search.tsx` (its own tab) or search modal
- `Chart.tsx` → `components/Chart.tsx` (use react-native-wagmi-charts)
- `BuySell.tsx` → `components/BuySell.tsx` (full-width card, same 3-step logic)
- `FundsButton.tsx` → `components/FundsButton.tsx` (deposit/withdraw modals)
- `PositionsTable.tsx` → `components/PositionsList.tsx` (FlatList, not HTML table)
- `PositionTable.tsx` → `components/PositionCard.tsx`

### Port these utilities (they work as-is, no changes needed):
- `utils.ts` → `utils.ts` (toReadable, toCurrency, toPercent, toPortfolio, toPnl, toPnlCurrency)
- `types.ts` → `types.ts` (only the non-DataCat types: Position, Positions, ChartData, UserData, TickerData, Prices, Price, Open, Error)

## Critical conversions

### Auth: localStorage → AsyncStorage
Every instance of `localStorage.getItem('authToken')` and `localStorage.setItem(...)` and `localStorage.removeItem(...)` must use `AsyncStorage` from `@react-native-async-storage/async-storage`. Remember these are async calls so they need `await`.

### Navigation: react-router-dom → expo-router
- `useNavigate()` → `useRouter()` from `expo-router`
- `useParams()` → `useLocalSearchParams()` from `expo-router`
- `<Navigate to="/login" />` → `<Redirect href="/login" />` from `expo-router`
- `<Link to="/signup">` → `<Link href="/signup">` from `expo-router`
- `navigate('/home')` → `router.replace('/(tabs)')` or `router.push(...)`

### WebSockets: ActionCable consumer
The `consumer.ts` file uses `@rails/actioncable` with `localStorage`. Convert to use AsyncStorage for the token. The ActionCable library itself should work in React Native — install `@rails/actioncable`. The consumer needs to be initialized async since getting the token from AsyncStorage is async.

### Environment variables
`import.meta.env.VITE_API` → `process.env.EXPO_PUBLIC_API_URL`)

### Styling: CSS → StyleSheet
All CSS files in `stylesheets/desktop/` get replaced with `StyleSheet.create()` objects colocated in each component. No separate CSS files.

### HTML → React Native components
- `<div>` → `<View>`
- `<p>`, `<span>`, `<h2>`, `<label>` → `<Text>`
- `<input>` → `<TextInput>`
- `<button>` → `<Pressable>` or `<TouchableOpacity>`
- `<img>` → `<Image>` from `react-native`
- `<table>` → `<FlatList>` with card-style rows
- `<select>` → use a picker library or custom dropdown
- `<form onSubmit>` → just use `onPress` on the submit button
- `<header>` / `<main>` / `<footer>` → `<View>`
- `<a>` / `<Link>` → `<Link>` from `expo-router` or `<Pressable>` with `router.push()`
- `className` → `style` prop with StyleSheet objects
- `<hr>` → `<View style={{ height: 1, backgroundColor: '#e4e2e1' }} />`

### Chart library
Replace `recharts` with `react-native-wagmi-charts`. The Chart component receives `chartData: { date: string, value: number }[]` — 
map to `{ timestamp: number, value: number }[]` for wagmi-charts. Use `LineChart.CursorCrosshair` for the tooltip interaction.

### NumericFormat
`react-number-format`'s `NumericFormat` doesn't work in React Native. Replace with a `<TextInput keyboardType="decimal-pad">` with manual formatting logic for the shares input in BuySell.

## Mobile layout rules

Everything stacks vertically. No side-by-side panels. All screens scroll with `<ScrollView>`.

### Home screen layout (top to bottom):
1. Portfolio value text
2. Portfolio chart (full width)
3. Cash balance card with deposit/withdraw buttons
4. "Holdings" section header
5. FlatList of position cards (each card: logo, symbol, name, value, shares, PnL%)

### Stock detail screen layout (top to bottom):
1. Back button header
2. Logo + symbol + company name
3. Price + percent change + timestamp
4. Stock chart (full width)
5. Buy/Sell card (full width, same 3-step flow)
6. Holdings card (if user has position)
7. Market details grid (open, high, low, volume, currency, exchange)
8. Company description (if common stock)

### Activity screen layout:
- Replace the HTML table with a FlatList of transaction cards
- Each card shows: transaction type, symbol, quantity, price, value, realized PnL, date
- Replace the pagination buttons with infinite scroll or a "load more" button

### Tab structure:
```
app/
  _layout.tsx              ← root stack navigator
  login.tsx                ← login screen
  signup.tsx               ← signup screen
  (tabs)/
    _layout.tsx            ← bottom tab bar (Home, Activity, Search)
    index.tsx              ← Home screen
    activity.tsx           ← Activity screen
    search.tsx             ← Search screen (was Searchbar component)
  stocks/
    [symbol].tsx           ← Stock detail (pushed on stack from Home or Search)
```

### Auth flow:
In the root `_layout.tsx`, check AsyncStorage for a token on app load. If no token, show login/signup. If token exists, show the (tabs) group. If any API call returns 401, clear the token and redirect to login.

## Notes:
- If you're unsure about a conversion or can't find a React Native equivalent for something, add a `// TODO:` comment explaining what needs attention rather than guessing.
- The API base URL should be configurable — don't hardcode it.
- The logo SVG in AuthForm can be converted to `react-native-svg` or just use an image asset.
- Stock logos use `https://img.logo.dev/ticker/${symbol}?token=pk_ZBCJebqoQXKBWVLhwcIBfg&retina=true&format=png` — this works fine with React Native's `<Image>` component.
- The web app has a `fallback-logo.svg` for when stock logos fail to load — convert to a local image asset with `onError` fallback on the `<Image>` component.