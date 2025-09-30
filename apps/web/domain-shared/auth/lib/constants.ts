export const isProd = process.env.NODE_ENV === "production";

export const secureCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: isProd,
};
