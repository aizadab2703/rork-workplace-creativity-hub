import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 12;

interface FloatingDot {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
  size: number;
}

export default React.memo(function AmbientParticles() {
  const dots = useRef<FloatingDot[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(Math.random() * SCREEN_WIDTH),
      y: new Animated.Value(Math.random() * SCREEN_HEIGHT),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.3 + Math.random() * 0.7),
      color: [
        'rgba(212, 162, 78, 0.25)',
        'rgba(194, 120, 92, 0.2)',
        'rgba(196, 144, 122, 0.18)',
        'rgba(232, 196, 118, 0.22)',
        'rgba(201, 148, 58, 0.2)',
      ][Math.floor(Math.random() * 5)],
      size: 4 + Math.random() * 8,
    }))
  ).current;

  useEffect(() => {
    dots.forEach((dot, i) => {
      const startX = Math.random() * SCREEN_WIDTH;
      const startY = Math.random() * SCREEN_HEIGHT;
      dot.x.setValue(startX);
      dot.y.setValue(startY);

      const animateFloat = () => {
        const targetX = startX + (Math.random() - 0.5) * 80;
        const targetY = startY + (Math.random() - 0.5) * 100;
        const duration = 4000 + Math.random() * 4000;

        Animated.parallel([
          Animated.sequence([
            Animated.timing(dot.opacity, {
              toValue: 0.6 + Math.random() * 0.4,
              duration: duration * 0.3,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(dot.opacity, {
              toValue: 0.1,
              duration: duration * 0.7,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(dot.x, {
            toValue: targetX,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(dot.y, {
            toValue: targetY,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]).start(() => {
          dot.x.setValue(startX);
          dot.y.setValue(startY);
          animateFloat();
        });
      };

      setTimeout(() => animateFloat(), i * 500);
    });
  }, [dots]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: dot.color,
              opacity: dot.opacity,
              transform: [
                { translateX: dot.x },
                { translateY: dot.y },
                { scale: dot.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
  },
});
