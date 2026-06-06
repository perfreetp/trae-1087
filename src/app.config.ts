export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/pets/index',
    'pages/appointment/index',
    'pages/messages/index',
    'pages/profile/index',
    'pages/records/index',
    'pages/reminders/index',
    'pages/bills/index',
    'pages/pet-add/index',
    'pages/pet-detail/index',
    'pages/appointment-detail/index',
    'pages/doctor-detail/index',
    'pages/clinics/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2196F3',
    navigationBarTitleText: '宠医通',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#2196F3',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/pets/index',
        text: '宠物'
      },
      {
        pagePath: 'pages/appointment/index',
        text: '预约'
      },
      {
        pagePath: 'pages/messages/index',
        text: '消息'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
