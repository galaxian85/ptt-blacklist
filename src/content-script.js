const blockedList = new Set()

const refreshList = () => {
  chrome.storage.sync.get(['blacklist'], ({ blacklist }) => {
    if (blacklist) {
      const parsed = JSON.parse(blacklist)
      if (Array.isArray(parsed)) {
        blockedList.clear()
        parsed.forEach(id => {
          blockedList.add(id)
        })
      }
    }
  })
}

const main = () => {
  const mainContainer = document.getElementById('mainContainer')
  if (!mainContainer) {
    return setTimeout(main, 100)
  }

  const rows = Array.from(mainContainer.children)

  const getViewMode = () => {
    const row2text = rows[2].textContent
    if (row2text.substring(13, 17) === '作  者') {
      return 'board'
    }

    const row0text = rows[0].textContent
    const row23text = rows[23].textContent
    if (row0text.substring(1, 3) === '作者' || row23text.substring(2, 4) === '瀏覽') {
      return 'article'
    }

    return 'other'
  }

  const hideBlocker = (rowNumber) => {
    const blocker = mainContainer.querySelector(`.blocker-${rowNumber}`)
    blocker.className = `blockers blocker-${rowNumber} hide`
    blocker.textContent = ''
  }

  const getBlockedId = (rowText, rowNumber, viewMode) => {
    if (viewMode === 'board' && (rowNumber > 2 || rowNumber < 23)) {
      const [begin, end] = rowText.charAt(0) === '●' ? [16, 28] : [17, 29]
      let id = rowText.substring(begin, end).trim()
      return blockedList.has(id) ? id : ''
    } else if (viewMode === 'article') {
      const firstChar = rowText.charAt(0)
      if (firstChar !== '推' && firstChar !== '噓' && firstChar !== '→') return ''

      const id = rowText.substring(2, rowText.indexOf(':'))
      return blockedList.has(id) ? id : ''
    }
  }

  const listener = (e) => {
    const rowElement = e.currentTarget
    if (!rowElement) return

    const rowNumber = rowElement.getAttribute('srow')
    const viewMode = getViewMode()
    if (viewMode === 'other') {
      return hideBlocker(rowNumber)
    }

    const rowText = rowElement.textContent
    const blockedId = getBlockedId(rowText, rowNumber, viewMode)

    if (blockedId) {
      const blocker = mainContainer.querySelector(`.blocker-${rowNumber}`)
      if (!blocker) return

      blocker.textContent = `    【 🚫 黑名單 id: ${blockedId} 】`
      blocker.className = `blockers blocker-${rowNumber}`

      const rect = rowElement.getBoundingClientRect()
      blocker.setAttribute('style', `top: ${rect.top}px; width: ${rect.width}px;`)
    } else {
      hideBlocker(rowNumber)
    }
  }

  rows.forEach(row => {
    row.addEventListener('DOMSubtreeModified', listener)
    const blocker = document.createElement('span')
    blocker.className = `blockers blocker-${row.getAttribute('srow')} hide`
    mainContainer.appendChild(blocker)
  })
}

chrome.runtime.onMessage.addListener(() => {
  refreshList()
})

refreshList()
main()
