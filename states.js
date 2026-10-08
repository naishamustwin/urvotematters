/*
 * URVoteMatters state data
 * ------------------------------------------------------------------
 * `office` = the official state election office website, as listed in
 * USA.gov's "State election office websites" directory
 * (https://www.usa.gov/state-election-office), retrieved 2026-10-08.
 *
 * Nothing here is invented. If a state changes its website, update
 * the URL from USA.gov or the state's own site. Keep `reviewed` current.
 */
window.URVM_STATES_REVIEWED = "2026-10-08";

window.URVM_STATES = [
  { code: "AL", name: "Alabama", office: "https://www.sos.alabama.gov/alabama-votes" },
  { code: "AK", name: "Alaska", office: "https://www.elections.alaska.gov/" },
  { code: "AZ", name: "Arizona", office: "https://azsos.gov/elections" },
  { code: "AR", name: "Arkansas", office: "https://www.sos.arkansas.gov/elections" },
  { code: "CA", name: "California", office: "https://www.sos.ca.gov/elections" },
  { code: "CO", name: "Colorado", office: "https://www.sos.state.co.us/pubs/elections/main.html" },
  { code: "CT", name: "Connecticut", office: "https://portal.ct.gov/sots/common-elements/v5-template---redesign/elections--voting--home-page" },
  { code: "DE", name: "Delaware", office: "https://elections.delaware.gov/index.shtml" },
  { code: "DC", name: "District of Columbia", office: "https://dcboe.org/" },
  { code: "FL", name: "Florida", office: "https://www.dos.myflorida.com/elections/" },
  { code: "GA", name: "Georgia", office: "https://sos.ga.gov/elections-division-georgia-secretary-states-office" },
  { code: "HI", name: "Hawaii", office: "https://elections.hawaii.gov/" },
  { code: "ID", name: "Idaho", office: "https://voteidaho.gov/" },
  { code: "IL", name: "Illinois", office: "https://www.elections.il.gov/" },
  { code: "IN", name: "Indiana", office: "https://indianavoters.in.gov/" },
  { code: "IA", name: "Iowa", office: "https://sos.iowa.gov/elections/voterinformation/index.html" },
  { code: "KS", name: "Kansas", office: "https://sos.ks.gov/elections/elections.html" },
  { code: "KY", name: "Kentucky", office: "https://elect.ky.gov/Pages/default.aspx" },
  { code: "LA", name: "Louisiana", office: "https://www.sos.la.gov/ElectionsAndVoting/Pages/default.aspx" },
  { code: "ME", name: "Maine", office: "https://www.maine.gov/sos/cec/elec/index.html" },
  { code: "MD", name: "Maryland", office: "https://elections.maryland.gov/" },
  { code: "MA", name: "Massachusetts", office: "https://www.sec.state.ma.us/divisions/elections/elections-and-voting.htm" },
  { code: "MI", name: "Michigan", office: "https://www.michigan.gov/sos/elections" },
  { code: "MN", name: "Minnesota", office: "https://www.sos.state.mn.us/elections-voting/" },
  { code: "MS", name: "Mississippi", office: "https://www.sos.ms.gov/elections-voting" },
  { code: "MO", name: "Missouri", office: "https://www.sos.mo.gov/elections/" },
  { code: "MT", name: "Montana", office: "https://sosmt.gov/elections/" },
  { code: "NE", name: "Nebraska", office: "https://www.nebraska.gov/featured/elections-voting/" },
  { code: "NV", name: "Nevada", office: "https://www.nvsos.gov/sos/elections" },
  { code: "NH", name: "New Hampshire", office: "https://www.sos.nh.gov/elections/voters" },
  { code: "NJ", name: "New Jersey", office: "https://www.nj.gov/state/elections/vote.shtml" },
  { code: "NM", name: "New Mexico", office: "https://www.sos.nm.gov/voting-and-elections/voter-information-portal-nmvote-org/" },
  { code: "NY", name: "New York", office: "https://www.elections.ny.gov/" },
  { code: "NC", name: "North Carolina", office: "https://www.ncsbe.gov/" },
  { code: "ND", name: "North Dakota", office: "https://vip.sos.nd.gov/PortalList.aspx" },
  { code: "OH", name: "Ohio", office: "https://www.sos.state.oh.us/elections/voters/" },
  { code: "OK", name: "Oklahoma", office: "https://oklahoma.gov/elections.html" },
  { code: "OR", name: "Oregon", office: "https://sos.oregon.gov/voting-elections/Pages/default.aspx" },
  { code: "PA", name: "Pennsylvania", office: "https://www.dos.pa.gov/VotingElections/Pages/default.aspx" },
  { code: "RI", name: "Rhode Island", office: "https://vote.sos.ri.gov/" },
  { code: "SC", name: "South Carolina", office: "https://www.scvotes.org/" },
  { code: "SD", name: "South Dakota", office: "https://sdsos.gov/elections-voting/default.aspx" },
  { code: "TN", name: "Tennessee", office: "https://sos.tn.gov/elections" },
  { code: "TX", name: "Texas", office: "https://www.sos.state.tx.us/elections/index.shtml" },
  { code: "UT", name: "Utah", office: "https://vote.utah.gov/" },
  { code: "VT", name: "Vermont", office: "https://sos.vermont.gov/elections/" },
  { code: "VA", name: "Virginia", office: "https://www.elections.virginia.gov/" },
  { code: "WA", name: "Washington", office: "https://www.sos.wa.gov/elections" },
  { code: "WV", name: "West Virginia", office: "https://sos.wv.gov/elections/pages/default.aspx" },
  { code: "WI", name: "Wisconsin", office: "https://myvote.wi.gov/en-us/" },
  { code: "WY", name: "Wyoming", office: "https://sos.wyo.gov/Elections/Default.aspx" }
];

/*
 * National resources used for every state. Each NASS "Can I Vote" page
 * lets the visitor choose their state and then sends them to that
 * state's official tool.
 */
window.URVM_RESOURCES = {
  ballotpedia: "https://ballotpedia.org/Sample_Ballot_Lookup",
  nassDirectory: "https://www.nass.org/memberships/secretaries-statelieutenant-governors",
  eacPollWorker: "https://www.eac.gov/help-america-vote",
  eacStates: "https://www.eac.gov/voters/register-and-vote-in-your-state",
  voteGov: "https://vote.gov/",
  nassRegStatus: "https://www.nass.org/can-i-vote/voter-registration-status",
  nassRegister: "https://www.nass.org/can-i-vote/voter-registration",
  nassPolling: "https://www.nass.org/can-i-vote/find-your-polling-place",
  nassId: "https://www.nass.org/can-i-vote/valid-forms-id",
  nassEarly: "https://www.nass.org/can-i-vote/absentee-early-voting",
  nassPollWorker: "https://www.nass.org/can-i-vote/become-a-poll-worker",
  localOffices: "https://www.usvotefoundation.org/election-offices",
  overseas: "https://www.fvap.gov/",
  usaGovOffices: "https://www.usa.gov/state-election-office"
};
