export interface UserInsertDto {
  userId: string;
  name: string;
  email: string;
  password: string;
  profileImagePath: string;
  mbti: string;
  gender: string;
  birth: string;
  mainPicId: number;
}

export interface UserEntity extends UserInsertDto {
  id: number;
}
export interface AuthTokenResponse {
  status: number;
  data: {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  };
  error: null | string;
  path: string;
  timestamp: string;
}
