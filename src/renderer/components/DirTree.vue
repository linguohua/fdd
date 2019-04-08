<template>
    <el-aside width="*" style="background-color: rgb(238, 241, 246)">
        <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
        <el-tree
        style="background-color: rgb(238, 241, 246)"
        class="filter-tree"
        :highlight-current="true"
        :data="data2"
        :props="defaultProps"
        node-key="id"
        :default-expanded-keys="[1]"
        :filter-node-method="filterNode"
        ref="tree2">
        <span class="custom-tree-node" slot-scope="{data}">
            <span v-on:dblclick="onTreeNodeDoubleClick($event, data)">
                <i :class="data.iconClass"></i>{{ data.label }}
            </span>
        </span>
        </el-tree>
        <vue-context ref="menu-for-dir" style="width:180px;">
            <ul slot-scope="child">
                <li @click="onCtxMenuClicked($event.target.innerText, child.data)">New level</li>
                <li @click="onCtxMenuClicked($event.target.innerText, child.data)">Reveal in Explorer</li>
            </ul>
        </vue-context>

        <vue-context ref="menu-for-file" style="width:180px;">
            <ul slot-scope="child">
                <li @click="onCtxMenuClicked($event.target.innerText, child.data)">Delete</li>
                <li @click="onCtxMenuClicked($event.target.innerText, child.data)">Reveal in Explorer</li>
            </ul>
        </vue-context>

        <NewLevelDialog ref="newleveldialog1"/>
    </el-aside>
</template>
<style>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}
.el-aside {
  color: #333;
}
</style>
<script>
import { remote, shell } from 'electron'
import dirscan from '../logic/dirscan'
import { VueContext } from 'vue-context'
import MyNewLevelDialog from './NewLevelDialog.vue'
import chokidar from 'chokidar'
import config from '../logic/config'

export default {
  components: {
    'vue-context': VueContext,
    'NewLevelDialog': MyNewLevelDialog
  },

  watch: {
    filterText (val) {
      this.$refs.tree2.filter(val)
    }
  },

  data () {
    console.log(remote.app.getVersion())

    return {
      contextMenuTarget: null,
      contextMenuVisible: false,
      filterText: '',
      data2: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      projectdir: '',
      watcher: null
    }
  },

  methods: {
    openFolder (projectdir) {
      this.projectdir = projectdir
      let data2 = dirscan.scan(projectdir)
      this.data2 = data2

      this.monitorProjectDir()
    },

    filterNode (value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },

    newLevel () {
      console.log('newLevel')
    },

    onCtxMenuClicked (menuName, data) {
      console.log('onCtxMenuClicked menuName:', menuName, ', data:', data)

      if (menuName === 'New level') {
        this.onNewLevel(data)
      } else if (menuName === 'Delete') {
        this.onDeleteFile(data)
      } else if (menuName === 'Reavel in Explorer') {
        this.onReavelInExplorer(data)
      }
    },

    onNewLevel (data) {
      let dir = data.fullPath
      this.$refs['newleveldialog1'].showMydialog(dir)
    },

    onDeleteFile (data) {
      let fullPath = data.fullPath
      if (!fullPath.endsWith(config.levelFileExt)) {
        this.$message('只能删除关卡文件')
        return
      }

      shell.moveItemToTrash(fullPath)
    },

    onReavelInExplorer (data) {
      let fullPath = data.fullPath
      shell.showItemInFolder(fullPath)
    },

    monitorProjectDir () {
      if (this.projectdir === '') {
        return
      }

      if (this.watcher != null) {
        this.watcher.close()
        this.watcher = null
      }
      // Initialize watcher.
      const watcher = chokidar.watch(this.projectdir, {
        ignored: ['**/node_modules/**', /(^|[/\\])\../],
        persistent: true,
        usePolling: true,
        ignoreInitial: true
      })

      // Something to use when events are received.
      const log = console.log.bind(console)
      watcher
        .on('add', path => this.onAddFile(path))
        .on('unlink', path => this.onRemoveFile(path))
        .on('addDir', path => this.onAddDir(path))
        .on('unlinkDir', path => this.onRemoveDir(path))
        .on('error', error => log(`Watcher error: ${error}`))
        .on('ready', () => log('Initial scan complete. Ready for changes'))

      this.watcher = watcher
    },

    onAddFile (path) {
      console.log('onAddFile:', path)
      dirscan.addFile(this.data2[0], path)
    },

    onRemoveFile (path) {
      console.log('onRemoveFile:', path)
      dirscan.removeFile(this.data2[0], path)
    },

    onAddDir (path) {
      console.log('onAddDir:', path)
      dirscan.onAddDir(this.data2[0], path)
    },

    onRemoveDir (path) {
      console.log('onRemoveDir:', path)
      dirscan.onRemoveDir(this.data2[0], path)
    },
    onTreeNodeDoubleClick (e, data) {
      console.log('double click:', data)
      if (data.isDir) {
        return
      }

      let fullPath = data.fullPath
      if (fullPath.endsWith(config.levelFileExt)) {
        this.$emit('openLevelFile', fullPath)
      }
    }
  },

  mounted () {
    let self = this
    let tree = this.$refs['tree2']
    tree.$on('node-contextmenu', function (e, data, node, c) {
      if (data.isDir) {
        console.log('tree context menu for dir:', data)
        // self.contextMenuTarget = node
        self.$refs['menu-for-file'].show = false
        self.$refs['menu-for-dir'].open(e, data)
      } else {
        console.log('tree context menu for file:', data)
        // self.contextMenuTarget = node
        self.$refs['menu-for-dir'].show = false
        self.$refs['menu-for-file'].open(e, data)
      }
    })

    this.monitorProjectDir()
  },

  destroyed () {
    if (this.watcher) {
      this.watcher.stop()
    }
  }
}
</script>
