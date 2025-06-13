import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Send, Heart, Reply, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import MuralText from '../ui/MuralText';

type Comment = {
  id: string;
  user: {
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  text: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  isReply?: boolean;
};

type CommentSystemProps = {
  comments: Comment[];
  onAddComment: (text: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  onReplyToComment: (commentId: string) => void;
};

export default function CommentSystem({
  comments,
  onAddComment,
  onLikeComment,
  onReplyToComment
}: CommentSystemProps) {
  const { colors } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim(), replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
    }
  };
  
  const renderComment = ({ item, index }: { item: Comment; index: number }) => {
    return (
      <View style={[styles.commentContainer, item.isReply && styles.replyContainer]}>
        <Image source={{ uri: item.user.avatar }} style={styles.commentAvatar} />
        
        <View style={styles.commentContent}>
          <GlassmorphicCard style={styles.commentBubble}>
            <View style={styles.commentHeader}>
              <View style={styles.commentUserInfo}>
                <MuralText variant="tagline" style={styles.commentUsername}>
                  {item.user.username}
                </MuralText>
                {item.user.isVerified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: colors.primary }]}>
                    <MuralText variant="subtitle" style={styles.verifiedText}>
                      ✓
                    </MuralText>
                  </View>
                )}
              </View>
              <TouchableOpacity>
                <MoreHorizontal size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            <MuralText variant="subtitle" style={styles.commentText}>
              {item.text}
            </MuralText>
          </GlassmorphicCard>
          
          <View style={styles.commentActions}>
            <MuralText variant="subtitle" style={styles.commentTime}>
              {item.timeAgo}
            </MuralText>
            
            <TouchableOpacity 
              style={styles.commentAction}
              onPress={() => onLikeComment(item.id)}
            >
              <Heart 
                size={14} 
                color={item.isLiked ? colors.error : colors.textMuted}
                fill={item.isLiked ? colors.error : 'none'}
              />
              <MuralText variant="subtitle" style={styles.commentActionText}>
                {item.likes}
              </MuralText>
            </TouchableOpacity>
            
            {!item.isReply && (
              <TouchableOpacity 
                style={styles.commentAction}
                onPress={() => {
                  setReplyingTo(item.id);
                  onReplyToComment(item.id);
                }}
              >
                <Reply size={14} color={colors.textMuted} />
                <MuralText variant="subtitle" style={styles.commentActionText}>
                  Reply
                </MuralText>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Render replies */}
          {item.replies && item.replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {item.replies.map((reply) => (
                <View key={reply.id} style={styles.replyItem}>
                  {renderComment({ item: { ...reply, isReply: true }, index: 0 })}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        style={styles.commentsList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.commentSeparator} />}
      />
      
      {/* Comment Input */}
      <View style={styles.inputContainer}>
        {replyingTo && (
          <View style={styles.replyingIndicator}>
            <MuralText variant="subtitle" style={styles.replyingText}>
              Replying to comment...
            </MuralText>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <MuralText variant="subtitle" style={styles.cancelReply}>
                Cancel
              </MuralText>
            </TouchableOpacity>
          </View>
        )}
        
        <GlassmorphicCard style={styles.inputCard}>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textMuted}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              { backgroundColor: newComment.trim() ? colors.primary : colors.textMuted }
            ]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </GlassmorphicCard>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  replyContainer: {
    marginLeft: 40,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    padding: 12,
    borderRadius: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedBadge: {
    marginLeft: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 8,
    color: 'white',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 12,
  },
  commentTime: {
    fontSize: 12,
    opacity: 0.6,
    marginRight: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.8,
  },
  repliesContainer: {
    marginTop: 8,
  },
  replyItem: {
    marginBottom: 8,
  },
  commentSeparator: {
    height: 8,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  replyingIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  replyingText: {
    fontSize: 12,
    opacity: 0.8,
  },
  cancelReply: {
    fontSize: 12,
    color: '#ff6b6b',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});