import type { TranslationDictionary } from "../types";

export const ptBR = {
  functionalEquipment: {
    shopTitle:"Equipamentos funcionais",shopDescription:"Prepare cada mascote para carga e condições da rota.",balance:"Saldo de Sementes",buy:"Comprar",buying:"Comprando",purchaseError:"Não foi possível concluir a compra.",
    loadoutDescription:"Escolha uma mochila e um utilitário para esta rota.",lockedDuringTravel:"Os equipamentos ficam protegidos enquanto o mascote possui uma entrega aberta.",backpackSlot:"Mochila",utilitySlot:"Utilitário",none:"Nenhum",saveEquipment:"Salvar equipamentos",chooseEquipment:"Toque para escolher",choose:"Escolher",change:"Trocar",locked:"Bloqueado em viagem",loadout:"Equipamentos do mascote",chooseBackpack:"Escolher mochila",chooseUtility:"Escolher utilitário",closePicker:"Fechar seleção",removeEquipment:"Deixar este espaço vazio",assignedTo:"Com {name}",anotherMascot:"outro mascote",noOwnedEquipment:"Você ainda não possui equipamentos deste tipo.",cargo:"Carga",volumeMarks:"volumes disponíveis",noProtection:"Sem proteção",conditions:{rain:"Chuva",night:"Noite",wind:"Vento"},hazards:{wet:"Chuva e umidade",visibility:"Baixa visibilidade",night:"Noite",wind:"Vento",cold:"Frio",winterCold:"Frio de inverno",heat:"Calor",summerHeat:"Calor de verão",strongSun:"Sol forte"},speed:"Velocidade",slots:"slots",protection:"Proteção",contextual:"Contextual",current:"Atual",withChange:"Com alteração",saveError:"O loadout mudou ou o item não está mais disponível.",saving:"Salvando",applyLoadout:"Aplicar loadout",uses:"usos",repair:"Reparar por 80",repairing:"Reparando",repairError:"Não foi possível reparar o equipamento.",instances:"cópias",equippedBy:"Equipado por",available:"Disponível",kinds:{backpack:"Mochila",utility:"Utilitário"},
    smallBackpack:{name:"Mochila pequena",description:"Leva mais um volume com uma redução de 5% na velocidade."},mediumBackpack:{name:"Mochila média",description:"Leva mais dois volumes com uma redução de 10% na velocidade."},largeBackpack:{name:"Mochila grande",description:"Leva mais três volumes com uma redução de 15% na velocidade."},
    raincoat:{name:"Capa impermeável",description:"Reduz em 3 pontos percentuais a penalidade de chuva quando realmente necessária."},routeLantern:{name:"Lanterna de rota",description:"Elimina a penalidade noturna de 2 pontos percentuais quando for o melhor efeito disponível."},windGoggles:{name:"Óculos de vento",description:"Reduz em 2 pontos percentuais a penalidade de ventos a partir de 30 km/h."},
  },
  travelWeather: { day:"Dia", night:"Noite", conditionImpact:"Impacto das condições neste trecho", activeConditions:"Condições ativas da viagem", impacts:{helpful:"Condições favoráveis",neutral:"Condições neutras",challenging:"Condições adversas"}, openDetails:"Ver clima da viagem", close:"Fechar clima", eyebrow:"Condições do trecho", title:"Clima da viagem", ofBaseSpeed:"da velocidade-base", virtualSource:"Clima virtual determinístico enquanto o forecast real não está disponível.", weather:"Clima atual", temperature:"Temperatura", season:"Estação", segment:"Trecho", effectiveSpeed:"Velocidade efetiva", etaNotice:"O horário estimado pode mudar enquanto os próximos trechos são atualizados.", attribution:"Dados meteorológicos por Open-Meteo · CC BY 4.0", impactRange:"Impacto climático possível: -8% a +2%", impactDescription:"A estimativa pode mudar antes da conclusão. O clima é resolvido no servidor sem revelar sua rota.", categories:{clear:"Céu limpo",partlyCloudy:"Parcialmente nublado",cloudy:"Nublado",fogDrizzle:"Neblina ou garoa",rain:"Chuva",snow:"Neve",heavyFreezingRain:"Chuva forte ou congelante",thunderstorm:"Tempestade"}, seasons:{summer:"Verão",autumn:"Outono",winter:"Inverno",spring:"Primavera"} },
  app: {
    title: "DUIF",
  },
  officialPostcards: { base: { name: "Cartão DUIF", description: "O cartão-base permanente para toda correspondência." } },
  officialStickers: { sunStamp: { description: "Um adesivo solar para iluminar a correspondência." }, blueEnvelope: { description: "Um pequeno envelope azul de rota." }, routeSpark: { description: "Uma faísca encontrada nas primeiras rotas." } },
  pwaInstall: {
    eyebrow: "Entrega especial",
    title: "Leve o DUIF para sua tela inicial",
    installDescription:
      "Instale o caderno postal para abrir mais rápido e jogar como um aplicativo.",
    iosDescription:
      "Toque em Compartilhar e depois em “Adicionar à Tela de Início”.",
    browserDescription:
      "Abra o menu do navegador e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.",
    unsupportedDescription:
      "Este navegador não permite instalar o DUIF. Copie ou abra este endereço no Safari ou Chrome para continuar.",
    openInstalledDescription:
      "A instalação foi aceita. Feche esta aba e abra o DUIF pelo ícone na sua tela inicial.",
    iosStepShare: "Toque no botão Compartilhar do navegador.",
    iosStepAdd: "Escolha “Adicionar à Tela de Início”.",
    iosStepOpen: "Abra o DUIF pelo novo ícone.",
    browserStepMenu: "Abra o menu do navegador.",
    browserStepInstall: "Escolha instalar ou adicionar à tela inicial.",
    browserStepOpen: "Abra o DUIF pelo novo ícone.",
    requiredNote:
      "A instalação é necessária no celular para garantir a experiência completa do jogo.",
    install: "Instalar",
  },
  common: {
    loading: "Carregando",
    unavailable: "Indisponível",
  },
  notFound: {
    eyebrow: "Carta extraviada",
    title: "Rota não encontrada",
    description:
      "Essa página saiu da rota postal. Volte para o ninho ou escolha outro destino pela navegação.",
    backToNest: "Voltar ao ninho",
  },
  auth: {
    eyebrow: "Conta postal",
    title: "Acesse o DUIF",
    subtitle: "Entre com seu email e senha para continuar sua aventura postal.",
    unavailableTitle: "Supabase não configurado",
    unavailableDescription:
      "Não foi possível acessar o serviço postal. Confira a configuração e a conexão.",
    loadingSession: "Carregando sessão",
    signedInTitle: "Sessão ativa",
    signedInDescription: "Sua sessão foi confirmada pelo serviço postal.",
    modeLabel: "Modo de acesso",
    signIn: "Entrar",
    signUp: "Criar conta",
    signOut: "Sair",
    email: "Email",
    password: "Senha",
    newPassword: "Nova senha",
    confirmPassword: "Confirmar senha",
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    show: "Mostrar",
    hide: "Ocultar",
    forgotPassword: "Esqueci minha senha",
    recoveryDescription:
      "Informe seu email. Se ele puder ser usado, enviaremos uma nova rota de acesso.",
    sendRecovery: "Enviar instruções",
    genericEmailSent:
      "Se este endereço puder ser usado, enviaremos as instruções por email.",
    verificationTitle: "Confira sua caixa de entrada",
    verificationDescription:
      "Se este endereço puder ser usado, você receberá uma confirmação postal para liberar o onboarding.",
    resendConfirmation: "Reenviar confirmação",
    resendIn: "Reenviar em",
    backToLogin: "Voltar ao login",
    passwordRequirements: "Requisitos da senha",
    passwordLength: "Pelo menos 8 caracteres",
    passwordLetter: "Pelo menos uma letra",
    passwordNumber: "Pelo menos um número",
    passwordMismatch: "As senhas não coincidem.",
    callbackTitle: "Confirmando sua conta",
    confirmingEmail: "Conferindo o selo de confirmação",
    callbackDescription: "Aguarde enquanto validamos seu acesso postal.",
    confirmedTitle: "Conta confirmada",
    confirmedDescription:
      "Seu selo de confirmação foi validado. Agora volte ao DUIF instalado para entrar.",
    returnToInstalledApp: "Abrir o DUIF pela tela inicial",
    invalidLinkTitle: "Este link não está mais válido",
    invalidLinkDescription:
      "Solicite novas instruções sem informar se uma conta está cadastrada.",
    resetTitle: "Criar nova senha",
    resetDescription:
      "Escolha uma senha forte para proteger seu caderno postal.",
    resetSuccess: "Senha atualizada. Entre novamente para continuar.",
    requestNewLink: "Solicitar outro link",
    updatePassword: "Atualizar senha",
    currentProfile: "Perfil atual",
    backToNest: "Voltar ao ninho",
    submitting: "Enviando",
    errorMessage:
      "Não foi possível completar a ação. Verifique os dados e tente novamente.",
    registrationPending:
      "Novos cadastros serão liberados com o próximo fluxo de boas-vindas.",
    languageLabel: "Idioma",
    languages: {
      ptBR: "Português",
      enUS: "English",
    },
  },
  foundation: {
    eyebrow: "Manutenção postal",
    retry: "Tentar novamente",
    loading: {
      title: "Consultando o ninho",
      description: "Estamos conferindo sua sessão e os registros postais.",
    },
    unavailable: {
      title: "Serviço temporariamente indisponível",
      description:
        "Não foi possível alcançar o serviço postal. Confira sua conexão e tente novamente.",
    },
    accountPending: {
      title: "Conta aguardando configuração",
      description:
        "Sua sessão existe, mas ainda não possui um perfil postal. O novo onboarding fará essa configuração com segurança.",
    },
    onboardingPending: {
      title: "Novo onboarding a caminho",
      description:
        "Os dados antigos foram removidos. Em breve você escolherá seu arquétipo, dará um nome ao mascote e fará a primeira rota.",
    },
  },
  onboarding: {
    eyebrow: "Primeira rota",
    progress: "Passo {current} de {total}",
    languageLabel: "Idioma",
    signOut: "Sair da conta",
    back: "Voltar",
    next: "Avançar",
    saving: "Guardando",
    genericError:
      "Não foi possível guardar este passo. Confira a conexão e tente novamente.",
    welcome: {
      title: "Bem-vindo ao DUIF",
      description:
        "No DUIF, você envia mascotes pelo mundo para entregar cartas, cartões e presentes.\n\nCada mascote tem sua própria velocidade. Escolha uma rota, acompanhe a viagem e espere ele voltar ao ninho.",
    },
    travel: {
      title: "Viagens em tempo real",
      description:
        "Depois do envio, a viagem continua avançando mesmo com o aplicativo fechado.\n\nVocê pode voltar mais tarde para acompanhar o progresso ou receber seu mascote quando ele retornar.",
    },
    discoveries: {
      title: "Descobertas na rota",
      description:
        "Durante a viagem, seu mascote pode encontrar lembranças em alguns pontos do caminho.\n\nElas são coletadas automaticamente e chegam junto com ele no retorno ao ninho.",
    },
    returnCollection: {
      title: "Carga no retorno",
      description:
        "Quando a viagem termina, seu mascote volta trazendo a carga encontrada pelo caminho.\n\nConfira os itens recebidos e guarde suas descobertas na Coleção.",
    },
    displayName: {
      title: "Como devemos chamar você?",
      description:
        "Escolha um apelido público e exclusivo para aparecer aos seus amigos.",
      label: "Seu apelido",
      hint: "Use de 2 a 24 caracteres.",
      error: "Informe um apelido válido com 2 a 24 caracteres.",
      taken: "Este apelido já está em uso. Escolha outro para continuar.",
    },
    mascotChoice: {
      title: "Escolha seu mascote",
      description:
        "Cada espécie viaja de um jeito próprio. Escolha aquela que combina com a sua aventura.",
      loading: "Abrindo o catálogo de mascotes…",
      unavailable:
        "O catálogo de mascotes está indisponível agora. Tente novamente em instantes.",
      previous: "Mascote anterior",
      nextMascot: "Próximo mascote",
      nameLabel: "Dê um nome ao seu mascote",
      nameHint:
        "Use de 2 a 24 caracteres. O nome será seu e não muda com o idioma.",
      nameError: "Informe um nome válido com 2 a 24 caracteres.",
      attributes: "Atributos",
      trait: "Traço especial",
      skills: "Habilidades",
      equipment: "Equipamento inicial",
      review: "Revisar escolha",
      reviewTitle: "Revise sua escolha",
      reviewDescription:
        "Confira a espécie e o nome. Depois de confirmar, este será seu primeiro mascote.",
      confirm: "Confirmar mascote",
      preparing: "Preparando o ninho…",
      readyTitle: "Seu mascote está pronto",
      readyDescription: "{name} já está esperando pela primeira rota tutorial.",
    },
    tutorialNestLabel: "Ninho do tutorial",
    privateNestLabel: "Meu ninho",
  },
  tutorial: {
    eyebrow: "Primeira rota",
    continue: "Entendi",
    start: {
      title: "Aprenda com uma viagem curta",
      description:
        "Seu mascote fará uma rota rápida entre o Ninho Postal e a Estação dos Mensageiros, retornando em cerca de 5 minutos.\n\nPara facilitar o início, esta primeira viagem recebe um impulso temporário que acelera o percurso sem alterar a velocidade normal do mascote.",
      action: "Começar primeira rota",
    },
    boost: { badge: "Impulso da primeira viagem" },
    traveling: {
      title: "A viagem continua",
      description:
        "Acompanhe o mascote pelo mapa. A próxima orientação aparecerá no momento certo.",
    },
    controls: {
      hint: "Use os controles do mapa para conhecer a rota.",
      startHere: "Toque aqui",
      instructions: {
        mascot: "Primeiro, acompanhe seu mascote no mapa.",
        origin: "Agora, veja de onde a viagem começa: o Ninho Postal.",
        destination:
          "Em seguida, encontre a Estação dos Mensageiros, o destino da rota.",
        overview: "Por fim, use a visão geral para ver a rota completa.",
      },
    },
    locations: {
      nest: "Ninho Postal",
      station: "Estação dos Mensageiros",
      route: "Caminho inaugural",
    },
    steps: {
      preparing: {
        title: "Preparando a partida",
        description:
          "Antes de sair, seu mascote organiza a bolsa e confere a rota.\n\nEm viagens normais, essa preparação leva um tempo. Nesta primeira rota, o impulso postal deixa tudo mais rápido.",
      },
      outbound: {
        title: "A viagem começou",
        description:
          "O mascote segue agora em direção à Estação dos Mensageiros.",
      },
      discovery: {
        title: "Uma descoberta!",
        description:
          "O Cartão Inaugural foi encontrado automaticamente no caminho e seguirá na carga.",
      },
      destination: {
        title: "Chegada à estação",
        description:
          "O destino foi alcançado. O mascote faz uma pequena pausa antes de retornar.",
      },
      returning: {
        title: "Voltando ao ninho",
        description:
          "A carga está segura e o mascote iniciou o caminho de volta.",
      },
      returned: {
        title: "Viagem concluída",
        description:
          "Seu mascote retornou. Agora falta conferir e guardar toda a carga.",
      },
      collection: {
        title: "Carga pronta",
        description:
          "Sua primeira carga chegou ao Ninho Postal. Confirme para abrir e guardar os itens.",
      },
    },
    collection: {
      title: "Receba a primeira carga",
      description:
        "Colete o Cartão Inaugural e o Selo de Primeira Rota para guardá-los na Coleção.",
      action: "Coletar toda a carga",
    },
    completed: {
      title: "Primeira rota concluída",
      description:
        "O Cartão Inaugural e o Selo de Primeira Rota foram guardados na sua Coleção.",
      nestNext: "A próxima etapa será escolher a região do seu ninho real.",
    },
    postcard: {
      open: "Abrir Cartão Inaugural",
      close: "Fechar cartão",
      flip: "Virar cartão",
      flipHint: "Toque no cartão para virá-lo",
      front: "Frente do cartão",
      back: "Verso do cartão",
      completedOn: "Concluída em {date}",
      backMessage:
        "Parabéns pela sua primeira viagem postal! Este cartão registra o começo da sua coleção e das aventuras do seu mascote.",
      postmark: "Primeira viagem",
      deliveredBy: "Entregue por",
    },
    rewards: {
      inauguralPostcard: {
        name: "Cartão Inaugural",
        description:
          "Um cartão postal que registra a primeira viagem do seu mascote.",
      },
      firstRouteStamp: {
        name: "Selo de Primeira Rota",
        description:
          "Um selo entregue pela conclusão da primeira jornada postal.",
      },
    },
  },
  nest: { eyebrow: "Ninho real", title: "Escolha a região do seu ninho", description: "Busque pelo nome da sua cidade e toque no mapa para indicar uma área aproximada. Ela será usada somente para calcular suas rotas.", searchLabel: "Nome da cidade", searchPlaceholder: "Ex.: São Paulo", searchAction: "Buscar cidade", noCityFound: "Não encontramos essa cidade. Confira o nome e tente novamente.", mapLabel: "Mapa para escolher a região do ninho", privacyNote: "O ponto será aproximado em cerca de 2 km. Sua localização não será exibida para outras pessoas.", selectedCity: "Sua cidade: {city}", selectionReady: "Área aproximada selecionada.", confirmAction: "Ativar meu ninho" },
  postalJobs: { eyebrow: "Quadro postal", title: "Trabalhos disponíveis", description: "Cada mascote pode escolher uma entrega oficial sem usar seus itens pessoais.", artworkAlt: "Quadro ilustrado com entregas postais disponíveis.", distance: "Distância", cargo: "Carga", seeds: "Sementes", xp: "XP do mascote", accept: "Aceitar trabalho", replace: "Trocar", depart: "Confirmar partida", error: "Não foi possível atualizar este trabalho postal.", templates: { farol: { title: "Lente para o farol", description: "Leve a lente polida antes que a neblina cubra a costa." }, farolSignal: { title: "Sinal para o farol", description: "Leve o sinal de neblina para a torre antes do anoitecer." }, horta: { title: "Sementes da horta", description: "Uma caixa de sementes precisa chegar antes da chuva." }, hortaSeedlings: { title: "Mudas para a horta", description: "As mudas precisam de abrigo antes da próxima garoa." }, estacao: { title: "Horários da estação", description: "Entregue a nova tabela de partidas à estação postal." }, estacaoSignals: { title: "Sinais da estação", description: "Leve os discos de sinalização para organizar as plataformas." }, biblioteca: { title: "Mapas da biblioteca", description: "A mapoteca aguarda cartas de navegação catalogadas." }, bibliotecaFolios: { title: "Fólios da biblioteca", description: "Os registros encadernados precisam voltar à sala de mapas." }, oficina: { title: "Peças para a oficina", description: "A oficina precisa de componentes para reparar suas prensas." }, oficinaInk: { title: "Tinta para a oficina", description: "A tinta de impressão precisa chegar antes do jornal da rota." }, observatorio: { title: "Cartas celestes", description: "Leve os mapas do céu para a observação noturna." }, observatorioLenses: { title: "Lentes do observatório", description: "As lentes calibradas devem chegar antes da próxima vigília." } } },
  assetStudio: { eyebrow: "Ateliê postal", title: "Assets oficiais", description: "Prepare, valide e publique arte oficial sem interromper o jogo.", newAsset: "Novo asset", uploadTitle: "Preparar versão", key: "Chave do asset", type: "Tipo", file: "Arquivo", altKey: "Chave de texto alternativo", decorative: "Arte decorativa", author: "Autoria", saveDraft: "Salvar rascunho", draftSaved: "Rascunho salvo no ateliê.", publish: "Publicar", published: "Versão publicada.", archive: "Arquivar", archived: "Versão arquivada.", restore: "Restaurar versão", restored: "Versão restaurada.", usage: "Usos", filters: "Filtros de assets", all: "Todos", loading: "Abrindo o ateliê…", error: "Não foi possível concluir esta ação do ateliê." },
  geonamesAdmin: { eyebrow: "Catálogo postal", title: "Cidades GeoNames", description: "Atualize o catálogo oficial de cidades diretamente da fonte GeoNames.", activeCities: "cidades ativas", latestSuccess: "Última atualização concluída", noSuccess: "Nenhuma atualização concluída ainda.", refresh: "Atualizar catálogo de cidades", confirm: "Iniciar atualização", cancel: "Cancelar", confirmTitle: "Atualizar o catálogo?", confirmDescription: "A fonte será baixada e validada antes de substituir o catálogo atual.", history: "Histórico recente", status: "Status", processed: "processadas", imported: "importadas", updated: "atualizadas", archived: "arquivadas", running: "em andamento", failed: "falhou", succeeded: "concluída", queued: "na fila", refreshStarted: "Atualização GeoNames iniciada." },
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
    back: "Voltar",
    backToFriends: "Voltar aos amigos",
    backToNest: "Voltar ao ninho",
    nest: "Ninho",
    letters: "Caixa Postal",
    collection: "Coleção",
    map: "Mapa",
    friends: "Amigos",
    shop: "Loja",
    shopUnavailable: "Loja ainda indisponível",
    referralRewardAvailable: "Coruja disponível para resgate",
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
    noDeliveryDescription:
      "Este mascote está disponível para a próxima entrega.",
    route: "Rota",
    origin: "Origem",
    destination: "Destino",
    distance: "Distância",
    status: "Status",
    visualPreview: "Prévia visual",
    selectedMascot: "Mascote selecionado",
    chooseMascot: "Escolher mascote",
    bottomNav: "Navegação principal",
    loadingCatalog: "Atualizando caderno",
    flightRange:"Alcance de voo",naturalSlots:"Slots naturais",flightCapReached:"O progresso continua acima do nível 20, sem novos bônus funcionais.",nextFlightMilestone:"Continue voando para alcançar o próximo marco funcional.",unlockAtLevel:"Desbloqueia no nível {level}",routeWithinRange:"Rota dentro do alcance",routeOutOfRange:"Rota de {distance} km; alcance atual de {range} km. Requer nível {level}.",familiarity:"Familiaridade",
    skillNotice: { title: "Novas habilidades", description: "Escolha ou revise a habilidade individual deste mascote.", retiredDescription: "Arrancada Urbana foi retirada. Escolha uma nova habilidade para transferir todo o XP acumulado.", waterPathRetiredDescription: "Caminho d’Água foi retirado. Escolha uma nova habilidade para transferir todo o XP acumulado.", open: "Ver habilidades disponíveis", dialogTitle: "Escolher habilidade individual", choose: "Escolher habilidade", transfer: "Transferir XP", transferPreview: "Após a transferência:", close: "Fechar habilidades" },
  },
  prestige:{firstHorizon:{name:"Primeiro Horizonte",description:"Um contorno postal para quem alcançou as primeiras grandes rotas."},routeAtlas:{name:"Atlas de Rotas",description:"Marcas de caminhos cruzados por um mensageiro experiente."},letterSky:{name:"Céu de Cartas",description:"Cartas e estrelas acompanham muitas histórias entregues."},nestAmongStars:{name:"Ninho entre Estrelas",description:"Uma moldura para jornadas que já atravessaram o mundo."}},
  familiarity:{new:"Nova",known:"Conhecida",familiar:"Familiar",mastered:"Dominada"},
  nestHub: { eyebrow: "Seu espaço postal", title: "Ninho", tagline: "Seu lar, suas histórias.", currencySummary: "Saldos postais", seeds: "Sementes", crystals: "Cristais", settingsSoon: "Configurações em breve", defaultAvatar: "Silhueta de perfil", profileName: "Perfil", nestName: "Ninho", nestOf: "Ninho de", location: "Localização", levelZero: "Nível 0", xpZero: "0 XP", sections: "Áreas do Ninho", profileTitle: "Perfil", profileDescription: "Sua identidade postal e informações pessoais.", mascotTitle: "Mascotes", mascotDescription: "Veja quem está no ninho ou viajando.", mailboxTitle: "Caixa Postal", mailboxDescription: "Leia as correspondências que chegaram.", atNest: "no ninho", traveling: "viajando", newCorrespondence: "novas correspondências", travelingTitle: "Viagens em andamento", noTravelTitle: "Nenhuma viagem em andamento", noTravelDescription: "Quando um mensageiro sair, o acompanhamento aparecerá aqui." },
  profile: { eyebrow: "Perfil postal", email: "E-mail", location: "Localização", joined: "No DUIF desde", level: "Nível", xp: "Experiência", seeds: "Sementes", crystals: "Cristais", readOnlyNotice: "A edição do perfil será disponibilizada em uma futura atualização postal." },
  mailbox: {
    eyebrow: "Correspondências recebidas",
    title: "Caixa Postal",
    description: "Cartas de amigos aparecem aqui quando chegam ao destino.",
    open: "Caixa Postal",
    loading: "Conferindo as cartas que chegaram.",
    error: "Não foi possível abrir a Caixa Postal agora.",
    retry: "Tentar novamente",
    emptyTitle: "Nenhuma carta por enquanto",
    emptyDescription: "Quando um amigo concluir o trecho de ida, a carta chegará aqui.",
    letterList: "Cartas recebidas",
    from: "De",
    deliveredBy: "Entregue por {mascot}",
    openLetter: "Abrir carta",
    closeLetter: "Fechar carta",
    showEnvelope: "Ver envelope",
    letterTitle: "Carta recebida",
    emptyLetter: "Esta carta chegou sem conteúdo legível.",
    reply: "Responder",
    surpriseSender: "Remetente surpresa",
    surpriseTitle: "Nova correspondência",
    surpriseDescription: "Abra para descobrir quem enviou.",
    postcardWithoutMessage: "Este cartão chegou sem mensagem.",
    returnReplyLabel: "Carta para a viagem de volta",
    returnReplyDeadline: "A resposta usa um slot livre e só pode ser confirmada durante a preparação do retorno.",
    returnReplyConfirmed: "Resposta confirmada para a viagem de volta.",
    sendReturnReply: "Enviar na volta",
    replying: "Confirmando",
    returnWindowRemaining: "para preparar a resposta",
    prepareReturnReply: "Preparar resposta",
    returnReplyFlowTitle: "Preparar resposta",
    returnReplyLoading: "Conferindo a janela de resposta...",
    returnReplyUnavailable: "Resposta indisponível",
    returnReplyExpired: "A janela para enviar esta resposta terminou. Volte à Caixa Postal para continuar.",
    returnReplyConfirmedDescription: "A carta foi preparada e seguirá com o mesmo mascote na viagem de volta.",
    writeReturnReply: "Escrever resposta",
    toOriginalSender: "Destinatário",
    returnReplySubmitError: "Não foi possível confirmar a resposta. Confira o prazo e o acabamento postal.",
    visitingMascot: "Mascote visitante",
    minutesRemaining: "minutos restantes",
    openVisitorLetter: "Abrir correspondência do visitante",
    correspondenceUnavailable: "Esta correspondência não está mais disponível neste endereço.",
  },
  send: {
    skillPreview:{title:"Habilidades nesta viagem",loading:"Calculando habilidades...",unavailable:"A prévia de habilidades está indisponível. O envio ainda será validado pelo servidor.",active:"Ativa",inactive:"Inativa",weatherDependent:"Pode variar com o clima",weatherNotice:"As condições dos trechos futuros podem mudar.",reasons:{snapshot:"Condição confirmada para esta rota.",conditionNotMet:"A condição não participa desta rota."}},
    steps: { friend: "Amigo", mascot: "Mascote", correspondence: "Envio", finishing: "Acabamento", stamp: "Selo", postmark: "Carimbo", review: "Revisão", navigation: "Navegação entre etapas", back: "Voltar", next: "Avançar" },
    startAction: "Enviar",
    eyebrow: "Envio postal",
    title: "Preparar entrega",
    subtitle:
      "Escolha um amigo, um mascote e uma lembrança para iniciar uma nova rota.",
    chooseFriend: "Escolha um amigo",
    chooseMascot: "Escolha um mascote",
    chooseCorrespondence: "Escolha o envio",
    summary: "Resumo do envio",
    confirmationTitle: "Entrega iniciada",
    confirmationDescription:
      "O mascote está preparando a viagem e logo seguirá pela rota.",
    sendButton: "Confirmar envio",
    sendAnother: "Enviar outro",
    backToMascot: "Ver mascote",
    estimatedDuration: "Duração estimada",
    preparationTime: "Preparo",
    outboundDuration: "Tempo de ida",
    returnDuration: "Tempo de volta",
    discoveryReach: "Alcance de descoberta",
    rarityPotential: "Potencial de raridade",
    routeProfile: "Perfil da rota",
    shortRoute: "Rota curta, sem penalidade de distância",
    longRoutePenalty: "Rota longa com penalidade de retorno",
    longRouteMitigated: "Rota longa com penalidade neutralizada",
    effectFastReturn: "retorno 10% mais rápido",
    effectDiscoveryReach: "alcance nesta rota",
    effectSafeLongRoute: "neutraliza a penalidade desta rota longa",
    effectSafeShortRoute: "pronta para proteger rotas longas",
    selectedFriend: "Amigo selecionado",
    selectedMascot: "Mascote selecionado",
    selectedCorrespondence: "Envio selecionado",
    readyHint: "Tudo pronto para despachar esta entrega.",
    incompleteHint: "Complete as três escolhas para confirmar o envio.",
    loadingData: "Atualizando opções do caderno",
    sending: "Despachando",
    errorMessage: "Não foi possível criar a entrega. Tente novamente.",
    mascotUnavailable: "Este mascote não está mais disponível. Escolha outro mensageiro livre.",
    noAvailableMascots: "Todos os mascotes estão em uma entrega. Colete uma viagem concluída ou acompanhe as rotas ativas.",
    viewActiveTrips: "Ver viagens e coletas",
    composeTitle: "Compor envio",
    contentPreview: "Prévia do conteúdo",
    contentInvalid: "Revise o conteúdo antes de despachar.",
    availableLater: "Disponível em breve",
    characterCount: "Caracteres",
    previewLetter: "Ver carta completa",
    closeLetterPreview: "Fechar prévia",
    selectedStickers: "Adesivos selecionados",
    removeSticker: "Remover",
    letterPlaceholder:
      "Escreva uma carta curta para atravessar a rota com calma.",
    postcardPlaceholder: "Mensagem curta no verso do cartão.",
    giftPlaceholder: "Uma nota curta para acompanhar o presente futuro.",
    giftPendingTitle: "Presentes ainda estão em definição",
    giftPendingDescription:
      "Nesta versão, o presente leva apenas uma nota mockada.",
    postalFinishing: {
      title: "Acabamento postal",
      description: "Toda carta parte com um selo e um carimbo. Os itens padrão podem ser usados sempre.",
      stampTitle: "Escolha o selo",
      stampDescription: "Selecione um selo para o envio ou abra a arte para observá-la em tamanho maior.",
      postmarkTitle: "Escolha o carimbo",
      postmarkDescription: "O carimbo não é consumido e registra o acabamento desta correspondência.",
      defaultStamp: "Selo padrão DUIF",
      defaultPostmark: "Carimbo postal padrão",
      reputationLevel: "Reputação Postal · nível {level}",
      modelLabel: "Modelo do carimbo",
      colorLabel: "Cor da tinta",
      unlockLevel: "Libera no nível {level}",
      airMail: "Correio aéreo",
      models: { classic: "Clássico", route: "Rota postal", wing: "Asas do correio" },
      colors: { brown: "Marrom postal", blue: "Azul aéreo", red: "Vermelho carta", green: "Verde bosque", gold: "Dourado", plum: "Ameixa", charcoal: "Carvão", teal: "Verde-mar" },
      chooseStamp: "Selecionar",
      previewStamp: "Ampliar selo",
      closeStampPreview: "Fechar prévia",
      summaryLabel: "Selo e carimbo",
    },
    content: {
      letterLabel: "Texto da carta",
      postcardLabel: "Verso do cartão",
      postcardVariantLabel: "Tipo de cartão",
      stickerLabel: "Escolha até 3 adesivos",
      giftLabel: "Nota do presente",
      emptyPreview: "O conteúdo aparecerá aqui antes do despacho.",
      stickers: {
        sunStamp: "Selo de sol",
        blueEnvelope: "Envelope azul",
        routeSpark: "Faísca de rota",
      },
      postcardVariants: {
        city: "Cartão da cidade",
        event: "Cartão de evento",
        photo: "Foto própria placeholder",
      },
    },
  },
  map: {
    eyebrow: "Mapa postal",
    title: "Viagem em tempo real",
    subtitle:
      "Acompanhe o mascote cruzando a rota e veja as descobertas mockadas que aparecem pelo caminho.",
    tripStatus: "Status da viagem",
    closeTripStatus: "Fechar",
    selectMascot: "Selecionar mascote",
    previousMascot: "Mascote anterior",
    nextMascot: "Próximo mascote",
    currentLeg: "Trecho atual",
    discoveries: "Descobertas da rota",
    cargoFound: "Carga encontrada",
    carryingCargo: "Levando nesta viagem",
    tripCompleted: "Viagem concluída",
    deliveryFinished: "Entrega finalizada",
    finishedDeliveries: "entregas finalizadas",
    collectFinishedDelivery: "Ver coleta",
    cargoFoundDescription:
      "O mascote voltou ao ninho com as descobertas vistas durante a rota.",
    completedDescription:
      "A recompensa principal foi coletada e esta viagem está concluída.",
    routeCargo: "Descobertas carregadas",
    primaryReward: "Recompensa principal",
    visualCargo: "Carga da rota",
    collectionPending: "Aguardando coleta",
    rewardCollected: "Coletada",
    noPrimaryReward:
      "Esta entrega não possui uma recompensa principal disponível.",
    routeCargoPreviewNote:
      "As descobertas da rota são uma prévia da carga. A coleta múltipla será liberada em uma etapa futura.",
    goToCollection: "Conferir e coletar",
    ownerCollectionOnly: "Somente o dono do mascote pode coletar esta carga.",
    openCollection: "Abrir Coleção",
    mockedRewards: "Recompensas mockadas",
    persistedRewards: "Descobertas persistidas",
    discovered: "Descoberto",
    newDiscovery: "Recém-descoberta",
    carriedDiscovery: "Na carga do mascote",
    discoveryToastSingle: "Nova descoberta postal",
    discoveryToastMultiple: "Novas descobertas postais",
    onTheRoute: "No caminho",
    backToMascot: "Voltar ao mascote",
    unavailable:
      "Não foi possível carregar o mapa real agora. A rota continua disponível nos detalhes da viagem.",
    cameraControls: "Controles de enquadramento do mapa",
    activeMapTools: "Itens ativos do mapa",
    overview: "Visão geral",
    focusMascot: "Mascote",
    followMascot: "Seguir mascote",
    stopFollowing: "Parar de seguir",
    focusOrigin: "Origem",
    focusDestination: "Destino",
    backToTrip: "Voltar à viagem",
    rewardDetails: "Detalhes da descoberta",
    futureReward: "Descoberta misteriosa",
    futureRewardState: "Ainda no caminho",
    futureRewardHint: "Continue a viagem para revelar esta descoberta.",
    approximateRegion: "Região aproximada",
    rewardType: "Tipo",
    rarity: "Raridade",
    legs: {
      preparing: "Preparando",
      outbound: "Indo",
      delivered: "No destino",
      returning: "Voltando",
      returned: "Retornou",
      completed: "Concluída",
    },
    rewardKinds: {
      badge: "Badge",
      postcard: "Cartão postal",
      stamp: "Selo",
      souvenir: "Lembrança",
      material: "Material",
      eventItem: "Item de evento",
    },
    rewards: {
      londrinaPostcard: {
        name: "Cartão postal de Londrina",
        description:
          "Uma lembrança ilustrada do começo da rota no norte do Paraná.",
      },
      cambeSouvenir: {
        name: "Lembrança de Cambé",
        description: "Uma pequena lembrança encontrada logo depois da partida.",
      },
      rolandiaBadge: {
        name: "Distintivo de Rolândia",
        description: "Um emblema postal encontrado entre as cidades da rota.",
      },
      arapongasMaterial: {
        name: "Fibra de Arapongas",
        description:
          "Um material leve recolhido durante a passagem por Arapongas.",
      },
      apucaranaStamp: {
        name: "Selo de Apucarana",
        description:
          "Um selo raro marcado durante a passagem pela região de Apucarana.",
      },
      maringaEvent: {
        name: "Convite de Maringá",
        description: "Um item de evento encontrado na chegada a Maringá.",
      },
    },
  },
  postalTraffic: {
    title: "Tráfego postal",
    nearbyPets: "Mascotes próximos",
    empty: "Nenhum mascote passando pela região consultada agora.",
    progress: "Progresso",
    travelState: "Estado da viagem",
    owner: "Dono",
    openFriendProfile: "Abrir perfil do amigo",
    privateOwner: "Os dados do dono deste mascote são privados.",
    outOfRange:
      "Este mascote saiu da região consultada. Exibindo o último registro conhecido.",
    visibility: {
      friend: "Amigo",
      public: "Mascote público",
    },
    legs: {
      preparing: "Preparando",
      outbound: "Indo",
      delivered: "No destino",
      returning: "Retornando",
      returned: "Retornou",
      completed: "Concluída",
    },
    regions: {
      paranaBrazil: "Paraná, Brasil",
      rioGrandeDoSulBrazil: "Rio Grande do Sul, Brasil",
      santaCatarinaBrazil: "Santa Catarina, Brasil",
      goiasBrazil: "Goiás, Brasil",
      distritoFederalBrazil: "Distrito Federal, Brasil",
      minasGeraisBrazil: "Minas Gerais, Brasil",
      espiritoSantoBrazil: "Espírito Santo, Brasil",
      bahiaBrazil: "Bahia, Brasil",
      pernambucoBrazil: "Pernambuco, Brasil",
    },
  },
  species: {
    carrierPigeon: "Pombo-correio",
    messengerFalcon: "Falcão-mensageiro",
    mailDuck: "Pato-correio",
    postalOwl: "Coruja-postal",
  },
  archetypes: {
    suggestedNames: {
      nuvem: "Nuvem",
      trovao: "Trovão",
      pipoca: "Pipoca",
      owl: "Coruja",
    },
  },
  traits: {
    steadyRoute: {
      name: "Rota Segura",
      description:
        "Mantém entregas estáveis e melhora recompensas em rotas longas.",
    },
    directFlight: {
      name: "Voo Direto",
      description:
        "Reduz desvios e favorece retornos rápidos depois da entrega.",
    },
    curiousFinder: {
      name: "Achador Curioso",
      description:
        "Aumenta a chance de encontrar lembranças e itens raros pelo caminho.",
    },
    nightRoute: { name: "Rota Noturna", description: "Enxerga sinais e eventos mesmo quando a rota fica silenciosa." },
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
    fixed: "Habilidade fixa",
    individual: "Habilidade individual",
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
    owlNightWatch: { name: "Vigília Noturna", description: "Mantém a orientação quando a rota atravessa a noite." },
    postalMemory: { name: "Memória Postal", description: "Aproveita caminhos repetidos depois de três viagens concluídas." },
    balancedLoad: { name: "Carga Equilibrada", description: "Alivia a perda de velocidade da mochila." },
    returnMail: { name: "Correio de Volta", description: "Ajuda no retorno quando uma resposta postal é confirmada." },
    cartographicEye: { name: "Olhar Cartográfico", description: "Amplia descobertas em rotas longas ou conhecidas." },
    solarWing: { name: "Asa Solar", description: "Lida melhor com o sol forte." },
    urbanStart: { name: "Arrancada Urbana", description: "Ganha agilidade em rotas urbanas." },
    aerodynamicLoad: { name: "Carga Aerodinâmica", description: "Alivia a perda de velocidade da mochila em voo direto." },
    waterPath: { name: "Caminho d'Água", description: "Amplia descobertas em rotas costeiras." },
    waterproofFeathers: { name: "Plumas Impermeáveis", description: "Lida melhor com chuva e umidade." },
    firstTrip: { name: "Primeiro Passeio", description: "Valoriza a primeira visita a um destino." },
    nightVigil: { name: "Vigília Noturna", description: "Aumenta a velocidade durante a noite." },
    silentFlight: { name: "Voo Silencioso", description: "Reduz a penalidade de baixa visibilidade." },
    lunarMemory: { name: "Memória Lunar", description: "Acelera rotas familiares durante a noite." },
    nightLoad: { name: "Carga Noturna", description: "Alivia a penalidade da mochila durante a noite." },
    dawnGuardian: { name: "Guardiã da Madrugada", description: "Protege contra o frio entre 05:00 e 06:59 locais." },
  },
  delivery: {
    progress: "Progresso",
    remainingTime: "Tempo restante",
    routePreview: "Prévia da rota",
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
  rewards: {
    eyebrow: "Retorno postal",
    title: "Coleta de recompensa",
    readyTitle: "Envelope de retorno",
    readyDescription:
      "O mascote voltou com marcas da rota e uma pequena descoberta.",
    travelingTitle: "Ainda em viagem",
    travelingDescription:
      "Esta entrega ainda não retornou ao ninho. A recompensa aparece quando o mascote voltar.",
    completedTitle: "Recompensa coletada",
    completedDescription:
      "O envelope foi arquivado no caderno e a descoberta entrou na coleção.",
    loading: "Conferindo o envelope de retorno...",
    collectButton: "Coletar",
    collectAllButton: "Coletar toda a carga",
    collecting: "Coletando...",
    collectError:
      "Não foi possível coletar agora. Tente novamente em instantes.",
    backToMascot: "Voltar ao mascote",
    backToMap: "Voltar ao mapa",
    xpGained: "XP ganho",
    itemFound: "Item encontrado",
    fullCargoTitle: "Carga completa",
    primaryReward: "Prêmio principal",
    routeCargo: "Descobertas da rota",
    collectionPending: "Coleta pendente",
    ownerCollectionOnly: "Somente o dono do mascote pode coletar esta carga.",
    inventory: "Itens na coleção",
    collected: "Coletado",
    rarity: "Raridade",
    progressionTitle: "Progresso da rota",
    reputationXp: "Reputação Postal",
    mascotFlightXp: "XP de voo",
    skillXp: "XP de habilidade",
    skillEffectApplied: "efeito aplicado",
    affinity: "Afinidade de rota",
    affinityLongDistance: "Rota longa",
    affinityUrban: "Rota urbana",
    affinityDiscovery: "Descoberta no caminho",
    items: {
      wornRouteStamp: {
        name: "Selo de rota gasto",
        description:
          "Um selo marcado pelo caminho, perfeito para páginas de viagem.",
      },
      blueAirmailLabel: {
        name: "Etiqueta azul de correio aéreo",
        description:
          "Uma etiqueta dobrada com tinta azul e cheiro de papel antigo.",
      },
      goldenCompassPin: {
        name: "Broche de bússola dourada",
        description:
          "Um achado raro que aponta para histórias ainda não contadas.",
      },
    },
  },
  inventory: {
    eyebrow: "Coleção postal",
    title: "Coleção",
    subtitle:
      "Selos, lembranças, marcas de viagem e equipamentos descobertos pelos pets nas rotas.",
    categoriesLabel: "Filtrar coleção",
    distinctTotal: "Itens distintos",
    acquiredTotal: "Exemplares obtidos",
    equippedTotal: "Equipados",
    raritySummary: "Raridades",
    emptySlotTitle: "Espaço por descobrir",
    emptySlotDescription:
      "Um lugar reservado para uma próxima lembrança de viagem.",
    source: "Origem",
    category: "Tipo",
    categories: {
      all: "Todos",
      equipment: "Equipamentos",
      stamps: "Selos",
      keepsakes: "Lembranças",
      routeMarks: "Marcas de viagem",
    },
    sources: {
      starterKit: "Kit inicial",
      routeReward: "Recompensa de rota",
      longRouteFind: "Achado de rota longa",
    },
  },
  shop: {
    eyebrow: "Balcão postal",
    title: "Loja",
    subtitle:
      "Pequenos detalhes para personalizar mascotes, cadernos e correspondências.",
    prototypeNotice:
      "Catálogo demonstrativo: preços fictícios, sem saldo ou compras.",
    categoriesLabel: "Filtrar catálogo",
    prototypePrice: "Preço de protótipo",
    viewDetails: "Ver detalhes",
    close: "Fechar",
    detailsTitle: "Detalhes do item",
    mascotPreview: "Prévia com Nuvem",
    mascotPreviewNote:
      "Composição ilustrativa; o item não será equipado ou salvo.",
    emptyTitle: "Prateleira vazia",
    emptyDescription: "Ainda não há itens nesta parte do balcão postal.",
    categories: {
      all: "Todos",
      cosmetics: "Cosméticos",
      stickers: "Adesivos",
      postcards: "Cartões-postais",
      decorations: "Decorações",
    },
    currencies: {
      seeds: "Sementes",
      crystals: "Cristais",
    },
    items: {
      crimsonCourierScarf: {
        name: "Cachecol carmim de mensageiro",
        description: "Protege contra frio, vento e a intensificação do inverno.",
      },
      meadowPostCap: {
        name: "Quepe postal do campo",
        description:
          "Protege contra calor, sol forte e a intensificação do verão.",
      },
      sunnyRouteSticker: {
        name: "Adesivo rota ensolarada",
        description:
          "Um sol desenhado a tinta para iluminar cartas e páginas do caderno.",
      },
      blueEnvelopeSticker: {
        name: "Adesivo envelope azul",
        description:
          "Um envelope de correio aéreo com uma delicada marca de viagem.",
      },
      coastalTownPostcard: {
        name: "Cartão da vila costeira",
        description:
          "Casas claras, mar calmo e um caminho postal junto ao porto.",
      },
      lanternFestivalPostcard: {
        name: "Cartão do festival de lanternas",
        description:
          "Uma noite de papel aquecida por lanternas e pequenos carimbos dourados.",
      },
      brassNestPlaque: {
        name: "Placa de ninho em latão",
        description:
          "Uma plaquinha envelhecida para marcar o cantinho favorito do mascote.",
      },
      airmailProfileRibbon: {
        name: "Fita de perfil correio aéreo",
        description:
          "Uma fita azul e vermelha para contornar retratos no caderno postal.",
      },
    },
  },
  locations: {
    londrina: "Londrina",
    cambe: "Cambé",
    rolandia: "Rolândia",
    arapongas: "Arapongas",
    apucarana: "Apucarana",
    maringa: "Maringá",
    beloHorizonte: "Belo Horizonte",
    salvador: "Salvador",
    rioBranco: "Rio Branco",
    saoPaulo: "São Paulo",
    lisbon: "Lisboa",
    curitiba: "Curitiba",
    toronto: "Toronto",
  },
  friends: {
    eyebrow: "Caderno social",
    title: "Amigos",
    subtitle:
      "Veja companheiros de correspondência, mascotes visitantes e pequenos registros recebidos.",
    profileTitle: "Perfil de amigo",
    viewProfile: "Ver perfil",
    sendToFriend: "Enviar para amigo",
    quickSend: "Envio rápido",
    friendshipLevel: "Nível de amizade",
    exchangeCount: "Trocas",
    friendMascots: "Mascotes do amigo",
    receivedCorrespondence: "Correspondências recebidas",
    location: "Localização",
    backToFriends: "Voltar aos amigos",
    noCorrespondence: "Ainda não há correspondências recebidas deste amigo.",
    mascotLabel: "Mascote visitante",
    emptyTitle: "Seu caderno postal está pronto",
    emptyDescription: "Compartilhe seu Código Postal de Amizade ou use o código de alguém para começar a trocar correspondências.",
    postalCodeTitle: "Meu Código Postal",
    postalCodeDescription: "Compartilhe este código apenas com quem você deseja receber no seu caderno.",
    copyCode: "Copiar código",
    copiedCode: "Código copiado",
    shareCode: "Compartilhar",
    regenerateCode: "Gerar novo código",
    regenerateConfirm: "Gerar outro código? O anterior deixará de funcionar.",
    addCodeTitle: "Adicionar por código",
    addCodeDescription: "Digite o Código Postal de Amizade que recebeu.",
    codeLabel: "Código Postal de Amizade",
    sendRequest: "Enviar pedido",
    requestsReceived: "Pedidos recebidos",
    requestsSent: "Pedidos enviados",
    acceptRequest: "Aceitar",
    declineRequest: "Recusar",
    noRequests: "Nenhum pedido por aqui.",
    requestSent: "Pedido postal enviado.",
    requestUnavailable: "Não foi possível criar esse pedido.",
    requestAlreadyPending: "Este pedido já está a caminho.",
    requestAlreadyFriends: "Esta amizade já está no seu caderno.",
    requestReceivedPending: "Esta pessoa já deixou um pedido para você.",
    firstFriendTitle: "Primeira conexão postal",
    firstFriendDescription: "A amizade foi aceita. Sua primeira carta real já pode começar.",
    prepareFirstLetter: "Preparar primeira carta",
    findFriend: "Encontrar um amigo",
    connectTitle: "Conectar um amigo",
    useCode: "Usar código",
    myCode: "Meu código",
    showCode: "Mostrar meu código",
    lia: {
      note: "Gosta de cartões com marcas de rota e selos antigos.",
    },
    caio: {
      note: "Sempre responde com bilhetes curtos e bem dobrados.",
    },
    mina: {
      note: "Coleciona lembranças de viagens longas.",
    },
    correspondence: {
      liaPostcard: {
        title: "Cartão das colinas de Lisboa",
        description:
          "Um cartão-postal com riscos azuis, carimbos inclinados e cheiro de maresia.",
      },
      liaSticker: {
        title: "Adesivo de bonde amarelo",
        description:
          "Uma pequena lembrança para colar perto das rotas mais ensolaradas.",
      },
      caioLetter: {
        title: "Bilhete dobrado do sul",
        description:
          "Uma carta curta, dobrada com cuidado e marcada por chuva fina.",
      },
      minaGift: {
        title: "Pacotinho de bordo",
        description:
          "Um embrulho leve com uma etiqueta de viagem atravessando o oceano.",
      },
    },
  },
  referrals: {
    invitationEyebrow: "Convite postal", invitationLoading: "Conferindo o convite...", invitationTitle: "{name} convidou você para o DUIF", invitationDescription: "Crie sua conta para começar sua própria aventura postal. A amizade continua sendo sempre uma escolha sua.", acceptInvitation: "Aceitar convite", invalidInvitationTitle: "Convite indisponível", invalidInvitationDescription: "Este convite não está mais ativo. Você ainda pode criar sua conta normalmente.",
    tab: "Indicar", title: "Convites postais", description: "Convide novas pessoas para conhecer o DUIF. Cinco jornadas completas liberam uma Coruja.", share: "Compartilhar convite", copy: "Copiar link", copied: "Link copiado", regenerate: "Gerar novo link", regenerateConfirm: "Gerar outro link? O anterior deixará de funcionar.", progress: "{current} de {target} indicações qualificadas", pendingTitle: "Uma Coruja chegou", pendingDescription: "Cinco convidados concluíram a primeira jornada. Dê um nome à sua nova mensageira.", owlName: "Nome da Coruja", claimOwl: "Resgatar Coruja", claimed: "Sua Coruja já mora no ninho.", unavailable: "Não foi possível preparar seu convite agora.", claimError: "Não foi possível resgatar a Coruja agora.",
  },
  correspondence: {
    letter: {
      name: "Carta",
      description: "Uma mensagem simples, boa para manter a amizade por perto.",
    },
    postcard: {
      name: "Cartão-postal",
      description: "Uma pequena cena de papel para marcar a rota.",
    },
    sticker: {
      name: "Adesivo",
      description: "Um mimo leve para decorar o caderno de alguém.",
    },
    smallGift: {
      name: "Pequeno presente",
      description: "Um embrulho delicado para uma entrega mais especial.",
    },
  },
  appearance: {
    nuvemPortrait: "Retrato temporário de Nuvem",
    trovaoPortrait: "Retrato temporário de Trovão",
    pipocaPortrait: "Retrato temporário de Pipoca",
    friendAuroraPortrait: "Retrato temporário de Aurora",
    friendBrisaPortrait: "Retrato temporário de Brisa",
    friendTicoPortrait: "Retrato temporário de Tico",
    friendAtlasPortrait: "Retrato temporário de Atlas",
    friendLumaPortrait: "Retrato temporário de Luma",
    friendMaplePortrait: "Retrato de Maple",
    owlPortrait: "Retrato temporário de Coruja",
  },
} satisfies TranslationDictionary;
