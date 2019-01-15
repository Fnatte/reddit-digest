import React from "react"
import ReactDOM from "react-dom"

const posts = [
    {
        id: 1,
        title: "Lorem ipsum dolor sit amet",
        url: "#",
        votes: 42365,
        created_at: "2019-01-10 15:21",
        author: "loremipsum_dolor"
    },
    {
        id: 2,
        title: "Lorem ipsum dolor sit amet",
        url: "#",
        votes: 42365,
        created_at: "2019-01-10 15:21",
        author: "loremipsum_dolor"
    },
    {
        id: 3,
        title: "Lorem ipsum dolor sit amet",
        url: "#",
        votes: 42365,
        created_at: "2019-01-10 15:21",
        author: "loremipsum_dolor"
    },
    {
        id: 4,
        title: "Lorem ipsum dolor sit amet",
        url: "#",
        votes: 42365,
        created_at: "2019-01-10 15:21",
        author: "loremipsum_dolor"
    },
    {
        id: 5,
        title: "Lorem ipsum dolor sit amet",
        url: "#",
        votes: 42365,
        created_at: "2019-01-10 15:21",
        author: "loremipsum_dolor"
    }
]

const App = () => {
    return (
        <div className="wrapper">
            <header>
                <h1>Reddit Digest</h1>
                <h2>
                    Last week in <code>/r/technology</code> ,
                    <code>/r/programming</code> , <code>/r/javascript</code> and
                    <code>/r/reactjs</code>
                </h2>
            </header>
            <ul>
                {posts.map(post => (
                    <li key={post.id} className="item">
                        <span className="item__votes">
                            {post.votes} upvotes
                        </span>
                        <h3 className="item__title">
                            <a href={post.url}>{post.title}</a>
                        </h3>
                        <div className="item__meta">
                            <span className="item__date">
                                Posted {post.created_at}
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
