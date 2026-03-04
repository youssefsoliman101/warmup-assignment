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
    // TODO: Implement this function
      const content = fs.readFileSync(textFile, "utf-8").trim();
    const lines = content.split("\n");
    const header = lines[0];

    let records = [];

    // Parse existing records
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        records.push(cols);
    }

  for (let i = 0; i < records.length; i++) {
    if (records[i][0] === shiftObj.driverID &&
        records[i][2] === shiftObj.date) {
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

    records.push(newRecord);

    // 🔥 ORDERING (DriverID, then Date)
    records.sort((a, b) => {
        if (a[0] !== b[0]) {
            return a[0].localeCompare(b[0]);
        }
        return a[2].localeCompare(b[2]);
    });

    // Rebuild file
    const newContent =
        header + "\n" +
        records.map(r => r.join(",")).join("\n");

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
    // TODO: Implement this function
    
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
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
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
    // TODO: Implement this function
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
