export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alertes: {
        Row: {
          created_at: string | null
          est_lue: boolean | null
          est_resolue: boolean | null
          id: string
          km_declencheur: number | null
          message: string
          niveau_urgence: string | null
          titre: string
          type_alerte: string
          vehicule_id: string | null
        }
        Insert: {
          created_at?: string | null
          est_lue?: boolean | null
          est_resolue?: boolean | null
          id?: string
          km_declencheur?: number | null
          message: string
          niveau_urgence?: string | null
          titre: string
          type_alerte: string
          vehicule_id?: string | null
        }
        Update: {
          created_at?: string | null
          est_lue?: boolean | null
          est_resolue?: boolean | null
          id?: string
          km_declencheur?: number | null
          message?: string
          niveau_urgence?: string | null
          titre?: string
          type_alerte?: string
          vehicule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alertes_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          created_at: string
          date_seuil: string | null
          id: string
          is_resolved: boolean | null
          kilometrage_seuil: number | null
          type: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          date_seuil?: string | null
          id?: string
          is_resolved?: boolean | null
          kilometrage_seuil?: number | null
          type: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          date_seuil?: string | null
          id?: string
          is_resolved?: boolean | null
          kilometrage_seuil?: number | null
          type?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      garages: {
        Row: {
          adresse_complete: string | null
          commune: string
          created_at: string | null
          est_certifie: boolean | null
          id: string
          latitude: number | null
          longitude: number | null
          nom_garage: string
          nombre_avis: number | null
          note_moyenne: number | null
          specialites: string[] | null
          telephone: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          adresse_complete?: string | null
          commune: string
          created_at?: string | null
          est_certifie?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nom_garage: string
          nombre_avis?: number | null
          note_moyenne?: number | null
          specialites?: string[] | null
          telephone?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          adresse_complete?: string | null
          commune?: string
          created_at?: string | null
          est_certifie?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nom_garage?: string
          nombre_avis?: number | null
          note_moyenne?: number | null
          specialites?: string[] | null
          telephone?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      interventions: {
        Row: {
          created_at: string | null
          date_intervention: string | null
          description_travaux: string | null
          garage_id: string | null
          id: string
          kilometrage_au_moment_rdv: number
          montant_facture: number | null
          photos_url: string[] | null
          pieces_remplacees: string[] | null
          technicien_nom: string | null
          type_service: string
          validee_at: string | null
          validee_par_garage: boolean | null
          vehicule_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_intervention?: string | null
          description_travaux?: string | null
          garage_id?: string | null
          id?: string
          kilometrage_au_moment_rdv: number
          montant_facture?: number | null
          photos_url?: string[] | null
          pieces_remplacees?: string[] | null
          technicien_nom?: string | null
          type_service: string
          validee_at?: string | null
          validee_par_garage?: boolean | null
          vehicule_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_intervention?: string | null
          description_travaux?: string | null
          garage_id?: string | null
          id?: string
          kilometrage_au_moment_rdv?: number
          montant_facture?: number | null
          photos_url?: string[] | null
          pieces_remplacees?: string[] | null
          technicien_nom?: string | null
          type_service?: string
          validee_at?: string | null
          validee_par_garage?: boolean | null
          vehicule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interventions_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages_public_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          onboarding_completed: boolean
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          onboarding_completed?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      rapports_pdf: {
        Row: {
          created_at: string | null
          expire_at: string | null
          genere_at: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          pdf_url: string | null
          price_group: string | null
          prix_usd: number | null
          proprietaire_id: string | null
          statut_paiement: string | null
          vehicule_id: string | null
        }
        Insert: {
          created_at?: string | null
          expire_at?: string | null
          genere_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          pdf_url?: string | null
          price_group?: string | null
          prix_usd?: number | null
          proprietaire_id?: string | null
          statut_paiement?: string | null
          vehicule_id?: string | null
        }
        Update: {
          created_at?: string | null
          expire_at?: string | null
          genere_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          pdf_url?: string | null
          price_group?: string | null
          prix_usd?: number | null
          proprietaire_id?: string | null
          statut_paiement?: string | null
          vehicule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rapports_pdf_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          address: string | null
          commune: string | null
          created_at: string | null
          id: number
          is_verified: boolean | null
          phone_contact: string | null
          store_name: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          commune?: string | null
          created_at?: string | null
          id?: number
          is_verified?: boolean | null
          phone_contact?: string | null
          store_name: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          commune?: string | null
          created_at?: string | null
          id?: number
          is_verified?: boolean | null
          phone_contact?: string | null
          store_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      spare_parts: {
        Row: {
          category: string | null
          compatibility_tags: string | null
          condition: string | null
          currency: string | null
          id: number
          part_name: string
          price: number | null
          seller_id: number
          stock_quantity: number | null
        }
        Insert: {
          category?: string | null
          compatibility_tags?: string | null
          condition?: string | null
          currency?: string | null
          id?: number
          part_name: string
          price?: number | null
          seller_id: number
          stock_quantity?: number | null
        }
        Update: {
          category?: string | null
          compatibility_tags?: string | null
          condition?: string | null
          currency?: string | null
          id?: number
          part_name?: string
          price?: number | null
          seller_id?: number
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spare_parts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "marketplace_sellers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spare_parts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      spare_parts_orders: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: number
          part_id: number
          payment_mode: string | null
          platform_commission: number | null
          quantity: number | null
          seller_id: number
          status: string | null
          total_price: number | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: number
          part_id: number
          payment_mode?: string | null
          platform_commission?: number | null
          quantity?: number | null
          seller_id: number
          status?: string | null
          total_price?: number | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: number
          part_id?: number
          payment_mode?: string | null
          platform_commission?: number | null
          quantity?: number | null
          seller_id?: number
          status?: string | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spare_parts_orders_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "spare_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spare_parts_orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "marketplace_sellers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spare_parts_orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          annee: number | null
          created_at: string
          id: string
          immatriculation: string
          kilometrage_actuel: number | null
          marque: string
          modele: string
          owner_id: string
          updated_at: string
          vin: string | null
        }
        Insert: {
          annee?: number | null
          created_at?: string
          id?: string
          immatriculation: string
          kilometrage_actuel?: number | null
          marque: string
          modele: string
          owner_id: string
          updated_at?: string
          vin?: string | null
        }
        Update: {
          annee?: number | null
          created_at?: string
          id?: string
          immatriculation?: string
          kilometrage_actuel?: number | null
          marque?: string
          modele?: string
          owner_id?: string
          updated_at?: string
          vin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicules: {
        Row: {
          annee: number | null
          couleur: string | null
          created_at: string | null
          derniere_vidange_km: number | null
          id: string
          kilometrage_actuel: number | null
          marque: string
          modele: string
          photo_vehicule_url: string | null
          plaque_immatriculation: string
          prochain_entretien_km: number | null
          proprietaire_id: string | null
          score_sante: number | null
          statut_badge: string | null
          updated_at: string | null
        }
        Insert: {
          annee?: number | null
          couleur?: string | null
          created_at?: string | null
          derniere_vidange_km?: number | null
          id?: string
          kilometrage_actuel?: number | null
          marque: string
          modele: string
          photo_vehicule_url?: string | null
          plaque_immatriculation: string
          prochain_entretien_km?: number | null
          proprietaire_id?: string | null
          score_sante?: number | null
          statut_badge?: string | null
          updated_at?: string | null
        }
        Update: {
          annee?: number | null
          couleur?: string | null
          created_at?: string | null
          derniere_vidange_km?: number | null
          id?: string
          kilometrage_actuel?: number | null
          marque?: string
          modele?: string
          photo_vehicule_url?: string | null
          plaque_immatriculation?: string
          prochain_entretien_km?: number | null
          proprietaire_id?: string | null
          score_sante?: number | null
          statut_badge?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      garages_public_directory: {
        Row: {
          adresse_complete: string | null
          commune: string | null
          created_at: string | null
          est_certifie: boolean | null
          id: string | null
          latitude: number | null
          longitude: number | null
          nom_garage: string | null
          nombre_avis: number | null
          note_moyenne: number | null
          specialites: string[] | null
        }
        Insert: {
          adresse_complete?: string | null
          commune?: string | null
          created_at?: string | null
          est_certifie?: boolean | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          nom_garage?: string | null
          nombre_avis?: number | null
          note_moyenne?: number | null
          specialites?: string[] | null
        }
        Update: {
          adresse_complete?: string | null
          commune?: string | null
          created_at?: string | null
          est_certifie?: boolean | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          nom_garage?: string | null
          nombre_avis?: number | null
          note_moyenne?: number | null
          specialites?: string[] | null
        }
        Relationships: []
      }
      marketplace_sellers_public: {
        Row: {
          commune: string | null
          id: number | null
          is_verified: boolean | null
          store_name: string | null
        }
        Insert: {
          commune?: string | null
          id?: number | null
          is_verified?: boolean | null
          store_name?: string | null
        }
        Update: {
          commune?: string | null
          id?: number | null
          is_verified?: boolean | null
          store_name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_order_price: {
        Args: { part_id_input: string; price_input: number }
        Returns: boolean
      }
      check_spare_part_price:
        | {
            Args: { part_id_input: number; price_input: number }
            Returns: boolean
          }
        | {
            Args: { part_id_input: string; price_input: number }
            Returns: boolean
          }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_profile_role_unchanged: {
        Args: {
          _new_role: Database["public"]["Enums"]["app_role"]
          _profile_id: string
        }
        Returns: boolean
      }
      spare_part_belongs_to_seller: {
        Args: { _part_id: number; _seller_id: number }
        Returns: boolean
      }
      spare_parts_order_identity_matches: {
        Args: {
          _buyer_id: string
          _order_id: number
          _part_id: number
          _seller_id: number
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "garage" | "admin" | "seller"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "garage", "admin", "seller"],
    },
  },
} as const
