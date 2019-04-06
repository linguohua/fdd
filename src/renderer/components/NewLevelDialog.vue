<template>
  <el-dialog title="创建关卡" :visible.sync="dialogVisible" width="30%">
    <span >当前目录：{{dir}}</span>
    <el-form style="margin-top:20px;" :model="ruleForm2" status-icon :rules="rules2" ref="ruleForm2" label-width="80px" class="demo-ruleForm">
      <el-form-item label="名字" prop="filename" required>
        <el-input v-model="ruleForm2.filename" placeholder="请输入关卡名字" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="resetForm('ruleForm2')">取 消</el-button>
      <el-button type="primary" @click="submitForm('ruleForm2')">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import path from 'path'
import fs from 'fs'
import config from '../logic/config'

export default {
  data () {
    let self = this
    let validateFilename = (rule, value, callback) => {
      console.log('validateFilename:', value)
      if (value === '') {
        callback(new Error('请输入文件名'))
      } else {
        if (self.fileExist(value + config.levelFileExt)) {
          callback(new Error('文件或目录已经存在'))
        } else {
          callback()
        }
      }
    }

    return {
      dir: '',
      dialogVisible: false,
      rules2: {
        filename: [
          { validator: validateFilename, trigger: 'blur' }
        ]
      },
      ruleForm2: {
        filename: ''
      }
    }
  },

  methods: {
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.createLevelFile(this.ruleForm2.filename)
          this.dialogVisible = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    resetForm (formName) {
      this.$refs[formName].resetFields()
      this.dialogVisible = false
    },
    showMydialog (dir) {
      this.dir = dir
      this.dialogVisible = true
    },

    fileExist (filename) {
      let fullpath = path.join(this.dir, filename)
      if (fs.existsSync(fullpath)) {
        return true
      }

      return false
    },

    createLevelFile (filename) {
      let fullpath = path.join(this.dir, filename + config.levelFileExt)
      let levelCfg = {name: filename,
        imagea: '',
        imageb: '',
        displayName: filename,
        rscore: 80,
        rpoint: 3,
        rtime: 60,
        starScores: '60,70,90',
        diffs: []}

      // 以2空格indent
      fs.writeFileSync(fullpath, JSON.stringify(levelCfg, null, 2))
    }
  }
}
</script>
