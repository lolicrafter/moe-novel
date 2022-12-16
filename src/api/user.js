import {
	service
} from '@/utils/service'

export default {
	// 获取用户申请列表
	wxLogin(data) {
		return service.post('users/wxLogin', data)
	}
}