CREATE OR ALTER PROCEDURE dbo.ProcessAccessvaultOfficeAttendance
    @FromDate date = NULL,
    @ToDate date = NULL
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @LocalToday date = CONVERT(date,DATEADD(minute,330,SYSUTCDATETIME()));
 DECLARE @LocalNow datetime2 = DATEADD(minute,330,SYSUTCDATETIME());
 SET @FromDate = COALESCE(@FromDate,DATEADD(day,-7,@LocalToday));
 SET @ToDate = COALESCE(@ToDate,@LocalToday);
 IF @FromDate > @ToDate THROW 50001, 'FromDate is after ToDate.', 1;

 BEGIN TRANSACTION;

 INSERT dbo.AccessvaultOfficeMovements
   (SourceTransactionId,EmployeeId,PersonPin,EventTime,DoorName,Direction,ReaderName)
 SELECT t.id,e.EmployeeId,t.pin,t.event_time,m.DoorName,m.Direction,t.reader_name
 FROM Accessvault.dbo.acc_transaction AS t
 JOIN dbo.AccessvaultReaderMappings AS m ON m.ReaderName=t.reader_name
 CROSS APPLY (
   SELECT TOP (1) employee.EmployeeId
   FROM dbo.Employees AS employee
   WHERE employee.AzureEmployeeId=t.pin
   ORDER BY CASE WHEN employee.Status='Active' THEN 0 ELSE 1 END,
            employee.EmployeeId
 ) AS e
 WHERE t.event_no=0
   AND t.reader_state=CASE WHEN m.Direction='IN' THEN 0 ELSE 1 END
   AND t.event_time>=@FromDate
   AND t.event_time<DATEADD(day,2,@ToDate)
   AND NOT EXISTS(
       SELECT 1 FROM dbo.AccessvaultOfficeMovements AS d WITH (UPDLOCK,HOLDLOCK)
       WHERE d.SourceTransactionId=t.id
   );
 DECLARE @MovementsInserted int=@@ROWCOUNT;

 SELECT m.*,s.ShiftId,s.StartTime,s.EndTime,s.EntryBufferMinutes,s.ExitBufferMinutes,
        d.AttendanceDate,
        ROW_NUMBER() OVER(PARTITION BY m.SourceTransactionId ORDER BY s.FromDate DESC,s.ShiftId DESC) AS ShiftRank
 INTO #Candidates
 FROM dbo.AccessvaultOfficeMovements AS m
 JOIN dbo.Shifts AS s ON s.EmployeeId=m.EmployeeId AND s.Status='Active'
 OUTER APPLY (
   SELECT TOP (1) p.EventTime AS PreviousEventTime,p.Direction AS PreviousDirection
   FROM dbo.AccessvaultOfficeMovements AS p
   WHERE p.EmployeeId=m.EmployeeId
     AND (p.EventTime<m.EventTime
          OR (p.EventTime=m.EventTime AND p.SourceTransactionId<m.SourceTransactionId))
   ORDER BY p.EventTime DESC,p.SourceTransactionId DESC
 ) AS previousMovement
 CROSS APPLY (
   SELECT CASE
               WHEN m.Direction='IN'
                    AND previousMovement.PreviousDirection='OUT'
                    AND DATEDIFF(minute,previousMovement.PreviousEventTime,m.EventTime)>=240
                 THEN CONVERT(date,m.EventTime)
               WHEN m.EventTime<DATEADD(
                      minute,
                      -s.EntryBufferMinutes,
                      DATEADD(
                        minute,
                        DATEDIFF(minute,CONVERT(time,'00:00'),s.StartTime),
                        CONVERT(datetime2,CONVERT(date,m.EventTime))
                      )
                    )
                 THEN DATEADD(day,-1,CONVERT(date,m.EventTime))
               WHEN s.EndTime<s.StartTime
                 AND CONVERT(time,m.EventTime)<=CONVERT(time,DATEADD(minute,s.ExitBufferMinutes,CONVERT(datetime2,s.EndTime)))
               THEN DATEADD(day,-1,CONVERT(date,m.EventTime))
               ELSE CONVERT(date,m.EventTime) END AS AttendanceDate
 ) AS d
 WHERE m.EventTime>=@FromDate
   AND m.EventTime<DATEADD(day,2,@ToDate)
   AND d.AttendanceDate BETWEEN s.FromDate AND s.ToDate
   AND d.AttendanceDate BETWEEN @FromDate AND @ToDate;

 SELECT SourceTransactionId,EmployeeId,PersonPin,EventTime,DoorName,Direction,
        AttendanceDate,ShiftId
 INTO #Assigned
 FROM #Candidates WHERE ShiftRank=1;

 SELECT a.*,
        LAG(a.Direction) OVER(
          PARTITION BY a.EmployeeId,a.AttendanceDate
          ORDER BY a.EventTime,a.SourceTransactionId) AS PreviousDirection
 INTO #Sequenced
 FROM #Assigned AS a;

 SELECT SourceTransactionId,EmployeeId,PersonPin,EventTime,DoorName,Direction,
        AttendanceDate,ShiftId
 INTO #Transitions
 FROM #Sequenced
 WHERE PreviousDirection IS NULL OR PreviousDirection<>Direction;

 SELECT t.*,
        LEAD(t.EventTime) OVER(
          PARTITION BY t.EmployeeId,t.AttendanceDate
          ORDER BY t.EventTime,t.SourceTransactionId) AS NextEventTime,
        LEAD(t.SourceTransactionId) OVER(
          PARTITION BY t.EmployeeId,t.AttendanceDate
          ORDER BY t.EventTime,t.SourceTransactionId) AS NextTransactionId,
        LEAD(t.Direction) OVER(
          PARTITION BY t.EmployeeId,t.AttendanceDate
          ORDER BY t.EventTime,t.SourceTransactionId) AS NextDirection,
        MIN(CASE WHEN t.Direction='IN' THEN t.EventTime END) OVER(PARTITION BY t.EmployeeId,t.AttendanceDate) AS FirstInForDate,
        ROW_NUMBER() OVER(
          PARTITION BY t.EmployeeId,t.AttendanceDate
          ORDER BY t.EventTime DESC,t.SourceTransactionId DESC) AS LastRank
 INTO #Edges
 FROM #Transitions AS t;

 DELETE a
 FROM dbo.AccessvaultOfficeAbsences AS a
 WHERE a.AttendanceDate BETWEEN @FromDate AND @ToDate
   AND EXISTS(SELECT 1 FROM #Assigned AS s WHERE s.EmployeeId=a.EmployeeId AND s.AttendanceDate=a.AttendanceDate)
   OR EXISTS(SELECT 1 FROM #Edges AS e WHERE e.Direction='OUT' AND e.SourceTransactionId=a.OutTransactionId);

 INSERT dbo.AccessvaultOfficeAbsences
   (OutTransactionId,EmployeeId,AttendanceDate,OutTime,OutDoor,ReturnTransactionId,ReturnTime)
 SELECT SourceTransactionId,EmployeeId,AttendanceDate,EventTime,DoorName,
        CASE WHEN NextDirection='IN' THEN NextTransactionId END,
        CASE WHEN NextDirection='IN' THEN NextEventTime END
 FROM #Edges
 WHERE Direction='OUT';

 SELECT EmployeeId,AttendanceDate,MAX(ShiftId) AS ShiftId,
        MIN(CASE WHEN Direction='IN' THEN EventTime END) AS FirstIn,
        MAX(CASE WHEN Direction='OUT' AND EventTime>=FirstInForDate THEN EventTime END) AS FinalOut,
        SUM(CASE WHEN Direction='IN' AND NextDirection='OUT'
                 THEN DATEDIFF_BIG(second,EventTime,NextEventTime)
                 WHEN Direction='IN' AND NextDirection IS NULL
                 THEN DATEDIFF_BIG(second,EventTime,@LocalNow) ELSE 0 END) AS WorkedSeconds,
        MAX(CASE WHEN LastRank=1 THEN Direction END) AS LastDirection
 INTO #Daily
 FROM #Edges
 GROUP BY EmployeeId,AttendanceDate
 HAVING MIN(CASE WHEN Direction='IN' THEN EventTime END) IS NOT NULL;

 SELECT d.EmployeeId,d.AttendanceDate,s.ShiftName,s.EmployeeCode,s.EmployeeName,
        CONVERT(nvarchar(100),s.AzureEmployeeId) AS AzureEmployeeId,
        CONVERT(time,d.FirstIn) AS CheckIn,
        CASE WHEN d.LastDirection='OUT' THEN CONVERT(time,d.FinalOut) ELSE NULL END AS CheckOut,
        RIGHT('00'+CONVERT(varchar(10),d.WorkedSeconds/3600),2)+':'+
        RIGHT('00'+CONVERT(varchar(2),(d.WorkedSeconds%3600)/60),2) AS TotalHours,
        CASE WHEN d.FirstIn>DATEADD(minute,s.EntryBufferMinutes,dt.ShiftStart)
             THEN 'Late' ELSE 'Present' END AS AttendanceStatus,
        CASE WHEN d.FirstIn>DATEADD(minute,s.EntryBufferMinutes,dt.ShiftStart)
             THEN DATEDIFF(minute,dt.ShiftStart,d.FirstIn) ELSE 0 END AS LateMinutes,
        CASE WHEN d.FinalOut IS NOT NULL AND d.LastDirection='OUT' AND @LocalNow>=dt.ShiftEnd
                       AND d.FinalOut<DATEADD(minute,-s.ExitBufferMinutes,dt.ShiftEnd)
             THEN DATEDIFF(minute,d.FinalOut,dt.ShiftEnd) ELSE 0 END AS EarlyCheckoutMinutes,
        CASE WHEN d.FinalOut IS NOT NULL AND d.FinalOut>dt.ShiftEnd
             THEN DATEDIFF(minute,dt.ShiftEnd,d.FinalOut) ELSE 0 END AS OvertimeMinutes
 INTO #Calculated
 FROM #Daily AS d
 JOIN dbo.Shifts AS s ON s.ShiftId=d.ShiftId
 CROSS APPLY (
   SELECT DATEADD(minute,DATEDIFF(minute,CONVERT(time,'00:00'),s.StartTime),
                  CONVERT(datetime2,d.AttendanceDate)) AS ShiftStart,
          DATEADD(minute,DATEDIFF(minute,CONVERT(time,'00:00'),s.EndTime)+
                  CASE WHEN s.EndTime<s.StartTime THEN 1440 ELSE 0 END,
                  CONVERT(datetime2,d.AttendanceDate)) AS ShiftEnd
 ) AS dt;

 UPDATE a
 SET a.AzureEmployeeId=c.AzureEmployeeId,
     a.EmployeeCode=c.EmployeeCode,
     a.EmployeeName=c.EmployeeName,
     a.Shift=c.ShiftName,
     a.CheckIn=c.CheckIn,
     a.CheckOut=c.CheckOut,
     a.TotalHours=c.TotalHours,
     a.Status=c.AttendanceStatus,
     a.LateMinutes=c.LateMinutes,
     a.IsLate=CASE WHEN c.LateMinutes>0 THEN 1 ELSE 0 END,
     a.EarlyCheckoutMinutes=c.EarlyCheckoutMinutes,
     a.IsEarlyCheckout=CASE WHEN c.EarlyCheckoutMinutes>0 THEN 1 ELSE 0 END,
     a.OvertimeMinutes=c.OvertimeMinutes,
     a.UpdatedBy='Accessvault',
     a.UpdatedDate=SYSUTCDATETIME()
 FROM dbo.Attendances AS a
 JOIN #Calculated AS c ON c.EmployeeId=a.EmployeeId AND c.AttendanceDate=a.AttendanceDate WHERE a.IsRegularized = 0;
 DECLARE @AttendanceUpdated int=@@ROWCOUNT;

 INSERT dbo.Attendances
   (EmployeeId,AzureEmployeeId,EmployeeCode,EmployeeName,AttendanceDate,Shift,
    CheckIn,CheckOut,TotalHours,Status,LateMinutes,EarlyCheckoutMinutes,
    IsLate,IsEarlyCheckout,OvertimeMinutes,Remarks,CreatedDate,CreatedBy)
 SELECT c.EmployeeId,c.AzureEmployeeId,c.EmployeeCode,c.EmployeeName,c.AttendanceDate,
        c.ShiftName,c.CheckIn,c.CheckOut,c.TotalHours,c.AttendanceStatus,
        c.LateMinutes,c.EarlyCheckoutMinutes,
        CASE WHEN c.LateMinutes>0 THEN 1 ELSE 0 END,
        CASE WHEN c.EarlyCheckoutMinutes>0 THEN 1 ELSE 0 END,
        c.OvertimeMinutes,
        'Accessvault door events',SYSUTCDATETIME(),'Accessvault'
 FROM #Calculated AS c
 WHERE NOT EXISTS(
   SELECT 1 FROM dbo.Attendances AS a WITH (UPDLOCK,HOLDLOCK)
   WHERE a.EmployeeId=c.EmployeeId AND a.AttendanceDate=c.AttendanceDate
 );
 DECLARE @AttendanceInserted int=@@ROWCOUNT;

 SELECT m.EmployeeId,CASE WHEN m.Direction='IN' THEN CONVERT(bit,1) ELSE CONVERT(bit,0) END AS IsInOffice,
        m.EventTime,m.DoorName,m.SourceTransactionId
 INTO #LatestPresence
 FROM (
   SELECT m.*,ROW_NUMBER() OVER(
     PARTITION BY m.EmployeeId ORDER BY m.EventTime DESC,m.SourceTransactionId DESC) AS rn
   FROM dbo.AccessvaultOfficeMovements AS m
 ) AS m
 WHERE m.rn=1;

 UPDATE p
 SET p.IsInOffice=l.IsInOffice,p.LastMovementTime=l.EventTime,
     p.LastDoor=l.DoorName,p.LastTransactionId=l.SourceTransactionId
 FROM dbo.AccessvaultOfficePresence AS p
 JOIN #LatestPresence AS l ON l.EmployeeId=p.EmployeeId;

 INSERT dbo.AccessvaultOfficePresence
   (EmployeeId,IsInOffice,LastMovementTime,LastDoor,LastTransactionId)
 SELECT l.EmployeeId,l.IsInOffice,l.EventTime,l.DoorName,l.SourceTransactionId
 FROM #LatestPresence AS l
 WHERE NOT EXISTS(SELECT 1 FROM dbo.AccessvaultOfficePresence AS p WITH (UPDLOCK,HOLDLOCK)
                  WHERE p.EmployeeId=l.EmployeeId);

 COMMIT TRANSACTION;
 SELECT @MovementsInserted AS MovementsInserted,
        @AttendanceInserted AS AttendanceInserted,
        @AttendanceUpdated AS AttendanceUpdated;
END;
