/**
 * Stream Enhancement Utility
 * Injects model metadata into streams for frontend display
 */

interface ModelMetadata {
  model: string;
  modelName: string;
  queryType: string;
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
          queryType: metadata.queryType
        })}\n\n`;
        controller.enqueue(encoder.encode(metaEvent));
        metadataInjected = true;
      }
      controller.enqueue(chunk);
    }
  });
  
  return stream.pipeThrough(transformStream);
}
