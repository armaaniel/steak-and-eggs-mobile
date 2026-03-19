# Steak & Eggs Mobile

React Native app for [steakneggs.app](https://steakneggs.app/) — a trading simulator with streaming market data.

Backend repo: [steak-and-eggs](https://github.com/armaaniel/steak-and-eggs)

## Architecture

- Expo Router file-based navigation with tab layout and stack screens
- Real-time price updates via a shared ActionCable WebSocket connection
- React Query manages all server state with automatic cache invalidation after trades, deposits, and withdrawals
- Full light and dark mode support driven by system theme
- Graceful loading states — elements fade in once their data arrives
- All API calls set meaningful fallback values in the event of network failures
- Multi-step buy/sell order flow with confirmation and order receipt
- Debounced search with locally persisted recent stocks

## Deep Dive

### WebSocket Management

The app shares a single WebSocket connection for all real-time price updates across components. On the home screen, it subscribes to updates for every held position. On the stock screen, it subscribes to updates for the current symbol. Subscriptions are cleaned up on unmount.

### Auth Flow

`AuthContext` wraps the entire app. On launch it reads the token from AsyncStorage - if present, the root layout redirects into the tab group; if absent, it shows the welcome/login/signup screens. Any 401 response from the API clears the stored token and redirects to login. All API hooks check auth state before fetching.

### Loading States

Content visibility is gated behind data resolution. Prices, ticker info, chart data, and market details each render at zero opacity and fade in independently once their data arrives – using both `Animated.Value` and Reanimated's `FadeIn` transitions.

### Caching & Invalidation

React Query caches portfolio data, chart data, and activity history. After any mutation — buy, sell, deposit, or withdraw — all three query keys are invalidated so the UI reflects the latest state without a manual refresh.

### Reusable Components

Login and signup share a single `AuthForm` component that adapts based on a `mode` prop. Deposit and withdraw share a single `FundsButton` component with a bottom sheet picker that switches between the two flows. `PositionCard` renders in both the home screen holdings list and the stock detail page.

### Derived Values

As prices stream in via WebSocket, the positions list recalculates P&L and daily change per position. The portfolio value recalculates client-side every 5 seconds using a throttled callback. Estimated cost on buy/sell orders updates in real time as the user types.

### Error Handling

The app degrades gracefully on network failures — every fetch sets fallback values so the UI never breaks. 401 responses clear auth state and redirect to login. Search, trade, deposit, and withdraw mutations surface inline error messages.

### Theming

A centralized `Colors` object exports light and dark palettes. Every component pulls colors from the theme via `useColorScheme()` — no hardcoded color values. Semantic colors (positive/negative/accent) adapt per mode.

## Screens

| Screen | Route | Description |
|---|---|---|
| Welcome | `/welcome` | Onboarding carousel with login, signup, and demo entry points |
| Login | `/login` | Auth form with validation |
| Signup | `/signup` | Auth form with username rules and demo shortcut |
| Home | `/(tabs)/` | Portfolio value, chart, cash balance, holdings list with live prices |
| Activity | `/(tabs)/activity` | Transaction history with expandable detail rows |
| Search | `/(tabs)/search` | Debounced ticker search with recent stocks grid |
| Settings | `/(tabs)/settings` | Profile, change password, delete account, logout |
| Stock Detail | `/(tabs)/stocks/[symbol]` | Price, chart, buy/sell flow, holdings, market details, company description |

## Tech Stack

Expo · React Native · TypeScript · Expo Router · React Query · ActionCable · Reanimated · Bottom Sheet · Wagmi Charts
