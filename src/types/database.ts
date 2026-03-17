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
      }
      profiles: {
        // id = auth.uid() (set by trigger on signup).
        // user_id is a separate nullable FK, used for managed/non-auth members.
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
        }
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
        }
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
        }
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
          added_by: string | null  // FK → profiles.id
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
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
      member_role: 'admin' | 'member'
      recipe_source: 'seeded' | 'user' | 'ai'
      shopping_source: 'manual' | 'meal_plan' | 'recommendation'
    }
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
