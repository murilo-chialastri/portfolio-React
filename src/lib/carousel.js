export function wrapIndex(index, length) {
  return length > 0 ? ((index % length) + length) % length : 0
}

export function carouselPosition(index, current, length) {
  let position = wrapIndex(index - current, length)
  if (position > length / 2) position -= length
  return Math.max(-2, Math.min(2, position))
}
