import React, { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
      const [currentScreen, setCurrentScreen] = useState('creator'); // creator, story

      // Avatar State
      const [avatar, setAvatar] = useState({
            gender: 'm', // m, f
            skin: 'light', // light, dark
            style: 'tech', // tech, nature, casual, rebel
      });

      const updateAvatar = (key, value) => {
            setAvatar(prev => ({ ...prev, [key]: value }));
      };

      const navigateScreen = (screenName) => {
            setCurrentScreen(screenName);
      };

      return (
            <GameContext.Provider value={{
                  currentScreen,
                  avatar,
                  navigateScreen,
                  updateAvatar
            }}>
                  {children}
            </GameContext.Provider>
      );
};
