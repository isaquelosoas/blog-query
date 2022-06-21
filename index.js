import express from "express"
import cors from "cors"
import axios from "axios"

const app = express()
app.use(express.json())
app.use(cors())

const posts = {}

app.get("/posts", (req, res) => {
  res.send(posts)
})

app.post("/events", (req, res) => {
  const { type, data } = req.body
  console.log("Event Received => ", type)

  handleEvent(type, data)

  return res.send({})
})

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data
    posts[id] = { id, title, comments: [] }
  } else if (type === "CommentCreated") {
    const { id, content, postId, status } = data
    posts[postId].comments.push({ id, content, status })
  } else if (type === "CommentUpdated") {
    const { id, content, postId, status } = data

    const post = posts[postId]
    const comment = post.comments.find((comment) => comment.id === id)

    comment.status = status
    comment.content = content
  }
}
app.listen(4002, async () => {
  console.log("Query Service running on port 4002")

  const response = await axios.get("http://event-bus-srv:5000/events")

  for (let event of response.data) {
    console.log("processing event: ", event.type)
    handleEvent(event.type, event.data)
  }
})
