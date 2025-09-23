import jwt from "jsonwebtoken";

export function generateAppleClientSecret(): string {
  const teamId = process.env.APPLE_TEAM_ID;
  const clientId = process.env.APPLE_CLIENT_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY;

  if (!teamId || !clientId || !keyId || !privateKey) {
    throw new Error("Apple 인증 설정이 완료되지 않았습니다. 환경변수를 확인해주세요.");
  }

  // JWT 페이로드 생성
  const payload = {
    iss: teamId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 180, // 6개월 후 만료
    aud: "https://appleid.apple.com",
    sub: clientId,
  };

  // JWT 서명 옵션
  const options: jwt.SignOptions = {
    algorithm: "ES256",
    keyid: keyId,
  };

  try {
    // JWT 토큰 생성
    const clientSecret = jwt.sign(payload, privateKey, options);
    return clientSecret;
  } catch (error) {
    console.error("Apple Client Secret 생성 실패:", error);
    throw new Error("Apple Client Secret 생성에 실패했습니다.");
  }
}

/**
 * Apple 인증 설정 검증
 */
export function validateAppleConfig(): boolean {
  const requiredEnvVars = ["APPLE_TEAM_ID", "APPLE_CLIENT_ID", "APPLE_KEY_ID", "APPLE_PRIVATE_KEY"];

  return requiredEnvVars.every((envVar) => {
    const value = process.env[envVar];
    return value && value !== `your-${envVar.toLowerCase().replace("_", "-")}`;
  });
}
