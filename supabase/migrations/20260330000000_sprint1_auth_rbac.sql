-- Safaa Agro Farms ERP - Sprint 1 Database Schema

CREATE TYPE app_role AS ENUM (
    'ROLE_ADMIN',
        'ROLE_SALES',
            'ROLE_PROC',
                'ROLE_WH_COLD',
                    'ROLE_DOCS',
                        'ROLE_FIN'
                        );

                        CREATE TABLE public.user_profiles (
                            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
                                email TEXT NOT NULL UNIQUE,
                                    full_name TEXT NOT NULL,
                                        role app_role NOT NULL DEFAULT 'ROLE_SALES',
                                            department TEXT,
                                                is_active BOOLEAN NOT NULL DEFAULT true,
                                                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                                                        );

                                                        -- Indexing for role-based execution queries
                                                        CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
                                                        CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);

                                                        -- Automatic Timestamp Update Function
                                                        CREATE OR REPLACE FUNCTION update_updated_at_column()
                                                        RETURNS TRIGGER AS $$
                                                        BEGIN
                                                            NEW.updated_at = NOW();
                                                                RETURN NEW;
                                                                END;
                                                                $$ LANGUAGE plpgsql;

                                                                CREATE TRIGGER update_user_profiles_updated_at
                                                                    BEFORE UPDATE ON public.user_profiles
                                                                        FOR EACH ROW
                                                                            EXECUTE FUNCTION update_updated_at_column();

                                                                            -- Automatic Profile Creation Trigger on Supabase Auth Signup
                                                                            CREATE OR REPLACE FUNCTION public.handle_new_user()
                                                                            RETURNS TRIGGER AS $$
                                                                            BEGIN
                                                                                INSERT INTO public.user_profiles (id, email, full_name, role)
                                                                                    VALUES (
                                                                                            NEW.id,
                                                                                                    NEW.email,
                                                                                                            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
                                                                                                                    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'ROLE_SALES'::app_role)
                                                                                                                        );
                                                                                                                            RETURN NEW;
                                                                                                                            END;
                                                                                                                            $$ LANGUAGE plpgsql SECURITY DEFINER;

                                                                                                                            CREATE TRIGGER on_auth_user_created
                                                                                                                                AFTER INSERT ON auth.users
                                                                                                                                    FOR EACH ROW
                                                                                                                                        EXECUTE FUNCTION public.handle_new_user();

                                                                                                                                        -- Row Level Security Rules
                                                                                                                                        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

                                                                                                                                        -- Policy 1: Users can read their own profile
                                                                                                                                        CREATE POLICY "Users can read own profile"
                                                                                                                                            ON public.user_profiles
                                                                                                                                                FOR SELECT
                                                                                                                                                    USING (auth.uid() = id);

                                                                                                                                                    -- Policy 2: Admins can view all user profiles
                                                                                                                                                    CREATE POLICY "Admins can select all profiles"
                                                                                                                                                        ON public.user_profiles
                                                                                                                                                            FOR SELECT
                                                                                                                                                                USING (
                                                                                                                                                                        EXISTS (
                                                                                                                                                                                    SELECT 1 FROM public.user_profiles
                                                                                                                                                                                                WHERE id = auth.uid() AND role = 'ROLE_ADMIN'
                                                                                                                                                                                                        )
                                                                                                                                                                                                            );

                                                                                                                                                                                                            -- Policy 3: Admins can update user profiles
                                                                                                                                                                                                            CREATE POLICY "Admins can update all profiles"
                                                                                                                                                                                                                ON public.user_profiles
                                                                                                                                                                                                                    FOR UPDATE
                                                                                                                                                                                                                        USING (
                                                                                                                                                                                                                                EXISTS (
                                                                                                                                                                                                                                            SELECT 1 FROM public.user_profiles
                                                                                                                                                                                                                                                        WHERE id = auth.uid() AND role = 'ROLE_ADMIN'
                                                                                                                                                                                                                                                                )
                                                                                                                                                                                                                                                                    );