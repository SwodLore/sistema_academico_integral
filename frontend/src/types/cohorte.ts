export interface PuntoEvolucion {
  periodo: string
  promedio: number | null
  estudiantes: number
}

export interface Cohorte {
  especialidadId: number
  especialidad: string
  anioIngreso: number
  ingresantes: number
  activos: number
  egresados: number
  inactivos: number
  tasaRetencion: number
  creditosCarrera: number
  promedioCreditosAprobados: number
  evolucion: PuntoEvolucion[]
}
