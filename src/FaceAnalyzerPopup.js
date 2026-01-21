// FaceAnalyzerPopup.js
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, X } from 'lucide-react';
// ⭐ เพิ่มบรรทัดนี้
import { trackUserSession } from './analyticsService';

const FaceAnalyzerPopup = ({ onClose, onAnalysisComplete, language }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(true);
  const analysisTimeoutRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        ]);
        
        setModelsLoaded(true);
        console.log('✅ Face-API models loaded');
      } catch (err) {
        console.error('Error loading models:', err);
      }
    };

    loadModels();
  }, []);

  // Start webcam
  useEffect(() => {
    if (!modelsLoaded) return;

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsLoading(false);
          };
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setIsLoading(false);
      }
    };

    startVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [modelsLoaded]);

  // Face detection and analysis
  useEffect(() => {
    if (!modelsLoaded || isLoading) return;

    const detectFaces = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (canvas) {
          const displaySize = { width: video.videoWidth, height: video.videoHeight };
          faceapi.matchDimensions(canvas, displaySize);
        }

        try {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withAgeAndGender();

          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const resizedDetections = faceapi.resizeResults(detections, {
              width: video.videoWidth,
              height: video.videoHeight
            });
            
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          }

          if (detections && detections.length > 0 && analyzing) {
            const detection = detections[0];
            const { age, gender, genderProbability } = detection;

            // ถ้าความมั่นใจสูงกว่า 70% ให้ทำการวิเคราะห์
            if (genderProbability > 0.7) {
              setAnalyzing(false);
              
              // ⭐ เพิ่มส่วนนี้ - บันทึกข้อมูลลง Firestore
              const profileData = {
                gender,
                age: Math.round(age),
                confidence: genderProbability
              };

              console.log('👤 Face detected:', profileData);

              try {
                // บันทึกลง localStorage
                localStorage.setItem('userGender', gender);
                localStorage.setItem('userAge', Math.round(age).toString());
                localStorage.setItem('hasFilledProfile', 'true');

                // บันทึก session ลง Firestore
                await trackUserSession({
                  gender: gender,
                  age: Math.round(age)
                });

                console.log('✅ Face data saved to Analytics');
              } catch (error) {
                console.error('❌ Error saving face data:', error);
              }

              // รอ 1 วินาที แล้วส่งผลลัพธ์
              setTimeout(() => {
                onAnalysisComplete(profileData);
              }, 1000);
            }
          }
        } catch (err) {
          console.error('Detection error:', err);
        }
      }
    };

    const interval = setInterval(detectFaces, 500);

    // ปิดอัตโนมัติหลัง 10 วินาทีถ้าไม่พบใบหน้า
    analysisTimeoutRef.current = setTimeout(() => {
      if (analyzing) {
        onClose();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [modelsLoaded, isLoading, analyzing, onAnalysisComplete, onClose]);

  const getText = (key) => {
    const texts = {
      analyzing: { 
        th: 'กำลังวิเคราะห์ใบหน้า...', 
        en: 'Analyzing face...', 
        zh: '正在分析面部...', 
        ko: '얼굴 분석 중...' 
      },
      lookAtCamera: { 
        th: 'กรุณามองที่กล้อง', 
        en: 'Please look at camera', 
        zh: '请看摄像头', 
        ko: '카메라를 봐주세요' 
      }
    };
    return texts[key][language] || texts[key].th;
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-white hover:text-red-500 transition z-10"
      >
        <X size={48} />
      </button>

      <div className="text-center">
        <div className="relative inline-block mb-8">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-3xl z-10">
              <Camera className="w-16 h-16 text-white animate-pulse" />
            </div>
          )}
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full max-w-4xl h-auto object-cover"
              style={{ maxHeight: '70vh' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>

        <div className="text-white space-y-4">
          <h2 className="text-4xl font-bold">{getText('analyzing')}</h2>
          <p className="text-2xl text-white/80">{getText('lookAtCamera')}</p>
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceAnalyzerPopup;