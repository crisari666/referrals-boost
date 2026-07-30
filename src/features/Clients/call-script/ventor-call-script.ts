export type CallStageId =
  | 'apertura'
  | 'acuerdo_previo'
  | 'diagnostico'
  | 'pildora'
  | 'cierre_agenda'
  | 'confirmacion_wa';

export type ProjectPillId =
  | 'valle_del_sol'
  | 'villas_del_olimpo'
  | 'parque_del_agua'
  | 'riviera_beach_house'
  | 'barrido_portafolio';

export type CallObjectionId =
  | 'no_recuerda'
  | 'no_da_presupuesto'
  | 'no_tengo_tiempo'
  | 'enviame_info'
  | 'hablo_con_pareja'
  | 'dime_el_precio'
  | 'hoy_esa_hora_no';

export type CallStageScript = {
  readonly id: CallStageId;
  readonly titleKey: string;
  readonly promptKeys: readonly string[];
  readonly tipKeys?: readonly string[];
};

export type ProjectPillScript = {
  readonly id: ProjectPillId;
  readonly labelKey: string;
  readonly replyKeys: readonly string[];
};

export type CallObjectionScript = {
  readonly id: CallObjectionId;
  readonly labelKey: string;
  readonly replyKeys: readonly string[];
};

export const CALL_SCRIPT_STAGES: readonly CallStageScript[] = [
  {
    id: 'apertura',
    titleKey: 'callScript.stages.apertura.title',
    promptKeys: ['callScript.stages.apertura.prompt'],
    tipKeys: ['callScript.stages.apertura.tip'],
  },
  {
    id: 'acuerdo_previo',
    titleKey: 'callScript.stages.acuerdo_previo.title',
    promptKeys: ['callScript.stages.acuerdo_previo.prompt'],
    tipKeys: ['callScript.stages.acuerdo_previo.tip'],
  },
  {
    id: 'diagnostico',
    titleKey: 'callScript.stages.diagnostico.title',
    promptKeys: [
      'callScript.stages.diagnostico.prompt1',
      'callScript.stages.diagnostico.prompt2',
    ],
    tipKeys: ['callScript.stages.diagnostico.tip'],
  },
  {
    id: 'pildora',
    titleKey: 'callScript.stages.pildora.title',
    promptKeys: ['callScript.stages.pildora.prompt'],
    tipKeys: ['callScript.stages.pildora.tip'],
  },
  {
    id: 'cierre_agenda',
    titleKey: 'callScript.stages.cierre_agenda.title',
    promptKeys: [
      'callScript.stages.cierre_agenda.prompt1',
      'callScript.stages.cierre_agenda.prompt2',
    ],
    tipKeys: ['callScript.stages.cierre_agenda.tip'],
  },
  {
    id: 'confirmacion_wa',
    titleKey: 'callScript.stages.confirmacion_wa.title',
    promptKeys: [
      'callScript.stages.confirmacion_wa.prompt1',
      'callScript.stages.confirmacion_wa.prompt2',
      'callScript.stages.confirmacion_wa.prompt3',
    ],
  },
] as const;

/** Named project children under Fase 4 (Píldora). Excludes portfolio sweep. */
export const PILDORA_PROJECT_BRANCH_IDS = [
  'valle_del_sol',
  'villas_del_olimpo',
  'parque_del_agua',
  'riviera_beach_house',
] as const;

export type PildoraProjectBranchId = (typeof PILDORA_PROJECT_BRANCH_IDS)[number];

export const PROJECT_PILLS: readonly ProjectPillScript[] = [
  {
    id: 'valle_del_sol',
    labelKey: 'callScript.pills.valle_del_sol.label',
    replyKeys: ['callScript.pills.valle_del_sol.reply'],
  },
  {
    id: 'villas_del_olimpo',
    labelKey: 'callScript.pills.villas_del_olimpo.label',
    replyKeys: ['callScript.pills.villas_del_olimpo.reply'],
  },
  {
    id: 'parque_del_agua',
    labelKey: 'callScript.pills.parque_del_agua.label',
    replyKeys: ['callScript.pills.parque_del_agua.reply'],
  },
  {
    id: 'riviera_beach_house',
    labelKey: 'callScript.pills.riviera_beach_house.label',
    replyKeys: ['callScript.pills.riviera_beach_house.reply'],
  },
  {
    id: 'barrido_portafolio',
    labelKey: 'callScript.pills.barrido_portafolio.label',
    replyKeys: ['callScript.pills.barrido_portafolio.reply'],
  },
] as const;

export const PRIMARY_PROJECT_PILLS: readonly ProjectPillScript[] = PROJECT_PILLS.filter(
  (pill) =>
    (PILDORA_PROJECT_BRANCH_IDS as readonly string[]).includes(pill.id),
);

export const SECONDARY_PROJECT_PILLS: readonly ProjectPillScript[] = PROJECT_PILLS.filter(
  (pill) => pill.id === 'barrido_portafolio',
);

export function isPildoraProjectBranchId(value: string): value is PildoraProjectBranchId {
  return (PILDORA_PROJECT_BRANCH_IDS as readonly string[]).includes(value);
}

export const CALL_OBJECTIONS: readonly CallObjectionScript[] = [
  {
    id: 'no_recuerda',
    labelKey: 'callScript.objections.no_recuerda.label',
    replyKeys: ['callScript.objections.no_recuerda.reply1'],
  },
  {
    id: 'no_da_presupuesto',
    labelKey: 'callScript.objections.no_da_presupuesto.label',
    replyKeys: ['callScript.objections.no_da_presupuesto.reply1'],
  },
  {
    id: 'no_tengo_tiempo',
    labelKey: 'callScript.objections.no_tengo_tiempo.label',
    replyKeys: [
      'callScript.objections.no_tengo_tiempo.reply1',
      'callScript.objections.no_tengo_tiempo.reply2',
    ],
  },
  {
    id: 'enviame_info',
    labelKey: 'callScript.objections.enviame_info.label',
    replyKeys: [
      'callScript.objections.enviame_info.reply1',
      'callScript.objections.enviame_info.reply2',
    ],
  },
  {
    id: 'hablo_con_pareja',
    labelKey: 'callScript.objections.hablo_con_pareja.label',
    replyKeys: ['callScript.objections.hablo_con_pareja.reply1'],
  },
  {
    id: 'dime_el_precio',
    labelKey: 'callScript.objections.dime_el_precio.label',
    replyKeys: ['callScript.objections.dime_el_precio.reply1'],
  },
  {
    id: 'hoy_esa_hora_no',
    labelKey: 'callScript.objections.hoy_esa_hora_no.label',
    replyKeys: [
      'callScript.objections.hoy_esa_hora_no.reply1',
      'callScript.objections.hoy_esa_hora_no.reply2',
    ],
  },
] as const;

export const DEFAULT_CALL_STAGE_ID: CallStageId = 'apertura';

export function findCallStage(id: CallStageId | null): CallStageScript | undefined {
  if (!id) return undefined;
  return CALL_SCRIPT_STAGES.find((s) => s.id === id);
}

export function findCallObjection(
  id: CallObjectionId | null,
): CallObjectionScript | undefined {
  if (!id) return undefined;
  return CALL_OBJECTIONS.find((o) => o.id === id);
}

export function findProjectPill(id: ProjectPillId | null): ProjectPillScript | undefined {
  if (!id) return undefined;
  return PROJECT_PILLS.find((p) => p.id === id);
}

export function isCallStageId(value: string): value is CallStageId {
  return CALL_SCRIPT_STAGES.some((s) => s.id === value);
}

export function isCallObjectionId(value: string): value is CallObjectionId {
  return CALL_OBJECTIONS.some((o) => o.id === value);
}

export function isProjectPillId(value: string): value is ProjectPillId {
  return PROJECT_PILLS.some((p) => p.id === value);
}
