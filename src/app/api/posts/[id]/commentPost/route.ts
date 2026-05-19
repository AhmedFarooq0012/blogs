import { createCommentOnPost, getAllCommentsByPostId } from "@/libs/controllers/commentController";
import { NextRequest } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}
export const POST = async (req: NextRequest, context: RouteContext) => {
  return createCommentOnPost(req, context);
};
export const GET = async (req: NextRequest, context: RouteContext) => {
  return getAllCommentsByPostId(req, context);
};
