const fs = require("fs");
function timeToSec(timeStr) {
    timeStr = timeStr.trim();
    const spaceIndex = timeStr.lastIndexOf(' ');
    const period = timeStr.slice(spaceIndex + 1).toLowerCase();
    const timePart = timeStr.slice(0, spaceIndex);
    const parts = timePart.split(':');
    let hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseInt(parts[2]);

    if (period === 'am') {
        if (hours === 12) hours = 0;
    } else {
        if (hours !== 12) hours += 12;
    }

    return hours * 3600 + minutes * 60 + seconds;
}

function secToStr(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function durToSec(duration) {
    const parts = duration.trim().split(':');
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
}

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    // TODO: Implement this function
    const start = timeToSec(startTime);
    let end = timeToSec(endTime);
    if (end < start) end += 24 * 3600;
    return secToStr(end - start);
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    // TODO: Implement this function
    const start = timeToSec(startTime);
    let end = timeToSec(endTime);
    if (end < start) end += 24 * 3600;
    const deliveryStart = 8 * 3600;
    const deliveryEnd = 22 * 3600;

    let idle = 0;
    if (start < deliveryStart) {
        idle += deliveryStart - start;
    }
    if (end > deliveryEnd) {
        idle += end - deliveryEnd;
    }

    return secToStr(idle);

}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
     
        const shift = durToSec(shiftDuration);
    const idle = durToSec(idleTime);
    return secToStr(shift - idle);
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
     
        const active = durToSec(activeTime);
    const parts = date.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);

    let quota;
    if (year === 2025 && month === 4 && day >= 10 && day <= 30) {
        quota = 6 * 3600;
    } else {
        quota = 8 * 3600 + 24 * 60;
    }

    return active >= quota;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
 
        const content = fs.readFileSync(textFile, 'utf8');
    const lines = content.split('\n').filter(function(line) { return line.trim() !== ''; });

    for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols[0].trim() === shiftObj.driverID && cols[2].trim() === shiftObj.date) {
            return {};
        }
    }

    const shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    const idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    const activeTime = getActiveTime(shiftDuration, idleTime);
    const quota = metQuota(shiftObj.date, activeTime);

    const newRecord = {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: quota,
        hasBonus: false
    };

    const newLine = newRecord.driverID + ',' + newRecord.driverName + ',' + newRecord.date + ',' +
        newRecord.startTime + ',' + newRecord.endTime + ',' + newRecord.shiftDuration + ',' +
        newRecord.idleTime + ',' + newRecord.activeTime + ',' + newRecord.metQuota + ',' + newRecord.hasBonus;

    let lastIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols[0].trim() === shiftObj.driverID) {
            lastIndex = i;
        }
    }

    if (lastIndex === -1) {
        lines.push(newLine);
    } else {
        lines.splice(lastIndex + 1, 0, newLine);
    }

    fs.writeFileSync(textFile, lines.join('\n') + '\n');

    return newRecord;
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
 
        const content = fs.readFileSync(textFile, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols[0].trim() === driverID && cols[2].trim() === date) {
            cols[9] = String(newValue);
            lines[i] = cols.join(',');
            break;
        }
    }

    fs.writeFileSync(textFile, lines.join('\n'));
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
 
        const content = fs.readFileSync(textFile, 'utf8');
    const lines = content.split('\n').filter(function(line) { return line.trim() !== ''; });

    let driverExists = false;
    let count = 0;
    const targetMonth = parseInt(month);

    for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols[0].trim() === driverID) {
            driverExists = true;
            const dateCols = cols[2].trim().split('-');
            const recordMonth = parseInt(dateCols[1]);
            if (recordMonth === targetMonth && cols[9].trim() === 'true') {
                count++;
            }
        }
    }

    if (!driverExists) return -1;
    return count;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
 
    const content = fs.readFileSync(textFile, 'utf8');
    const lines = content.split('\n').filter(function(line) { return line.trim() !== ''; });

    let totalSeconds = 0;

    for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols[0].trim() === driverID) {
            const dateCols = cols[2].trim().split('-');
            const recordMonth = parseInt(dateCols[1]);
            if (recordMonth === month) {
                totalSeconds += durToSec(cols[7].trim());
            }
        }
    }

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
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
 
    const rateContent = fs.readFileSync(rateFile, 'utf8');
    const rateLines = rateContent.split('\n').filter(function(line) { return line.trim() !== ''; });

    let dayOff = '';
    for (let i = 0; i < rateLines.length; i++) {
        const cols = rateLines[i].split(',');
        if (cols[0].trim() === driverID) {
            dayOff = cols[1].trim();
            break;
        }
    }

    const dayMap = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
        'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    const dayOffNumber = dayMap[dayOff];

    const shiftContent = fs.readFileSync(textFile, 'utf8');
    const shiftLines = shiftContent.split('\n').filter(function(line) { return line.trim() !== ''; });

    let totalSeconds = 0;

    for (let i = 0; i < shiftLines.length; i++) {
        const cols = shiftLines[i].split(',');
        if (cols[0].trim() === driverID) {
            const dateCols = cols[2].trim().split('-');
            const recordMonth = parseInt(dateCols[1]);
            if (recordMonth === month) {
                const year = parseInt(dateCols[0]);
                const day = parseInt(dateCols[2]);
                const dateObj = new Date(year, recordMonth - 1, day);
                if (dateObj.getDay() !== dayOffNumber) {
                    let quota;
                    if (year === 2025 && recordMonth === 4 && day >= 10 && day <= 30) {
                        quota = 6 * 3600;
                    } else {
                        quota = 8 * 3600 + 24 * 60;
                    }
                    totalSeconds += quota;
                }
            }
        }
    }

    totalSeconds -= bonusCount * 2 * 3600;
    if (totalSeconds < 0) totalSeconds = 0;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
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
 
        const content = fs.readFileSync(rateFile, 'utf8');
    const lines = content.split('\n').filter(function(line) { return line.trim() !== ''; });

    let basePay = 0;
    let tier = 0;

    for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols[0].trim() === driverID) {
            basePay = parseInt(cols[2].trim());
            tier = parseInt(cols[3].trim());
            break;
        }
    }

    const allowedMissing = { 1: 50, 2: 20, 3: 10, 4: 3 };
    const allowed = allowedMissing[tier];

    const actualSeconds = durToSec(actualHours);
    const requiredSeconds = durToSec(requiredHours);

    if (actualSeconds >= requiredSeconds) return basePay;

    const missingSeconds = requiredSeconds - actualSeconds;
    const missingHours = missingSeconds / 3600;

    const billable = missingHours - allowed;
    if (billable <= 0) return basePay;

    const billableFullHours = Math.floor(billable);
    const deductionRate = Math.floor(basePay / 185);
    const deduction = billableFullHours * deductionRate;

    return basePay - deduction;
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



