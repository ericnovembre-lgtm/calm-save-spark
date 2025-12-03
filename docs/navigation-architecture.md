# $ave+ Navigation Architecture

## Hub-and-Spoke Model

### Primary Navigation (6 items)
1. **Dashboard** - Central overview
2. **Manage Money Hub** - Budget, transactions, debts, automations
3. **Grow Wealth Hub** - Goals, investments, credit, card
4. **AI & Insights Hub** - Coach, agents, digital twin, analytics
5. **Lifestyle Hub** - Family, student, business, learning
6. **Premium Hub** - Advanced features and solutions

### Quick Access
- Goals, Budget, AI Coach, Accounts (always accessible)

### Mobile Navigation
Bottom nav mirrors desktop priorities: Home, Money, Wealth, AI, More

### Features

#### Command Palette (Cmd/Ctrl + K)
- Search all pages
- Quick actions
- Keyboard shortcuts

#### Breadcrumbs
- Automatic on nested routes (2+ levels)
- Shows navigation hierarchy

#### FAB Menu
- Quick actions: New Goal, Add Transaction, Quick Transfer, Ask Coach
- Positioned bottom-right (above bottom nav on mobile)

## Route Structure

All routes organized by hub:
- `/hubs/manage-money` → `/budget`, `/transactions`, etc.
- `/hubs/grow-wealth` → `/goals`, `/investments`, etc.
- `/hubs/ai-insights` → `/coach`, `/ai-agents`, etc.
- `/hubs/lifestyle` → `/family`, `/student`, etc.
- `/hubs/premium` → `/alternatives-portal`, `/investment-manager`, etc.

## Benefits
- 85% reduction in primary nav items (from 41 to 6)
- <3 clicks to any feature
- Consistent mobile/desktop experience
- ~68 pages accessible and discoverable

## Page Consolidation (Complete)

### Completed Merges
- `/security` → `/guardian` (merged into Guardian Security Center)
- `/agent-hub` → `/ai-agents` (merged as Delegations tab)
- `/insights` → `/analytics` (merged as Cash Flow, Behavioral, What-If tabs)
- `/digital-twin/analytics` → `/digital-twin` (merged as Analytics panel)
- `/life-planner` → `/digital-twin` (merged as Life Planner panel)
- `/hubs/memory` → `/digital-twin` (uses Memory Explorer panel)
- `/investment-manager` → `/investments` (merged as Tax Optimization, Rebalancing tabs)
- `/business` → `/business-os` (merged as Expenses, Vendors, Invoices tabs)

### Redirects Active
- `/security` → `/guardian`
- `/agent-hub` → `/ai-agents`
- `/insights` → `/analytics?tab=cashflow`
- `/digital-twin/analytics` → `/digital-twin?tab=analytics`
- `/life-planner` → `/digital-twin?tab=playbooks`
- `/hubs/memory` → `/digital-twin?panel=memory`
- `/investment-manager` → `/investments?tab=tax-optimization`
- `/business` → `/business-os`

### Deleted Pages (14 total)
- `BehavioralGuardian.tsx`, `Security.tsx`, `AgentHub.tsx`, `Insights.tsx`
- `DigitalTwinAnalytics.tsx`, `LifePlanner.tsx`, `MemoryHub.tsx`
- `InvestmentManager.tsx`, `Business.tsx`

### Page Count: 76 → 62 pages
