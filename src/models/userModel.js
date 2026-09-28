import { supabase, isSupabaseConfigured } from '../config/db.js';
import crypto from 'crypto';

// Local development fallback memory store (active when table is not yet migrated)
const localUsersStore = new Map();

const isTableMissingError = (error) => {
  if (!error) return false;
  return (
    error.code === '42P01' ||
    (error.message && error.message.toLowerCase().includes('could not find the table'))
  );
};

/**
 * User Model
 * Abstracts database interactions for user management.
 * Connects to Supabase PostgreSQL when credentials & tables exist,
 * or gracefully provides a development in-memory store so you can test immediately.
 */
export const UserModel = {
  /**
   * Find a user by email address
   */
  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (error) {
          if (isTableMissingError(error)) {
            console.warn("⚠️ Notice: 'users' table not yet migrated in Supabase. Using development store.");
            return localUsersStore.get(normalizedEmail) || null;
          }
          console.error('❌ [UserModel.findByEmail Error]:', error.message);
          throw new Error('Database query failed while finding user');
        }
        return data;
      } catch (err) {
        if (err.message?.includes('could not find the table')) {
          return localUsersStore.get(normalizedEmail) || null;
        }
        throw err;
      }
    }

    // Dev fallback
    return localUsersStore.get(normalizedEmail) || null;
  },

  /**
   * Find a user by UUID
   */
  async findById(id) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, full_name, college_course, created_at')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          if (isTableMissingError(error)) {
            for (const user of localUsersStore.values()) {
              if (user.id === id) {
                const { password_hash, ...safeUser } = user;
                return safeUser;
              }
            }
            return null;
          }
          console.error('❌ [UserModel.findById Error]:', error.message);
          throw new Error('Database query failed while fetching user profile');
        }
        return data;
      } catch (err) {
        for (const user of localUsersStore.values()) {
          if (user.id === id) {
            const { password_hash, ...safeUser } = user;
            return safeUser;
          }
        }
        return null;
      }
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
      try {
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
          if (isTableMissingError(error)) {
            console.warn("⚠️ Notice: 'users' table not yet migrated in Supabase. Storing in development store.");
            const newUser = {
              id: crypto.randomUUID(),
              email: normalizedEmail,
              password_hash: passwordHash,
              full_name: fullName.trim(),
              college_course: collegeCourse ? collegeCourse.trim() : 'Undergraduate',
              created_at: new Date().toISOString(),
            };
            localUsersStore.set(normalizedEmail, newUser);
            const { password_hash, ...safeUser } = newUser;
            return safeUser;
          }
          console.error('❌ [UserModel.create Error]:', error.message);
          throw new Error(error.message || 'Failed to create user in database');
        }
        return data;
      } catch (err) {
        if (err.message?.includes('could not find the table')) {
          const newUser = {
            id: crypto.randomUUID(),
            email: normalizedEmail,
            password_hash: passwordHash,
            full_name: fullName.trim(),
            college_course: collegeCourse ? collegeCourse.trim() : 'Undergraduate',
            created_at: new Date().toISOString(),
          };
          localUsersStore.set(normalizedEmail, newUser);
          const { password_hash, ...safeUser } = newUser;
          return safeUser;
        }
        throw err;
      }
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
