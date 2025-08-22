const express = require('express')
const path = require('path')


const app = express()
const public_path = path.join(__dirname, "static")
app.use("/auth/login", express.static(public_path, { index: "index.html" }))
app.get("/", (req, res) => res.redirect("/auth/login"))
app.get("/*splat", (req, res) => res.redirect("/auth/login"))
app.listen(8080, () => console.log(`http server listening on 8080...`))