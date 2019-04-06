<template>
    <el-collapse v-model="activeNames">
        <el-collapse-item title="基本信息" name="1">
            <el-form size="mini" :model="lvCfg" status-icon label-width="100px" class="demo-ruleForm" style="margin-left:10px;margin-right:10px;">
                <el-form-item label="关卡显示名" prop="displayName">
                    <el-input v-model="lvCfg.displayName" placeholder="关卡显示名" @change="handleChange"></el-input>
                </el-form-item>
                <el-form-item label="差异点数量">
                    <span>{{diffsLength}}</span>
                </el-form-item>
            </el-form>
        </el-collapse-item>
        <el-collapse-item title="图片Pair" name="2">
            <el-form size="mini" :model="lvCfg" status-icon label-width="60px" class="demo-ruleForm" style="margin-left:10px;margin-right:10px;">
                <el-form-item label="图片a" prop="imagea">
                    <el-input v-model="lvCfg.imagea" placeholder="图片a" @change="handleChange"></el-input>
                    <el-button @click="handleSelectImageA">选择</el-button>
                </el-form-item>
                <el-form-item label="图片b" prop="imageb">
                    <el-input v-model="lvCfg.imageb" placeholder="图片b" @change="handleChange"></el-input>
                    <el-button @click="handleSelectImageB">选择</el-button>
                </el-form-item>
            </el-form>
        </el-collapse-item>
        <el-collapse-item title="逻辑" name="3">
            <el-form size="mini" :model="lvCfg" :rules="rules2" status-icon label-width="100px" class="demo-ruleForm" style="margin-left:10px;margin-right:10px;">
                <el-form-item label="要求的分数" prop="rscore">
                    <el-input v-model.number="lvCfg.rscore" placeholder="要求的分数" @change="handleChange"></el-input>
                </el-form-item>
                <el-form-item label="要求的点数" prop="rpoint">
                    <el-input v-model.number="lvCfg.rpoint" placeholder="要求的点数" @change="handleChange"></el-input>
                </el-form-item>
                <el-form-item label="要求的时间" prop="rtime">
                    <el-input v-model.number="lvCfg.rtime" placeholder="以秒为单位" @change="handleChange"></el-input>
                </el-form-item>
                <el-form-item label="星级" prop="starScores">
                    <el-input v-model.number="lvCfg.starScores" placeholder="逗号分割" @change="handleChange"></el-input>
                </el-form-item>
            </el-form>
        </el-collapse-item>
    </el-collapse>
</template>

<script>
import { remote } from 'electron'
export default {
  data () {
    let validateNumber = (rule, value, callback) => {
      console.log('validateNumber:', value)
      let parsed = Number(value)
      if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed < 0) {
        callback(new Error('请输入非负整数'))
      } else {
        callback()
      }
    }

    return {
      activeNames: ['1', '2', '3'],
      lvCfg: {},
      rules2: {
        rscore: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        rpoint: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        rtime: [
          { validator: validateNumber, trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    handleChange () {
      this.$emit('propChanged')
    },

    bind (lvCfg) {
      console.log('LevelProp bind')
      this.lvCfg = lvCfg
    },

    handleSelectImageA () {
      console.log('handleSelectImageA')
      let filepath = this.selectFile()
      if (filepath) {
        this.lvCfg.imagea = filepath

        this.$emit('propChanged', 'imagea')
      }
    },

    handleSelectImageB () {
      let filepath = this.selectFile()
      if (filepath) {
        this.lvCfg.imageb = filepath

        this.$emit('propChanged', 'imageb')
      }
    },

    selectFile () {
      let mainWindow = remote.getCurrentWindow()
      let paths = remote.dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
        ]
      })

      if (paths) {
        return paths[0]
      }
    }
  },
  computed: {
    diffsLength () {
      if (this.lvCfg && this.lvCfg.diffs) {
        return this.lvCfg.diffs.length
      }

      return 0
    }
  }
}
</script>
