export enum GameMutation {
    SET_GAME_INSTALLATIONS = 'setGameInstallations',
    SET_GAME_LOADING = 'setGameLoading',
}

export enum ModMutation {
    SET_CATEGORIZE = 'setCategorize',
    SET_NAME = 'setName',
    SET_INSTALLED = 'setInstalled'
}

export enum Wn8Mutation {
    SET_HISTRORY = 'sethistory',
}

export enum TransMutation {
    SET_TRANS = 'setTrans',
}

export enum StoreModule {
    // 游戏安装信息
    GAME = 'GAME',
    // mod相关信息
    MODS = "MODS",
    // 战绩查询相关信息
    WN8 = "WN8"
}