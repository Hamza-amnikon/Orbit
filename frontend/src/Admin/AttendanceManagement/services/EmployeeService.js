import axios from "axios";


const API_URL = `${import.meta.env.VITE_EMPLOYEE_API_BASE_URL}/api/Employee`;


const EmployeeService = {

    getAllEmployees: async () => {

        const response = await axios.get(API_URL);

        return response.data;

    }

};


export default EmployeeService;