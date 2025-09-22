"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Splash } from "@/screens/splash";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <Splash type="loading" />;
  }

  if (!session) {
    return <Splash type="moveToLogin" />;
  }

  return "로그인 완료";
}
