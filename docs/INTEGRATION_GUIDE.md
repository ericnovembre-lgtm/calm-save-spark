# $ave+ Integration Guide

## Overview

This guide walks through integrating $ave+ into your application, from initial setup to advanced white-label implementations.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Integration Patterns](#integration-patterns)
3. [White-Label Setup](#white-label-setup)
4. [Embedded Components](#embedded-components)
5. [OAuth Flow](#oauth-flow)
6. [Data Synchronization](#data-synchronization)
7. [Security Best Practices](#security-best-practices)
8. [Testing](#testing)

---

## Quick Start

### 1. Create Organization Account

Navigate to https://app.saveplus.app/whitelabel and create your organization:

```bash
# Via API
curl -X POST https://api.saveplus.app/v1/organizations \
  -H "Authorization: Bearer sk_live_..." \
  -d '{
    "name": "ACME Bank",
    "plan_type": "business",
    "settings": {
      "whitelabel_enabled": true
    }
  }'
```

### 2. Generate API Keys

Go to your organization dashboard → API Keys → Generate New Key

### 3. Install SDK

```bash
npm install @saveplus/node-sdk
```

### 4. Initialize Client

```javascript
const SavePlus = require('@saveplus/node-sdk');

const client = new SavePlus(process.env.SAVEPLUS_API_KEY, {
  organizationId: 'org_abc123'
});
```

### 5. Create Your First User

```javascript
const user = await client.users.create({
  email: 'customer@example.com',
  full_name: 'Jane Doe',
  metadata: {
    customer_id: 'cust_xyz789', // Your internal ID
    tier: 'premium'
  }
});

console.log(`Created user: ${user.id}`);
```

---

## Integration Patterns

### Pattern 1: Embedded Dashboard (iFrame)

**Use Case:** Add financial management to your existing app without rebuilding UI.

```html
<!-- Embed $ave+ dashboard -->
<iframe 
  src="https://embed.saveplus.app/dashboard?token=usr_token_xyz"
  width="100%" 
  height="800px"
  sandbox="allow-same-origin allow-scripts allow-forms"
></iframe>
```

**Generate Embed Token:**

```javascript
const embedToken = await client.users.createEmbedToken(userId, {
  expires_in: 3600, // 1 hour
  permissions: ['view_transactions', 'manage_goals']
});
```

---

### Pattern 2: API-Driven Custom UI

**Use Case:** Full control over UI/UX using $ave+ as backend.

```javascript
// Your React component
import { useState, useEffect } from 'react';
import { SavePlusClient } from '@saveplus/react-sdk';

function FinancialDashboard({ userId }) {
  const [healthScore, setHealthScore] = useState(null);
  const client = new SavePlusClient();

  useEffect(() => {
    async function loadData() {
      const score = await client.users.getHealthScore(userId);
      setHealthScore(score);
    }
    loadData();
  }, [userId]);

  return (
    <div className="dashboard">
      <h1>Financial Health: {healthScore?.score}</h1>
      {/* Custom UI using $ave+ data */}
    </div>
  );
}
```

---

### Pattern 3: Hybrid (White-Label Portal + API)

**Use Case:** Use $ave+'s branded portal for complex features, APIs for simple operations.

```javascript
// Redirect to white-label portal for onboarding
window.location.href = `https://banking.acmebank.com/onboarding?token=${token}`;

// Use API for balance checks
const balance = await client.accounts.getBalance(accountId);
```

---

## White-Label Setup

### Step 1: Configure Branding

```javascript
await client.organizations.updateBranding({
  primary_color: '#0066FF',
  secondary_color: '#00B4D8',
  logo_url: 'https://cdn.acmebank.com/logo.png',
  app_name: 'ACME Banking',
  custom_domain: 'banking.acmebank.com',
  theme: 'light',
  fonts: {
    heading: 'Montserrat',
    body: 'Inter'
  }
});
```

### Step 2: Custom Domain Setup

1. Add DNS records:
   ```
   CNAME banking.acmebank.com -> embed.saveplus.app
   ```

2. Upload SSL certificate (or use Let's Encrypt):
   ```bash
   curl -X POST https://api.saveplus.app/v1/organizations/org_abc123/ssl \
     -F "certificate=@cert.pem" \
     -F "private_key=@key.pem"
   ```

### Step 3: Configure Authentication

```javascript
// Use your existing auth system
await client.organizations.updateSettings({
  sso_enabled: true,
  sso_provider: 'saml',
  sso_config: {
    entity_id: 'https://acmebank.com/sso',
    acs_url: 'https://banking.acmebank.com/auth/callback',
    certificate: '...'
  }
});
```

---

## Embedded Components

### React Component Library

```bash
npm install @saveplus/react-components
```

### Available Components

#### 1. Financial Health Widget

```jsx
import { HealthScoreWidget } from '@saveplus/react-components';

<HealthScoreWidget 
  userId={userId}
  onScoreClick={(score) => console.log(score)}
/>
```

#### 2. Goal Progress Card

```jsx
import { GoalProgressCard } from '@saveplus/react-components';

<GoalProgressCard 
  goalId={goalId}
  showActions={true}
  onComplete={() => alert('Goal completed!')}
/>
```

#### 3. Transaction List

```jsx
import { TransactionList } from '@saveplus/react-components';

<TransactionList 
  userId={userId}
  filters={{ category: 'dining' }}
  pageSize={20}
/>
```

#### 4. Digital Twin Simulator

```jsx
import { TwinSimulator } from '@saveplus/react-components';

<TwinSimulator 
  userId={userId}
  onSimulationComplete={(results) => console.log(results)}
/>
```

### Component Theming

```jsx
import { SavePlusProvider } from '@saveplus/react-components';

<SavePlusProvider theme={{
  colors: {
    primary: '#0066FF',
    secondary: '#00B4D8'
  },
  fonts: {
    body: 'Inter, sans-serif'
  }
}}>
  <YourApp />
</SavePlusProvider>
```

---

## OAuth Flow

### Step 1: Redirect User to $ave+

```javascript
const authUrl = client.oauth.getAuthorizationUrl({
  client_id: 'your_client_id',
  redirect_uri: 'https://yourapp.com/callback',
  scope: 'read_accounts write_goals manage_delegations',
  state: 'random_state_token'
});

// Redirect
window.location.href = authUrl;
```

### Step 2: Handle Callback

```javascript
// On your callback endpoint
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state token
  if (state !== expectedState) {
    return res.status(400).send('Invalid state');
  }
  
  // Exchange code for access token
  const tokens = await client.oauth.exchangeCode(code);
  
  // Store tokens securely
  await db.saveTokens(userId, tokens);
  
  res.redirect('/dashboard');
});
```

### Step 3: Refresh Tokens

```javascript
async function getValidAccessToken(userId) {
  const tokens = await db.getTokens(userId);
  
  if (Date.now() > tokens.expires_at) {
    const newTokens = await client.oauth.refreshToken(tokens.refresh_token);
    await db.saveTokens(userId, newTokens);
    return newTokens.access_token;
  }
  
  return tokens.access_token;
}
```

---

## Data Synchronization

### Webhook-Based Sync (Recommended)

```javascript
// Configure webhook
await client.webhooks.create({
  url: 'https://yourapp.com/webhooks/saveplus',
  events: ['account.synced', 'transaction.created']
});

// Handle webhook
app.post('/webhooks/saveplus', async (req, res) => {
  const signature = req.headers['x-saveplus-signature'];
  
  // Verify webhook signature
  if (!client.webhooks.verify(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = req.body;
  
  switch (event.type) {
    case 'account.synced':
      await syncAccountData(event.data);
      break;
    case 'transaction.created':
      await processTransaction(event.data);
      break;
  }
  
  res.status(200).send('OK');
});
```

### Polling-Based Sync

```javascript
// Poll for updates every 5 minutes
setInterval(async () => {
  const users = await db.getActiveUsers();
  
  for (const user of users) {
    const accounts = await client.accounts.list({ user_id: user.id });
    await db.updateAccounts(accounts);
    
    const transactions = await client.transactions.list({
      user_id: user.id,
      since: user.last_sync
    });
    await db.insertTransactions(transactions);
    
    await db.updateLastSync(user.id, Date.now());
  }
}, 5 * 60 * 1000);
```

---

## Security Best Practices

### 1. API Key Management

```javascript
// ❌ BAD: Hardcoded keys
const client = new SavePlus('sk_live_abc123...');

// ✅ GOOD: Environment variables
const client = new SavePlus(process.env.SAVEPLUS_API_KEY);

// ✅ BETTER: Secrets manager (AWS Secrets Manager, HashiCorp Vault)
const apiKey = await secretsManager.getSecret('saveplus/api_key');
const client = new SavePlus(apiKey);
```

### 2. Rotate Keys Regularly

```bash
# Generate new key
NEW_KEY=$(curl -X POST https://api.saveplus.app/v1/api-keys \
  -H "Authorization: Bearer sk_live_old...")

# Update in production
kubectl set env deployment/api SAVEPLUS_API_KEY=$NEW_KEY

# Revoke old key after verification
curl -X DELETE https://api.saveplus.app/v1/api-keys/key_old
```

### 3. Use Restricted Keys

```javascript
// Create restricted key for specific operations
const restrictedKey = await client.apiKeys.create({
  name: 'Transaction Read-Only',
  permissions: ['read:transactions', 'read:accounts'],
  rate_limit: 500,
  expires_at: '2025-12-31'
});
```

### 4. Validate Webhook Signatures

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 5. Implement Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later'
});

app.use('/api/saveplus', apiLimiter);
```

---

## Testing

### Test Environment

All test requests use `sk_test_` keys and hit sandbox endpoints.

```javascript
const testClient = new SavePlus('sk_test_abc123...', {
  baseUrl: 'https://api-sandbox.saveplus.app/v1'
});
```

### Mock Data

```javascript
// Create test user
const testUser = await testClient.users.create({
  email: 'test@example.com',
  full_name: 'Test User'
});

// Link test account (Plaid sandbox)
const publicToken = 'public-sandbox-xxx';
await testClient.accounts.link({
  user_id: testUser.id,
  public_token: publicToken
});

// Simulate transactions
await testClient.testing.simulateTransaction({
  account_id: 'acc_test_123',
  amount: -45.99,
  merchant: 'Test Coffee Shop',
  category: 'dining'
});
```

### Integration Tests

```javascript
const { expect } = require('chai');
const SavePlus = require('@saveplus/node-sdk');

describe('SavePlus Integration', () => {
  let client, userId;
  
  before(() => {
    client = new SavePlus(process.env.SAVEPLUS_TEST_KEY);
  });
  
  it('should create a user', async () => {
    const user = await client.users.create({
      email: 'test@example.com',
      full_name: 'Test User'
    });
    userId = user.id;
    expect(user.email).to.equal('test@example.com');
  });
  
  it('should get financial health score', async () => {
    const health = await client.users.getHealthScore(userId);
    expect(health.score).to.be.a('number');
    expect(health.score).to.be.within(0, 100);
  });
  
  after(async () => {
    await client.users.delete(userId);
  });
});
```

### Webhook Testing

Use webhook.site or ngrok for local testing:

```bash
# Start ngrok tunnel
ngrok http 3000

# Configure webhook with ngrok URL
curl -X POST https://api-sandbox.saveplus.app/v1/webhooks \
  -H "Authorization: Bearer sk_test_..." \
  -d '{
    "url": "https://abc123.ngrok.io/webhooks/saveplus",
    "events": ["transaction.created"]
  }'

# Trigger test webhook
curl -X POST https://api-sandbox.saveplus.app/v1/webhooks/test \
  -H "Authorization: Bearer sk_test_..." \
  -d '{"type": "transaction.created"}'
```

---

## Production Checklist

- [ ] Switch to `sk_live_` API keys
- [ ] Configure custom domain and SSL
- [ ] Set up webhook endpoints with signature verification
- [ ] Implement rate limiting on your endpoints
- [ ] Configure monitoring and alerting
- [ ] Test error handling and retry logic
- [ ] Document your integration internally
- [ ] Train support team on troubleshooting
- [ ] Set up log aggregation (Datadog, Splunk, etc.)
- [ ] Implement backup and disaster recovery

---

## Support Resources

- **Integration Support:** integrations@saveplus.app
- **Discord Channel:** #integrations
- **Office Hours:** Tuesdays 2-3pm ET
- **API Status:** https://status.saveplus.app
- **Postman Collection:** https://postman.com/saveplus

---

## Example Projects

### Full-Stack Examples

- **Node.js + React:** https://github.com/saveplus/examples/nodejs-react
- **Python + Vue:** https://github.com/saveplus/examples/python-vue
- **Ruby on Rails:** https://github.com/saveplus/examples/rails

### White-Label Implementations

- **Banking Portal:** https://github.com/saveplus/examples/banking-portal
- **Credit Union:** https://github.com/saveplus/examples/credit-union
- **Fintech App:** https://github.com/saveplus/examples/fintech-app
