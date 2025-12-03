/**
 * OpenAI GPT-5 Client
 * Specialized for document analysis and complex financial reasoning
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface OpenAIOptions {
  model?: string;
  maxTokens?: number;
  stream?: boolean;
  tools?: any[];
  toolChoice?: any;
}

// GPT-5 models - CRITICAL: Use max_completion_tokens NOT max_tokens
export const GPT5_MODEL = 'gpt-5-2025-08-07';
export const GPT5_MINI_MODEL = 'gpt-5-mini-2025-08-07';
export const GPT5_NANO_MODEL = 'gpt-5-nano-2025-08-07';

/**
 * Document analysis system prompt optimized for GPT-5
 */
export const DOCUMENT_ANALYSIS_SYSTEM_PROMPT = `You are an expert financial document analyst with deep expertise in:
- Tax documents (W-2, 1099, K-1, Schedule C, etc.)
- KYC/Identity documents (passports, driver's licenses, utility bills)
- Receipts and invoices
- Bank statements and financial statements
- Insurance documents and claims

Your task is to:
1. Accurately extract ALL relevant information from documents
2. Identify the document type and category
3. Flag any potential issues or discrepancies
4. Provide confidence scores for extracted data
5. Suggest follow-up questions if information is unclear

Always return structured JSON with clear field names.
Never hallucinate information - if something is unclear, mark it as "uncertain" with a lower confidence score.`;

/**
 * Call OpenAI GPT-5 API (non-streaming)
 */
export async function callOpenAI(
  messages: Message[],
  options: OpenAIOptions = {}
): Promise<any> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const {
    model = GPT5_MODEL,
    maxTokens = 4000,
    stream = false,
    tools,
    toolChoice
  } = options;

  // CRITICAL: GPT-5 uses max_completion_tokens, NOT max_tokens
  const requestBody: any = {
    model,
    messages,
    max_completion_tokens: maxTokens,
    stream
  };

  // Note: GPT-5 does NOT support temperature parameter - it defaults to 1.0

  if (tools && tools.length > 0) {
    requestBody.tools = tools;
    if (toolChoice) {
      requestBody.tool_choice = toolChoice;
    }
  }

  console.log('[OpenAI Client] Calling GPT-5:', {
    model,
    messageCount: messages.length,
    hasTools: !!tools,
    maxTokens
  });

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OpenAI Client] API Error:', response.status, errorText);
    
    if (response.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('OpenAI API payment required. Check billing status.');
    }
    
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  console.log('[OpenAI Client] Response received:', {
    model: data.model,
    usage: data.usage,
    hasToolCalls: !!data.choices?.[0]?.message?.tool_calls
  });

  return data;
}

/**
 * Stream OpenAI GPT-5 response
 */
export async function streamOpenAI(
  messages: Message[],
  options: OpenAIOptions = {}
): Promise<ReadableStream> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const {
    model = GPT5_MODEL,
    maxTokens = 4000,
    tools,
    toolChoice
  } = options;

  const requestBody: any = {
    model,
    messages,
    max_completion_tokens: maxTokens,
    stream: true
  };

  if (tools && tools.length > 0) {
    requestBody.tools = tools;
    if (toolChoice) {
      requestBody.tool_choice = toolChoice;
    }
  }

  console.log('[OpenAI Client] Starting stream:', { model, messageCount: messages.length });

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OpenAI Client] Stream Error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return response.body!;
}

/**
 * Analyze a document with GPT-5 Vision
 */
export async function analyzeDocumentWithGPT5(
  base64Image: string,
  mimeType: string,
  documentType: string,
  additionalInstructions?: string
): Promise<{
  success: boolean;
  data: any;
  confidence: number;
  documentType: string;
  rawResponse?: string;
}> {
  const systemPrompt = DOCUMENT_ANALYSIS_SYSTEM_PROMPT + (additionalInstructions ? `\n\n${additionalInstructions}` : '');

  const userPrompt = getExtractionPromptForType(documentType);

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        { type: 'text', text: userPrompt },
        { 
          type: 'image_url', 
          image_url: { url: `data:${mimeType};base64,${base64Image}` } 
        }
      ]
    }
  ];

  // Use structured tool calling for clean JSON extraction
  const tools = [{
    type: 'function',
    function: {
      name: 'extract_document_data',
      description: 'Extract structured data from a financial document',
      parameters: getSchemaForDocumentType(documentType)
    }
  }];

  try {
    const response = await callOpenAI(messages, {
      model: GPT5_MODEL,
      maxTokens: 4000,
      tools,
      toolChoice: { type: 'function', function: { name: 'extract_document_data' } }
    });

    const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall && toolCall.function.arguments) {
      const extractedData = JSON.parse(toolCall.function.arguments);
      
      return {
        success: true,
        data: extractedData,
        confidence: extractedData.confidence || 0.9,
        documentType: extractedData.document_type || documentType
      };
    }

    // Fallback to parsing content directly
    const content = response.choices?.[0]?.message?.content;
    if (content) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: parsedData,
          confidence: parsedData.confidence || 0.7,
          documentType: parsedData.document_type || documentType,
          rawResponse: content
        };
      }
    }

    throw new Error('Could not extract structured data from document');
  } catch (error) {
    console.error('[OpenAI Client] Document analysis failed:', error);
    throw error;
  }
}

/**
 * Get extraction prompt based on document type
 */
function getExtractionPromptForType(documentType: string): string {
  const prompts: Record<string, string> = {
    'tax': `Analyze this tax document and extract:
- Document type (W-2, 1099, K-1, Schedule C, etc.)
- Tax year
- Employer/Payer information (name, EIN, address)
- Employee/Recipient information (name, SSN last 4, address)
- Income amounts (wages, tips, other compensation)
- Tax withholdings (federal, state, local, Social Security, Medicare)
- Any deductions or credits
- Box-by-box breakdown where applicable
Return confidence scores for each field.`,

    'kyc': `Analyze this identity document and extract:
- Document type (passport, driver's license, ID card, utility bill, etc.)
- Full name as shown
- Date of birth
- Document number
- Issue date and expiration date
- Address (if shown)
- Issuing authority/country
- Any security features visible
Flag any potential issues with document authenticity.`,

    'receipt': `Analyze this receipt/invoice and extract:
- Merchant/Store name
- Date of purchase
- Total amount
- Subtotal (before tax)
- Tax amount
- Individual line items with quantities and prices
- Payment method (if shown)
- Category of purchase (Groceries, Dining, Shopping, etc.)
- Any discounts or coupons applied`,

    'financial': `Analyze this financial document and extract:
- Document type (bank statement, investment statement, etc.)
- Account holder name
- Account number (last 4 digits only)
- Statement period
- Beginning and ending balances
- Total deposits/credits
- Total withdrawals/debits
- Key transactions
- Any fees or charges`
  };

  return prompts[documentType] || prompts['financial'];
}

/**
 * Get JSON schema for structured extraction based on document type
 */
function getSchemaForDocumentType(documentType: string): any {
  const baseSchema = {
    type: 'object',
    properties: {
      document_type: { type: 'string', description: 'Specific type of document' },
      confidence: { type: 'number', description: 'Overall confidence score 0-1' },
      extracted_date: { type: 'string', description: 'Date extracted from document' },
      issues: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Any issues or concerns with the document'
      }
    },
    required: ['document_type', 'confidence']
  };

  const schemas: Record<string, any> = {
    'tax': {
      ...baseSchema,
      properties: {
        ...baseSchema.properties,
        tax_year: { type: 'integer' },
        form_type: { type: 'string' },
        employer_name: { type: 'string' },
        employer_ein: { type: 'string' },
        employee_name: { type: 'string' },
        employee_ssn_last4: { type: 'string' },
        wages: { type: 'number' },
        federal_tax_withheld: { type: 'number' },
        state_tax_withheld: { type: 'number' },
        social_security_wages: { type: 'number' },
        social_security_tax: { type: 'number' },
        medicare_wages: { type: 'number' },
        medicare_tax: { type: 'number' },
        deduction_categories: { 
          type: 'array', 
          items: { type: 'string' } 
        },
        amounts: { 
          type: 'object',
          additionalProperties: { type: 'number' }
        }
      },
      required: ['document_type', 'confidence', 'tax_year']
    },

    'kyc': {
      ...baseSchema,
      properties: {
        ...baseSchema.properties,
        full_name: { type: 'string' },
        date_of_birth: { type: 'string' },
        document_number: { type: 'string' },
        issue_date: { type: 'string' },
        expiration_date: { type: 'string' },
        address: { type: 'string' },
        issuing_authority: { type: 'string' },
        nationality: { type: 'string' }
      },
      required: ['document_type', 'confidence', 'full_name']
    },

    'receipt': {
      ...baseSchema,
      properties: {
        ...baseSchema.properties,
        merchant: { type: 'string' },
        purchase_date: { type: 'string' },
        total_amount: { type: 'number' },
        subtotal: { type: 'number' },
        tax_amount: { type: 'number' },
        category: { 
          type: 'string',
          enum: ['Groceries', 'Dining', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              price: { type: 'number' },
              quantity: { type: 'integer' }
            }
          }
        },
        payment_method: { type: 'string' }
      },
      required: ['document_type', 'confidence', 'merchant', 'total_amount']
    }
  };

  return schemas[documentType] || baseSchema;
}
