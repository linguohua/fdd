import fs from 'fs'
import path from 'path'

let id = 1
let dirIconClass = ''
let fileIconClass = 'el-icon-document'

function doScan (targetDir, root) {
  let files = fs.readdirSync(targetDir)
  // es6
  for (let filePath of files) {
    if (filePath === 'node_modules') {
      continue
    }

    if (filePath.indexOf('.') === 0) {
      continue
    }

    try {
      let absPath = path.join(targetDir, filePath)
      console.log('filepath:', absPath)

      let obj = {}
      obj.id = id++
      obj.label = filePath
      obj.fullPath = absPath
      root.children.push(obj)

      let isDir = fs.lstatSync(absPath).isDirectory()
      if (isDir) {
        obj.isDir = true
        obj.iconClass = dirIconClass
        obj.children = []
        doScan(absPath, obj)
      } else {
        obj.iconClass = fileIconClass
        obj.isDir = false
      }
    } catch (e) {
      console.log(e)
    }
  }
}

function findDirNode (root, dirName) {
  let rootDir = root.fullPath
  if (dirName.indexOf(rootDir) !== 0) {
    console.log('findDirNode failed, dirName:', dirName, ', not start with:', rootDir)
    return null
  }

  let remain = dirName.substring(rootDir.length + 1)
  let remainParts = remain.split(path.sep)
  let parent = root
  for (let part of remainParts) {
    if (part === '') {
      continue
    }
    let resolved = false
    for (let child of parent.children) {
      if (child.label === part) {
        parent = child
        resolved = true
        break
      }
    }

    if (!resolved) {
      console.log('findDirNode failed to resoved part:', part)
      return null
    }
  }

  return parent
}

function removeChild (root, childName) {
  console.log('removeChild, root:', root.label, ', childName:', childName)
  let index = 0
  let found = false
  for (let child of root.children) {
    if (child.label === childName) {
      found = true
      break
    }
    index++
  }

  if (found) {
    root.children.splice(index, 1)
  }
}

function hasChildNode (parent, childName) {
  for (let child of parent.children) {
    if (child.label === childName) {
      return true
    }
  }

  return false
}

export default {
  scan: function (targetDir) {
    id = 1
    let root = {}
    root.id = id++
    root.label = targetDir
    root.fullPath = targetDir
    root.iconClass = dirIconClass
    root.isDir = true
    root.children = []

    doScan(targetDir, root)

    return [root]
  },

  addFile: function (root, filePath) {
    let fileName = path.basename(filePath)
    let dirName = path.dirname(filePath)

    console.log('addFile filePath:', filePath, ', fileName:', fileName, ',dirName:', dirName)
    let node = findDirNode(root, dirName)
    if (hasChildNode(node, fileName)) {
      console.log('addFile, node:', node.label, ' already has child:', fileName)
      return
    }

    let obj = {}
    obj.id = id++
    obj.label = fileName
    obj.fullPath = filePath
    obj.isDir = false
    obj.iconClass = fileIconClass

    console.log('addFile, node:', node.label, ' fileName:', fileName)
    node.children.push(obj)
  },

  removeFile: function (root, filePath) {
    let fileName = path.basename(filePath)
    let dir = path.dirname(filePath)
    let node = findDirNode(root, dir)

    if (node === null) {
      return
    }

    removeChild(node, fileName)
  },

  onAddDir: function (root, dir) {
    if (root.label === dir) {
      return
    }

    let dirName = path.basename(dir)
    let rootDir = path.dirname(dir)
    let node = findDirNode(root, rootDir)
    if (hasChildNode(node, dirName)) {
      console.log('onAddDir, node:', node.label, ' already has child:', dirName)
      return
    }

    let obj = {}
    obj.id = id++
    obj.label = dirName
    obj.fullPath = dir
    obj.isDir = true
    obj.children = []
    obj.iconClass = dirIconClass

    node.children.push(obj)
  },

  onRemoveDir: function (root, dir) {
    let dirName = path.basename(dir)
    let rootDir = path.dirname(dir)
    let node = findDirNode(root, rootDir)

    removeChild(node, dirName)
  }
}
