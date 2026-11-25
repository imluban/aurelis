import { NextResponse } from "next/server";

export async function GET() {
  // Keep this diagnostic endpoint local during development.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, message: "Not found." },
      { status: 404 },
    );
  }

  const apiKey = process.env.STEADFAST_API_KEY;
  const secretKey = process.env.STEADFAST_SECRET_KEY;
  const baseUrl =
    process.env.STEADFAST_API_BASE_URL ?? "https://portal.packzy.com/api/v1";

  if (!apiKey || !secretKey) {
    return NextResponse.json(
      {
        success: false,
        message: "Steadfast API credentials are missing.",
      },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(`${baseUrl}/police_stations`, {
      method: "GET",
      headers: {
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            response.status === 401 || response.status === 403
              ? "Steadfast rejected the credentials. Check your API keys."
              : `Steadfast returned HTTP ${response.status}.`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Steadfast.",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Could not reach Steadfast. Check your internet connection and try again.",
      },
      { status: 502 },
    );
  }
}
