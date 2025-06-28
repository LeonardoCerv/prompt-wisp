import { createClient } from "@/lib/utils/supabase/server";
type user_role = 'owner' | 'buyer' | 'collaborator';

/**
 * Data model for a user-prompt relationship.
 */
export interface UsersPromptsData {
    id?: string;
    prompt_id: string;
    user_id: string;
    favorite?: boolean;
    user_role?: user_role;
}

class UsersPrompts {
    /**
     * Create a new user-prompt link.
     * @param usersPrompts - The data for the new link
     * @returns The created UsersPromptsData object
     */
    static async create(usersPrompts: UsersPromptsData): Promise<UsersPromptsData> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('users_prompts')
                .insert(usersPrompts)
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating user-prompt reference: ${error.message}`);
            }
            return data as UsersPromptsData;
        } catch (error) {
            console.error("Error creating user-prompt link:", error);
            throw error;
        }
    }

    /**
     * Get all prompts for a user.
     * @param userId - The prompt's ID
     * @returns Array of prompt IDs (empty if none found)
     */
    static async getPrompts(userId: string): Promise<string[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('users_prompts')
                .select('prompt_id')
                .eq('user_id', userId);

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return [];
                } 
                throw new Error(`Error getting users for prompt: ${error.message}`);
            }

            if (!data) return [];
            return data.map(row => row.prompt_id);
        } catch (error) {
            console.error("Error getting users by prompt ID:", error);
            throw error;
        }
    }

    /**
     * Get all user IDs for a prompt.
     * @param promptId - The prompt's ID
     * @returns Array of user IDs (empty if none found)
     */
    static async getUsers(promptId: string): Promise<string[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('users_prompts')
                .select('user_id')
                .eq('prompt_id', promptId);

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return [];
                } 
                throw new Error(`Error getting users for prompt: ${error.message}`);
            }

            if (!data) return [];
            return data.map(row => row.user_id);
        } catch (error) {
            console.error("Error getting users by prompt ID:", error);
            throw error;
        }
    }

    /**
     * Get the role of a user for a prompt.
     * @param promptId - The prompt's ID
     * @param userId - The user's ID
     * @returns The user's role or null if not found
     */
    static async getUserRole(promptId: string, userId: string): Promise<user_role | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('users_prompts')
                .select('user_role')
                .eq('user_id', userId)
                .eq('prompt_id', promptId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                } 
                throw new Error(`Error getting user role for prompt: ${error.message}`);
            }

            if (!data) return null;
            return data.user_role;
        } catch (error) {
            console.error("Error getting user role by prompt ID:", error);
            throw error;
        }
    }

    /**
     * Get all favorite prompts for a user.
     * @param userId - The user's ID
     * @returns Array of prompt IDs (empty if none found)
     */
    static async getFavorites(userId: string): Promise<string[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('users_prompts')
                .select('prompt_id')
                .eq('user_id', userId)
                .eq('favorite', true);

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return [];
                }
                throw new Error(`Error getting favorite prompts for user: ${error.message}`);
            }

            if (!data) return [];
            return data.map(row => row.prompt_id);
        } catch (error) {
            console.error("Error getting favorite prompts for user:", error);
            throw error;
        }
    }

    /**
     * Check if a prompt is favorite for a user.
     * @param userId - The user's ID
     * @param promptId - The prompt's ID
     * @returns Boolean indicating favorite status
     */
    static async isFavorite(userId: string, promptId: string): Promise<boolean> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('users_prompts')
                .select('favorite')
                .eq('user_id', userId)
                .eq('prompt_id', promptId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return false;
                }
                throw new Error(`Error checking favorite status: ${error.message}`);
            }

            if (!data) return false;
            return !!data.favorite;
        } catch (error) {
            console.error("Error checking favorite status:", error);
            throw error;
        }
    }

    /**
     * Update the role of a user for a prompt.
     * @param promptId - The prompt's ID
     * @param userId - The user's ID
     * @param role - The new role for the user
     * @returns The updated UsersPromptsData object
     */
    static async updateRole(promptId: string, userId: string, role: user_role): Promise<UsersPromptsData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('users_prompts')
                .update({ user_role: role })
                .eq('prompt_id', promptId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating user role: ${error.message}`);
            }

            return data as UsersPromptsData;
        } catch (error) {
            console.error("Error updating user role:", error);
            throw error;
        }
    }

    /**
     * Update the favorite status of a prompt for a user.
     * @param promptId - The prompt's ID
     * @param userId - The user's ID
     * @param fav - The new favorite status
     * @returns The updated UsersPromptsData object
     */
    static async updateFavorite(promptId: string, userId: string, fav: boolean): Promise<UsersPromptsData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('users_prompts')
                .update({ favorite: fav })
                .eq('prompt_id', promptId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating favorite status: ${error.message}`);
            }

            return data as UsersPromptsData;
        } catch (error) {
            console.error("Error updating favorite status:", error);
            throw error;
        }
    }

    /**
     * Remove the link between a user and a prompt.
     * @param userId - The user's ID
     * @param promptId - The prompt's ID
     */
    static async softDelete(userId: string, promptId: string): Promise<void> {
        try {
            const supabase = await createClient();
    
            const { error } = await supabase
                .from('users_prompts')
                .delete()
                .eq('user_id', userId)
                .eq('prompt_id', promptId);

            if (error) {
                throw new Error(`Error removing user from prompt: ${error.message}`);
            }
        } catch (error) {
            console.error("Error removing user from prompt:", error);
            throw error;
        }
    }

        /**
     * Remove the link between a user and a prompt.
     * @param userId - The user's ID
     * @param promptId - The prompt's ID
     */
    static async hardDelete(promptId: string): Promise<void> {
        try {
            const supabase = await createClient();
    
            const { error } = await supabase
                .from('users_prompts')
                .delete()
                .eq('prompt_id', promptId);

            if (error) {
                throw new Error(`Error removing user from prompt: ${error.message}`);
            }
        } catch (error) {
            console.error("Error removing user from prompt:", error);
            throw error;
        }
    }

    /**
     * Get the number of users for a prompt.
     * @param promptId - The prompt's ID
     * @returns The count of users
     */
    static async getUserCount(promptId: string): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('users_prompts')
                .select('*', { count: 'exact', head: true })
                .eq('prompt_id', promptId);

            if (error) {
                throw new Error(`Error getting user count: ${error.message}`);
            }
            return count || 0;
        } catch (error) {
            console.error("Error getting user count:", error);
            throw error;
        }
    }

    /**
     * Get the number of prompts a user has.
     * @param userId - The user's ID
     * @returns The count of prompts
     */
    static async getPromptCount(userId: string): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('users_prompts')
                .select('prompt_id', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error getting prompt count: ${error.message}`);
            }
            return count || 0;
        } catch (error) {
            console.error("Error getting prompt count:", error);
            throw error;
        }
    }
}

export default UsersPrompts;