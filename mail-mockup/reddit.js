import axios from "axios"

export const getTopPostsFromSubreddits = () => {
    return axios("http://localhost:8888/digest").then(res => res.data)
}
