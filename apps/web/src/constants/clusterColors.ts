/**
 * Color palette for semantic cluster visualization
 * Based on Paul Tol's color schemes for accessibility
 * @see https://personal.sron.nl/~pault/
 */

/**
 * Main color palette - 8 vivid, distinguishable colors
 * Optimized for colorblind accessibility
 */
export const CLUSTER_COLORS = [
  "#4477AA", // Blue - highly distinct
  "#EE6677", // Red-pink
  "#228833", // Green (distinguishable from red-pink for most)
  "#CCBB44", // Yellow
  "#66CCEE", // Cyan
  "#AA3377", // Magenta-purple
  "#BBBBBB", // Gray (for "Other" category)
  "#FF8C00", // Dark orange (backup)
] as const;

/**
 * High contrast palette for accessibility mode
 * Pure, maximally distinct colors
 */
export const HIGH_CONTRAST_COLORS = [
  "#0000FF", // Pure blue
  "#FF0000", // Pure red
  "#00FF00", // Pure green
  "#FFFF00", // Pure yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#000000", // Black
  "#808080", // Gray
] as const;

/**
 * Get color for a cluster based on its index
 * @param clusterIndex - Index of the cluster (0-based)
 * @param highContrast - Whether to use high contrast palette
 * @returns Hex color string
 */
export function getClusterColor(
  clusterIndex: number,
  highContrast = false,
): string {
  const palette = highContrast ? HIGH_CONTRAST_COLORS : CLUSTER_COLORS;
  return palette[clusterIndex % palette.length];
}

/**
 * Get all colors for clusters up to a certain count
 * @param count - Number of clusters
 * @param highContrast - Whether to use high contrast palette
 * @returns Array of hex color strings
 */
export function getClusterColors(
  count: number,
  highContrast = false,
): string[] {
  const palette = highContrast ? HIGH_CONTRAST_COLORS : CLUSTER_COLORS;
  return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
}

/**
 * Default color for unclustered/noise nodes
 */
export const NOISE_NODE_COLOR = "#94a3b8";
