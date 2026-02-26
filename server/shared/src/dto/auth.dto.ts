export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  referralCode?: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
}
