export type MissionCandidate = { id: string; name: string; countryCode: string; distanceKm: number };

export type MissionQuest = {
  title: string;
  briefing: string;
  outboundObjective: string;
  returnRecord: string;
};

export type MissionCopy = { "pt-BR": MissionQuest; "en-US": MissionQuest };

type QuestSeed = {
  title: string;
  requester: string;
  recipient: string;
  place: string;
  cargo: string;
  issue: string;
  result: string;
  anchors: readonly string[];
};

export type MissionQuestContext = {
  templateCatalogKey: string;
  prompt: { "pt-BR": Omit<QuestSeed, "title" | "anchors">; "en-US": Omit<QuestSeed, "title" | "anchors"> };
  anchors: { "pt-BR": readonly string[]; "en-US": readonly string[] };
  fallback: MissionCopy;
};

const contexts: Record<string, MissionQuestContext> = {
  "job-contact-farol:postalJobs.cargo.lens": createContext(
    ["A lente antes do turno", "Aline, guardiã do farol", "responsável pelo encaixe", "posto do farol", "lente polida", "o mecanismo de sinais perdeu a peça de reposição", "a lente foi encaixada e o mecanismo voltou a responder", ["lente"]],
    ["The lens before the watch", "Aline, the beacon keeper", "the signal steward", "beacon post", "polished lens", "the signal mechanism lost its replacement part", "the lens was fitted and the mechanism answered again", ["lens"]],
  ),
  "job-contact-farol:postalJobs.cargo.signal": createContext(
    ["O painel sem resposta", "Aline, guardiã do farol", "responsável pelo painel", "posto do farol", "discos de sinalização", "uma sequência do painel voltou fora de ordem", "o painel foi reorganizado e passou no teste", ["sinal", "discos"]],
    ["The silent panel", "Aline, the beacon keeper", "the panel steward", "beacon post", "signal discs", "one panel sequence returned out of order", "the panel was sorted and passed its check", ["signal", "discs"]],
  ),
  "job-contact-horta:postalJobs.cargo.seeds": createContext(
    ["A reserva dos canteiros", "Bia, cuidadora da horta", "zelador dos canteiros", "horta comunitária", "caixa de sementes", "a reserva do próximo plantio foi separada do inventário", "a reserva foi registrada no caderno da horta", ["sementes"]],
    ["The beds' reserve", "Bia, the garden keeper", "the bed steward", "community garden", "seed box", "the next-planting reserve was separated from the inventory", "the reserve was entered in the garden ledger", ["seeds"]],
  ),
  "job-contact-horta:postalJobs.cargo.seedlings": createContext(
    ["Mudas sem abrigo", "Bia, cuidadora da horta", "zelador dos canteiros", "horta comunitária", "bandeja de mudas", "as mudas aguardam o abrigo correto antes do transplante", "as mudas foram acomodadas e as fileiras marcadas", ["mudas", "muda"]],
    ["Seedlings without shelter", "Bia, the garden keeper", "the bed steward", "community garden", "tray of seedlings", "the seedlings are waiting for the right shelter before transplanting", "the seedlings were settled and the rows marked", ["seedlings", "seedling"]],
  ),
  "job-contact-estacao:postalJobs.cargo.timetable": createContext(
    ["A tabela trocada", "Caio, organizador da estação", "responsável pelo quadro", "estação postal", "tabela de horários", "duas colunas foram invertidas antes de a tabela chegar ao quadro", "a versão corrigida foi pendurada e a antiga retirada", ["horários", "tabela"]],
    ["The switched timetable", "Caio, the station organizer", "the board steward", "postal station", "timetable", "two columns were reversed before the table reached the board", "the corrected version was hung and the old one removed", ["timetable", "schedule"]],
  ),
  "job-contact-estacao:postalJobs.cargo.signals": createContext(
    ["Sinais fora da ordem", "Caio, organizador da estação", "responsável pelas plataformas", "estação postal", "discos de sinalização", "a caixa das plataformas voltou com a ordem de uso misturada", "os discos foram classificados e o painel conferido", ["sinais", "discos"]],
    ["Signals out of order", "Caio, the station organizer", "the platform steward", "postal station", "signal discs", "the platform box returned with its working order mixed up", "the discs were classified and the board checked", ["signals", "discs"]],
  ),
  "job-contact-biblioteca:postalJobs.cargo.maps": createContext(
    ["A gaveta sem mapas", "Lia, arquivista da biblioteca", "responsável pela mapoteca", "biblioteca postal", "mapas de navegação", "os mapas foram separados da ficha de catalogação", "os mapas voltaram à gaveta com seu selo de consulta", ["mapas", "mapa"]],
    ["The empty map drawer", "Lia, the library archivist", "the map room steward", "postal library", "navigation maps", "the maps were separated from their catalogue card", "the maps returned to the drawer with their reference seal", ["maps", "map"]],
  ),
  "job-contact-biblioteca:postalJobs.cargo.folios": createContext(
    ["Fólios em espera", "Lia, arquivista da biblioteca", "responsável pela mapoteca", "biblioteca postal", "fólios encadernados", "os registros revisados ainda não voltaram ao arquivo", "a sequência do arquivo foi recomposta", ["fólios", "registros"]],
    ["Folios on hold", "Lia, the library archivist", "the map room steward", "postal library", "bound folios", "the reviewed records have not returned to the archive", "the archive sequence was restored", ["folios", "records"]],
  ),
  "job-contact-oficina:postalJobs.cargo.parts": createContext(
    ["A prensa interrompida", "Nilo, mestre da oficina", "mecânico da prensa", "oficina postal", "componentes de prensa", "duas peças de reposição desapareceram da caixa de manutenção", "a prensa voltou a marcar os selos", ["peças", "componentes"]],
    ["The halted press", "Nilo, the workshop master", "the press mechanic", "postal workshop", "press components", "two replacement parts disappeared from the maintenance box", "the press marked stamps again", ["parts", "components"]],
  ),
  "job-contact-oficina:postalJobs.cargo.ink": createContext(
    ["Tinta para a edição", "Nilo, mestre da oficina", "impressor da rota", "oficina postal", "tinta de impressão", "o frasco chegou sem o lacre de controle", "a tinta passou na conferência e o boletim entrou na prensa", ["tinta"]],
    ["Ink for the edition", "Nilo, the workshop master", "the route printer", "postal workshop", "printing ink", "the bottle arrived without its control seal", "the ink passed inspection and the bulletin entered the press", ["ink"]],
  ),
  "job-contact-observatorio:postalJobs.cargo.charts": createContext(
    ["Cartas para a vigília", "Mara, vigia do observatório", "responsável pela cúpula", "observatório postal", "cartas celestes", "uma anotação antiga continua aparecendo no caderno de observação", "as cartas revisadas foram colocadas na mesa da cúpula", ["cartas celestes", "mapas do céu"]],
    ["Charts for the watch", "Mara, the observatory watcher", "the dome steward", "postal observatory", "star charts", "an old note keeps appearing in the observation ledger", "the revised charts were placed on the dome table", ["star charts", "sky maps"]],
  ),
  "job-contact-observatorio:postalJobs.cargo.lenses": createContext(
    ["A calibração perdida", "Mara, vigia do observatório", "responsável pela cúpula", "observatório postal", "lentes calibradas", "as lentes perderam a marca de conferência", "a montagem foi calibrada e a vigília liberada", ["lentes"]],
    ["The lost calibration", "Mara, the observatory watcher", "the dome steward", "postal observatory", "calibrated lenses", "the lenses lost their check mark", "the assembly was calibrated and the watch cleared", ["lenses"]],
  ),
};

function createContext(pt: readonly [string, string, string, string, string, string, string, readonly string[]], en: readonly [string, string, string, string, string, string, string, readonly string[]]): MissionQuestContext {
  const ptSeed = seedFrom(pt);
  const enSeed = seedFrom(en);
  return {
    templateCatalogKey: "",
    prompt: { "pt-BR": withoutTitle(ptSeed), "en-US": withoutTitle(enSeed) },
    anchors: { "pt-BR": ptSeed.anchors, "en-US": enSeed.anchors },
    fallback: {
      "pt-BR": fallbackFrom(ptSeed, "pt-BR"),
      "en-US": fallbackFrom(enSeed, "en-US"),
    },
  };
}

function seedFrom([title, requester, recipient, place, cargo, issue, result, anchors]: readonly [string, string, string, string, string, string, string, readonly string[]]): QuestSeed {
  return { title, requester, recipient, place, cargo, issue, result, anchors };
}

function withoutTitle({ title: _title, anchors: _anchors, ...prompt }: QuestSeed) {
  return prompt;
}

function fallbackFrom(seed: QuestSeed, locale: "pt-BR" | "en-US"): MissionQuest {
  if (locale === "pt-BR") return {
    title: seed.title,
    briefing: `${seed.requester} pediu ajuda: ${seed.issue}. A ${seed.cargo} foi separada no ${seed.place}.`,
    outboundObjective: `Entregue a ${seed.cargo} ao ${seed.recipient} em {destination} para resolver a pendência.`,
    returnRecord: `${seed.result}. Traga a contramarca dessa conclusão de volta ao ninho.`,
  };
  return {
    title: seed.title,
    briefing: `${seed.requester} needs help: ${seed.issue}. The ${seed.cargo} was set aside at the ${seed.place}.`,
    outboundObjective: `Deliver the ${seed.cargo} to ${seed.recipient} in {destination} to resolve the pending work.`,
    returnRecord: `${seed.result}. Carry the countermark for that outcome back to the nest.`,
  };
}

const genericContext = createContext(
  ["O registro pendente", "A central postal", "responsável pelo arquivo", "posto postal", "carga selada", "um registro de serviço ficou sem confirmação", "o registro foi confirmado e arquivado", ["carga"]],
  ["The pending record", "The postal office", "the archive steward", "postal post", "sealed cargo", "a service record is missing its confirmation", "the record was confirmed and archived", ["cargo"]],
);

export function getMissionQuestContext(templateCatalogKey: string, contactCatalogKey: string, cargoKey: string): MissionQuestContext {
  const context = contexts[`${contactCatalogKey}:${cargoKey}`] ?? genericContext;
  return { ...context, templateCatalogKey };
}

export function fallbackMissionCopy(context: MissionQuestContext, candidate: MissionCandidate): MissionCopy {
  return {
    "pt-BR": replaceDestination(context.fallback["pt-BR"], candidate.name),
    "en-US": replaceDestination(context.fallback["en-US"], candidate.name),
  };
}

function replaceDestination(copy: MissionQuest, destination: string): MissionQuest {
  return {
    title: copy.title.replaceAll("{destination}", destination),
    briefing: copy.briefing.replaceAll("{destination}", destination),
    outboundObjective: copy.outboundObjective.replaceAll("{destination}", destination),
    returnRecord: copy.returnRecord.replaceAll("{destination}", destination),
  };
}

function nonEmptyString(value: unknown, min: number, max: number) {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function isQuestCopy(value: unknown, anchors: readonly string[]): value is MissionQuest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const copy = value as Partial<MissionQuest>;
  if (!nonEmptyString(copy.title, 3, 90) || !nonEmptyString(copy.briefing, 40, 360)
    || !nonEmptyString(copy.outboundObjective, 24, 240) || !nonEmptyString(copy.returnRecord, 24, 240)) return false;
  const narrative = `${copy.briefing} ${copy.outboundObjective} ${copy.returnRecord}`.toLocaleLowerCase();
  if (/(paisagens?|tranquil[oa]|seren[oa]|voo sereno|peaceful|landscapes?|calm (flight|journey|course)|along the (quiet )?road)/.test(narrative)) return false;
  return anchors.some((anchor) => narrative.includes(anchor.toLocaleLowerCase()));
}

export function parseMissionOutput(value: unknown, candidates: readonly MissionCandidate[], context: MissionQuestContext): { candidate: MissionCandidate; copy: MissionCopy } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidateId = (value as { candidateId?: unknown }).candidateId;
  const candidate = typeof candidateId === "string" ? candidates.find((item) => item.id === candidateId) : undefined;
  const copy = value as Partial<MissionCopy>;
  if (!candidate || !isQuestCopy(copy["pt-BR"], context.anchors["pt-BR"])
    || !isQuestCopy(copy["en-US"], context.anchors["en-US"])) return null;
  return {
    candidate,
    copy: {
      "pt-BR": {
        title: copy["pt-BR"].title.trim(), briefing: copy["pt-BR"].briefing.trim(),
        outboundObjective: copy["pt-BR"].outboundObjective.trim(), returnRecord: copy["pt-BR"].returnRecord.trim(),
      },
      "en-US": {
        title: copy["en-US"].title.trim(), briefing: copy["en-US"].briefing.trim(),
        outboundObjective: copy["en-US"].outboundObjective.trim(), returnRecord: copy["en-US"].returnRecord.trim(),
      },
    },
  };
}
