import { supabase } from '@/integrations/supabase/client';

const SIGNED_URL_TTL_SECONDS = 60 * 60;

function isStorageUrl(value: string | null | undefined) {
  return typeof value === 'string' && value.includes('/storage/v1/object/');
}

function extractVehiclePhotoPath(url: string | null | undefined) {
  if (!isStorageUrl(url)) return null;

  const marker = '/vehicle-photos/';
  const start = url!.indexOf(marker);
  if (start === -1) return null;

  const pathWithQuery = url!.slice(start + marker.length);
  return pathWithQuery.split('?')[0] || null;
}

async function createSignedVehiclePhotoUrl(path: string | null | undefined) {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from('vehicle-photos')
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error) throw new Error(`Signature photo : ${error.message}`);
  return data?.signedUrl ?? null;
}

export async function resolveVehiclePhotoUrl(photoUrl: string | null | undefined) {
  if (!photoUrl) return null;

  const storagePath = extractVehiclePhotoPath(photoUrl);
  if (!storagePath) return photoUrl;

  return createSignedVehiclePhotoUrl(storagePath);
}

export async function resolveVehiclePhotos<T extends { photo_vehicule_url?: string | null }>(vehicles: T[]) {
  const resolvedUrls = await Promise.all(
    vehicles.map((vehicle) => resolveVehiclePhotoUrl(vehicle.photo_vehicule_url ?? null))
  );

  return vehicles.map((vehicle, index) => ({
    ...vehicle,
    photo_vehicule_url: resolvedUrls[index] ?? vehicle.photo_vehicule_url ?? null,
  }));
}

// ── 1. Lire tous les véhicules du user connecté ──────────────
export async function getMyVehicles(userId: string) {
  const { data, error } = await supabase
    .from('vehicules')
    .select(`
      *,
      alertes(id, type_alerte, niveau_urgence, km_declencheur, est_resolue)
    `)
    .eq('proprietaire_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Fetch véhicules : ${error.message}`);
  return resolveVehiclePhotos(data ?? []);
}

// ── 2. Lire UN véhicule avec tout son historique ─────────────
export async function getVehicleWithHistory(vehicleId: string) {
  const { data, error } = await supabase
    .from('vehicules')
    .select(`
      *,
      alertes(*),
      interventions(
        *,
        garage:garages(id, nom_garage, commune, est_certifie)
      )
    `)
    .eq('id', vehicleId)
    .order('date_intervention', {
      ascending: false,
      referencedTable: 'interventions',
    })
    .single();

  if (error) throw new Error(`Fetch véhicule : ${error.message}`);
  return {
    ...data,
    photo_vehicule_url: await resolveVehiclePhotoUrl(data.photo_vehicule_url),
  };
}

// ── 3. Créer un véhicule ─────────────────────────────────────
export async function createVehicle(
  userId: string,
  formData: {
    marque: string;
    modele: string;
    plaque_immatriculation: string;
    annee?: number;
    couleur?: string;
    kilometrage_actuel?: number;
  }
) {
  const { data, error } = await supabase
    .from('vehicules')
    .insert({ ...formData, proprietaire_id: userId })
    .select()
    .single();

  if (error) throw new Error(`Création véhicule : ${error.message}`);
  return data;
}

// ── 4. Mettre à jour un véhicule ─────────────────────────────
export async function updateVehicle(
  vehicleId: string,
  userId: string,
  updates: {
    marque?: string;
    modele?: string;
    plaque_immatriculation?: string;
    annee?: number | null;
    couleur?: string | null;
    kilometrage_actuel?: number | null;
    photo_vehicule_url?: string | null;
  }
) {
  const { error } = await supabase
    .from('vehicules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', vehicleId)
    .eq('proprietaire_id', userId);

  if (error) throw new Error(`Mise à jour véhicule : ${error.message}`);
}

// ── 5. Supprimer un véhicule ─────────────────────────────────
export async function deleteVehicle(vehicleId: string, userId: string) {
  const { error } = await supabase
    .from('vehicules')
    .delete()
    .eq('id', vehicleId)
    .eq('proprietaire_id', userId);

  if (error) throw new Error(`Suppression véhicule : ${error.message}`);
}

// ── 6. Upload photo vers Supabase Storage ────────────────────
export async function uploadVehiclePhoto(
  vehicleId: string,
  ownerId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${ownerId}/${vehicleId}/cover.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('vehicle-photos')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw new Error(`Upload photo : ${uploadError.message}`);

  const signedUrl = await createSignedVehiclePhotoUrl(path);
  if (!signedUrl) throw new Error('Signature photo : URL introuvable');

  return signedUrl;
}
