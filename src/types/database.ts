// Tipos do esquema versionado em supabase/migrations. Atualize-os ao alterar o banco.
type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      subjects: Table<
        {
          id: string;
          name: string;
          icon: string;
          description: string;
          professor: string;
          created_at: string;
        },
        {
          id?: string;
          name: string;
          icon?: string;
          description?: string;
          professor?: string;
          created_at?: string;
        }
      >;
      activities: Table<
        {
          id: string;
          subject_id: string;
          title: string;
          description: string;
          due_date: string;
          created_at: string;
        },
        {
          id?: string;
          subject_id: string;
          title: string;
          description?: string;
          due_date: string;
          created_at?: string;
        }
      >;
      notices: Table<
        {
          id: string;
          title: string;
          body: string;
          category: string;
          created_at: string;
        },
        {
          id?: string;
          title: string;
          body: string;
          category?: string;
          created_at?: string;
        }
      >;
      profiles: Table<
        {
          user_id: string;
          name: string;
          year: string;
          goal: string;
        },
        {
          user_id: string;
          name?: string;
          year?: string;
          goal?: string;
        }
      >;
      activity_progress: Table<
        {
          user_id: string;
          activity_id: string;
          completed_at: string;
        },
        {
          user_id: string;
          activity_id: string;
          completed_at?: string;
        }
      >;
      notice_reads: Table<
        {
          user_id: string;
          notice_id: string;
          read_at: string;
        },
        {
          user_id: string;
          notice_id: string;
          read_at?: string;
        }
      >;
      portal_admins: Table<{ email: string }, { email: string }>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
