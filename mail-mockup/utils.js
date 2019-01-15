import React from "react"

export const andify = (list, render) =>
    list.map((item, index) => {
        return (
            <React.Fragment key={item}>
                {index ? (index < list.length - 1 ? ", " : " and ") : ""}
                {render(item)}
            </React.Fragment>
        )
    })
