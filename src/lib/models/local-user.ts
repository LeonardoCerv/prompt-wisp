import bcrypt from 'bcryptjs';

export interface WispUser {
  id: number;
  username: string;
  email: string;
}

// Internal interface for storage with password hash
interface WispUserWithPassword extends WispUser {
  password_hash: string;
}

// Mock database for demonstration
// In a real application, this would be a proper database
const users = new Map<number, WispUserWithPassword>();
const usersByEmail = new Map<string, WispUserWithPassword>();
const usersByUsername = new Map<string, WispUserWithPassword>();

// Mock auto-increment ID
let nextId = 1;

class LocalUser {
  static async findById(id: number): Promise<WispUser | null> {
    const user = users.get(id);
    return user ? LocalUser.sanitizeUser(user) : null;
  }

  static async findByEmail(email: string): Promise<WispUser | null> {
    const user = usersByEmail.get(email);
    return user ? LocalUser.sanitizeUser(user) : null;
  }

  static async findByUsername(username: string): Promise<WispUser | null> {
    const user = usersByUsername.get(username);
    return user ? LocalUser.sanitizeUser(user) : null;
  }
  
  static async create(username: string, email: string, password: string): Promise<WispUser> {
    // Check if user already exists
    if (usersByEmail.has(email)) {
      throw new Error('User with this email already exists');
    }
    if (usersByUsername.has(username)) {
      throw new Error('User with this username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userData: WispUserWithPassword = {
      id: nextId++,
      username,
      email,
      password_hash: passwordHash
    };
    
    users.set(userData.id, userData);
    usersByEmail.set(email, userData);
    usersByUsername.set(username, userData);
    
    return LocalUser.sanitizeUser(userData);
  }
  
  static async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const user = users.get(id);
    if (!user) {
      return false;
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.password_hash = passwordHash;
    
    users.set(id, user);
    usersByEmail.set(user.email, user);
    usersByUsername.set(user.username, user);
    
    return true;
  }
  
  static async verifyPassword(id: number, password: string): Promise<boolean> {
    const user = users.get(id);
    if (!user) {
      return false;
    }
    
    return await bcrypt.compare(password, user.password_hash);
  }

  static async verifyPasswordByEmail(email: string, password: string): Promise<WispUser | null> {
    const user = usersByEmail.get(email);
    if (!user) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid ? LocalUser.sanitizeUser(user) : null;
  }

  static async verifyPasswordByUsername(username: string, password: string): Promise<WispUser | null> {
    const user = usersByUsername.get(username);
    if (!user) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid ? LocalUser.sanitizeUser(user) : null;
  }
  
  static async delete(id: number): Promise<boolean> {
    const user = users.get(id);
    if (!user) {
      return false;
    }

    users.delete(id);
    usersByEmail.delete(user.email);
    usersByUsername.delete(user.username);
    
    return true;
  }
  
  static async exists(id: number): Promise<boolean> {
    return users.has(id);
  }

  // Get user without password hash for public use
  static sanitizeUser(user: WispUserWithPassword): WispUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email
    };
  }
}

export default LocalUser;
