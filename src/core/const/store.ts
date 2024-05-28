export enum GameMutation {
    SET_GAME_INSTALLATIONS = 'setGameInstallations',
    SET_CLIENT_RUN = 'setClientRun',
    SET_LGC_RUN = 'setLgcRun',
}

export enum ModMutation {
    SET_CATEGORIZE = 'setCategorize',
    SET_NAME = 'setName',
    SET_INSTALLED = 'setInstalled',
    SET_INSTALLED_TRANS = 'setInstalledTrans',
    SET_INSTALLED_CATEGORIZE = 'setInstalledCategorize',
    SET_INSTALLED_NAME = 'setInstalledName',
    SET_INSTALLED_VIP = 'setInstalledVip',
    SET_HAS_NEW = 'setHasNew',
}

export enum Wn8Mutation {
    SET_HISTRORY = 'sethistory',
    SET_ADMIN = 'setAdmin'
}

export enum UserMutation {
    SET_USER_INFO = 'setUserInfo',
    SET_GAME_REPORT = 'setGameReport',
    SET_BIND_GAME_USER = 'setBindGameUser',
    SET_ACCOUNT = 'setAccount',
    SET_PASSWORD = 'setPassword',
    SET_REMEMBER = 'setRemember',
    SET_AUTO_LOGIN = 'setAutoLogin',
}

export enum TransMutation {
    SET_TRANS = 'setTrans',
}

export enum LoadingMutation {
    SET_LOADING = 'setLoading',
}

export enum HomeMutation {
    SET_HOME_DATA = 'setHomeData'
}

export enum SponsorMutation {
    SET_SPONSOR_DATA = 'setSponsorData'
}

export enum StoreModule {
    // 游戏安装信息
    GAME = 'GAME',
    // mod相关信息
    MODS = "MODS",
    // 战绩查询相关信息
    WN8 = "WN8",
    // 用户账户相关信息
    USER = 'USER',
    // 全局加载
    LOADING = 'LOADING',
    // 首页信息
    HOME = 'HOME',
    // 赞助信息
    SPONSOR = 'SPONSOR'
}