export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id: string | null
          household_id: string | null
          display_name: string
          avatar_color: string
          dietary_restrictions: string[]
          is_managed: boolean
          created_at: string
        }
        Insert: {
          id: string
          user_id?: string | null
          household_id?: string | null
          display_name: string
          avatar_color?: string
          dietary_restrictions?: string[]
          is_managed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          household_id?: string | null
          display_name?: string
          avatar_color?: string
          dietary_restrictions?: string[]
          is_managed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      household_members: {
        Row: {
          id: string
          household_id: string | null
          user_id: string | null
          role: 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          household_id?: string | null
          user_id?: string | null
          role?: 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          household_id?: string | null
          user_id?: string | null
          role?: 'admin' | 'member'
          joined_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          prep_time: number | null
          cook_time: number | null
          servings: number
          instructions: string | null
          image_url: string | null
          source: 'seeded' | 'user' | 'ai'
          created_by: string | null
          is_public: boolean
          created_at: string
          recipe_category: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number
          instructions?: string | null
          image_url?: string | null
          source?: 'seeded' | 'user' | 'ai'
          created_by?: string | null
          is_public?: boolean
          created_at?: string
          recipe_category?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number
          instructions?: string | null
          image_url?: string | null
          source?: 'seeded' | 'user' | 'ai'
          created_by?: string | null
          is_public?: boolean
          created_at?: string
          recipe_category?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string | null
          ingredient_name: string
          quantity: number | null
          unit: string | null
        }
        Insert: {
          id?: string
          recipe_id?: string | null
          ingredient_name: string
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          id?: string
          recipe_id?: string | null
          ingredient_name?: string
          quantity?: number | null
          unit?: string | null
        }
        Relationships: []
      }
      recipe_interactions: {
        Row: {
          id: string
          user_id: string | null
          recipe_id: string | null
          is_saved: boolean
          rating: number | null
          cooked_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          recipe_id?: string | null
          is_saved?: boolean
          rating?: number | null
          cooked_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          recipe_id?: string | null
          is_saved?: boolean
          rating?: number | null
          cooked_at?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      pantry_items: {
        Row: {
          id: string
          household_id: string | null
          ingredient_name: string
          quantity: number
          unit: string | null
          category: string | null
          expiry_date: string | null
          low_stock_threshold: number
          updated_at: string
          stock_level: 'high' | 'medium' | 'low' | 'out'
          meal_count: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          household_id?: string | null
          ingredient_name: string
          quantity?: number
          unit?: string | null
          category?: string | null
          expiry_date?: string | null
          low_stock_threshold?: number
          updated_at?: string
          stock_level?: 'high' | 'medium' | 'low' | 'out'
          meal_count?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          household_id?: string | null
          ingredient_name?: string
          quantity?: number
          unit?: string | null
          category?: string | null
          expiry_date?: string | null
          low_stock_threshold?: number
          updated_at?: string
          stock_level?: 'high' | 'medium' | 'low' | 'out'
          meal_count?: number | null
          notes?: string | null
        }
        Relationships: []
      }
      ingredient_synonyms: {
        Row: {
          id: string
          canonical_name: string
          variant_name: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          canonical_name: string
          variant_name: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          canonical_name?: string
          variant_name?: string
          category?: string | null
          created_at?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          id: string
          household_id: string | null
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          recipe_id: string | null
          custom_meal_name: string | null
          servings: number
          notes: string | null
          created_at: string
          variant_id: string | null
        }
        Insert: {
          id?: string
          household_id?: string | null
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          recipe_id?: string | null
          custom_meal_name?: string | null
          servings?: number
          notes?: string | null
          created_at?: string
          variant_id?: string | null
        }
        Update: {
          id?: string
          household_id?: string | null
          date?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          recipe_id?: string | null
          custom_meal_name?: string | null
          servings?: number
          notes?: string | null
          created_at?: string
          variant_id?: string | null
        }
        Relationships: []
      }
      recipe_variants: {
        Row: {
          id: string
          recipe_id: string
          name: string
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          name: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          name?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      recipe_variant_ingredients: {
        Row: {
          id: string
          variant_id: string
          ingredient_name: string
          quantity: number | null
          unit: string | null
          action: 'add' | 'remove' | 'swap'
          replaces_ingredient_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          variant_id: string
          ingredient_name: string
          quantity?: number | null
          unit?: string | null
          action: 'add' | 'remove' | 'swap'
          replaces_ingredient_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          variant_id?: string
          ingredient_name?: string
          quantity?: number | null
          unit?: string | null
          action?: 'add' | 'remove' | 'swap'
          replaces_ingredient_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          id: string
          household_id: string | null
          ingredient_name: string
          quantity: number | null
          unit: string | null
          category: string | null
          is_checked: boolean
          added_by: string | null
          source: 'manual' | 'meal_plan' | 'recommendation'
          created_at: string
        }
        Insert: {
          id?: string
          household_id?: string | null
          ingredient_name: string
          quantity?: number | null
          unit?: string | null
          category?: string | null
          is_checked?: boolean
          added_by?: string | null
          source?: 'manual' | 'meal_plan' | 'recommendation'
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string | null
          ingredient_name?: string
          quantity?: number | null
          unit?: string | null
          category?: string | null
          is_checked?: boolean
          added_by?: string | null
          source?: 'manual' | 'meal_plan' | 'recommendation'
          created_at?: string
        }
        Relationships: []
      }
      household_invites: {
        Row: {
          id: string
          household_id: string
          invited_by: string
          email: string
          token: string
          status: 'pending' | 'accepted' | 'expired'
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          invited_by: string
          email: string
          token?: string
          status?: 'pending' | 'accepted' | 'expired'
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          invited_by?: string
          email?: string
          token?: string
          status?: 'pending' | 'accepted' | 'expired'
          expires_at?: string
          created_at?: string
        }
        Relationships: []
      }
      app_events: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          household_id: string | null
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          user_id?: string | null
          household_id?: string | null
          payload?: Json
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          user_id?: string | null
          household_id?: string | null
          payload?: Json
          created_at?: string
        }
        Relationships: []
      }
      pantry_priming_items: {
        Row: {
          id: string
          ingredient_name: string
          category: string
          display_order: number
          is_staple: boolean
        }
        Insert: {
          id?: string
          ingredient_name: string
          category: string
          display_order?: number
          is_staple?: boolean
        }
        Update: {
          id?: string
          ingredient_name?: string
          category?: string
          display_order?: number
          is_staple?: boolean
        }
        Relationships: []
      }
      ingredient_categories: {
        Row: {
          id: string
          ingredient_pattern: string
          category: string
          priority: number
          created_at: string
        }
        Insert: {
          id?: string
          ingredient_pattern: string
          category: string
          priority?: number
          created_at?: string
        }
        Update: {
          id?: string
          ingredient_pattern?: string
          category?: string
          priority?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      create_household: {
        Args: { household_name: string }
        Returns: string
      }
      get_my_household_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
      log_event: {
        Args: { p_event_type: string; p_payload?: Json }
        Returns: void
      }
      validate_invite: {
        Args: { p_token: string }
        Returns: { valid: boolean; household_name: string | null; email: string | null }
      }
      accept_invite: {
        Args: { p_token: string }
        Returns: void
      }
      create_managed_profile: {
        Args: {
          p_display_name: string
          p_avatar_color?: string
          p_dietary_restrictions?: string[]
        }
        Returns: string
      }
      generate_grocery_list: {
        Args: {
          p_household_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          ingredient_name: string
          total_quantity: number
          unit: string | null
          category: string
          recipe_sources: string
          already_have: boolean
        }[]
      }
      upsert_shopping_item: {
        Args: {
          p_household_id: string
          p_ingredient_name: string
          p_quantity: number
          p_unit: string | null
          p_category: string | null
          p_added_by: string | null
          p_source: string
        }
        Returns: string
      }
    }
    Enums: {
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
      member_role: 'admin' | 'member'
      recipe_source: 'seeded' | 'user' | 'ai'
      shopping_source: 'manual' | 'meal_plan' | 'recommendation'
      invite_status: 'pending' | 'accepted' | 'expired'
      stock_level: 'high' | 'medium' | 'low' | 'out'
      variant_action: 'add' | 'remove' | 'swap'
    }
    CompositeTypes: Record<string, never>
  }
}

// Convenience row types
export type Household         = Database['public']['Tables']['households']['Row']
export type Profile           = Database['public']['Tables']['profiles']['Row']
export type HouseholdMember   = Database['public']['Tables']['household_members']['Row']
export type Recipe            = Database['public']['Tables']['recipes']['Row']
export type RecipeIngredient  = Database['public']['Tables']['recipe_ingredients']['Row']
export type RecipeInteraction = Database['public']['Tables']['recipe_interactions']['Row']
export type PantryItem        = Database['public']['Tables']['pantry_items']['Row']
export type MealPlan          = Database['public']['Tables']['meal_plans']['Row']
export type ShoppingItem      = Database['public']['Tables']['shopping_items']['Row']
export type HouseholdInvite   = Database['public']['Tables']['household_invites']['Row']
export type AppEvent          = Database['public']['Tables']['app_events']['Row']
export type IngredientSynonym = Database['public']['Tables']['ingredient_synonyms']['Row']
export type RecipeVariant     = Database['public']['Tables']['recipe_variants']['Row']
export type RecipeVariantIngredient = Database['public']['Tables']['recipe_variant_ingredients']['Row']
export type IngredientCategory = Database['public']['Tables']['ingredient_categories']['Row']
export type PantryPrimingItem  = Database['public']['Tables']['pantry_priming_items']['Row']

export interface GroceryListItem {
  ingredient_name: string
  total_quantity: number
  unit: string | null
  category: string
  recipe_sources: string
  already_have: boolean
}
