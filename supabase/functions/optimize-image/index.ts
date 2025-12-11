import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLOUD_NAME = Deno.env.get("VITE_CLOUDINARY_CLOUD_NAME") || "dwpidx6nf";
const API_KEY = Deno.env.get("VITE_CLOUDINARY_API_KEY") || "483673316196499";
const API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET");

interface UploadRequest {
  image: string; // Base64 encoded image or URL
  folder?: string;
  publicId?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!API_SECRET) {
      console.error("CLOUDINARY_API_SECRET is not configured");
      return new Response(
        JSON.stringify({ error: "Cloudinary not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: UploadRequest = await req.json();
    const { image, folder = "save-plus", publicId, transformation } = body;

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate signature for secure upload
    const timestamp = Math.round(Date.now() / 1000);
    
    // Build transformation string
    let transformationStr = "";
    if (transformation) {
      const parts: string[] = [];
      if (transformation.width) parts.push(`w_${transformation.width}`);
      if (transformation.height) parts.push(`h_${transformation.height}`);
      if (transformation.crop) parts.push(`c_${transformation.crop}`);
      if (transformation.quality) parts.push(`q_${transformation.quality}`);
      if (transformation.format) parts.push(`f_${transformation.format}`);
      transformationStr = parts.join(",");
    }

    // Create signature string
    const signatureParams = [
      folder ? `folder=${folder}` : null,
      publicId ? `public_id=${publicId}` : null,
      `timestamp=${timestamp}`,
      transformationStr ? `transformation=${transformationStr}` : null,
    ]
      .filter(Boolean)
      .sort()
      .join("&");

    // Generate SHA-1 signature
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureParams + API_SECRET);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", image);
    formData.append("api_key", API_KEY);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    if (folder) formData.append("folder", folder);
    if (publicId) formData.append("public_id", publicId);
    if (transformationStr) formData.append("transformation", transformationStr);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Cloudinary upload failed:", errorText);
      return new Response(
        JSON.stringify({ error: "Upload failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await uploadResponse.json();

    console.log("Image uploaded successfully:", result.public_id);

    return new Response(
      JSON.stringify({
        success: true,
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("optimize-image error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
