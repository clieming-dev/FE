import type { User, Account } from "next-auth";
import { authClient } from "../../api/authClient";
import { UserInsertDto } from "../../api/types";
import { getOrRefreshToken } from "../utils";

export const signInCallback = async ({
  user,
  account,
}: {
  user: User;
  account: Account | null;
}) => {
  try {
    if (account && user) {
      const userData: UserInsertDto = {
        userId: user.id,
        name: user.name || user.email || "Unknown User",
        email: user.email || "",
        password: "",
        profileImagePath: user.image || "",
        mbti: "",
        gender: "",
        birth: "",
        mainPicId: 0,
      };

      const result = await getOrRefreshToken(authClient, userData.userId, "사용자 생성");

      if (!result.success) {
        const { shouldReauth } = result.errorResult || { shouldReauth: true };
        throw new Error(`❌ 토큰 발급 실패: ${shouldReauth ? "재인증 필요" : "서버 오류"}`);
      }

      let userId: number;

      try {
        const originalUserId = user.id;
        const existingUser = await authClient.getUserByUserId(originalUserId, result.accessToken);

        if (existingUser && existingUser.id) {
          userId = existingUser.id;
        } else {
          try {
            userId = await authClient.createUser(userData, result.accessToken);
          } catch (error) {
            throw new Error(
              `❌ 새 사용자 생성 실패: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }
      } catch (error) {
        throw new Error(
          `❌ 사용자 인증 처리 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      if (account && userId) {
        account.backend_jwt = result.accessToken;
        account.user_id = userId.toString();
      } else {
        throw new Error("❌ 사용자 ID 설정되지 않음");
      }
    }

    return true;
  } catch (error) {
    throw new Error(
      `❌ 소셜 로그인 실패: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
