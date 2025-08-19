import { Client, Databases, ID, Query, Users } from 'node-appwrite'

export function getServerClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!)
  return client
}

export function getDatabases() {
  return new Databases(getServerClient())
}

export function getUsers() {
  return new Users(getServerClient())
}

export { ID, Query }
