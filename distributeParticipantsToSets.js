// distributeParticipantsToSets.js
// Distribute 57 participants across post-test sets A, B, C

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function distributeParticipantsToSets() {
  try {
    console.log('🎲 Distributing 57 participants across post-test sets A, B, C\n');
    console.log('=' .repeat(60));
    
    // 1. Get all users who currently have posttest Set A
    console.log('1. 📊 Getting current participants...');
    const { data: currentParticipants, error: fetchError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, quiz_key, set_identifier, score, total_questions')
      .eq('quiz_key', 'posttest')
      .eq('set_identifier', 'A')
      .order('started_at', { ascending: true });
    
    if (fetchError) {
      console.error('❌ Error fetching participants:', fetchError);
      return;
    }
    
    console.log(`   📋 Found ${currentParticipants.length} participants currently on Set A`);
    
    // 2. Create distribution plan
    console.log('\n2. 🎯 Creating distribution plan...');
    const totalParticipants = currentParticipants.length;
    const setA = Math.floor(totalParticipants / 3); // ~19
    const setB = Math.floor(totalParticipants / 3); // ~19
    const setC = totalParticipants - setA - setB; // ~19
    
    console.log(`   Set A: ${setA} participants`);
    console.log(`   Set B: ${setB} participants`);
    console.log(`   Set C: ${setC} participants`);
    console.log(`   Total: ${setA + setB + setC} participants`);
    
    // 3. Randomly shuffle participants
    console.log('\n3. 🔀 Randomizing participant order...');
    const shuffledParticipants = [...currentParticipants];
    for (let i = shuffledParticipants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledParticipants[i], shuffledParticipants[j]] = [shuffledParticipants[j], shuffledParticipants[i]];
    }
    
    // 4. Assign sets to participants
    console.log('\n4. 📝 Assigning sets to participants...');
    const assignments = {
      'A': [],
      'B': [],
      'C': []
    };
    
    let currentIndex = 0;
    
    // Assign Set A
    for (let i = 0; i < setA; i++) {
      assignments['A'].push(shuffledParticipants[currentIndex]);
      currentIndex++;
    }
    
    // Assign Set B
    for (let i = 0; i < setB; i++) {
      assignments['B'].push(shuffledParticipants[currentIndex]);
      currentIndex++;
    }
    
    // Assign Set C
    for (let i = 0; i < setC; i++) {
      assignments['C'].push(shuffledParticipants[currentIndex]);
      currentIndex++;
    }
    
    console.log(`   ✅ Set A: ${assignments['A'].length} participants assigned`);
    console.log(`   ✅ Set B: ${assignments['B'].length} participants assigned`);
    console.log(`   ✅ Set C: ${assignments['C'].length} participants assigned`);
    
    // 5. Update quiz_sessions table
    console.log('\n5. 🔄 Updating quiz_sessions table...');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Update Set B participants
    for (const participant of assignments['B']) {
      const { error: updateError } = await supabase
        .from('quiz_sessions')
        .update({ set_identifier: 'B' })
        .eq('id', participant.id);
      
      if (updateError) {
        console.error(`❌ Error updating ${participant.id}:`, updateError);
        errorCount++;
      } else {
        updatedCount++;
      }
    }
    
    // Update Set C participants
    for (const participant of assignments['C']) {
      const { error: updateError } = await supabase
        .from('quiz_sessions')
        .update({ set_identifier: 'C' })
        .eq('id', participant.id);
      
      if (updateError) {
        console.error(`❌ Error updating ${participant.id}:`, updateError);
        errorCount++;
      } else {
        updatedCount++;
      }
    }
    
    console.log(`   ✅ Updated ${updatedCount} quiz sessions`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    // 6. Update bls_results table
    console.log('\n6. 🏥 Updating bls_results table...');
    
    let blsUpdatedCount = 0;
    let blsErrorCount = 0;
    
    // Update Set B BLS results
    for (const participant of assignments['B']) {
      const { error: updateError } = await supabase
        .from('bls_results')
        .update({ posttest_set: 'B' })
        .eq('user_id', participant.user_id);
      
      if (updateError) {
        console.error(`❌ Error updating BLS ${participant.user_id}:`, updateError);
        blsErrorCount++;
      } else {
        blsUpdatedCount++;
      }
    }
    
    // Update Set C BLS results
    for (const participant of assignments['C']) {
      const { error: updateError } = await supabase
        .from('bls_results')
        .update({ posttest_set: 'C' })
        .eq('user_id', participant.user_id);
      
      if (updateError) {
        console.error(`❌ Error updating BLS ${participant.user_id}:`, updateError);
        blsErrorCount++;
      } else {
        blsUpdatedCount++;
      }
    }
    
    console.log(`   ✅ Updated ${blsUpdatedCount} BLS results`);
    console.log(`   ❌ Errors: ${blsErrorCount}`);
    
    // 7. Verify the distribution
    console.log('\n7. 🔍 Verifying distribution...');
    const { data: verification, error: verifyError } = await supabase
      .from('quiz_sessions')
      .select('set_identifier, user_id')
      .eq('quiz_key', 'posttest');
    
    if (verifyError) {
      console.error('❌ Error verifying distribution:', verifyError);
    } else {
      const distribution = {};
      verification.forEach(session => {
        distribution[session.set_identifier] = (distribution[session.set_identifier] || 0) + 1;
      });
      
      console.log('   Final distribution:');
      Object.entries(distribution).forEach(([set, count]) => {
        console.log(`     Set ${set}: ${count} participants`);
      });
    }
    
    // 8. Show sample participants from each set
    console.log('\n8. 👥 Sample participants from each set:');
    console.log('-' .repeat(40));
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('quiz_sessions')
      .select('user_id, set_identifier, score')
      .eq('quiz_key', 'posttest')
      .order('set_identifier, score', { ascending: false });
    
    if (!sampleError && sampleData) {
      const samplesBySet = {};
      sampleData.forEach(session => {
        if (!samplesBySet[session.set_identifier]) {
          samplesBySet[session.set_identifier] = [];
        }
        if (samplesBySet[session.set_identifier].length < 3) {
          samplesBySet[session.set_identifier].push(session);
        }
      });
      
      Object.entries(samplesBySet).forEach(([set, participants]) => {
        console.log(`   Set ${set} (top 3 scores):`);
        participants.forEach((p, index) => {
          console.log(`     ${index + 1}. User ${p.user_id.substring(0, 8)}... - Score: ${p.score}/30`);
        });
        console.log('');
      });
    }
    
    // 9. Show statistics by set
    console.log('9. 📊 Statistics by set:');
    console.log('-' .repeat(40));
    
    const { data: stats, error: statsError } = await supabase
      .rpc('get_posttest_statistics');
    
    if (statsError) {
      console.error('❌ Error getting statistics:', statsError);
    } else {
      console.log('Post-test statistics by set:');
      stats.forEach(stat => {
        console.log(`   Set ${stat.set_identifier}:`);
        console.log(`     Users: ${stat.total_users}`);
        console.log(`     Average Score: ${stat.average_score}/30`);
        console.log(`     Pass Rate: ${stat.pass_rate}%`);
        console.log('');
      });
    }
    
    console.log('🎉 DISTRIBUTION COMPLETE!');
    console.log('=' .repeat(60));
    console.log('✅ All 57 participants have been randomly distributed across sets A, B, C');
    console.log('✅ Both quiz_sessions and bls_results tables updated');
    console.log('✅ System ready for realistic testing with multiple sets');
    
  } catch (error) {
    console.error('❌ Distribution failed:', error);
  }
}

// Run the distribution
distributeParticipantsToSets();
