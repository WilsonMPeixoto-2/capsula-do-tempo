import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldAlert, Cpu, HeartHandshake, Eye, Map, Menu, X, Home, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import storyData from '../data/storyData.json';

/* ============================================
   AMBIENT AUDIO SYNTHESIZER ENGINE
   Generates all BGM + SFX mathematically
   ============================================ */
class AmbientAudioEngine {
      constructor() {
            this.ctx = null;
            this.currentDrone = null;
            this.noiseNode = null;
            this.masterGain = null;
      }

      init() {
            if (this.ctx) return;
            const AC = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AC();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.25;
            this.masterGain.connect(this.ctx.destination);
      }

      stopAll() {
            if (this.currentDrone) {
                  try { this.currentDrone.forEach(n => { try { n.stop(); } catch (e) { } }); } catch (e) { }
                  this.currentDrone = null;
            }
      }

      // Cyberpunk ambient drone — deep bass + detuned pad
      playCyberpunkDrone() {
            this.init(); this.stopAll();
            const nodes = [];
            // Deep sub bass
            const bass = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bass.type = 'triangle'; bass.frequency.value = 40;
            bassGain.gain.value = 0.3;
            bass.connect(bassGain); bassGain.connect(this.masterGain);
            bass.start(); nodes.push(bass);
            // Eerie pad
            const pad = this.ctx.createOscillator();
            const padGain = this.ctx.createGain();
            pad.type = 'sine'; pad.frequency.value = 110;
            pad.detune.value = -15;
            padGain.gain.value = 0.1;
            pad.connect(padGain); padGain.connect(this.masterGain);
            pad.start(); nodes.push(pad);
            // High eerie tone
            const high = this.ctx.createOscillator();
            const highGain = this.ctx.createGain();
            high.type = 'sine'; high.frequency.value = 880;
            highGain.gain.value = 0.03;
            high.connect(highGain); highGain.connect(this.masterGain);
            // Slow LFO on high tone
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.type = 'sine'; lfo.frequency.value = 0.3;
            lfoGain.gain.value = 200;
            lfo.connect(lfoGain); lfoGain.connect(high.frequency);
            lfo.start(); high.start();
            nodes.push(high, lfo);
            this.currentDrone = nodes;
      }

      // Tension drone — dissonant and unsettling
      playTensionDrone() {
            this.init(); this.stopAll();
            const nodes = [];
            const o1 = this.ctx.createOscillator();
            const g1 = this.ctx.createGain();
            o1.type = 'sawtooth'; o1.frequency.value = 55;
            g1.gain.value = 0.12;
            o1.connect(g1); g1.connect(this.masterGain);
            o1.start(); nodes.push(o1);
            // Dissonant second
            const o2 = this.ctx.createOscillator();
            const g2 = this.ctx.createGain();
            o2.type = 'square'; o2.frequency.value = 58.27; // Minor 2nd
            g2.gain.value = 0.06;
            o2.connect(g2); g2.connect(this.masterGain);
            o2.start(); nodes.push(o2);
            // Rumbling LFO
            const lfo = this.ctx.createOscillator();
            const lfoG = this.ctx.createGain();
            lfo.type = 'sine'; lfo.frequency.value = 0.5;
            lfoG.gain.value = 0.08;
            lfo.connect(lfoG); lfoG.connect(this.masterGain);
            lfo.start(); nodes.push(lfo);
            this.currentDrone = nodes;
      }

      // Clean/Utopian ambient — warm and hopeful
      playCleanDrone() {
            this.init(); this.stopAll();
            const nodes = [];
            // Warm pad
            const o1 = this.ctx.createOscillator();
            const g1 = this.ctx.createGain();
            o1.type = 'sine'; o1.frequency.value = 220;
            g1.gain.value = 0.08;
            o1.connect(g1); g1.connect(this.masterGain);
            o1.start(); nodes.push(o1);
            // Perfect fifth harmony
            const o2 = this.ctx.createOscillator();
            const g2 = this.ctx.createGain();
            o2.type = 'sine'; o2.frequency.value = 330;
            g2.gain.value = 0.05;
            o2.connect(g2); g2.connect(this.masterGain);
            o2.start(); nodes.push(o2);
            // Soft shimmer
            const o3 = this.ctx.createOscillator();
            const g3 = this.ctx.createGain();
            o3.type = 'sine'; o3.frequency.value = 660;
            g3.gain.value = 0.02;
            o3.connect(g3); g3.connect(this.masterGain);
            o3.start(); nodes.push(o3);
            this.currentDrone = nodes;
      }

      // SFX: Alarm siren
      playAlarm() {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            const now = this.ctx.currentTime;
            for (let i = 0; i < 8; i++) {
                  osc.frequency.setValueAtTime(800, now + i * 0.25);
                  osc.frequency.setValueAtTime(400, now + i * 0.25 + 0.125);
            }
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 2);
            osc.connect(gain); gain.connect(this.masterGain);
            osc.start(now); osc.stop(now + 2);
      }

      // SFX: Door opening (hydraulic)
      playDoor() {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(60, now);
            osc.frequency.linearRampToValueAtTime(15, now + 1.2);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
            osc.connect(gain); gain.connect(this.masterGain);
            osc.start(now); osc.stop(now + 1.2);
      }

      // SFX: Success chime
      playSuccess() {
            this.init();
            const now = this.ctx.currentTime;
            [523, 659, 784, 1047].forEach((freq, i) => {
                  const osc = this.ctx.createOscillator();
                  const gain = this.ctx.createGain();
                  osc.type = 'sine';
                  osc.frequency.value = freq;
                  gain.gain.setValueAtTime(0.15, now + i * 0.15);
                  gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.4);
                  osc.connect(gain); gain.connect(this.masterGain);
                  osc.start(now + i * 0.15);
                  osc.stop(now + i * 0.15 + 0.4);
            });
      }

      // SFX: Glitch distortion
      playGlitch() {
            this.init();
            const now = this.ctx.currentTime;
            for (let i = 0; i < 6; i++) {
                  const osc = this.ctx.createOscillator();
                  const gain = this.ctx.createGain();
                  osc.type = 'sawtooth';
                  osc.frequency.value = 100 + Math.random() * 800;
                  gain.gain.setValueAtTime(0.15, now + i * 0.08);
                  gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.06);
                  osc.connect(gain); gain.connect(this.masterGain);
                  osc.start(now + i * 0.08);
                  osc.stop(now + i * 0.08 + 0.06);
            }
      }

      // SFX: 3D Printer
      playPrint() {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            osc.type = 'square';
            [400, 600, 400, 800, 500, 700].forEach((f, i) => osc.frequency.setValueAtTime(f, now + i * 0.08));
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
            osc.connect(gain); gain.connect(this.masterGain);
            osc.start(now); osc.stop(now + 0.5);
      }

      // SFX: Funk blare (broken radio)
      playFunk() {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            osc.type = 'sawtooth';
            for (let i = 0; i < 10; i++) {
                  osc.frequency.setValueAtTime(150 + Math.random() * 200, now + i * 0.1);
            }
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 1.0);
            osc.connect(gain); gain.connect(this.masterGain);
            osc.start(now); osc.stop(now + 1.0);
      }

      setVolume(v) {
            if (this.masterGain) this.masterGain.gain.value = v;
      }
}

const audioEngine = new AmbientAudioEngine();

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
            if (!scene || isMuted) { audioEngine.stopAll(); return; }

            // Determine which ambient drone to play
            const theme = scene.uiTheme || 'clean';
            let droneKey = theme;

            // Don't restart the same drone
            if (droneKey === lastDroneRef.current) {
                  // But still play SFX
            } else {
                  lastDroneRef.current = droneKey;
                  switch (theme) {
                        case 'glitch': audioEngine.playTensionDrone(); break;
                        case 'distopic': audioEngine.playCyberpunkDrone(); break;
                        case 'cyber': audioEngine.playCyberpunkDrone(); break;
                        case 'clean': audioEngine.playCleanDrone(); break;
                        default: audioEngine.playCleanDrone();
                  }
            }

            // SFX based on soundEffect string
            if (scene.soundEffect) {
                  const sfx = scene.soundEffect.toLowerCase();
                  if (sfx.includes('alarm')) audioEngine.playAlarm();
                  else if (sfx.includes('door') || sfx.includes('bag')) audioEngine.playDoor();
                  else if (sfx.includes('success') || sfx.includes('clean')) audioEngine.playSuccess();
                  else if (sfx.includes('print')) audioEngine.playPrint();
                  else if (sfx.includes('funk')) audioEngine.playFunk();
                  else if (sfx.includes('glitch')) audioEngine.playGlitch();
                  else if (sfx.includes('power') || sfx.includes('shock')) audioEngine.playDoor();
            }

            // Play Rio_do_Futuro.mp4 if scene references the actual file
            if (scene.bgMusic && scene.bgMusic.includes('Rio_do_Futuro') && bgMusicRef.current) {
                  if (bgMusicRef.current.src !== window.location.origin + scene.bgMusic) {
                        bgMusicRef.current.src = scene.bgMusic;
                        bgMusicRef.current.volume = 0.3;
                        bgMusicRef.current.play().catch(() => { });
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
            audioEngine.stopAll();
            lastDroneRef.current = '';
            setCurrentSceneId('title_screen');
            setInventory([]);
            setSceneHistory([]);
            setIsMenuOpen(false);
      };

      const toggleMute = () => {
            setIsMuted(m => {
                  if (!m) { audioEngine.stopAll(); if (bgMusicRef.current) bgMusicRef.current.pause(); }
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

      // Color vibrancy filter per theme
      const colorFilter = scene.uiTheme === 'glitch'
            ? 'saturate(1.3) contrast(1.15) brightness(1.05)'
            : scene.uiTheme === 'distopic'
                  ? 'saturate(1.4) contrast(1.1) brightness(1.02)'
                  : scene.uiTheme === 'cyber'
                        ? 'saturate(1.35) contrast(1.1) brightness(1.05)'
                        : 'saturate(1.2) contrast(1.05) brightness(1.03)';

      return (
            <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
                  <motion.div
                        className="relative w-full h-full flex flex-col justify-end bg-black overflow-hidden shadow-2xl scanline-overlay vignette"
                        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                        animate={shakeAnimation}
                  >
                        {/* Background */}
                        <AnimatePresence mode="wait">
                              <motion.div
                                    key={scene.eventCG || scene.bgImage}
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                    className="absolute inset-0"
                                    style={{ willChange: 'opacity, transform' }}
                              >
                                    <img
                                          src={scene.eventCG || scene.bgImage}
                                          alt=""
                                          className="w-full h-full"
                                          style={{
                                                objectFit: 'cover',
                                                objectPosition: 'center top',
                                                transform: 'translateZ(0)',
                                                backfaceVisibility: 'hidden',
                                                filter: colorFilter
                                          }}
                                    />
                              </motion.div>
                        </AnimatePresence>

                        {/* Weather Effects */}
                        {showRain && <RainEffect />}
                        {showLightning && <LightningFlash />}
                        <FloatingParticles theme={scene.uiTheme || 'clean'} />

                        {/* Atmospheric Tint */}
                        {!scene.eventCG && (
                              <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${scene.uiTheme === 'glitch' ? 'bg-red-950/20' :
                                    scene.uiTheme === 'distopic' ? 'bg-emerald-950/30' :
                                          scene.uiTheme === 'cyber' ? 'bg-fuchsia-950/20' : 'bg-transparent'
                                    }`} />
                        )}

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
                                                whileHover={{ scale: 1.01, x: 10, boxShadow: "0px 0px 20px rgba(255,255,255,0.15)" }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleChoice(choice)}
                                                className={`text-left px-6 py-5 rounded-xl btn-premium ${btnGlow} font-semibold text-xl md:text-2xl focus:outline-none flex items-center gap-4 ${idx === selectedChoiceIdx ? 'arcade-selected' : ''}`}
                                          >
                                                <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-lg`} />
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
