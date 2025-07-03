// pages/api/users.js
import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/verifyToken";

export async function GET(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(); // Or specify the DB name: client.db('your_db_name')
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    const loginuser = verifyToken(token);

    if (!loginuser || loginuser.role !== "admin") {
      return new NextResponse(
        JSON.stringify({ error: "Only admin can add users" }),
        {
          status: 403,
        }
      );
    }

    const body = await request.json();
    const { username, password, role } = body;

    // Validate required fields
    if (!username || !password || !role) {
      return new NextResponse(
        JSON.stringify({ error: "username, password, and role are required." }),
        {
          status: 400,
        }
      );
    }

    // Validate role
    if (!["admin", "viewer", "intern"].includes(role)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid role. Must be admin or viewer." }),
        {
          status: 400,
        }
      );
    }

    const client = await clientPromise;
    const db = client.db(); // or client.db('your_db_name')
    const usersCollection = db.collection("users");

    // Check for existing user
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ error: "Username already exists." }),
        {
          status: 409,
        }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date();

    // Insert user
    const newUser = {
      _id: new ObjectId(),
      username,
      password: hashedPassword,
      role,
      createdAt: now,
      updatedAt: now,
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json({
      message: "User created successfully.",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
      }
    );
  }
}
