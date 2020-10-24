<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/img/mall.jpg" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <!-- 侧边栏菜单区域 -->
        <el-menu
          :unique-opened="true"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#288bff">
          <!-- 一级菜单 -->
          <el-submenu 
            v-for="item in menuList"
            :key="item.id"
            :index="item.id + ''">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item 
              v-for="subItem in item.children"
              :key="subItem.id"
              :index="subItem.id + ''">
              <!-- 二级菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
              </el-menu-item>
          </el-submenu>

        </el-menu>
      </el-aside>

      <!-- 右侧内容主体 -->
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data(){
    return {
      // 左侧菜单数据
      menuList: [],
      iconsObj: {
        '125': 'el-icon-s-custom',
        '103': 'el-icon-s-check',
        '101': 'el-icon-s-goods',
        '102': 'el-icon-edit-outline',
        '145': 'el-icon-data-line',
      }
    }
  },
  created(){
    this.getMenuList();
  },
  methods: {
    logout(){
      window.sessionStorage.clear();
      this.$router.push('/login');
    },
    // 获取所有的菜单
    async getMenuList(){
      const {data : res} = await this.$http.get('menus');
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;

      console.log(this.menuList);
    }
  }
}
</script>

<style lang="less" scoped>
  .el-container{
    height: 100%;
  }

  .el-header{
    background-color: #323744;
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding-left: 0;

    font-size: 24px;
    color: #fff;
    > div{
     display: flex;
     align-items: center;
     
     span{
       margin-left: 15px;
     }
    }


    img{
      width: 60px;
    }
  }
  
  .el-aside{
    background-color: #323744;
    .el-menu{
      border-right: none;
    }
  }

  .el-main{
    background-color: #eaedf2;
  }
</style>