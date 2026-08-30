export type Locale = "pt-BR" | "en-US";
export type RegionalStampKey = "acre" | "alagoas" | "amapa" | "amazonas" | "bahia" | "ceara" |
  "distritoFederal" | "espiritoSanto" | "goias" | "maranhao" | "matoGrosso" | "matoGrossoDoSul" |
  "minasGerais" | "para" | "paraiba" | "parana" | "pernambuco" | "piaui" | "rioDeJaneiro" |
  "rioGrandeDoNorte" | "rioGrandeDoSul" | "rondonia" | "roraima" | "santaCatarina" | "saoPaulo" |
  "sergipe" | "tocantins";

export type TranslationDictionary = {
  functionalEquipment: {
    shopTitle:string; shopDescription:string; balance:string; buy:string; buying:string; purchaseError:string;
    loadoutDescription:string; lockedDuringTravel:string; backpackSlot:string; utilitySlot:string; none:string;
    saveEquipment:string; chooseEquipment:string; choose:string; change:string; locked:string; loadout:string; chooseBackpack:string; chooseUtility:string; closePicker:string; removeEquipment:string; assignedTo:string; anotherMascot:string; noOwnedEquipment:string;
    cargo:string; volumeMarks:string; noProtection:string; conditions:{rain:string;night:string;wind:string};
    hazards:{wet:string;visibility:string;night:string;wind:string;cold:string;winterCold:string;heat:string;summerHeat:string;strongSun:string};
    speed:string; slots:string; protection:string; contextual:string; current:string; withChange:string; saveError:string; saving:string; applyLoadout:string;
    uses:string; repair:string; repairing:string; repairError:string; instances:string; equippedBy:string; available:string;
    kinds:{backpack:string;utility:string};
    smallBackpack:{name:string;description:string}; mediumBackpack:{name:string;description:string}; largeBackpack:{name:string;description:string};
    raincoat:{name:string;description:string}; routeLantern:{name:string;description:string}; windGoggles:{name:string;description:string};
  };
  travelWeather: {
    weather: string; temperature:string; season: string; segment: string; effectiveSpeed: string; etaNotice: string; attribution: string; impactRange: string; impactDescription: string; openDetails:string; close:string; eyebrow:string; title:string; ofBaseSpeed:string; virtualSource:string; day:string; night:string; conditionImpact:string; activeConditions:string; impacts:{helpful:string;neutral:string;challenging:string};
    categories: { clear:string; partlyCloudy:string; cloudy:string; fogDrizzle:string; rain:string; snow:string; heavyFreezingRain:string; thunderstorm:string };
    seasons: { summer:string; autumn:string; winter:string; spring:string };
  };
  app: {
    title: string;
  };
  landmarks: {
    christTheRedeemer: { name: string; description: string; alt: string };
    masp: { name: string; description: string; alt: string };
    iguazuDevilsThroat: { name: string; description: string; alt: string };
    machuPicchu: { name: string; description: string; alt: string };
  };
  officialPostcards: {
    base: { name: string; description: string };
    christTheRedeemer: { name: string; description: string; alt: string };
    masp: { name: string; description: string; alt: string };
    iguazuDevilsThroat: { name: string; description: string; alt: string };
    machuPicchu: { name: string; description: string; alt: string };
    cities: {
      aracaju: { name: string; description: string; alt: string };
      beloHorizonte: { name: string; description: string; alt: string };
      belem: { name: string; description: string; alt: string };
      boaVista: { name: string; description: string; alt: string };
      brasilia: { name: string; description: string; alt: string };
      campoGrande: { name: string; description: string; alt: string };
      cuiaba: { name: string; description: string; alt: string };
      curitiba: { name: string; description: string; alt: string };
      florianopolis: { name: string; description: string; alt: string };
      fortaleza: { name: string; description: string; alt: string };
      goiania: { name: string; description: string; alt: string };
      joaoPessoa: { name: string; description: string; alt: string };
      macapa: { name: string; description: string; alt: string };
      maceio: { name: string; description: string; alt: string };
      manhuacu: { name: string; description: string; alt: string };
      londrina: { name: string; description: string; alt: string };
      natal: { name: string; description: string; alt: string };
      novaFriburgo: { name: string; description: string; alt: string };
      hongKong: { name: string; description: string; alt: string };
      manaus: { name: string; description: string; alt: string };
      palmas: { name: string; description: string; alt: string };
      portoAlegre: { name: string; description: string; alt: string };
      portoVelho: { name: string; description: string; alt: string };
      recife: { name: string; description: string; alt: string };
      rioBranco: { name: string; description: string; alt: string };
      rioDeJaneiro: { name: string; description: string; alt: string };
      salvador: { name: string; description: string; alt: string };
      saoLuis: { name: string; description: string; alt: string };
      saoPaulo: { name: string; description: string; alt: string };
      teresina: { name: string; description: string; alt: string };
      vitoria: { name: string; description: string; alt: string };
    };
  };
  regionalStamps: Record<RegionalStampKey, { name: string; description: string; alt: string }>;
  officialStickers: { sunStamp: { description: string }; blueEnvelope: { description: string }; routeSpark: { description: string } };
  pwaInstall: {
    eyebrow: string;
    title: string;
    installDescription: string;
    iosDescription: string;
    browserDescription: string;
    unsupportedDescription: string;
    openInstalledDescription: string;
    iosStepShare: string;
    iosStepAdd: string;
    iosStepOpen: string;
    browserStepMenu: string;
    browserStepInstall: string;
    browserStepOpen: string;
    requiredNote: string;
    install: string;
  };
  common: {
    loading: string;
    unavailable: string;
    loadError: string;
    retry: string;
  };
  notFound: {
    eyebrow: string;
    title: string;
    description: string;
    backToNest: string;
  };
  auth: {
    eyebrow: string;
    title: string;
    subtitle: string;
    unavailableTitle: string;
    unavailableDescription: string;
    loadingSession: string;
    signedInTitle: string;
    signedInDescription: string;
    modeLabel: string;
    signIn: string;
    signUp: string;
    signOut: string;
    email: string;
    password: string;
    newPassword: string;
    confirmPassword: string;
    showPassword: string;
    hidePassword: string;
    show: string;
    hide: string;
    forgotPassword: string;
    recoveryDescription: string;
    sendRecovery: string;
    genericEmailSent: string;
    verificationTitle: string;
    verificationDescription: string;
    resendConfirmation: string;
    resendIn: string;
    backToLogin: string;
    passwordRequirements: string;
    passwordLength: string;
    passwordLetter: string;
    passwordNumber: string;
    passwordMismatch: string;
    callbackTitle: string;
    confirmingEmail: string;
    callbackDescription: string;
    confirmedTitle: string;
    confirmedDescription: string;
    returnToInstalledApp: string;
    invalidLinkTitle: string;
    invalidLinkDescription: string;
    resetTitle: string;
    resetDescription: string;
    resetSuccess: string;
    requestNewLink: string;
    updatePassword: string;
    currentProfile: string;
    backToNest: string;
    submitting: string;
    errorMessage: string;
    registrationPending: string;
    languageLabel: string;
    languages: {
      ptBR: string;
      enUS: string;
    };
  };
  foundation: {
    eyebrow: string;
    retry: string;
    loading: { title: string; description: string };
    unavailable: { title: string; description: string };
    accountPending: { title: string; description: string };
    onboardingPending: { title: string; description: string };
  };
  onboarding: {
    eyebrow: string;
    progress: string;
    languageLabel: string;
    signOut: string;
    back: string;
    next: string;
    saving: string;
    genericError: string;
    welcome: { title: string; description: string };
    travel: { title: string; description: string };
    discoveries: { title: string; description: string };
    returnCollection: { title: string; description: string };
    displayName: {
      title: string;
      description: string;
      label: string;
      hint: string;
      error: string;
      taken: string;
    };
    mascotChoice: {
      title: string;
      description: string;
      loading: string;
      unavailable: string;
      previous: string;
      nextMascot: string;
      nameLabel: string;
      nameHint: string;
      nameError: string;
      attributes: string;
      trait: string;
      skills: string;
      equipment: string;
      review: string;
      reviewTitle: string;
      reviewDescription: string;
      confirm: string;
      preparing: string;
      readyTitle: string;
      readyDescription: string;
    };
    tutorialNestLabel: string;
    privateNestLabel: string;
  };
  tutorial: {
    eyebrow: string;
    continue: string;
    start: { title: string; description: string; action: string };
    boost: { badge: string };
    traveling: { title: string; description: string };
    controls: {
      hint: string;
      startHere: string;
      instructions: { mascot: string; origin: string; destination: string; overview: string };
    };
    locations: { nest: string; station: string; route: string };
    steps: Record<"preparing" | "outbound" | "discovery" | "destination" | "returning" | "returned" | "collection", { title: string; description: string }>;
    collection: { title: string; description: string; action: string };
    completed: { title: string; description: string; nestNext: string };
    postcard: { open: string; close: string; flip: string; flipHint: string; front: string; back: string; completedOn: string; backMessage: string; postmark: string; deliveredBy: string };
    rewards: { inauguralPostcard: { name: string; description: string }; firstRouteStamp: { name: string; description: string } };
  };
  nest: { eyebrow: string; title: string; description: string; searchLabel: string; searchPlaceholder: string; searchAction: string; noCityFound: string; mapLabel: string; privacyNote: string; selectedCity: string; selectionReady: string; confirmAction: string };
  postalJobs: { eyebrow: string; title: string; description: string; artworkAlt: string; distance: string; cargo: string; seeds: string; xp: string; accept: string; replace: string; depart: string; error: string; templates: Record<string, { title: string; description: string }> };
  exclusiveMissions: { title:string; eyebrow:string; badge:string; destination:string; expires:string; expired:string; accept:string; depart:string; error:string; };
  assetStudio: { eyebrow: string; title: string; description: string; newAsset: string; uploadTitle: string; key: string; type: string; file: string; altKey: string; decorative: string; author: string; saveDraft: string; draftSaved: string; publish: string; published: string; archive: string; archived: string; restore: string; restored: string; usage: string; filters: string; all: string; loading: string; error: string };
  geonamesAdmin: { eyebrow: string; title: string; description: string; activeCities: string; latestSuccess: string; noSuccess: string; refresh: string; confirm: string; cancel: string; confirmTitle: string; confirmDescription: string; history: string; status: string; processed: string; imported: string; updated: string; archived: string; running: string; failed: string; succeeded: string; queued: string; refreshStarted: string };
  units: {
    kilometers: string;
  };
  home: {
    iconAlt: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    noteLabel: string;
    noteTitle: string;
    noteBody: string;
    demo: {
      actionsLabel: string;
      primaryAction: string;
      secondaryAction: string;
      tabsLabel: string;
      cardsLabel: string;
      firstCardLabel: string;
      firstCardTitle: string;
      firstCardDescription: string;
      firstCardMeta: string;
      secondCardLabel: string;
      secondCardTitle: string;
      secondCardDescription: string;
      secondCardMeta: string;
    };
  };
  navigation: {
    back: string;
    backToFriends: string;
    backToNest: string;
    nest: string;
    letters: string;
    collection: string;
    map: string;
    friends: string;
    shop: string;
    shopUnavailable: string;
    referralRewardAvailable: string;
  };
  mascot: {
    myMascots: string;
    level: string;
    xp: string;
    attributes: string;
    speed: string;
    stamina: string;
    orientation: string;
    luck: string;
    specialTrait: string;
    equipment: string;
    equipped: string;
    notEquipped: string;
    traveling: string;
    skills: string;
    train: string;
    viewTrip: string;
    customization: string;
    currentDelivery: string;
    noDeliveryTitle: string;
    noDeliveryDescription: string;
    route: string;
    origin: string;
    destination: string;
    distance: string;
    status: string;
    visualPreview: string;
    selectedMascot: string;
    chooseMascot: string;
    bottomNav: string;
    loadingCatalog: string;
    flightRange:string; naturalSlots:string; flightCapReached:string; nextFlightMilestone:string; unlockAtLevel:string;routeWithinRange:string;routeOutOfRange:string;familiarity:string;
    skillNotice: { title: string; description: string; retiredDescription: string; waterPathRetiredDescription: string; open: string; dialogTitle: string; choose: string; transfer: string; transferPreview: string; close: string };
  };
  prestige:{firstHorizon:{name:string;description:string};routeAtlas:{name:string;description:string};letterSky:{name:string;description:string};nestAmongStars:{name:string;description:string}};
  familiarity:{new:string;known:string;familiar:string;mastered:string};
  nestHub: {
    eyebrow: string; title: string; tagline: string; currencySummary: string; seeds: string; crystals: string; settingsSoon: string; defaultAvatar: string; profileName: string; nestName: string; nestOf: string; location: string; levelZero: string; xpZero: string; sections: string; profileTitle: string; profileDescription: string; mascotTitle: string; mascotDescription: string; mailboxTitle: string; mailboxDescription: string; atNest: string; traveling: string; newCorrespondence: string; travelingTitle: string; noTravelTitle: string; noTravelDescription: string;
  };
  profile: { eyebrow: string; email: string; location: string; joined: string; level: string; xp: string; seeds: string; crystals: string; readOnlyNotice: string; };
  mailbox: {
    eyebrow: string;
    title: string;
    description: string;
    open: string;
    loading: string;
    error: string;
    retry: string;
    emptyTitle: string;
    emptyDescription: string;
    letterList: string;
    from: string;
    deliveredBy: string;
    openLetter: string;
    closeLetter: string;
    showEnvelope: string;
    letterTitle: string;
    emptyLetter: string;
    reply: string;
    surpriseSender: string;
    surpriseTitle: string;
    surpriseDescription: string;
    postcardWithoutMessage: string;
    returnReplyLabel: string;
    returnReplyDeadline: string;
    returnReplyConfirmed: string;
    sendReturnReply: string;
    replying: string;
    returnWindowRemaining: string;
    prepareReturnReply: string;
    returnReplyFlowTitle: string;
    returnReplyLoading: string;
    returnReplyUnavailable: string;
    returnReplyExpired: string;
    returnReplyConfirmedDescription: string;
    writeReturnReply: string;
    toOriginalSender: string;
    returnReplySubmitError: string;
    visitingMascot: string;
    minutesRemaining: string;
    openVisitorLetter: string;
    correspondenceUnavailable: string;
  };
  send: {
    skillPreview:{title:string;loading:string;unavailable:string;active:string;inactive:string;weatherDependent:string;weatherNotice:string;reasons:{snapshot:string;conditionNotMet:string}};
    steps: { friend: string; mascot: string; correspondence: string; finishing: string; stamp: string; postmark: string; review: string; navigation: string; back: string; next: string };
    startAction: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    chooseFriend: string;
    chooseMascot: string;
    chooseCorrespondence: string;
    summary: string;
    confirmationTitle: string;
    confirmationDescription: string;
    sendButton: string;
    sendAnother: string;
    backToMascot: string;
    estimatedDuration: string;
    preparationTime: string;
    outboundDuration: string;
    returnDuration: string;
    discoveryReach: string;
    rarityPotential: string;
    routeProfile: string;
    shortRoute: string;
    longRoutePenalty: string;
    longRouteMitigated: string;
    effectFastReturn: string;
    effectDiscoveryReach: string;
    effectSafeLongRoute: string;
    effectSafeShortRoute: string;
    selectedFriend: string;
    selectedMascot: string;
    selectedCorrespondence: string;
    readyHint: string;
    incompleteHint: string;
    loadingData: string;
    sending: string;
    errorMessage: string;
    mascotUnavailable: string;
    noAvailableMascots: string;
    viewActiveTrips: string;
    composeTitle: string;
    contentPreview: string;
    contentInvalid: string;
    availableLater: string;
    characterCount: string;
    previewLetter: string;
    closeLetterPreview: string;
    selectedStickers: string;
    removeSticker: string;
    letterPlaceholder: string;
    postcardPlaceholder: string;
    giftPlaceholder: string;
    giftPendingTitle: string;
    giftPendingDescription: string;
    postalFinishing: {
      title: string;
      description: string;
      stampTitle: string;
      stampDescription: string;
      postmarkTitle: string;
      postmarkDescription: string;
      defaultStamp: string;
      defaultPostmark: string;
      reputationLevel: string;
      modelLabel: string;
      colorLabel: string;
      unlockLevel: string;
      airMail: string;
      models: { classic: string; route: string; wing: string };
      colors: { brown: string; blue: string; red: string; green: string; gold: string; plum: string; charcoal: string; teal: string };
      chooseStamp: string;
      previewStamp: string;
      closeStampPreview: string;
      summaryLabel: string;
    };
    content: {
      letterLabel: string;
      postcardLabel: string;
      postcardVariantLabel: string;
      stickerLabel: string;
      giftLabel: string;
      emptyPreview: string;
      stickers: {
        sunStamp: string;
        blueEnvelope: string;
        routeSpark: string;
      };
      postcardVariants: {
        city: string;
        event: string;
        photo: string;
      };
    };
  };
  map: {
    landmarks: {
      title: string;
      discovered: string;
      newTitle: string;
      newDescription: string;
      learnMore: string;
      dismiss: string;
      close: string;
      category: string;
      cultural: string;
      empty: string;
    };
    eyebrow: string;
    title: string;
    subtitle: string;
    tripStatus: string;
    closeTripStatus: string;
    selectMascot: string;
    previousMascot: string;
    nextMascot: string;
    currentLeg: string;
    discoveries: string;
    cargoFound: string;
    carryingCargo: string;
    tripCompleted: string;
    deliveryFinished: string;
    finishedDeliveries: string;
    collectFinishedDelivery: string;
    cargoFoundDescription: string;
    completedDescription: string;
    routeCargo: string;
    primaryReward: string;
    visualCargo: string;
    collectionPending: string;
    rewardCollected: string;
    noPrimaryReward: string;
    routeCargoPreviewNote: string;
    goToCollection: string;
    ownerCollectionOnly: string;
    openCollection: string;
    mockedRewards: string;
    persistedRewards: string;
    discovered: string;
    newDiscovery: string;
    carriedDiscovery: string;
    discoveryToastSingle: string;
    discoveryToastMultiple: string;
    onTheRoute: string;
    backToMascot: string;
    unavailable: string;
    cameraControls: string;
    activeMapTools: string;
    overview: string;
    focusMascot: string;
    followMascot: string;
    stopFollowing: string;
    focusOrigin: string;
    focusDestination: string;
    backToTrip: string;
    rewardDetails: string;
    futureReward: string;
    futureRewardState: string;
    futureRewardHint: string;
    approximateRegion: string;
    rewardType: string;
    rarity: string;
    legs: {
      preparing: string;
      outbound: string;
      delivered: string;
      returning: string;
      returned: string;
      completed: string;
    };
    rewardKinds: {
      badge: string;
      postcard: string;
      stamp: string;
      souvenir: string;
      material: string;
      eventItem: string;
    };
    rewards: {
      londrinaPostcard: {
        name: string;
        description: string;
      };
      cambeSouvenir: {
        name: string;
        description: string;
      };
      rolandiaBadge: {
        name: string;
        description: string;
      };
      arapongasMaterial: {
        name: string;
        description: string;
      };
      apucaranaStamp: {
        name: string;
        description: string;
      };
      maringaEvent: {
        name: string;
        description: string;
      };
    };
  };
  postalTraffic: {
    title: string;
    nearbyPets: string;
    empty: string;
    progress: string;
    travelState: string;
    owner: string;
    openFriendProfile: string;
    privateOwner: string;
    outOfRange: string;
    visibility: {
      friend: string;
      public: string;
    };
    legs: {
      preparing: string;
      outbound: string;
      delivered: string;
      returning: string;
      returned: string;
      completed: string;
    };
    regions: {
      acreBrazil: string;
      alagoasBrazil: string;
      amapaBrazil: string;
      amazonasBrazil: string;
      paranaBrazil: string;
      rioGrandeDoSulBrazil: string;
      santaCatarinaBrazil: string;
      goiasBrazil: string;
      distritoFederalBrazil: string;
      minasGeraisBrazil: string;
      espiritoSantoBrazil: string;
      rioDeJaneiroBrazil: string;
      saoPauloBrazil: string;
      bahiaBrazil: string;
      cearaBrazil: string;
      maranhaoBrazil: string;
      matoGrossoBrazil: string;
      matoGrossoDoSulBrazil: string;
      paraBrazil: string;
      paraibaBrazil: string;
      pernambucoBrazil: string;
      piauiBrazil: string;
      rioGrandeDoNorteBrazil: string;
      rondoniaBrazil: string;
      roraimaBrazil: string;
      sergipeBrazil: string;
      tocantinsBrazil: string;
    };
  };
  species: {
    carrierPigeon: string;
    messengerFalcon: string;
    mailDuck: string;
    postalOwl: string;
  };
  archetypes: {
    suggestedNames: {
      nuvem: string;
      trovao: string;
      pipoca: string;
      owl: string;
    };
  };
  traits: {
    steadyRoute: {
      name: string;
      description: string;
    };
    directFlight: {
      name: string;
      description: string;
    };
    curiousFinder: {
      name: string;
      description: string;
    };
    nightRoute: { name: string; description: string; };
  };
  equipment: {
    rarity: {
      common: string;
      uncommon: string;
      rare: string;
    };
    canvasPostalBag: {
      name: string;
      description: string;
    };
    blueRouteScarf: {
      name: string;
      description: string;
    };
    flightGoggles: {
      name: string;
      description: string;
    };
    urgentBadge: {
      name: string;
      description: string;
    };
    travelCap: {
      name: string;
      description: string;
    };
    featherCharm: {
      name: string;
      description: string;
    };
    smallSatchel: {
      name: string;
      description: string;
    };
  };
  skills: {
    fixed: string;
    individual: string;
    longRoute: {
      name: string;
      description: string;
    };
    softLanding: {
      name: string;
      description: string;
    };
    quickDispatch: {
      name: string;
      description: string;
    };
    crosswindInstinct: {
      name: string;
      description: string;
    };
    shinyThing: {
      name: string;
      description: string;
    };
    happyDetour: {
      name: string;
      description: string;
    };
    owlNightWatch: { name: string; description: string; };
    postalMemory: { name: string; description: string; };
    balancedLoad: { name: string; description: string; };
    returnMail: { name: string; description: string; };
    cartographicEye: { name: string; description: string; };
    solarWing: { name: string; description: string; };
    urbanStart: { name: string; description: string; };
    aerodynamicLoad: { name: string; description: string; };
    waterPath: { name: string; description: string; };
    waterproofFeathers: { name: string; description: string; };
    firstTrip: { name: string; description: string; };
    nightVigil: { name: string; description: string; };
    silentFlight: { name: string; description: string; };
    lunarMemory: { name: string; description: string; };
    nightLoad: { name: string; description: string; };
    dawnGuardian: { name: string; description: string; };
  };
  delivery: {
    progress: string;
    remainingTime: string;
    routePreview: string;
    status: {
      available: string;
      preparing: string;
      outbound: string;
      delivered: string;
      returning: string;
      returned: string;
      completed: string;
    };
  };
  rewards: {
    eyebrow: string;
    title: string;
    readyTitle: string;
    readyDescription: string;
    travelingTitle: string;
    travelingDescription: string;
    completedTitle: string;
    completedDescription: string;
    loading: string;
    collectButton: string;
    collectAllButton: string;
    collecting: string;
    collectError: string;
    backToMascot: string;
    backToMap: string;
    xpGained: string;
    itemFound: string;
    fullCargoTitle: string;
    primaryReward: string;
    routeCargo: string;
    collectionPending: string;
    ownerCollectionOnly: string;
    inventory: string;
    collected: string;
    rarity: string;
    progressionTitle: string;
    reputationXp: string;
    mascotFlightXp: string;
    skillXp: string;
    skillEffectApplied: string;
    affinity: string;
    affinityLongDistance: string;
    affinityUrban: string;
    affinityDiscovery: string;
    items: {
      wornRouteStamp: {
        name: string;
        description: string;
      };
      blueAirmailLabel: {
        name: string;
        description: string;
      };
      goldenCompassPin: {
        name: string;
        description: string;
      };
    };
  };
  inventory: {
    eyebrow: string;
    title: string;
    subtitle: string;
    categoriesLabel: string;
    distinctTotal: string;
    acquiredTotal: string;
    equippedTotal: string;
    raritySummary: string;
    emptySlotTitle: string;
    emptySlotDescription: string;
    source: string;
    category: string;
    categories: {
      all: string;
      equipment: string;
      stamps: string;
      keepsakes: string;
      routeMarks: string;
    };
    sources: {
      homeNest: string;
      starterKit: string;
      routeReward: string;
      statePassage: string;
      longRouteFind: string;
    };
  };
  shop: {
    eyebrow: string;
    title: string;
    subtitle: string;
    prototypeNotice: string;
    categoriesLabel: string;
    prototypePrice: string;
    viewDetails: string;
    close: string;
    detailsTitle: string;
    mascotPreview: string;
    mascotPreviewNote: string;
    emptyTitle: string;
    emptyDescription: string;
    categories: {
      all: string;
      cosmetics: string;
      stickers: string;
      postcards: string;
      decorations: string;
    };
    currencies: {
      seeds: string;
      crystals: string;
    };
    items: {
      crimsonCourierScarf: { name: string; description: string };
      meadowPostCap: { name: string; description: string };
      sunnyRouteSticker: { name: string; description: string };
      blueEnvelopeSticker: { name: string; description: string };
      coastalTownPostcard: { name: string; description: string };
      lanternFestivalPostcard: { name: string; description: string };
      brassNestPlaque: { name: string; description: string };
      airmailProfileRibbon: { name: string; description: string };
    };
  };
  locations: {
    londrina: string;
    cambe: string;
    rolandia: string;
    arapongas: string;
    apucarana: string;
    maringa: string;
    beloHorizonte: string;
    salvador: string;
    rioBranco: string;
    saoPaulo: string;
    lisbon: string;
    curitiba: string;
    toronto: string;
  };
  friends: {
    eyebrow: string;
    title: string;
    subtitle: string;
    profileTitle: string;
    viewProfile: string;
    sendToFriend: string;
    quickSend: string;
    friendshipLevel: string;
    exchangeCount: string;
    friendMascots: string;
    receivedCorrespondence: string;
    location: string;
    backToFriends: string;
    noCorrespondence: string;
    mascotLabel: string;
    emptyTitle: string;
    emptyDescription: string;
    postalCodeTitle: string;
    postalCodeDescription: string;
    copyCode: string;
    copiedCode: string;
    shareCode: string;
    regenerateCode: string;
    regenerateConfirm: string;
    addCodeTitle: string;
    addCodeDescription: string;
    codeLabel: string;
    sendRequest: string;
    requestsReceived: string;
    requestsSent: string;
    acceptRequest: string;
    declineRequest: string;
    noRequests: string;
    requestSent: string;
    requestUnavailable: string;
    requestAlreadyPending: string;
    requestAlreadyFriends: string;
    requestReceivedPending: string;
    firstFriendTitle: string;
    firstFriendDescription: string;
    prepareFirstLetter: string;
    findFriend: string;
    connectTitle: string;
    useCode: string;
    myCode: string;
    showCode: string;
    lia: {
      note: string;
    };
    caio: {
      note: string;
    };
    mina: {
      note: string;
    };
    correspondence: {
      liaPostcard: {
        title: string;
        description: string;
      };
      liaSticker: {
        title: string;
        description: string;
      };
      caioLetter: {
        title: string;
        description: string;
      };
      minaGift: {
        title: string;
        description: string;
      };
    };
  };
  referrals: {
    invitationEyebrow: string; invitationLoading: string; invitationTitle: string; invitationDescription: string; acceptInvitation: string; invalidInvitationTitle: string; invalidInvitationDescription: string;
    tab: string; title: string; description: string; share: string; copy: string; copied: string; regenerate: string; regenerateConfirm: string; progress: string; pendingTitle: string; pendingDescription: string; owlName: string; claimOwl: string; claimed: string; unavailable: string; claimError: string;
  };
  correspondence: {
    letter: {
      name: string;
      description: string;
    };
    postcard: {
      name: string;
      description: string;
    };
    sticker: {
      name: string;
      description: string;
    };
    smallGift: {
      name: string;
      description: string;
    };
  };
  appearance: {
    nuvemPortrait: string;
    trovaoPortrait: string;
    pipocaPortrait: string;
    friendAuroraPortrait: string;
    friendBrisaPortrait: string;
    friendTicoPortrait: string;
    friendAtlasPortrait: string;
    friendLumaPortrait: string;
    friendMaplePortrait: string;
    owlPortrait: string;
  };
};

export type TranslationKey =
  | "landmarks.christTheRedeemer.name" | "landmarks.christTheRedeemer.description" | "landmarks.christTheRedeemer.alt" | "landmarks.masp.name" | "landmarks.masp.description" | "landmarks.masp.alt"
  | "landmarks.iguazuDevilsThroat.name" | "landmarks.iguazuDevilsThroat.description" | "landmarks.iguazuDevilsThroat.alt" | "landmarks.machuPicchu.name" | "landmarks.machuPicchu.description" | "landmarks.machuPicchu.alt"
  | "map.landmarks.title" | "map.landmarks.discovered" | "map.landmarks.newTitle" | "map.landmarks.newDescription" | "map.landmarks.learnMore" | "map.landmarks.dismiss" | "map.landmarks.close" | "map.landmarks.category" | "map.landmarks.cultural" | "map.landmarks.empty"
  | "send.skillPreview.title" | "send.skillPreview.loading" | "send.skillPreview.unavailable" | "send.skillPreview.active" | "send.skillPreview.inactive" | "send.skillPreview.weatherDependent" | "send.skillPreview.weatherNotice" | "send.skillPreview.reasons.snapshot" | "send.skillPreview.reasons.conditionNotMet"
  | "functionalEquipment.shopTitle" | "functionalEquipment.shopDescription" | "functionalEquipment.balance" | "functionalEquipment.buy" | "functionalEquipment.buying" | "functionalEquipment.purchaseError"
  | "functionalEquipment.loadoutDescription" | "functionalEquipment.lockedDuringTravel" | "functionalEquipment.backpackSlot" | "functionalEquipment.utilitySlot" | "functionalEquipment.none"
  | "functionalEquipment.speed" | "functionalEquipment.slots" | "functionalEquipment.protection" | "functionalEquipment.contextual" | "functionalEquipment.saveError" | "functionalEquipment.saving" | "functionalEquipment.applyLoadout"
  | "functionalEquipment.current" | "functionalEquipment.withChange" | "functionalEquipment.saveEquipment" | "functionalEquipment.chooseEquipment" | "functionalEquipment.choose" | "functionalEquipment.change" | "functionalEquipment.locked" | "functionalEquipment.loadout" | "functionalEquipment.chooseBackpack" | "functionalEquipment.chooseUtility" | "functionalEquipment.closePicker" | "functionalEquipment.removeEquipment" | "functionalEquipment.assignedTo" | "functionalEquipment.anotherMascot" | "functionalEquipment.noOwnedEquipment" | "functionalEquipment.cargo" | "functionalEquipment.volumeMarks" | "functionalEquipment.noProtection" | "functionalEquipment.conditions.rain" | "functionalEquipment.conditions.night" | "functionalEquipment.conditions.wind"
  | "functionalEquipment.hazards.wet" | "functionalEquipment.hazards.visibility" | "functionalEquipment.hazards.night" | "functionalEquipment.hazards.wind" | "functionalEquipment.hazards.cold" | "functionalEquipment.hazards.winterCold" | "functionalEquipment.hazards.heat" | "functionalEquipment.hazards.summerHeat" | "functionalEquipment.hazards.strongSun"
  | "functionalEquipment.uses" | "functionalEquipment.repair" | "functionalEquipment.repairing" | "functionalEquipment.repairError" | "functionalEquipment.instances" | "functionalEquipment.equippedBy" | "functionalEquipment.available"
  | "functionalEquipment.kinds.backpack" | "functionalEquipment.kinds.utility"
  | "functionalEquipment.smallBackpack.name" | "functionalEquipment.smallBackpack.description" | "functionalEquipment.mediumBackpack.name" | "functionalEquipment.mediumBackpack.description" | "functionalEquipment.largeBackpack.name" | "functionalEquipment.largeBackpack.description"
  | "functionalEquipment.raincoat.name" | "functionalEquipment.raincoat.description" | "functionalEquipment.routeLantern.name" | "functionalEquipment.routeLantern.description" | "functionalEquipment.windGoggles.name" | "functionalEquipment.windGoggles.description"
  | "travelWeather.weather"
  | "travelWeather.temperature"
  | "travelWeather.season"
  | "travelWeather.segment"
  | "travelWeather.effectiveSpeed"
  | "travelWeather.etaNotice"
  | "travelWeather.attribution"
  | "travelWeather.impactRange"
  | "travelWeather.impactDescription"
  | "travelWeather.openDetails"
  | "travelWeather.close"
  | "travelWeather.eyebrow"
  | "travelWeather.title"
  | "travelWeather.ofBaseSpeed"
  | "travelWeather.virtualSource"
  | "travelWeather.day"
  | "travelWeather.night"
  | "travelWeather.conditionImpact"
  | "travelWeather.activeConditions"
  | "travelWeather.impacts.helpful"
  | "travelWeather.impacts.neutral"
  | "travelWeather.impacts.challenging"
  | "travelWeather.categories.clear"
  | "travelWeather.categories.partlyCloudy"
  | "travelWeather.categories.cloudy"
  | "travelWeather.categories.fogDrizzle"
  | "travelWeather.categories.rain"
  | "travelWeather.categories.snow"
  | "travelWeather.categories.heavyFreezingRain"
  | "travelWeather.categories.thunderstorm"
  | "travelWeather.seasons.summer"
  | "travelWeather.seasons.autumn"
  | "travelWeather.seasons.winter"
  | "travelWeather.seasons.spring"
  | "nestHub.eyebrow" | "nestHub.title" | "nestHub.tagline" | "nestHub.currencySummary" | "nestHub.seeds" | "nestHub.crystals" | "nestHub.settingsSoon" | "nestHub.defaultAvatar" | "nestHub.profileName" | "nestHub.nestName" | "nestHub.nestOf" | "nestHub.location" | "nestHub.levelZero" | "nestHub.xpZero" | "nestHub.sections" | "nestHub.profileTitle" | "nestHub.profileDescription" | "nestHub.mascotTitle" | "nestHub.mascotDescription" | "nestHub.mailboxTitle" | "nestHub.mailboxDescription" | "nestHub.atNest" | "nestHub.traveling" | "nestHub.newCorrespondence" | "nestHub.travelingTitle" | "nestHub.noTravelTitle" | "nestHub.noTravelDescription"
  | "profile.eyebrow" | "profile.email" | "profile.location" | "profile.joined" | "profile.level" | "profile.xp" | "profile.seeds" | "profile.crystals" | "profile.readOnlyNotice"
  | "mailbox.eyebrow"
  | "mailbox.title"
  | "mailbox.description"
  | "mailbox.open"
  | "mailbox.loading"
  | "mailbox.error"
  | "mailbox.retry"
  | "mailbox.emptyTitle"
  | "mailbox.emptyDescription"
  | "mailbox.letterList"
  | "mailbox.from"
  | "mailbox.deliveredBy"
  | "mailbox.openLetter"
  | "mailbox.closeLetter"
  | "mailbox.showEnvelope"
  | "mailbox.letterTitle"
  | "mailbox.emptyLetter"
  | "mailbox.reply"
  | "foundation.eyebrow"
  | "foundation.retry"
  | "foundation.loading.title"
  | "foundation.loading.description"
  | "foundation.unavailable.title"
  | "foundation.unavailable.description"
  | "foundation.accountPending.title"
  | "foundation.accountPending.description"
  | "foundation.onboardingPending.title"
  | "foundation.onboardingPending.description"
  | "onboarding.eyebrow"
  | "onboarding.progress"
  | "onboarding.languageLabel"
  | "onboarding.signOut"
  | "onboarding.back"
  | "onboarding.next"
  | "onboarding.saving"
  | "onboarding.genericError"
  | "onboarding.welcome.title"
  | "onboarding.welcome.description"
  | "onboarding.travel.title"
  | "onboarding.travel.description"
  | "onboarding.discoveries.title"
  | "onboarding.discoveries.description"
  | "onboarding.returnCollection.title"
  | "onboarding.returnCollection.description"
  | "onboarding.displayName.title"
  | "onboarding.displayName.description"
  | "onboarding.displayName.label"
  | "onboarding.displayName.hint"
  | "onboarding.displayName.error"
  | "onboarding.displayName.taken"
  | "onboarding.mascotChoice.title"
  | "onboarding.mascotChoice.description"
  | "onboarding.mascotChoice.loading"
  | "onboarding.mascotChoice.unavailable"
  | "onboarding.mascotChoice.previous"
  | "onboarding.mascotChoice.nextMascot"
  | "onboarding.mascotChoice.nameLabel"
  | "onboarding.mascotChoice.nameHint"
  | "onboarding.mascotChoice.nameError"
  | "onboarding.mascotChoice.attributes"
  | "onboarding.mascotChoice.trait"
  | "onboarding.mascotChoice.skills"
  | "onboarding.mascotChoice.equipment"
  | "onboarding.mascotChoice.review"
  | "onboarding.mascotChoice.reviewTitle"
  | "onboarding.mascotChoice.reviewDescription"
  | "onboarding.mascotChoice.confirm"
  | "onboarding.mascotChoice.preparing"
  | "onboarding.mascotChoice.readyTitle"
  | "onboarding.mascotChoice.readyDescription"
  | "onboarding.tutorialNestLabel"
  | "onboarding.privateNestLabel"
  | "tutorial.eyebrow" | "tutorial.continue"
  | "tutorial.start.title" | "tutorial.start.description" | "tutorial.start.action"
  | "tutorial.boost.badge"
  | "tutorial.traveling.title" | "tutorial.traveling.description"
  | "tutorial.controls.hint" | "tutorial.controls.startHere"
  | "tutorial.controls.instructions.mascot" | "tutorial.controls.instructions.origin"
  | "tutorial.controls.instructions.destination" | "tutorial.controls.instructions.overview"
  | "tutorial.locations.nest" | "tutorial.locations.station" | "tutorial.locations.route"
  | "tutorial.steps.preparing.title" | "tutorial.steps.preparing.description"
  | "tutorial.steps.outbound.title" | "tutorial.steps.outbound.description"
  | "tutorial.steps.discovery.title" | "tutorial.steps.discovery.description"
  | "tutorial.steps.destination.title" | "tutorial.steps.destination.description"
  | "tutorial.steps.returning.title" | "tutorial.steps.returning.description"
  | "tutorial.steps.returned.title" | "tutorial.steps.returned.description"
  | "tutorial.steps.collection.title" | "tutorial.steps.collection.description"
  | "tutorial.collection.title" | "tutorial.collection.description" | "tutorial.collection.action"
  | "tutorial.completed.title" | "tutorial.completed.description" | "tutorial.completed.nestNext"
  | "tutorial.rewards.inauguralPostcard.name" | "tutorial.rewards.inauguralPostcard.description"
  | "tutorial.rewards.firstRouteStamp.name" | "tutorial.rewards.firstRouteStamp.description"
  | "auth.registrationPending"
  | "auth.languageLabel"
  | "auth.languages.ptBR"
  | "auth.languages.enUS"
  | "app.title"
  | "pwaInstall.eyebrow"
  | "pwaInstall.title"
  | "pwaInstall.installDescription"
  | "pwaInstall.iosDescription"
  | "pwaInstall.browserDescription"
  | "pwaInstall.unsupportedDescription"
  | "pwaInstall.openInstalledDescription"
  | "pwaInstall.iosStepShare"
  | "pwaInstall.iosStepAdd"
  | "pwaInstall.iosStepOpen"
  | "pwaInstall.browserStepMenu"
  | "pwaInstall.browserStepInstall"
  | "pwaInstall.browserStepOpen"
  | "pwaInstall.requiredNote"
  | "pwaInstall.install"
  | "common.loading"
  | "common.unavailable"
  | "common.loadError"
  | "common.retry"
  | "notFound.eyebrow"
  | "notFound.title"
  | "notFound.description"
  | "notFound.backToNest"
  | "auth.eyebrow"
  | "auth.title"
  | "auth.subtitle"
  | "auth.unavailableTitle"
  | "auth.unavailableDescription"
  | "auth.loadingSession"
  | "auth.signedInTitle"
  | "auth.signedInDescription"
  | "auth.modeLabel"
  | "auth.signIn"
  | "auth.signUp"
  | "auth.signOut"
  | "auth.email"
  | "auth.password"
  | "auth.newPassword"
  | "auth.confirmPassword"
  | "auth.showPassword"
  | "auth.hidePassword"
  | "auth.show"
  | "auth.hide"
  | "auth.forgotPassword"
  | "auth.recoveryDescription"
  | "auth.sendRecovery"
  | "auth.genericEmailSent"
  | "auth.verificationTitle"
  | "auth.verificationDescription"
  | "auth.resendConfirmation"
  | "auth.resendIn"
  | "auth.backToLogin"
  | "auth.passwordRequirements"
  | "auth.passwordLength"
  | "auth.passwordLetter"
  | "auth.passwordNumber"
  | "auth.passwordMismatch"
  | "auth.callbackTitle"
  | "auth.confirmingEmail"
  | "auth.callbackDescription"
  | "auth.confirmedTitle"
  | "auth.confirmedDescription"
  | "auth.returnToInstalledApp"
  | "auth.invalidLinkTitle"
  | "auth.invalidLinkDescription"
  | "auth.resetTitle"
  | "auth.resetDescription"
  | "auth.resetSuccess"
  | "auth.requestNewLink"
  | "auth.updatePassword"
  | "auth.currentProfile"
  | "auth.backToNest"
  | "auth.submitting"
  | "auth.errorMessage"
  | "units.kilometers"
  | "home.eyebrow"
  | "home.iconAlt"
  | "home.title"
  | "home.subtitle"
  | "home.noteLabel"
  | "home.noteTitle"
  | "home.noteBody"
  | "home.demo.actionsLabel"
  | "home.demo.primaryAction"
  | "home.demo.secondaryAction"
  | "home.demo.tabsLabel"
  | "home.demo.cardsLabel"
  | "home.demo.firstCardLabel"
  | "home.demo.firstCardTitle"
  | "home.demo.firstCardDescription"
  | "home.demo.firstCardMeta"
  | "home.demo.secondCardLabel"
  | "home.demo.secondCardTitle"
  | "home.demo.secondCardDescription"
  | "home.demo.secondCardMeta"
  | "navigation.nest"
  | "navigation.back"
  | "navigation.backToFriends"
  | "navigation.backToNest"
  | "navigation.letters"
  | "navigation.collection"
  | "navigation.map"
  | "navigation.friends"
  | "navigation.shop"
  | "navigation.shopUnavailable"
  | "navigation.referralRewardAvailable"
  | "mascot.myMascots"
  | "mascot.level"
  | "mascot.xp"
  | "mascot.attributes"
  | "mascot.speed"
  | "mascot.stamina"
  | "mascot.orientation"
  | "mascot.luck"
  | "mascot.specialTrait"
  | "mascot.equipment"
  | "mascot.equipped"
  | "mascot.notEquipped"
  | "mascot.traveling"
  | "mascot.skills"
  | "mascot.train"
  | "mascot.viewTrip"
  | "mascot.customization"
  | "mascot.currentDelivery"
  | "mascot.noDeliveryTitle"
  | "mascot.noDeliveryDescription"
  | "mascot.route"
  | "mascot.origin"
  | "mascot.destination"
  | "mascot.distance"
  | "mascot.status"
  | "mascot.visualPreview"
  | "mascot.flightRange"
  | "mascot.naturalSlots"
  | "mascot.flightCapReached"
  | "mascot.nextFlightMilestone"
  | "mascot.unlockAtLevel"
  | "mascot.routeWithinRange"
  | "mascot.routeOutOfRange"
  | "mascot.familiarity"
  | "familiarity.new"
  | "familiarity.known"
  | "familiarity.familiar"
  | "familiarity.mastered"
  | "prestige.firstHorizon.name"
  | "prestige.firstHorizon.description"
  | "prestige.routeAtlas.name"
  | "prestige.routeAtlas.description"
  | "prestige.letterSky.name"
  | "prestige.letterSky.description"
  | "prestige.nestAmongStars.name"
  | "prestige.nestAmongStars.description"
  | "mascot.selectedMascot"
  | "mascot.chooseMascot"
  | "mascot.bottomNav"
  | "mascot.loadingCatalog"
  | "mascot.skillNotice.title"
  | "mascot.skillNotice.description"
  | "mascot.skillNotice.retiredDescription"
  | "mascot.skillNotice.waterPathRetiredDescription"
  | "mascot.skillNotice.open"
  | "mascot.skillNotice.dialogTitle"
  | "mascot.skillNotice.choose"
  | "mascot.skillNotice.transfer"
  | "mascot.skillNotice.transferPreview"
  | "mascot.skillNotice.close"
  | "send.startAction"
  | "send.eyebrow"
  | "send.title"
  | "send.subtitle"
  | "send.steps.friend"
  | "send.steps.mascot"
  | "send.steps.correspondence"
  | "send.steps.finishing"
  | "send.steps.stamp"
  | "send.steps.postmark"
  | "send.steps.review"
  | "send.steps.navigation"
  | "send.steps.back"
  | "send.steps.next"
  | "send.chooseFriend"
  | "send.chooseMascot"
  | "send.chooseCorrespondence"
  | "send.summary"
  | "send.confirmationTitle"
  | "send.confirmationDescription"
  | "send.sendButton"
  | "send.sendAnother"
  | "send.backToMascot"
  | "send.estimatedDuration"
  | "send.preparationTime"
  | "send.outboundDuration"
  | "send.returnDuration"
  | "send.discoveryReach"
  | "send.rarityPotential"
  | "send.routeProfile"
  | "send.shortRoute"
  | "send.longRoutePenalty"
  | "send.longRouteMitigated"
  | "send.effectFastReturn"
  | "send.effectDiscoveryReach"
  | "send.effectSafeLongRoute"
  | "send.effectSafeShortRoute"
  | "send.selectedFriend"
  | "send.selectedMascot"
  | "send.selectedCorrespondence"
  | "send.readyHint"
  | "send.incompleteHint"
  | "send.loadingData"
  | "send.sending"
  | "send.errorMessage"
  | "send.mascotUnavailable"
  | "send.noAvailableMascots"
  | "send.viewActiveTrips"
  | "send.composeTitle"
  | "send.contentPreview"
  | "send.contentInvalid"
  | "send.availableLater"
  | "send.characterCount"
  | "send.previewLetter"
  | "send.closeLetterPreview"
  | "send.selectedStickers"
  | "send.letterPlaceholder"
  | "send.postcardPlaceholder"
  | "send.giftPlaceholder"
  | "send.giftPendingTitle"
  | "send.giftPendingDescription"
  | "send.postalFinishing.title"
  | "send.postalFinishing.description"
  | "send.postalFinishing.stampTitle"
  | "send.postalFinishing.stampDescription"
  | "send.postalFinishing.postmarkTitle"
  | "send.postalFinishing.postmarkDescription"
  | "send.postalFinishing.defaultStamp"
  | "send.postalFinishing.defaultPostmark"
  | "send.postalFinishing.reputationLevel"
  | "send.postalFinishing.modelLabel"
  | "send.postalFinishing.colorLabel"
  | "send.postalFinishing.unlockLevel"
  | "send.postalFinishing.airMail"
  | "send.postalFinishing.models.classic"
  | "send.postalFinishing.models.route"
  | "send.postalFinishing.models.wing"
  | "send.postalFinishing.colors.brown"
  | "send.postalFinishing.colors.blue"
  | "send.postalFinishing.colors.red"
  | "send.postalFinishing.colors.green"
  | "send.postalFinishing.colors.gold"
  | "send.postalFinishing.colors.plum"
  | "send.postalFinishing.colors.charcoal"
  | "send.postalFinishing.colors.teal"
  | "send.postalFinishing.chooseStamp"
  | "send.postalFinishing.previewStamp"
  | "send.postalFinishing.closeStampPreview"
  | "send.postalFinishing.summaryLabel"
  | "send.content.letterLabel"
  | "send.content.postcardLabel"
  | "send.content.postcardVariantLabel"
  | "send.content.stickerLabel"
  | "send.content.giftLabel"
  | "send.content.emptyPreview"
  | "send.content.stickers.sunStamp"
  | "send.content.stickers.blueEnvelope"
  | "send.content.stickers.routeSpark"
  | "send.content.postcardVariants.city"
  | "send.content.postcardVariants.event"
  | "send.content.postcardVariants.photo"
  | "map.eyebrow"
  | "map.title"
  | "map.subtitle"
  | "map.tripStatus"
  | "map.closeTripStatus"
  | "map.selectMascot"
  | "map.previousMascot"
  | "map.nextMascot"
  | "map.currentLeg"
  | "map.discoveries"
  | "map.cargoFound"
  | "map.carryingCargo"
  | "map.tripCompleted"
  | "map.deliveryFinished"
  | "map.finishedDeliveries"
  | "map.collectFinishedDelivery"
  | "map.cargoFoundDescription"
  | "map.completedDescription"
  | "map.routeCargo"
  | "map.primaryReward"
  | "map.visualCargo"
  | "map.collectionPending"
  | "map.rewardCollected"
  | "map.noPrimaryReward"
  | "map.routeCargoPreviewNote"
  | "map.goToCollection"
  | "map.ownerCollectionOnly"
  | "map.openCollection"
  | "map.mockedRewards"
  | "map.persistedRewards"
  | "map.discovered"
  | "map.newDiscovery"
  | "map.carriedDiscovery"
  | "map.discoveryToastSingle"
  | "map.discoveryToastMultiple"
  | "map.onTheRoute"
  | "map.backToMascot"
  | "map.unavailable"
  | "map.cameraControls"
  | "map.activeMapTools"
  | "map.overview"
  | "map.focusMascot"
  | "map.followMascot"
  | "map.stopFollowing"
  | "map.focusOrigin"
  | "map.focusDestination"
  | "map.backToTrip"
  | "map.rewardDetails"
  | "map.futureReward"
  | "map.futureRewardState"
  | "map.futureRewardHint"
  | "map.approximateRegion"
  | "map.rewardType"
  | "map.rarity"
  | "map.legs.preparing"
  | "map.legs.outbound"
  | "map.legs.delivered"
  | "map.legs.returning"
  | "map.legs.returned"
  | "map.legs.completed"
  | "map.rewardKinds.badge"
  | "map.rewardKinds.postcard"
  | "map.rewardKinds.stamp"
  | "map.rewardKinds.souvenir"
  | "map.rewardKinds.material"
  | "map.rewardKinds.eventItem"
  | "map.rewards.londrinaPostcard.name"
  | "map.rewards.londrinaPostcard.description"
  | "map.rewards.cambeSouvenir.name"
  | "map.rewards.cambeSouvenir.description"
  | "map.rewards.rolandiaBadge.name"
  | "map.rewards.rolandiaBadge.description"
  | "map.rewards.arapongasMaterial.name"
  | "map.rewards.arapongasMaterial.description"
  | "map.rewards.apucaranaStamp.name"
  | "map.rewards.apucaranaStamp.description"
  | "map.rewards.maringaEvent.name"
  | "map.rewards.maringaEvent.description"
  | "postalTraffic.title"
  | "postalTraffic.nearbyPets"
  | "postalTraffic.empty"
  | "postalTraffic.progress"
  | "postalTraffic.travelState"
  | "postalTraffic.owner"
  | "postalTraffic.openFriendProfile"
  | "postalTraffic.privateOwner"
  | "postalTraffic.outOfRange"
  | "postalTraffic.visibility.friend"
  | "postalTraffic.visibility.public"
  | "postalTraffic.legs.preparing"
  | "postalTraffic.legs.outbound"
  | "postalTraffic.legs.delivered"
  | "postalTraffic.legs.returning"
  | "postalTraffic.legs.returned"
  | "postalTraffic.legs.completed"
  | "postalTraffic.regions.paranaBrazil"
  | "postalTraffic.regions.rioGrandeDoSulBrazil"
  | "postalTraffic.regions.santaCatarinaBrazil"
  | "postalTraffic.regions.goiasBrazil"
  | "postalTraffic.regions.distritoFederalBrazil"
  | "postalTraffic.regions.minasGeraisBrazil"
  | "postalTraffic.regions.espiritoSantoBrazil"
  | "postalTraffic.regions.bahiaBrazil"
  | "postalTraffic.regions.pernambucoBrazil"
  | "postalTraffic.regions.acreBrazil"
  | "postalTraffic.regions.alagoasBrazil"
  | "postalTraffic.regions.amapaBrazil"
  | "postalTraffic.regions.amazonasBrazil"
  | "postalTraffic.regions.cearaBrazil"
  | "postalTraffic.regions.maranhaoBrazil"
  | "postalTraffic.regions.matoGrossoBrazil"
  | "postalTraffic.regions.matoGrossoDoSulBrazil"
  | "postalTraffic.regions.paraBrazil"
  | "postalTraffic.regions.paraibaBrazil"
  | "postalTraffic.regions.piauiBrazil"
  | "postalTraffic.regions.rioDeJaneiroBrazil"
  | "postalTraffic.regions.rioGrandeDoNorteBrazil"
  | "postalTraffic.regions.rondoniaBrazil"
  | "postalTraffic.regions.roraimaBrazil"
  | "postalTraffic.regions.saoPauloBrazil"
  | "postalTraffic.regions.sergipeBrazil"
  | "postalTraffic.regions.tocantinsBrazil"
  | "species.carrierPigeon"
  | "species.messengerFalcon"
  | "species.mailDuck"
  | "traits.steadyRoute.name"
  | "traits.steadyRoute.description"
  | "traits.directFlight.name"
  | "traits.directFlight.description"
  | "traits.curiousFinder.name"
  | "traits.curiousFinder.description"
  | "equipment.rarity.common"
  | "equipment.rarity.uncommon"
  | "equipment.rarity.rare"
  | "equipment.canvasPostalBag.name"
  | "equipment.canvasPostalBag.description"
  | "equipment.blueRouteScarf.name"
  | "equipment.blueRouteScarf.description"
  | "equipment.flightGoggles.name"
  | "equipment.flightGoggles.description"
  | "equipment.urgentBadge.name"
  | "equipment.urgentBadge.description"
  | "equipment.travelCap.name"
  | "equipment.travelCap.description"
  | "equipment.featherCharm.name"
  | "equipment.featherCharm.description"
  | "equipment.smallSatchel.name"
  | "equipment.smallSatchel.description"
  | "skills.longRoute.name"
  | "skills.longRoute.description"
  | "skills.softLanding.name"
  | "skills.softLanding.description"
  | "skills.quickDispatch.name"
  | "skills.quickDispatch.description"
  | "skills.crosswindInstinct.name"
  | "skills.crosswindInstinct.description"
  | "skills.shinyThing.name"
  | "skills.shinyThing.description"
  | "skills.happyDetour.name"
  | "skills.happyDetour.description"
  | "skills.fixed" | "skills.individual"
  | "skills.postalMemory.name" | "skills.postalMemory.description"
  | "skills.balancedLoad.name" | "skills.balancedLoad.description"
  | "skills.returnMail.name" | "skills.returnMail.description"
  | "skills.cartographicEye.name" | "skills.cartographicEye.description"
  | "skills.solarWing.name" | "skills.solarWing.description"
  | "skills.urbanStart.name" | "skills.urbanStart.description"
  | "skills.aerodynamicLoad.name" | "skills.aerodynamicLoad.description"
  | "skills.waterPath.name" | "skills.waterPath.description"
  | "skills.waterproofFeathers.name" | "skills.waterproofFeathers.description"
  | "skills.firstTrip.name" | "skills.firstTrip.description"
  | "skills.nightVigil.name" | "skills.nightVigil.description"
  | "skills.silentFlight.name" | "skills.silentFlight.description"
  | "skills.lunarMemory.name" | "skills.lunarMemory.description"
  | "skills.nightLoad.name" | "skills.nightLoad.description"
  | "skills.dawnGuardian.name" | "skills.dawnGuardian.description"
  | "delivery.progress"
  | "delivery.remainingTime"
  | "delivery.routePreview"
  | "delivery.status.available"
  | "delivery.status.preparing"
  | "delivery.status.outbound"
  | "delivery.status.delivered"
  | "delivery.status.returning"
  | "delivery.status.returned"
  | "delivery.status.completed"
  | "rewards.eyebrow"
  | "rewards.title"
  | "rewards.readyTitle"
  | "rewards.readyDescription"
  | "rewards.travelingTitle"
  | "rewards.travelingDescription"
  | "rewards.completedTitle"
  | "rewards.completedDescription"
  | "rewards.loading"
  | "rewards.collectButton"
  | "rewards.collectAllButton"
  | "rewards.collecting"
  | "rewards.collectError"
  | "rewards.backToMascot"
  | "rewards.backToMap"
  | "rewards.xpGained"
  | "rewards.itemFound"
  | "rewards.fullCargoTitle"
  | "rewards.primaryReward"
  | "rewards.routeCargo"
  | "rewards.collectionPending"
  | "rewards.ownerCollectionOnly"
  | "rewards.inventory"
  | "rewards.collected"
  | "rewards.rarity"
  | "rewards.progressionTitle"
  | "rewards.reputationXp"
  | "rewards.mascotFlightXp"
  | "rewards.skillXp"
  | "rewards.skillEffectApplied"
  | "rewards.affinity"
  | "rewards.affinityLongDistance"
  | "rewards.affinityUrban"
  | "rewards.affinityDiscovery"
  | "rewards.items.wornRouteStamp.name"
  | "rewards.items.wornRouteStamp.description"
  | "rewards.items.blueAirmailLabel.name"
  | "rewards.items.blueAirmailLabel.description"
  | "rewards.items.goldenCompassPin.name"
  | "rewards.items.goldenCompassPin.description"
  | "inventory.eyebrow"
  | "inventory.title"
  | "inventory.subtitle"
  | "inventory.categoriesLabel"
  | "inventory.distinctTotal"
  | "inventory.acquiredTotal"
  | "inventory.equippedTotal"
  | "inventory.raritySummary"
  | "inventory.emptySlotTitle"
  | "inventory.emptySlotDescription"
  | "inventory.source"
  | "inventory.category"
  | "inventory.categories.all"
  | "inventory.categories.equipment"
  | "inventory.categories.stamps"
  | "inventory.categories.keepsakes"
  | "inventory.categories.routeMarks"
  | "inventory.sources.homeNest"
  | "inventory.sources.starterKit"
  | "inventory.sources.routeReward"
  | "inventory.sources.statePassage"
  | "inventory.sources.longRouteFind"
  | "shop.eyebrow"
  | "shop.title"
  | "shop.subtitle"
  | "shop.prototypeNotice"
  | "shop.categoriesLabel"
  | "shop.prototypePrice"
  | "shop.viewDetails"
  | "shop.close"
  | "shop.detailsTitle"
  | "shop.mascotPreview"
  | "shop.mascotPreviewNote"
  | "shop.emptyTitle"
  | "shop.emptyDescription"
  | "shop.categories.all"
  | "shop.categories.cosmetics"
  | "shop.categories.stickers"
  | "shop.categories.postcards"
  | "shop.categories.decorations"
  | "shop.currencies.seeds"
  | "shop.currencies.crystals"
  | "shop.items.crimsonCourierScarf.name"
  | "shop.items.crimsonCourierScarf.description"
  | "shop.items.meadowPostCap.name"
  | "shop.items.meadowPostCap.description"
  | "shop.items.sunnyRouteSticker.name"
  | "shop.items.sunnyRouteSticker.description"
  | "shop.items.blueEnvelopeSticker.name"
  | "shop.items.blueEnvelopeSticker.description"
  | "shop.items.coastalTownPostcard.name"
  | "shop.items.coastalTownPostcard.description"
  | "shop.items.lanternFestivalPostcard.name"
  | "shop.items.lanternFestivalPostcard.description"
  | "shop.items.brassNestPlaque.name"
  | "shop.items.brassNestPlaque.description"
  | "shop.items.airmailProfileRibbon.name"
  | "shop.items.airmailProfileRibbon.description"
  | "locations.saoPaulo"
  | "locations.lisbon"
  | "locations.londrina"
  | "locations.cambe"
  | "locations.rolandia"
  | "locations.arapongas"
  | "locations.apucarana"
  | "locations.maringa"
  | "locations.beloHorizonte"
  | "locations.salvador"
  | "locations.rioBranco"
  | "locations.curitiba"
  | "locations.toronto"
  | "archetypes.suggestedNames.nuvem"
  | "archetypes.suggestedNames.trovao"
  | "archetypes.suggestedNames.pipoca"
  | "friends.eyebrow"
  | "friends.title"
  | "friends.subtitle"
  | "friends.profileTitle"
  | "friends.viewProfile"
  | "friends.sendToFriend"
  | "friends.quickSend"
  | "friends.friendshipLevel"
  | "friends.exchangeCount"
  | "friends.friendMascots"
  | "friends.receivedCorrespondence"
  | "friends.location"
  | "friends.backToFriends"
  | "friends.noCorrespondence"
  | "friends.mascotLabel"
  | "friends.emptyTitle"
  | "friends.emptyDescription"
  | "friends.postalCodeTitle"
  | "friends.postalCodeDescription"
  | "friends.copyCode"
  | "friends.copiedCode"
  | "friends.shareCode"
  | "friends.regenerateCode"
  | "friends.regenerateConfirm"
  | "friends.addCodeTitle"
  | "friends.addCodeDescription"
  | "friends.codeLabel"
  | "friends.sendRequest"
  | "friends.requestsReceived"
  | "friends.requestsSent"
  | "friends.acceptRequest"
  | "friends.declineRequest"
  | "friends.noRequests"
  | "friends.requestSent"
  | "friends.requestUnavailable"
  | "friends.requestAlreadyPending"
  | "friends.requestAlreadyFriends"
  | "friends.requestReceivedPending"
  | "friends.firstFriendTitle"
  | "friends.firstFriendDescription"
  | "friends.prepareFirstLetter"
  | "friends.findFriend"
  | "friends.connectTitle"
  | "friends.useCode"
  | "friends.myCode"
  | "friends.showCode"
  | "friends.lia.note"
  | "friends.caio.note"
  | "friends.mina.note"
  | "friends.correspondence.liaPostcard.title"
  | "friends.correspondence.liaPostcard.description"
  | "friends.correspondence.liaSticker.title"
  | "friends.correspondence.liaSticker.description"
  | "friends.correspondence.caioLetter.title"
  | "friends.correspondence.caioLetter.description"
  | "friends.correspondence.minaGift.title"
  | "friends.correspondence.minaGift.description"
  | "correspondence.letter.name"
  | "correspondence.letter.description"
  | "correspondence.postcard.name"
  | "correspondence.postcard.description"
  | "correspondence.sticker.name"
  | "correspondence.sticker.description"
  | "correspondence.smallGift.name"
  | "correspondence.smallGift.description"
  | "appearance.nuvemPortrait"
  | "appearance.trovaoPortrait"
  | "appearance.pipocaPortrait"
  | "appearance.friendAuroraPortrait"
  | "appearance.friendBrisaPortrait"
  | "appearance.friendTicoPortrait"
  | "appearance.friendAtlasPortrait"
  | "appearance.friendLumaPortrait"
  | "appearance.friendMaplePortrait"
  | "appearance.owlPortrait"
  | "referrals.invitationEyebrow" | "referrals.invitationLoading" | "referrals.invitationTitle" | "referrals.invitationDescription" | "referrals.acceptInvitation" | "referrals.invalidInvitationTitle" | "referrals.invalidInvitationDescription"
  | "referrals.tab" | "referrals.title" | "referrals.description" | "referrals.share" | "referrals.copy" | "referrals.copied" | "referrals.regenerate" | "referrals.regenerateConfirm" | "referrals.progress" | "referrals.pendingTitle" | "referrals.pendingDescription" | "referrals.owlName" | "referrals.claimOwl" | "referrals.claimed" | "referrals.unavailable" | "referrals.claimError"
  | "tutorial.postcard.open"
  | "tutorial.postcard.close"
  | "tutorial.postcard.flip"
  | "tutorial.postcard.flipHint"
  | "tutorial.postcard.front"
  | "tutorial.postcard.back"
  | "tutorial.postcard.backMessage"
  | "tutorial.postcard.postmark"
  | "tutorial.postcard.deliveredBy"
  | "nest.eyebrow"
  | "nest.title"
  | "nest.description"
  | "nest.searchLabel"
  | "nest.searchPlaceholder"
  | "nest.searchAction"
  | "nest.noCityFound"
  | "nest.mapLabel"
  | "nest.privacyNote"
  | "nest.selectedCity"
  | "nest.selectionReady"
  | "nest.confirmAction"
  | "postalJobs.eyebrow" | "postalJobs.title" | "postalJobs.description" | "postalJobs.artworkAlt" | "postalJobs.distance" | "postalJobs.cargo" | "postalJobs.seeds" | "postalJobs.xp" | "postalJobs.accept" | "postalJobs.replace" | "postalJobs.depart" | "postalJobs.error"
  | `postalJobs.templates.${string}.title` | `postalJobs.templates.${string}.description`
  | "postalJobs.templates.farol.title" | "postalJobs.templates.farol.description" | "postalJobs.templates.farolSignal.title" | "postalJobs.templates.farolSignal.description" | "postalJobs.templates.horta.title" | "postalJobs.templates.horta.description" | "postalJobs.templates.hortaSeedlings.title" | "postalJobs.templates.hortaSeedlings.description" | "postalJobs.templates.estacao.title" | "postalJobs.templates.estacao.description" | "postalJobs.templates.estacaoSignals.title" | "postalJobs.templates.estacaoSignals.description" | "postalJobs.templates.biblioteca.title" | "postalJobs.templates.biblioteca.description" | "postalJobs.templates.bibliotecaFolios.title" | "postalJobs.templates.bibliotecaFolios.description" | "postalJobs.templates.oficina.title" | "postalJobs.templates.oficina.description" | "postalJobs.templates.oficinaInk.title" | "postalJobs.templates.oficinaInk.description" | "postalJobs.templates.observatorio.title" | "postalJobs.templates.observatorio.description" | "postalJobs.templates.observatorioLenses.title" | "postalJobs.templates.observatorioLenses.description"
  | "exclusiveMissions.title" | "exclusiveMissions.eyebrow" | "exclusiveMissions.badge" | "exclusiveMissions.destination" | "exclusiveMissions.expires" | "exclusiveMissions.expired" | "exclusiveMissions.accept" | "exclusiveMissions.depart" | "exclusiveMissions.error"
  | "assetStudio.eyebrow"
  | "assetStudio.title"
  | "assetStudio.description"
  | "assetStudio.newAsset"
  | "assetStudio.uploadTitle"
  | "assetStudio.key"
  | "assetStudio.type"
  | "assetStudio.file"
  | "assetStudio.altKey"
  | "assetStudio.decorative"
  | "assetStudio.author"
  | "assetStudio.saveDraft"
  | "assetStudio.draftSaved"
  | "assetStudio.publish"
  | "assetStudio.published"
  | "assetStudio.archive"
  | "assetStudio.archived"
  | "assetStudio.restore"
  | "assetStudio.restored"
  | "assetStudio.usage"
  | "assetStudio.filters"
  | "assetStudio.all"
  | "assetStudio.loading"
  | "assetStudio.error"
  | "geonamesAdmin.eyebrow"
  | "geonamesAdmin.title"
  | "geonamesAdmin.description"
  | "geonamesAdmin.activeCities"
  | "geonamesAdmin.latestSuccess"
  | "geonamesAdmin.noSuccess"
  | "geonamesAdmin.refresh"
  | "geonamesAdmin.confirm"
  | "geonamesAdmin.cancel"
  | "geonamesAdmin.confirmTitle"
  | "geonamesAdmin.confirmDescription"
  | "geonamesAdmin.history"
  | "geonamesAdmin.status"
  | "geonamesAdmin.processed"
  | "geonamesAdmin.imported"
  | "geonamesAdmin.updated"
  | "geonamesAdmin.archived"
  | "geonamesAdmin.running"
  | "geonamesAdmin.failed"
  | "geonamesAdmin.succeeded"
  | "geonamesAdmin.queued"
  | "geonamesAdmin.refreshStarted"
  | "officialPostcards.base.name"
  | "officialPostcards.base.description"
  | "officialPostcards.christTheRedeemer.name"
  | "officialPostcards.christTheRedeemer.description"
  | "officialPostcards.christTheRedeemer.alt"
  | "officialPostcards.masp.name"
  | "officialPostcards.masp.description"
  | "officialPostcards.masp.alt"
  | "officialPostcards.iguazuDevilsThroat.name"
  | "officialPostcards.iguazuDevilsThroat.description"
  | "officialPostcards.iguazuDevilsThroat.alt"
  | "officialPostcards.machuPicchu.name"
  | "officialPostcards.machuPicchu.description"
  | "officialPostcards.machuPicchu.alt"
  | "officialPostcards.cities.manhuacu.name"
  | "officialPostcards.cities.manhuacu.description"
  | "officialPostcards.cities.manhuacu.alt"
  | "officialPostcards.cities.londrina.name"
  | "officialPostcards.cities.londrina.description"
  | "officialPostcards.cities.londrina.alt"
  | "officialPostcards.cities.novaFriburgo.name"
  | "officialPostcards.cities.novaFriburgo.description"
  | "officialPostcards.cities.novaFriburgo.alt"
  | "officialPostcards.cities.hongKong.name"
  | "officialPostcards.cities.hongKong.description"
  | "officialPostcards.cities.hongKong.alt"
  | "officialPostcards.cities.saoPaulo.name"
  | "officialPostcards.cities.saoPaulo.description"
  | "officialPostcards.cities.saoPaulo.alt"
  | "officialPostcards.cities.rioDeJaneiro.name"
  | "officialPostcards.cities.rioDeJaneiro.description"
  | "officialPostcards.cities.rioDeJaneiro.alt"
  | "officialPostcards.cities.beloHorizonte.name"
  | "officialPostcards.cities.beloHorizonte.description"
  | "officialPostcards.cities.beloHorizonte.alt"
  | "officialPostcards.cities.salvador.name"
  | "officialPostcards.cities.salvador.description"
  | "officialPostcards.cities.salvador.alt"
  | "officialPostcards.cities.fortaleza.name"
  | "officialPostcards.cities.fortaleza.description"
  | "officialPostcards.cities.fortaleza.alt"
  | "officialPostcards.cities.manaus.name"
  | "officialPostcards.cities.manaus.description"
  | "officialPostcards.cities.manaus.alt"
  | "officialPostcards.cities.brasilia.name"
  | "officialPostcards.cities.brasilia.description"
  | "officialPostcards.cities.brasilia.alt"
  | "officialPostcards.cities.curitiba.name"
  | "officialPostcards.cities.curitiba.description"
  | "officialPostcards.cities.curitiba.alt"
  | "officialPostcards.cities.recife.name"
  | "officialPostcards.cities.recife.description"
  | "officialPostcards.cities.recife.alt"
  | "officialPostcards.cities.goiania.name"
  | "officialPostcards.cities.goiania.description"
  | "officialPostcards.cities.goiania.alt"
  | "officialPostcards.cities.belem.name" | "officialPostcards.cities.belem.description" | "officialPostcards.cities.belem.alt"
  | "officialPostcards.cities.portoAlegre.name" | "officialPostcards.cities.portoAlegre.description" | "officialPostcards.cities.portoAlegre.alt"
  | "officialPostcards.cities.maceio.name" | "officialPostcards.cities.maceio.description" | "officialPostcards.cities.maceio.alt"
  | "officialPostcards.cities.saoLuis.name" | "officialPostcards.cities.saoLuis.description" | "officialPostcards.cities.saoLuis.alt"
  | "officialPostcards.cities.campoGrande.name" | "officialPostcards.cities.campoGrande.description" | "officialPostcards.cities.campoGrande.alt"
  | "officialPostcards.cities.natal.name" | "officialPostcards.cities.natal.description" | "officialPostcards.cities.natal.alt"
  | "officialPostcards.cities.teresina.name" | "officialPostcards.cities.teresina.description" | "officialPostcards.cities.teresina.alt"
  | "officialPostcards.cities.joaoPessoa.name" | "officialPostcards.cities.joaoPessoa.description" | "officialPostcards.cities.joaoPessoa.alt"
  | "officialPostcards.cities.aracaju.name" | "officialPostcards.cities.aracaju.description" | "officialPostcards.cities.aracaju.alt"
  | "officialPostcards.cities.cuiaba.name" | "officialPostcards.cities.cuiaba.description" | "officialPostcards.cities.cuiaba.alt"
  | "officialPostcards.cities.portoVelho.name" | "officialPostcards.cities.portoVelho.description" | "officialPostcards.cities.portoVelho.alt"
  | "officialPostcards.cities.macapa.name" | "officialPostcards.cities.macapa.description" | "officialPostcards.cities.macapa.alt"
  | "officialPostcards.cities.florianopolis.name" | "officialPostcards.cities.florianopolis.description" | "officialPostcards.cities.florianopolis.alt"
  | "officialPostcards.cities.boaVista.name" | "officialPostcards.cities.boaVista.description" | "officialPostcards.cities.boaVista.alt"
  | "officialPostcards.cities.rioBranco.name" | "officialPostcards.cities.rioBranco.description" | "officialPostcards.cities.rioBranco.alt"
  | "officialPostcards.cities.vitoria.name" | "officialPostcards.cities.vitoria.description" | "officialPostcards.cities.vitoria.alt"
  | "officialPostcards.cities.palmas.name" | "officialPostcards.cities.palmas.description" | "officialPostcards.cities.palmas.alt"
  | "regionalStamps.espiritoSanto.name"
  | "regionalStamps.espiritoSanto.description"
  | "regionalStamps.espiritoSanto.alt"
  | "regionalStamps.minasGerais.name"
  | "regionalStamps.minasGerais.description"
  | "regionalStamps.minasGerais.alt"
  | "regionalStamps.parana.name"
  | "regionalStamps.parana.description"
  | "regionalStamps.parana.alt"
  | "regionalStamps.rioDeJaneiro.name"
  | "regionalStamps.rioDeJaneiro.description"
  | "regionalStamps.rioDeJaneiro.alt"
  | "regionalStamps.saoPaulo.name"
  | "regionalStamps.saoPaulo.description"
  | "regionalStamps.saoPaulo.alt"
  | `regionalStamps.${RegionalStampKey}.${"name" | "description" | "alt"}`
  | "officialStickers.sunStamp.description"
  | "officialStickers.blueEnvelope.description"
  | "officialStickers.routeSpark.description"
  | "mailbox.surpriseSender"
  | "mailbox.surpriseTitle"
  | "mailbox.surpriseDescription"
  | "mailbox.postcardWithoutMessage"
  | "mailbox.returnReplyLabel"
  | "mailbox.returnReplyDeadline"
  | "mailbox.returnReplyConfirmed"
  | "mailbox.sendReturnReply"
  | "mailbox.replying"
  | "mailbox.returnWindowRemaining"
  | "mailbox.prepareReturnReply"
  | "mailbox.returnReplyFlowTitle"
  | "mailbox.returnReplyLoading"
  | "mailbox.returnReplyUnavailable"
  | "mailbox.returnReplyExpired"
  | "mailbox.returnReplyConfirmedDescription"
  | "mailbox.writeReturnReply"
  | "mailbox.toOriginalSender"
  | "mailbox.returnReplySubmitError"
  | "mailbox.visitingMascot"
  | "mailbox.minutesRemaining"
  | "mailbox.openVisitorLetter"
  | "mailbox.correspondenceUnavailable"
  | "send.removeSticker";
