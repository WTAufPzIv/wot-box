export enum GameMutation {
    SET_GAME_INSTALLATIONS = 'setGameInstallations',
    SET_GAME_LOADING = 'setGameLoading',
}

export enum ModMutation {
    SET_CATEGORIZE = 'setCategorize',
    SET_NAME = 'setName',
    SET_INSTALLED = 'setInstalled',
    SET_INSTALLED_TRANS = 'setInstalledTrans',
    SET_INSTALLED_CATEGORIZE = 'setInstalledCategorize',
    SET_INSTALLED_NAME = 'setInstalledName',
    SET_INSTALLED_VIP = 'setInstalledVip',
}

export enum Wn8Mutation {
    SET_HISTRORY = 'sethistory',
}

export enum UserMutation {
    SET_USER_INFO = 'setUserInfo',
    SET_GAME_REPORT = 'setGameReport',
    SET_BIND_GAME_USER = 'setBindGameUser',
    SET_ACCOUNT = 'setAccount',
    SET_PASSWORD = 'setPassword',
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
    WN8 = "WN8",
    // 用户账户相关信息
    USER = 'USER'
}