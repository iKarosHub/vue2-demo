<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe="">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="500px"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" v-slot='scope'>
          <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
          <el-tag type="danger" v-else>未付款</el-tag>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" v-slot='scope'>
          {{scope.row.create_time | dateFormat}}
        </el-table-column>
        <el-table-column label="操作" v-slot='scope'>
          <el-button type="primary" class="el-icon-edit" size="mini" @click="showEditDialog"></el-button>
          <el-button type="success" class="el-icon-location" size="mini"></el-button>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
      </el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="50%"
      @close='editDialogClosed'>
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-input v-model="editForm.address1"></el-input>
          <el-cascader :options="cityOptions" v-model="editForm.address1" style="width: 100%"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>


  </div>
</template>


<script>
import cityOptions from './cityData'
export default {
  data(){
    return {
      // 查询订单数据对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单总数
      total: 0,
      // 订单列表
      orderList: [],
      // 控制修改地址对话框显示
      editDialogVisible: false,
      // 修改地址对象
      editForm:{
        address1: [],
        address2: ''
      },
      editFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 级联选择器配置项
      cityOptions,

    }
  },
  created(){
    this.getOrderList();
  },
  methods:{
    // ----------------查询订单数据--------------
    async getOrderList(){
      const {data: res} = await this.$http.get('orders', {
        params: this.queryInfo
      })

      if(res.meta.status !== 200){
        return this.$message.error('查询订单失败');
      }

      console.log(res);
      this.orderList = res.data.goods;
      this.total = res.data.total;

      // console.log('goods:', this.orderList);
      // console.log('goods:', this.total);
    },
    // ---------------分页区域功能-------------------
    // 监听每页显示多少条数据
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 当前页码-------
    handleCurrentChange(newPageNum){
      this.queryInfo.pagenum = newPageNum;
      this.getOrderList();
    },
    // --------------操作功能----------------------
    // 展示修改地址的对话框
    showEditDialog(){

      this.editDialogVisible = true;
    },
    // 关闭修改对话框清空控件
    editDialogClosed(){
      this.$refs.editFormRef.resetFields();
    }

  }
}
</script>


<style lang='less' 'scoped'>

</style>