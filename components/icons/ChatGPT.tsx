import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const ChatGPTIcon: React.FC<IconProps> = ({ size = 24, color = '#10A37F' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22.5 10.5c-.5-2-2-3.5-4-4-.5-2-2-3.5-4-4-2.5-.5-5 0-7 1.5-2-.5-4 0-5.5 1.5-1.5 1.5-2 4-1.5 6-1.5 1.5-2 4-1 6 .5 2 2 3.5 4 4 .5 2 2 3.5 4 4 2.5.5 5 0 7-1.5 2 .5 4 0 5.5-1.5 1.5-1.5 2-4 1.5-6 1.5-1.5 2-4 1-6z"
      fill={color}
    />
    <Path
      d="M12 6.5c-2 0-3.5 1-4.5 2.5-.5.5-.5 1 0 1.5.5.5 1 .5 1.5 0 .5-.5 1.5-1 3-1 2 0 3.5 1 4 3 .2.5.5.8 1 .8s.8-.3 1-.8c0-2.5-2-4.5-5-5z"
      fill="white"
    />
    <Path
      d="M12 17.5c2 0 3.5-1 4.5-2.5.5-.5.5-1 0-1.5-.5-.5-1-.5-1.5 0-.5.5-1.5 1-3 1-2 0-3.5-1-4-3-.2-.5-.5-.8-1-.8s-.8.3-1 .8c0 2.5 2 4.5 5 5z"
      fill="white"
    />
  </Svg>
);
