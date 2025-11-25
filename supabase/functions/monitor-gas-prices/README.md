# Gas Price Monitoring Function

This edge function monitors gas prices across multiple chains and sends notifications to users when prices drop below their configured thresholds.

## Features

- Monitors gas prices for Ethereum, Polygon, Arbitrum, Optimism, and Base
- Sends notifications when gas drops below user-defined thresholds
- Rate-limits notifications to once per hour per alert
- Integrates with wallet notification system

## Setup

### Scheduled Execution (Recommended)

To run this function on a schedule, set up a Supabase Database Webhook or use an external cron service:

#### Option 1: pg_cron (Supabase Dashboard)

1. Go to your Supabase Dashboard → Database → Webhooks
2. Create a new webhook:
   - **Type**: Function URL
   - **Method**: POST
   - **URL**: `https://[PROJECT-REF].supabase.co/functions/v1/monitor-gas-prices`
   - **Schedule**: Every 10 minutes (`*/10 * * * *`)
   - **Headers**: 
     ```
     Authorization: Bearer [ANON_KEY]
     ```

#### Option 2: External Cron Service

Use services like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Set up a new cron job
2. URL: `https://[PROJECT-REF].supabase.co/functions/v1/monitor-gas-prices`
3. Method: POST
4. Schedule: Every 10 minutes
5. Headers: `Authorization: Bearer [ANON_KEY]`

## Manual Invocation

You can manually trigger the function for testing:

```bash
curl -X POST \
  https://[PROJECT-REF].supabase.co/functions/v1/monitor-gas-prices \
  -H "Authorization: Bearer [ANON_KEY]"
```

## Response Format

```json
{
  "success": true,
  "gasPrices": {
    "ethereum": 35,
    "polygon": 125,
    "arbitrum": 8,
    "optimism": 7,
    "base": 4
  },
  "notificationsSent": 2,
  "notifications": [
    {
      "user_id": "uuid",
      "chain": "ethereum",
      "gas": 35
    }
  ]
}
```

## Production Integration

In production, replace the mock `fetchGasPrices()` function with real API calls to:

- **Ethereum**: Etherscan Gas Tracker API
- **Polygon**: Polygonscan Gas Tracker API
- **Arbitrum**: Arbiscan API
- **Optimism**: Optimistic Etherscan API
- **Base**: Basescan API

Example:

```typescript
async function fetchGasPrices(): Promise<Record<string, number>> {
  const [ethGas, polyGas, arbGas, opGas, baseGas] = await Promise.all([
    fetchEthereumGas(),
    fetchPolygonGas(),
    // ... other chains
  ]);
  
  return {
    ethereum: ethGas,
    polygon: polyGas,
    arbitrum: arbGas,
    optimism: opGas,
    base: baseGas,
  };
}
```

## Testing

Test the function locally:

```bash
supabase functions serve monitor-gas-prices --no-verify-jwt
```

Then call it:

```bash
curl -X POST http://localhost:54321/functions/v1/monitor-gas-prices
```
