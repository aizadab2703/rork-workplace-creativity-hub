import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Colors from '@/constants/colors';

interface JarVisualizationProps {
  fillPercent: number;
  size?: number;
  isUnlocked?: boolean;
}

export default React.memo(function JarVisualization({
  fillPercent,
  size = 220,
  isUnlocked = false,
}: JarVisualizationProps) {
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const innerGlow = useRef(new Animated.Value(0.3)).current;
  const shimmerX = useRef(new Animated.Value(0)).current;
  const bubbleAnim1 = useRef(new Animated.Value(0)).current;
  const bubbleAnim2 = useRef(new Animated.Value(0)).current;
  const bubbleAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.85,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(innerGlow, {
          toValue: 0.7,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(innerGlow, {
          toValue: 0.3,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(shimmerX, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [glowAnim, innerGlow, shimmerX]);

  useEffect(() => {
    if (fillPercent > 10) {
      const animateBubble = (anim: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 2000 + Math.random() * 1000,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      animateBubble(bubbleAnim1, 0);
      animateBubble(bubbleAnim2, 800);
      animateBubble(bubbleAnim3, 1600);
    }
  }, [fillPercent > 10, bubbleAnim1, bubbleAnim2, bubbleAnim3]);

  const scale = size / 220;
  const jarHeight = 155 * scale;
  const jarWidth = 125 * scale;
  const neckWidth = 75 * scale;
  const neckHeight = 22 * scale;
  const lidWidth = 88 * scale;
  const lidHeight = 16 * scale;

  const clampedFill = Math.min(Math.max(fillPercent, 0), 100);
  const fillHeight = (clampedFill / 100) * (jarHeight * 0.78);

  const containerStyle = useMemo(() => ({
    width: size,
    height: size + 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }), [size]);

  const shimmerTranslate = shimmerX.interpolate({
    inputRange: [0, 1],
    outputRange: [-jarWidth, jarWidth * 2],
  });

  return (
    <View style={containerStyle}>
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: jarWidth + 80,
            height: jarHeight + 80,
            borderRadius: (jarWidth + 80) / 2.5,
            opacity: glowAnim,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.innerGlowRing,
          {
            width: jarWidth + 50,
            height: jarHeight + 50,
            borderRadius: (jarWidth + 50) / 2.5,
            opacity: innerGlow,
          },
        ]}
      />

      <View style={styles.jarContainer}>
        {!isUnlocked && (
          <View style={[styles.lid, { width: lidWidth, height: lidHeight, top: 0 }]}>
            <View style={[styles.lidStripe, { width: lidWidth - 8 }]} />
            <View style={[styles.lidShine, { width: lidWidth * 0.4 }]} />
          </View>
        )}

        <View style={[styles.neck, { width: neckWidth, height: neckHeight, top: lidHeight - 3 }]}>
          <View style={styles.neckShineBar} />
          <View style={styles.neckRimTop} />
        </View>

        <View
          style={[
            styles.jarBody,
            {
              width: jarWidth,
              height: jarHeight,
              top: lidHeight + neckHeight - 7,
              borderRadius: jarWidth * 0.18,
            },
          ]}
        >
          <View style={[styles.jarShineLeft, { height: jarHeight * 0.7 }]} />
          <View style={[styles.jarShineRight, { height: jarHeight * 0.5 }]} />

          <Animated.View
            style={[
              styles.shimmerStreak,
              {
                transform: [{ translateX: shimmerTranslate }],
                height: jarHeight,
              },
            ]}
          />

          <View
            style={[
              styles.fillContainer,
              {
                height: fillHeight,
                bottom: 0,
                left: 3,
                right: 3,
                borderBottomLeftRadius: jarWidth * 0.16,
                borderBottomRightRadius: jarWidth * 0.16,
              },
            ]}
          >
            <View style={styles.fillBase} />
            <View style={styles.fillHighlight} />
            <View style={styles.fillSurface} />

            {clampedFill > 10 && (
              <>
                <Animated.View
                  style={[
                    styles.bubble,
                    {
                      left: '25%',
                      opacity: bubbleAnim1.interpolate({
                        inputRange: [0, 0.3, 0.7, 1],
                        outputRange: [0, 0.6, 0.4, 0],
                      }),
                      transform: [{
                        translateY: bubbleAnim1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -fillHeight * 0.6],
                        }),
                      }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.bubbleSmall,
                    {
                      left: '55%',
                      opacity: bubbleAnim2.interpolate({
                        inputRange: [0, 0.3, 0.7, 1],
                        outputRange: [0, 0.5, 0.3, 0],
                      }),
                      transform: [{
                        translateY: bubbleAnim2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -fillHeight * 0.5],
                        }),
                      }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.bubbleTiny,
                    {
                      left: '70%',
                      opacity: bubbleAnim3.interpolate({
                        inputRange: [0, 0.3, 0.7, 1],
                        outputRange: [0, 0.4, 0.2, 0],
                      }),
                      transform: [{
                        translateY: bubbleAnim3.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -fillHeight * 0.4],
                        }),
                      }],
                    },
                  ]}
                />
              </>
            )}
          </View>

          {clampedFill > 12 && (
            <View style={[styles.notePapers, { bottom: Math.min(fillHeight * 0.25, fillHeight - 10) }]}>
              {Array.from({ length: Math.min(Math.floor(clampedFill / 18), 5) }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.paperSlip,
                    {
                      transform: [{ rotate: `${(i - 2) * 15}deg` }],
                      bottom: i * 4,
                      left: 12 + i * 10,
                      opacity: 0.85,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          <View style={[styles.jarBottomReflect, { borderBottomLeftRadius: jarWidth * 0.16, borderBottomRightRadius: jarWidth * 0.16 }]} />
        </View>
      </View>

      <View style={[styles.baseShadow, { width: jarWidth * 0.7 }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  glowRing: {
    position: 'absolute',
    backgroundColor: Colors.accentGlow,
  },
  innerGlowRing: {
    position: 'absolute',
    backgroundColor: 'rgba(232, 196, 118, 0.2)',
  },
  jarContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  lid: {
    backgroundColor: Colors.sienna,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  lidStripe: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 1,
    top: '40%',
  },
  lidShine: {
    position: 'absolute',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    top: 3,
    left: 6,
  },
  neck: {
    backgroundColor: 'rgba(245, 237, 227, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(194, 120, 92, 0.2)',
    borderTopWidth: 0,
    zIndex: 5,
    overflow: 'hidden',
  },
  neckShineBar: {
    position: 'absolute',
    left: 5,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 3,
  },
  neckRimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(194, 120, 92, 0.15)',
  },
  jarBody: {
    backgroundColor: 'rgba(245, 237, 227, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(194, 120, 92, 0.18)',
    overflow: 'hidden',
    position: 'relative',
  },
  jarShineLeft: {
    position: 'absolute',
    left: 7,
    top: 12,
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 4,
    zIndex: 5,
  },
  jarShineRight: {
    position: 'absolute',
    right: 14,
    top: 25,
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    zIndex: 5,
  },
  shimmerStreak: {
    position: 'absolute',
    top: 0,
    width: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 4,
    transform: [{ skewX: '-15deg' }],
  },
  fillContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  fillBase: {
    flex: 1,
    backgroundColor: Colors.jarLiquid,
    opacity: 0.75,
  },
  fillHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  fillSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  bubble: {
    position: 'absolute',
    bottom: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  bubbleSmall: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  bubbleTiny: {
    position: 'absolute',
    bottom: 3,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  notePapers: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 3,
  },
  paperSlip: {
    position: 'absolute',
    width: 26,
    height: 15,
    backgroundColor: '#FFF5E1',
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(194, 120, 92, 0.12)',
  },
  jarBottomReflect: {
    position: 'absolute',
    bottom: 0,
    left: 3,
    right: 3,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  baseShadow: {
    height: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(92, 61, 46, 0.1)',
    marginTop: -4,
  },
});
