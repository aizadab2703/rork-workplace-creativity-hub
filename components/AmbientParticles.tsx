import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 8;

interface FloatingDot {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
}

export default React.memo(function AmbientParticles() {
  const dots = useRef<FloatingDot[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(Math.random() * SCREEN_WIDTH),
      y: new Animated.Value(Math.random() * SCREEN_HEIGHT),
      opacity: new Animated.Value(0),
      color: [
        'rgba(232, 180, 80, 0.12)',
        'rgba(212, 162, 78, 0.10)',
        'rgba(255, 217, 128, 0.10)',
        'rgba(201, 148, 58, 0.08)',
      ][Math.floor(Math.random() * 4)],
      size: 4 + Math.random() * 6,
    }))
  ).current;

  useEffect(() => {
    dots.forEach((dot, i) => {
      const startX = Math.random() * SCREEN_WIDTH;
      const startY = Math.random() * SCREEN_HEIGHT;
      dot.x.setValue(startX);
      dot.y.setValue(startY);

      const animateFloat = () => {
        const targetX = startX + (Math.random() - 0.5) * 60;
        const targetY = startY + (Math.random() - 0.5) * 80;
        const duration = 5000 + Math.random() * 4000;

        Animated.parallel([
          Animated.sequence([
            Animated.timing(dot.opacity, {
              toValue: 0.5 + Math.random() * 0.3,
              duration: duration * 0.3,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(dot.opacity, {
              toValue: 0,
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

      setTimeout(() => animateFloat(), i * 600);
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
