const convertWeeksAndMonthsToDays = (periodType, timeToElapse) => {
    timeToElapse = parseInt(timeToElapse, 10);
    if (typeof periodType !== "string" && Number.isNaN(timeToElapse)) return;
    if (periodType === "weeks") {
        timeToElapse = timeToElapse * 7;
    } else if (periodType === "months") {
        timeToElapse = timeToElapse * 30;
    }
    return {
        days: timeToElapse,
        power: Math.floor(timeToElapse / 3)
    };
}



const covid19ImpactEstimator = (data) => {
    const {
        region,
        periodType,
        reportedCases,
        timeToElapse,
        totalHospitalBeds
    } = data;
    const impact = {},
        severeImpact = {};
    let {
        days,
        power
    } = convertWeeksAndMonthsToDays(periodType, timeToElapse);
    impact.currentlyInfected = reportedCases * 10;
    severeImpact.currentlyInfected = reportedCases * 50;
    impact.infectionsByRequestedTime = impact.currentlyInfected * (2 ** power);
    severeImpact.infectionsByRequestedTime = severeImpact.currentlyInfected * (2 ** power);
    impact.severeCasesByRequestedTime = 0.15 * impact.infectionsByRequestedTime;
    severeImpact.severeCasesByRequestedTime = 0.15 * severeImpact.infectionsByRequestedTime;
    impact.hospitalBedsByRequestedTime = totalHospitalBeds - impact.severeCasesByRequestedTime;
    severeImpact.hospitalBedsByRequestedTime = totalHospitalBeds - severeImpact.severeCasesByRequestedTime;
    impact.casesForICUByRequestedTime = 0.05 * Math.floor(impact.infectionsByRequestedTime);
    severeImpact.casesForICUByRequestedTime = 0.05 * Math.floor(severeImpact.infectionsByRequestedTime);
    impact.casesForVentilatorsByRequestedTime = 0.02 * Math.floor(impact.infectionsByRequestedTime);
    severeImpact.casesForVentilatorsByRequestedTime = 0.02 * Math.floor(severeImpact.infectionsByRequestedTime);
    let amountImpact = Math.floor(impact.infectionsByRequestedTime) * region.avgDailyIncomePopulation * region.avgDailyIncomeInUSD * days;
    impact.dollarsInFlight = amountImpact.toFixed(2);
    let amountInFlight = Math.floor(severeImpact.infectionsByRequestedTime) * region.avgDailyIncomePopulation * region.avgDailyIncomeInUSD * days;
    severeImpact.dollarsInFlight = amountInFlight.toFixed(2);

    return {
        ...data,
        impact,
        severeImpact,
    }
};

export default covid19ImpactEstimator;