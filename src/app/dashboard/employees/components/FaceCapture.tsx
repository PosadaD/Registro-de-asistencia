// components/employees/FaceCapture.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FaceCaptureProps {
  onFaceDescriptor: (descriptor: number[] | null) => void;
  onFaceImage?: (image: string) => void;
  initialDescriptor?: number[] | null;
}

export function FaceCapture({ onFaceDescriptor, onFaceImage, initialDescriptor }: FaceCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState(!!initialDescriptor);
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');

  // Cargar los modelos de face-api.js al montar el componente
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Los modelos deben estar en public/models/
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
        console.log('✅ Modelos de face-api.js cargados');
      } catch (error) {
        console.error('Error cargando modelos:', error);
        toast.error('Error al cargar los modelos de reconocimiento facial');
      }
    };
    loadModels();
  }, []);

  // Detectar rostro en tiempo real
  const detectFace = async () => {
    if (!webcamRef.current || !modelsLoaded) return;

    const video = webcamRef.current.video;
    if (!video) return;

    const detection = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection;
  };

  // Capturar el descriptor facial
  const handleCapture = async () => {
    if (!modelsLoaded) {
      toast.error('Modelos no cargados aún, espera un momento');
      return;
    }

    setCapturing(true);
    setDetectionStatus('detecting');

    try {
      const detection = await detectFace();
      
      if (detection && detection.descriptor) {
        // Convertir Float32Array a array normal para almacenar en MongoDB
        const descriptor = Array.from(detection.descriptor);
        
        // Capturar imagen en base64 (opcional)
        const imageSrc = webcamRef.current?.getScreenshot();
        
        onFaceDescriptor(descriptor);
        if (imageSrc && onFaceImage) onFaceImage(imageSrc);
        
        setCaptured(true);
        setDetectionStatus('success');
        toast.success('Rostro capturado correctamente');
      } else {
        setDetectionStatus('error');
        toast.error('No se detectó ningún rostro. Asegúrate de estar bien iluminado');
      }
    } catch (error) {
      console.error('Error capturando rostro:', error);
      setDetectionStatus('error');
      toast.error('Error al procesar el rostro');
    } finally {
      setCapturing(false);
    }
  };

  const resetCapture = () => {
    setCaptured(false);
    setDetectionStatus('idle');
    onFaceDescriptor(null);
  };

  if (!modelsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
        <p className="text-sm text-gray-500">Cargando modelos de reconocimiento facial...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden bg-gray-100">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 400,
            height: 300,
            facingMode: 'user',
          }}
          className="w-full rounded-lg"
        />
        
        {/* Overlay con estado de detección */}
        {detectionStatus === 'detecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span className="text-sm">Detectando rostro...</span>
            </div>
          </div>
        )}
        
        {detectionStatus === 'success' && (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
            <CheckCircle className="h-5 w-5" />
          </div>
        )}
        
        {detectionStatus === 'error' && (
          <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
            <AlertCircle className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2">
        {!captured ? (
          <Button
            type="button"
            onClick={handleCapture}
            disabled={capturing}
            className="w-full"
          >
            {capturing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Capturando...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Capturar Rostro
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={resetCapture}
            className="w-full"
          >
            Volver a Capturar
          </Button>
        )}
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        Asegúrate de tener buena iluminación y mira directamente a la cámara
      </p>
    </div>
  );
}