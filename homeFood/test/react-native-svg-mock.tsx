import React from "react";

function host(displayName: string) {
  const Component = React.forwardRef<any, Record<string, any>>((props, ref) =>
    React.createElement(displayName as any, { ...props, ref }),
  );
  Component.displayName = displayName;
  return Component;
}

export const Svg = host("Svg");
export const SvgXml = host("SvgXml");
export const Path = host("Path");
export const Circle = host("Circle");
export const Rect = host("Rect");
export const G = host("G");
export const Defs = host("Defs");
export const LinearGradient = host("LinearGradient");
export const Stop = host("Stop");
export const ClipPath = host("ClipPath");
export const Mask = host("Mask");
export const Text = host("SvgText");

export default {
  Svg,
  SvgXml,
  Path,
  Circle,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  Mask,
  Text,
};
