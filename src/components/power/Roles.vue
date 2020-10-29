<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand" v-slot="scope">
          <el-row v-for="(item1, index1) in scope.row.children" :key="item1.id" :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']">
            <!-- 渲染一级权限 -->
            <el-col :span="5">
              <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>

            <!-- 渲染二级和三级权限 -->
            <el-col :span="19">
              <!-- 通过 for 循环嵌套渲染二级权限 -->
              <el-row v-for="(item2, index2) in item1.children" :key="item2.id" :class="[index2 === 0 ? '' : '', 'vcenter']">
                <el-col :span="6">
                  <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>

                <el-col :span="18">
                  <el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row, item3.id)">
                    {{ item3.authName }}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-table-column>

        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px" v-slot="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
          <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog @close="dialogClosed" title="添加用户" :visible.sync="addRoleDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="修改用户" :visible.sync="editRoleDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="editRoleForm" :rules="addRoleFormRules" ref="editRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog @close="setRightDialogClosed" title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-tree :data="rightList" :props="treeProps" node-key="id" show-checkbox default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 添加角色对话框显示
      addRoleDialogVisible: false,
      // 编辑角色对话框显示
      editRoleDialogVisible: false,
      // 分配权限对话框显示
      setRightDialogVisible: false,
      // 添加角色表单对象
      addRoleForm: {},
      // 查询角色表单对象
      editRoleForm: {},
      // 所有权限的数据
      rightList: [],
      // 验证角色规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 25, message: "长度在 3 到 15 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: false, message: "请输入角色描述", trigger: "blur" },
          { min: 0, max: 15, message: "长度在 0 到 5 个字符", trigger: "blur" }
        ]
      },
      // 树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // roleId 当前即将分配角色的id
      roleId: ""
    }
  },
  created() {
    // 获取角色列表
    this.getRolesList()
  },
  methods: {
    // 获取所有用户列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles")

      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！")
      }

      this.rolesList = res.data
      console.log(this.rolesList)
    },

    // 关闭对话框清空表单数据
    dialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },

    // 点击确认按钮，添加新角色
    async addRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        // 校验成功则发送添加请求
        const { data: res } = await this.$http.post("roles", this.addRoleForm)

        if (res.meta.status !== 201) {
          return this.$message.error("添加新角色失败！")
        }

        // 提示添加新角色成功
        this.$message.success("添加新角色成功！")
        // 刷新角色列表
        this.getRolesList()
        // 关闭对话框
        this.addRoleDialogVisible = false
      })
    },

    // 点击编辑按钮，根据用户id查询信息
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id)
      if (res.meta.status != 200) {
        return this.$message.error("查询不到角色数据！")
      }
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },

    // 点击确认，提交修改后的角色信息
    editRoleInfo() {
      // 提交信息前，先校验数据是否都正确
      this.$refs.editRoleFormRef.validate(async valid => {
        // console.log(valid);
        if (!valid) return

        // 成功校验后提交数据
        const { data: res } = await this.$http.put("roles/" + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })

        if (res.meta.status !== 200) {
          return this.$message.error("修改角色信息失败！")
        }

        // 关闭修改用户对话框
        this.editRoleDialogVisible = false
        // 提示修改用户信息成功
        this.$message.success("修改角色信息成功！")
        // 刷新角色列表
        this.getRolesList()
      })
    },

    // 点击删除按钮，根据角色id删除角色
    async removeRoleById(id) {
      const confirmResult = await this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消删除，则返回值为字符串 cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除")
      }

      // 确认删除
      const { data: res } = await this.$http.delete("roles/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色失败！")
      }
      this.$message.success("删除角色成功")
      this.getRolesList()
    },

    // 根据id删除对应权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)

      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除")
      }

      // console.log('确认删除');
      // 确认删除
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败！")
      }
      this.$message.success("删除权限成功")

      // this.getRolesList();
      // 返回的是最新数据，直接赋值即可，如果使用上面的会刷新页面
      role.children = res.data
    },

    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get("rights/tree")

      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败！")
      }
      this.rightList = res.data
      // console.log(this.rightList)

      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },

    // 通过递归的形式，获取角色下所有三级权限的id,
    // 并保存到defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },

    // 关闭对话框清空分配权限数据
    setRightDialogClosed() {
      this.defKeys = []
    },

    // 点击为角色分配权限
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      // console.log(keys);
      const idStr = keys.join(",")

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败！")
      }
      this.$message.success("分配权限成功！")
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
