import { Suspense } from "react";
import { Signin } from "@/domains/auth/signin";

export default function SigninPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signin />
    </Suspense>
  );
}
