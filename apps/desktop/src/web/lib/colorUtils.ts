/**
 * Color blending utilities for soft clustering visualization
 * Allows nodes to have blended colors based on membership weights
 */

/**
 * Convert hex color to rgba string with alpha
 * @param hex - Hex color string (e.g., "#4477AA")
 * @param alpha - Alpha value (0-1)
 * @returns RGBA string (e.g., "rgba(68, 119, 170, 0.5)")
 */
export function hexToRgba(hex: string, alpha: number): string {
  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Parse RGB values
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Blend multiple colors based on membership weights
 * Uses simple RGB blending (sufficient for our use case)
 * For LAB space blending, we could add chroma-js later
 *
 * @param colors - Array of hex color strings
 * @param weights - Array of weights (must sum to <= 1, or will be normalized)
 * @returns Blended hex color string
 *
 * @example
 * // 70% blue + 30% red = purple-blue
 * blendClusterColors(["#4477AA", "#EE6677"], [0.7, 0.3])
 * // Returns: "#5e6ca3"
 */
export function blendClusterColors(
  colors: string[],
  weights: number[],
): string {
  if (colors.length === 0) return "#94a3b8"; // Default gray
  if (colors.length === 1) return colors[0];
  if (colors.length !== weights.length) {
    throw new Error("Colors and weights arrays must have the same length");
  }

  // Normalize weights
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return "#94a3b8";

  const normalizedWeights = weights.map((w) => w / totalWeight);

  // RGB blending
  let r = 0;
  let g = 0;
  let b = 0;

  for (let i = 0; i < colors.length; i++) {
    const hex = colors[i].replace("#", "");
    const weight = normalizedWeights[i];

    r += parseInt(hex.slice(0, 2), 16) * weight;
    g += parseInt(hex.slice(2, 4), 16) * weight;
    b += parseInt(hex.slice(4, 6), 16) * weight;
  }

  // Convert back to hex
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Create radial gradient for glow effect around cluster nodes
 *
 * @param ctx - Canvas 2D rendering context
 * @param x - Center X coordinate
 * @param y - Center Y coordinate
 * @param radius - Base radius of the node
 * @param colors - Array of hex color strings
 * @param weights - Array of weights for each color
 * @returns CanvasGradient for the glow effect
 */
export function createGlowGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  colors: string[],
  weights: number[],
): CanvasGradient {
  const gradient = ctx.createRadialGradient(x, y, radius, x, y, radius + 8);

  // Normalize weights so cumulative positions stay within [0, 1]
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const safeWeights =
    totalWeight > 0 ? weights.map((w) => w / totalWeight) : weights;

  // Add color stops for each cluster color
  let cumulativeWeight = 0;
  colors.forEach((color, i) => {
    const weight = safeWeights[i] || 0;
    const alpha = Math.min(0.5, 0.3 + weight * 0.4);
    const stopPosition = Math.min(cumulativeWeight, 0.99); // Clamp to valid range
    gradient.addColorStop(stopPosition, hexToRgba(color, alpha));
    cumulativeWeight += weight;
  });

  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  return gradient;
}
