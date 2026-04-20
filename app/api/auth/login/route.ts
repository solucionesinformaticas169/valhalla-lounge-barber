import { NextResponse } from "next/server";

import {
  createSessionToken,
  getSessionCookieName,
  getSessionDurationSeconds,
  isValidAdminCredentials
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    identifier?: string;
    password?: string;
  };

  const identifier = body.identifier?.trim() ?? "";
  const password = body.password ?? "";

  if (!identifier || !password) {
    return NextResponse.json(
      { message: "Ingresa tu correo o usuario y la contraseña." },
      { status: 400 }
    );
  }

  if (!isValidAdminCredentials(identifier, password)) {
    return NextResponse.json(
      { message: "Credenciales incorrectas. Verifica tus datos." },
      { status: 401 }
    );
  }

  const token = await createSessionToken();
  const response = NextResponse.json({
    message: "Ingreso correcto.",
    redirectTo: "/admin/citas"
  });

  response.cookies.set({
    name: getSessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionDurationSeconds()
  });

  return response;
}
