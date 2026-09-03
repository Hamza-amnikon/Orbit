import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const data = [
    { month: "Jan", present: 92 },
    { month: "Feb", present: 95 },
    { month: "Mar", present: 88 },
    { month: "Apr", present: 97 },
    { month: "May", present: 91 },
    { month: "Jun", present: 96 },
    { month: "Jul", present: 98 }
];

export default function AttendanceChart() {
    return (
        <ResponsiveContainer width="100%" height={320}>

            <AreaChart data={data}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Area
                    type="monotone"
                    dataKey="present"
                    stroke="#2563EB"
                    fill="#BFDBFE"
                />

            </AreaChart>

        </ResponsiveContainer>
    );
}