export type AppRole = 
  | 'ROLE_ADMIN'
    | 'ROLE_SALES'
      | 'ROLE_PROC'
        | 'ROLE_WH_COLD'
          | 'ROLE_DOCS'
            | 'ROLE_FIN';

            export interface UserProfile {
              id: string;
                email: string;
                  full_name: string;
                    role: AppRole;
                      department: string | null;
                        is_active: boolean;
                          created_at: string;
                            updated_at: string;
                            }

                            export type Database = {
                              public: {
                                  Tables: {
                                        user_profiles: {
                                                Row: UserProfile;
                                                        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
                                                                Update: Partial<Omit<UserProfile, 'id'>>;
                                                                      };
                                                                          };
                                                                            };
                                                                            };