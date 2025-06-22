import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, FontWeights, Spacing } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Animation values - Initialize only once
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(30)).current;
  
  // Loading dots animations
  const dot1Scale = useRef(new Animated.Value(0.5)).current;
  const dot2Scale = useRef(new Animated.Value(0.5)).current;
  const dot3Scale = useRef(new Animated.Value(0.5)).current;

  // Use callback to prevent re-renders
  const handleFinish = useCallback(() => {
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    let animationSequence: Animated.CompositeAnimation;
    let dotsAnimation: Animated.CompositeAnimation;
    let animationTimeout: NodeJS.Timeout;

    // Create dot animation
    const createDotAnimation = (dotScale: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotScale, {
            toValue: 1.2,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dotScale, {
            toValue: 0.5,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start loading dots animation
    dotsAnimation = Animated.parallel([
      createDotAnimation(dot1Scale, 0),
      createDotAnimation(dot2Scale, 200),
      createDotAnimation(dot3Scale, 400),
    ]);

    dotsAnimation.start();

    // Main animation sequence
    animationSequence = Animated.sequence([
      Animated.delay(200),
      
      // Logo entrance
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
      
      Animated.delay(300),
      
      // Title entrance
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      
      Animated.delay(200),
      
      // Subtitle entrance
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Start main animation
    animationSequence.start();

    // Set timeout to finish animation
    animationTimeout = setTimeout(() => {
      dotsAnimation.stop();
      handleFinish();
    }, 3500);

    // Cleanup function
    return () => {
      if (animationSequence) {
        animationSequence.stop();
      }
      if (dotsAnimation) {
        dotsAnimation.stop();
      }
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
    };
  }, [
    logoScale,
    logoOpacity,
    logoRotation,
    titleOpacity,
    titleTranslateY,
    subtitleOpacity,
    subtitleTranslateY,
    dot1Scale,
    dot2Scale,
    dot3Scale,
    handleFinish
  ]);

  const logoRotationInterpolated = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.gradientStart} />
      
      <View style={styles.content}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: logoScale },
                { rotate: logoRotationInterpolated }
              ],
              opacity: logoOpacity,
            },
          ]}
        >
          <View style={styles.logoIcon}>
            <Ionicons name="checkmark-circle" size={50} color={Colors.textPrimary} />
          </View>
        </Animated.View>

        {/* Animated App Title */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          TaskMaster
        </Animated.Text>

        {/* Animated Subtitle */}
        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleTranslateY }],
            },
          ]}
        >
          Organize your life, one task at a time
        </Animated.Text>

        {/* Animated Loading Dots */}
        <Animated.View
          style={[
            styles.loadingContainer,
            { opacity: subtitleOpacity },
          ]}
        >
          <View style={styles.loadingDots}>
            <Animated.View 
              style={[
                styles.dot, 
                { transform: [{ scale: dot1Scale }] }
              ]} 
            />
            <Animated.View 
              style={[
                styles.dot, 
                { transform: [{ scale: dot2Scale }] }
              ]} 
            />
            <Animated.View 
              style={[
                styles.dot, 
                { transform: [{ scale: dot3Scale }] }
              ]} 
            />
          </View>
          <Text style={styles.loadingText}>Loading...</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.xxl,
  },
  logoIcon: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
    elevation: 24,
  },
  title: {
    fontSize: FontSizes.xxxl * 1.2,
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.textPrimary,
    marginHorizontal: 6,
  },
  loadingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
});

export default SplashScreen;