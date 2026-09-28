import { supabase, isSupabaseConfigured } from '../config/db.js';
import crypto from 'crypto';

// In-memory development store for materials
const localMaterialsStore = new Map();

const isTableMissingError = (error) => {
  if (!error) return false;
  return (
    error.code === '42P01' ||
    (error.message && error.message.toLowerCase().includes('could not find the table'))
  );
};

export const MaterialModel = {
  /**
   * Save a new study material
   */
  async create({
    userId,
    subjectId = null,
    title,
    fileType,
    originalFilename = null,
    rawText,
    cleanedText,
    pageCount = 1,
    isQuestionPaper = false,
    academicYear = null,
  }) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('study_materials')
          .insert([
            {
              user_id: userId,
              subject_id: subjectId,
              title: title.trim(),
              file_type: fileType,
              original_filename: originalFilename,
              raw_text: rawText,
              cleaned_text: cleanedText,
              page_count: pageCount,
              is_question_paper: isQuestionPaper,
              academic_year: academicYear,
            },
          ])
          .select('*')
          .single();

        if (error) {
          if (isTableMissingError(error)) {
            console.warn("⚠️ Notice: 'study_materials' table not yet migrated in Supabase. Using development store.");
            const newDoc = {
              id: crypto.randomUUID(),
              user_id: userId,
              subject_id: subjectId,
              title: title.trim(),
              file_type: fileType,
              original_filename: originalFilename,
              raw_text: rawText,
              cleaned_text: cleanedText,
              page_count: pageCount,
              is_question_paper: isQuestionPaper,
              academic_year: academicYear,
              created_at: new Date().toISOString(),
            };
            localMaterialsStore.set(newDoc.id, newDoc);
            return newDoc;
          }
          console.error('❌ [MaterialModel.create Error]:', error.message);
          throw new Error('Failed to save study material in database');
        }
        return data;
      } catch (err) {
        if (err.message?.includes('could not find the table')) {
          const newDoc = {
            id: crypto.randomUUID(),
            user_id: userId,
            subject_id: subjectId,
            title: title.trim(),
            file_type: fileType,
            original_filename: originalFilename,
            raw_text: rawText,
            cleaned_text: cleanedText,
            page_count: pageCount,
            is_question_paper: isQuestionPaper,
            academic_year: academicYear,
            created_at: new Date().toISOString(),
          };
          localMaterialsStore.set(newDoc.id, newDoc);
          return newDoc;
        }
        throw err;
      }
    }

    // Dev fallback
    const newDoc = {
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: subjectId,
      title: title.trim(),
      file_type: fileType,
      original_filename: originalFilename,
      raw_text: rawText,
      cleaned_text: cleanedText,
      page_count: pageCount,
      is_question_paper: isQuestionPaper,
      academic_year: academicYear,
      created_at: new Date().toISOString(),
    };
    localMaterialsStore.set(newDoc.id, newDoc);
    return newDoc;
  },

  /**
   * Find all materials belonging to a student
   */
  async findByUserId(userId) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('study_materials')
          .select('id, user_id, subject_id, title, file_type, original_filename, page_count, is_question_paper, academic_year, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          if (isTableMissingError(error)) {
            return Array.from(localMaterialsStore.values()).filter((m) => m.user_id === userId);
          }
          throw error;
        }
        return data || [];
      } catch (err) {
        return Array.from(localMaterialsStore.values()).filter((m) => m.user_id === userId);
      }
    }

    // Dev fallback
    return Array.from(localMaterialsStore.values())
      .filter((m) => m.user_id === userId)
      .map(({ raw_text, cleaned_text, ...meta }) => meta);
  },

  /**
   * Find a single material by ID for a student
   */
  async findById(id, userId) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('study_materials')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          if (isTableMissingError(error)) {
            const item = localMaterialsStore.get(id);
            return item && item.user_id === userId ? item : null;
          }
          throw error;
        }
        return data;
      } catch (err) {
        const item = localMaterialsStore.get(id);
        return item && item.user_id === userId ? item : null;
      }
    }

    const item = localMaterialsStore.get(id);
    return item && item.user_id === userId ? item : null;
  },

  /**
   * Delete a study material by ID
   */
  async deleteById(id, userId) {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('study_materials')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error && !isTableMissingError(error)) {
          throw error;
        }
      } catch (err) {
        // fallback
      }
    }

    const item = localMaterialsStore.get(id);
    if (item && item.user_id === userId) {
      localMaterialsStore.delete(id);
      return true;
    }
    return false;
  },
};

export default MaterialModel;
