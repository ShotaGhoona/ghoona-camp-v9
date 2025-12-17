import type { User } from './types';

/**
 * Userエンティティクラス
 * ドメインロジックをカプセル化
 */
export class UserEntity implements User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  discord_id?: string;
  is_active: boolean;

  constructor(data: User) {
    this.id = data.id;
    this.email = data.email;
    this.username = data.username;
    this.avatar_url = data.avatar_url;
    this.discord_id = data.discord_id;
    this.is_active = data.is_active;
  }

  // ユーザー名の取得
  getDisplayName(): string {
    return this.username || this.email || `User ${this.id}`;
  }

  // DTOからエンティティへの変換
  static fromDTO(dto: User): UserEntity {
    return new UserEntity(dto);
  }

  // エンティティからDTOへの変換
  toDTO(): User {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      avatar_url: this.avatar_url,
      discord_id: this.discord_id,
      is_active: this.is_active,
    };
  }
}
