export type Locale = "pt-BR" | "en-US";

export type TranslationDictionary = {
  app: {
    title: string;
  };
  common: {
    loading: string;
    unavailable: string;
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
    currentProfile: string;
    backToNest: string;
    submitting: string;
    errorMessage: string;
  };
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
  };
  send: {
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
    selectedFriend: string;
    selectedMascot: string;
    selectedCorrespondence: string;
    readyHint: string;
    incompleteHint: string;
    loadingData: string;
    sending: string;
    errorMessage: string;
    composeTitle: string;
    contentPreview: string;
    contentInvalid: string;
    characterCount: string;
    selectedStickers: string;
    letterPlaceholder: string;
    postcardPlaceholder: string;
    giftPlaceholder: string;
    giftPendingTitle: string;
    giftPendingDescription: string;
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
    eyebrow: string;
    title: string;
    subtitle: string;
    tripStatus: string;
    currentLeg: string;
    discoveries: string;
    mockedRewards: string;
    discovered: string;
    onTheRoute: string;
    backToMascot: string;
    unavailable: string;
    legs: {
      preparing: string;
      outbound: string;
      delivered: string;
      returning: string;
      returned: string;
      completed: string;
    };
    rewards: {
      rioPostcard: {
        name: string;
        description: string;
      };
      capeVerdeBadge: {
        name: string;
        description: string;
      };
      madeiraStamp: {
        name: string;
        description: string;
      };
    };
  };
  species: {
    carrierPigeon: string;
    messengerFalcon: string;
    mailDuck: string;
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
    collecting: string;
    collectError: string;
    backToMascot: string;
    xpGained: string;
    itemFound: string;
    inventory: string;
    collected: string;
    rarity: string;
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
    collectedTotal: string;
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
      starterKit: string;
      routeReward: string;
      longRouteFind: string;
    };
  };
  locations: {
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
  };
};

export type TranslationKey =
  | "app.title"
  | "common.loading"
  | "common.unavailable"
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
  | "mascot.selectedMascot"
  | "mascot.chooseMascot"
  | "mascot.bottomNav"
  | "mascot.loadingCatalog"
  | "send.startAction"
  | "send.eyebrow"
  | "send.title"
  | "send.subtitle"
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
  | "send.selectedFriend"
  | "send.selectedMascot"
  | "send.selectedCorrespondence"
  | "send.readyHint"
  | "send.incompleteHint"
  | "send.loadingData"
  | "send.sending"
  | "send.errorMessage"
  | "send.composeTitle"
  | "send.contentPreview"
  | "send.contentInvalid"
  | "send.characterCount"
  | "send.selectedStickers"
  | "send.letterPlaceholder"
  | "send.postcardPlaceholder"
  | "send.giftPlaceholder"
  | "send.giftPendingTitle"
  | "send.giftPendingDescription"
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
  | "map.currentLeg"
  | "map.discoveries"
  | "map.mockedRewards"
  | "map.discovered"
  | "map.onTheRoute"
  | "map.backToMascot"
  | "map.unavailable"
  | "map.legs.preparing"
  | "map.legs.outbound"
  | "map.legs.delivered"
  | "map.legs.returning"
  | "map.legs.returned"
  | "map.legs.completed"
  | "map.rewards.rioPostcard.name"
  | "map.rewards.rioPostcard.description"
  | "map.rewards.capeVerdeBadge.name"
  | "map.rewards.capeVerdeBadge.description"
  | "map.rewards.madeiraStamp.name"
  | "map.rewards.madeiraStamp.description"
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
  | "rewards.collecting"
  | "rewards.collectError"
  | "rewards.backToMascot"
  | "rewards.xpGained"
  | "rewards.itemFound"
  | "rewards.inventory"
  | "rewards.collected"
  | "rewards.rarity"
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
  | "inventory.collectedTotal"
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
  | "inventory.sources.starterKit"
  | "inventory.sources.routeReward"
  | "inventory.sources.longRouteFind"
  | "locations.saoPaulo"
  | "locations.lisbon"
  | "locations.curitiba"
  | "locations.toronto"
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
  | "appearance.friendLumaPortrait";
