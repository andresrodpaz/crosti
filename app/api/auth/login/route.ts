import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password, type } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    // console.log("[Message] Auth response:", { authData, authError })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    console.log("[Message] Profile query result:", { profile, profileError });

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Usuario sin perfil configurado" },
        { status: 403 },
      );
    }

    // Check role based on type
    const requiredRoles =
      type === "developer" ? ["developer", "admin"] : ["admin", "editor"];

    if (!requiredRoles.includes(profile.role)) {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          error:
            type === "developer"
              ? "No tienes permisos de desarrollador"
              : "No tienes permisos de administrador",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error("[Message] Login error:", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 },
    );
  }
}
