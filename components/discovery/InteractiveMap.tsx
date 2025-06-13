import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import { MapPin, Filter, Layers, Navigation } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import MuralText from '../ui/MuralText';
import MuralLogo from '../ui/MuralLogo';

const { width, height } = Dimensions.get('window');

type ArtLocation = {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  likes: number;
  distance: string;
  category: string;
  isHotspot: boolean;
};

type InteractiveMapProps = {
  artLocations: ArtLocation[];
  onLocationSelect: (location: ArtLocation) => void;
  onFilterChange: (filters: string[]) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
};

export default function InteractiveMap({
  artLocations,
  onLocationSelect,
  onFilterChange,
  userLocation
}: InteractiveMapProps) {
  const { colors } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<ArtLocation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const categories = ['All', 'Graffiti', 'Murals', 'Digital Art', 'Stencils', 'Installations'];
  
  const handleLocationPress = (location: ArtLocation) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };
  
  const toggleFilter = (category: string) => {
    let newFilters;
    if (category === 'All') {
      newFilters = [];
    } else {
      newFilters = activeFilters.includes(category)
        ? activeFilters.filter(f => f !== category)
        : [...activeFilters, category];
    }
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const renderMapPin = (location: ArtLocation, index: number) => {
    const isSelected = selectedLocation?.id === location.id;
    const pinSize = location.isHotspot ? 60 : 40;
    
    return (
      <TouchableOpacity
        key={location.id}
        style={[
          styles.mapPin,
          {
            left: (index % 3) * (width / 3) + 50,
            top: (Math.floor(index / 3) * 120) + 100,
            width: pinSize,
            height: pinSize,
          },
          isSelected && styles.selectedPin
        ]}
        onPress={() => handleLocationPress(location)}
        activeOpacity={0.8}
      >
        <View style={[
          styles.pinContainer,
          { 
            backgroundColor: location.isHotspot ? colors.warning : colors.primary,
            borderColor: isSelected ? colors.accent : 'transparent'
          }
        ]}>
          <Image 
            source={{ uri: location.imageUrl }}
            style={styles.pinImage}
          />
          
          {location.isHotspot && (
            <View style={styles.hotspotIndicator}>
              <MuralText variant="subtitle" style={styles.hotspotText}>
                🔥
              </MuralText>
            </View>
          )}
        </View>
        
        <View style={[styles.pinShadow, { backgroundColor: colors.primary + '30' }]} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Mock Map Background */}
      <View style={[styles.mapBackground, { backgroundColor: colors.background }]}>
        <View style={styles.mapGrid}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={[styles.gridLine, { backgroundColor: colors.border }]} />
          ))}
        </View>
        
        {/* User Location */}
        {userLocation && (
          <View style={[styles.userLocation, { backgroundColor: colors.accent }]}>
            <Navigation size={16} color="white" />
          </View>
        )}
        
        {/* Art Locations */}
        {artLocations.map(renderMapPin)}
        
        {/* Heatmap Overlay */}
        <View style={styles.heatmapOverlay}>
          {artLocations.filter(loc => loc.isHotspot).map((location, index) => (
            <View
              key={`heatmap-${location.id}`}
              style={[
                styles.heatmapBlob,
                {
                  left: (index % 2) * (width / 2),
                  top: (Math.floor(index / 2) * 200) + 150,
                  backgroundColor: colors.warning + '20',
                }
              ]}
            />
          ))}
        </View>
      </View>
      
      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.secondary }]}>
          <Layers size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.accent }]}>
          <MapPin size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <GlassmorphicCard style={styles.filterCard}>
            <MuralText variant="tagline" style={styles.filterTitle}>
              Filter by Category
            </MuralText>
            
            <View style={styles.filterOptions}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor: (category === 'All' && activeFilters.length === 0) || 
                                     activeFilters.includes(category)
                        ? colors.primary + '30'
                        : 'transparent',
                      borderColor: (category === 'All' && activeFilters.length === 0) || 
                                  activeFilters.includes(category)
                        ? colors.primary
                        : colors.border
                    }
                  ]}
                  onPress={() => toggleFilter(category)}
                >
                  <MuralText variant="subtitle" style={styles.filterOptionText}>
                    {category}
                  </MuralText>
                </TouchableOpacity>
              ))}
            </View>
          </GlassmorphicCard>
        </View>
      )}
      
      {/* Selected Location Details */}
      {selectedLocation && (
        <View style={styles.locationDetails}>
          <GlassmorphicCard style={styles.detailsCard}>
            <Image 
              source={{ uri: selectedLocation.imageUrl }}
              style={styles.detailsImage}
            />
            
            <View style={styles.detailsContent}>
              <MuralText variant="tagline" style={styles.detailsTitle}>
                {selectedLocation.title}
              </MuralText>
              <MuralText variant="subtitle" style={styles.detailsArtist}>
                by {selectedLocation.artist}
              </MuralText>
              <MuralText variant="subtitle" style={styles.detailsDistance}>
                {selectedLocation.distance} away
              </MuralText>
              
              <View style={styles.detailsActions}>
                <TouchableOpacity style={[styles.detailsButton, { backgroundColor: colors.primary }]}>
                  <MuralText variant="subtitle" style={styles.detailsButtonText}>
                    Navigate
                  </MuralText>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.detailsButton, { backgroundColor: colors.secondary }]}>
                  <MuralText variant="subtitle" style={styles.detailsButtonText}>
                    View AR
                  </MuralText>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.closeDetails}
              onPress={() => setSelectedLocation(null)}
            >
              <MuralText variant="subtitle" style={styles.closeDetailsText}>
                ✕
              </MuralText>
            </TouchableOpacity>
          </GlassmorphicCard>
        </View>
      )}
      
      {/* Mural Branding */}
      <View style={styles.mapBranding}>
        <MuralLogo size={20} color={colors.textMuted} />
        <MuralText variant="subtitle" style={styles.brandingText}>
          Mural Map
        </MuralText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    position: 'relative',
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridLine: {
    width: '100%',
    height: 1,
    marginVertical: 20,
    opacity: 0.1,
  },
  userLocation: {
    position: 'absolute',
    top: height / 2,
    left: width / 2 - 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  selectedPin: {
    zIndex: 100,
  },
  pinContainer: {
    borderRadius: 20,
    borderWidth: 3,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pinImage: {
    width: '100%',
    height: '100%',
  },
  hotspotIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotspotText: {
    fontSize: 10,
  },
  pinShadow: {
    width: 20,
    height: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  heatmapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  heatmapBlob: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  mapControls: {
    position: 'absolute',
    top: 60,
    right: 16,
    alignItems: 'center',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  filterPanel: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
  },
  filterCard: {
    padding: 16,
  },
  filterTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionText: {
    fontSize: 12,
  },
  locationDetails: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  detailsCard: {
    flexDirection: 'row',
    padding: 16,
    position: 'relative',
  },
  detailsImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  detailsContent: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  detailsArtist: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  detailsDistance: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  detailsActions: {
    flexDirection: 'row',
  },
  detailsButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 12,
  },
  closeDetails: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeDetailsText: {
    fontSize: 16,
    opacity: 0.6,
  },
  mapBranding: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandingText: {
    marginLeft: 6,
    fontSize: 12,
    opacity: 0.5,
  },
});