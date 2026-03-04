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
  const glowAnim = useRef(new Animated.Value(0.2)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const liquidWave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 3500,
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
              duration: 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      animateSparkle(sparkle1, 0);
      animateSparkle(sparkle2, 700);
      animateSparkle(sparkle3, 1400);

      Animated.loop(
        Animated.sequence([
          Animated.timing(liquidWave, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(liquidWave, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [fillPercent > 5, sparkle1, sparkle2, sparkle3, liquidWave]);

  const scale = size / 220;
  const jarHeight = 150 * scale;
  const jarWidth = 120 * scale;
  const neckWidth = 70 * scale;
  const neckHeight = 18 * scale;
  const lidWidth = 84 * scale;
  const lidHeight = 15 * scale;

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
            width: jarWidth + 70,
            height: jarHeight + 70,
            borderRadius: (jarWidth + 70) / 2,
            opacity: glowAnim,
          },
        ]}
      />

      <View style={styles.jarContainer}>
        {!isUnlocked && (
          <View style={[styles.lid, { width: lidWidth, height: lidHeight, borderRadius: lidHeight * 0.4 }]}>
            <View style={[styles.lidHighlight, { width: lidWidth * 0.45 }]} />
            <View style={[styles.lidBand, { width: lidWidth * 0.85 }]} />
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
              borderRadius: jarWidth * 0.16,
            },
          ]}
        >
          <View style={[styles.jarShineLeft, { height: jarHeight * 0.55 }]} />
          <View style={[styles.jarShineRight, { height: jarHeight * 0.3 }]} />

          <View
            style={[
              styles.fillContainer,
              {
                height: fillHeight,
                bottom: 0,
                left: 2,
                right: 2,
                borderBottomLeftRadius: jarWidth * 0.14,
                borderBottomRightRadius: jarWidth * 0.14,
              },
            ]}
          >
            <View style={styles.fillGradientBase} />
            <View style={styles.fillDarkerBottom} />
            <View style={styles.fillTopEdge} />

            {clampedFill > 5 && (
              <>
                <Animated.View
                  style={[
                    styles.sparkle,
                    {
                      left: '18%',
                      top: '25%',
                      opacity: sparkle1,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.sparkle,
                    {
                      left: '52%',
                      top: '45%',
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
                      left: '72%',
                      top: '18%',
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
                      transform: [{ rotate: `${(i - 1) * 20}deg` }],
                      bottom: i * 4,
                      left: 16 + i * 16,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={[styles.baseShadow, { width: jarWidth * 0.55 }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  glowOrb: {
    position: 'absolute',
    backgroundColor: 'rgba(212, 160, 74, 0.12)',
  },
  jarContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  lid: {
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    overflow: 'hidden',
  },
  lidHighlight: {
    position: 'absolute',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
    top: 3,
    left: 8,
  },
  lidBand: {
    position: 'absolute',
    bottom: 2,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 1,
  },
  neck: {
    backgroundColor: 'rgba(255, 250, 240, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(170, 120, 70, 0.12)',
    borderTopWidth: 0,
    zIndex: 5,
  },
  jarBody: {
    backgroundColor: 'rgba(255, 250, 240, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(170, 120, 70, 0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  jarShineLeft: {
    position: 'absolute',
    left: 8,
    top: 12,
    width: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2.5,
    zIndex: 5,
  },
  jarShineRight: {
    position: 'absolute',
    right: 12,
    top: 20,
    width: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 1.5,
    zIndex: 5,
  },
  fillContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  fillGradientBase: {
    flex: 1,
    backgroundColor: Colors.honey,
    opacity: 0.6,
  },
  fillDarkerBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(176, 133, 48, 0.15)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  notePapers: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 3,
  },
  paperSlip: {
    position: 'absolute',
    width: 22,
    height: 13,
    backgroundColor: 'rgba(255, 252, 245, 0.92)',
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(170, 120, 70, 0.06)',
  },
  baseShadow: {
    height: 7,
    borderRadius: 50,
    backgroundColor: 'rgba(100, 70, 30, 0.05)',
    marginTop: -2,
  },
});
