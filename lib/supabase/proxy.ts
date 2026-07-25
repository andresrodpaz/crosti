import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. Fast path: if NOT a protected route (/admin or /developer), skip Supabase auth check entirely
  const isAdminRoute = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")
  const isDevRoute = pathname.startsWith("/developer") && !pathname.startsWith("/developer/login")

  if (!isAdminRoute && !isDevRoute) {
    return NextResponse.next()
  }

  // 2. Only instantiate Supabase and call auth.getUser() for protected routes
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  if (isDevRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/developer/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
