'use client';

import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Loader2, CheckCircle, AlertCircle, User, Clock, X } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceResponse {
  success?: boolean;
  error?: string;
  employee?: string;
  employeeName?: string;
  type?: 'CHECK_IN' | 'CHECK_OUT';
  time?: string;
  late?: boolean;
  workedHours?: number;
  message?: string;
}

interface PopupMessage {
  type: 'success' | 'error' | 'info';
  title: string;
  description: string;
  details?: string;
}

export default function CheckerPage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [detectedFace, setDetectedFace] = useState(false);
  const [faceDetectionError, setFaceDetectionError] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupMessage | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const detectionTimeoutRef = useRef<NodeJS.Timeout>();
  const popupTimeoutRef = useRef<NodeJS.Timeout>();

  // Cargar modelos de face-api.js
  useEffect(() => {
    const loadModels = async () => {
      try {
        toast.info('Cargando modelos de reconocimiento facial...');
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
        toast.success('Modelos cargados correctamente');
      } catch (error) {
        console.error('Error cargando modelos:', error);
        setPopup({
          type: 'error',
          title: 'Error de inicialización',
          description: 'No se pudieron cargar los modelos faciales.',
          details: 'Verifica que la carpeta /models contenga los archivos necesarios.'
        });
      }
    };
    loadModels();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (detectionTimeoutRef.current) clearTimeout(detectionTimeoutRef.current);
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    };
  }, []);

  // Función para mostrar popup y auto-ocultarlo
  const showPopup = (message: PopupMessage) => {
    setPopup(message);
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    popupTimeoutRef.current = setTimeout(() => {
      setPopup(null);
    }, 4000);
  };

  // Detección de rostro (igual que antes)
  const detectFace = async () => {
    if (!webcamRef.current || !canvasRef.current || !cameraActive) return;
    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
      return;
    }

    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    if (displaySize.width === 0 || displaySize.height === 0) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
      return;
    }
    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (resizedDetections.length > 0) {
        if (!detectedFace) {
          console.log('✅ Rostro detectado');
          setDetectedFace(true);
          setFaceDetectionError(null);
        }
        faceapi.draw.drawDetections(canvas, resizedDetections);
        if (detectionTimeoutRef.current) clearTimeout(detectionTimeoutRef.current);
      } else {
        if (detectedFace) setDetectedFace(false);
        if (!detectionTimeoutRef.current) {
          detectionTimeoutRef.current = setTimeout(() => {
            if (!detectedFace && cameraActive) {
              setFaceDetectionError('No se detecta ningún rostro. Asegúrate de mirar a la cámara');
            }
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error en detección:', error);
    }
    animationFrameRef.current = requestAnimationFrame(detectFace);
  };

  useEffect(() => {
    if (cameraActive && modelsLoaded) {
      setDetectedFace(false);
      setFaceDetectionError(null);
      setTimeout(() => detectFace(), 1000);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [cameraActive, modelsLoaded]);

  const handleRecognize = async () => {
    if (!modelsLoaded) {
      showPopup({
        type: 'error',
        title: 'Modelos no listos',
        description: 'Espera a que los modelos de reconocimiento terminen de cargar.',
      });
      return;
    }
    if (!cameraActive) {
      showPopup({
        type: 'error',
        title: 'Cámara apagada',
        description: 'Activa la cámara antes de intentar registrar.',
      });
      return;
    }
    if (!detectedFace) {
      showPopup({
        type: 'error',
        title: 'Rostro no detectado',
        description: 'Mira directamente a la cámara y asegúrate de tener buena iluminación.',
      });
      return;
    }

    setScanning(true);
    setLoading(true);

    try {
      const video = webcamRef.current?.video;
      if (!video) throw new Error('Cámara no disponible');

      const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
      if (!detection || !detection.descriptor) {
        throw new Error('No se pudo extraer el descriptor facial. Intenta de nuevo.');
      }

      const currentDescriptor = Array.from(detection.descriptor);
      const res = await fetch('/api/attendance/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceDescriptor: currentDescriptor }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Éxito: mostrar popup verde
        showPopup({
          type: 'success',
          title: '✅ Registro exitoso',
          description: data.message || `Hola ${data.employeeName}, tu ${data.type === 'CHECK_IN' ? 'entrada' : 'salida'} ha sido registrada.`,
          details: data.late ? '⚠️ Llegaste tarde. Consulta con tu supervisor.' : undefined,
        });
        // Opcional: reproducir sonido
        // new Audio('/sounds/success.mp3').play();
      } else {
        // Error controlado desde el backend
        showPopup({
          type: 'error',
          title: 'No se pudo registrar',
          description: data.error || 'Error desconocido',
          details: data.details || 'Intenta de nuevo o contacta a soporte.',
        });
      }
    } catch (error) {
      console.error('Error en reconocimiento:', error);
      showPopup({
        type: 'error',
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor.',
        details: 'Verifica tu conexión a internet o contacta al administrador.',
      });
    } finally {
      setScanning(false);
      setLoading(false);
    }
  };

  const toggleCamera = async () => {
    if (!modelsLoaded) {
      showPopup({
        type: 'error',
        title: 'Modelos no cargados',
        description: 'Espera a que terminen de cargar los modelos faciales.',
      });
      return;
    }
    if (cameraActive) {
      setCameraActive(false);
      setDetectedFace(false);
      setFaceDetectionError(null);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    } else {
      setCameraActive(true);
    }
  };

  if (!modelsLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Cargando modelos...</h2>
          <p className="text-gray-500">Preparando el sistema de reconocimiento facial</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Popup centrado */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`max-w-md w-full rounded-xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 ${
            popup.type === 'success' ? 'bg-green-50 border-l-8 border-green-500' :
            popup.type === 'error' ? 'bg-red-50 border-l-8 border-red-500' :
            'bg-blue-50 border-l-8 border-blue-500'
          }`}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {popup.type === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
                  {popup.type === 'error' && <AlertCircle className="h-6 w-6 text-red-600" />}
                  {popup.type === 'info' && <Clock className="h-6 w-6 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{popup.title}</h3>
                  <p className="mt-1 text-gray-700">{popup.description}</p>
                  {popup.details && (
                    <p className="mt-2 text-sm text-gray-500 border-t pt-2">{popup.details}</p>
                  )}
                </div>
                <button
                  onClick={() => setPopup(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">Registro de Asistencia</h1>
        <p className="text-center text-gray-500 mb-6">Reconocimiento Facial</p>

        <div className="flex justify-center mb-6">
          <Button onClick={toggleCamera} variant={cameraActive ? "destructive" : "default"} size="lg" className="w-full max-w-xs">
            {cameraActive ? <><CameraOff className="mr-2 h-5 w-5" /> Apagar Cámara</> : <><Camera className="mr-2 h-5 w-5" /> Activar Cámara</>}
          </Button>
        </div>

        {cameraActive && (
          <>
            <div className="relative mb-6 rounded-xl overflow-hidden bg-gray-900">
              <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" videoConstraints={{ width: 640, height: 480, facingMode: 'user' }} className="w-full rounded-xl" />
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }} />
              {detectedFace && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Rostro detectado</div>
                </div>
              )}
              {faceDetectionError && !detectedFace && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {faceDetectionError}</div>
                </div>
              )}
            </div>
            <div className="flex justify-center mb-6">
              <Button onClick={handleRecognize} disabled={scanning || !detectedFace} size="lg" className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                {scanning ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Reconociendo...</> : <><User className="mr-2 h-5 w-5" /> Registrar Asistencia</>}
              </Button>
            </div>
            {cameraActive && !detectedFace && (
              <div className="text-center text-sm text-gray-500 mb-4">
                <p>Mira directamente a la cámara para que el sistema te reconozca</p>
                <p className="text-xs mt-1">Asegúrate de tener buena iluminación</p>
              </div>
            )}
          </>
        )}

        <div className="text-center text-xs text-gray-400 mt-4">
          {modelsLoaded ? '✅ Modelos listos' : '⏳ Cargando modelos...'} {cameraActive && detectedFace && ' | ✅ Rostro detectado'}
        </div>
      </div>
    </div>
  );
}