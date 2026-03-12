const fs = require("fs");
function parseTimeToSeconds(timeStr) {
    const parts = timeStr.trim().split(" ");
    const [h, m, s] = parts[0].split(":").map(Number);
    const period = parts[1].toLowerCase();
    let hours = h;
    if (period === "am" && h === 12) hours = 0;
    if (period === "pm" && h !== 12) hours += 12;
    return hours * 3600 + m * 60 + s;
}

function parseDurationToSeconds(dur) {
    const [h, m, s] = dur.trim().split(":").map(Number);
    return h * 3600 + m * 60 + s;
}

function formatDuration(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);       
    const m = Math.floor((totalSeconds % 3600) / 60);  
    const s = totalSeconds % 60;                        
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    // TODO: Implement this function
    let StartSeconds=parseTimeToSeconds(startTime);
    let EndSeconds=parseTimeToSeconds(endTime);
    const ShiftDuration=EndSeconds-StartSeconds;
    return formatDuration(ShiftDuration);
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    // TODO: Implement this function
    const StartSeconds=parseTimeToSeconds(startTime);
    const EndSeconds=parseTimeToSeconds(endTime);
    const startwork=8*3600;
    const endwork=22*3600;
    let idleTime=0;

    if(StartSeconds<startwork)
        idleTime+=startwork-StartSeconds;

     if(EndSeconds>endwork)
        idleTime+=EndSeconds-endwork;
    
    return formatDuration(idleTime);
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    // TODO: Implement this function
    const idle=parseDurationToSeconds(idleTime);
    const shift=parseDurationToSeconds(shiftDuration);
    const activeTime=shift-idle;
    if(activeTime<0)
        return formatDuration(0);
    return formatDuration(activeTime);
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    const activeSec = parseDurationToSeconds(activeTime);
    
    let quotaSeconds;
    if (date >= "2025-04-10" && date <= "2025-04-30") {
        quotaSeconds = 6 * 3600;
    } else {
        quotaSeconds = 8 * 3600 + 24 * 60;
    }
    
    return activeSec >= quotaSeconds;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    let lines;
    if (!fs.existsSync(textFile)) {
        lines = ["DriverID,DriverName,Date,StartTime,EndTime,ShiftDuration,IdleTime,ActiveTime,MetQuota,HasBonus"];
    } else {
        const content = fs.readFileSync(textFile, "utf-8").trim();
        lines = content.split("\n");
    }

    const header = lines[0];
    let records = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === "") continue;
        records.push(lines[i].split(","));
    }

    // Check duplicate
    for (let i = 0; i < records.length; i++) {
        if (records[i][0] === shiftObj.driverID && records[i][2] === shiftObj.date) {
            return {};
        }
    }

    // Calculate derived fields
    const shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    const idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    const activeTime = getActiveTime(shiftDuration, idleTime);
    const metQuotaValue = metQuota(shiftObj.date, activeTime);
    const hasBonus = false;

    const newRecord = [
        shiftObj.driverID,
        shiftObj.driverName,
        shiftObj.date,
        shiftObj.startTime,
        shiftObj.endTime,
        shiftDuration,
        idleTime,
        activeTime,
        metQuotaValue,
        hasBonus
    ];

    // Find last occurrence of this driverID
    let lastIndex = -1;
    for (let i = 0; i < records.length; i++) {
        if (records[i][0] === shiftObj.driverID) {
            lastIndex = i;
        }
    }

    // Insert after last occurrence, or append at end if not found
    let newRecords = [];
    if (lastIndex === -1) {
        newRecords = records;
        newRecords.push(newRecord);
    } else {
        for (let i = 0; i < records.length; i++) {
            newRecords.push(records[i]);
            if (i === lastIndex) {
                newRecords.push(newRecord);
            }
        }
    }

    const newContent = header + "\n" + newRecords.map(r => r.join(",")).join("\n");
    fs.writeFileSync(textFile, newContent);

    return {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: metQuotaValue,
        hasBonus: hasBonus
    };
}


// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    const content = fs.readFileSync(textFile, "utf-8").trim();
    const lines = content.split("\n");
    const header = lines[0];
    let records = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        if (cols[0] === driverID && cols[2] === date) {
            cols[9] = newValue.toString();
        }
        records.push(cols);
    }

    const newContent = header + "\n" + records.map(r => r.join(",")).join("\n");
    fs.writeFileSync(textFile, newContent);
}
    

    


// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
    const content = fs.readFileSync(textFile, "utf-8").trim();
    const lines = content.split("\n");
    const header = lines[0];

    let records = [];
    let bonusCount = 0;
    let driverFound = false;

    // Parse existing records
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        records.push(cols);
        if (cols[0] === driverID) {
            driverFound = true;
            const recordMonth = cols[2].split("-")[1];
            if (parseInt(recordMonth) === parseInt(month) && cols[9].toLowerCase() === "true") {
                bonusCount++;
            }
        }
    }
    
    return driverFound ? bonusCount : -1;


}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    const content = fs.readFileSync(textFile, "utf-8").trim();
    const lines = content.split("\n");

    let totalSeconds = 0;

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");

        const recordDriverID = cols[0];
        const date = cols[2];
        const activeTime = cols[7];

        // extract month from date
        const parts = date.split("-");
        const recordMonth = Number(parts[1]);

        if (recordDriverID === driverID && recordMonth === month) {
            const seconds = parseDurationToSeconds(activeTime);
            totalSeconds += seconds;
        }
    }

   const h = Math.floor(totalSeconds / 3600);
const m = Math.floor((totalSeconds % 3600) / 60);
const s = totalSeconds % 60;
return String(h) + ":" + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {

    const shiftcontent = fs.readFileSync(textFile, "utf-8").trim();
    const ratecontent = fs.readFileSync(rateFile, "utf-8").trim();

    const Shiftlines = shiftcontent.split("\n");
    const Ratelines = ratecontent.split("\n");

    let requiredSeconds = 0;
    let dayOff = "";

    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    for (let i = 0; i < Ratelines.length; i++) {
        const cols = Ratelines[i].split(",");
        if (cols[0] === driverID) {
            dayOff = cols[1];
        }
    }

    for (let i = 1; i < Shiftlines.length; i++) {
        const cols = Shiftlines[i].split(",");

        const recordDriver = cols[0];
        const date = cols[2];

        const parts = date.split("-");
        const recordMonth = Number(parts[1]);
        const day = Number(parts[2]);

        if (recordDriver === driverID && recordMonth === month) {

            const d = new Date(date);
            const dayName = days[d.getDay()];

            // skip if driver worked on their day off
            if (dayName === dayOff) continue;

          // Eid rule
        if (recordMonth === 4 && day >= 10 && day <= 30) {
            requiredSeconds += 6 * 3600;
        } else {
            requiredSeconds += (8 * 3600) + (24 * 60); 
        }
    }
}

// bonus reduction
requiredSeconds -= bonusCount * (2 * 3600);
if (requiredSeconds < 0) requiredSeconds = 0;

const hours = Math.floor(requiredSeconds / 3600);
const minutes = Math.floor((requiredSeconds % 3600) / 60);
const seconds = requiredSeconds % 60;

return String(hours) + ":" +
       String(minutes).padStart(2, "0") + ":" +
       String(seconds).padStart(2, "0");
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
    const ratecontent = fs.readFileSync(rateFile, "utf-8").trim();
    const Ratelines = ratecontent.split("\n");

    let basePay = 0;
    let tier = 0;
    for (let i = 0; i < Ratelines.length; i++) {
        const cols = Ratelines[i].split(",");
        if (cols[0] === driverID) {
            basePay = parseInt(cols[2]);
            tier = parseInt(cols[3]);
            break;
        }
    } 
        let allowedMissedHours;
    switch (tier) {
        case 1: allowedMissedHours = 50; break;
        case 2: allowedMissedHours = 20; break;
        case 3: allowedMissedHours = 10; break;
        default: allowedMissedHours = 3;
    }

    const actualSeconds = parseDurationToSeconds(actualHours);
    const requiredSeconds = parseDurationToSeconds(requiredHours);

    if (actualSeconds >=requiredSeconds)
         return basePay;

    const missingHours = (requiredSeconds-actualSeconds) / 3600;
    const chargedMissed = missingHours-allowedMissedHours;

    if (chargedMissed <= 0)
        return basePay;

    const chargedMissedFullHours = Math.floor(chargedMissed);
    const deductionRPH = Math.floor(basePay / 185);
    const salaryDeduction = chargedMissedFullHours * deductionRPH;

    return basePay - salaryDeduction;
}





module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
