import React, { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import moment from "moment"
import { andify } from "./utils"
import { getTopPostsFromSubreddits } from "./reddit"

const subreddits = ["technology", "javascript", "programming", "reactjs"]

const App = () => {
    const [posts, setPosts] = useState([])

    useEffect(() => {
        getTopPostsFromSubreddits(subreddits).then(posts => {
            setPosts(posts)
        })
    }, [])

    return (
        <div className="wrapper">
            <header>
                <h1>Reddit Digest</h1>
                <h2>
                    Last week in{" "}
                    {andify(subreddits, sr => (
                        <code>/r/{sr}</code>
                    ))}
                </h2>
            </header>
            <ul>
                {posts.map(post => (
                    <li key={post.id} className="item">
                        <div className="item__subredditmeta">
                            <span className="item__votes">
                                {post.votes} upvotes
                            </span>
                            <span className="item__badge">
                                /r/{post.subreddit}
                            </span>
                        </div>
                        <h3 className="item__title">
                            <a href={post.url}>{post.title}</a>
                        </h3>
                        <div className="item__meta">
                            <span className="item__date">
                                {moment().diff(post.created_at, "days")} days
                                ago
                            </span>
                            <a className="item__author" href="#">
                                /u/{post.author}
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
            <footer>
                <a href="#">Edit this digest</a>
            </footer>
        </div>
    )
}

ReactDOM.render(<App />, document.querySelector("#__react-root"))
