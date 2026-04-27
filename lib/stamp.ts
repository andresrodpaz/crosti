export function generateStampPath(
  cx: number,
  cy: number,
  outerR = 50,
  innerR = 42,
  teeth = 24,
): string {
  const points: string[] = []
  const total = teeth * 2

  for (let i = 0; i < total; i++) {
    const isOuter = i % 2 === 0
    const radius = isOuter ? outerR : innerR
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }

  return points.join(" ")
}
