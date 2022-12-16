<template>
	<view class="container">
	  <view class="intro"
		>本项目已包含uni
		ui组件，无需import和注册，可直接使用。在代码区键入字母u，即可通过代码助手列出所有可用组件。光标置于组件名称处按F1，即可查看组件文档。</view
	  >
	  <text class="intro">详见：</text>
	  <uni-link :href="href" :text="href"></uni-link>
	  <button  @click="onMyLogin">
		微信登录
	  </button>
	</view>
  </template>
  
  <script>
import $api from "@/api/user.js";
  export default {
	data() {
	  return {
		href: "https://uniapp.dcloud.io/component/README?id=uniui",
	  };
	},
	methods: {
	  onMyLogin() {
		this.$store.dispatch('wxLogin')
	  },
	},
  };
  </script>
  
  <style lang="scss" scoped>
  .container {
	padding: 20px;
	font-size: 14px;
	line-height: 24px;
	.intro {
	  color: rebeccapurple;
	}
  }
  </style>
  