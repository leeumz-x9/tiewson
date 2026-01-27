// TiewSonAI.js - Fixed for Android TV - Clean Version with Auto-Restart Wake Word
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Globe } from 'lucide-react';

// ========================== CONFIGURATIONS ==========================
const SYSTEM_PROMPTS = {
    th: `คุณคือ "น้องทิวสน" มาสคอตผู้หญิงของวิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา ตอบเป็นภาษาไทยเท่านั้น สุภาพ เป็นกันเอง ตอบสั้นๆ 3-4 ประโยค ข้อมูลที่ใช้ในการตอบ บางส่วนให้มาจากเว็บ https://www.lannapoly.ac.th/web/#/`,
    en: `You are "Tiew Son", the female mascot of Lanna Polytechnic College. CRITICAL: You MUST answer in ENGLISH language only. Keep it friendly and concise (3-4 sentences).Some of the information used in your answer can be found on the website: https://www.lannapoly.ac.th/web/#/`,
    zh: `你是"小松鼠"，兰纳理工学院的吉祥物。重要提示：你必须仅且只用"中文"回答。回答要友好且简洁（最多3-4句话）。本答案中使用的一些信息来自网站 https://www.lannapoly.ac.th/web/#/。`,
    ko: `당신은 "띠우손"입니다. 란나 폴리테크닉 대학의 마스코트입니다. 중요: 반드시 "한국어"로만 답변하십시오. 친근하고 간결하게 답변하세요 (최대 3-4문장).더 많은 정보를 보려면 https://www.lannapoly.ac.th/web/#/ 를 방문하세요.`
};

const GREETINGS = {
    th: 'สวัสดีค่ะ! น้องทิวสนยินดีต้อนรับค่ะ มีอะไรให้ช่วยไหมคะ?',
    en: 'Hello! I\'m Tiew Son. How can I help you?',
    zh: '你好！我是小松鼠。我能帮你什么？',
    ko: '안녕하세요! 띠우손입니다. 무엇을 도와드릴까요?'
};

const FALLBACK_RESPONSES = {
    th: {
        'สาขา': 'เรามีหลายสาขาค่ะ เช่น ช่างยนต์ คอมพิวเตอร์ บัญชี โรงแรม และท่องเที่ยว สนใจสาขาไหนคะ?',
        'รับสมัคร': 'เปิดรับสมัครช่วงมีนาคม-พฤษภาคมค่ะ สมัครได้ที่วิทยาลัยหรือออนไลน์ค่ะ',
        'default': 'น้องทิวสนพร้อมช่วยเหลือค่ะ ถามเรื่องสาขาหรือการสมัครเรียนได้เลยนะคะ'
    },
    en: { 'default': 'I\'m here to help! Ask me about courses or admission.' },
    zh: { 'default': '我在这里帮助你！问我关于课程或入学的问题。' },
    ko: { 'default': '도와드리겠습니다! 과정이나 입학에 대해 물어보세요.' }
};

const WAKE_WORDS = ['สวัสดีทิวสน', 'สวัสดีคิวสน', 'สวัสดีผิวสน', 'ทิวสน', 'tiewson'];

// ========================== MAIN COMPONENT ==========================
const TiewSonAI = ({ language, onLanguageChange, userProfile }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isWakeWordListening, setIsWakeWordListening] = useState(false);
    const [mascotAnimation, setMascotAnimation] = useState('idle');

    const recognitionRef = useRef(null);
    const wakeWordRecognitionRef = useRef(null);
    const messagesEndRef = useRef(null);
    const utteranceRef = useRef(null);
    const isRecognitionActive = useRef(false);
    const isWakeWordActive = useRef(false);
    const isMobileDevice = useRef(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    const isAndroidDevice = useRef(/Android/i.test(navigator.userAgent)); // ✅ เพิ่มการตรวจจับ Android
    const wakeWordRestartTimeoutRef = useRef(null);
    const recognitionTimeoutRef = useRef(null);
    const silenceTimeoutRef = useRef(null); // ✅ เพิ่ม timeout สำหรับตรวจจับเงียบ

    // ========================== SPEECH SYNTHESIS ==========================
    const speak = useCallback((text) => {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        setIsSpeaking(false);

        setTimeout(() => {
            try {
                const maxLength = 200;
                const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
                let chunks = [];
                let currentChunk = '';

                sentences.forEach(sentence => {
                    if ((currentChunk + sentence).length > maxLength) {
                        if (currentChunk) chunks.push(currentChunk.trim());
                        currentChunk = sentence;
                    } else {
                        currentChunk += sentence;
                    }
                });
                if (currentChunk) chunks.push(currentChunk.trim());

                if (text.length <= maxLength) chunks = [text];

                const langCodes = { th: 'th-TH', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR' };
                let currentIndex = 0;

                const speakChunk = () => {
                    if (currentIndex >= chunks.length) {
                        setIsSpeaking(false);
                        setMascotAnimation('idle');
                        return;
                    }
                    
                    const utterance = new SpeechSynthesisUtterance(chunks[currentIndex]);
                    utterance.lang = langCodes[language] || 'th-TH';
                    utterance.rate = 1.1;
                    utterance.pitch = 1.5;
                    utterance.volume = 1.0;

                    utterance.onstart = () => {
                        setIsSpeaking(true);
                        setMascotAnimation('talking');
                    };

                    utterance.onend = () => {
                        currentIndex++;
                        if (currentIndex < chunks.length) {
                            setTimeout(speakChunk, 100);
                        } else {
                            setIsSpeaking(false);
                            setMascotAnimation('idle');
                            utteranceRef.current = null;
                        }
                    };

                    utterance.onerror = (e) => {
                        console.warn('TTS Error:', e.error);
                        currentIndex++;
                        if (currentIndex < chunks.length) {
                            setTimeout(speakChunk, 500);
                        } else {
                            setIsSpeaking(false);
                            setMascotAnimation('idle');
                            utteranceRef.current = null;
                        }
                    };

                    utteranceRef.current = utterance;
                    window.speechSynthesis.speak(utterance);
                };

                speakChunk();

                if (isMobileDevice.current) {
                    setTimeout(() => {
                        if (window.speechSynthesis.speaking) {
                            window.speechSynthesis.cancel();
                            setIsSpeaking(false);
                            setMascotAnimation('idle');
                        }
                    }, 60000);
                }
            } catch (error) {
                console.error('TTS Init Error:', error);
                setIsSpeaking(false);
                setMascotAnimation('idle');
            }
        }, isMobileDevice.current ? 200 : 100);
    }, [language]);

    const stopSpeaking = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        setMascotAnimation('idle');
        utteranceRef.current = null;
    }, []);

    // ========================== iOS TTS INITIALIZATION ==========================
    useEffect(() => {
        if (isMobileDevice.current && 'speechSynthesis' in window) {
            const initTTS = () => {
                const utterance = new SpeechSynthesisUtterance('');
                utterance.volume = 0;
                window.speechSynthesis.speak(utterance);
                window.speechSynthesis.cancel();

                document.removeEventListener('touchstart', initTTS);
                document.removeEventListener('click', initTTS);
            };

            document.addEventListener('touchstart', initTTS, { once: true });
            document.addEventListener('click', initTTS, { once: true });

            return () => {
                document.removeEventListener('touchstart', initTTS);
                document.removeEventListener('click', initTTS);
            };
        }
    }, []);

    // ========================== MESSAGE HANDLER ==========================
    const handleSendMessage = useCallback(async (text = inputText) => {
        if (!text?.trim() || isProcessing) return;

        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setInputText('');
        setIsProcessing(true);
        setMascotAnimation('bounce');

        try {
            const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
            const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

            const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Instruction: ${SYSTEM_PROMPTS[language]}\nUser Question: ${text}\nResponse Language: ${language.toUpperCase()}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 300,
                        topP: 0.8,
                        topK: 40
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            let aiResponse = '';

            if (data.candidates && data.candidates.length > 0) {
                const candidate = data.candidates[0];
                if (candidate.content && candidate.content.parts) {
                    aiResponse = candidate.content.parts
                        .filter(part => part.text)
                        .map(part => part.text)
                        .join(' ')
                        .trim();
                }
            }

            if (!aiResponse) {
                throw new Error('Empty response from API');
            }

            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
            setTimeout(() => speak(aiResponse), 100);

        } catch (error) {
            console.warn('Using fallback response:', error.message);

            const fallbacks = FALLBACK_RESPONSES[language] || FALLBACK_RESPONSES.th;
            const lowerText = text.toLowerCase();
            const matchedKey = Object.keys(fallbacks).find(key =>
                key !== 'default' && lowerText.includes(key)
            );

            const response = fallbacks[matchedKey] || fallbacks.default;
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            setTimeout(() => speak(response), 100);

        } finally {
            setIsProcessing(false);
            setTimeout(() => setMascotAnimation('idle'), 1000);
        }
    }, [inputText, isProcessing, language, speak]);

    // ========================== SPEECH RECOGNITION SETUP ==========================
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            console.warn('Speech Recognition not supported');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        // Wake Word Recognition
        try {
            const wakeWord = new SpeechRecognition();
            wakeWord.continuous = true;
            wakeWord.interimResults = false;
            wakeWord.lang = 'th-TH';

            wakeWord.onstart = () => {
                isWakeWordActive.current = true;
                setIsWakeWordListening(true);
                console.log('🎤 Wake word active');
            };

            wakeWord.onend = () => {
                isWakeWordActive.current = false;
                setIsWakeWordListening(false);
                console.log('🛑 Wake word ended');

                // ✅ เพิ่มการเช็ค isExpanded อีกครั้งก่อน restart
                if (wakeWordRestartTimeoutRef.current) {
                    clearTimeout(wakeWordRestartTimeoutRef.current);
                }

                // Auto-restart if not in chat mode
                if (!isExpanded && !isListening) {
                    wakeWordRestartTimeoutRef.current = setTimeout(() => {
                        // ✅ Double check ว่ายังไม่ได้เปิดแชทก่อน restart
                        if (!isWakeWordActive.current && !isExpanded && !isListening && !isRecognitionActive.current) {
                            try {
                                console.log('🔄 Restarting wake word');
                                wakeWord.start();
                            } catch (e) {
                                console.warn('Restart failed:', e.message);
                            }
                        } else {
                            console.log('⏸️ Skip restart - chat is active');
                        }
                    }, 1500);
                } else {
                    console.log('⏸️ Not restarting - chat active or listening');
                }
            };

            wakeWord.onresult = (event) => {
                const result = event.results[event.results.length - 1][0];
                const transcript = result.transcript.toLowerCase();
                const confidence = result.confidence;
                
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🎤 WAKE WORD - Speech Detected:');
                console.log('   📝 Transcript:', transcript);
                console.log('   🎯 Confidence:', (confidence * 100).toFixed(1) + '%');
                console.log('   🔍 Checking wake words:', WAKE_WORDS);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

                if (WAKE_WORDS.some(word => transcript.includes(word))) {
                    console.log('✅ WAKE WORD MATCHED! Opening chat...');
                    
                    if (wakeWordRestartTimeoutRef.current) {
                        clearTimeout(wakeWordRestartTimeoutRef.current);
                    }
                    
                    setMascotAnimation('bounce');
                    setTimeout(() => setMascotAnimation('idle'), 1000);

                    setIsExpanded(true);
                    const greeting = GREETINGS[language];
                    setMessages([{ role: 'assistant', content: greeting }]);
                    speak(greeting);

                    wakeWord.stop();
                } else {
                    console.log('❌ No wake word match. Continuing to listen...');
                }
            };

            wakeWord.onerror = (e) => {
                console.log('⚠️ Wake word error:', e.error);
                
                // ✅ ยกเว้น error ที่ไม่จำเป็นต้อง restart
                if (['no-speech', 'aborted', 'audio-capture'].includes(e.error)) {
                    return;
                }
                
                // ✅ เช็คว่าไม่ได้อยู่ในโหมดแชทก่อน restart
                if (!isExpanded && !isListening && !isRecognitionActive.current) {
                    if (wakeWordRestartTimeoutRef.current) {
                        clearTimeout(wakeWordRestartTimeoutRef.current);
                    }
                    
                    wakeWordRestartTimeoutRef.current = setTimeout(() => {
                        if (!isWakeWordActive.current && !isExpanded && !isListening && !isRecognitionActive.current) {
                            try {
                                console.log('🔄 Restart after error');
                                wakeWord.start();
                            } catch (err) {
                                console.warn('Error restart failed:', err.message);
                            }
                        } else {
                            console.log('⏸️ Skip error restart - chat active');
                        }
                    }, 2000);
                } else {
                    console.log('⏸️ Not restarting after error - chat active');
                }
            };

            wakeWordRecognitionRef.current = wakeWord;
        } catch (error) {
            console.error('Wake word init failed:', error);
        }

        // ✅ FIXED: Chat Recognition for Android TV
        try {
            const chatRecognition = new SpeechRecognition();
            
            // ✅ ตั้งค่าเฉพาะสำหรับ Android
            if (isAndroidDevice.current) {
                chatRecognition.continuous = true;
                chatRecognition.interimResults = true;
                chatRecognition.maxAlternatives = 3; // ✅ เพิ่มทางเลือกในการรับรู้เสียง
                console.log('🤖 Android mode: continuous=true, interimResults=true, maxAlternatives=3');
            } else {
                chatRecognition.continuous = true;
                chatRecognition.interimResults = true;
            }
            
            let recognitionTimeout = null;
            let silenceTimeout = null;
            let lastTranscript = '';
            let finalTranscript = '';
            let lastSpeechTime = Date.now();

            chatRecognition.onstart = () => {
                isRecognitionActive.current = true;
                setIsListening(true);
                lastTranscript = '';
                finalTranscript = '';
                lastSpeechTime = Date.now();
                
                console.log('🎤 Chat recognition started (Android:', isAndroidDevice.current, ')');
                
                // ✅ Timeout หลัก - ป้องกันไม่ให้ทำงานเกิน 30 วินาที
                recognitionTimeout = setTimeout(() => {
                    if (isRecognitionActive.current) {
                        console.log('⏱️ Recognition timeout (30s) - stopping');
                        chatRecognition.stop();
                    }
                }, 30000); // ✅ เพิ่มเป็น 30 วินาที
                
                // ✅ สำหรับ Android: เช็คว่ายังมีเสียงอยู่หรือไม่ทุกๆ 1 วินาที
                if (isAndroidDevice.current) {
                    const checkSilence = () => {
                        if (!isRecognitionActive.current) return;
                        
                        const now = Date.now();
                        const timeSinceLastSpeech = now - lastSpeechTime;
                        
                        // ถ้าเงียบเกิน 5 วินาทีและมีข้อความอยู่แล้ว
                        if (timeSinceLastSpeech > 5000 && finalTranscript.trim()) {
                            console.log('🔇 Silence detected (5s) - stopping');
                            chatRecognition.stop();
                        } else if (timeSinceLastSpeech < 20000) {
                            // ถ้ายังมีเสียง ให้เช็คต่อ
                            silenceTimeout = setTimeout(checkSilence, 1000);
                        }
                    };
                    
                    silenceTimeout = setTimeout(checkSilence, 1000);
                }
            };

            chatRecognition.onend = () => {
                console.log('🛑 Chat recognition ended');
                console.log('   📊 Final transcript length:', finalTranscript.trim().length);
                console.log('   ⚙️ isRecognitionActive:', isRecognitionActive.current);
                
                // ✅ Force update state ก่อน
                const wasActive = isRecognitionActive.current;
                isRecognitionActive.current = false;
                setIsListening(false);
                
                // ✅ เคลียร์ timeout ทั้งหมด
                if (recognitionTimeout) {
                    clearTimeout(recognitionTimeout);
                    recognitionTimeout = null;
                }
                
                if (silenceTimeout) {
                    clearTimeout(silenceTimeout);
                    silenceTimeout = null;
                }
                
                // ✅ ส่งข้อความสุดท้ายถ้ามี และไม่ใช่การกดปิดด้วยตนเอง
                if (finalTranscript.trim() && wasActive) {
                    console.log('📤 Sending final transcript:', finalTranscript.trim());
                    const textToSend = finalTranscript.trim();
                    finalTranscript = ''; // ✅ เคลียร์ก่อนส่ง
                    
                    setInputText(textToSend);
                    
                    // ✅ ใช้ setTimeout เพื่อให้ state update ก่อน
                    setTimeout(() => {
                        handleSendMessage(textToSend);
                    }, 100);
                } else {
                    console.log('⏸️ Stopped without sending (user cancelled or no speech)');
                    finalTranscript = ''; // ✅ เคลียร์ข้อความ
                    setInputText(''); // ✅ เคลียร์ input box
                }
            };

            chatRecognition.onresult = (event) => {
                lastSpeechTime = Date.now(); // ✅ อัพเดทเวลาที่ได้ยินเสียงล่าสุด
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    const transcript = result[0].transcript;
                    
                    if (result.isFinal) {
                        finalTranscript += transcript + ' ';
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        console.log('💬 CHAT - Final Speech:');
                        console.log('   📝 Transcript:', transcript);
                        console.log('   🎯 Confidence:', (result[0].confidence * 100).toFixed(1) + '%');
                        console.log('   📊 Total so far:', finalTranscript.trim());
                        console.log('   ⏰ Time since start:', ((Date.now() - lastSpeechTime) / 1000).toFixed(1) + 's');
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        
                        // ✅ สำหรับ Android: ถ้าได้ประโยคที่สมบูรณ์แล้ว ให้รีเซ็ต silence timer
                        if (isAndroidDevice.current && finalTranscript.trim().length > 5) {
                            console.log('🔄 Got speech, resetting silence timer');
                            lastSpeechTime = Date.now();
                        }
                    } else {
                        interimTranscript += transcript;
                        console.log('⏳ Interim:', transcript);
                        
                        // ✅ แสดงข้อความระหว่างพูดใน input
                        setInputText((finalTranscript + interimTranscript).trim());
                        
                        // ✅ รีเซ็ต lastSpeechTime เมื่อมี interim results
                        lastSpeechTime = Date.now();
                    }
                }
            };

            chatRecognition.onerror = (e) => {
                console.warn('❌ Recognition error:', e.error);
                
                // ✅ เคลียร์ timeout
                if (recognitionTimeout) {
                    clearTimeout(recognitionTimeout);
                    recognitionTimeout = null;
                }
                
                if (silenceTimeout) {
                    clearTimeout(silenceTimeout);
                    silenceTimeout = null;
                }
                
                // ✅ ถ้าเป็น 'aborted' แสดงว่าผู้ใช้กดปิดเอง - ไม่ต้องส่งข้อความ
                if (e.error === 'aborted') {
                    console.log('⏸️ User cancelled - clearing transcript');
                    finalTranscript = '';
                    setInputText('');
                    setIsListening(false);
                    isRecognitionActive.current = false;
                    return;
                }
                
                // ✅ สำหรับ Android: ถ้า error อื่นๆ แต่มีข้อความ ให้ส่งไปเลย
                if (isAndroidDevice.current && finalTranscript.trim() && e.error !== 'aborted') {
                    console.log('📤 Sending transcript despite error (' + e.error + '):', finalTranscript.trim());
                    const textToSend = finalTranscript.trim();
                    finalTranscript = '';
                    setInputText(textToSend);
                    setTimeout(() => {
                        handleSendMessage(textToSend);
                    }, 100);
                }
                
                // ✅ ถ้าเป็น no-speech และมีข้อความ ให้ส่ง
                else if (e.error === 'no-speech' && finalTranscript.trim()) {
                    console.log('📤 Sending transcript despite no-speech:', finalTranscript.trim());
                    const textToSend = finalTranscript.trim();
                    finalTranscript = '';
                    setInputText(textToSend);
                    setTimeout(() => {
                        handleSendMessage(textToSend);
                    }, 100);
                }
                
                // ✅ Error อื่นๆ - เคลียร์ทุกอย่าง
                else {
                    finalTranscript = '';
                    setInputText('');
                }
                
                setIsListening(false);
                isRecognitionActive.current = false;
            };
            
            // ✅ สำหรับ Android: เพิ่ม event handlers เพิ่มเติม
            if (isAndroidDevice.current) {
                chatRecognition.onsoundstart = () => {
                    console.log('🔊 Sound detected');
                    lastSpeechTime = Date.now();
                };
                
                chatRecognition.onsoundend = () => {
                    console.log('🔇 Sound ended');
                };
                
                chatRecognition.onspeechstart = () => {
                    console.log('💬 Speech started');
                    lastSpeechTime = Date.now();
                };
                
                chatRecognition.onspeechend = () => {
                    console.log('💬 Speech ended');
                };
                
                chatRecognition.onaudiostart = () => {
                    console.log('🎙️ Audio capture started');
                };
                
                chatRecognition.onaudioend = () => {
                    console.log('🎙️ Audio capture ended');
                };
            }

            recognitionRef.current = chatRecognition;
        } catch (error) {
            console.error('Chat recognition init failed:', error);
        }

        return () => {
            if (wakeWordRestartTimeoutRef.current) {
                clearTimeout(wakeWordRestartTimeoutRef.current);
            }
            if (recognitionTimeoutRef.current) {
                clearTimeout(recognitionTimeoutRef.current);
            }
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
            wakeWordRecognitionRef.current?.stop();
            recognitionRef.current?.stop();
            stopSpeaking();
        };
    }, [language, speak, stopSpeaking, isExpanded, isListening, handleSendMessage]);

    // ========================== WAKE WORD CONTROL ==========================
    useEffect(() => {
        const startWakeWord = () => {
            if (isExpanded || isListening) {
                if (isWakeWordActive.current) {
                    console.log('⏸️ Stopping wake word (chat active)');
                    wakeWordRecognitionRef.current?.stop();
                }
            } else {
                if (!isWakeWordActive.current && wakeWordRecognitionRef.current) {
                    setTimeout(() => {
                        try {
                            if (!isWakeWordActive.current && !isExpanded && !isListening) {
                                console.log('▶️ Starting wake word listener');
                                wakeWordRecognitionRef.current?.start();
                            }
                        } catch (e) {
                            if (!e.message.includes('already started')) {
                                console.warn('Wake word start failed:', e.message);
                            }
                        }
                    }, 500);
                }
            }
        };

        startWakeWord();
    }, [isExpanded, isListening]);

    // ========================== HANDLERS ==========================
    const toggleListening = useCallback(() => {
        if (isListening) {
            console.log('🛑 Manually stopping recognition');
            
            // ✅ Force stop - เคลียร์ทุกอย่าง
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    console.warn('Stop error (ignored):', e.message);
                }
            }
            
            // ✅ Force update state
            setIsListening(false);
            isRecognitionActive.current = false;
            
            // ✅ เคลียร์ input ถ้ายังไม่มีข้อความสมบูรณ์
            setInputText('');
        } else {
            stopSpeaking();

            setTimeout(() => {
                try {
                    const langCodes = { th: 'th-TH', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR' };
                    if (recognitionRef.current) {
                        recognitionRef.current.lang = langCodes[language] || 'th-TH';
                        console.log('▶️ Starting recognition');
                        console.log('   🌍 Language:', langCodes[language]);
                        console.log('   📱 Device: Android=' + isAndroidDevice.current + ', Mobile=' + isMobileDevice.current);
                        console.log('   ⚙️ Settings: continuous=' + recognitionRef.current.continuous + ', interimResults=' + recognitionRef.current.interimResults);
                        recognitionRef.current.start();
                    }
                } catch (e) {
                    if (!e.message.includes('already started')) {
                        console.error('❌ Mic start failed:', e);
                    }
                }
            }, 200);
        }
    }, [isListening, language, stopSpeaking]);

    // ========================== AUTO SCROLL ==========================
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (recognitionRef.current) {
            const langCodes = { th: 'th-TH', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR' };
            recognitionRef.current.lang = langCodes[language] || 'th-TH';
        }
    }, [language]);

    // ========================== RENDER ==========================
    return (
        <>
            <style>{`
                @keyframes gentle-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    25% { transform: rotate(-3deg) scale(1.02); }
                    75% { transform: rotate(3deg) scale(1.02); }
                }
                
                @keyframes talk-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .mascot-talking {
                    animation: talk-pulse 0.6s ease-in-out infinite;
                }
                
                .mascot-wiggle {
                    animation: wiggle 0.8s ease-in-out infinite;
                }
                
                .mascot-bounce {
                    animation: gentle-bounce 0.8s ease-in-out;
                }
            `}</style>

            {/* ========== FLOATING MASCOT ========== */}
            {!isExpanded && (
                <div className="fixed bottom-6 right-6 z-40">
                    <button
                        onClick={() => {
                            setIsExpanded(true);
                            setMascotAnimation('bounce');
                            setTimeout(() => setMascotAnimation('idle'), 1000);
                        }}
                        className="relative group"
                        aria-label="Open Tiew Son Assistant"
                    >
                        <img
                            src="/tiewson.png"
                            alt="น้องทิวสน"
                            className={`w-32 h-32 object-cover rounded-full shadow-2xl border-4 border-white transition-all duration-300 ${mascotAnimation === 'bounce' ? 'animate-bounce' :
                                    mascotAnimation === 'talking' ? 'scale-105' :
                                        'hover:scale-110'
                                }`}
                        />

                        <div className="absolute -top-20 right-0 bg-white px-4 py-3 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                            <p className="text-sm text-gray-800 font-semibold">
                                {language === 'th' && '🎤 พูดว่า "สวัสดีทิวสน"'}
                                {language === 'en' && '🎤 Say "Hello Tiewson"'}
                                {language === 'zh' && '🎤 说"你好小松鼠"'}
                                {language === 'ko' && '🎤 "안녕 띠우손" 말하기'}
                            </p>
                            <div className="absolute bottom-0 right-8 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white"></div>
                        </div>

                        {isWakeWordListening && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"></div>
                                <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xs animate-pulse">🎤</span>
                                </div>
                            </>
                        )}

                        {isListening && (
                            <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                        )}

                        {isSpeaking && (
                            <div className="absolute -top-1 -right-1 w-7 h-7 bg-orange-500 rounded-full border-2 border-white animate-pulse"></div>
                        )}
                    </button>

                    {isWakeWordListening && (
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-4 py-1.5 rounded-full shadow-lg animate-pulse whitespace-nowrap">
                            🎤 กำลังฟัง...
                        </div>
                    )}
                </div>
            )}

            {/* ========== CHAT WINDOW WITH LARGE MASCOT ========== */}
            {isExpanded && (
                <div className="fixed bottom-6 right-6 flex items-end gap-1 z-40 max-w-[calc(100vw-3rem)]">
                    {/* Large Animated Mascot - Hidden on small screens */}
                    <div className="relative hidden md:block">
                        <img
                            src="/tiewson.png"
                            alt="น้องทิวสน"
                            className={`w-[32rem] h-auto object-contain transition-all duration-300 ${isSpeaking ? 'mascot-talking' :
                                    isProcessing ? 'mascot-wiggle' :
                                        mascotAnimation === 'bounce' ? 'mascot-bounce' : ''
                                }`}
                            style={{
                                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))',
                                maxHeight: '500px'
                            }}
                        />

                        {isSpeaking && (
                            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white px-5 py-3 rounded-full shadow-xl animate-pulse z-10">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        )}

                        {isListening && (
                            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-5 py-2.5 rounded-full shadow-xl animate-pulse flex items-center gap-2 z-10">
                                <Mic className="w-5 h-5" />
                                <span className="font-semibold">
                                    {language === 'th' ? 'กำลังฟัง...' : 'Listening...'}
                                </span>
                            </div>
                        )}

                        {isProcessing && !isSpeaking && (
                            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 z-10">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="font-semibold">
                                    {language === 'th' ? 'กำลังคิด...' : 'Thinking...'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Chat Window - Responsive */}
                    <div className="w-full md:w-96 bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-blue-100 mb-4">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}></div>
                                <div>
                                    <h3 className="text-white font-bold text-sm md:text-base">น้องทิวสน</h3>
                                    <p className="text-blue-100 text-xs">Lanna Polytechnic Assistant</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const langs = ['th', 'en', 'zh', 'ko'];
                                        const nextLang = langs[(langs.indexOf(language) + 1) % langs.length];
                                        onLanguageChange(nextLang);
                                    }}
                                    className="text-white hover:bg-blue-800 p-2 rounded-lg transition"
                                    aria-label="Change language"
                                >
                                    <Globe className="w-4 h-4 md:w-5 md:h-5" />
                                </button>

                                <button
                                    onClick={() => {
                                        setIsExpanded(false);
                                        stopSpeaking();
                                        recognitionRef.current?.stop();
                                    }}
                                    className="text-white hover:bg-blue-800 p-2 rounded-lg transition"
                                    aria-label="Close chat"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Status Indicators for Mobile */}
                        {(isListening || isProcessing || isSpeaking) && (
                            <div className="md:hidden bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 border-b border-blue-200">
                                {isListening && (
                                    <div className="flex items-center justify-between text-red-600">
                                        <div className="flex items-center gap-2">
                                            <Mic className="w-4 h-4 animate-pulse" />
                                            <span className="text-xs font-semibold">
                                                {language === 'th' ? '🎤 กำลังฟัง... (กดอีกครั้งเพื่อหยุด)' : '🎤 Listening... (tap to stop)'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={toggleListening}
                                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                        >
                                            {language === 'th' ? 'หยุด' : 'Stop'}
                                        </button>
                                    </div>
                                )}
                                {isProcessing && !isSpeaking && (
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xs font-semibold">
                                            {language === 'th' ? 'กำลังคิด...' : 'Thinking...'}
                                        </span>
                                    </div>
                                )}
                                {isSpeaking && (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <span className="text-xs font-semibold">
                                            {language === 'th' ? 'กำลังพูด...' : 'Speaking...'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Messages */}
                        <div className="h-80 overflow-y-auto p-4 bg-gray-50">
                            {isMobileDevice.current && messages.length === 1 && (
                                <div className="mb-3 text-center">
                                    <div className="inline-block bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded-lg">
                                        🔊 หาก iOS ไม่มีเสียง กรุณาคลิกปุ่มลำโพงเพื่อเปิดเสียง
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                                >
                                    <div
                                        className={`inline-block max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap text-sm md:text-base ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-800 shadow-md'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {isProcessing && (
                                <div className="text-left mb-3">
                                    <div className="inline-block bg-white p-3 rounded-2xl shadow-md">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Controls */}
                        <div className="p-3 md:p-4 bg-white border-t border-gray-200">
                            <div className="flex gap-2">
                                <button
                                    onClick={toggleListening}
                                    className={`p-2 md:p-3 rounded-xl transition-all ${isListening
                                            ? 'bg-red-500 text-white scale-110 animate-pulse'
                                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                        }`}
                                    disabled={isProcessing}
                                    aria-label={isListening ? 'Stop listening' : 'Start listening'}
                                    title={isListening 
                                        ? (language === 'th' ? '⏹️ หยุดบันทึกเสียง' : '⏹️ Stop recording') 
                                        : (language === 'th' ? '🎤 เริ่มบันทึกเสียง' : '🎤 Start recording')
                                    }
                                >
                                    {isListening ? <MicOff className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
                                </button>

                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                    placeholder={language === 'th' ? 'พิมพ์ข้อความ...' : 'Type message...'}
                                    className="flex-1 px-3 md:px-4 py-2 md:py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm md:text-base"
                                    disabled={isProcessing}
                                />

                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputText.trim() || isProcessing}
                                    className="p-2 md:p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    aria-label="Send message"
                                >
                                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                                </button>

                                <button
                                    onClick={() => {
                                        if (isSpeaking) {
                                            stopSpeaking();
                                        } else {
                                            const testMsg = language === 'th' ? 'ทดสอบเสียง' : 'Testing audio';
                                            speak(testMsg);
                                        }
                                    }}
                                    className={`p-2 md:p-3 rounded-xl transition-all ${isSpeaking
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    aria-label={isSpeaking ? 'Stop speaking' : 'Test speaker'}
                                    title={isSpeaking ? 'หยุดพูด' : 'ทดสอบเสียง'}
                                >
                                    {isSpeaking ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TiewSonAI;