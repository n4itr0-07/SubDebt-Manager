import React from 'react';
import Svg, { Circle, Path, Rect, Text as SvgText, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface IconProps {
  size?: number;
}

// Helper for branded letter icons
const LetterIcon = ({ size = 24, bg, text, color = '#fff', fontSize = 12 }: 
  IconProps & { bg: string; text: string; color?: string; fontSize?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect width="24" height="24" rx="6" fill={bg} />
    <SvgText x="12" y="16" fontSize={fontSize} fontWeight="bold" fill={color} textAnchor="middle">
      {text}
    </SvgText>
  </Svg>
);

// Streaming
export const PrimeVideoIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#00A8E1" text="prime" fontSize={6} />
);

export const HotstarIcon = ({ size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="hot" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#0F1B41" />
        <Stop offset="100%" stopColor="#1F4292" />
      </LinearGradient>
    </Defs>
    <Rect width="24" height="24" rx="6" fill="url(#hot)" />
    <Path d="M12 5l1.8 4 4.2.5-3 3 .8 4.5L12 14.8 8.2 17l.8-4.5-3-3 4.2-.5z" fill="#fff" />
  </Svg>
);

export const HboIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#000" text="HBO" fontSize={8} />
);

export const HuluIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#1CE783" text="hulu" color="#000" fontSize={7} />
);

export const SonyLivIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#E50914" text="LIV" fontSize={9} />
);

export const Zee5Icon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#7E2EBE" text="ZEE5" fontSize={7} />
);

export const JioCinemaIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#0F2080" text="Jio" fontSize={8} />
);

export const CrunchyrollIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#F47521" text="CR" fontSize={10} />
);

// Music
export const JioSaavnIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#2BC5B4" text="Saavn" fontSize={6} />
);

export const GaanaIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#E72C30" text="Gaana" fontSize={6} />
);

export const WynkIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#FE3D8C" text="Wynk" fontSize={7} />
);

export const AudibleIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#F8991C" text="audible" color="#000" fontSize={5} />
);

// Gaming
export const PlayStationIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#003791" text="PS" fontSize={11} />
);

export const XboxIcon = ({ size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect width="24" height="24" rx="6" fill="#107C10" />
    <Circle cx="12" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="1.5" />
    <Path d="M8 8 L16 16 M16 8 L8 16" stroke="#fff" strokeWidth="1.5" />
  </Svg>
);

export const SteamIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#171A21" text="Steam" fontSize={6} />
);

export const NintendoIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#E60012" text="N" fontSize={14} />
);

export const EpicGamesIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#000" text="EPIC" fontSize={7} />
);

// Communication & Social
export const DiscordIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#5865F2" text="D" fontSize={14} />
);

export const SlackIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#4A154B" text="slack" fontSize={6} />
);

export const ZoomIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#2D8CFF" text="zoom" fontSize={7} />
);

export const TwitchIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#9146FF" text="twitch" fontSize={6} />
);

export const LinkedInIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#0A66C2" text="in" fontSize={11} />
);

// Productivity
export const DropboxIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#0061FF" text="Dbx" fontSize={9} />
);

export const CanvaIcon = ({ size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="canva" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#00C4CC" />
        <Stop offset="100%" stopColor="#7D2AE8" />
      </LinearGradient>
    </Defs>
    <Rect width="24" height="24" rx="6" fill="url(#canva)" />
    <SvgText x="12" y="16" fontSize="11" fontWeight="bold" fill="#fff" textAnchor="middle">C</SvgText>
  </Svg>
);

export const GrammarlyIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#15C39A" text="G" fontSize={14} />
);

export const OnePasswordIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#0572EC" text="1P" fontSize={10} />
);

export const LastPassIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#D32D27" text="LP" fontSize={10} />
);

export const BitwardenIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#175DDC" text="bw" fontSize={11} />
);

// VPN & Security
export const NordVpnIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#4687FF" text="Nord" fontSize={7} />
);

export const ExpressVpnIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#DA3940" text="EXP" fontSize={8} />
);

export const SurfsharkIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#1EBFBF" text="Surf" fontSize={7} />
);

export const ProtonVpnIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#6D4AFF" text="Proton" fontSize={5} />
);

// Education
export const DuolingoIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#58CC02" text="Duo" fontSize={8} />
);

export const CourseraIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#0056D2" text="C" fontSize={14} />
);

export const UdemyIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#A435F0" text="U" fontSize={14} />
);

// Indian Telecom
export const JioIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#0F2080" text="Jio" fontSize={9} />
);

export const AirtelIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#E40000" text="airtel" fontSize={5} />
);

export const ViIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#ED1B24" text="Vi" fontSize={11} />
);

// Indian Services
export const SwiggyIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#FC8019" text="Sw" fontSize={10} />
);

export const ZomatoIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#E23744" text="Z" fontSize={14} />
);

export const TimesPrimeIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#000" text="Times" fontSize={6} />
);

// Cloud & Dev
export const AwsIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#232F3E" text="AWS" fontSize={8} />
);

export const VercelIcon = ({ size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect width="24" height="24" rx="6" fill="#000" />
    <Path d="M12 6 L18 17 L6 17 Z" fill="#fff" />
  </Svg>
);

export const CloudflareIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#F38020" text="CF" fontSize={10} />
);

export const DigitalOceanIcon = ({ size = 24 }: IconProps) => (
  <LetterIcon size={size} bg="#0080FF" text="DO" fontSize={10} />
);
