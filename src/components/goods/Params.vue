<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告区域 -->
        <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon>
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
          v-model="selectedCateKeys"
          :options="cateList"
          :props="cateProps"
          @change="handleChange"></el-cascader>
        </el-col>
      </el-row>

      <!-- Tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button :disabled='isBtnDisabled' type="primary" size="mini"  @click="addDialogVisible=true">添加参数</el-button>

          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand" v-slot='scope'>
              <el-tag v-for="(item, i) in scope.row.attr_vals"
                :key="i"
                closable
                @close='handleClose(i, scope.row)'>{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作" v-slot= 'scope'>
              <el-button type="primary" class="el-icon-edit" size="mini" @click="showEditParamsDialog(scope.row.attr_id)"> 编辑</el-button>
              <el-button type="danger" class="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)"> 删除</el-button>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态参数面板 -->
        <el-tab-pane label="静态参数" name="only">
          <el-button :disabled='isBtnDisabled' type="primary" size="mini"  @click="addDialogVisible=true">添加参数</el-button>

          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand" v-slot='scope'>
              <el-tag v-for="(item, i) in scope.row.attr_vals"
                :key="i"
                closable
                @close='handleClose(i, scope.row)'>{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作" v-slot= 'scope'>
              <el-button type="primary" class="el-icon-edit" size="mini" @click="showEditParamsDialog(scope.row.attr_id)"> 编辑</el-button>
              <el-button type="danger" class="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)"> 删除</el-button>
            </el-table-column>
          </el-table>
        </el-tab-pane>
    </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close= "addDialogClosed"
      >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close= "editDialogClosed"
      >
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择器配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数据
      selectedCateKeys: [],
      // 当前选中的tab标签页
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 控制添加参数对话框显示
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {},
      // 添加表单验证规则对象
      addFormRules: {
        attr_name: [
           { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },

      // 修改参数----------
      // 控制修改参数对话框显示
      editDialogVisible: false,
      // 查询或修改参数表单数据对象
      editForm: {},
    }
  },
  created(){
    this.getCateList();
  },
  methods:{
    // -------------获取所有商品分类列表-----------------
    async getCateList(){
      const {data: res} = await this.$http.get('categories');
      if(res.meta.status !== 200){
        return this.$message.error('获取商品参数列表失败');
      }
      this.cateList = res.data;
      // console.log(this.cateList);  
    },

    // 级联选择框选中会触发该函数
    handleChange(){
      this.getParamsData();
    },

    // tab 页签点击事件的处理函数
    handleTabClick(){
      // console.log(this.activeName);
      this.getParamsData();
    },

    // 获取级联选择框参数列表数据
    async getParamsData(){
      if(this.selectedCateKeys.length !== 3){
        // 证明选中的不是三级分类
        this.selectedCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      // console.log(this.selectedCateKeys);

      // 根据所选分类id,和当前所处的面板，获取对应的参数
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {sel : this.activeName}
      })
      if(res.meta.status !== 200){
        this.$message.error('获取参数失败');
      }
      // console.log(this.cateId);
      
      // console.log(res);
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(/\s|\,/) : [];
        // 控制文本框的显示和隐藏
        item.inputVisible = false;
        // 文本框中输入的值
        item.inputValue = ''
      })
      console.log(res.data);
      
      if(this.activeName === 'many'){
        this.manyTableData = res.data
      }else{
        this.onlyTableData = res.data
      }
    },

    // -------------------添加动态参数或静态属性--------------
    addParams(){
      // 校验
      this.$refs.addFormRef.validate( async valid => {
        if( !valid) return;

        const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })

        if(res.meta.status !== 201){
          this.$message.error('添加参数失败');
        }

        this.$message.success('添加参数成功');
        this.addDialogVisible = false;
        this.getParamsData();
      } )
    },
    // 监听添加参数对话框关闭事件
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    // =================添加结束================================

    // -----------------修改参数------------------------------------
    // 展开修改参数对话框
    async showEditParamsDialog(attrId){
      // 查询当前参数信息
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`)
      if(res.meta.status !== 200){
        return this.$message.error('查询参数失败');
      }
      this.editForm = res.data;
      this.editDialogVisible = true
    },
    editParams(){
      // 校验表单
      this.$refs.editFormRef.validate( async valid => {
        if(!valid) return;

        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })

        if(res.meta.status !== 200){
          return this.$message.error('修改失败');
        }
        this.$message.success('修改成功');
        this.getParamsData();
        this.editDialogVisible = false
      })
    },
    // 监听修改参数对话框关闭事件
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    // =================修改结束====================================

    // -----------------删除参数-------------------------------------
    async removeParams(attrId){
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if(confirmResult !== 'confirm'){
          return this.$message.info("已取消删除")
      }

      // 确认删除
      const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`);
      if(res.meta.status !== 200){
        return this.$message.error('删除参数失败！');
      }
      this.$message.success('删除参数成功');
      this.getParamsData();
    },
    // =================删除成功=====================================

    // ------------------文本框失去焦点，或摁下enter都会触发---------
    async handleInputConfirm(scopeRow){
      if(scopeRow.inputValue.trim().length === 0){
        scopeRow.inputValue = ''
        scopeRow.inputVisible = false
        return;
      }
      // 后继处理
      scopeRow.attr_vals.push(scopeRow.inputValue.trim());
      scopeRow.inputValue = ''
      scopeRow.inputVisible = false
      
      this.saveAttrVals(scopeRow);
    },
    // 将attr_vals的操作，保存到数据库
    async saveAttrVals(scopeRow){
      // 发起请求保存数据
      const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${scopeRow.attr_id}`, {
        attr_name: scopeRow.attr_name,
        attr_sel: scopeRow.attr_sel,
        attr_vals: scopeRow.attr_vals.join(' ')
      });

      if(res.meta.status !== 200){
        return this.$message.error('修改参数项是失败');
      }
      this.$message.success('修改参数项成功！');
    },
    // 删除文本
    handleClose(i, scopeRow){
      scopeRow.attr_vals.splice(i, 1);
      this.saveAttrVals(scopeRow);
    },
    // 展示文本输入框
    showInput(scopeRow){
      scopeRow.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    }


  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled(){
      if(this.selectedCateKeys.length !== 3){
        return true
      }
      return false;
    },
    // 获取级联选中分类的id
    cateId(){
      if(this.selectedCateKeys.length === 3){
        return this.selectedCateKeys[2];
      }
      return null;
    },
    // 动态显示动态参数或静态参数
    titleText(){
      if(this.activeName === 'many'){
        return '动态参数'
      }
      return '静态参数'
    }

  }
}
</script>


<style lang='less' scoped>
.el-row{
  margin-top: 15px;
}
.el-tag{
  margin: 5px;
}
.input-new-tag{
  width: 120px;
}
</style>