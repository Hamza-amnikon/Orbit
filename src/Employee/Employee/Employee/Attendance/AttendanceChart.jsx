import "./AttendanceChart.css";

import { useMemo, useState } from "react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell
} from "recharts";

import {
    FormControl,
    Select,
    MenuItem
} from "@mui/material";

function AttendanceChart() {

    const today = new Date();

    const [month, setMonth] = useState(today.getMonth());

    const year = today.getFullYear();

    const months = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    const chartData = useMemo(() => {

        const totalDays = new Date(year, month + 1, 0).getDate();

        return Array.from({ length: totalDays }, (_, index) => {

            const date = new Date(year, month, index + 1);

            const day = date.getDay();

            if(day===0 || day===6){

                return{

                    day:index+1,

                    hours:0,

                    status:"Weekend"

                };

            }

            const random=Math.random();

            if(random<0.08){

                return{

                    day:index+1,

                    hours:0,

                    status:"Leave"

                };

            }

            if(random<0.12){

                return{

                    day:index+1,

                    hours:0,

                    status:"Absent"

                };

            }

            return{

                day:index+1,

                hours:7+Math.random()*2,

                status:"Present"

            };

        });

    },[month]);

    return(

        <div className="attendance-card">

            <div className="attendance-header">

                <div>

                    <h2>Attendance Overview</h2>

                    <p>Monthly Working Hours</p>

                </div>

                <FormControl size="small">

                    <Select
                        value={month}
                        onChange={(e)=>setMonth(e.target.value)}
                    >

                        {months.map((m,index)=>

                            <MenuItem
                                key={index}
                                value={index}
                            >

                                {m}

                            </MenuItem>

                        )}

                    </Select>

                </FormControl>

            </div>

            <div className="chart">

                <ResponsiveContainer>

                    <BarChart
    data={chartData}
    margin={{
        top: 20,
        right: 20,
        left: 0,
        bottom: 50
    }}
>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />

<XAxis
    dataKey="day"
    interval={0}
    height={85}
    tickMargin={15}
    tick={({ x, y, payload }) => {

        const date = new Date(year, month, payload.value);

        const weekday = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        return (

            <g transform={`translate(${x},${y})`}>

                <text
                    transform="rotate(-30)"
                    textAnchor="end"
                    x={0}
                    y={10}
                    fill="#94a3b8"
                    fontSize={10}
                    fontWeight="600"
                >
                    {weekday}
                </text>

                <text
                    transform="rotate(-30)"
                    textAnchor="end"
                    x={0}
                    y={24}
                    fill="#1e293b"
                    fontSize={11}
                    fontWeight="700"
                >
                    {payload.value}
                </text>

            </g>

        );

    }}
/>

                        <YAxis
                            domain={[0,10]}
                        />

                        <Tooltip
    cursor={{
        fill: "rgba(37,99,235,.08)"
    }}
    contentStyle={{
        borderRadius: "12px",
        border: "none",
        boxShadow: "0 10px 30px rgba(0,0,0,.15)"
    }}
/>

                    <Bar
    dataKey="hours"
    radius={[10,10,0,0]}
    barSize={26}
    animationDuration={900}
>

                            {

                                chartData.map((entry,index)=>{

                                    let color="#22c55e";

                                    if(entry.status==="Absent")
                                        color="#ef4444";

                                    if(entry.status==="Leave")
                                        color="transparent";

                                    if(entry.status==="Weekend")
                                        color="transparent";

                                    return(

                                        <Cell
                                            key={index}
                                            fill={color}
                                        />

                                    );

                                })

                            }

                        </Bar>

                    </BarChart>

                </ResponsiveContainer>

            </div>

            <div className="attendance-summary">

                <div className="present">

                    <h3>20</h3>

                    <span>Present</span>

                </div>

                <div className="absent">

                    <h3>2</h3>

                    <span>Absent</span>

                </div>

                <div className="leave">

                    <h3>3</h3>

                    <span>Leave</span>

                </div>

                <div className="weekend">

                    <h3>8</h3>

                    <span>Weekend</span>

                </div>

            </div>

        </div>

    );

}

export default AttendanceChart;