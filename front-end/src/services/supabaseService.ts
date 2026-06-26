import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Este módulo concentra la conexión con Supabase para no dispersar credenciales ni configuración.
if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('Faltan REACT_APP_SUPABASE_URL o REACT_APP_SUPABASE_ANON_KEY en el entorno.');
}

// Se exporta una única instancia compartida para usarla desde auth, consultas y futuras mutaciones.
export const supabase =
	supabaseUrl && supabaseAnonKey
		? createClient(supabaseUrl, supabaseAnonKey)
		: null;
