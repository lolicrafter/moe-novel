import api from '@/api/user'

const user = {
    state: {
        avatar: '',
        nickName: '',
        sex: undefined,
        wechat: '',
        email: '',
        inviteCode: '',
        token: ''
    },

    getters: {
        hasLogin: state => {
            let user = state.user
            return (user && user.nickName && state.token) ? true : false
        }
    },

    mutations: {
        SET_TOKEN: (state, token) => {
            state.token = token
        },
    },

    actions: {
        /**
         * 获取用户信息, 如果未登录则设置token为空
         */
        getUser({
            state,
            commit,
            dispatch
        }) {
            return new Promise((resolve, reject) => {
                if (!state.token) return
                api.getUserInfo().then(res => {
                    if (res.code == 1000) {
                        dispatch('loginOut')
                        resolve()
                    } else {
                        //设置用户信息
                        commit('SET_USER', res.data)
                        //设置地理位置
                        resolve(state.user)
                    }
                })
            })
        },

        /**
         * 微信授权手机号登录
         */
        wxAuthLogin({
            dispatch,
            commit
        }, {
            encryptedData,
            iv
        }) {
            return new Promise((resolve, reject) => {

                this.dispatch('reGetCode', {
                    encryptedData,
                    iv
                }).then(data => {
                    if (data) {
                        console.log('wxAuthLogin有data', data)
                        commit('SET_TOKEN', data.token)
                        commit('SET_LOGIN_REFRESH', true)
                        dispatch('getUser').then(res => {
                            //返回当前登录信息
                            resolve(data)
                        })
                    } else {
                        dispatch('wxLogin').then(wxObj => {
                            this.dispatch('reGetCode', {
                                encryptedData,
                                iv
                            }).then(res => {
                                console.log('wxAuthLogin无data', res)
                                commit('SET_TOKEN', res.token)
                                commit('SET_LOGIN_REFRESH', true)
                                dispatch('getUser').then(resu => {
                                    //返回当前登录信息
                                    resolve(resu)
                                })
                            })
                        })
                    }
                })
            })
        },
        /**
         * token异常重新请求code
         */
        reGetCode({
            dispatch,
            commit
        }, {
            encryptedData,
            iv
        }) {
            return new Promise((resolve, reject) => {
                dispatch('getWxObj').then((wxObj) => {
                    api.wxMaLogin({
                        encryptedData,
                        iv,
                        sessionKey: wxObj.sessionKey,
                        openId: wxObj.openid,
                        unionId: wxObj.unionId
                    }).then(({
                        data
                    }) => {
                        resolve(data)
                    })
                })
            })
        },
        /**
         * 更新用户信息
         */
        updateUserInfo({
            dispatch,
            commit
        }, {
            avatarUrl,
            gender,
            nickName
        }) {
            return new Promise((resolve, reject) => {
                api.updateUserInfo({
                    avatarUrl,
                    gender,
                    nickName
                }).then(res => {
                    dispatch('getUser')
                    resolve()
                })
            })
        },

        /**
         *  手机号验证码注册， 注册成功即登录
         */
        phoneCodeRegister({
            commit,
            dispatch
        }, {
            phone,
            phoneCode,
            captchaCode,
            inviteCode,
            cpCode,
            inviteType,
            equipment
        }) {
            return new Promise((resolve, reject) => {
                registerApi.phoneCodeRegister({
                    phone: phone,
                    phoneCode: phoneCode,
                    captchaCode: captchaCode,
                    inviteCode: inviteCode,
                    cpCode: cpCode,
                    inviteType: inviteType,
                    equipment: equipment,
                }).then(({
                    data
                }) => {
                    console.log('phoneCodeRegister==data==>', data)
                    if (data.couponList && data.couponList.length > 0) {
                        commit('SET_COUPON_SHOW', true)
                        commit('SET_COUPON_LIST', data.couponList)
                    }
                    console.log('phoneCodeRegister')
                    commit('SET_TOKEN', data.token)
                    commit('SET_LOGIN_REFRESH', true)
                    dispatch('getUser').then(res => {
                        //返回当前登录信息
                        resolve(data)
                    })
                })
            })
        },

        /**
         * 获取微信对象
         */
        getWxObj({
            dispatch,
            commit,
            state
        }) {
            return new Promise((resolve, reject) => {
                if (state.wxObj.sessionKey) {
                    uni.checkSession({
                        fail: () => {
                            console.log('fail');
                            dispatch('wxLogin').then(wxObj => {
                                resolve(wxObj)
                            })
                        },
                        success: () => {
                            console.log('success');
                            resolve(state.wxObj)

                        }
                    })
                } else {
                    //重新登录
                    dispatch('wxLogin').then(wxObj => {
                        resolve(wxObj)
                    })
                }
            })
        },

        /**
         * 微信登录
         */
        wxLogin({
            commit,
            state
        }) {
            return new Promise((resolve, reject) => {
                uni.login({
                    provider: 'weixin',
                    success: ({
                        code
                    }) => {
                        api.wxLogin({
                            JSCODE: code
                        }).then(({
                            data,
                            token
                        }) => {
                            if (data.errcode) {
                                if (data.errcode === 40163) {
                                    uni.$u.toast('请勿频繁请求', 2000);
                                }
                                resolve(this.dispatch('wxLogin'))
                            } else {
                                // console.log('tokentoken结果===>',token)
                                // commit('SET_WX_OBJ', data)
                                commit('SET_TOKEN', token)
                                resolve(state.wxObj)
                            }
                            // sessionKey, openId
                        })
                    }
                })
            })
        },

        /**
         * 退出
         */
        loginOut({
            commit,
            state
        }) {
            return new Promise((resolve, reject) => {
                api.loginOut().then(res => {
                    commit('SET_TOKEN', '')
                    commit('SET_USER', {})
                    console.log('loginOut')
                    commit('SET_LOGIN_REFRESH', true)
                    uni.removeTabBarBadge({
                        index: 3
                    })
                    resolve()
                })
            })
        },
        /**
         * 清除登录刷新标示
         */
        clearLoginRefresh({
            commit
        }) {
            commit('SET_LOGIN_REFRESH', false)
        }

    }
}

export default user