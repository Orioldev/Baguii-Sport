import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../API/firebase.config';
import type { AuthRepository } from '../../logic-bussines-layer/domain/repositories/auth.repository';
import type { User } from '../../logic-bussines-layer/domain/models/user.model';
import type { LoginCredentials } from '../../logic-bussines-layer/application/uses-cases/login.use-case';
import { AuthMapper } from '../mappers/auth.mappers';

// Implementación concreta que cumple el contrato definido en la lógica de negocio consumiendo Firebase.

export class AuthRepositoryImpl implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // Intentar iniciar sesión en Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Mapear y retornar hacia la capa superior
      return AuthMapper.toDomain(userCredential);
      
    } catch (error: any) {
      // Gestión e interpretación de errores de red/Firebase para la UI
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('El correo electrónico o la contraseña son incorrectos.');
      }
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Error de conexión. Verifica tu internet.');
      }
      throw new Error('Ocurrió un error inesperado al iniciar sesión.');
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('El correo electrónico no está registrado.');
      }
      throw new Error('No se pudo enviar el correo de recuperación.');
    }
  }

  onAuthStateChanged(onUserChange: (user: any) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Mapeas el usuario de Firebase a tu modelo de Dominio
        onUserChange({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          // agrega los campos de tu user.model
        });
      } else {
        onUserChange(null);
      }
    });
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Error al cerrar la sesión en el servidor. Inténtalo de nuevo.');
    }
  }

  // 🟢 Nuevo: reautenticación con la contraseña actual.
  // Firebase no ofrece un "solo verificar" sin efectos: este es el mecanismo real,
  // y de paso deja la sesión "reciente" para que updatePassword no sea rechazado.
  async reauthenticate(email: string, currentPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No hay una sesión activa. Vuelve a iniciar sesión.');
    }

    try {
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(user, credential);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Contraseña incorrecta. Inténtalo de nuevo.');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos. Espera unos minutos e inténtalo de nuevo.');
      }
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Error de conexión. Verifica tu internet.');
      }
      throw new Error('No se pudo verificar la contraseña. Inténtalo de nuevo.');
    }
  }

  // 🟢 Nuevo: cambia la contraseña de autenticación del usuario ya autenticado.
  async changePassword(newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No hay una sesión activa. Vuelve a iniciar sesión.');
    }

    try {
      await updatePassword(user, newPassword);
    } catch (error: any) {
      if (error.code === 'auth/weak-password') {
        throw new Error('La nueva contraseña es demasiado débil.');
      }
      if (error.code === 'auth/requires-recent-login') {
        // La reautenticación tiene una ventana de vigencia limitada por Firebase.
        throw new Error('Tu verificación expiró. Vuelve a verificar tu contraseña actual e inténtalo de nuevo.');
      }
      throw new Error('No se pudo actualizar la contraseña. Inténtalo de nuevo.');
    }
  }
}