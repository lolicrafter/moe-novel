import $store from '../store'

const base_url = process.env.NODE_ENV == 'development'?'http://127.0.0.1:3000/':'http://101.33.250.160:8083/'


const buildStrParams = (params) => {
    let strParams = ''
    let i = 0
    for (let k in params) {
        let q = ''
        if (i === 0) {
            q = '?'
        } else {
            q = '&'
        }
        strParams = strParams + q + k + '=' + params[k]
        i++
    }
    return strParams
}
const notVerify = ['/user/loginOut', '/user/getUserInfo', '/notice/isHaveNotReadNotice','/wx/wxMaLogin']
/**
 * 判断是否需要校验的url
 */
const verifyUrl = (url) =>{
    let match = true
    for (let i = 0; i < notVerify.length; i++) {
        if(notVerify[i] == url) {
            match =  false
            break
        } else {
            continue
        }
    }
    return match
}

const send = (url, params, data, method = 'POST', showLoading = true) => {
    // uni.showLoading({
    //     title: '加载中'
    // })
    return new Promise((resolve, reject) => {
        uni.request({
            method: method,
            url: base_url  + url + buildStrParams(params),
            data: data,
            header: (() => {
                const tokeValue = $store.state.user.token
                let config = {
                    'agent': 'miniapp',
                    'content-type': 'application/json',
                }
                if (tokeValue) {
                    config['Authorization'] = 'Bearer ' + tokeValue
                }
                return config
            })(),
            success: (res) => {
                const {
                    code,
                    data,
                    message
                } = res.data
                // uni.hideLoading()
								if (url.indexOf('/user/getUserInfo') !== -1 && params && params.checkLogin && code === 1000) {
									reject()
									return
								}
                if (code === 1000||code === 103||code===1007) {
                    if(verifyUrl(url)) {
                        $store.dispatch('loginOut')
                        uni.navigateTo({
                            url: '/otherPages/login/pwdLogin',
                            success:() =>{
                                setTimeout(()=>{
                                    uni.showToast({
                                        title: '请先登录',
                                        icon: 'none'
                                    })
                                }, 500)
                            }
                        })
                    } else {
                        resolve(res.data)
                    }
                } else if (code != 0) {
                    uni.showToast({
                        title: message,
                        // image: 'https://img1.clozhome.com/new-clozhome/mini/static/home.png'
                        icon: 'none'
                    })
					resolve(res.data)
                } else {
                    resolve(res.data)
                }
            }
        })
    })
}

export const service = {
    post: (url, data, params) => {
        return send(url, params, data, 'POST')
    },
    get: (url, params) => {
        return send(url, params, null, 'GET')
    }
}
