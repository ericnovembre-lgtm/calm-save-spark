import { Bot, User } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GenerativeChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function GenerativeChatMessage({ role, content }: GenerativeChatMessageProps) {
  // Try to parse JSON blocks from AI response
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

  const contentParts = parseContent(content);
  const isUser = role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? "bg-white/10" : "bg-gradient-to-br from-cyan-500 to-violet-500"
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`flex-1 space-y-3 ${isUser ? "items-end" : "items-start"}`}>
        {contentParts.map((part, index) => {
          if (part.type === "text") {
            return (
              <div
                key={index}
                className={`rounded-lg p-4 max-w-[85%] ${
                  isUser
                    ? "bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 ml-auto"
                    : "bg-slate-900/50 border border-white/10"
                }`}
              >
                <p className="text-sm text-white whitespace-pre-wrap">{part.data}</p>
              </div>
            );
          }

          if (part.type === "chart") {
            return (
              <div
                key={index}
                className="w-full bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4"
              >
                <MiniChart chartData={part.data} />
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function MiniChart({ chartData }: { chartData: any }) {
  const { chart, data, title } = chartData;

  const COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e"];

  return (
    <div className="space-y-2">
      {title && <h4 className="text-xs font-mono text-cyan-400">{title}</h4>}
      <ResponsiveContainer width="100%" height={180}>
        {chart === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
          </LineChart>
        ) : chart === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" fill="#8b5cf6" />
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
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        ) : null}
      </ResponsiveContainer>
    </div>
  );
}
