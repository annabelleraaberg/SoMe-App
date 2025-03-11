// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/components/MyUltimateMap.tsx

import { Platform, View, Text } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import WebMap from "@teovilla/react-native-web-maps";
import { useEffect, useRef } from "react";

interface MapComponentProps {
  children: React.ReactNode;
  initialRegion: Region | undefined;
  postPosition: { location: { latitude: number; longitude: number } };
  showsUserLocation?: boolean;
}

export default function MapComponent({
  children,
  initialRegion,
  postPosition,
  showsUserLocation = false,
}: MapComponentProps) {
  const mapRef = useRef<any>(null);

  if (!postPosition?.location) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  console.log("Initial region: ", initialRegion);

  useEffect(() => {
    if (Platform.OS === "web" && mapRef.current) {
      const position = {
        lat: postPosition.location.latitude,
        lng: postPosition.location.longitude,
      };

      const map = mapRef.current;
      console.log("Map is loaded: ", map);
    }
  }, [postPosition]);

  if (Platform.OS === "web") {
    return (
      <WebMap
        id="webMap"
        ref={mapRef}
        provider="google"
        initialRegion={initialRegion}
        zoomEnabled={false}
        googleMapsApiKey="AIzaSyBiT1iApNloXZGNLvSU3Hb9igVYzuEL3t4"
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
        }}
        onLoad={() => console.log("Web Map Loaded")}
      >
        {children}
      </WebMap>
    );
  } else {
    return (
      <MapView
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {children}
        <Marker
          coordinate={{
            latitude: postPosition.location.latitude,
            longitude: postPosition.location.longitude,
          }}
        />
      </MapView>
    );
  }
}
