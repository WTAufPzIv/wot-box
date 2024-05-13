import { FetchActivateCard, FetchForget, FetchLogin, FetchLogout, FetchSignup, FetchToken } from "./request"

export async function handleFetchToken() {
    let tokenRes: any = await FetchToken()
    if (tokenRes.Status === 10000) {
        localStorage.setItem("kyToken", tokenRes.Data.Token)
        localStorage.setItem("CryptoKeyAes", tokenRes.Data.CryptoKeyAes)
    }
    return;
}

export async function handleFetchLogin(username: string, password: string) {
    await handleFetchToken();
    const ret = await FetchLogin(username, password, "绑定信息", "我是动态标记,随便填写", "1.0.1")
    return ret;
}

export async function handleFetchSignup(username: string, password: string, superPassWord: string) {
    await handleFetchToken();
    const ret = await FetchSignup(username, password, "绑定信息", superPassWord)
    return ret;
}

export async function handleFetchFoeget(username: string, password: string, superPassWord: string) {
    await handleFetchToken();
    const ret = await FetchForget(username, password, superPassWord)
    return ret;
}

export async function handleFetchLogout() {
    const ret = await FetchLogout()
    return ret;
}


export async function handleFetchActivateCard(username: string, card: string) {
    const ret = await FetchActivateCard(username, card)
    return ret;
}