import { createClient } from "@/lib/utils/supabase/server";

// Core Organization interface matching Supabase schema
export interface OrganizationData {
    id: string;
    name: string;
    about: string | null;
    cover_image: string | null;
    user_id: string; // owner
    organization_memberships: string[] | null; // list of membership IDs
    prompts: string[] | null; // list of prompt IDs
    collections: string[] | null; // list of collection IDs
    marketplace_listings: string[] | null; // list of marketplace IDs
    created_at: string;
    payment_info_id: string | null;
}

// Interface for creating new organizations
export interface OrganizationInsert {
    id?: string;
    name: string;
    about?: string | null;
    cover_image?: string | null;
    user_id: string;
    organization_memberships?: string[] | null;
    prompts?: string[] | null;
    collections?: string[] | null;
    marketplace_listings?: string[] | null;
    payment_info_id?: string | null;
    created_at?: string;
}

// Interface for updating existing organizations
export interface OrganizationUpdate {
    id?: string;
    name?: string;
    about?: string | null;
    cover_image?: string | null;
    user_id?: string;
    organization_memberships?: string[] | null;
    prompts?: string[] | null;
    collections?: string[] | null;
    marketplace_listings?: string[] | null;
    payment_info_id?: string | null;
}

// Extended interface with owner profile information
export interface OrganizationWithProfile extends OrganizationData {
    profiles?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

class Organization {
    // Create a new organization
    static async create(organizationData: OrganizationInsert): Promise<OrganizationData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('organizations')
                .insert(organizationData)
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating organization: ${error.message}`);
            }

            return data as OrganizationData;
        } catch (error) {
            console.error("Error creating organization:", error);
            throw error;
        }
    }

    // Get all organizations
    static async findAll(): Promise<OrganizationData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting organizations: ${error.message}`);
            }

            return data as OrganizationData[];
        } catch (error) {
            console.error("Error getting all organizations:", error);
            throw error;
        }
    }

    // Get organization by ID
    static async findById(id: string): Promise<OrganizationData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting organization: ${error.message}`);
            }

            return data as OrganizationData;
        } catch (error) {
            console.error("Error getting organization by ID:", error);
            throw error;
        }
    }

    // Get organization by name
    static async findByName(name: string): Promise<OrganizationData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('name', name)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting organization by name: ${error.message}`);
            }

            return data as OrganizationData;
        } catch (error) {
            console.error("Error getting organization by name:", error);
            throw error;
        }
    }

    // Get organizations by owner ID
    static async findByOwnerId(userId: string): Promise<OrganizationData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting organizations by owner: ${error.message}`);
            }

            return data as OrganizationData[];
        } catch (error) {
            console.error("Error getting organizations by owner ID:", error);
            throw error;
        }
    }

    // Search organizations by name or about
    static async search(query: string): Promise<OrganizationData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .or(`name.ilike.%${query}%,about.ilike.%${query}%`)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error searching organizations: ${error.message}`);
            }

            return data as OrganizationData[];
        } catch (error) {
            console.error("Error searching organizations:", error);
            throw error;
        }
    }

    // Update organization
    static async update(id: string, updates: OrganizationUpdate): Promise<OrganizationData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('organizations')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating organization: ${error.message}`);
            }

            return data as OrganizationData;
        } catch (error) {
            console.error("Error updating organization:", error);
            throw error;
        }
    }

    // Add membership to organization
    static async addMembership(id: string, membershipId: string): Promise<OrganizationData> {
        try {
            const supabase = await createClient();
            
            const organization = await this.findById(id);
            if (!organization) {
                throw new Error('Organization not found');
            }

            const currentMemberships = organization.organization_memberships || [];
            if (!currentMemberships.includes(membershipId)) {
                currentMemberships.push(membershipId);
            }

            const { data, error } = await supabase
                .from('organizations')
                .update({ 
                    organization_memberships: currentMemberships
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding membership: ${error.message}`);
            }

            return data as OrganizationData;
        } catch (error) {
            console.error("Error adding membership:", error);
            throw error;
        }
    }

    // Remove membership from organization
    static async removeMembership(id: string, membershipId: string): Promise<OrganizationData> {
        try {
            const supabase = await createClient();
            
            const organization = await this.findById(id);
            if (!organization) {
                throw new Error('Organization not found');
            }

            const currentMemberships = (organization.organization_memberships || []).filter(
                mId => mId !== membershipId
            );

            const { data, error } = await supabase
                .from('organizations')
                .update({ 
                    organization_memberships: currentMemberships
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error removing membership: ${error.message}`);
            }

            return data as OrganizationData;
        } catch (error) {
            console.error("Error removing membership:", error);
            throw error;
        }
    }

    // Add prompt to organization
    static async addPrompt(id: string, promptId: string): Promise<OrganizationData> {
        try {
            const supabase = await createClient();
            
            const organization = await this.findById(id);
            if (!organization) {
                throw new Error('Organization not found');
            }

            const currentPrompts = organization.prompts || [];
            if (!currentPrompts.includes(promptId)) {
                currentPrompts.push(promptId);
            }

            const { data, error } = await supabase
                .from('organizations')
                .update({ 
                    prompts: currentPrompts
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding prompt: ${error.message}`);
            }

            return data as OrganizationData;
        } catch (error) {
            console.error("Error adding prompt:", error);
            throw error;
        }
    }

    // Add collection to organization
    static async addCollection(id: string, collectionId: string): Promise<OrganizationData> {
        try {
            const supabase = await createClient();
            
            const organization = await this.findById(id);
            if (!organization) {
                throw new Error('Organization not found');
            }

            const currentCollections = organization.collections || [];
            if (!currentCollections.includes(collectionId)) {
                currentCollections.push(collectionId);
            }

            const { data, error } = await supabase
                .from('organizations')
                .update({ 
                    collections: currentCollections
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding collection: ${error.message}`);
            }

            return data as OrganizationData;
        } catch (error) {
            console.error("Error adding collection:", error);
            throw error;
        }
    }

    // Add marketplace listing to organization
    static async addMarketplaceListing(id: string, marketplaceId: string): Promise<OrganizationData> {
        try {
            const supabase = await createClient();
            
            const organization = await this.findById(id);
            if (!organization) {
                throw new Error('Organization not found');
            }

            const currentListings = organization.marketplace_listings || [];
            if (!currentListings.includes(marketplaceId)) {
                currentListings.push(marketplaceId);
            }

            const { data, error } = await supabase
                .from('organizations')
                .update({ 
                    marketplace_listings: currentListings
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding marketplace listing: ${error.message}`);
            }

            return data as OrganizationData;
        } catch (error) {
            console.error("Error adding marketplace listing:", error);
            throw error;
        }
    }

    // Delete organization
    static async delete(id: string): Promise<void> {
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .from('organizations')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Error deleting organization: ${error.message}`);
            }
        } catch (error) {
            console.error("Error deleting organization:", error);
            throw error;
        }
    }

    // Get organizations count
    static async getCount(): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('organizations')
                .select('*', { count: 'exact', head: true });

            if (error) {
                throw new Error(`Error getting organizations count: ${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting organizations count:", error);
            throw error;
        }
    }

    // Get organizations count by owner
    static async getCountByOwner(userId: string): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('organizations')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error getting organization count by owner: ${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting organization count by owner:", error);
            throw error;
        }
    }
}

export default Organization;
