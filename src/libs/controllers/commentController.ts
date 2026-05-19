import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import db_Config from "../Db_Conifg";
import User from "../models/usermodel";
import Post from "../models/postmodel";
// Import mongoose to apply the explicit Model type casting
import mongoose from "mongoose";

// This type cast forces TypeScript to recognize the Mongoose model methods
import CommentModel from "../models/commentsmodel";
interface RouteContext {
  params: Promise<{ id: string }>;
}

export const createCommentOnPost = async (
  req: NextRequest,
  context: RouteContext,
) => {
  try {
    const session = await getServerSession(authOptions);
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!session && !token) {
      return NextResponse.json(
        {
          error: "Please create an account or sign in to comment on this post.",
        },
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
        {
          error: "Please create an account or sign in to comment on this post.",
        },
        { status: 401 },
      );
    }

    const resolvedParams = await context.params;
    const { id: postId } = resolvedParams;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID parameter is required" },
        { status: 400 },
      );
    }

    const { commentText } = await req.json();
    if (!commentText || commentText.trim() === "") {
      return NextResponse.json(
        { error: "Comment text cannot be empty" },
        { status: 400 },
      );
    }

    await db_Config();

    const dbUser = await User.findOne({ email: currentUserEmail });
    if (!dbUser) {
      return NextResponse.json(
        {
          error:
            "Account not found. Please create an account to comment on this post.",
        },
        { status: 404 },
      );
    }

    if (dbUser.role !== "Reader") {
      return NextResponse.json(
        { error: "Forbidden: Only readers can comment on posts." },
        { status: 403 },
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // This now works perfectly without any TypeScript complaints
    const newComment = await CommentModel.create({
      commentText: commentText.trim(),
      user: dbUser._id,
      post: postId,
    });

    return NextResponse.json(
      { message: "Comment added successfully", comment: newComment },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error processing post comment:", error);
    return NextResponse.json(
      { error: "Failed to process comment action" },
      { status: 500 },
    );
  }
};
// get all comments for a post
export const getAllCommentsByPostId = async (
  req: NextRequest,
  context: RouteContext,
) => {
  try {
    // Resolve post ID parameter from URL route
    const resolvedParams = await context.params;
    const { id: postId } = resolvedParams;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID parameter is required" },
        { status: 400 },
      );
    }

    await db_Config();

    // Verify if the target post actually exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Fetch all comments for this post and populate commenter info
    const comments = await CommentModel.find({ post: postId })
      .populate("user", "username email profilepic")
      .sort({ createdAt: -1 }); // Newest comments first

    return NextResponse.json(
      {
        message: "Comments fetched successfully",
        length: comments.length, // Keeps compatibility with your existing code
        totalComments: comments.length, // ✅ Explicitly sends total comments count
        comments,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
};
