import React from "react";

type AnyProps = Record<string, any>;

function host(displayName: string) {
  const Component = React.forwardRef<any, AnyProps>((props, ref) =>
    React.createElement(displayName as any, { ...props, ref }),
  );
  Component.displayName = displayName;
  return Component;
}

export const View = host("View");
export const Text = host("Text");
export const TextInput = host("TextInput");
export const Image = host("Image");
export const ScrollView = host("ScrollView");
export const FlatList = host("FlatList");
export const Modal = host("Modal");
export const Pressable = host("Pressable");
export const TouchableOpacity = host("TouchableOpacity");
export const ActivityIndicator = host("ActivityIndicator");
export const StatusBar = host("StatusBar");

export const Animated = {
  View: host("Animated.View"),
  Text: host("Animated.Text"),
  Image: host("Animated.Image"),
  Value: class AnimatedValue {
    private value: number;
    constructor(value: number) {
      this.value = value;
    }
    setValue(value: number) {
      this.value = value;
    }
    interpolate() {
      return this;
    }
    addListener() {
      return "0";
    }
    removeListener() {}
    stopAnimation() {}
    timing(config: { toValue?: number }) {
      return config;
    }
  },
  timing: () => ({ start: (cb?: () => void) => cb?.(), stop: () => {} }),
  spring: () => ({ start: (cb?: () => void) => cb?.(), stop: () => {} }),
  parallel: () => ({ start: (cb?: () => void) => cb?.(), stop: () => {} }),
  sequence: () => ({ start: (cb?: () => void) => cb?.(), stop: () => {} }),
  createAnimatedComponent: (component: any) => component,
};

export const Platform = {
  OS: "ios" as const,
  select: (options: Record<string, any>) =>
    options.ios ?? options.default,
};

export const Alert = {
  alert: () => {},
};

export const StyleSheet = {
  create: <T extends Record<string, any>>(styles: T): T => styles,
  flatten: (style: any) =>
    Array.isArray(style) ? Object.assign({}, ...style) : style,
  compose: (a: any, b: any) => [a, b],
  absoluteFill: {},
  absoluteFillObject: {},
  hairlineWidth: 1,
};

export const Dimensions = {
  get: () => ({ width: 390, height: 844, scale: 1, fontScale: 1 }),
  addEventListener: () => ({ remove: () => {} }),
};

export const Keyboard = {
  dismiss: () => {},
  addListener: () => ({ remove: () => {} }),
};

export const PixelRatio = {
  get: () => 1,
  getFontScale: () => 1,
};

export const AppState = {
  currentState: "active",
  addEventListener: () => ({ remove: () => {} }),
};

export const Linking = {
  openURL: () => Promise.resolve(),
  canOpenURL: () => Promise.resolve(true),
};

export const useColorScheme = () => "light";

export const Vibration = {
  vibrate: () => {},
};

export default {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
  Platform,
  Alert,
  StyleSheet,
  Dimensions,
  Keyboard,
  PixelRatio,
  AppState,
  Linking,
  useColorScheme,
  Vibration,
};
