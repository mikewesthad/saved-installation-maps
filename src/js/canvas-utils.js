// Only fontFamily and fontSize are mandatory
// See: https://developer.mozilla.org/en-US/docs/Web/CSS/font
export function setFont(ctx, options) {
  ctx.font = getFontString(options);
}

export function getFontString({
  fontFamily,
  fontSize,
  fontStyle,
  fontWeight,
  fontVariant,
  lineHeight
} = {}) {
  if (typeof fontSize === "number") fontSize = `${fontSize}px`;

  let styleValues = [];
  if (fontStyle !== undefined) styleValues.push(fontStyle);
  if (fontVariant !== undefined) styleValues.push(fontVariant);
  if (fontWeight !== undefined) styleValues.push(fontWeight);
  if (fontSize !== undefined) {
    if (lineHeight !== undefined) styleValues.push(`${fontSize}/${lineHeight}`);
    else styleValues.push(fontSize);
  }
  if (fontFamily !== undefined) styleValues.push(fontFamily);
  return styleValues.join(" ");
}
