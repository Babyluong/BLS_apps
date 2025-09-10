// Simple script to add missing participants
console.log('Adding missing participants...');

const missingParticipants = [
  { name: "GRACE RURAN NGILO", ic: "850315126789", preTest: 14, postTest: 22, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "AMIR LUQMAN BIN MISKANI", ic: "870512126123", preTest: 25, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SUHARMIE BIN SULAIMAN", ic: "910715126234", preTest: 11, postTest: 23, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MISRAWATI MA AMAN", ic: "890623126789", preTest: 25, postTest: 29, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MYRA ATHIRA BINTI OMAR", ic: "880901126567", preTest: 19, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SA'DI BIN USOP", ic: "910715126234", preTest: 15, postTest: 14, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "WENDY CHANDI ANAK SAMPURAI", ic: "880901126567", preTest: 20, postTest: 25, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NORLINA BINTI ALI", ic: "840901136178", preTest: 20, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" }
];

console.log('Missing participants data:');
missingParticipants.forEach((p, i) => {
  console.log(`${i+1}. ${p.name} - IC: ${p.ic} - Pre: ${p.preTest}, Post: ${p.postTest}`);
  console.log(`   Results: 1M: ${p.oneManCpr}, 2M: ${p.twoManCpr}, Adult: ${p.adultChoking}, Infant: ${p.infantChoking}, Infant-CPR: ${p.infantCpr}`);
});

console.log(`\nTotal: ${missingParticipants.length} participants ready to be added.`);
