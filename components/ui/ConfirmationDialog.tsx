import React from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import MuralText from './MuralText';
import MuralButton from './MuralButton';
import GlassmorphicCard from './GlassmorphicCard';
import AccessibilityWrapper from './AccessibilityWrapper';

const { width } = Dimensions.get('window');

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'warning' | 'error' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export default function ConfirmationDialog({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false
}: ConfirmationDialogProps) {
  const { colors } = useTheme();
  
  const getIconAndColor = () => {
    switch (type) {
      case 'warning':
        return { icon: AlertTriangle, color: colors.warning };
      case 'error':
        return { icon: AlertTriangle, color: colors.error };
      case 'success':
        return { icon: CheckCircle, color: colors.success };
      case 'info':
      default:
        return { icon: Info, color: colors.primary };
    }
  };
  
  const { icon: Icon, color } = getIconAndColor();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop}
          onPress={onCancel}
          activeOpacity={1}
          accessibilityLabel="Close dialog"
          accessibilityRole="button"
        />
        
        <AccessibilityWrapper
          label={`${title}. ${message}`}
          role="none"
        >
          <GlassmorphicCard style={styles.dialog}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onCancel}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.iconContainer}>
              <Icon size={48} color={color} />
            </View>
            
            <MuralText variant="logo" style={[styles.title, { color: colors.text }]}>
              {title}
            </MuralText>
            
            <MuralText variant="subtitle" style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </MuralText>
            
            <View style={styles.actions}>
              <MuralButton
                title={cancelText}
                onPress={onCancel}
                variant="ghost"
                size="medium"
                style={styles.cancelButton}
              />
              
              <MuralButton
                title={confirmText}
                onPress={onConfirm}
                variant={destructive ? "outline" : "primary"}
                size="medium"
                style={[
                  styles.confirmButton,
                  destructive && { borderColor: colors.error }
                ]}
                textStyle={destructive ? { color: colors.error } : undefined}
              />
            </View>
          </GlassmorphicCard>
        </AccessibilityWrapper>
      </View>
    </Modal>
  );
}

// Quick confirmation hook
export function useConfirmation() {
  const [dialog, setDialog] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'warning' | 'error' | 'info' | 'success';
    onConfirm: () => void;
    destructive?: boolean;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const confirm = (options: {
    title: string;
    message: string;
    type?: 'warning' | 'error' | 'info' | 'success';
    destructive?: boolean;
  }) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        visible: true,
        title: options.title,
        message: options.message,
        type: options.type,
        destructive: options.destructive,
        onConfirm: () => {
          setDialog(prev => ({ ...prev, visible: false }));
          resolve(true);
        },
      });
    });
  };
  
  const cancel = () => {
    setDialog(prev => ({ ...prev, visible: false }));
  };
  
  const ConfirmationComponent = () => (
    <ConfirmationDialog
      visible={dialog.visible}
      title={dialog.title}
      message={dialog.message}
      type={dialog.type}
      onConfirm={dialog.onConfirm}
      onCancel={cancel}
      destructive={dialog.destructive}
    />
  );
  
  return {
    confirm,
    ConfirmationComponent,
  };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialog: {
    width: Math.min(width - 64, 400),
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
});