interface StyleProps {
  color: string;
  fontWeight: string;
  textShadow?: string;
  backgroundColor?: string;
}

const RYGGradient = (coverage: number): StyleProps => {
  let r: number = 0;
  let g: number = 0;
  let b: number = 0;

  const red = { r: 185, g: 28, b: 28 };
  const yellow = { r: 234, g: 179, b: 8 };
  const green = { r: 101, g: 163, b: 13 };

  if (coverage <= 45) {
    r = red.r;
    g = red.g;
    b = red.b;
  } else if (coverage <= 60) {
    const ratio = (coverage - 45) / 15;
    r = red.r + (yellow.r - red.r) * ratio;
    g = red.g + (yellow.g - red.g) * ratio;
    b = red.b + (yellow.b - red.b) * ratio;
  } else if (coverage <= 85) {
    const ratio = (coverage - 60) / 25;
    r = yellow.r + (green.r - yellow.r) * ratio;
    g = yellow.g + (green.g - yellow.g) * ratio;
    b = yellow.b + (green.b - yellow.b) * ratio;
  } else {
    r = green.r;
    g = green.g;
    b = green.b;
  }

  const fontWeight = coverage < 45 ? "bolder" : "bold";
  const color = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

  return { color, fontWeight };
};

export default RYGGradient;


