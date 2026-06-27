/* ============================================================
   Society of Inquiry
   Established circa 1847
   db.js — database functions
   ============================================================ */

async function saveInvestigatorToCloud({ alias, recovery_phrase, investigator_number }) {
  try {
    const { data, error } = await supabaseClient
      .from('investigators')
      .insert({ alias, recovery_phrase, investigator_number })
      .select()
      .single();
    if (error) { console.error('saveInvestigatorToCloud:', error); return null; }
    return data;
  } catch (err) {
    console.error('saveInvestigatorToCloud exception:', err);
    return null;
  }
}

async function loadInvestigatorByPhrase(recoveryPhrase) {
  try {
    const { data, error } = await supabaseClient
      .from('investigators')
      .select('*')
      .eq('recovery_phrase', recoveryPhrase)
      .single();
    if (error) { console.error('loadInvestigatorByPhrase:', error); return null; }
    return data;
  } catch (err) {
    console.error('loadInvestigatorByPhrase exception:', err);
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