import { updateProfile } from "@/libs/controllers/updateprofile";
import { NextRequest } from "next/server";

export const PUT = async (req: NextRequest) => {
  return updateProfile(req);
};
