export const UI_TOOLS = [
  {
    type: "function",
    function: {
      name: "render_spending_chart",
      description: "Display a visual chart of spending patterns over time",
      parameters: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                amount: { type: "number" },
                month: { type: "string" }
              }
            }
          },
          timeRange: { type: "string", enum: ["week", "month", "year"] }
        },
        required: ["data"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_budget_alert",
      description: "Show a budget warning or alert when spending is high",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string" },
          spent: { type: "number" },
          limit: { type: "number" },
          severity: { type: "string", enum: ["warning", "danger", "info"] }
        },
        required: ["category", "spent", "limit"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_subscription_list",
      description: "Display active subscriptions with costs",
      parameters: {
        type: "object",
        properties: {
          subscriptions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                amount: { type: "number" },
                frequency: { type: "string" },
                nextBillDate: { type: "string" }
              }
            }
          }
        },
        required: ["subscriptions"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_action_card",
      description: "Suggest an actionable step the user can take",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          actionType: { type: "string", enum: ["transfer", "create_goal", "adjust_budget", "review"] },
          actionData: { type: "object" }
        },
        required: ["title", "description", "actionType"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_interactive_goal_builder",
      description: "Interactive wizard to create a financial goal with sliders and date pickers",
      parameters: {
        type: "object",
        properties: {
          suggestedGoals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                targetAmount: { type: "number" },
                timeframe: { type: "string" }
              }
            }
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_cash_flow_sankey",
      description: "Sankey diagram showing money flow between income, expenses, and savings",
      parameters: {
        type: "object",
        properties: {
          income: {
            type: "array",
            items: {
              type: "object",
              properties: {
                source: { type: "string" },
                amount: { type: "number" }
              }
            }
          },
          expenses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                amount: { type: "number" }
              }
            }
          },
          savings: { type: "number" }
        },
        required: ["income", "expenses", "savings"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_net_worth_timeline",
      description: "Animated timeline showing historical and projected net worth",
      parameters: {
        type: "object",
        properties: {
          historical: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                assets: { type: "number" },
                liabilities: { type: "number" }
              }
            }
          },
          projected: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                netWorth: { type: "number" }
              }
            }
          }
        },
        required: ["historical"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_financial_health_score",
      description: "Gamified financial health score with category breakdown",
      parameters: {
        type: "object",
        properties: {
          totalScore: { type: "number" },
          categories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                score: { type: "number" },
                maxScore: { type: "number" },
                tips: { type: "array", items: { type: "string" } }
              }
            }
          }
        },
        required: ["totalScore", "categories"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_ai_insights_carousel",
      description: "Swipeable cards showing personalized AI insights",
      parameters: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                impact: { type: "string", enum: ["low", "medium", "high"] },
                actionable: { type: "boolean" }
              }
            }
          }
        },
        required: ["insights"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_predictive_forecast",
      description: "ML-powered spending forecast with confidence intervals",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string" },
          historicalData: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string" },
                actual: { type: "number" }
              }
            }
          },
          predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string" },
                predicted: { type: "number" },
                confidence: {
                  type: "object",
                  properties: {
                    lower: { type: "number" },
                    upper: { type: "number" }
                  }
                }
              }
            }
          },
          insights: {
            type: "object",
            properties: {
              trend: { type: "string", enum: ["increasing", "decreasing", "stable"] },
              volatility: { type: "string", enum: ["low", "medium", "high"] },
              anomalies: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } }
            }
          }
        },
        required: ["category", "historicalData", "predictions", "insights"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_emotion_aware_response",
      description: "Display response with emotional intelligence and support resources",
      parameters: {
        type: "object",
        properties: {
          detectedEmotion: {
            type: "string",
            enum: ["stressed", "anxious", "excited", "frustrated", "neutral", "hopeful"]
          },
          confidence: { type: "number" },
          response: { type: "string" },
          supportResources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                url: { type: "string" }
              }
            }
          }
        },
        required: ["detectedEmotion", "confidence", "response"]
      }
    }
  }
];
