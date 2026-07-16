// Representación de los datos que nos devuelve Firebase (UserCredential), adaptados a nuestro contexto de transferencia


import type { UserCredential } from 'firebase/auth';

export type FirebaseUserDto = UserCredential;