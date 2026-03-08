import { useState, useEffect } from "react";
import logoImg from "@/assets/keynesthub-logo.png";

interface SplashScreenProps {
  onFinished: () => void;
}

export const SplashScreen = ({ onFinished }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("hold"), 800);
    const exitTimer = setTimeout(() => setPhase("exit"), 2200);
    const doneTimer = setTimeout(() => onFinished(), 2800);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-600 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(160deg, #0f1b2d 0%, #1a365d 40%, #2d3748 100%)",
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 45%, rgba(214, 158, 46, 0.08) 0%, transparent 60%)",
        }}
      />

      {/* Logo + Text */}
      <div
        className={`relative flex flex-col items-center gap-6 transition-all duration-700 ease-out ${
          phase === "enter"
            ? "opacity-0 scale-90 translate-y-4"
            : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        <div
          className="relative"
          style={{
            filter: "drop-shadow(0 0 30px rgba(214, 158, 46, 0.3)) drop-shadow(0 4px 20px rgba(0,0,0,0.4))",
          }}
        >
          <img
            src={logoImg}
            alt="KeyNestHub"
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl"
          />
        </div>

        <div className="text-center px-8">
          <h1
            className="text-white text-lg md:text-xl font-semibold tracking-[0.15em]"
            style={{ fontFamily: "'Inter', 'Montserrat', sans-serif" }}
          >
            KeyNestHub
          </h1>
          <p
            className="text-white/50 text-xs md:text-sm mt-1.5 tracking-[0.2em] uppercase"
            style={{ fontFamily: "'Inter', 'Montserrat', sans-serif" }}
          >
            Premium Real Estate Platform
          </p>
        </div>
      </div>

      {/* Shimmer loading indicator */}
      <div className="absolute bottom-16 md:bottom-20 w-40 h-[2px] rounded-full overflow-hidden bg-white/10">
        <div
          className="h-full w-1/3 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(214, 158, 46, 0.7), transparent)",
            animation: "shimmer 1.4s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(450%); }
        }
      `}</style>
    </div>
  );
};
