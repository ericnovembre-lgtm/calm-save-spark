/**
 * Stream Enhancement Utility
 * Injects model metadata into streams for frontend display
 */

interface ModelMetadata {
  model: string;
  modelName: string;
  queryType: string;
  traceId?: string;
  traceUrl?: string;
}

/**
 * Wraps a stream to inject model metadata as the first event
 * Frontend can parse this to show the model indicator
 */
export function injectModelMetadata(
  stream: ReadableStream,
  metadata: ModelMetadata
): ReadableStream {
  const encoder = new TextEncoder();
  let metadataInjected = false;
  
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      // Inject metadata before first content chunk
      if (!metadataInjected) {
        const metaEvent = `data: ${JSON.stringify({
          type: 'model_indicator',
          model: metadata.model,
          modelName: metadata.modelName,
          queryType: metadata.queryType,
          traceId: metadata.traceId,
          traceUrl: metadata.traceUrl
        })}\n\n`;
        controller.enqueue(encoder.encode(metaEvent));
        metadataInjected = true;
      }
      controller.enqueue(chunk);
    }
  });
  
  return stream.pipeThrough(transformStream);
}

/**
 * Inject trace ID into an existing stream
 */
export function injectTraceId(
  stream: ReadableStream,
  traceId: string,
  projectName: string = 'save-plus-ai'
): ReadableStream {
  const encoder = new TextEncoder();
  let traceInjected = false;
  const traceUrl = `https://smith.langchain.com/o/default/projects/p/${projectName}?run_ids=${traceId}`;
  
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      // Inject trace info before first content chunk
      if (!traceInjected) {
        const traceEvent = `data: ${JSON.stringify({
          type: 'trace_info',
          traceId,
          traceUrl
        })}\n\n`;
        controller.enqueue(encoder.encode(traceEvent));
        traceInjected = true;
      }
      controller.enqueue(chunk);
    }
  });
  
  return stream.pipeThrough(transformStream);
}
