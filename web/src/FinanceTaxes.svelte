<script lang="ts">
  import { formatCharacterMoney, getAnnualTaxEstimate } from './lib/simulation';
  import type { Character } from './lib/types';
  let { character }: { character: Character } = $props();
  const estimate = $derived(getAnnualTaxEstimate(character));
</script>

<section class="tax-workspace">
  <header><small>TAX AUTHORITY</small><h2>Taxes</h2><p>Annual tax is assessed when the simulation advances a year. Payments use available cash, then eligible liquid bank accounts.</p></header>
  <div class="tax-balance"><div><small>OUTSTANDING TAX</small><strong>{formatCharacterMoney(character,character.taxBalance ?? 0)}</strong></div><div><small>LAST YEAR ASSESSED</small><strong>{formatCharacterMoney(character,character.lastYearTax ?? 0)}</strong></div></div>
  <section class="tax-breakdown">
    <h3>Current annual estimate</h3>
    <div><span>Income tax</span><strong>{formatCharacterMoney(character,estimate.incomeTax)}</strong></div>
    <div><span>Rental & business income tax</span><strong>{formatCharacterMoney(character,estimate.assetIncomeTax)}</strong></div>
    <div><span>Property levy</span><strong>{formatCharacterMoney(character,estimate.propertyTax)}</strong></div>
    <div class="tax-total"><span>Estimated total</span><strong>{formatCharacterMoney(character,estimate.total)}</strong></div>
  </section>
  <p class="tax-note">These are simplified fictional game rules, not jurisdiction-specific tax calculations. Fixed deposits remain locked; any unpaid tax carries forward as a liability.</p>
</section>

<style>
.tax-workspace{display:grid;gap:10px}.tax-workspace>header,.tax-breakdown,.tax-balance>div{padding:12px;border:1px solid var(--line);border-radius:13px;background:var(--surface)}.tax-workspace header small,.tax-balance small{font-size:9px;letter-spacing:.08em;color:var(--muted)}.tax-workspace h2{margin:4px 0;font-size:18px}.tax-workspace header p,.tax-note{margin:4px 0 0;color:var(--muted);font-size:11px;line-height:1.5}.tax-balance{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.tax-balance strong{display:block;margin-top:6px;font-size:clamp(18px,4vw,24px);overflow-wrap:anywhere}.tax-breakdown h3{margin:0 0 10px;font-size:13px}.tax-breakdown>div{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid var(--line);font-size:11px}.tax-breakdown .tax-total{font-weight:750;color:var(--accent)}@media(max-width:360px){.tax-balance{grid-template-columns:1fr}}
</style>
