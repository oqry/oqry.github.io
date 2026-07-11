/* ============================================================
   Society of Inquiry
   Established circa 1847
   db.js — database functions
   ============================================================ */

// ── Edge Function URLs ────────────────────────────────────────
const FUNCTIONS_URL = 'https://akcdprwiqqkuvedrabjt.supabase.co/functions/v1';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrY2RwcndpcXFrdXZlZHJhYmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MjE0ODgsImV4cCI6MjA5ODA5NzQ4OH0.gC8fiats4RHcUfugqhJzXUpk1eRe_hCzmgaSdoMKnyc';
async function callEdgeFunction(name, body) {
  try {
    const { data, error } = await supabaseClient.functions.invoke(name, {
      body
    });
    if (error) {
      console.error(`${name} error:`, error);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`${name} exception:`, err);
    return null;
  }
}
// ── Edge Function Calls ───────────────────────────────────────

async function generateAssignment(investigatorId, targetRecordId, lexicon, completedRecordsCount, targetMinutes, alias) {
  try {
    // First create the assignment row to get an ID
    const { data, error } = await supabaseClient
      .from('puzzle_assignments')
      .insert({
        investigator_id: investigatorId,
        target_record_id: targetRecordId,
        difficulty_tier: completedRecordsCount <= 2 ? 'Apprentice' : completedRecordsCount <= 5 ? 'Novice' : 'Journeyman',
        status: 'active'
      })
      .select('id')
      .single();
    if (error) { console.error('generateAssignment insert:', error); return null; }

    // Then call the Edge Function with the assignment ID
    return await callEdgeFunction('generate-assignment', {
      investigator_id: investigatorId,
      target_record_id: targetRecordId,
      assignment_id: data.id,
      lexicon,
      completed_records_count: completedRecordsCount,
      target_minutes: targetMinutes,
      alias
    });
  } catch (err) {
    console.error('generateAssignment exception:', err);
    return null;
  }
}

async function verifyAnswer(stepId, answer) {
  try {
    return await callEdgeFunction('verify-answer', {
      step_id: stepId,
      answer
    });
  } catch (err) {
    console.error('verifyAnswer exception:', err);
    return null;
  }
}

async function revealLocation(assignmentId, format) {
  try {
    return await callEdgeFunction('reveal-location', {
      assignment_id: assignmentId,
      format
    });
  } catch (err) {
    console.error('revealLocation exception:', err);
    return null;
  }
}

async function verifyProximity(investigatorId, recordId, lat, lng) {
  try {
    return await callEdgeFunction('verify-proximity', {
      investigator_id: investigatorId,
      record_id: recordId,
      lat,
      lng
    });
  } catch (err) {
    console.error('verifyProximity exception:', err);
    return null;
  }
}

// ── Supabase Table Functions ──────────────────────────────────

async function saveInvestigatorToCloud({ alias, recovery_phrase_hash, investigator_number }) {
  try {
    const { data, error } = await supabaseClient
      .from('investigators')
      .insert({ alias, recovery_phrase_hash, investigator_number })
      .select('id, alias, investigator_number')
      .single();
    if (error) { console.error('saveInvestigatorToCloud:', error); return null; }
    return data;
  } catch (err) {
    console.error('saveInvestigatorToCloud exception:', err);
    return null;
  }
}

async function recoverLedger(alias, phrase) {
  try {
    return await callEdgeFunction('recover-ledger', { alias, phrase });
  } catch (err) {
    console.error('recoverLedger exception:', err);
    return null;
  }
}


async function checkAliasAvailable(alias) {
  try {
    const { data, error } = await supabaseClient
      .from('investigators')
      .select('id')
      .eq('alias', alias)
      .limit(1);
    if (error) { console.error('checkAliasAvailable:', error); return true; }
    return !data || data.length === 0;
  } catch (err) {
    console.error('checkAliasAvailable exception:', err);
    return true;
  }
}

async function saveCompletedRecord(investigatorId, recordId) {
  try {
    const { error } = await supabaseClient
      .from('completed_records')
      .insert({ investigator_id: investigatorId, record_id: recordId });
    if (error) { console.error('saveCompletedRecord:', error); return false; }
    return true;
  } catch (err) {
    console.error('saveCompletedRecord exception:', err);
    return false;
  }
}

async function saveLexiconEntry(investigatorId, word, recordId) {
  try {
    const { error } = await supabaseClient
      .from('lexicon_entries')
      .insert({ investigator_id: investigatorId, word, record_id: recordId });
    if (error) { console.error('saveLexiconEntry:', error); return false; }
    return true;
  } catch (err) {
    console.error('saveLexiconEntry exception:', err);
    return false;
  }
}

async function loadInvestigatorData(investigatorId) {
  try {
    const [recordsResult, lexiconResult] = await Promise.all([
      supabaseClient
        .from('completed_records')
        .select('record_id')
        .eq('investigator_id', investigatorId),
      supabaseClient
        .from('lexicon_entries')
        .select('word')
        .eq('investigator_id', investigatorId)
    ]);
    return {
      completedRecords: recordsResult.data ? recordsResult.data.map(r => r.record_id) : [],
      lexicon: lexiconResult.data ? lexiconResult.data.map(r => r.word) : []
    };
  } catch (err) {
    console.error('loadInvestigatorData exception:', err);
    return { completedRecords: [], lexicon: [] };
  }
}
