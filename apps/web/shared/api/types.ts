export interface UserEntity {
  id: number;
  userId: string;
  userName: string;
  email: string;
  password: string;
  profileImagePath: string;
  mbti: string;
  gender: string;
  birth: string;
  mainPicId: number;
}

export interface UserInsertDto {
  userId: string;
  userName: string;
  email: string;
  password: string;
  profileImagePath: string;
  mbti: string;
  gender: string;
  birth: string;
  mainPicId: number;
}

export interface AuthTokenResponse {
  status: number;
  data: {
    token_type: string;
    expires_in: string;
    access_token: string;
  };
  error: null | string;
  path: string;
  timestamp: string;
}
