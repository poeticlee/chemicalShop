// Cloudflare R2 (S3-compatible) — photos, receipt PDFs, CSV exports, backups.
// Phase 1: config + key helpers. Uploads use presigned PUT from server when env is set.
export const r2Enabled = () =>
  !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);
export const r2Key = {
  photo: (itemId: string, name: string) => `photos/${itemId}/${name}`,
  receipt: (saleId: string) => `receipts/${saleId}.json`,
  export: (name: string) => `exports/${new Date().toISOString().slice(0,10)}/${name}`,
  backup: (name: string) => `backups/${name}`,
};
export function r2Status() {
  return { enabled: r2Enabled(), bucket: process.env.R2_BUCKET ?? null };
}
