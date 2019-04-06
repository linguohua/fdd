import { shell, dialog } from 'electron'
let mainWindow
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open folder',
        click: () => {
          let path = dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory ', 'promptToCreate'] })
          if (path) {
            mainWindow.webContents.send('openFolder', path)
          }
        }
      },
      {
        label: 'Open recent'
      },
      {
        role: 'quit'
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'pasteandmatchstyle'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        role: 'reload'
      },
      {
        role: 'forcereload'
      },
      {
        role: 'toggledevtools'
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () {
          shell.openExternal('https://electronjs.org')
        }
      },
      {
        label: 'Documentation',
        click () {
          shell.openExternal(
            `https://github.com/electron/electron/tree/v${process.versions.electron}/docs#readme`
          )
        }
      },
      {
        label: 'Community Discussions',
        click () {
          shell.openExternal('https://discuss.atom.io/c/electron')
        }
      },
      {
        label: 'Search Issues',
        click () {
          shell.openExternal('https://github.com/electron/electron/issues')
        }
      }
    ]
  }
]

export default {
  menu: template,
  setMainWindow: (win) => {
    mainWindow = win
  }
}
