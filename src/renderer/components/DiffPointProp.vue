<template>
    <el-collapse v-model="activeNames">
        <el-collapse-item title="位置和尺寸" name="1">
            <el-form size="mini" :model="dpCfg" status-icon label-width="40px" class="demo-ruleForm" style="margin-left:10px;margin-right:10px;">
                <el-form-item label="X" prop="x">
                    <el-input readonly v-model.number="dpCfg.x" placeholder="x坐标" ></el-input>
                </el-form-item>
                <el-form-item label="Y" prop="y">
                    <el-input readonly v-model.number="dpCfg.y" placeholder="y坐标"></el-input>
                </el-form-item>
                <el-form-item label="半径" prop="radius">
                    <el-input readonly v-model.number="dpCfg.radius" placeholder="半径" ></el-input>
                </el-form-item>
            </el-form>
        </el-collapse-item>
        <el-collapse-item title="逻辑" name="2">
            <el-form size="mini" :model="dpCfg" :rules="rules2" status-icon label-width="100px" class="demo-ruleForm" style="margin-left:10px;margin-right:10px;">
                <el-form-item label="权重" prop="w">
                    <el-input v-model.number="dpCfg.w" placeholder="权重" @change="handleChange"></el-input>
                </el-form-item>
                <el-form-item label="权重百分比" >
                    <span>{{weightPercent}}%</span>
                </el-form-item>
            </el-form>
        </el-collapse-item>
        <el-collapse-item title="关联" name="3">
            <div style="margin-left:20px;margin-right:20px;">暂时没有内容</div>
        </el-collapse-item>
    </el-collapse>
</template>

<script>
export default {
  data () {
    let validateNumber = (rule, value, callback) => {
      console.log('validateNumber:', value)
      let parsed = Number(value)
      if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1) {
        callback(new Error('请输入正整数'))
      } else {
        callback()
      }
    }

    return {
      activeNames: ['1', '2', '3'],
      dpCfg: {},
      rules2: {
        w: [
          { validator: validateNumber, trigger: 'blur' }
        ]
      },
      weightPercent: 0
    }
  },

  methods: {
    bind (lvCfg, dpCfg) {
      this.dpCfg = dpCfg
      this.lvCfg = lvCfg

      this.calcWeightPercent()
    },

    handleChange () {
      this.$emit('propChanged')
      this.calcWeightPercent()
    },

    calcWeightPercent () {
      let w = this.dpCfg.w
      let ww = 0
      for (let dpc of this.lvCfg.diffs) {
        ww = ww + dpc.w
      }

      // console.log('calcWeightPercent, w:', w, ',ww:', ww)
      this.weightPercent = Math.floor((w / ww) * 100)
    }
  }
}
</script>
