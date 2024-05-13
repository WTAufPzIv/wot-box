export function formatDate(timestamp: number | string) {
    var date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString(); // 这将根据运行代码的浏览器的地区设置来格式化日期
}

export function throttle(func: any, limit: any) {
    let lastFunc :any;
    let lastRan: any;
    return function() {
        // @ts-ignore
        const context: any = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const getCurrentTime = () => {
    let outcome = Math.round(new Date().getTime() / 1000).toString();
    return Number(outcome)
}