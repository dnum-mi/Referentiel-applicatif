import type { User } from '../models/user'
import requests from './xhr-client'

const Users = {
  createOrUpdateUser: async (keycloakId: string, email: string) => {
    console.log(keycloakId)
    const response = await requests.post<User>('/users', { keycloakId, email })
    console.log({ 'response:': response })
    return response
  },
}

export default Users
