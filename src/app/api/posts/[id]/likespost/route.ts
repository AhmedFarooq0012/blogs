import { NextRequest } from "next/server";
import { likePostById } from "@/libs/controllers/likesCntroller";

interface RouteContext {
  params: Promise<{ id: string }>;
}
export const PATCH = async (req: NextRequest, context: RouteContext) => {
  return likePostById(req, context);
};
