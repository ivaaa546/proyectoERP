export type ApiResult<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

export type LoginResult = {
  id_usuario: number;
  nombre: string;
  id_rol: number;
  rol: string;
  estado: string;
};
