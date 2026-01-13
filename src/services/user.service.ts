import { User } from "../models";
import type { CreateUserInput, UserUpdateInput } from "../validators";

export class UserService {
  async getUsers() {
    return User.find();
  }

  async getUserById(id: string) {
    return await User.findById(id);
  }

  async createUser(user: CreateUserInput) {
    return await User.create(user);
  }

  async updateUser(id: string, user: UserUpdateInput) {
    return await User.findByIdAndUpdate(id, user);
  }

  async deleteUser(id: string) {
    return await User.findByIdAndDelete(id);
  }
}
