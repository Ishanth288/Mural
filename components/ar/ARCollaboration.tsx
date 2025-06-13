import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Users, UserPlus, UserMinus, Wifi, WifiOff, Share2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import MuralText from '../ui/MuralText';
import MuralButton from '../ui/MuralButton';
import AccessibilityWrapper from '../ui/AccessibilityWrapper';

interface CollaboratorData {
  id: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: number;
  currentTool: string;
  currentColor: string;
  cursorPosition: { x: number; y: number };
}

interface ARCollaborationProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  sessionId?: string;
  onInviteUser: () => void;
}

export default function ARCollaboration({
  isActive,
  onToggle,
  sessionId,
  onInviteUser
}: ARCollaborationProps) {
  const { colors } = useTheme();
  const [collaborators, setCollaborators] = useState<CollaboratorData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const websocketRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (isActive) {
      initializeCollaboration();
    } else {
      disconnectCollaboration();
    }
    
    return () => {
      disconnectCollaboration();
    };
  }, [isActive]);
  
  const initializeCollaboration = async () => {
    setConnectionStatus('connecting');
    
    try {
      // Initialize WebSocket connection for real-time collaboration
      await connectToCollaborationServer();
      
      // Start heartbeat to maintain connection
      startHeartbeat();
      
      setIsConnected(true);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to initialize collaboration:', error);
      setConnectionStatus('disconnected');
      setIsConnected(false);
    }
  };
  
  const connectToCollaborationServer = async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        // In a real implementation, this would connect to your WebSocket server
        // For now, we'll simulate the connection
        const mockWebSocket = {
          send: (data: string) => {
            console.log('Sending collaboration data:', data);
          },
          close: () => {
            console.log('Closing collaboration connection');
          },
          onmessage: null,
          onopen: null,
          onclose: null,
          onerror: null
        };
        
        websocketRef.current = mockWebSocket as any;
        
        // Simulate connection success
        setTimeout(() => {
          setCollaborators([
            {
              id: 'user1',
              username: 'ArtistFriend',
              avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
              isOnline: true,
              lastSeen: Date.now(),
              currentTool: 'brush',
              currentColor: '#FF0080',
              cursorPosition: { x: 100, y: 200 }
            },
            {
              id: 'user2',
              username: 'StreetArtist',
              avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
              isOnline: true,
              lastSeen: Date.now(),
              currentTool: 'spray',
              currentColor: '#00FFFF',
              cursorPosition: { x: 300, y: 150 }
            }
          ]);
          resolve();
        }, 2000);
      } catch (error) {
        reject(error);
      }
    });
  };
  
  const disconnectCollaboration = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setCollaborators([]);
  };
  
  const startHeartbeat = () => {
    heartbeatRef.current = setInterval(() => {
      if (websocketRef.current) {
        // Send heartbeat to maintain connection
        websocketRef.current.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now()
        }));
      }
    }, 30000); // 30 seconds
  };
  
  const sendCollaborationData = (data: any) => {
    if (websocketRef.current && isConnected) {
      websocketRef.current.send(JSON.stringify({
        type: 'collaboration_data',
        sessionId,
        data,
        timestamp: Date.now()
      }));
    }
  };
  
  const handleInviteUser = () => {
    onInviteUser();
  };
  
  const handleRemoveCollaborator = (collaboratorId: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
    
    // Send removal notification
    sendCollaborationData({
      type: 'user_removed',
      userId: collaboratorId
    });
  };
  
  const renderCollaborator = ({ item }: { item: CollaboratorData }) => (
    <View style={styles.collaboratorItem}>
      <View style={styles.collaboratorInfo}>
        <View style={styles.avatarContainer}>
          <View 
            style={[
              styles.avatar,
              { backgroundColor: item.currentColor + '30' }
            ]}
          />
          <View 
            style={[
              styles.onlineIndicator,
              { backgroundColor: item.isOnline ? colors.success : colors.textMuted }
            ]}
          />
        </View>
        
        <View style={styles.collaboratorDetails}>
          <MuralText variant="tagline" style={styles.collaboratorName}>
            {item.username}
          </MuralText>
          <MuralText variant="subtitle" style={styles.collaboratorStatus}>
            {item.isOnline ? `Using ${item.currentTool}` : 'Offline'}
          </MuralText>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveCollaborator(item.id)}
        accessibilityLabel={`Remove ${item.username} from collaboration`}
        accessibilityRole="button"
      >
        <UserMinus size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
  
  const renderConnectionStatus = () => {
    const statusConfig = {
      connecting: { icon: Wifi, color: colors.warning, text: 'Connecting...' },
      connected: { icon: Wifi, color: colors.success, text: 'Connected' },
      disconnected: { icon: WifiOff, color: colors.error, text: 'Disconnected' }
    };
    
    const config = statusConfig[connectionStatus];
    const Icon = config.icon;
    
    return (
      <View style={styles.connectionStatus}>
        <Icon size={16} color={config.color} />
        <MuralText variant="subtitle" style={[styles.statusText, { color: config.color }]}>
          {config.text}
        </MuralText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GlassmorphicCard style={styles.collaborationPanel}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Users size={24} color={colors.primary} />
            <MuralText variant="tagline" style={styles.title}>
              Collaboration
            </MuralText>
          </View>
          
          {renderConnectionStatus()}
        </View>
        
        <View style={styles.controls}>
          <MuralButton
            title={isActive ? "Leave Session" : "Start Collaboration"}
            onPress={() => onToggle(!isActive)}
            variant={isActive ? "outline" : "primary"}
            size="medium"
            icon={isActive ? <UserMinus size={20} color={colors.primary} /> : <Users size={20} color="white" />}
          />
          
          {isActive && (
            <TouchableOpacity
              style={[styles.inviteButton, { backgroundColor: colors.secondary }]}
              onPress={handleInviteUser}
              accessibilityLabel="Invite user to collaboration"
              accessibilityRole="button"
            >
              <UserPlus size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
        
        {isActive && collaborators.length > 0 && (
          <View style={styles.collaboratorsList}>
            <MuralText variant="subtitle" style={styles.collaboratorsTitle}>
              Active Collaborators ({collaborators.length})
            </MuralText>
            
            <FlatList
              data={collaborators}
              renderItem={renderCollaborator}
              keyExtractor={(item) => item.id}
              style={styles.collaboratorsContainer}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
        
        {isActive && sessionId && (
          <View style={styles.sessionInfo}>
            <MuralText variant="subtitle" style={styles.sessionLabel}>
              Session ID:
            </MuralText>
            <TouchableOpacity
              style={styles.sessionIdContainer}
              onPress={() => {
                // Copy session ID to clipboard
                console.log('Copying session ID:', sessionId);
              }}
              accessibilityLabel="Copy session ID"
              accessibilityRole="button"
            >
              <MuralText variant="tagline" style={styles.sessionId}>
                {sessionId}
              </MuralText>
              <Share2 size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </GlassmorphicCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    right: 16,
    width: 280,
    maxHeight: 400,
  },
  collaborationPanel: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 8,
    fontSize: 18,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inviteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  collaboratorsList: {
    marginBottom: 16,
  },
  collaboratorsTitle: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  collaboratorsContainer: {
    maxHeight: 150,
  },
  collaboratorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  collaboratorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  collaboratorDetails: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: 14,
  },
  collaboratorStatus: {
    fontSize: 12,
    opacity: 0.7,
  },
  removeButton: {
    padding: 8,
  },
  sessionInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  sessionLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  sessionIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sessionId: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});