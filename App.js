import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import ExploreScreen from './screens/ExploreScreen';
import ClusterMapScreen from './screens/ClusterMapScreen';

const App = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      {/* 유튜브에서 보여줬던 마커 및  하단 슬라이더 구현 (하나씩 주석을 풀면서 확인 해보세요)*/}
      <ExploreScreen />
      {/* 클러스터 맵  구현 (하나씩 주석을 풀면서 확인 해보세요)*/}
      {/* <ClusterMapScreen /> */}
    </SafeAreaView>
  );
};

export default App;
