import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Cpu, HeartHandshake, Eye, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import storyData from '../data/storyData.json';

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

const VisualNovelEngine = () => {
      const [currentSceneId, setCurrentSceneId] = useState('title_screen');
      const [inventory, setInventory] = useState([]);
      const [isTyping, setIsTyping] = useState(true);
      const [selectedChoiceIdx, setSelectedChoiceIdx] = useState(0);
      const [isTtsEnabled, setIsTtsEnabled] = useState(false);

      const bgMusicRef = useRef(null);
      const sfxRef = useRef(null);

      const scene = storyData[currentSceneId];

      // Preload all images on mount for instant transitions
      useEffect(() => {
            const images = new Set();
            Object.values(storyData).forEach(s => {
                  if (s.bgImage) images.add(s.bgImage);
                  if (s.npcSprite) images.add(s.npcSprite);
                  if (s.eventCG) images.add(s.eventCG);
            });
            images.forEach(src => {
                  const img = new Image();
                  img.src = src;
            });
      }, []);

      useEffect(() => {
            if (!scene) return;

            if (scene.bgMusic && bgMusicRef.current) {
                  if (bgMusicRef.current.src !== window.location.origin + scene.bgMusic) {
                        bgMusicRef.current.src = scene.bgMusic;
                        bgMusicRef.current.play().catch(e => console.warn("Audio blocked", e));
                  }
            }

            if (scene.soundEffect) {
                  // Se for um MP4 existente em /assets/, toca no player HTMl5 normal.
                  // Se for os novos nomes de SFX Matemáticos (doors, etc), cai no synth.
                  if (scene.soundEffect.includes('.mp4') || scene.soundEffect.includes('.mp3')) {
                        if (sfxRef.current) {
                              sfxRef.current.src = scene.soundEffect;
                              sfxRef.current.play().catch(e => console.warn("SFX blocked", e));
                        }
                  } else {
                        // Web Audio API Synthesizer
                        try {
                              const AudioContext = window.AudioContext || window.webkitAudioContext;
                              const ctx = new AudioContext();
                              const osc = ctx.createOscillator();
                              const gainNode = ctx.createGain();

                              osc.connect(gainNode);
                              gainNode.connect(ctx.destination);

                              const now = ctx.currentTime;
                              const soundName = scene.soundEffect;

                              if (soundName.includes('doors_opening') || soundName.includes('bag_rumble')) {
                                    // Som de atrito/hidráulica grave (Ruído simulado)
                                    osc.type = 'triangle';
                                    osc.frequency.setValueAtTime(50, now);
                                    osc.frequency.linearRampToValueAtTime(10, now + 0.8);
                                    gainNode.gain.setValueAtTime(0.4, now);
                                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                                    osc.start(now);
                                    osc.stop(now + 0.8);
                              }
                              else if (soundName.includes('print_success')) {
                                    // Motores de passo (Impressora 3D da SME) - Alternando frequências rápido
                                    osc.type = 'square';
                                    osc.frequency.setValueAtTime(400, now);
                                    osc.frequency.setValueAtTime(600, now + 0.1);
                                    osc.frequency.setValueAtTime(400, now + 0.2);
                                    osc.frequency.setValueAtTime(800, now + 0.3);
                                    gainNode.gain.setValueAtTime(0.15, now);
                                    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
                                    osc.start(now);
                                    osc.stop(now + 0.5);
                              }
                              else if (soundName.includes('funk_blare')) {
                                    // O rádio quebrado tocando alto (Distorção caótica proposital para a piada)
                                    osc.type = 'sawtooth';
                                    // Modulação rápida para soar quebrado
                                    for (let i = 0; i < 10; i++) {
                                          osc.frequency.setValueAtTime(150 + (Math.random() * 200), now + (i * 0.1));
                                    }
                                    gainNode.gain.setValueAtTime(0.5, now); // Volume estourado de propósito
                                    gainNode.gain.linearRampToValueAtTime(0.01, now + 1.0); // Dura 1 segundo e corta
                                    osc.start(now);
                                    osc.stop(now + 1.0);
                              }
                        } catch (e) {
                              console.warn("Web Audio API fallhou.", e);
                        }
                  }
            }

            setIsTyping(true);
      }, [currentSceneId, scene]);

      // TTS Narration for Accessibility
      useEffect(() => {
            if (!isTtsEnabled || !scene || scene.text === "") return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(scene.text);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
      }, [currentSceneId, isTtsEnabled, scene]);

      if (!scene) {
            return <div className="text-red-500 font-bold p-10 flex h-screen items-center justify-center bg-black">ERROR: Cena '{currentSceneId}' não encontrada. Fim da Rota?</div>;
      }

      const handleChoice = (choice) => {
            window.speechSynthesis.cancel();
            if (choice.nextScene === 'title_screen') {
                  setInventory([]);
            } else if (choice.gainItem && !inventory.includes(choice.gainItem)) {
                  setInventory([...inventory, choice.gainItem]);
            }
            setCurrentSceneId(choice.nextScene);
      };

      const availableChoices = scene.choices.filter(choice => {
            if (choice.requiredItem) {
                  return inventory.includes(choice.requiredItem);
            }
            return true;
      });

      // Keyboard/Arcade Navigation
      useEffect(() => {
            const handleKeyDown = (e) => {
                  if (isTyping && scene.text !== "") {
                        // Any key skips the typewriter effect
                        if (['Enter', ' ', 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
                              e.preventDefault();
                              setIsTyping(false);
                        }
                        return;
                  }

                  switch (e.key) {
                        case 'ArrowUp':
                        case 'ArrowLeft':
                              e.preventDefault();
                              setSelectedChoiceIdx(prev => (prev > 0 ? prev - 1 : availableChoices.length - 1));
                              break;
                        case 'ArrowDown':
                        case 'ArrowRight':
                              e.preventDefault();
                              setSelectedChoiceIdx(prev => (prev < availableChoices.length - 1 ? prev + 1 : 0));
                              break;
                        case 'Enter':
                        case ' ':
                              e.preventDefault();
                              if (availableChoices.length > 0) {
                                    handleChoice(availableChoices[selectedChoiceIdx]);
                              }
                              break;
                  }
            };

            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
      }, [isTyping, availableChoices, selectedChoiceIdx, scene.text]);

      // Reset selection when scene changes
      useEffect(() => {
            setSelectedChoiceIdx(0);
      }, [currentSceneId]);

      const themeClasses = {
            clean: "glass-panel border-t-2 border-blue-400/50 text-blue-50",
            glitch: "glass-panel border-t-2 border-red-500/60 text-red-100",
            distopic: "glass-panel border-t-2 border-emerald-400/50 text-emerald-50",
            cyber: "glass-panel border-t-2 border-fuchsia-400/50 text-purple-100"
      };

      const uiBoxClass = themeClasses[scene.uiTheme] || themeClasses.clean;
      const btnGlow = scene.uiTheme === 'glitch' ? 'glow-red'
            : scene.uiTheme === 'distopic' ? 'glow-emerald'
                  : scene.uiTheme === 'cyber' ? 'glow-purple'
                        : 'glow-blue';
      const gradientText = scene.uiTheme === 'glitch' ? 'gradient-text-red'
            : scene.uiTheme === 'distopic' ? 'gradient-text-emerald'
                  : scene.uiTheme === 'cyber' ? 'gradient-text-purple'
                        : 'gradient-text-blue';

      // Identificação do Trait Selecionado
      const hasTactical = inventory.includes("trait_hacker");
      const hasEngineer = inventory.includes("trait_engineer");
      const hasVoice = inventory.includes("trait_diplomat");
      const hasBio = inventory.includes("trait_bio");

      // Animação de Tremor (Screen Shake) baseada no tema Glitch
      const shakeAnimation = scene.uiTheme === 'glitch' ? {
            x: [0, -10, 10, -10, 10, 0],
            y: [0, 5, -5, 5, -5, 0],
            transition: { duration: 0.4, repeat: Infinity, repeatType: "mirror" }
      } : {};

      return (
            <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
                  <motion.div
                        className="relative w-full h-full max-w-[calc(100vh*16/9)] max-h-[calc(100vw*9/16)] flex flex-col justify-end bg-black overflow-hidden shadow-2xl scanline-overlay vignette"
                        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                        animate={shakeAnimation}
                  >

                        {/* Imagem de Fundo (Background) ou Event CG com Crossfade suave */}
                        <AnimatePresence mode="wait">
                              <motion.div
                                    key={scene.eventCG || scene.bgImage}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{
                                          backgroundImage: `url(${scene.eventCG || scene.bgImage})`,
                                          willChange: 'opacity, transform',
                                          transform: 'translateZ(0)',
                                          imageRendering: 'auto',
                                          backfaceVisibility: 'hidden'
                                    }}
                              />
                        </AnimatePresence>

                        {/* Tonalidade Atmosférica e Gradiente de Legibilidade */}
                        {!scene.eventCG && (
                              <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${scene.uiTheme === 'glitch' ? 'bg-red-950/20' :
                                    scene.uiTheme === 'distopic' ? 'bg-emerald-950/30' :
                                          scene.uiTheme === 'cyber' ? 'bg-fuchsia-950/20' : 'bg-transparent'
                                    }`} />
                        )}

                        {/* Sombra Baixa para Garantir Leitura Perfeita Sempre */}
                        <div className="absolute bottom-0 w-full h-[60vh] bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-0" />

                        {/* NPC Sprite Opcional com Entrada Dramática / Fade */}
                        <AnimatePresence>
                              {!scene.eventCG && scene.npcSprite && (
                                    <motion.div
                                          key={scene.npcSprite}
                                          initial={{ opacity: 0, y: 50 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: 30 }}
                                          transition={{ duration: 0.6, ease: "backOut" }}
                                          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:left-[10%] max-w-sm pointer-events-none z-0"
                                    >
                                          <img
                                                src={scene.npcSprite}
                                                alt={scene.speakerName}
                                                className="h-[75vh] object-contain drop-shadow-[0_0_25px_rgba(0,0,0,0.9)]"
                                                style={{ willChange: 'opacity, transform', transform: 'translateZ(0)', imageRendering: 'auto' }}
                                          />
                                    </motion.div>
                              )}
                        </AnimatePresence>

                        {/* Audio Setup */}
                        <audio ref={bgMusicRef} loop />
                        <audio ref={sfxRef} />

                        {/* Caixa de Diálogo Cinematográfica (Escondida se for o Pôster Inicial) */}
                        {scene.text !== "" && (
                              <motion.div
                                    key={scene.speakerName + currentSceneId}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className={`relative w-full z-10 p-6 md:p-10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] ${uiBoxClass}`}
                              >
                                    <div className="max-w-6xl mx-auto flex flex-col gap-5">
                                          {/* Status Trait Icon (O Segredo do Protagonista) */}
                                          {(hasTactical || hasEngineer || hasVoice || hasBio) && (
                                                <motion.div
                                                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                      className="absolute -top-14 right-4 md:right-10 flex items-center gap-3 bg-black/90 backdrop-blur px-5 py-2 border border-gray-600 rounded-lg shadow-2xl text-sm md:text-base text-gray-200"
                                                >
                                                      {hasTactical && <><Cpu size={18} className="text-cyan-400" /> Overclocking Cognitivo</>}
                                                      {hasEngineer && <><Eye size={18} className="text-yellow-400" /> Malha Urbana</>}
                                                      {hasVoice && <><HeartHandshake size={18} className="text-emerald-400" /> Diplomacia Viva</>}
                                                      {hasBio && <><Map size={18} className="text-green-400" /> Bio-Restauração</>}
                                                </motion.div>
                                          )}

                                          {/* Nome do Personagem (Cyberpunk Orbitron Font) */}
                                          <div className={`font-cyber text-2xl md:text-3xl tracking-widest drop-shadow-md ${gradientText}`}
                                                style={{ fontFamily: "'Orbitron', monospace" }}>
                                                {scene.speakerName}
                                          </div>

                                          {/* Texto Principal (Typing Effect) */}
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

                        {/* Botões de Escolha Rápidos e Bonitos + Toggle de Acessibilidade no Título */}
                        <div className={`relative z-20 w-full max-w-6xl mx-auto px-6 md:px-10 pb-10 mt-6 flex flex-col gap-3 transition-opacity duration-500 ${!isTyping || scene.text === "" ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                              {/* TTS Toggle on Title Screen */}
                              {currentSceneId === 'title_screen' && (!isTyping || scene.text === "") && (
                                    <motion.button
                                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                          onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                                          className={`self-center mb-2 px-6 py-3 rounded-full text-lg font-bold transition-all border-2 ${isTtsEnabled ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-black/60 border-gray-500 text-gray-300 hover:border-white'
                                                }`}
                                    >
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
                                                whileHover={{ scale: 1.01, x: 10, boxShadow: "0px 0px 15px rgba(255,255,255,0.2)" }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleChoice(choice)}
                                                className={`text-left px-6 py-5 rounded-xl btn-premium ${btnGlow} font-semibold text-xl md:text-2xl focus:outline-none flex items-center gap-4 ${idx === selectedChoiceIdx ? 'arcade-selected' : ''}`}
                                          >
                                                <span className={`w-2.5 h-2.5 rounded-full ${scene.uiTheme === 'glitch' ? 'bg-red-400' : scene.uiTheme === 'distopic' ? 'bg-emerald-400' : scene.uiTheme === 'cyber' ? 'bg-fuchsia-400' : 'bg-blue-400'} shadow-lg`} />
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
