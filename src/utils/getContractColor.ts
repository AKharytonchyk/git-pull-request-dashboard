const getContrastColor = (hexColor: string): string => {
  hexColor = hexColor.replace(/^#/, "");

  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  const colors = [
    { color: "#000000", luminance: 0 }, // black
    { color: "#FFFFFF", luminance: 1 }, // white
    { color: "#FF0000", luminance: 0.2126 }, // red
    { color: "#00FF00", luminance: 0.7152 }, // green
    { color: "#0000FF", luminance: 0.0722 }, // blue
  ];

  let bestColor = colors[0];
  let bestContrast = 0;

  for (const color of colors) {
    const contrast = Math.abs(luminance - color.luminance);
    if (contrast > bestContrast) {
      bestContrast = contrast;
      bestColor = color;
    }
  }

  return bestColor.color;
};

export default getContrastColor;
