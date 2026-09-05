import React from "react";
import { GlassmorphismCta, NeuformIsolatedEffectProps } from "./neuform-isolated/NeuformIsolatedEffects";

export * from "./neuform-isolated/NeuformIsolatedEffects";

export type RectangleButtonsProps = NeuformIsolatedEffectProps & {
  variant?: "glassmorphism-cta" | string;
};

export function RectangleButtons({
  variant = "glassmorphism-cta",
  ...props
}: RectangleButtonsProps) {
  return React.createElement(GlassmorphismCta, props);
}
