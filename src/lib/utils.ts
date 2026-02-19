import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function createNotification(message: string, type: string, actorId?: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([
        { 
          message, 
          type, 
          actor_id: actorId,
          is_read: false 
        }
      ]);
    
    if (error) console.error("Error creating notification:", error);
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
}
