import React, {
  forwardRef,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Dimensions, LayoutAnimation, Platform} from 'react-native';
import MapView, {Polyline} from 'react-native-maps';
import SuperCluster from 'supercluster';
import ClusterMarker from './ClusterMaker';
import {
  calculateBBox,
  generateSpiral,
  isMarker,
  markerToGeoJSONFeature,
  returnMapZoom,
} from '../helpers';

const CustomClusterMapView = forwardRef(
  (
    {
      radius,
      maxZoom,
      minZoom,
      minPoints,
      extent,
      nodeSize,
      children, //
      onClusterPress,
      onRegionChangeComplete, //
      onMarkersChange,
      preserveClusterPressBehavior,
      // clusteringEnabled,
      clusterColor,
      clusterTextColor,
      clusterFontFamily,
      spiderLineColor,
      layoutAnimationConf,
      animationEnabled,
      renderCluster,
      tracksViewChanges,
      spiralEnabled,
      superClusterRef,
      ...restProps
    },
    ref,
  ) => {
    const [markers, setMarkers] = useState([]);
    const [spiderMarkers, updateSpiderMarker] = useState([]);
    const [otherChildren, updateChildren] = useState([]);
    const [superCluster, setSuperCluster] = useState(null);
    const [currentRegion, updateRegion] = useState(
      restProps.region || restProps.initialRegion,
    );

    const mapRef = useRef();
    const propsChildren = useMemo(
      () => React.Children.toArray(children),
      [children],
    );

    useEffect(() => {
      const rawData = [];
      const otherChildren = [];

      propsChildren.forEach((child, index) => {
        if (isMarker(child)) {
          //여기가 실행됨
          rawData.push(markerToGeoJSONFeature(child, index));
        } else {
          otherChildren.push(child);
        }
      });

      const superCluster = new SuperCluster({
        radius,
        maxZoom,
        minZoom,
        minPoints,
        extent,
        nodeSize,
      });

      superCluster.load(rawData);
      const bBox = calculateBBox(currentRegion);
      const zoom = returnMapZoom(currentRegion, bBox, minZoom);
      const markers = superCluster.getClusters(bBox, zoom);
      setMarkers(markers);
      updateChildren(otherChildren);
      setSuperCluster(superCluster);

      superClusterRef.current = superCluster;
    }, [
      propsChildren,
      // clusteringEnabled,
      currentRegion,
      extent,
      maxZoom,
      minPoints,
      minZoom,
      nodeSize,
      radius,
      superClusterRef,
    ]);

    useEffect(() => {
      if (markers.length > 0) {
        const allSpiderMarkers = [];
        let spiralChildren = [];
        markers.map((marker, i) => {
          if (marker.properties.cluster) {
            spiralChildren = superCluster.getLeaves(
              marker.properties.cluster_id,
              Infinity,
            );
          }

          console.log('markers>>', markers);
          const positions = generateSpiral(marker, spiralChildren, markers, i);
          allSpiderMarkers.push(...positions);
        });

        updateSpiderMarker(allSpiderMarkers);
      } else {
        updateSpiderMarker([]);
      }
    }, [markers, spiralEnabled, superCluster]);

    const _onRegionChangeComplete = region => {
      if (superCluster && region) {
        const bBox = calculateBBox(region);
        const zoom = returnMapZoom(region, bBox, minZoom);
        const markers = superCluster.getClusters(bBox, zoom);
        if (animationEnabled && Platform.OS === 'ios') {
          LayoutAnimation.configureNext(layoutAnimationConf);
        }

        setMarkers(markers);
        onMarkersChange(markers);
        onRegionChangeComplete(region, markers);
        updateRegion(region);
      } else {
        onRegionChangeComplete(region);
      }
    };

    return (
      <MapView
        {...restProps}
        ref={map => {
          mapRef.current = map;
          if (ref) {
            ref.current = map;
          }
          restProps.mapRef(map);
        }}
        onRegionChangeComplete={_onRegionChangeComplete}>
        {markers.map(marker =>
          marker.properties.point_count === 0 ? (
            propsChildren[marker.properties.index]
          ) : (
            <ClusterMarker
              key={`cluster-${marker.id}`}
              {...marker}
              clusterColor={
                restProps.selectedClusterId === marker.id
                  ? restProps.selectedClusterColor
                  : clusterColor
              }
              clusterTextColor={clusterTextColor}
              clusterFontFamily={clusterFontFamily}
              tracksViewChanges={tracksViewChanges}
            />
          ),
        )}
        {otherChildren}
      </MapView>
    );
  },
);

CustomClusterMapView.defaultProps = {
  clusteringEnabled: true,
  spiralEnabled: true,
  animationEnabled: true,
  preserveClusterPressBehavior: false,
  layoutAnimationConf: LayoutAnimation.Presets.spring,
  tracksViewChanges: false,
  // SuperCluster parameters
  radius: Dimensions.get('window').width * 0.06,
  maxZoom: 20,
  minZoom: 1,
  minPoints: 2,
  extent: 512,
  nodeSize: 64,
  // Map parameters
  edgePadding: {top: 50, left: 50, right: 50, bottom: 50},
  // Cluster styles
  clusterColor: '#00B386',
  clusterTextColor: '#FFFFFF',
  spiderLineColor: '#FF0000',
  // Callbacks
  onRegionChangeComplete: () => {},
  onClusterPress: () => {},
  onMarkersChange: () => {},
  superClusterRef: {},
  mapRef: () => {},
};

export default memo(CustomClusterMapView);
