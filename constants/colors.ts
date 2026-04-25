export const colors = {
  background: {
    primary: '#0a0a0f',
    secondary: '#12082a',
    mesh: ['#0a0a0f', '#12082a', '#1a1040'] as const,
  },
  glass: {
    card: 'rgba(255,255,255,0.06)',
    cardBorder: 'rgba(255,255,255,0.13)',
    cardTopBorder: 'rgba(255,255,255,0.25)',
    input: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.1)',
    inputBorderFocused: 'rgba(79,195,247,0.6)',
    buttonSecondary: 'rgba(255,255,255,0.08)',
    buttonSecondaryBorder: 'rgba(255,255,255,0.15)',
    nav: 'rgba(255,255,255,0.08)',
    navBorder: 'rgba(255,255,255,0.15)',
  },
  accent: {
    blue: '#4FC3F7',
    blueDark: '#1976D2',
    amber: '#FFB74D',
    green: '#66BB6A',
    red: '#EF5350',
    purple: '#7c3aed',
    indigo: '#3730a3',
  },
  orb: {
    indigo: '#3730a3',
    violet: '#7c3aed',
    blue: '#1d4ed8',
  },
  text: {
    primary: 'rgba(255,255,255,0.95)',
    secondary: 'rgba(255,255,255,0.7)',
    tertiary: 'rgba(255,255,255,0.5)',
    muted: 'rgba(255,255,255,0.4)',
    placeholder: 'rgba(255,255,255,0.35)',
  },
  status: {
    active: {
      bg: 'rgba(102,187,106,0.2)',
      border: 'rgba(102,187,106,0.6)',
      text: '#66BB6A',
    },
    expiring: {
      bg: 'rgba(255,183,77,0.2)',
      border: 'rgba(255,183,77,0.6)',
      text: '#FFB74D',
    },
    expired: {
      bg: 'rgba(239,83,80,0.2)',
      border: 'rgba(239,83,80,0.6)',
      text: '#EF5350',
    },
    paid: {
      bg: 'rgba(102,187,106,0.15)',
      border: 'rgba(102,187,106,0.4)',
      text: '#66BB6A',
    },
  },
  badge: {
    glass: 'rgba(255,255,255,0.06)',
  },
  shadows: {
    purpleGlow: '#7c3aed',
    blueGlow: '#4FC3F7',
    amberGlow: '#FFB74D',
  },
} as const;

export const avatarColors = [
  '#EF5350',
  '#EC407A',
  '#AB47BC',
  '#7E57C2',
  '#5C6BC0',
  '#42A5F5',
  '#29B6F6',
  '#26C6DA',
  '#26A69A',
  '#66BB6A',
  '#9CCC65',
  '#D4E157',
  '#FFEE58',
  '#FFCA28',
  '#FFA726',
  '#FF7043',
];
