import { supabase, isSupabaseConfigured } from '../config/db.js';
import crypto from 'crypto';

// Local development fallback memory store (active only when Supabase .env keys are placeholders)
const localUsersStore = new Map();

/**
 * User Model
 * Abstracts database interactions for user management.
 * Connects to Supabase PostgreSQL when credentials exist,
 * or provides a development in-memory store so you can test immediately.
 */
export const UserModel = {
  /**
   * Find a user by email address
   */
  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) {
        console.error('❌ [UserModel.findByEmail Error]:', error.message);
        throw new Error('Database query failed while finding user');
      }
      return data;
    }

    // Dev fallback
    return localUsersStore.get(normalizedEmail) || null;
  },

  /**
   * Find a user by UUID
   */
  async findById(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, college_course, created_at')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('❌ [UserModel.findById Error]:', error.message);
        throw new Error('Database query failed while fetching user profile');
      }
      return data;
    }

    // Dev fallback
    for (const user of localUsersStore.values()) {
      if (user.id === id) {
        const { password_hash, ...safeUser } = user;
        return safeUser;
      }
    }
    return null;
  },

  /**
   * Create a new user with hashed password
   */
  async create({ email, passwordHash, fullName, collegeCourse }) {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email: normalizedEmail,
            password_hash: passwordHash,
            full_name: fullName.trim(),
            college_course: collegeCourse ? collegeCourse.trim() : null,
          },
        ])
        .select('id, email, full_name, college_course, created_at')
        .single();

      if (error) {
        console.error('❌ [UserModel.create Error]:', error.message);
        throw new Error(error.message || 'Failed to create user in database');
      }
      return data;
    }

    // Dev fallback
    const newUser = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      password_hash: passwordHash,
      full_name: fullName.trim(),
      college_course: collegeCourse ? collegeCourse.trim() : 'Undergraduate',
      created_at: new Date().toISOString(),
    };

    localUsersStore.set(normalizedEmail, newUser);
    console.log(`ℹ️ [UserModel]: User '${normalizedEmail}' created in development store.`);

    const { password_hash, ...safeUser } = newUser;
    return safeUser;
  },
};

export default UserModel;
