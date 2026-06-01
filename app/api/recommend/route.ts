import { EXAMPLE_CAFE } from "@/lib/example-cafe";
import { recommendMatchaCafes } from "@/lib/matcha-search";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string };
    const query = body.query?.trim() ?? "";

    if (!query) {
      return NextResponse.json(
        { error: "Please describe what you're looking for." },
        { status: 400 },
      );
    }

    if (!process.env.EXA_API_KEY) {
      return NextResponse.json({
        cafes: [EXAMPLE_CAFE],
        requestId: "local-example",
      });
    }

    const recommendation = await recommendMatchaCafes(query);
    return NextResponse.json(recommendation);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Recommendation failed";

    const status = message.includes("EXA_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
