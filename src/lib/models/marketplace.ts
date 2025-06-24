import { createClient } from "@/lib/utils/supabase/server";

// Core Marketplace interface matching Supabase schema
export interface MarketplaceData {
    id: string;
    content_id: string; // Reference to prompt or collection
    author_id: string; // user or organization ID
    about: string | null;
    comments: string[] | null; // list of comment IDs
    created_at: string;
    updated_at: string;
    price: number;
    buyers: string[] | null; // list of user IDs
    status: 'active' | 'inactive' | 'pending' | 'rejected';
}

// Interface for creating new marketplace items
export interface MarketplaceInsert {
    id?: string;
    content_id: string;
    author_id: string;
    about?: string | null;
    comments?: string[] | null;
    price: number;
    buyers?: string[] | null;
    status?: 'active' | 'inactive' | 'pending' | 'rejected';
    created_at?: string;
    updated_at?: string;
}

// Interface for updating existing marketplace items
export interface MarketplaceUpdate {
    id?: string;
    content_id?: string;
    author_id?: string;
    about?: string | null;
    comments?: string[] | null;
    price?: number;
    buyers?: string[] | null;
    status?: 'active' | 'inactive' | 'pending' | 'rejected';
    updated_at?: string;
}

// Extended interface with author profile information
export interface MarketplaceWithProfile extends MarketplaceData {
    profiles?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

class Marketplace {
    // Create a new marketplace item
    static async create(marketplaceData: MarketplaceInsert): Promise<MarketplaceData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('marketplace')
                .insert(marketplaceData)
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating marketplace item: ${error.message}`);
            }

            return data as MarketplaceData;
        } catch (error) {
            console.error("Error creating marketplace item:", error);
            throw error;
        }
    }

    // Get all marketplace items
    static async findAll(status?: string): Promise<MarketplaceData[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('marketplace')
                .select('*')
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error getting marketplace items: ${error.message}`);
            }

            return data as MarketplaceData[];
        } catch (error) {
            console.error("Error getting all marketplace items:", error);
            throw error;
        }
    }

    // Get active marketplace items
    static async findActive(): Promise<MarketplaceData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('marketplace')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting active marketplace items: ${error.message}`);
            }

            return data as MarketplaceData[];
        } catch (error) {
            console.error("Error getting active marketplace items:", error);
            throw error;
        }
    }

    // Get marketplace item by ID
    static async findById(id: string): Promise<MarketplaceData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('marketplace')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting marketplace item: ${error.message}`);
            }

            return data as MarketplaceData;
        } catch (error) {
            console.error("Error getting marketplace item by ID:", error);
            throw error;
        }
    }

    // Get marketplace items by content ID
    static async findByContentId(contentId: string): Promise<MarketplaceData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('marketplace')
                .select('*')
                .eq('content_id', contentId)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting marketplace items by content ID: ${error.message}`);
            }

            return data as MarketplaceData[];
        } catch (error) {
            console.error("Error getting marketplace items by content ID:", error);
            throw error;
        }
    }

    // Get marketplace items by author ID
    static async findByAuthorId(authorId: string, status?: string): Promise<MarketplaceData[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('marketplace')
                .select('*')
                .eq('author_id', authorId)
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error getting marketplace items by author: ${error.message}`);
            }

            return data as MarketplaceData[];
        } catch (error) {
            console.error("Error getting marketplace items by author ID:", error);
            throw error;
        }
    }

    // Get marketplace items by price range
    static async findByPriceRange(minPrice: number, maxPrice: number): Promise<MarketplaceData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('marketplace')
                .select('*')
                .gte('price', minPrice)
                .lte('price', maxPrice)
                .eq('status', 'active')
                .order('price', { ascending: true });

            if (error) {
                throw new Error(`Error getting marketplace items by price range: ${error.message}`);
            }

            return data as MarketplaceData[];
        } catch (error) {
            console.error("Error getting marketplace items by price range:", error);
            throw error;
        }
    }

    // Search marketplace items
    static async search(query: string): Promise<MarketplaceData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('marketplace')
                .select('*')
                .ilike('about', `%${query}%`)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error searching marketplace items: ${error.message}`);
            }

            return data as MarketplaceData[];
        } catch (error) {
            console.error("Error searching marketplace items:", error);
            throw error;
        }
    }

    // Update marketplace item
    static async update(id: string, updates: MarketplaceUpdate): Promise<MarketplaceData> {
        try {
            const supabase = await createClient();
            
            // Add updated_at timestamp
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('marketplace')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating marketplace item: ${error.message}`);
            }

            return data as MarketplaceData;
        } catch (error) {
            console.error("Error updating marketplace item:", error);
            throw error;
        }
    }

    // Add buyer to marketplace item
    static async addBuyer(id: string, buyerId: string): Promise<MarketplaceData> {
        try {
            const supabase = await createClient();
            
            const item = await this.findById(id);
            if (!item) {
                throw new Error('Marketplace item not found');
            }

            const currentBuyers = item.buyers || [];
            if (!currentBuyers.includes(buyerId)) {
                currentBuyers.push(buyerId);
            }

            const { data, error } = await supabase
                .from('marketplace')
                .update({ 
                    buyers: currentBuyers,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding buyer: ${error.message}`);
            }

            return data as MarketplaceData;
        } catch (error) {
            console.error("Error adding buyer:", error);
            throw error;
        }
    }

    // Add comment to marketplace item
    static async addComment(id: string, commentId: string): Promise<MarketplaceData> {
        try {
            const supabase = await createClient();
            
            const item = await this.findById(id);
            if (!item) {
                throw new Error('Marketplace item not found');
            }

            const currentComments = item.comments || [];
            currentComments.push(commentId);

            const { data, error } = await supabase
                .from('marketplace')
                .update({ 
                    comments: currentComments,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding comment: ${error.message}`);
            }

            return data as MarketplaceData;
        } catch (error) {
            console.error("Error adding comment:", error);
            throw error;
        }
    }

    // Remove comment from marketplace item
    static async removeComment(id: string, commentId: string): Promise<MarketplaceData> {
        try {
            const supabase = await createClient();
            
            const item = await this.findById(id);
            if (!item) {
                throw new Error('Marketplace item not found');
            }

            const currentComments = (item.comments || []).filter(
                cId => cId !== commentId
            );

            const { data, error } = await supabase
                .from('marketplace')
                .update({ 
                    comments: currentComments,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error removing comment: ${error.message}`);
            }

            return data as MarketplaceData;
        } catch (error) {
            console.error("Error removing comment:", error);
            throw error;
        }
    }

    // Change status
    static async updateStatus(id: string, status: 'active' | 'inactive' | 'pending' | 'rejected'): Promise<MarketplaceData> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('marketplace')
                .update({ 
                    status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating status: ${error.message}`);
            }

            return data as MarketplaceData;
        } catch (error) {
            console.error("Error updating status:", error);
            throw error;
        }
    }

    // Delete marketplace item
    static async delete(id: string): Promise<void> {
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .from('marketplace')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Error deleting marketplace item: ${error.message}`);
            }
        } catch (error) {
            console.error("Error deleting marketplace item:", error);
            throw error;
        }
    }

    // Get marketplace items count
    static async getCount(status?: string): Promise<number> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('marketplace')
                .select('*', { count: 'exact', head: true });

            if (status) {
                query = query.eq('status', status);
            }

            const { count, error } = await query;

            if (error) {
                throw new Error(`Error getting marketplace count: ${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting marketplace count:", error);
            throw error;
        }
    }

    // Get total revenue by author
    static async getRevenueByAuthor(authorId: string): Promise<number> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('marketplace')
                .select('price, buyers')
                .eq('author_id', authorId)
                .eq('status', 'active');

            if (error) {
                throw new Error(`Error getting revenue: ${error.message}`);
            }

            let totalRevenue = 0;
            data.forEach(item => {
                if (item.buyers && item.buyers.length > 0) {
                    totalRevenue += item.price * item.buyers.length;
                }
            });

            return totalRevenue;
        } catch (error) {
            console.error("Error getting revenue by author:", error);
            throw error;
        }
    }
}

export default Marketplace;
