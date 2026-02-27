'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ScanPage() {
  const [scannedData, setScannedData] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStartScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        startQRCodeDetection(stream);
      }
    } catch (error) {
      toast.error('Failed to access camera');
      console.error('[v0] Error:', error);
    }
  };

  const startQRCodeDetection = (stream: MediaStream) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    const detectInterval = setInterval(async () => {
      if (canvas && ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // For now, we'll just show a message
        // In production, you would integrate a QR code library like jsQR
      }
    }, 100);

    return () => clearInterval(detectInterval);
  };

  const handleStopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsScanning(false);
      setScannedData('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <QrCode className="w-8 h-8 text-green-600" />
          Scan Bin QR Code
        </h1>
        <p className="text-gray-600 mt-2">Scan the QR code on a waste bin to log disposal</p>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>Point your camera at the bin QR code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isScanning ? (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Click the button below to start scanning
              </p>
              <Button
                onClick={handleStartScanning}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Start Camera
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-4">
                <Button
                  onClick={handleStopScanning}
                  variant="destructive"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Stop Scanning
                </Button>
              </div>
            </div>
          )}

          {scannedData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-700">QR Code Detected</p>
              </div>
              <p className="text-sm text-gray-600 break-all">{scannedData}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Full QR code scanning requires integration with a QR code detection library.
            For production, use a library like <code>jsQR</code> or <code>zxing-js</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
