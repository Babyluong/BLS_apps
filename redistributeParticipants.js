// redistributeParticipants.js
// Redistribute 57 participants to: Set A (24), Set B (15), Set C (18)

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function redistributeParticipants() {
  try {
    console.log('🔄 Redistributing participants to: Set A (24), Set B (15), Set C (18)\n');
    console.log('=' .repeat(60));
    
    // 1. Get all participants
    console.log('1. 📊 Getting all participants...');
    const { data: allParticipants, error: fetchError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, quiz_key, set_identifier, score, total_questions')
      .eq('quiz_key', 'posttest')
      .order('started_at', { ascending: true });
    
    if (fetchError) {
      console.error('❌ Error fetching participants:', fetchError);
      return;
    }
    
    console.log(`   📋 Found ${allParticipants.length} participants`);
    
    // 2. Create new distribution plan
    console.log('\n2. 🎯 Creating new distribution plan...');
    const targetDistribution = {
      'A': 24,
      'B': 15, 
      'C': 18
    };
    
    const total = targetDistribution.A + targetDistribution.B + targetDistribution.C;
    console.log(`   Set A: ${targetDistribution.A} participants`);
    console.log(`   Set B: ${targetDistribution.B} participants`);
    console.log(`   Set C: ${targetDistribution.C} participants`);
    console.log(`   Total: ${total} participants`);
    
    if (total !== allParticipants.length) {
      console.log(`   ⚠️  Warning: Total (${total}) doesn't match participants (${allParticipants.length})`);
    }
    
    // 3. Randomly shuffle participants
    console.log('\n3. 🔀 Randomizing participant order...');
    const shuffledParticipants = [...allParticipants];
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
    
    // Assign Set A (24 participants)
    for (let i = 0; i < targetDistribution.A; i++) {
      assignments['A'].push(shuffledParticipants[currentIndex]);
      currentIndex++;
    }
    
    // Assign Set B (15 participants)
    for (let i = 0; i < targetDistribution.B; i++) {
      assignments['B'].push(shuffledParticipants[currentIndex]);
      currentIndex++;
    }
    
    // Assign Set C (18 participants)
    for (let i = 0; i < targetDistribution.C; i++) {
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
    
    // Update all participants to their new sets
    for (const [set, participants] of Object.entries(assignments)) {
      for (const participant of participants) {
        const { error: updateError } = await supabase
          .from('quiz_sessions')
          .update({ set_identifier: set })
          .eq('id', participant.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${participant.id}:`, updateError);
          errorCount++;
        } else {
          updatedCount++;
        }
      }
    }
    
    console.log(`   ✅ Updated ${updatedCount} quiz sessions`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    // 6. Update bls_results table
    console.log('\n6. 🏥 Updating bls_results table...');
    
    let blsUpdatedCount = 0;
    let blsErrorCount = 0;
    
    // Update BLS results for all participants
    for (const [set, participants] of Object.entries(assignments)) {
      for (const participant of participants) {
        const { error: updateError } = await supabase
          .from('bls_results')
          .update({ posttest_set: set })
          .eq('user_id', participant.user_id);
        
        if (updateError) {
          console.error(`❌ Error updating BLS ${participant.user_id}:`, updateError);
          blsErrorCount++;
        } else {
          blsUpdatedCount++;
        }
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
        if (samplesBySet[session.set_identifier].length < 5) {
          samplesBySet[session.set_identifier].push(session);
        }
      });
      
      Object.entries(samplesBySet).forEach(([set, participants]) => {
        console.log(`   Set ${set} (top 5 scores):`);
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
    
    // 10. Show distribution summary
    console.log('10. 📈 Distribution Summary:');
    console.log('-' .repeat(40));
    
    const { data: summary, error: summaryError } = await supabase
      .from('posttest_sets_summary')
      .select('*');
    
    if (!summaryError && summary) {
      console.log('Post-test sets summary:');
      summary.forEach(set => {
        console.log(`   Set ${set.set_identifier}:`);
        console.log(`     Total Users: ${set.total_users}`);
        console.log(`     Average Score: ${set.average_score}/30`);
        console.log(`     Pass Rate: ${set.pass_rate}%`);
        console.log(`     First Assessment: ${new Date(set.first_assessment).toLocaleDateString()}`);
        console.log(`     Latest Assessment: ${new Date(set.latest_assessment).toLocaleDateString()}`);
        console.log('');
      });
    }
    
    console.log('🎉 REDISTRIBUTION COMPLETE!');
    console.log('=' .repeat(60));
    console.log('✅ Participants redistributed to: Set A (24), Set B (15), Set C (18)');
    console.log('✅ Both quiz_sessions and bls_results tables updated');
    console.log('✅ System ready with your specified distribution');
    
  } catch (error) {
    console.error('❌ Redistribution failed:', error);
  }
}

// Run the redistribution
redistributeParticipants();
