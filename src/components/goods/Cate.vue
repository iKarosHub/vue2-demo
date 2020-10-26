<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图引擎 -->
    <el-card>
      <!-- 添加商品区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table :data='cateList'
      :columns='columns'
      :selection-type='false'
      :expand-type='false'
      show-index border
      class="tree-table">
      <!-- 是否有效 -->
        <template v-slot:isok= 'scope'>
          <i class="el-icon-success" 
          v-if="scope.row.cat_deleted === false"
          style="color: lightgreen"></i>
          <i class="el-icon-error" 
          v-else
          style="color: red"></i>
        </template>
      <!-- 排序 -->
        <template v-slot:order= 'scope'>
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
      <!-- 操作 -->
        <template v-slot:opt= 'scope'>
          <el-button type="primary" size="mini" class="el-icon-edit" @click="showEditCateDialog(scope.row.cat_id)"> 编辑</el-button>
          <el-button type="danger" size="mini" class="el-icon-delete" @click="removeCate(scope.row.cat_id)"> 删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 3, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
    @close= 'addCateDialogClosed'
    title="添加分类"
    :visible.sync="addCateDialogVisible"
    width="50%">
    <!-- 添加分类表单 -->
    <el-form 
    :model= 'addCateForm' 
    :rules= 'addCateFormRules'
    ref= 'addCateFormRef'
    label-width="100px"
    >
      <el-form-item label="分类名称" prop="cat_name">
        <el-input v-model="addCateForm.cat_name"></el-input>
      </el-form-item>
      <el-form-item label="父级分类">
        <el-cascader
        v-model="selectedKeys"
        :options="parentCateList"
        :props="cascaderProps"
        @change="parentCateChange"
        style="width: 100%"
        clearable
        change-on-select></el-cascader>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="addCateDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addCate">确 定</el-button>
    </span>
  </el-dialog>

  <!-- 编辑分类对话框 -->
    <el-dialog
    title="编辑分类"
    :visible.sync="editCateDialogVisible"
    width="50%">
    <!-- 编辑分类表单 -->
    <el-form 
    :model= 'editCateForm' 
    :rules= 'addCateFormRules'
    ref= 'editCateFormRef'
    label-width="100px"
    >
      <el-form-item label="分类名称" prop="cat_name">
        <el-input v-model="editCateForm.cat_name"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="editCateDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editCate">确 定</el-button>
    </span>
  </el-dialog>


  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类的数据列表
      cateList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        // 请求当前页数
        pagenum: 1,
        // 每页显示多少条
        pagesize: 5
      },
      // 查询到的商品条数
      total: 0,
      // 为tree-table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },{
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },{
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'order'
        },{
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'opt'
        },
      ],
      // 控制添加分类对话框可见
      addCateDialogVisible: false,
      // 控制编辑分类对话框可见
      editCateDialogVisible: false,
      // 控制删除分类对话框可见
      deleteCateDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        // 将要添加分类的名称
        cat_name: '',
        // 将要添加父分类id
        cat_pid: 0,
        // 将要添加分类的层级，默认要添加的是1级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 选中的父级分类的id数组
      selectedKeys: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 查询编辑分类名称数据对象
      editCateForm: {},

    }
  },
  created() {
    // 获取商品分类数据
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList(){
      const {data: res} = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if(res.meta.status !== 200){
        return this.$message.error("获取商品分类失败！");
      }

      // 将获取的商品分类保存到cateList中
      // console.log(res.data);
      this.cateList = res.data.result;
      // 保存商品条数
      this.total = res.data.total;
    },

    // 监听pagesize改变
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize;
      this.getCateList();
      console.log("1111")
    },
    // 监听pagenum改变
    handleCurrentChange(newpage){
      this.queryInfo.pagenum = newpage;
      this.getCateList();
    },

    // ----------------展示添加分类对话框---------------------------
    showAddCateDialog(){
      // 先获取父级分类的数据列表
      this.getParentCateList();

      this.addCateDialogVisible = true;
    },

    // 获取父级所有商品分类
    async getParentCateList(){
      const {data: res} = await this.$http.get('categories', {
        params: {type: 2}
      })

      if(res.meta.status !== 200){
        return this.$message.error("获取父级分类失败");
      }

      // console.log(res.data);
      this.parentCateList = res.data;      
    },

    // 选择项发生变化触发这个函数
    parentCateChange(){
      console.log(this.selectedKeys);
      
      if(this.selectedKeys.length > 0){
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length -1]
        this.addCateForm.cat_level = this.selectedKeys.length;
        return ;
      }else{
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },

    // 点击按钮添加新的分类
    addCate(){
      // console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return;

        const {data: res} = await this.$http.post('categories', this.addCateForm);
        if(res.meta.status !== 201){
          return this.$message.error('添加商品分类失败');
        }

        this.$message.success('添加商品分类成功');
        
        this.getCateList();

        this.addCateDialogVisible = false;
      })

      
    },
    // 关闭添加分类对话框清空控件
    addCateDialogClosed(){
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // =======================添加结束============================

    // ----------------------展示编辑对话框-------------------------
    async showEditCateDialog(cateId){
      const {data: res} = await this.$http.get('categories/'+ cateId);
      if(res.meta.status !== 200){
        return this.$message.error('成功获取分类名称');
      }
      // console.log(res.data);
      this.editCateForm = res.data; 
      this.editCateDialogVisible = true;
    },

    // 编辑分类名称
    editCate(){
      this.$refs.editCateFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) return;

        // 成功校验后提交数据
        const {data: res} = await this.$http.put('categories/' + this.editCateForm.cat_id,
        {
          cat_name: this.editCateForm.cat_name
        })

        if(res.meta.status !== 200){
          this.$message.error('修编分类名称失败');
        }

        this.editCateDialogVisible = false;
        this.getCateList();
        this.$message.success('修改分类名称成功');
      })
    },
    // =======================编辑结束=================================

    // ----------------------根据id删除分类---------------------------
    async removeCate(cateId){
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消删除，则返回值为字符串 cancel        
      if(confirmResult !== 'confirm'){
        return this.$message.info("已取消删除")
      }

      // 确认删除
      const {data: res} = await this.$http.delete('categories/'+ cateId);
      if(res.meta.status !== 200){
        this.$message.error('删除分类失败');
      }
      this.$message.success('删除分类成功');

      this.getCateList();
    }
    // =======================删除结束================================
  }
}
</script>

<style lang="less" scoped>
  .tree-table{
    margin-top: 15px;
  }
</style>