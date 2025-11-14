# Chart Migration Examples

## Quick Reference: Migrating to Lazy Charts

### Line Charts

**Before:**
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" />
  </LineChart>
</ResponsiveContainer>
```

**After:**
```tsx
import { LazyLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "@/components/charts/LazyLineChart";

<LazyLineChart data={chartData} height={300}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" />
</LazyLineChart>
```

**Changes:**
- ❌ Remove `ResponsiveContainer` (built-in)
- ✅ Import from `@/components/charts/LazyLineChart`
- ✅ Pass `height` directly to `LazyLineChart`
- ✅ Everything else stays the same!

---

### Bar Charts

**Before:**
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="category" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="amount" fill="hsl(var(--primary))">
      {chartData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={getBarColor(index)} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

**After:**
```tsx
import { LazyBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "@/components/charts/LazyBarChart";

<LazyBarChart data={chartData} height={300}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="category" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="amount" fill="hsl(var(--primary))">
    {chartData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={getBarColor(index)} />
    ))}
  </Bar>
</LazyBarChart>
```

---

### Pie Charts

**Before:**
```tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={chartData}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={renderCustomLabel}
      outerRadius={80}
      fill="hsl(var(--primary))"
      dataKey="value"
    >
      {chartData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

**After:**
```tsx
import { LazyPieChart, Pie, Cell, Tooltip, Legend } from '@/components/charts/LazyPieChart';

<LazyPieChart height={300}>
  <Pie
    data={chartData}
    cx="50%"
    cy="50%"
    labelLine={false}
    label={renderCustomLabel}
    outerRadius={80}
    fill="hsl(var(--primary))"
    dataKey="value"
  >
    {chartData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  <Tooltip />
  <Legend />
</LazyPieChart>
```

---

### Area Charts

**Before:**
```tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={chartData}>
    <defs>
      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#gradient)" />
  </AreaChart>
</ResponsiveContainer>
```

**After:**
```tsx
import { LazyAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "@/components/charts/LazyAreaChart";

<LazyAreaChart data={chartData} height={300}>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#gradient)" />
</LazyAreaChart>
```

---

## Real-World Example: SpendingChart.tsx

### Before (Direct Recharts Import)
```tsx
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { motion } from "framer-motion";

export function SpendingChart() {
  const chartData = [
    { category: 'Groceries', amount: 450 },
    { category: 'Dining', amount: 320 },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
```

### After (Lazy Chart)
```tsx
import { Card } from "@/components/ui/card";
import { LazyBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "@/components/charts/LazyBarChart";
import { motion } from "framer-motion";

export function SpendingChart() {
  const chartData = [
    { category: 'Groceries', amount: 450 },
    { category: 'Dining', amount: 320 },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Spending by Category</h3>
      <LazyBarChart data={chartData} height={300}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="amount" fill="hsl(var(--primary))" />
      </LazyBarChart>
    </Card>
  );
}
```

**What Changed:**
1. Import changed: `recharts` → `@/components/charts/LazyBarChart`
2. Removed: `ResponsiveContainer` wrapper
3. Changed: `<BarChart>` → `<LazyBarChart>`
4. Added: `height={300}` prop to LazyBarChart
5. Everything else: **Identical!**

---

## Migration Checklist

For each chart component:

- [ ] Replace recharts import with lazy chart import
- [ ] Remove `ResponsiveContainer` wrapper
- [ ] Move `height` prop to lazy chart component
- [ ] Verify all chart props still work
- [ ] Test Suspense fallback (skeleton appears while loading)
- [ ] Confirm bundle size reduced (check `dist/stats.html`)

---

## Benefits

### Before Migration
- ❌ Entire recharts library (~400 KB) loads on app start
- ❌ All chart types loaded even if unused
- ❌ Blocks initial render
- ❌ Increases Time to Interactive

### After Migration  
- ✅ Recharts loads only when chart component renders
- ✅ Only needed chart types are loaded
- ✅ Suspense shows skeleton during load
- ✅ Reduces initial bundle by ~300-350 KB
- ✅ Faster Time to Interactive

---

## Troubleshooting

### Issue: Chart not appearing
**Solution**: Ensure you're passing `data` prop and it's not empty

### Issue: Suspense fallback shows indefinitely
**Solution**: Check network tab for chunk load errors, may need to clear cache

### Issue: TypeScript errors on chart components
**Solution**: The lazy wrappers export all necessary types, reimport from the wrapper

### Issue: Custom chart configuration not working
**Solution**: All recharts props are passed through, check props are valid for the chart type

---

## Performance Impact

Run these tests before/after migration:

```bash
# Build and analyze bundle
npm run build
open dist/stats.html
```

**Expected Results:**
- **Main bundle**: Reduced by ~400 KB
- **Chart chunks**: New 100-150 KB chunks appear
- **Pages without charts**: No chart code loaded
- **Lighthouse TTI**: Improved by 0.5-1.5s

Track with analytics:
```typescript
trackEvent('lazy_chart_loaded', {
  chartType: 'LazyBarChart',
  loadTime: performance.now() - startTime
});
```
