"use client"

import { useEffect } from "react"

export function ErrorSuppressor() {
  useEffect(() => {
    // Suppress MetaMask and crypto wallet extension errors
    const handleRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason)
      if (
        message.includes("MetaMask") ||
        message.includes("ethereum") ||
        message.includes("Failed to connect to MetaMask")
      ) {
        event.preventDefault()
        console.log("[Message] Suppressed external wallet extension error:", message)
      }
    }

    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  return null
}
