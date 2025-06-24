import { createClient } from "@/lib/utils/supabase/server";

// Core Comment interface matching Supabase schema
export interface CommentData {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    marketplace_id: string;
    rating: number | null; // 1-5 star rating
}

// Interface for creating new comments
export interface CommentInsert {
    id?: string;
    user_id: string;
    content: string;
    marketplace_id: string;
    rating?: number | null;
    created_at?: string;
}

// Interface for updating existing comments
export interface CommentUpdate {
    id?: string;
    content?: string;
    rating?: number | null;
}

// Extended interface with user profile information
export interface CommentWithProfile extends CommentData {
    profiles?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

class Comment {
    // Create a new comment
    static async create(commentData: CommentInsert): Promise<CommentData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('comments')
                .insert(commentData)
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating comment: ${error.message}`);
            }

            return data as CommentData;
        } catch (error) {
            console.error("Error creating comment:", error);
            throw error;
        }
    }

    // Get all comments
    static async findAll(): Promise<CommentData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting comments: ${error.message}`);
            }

            return data as CommentData[];
        } catch (error) {
            console.error("Error getting all comments:", error);
            throw error;
        }
    }

    // Get comment by ID
    static async findById(id: string): Promise<CommentData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting comment: ${error.message}`);
            }

            return data as CommentData;
        } catch (error) {
            console.error("Error getting comment by ID:", error);
            throw error;
        }
    }

    // Get comments by marketplace ID
    static async findByMarketplaceId(marketplaceId: string): Promise<CommentData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('marketplace_id', marketplaceId)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting comments by marketplace ID: ${error.message}`);
            }

            return data as CommentData[];
        } catch (error) {
            console.error("Error getting comments by marketplace ID:", error);
            throw error;
        }
    }

    // Get comments by marketplace ID with user profiles
    static async findByMarketplaceIdWithProfiles(marketplaceId: string): Promise<CommentWithProfile[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('comments')
                .select(`
                    *,
                    profiles:user_id (
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('marketplace_id', marketplaceId)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting comments with profiles: ${error.message}`);
            }

            return data as CommentWithProfile[];
        } catch (error) {
            console.error("Error getting comments by marketplace ID with profiles:", error);
            throw error;
        }
    }

    // Get comments by user ID
    static async findByUserId(userId: string): Promise<CommentData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting comments by user ID: ${error.message}`);
            }

            return data as CommentData[];
        } catch (error) {
            console.error("Error getting comments by user ID:", error);
            throw error;
        }
    }

    // Get comments by rating
    static async findByRating(rating: number, marketplaceId?: string): Promise<CommentData[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('comments')
                .select('*')
                .eq('rating', rating)
                .order('created_at', { ascending: false });

            if (marketplaceId) {
                query = query.eq('marketplace_id', marketplaceId);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error getting comments by rating: ${error.message}`);
            }

            return data as CommentData[];
        } catch (error) {
            console.error("Error getting comments by rating:", error);
            throw error;
        }
    }

    // Update comment
    static async update(id: string, updates: CommentUpdate): Promise<CommentData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('comments')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating comment: ${error.message}`);
            }

            return data as CommentData;
        } catch (error) {
            console.error("Error updating comment:", error);
            throw error;
        }
    }

    // Delete comment
    static async delete(id: string): Promise<void> {
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Error deleting comment: ${error.message}`);
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw error;
        }
    }

    // Get average rating for a marketplace item
    static async getAverageRating(marketplaceId: string): Promise<number | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('comments')
                .select('rating')
                .eq('marketplace_id', marketplaceId)
                .not('rating', 'is', null);

            if (error) {
                throw new Error(`Error getting average rating: ${error.message}`);
            }

            if (data.length === 0) {
                return null;
            }

            const total = data.reduce((sum, comment) => sum + (comment.rating || 0), 0);
            return total / data.length;
        } catch (error) {
            console.error("Error getting average rating:", error);
            throw error;
        }
    }

    // Get rating distribution for a marketplace item
    static async getRatingDistribution(marketplaceId: string): Promise<Record<number, number>> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('comments')
                .select('rating')
                .eq('marketplace_id', marketplaceId)
                .not('rating', 'is', null);

            if (error) {
                throw new Error(`Error getting rating distribution: ${error.message}`);
            }

            const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            
            data.forEach(comment => {
                if (comment.rating && comment.rating >= 1 && comment.rating <= 5) {
                    distribution[comment.rating]++;
                }
            });

            return distribution;
        } catch (error) {
            console.error("Error getting rating distribution:", error);
            throw error;
        }
    }

    // Get comments count by marketplace ID
    static async getCountByMarketplaceId(marketplaceId: string): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('marketplace_id', marketplaceId);

            if (error) {
                throw new Error(`Error getting comments count: ${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting comments count:", error);
            throw error;
        }
    }

    // Get comments count by user ID
    static async getCountByUserId(userId: string): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error getting user comments count: ${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting user comments count:", error);
            throw error;
        }
    }
}

export default Comment;
