import { useState, useEffect, useCallback, useRef } from 'react';
import { UserLocationState, Community } from '../types';
import { calculateDistanceInKm, isWithinGeofence } from '../utils/location';

const MIN_LOCATION_UPDATE_DISTANCE_KM = 0.05; // 50 metres
const MIN_LOCATION_UPDATE_INTERVAL_MS = 15000; // 15 seconds

export function useUserLocation() {
  const [locationState, setLocationState] = useState<UserLocationState>({
    coords: null,
    status: 'idle',
    error: null,
    isSimulated: false,
  });

  // Prevent tiny GPS movements from causing the entire app
  // to re-render repeatedly.
  const lastAppliedLocationRef = useRef<{
    lat: number;
    lng: number;
    at: number;
  } | null>(null);

  const applyLocation = useCallback((position: GeolocationPosition) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const now = Date.now();

    const previous = lastAppliedLocationRef.current;

    if (previous) {
      const movedKm = calculateDistanceInKm(
        previous.lat,
        previous.lng,
        lat,
        lng
      );

      // Ignore tiny GPS jitter when the user hasn't moved meaningfully.
      if (
        movedKm < MIN_LOCATION_UPDATE_DISTANCE_KM &&
        now - previous.at < MIN_LOCATION_UPDATE_INTERVAL_MS
      ) {
        return;
      }
    }

    lastAppliedLocationRef.current = {
      lat,
      lng,
      at: now,
    };

    setLocationState({
      coords: {
        lat,
        lng,
      },
      status: 'granted',
      error: null,
      accuracy: position.coords.accuracy,
      updatedAt: now,
      isSimulated: false,
    });
  }, []);

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

    setLocationState((prev) => ({
      ...prev,
      status: 'locating',
      error: null,
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyLocation(position);
      },
      (error) => {
        let errorMsg = 'Failed to retrieve your current location.';

        if (error.code === error.PERMISSION_DENIED) {
          errorMsg =
            'Location permission denied. Please enable location access in your browser to create or join order pools at your physical location.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg =
            'GPS signal unavailable. Please ensure location services are enabled on your device.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg =
            'GPS location request timed out. Retrying...';
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
  }, [applyLocation]);

  // Watch position for meaningful changes.
  useEffect(() => {
    requestLocation();

    if (!navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        applyLocation(position);
      },
      (error) => {
        // Don't overwrite an already-granted location unless permission
        // has actually been denied.
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
  }, [requestLocation, applyLocation]);

  const getDistanceToCommunity = useCallback(
    (community: Community): number | null => {
      if (!locationState.coords) {
        return null;
      }

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
      if (!locationState.coords) {
        return false;
      }

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