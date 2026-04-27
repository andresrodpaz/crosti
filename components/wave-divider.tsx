interface WaveDividerProps {
  color: string
  flip?: boolean
}

export function WaveDivider({ color, flip = false }: WaveDividerProps) {
  return (
    <div className="wave-divider" style={flip ? { transform: "scaleY(-1)" } : undefined}>
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,50 C240,100 480,0 720,55 C960,110 1200,10 1440,50 L1440,100 L0,100 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}
