import { createClient } from "@/lib/utils/supabase/server";

// Core Membership interface matching Supabase schema
export interface MembershipData {
    id: string;
    user_id: string;
    organization_id: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joined_at: string;
    permissions: string[] | null; // list of permission strings
}

// Interface for creating new memberships
export interface MembershipInsert {
    id?: string;
    user_id: string;
    organization_id: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    permissions?: string[] | null;
    joined_at?: string;
}

// Interface for updating existing memberships
export interface MembershipUpdate {
    id?: string;
    role?: 'owner' | 'admin' | 'member' | 'viewer';
    permissions?: string[] | null;
}

// Extended interface with user and organization information
export interface MembershipWithDetails extends MembershipData {
    user_profile?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
    organization?: {
        name: string;
        about: string | null;
        cover_image: string | null;
    } | null;
}

class Membership {
    // Create a new membership
    static async create(membershipData: MembershipInsert): Promise<MembershipData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('memberships')
                .insert(membershipData)
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating membership: ${error.message}`);
            }

            return data as MembershipData;
        } catch (error) {
            console.error("Error creating membership:", error);
            throw error;
        }
    }

    // Get all memberships
    static async findAll(): Promise<MembershipData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('memberships')
                .select('*')
                .order('joined_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting memberships: ${error.message}`);
            }

            return data as MembershipData[];
        } catch (error) {
            console.error("Error getting all memberships:", error);
            throw error;
        }
    }

    // Get membership by ID
    static async findById(id: string): Promise<MembershipData | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('memberships')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting membership: ${error.message}`);
            }

            return data as MembershipData;
        } catch (error) {
            console.error("Error getting membership by ID:", error);
            throw error;
        }
    }

    // Get memberships by user ID
    static async findByUserId(userId: string): Promise<MembershipData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('memberships')
                .select('*')
                .eq('user_id', userId)
                .order('joined_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting memberships by user: ${error.message}`);
            }

            return data as MembershipData[];
        } catch (error) {
            console.error("Error getting memberships by user ID:", error);
            throw error;
        }
    }

    // Get memberships by organization ID
    static async findByOrganizationId(organizationId: string): Promise<MembershipData[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('memberships')
                .select('*')
                .eq('organization_id', organizationId)
                .order('joined_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting memberships by organization: ${error.message}`);
            }

            return data as MembershipData[];
        } catch (error) {
            console.error("Error getting memberships by organization ID:", error);
            throw error;
        }
    }

    // Get memberships by organization ID with user profiles
    static async findByOrganizationIdWithProfiles(organizationId: string): Promise<MembershipWithDetails[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('memberships')
                .select(`
                    *,
                    user_profile:user_id (
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('organization_id', organizationId)
                .order('joined_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting memberships with profiles: ${error.message}`);
            }

            return data as MembershipWithDetails[];
        } catch (error) {
            console.error("Error getting memberships by organization ID with profiles:", error);
            throw error;
        }
    }

    // Get memberships by user ID with organization details
    static async findByUserIdWithOrganizations(userId: string): Promise<MembershipWithDetails[]> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('memberships')
                .select(`
                    *,
                    organization:organization_id (
                        name,
                        about,
                        cover_image
                    )
                `)
                .eq('user_id', userId)
                .order('joined_at', { ascending: false });

            if (error) {
                throw new Error(`Error getting memberships with organizations: ${error.message}`);
            }

            return data as MembershipWithDetails[];
        } catch (error) {
            console.error("Error getting memberships by user ID with organizations:", error);
            throw error;
        }
    }

    // Get memberships by role
    static async findByRole(role: 'owner' | 'admin' | 'member' | 'viewer', organizationId?: string): Promise<MembershipData[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('memberships')
                .select('*')
                .eq('role', role)
                .order('joined_at', { ascending: false });

            if (organizationId) {
                query = query.eq('organization_id', organizationId);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Error getting memberships by role: ${error.message}`);
            }

            return data as MembershipData[];
        } catch (error) {
            console.error("Error getting memberships by role:", error);
            throw error;
        }
    }

    // Check if user is member of organization
    static async isMember(userId: string, organizationId: string): Promise<boolean> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('memberships')
                .select('id')
                .eq('user_id', userId)
                .eq('organization_id', organizationId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return false;
                }
                throw new Error(`Error checking membership: ${error.message}`);
            }

            return !!data;
        } catch (error) {
            console.error("Error checking membership:", error);
            throw error;
        }
    }

    // Get user's role in organization
    static async getUserRole(userId: string, organizationId: string): Promise<string | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from('memberships')
                .select('role')
                .eq('user_id', userId)
                .eq('organization_id', organizationId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw new Error(`Error getting user role: ${error.message}`);
            }

            return data.role;
        } catch (error) {
            console.error("Error getting user role:", error);
            throw error;
        }
    }

    // Update membership
    static async update(id: string, updates: MembershipUpdate): Promise<MembershipData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('memberships')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating membership: ${error.message}`);
            }

            return data as MembershipData;
        } catch (error) {
            console.error("Error updating membership:", error);
            throw error;
        }
    }

    // Update user role in organization
    static async updateRole(userId: string, organizationId: string, role: 'owner' | 'admin' | 'member' | 'viewer'): Promise<MembershipData> {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from('memberships')
                .update({ role })
                .eq('user_id', userId)
                .eq('organization_id', organizationId)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating role: ${error.message}`);
            }

            return data as MembershipData;
        } catch (error) {
            console.error("Error updating role:", error);
            throw error;
        }
    }

    // Add permission to membership
    static async addPermission(id: string, permission: string): Promise<MembershipData> {
        try {
            const supabase = await createClient();
            
            const membership = await this.findById(id);
            if (!membership) {
                throw new Error('Membership not found');
            }

            const currentPermissions = membership.permissions || [];
            if (!currentPermissions.includes(permission)) {
                currentPermissions.push(permission);
            }

            const { data, error } = await supabase
                .from('memberships')
                .update({ permissions: currentPermissions })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error adding permission: ${error.message}`);
            }

            return data as MembershipData;
        } catch (error) {
            console.error("Error adding permission:", error);
            throw error;
        }
    }

    // Remove permission from membership
    static async removePermission(id: string, permission: string): Promise<MembershipData> {
        try {
            const supabase = await createClient();
            
            const membership = await this.findById(id);
            if (!membership) {
                throw new Error('Membership not found');
            }

            const currentPermissions = (membership.permissions || []).filter(
                p => p !== permission
            );

            const { data, error } = await supabase
                .from('memberships')
                .update({ permissions: currentPermissions })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error removing permission: ${error.message}`);
            }

            return data as MembershipData;
        } catch (error) {
            console.error("Error removing permission:", error);
            throw error;
        }
    }

    // Delete membership
    static async delete(id: string): Promise<void> {
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .from('memberships')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Error deleting membership: ${error.message}`);
            }
        } catch (error) {
            console.error("Error deleting membership:", error);
            throw error;
        }
    }

    // Remove user from organization
    static async removeUserFromOrganization(userId: string, organizationId: string): Promise<void> {
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .from('memberships')
                .delete()
                .eq('user_id', userId)
                .eq('organization_id', organizationId);

            if (error) {
                throw new Error(`Error removing user from organization: ${error.message}`);
            }
        } catch (error) {
            console.error("Error removing user from organization:", error);
            throw error;
        }
    }

    // Get membership count by organization
    static async getCountByOrganization(organizationId: string): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('memberships')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', organizationId);

            if (error) {
                throw new Error(`Error getting membership count: ${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting membership count:", error);
            throw error;
        }
    }

    // Get membership count by user
    static async getCountByUser(userId: string): Promise<number> {
        try {
            const supabase = await createClient();
            const { count, error } = await supabase
                .from('memberships')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error getting user membership count: ${error.message}`);
            }

            return count || 0;
        } catch (error) {
            console.error("Error getting user membership count:", error);
            throw error;
        }
    }
}

export default Membership;
