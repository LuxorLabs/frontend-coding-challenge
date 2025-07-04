export interface CreateUserDTO {
  email: string;
  name?: string;
  password: string;
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  password?: string;
}
