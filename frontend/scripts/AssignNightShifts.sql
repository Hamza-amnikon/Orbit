SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @FromDate date = CONVERT(date, '20261001', 112);
DECLARE @ToDate date = CONVERT(date, '20261130', 112);
DECLARE @People TABLE
(
    EmployeeId int NOT NULL PRIMARY KEY,
    ExpectedFirstName nvarchar(100) NOT NULL,
    ExpectedLastName nvarchar(100) NOT NULL,
    WeeklyOff1 nvarchar(20) NOT NULL,
    WeeklyOff2 nvarchar(20) NOT NULL
);
INSERT INTO @People VALUES
    (16,N'Ibrahim',N'Shaikh',N'Saturday',N'Sunday'),
    (35,N'Muhammed',N'Ansar',N'Saturday',N'Sunday'),
    (31,N'Ubaidullah Abdul',N'Wahab',N'Tuesday',N'Wednesday'),
    (27,N'Fazlur',N'Rahman',N'Saturday',N'Sunday'),
    (8,N'Mohammed',N'Asfaq',N'Thursday',N'Friday');

IF (SELECT COUNT(*) FROM Orbit.dbo.Employees e JOIN @People p
    ON e.EmployeeId=p.EmployeeId AND e.FirstName=p.ExpectedFirstName AND e.LastName=p.ExpectedLastName) <> 5
    THROW 51001, 'Expected employee records did not match. No shift changes were applied.', 1;

BEGIN TRANSACTION;

UPDATE s
SET s.AzureEmployeeId=TRY_CONVERT(int,e.AzureEmployeeId),
    s.EmployeeCode=COALESCE(e.EmployeeCode,N''),
    s.EmployeeName=LTRIM(RTRIM(CONCAT(e.FirstName,N' ',e.LastName))),
    s.Department=COALESCE(e.Department,N''),
    s.Designation=COALESCE(e.Designation,N''),
    s.ShiftName=N'Night',
    s.StartTime='20:30',
    s.EndTime='06:00',
    s.EntryBufferMinutes=0,
    s.ExitBufferMinutes=0,
    s.FromDate=@FromDate,
    s.ToDate=@ToDate,
    s.Status=N'Active',
    s.WeeklyOff1=p.WeeklyOff1,
    s.WeeklyOff2=p.WeeklyOff2,
    s.Remarks=N'Night shift assignment',
    s.UpdatedBy=N'Admin',
    s.UpdatedDate=SYSDATETIME()
FROM Orbit.dbo.Shifts s
JOIN @People p ON p.EmployeeId=s.EmployeeId
JOIN Orbit.dbo.Employees e ON e.EmployeeId=p.EmployeeId
WHERE s.Status=N'Active' AND s.FromDate<=@ToDate AND s.ToDate>=@FromDate;

INSERT INTO Orbit.dbo.Shifts
(
    EmployeeId,AzureEmployeeId,EmployeeCode,EmployeeName,Department,Designation,
    ShiftName,StartTime,EndTime,EntryBufferMinutes,ExitBufferMinutes,FromDate,ToDate,
    Status,WeeklyOff1,WeeklyOff2,Remarks,CreatedBy,CreatedDate
)
SELECT e.EmployeeId,TRY_CONVERT(int,e.AzureEmployeeId),COALESCE(e.EmployeeCode,N''),
    LTRIM(RTRIM(CONCAT(e.FirstName,N' ',e.LastName))),COALESCE(e.Department,N''),
    COALESCE(e.Designation,N''),N'Night','20:30','06:00',0,0,@FromDate,@ToDate,
    N'Active',p.WeeklyOff1,p.WeeklyOff2,N'Night shift assignment',N'Admin',SYSDATETIME()
FROM @People p
JOIN Orbit.dbo.Employees e ON e.EmployeeId=p.EmployeeId
WHERE NOT EXISTS
(
    SELECT 1 FROM Orbit.dbo.Shifts s
    WHERE s.EmployeeId=p.EmployeeId AND s.Status=N'Active'
      AND s.FromDate<=@ToDate AND s.ToDate>=@FromDate
);

UPDATE a
SET a.Shift=N'Night',a.UpdatedBy=N'Admin',a.UpdatedDate=SYSDATETIME()
FROM Orbit.dbo.Attendances a JOIN @People p ON p.EmployeeId=a.EmployeeId
WHERE a.AttendanceDate BETWEEN @FromDate AND @ToDate AND a.IsRegularized=0;

COMMIT TRANSACTION;

EXEC msdb.dbo.sp_add_jobstep
    @job_name=N'Orbit AccessVault Employee and Attendance Sync',
    @step_name=N'Apply assigned shift names',
    @subsystem=N'TSQL',
    @database_name=N'Orbit',
    @command=N'UPDATE a
SET a.Shift=s.ShiftName,
    a.UpdatedBy=N''AccessVaultSync'',
    a.UpdatedDate=SYSDATETIME()
FROM Orbit.dbo.Attendances AS a
CROSS APPLY
(
    SELECT TOP (1) sh.ShiftName
    FROM Orbit.dbo.Shifts AS sh
    WHERE sh.EmployeeId=a.EmployeeId
      AND sh.Status=N''Active''
      AND a.AttendanceDate BETWEEN sh.FromDate AND sh.ToDate
    ORDER BY sh.FromDate DESC, sh.ShiftId DESC
) AS s
WHERE a.IsRegularized=0;',
    @on_success_action=1,
    @on_fail_action=2;

EXEC msdb.dbo.sp_update_jobstep
    @job_name=N'Orbit AccessVault Employee and Attendance Sync',
    @step_id=1,
    @on_success_action=3,
    @on_success_step_id=2;

