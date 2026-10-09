"use strict";

const BOOKINGS_KEY = "bookings";
const STATUS_ORDER = ["Pending", "Accepted", "Confirmed", "Completed", "Cancelled"];
const CUSTOMER_STATUSES = new Set(["Accepted", "Confirmed", "Completed"]);
const $ = (id) => document.getElementById(id);
const rows = $("clientRows");
const searchInput = $("clientSearch");
const statusFilter = $("statusFilter");
const emptyState = $("emptyState");
const message = $("message");
let allBookings = [];
let visibleClients = [];
let activeClientKey = null;

function text(value) { return value == null ? "" : String(value).trim(); }
function escapeHtml(value) { return text(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;"); }
function normalizeEmail(value) { return text(value).toLowerCase(); }
function money(value) { const n=Number(value); return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number.isFinite(n)?n:0); }
function numeric(value) { if(typeof value==="number") return Number.isFinite(value)?value:0; const n=Number(String(value??"").replace(/[₹,\s]/g,"").replace(/[^\d.-]/g,"")); return Number.isFinite(n)?n:0; }
function getClientName(b) { const c=b?.client; return text((c&&typeof c==="object"?c.name:c)||b?.clientName||b?.name)||"Unknown client"; }
function getClientEmail(b) { const c=b?.client; return normalizeEmail((c&&typeof c==="object"?c.email:"")||b?.email||b?.clientEmail); }
function getClientPhone(b) { const c=b?.client; return text((c&&typeof c==="object"?c.phone:"")||b?.phone||b?.clientPhone); }
function getService(b) { return text(b?.serviceName||b?.service||b?.serviceTitle)||"Photography service"; }
function getPackage(b) { return text(b?.packageName||b?.package)||"Package not specified"; }
function getStatus(b) { const raw=text(b?.status); const found=STATUS_ORDER.find(s=>s.toLowerCase()===raw.toLowerCase()); return found||"Pending"; }
function getDate(b) { const raw=b?.date||b?.bookingDate||b?.sessionDate||b?.createdAt||""; const d=new Date(raw); return raw&&!Number.isNaN(d.getTime())?d:null; }
function formatDate(d) { return d?new Intl.DateTimeFormat(undefined,{year:"numeric",month:"short",day:"numeric"}).format(d):"Not provided"; }
function formatDateValue(raw) { if(!raw) return "No due date"; const d=new Date(`${raw}T00:00:00`); return Number.isNaN(d.getTime())?text(raw):formatDate(d); }
function clientKey(b) { const email=getClientEmail(b); if(email)return `email:${email}`; const phone=getClientPhone(b).replace(/\D/g,""); if(phone)return `phone:${phone}`; return `name:${getClientName(b).toLowerCase()}`; }
function getBookingId(b,index=0) { return text(b?.id||b?.bookingId||`booking-${index}`); }
function getPrice(b) { return Math.max(0,numeric(b?.packagePrice??b?.totalPrice??b?.price??b?.amount??0)); }
function getPlan(b) {
  const raw=b?.paymentPlan&&typeof b.paymentPlan==="object"?b.paymentPlan:{};
  const type=["full","advance","installments"].includes(raw.type)?raw.type:"full";
  return {type, dueDate:text(raw.dueDate), advance:{type:raw.advance?.type==="percentage"?"percentage":"fixed",value:Math.max(0,numeric(raw.advance?.value)),due:text(raw.advance?.due)},balanceDue:text(raw.balanceDue),installments:Array.isArray(raw.installments)?raw.installments.map((x,i)=>({name:text(x?.name)||`Installment ${i+1}`,type:x?.type==="percentage"?"percentage":"fixed",value:Math.max(0,numeric(x?.value)),due:text(x?.due)})):[]};
}
function getStages(b) {
  const total=getPrice(b), plan=getPlan(b);
  if(plan.type==="advance") { const advance=Math.min(total,Math.max(0,plan.advance.type==="percentage"?total*plan.advance.value/100:plan.advance.value)); return [{name:"Booking advance",amount:advance,due:plan.advance.due},{name:"Remaining balance",amount:Math.max(0,total-advance),due:plan.balanceDue}]; }
  if(plan.type==="installments") return plan.installments.map(s=>({name:s.name,amount:s.type==="percentage"?total*s.value/100:s.value,due:s.due}));
  return [{name:"Full payment",amount:total,due:plan.dueDate}];
}
function getPaid(b) {
  const details=b?.paymentDetails&&typeof b.paymentDetails==="object"?b.paymentDetails:{};
  const tx=Array.isArray(details.transactions)?details.transactions:[];
  // Once a transaction ledger exists, it is the source of truth. Do not let an
  // old cached paidAmount override failed/cancelled/refunded ledger entries.
  if(tx.length) {
    const ledgerTotal=tx.reduce((sum,t)=>{
      const status=text(t?.status||t?.paymentStatus||"paid").toLowerCase();
      if(["failed","cancelled","canceled","pending","refunded"].includes(status)) return sum;
      return sum+Math.max(0,numeric(t?.amount));
    },0);
    return Math.min(getPrice(b),Math.max(0,ledgerTotal));
  }
  const direct=[details.paidAmount,details.amountPaid,details.totalPaid,details.paid,b?.amountPaid,b?.paid,b?.payment].find(v=>v!==undefined&&v!==null&&v!==""&&Number.isFinite(numeric(v)));
  return Math.min(getPrice(b),Math.max(0,direct===undefined?0:numeric(direct)));
}
function paymentSummary(b) { const total=getPrice(b),paid=getPaid(b),remaining=Math.max(0,total-paid),stages=getStages(b); let cumulative=0,overdue=0; const stageInfo=stages.map(s=>{cumulative+=Math.max(0,s.amount);const stageCovered=paid>=cumulative-.01;const dueDate=s.due&&/^\d{4}-\d{2}-\d{2}$/.test(s.due)?new Date(`${s.due}T23:59:59`):null;const isOverdue=!stageCovered&&dueDate&&!Number.isNaN(dueDate.getTime())&&dueDate.getTime()<Date.now()&&s.amount>0;if(isOverdue)overdue++;return {...s,paid:stageCovered,overdue:Boolean(isOverdue)};}); const status=total<=0?"No price":paid>=total-.01?"Paid":paid>0?"Partially Paid":"Unpaid";return {total,paid,remaining,status,overdue,stages:stageInfo}; }
function hasBecomeCustomer(b) { if(CUSTOMER_STATUSES.has(getStatus(b))||Boolean(b?.acceptedAt||b?.confirmedAt||b?.completedAt))return true;return Array.isArray(b?.statusHistory)&&b.statusHistory.some(e=>["accepted","confirmed","completed"].includes(text(e?.status||e?.newStatus).toLowerCase())); }
function readBookings() { try { const raw=localStorage.getItem(BOOKINGS_KEY); if(!raw){allBookings=[];message.textContent="No booking records are saved in this browser yet.";return;}const parsed=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error("Booking data is not an array.");allBookings=parsed.filter(b=>b&&typeof b==="object"&&!Array.isArray(b));message.textContent="";}catch(error){allBookings=[];message.textContent="Booking data could not be read. Check saved booking records before making changes.";console.warn("Unable to load client directory from bookings.",error);} }
function groupClients() {
  // Group booking records by matching email OR phone. This also connects a
  // booking with email+phone to a later booking that only contains the phone.
  // Name-only fallback is deliberately limited to records with no contact data.
  const parent=allBookings.map((_,i)=>i);
  const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
  const union=(a,b)=>{const ra=find(a),rb=find(b);if(ra!==rb)parent[rb]=ra;};
  const aliases=new Map();
  allBookings.forEach((b,i)=>{
    const email=getClientEmail(b),phone=getClientPhone(b).replace(/\D/g,"");
    const keys=[];
    if(email)keys.push(`email:${email}`);
    if(phone)keys.push(`phone:${phone}`);
    if(!email&&!phone){const name=getClientName(b).toLowerCase();if(name&&name!=="unknown client")keys.push(`name:${name}`);}
    keys.forEach(key=>{if(aliases.has(key))union(i,aliases.get(key));else aliases.set(key,i);});
  });
  const components=new Map();
  allBookings.forEach((b,i)=>{const root=find(i);if(!components.has(root))components.set(root,[]);components.get(root).push({b,i});});
  return [...components.values()].filter(items=>items.some(({b})=>hasBecomeCustomer(b))).map(items=>{
    const bookings=items.map(x=>x.b).sort((a,b)=>(getDate(b)?.getTime()||0)-(getDate(a)?.getTime()||0));
    const identityRecords=[...items].sort((a,b)=>(getDate(b.b)?.getTime()||0)-(getDate(a.b)?.getTime()||0));
    const nameRecord=identityRecords.find(x=>getClientName(x.b)!=="Unknown client");
    const emailRecord=identityRecords.find(x=>getClientEmail(x.b));
    const phoneRecord=identityRecords.find(x=>getClientPhone(x.b));
    const key=`client:${Math.min(...items.map(x=>x.i))}`;
    const c={key,name:nameRecord?getClientName(nameRecord.b):"Unknown client",email:emailRecord?getClientEmail(emailRecord.b):"",phone:phoneRecord?getClientPhone(phoneRecord.b):"",bookings};
    c.latest=bookings[0];
    c.completed=bookings.filter(b=>getStatus(b)==="Completed").length;
    c.active=bookings.some(b=>["Pending","Accepted","Confirmed"].includes(getStatus(b)));
    c.payment=bookings.filter(hasBecomeCustomer).reduce((sum,b)=>{const p=paymentSummary(b);sum.total+=p.total;sum.paid+=p.paid;sum.remaining+=p.remaining;sum.overdue+=p.overdue;return sum;},{total:0,paid:0,remaining:0,overdue:0});
    return c;
  }).sort((a,b)=>a.name.localeCompare(b.name));
}
function render() { const query=text(searchInput.value).toLowerCase(),status=statusFilter.value,clients=groupClients();visibleClients=clients.filter(c=>{const match=[c.name,c.email,c.phone,...c.bookings.map(b=>`${getService(b)} ${getPackage(b)} ${getStatus(b)}`)].join(" ").toLowerCase().includes(query);return match&&(status==="all"||c.bookings.some(b=>getStatus(b)===status));});$("totalClients").textContent=String(clients.length);$("activeClients").textContent=String(clients.filter(c=>c.active).length);$("completedSessions").textContent=String(clients.reduce((s,c)=>s+c.completed,0));$("outstandingBalance").textContent=money(clients.reduce((s,c)=>s+c.payment.remaining,0));$("overdueInstallments").textContent=String(clients.reduce((s,c)=>s+c.payment.overdue,0));$("clientCount").textContent=`${visibleClients.length} ${visibleClients.length===1?"client":"clients"}`;rows.innerHTML=visibleClients.map(c=>{const d=getDate(c.latest),st=getStatus(c.latest).toLowerCase(),contact=[c.email?`<a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a>`:"",c.phone?`<a href="tel:${escapeHtml(c.phone.replace(/[^+\d]/g,""))}">${escapeHtml(c.phone)}</a>`:""].filter(Boolean).join("")||"<span class=\"client-meta\">No contact details</span>";return `<tr><td><span class="client-name">${escapeHtml(c.name)}</span><span class="client-meta">${c.bookings.length} ${c.bookings.length===1?"booking":"bookings"}</span></td><td class="contact">${contact}</td><td>${c.bookings.length}</td><td>${escapeHtml(formatDate(d))}<span class="client-meta">${escapeHtml(getService(c.latest))}</span></td><td><span class="pill ${st}">${escapeHtml(getStatus(c.latest))}</span></td><td class="payment-due-cell"><strong>${money(c.payment.remaining)}</strong><span class="client-meta">${c.payment.overdue?`${c.payment.overdue} overdue stage(s)`:c.payment.remaining<=.01?"No balance overdue":"Outstanding balance"}</span></td><td><button type="button" class="history-button" data-client-key="${escapeHtml(c.key)}">View details</button></td></tr>`;}).join("");emptyState.hidden=visibleClients.length>0;if(visibleClients.length===0&&allBookings.length===0)emptyState.querySelector("p").textContent="No accepted customers yet. Accept a booking in Booking Management and the client will appear here automatically.";else if(visibleClients.length===0&&groupClients().length===0)emptyState.querySelector("p").textContent="No accepted customers yet. Pending requests do not create client records. Accept a booking in Booking Management and return here."; }
function planEditor(b,index) { const id=getBookingId(b,index),p=getPlan(b),price=getPrice(b);const planType=p.type;const stages=p.installments.length?p.installments:[{name:"Booking advance",type:"fixed",value:Math.round(price/2*100)/100,due:""},{name:"Final balance",type:"fixed",value:Math.round((price-price/2)*100)/100,due:""}];return `<form class="payment-box plan-form" data-booking-id="${escapeHtml(id)}"><h4>Payment plan</h4><div class="payment-form-grid"><label class="payment-field full">Plan type<select name="planType"><option value="full" ${planType==="full"?"selected":""}>Full payment</option><option value="advance" ${planType==="advance"?"selected":""}>Advance + balance</option><option value="installments" ${planType==="installments"?"selected":""}>Installments</option></select></label><div class="plan-full-fields ${planType==="full"?"":"hidden"}"><label class="payment-field">Full payment due date<input type="date" name="fullDue" value="${escapeHtml(p.dueDate)}"></label></div><div class="plan-advance-fields ${planType==="advance"?"":"hidden"}"><div class="payment-form-grid"><label class="payment-field">Advance amount (₹)<input type="number" name="advanceAmount" min="0" max="${price}" step="0.01" value="${escapeHtml(p.advance.type==="percentage"?price*p.advance.value/100:p.advance.value)}" required></label><label class="payment-field">Advance due date<input type="date" name="advanceDue" value="${escapeHtml(p.advance.due)}"></label><label class="payment-field full">Balance due date<input type="date" name="balanceDue" value="${escapeHtml(p.balanceDue)}"></label></div></div><div class="plan-installment-fields ${planType==="installments"?"":"hidden"}"><div class="installment-rows">${stages.map((s,i)=>`<div class="installment-row"><label class="payment-field">Stage name<input name="stageName" value="${escapeHtml(s.name)}" required></label><label class="payment-field">Amount (₹)<input name="stageAmount" type="number" min="0" step="0.01" value="${escapeHtml(s.type==="percentage"?price*s.value/100:s.value)}" required></label><label class="payment-field">Due date<input name="stageDue" type="date" value="${escapeHtml(/^\d{4}-\d{2}-\d{2}$/.test(s.due)?s.due:"")}"></label><button class="remove-installment" type="button" data-remove-stage aria-label="Remove installment ${i+1}">×</button></div>`).join("")}</div><button class="payment-action secondary" type="button" data-add-stage>Add installment</button></div></div><button class="payment-action" type="submit">Save payment plan</button><p class="payment-feedback" data-form-feedback aria-live="polite"></p><p class="payment-note">Plan amounts must equal the booking total. Due dates are optional, but overdue indicators require a specific date.</p></form>`;}
function recordPaymentForm(b,index) { return `<form class="payment-box record-form" data-booking-id="${escapeHtml(getBookingId(b,index))}"><h4>Record a received payment</h4><div class="payment-form-grid"><label class="payment-field">Amount received (₹)<input type="number" name="amount" min="0.01" max="${getPrice(b)}" step="0.01" required></label><label class="payment-field">Received date<input type="date" name="paidDate" value="${new Date().toISOString().slice(0,10)}" required></label><label class="payment-field">Method<select name="method"><option>Cash</option><option>Bank transfer</option><option>UPI</option><option>Card</option><option>Cheque</option><option>Other</option></select></label><label class="payment-field">Reference / receipt<input name="reference" maxlength="120" placeholder="Optional reference"></label></div><button class="payment-action" type="submit">Record payment</button><p class="payment-feedback" data-form-feedback aria-live="polite"></p><p class="payment-note">This records a payment the studio says it has received. It does not verify an online transaction with a payment gateway.</p></form>`;}
function paymentDetailsMarkup(b, index) {
  const p = paymentSummary(b);
  const stages = p.stages;
  const details = b.paymentDetails && typeof b.paymentDetails === "object" ? b.paymentDetails : {};
  const tx = Array.isArray(details.transactions) ? details.transactions : [];
  let cumulative = 0;

  const stageHtml = stages.map((s) => {
    cumulative += s.amount;
    const paid = p.paid >= cumulative - 0.01;
    const overdue =
      !paid &&
      s.due &&
      /^\d{4}-\d{2}-\d{2}$/.test(s.due) &&
      new Date(`${s.due}T23:59:59`).getTime() < Date.now() &&
      s.amount > 0;

    return `
      <div class="plan-stage">
        <div>
          <strong>${escapeHtml(s.name)}</strong>
          <small>${escapeHtml(formatDateValue(s.due))}</small>
        </div>
        <div class="${paid ? "stage-paid" : overdue ? "stage-overdue" : "stage-pending"}">
          ${money(s.amount)} · ${paid ? "Paid" : overdue ? "Overdue" : "Pending"}
        </div>
      </div>
    `;
  }).join("");

  const ledger = tx.length
    ? `<div class="table-wrap"><table class="payment-ledger"><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>Status</th></tr></thead><tbody>${tx.map((t) => `
        <tr>
          <td>${escapeHtml(formatDate(t.paidAt || t.date))}</td>
          <td>${money(t.amount)}</td>
          <td>${escapeHtml(t.method || "Not specified")}</td>
          <td>${escapeHtml(t.reference || "Not provided")}</td>
          <td>${escapeHtml(text(t.status || "paid"))}</td>
        </tr>
      `).join("")}</tbody></table></div>`
    : '<p class="payment-note">No payments have been recorded for this booking.</p>';

  return `
    <div class="history-payment">
      <h4>Payment overview
        <span class="payment-status ${p.status === "Paid" ? "paid" : p.overdue ? "overdue" : p.paid > 0 ? "partial" : ""}">${escapeHtml(p.overdue ? "Overdue" : p.status)}</span>
      </h4>
      <div class="payment-summary-grid">
        <div class="payment-metric"><span>Booking total</span><strong>${money(p.total)}</strong></div>
        <div class="payment-metric"><span>Received</span><strong>${money(p.paid)}</strong></div>
        <div class="payment-metric"><span>Balance</span><strong>${money(p.remaining)}</strong></div>
        <div class="payment-metric"><span>Overdue stages</span><strong>${p.overdue}</strong></div>
      </div>
      <h4>Scheduled payments</h4>
      ${stageHtml}
      <h4 style="margin-top:16px">Payment history</h4>
      ${ledger}
      <div class="payment-controls">
        ${planEditor(b, index)}
        ${recordPaymentForm(b, index)}
      </div>
    </div>
  `;
}
function openHistory(key) { const c=groupClients().find(x=>x.key===key);if(!c)return;activeClientKey=key;$("historyTitle").textContent=`${c.name} · Booking & payment history`;$("historyContent").innerHTML=c.bookings.map(b=>{const idx=allBookings.indexOf(b),st=getStatus(b);return `<article class="history-item" data-booking-card="${escapeHtml(getBookingId(b,idx))}"><div class="history-item-main"><div><h3>${escapeHtml(getService(b))} · ${escapeHtml(getPackage(b))}</h3><p>Date: ${escapeHtml(formatDate(getDate(b)))}</p><p>Booking ID: ${escapeHtml(getBookingId(b,idx))}</p><p>Booking amount: ${money(getPrice(b))}</p></div><span class="pill ${st.toLowerCase()}">${escapeHtml(st)}</span></div>${hasBecomeCustomer(b)?paymentDetailsMarkup(b,idx):`<div class="history-payment"><p class="payment-note">Payment management becomes available after this booking is accepted. Pending requests do not count toward the client's outstanding balance.</p></div>`}</article>`;}).join("");$("historyPanel").hidden=false;$("historyPanel").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"}); }
function persistBookings() { try { localStorage.setItem(BOOKINGS_KEY,JSON.stringify(allBookings));return true; } catch(e) { console.error("Could not save booking payment data",e);return false; } }
function feedback(form,msg,success=false) { const el=form.querySelector("[data-form-feedback]");if(el){el.textContent=msg;el.classList.toggle("success",success);} }
function findBooking(id) { return allBookings.find((b,i)=>getBookingId(b,i)===String(id)); }
function savePlan(form) { const id=form.dataset.bookingId,b=findBooking(id);if(!b){feedback(form,"Booking not found. Refresh this page and try again.");return;}const data=new FormData(form),type=text(data.get("planType")),total=getPrice(b);let plan;
  if(type==="full") { plan={type:"full",dueDate:text(data.get("fullDue")),advance:{type:"fixed",value:0},installments:[]}; }
  else if(type==="advance") { const advance=numeric(data.get("advanceAmount"));if(total<=0||advance<=0||advance>=total){feedback(form,"For an advance + balance plan, the advance must be greater than ₹0 and less than the booking total.");return;}plan={type:"advance",advance:{type:"fixed",value:advance,due:text(data.get("advanceDue"))},balanceDue:text(data.get("balanceDue")),installments:[]}; }
  else if(type==="installments") { const names=data.getAll("stageName"),amounts=data.getAll("stageAmount"),dues=data.getAll("stageDue");const stages=names.map((name,i)=>({name:text(name)||`Installment ${i+1}`,type:"fixed",value:numeric(amounts[i]),due:text(dues[i])}));if(stages.length<2){feedback(form,"Add at least two installments, or choose another plan type.");return;}if(stages.some(s=>s.value<=0)){feedback(form,"Every installment amount must be greater than zero.");return;}const sum=stages.reduce((s,x)=>s+x.value,0);if(Math.abs(sum-total)>.01){feedback(form,`Installments total ${money(sum)}, but the booking total is ${money(total)}. Adjust the amounts so they match.`);return;}plan={type:"installments",advance:{type:"fixed",value:0},installments:stages}; }
  else {feedback(form,"Choose a valid payment plan.");return;}
  const old=JSON.stringify(b.paymentPlan||null);b.paymentPlan=plan;b.updatedAt=new Date().toISOString();if(!persistBookings()){if(old==="null")delete b.paymentPlan;else b.paymentPlan=JSON.parse(old);feedback(form,"Could not save the plan to this browser. No changes were kept.");return;}readBookings();render();if(activeClientKey)openHistory(activeClientKey);message.textContent="Payment plan saved. Booking Management will read the same booking record."; }
function recordPayment(form) { const b=findBooking(form.dataset.bookingId);if(!b){feedback(form,"Booking not found. Refresh this page and try again.");return;}const data=new FormData(form),amount=numeric(data.get("amount")),p=paymentSummary(b);if(!Number.isFinite(amount)||amount<=0){feedback(form,"Enter a payment amount greater than zero.");return;}if(amount>p.remaining+.01){feedback(form,`Payment exceeds the outstanding balance of ${money(p.remaining)}.`);return;}const details=b.paymentDetails&&typeof b.paymentDetails==="object"?JSON.parse(JSON.stringify(b.paymentDetails)):{},transactions=Array.isArray(details.transactions)?details.transactions:[];const old={paymentDetails:b.paymentDetails,amountPaid:b.amountPaid,paid:b.paid,remainingAmount:b.remainingAmount,remaining:b.remaining,paymentStatus:b.paymentStatus,updatedAt:b.updatedAt};const now=new Date().toISOString();transactions.push({id:`pay-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,amount,method:text(data.get("method"))||"Other",reference:text(data.get("reference")),paidAt:text(data.get("paidDate"))?new Date(`${data.get("paidDate")}T12:00:00`).toISOString():now,status:"paid",recordedAt:now,source:"manual-studio-record"});details.transactions=transactions;details.paidAmount=p.paid+amount;details.amountPaid=details.paidAmount;b.paymentDetails=details;b.amountPaid=details.paidAmount;b.paid=b.amountPaid;b.remainingAmount=Math.max(0,getPrice(b)-b.amountPaid);b.remaining=b.remainingAmount;b.paymentStatus=b.remainingAmount<=.01?"Paid":b.amountPaid>0?"Partially Paid":"Unpaid";b.updatedAt=now;if(!persistBookings()){Object.assign(b,old);feedback(form,"Could not save this payment. No changes were kept.");return;}readBookings();render();if(activeClientKey)openHistory(activeClientKey);message.textContent=`Recorded ${money(amount)} as received for this booking.`; }
function togglePlanFields(form) { const type=form.querySelector('[name="planType"]')?.value;form.querySelector(".plan-full-fields")?.classList.toggle("hidden",type!=="full");form.querySelector(".plan-advance-fields")?.classList.toggle("hidden",type!=="advance");form.querySelector(".plan-installment-fields")?.classList.toggle("hidden",type!=="installments"); }
searchInput.addEventListener("input",render);statusFilter.addEventListener("change",render);rows.addEventListener("click",e=>{const button=e.target.closest("[data-client-key]");if(button)openHistory(button.dataset.clientKey);});$("closeHistory").addEventListener("click",()=>{$("historyPanel").hidden=true;});$("historyContent").addEventListener("change",e=>{if(e.target.matches('[name="planType"]'))togglePlanFields(e.target.closest("form"));});$("historyContent").addEventListener("click",e=>{const add=e.target.closest("[data-add-stage]");if(add){const form=add.closest("form"),rows=form.querySelector(".installment-rows"),count=rows.querySelectorAll(".installment-row").length;if(count>=12){feedback(form,"A payment plan can contain at most 12 installments.");return;}const row=document.createElement("div");row.className="installment-row";row.innerHTML='<label class="payment-field">Stage name<input name="stageName" value="Installment '+(count+1)+'" required></label><label class="payment-field">Amount (₹)<input name="stageAmount" type="number" min="0" step="0.01" value="0.00" required></label><label class="payment-field">Due date<input name="stageDue" type="date"></label><button class="remove-installment" type="button" data-remove-stage aria-label="Remove installment">×</button>';rows.append(row);}const remove=e.target.closest("[data-remove-stage]");if(remove){const form=remove.closest("form"),rows=form.querySelector(".installment-rows");if(rows.querySelectorAll(".installment-row").length<=2){feedback(form,"Keep at least two installment rows, or choose another plan type.");return;}remove.closest(".installment-row").remove();}});$("historyContent").addEventListener("submit",e=>{const form=e.target;if(form.matches(".plan-form")){e.preventDefault();savePlan(form);}else if(form.matches(".record-form")){e.preventDefault();recordPayment(form);}});window.addEventListener("storage",e=>{if(e.key===BOOKINGS_KEY||e.key===null){readBookings();render();if(activeClientKey&&!$("historyPanel").hidden)openHistory(activeClientKey);}});window.addEventListener("pageshow",()=>{readBookings();render();});readBookings();render();
