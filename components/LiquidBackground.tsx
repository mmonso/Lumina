import React from 'react';
import { ThemeConfig } from '../types';

interface LiquidBackgroundProps {
  theme: ThemeConfig;
}

const LiquidBackground: React.FC<LiquidBackgroundProps> = ({ theme }) => {
  // CONFIGURAÇÃO ANTI-BANDING / ESTÉTICA
  
  // Noise: Removido completamente (opacity-0) nos modos escuros conforme solicitado
  // para um visual limpo. Mantido muito sutil nos claros para textura de papel/aquarela.
  const noiseOpacity = theme.isDark ? 'opacity-0' : 'opacity-[0.015]';

  // Opacidade dos Orbes:
  // No modo escuro, definimos como 0 (invisível) para um fundo chapado/sólido.
  // No modo claro, mantemos 100% para o efeito aquarela.
  const orbGlobalOpacity = theme.isDark ? 'opacity-0' : 'opacity-100';

  // Blend Mode:
  // 'multiply' no claro para efeito aquarela. No escuro não importa mais pois orbes estão invisíveis.
  const blendMode = 'mix-blend-multiply';

  // Blur Radius:
  const blurAmount = 'blur-[120px]';

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden transition-colors duration-700 ${theme.colors.bg}`}>
      
      {/* Container dos Orbes - Invisível no modo Dark */}
      <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${orbGlobalOpacity}`}>
        
        {/* Orb 1 */}
        <div 
          className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full 
          ${blendMode} ${blurAmount} animate-pulse optimize-gpu transition-colors duration-1000 ${theme.colors.orb1}`}
        ></div>
        
        {/* Orb 2 */}
        <div 
          className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full 
          ${blendMode} ${blurAmount} animate-pulse delay-1000 optimize-gpu transition-colors duration-1000 ${theme.colors.orb2}`}
        ></div>
        
        {/* Orb 3 */}
        <div 
          className={`absolute top-[20%] right-[20%] w-[400px] h-[400px] rounded-full 
          ${blendMode} blur-[80px] animate-bounce duration-[10000ms] optimize-gpu transition-colors duration-1000 ${theme.colors.orb3}`}
        ></div>

      </div>
      
      {/* Noise Texture - Visível apenas nos modos claros */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${noiseOpacity}`} 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>
    </div>
  );
};

export default LiquidBackground;