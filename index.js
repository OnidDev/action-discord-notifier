const axios = require('axios')

const core = require('@actions/core')
const github = require('@actions/github')

const webhook = core.getInput('webhook')

if (!/https:\/\/discord(app|)\.com\/api\/webhooks\/\d+?\/.+/i.exec(webhook)) {
  core.setFailed('The given discord webhook url is invalid. Please ensure you give a **full** url that start with "https://discordapp.com/api/webhooks"')
}

const shortSha = (i) => i.substr(0, 6)

const escapeMd = (str) => str.replace(/([\[\]\\`\(\)])/g, '\\$1')

const { payload: githubPayload } = github.context

const commits = githubPayload.commits.map(i => ` - ${escapeMd(i.message)}`)
console.log(githubPayload)

const authorname = githubPayload.sender.login
const authorimage = githubPayload.sender.avatar_url

if (!commits.length) {
  return
}
console.log(githubPayload)
const beforeSha = githubPayload.before
const afterSha = githubPayload.after

const payload = {
  content: '',
  embeds: [
    {
      author: {
        name: authorname,
        icon_url: authorimage,
      },
      title: core.getInput('message-title') || 'Commits received',
      description: `**\n${commits.join('\n')}**`
    }
  ]
}

axios
  .post(webhook, payload)
  .then((res) => {
    core.setOutput('result', 'Webhook sent')
  })
  .catch((err) => {
    core.setFailed(`Post to webhook failed, ${err}`)
  })
