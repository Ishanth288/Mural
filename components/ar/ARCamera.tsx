import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  PanResponder,
  Platform
} from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { Camera, RotateCcw, Download, Share2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import MuralText from '../ui/MuralText';
import MuralLogo from '../ui/MuralLogo';

const { width, height } = Dimensions.get('window');

type DrawingPath = {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  tool: string;
  layer: number;
};

type ARCameraProps = {
  facing: CameraType;
  onToggleFacing: () => void;
  activeTool: string;
  brushColor: string;
  brushSize: number;
  onSave: () => void;
  onShare: () => void;
};

export default function ARCamera({
  facing,
  onToggleFacing,
  activeTool,
  brushColor,
  brushSize,
  onSave,
  onShare
}: ARCameraProps) {
  const { colors } = useTheme();
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]);
  
  const canvasOffset = useSharedValue({ x: 0, y: 0 });
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  const panGesture = Gesture.Pan()
    .onStart((e) => {
      if (activeTool === 'brush' || activeTool === 'spray' || activeTool === 'marker') {
        const newPath: DrawingPath = {
          id: Date.now().toString(),
          points: [{ x: e.x, y: e.y }],
          color: brushColor,
          size: brushSize,
          tool: activeTool,
          layer: 1
        };
        runOnJS(setCurrentPath)(newPath);
      }
    })
    .onUpdate((e) => {
      if (currentPath && (activeTool === 'brush' || activeTool === 'spray' || activeTool === 'marker')) {
        const updatedPath = {
          ...currentPath,
          points: [...currentPath.points, { x: e.x, y: e.y }]
        };
        runOnJS(setCurrentPath)(updatedPath);
      }
    })
    .onEnd(() => {
      if (currentPath) {
        runOnJS(setPaths)((prev) => [...prev, currentPath]);
        runOnJS(setUndoStack)((prev) => [...prev, paths]);
        runOnJS(setRedoStack)([]);
        runOnJS(setCurrentPath)(null);
      }
    });
    
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(3, e.scale));
    });
    
  const rotateGesture = Gesture.Rotation()
    .onUpdate((e) => {
      rotation.value = e.rotation;
    });
    
  const composed = Gesture.Simultaneous(panGesture, pinchGesture, rotateGesture);
  
  const canvasStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: canvasOffset.value.x },
        { translateY: canvasOffset.value.y },
        { scale: scale.value },
        { rotate: `${rotation.value}rad` }
      ]
    };
  });
  
  const undo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack([...redoStack, paths]);
      setPaths(previousState);
      setUndoStack(undoStack.slice(0, -1));
    }
  };
  
  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack([...undoStack, paths]);
      setPaths(nextState);
      setRedoStack(redoStack.slice(0, -1));
    }
  };
  
  const clear = () => {
    setUndoStack([...undoStack, paths]);
    setPaths([]);
    setRedoStack([]);
  };
  
  const renderPath = (path: DrawingPath) => {
    const pathData = path.points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');
    
    return (
      <svg
        key={path.id}
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${width} ${height}`}
      >
        <path
          d={pathData}
          stroke={path.color}
          strokeWidth={path.size}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={path.tool === 'spray' ? 0.7 : 1}
        />
      </svg>
    );
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        {/* AR Drawing Canvas */}
        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.drawingCanvas, canvasStyle]}>
            {paths.map(renderPath)}
            {currentPath && renderPath(currentPath)}
          </Animated.View>
        </GestureDetector>
        
        {/* Header Controls */}
        <View style={styles.header}>
          <GlassmorphicCard style={styles.headerContent}>
            <View style={styles.brandSection}>
              <MuralLogo size={24} />
              <MuralText variant="tagline" style={styles.headerTitle}>
                AR Studio
              </MuralText>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={onToggleFacing} style={styles.headerButton}>
                <Camera size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onSave} style={styles.headerButton}>
                <Download size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onShare} style={styles.headerButton}>
                <Share2 size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </GlassmorphicCard>
        </View>
        
        {/* Drawing Controls */}
        <View style={styles.drawingControls}>
          <GlassmorphicCard style={styles.controlsCard}>
            <TouchableOpacity 
              onPress={undo} 
              style={[styles.controlButton, undoStack.length === 0 && styles.disabledButton]}
              disabled={undoStack.length === 0}
            >
              <RotateCcw size={20} color={undoStack.length > 0 ? colors.primary : colors.textMuted} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={redo}
              style={[styles.controlButton, redoStack.length === 0 && styles.disabledButton]}
              disabled={redoStack.length === 0}
            >
              <RotateCcw 
                size={20} 
                color={redoStack.length > 0 ? colors.secondary : colors.textMuted}
                style={{ transform: [{ scaleX: -1 }] }}
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={clear} style={styles.controlButton}>
              <MuralText variant="subtitle" style={{ color: colors.warning }}>
                Clear
              </MuralText>
            </TouchableOpacity>
          </GlassmorphicCard>
        </View>
        
        {/* Mural Watermark */}
        <View style={styles.watermark}>
          <MuralLogo size={16} color="rgba(255, 255, 255, 0.4)" />
          <MuralText variant="subtitle" style={styles.watermarkText}>
            Made with Mural
          </MuralText>
        </View>
        
        {/* Layer Indicator */}
        <View style={styles.layerIndicator}>
          <GlassmorphicCard style={styles.layerCard}>
            <MuralText variant="subtitle" style={styles.layerText}>
              Layer 1
            </MuralText>
          </GlassmorphicCard>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  drawingCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  drawingControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    right: 16,
  },
  controlsCard: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  watermark: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  watermarkText: {
    marginLeft: 4,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  layerIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  layerCard: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  layerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});