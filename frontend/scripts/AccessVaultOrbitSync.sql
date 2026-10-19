USE [msdb];
GO

DECLARE @JobId uniqueidentifier;

EXEC dbo.sp_add_job
    @job_name = N'Orbit AccessVault Employee and Attendance Sync',
    @enabled = 1,
    @description = N'Updates existing Orbit employees and rebuilds shift-aware attendance from Accessvault, including overnight shifts and overtime.',
    @start_step_id = 1,
    @job_id = @JobId OUTPUT;

EXEC dbo.sp_add_jobstep
    @job_id = @JobId,
    @step_name = N'Sync employees and daily attendance',
    @subsystem = N'TSQL',
    @database_name = N'master',
    @command = N'SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @EmployeeRows int = 0;
DECLARE @AttendanceDeleted int = 0;
DECLARE @AttendanceInserted int = 0;
DECLARE @RunAt datetime2(0) = SYSDATETIME();

BEGIN TRY
    BEGIN TRANSACTION;

    UPDATE e
    SET
        e.FirstName = COALESCE(NULLIF(LTRIM(RTRIM(p.name)), N''''), e.FirstName),
        e.LastName = COALESCE(NULLIF(LTRIM(RTRIM(p.last_name)), N''''), e.LastName),
        e.Email = COALESCE(NULLIF(LTRIM(RTRIM(p.email)), N''''), e.Email),
        e.Mobile = COALESCE(NULLIF(LTRIM(RTRIM(p.mobile_phone)), N''''), e.Mobile),
        e.Gender = COALESCE(NULLIF(LTRIM(RTRIM(p.gender)), N''''), e.Gender),
        e.JoiningDate = COALESCE(p.hire_date, e.JoiningDate)
    FROM Orbit.dbo.Employees AS e
    INNER JOIN Accessvault.dbo.pers_person AS p
        ON LTRIM(RTRIM(e.AzureEmployeeId)) = LTRIM(RTRIM(p.pin))
    WHERE
        (NULLIF(LTRIM(RTRIM(p.name)), N'''') IS NOT NULL
            AND ISNULL(e.FirstName, N'''') <> NULLIF(LTRIM(RTRIM(p.name)), N''''))
        OR (NULLIF(LTRIM(RTRIM(p.last_name)), N'''') IS NOT NULL
            AND ISNULL(e.LastName, N'''') <> NULLIF(LTRIM(RTRIM(p.last_name)), N''''))
        OR (NULLIF(LTRIM(RTRIM(p.email)), N'''') IS NOT NULL
            AND ISNULL(e.Email, N'''') <> NULLIF(LTRIM(RTRIM(p.email)), N''''))
        OR (NULLIF(LTRIM(RTRIM(p.mobile_phone)), N'''') IS NOT NULL
            AND ISNULL(e.Mobile, N'''') <> NULLIF(LTRIM(RTRIM(p.mobile_phone)), N''''))
        OR (NULLIF(LTRIM(RTRIM(p.gender)), N'''') IS NOT NULL
            AND ISNULL(e.Gender, N'''') <> NULLIF(LTRIM(RTRIM(p.gender)), N''''))
        OR (p.hire_date IS NOT NULL
            AND (e.JoiningDate IS NULL OR e.JoiningDate <> p.hire_date));

    SET @EmployeeRows = @@ROWCOUNT;

    DECLARE @ClassifiedEvents TABLE
    (
        EmployeeId int NOT NULL,
        AzureEmployeeId nvarchar(100) NOT NULL,
        EmployeeCode nvarchar(50) NOT NULL,
        EmployeeName nvarchar(150) NOT NULL,
        AttendanceDate date NOT NULL,
        ShiftName nvarchar(50) NOT NULL,
        ShiftStartAt datetime2(7) NULL,
        ShiftEndAt datetime2(7) NULL,
        EntryBufferMinutes int NOT NULL,
        ExitBufferMinutes int NOT NULL,
        EventTime datetime2(7) NOT NULL
    );

    INSERT INTO @ClassifiedEvents
    (
        EmployeeId, AzureEmployeeId, EmployeeCode, EmployeeName,
        AttendanceDate, ShiftName, ShiftStartAt, ShiftEndAt,
        EntryBufferMinutes, ExitBufferMinutes, EventTime
    )
    SELECT
        e.EmployeeId,
        CONVERT(nvarchar(100), e.AzureEmployeeId),
        COALESCE(e.EmployeeCode, N''''),
        LTRIM(RTRIM(CONCAT(e.FirstName, N'' '', e.LastName))),
        COALESCE(assigned.WorkDate, CONVERT(date, t.event_time)),
        COALESCE(assigned.ShiftName, N''Unassigned''),
        assigned.ShiftStartAt,
        assigned.ShiftEndAt,
        COALESCE(assigned.EntryBufferMinutes, 0),
        COALESCE(assigned.ExitBufferMinutes, 0),
        t.event_time
    FROM Accessvault.dbo.acc_transaction AS t
    INNER JOIN Orbit.dbo.Employees AS e
        ON LTRIM(RTRIM(e.AzureEmployeeId)) = LTRIM(RTRIM(t.pin))
    OUTER APPLY
    (
        SELECT TOP (1)
            candidate.WorkDate,
            sh.ShiftName,
            shiftTimes.ShiftStartAt,
            shiftTimes.ShiftEndAt,
            sh.EntryBufferMinutes,
            sh.ExitBufferMinutes
        FROM (VALUES
            (CONVERT(date, t.event_time)),
            (DATEADD(day, -1, CONVERT(date, t.event_time))),
            (DATEADD(day, 1, CONVERT(date, t.event_time)))
        ) AS candidate(WorkDate)
        INNER JOIN Orbit.dbo.Shifts AS sh
            ON sh.EmployeeId = e.EmployeeId
            AND sh.Status = N''Active''
            AND candidate.WorkDate BETWEEN sh.FromDate AND sh.ToDate
        CROSS APPLY
        (
            SELECT
                DATEADD
                (
                    second,
                    DATEDIFF(second, CONVERT(time(0), ''00:00:00''), sh.StartTime),
                    CONVERT(datetime2(0), candidate.WorkDate)
                ) AS ShiftStartAt,
                DATEADD
                (
                    day,
                    CASE WHEN sh.EndTime <= sh.StartTime THEN 1 ELSE 0 END,
                    DATEADD
                    (
                        second,
                        DATEDIFF(second, CONVERT(time(0), ''00:00:00''), sh.EndTime),
                        CONVERT(datetime2(0), candidate.WorkDate)
                    )
                ) AS ShiftEndAt
        ) AS shiftTimes
        ORDER BY
            CASE
                WHEN t.event_time < shiftTimes.ShiftStartAt
                    THEN DATEDIFF(second, t.event_time, shiftTimes.ShiftStartAt)
                WHEN t.event_time > shiftTimes.ShiftEndAt
                    THEN DATEDIFF(second, shiftTimes.ShiftEndAt, t.event_time)
                ELSE 0
            END,
            shiftTimes.ShiftStartAt DESC,
            sh.ShiftId DESC
    ) AS assigned
    WHERE NULLIF(LTRIM(RTRIM(t.pin)), N'''') IS NOT NULL;

    DECLARE @DailyAttendance TABLE
    (
        EmployeeId int NOT NULL,
        AzureEmployeeId nvarchar(100) NOT NULL,
        EmployeeCode nvarchar(50) NOT NULL,
        EmployeeName nvarchar(150) NOT NULL,
        AttendanceDate date NOT NULL,
        ShiftName nvarchar(50) NOT NULL,
        FirstEvent datetime2(7) NOT NULL,
        LastEvent datetime2(7) NOT NULL,
        TotalMinutes int NOT NULL,
        LateMinutes int NOT NULL,
        EarlyCheckoutMinutes int NOT NULL,
        OvertimeMinutes int NOT NULL,
        PRIMARY KEY (EmployeeId, AttendanceDate)
    );

    INSERT INTO @DailyAttendance
    (
        EmployeeId, AzureEmployeeId, EmployeeCode, EmployeeName,
        AttendanceDate, ShiftName, FirstEvent, LastEvent, TotalMinutes,
        LateMinutes, EarlyCheckoutMinutes, OvertimeMinutes
    )
    SELECT
        c.EmployeeId,
        c.AzureEmployeeId,
        c.EmployeeCode,
        c.EmployeeName,
        c.AttendanceDate,
        MAX(c.ShiftName),
        MIN(c.EventTime),
        MAX(c.EventTime),
        DATEDIFF(minute, MIN(c.EventTime), MAX(c.EventTime)),
        CASE
            WHEN MAX(c.ShiftStartAt) IS NULL THEN 0
            -- AccessVault logs do not identify IN versus OUT events. An event
            -- in the second half of the scheduled window is treated as an
            -- exit candidate, not a late arrival.
            WHEN MIN(c.EventTime) >= DATEADD
            (
                second,
                DATEDIFF(second, MAX(c.ShiftStartAt), MAX(c.ShiftEndAt)) / 2,
                MAX(c.ShiftStartAt)
            ) THEN 0
            WHEN DATEDIFF(minute, MAX(c.ShiftStartAt), MIN(c.EventTime)) > MAX(c.EntryBufferMinutes)
                THEN DATEDIFF(minute, MAX(c.ShiftStartAt), MIN(c.EventTime)) - MAX(c.EntryBufferMinutes)
            ELSE 0
        END,
        CASE
            WHEN MIN(c.ShiftEndAt) IS NULL THEN 0
            -- An event in the first half of the shift is an entry candidate,
            -- not an early checkout.
            WHEN MAX(c.EventTime) < DATEADD
            (
                second,
                DATEDIFF(second, MAX(c.ShiftStartAt), MIN(c.ShiftEndAt)) / 2,
                MAX(c.ShiftStartAt)
            ) THEN 0
            WHEN DATEDIFF(minute, MAX(c.EventTime), MIN(c.ShiftEndAt)) > MAX(c.ExitBufferMinutes)
                THEN DATEDIFF(minute, MAX(c.EventTime), MIN(c.ShiftEndAt)) - MAX(c.ExitBufferMinutes)
            ELSE 0
        END,
        CASE
            WHEN MAX(c.ShiftEndAt) IS NOT NULL
             AND MAX(c.EventTime) > MAX(c.ShiftEndAt)
                THEN DATEDIFF(minute, MAX(c.ShiftEndAt), MAX(c.EventTime))
            ELSE 0
        END
    FROM @ClassifiedEvents AS c
    GROUP BY
        c.EmployeeId, c.AzureEmployeeId, c.EmployeeCode, c.EmployeeName,
        c.AttendanceDate;

    DECLARE @DeleteFrom date;
    DECLARE @DeleteTo date;
    SELECT
        @DeleteFrom = DATEADD(day, -1, MIN(AttendanceDate)),
        @DeleteTo = DATEADD(day, 1, MAX(AttendanceDate))
    FROM @DailyAttendance;

    IF @DeleteFrom IS NOT NULL
    BEGIN
        DELETE FROM Orbit.dbo.Attendances
        WHERE CreatedBy = N''AccessVaultSync''
          AND IsRegularized = 0
          AND AttendanceDate BETWEEN @DeleteFrom AND @DeleteTo;
        SET @AttendanceDeleted = @@ROWCOUNT;
    END;

    UPDATE a
    SET
        a.AzureEmployeeId = d.AzureEmployeeId,
        a.EmployeeCode = d.EmployeeCode,
        a.EmployeeName = d.EmployeeName,
        a.Shift = d.ShiftName,
        a.CheckIn = CONVERT(time(7), d.FirstEvent),
        a.CheckOut = CONVERT(time(7), d.LastEvent),
        a.TotalHours =
            CASE WHEN d.TotalMinutes / 60 < 10 THEN ''0'' ELSE '''' END
            + CONVERT(varchar(10), d.TotalMinutes / 60)
            + '':'' + RIGHT(''0'' + CONVERT(varchar(2), d.TotalMinutes % 60), 2),
        a.Status = N''Present'',
        a.LateMinutes = d.LateMinutes,
        a.EarlyCheckoutMinutes = d.EarlyCheckoutMinutes,
        a.IsLate = CASE WHEN d.LateMinutes > 0 THEN 1 ELSE 0 END,
        a.IsEarlyCheckout = CASE WHEN d.EarlyCheckoutMinutes > 0 THEN 1 ELSE 0 END,
        a.OvertimeMinutes = d.OvertimeMinutes,
        a.BreakMinutes = 0,
        a.FirstInAt = d.FirstEvent,
        a.LastOutAt = d.LastEvent,
        a.UnpaidGapMinutes = 0,
        a.UnpaidOvertimeGapMinutes = 0,
        a.UpdatedDate = @RunAt,
        a.UpdatedBy = N''AccessVaultSync''
    FROM Orbit.dbo.Attendances AS a
    INNER JOIN @DailyAttendance AS d
        ON d.EmployeeId = a.EmployeeId
        AND d.AttendanceDate = a.AttendanceDate
    WHERE a.IsRegularized = 0
      AND a.CreatedBy = N''AccessVaultSync'';

    INSERT INTO Orbit.dbo.Attendances
    (
        EmployeeId, AzureEmployeeId, EmployeeCode, EmployeeName,
        AttendanceDate, Shift, CheckIn, CheckOut, TotalHours, Status,
        LateMinutes, EarlyCheckoutMinutes, IsLate, IsEarlyCheckout,
        CreatedDate, CreatedBy, OvertimeMinutes, BreakMinutes,
        FirstInAt, LastOutAt, UnpaidGapMinutes,
        UnpaidOvertimeGapMinutes, IsRegularized
    )
    SELECT
        d.EmployeeId, d.AzureEmployeeId, d.EmployeeCode, d.EmployeeName,
        d.AttendanceDate, d.ShiftName,
        CONVERT(time(7), d.FirstEvent), CONVERT(time(7), d.LastEvent),
        CASE WHEN d.TotalMinutes / 60 < 10 THEN ''0'' ELSE '''' END
            + CONVERT(varchar(10), d.TotalMinutes / 60)
            + '':'' + RIGHT(''0'' + CONVERT(varchar(2), d.TotalMinutes % 60), 2),
        N''Present'', d.LateMinutes, d.EarlyCheckoutMinutes,
        CASE WHEN d.LateMinutes > 0 THEN 1 ELSE 0 END,
        CASE WHEN d.EarlyCheckoutMinutes > 0 THEN 1 ELSE 0 END,
        @RunAt, N''AccessVaultSync'', d.OvertimeMinutes, 0,
        d.FirstEvent, d.LastEvent, 0, 0, 0
    FROM @DailyAttendance AS d
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM Orbit.dbo.Attendances AS a WITH (UPDLOCK, HOLDLOCK)
        WHERE a.EmployeeId = d.EmployeeId
          AND a.AttendanceDate = d.AttendanceDate
    );

    SET @AttendanceInserted = @@ROWCOUNT;

    COMMIT TRANSACTION;

    PRINT CONCAT(
        N''AccessVault sync completed. Employees updated: '', @EmployeeRows,
        N''; generated attendance rows replaced: '', @AttendanceDeleted,
        N''; attendance rows inserted: '', @AttendanceInserted,
        N''. Overtime is minutes after assigned shift end.''
    );
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;

',
    @retry_attempts = 3,
    @retry_interval = 5,
    @on_success_action = 3,
    @on_success_step_id = 2,
    @on_fail_action = 2;

EXEC dbo.sp_add_jobstep
    @job_id = @JobId,
    @step_name = N'Apply assigned shift names',
    @subsystem = N'TSQL',
    @database_name = N'Orbit',
    @command = N'UPDATE a
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
    @on_success_action = 1,
    @on_fail_action = 2;

EXEC dbo.sp_add_schedule
    @schedule_name = N'Orbit AccessVault Sync Hourly',
    @enabled = 1,
    @freq_type = 4,
    @freq_interval = 1,
    @freq_subday_type = 8,
    @freq_subday_interval = 1,
    @freq_recurrence_factor = 1,
    @active_start_date = 20260101,
    @active_start_time = 000000;

EXEC dbo.sp_attach_schedule
    @job_id = @JobId,
    @schedule_name = N'Orbit AccessVault Sync Hourly';

EXEC dbo.sp_add_jobserver
    @job_id = @JobId,
    @server_name = N'SWVMNVMPRDSPK61';
GO
