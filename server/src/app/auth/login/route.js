// app/login/route.js
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your_dev_jwt_secret"; // Use strong secret in production

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new NextResponse(
        JSON.stringify({ error: "Username and password are required" }),
        {
          status: 400,
        }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid username or password" }),
        {
          status: 401,
        }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid username or password" }),
        {
          status: 401,
        }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
      }
    );
  }
}
