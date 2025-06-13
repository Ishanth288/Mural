import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Bell, Moon, Globe, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Info, Smartphone, Brush, Eye } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '@/components/ui/GlassmorphicCard';
import MuralText from '@/components/ui/MuralText';
import MuralLogo from '@/components/ui/MuralLogo';

type SettingSection = {
  title: string;
  items: SettingItem[];
};

type SettingItem = {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  type: 'toggle' | 'link' | 'radio';
  value?: boolean;
  description?: string;
  color?: string;
};

export default function SettingsScreen() {
  const { colors } = useTheme();
  
  const [settings, setSettings] = useState<SettingSection[]>([
    {
      title: 'Mural Preferences',
      items: [
        {
          id: 'notifications',
          icon: Bell,
          title: 'Notifications',
          type: 'toggle',
          value: true,
          description: 'Receive notifications about new murals',
          color: colors.primary,
        },
        {
          id: 'darkMode',
          icon: Moon,
          title: 'Dark Mode',
          type: 'toggle',
          value: true,
          description: 'Enable dark mode',
          color: colors.accent,
        },
        {
          id: 'language',
          icon: Globe,
          title: 'Language',
          type: 'link',
          description: 'English (US)',
          color: colors.secondary,
        },
      ],
    },
    {
      title: 'Creation Settings',
      items: [
        {
          id: 'defaultBrush',
          icon: Brush,
          title: 'Default Brush',
          type: 'link',
          description: 'Neon Spray',
          color: colors.primary,
        },
        {
          id: 'cameraQuality',
          icon: Smartphone,
          title: 'Camera Quality',
          type: 'link',
          description: 'High (Recommended)',
          color: colors.success,
        },
        {
          id: 'arVisibility',
          icon: Eye,
          title: 'Mural Visibility',
          type: 'toggle',
          value: true,
          description: 'Make new murals public by default',
          color: colors.warning,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'privacy',
          icon: Shield,
          title: 'Privacy Settings',
          type: 'link',
          description: 'Manage your data and privacy',
          color: colors.warning,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          icon: HelpCircle,
          title: 'Help & Support',
          type: 'link',
          description: 'Get help with Mural',
          color: colors.secondary,
        },
        {
          id: 'about',
          icon: Info,
          title: 'About Mural',
          type: 'link',
          description: 'Version 1.0.0',
          color: colors.primary,
        },
      ],
    },
    {
      title: '',
      items: [
        {
          id: 'logout',
          icon: LogOut,
          title: 'Log Out',
          type: 'link',
          color: colors.error,
        },
      ],
    },
  ]);
  
  const handleToggle = (sectionIndex: number, itemIndex: number) => {
    const newSettings = [...settings];
    const item = newSettings[sectionIndex].items[itemIndex];
    if (item.type === 'toggle') {
      item.value = !item.value;
      setSettings(newSettings);
    }
  };
  
  const renderSettingItem = (item: SettingItem, sectionIndex: number, itemIndex: number) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={() => {
          if (item.type === 'toggle') {
            handleToggle(sectionIndex, itemIndex);
          }
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <item.icon size={20} color={item.color} />
        </View>
        
        <View style={styles.settingContent}>
          <MuralText variant="tagline" style={[styles.settingTitle, { color: colors.text }]}>
            {item.title}
          </MuralText>
          {item.description && (
            <MuralText variant="subtitle" style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {item.description}
            </MuralText>
          )}
        </View>
        
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={() => handleToggle(sectionIndex, itemIndex)}
            trackColor={{ false: '#3e3e3e', true: `${item.color}50` }}
            thumbColor={item.value ? item.color : '#f4f3f4'}
          />
        ) : (
          <ChevronRight size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View style={styles.brandHeader}>
          <MuralLogo size={28} />
          <MuralText variant="logo" style={styles.headerTitle}>
            Settings
          </MuralText>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 100 : 80 }}
      >
        {settings.map((section, sectionIndex) => (
          <View key={section.title || `section-${sectionIndex}`} style={styles.section}>
            {section.title && (
              <MuralText variant="subtitle" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {section.title}
              </MuralText>
            )}
            
            <GlassmorphicCard style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                renderSettingItem(item, sectionIndex, itemIndex)
              ))}
            </GlassmorphicCard>
          </View>
        ))}
        
        {/* Mural branding footer */}
        <View style={styles.brandFooter}>
          <MuralLogo size={32} color={colors.textMuted} />
          <MuralText variant="subtitle" style={styles.brandFooterText}>
            Made with ❤️ by the Mural Team
          </MuralText>
          <MuralText variant="subtitle" style={styles.taglineFooter}>
            Paint the Streets Digitally
          </MuralText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 28,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 8,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  brandFooter: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 32,
  },
  brandFooterText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.6,
  },
  taglineFooter: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.4,
  },
});