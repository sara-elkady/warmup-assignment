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

