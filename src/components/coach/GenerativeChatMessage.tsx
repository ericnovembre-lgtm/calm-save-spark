import { Bot, User, Sparkles, AlertTriangle, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ComponentRenderer } from "@/components/generative-ui";
import { parseAIResponse, detectTone } from "@/utils/parseAIResponse";
import { cn } from "@/lib/utils";

interface GenerativeChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function GenerativeChatMessage({ role, content }: GenerativeChatMessageProps) {
  const isUser = role === "user";

  // Parse AI response for generative UI components
  const parsedResponse = !isUser ? parseAIResponse(content) : null;
  const tone = parsedResponse?.tone || (!isUser ? detectTone(content) : 'neutral');

  // Try to parse JSON blocks from AI response (legacy format)
  const parseContent = (text: string) => {
    const parts: Array<{ type: "text" | "chart"; data: any }> = [];
    const jsonPattern = /```json\s*(\{[\s\S]*?\})\s*```/g;
    
    let lastIndex = 0;
    let match;

    while ((match = jsonPattern.exec(text)) !== null) {
      // Add text before JSON
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          data: text.substring(lastIndex, match.index),
        });
      }

      // Try to parse JSON
      try {
        const jsonData = JSON.parse(match[1]);
        if (jsonData.chart && jsonData.data) {
          parts.push({
            type: "chart",
            data: jsonData,
          });
        }
      } catch (e) {
        // If parsing fails, treat as text
        parts.push({
          type: "text",
          data: match[0],
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        data: text.substring(lastIndex),
      });
    }

    // If no JSON found, return the whole text
    if (parts.length === 0) {
      parts.push({ type: "text", data: text });
    }

    return parts;
  };

  // Tone-based styling
  const toneStyles = {
    cautionary: {
      border: "border-amber-500/30",
      glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]",
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      bg: "bg-amber-500/5"
    },
    celebratory: {
      border: "border-green-500/30",
      glow: "shadow-[0_0_20px_rgba(34,197,94,0.2)]",
      icon: <Sparkles className="w-4 h-4 text-green-400" />,
      bg: "bg-green-500/5"
    },
    neutral: {
      border: "border-white/10",
      glow: "",
      icon: null,
      bg: "bg-stone-900/50"
    }
  };

  const currentToneStyle = toneStyles[tone];

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? "bg-white/10" : "bg-gradient-to-br from-amber-500 to-yellow-600"
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      
      <div className={`flex-1 space-y-3 ${isUser ? "items-end" : "items-start"}`}>
        {/* Render generative UI components if present */}
        {parsedResponse?.uiComponents && parsedResponse.uiComponents.length > 0 ? (
          <div className={cn(
            "rounded-lg p-4 border space-y-4",
            currentToneStyle.border,
            currentToneStyle.glow,
            currentToneStyle.bg
          )}>
            {/* Tone indicator */}
            {currentToneStyle.icon && (
              <div className="flex items-center gap-2 mb-2">
                {currentToneStyle.icon}
                <span className="text-xs font-mono uppercase tracking-wider text-white/60">
                  {tone} analysis
                </span>
              </div>
            )}

            {/* Insight summary if present */}
            {parsedResponse.insight && (
              <div className="bg-stone-900/50 rounded-lg p-3 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-white">{parsedResponse.insight}</p>
                </div>
              </div>
            )}

            {/* Render UI components */}
            {parsedResponse.uiComponents.map((component, index) => (
              <ComponentRenderer
                key={index}
                componentData={component}
                onAction={async (actionType, data) => {
                  console.log('Component action:', actionType, data);
                }}
              />
            ))}

            {/* Recommended actions if present */}
            {parsedResponse.recommendedActions && parsedResponse.recommendedActions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                  Recommended Actions
                </h4>
                <div className="grid gap-2">
                  {parsedResponse.recommendedActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-900/50 rounded-lg p-3 border border-white/10 hover:border-amber-500/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{action.title}</span>
                        <span className="text-xs text-green-400 font-mono">{action.impact}</span>
                      </div>
                      <span className="text-xs text-white/40 capitalize">{action.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Legacy format: render text and charts
          <>
            {parseContent(parsedResponse?.text || content).map((part, index) => {
              if (part.type === "text") {
                return (
                  <div
                    key={index}
                    className={cn(
                      "rounded-lg p-4 max-w-[85%]",
                      isUser
                        ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 ml-auto"
                        : cn(
                            "border",
                            currentToneStyle.border,
                            currentToneStyle.glow,
                            currentToneStyle.bg
                          )
                    )}
                  >
                    {!isUser && currentToneStyle.icon && (
                      <div className="flex items-center gap-2 mb-2">
                        {currentToneStyle.icon}
                        <span className="text-xs font-mono uppercase tracking-wider text-white/60">
                          {tone}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-white whitespace-pre-wrap">{part.data}</p>
                  </div>
                );
              }

              if (part.type === "chart") {
                return (
                  <div
                    key={index}
                    className="w-full bg-stone-900/50 border border-amber-500/20 rounded-lg p-4"
                  >
                    <MiniChart chartData={part.data} />
                  </div>
                );
              }

              return null;
            })}
          </>
        )}
      </div>
    </div>
  );
}

function MiniChart({ chartData }: { chartData: any }) {
  const { chart, data, title } = chartData;

  const COLORS = ["#d6c8a2", "#f59e0b", "#10b981", "#eab308", "#f43f5e"];

  return (
    <div className="space-y-2">
      {title && <h4 className="text-xs font-mono text-amber-400">{title}</h4>}
      <ResponsiveContainer width="100%" height={180}>
        {chart === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(28, 25, 23, 0.9)",
                border: "1px solid rgba(214, 200, 162, 0.3)",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="value" stroke="#d6c8a2" strokeWidth={2} dot={{ fill: "#d6c8a2" }} />
          </LineChart>
        ) : chart === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(28, 25, 23, 0.9)",
                border: "1px solid rgba(214, 200, 162, 0.3)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" fill="#f59e0b" />
          </BarChart>
        ) : chart === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(28, 25, 23, 0.9)",
                border: "1px solid rgba(214, 200, 162, 0.3)",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        ) : null}
      </ResponsiveContainer>
    </div>
  );
}
