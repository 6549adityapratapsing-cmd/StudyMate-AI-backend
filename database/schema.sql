-- ==============================================================================
-- STUDYMATE AI - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Purpose: Complete Relational Schema for Students, Materials, AI Resources,
--          Quizzes, Questions, Flashcards, and Activity Logging.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. USERS TABLE
-- Stores student accounts with secure password hashing.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    college_course VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast email lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- ==============================================================================
-- 3. SUBJECTS TABLE
-- Categorizes study materials (e.g., "Physics", "Computer Science", "Chemistry")
-- ==============================================================================
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    color VARCHAR(50) DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);


-- ==============================================================================
-- 4. STUDY MATERIALS TABLE
-- Stores uploaded PDFs, images of notes, or pasted chapter texts.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL, -- 'pdf', 'image', 'text'
    original_filename VARCHAR(255),
    raw_text TEXT NOT NULL,
    cleaned_text TEXT NOT NULL,
    page_count INT DEFAULT 1,
    is_question_paper BOOLEAN DEFAULT FALSE,
    academic_year VARCHAR(50), -- e.g., '2023', '2024', 'Question Bank'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_study_materials_user_id ON study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_subject_id ON study_materials(subject_id);


-- ==============================================================================
-- 5. MATERIAL CHUNKS TABLE
-- For large chapters/documents: splits text into chunks for optimal AI context.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS material_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    page_number INT,
    token_count INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_material_chunks_material_id ON material_chunks(material_id);


-- ==============================================================================
-- 6. GENERATED RESOURCES TABLE
-- Stores AI-generated study artifacts: summaries, key points, exam notes.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS generated_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL, -- 'quick_summary', 'detailed_summary', 'key_points', 'explain_simply', 'exam_prep'
    title VARCHAR(255),
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generated_resources_user_id ON generated_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_resources_material_id ON generated_resources(material_id);


-- ==============================================================================
-- 7. QUESTIONS TABLE
-- AI-identified important questions categorized by priority and question type.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_guide TEXT,
    importance VARCHAR(30) DEFAULT 'important', -- 'very_important', 'important', 'revision'
    question_type VARCHAR(50) DEFAULT 'short-answer', -- 'short-answer', 'long-answer', 'conceptual', 'definition', 'formula'
    topic VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_material_id ON questions(material_id);


-- ==============================================================================
-- 8. REPEATED QUESTION GROUPS & SOURCES TABLE
-- Backs the Repeated Questions Analyzer with evidence-based verification.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS repeated_question_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    normalized_question TEXT NOT NULL,
    occurrences INT DEFAULT 1,
    concept_summary TEXT,
    importance VARCHAR(30) DEFAULT 'high',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_repeated_question_groups_user_id ON repeated_question_groups(user_id);

CREATE TABLE IF NOT EXISTS repeated_question_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES repeated_question_groups(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
    exact_wording TEXT NOT NULL,
    source_paper_title VARCHAR(255),
    academic_year VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_repeated_question_sources_group_id ON repeated_question_sources(group_id);


-- ==============================================================================
-- 9. QUIZZES & QUIZ QUESTIONS TABLE
-- Stores quizzes generated from materials and their respective MCQ items.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    material_id UUID REFERENCES study_materials(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard', 'mixed'
    total_questions INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of 4 strings: ["A", "B", "C", "D"]
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT,
    order_num INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);


-- ==============================================================================
-- 10. QUIZ RESULTS TABLE
-- Keeps student scores, answer reviews, and percentage calculations.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    user_answers JSONB NOT NULL,
    time_spent_seconds INT DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);


-- ==============================================================================
-- 11. FLASHCARDS TABLE
-- Active recall flashcard system (Question/Concept on front, Answer on back).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    topic VARCHAR(150),
    mastery_level INT DEFAULT 0, -- 0: Unseen, 1: Learning, 2: Mastered
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_material_id ON flashcards(material_id);


-- ==============================================================================
-- 12. STUDY ACTIVITY TABLE
-- Logs study sessions for the student's dashboard analytics.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS study_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'upload', 'summary', 'quiz_completed', 'flashcard_review', 'chat'
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_study_activity_user_id ON study_activity(user_id);


-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each student can only access and modify their own study data.
-- ==============================================================================

-- Enable RLS on all user-owned tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE repeated_question_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE repeated_question_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_activity ENABLE ROW LEVEL SECURITY;

-- Service Role Policy (Allows Backend Node.js Service Role Key to manage all data securely)
-- Note: When backend uses SUPABASE_SERVICE_ROLE_KEY, it bypasses RLS safely.
-- If client direct access is ever used, policies below restrict to auth.uid():

CREATE POLICY "Users can view own profile" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own subjects" ON subjects
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own study materials" ON study_materials
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own resources" ON generated_resources
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own questions" ON questions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own quizzes" ON quizzes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own quiz results" ON quiz_results
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own flashcards" ON flashcards
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity" ON study_activity
    FOR ALL USING (auth.uid() = user_id);
