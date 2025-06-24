import { createClient } from "@/lib/utils/supabase/server";

// Core Prompt interface matching Supabase schema
export interface PromptData {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    content: string;
    tags: string[];
    is_public: boolean;
    is_deleted: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
    last_used_at: string;
}

// Interface for creating new prompts
export interface PromptInsert {
    id?: string;
    slug: string;
    title: string;
    description?: string | null;
    content: string;
    tags?: string[];
    is_public?: boolean;
    is_deleted?: boolean;
    user_id: string;
    created_at?: string;
    updated_at?: string;
    last_used_at?: string;
}

// Interface for updating existing prompts
export interface PromptUpdate {
    id?: string;
    slug?: string;
    title?: string;
    description?: string | null;
    content?: string;
    tags?: string[];
    is_public?: boolean;
    is_deleted?: boolean;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
    last_used_at?: string;
}

// Extended interface with user profile information
export interface PromptWithProfile extends PromptData {
    profiles?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

class Prompt {
    // Create a new prompt
    static async create(promptData: PromptInsert): Promise<PromptData> {
        try {
            const supabase = await createClient();

            // Check if slug already exists
            if (promptData.slug) {
                const { data: existsResult, error: existsError } = await supabase
                    .from('prompts')
                    .select('slug')
                    .eq('slug', promptData.slug)
                    .single();

                if (existsError && existsError.code !== 'PGRST116') { // PGRST116 = no rows returned
                    throw new Error(`Error checking slug: ${existsError.message}`);
                }

                if (existsResult) {
                    throw new Error(`A prompt with slug "${promptData.slug}" already exists`);
                }
            }

            const { data, error } = await supabase
                .from('prompts')
                .insert(promptData)
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating prompt: ${error.message}`);
            }

            return data as PromptData;
        } catch (error) {
            console.error("Error creating prompt:", error);
            throw error;
        }
    }

    // Get all prompts (including deleted ones if requested)
    static async findAll(includeDeleted: boolean = false): Promise<PromptData[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('prompts')
                .select('*')
                .order('created_at', { ascending: false });

            if (!includeDeleted) {
                query = query.eq('is_deleted', false);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error getting prompts: ${error.message}`);
            }

            return data as PromptData[];
        } catch (error) {
            console.error("Error getting all prompts:", error);
            throw error;
        }
    }

    // Get prompt by ID
    static async findById(id: string): Promise<PromptData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .eq('id', id)
                .eq('is_deleted', false)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting prompt: ${error.message}`);
            }

            return data as PromptData;
        } catch (error) {
            console.error("Error getting prompt by ID:", error);
            throw error;
        }
    }

    // Get prompt by slug
    static async findBySlug(slug: string): Promise<PromptData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .eq('slug', slug)
                .eq('is_deleted', false)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting prompt: ${error.message}`);
            }

            return data as PromptData;
        } catch (error) {
            console.error("Error getting prompt by slug:", error);
            throw error;
        }
    }

    // Get all public prompts
    static async findPublic(): Promise<PromptData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .eq('is_public', true)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting public prompts: ${error.message}`);
            }

            return data as PromptData[];
        } catch (error) {
            console.error("Error getting public prompts:", error);
            throw error;
        }
    }

    // Get all public prompts with user profile information
    static async findPublicWithProfiles(): Promise<PromptWithProfile[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .select(`
                    *,
                    profiles:user_id (
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('is_public', true)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting public prompts with profiles: ${error.message}`);
            }

            return data as PromptWithProfile[];
        } catch (error) {
            console.error("Error getting public prompts with profiles:", error);
            throw error;
        }
    }

    // Get prompts by user ID
    static async findByUserId(userId: string, includePrivate: boolean = false): Promise<PromptData[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('prompts')
                .select('*')
                .eq('user_id', userId)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (!includePrivate) {
                query = query.eq('is_public', true);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error getting user prompts: ${error.message}`);
            }

            return data as PromptData[];
        } catch (error) {
            console.error("Error getting prompts by user ID:", error);
            throw error;
        }
    }

    // Get all prompts with profile information (for admin/authenticated users)
    static async findAllWithProfiles(includeDeleted: boolean = false): Promise<PromptWithProfile[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('prompts')
                .select(`
                    *,
                    profiles:user_id (
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .order('created_at', { ascending: false });

            if (!includeDeleted) {
                query = query.eq('is_deleted', false);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error getting prompts with profiles: ${error.message}`);
            }

            return data as PromptWithProfile[];
        } catch (error) {
            console.error("Error getting prompts with profiles:", error);
            throw error;
        }
    }

    // Get prompts by tag(s)
    static async findByTag(tag: string): Promise<PromptData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .contains('tags', [tag])
                .eq('is_public', true)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting prompts by tag: ${error.message}`);
            }

            return data as PromptData[];
        } catch (error) {
            console.error("Error getting prompts by tag:", error);
            throw error;
        }
    }

    // Get prompts by multiple tags (AND operation)
    static async findByTags(tags: string[]): Promise<PromptData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .containedBy('tags', tags)
                .eq('is_public', true)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting prompts by tags: ${error.message}`);
            }

            return data as PromptData[];
        } catch (error) {
            console.error("Error getting prompts by tags:", error);
            throw error;
        }
    }

    // Search prompts by title, description, or content
    static async search(query: string): Promise<PromptData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
                .eq('is_public', true)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error searching prompts: ${error.message}`);
            }

            return data as PromptData[];
        } catch (error) {
            console.error("Error searching prompts:", error);
            throw error;
        }
    }

    // Update prompt
    static async update(id: string, updates: PromptUpdate): Promise<PromptData> {
        try {
            const supabase = await createClient();
            
            // Add updated_at timestamp
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('prompts')
                .update(updateData)
                .eq('id', id)
                .eq('is_deleted', false)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating prompt: ${error.message}`);
            }

            return data as PromptData;
        } catch (error) {
            console.error("Error updating prompt:", error);
            throw error;
        }
    }

    // Update last used timestamp
    static async updateLastUsed(id: string): Promise<PromptData> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .update({ 
                    last_used_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('is_deleted', false)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating last used: ${error.message}`);
            }

            return data as PromptData;
        } catch (error) {
            console.error("Error updating last used:", error);
            throw error;
        }
    }

    // Soft delete (mark as deleted)
    static async softDelete(id: string): Promise<PromptData> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .update({ 
                    is_deleted: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error soft deleting prompt: ${error.message}`);
            }

            return data as PromptData;
        } catch (error) {
            console.error("Error soft deleting prompt:", error);
            throw error;
        }
    }

    // Restore a soft deleted prompt
    static async restore(id: string): Promise<PromptData> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .update({ 
                    is_deleted: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error restoring prompt: ${error.message}`);
            }

            return data as PromptData;
        } catch (error) {
            console.error("Error restoring prompt:", error);
            throw error;
        }
    }

    // Hard delete (permanently remove from database)
    static async hardDelete(id: string): Promise<void> {
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .from('prompts')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Error hard deleting prompt: ${error.message}`);
            }
        } catch (error) {
            console.error("Error hard deleting prompt:", error);
            throw error;
        }
    }

    // Get recently used prompts
    static async findRecentlyUsed(userId?: string, limit: number = 10): Promise<PromptData[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('prompts')
                .select('*')
                .eq('is_deleted', false)
                .order('last_used_at', { ascending: false })
                .limit(limit);

            if (userId) {
                query = query.eq('user_id', userId);
            } else {
                query = query.eq('is_public', true);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error getting recently used prompts: ${error.message}`);
            }

            return data as PromptData[];
        } catch (error) {
            console.error("Error getting recently used prompts:", error);
            throw error;
        }
    }

    // Get all unique tags
    static async getAllTags(): Promise<string[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .select('tags')
                .eq('is_public', true)
                .eq('is_deleted', false);

            if (error) {
                throw new Error(`Error getting tags: ${error.message}`);
            }

            // Flatten and deduplicate tags
            const allTags = data.reduce((acc: string[], prompt) => {
                return acc.concat(prompt.tags || []);
            }, []);

            return [...new Set(allTags)].sort();
        } catch (error) {
            console.error("Error getting all tags:", error);
            throw error;
        }
    }

    // Get prompts count by user
    static async getCountByUser(userId: string): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('prompts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_deleted', false);

            if (error) {
                throw new Error(`Error getting prompts count: ${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting prompts count:", error);
            throw error;
        }
    }

    // Get public prompts count
    static async getPublicCount(): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('prompts')
                .select('*', { count: 'exact', head: true })
                .eq('is_public', true)
                .eq('is_deleted', false);

            if (error) {
                throw new Error(`Error getting public prompts count: ${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting public prompts count:", error);
            throw error;
        }
    }

    // Utility method to generate unique slug
    static generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50) + '-' + Date.now();
    }
}

export default Prompt;
