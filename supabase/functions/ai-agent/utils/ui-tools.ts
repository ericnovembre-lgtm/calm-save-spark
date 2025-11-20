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
  }
];
