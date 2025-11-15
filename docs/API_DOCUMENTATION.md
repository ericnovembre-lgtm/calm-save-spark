# $ave+ API Documentation

## Overview

The $ave+ API provides programmatic access to our financial management platform, enabling white-label partners and fintech integrations to build custom experiences powered by our infrastructure.

**Base URL:** `https://api.saveplus.app/v1`  
**Authentication:** API Key (Header-based)  
**Format:** JSON  
**Rate Limit:** 1000 requests/hour (customizable per plan)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Core Endpoints](#core-endpoints)
3. [White-Label APIs](#white-label-apis)
4. [Webhooks](#webhooks)
5. [Error Handling](#error-handling)
6. [Rate Limits](#rate-limits)
7. [SDKs](#sdks)

---

## Authentication

### API Key Authentication

All API requests require an API key passed in the `Authorization` header:

```http
Authorization: Bearer sk_live_abc123...
```

### Obtaining API Keys

1. Navigate to your organization's White-Label dashboard
2. Go to the **API Keys** tab
3. Click **Generate New Key**
4. Store securely - keys are shown only once

### Key Types

| Type | Prefix | Usage |
|------|--------|-------|
| Test | `sk_test_` | Sandbox environment |
| Live | `sk_live_` | Production environment |
| Restricted | `rk_live_` | Scoped permissions |

---

## Core Endpoints

### Users

#### Create User
```http
POST /users
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "organization_id": "org_abc123",
  "metadata": {
    "source": "partner_portal",
    "tier": "premium"
  }
}
```

**Response:**
```json
{
  "id": "usr_xyz789",
  "email": "user@example.com",
  "full_name": "John Doe",
  "organization_id": "org_abc123",
  "created_at": "2025-01-15T10:30:00Z",
  "onboarding_completed": false
}
```

#### Get User
```http
GET /users/{user_id}
```

#### Update User
```http
PATCH /users/{user_id}
```

#### List Users
```http
GET /users?organization_id=org_abc123&limit=50&offset=0
```

---

### Accounts

#### Link Account (Plaid)
```http
POST /accounts/link
```

**Request Body:**
```json
{
  "user_id": "usr_xyz789",
  "public_token": "public-sandbox-xxx",
  "metadata": {
    "institution": {
      "name": "Chase",
      "institution_id": "ins_1"
    }
  }
}
```

**Response:**
```json
{
  "account_id": "acc_123",
  "institution_name": "Chase",
  "account_type": "checking",
  "balance": 5420.50,
  "currency": "USD",
  "last_synced": "2025-01-15T10:35:00Z"
}
```

#### List Accounts
```http
GET /accounts?user_id=usr_xyz789
```

#### Sync Account
```http
POST /accounts/{account_id}/sync
```

---

### Transactions

#### List Transactions
```http
GET /transactions?user_id=usr_xyz789&start_date=2025-01-01&end_date=2025-01-31
```

**Response:**
```json
{
  "data": [
    {
      "id": "txn_001",
      "account_id": "acc_123",
      "amount": -45.99,
      "category": "dining",
      "merchant": "Starbucks",
      "date": "2025-01-14",
      "pending": false
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

#### Categorize Transaction
```http
PATCH /transactions/{transaction_id}
```

---

### Goals

#### Create Goal
```http
POST /goals
```

**Request Body:**
```json
{
  "user_id": "usr_xyz789",
  "name": "Emergency Fund",
  "target_amount": 10000,
  "target_date": "2025-12-31",
  "category": "emergency",
  "auto_save_enabled": true,
  "auto_save_amount": 250
}
```

#### Get Goal Progress
```http
GET /goals/{goal_id}/progress
```

#### List Goals
```http
GET /goals?user_id=usr_xyz789&status=active
```

---

### Savings (Pots)

#### Create Pot
```http
POST /pots
```

**Request Body:**
```json
{
  "user_id": "usr_xyz789",
  "name": "Vacation Fund",
  "description": "Summer trip to Greece",
  "target_amount": 5000,
  "current_amount": 1200,
  "color": "#4CAF50",
  "icon": "plane"
}
```

#### Transfer to Pot
```http
POST /pots/{pot_id}/transfer
```

---

### AI Insights

#### Get Financial Health Score
```http
GET /users/{user_id}/health-score
```

**Response:**
```json
{
  "score": 78,
  "trend": 5,
  "factors": {
    "emergency_fund": 85,
    "debt_ratio": 72,
    "savings_rate": 80,
    "spending_control": 75
  },
  "recommendations": [
    {
      "type": "emergency_fund",
      "priority": "high",
      "message": "Increase emergency fund to 6 months expenses"
    }
  ]
}
```

#### Get Spending Insights
```http
GET /users/{user_id}/insights/spending?period=30d
```

#### Detect Subscriptions
```http
GET /users/{user_id}/subscriptions/detect
```

---

### Digital Twin

#### Get Twin Profile
```http
GET /users/{user_id}/twin
```

#### Run Scenario Simulation
```http
POST /users/{user_id}/twin/simulate
```

**Request Body:**
```json
{
  "scenario_type": "job_change",
  "parameters": {
    "new_income": 95000,
    "start_date": "2025-06-01",
    "relocation_cost": 8000
  },
  "simulation_years": 10
}
```

---

### Autonomous Agents

#### List Agent Delegations
```http
GET /users/{user_id}/delegations
```

#### Create Delegation
```http
POST /delegations
```

**Request Body:**
```json
{
  "user_id": "usr_xyz789",
  "agent_id": "agent_investment_manager",
  "granted_permissions": [
    "execute_rebalancing",
    "tax_loss_harvesting"
  ],
  "constraints": {
    "max_transaction_value": 10000,
    "require_approval_above": 5000
  }
}
```

#### Revoke Delegation
```http
DELETE /delegations/{delegation_id}
```

---

### Investment Manager

#### Get Portfolio
```http
GET /users/{user_id}/portfolio
```

#### Set Investment Mandate
```http
POST /users/{user_id}/investment-mandate
```

**Request Body:**
```json
{
  "risk_tolerance": "moderate",
  "target_allocation": {
    "stocks": 70,
    "bonds": 25,
    "alternatives": 5
  },
  "rebalancing_threshold": 5,
  "tax_loss_harvesting_enabled": true
}
```

---

### DeFi Manager

#### List DeFi Positions
```http
GET /users/{user_id}/defi/positions
```

#### Execute Yield Strategy
```http
POST /users/{user_id}/defi/strategies
```

---

### Life Events (FaaLE)

#### Start Life Event Playbook
```http
POST /life-events/playbooks
```

**Request Body:**
```json
{
  "user_id": "usr_xyz789",
  "event_type": "marriage",
  "event_date": "2025-08-15",
  "metadata": {
    "partner_name": "Jane Smith",
    "state": "CA"
  }
}
```

#### Get Playbook Status
```http
GET /life-events/playbooks/{playbook_id}
```

---

## White-Label APIs

### Organization Management

#### Get Organization
```http
GET /organizations/{org_id}
```

#### Update Organization Settings
```http
PATCH /organizations/{org_id}
```

---

### Branding

#### Get Branding Config
```http
GET /organizations/{org_id}/branding
```

**Response:**
```json
{
  "primary_color": "#0066FF",
  "secondary_color": "#00B4D8",
  "logo_url": "https://cdn.saveplus.app/logos/org_abc123.png",
  "custom_domain": "banking.acmebank.com",
  "app_name": "ACME Banking",
  "theme": "light"
}
```

#### Update Branding
```http
PUT /organizations/{org_id}/branding
```

---

### Member Management

#### List Organization Members
```http
GET /organizations/{org_id}/members
```

#### Invite Member
```http
POST /organizations/{org_id}/members
```

#### Update Member Role
```http
PATCH /organizations/{org_id}/members/{member_id}
```

---

### Analytics

#### Get Usage Statistics
```http
GET /organizations/{org_id}/analytics/usage?period=30d
```

**Response:**
```json
{
  "period": {
    "start": "2024-12-15",
    "end": "2025-01-15"
  },
  "metrics": {
    "active_users": 1247,
    "new_users": 89,
    "total_transactions": 45632,
    "api_calls": 98450,
    "average_health_score": 76
  }
}
```

#### Get Revenue Metrics
```http
GET /organizations/{org_id}/analytics/revenue
```

---

## Webhooks

### Configuring Webhooks

```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://partner.com/webhooks/saveplus",
  "events": [
    "user.created",
    "account.linked",
    "goal.completed",
    "agent.action_executed"
  ],
  "secret": "whsec_xyz123"
}
```

### Webhook Events

#### User Events
- `user.created`
- `user.updated`
- `user.onboarding_completed`

#### Account Events
- `account.linked`
- `account.synced`
- `account.sync_failed`

#### Transaction Events
- `transaction.created`
- `transaction.updated`

#### Goal Events
- `goal.created`
- `goal.completed`
- `goal.milestone_reached`

#### Agent Events
- `agent.delegation_created`
- `agent.action_executed`
- `agent.approval_required`

### Webhook Payload Example

```json
{
  "id": "evt_abc123",
  "type": "goal.completed",
  "created": "2025-01-15T10:45:00Z",
  "data": {
    "goal_id": "gol_xyz789",
    "user_id": "usr_123",
    "name": "Emergency Fund",
    "target_amount": 10000,
    "completed_at": "2025-01-15T10:45:00Z"
  }
}
```

### Verifying Webhooks

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": {
    "type": "invalid_request",
    "message": "Missing required field: user_id",
    "field": "user_id",
    "code": "MISSING_FIELD"
  }
}
```

### Common Error Codes

- `INVALID_API_KEY` - API key is invalid or expired
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INSUFFICIENT_PERMISSIONS` - API key lacks required scope
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `VALIDATION_ERROR` - Request validation failed

---

## Rate Limits

### Default Limits

| Plan | Requests/Hour | Burst |
|------|---------------|-------|
| Free | 100 | 10 |
| Pro | 1,000 | 50 |
| Business | 10,000 | 200 |
| Enterprise | Custom | Custom |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1642258800
```

### Handling Rate Limits

```javascript
if (response.status === 429) {
  const retryAfter = response.headers['Retry-After'];
  await sleep(retryAfter * 1000);
  // Retry request
}
```

---

## SDKs

### Official SDKs

- **Node.js:** `npm install @saveplus/node-sdk`
- **Python:** `pip install saveplus`
- **Ruby:** `gem install saveplus`
- **PHP:** `composer require saveplus/sdk`

### Node.js Example

```javascript
const SavePlus = require('@saveplus/node-sdk');

const client = new SavePlus('sk_live_abc123...');

// Create user
const user = await client.users.create({
  email: 'user@example.com',
  full_name: 'John Doe',
  organization_id: 'org_abc123'
});

// Get accounts
const accounts = await client.accounts.list({
  user_id: user.id
});

// Run simulation
const simulation = await client.digitalTwin.simulate(user.id, {
  scenario_type: 'job_change',
  parameters: { new_income: 95000 }
});
```

### Python Example

```python
from saveplus import SavePlus

client = SavePlus('sk_live_abc123...')

# Create user
user = client.users.create(
    email='user@example.com',
    full_name='John Doe',
    organization_id='org_abc123'
)

# Get financial health
health = client.users.get_health_score(user.id)
print(f"Health Score: {health.score}")
```

---

## Support

- **Documentation:** https://docs.saveplus.app
- **API Status:** https://status.saveplus.app
- **Support:** api-support@saveplus.app
- **Discord:** https://discord.gg/saveplus

---

## Changelog

### v1.2.0 (2025-01-15)
- Added Digital Twin simulation endpoints
- Added autonomous agent delegation APIs
- Added DeFi position management
- Enhanced webhook event types

### v1.1.0 (2024-11-20)
- Added white-label branding APIs
- Added organization analytics
- Improved rate limiting

### v1.0.0 (2024-09-01)
- Initial API release
- Core user and account management
- Transaction and goal endpoints
