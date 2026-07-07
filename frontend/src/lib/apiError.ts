export function getApiError(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } }
  return error.response?.data?.message ?? 'Ocurrio un error, intenta de nuevo'
}
