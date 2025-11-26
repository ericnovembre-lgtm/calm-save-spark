/**
 * Utility to convert between OpenAI and Claude tool formats
 * This allows UI tools to work seamlessly with both AI providers
 */

export interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface ClaudeTool {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Convert OpenAI tool format to Claude tool format
 */
export function openAIToolToClaude(openAITool: OpenAITool): ClaudeTool {
  return {
    name: openAITool.function.name,
    description: openAITool.function.description,
    input_schema: {
      type: "object",
      properties: openAITool.function.parameters.properties,
      required: openAITool.function.parameters.required || []
    }
  };
}

/**
 * Convert array of OpenAI tools to Claude format
 */
export function convertOpenAIToolsToClaude(openAITools: OpenAITool[]): ClaudeTool[] {
  return openAITools.map(openAIToolToClaude);
}

/**
 * Parse Claude tool use from response content
 * Claude returns tool calls in content blocks with type "tool_use"
 */
export function parseClaudeToolUse(content: any[]): Array<{ name: string; input: any }> {
  return content
    .filter((block: any) => block.type === 'tool_use')
    .map((block: any) => ({
      name: block.name,
      input: block.input
    }));
}
