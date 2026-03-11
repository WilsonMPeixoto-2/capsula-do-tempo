import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';

const AvatarRenderer = ({ options }) => {
      const { gender, skin, style } = options;

      // Construct the expected file name based on the combination of 16 avatars
      // Example: avatar_m_light_tech.jpg
      const [imgError, setImgError] = useState(false);
      const [extension, setExtension] = useState('png');

      // Reset error state and try png first when options change
      React.useEffect(() => {
            setImgError(false);
            setExtension('png');
      }, [options]);

      const imgName = `avatar_${gender}_${skin}_${style}.${extension}`;
      const imgPath = `/avatars/${imgName}`;

      const handleImgError = () => {
            if (extension === 'png') {
                  setExtension('jpg'); // Try JPG if PNG fails
            } else {
                  setImgError(true); // Both failed
            }
      };

      return (
            <div className="w-full h-full relative flex items-center justify-center p-4">
                  <AnimatePresence mode="wait">
                        <motion.div
                              key={imgName}
                              initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                              transition={{ duration: 0.6, ease: "easeInOut" }}
                              className="w-full max-h-[80%] aspect-[3/4] relative rounded-lg overflow-hidden border-2 border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-black/50"
                        >
                              {/* Futuristic Scanline Overlay */}
                              <div className="absolute inset-0 pointer-events-none z-10 scanline-overlay mix-blend-overlay opacity-30"></div>
                              
                              <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>

                              {!imgError ? (
                                    <img 
                                          src={imgPath} 
                                          alt="Avatar" 
                                          className="w-full h-full object-cover object-top filter contrast-125 saturate-110"
                                          onError={handleImgError}
                                    />
                              ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-primary/50 relative overflow-hidden">
                                          <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                                          <User size={80} className="mb-4 drop-shadow-[0_0_15px_rgba(0,255,204,0.5)]" />
                                          <p className="text-sm font-cyber font-bold tracking-widest text-center px-4">
                                                IMAGEM DE ORIGEM {imgName.toUpperCase()} NÃO LOCALIZADA
                                          </p>
                                          <p className="text-xs text-text-muted text-center mt-2 px-6">
                                                *Adicione a imagem 4K na pasta /public/avatars/ com este nome para conectar a interface neural.
                                          </p>
                                    </div>
                              )}
                              
                              {/* Decorative HUD Elements */}
                              <div className="absolute top-2 left-2 text-[10px] text-primary/80 font-cyber tracking-widest z-20">
                                    NEXO // ID: {gender.toUpperCase()}-{skin.toUpperCase()}-{style.toUpperCase()}
                              </div>
                              <div className="absolute bottom-2 right-2 w-12 h-1 bg-primary/80 rounded-full z-20 shadow-[0_0_10px_#00FFCC]"></div>
                        </motion.div>
                  </AnimatePresence>
            </div>
      );
};

export default AvatarRenderer;
