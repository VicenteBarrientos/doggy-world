export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          username: string | null;
          avatar_url: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          username?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: Relationship[];
      };
      dogs: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          photo_path: string | null;
          breed: string;
          mixed_breed: boolean;
          sex: Database["public"]["Enums"]["dog_sex"];
          birth_date: string | null;
          adoption_date: string | null;
          weight_kg: number | null;
          size: Database["public"]["Enums"]["dog_size"];
          energy_level: Database["public"]["Enums"]["energy_level"];
          sociability: Database["public"]["Enums"]["sociability_level"];
          play_style: string | null;
          personality_tags: string[];
          bio: string;
          city: string | null;
          country: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          photo_path?: string | null;
          breed: string;
          mixed_breed?: boolean;
          sex?: Database["public"]["Enums"]["dog_sex"];
          birth_date?: string | null;
          adoption_date?: string | null;
          weight_kg?: number | null;
          size: Database["public"]["Enums"]["dog_size"];
          energy_level: Database["public"]["Enums"]["energy_level"];
          sociability: Database["public"]["Enums"]["sociability_level"];
          play_style?: string | null;
          personality_tags?: string[];
          bio?: string;
          city?: string | null;
          country?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["dogs"]["Insert"]>;
        Relationships: Relationship[];
      };
      dog_preferences: {
        Row: {
          id: string;
          dog_id: string;
          category: Database["public"]["Enums"]["preference_category"];
          preference_key: string;
          value: string;
          sentiment: number;
          confidence: number | null;
          source: Database["public"]["Enums"]["preference_source"];
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dog_id: string;
          category: Database["public"]["Enums"]["preference_category"];
          preference_key: string;
          value: string;
          sentiment?: number;
          confidence?: number | null;
          source?: Database["public"]["Enums"]["preference_source"];
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["dog_preferences"]["Insert"]
        >;
        Relationships: Relationship[];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          brand: string | null;
          category: Database["public"]["Enums"]["product_category"];
          description: string | null;
          image_url: string | null;
          external_reference: string | null;
          durability: number | null;
          material: string | null;
          intended_dog_size: Database["public"]["Enums"]["dog_size"] | null;
          toy_type: string | null;
          food_protein: string | null;
          texture: string | null;
          enrichment_type: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          brand?: string | null;
          category: Database["public"]["Enums"]["product_category"];
          description?: string | null;
          image_url?: string | null;
          external_reference?: string | null;
          durability?: number | null;
          material?: string | null;
          intended_dog_size?: Database["public"]["Enums"]["dog_size"] | null;
          toy_type?: string | null;
          food_protein?: string | null;
          texture?: string | null;
          enrichment_type?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: Relationship[];
      };
      dog_product_interactions: {
        Row: {
          id: string;
          dog_id: string;
          product_id: string;
          reaction: Database["public"]["Enums"]["product_reaction"];
          rating: number | null;
          favorite: boolean;
          destroyed: boolean | null;
          lifetime_hours: number | null;
          accepted: boolean | null;
          would_buy_again: boolean | null;
          possible_reaction: boolean | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dog_id: string;
          product_id: string;
          reaction: Database["public"]["Enums"]["product_reaction"];
          rating?: number | null;
          favorite?: boolean;
          destroyed?: boolean | null;
          lifetime_hours?: number | null;
          accepted?: boolean | null;
          would_buy_again?: boolean | null;
          possible_reaction?: boolean | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["dog_product_interactions"]["Insert"]
        >;
        Relationships: Relationship[];
      };
      dog_friendships: {
        Row: {
          id: string;
          requester_dog_id: string;
          recipient_dog_id: string;
          status: Database["public"]["Enums"]["friendship_status"];
          created_at: string;
          updated_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          requester_dog_id: string;
          recipient_dog_id: string;
          status?: Database["public"]["Enums"]["friendship_status"];
          created_at?: string;
          updated_at?: string;
          responded_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["dog_friendships"]["Insert"]
        >;
        Relationships: Relationship[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_public_dog_favorites: {
        Args: { public_dog_id: string };
        Returns: {
          product_id: string;
          name: string;
          slug: string;
          category: Database["public"]["Enums"]["product_category"];
          image_url: string | null;
        }[];
      };
    };
    Enums: {
      dog_sex: "female" | "male" | "unknown";
      dog_size: "small" | "medium" | "large" | "giant";
      energy_level: "low" | "medium" | "high" | "very_high";
      sociability_level: "shy" | "selective" | "social" | "very_social";
      product_category:
        | "toy"
        | "treat"
        | "food"
        | "accessory"
        | "enrichment"
        | "health"
        | "other";
      product_reaction: "loved" | "liked" | "neutral" | "disliked";
      preference_category:
        | "toy"
        | "treat"
        | "food"
        | "activity"
        | "behavior"
        | "other";
      preference_source: "owner" | "product_feedback" | "system";
      friendship_status: "pending" | "accepted" | "declined" | "blocked";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Dog = Database["public"]["Tables"]["dogs"]["Row"];
export type DogPreference =
  Database["public"]["Tables"]["dog_preferences"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type DogProductInteraction =
  Database["public"]["Tables"]["dog_product_interactions"]["Row"];
export type DogFriendship =
  Database["public"]["Tables"]["dog_friendships"]["Row"];

export type DogWithPhoto = Dog & { photo_url: string | null };

export type PublicDogProfile = DogWithPhoto & {
  preferences: DogPreference[];
  favorite_products: Pick<
    Product,
    "id" | "name" | "slug" | "category" | "image_url"
  >[];
  friends: DogWithPhoto[];
  friend_count: number;
};
