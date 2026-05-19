import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import db_Config from "../Db_Conifg";
import User from "../models/usermodel";
import Post from "../models/postmodel";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const likePostById = async (req: NextRequest, context: RouteContext) => {
  try {
    const session = await getServerSession(authOptions);
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    // Explicit messaging for unregistered/unauthenticated users
    if (!session && !token) {
      return NextResponse.json(
        { error: "Please create an account or sign in to like this post." },
        { status: 401 },
      );
    }

    let currentUserEmail: string | null | undefined = session?.user?.email;
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
        { error: "Please create an account or sign in to like this post." },
        { status: 401 },
      );
    }

    // Resolve post ID parameter
    const resolvedParams = await context.params;
    const { id: postId } = resolvedParams;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID parameter is required" },
        { status: 400 },
      );
    }

    await db_Config();

    // Verify if user exists in the database
    const dbUser = await User.findOne({ email: currentUserEmail });
    if (!dbUser) {
      return NextResponse.json(
        {
          error:
            "Account not found. Please create an account to like this post.",
        },
        { status: 404 },
      );
    }

    // Role Enforcement: Restrict functionality to Readers only
    if (dbUser.role !== "Reader") {
      return NextResponse.json(
        { error: "Forbidden: Only readers can like posts." },
        { status: 403 },
      );
    }

    // Verify if the target post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if the reader has already liked this post
    const userObjectId = dbUser._id;
    const hasLiked = post.likes.includes(userObjectId);

    if (hasLiked) {
      // Toggle functionality: Unlike the post
      post.likes = post.likes.filter(
        (id: any) => id.toString() !== userObjectId.toString(),
      );
      await post.save();
      return NextResponse.json(
        { message: "Post unliked successfully", likesCount: post.likes.length },
        { status: 200 },
      );
    } else {
      // Toggle functionality: Like the post
      post.likes.push(userObjectId);
      await post.save();
      return NextResponse.json(
        { message: "Post liked successfully", likesCount: post.likes.length },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error processing post like:", error);
    return NextResponse.json(
      { error: "Failed to process like action" },
      { status: 500 },
    );
  }
};
