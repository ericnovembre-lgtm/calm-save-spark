# Phase 3: Natural Language Search 🔍

## Overview
Implemented AI-powered natural language search that allows users to search transactions using everyday language like "coffee last week" or "spent over $50 at Amazon."

## Components Created

### 1. Edge Function: `parse-search-query`
**Location:** `supabase/functions/parse-search-query/index.ts`

**Purpose:** Processes natural language queries into structured transaction filters using Lovable AI.

**Features:**
- Uses `google/gemini-3-pro` model for fast parsing
- Provides user context (recent categories & merchants) for better accuracy
- Extracts structured filters: searchQuery, category, merchant, amount ranges, date ranges
- Stores search queries in history for quick access

**Tool Definition:**
```typescript
{
  searchQuery: string,      // Text search
  category: string,         // Category filter
  merchant: string,         // Merchant name/pattern
  amountMin: number,        // Min amount
  amountMax: number,        // Max amount
  dateRange: {              // Date range
    start: string,          // YYYY-MM-DD
    end: string             // YYYY-MM-DD
  }
}
```

### 2. Hook: `useSmartSearch`
**Location:** `src/hooks/useSmartSearch.ts`

**Purpose:** Manages search functionality and state.

**Features:**
- `executeSearch(query)`: Parses and executes natural language search
- `searchHistory`: Recent 10 searches with parsed filters
- `suggestions`: Smart suggestions based on transaction patterns
- `clearHistory()`: Clears search history
- Handles loading and error states

### 3. Component: `SmartSearchBar`
**Location:** `src/components/search/SmartSearchBar.tsx`

**Purpose:** Advanced search input with AI-powered suggestions.

**Features:**
- Natural language input with AI parsing
- Live suggestions dropdown
- Recent search history with quick access
- Smart suggestions based on user patterns
- Visual loading state with sparkle animation
- Keyboard navigation (Enter to search, Escape to close)

**UI Elements:**
- Search icon on left
- Clear button when text is entered
- AI sparkle button to trigger search
- Dropdown with:
  - Recent searches (with clear all option)
  - Smart suggestions

### 4. Component: `ActiveFiltersDisplay`
**Location:** `src/components/transactions/ActiveFiltersDisplay.tsx`

**Purpose:** Shows active search filters with ability to remove them.

**Features:**
- Displays all active filters as removable badges
- Individual filter removal
- "Clear all" button
- Smooth animations for filter add/remove
- Properly formatted filter labels

### 5. Database: `transaction_search_history`
**Table Schema:**
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- query: TEXT (original search query)
- parsed_filters: JSONB (structured filters)
- searched_at: TIMESTAMPTZ (timestamp)
```

**RLS Policies:**
- Users can view their own history
- Users can insert their own searches
- Users can delete their own history

## Integration

### Updated `Transactions` Page
**Location:** `src/pages/Transactions.tsx`

**Changes:**
- Added `SmartSearchBar` component
- Added `ActiveFiltersDisplay` component
- Pass filters to `VirtualizedTransactionList`
- State management for filters with add/remove capabilities

## User Flow

1. **Search Entry:**
   - User types natural language query (e.g., "coffee last week")
   - Clicks sparkle button or presses Enter

2. **AI Processing:**
   - Query sent to `parse-search-query` edge function
   - AI interprets query and extracts structured filters
   - Filters returned to frontend

3. **Filter Application:**
   - Active filters displayed as badges
   - Transaction list updates with filtered results
   - Search added to history

4. **Quick Access:**
   - Recent searches shown in dropdown
   - Smart suggestions based on patterns
   - One-click filter reapplication

## Example Queries

The system can understand:
- `"coffee this month"` → category + date range
- `"spent over $50 at Amazon"` → merchant + amount filter
- `"groceries last week"` → category + date range
- `"uber rides in january"` → merchant/category + date range
- `"transactions under $20"` → amount filter
- `"starbucks purchases"` → merchant filter

## Configuration

**Added to `supabase/config.toml`:**
```toml
[functions.parse-search-query]
verify_jwt = true
```

## Performance Considerations

- Search history limited to 10 recent queries
- Suggestions generated from last 200 transactions
- AI model: `google/gemini-3-pro` for fast responses
- Proper query key management for React Query caching

## Next Steps

Ready for **Phase 4: Smart Insights Dashboard** 📊
