#! /usr/bin/env node

const axios = require("axios")
const prompts = require("prompts")
const _ = require("lodash/fp")

const subreddits = [
    "technology",
    "reactjs"
    // "css",
    // "javascript",
    // "globaloffensive"
]

const main = async () => {
    // const answers = await prompts({
    //   message: 'What subreddits should be included',
    //   name: 'subreddits',
    //   type: 'multiselect',
    //   choices: subreddits.map(sr => ({
    //     title: sr,
    //     value: sr
    //   }))
    // })
    const answers = { subreddits }

    const responses = await Promise.all(
        answers.subreddits.map(sr => {
            const url = `https://www.reddit.com/r/${sr}/top.json`

            return axios(url)
        })
    )

    // Pick the three first post from each.
    const data = responses.map(response =>
        response.data.data.children.map(
            _.pipe(
                _.get("data"),
                _.pick(["url", "ups", "downs"])
            )
        )
    )

    console.log(data)
}

main()
