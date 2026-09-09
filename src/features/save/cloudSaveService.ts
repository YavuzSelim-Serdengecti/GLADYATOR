import { supabase } from "../../lib/supabase";
import { GameSaveData } from "./saveSystem";

export type CloudSaveRow = {
  id: string;
  user_id: string;
  save_data: GameSaveData;
  created_at: string;
  updated_at: string;
};

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Bulut kayıt için hesabına giriş yapmalısın.");
  }

  return user.id;
}

export async function uploadCloudSave(
  saveData: GameSaveData,
): Promise<CloudSaveRow> {
  const userId = await getAuthenticatedUserId();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("game_saves")
    .upsert(
      {
        user_id: userId,
        save_data: saveData,
        updated_at: now,
      },
      {
        onConflict: "user_id",
      },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as CloudSaveRow;
}

export async function downloadCloudSave(): Promise<CloudSaveRow | null> {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("game_saves")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as CloudSaveRow | null;
}

export async function hasCloudSave(): Promise<boolean> {
  const cloudSave = await downloadCloudSave();
  return cloudSave !== null;
}

export async function deleteCloudSave(): Promise<void> {
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase
    .from("game_saves")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
