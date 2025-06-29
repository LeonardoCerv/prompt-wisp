import { createClient } from "@/lib/utils/supabase/server";

type VisibilityType = 'public' | 'private' | 'unlisted';

// Core Prompt interface matching Supabase schema
export interface PromptData {
    id: string;
    title: string;
    content: string;
    description: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
    images: string[];
    visibility: VisibilityType;
    deleted: boolean;
}

// Interface for creating new prompts
export interface PromptInsert {
    id?: string;
    title: string;
    content: string;
    description?: string;
    tags?: string[];
    images?: string[];
    visibility?: VisibilityType;
    created_at?: string;
    updated_at?: string;
}

// Interface for updating existing prompts
export interface PromptUpdate {
    id?: string;
    title?: string;
    content?: string;
    description?: string;
    tags?: string[];
    images?: string[];
    visibility?: VisibilityType;
    deleted?: boolean;
    updated_at?: string;
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

    /* Search prompts by title, description, or content
    static async search(query: string): Promise<PromptData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
                .eq('visibility', 'public')
                .eq('deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error searching prompts: ${error.message}`);
            }

            return data as PromptData[];
        } catch (error) {
            console.error("Error searching prompts:", error);
            throw error;
        }
    }*/

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
}

export default Prompt;
