USE Orbit;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @FromDate date = CONVERT(date, '20261001', 112);
DECLARE @ToDate date = CONVERT(date, '20261231', 112);
DECLARE @People TABLE
(
    EmployeeId int NOT NULL PRIMARY KEY,
    ExpectedFirstName nvarchar(100) NOT NULL,
    ExpectedLastName nvarchar(100) NOT NULL,
    WeeklyOff1 nvarchar(20) NOT NULL,
    WeeklyOff2 nvarchar(20) NOT NULL
);

INSERT INTO @People VALUES
    (5, N'Mohammed', N'Amin', N'Saturday', N'Sunday'),
    (25, N'Ashfaq', N'Shaikh', N'Saturday', N'Sunday'),
    (36, N'Shah Abdur', N'Rahman', N'Saturday', N'Sunday'),
    (3, N'Musharaf', N'Khan', N'Saturday', N'Sunday');

IF
(
    SELECT COUNT(*)
    FROM Orbit.dbo.Employees AS e
    INNER JOIN @People AS p
        ON p.EmployeeId = e.EmployeeId
       AND p.ExpectedFirstName = e.FirstName
       AND p.ExpectedLastName = e.LastName
) <> 4
    THROW 51003, 'The four expected employee records did not match. No shift changes were applied.', 1;

BEGIN TRANSACTION;

IF OBJECT_ID(N'Orbit.dbo.Attendances_Backup_BeforeNightAssignments_20261017', N'U') IS NULL
    SELECT * INTO Orbit.dbo.Attendances_Backup_BeforeNightAssignments_20261017
    FROM Orbit.dbo.Attendances;

UPDATE s
SET
    s.AzureEmployeeId = TRY_CONVERT(int, e.AzureEmployeeId),
    s.EmployeeCode = COALESCE(e.EmployeeCode, N''),
    s.EmployeeName = LTRIM(RTRIM(CONCAT(e.FirstName, N' ', e.LastName))),
    s.Department = COALESCE(e.Department, N''),
    s.Designation = COALESCE(e.Designation, N''),
    s.ShiftName = N'Night',
    s.StartTime = '20:30',
    s.EndTime = '06:00',
    s.EntryBufferMinutes = 0,
    s.ExitBufferMinutes = 0,
    s.FromDate = @FromDate,
    s.ToDate = @ToDate,
    s.Status = N'Active',
    s.WeeklyOff1 = p.WeeklyOff1,
    s.WeeklyOff2 = p.WeeklyOff2,
    s.Remarks = N'Night shift assignment',
    s.UpdatedBy = N'Admin',
    s.UpdatedDate = SYSDATETIME()
FROM Orbit.dbo.Shifts AS s
INNER JOIN @People AS p ON p.EmployeeId = s.EmployeeId
INNER JOIN Orbit.dbo.Employees AS e ON e.EmployeeId = p.EmployeeId
WHERE s.Status = N'Active'
  AND s.FromDate <= @ToDate
  AND s.ToDate >= @FromDate;

INSERT INTO Orbit.dbo.Shifts
(
    EmployeeId, AzureEmployeeId, EmployeeCode, EmployeeName, Department, Designation,
    ShiftName, StartTime, EndTime, EntryBufferMinutes, ExitBufferMinutes, FromDate, ToDate,
    Status, WeeklyOff1, WeeklyOff2, Remarks, CreatedBy, CreatedDate
)
SELECT
    e.EmployeeId, TRY_CONVERT(int, e.AzureEmployeeId), COALESCE(e.EmployeeCode, N''),
    LTRIM(RTRIM(CONCAT(e.FirstName, N' ', e.LastName))), COALESCE(e.Department, N''),
    COALESCE(e.Designation, N''), N'Night', '20:30', '06:00', 0, 0, @FromDate, @ToDate,
    N'Active', p.WeeklyOff1, p.WeeklyOff2, N'Night shift assignment', N'Admin', SYSDATETIME()
FROM @People AS p
INNER JOIN Orbit.dbo.Employees AS e ON e.EmployeeId = p.EmployeeId
WHERE NOT EXISTS
(
    SELECT 1
    FROM Orbit.dbo.Shifts AS s
    WHERE s.EmployeeId = p.EmployeeId
      AND s.Status = N'Active'
      AND s.FromDate <= @ToDate
      AND s.ToDate >= @FromDate
);

UPDATE a
SET a.Shift = N'Night',
    a.UpdatedBy = N'Admin',
    a.UpdatedDate = SYSDATETIME()
FROM Orbit.dbo.Attendances AS a
INNER JOIN @People AS p ON p.EmployeeId = a.EmployeeId
WHERE a.AttendanceDate BETWEEN @FromDate AND @ToDate
  AND a.IsRegularized = 0;

COMMIT TRANSACTION;

SELECT
    e.EmployeeId, e.FirstName, e.LastName, s.ShiftName, s.StartTime, s.EndTime,
    s.FromDate, s.ToDate, s.WeeklyOff1, s.WeeklyOff2, s.Status
FROM Orbit.dbo.Shifts AS s
INNER JOIN @People AS p ON p.EmployeeId = s.EmployeeId
INNER JOIN Orbit.dbo.Employees AS e ON e.EmployeeId = p.EmployeeId
WHERE s.Status = N'Active'
  AND s.FromDate <= @ToDate
  AND s.ToDate >= @FromDate
ORDER BY e.EmployeeId, s.ShiftId;
GO
