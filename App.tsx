import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Dimensions, View, FlatList } from 'react-native';
import Svg, { ClipPath, Defs, Image, Path, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const dPath = `
M 0,0 H ${width} 
S ${width - 200},${height - 100} ${width},${height}
H 0
Z`;

const FILL_COLORS = ['red', 'green', 'yellow', 'orange'];
const images = {
  0: () => require('./0.jpg'),
  1: () => require('./1.jpg'),
  2: () => require('./2.jpg'),
  3: () => require('./3.jpg'),
  4: () => require('./4.jpg'),
};

const Item = ({ fillPath, zIndex }: { fillPath: string; zIndex: number }) => (
  <View
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
          <Path d={dPath} stroke="red" fill={fillPath} />
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
  </View>
);

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
