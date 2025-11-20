export const UI_TOOLS = [
  {
    type: "function",
    function: {
      name: "render_spending_chart",
      description: "Display an interactive spending chart showing user's expenses over time. Use when user asks about spending patterns, trends, or wants to visualize expenses.",
      parameters: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", description: "ISO date string" },
                amount: { type: "number", description: "Amount in dollars" },
                category: { type: "string", description: "Optional category name" }
              },
              required: ["date", "amount"]
            },
            description: "Array of spending data points"
          },
          color: { type: "string", description: "Optional color for chart (CSS color value)" },
          title: { type: "string", description: "Chart title" }
        },
        required: ["data"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_budget_alert",
      description: "Show a budget warning card when user is approaching or exceeding a budget limit. Use when detecting overspending or when user asks about budget status.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Budget category name (e.g., 'Groceries', 'Dining')" },
          limit: { type: "number", description: "Budget limit in dollars" },
          current: { type: "number", description: "Current spending in dollars" },
          warningMessage: { type: "string", description: "Friendly warning message to display" }
        },
        required: ["category", "limit", "current", "warningMessage"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_subscription_list",
      description: "Display a list of active subscriptions with cancel options. Use when user asks about subscriptions, recurring charges, or wants to manage subscriptions.",
      parameters: {
        type: "object",
        properties: {
          subscriptions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                amount: { type: "number" },
                frequency: { type: "string", enum: ["monthly", "yearly"] },
                nextBilling: { type: "string", description: "ISO date string" },
                category: { type: "string" }
              },
              required: ["id", "name", "amount", "frequency", "nextBilling"]
            }
          }
        },
        required: ["subscriptions"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_action_card",
      description: "Display an interactive card with a primary action button. Use for suggesting actions like transfers, payments, goal creation, etc.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Action card title" },
          description: { type: "string", description: "Explanation of the action" },
          actionLabel: { type: "string", description: "Button text (e.g., 'Transfer $50', 'Freeze Card')" },
          actionType: { 
            type: "string", 
            enum: ["transfer", "freeze_card", "pay_bill", "create_goal", "custom"],
            description: "Type of action to perform"
          },
          actionData: { 
            type: "object", 
            description: "Data needed to execute the action",
            additionalProperties: true
          },
          variant: { 
            type: "string", 
            enum: ["default", "destructive", "success"],
            description: "Visual style of the card"
          }
        },
        required: ["title", "description", "actionLabel", "actionType"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_interactive_goal_builder",
      description: "Show an interactive goal creation wizard with sliders and date picker. Use when user wants to create a new savings goal or explore goal scenarios.",
      parameters: {
        type: "object",
        properties: {
          suggestedAmount: { type: "number", description: "Suggested target amount in dollars" },
          suggestedDate: { type: "string", description: "Suggested target date (ISO string)" },
          goalType: { type: "string", description: "Type of goal (e.g., 'emergency fund', 'vacation')" }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_cash_flow_sankey",
      description: "Display a Sankey diagram showing money flow from income to expenses and savings. Use when user asks about cash flow, where money goes, or wants to visualize their financial flow.",
      parameters: {
        type: "object",
        properties: {
          income: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                amount: { type: "number" }
              },
              required: ["name", "amount"]
            },
            description: "Income sources"
          },
          expenses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                amount: { type: "number" }
              },
              required: ["name", "amount"]
            },
            description: "Expense categories"
          },
          savings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                amount: { type: "number" }
              },
              required: ["name", "amount"]
            },
            description: "Savings allocations"
          },
          title: { type: "string", description: "Chart title" }
        },
        required: ["income", "expenses", "savings"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_net_worth_timeline",
      description: "Show historical net worth progression and future projections. Use when user asks about net worth growth, wealth building progress, or wants to see financial trajectory.",
      parameters: {
        type: "object",
        properties: {
          historicalData: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                actual: { type: "number" },
                milestone: { type: "string" }
              },
              required: ["date"]
            },
            description: "Historical net worth data points"
          },
          projectedData: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                projected: { type: "number" },
                milestone: { type: "string" }
              },
              required: ["date"]
            },
            description: "Projected future net worth"
          },
          title: { type: "string", description: "Chart title" },
          currentNetWorth: { type: "number", description: "Current net worth value" }
        },
        required: ["historicalData", "projectedData"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_financial_health_score",
      description: "Display a gamified financial health score with category breakdown. Use when user asks about financial health, overall wellness, or wants to see improvement areas.",
      parameters: {
        type: "object",
        properties: {
          overallScore: { type: "number", description: "Overall score out of 100" },
          categories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                score: { type: "number" },
                maxScore: { type: "number" },
                status: { type: "string", enum: ["excellent", "good", "fair", "poor"] },
                suggestion: { type: "string" }
              },
              required: ["name", "score", "maxScore", "status"]
            },
            description: "Score breakdown by category"
          }
        },
        required: ["overallScore", "categories"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_ai_insights_carousel",
      description: "Show swipeable carousel of AI-generated financial insights. Use when presenting multiple insights, tips, or recommendations to the user.",
      parameters: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string", enum: ["opportunity", "warning", "tip", "achievement"] },
                title: { type: "string" },
                description: { type: "string" },
                impact: { type: "string", enum: ["high", "medium", "low"] },
                category: { type: "string" },
                action: {
                  type: "object",
                  properties: {
                    label: { type: "string" }
                  }
                }
              },
              required: ["id", "type", "title", "description"]
            }
          },
          title: { type: "string", description: "Carousel title" }
        },
        required: ["insights"],
        additionalProperties: false
      }
    }
  }
];
