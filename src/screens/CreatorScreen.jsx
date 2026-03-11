import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import AvatarRenderer from '../components/AvatarRenderer';
import { Palette, Layers, UserCircle, Sparkles, ChevronRight } from 'lucide-react';

const AvatarCreatorScreen = ({ onComplete }) => {
      const { avatar, updateAvatar } = useGame();

      // Tabs: 'gender', 'skin', 'style'
      const [activeTab, setActiveTab] = useState('gender');
      const [showPowerPrompt, setShowPowerPrompt] = useState(false);

      // Efeitos Sonoros Simples (Clicks)
      const playClick = () => {
            try {
                  const ctx = new (window.AudioContext || window.webkitAudioContext)();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.frequency.setValueAtTime(400, ctx.currentTime);
                  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
                  gain.gain.setValueAtTime(0.05, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.1);
            } catch (e) { }
      };

      const handleSelect = (category, value) => {
            updateAvatar(category, value);
            playClick();
      };

      const handleNextTab = () => {
            playClick();
            if (activeTab === 'gender') setActiveTab('skin');
            else if (activeTab === 'skin') setActiveTab('style');
            else if (activeTab === 'style') {
                  setShowPowerPrompt(true);
            }
      };

      const nextPhase = () => {
            playClick();
            if (onComplete) onComplete();
      };

      const tabs = [
            { id: 'gender', label: 'Matriz', icon: <UserCircle size={18} /> },
            { id: 'skin', label: 'Etnia', icon: <Palette size={18} /> },
            { id: 'style', label: 'Estilo', icon: <Layers size={18} /> }
      ];

      const options = {
            gender: [
                  { id: 'm', color: '#5e9dd3', name: 'Masculina' },
                  { id: 'f', color: '#ff7675', name: 'Feminina' },
            ],
            skin: [
                  { id: 'light', color: '#f9d2b8', name: 'Auroral' },
                  { id: 'dark', color: '#8b5a2b', name: 'Terreal' }
            ],
            style: [
                  { id: 'tech', color: '#00FFCC', name: 'Tecnomago' },
                  { id: 'nature', color: '#59a67a', name: 'Bio-Guardião' },
                  { id: 'casual', color: '#e88d67', name: 'Urbano' },
                  { id: 'rebel', color: '#FF2A6D', name: 'Rebelde Neon' }
            ]
      };

      return (
            <motion.div
                  className="flex-1 w-full h-full flex flex-col md:flex-row gap-6 p-4 md:p-8 pt-24 mx-auto max-w-7xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.8 }}
            >

                  {/* Esquerda: Avatar Renderizado Imagem 4K */}
                  <div className="w-full md:w-5/12 h-64 md:h-full relative flex flex-col items-center justify-center p-2 lg:p-6 overflow-hidden">
                        <h2 className="absolute top-0 text-center text-blue-400 font-cyber font-bold tracking-widest uppercase text-sm z-10 drop-shadow-md">
                              INTERFACE NEURAL NEXO
                        </h2>

                        <motion.div
                              className="w-full h-full flex items-center justify-center relative mt-4 filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        >
                              <AvatarRenderer options={avatar} />
                        </motion.div>
                  </div>

                  {/* Direita: Interface Interativa */}
                  <div className="w-full md:w-7/12 h-full flex flex-col glass-panel bg-white/5 p-6 md:p-10 border border-primary/20 backdrop-blur-xl rounded-2xl">

                        <div className="mb-8">
                              <h1 className="text-3xl md:text-4xl font-cyber font-bold text-white mb-2 flex items-center gap-3 shadow-text">
                                    Forje sua Identidade
                              </h1>
                              <p className="text-gray-300 text-lg font-semibold border-l-2 border-blue-400 pl-4">
                                    Selecione os parâmetros base da sua projeção holográfica. 
                                    A combinação destas escolhas formará seu avatar 4K.
                              </p>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-2 p-1 bg-black/40 rounded-full mb-8 border border-primary/20 shadow-inner">
                              {tabs.map((tab) => (
                                    <button
                                          key={tab.id}
                                          onClick={() => { setActiveTab(tab.id); playClick(); }}
                                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full font-bold transition-all duration-300 ${activeTab === tab.id
                                                ? 'bg-blue-500 text-black shadow-[0_0_15px_rgba(59,130,246,0.6)] transform scale-105'
                                                : 'text-white/60 hover:text-white hover:bg-white/10'
                                                }`}
                                    >
                                          {tab.icon} <span className="hidden sm:inline uppercase text-sm tracking-wider">{tab.label}</span>
                                    </button>
                              ))}
                        </div>

                        {/* Selection Area */}
                        <div className="flex-1 min-h-[50%] relative">
                              <AnimatePresence mode="wait">
                                    <motion.div
                                          key={activeTab}
                                          initial={{ opacity: 0, x: 20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: -20 }}
                                          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                    >
                                          {options[activeTab].map((item) => (
                                                <button
                                                      key={item.id}
                                                      onClick={() => handleSelect(activeTab, item.id)}
                                                      className={`
                                                            relative overflow-hidden group p-4 rounded-xl border border-white/10 
                                                            transition-all duration-300 flex flex-col items-center justify-center gap-3 min-h-[100px]
                                                            backdrop-blur-md
                                                            ${avatar[activeTab] === item.id
                                                                  ? 'border-blue-500 bg-blue-500/10 scale-100 shadow-[0_0_20px_rgba(59,130,246,0.3)] transform translate-y-[-2px]'
                                                                  : 'bg-black/40 hover:border-blue-500/50 hover:bg-blue-500/5'
                                                            }
                                                      `}
                                                >
                                                      <div
                                                            className="w-12 h-12 rounded-full shadow-inner border-2 border-white/20 flex-shrink-0"
                                                            style={{ 
                                                                  background: `linear-gradient(135deg, ${item.color}, #000)`,
                                                                  boxShadow: avatar[activeTab] === item.id ? `0 0 15px ${item.color}` : 'none'
                                                            }}
                                                      />
                                                      <span className={`font-bold uppercase tracking-widest text-sm ${avatar[activeTab] === item.id ? 'text-blue-400' : 'text-white/80 group-hover:text-white'}`}>
                                                            {item.name}
                                                      </span>

                                                      {avatar[activeTab] === item.id && (
                                                            <motion.div
                                                                  layoutId="outline_creator"
                                                                  className="absolute inset-0 border border-blue-400 rounded-xl opacity-50 pointer-events-none"
                                                                  initial={{ opacity: 0 }}
                                                                  animate={{ opacity: 1 }}
                                                                  transition={{ duration: 0.3 }}
                                                            />
                                                      )}
                                                </button>
                                          ))}
                                    </motion.div>
                              </AnimatePresence>
                        </div>

                        {/* Action Area */}
                        <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
                              <AnimatePresence mode="wait">
                                    {!showPowerPrompt ? (
                                          <button
                                                key="next"
                                                onClick={handleNextTab}
                                                className="btn-premium px-8 py-3 text-white flex items-center gap-2 rounded-lg font-bold tracking-widest uppercase hover:text-blue-400 transition-colors bg-blue-500/20 border border-blue-500/50"
                                          >
                                                {activeTab === 'gender' && 'Confirmar Matriz e Avançar'}
                                                {activeTab === 'skin' && 'Confirmar Etnia e Avançar'}
                                                {activeTab === 'style' && 'Confirmar Estilo e Avançar'}
                                                <ChevronRight />
                                          </button>
                                    ) : (
                                          <motion.button
                                                key="confirm"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                onClick={nextPhase}
                                                className="glow-blue bg-blue-500 text-white border border-blue-400 px-8 py-4 rounded-lg font-cyber font-bold text-lg tracking-widest flex items-center gap-3 uppercase cursor-pointer hover:bg-white hover:text-black transition-colors"
                                          >
                                                <Sparkles className="animate-pulse" /> Sincronizar Avatar
                                          </motion.button>
                                    )}
                              </AnimatePresence>
                        </div>

                  </div>
            </motion.div>
      );
};

export default AvatarCreatorScreen;
