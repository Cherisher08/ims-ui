export enum UserRole{
  Admin = "admin",
  User = "user",
  Guest = "guest",
}

export interface User{
    _id: string
    email: string
    name: string
    password: string
    role: UserRole
}

export interface UserRequest{
    email: string
    password: string
}

export interface AuthorizeUserResponse{
    access_token: string
    token_type: string
    _id: string
}

export interface GeneralResponse {
    detail: string
}

export interface UpdateUserPasswordRequest {
    email: string
    password: string
}