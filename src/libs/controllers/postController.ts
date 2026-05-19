import { NextRequest, NextResponse } from "next/server";
import Post from "../models/postmodel";
import db_Config from "../Db_Conifg";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import jwt from "jsonwebtoken";
import User from "../models/usermodel";
import { Trykker } from "next/font/google";
interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

export const createPost = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!session && !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        { error: "User identity not found" },
        { status: 401 },
      );
    }

    const { title, content, image, status } = await req.json();
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and Content are required fields" },
        { status: 400 },
      );
    }

    await db_Config();

    const dbUser = await User.findOne({ email: currentUserEmail });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (dbUser.role === "Reader") {
      return NextResponse.json(
        { error: "Forbidden: Readers cannot create posts" },
        { status: 403 },
      );
    }
    // Create new post
    const newPost = await Post.create({
      title,
      content,
      image,
      status,
      author: dbUser._id,
    });
    await newPost.save();
    return NextResponse.json(
      { message: "Post created successfully", post: newPost },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
};
// get all posts

export const getallpublishedPosts = async (req: NextRequest) => {
  try {
    await db_Config();
    const posts = await Post.find({ status: "Published" }).populate(
      "author",
      "username email profilepic",
    );
    return NextResponse.json(
      { length: posts.length, post: posts },
      { status: 200 },
    );
  } catch (error) {
    console.error("error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
};
// draftposts

export const getalldraftPosts = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!session && !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        { error: "User identity not found" },
        { status: 401 },
      );
    }

    await db_Config();
    const posts = await Post.find({ status: "Draft" }).populate(
      "author",
      "username email profilepoic",
    );
    return NextResponse.json(
      { length: posts.length, post: posts },
      { status: 200 },
    );
  } catch (error) {
    console.error("error fetching draft posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft posts" },
      { status: 500 },
    );
  }
};

// update post
export const updatePostbyId = async (
  req: NextRequest,
  context: RouteContext,
) => {
  try {
    const session = await getServerSession(authOptions);
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!session && !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        { error: "User identity not found" },
        { status: 401 },
      );
    }

    // Express style json parameters se hatakar standard parameters context use kiya hai
    const resolvedParams = await context.params;
    const { id: postId } = resolvedParams;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID parameter is required" },
        { status: 400 },
      );
    }

    const { title, content, image, status } = await req.json();

    await db_Config();
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const dbUser = await User.findOne({ email: currentUserEmail });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ REMOVED OWNERSHIP CHECK: Any validated author can now update any post

    // Conditional evaluation updates fields cleanly
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (image !== undefined) post.image = image;
    if (status !== undefined) post.status = status;

    await post.save();
    return NextResponse.json(
      { message: "Post updated successfully", post },
      { status: 200 },
    );
  } catch (error) {
    console.error("error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 },
    );
  }
};

/// delete post by id`|
// delete post
export const deletePostbyId = async (
  req: NextRequest,
  context: RouteContext,
) => {
  try {
    const session = await getServerSession(authOptions);
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!session && !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        { error: "User identity not found" },
        { status: 401 },
      );
    }

    // Resolving context parameters for standard Next.js routing
    const resolvedParams = await context.params;
    const { id: postId } = resolvedParams;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID parameter is required" },
        { status: 400 },
      );
    }

    await db_Config();
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const dbUser = await User.findOne({ email: currentUserEmail });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ REMOVED OWNERSHIP CHECK: Any validated author can now delete any post

    // Deleting the document from the collection
    await post.deleteOne();

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
};
