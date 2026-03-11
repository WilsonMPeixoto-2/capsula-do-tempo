import React, { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
      const [avatar, setAvatar] = useState({
            gender: 'm',
            skin: 'light',
            style: 'tech',
      });

      const updateAvatar = (key, value) => {
            setAvatar(prev => ({ ...prev, [key]: value }));
      };

      return (
            <GameContext.Provider value={{
                  avatar,
                  updateAvatar
            }}>
                  {children}
            </GameContext.Provider>
      );
};
