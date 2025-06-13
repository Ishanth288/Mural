import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import Svg, { 
  Circle, 
  Path, 
  Defs, 
  RadialGradient, 
  Stop,
  Filter,
  FeGaussianBlur,
  FeOffset,
  FeFlood,
  FeComposite
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface SprayParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface MotionData {
  acceleration: { x: number; y: number; z: number };
  rotation: { alpha: number; beta: number; gamma: number };
  timestamp: number;
  pressure: number;
  distance: number;
}

type SprayCanType = 'wide' | 'skinny' | 'fat' | 'detail' | 'chrome';

interface GraffitiCanvasProps {
  particles: SprayParticle[];
  wallBoundary: { x: number; y: number; width: number; height: number };
  sprayActive: boolean;
  selectedColor: string;
  canType: SprayCanType;
  motionData: MotionData | null;
}

export default function GraffitiCanvas({
  particles,
  wallBoundary,
  sprayActive,
  selectedColor,
  canType,
  motionData
}: GraffitiCanvasProps) {
  const paintPaths = useRef<string[]>([]);
  const currentPath = useRef<string>('');
  const lastPosition = useRef<{ x: number; y: number } | null>(null);
  
  const sprayOpacity = useSharedValue(0);
  const paintAccumulation = useRef(new Map<string, number>());
  
  useEffect(() => {
    sprayOpacity.value = withTiming(sprayActive ? 1 : 0, { duration: 100 });
  }, [sprayActive]);
  
  // Generate spray pattern based on can type
  const getSprayPattern = (canType: SprayCanType, distance: number) => {
    const patterns = {
      wide: { spread: 30, density: 0.8, pressure: 0.9 },
      skinny: { spread: 5, density: 1.0, pressure: 1.0 },
      fat: { spread: 50, density: 0.6, pressure: 0.7 },
      detail: { spread: 2, density: 1.0, pressure: 1.0 },
      chrome: { spread: 20, density: 0.9, pressure: 0.8 }
    };
    
    const pattern = patterns[canType];
    return {
      ...pattern,
      spread: pattern.spread * (1 + distance * 0.3),
      density: pattern.density * (1 - distance * 0.2)
    };
  };
  
  // Create realistic paint drip effects
  const generateDripEffect = (x: number, y: number, accumulation: number) => {
    if (accumulation < 0.7) return null;
    
    const dripLength = Math.min(50, accumulation * 30);
    const dripWidth = Math.max(2, accumulation * 5);
    
    return (
      <Path
        key={`drip-${x}-${y}`}
        d={`M ${x - dripWidth/2} ${y} Q ${x} ${y + dripLength/2} ${x + dripWidth/2} ${y + dripLength}`}
        stroke={selectedColor}
        strokeWidth={dripWidth}
        strokeOpacity={0.8}
        fill="none"
        strokeLinecap="round"
      />
    );
  };
  
  // Render chrome/metallic effects
  const renderChromeEffect = (particle: SprayParticle) => {
    if (canType !== 'chrome') return null;
    
    return (
      <Circle
        key={`chrome-${particle.id}`}
        cx={particle.x}
        cy={particle.y}
        r={particle.size}
        fill="url(#chromeGradient)"
        opacity={particle.opacity * 0.8}
      />
    );
  };
  
  // Calculate paint accumulation for realistic effects
  const updatePaintAccumulation = (x: number, y: number, amount: number) => {
    const key = `${Math.floor(x/5)}-${Math.floor(y/5)}`;
    const current = paintAccumulation.current.get(key) || 0;
    paintAccumulation.current.set(key, Math.min(1.0, current + amount));
    return paintAccumulation.current.get(key) || 0;
  };
  
  // Render realistic spray particles with physics
  const renderSprayParticles = () => {
    return particles.map(particle => {
      const accumulation = updatePaintAccumulation(particle.x, particle.y, 0.1);
      const pattern = getSprayPattern(canType, motionData?.distance || 1);
      
      // Apply surface interaction effects
      const surfaceOpacity = interpolateOpacity(particle.opacity, accumulation);
      const surfaceSize = particle.size * (1 + accumulation * 0.3);
      
      return (
        <React.Fragment key={particle.id}>
          {/* Main particle */}
          <Circle
            cx={particle.x}
            cy={particle.y}
            r={surfaceSize}
            fill={particle.color}
            opacity={surfaceOpacity}
            filter={canType === 'chrome' ? 'url(#chromeFilter)' : undefined}
          />
          
          {/* Chrome effect overlay */}
          {renderChromeEffect(particle)}
          
          {/* Paint drip effect */}
          {generateDripEffect(particle.x, particle.y, accumulation)}
          
          {/* Particle glow for neon colors */}
          {isNeonColor(particle.color) && (
            <Circle
              cx={particle.x}
              cy={particle.y}
              r={surfaceSize * 1.5}
              fill={particle.color}
              opacity={surfaceOpacity * 0.3}
              filter="url(#glowFilter)"
            />
          )}
        </React.Fragment>
      );
    });
  };
  
  const interpolateOpacity = (baseOpacity: number, accumulation: number) => {
    return Math.min(1.0, baseOpacity + accumulation * 0.5);
  };
  
  const isNeonColor = (color: string) => {
    const neonColors = ['#FF0080', '#00FFFF', '#FFFF00', '#39FF14', '#FF3131'];
    return neonColors.includes(color);
  };
  
  // Animated canvas style
  const canvasStyle = useAnimatedStyle(() => {
    return {
      opacity: sprayOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, canvasStyle]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {/* Gradient and filter definitions */}
        <Defs>
          {/* Chrome gradient */}
          <RadialGradient id="chromeGradient" cx="50%" cy="30%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <Stop offset="30%" stopColor="#e0e0e0" stopOpacity="0.8" />
            <Stop offset="70%" stopColor="#a0a0a0" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#606060" stopOpacity="0.4" />
          </RadialGradient>
          
          {/* Glow filter for neon effects */}
          <Filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <FeOffset dx="0" dy="0" result="offsetBlur"/>
            <FeFlood floodColor={selectedColor} floodOpacity="0.5"/>
            <FeComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
          </Filter>
          
          {/* Chrome filter */}
          <Filter id="chromeFilter" x="-20%" y="-20%" width="140%" height="140%">
            <FeGaussianBlur stdDeviation="1" result="blur"/>
            <FeOffset dx="1" dy="1" result="offset"/>
            <FeComposite in="SourceGraphic" in2="offset" operator="over"/>
          </Filter>
        </Defs>
        
        {/* Wall boundary indicator */}
        {wallBoundary.width > 0 && (
          <Path
            d={`M ${wallBoundary.x} ${wallBoundary.y} 
                L ${wallBoundary.x + wallBoundary.width} ${wallBoundary.y}
                L ${wallBoundary.x + wallBoundary.width} ${wallBoundary.y + wallBoundary.height}
                L ${wallBoundary.x} ${wallBoundary.y + wallBoundary.height} Z`}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={2}
            strokeDasharray="10,5"
            fill="none"
          />
        )}
        
        {/* Render all spray particles */}
        {renderSprayParticles()}
        
        {/* Persistent paint paths */}
        {paintPaths.current.map((path, index) => (
          <Path
            key={`path-${index}`}
            d={path}
            stroke={selectedColor}
            strokeWidth={getSprayPattern(canType, 1).spread / 10}
            strokeOpacity={0.8}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
      
      {/* Real-time spray indicator */}
      {sprayActive && motionData && (
        <View 
          style={[
            styles.sprayIndicator,
            {
              left: motionData.acceleration.x * 100 + width / 2,
              top: motionData.acceleration.y * 100 + height / 2,
              backgroundColor: selectedColor + '40',
              width: getSprayPattern(canType, motionData.distance).spread,
              height: getSprayPattern(canType, motionData.distance).spread,
            }
          ]}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sprayIndicator: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    pointerEvents: 'none',
  },
});