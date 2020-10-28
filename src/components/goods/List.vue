<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加商品区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear='getGoodsList'>
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col> 
        <el-col :span="4"> 
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="110px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="商品时间" prop="add_time" v-slot='scope' width="170px">
          {{scope.row.add_time | dateFormat}}
        </el-table-column>
        <el-table-column label="操作" v-slot= "scope" width="130px">
          <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoods(scope.row.goods_id)"></el-button>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 30]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      background>
    </el-pagination>
    </el-card>

  </div>
</template>


<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodsList: [],
      // 商品条数
      total: 0,
    }
  },
  created(){
    this.getGoodsList();
  },
  methods: {
    // ---------------查询商品参数列表-------------------------
    async getGoodsList(){
      const {data: res} = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if(res.meta.status !== 200){
        this.$message.error('查询参数失败！');
      }
      // console.log(res.data);
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },
    // --------------分页事件---------------------------
    // 显示多少条信息
    handleSizeChange(newPageSize){
      this.queryInfo.pagesize = newPageSize;
      this.getGoodsList();
    },
    // 当前页码
    handleCurrentChange(newPagenum){
      this.queryInfo.pagenum = newPagenum;
      this.getGoodsList();
    },
    // --------------删除功能----------------------------
    async removeGoods(goodsId){
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if(confirmResult !== 'confirm'){
          this.$message.info('已取消删除');
        }

        const {data: res} = await this.$http.delete(`goods/${goodsId}`);
        if(res.meta.status !== 200){
          this.$message.error('删除失败！');
        }
        this.$message.success('删除成功！');
        this.getGoodsList();
    },

    // ---------------跳转添加商品页面------------------
    goAddpage(){
      this.$router.push('/goods/add');
    }

  }
}
</script>


<style lang='less' 'scoped'>

</style>