export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export enum Branch {
  PADUR = 'PADUR-1',
  KELAMBAKKAM = 'KLMBK-1',
  PUDUPAKKAM = 'PUDPK-1',
}

export interface User {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  branch: Branch;
  _id?: string;
}

export interface UserRequest {
  email: string;
  password: string;
}

export interface AuthorizeUserResponse {
  access_token: string;
  token_type: string;
}

export interface GeneralResponse {
  detail: string;
}

export interface UpdateUserPasswordRequest {
  email: string;
  password: string;
}
