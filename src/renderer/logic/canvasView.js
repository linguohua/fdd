import Konva from 'konva'

function CanvasView (mountElementNameA, mountElementNameB) {
  this.imageA = null
  this.imageB = null
  this.imgLayerOfStageA = null
  this.layerA = null
  this.state = 'idle'
  this.stageA = null
  this.stageB = null
  this.transformer = null
  this.mountElementNameA = mountElementNameA
  this.mountElementNameB = mountElementNameB
  this.newCreateCircle = null
  this.onSelect = null
  this.lvCfg = null

  this.createStageB = function () {
    let width = 0
    let height = 0

    let stageB = new Konva.Stage({
      container: this.mountElementNameB,
      width: width,
      height: height
    })

    let imgLayerOfStageB = new Konva.Layer()
    imgLayerOfStageB.name('image')
    stageB.add(imgLayerOfStageB)
    this.imgLayerOfStageB = imgLayerOfStageB

    this.stageB = stageB
  }

  this.createStageA = function () {
    let myThis = this
    let width = 0
    let height = 0

    let stageA = new Konva.Stage({
      container: this.mountElementNameA,
      width: width,
      height: height
    })

    let imgLayerOfStageA = new Konva.Layer()
    imgLayerOfStageA.name('image')
    stageA.add(imgLayerOfStageA)

    let layerA = new Konva.Layer()
    layerA.name('circles')
    stageA.add(layerA)

    let tr = this.createTransform()
    tr.anchorSize(10)
    layerA.add(tr)

    this.imgLayerOfStageA = imgLayerOfStageA
    this.layerA = layerA
    this.transformer = tr
    this.stageA = stageA

    stageA.on('click', function (e) {
      if (e.evt.button !== 0) {
        // 仅仅处理左键
        myThis.cancelDraw()
        return
      }

      // e.target is a clicked Konva.Shape or current stageA if you clicked on empty space
      // console.log('click on', e.target)
      // console.log(
      //   'usual click on ' + JSON.stringify(stageA.getPointerPosition())
      // )
      if (myThis.state === 'create') {
        myThis.beginDraw(stageA.getPointerPosition())
      } else if (myThis.state === 'draw') {
        // 完成绘制
        myThis.completeDraw()
      } else {
        let isCircle = (e.target.getClassName() === 'Circle')
        if (e.target === stageA || !isCircle) {
          tr.detach()
          layerA.draw()
        } else {
          myThis.selectCircle(isCircle, e.target)
        }

        if (myThis.onSelect) {
          myThis.onSelect(isCircle, e.target)
        }
      }
    })

    stageA.on('mousemove', function (e) {
      if (myThis.state === 'draw') {
        myThis.doDraw(stageA.getPointerPosition())
      }
    })

    layerA.draw()
  }

  this.onMount = function () {
    this.createStageB()
    this.createStageA()
  }

  this.cancelDraw = function () {
    if (this.newCreateCircle !== null) {
      this.newCreateCircle.destroy()
      this.newCreateCircle = null

      this.layerA.draw()
    }

    this.state = 'idle'
  }

  this.completeDraw = function () {
    if (this.newCreateCircle === null) {
      console.log('this.newCreateCircle == null, should not call completeDraw')
      return
    }

    this.state = 'create'
    let newC = this.newCreateCircle
    this.selectCircle(true, newC)
    if (this.onSelect) {
      this.onSelect(true, newC)
    }

    this.newCreateCircle = null
    this.integerCircle(newC)
    this.onCreateCircle(newC)
  }

  this.beginDraw = function (pos) {
    console.log('beginDraw, pos:', pos)
    if (this.newCreateCircle !== null) {
      console.log('this.newCreateCircle !== null, should not call beginDraw')
      return
    }

    this.state = 'draw'

    let cfg = {
      x: pos.x,
      y: pos.y,
      radius: 1,
      w: 1
    }

    this.newCreateCircle = this.createCircle(cfg)
    this.layerA.add(this.newCreateCircle)
    this.layerA.draw()
  }

  this.doDraw = function (newPos) {
    if (this.newCreateCircle === null) {
      console.log('this.newCreateCircle == null, should not call doDraw')
      return
    }

    let center = this.newCreateCircle.position()
    let xdist = center.x - newPos.x
    let ydist = center.y - newPos.y

    let dist = Math.sqrt(xdist * xdist + ydist * ydist)
    this.newCreateCircle.radius(dist)
    this.newCreateCircle.dpCfg.radius = dist

    this.layerA.draw()
  }

  this.selectCircle = function (isCircle, c) {
    if (!isCircle) {
      return
    }

    c.moveToTop()
    this.transformer.moveToTop()
    // console.log('e.target radius:', e.target.radius())
    this.transformer.attachTo(c)
    this.layerA.draw()
  }

  this.createTransform = function () {
    // create new transformer
    let tr = new Konva.Transformer({
      anchorStroke: 'red',
      anchorFill: 'yellow',
      anchorSize: 20,
      borderStroke: 'green',
      borderDash: [3, 3],
      rotateEnabled: false,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    })

    return tr
  }

  this.createCircle = function (dpCfg) {
    let c = new Konva.Circle({
      x: dpCfg.x,
      y: dpCfg.y,
      radius: dpCfg.radius,
      draggable: true,
      strokeWidth: 3,
      stroke: 'red',
      strokeScaleEnabled: false // 缩放时不改变边缘
    })

    c.dpCfg = dpCfg
    let myThis = this
    c.on('transformend', () => {
      // 更新半径
      // console.log('transform end')
      let radius = Math.floor(c.radius() * c.scaleX())
      c.radius(radius)
      c.scale({x: 1, y: 1})

      c.dpCfg.radius = radius

      myThis.onContentChanged(c)
    })

    c.on('dragend', function () {
      let pos = c.position()
      pos.x = Math.floor(pos.x)
      pos.y = Math.floor(pos.y)
      c.position(pos)

      c.dpCfg.x = pos.x
      c.dpCfg.y = pos.y

      myThis.onContentChanged(c)
    })

    return c
  }

  this.integerCircle = function (c) {
    let pos = c.position()
    pos.x = Math.floor(pos.x)
    pos.y = Math.floor(pos.y)
    c.position(pos)

    let dpCfg = c.dpCfg
    dpCfg.x = pos.x
    dpCfg.y = pos.y

    let radius = Math.floor(c.radius())
    c.radius(radius)

    dpCfg.radius = radius
  }

  this.idle = function () {
    return this.state === 'idle'
  }

  this.handlerClearAll = function () {
    if (!this.canOperate()) {
      return
    }

    console.log('handlerClearAll')

    this.clearCircleLayer()

    this.onClearAll()
  }

  this.clearCircleLayer = function () {
    this.transformer.detach()

    // get only circles
    let circles = this.layerA.getChildren(function (node) {
      return node.getClassName() === 'Circle'
    })
    for (let c of circles) {
      c.destroy()
    }

    this.layerA.draw()
  }

  this.handlerAdd = function () {
    if (!this.canOperate()) {
      return
    }

    this.state = 'create'
  }

  this.canOperate = function () {
    if (!this.idle()) {
      return false
    }
    if (!this.lvCfg) {
      return false
    }
    if (!this.imageA) {
      return false
    }

    return true
  }

  this.handlerRemove = function () {
    if (!this.canOperate()) {
      return
    }

    let node = this.transformer.node()
    if (node) {
      console.log('handlerRemove')
      this.transformer.detach()
      node.destroy()

      this.layerA.draw()

      this.onRemoveCircle(node)
    }
  }

  this.loadFrom = function (lvCfg) {
    this.loadImages(lvCfg)
    this.loadDiffPoints(lvCfg)
  }

  this.loadImages = function (lvCfg) {
    this.loadImageA(lvCfg)
    this.loadImageB(lvCfg)
  }

  this.loadImageA = function (lvCfg) {
    if (!lvCfg.imagea || lvCfg.imagea === '') {
      return
    }

    // 清理
    if (this.imageA !== null) {
      this.imageA.destroy()
      this.imageA = null
    }

    let imageObjA = new Image()
    imageObjA.onload = () => {
      console.log('image loaded, width:', imageObjA.width, ',height:', imageObjA.height)
      let yoda = new Konva.Image({
        x: 0,
        y: 0,
        image: imageObjA,
        width: imageObjA.width,
        height: imageObjA.height
      })

      this.imageA = yoda

      // add the shape to the layerA
      this.imgLayerOfStageA.add(yoda)
      this.imgLayerOfStageA.draw()

      this.stageA.width(imageObjA.width)
      this.stageA.height(imageObjA.height)
    }
    imageObjA.src = lvCfg.imagea
  }

  this.loadImageB = function (lvCfg) {
    if (!lvCfg.imageb || lvCfg.imageb === '') {
      return
    }

    if (this.imageB !== null) {
      this.imageB.destroy()
      this.imageB = null
    }

    let imageObjB = new Image()
    imageObjB.onload = () => {
      console.log('image loaded, width:', imageObjB.width, ',height:', imageObjB.height)
      let yoda = new Konva.Image({
        x: 0,
        y: 0,
        image: imageObjB,
        width: imageObjB.width,
        height: imageObjB.height
      })

      this.imageB = yoda

      // add the shape to the layerA
      this.imgLayerOfStageB.add(yoda)
      this.imgLayerOfStageB.draw()

      this.stageB.width(imageObjB.width)
      this.stageB.height(imageObjB.height)
    }
    imageObjB.src = lvCfg.imageb
  }

  this.loadDiffPoints = function (lvCfg) {
    this.lvCfg = lvCfg
    // 清理
    this.clearCircleLayer()

    let diffpoints = lvCfg.diffs
    for (let diffp of diffpoints) {
      let c = this.createCircle(diffp)
      this.layerA.add(c)
    }

    this.layerA.draw()
  }
}

export default {
  create (mountElementNameA, mountElementNameB) {
    return new CanvasView(mountElementNameA, mountElementNameB)
  }
}
