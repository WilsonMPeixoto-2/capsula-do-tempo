import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// A simple plane that displays the background image with some subtle 3D parallax
const BackgroundPlane = ({ imageUrl, isGlitching }) => {
      // Create a default white texture to show while loading or if it fails
      const defaultTexture = useMemo(() => new THREE.CanvasTexture(document.createElement('canvas')), []);
      let url = imageUrl || '';
      if (!url) url = '/placeholder.jpg'; // We can safely assume placeholder if null

      const texture = useTexture(url, (t) => {
            t.colorSpace = THREE.SRGBColorSpace;
            t.generateMipmaps = true;
            t.minFilter = THREE.LinearMipMapLinearFilter;
            t.magFilter = THREE.LinearFilter;
            t.anisotropy = 16;
      });

      const materialRef = useRef();
      const groupRef = useRef();

      useFrame((state) => {
            // Subtle breathing and mouse parallax
            if (groupRef.current) {
                  const t = state.clock.elapsedTime;
                  groupRef.current.position.y = Math.sin(t * 0.5) * 0.05;
                  
                  // Interactive parallax based on mouse
                  groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (state.pointer.x * Math.PI) / 40, 0.05);
                  groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (-state.pointer.y * Math.PI) / 40, 0.05);
            }
      });

      return (
            <group ref={groupRef}>
                   {/* We scale the plane relative to the distance to fill the FOV height (tan(30) * 8 * 2 = 9.23) */}
                  <mesh position={[0, 0, -1]}>
                        <planeGeometry args={[18, 10]} />
                        <meshBasicMaterial 
                              ref={materialRef} 
                              map={texture || defaultTexture} 
                              transparent={true}
                              toneMapped={false} 
                        />
                  </mesh>
            </group>
      );
};

const PostProcessingEffects = ({ theme }) => {
      const isGlitch = theme === 'glitch';
      const isCyber = theme === 'cyber';
      
      return (
            <EffectComposer disableNormalPass>
                  {/* Master Bloom for OLED intensity - lowered to prevent washout */}
                  <Bloom 
                        intensity={isCyber ? 1.0 : (isGlitch ? 0.8 : 0.4)} 
                        luminanceThreshold={0.5} 
                        luminanceSmoothing={0.9} 
                        blendFunction={BlendFunction.SCREEN} 
                        mipmapBlur 
                  />
                  {/* Cinematic Vignette - Much subtler to maintain original image brightness */}
                  <Vignette 
                        eskil={false} 
                        offset={0.5} 
                        darkness={0.3} 
                        blendFunction={BlendFunction.MULTIPLY} 
                  />
            </EffectComposer>
      );
};

// Main 3D Canvas
const Scene3D = ({ imageUrl, theme }) => {
      return (
            <div className="canvas-layer">
                  <Canvas
                        camera={{ position: [0, 0, 7], fov: 60 }}
                        gl={{
                              antialias: true,
                              toneMapping: THREE.NoToneMapping,
                              outputColorSpace: THREE.SRGBColorSpace,
                              powerPreference: 'high-performance'
                        }}
                  >
                        <React.Suspense fallback={null}>
                              <BackgroundPlane imageUrl={imageUrl} isGlitching={theme === 'glitch'} />
                              <PostProcessingEffects theme={theme} />
                        </React.Suspense>
                  </Canvas>
            </div>
      );
};

export default Scene3D;
