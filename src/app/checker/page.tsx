// app/dashboard/checker/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Loader2, CheckCircle, AlertCircle, User, Clock } from 'lucide-react';
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

export default function CheckerPage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<AttendanceResponse | null>(null);
  const [detectedFace, setDetectedFace] = useState(false);
  const [faceDetectionError, setFaceDetectionError] = useState<string | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const detectionTimeoutRef = useRef<NodeJS.Timeout>();

  // Cargar modelos de face-api.js al montar el componente
  useEffect(() => {
    const loadModels = async () => {
      try {
        toast.info('Cargando modelos de reconocimiento facial...');
        
        // Verificar que los archivos existen
        const modelPath = '/models';
        console.log('Cargando modelos desde:', modelPath);
        
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
          faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
        ]);
        
        setModelsLoaded(true);
        console.log('✅ Modelos cargados correctamente');
        toast.success('Modelos cargados correctamente');
      } catch (error) {
        console.error('Error cargando modelos:', error);
        toast.error('Error al cargar los modelos faciales. Verifica que los archivos estén en /public/models/');
      }
    };
    loadModels();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    };
  }, []);

  // Función para detectar rostro en tiempo real
  const detectFace = async () => {
    if (!webcamRef.current || !canvasRef.current || !cameraActive) {
      console.log('❌ Detección detenida: cámara o canvas no disponibles');
      return;
    }

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      console.log('⏳ Video no listo aún, esperando...');
      animationFrameRef.current = requestAnimationFrame(detectFace);
      return;
    }

    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    
    if (displaySize.width === 0 || displaySize.height === 0) {
      console.log('⏳ Dimensiones del video no disponibles');
      animationFrameRef.current = requestAnimationFrame(detectFace);
      return;
    }
    
    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detections = await faceapi
        .detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (resizedDetections.length > 0) {
        if (!detectedFace) {
          console.log('✅ Rostro detectado!');
          setDetectedFace(true);
          setFaceDetectionError(null);
        }
        // Dibujar el rectángulo alrededor del rostro detectado
        faceapi.draw.drawDetections(canvas, resizedDetections);
        
        // Limpiar timeout de error
        if (detectionTimeoutRef.current) {
          clearTimeout(detectionTimeoutRef.current);
        }
      } else {
        if (detectedFace) {
          console.log('❌ Rostro perdido');
          setDetectedFace(false);
        }
        
        // Mostrar error si pasa mucho tiempo sin detectar rostro
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

    // Continuar el loop de detección
    animationFrameRef.current = requestAnimationFrame(detectFace);
  };

  // Iniciar la detección cuando se activa la cámara
  useEffect(() => {
    if (cameraActive && modelsLoaded) {
      console.log('🎥 Activando detección facial...');
      setDetectedFace(false);
      setFaceDetectionError(null);
      // Pequeño delay para que la cámara se estabilice
      setTimeout(() => {
        detectFace();
      }, 1000);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, modelsLoaded]);

  // Capturar y reconocer rostro
  const handleRecognize = async () => {
    if (!modelsLoaded) {
      toast.error('Modelos faciales no cargados aún');
      return;
    }

    if (!cameraActive) {
      toast.error('Activa la cámara primero');
      return;
    }

    if (!detectedFace) {
      toast.error('No se detecta ningún rostro. Asegúrate de mirar a la cámara');
      return;
    }

    setScanning(true);
    setLoading(true);

    try {
      // Capturar el descriptor facial actual
      const video = webcamRef.current?.video;
      if (!video) throw new Error('Cámara no disponible');

      const detection = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection || !detection.descriptor) {
        throw new Error('No se pudo detectar el rostro correctamente');
      }

      console.log('✅ Descriptor facial capturado, longitud:', detection.descriptor.length);
      
      const currentDescriptor = Array.from(detection.descriptor);

      // Enviar a la API para reconocimiento
      const res = await fetch('/api/attendance/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceDescriptor: currentDescriptor }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(data);
        toast.success(data.message || 'Registro exitoso');
        
        // Resetear mensaje después de 5 segundos
        setTimeout(() => {
          setMessage(null);
        }, 5000);
      } else {
        setMessage({ error: data.error || 'Error al reconocer' });
        toast.error(data.error || 'No se pudo reconocer al empleado');
      }
    } catch (error) {
      console.error('Error en reconocimiento:', error);
      setMessage({ error: 'Error al procesar el rostro' });
      toast.error('Error al procesar el rostro');
    } finally {
      setScanning(false);
      setLoading(false);
    }
  };

  // Activar/Desactivar cámara
  const toggleCamera = async () => {
    if (!modelsLoaded) {
      toast.error('Espera a que los modelos se carguen');
      return;
    }
    
    if (cameraActive) {
      // Detener la cámara
      setCameraActive(false);
      setDetectedFace(false);
      setFaceDetectionError(null);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      setCameraActive(true);
      setMessage(null);
    }
  };

  // Renderizar estado de carga de modelos
  if (!modelsLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Cargando modelos...</h2>
          <p className="text-gray-500">Preparando el sistema de reconocimiento facial</p>
          <p className="text-xs text-gray-400 mt-4">
            Asegúrate de que los archivos estén en /public/models/
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          Registro de Asistencia
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Reconocimiento Facial
        </p>

        {/* Controles de cámara */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={toggleCamera}
            variant={cameraActive ? "destructive" : "default"}
            size="lg"
            className="w-full max-w-xs"
          >
            {cameraActive ? (
              <>
                <CameraOff className="mr-2 h-5 w-5" />
                Apagar Cámara
              </>
            ) : (
              <>
                <Camera className="mr-2 h-5 w-5" />
                Activar Cámara
              </>
            )}
          </Button>
        </div>

        {/* Vista de la cámara */}
        {cameraActive && (
          <div className="relative mb-6 rounded-xl overflow-hidden bg-gray-900">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user',
              }}
              className="w-full rounded-xl"
              style={{ height: 'auto' }}
              onUserMediaError={(error) => {
                console.error('Error de cámara:', error);
                toast.error('No se pudo acceder a la cámara. Verifica los permisos');
                setCameraActive(false);
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ pointerEvents: 'none' }}
            />
            
            {/* Overlay de estado */}
            {detectedFace && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Rostro detectado
                </div>
              </div>
            )}
            
            {faceDetectionError && !detectedFace && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {faceDetectionError}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón de reconocimiento */}
        {cameraActive && (
          <div className="flex justify-center mb-6">
            <Button
              onClick={handleRecognize}
              disabled={scanning || !detectedFace}
              size="lg"
              className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {scanning ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Reconociendo...
                </>
              ) : (
                <>
                  <User className="mr-2 h-5 w-5" />
                  Registrar Asistencia
                </>
              )}
            </Button>
          </div>
        )}

        {/* Instrucciones */}
        {cameraActive && !detectedFace && (
          <div className="text-center text-sm text-gray-500 mb-4">
            <p>Mira directamente a la cámara para que el sistema te reconozca</p>
            <p className="text-xs mt-1">Asegúrate de tener buena iluminación</p>
            <p className="text-xs text-blue-500 mt-2">
              💡 Si no se detecta el rostro, prueba a:
              <br />- Acercarte un poco más
              <br />- Mejorar la iluminación
              <br />- Quitar gafas 
            </p>
          </div>
        )}

        {/* Estado de los modelos */}
        <div className="text-center text-xs text-gray-400 mt-2">
          {cameraActive && detectedFace && ' | ✅ Rostro detectado'}
        </div>

        {/* Mensaje de resultado */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg ${message.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            {message.error ? (
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700">Error</p>
                  <p className="text-red-600">{message.error}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="font-bold text-lg text-green-700">
                    {message.employeeName || message.employee}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4" />
                  <p>
                    {message.type === "CHECK_IN" ? "⏰ Entrada registrada" : "🏁 Salida registrada"}
                  </p>
                </div>
                
                <p className="text-sm text-gray-500">
                  {message.time && new Date(message.time).toLocaleTimeString()}
                </p>
                
                {message.late && (
                  <p className="text-yellow-600 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Retardo
                  </p>
                )}
                
                {message.workedHours !== undefined && message.workedHours > 0 && (
                  <p className="text-sm text-gray-600">
                    Horas trabajadas: {message.workedHours}
                  </p>
                )}

                {message.message && (
                  <p className="text-sm text-green-600 mt-1">
                    {message.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}