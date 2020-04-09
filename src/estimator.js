const convertWeeksAndMonthsToDays = (periodType, timeToElapse) => {
  let estimateTime = parseInt(timeToElapse, 10);
  if (periodType === 'weeks') {
    estimateTime *= 7;
  } else if (periodType === 'months') {
    estimateTime *= 30;
  }
  return {
    days: estimateTime,
    power: Math.trunc(estimateTime / 3)
  };
};
const covid19ImpactEstimator = (data) => {
  const {
    region,
    periodType,
    reportedCases,
    timeToElapse,
    totalHospitalBeds
  } = data;
  const {
    avgDailyIncomeInUSD,
    avgDailyIncomePopulation
  } = region;
  const impact = {};
  const severeImpact = {};
  const {
    days,
    power
  } = convertWeeksAndMonthsToDays(periodType, timeToElapse);
  impact.currentlyInfected = reportedCases * 10;
  severeImpact.currentlyInfected = reportedCases * 50;
  impact.infectionsByRequestedTime = impact.currentlyInfected * (2 ** power);
  severeImpact.infectionsByRequestedTime = severeImpact.currentlyInfected * (2 ** power);
  impact.severeCasesByRequestedTime = 0.15 * impact.infectionsByRequestedTime;
  severeImpact.severeCasesByRequestedTime = 0.15 * severeImpact.infectionsByRequestedTime;
  const thirtyFivePercent = 0.35 * totalHospitalBeds;
  const impactBed = thirtyFivePercent - impact.severeCasesByRequestedTime;
  impact.hospitalBedsByRequestedTime = Math.trunc(impactBed);
  const difference = thirtyFivePercent - severeImpact.severeCasesByRequestedTime;
  severeImpact.hospitalBedsByRequestedTime = Math.trunc(difference);
  const impactInfections = Math.trunc(impact.infectionsByRequestedTime);
  const severeInfections = Math.trunc(severeImpact.infectionsByRequestedTime);
  impact.casesForICUByRequestedTime = 0.05 * impactInfections;
  severeImpact.casesForICUByRequestedTime = 0.05 * severeInfections;
  impact.casesForVentilatorsByRequestedTime = 0.02 * impactInfections;
  severeImpact.casesForVentilatorsByRequestedTime = 0.02 * severeInfections;
  const amountImpact = impactInfections * avgDailyIncomePopulation * avgDailyIncomeInUSD * days;
  impact.dollarsInFlight = amountImpact.toFixed(2);
  const amountInFlight = severeInfections * avgDailyIncomePopulation * avgDailyIncomeInUSD * days;
  severeImpact.dollarsInFlight = amountInFlight.toFixed(2);
  const result = {
    data: { ...data },
    impact,
    severeImpact
  };
  return result;
};
export default covid19ImpactEstimator;