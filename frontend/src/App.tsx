import React, { useEffect, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import { ChatPanel } from './components/ChatPanel';
import { SidePanel } from './components/SidePanel';
import { TopBar } from './components/TopBar';
import './styles/globals.css';
import './styles/theme.css';

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const particles: { x: number; y: number; speed: number; delay: number }[] = [];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 3 + Math.random() * 4,
        delay: Math.random() * 3,
      });
    }

    particles.forEach((particle) => {
      const particleEl = document.createElement('div');
      particleEl.className = 'particle';
      particleEl.style.left = `${particle.x}%`;
      particleEl.style.top = `${particle.y}%`;
      particleEl.style.animationDuration = `${particle.speed}s`;
      particleEl.style.animationDelay = `${particle.delay}s`;
      canvasRef.current?.appendChild(particleEl);
    });

    return () => {
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={canvasRef} className="particle-bg" />;
};

export const App: React.FC = () => {
  const {
    gameState,
    sendMessage,
    createNewCampaign,
    addCharacter,
    updateCharacter,
    removeCharacter,
    addLocation,
    updateLocation,
    removeLocation,
    generateCharacterContent,
    generateLocationContent,
    generateImage,
    isLoading,
  } = useGameState();

  const handleNewCampaign = async (
    campaignName: string,
    playerName: string,
    playerRole: string
  ) => {
    await createNewCampaign(campaignName, playerName, playerRole);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-dark relative">
      <ParticleBackground />

      <div className="relative z-10 h-full flex flex-col">
        <TopBar
          campaignName={gameState.campaignName}
          onNewCampaign={handleNewCampaign}
        />

        <div className="flex-1 flex gap-6 p-6 overflow-hidden">
          <div className="flex-[6] glass rounded-2xl overflow-hidden shadow-2xl">
            <ChatPanel
              messages={gameState.messages}
              onSendMessage={sendMessage}
              isLoading={isLoading || gameState.isLoading}
            />
          </div>

          <div className="flex-[4]">
            <SidePanel
              playerState={gameState.playerState}
              characters={gameState.characters}
              locations={gameState.locations}
              onAddCharacter={addCharacter}
              onUpdateCharacter={updateCharacter}
              onDeleteCharacter={removeCharacter}
              onAddLocation={addLocation}
              onUpdateLocation={updateLocation}
              onDeleteLocation={removeLocation}
              onGenerateCharacterContent={generateCharacterContent}
              onGenerateLocationContent={generateLocationContent}
              onGenerateImage={generateImage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
