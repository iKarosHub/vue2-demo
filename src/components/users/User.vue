<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList">
            </el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- v-slot:default= 'scope' 中scope接收存储子组件传来的数据 -->
          <template v-slot:default="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot:default="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" icon="el-icon-setting" size="mini" @click='setRole(scope.row)'>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      @close="addDialogClosed"
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%">
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form
        :model="editForm"
        :rules="addFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close='setRoleDialogClosed'>
      <!-- 内容主体区域 -->
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
        </p>
      </div>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    let checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;

      if (emailReg.test(value)) return cb();

      // 不合法时
      cb(new Error("请输入合法的邮箱"));
    };
    // 验证手机号的规则
    let checkMobile = (rule, value, cb) => {
      // 验证手机的正则表达式
      const mobileReg = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

      if (mobileReg.test(value)) return cb();

      // 不合法时
      cb(new Error("请输入合法的手机号码"));
    };
    return {
      queryInfo: {
        query: "",
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2,
      },
      userList: [],
      // 一共多少条数据
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      addDialogVisible: false,
      // 控制分配角色对话框的显示
      setRoleDialogVisible: false,
      // 表单数据对象
      addForm: {},
      // 表单验证规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 5,
            max: 15,
            message: "长度在 5 到 15 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 修改用户对话框的显示和隐藏
      editDialogVisible: false,
      // 查询得到的数据
      editForm: {},
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的列表
      rolesList: [],
      // 选中的角色id值
      selectRoleId: ''
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    // 获取用户列表事件
    getUserList() {
      this.$http
        .get("users", { params: this.queryInfo })
        .then((res) => {
          // console.log(res.status);
          if (res.status !== 200)
            return this.$message.error("获取用户列表失败！");

          this.userList = res.data.data.users;
          this.total = res.data.data.total;
          // console.log(this.userList);
        })
        .catch((err) => {
          console.log("err ==> ", err);
        });
    },

    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log('handleSizeChange -->', newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },

    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      // console.log('handleCurrentChange', newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },

    // 监听 switch 开关状态的改变
    async userStateChange(userInfo) {
      console.log(userInfo);
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )

      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }

      this.$message.success("更新用户状态成功");
    },

    // 监听添加用户对话框的关闭事件，清空控件内容
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },

    // 点击按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("users", this.addForm);
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败！");
        }

        this.$message.success("添加用户成功!");
        // 隐藏添加用户的对话框
        this.addDialogVisible = false;
        // 重新获取用户列表数据
        this.getUserList();
      });
    },

    // 点击按钮，根据用户id查询用户信息
    async showEditDialog(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status != 200) {
        return this.$message.error("查询不到用户数据！");
      }
      this.editForm = res.data;
    },

    // 点击按钮，提交修改后的用户信息
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        // 成功则发起网络请求
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败！");
        }
        // 关闭对话框
        this.editDialogVisible = false;
        // 刷新用户列表
        this.getUserList();
        // 提示更新信息成功
        this.$message.success("更新用户信息成功！");
      });
    },
    // 点击按钮，删除用户
    async removeUserById(id){
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        // 如果用户确认删除，则返回值为字符串 confirm
        // 如果用户取消删除，则返回值为字符串 cancel        
        if(confirmResult !== 'confirm'){
          return this.$message.info("已取消删除")
        }
        // console.log(id);
        // 确认删除
        const {data: res} = await this.$http.delete('users/'+ id);
        
        if(res.meta.status !== 200){
          return this.$message.error("删除用户失败!");
        }

        this.$message.success("删除用户成功！");
        this.getUserList();
    },
    // 展示分配角色的对话框
    async setRole(userInfo){
      this.userInfo = userInfo;
      
      // 在展示对话框之前，获取所有角色列表
      const {data: res} = await this.$http.get("roles");
      if(res.meta.status !== 200){
        return this.$message.error("获取角色失败！")
      }
      this.rolesList = res.data;
      // console.log(this.rolesList);

      this.setRoleDialogVisible = true;
    },

    // 点击按钮，分配角色
    async saveRoleInfo(){
      // console.log(this.selectRoleId);
      if(!this.selectRoleId){
        return this.$message.error("请选择要分配的用户角色")
      }

      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectRoleId
      })

      if(res.meta.status !== 200){
        return this.$message.error('更新角色失败！');
      }

      this.$message.success("更新角色成功");
      this.getUserList();
      this.setRoleDialogVisible = false;

    },
    // 监听分配角色对话框关闭事件
    setRoleDialogClosed(){
      this.selectRoleId = ''
      this.userInfo = {}
    }
  },
};
</script>

