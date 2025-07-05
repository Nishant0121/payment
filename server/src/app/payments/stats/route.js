// app/payments/stats/route.js
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { startOfDay, startOfWeek, subDays } from "date-fns";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("payments");

    const now = new Date();
    const startToday = startOfDay(now);
    const startWeek = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of week
    const sevenDaysAgo = subDays(startToday, 6); // For chart: last 7 days including today

    // 1. Total payments today
    const paymentsToday = await collection.countDocuments({
      timestamp: { $gte: startToday },
    });

    // 2. Total payments this week
    const paymentsThisWeek = await collection.countDocuments({
      timestamp: { $gte: startWeek },
    });

    // 3. Total revenue (all time)
    const totalRevenueAgg = await collection
      .aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray();
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // 4. Failed transactions count
    const failedTransactions = await collection.countDocuments({
      status: "failed",
    });

    // 5. Revenue over the last 7 days
    const revenueByDay = await collection
      .aggregate([
        {
          $match: {
            status: "success",
            timestamp: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // Fill missing days with 0 revenue
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const date = subDays(startToday, 6 - i);
      const formatted = date.toISOString().slice(0, 10);
      const day = revenueByDay.find((d) => d._id === formatted);
      chartData.push({ date: formatted, revenue: day?.total || 0 });
    }

    const stats = {
      totalPaymentsToday: paymentsToday,
      totalPaymentsThisWeek: paymentsThisWeek,
      totalRevenue,
      failedTransactions,
      revenueChart: chartData, // [{ date: "2025-07-01", revenue: 199.99 }, ...]
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error("GET /payments/stats error:", err);
    return new NextResponse(JSON.stringify({ error: "Failed to get stats" }), {
      status: 500,
    });
  }
}
