import axios from "axios";


const API_URL = "https://localhost:7002/api/Employee";


const EmployeeService = {

    getAllEmployees: async () => {

        const response = await axios.get(API_URL);

        return response.data;

    }

};


export default EmployeeService;