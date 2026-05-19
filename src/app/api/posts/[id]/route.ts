import { NextRequest } from "next/server";
import { deletePostbyId, updatePostbyId } from "@/libs/controllers/postController";
interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}
export const PATCH = async (req: NextRequest, context: RouteContext) => {
  return updatePostbyId(req, context); // Context bhejnatra lazmi hai
};
export const DELETE = async (req: NextRequest, context: RouteContext) => {
  // Implement delete logic here, similar to updatePostbyId but for deletion
  return deletePostbyId(req, context);
}
