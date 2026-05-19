import jwt from "jsonwebtoken";
import { NextResponse, NextRequest } from "next/server";
import { comparePassword, hashPassword } from "@/libs/auth";
import db_Config from "../Db_Conifg";
import User from "../models/usermodel";
import { authOptions } from "../authOptions";
import { getServerSession } from "next-auth/next";

export const registerUser = async (req: NextRequest) => {
  try {
    // 1. Database connect karna
    await db_Config();

    // 2. Request body se data nikalna
    const { username, email, password } = await req.json();

    // 3. Validation (Basic)
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Username, email and password are required" },
        { status: 400 },
      );
    }

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 },
      );
    }

    // 5. Password hash karna (Aapki auth utility use karte hue)
    const hashedPassword = await hashPassword(password);

    // 6. Naya User create karna
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: "Reader",
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully", success: true, user: newUser },

      { status: 201 },
    );
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

// login

export const login = async (req: NextRequest) => {
  try {
    await db_Config();
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Email does not exist" },
        { status: 401 },
      );
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "1d" },
    );
    return NextResponse.json({
      message: "Login Successful",
      token: token,
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        profilepic: user.profilepic,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error: Login Failed",
      },
      {
        status: 500,
      },
    );
  }
};

export const getalluser = async (req: NextRequest) => {
  try {
    // 1. Pehle check karein Session (Browser ke liye)
    const session = await getServerSession(authOptions);

    // 2. Phir check karein Authorization Token (Postman ke liye)
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    // Agar na session hai aur na hi valid token, tab block karein
    if (!session && !token) {
      return NextResponse.json(
        { error: "Unauthorized: Please login first" },
        { status: 401 },
      );
    }

    // Agar token maujood hai (Postman), to use verify karein
    if (token) {
      try {
        jwt.verify(token, process.env.NEXTAUTH_SECRET!);
      } catch (err) {
        return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
      }
    }

    await db_Config();
    const users = await User.find().select("-password");
    return NextResponse.json(
      {
        success: true,
        users,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};
// backend
