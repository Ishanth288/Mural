import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Dimensions,
  Animated,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Reanimated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  withTiming
} from 'react-native-reanimated';
import { Brush, Eraser, Undo2, Redo2, Camera, Layers, Palette, RotateCcw, Sticker, Save, Share2, Sparkles, Zap, Type, Droplet, SprayCan as Spray } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import GlassmorphicCard from '@/components/ui/GlassmorphicCard';
import ColorPicker from '@/components/create/ColorPicker';
import BrushSizeSelector from '@/components/create/BrushSizeSelector';
import StickerLibrary from '@/components/stickers/StickerLibrary';
import ARCamera from '@/components/ar/ARCamera';
import GraffitiMode from '@/components/graffiti/GraffitiMode';
import MuralLogo from '@/components/ui/MuralLogo';
import MuralText from '@/components/ui/MuralText';
import MuralButton from '@/components/ui/MuralButton';

const { width, height } = Dimensions.get('window');

const DRAWING_TOOLS = [
  { id: 'brush', icon: Brush, label: 'Brush', color: '#6366F1' },
  { id: 'spray', icon: Sparkles, label: 'Spray', color: '#EC4899' },
  { id: 'marker', icon: Zap, label: 'Marker', color: '#06B6D4' },
  { id: 'drip', icon: Droplet, label: 'Drip', color: '#10B981' },
  { id: 'text', icon: Type, label: '3D Text', color: '#F59E0B' },
  { id: 'sticker', icon: Sticker, label: 'Stickers', color: '#EF4444' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', color: '#64748B' },
  { id: 'layers', icon: Layers, label: 'Layers', color: '#8B5CF6' },
];

const QUICK_ACTIONS = [
  { id: 'undo', icon: Undo2, label: 'Undo' },
  { id: 'redo', icon: Redo2, label: 'Redo' },
  { id: 'colors', icon: Palette, label: 'Colors' },
  { id: 'reset', icon: RotateCcw, label: 'Clear' },
];

export default function CreateScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [activeTool, setActiveTool] = useState('brush');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushSize, setShowBrushSize] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#6366F1');
  const [isRecording, setIsRecording] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [graffitiMode, setGraffitiMode] = useState(false);
  const { colors } = useTheme();
  
  const canvasRef = useRef(null);
  const pathsRef = useRef([]);
  const currentPathRef = useRef(null);
  
  const canvasOffset = useSharedValue({ x: 0, y: 0 });
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);
  
  const toggleFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };
  
  const handleToolPress = (toolId: string) => {
    setActiveTool(toolId);
    
    // Close all modals first
    setShowColorPicker(false);
    setShowBrushSize(false);
    setShowStickers(false);
    setShowLayers(false);
    
    // Open specific modal based on tool
    switch (toolId) {
      case 'colors':
        setShowColorPicker(true);
        break;
      case 'brush':
      case 'spray':
      case 'marker':
      case 'drip':
        setShowBrushSize(true);
        break;
      case 'sticker':
        setShowStickers(true);
        break;
      case 'layers':
        setShowLayers(true);
        break;
    }
  };
  
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'colors':
        setShowColorPicker(true);
        break;
      case 'undo':
        // Implement undo logic
        break;
      case 'redo':
        // Implement redo logic
        break;
      case 'reset':
        // Implement clear canvas logic
        break;
    }
  };
  
  const handleSave = () => {
    setShowSaveModal(true);
  };
  
  const handleShare = () => {
    // Implement share functionality
  };
  
  const startTimelapseRecording = () => {
    setIsRecording(true);
    // Implement timelapse recording
  };
  
  const stopTimelapseRecording = () => {
    setIsRecording(false);
    // Stop recording and save
  };

  const toggleGraffitiMode = () => {
    setGraffitiMode(!graffitiMode);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <MuralLogo size={80} animated={true} />
          <MuralText variant="logo" style={styles.permissionTitle}>
            Camera Access Required
          </MuralText>
          <MuralText variant="subtitle" style={styles.permissionText}>
            Mural needs camera access to create AR murals on real surfaces. Your camera feed stays private and is never stored.
          </MuralText>
          <MuralButton
            title="Grant Camera Access"
            onPress={requestPermission}
            variant="primary"
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Render Graffiti Mode if active
  if (graffitiMode) {
    return (
      <GraffitiMode
        isActive={graffitiMode}
        onExit={() => setGraffitiMode(false)}
        facing={facing}
        onToggleFacing={toggleFacing}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      <ARCamera
        facing={facing}
        onToggleFacing={toggleFacing}
        activeTool={activeTool}
        brushColor={brushColor}
        brushSize={brushSize}
        onSave={handleSave}
        onShare={handleShare}
      />
      
      {/* Graffiti Mode Toggle */}
      <View style={styles.graffitiModeContainer}>
        <TouchableOpacity
          style={[styles.graffitiModeButton, { backgroundColor: colors.warning }]}
          onPress={toggleGraffitiMode}
          activeOpacity={0.8}
        >
          <Spray size={24} color="white" />
          <MuralText variant="tagline" style={styles.graffitiModeText}>
            Graffiti Mode
          </MuralText>
        </TouchableOpacity>
      </View>
      
      {/* Drawing Tools Toolbar */}
      <View style={styles.toolbarContainer}>
        <GlassmorphicCard style={styles.toolbar}>
          {DRAWING_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.toolButton,
                activeTool === tool.id && { 
                  backgroundColor: `${tool.color}30`,
                  borderColor: tool.color,
                  borderWidth: 2
                }
              ]}
              onPress={() => handleToolPress(tool.id)}
            >
              <tool.icon 
                size={20} 
                color={activeTool === tool.id ? tool.color : colors.text} 
              />
              <MuralText 
                variant="subtitle"
                style={[
                  styles.toolLabel, 
                  { color: activeTool === tool.id ? tool.color : colors.textSecondary }
                ]}
              >
                {tool.label}
              </MuralText>
            </TouchableOpacity>
          ))}
        </GlassmorphicCard>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <GlassmorphicCard style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionButton}
              onPress={() => handleQuickAction(action.id)}
            >
              <action.icon size={18} color={colors.text} />
            </TouchableOpacity>
          ))}
        </GlassmorphicCard>
      </View>
      
      {/* Timelapse Recording Button */}
      <View style={styles.recordingContainer}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            { backgroundColor: isRecording ? colors.error : colors.warning }
          ]}
          onPress={isRecording ? stopTimelapseRecording : startTimelapseRecording}
        >
          <View style={[
            styles.recordButtonInner,
            isRecording && styles.recordingActive
          ]} />
        </TouchableOpacity>
        <MuralText variant="subtitle" style={styles.recordLabel}>
          {isRecording ? 'Recording...' : 'Timelapse'}
        </MuralText>
      </View>
      
      {/* Modals */}
      {showColorPicker && (
        <ColorPicker
          selectedColor={brushColor}
          onSelectColor={setBrushColor}
          onClose={() => setShowColorPicker(false)}
        />
      )}
      
      {showBrushSize && (
        <BrushSizeSelector
          size={brushSize}
          onSizeChange={setBrushSize}
          onClose={() => setShowBrushSize(false)}
        />
      )}
      
      {showStickers && (
        <StickerLibrary
          onSelectSticker={(sticker) => {
            // Handle sticker selection
            setShowStickers(false);
          }}
          onClose={() => setShowStickers(false)}
        />
      )}
      
      {/* Layers Panel */}
      {showLayers && (
        <View style={styles.layersPanel}>
          <GlassmorphicCard style={styles.layersCard}>
            <MuralText variant="tagline" style={styles.layersTitle}>
              Layers
            </MuralText>
            
            <View style={styles.layersList}>
              {['Background', 'Midground', 'Foreground', 'Effects'].map((layer, index) => (
                <TouchableOpacity key={layer} style={styles.layerItem}>
                  <View style={[styles.layerPreview, { backgroundColor: colors.primary + '30' }]} />
                  <MuralText variant="subtitle" style={styles.layerName}>
                    {layer}
                  </MuralText>
                  <TouchableOpacity style={styles.layerVisibility}>
                    <MuralText variant="subtitle">👁</MuralText>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.closeLayersButton}
              onPress={() => setShowLayers(false)}
            >
              <MuralText variant="tagline" style={{ color: colors.primary }}>
                Done
              </MuralText>
            </TouchableOpacity>
          </GlassmorphicCard>
        </View>
      )}
      
      {/* Save Modal */}
      <Modal
        visible={showSaveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassmorphicCard style={styles.saveModal}>
            <MuralLogo size={40} />
            <MuralText variant="logo" style={styles.saveTitle}>
              Save Your Mural
            </MuralText>
            
            <View style={styles.saveOptions}>
              <TouchableOpacity style={[styles.saveOption, { backgroundColor: colors.primary }]}>
                <Save size={24} color="white" />
                <MuralText variant="tagline" style={styles.saveOptionText}>
                  Save to Gallery
                </MuralText>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.saveOption, { backgroundColor: colors.secondary }]}>
                <Share2 size={24} color="white" />
                <MuralText variant="tagline" style={styles.saveOptionText}>
                  Share to Feed
                </MuralText>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.saveOption, { backgroundColor: colors.accent }]}>
                <Layers size={24} color="white" />
                <MuralText variant="tagline" style={styles.saveOptionText}>
                  Export Layers
                </MuralText>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowSaveModal(false)}
            >
              <MuralText variant="subtitle" style={{ color: colors.textSecondary }}>
                Cancel
              </MuralText>
            </TouchableOpacity>
          </GlassmorphicCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
    lineHeight: 24,
  },
  graffitiModeContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: '50%',
    marginLeft: -80,
    zIndex: 100,
  },
  graffitiModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  graffitiModeText: {
    marginLeft: 8,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  toolbarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    left: 16,
    right: 16,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
    minWidth: 60,
  },
  toolLabel: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  quickActionsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    right: 16,
  },
  quickActions: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  quickActionButton: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  recordingContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    left: 16,
    alignItems: 'center',
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordButtonInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  recordingActive: {
    borderRadius: 4,
  },
  recordLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  layersPanel: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 200 : 180,
    left: 16,
    right: 16,
  },
  layersCard: {
    padding: 16,
    borderRadius: 16,
  },
  layersTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  layersList: {
    marginBottom: 16,
  },
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  layerPreview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
  },
  layerName: {
    flex: 1,
    fontSize: 14,
  },
  layerVisibility: {
    padding: 4,
  },
  closeLayersButton: {
    alignSelf: 'center',
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  saveModal: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  saveTitle: {
    fontSize: 24,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  saveOptions: {
    width: '100%',
    marginBottom: 24,
  },
  saveOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
  },
  saveOptionText: {
    marginLeft: 12,
    color: 'white',
    fontSize: 16,
  },
  closeModalButton: {
    padding: 12,
  },
});