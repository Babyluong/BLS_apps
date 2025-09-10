// Test script to display missing participants data
console.log('Missing Participants Data:');
console.log('========================');

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

missingParticipants.forEach((participant, index) => {
  console.log(`\n${index + 1}. ${participant.name}`);
  console.log(`   IC: ${participant.ic}`);
  console.log(`   Pre-test: ${participant.preTest}, Post-test: ${participant.postTest}`);
  console.log(`   Results: 1M-CPR: ${participant.oneManCpr}, 2M-CPR: ${participant.twoManCpr}, Adult: ${participant.adultChoking}, Infant: ${participant.infantChoking}, Infant-CPR: ${participant.infantCpr}`);
});

console.log(`\nTotal participants: ${missingParticipants.length}`);
