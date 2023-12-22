CREATE TABLE `Users` (
`Id` INT NULL AUTO_INCREMENT , 
`Address` LONGTEXT NOT NULL ,
`IsVerified` TINYINT(1) NULL ,
`MailAddress` LONGTEXT NULL , 
`Name` LONGTEXT NOT NULL , 
`Nonce` INT NULL , 
`Role` LONGTEXT NOT NULL ,
`Surname` LONGTEXT NOT NULL , 
`Username` LONGTEXT NOT NULL , 
`VerificationExpiration` DATETIME(6) NULL , 
`VerificationToken` LONGTEXT NOT NULL , 
PRIMARY KEY (`Id`)
) ENGINE = InnoDB;

CREATE TABLE `ProjectPermissions` (
`ID` INT NULL AUTO_INCREMENT , 
`IsAccepted` TINYINT(1) NULL ,
`ProjectID` INT NULL ,
`Role` LONGTEXT NULL , 
`UserID` INT NULL , 
PRIMARY KEY (`ID`)
) ENGINE = InnoDB;

CREATE TABLE `Projects` (
`ProjectID` INT NULL AUTO_INCREMENT , 
`Date` DATETIME(6) NULL ,
`FileHash` LONGTEXT NULL ,
`IsAuctionCreated` TINYINT(1) NULL , 
`IsAuctionStarted` TINYINT(1) NULL , 
`MarkDown` LONGTEXT NULL , 
`ProjectDescription` LONGTEXT NOT NULL ,
`ProjectName` LONGTEXT NOT NULL , 
`ProposerAddress` LONGTEXT NULL , 
`Rating` DOUBLE NULL , 
`Status` LONGTEXT NULL ,
`ViewerAccepted` TINYINT(1) NULL , 
`ViewerAcceptedAddress` LONGTEXT NULL , 
PRIMARY KEY (`ProjectID`)
) ENGINE = InnoDB;

CREATE TABLE `Ratings` (
`ID` INT NULL AUTO_INCREMENT , 
`ProjectID` INT NULL ,
`Rate` DOUBLE NULL ,
`UserID` INT NULL , 
PRIMARY KEY (`ID`)
) ENGINE = InnoDB;