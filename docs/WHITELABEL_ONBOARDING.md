# White-Label Partner Onboarding Guide

## Welcome to $ave+

This guide will help you get your white-label implementation up and running in under 2 hours.

---

## Prerequisites

- Approved white-label partner account
- Access to your DNS settings
- SSL certificate (or ability to generate one)
- Development environment

---

## Onboarding Checklist

### Phase 1: Account Setup (15 minutes)

- [ ] **1.1** Create organization account at https://app.saveplus.app/whitelabel
- [ ] **1.2** Select your plan (Business or Enterprise)
- [ ] **1.3** Complete partner agreement
- [ ] **1.4** Verify your email and organization

### Phase 2: Branding Configuration (30 minutes)

- [ ] **2.1** Upload your logo (PNG, max 500KB)
- [ ] **2.2** Set primary and secondary colors
- [ ] **2.3** Choose font families
- [ ] **2.4** Configure app name and tagline
- [ ] **2.5** Preview white-label portal

**Example Branding Config:**

```json
{
  "app_name": "ACME Banking",
  "tagline": "Smart Money Management",
  "primary_color": "#0066FF",
  "secondary_color": "#00B4D8",
  "logo_url": "https://cdn.acmebank.com/logo.png",
  "favicon_url": "https://cdn.acmebank.com/favicon.ico",
  "fonts": {
    "heading": "Montserrat",
    "body": "Inter"
  },
  "theme": "light"
}
```

### Phase 3: Domain Setup (30 minutes)

- [ ] **3.1** Choose your subdomain (e.g., banking.acmebank.com)
- [ ] **3.2** Add CNAME record to DNS
- [ ] **3.3** Upload SSL certificate or enable Let's Encrypt
- [ ] **3.4** Verify domain ownership
- [ ] **3.5** Test custom domain access

**DNS Configuration:**

```
Type: CNAME
Name: banking
Value: embed.saveplus.app
TTL: 3600
```

### Phase 4: API Integration (45 minutes)

- [ ] **4.1** Generate API keys (test and live)
- [ ] **4.2** Install SDK in your app
- [ ] **4.3** Create test user via API
- [ ] **4.4** Test core endpoints
- [ ] **4.5** Configure webhooks

**Quick API Test:**

```bash
# Test user creation
curl -X POST https://api.saveplus.app/v1/users \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Test User",
    "organization_id": "org_abc123"
  }'
```

---

## Configuration Options

### 1. Authentication Methods

Choose how users will authenticate:

#### Option A: Embedded Auth (Default)
Users create accounts directly in your white-label portal.

```javascript
// No additional configuration needed
const user = await client.users.create({
  email: email,
  password: password // Hashed automatically
});
```

#### Option B: SSO Integration
Users authenticate via your existing identity provider.

```javascript
await client.organizations.updateSettings({
  sso_enabled: true,
  sso_provider: 'saml', // or 'oauth2'
  sso_config: {
    entity_id: 'https://idp.acmebank.com',
    acs_url: 'https://banking.acmebank.com/auth/callback',
    certificate: '...'
  }
});
```

#### Option C: OAuth Delegation
Users authorize $ave+ to access their data via OAuth.

```javascript
const authUrl = client.oauth.getAuthorizationUrl({
  client_id: 'your_client_id',
  redirect_uri: 'https://yourapp.com/callback',
  scope: 'read_accounts write_goals'
});
```

---

### 2. Feature Configuration

Enable/disable features for your users:

```javascript
await client.organizations.updateFeatures({
  enabled_features: [
    'financial_health',
    'goal_tracking',
    'digital_twin',
    'autonomous_agents',
    'defi_manager',
    'investment_manager',
    'life_event_playbooks'
  ],
  disabled_features: [
    'crypto_holdings' // Hide crypto features
  ]
});
```

---

### 3. Compliance Settings

Configure compliance based on your region:

```javascript
await client.organizations.updateCompliance({
  region: 'US', // US, EU, UK, etc.
  kyc_required: true,
  data_residency: 'US',
  retention_policy: {
    active_users: '7_years',
    inactive_users: '3_years'
  }
});
```

---

## Advanced Configuration

### Custom User Fields

Add custom fields to user profiles:

```javascript
await client.organizations.updateSchema({
  custom_fields: [
    {
      name: 'customer_tier',
      type: 'enum',
      options: ['basic', 'premium', 'vip']
    },
    {
      name: 'branch_id',
      type: 'string'
    },
    {
      name: 'loyalty_points',
      type: 'number'
    }
  ]
});
```

### Custom Categories

Override default transaction categories:

```javascript
await client.organizations.updateCategories({
  categories: [
    { id: 'banking_fees', name: 'Bank Fees', icon: 'building' },
    { id: 'investments', name: 'Investments', icon: 'trending-up' },
    { id: 'payroll', name: 'Payroll', icon: 'dollar-sign' }
  ]
});
```

### Custom Notifications

Configure notification templates:

```javascript
await client.organizations.updateNotifications({
  templates: {
    goal_completed: {
      title: 'Congratulations! 🎉',
      body: 'You completed your {{goal_name}} goal!',
      channels: ['push', 'email']
    },
    low_balance: {
      title: 'Low Balance Alert',
      body: 'Your balance is below ${{threshold}}',
      channels: ['push', 'sms']
    }
  }
});
```

---

## Testing Your Integration

### 1. User Flow Test

```javascript
// Create test user
const user = await client.users.create({
  email: 'test@example.com',
  full_name: 'Test User'
});

// Link account
await client.accounts.link({
  user_id: user.id,
  public_token: 'public-sandbox-xxx'
});

// Create goal
const goal = await client.goals.create({
  user_id: user.id,
  name: 'Emergency Fund',
  target_amount: 10000
});

// Get health score
const health = await client.users.getHealthScore(user.id);
console.log('Health Score:', health.score);
```

### 2. Embedded Component Test

```html
<!DOCTYPE html>
<html>
<head>
  <title>White-Label Test</title>
</head>
<body>
  <h1>ACME Banking Portal</h1>
  
  <!-- Embedded dashboard -->
  <iframe 
    src="https://banking.acmebank.com/dashboard?token=..."
    width="100%" 
    height="800px"
  ></iframe>
  
  <script>
    // Test postMessage communication
    window.addEventListener('message', (event) => {
      if (event.origin === 'https://banking.acmebank.com') {
        console.log('Message from $ave+:', event.data);
      }
    });
  </script>
</body>
</html>
```

### 3. Webhook Test

```javascript
// Trigger test webhook
await client.webhooks.test({
  webhook_id: 'hook_abc123',
  event_type: 'user.created',
  test_data: {
    user_id: 'usr_test_123',
    email: 'test@example.com'
  }
});
```

---

## Go-Live Checklist

### Pre-Launch

- [ ] All branding configured and approved
- [ ] Custom domain verified and SSL active
- [ ] Test users created and flows validated
- [ ] Webhooks configured and tested
- [ ] Error handling implemented
- [ ] Monitoring and alerting set up
- [ ] Internal documentation complete
- [ ] Support team trained

### Launch Day

- [ ] Switch from test to live API keys
- [ ] Deploy production configuration
- [ ] Verify custom domain resolution
- [ ] Test live user creation
- [ ] Monitor error rates and latency
- [ ] Announce launch to users

### Post-Launch

- [ ] Monitor usage metrics
- [ ] Collect user feedback
- [ ] Review error logs
- [ ] Schedule weekly sync with $ave+ team
- [ ] Plan feature expansion

---

## Common Issues & Solutions

### Issue 1: Custom Domain Not Resolving

**Symptom:** Users see "Site cannot be reached"

**Solution:**
```bash
# Verify DNS propagation
dig banking.acmebank.com CNAME

# Should return:
# banking.acmebank.com. 3600 IN CNAME embed.saveplus.app.

# If not, check:
# 1. CNAME record is correct
# 2. TTL has expired
# 3. No conflicting A records
```

### Issue 2: SSL Certificate Error

**Symptom:** "Your connection is not private" warning

**Solution:**
- Verify certificate includes all domain names (including www)
- Check certificate is not expired
- Ensure private key matches certificate
- Consider using Let's Encrypt for automatic renewal

### Issue 3: API 401 Unauthorized

**Symptom:** All API calls return 401

**Solution:**
```javascript
// Check key format
const key = process.env.SAVEPLUS_API_KEY;
console.log('Key prefix:', key.substring(0, 8)); // Should be "sk_live_" or "sk_test_"

// Verify key is active
const keyInfo = await client.apiKeys.get(key);
console.log('Key status:', keyInfo.status); // Should be "active"
```

### Issue 4: Webhook Not Firing

**Symptom:** No webhook events received

**Solution:**
```bash
# Test webhook endpoint
curl -X POST https://yourapp.com/webhooks/saveplus \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Verify webhook is active
curl https://api.saveplus.app/v1/webhooks/hook_abc123 \
  -H "Authorization: Bearer sk_live_..."

# Check webhook logs in dashboard
```

---

## Support & Resources

### Technical Support

- **Email:** integrations@saveplus.app
- **Discord:** #white-label-partners
- **Office Hours:** Tuesdays & Thursdays, 2-4pm ET
- **Emergency:** +1 (555) 123-4567

### Documentation

- API Reference: https://docs.saveplus.app/api
- Integration Guide: https://docs.saveplus.app/integration
- Security Guide: https://docs.saveplus.app/security
- Status Page: https://status.saveplus.app

### Partner Portal

- Dashboard: https://app.saveplus.app/whitelabel
- Analytics: https://app.saveplus.app/whitelabel/analytics
- API Keys: https://app.saveplus.app/whitelabel/api-keys
- Billing: https://app.saveplus.app/whitelabel/billing

---

## Success Stories

### ACME Bank
*"We launched our digital banking platform in under 3 weeks using $ave+'s white-label solution. Our customers love the AI-powered insights."*

**Key Metrics:**
- 15,000 active users in first 6 months
- 87% user satisfaction score
- 45% increase in savings deposits

### FinTech Startup
*"$ave+ let us focus on our core product while providing enterprise-grade financial management infrastructure."*

**Key Metrics:**
- $2M saved in development costs
- 6 months faster time to market
- 99.9% uptime

---

## Next Steps

1. **Complete onboarding checklist** (this guide)
2. **Join partner Discord** for community support
3. **Schedule kickoff call** with your integration engineer
4. **Build and test** your integration
5. **Launch!** 🚀

Questions? Contact integrations@saveplus.app
