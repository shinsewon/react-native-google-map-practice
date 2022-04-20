import React from 'react';
import {Pressable, View, Text} from 'react-native';
import {StyleSheet} from 'react-native';

const defaultProps = {
  onZoomIn: () => {
    console.log('zoomIn');
  },
  onZoomOut: () => {
    console.log('zoomOut');
  },
};

const MapZoomPanel = props => {
  const panelProps = {...defaultProps, ...props};

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={panelProps.onZoomIn}>
        <Text>+</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={panelProps.onZoomOut}>
        <Text>-</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    alignContent: 'stretch',
    position: 'absolute',
    right: 15,
    width: 50,
    top: '25%',
  },
  button: {
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#000',
    borderWidth: 0.5,
    backgroundColor: '#fff',
    marginVertical: 5,
  },
});

export default MapZoomPanel;
