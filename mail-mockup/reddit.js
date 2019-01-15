import axios from "axios"
import moment from "moment"

export const getTopPostsFromSubreddits = subreddits => {
    return Promise.resolve(samplePosts)
}

export const samplePosts = [
    {
        id: 1,
        title:
            "Feds Can't Force You to Unlock your iPhone with finger or face, judge rules",
        url: "#",
        votes: 42365,
        created_at: moment().subtract(5, "days"),
        author: "loremipsum_dolor",
        subreddit: "technology"
    },
    {
        id: 2,
        title: "Lorem ipsum dolor sit amet",
        url: "#",
        votes: 42365,
        created_at: moment().subtract(5, "days"),
        author: "loremipsum_dolor",
        subreddit: "javascript"
    },
    {
        id: 3,
        title: "Lorem ipsum dolor sit amet",
        url: "#",
        votes: 42365,
        created_at: moment().subtract(5, "days"),
        author: "loremipsum_dolor",
        subreddit: "programming"
    },
    {
        id: 4,
        title: "Lorem ipsum dolor sit amet",
        url: "#",
        votes: 42365,
        created_at: moment().subtract(5, "days"),
        author: "loremipsum_dolor",
        subreddit: "technology"
    },
    {
        id: 5,
        title: "Lorem ipsum dolor sit amet",
        url: "#",
        votes: 42365,
        created_at: moment().subtract(5, "days"),
        author: "loremipsum_dolor",
        subreddit: "reactjs"
    }
]
