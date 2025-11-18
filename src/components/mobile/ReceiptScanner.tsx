import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReceiptScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete?: (data: { amount: number; merchant: string; date: string }) => void;
}

/**
 * Receipt scanner using device camera or file upload
 * Extracts transaction data from receipt images using AI
 */
export const ReceiptScanner = ({ open, onOpenChange, onScanComplete }: ReceiptScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Could not access camera. Please use file upload instead.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            processImage(blob);
          }
        }, "image/jpeg");
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = async (imageBlob: Blob) => {
    setIsScanning(true);
    const url = URL.createObjectURL(imageBlob);
    setPreviewUrl(url);
    stopCamera();

    try {
      // Upload image to Supabase Storage
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileName = `receipt-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(`${session.user.id}/${fileName}`, imageBlob);

      if (uploadError) throw uploadError;

      // Call edge function to analyze receipt using AI
      const { data: analysis, error: analysisError } = await supabase.functions.invoke(
        "analyze-receipt",
        {
          body: { imagePath: uploadData.path },
        }
      );

      if (analysisError) throw analysisError;

      toast.success("Receipt scanned successfully!");
      onScanComplete?.(analysis);
      onOpenChange(false);
    } catch (error) {
      console.error("Receipt scanning error:", error);
      toast.error("Failed to scan receipt. Please try again.");
    } finally {
      setIsScanning(false);
      setPreviewUrl(null);
    }
  };

  const handleClose = () => {
    stopCamera();
    setPreviewUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Receipt</DialogTitle>
          <DialogDescription>
            Take a photo or upload an image of your receipt to automatically add the transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Analyzing receipt...</p>
                  </div>
                </div>
              )}
            </div>
          ) : stream ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover rounded-lg bg-muted"
              />
              <Button
                onClick={capturePhoto}
                size="lg"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full w-16 h-16"
              >
                <Camera className="w-6 h-6" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                onClick={startCamera}
                variant="outline"
                className="w-full h-24 flex flex-col gap-2"
              >
                <Camera className="w-8 h-8" />
                <span>Use Camera</span>
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-24 flex flex-col gap-2"
              >
                <Upload className="w-8 h-8" />
                <span>Upload Photo</span>
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
