import { NextResponse, NextRequest } from "next/server";
import { comparePassword, hashPassword } from "@/libs/auth";
import db_Config from "../Db_Conifg";
import User from "../models/usermodel";
import { authOptions } from "../authOptions";
import { getServerSession } from "next-auth/next";
import jwt from "jsonwebtoken";
export const updateProfile = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!session && !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let currentUserEmail: string | null | undefined = session?.user?.email;

    // If Postman is used (no session, but token exists)
    if (!currentUserEmail && token) {
      try {
        const decoded: any = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
        currentUserEmail = decoded.email;
      } catch (err) {
        return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
      }
    }

    if (!currentUserEmail) {
      return NextResponse.json(
        { error: "User identity not found" },
        { status: 401 },
      );
    }

    await db_Config();
    const { username, profilepic, newEmail, role } = await req.json();

    const user = await User.findOne({ email: currentUserEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // New email check
    if (newEmail && newEmail !== currentUserEmail) {
      const emailExists = await User.findOne({ email: newEmail });
      if (emailExists) {
        return NextResponse.json(
          { error: "Email already taken" },
          { status: 400 },
        );
      }
      user.email = newEmail;
    }

    if (username) user.username = username;
    if (profilepic) user.profilepic = profilepic;
    if (role) user.role = role;
    await user.save();

    const { password, ...updatedUser } = user.toObject();
    return NextResponse.json(
      {
        message: "Profile updated successfully",
        success: true,
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
