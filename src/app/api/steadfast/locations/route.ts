import { NextResponse } from "next/server";

type PoliceStation = {
  id: number;
  name: string;
  status?: number;
};

type SteadfastDistrict = {
  id: number;
  name: string;
  policestations: PoliceStation[];
};

export async function GET() {
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
      { success: false, message: "Missing Steadfast credentials." },
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
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Steadfast returned HTTP ${response.status}.`,
        },
        { status: 502 },
      );
    }

    const payload: unknown = await response.json();

    if (
      !payload ||
      typeof payload !== "object" ||
      !("data" in payload) ||
      !Array.isArray(payload.data)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unexpected location data from Steadfast.",
        },
        { status: 502 },
      );
    }

    const districts: SteadfastDistrict[] = payload.data
      .filter(
        (district): district is Record<string, unknown> =>
          typeof district === "object" &&
          district !== null &&
          typeof district.id === "number" &&
          typeof district.name === "string",
      )
      .map((district) => ({
        id: district.id as number,
        name: district.name as string,
        policestations: Array.isArray(district.policestations)
          ? district.policestations
              .filter(
                (station): station is Record<string, unknown> =>
                  typeof station === "object" &&
                  station !== null &&
                  typeof station.id === "number" &&
                  typeof station.name === "string",
              )
              .map((station) => ({
                id: station.id as number,
                name: station.name as string,
                ...(typeof station.status === "number"
                  ? { status: station.status }
                  : {}),
              }))
          : [],
      }));

    if (districts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Steadfast returned no usable districts.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      count: districts.length,
      districts,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve Steadfast locations.",
      },
      { status: 502 },
    );
  }
}
