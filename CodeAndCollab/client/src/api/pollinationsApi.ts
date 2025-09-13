import axios, { AxiosInstance } from "axios"

<<<<<<< HEAD
const pollinationsBaseUrl = "https://text.pollinations.ai"
=======
const pollinationsBaseUrl = "https://text.pollinations.ai/"
>>>>>>> cedbe5bee67dbbf6dffabe172ebbdb620bb1020d

const instance: AxiosInstance = axios.create({
    baseURL: pollinationsBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
})

export default instance