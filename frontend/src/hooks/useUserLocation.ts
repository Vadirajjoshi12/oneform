import { useState, useEffect, useCallback } from 'react';
import { UserLocationState, Community } from '../types';
import { calculateDistanceInKm, isWithinGeofence } from '../utils/location';

export function useUserLocation() {
  const [locationState, setLocationState] = useState<UserLocationState>({
    coords: null,
    status: 'idle',
    error: null,
    isSimulated: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState({
        coords: null,
        status: 'unsupported',
        error: 'Geolocation is not supported by your browser.',
        isSimulated: false,
      });
      return;
    }

    setLocationState((prev) => ({ ...prev, status: 'locating', error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          status: 'granted',
          error: null,
          accuracy: position.coords.accuracy,
          updatedAt: Date.now(),
          isSimulated: false,
        });
      },
      (error) => {
        let errorMsg = 'Failed to retrieve your current location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please enable location access in your browser to create or join order pools at your physical location.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'GPS signal unavailable. Please ensure location services are enabled on your device.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'GPS location request timed out. Retrying...';
        }

        setLocationState({
          coords: null,
          status: 'denied',
          error: errorMsg,
          isSimulated: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  // Watch position for changes as user moves
  useEffect(() => {
    requestLocation();

    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocationState({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          status: 'granted',
          error: null,
          accuracy: position.coords.accuracy,
          updatedAt: Date.now(),
          isSimulated: false,
        });
      },
      (error) => {
        // Don't overwrite if granted previously unless denied
        if (error.code === error.PERMISSION_DENIED) {
          setLocationState({
            coords: null,
            status: 'denied',
            error: 'Location permission denied.',
            isSimulated: false,
          });
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [requestLocation]);

  const getDistanceToCommunity = useCallback(
    (community: Community): number | null => {
      if (!locationState.coords) return null;
      return calculateDistanceInKm(
        locationState.coords.lat,
        locationState.coords.lng,
        community.lat,
        community.lng
      );
    },
    [locationState.coords]
  );

  const isCommunityInGeofence = useCallback(
    (community: Community): boolean => {
      if (!locationState.coords) return false;
      const radius = community.radiusKm || 2.0;
      return isWithinGeofence(
        locationState.coords.lat,
        locationState.coords.lng,
        community.lat,
        community.lng,
        radius
      );
    },
    [locationState.coords]
  );

  return {
    locationState,
    requestLocation,
    getDistanceToCommunity,
    isCommunityInGeofence,
  };
}

