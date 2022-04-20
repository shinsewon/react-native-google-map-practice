import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {Marker} from 'react-native-maps';
import CustomClusterMapView from '../components/CustomClusterMapView';
import MapZoomPanel from '../components/MapZoomPanel';

const getRandomLatitude = (min = 48, max = 56) => {
  return Math.random() * (max - min) + min;
};

const getRandomLongitude = (min = 14, max = 24) => {
  return Math.random() * (max - min) + min;
};

const getRegionForZoom = (lat, lon, zoom) => {
  const distanceDelta = Math.exp(Math.log(360) - zoom * Math.LN2);
  const {width, height} = Dimensions.get('window');
  const aspectRatio = width / height;
  return {
    latitude: lat,
    longitude: lon,
    latitudeDelta: distanceDelta * aspectRatio,
    longitudeDelta: distanceDelta,
  };
};

const getZoomFromRegion = region => {
  return Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2);
};

function App() {
  const map = useRef(null);

  const [zoom, setZoom] = useState(18);
  const [markers, setMarkers] = useState([
    {id: 0, latitude: 53.91326738786109, longitude: 27.523712915343737},
  ]);
  const [region, setRegion] = useState({
    latitude: 37.564362,
    longitude: 126.977011,
    latitudeDelta: 1.5,
    longitudeDelta: 1.5,
  });

  const generateMarkers = useCallback((lat, long) => {
    const markersArray = [];

    for (let i = 0; i < 50; i++) {
      markersArray.push({
        id: i,
        latitude: getRandomLatitude(lat - 0.05, lat + 0.05),
        longitude: getRandomLongitude(long - 0.05, long + 0.05),
      });
    }
    setMarkers(markersArray);
  }, []);

  const mapZoomIn = () => {
    if (zoom > 18) {
      setZoom(18);
    } else {
      setZoom(zoom + 1);
      const regn = getRegionForZoom(
        region.latitude,
        region.longitude,
        zoom + 1,
      );
      map.current.animateToRegion(regn, 200); // zoom 관리
    }
  };

  const mapZoomOut = () => {
    if (zoom < 3) {
      setZoom(3);
    } else {
      setZoom(zoom - 1);
      const regn = getRegionForZoom(
        region.latitude,
        region.longitude,
        zoom - 1,
      );
      map.current.animateToRegion(regn, 200); // zoom 관리
    }
  };

  const onRegionChangeComplete = newRegion => {
    setZoom(getZoomFromRegion(newRegion));
    setRegion(newRegion);
  };

  useEffect(() => {
    generateMarkers(region.latitude, region.longitude);
  }, [generateMarkers, region]);

  return (
    <View style={styles.container}>
      <CustomClusterMapView
        // mapType="hybrid"
        clusterColor="red"
        ref={map}
        style={styles.mapView}
        initialRegion={region}
        onRegionChangeComplete={onRegionChangeComplete}>
        {markers.map(item => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
          />
        ))}
      </CustomClusterMapView>
      <MapZoomPanel
        onZoomIn={() => {
          mapZoomIn();
        }}
        onZoomOut={() => {
          mapZoomOut();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapView: {flex: 1, width: '100%', height: '100%'},
  customMarker: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
