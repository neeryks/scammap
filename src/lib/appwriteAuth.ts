import { Client, Account } from 'node-appwrite'

export async function validateAppwriteJWT(jwt: string): Promise<{ userId: string } | null> {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setJWT(jwt)
  const account = new Account(client)
  try {
    const me = await account.get()
    return { userId: me.$id }
  } catch {
    return null
  }
}
