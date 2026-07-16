import type { User } from '../../logic-bussines-layer/domain/models/user.model';
import type { FirebaseUserDto } from '../DTOs/auth.dto';

export class AuthMapper {
  static toDomain(firebaseUserDto: FirebaseUserDto): User {
    const { user } = firebaseUserDto;
    
    // Intentamos separar el displayName en nombre y apellido
    const nameParts = user.displayName ? user.displayName.split(' ') : ['Dueño', 'Bagui'];
    const nombre = nameParts[0];
    const apellido = nameParts.slice(1).join(' ') || '';

    return {
      id: user.uid,
      email: user.email || '',
      nombre: nombre,
      apellido: apellido
    };
  }
}