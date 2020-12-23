import { StatusBar } from 'expo-status-bar';
import React, { useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  FlatList,
  FlatListProps,
} from 'react-native';

import Animated, {
  block,
  cond,
  set,
  spring,
  SpringUtils,
  stopClock,
} from 'react-native-reanimated';

import Page from './Page';

const { width, height } = Dimensions.get('window');

const FILL_COLORS = ['red', 'green', 'yellow', 'orange'];

const withSpring = (clock: Animated.Clock) => {
  const state: Animated.PhysicsAnimationState = {
    finished: new Animated.Value(0),
    position: new Animated.Value(0),
    velocity: new Animated.Value(0),
    time: new Animated.Value(0),
  };

  return block([
    spring(clock, state, { ...SpringUtils.makeDefaultConfig(), toValue: 1 }),
    cond(state.finished, [
      stopClock(clock),
      set(state.finished, 0),
      set(state.time, 0),
      set(state.velocity, 0),
    ]),
    state.position,
  ]);
};

const renderItem = (
  index: number,
  listRef: React.RefObject<FlatListProps<JSX.Element>>
) => (
  <Page
    key={index.toString()}
    fillPath={FILL_COLORS[index]}
    zIndex={index}
    listRef={listRef}
  />
);

export default function App() {
  const listRef = useRef<FlatListProps<JSX.Element>>(null);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        contentContainerStyle={{ position: 'absolute' }}
        style={{
          width,
          height,
          backgroundColor: 'transparent',
        }}
        data={[0, 1, 2, 3]}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ index }) => renderItem(index, listRef)}
        pagingEnabled
        horizontal
        onScrollToIndexFailed={(info) => console.log(info)}
        scrollEnabled={false}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
