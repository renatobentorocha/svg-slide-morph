import React, { useRef } from 'react';
import { StyleSheet, Dimensions, FlatListProps, View } from 'react-native';

import {
  PanGestureHandler,
  State,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

import Animated, {
  block,
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
  stopClock,
  Extrapolate,
  and,
  call,
  multiply,
  add,
  divide,
  sub,
  lessThan,
  greaterThan,
  or,
  onChange,
  greaterOrEq,
  not,
} from 'react-native-reanimated';

import Svg, { ClipPath, Defs, Image, Path, Rect } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width, height } = Dimensions.get('window');

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

const Page = ({
  fillPath,
  zIndex,
  listRef,
  total,
}: {
  fillPath: string;
  zIndex: number;
  listRef: React.RefObject<FlatListProps<JSX.Element>>;
  total: number;
}) => {
  const gestureState = useRef(new Animated.Value<State>(State.UNDETERMINED))
    .current;

  const gestureOldState = useRef(new Animated.Value<State>(State.UNDETERMINED))
    .current;

  const translateX = useRef(new Animated.Value<number>(width)).current;
  const translateY = useRef(new Animated.Value<number>(height)).current;

  const translateXRightCorner = useRef(new Animated.Value<number>(width))
    .current;
  const translateYRightCorner = useRef(new Animated.Value<number>(height))
    .current;

  const translateXLeftCorner = useRef(new Animated.Value<number>(0)).current;
  const translateYLeftCorner = useRef(new Animated.Value<number>(0)).current;

  const velocityX = useRef(new Animated.Value<number>(width)).current;

  const extrapolateSnapPoint = useRef(new Animated.Value<number>(0)).current;

  const snapPoint = useRef(new Animated.Value<number>(0)).current;

  const snapToRight = cond(lessThan(velocityX, 0), 1, 0);

  useCode(
    () =>
      block([
        onChange(
          translateX,
          cond(
            snapToRight,
            set(translateXRightCorner, translateX),
            set(translateXLeftCorner, translateX)
          )
        ),
        onChange(
          translateY,
          cond(
            snapToRight,
            set(translateYRightCorner, translateY),
            set(translateYLeftCorner, translateY)
          )
        ),
      ]),
    []
  );

  const onGestureEvent = event<PanGestureHandlerGestureEvent>([
    {
      nativeEvent: {
        x: translateX,
        y: translateY,
        velocityX,
      },
    },
  ]);

  const onHandlerStateChange = event<PanGestureHandlerStateChangeEvent>([
    {
      nativeEvent: { state: gestureState, oldState: gestureOldState },
    },
  ]);

  const dPath = concat(
    `M 0,0 H ${width} S `,
    cond(lessThan(velocityX, 0), translateXRightCorner, width),
    `,`,
    cond(lessThan(velocityX, 0), translateYRightCorner, height),
    ` ${width},${height} `,
    `H 0 S `,
    cond(greaterOrEq(velocityX, 0), translateXLeftCorner, 0),
    `,`,
    cond(greaterOrEq(velocityX, 0), translateYLeftCorner, 0),
    ` ${0},${0} `
  );

  const dPathFixo = `M 0,0 H ${width} S ${width},${height} ${width},${height} H 0 Z`;

  const scrollTo = (args: readonly number[]) => {
    listRef.current.scrollToIndex({ index: args[0] });
  };

  useCode(
    () =>
      cond(
        and(eq(gestureState, State.END), eq(gestureOldState, State.ACTIVE)),
        [
          set(
            extrapolateSnapPoint,
            cond(
              lessThan(velocityX, 0),
              divide(multiply(add(zIndex, 1), width), width),
              divide(multiply(sub(zIndex, 1), width), width)
            )
          ),

          set(
            snapPoint,
            cond(
              or(
                lessThan(extrapolateSnapPoint, 0),
                greaterThan(extrapolateSnapPoint, total)
              ),
              zIndex,
              extrapolateSnapPoint
            )
          ),

          set(translateXRightCorner, width),
          set(translateYRightCorner, height),
          set(translateXLeftCorner, 0),
          set(translateYLeftCorner, 0),
          call([snapPoint], scrollTo),
        ]
      ),
    []
  );

  return (
    <View>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View>
          <View>
            <Svg
              height={height}
              width={width}
              style={{ backgroundColor: 'red' }}
            >
              <Defs>
                <ClipPath id="clip">
                  <Path d={dPathFixo} stroke="red" fill={fillPath} />
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
                href={images[zIndex === total ? zIndex - 1 : zIndex + 1]()}
                clipPath="url(#clip)"
              />
            </Svg>
          </View>
          <Animated.View
            style={[
              { zIndex: 999, width, height, backgroundColor: 'transparent' },
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
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default Page;
