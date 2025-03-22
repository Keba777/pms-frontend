export interface User {
    id?: string;
    first_name: string;
    last_name: string;
    phone: string;
    role_id: string;
    email: string;
    password: string;
    profile_picture?: string;
    country_code: string;
    country: string;
    state: string;
    city: string;
    zip: string;
}

export interface Role {
    id?: string;
    name: string;
}

export interface CreateRoleInput {
    name: string;
}

export interface UpdateRoleInput {
    id?: string;
    name: string;
}



export interface LoginCredential {
    email: string;
    password: string;
}

export interface UserLogin {
    user: User;
    token: string;
}

export interface RegisterUserData {
    user: User;
    token: string;
}
