import React from 'react';

export const CobraKaiLogo: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => {
  return (
    <img 
      src="/input_file_1.png" 
      alt="Cobra Kai Logo" 
      className={`${className} object-contain filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]`}
      referrerPolicy="no-referrer"
    />
  );
};

export const TeamPauloSouzaLogo: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => {
  return (
    <img 
      src="/input_file_0.png" 
      alt="Team Paulo Souza Logo" 
      className={`${className} object-contain rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]`}
      referrerPolicy="no-referrer"
    />
  );
};

