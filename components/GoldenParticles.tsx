import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 40;

const PARTICLE_COLORS = [
  '#E8C476',
  '#D4A24E',
  '#C2785C',
  '#F0D68A',
  '#C9943A',
  '#D4956E',
  '#DEBA6F',
  '#C4907A',
];

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  color: string;
  size: number;
  isSquare: boolean;
}

export default function GoldenParticles() {
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(SCREEN_WIDTH / 2),
      y: new Animated.Value(SCREEN_HEIGHT * 0.45),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      rotation: new Animated.Value(0),
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      size: 4 + Math.random() * 10,
      isSquare: Math.random() > 0.6,
    }))
  ).current;

  useEffect(() => {
    const animations = particles.map((p, i) => {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const distance = 100 + Math.random() * 250;
      const targetX = SCREEN_WIDTH / 2 + Math.cos(angle) * distance;
      const targetY = SCREEN_HEIGHT * 0.45 + Math.sin(angle) * distance - 80 - Math.random() * 120;
      const delay = Math.random() * 600;
      const duration = 1000 + Math.random() * 800;

      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(p.x, {
            toValue: targetX,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: targetY + Math.random() * 60,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(p.scale, {
              toValue: 0.6 + Math.random() * 1.2,
              duration: 250,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
            Animated.timing(p.scale, {
              toValue: 0.1 + Math.random() * 0.3,
              duration: duration - 250,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(p.opacity, {
              toValue: 0.8 + Math.random() * 0.2,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.delay(duration * 0.4),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: duration * 0.4,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(p.rotation, {
            toValue: (Math.random() - 0.5) * 4,
            duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.stagger(25, animations).start();
  }, [particles]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => {
        const rotateInterpolate = p.rotation.interpolate({
          inputRange: [-2, 2],
          outputRange: ['-180deg', '180deg'],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                backgroundColor: p.color,
                width: p.size,
                height: p.size,
                borderRadius: p.isSquare ? 2 : p.size / 2,
                opacity: p.opacity,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { scale: p.scale },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});
