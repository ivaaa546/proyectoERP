export type SessionUser = {
  id_usuario: number;
  rol: string;
  nombre: string;
};

export function hasRole(userRole: string, allowed: string[]) {
  return allowed.includes(userRole);
}
