import { redirect } from "next/navigation"
import { StaffScannerClient } from "@/components/club/staff-scanner-client"

export default function StaffStampPage() {
  // Check feature flag
  if (process.env.NEXT_PUBLIC_LOYALTY_ENABLED !== "true") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative overflow-hidden flex flex-col">
        {/* Header simple */}
        <div className="h-16 border-b flex items-center justify-center bg-white sticky top-0 z-10 shrink-0">
          <h1 className="font-semibold tracking-tight text-gray-900">
            <span className="text-[#930021]">Crosti</span> Scanner
          </h1>
        </div>

        {/* Client logic (Pin & Scanner) */}
        <StaffScannerClient />
      </div>
    </div>
  )
}
