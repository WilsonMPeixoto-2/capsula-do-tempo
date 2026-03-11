import React from 'react';
import VisualNovelEngine from './components/VisualNovelEngine';
import { GameProvider } from './context/GameContext';

function App() {
      return (
            <GameProvider>
                  <div className="game-container">
                        <div className="game-stage">
                              <VisualNovelEngine />
                        </div>
                  </div>
            </GameProvider>
      );
}

export default App;
