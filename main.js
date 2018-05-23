const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const uuid = require('uuid/v4')
const execSync = require('child_process').execSync

// =====================================
// 初期設定
// =====================================

const app = express()

// POSTデータを扱うためのミドルウェアを登録
app.use(bodyParser.urlencoded({ extended: true }))
// クッキーを扱うためのミドルウェアを登録
app.use(cookieParser())
// 静的ファイルの配置場所はpublicディレクトリ
app.use(express.static('public'))
// テンプレートエンジンにはEJSを使用する
app.set('view engine', 'ejs')

// クッキーに使うキー名
const SESSID_COOKIE_KEYNAME = 'LEARNING_HTTP_SESSID'

// =====================================
// ルーティング
// =====================================

/**
 * GETリクエスト受信時
 */
app.get('/', (req, res) => {
  let name = null

  // Cookieが存在するか
  console.log(req.headers.cookie)
  const regex = new RegExp(`${SESSID_COOKIE_KEYNAME}=([^;]+)`)
  const match = regex.exec(req.headers.cookie)
  const sessionId = match ? match[1] : null
  if (sessionId && fs.existsSync(`./session/${sessionId}.txt`)) {
    // セッションファイルの内容を読み取る
    name = fs.readFileSync(`./session/${sessionId}.txt`, 'utf8')
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.render('index', { name })
})

/**
 * POSTリクエスト受信時
 */
app.post('/', (req, res) => {
  // 送信されたフォームの内容を取り出す
  const name = req.body.name

  // セッションに保存する
  const sessionId = uuid()
  fs.writeFileSync(`./session/${sessionId}.txt`, name)

  // Cookieをセット
  res.setHeader('Set-Cookie', [
    `${SESSID_COOKIE_KEYNAME}=${sessionId}; Path=/; Max-Age=180; HttpOnly`,
    `foo=bar; Path=/; Max-Age=180; HttpOnly`
  ])

  // トップ画面にリダイレクト
  res.statusCode = 303
  res.setHeader('Location', '/')
  res.end()
})

/**
 * ログアウト
 */
app.post('/logout', (req, res) => {
  // Cookieが存在するか
  const regex = new RegExp(`${SESSID_COOKIE_KEYNAME}=([^;]+)`)
  const match = regex.exec(req.headers.cookie)
  const sessionId = match ? match[1] : null
  if (sessionId && fs.existsSync(`./session/${sessionId}.txt`)) {
    // セッションファイルを削除する
    fs.unlinkSync(`./session/${sessionId}.txt`)
  }

  // Cookieをセット
  // Max-Ageをゼロに設定することで削除される
  res.setHeader('Set-Cookie', [
    `${SESSID_COOKIE_KEYNAME}=${sessionId}; Path=/; Max-Age=0; HttpOnly`
  ])

  // トップ画面にリダイレクト
  res.statusCode = 303
  res.setHeader('Location', '/')
  res.end()
})

// =====================================
// 起動
// =====================================

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`App started at port ${port}`)
})
