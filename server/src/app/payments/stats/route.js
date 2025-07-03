// app/payments/stats/route.js
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("payments");

    const totalCount = await collection.countDocuments();
    const totalAmount = await collection
      .aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])
      .toArray();

    const byStatus = await collection
      .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
      .toArray();

    const stats = {
      totalPayments: totalCount,
      totalAmount: totalAmount[0]?.total || 0,
      byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error("GET /payments/stats error:", err);
    return new NextResponse(JSON.stringify({ error: "Failed to get stats" }), {
      status: 500,
    });
  }
}
