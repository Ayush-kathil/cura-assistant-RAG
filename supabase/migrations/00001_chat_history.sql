-- Create Chat Sessions Table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Chat Sessions
CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Policies for Chat Messages
CREATE POLICY "Users can view own chat messages" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
);
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
);
CREATE POLICY "Users can delete own chat messages" ON public.chat_messages FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
);
