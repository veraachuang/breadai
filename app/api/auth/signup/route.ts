import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { db } from "@/server/db"
import { Prisma } from "@prisma/client"

export async function POST(req: Request) {
  try {
    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error("Failed to parse request body:", e)
      return new NextResponse(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const { username, password } = body

    // Validate input
    if (!username || !password) {
      console.log("Missing required fields:", { username: !!username, password: !!password })
      return new NextResponse(
        JSON.stringify({ error: "Username and password are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Ensure database connection
    try {
      await db.$connect()
    } catch (error) {
      console.error("Failed to connect to database:", error)
      return new NextResponse(
        JSON.stringify({ error: "Database connection error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    try {
      // Check if username already exists
      console.log("Checking if username exists:", username)
      const existingUser = await db.user.findUnique({
        where: { username },
      })

      if (existingUser) {
        console.log("Username already exists:", username)
        return new NextResponse(
          JSON.stringify({ error: "Username already exists" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      // Hash password
      console.log("Hashing password...")
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      console.log("Creating user:", username)
      const user = await db.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      })

      console.log("User created successfully:", { userId: user.id, username })
      return new NextResponse(
        JSON.stringify({ message: "User created successfully", userId: user.id }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      )
    } catch (error) {
      console.error("Database operation failed:", error)
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors
        if (error.code === "P2002") {
          return new NextResponse(
            JSON.stringify({ error: "Username already exists" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          )
        }
      }

      return new NextResponse(
        JSON.stringify({ 
          error: "Database error. Please try again.",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
          code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    } finally {
      await db.$disconnect()
    }
  } catch (error) {
    console.error("Signup error:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to create user. Please try again.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
} 