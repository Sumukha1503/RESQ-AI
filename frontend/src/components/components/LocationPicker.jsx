import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Locate, MapPin, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { getLocationPreview } from '../../services/api';

const LocationPicker = ({ onLocationSelect, location, className = "" }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [mapPreview, setMapPreview] = useState(null);

  const handleLocationUpload = () => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Get map preview from backend which uses the real Geoapify API key
          const previewData = await getLocationPreview({ latitude, longitude });
          
          const locationData = {
            latitude,
            longitude,
            address: ""
          };
          
          setMapPreview(previewData);
          onLocationSelect(locationData);
          toast.success("Location captured successfully!");
        } catch (error) {
          // Fallback to placeholder if backend fails
          const mapPreviewUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=400&height=200&center=lonlat:${longitude},${latitude}&zoom=15&marker=lonlat:${longitude},${latitude};type:material;color:%233bb2d0;icontype:awesome`;
          
          const locationData = {
            latitude,
            longitude,
            address: ""
          };
          
          setMapPreview({
            location: locationData,
            map_preview_url: mapPreviewUrl
          });
          
          onLocationSelect(locationData);
          toast.success("Location captured successfully!");
        }
        
        setIsLocating(false);
      },
      (error) => {
        toast.error(`Unable to retrieve your location: ${error.message}`);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleReset = () => {
    setMapPreview(null);
    onLocationSelect(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!location ? (
        <Card className="border-2 border-dashed border-emerald-300/50 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Locate className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Upload Current Location</h3>
            <p className="text-sm text-white/80 mb-4">
              Click below to upload your current location. This will use your browser's geolocation service.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-white/70 mb-4 p-3 bg-white/5 rounded-lg">
              <Shield className="h-4 w-4 text-emerald-300" />
              <span>Your privacy is important - we only collect coordinates, not your full address.</span>
            </div>
            <Button 
              onClick={handleLocationUpload} 
              disabled={isLocating}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg transition-all duration-300"
            >
              {isLocating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Locating...
                </>
              ) : (
                <>
                  <Locate className="h-4 w-4 mr-2" />
                  Upload Current Location
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border-emerald-400/30">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-400" />
                <div>
                  <h4 className="font-medium text-white">Location Confirmed</h4>
                  <p className="text-sm text-white/80">
                    Latitude: {location.latitude.toFixed(6)}, 
                    Longitude: {location.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Change
              </Button>
            </div>
            {mapPreview && (
              <div className="mt-3 rounded-lg overflow-hidden border border-white/20">
                <img 
                  src={mapPreview.map_preview_url} 
                  alt="Location preview" 
                  className="w-full h-40 object-cover"
                />
                <div className="p-2 bg-black/20 text-white/80 text-xs text-center">
                  Map Preview
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Location UI Description */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/20">
        <p className="text-sm text-white/90">
          <span className="font-medium">Privacy-First:</span> Coordinates only, no full addresses. 
          Browser geolocation with user consent.
        </p>
      </div>
    </div>
  );
};

export default LocationPicker;