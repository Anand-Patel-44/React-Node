const express = require("express")
const mysql = require("mysql2")
const app = express()
app.use(express.json())

const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "3435",
    database: "webapp"
})

function getPost(pool) {
    return new Promise((resolve, reject) => {
        let sql = "select * from posts;"
        pool.query(sql, function (err, result, fields) {
            if (err) reject(err)
            let any = result
            resolve(any)
        })
    })
}
app.get("/posts", (req, res) => {
    getPost(pool).then((data) => res.json(data))
})

function addPost(pool, title, post, username) {
    return new Promise((resolve, reject) => {
        const sql = "insert into posts(title,post,username) values(?,?,?);"
        pool.query(sql, [title, post, username], function (err, result, fields) {
            if (err) reject(err)
            let any = result
            resolve(any)
        })
    })
}
app.post("/posts", (req, res) => {
    const { title, post, username } = req.body
    addPost(pool, title, post, username).then((data) => res.json(data))
})

function getSinglePost(pool, id) {
    return new Promise((resolve, reject) => {
        let sql = "select * from posts where post_id=?;"
        pool.query(sql, [id], function (err, result, fields) {
            if (err) reject(err)
            let any = result
            resolve(any)
        })
    })
}
app.get("/post/:id", (req, res) => {
    const { id } = req.params
    getSinglePost(pool, id).then((data) => res.json(data))
})

function postComments(pool, comment, postId, username) {
    return new Promise((resolve, reject) => {
        let sql = "insert into comments(comment_text,post_id,username) values(?,?,?);"
        pool.query(sql, [comment, postId, username], function (err, result, fields) {
            if (err) reject(err)
            let any = result
            resolve(any)
        })
    })
}
app.post("/post/:id", verifyLogin, (req, res) => {
    const { id } = req.params
    const { comment } = req.body
    const { username } = req.body
    postComments(pool, comment, id, username).then((data) => res.json(data))
})

function getComments(pool, postId) {
    return new Promise((resolve, reject) => {
        let sql = "select * from comments where post_id =?;"
        pool.query(sql, [postId], function (err, result, fields) {
            if (err) reject(err)
            let any = result
            resolve(any)
        })
    })
}
app.get("/post/:id/comments", (req, res) => {
    const { id } = req.params
    getComments(pool, id).then((data) => res.json(data))
})

function createUser(pool, username, userpassword) {
    return new Promise((resolve, reject) => {
        let sql = "insert into users(userName,userPassword) values(?,?);"
        pool.query(sql, [username, userpassword], function (err, result, field) {
            if (err) reject(err)
            let any = result
            resolve(any)
        })
    })
}
app.post('/createuser', (req, res) => {
    const { username, userpassword } = req.body
    createUser(pool, username, userpassword).then((data) => res.json(data))
})

async function checkPassword(pool, username) {
    return new Promise((resolve, reject) => {
        let sql = "select userPassword from users where userName = ?;"
        pool.query(sql, [username], function (err, result, field) {
            if (err) reject(err)
            let any = result
            resolve(any)
        })
    })
}
async function verifyLogin(req, res, next) {
    const accessToken = await req.header("accessToken")
    if (!accessToken) {
        return res.json({ error: "you are not loged in" })
    }
    try {
        if (accessToken === "string") {
            return next()
        }
    } catch (err) {
        return res.json({ error: err })
    }
}
app.post('/login', (req, res) => {
    const { username, userpassword } = req.body
    checkPassword(pool, username).then((data) => {
        if (userpassword == data[0].userPassword) {
            let str = "string"
            res.json({ token: str })
        }
        else {
            res.json({ error: "wrong password or username" })
        }
    })
})
app.listen(5000, () => {
    console.log("the srver has been hit")
})
