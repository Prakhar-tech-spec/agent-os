import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LoaderProps {
  text?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ className = "" }) => (
  <div className={`flex flex-col items-center justify-center min-h-[180px] ${className}`}>
    <div className="w-72 h-72 flex items-center justify-center">
      <DotLottieReact
        src="/lottie/agentos-loader.lottie"
        autoplay
        loop
        style={{ width: 288, height: 288 }}
      />
    </div>
  </div>
);

export default Loader;
// Add to tailwind.config.js:
// animation: { 'spin-slow': 'spin 1.2s linear infinite' }, 