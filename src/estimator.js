const convertWeeksAndMonthsToDays = (periodType, timeToElapse) => {
  let estimateTime = parseInt(timeToElapse, 10);
  if (periodType === 'weeks') {
    estimateTime *= 7;
  } else if (periodType === 'months') {
    estimateTime *= 30;
  }
  return {
    days: estimateTime,
    power: Math.floor(estimateTime / 3)
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
  impact.hospitalBedsByRequestedTime = totalHospitalBeds - impact.severeCasesByRequestedTime;
  severeImpact.hospitalBedsByRequestedTime = totalHospitalBeds - severeImpact.severeCasesByRequestedTime;
  const impactInfections = Math.floor(impact.infectionsByRequestedTime);
  const severeInfections = Math.floor(severeImpact.infectionsByRequestedTime);
  impact.casesForICUByRequestedTime = 0.05 * impactInfections;
  severeImpact.casesForICUByRequestedTime = 0.05 * severeInfections;
  impact.casesForVentilatorsByRequestedTime = 0.02 * impactInfections;
  severeImpact.casesForVentilatorsByRequestedTime = 0.02 * severeInfections;
  const amountImpact = impactInfections * region.avgDailyIncomePopulation * region.avgDailyIncomeInUSD * days;
  impact.dollarsInFlight = amountImpact.toFixed(2);
  const amountInFlight = severeInfections * region.avgDailyIncomePopulation * region.avgDailyIncomeInUSD * days;
  severeImpact.dollarsInFlight = amountInFlight.toFixed(2);
  return {
    ...data,
    impact,
    severeImpact
  };
};

export default covid19ImpactEstimator;