export enum UserRole{
  Admin = "admin",
  User = "user",
  Guest = "guest",
}

export interface User{
    email: string
    name: string
    password: string
    role: UserRole
    _id?: string
}

export interface UserRequest{
    email: string
    password: string
}

export interface AuthorizeUserResponse{
    access_token: string
    token_type: string
}

export interface GeneralResponse {
    detail: string
}

export interface UpdateUserPasswordRequest {
    email: string
    password: string
}