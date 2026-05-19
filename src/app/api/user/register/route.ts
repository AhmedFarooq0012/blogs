import { registerUser } from "@/libs/controllers/userController";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  return registerUser(req);
};

//
