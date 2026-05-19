import {
  createPost,
  getallpublishedPosts,
  updatePostbyId,
} from "@/libs/controllers/postController";
import { NextRequest } from "next/server";
export const POST = async (req: NextRequest) => {
  return createPost(req);
};
export const GET = async (req: NextRequest) => {
  return getallpublishedPosts(req);
};
// export const PATCH = async (req: NextRequest) => {
//   return updatePostbyId(req);
// };
