
import axios from "axios"
import { backendUrl } from "../config"
import Cookies from 'js-cookie';



export const dotnetAPI = axios.create({
    baseURL : backendUrl
})

dotnetAPI.interceptors.request.use(
    config => {
        const token = Cookies.get("token")


        if(token){
            config.headers = {
                "Authorization" : `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }
        else {
            return Promise.reject("No token found")
        }
        return config
    },
    error => {
        Promise.reject(error)   
    }
)