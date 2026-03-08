import React from 'react';
import VisualNovelEngine from './components/VisualNovelEngine';

function App() {
      return (
            <div className="w-full h-screen bg-black flex items-center justify-center select-none text-white overflow-hidden">
                  <div className="relative w-full h-full max-w-[calc(100vh*16/9)] max-h-[calc(100vw*9/16)] border-x border-zinc-900/50 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden">
                        <VisualNovelEngine />
                  </div>
            </div>
      );
}

export default App;
