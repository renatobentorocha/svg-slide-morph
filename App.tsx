import { StatusBar } from 'expo-status-bar';
import React, { useRef } from 'react';
import { StyleSheet, Dimensions, View, FlatList } from 'react-native';
import {
  State,
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Animated, {
  block,
  clockRunning,
  concat,
  cond,
  interpolate,
  set,
  spring,
  SpringUtils,
  useCode,
  event,
  debug,
  eq,
  startClock,
  stopClock,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, Image, Path, Rect } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width, height } = Dimensions.get('window');

// const dPath = `
// M 0,0 H ${width}
// S ${width - 200},${height - 100} ${width},${height}
// H 0
// Z`;

const FILL_COLORS = ['red', 'green', 'yellow', 'orange'];

const images = {
  0: () => require('./0.jpg'),
  1: () => require('./1.jpg'),
  2: () => require('./2.jpg'),
  3: () => require('./3.jpg'),
  4: () => require('./4.jpg'),
};

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

const Item = ({ fillPath, zIndex }: { fillPath: string; zIndex: number }) => {
  const clock = useRef(new Animated.Clock()).current;
  const progress = useRef(new Animated.Value<number>(0)).current;

  const tapGestureState = useRef(new Animated.Value<State>(State.UNDETERMINED))
    .current;

  useCode(
    () =>
      cond(clockRunning(clock), [
        set(progress, withSpring(clock)),
        debug('progress', progress),
      ]),
    []
  );

  const controlPointLeft = interpolate(progress, {
    inputRange: [0, 1],
    outputRange: [width, width - 200],
    extrapolate: Extrapolate.CLAMP,
  });

  const controlPointTop = interpolate(progress, {
    inputRange: [0, 1],
    outputRange: [0, height - 100],
    extrapolate: Extrapolate.CLAMP,
  });

  const dPath = concat(
    `M 0,0 H ${width} S `,
    controlPointLeft,
    `,`,
    height / 2,
    ` ${width},${height} `,
    `H 0
     Z`
  );

  // const dPath = `
  //   M 0,0 H ${width}
  //   S ${0},${0} ${width},${height}
  //   H 0
  //   Z`;

  const onGestureEvent = event<TapGestureHandlerStateChangeEvent>([
    {
      nativeEvent: { state: tapGestureState },
    },
  ]);

  useCode(
    () =>
      cond(eq(tapGestureState, State.BEGAN), [
        startClock(clock),
        // debug('tapGestureState', tapGestureState),
      ]),
    []
  );

  return (
    <TapGestureHandler onHandlerStateChange={onGestureEvent}>
      <Animated.View
        style={[
          { zIndex, width, height, backgroundColor: 'transparent' },
          StyleSheet.absoluteFill,
        ]}
      >
        <Svg
          height={height}
          width={width}
          style={{ backgroundColor: 'transparent' }}
        >
          <Defs>
            <ClipPath id="clip">
              <AnimatedPath d={dPath} stroke="red" fill={fillPath} />
            </ClipPath>
          </Defs>
          <Rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="#171717"
            clipPath="url(#clip)"
          />
          <Image
            width={width}
            height={height}
            preserveAspectRatio="xMidYMid meet"
            opacity="1"
            href={images[zIndex]()}
            clipPath="url(#clip)"
          />
        </Svg>
      </Animated.View>
    </TapGestureHandler>
  );
};

const data: JSX.Element[] = [0, 1, 2, 3].map((i) => (
  <Item key={i.toString()} fillPath={FILL_COLORS[i]} zIndex={i} />
));

export default function App() {
  return (
    <View style={styles.container}>
      <FlatList
        style={{ width, height, backgroundColor: 'transparent' }}
        data={data}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => item}
        pagingEnabled
        horizontal
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
