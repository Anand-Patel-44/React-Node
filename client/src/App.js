import './App.css';
import React, { useState,createContext,useContext ,useEffect } from "react"

import {
  Route, createBrowserRouter, createRoutesFromElements, RouterProvider, useLoaderData, Outlet, Await, Link, Form, useNavigate, defer,
  redirect
} from "react-router-dom"

const Any = createContext()
const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={<Home />}>
    <Route path="posts" element={<Post />} loader={postLoader} />
    <Route path="create" element={<PostForm />} action={formAction} />
    <Route path="post/:id" element={<SinglePost />} loader={singlePostLoader} action={CreateComment} />
    <Route path="login" element={<Login />} action={loginAction} />
    <Route path="regestration" element={<Regestration />} action={registerAction} />
  </Route>
  
))

function App() {
  const [ctx,setCtx] = useState(false)
  return ( 
    <Any.Provider value={{ctx,setCtx}}>
    <RouterProvider router={router} />
    </Any.Provider>
  )
}

function Home() {
  const {ctx} = useContext(Any)
  const {setCtx} = useContext(Any)
  return (
    <>
      <Link to="/create">Create a post</Link><br />
      <Link to="/posts">Posts</Link><br />
      {ctx?(
        <><button onClick={()=>{
          sessionStorage.removeItem("username")
          sessionStorage.removeItem("key")
          setCtx(false)
        }}>Logout</button></>
      ):(
        <><Link to="/Login">Login</Link><br />
        <Link to="regestration">regestration</Link>
        </>
      )}
      <Outlet />
    </>
  )
}

async function postLoader() {
  const response = await fetch("/posts")
  const postData = await response.json()
  return postData
}
function Post() {
  const post = useLoaderData()
  const navigate = useNavigate()
  return (
    <>
      <React.Suspense fallback={<h2>Loading...</h2>}>
        <Await resolve={post}>
          {(variable) => {
            return (
              <>
                {variable.map((item, key) => {
                  return (
                    <div className="parent" key={key} loading="lazy" onClick={() => navigate(`/post/${item.post_id}`)}>
                      <div className="main">
                        <div className="title">{item.title}</div>
                        <div className="post">{item.post}</div>
                        <div className="user">{item.username}</div>
                      </div>
                    </div>
                  )
                })}
              </>
            )
          }}
        </Await>
      </React.Suspense>
    </>
  )
}

async function formAction({ request }) {
  const data = await request.formData()
  const sendData = {
    title: data.get("title"),
    post: data.get("post"),
    username: data.get("username")
  }
  const response = await fetch("/posts", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(sendData)
  })
  const ans = await response.json()
  return redirect("/posts")
}
function PostForm() {
  let username = sessionStorage.getItem("username")
  return (
    <>
      <div>
        <Form method="post" action={formAction} className='Form'>
          <div className="form">
            <h3>Title</h3>
            <input type="text" name="title" required placeholder='Title' />
            <h3>Post</h3>
            <input type="text" name="post" required placeholder='Post' />
            <h3>Your Username</h3>
            <input type="text" name="username" required placeholder='Username' value={username} /><br />
            <button type="submit">Submit</button>
          </div>
        </Form>
      </div>
    </>
  )
}

async function singlePostLoader({ request }) {
  const url = new URL(request.url)
  const path = url.pathname
  const response = await fetch(path)
  const answer = await response.json()
  const comments = await fetch(`${path}/comments`)
  const comment = await comments.json()
  const ans = [answer, comment]
  return defer({ post: ans })
}
function SinglePost() {
  const loaderData = useLoaderData()
  return (
    <>
      <React.Suspense fallback={<h3>Loading...</h3>}>
        <Await resolve={loaderData.post}>
          {(variable) => {
            const arr = variable[1]
            return (
              <>
                <div className='postBox'>
                  <div className="box">
                    <div className="title">{variable[0][0].title}</div>
                    <div className="post">{variable[0][0].post}</div>
                    <div className="user">{variable[0][0].username}</div>
                  </div>
                  <div className="commentBox">
                    <CommentFOrm />
                    {arr.map((item) => {
                      return (
                        <Comment comment={item.comment_text} username={item.username} />
                      )
                    })}
                  </div>
                </div>
              </>
            )
          }}
        </Await>
      </React.Suspense>
    </>
  )
}

function Comment({ comment, username }) {
  return (
    <>
      <div className='comment'>
        <div>username: {username}</div>
        <div>{comment}</div>
      </div>
    </>
  )
}
async function CreateComment({ request }) {
  const url = new URL(request.url)
  const path = url.pathname
  const data = await request.formData()
  const send = {
    comment: data.get("comment"),
    username: sessionStorage.getItem("username")
  }
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "accessToken": sessionStorage.getItem("key")
    },
    body: JSON.stringify(send)
  })
  const ans = await response.json()
  return ans
}
function CommentFOrm() {
  return (
    <>
      <Form method='post' action={CreateComment}>
        <input type="text" name="comment" required placeholder='Enter Comment' />
        <button type="submit">Submit</button>
      </Form>
    </>
  )
}

async function registerAction({ request }) {
  const data = await request.formData()
  const send = {
    username: data.get("userName"),
    userpassword: data.get("password")
  }
  const response = await fetch('/createuser', {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(send)
  })
  const ans = await response.json()
  return ans
}
function Regestration() {
  return (
    <>
      <h2>Regrestration</h2>
      <Form method="post" action={registerAction}>
        User Name:
        <input type="text" name="userName" placeholder='User Name' /><br />
        Password:
        <input type="password" name="password" placeholder='Password' />
        <button type="submit">Submit</button>
      </Form>
    </>
  )
}

async function loginAction({ request }) {
  const data = await request.formData()
  const send = {
    username: data.get("userName"),
    userpassword: data.get("password")
  }
  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(send)
  })
  const ans = await response.json()
  if (ans.error) {
    alert(ans.error)
    return null
  }
  else {
    sessionStorage.setItem("key", ans.token)
    sessionStorage.setItem("username", data.get("userName"))
    return redirect("/posts")
  }
}
function Login() {
  const {setCtx} = useContext(Any) 
  return (
    <>
      <h2>Login</h2>
      <Form method="post" action={loginAction}>
        User Name:
        <input type="text" name="userName" placeholder='User Name' /><br />
        Password:
        <input type="password" name="password" placeholder='password' />
        <button type="submit" onClick={()=>setCtx(true)}>Submit</button>
      </Form>
    </>
  )
}
export default App;