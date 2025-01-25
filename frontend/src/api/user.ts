import type { User } from "../models/user";
import requests from "./xhr-client";

const Users = {
  getUserById: async (id: string): Promise<User> => {
    const response = await requests.get<User>(`/users/${id}`);
    return response;
  },
};

export default Users;
