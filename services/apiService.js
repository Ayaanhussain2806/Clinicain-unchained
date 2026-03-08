import axios from "axios";

const API = axios.create({
baseURL:"http://localhost:5000/api"
});

export const submitPrescription = async (data)=>{

const response = await API.post("/check-prescription",data);

return response.data;

};