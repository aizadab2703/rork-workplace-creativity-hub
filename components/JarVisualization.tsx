import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

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
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  useEffect(() => {
    if (fillPercent > 5) {
      const animateSparkle = (anim: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      animateSparkle(sparkle1, 0);
      animateSparkle(sparkle2, 600);
      animateSparkle(sparkle3, 1200);
    }
  }, [fillPercent > 5, sparkle1, sparkle2, sparkle3]);

  const scale = size / 220;
  const jarHeight = 150 * scale;
  const jarWidth = 120 * scale;
  const neckWidth = 70 * scale;
  const neckHeight = 18 * scale;
  const lidWidth = 82 * scale;
  const lidHeight = 14 * scale;

  const clampedFill = Math.min(Math.max(fillPercent, 0), 100);
  const fillHeight = (clampedFill / 100) * (jarHeight * 0.8);

  const containerStyle = useMemo(() => ({
    width: size,
    height: size + 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }), [size]);

  return (
    <View style={containerStyle}>
      <Animated.View
        style={[
          styles.glowOrb,
          {
            width: jarWidth + 60,
            height: jarHeight + 60,
            borderRadius: (jarWidth + 60) / 2,
            opacity: glowAnim,
          },
        ]}
      />

      <View style={styles.jarContainer}>
        {!isUnlocked && (
          <View style={[styles.lid, { width: lidWidth, height: lidHeight }]}>
            <View style={[styles.lidHighlight, { width: lidWidth * 0.5 }]} />
          </View>
        )}

        <View style={[styles.neck, { width: neckWidth, height: neckHeight, top: lidHeight - 2 }]} />

        <View
          style={[
            styles.jarBody,
            {
              width: jarWidth,
              height: jarHeight,
              top: lidHeight + neckHeight - 5,
              borderRadius: jarWidth * 0.15,
            },
          ]}
        >
          <View style={[styles.jarShine, { height: jarHeight * 0.6 }]} />

          <View
            style={[
              styles.fillContainer,
              {
                height: fillHeight,
                bottom: 0,
                left: 2,
                right: 2,
                borderBottomLeftRadius: jarWidth * 0.13,
                borderBottomRightRadius: jarWidth * 0.13,
              },
            ]}
          >
            <View style={styles.fillGradientBase} />
            <View style={styles.fillTopEdge} />

            {clampedFill > 5 && (
              <>
                <Animated.View
                  style={[
                    styles.sparkle,
                    {
                      left: '20%',
                      top: '30%',
                      opacity: sparkle1,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.sparkle,
                    {
                      left: '55%',
                      top: '50%',
                      width: 3,
                      height: 3,
                      borderRadius: 1.5,
                      opacity: sparkle2,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.sparkle,
                    {
                      left: '75%',
                      top: '20%',
                      width: 2.5,
                      height: 2.5,
                      borderRadius: 1.25,
                      opacity: sparkle3,
                    },
                  ]}
                />
              </>
            )}
          </View>

          {clampedFill > 15 && (
            <View style={[styles.notePapers, { bottom: Math.min(fillHeight * 0.3, fillHeight - 8) }]}>
              {Array.from({ length: Math.min(Math.floor(clampedFill / 25), 3) }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.paperSlip,
                    {
                      transform: [{ rotate: `${(i - 1) * 18}deg` }],
                      bottom: i * 3,
                      left: 18 + i * 14,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={[styles.baseShadow, { width: jarWidth * 0.5 }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  glowOrb: {
    position: 'absolute',
    backgroundColor: 'rgba(232, 180, 80, 0.15)',
  },
  jarContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  lid: {
    backgroundColor: '#B87333',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    overflow: 'hidden',
  },
  lidHighlight: {
    position: 'absolute',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 1.5,
    top: 3,
    left: 8,
  },
  neck: {
    backgroundColor: 'rgba(255, 248, 235, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(184, 115, 51, 0.15)',
    borderTopWidth: 0,
    zIndex: 5,
  },
  jarBody: {
    backgroundColor: 'rgba(255, 248, 235, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(184, 115, 51, 0.12)',
    overflow: 'hidden',
    position: 'relative',
  },
  jarShine: {
    position: 'absolute',
    left: 8,
    top: 10,
    width: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 2.5,
    zIndex: 5,
  },
  fillContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  fillGradientBase: {
    flex: 1,
    backgroundColor: '#E8B450',
    opacity: 0.65,
  },
  fillTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  sparkle: {
    position: 'absolute',
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  notePapers: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 3,
  },
  paperSlip: {
    position: 'absolute',
    width: 20,
    height: 12,
    backgroundColor: 'rgba(255, 250, 240, 0.9)',
    borderRadius: 1.5,
    borderWidth: 0.5,
    borderColor: 'rgba(184, 115, 51, 0.08)',
  },
  baseShadow: {
    height: 6,
    borderRadius: 50,
    backgroundColor: 'rgba(120, 80, 40, 0.06)',
    marginTop: -2,
  },
});
