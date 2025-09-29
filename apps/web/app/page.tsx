"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Splash } from "@/shared/ui";
import { HomeScreen } from "@/screens/home";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/signin");
  }, [session, status, router]);

  if (status === "loading") {
    return <Splash type="loading" />;
  }

  if (!session) {
    return <Splash type="moveToLogin" />;
  }

  return <HomeScreen session={session} />;
}
