import { createClient } from "@/lib/utils/supabase/server";

// Core Collection interface matching Supabase schema
export interface CollectionData {
    id: string;
    title: string;
    description: string | null;
    images: string[] | null;
    tags: string[];
    prompts: string[] | null; // list of prompt IDs
    user_id: string;
    created_at: string;
    updated_at: string;
    collaborators: string[] | null; // list of user IDs
    visibility: 'public' | 'private' | 'unlisted';
    deleted: boolean;
}

// Interface for creating new collections
export interface CollectionInsert {
    id?: string;
    title: string;
    description?: string | null;
    images?: string[] | null;
    tags?: string[];
    prompts?: string[] | null;
    user_id: string;
    collaborators?: string[] | null;
    visibility?: 'public' | 'private' | 'unlisted';
    deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

// Interface for updating existing collections
export interface CollectionUpdate {
    id?: string;
    title?: string;
    description?: string | null;
    images?: string[] | null;
    tags?: string[];
    prompts?: string[] | null;
    user_id?: string;
    collaborators?: string[] | null;
    visibility?: 'public' | 'private' | 'unlisted';
    deleted?: boolean;
    updated_at?: string;
}

// Extended interface with user profile information
export interface CollectionWithProfile extends CollectionData {
    profiles?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

class Collection {
    // Create a new collection
    static async create(collectionData: CollectionInsert): Promise<CollectionData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('collections')
                .insert(collectionData)
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating collection: ${error.message}`);
            }

            return data as CollectionData;
        } catch (error) {
            console.error("Error creating collection:", error);
            throw error;
        }
    }

    // Get all collections (including deleted ones if requested)
    static async findAll(includeDeleted: boolean = false): Promise<CollectionData[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('collections')
                .select('*')
                .order('created_at', { ascending: false });

            if (!includeDeleted) {
                query = query.eq('deleted', false);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error getting collections: ${error.message}`);
            }

            return data as CollectionData[];
        } catch (error) {
            console.error("Error getting all collections:", error);
            throw error;
        }
    }

    // Get collection by ID
    static async findById(id: string): Promise<CollectionData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .eq('id', id)
                .eq('deleted', false)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting collection: ${error.message}`);
            }

            return data as CollectionData;
        } catch (error) {
            console.error("Error getting collection by ID:", error);
            throw error;
        }
    }

    // Get all public collections
    static async findPublic(): Promise<CollectionData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .eq('visibility', 'public')
                .eq('deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting public collections: ${error.message}`);
            }

            return data as CollectionData[];
        } catch (error) {
            console.error("Error getting public collections:", error);
            throw error;
        }
    }

    // Get collections by user ID
    static async findByUserId(userId: string, includePrivate: boolean = false): Promise<CollectionData[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('collections')
                .select('*')
                .eq('user_id', userId)
                .eq('deleted', false)
                .order('created_at', { ascending: false });

            if (!includePrivate) {
                query = query.eq('visibility', 'public');
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error getting user collections: ${error.message}`);
            }

            return data as CollectionData[];
        } catch (error) {
            console.error("Error getting collections by user ID:", error);
            throw error;
        }
    }

    // Get collections by collaborator
    static async findByCollaborator(userId: string): Promise<CollectionData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .contains('collaborators', [userId])
                .eq('deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting collections by collaborator: ${error.message}`);
            }

            return data as CollectionData[];
        } catch (error) {
            console.error("Error getting collections by collaborator:", error);
            throw error;
        }
    }

    // Search collections by title or description
    static async search(query: string): Promise<CollectionData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
                .eq('visibility', 'public')
                .eq('deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error searching collections: ${error.message}`);
            }

            return data as CollectionData[];
        } catch (error) {
            console.error("Error searching collections:", error);
            throw error;
        }
    }

    // Update collection
    static async update(id: string, updates: CollectionUpdate): Promise<CollectionData> {
        try {
            const supabase = await createClient();
            
            // Add updated_at timestamp
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('collections')
                .update(updateData)
                .eq('id', id)
                .eq('deleted', false)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating collection: ${error.message}`);
            }

            return data as CollectionData;
        } catch (error) {
            console.error("Error updating collection:", error);
            throw error;
        }
    }

    // Add prompt to collection
    static async addPrompt(id: string, promptId: string): Promise<CollectionData> {
        try {
            const supabase = await createClient();
            
            // First get the current collection to update prompts array
            const collection = await this.findById(id);
            if (!collection) {
                throw new Error('Collection not found');
            }

            const currentPrompts = collection.prompts || [];
            if (!currentPrompts.includes(promptId)) {
                currentPrompts.push(promptId);
            }

            const { data, error } = await supabase
                .from('collections')
                .update({ 
                    prompts: currentPrompts,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('deleted', false)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding prompt to collection: ${error.message}`);
            }

            return data as CollectionData;
        } catch (error) {
            console.error("Error adding prompt to collection:", error);
            throw error;
        }
    }

    // Remove prompt from collection
    static async removePrompt(id: string, promptId: string): Promise<CollectionData> {
        try {
            const supabase = await createClient();
            
            // First get the current collection to update prompts array
            const collection = await this.findById(id);
            if (!collection) {
                throw new Error('Collection not found');
            }

            const currentPrompts = (collection.prompts || []).filter(
                pId => pId !== promptId
            );

            const { data, error } = await supabase
                .from('collections')
                .update({ 
                    prompts: currentPrompts,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('deleted', false)
                .select()
                .single();

            if (error) {
                throw new Error(`Error removing prompt from collection: ${error.message}`);
            }

            return data as CollectionData;
        } catch (error) {
            console.error("Error removing prompt from collection:", error);
            throw error;
        }
    }

    // Add collaborator to collection
    static async addCollaborator(id: string, userId: string): Promise<CollectionData> {
        try {
            const supabase = await createClient();
            
            // First get the current collection to update collaborators array
            const collection = await this.findById(id);
            if (!collection) {
                throw new Error('Collection not found');
            }

            const currentCollaborators = collection.collaborators || [];
            if (!currentCollaborators.includes(userId)) {
                currentCollaborators.push(userId);
            }

            const { data, error } = await supabase
                .from('collections')
                .update({ 
                    collaborators: currentCollaborators,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('deleted', false)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding collaborator: ${error.message}`);
            }

            return data as CollectionData;
        } catch (error) {
            console.error("Error adding collaborator:", error);
            throw error;
        }
    }

    // Remove collaborator from collection
    static async removeCollaborator(id: string, userId: string): Promise<CollectionData> {
        try {
            const supabase = await createClient();
            
            // First get the current collection to update collaborators array
            const collection = await this.findById(id);
            if (!collection) {
                throw new Error('Collection not found');
            }

            const currentCollaborators = (collection.collaborators || []).filter(
                collaboratorId => collaboratorId !== userId
            );

            const { data, error } = await supabase
                .from('collections')
                .update({ 
                    collaborators: currentCollaborators,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('deleted', false)
                .select()
                .single();

            if (error) {
                throw new Error(`Error removing collaborator: ${error.message}`);
            }

            return data as CollectionData;
        } catch (error) {
            console.error("Error removing collaborator:", error);
            throw error;
        }
    }

    // Soft delete (mark as deleted)
    static async softDelete(id: string): Promise<CollectionData> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('collections')
                .update({ 
                    deleted: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error soft deleting collection: ${error.message}`);
            }

            return data as CollectionData;
        } catch (error) {
            console.error("Error soft deleting collection:", error);
            throw error;
        }
    }

    // Restore a soft deleted collection
    static async restore(id: string): Promise<CollectionData> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('collections')
                .update({ 
                    deleted: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error restoring collection: ${error.message}`);
            }

            return data as CollectionData;
        } catch (error) {
            console.error("Error restoring collection:", error);
            throw error;
        }
    }

    // Hard delete (permanently remove from database)
    static async hardDelete(id: string): Promise<void> {
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .from('collections')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Error hard deleting collection: ${error.message}`);
            }
        } catch (error) {
            console.error("Error hard deleting collection:", error);
            throw error;
        }
    }

    // Get collections count by user
    static async getCountByUser(userId: string): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('collections')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('deleted', false);

            if (error) {
                throw new Error(`Error getting collections count: ${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting collections count:", error);
            throw error;
        }
    }

    // Get public collections count
    static async getPublicCount(): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('collections')
                .select('*', { count: 'exact', head: true })
                .eq('visibility', 'public')
                .eq('deleted', false);

            if (error) {
                throw new Error(`Error getting public collections count: ${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting public collections count:", error);
            throw error;
        }
    }
}

export default Collection;
