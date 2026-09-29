export type ChapterId =
  | 'gargantua'
  | 'origin'
  | 'transit'
  | 'mission-adaro'
  | 'mission-pertamina'
  | 'mission-mckinsey'
  | 'mission-eth'
  | 'fleet'
  | 'systems'
  | 'signals'
  | 'horizon'

export interface Chapter {
  readonly id: ChapterId
  /** Short uppercase label shown in the top-center chapter indicator. */
  readonly label: string
  /** Scroll length of the chapter, in viewport-height units (100 = one screen). */
  readonly heightVh: number
  /** Telemetry lines typed out in the bottom-right HUD. */
  readonly hud: readonly string[]
}

export interface Stat {
  readonly value: string
  readonly label: string
}

export interface SpecRow {
  readonly key: string
  readonly value: string
}

export type PlanetKind = 'desert' | 'ocean' | 'ice' | 'moon'

export interface Mission {
  readonly chapterId: ChapterId
  readonly code: string
  readonly planet: PlanetKind
  readonly company: string
  readonly role: string
  readonly period: string
  readonly title: string
  readonly body: string
  readonly points: readonly string[]
  readonly stats: readonly Stat[]
  readonly specs: readonly SpecRow[]
  /** Labels drawn as detection boxes over the scene. */
  readonly detections: readonly string[]
}

export interface FleetRow {
  readonly org: string
  readonly role: string
  readonly period: string
  readonly detail: string
}

export interface Project {
  readonly name: string
  readonly kind: string
  readonly stack: string
  readonly href?: string
}

export interface Achievement {
  readonly rank: string
  readonly event: string
}

export interface CertificationGroup {
  readonly issuer: string
  readonly items: readonly string[]
}
