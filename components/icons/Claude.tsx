import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const ClaudeIcon: React.FC<IconProps> = ({ size = 24, color = '#D97757' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"
      fill={color}
    />
    <Path
      d="M12 6c-2 0-3.5 1.5-4 3.5-.5 2 0 4 1.5 5.5 1.5 1.5 3.5 2 5.5 1.5 2-.5 3.5-2 4-4 .5-2 0-4-1.5-5.5C16 7 14 6 12 6zm0 9c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"
      fill={color}
    />
  </Svg>
);
