import type { TranslationDictionary } from "../types";

export const ptBR = {
  app: {
    title: "DUIF",
  },
  common: {
    loading: "Carregando",
    unavailable: "Indisponível",
  },
  units: {
    kilometers: "km",
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
    xp: "XP",
    attributes: "Atributos",
    speed: "Velocidade",
    stamina: "Resistência",
    orientation: "Orientação",
    luck: "Sorte",
    specialTrait: "Traço Especial",
    equipment: "Equipamento",
    equipped: "Equipado",
    notEquipped: "Guardado",
    traveling: "Em Viagem",
    skills: "Habilidades",
    train: "Treinar",
    viewTrip: "Ver Viagem",
    customization: "Visual",
    currentDelivery: "Entrega Atual",
    noDeliveryTitle: "No ninho",
    noDeliveryDescription: "Este mascote está disponível para a próxima entrega.",
    route: "Rota",
    origin: "Origem",
    destination: "Destino",
    distance: "Distância",
    status: "Status",
    visualPreview: "Prévia visual",
    selectedMascot: "Mascote selecionado",
    chooseMascot: "Escolher mascote",
    bottomNav: "Navegação principal",
  },
  species: {
    carrierPigeon: "Pombo-correio",
    messengerFalcon: "Falcão-mensageiro",
    mailDuck: "Pato-correio",
  },
  traits: {
    steadyRoute: {
      name: "Rota Segura",
      description: "Mantém entregas estáveis e melhora recompensas em rotas longas.",
    },
    directFlight: {
      name: "Voo Direto",
      description: "Reduz desvios e favorece retornos rápidos depois da entrega.",
    },
    curiousFinder: {
      name: "Achador Curioso",
      description: "Aumenta a chance de encontrar lembranças e itens raros pelo caminho.",
    },
  },
  equipment: {
    rarity: {
      common: "Comum",
      uncommon: "Incomum",
      rare: "Raro",
    },
    canvasPostalBag: {
      name: "Bolsa Postal de Lona",
      description: "Uma bolsa simples e confiável para cartas importantes.",
    },
    blueRouteScarf: {
      name: "Cachecol de Rota Azul",
      description: "Marca caminhos conhecidos com um toque de cor postal.",
    },
    flightGoggles: {
      name: "Óculos de Voo",
      description: "Ajuda a encarar vento forte sem perder a direção.",
    },
    urgentBadge: {
      name: "Insígnia Urgente",
      description: "Um selo vermelho para entregas que não podem esperar.",
    },
    travelCap: {
      name: "Boné de Viagem",
      description: "Protege em rotas curtas e deixa o visual mais preparado.",
    },
    featherCharm: {
      name: "Amuleto de Pena",
      description: "Um pequeno encanto para encontrar surpresas no caminho.",
    },
    smallSatchel: {
      name: "Bornal Pequeno",
      description: "Cabe o essencial para viagens curiosas e leves.",
    },
  },
  skills: {
    longRoute: {
      name: "Rota Longa",
      description: "Mantém boa orientação em distâncias maiores.",
    },
    softLanding: {
      name: "Pouso Suave",
      description: "Reduz desgaste ao terminar uma entrega.",
    },
    quickDispatch: {
      name: "Partida Rápida",
      description: "Sai do ninho com agilidade em entregas urgentes.",
    },
    crosswindInstinct: {
      name: "Instinto de Vento Cruzado",
      description: "Lida melhor com mudanças repentinas na rota.",
    },
    shinyThing: {
      name: "Coisa Brilhante",
      description: "Percebe pequenos objetos colecionáveis durante a viagem.",
    },
    happyDetour: {
      name: "Desvio Alegre",
      description: "Transforma pequenos atrasos em chance de descoberta.",
    },
  },
  delivery: {
    status: {
      available: "Disponível",
      preparing: "Preparando",
      outbound: "Indo",
      delivered: "Entregue",
      returning: "Voltando",
      returned: "Retornou",
      completed: "Concluída",
    },
  },
  locations: {
    saoPaulo: "São Paulo",
    lisbon: "Lisboa",
  },
  appearance: {
    nuvemPortrait: "Retrato temporário de Nuvem",
    trovaoPortrait: "Retrato temporário de Trovão",
    pipocaPortrait: "Retrato temporário de Pipoca",
  },
} satisfies TranslationDictionary;
