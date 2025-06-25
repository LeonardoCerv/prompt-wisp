import { createClient } from "@/lib/utils/supabase/server";

// Core Prompt interface matching Supabase schema
export interface PromptData {
    id: string;
    title: string;
    content: string;
    description: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
    user_id: string;
    images: string[] | null;
    collaborators: string[] | null; // list of user IDs
    visibility: 'public' | 'private' | 'unlisted';
    deleted: boolean;
    collections: string[] | null; // list of collection IDs
}

// Interface for creating new prompts
export interface PromptInsert {
    id?: string;
    title: string;
    content: string;
    description?: string | null;
    tags?: string[];
    user_id: string;
    images?: string[] | null;
    collaborators?: string[] | null;
    visibility?: 'public' | 'private' | 'unlisted';
    deleted?: boolean;
    collections?: string[] | null;
    created_at?: string;
    updated_at?: string;
}

// Interface for updating existing prompts
export interface PromptUpdate {
    id?: string;
    title?: string;
    content?: string;
    description?: string | null;
    tags?: string[];
    user_id?: string;
    images?: string[] | null;
    collaborators?: string[] | null;
    visibility?: 'public' | 'private' | 'unlisted';
    deleted?: boolean;
    collections?: string[] | null;
    updated_at?: string;
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
                query = query.eq('deleted', false);
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

    static async updateCollection(promptId: string, collection: string): Promise<PromptData | null> {
        try {
            const supabase = await createClient();

            // Get the current prompt to update collections array
            const prompt = await this.findById(promptId);
            if (!prompt) {
            throw new Error('Prompt not found');
            }

            const currentCollections = prompt.collections || [];
            // Only add if not already present
            if (!currentCollections.includes(collection)) {
            currentCollections.push(collection);
            }

            const { data, error } = await supabase
            .from('prompts')
            .update({ 
                collections: currentCollections,
                updated_at: new Date().toISOString()
            })
            .eq('id', promptId)
            .eq('deleted', false)
            .select()
            .single();

            if (error) {
            throw new Error(`Error updating prompt collection: ${error.message}`);
            }
            return data as PromptData;
        } catch (error) {
            console.error("Error updating prompt collection:", error);
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
                .eq('deleted', false)
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

    // Get all public prompts
    static async findPublic(): Promise<PromptData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .eq('visibility', 'public')
                .eq('deleted', false)
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
                .eq('visibility', 'public')
                .eq('deleted', false)
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
    static async findByUserId(userId: string, includePrivate: boolean = false, includeDeleted: boolean = false): Promise<PromptData[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('prompts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (!includeDeleted) {
                query = query.eq('deleted', false);
            }

            if (!includePrivate) {
                query = query.eq('visibility', 'public');
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
                query = query.eq('deleted', false);
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
                .eq('visibility', 'public')
                .eq('deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting prompts by tag: \${error.message}`);
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
                .eq('visibility', 'public')
                .eq('deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting prompts by tags: \${error.message}`);
            }

            return data as PromptData[];
        } catch (error) {
            console.error("Error getting prompts by tags:", error);
            throw error;
        }
    }

    // Get prompts by collection ID
    static async findByCollection(collectionId: string): Promise<PromptData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .contains('collections', [collectionId])
                .eq('deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting prompts by collection: \${error.message}`);
            }

            return data as PromptData[];
        } catch (error) {
            console.error("Error getting prompts by collection:", error);
            throw error;
        }
    }

    // Get prompts by collaborator
    static async findByCollaborator(userId: string): Promise<PromptData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .contains('collaborators', [userId])
                .eq('deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting prompts by collaborator: \${error.message}`);
            }

            return data as PromptData[];
        } catch (error) {
            console.error("Error getting prompts by collaborator:", error);
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
                .or(`title.ilike.%\${query}%,description.ilike.%\${query}%,content.ilike.%\${query}%`)
                .eq('visibility', 'public')
                .eq('deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error searching prompts: \${error.message}`);
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
                .eq('deleted', false)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating prompt: \${error.message}`);
            }

            return data as PromptData;
        } catch (error) {
            console.error("Error updating prompt:", error);
            throw error;
        }
    }

    // Add collaborator to prompt
    static async addCollaborator(id: string, userId: string): Promise<PromptData> {
        try {
            const supabase = await createClient();
            
            // First get the current prompt to update collaborators array
            const prompt = await this.findById(id);
            if (!prompt) {
                throw new Error('Prompt not found');
            }

            const currentCollaborators = prompt.collaborators || [];
            if (!currentCollaborators.includes(userId)) {
                currentCollaborators.push(userId);
            }

            const { data, error } = await supabase
                .from('prompts')
                .update({ 
                    collaborators: currentCollaborators,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('deleted', false)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding collaborator: \${error.message}`);
            }

            return data as PromptData;
        } catch (error) {
            console.error("Error adding collaborator:", error);
            throw error;
        }
    }

    // Remove collaborator from prompt
    static async removeCollaborator(id: string, userId: string): Promise<PromptData> {
        try {
            const supabase = await createClient();
            
            // First get the current prompt to update collaborators array
            const prompt = await this.findById(id);
            if (!prompt) {
                throw new Error('Prompt not found');
            }

            const currentCollaborators = (prompt.collaborators || []).filter(
                collaboratorId => collaboratorId !== userId
            );

            const { data, error } = await supabase
                .from('prompts')
                .update({ 
                    collaborators: currentCollaborators,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('deleted', false)
                .select()
                .single();

            if (error) {
                throw new Error(`Error removing collaborator: \${error.message}`);
            }

            return data as PromptData;
        } catch (error) {
            console.error("Error removing collaborator:", error);
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
                    deleted: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error soft deleting prompt: \${error.message}`);
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
                    deleted: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error restoring prompt: \${error.message}`);
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
                throw new Error(`Error hard deleting prompt: \${error.message}`);
            }
        } catch (error) {
            console.error("Error hard deleting prompt:", error);
            throw error;
        }
    }

    // Clean up prompts that have been soft deleted for more than 30 days
    static async cleanupOldDeletedPrompts(): Promise<number> {
        try {
            const supabase = await createClient();
            
            // Calculate date 30 days ago
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            // Find prompts that are deleted and older than 30 days
            const { data: promptsToDelete, error: selectError } = await supabase
                .from('prompts')
                .select('id')
                .eq('deleted', true)
                .lt('updated_at', thirtyDaysAgo.toISOString());

            if (selectError) {
                throw new Error(`Error finding old deleted prompts: ${selectError.message}`);
            }

            if (!promptsToDelete || promptsToDelete.length === 0) {
                return 0; // No prompts to delete
            }

            // Hard delete the prompts
            const { error: deleteError } = await supabase
                .from('prompts')
                .delete()
                .eq('deleted', true)
                .lt('updated_at', thirtyDaysAgo.toISOString());

            if (deleteError) {
                throw new Error(`Error permanently deleting old prompts: ${deleteError.message}`);
            }

            console.log(`Permanently deleted ${promptsToDelete.length} old prompts`);
            return promptsToDelete.length;
        } catch (error) {
            console.error("Error cleaning up old deleted prompts:", error);
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
                .eq('visibility', 'public')
                .eq('deleted', false);

            if (error) {
                throw new Error(`Error getting tags: \${error.message}`);
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
                .eq('deleted', false);

            if (error) {
                throw new Error(`Error getting prompts count: \${error.message}`);
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
                .eq('visibility', 'public')
                .eq('deleted', false);

            if (error) {
                throw new Error(`Error getting public prompts count: \${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting public prompts count:", error);
            throw error;
        }
    }
}

export default Prompt;
