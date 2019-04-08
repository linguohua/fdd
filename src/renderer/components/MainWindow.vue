<template>
  <el-container style="height:97vh; border: 1px solid #eee" ref = "cc">
    <dirtree id = "one" ref = "dt" v-on:openLevelFile="$refs.le.openLevelFile($event)"/>
    <leveledit id = "two" ref = "le"/>
  </el-container>
</template>

<style>
.gutter {
    background-color: #eee;

    background-repeat: no-repeat;
    background-position: 50%;
}

.gutter.gutter-vertical {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
}

.gutter.gutter-horizontal {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
}
</style>

<script>
import { ipcRenderer } from 'electron'
import dirtree from './DirTree.vue'
import leveledit from './LevelEdit.vue'
import Split from 'split.js'
import config from '../logic/config'

export default {
  components: {
    'leveledit': leveledit,
    'dirtree': dirtree
  },

  data () {
    return {
    }
  },

  methods: {

  },

  mounted () {
    console.log('MainWindow mounted')
    ipcRenderer.on('openFolder', (event, arg) => {
      console.log('openFolder:', arg) // prints "pong"
      this.$refs.dt.openFolder(arg[0])
    })
    ipcRenderer.on('openFile', (event, arg) => {
      console.log('openFile:', arg) // prints "pong"
      this.$refs.le.openLevelFile(arg[0])
    })

    Split(['#one', '#two'], {
      sizes: [15, 85],
      minSize: [100, 800],
      gutterSize: 8
    })

    window.addEventListener('dragenter', e => {
      e.preventDefault()
      e.stopPropagation()
    })

    window.addEventListener('dragover', e => {
      e.preventDefault()
      e.stopPropagation()
    })

    window.addEventListener('drop', e => {
      e.preventDefault()
      e.stopPropagation()

      for (let f of e.dataTransfer.files) {
        console.log('The file(s) you dragged: ', f, ', typeof f.name:', typeof (f.name))
        let filename = f.name
        if (filename.endsWith(config.levelFileExt)) {
          this.$refs.le.openLevelFile(f.path)
          break
        }
      }
    })
  },
  destroyed () {
    ipcRenderer.removeAllListeners()
    window.removeEventListener('drop')
    window.removeEventListener('dragover')
    window.removeEventListener('dragenter')
  }
}
</script>
