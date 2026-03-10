import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const PhaserGame = ({ width = 800, height = 600, sceneConfig, onGameReady }) => {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width,
      height,
      parent: containerRef.current,
      scene: sceneConfig,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    gameRef.current = new Phaser.Game(config);
    if (onGameReady) onGameReady(gameRef.current);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty: Phaser game initializes once per mount

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default PhaserGame;
