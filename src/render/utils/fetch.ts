import { FetchLogin, FetchToken } from "./request"

export async function handleFetchLogin(username: string, password: string) {
    // closeLoginAndOpenMain();
    let tokenRes: any = await FetchToken()
    if (tokenRes.Status === 10000) {
        localStorage.setItem("kyToken", tokenRes.Data.Token)
        localStorage.setItem("CryptoKeyAes", tokenRes.Data.CryptoKeyAes)
    }
    const ret = await FetchLogin(username, password, "绑定信息", "我是动态标记,随便填写", "1.0.1")
    return ret;
}