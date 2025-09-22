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
  access_token: string;
  expires_in: string;
  token_type: string;
}
