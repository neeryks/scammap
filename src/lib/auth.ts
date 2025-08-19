export async function requireAuthOrAnon(): Promise<{ userId?: string }> {
  if (process.env.APPWRITE_ENABLED !== 'true') return {}
  // TODO: Implement Appwrite session validation via cookies or JWT
  return {}
}
