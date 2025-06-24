import { createClient } from "@/lib/utils/supabase/server";

// Core User interface matching Supabase schema
export interface UserData {
    id: string;
    name: string;
    username: string;
    email: string;
    profile_picture: string | null;
    bio: string | null;
    collections: string[] | null; // list of collection IDs
    prompts: string[] | null; // list of prompt IDs
    bought: string[] | null; // list of marketplace IDs
    favorites: string[] | null; // list of prompt, collection, marketplace IDs
    payment_info_id: string | null;
    created_at: string;
    updated_at: string;
}

// Interface for creating new users
export interface UserInsert {
    id?: string;
    name: string;
    username: string;
    email: string;
    profile_picture?: string | null;
    bio?: string | null;
    collections?: string[] | null;
    prompts?: string[] | null;
    bought?: string[] | null;
    favorites?: string[] | null;
    payment_info_id?: string | null;
    created_at?: string;
    updated_at?: string;
}

// Interface for updating existing users
export interface UserUpdate {
    id?: string;
    name?: string;
    username?: string;
    email?: string;
    profile_picture?: string | null;
    bio?: string | null;
    collections?: string[] | null;
    prompts?: string[] | null;
    bought?: string[] | null;
    favorites?: string[] | null;
    payment_info_id?: string | null;
    updated_at?: string;
}

class User {
    // Create a new user
    static async create(userData: UserInsert): Promise<UserData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('users')
                .insert(userData)
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating user: ${error.message}`);
            }

            return data as UserData;
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    }

    // Get all users
    static async findAll(): Promise<UserData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting users: ${error.message}`);
            }

            return data as UserData[];
        } catch (error) {
            console.error("Error getting all users:", error);
            throw error;
        }
    }

    // Get user by ID
    static async findById(id: string): Promise<UserData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting user: ${error.message}`);
            }

            return data as UserData;
        } catch (error) {
            console.error("Error getting user by ID:", error);
            throw error;
        }
    }

    // Get user by username
    static async findByUsername(username: string): Promise<UserData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting user by username: ${error.message}`);
            }

            return data as UserData;
        } catch (error) {
            console.error("Error getting user by username:", error);
            throw error;
        }
    }

    // Get user by email
    static async findByEmail(email: string): Promise<UserData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting user by email: ${error.message}`);
            }

            return data as UserData;
        } catch (error) {
            console.error("Error getting user by email:", error);
            throw error;
        }
    }

    // Search users by name or username
    static async search(query: string): Promise<UserData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error searching users: ${error.message}`);
            }

            return data as UserData[];
        } catch (error) {
            console.error("Error searching users:", error);
            throw error;
        }
    }

    // Update user
    static async update(id: string, updates: UserUpdate): Promise<UserData> {
        try {
            const supabase = await createClient();
            
            // Add updated_at timestamp
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating user: ${error.message}`);
            }

            return data as UserData;
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    }

    // Add prompt to user's prompts list
    static async addPrompt(id: string, promptId: string): Promise<UserData> {
        try {
            const supabase = await createClient();
            
            const user = await this.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            const currentPrompts = user.prompts || [];
            if (!currentPrompts.includes(promptId)) {
                currentPrompts.push(promptId);
            }

            const { data, error } = await supabase
                .from('users')
                .update({ 
                    prompts: currentPrompts,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding prompt to user: ${error.message}`);
            }

            return data as UserData;
        } catch (error) {
            console.error("Error adding prompt to user:", error);
            throw error;
        }
    }

    // Add collection to user's collections list
    static async addCollection(id: string, collectionId: string): Promise<UserData> {
        try {
            const supabase = await createClient();
            
            const user = await this.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            const currentCollections = user.collections || [];
            if (!currentCollections.includes(collectionId)) {
                currentCollections.push(collectionId);
            }

            const { data, error } = await supabase
                .from('users')
                .update({ 
                    collections: currentCollections,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding collection to user: ${error.message}`);
            }

            return data as UserData;
        } catch (error) {
            console.error("Error adding collection to user:", error);
            throw error;
        }
    }

    // Add to favorites
    static async addFavorite(id: string, itemId: string): Promise<UserData> {
        try {
            const supabase = await createClient();
            
            const user = await this.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            const currentFavorites = user.favorites || [];
            if (!currentFavorites.includes(itemId)) {
                currentFavorites.push(itemId);
            }

            const { data, error } = await supabase
                .from('users')
                .update({ 
                    favorites: currentFavorites,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding favorite: ${error.message}`);
            }

            return data as UserData;
        } catch (error) {
            console.error("Error adding favorite:", error);
            throw error;
        }
    }

    // Remove from favorites
    static async removeFavorite(id: string, itemId: string): Promise<UserData> {
        try {
            const supabase = await createClient();
            
            const user = await this.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            const currentFavorites = (user.favorites || []).filter(
                favId => favId !== itemId
            );

            const { data, error } = await supabase
                .from('users')
                .update({ 
                    favorites: currentFavorites,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error removing favorite: ${error.message}`);
            }

            return data as UserData;
        } catch (error) {
            console.error("Error removing favorite:", error);
            throw error;
        }
    }

    // Add purchase to bought list
    static async addPurchase(id: string, marketplaceId: string): Promise<UserData> {
        try {
            const supabase = await createClient();
            
            const user = await this.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            const currentBought = user.bought || [];
            if (!currentBought.includes(marketplaceId)) {
                currentBought.push(marketplaceId);
            }

            const { data, error } = await supabase
                .from('users')
                .update({ 
                    bought: currentBought,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding purchase: ${error.message}`);
            }

            return data as UserData;
        } catch (error) {
            console.error("Error adding purchase:", error);
            throw error;
        }
    }

    // Delete user
    static async delete(id: string): Promise<void> {
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Error deleting user: ${error.message}`);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }

    // Get users count
    static async getCount(): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            if (error) {
                throw new Error(`Error getting users count: ${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting users count:", error);
            throw error;
        }
    }
}

export default User;
