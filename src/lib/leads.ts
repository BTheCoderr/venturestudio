export type LeadStatus='New'|'Contacted'|'Qualified'|'Booked'|'Closed';
export type Lead={id:string;name:string;email:string;service:string;status:LeadStatus;note:string;createdAt:string;appointmentAt?:string};
export function draftReply(lead:Lead,businessName:string):string {
 const business=businessName.trim()||'our team';
 return `Hi ${lead.name}, thanks for contacting ${business} about ${lead.service}. Could you share a little more about what you need and the best time for a quick call? We'd be happy to help.`;
}
function csvCell(value:string){return '"'+value.replace(/"/g,'""')+'"'}
export function leadsToCsv(leads:Lead[]):string {
 const columns=['name','email','service','status','note','appointmentAt','createdAt'] as const;
 return [columns.join(','),...leads.map(l=>columns.map(c=>csvCell(l[c]??'')).join(','))].join('\r\n');
}
