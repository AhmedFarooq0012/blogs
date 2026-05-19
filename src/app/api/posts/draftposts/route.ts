import { getalldraftPosts } from "@/libs/controllers/postController";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  return getalldraftPosts(req);
};
