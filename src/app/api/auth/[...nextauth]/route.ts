import NextAuth from "next-auth";
import { authOptions } from "@/libs/authOptions"; // Update this path to where your authOptions file actually lives

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
