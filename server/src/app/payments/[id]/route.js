// app/payments/[id]/route.js
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const client = await clientPromise;
    const db = client.db();
    const payment = await db
      .collection("payments")
      .findOne({ _id: new ObjectId(id) });

    if (!payment) {
      return new NextResponse(JSON.stringify({ error: "Payment not found" }), {
        status: 404,
      });
    }

    return NextResponse.json(payment);
  } catch (err) {
    console.error("GET /payments/:id error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch payment" }),
      {
        status: 500,
      }
    );
  }
}
