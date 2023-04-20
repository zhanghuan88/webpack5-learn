document.addEventListener("click", () => {
    import("./title").then(res => {
        console.log(res)
    })
})
