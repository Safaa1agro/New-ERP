-- Default Admin User Bootstrap Seed
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        'a0000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000000',
                'authenticated',
                    'authenticated',
                        'admin@safaaagro.com',
                            -- Default Password Digest: SafaaAgro2026!
                                crypt('SafaaAgro2026!', gen_salt('bf')),
                                    NOW(),
                                        '{"provider": "email", "providers": ["email"]}',
                                            '{"full_name": "System Administrator", "role": "ROLE_ADMIN"}',
                                                NOW(),
                                                    NOW()
                                                    ) ON CONFLICT (id) DO NOTHING;