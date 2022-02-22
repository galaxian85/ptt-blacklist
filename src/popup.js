const textArea = document.querySelector('.blacklist')

chrome.storage.sync.get(['blacklist'], ({ blacklist }) => {
  if (blacklist) {
    textArea.value = JSON.parse(blacklist).join('\n')
  }
})

document.querySelector('.save').addEventListener('click', () => {
  const idArray = textArea.value.split('\n').map(str => str.trim()).filter(str => str.length !== 0)
  const blacklist = JSON.stringify(idArray)
  chrome.storage.sync.set({ blacklist: blacklist })

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'save' });
  })
})