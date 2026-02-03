export const toHsla = (color: string, alpha: number) => {
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/i);
  if (hslMatch) {
    const [, h, s, l] = hslMatch;
    return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
  }
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  return color;
};

export const shiftHslLightness = (color: string, delta: number) => {
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/i);
  if (!hslMatch) return color;
  const [, h, s, l] = hslMatch.map(Number);
  const nextL = Math.max(0, Math.min(100, l + delta));
  return `hsl(${h}, ${s}%, ${nextL}%)`;
};

export const colorStyle = (color: string | undefined) => {
  if (!color) return {};
  return {
    borderColor: color,
    color
  } as const;
};
