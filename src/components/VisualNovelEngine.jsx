import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { ShieldAlert, Cpu, HeartHandshake, Eye, Map, Menu, X, Home, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import storyData from '../data/storyData.json';
import { useGame } from '../context/GameContext';
import AvatarRenderer from './AvatarRenderer';

// AAA Hooks & Engines
import { AmbientAudioEngine } from './AudioSystem';
import Scene3D from './Scene3D';

/* ============================================
   RAIN EFFECT COMPONENT (CSS Animated)
   ============================================ */
const RainEffect = () => {
      const drops = Array.from({ length: 60 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 2}s`,
            duration: `${0.4 + Math.random() * 0.4}s`,
            height: `${15 + Math.random() * 25}px`,
            opacity: 0.2 + Math.random() * 0.3,
      }));

      return (
            <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden">
                  {drops.map(d => (
                        <motion.div
                              key={d.id}
                              className="absolute w-[1px] bg-blue-300/40 rounded-full"
                              style={{ left: d.left, height: d.height, opacity: d.opacity }}
                              animate={{ y: ['0vh', '105vh'] }}
                              transition={{ duration: parseFloat(d.duration), delay: parseFloat(d.delay), repeat: Infinity, ease: 'linear' }}
                        />
                  ))}
            </div>
      );
};

/* ============================================
   LIGHTNING FLASH COMPONENT
   ============================================ */
const LightningFlash = () => (
      <motion.div
            className="absolute inset-0 pointer-events-none z-[6]"
            animate={{ opacity: [0, 0, 0.7, 0, 0, 0, 0.3, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{ background: 'radial-gradient(ellipse at 40% 20%, rgba(200,220,255,0.9), transparent 70%)' }}
      />
);

/* ============================================
   FLOATING PARTICLES (Dust, Embers, Spores)
   ============================================ */
const FloatingParticles = ({ theme }) => {
      const particles = Array.from({ length: 25 }, (_, i) => {
            const isEmber = theme === 'glitch' || theme === 'distopic';
            return {
                  id: i,
                  x: Math.random() * 100,
                  y: Math.random() * 100,
                  size: 2 + Math.random() * 4,
                  dur: 6 + Math.random() * 8,
                  delay: Math.random() * 5,
                  color: isEmber
                        ? `rgba(${200 + Math.random() * 55}, ${Math.random() * 80}, ${Math.random() * 30}, ${0.4 + Math.random() * 0.4})`
                        : theme === 'cyber'
                              ? `rgba(${180 + Math.random() * 75}, ${100 + Math.random() * 100}, 255, ${0.3 + Math.random() * 0.3})`
                              : `rgba(255, 255, ${200 + Math.random() * 55}, ${0.2 + Math.random() * 0.3})`
            };
      });
      return (
            <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden">
                  {particles.map(p => (
                        <motion.div
                              key={p.id}
                              className="absolute rounded-full"
                              style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: p.color, filter: 'blur(0.5px)' }}
                              animate={{ y: [-20, -60], x: [0, (Math.random() - 0.5) * 40], opacity: [0, 0.8, 0] }}
                              transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                        />
                  ))}
            </div>
      );
};

/* ============================================
   TYPEWRITER TEXT COMPONENT
   ============================================ */
const TypewriterText = ({ text, onComplete }) => {
      const [displayedText, setDisplayedText] = useState('');

      useEffect(() => {
            setDisplayedText('');
            let i = 0;
            const interval = setInterval(() => {
                  setDisplayedText(text.slice(0, i + 1));
                  i++;
                  if (i === text.length) {
                        clearInterval(interval);
                        if (onComplete) onComplete();
                  }
            }, 20);
            return () => clearInterval(interval);
      }, [text, onComplete]);

      return (
            <span>
                  {displayedText}
                  <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block ml-1 w-2 h-6 md:h-8 bg-current align-middle"
                  />
            </span>
      );
};

/* ============================================
   MAIN VISUAL NOVEL ENGINE
   ============================================ */
const VisualNovelEngine = () => {
      const { avatar } = useGame();
      const [currentSceneId, setCurrentSceneId] = useState('title_screen');
      const [inventory, setInventory] = useState([]);
      const [isTyping, setIsTyping] = useState(true);
      const [selectedChoiceIdx, setSelectedChoiceIdx] = useState(0);
      const [isTtsEnabled, setIsTtsEnabled] = useState(false);
      const [isMenuOpen, setIsMenuOpen] = useState(false);
      const [sceneHistory, setSceneHistory] = useState([]);
      const [isMuted, setIsMuted] = useState(false);

      const bgMusicRef = useRef(null);
      const lastDroneRef = useRef('');

      const scene = storyData[currentSceneId];

      // Preload all images on mount
      useEffect(() => {
            const images = new Set();
            Object.values(storyData).forEach(s => {
                  if (s.bgImage) images.add(s.bgImage);
                  if (s.npcSprite) images.add(s.npcSprite);
                  if (s.eventCG) images.add(s.eventCG);
            });
            images.forEach(src => { const img = new Image(); img.src = src; });
      }, []);

      // AMBIENT AUDIO ENGINE — plays drones based on theme
      useEffect(() => {
            AmbientAudioEngine.init();

            if (!scene || isMuted) {
                  AmbientAudioEngine.stopAll();
                  if (bgMusicRef.current) bgMusicRef.current.pause();
                  return;
            }

            // Play background music (looping perfectly via Howler)
            if (scene.bgMusic && scene.bgMusic.includes('Rio_do_Futuro')) {
                  AmbientAudioEngine.playBGM(scene.bgMusic);
            }

            // Determine which ambient drone to play
            const theme = scene.uiTheme || 'clean';
            let droneKey = theme;

            // Don't restart the same drone
            if (droneKey !== lastDroneRef.current) {
                  lastDroneRef.current = droneKey;
                  switch (theme) {
                        case 'glitch': AmbientAudioEngine.playTensionDrone(); break;
                        case 'distopic': AmbientAudioEngine.playCyberpunkDrone(); break;
                        case 'cyber': AmbientAudioEngine.playCyberpunkDrone(); break;
                        case 'clean': AmbientAudioEngine.playCleanDrone(); break;
                        default: AmbientAudioEngine.playCleanDrone();
                  }
            }

            setIsTyping(true);
      }, [currentSceneId, scene, isMuted]);

      // TTS
      useEffect(() => {
            if (!isTtsEnabled || !scene || scene.text === "") return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(scene.text);
            u.lang = 'pt-BR'; u.rate = 0.9;
            window.speechSynthesis.speak(u);
      }, [currentSceneId, isTtsEnabled, scene]);

      if (!scene) {
            return <div className="text-red-500 font-bold p-10 flex h-screen items-center justify-center bg-black">ERROR: Cena '{currentSceneId}' não encontrada.</div>;
      }

      const handleChoice = (choice) => {
            AmbientAudioEngine.playClick();
            window.speechSynthesis.cancel();
            setSceneHistory(prev => [...prev, currentSceneId]);
            if (choice.nextScene === 'title_screen') {
                  setInventory([]);
                  setSceneHistory([]);
            } else if (choice.gainItem && !inventory.includes(choice.gainItem)) {
                  setInventory([...inventory, choice.gainItem]);
            }
            setCurrentSceneId(choice.nextScene);
            setIsMenuOpen(false);
      };

      const goBack = () => {
            if (sceneHistory.length > 0) {
                  const prev = sceneHistory[sceneHistory.length - 1];
                  setSceneHistory(h => h.slice(0, -1));
                  setCurrentSceneId(prev);
                  setIsMenuOpen(false);
            }
      };

      const goHome = () => {
            AmbientAudioEngine.stopAll();
            lastDroneRef.current = '';
            setCurrentSceneId('title_screen');
            setInventory([]);
            setSceneHistory([]);
            setIsMenuOpen(false);
      };

      const toggleMute = () => {
            setIsMuted(m => {
                  if (!m) { AmbientAudioEngine.stopAll(); }
                  else { lastDroneRef.current = ''; }
                  return !m;
            });
      };

      const availableChoices = scene.choices.filter(c => !c.requiredItem || inventory.includes(c.requiredItem));

      // Keyboard/Arcade
      useEffect(() => {
            const handleKeyDown = (e) => {
                  if (e.key === 'Escape') { setIsMenuOpen(m => !m); e.preventDefault(); return; }
                  if (isMenuOpen) return;
                  if (isTyping && scene.text !== "") {
                        if (['Enter', ' ', 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
                              e.preventDefault(); setIsTyping(false);
                        }
                        return;
                  }
                  switch (e.key) {
                        case 'ArrowUp': case 'ArrowLeft':
                              e.preventDefault();
                              setSelectedChoiceIdx(p => p > 0 ? p - 1 : availableChoices.length - 1);
                              break;
                        case 'ArrowDown': case 'ArrowRight':
                              e.preventDefault();
                              setSelectedChoiceIdx(p => p < availableChoices.length - 1 ? p + 1 : 0);
                              break;
                        case 'Enter': case ' ':
                              e.preventDefault();
                              if (availableChoices.length > 0) handleChoice(availableChoices[selectedChoiceIdx]);
                              break;
                        case 'Backspace':
                              e.preventDefault(); goBack();
                              break;
                  }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
      }, [isTyping, availableChoices, selectedChoiceIdx, scene.text, isMenuOpen]);

      useEffect(() => { setSelectedChoiceIdx(0); }, [currentSceneId]);

      // Theme config
      const themeClasses = {
            clean: "glass-panel border-t-2 border-blue-400/50 text-blue-50",
            glitch: "glass-panel border-t-2 border-red-500/60 text-red-100",
            distopic: "glass-panel border-t-2 border-emerald-400/50 text-emerald-50",
            cyber: "glass-panel border-t-2 border-fuchsia-400/50 text-purple-100"
      };
      const uiBoxClass = themeClasses[scene.uiTheme] || themeClasses.clean;
      const btnGlow = scene.uiTheme === 'glitch' ? 'glow-red' : scene.uiTheme === 'distopic' ? 'glow-emerald' : scene.uiTheme === 'cyber' ? 'glow-purple' : 'glow-blue';
      const gradientText = scene.uiTheme === 'glitch' ? 'gradient-text-red' : scene.uiTheme === 'distopic' ? 'gradient-text-emerald' : scene.uiTheme === 'cyber' ? 'gradient-text-purple' : 'gradient-text-blue';
      const dotColor = scene.uiTheme === 'glitch' ? 'bg-red-400' : scene.uiTheme === 'distopic' ? 'bg-emerald-400' : scene.uiTheme === 'cyber' ? 'bg-fuchsia-400' : 'bg-blue-400';

      const hasTactical = inventory.includes("trait_hacker");
      const hasEngineer = inventory.includes("trait_engineer");
      const hasVoice = inventory.includes("trait_diplomat");
      const hasBio = inventory.includes("trait_bio");

      const shakeAnimation = scene.uiTheme === 'glitch' ? {
            x: [0, -10, 10, -10, 10, 0], y: [0, 5, -5, 5, -5, 0],
            transition: { duration: 0.4, repeat: Infinity, repeatType: "mirror" }
      } : {};

      // Weather & particle effects based on theme
      const showRain = scene.uiTheme === 'distopic' || scene.uiTheme === 'cyber';
      const showLightning = scene.uiTheme === 'glitch';

      // Color vibrancy + EXTREME GPU SHARPENING filter per theme
      const colorFilter = scene.uiTheme === 'glitch'
            ? 'url(#super-sharpen) saturate(1.3) contrast(1.15) brightness(1.05)'
            : scene.uiTheme === 'distopic'
                  ? 'url(#super-sharpen) saturate(1.4) contrast(1.1) brightness(1.02)'
                  : scene.uiTheme === 'cyber'
                        ? 'url(#super-sharpen) saturate(1.35) contrast(1.1) brightness(1.05)'
                        : 'url(#super-sharpen) saturate(1.2) contrast(1.05) brightness(1.03)';

      return (
            <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
                  <motion.div
                        className="relative w-full h-full max-w-[calc(100vh*16/9)] max-h-[calc(100vw*9/16)] flex flex-col justify-end bg-black overflow-hidden shadow-2xl scanline-overlay vignette"
                        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                        animate={shakeAnimation}
                  >
                        {/* Advanced 3D Render Canvas replaces flat background image */}
                        <div className="absolute inset-0 pointer-events-none">
                              {scene.eventCG || scene.bgImage ? (
                                    <Suspense fallback={<div className="bg-black w-full h-full" />}>
                                          <Scene3D imageUrl={scene.eventCG || scene.bgImage} theme={scene.uiTheme} />
                                    </Suspense>
                              ) : (
                                    <div className="bg-black w-full h-full" />
                              )}
                        </div>

                        {/* Weather Effects Layered Above 3D Background */}
                        {showRain && <RainEffect />}
                        {showLightning && <LightningFlash />}
                        <FloatingParticles theme={scene.uiTheme || 'clean'} />

                        {/* Bottom Gradient */}
                        <div className="absolute bottom-0 w-full h-[60vh] bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-0" />

                        {/* NPC Sprite */}
                        <AnimatePresence>
                              {!scene.eventCG && scene.npcSprite && (
                                    <motion.div
                                          key={scene.npcSprite}
                                          initial={{ opacity: 0, y: 50 }}
                                          animate={{ opacity: 1, y: [0, -3, 0] }}
                                          exit={{ opacity: 0, y: 30 }}
                                          transition={{
                                                opacity: { duration: 0.6, ease: 'backOut' },
                                                y: { duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.6 }
                                          }}
                                          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:left-[10%] max-w-sm pointer-events-none z-0"
                                    >
                                          <img src={scene.npcSprite} alt={scene.speakerName}
                                                className="h-[75vh] object-contain drop-shadow-[0_0_25px_rgba(0,0,0,0.9)]"
                                                style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }} />
                                    </motion.div>
                              )}
                        </AnimatePresence>

                        {/* Audio Player (for actual MP4 files) */}
                        <audio ref={bgMusicRef} loop />

                        {/* ===================== AVATAR HUD ===================== */}
                        {currentSceneId !== 'title_screen' && (
                              <motion.div 
                                    initial={{ opacity: 0, x: -20 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute top-4 left-4 z-40 w-24 h-24 md:w-32 md:h-32 glass-panel border border-white/20 rounded-xl overflow-hidden shadow-2xl bg-black/50"
                              >
                                    <AvatarRenderer options={avatar} />
                                    <div className="absolute font-cyber bottom-0 w-full text-center bg-black/80 text-[10px] md:text-xs text-blue-400 py-1 border-t border-white/10 uppercase tracking-widest font-bold">
                                          NEXO-ID
                                    </div>
                              </motion.div>
                        )}

                        {/* ===================== NAVIGATION MENU ===================== */}
                        {currentSceneId !== 'title_screen' && (
                              <motion.button
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    onClick={() => setIsMenuOpen(m => !m)}
                                    className="absolute top-4 right-4 z-50 p-3 rounded-xl glass-panel border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-all"
                              >
                                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                              </motion.button>
                        )}

                        <AnimatePresence>
                              {isMenuOpen && (
                                    <motion.div
                                          initial={{ opacity: 0, y: -20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -20 }}
                                          className="absolute top-16 right-4 z-50 flex flex-col gap-2 p-3 rounded-xl glass-panel border border-white/20 min-w-[220px]"
                                    >
                                          <button onClick={goBack} disabled={sceneHistory.length === 0}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 text-lg">
                                                <RotateCcw size={20} /> Voltar Cena
                                          </button>
                                          <button onClick={goHome}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all text-lg">
                                                <Home size={20} /> Tela Inicial
                                          </button>
                                          <button onClick={toggleMute}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all text-lg">
                                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                                {isMuted ? 'Som: DESLIGADO' : 'Som: LIGADO'}
                                          </button>
                                          <button onClick={() => { setIsTtsEnabled(t => !t); setIsMenuOpen(false); }}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all text-lg">
                                                {isTtsEnabled ? '🔊' : '🔇'} Voz: {isTtsEnabled ? 'ATIVADA' : 'DESATIVADA'}
                                          </button>
                                    </motion.div>
                              )}
                        </AnimatePresence>

                        {/* ===================== DIALOGUE BOX ===================== */}
                        {scene.text !== "" && (
                              <motion.div
                                    key={scene.speakerName + currentSceneId}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className={`relative w-full z-10 p-6 md:p-10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] ${uiBoxClass}`}
                              >
                                    <div className="max-w-6xl mx-auto flex flex-col gap-5">
                                          {(hasTactical || hasEngineer || hasVoice || hasBio) && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                      className="absolute -top-14 right-4 md:right-10 flex items-center gap-3 glass-panel px-5 py-2 border border-gray-600 rounded-lg shadow-2xl text-sm md:text-base text-gray-200">
                                                      {hasTactical && <><Cpu size={18} className="text-cyan-400" /> Overclocking Cognitivo</>}
                                                      {hasEngineer && <><Eye size={18} className="text-yellow-400" /> Malha Urbana</>}
                                                      {hasVoice && <><HeartHandshake size={18} className="text-emerald-400" /> Diplomacia Viva</>}
                                                      {hasBio && <><Map size={18} className="text-green-400" /> Bio-Restauração</>}
                                                </motion.div>
                                          )}

                                          <div className={`text-2xl md:text-3xl tracking-widest drop-shadow-md ${gradientText}`}
                                                style={{ fontFamily: "'Orbitron', monospace" }}>
                                                {scene.speakerName}
                                          </div>

                                          <div className="text-xl md:text-2xl lg:text-3xl leading-snug min-h-[120px] shadow-text font-medium text-gray-50">
                                                {isTyping ? (
                                                      <TypewriterText text={scene.text} onComplete={() => setIsTyping(false)} />
                                                ) : (
                                                      <span>{scene.text}</span>
                                                )}
                                          </div>
                                    </div>
                              </motion.div>
                        )}

                        {/* ===================== CHOICE BUTTONS ===================== */}
                        <div className={`relative z-20 w-full max-w-6xl mx-auto px-6 md:px-10 pb-10 mt-6 flex flex-col gap-3 transition-opacity duration-500 ${!isTyping || scene.text === "" ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                              {/* TTS Toggle on Title */}
                              {currentSceneId === 'title_screen' && (!isTyping || scene.text === "") && (
                                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                          onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                                          className={`self-center mb-2 px-6 py-3 rounded-full text-lg font-bold transition-all border-2 ${isTtsEnabled ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-black/60 border-gray-500 text-gray-300 hover:border-white'
                                                }`}>
                                          {isTtsEnabled ? '🔊 Acessibilidade: VOZ ATIVADA' : '🔇 Acessibilidade: Ativar Voz'}
                                    </motion.button>
                              )}
                              <AnimatePresence>
                                    {(!isTyping || scene.text === "") && availableChoices.map((choice, idx) => (
                                          <motion.button
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: idx * 0.1, duration: 0.3 }}
                                                whileHover={{ scale: 1.02, x: 15, boxShadow: "0px 0px 30px oklch(100% 0 0 / 0.3)" }}
                                                whileTap={{ scale: 0.95 }}
                                                onMouseEnter={() => AmbientAudioEngine.playHover()}
                                                onClick={() => handleChoice(choice)}
                                                className={`text-left px-6 py-5 rounded-xl btn-premium ${btnGlow} font-semibold text-xl md:text-2xl focus:outline-none flex items-center gap-4 ${idx === selectedChoiceIdx ? 'arcade-selected' : ''}`}
                                          >
                                                <span className={`w-3 h-3 rounded-full ${dotColor} shadow-[0_0_15px_currentColor]`} />
                                                {choice.label}
                                          </motion.button>
                                    ))}
                              </AnimatePresence>
                        </div>

                  </motion.div>
            </div>
      );
};

export default VisualNovelEngine;
