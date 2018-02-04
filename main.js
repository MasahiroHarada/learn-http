const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const uuid = require('uuid/v4')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('public'))
app.set('view engine', 'ejs')

const SESSID_COOKIE_KEYNAME = 'LEARNING_HTTP_SESSID'

app.get('/', (req, res) => {
  let name = null

  // Cookieが存在するか
  const sessionId = req.cookies[SESSID_COOKIE_KEYNAME]
  if (sessionId && fs.existsSync(`./session/${sessionId}`)) {
    name = fs.readFileSync(`./session/${sessionId}`, 'utf8')
  }

  res.render('index', { name })
})

app.post('/', (req, res) => {
  // 送信されたフォームの内容を取り出す
  const name = req.body.name

  // セッションに保存する
  const sessionId = uuid()
  fs.writeFileSync(`./session/${sessionId}`, name)

  // Cookieをセット
  const hourInMilliseconds = 60 * 60 * 1000 // 1時間のミリ秒数
  res.cookie(SESSID_COOKIE_KEYNAME, sessionId, { maxAge: hourInMilliseconds })

  // トップ画面にリダイレクト
  res.redirect('/')
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`App started at port ${port}`)
})
