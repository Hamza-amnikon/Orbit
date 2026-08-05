import "./AttendanceTable.css";

export default function StatusChip({ status }) {

    const getClass = () => {

        switch (status) {

            case "Present":
                return "status present";

            case "Late":
                return "status late";

            case "Leave":
                return "status leave";

            case "Absent":
                return "status absent";

            default:
                return "status";
        }

    };

    return (
        <span className={getClass()}>
            {status}
        </span>
    );

}