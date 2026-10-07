import { store } from '../store/index.js';
import { SafeUser } from '../types/index.js';

export class UsersService {
  static listUsers(): SafeUser[] {
    return store.listUsers();
  }
}
