import axios from "axios";


const API_URL = "http://localhost:5151/api/Employee";


const EmployeeService = {

    getAllEmployees: async () => {

        const response = await axios.get(API_URL);

        return response.data;

    }

};


export default EmployeeService;