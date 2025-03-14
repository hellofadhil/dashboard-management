import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Check if this is a Firebase verification link
  if (
    url.pathname.startsWith("/__/auth/action") && // Menggunakan startsWith yang lebih aman
    url.searchParams.has("mode") &&
    url.searchParams.get("mode") === "verifyEmail"
  ) {
    // Extract the email from the URL if available
    const email = url.searchParams.get("email") || "";

    // Redirect to our custom verification success page
    url.pathname = "/auth/verify-success";
    if (email) {
      url.searchParams.set("email", email);
    }

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Perbaikan pada matcher agar valid di Next.js
export const config = {
  matcher: ["/__/auth/action/:path*"], // Menggunakan :path* sebagai wildcard yang valid
};
