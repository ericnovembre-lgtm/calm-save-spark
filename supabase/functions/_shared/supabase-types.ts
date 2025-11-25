// Minimal type stubs to avoid JSR dependency resolution issues
export type SupabaseClient = any;
export const createClient = (url: string, key: string): any => {
  throw new Error('Use direct imports from esm.sh in each function');
};
