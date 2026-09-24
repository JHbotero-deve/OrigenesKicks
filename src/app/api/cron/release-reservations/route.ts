import { releaseExpiredReservationsInternal } from "@/lib/reservations";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await releaseExpiredReservationsInternal();
    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error liberando reservas vencidas:", error);
    return Response.json({ success: false, error: "No se pudieron liberar las reservas." }, { status: 500 });
  }
}
