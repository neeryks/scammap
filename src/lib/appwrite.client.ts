import { Client, Account, ID, OAuthProvider } from 'appwrite'

let accountInstance: Account | null = null

function ensureClient(): Account {
  if (!accountInstance) {
    const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? '') as string
    const project = (process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? '') as string
    const client = new Client().setEndpoint(endpoint).setProject(project)
    accountInstance = new Account(client)
  }
  return accountInstance
}

export const account = ensureClient()
export { ID, OAuthProvider }
