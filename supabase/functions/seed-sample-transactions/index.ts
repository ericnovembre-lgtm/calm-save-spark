import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Categories matching the CATEGORY_COLORS in useAnalyticsData
const CATEGORIES = [
  "Groceries",
  "Dining",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Healthcare",
  "Travel",
];

// Realistic merchants per category
const MERCHANTS: Record<string, string[]> = {
  Groceries: ["Whole Foods", "Trader Joe's", "Costco", "Safeway", "Kroger", "Walmart Grocery"],
  Dining: ["Starbucks", "Chipotle", "McDonald's", "Local Restaurant", "Uber Eats", "DoorDash"],
  Transportation: ["Shell Gas", "Uber", "Lyft", "Public Transit", "Parking Garage", "BP Gas"],
  Entertainment: ["Netflix", "Spotify", "AMC Theaters", "Steam", "Apple Music", "Hulu"],
  Utilities: ["Electric Company", "Water Utility", "Internet Provider", "Phone Bill", "Gas Company"],
  Shopping: ["Amazon", "Target", "Best Buy", "Nike", "Apple Store", "Nordstrom"],
  Healthcare: ["CVS Pharmacy", "Doctor Visit", "Dentist", "Gym Membership", "Walgreens"],
  Travel: ["Airbnb", "Delta Airlines", "Marriott Hotel", "Hertz Car Rental", "United Airlines"],
};

// Amount ranges per category (min, max)
const AMOUNT_RANGES: Record<string, [number, number]> = {
  Groceries: [25, 200],
  Dining: [8, 85],
  Transportation: [15, 80],
  Entertainment: [10, 50],
  Utilities: [50, 200],
  Shopping: [20, 300],
  Healthcare: [15, 150],
  Travel: [150, 800],
};

// Category weights (higher = more frequent)
const CATEGORY_WEIGHTS: Record<string, number> = {
  Groceries: 25,
  Dining: 25,
  Transportation: 15,
  Entertainment: 10,
  Utilities: 5,
  Shopping: 10,
  Healthcare: 5,
  Travel: 5,
};

function getRandomCategory(): string {
  const totalWeight = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    random -= weight;
    if (random <= 0) return category;
  }
  return "Groceries";
}

function getRandomMerchant(category: string): string {
  const merchants = MERCHANTS[category];
  return merchants[Math.floor(Math.random() * merchants.length)];
}

function getRandomAmount(category: string): number {
  const [min, max] = AMOUNT_RANGES[category];
  const amount = min + Math.random() * (max - min);
  return Math.round(amount * 100) / 100;
}

function getRandomDate(daysBack: number): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * daysBack);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  // Random hour between 8am and 10pm
  date.setHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), 0, 0);
  return date;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Seeding sample transactions for user: ${user.id}`);

    // Check if user already has transactions
    const { count: existingCount } = await supabaseClient
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (existingCount && existingCount > 50) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "You already have transaction data. Clear existing data first if you want to seed new sample data.",
          existingCount 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transactions = [];
    const daysBack = 90;

    // Generate expense transactions (150-180 transactions)
    const expenseCount = 150 + Math.floor(Math.random() * 30);
    
    for (let i = 0; i < expenseCount; i++) {
      const category = getRandomCategory();
      const merchant = getRandomMerchant(category);
      const amount = -getRandomAmount(category); // Negative for expenses
      const date = getRandomDate(daysBack);

      transactions.push({
        user_id: user.id,
        amount,
        merchant,
        category,
        description: `${merchant} purchase`,
        transaction_date: date.toISOString(),
        status: "completed",
        currency: "USD",
      });
    }

    // Add recurring subscriptions (Netflix, Spotify, etc.) on consistent dates
    const subscriptions = [
      { merchant: "Netflix", category: "Entertainment", amount: -15.99 },
      { merchant: "Spotify", category: "Entertainment", amount: -10.99 },
      { merchant: "Gym Membership", category: "Healthcare", amount: -49.99 },
      { merchant: "Internet Provider", category: "Utilities", amount: -79.99 },
      { merchant: "Phone Bill", category: "Utilities", amount: -85.00 },
    ];

    for (const sub of subscriptions) {
      // Add for each of the last 3 months
      for (let month = 0; month < 3; month++) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        date.setDate(15); // Mid-month billing
        date.setHours(12, 0, 0, 0);

        transactions.push({
          user_id: user.id,
          amount: sub.amount,
          merchant: sub.merchant,
          category: sub.category,
          description: `${sub.merchant} monthly subscription`,
          transaction_date: date.toISOString(),
          status: "completed",
          currency: "USD",
        });
      }
    }

    // Add income transactions (paychecks - 2 per month for 3 months)
    for (let month = 0; month < 3; month++) {
      // First paycheck (1st of month)
      const paycheck1 = new Date();
      paycheck1.setMonth(paycheck1.getMonth() - month);
      paycheck1.setDate(1);
      paycheck1.setHours(9, 0, 0, 0);

      transactions.push({
        user_id: user.id,
        amount: 2450 + Math.floor(Math.random() * 200), // $2450-2650
        merchant: "Employer Direct Deposit",
        category: "Income",
        description: "Payroll deposit",
        transaction_date: paycheck1.toISOString(),
        status: "completed",
        currency: "USD",
      });

      // Second paycheck (15th of month)
      const paycheck2 = new Date();
      paycheck2.setMonth(paycheck2.getMonth() - month);
      paycheck2.setDate(15);
      paycheck2.setHours(9, 0, 0, 0);

      transactions.push({
        user_id: user.id,
        amount: 2450 + Math.floor(Math.random() * 200),
        merchant: "Employer Direct Deposit",
        category: "Income",
        description: "Payroll deposit",
        transaction_date: paycheck2.toISOString(),
        status: "completed",
        currency: "USD",
      });
    }

    // Sort by date descending
    transactions.sort((a, b) => 
      new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    );

    // Insert in batches
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const { error: insertError } = await supabaseClient
        .from("transactions")
        .insert(batch);

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }
      inserted += batch.length;
    }

    console.log(`Successfully seeded ${inserted} transactions`);

    // Calculate some summary stats
    const totalExpenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully seeded ${inserted} sample transactions`,
        summary: {
          totalTransactions: inserted,
          expenseTransactions: transactions.filter(t => t.amount < 0).length,
          incomeTransactions: transactions.filter(t => t.amount > 0).length,
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          totalIncome: Math.round(totalIncome * 100) / 100,
          dateRange: `${daysBack} days`,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error seeding transactions:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
