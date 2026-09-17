import axios from "axios";


const API_URL = "https://sparkapi.amnikontechnologies.com:7002/api/Employee";


const EmployeeService = {

    getAllEmployees: async () => {

        const response = await axios.get(API_URL);

        return response.data;

    }

};


export default EmployeeService;