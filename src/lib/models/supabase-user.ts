import { supabase, supabaseAdmin } from '@/lib/supabase';

export interface WispUser {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface WispProfile {
  id: string;
  user_id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

class SupabaseUser {
  /**
   * Create a new user with Supabase Auth and create a profile
   */
  static async create(username: string, email: string, password: string): Promise<WispUser> {
    // First check if username is already taken
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingProfile) {
      throw new Error('Username is already taken');
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });

    if (authError) {
      if (authError.message.includes('User already registered')) {
        throw new Error('A user with this email already exists');
      }
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    // Create profile entry
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: authData.user.id,
          username: username,
        }
      ])
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, we should clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error('Failed to create user profile: ' + profileError.message);
    }

    return {
      id: authData.user.id,
      username: profileData.username,
      email: authData.user.email!,
      created_at: authData.user.created_at,
      updated_at: authData.user.updated_at || authData.user.created_at
    };
  }

  /**
   * Sign in user with email and password
   */
  static async signInWithEmail(email: string, password: string): Promise<WispUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error('Invalid email or password');
    }

    if (!data.user) {
      throw new Error('Authentication failed');
    }

    // Get user profile
    const profile = await this.getProfileByUserId(data.user.id);
    
    return {
      id: data.user.id,
      username: profile.username,
      email: data.user.email!,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at || data.user.created_at
    };
  }

  /**
   * Sign in user with username and password
   */
  static async signInWithUsername(username: string, password: string): Promise<WispUser> {
    // First get the user's email from their username
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('username', username)
      .single();

    if (profileError || !profileData) {
      throw new Error('Invalid username or password');
    }

    // Get the user's email from auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profileData.user_id);

    if (userError || !userData.user) {
      throw new Error('Invalid username or password');
    }

    // Now sign in with email and password
    return await this.signInWithEmail(userData.user.email!, password);
  }

  /**
   * Get user profile by user ID
   */
  static async getProfileByUserId(userId: string): Promise<WispProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new Error('User profile not found');
    }

    return data;
  }

  /**
   * Get current user session
   */
  static async getCurrentUser(): Promise<WispUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    try {
      const profile = await this.getProfileByUserId(user.id);
      
      return {
        id: user.id,
        username: profile.username,
        email: user.email!,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Update username
   */
  static async updateUsername(userId: string, newUsername: string): Promise<void> {
    // Check if username is already taken
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', newUsername)
      .neq('user_id', userId)
      .single();

    if (existingProfile) {
      throw new Error('Username is already taken');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to update username');
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId: string): Promise<void> {
    // First delete the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) {
      throw new Error('Failed to delete user profile');
    }

    // Then delete the auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      throw new Error('Failed to delete user account');
    }
  }

  /**
   * Check if user exists by email
   */
  static async existsByEmail(email: string): Promise<boolean> {
    const { data } = await supabaseAdmin.auth.admin.listUsers();
    return data.users.some(user => user.email === email);
  }

  /**
   * Check if username exists
   */
  static async existsByUsername(username: string): Promise<boolean> {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    return !!data;
  }
}

export default SupabaseUser;
