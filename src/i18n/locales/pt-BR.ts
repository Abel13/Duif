import type { TranslationDictionary } from "../types";

export const ptBR = {
  app: {
    title: "DUIF",
  },
  common: {
    loading: "Carregando",
    unavailable: "Indisponível",
  },
  home: {
    iconAlt: "Ícone do DUIF",
    eyebrow: "Protótipo postal",
    title: "DUIF",
    subtitle:
      "Um caderno postal para mascotes mensageiros, entregas afetivas e pequenas descobertas pelo mundo.",
    noteLabel: "Nota inicial do projeto",
    noteTitle: "Fundação pronta para começar",
    noteBody:
      "A primeira tela real será construída depois da base visual, dos componentes reutilizáveis e dos dados mockados.",
    demo: {
      actionsLabel: "Ações de demonstração",
      primaryAction: "Preparar envio",
      secondaryAction: "Ver caderno",
      tabsLabel: "Navegação de demonstração",
      cardsLabel: "Cartões colecionáveis de demonstração",
      firstCardLabel: "Selo raro",
      firstCardTitle: "Carta de boas-vindas",
      firstCardDescription:
        "Um cartão de papel para validar o estilo colecionável antes da tela do mascote.",
      firstCardMeta: "Base visual",
      secondCardLabel: "Item comum",
      secondCardTitle: "Etiqueta de rota",
      secondCardDescription:
        "Um marcador postal simples para testar cards, estados e textos longos no mobile.",
      secondCardMeta: "Mock inicial",
    },
  },
  navigation: {
    nest: "Ninho",
    letters: "Cartas",
    map: "Mapa",
    friends: "Amigos",
    shop: "Loja",
  },
  mascot: {
    myMascots: "Meus Mascotes",
    level: "Nível",
    attributes: "Atributos",
    speed: "Velocidade",
    stamina: "Resistência",
    orientation: "Orientação",
    luck: "Sorte",
    specialTrait: "Traço Especial",
    equipment: "Equipamento",
    traveling: "Em Viagem",
    skills: "Habilidades",
    train: "Treinar",
    viewTrip: "Ver Viagem",
  },
} satisfies TranslationDictionary;
