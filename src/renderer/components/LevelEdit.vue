<template>
    <el-container>
        <el-container id = "three">
          <el-header style="text-align: right; font-size: 12px; height:auto;">
          <span style="margin-right:30px;font-weight: bold;font-size: large;">关卡文件: {{ levelFilePath }} <span v-show="changed">[*]</span></span>
          <span style="margin-right:30px;">Command: {{ state }}</span>
          <el-checkbox v-model="verticalShow">垂直显示</el-checkbox>

          <el-button type="warning" v-on:click="cv.handlerRemove()">Remove</el-button>
          <el-button type="danger" v-on:click="cv.handlerClearAll()">Clear All</el-button>
          <el-button type="success" v-on:click="cv.handlerAdd()">Add</el-button>
          <el-button type="success" v-on:click="handlerSave">Save</el-button>
          </el-header>

          <el-main v-bind:style="layoutStyleObject">
            <div id = "canvas-hosta"/>
            <div id = "canvas-hostb" v-bind:style="canvasStyleObject"/>
          </el-main>
        </el-container>
        <el-aside style="background-color: rgb(238, 241, 246)" id = "four" width="*">
          <h1 align="center">{{panelName}}</h1>
          <diffpointProp ref="diffpointProp" v-show="diffPropShow" v-on:propChanged="onlvCfgChanged"/>
          <levelProp ref="levelProp" v-show="levelPropShow" v-on:propChanged="onlvCfgChanged"/>
        </el-aside>
    </el-container>
</template>

<script>
import canvasView from '../logic/canvasView'
import Split from 'split.js'
import fs from 'fs'
import diffpointProp from './DiffPointProp.vue'
import levelProp from './LevelProp.vue'
import { remote } from 'electron'

export default {
  components: {
    'diffpointProp': diffpointProp,
    'levelProp': levelProp
  },

  data () {
    let cv = canvasView.create('canvas-hosta', 'canvas-hostb')
    return {
      cv: cv,
      lvCfg: null,
      verticalShow: false,
      diffPropShow: false,
      levelPropShow: false,
      levelFilePath: '',
      changed: false
    }
  },

  mounted () {
    Split(['#three', '#four'], {
      sizes: [85, 15],
      minSize: [700, 100],
      gutterSize: 5
    })

    this.cv.onMount()
    this.cv.onSelect = (isCircle, c) => {
      this.diffPropShow = isCircle
      this.levelPropShow = !isCircle
      if (isCircle) {
        this.$refs.diffpointProp.bind(this.lvCfg, c.dpCfg)
      }
    }

    this.cv.onCreateCircle = (newC) => {
      if (!this.lvCfg.diffs) {
        this.lvCfg.diffs = []
      }
      this.lvCfg.diffs.push(newC.dpCfg)
      this.changed = true
    }

    this.cv.onRemoveCircle = (c) => {
      let dpCfg = c.dpCfg
      let i = 0
      for (let x of this.lvCfg.diffs) {
        if (x === dpCfg) {
          break
        }
        i++
      }

      this.lvCfg.diffs.splice(i, 1)
      this.changed = true
    }

    this.cv.onClearAll = () => {
      this.lvCfg.diffs = []
      this.changed = true
    }

    this.cv.onContentChanged = () => {
      this.changed = true
    }

    window.addEventListener('keydown', (ev) => {
      console.log('keydown:', ev)
      if (ev.keyCode === 46) {
        this.cv.handlerRemove()
      }
    })
  },

  methods: {
    handlerSave () {
      if (!this.levelFilePath || !this.lvCfg) {
        return
      }

      fs.writeFileSync(this.levelFilePath, JSON.stringify(this.lvCfg, null, 2))
      this.changed = false
    },

    openLevelFile (fullPath) {
      if (!this.changed) {
        this.doOpenLevelFile(fullPath)
      } else {
        let mainWindow = remote.getCurrentWindow()
        remote.dialog.showMessageBox(mainWindow, {
          type: 'warning',
          buttons: ['Shit', 'Do not BiBi'],
          defaultId: 0,
          cancelId: 0,
          title: '丢弃更改',
          message: '当前的关卡已经更改,是否丢弃并打开新文件?'
        },
        (response) => {
          if (response === 1) {
            this.doOpenLevelFile(fullPath)
          }
        })
      }
    },

    doOpenLevelFile (fullPath) {
      this.levelFilePath = fullPath
      this.changed = false

      console.log('le openLevelFile:', fullPath)
      let buf = fs.readFileSync(fullPath)
      let lvCfg = JSON.parse(buf)

      this.lvCfg = lvCfg

      this.cv.loadFrom(lvCfg)

      this.$refs.levelProp.bind(lvCfg)
      this.levelPropShow = true
    },

    onlvCfgChanged (cfgName) {
      this.changed = true

      if (cfgName === 'imagea' || cfgName === 'imageb') {
        this.cv.loadImages(this.lvCfg)
      }
    }
  },
  computed: {
    state () {
      return this.cv.state
    },
    layoutStyleObject () {
      if (this.verticalShow) {
        return {
          display: 'inline'
        }
      } else {
        return {
          display: 'flex'
        }
      }
    },
    canvasStyleObject () {
      if (!this.verticalShow) {
        return {
          'margin-left': '10px'
        }
      } else {
        return {
          'margin-top': '10px'
        }
      }
    },
    panelName () {
      if (this.diffPropShow) {
        return '差异点'
      } else {
        return '关卡'
      }
    }
  }
}
</script>
