SET XACT_ABORT ON;
BEGIN TRANSACTION;

CREATE TABLE dbo.AccessvaultReaderMappings (
    ReaderName nvarchar(100) NOT NULL PRIMARY KEY,
    DoorName nvarchar(100) NOT NULL,
    Direction varchar(3) NOT NULL CHECK (Direction IN ('IN','OUT'))
);

CREATE TABLE dbo.AccessvaultOfficeMovements (
    SourceTransactionId nvarchar(50) NOT NULL PRIMARY KEY,
    EmployeeId int NOT NULL,
    PersonPin nvarchar(30) NOT NULL,
    EventTime datetime2(7) NOT NULL,
    DoorName nvarchar(100) NOT NULL,
    Direction varchar(3) NOT NULL CHECK (Direction IN ('IN','OUT')),
    ReaderName nvarchar(100) NOT NULL
);
CREATE INDEX IX_AccessvaultOfficeMovements_EmployeeTime
    ON dbo.AccessvaultOfficeMovements(EmployeeId,EventTime,SourceTransactionId);

CREATE TABLE dbo.AccessvaultOfficeAbsences (
    OutTransactionId nvarchar(50) NOT NULL PRIMARY KEY,
    EmployeeId int NOT NULL,
    AttendanceDate date NOT NULL,
    OutTime datetime2(7) NOT NULL,
    OutDoor nvarchar(100) NOT NULL,
    ReturnTransactionId nvarchar(50) NULL,
    ReturnTime datetime2(7) NULL
);
CREATE INDEX IX_AccessvaultOfficeAbsences_EmployeeDate
    ON dbo.AccessvaultOfficeAbsences(EmployeeId,AttendanceDate);

CREATE TABLE dbo.AccessvaultOfficePresence (
    EmployeeId int NOT NULL PRIMARY KEY,
    IsInOffice bit NOT NULL,
    LastMovementTime datetime2(7) NOT NULL,
    LastDoor nvarchar(100) NOT NULL,
    LastTransactionId nvarchar(50) NOT NULL
);

INSERT dbo.AccessvaultReaderMappings (ReaderName,DoorName,Direction) VALUES
 ('172.31.5.10-2-In','Door 2','IN'),('172.31.5.10-2-Out','Door 2','OUT'),
 ('172.31.5.10-3-In','Door 3','IN'),('172.31.5.10-3-Out','Door 3','OUT'),
 ('172.31.5.10-4-In','Door 4','IN'),('172.31.5.10-4-Out','Door 4','OUT');

COMMIT TRANSACTION;
