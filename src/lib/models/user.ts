export interface UserData {
    id: string; // UUID, foreign key to auth.users.id
    created_at: string; // ISO string, timestamptz, default: UTC now
    updated_at: string; // ISO string, timestamptz, default: UTC now
    username?: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
}