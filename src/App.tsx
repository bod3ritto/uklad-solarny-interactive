import React, { useState } from 'react';
import PlanetarySystem from './PlanetarySystem';
import { ArrowLeft } from 'lucide-react';

const COLOR_PRESETS = [
  { name: "Fiolet", value: "#a78bfa" },
  { name: "Morska Zorza", value: "#38bdf8" },
  { name: "Szmaragd", value: "#34d399" },
  { name: "Bursztyn", value: "#fbbf24" },
  { name: "Fuksja", value: "#e879f9" },
];

export default function App() {
  const [currentColor, setCurrentColor] = useState("#a78bfa");

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#09090b]">
      <div className="absolute top-4 inset-x-4 z-10 flex flex-wrap items-center justify-between gap-3 sm:top-6 sm:px-6 pointer-events-none">
        <div className="pointer-events-auto">
          <a href="#" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-black/40 px-3.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm text-text-secondary backdrop-blur-md transition-colors hover:border-accent/40 hover:text-text-primary">
            <ArrowLeft size={16} /> Powrót do projektów
          </a>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-black/40 px-3.5 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md">
          <span className="text-xs text-text-muted">Motyw:</span>
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setCurrentColor(preset.value)}
              style={{ backgroundColor: preset.value }}
              className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full transition-transform hover:scale-125 ${
                currentColor === preset.value
                  ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                  : "opacity-70 hover:opacity-100"
              }`}
              title={preset.name}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 sm:bottom-12 left-1/2 z-10 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 text-center px-4">
        <h1 className="text-xl font-bold text-text-primary sm:text-3xl">
          Interaktywny Układ Solarny
        </h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-text-secondary">
          Wybierz schemat kolorów. Najedź na planety, aby je spowolnić.
        </p>
      </div>

      <div className="flex h-full min-h-screen w-full items-center justify-center p-4 sm:p-8">
        <div className="aspect-square w-full max-w-[320px] xs:max-w-[400px] sm:max-w-[600px]">
          <PlanetarySystem customColor={currentColor} />
        </div>
      </div>
    </div>
  );
}
