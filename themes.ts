import { ThemeConfig } from './types';

export const themes: ThemeConfig[] = [
  {
    id: 'ocean',
    name: 'Ocean (Original)',
    isDark: true,
    colors: {
      bg: 'bg-slate-900',
      text: 'text-gray-100',
      textMuted: 'text-slate-400',
      accent: 'indigo',
      orb1: 'bg-purple-600/30',
      orb2: 'bg-indigo-600/30',
      orb3: 'bg-blue-500/20',
      bubbleUser: 'bg-white/10 border-white/20 text-white',
      bubbleModel: 'bg-black/20 border-white/10 text-gray-100',
      inputBg: 'bg-slate-900/60 border-white/10'
    }
  },
  {
    id: 'sand',
    name: 'Areia (Claro)',
    isDark: false,
    colors: {
      bg: 'bg-[#e7e5e4]', // Stone 200
      text: 'text-stone-800',
      textMuted: 'text-stone-500',
      accent: 'orange',
      orb1: 'bg-orange-400/30',
      orb2: 'bg-amber-300/30',
      orb3: 'bg-stone-300/40',
      bubbleUser: 'bg-stone-800/10 border-stone-800/10 text-stone-900',
      bubbleModel: 'bg-white/60 border-white/40 text-stone-800',
      inputBg: 'bg-white/40 border-stone-800/5'
    }
  },
  {
    id: 'autumn',
    name: 'Outono (Claro)',
    isDark: false,
    colors: {
      bg: 'bg-[#eaddcf]', // Warm Almond/Latte
      text: 'text-[#5c4a42]', // Coffee Brown
      textMuted: 'text-[#8c7a6b]', // Warm Taupe
      accent: 'orange',
      orb1: 'bg-[#9a3412]/20', // Burnt Orange (Orange 800)
      orb2: 'bg-[#92400e]/20', // Amber
      orb3: 'bg-[#78350f]/15', // Deep Earth
      bubbleUser: 'bg-[#7c2d12]/10 border-[#7c2d12]/10 text-[#5c4a42]', // Warm Terracota tint
      bubbleModel: 'bg-[#f5f0eb] border-[#e6ded6] text-[#5c4a42] shadow-sm', // Warm Cream Paper
      inputBg: 'bg-[#f5f0eb]/90 border-[#8c7a6b]/20'
    }
  },
  {
    id: 'midnight',
    name: 'Dark (Midnight)',
    isDark: true,
    colors: {
      bg: 'bg-neutral-900', // Lighter than 950 (Charcoal)
      text: 'text-neutral-200',
      textMuted: 'text-neutral-400',
      accent: 'neutral',
      orb1: 'bg-neutral-700/20', // Visible grey depth
      orb2: 'bg-stone-800/30',
      orb3: 'bg-zinc-800/20',
      bubbleUser: 'bg-white/5 border-white/10 text-neutral-100',
      bubbleModel: 'bg-neutral-800/40 border-white/5 text-neutral-200', // Lighter container
      inputBg: 'bg-neutral-800/60 border-white/5' // Lighter input
    }
  },
  {
    id: 'eco',
    name: 'Eco (Natureza)',
    isDark: true,
    colors: {
      bg: 'bg-[#022c22]', // Emerald 950
      text: 'text-emerald-50',
      textMuted: 'text-emerald-400/70',
      accent: 'emerald',
      orb1: 'bg-emerald-600/20',
      orb2: 'bg-green-600/20',
      orb3: 'bg-lime-500/10',
      bubbleUser: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-50',
      bubbleModel: 'bg-black/20 border-emerald-500/10 text-emerald-100',
      inputBg: 'bg-emerald-950/40 border-emerald-500/10'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Hi-Tech',
    isDark: true,
    colors: {
      bg: 'bg-[#0f172a]', // Slate 900 (Lighter than 950)
      text: 'text-cyan-50',
      textMuted: 'text-cyan-300/70',
      accent: 'cyan',
      // High saturation and opacity for background orbs
      orb1: 'bg-pink-500/30',
      orb2: 'bg-cyan-400/30',
      orb3: 'bg-violet-500/30',
      // Neon Glow Effects (Shadows + Borders)
      bubbleUser: 'bg-pink-500/10 border-pink-500/50 text-pink-50 shadow-[0_0_15px_rgba(236,72,153,0.25)]',
      bubbleModel: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      inputBg: 'bg-slate-900/80 border-cyan-400/40 shadow-[0_0_25px_rgba(34,211,238,0.15)]'
    }
  },
  {
    id: 'glass',
    name: 'Glass (Neutro)',
    isDark: false,
    colors: {
      bg: 'bg-slate-300', // Mid-tone silver/grey background to reduce glare
      text: 'text-slate-900', // High contrast text
      textMuted: 'text-slate-600',
      accent: 'indigo',
      orb1: 'bg-blue-600/20', // Deeper colors for contrast behind glass
      orb2: 'bg-indigo-600/20',
      orb3: 'bg-white/40',
      // True Glassmorphism: High translucency + Blur + White Borders + Shadows
      bubbleUser: 'bg-white/40 border-white/60 text-slate-900 shadow-sm backdrop-blur-xl',
      bubbleModel: 'bg-white/20 border-white/40 text-slate-800 shadow-sm backdrop-blur-xl',
      inputBg: 'bg-white/30 border-white/50 backdrop-blur-xl shadow-lg'
    }
  }
];

export const getThemeById = (id: string) => themes.find(t => t.id === id) || themes[0];