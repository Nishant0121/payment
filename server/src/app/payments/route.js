// app/payments/route.js
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("payments");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const method = searchParams.get("method");

    const query = {};
    if (status) query.status = status;
    if (method) query.method = method;

    const payments = await collection
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json({ payments, page, limit });
  } catch (err) {
    console.error("GET /payments error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch payments" }),
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      amount,
      receiver,
      status = "pending",
      method = "card",
      referenceId = null,
      timestamp = new Date(),
    } = body;

    // Basic validation
    if (!amount || !receiver) {
      return new NextResponse(
        JSON.stringify({ error: "amount and receiver are required" }),
        {
          status: 400,
        }
      );
    }

    if (!["success", "failed", "pending"].includes(status)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid status value" }),
        {
          status: 400,
        }
      );
    }

    const now = new Date();
    const newPayment = {
      _id: new ObjectId(),
      amount,
      receiver,
      status,
      method,
      timestamp: new Date(timestamp),
      referenceId,
      createdAt: now,
      updatedAt: now,
    };

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("payments").insertOne(newPayment);

    return NextResponse.json({
      message: "Payment created",
      id: result.insertedId,
    });
  } catch (err) {
    console.error("POST /payments error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create payment" }),
      {
        status: 500,
      }
    );
  }
}
